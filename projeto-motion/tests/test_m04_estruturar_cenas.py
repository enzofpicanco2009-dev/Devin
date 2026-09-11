from pipeline.m04_estruturar_cenas import (
    agrupar_por_pausa,
    dividir_longas,
    fundir_curtas,
    montar_cenas,
)
from pipeline.m12_aplicar_tema import caracteres_por_linha, linhas_por_formato
from pipeline.schemas.config import Ritmo
from pipeline.schemas.timeline import AudioInfo, Timeline

R = Ritmo()


def seg(start, end, text="x"):
    return {"start": start, "end": end, "text": text, "words": []}


def test_agrupa_por_pausa_e_separa_acima_do_limite():
    segs = [seg(0, 1), seg(1.2, 2), seg(2.6, 3)]
    grupos = agrupar_por_pausa(segs, 0.4)
    assert [(g.start, g.end) for g in grupos] == [(0, 2), (2.6, 3)]


def test_divide_longa_preferindo_pausa_interna():
    segs = [seg(0, 4), seg(4.05, 6), seg(6.4, 10)]
    grupos = dividir_longas(agrupar_por_pausa(segs, 0.5), segs, R)
    assert [(g.start, g.end) for g in grupos] == [(0, 6), (6.4, 10)]


def test_divide_longa_sem_pausa_usa_melhor_fronteira():
    segs = [seg(0, 5), seg(5.05, 10), seg(10.05, 12.5)]
    grupos = dividir_longas(agrupar_por_pausa(segs, 0.5), segs, R)
    assert len(grupos) == 3
    assert all(g.dur <= R.duracao_cena_max_s for g in grupos)

    segs = [seg(0, 5), seg(5.05, 12.5)]
    grupos = dividir_longas(agrupar_por_pausa(segs, 0.5), segs, R)
    assert [(g.start, g.end) for g in grupos] == [(0, 5), (5.05, 12.5)]


def test_nao_corta_segmento_unico_continuo():
    segs = [seg(0, 12)]
    grupos = dividir_longas(agrupar_por_pausa(segs, 0.4), segs, R)
    assert len(grupos) == 1 and grupos[0].dur == 12


def test_funde_curtas_com_vizinha():
    segs = [seg(0, 0.8), seg(1.5, 4), seg(5, 5.5)]
    grupos = fundir_curtas(agrupar_por_pausa(segs, 0.4), R)
    assert len(grupos) == 1
    assert (grupos[0].start, grupos[0].end) == (0, 5.5)


def test_fusao_respeita_maximo():
    segs = [seg(0, 1.0), seg(1.6, 8.5)]
    grupos = fundir_curtas(agrupar_por_pausa(segs, 0.4), R)
    assert len(grupos) == 2


def test_montar_cenas_estende_e_cria_preenchimento():
    segs = [seg(0.5, 2), seg(3, 5), seg(10, 12)]
    grupos = agrupar_por_pausa(segs, 0.4)
    cenas = montar_cenas(grupos, 13.0, R)
    assert [c.preenchimento for c in cenas] == [False, False, True, False]
    assert cenas[0].render_start_s == 0 and cenas[0].render_end_s == 3
    assert cenas[1].render_end_s == 5 and cenas[2].render_end_s == 10
    assert cenas[-1].render_end_s == 13


def test_timeline_valida_sem_gaps():
    segs = [seg(0.2, 2), seg(2.6, 4)]
    cenas = montar_cenas(agrupar_por_pausa(segs, 0.4), 4.5, R)
    t = Timeline(projeto_id="t", gerado_em="2026-01-01T00:00:00", audio=AudioInfo(arquivo="a.wav", duracao_s=4.5), cenas=cenas)
    assert len(t.cenas) == 2 and t.cenas[0].render_start_s == 0


def test_layout_por_formato():
    assert caracteres_por_linha(28, 1920, 6) == 28
    assert caracteres_por_linha(28, 1080, 6) < 18
    assert linhas_por_formato(3, 1920, 1080) == 3
    assert linhas_por_formato(3, 1080, 1920) == 6


def test_limita_transcricao_ao_audio():
    from pipeline.m04_estruturar_cenas import limitar_ao_audio

    segs = [{"start": 0, "end": 9.9, "text": "a", "words": []},
            {"start": 9.95, "end": 10.1, "text": "b", "words": [{"word": "b", "start": 9.95, "end": 10.1}]}]
    out = limitar_ao_audio(segs, 10.0)
    assert out[-1]["end"] == 10.0 and out[-1]["words"][0]["end"] == 10.0
    cenas = montar_cenas(agrupar_por_pausa(out, 0.4), 10.0, R)
    assert all(c.end_s <= c.render_end_s for c in cenas)


def test_id_projeto_rejeita_traversal():
    import pytest
    from pipeline.comum import Caminhos

    with pytest.raises(ValueError):
        Caminhos("../etc")
    with pytest.raises(ValueError):
        Caminhos("a/b")
