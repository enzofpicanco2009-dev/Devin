"""M01 — Transcrição local com faster-whisper (texto + timestamps por segmento e palavra)."""
from __future__ import annotations

import time

from .comum import (
    Caminhos, carregar_projeto, carregar_timeline, info_audio, nova_timeline,
    rodar, salvar_json, salvar_timeline,
)

ETAPA = "m01"


def preparar_wav(c: Caminhos, origem) -> None:
    rodar([
        "ffmpeg", "-y", "-v", "error", "-i", str(origem),
        "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(c.audio_wav),
    ])


def executar(projeto_id: str, force: bool = False) -> None:
    from faster_whisper import WhisperModel

    c = Caminhos(projeto_id)
    projeto = carregar_projeto(c)
    audio_origem = (c.raiz / projeto.entrada.audio).resolve()
    if not audio_origem.exists():
        raise FileNotFoundError(f"Áudio não encontrado: {audio_origem}")

    if c.timeline_json.exists() and not force:
        t = carregar_timeline(c)
        if t.concluida(ETAPA) and c.transcricao_json.exists():
            print(f"[{ETAPA}] já concluída (use --force para refazer)")
            return

    audio = info_audio(audio_origem)
    t = nova_timeline(projeto, audio)
    preparar_wav(c, audio_origem)

    cfg = projeto.transcricao
    print(f"[{ETAPA}] carregando modelo '{cfg.modelo}' ({cfg.device}, {cfg.compute_type})…")
    modelo = WhisperModel(cfg.modelo, device=cfg.device, compute_type=cfg.compute_type)

    prompt = None
    if projeto.entrada.roteiro:
        roteiro = (c.raiz / projeto.entrada.roteiro)
        if roteiro.exists():
            prompt = " ".join(roteiro.read_text(encoding="utf-8").split()[:150])

    inicio = time.time()
    segmentos_iter, info = modelo.transcribe(
        str(c.audio_wav),
        language=projeto.entrada.idioma,
        beam_size=cfg.beam_size,
        word_timestamps=cfg.word_timestamps,
        vad_filter=cfg.vad,
        vad_parameters={"min_silence_duration_ms": 300},
        initial_prompt=prompt,
    )

    segmentos = []
    for i, s in enumerate(segmentos_iter):
        texto = s.text.strip()
        if not texto:
            continue
        palavras = [
            {"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3),
             "probability": round(w.probability, 3)}
            for w in (s.words or [])
        ]
        segmentos.append({
            "start": round(s.start, 3), "end": round(s.end, 3), "text": texto, "words": palavras,
        })
        print(f"  [{s.start:7.2f} → {s.end:7.2f}] {texto}")

    resultado = {
        "idioma": info.language,
        "duracao_s": audio.duracao_s,
        "modelo": cfg.modelo,
        "segmentos": segmentos,
    }
    salvar_json(c.transcricao_json, resultado)

    if segmentos and segmentos[-1]["end"] > audio.duracao_s + 0.5:
        t.validacao.avisos.append(
            f"m01: último segmento termina em {segmentos[-1]['end']}s, áudio tem {audio.duracao_s}s"
        )

    t.marcar(ETAPA)
    salvar_timeline(c, t)
    print(
        f"[{ETAPA}] {len(segmentos)} segmentos em {time.time() - inicio:.1f}s "
        f"(áudio {audio.duracao_s:.1f}s) → {c.transcricao_json}"
    )
