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


def editar_cena(c: Caminhos, cena_id: str, template: str, dados: dict) -> dict:
    t = carregar_timeline(c)
    cena = _cena(t, cena_id)
    dados_ok = validar_dados(template, dados)
    cena.decisao = Decisao(template=template, props_semanticas=dados_ok, origem="manual",
                           justificativa="editado manualmente", confianca=1.0)
    cena.revisao.editado_manualmente = True
    cena.props_finais = None
    cena.render.hash_props = None
    for etapa in ("m12", "m13", "m14"):
        if etapa in t.etapas_concluidas:
            t.etapas_concluidas.remove(etapa)
    salvar_timeline(c, t)

    for pasta in c.cache.glob("previews_*"):
        antigo = pasta / f"{cena.id}.jpg"
        if antigo.exists():
            antigo.unlink()
    tela = _resumo_tela(roteiro.CenaRoteiro(inicio=cena.render_start_s, fim=cena.render_end_s,
                                            template=template, dados=dados_ok, origem="regra"))
    _atualizar_ao_vivo(c, cena, tela)
    return {"id": cena.id, "template": template, "dados": dados_ok, "tela": tela}
