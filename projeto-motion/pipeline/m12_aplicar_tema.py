"""M12 — Aplica tema/estilo: props semânticas -> props finais (determinístico, sem IA)."""
from __future__ import annotations

import re

from .comum import Caminhos, carregar_projeto, carregar_timeline, salvar_timeline, sha256_obj
from .m08_resolver_config import resolver
from .schemas.config import ConfigResolvida
from .imagens import publicar_imagens
from .schemas.timeline import Cena

ETAPA = "m12"


def quebrar_linhas(texto: str, max_chars: int) -> list[str]:
    linhas, atual = [], ""
    for p in texto.split():
        cand = f"{atual} {p}" if atual else p
        if len(cand) <= max_chars or not atual:
            atual = cand
        else:
            linhas.append(atual)
            atual = p
    if atual:
        linhas.append(atual)
    return linhas


def ajustar_texto(texto: str, tam_max: int, tam_min: int, max_linhas: int, max_chars: int):
    tam = tam_max
    while tam >= tam_min:
        chars = int(max_chars * tam_max / tam)
        linhas = quebrar_linhas(texto, chars)
        if len(linhas) <= max_linhas:
            return linhas, tam, False
        tam -= 4
    chars = int(max_chars * tam_max / tam_min)
    linhas = quebrar_linhas(texto, chars)[:max_linhas]
    linhas[-1] = " ".join(linhas[-1].split()[:-1] + ["…"])
    return linhas, tam_min, True


LARGURA_UTIL_REFERENCIA = 1920 * (1 - 2 * 0.06)


def caracteres_por_linha(max_chars_ref: int, largura_px: int, lados_pct: float) -> int:
    """max_caracteres_linha do tema é calibrado para 1920px com 6% de margem; escala pela largura útil."""
    largura_util = largura_px * (1 - 2 * lados_pct / 100)
    return max(8, round(max_chars_ref * largura_util / LARGURA_UTIL_REFERENCIA))


def linhas_por_formato(max_linhas_ref: int, largura: int, altura: int) -> int:
    """Formatos mais altos que 16:9 ganham linhas extras (até 2x)."""
    fator = min(2.0, max(1.0, (altura / largura) / (9 / 16)))
    return round(max_linhas_ref * fator)


def cor_semantica(cfg: ConfigResolvida, eixo: str, valor: str, padrao: str) -> str:
    token = cfg.tema.mapa_semantico.get(eixo, {}).get(valor)
    return getattr(cfg.tema.cores, token, padrao) if token else padrao


def props_titulo_impacto(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    sem = cena.decisao.props_semanticas if cena.decisao else {}
    tema, estilo = cfg.tema, cfg.estilo
    tip = tema.tipografia
    texto = "" if cena.preenchimento else (sem.get("texto") or cena.texto)
    safe = tema.safe_areas.get(cfg.formato.id) or next(iter(tema.safe_areas.values()))
    max_chars = caracteres_por_linha(tip.max_caracteres_linha, cfg.formato.largura, safe.lados)
    max_linhas = linhas_por_formato(tip.max_linhas_titulo, cfg.formato.largura, cfg.formato.altura)
    linhas, tamanho, truncado = ajustar_texto(
        texto, tip.escala.titulo_max, tip.escala.titulo_min, max_linhas, max_chars,
    ) if texto else ([], tip.escala.titulo_max, False)
    if truncado:
        avisos.append(f"{cena.id}: texto truncado ({len(texto.split())} palavras)")
    elif texto and tamanho < tip.escala.titulo_max:
        avisos.append(f"{cena.id}: fonte reduzida para {tamanho}px")

    vel = estilo.animacao.velocidade
    return {
        "texto": texto,
        "linhas": linhas,
        "duracaoEmSegundos": round(cena.duracao_render_s, 3),
        "corTexto": cor_semantica(cfg, "enfase", sem.get("enfase", "media"), tema.cores.texto),
        "corFundo": tema.cores.fundo,
        "corDestaque": tema.cores.destaque,
        "palavrasDestaque": sem.get("palavras_destaque", []),
        "fonte": {"familia": tip.fonte_titulo.familia, "peso": tip.fonte_titulo.peso},
        "tamanhoFonte": tamanho,
        "entradaFrames": max(1, round(estilo.animacao.entrada_frames / vel)),
        "saidaFrames": max(1, round(estilo.animacao.saida_frames / vel)),
        "deslocamentoEntradaPx": 40,
        "spring": estilo.animacao.spring.model_dump(),
        "safeArea": safe.model_dump(),
    }


def props_base(cena: Cena, cfg: ConfigResolvida) -> dict:
    """Props comuns a todos os templates (cores, fontes, ritmo, safe area)."""
    tema, estilo = cfg.tema, cfg.estilo
    tip = tema.tipografia
    safe = tema.safe_areas.get(cfg.formato.id) or next(iter(tema.safe_areas.values()))
    vel = estilo.animacao.velocidade
    cores = tema.cores
    return {
        "duracaoEmSegundos": round(cena.duracao_render_s, 3),
        "corTexto": cores.texto,
        "corTextoSecundario": cores.texto_secundario,
        "corFundo": cores.fundo,
        "corFundoSecundario": cores.fundo_secundario,
        "corDestaque": cores.destaque,
        "corDestaque2": cores.destaque_2,
        "corPositivo": cores.positivo,
        "corNegativo": cores.negativo,
        "fonte": {"familia": tip.fonte_titulo.familia, "peso": tip.fonte_titulo.peso},
        "fonteCorpo": {"familia": tip.fonte_corpo.familia, "peso": tip.fonte_corpo.peso},
        "entradaFrames": max(1, round(estilo.animacao.entrada_frames / vel)),
        "saidaFrames": max(1, round(estilo.animacao.saida_frames / vel)),
        "spring": estilo.animacao.spring.model_dump(),
        "safeArea": safe.model_dump(),
    }


def _sem(cena: Cena) -> dict:
    return cena.decisao.props_semanticas if cena.decisao else {}


RE_NUMERO = re.compile(r"-?\d{1,3}(?:\.\d{3})*(?:,\d+)?|-?\d+(?:[.,]\d+)?")


def decompor_numero(valor: str) -> tuple[float | None, str, str, int]:
    """'R$ 13,75%' -> (13.75, 'R$ ', '%', 2). Sem número: (None, valor, '', 0)."""
    m = RE_NUMERO.search(valor)
    if not m:
        return None, valor, "", 0
    bruto = m.group(0)
    decimais = len(bruto.split(",")[1]) if "," in bruto else (
        len(bruto.split(".")[1]) if "." in bruto and len(bruto.split(".")[1]) != 3 else 0)
    normal = bruto.replace(".", "").replace(",", ".") if "," in bruto or decimais else bruto.replace(".", "")
    try:
        numero = float(normal)
    except ValueError:
        return None, valor, "", 0
    return numero, valor[:m.start()], valor[m.end():], decimais


def props_numero(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    valor = str(s.get("valor", ""))
    numero, prefixo, sufixo, decimais = decompor_numero(valor)
    tip = cfg.tema.tipografia
    tam = tip.escala.titulo_max * 2.2 if cfg.formato.largura >= cfg.formato.altura else tip.escala.titulo_max * 1.8
    if len(valor) > 8:
        tam *= 8 / len(valor)
    return {**props_base(cena, cfg), "valor": valor, "numero": numero, "prefixo": prefixo, "sufixo": sufixo,
            "decimais": decimais, "rotulo": s.get("rotulo", ""), "sentimento": s.get("sentimento", "neutro"),
            "tamanhoFonte": round(tam),
            "fonte": {"familia": tip.fonte_numero.familia, "peso": tip.fonte_numero.peso}}


def props_lista(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    itens = [str(i) for i in s.get("itens", [])][:6] or [cena.texto]
    dur = cena.duracao_render_s
    tempos = [round(0.4 + i * (dur * 0.7) / max(1, len(itens)), 2) for i in range(len(itens))]
    tam = cfg.tema.tipografia.escala.titulo_max * 0.6
    return {**props_base(cena, cfg), "titulo": s.get("titulo", ""), "itens": itens, "temposS": tempos,
            "numerada": True, "tamanhoFonte": round(tam)}


def props_citacao(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    texto = s.get("texto") or cena.texto
    tam = cfg.tema.tipografia.escala.titulo_max * (0.7 if len(texto) < 90 else 0.55)
    return {**props_base(cena, cfg), "texto": texto, "autor": s.get("autor", ""), "tamanhoFonte": round(tam)}


def props_comparacao(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    def lado(d: dict) -> dict:
        return {"rotulo": str(d.get("rotulo", "")), "valor": str(d.get("valor", "")),
                "itens": [str(i) for i in d.get("itens", [])][:4]}
    return {**props_base(cena, cfg), "titulo": s.get("titulo", ""), "a": lado(s.get("a", {})),
            "b": lado(s.get("b", {})), "vencedor": s.get("vencedor", "nenhum")}


def props_grafico(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    barras = [{"rotulo": str(b["rotulo"]), "valor": float(b["valor"])} for b in s.get("barras", [])][:6]
    return {**props_base(cena, cfg), "titulo": s.get("titulo", ""), "barras": barras,
            "unidade": s.get("unidade", ""), "destacarMaior": True}


def props_seta(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    direcao = s.get("direcao", "sobe")
    sent = s.get("sentimento", "neutro")
    positivo_quando_sobe = not ((direcao == "sobe" and sent == "negativo") or (direcao == "desce" and sent == "positivo"))
    return {**props_base(cena, cfg), "direcao": direcao, "texto": s.get("texto", ""), "valor": str(s.get("valor", "")),
            "positivoQuandoSobe": positivo_quando_sobe}


def props_texto(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    texto = s.get("texto") or cena.texto
    tam = cfg.tema.tipografia.escala.titulo_max * (0.6 if len(texto) < 80 else 0.5)
    return {**props_base(cena, cfg), "texto": texto, "destaque": [str(d) for d in s.get("destaque", [])][:2],
            "tamanhoFonte": round(tam)}


def props_pergunta(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    texto = s.get("texto") or cena.texto
    tam = cfg.tema.tipografia.escala.titulo_max * (0.8 if len(texto) < 50 else 0.6)
    return {**props_base(cena, cfg), "texto": texto, "tamanhoFonte": round(tam)}


def fazer_props_imagem(mapa_imagens: dict[str, str]):
    def props_imagem(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
        s = _sem(cena)
        src = mapa_imagens.get(str(s.get("imagem", "")))
        if not src:
            avisos.append(f"{cena.id}: imagem '{s.get('imagem')}' não encontrada — usando título")
            cena.decisao.template = "TituloImpacto"
            cena.decisao.props_semanticas = {"texto": s.get("texto") or cena.texto}
            return props_titulo_impacto(cena, cfg, avisos)
        return {**props_base(cena, cfg), "src": src, "texto": s.get("texto", ""), "legenda": s.get("legenda", ""),
                "zoom": 1.12, "focoX": 0.5, "focoY": 0.5, "moldura": True}
    return props_imagem


APLICADORES = {
    "TextoCorrido": props_texto,
    "TituloImpacto": props_titulo_impacto,
    "NumeroDestaque": props_numero,
    "ListaAnimada": props_lista,
    "Citacao": props_citacao,
    "ComparacaoDoisLados": props_comparacao,
    "GraficoBarras": props_grafico,
    "SetaTendencia": props_seta,
    "Pergunta": props_pergunta,
}


def executar(projeto_id: str, force: bool = False, formato_id: str | None = None) -> None:
    c = Caminhos(projeto_id)
    projeto = carregar_projeto(c)
    t = carregar_timeline(c)
    if not t.concluida("m09"):
        raise RuntimeError("m09 não concluída")

    cfg = resolver(projeto)
    if formato_id:
        cfg = cfg.model_copy(update={"formato": projeto.formato(formato_id)})
    t.config_resolvida = cfg

    aplicadores = {**APLICADORES, "ImagemDestaque": fazer_props_imagem(publicar_imagens(c))}
    avisos = [a for a in t.validacao.avisos if not a.startswith(tuple(x.id + ":" for x in t.cenas))]
    for cena in t.cenas:
        if not cena.decisao:
            raise RuntimeError(f"{cena.id} sem decisão")
        aplicador = aplicadores.get(cena.decisao.template)
        if not aplicador:
            raise NotImplementedError(f"Sem aplicador de tema para '{cena.decisao.template}'")
        cena.props_finais = aplicador(cena, cfg, avisos)
        cena.render.hash_props = sha256_obj(
            {"t": cena.decisao.template, "p": cena.props_finais, "f": cfg.formato.model_dump()}
        )
    t.validacao.avisos = avisos
    for etapa in ("m13", "m14"):
        if etapa in t.etapas_concluidas:
            t.etapas_concluidas.remove(etapa)
    t.marcar(ETAPA)
    t.artefatos[ETAPA] = cfg.formato.id
    salvar_timeline(c, t)
    print(f"[{ETAPA}] props finais geradas para {len(t.cenas)} cenas (formato {cfg.formato.id}); "
          f"{len(avisos)} aviso(s)")
    for a in avisos:
        print(f"  ⚠ {a}")
