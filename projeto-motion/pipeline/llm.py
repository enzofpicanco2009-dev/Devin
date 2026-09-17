"""Cliente mínimo para LLM local via Ollama (HTTP, sem dependências extras)."""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
MODELO_PADRAO = os.environ.get("OLLAMA_MODELO", "qwen2.5:7b")


def _get(path: str, timeout: float = 2.0):
    with urllib.request.urlopen(f"{OLLAMA_URL}{path}", timeout=timeout) as r:
        return json.load(r)


def disponivel() -> bool:
    try:
        _get("/api/tags")
        return True
    except (urllib.error.URLError, OSError, ValueError):
        return False


def modelos_instalados() -> list[str]:
    try:
        return [m["name"] for m in _get("/api/tags").get("models", [])]
    except (urllib.error.URLError, OSError, ValueError, KeyError):
        return []


def escolher_modelo(preferido: str | None = None) -> str | None:
    """Devolve o modelo a usar: o preferido se instalado, senão o primeiro disponível."""
    inst = modelos_instalados()
    if not inst:
        return None
    for cand in (preferido, MODELO_PADRAO):
        if cand and any(m == cand or m.split(":")[0] == cand for m in inst):
            return next(m for m in inst if m == cand or m.split(":")[0] == cand)
    return inst[0]


def gerar_json(prompt: str, modelo: str, temperatura: float = 0.3, num_ctx: int = 8192,
               timeout: float = 900) -> dict:
    corpo = {
        "model": modelo,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {"temperature": temperatura, "num_ctx": num_ctx},
    }
    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/generate",
        data=json.dumps(corpo).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        resposta = json.load(r)["response"]
    return json.loads(resposta)
