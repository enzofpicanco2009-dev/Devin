"""Criação e listagem de projetos (usado pela CLI e pela interface web)."""
from __future__ import annotations

import json
import re
import shutil
import unicodedata
from pathlib import Path

from .comum import ID_PROJETO_RE, PROJETOS

FORMATOS = {
    "16x9": {"id": "16x9", "largura": 1920, "altura": 1080, "fps": 30, "plataforma": "youtube"},
    "9x16": {"id": "9x16", "largura": 1080, "altura": 1920, "fps": 30, "plataforma": "shorts"},
    "1x1": {"id": "1x1", "largura": 1080, "altura": 1080, "fps": 30, "plataforma": "instagram"},
}
EXTENSOES_AUDIO = {".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac", ".opus", ".mp4", ".webm"}


def gerar_id(titulo: str) -> str:
    base = unicodedata.normalize("NFKD", titulo).encode("ascii", "ignore").decode()
    base = re.sub(r"[^A-Za-z0-9]+", "_", base).strip("_").lower()[:40] or "video"
    if not base[0].isalnum():
        base = "v" + base
    candidato, n = base, 2
    while (PROJETOS / candidato).exists():
        candidato, n = f"{base}_{n}", n + 1
    assert ID_PROJETO_RE.match(candidato)
    return candidato


def criar_projeto(
    projeto_id: str,
    audio: Path | None,
    canal: str = "canal_exemplo",
    titulo: str | None = None,
    modelo: str = "small",
    formatos: list[str] | None = None,
    tema_id: str | None = None,
    estilo_id: str | None = None,
    formato_principal: str | None = None,
    overrides_tema: dict | None = None,
    usar_ia: bool = True,
    roteiro_externo: bool = False,
) -> Path:
    if not ID_PROJETO_RE.match(projeto_id):
        raise ValueError(f"ID de projeto inválido: {projeto_id!r}")
    raiz = PROJETOS / projeto_id
    if raiz.exists():
        raise FileExistsError(f"Projeto já existe: {raiz}")
    formatos = formatos or ["16x9", "9x16"]
    desconhecidos = [f for f in formatos if f not in FORMATOS]
    if desconhecidos:
        raise ValueError(f"Formatos desconhecidos: {desconhecidos}")

    (raiz / "entrada").mkdir(parents=True)
    ext = audio.suffix.lower() if audio else ".wav"
    if ext not in EXTENSOES_AUDIO:
        shutil.rmtree(raiz)
        raise ValueError(f"Extensão de áudio não suportada: {ext}")
    audio_nome = f"audio{ext}"
    if audio:
        shutil.copy(audio, raiz / "entrada" / audio_nome)

    projeto = {
        "schema_version": 1,
        "id": projeto_id,
        "canal_id": canal,
        "titulo_trabalho": titulo or projeto_id,
        "entrada": {"audio": f"entrada/{audio_nome}", "idioma": "pt"},
        "formatos": [FORMATOS[f] for f in formatos],
        "formato_principal": formato_principal or formatos[0],
        "tema_id": tema_id,
        "estilo_id": estilo_id,
        "transcricao": {"modelo": modelo},
        "overrides": {"tema": overrides_tema} if overrides_tema else {},
        "decisao": {"provedor": "externo" if roteiro_externo else ("ollama" if usar_ia else "nenhum"),
                    "template_fixo": None},
    }
    (raiz / "projeto.json").write_text(json.dumps(projeto, ensure_ascii=False, indent=2), encoding="utf-8")
    return raiz


def listar_projetos() -> list[dict]:
    saida = []
    for p in sorted(PROJETOS.glob("*/projeto.json"), key=lambda p: p.stat().st_mtime, reverse=True):
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        finais = {f["id"]: (p.parent / "saida" / f"final_{f['id']}.mp4").exists() for f in d["formatos"]}
        saida.append({"id": d["id"], "titulo": d.get("titulo_trabalho", d["id"]), "canal_id": d.get("canal_id"),
                      "tema_id": d.get("tema_id"), "estilo_id": d.get("estilo_id"),
                      "formatos": finais, "criado_em": p.stat().st_mtime})
    return saida
