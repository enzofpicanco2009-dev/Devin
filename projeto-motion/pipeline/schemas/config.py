from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class Formato(BaseModel):
    id: str
    largura: int
    altura: int
    fps: int
    plataforma: str = "youtube"


class Entrada(BaseModel):
    audio: str
    roteiro: Optional[str] = None
    idioma: Optional[str] = "pt"  # None = Whisper detecta automaticamente


class RenderConfig(BaseModel):
    codec: str = "h264"
    crf: int = 18
    concorrencia: int = 4
    cache: bool = True


class TranscricaoConfig(BaseModel):
    modelo: str = "small"
    device: Literal["auto", "cpu", "cuda"] = "auto"
    compute_type: str = "int8"
    word_timestamps: bool = True
    vad: bool = True
    beam_size: int = 5


class DecisaoConfig(BaseModel):
    provedor: Literal["nenhum", "ollama", "externo", "openai", "anthropic"] = "nenhum"
    modelo: Optional[str] = None
    temperatura: float = 0.3
    template_fixo: Optional[str] = "TituloImpacto"


class Projeto(BaseModel):
    schema_version: int = 1
    id: str
    canal_id: str
    titulo_trabalho: str = ""
    entrada: Entrada
    formatos: list[Formato]
    formato_principal: str
    tema_id: Optional[str] = None     # preset em config/temas/; None = padrão do canal
    estilo_id: Optional[str] = None   # preset em config/estilos/; None = padrão do canal
    overrides: dict = Field(default_factory=dict)
    render: RenderConfig = Field(default_factory=RenderConfig)
    transcricao: TranscricaoConfig = Field(default_factory=TranscricaoConfig)
    decisao: DecisaoConfig = Field(default_factory=DecisaoConfig)

    def formato(self, formato_id: Optional[str] = None) -> Formato:
        alvo = formato_id or self.formato_principal
        for f in self.formatos:
            if f.id == alvo:
                return f
        raise ValueError(f"Formato '{alvo}' não definido em projeto.formatos")


class Ritmo(BaseModel):
    duracao_cena_min_s: float = 1.5
    duracao_cena_max_s: float = 8.0
    duracao_cena_alvo_s: float = 4.0
    pausa_corte_s: float = 0.4
    pausa_interna_min_s: float = 0.15
    gap_max_s: float = 3.0
    fundir_curtas: bool = True


class Spring(BaseModel):
    damping: float = 200
    stiffness: float = 100
    mass: float = 1


class Animacao(BaseModel):
    velocidade: float = 1.0
    entrada_frames: int = 15
    saida_frames: int = 10
    spring: Spring = Field(default_factory=Spring)


class TemplatesEstilo(BaseModel):
    preferidos: list[str] = Field(default_factory=lambda: ["TituloImpacto"])
    proibidos: list[str] = Field(default_factory=list)
    max_repeticao_consecutiva: int = 2
    peso_variedade: float = 0.5


class Estilo(BaseModel):
    schema_version: int = 1
    id: str
    nome: str = ""
    descricao: str = ""
    ritmo: Ritmo = Field(default_factory=Ritmo)
    animacao: Animacao = Field(default_factory=Animacao)
    templates: TemplatesEstilo = Field(default_factory=TemplatesEstilo)
    densidade_visual: Literal["baixa", "media", "alta"] = "media"


class Fonte(BaseModel):
    familia: str = "Inter, Arial, sans-serif"
    peso: int = 800
    arquivo: Optional[str] = None


class EscalaTipografia(BaseModel):
    titulo_max: int = 96
    titulo_min: int = 48
    corpo: int = 40
    numero: int = 160
    legenda: int = 36


class Tipografia(BaseModel):
    fonte_titulo: Fonte = Field(default_factory=Fonte)
    fonte_corpo: Fonte = Field(default_factory=lambda: Fonte(peso=500))
    fonte_numero: Fonte = Field(default_factory=lambda: Fonte(peso=700))
    escala: EscalaTipografia = Field(default_factory=EscalaTipografia)
    max_linhas_titulo: int = 3
    max_caracteres_linha: int = 28


class Cores(BaseModel):
    fundo: str = "#0D0D0D"
    fundo_secundario: str = "#1A1A1A"
    texto: str = "#FFFFFF"
    texto_secundario: str = "#B3B3B3"
    destaque: str = "#F5C042"
    destaque_2: str = "#42A5F5"
    positivo: str = "#2ECC71"
    negativo: str = "#E74C3C"
    neutro: str = "#95A5A6"


class SafeArea(BaseModel):
    topo: float = 5
    base: float = 8
    lados: float = 6


class Tema(BaseModel):
    schema_version: int = 1
    id: str
    nome: str = ""
    descricao: str = ""
    cores: Cores = Field(default_factory=Cores)
    tipografia: Tipografia = Field(default_factory=Tipografia)
    safe_areas: dict[str, SafeArea] = Field(
        default_factory=lambda: {
            "16x9": SafeArea(),
            "9x16": SafeArea(topo=12, base=20, lados=6),
            "1x1": SafeArea(topo=8, base=8, lados=6),
        }
    )
    mapa_semantico: dict[str, dict[str, str]] = Field(
        default_factory=lambda: {
            "enfase": {"baixa": "texto_secundario", "media": "texto", "alta": "destaque"},
            "sentimento": {"positivo": "positivo", "negativo": "negativo", "neutro": "neutro"},
        }
    )


class DNA(BaseModel):
    tom: str = "direto"
    humor: float = 0.2
    seriedade: float = 0.8
    formalidade: float = 0.6
    ritmo_base: str = "medio"
    publico: str = ""
    elementos_proibidos: list[str] = Field(default_factory=list)
    elementos_caracteristicos: list[str] = Field(default_factory=list)
    palavras_proibidas: list[str] = Field(default_factory=list)
    cta_padrao: str = ""


class Canal(BaseModel):
    schema_version: int = 1
    id: str
    nome: str
    idioma: str = "pt-BR"
    dna: DNA = Field(default_factory=DNA)
    tema_padrao: str = "tema_escuro_dourado"
    estilo_padrao: str = "estilo_didatico"
    metadados_obrigatorios: list[str] = Field(default_factory=list)


class ConfigResolvida(BaseModel):
    canal: Canal
    estilo: Estilo
    tema: Tema
    formato: Formato
    config_hash: str
