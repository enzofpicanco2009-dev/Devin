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


def listar_presets(tipo: str) -> list[dict]:
    """tipo: 'temas' | 'estilos'. Retorna os JSONs de config/<tipo>/ ordenados por nome."""
    itens = [_ler(p) for p in sorted((CONFIG / tipo).glob("*.json"))]
    return sorted(itens, key=lambda d: d.get("nome", d.get("id", "")))


def _preset(tipo: str, preset_id: str) -> dict:
    p = CONFIG / tipo / f"{preset_id}.json"
    if not p.exists():
        raise ValueError(f"{tipo[:-1]} '{preset_id}' não existe em {CONFIG / tipo}")
    return _ler(p)


def resolver(projeto: Projeto) -> ConfigResolvida:
    """Ordem: defaults → preset (escolhido no projeto ou padrão do canal) → ajustes do canal → overrides do projeto."""
    canal_dir = CONFIG / "canais" / projeto.canal_id
    canal = Canal.model_validate(_ler(canal_dir / "canal.json"))

    estilo_dict = deep_merge(_ler(CONFIG / "defaults" / "estilo.json"),
                             _preset("estilos", projeto.estilo_id or canal.estilo_padrao))
    estilo_dict = deep_merge(estilo_dict, _ler(canal_dir / "estilo.json"))
    estilo_dict = deep_merge(estilo_dict, projeto.overrides.get("estilo"))

    tema_dict = deep_merge(_ler(CONFIG / "defaults" / "tema.json"),
                           _preset("temas", projeto.tema_id or canal.tema_padrao))
    tema_dict = deep_merge(tema_dict, _ler(canal_dir / "tema.json"))
    tema_dict = deep_merge(tema_dict, projeto.overrides.get("tema"))

    estilo = Estilo.model_validate(estilo_dict)
    tema = Tema.model_validate(tema_dict)
    formato = projeto.formato()

    payload = {
        "canal": canal.model_dump(), "estilo": estilo.model_dump(),
        "tema": tema.model_dump(), "formato": formato.model_dump(),
    }
    return ConfigResolvida(canal=canal, estilo=estilo, tema=tema, formato=formato,
                           config_hash=sha256_obj(payload))
