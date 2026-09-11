"""Roteiro visual: transforma a transcrição em cenas por IDEIA com template + dados de tela.

Duas fontes:
- `roteiro_llm`: Ollama (local). Recebe a transcrição com tempos e a lista de imagens do projeto.
- `roteiro_regras`: heurísticas sobre as cenas do M04 (fallback quando não há LLM ou a resposta é inválida).

Saída comum: lista de `CenaRoteiro(inicio, fim, template, dados)`. O M09 encaixa nos tempos das palavras.
"""
from __future__ import annotations

import re
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field, ValidationError, field_validator

from . import llm
from .schemas.timeline import Cena

Sentimento = Literal["positivo", "negativo", "neutro"]


# ---------------------------------------------------------------- dados por template

class DTitulo(BaseModel):
    texto: str = Field(min_length=1, max_length=120)
    palavras_destaque: list[str] = Field(default_factory=list, max_length=3)


class DPergunta(BaseModel):
    texto: str = Field(min_length=1, max_length=120)


class DCitacao(BaseModel):
    texto: str = Field(min_length=1, max_length=220)
    autor: str = ""


class DNumero(BaseModel):
    valor: str = Field(min_length=1, max_length=20)
    rotulo: str = Field(default="", max_length=60)
    sentimento: Sentimento = "neutro"

    @field_validator("valor", mode="before")
    @classmethod
    def _str(cls, v):
        return str(v)


class DLado(BaseModel):
    rotulo: str = Field(min_length=1, max_length=40)
    valor: str = Field(default="", max_length=20)

    @field_validator("valor", mode="before")
    @classmethod
    def _str(cls, v):
        return "" if v is None else str(v)


class DComparacao(BaseModel):
    titulo: str = Field(default="", max_length=60)
    a: DLado
    b: DLado
    vencedor: Literal["a", "b", "nenhum"] = "nenhum"


class DBarra(BaseModel):
    rotulo: str = Field(min_length=1, max_length=24)
    valor: float

    @field_validator("valor", mode="before")
    @classmethod
    def _num(cls, v):
        return _float(v) if isinstance(v, str) else v


class DGrafico(BaseModel):
    titulo: str = Field(default="", max_length=60)
    barras: list[DBarra] = Field(min_length=2, max_length=6)
    unidade: str = Field(default="", max_length=10)


class DSeta(BaseModel):
    direcao: Literal["sobe", "desce"]
    texto: str = Field(default="", max_length=60)
    valor: str = Field(default="", max_length=20)
    sentimento: Sentimento = "neutro"

    @field_validator("valor", mode="before")
    @classmethod
    def _str(cls, v):
        return "" if v is None else str(v)


class DImagem(BaseModel):
    imagem: str
    texto: str = Field(default="", max_length=60)
    legenda: str = Field(default="", max_length=120)


class DLista(BaseModel):
    titulo: str = Field(default="", max_length=60)
    itens: list[str] = Field(min_length=2, max_length=6)


DADOS = {
    "TituloImpacto": DTitulo,
    "Pergunta": DPergunta,
    "Citacao": DCitacao,
    "NumeroDestaque": DNumero,
    "ComparacaoDoisLados": DComparacao,
    "GraficoBarras": DGrafico,
    "SetaTendencia": DSeta,
    "ImagemDestaque": DImagem,
    "ListaAnimada": DLista,
}

TEMPLATE_REGRA = "__regra__"  # marcador: decidir por regras na reconstrução


class CenaRoteiro(BaseModel):
    inicio: float
    fim: float
    segmentos: list[int] = Field(default_factory=list)  # índices (1-based) dos trechos da transcrição
    template: str
    dados: dict[str, Any]
    origem: Literal["llm", "regra"] = "regra"
    justificativa: str = ""


# ---------------------------------------------------------------- LLM

PROMPT = """Você é o roteirista visual de um canal do YouTube. Recebe a transcrição de uma narração dividida em trechos numerados (#1, #2, …) e cria o ROTEIRO DE CENAS de motion graphics.

Como pensar:
1. Leia tudo e identifique as IDEIAS. Uma cena = uma ideia = um ou mais trechos CONSECUTIVOS. Cada trecho pertence a exatamente uma cena; todos os trechos devem ser usados, em ordem.
2. Para cada cena, escolha a animação que MELHOR MOSTRA aquilo que é dito NAQUELES trechos (número → NumeroDestaque; evolução no tempo com 2+ valores → GraficoBarras; subiu/caiu → SetaTendencia; A contra B → ComparacaoDoisLados; enumeração → ListaAnimada; pergunta retórica → Pergunta; fala de alguém → Citacao; menciona algo que existe nas imagens → ImagemDestaque; afirmação forte/gancho/conclusão → TituloImpacto).
3. Escreva o que aparece NA TELA: curto, direto, como um slide. NUNCA copie a frase falada. Títulos com até 6 palavras. Números exatamente como o narrador diz (ex.: "13,75%", "R$ 2 mil", "2%"). Só use números que aparecem nos trechos daquela cena (um gráfico pode juntar números de trechos vizinhos: nesse caso inclua esses trechos na cena).
4. Varie: nunca use o mesmo template em 3 cenas seguidas.
5. Cenas ideais duram de 3 a 9 segundos (veja os tempos dos trechos). Junte trechos curtos que falam da mesma coisa.

Templates e seus dados (use exatamente estes nomes de campos):
- TituloImpacto: {{"texto": "...", "palavras_destaque": ["..."]}}
- Pergunta: {{"texto": "...?"}}
- Citacao: {{"texto": "...", "autor": "..."}}
- NumeroDestaque: {{"valor": "13,75%", "rotulo": "taxa Selic hoje", "sentimento": "positivo|negativo|neutro"}}
- ComparacaoDoisLados: {{"titulo": "...", "a": {{"rotulo": "...", "valor": "..."}}, "b": {{"rotulo": "...", "valor": "..."}}, "vencedor": "a|b|nenhum"}}
- GraficoBarras: {{"titulo": "...", "barras": [{{"rotulo": "2020", "valor": 2}}, {{"rotulo": "2023", "valor": 13.75}}], "unidade": "%"}}
- SetaTendencia: {{"direcao": "sobe|desce", "texto": "...", "valor": "+11 p.p.", "sentimento": "positivo|negativo|neutro"}}
- ListaAnimada: {{"titulo": "...", "itens": ["...", "..."]}}
- ImagemDestaque: {{"imagem": "<id da imagem>", "texto": "...", "legenda": "..."}}  (só se houver imagem com id compatível)
{imagens}
Canal: {canal}

Exemplo (outro assunto) — transcrição "#1 [0.0-3.1] O café é a bebida mais consumida do país. #2 [3.1-5.0] São 21 milhões de sacas por ano. #3 [5.0-6.4] E o consumo só cresce." vira:
{{"cenas": [
  {{"segmentos": [1], "template": "TituloImpacto", "dados": {{"texto": "A bebida número 1 do Brasil", "palavras_destaque": ["número 1"]}}, "por_que": "gancho"}},
  {{"segmentos": [2, 3], "template": "NumeroDestaque", "dados": {{"valor": "21 milhões", "rotulo": "sacas por ano", "sentimento": "positivo"}}, "por_que": "número central; #3 é curto e complementa"}}
]}}

Transcrição:
{transcricao}

Responda SOMENTE com o JSON."""


def segmentos_falados(cenas: list[Cena]) -> list[Cena]:
    return [c for c in cenas if not c.preenchimento and c.texto.strip()]


def _transcricao_texto(cenas: list[Cena]) -> str:
    return "\n".join(f"#{i} [{c.start_s:.1f}-{c.end_s:.1f}] {c.texto.strip()}"
                     for i, c in enumerate(segmentos_falados(cenas), start=1))


def _imagens_texto(imagens: list[dict]) -> str:
    if not imagens:
        return "\nImagens disponíveis: nenhuma (não use ImagemDestaque).\n"
    itens = "\n".join(f'  - id "{i["id"]}": {i.get("descricao") or i.get("nome") or i["id"]}'
                      f'{" (tags: " + ", ".join(i["tags"]) + ")" if i.get("tags") else ""}'
                      for i in imagens)
    return f"\nImagens disponíveis neste projeto (use o id em ImagemDestaque quando a fala mencionar):\n{itens}\n"


def _segmentos(bruta: dict, n_segmentos: int) -> list[int]:
    try:
        return sorted({int(s) for s in bruta.get("segmentos", []) if 1 <= int(s) <= n_segmentos})
    except (TypeError, ValueError):
        return []


def validar_cena(bruta: dict, ids_imagens: set[str], n_segmentos: int, log=print) -> CenaRoteiro | None:
    """Cena válida da IA, ou cena marcada TEMPLATE_REGRA se os dados forem inválidos mas os trechos não."""
    segs = _segmentos(bruta, n_segmentos)
    if not segs:
        return None
    template = str(bruta.get("template", ""))
    try:
        if template not in DADOS:
            raise ValueError(f"template desconhecido '{template}'")
        dados = DADOS[template].model_validate(bruta.get("dados") or {})
        if template == "ImagemDestaque" and dados.imagem not in ids_imagens:
            raise ValueError(f"imagem '{dados.imagem}' não existe")
    except (ValidationError, ValueError) as e:
        log(f"[m09]   trechos {segs}: resposta da IA inválida ({str(e).splitlines()[0][:80]}) — regras")
        return CenaRoteiro(inicio=0.0, fim=0.0, segmentos=segs, template=TEMPLATE_REGRA, dados={},
                           origem="regra", justificativa="IA inválida")
    return CenaRoteiro(
        inicio=0.0, fim=0.0, segmentos=segs, template=template,
        dados=dados.model_dump(), origem="llm", justificativa=str(bruta.get("por_que", ""))[:200],
    )


def roteiro_llm(cenas: list[Cena], imagens: list[dict], canal_desc: str, modelo: str,
                temperatura: float = 0.3, log=print) -> list[CenaRoteiro]:
    prompt = PROMPT.format(
        imagens=_imagens_texto(imagens), canal=canal_desc or "canal educativo",
        transcricao=_transcricao_texto(cenas),
    )
    log(f"[m09] IA ({modelo}) lendo a transcrição e escrevendo o roteiro…")
    resposta = llm.gerar_json(prompt, modelo, temperatura)
    brutas = resposta.get("cenas") if isinstance(resposta, dict) else None
    if not isinstance(brutas, list):
        raise ValueError("resposta do LLM sem lista 'cenas'")
    ids_img = {i["id"] for i in imagens}
    n = len(segmentos_falados(cenas))
    saida: list[CenaRoteiro] = []
    usados: set[int] = set()
    for b in brutas:
        v = validar_cena(b, ids_img, n, log) if isinstance(b, dict) else None
        if v:
            v.segmentos = [s for s in v.segmentos if s not in usados]
        if v and v.segmentos:
            usados.update(v.segmentos)
            saida.append(v)
        else:
            log(f"[m09]   cena inválida descartada: {str(b)[:120]}")
    saida.sort(key=lambda c: c.segmentos[0])
    return saida


# ---------------------------------------------------------------- regras (fallback)

RE_NUM = re.compile(r"(R\$\s?)?(\d+(?:\.\d{3})*(?:,\d+)?|\d+(?:\.\d+)?)\s*(%|por cento|mil|milh(?:ão|ões)|bilh(?:ão|ões)|anos?|reais|p\.p\.)?", re.I)
POR_EXTENSO = {"um": "1", "uma": "1", "dois": "2", "duas": "2", "três": "3", "quatro": "4", "cinco": "5", "seis": "6",
               "sete": "7", "oito": "8", "nove": "9", "dez": "10", "vinte": "20", "trinta": "30", "cinquenta": "50",
               "cem": "100", "mil": "1000", "metade": "50%"}
RE_EXTENSO = re.compile(r"\b(" + "|".join(POR_EXTENSO) + r")\b(?=\s+(?:por cento|mil|milh|bilh|anos|reais|vezes))", re.I)
RE_SOBE = re.compile(r"\b(subiu|sobe|aumentou|aumenta|cresceu|cresce|disparou|dobrou|alta)\b", re.I)
RE_DESCE = re.compile(r"\b(caiu|cai|desceu|diminuiu|diminui|despencou|reduziu|queda|baixou)\b", re.I)
RE_LISTA = re.compile(r"\b(primeiro|segundo|terceiro|tr[êe]s|quatro|cinco)\b.*\b(segundo|terceiro|depois|e por fim|por último)\b", re.I | re.S)
RE_CITA = re.compile(r"\b(disse|afirmou|segundo|como diz|nas palavras de)\b", re.I)
RE_ANO = re.compile(r"\b(19|20)\d{2}\b")


def _numeros(texto: str) -> list[str]:
    texto = RE_EXTENSO.sub(lambda m: POR_EXTENSO[m.group(1).lower()], texto)
    out = []
    for m in RE_NUM.finditer(texto):
        pref, num, suf = m.group(1) or "", m.group(2), (m.group(3) or "")
        if RE_ANO.fullmatch(num) and not suf:
            continue
        suf = {"por cento": "%"}.get(suf.lower(), suf)
        out.append(f"{pref.strip()}{' ' if pref else ''}{num}{'' if suf in ('', '%') else ' '}{suf}".strip())
    return out


def _titulo_curto(texto: str, max_palavras: int = 7) -> str:
    t = re.sub(r"[.!?…]+$", "", texto.strip())
    partes = re.split(r"(?<!\d)[,;:–—]| que | e | mas | porque | então ", t, maxsplit=1)
    t = partes[0].strip() or t
    palavras = t.split()
    if len(palavras) > max_palavras:
        t = " ".join(palavras[:max_palavras]) + "…"
    return t[:1].upper() + t[1:]


def _palavras_chave(texto: str) -> list[str]:
    return [w.strip(".,;:!?") for w in texto.split()
            if w[:1].isupper() and len(w) > 3 and not w.isupper()][:2] + \
           [w.strip(".,;:!?") for w in texto.split() if w.isupper() and len(w) > 2][:1]


def decidir_regra(cena: Cena, imagens: list[dict], anterior: str | None) -> CenaRoteiro:
    txt = cena.texto.strip()
    nums = _numeros(txt)
    anos = RE_ANO.findall(txt)
    dur = cena.duracao_render_s
    img = _imagem_para(txt, imagens)
    tpl, dados, why = "TituloImpacto", {"texto": _titulo_curto(txt), "palavras_destaque": _palavras_chave(txt)[:3]}, "afirmação"

    if img and anterior != "ImagemDestaque":
        tpl, dados, why = "ImagemDestaque", {"imagem": img["id"], "texto": _titulo_curto(txt, 5), "legenda": ""}, f"menciona '{img['id']}'"
    elif txt.rstrip().endswith("?"):
        tpl, dados, why = "Pergunta", {"texto": _titulo_curto(txt, 12) + "?"}, "pergunta"
    elif len(nums) >= 3 and dur >= 4 and len(RE_ANO.findall(txt)) >= 2:
        pares = list(zip(RE_ANO.findall(txt), nums))
        tpl, dados, why = "GraficoBarras", {
            "titulo": _titulo_curto(txt, 5),
            "barras": [{"rotulo": a, "valor": _float(n)} for a, n in pares[:6]],
            "unidade": "%" if "%" in nums[0] else "",
        }, "série de valores por ano"
    elif (RE_SOBE.search(txt) or RE_DESCE.search(txt)) and nums:
        tpl, dados, why = "SetaTendencia", {
            "direcao": "sobe" if RE_SOBE.search(txt) else "desce",
            "texto": _titulo_curto(txt, 5), "valor": nums[-1], "sentimento": "neutro",
        }, "verbo de tendência + número"
    elif len(nums) == 2 and dur >= 3:
        tpl, dados, why = "ComparacaoDoisLados", {
            "titulo": _titulo_curto(txt, 5),
            "a": {"rotulo": "Antes", "valor": nums[0]}, "b": {"rotulo": "Depois", "valor": nums[1]},
            "vencedor": "nenhum",
        }, "dois números"
    elif nums:
        tpl, dados, why = "NumeroDestaque", {"valor": nums[0], "rotulo": _titulo_curto(txt, 6), "sentimento": "neutro"}, "um número"
    elif RE_LISTA.search(txt) and dur >= 4:
        itens = [i.strip(" .") for i in re.split(r",| e |;", re.sub(r"^.*?:", "", txt)) if i.strip()]
        if 2 <= len(itens) <= 6:
            tpl, dados, why = "ListaAnimada", {"titulo": _titulo_curto(txt, 5), "itens": [_titulo_curto(i, 5) for i in itens]}, "enumeração"
    elif RE_CITA.search(txt) and len(txt.split()) <= 30:
        tpl, dados, why = "Citacao", {"texto": txt, "autor": ""}, "citação"

    if tpl == anterior and tpl != "TituloImpacto" and anterior is not None:
        pass  # repetição tolerada; o M09 limita repetições consecutivas
    return CenaRoteiro(inicio=cena.start_s, fim=cena.end_s, template=tpl, dados=dados,
                       origem="regra", justificativa=why)


def _float(s: str) -> float:
    s = re.sub(r"[^\d,.\-]", "", s).replace(".", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return 0.0


def _imagem_para(texto: str, imagens: list[dict]) -> Optional[dict]:
    t = texto.lower()
    for img in imagens:
        chaves = [img["id"], img.get("nome", "")] + list(img.get("tags", []))
        for k in chaves:
            k = (k or "").lower().replace("_", " ").strip()
            if len(k) >= 3 and re.search(rf"\b{re.escape(k)}\b", t):
                return img
    return None


def roteiro_regras(cenas: list[Cena], imagens: list[dict]) -> list[CenaRoteiro]:
    saida: list[CenaRoteiro] = []
    anterior = None
    for c in cenas:
        if c.preenchimento or not c.texto.strip():
            continue
        r = decidir_regra(c, imagens, anterior)
        anterior = r.template
        saida.append(r)
    return saida
