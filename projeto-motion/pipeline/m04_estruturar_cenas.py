"""M04 — Agrupa segmentos da transcrição em cenas e preenche a linha do tempo sem gaps."""
from __future__ import annotations

import json
from dataclasses import dataclass, field

from .comum import Caminhos, carregar_projeto, carregar_timeline, salvar_timeline
from .m08_resolver_config import resolver
from .schemas.config import Ritmo
from .schemas.timeline import Cena, Palavra

ETAPA = "m04"
BLOCO_EXTERNO_S = 3.0  # tamanho dos trechos minutados quando outra IA decide o agrupamento


@dataclass
class Grupo:
    start: float
    end: float
    textos: list[str] = field(default_factory=list)
    palavras: list[dict] = field(default_factory=list)
    indices: list[int] = field(default_factory=list)

    @property
    def dur(self) -> float:
        return self.end - self.start

    def absorver(self, outro: "Grupo") -> None:
        self.end = max(self.end, outro.end)
        self.start = min(self.start, outro.start)
        self.textos += outro.textos
        self.palavras += outro.palavras
        self.indices += outro.indices


def _de_segmento(i: int, s: dict) -> Grupo:
    return Grupo(s["start"], s["end"], [s["text"]], list(s.get("words", [])), [i])


def limitar_ao_audio(segmentos: list[dict], duracao_audio: float) -> list[dict]:
    """Whisper pode estourar alguns ms além do fim do áudio; recorta tempos ao intervalo válido."""
    saida = []
    for s in segmentos:
        end = min(s["end"], duracao_audio)
        start = min(s["start"], end)
        if end <= start:
            continue
        palavras = []
        for w in s.get("words", []):
            we = min(w["end"], duracao_audio)
            palavras.append({**w, "start": min(w["start"], we), "end": we})
        saida.append({**s, "start": start, "end": end, "words": palavras})
    return saida


def agrupar_por_pausa(segmentos: list[dict], pausa: float) -> list[Grupo]:
    grupos: list[Grupo] = []
    for i, s in enumerate(segmentos):
        g = _de_segmento(i, s)
        if grupos and (g.start - grupos[-1].end) <= pausa:
            grupos[-1].absorver(g)
        else:
            grupos.append(g)
    return grupos


def dividir_longas(grupos: list[Grupo], segmentos: list[dict], r: Ritmo) -> list[Grupo]:
    """Cena > max: divide na fronteira entre segmentos com a maior pausa interna, mais próxima do meio.
    Fronteiras sem pausa (>= pausa_interna_min_s) só são usadas se não houver alternativa.
    Um único segmento de fala contínua nunca é cortado."""
    saida: list[Grupo] = []
    fila = list(grupos)
    while fila:
        g = fila.pop(0)
        if g.dur <= r.duracao_cena_max_s or len(g.indices) < 2:
            saida.append(g)
            continue
        meio = g.start + g.dur / 2
        melhor = None
        for a, b in zip(g.indices, g.indices[1:]):
            gap = segmentos[b]["start"] - segmentos[a]["end"]
            dist = abs(segmentos[b]["start"] - meio)
            score = (0 if gap >= r.pausa_interna_min_s else 1, -gap, dist)
            if melhor is None or score < melhor[0]:
                melhor = (score, b)
        if melhor is None:
            saida.append(g)
            continue
        corte = g.indices.index(melhor[1])
        esq = Grupo(0, 0)
        dir_ = Grupo(0, 0)
        for k, idx in enumerate(g.indices):
            alvo = esq if k < corte else dir_
            seg = _de_segmento(idx, segmentos[idx])
            if not alvo.indices:
                alvo.start, alvo.end = seg.start, seg.end
            alvo.absorver(seg)
        fila.insert(0, dir_)
        fila.insert(0, esq)
    return saida


def dividir_em_blocos(grupos: list[Grupo], alvo_s: float) -> list[Grupo]:
    """Recorta cada grupo em blocos de ~alvo_s cortando só em fim de palavra.
    Grupos sem tempos de palavra ficam inteiros."""
    saida: list[Grupo] = []
    for g in grupos:
        if not g.palavras or g.dur <= alvo_s * 1.5:
            saida.append(g)
            continue
        n = max(1, round(g.dur / alvo_s))
        passo = g.dur / n
        blocos: list[list[dict]] = [[] for _ in range(n)]
        for w in g.palavras:
            meio = (w["start"] + w["end"]) / 2
            blocos[min(n - 1, max(0, int((meio - g.start) / passo)))].append(w)
        saida += [_de_palavras(b, g.indices) for b in blocos if b]
    return saida


def _de_palavras(palavras: list[dict], indices: list[int]) -> Grupo:
    texto = " ".join(" ".join(w["word"] for w in palavras).split())
    return Grupo(palavras[0]["start"], palavras[-1]["end"], [texto], list(palavras), indices)


def fundir_curtas(grupos: list[Grupo], r: Ritmo) -> list[Grupo]:
    if not r.fundir_curtas:
        return grupos
    saida: list[Grupo] = []
    i = 0
    while i < len(grupos):
        g = grupos[i]
        if g.dur < r.duracao_cena_min_s:
            prox = grupos[i + 1] if i + 1 < len(grupos) else None
            if prox and (prox.end - g.start) <= r.duracao_cena_max_s:
                g.absorver(prox)
                grupos[i + 1] = g
                i += 1
                continue
            if saida and (g.end - saida[-1].start) <= r.duracao_cena_max_s:
                saida[-1].absorver(g)
                i += 1
                continue
        saida.append(g)
        i += 1
    return saida


def montar_cenas(grupos: list[Grupo], duracao_audio: float, r: Ritmo) -> list[Cena]:
    """Define render_start/end sem gaps. Silêncio > gap_max_s vira cena de preenchimento."""
    cenas: list[Cena] = []

    def add(start, end, rs, re, texto, palavras, indices, preenchimento=False):
        n = len(cenas) + 1
        cenas.append(Cena(
            id=f"c{n:03d}", indice=n - 1,
            start_s=round(start, 3), end_s=round(end, 3),
            render_start_s=round(rs, 3), render_end_s=round(re, 3),
            texto=texto,
            palavras=[Palavra(w=p["word"], s=p["start"], e=p["end"], p=p.get("probability", 1.0))
                      for p in palavras],
            segmentos_originais=indices, preenchimento=preenchimento,
        ))

    cursor = 0.0
    for k, g in enumerate(grupos):
        gap_antes = g.start - cursor
        if gap_antes > r.gap_max_s:
            add(cursor, g.start, cursor, g.start, "", [], [], preenchimento=True)
            rs = g.start
        else:
            rs = cursor
        prox_inicio = grupos[k + 1].start if k + 1 < len(grupos) else duracao_audio
        gap_depois = prox_inicio - g.end
        re = g.end if gap_depois > r.gap_max_s else prox_inicio
        re = min(re, duracao_audio)
        add(g.start, g.end, rs, re, " ".join(g.textos).strip(), g.palavras, g.indices)
        cursor = re

    if not cenas:
        add(0, duracao_audio, 0, duracao_audio, "", [], [], preenchimento=True)
    elif cenas[-1].render_end_s < duracao_audio:
        c = cenas[-1]
        if duracao_audio - c.render_end_s > r.gap_max_s:
            add(c.render_end_s, duracao_audio, c.render_end_s, duracao_audio, "", [], [], True)
        else:
            c.render_end_s = round(duracao_audio, 3)
    return cenas


def executar(projeto_id: str, force: bool = False) -> None:
    c = Caminhos(projeto_id)
    projeto = carregar_projeto(c)
    t = carregar_timeline(c)
    if not t.concluida("m01"):
        raise RuntimeError("m01 não concluída")
    if t.concluida(ETAPA) and not force:
        print(f"[{ETAPA}] já concluída (use --force para refazer)")
        return

    cfg = resolver(projeto)
    r = cfg.estilo.ritmo
    trans = json.loads(c.transcricao_json.read_text(encoding="utf-8"))
    segmentos = limitar_ao_audio(trans["segmentos"], t.audio.duracao_s)

    grupos = agrupar_por_pausa(segmentos, r.pausa_corte_s)
    n_pausa = len(grupos)
    if projeto.decisao.provedor == "externo":
        grupos = dividir_em_blocos(grupos, BLOCO_EXTERNO_S)
        n_div = n_fund = len(grupos)
    else:
        grupos = dividir_longas(grupos, segmentos, r)
        n_div = len(grupos)
        grupos = fundir_curtas(grupos, r)
        n_fund = len(grupos)
    cenas = montar_cenas(grupos, t.audio.duracao_s, r)

    t.cenas = cenas
    t.config_resolvida = cfg
    for etapa in ("m08", "m09", "m12", "m13", "m14"):
        if etapa in t.etapas_concluidas:
            t.etapas_concluidas.remove(etapa)
    t.marcar(ETAPA)
    t.marcar("m08")
    salvar_timeline(c, t)

    print(f"[{ETAPA}] por pausa: {n_pausa} | após dividir longas: {n_div} | após fundir curtas: {n_fund}")
    print(f"[{ETAPA}] {len(cenas)} cenas (incl. {sum(x.preenchimento for x in cenas)} de preenchimento):")
    for x in cenas:
        flag = "  [silêncio]" if x.preenchimento else ""
        alerta = "  ⚠ > max" if x.duracao_fala_s > r.duracao_cena_max_s + 0.01 else ""
        print(
            f"  {x.id}  fala {x.start_s:7.2f}–{x.end_s:7.2f} ({x.duracao_fala_s:4.1f}s)"
            f"  render {x.render_start_s:7.2f}–{x.render_end_s:7.2f} ({x.duracao_render_s:4.1f}s)"
            f"{flag}{alerta}  {x.texto[:60]}"
        )
