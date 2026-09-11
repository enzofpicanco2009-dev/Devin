"""M12 — Aplica tema/estilo: props semânticas -> props finais (determinístico, sem IA)."""
from __future__ import annotations

from .comum import Caminhos, carregar_projeto, carregar_timeline, salvar_timeline, sha256_obj
from .m08_resolver_config import resolver
from .schemas.config import ConfigResolvida
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
    texto = sem.get("texto", cena.texto)
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


APLICADORES = {"TituloImpacto": props_titulo_impacto}


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

    avisos = [a for a in t.validacao.avisos if not a.startswith(tuple(x.id + ":" for x in t.cenas))]
    for cena in t.cenas:
        if not cena.decisao:
            raise RuntimeError(f"{cena.id} sem decisão")
        aplicador = APLICADORES.get(cena.decisao.template)
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
    salvar_timeline(c, t)
    print(f"[{ETAPA}] props finais geradas para {len(t.cenas)} cenas (formato {cfg.formato.id}); "
          f"{len(avisos)} aviso(s)")
    for a in avisos:
        print(f"  ⚠ {a}")
