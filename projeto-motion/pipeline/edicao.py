"""Edição manual de cenas: trocar template e/ou dados de uma cena já roteirizada.

A edição grava na timeline (fonte única de verdade) com origem "manual", invalida M12+ e atualiza o
`roteiro_ao_vivo.json` para a interface refletir a mudança sem esperar o re-render.
"""
from __future__ import annotations

import json

from pydantic import ValidationError

from . import roteiro
from .comum import Caminhos, carregar_timeline, salvar_timeline
from .m09_motor_decisao import _resumo_tela
from .schemas.timeline import Cena, Decisao, Timeline


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
        })
    return out


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
                        dados=cena.decisao.props_semanticas, editada=True)
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
