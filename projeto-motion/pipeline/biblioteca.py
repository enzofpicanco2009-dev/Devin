"""Banco permanente de imagens e vídeos: `biblioteca/midias/` + `biblioteca.json`.

Cada mídia tem id, arquivo, tipo (imagem|video), nome, descricao e tags. Nome e descrição são
obrigatórios: a descrição é o que a IA lê para saber o que a mídia mostra. Ao criar um projeto,
as mídias escolhidas são copiadas para `projetos/<id>/imagens/` (ver `imagens.vincular_da_biblioteca`).
"""
from __future__ import annotations

import json
from pathlib import Path

from .comum import RAIZ, Caminhos
from .imagens import EXT_IMAGEM, EXT_VIDEO, id_de_nome, tipo_de, vincular_da_biblioteca

PASTA = RAIZ / "biblioteca" / "midias"
CATALOGO = RAIZ / "biblioteca" / "biblioteca.json"
EXTENSOES = EXT_IMAGEM | EXT_VIDEO


def _pasta() -> Path:
    PASTA.mkdir(parents=True, exist_ok=True)
    return PASTA


def listar() -> list[dict]:
    if not CATALOGO.exists():
        return []
    dados = json.loads(CATALOGO.read_text(encoding="utf-8"))
    return [m for m in dados.get("midias", []) if (_pasta() / m["arquivo"]).exists()]


def _salvar(midias: list[dict]) -> None:
    CATALOGO.parent.mkdir(parents=True, exist_ok=True)
    CATALOGO.write_text(json.dumps({"midias": midias}, ensure_ascii=False, indent=2), encoding="utf-8")


def _limpar_tags(tags: list[str] | None) -> list[str]:
    return sorted({t.strip().lower() for t in (tags or []) if t.strip()})


def obter(mid: str) -> dict | None:
    return next((m for m in listar() if m["id"] == mid), None)


def caminho(m: dict) -> Path:
    return _pasta() / m["arquivo"]


def adicionar(nome_arquivo: str, conteudo: bytes, nome: str, descricao: str,
              tags: list[str] | None = None) -> dict:
    ext = Path(nome_arquivo).suffix.lower()
    if ext not in EXTENSOES:
        raise ValueError(f"extensão não suportada: {ext}")
    nome, descricao = nome.strip(), descricao.strip()
    if not nome:
        raise ValueError("a mídia precisa de um nome")
    if not descricao:
        raise ValueError("a mídia precisa de uma descrição (é o que a IA lê)")
    midias = listar()
    ids = {m["id"] for m in midias}
    base = id_de_nome(nome)
    mid, n = base, 2
    while mid in ids:
        mid, n = f"{base}_{n}", n + 1
    arquivo = f"{mid}{ext}"
    (_pasta() / arquivo).write_bytes(conteudo)
    item = {"id": mid, "arquivo": arquivo, "tipo": tipo_de(arquivo), "nome": nome,
            "descricao": descricao, "tags": _limpar_tags(tags)}
    midias.append(item)
    _salvar(midias)
    return item


def atualizar(mid: str, nome: str | None = None, descricao: str | None = None,
              tags: list[str] | None = None) -> dict:
    midias = listar()
    item = next((m for m in midias if m["id"] == mid), None)
    if not item:
        raise KeyError(mid)
    if nome is not None:
        if not nome.strip():
            raise ValueError("a mídia precisa de um nome")
        item["nome"] = nome.strip()
    if descricao is not None:
        if not descricao.strip():
            raise ValueError("a mídia precisa de uma descrição (é o que a IA lê)")
        item["descricao"] = descricao.strip()
    if tags is not None:
        item["tags"] = _limpar_tags(tags)
    _salvar(midias)
    return item


def vincular(c: Caminhos, ids: list[str]) -> list[dict]:
    """Copia as mídias `ids` do banco para o projeto. Ids desconhecidos levantam KeyError."""
    por_id = {m["id"]: m for m in listar()}
    faltando = [i for i in ids if i not in por_id]
    if faltando:
        raise KeyError(", ".join(faltando))
    return vincular_da_biblioteca(c, [(por_id[i], caminho(por_id[i])) for i in dict.fromkeys(ids)])


def remover(mid: str) -> bool:
    midias = listar()
    restantes = [m for m in midias if m["id"] != mid]
    if len(restantes) == len(midias):
        return False
    for m in midias:
        if m["id"] == mid:
            caminho(m).unlink(missing_ok=True)
    _salvar(restantes)
    return True
