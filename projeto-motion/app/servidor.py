"""Interface web local: enviar áudio, escolher design e gerar o vídeo.

    .venv/bin/python -m app            # http://localhost:8000
"""
from __future__ import annotations

from copy import deepcopy
import json
import re
import os
import subprocess
import sys
import tempfile
import threading
import unicodedata
from pathlib import Path
from typing import Optional

from fastapi import Body, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.background import BackgroundTask

from pipeline import biblioteca, llm, roteiro, roteiro_externo
from pipeline.canais import FONTES, PALETAS, criar_canal, excluir_canal, listar_canais, overrides_design
from pipeline.comum import CONFIG, PROJETOS, RAIZ, Caminhos, carregar_projeto, rodar
from pipeline.edicao import (EdicaoInvalida, ajustar_tempos, aplicar_fundo_em_cenas, cenas_editaveis,
                             dividir_cena, editar_cena, remover_cena, sugerir_plano_fundos)
from pipeline.imagens import EXTENSOES as EXT_MIDIA
from pipeline.imagens import adicionar_imagem, listar_imagens, pasta_imagens, remover_imagem
from pipeline.imagens import adicionar_imagem, atualizar_imagem, listar_imagens, pasta_imagens, remover_imagem
from pipeline.m08_resolver_config import listar_presets
from pipeline.m09_motor_decisao import carregar_catalogo
from pipeline.m13_renderizar import pasta_previews
from pipeline.projetos import FORMATOS, criar_projeto, excluir_projeto, gerar_id, listar_projetos
from pipeline.schemas.config import Tema

app = FastAPI(title="Motion Studio")
ESTATICO = Path(__file__).parent / "static"

ETAPAS = [
    ("m01", "Transcrevendo o áudio"),
    ("m04", "Dividindo em cenas"),
    ("m09", "Escrevendo o roteiro visual"),
    ("m12", "Aplicando o design"),
    ("m13", "Renderizando"),
    ("m14", "Juntando com o áudio"),
]
_LINHA_ETAPA = re.compile(r"^\[(m\d\d)\]")
_LINHAS_RENDER_FRAMES = (
    re.compile(r"\b(?:frame|frames)\s*[: ]\s*(\d+)\s*/\s*(\d+)\b", re.IGNORECASE),
    re.compile(r"\b(\d+)\s*/\s*(\d+)\s*frames?\b", re.IGNORECASE),
    re.compile(r"\bframe\s+(\d+)\s+of\s+(\d+)\b", re.IGNORECASE),
    re.compile(r"\brender(?:ed|ing)?\s+(\d+)\s*/\s*(\d+)\b", re.IGNORECASE),
)
_ETAPA_IDX = {eid: i for i, (eid, _) in enumerate(ETAPAS)}
_ETAPA_NOME = dict(ETAPAS)
IDIOMAS = {"auto", "pt", "en", "es", "fr", "it", "de", "ja"}

# projeto_id -> estado do job em andamento/concluído (memória do processo)
_jobs: dict[str, dict] = {}
_lock = threading.Lock()
_MAX_LOG_LINHAS = 1200
_FILA_DIR = PROJETOS / "_fila"
_fila_job: dict = {
    "estado": "ocioso",
    "tipo": None,
    "pendentes": [],
    "concluidos": [],
    "falhas": [],
    "erro": None,
    "log": [],
}


def _novo_job(formatos: list[str]) -> dict:
    return {
        "estado": "rodando",
        "etapa": None,
        "formato_atual": None,
        "formatos": formatos,
        "prontos": [],
        "render_frames_atual": 0,
        "render_frames_total": 0,
        "log": [],
        "erro": None,
    }


def _append_log(job: dict, linha: str) -> None:
    log = job["log"]
    log.append(linha)
    if len(log) > _MAX_LOG_LINHAS:
        del log[:-_MAX_LOG_LINHAS]


def _capturar_frames_render(linha: str) -> tuple[int, int] | None:
    for rgx in _LINHAS_RENDER_FRAMES:
        m = rgx.search(linha)
        if not m:
            continue
        atual = int(m.group(1))
        total = int(m.group(2))
        if total <= 0:
            continue
        if atual < 0 or atual > total * 2:
            continue
        return min(atual, total), total
    return None


def _resumo_progresso(job: Optional[dict], formatos_totais: int, prontos_disco: list[str],
                      aguardando_roteiro: bool = False) -> dict:
    etapas_total = len(ETAPAS)
    formatos_total = max(1, int(formatos_totais or 1))
    unidades_total = etapas_total * formatos_total

    if job:
        formatos_concluidos = min(formatos_total, max(len(prontos_disco), len(job.get("prontos", []))))
        estado = str(job.get("estado") or "novo")
        etapa_id = job.get("etapa")
        frames_atual = int(job.get("render_frames_atual") or 0)
        frames_total = int(job.get("render_frames_total") or 0)
    else:
        formatos_concluidos = min(formatos_total, len(prontos_disco))
        estado = "concluido" if formatos_concluidos >= formatos_total else "novo"
        etapa_id = None
        frames_atual = 0
        frames_total = 0

    if aguardando_roteiro and estado != "rodando":
        etapa_id = "m09"

    idx_etapa = _ETAPA_IDX.get(etapa_id, 0)
    unidades = formatos_concluidos * etapas_total

    if estado == "concluido" and not aguardando_roteiro:
        unidades = unidades_total
    elif estado in {"rodando", "erro"}:
        unidades += idx_etapa
        if etapa_id == "m13" and frames_total > 0:
            unidades += max(0.0, min(1.0, frames_atual / frames_total))
    elif aguardando_roteiro:
        unidades = idx_etapa

    unidades = max(0.0, min(float(unidades), float(unidades_total)))
    percentual = round((unidades / unidades_total) * 100.0, 1) if unidades_total else 0.0

    return {
        "percentual": percentual,
        "confiavel": True,
        "estado": estado,
        "etapa_id": etapa_id,
        "etapa_nome": _ETAPA_NOME.get(etapa_id),
        "formatos_total": formatos_total,
        "formatos_concluidos": formatos_concluidos,
        "frames_atual": frames_atual if frames_total > 0 else None,
        "frames_total": frames_total if frames_total > 0 else None,
    }


def _novo_fila_job(tipo: str, projeto_ids: list[str]) -> dict:
    return {
        "estado": "rodando",
        "tipo": tipo,
        "pendentes": list(projeto_ids),
        "concluidos": [],
        "falhas": [],
        "erro": None,
        "log": [],
    }


def _append_log_fila(linha: str) -> None:
    log = _fila_job["log"]
    log.append(linha)
    if len(log) > _MAX_LOG_LINHAS:
        del log[:-_MAX_LOG_LINHAS]


def _executar_job(projeto_id: str, formatos: list[str], ate: Optional[str] = None) -> None:
    job = _jobs[projeto_id]
    for fmt in (formatos[:1] if ate else formatos):
        job["formato_atual"] = None if ate else fmt
        job["render_frames_atual"] = 0
        job["render_frames_total"] = 0
        cmd = [sys.executable, "-u", "-m", "pipeline", "run", "--projeto", projeto_id, "--formato", fmt]
        if ate:
            cmd += ["--ate", ate]
        env = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1", "PYTHONUNBUFFERED": "1"}
        proc = subprocess.Popen(cmd, cwd=RAIZ, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                text=True, encoding="utf-8", errors="replace", bufsize=1, env=env)
        assert proc.stdout is not None
        for linha in proc.stdout:
            linha = linha.rstrip()
            _append_log(job, linha)
            m = _LINHA_ETAPA.match(linha)
            if m:
                job["etapa"] = m.group(1)
                if job["etapa"] != "m13":
                    job["render_frames_atual"] = 0
                    job["render_frames_total"] = 0
            frames = _capturar_frames_render(linha)
            if frames and job.get("etapa") == "m13":
                job["render_frames_atual"], job["render_frames_total"] = frames
        proc.wait()
        if proc.returncode != 0:
            job["estado"] = "erro"
            job["erro"] = "\n".join(job["log"][-15:])
            return
        if not ate:
            job["prontos"].append(fmt)
        job["render_frames_atual"] = 0
        job["render_frames_total"] = 0
    job["estado"] = "concluido"
    job["etapa"] = None
    job["render_frames_atual"] = 0
    job["render_frames_total"] = 0


def _executar_job_json_direto(projeto_id: str, formatos: list[str], roteiro_json: str) -> None:
    """Fluxo: transcreve/divide (m04) -> aplica JSON externo -> segue render completo."""
    job = _jobs[projeto_id]
    _executar_job(projeto_id, formatos, "m04")
    if job.get("estado") == "erro":
        return

    try:
        info = roteiro_externo.aplicar(Caminhos(projeto_id), roteiro_json)
        _append_log(job, f"[m09] roteiro JSON aplicado automaticamente ({info.get('cenas', 0)} cenas)")
    except roteiro_externo.RoteiroExternoInvalido as e:
        job["estado"] = "erro"
        job["erro"] = str(e)
        _append_log(job, f"[m09] erro ao aplicar JSON direto: {e}")
        return

    job["estado"] = "rodando"
    job["erro"] = None
    job["etapa"] = "m09"
    job["prontos"] = []
    _executar_job(projeto_id, formatos, None)


def _processar_fila_geracao(projeto_ids: list[str]) -> None:
    global _fila_job
    for pid in projeto_ids:
        try:
            c = Caminhos(pid)
            projeto = carregar_projeto(c)
            formatos = [f.id for f in projeto.formatos]
            if projeto.decisao.provedor == "externo":
                roteiro_externo.carregar(c)
            _append_log_fila(f"[{pid}] iniciando geração")
            _jobs[pid] = _novo_job(formatos)
            _executar_job(pid, formatos, None)
            if _jobs[pid]["estado"] == "erro":
                msg = _jobs[pid].get("erro") or "erro na geração"
                _fila_job["falhas"].append({"id": pid, "erro": msg})
                _append_log_fila(f"[{pid}] erro: {msg}")
            else:
                _fila_job["concluidos"].append(pid)
                _append_log_fila(f"[{pid}] concluído")
        except Exception as e:
            _fila_job["falhas"].append({"id": pid, "erro": str(e)})
            _append_log_fila(f"[{pid}] falha: {e}")
        finally:
            if pid in _fila_job["pendentes"]:
                _fila_job["pendentes"].remove(pid)
    _fila_job["estado"] = "concluido" if not _fila_job["falhas"] else "concluido_com_falhas"


def _normalizar_ids_projetos(ids: list[str]) -> list[str]:
    out: list[str] = []
    for pid in ids or []:
        s = str(pid).strip()
        if s and s not in out:
            out.append(s)
    return out


def _juntar_videos(projeto_ids: list[str], formato: str, nome_saida: str = "fila_final") -> Path:
    arquivos: list[Path] = []
    for pid in projeto_ids:
        c = Caminhos(pid)
        arq = c.final(formato)
        if not arq.exists():
            raise ValueError(f"Projeto '{pid}' ainda não tem vídeo final em {formato}")
        arquivos.append(arq)
    if not arquivos:
        raise ValueError("Nenhum vídeo para juntar")

    _FILA_DIR.mkdir(parents=True, exist_ok=True)
    nome_limpo = re.sub(r"[^A-Za-z0-9_\-]+", "_", nome_saida).strip("_") or "fila_final"
    out = _FILA_DIR / f"{nome_limpo}_{formato}.mp4"
    lista = _FILA_DIR / f"{nome_limpo}_{formato}.txt"
    lista.write_text("\n".join(f"file '{p.as_posix()}'" for p in arquivos), encoding="utf-8")
    try:
        rodar([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lista),
            "-c", "copy", str(out),
        ])
    except RuntimeError:
        rodar([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lista),
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
            "-c:a", "aac", "-b:a", "192k", str(out),
        ])
    return out


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (ESTATICO / "index.html").read_text(encoding="utf-8")


@app.get("/api/opcoes")
def opcoes() -> dict:
    ia = llm.disponivel()
    temas = listar_presets("temas")
    for t in temas:
        t["custom"] = str(t.get("id", "")).startswith("tema_custom_")
    return {
        "canais": listar_canais(),
        "temas": temas,
        "estilos": listar_presets("estilos"),
        "paletas": PALETAS,
        "fontes": FONTES,
        "roteiro_externo_instrucoes_padrao": roteiro_externo.instrucoes_padrao(),
        "roteiro_ia_instrucoes_padrao": roteiro.instrucoes_prompt_padrao(),
        "ia": {"disponivel": ia, "modelo": llm.escolher_modelo() if ia else None},
        "templates": [{"id": t["id"], "categoria": t["categoria"], "descricao": t["descricao_para_llm"]}
                      for t in carregar_catalogo()["templates"] if t.get("status") == "implementado"],
        "formatos": [
            {"id": "16x9", "nome": "YouTube", "descricao": "Horizontal 16:9"},
            {"id": "9x16", "nome": "Shorts / Reels", "descricao": "Vertical 9:16"},
            {"id": "1x1", "nome": "Quadrado", "descricao": "1:1"},
        ],
        "ritmos_edicao": [
            {"id": "rapido", "nome": "Rápido", "descricao": "Cenas curtas e dinâmicas (1-4s)"},
            {"id": "medio", "nome": "Médio", "descricao": "Ritmo balanceado (1.5-8s)"},
            {"id": "lento", "nome": "Lento", "descricao": "Cenas longas para absorver (2-10s)"},
        ],
    }


def _slug(s: str) -> str:
    base = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    base = re.sub(r"[^a-z0-9]+", "_", base).strip("_")
    return base or "tema"


def _ids_tema_em_uso() -> set[str]:
    em_uso: set[str] = set()
    for c in listar_canais():
        t = c.get("tema_padrao")
        if t:
            em_uso.add(t)
    for p in PROJETOS.glob("*/projeto.json"):
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        t = d.get("tema_id")
        if t:
            em_uso.add(t)
    return em_uso


def _ids_canal_em_uso() -> set[str]:
    em_uso: set[str] = set()
    for p in PROJETOS.glob("*/projeto.json"):
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        c = d.get("canal_id")
        if c:
            em_uso.add(c)
    return em_uso


def _ler_json_seguro(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def _salvar_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _fallback_tema(excluir_id: str | None = None) -> str:
    padrao_id = str(_ler_json_seguro(CONFIG / "defaults" / "tema.json").get("id") or "").strip()
    if padrao_id and padrao_id != excluir_id and (CONFIG / "temas" / f"{padrao_id}.json").exists():
        return padrao_id
    for t in listar_presets("temas"):
        tid = str(t.get("id") or "").strip()
        if tid and tid != excluir_id:
            return tid
    raise HTTPException(409, "Não há tema de fallback disponível")


def _fallback_estilo(excluir_id: str | None = None) -> str:
    padrao_id = str(_ler_json_seguro(CONFIG / "defaults" / "estilo.json").get("id") or "").strip()
    if padrao_id and padrao_id != excluir_id and (CONFIG / "estilos" / f"{padrao_id}.json").exists():
        return padrao_id
    for e in listar_presets("estilos"):
        eid = str(e.get("id") or "").strip()
        if eid and eid != excluir_id:
            return eid
    raise HTTPException(409, "Não há estilo de fallback disponível")


def _garantir_canal_fallback(excluir_id: str | None = None) -> str:
    canais = [c for c in listar_canais() if c.get("id") != excluir_id]
    if canais:
        return str(canais[0]["id"])
    tema_id = _fallback_tema()
    estilo_id = _fallback_estilo()
    novo = criar_canal("Canal automático", tema_id, estilo_id, "", "direto", "")
    return str(novo["id"])


@app.post("/api/temas")
def criar_tema_custom(payload: dict = Body(...)) -> dict:
    nome = str(payload.get("nome", "")).strip()
    if not nome:
        raise HTTPException(400, "Nome do tema é obrigatório")
    descricao = str(payload.get("descricao", "")).strip()
    base_id = str(payload.get("base_tema_id") or "tema_escuro_dourado")
    cores = payload.get("cores") or {}
    fonte_id = payload.get("fonte_id")

    temas = listar_presets("temas")
    base = next((t for t in temas if t.get("id") == base_id), None)
    if not base:
        raise HTTPException(400, f"Tema base não encontrado: {base_id}")

    tema = deepcopy(base)
    tema["schema_version"] = 1
    tema["nome"] = nome
    tema["descricao"] = descricao or f"Tema personalizado baseado em {base.get('nome', base_id)}"

    if not isinstance(cores, dict):
        raise HTTPException(400, "Cores inválidas")
    tema["cores"] = {**(tema.get("cores") or {}), **cores}

    if fonte_id:
        fonte = next((f for f in FONTES if f["id"] == fonte_id), None)
        if not fonte:
            raise HTTPException(400, f"Fonte inválida: {fonte_id}")
        tip = tema.setdefault("tipografia", {})
        tip["fonte_titulo"] = {"familia": fonte["familia"], "peso": fonte["peso"]}
        tip["fonte_numero"] = {"familia": fonte["familia"], "peso": fonte["peso"]}
        tip["fonte_corpo"] = {"familia": fonte["familia"], "peso": 500}

    # valida e normaliza formato final conforme schema
    tema_model = Tema.model_validate(tema)
    tema = tema_model.model_dump()

    base_slug = _slug(nome)
    tema_id = f"tema_custom_{base_slug}"
    tema_path = CONFIG / "temas" / f"{tema_id}.json"
    n = 2
    while tema_path.exists():
        tema_id = f"tema_custom_{base_slug}_{n}"
        tema_path = CONFIG / "temas" / f"{tema_id}.json"
        n += 1

    tema["id"] = tema_id
    tema_path.write_text(json.dumps(tema, ensure_ascii=False, indent=2), encoding="utf-8")
    tema["custom"] = True
    return tema


@app.delete("/api/temas/{tema_id}")
def excluir_tema(tema_id: str) -> dict:
    if not re.fullmatch(r"[A-Za-z0-9_\-]+", tema_id):
        raise HTTPException(400, "ID de tema inválido")

    p = CONFIG / "temas" / f"{tema_id}.json"
    if not p.exists():
        raise HTTPException(404, "Tema não encontrado")

    tema_fallback = _fallback_tema(excluir_id=tema_id)
    canais_atualizados = 0
    for c in listar_canais():
        if c.get("tema_padrao") != tema_id:
            continue
        canal_path = CONFIG / "canais" / str(c.get("id")) / "canal.json"
        canal_json = _ler_json_seguro(canal_path)
        if not canal_json:
            continue
        canal_json["tema_padrao"] = tema_fallback
        _salvar_json(canal_path, canal_json)
        canais_atualizados += 1

    projetos_atualizados = 0
    for pj in PROJETOS.glob("*/projeto.json"):
        proj = _ler_json_seguro(pj)
        if proj.get("tema_id") != tema_id:
            continue
        proj["tema_id"] = None
        _salvar_json(pj, proj)
        projetos_atualizados += 1

    p.unlink()
    return {
        "ok": True,
        "tema_fallback": tema_fallback,
        "canais_atualizados": canais_atualizados,
        "projetos_atualizados": projetos_atualizados,
    }


@app.post("/api/canais")
def novo_canal(
    nome: str = Form(...),
    tema_id: str = Form("tema_escuro_dourado"),
    estilo_id: str = Form("estilo_didatico"),
    publico: str = Form(""),
    tom: str = Form("direto"),
    cta: str = Form(""),
    paleta_id: str = Form(""),
    fonte_id: str = Form(""),
) -> dict:
    try:
        return criar_canal(nome, tema_id, estilo_id, publico, tom, cta, paleta_id or None, fonte_id or None)
    except ValueError as e:
        raise HTTPException(400, str(e))


@app.delete("/api/canais/{canal_id}")
def apagar_canal(canal_id: str) -> dict:
    fallback = _garantir_canal_fallback(excluir_id=canal_id)
    projetos_atualizados = 0
    for pj in PROJETOS.glob("*/projeto.json"):
        proj = _ler_json_seguro(pj)
        if proj.get("canal_id") != canal_id:
            continue
        proj["canal_id"] = fallback
        _salvar_json(pj, proj)
        projetos_atualizados += 1
    try:
        excluir_canal(canal_id)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except FileNotFoundError:
        raise HTTPException(404, "Canal não encontrado")
    return {"ok": True, "canal_fallback": fallback, "projetos_atualizados": projetos_atualizados}


@app.get("/api/projetos")
def projetos() -> list[dict]:
    itens = listar_projetos()
    for p in itens:
        job = _jobs.get(p["id"])
        p["estado"] = job["estado"] if job else ("concluido" if any(p["formatos"].values()) else "novo")
    return itens


@app.post("/api/projetos")
async def criar(
    audio: UploadFile = File(...),
    titulo: str = Form(""),
    canal_id: str = Form("canal_exemplo"),
    tema_id: str = Form(""),
    estilo_id: str = Form(""),
    paleta_id: str = Form(""),
    fonte_id: str = Form(""),
    paleta_override: str = Form("{}"),
    formatos: str = Form("16x9"),
    modelo: str = Form("small"),
    idioma: str = Form("pt"),
    usar_ia: bool = Form(True),
    roteiro_modo: str = Form(""),
    roteiro_json_direto: str = Form(""),
    ia_instrucoes: str = Form(""),
    ritmo_edicao: str = Form("medio"),
    legendas_sincronizadas: bool = Form(False),
    imagens: list[UploadFile] = File([]),
    imagens_meta: str = Form("[]"),
    midias_ids: str = Form(""),
    midias_novas: list[UploadFile] = File([]),
    midias_novas_meta: str = Form("[]"),
) -> dict:
    lista = [f for f in formatos.split(",") if f]
    if not lista or any(f not in FORMATOS for f in lista):
        raise HTTPException(400, "Escolha ao menos um formato válido")
    if modelo not in {"tiny", "base", "small", "medium", "large-v3"}:
        raise HTTPException(400, "Modelo de transcrição inválido")
    if idioma not in IDIOMAS:
        raise HTTPException(400, "Idioma inválido")
    if ritmo_edicao not in {"rapido", "medio", "lento"}:
        raise HTTPException(400, "Ritmo de edição inválido")
    if canal_id not in {c["id"] for c in listar_canais()}:
        raise HTTPException(400, "Canal não existe")
    if roteiro_modo and roteiro_modo not in {"ia", "regras", "externo", "json_direto"}:
        raise HTTPException(400, "Modo de roteiro inválido")
    if roteiro_modo == "json_direto" and not (roteiro_json_direto or "").strip():
        raise HTTPException(400, "JSON do roteiro é obrigatório no modo JSON direto")
    if roteiro_modo:
        usar_ia = roteiro_modo == "ia"
    externo = roteiro_modo in {"externo", "json_direto"}
    try:
        overrides = overrides_design(paleta_id or None, fonte_id or None)
        meta = json.loads(imagens_meta or "[]")
        meta_novas = json.loads(midias_novas_meta or "[]")
        cores_override = json.loads(paleta_override or "{}")
    except (ValueError, json.JSONDecodeError) as e:
        raise HTTPException(400, str(e))
    if not isinstance(meta, list) or not isinstance(meta_novas, list):
        raise HTTPException(400, "imagens_meta e midias_novas_meta devem ser listas")
    # Mescla do editor avançado: overrides_design já retorna o payload de tema.
    # Aqui só combinamos as chaves de cores por cima desse payload.
    if cores_override:
        if overrides is None:
            overrides = {}
        overrides["cores"] = {**(overrides.get("cores") or {}), **cores_override}
    ids_banco = [i.strip() for i in midias_ids.split(",") if i.strip()]
    conhecidos = {m["id"] for m in biblioteca.listar()}
    if any(i not in conhecidos for i in ids_banco):
        raise HTTPException(400, "Mídia do banco não encontrada: "
                            + ", ".join(i for i in ids_banco if i not in conhecidos))
    if len(meta_novas) < len(midias_novas):
        raise HTTPException(400, "Cada mídia nova precisa de nome e descrição")
    # novas mídias entram primeiro no banco permanente (falha antes de criar o projeto se faltar descrição)
    for i, up in enumerate(midias_novas):
        m = meta_novas[i] if isinstance(meta_novas[i], dict) else {}
        ids_banco.append((await _guardar_no_banco(up, m))["id"])
    sufixo = Path(audio.filename or "audio.wav").suffix.lower() or ".wav"
    titulo = titulo.strip() or Path(audio.filename or "video").stem
    with _lock:
        projeto_id = gerar_id(titulo)
        with tempfile.NamedTemporaryFile(suffix=sufixo, delete=False) as tmp:
            tmp.write(await audio.read())
            tmp_path = Path(tmp.name)
        try:
            criar_projeto(projeto_id, tmp_path, canal=canal_id, titulo=titulo, modelo=modelo, formatos=lista,
                          tema_id=tema_id or None, estilo_id=estilo_id or None,
                          overrides_tema=overrides or None, usar_ia=usar_ia, roteiro_externo=externo,
                          idioma=idioma if idioma != "auto" else None, ritmo_edicao=ritmo_edicao,
                          legendas_sincronizadas=legendas_sincronizadas,
                          instrucoes_prompt=ia_instrucoes)
        except ValueError as e:
            raise HTTPException(400, str(e))
        finally:
            tmp_path.unlink(missing_ok=True)
        c = Caminhos(projeto_id)
        for i, img in enumerate(imagens):
            m = meta[i] if i < len(meta) and isinstance(meta[i], dict) else {}
            await _guardar_imagem(c, img, m)
        biblioteca.vincular(c, ids_banco)
        _jobs[projeto_id] = _novo_job(lista)
    # externo comum: só vai até m04 e aguarda colagem manual do roteiro.
    # json_direto: vai até m04, aplica JSON e continua render automaticamente.
    if roteiro_modo == "json_direto":
        threading.Thread(
            target=_executar_job_json_direto,
            args=(projeto_id, lista, roteiro_json_direto),
            daemon=True,
        ).start()
    else:
        threading.Thread(target=_executar_job, args=(projeto_id, lista, "m04" if externo else None), daemon=True).start()
    return {"id": projeto_id, "titulo": titulo}


@app.post("/api/fila/transcrever")
def fila_transcrever(projetos: list[str] = Body(..., embed=True)) -> dict:
    ids = _normalizar_ids_projetos(projetos)
    if not ids:
        raise HTTPException(400, "Informe ao menos um projeto")
    iniciados: list[str] = []
    for pid in ids:
        try:
            c = Caminhos(pid)
            projeto = carregar_projeto(c)
            formatos = [f.id for f in projeto.formatos]
            _jobs[pid] = _novo_job(formatos)
            threading.Thread(target=_executar_job, args=(pid, formatos, "m04"), daemon=True).start()
            iniciados.append(pid)
        except Exception:
            continue
    if not iniciados:
        raise HTTPException(400, "Nenhum projeto válido para transcrever")
    return {"ok": True, "iniciados": iniciados}


@app.post("/api/fila/gerar")
def fila_gerar(projetos: list[str] = Body(..., embed=True)) -> dict:
    global _fila_job
    ids = _normalizar_ids_projetos(projetos)
    if not ids:
        raise HTTPException(400, "Informe ao menos um projeto")
    if _fila_job.get("estado") == "rodando":
        raise HTTPException(409, "Já existe uma fila em execução")
    _fila_job = _novo_fila_job("gerar", ids)
    threading.Thread(target=_processar_fila_geracao, args=(ids,), daemon=True).start()
    return {"ok": True, "fila": _fila_job}


@app.get("/api/fila")
def fila_status() -> dict:
    return _fila_job


@app.post("/api/fila/juntar")
def fila_juntar(
    projetos: list[str] = Body(...),
    formato: str = Body("16x9"),
    nome: str = Body("fila_final"),
) -> dict:
    ids = _normalizar_ids_projetos(projetos)
    if not ids:
        raise HTTPException(400, "Informe ao menos um projeto")
    if formato not in FORMATOS:
        raise HTTPException(400, "Formato inválido")
    try:
        out = _juntar_videos(ids, formato, nome)
    except Exception as e:
        raise HTTPException(422, str(e))
    return {"ok": True, "arquivo": out.name, "url": f"/api/fila/arquivo/{out.name}"}


@app.get("/api/fila/arquivo/{arquivo}")
def fila_arquivo(arquivo: str, download: bool = True) -> FileResponse:
    p = (_FILA_DIR / arquivo).resolve()
    if not str(p).startswith(str(_FILA_DIR.resolve())) or not p.exists():
        raise HTTPException(404, "Arquivo não encontrado")
    return FileResponse(
        p,
        media_type="video/mp4",
        filename=p.name if download else None,
        content_disposition_type="attachment" if download else "inline",
    )


@app.delete("/api/projetos/{projeto_id}")
def excluir(projeto_id: str) -> dict:
    with _lock:
        try:
            excluir_projeto(projeto_id)
        except (FileNotFoundError, ValueError) as e:
            raise HTTPException(404 if isinstance(e, FileNotFoundError) else 400, str(e))
        # Remove o job de memória se existir
        _jobs.pop(projeto_id, None)
    return {"mensagem": f"Projeto '{projeto_id}' excluído com sucesso."}


def _tags(meta: dict) -> list[str]:
    tags = meta.get("tags", [])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]
    return [str(t) for t in tags]


async def _guardar_no_banco(up: UploadFile, meta: dict) -> dict:
    nome_arq = up.filename or "midia"
    if Path(nome_arq).suffix.lower() not in EXT_MIDIA:
        raise HTTPException(400, f"Arquivo não suportado: {nome_arq}")
    try:
        return biblioteca.adicionar(nome_arq, await up.read(), nome=str(meta.get("nome", "")),
                                    descricao=str(meta.get("descricao", "")), tags=_tags(meta))
    except ValueError as e:
        raise HTTPException(400, f"{nome_arq}: {e}")


@app.get("/api/biblioteca")
def biblioteca_listar() -> list[dict]:
    return biblioteca.listar()


@app.post("/api/biblioteca")
async def biblioteca_adicionar(arquivo: UploadFile = File(...), nome: str = Form(""), descricao: str = Form(""),
                               tags: str = Form("")) -> dict:
    return await _guardar_no_banco(arquivo, {"nome": nome, "descricao": descricao, "tags": tags})


@app.patch("/api/biblioteca/{mid}")
def biblioteca_editar(mid: str, nome: Optional[str] = Body(None), descricao: Optional[str] = Body(None),
                      tags: Optional[list[str]] = Body(None)) -> dict:
    try:
        return biblioteca.atualizar(mid, nome=nome, descricao=descricao, tags=tags)
    except KeyError:
        raise HTTPException(404, "Mídia não encontrada")
    except ValueError as e:
        raise HTTPException(400, str(e))


@app.delete("/api/biblioteca/{mid}")
def biblioteca_remover(mid: str) -> dict:
    if not biblioteca.remover(mid):
        raise HTTPException(404, "Mídia não encontrada")
    return {"ok": True}


@app.get("/api/biblioteca/{mid}/arquivo")
def biblioteca_arquivo(mid: str) -> FileResponse:
    m = biblioteca.obter(mid)
    if not m:
        raise HTTPException(404, "Mídia não encontrada")
    return FileResponse(biblioteca.caminho(m))


async def _guardar_imagem(c: Caminhos, img: UploadFile, meta: dict) -> dict:
    nome = img.filename or "imagem.png"
    if Path(nome).suffix.lower() not in EXT_MIDIA:
        raise HTTPException(400, f"Arquivo não suportado: {nome}")
    return adicionar_imagem(c, nome, await img.read(), tags=_tags(meta), descricao=str(meta.get("descricao", "")))


def _mime_audio(formato: str) -> str:
    return {
        "mp3": "audio/mpeg",
        "m4a": "audio/mp4",
        "wav": "audio/wav",
    }[formato]


@app.post("/api/util/extrair-audio")
async def extrair_audio_video(
    video: UploadFile = File(...),
    formato: str = Form("mp3"),
) -> FileResponse:
    formato = str(formato or "mp3").strip().lower()
    if formato not in {"mp3", "m4a", "wav"}:
        raise HTTPException(400, "Formato inválido (use: mp3, m4a ou wav)")

    nome_video = video.filename or "video.mp4"
    ext_video = Path(nome_video).suffix.lower() or ".mp4"
    ext_out = ".m4a" if formato == "m4a" else f".{formato}"
    base_nome = Path(nome_video).stem or "audio"

    with tempfile.NamedTemporaryFile(suffix=ext_video, delete=False) as tmp_video:
        tmp_video.write(await video.read())
        in_path = Path(tmp_video.name)

    out_path = in_path.with_suffix(ext_out)
    try:
        cmd = ["ffmpeg", "-y", "-v", "error", "-i", str(in_path), "-vn"]
        if formato == "mp3":
            cmd += ["-c:a", "libmp3lame", "-b:a", "192k"]
        elif formato == "m4a":
            cmd += ["-c:a", "aac", "-b:a", "192k"]
        else:
            cmd += ["-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le"]
        cmd.append(str(out_path))
        rodar(cmd)
        if not out_path.exists() or out_path.stat().st_size == 0:
            raise HTTPException(422, "Falha ao extrair áudio do vídeo")

        return FileResponse(
            out_path,
            media_type=_mime_audio(formato),
            filename=f"{base_nome}_audio{ext_out}",
            background=BackgroundTask(lambda p=out_path: p.unlink(missing_ok=True)),
        )
    except RuntimeError as e:
        raise HTTPException(422, f"Falha ao extrair áudio: {e}")
    finally:
        in_path.unlink(missing_ok=True)


def _caminhos(projeto_id: str) -> Caminhos:
    try:
        return Caminhos(projeto_id)
    except (ValueError, FileNotFoundError):
        raise HTTPException(404, "Projeto não encontrado")


@app.get("/api/projetos/{projeto_id}/imagens")
def imagens_do_projeto(projeto_id: str) -> list[dict]:
    return listar_imagens(_caminhos(projeto_id))


@app.post("/api/projetos/{projeto_id}/imagens")
async def enviar_imagem(projeto_id: str, imagem: UploadFile = File(...), tags: str = Form(""),
                        descricao: str = Form("")) -> dict:
    return await _guardar_imagem(_caminhos(projeto_id), imagem, {"tags": tags, "descricao": descricao})


@app.post("/api/projetos/{projeto_id}/imagens/banco")
def vincular_do_banco(projeto_id: str, ids: list[str] = Body(..., embed=True)) -> list[dict]:
    try:
        return biblioteca.vincular(_caminhos(projeto_id), ids)
    except KeyError as e:
        raise HTTPException(404, f"Mídia do banco não encontrada: {e.args[0]}")


@app.delete("/api/projetos/{projeto_id}/imagens/{iid}")
def apagar_imagem(projeto_id: str, iid: str) -> dict:
    if not remover_imagem(_caminhos(projeto_id), iid):
        raise HTTPException(404, "Imagem não encontrada")
    return {"ok": True}

@app.patch("/api/projetos/{projeto_id}/imagens/{iid}")
def editar_imagem_projeto(projeto_id: str, iid: str, nome: Optional[str] = Body(None),
                          descricao: Optional[str] = Body(None), tags: Optional[list[str]] = Body(None)) -> dict:
    try:
        return atualizar_imagem(_caminhos(projeto_id), iid, nome=nome, descricao=descricao, tags=tags)
    except KeyError:
        raise HTTPException(404, "Imagem não encontrada")
    except ValueError as e:
        raise HTTPException(400, str(e))


@app.get("/api/projetos/{projeto_id}/imagens/{iid}/arquivo")
def arquivo_imagem(projeto_id: str, iid: str) -> FileResponse:
    c = _caminhos(projeto_id)
    img = next((i for i in listar_imagens(c) if i["id"] == iid), None)
    if not img:
        raise HTTPException(404, "Imagem não encontrada")
    return FileResponse(pasta_imagens(c) / img["arquivo"])


@app.get("/api/projetos/{projeto_id}/cenas/{cena_id}.jpg")
def preview_cena(projeto_id: str, cena_id: str, formato: str = "16x9") -> FileResponse:
    c = _caminhos(projeto_id)
    if formato not in FORMATOS or not re.fullmatch(r"c\d{3}", cena_id):
        raise HTTPException(404, "Preview não encontrado")
    arq = pasta_previews(c, formato) / f"{cena_id}.jpg"
    if not arq.exists():
        raise HTTPException(404, "Preview ainda não gerado")
    return FileResponse(arq, media_type="image/jpeg", headers={"Cache-Control": "no-store"})


def _ao_vivo(c: Caminhos, formato: Optional[str]) -> Optional[dict]:
    arq = c.cache / "roteiro_ao_vivo.json"
    if not arq.exists():
        return None
    try:
        estado = json.loads(arq.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    fmt = formato or "16x9"
    pasta = pasta_previews(c, fmt)
    for cena in estado.get("cenas", []):
        cena["preview"] = (f"/api/projetos/{c.raiz.name}/cenas/{cena['id']}.jpg?formato={fmt}"
                           if (pasta / f"{cena['id']}.jpg").exists() else None)
    return estado


@app.get("/api/projetos/{projeto_id}")
def status(projeto_id: str) -> dict:
    try:
        c = Caminhos(projeto_id)
    except (ValueError, FileNotFoundError):
        raise HTTPException(404, "Projeto não encontrado")
    projeto = carregar_projeto(c)
    job = _jobs.get(projeto_id)
    prontos = [f.id for f in projeto.formatos if c.final(f.id).exists()]
    formato_atual = job["formato_atual"] if job else None
    roteiro_info = roteiro_externo.pacote(c) if projeto.decisao.provedor == "externo" else None
    aguardando_roteiro = bool(
        roteiro_info and roteiro_info.get("pronto") and roteiro_info.get("pendente")
        and (not job or job.get("estado") != "rodando")
    )
    return {
        "id": projeto_id,
        "titulo": projeto.titulo_trabalho,
        "canal_id": projeto.canal_id,
        "tema_id": projeto.tema_id,
        "ao_vivo": _ao_vivo(c, formato_atual or (prontos[0] if prontos else None)),
        "estilo_id": projeto.estilo_id,
        "formatos": [f.id for f in projeto.formatos],
        "roteiro_externo": roteiro_info,
        "prontos": prontos,
        "estado": job["estado"] if job else ("concluido" if prontos else "novo"),
        "etapa": job["etapa"] if job else None,
        "etapas": ETAPAS,
        "formato_atual": job["formato_atual"] if job else None,
        "progresso": _resumo_progresso(job, len(projeto.formatos), prontos, aguardando_roteiro),
        "erro": job["erro"] if job else None,
        "log": job["log"][-8:] if job else [],
    }


@app.get("/api/projetos/{projeto_id}/cenas")
def cenas(projeto_id: str) -> list[dict]:
    c = _caminhos(projeto_id)
    if not c.timeline_json.exists():
        return []
    return cenas_editaveis(c)


def _editavel(projeto_id: str) -> Caminhos:
    job = _jobs.get(projeto_id)
    if job and job["estado"] == "rodando":
        raise HTTPException(409, "Espere a geração terminar para editar")
    return _caminhos(projeto_id)


@app.patch("/api/projetos/{projeto_id}/cenas/{cena_id}")
def editar(projeto_id: str, cena_id: str, template: str = Body(...), dados: dict = Body(...)) -> dict:
    c = _editavel(projeto_id)
    try:
        return editar_cena(c, cena_id, template, dados)
    except EdicaoInvalida as e:
        raise HTTPException(422, str(e))


@app.patch("/api/projetos/{projeto_id}/cenas_fundo")
@app.patch("/api/projetos/{projeto_id}/cenas-fundo")
def editar_fundo_lote(projeto_id: str, cena_ids: list[str] = Body(...), fundo: Optional[dict] = Body(None)) -> dict:
    c = _editavel(projeto_id)
    try:
        return aplicar_fundo_em_cenas(c, cena_ids, fundo)
    except EdicaoInvalida as e:
        raise HTTPException(422, str(e))


@app.post("/api/projetos/{projeto_id}/fundo_plano_ia")
def sugerir_fundo_ia(projeto_id: str) -> dict:
    c = _editavel(projeto_id)
    try:
        return sugerir_plano_fundos(c)
    except EdicaoInvalida as e:
        raise HTTPException(422, str(e))


@app.patch("/api/projetos/{projeto_id}/cenas/{cena_id}/tempos")
def tempos(projeto_id: str, cena_id: str, inicio: Optional[float] = Body(None), fim: Optional[float] = Body(None)) -> dict:
    c = _editavel(projeto_id)
    try:
        return ajustar_tempos(c, cena_id, inicio, fim)
    except EdicaoInvalida as e:
        raise HTTPException(422, str(e))


@app.post("/api/projetos/{projeto_id}/cenas/{cena_id}/dividir")
def dividir(projeto_id: str, cena_id: str, em: Optional[float] = Body(None, embed=True)) -> dict:
    c = _editavel(projeto_id)
    try:
        return dividir_cena(c, cena_id, em)
    except EdicaoInvalida as e:
        raise HTTPException(422, str(e))


@app.delete("/api/projetos/{projeto_id}/cenas/{cena_id}")
def remover(projeto_id: str, cena_id: str) -> dict:
    c = _editavel(projeto_id)
    try:
        return remover_cena(c, cena_id)
    except EdicaoInvalida as e:
        raise HTTPException(422, str(e))


@app.post("/api/projetos/{projeto_id}/roteiro")
def colar_roteiro(projeto_id: str, texto: str = Body(..., embed=True)) -> dict:
    """Recebe o JSON escrito por outra IA, valida e já dispara m09→m14."""
    c = _editavel(projeto_id)
    try:
        info = roteiro_externo.aplicar(c, texto)
    except roteiro_externo.RoteiroExternoInvalido as e:
        raise HTTPException(422, str(e))
    projeto = carregar_projeto(c)
    lista = [f.id for f in projeto.formatos]
    _jobs[projeto_id] = _novo_job(lista)
    threading.Thread(target=_executar_job, args=(projeto_id, lista), daemon=True).start()
    return info


@app.post("/api/projetos/{projeto_id}/gerar")
def gerar_novamente(projeto_id: str, formato: Optional[str] = None) -> dict:
    try:
        c = Caminhos(projeto_id)
    except (ValueError, FileNotFoundError):
        raise HTTPException(404, "Projeto não encontrado")
    job = _jobs.get(projeto_id)
    if job and job["estado"] == "rodando":
        raise HTTPException(409, "Já está gerando")
    projeto = carregar_projeto(c)
    lista = [formato] if formato else [f.id for f in projeto.formatos]
    _jobs[projeto_id] = _novo_job(lista)
    threading.Thread(target=_executar_job, args=(projeto_id, lista), daemon=True).start()
    return {"ok": True}


@app.get("/api/projetos/{projeto_id}/audio")
def audio(projeto_id: str, download: bool = True, formato: str = "wav") -> FileResponse:
    try:
        c = Caminhos(projeto_id)
        projeto = carregar_projeto(c)
    except (ValueError, FileNotFoundError):
        raise HTTPException(404, "Projeto não encontrado")
    arq = c.entrada(projeto.entrada.audio)
    if not arq.exists():
        raise HTTPException(404, "Áudio não encontrado")
    formato = str(formato or "wav").strip().lower()
    if formato not in {"mp3", "m4a", "wav"}:
        raise HTTPException(400, "Formato inválido (use: mp3, m4a ou wav)")

    ext_out = ".m4a" if formato == "m4a" else f".{formato}"
    nome_base = f"{projeto_id}_audio"

    if arq.suffix.lower() == ext_out:
        return FileResponse(
            arq,
            media_type=_mime_audio(formato),
            filename=f"{nome_base}{ext_out}" if download else None,
            content_disposition_type="attachment" if download else "inline",
        )

    with tempfile.NamedTemporaryFile(suffix=ext_out, delete=False) as tmp_out:
        out_path = Path(tmp_out.name)

    try:
        cmd = ["ffmpeg", "-y", "-v", "error", "-i", str(arq), "-vn"]
        if formato == "mp3":
            cmd += ["-c:a", "libmp3lame", "-b:a", "192k"]
        elif formato == "m4a":
            cmd += ["-c:a", "aac", "-b:a", "192k"]
        else:
            cmd += ["-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le"]
        cmd.append(str(out_path))
        rodar(cmd)
        if not out_path.exists() or out_path.stat().st_size == 0:
            raise HTTPException(422, "Falha ao gerar áudio do projeto")

        return FileResponse(
            out_path,
            media_type=_mime_audio(formato),
            filename=f"{nome_base}{ext_out}" if download else None,
            content_disposition_type="attachment" if download else "inline",
            background=BackgroundTask(lambda p=out_path: p.unlink(missing_ok=True)),
        )
    except RuntimeError as e:
        out_path.unlink(missing_ok=True)
        raise HTTPException(422, f"Falha ao converter áudio: {e}")


@app.get("/api/projetos/{projeto_id}/video/{formato}")
def video(projeto_id: str, formato: str, download: bool = False) -> FileResponse:
    try:
        c = Caminhos(projeto_id)
    except (ValueError, FileNotFoundError):
        raise HTTPException(404, "Projeto não encontrado")
    if formato not in FORMATOS:
        raise HTTPException(404, "Formato inválido")
    arq = c.final(formato)
    if not arq.exists():
        raise HTTPException(404, "Vídeo ainda não gerado")
    nome = f"{projeto_id}_{formato}.mp4"
    return FileResponse(arq, media_type="video/mp4",
                        filename=nome if download else None,
                        content_disposition_type="attachment" if download else "inline")


app.mount("/static", StaticFiles(directory=ESTATICO), name="static")
PROJETOS.mkdir(exist_ok=True)
