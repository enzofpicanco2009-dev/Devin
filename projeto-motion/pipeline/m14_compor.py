"""M14 — Mixa o áudio original no vídeo renderizado e valida sincronia (FFmpeg)."""
from __future__ import annotations

from .comum import Caminhos, carregar_projeto, carregar_timeline, duracao_s, rodar, salvar_timeline

ETAPA = "m14"


def executar(projeto_id: str, force: bool = False, formato_id: str | None = None,
             normalizar_loudness: bool = True) -> None:
    c = Caminhos(projeto_id)
    projeto = carregar_projeto(c)
    t = carregar_timeline(c)
    if not t.concluida("m13"):
        raise RuntimeError("m13 não concluída")
    formato = projeto.formato(formato_id)
    video = c.video_mudo(formato.id)
    audio = (c.raiz / projeto.entrada.audio).resolve()
    final = c.final(formato.id)
    if t.concluida(ETAPA) and final.exists() and not force:
        print(f"[{ETAPA}] já concluída (use --force para refazer)")
        return

    filtro = ["-af", "loudnorm=I=-14:LRA=11:TP=-1"] if normalizar_loudness else []
    rodar([
        "ffmpeg", "-y", "-v", "error",
        "-i", str(video), "-i", str(audio),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", *filtro,
        "-shortest", "-movflags", "+faststart",
        str(final),
    ])

    dv, da = duracao_s(final), t.audio.duracao_s
    tolerancia = 1.0 / formato.fps + 0.05
    if abs(dv - da) > tolerancia:
        raise RuntimeError(f"Dessincronia: vídeo final {dv:.3f}s vs áudio {da:.3f}s")

    t.marcar(ETAPA)
    salvar_timeline(c, t)
    print(f"[{ETAPA}] ok: {final} ({dv:.2f}s, áudio {da:.2f}s)")
