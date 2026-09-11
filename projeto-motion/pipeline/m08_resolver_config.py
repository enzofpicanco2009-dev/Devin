"""M08 — Resolve Default -> Canal -> Projeto em uma configuração única (DNA nunca é sobrescrito)."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

from .comum import CONFIG, sha256_obj
from .schemas.config import Canal, ConfigResolvida, Estilo, Projeto, Tema


def deep_merge(base: dict, extra: dict | None) -> dict:
    out = deepcopy(base)
    for k, v in (extra or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = deep_merge(out[k], v)
        elif v is not None:
            out[k] = deepcopy(v)
    return out


def _ler(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def resolver(projeto: Projeto) -> ConfigResolvida:
    canal_dir = CONFIG / "canais" / projeto.canal_id
    canal = Canal.model_validate(_ler(canal_dir / "canal.json"))

    estilo_dict = deep_merge(_ler(CONFIG / "defaults" / "estilo.json"), _ler(canal_dir / "estilo.json"))
    estilo_dict = deep_merge(estilo_dict, projeto.overrides.get("estilo"))
    estilo_dict.setdefault("id", canal.estilo_padrao)

    tema_dict = deep_merge(_ler(CONFIG / "defaults" / "tema.json"), _ler(canal_dir / "tema.json"))
    tema_dict = deep_merge(tema_dict, projeto.overrides.get("tema"))
    tema_dict.setdefault("id", canal.tema_padrao)

    estilo = Estilo.model_validate(estilo_dict)
    tema = Tema.model_validate(tema_dict)
    formato = projeto.formato()

    payload = {
        "canal": canal.model_dump(), "estilo": estilo.model_dump(),
        "tema": tema.model_dump(), "formato": formato.model_dump(),
    }
    return ConfigResolvida(canal=canal, estilo=estilo, tema=tema, formato=formato,
                           config_hash=sha256_obj(payload))
