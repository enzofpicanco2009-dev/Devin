"""M13 — Renderiza a composição `Video` do Remotion com a timeline inteira (um único mp4 mudo)."""
from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import time
from collections import deque
from pathlib import Path

from .comum import (REMOTION, Caminhos, carregar_projeto, carregar_timeline, executavel, ffprobe, salvar_json,
                    salvar_timeline, sha256_obj)
from .imagens import publicar_imagens

ETAPA = "m13"


def _erro_memoria_render(saida: str) -> bool:
    s = saida.lower()
    pistas = (
        "failed to allocate memory",
        "out of memory",
        "std::bad_alloc",
        "malloc of size",
        "error encoding a frame",
    )
    return any(p in s for p in pistas)


def _erro_instabilidade_compositor(saida: str) -> bool:
    s = saida.lower()
    pistas = (
        "compositor exited with code 3221226505",
        "could not extract frame from compositor",
        "make-streamer",
        "memory allocation",
        "could not load image with source blob:",
        "protocol error (page.bringtofront)",
        "target closed",
        "session closed",
        "browser crashed while rendering frame",
        "timed out after 30000ms while setting up the headless browser",
    )
    return any(p in s for p in pistas)


def _erro_stitch(saida: str) -> bool:
    """Falhas transitórias na montagem/FFmpeg (temp some, fast-start, etc.) — recuperáveis com retry."""
    s = saida.lower()
    pistas = (
        "remotion-stitch-temp-dir",
        "fast-start-intermediate",
        "error opening output",
        "no such file or directory",
        "stitch-frames-to-video",
    )
    return any(p in s for p in pistas)


def timeline_para_remotion(t, formato, audio_url: str | None = None, legendas_ativas: bool = True) -> dict:
    palavras_por_linha = 5
    if t.config_resolvida:
        # Usa escala de legenda definida no tema como base de legibilidade.
        base_legenda = t.config_resolvida.tema.tipografia.escala.legenda
        if base_legenda >= 40:
            palavras_por_linha = 4
        elif base_legenda <= 32:
            palavras_por_linha = 6

    return {
        "schema_version": t.schema_version,
        "projeto_id": t.projeto_id,
        "audio": {"duracao_s": t.audio.duracao_s, "arquivo": audio_url},
        "formato": {"id": formato.id, "largura": formato.largura, "altura": formato.altura, "fps": formato.fps},
        "cor_fundo": t.config_resolvida.tema.cores.fundo if t.config_resolvida else "#0D0D0D",
        "config_video": {
            "legendas_ativas": bool(legendas_ativas),
            "palavras_por_linha": palavras_por_linha,
        },
        "cenas": [
            {
                "id": c.id, "indice": c.indice,
                "render_start_s": c.render_start_s, "render_end_s": c.render_end_s,
                "decisao": {"template": c.decisao.template},
                "props_finais": c.props_finais,
                "fundo_override": c.props_finais.get("fundo_override") if isinstance(c.props_finais, dict) else None,
                "palavras": [{"w": p.w, "s": p.s, "e": p.e} for p in c.palavras],
            }
            for c in t.cenas
        ],
    }


def _publicar_audio_remotion(c: Caminhos, projeto) -> str:
    """Copia o áudio do projeto para remotion/public e retorna o caminho relativo público."""
    src = c.entrada(projeto.entrada.audio)
    if not src.exists():
        raise FileNotFoundError(f"Áudio não encontrado para render: {src}")
    destino_dir = REMOTION / "public" / "projetos" / c.raiz.name
    destino_dir.mkdir(parents=True, exist_ok=True)
    destino = destino_dir / f"audio{src.suffix.lower()}"
    if not destino.exists() or destino.stat().st_mtime_ns < src.stat().st_mtime_ns:
        shutil.copy2(src, destino)
    return f"projetos/{c.raiz.name}/{destino.name}"


def _fingerprint_remotion_src() -> str:
    """Hash simples do código-fonte do Remotion para invalidar cache de render ao mudar templates."""
    src = REMOTION / "src"
    if not src.exists():
        return "sem_src"
    itens: list[str] = []
    for p in sorted(src.rglob("*")):
        if p.is_file() and p.suffix in {".ts", ".tsx", ".js", ".jsx", ".css"}:
            st = p.stat()
            itens.append(f"{p.relative_to(src)}:{st.st_mtime_ns}:{st.st_size}")
    return sha256_obj(itens)


def _materializar_symlinks_publico() -> int:
    """Substitui symlinks em remotion/public por cópias reais (compatibilidade Windows/OneDrive)."""
    raiz = REMOTION / "public"
    if not raiz.exists():
        return 0

    # Processa caminhos mais profundos primeiro para evitar conflitos de árvore.
    alvos = sorted(raiz.rglob("*"), key=lambda p: len(p.parts), reverse=True)
    corrigidos = 0
    for p in alvos:
        try:
            eh_symlink = p.is_symlink()
        except OSError:
            continue
        if not eh_symlink:
            continue

        try:
            real = p.resolve(strict=True)
        except FileNotFoundError:
            p.unlink(missing_ok=True)
            corrigidos += 1
            continue

        p.unlink(missing_ok=True)
        if real.is_dir():
            shutil.copytree(real, p, dirs_exist_ok=True)
        else:
            p.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(real, p)
        corrigidos += 1

    if corrigidos:
        print(f"[{ETAPA}] symlinks convertidos em remotion/public: {corrigidos}")
    return corrigidos


def _preset_x264(valor: str | None) -> str:
    permitidos = {
        "ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "slower", "veryslow",
    }
    v = str(valor or "superfast").strip().lower()
    return v if v in permitidos else "superfast"


def _concorrencia_ajustada(concorrencia_cfg: int, largura: int, altura: int) -> int:
    cpus = os.cpu_count() or 4
    # Evita saturar o desktop: deixa ao menos 2 threads livres para o sistema.
    limite_cpu = max(1, cpus - 2)
    # 1080p+ já pesa bastante; limite menor tende a evitar engasgos e swap.
    limite_res = 2 if largura * altura >= 1920 * 1080 else 3
    return max(1, min(int(concorrencia_cfg), limite_cpu, limite_res))


def _rodar_stream(cmd: list[str], cwd: Path, env: dict | None = None) -> tuple[int, str]:
    """Executa comando emitindo stdout em tempo real e retorna um resumo para diagnóstico."""
    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1,
        env=env,
    )
    assert proc.stdout is not None

    tail = deque(maxlen=2500)
    for bruto in proc.stdout:
        linha = bruto.rstrip()
        if linha:
            print(linha, flush=True)
            tail.append(linha)
    proc.wait()
    return proc.returncode, "\n".join(tail)


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
    audio_src = c.entrada(projeto.entrada.audio)
    audio_rel = f"projetos/{c.raiz.name}/audio{audio_src.suffix.lower()}"
    video_cfg = (projeto.overrides or {}).get("video") if isinstance(projeto.overrides, dict) else {}
    legendas_ativas = isinstance(video_cfg, dict) and bool(video_cfg.get("legendas_ativas", False))
    dados = timeline_para_remotion(t, formato, audio_rel, legendas_ativas=legendas_ativas)
    chave = sha256_obj({
        "timeline": dados,
        "render": projeto.render.model_dump(),
        "remotion_src": _fingerprint_remotion_src(),
    })
    chave_id = f"{ETAPA}:{formato.id}"
    if t.artefatos.get(chave_id) == chave and saida.exists() and not force:
        print(f"[{ETAPA}] já concluída para {formato.id} (use --force para refazer)")
        t.marcar(ETAPA)
        salvar_timeline(c, t)
        return

    # Publicação incremental: evita apagar/copiar tudo a cada render, reduzindo muito IO e travamentos.
    publicar_imagens(c)
    _publicar_audio_remotion(c, projeto)
    _materializar_symlinks_publico()
    props_path = c.timeline_render(formato.id)
    salvar_json(props_path, dados)

    cmd_base = [
        executavel("npx"), "remotion", "render", "Video", str(saida),
        "--props", str(props_path),
        "--codec", projeto.render.codec,
        "--log", "info",
        "--muted",
    ]
    print(f"[{ETAPA}] renderizando {len(t.cenas)} cenas, {t.audio.duracao_s:.1f}s @ {formato.fps}fps "
          f"{formato.largura}x{formato.altura} …")
    inicio = time.time()
    conc = _concorrencia_ajustada(projeto.render.concorrencia, formato.largura, formato.altura)

    # Diretório temporário local dedicado: evita que a montagem (FFmpeg fast-start)
    # falhe quando o TEMP do sistema é limpo/sincronizado durante renders longos.
    tmp_render = Path(tempfile.gettempdir()) / f"motion_render_{os.getpid()}_{formato.id}"

    def _preparar_tmp() -> dict:
        shutil.rmtree(tmp_render, ignore_errors=True)
        tmp_render.mkdir(parents=True, exist_ok=True)
        return {**os.environ, "TMP": str(tmp_render), "TEMP": str(tmp_render), "TMPDIR": str(tmp_render)}

    preset = _preset_x264(getattr(projeto.render, "x264_preset", "veryfast"))
    if preset == "veryfast":
        # Prioriza velocidade no padrão sem perder a opção de presets mais lentos via config.
        preset = "superfast"
    tentativas = [
        {
            "rotulo": "padrao",
            "extras": [
                "--concurrency", str(conc),
                "--x264-preset", preset,
                "--crf", str(projeto.render.crf),
                "--timeout", "45000",
            ],
        },
        {
            "rotulo": "fallback estabilidade",
            "extras": [
                "--concurrency", "1",
                "--x264-preset", "ultrafast",
                "--crf", "28",
                "--timeout", "90000",
                "--disallow-parallel-encoding",
            ],
        },
        {
            "rotulo": "fallback compositor",
            "extras": [
                "--concurrency", "1",
                "--x264-preset", "ultrafast",
                "--crf", "30",
                "--timeout", "90000",
                "--disallow-parallel-encoding",
                "--offthreadvideo-video-threads", "1",
                "--offthreadvideo-cache-size-in-bytes", "134217728",
            ],
        },
        {
            "rotulo": "fallback memoria",
            "extras": [
                "--concurrency", "1",
                "--x264-preset", "ultrafast",
                "--crf", "32",
                "--scale", "0.75",
                "--timeout", "120000",
                "--disallow-parallel-encoding",
                "--offthreadvideo-video-threads", "1",
                "--offthreadvideo-cache-size-in-bytes", "67108864",
            ],
        },
        {
            "rotulo": "fallback extremo",
            "extras": [
                "--concurrency", "1",
                "--x264-preset", "ultrafast",
                "--crf", "34",
                "--scale", "0.6",
                "--timeout", "120000",
                "--disallow-parallel-encoding",
                "--offthreadvideo-video-threads", "1",
                "--offthreadvideo-cache-size-in-bytes", "50331648",
            ],
        },
    ]
    for i, tentativa in enumerate(tentativas, start=1):
        extras = tentativa["extras"]
        cmd = [*cmd_base, *extras]
        env_render = _preparar_tmp()
        code, log_render = _rodar_stream(cmd, REMOTION, env=env_render)
        if code == 0:
            if i > 1:
                print(f"[{ETAPA}] render concluído com parâmetros de fallback (tentativa {i}: {tentativa['rotulo']})")
            break
        erro_recuperavel = (
            _erro_memoria_render(log_render)
            or _erro_instabilidade_compositor(log_render)
            or _erro_stitch(log_render)
        )
        if i < len(tentativas) and erro_recuperavel:
            print(
                f"[{ETAPA}] falha de render ({tentativa['rotulo']}); repetindo com parâmetros mais leves…"
            )
            continue
        shutil.rmtree(tmp_render, ignore_errors=True)
        raise RuntimeError(f"Render falhou:\n{log_render[-6000:]}")

    shutil.rmtree(tmp_render, ignore_errors=True)

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
        subprocess.run([executavel("ffmpeg"), "-loglevel", "error", "-y", "-ss", f"{meio:.3f}", "-i", str(video),
                        "-frames:v", "1", "-vf", "scale=480:-2", "-q:v", "4", str(pasta / f"{cena.id}.jpg")],
                       check=False)
    print(f"[{ETAPA}] previews: {len(t.cenas)} cenas em {pasta.name}/")
