"""M12 — Aplica tema/estilo: props semânticas -> props finais (determinístico, sem IA)."""
from __future__ import annotations

import re

from .comum import Caminhos, carregar_projeto, carregar_timeline, salvar_timeline, sha256_obj
from .m08_resolver_config import resolver
from .schemas.config import ConfigResolvida
from .imagens import ids_por_tipo, listar_imagens, publicar_imagens, publicar_proxies_video
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
        "animacaoEntrada": sem.get("animacao_entrada", "padrao"),
        "animacaoSaida": sem.get("animacao_saida", "padrao"),
        "safeArea": safe.model_dump(),
    }


def props_base(cena: Cena, cfg: ConfigResolvida) -> dict:
    """Props comuns a todos os templates (cores, fontes, ritmo, safe area)."""
    tema, estilo = cfg.tema, cfg.estilo
    tip = tema.tipografia
    safe = tema.safe_areas.get(cfg.formato.id) or next(iter(tema.safe_areas.values()))
    vel = estilo.animacao.velocidade
    cores = tema.cores
    s = _sem(cena)
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
        "animacaoEntrada": s.get("animacao_entrada", "padrao"),
        "animacaoSaida": s.get("animacao_saida", "padrao"),
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
            "animacaoEntrada": s.get("animacao_entrada", "padrao"),
            "tamanhoFonte": round(tam),
            "fonte": {"familia": tip.fonte_numero.familia, "peso": tip.fonte_numero.peso}}


def props_lista(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    itens = [str(i) for i in s.get("itens", [])][:6] or [cena.texto]
    dur = cena.duracao_render_s
    tempos = [round(0.4 + i * (dur * 0.7) / max(1, len(itens)), 2) for i in range(len(itens))]
    tam = cfg.tema.tipografia.escala.titulo_max * 0.6
    return {**props_base(cena, cfg), "titulo": s.get("titulo", ""), "itens": itens, "temposS": tempos,
            "numerada": True, "tamanhoFonte": round(tam),
            "animacaoEntrada": s.get("animacao_entrada", "padrao")}


def props_citacao(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    texto = s.get("texto") or cena.texto
    tam = cfg.tema.tipografia.escala.titulo_max * (0.7 if len(texto) < 90 else 0.55)
    return {**props_base(cena, cfg), "texto": texto, "autor": s.get("autor", ""), "tamanhoFonte": round(tam),
            "animacaoEntrada": s.get("animacao_entrada", "padrao")}


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
    direcao_bruta = str(s.get("direcao", "sobe") or "sobe").strip().lower()
    if direcao_bruta in {"desce", "cai", "queda", "baixo", "baixa", "down"}:
        direcao = "desce"
    else:
        direcao = "sobe"
    sent = s.get("sentimento", "neutro")
    positivo_quando_sobe = not ((direcao == "sobe" and sent == "negativo") or (direcao == "desce" and sent == "positivo"))
    return {**props_base(cena, cfg), "direcao": direcao, "texto": s.get("texto", ""), "valor": str(s.get("valor", "")),
            "positivoQuandoSobe": positivo_quando_sobe,
            "animacaoEntrada": s.get("animacao_entrada", "padrao")}


def props_texto(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    texto = s.get("texto") or cena.texto
    tam = cfg.tema.tipografia.escala.titulo_max * (0.6 if len(texto) < 80 else 0.5)
    return {**props_base(cena, cfg), "texto": texto, "destaque": [str(d) for d in s.get("destaque", [])][:2],
            "tamanhoFonte": round(tam),
            "animacaoEntrada": s.get("animacao_entrada", "padrao")}


def props_pergunta(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    texto = s.get("texto") or cena.texto
    tam = cfg.tema.tipografia.escala.titulo_max * (0.8 if len(texto) < 50 else 0.6)
    return {**props_base(cena, cfg), "texto": texto, "tamanhoFonte": round(tam),
            "animacaoEntrada": s.get("animacao_entrada", "padrao")}


def _palavras_relativas(cena: Cena) -> list[dict]:
    base: list[dict] = []
    for p in cena.palavras:
        w = str(p.w or "").strip()
        if not w:
            continue
        s_rel = max(0.0, float(p.s) - float(cena.render_start_s))
        e_rel = max(s_rel + 0.06, float(p.e) - float(cena.render_start_s))
        base.append({"w": w, "s": round(s_rel, 3), "e": round(e_rel, 3)})
    return base


def _redistribuir_palavras(texto: str, base: list[dict], duracao_s: float) -> list[dict]:
    tokens = [t for t in texto.split() if t.strip()]
    if not tokens:
        return []
    if base:
        inicio = float(base[0]["s"])
        fim = float(base[-1]["e"])
    else:
        inicio = 0.0
        fim = float(max(0.5, duracao_s))
    if fim <= inicio:
        fim = inicio + max(0.5, duracao_s)
    pesos = [max(1, len(re.sub(r"\W+", "", t, flags=re.UNICODE))) for t in tokens]
    total = sum(pesos)
    janela = fim - inicio
    out: list[dict] = []
    acc = inicio
    for i, (tok, peso) in enumerate(zip(tokens, pesos)):
        fatia = janela * (peso / total)
        s = acc
        e = fim if i == len(tokens) - 1 else acc + fatia
        out.append({"w": tok, "s": round(max(0.0, s), 3), "e": round(max(s + 0.06, e), 3)})
        acc = e
    return out


def props_legenda_sincronizada(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    texto = str(s.get("texto") or cena.texto or "").strip()
    palavras_base = _palavras_relativas(cena)
    texto_base = " ".join(p["w"] for p in palavras_base).strip()
    editaram_texto = bool(texto) and texto_base and texto.strip() != texto_base
    if editaram_texto:
        palavras = _redistribuir_palavras(texto, palavras_base, cena.duracao_render_s)
        avisos.append(f"{cena.id}: LegendaSincronizada com texto editado — tempos redistribuídos")
    elif palavras_base:
        palavras = palavras_base
        if not texto:
            texto = texto_base
    else:
        palavras = _redistribuir_palavras(texto, [], cena.duracao_render_s)
    return {
        **props_base(cena, cfg),
        "texto": texto,
        "palavras": palavras,
        "palavrasDestaque": [str(x) for x in s.get("palavras_destaque", [])][:5],
        "tamanho": round(cfg.tema.tipografia.escala.titulo_max * 1.2),
    }


def props_texto_longo(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    texto = s.get("texto") or cena.texto
    destaques = [str(d) for d in s.get("destaque_frases", s.get("destaque", []))][:3]
    return {**props_base(cena, cfg), "texto": texto, "destaque_frases": destaques,
            "animacaoEntrada": s.get("animacao_entrada", "padrao")}


def props_cta_final(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    texto_principal = str(s.get("texto_principal", s.get("cta", "Inscreva-se")))
    subtexto = str(s.get("subtexto", "")) or None
    return {
        **props_base(cena, cfg),
        "texto_principal": texto_principal,
        "subtexto": subtexto,
        "mostrar_logo": bool(s.get("mostrar_logo", False)),
        "estilo_botao": "contorno" if s.get("estilo_botao") == "contorno" else "solido",
        "logo_src": s.get("logo_src"),
    }


def props_grafico_pizza(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    fatias_sem = s.get("fatias", [])
    fatias = []
    for item in fatias_sem[:6]:
        try:
            # Compatibilidade com payloads antigos que usavam "percentual".
            valor_bruto = item.get("valor", item.get("percentual", 0))
            valor = float(valor_bruto)
            if valor <= 0:
                continue
            rotulo = str(item.get("rotulo", "")).strip() or "Item"
            fatias.append({"rotulo": rotulo, "valor": valor})
        except Exception:
            continue
    if len(fatias) < 2:
        fatias = [{"rotulo": "A", "valor": 60.0}, {"rotulo": "B", "valor": 40.0}]
        avisos.append(f"{cena.id}: fatias insuficientes para GraficoPizza — usando fallback")
    return {
        **props_base(cena, cfg),
        "titulo": s.get("titulo", ""),
        "fatias": fatias,
        "estilo": "pizza" if s.get("estilo") == "pizza" else "donut",
        "destacar_indice": s.get("destacar_indice"),
    }


def props_timeline(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    eventos_sem = s.get("eventos", [])
    eventos = []
    for e in eventos_sem[:6]:
        marcador = str(e.get("marcador", "")).strip()
        descricao = str(e.get("descricao", "")).strip()
        if marcador and descricao:
            eventos.append({"marcador": marcador, "descricao": descricao})
    if len(eventos) < 2:
        eventos = [
            {"marcador": "Inicio", "descricao": "Ponto de partida"},
            {"marcador": "Agora", "descricao": "Ponto atual"},
        ]
        avisos.append(f"{cena.id}: eventos insuficientes para Timeline — usando fallback")
    return {
        **props_base(cena, cfg),
        "titulo": s.get("titulo", ""),
        "eventos": eventos,
        "orientacao": "vertical" if s.get("orientacao") == "vertical" else "horizontal",
    }


def props_planilha(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    colunas = [str(c) for c in s.get("colunas", [])][:4]
    linhas = [[str(v) for v in linha][:4] for linha in s.get("linhas", [])][:5]
    if len(colunas) < 2 or len(linhas) < 1:
        colunas = ["Item", "Valor"]
        linhas = [["Exemplo", "-"], ["Outro", "-"]]
        avisos.append(f"{cena.id}: dados insuficientes para Planilha — usando fallback")
    linhas = [linha + [""] * (len(colunas) - len(linha)) if len(linha) < len(colunas) else linha[:len(colunas)]
             for linha in linhas]
    return {
        **props_base(cena, cfg),
        "titulo": s.get("titulo", ""),
        "colunas": colunas,
        "linhas": linhas,
        "destacar_coluna": s.get("destacar_coluna"),
        "destacar_linha": s.get("destacar_linha"),
    }


def props_mapa_mental(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
    s = _sem(cena)
    itens_sem = s.get("itens", [])
    itens = []
    for item in itens_sem[:16]:
        if not isinstance(item, dict):
            continue
        codigo = str(item.get("id", "")).strip()
        texto = str(item.get("texto", "")).strip()
        if not codigo or not texto:
            continue
        if not re.fullmatch(r"\d+(?:\.\d+)*", codigo):
            continue
        itens.append({"id": codigo, "texto": texto})
    if len(itens) < 2:
        itens = [
            {"id": "1", "texto": "Ideia central"},
            {"id": "1.1", "texto": "Primeira ramificação"},
            {"id": "1.2", "texto": "Segunda ramificação"},
        ]
        avisos.append(f"{cena.id}: itens insuficientes para MapaMental — usando fallback")
    return {
        **props_base(cena, cfg),
        "titulo": str(s.get("titulo", "")).strip(),
        "itens": itens,
    }


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
            "zoom": 1.0, "focoX": 0.5, "focoY": 0.5, "moldura": True,
            "animacaoEntrada": s.get("animacao_entrada", "padrao")}
    return props_imagem


def fazer_props_midia(mapa: dict[str, str], tipos: dict[str, str], proxies_video: dict[str, str]):
    contador = {"imagens": 0}

    def props_midia(cena: Cena, cfg: ConfigResolvida, avisos: list[str]) -> dict:
        s = _sem(cena)
        mid = str(s.get("midia", ""))
        tipo = tipos.get(mid, "imagem")
        src = proxies_video.get(mid) if tipo == "video" else None
        if not src:
            src = mapa.get(mid)
        if not src:
            avisos.append(f"{cena.id}: mídia '{mid}' não encontrada — usando título")
            cena.decisao.template = "TituloImpacto"
            cena.decisao.props_semanticas = {"texto": s.get("texto") or cena.texto}
            return props_titulo_impacto(cena, cfg, avisos)
        props = {**props_base(cena, cfg), "src": src, "tipo": tipo}
        if tipo == "imagem":
            # Para imagens, mantém o quadro inteiro visível por padrão, mas aceita override manual.
            ajuste = str(s.get("ajusteImagem", "contain") or "contain").lower()
            props["ajusteImagem"] = ajuste if ajuste in {"cover", "contain"} else "contain"
            zoom = str(s.get("zoom", "nenhum") or "nenhum").lower()
            props["zoom"] = zoom if zoom in {"in", "out", "nenhum"} else "nenhum"
            try:
                zoom_max = float(s.get("zoomMax", 1.08))
            except (TypeError, ValueError):
                zoom_max = 1.08
            props["zoomMax"] = max(1.0, min(1.3, round(zoom_max, 3)))
            contador["imagens"] += 1
        else:
            zoom = str(s.get("zoom", "nenhum") or "nenhum").lower()
            props["zoom"] = zoom if zoom in {"in", "out", "nenhum"} else "nenhum"
            try:
                zoom_max = float(s.get("zoomMax", 1.08))
            except (TypeError, ValueError):
                zoom_max = 1.08
            props["zoomMax"] = max(1.0, min(1.3, round(zoom_max, 3)))
        return props
    return props_midia


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
    "TextoLongo": props_texto_longo,
    "CTAFinal": props_cta_final,
    "GraficoPizza": props_grafico_pizza,
    "Timeline": props_timeline,
    "Planilha": props_planilha,
    "MapaMental": props_mapa_mental,
    "MapaMentalCartoes": props_mapa_mental,
    "LegendaSincronizada": props_legenda_sincronizada,
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

    mapa_midias = publicar_imagens(c)
    mapa_proxies_video = publicar_proxies_video(c)
    midias = listar_imagens(c)
    tipos_midias = ids_por_tipo(midias)
    aplicadores = {**APLICADORES, "ImagemDestaque": fazer_props_imagem(mapa_midias),
                   "MidiaCheia": fazer_props_midia(mapa_midias, tipos_midias, mapa_proxies_video)}
    avisos = [a for a in t.validacao.avisos if not a.startswith(tuple(x.id + ":" for x in t.cenas))]
    for cena in t.cenas:
        if not cena.decisao:
            raise RuntimeError(f"{cena.id} sem decisão")
        aplicador = aplicadores.get(cena.decisao.template)
        if not aplicador:
            raise NotImplementedError(f"Sem aplicador de tema para '{cena.decisao.template}'")
        props = aplicador(cena, cfg, avisos)
        if cena.fundo_override:
            f = cena.fundo_override.model_dump()
            camadas = f.get("camadas") if isinstance(f.get("camadas"), list) else None
            if camadas:
                camadas_ok = []
                for camada in camadas:
                    if not isinstance(camada, dict):
                        continue
                    midia_id = camada.get("midia", "")
                    src = mapa_proxies_video.get(midia_id) if camada.get("tipo") == "video" else None
                    if not src:
                        src = mapa_midias.get(midia_id)
                    if not src:
                        avisos.append(f"{cena.id}: mídia de fundo '{midia_id}' não encontrada")
                        continue
                    camada_ok = dict(camada)
                    camada_ok["src"] = src
                    camada_ok["tipo"] = tipos_midias.get(midia_id, camada_ok.get("tipo", "imagem"))
                    camadas_ok.append(camada_ok)
                if camadas_ok:
                    f = dict(camadas_ok[0])
                    f["camadas"] = camadas_ok
                    props["fundo_override"] = f
            else:
                midia_id = f.get("midia", "")
                src = mapa_proxies_video.get(midia_id) if f.get("tipo") == "video" else None
                if not src:
                    src = mapa_midias.get(midia_id)
                if src:
                    f["src"] = src
                    f["tipo"] = tipos_midias.get(f["midia"], f.get("tipo", "imagem"))
                    props["fundo_override"] = f
                else:
                    avisos.append(f"{cena.id}: mídia de fundo '{f.get('midia')}' não encontrada")
        cena.props_finais = {k: v for k, v in props.items() if v is not None}
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
