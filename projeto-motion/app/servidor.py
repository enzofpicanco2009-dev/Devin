"""Interface web local: enviar áudio, escolher design e gerar o vídeo.

    .venv/bin/python -m app            # http://localhost:8000
"""
from __future__ import annotations

import re
import subprocess
import sys
import tempfile
import threading
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from pipeline.comum import PROJETOS, RAIZ, Caminhos, carregar_projeto
from pipeline.m08_resolver_config import listar_presets
from pipeline.projetos import FORMATOS, criar_projeto, gerar_id, listar_projetos

app = FastAPI(title="Motion Studio")
ESTATICO = Path(__file__).parent / "static"

ETAPAS = [
    ("m01", "Transcrevendo o áudio"),
    ("m04", "Dividindo em cenas"),
    ("m09", "Escolhendo animações"),
    ("m12", "Aplicando o design"),
    ("m13", "Renderizando"),
    ("m14", "Juntando com o áudio"),
]
_LINHA_ETAPA = re.compile(r"^\[(m\d\d)\]")

# projeto_id -> estado do job em andamento/concluído (memória do processo)
_jobs: dict[str, dict] = {}
_lock = threading.Lock()


def _executar_job(projeto_id: str, formatos: list[str]) -> None:
    job = _jobs[projeto_id]
    for fmt in formatos:
        job["formato_atual"] = fmt
        cmd = [sys.executable, "-m", "pipeline", "run", "--projeto", projeto_id, "--formato", fmt]
        proc = subprocess.Popen(cmd, cwd=RAIZ, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                text=True, bufsize=1)
        assert proc.stdout is not None
        for linha in proc.stdout:
            linha = linha.rstrip()
            job["log"].append(linha)
            m = _LINHA_ETAPA.match(linha)
            if m:
                job["etapa"] = m.group(1)
        proc.wait()
        if proc.returncode != 0:
            job["estado"] = "erro"
            job["erro"] = "\n".join(job["log"][-15:])
            return
        job["prontos"].append(fmt)
    job["estado"] = "concluido"
    job["etapa"] = None


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (ESTATICO / "index.html").read_text(encoding="utf-8")


@app.get("/api/opcoes")
def opcoes() -> dict:
    return {
        "temas": listar_presets("temas"),
        "estilos": listar_presets("estilos"),
        "formatos": [
            {"id": "16x9", "nome": "YouTube", "descricao": "Horizontal 16:9"},
            {"id": "9x16", "nome": "Shorts / Reels", "descricao": "Vertical 9:16"},
            {"id": "1x1", "nome": "Quadrado", "descricao": "1:1"},
        ],
    }


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
    tema_id: str = Form(...),
    estilo_id: str = Form(...),
    formatos: str = Form("16x9"),
    modelo: str = Form("small"),
) -> dict:
    lista = [f for f in formatos.split(",") if f]
    if not lista or any(f not in FORMATOS for f in lista):
        raise HTTPException(400, "Escolha ao menos um formato válido")
    if modelo not in {"tiny", "base", "small", "medium", "large-v3"}:
        raise HTTPException(400, "Modelo de transcrição inválido")
    sufixo = Path(audio.filename or "audio.wav").suffix.lower() or ".wav"
    titulo = titulo.strip() or Path(audio.filename or "video").stem
    with _lock:
        projeto_id = gerar_id(titulo)
        with tempfile.NamedTemporaryFile(suffix=sufixo, delete=False) as tmp:
            tmp.write(await audio.read())
            tmp_path = Path(tmp.name)
        try:
            criar_projeto(projeto_id, tmp_path, titulo=titulo, modelo=modelo, formatos=lista,
                          tema_id=tema_id, estilo_id=estilo_id)
        except ValueError as e:
            raise HTTPException(400, str(e))
        finally:
            tmp_path.unlink(missing_ok=True)
        _jobs[projeto_id] = {"estado": "rodando", "etapa": None, "formato_atual": None,
                             "formatos": lista, "prontos": [], "log": [], "erro": None}
    threading.Thread(target=_executar_job, args=(projeto_id, lista), daemon=True).start()
    return {"id": projeto_id, "titulo": titulo}


@app.get("/api/projetos/{projeto_id}")
def status(projeto_id: str) -> dict:
    try:
        c = Caminhos(projeto_id)
    except (ValueError, FileNotFoundError):
        raise HTTPException(404, "Projeto não encontrado")
    projeto = carregar_projeto(c)
    job = _jobs.get(projeto_id)
    prontos = [f.id for f in projeto.formatos if c.final(f.id).exists()]
    return {
        "id": projeto_id,
        "titulo": projeto.titulo_trabalho,
        "tema_id": projeto.tema_id,
        "estilo_id": projeto.estilo_id,
        "formatos": [f.id for f in projeto.formatos],
        "prontos": prontos,
        "estado": job["estado"] if job else ("concluido" if prontos else "novo"),
        "etapa": job["etapa"] if job else None,
        "etapas": ETAPAS,
        "formato_atual": job["formato_atual"] if job else None,
        "erro": job["erro"] if job else None,
        "log": job["log"][-8:] if job else [],
    }


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
    _jobs[projeto_id] = {"estado": "rodando", "etapa": None, "formato_atual": None,
                         "formatos": lista, "prontos": [], "log": [], "erro": None}
    threading.Thread(target=_executar_job, args=(projeto_id, lista), daemon=True).start()
    return {"ok": True}


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
