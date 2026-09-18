import json

import pytest

from pipeline import comum, edicao
from pipeline.comum import carregar_timeline
from pipeline.edicao import EdicaoInvalida, cenas_editaveis, editar_cena, validar_dados
from pipeline.schemas.timeline import Cena, Decisao, Timeline


@pytest.fixture
def projeto(tmp_path, monkeypatch):
    monkeypatch.setattr(comum, "PROJETOS", tmp_path)
    raiz = tmp_path / "p1"
    (raiz / "cache").mkdir(parents=True)
    (raiz / "projeto.json").write_text("{}", encoding="utf-8")
    c = comum.Caminhos("p1")
    t = Timeline(projeto_id="p1", gerado_em="2026-01-01T00:00:00", audio={"arquivo": "a.wav", "duracao_s": 6.0})
    t.cenas = [
        Cena(id="c001", indice=0, start_s=0, end_s=3, render_start_s=0, render_end_s=3, texto="fala um",
             decisao=Decisao(template="TituloImpacto", props_semanticas={"texto": "Um"}, origem="regra")),
        Cena(id="c002", indice=1, start_s=3, end_s=6, render_start_s=3, render_end_s=6, texto="fala dois",
             decisao=Decisao(template="TituloImpacto", props_semanticas={"texto": "Dois"}, origem="regra")),
    ]
    t.etapas_concluidas = ["m01", "m04", "m09", "m12", "m13", "m14"]
    comum.salvar_timeline(c, t)
    (c.cache / "roteiro_ao_vivo.json").write_text(json.dumps({"cenas": [
        {"id": "c001", "template": "TituloImpacto", "tela": "Um"},
        {"id": "c002", "template": "TituloImpacto", "tela": "Dois"},
    ]}), encoding="utf-8")
    (c.cache / "previews_16x9").mkdir()
    (c.cache / "previews_16x9" / "c002.jpg").write_bytes(b"x")
    return c


def test_editar_troca_template_e_invalida_render(projeto):
    r = editar_cena(projeto, "c002", "ListaAnimada", {"titulo": "Efeitos", "itens": ["A", "B"]})
    assert r["tela"].startswith("Efeitos")
    t = comum.carregar_timeline(projeto)
    cena = t.cenas[1]
    assert cena.decisao.template == "ListaAnimada"
    assert cena.decisao.origem == "manual"
    assert cena.revisao.editado_manualmente
    assert cena.props_finais is None and cena.render.hash_props is None
    assert (cena.render_start_s, cena.render_end_s) == (3, 6)
    assert t.etapas_concluidas == ["m01", "m04", "m09"]
    assert not (projeto.cache / "previews_16x9" / "c002.jpg").exists()
    ao_vivo = json.loads((projeto.cache / "roteiro_ao_vivo.json").read_text(encoding="utf-8"))
    assert ao_vivo["cenas"][1]["template"] == "ListaAnimada" and ao_vivo["cenas"][1]["editada"]
    assert ao_vivo["cenas"][0]["template"] == "TituloImpacto"
    assert [x["editada"] for x in cenas_editaveis(projeto)] == [False, True]


def test_dados_invalidos_nao_alteram_timeline(projeto):
    with pytest.raises(EdicaoInvalida, match="barras"):
        editar_cena(projeto, "c001", "GraficoBarras", {"barras": [{"rotulo": "x", "valor": 1}]})
    with pytest.raises(EdicaoInvalida, match="não existe"):
        editar_cena(projeto, "c001", "GraficoLinha", {})
    with pytest.raises(EdicaoInvalida, match="cena"):
        editar_cena(projeto, "c999", "Pergunta", {"texto": "?"})
    t = comum.carregar_timeline(projeto)
    assert t.cenas[0].decisao.origem == "regra" and "m14" in t.etapas_concluidas


def test_validar_converte_valores():
    d = validar_dados("GraficoBarras", {"barras": [{"rotulo": "a", "valor": "10,5"}, {"rotulo": "b", "valor": "3"}]})
    assert d["barras"][0]["valor"] == 10.5


def test_ajustar_tempos_move_fronteira_e_palavras(projeto):
    c = projeto
    t = carregar_timeline(c)
    fim_antes = t.cenas[0].render_end_s
    out = edicao.ajustar_tempos(c, "c001", None, fim_antes + 1.0)
    t = carregar_timeline(c)
    assert out["fim"] == t.cenas[0].render_end_s == t.cenas[1].render_start_s
    assert abs(t.cenas[-1].render_end_s - t.audio.duracao_s) < 0.01
    assert "m12" not in t.etapas_concluidas and "m09" in t.etapas_concluidas
    with pytest.raises(edicao.EdicaoInvalida):
        edicao.ajustar_tempos(c, "c001", 1.0, None)


def test_dividir_e_remover_cena(projeto):
    c = projeto
    n = len(carregar_timeline(c).cenas)
    out = edicao.dividir_cena(c, "c001")
    t = carregar_timeline(c)
    assert len(t.cenas) == n + 1 and out["id"] == "c002"
    assert [x.id for x in t.cenas] == [f"c{i + 1:03d}" for i in range(n + 1)]
    assert t.cenas[1].decisao.template == "TituloImpacto" and t.cenas[1].decisao.origem == "manual"
    with pytest.raises(edicao.EdicaoInvalida):
        edicao.dividir_cena(c, "c001", 99.0)
    edicao.remover_cena(c, "c002")
    t = carregar_timeline(c)
    assert len(t.cenas) == n and abs(t.cenas[-1].render_end_s - t.audio.duracao_s) < 0.01
