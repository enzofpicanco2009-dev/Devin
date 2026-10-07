"""Edição manual de cenas: trocar template e/ou dados de uma cena já roteirizada.

A edição grava na timeline (fonte única de verdade) com origem "manual", invalida M12+ e atualiza o
`roteiro_ao_vivo.json` para a interface refletir a mudança sem esperar o re-render.
"""
from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict

from pydantic import ValidationError

from . import llm
from . import roteiro
from .comum import Caminhos, carregar_projeto, carregar_timeline, ffprobe, salvar_timeline
from .imagens import listar_imagens, pasta_imagens
from .m09_motor_decisao import _resumo_tela
from .schemas.timeline import Cena, Decisao, FundoOverride, Timeline


DURACAO_MIN_S = 0.5


class EdicaoInvalida(ValueError):
    pass


def _cena(t: Timeline, cena_id: str) -> Cena:
    for c in t.cenas:
        if c.id == cena_id:
            return c
    raise EdicaoInvalida(f"cena '{cena_id}' não existe")


def validar_dados(template: str, dados: dict) -> dict:
    modelo = roteiro.DADOS.get(template)
    if modelo is None:
        raise EdicaoInvalida(f"template '{template}' não existe. Disponíveis: {sorted(roteiro.DADOS)}")
    try:
        return modelo.model_validate(dados).model_dump()
    except ValidationError as e:
        msgs = "; ".join(f"{'.'.join(str(x) for x in err['loc'])}: {err['msg']}" for err in e.errors())
        raise EdicaoInvalida(msgs) from e


def cenas_editaveis(c: Caminhos) -> list[dict]:
    t = carregar_timeline(c)
    out = []
    for cena in t.cenas:
        d = cena.decisao
        out.append({
            "id": cena.id, "inicio": cena.render_start_s, "fim": cena.render_end_s, "fala": cena.texto,
            "template": d.template if d else None, "dados": d.props_semanticas if d else {},
            "origem": d.origem if d else None, "editada": cena.revisao.editado_manualmente,
            "fundo_override": _fundo_dump(cena.fundo_override),
        })
    return out


def _fundo_dump(valor: FundoOverride | dict | None) -> dict | None:
    if valor is None:
        return None
    if isinstance(valor, dict):
        return valor
    return valor.model_dump()


def _atualizar_ao_vivo(c: Caminhos, cena: Cena, tela: str) -> None:
    arq = c.cache / "roteiro_ao_vivo.json"
    if not arq.exists():
        return
    try:
        estado = json.loads(arq.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return
    for item in estado.get("cenas", []):
        if item.get("id") == cena.id and cena.decisao:
            item.update(template=cena.decisao.template, tela=tela, por_que="editado manualmente",
                        dados=cena.decisao.props_semanticas, editada=True,
                        fundo_override=_fundo_dump(cena.fundo_override))
    arq.write_text(json.dumps(estado, ensure_ascii=False, indent=2), encoding="utf-8")


def _tela(cena: Cena) -> str:
    d = cena.decisao
    if d is None or not d.props_semanticas:
        return "(fundo)"
    return _resumo_tela(roteiro.CenaRoteiro(inicio=cena.render_start_s, fim=cena.render_end_s,
                                            template=d.template, dados=d.props_semanticas, origem="regra"))


def _reescrever_ao_vivo(c: Caminhos, t: Timeline) -> None:
    arq = c.cache / "roteiro_ao_vivo.json"
    if not arq.exists():
        return
    try:
        estado = json.loads(arq.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return
    estado["cenas"] = [{
        "id": cena.id, "inicio": cena.render_start_s, "fim": cena.render_end_s,
        "template": cena.decisao.template if cena.decisao else "FundoVazio", "tela": _tela(cena),
        "dados": cena.decisao.props_semanticas if cena.decisao else {},
        "por_que": cena.decisao.justificativa if cena.decisao else "", "fala": cena.texto,
        "editada": cena.revisao.editado_manualmente,
        "fundo_override": _fundo_dump(cena.fundo_override),
    } for cena in t.cenas]
    arq.write_text(json.dumps(estado, ensure_ascii=False, indent=2), encoding="utf-8")


def _invalidar_render(t: Timeline, *cenas: Cena) -> None:
    for cena in cenas:
        cena.props_finais = None
        cena.render.hash_props = None
        cena.render.cache_hit = False
    for etapa in ("m12", "m13", "m14"):
        if etapa in t.etapas_concluidas:
            t.etapas_concluidas.remove(etapa)


def _apagar_previews(c: Caminhos, ids: list[str] | None = None) -> None:
    for pasta in c.cache.glob("previews_*"):
        for arq in pasta.glob("*.jpg"):
            if ids is None or arq.stem in ids:
                arq.unlink()


def _recalcular_fala(cena: Cena) -> None:
    if cena.palavras:
        cena.start_s = max(cena.render_start_s, min(p.s for p in cena.palavras))
        cena.end_s = min(cena.render_end_s, max(p.e for p in cena.palavras))
        cena.texto = " ".join(p.w for p in cena.palavras).strip()
    else:
        cena.start_s = min(max(cena.start_s, cena.render_start_s), cena.render_end_s)
        cena.end_s = min(max(cena.end_s, cena.start_s), cena.render_end_s)


def _mover_fronteira(a: Cena, b: Cena, t_s: float) -> None:
    if t_s - a.render_start_s < DURACAO_MIN_S or b.render_end_s - t_s < DURACAO_MIN_S:
        raise EdicaoInvalida(f"cada cena precisa ter pelo menos {DURACAO_MIN_S:g}s")
    palavras = sorted(a.palavras + b.palavras, key=lambda p: p.s)
    a.palavras = [p for p in palavras if p.s < t_s]
    b.palavras = [p for p in palavras if p.s >= t_s]
    a.render_end_s = b.render_start_s = round(t_s, 3)
    _recalcular_fala(a)
    _recalcular_fala(b)


def _renumerar(t: Timeline) -> None:
    for i, cena in enumerate(t.cenas):
        cena.id = f"c{i + 1:03d}"
        cena.indice = i


def ajustar_tempos(c: Caminhos, cena_id: str, inicio_s: float | None, fim_s: float | None) -> dict:
    """Move o limite entre a cena e as vizinhas. O áudio não muda; só o momento em que a tela troca."""
    t = carregar_timeline(c)
    cena = _cena(t, cena_id)
    i = t.cenas.index(cena)
    afetadas = [cena]
    if inicio_s is not None and abs(inicio_s - cena.render_start_s) > 1e-3:
        if i == 0:
            raise EdicaoInvalida("a primeira cena sempre começa em 0")
        _mover_fronteira(t.cenas[i - 1], cena, inicio_s)
        afetadas.append(t.cenas[i - 1])
    if fim_s is not None and abs(fim_s - cena.render_end_s) > 1e-3:
        if i == len(t.cenas) - 1:
            raise EdicaoInvalida("a última cena sempre termina no fim do áudio")
        _mover_fronteira(cena, t.cenas[i + 1], fim_s)
        afetadas.append(t.cenas[i + 1])
    for x in afetadas:
        x.revisao.editado_manualmente = True
    _invalidar_render(t, *afetadas)
    salvar_timeline(c, t)
    _apagar_previews(c, [x.id for x in afetadas])
    _reescrever_ao_vivo(c, t)
    return {"id": cena.id, "inicio": cena.render_start_s, "fim": cena.render_end_s}


def dividir_cena(c: Caminhos, cena_id: str, em_s: float | None = None) -> dict:
    """Divide a cena em duas no instante `em_s` (padrão: meio). A nova cena nasce como título editável."""
    t = carregar_timeline(c)
    cena = _cena(t, cena_id)
    if em_s is None:
        em_s = (cena.render_start_s + cena.render_end_s) / 2
    if not (cena.render_start_s < em_s < cena.render_end_s):
        raise EdicaoInvalida("o ponto de corte precisa estar dentro da cena")
    nova = Cena(id="novo", indice=0, start_s=em_s, end_s=em_s, render_start_s=em_s, render_end_s=cena.render_end_s,
                texto="", segmentos_originais=list(cena.segmentos_originais))
    _mover_fronteira(cena, nova, em_s)
    texto = nova.texto[:120] or "Nova cena"
    nova.decisao = Decisao(template="TituloImpacto", props_semanticas=validar_dados("TituloImpacto", {"texto": texto}),
                           origem="manual", justificativa="cena adicionada manualmente", confianca=1.0)
    nova.revisao.editado_manualmente = True
    cena.revisao.editado_manualmente = True
    t.cenas.insert(t.cenas.index(cena) + 1, nova)
    _renumerar(t)
    _invalidar_render(t, *t.cenas)
    salvar_timeline(c, t)
    _apagar_previews(c)
    _reescrever_ao_vivo(c, t)
    return {"id": nova.id, "inicio": nova.render_start_s, "fim": nova.render_end_s}


def remover_cena(c: Caminhos, cena_id: str) -> dict:
    """Junta a cena à anterior (ou à seguinte, se for a primeira). O trecho de áudio continua."""
    t = carregar_timeline(c)
    cena = _cena(t, cena_id)
    if len(t.cenas) < 2:
        raise EdicaoInvalida("o vídeo precisa ter pelo menos uma cena")
    i = t.cenas.index(cena)
    dona = t.cenas[i - 1] if i > 0 else t.cenas[1]
    dona.palavras = sorted(dona.palavras + cena.palavras, key=lambda p: p.s)
    dona.render_start_s = min(dona.render_start_s, cena.render_start_s)
    dona.render_end_s = max(dona.render_end_s, cena.render_end_s)
    dona.segmentos_originais = sorted(set(dona.segmentos_originais + cena.segmentos_originais))
    _recalcular_fala(dona)
    dona.revisao.editado_manualmente = True
    t.cenas.remove(cena)
    _renumerar(t)
    _invalidar_render(t, *t.cenas)
    salvar_timeline(c, t)
    _apagar_previews(c)
    _reescrever_ao_vivo(c, t)
    return {"id": dona.id, "inicio": dona.render_start_s, "fim": dona.render_end_s}


def editar_cena(c: Caminhos, cena_id: str, template: str, dados: dict) -> dict:
    t = carregar_timeline(c)
    cena = _cena(t, cena_id)
    dados_ok = validar_dados(template, dados)
    cena.decisao = Decisao(template=template, props_semanticas=dados_ok, origem="manual",
                           justificativa="editado manualmente", confianca=1.0)
    cena.revisao.editado_manualmente = True
    _invalidar_render(t, cena)
    salvar_timeline(c, t)

    _apagar_previews(c, [cena.id])
    tela = _resumo_tela(roteiro.CenaRoteiro(inicio=cena.render_start_s, fim=cena.render_end_s,
                                            template=template, dados=dados_ok, origem="regra"))
    _atualizar_ao_vivo(c, cena, tela)
    return {"id": cena.id, "template": template, "dados": dados_ok, "tela": tela}


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _zoom_fit_por_proporcao(c: Caminhos, img: dict) -> float:
    """Calcula zoom para 'fit' alinhando bordas da mídia às bordas do frame."""
    try:
        projeto = carregar_projeto(c)
        formato = projeto.formato()
        frame_w = float(formato.largura)
        frame_h = float(formato.altura)
        meta = ffprobe(pasta_imagens(c) / str(img.get("arquivo", "")))
        stream_video = next((s for s in meta.get("streams", []) if s.get("codec_type") == "video"), {})
        media_w = float(stream_video.get("width") or 0)
        media_h = float(stream_video.get("height") or 0)
        if frame_w <= 0 or frame_h <= 0 or media_w <= 0 or media_h <= 0:
            return 1.0
        ar_frame = frame_w / frame_h
        ar_media = media_w / media_h
        if ar_frame <= 0 or ar_media <= 0:
            return 1.0
        zoom_fit = min(ar_media / ar_frame, ar_frame / ar_media)
        return round(_clamp(zoom_fit, 0.1, 1.0), 3)
    except Exception:
        return 1.0


def validar_fundo_override(c: Caminhos, fundo: dict | None) -> dict | None:
    if fundo is None:
        return None
    if not isinstance(fundo, dict):
        raise EdicaoInvalida("fundo inválido")
    midia = str(fundo.get("midia", "")).strip()
    if not midia:
        raise EdicaoInvalida("escolha uma mídia para o fundo")
    img = next((m for m in listar_imagens(c) if m.get("id") == midia), None)
    if not img:
        raise EdicaoInvalida(f"mídia '{midia}' não existe neste projeto")

    tipo_real = "video" if img.get("tipo") == "video" else "imagem"
    try:
        brilho = float(fundo.get("brilho", 1.0))
        contraste = float(fundo.get("contraste", 1.0))
        saturacao = float(fundo.get("saturacao", 1.0))
        desfoque_px = float(fundo.get("desfoque_px", 0.0))
        opacidade = float(fundo.get("opacidade", 1.0))
        escurecer = float(fundo.get("escurecer", 0.0))
        zoom = float(fundo.get("zoom", 1.0))
        posicao_x = float(fundo.get("posicao_x", 0.5))
        posicao_y = float(fundo.get("posicao_y", 0.5))
    except (TypeError, ValueError) as e:
        raise EdicaoInvalida("parâmetros de fundo inválidos") from e
    fit_mode = str(fundo.get("fit_mode", "cover") or "cover").strip().lower()
    if fit_mode not in {"cover", "contain", "fill", "fit"}:
        fit_mode = "cover"
    zoom_max = 1.0 if fit_mode == "fit" else 3.0
    if fit_mode == "fit":
        zoom = _zoom_fit_por_proporcao(c, img)

    return {
        "midia": midia,
        "tipo": tipo_real,
        "brilho": round(_clamp(brilho, 0.2, 2.5), 3),
        "contraste": round(_clamp(contraste, 0.2, 2.5), 3),
        "saturacao": round(_clamp(saturacao, 0.0, 3.0), 3),
        "desfoque_px": round(_clamp(desfoque_px, 0.0, 20.0), 2),
        "opacidade": round(_clamp(opacidade, 0.0, 1.0), 3),
        "escurecer": round(_clamp(escurecer, 0.0, 0.95), 3),
        "zoom": round(_clamp(zoom, 0.1, zoom_max), 3),
        "fit_mode": fit_mode,
        "posicao_x": round(_clamp(posicao_x, 0.0, 1.0), 3),
        "posicao_y": round(_clamp(posicao_y, 0.0, 1.0), 3),
        "blend_mode": str(fundo.get("blend_mode", "normal") or "normal"),
    }


def _normalizar_fundo_com_camadas(c: Caminhos, fundo: dict | None) -> dict | None:
    if fundo is None:
        return None
    if not isinstance(fundo, dict):
        raise EdicaoInvalida("fundo inválido")
    camadas_brutas = fundo.get("camadas")
    if isinstance(camadas_brutas, list) and camadas_brutas:
        camadas_ok = [validar_fundo_override(c, x) for x in camadas_brutas if isinstance(x, dict)]
        camadas_ok = [x for x in camadas_ok if x]
        if not camadas_ok:
            raise EdicaoInvalida("camadas de fundo inválidas")
        base = dict(camadas_ok[0])
        base["camadas"] = camadas_ok
        return base
    return validar_fundo_override(c, fundo)


def aplicar_fundo_em_cenas(c: Caminhos, cena_ids: list[str], fundo: dict | None) -> dict:
    t = carregar_timeline(c)
    ids_validos = {x.id for x in t.cenas}
    ids = [str(x) for x in cena_ids if str(x) in ids_validos]
    if not ids:
        raise EdicaoInvalida("selecione ao menos uma cena")
    fundo_ok = _normalizar_fundo_com_camadas(c, fundo)

    alteradas: list[Cena] = []
    for cena in t.cenas:
        if cena.id not in ids:
            continue
        cena.fundo_override = FundoOverride.model_validate(fundo_ok) if fundo_ok else None
        cena.revisao.editado_manualmente = True
        alteradas.append(cena)

    _invalidar_render(t, *alteradas)
    salvar_timeline(c, t)
    _apagar_previews(c, [x.id for x in alteradas])
    _reescrever_ao_vivo(c, t)
    return {
        "cenas": [x.id for x in alteradas],
        "fundo_override": fundo_ok,
        "acao": "removido" if fundo_ok is None else "aplicado",
    }


def _slug(txt: str) -> list[str]:
    base = unicodedata.normalize("NFKD", txt or "").encode("ascii", "ignore").decode().lower()
    return [t for t in re.split(r"[^a-z0-9]+", base) if len(t) >= 3]


def _score_midia(midia: dict, texto: str) -> int:
    a = set(_slug(texto))
    b = set(_slug((midia.get("nome") or "") + " " + (midia.get("descricao") or "") + " " + " ".join(midia.get("tags") or [])))
    return len(a & b)


def _fundo_padrao(midia_id: str) -> dict:
    return {
        "midia": midia_id,
        "brilho": 1.0,
        "contraste": 1.0,
        "saturacao": 1.0,
        "desfoque_px": 0.0,
        "opacidade": 1.0,
        "escurecer": 0.1,
        "zoom": 1.0,
        "posicao_x": 0.5,
        "posicao_y": 0.5,
    }


def _sugerir_fundos_regras(cenas: list[Cena], midias: list[dict]) -> list[dict]:
    grupos: dict[str, list[Cena]] = defaultdict(list)
    for c in cenas:
        tpl = c.decisao.template if c.decisao else ""
        if tpl in {"NumeroDestaque", "GraficoBarras", "GraficoPizza", "Planilha", "Timeline", "SetaTendencia", "ComparacaoDoisLados"}:
            grupos["Dados"].append(c)
        elif tpl in {"Pergunta", "TituloImpacto", "CTAFinal"}:
            grupos["Impacto"].append(c)
        else:
            grupos["Conteudo"].append(c)

    usadas: set[str] = set()
    saida: list[dict] = []
    for nome, cs in grupos.items():
        melhor = None
        melhor_score = -1
        texto = " ".join((c.texto or "") for c in cs)
        for m in midias:
            if m["id"] in usadas:
                continue
            s = _score_midia(m, texto)
            if s > melhor_score:
                melhor_score = s
                melhor = m
        if not melhor:
            continue
        usadas.add(melhor["id"])
        fundo = _fundo_padrao(melhor["id"])
        if nome == "Dados":
            fundo.update({"escurecer": 0.18, "desfoque_px": 1.0})
        elif nome == "Impacto":
            fundo.update({"contraste": 1.1, "saturacao": 1.1, "zoom": 1.05})
        saida.append({
            "nome": f"{nome} ({melhor.get('nome') or melhor['id']})",
            "cena_ids": [c.id for c in cs],
            "fundo": fundo,
        })
    return saida[:6]


def _validar_item_plano(item: dict, ids_validos: set[str], ids_midia: set[str]) -> dict | None:
    try:
        nome = str(item.get("nome", "")).strip()[:80]
        if not nome:
            return None
        cena_ids = [str(x) for x in item.get("cena_ids", []) if str(x) in ids_validos]
        if not cena_ids:
            return None
    except Exception:
        return None
    f = item.get("fundo") if isinstance(item.get("fundo"), dict) else item
    midia = str(f.get("midia", "")).strip()
    if midia not in ids_midia:
        return None
    try:
        fundo_out = {
            "midia": midia,
            "brilho": round(_clamp(float(f.get("brilho", 1.0)), 0.2, 2.5), 3),
            "contraste": round(_clamp(float(f.get("contraste", 1.0)), 0.2, 2.5), 3),
            "saturacao": round(_clamp(float(f.get("saturacao", 1.0)), 0.0, 3.0), 3),
            "desfoque_px": round(_clamp(float(f.get("desfoque_px", 0.0)), 0.0, 20.0), 2),
            "opacidade": round(_clamp(float(f.get("opacidade", 1.0)), 0.0, 1.0), 3),
            "escurecer": round(_clamp(float(f.get("escurecer", 0.1)), 0.0, 0.95), 3),
            "zoom": round(_clamp(float(f.get("zoom", 1.0)), 1.0, 2.0), 3),
            "posicao_x": round(_clamp(float(f.get("posicao_x", 0.5)), 0.0, 1.0), 3),
            "posicao_y": round(_clamp(float(f.get("posicao_y", 0.5)), 0.0, 1.0), 3),
        }
    except (TypeError, ValueError):
        return None
    return {"nome": nome, "cena_ids": cena_ids, "fundo": fundo_out}


def sugerir_plano_fundos(c: Caminhos) -> dict:
    t = carregar_timeline(c)
    cenas = list(t.cenas)
    midias = listar_imagens(c)
    if not cenas:
        raise EdicaoInvalida("não há cenas para sugerir fundo")
    if not midias:
        raise EdicaoInvalida("este projeto não tem mídias para fundo")

    ids_cena = {x.id for x in cenas}
    ids_midia = {m.get("id") for m in midias}
    itens: list[dict] = []
    modo = "regras"
    modelo = None

    if llm.disponivel():
        modelo = llm.escolher_modelo()
    if modelo:
        txt_cenas = "\n".join(
            f"- {cena.id}: {(cena.decisao.template if cena.decisao else 'Cena')} | {_tela(cena)[:120]}"
            for cena in cenas
        )
        txt_midias = "\n".join(
            f"- {m['id']}: {m.get('nome') or m['id']} | {m.get('descricao') or 'sem descricao'}"
            for m in midias
        )
        prompt = (
            "Monte um plano de fundos para video curto. "
            "Saida JSON estrita: {\"fundos\":[{\"nome\":\"...\",\"cena_ids\":[\"c001\"],\"fundo\":{\"midia\":\"id\",\"brilho\":1,\"contraste\":1,\"saturacao\":1,\"desfoque_px\":0,\"opacidade\":1,\"escurecer\":0.1,\"zoom\":1,\"posicao_x\":0.5,\"posicao_y\":0.5}}]}. "
            "Use de 1 a 6 fundos, cobrindo o maximo de cenas sem repetir cenas entre fundos. "
            "Use apenas IDs de cena e midia fornecidos.\n\n"
            f"CENAS:\n{txt_cenas}\n\nMIDIAS:\n{txt_midias}\n"
        )
        try:
            resp = llm.gerar_json(prompt, modelo, temperatura=0.2)
            brutos = resp.get("fundos") if isinstance(resp, dict) else None
            if isinstance(brutos, list):
                usados: set[str] = set()
                for b in brutos:
                    if not isinstance(b, dict):
                        continue
                    ok = _validar_item_plano(b, ids_cena, ids_midia)
                    if not ok:
                        continue
                    # evita sobreposição entre itens
                    ok["cena_ids"] = [cid for cid in ok["cena_ids"] if cid not in usados]
                    if not ok["cena_ids"]:
                        continue
                    usados.update(ok["cena_ids"])
                    itens.append(ok)
                    if len(itens) >= 6:
                        break
        except Exception:
            itens = []

    if itens:
        modo = "ia"
    else:
        itens = _sugerir_fundos_regras(cenas, midias)

    return {
        "modo": modo,
        "modelo": modelo if modo == "ia" else None,
        "itens": itens,
    }
