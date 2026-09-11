from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field, model_validator

from .config import ConfigResolvida

TOLERANCIA_S = 0.002


class Palavra(BaseModel):
    w: str
    s: float
    e: float
    p: float = 1.0


class Decisao(BaseModel):
    template: str
    props_semanticas: dict[str, Any] = Field(default_factory=dict)
    confianca: float = 1.0
    alternativas: list[str] = Field(default_factory=list)
    justificativa: str = ""
    origem: Literal["llm", "regra", "manual", "fixo"] = "fixo"


class Revisao(BaseModel):
    bloqueada: bool = False
    editado_manualmente: bool = False
    nota: str = ""


class RenderInfo(BaseModel):
    hash_props: Optional[str] = None
    cache_hit: bool = False


class Cena(BaseModel):
    id: str
    indice: int
    start_s: float
    end_s: float
    render_start_s: float
    render_end_s: float
    texto: str
    palavras: list[Palavra] = Field(default_factory=list)
    segmentos_originais: list[int] = Field(default_factory=list)
    preenchimento: bool = False  # cena inserida para cobrir silêncio longo
    conteudo: Optional[dict[str, Any]] = None
    narrativa: Optional[dict[str, Any]] = None
    audio: Optional[dict[str, Any]] = None
    ritmo: Optional[dict[str, Any]] = None
    decisao: Optional[Decisao] = None
    props_finais: Optional[dict[str, Any]] = None
    revisao: Revisao = Field(default_factory=Revisao)
    render: RenderInfo = Field(default_factory=RenderInfo)

    @property
    def duracao_fala_s(self) -> float:
        return self.end_s - self.start_s

    @property
    def duracao_render_s(self) -> float:
        return self.render_end_s - self.render_start_s


class AudioInfo(BaseModel):
    arquivo: str
    duracao_s: float
    sample_rate: Optional[int] = None
    hash: Optional[str] = None


class Validacao(BaseModel):
    erros: list[str] = Field(default_factory=list)
    avisos: list[str] = Field(default_factory=list)


class Timeline(BaseModel):
    schema_version: int = 1
    projeto_id: str
    gerado_em: str
    etapas_concluidas: list[str] = Field(default_factory=list)
    audio: AudioInfo
    config_resolvida: Optional[ConfigResolvida] = None
    narrativa: Optional[dict[str, Any]] = None
    cenas: list[Cena] = Field(default_factory=list)
    historico_templates: dict[str, int] = Field(default_factory=dict)
    validacao: Validacao = Field(default_factory=Validacao)

    @model_validator(mode="after")
    def _invariantes(self) -> "Timeline":
        erros: list[str] = []
        cenas = self.cenas
        if not cenas:
            return self
        if abs(cenas[0].render_start_s) > TOLERANCIA_S:
            erros.append("primeira cena não começa em 0")
        if abs(cenas[-1].render_end_s - self.audio.duracao_s) > TOLERANCIA_S:
            erros.append(
                f"última cena termina em {cenas[-1].render_end_s:.3f}s, áudio tem {self.audio.duracao_s:.3f}s"
            )
        for a, b in zip(cenas, cenas[1:]):
            if abs(a.render_end_s - b.render_start_s) > TOLERANCIA_S:
                erros.append(f"gap/sobreposição entre {a.id} e {b.id}")
        for c in cenas:
            if not (c.render_start_s <= c.start_s + TOLERANCIA_S and c.render_start_s < c.render_end_s):
                erros.append(f"{c.id}: render_start/end inconsistentes")
            if c.end_s > c.render_end_s + TOLERANCIA_S:
                erros.append(f"{c.id}: fala termina depois do render")
        if erros:
            raise ValueError("Timeline inválida: " + "; ".join(erros))
        return self

    def concluida(self, etapa: str) -> bool:
        return etapa in self.etapas_concluidas

    def marcar(self, etapa: str) -> None:
        if etapa not in self.etapas_concluidas:
            self.etapas_concluidas.append(etapa)
