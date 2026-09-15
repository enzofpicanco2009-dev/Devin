"""Roteiro feito por uma IA de fora (ChatGPT, Gemini, Claude…), sem Ollama.

Fluxo: M01+M04 rodam → o usuário copia a transcrição minutada (ou o prompt inteiro, que já
inclui a transcrição) → cola em outra IA → cola o JSON devolvido aqui → M09 monta as cenas
com `_reconstruir`, exatamente como faria com a resposta do Ollama.

O formato é o mesmo do `roteiro.PROMPT`: {"cenas": [{"segmentos": [1, 2], "template": "...",
"dados": {...}, "por_que": "..."}]}. Os tempos continuam vindo do Whisper.
"""
from __future__ import annotations

import json
import re

from . import roteiro
from .canais import listar_canais
from .comum import Caminhos, carregar_projeto, carregar_timeline, salvar_timeline
from .imagens import listar_imagens
from .schemas.timeline import Cena, Timeline

ARQUIVO = "roteiro_externo.json"
_CERCA = re.compile(r"^\s*```(?:json)?\s*|\s*```\s*$", re.I)


class RoteiroExternoInvalido(ValueError):
    pass


def _descricao_canal(canal_id: str) -> str:
    for c in listar_canais():
        if c["id"] == canal_id:
            dna = c.get("dna") or {}
            partes = [c["nome"]]
            if dna.get("tom"):
                partes.append(f"tom {dna['tom']}")
            if dna.get("publico"):
                partes.append(f"público: {dna['publico']}")
            return "; ".join(partes)
    return "canal educativo"


def pacote(c: Caminhos) -> dict:
    """Transcrição minutada + prompt completo para colar em outra IA."""
    projeto = carregar_projeto(c)
    if not c.timeline_json.exists():
        return {"pronto": False}
    t = carregar_timeline(c)
    if not t.concluida("m04"):
        return {"pronto": False}
    cenas = _cenas_base(c, t)
    imagens = listar_imagens(c)
    transcricao = roteiro._transcricao_texto(cenas)
    prompt = roteiro.PROMPT.format(
        imagens=roteiro._imagens_texto(imagens),
        canal=_descricao_canal(projeto.canal_id),
        transcricao=transcricao,
    )
    return {
        "pronto": True,
        "pendente": not t.concluida("m09"),
        "transcricao": transcricao,
        "prompt": prompt,
        "trechos": len(roteiro.segmentos_falados(cenas)),
    }


def _cenas_base(c: Caminhos, t: Timeline) -> list[Cena]:
    """Cenas do M04 (antes de qualquer roteiro reagrupar), para a numeração dos trechos bater."""
    snapshot = c.cache / "cenas_m04.json"
    if t.concluida("m09") and snapshot.exists():
        return [Cena.model_validate(x) for x in json.loads(snapshot.read_text(encoding="utf-8"))]
    return t.cenas


def _extrair_json(texto: str) -> dict:
    limpo = _CERCA.sub("", texto.strip())
    if not limpo:
        raise RoteiroExternoInvalido("cole o JSON que a IA devolveu")
    try:
        return json.loads(limpo)
    except json.JSONDecodeError:
        ini, fim = limpo.find("{"), limpo.rfind("}")
        if ini < 0 or fim <= ini:
            raise RoteiroExternoInvalido("não encontrei um JSON válido no texto colado")
        try:
            return json.loads(limpo[ini:fim + 1])
        except json.JSONDecodeError as e:
            raise RoteiroExternoInvalido(f"JSON inválido: {e.msg} (linha {e.lineno})")


def validar(texto: str, cenas: list[Cena], imagens: list[dict]) -> list[roteiro.CenaRoteiro]:
    bruto = _extrair_json(texto)
    brutas = bruto.get("cenas") if isinstance(bruto, dict) else None
    if not isinstance(brutas, list) or not brutas:
        raise RoteiroExternoInvalido('o JSON precisa ter a lista "cenas"')
    ids_img = {i["id"] for i in imagens}
    n = len(roteiro.segmentos_falados(cenas))
    problemas: list[str] = []
    saida: list[roteiro.CenaRoteiro] = []
    usados: set[int] = set()
    for i, b in enumerate(brutas, start=1):
        v = roteiro.validar_cena(b, ids_img, n, log=lambda m: problemas.append(f"cena {i}: {m}")) \
            if isinstance(b, dict) else None
        if v is None:
            problemas.append(f"cena {i}: sem trechos válidos (\"segmentos\" deve listar números de 1 a {n})")
            continue
        v.segmentos = [s for s in v.segmentos if s not in usados]
        if not v.segmentos:
            problemas.append(f"cena {i}: trechos já usados por outra cena")
            continue
        usados.update(v.segmentos)
        saida.append(v)
    if not saida:
        raise RoteiroExternoInvalido("nenhuma cena aproveitável. " + "; ".join(problemas)[:400])
    saida.sort(key=lambda c: c.segmentos[0])
    return saida


def aplicar(c: Caminhos, texto: str) -> dict:
    """Valida, grava o roteiro no projeto, marca o provedor como 'externo' e reabre o M09."""
    t = carregar_timeline(c)
    if not t.concluida("m04"):
        raise RoteiroExternoInvalido("transcreva o áudio antes de colar o roteiro")
    cenas = _cenas_base(c, t)
    rot = validar(texto, cenas, listar_imagens(c))

    (c.raiz / "entrada" / ARQUIVO).write_text(
        json.dumps({"cenas": [r.model_dump() for r in rot]}, ensure_ascii=False, indent=2), encoding="utf-8")

    dados = json.loads(c.projeto_json.read_text(encoding="utf-8"))
    dados.setdefault("decisao", {})
    dados["decisao"].update(provedor="externo", template_fixo=None)
    c.projeto_json.write_text(json.dumps(dados, ensure_ascii=False, indent=2), encoding="utf-8")

    t.cenas = cenas
    for etapa in ("m09", "m12", "m13", "m14"):
        if etapa in t.etapas_concluidas:
            t.etapas_concluidas.remove(etapa)
    salvar_timeline(c, t)
    return {"cenas": len(rot), "trechos": len(roteiro.segmentos_falados(cenas))}


def carregar(c: Caminhos) -> list[roteiro.CenaRoteiro]:
    arq = c.raiz / "entrada" / ARQUIVO
    if not arq.exists():
        raise RoteiroExternoInvalido("nenhum roteiro colado neste projeto")
    bruto = json.loads(arq.read_text(encoding="utf-8"))
    return [roteiro.CenaRoteiro.model_validate(x) for x in bruto["cenas"]]
