"""Roteiro visual: transforma a transcrição em cenas por IDEIA com template + dados de tela.

Duas fontes:
- `roteiro_llm`: Ollama (local). Recebe a transcrição com tempos e a lista de imagens do projeto.
- `roteiro_regras`: heurísticas sobre as cenas do M04 (fallback quando não há LLM ou a resposta é inválida).

Saída comum: lista de `CenaRoteiro(inicio, fim, template, dados)`. O M09 encaixa nos tempos das palavras.
"""
from __future__ import annotations

import re
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator

from . import llm
from .imagens import ids_por_tipo
from .schemas.timeline import Cena

Sentimento = Literal["positivo", "negativo", "neutro"]
AnimacaoEntrada = Literal["padrao", "de_baixo", "de_cima"]
AnimacaoSaida = Literal["padrao", "para_cima", "para_baixo"]


class DAnimacao(BaseModel):
    animacao_entrada: AnimacaoEntrada = "padrao"
    animacao_saida: AnimacaoSaida = "padrao"


# ---------------------------------------------------------------- dados por template

class DTitulo(DAnimacao):
    texto: str = Field(min_length=1, max_length=120)
    palavras_destaque: list[str] = Field(default_factory=list, max_length=3)


class DPergunta(DAnimacao):
    texto: str = Field(min_length=1, max_length=120)


class DTexto(DAnimacao):
    texto: str = Field(min_length=1, max_length=200)
    destaque: list[str] = Field(default_factory=list, max_length=2)


class DCitacao(DAnimacao):
    texto: str = Field(min_length=1, max_length=220)
    autor: str = ""


class DNumero(DAnimacao):
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
    itens: list[str] = Field(default_factory=list, max_length=4)

    @field_validator("valor", mode="before")
    @classmethod
    def _str(cls, v):
        return "" if v is None else str(v)


class DComparacao(DAnimacao):
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


class DGrafico(DAnimacao):
    titulo: str = Field(default="", max_length=60)
    barras: list[DBarra] = Field(min_length=2, max_length=6)
    unidade: str = Field(default="", max_length=10)


class DSeta(DAnimacao):
    direcao: Literal["sobe", "desce"]
    texto: str = Field(default="", max_length=60)
    valor: str = Field(default="", max_length=20)
    sentimento: Sentimento = "neutro"

    @field_validator("valor", mode="before")
    @classmethod
    def _str(cls, v):
        return "" if v is None else str(v)


class DImagem(DAnimacao):
    imagem: str
    texto: str = Field(default="", max_length=60)
    legenda: str = Field(default="", max_length=120)


class DMidia(DAnimacao):
    midia: str
    ajusteImagem: Literal["cover", "contain"] = "contain"
    zoom: Literal["in", "out", "nenhum"] = "nenhum"
    zoomMax: float = Field(default=1.08, ge=1.0, le=1.3)


class DLista(DAnimacao):
    titulo: str = Field(default="", max_length=60)
    itens: list[str] = Field(min_length=2, max_length=6)


class DLegenda(DAnimacao):
    texto: str = Field(default="", max_length=400)
    palavras_destaque: list[str] = Field(default_factory=list, max_length=4)


class DTextoLongo(DAnimacao):
    texto: str = Field(min_length=1, max_length=400)
    destaque_frases: list[str] = Field(default_factory=list, max_length=3)


class DFatia(BaseModel):
    rotulo: str = Field(min_length=1, max_length=30)
    valor: float = Field(gt=0)


class DGraficoPizza(DAnimacao):
    titulo: str = Field(default="", max_length=60)
    fatias: list[DFatia] = Field(min_length=2, max_length=6)
    estilo: Literal["pizza", "donut"] = "donut"
    destacar_indice: Optional[int] = Field(default=None, ge=0)


class DEvento(BaseModel):
    marcador: str = Field(min_length=1, max_length=20)
    descricao: str = Field(min_length=1, max_length=60)


class DTimeline(DAnimacao):
    titulo: str = Field(default="", max_length=60)
    eventos: list[DEvento] = Field(min_length=2, max_length=6)
    orientacao: Literal["horizontal", "vertical"] = "horizontal"


class DPlanilha(DAnimacao):
    titulo: str = Field(default="", max_length=60)
    colunas: list[str] = Field(min_length=2, max_length=4)
    linhas: list[list[str]] = Field(min_length=1, max_length=5)
    destacar_coluna: Optional[int] = Field(default=None, ge=0)
    destacar_linha: Optional[int] = Field(default=None, ge=0)

    @model_validator(mode="after")
    def _celulas(self):
        n = len(self.colunas)
        for i, linha in enumerate(self.linhas):
            if len(linha) != n:
                raise ValueError(f"linha {i + 1} tem {len(linha)} células; esperado {n}")
        if self.destacar_coluna is not None and self.destacar_coluna >= n:
            raise ValueError("destacar_coluna fora do intervalo")
        if self.destacar_linha is not None and self.destacar_linha >= len(self.linhas):
            raise ValueError("destacar_linha fora do intervalo")
        return self


class DMapaNo(BaseModel):
    id: str = Field(min_length=1, max_length=24)
    texto: str = Field(min_length=1, max_length=90)

    @field_validator("id")
    @classmethod
    def _id_hierarquico(cls, v: str) -> str:
        vv = str(v).strip()
        if not re.fullmatch(r"\d+(?:\.\d+)*", vv):
            raise ValueError("id deve seguir hierarquia como 1, 1.1, 1.1.1")
        return vv


class DMapaMental(DAnimacao):
    titulo: str = Field(default="", max_length=70)
    itens: list[DMapaNo] = Field(min_length=2, max_length=16)


class DCTA(DAnimacao):
    texto_principal: str = Field(min_length=1, max_length=70)
    subtexto: str = Field(default="", max_length=90)
    estilo_botao: Literal["solido", "contorno"] = "solido"


class DFundoCena(BaseModel):
    midia: str
    brilho: float = 1.0
    contraste: float = 1.0
    saturacao: float = 1.0
    desfoque_px: float = 0.0
    opacidade: float = 1.0
    escurecer: float = 0.0
    zoom: float = 1.0
    posicao_x: float = 0.5
    posicao_y: float = 0.5


DADOS = {
    "TextoCorrido": DTexto,
    "TituloImpacto": DTitulo,
    "Pergunta": DPergunta,
    "Citacao": DCitacao,
    "NumeroDestaque": DNumero,
    "ComparacaoDoisLados": DComparacao,
    "GraficoBarras": DGrafico,
    "SetaTendencia": DSeta,
    "ImagemDestaque": DImagem,
    "MidiaCheia": DMidia,
    "ListaAnimada": DLista,
    "LegendaSincronizada": DLegenda,
    "TextoLongo": DTextoLongo,
    "GraficoPizza": DGraficoPizza,
    "Timeline": DTimeline,
    "Planilha": DPlanilha,
    "MapaMental": DMapaMental,
    "MapaMentalCartoes": DMapaMental,
    "CTAFinal": DCTA,
}

TEMPLATE_REGRA = "__regra__"  # marcador: decidir por regras na reconstrução


class CenaRoteiro(BaseModel):
    inicio: float
    fim: float
    segmentos: list[int] = Field(default_factory=list)  # índices (1-based) dos trechos da transcrição
    template: str
    dados: dict[str, Any]
    fundo: Optional[dict[str, Any]] = None
    origem: Literal["llm", "regra"] = "regra"
    justificativa: str = ""


# ---------------------------------------------------------------- LLM

PROMPT = """Você é o roteirista visual de um canal do YouTube. Recebe a transcrição de uma narração dividida em trechos numerados (#1, #2, …) e cria o ROTEIRO DE CENAS de motion graphics.

Como pensar:
1. Leia tudo e identifique as IDEIAS. Uma cena = uma ideia = um ou mais trechos CONSECUTIVOS. Cada trecho pertence a exatamente uma cena; todos os trechos devem ser usados, em ordem.
2. Para cada cena, escolha a animação que MELHOR MOSTRA aquilo que é dito NAQUELES trechos (número → NumeroDestaque; evolução no tempo com 2+ valores → GraficoBarras; subiu/caiu → SetaTendencia; A contra B → ComparacaoDoisLados; enumeração → ListaAnimada; pergunta retórica → Pergunta; fala de alguém → Citacao; menciona algo que existe nas mídias disponíveis → ImagemDestaque (imagem + título, SEMPRE com campo "fundo") ou MidiaCheia (a imagem/vídeo sozinho em tela cheia, sem texto); afirmação forte/gancho/conclusão → TituloImpacto; explicação corrida sem número nem lista → TextoCorrido com um RESUMO de 1 frase; parágrafo explicativo mais longo (2–3 frases) em que vale marcar frases-chave → TextoLongo; partes de um todo / percentuais que somam (ou quase) 100% → GraficoPizza; sequência de datas, anos ou etapas em ordem → Timeline; vários itens comparados em 2 a 4 atributos (preço, prazo, taxa…) → Planilha; estrutura em árvore com ramificações e hierarquia numérica (1, 1.1, 1.1.1...) → MapaMental; trecho de fala marcante que merece aparecer PALAVRA POR PALAVRA, grande e centralizado, acendendo no ritmo da narração → LegendaSincronizada (o texto na tela é a própria fala, não um resumo; use com FREQUÊNCIA: em 1 a cada 3–4 cenas, cerca de 25% do roteiro)).
2.1. Em cada cena, escolha também o MODO VISUAL:
    - template puro: não envie campo "fundo".
    - template + mídia: envie campo "fundo" com uma mídia válida + ajustes.
    - só mídia: use template MidiaCheia (sem texto) e sem campo "fundo".
2.2. Regra de uso de mídia quando houver itens em "Mídias disponíveis neste projeto":
    - Use mídia em pelo menos 1 a cada 3 cenas (via MidiaCheia OU campo "fundo").
    - Para cenas de texto (pergunta, título, lista, texto corrido/longo), prefira template + mídia com campo "fundo" quando a legibilidade permitir.
    - Nunca invente id: use apenas ids da lista de mídias disponíveis.
    - REGRA OBRIGATÓRIA PARA ImagemDestaque: toda cena ImagemDestaque DEVE ter o campo "fundo" preenchido.
    - Para MidiaCheia, prefira VÍDEOS. Se a ideia pedir imagem sem fundo, prefira ImagemDestaque com "fundo".
2.3. Proporção visual alvo (aproximada) quando houver mídias disponíveis:
    - ~50% das cenas: template + mídia de fundo (campo "fundo").
    - ~30% das cenas: template puro (sem "fundo").
    - ~20% das cenas: só mídia (MidiaCheia) ou fundo de vídeo.
    - Use essa proporção como meta do roteiro completo, ajustando por legibilidade e coerência narrativa.
3. Escreva o que aparece NA TELA: curto, direto, como um slide. NUNCA copie a frase falada (exceto em LegendaSincronizada). Títulos com até 6 palavras. Números exatamente como o narrador diz (ex.: "13,75%", "R$ 2 mil", "2%"). Só use números que aparecem nos trechos daquela cena (um gráfico pode juntar números de trechos vizinhos: nesse caso inclua esses trechos na cena).
4. Varie: nunca use o mesmo template em 3 cenas seguidas.
4.1. ANIMAÇÕES DE ENTRADA E SAÍDA (obrigatório): em todas as cenas dos templates TituloImpacto, TextoCorrido, Pergunta, Citacao, NumeroDestaque, SetaTendencia, ListaAnimada, ImagemDestaque e TextoLongo, preencha "animacao_entrada" e "animacao_saida". Use "padrao" em no máximo 1 a cada 4 cenas. Alterne entre "de_baixo" e "de_cima" na entrada e entre "para_cima" e "para_baixo" na saída.
5. Os trechos têm ~1,5 s cada e servem só como marcação de tempo: VOCÊ decide o agrupamento, e o que agrupar será respeitado exatamente, sem cortes nem fusões automáticas. Prefira cenas CURTAS e dinâmicas (2 a 5 s, ou seja, 1 a 3 trechos) trocando a cada nova ideia, dado ou ênfase. Mas cada cena precisa fazer sentido sozinha: nunca corte uma ideia no meio — se a ideia precisa de mais tempo (explicação, comparação, lista), junte mais trechos (até 8–10 s) em vez de picotar.

Templates e seus dados (use exatamente estes nomes de campos):
- TituloImpacto: {{"texto": "...", "palavras_destaque": ["..."], "animacao_entrada": "padrao|de_baixo|de_cima", "animacao_saida": "padrao|para_cima|para_baixo"}}
- TextoCorrido: {{"texto": "resumo em 1 frase (até 20 palavras)", "destaque": ["palavra"], "animacao_entrada": "padrao|de_baixo|de_cima", "animacao_saida": "padrao|para_cima|para_baixo"}}
- Pergunta: {{"texto": "...?", "animacao_entrada": "padrao|de_baixo|de_cima", "animacao_saida": "padrao|para_cima|para_baixo"}}
- Citacao: {{"texto": "...", "autor": "...", "animacao_entrada": "padrao|de_baixo|de_cima", "animacao_saida": "padrao|para_cima|para_baixo"}}
- NumeroDestaque: {{"valor": "13,75%", "rotulo": "taxa Selic hoje", "sentimento": "positivo|negativo|neutro", "animacao_entrada": "padrao|de_baixo|de_cima", "animacao_saida": "padrao|para_cima|para_baixo"}}
- ComparacaoDoisLados: {{"titulo": "...", "a": {{"rotulo": "...", "valor": "...", "itens": ["ponto curto"]}}, "b": {{"rotulo": "...", "valor": "...", "itens": ["ponto curto"]}}, "vencedor": "a|b|nenhum"}}  (valor OU itens; itens até 4)
- GraficoBarras: {{"titulo": "...", "barras": [{{"rotulo": "2020", "valor": 2}}, {{"rotulo": "2023", "valor": 13.75}}], "unidade": "%"}}
- SetaTendencia: {{"direcao": "sobe|desce", "texto": "...", "valor": "+11 p.p.", "sentimento": "positivo|negativo|neutro", "animacao_entrada": "padrao|de_baixo|de_cima", "animacao_saida": "padrao|para_cima|para_baixo"}}
- ListaAnimada: {{"titulo": "...", "itens": ["...", "..."], "animacao_entrada": "padrao|de_baixo|de_cima", "animacao_saida": "padrao|para_cima|para_baixo"}}
- ImagemDestaque: {{"imagem": "<id de uma IMAGEM>", "texto": "...", "legenda": "...", "animacao_entrada": "padrao|de_baixo|de_cima", "animacao_saida": "padrao|para_cima|para_baixo"}}  (só se houver imagem com id compatível; OBRIGATORIAMENTE acompanhado do campo "fundo")
- MidiaCheia: {{"midia": "<id de uma imagem ou vídeo>"}}  (só a mídia, tela cheia, sem texto; prefira vídeos)
- LegendaSincronizada: {{"texto": "", "palavras_destaque": ["palavra"]}}  (texto vazio = as palavras exatas da narração naqueles trechos, sincronizadas; só preencha "texto" se quiser corrigir a fala; palavras_destaque ficam na cor de destaque)
- TextoLongo: {{"texto": "parágrafo de até 40 palavras", "destaque_frases": ["trecho a marcar"], "animacao_entrada": "padrao|de_baixo|de_cima", "animacao_saida": "padrao|para_cima|para_baixo"}}  (destaque_frases devem ser trechos que aparecem LITERALMENTE dentro de texto, até 3)
- GraficoPizza: {{"titulo": "...", "fatias": [{{"rotulo": "A", "valor": 60}}, {{"rotulo": "B", "valor": 40}}], "estilo": "donut|pizza", "destacar_indice": 0}}  (2 a 6 fatias, valores numéricos > 0; destacar_indice é a posição da fatia a realçar começando em 0, ou omita)
- Timeline: {{"titulo": "...", "eventos": [{{"marcador": "2019", "descricao": "Fundação"}}, {{"marcador": "2024", "descricao": "IPO"}}], "orientacao": "horizontal|vertical"}}  (2 a 6 eventos; marcador curto — ano, mês ou "Passo 1"; descrição de até 6 palavras; use vertical em 9x16)
- Planilha: {{"titulo": "...", "colunas": ["Plano", "Preço"], "linhas": [["Básico", "R$ 29"], ["Pro", "R$ 79"]], "destacar_coluna": 1, "destacar_linha": 1}}  (2 a 4 colunas, 1 a 5 linhas, TODAS as linhas com o mesmo número de células que colunas; células curtas — até 3 palavras; destacar_* começam em 0 ou omita)
- MapaMental: {{"titulo": "...", "itens": [{{"id": "1", "texto": "..."}}, {{"id": "1.1", "texto": "..."}}, {{"id": "1.1.1", "texto": "..."}}], "animacao_entrada": "padrao|de_baixo|de_cima", "animacao_saida": "padrao|para_cima|para_baixo"}}  (2 a 16 itens; id hierárquico no formato 1, 1.1, 1.2, 1.1.1...)
- MapaMentalCartoes: {{"titulo": "...", "itens": [{{"id": "1", "texto": "tema central"}}, {{"id": "1.1", "texto": "ramo"}}, {{"id": "1.1.1", "texto": "item do ramo"}}]}}  (igual ao MapaMental, mas cada ramo vira um CARTÃO com título + lista dos seus itens; bom para ramos com 2 a 4 itens cada)
- CTAFinal: {{"texto_principal": "...", "subtexto": "...", "estilo_botao": "solido|contorno"}}
- Campo opcional para qualquer cena (exceto MidiaCheia), OBRIGATÓRIO em ImagemDestaque:
    "fundo": {{"midia": "<id de imagem ou vídeo>", "brilho": 1.0, "contraste": 1.0, "saturacao": 1.0, "desfoque_px": 0.0, "opacidade": 1.0, "escurecer": 0.1, "zoom": 1.0, "posicao_x": 0.5, "posicao_y": 0.5}}
    Use "fundo" quando decidir por template + mídia.
{imagens}
Contexto do canal (obrigatório):
{canal}

Como alinhar o roteiro ao canal:
- O texto de tela deve refletir o tom e o público do canal.
- Ajuste linguagem e nível de explicação para esse público específico.
- Se houver CTA padrão do canal, use no encerramento (CTAFinal) quando fizer sentido.
Escreva todos os textos das cenas no MESMO IDIOMA da transcrição (as chaves do JSON e os nomes dos templates ficam como estão).

Opção de animação de entrada e saída (veja a regra 4.1, que é obrigatória):
- Campo: "animacao_entrada": "padrao|de_baixo|de_cima"
- Campo: "animacao_saida": "padrao|para_cima|para_baixo"
- Use principalmente em TituloImpacto, TextoCorrido, Pergunta, Citacao, NumeroDestaque, SetaTendencia, ListaAnimada, ImagemDestaque e TextoLongo.
- Se omitir, o padrão é "padrao" em ambos.

Regras adicionais do editor (obrigatórias):
{instrucoes_usuario}

Exemplo (outro assunto) — transcrição "#1 [0.0-3.1] O café é a bebida mais consumida do país. #2 [3.1-5.0] São 21 milhões de sacas por ano. #3 [5.0-6.4] E o consumo só cresce." vira:
{{"cenas": [
  {{"segmentos": [1], "template": "TituloImpacto", "dados": {{"texto": "A bebida número 1 do Brasil", "palavras_destaque": ["número 1"]}}, "por_que": "gancho"}},
  {{"segmentos": [2, 3], "template": "NumeroDestaque", "dados": {{"valor": "21 milhões", "rotulo": "sacas por ano", "sentimento": "positivo"}}, "por_que": "número central; #3 é curto e complementa"}}
]}}

Exemplo curto com animação (mesma estrutura esperada):
{{"cenas": [
    {{"segmentos": [1], "template": "TituloImpacto", "dados": {{"texto": "Juros em alta hoje", "palavras_destaque": ["alta"], "animacao_entrada": "de_baixo", "animacao_saida": "para_cima"}}, "por_que": "abre com impacto"}},
    {{"segmentos": [2], "template": "SetaTendencia", "dados": {{"direcao": "sobe", "texto": "Crédito fica mais caro", "valor": "+1,0 p.p.", "sentimento": "negativo", "animacao_entrada": "de_cima", "animacao_saida": "padrao"}}, "por_que": "mostra tendência"}}
]}}

Transcrição:
{transcricao}

Responda SOMENTE com o JSON."""

INSTRUCOES_USUARIO_PADRAO = """Escolha o modo visual cena a cena:
- Use "template puro" quando o texto precisa de máxima legibilidade.
- Use "template + mídia" quando a mídia reforça o contexto sem prejudicar leitura.
- Use "só mídia" (MidiaCheia) para respiro visual e transições.

Uso de mídia e fundo (quando houver mídias disponíveis):
- Em média, use mídia em pelo menos 1 a cada 3 cenas.
- Priorize campo "fundo" em cenas com texto, mantendo contraste e leitura.
- Não invente ids; use somente os ids listados no prompt.
- Mire aproximadamente: 50% template + fundo, 30% template puro e 20% MidiaCheia no conjunto das cenas.

Ritmo e duração (preferência):
- Cenas de gancho/pergunta: curtas (2s a 4s).
- Cenas de dados (número/gráfico/planilha): médias (4s a 7s).
- Cenas explicativas longas: médias para longas (5s a 9s).

Regras de legibilidade:
- Se usar fundo com texto na frente, aplique escurecer >= 0.12 quando necessário.
- Evite desfoque alto (prefira 0 a 2) salvo quando o texto competir com a imagem.
- Não repetir a mesma mídia em muitas cenas seguidas quando houver alternativas.
"""

INSTRUCOES_EDITORIAIS_PADRAO = """Você é o roteirista visual de um canal do YouTube. Recebe a transcrição de uma narração dividida em trechos numerados (#1, #2, …) e cria o ROTEIRO DE CENAS de motion graphics.

Como pensar:
1. Leia tudo e identifique as IDEIAS. Uma cena = uma ideia = um ou mais trechos CONSECUTIVOS. Cada trecho pertence a exatamente uma cena; todos os trechos devem ser usados, em ordem.
2. Para cada cena, escolha a animação que MELHOR MOSTRA aquilo que é dito NAQUELES trechos (número → NumeroDestaque; evolução no tempo com 2+ valores → GraficoBarras; subiu/caiu → SetaTendencia; A contra B → ComparacaoDoisLados; enumeração → ListaAnimada; pergunta retórica → Pergunta; fala de alguém → Citacao; menciona algo que existe nas mídias disponíveis → ImagemDestaque (imagem + título, SEMPRE com campo "fundo") ou MidiaCheia (a imagem/vídeo sozinho em tela cheia, sem texto); afirmação forte/gancho/conclusão → TituloImpacto; explicação corrida sem número nem lista → TextoCorrido com um RESUMO de 1 frase; parágrafo explicativo mais longo (2–3 frases) em que vale marcar frases-chave → TextoLongo; partes de um todo / percentuais que somam (ou quase) 100% → GraficoPizza; sequência de datas, anos ou etapas em ordem → Timeline; vários itens comparados em 2 a 4 atributos (preço, prazo, taxa…) → Planilha; estrutura em árvore com ramificações e hierarquia numérica (1, 1.1, 1.1.1...) → MapaMental; trecho de fala marcante que merece aparecer PALAVRA POR PALAVRA, grande e centralizado, acendendo no ritmo da narração → LegendaSincronizada (o texto na tela é a própria fala, não um resumo; use com FREQUÊNCIA: em 1 a cada 3–4 cenas, cerca de 25% do roteiro)).
2.1. Em cada cena, escolha também o MODO VISUAL:
    - template puro: não envie campo "fundo".
    - template + mídia: envie campo "fundo" com uma mídia válida + ajustes.
    - só mídia: use template MidiaCheia (sem texto) e sem campo "fundo".
2.2. Regra de uso de mídia quando houver itens em "Mídias disponíveis neste projeto":
    - Use mídia em pelo menos 1 a cada 3 cenas (via MidiaCheia OU campo "fundo").
    - Para cenas de texto (pergunta, título, lista, texto corrido/longo), prefira template + mídia com campo "fundo" quando a legibilidade permitir.
    - Nunca invente id: use apenas ids da lista de mídias disponíveis.
    - REGRA OBRIGATÓRIA PARA ImagemDestaque: toda cena ImagemDestaque DEVE ter o campo "fundo" preenchido.
    - Para MidiaCheia, prefira VÍDEOS. Se a ideia pedir imagem sem fundo, prefira ImagemDestaque com "fundo".
2.3. Proporção visual alvo (aproximada) quando houver mídias disponíveis:
    - ~50% das cenas: template + mídia de fundo (campo "fundo").
    - ~30% das cenas: template puro (sem "fundo").
    - ~20% das cenas: só mídia (MidiaCheia) ou fundo de vídeo.
    - Use essa proporção como meta do roteiro completo, ajustando por legibilidade e coerência narrativa.
3. Escreva o que aparece NA TELA: curto, direto, como um slide. NUNCA copie a frase falada (exceto em LegendaSincronizada). Títulos com até 6 palavras. Números exatamente como o narrador diz (ex.: "13,75%", "R$ 2 mil", "2%"). Só use números que aparecem nos trechos daquela cena (um gráfico pode juntar números de trechos vizinhos: nesse caso inclua esses trechos na cena).
4. Varie: nunca use o mesmo template em 3 cenas seguidas.
4.1. ANIMAÇÕES DE ENTRADA E SAÍDA (obrigatório): em todas as cenas dos templates TituloImpacto, TextoCorrido, Pergunta, Citacao, NumeroDestaque, SetaTendencia, ListaAnimada, ImagemDestaque e TextoLongo, preencha "animacao_entrada" e "animacao_saida". Use "padrao" em no máximo 1 a cada 4 cenas. Alterne entre "de_baixo" e "de_cima" na entrada e entre "para_cima" e "para_baixo" na saída.
5. Os trechos têm ~1,5 s cada e servem só como marcação de tempo: VOCÊ decide o agrupamento, e o que agrupar será respeitado exatamente, sem cortes nem fusões automáticas. Prefira cenas CURTAS e dinâmicas (2 a 5 s, ou seja, 1 a 3 trechos) trocando a cada nova ideia, dado ou ênfase. Mas cada cena precisa fazer sentido sozinha: nunca corte uma ideia no meio — se a ideia precisa de mais tempo (explicação, comparação, lista), junte mais trechos (até 8–10 s) em vez de picotar. Se um trecho for só um resto de frase, junte-o ao vizinho. Uma ideia longa pode virar 2–3 cenas em sequência (ex.: Pergunta → NumeroDestaque → TextoCorrido), cada uma com um texto completo e entendível.
Contexto do canal (obrigatório):
Canal Exemplo; tom: direto; público: adultos interessados em aprender; cta: Inscreva-se para mais; elementos característicos: numero_grande, grafico_barra; evitar: emoji, meme

Como alinhar o roteiro ao canal:
- O texto de tela deve refletir o tom e o público do canal.
- Ajuste linguagem e nível de explicação para esse público específico.
- Se houver CTA padrão do canal, use no encerramento (CTAFinal) quando fizer sentido.
Escreva todos os textos das cenas no MESMO IDIOMA da transcrição (as chaves do JSON e os nomes dos templates ficam como estão).

Opção de animação de entrada e saída (veja a regra 4.1, que é obrigatória):
- Campo: "animacao_entrada": "padrao|de_baixo|de_cima"
- Campo: "animacao_saida": "padrao|para_cima|para_baixo"
- Use principalmente em TituloImpacto, TextoCorrido, Pergunta, Citacao, NumeroDestaque, SetaTendencia, ListaAnimada, ImagemDestaque e TextoLongo.
- Se omitir, o padrão é "padrao" em ambos.

Regras adicionais do editor (obrigatórias):
Escreva cenas claras, curtas e com ritmo dinâmico.
- Priorize linguagem simples e objetiva, sem jargão.
- Varie o tipo de cena para evitar repetição visual.
- Quando houver mídia relevante, use para reforçar a mensagem sem prejudicar leitura.
- Dê foco nos dados mais importantes e mantenha consistência no tom do canal.
- Use blueprint como plano de fundo de forma recorrente.
- Toda ImagemDestaque precisa de "fundo".
- Use LegendaSincronizada com frequência (cerca de 1 a cada 3–4 cenas).
- Varie as animações de entrada e saída entre cenas vizinhas.
- Não use botão sólido no CTAFinal: prefira "contorno".
"""


def instrucoes_prompt_padrao() -> str:
    return INSTRUCOES_EDITORIAIS_PADRAO.strip()


def formatar_contexto_canal(canal_desc: str) -> str:
    txt = (canal_desc or "").strip()
    if not txt:
        return "\n".join([
            "- Canal: canal educativo",
            "- Tom: direto",
            "- Público: adultos interessados em aprender",
        ])

    partes = [p.strip() for p in txt.split(";") if p.strip()]
    nome = partes[0] if partes else "canal educativo"
    tom = ""
    publico = ""
    cta = ""
    extras: list[str] = []
    for p in partes[1:]:
        pl = p.lower()
        if pl.startswith("tom "):
            tom = p[4:].strip()
        elif pl.startswith("tom:"):
            tom = p.split(":", 1)[1].strip()
        elif pl.startswith("público:") or pl.startswith("publico:"):
            publico = p.split(":", 1)[1].strip()
        elif pl.startswith("cta:"):
            cta = p.split(":", 1)[1].strip()
        else:
            extras.append(p)

    linhas = [f"- Canal: {nome}"]
    if tom:
        linhas.append(f"- Tom: {tom}")
    if publico:
        linhas.append(f"- Público: {publico}")
    if cta:
        linhas.append(f"- CTA padrão: {cta}")
    if extras:
        linhas.append(f"- Contexto adicional: {'; '.join(extras)}")
    return "\n".join(linhas)


def segmentos_falados(cenas: list[Cena]) -> list[Cena]:
    return [c for c in cenas if not c.preenchimento and c.texto.strip()]


def _transcricao_texto(cenas: list[Cena]) -> str:
    return "\n".join(f"#{i} [{c.start_s:.1f}-{c.end_s:.1f}] {c.texto.strip()}"
                     for i, c in enumerate(segmentos_falados(cenas), start=1))


def _imagens_texto(imagens: list[dict]) -> str:
    if not imagens:
        return "\nMídias disponíveis: nenhuma (não use ImagemDestaque nem MidiaCheia).\n"
    tipos = ids_por_tipo(imagens)
    itens = "\n".join(
        f'  - id "{i["id"]}" ({"VÍDEO" if tipos[i["id"]] == "video" else "imagem"}) — {i.get("nome") or i["id"]}: '
        f'{i.get("descricao") or "sem descrição"}'
        f'{" (tags: " + ", ".join(i["tags"]) + ")" if i.get("tags") else ""}'
        for i in imagens)
    return ("\nMídias disponíveis neste projeto (use o id quando a fala tratar do que a descrição mostra; "
            "imagens servem em ImagemDestaque ou MidiaCheia, vídeos só em MidiaCheia):\n"
            f"{itens}\n")


def _segmentos(bruta: dict, n_segmentos: int) -> list[int]:
    try:
        return sorted({int(s) for s in bruta.get("segmentos", []) if 1 <= int(s) <= n_segmentos})
    except (TypeError, ValueError):
        return []


def validar_cena(bruta: dict, midias: dict[str, str], n_segmentos: int, log=print) -> CenaRoteiro | None:
    """Cena válida da IA, ou cena marcada TEMPLATE_REGRA se os dados forem inválidos mas os trechos não.
    `midias` é id -> tipo ("imagem" | "video") das mídias vinculadas ao projeto."""
    segs = _segmentos(bruta, n_segmentos)
    if not segs:
        return None
    template = str(bruta.get("template", ""))
    try:
        if template not in DADOS:
            raise ValueError(f"template desconhecido '{template}'")
        dados = DADOS[template].model_validate(bruta.get("dados") or {})
        if template == "ImagemDestaque" and midias.get(dados.imagem) != "imagem":
            raise ValueError(f"imagem '{dados.imagem}' não existe neste projeto")
        if template == "MidiaCheia" and dados.midia not in midias:
            raise ValueError(f"mídia '{dados.midia}' não existe neste projeto")
        fundo_raw = bruta.get("fundo")
        fundo = None
        if fundo_raw and template != "MidiaCheia":
            fundo_v = DFundoCena.model_validate(fundo_raw)
            if fundo_v.midia not in midias:
                raise ValueError(f"mídia de fundo '{fundo_v.midia}' não existe neste projeto")
            fundo = fundo_v.model_dump()
    except (ValidationError, ValueError) as e:
        log(f"[m09]   trechos {segs}: resposta da IA inválida ({str(e).splitlines()[0][:80]}) — regras")
        return CenaRoteiro(inicio=0.0, fim=0.0, segmentos=segs, template=TEMPLATE_REGRA, dados={},
                           origem="regra", justificativa="IA inválida")
    return CenaRoteiro(
        inicio=0.0, fim=0.0, segmentos=segs, template=template,
        dados=dados.model_dump(), fundo=fundo,
        origem="llm", justificativa=str(bruta.get("por_que", ""))[:200],
    )


def roteiro_llm(cenas: list[Cena], imagens: list[dict], canal_desc: str, modelo: str,
                temperatura: float = 0.3, instrucoes_usuario: str = "", log=print) -> list[CenaRoteiro]:
    regras_usuario = (instrucoes_usuario or "").strip() or "Sem regras extras do editor."
    contexto_canal = formatar_contexto_canal(canal_desc)
    prompt = PROMPT.format(
        imagens=_imagens_texto(imagens), canal=contexto_canal,
        transcricao=_transcricao_texto(cenas), instrucoes_usuario=regras_usuario,
    )
    log(f"[m09] IA ({modelo}) lendo a transcrição e escrevendo o roteiro…")
    resposta = llm.gerar_json(prompt, modelo, temperatura)
    brutas = resposta.get("cenas") if isinstance(resposta, dict) else None
    if not isinstance(brutas, list):
        raise ValueError("resposta do LLM sem lista 'cenas'")
    tipos = ids_por_tipo(imagens)
    n = len(segmentos_falados(cenas))
    saida: list[CenaRoteiro] = []
    usados: set[int] = set()
    for b in brutas:
        v = validar_cena(b, tipos, n, log) if isinstance(b, dict) else None
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


MULETAS = ("então", "aí", "e", "mas", "olha", "bom", "agora", "né", "tipo", "ou seja",
           "assim", "gente", "pessoal", "bem", "então assim", "veja", "vejam", "basicamente",
           "na verdade", "por exemplo", "enfim", "cara", "tá", "ok", "certo")
VAZIAS = set("""a o e de da do das dos em no na nos nas um uma uns umas que se por para com como mais
menos muito pouco isso isto aquilo ele ela eles elas eu você vocês nós meu minha seu sua nosso nossa
está são ser foi era tem têm ter já não sim ao aos à às pelo pela até sobre quando onde aqui ali lá
vai vou ia tudo nada algo coisa coisas assim então também ainda só bem mesmo outro outra""".split())
RE_MULETA = re.compile(r"^(?:(?:" + "|".join(re.escape(m) for m in MULETAS) + r")[,\s]+)+", re.I)


def _pontuar_oracao(oracao: str) -> float:
    palavras = [w.strip(".,;:!?\"'") for w in oracao.split()]
    if not palavras:
        return -1
    conteudo = sum(1 for w in palavras if w.lower() not in VAZIAS and len(w) > 3)
    numeros = 2 * len(RE_NUM.findall(oracao))
    proprios = sum(1 for w in palavras[1:] if w[:1].isupper())
    # orações curtas demais não servem
    penal = 2 if len(palavras) < 3 else 0
    return conteudo + numeros + proprios - penal


def _frase_nucleo(texto: str) -> str:
    """Escolhe a oração mais informativa (não a primeira) e remove muletas de fala."""
    t = re.sub(r"[.!?…]+$", "", texto.strip())
    oracoes = [RE_MULETA.sub("", o).strip() for o in
               re.split(r"(?<!\d)[,;:–—.!?]+| que | porque | então | mas ", t)]
    oracoes = [o for o in oracoes if o]
    if not oracoes:
        return t
    return max(oracoes, key=_pontuar_oracao)


def _titulo_curto(texto: str, max_palavras: int = 7) -> str:
    t = _frase_nucleo(texto)
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
    elif len(txt.split()) > 14 and dur >= 4:
        tpl, dados, why = "TextoCorrido", {"texto": _titulo_curto(txt, 12), "destaque": _palavras_chave(txt)[:1]}, "explicação corrida"

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
        if img.get("tipo") == "video":
            continue
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
