"""Roteiro feito por uma IA de fora (ChatGPT, Gemini, Claude…), sem Ollama.

Fluxo: M01+M04 rodam → o usuário copia a transcrição minutada (ou o prompt inteiro, que já
inclui a transcrição) → cola em outra IA → cola o JSON devolvido aqui → M09 monta as cenas
com `_reconstruir`, exatamente como faria com a resposta do Ollama.

O formato é o mesmo do `roteiro.PROMPT`: {"cenas": [{"segmentos": [1, 2], "template": "...",
"dados": {...}, "por_que": "..."}]}. Os tempos continuam vindo do Whisper.
"""
from __future__ import annotations

from datetime import datetime
import json
import re

from . import roteiro
from .canais import listar_canais
from .comum import Caminhos, carregar_projeto, carregar_timeline, salvar_timeline
from .imagens import ids_por_tipo, listar_imagens
from .schemas.timeline import Cena, Timeline

ARQUIVO = "roteiro_externo.json"
_REGRA_DURACAO = "5. Cenas ideais duram de 3 a 9 segundos (veja os tempos dos trechos). Junte trechos curtos que falam da mesma coisa."
_REGRA_DURACAO_EXTERNO = (
    "5. Os trechos têm ~1,5 s cada e servem só como marcação de tempo: VOCÊ decide o agrupamento, "
    "e o que agrupar será respeitado exatamente, sem cortes nem fusões automáticas. "
    "Prefira cenas CURTAS e dinâmicas (2 a 5 s, ou seja, 1 a 3 trechos) trocando a cada nova ideia, dado ou ênfase. "
    "Mas cada cena precisa fazer sentido sozinha: nunca corte uma ideia no meio — se a ideia precisa de mais tempo "
    "(explicação, comparação, lista), junte mais trechos (até 8–10 s) em vez de picotar. "
    "Se um trecho for só um resto de frase, junte-o ao vizinho. Uma ideia longa pode virar 2–3 cenas em sequência "
    "(ex.: Pergunta → NumeroDestaque → TextoCorrido), cada uma com um texto completo e entendível."
)
_CERCA = re.compile(r"^\s*```(?:json)?\s*|\s*```\s*$", re.I)
_VIRGULA_SOBRANDO = re.compile(r",\s*([}\]])")
_VIRGULA_FALTANDO_CHAVE = re.compile(r"([}\]])(\s*)(\"[^\"\\]+\"\s*:)")
_VIRGULA_FALTANDO_BLOCO = re.compile(r"([}\]])(\s*)([\[{])")
_VIRGULA_FALTANDO_VALOR_CHAVE = re.compile(
    r"((?:\"(?:[^\"\\]|\\.)*\"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null))(\s*)(\"[^\"\\]+\"\s*:)",
    re.I,
)
_COMENTARIO_LINHA = re.compile(r"(^|\s)//.*$", re.M)
_COMENTARIO_BLOCO = re.compile(r"/\*[\s\S]*?\*/")

_ASPAS_ESPECIAIS = str.maketrans({
    "“": '"',
    "”": '"',
    "‘": "'",
    "’": "'",
})


class RoteiroExternoInvalido(ValueError):
    pass


def _salvar_debug_json_invalido(c: Caminhos, texto: str) -> str:
    entrada = c.raiz / "entrada"
    entrada.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    arq = entrada / f"debug_roteiro_externo_invalido_{ts}.txt"

    sem_cerca = _CERCA.sub("", texto.strip())
    ini, fim = sem_cerca.find("{"), sem_cerca.rfind("}")
    recorte = sem_cerca[ini:fim + 1] if ini >= 0 and fim > ini else sem_cerca
    normalizado = _normalizar_json_colado(recorte)

    conteudo = [
        "=== RAW (texto colado) ===",
        texto,
        "",
        "=== SEM CERCA ===",
        sem_cerca,
        "",
        "=== RECORTE ENTRE CHAVES ===",
        recorte,
        "",
        "=== NORMALIZADO (tentativa de reparo) ===",
        normalizado,
        "",
    ]
    arq.write_text("\n".join(conteudo), encoding="utf-8")
    return str(arq)


def _normalizar_json_colado(texto: str) -> str:
    t = texto.translate(_ASPAS_ESPECIAIS).replace("\ufeff", "")
    t = _COMENTARIO_BLOCO.sub("", t)
    t = _COMENTARIO_LINHA.sub("", t)

    # Tentativas em passagens sucessivas para convergir correções comuns.
    for _ in range(6):
        novo = t
        novo = _VIRGULA_SOBRANDO.sub(r"\1", novo)
        novo = _VIRGULA_FALTANDO_CHAVE.sub(r"\1,\2\3", novo)
        novo = _VIRGULA_FALTANDO_BLOCO.sub(r"\1,\2\3", novo)
        novo = _VIRGULA_FALTANDO_VALOR_CHAVE.sub(r"\1,\2\3", novo)
        if novo == t:
            break
        t = novo
    return t


def _extrair_objeto_cenas(texto: str) -> dict | None:
    """Tenta reconstruir {"cenas": [...]} quando o topo do JSON vem truncado."""
    m = re.search(r'"cenas"\s*:\s*\[', texto)
    if not m:
        return None
    ini_array = texto.find("[", m.start())
    if ini_array < 0:
        return None

    nivel = 0
    fim_array = -1
    for i in range(ini_array, len(texto)):
        ch = texto[i]
        if ch == "[":
            nivel += 1
        elif ch == "]":
            nivel -= 1
            if nivel == 0:
                fim_array = i
                break
    if fim_array < 0:
        return None

    bloco = texto[ini_array:fim_array + 1]
    bloco = _normalizar_json_colado(bloco)
    try:
        cenas = json.loads(bloco)
    except json.JSONDecodeError:
        return None
    if isinstance(cenas, list):
        return {"cenas": cenas}
    return None


def _descricao_canal(canal_id: str) -> str:
    for c in listar_canais():
        if c["id"] == canal_id:
            dna = c.get("dna") or {}
            partes = [c["nome"]]
            if dna.get("tom"):
                partes.append(f"tom: {dna['tom']}")
            if dna.get("publico"):
                partes.append(f"público: {dna['publico']}")
            if dna.get("cta_padrao"):
                partes.append(f"cta: {dna['cta_padrao']}")
            if dna.get("elementos_caracteristicos"):
                partes.append("elementos característicos: " + ", ".join(dna["elementos_caracteristicos"][:4]))
            if dna.get("elementos_proibidos"):
                partes.append("evitar: " + ", ".join(dna["elementos_proibidos"][:4]))
            return "; ".join(partes)
    return "canal educativo"


def instrucoes_padrao(canal_id: str = "canal_exemplo") -> str:
    """Instruções editoriais para o usuário; a parte técnica é anexada automaticamente."""
    return roteiro.instrucoes_prompt_padrao()


def pacote(c: Caminhos) -> dict:
    """Transcrição minutada + prompt completo para colar em outra IA."""
    projeto = carregar_projeto(c)
    if not c.timeline_json.exists():
        return {"pronto": False}
    t = carregar_timeline(c)
    if not t.concluida("m04"):
        return {"pronto": False}
    cenas = _cenas_base(c, t)
    imagens = listar_imagens(c)
    transcricao = roteiro._transcricao_texto(cenas)
    prompt = roteiro.PROMPT.replace(_REGRA_DURACAO, _REGRA_DURACAO_EXTERNO).format(
        imagens=roteiro._imagens_texto(imagens),
        canal=_descricao_canal(projeto.canal_id),
        instrucoes_usuario="",
        transcricao=transcricao,
    )
    return {
        "pronto": True,
        "pendente": not t.concluida("m09"),
        "transcricao": transcricao,
        "prompt": prompt,
        "trechos": len(roteiro.segmentos_falados(cenas)),
    }


def _cenas_base(c: Caminhos, t: Timeline) -> list[Cena]:
    """Cenas do M04 (antes de qualquer roteiro reagrupar), para a numeração dos trechos bater."""
    snapshot = c.cache / "cenas_m04.json"
    if t.concluida("m09") and snapshot.exists():
        return [Cena.model_validate(x) for x in json.loads(snapshot.read_text(encoding="utf-8"))]
    return t.cenas


def _extrair_json(texto: str) -> dict:
    limpo = _CERCA.sub("", texto.strip())
    if not limpo:
        raise RoteiroExternoInvalido("cole o JSON que a IA devolveu")

    # Se o usuário colou texto antes/depois, tenta isolar o bloco JSON principal.
    ini, fim = limpo.find("{"), limpo.rfind("}")
    if ini >= 0 and fim > ini:
        limpo = limpo[ini:fim + 1]

    limpo = _normalizar_json_colado(limpo)

    try:
        return json.loads(limpo)
    except json.JSONDecodeError as e:
        # Fallback: quando o topo vem truncado, tenta salvar ao menos o bloco "cenas".
        reconstruido = _extrair_objeto_cenas(limpo)
        if reconstruido is not None:
            return reconstruido

        linhas = limpo.splitlines()
        ln = max(1, min(e.lineno, len(linhas)))
        trecho_ini = max(1, ln - 2)
        trecho_fim = min(len(linhas), ln + 2)
        contexto = "\n".join(f"{i}: {linhas[i - 1]}" for i in range(trecho_ini, trecho_fim + 1))
        raise RoteiroExternoInvalido(
            "JSON inválido: "
            f"{e.msg} (linha {e.lineno}, coluna {e.colno}).\n"
            "Revise principalmente vírgulas, aspas e chaves nessa região:\n"
            f"{contexto}"
        )


def validar(texto: str, cenas: list[Cena], imagens: list[dict]) -> list[roteiro.CenaRoteiro]:
    bruto = _extrair_json(texto)
    brutas = bruto.get("cenas") if isinstance(bruto, dict) else None
    if not isinstance(brutas, list) or not brutas:
        raise RoteiroExternoInvalido('o JSON precisa ter a lista "cenas"')
    tipos = ids_por_tipo(imagens)
    n = len(roteiro.segmentos_falados(cenas))
    problemas: list[str] = []
    saida: list[roteiro.CenaRoteiro] = []
    usados: set[int] = set()
    for i, b in enumerate(brutas, start=1):
        v = roteiro.validar_cena(b, tipos, n, log=lambda m: problemas.append(f"cena {i}: {m}")) \
            if isinstance(b, dict) else None
        if v is None:
            problemas.append(f"cena {i}: sem trechos válidos (\"segmentos\" deve listar números de 1 a {n})")
            continue
        v.segmentos = [s for s in v.segmentos if s not in usados]
        if not v.segmentos:
            problemas.append(f"cena {i}: trechos já usados por outra cena")
            continue
        usados.update(v.segmentos)
        saida.append(v)
    if not saida:
        raise RoteiroExternoInvalido("nenhuma cena aproveitável. " + "; ".join(problemas)[:400])
    saida.sort(key=lambda c: c.segmentos[0])
    return saida


def aplicar(c: Caminhos, texto: str) -> dict:
    """Valida, grava o roteiro no projeto, marca o provedor como 'externo' e reabre o M09."""
    t = carregar_timeline(c)
    if not t.concluida("m04"):
        raise RoteiroExternoInvalido("transcreva o áudio antes de colar o roteiro")
    cenas = _cenas_base(c, t)
    try:
        rot = validar(texto, cenas, listar_imagens(c))
    except RoteiroExternoInvalido as e:
        debug_path = _salvar_debug_json_invalido(c, texto)
        raise RoteiroExternoInvalido(f"{e}\n\nArquivo de debug salvo em: {debug_path}")

    (c.raiz / "entrada" / ARQUIVO).write_text(
        json.dumps({"cenas": [r.model_dump() for r in rot]}, ensure_ascii=False, indent=2), encoding="utf-8")

    dados = json.loads(c.projeto_json.read_text(encoding="utf-8"))
    dados.setdefault("decisao", {})
    dados["decisao"].update(provedor="externo", template_fixo=None)
    c.projeto_json.write_text(json.dumps(dados, ensure_ascii=False, indent=2), encoding="utf-8")

    t.cenas = cenas
    for etapa in ("m09", "m12", "m13", "m14"):
        if etapa in t.etapas_concluidas:
            t.etapas_concluidas.remove(etapa)
    salvar_timeline(c, t)
    return {"cenas": len(rot), "trechos": len(roteiro.segmentos_falados(cenas))}


def carregar(c: Caminhos) -> list[roteiro.CenaRoteiro]:
    arq = c.raiz / "entrada" / ARQUIVO
    if not arq.exists():
        raise RoteiroExternoInvalido("nenhum roteiro colado neste projeto")
    bruto = json.loads(arq.read_text(encoding="utf-8"))
    return [roteiro.CenaRoteiro.model_validate(x) for x in bruto["cenas"]]
