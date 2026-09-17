"""Imagens do projeto: `projetos/<id>/imagens/` + `imagens.json` (id, arquivo, nome, tags, descricao).

Para o Remotion enxergar os arquivos, `publicar_imagens` copia-os para `remotion/public/projetos/<id>/`
e o template recebe o caminho relativo a `public/` (usado com `staticFile`).
"""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

from .comum import REMOTION, Caminhos

EXTENSOES = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}
PUBLIC = REMOTION / "public"


def pasta_imagens(c: Caminhos) -> Path:
    p = c.raiz / "imagens"
    p.mkdir(exist_ok=True)
    return p


def catalogo_path(c: Caminhos) -> Path:
    return pasta_imagens(c) / "imagens.json"


def id_de_nome(nome: str) -> str:
    base = Path(nome).stem.lower()
    base = re.sub(r"[^a-z0-9]+", "_", base).strip("_")
    return base or "imagem"


def listar_imagens(c: Caminhos) -> list[dict]:
    p = catalogo_path(c)
    if not p.exists():
        return []
    dados = json.loads(p.read_text(encoding="utf-8"))
    return [i for i in dados.get("imagens", []) if (pasta_imagens(c) / i["arquivo"]).exists()]


def salvar_catalogo(c: Caminhos, imagens: list[dict]) -> None:
    catalogo_path(c).write_text(json.dumps({"imagens": imagens}, ensure_ascii=False, indent=2), encoding="utf-8")


def adicionar_imagem(c: Caminhos, nome_arquivo: str, conteudo: bytes, tags: list[str] | None = None,
                     descricao: str = "") -> dict:
    ext = Path(nome_arquivo).suffix.lower()
    if ext not in EXTENSOES:
        raise ValueError(f"extensão não suportada: {ext}")
    imagens = listar_imagens(c)
    ids = {i["id"] for i in imagens}
    base = id_de_nome(nome_arquivo)
    iid, n = base, 2
    while iid in ids:
        iid, n = f"{base}_{n}", n + 1
    arquivo = f"{iid}{ext}"
    (pasta_imagens(c) / arquivo).write_bytes(conteudo)
    tags_limpas = sorted({t.strip().lower() for t in (tags or []) if t.strip()})
    item = {"id": iid, "arquivo": arquivo, "nome": Path(nome_arquivo).stem,
            "tags": tags_limpas, "descricao": descricao.strip()}
    imagens.append(item)
    salvar_catalogo(c, imagens)
    return item


def remover_imagem(c: Caminhos, iid: str) -> bool:
    imagens = listar_imagens(c)
    restantes = [i for i in imagens if i["id"] != iid]
    if len(restantes) == len(imagens):
        return False
    for i in imagens:
        if i["id"] == iid:
            (pasta_imagens(c) / i["arquivo"]).unlink(missing_ok=True)
    salvar_catalogo(c, restantes)
    return True


def publicar_imagens(c: Caminhos) -> dict[str, str]:
    """Copia as imagens para `remotion/public/projetos/<id>/`; devolve id -> caminho relativo a public/."""
    destino = PUBLIC / "projetos" / c.raiz.name
    destino.mkdir(parents=True, exist_ok=True)
    mapa: dict[str, str] = {}
    for i in listar_imagens(c):
        src = pasta_imagens(c) / i["arquivo"]
        dst = destino / i["arquivo"]
        if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
            shutil.copy2(src, dst)
        mapa[i["id"]] = f"projetos/{c.raiz.name}/{i['arquivo']}"
    return mapa
