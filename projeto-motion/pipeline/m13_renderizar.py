"""M13 — Renderiza a composição `Video` do Remotion com a timeline inteira (um único mp4 mudo)."""
from __future__ import annotations

import subprocess
import time

from .comum import REMOTION, Caminhos, carregar_projeto, carregar_timeline, ffprobe, salvar_json, salvar_timeline

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
    saida = c.video_mudo(formato.id)
    if t.concluida(ETAPA) and saida.exists() and not force:
        print(f"[{ETAPA}] já concluída (use --force para refazer)")
        return

    props_path = c.timeline_render(formato.id)
    salvar_json(props_path, timeline_para_remotion(t, formato))

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

    t.marcar(ETAPA)
    salvar_timeline(c, t)
    print(f"[{ETAPA}] ok: {frames} frames em {time.time() - inicio:.1f}s → {saida}")
