import json

import pytest

from pipeline import biblioteca, comum, roteiro
from pipeline.imagens import ids_por_tipo, listar_imagens


@pytest.fixture
def banco(tmp_path, monkeypatch):
    monkeypatch.setattr(biblioteca, "PASTA", tmp_path / "banco" / "midias")
    monkeypatch.setattr(biblioteca, "CATALOGO", tmp_path / "banco" / "biblioteca.json")
    monkeypatch.setattr(comum, "PROJETOS", tmp_path / "projetos")
    (tmp_path / "projetos" / "p1").mkdir(parents=True)
    (tmp_path / "projetos" / "p1" / "projeto.json").write_text("{}", encoding="utf-8")
    return comum.Caminhos("p1")


def test_adicionar_imagem_e_video(banco):
    img = biblioteca.adicionar("Logo Canal.png", b"png", "Logo do canal", "Logo amarelo em fundo escuro")
    vid = biblioteca.adicionar("bolsa.mp4", b"mp4", "Pregão", "Pessoas gritando na bolsa", tags=["Bolsa", "b3"])
    assert img["tipo"] == "imagem" and vid["tipo"] == "video"
    assert vid["tags"] == ["b3", "bolsa"]
    ids = [m["id"] for m in biblioteca.listar()]
    assert ids == [img["id"], vid["id"]]
    assert biblioteca.caminho(img).read_bytes() == b"png"


def test_nome_e_descricao_obrigatorios(banco):
    with pytest.raises(ValueError, match="nome"):
        biblioteca.adicionar("a.png", b"x", "  ", "desc")
    with pytest.raises(ValueError, match="descrição"):
        biblioteca.adicionar("a.png", b"x", "nome", "")
    with pytest.raises(ValueError, match="extensão"):
        biblioteca.adicionar("a.exe", b"x", "nome", "desc")


def test_ids_nao_colidem(banco):
    a = biblioteca.adicionar("a.png", b"1", "Logo", "d")
    b = biblioteca.adicionar("b.png", b"2", "Logo", "d")
    assert a["id"] != b["id"]


def test_atualizar_e_remover(banco):
    m = biblioteca.adicionar("a.png", b"x", "Antigo", "desc antiga")
    m2 = biblioteca.atualizar(m["id"], nome="Novo", descricao="desc nova", tags=["T"])
    assert (m2["nome"], m2["descricao"], m2["tags"]) == ("Novo", "desc nova", ["t"])
    with pytest.raises(ValueError):
        biblioteca.atualizar(m["id"], descricao="")
    with pytest.raises(KeyError):
        biblioteca.atualizar("nao_existe", nome="x")
    assert biblioteca.remover(m["id"]) is True
    assert biblioteca.listar() == []
    assert not biblioteca.caminho(m).exists()
    assert biblioteca.remover(m["id"]) is False


def test_vincular_copia_para_projeto_e_prompt(banco):
    img = biblioteca.adicionar("a.png", b"png", "Logo", "Logo amarelo")
    vid = biblioteca.adicionar("b.mp4", b"mp4", "Pregão", "Bolsa de valores lotada")
    biblioteca.adicionar("c.png", b"x", "Não usada", "não deve ir ao projeto")
    novos = biblioteca.vincular(banco, [img["id"], vid["id"], img["id"]])
    assert [n["id"] for n in novos] == [img["id"], vid["id"]]
    proj = listar_imagens(banco)
    assert {p["id"] for p in proj} == {img["id"], vid["id"]}
    assert all(p["biblioteca"] for p in proj)
    assert (banco.raiz / "imagens" / vid["arquivo"]).read_bytes() == b"mp4"
    # vincular de novo não duplica
    assert biblioteca.vincular(banco, [img["id"]]) == []
    with pytest.raises(KeyError):
        biblioteca.vincular(banco, ["fantasma"])

    texto = roteiro._imagens_texto(proj)
    assert f'id "{img["id"]}" (imagem) — Logo: Logo amarelo' in texto
    assert f'id "{vid["id"]}" (VÍDEO) — Pregão: Bolsa de valores lotada' in texto
    assert "Não usada" not in texto


def test_validar_cena_tipos_de_midia():
    tipos = {"logo": "imagem", "pregao": "video"}
    def tpl(b):
        v = roteiro.validar_cena(b, tipos, 4, log=lambda *_: None)
        return v.template if v else None

    assert tpl({"segmentos": [1], "template": "MidiaCheia", "dados": {"midia": "pregao"}}) == "MidiaCheia"
    assert tpl({"segmentos": [1], "template": "MidiaCheia", "dados": {"midia": "logo"}}) == "MidiaCheia"
    assert tpl({"segmentos": [1], "template": "ImagemDestaque", "dados": {"imagem": "logo", "texto": "x"}}) == "ImagemDestaque"
    # vídeo não serve em ImagemDestaque e id inexistente não serve em MidiaCheia: caem na regra
    assert tpl({"segmentos": [1], "template": "ImagemDestaque", "dados": {"imagem": "pregao", "texto": "x"}}) == "__regra__"
    assert tpl({"segmentos": [1], "template": "MidiaCheia", "dados": {"midia": "nada"}}) == "__regra__"


def test_ids_por_tipo_infere_de_arquivo():
    assert ids_por_tipo([{"id": "a", "arquivo": "a.mov"}, {"id": "b", "arquivo": "b.svg", "tipo": "imagem"}]) == {
        "a": "video", "b": "imagem"}
