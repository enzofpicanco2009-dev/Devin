from pipeline import roteiro
from pipeline.m09_motor_decisao import _reconstruir
from pipeline.m12_aplicar_tema import decompor_numero
from pipeline.schemas.timeline import AudioInfo, Cena, Palavra, Timeline


def cena(i, s, e, texto, rs=None, re_=None):
    return Cena(id=f"c{i:03d}", indice=i - 1, start_s=s, end_s=e, render_start_s=rs if rs is not None else s,
                render_end_s=re_ if re_ is not None else e, texto=texto,
                palavras=[Palavra(w=w, s=s, e=e) for w in texto.split()])


def timeline():
    cenas = [
        cena(1, 0, 4, "A Selic é a taxa básica de juros."),
        cena(2, 4, 8, "Em 2020 chegou a dois por cento."),
        cena(3, 8, 12, "Em 2023 subiu para 13,75%."),
        cena(4, 12, 20, "Você sabe o que isso muda na sua vida?"),
    ]
    return Timeline(projeto_id="t", gerado_em="x", audio=AudioInfo(arquivo="a", duracao_s=20), cenas=cenas)


def test_regras_extraem_numeros_e_tendencia():
    t = timeline()
    rot = roteiro.roteiro_regras(t.cenas, [])
    assert [r.template for r in rot] == ["TituloImpacto", "NumeroDestaque", "SetaTendencia", "Pergunta"]
    assert rot[1].dados["valor"] == "2%"
    assert rot[2].dados == {"direcao": "sobe", "texto": "Em 2023 subiu para 13,75%", "valor": "13,75%",
                            "sentimento": "neutro"}


def test_regras_usam_imagem_por_tag():
    t = timeline()
    imgs = [{"id": "bc", "arquivo": "bc.png", "nome": "Banco Central", "tags": ["selic"]}]
    rot = roteiro.roteiro_regras(t.cenas, imgs)
    assert rot[0].template == "ImagemDestaque" and rot[0].dados["imagem"] == "bc"


def test_validacao_rejeita_template_inventado_e_cai_em_regras():
    v = roteiro.validar_cena({"segmentos": [1, 2], "template": "TextoSimples", "dados": {}}, set(), 4, log=lambda *_: None)
    assert v is not None and v.template == roteiro.TEMPLATE_REGRA and v.segmentos == [1, 2]
    assert roteiro.validar_cena({"segmentos": [9], "template": "Pergunta", "dados": {"texto": "x?"}}, set(), 4) is None
    ok = roteiro.validar_cena({"segmentos": [3], "template": "GraficoBarras",
                               "dados": {"barras": [{"rotulo": "2020", "valor": "2%"}, {"rotulo": "2023", "valor": 13.75}]}},
                              set(), 4)
    assert ok.origem == "llm" and ok.dados["barras"][0]["valor"] == 2.0


def test_reconstrucao_cobre_audio_e_absorve_trechos_omitidos():
    t = timeline()
    rot = [
        roteiro.CenaRoteiro(inicio=0, fim=0, segmentos=[1], template="TituloImpacto",
                            dados={"texto": "Selic", "palavras_destaque": []}, origem="llm"),
        roteiro.CenaRoteiro(inicio=0, fim=0, segmentos=[2, 3], template="GraficoBarras",
                            dados={"barras": [{"rotulo": "2020", "valor": 2}, {"rotulo": "2023", "valor": 13.75}]}, origem="llm"),
    ]
    cenas = _reconstruir(t, rot, [])
    t.cenas = cenas  # dispara as invariantes da timeline
    assert [c.decisao.template for c in cenas] == ["TituloImpacto", "GraficoBarras", "Pergunta"]
    assert cenas[1].render_start_s == 4 and cenas[1].render_end_s == 12
    assert cenas[2].decisao.origem == "regra"


def test_decompor_numero():
    assert decompor_numero("13,75%") == (13.75, "", "%", 2)
    assert decompor_numero("R$ 2.500") == (2500.0, "R$ ", "", 0)
    assert decompor_numero("dois") == (None, "dois", "", 0)
