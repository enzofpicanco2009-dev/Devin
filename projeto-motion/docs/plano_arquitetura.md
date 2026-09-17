# Plano de Arquitetura — Sistema Local de Motion Graphics Automatizado

Versão 1.0 · Documento de referência técnica

---

## 1. Visão geral

Pipeline 100% local que transforma áudio narrado em vídeo com motion graphics, escolhendo templates fixos de um catálogo e aplicando identidade visual determinística por canal.

```
ÁUDIO ──► TRANSCRIÇÃO ──► CENAS ──► ANÁLISE ──► DECISÃO ──► TIMELINE ──► TEMA ──► RENDER ──► EXPORT
                                                              ▲
                                                     fonte única de verdade
```

### Princípios (invioláveis)

| # | Princípio | Consequência prática |
|---|---|---|
| P1 | Tudo local | Nenhum serviço obrigatório na nuvem. LLM externo é opcional e só no módulo de decisão. |
| P2 | Sem código gerado em runtime | Templates são componentes Remotion versionados. IA só escolhe e preenche props. |
| P3 | LLM nunca decide visual | LLM devolve `template + props semânticas`. Tema converte em cor/fonte/asset. |
| P4 | Timeline é a fonte de verdade | Todo módulo lê e escreve `timeline.json` com schema versionado. Nada mais é estado. |
| P5 | Determinismo | Mesma timeline + mesmo tema = mesmo vídeo (bit-a-bit, exceto encoder). |
| P6 | Fases validadas | Cada módulo tem entrada, saída e comando de validação isolado. |
| P7 | Versões travadas | Todos os pacotes `remotion` e `@remotion/*` na mesma versão exata. |

---

## 2. Estrutura de pastas

```
projeto-motion/
  pipeline/                      # Python (CLI por módulo)
    __init__.py
    schemas/                     # Pydantic — validação de todos os JSONs
      timeline.py
      canal.py
      tema.py
      estilo.py
      projeto.py
      catalogo.py
    m01_transcrever.py
    m04_estruturar_cenas.py
    m05_analisar_conteudo.py      # fase 2
    m06_analisar_narrativa.py     # fase 2
    m07_motor_ritmo.py            # fase 3
    m08_resolver_config.py
    m09_motor_decisao.py          # fase 2
    m12_aplicar_tema.py
    m13_renderizar.py
    m14_compor.py
    m15_validar_metadados.py      # fase 4
    cli.py                        # `python -m pipeline run --projeto X`
  config/
    defaults/                     # Default do sistema (camada 4 da herança)
      estilo.json
      tema.json
      projeto.json
    canais/
      <canal_id>/
        canal.json               # DNA editorial
        tema.json
        estilo.json
        assets/                  # logo, marca d'água, fontes, ícones
  catalogo/
    templates.json               # registro de todos os templates + schema de props
    icones.json                  # ícone semântico → arquivo por tema
  remotion/                      # projeto Remotion (create-video, Blank)
    src/
      Root.tsx
      Video.tsx                  # composição única que lê a timeline
      templates/
        TituloImpacto/
          index.tsx
          schema.ts              # zod — mesmo schema do catálogo
        _registry.ts             # mapa id → componente
      tema/
        ThemeProvider.tsx
        tokens.ts
      lib/
        layoutTexto.ts           # quebra de linha, auto-fit
  projetos/
    <projeto_id>/
      entrada/
        audio.wav
        roteiro.txt              # opcional
      projeto.json
      timeline.json              # FONTE DE VERDADE
      cache/
        transcricao.json
        analise/
        frames/
      saida/
        final_16x9.mp4
        final_9x16.mp4
  db/
    motion.sqlite                # fase 4
  scripts/
    check_env.sh                 # valida ffmpeg, node, python, modelo whisper
```

---

## 3. Camadas de configuração e herança

Ordem de resolução (mais específico vence):

```
Cena  >  Projeto  >  Canal  >  Default do sistema
```

Exceções: `canal.dna` **não** é sobrescrito por projeto nem cena (só validado contra). `projeto.formato` não é sobrescrito por cena.

Resolução é feita uma vez pelo módulo 8 e gravada em `timeline.config_resolvida` — nenhum módulo posterior lê os arquivos de configuração diretamente.

### 3.1 DNA Editorial — `config/canais/<id>/canal.json`

```jsonc
{
  "schema_version": 1,
  "id": "canal_financas",
  "nome": "Finanças Diretas",
  "idioma": "pt-BR",
  "dna": {
    "tom": "direto",                        // direto | didatico | provocador | inspirador | humoristico
    "humor": 0.2,                           // 0–1
    "seriedade": 0.8,                       // 0–1
    "formalidade": 0.6,                     // 0–1
    "ritmo_base": "medio",                  // lento | medio | rapido | frenetico
    "publico": "adultos 25-45 interessados em investimentos",
    "elementos_proibidos": ["emoji", "meme", "gif", "caps_lock_integral"],
    "elementos_caracteristicos": ["numero_grande", "grafico_barra", "citacao_autor"],
    "narrador_visivel": {
      "usar": false,                        // clipes chroma key (fase 5)
      "frequencia": "baixa"                 // baixa | media | alta
    },
    "palavras_proibidas": [],
    "cta_padrao": "Inscreva-se para mais análises"
  },
  "tema_padrao": "tema_escuro_dourado",
  "estilo_padrao": "estilo_didatico",
  "metadados_obrigatorios": ["titulo", "descricao", "tags", "thumbnail_texto"]  // fase 4
}
```

### 3.2 Estilo de Edição — `estilo.json`

```jsonc
{
  "schema_version": 1,
  "id": "estilo_didatico",
  "ritmo": {
    "duracao_cena_min_s": 1.5,
    "duracao_cena_max_s": 8.0,
    "duracao_cena_alvo_s": 4.0,
    "pausa_corte_s": 0.4,                   // pausa que inicia nova cena
    "fundir_curtas": true
  },
  "animacao": {
    "velocidade": 1.0,                      // multiplicador global (0.5 lento – 2.0 rápido)
    "entrada_frames": 15,
    "saida_frames": 10,
    "spring": { "damping": 200, "stiffness": 100, "mass": 1 },
    "easing_padrao": "easeOutCubic"
  },
  "transicoes": {
    "permitidas": ["corte", "fade", "slide_esquerda"],
    "padrao": "corte",
    "duracao_frames": 8,
    "frequencia": 0.3                       // fração de cortes que recebem transição não-seca
  },
  "templates": {
    "preferidos": ["TituloImpacto", "DestaqueNumerico", "ListaAnimada"],
    "proibidos": [],
    "max_repeticao_consecutiva": 2,        // evitar mesmo template N vezes seguidas
    "peso_variedade": 0.5                   // 0 = ignora histórico, 1 = força alternância
  },
  "densidade_visual": "media",              // baixa | media | alta
  "legendas": {
    "ativar": false,                        // fase 2 (kinetic captions)
    "modo": "palavra"                       // palavra | frase
  }
}
```

### 3.3 Tema Visual — `tema.json`

```jsonc
{
  "schema_version": 1,
  "id": "tema_escuro_dourado",
  "cores": {
    "fundo": "#0D0D0D",
    "fundo_secundario": "#1A1A1A",
    "texto": "#FFFFFF",
    "texto_secundario": "#B3B3B3",
    "destaque": "#F5C042",
    "destaque_2": "#42A5F5",
    "positivo": "#2ECC71",
    "negativo": "#E74C3C",
    "neutro": "#95A5A6"
  },
  "tipografia": {
    "fonte_titulo": { "familia": "Inter", "peso": 800, "arquivo": "assets/Inter-ExtraBold.ttf" },
    "fonte_corpo":  { "familia": "Inter", "peso": 500, "arquivo": "assets/Inter-Medium.ttf" },
    "fonte_numero": { "familia": "JetBrains Mono", "peso": 700, "arquivo": "assets/JetBrainsMono-Bold.ttf" },
    "escala": {                               // px em 1080p; escalados por resolução
      "titulo_max": 96, "titulo_min": 48,
      "corpo": 40,
      "numero": 160,
      "legenda": 36
    },
    "altura_linha": 1.15,
    "espacamento_letras": -0.02,
    "max_linhas_titulo": 3,
    "max_caracteres_linha": 28
  },
  "formas": {
    "raio_borda": 16,
    "espessura_borda": 0,
    "sombra": { "ativar": true, "blur": 24, "opacidade": 0.4 }
  },
  "icones": {
    "conjunto": "lucide",                     // pacote de ícones instalado
    "estilo": "outline",                      // outline | filled
    "cor": "destaque"                         // referência a `cores`
  },
  "marca": {
    "logo": "assets/logo.png",
    "logo_posicao": "inferior_direito",
    "logo_tamanho_pct": 8,                    // % da largura
    "logo_opacidade": 0.85,
    "marca_dagua": { "ativar": false, "texto": "@financasdiretas", "opacidade": 0.3 }
  },
  "safe_areas": {                             // margens em % por formato
    "16x9": { "topo": 5, "base": 8, "lados": 6 },
    "9x16": { "topo": 12, "base": 20, "lados": 6 },
    "1x1":  { "topo": 8, "base": 8, "lados": 6 }
  },
  "fundo": {
    "tipo": "solido",                         // solido | gradiente | textura | video_loop
    "gradiente": { "de": "#0D0D0D", "para": "#1A1A2E", "angulo": 135 },
    "textura": null
  },
  "mapa_semantico": {                         // props semânticas → tokens visuais
    "enfase": { "baixa": "texto_secundario", "media": "texto", "alta": "destaque" },
    "sentimento": { "positivo": "positivo", "negativo": "negativo", "neutro": "neutro" }
  }
}
```

### 3.4 Configuração de Projeto — `projetos/<id>/projeto.json`

```jsonc
{
  "schema_version": 1,
  "id": "video_042",
  "canal_id": "canal_financas",
  "titulo_trabalho": "Por que a Selic importa",
  "entrada": {
    "audio": "entrada/audio.wav",
    "roteiro": "entrada/roteiro.txt",         // opcional — melhora transcrição
    "idioma": "pt"
  },
  "formatos": [
    { "id": "16x9", "largura": 1920, "altura": 1080, "fps": 30, "plataforma": "youtube" },
    { "id": "9x16", "largura": 1080, "altura": 1920, "fps": 30, "plataforma": "shorts" }
  ],
  "formato_principal": "16x9",
  "overrides": {                               // sobrescreve canal (exceto dna)
    "tema": null,
    "estilo": { "ritmo": { "duracao_cena_alvo_s": 3.5 } }
  },
  "render": {
    "codec": "h264",
    "crf": 18,
    "preset_encoder": "medium",
    "concorrencia": 4,
    "cache": true
  },
  "transcricao": {
    "modelo": "small",                        // tiny | base | small | medium | large-v3
    "device": "auto",                         // auto | cpu | cuda
    "compute_type": "int8",
    "word_timestamps": true,
    "vad": true
  },
  "decisao": {
    "provedor": "ollama",                     // nenhum | ollama | openai | anthropic
    "modelo": "llama3.1:8b",
    "temperatura": 0.3,
    "template_fixo": null                     // MVP: "TituloImpacto" força template único
  }
}
```

---

## 4. Timeline — schema central (`timeline.json`)

Toda etapa lê e escreve este arquivo. Campos opcionais são preenchidos progressivamente pelos módulos; `etapas_concluidas` controla idempotência.

```jsonc
{
  "schema_version": 1,
  "projeto_id": "video_042",
  "gerado_em": "2026-09-11T00:00:00Z",
  "etapas_concluidas": ["m01", "m04", "m08", "m09", "m12"],

  "audio": {
    "arquivo": "entrada/audio.wav",
    "duracao_s": 612.48,
    "sample_rate": 48000,
    "hash": "sha256:..."
  },

  "config_resolvida": { /* saída do m08: estilo+tema+projeto já fundidos */ },

  "narrativa": {                               // m06 — fase 3
    "perfil": "explicativo",                   // explicativo | lista | historia | opiniao | tutorial
    "curva_energia_alvo": [0.6, 0.5, 0.7, 0.9, 0.6],
    "fases": [
      { "tipo": "gancho", "inicio_s": 0, "fim_s": 12.3 },
      { "tipo": "desenvolvimento", "inicio_s": 12.3, "fim_s": 540.0 }
    ]
  },

  "cenas": [
    {
      "id": "c001",
      "indice": 0,
      "start_s": 0.00,                         // início da fala
      "end_s": 4.21,                           // fim da fala
      "render_start_s": 0.00,                  // início visual (= start_s)
      "render_end_s": 4.80,                    // fim visual (estendido até próxima cena)
      "texto": "A Selic é a taxa que define tudo.",
      "palavras": [ { "w": "A", "s": 0.00, "e": 0.12, "p": 0.98 } ],
      "segmentos_originais": [0, 1],           // índices em transcricao.json

      "audio": {                               // m02 — fase 3
        "energia": 0.72, "pico": 0.91, "velocidade_ppm": 148, "enfase_palavras": [4]
      },
      "conteudo": {                            // m05 — fase 2
        "tipo": "definicao",                   // definicao | numero | lista | comparacao | citacao | pergunta | cta | transicao
        "entidades": [{ "texto": "Selic", "tipo": "conceito" }],
        "numeros": [],
        "importancia": 0.8,
        "sentimento": "neutro"
      },
      "narrativa": { "fase": "gancho", "energia_alvo": 0.7 },   // m06
      "ritmo": {                               // m07
        "velocidade_animacao": 1.1,
        "transicao_entrada": "corte",
        "densidade": "media"
      },

      "decisao": {                             // m09
        "template": "TituloImpacto",
        "props_semanticas": {
          "texto": "A Selic é a taxa que define tudo.",
          "enfase": "alta",
          "palavras_destaque": ["Selic"]
        },
        "confianca": 0.86,
        "alternativas": ["DestaqueNumerico"],
        "justificativa": "Frase de abertura curta, define conceito central.",
        "origem": "llm"                        // llm | regra | manual | fixo
      },

      "props_finais": {                        // m12 — o que o Remotion recebe
        "texto": "A Selic é a taxa que define tudo.",
        "duracaoEmSegundos": 4.80,
        "corTexto": "#FFFFFF",
        "corFundo": "#0D0D0D",
        "corDestaque": "#F5C042",
        "palavrasDestaque": ["Selic"],
        "fonte": { "familia": "Inter", "peso": 800 },
        "tamanhoFonte": 84,
        "linhas": ["A Selic é a taxa", "que define tudo."],
        "entradaFrames": 15,
        "saidaFrames": 10,
        "spring": { "damping": 200, "stiffness": 100, "mass": 1 }
      },

      "revisao": { "bloqueada": false, "editado_manualmente": false, "nota": "" },
      "render": { "hash_props": "sha256:...", "cache_hit": true }
    }
  ],

  "historico_templates": { "TituloImpacto": 42, "DestaqueNumerico": 7 },
  "validacao": { "erros": [], "avisos": ["c017: texto com 31 palavras, fonte reduzida a 48px"] }
}
```

### Invariantes da timeline (validados pelo schema)

- `cenas[i].render_end_s == cenas[i+1].render_start_s` (sem gaps, sem sobreposição).
- `cenas[0].render_start_s == 0` e `cenas[-1].render_end_s == audio.duracao_s`.
- `start_s <= render_start_s < render_end_s` e `end_s <= render_end_s`.
- `props_finais` valida contra `catalogo.templates[template].schema`.
- Template escolhido ∉ `estilo.templates.proibidos` e respeita `dna.elementos_proibidos`.

---

## 5. Catálogo de templates — `catalogo/templates.json`

```jsonc
{
  "schema_version": 1,
  "templates": [
    {
      "id": "TituloImpacto",
      "tipo": "template_codigo",               // template_codigo | template_video_real
      "categoria": "texto",                    // texto | numero | lista | comparacao | citacao | cta | transicao | narrador
      "descricao_para_llm": "Frase curta e forte em tela cheia. Use para ganchos, definições e afirmações centrais. Máx 20 palavras.",
      "duracao_min_s": 1.5,
      "duracao_max_s": 10,
      "tipos_conteudo_compativeis": ["definicao", "pergunta", "transicao", "cta"],
      "fases_compativeis": ["gancho", "desenvolvimento", "climax", "conclusao"],
      "energia": [0.3, 1.0],
      "props_semanticas_schema": {
        "texto": { "tipo": "string", "obrigatorio": true, "max_palavras": 20 },
        "enfase": { "tipo": "enum", "valores": ["baixa", "media", "alta"], "padrao": "media" },
        "palavras_destaque": { "tipo": "string[]", "max": 3, "padrao": [] }
      },
      "props_finais_schema": "remotion/src/templates/TituloImpacto/schema.ts",
      "custo_render": 1.0                      // relativo, para estimativa de tempo
    },
    {
      "id": "DestaqueNumerico",
      "tipo": "template_codigo",
      "categoria": "numero",
      "descricao_para_llm": "Número grande animado (contador) com rótulo. Use quando a cena contém um dado numérico central.",
      "duracao_min_s": 2, "duracao_max_s": 8,
      "tipos_conteudo_compativeis": ["numero", "comparacao"],
      "fases_compativeis": ["desenvolvimento", "climax"],
      "energia": [0.4, 1.0],
      "props_semanticas_schema": {
        "valor": { "tipo": "number", "obrigatorio": true },
        "formato": { "tipo": "enum", "valores": ["inteiro", "decimal", "percentual", "moeda"], "padrao": "inteiro" },
        "prefixo": { "tipo": "string", "padrao": "" },
        "sufixo": { "tipo": "string", "padrao": "" },
        "rotulo": { "tipo": "string", "max_palavras": 8 },
        "sentimento": { "tipo": "enum", "valores": ["positivo", "negativo", "neutro"], "padrao": "neutro" },
        "icone": { "tipo": "icone_semantico", "padrao": null }
      },
      "custo_render": 1.2
    },
    {
      "id": "ListaAnimada",
      "categoria": "lista",
      "descricao_para_llm": "2 a 5 itens que aparecem em sequência. Use para enumerações.",
      "props_semanticas_schema": {
        "titulo": { "tipo": "string", "max_palavras": 6 },
        "itens": { "tipo": "string[]", "min": 2, "max": 5, "max_palavras_item": 6 },
        "icone_itens": { "tipo": "icone_semantico", "padrao": "check" },
        "sincronizar_com_palavras": { "tipo": "boolean", "padrao": true }   // usa timestamps de palavras
      }
    },
    {
      "id": "Citacao",
      "categoria": "citacao",
      "props_semanticas_schema": {
        "texto": { "tipo": "string", "max_palavras": 30 },
        "autor": { "tipo": "string" },
        "fonte": { "tipo": "string", "padrao": "" }
      }
    },
    {
      "id": "Comparacao",
      "categoria": "comparacao",
      "props_semanticas_schema": {
        "lado_a": { "rotulo": "string", "valor": "string|number", "sentimento": "enum" },
        "lado_b": { "rotulo": "string", "valor": "string|number", "sentimento": "enum" },
        "modo": { "tipo": "enum", "valores": ["texto", "barras", "vs"], "padrao": "vs" }
      }
    },
    {
      "id": "ChamadaAcao",
      "categoria": "cta",
      "props_semanticas_schema": {
        "texto": { "tipo": "string", "max_palavras": 10 },
        "acao": { "tipo": "enum", "valores": ["inscrever", "like", "comentar", "link", "proximo_video"] }
      }
    },
    {
      "id": "Bumper",
      "categoria": "transicao",
      "descricao_para_llm": "Transição visual curta com logo. Use entre blocos temáticos.",
      "duracao_min_s": 0.8, "duracao_max_s": 2.5,
      "props_semanticas_schema": { "texto": { "tipo": "string", "max_palavras": 4, "padrao": "" } }
    },
    {
      "id": "NarradorReal",
      "tipo": "template_video_real",             // fase 5
      "categoria": "narrador",
      "props_semanticas_schema": {
        "clip_id": { "tipo": "string" },
        "posicao": { "tipo": "enum", "valores": ["centro", "esquerda", "direita", "pip"] },
        "elemento_grafico": { "tipo": "template_ref", "padrao": null }   // composição híbrida
      },
      "clips_metadata_schema": {
        "emocao": ["neutro", "animado", "serio", "surpreso", "ironico"],
        "gesto": ["nenhum", "apontar", "contar_dedos", "abrir_bracos", "encolher_ombros"],
        "olhar": ["camera", "esquerda", "direita", "baixo"],
        "fase_compativel": ["gancho", "desenvolvimento", "climax", "conclusao", "cta"],
        "energia": "0-1",
        "duracao_s": "number",
        "loopavel": "boolean"
      }
    }
  ]
}
```

### Regra de contrato do template (Remotion)

Cada template exporta: `Component`, `schema` (zod), `defaultProps`, `calcularDuracaoMinima(props, fps)`. `_registry.ts` importa estaticamente todos — sem `import()` dinâmico, sem Babel.

---

## 6. Módulos do pipeline

Cada módulo: `python -m pipeline <modulo> --projeto <id> [--force]`. Lê `timeline.json`, valida schema, executa, grava, adiciona a `etapas_concluidas`. Falha se pré-requisitos ausentes.

### M01 — Transcrição

| Item | Valor |
|---|---|
| Entrada | `entrada/audio.*` (qualquer formato; converte para WAV 16kHz mono via ffmpeg) |
| Motor | `faster-whisper` |
| Parâmetros | `modelo`, `device`, `compute_type`, `language`, `word_timestamps=True`, `vad_filter=True`, `vad_parameters.min_silence_duration_ms=300`, `beam_size=5`, `initial_prompt=<roteiro truncado 200 tokens>` se existir |
| Saída | `cache/transcricao.json`: `{segmentos:[{start,end,text,words:[{word,start,end,probability}]}], idioma, duracao_s}` |
| Validação | último `end` ≤ `duracao_s + 0.5`; nenhum segmento vazio; imprime WER estimado vs roteiro se houver |

### M02 — Análise de áudio/voz (fase 3)

Ferramentas: `librosa` (RMS, onset), `pyannote`/`webrtcvad` opcional. Por cena: `energia` (RMS normalizado 0–1), `pico`, `velocidade_ppm` (palavras/min), `enfase_palavras` (índices onde RMS > μ+1.5σ), `pausas_internas`.

### M03 — Análise de música (fase 3, opcional)

`librosa.beat.beat_track` → `bpm`, `beats_s[]`, `drops_s[]` (picos de energia espectral). Usado pelo M07 para alinhar cortes a beats (tolerância `±80ms`).

### M04 — Estruturação em cenas

Algoritmo (sobre segmentos ou palavras se `word_timestamps`):

```
1. Agrupar sequencialmente. Novo grupo se gap > pausa_corte_s (0.4).
2. Para cada grupo > duracao_cena_max_s (8.0):
     se houver pausa interna ≥ 0.15s: dividir no maior gap mais próximo do meio
     senão: manter inteiro (nunca cortar palavra/segmento)
3. Fundir cena < duracao_cena_min_s (1.5) com a SEGUINTE se soma ≤ max; 
   senão com a anterior se soma ≤ max; senão manter.
4. Preencher gaps: render_start_s[i] = start_s[i] (i=0 → 0);
                   render_end_s[i]   = start_s[i+1]  (última → audio.duracao_s)
5. Se gap > gap_max_s (3.0): inserir cena {template:"Bumper"|"Fundo", texto:""} em vez de estender.
```

Parâmetros: `pausa_corte_s`, `duracao_cena_min_s`, `duracao_cena_max_s`, `pausa_interna_min_s=0.15`, `gap_max_s=3.0`, `modo_divisao="segmento"|"palavra"`.

Saída no console: total de cenas, histograma de durações, cenas > max, cenas fundidas.

### M05 — Análise de conteúdo por cena (fase 2)

LLM ou regras (spaCy `pt_core_news_md` para entidades/números; LLM para `tipo` e `importancia`). Saída em `cenas[].conteudo`. Prompt em lote (janela de 10 cenas com contexto ±2).

### M06 — Análise narrativa global (fase 3)

Uma chamada LLM com a transcrição completa resumida por cena → `narrativa.perfil`, `fases[]`, `curva_energia_alvo[]` (amostrada em 5–10 pontos), e `cenas[].narrativa.fase`.

### M07 — Motor de ritmo (fase 3)

Determinístico. Entrada: `narrativa`, `audio`, `estilo`. Saída por cena:

```
velocidade_animacao = estilo.animacao.velocidade × (0.8 + 0.4 × energia_alvo)
densidade           = alta se energia_alvo > 0.7 e importancia > 0.6; baixa se < 0.4; senão media
transicao_entrada   = "corte" se mudança de fase; senão sorteio ponderado por estilo.transicoes.frequencia (seed = hash da cena)
```

### M08 — Resolução de configuração

Deep-merge `defaults → canal → projeto.overrides → cena.overrides` por camada. Escreve `config_resolvida` e um `config_hash`. Valida referências (fontes existem, ícones existem, tema referencia cores válidas).

### M09 — Motor de decisão

**Entrada por cena** (as 6 perguntas):

| Pergunta | Fonte |
|---|---|
| 1. O que é dito | `texto`, `conteudo.entidades`, `conteudo.numeros` |
| 2. Importância | `conteudo.importancia` |
| 3. Função narrativa | `narrativa.fase` |
| 4. Como é dito | `audio.energia`, `audio.enfase_palavras` |
| 5. Antes/depois | cenas `i-2..i+2` (template + texto), `historico_templates` |
| 6. Como o canal faz | `canal.dna`, estatísticas de uso do DB (fase 4) |

**Filtro pré-LLM (determinístico)**: templates candidatos = catálogo ∩ compatíveis com `tipo_conteudo` ∩ compatíveis com `fase` ∩ duração ok ∩ não proibidos ∩ não excede `max_repeticao_consecutiva`.

**Prompt ao LLM**: recebe só candidatos (com `descricao_para_llm` e `props_semanticas_schema`), texto, contexto vizinho, DNA em 3 linhas. Devolve JSON estrito: `{template, props_semanticas, confianca, justificativa}`. Validado com Pydantic; se inválido → retry 1x → fallback regra (`TituloImpacto` com texto da cena).

**Modo MVP**: `decisao.template_fixo = "TituloImpacto"` pula o LLM; `origem = "fixo"`.

**Parâmetros**: `provedor`, `modelo`, `temperatura`, `janela_contexto=2`, `lote=8`, `confianca_min=0.5` (abaixo → marca `revisao.nota` para humano), `timeout_s=60`, `cache_por_hash_texto=true`.

### M10 — Timeline (não é módulo; é o schema da seção 4 + `pipeline/schemas/timeline.py`)

### M11 — Editor / revisão manual (fase 4)

Fase 1: edição direta do `timeline.json` + `python -m pipeline validar`. Fase 4: UI local (Remotion Studio com `defaultProps` apontando para timeline, ou app leve). Campos editáveis: `decisao.*`, `render_start/end`, `revisao.bloqueada` (impede o motor de sobrescrever).

### M12 — Aplicação de tema

Determinístico e puro: `(props_semanticas, template, config_resolvida, formato) → props_finais`.

Responsabilidades:
- Mapear `enfase/sentimento/icone` via `tema.mapa_semantico` e `catalogo/icones.json`.
- **Layout de texto**: quebra em linhas por `max_caracteres_linha`; se > `max_linhas_titulo`, reduz fonte linearmente até `titulo_min`; se ainda não cabe → aviso em `validacao.avisos` e trunca com "…" (nunca silencioso).
- Escalar tamanhos por resolução (base 1080p) e aplicar `safe_areas[formato]`.
- Injetar `entradaFrames/saidaFrames/spring` do estilo × `ritmo.velocidade_animacao`.
- Calcular `hash_props` para cache.

### M13 — Renderização

**Estratégia**: uma composição Remotion `Video` que recebe a timeline inteira via `--props` e posiciona cada cena com `<Sequence from={round(render_start_s*fps)} durationInFrames={...}>`. Sem concat.

Parâmetros: `--concurrency` (=`render.concorrencia`), `--codec h264`, `--crf`, `--frames a-b` para render por trecho, `--image-format jpeg`, `--muted` (áudio entra no M14).

Cache por cena (`render.cache`): se `hash_props` inalterado e `cache/frames/<hash>/` existe, render de trecho é pulado e frames reutilizados; senão renderiza só os frames da cena (`--frames`). Estimativa de tempo = Σ `custo_render × duração`.

Composição `Video` também aceita `--props '{"cenaId":"c017"}'` para preview de cena única (debug).

### M14 — Composição final

FFmpeg:

```
ffmpeg -i video_mudo.mp4 -i entrada/audio.wav \
  -c:v copy -c:a aac -b:a 192k -map 0:v:0 -map 1:a:0 \
  -shortest -movflags +faststart saida/final_16x9.mp4
```

Validação: `ffprobe` duração vídeo vs áudio (tolerância `±1 frame`). Para múltiplos formatos, M12→M13→M14 rodam por formato (mesma timeline, `props_finais` recalculadas).

Parâmetros: `audio_codec=aac`, `audio_bitrate=192k`, `normalizar_loudness=true` (`loudnorm I=-14 LRA=11 TP=-1` para YouTube), `faststart=true`.

### M15 — Validação de metadados (fase 4)

Checa `canal.metadados_obrigatorios` em `projeto.metadados`; título ≤ 100 chars, descrição ≤ 5000, tags ≤ 500 chars total; bloqueia M16 se falhar.

### M16 — Exportação (fase 4)

Copia para `exportacoes/<canal>/<projeto>/<data>/` com `manifest.json` (hashes, timeline, config). Sem upload automático na v1.

### M17 — Banco de dados / biblioteca / memória (fase 4)

SQLite. Tabelas: `canais`, `projetos`, `cenas` (template, tipo_conteudo, fase, duração, editado_manualmente), `exportacoes`, `clips_narrador` (fase 5), `uso_templates` (view agregada). `cenas_fts` (FTS5 sobre texto). Estatísticas alimentam a pergunta 6 do motor (ex.: "neste canal, `numero` → `DestaqueNumerico` 83%").

---

## 7. Template `TituloImpacto` — especificação

```ts
// schema.ts
export const schema = z.object({
  texto: z.string(),
  linhas: z.array(z.string()).optional(),      // pré-quebrado pelo M12; se ausente, quebra no cliente
  duracaoEmSegundos: z.number().positive(),
  corTexto: z.string().default("#FFFFFF"),
  corFundo: z.string().default("#0D0D0D"),
  corDestaque: z.string().default("#F5C042"),
  palavrasDestaque: z.array(z.string()).default([]),
  fonte: z.object({ familia: z.string(), peso: z.number() }).default({ familia: "Inter", peso: 800 }),
  tamanhoFonte: z.number().default(84),
  entradaFrames: z.number().int().default(15),
  saidaFrames: z.number().int().default(10),
  deslocamentoEntradaPx: z.number().default(40),
  spring: z.object({ damping: z.number(), stiffness: z.number(), mass: z.number() })
           .default({ damping: 200, stiffness: 100, mass: 1 }),
  safeArea: z.object({ topo: z.number(), base: z.number(), lados: z.number() }).optional(),
});
```

Animação (sempre via `useCurrentFrame` / `useVideoConfig`):

```
frame = useCurrentFrame(); { fps, durationInFrames } = useVideoConfig()
entrada = spring({ frame, fps, config: spring, durationInFrames: entradaFrames })
opacidadeIn  = interpolate(frame, [0, entradaFrames], [0, 1], clamp)
translateY   = interpolate(entrada, [0, 1], [deslocamentoEntradaPx, 0])
opacidadeOut = interpolate(frame, [durationInFrames - saidaFrames, durationInFrames], [1, 0], clamp)
opacidade    = min(opacidadeIn, opacidadeOut)
```

`Root.tsx` registra: `Video` (timeline completa, `calculateMetadata` lê `audio.duracao_s × fps`) e `TituloImpacto` isolado (para preview no Studio; `durationInFrames = round(duracaoEmSegundos × fps)`).

---

## 8. Contratos entre Python, Remotion e FFmpeg

| Fronteira | Contrato | Validação |
|---|---|---|
| Python → Remotion | `timeline.json` (só `cenas[].{id, render_start_s, render_end_s, decisao.template, props_finais}` + `config_resolvida.formato`) | zod no Remotion falha o render se inválido |
| Catálogo ↔ Remotion | `catalogo/templates.json[].id` == chaves de `_registry.ts` | teste `npm test` compara os dois |
| Remotion → FFmpeg | mp4 mudo, fps e duração exatos | `ffprobe` frames == `round(duracao_s × fps)` |
| FFmpeg → saída | duração final == duração áudio ±1 frame | `ffprobe` |

Versões travadas: Node LTS, `remotion@X.Y.Z` = `@remotion/cli` = `@remotion/studio` = `@remotion/whisper-webgpu` = `@remotion/video-matting` (devDeps), Python 3.11+, `faster-whisper`, `pydantic>=2`, FFmpeg ≥ 6.

---

## 9. Fases de implementação

| Fase | Módulos | Critério de aceite |
|---|---|---|
| **0 — Ambiente** | `check_env.sh`, projeto Remotion Blank, schemas Pydantic/zod | `npx remotion render` do Blank funciona; `python -m pipeline validar` roda |
| **1 — MVP** | M01, M04, M08 (mínimo), M12 (mínimo), M13, M14, `TituloImpacto`, `Video` | Áudio de 2 min → vídeo final sincronizado (±1 frame), sem gaps |
| **2 — Decisão** | +5 templates, M05, M09 com Ollama, `catalogo/templates.json` | 80% das cenas com template ≠ TituloImpacto quando apropriado; 0 props inválidas |
| **3 — Ritmo** | M02, M03, M06, M07, transições | Curva de energia visível; cortes alinhados a beats quando há trilha |
| **4 — Sistema** | M11 (editor), M15, M16, M17 (SQLite + FTS5), multi-formato | 2 canais, 3 projetos, exportação bloqueada sem metadados |
| **5 — Híbrido** | `NarradorReal`, chroma key (`@remotion/video-matting` ou ffmpeg `chromakey`), metadados de clipe | Cena com narrador + gráfico composto |

Cada fase termina com um vídeo real gerado e revisado. Nenhuma fase começa sem a anterior aceita.

---

## 10. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Whisper corta frases em pontos ruins | `word_timestamps` + M05 pode redefinir fronteiras (fase 2) |
| Texto longo não cabe no template | Auto-fit em M12 com aviso explícito; LLM limitado por `max_palavras` |
| Render lento (CPU) | Cache por `hash_props`, `--frames` por cena, `concurrency`; preview em 540p |
| LLM devolve JSON inválido | Pydantic + retry 1x + fallback determinístico; nunca aborta o pipeline |
| Repetição visual monótona | `max_repeticao_consecutiva`, `peso_variedade`, histórico no prompt |
| Drift áudio/vídeo | Composição única com `Sequence` por frame inteiro; ffprobe valida ±1 frame |
| Quebra de versão Remotion | Todos `@remotion/*` na mesma versão; `package-lock` commitado |
| Fontes não carregam no render | `@remotion/google-fonts` ou `staticFile` + `delayRender` no `ThemeProvider` |
