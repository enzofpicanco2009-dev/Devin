"""Interface web local: enviar áudio, escolher design e gerar o vídeo.

    .venv/bin/python -m app            # http://localhost:8000
"""
from __future__ import annotations

import json
import re
import os
import subprocess
import sys
import tempfile
import threading
from pathlib import Path
from typing import Optional

from fastapi import Body, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from pipeline import biblioteca, llm, roteiro_externo
from pipeline.canais import FONTES, PALETAS, criar_canal, listar_canais, overrides_design
from pipeline.comum import PROJETOS, RAIZ, Caminhos, carregar_projeto
from pipeline.edicao import (EdicaoInvalida, ajustar_tempos, cenas_editaveis, dividir_cena, editar_cena,
                             remover_cena)
from pipeline.imagens import EXTENSOES as EXT_MIDIA
from pipeline.imagens import adicionar_imagem, listar_imagens, pasta_imagens, remover_imagem
from pipeline.m08_resolver_config import listar_presets
from pipeline.m09_motor_decisao import carregar_catalogo
from pipeline.m13_renderizar import pasta_previews
from pipeline.projetos import FORMATOS, criar_projeto, gerar_id, listar_projetos

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
IDIOMAS = {"auto", "pt", "en", "es", "fr", "it", "de", "ja"}

# projeto_id -> estado do job em andamento/concluído (memória do processo)
_jobs: dict[str, dict] = {}
_lock = threading.Lock()


def _executar_job(projeto_id: str, formatos: list[str], ate: Optional[str] = None) -> None:
    job = _jobs[projeto_id]
    for fmt in (formatos[:1] if ate else formatos):
        job["formato_atual"] = None if ate else fmt
        cmd = [sys.executable, "-m", "pipeline", "run", "--projeto", projeto_id, "--formato", fmt]
        if ate:
            cmd += ["--ate", ate]
        env = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1"}
        proc = subprocess.Popen(cmd, cwd=RAIZ, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                text=True, encoding="utf-8", errors="replace", bufsize=1, env=env)
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
        if not ate:
            job["prontos"].append(fmt)
    job["estado"] = "concluido"
    job["etapa"] = None


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (ESTATICO / "index.html").read_text(encoding="utf-8")


@app.get("/api/opcoes")
def opcoes() -> dict:
    ia = llm.disponivel()
    return {
        "canais": listar_canais(),
        "temas": listar_presets("temas"),
        "estilos": listar_presets("estilos"),
        "paletas": PALETAS,
        "fontes": FONTES,
        "ia": {"disponivel": ia, "modelo": llm.escolher_modelo() if ia else None},
        "templates": [{"id": t["id"], "categoria": t["categoria"], "descricao": t["descricao_para_llm"]}
                      for t in carregar_catalogo()["templates"] if t.get("status") == "implementado"],
        "formatos": [
            {"id": "16x9", "nome": "YouTube", "descricao": "Horizontal 16:9"},
            {"id": "9x16", "nome": "Shorts / Reels", "descricao": "Vertical 9:16"},
            {"id": "1x1", "nome": "Quadrado", "descricao": "1:1"},
        ],
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
    formatos: str = Form("16x9"),
    modelo: str = Form("small"),
    idioma: str = Form("pt"),
    usar_ia: bool = Form(True),
    roteiro_modo: str = Form(""),
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
    if canal_id not in {c["id"] for c in listar_canais()}:
        raise HTTPException(400, "Canal não existe")
    if roteiro_modo and roteiro_modo not in {"ia", "regras", "externo"}:
        raise HTTPException(400, "Modo de roteiro inválido")
    if roteiro_modo:
        usar_ia = roteiro_modo == "ia"
    externo = roteiro_modo == "externo"
    try:
        overrides = overrides_design(paleta_id or None, fonte_id or None)
        meta = json.loads(imagens_meta or "[]")
        meta_novas = json.loads(midias_novas_meta or "[]")
    except (ValueError, json.JSONDecodeError) as e:
        raise HTTPException(400, str(e))
    if not isinstance(meta, list) or not isinstance(meta_novas, list):
        raise HTTPException(400, "imagens_meta e midias_novas_meta devem ser listas")
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
                          idioma=idioma if idioma != "auto" else None)
        except ValueError as e:
            raise HTTPException(400, str(e))
        finally:
            tmp_path.unlink(missing_ok=True)
        c = Caminhos(projeto_id)
        for i, img in enumerate(imagens):
            m = meta[i] if i < len(meta) and isinstance(meta[i], dict) else {}
            await _guardar_imagem(c, img, m)
        biblioteca.vincular(c, ids_banco)
        _jobs[projeto_id] = {"estado": "rodando", "etapa": None, "formato_atual": None,
                             "formatos": lista, "prontos": [], "log": [], "erro": None}
    # com roteiro externo, só transcreve e divide em trechos; o vídeo sai depois que o roteiro for colado
    threading.Thread(target=_executar_job, args=(projeto_id, lista, "m04" if externo else None), daemon=True).start()
    return {"id": projeto_id, "titulo": titulo}


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
    return {
        "id": projeto_id,
        "titulo": projeto.titulo_trabalho,
        "canal_id": projeto.canal_id,
        "tema_id": projeto.tema_id,
        "ao_vivo": _ao_vivo(c, formato_atual or (prontos[0] if prontos else None)),
        "imagens": len(listar_imagens(c)),
        "estilo_id": projeto.estilo_id,
        "formatos": [f.id for f in projeto.formatos],
        "roteiro_externo": roteiro_externo.pacote(c) if projeto.decisao.provedor == "externo" else None,
        "prontos": prontos,
        "estado": job["estado"] if job else ("concluido" if prontos else "novo"),
        "etapa": job["etapa"] if job else None,
        "etapas": ETAPAS,
        "formato_atual": job["formato_atual"] if job else None,
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
    _jobs[projeto_id] = {"estado": "rodando", "etapa": None, "formato_atual": None,
                         "formatos": lista, "prontos": [], "log": [], "erro": None}
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
