# 📊 CHECKUP COMPLETO — Projeto Motion

**Data:** 2026-09-17  
**Versão do Projeto:** MVP  
**Estado:** Implementação em andamento

---

## 1. VISÃO GERAL

**Propósito:** Pipeline 100% local que transforma áudio narrado em vídeo com motion graphics.

**Fluxo Principal:**
```
ÁUDIO 
  ↓ [M01] TRANSCRIÇÃO (faster-whisper)
  ↓ [M04] ESTRUTURAÇÃO EM CENAS
  ↓ [M08] RESOLUÇÃO DE CONFIGURAÇÃO
  ↓ [M09] MOTOR DE DECISÃO (template + props semânticas)
  ↓ [M12] APLICAÇÃO DE TEMA VISUAL
  ↓ [M13] RENDERIZAÇÃO (Remotion)
  ↓ [M14] COMPOSIÇÃO COM ÁUDIO (FFmpeg)
VÍDEO FINAL
```

**Princípios Arquiteturais (invioláveis):**
1. **Tudo local** — Nenhum serviço obrigatório na nuvem (LLM externo é opcional)
2. **Sem código gerado em runtime** — Templates são componentes Remotion versionados
3. **LLM nunca decide visual** — LLM devolve `template + props semânticas`, tema converte em visual
4. **Timeline é a fonte de verdade** — `timeline.json` é o único estado persistido
5. **Determinismo** — Mesma timeline + mesmo tema = mesmo vídeo
6. **Fases validadas** — Cada módulo tem entrada, saída e validação isolada
7. **Versões travadas** — Todos os pacotes Remotion na mesma versão exata

---

## 2. STACK TECNOLÓGICO

### Backend (Python 3.10+)
- **FastAPI** 0.115+ — Servidor web com interface para gerar vídeos
- **Pydantic** 2.x — Validação de todos os JSONs (schemas rígidos)
- **faster-whisper** 1.1+ — Transcrição de áudio local
- **pytest** 8+ — Testes unitários

### Frontend (Browser)
- **HTML5 + CSS3 + Vanilla JavaScript** — Interface local estática
- **Upload de áudio e imagens** — Múltiplos formatos
- **Painel "Produção ao vivo"** — Exibe timeline e frames renderizados

### Renderização (Node.js 20+)
- **Remotion** 4.0.523 — Framework React para motion graphics
- **React** 19.2.3 + React DOM — Componentes de templates
- **Zod** 4.5.4 — Validação de schema de props (espelhado com Python)
- **TypeScript** 5.9.3 — Tipagem estática

### Multimedia
- **FFmpeg** (obrigatório) — Preparação de áudio e mixagem final

---

## 3. ESTRUTURA DE PASTAS

```
projeto-motion/
├── app/                                  # Interface web + servidor FastAPI
│   ├── __main__.py                       # Entrypoint: python -m app
│   ├── servidor.py                       # FastAPI app, endpoints /api/*
│   └── static/                           # HTML, CSS, JS estáticos (cliente)
│
├── pipeline/                             # Pipeline Python (CLI e módulos)
│   ├── __main__.py                       # Entrypoint: python -m pipeline <cmd>
│   ├── cli.py                            # Dispatcher de comandos (m01, m04, m09, etc)
│   ├── comum.py                          # Helpers compartilhados (carregar_timeline, rodar FFmpeg)
│   ├── projetos.py                       # Gerenciar projetos (criar, listar, gerar_id)
│   ├── canais.py                         # Gerenciar canais (criar, listar, overrides)
│   ├── edicao.py                         # Editar cenas (dividir, remover, ajustar tempos)
│   ├── imagens.py                        # Gerenciar imagens por canal
│   ├── llm.py                            # Interface com LLM externo (ChatGPT, Gemini, Claude)
│   ├── roteiro_externo.py                # Receber roteiro JSON de fora
│   │
│   ├── m01_transcrever.py                # [M01] Transcrição com faster-whisper
│   ├── m04_estruturar_cenas.py           # [M04] Dividir áudio em cenas (~3s cada)
│   ├── m08_resolver_config.py            # [M08] Resolver herança de configurações
│   ├── m09_motor_decisao.py              # [M09] Escolher template + props por cena
│   ├── m12_aplicar_tema.py               # [M12] Converter props semânticas em props finais
│   ├── m13_renderizar.py                 # [M13] Chamar Remotion para gerar frames
│   ├── m14_compor.py                     # [M14] Mixa áudio + vídeo com FFmpeg
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── timeline.py                   # Timeline, Cena, Decisao, Validacao (Pydantic)
│   │   ├── config.py                     # ConfigResolvida, herança de temas/estilos
│   │   └── catalogo.py                   # CatalogTemplate, status, props_schema
│   │
│   └── tests/                            # Testes unitários (pytest)
│
├── config/                               # Configurações e presets
│   ├── defaults/
│   │   ├── projeto.json                  # Defaults do sistema (camada 4)
│   │   ├── tema.json                     # Defaults de tema
│   │   └── estilo.json                   # Defaults de edição
│   │
│   ├── temas/                            # Presets de design
│   │   ├── tema_claro_minimal.json
│   │   ├── tema_editorial.json
│   │   ├── tema_escuro_dourado.json
│   │   └── tema_neon_tech.json
│   │
│   ├── estilos/                          # Presets de ritmo/pacing de edição
│   │   ├── estilo_didatico.json
│   │   ├── estilo_dinamico.json
│   │   ├── estilo_shorts.json
│   │   └── estilo_storytelling.json
│   │
│   └── canais/                           # DNA de cada canal editorial
│       └── canal_exemplo/
│           ├── canal.json                # DNA (tom, público, CTA, elementos)
│           ├── tema.json                 # Override do tema padrão
│           ├── estilo.json               # Override do estilo padrão
│           └── assets/                   # Logo, marca d'água, ícones (fase 4)
│
├── catalogo/
│   ├── templates.json                    # Registro de TODOS os templates
│   │                                     # (implementados, planejados, props, schema)
│   └── icones.json                       # Ícone semântico → arquivo por tema
│
├── biblioteca/
│   └── imagens/
│       └── canal_exemplo/
│           └── catalogo.json             # Imagens do canal com tags e metadados
│
├── remotion/                             # Projeto Remotion (React + TypeScript)
│   ├── package.json                      # Deps: remotion 4.0.523, react 19.2.3
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   ├── remotion.config.ts                # Configuração (FPS, quality, etc)
│   │
│   ├── src/
│   │   ├── index.ts                      # Entry point
│   │   ├── Root.tsx                      # Composição wrapper
│   │   ├── Video.tsx                     # Composição única que lê timeline.json
│   │   ├── timeline.ts                   # Helpers para ler e iteraremão
│   │   │
│   │   ├── templates/
│   │   │   ├── _registry.ts              # Map: id → componente (estático)
│   │   │   ├── TituloImpacto/
│   │   │   │   ├── index.tsx             # Componente React (Remotion)
│   │   │   │   └── schema.ts             # Zod schema (props)
│   │   │   ├── Citacao.tsx
│   │   │   ├── ComparacaoDoisLados.tsx
│   │   │   ├── GraficoBarras.tsx
│   │   │   ├── ImagemDestaque.tsx
│   │   │   ├── ListaAnimada.tsx
│   │   │   ├── NumeroDestaque.tsx
│   │   │   ├── Pergunta.tsx
│   │   │   ├── SetaTendencia.tsx
│   │   │   └── TextoCorrido.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── base.ts                   # Tipos, constantes compartilhadas
│   │   │   ├── Cartao.tsx                # Componentes reutilizáveis
│   │   │   ├── janela.ts                 # Helpers de layout
│   │   │   └── layoutTexto.ts            # Quebra de linha, auto-fit
│   │   │
│   │   └── tema/
│   │       ├── ThemeProvider.tsx
│   │       └── tokens.ts                 # Tokens de cor, tipografia
│   │
│   └── scripts/
│       └── check_registry.mjs            # Valida que registry está sincronizado
│
├── projetos/                             # Instâncias de projetos (geradas em runtime)
│   └── <projeto_id>/
│       ├── projeto.json                  # Metadados do projeto (título, canal, etc)
│       ├── timeline.json                 # FONTE DE VERDADE (atualizado por cada módulo)
│       ├── entrada/
│       │   └── audio.wav                 # Áudio de entrada
│       ├── cache/
│       │   ├── transcricao.json          # Resultado de M01
│       │   └── analise/                  # Artefatos intermediários
│       └── saida/
│           ├── final_16x9.mp4            # Vídeo final em 16:9
│           ├── final_9x16.mp4            # Vídeo final em 9:16
│           └── final_1x1.mp4             # Vídeo final em 1:1
│
├── docs/
│   └── plano_arquitetura.md              # Documento de referência técnica
│
├── requirements.txt                      # Python deps
└── README.md                             # Guia rápido
```

---

## 4. SCHEMAS PRINCIPAIS (Pydantic + Zod)

### 4.1 Timeline (`pipeline/schemas/timeline.py`)
**Responsável por:** Estado completo de um vídeo sendo produzido.

```python
class Timeline:
  schema_version: int = 1
  projeto_id: str
  gerado_em: str
  etapas_concluidas: list[str]  # ["m01", "m04", "m09", "m12", "m13", "m14"]
  audio: AudioInfo               # arquivo, duracao_s, hash
  config_resolvida: ConfigResolvida | None  # Tema + estilo + overrides resolvidos
  cenas: list[Cena]              # A sequência de cenas
  historico_templates: dict      # Contagem de uso por template
  artefatos: dict                # etapa[:formato] -> hash das entradas (cache)
  validacao: Validacao           # Erros e avisos
```

### 4.2 Cena
```python
class Cena:
  id: str                        # Único por timeline
  indice: int                    # Posição na sequência (0, 1, 2, ...)
  start_s: float                 # Início da fala (segundos)
  end_s: float                   # Fim da fala
  render_start_s: float          # Início do render (pode ser diferente se há preenchimento)
  render_end_s: float            # Fim do render
  texto: str                     # Transcrição da fala
  palavras: list[Palavra]        # [{w: "texto", s: 0.0, e: 1.5, p: 1.0}, ...]
  segmentos_originais: list[int] # IDs dos blocos de transcrição que formam a cena
  preenchimento: bool            # True se inserida para cobrir silêncio
  conteudo: dict | None          # Resultado de M05 (análise semântica)
  narrativa: dict | None         # Resultado de M06 (análise da narrativa)
  audio: dict | None             # Resultado de análise de áudio (ritmo, energia)
  ritmo: dict | None             # Resultado de M07 (decisão de ritmo)
  decisao: Decisao | None        # Template + props semânticas (M09)
  props_finais: dict | None      # Props visuais resolvidas (M12)
  revisao: Revisao               # Bloqueada, editada, nota (M14+)
  render: RenderInfo             # Hash de props, cache hit flag
```

### 4.3 Decisão
```python
class Decisao:
  template: str                  # ID do template ("TituloImpacto", "GraficoBarras", ...)
  props_semanticas: dict         # {foco: "numero", objetivo: "impacto", ...}
  confianca: float               # 0.0–1.0 (qualidade da decisão)
  alternativas: list[str]        # Templates alternativos considerados
  justificativa: str             # Por que foi escolhido
  origem: "llm"|"regra"|"manual"|"fixo"  # Fonte da decisão
```

### 4.4 ConfigResolvida
```python
class ConfigResolvida:
  projeto_id: str
  canal_id: str
  tema_id: str
  estilo_id: str
  formato: str                   # "16x9", "9x16", "1x1"
  tema: dict                     # Cores, tipografia, assets (merge de layers)
  estilo: dict                   # Pacing, quebras, transições
  canal_dna: dict                # Tom, humor, público (não-sobrescritível)
  overrides: dict | None         # Paleta/fonte alternativa
```

---

## 5. ENDPOINTS DA API (FastAPI)

### GET `/`
Retorna `index.html` (interface estática).

### GET `/api/opcoes`
```json
{
  "canais": [{"id": "canal_exemplo", "nome": "Canal Exemplo"}, ...],
  "temas": [{"id": "tema_escuro_dourado", ...}, ...],
  "estilos": [{"id": "estilo_didatico", ...}, ...],
  "paletas": [{...}],
  "fontes": [{...}],
  "ia": {"disponivel": true, "modelo": "gpt-4"},
  "templates": [{"id": "TituloImpacto", "categoria": "titulo", ...}, ...],
  "formatos": [{"id": "16x9", "nome": "YouTube"}, ...]
}
```

### POST `/api/canais`
Cria um novo canal editorial.
```
Params: nome, tema_id, estilo_id, publico, tom, cta, paleta_id, fonte_id
Returns: {id, nome, ...}
```

### GET `/api/projetos`
Lista todos os projetos com estado (novo, rodando, concluído, erro).

### POST `/api/projetos`
Cria um novo projeto e inicia o pipeline.
```
Params:
  - audio: UploadFile (WAV/MP3)
  - titulo: str (opcional)
  - canal_id: str
  - tema_id, estilo_id: str (opcionais, usam default do canal)
  - paleta_id, fonte_id: str (opcionais, sobrescrevem tema)
  - formatos: str (ex: "16x9,9x16")
  - modelo: str ("tiny" | "base" | "small" | "medium" | "large-v3")
  - usar_ia: bool (true para usar LLM, false para regras)
  - roteiro_modo: str ("" | "ia" | "regras" | "externo")
  - imagens: list[UploadFile] (imagens com metadados)
  - imagens_meta: str (JSON com tags e descrições)

Returns: {id: projeto_id, titulo: str}
```

### Endpoints de Edição (M14+)
- `POST /api/projetos/{id}/cenas/{indice}/editar` — Editar texto/template de uma cena
- `POST /api/projetos/{id}/cenas/{indice}/dividir` — Dividir uma cena em duas
- `POST /api/projetos/{id}/cenas/{indice}/remover` — Remover uma cena
- `POST /api/projetos/{id}/ajustar-tempos` — Recalcular timings após edições

---

## 6. FLUXO DE DADOS POR MÓDULO

### M01 — Transcrição
**Input:** `projetos/<id>/entrada/audio.wav`  
**Output:** `cache/transcricao.json`, `timeline.json` (atualizada)

```json
{
  "duracao_s": 45.3,
  "idioma": "pt-BR",
  "segmentos": [
    {
      "id": 1,
      "start_s": 0.0,
      "end_s": 3.4,
      "texto": "Olá, bem-vindo...",
      "palavras": [...]
    },
    ...
  ]
}
```

Valida:
- Áudio deve ter ≥ 1 segundo
- Transcrição não vazia
- Timestamps consistentes

### M04 — Estruturação em Cenas
**Input:** `timeline.json` (com transcrição)  
**Output:** `timeline.json` (atualizada com Cenas)

Agrupa segmentos de ~3 segundos em cenas, calcula render timings, preenche silêncios.

Valida:
- Sem gaps/sobreposições
- Primeira cena começa em 0
- Última cena termina no fim do áudio
- Render duration ≥ 1 quadro

### M08 — Resolução de Configuração
**Input:** Hierarquia: Cena > Projeto > Canal > Defaults  
**Output:** `timeline.config_resolvida` (ConfigResolvida)

Merge um único dict com: `tema.json`, `estilo.json`, `canal.json`, overrides.

### M09 — Motor de Decisão
**Input:** `timeline.json` (com cenas e config)  
**Output:** `timeline.json` (cenas com Decisão)

Lógica:
1. **Se `usar_ia == true`:** Chama LLM (ChatGPT, Gemini, Claude) com:
   - Transcrição de cada cena
   - DNA do canal
   - Catálogo de templates com schema
   - Exemplo de formato: `{"cenas": [{"segmentos": [1,2], "template": "TituloImpacto", "dados": {foco: "numero", ...}}, ...]}`

2. **Se `usar_ia == false`:** Aplica regras (ex: número grande → `NumeroDestaque`)

3. **Se roteiro externo:** Aguarda usuário colar JSON no navegador

Valida:
- Todos os templates existem no catálogo
- Props passam no schema Zod de cada template
- Índices de segmentos são válidos

### M12 — Aplicação de Tema
**Input:** `timeline.json` (com props_semanticas), tema resolvido  
**Output:** `timeline.json` (cenas com props_finais)

Converte `props_semanticas` (ex: `{foco: "numero", cor: "destaque"}`) em `props_finais` com valores concretos (ex: `{foco: "numero", cor: "#FF6B00"}`).

### M13 — Renderização
**Input:** `timeline.json`, `remotion/src/Video.tsx`, tema  
**Output:** `cache/renders/<formato>/` (frames .png), `cache/renders/<formato>/info.json`

Executa:
```bash
npx remotion render src/Video.tsx Video \
  --props '{"timeline_path": "...", "formato": "16x9"}' \
  --output-dir cache/renders/16x9/
```

Valida:
- Todos os frames foram gerados
- Duração do vídeo = duração do áudio
- Semântica dos props (cores RGB, etc)

### M14 — Composição
**Input:** `cache/renders/<formato>/`, `entrada/audio.wav`  
**Output:** `saida/final_<formato>.mp4`

Executa:
```bash
ffmpeg -framerate 30 -pattern_type glob -i 'cache/renders/16x9/*.png' \
  -i entrada/audio.wav -c:v libx264 -c:a aac -shortest \
  saida/final_16x9.mp4
```

Valida:
- Arquivo MP4 existe e reproduz
- Duração ≥ 1 segundo

---

## 7. MODOS DE DECISÃO DE ROTEIRO

### A. Automático por IA (padrão, `usar_ia=true`)
1. Backend transcreve com Whisper
2. Exibe transcrição minutada em blocos (~3s)
3. Usuario clica "Copiar prompt completo" → inclui:
   - Transcrição com IDs de blocos
   - Catálogo de templates (descricao_para_llm + schema)
   - Formato de resposta esperado
4. Usuário cola prompt em ChatGPT/Gemini/Claude
5. Usuário copia JSON devolvido → cola em "Roteiro devolvido pela IA"
6. Backend valida e continua de M09 em diante

### B. Automático por Regras (`usar_ia=false`)
Motor de decisão usa heurísticas (ex: "número ≥ 1 bilhão" → `NumeroDestaque`).

### C. Roteiro Externo
1. Backend cria projeto e roda só M01 + M04
2. Aguarda usuário colar JSON com roteiro completo
3. Quando colado, continua de M09 em diante

**Especificação do JSON de roteiro:**
```json
{
  "cenas": [
    {
      "segmentos": [1, 2],
      "template": "TituloImpacto",
      "dados": {
        "foco": "numero",
        "numero": "1.5B",
        "unidade": "reais",
        "descricao": "PIB do Brasil"
      }
    }
  ]
}
```

---

## 8. CATALOGO DE TEMPLATES

**Arquivo:** `catalogo/templates.json`

Cada template tem:
- `id`: Identificador único
- `nome`: Nome legível
- `categoria`: "titulo" | "numero" | "grafico" | "imagem" | "texto" | "transicao"
- `descricao_para_llm`: Instruções para a IA escolher este template
- `status`: "implementado" | "planejado" | "descontinuado"
- `props_schema`: Zod schema (JSON Schema)
- `exemplo_props`: Props de exemplo válido
- `duracoes_recomendadas`: Min/max em segundos

**Templates Implementados (MVP):**
- `TituloImpacto` — Título grande com efeito

**Templates Planejados (Fase 2+):**
- `GraficoBarras` — Gráfico animado
- `NumeroDestaque` — Grande número com contexto
- `Citacao` — Citação de autor
- `ImagemDestaque` — Foto com overlay
- `ComparacaoDoisLados` — Antes/depois
- `ListaAnimada` — Lista aparecendo item por item
- `Pergunta` — Pergunta reórica
- `SetaTendencia` — Seta para cima/baixo
- `TextoCorrido` — Narração com texto

---

## 9. HERANÇA DE CONFIGURAÇÃO

**Ordem de resolução (mais específico vence):**
```
Cena > Projeto > Canal > Defaults do Sistema
```

**Exceções:**
- `canal.dna` **NÃO** é sobrescrito (validação apenas)
- `projeto.formato` **NÃO** é sobrescrito por cena

**Camadas de tema:**
```
Tema Padrão (config/defaults/tema.json)
  ↓ sobrescrito por
Tema do Canal (config/canais/<id>/tema.json)
  ↓ sobrescrito por
Tema do Projeto (config/projeto.json)
  ↓ sobrescrito por
Paleta/Fonte Override (UI do usuário)
  ↓ resultado final
config_resolvida.tema
```

Resolução ocorre **uma única vez** em M08 e é salva em `timeline.config_resolvida`.

---

## 10. ESTRUTURA DE UMA TEMA

**Arquivo:** `config/temas/tema_escuro_dourado.json`

```json
{
  "schema_version": 1,
  "id": "tema_escuro_dourado",
  "nome": "Escuro & Dourado",
  "descricao": "Premium, sofisticado, para finanças",
  "cores": {
    "fundo": "#1A1A1A",
    "texto_principal": "#FFFFFF",
    "destaque": "#D4AF37",
    "secundaria": "#8B7355",
    "cta": "#FFD700"
  },
  "tipografia": {
    "fonte_titulo": "Inter",
    "fonte_corpo": "Inter",
    "tamanho_titulo": 72,
    "tamanho_corpo": 24
  },
  "espacamento": {
    "padding": 40,
    "line_height": 1.5
  },
  "animacoes": {
    "duracao_entrada": 0.3,
    "duracao_saida": 0.3,
    "easing": "easeInOutCubic"
  },
  "assets": {
    "logo": "assets/logo.png",
    "marca_agua": "assets/marca.png",
    "icones": {
      "numero": "assets/icones/numero.svg",
      "grafico": "assets/icones/grafico.svg"
    }
  }
}
```

---

## 11. ESTRUTURA DE UM ESTILO

**Arquivo:** `config/estilos/estilo_didatico.json`

```json
{
  "schema_version": 1,
  "id": "estilo_didatico",
  "nome": "Estilo Didático",
  "descricao": "Pausado, educacional, com muito texto",
  "pacing": {
    "duracao_media_cena": 4.0,
    "min_cena": 2.0,
    "max_cena": 8.0
  },
  "transicoes": {
    "tipo": "fade",
    "duracao": 0.3
  },
  "texto": {
    "max_linhas": 3,
    "quebra_automatica": true,
    "align": "center"
  }
}
```

---

## 12. ESTRUTURA DE DNA DO CANAL

**Arquivo:** `config/canais/canal_exemplo/canal.json`

```json
{
  "schema_version": 1,
  "id": "canal_exemplo",
  "nome": "Canal Exemplo",
  "idioma": "pt-BR",
  "dna": {
    "tom": "direto",
    "humor": 0.2,
    "seriedade": 0.8,
    "formalidade": 0.6,
    "ritmo_base": "medio",
    "publico": "adultos interessados em aprender",
    "elementos_proibidos": ["emoji", "meme"],
    "elementos_caracteristicos": ["numero_grande", "grafico_barra"],
    "cta_padrao": "Inscreva-se para mais",
    "palavras_proibidas": []
  },
  "tema_padrao": "tema_escuro_dourado",
  "estilo_padrao": "estilo_didatico",
  "metadados_obrigatorios": ["titulo", "descricao", "tags"]
}
```

---

## 13. FERRAMENTAS DE DESENVOLVIMENTO

### Executar Pipeline (CLI)
```bash
# Criar novo projeto
python -m pipeline novo --projeto meu_video --canal canal_exemplo --tema tema_neon_tech

# Copiar áudio
cp narracao.wav projetos/meu_video/entrada/audio.wav

# Rodar todo o pipeline
python -m pipeline run --projeto meu_video

# Ou etapa a etapa
python -m pipeline m01 --projeto meu_video
python -m pipeline m04 --projeto meu_video
python -m pipeline m09 --projeto meu_video
python -m pipeline m12 --projeto meu_video --formato 9x16
python -m pipeline m13 --projeto meu_video --formato 9x16
python -m pipeline m14 --projeto meu_video --formato 9x16

# Validar
python -m pipeline validar --projeto meu_video
```

### Interface Web
```bash
python -m app --host 127.0.0.1 --porta 8000
# Abre em http://localhost:8000
```

### Desenvolvimento Remotion
```bash
cd remotion
npm install
npm run dev        # Studio (http://localhost:3000)
npm run build      # Bundle para render
npm run lint       # ESLint + TypeScript
npm test           # Check registry
```

### Testes
```bash
python -m pytest tests/            # Testes Python
cd remotion && npm test            # Check registry Remotion
```

---

## 14. ESTADO ATUAL (MVP)

### ✅ Implementado
- M01: Transcrição com faster-whisper (texto + timestamps por palavra)
- M04: Estruturação em cenas (~3s cada)
- M08: Resolução de configuração (herança)
- M09: Motor de decisão (LLM externo ou regras simples)
- M12: Aplicação de tema visual
- M13: Renderização com Remotion
- M14: Composição com FFmpeg
- **1 Template:** `TituloImpacto` (título grande com efeito)
- **2 Formatos:** 16:9, 9:16
- **Interface Web:** Upload de áudio, escolha de design, acompanhamento ao vivo
- **Edição Básica:** Dividir/remover cenas, ajustar tempos

### 🔄 Em Progresso
- Mais templates (GraficoBarras, NumeroDestaque, etc)
- Integração com Ollama (LLM local)
- Suporte para imagens com palavras-chave

### ❌ Planejado (Fase 2+)
- M05: Análise de conteúdo (semântica)
- M06: Análise de narrativa (arco, climax)
- M07: Motor de ritmo (duração dinâmica de cenas)
- M15: Validação de metadados
- Editor visual (timeline interativa)
- Cache de renders (hash de props)
- Clipes com narrador (chroma key)
- Banco de dados SQLite (metadados, histórico)

---

## 15. DEPENDÊNCIAS CRÍTICAS

**Python (`requirements.txt`):**
- `faster-whisper>=1.1,<2` — Transcrição
- `pydantic>=2,<3` — Validação
- `fastapi>=0.115,<1` — Servidor web
- `uvicorn>=0.30,<1` — ASGI
- `pytest>=8` — Testes

**Node.js (`remotion/package.json`):**
- `remotion@4.0.523` — Renderização (versão **travada**)
- `@remotion/cli@4.0.523`
- `react@19.2.3`
- `zod@4.5.4` — Validação (espelhado com Python)
- `typescript@5.9.3`

**Sistema:**
- Node.js 20+
- Python 3.10+
- FFmpeg
- FFprobe

---

## 16. VALIDAÇÕES CRÍTICAS

### Timeline
- Primeira cena em t=0
- Última cena termina no fim do áudio (tolerância 2ms)
- Sem gaps/sobreposições entre cenas
- Render duration ≥ 33ms (1 quadro @ 30fps)

### Configuração Resolvida
- Todos os IDs de tema/estilo/canal existem
- DNA do canal é respeitado (não sobrescrito)

### Cena / Decisão
- Template existe no catálogo
- Props passam no schema Zod
- Segmentos originais são válidos (existem na transcrição)

### Timeline Renderizada
- Todos os frames foram gerados
- Duração exata = duração do áudio
- Arquivo MP4 final é reproduzível

---

## 17. PRÓXIMAS PRIORIDADES

1. **Implementar 3-5 templates adicionais** (GraficoBarras, NumeroDestaque, Citacao, etc)
2. **Integração Ollama** (LLM local para decision engine)
3. **Cache de renders** (hash de props para não re-renderizar)
4. **Editor visual de timeline** (interativo, com preview ao vivo)
5. **Banco de dados** (SQLite) para histórico e metadados
6. **Motor de análise de conteúdo** (M05) — semântica estruturada
7. **Suporte para imagens do usuário** (keywords na transcrição → insert na cena)
8. **Clipes com narrador** (chroma key background)

---

## 18. DICAS PARA IAs EXTERNAS

**Quando enviar este documento:**
- Pedir ajuda com novos templates
- Debugar erro em módulo específico
- Otimizar performance de renderização
- Adicionar novo recurso ao pipeline
- Integrar com novo LLM/serviço

**Informações essenciais para descrever um bug:**
- Qual comando rodou: `python -m pipeline m<XX> --projeto <id> --formato <fmt>`
- Log completo (últimas 30 linhas)
- Se possível, `timeline.json` da pasta do projeto

**Schema de props esperado:**
Sempre validar novo template contra:
- Python: Pydantic model em `pipeline/schemas/catalogo.py`
- TypeScript: Zod schema em `remotion/src/templates/NomeTemplate/schema.ts`
- Ambos devem estar **idênticos**

---

**Fim do Checkup**  
Salvo em: `c:\Users\Leandro\OneDrive\Desktop\Nova pasta\Devin\CHECKUP_PROJETO_MOTION.md`
