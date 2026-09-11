from __future__ import annotations

import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from .schemas.config import Projeto
from .schemas.timeline import AudioInfo, Timeline

RAIZ = Path(__file__).resolve().parent.parent
CONFIG = RAIZ / "config"
CATALOGO = RAIZ / "catalogo"
REMOTION = RAIZ / "remotion"
PROJETOS = RAIZ / "projetos"


class Caminhos:
    def __init__(self, projeto_id: str):
        self.raiz = PROJETOS / projeto_id
        if not self.raiz.is_dir():
            raise FileNotFoundError(f"Projeto não encontrado: {self.raiz}")
        self.projeto_json = self.raiz / "projeto.json"
        self.timeline_json = self.raiz / "timeline.json"
        self.cache = self.raiz / "cache"
        self.saida = self.raiz / "saida"
        self.transcricao_json = self.cache / "transcricao.json"
        self.audio_wav = self.cache / "audio_16k.wav"
        self.cache.mkdir(exist_ok=True)
        self.saida.mkdir(exist_ok=True)

    def video_mudo(self, formato_id: str) -> Path:
        return self.cache / f"video_mudo_{formato_id}.mp4"

    def final(self, formato_id: str) -> Path:
        return self.saida / f"final_{formato_id}.mp4"

    def timeline_render(self, formato_id: str) -> Path:
        return self.cache / f"timeline_render_{formato_id}.json"


def carregar_projeto(c: Caminhos) -> Projeto:
    return Projeto.model_validate_json(c.projeto_json.read_text(encoding="utf-8"))


def carregar_timeline(c: Caminhos) -> Timeline:
    if not c.timeline_json.exists():
        raise FileNotFoundError("timeline.json não existe — rode `m01` primeiro")
    return Timeline.model_validate_json(c.timeline_json.read_text(encoding="utf-8"))


def salvar_timeline(c: Caminhos, t: Timeline) -> None:
    c.timeline_json.write_text(
        t.model_dump_json(indent=2, exclude_none=True), encoding="utf-8"
    )


def salvar_json(path: Path, dados) -> None:
    path.write_text(json.dumps(dados, ensure_ascii=False, indent=2), encoding="utf-8")


def agora_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def sha256_arquivo(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for bloco in iter(lambda: f.read(1 << 20), b""):
            h.update(bloco)
    return "sha256:" + h.hexdigest()


def sha256_obj(obj) -> str:
    dump = json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return "sha256:" + hashlib.sha256(dump.encode("utf-8")).hexdigest()


def rodar(cmd: list[str], cwd: Path | None = None) -> str:
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(
            f"Comando falhou ({r.returncode}): {' '.join(cmd)}\n{r.stderr[-4000:]}"
        )
    return r.stdout


def ffprobe(path: Path) -> dict:
    out = rodar(
        [
            "ffprobe", "-v", "error", "-print_format", "json",
            "-show_format", "-show_streams", str(path),
        ]
    )
    return json.loads(out)


def duracao_s(path: Path) -> float:
    return float(ffprobe(path)["format"]["duration"])


def info_audio(path: Path) -> AudioInfo:
    meta = ffprobe(path)
    stream = next(s for s in meta["streams"] if s["codec_type"] == "audio")
    return AudioInfo(
        arquivo=str(path),
        duracao_s=round(float(meta["format"]["duration"]), 3),
        sample_rate=int(stream.get("sample_rate", 0)) or None,
        hash=sha256_arquivo(path),
    )


def nova_timeline(projeto: Projeto, audio: AudioInfo) -> Timeline:
    return Timeline(projeto_id=projeto.id, gerado_em=agora_iso(), audio=audio)
