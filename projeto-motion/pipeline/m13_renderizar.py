"""M13 — Renderiza a composição `Video` do Remotion com a timeline inteira (um único mp4 mudo)."""
from __future__ import annotations

import subprocess
import time
from pathlib import Path

from .comum import (REMOTION, Caminhos, carregar_projeto, carregar_timeline, ffprobe, salvar_json,
                    salvar_timeline, sha256_obj)

ETAPA = "m13"


def timeline_para_remotion(t, formato) -> dict:
    return {
        "schema_version": t.schema_version,
        "projeto_id": t.projeto_id,
        "audio": {"duracao_s": t.audio.duracao_s},
        "formato": {"id": formato.id, "largura": formato.largura, "altura": formato.altura, "fps": formato.fps},
        "cor_fundo": t.config_resolvida.tema.cores.fundo if t.config_resolvida else "#0D0D0D",
        "cenas": [
            {
                "id": c.id, "indice": c.indice,
                "render_start_s": c.render_start_s, "render_end_s": c.render_end_s,
                "decisao": {"template": c.decisao.template},
                "props_finais": c.props_finais,
            }
            for c in t.cenas
        ],
    }


def executar(projeto_id: str, force: bool = False, formato_id: str | None = None) -> None:
    c = Caminhos(projeto_id)
    projeto = carregar_projeto(c)
    t = carregar_timeline(c)
    if not t.concluida("m12"):
        raise RuntimeError("m12 não concluída")
    formato = projeto.formato(formato_id)
    if t.artefatos.get("m12") != formato.id:
        raise RuntimeError(f"props finais são do formato {t.artefatos.get('m12')!r}; "
                           f"rode `m12 --formato {formato.id}` antes")
    saida = c.video_mudo(formato.id)
    dados = timeline_para_remotion(t, formato)
    chave = sha256_obj({"timeline": dados, "render": projeto.render.model_dump()})
    chave_id = f"{ETAPA}:{formato.id}"
    if t.artefatos.get(chave_id) == chave and saida.exists() and not force:
        print(f"[{ETAPA}] já concluída para {formato.id} (use --force para refazer)")
        t.marcar(ETAPA)
        salvar_timeline(c, t)
        return

    props_path = c.timeline_render(formato.id)
    salvar_json(props_path, dados)

    cmd = [
        "npx", "remotion", "render", "Video", str(saida),
        "--props", str(props_path),
        "--codec", projeto.render.codec,
        "--crf", str(projeto.render.crf),
        "--concurrency", str(projeto.render.concorrencia),
        "--muted",
        "--log", "warn",
    ]
    print(f"[{ETAPA}] renderizando {len(t.cenas)} cenas, {t.audio.duracao_s:.1f}s @ {formato.fps}fps "
          f"{formato.largura}x{formato.altura} …")
    inicio = time.time()
    r = subprocess.run(cmd, cwd=REMOTION, text=True, capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(f"Render falhou:\n{r.stdout[-3000:]}\n{r.stderr[-3000:]}")

    meta = ffprobe(saida)
    stream = next(s for s in meta["streams"] if s["codec_type"] == "video")
    frames = int(stream.get("nb_frames") or 0)
    esperado = round(t.audio.duracao_s * formato.fps)
    if abs(frames - esperado) > 1:
        raise RuntimeError(f"Vídeo tem {frames} frames, esperado {esperado}")

    print(f"[{ETAPA}] ok: {frames} frames em {time.time() - inicio:.1f}s → {saida}")
    extrair_previews(c, t, formato.id)
    t.marcar(ETAPA)
    t.artefatos[chave_id] = chave
    salvar_timeline(c, t)


def pasta_previews(c: Caminhos, formato_id: str) -> Path:
    return c.cache / f"previews_{formato_id}"


def extrair_previews(c: Caminhos, t, formato_id: str) -> None:
    """Um frame (meio da cena) por cena, para o storyboard da interface."""
    pasta = pasta_previews(c, formato_id)
    pasta.mkdir(exist_ok=True)
    for antigo in pasta.glob("*.jpg"):
        antigo.unlink()
    video = c.video_mudo(formato_id)
    for cena in t.cenas:
        meio = (cena.render_start_s + cena.render_end_s) / 2
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{meio:.3f}", "-i", str(video),
                        "-frames:v", "1", "-vf", "scale=480:-2", "-q:v", "4", str(pasta / f"{cena.id}.jpg")],
                       check=False)
    print(f"[{ETAPA}] previews: {len(t.cenas)} cenas em {pasta.name}/")
