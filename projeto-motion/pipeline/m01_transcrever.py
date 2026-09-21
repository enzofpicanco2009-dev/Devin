"""M01 — Transcrição local com faster-whisper (texto + timestamps por segmento e palavra)."""
from __future__ import annotations

import time

from .comum import (
    Caminhos, carregar_projeto, carregar_timeline, info_audio, nova_timeline,
    rodar, salvar_json, salvar_timeline, sha256_obj,
)

ETAPA = "m01"

FALLBACK_MODELOS = ["large-v3", "medium", "small", "base", "tiny"]


def _erro_parece_memoria(msg: str) -> bool:
    m = msg.lower()
    pistas = (
        "mkl_malloc",
        "failed to allocate memory",
        "out of memory",
        "std::bad_alloc",
        "cannot allocate",
    )
    return any(p in m for p in pistas)


def chave_cache(audio_hash: str | None, projeto) -> str:
    return sha256_obj({
        "audio": audio_hash,
        "idioma": projeto.entrada.idioma,
        "transcricao": projeto.transcricao.model_dump(),
    })


def _quebrar_por_frases(segmento: dict) -> list[dict]:
    """Quebra um segmento do Whisper em frases menores baseado em pontuação.
    
    Detecta pontos, vírgulas, pontos de exclamação/interrogação como limites.
    Procura pelos word_timestamps para fazer cortes precisos.
    """
    texto = segmento["text"]
    palavras = segmento.get("words", [])
    
    if not palavras or ("." not in texto and "," not in texto and "!" not in texto and "?" not in texto):
        return [segmento]
    
    # Indicadores de quebra: pontuação que deve separar frases
    indicadores = (".", "!", "?", "…", ":")
    
    # Se tem poucas palavras, não quebra
    if len(palavras) < 3:
        return [segmento]
    
    # Encontrar posições de pontuação no texto
    quebras = []
    for i, char in enumerate(texto):
        if char in indicadores:
            # procura por pontuação seguida de espaço ou fim do texto
            if i + 1 >= len(texto) or texto[i + 1] in (" ", "\n"):
                quebras.append(i)
    
    if not quebras:
        return [segmento]
    
    # Distribuir palavras entre frases baseado nas quebras
    resultado = []
    palavras_frase_atual = []
    pos_char = 0
    quebra_idx = 0
    
    for palavra_dict in palavras:
        palavra_len = len(palavra_dict["word"]) + 1  # +1 para espaço
        pos_char += palavra_len
        palavras_frase_atual.append(palavra_dict)
        
        # Check if we've passed a break point
        if quebra_idx < len(quebras) and pos_char >= quebras[quebra_idx]:
            if palavras_frase_atual:
                frase_texto = " ".join(p["word"] for p in palavras_frase_atual)
                resultado.append({
                    "start": round(palavras_frase_atual[0]["start"], 3),
                    "end": round(palavras_frase_atual[-1]["end"], 3),
                    "text": frase_texto.strip(),
                    "words": palavras_frase_atual,
                })
                palavras_frase_atual = []
            quebra_idx += 1
    
    # Adiciona frases restantes
    if palavras_frase_atual:
        frase_texto = " ".join(p["word"] for p in palavras_frase_atual)
        resultado.append({
            "start": round(palavras_frase_atual[0]["start"], 3),
            "end": round(palavras_frase_atual[-1]["end"], 3),
            "text": frase_texto.strip(),
            "words": palavras_frase_atual,
        })
    
    return resultado if resultado else [segmento]


def preparar_wav(c: Caminhos, origem) -> None:
    rodar([
        "ffmpeg", "-y", "-v", "error", "-i", str(origem),
        "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(c.audio_wav),
    ])


def _modelos_tentativa(modelo_inicial: str) -> list[str]:
    if modelo_inicial not in FALLBACK_MODELOS:
        return [modelo_inicial, "small", "base", "tiny"]
    i = FALLBACK_MODELOS.index(modelo_inicial)
    return FALLBACK_MODELOS[i:]


def _carregar_texto_roteiro(c: Caminhos, projeto) -> str | None:
    candidatos = []
    if projeto.entrada.roteiro:
        candidatos.append(c.entrada(projeto.entrada.roteiro))
    candidatos.append(c.entrada("entrada/roteiro.txt"))
    for arq in candidatos:
        if arq.exists():
            txt = " ".join(arq.read_text(encoding="utf-8").split())
            if txt:
                return txt
    return None


def _segmento_sintetico_por_texto(texto: str, duracao_s: float) -> list[dict]:
    palavras = [p for p in texto.split() if p]
    if not palavras:
        return []
    dt = max(0.04, duracao_s / max(1, len(palavras)))
    ts = 0.0
    ws: list[dict] = []
    for p in palavras:
        te = min(duracao_s, ts + dt)
        ws.append({"word": p, "start": round(ts, 3), "end": round(te, 3), "probability": 1.0})
        ts = te
    ws[-1]["end"] = round(duracao_s, 3)
    return [{
        "start": 0.0,
        "end": round(duracao_s, 3),
        "text": texto,
        "words": ws,
    }]


def executar(projeto_id: str, force: bool = False) -> None:
    from faster_whisper import WhisperModel

    c = Caminhos(projeto_id)
    projeto = carregar_projeto(c)
    audio_origem = c.entrada(projeto.entrada.audio)
    if not audio_origem.exists():
        raise FileNotFoundError(f"Áudio não encontrado: {audio_origem}")

    audio = info_audio(audio_origem)
    chave = chave_cache(audio.hash, projeto)
    if c.timeline_json.exists() and not force:
        t = carregar_timeline(c)
        if t.concluida(ETAPA) and c.transcricao_json.exists():
            if t.artefatos.get(ETAPA) == chave:
                print(f"[{ETAPA}] já concluída (use --force para refazer)")
                return
            print(f"[{ETAPA}] áudio ou configuração de transcrição mudou — refazendo tudo")

    t = nova_timeline(projeto, audio)
    preparar_wav(c, audio_origem)

    cfg = projeto.transcricao
    texto_roteiro = _carregar_texto_roteiro(c, projeto)
    modelos = _modelos_tentativa(cfg.modelo)
    modelo_usado = cfg.modelo
    ultimo_erro = None
    segmentos_iter = None
    info = None
    prompt = " ".join((texto_roteiro or "").split()[:150]) if texto_roteiro else None

    for m in modelos:
        try:
            print(f"[{ETAPA}] carregando modelo '{m}' ({cfg.device}, {cfg.compute_type})…")
            modelo = WhisperModel(m, device=cfg.device, compute_type=cfg.compute_type)
            modelo_usado = m
            if m != cfg.modelo:
                print(f"[{ETAPA}] memória insuficiente para '{cfg.modelo}', usando fallback '{m}'")

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
            break
        except RuntimeError as e:
            ultimo_erro = e
            if _erro_parece_memoria(str(e)):
                print(f"[{ETAPA}] sem memória com '{m}', tentando modelo menor…")
                continue
            # Erros de runtime inesperados também tentam fallback de modelo.
            print(f"[{ETAPA}] falha no modelo '{m}' ({e}); tentando modelo menor…")
            continue

    if segmentos_iter is None or info is None:
        if texto_roteiro:
            segmentos = _segmento_sintetico_por_texto(texto_roteiro, audio.duracao_s)
            resultado = {
                "idioma": projeto.entrada.idioma or "pt",
                "duracao_s": audio.duracao_s,
                "modelo": "roteiro_fallback",
                "segmentos": segmentos,
            }
            salvar_json(c.transcricao_json, resultado)
            t.validacao.avisos.append(
                "m01: sem memória para Whisper; usando fallback do roteiro.txt com tempos sintéticos"
            )
            t.marcar(ETAPA)
            t.artefatos[ETAPA] = chave
            salvar_timeline(c, t)
            print(f"[{ETAPA}] fallback por roteiro aplicado ({len(segmentos)} segmento) → {c.transcricao_json}")
            return
        raise RuntimeError(
            f"[{ETAPA}] falha de memória durante a transcrição e sem roteiro de fallback. "
            f"Tente modelo 'tiny' ou crie entrada/roteiro.txt"
        ) from ultimo_erro

    segmentos_brutos = []
    for i, s in enumerate(segmentos_iter):
        texto = s.text.strip()
        if not texto:
            continue
        palavras = [
            {"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3),
             "probability": round(w.probability, 3)}
            for w in (s.words or [])
        ]
        segmentos_brutos.append({
            "start": round(s.start, 3), "end": round(s.end, 3), "text": texto, "words": palavras,
        })
    
    # quebrar por frases para segmentação mais fina
    segmentos = []
    for seg in segmentos_brutos:
        segmentos.extend(_quebrar_por_frases(seg))
    
    for s in segmentos:
        print(f"  [{s['start']:7.2f} → {s['end']:7.2f}] {s['text']}")

    resultado = {
        "idioma": info.language,
        "duracao_s": audio.duracao_s,
        "modelo": modelo_usado,
        "segmentos": segmentos,
    }
    salvar_json(c.transcricao_json, resultado)

    if segmentos and segmentos[-1]["end"] > audio.duracao_s + 0.5:
        t.validacao.avisos.append(
            f"m01: último segmento termina em {segmentos[-1]['end']}s, áudio tem {audio.duracao_s}s"
        )

    t.marcar(ETAPA)
    t.artefatos[ETAPA] = chave
    salvar_timeline(c, t)
    print(
        f"[{ETAPA}] {len(segmentos)} segmentos em {time.time() - inicio:.1f}s "
        f"(áudio {audio.duracao_s:.1f}s) → {c.transcricao_json}"
    )
