"""Mídias do projeto (imagens e vídeos): `projetos/<id>/imagens/` + `imagens.json`
(id, arquivo, tipo, nome, tags, descricao). Entram por upload direto ou copiadas do banco
permanente (`biblioteca.py`) — só as vinculadas ao projeto são oferecidas à IA.

Para o Remotion enxergar os arquivos, `publicar_imagens` copia-os para `remotion/public/projetos/<id>/`
e o template recebe o caminho relativo a `public/` (usado com `staticFile`).
"""
from __future__ import annotations

import json
import re
import unicodedata
import shutil
from pathlib import Path

from .comum import REMOTION, Caminhos

EXT_IMAGEM = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}
EXT_VIDEO = {".mp4", ".webm", ".mov"}
EXTENSOES = EXT_IMAGEM | EXT_VIDEO
PUBLIC = REMOTION / "public"


def tipo_de(arquivo: str) -> str:
    return "video" if Path(arquivo).suffix.lower() in EXT_VIDEO else "imagem"


def pasta_imagens(c: Caminhos) -> Path:
    p = c.raiz / "imagens"
    p.mkdir(exist_ok=True)
    return p


def catalogo_path(c: Caminhos) -> Path:
    return pasta_imagens(c) / "imagens.json"


def id_de_nome(nome: str) -> str:
    base = unicodedata.normalize("NFKD", Path(nome).stem).encode("ascii", "ignore").decode().lower()
    base = re.sub(r"[^a-z0-9]+", "_", base).strip("_")
    return base or "imagem"


def listar_imagens(c: Caminhos) -> list[dict]:
    p = catalogo_path(c)
    if not p.exists():
        return []
    dados = json.loads(p.read_text(encoding="utf-8"))
    itens = [i for i in dados.get("imagens", []) if (pasta_imagens(c) / i["arquivo"]).exists()]
    for i in itens:
        i.setdefault("tipo", tipo_de(i["arquivo"]))
    return itens


def ids_por_tipo(midias: list[dict]) -> dict[str, str]:
    """id -> "imagem" | "video" (o que os validadores de roteiro usam)."""
    return {m["id"]: m.get("tipo") or tipo_de(m["arquivo"]) for m in midias}


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
    item = {"id": iid, "arquivo": arquivo, "tipo": tipo_de(arquivo), "nome": Path(nome_arquivo).stem,
            "tags": tags_limpas, "descricao": descricao.strip()}
    imagens.append(item)
    salvar_catalogo(c, imagens)
    return item


def vincular_da_biblioteca(c: Caminhos, midias: list[tuple[dict, Path]]) -> list[dict]:
    """Copia mídias do banco permanente (item do catálogo, caminho do arquivo) para o projeto,
    mantendo id, nome, descrição e tags."""
    atuais = listar_imagens(c)
    ids = {i["id"] for i in atuais}
    novos: list[dict] = []
    for m, origem in midias:
        if m["id"] in ids:
            continue
        shutil.copy2(origem, pasta_imagens(c) / m["arquivo"])
        item = {"id": m["id"], "arquivo": m["arquivo"], "tipo": m.get("tipo") or tipo_de(m["arquivo"]),
                "nome": m["nome"], "tags": list(m.get("tags", [])), "descricao": m.get("descricao", ""),
                "biblioteca": True}
        atuais.append(item)
        novos.append(item)
    salvar_catalogo(c, atuais)
    return novos


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
