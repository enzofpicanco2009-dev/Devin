"""M09 — Motor de decisão / roteiro visual.

Modos (projeto.decisao.provedor):
- "ollama": a IA local lê a transcrição inteira e redefine as cenas por IDEIA, escolhendo template
  e escrevendo o que aparece na tela. As fronteiras são encaixadas nas palavras do Whisper.
- "nenhum" (ou Ollama indisponível / resposta inválida): regras sobre as cenas do M04.
- template_fixo definido e provedor "nenhum": modo fixo (texto da fala na tela — só para depuração).

Enquanto trabalha, grava `cache/roteiro_ao_vivo.json` para a interface mostrar o roteiro nascendo.
"""
from __future__ import annotations

import json

from . import llm, roteiro
from .comum import CATALOGO, Caminhos, carregar_projeto, carregar_timeline, salvar_timeline
from .imagens import listar_imagens
from .schemas.timeline import Cena, Decisao, Timeline

ETAPA = "m09"
TEMPLATE_PREENCHIMENTO = "TituloImpacto"
MAX_REPETICOES = 2
DURACAO_MAX_CENA_S = 10.0


def carregar_catalogo() -> dict:
    return json.loads((CATALOGO / "templates.json").read_text(encoding="utf-8"))


def decidir_fixo(cena: Cena, template: str) -> Decisao:
    if cena.preenchimento:
        return Decisao(template=TEMPLATE_PREENCHIMENTO, props_semanticas={}, origem="regra",
                       justificativa="silêncio longo — tela de fundo")
    return Decisao(template=template, props_semanticas={"enfase": "media"}, origem="fixo")


# ---------------------------------------------------------------- ao vivo

def _ao_vivo(c: Caminhos, estado: dict) -> None:
    c.cache.mkdir(parents=True, exist_ok=True)
    (c.cache / "roteiro_ao_vivo.json").write_text(json.dumps(estado, ensure_ascii=False, indent=2), encoding="utf-8")


def _resumo_tela(r: roteiro.CenaRoteiro) -> str:
    d = r.dados
    if r.template == "NumeroDestaque":
        return f"{d['valor']} — {d.get('rotulo', '')}"
    if r.template == "ComparacaoDoisLados":
        return f"{d['a']['rotulo']} {d['a']['valor']} vs {d['b']['rotulo']} {d['b']['valor']}"
    if r.template == "GraficoBarras":
        return ", ".join(f"{b['rotulo']}: {b['valor']}{d.get('unidade', '')}" for b in d["barras"])
    if r.template == "SetaTendencia":
        return f"{'↑' if d['direcao'] == 'sobe' else '↓'} {d.get('valor', '')} {d.get('texto', '')}".strip()
    if r.template == "ListaAnimada":
        return f"{d.get('titulo', '')}: " + " · ".join(d["itens"])
    if r.template == "ImagemDestaque":
        return f"[imagem {d['imagem']}] {d.get('texto', '')}"
    return str(d.get("texto", ""))


# ---------------------------------------------------------------- reconstrução de cenas (modo LLM)

def _reconstruir(t: Timeline, rot: list[roteiro.CenaRoteiro], imagens: list[dict]) -> list[Cena]:
    """Funde as cenas do M04 conforme os grupos de trechos escolhidos pela IA.

    Trechos não citados pela IA (e cenas de preenchimento) são absorvidos pela cena anterior
    (ou pela seguinte, no início). Os tempos vêm sempre do Whisper, nunca da IA.
    """
    falados = roteiro.segmentos_falados(t.cenas)
    dono: dict[int, int] = {}  # índice do trecho (1-based) -> índice da cena do roteiro
    for k, r in enumerate(rot):
        for s in r.segmentos:
            dono.setdefault(s, k)
    for s in range(1, len(falados) + 1):
        if s not in dono:
            dono[s] = dono[s - 1] if s > 1 else min(dono.values())

    # cada cena do M04 -> cena do roteiro (preenchimento segue a anterior)
    indice_falado = {id(c): i + 1 for i, c in enumerate(falados)}
    grupos: list[tuple[int, list[Cena]]] = []
    for c in t.cenas:
        k = dono[indice_falado[id(c)]] if id(c) in indice_falado else (grupos[-1][0] if grupos else min(dono.values()))
        if grupos and grupos[-1][0] == k:
            grupos[-1][1].append(c)
        else:
            grupos.append((k, [c]))

    # grupos longos demais são partidos: o início fica com a decisão da IA, o resto vai para as regras
    partes: list[tuple[roteiro.CenaRoteiro | None, list[Cena]]] = []
    for k, membros in grupos:
        atual: list[Cena] = []
        r: roteiro.CenaRoteiro | None = rot[k]
        for c in membros:
            if atual and c.render_end_s - atual[0].render_start_s > DURACAO_MAX_CENA_S and not c.preenchimento:
                partes.append((r, atual))
                atual, r = [], None
            atual.append(c)
        partes.append((r, atual))

    cenas: list[Cena] = []
    for r, membros in partes:
        n = len(cenas)
        cena = Cena(
            id=f"c{n + 1:03d}", indice=n,
            start_s=membros[0].start_s, end_s=membros[-1].end_s,
            render_start_s=membros[0].render_start_s, render_end_s=membros[-1].render_end_s,
            texto=" ".join(c.texto.strip() for c in membros if c.texto.strip()),
            palavras=[p for c in membros for p in c.palavras],
            segmentos_originais=[s for c in membros for s in c.segmentos_originais],
            preenchimento=all(c.preenchimento for c in membros),
        )
        if r is None or r.template == roteiro.TEMPLATE_REGRA:
            ant = cenas[-1].decisao.template if cenas else None
            rr = roteiro.decidir_regra(cena, imagens, ant)
            cena.decisao = Decisao(template=rr.template, props_semanticas=rr.dados, origem="regra",
                                   justificativa=rr.justificativa or "trecho longo dividido", confianca=0.6)
        else:
            cena.decisao = Decisao(template=r.template, props_semanticas=r.dados, origem=r.origem,
                                   justificativa=r.justificativa, confianca=0.8)
        cenas.append(cena)
    return cenas


def _limitar_repeticoes(cenas: list[Cena], imagens: list[dict]) -> None:
    seguidas = 0
    for i, c in enumerate(cenas):
        ant = cenas[i - 1].decisao.template if i else None
        seguidas = seguidas + 1 if c.decisao.template == ant else 1
        if seguidas > MAX_REPETICOES and c.decisao.template != "TituloImpacto":
            alt = roteiro.decidir_regra(c, imagens, ant)
            if alt.template == c.decisao.template:
                alt = roteiro.CenaRoteiro(inicio=c.start_s, fim=c.end_s, template="TituloImpacto",
                                          dados={"texto": roteiro._titulo_curto(c.texto),
                                                 "palavras_destaque": []}, origem="regra",
                                          justificativa="variedade: 3ª repetição seguida")
            c.decisao = Decisao(template=alt.template, props_semanticas=alt.dados, origem="regra",
                                justificativa=alt.justificativa, confianca=0.5)
            seguidas = 1


# ---------------------------------------------------------------- execução

def executar(projeto_id: str, force: bool = False) -> None:
    c = Caminhos(projeto_id)
    projeto = carregar_projeto(c)
    t = carregar_timeline(c)
    if not t.concluida("m04"):
        raise RuntimeError("m04 não concluída")
    if t.concluida(ETAPA) and not force:
        print(f"[{ETAPA}] já concluída (use --force para refazer)")
        return

    # as cenas do M04 são a base do roteiro; guardamos uma cópia porque o modo IA as reagrupa
    snapshot = c.cache / "cenas_m04.json"
    if t.concluida(ETAPA) and snapshot.exists():
        t.cenas = [Cena.model_validate(x) for x in json.loads(snapshot.read_text(encoding="utf-8"))]
    else:
        snapshot.write_text(json.dumps([x.model_dump() for x in t.cenas], ensure_ascii=False), encoding="utf-8")

    catalogo = carregar_catalogo()
    ids_impl = {x["id"] for x in catalogo["templates"] if x.get("status") == "implementado"}
    faltando = set(roteiro.DADOS) - ids_impl
    if faltando:
        raise RuntimeError(f"templates do roteiro sem implementação no catálogo: {sorted(faltando)}")

    imagens = listar_imagens(c)
    canal_desc = ""
    if t.config_resolvida and t.config_resolvida.canal:
        dna = t.config_resolvida.canal.dna
        canal_desc = f"{t.config_resolvida.canal.nome}; tom {dna.tom}; público: {dna.publico}"

    modo = "regras"
    estado = {"modo": modo, "status": "pensando", "cenas": []}
    _ao_vivo(c, estado)

    rot: list[roteiro.CenaRoteiro] | None = None
    if projeto.decisao.provedor == "ollama":
        modelo = llm.escolher_modelo(projeto.decisao.modelo) if llm.disponivel() else None
        if not modelo:
            print(f"[{ETAPA}] Ollama indisponível — usando roteiro por regras")
        else:
            estado.update(modo="ia", modelo=modelo)
            _ao_vivo(c, estado)
            try:
                rot = roteiro.roteiro_llm(t.cenas, imagens, canal_desc, modelo, projeto.decisao.temperatura)
                if len(rot) < 1:
                    raise ValueError("nenhuma cena válida")
                modo = "ia"
            except Exception as e:  # noqa: BLE001 — qualquer falha da IA cai nas regras
                print(f"[{ETAPA}] roteiro da IA inválido ({e}) — usando regras")
                rot = None

    if rot is not None:
        cenas = _reconstruir(t, rot, imagens)
    elif projeto.decisao.provedor == "nenhum" and projeto.decisao.template_fixo:
        template = projeto.decisao.template_fixo
        if template not in ids_impl:
            raise ValueError(f"template_fixo '{template}' não implementado. Disponíveis: {sorted(ids_impl)}")
        for cena in t.cenas:
            cena.decisao = decidir_fixo(cena, template)
        cenas = t.cenas
        modo = "fixo"
    else:
        regras = roteiro.roteiro_regras(t.cenas, imagens)
        por_inicio = {round(r.inicio, 3): r for r in regras}
        for cena in t.cenas:
            r = por_inicio.get(round(cena.start_s, 3))
            if cena.preenchimento or r is None:
                cena.decisao = Decisao(template=TEMPLATE_PREENCHIMENTO, props_semanticas={}, origem="regra",
                                       justificativa="silêncio longo — tela de fundo")
            else:
                cena.decisao = Decisao(template=r.template, props_semanticas=r.dados, origem="regra",
                                       justificativa=r.justificativa, confianca=0.6)
        cenas = t.cenas

    if modo != "fixo":
        _limitar_repeticoes(cenas, imagens)

    t.cenas = cenas
    historico: dict[str, int] = {}
    estado.update(modo=modo, status="concluido", cenas=[])
    for cena in cenas:
        historico[cena.decisao.template] = historico.get(cena.decisao.template, 0) + 1
        r = roteiro.CenaRoteiro(inicio=cena.render_start_s, fim=cena.render_end_s,
                                template=cena.decisao.template, dados=cena.decisao.props_semanticas,
                                origem="llm" if cena.decisao.origem == "llm" else "regra")
        tela = _resumo_tela(r) if cena.decisao.props_semanticas else "(fundo)"
        estado["cenas"].append({"id": cena.id, "inicio": cena.render_start_s, "fim": cena.render_end_s,
                                "template": cena.decisao.template, "tela": tela,
                                "por_que": cena.decisao.justificativa, "fala": cena.texto})
        print(f"[{ETAPA}] {cena.id} {cena.render_start_s:5.1f}-{cena.render_end_s:5.1f}s "
              f"{cena.decisao.template:<20} {tela[:70]}")
    _ao_vivo(c, estado)

    t.historico_templates = historico
    for etapa in ("m12", "m13", "m14"):
        if etapa in t.etapas_concluidas:
            t.etapas_concluidas.remove(etapa)
    t.marcar(ETAPA)
    salvar_timeline(c, t)
    print(f"[{ETAPA}] {len(cenas)} cenas, modo {modo}: {historico}")
