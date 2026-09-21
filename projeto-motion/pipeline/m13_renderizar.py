"""M13 — Renderiza a composição `Video` do Remotion com a timeline inteira (um único mp4 mudo)."""
from __future__ import annotations

import shutil
import subprocess
import time
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


def _resetar_publico_projetos() -> None:
    """Limpa assets antigos de projetos para evitar symlinks legados no bundle do Remotion."""
    raiz = REMOTION / "public" / "projetos"
    if raiz.exists():
        shutil.rmtree(raiz, ignore_errors=True)
    raiz.mkdir(parents=True, exist_ok=True)


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
    legendas_ativas = True if not isinstance(video_cfg, dict) else bool(video_cfg.get("legendas_ativas", True))
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

    _resetar_publico_projetos()
    publicar_imagens(c)
    _publicar_audio_remotion(c, projeto)
    props_path = c.timeline_render(formato.id)
    salvar_json(props_path, dados)

    cmd_base = [
        executavel("npx"), "remotion", "render", "Video", str(saida),
        "--props", str(props_path),
        "--codec", projeto.render.codec,
        "--log", "warn",
        "--muted",
    ]
    print(f"[{ETAPA}] renderizando {len(t.cenas)} cenas, {t.audio.duracao_s:.1f}s @ {formato.fps}fps "
          f"{formato.largura}x{formato.altura} …")
    inicio = time.time()
    tentativas = [
        ["--concurrency", str(projeto.render.concorrencia), "--crf", str(projeto.render.crf)],
        ["--concurrency", "1", "--x264-preset", "ultrafast", "--crf", "28"],
    ]
    r = None
    for i, extras in enumerate(tentativas, start=1):
        cmd = [*cmd_base, *extras]
        r = subprocess.run(cmd, cwd=REMOTION, text=True, capture_output=True, encoding="utf-8", errors="replace")
        if r.returncode == 0:
            if i > 1:
                print(f"[{ETAPA}] render concluído com parâmetros de fallback (tentativa {i})")
            break
        saida_erro = f"{r.stdout}\n{r.stderr}"
        if i < len(tentativas) and _erro_memoria_render(saida_erro):
            print(f"[{ETAPA}] falha de memória no encoder; repetindo com parâmetros mais leves…")
            continue
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
        subprocess.run([executavel("ffmpeg"), "-loglevel", "error", "-y", "-ss", f"{meio:.3f}", "-i", str(video),
                        "-frames:v", "1", "-vf", "scale=480:-2", "-q:v", "4", str(pasta / f"{cena.id}.jpg")],
                       check=False)
    print(f"[{ETAPA}] previews: {len(t.cenas)} cenas em {pasta.name}/")
