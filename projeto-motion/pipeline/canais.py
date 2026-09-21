"""Canais como preset: `config/canais/<id>/canal.json` (+ tema.json/estilo.json com ajustes do canal).

Um canal guarda o DNA (tom, público, CTA) e o design padrão (tema, estilo, paleta e fonte).
Todo projeto aponta para um canal e herda esse design, podendo sobrescrever por vídeo.
"""
from __future__ import annotations

import json
import re
import unicodedata

from .comum import CONFIG
from .schemas.config import Canal, Cores

CANAIS = CONFIG / "canais"

# paletas prontas (a LLM nunca escolhe hex; o usuário escolhe uma destas ou um tema)
PALETAS: list[dict] = [
    {"id": "dourado", "nome": "Dourado", "cores": {"fundo": "#0D0D0D", "fundo_secundario": "#1A1A1A",
     "texto": "#FFFFFF", "texto_secundario": "#B3B3B3", "destaque": "#F5C042", "destaque_2": "#42A5F5"}},
    {"id": "oceano", "nome": "Oceano", "cores": {"fundo": "#07162B", "fundo_secundario": "#0E2444",
     "texto": "#F2F7FF", "texto_secundario": "#9DB3D1", "destaque": "#2EC4F1", "destaque_2": "#F9A826"}},
    {"id": "floresta", "nome": "Floresta", "cores": {"fundo": "#0B1F17", "fundo_secundario": "#143327",
     "texto": "#F1FAF5", "texto_secundario": "#A3C9B6", "destaque": "#5BE49B", "destaque_2": "#F6D365"}},
    {"id": "vinho", "nome": "Vinho", "cores": {"fundo": "#1C0A12", "fundo_secundario": "#2E1220",
     "texto": "#FFF4F7", "texto_secundario": "#D0A5B5", "destaque": "#FF5C8A", "destaque_2": "#FFC857"}},
    {"id": "neon", "nome": "Neon", "cores": {"fundo": "#0B1020", "fundo_secundario": "#151C33",
     "texto": "#EAF2FF", "texto_secundario": "#9AA7C7", "destaque": "#00E5FF", "destaque_2": "#A855F7"}},
    {"id": "papel", "nome": "Papel", "cores": {"fundo": "#FAF7F0", "fundo_secundario": "#EFE9DC",
     "texto": "#1B1B1B", "texto_secundario": "#6B6560", "destaque": "#C0392B", "destaque_2": "#2C6E9B"}},
    {"id": "branco", "nome": "Branco", "cores": {"fundo": "#FFFFFF", "fundo_secundario": "#F2F4F7",
     "texto": "#111827", "texto_secundario": "#6B7280", "destaque": "#2563EB", "destaque_2": "#F59E0B"}},
    {"id": "laranja", "nome": "Laranja", "cores": {"fundo": "#141414", "fundo_secundario": "#222222",
     "texto": "#FFFFFF", "texto_secundario": "#BDBDBD", "destaque": "#FF7A00", "destaque_2": "#00C2A8"}},
]

# famílias com fallback: funcionam sem internet no Chrome do Remotion
FONTES: list[dict] = [
    {"id": "inter", "nome": "Inter", "familia": "Inter, Arial, Liberation Sans, sans-serif", "peso": 800},
    {"id": "grotesk", "nome": "Space Grotesk", "familia": "Space Grotesk, Inter, Arial, sans-serif", "peso": 700},
    {"id": "condensada", "nome": "Condensada", "familia": "Arial Narrow, Liberation Sans Narrow, Inter, sans-serif",
     "peso": 800},
    {"id": "serifada", "nome": "Serifada", "familia": "Georgia, Liberation Serif, Times New Roman, serif", "peso": 700},
    {"id": "mono", "nome": "Mono", "familia": "JetBrains Mono, Liberation Mono, Courier New, monospace", "peso": 700},
    {"id": "sistema", "nome": "Sistema", "familia": "system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
     "peso": 800},
    # Manuscritas e cursivas
    {"id": "script", "nome": "Script Elegante", "familia": "Brush Script MT, Lucida Handwriting, cursive", "peso": 400},
    {"id": "handwriting", "nome": "Manuscrita", "familia": "Segoe Print, Lucida Handwriting, Comic Sans MS, cursive", "peso": 600},
    {"id": "calligraphy", "nome": "Caligrafia", "familia": "Palatino Linotype, Palatino, Garamond, serif", "peso": 700},
    {"id": "comic", "nome": "Informal", "familia": "Comic Sans MS, Chalkboard SE, Bradley Hand, cursive", "peso": 600},
    {"id": "cursiva_formal", "nome": "Cursiva Formal", "familia": "Edwardian Script ITC, Lucida Handwriting, cursive", "peso": 400},
    {"id": "brush", "nome": "Pincel", "familia": "Brush Script MT, Lucida Calligraphy, cursive", "peso": 600},
    {"id": "gothic", "nome": "Gothic", "familia": "Blackadder ITC, Old English Text, serif", "peso": 700},
    {"id": "decorativa", "nome": "Decorativa", "familia": "Impact, Charcoal, sans-serif", "peso": 900},
]


def _ler(p) -> dict:
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}


def id_de_nome(nome: str) -> str:
    base = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode()
    base = re.sub(r"[^A-Za-z0-9]+", "_", base).strip("_").lower()[:40] or "canal"
    cand, n = base, 2
    while (CANAIS / cand).exists():
        cand, n = f"{base}_{n}", n + 1
    return cand


def listar_canais() -> list[dict]:
    saida = []
    for d in sorted(CANAIS.iterdir()):
        if not (d / "canal.json").exists():
            continue
        canal = Canal.model_validate(_ler(d / "canal.json"))
        tema = _ler(d / "tema.json")
        saida.append({
            **canal.model_dump(),
            "paleta_id": tema.get("paleta_id"),
            "fonte_id": tema.get("fonte_id"),
            "cores": tema.get("cores"),
        })
    return saida


def overrides_design(paleta_id: str | None, fonte_id: str | None) -> dict:
    """Converte escolhas de paleta/fonte em overrides de tema (cores + tipografia)."""
    out: dict = {}
    if paleta_id:
        pal = next((p for p in PALETAS if p["id"] == paleta_id), None)
        if not pal:
            raise ValueError(f"paleta desconhecida: {paleta_id}")
        Cores.model_validate({**Cores().model_dump(), **pal["cores"]})
        out["cores"] = pal["cores"]
        out["paleta_id"] = paleta_id
    if fonte_id:
        f = next((x for x in FONTES if x["id"] == fonte_id), None)
        if not f:
            raise ValueError(f"fonte desconhecida: {fonte_id}")
        out["tipografia"] = {
            "fonte_titulo": {"familia": f["familia"], "peso": f["peso"]},
            "fonte_numero": {"familia": f["familia"], "peso": f["peso"]},
            "fonte_corpo": {"familia": f["familia"], "peso": 500},
        }
        out["fonte_id"] = fonte_id
    return out


def criar_canal(
    nome: str,
    tema_padrao: str = "tema_escuro_dourado",
    estilo_padrao: str = "estilo_didatico",
    publico: str = "",
    tom: str = "direto",
    cta: str = "",
    paleta_id: str | None = None,
    fonte_id: str | None = None,
) -> dict:
    nome = nome.strip()
    if not nome:
        raise ValueError("nome do canal vazio")
    if not (CONFIG / "temas" / f"{tema_padrao}.json").exists():
        raise ValueError(f"tema '{tema_padrao}' não existe")
    if not (CONFIG / "estilos" / f"{estilo_padrao}.json").exists():
        raise ValueError(f"estilo '{estilo_padrao}' não existe")
    cid = id_de_nome(nome)
    canal = Canal(id=cid, nome=nome, tema_padrao=tema_padrao, estilo_padrao=estilo_padrao)
    canal.dna.publico = publico.strip()
    canal.dna.tom = tom.strip() or "direto"
    canal.dna.cta_padrao = cta.strip()
    pasta = CANAIS / cid
    pasta.mkdir(parents=True)
    (pasta / "canal.json").write_text(canal.model_dump_json(indent=2), encoding="utf-8")
    design = overrides_design(paleta_id, fonte_id)
    if design:
        (pasta / "tema.json").write_text(json.dumps(design, ensure_ascii=False, indent=2), encoding="utf-8")
    return listar_canais()[[c["id"] for c in listar_canais()].index(cid)]
