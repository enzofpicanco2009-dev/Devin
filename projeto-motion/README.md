# projeto-motion

Pipeline 100% local que transforma áudio narrado em vídeo com motion graphics:
transcrição (faster-whisper) → cenas → decisão de template → tema visual → render (Remotion) → mixagem (FFmpeg).

Plano de arquitetura completo: `docs/plano_arquitetura.md`.

## Requisitos

- Node.js 20+, Python 3.10+, FFmpeg
- `pip install -r requirements.txt` (em um venv)
- `cd remotion && npm install`

## Uso pelo navegador (recomendado)

```bash
.venv/bin/python -m app          # abre em http://localhost:8000
```

Envie o áudio, escolha o **design** (`config/temas/`), o **ritmo** (`config/estilos/`) e os
formatos, clique em *Gerar vídeo* e acompanhe o progresso. Os vídeos ficam em "Meus vídeos"
(pasta `projetos/<id>/saida/`). Para adicionar um design novo, basta criar um JSON em `config/temas/`.

Na tela inicial você também escolhe o **canal** (preset com público, CTA e design padrão — crie novos
pela própria interface, ficam em `config/canais/`), troca **paleta de cores e fonte** por cima do tema,
e envia **imagens do vídeo** com palavras-chave (entram na cena quando a narração fala delas).
Durante a produção, o painel *Produção ao vivo* mostra o roteiro cena a cena e o frame renderizado de cada uma.

### Roteiro com IA local (opcional)

Instale o [Ollama](https://ollama.com) e baixe um modelo (`ollama pull qwen2.5:7b`). Com ele rodando,
a etapa de roteiro lê a transcrição inteira, divide em ideias e decide o que aparece em cada cena
(título, número, gráfico, seta, comparação, imagem…). O texto falado **não** vai para a tela.
Sem Ollama (ou desmarcando "usar IA" em Opções avançadas) o roteiro é feito por regras.

## Uso pela linha de comando

```bash
# 1. cria a pasta do projeto (projetos/<id>/) e coloca o áudio em entrada/
python -m pipeline novo --projeto meu_video --canal canal_exemplo --tema tema_neon_tech --estilo estilo_dinamico
cp narracao.wav projetos/meu_video/entrada/audio.wav

# 2. roda tudo (m01 → m04 → m09 → m12 → m13 → m14)
python -m pipeline run --projeto meu_video

# ou etapa a etapa
python -m pipeline m01 --projeto meu_video            # transcreve (cache/transcricao.json)
python -m pipeline m04 --projeto meu_video            # cenas -> timeline.json
python -m pipeline m09 --projeto meu_video            # escolhe template por cena
python -m pipeline m12 --projeto meu_video --formato 9x16   # aplica tema (props finais)
python -m pipeline m13 --projeto meu_video --formato 9x16   # render Remotion
python -m pipeline m14 --projeto meu_video --formato 9x16   # mixa áudio -> saida/final_9x16.mp4
python -m pipeline validar --projeto meu_video
```

`timeline.json` é a fonte de verdade: você pode editar texto, template ou props de uma cena
e rodar novamente a partir de `m12`.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `pipeline/` | módulos Python (m01, m04, m08, m09, m12, m13, m14) + CLI |
| `remotion/` | composição única `Video` + templates em `src/templates/` (registry estático) |
| `config/` | defaults e configs por canal (DNA, estilo, tema) |
| `catalogo/templates.json` | catálogo de animações (implementadas e planejadas) |
| `biblioteca/imagens/<canal>/catalogo.json` | imagens do canal com tags, tipo, crédito, ponto focal |
| `projetos/<id>/` | entrada, cache, timeline.json e saida |

## Testes

```bash
python -m pytest tests
cd remotion && npm run lint && npm test
```

## Estado

Implementado: MVP com o template `TituloImpacto`, formatos 16:9 e 9:16, sem gaps e com duração
igual ao áudio. Motor de decisão por IA, templates gráficos/imagem e editor de revisão estão
descritos no catálogo e no plano, ainda não implementados.
