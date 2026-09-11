"""M09 — Motor de decisão. MVP: template fixo para todas as cenas (sem LLM).

A interface já é a definitiva: cada cena recebe `Decisao(template, props_semanticas, origem)`.
Provedores LLM (ollama/openai/anthropic) serão plugados aqui na fase 2 sem alterar outros módulos.
"""
from __future__ import annotations

import json

from .comum import CATALOGO, Caminhos, carregar_projeto, carregar_timeline, salvar_timeline
from .schemas.timeline import Cena, Decisao

ETAPA = "m09"
TEMPLATE_PREENCHIMENTO = "TituloImpacto"


def carregar_catalogo() -> dict:
    return json.loads((CATALOGO / "templates.json").read_text(encoding="utf-8"))


def decidir_fixo(cena: Cena, template: str) -> Decisao:
    if cena.preenchimento:
        return Decisao(template=TEMPLATE_PREENCHIMENTO, props_semanticas={"texto": ""}, origem="regra",
                       justificativa="silêncio longo — tela de fundo")
    return Decisao(template=template, props_semanticas={"texto": cena.texto, "enfase": "media"},
                   origem="fixo")


def executar(projeto_id: str, force: bool = False) -> None:
    c = Caminhos(projeto_id)
    projeto = carregar_projeto(c)
    t = carregar_timeline(c)
    if not t.concluida("m04"):
        raise RuntimeError("m04 não concluída")
    if t.concluida(ETAPA) and not force:
        print(f"[{ETAPA}] já concluída (use --force para refazer)")
        return

    catalogo = carregar_catalogo()
    ids_impl = {x["id"] for x in catalogo["templates"] if x.get("status") == "implementado"}

    template = projeto.decisao.template_fixo
    if projeto.decisao.provedor != "nenhum" and not template:
        raise NotImplementedError("Motor de decisão com LLM ainda não implementado (fase 2). "
                                  "Defina decisao.template_fixo no projeto.json.")
    if template not in ids_impl:
        raise ValueError(f"template_fixo '{template}' não está implementado. Disponíveis: {sorted(ids_impl)}")

    historico: dict[str, int] = {}
    for cena in t.cenas:
        if cena.revisao.bloqueada and cena.decisao:
            continue
        cena.decisao = decidir_fixo(cena, template)
        historico[cena.decisao.template] = historico.get(cena.decisao.template, 0) + 1

    t.historico_templates = historico
    for etapa in ("m12", "m13", "m14"):
        if etapa in t.etapas_concluidas:
            t.etapas_concluidas.remove(etapa)
    t.marcar(ETAPA)
    salvar_timeline(c, t)
    print(f"[{ETAPA}] decisões: {historico} (origem: fixo)")
