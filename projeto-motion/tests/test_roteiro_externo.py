import json

import pytest

from pipeline import comum, roteiro_externo
from pipeline.schemas.timeline import Cena, Timeline


@pytest.fixture
def projeto(tmp_path, monkeypatch):
    monkeypatch.setattr(comum, "PROJETOS", tmp_path)
    raiz = tmp_path / "p1"
    (raiz / "cache").mkdir(parents=True)
    (raiz / "entrada").mkdir()
    (raiz / "projeto.json").write_text(json.dumps({
        "id": "p1", "canal_id": "canal_exemplo", "entrada": {"audio": "entrada/a.wav"},
        "formatos": [], "formato_principal": "16x9", "decisao": {"provedor": "nenhum"},
    }), encoding="utf-8")
    c = comum.Caminhos("p1")
    t = Timeline(projeto_id="p1", gerado_em="2026-01-01T00:00:00", audio={"arquivo": "a.wav", "duracao_s": 6.0})
    t.cenas = [
        Cena(id="c001", indice=0, start_s=0, end_s=3, render_start_s=0, render_end_s=3, texto="fala um"),
        Cena(id="c002", indice=1, start_s=3, end_s=6, render_start_s=3, render_end_s=6, texto="fala dois"),
    ]
    t.etapas_concluidas = ["m01", "m04"]
    comum.salvar_timeline(c, t)
    return c


def test_pacote_tem_transcricao_numerada_e_prompt(projeto):
    p = roteiro_externo.pacote(projeto)
    assert p["pronto"] and p["pendente"] and p["trechos"] == 2
    assert "#1 [0.0-3.0] fala um" in p["transcricao"]
    assert p["transcricao"] in p["prompt"]
    assert "TituloImpacto" in p["prompt"]


def test_aplicar_aceita_json_com_cerca_e_reabre_m09(projeto):
    texto = '```json\n{"cenas": [{"segmentos": [1, 2], "template": "Pergunta", "dados": {"texto": "Por quê?"}}]}\n```'
    info = roteiro_externo.aplicar(projeto, texto)
    assert info == {"cenas": 1, "trechos": 2}
    assert json.loads(projeto.projeto_json.read_text(encoding="utf-8"))["decisao"]["provedor"] == "externo"
    assert "m09" not in comum.carregar_timeline(projeto).etapas_concluidas
    rot = roteiro_externo.carregar(projeto)
    assert rot[0].template == "Pergunta" and rot[0].segmentos == [1, 2]


@pytest.mark.parametrize("texto", ["", "sem json", '{"cenas": []}',
                                   '{"cenas": [{"segmentos": [7], "template": "Pergunta", "dados": {"texto": "?"}}]}'])
def test_aplicar_rejeita_invalido(projeto, texto):
    with pytest.raises(roteiro_externo.RoteiroExternoInvalido):
        roteiro_externo.aplicar(projeto, texto)
    assert not (projeto.raiz / "entrada" / roteiro_externo.ARQUIVO).exists()


def test_dividir_em_blocos_corta_em_fim_de_palavra():
    from pipeline.m04_estruturar_cenas import Grupo, dividir_em_blocos
    palavras = [{"word": f"p{i}", "start": i * 0.5, "end": i * 0.5 + 0.4} for i in range(24)]  # 12 s de fala
    g = Grupo(0.0, 11.9, ["fala"], palavras, [0])
    blocos = dividir_em_blocos([g], 3.0)
    assert len(blocos) == 4
    assert [b.textos[0].split()[0] for b in blocos] == ["p0", "p6", "p12", "p18"]
    assert blocos[0].end <= blocos[1].start
    assert blocos[-1].end == 11.9
    curto = Grupo(0.0, 2.0, ["oi"], palavras[:4], [0])
    assert dividir_em_blocos([curto], 3.0) == [curto]
