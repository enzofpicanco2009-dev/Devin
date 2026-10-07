const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const EXT_INSTRUCOES_KEY = "ext_instrucoes_por_canal_v2";
const IA_INSTRUCOES_KEY = "ia_instrucoes_por_canal_v1";
const EXT_INSTRUCOES_KEY_ANTIGO = "ext_instrucoes_globais_v1";
const IA_INSTRUCOES_KEY_ANTIGO = "ia_instrucoes_globais_v1";
const FUNDO_PLANO_PREFIX = "fundo_cena_plano_v1:";
const EXT_REGRAS_MARCADOR = "Regras adicionais do editor (obrigatórias):";
const EXT_EXEMPLO_MARCADOR = "\nExemplo (outro assunto)";
const EXT_TRANSCRICAO_MARCADOR = "\nTranscrição:\n";
const EXT_BLOCO_ANIMACAO = `Opção de animação de entrada e saída (veja a regra 4.1, que é obrigatória):
- Campo: "animacao_entrada": "padrao|de_baixo|de_cima"
- Campo: "animacao_saida": "padrao|para_cima|para_baixo"
- Use principalmente em TituloImpacto, TextoCorrido, Pergunta, Citacao, NumeroDestaque, SetaTendencia, ListaAnimada, ImagemDestaque e TextoLongo.
- Se omitir, o padrão é "padrao" em ambos.`;
const EXT_PROMPT_EDITAVEL_PADRAO = `Você é o roteirista visual de um canal do YouTube. Recebe a transcrição de uma narração dividida em trechos numerados (#1, #2, …) e cria o ROTEIRO DE CENAS de motion graphics.

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
- Não use botão sólido no CTAFinal: prefira "contorno".`;

function garantirBlocoAnimacaoPrompt(texto) {
  const t = String(texto || "").trim();
  if (!t || /animacao_entrada/i.test(t)) return t;
  const bloco = `\n\n${EXT_BLOCO_ANIMACAO}`;
  const idxRegras = t.indexOf(`\n${EXT_REGRAS_MARCADOR}`);
  if (idxRegras >= 0) {
    return `${t.slice(0, idxRegras).trimEnd()}${bloco}\n\n${t.slice(idxRegras + 1)}`;
  }
  const idxTranscricao = t.indexOf(EXT_TRANSCRICAO_MARCADOR);
  if (idxTranscricao >= 0) {
    return `${t.slice(0, idxTranscricao).trimEnd()}${bloco}\n\n${t.slice(idxTranscricao + 1)}`;
  }
  return `${t}${bloco}`;
}

function normalizarInstrucoesExternasPadrao(texto) {
  const t = String(texto || "").trim();
  if (!t) return garantirBlocoAnimacaoPrompt(EXT_PROMPT_EDITAVEL_PADRAO);
  if (/^Você é o roteirista visual/i.test(t)) return garantirBlocoAnimacaoPrompt(t);
  if (ehInstrucoesLegadoCurtas(t)) return garantirBlocoAnimacaoPrompt(EXT_PROMPT_EDITAVEL_PADRAO);
  return t;
}
function parecePromptCompleto(texto) {
  const t = String(texto || "");
  return /Como pensar:/i.test(t) && /Regras adicionais do editor/i.test(t);
}
const FORMATO_DIMENSOES = {
  "16x9": { w: 1920, h: 1080 },
  "9x16": { w: 1080, h: 1920 },
  "1x1": { w: 1080, h: 1080 },
};

const I18N = {
  pt: {
    navNew: "Novo vídeo",
    navLibrary: "Meus vídeos",
    selDeleteTheme: "Excluir tema selecionado",
    selDeleteChannel: "Excluir canal selecionado",
    creating: "Enviando...",
    transcribeAudio: "Transcrever áudio",
    generateVideo: "Gerar vídeo",
    askThemeName: "Dê um nome ao tema.",
    askChannelName: "Dê um nome ao canal.",
    deleteThemeConfirm: "Excluir este tema personalizado?",
    deleteThemeSelectedConfirm: "Excluir o tema selecionado?",
    deleteMediaConfirm: (name) => `Apagar \"${name}\" do banco? Vídeos já gerados não são afetados.`,
    mediaNamePrompt: "Nome da mídia:",
    mediaDescPrompt: "Descrição para a IA (o que aparece, quando usar):",
    cannotSave: "Não foi possível salvar.",
    pasteReturnedScript: "Cole o roteiro que a IA devolveu.",
    copied: "Copiado!",
    waitingScriptStatus: (n) => `${n} trechos transcritos — aguardando o roteiro`,
    appliedScriptStatus: "roteiro aplicado — cole outro para refazer",
    videoLabel: "vídeo",
    imageLabel: "imagem",
    noMediaInProject: "Nenhuma mídia neste vídeo — a IA não poderá usar imagens ou vídeos.",
    allMediaAlreadyLinked: "Todas as mídias do banco já estão neste vídeo. Para adicionar uma nova ao banco, use a tela \"Novo vídeo\".",
    clickToAttach: "clique para anexar",
    cannotAttach: "Não foi possível anexar.",
    waitingPasteScript: " — esperando você colar o roteiro",
    somethingWentWrong: "Algo deu errado.",
    tryAgain: "Tentar de novo",
    downloadMp4: "Baixar MP4",
    downloadMp3: "Baixar MP3",
    modeLocalIA: (modelo) => `IA local · ${modelo || ""}`,
    modeExternalIA: "Roteiro de outra IA",
    modeRules: "Roteiro por regras",
    modeFixed: "Template fixo",
    readingTranscript: " — lendo a transcrição...",
    avThinking: "A IA está lendo a narração inteira, dividindo em ideias e decidindo o que aparece em cada cena.",
    avDone: (n) => `${n} cenas. O texto falado não vai para a tela: cada cena mostra o que a IA escreveu para ela.`,
    rendering: "renderizando...",
    renderToSee: "renderize para ver",
    edit: "Editar",
    originalSpeech: "Fala original",
    oneEditedScene: "1 cena editada",
    manyEditedScenes: (n) => `${n} cenas editadas`,
    removeSceneConfirm: "Remover esta cena? O trecho de áudio passa para a cena vizinha.",
    deleteProjectConfirm: "Tem certeza que deseja excluir este projeto?",
    deleteChannelConfirm: "Excluir o canal selecionado?",
    cannotDeleteProject: "Não foi possível excluir o projeto.",
    cannotDeleteChannel: "Não foi possível excluir o canal.",
    noVideosYet: "Nenhum vídeo ainda. Crie o primeiro em \"Novo vídeo\".",
    ready: "Pronto",
    generating: "Gerando...",
    error: "Erro",
    noVideo: "Sem vídeo",
    optionFromTheme: "Do tema",
    optionAuto: "Detectar automaticamente",
    optionPortuguese: "Português",
    optionEnglish: "Inglês",
    optionSpanish: "Espanhol",
    optionFrench: "Francês",
    optionItalian: "Italiano",
    optionGerman: "Alemão",
    optionJapanese: "Japonês",
    toneDirect: "Tom direto",
    toneCasual: "Tom descontraído",
    toneFormal: "Tom formal",
    toneInspirational: "Tom inspirador",
    qualityFast: "Rápida (tiny)",
    qualityGood: "Boa (base)",
    qualityGreat: "Ótima (small) - recomendado",
    qualityMax: "Máxima (medium, lento)",
    cannotDeleteTheme: "Não foi possível excluir o tema.",
    cannotDelete: "Não foi possível excluir.",
    emptyBank: "O banco está vazio. Adicione a primeira imagem ou vídeo abaixo.",
    promptMediaName: "Nome",
    promptMediaDesc: "Descrição para a IA: o que aparece, quando usar (obrigatório)",
    remove: "Remover",
    deleteThemeTitle: "Excluir tema",
    deleteProjectTitle: "Excluir projeto",
    removeFromVideoTitle: "Tirar deste vídeo",
    heroTitle: "Transforme sua narração em vídeo",
    heroSub: "Envie o áudio, escolha o visual e receba o vídeo pronto. Sem timeline, sem editor.",
    step1Title: "Áudio da narração",
    step2Title: "Para qual canal?",
    step3Title: "Design",
    step4Title: "Ritmo da edição",
    step5Title: "Imagens e vídeos",
    step6Title: "Onde vai publicar",
    step7Title: "Quem escreve o roteiro das cenas",
    optional: "opcional",
    dropAudioTitle: "Arraste o áudio aqui",
    dropAudioSub: "ou clique para escolher · MP3, WAV, M4A...",
    titlePlaceholder: "Nome do vídeo (opcional)",
    speechLanguageLabel: "Idioma da fala",
    step2Hint: "O canal é um preset: guarda o design padrão, o público e a chamada final.",
    newChannelSummary: "+ Criar novo canal",
    channelNamePlaceholder: "Nome do canal",
    audiencePlaceholder: "Público (ex.: iniciantes em investimentos)",
    ctaPlaceholder: "Chamada final (ex.: Inscreva-se)",
    createChannelButton: "Criar canal com o design escolhido abaixo",
    step3Hint: "Comece por um tema pronto. Depois, se quiser, troque a paleta de cores e a fonte.",
    newThemeSummary: "+ Criar tema personalizado (cores + fonte)",
    themeNamePlaceholder: "Nome do tema",
    themeDescPlaceholder: "Descrição (opcional)",
    createThemeButton: "Criar tema com as cores/fonte escolhidas",
    paletteTitle: "Paleta de cores",
    paletteOptionalHint: "opcional - substitui as cores do tema",
    advancedColorSummary: "+ Editor de cores avançado (círculo cromático)",
    fontTitle: "Fonte",
    sceneDurationTitle: "Duração das cenas",
    subtitleSyncTitle: "Legenda sincronizada",
    subtitleSyncText: "Legenda de rodapé em todas as cenas (opcional — para legenda grande no centro, use o template Legenda sincronizada numa cena)",
    step5HintHtml: "Seu banco permanente de mídias. Marque as que podem aparecer neste vídeo: a IA recebe a <strong>descrição</strong> de cada uma para decidir quando usá-las.",
    addLibraryTitle: "Adicionar ao banco",
    addLibrarySub: "arraste ou clique · PNG, JPG, WEBP, SVG, MP4, WEBM, MOV",
    publishToBank: "Publicar no banco",
    publishingToBank: "Publicando...",
    publishToBankDone: (n) => `${n} mídia(s) publicada(s) no banco.`,
    fillMediaBeforePublish: "Preencha nome e descrição de todas as mídias antes de publicar.",
    advancedOptionsSummary: "Opções avançadas",
    transcriptionQualityLabel: "Qualidade da transcrição",
    roteiroExternalTitle: "Outra IA (ChatGPT, Gemini...)",
    roteiroExternalDesc: "Transcrevo o áudio, você copia o prompt, cola o roteiro que a IA devolver e eu gero o vídeo.",
    roteiroJsonDiretoTitle: "JSON direto",
    roteiroJsonDiretoDesc: "Você cola o JSON final do roteiro e eu gero o vídeo direto, sem etapa manual de copiar prompt.",
    roteiroLocalTitle: "IA local (Ollama)",
    iaFallbackLabel: "Roda no seu PC, sem custo.",
    iaUnavailableLabel: "Ollama não encontrado neste PC - se escolher, o roteiro cai em regras",
    roteiroRulesTitle: "Automático por regras",
    roteiroRulesDesc: "Sem IA: recorta a fala e escolhe o template por padrões (mais simples).",
    progressBack: "← Novo vídeo",
    progressWaitingScript: "Aguardando você colar o roteiro",
    progressFormats: (n, total) => `Formatos ${n}/${total}`,
    progressFrames: (n, total) => `Frames ${n}/${total}`,
    externalScriptTitle: "Roteiro com outra IA",
    externalScriptHint: "1) Copie o prompt (já vem com a transcrição minutada). 2) Cole no ChatGPT, Gemini ou Claude. 3) Cole aqui o JSON que a IA responder e clique em Gerar.",
    externalInstructionsTitle: "Para qual canal?",
    externalInstructionsHint: "Cada canal tem seu próprio prompt no modo Outra IA. A transcrição minutada é anexada automaticamente.",
    createPromptVersion: "Criar versão",
    promptVersionHint: "Versão personalizada do prompt completo (inicialmente igual ao que será copiado).",
    promptVersionPlaceholder: "Edite aqui uma versão quase igual ao prompt completo que será copiado.",
    localInstructionsTitle: "Para qual canal?",
    localInstructionsHint: "Cada canal tem suas regras da IA local salvas separadamente.",
    directJsonTitle: "Roteiro JSON direto",
    directJsonHint: "Cole aqui o JSON completo no formato {\"cenas\": [...]}.",
    directJsonRequired: "Cole o JSON do roteiro para usar o modo JSON direto.",
    resetInstructions: "Voltar ao padrão",
    deletePromptVersion: "Excluir versão",
    externalMediaTitle: "Mídias deste vídeo",
    attachFromLibrary: "Anexar do banco",
    externalMediaHint: "Só estas entram no prompt (com nome e descrição). Adicione antes de copiar o prompt.",
    timedTranscriptionTitle: "Transcrição minutada",
    copyTranscription: "Copiar transcrição",
    copyPromptFull: "Copiar prompt completo",
    promptPreviewSummary: "Ver o prompt que será copiado",
    returnedScriptTitle: "Roteiro devolvido pela IA (JSON)",
    returnedScriptPlaceholder: "Cole aqui a resposta da IA, começando com {\"cenas\": [ ...",
    generateWithScript: "Gerar vídeo com este roteiro",
    liveProductionTitle: "Produção ao vivo",
    libraryTitle: "Meus vídeos",
    librarySub: "Tudo que já foi gerado nesta máquina."
  },
  en: {
    navNew: "New video",
    navLibrary: "My videos",
    selDeleteTheme: "Delete selected theme",
    selDeleteChannel: "Delete selected channel",
    creating: "Uploading...",
    transcribeAudio: "Transcribe audio",
    generateVideo: "Generate video",
    askThemeName: "Please enter a theme name.",
    askChannelName: "Please enter a channel name.",
    deleteThemeConfirm: "Delete this custom theme?",
    deleteThemeSelectedConfirm: "Delete selected theme?",
    deleteMediaConfirm: (name) => `Delete \"${name}\" from library? Generated videos are not affected.`,
    mediaNamePrompt: "Media name:",
    mediaDescPrompt: "Description for AI (what appears, when to use):",
    cannotSave: "Could not save.",
    pasteReturnedScript: "Paste the script returned by the AI.",
    copied: "Copied!",
    waitingScriptStatus: (n) => `${n} transcript chunks - waiting for script`,
    appliedScriptStatus: "script applied - paste another to regenerate",
    videoLabel: "video",
    imageLabel: "image",
    noMediaInProject: "No media linked to this video - AI will not be able to use images or videos.",
    allMediaAlreadyLinked: "All library media are already linked to this video. To add new media, use the \"New video\" screen.",
    clickToAttach: "click to attach",
    cannotAttach: "Could not attach.",
    waitingPasteScript: " - waiting for you to paste the script",
    somethingWentWrong: "Something went wrong.",
    tryAgain: "Try again",
    downloadMp4: "Download MP4",
    downloadMp3: "Download MP3",
    modeLocalIA: (modelo) => `Local AI - ${modelo || ""}`,
    modeExternalIA: "External AI script",
    modeRules: "Rules-based script",
    modeFixed: "Fixed template",
    readingTranscript: " - reading transcript...",
    avThinking: "The AI is reading the full narration, splitting ideas and deciding what appears in each scene.",
    avDone: (n) => `${n} scenes. Spoken text is not shown on screen: each scene uses what the AI wrote for it.`,
    rendering: "rendering...",
    renderToSee: "render to preview",
    edit: "Edit",
    originalSpeech: "Original speech",
    oneEditedScene: "1 edited scene",
    manyEditedScenes: (n) => `${n} edited scenes`,
    removeSceneConfirm: "Remove this scene? Its audio segment will be merged into a neighboring scene.",
    deleteProjectConfirm: "Are you sure you want to delete this project?",
    deleteChannelConfirm: "Delete selected channel?",
    cannotDeleteProject: "Could not delete project.",
    cannotDeleteChannel: "Could not delete channel.",
    noVideosYet: "No videos yet. Create your first one in \"New video\".",
    ready: "Ready",
    generating: "Generating...",
    error: "Error",
    noVideo: "No video",
    optionFromTheme: "From theme",
    optionAuto: "Detect automatically",
    optionPortuguese: "Portuguese",
    optionEnglish: "English",
    optionSpanish: "Spanish",
    optionFrench: "French",
    optionItalian: "Italian",
    optionGerman: "German",
    optionJapanese: "Japanese",
    toneDirect: "Direct tone",
    toneCasual: "Casual tone",
    toneFormal: "Formal tone",
    toneInspirational: "Inspirational tone",
    qualityFast: "Fast (tiny)",
    qualityGood: "Good (base)",
    qualityGreat: "Great (small) - recommended",
    qualityMax: "Maximum (medium, slower)",
    cannotDeleteTheme: "Could not delete theme.",
    cannotDelete: "Could not delete.",
    emptyBank: "Library is empty. Add your first image or video below.",
    promptMediaName: "Name",
    promptMediaDesc: "Description for AI: what appears, when to use (required)",
    remove: "Remove",
    deleteThemeTitle: "Delete theme",
    deleteProjectTitle: "Delete project",
    removeFromVideoTitle: "Remove from this video",
    heroTitle: "Turn your narration into video",
    heroSub: "Upload audio, choose the visual style and get a finished video. No timeline, no editor.",
    step1Title: "Narration audio",
    step2Title: "Which channel?",
    step3Title: "Design",
    step4Title: "Editing pace",
    step5Title: "Images and videos",
    step6Title: "Publishing formats",
    step7Title: "Who writes scene scripts",
    optional: "optional",
    dropAudioTitle: "Drop audio here",
    dropAudioSub: "or click to choose · MP3, WAV, M4A...",
    titlePlaceholder: "Video name (optional)",
    speechLanguageLabel: "Spoken language",
    step2Hint: "A channel is a preset: it stores default design, audience and final call-to-action.",
    newChannelSummary: "+ Create new channel",
    channelNamePlaceholder: "Channel name",
    audiencePlaceholder: "Audience (e.g. investment beginners)",
    ctaPlaceholder: "Final call-to-action (e.g. Subscribe)",
    createChannelButton: "Create channel using selected design below",
    step3Hint: "Start with a ready theme. Then, if you want, change color palette and font.",
    newThemeSummary: "+ Create custom theme (colors + font)",
    themeNamePlaceholder: "Theme name",
    themeDescPlaceholder: "Description (optional)",
    createThemeButton: "Create theme with selected colors/font",
    paletteTitle: "Color palette",
    paletteOptionalHint: "optional - overrides theme colors",
    advancedColorSummary: "+ Advanced color editor (color wheel)",
    fontTitle: "Font",
    sceneDurationTitle: "Scene duration",
    subtitleSyncTitle: "Synchronized subtitles",
    subtitleSyncText: "Footer captions on every scene (optional — for a big centered caption, use the Synced Caption template on a scene)",
    step5HintHtml: "Your permanent media library. Select what can appear in this video: AI receives each media <strong>description</strong> to decide when to use it.",
    addLibraryTitle: "Add to library",
    addLibrarySub: "drag or click · PNG, JPG, WEBP, SVG, MP4, WEBM, MOV",
    publishToBank: "Publish to library",
    publishingToBank: "Publishing...",
    publishToBankDone: (n) => `${n} media item(s) published to library.`,
    fillMediaBeforePublish: "Fill in name and description for all media before publishing.",
    advancedOptionsSummary: "Advanced options",
    transcriptionQualityLabel: "Transcription quality",
    roteiroExternalTitle: "External AI (ChatGPT, Gemini...)",
    roteiroExternalDesc: "I transcribe audio, you copy the prompt, paste the AI response script, and I generate the video.",
    roteiroJsonDiretoTitle: "Direct JSON",
    roteiroJsonDiretoDesc: "Paste the final script JSON and I generate the video directly, without the manual prompt-copy step.",
    roteiroLocalTitle: "Local AI (Ollama)",
    iaFallbackLabel: "Runs on your PC, no cost.",
    iaUnavailableLabel: "Ollama not found on this PC - if selected, script falls back to rules",
    roteiroRulesTitle: "Rules-based",
    roteiroRulesDesc: "No AI: split speech and choose template from patterns (simpler).",
    progressBack: "← New video",
    progressWaitingScript: "Waiting for you to paste the script",
    progressFormats: (n, total) => `Formats ${n}/${total}`,
    progressFrames: (n, total) => `Frames ${n}/${total}`,
    externalScriptTitle: "Script with external AI",
    externalScriptHint: "1) Copy prompt (already includes timestamped transcript). 2) Paste into ChatGPT, Gemini or Claude. 3) Paste returned JSON here and click Generate.",
    externalInstructionsTitle: "Which channel?",
    externalInstructionsHint: "Each channel has its own prompt in External AI mode. The timestamped transcript is appended automatically.",
    createPromptVersion: "Create version",
    promptVersionHint: "Custom full-prompt version (initially identical to what will be copied).",
    promptVersionPlaceholder: "Edit here a version very close to the full prompt that will be copied.",
    localInstructionsTitle: "Which channel?",
    localInstructionsHint: "Each channel keeps separate Local AI rules.",
    directJsonTitle: "Direct JSON script",
    directJsonHint: "Paste the full JSON in the format {\"cenas\": [...]}.",
    directJsonRequired: "Paste the script JSON to use direct JSON mode.",
    resetInstructions: "Reset to default",
    deletePromptVersion: "Delete version",
    externalMediaTitle: "Media in this video",
    attachFromLibrary: "Attach from library",
    externalMediaHint: "Only these go into the prompt (name and description). Add them before copying the prompt.",
    timedTranscriptionTitle: "Timestamped transcription",
    copyTranscription: "Copy transcription",
    copyPromptFull: "Copy full prompt",
    promptPreviewSummary: "See copied prompt",
    returnedScriptTitle: "Script returned by AI (JSON)",
    returnedScriptPlaceholder: "Paste AI response here, starting with {\"cenas\": [ ...",
    generateWithScript: "Generate video with this script",
    liveProductionTitle: "Live production",
    libraryTitle: "My videos",
    librarySub: "Everything generated on this machine."
  },
  es: {
    navNew: "Nuevo video",
    navLibrary: "Mis videos",
    selDeleteTheme: "Eliminar tema seleccionado",
    selDeleteChannel: "Eliminar canal seleccionado",
    creating: "Subiendo...",
    transcribeAudio: "Transcribir audio",
    generateVideo: "Generar video",
    askThemeName: "Escribe un nombre para el tema.",
    askChannelName: "Escribe un nombre para el canal.",
    deleteThemeConfirm: "Eliminar este tema personalizado?",
    deleteThemeSelectedConfirm: "Eliminar el tema seleccionado?",
    deleteMediaConfirm: (name) => `Eliminar \"${name}\" de la biblioteca? Los videos generados no se ven afectados.`,
    mediaNamePrompt: "Nombre del medio:",
    mediaDescPrompt: "Descripcion para IA (que aparece, cuando usar):",
    cannotSave: "No se pudo guardar.",
    pasteReturnedScript: "Pega el guion devuelto por la IA.",
    copied: "Copiado!",
    waitingScriptStatus: (n) => `${n} fragmentos transcritos - esperando guion`,
    appliedScriptStatus: "guion aplicado - pega otro para regenerar",
    videoLabel: "video",
    imageLabel: "imagen",
    noMediaInProject: "No hay medios en este video - la IA no podra usar imagenes o videos.",
    allMediaAlreadyLinked: "Todos los medios de la biblioteca ya estan en este video. Para agregar nuevos, usa la pantalla \"Nuevo video\".",
    clickToAttach: "clic para adjuntar",
    cannotAttach: "No se pudo adjuntar.",
    waitingPasteScript: " - esperando que pegues el guion",
    somethingWentWrong: "Algo salio mal.",
    tryAgain: "Intentar de nuevo",
    downloadMp4: "Descargar MP4",
    downloadMp3: "Descargar MP3",
    modeLocalIA: (modelo) => `IA local - ${modelo || ""}`,
    modeExternalIA: "Guion de otra IA",
    modeRules: "Guion por reglas",
    modeFixed: "Plantilla fija",
    readingTranscript: " - leyendo transcripcion...",
    avThinking: "La IA esta leyendo toda la narracion, separando ideas y decidiendo que aparece en cada escena.",
    avDone: (n) => `${n} escenas. El texto hablado no aparece en pantalla: cada escena muestra lo que escribio la IA.`,
    rendering: "renderizando...",
    renderToSee: "renderiza para ver",
    edit: "Editar",
    originalSpeech: "Habla original",
    oneEditedScene: "1 escena editada",
    manyEditedScenes: (n) => `${n} escenas editadas`,
    removeSceneConfirm: "Eliminar esta escena? Su audio se unira a una escena vecina.",
    deleteProjectConfirm: "Seguro que deseas eliminar este proyecto?",
    deleteChannelConfirm: "Eliminar el canal seleccionado?",
    cannotDeleteProject: "No se pudo eliminar el proyecto.",
    cannotDeleteChannel: "No se pudo eliminar el canal.",
    noVideosYet: "Aun no hay videos. Crea el primero en \"Nuevo video\".",
    ready: "Listo",
    generating: "Generando...",
    error: "Error",
    noVideo: "Sin video",
    optionFromTheme: "Del tema",
    optionAuto: "Detectar automaticamente",
    optionPortuguese: "Portugues",
    optionEnglish: "Ingles",
    optionSpanish: "Espanol",
    optionFrench: "Frances",
    optionItalian: "Italiano",
    optionGerman: "Aleman",
    optionJapanese: "Japones",
    toneDirect: "Tono directo",
    toneCasual: "Tono casual",
    toneFormal: "Tono formal",
    toneInspirational: "Tono inspirador",
    qualityFast: "Rapida (tiny)",
    qualityGood: "Buena (base)",
    qualityGreat: "Excelente (small) - recomendado",
    qualityMax: "Maxima (medium, mas lenta)",
    cannotDeleteTheme: "No se pudo eliminar el tema.",
    cannotDelete: "No se pudo eliminar.",
    emptyBank: "La biblioteca esta vacia. Agrega la primera imagen o video abajo.",
    promptMediaName: "Nombre",
    promptMediaDesc: "Descripcion para IA: que aparece, cuando usar (obligatorio)",
    remove: "Eliminar",
    deleteThemeTitle: "Eliminar tema",
    deleteProjectTitle: "Eliminar proyecto",
    removeFromVideoTitle: "Quitar de este video",
    heroTitle: "Convierte tu narracion en video",
    heroSub: "Sube el audio, elige el estilo visual y recibe el video listo. Sin timeline, sin editor.",
    step1Title: "Audio de narracion",
    step2Title: "Para que canal?",
    step3Title: "Diseno",
    step4Title: "Ritmo de edicion",
    step5Title: "Imagenes y videos",
    step6Title: "Donde publicar",
    step7Title: "Quien escribe el guion de escenas",
    optional: "opcional",
    dropAudioTitle: "Arrastra el audio aqui",
    dropAudioSub: "o haz clic para elegir · MP3, WAV, M4A...",
    titlePlaceholder: "Nombre del video (opcional)",
    speechLanguageLabel: "Idioma hablado",
    step2Hint: "Un canal es un preset: guarda diseno por defecto, publico y llamada final.",
    newChannelSummary: "+ Crear nuevo canal",
    channelNamePlaceholder: "Nombre del canal",
    audiencePlaceholder: "Publico (ej.: principiantes en inversiones)",
    ctaPlaceholder: "Llamada final (ej.: Suscribete)",
    createChannelButton: "Crear canal con el diseno elegido abajo",
    step3Hint: "Empieza por un tema listo. Luego, si quieres, cambia paleta de colores y fuente.",
    newThemeSummary: "+ Crear tema personalizado (colores + fuente)",
    themeNamePlaceholder: "Nombre del tema",
    themeDescPlaceholder: "Descripcion (opcional)",
    createThemeButton: "Crear tema con colores/fuente elegidos",
    paletteTitle: "Paleta de colores",
    paletteOptionalHint: "opcional - reemplaza los colores del tema",
    advancedColorSummary: "+ Editor avanzado de color (circulo cromatico)",
    fontTitle: "Fuente",
    sceneDurationTitle: "Duracion de escenas",
    subtitleSyncTitle: "Subtítulos sincronizados",
    subtitleSyncText: "Subtítulo de pie en todas las escenas (opcional — para subtítulo grande al centro, usa la plantilla Subtítulo sincronizado en una escena)",
    step5HintHtml: "Tu biblioteca permanente de medios. Marca lo que puede aparecer en este video: la IA recibe la <strong>descripcion</strong> de cada medio para decidir cuando usarlo.",
    addLibraryTitle: "Agregar a la biblioteca",
    addLibrarySub: "arrastra o haz clic · PNG, JPG, WEBP, SVG, MP4, WEBM, MOV",
    publishToBank: "Publicar en la biblioteca",
    publishingToBank: "Publicando...",
    publishToBankDone: (n) => `${n} medio(s) publicado(s) en la biblioteca.`,
    fillMediaBeforePublish: "Completa nombre y descripcion de todos los medios antes de publicar.",
    advancedOptionsSummary: "Opciones avanzadas",
    transcriptionQualityLabel: "Calidad de transcripcion",
    roteiroExternalTitle: "Otra IA (ChatGPT, Gemini...)",
    roteiroExternalDesc: "Transcribo el audio, copias el prompt, pegas el guion de la IA y genero el video.",
    roteiroJsonDiretoTitle: "JSON directo",
    roteiroJsonDiretoDesc: "Pegas el JSON final del guion y genero el video directamente, sin paso manual de copiar prompt.",
    roteiroLocalTitle: "IA local (Ollama)",
    iaFallbackLabel: "Se ejecuta en tu PC, sin costo.",
    iaUnavailableLabel: "Ollama no encontrado en este PC - si se elige, el guion cae en reglas",
    roteiroRulesTitle: "Automatico por reglas",
    roteiroRulesDesc: "Sin IA: recorta el habla y elige la plantilla por patrones (mas simple).",
    progressBack: "← Nuevo video",
    progressWaitingScript: "Esperando que pegues el guion",
    progressFormats: (n, total) => `Formatos ${n}/${total}`,
    progressFrames: (n, total) => `Fotogramas ${n}/${total}`,
    externalScriptTitle: "Guion con otra IA",
    externalScriptHint: "1) Copia el prompt (ya incluye transcripcion con tiempos). 2) Pegalo en ChatGPT, Gemini o Claude. 3) Pega aqui el JSON de respuesta y haz clic en Generar.",
    externalInstructionsTitle: "¿Para qué canal?",
    externalInstructionsHint: "Cada canal tiene su propio prompt en el modo Otra IA. La transcripcion con tiempos se agrega automaticamente.",
    createPromptVersion: "Crear versión",
    promptVersionHint: "Versión personalizada del prompt completo (inicialmente igual a lo que se copiará).",
    promptVersionPlaceholder: "Edita aquí una versión muy parecida al prompt completo que se copiará.",
    localInstructionsTitle: "¿Para qué canal?",
    localInstructionsHint: "Cada canal guarda reglas separadas para la IA local.",
    directJsonTitle: "Guion JSON directo",
    directJsonHint: "Pega aqui el JSON completo en el formato {\"cenas\": [...]}.",
    directJsonRequired: "Pega el JSON del guion para usar el modo JSON directo.",
    resetInstructions: "Volver al predeterminado",
    deletePromptVersion: "Eliminar versión",
    externalMediaTitle: "Medios de este video",
    attachFromLibrary: "Adjuntar desde biblioteca",
    externalMediaHint: "Solo estos entran en el prompt (nombre y descripcion). Agregalos antes de copiar el prompt.",
    timedTranscriptionTitle: "Transcripcion con tiempos",
    copyTranscription: "Copiar transcripcion",
    copyPromptFull: "Copiar prompt completo",
    promptPreviewSummary: "Ver prompt que se copiara",
    returnedScriptTitle: "Guion devuelto por la IA (JSON)",
    returnedScriptPlaceholder: "Pega aqui la respuesta de la IA, empezando con {\"cenas\": [ ...",
    generateWithScript: "Generar video con este guion",
    liveProductionTitle: "Produccion en vivo",
    libraryTitle: "Mis videos",
    librarySub: "Todo lo generado en esta maquina."
  }
};

function linguaUI() {
  const raw = localStorage.getItem("ui_lang") || "pt";
  return I18N[raw] ? raw : "pt";
}
function t(chave, ...args) {
  const dic = I18N[linguaUI()] || I18N.pt;
  const base = I18N.pt;
  const v = dic[chave] ?? base[chave] ?? chave;
  return typeof v === "function" ? v(...args) : v;
}

function msgErroApi(payload, fallback = "Erro inesperado.") {
  const paraTexto = (valor) => {
    if (valor == null) return "";
    if (typeof valor === "string") return valor;
    if (typeof valor === "number" || typeof valor === "boolean") return String(valor);
    if (Array.isArray(valor)) return valor.map(paraTexto).filter(Boolean).join(" | ");
    if (typeof valor === "object") {
      if (Array.isArray(valor.loc) && typeof valor.msg === "string") {
        return `${valor.loc.join(".")}: ${valor.msg}`;
      }
      if (typeof valor.message === "string") return valor.message;
      if (typeof valor.msg === "string") return valor.msg;
      if ("detail" in valor) return paraTexto(valor.detail);
      try { return JSON.stringify(valor); }
      catch { return String(valor); }
    }
    return "";
  };
  const texto = paraTexto(payload).trim();
  return texto || fallback;
}

const TEMA_I18N = {
  tema_claro_minimal: {
    en: { nome: "Minimal Light", descricao: "Clean and light visual style" },
    es: { nome: "Claro Minimalista", descricao: "Estilo visual limpio y claro" }
  },
  tema_editorial: {
    en: { nome: "Editorial", descricao: "Magazine-like visual composition" },
    es: { nome: "Editorial", descricao: "Composición visual tipo revista" }
  },
  tema_escuro_dourado: {
    en: { nome: "Dark Gold", descricao: "Dark base with premium highlights" },
    es: { nome: "Oscuro Dorado", descricao: "Base oscura con destaques premium" }
  },
  tema_neon_tech: {
    en: { nome: "Neon Tech", descricao: "High-contrast tech look" },
    es: { nome: "Neón Tech", descricao: "Estilo tecnológico de alto contraste" }
  }
};

const RITMO_I18N = {
  rapido: {
    pt: { nome: "Rápido", descricao: "Cenas curtas e dinâmicas (1-4s)" },
    en: { nome: "Fast", descricao: "Short, dynamic scenes (1-4s)" },
    es: { nome: "Rápido", descricao: "Escenas cortas y dinámicas (1-4s)" }
  },
  medio: {
    pt: { nome: "Médio", descricao: "Ritmo balanceado (1.5-8s)" },
    en: { nome: "Balanced", descricao: "Balanced pace (1.5-8s)" },
    es: { nome: "Medio", descricao: "Ritmo equilibrado (1.5-8s)" }
  },
  lento: {
    pt: { nome: "Lento", descricao: "Cenas longas para absorver (2-10s)" },
    en: { nome: "Slow", descricao: "Longer scenes for absorption (2-10s)" },
    es: { nome: "Lento", descricao: "Escenas largas para asimilar (2-10s)" }
  }
};

function semEmoji(s) {
  return String(s || "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function temaTraduzido(tema) {
  const lang = linguaUI();
  if (lang === "pt") return { nome: tema?.nome || "", descricao: tema?.descricao || "" };
  const m = TEMA_I18N[tema?.id]?.[lang];
  if (m) return m;
  return { nome: tema?.nome || "", descricao: tema?.descricao || "" };
}

function ritmoTraduzido(r) {
  const lang = linguaUI();
  const m = RITMO_I18N[r?.id]?.[lang] || RITMO_I18N[r?.id]?.pt;
  if (m) return { nome: semEmoji(m.nome), descricao: m.descricao };
  return { nome: semEmoji(r?.nome), descricao: r?.descricao || "" };
}

function renderTemasERitmos() {
  if (!estado?.opcoes) return;
  const temas = estado.opcoes.temas || [];
  const ritmos = estado.opcoes.ritmos_edicao || [];

  const temasEl = $("#temas");
  if (temasEl) {
    temasEl.innerHTML = temas.map((tema) => {
      const txtTema = temaTraduzido(tema);
      const c = tema.cores, f = tema.tipografia?.fonte_titulo || {};
      return `<button type="button" class="card" data-id="${tema.id}">
        <div class="previa" style="background:${c.fundo};color:${c.texto};font-family:${f.familia || "Inter"};font-weight:${f.peso || 800}">
          <span>A Selic <em style="color:${c.destaque}">define</em> tudo</span>
        </div>
        <div class="info"><strong>${txtTema.nome}</strong><small>${txtTema.descricao}</small></div>
        <button type="button" class="tema-del" data-del-tema="${tema.id}" title="${t("deleteThemeTitle")}">×</button>
      </button>`;
    }).join("");
  }

  const ritmosEl = $("#ritmos-edicao");
  if (ritmosEl) {
    ritmosEl.innerHTML = ritmos.map((r) => {
      const rr = ritmoTraduzido(r);
      return `
      <button type="button" class="card ${r.id === estado.ritmo_edicao ? "sel" : ""}" data-id="${r.id}">
        <div class="info"><strong>${rr.nome}</strong><small>${rr.descricao}</small></div>
      </button>`;
    }).join("");
  }
}
function aplicarIdiomaUI() {
  const lang = linguaUI();
  document.documentElement.lang = lang === "pt" ? "pt-BR" : lang;
  const s = $("#ui-lang");
  if (s) s.value = lang;
  const nav = $$("header .link");
  if (nav[0]) nav[0].textContent = t("navNew");
  if (nav[1]) nav[1].textContent = t("navLibrary");
  const temaDel = $("#tema-excluir");
  if (temaDel) temaDel.textContent = t("selDeleteTheme");
  const canalDel = $("#canal-excluir");
  if (canalDel) canalDel.textContent = t("selDeleteChannel");
  const gerar = $("#gerar");
  if (gerar) gerar.textContent = estado?.roteiroModo === "externo" ? t("transcribeAudio") : t("generateVideo");

  const setText = (sel, key) => { const el = $(sel); if (el) el.textContent = t(key); };
  const setPlaceholder = (sel, key) => { const el = $(sel); if (el) el.placeholder = t(key); };
  const setHTML = (sel, key) => { const el = $(sel); if (el) el.innerHTML = t(key); };

  setText("#tela-novo h1", "heroTitle");
  setText("#tela-novo > .sub", "heroSub");
  setText(".drop-vazio strong", "dropAudioTitle");
  setText(".drop-vazio span", "dropAudioSub");
  setPlaceholder("#titulo", "titlePlaceholder");

  const passos = $$(".passo-cab h2");
  if (passos[0]) passos[0].textContent = t("step1Title");
  if (passos[1]) passos[1].textContent = t("step2Title");
  if (passos[2]) passos[2].textContent = t("step3Title");
  if (passos[3]) passos[3].textContent = t("step4Title");
  if (passos[4]) passos[4].innerHTML = `${t("step5Title")} <small>(${t("optional")})</small>`;
  if (passos[5]) passos[5].textContent = t("step6Title");
  if (passos[6]) passos[6].textContent = t("step7Title");

  const idiomaWrap = $(".idioma");
  if (idiomaWrap && idiomaWrap.firstChild && idiomaWrap.firstChild.nodeType === 3) {
    idiomaWrap.firstChild.nodeValue = `${t("speechLanguageLabel")} `;
  }

  setText("#tela-novo .passo:nth-of-type(2) .dica", "step2Hint");
  setText("#novo-canal summary", "newChannelSummary");
  setPlaceholder("#nc-nome", "channelNamePlaceholder");
  setPlaceholder("#nc-publico", "audiencePlaceholder");
  setPlaceholder("#nc-cta", "ctaPlaceholder");
  setText("#nc-criar", "createChannelButton");

  setText("#tela-novo .passo:nth-of-type(3) .dica", "step3Hint");
  setText("#novo-tema-box summary", "newThemeSummary");
  setPlaceholder("#nt-nome", "themeNamePlaceholder");
  setPlaceholder("#nt-descricao", "themeDescPlaceholder");
  setText("#nt-criar", "createThemeButton");

  const subHs = $$(".sub-h");
  if (subHs[0]) subHs[0].innerHTML = `${t("paletteTitle")} <small>(${t("paletteOptionalHint")})</small>`;
  if (subHs[1]) subHs[1].innerHTML = `${t("fontTitle")} <small>(${t("optional")})</small>`;
  if (subHs[2]) subHs[2].textContent = t("sceneDurationTitle");
  setText("#legenda-sync-titulo", "subtitleSyncTitle");
  setText("#legenda-sync-texto", "subtitleSyncText");

  setText("#detalhes-cores summary", "advancedColorSummary");
  setHTML("#tela-novo .passo:nth-of-type(5) .dica", "step5HintHtml");
  setText(".drop-img strong", "addLibraryTitle");
  setText(".drop-img span", "addLibrarySub");
  setText("#midias-publicar-banco", "publishToBank");
  setText("#tela-novo .passo:nth-of-type(6) details summary", "advancedOptionsSummary");

  const qLabel = $("#modelo")?.parentElement;
  if (qLabel && qLabel.firstChild && qLabel.firstChild.nodeType === 3) qLabel.firstChild.nodeValue = `${t("transcriptionQualityLabel")} `;

  const roteiroCards = $$("#roteiro-modos .card");
  if (roteiroCards[0]) {
    const st = $("strong", roteiroCards[0]);
    const sm = $("small", roteiroCards[0]);
    if (st) st.textContent = t("roteiroExternalTitle");
    if (sm) sm.textContent = t("roteiroExternalDesc");
  }
  if (roteiroCards[1]) {
    const st = $("strong", roteiroCards[1]);
    const sm = $("small", roteiroCards[1]);
    if (st) st.textContent = t("roteiroJsonDiretoTitle");
    if (sm) sm.textContent = t("roteiroJsonDiretoDesc");
  }
  if (roteiroCards[2]) {
    const st = $("strong", roteiroCards[2]);
    if (st) st.textContent = t("roteiroLocalTitle");
  }
  if (roteiroCards[3]) {
    const st = $("strong", roteiroCards[3]);
    const sm = $("small", roteiroCards[3]);
    if (st) st.textContent = t("roteiroRulesTitle");
    if (sm) sm.textContent = t("roteiroRulesDesc");
  }

  setText(".voltar", "progressBack");
  setText("#externo .av-cab h2", "externalScriptTitle");
  setText("#ao-vivo .av-cab h2", "liveProductionTitle");
  setText("#externo > p.dica", "externalScriptHint");
  setText("#ext-media-title", "externalMediaTitle");
  setText("#novo-ext-instrucoes-title", "externalInstructionsTitle");
  setText("#novo-ext-instrucoes-dica", "externalInstructionsHint");
  setText("#novo-ext-criar-versao", "createPromptVersion");
  setText("#novo-ext-excluir-versao", "deletePromptVersion");
  setText("#novo-ext-versao-dica", "promptVersionHint");
  setPlaceholder("#novo-ext-versao", "promptVersionPlaceholder");
  setText("#novo-ia-instrucoes-title", "localInstructionsTitle");
  setText("#novo-ia-instrucoes-dica", "localInstructionsHint");
  setText("#novo-json-direto-title", "directJsonTitle");
  setText("#novo-json-direto-dica", "directJsonHint");
  setText("#novo-ext-reset-instrucoes", "resetInstructions");
  setText("#novo-ia-reset-instrucoes", "resetInstructions");
  setText("#ext-transcricao-title", "timedTranscriptionTitle");
  setText("#ext-retorno-title", "returnedScriptTitle");
  setText("#ext-anexar", "attachFromLibrary");
  setText("#externo .ext-midias .dica", "externalMediaHint");
  setText("#ext-copiar-transcricao", "copyTranscription");
  setText("#ext-copiar-prompt", "copyPromptFull");
  setText("#externo details.avancado summary", "promptPreviewSummary");
  setPlaceholder("#ext-roteiro", "returnedScriptPlaceholder");
  setText("#ext-gerar", "generateWithScript");

  setText("#tela-biblioteca h1", "libraryTitle");
  setText("#tela-biblioteca .sub", "librarySub");

  const idioma = $("#idioma");
  if (idioma) {
    const labels = {
      pt: "optionPortuguese",
      en: "optionEnglish",
      es: "optionSpanish",
      fr: "optionFrench",
      it: "optionItalian",
      de: "optionGerman",
      ja: "optionJapanese",
      auto: "optionAuto"
    };
    [...idioma.options].forEach((o) => {
      const k = labels[o.value];
      if (k) o.textContent = t(k);
    });
  }

  const tom = $("#nc-tom");
  if (tom) {
    const labels = {
      "direto": "toneDirect",
      "descontraído": "toneCasual",
      "formal": "toneFormal",
      "inspirador": "toneInspirational"
    };
    [...tom.options].forEach((o) => {
      const k = labels[o.value];
      if (k) o.textContent = t(k);
    });
  }

  const modelo = $("#modelo");
  if (modelo) {
    const labels = { tiny: "qualityFast", base: "qualityGood", small: "qualityGreat", medium: "qualityMax" };
    [...modelo.options].forEach((o) => {
      const k = labels[o.value];
      if (k) o.textContent = t(k);
    });
  }

  atualizarTitulosPromptPorCanal();
}

function atualizarTitulosPromptPorCanal() {
  const canal = estado?.opcoes?.canais?.find((x) => x.id === estado?.canal);
  const nomeCanal = String(canal?.nome || "").trim();
  const sufixo = nomeCanal ? ` (${nomeCanal})` : "";
  const tExt = $("#novo-ext-instrucoes-title");
  const tIa = $("#novo-ia-instrucoes-title");
  if (tExt) tExt.textContent = `${t("externalInstructionsTitle")}${sufixo}`;
  if (tIa) tIa.textContent = `${t("localInstructionsTitle")}${sufixo}`;
}

function atualizarEstadoVersaoPrompt() {
  const btnExcluir = $("#novo-ext-excluir-versao");
  const elVersao = $("#novo-ext-versao");
  const ativa = !!(elVersao && !elVersao.hidden);
  if (btnExcluir) btnExcluir.disabled = !ativa;
}

const estado = { audio: null, canal: null, tema: null, estilo: null, paleta: null, fonte: null,
  banco: [], midiasSel: new Set(), midiasNovas: [], formatos: new Set(["16x9"]), opcoes: null, poll: null, roteiroModo: "externo", ritmo_edicao: "medio", legendas_ativas: false,
  extInstrucoesPadrao: "", iaInstrucoesPadrao: "", extPromptSufixo: "", extPromptPrefixo: "", extPromptPosInstrucoes: "", extPromptBaseAtual: "", extPromptVersaoEditada: false, atualizandoProjeto: false, cenasSelecionadas: new Set(), fundosPlano: [], fundoPlanoProjetoId: null, fundoCamadasEditor: [], formatoAtual: "16x9", filaSelecionados: new Set() };

$("#ui-lang")?.addEventListener("change", () => {
  localStorage.setItem("ui_lang", $("#ui-lang").value);
  aplicarIdiomaUI();
  if (estado.opcoes) {
    renderTemasERitmos();
    renderCanais();
    renderBanco();
    renderMidiasNovas();
    carregarBiblioteca();
    const ia = estado.opcoes.ia;
    if (ia) {
      if (!ia.disponivel) { $("#ia-rotulo").textContent = t("iaUnavailableLabel"); }
      else $("#ia-rotulo").textContent = `${t("iaFallbackLabel")} (${ia.modelo})`;
    }
  }
});
aplicarIdiomaUI();

// ---------- navegação ----------
function mostrar(tela) {
  $$(".tela").forEach((t) => (t.hidden = t.id !== `tela-${tela}`));
  $$(".link").forEach((l) => l.classList.toggle("ativo", l.dataset.tela === tela));
  if (tela !== "progresso" && estado.poll) { clearInterval(estado.poll); estado.poll = null; }
  if (tela === "biblioteca") carregarBiblioteca();
  window.scrollTo({ top: 0 });
}
document.addEventListener("click", (e) => {
  const alvo = e.target.closest("[data-tela]");
  if (alvo) { e.preventDefault(); mostrar(alvo.dataset.tela); }
});

// ---------- opções (temas, estilos, formatos) ----------
async function carregarOpcoes() {
  estado.opcoes = await (await fetch("/api/opcoes")).json();
  estado.extInstrucoesPadrao = normalizarInstrucoesExternasPadrao(estado.opcoes.roteiro_externo_instrucoes_padrao || "");
  estado.iaInstrucoesPadrao = String(estado.opcoes.roteiro_ia_instrucoes_padrao || "");
  carregarBanco();
  const { temas, estilos, formatos, paletas, fontes, ia } = estado.opcoes;

  renderCanais();

  $("#paletas").innerHTML = `<button type="button" class="paleta sel" data-id=""><span class="sw auto"></span><small>${t("optionFromTheme")}</small></button>` +
    paletas.map((p) => `<button type="button" class="paleta" data-id="${p.id}" title="${p.nome}">
      <span class="sw" style="background:${p.cores.fundo}"><i style="background:${p.cores.destaque}"></i><i style="background:${p.cores.destaque_2}"></i><i style="background:${p.cores.texto}"></i></span><small>${p.nome}</small></button>`).join("");
  $("#fontes").innerHTML = `<button type="button" class="fonte sel" data-id=""><span>Aa</span><small>${t("optionFromTheme")}</small></button>` +
    fontes.map((f) => `<button type="button" class="fonte" data-id="${f.id}" style="font-family:${f.familia};font-weight:${f.peso}"><span>Aa</span><small>${f.nome}</small></button>`).join("");

  if (!ia.disponivel) { $("#ia-rotulo").textContent = t("iaUnavailableLabel"); }
  else $("#ia-rotulo").textContent = `${t("iaFallbackLabel")} (${ia.modelo})`;
  selecionarRoteiro(estado.roteiroModo);
  const legendaCheckbox = $("#legendas-ativas");
  if (legendaCheckbox) legendaCheckbox.checked = estado.legendas_ativas;

  renderTemasERitmos();

  if ($("#estilos")) {
    $("#estilos").innerHTML = estilos.map((e) => {
      const alvo = e.ritmo?.duracao_cena_alvo_s ?? 4;
      const n = Math.max(2, Math.min(8, Math.round(24 / alvo)));
      const barras = Array.from({ length: n }, (_, i) => `<span class="barra" style="width:${Math.round(120 / n) - 4}px;opacity:${0.5 + (i % 2) * 0.4}"></span>`).join("");
      return `<button type="button" class="card" data-id="${e.id}">
        <div class="previa">${barras}</div>
        <div class="info"><strong>${e.nome}</strong><small>${e.descricao}</small></div>
      </button>`;
    }).join("");
  }

  $("#formatos").innerHTML = formatos.map((f) => `
    <button type="button" class="chip ${estado.formatos.has(f.id) ? "sel" : ""}" data-id="${f.id}">
      <span class="fmt f${f.id}"></span><span>${f.nome}<small>${f.descricao}</small></span>
    </button>`).join("");

  selecionarCanal(estado.opcoes.canais[0]?.id);
}

$("#roteiro-modos").addEventListener("click", (e) => {
  const c = e.target.closest(".card");
  if (c) selecionarRoteiro(c.dataset.id);
});

$("#paletas").addEventListener("click", (e) => {
  const b = e.target.closest(".paleta");
  if (!b) return;
  estado.paleta = b.dataset.id || null;
  $$("#paletas .paleta").forEach((x) => x.classList.toggle("sel", x === b));
  amostra();
});

$("#fontes").addEventListener("click", (e) => {
  const b = e.target.closest(".fonte");
  if (!b) return;
  estado.fonte = b.dataset.id || null;
  $$("#fontes .fonte").forEach((x) => x.classList.toggle("sel", x === b));
  amostra();
});

$("#temas").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-del-tema]");
  if (b) {
    e.preventDefault();
    e.stopPropagation();
    const temaId = b.dataset.delTema;
    if (!confirm(t("deleteThemeConfirm"))) return;
    const r = await fetch(`/api/temas/${temaId}`, { method: "DELETE" });
    if (!r.ok) {
      alert(msgErroApi(await r.json().catch(() => null), t("cannotDeleteTheme")));
      return;
    }
    await carregarOpcoes();
    return;
  }
  const c = e.target.closest(".card");
  if (c) {
    selecionar("tema", c.dataset.id);
    amostra();
  }
});

if ($("#estilos")) {
  $("#estilos").addEventListener("click", (e) => {
    const c = e.target.closest(".card");
    if (c) selecionar("estilo", c.dataset.id);
  });
}

$("#ritmos-edicao").addEventListener("click", (e) => {
  const c = e.target.closest(".card");
  if (!c) return;
  estado.ritmo_edicao = c.dataset.id;
  $$("#ritmos-edicao .card").forEach((x) => x.classList.toggle("sel", x === c));
});

const legendaCheckbox = $("#legendas-ativas");
if (legendaCheckbox) {
  legendaCheckbox.addEventListener("change", () => {
    estado.legendas_ativas = Boolean(legendaCheckbox.checked);
  });
}

$("#canais").addEventListener("click", (e) => {
  const c = e.target.closest(".card");
  if (c) selecionarCanal(c.dataset.id);
});

$("#formatos").addEventListener("click", (e) => {
  const c = e.target.closest(".chip");
  if (!c) return;
  if (estado.formatos.has(c.dataset.id)) {
    if (estado.formatos.size > 1) estado.formatos.delete(c.dataset.id);
  } else {
    estado.formatos.add(c.dataset.id);
  }
  $$("#formatos .chip").forEach((x) => x.classList.toggle("sel", estado.formatos.has(x.dataset.id)));
});

$("#nt-criar").addEventListener("click", async () => {
  const nome = $("#nt-nome").value.trim();
  const descricao = $("#nt-descricao").value.trim();
  $("#nt-erro").textContent = "";
  if (!nome) {
    $("#nt-erro").textContent = t("askThemeName");
    return;
  }
  const payload = {
    nome,
    descricao,
    base_tema_id: estado.tema,
    cores: estado.overrides_cores || {},
    fonte_id: estado.fonte || null,
  };
  const r = await fetch("/api/temas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    $("#nt-erro").textContent = msgErroApi(await r.json().catch(() => null), r.statusText);
    return;
  }
  const tema = await r.json();
  await carregarOpcoes();
  selecionar("tema", tema.id);
  estado.overrides_cores = {};
  amostra();
  $("#nt-nome").value = "";
  $("#nt-descricao").value = "";
});

$("#tema-excluir").addEventListener("click", async () => {
  const temaId = estado.tema;
  if (!temaId) return;
  $("#tema-excluir-erro").textContent = "";
  if (!confirm(t("deleteThemeSelectedConfirm"))) return;
  const r = await fetch(`/api/temas/${temaId}`, { method: "DELETE" });
  if (!r.ok) {
    $("#tema-excluir-erro").textContent = msgErroApi(await r.json().catch(() => null), t("cannotDelete"));
    return;
  }
  await carregarOpcoes();
});
$("#canal-excluir").addEventListener("click", async () => {
  const canalId = estado.canal;
  if (!canalId) return;
  $("#canal-excluir-erro").textContent = "";
  if (!confirm(t("deleteChannelConfirm"))) return;
  const r = await fetch(`/api/canais/${canalId}`, { method: "DELETE" });
  if (!r.ok) {
    $("#canal-excluir-erro").textContent = msgErroApi(await r.json().catch(() => null), t("cannotDeleteChannel"));
    return;
  }
  await carregarOpcoes();
  $("#canal-excluir-erro").textContent = "";
});
function selecionar(tipo, id) {
  estado[tipo] = id;
  $$(`#${tipo}s .card`).forEach((c) => c.classList.toggle("sel", c.dataset.id === id));
  if (tipo === "tema") {
    renderEditorCores();
    const t = estado.opcoes?.temas.find((x) => x.id === id);
    $("#tema-excluir").hidden = !t;
    $("#tema-excluir-erro").textContent = "";
  }
}

function renderEditorCores() {
  const tema = estado.opcoes?.temas.find((t) => t.id === estado.tema);
  if (!tema || !tema.cores) { $("#editor-cores").innerHTML = ""; return; }
  
  const cores_editaveis = ["fundo", "texto", "destaque", "destaque_2", "positivo", "negativo", "neutro", "fundo_secundario", "texto_secundario"];
  const nomes_amigaveis = {
    "fundo": "Fundo principal",
    "fundo_secundario": "Fundo secundário",
    "texto": "Texto principal",
    "texto_secundario": "Texto secundário",
    "destaque": "Destaque 1",
    "destaque_2": "Destaque 2",
    "positivo": "Positivo (OK)",
    "negativo": "Negativo (Erro)",
    "neutro": "Neutro"
  };
  
  const cor_override = estado.overrides_cores || {};
  
  $("#editor-cores").innerHTML = cores_editaveis.map((chave) => {
    const valor = cor_override[chave] || tema.cores[chave];
    return `<div class="cor-item">
      <label>${nomes_amigaveis[chave]}</label>
      <input type="color" value="${valor}" data-cor="${chave}" class="cor-picker" />
      <div class="cor-hex">${valor}</div>
    </div>`;
  }).join("");
  
  $$(".cor-picker").forEach((input) => {
    input.addEventListener("input", (e) => {
      estado.overrides_cores = estado.overrides_cores || {};
      estado.overrides_cores[e.target.dataset.cor] = e.target.value;
      e.target.nextElementSibling.textContent = e.target.value;
      amostra();
    });
  });

}

// ---------- canais (presets) ----------
function renderCanais() {
  $("#canais").innerHTML = estado.opcoes.canais.map((c) => {
    const tema = estado.opcoes.temas.find((t) => t.id === c.tema_padrao);
    const cores = c.cores || tema?.cores || {};
    return `<button type="button" class="card" data-id="${c.id}">
      <div class="previa canal-previa" style="background:${cores.fundo || "#111"};color:${cores.texto || "#fff"}"><span style="color:${cores.destaque || "#fc4"}">${escapar(c.nome.slice(0, 1).toUpperCase())}</span></div>
      <div class="info"><strong>${escapar(c.nome)}</strong><small>${escapar(c.dna?.publico || tema?.nome || "")}</small></div>
    </button>`;
  }).join("");
}
function selecionarCanal(id) {
  const c = estado.opcoes.canais.find((x) => x.id === id);
  if (!c) return;
  estado.canal = id;
  atualizarTitulosPromptPorCanal();
  $$("#canais .card").forEach((x) => x.classList.toggle("sel", x.dataset.id === id));
  // herda o design do canal; o usuário pode trocar depois só para este vídeo
  selecionar("tema", c.tema_padrao);
  selecionar("estilo", c.estilo_padrao);
  estado.paleta = c.paleta_id || null; estado.fonte = c.fonte_id || null;
  $$("#paletas .paleta").forEach((x) => x.classList.toggle("sel", (x.dataset.id || null) === estado.paleta));
  $$("#fontes .fonte").forEach((x) => x.classList.toggle("sel", (x.dataset.id || null) === estado.fonte));
  preencherEditorInstrucoes(true);
  preencherEditorIAInstrucoes(true);
  const cSel = estado.opcoes?.canais?.find((x) => x.id === id);
  const delCanal = $("#canal-excluir");
  const errCanal = $("#canal-excluir-erro");
  if (delCanal) delCanal.disabled = !cSel || cSel.id === "canal_exemplo";
  if (errCanal) errCanal.textContent = "";
  if (estado.roteiroModo === "externo") atualizarPromptPreview();
  amostra();
}
$("#nc-criar").addEventListener("click", async () => {
  const nome = $("#nc-nome").value.trim();
  $("#nc-erro").textContent = "";
  if (!nome) { $("#nc-erro").textContent = t("askChannelName"); return; }
  const fd = new FormData();
  fd.append("nome", nome); fd.append("publico", $("#nc-publico").value); fd.append("cta", $("#nc-cta").value);
  fd.append("tom", $("#nc-tom").value); fd.append("tema_id", estado.tema); fd.append("estilo_id", estado.estilo);
  fd.append("paleta_id", estado.paleta || ""); fd.append("fonte_id", estado.fonte || "");
  const r = await fetch("/api/canais", { method: "POST", body: fd });
  if (!r.ok) { $("#nc-erro").textContent = msgErroApi(await r.json().catch(() => null), r.statusText); return; }
  const canal = await r.json();
  estado.opcoes.canais.push(canal);
  renderCanais(); selecionarCanal(canal.id);
  $("#novo-canal").open = false; $("#nc-nome").value = "";
});

// ---------- amostra do design ----------
function amostra() {
  const tema = estado.opcoes.temas.find((t) => t.id === estado.tema);
  const pal = estado.opcoes.paletas.find((p) => p.id === estado.paleta);
  const fon = estado.opcoes.fontes.find((f) => f.id === estado.fonte);
  const c = { ...(tema?.cores || {}), ...(pal?.cores || {}), ...(estado.overrides_cores || {}) };
  const ft = fon || { familia: tema?.tipografia?.fonte_titulo?.familia || "Inter", peso: tema?.tipografia?.fonte_titulo?.peso || 800 };
  const el = $("#amostra");
  el.style.background = c.fundo; el.style.color = c.texto; el.style.fontFamily = ft.familia; el.style.fontWeight = ft.peso;
  $("em", el).style.color = c.destaque; $(".am-num", el).style.color = c.destaque_2;
}

// ---------- banco de imagens e vídeos ----------
const inputMid = $("#midias"), dropMid = $(".drop-img");
["dragenter", "dragover"].forEach((ev) => dropMid.addEventListener(ev, (e) => { e.preventDefault(); dropMid.classList.add("sobre"); }));
["dragleave", "drop"].forEach((ev) => dropMid.addEventListener(ev, (e) => { e.preventDefault(); dropMid.classList.remove("sobre"); }));
dropMid.addEventListener("drop", (e) => addMidias(e.dataTransfer.files));
inputMid.addEventListener("change", () => { addMidias(inputMid.files); inputMid.value = ""; });
const EXT_MIDIA = /\.(png|jpe?g|webp|gif|svg|mp4|webm|mov)$/i;
function addMidias(files) {
  for (const f of files) if (EXT_MIDIA.test(f.name))
    estado.midiasNovas.push({ file: f, url: URL.createObjectURL(f), video: /\.(mp4|webm|mov)$/i.test(f.name),
      nome: f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "), descricao: "" });
  renderMidiasNovas();
}
function atualizarBotaoPublicarMidias() {
  const btn = $("#midias-publicar-banco");
  if (!btn) return;
  btn.disabled = estado.midiasNovas.length === 0;
}
function renderMidiasNovas() {
  $("#lista-midias").innerHTML = estado.midiasNovas.map((m, i) => `
    <div class="img-item nova">
      ${m.video ? `<video src="${m.url}" muted></video>` : `<img src="${m.url}" alt="" />`}
      <div class="mid-campos">
        <input type="text" class="campo" data-i="${i}" data-k="nome" value="${escapar(m.nome)}" placeholder="${t("promptMediaName")}" required />
        <textarea class="campo" rows="2" data-i="${i}" data-k="descricao" placeholder="${t("promptMediaDesc")}">${escapar(m.descricao)}</textarea>
      </div>
      <button type="button" class="x" data-rm="${i}" title="${t("remove")}">×</button>
    </div>`).join("");
  atualizarBotaoPublicarMidias();
}
$("#lista-midias").addEventListener("input", (e) => { const { i, k } = e.target.dataset; if (i !== undefined && k) estado.midiasNovas[+i][k] = e.target.value; });
$("#lista-midias").addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (b) { estado.midiasNovas.splice(+b.dataset.rm, 1); renderMidiasNovas(); } });
$("#midias-publicar-banco")?.addEventListener("click", async () => {
  const erro = $("#midias-publicar-erro");
  if (erro) erro.textContent = "";
  if (!estado.midiasNovas.length) return;
  const invalidas = estado.midiasNovas.some((m) => !String(m.nome || "").trim() || !String(m.descricao || "").trim());
  if (invalidas) {
    if (erro) erro.textContent = t("fillMediaBeforePublish");
    return;
  }

  const btn = $("#midias-publicar-banco");
  const antes = btn?.textContent || t("publishToBank");
  if (btn) {
    btn.disabled = true;
    btn.textContent = t("publishingToBank");
  }
  try {
    const novas = [...estado.midiasNovas];
    for (const m of novas) {
      const fd = new FormData();
      fd.append("arquivo", m.file, m.file.name);
      fd.append("nome", String(m.nome || "").trim());
      fd.append("descricao", String(m.descricao || "").trim());
      const r = await fetch("/api/biblioteca", { method: "POST", body: fd });
      if (!r.ok) throw new Error(msgErroApi(await r.json().catch(() => null), r.statusText));
      const salvo = await r.json();
      if (salvo?.id) estado.midiasSel.add(salvo.id);
      const idx = estado.midiasNovas.indexOf(m);
      if (idx >= 0) {
        URL.revokeObjectURL(estado.midiasNovas[idx].url);
        estado.midiasNovas.splice(idx, 1);
      }
    }
    renderMidiasNovas();
    await carregarBanco();
    if (erro) erro.textContent = t("publishToBankDone", novas.length);
  } catch (e) {
    if (erro) erro.textContent = e.message || t("cannotSave");
  } finally {
    if (btn) btn.textContent = antes;
    atualizarBotaoPublicarMidias();
  }
});

async function carregarBanco() {
  estado.banco = await (await fetch("/api/biblioteca")).json();
  renderBanco();
}
function renderBanco() {
  const el = $("#banco");
  if (!estado.banco.length) { el.innerHTML = `<p class="dica">${t("emptyBank")}</p>`; return; }
  el.innerHTML = estado.banco.map((m) => `
    <div class="mid-card ${estado.midiasSel.has(m.id) ? "sel" : ""}" data-id="${m.id}">
      <label class="mid-thumb">
        <input type="checkbox" ${estado.midiasSel.has(m.id) ? "checked" : ""} data-sel="${m.id}" />
        ${m.tipo === "video" ? `<video src="/api/biblioteca/${m.id}/arquivo" muted preload="metadata"></video>` : `<img src="/api/biblioteca/${m.id}/arquivo" alt="" />`}
        <span class="badge">${m.tipo === "video" ? t("videoLabel") : t("imageLabel")}</span>
      </label>
      <div class="mid-info">
        <strong>${escapar(m.nome)}</strong>
        <small>${escapar(m.descricao)}</small>
        <div class="mid-acoes"><button type="button" class="mini" data-ed="${m.id}">${t("edit")}</button><button type="button" class="mini" data-del="${m.id}">${t("remove")}</button></div>
      </div>
    </div>`).join("");
}
$("#banco").addEventListener("change", (e) => {
  const id = e.target.dataset.sel; if (!id) return;
  e.target.checked ? estado.midiasSel.add(id) : estado.midiasSel.delete(id);
  e.target.closest(".mid-card").classList.toggle("sel", e.target.checked);
});
$("#banco").addEventListener("click", async (e) => {
  const del = e.target.closest("[data-del]"), ed = e.target.closest("[data-ed]");
  if (del) {
    const m = estado.banco.find((x) => x.id === del.dataset.del);
    if (!confirm(t("deleteMediaConfirm", m.nome))) return;
    await fetch(`/api/biblioteca/${m.id}`, { method: "DELETE" });
    estado.midiasSel.delete(m.id); await carregarBanco();
  } else if (ed) {
    const m = estado.banco.find((x) => x.id === ed.dataset.ed);
    const nome = prompt(t("mediaNamePrompt"), m.nome); if (nome === null) return;
    const descricao = prompt(t("mediaDescPrompt"), m.descricao); if (descricao === null) return;
    const r = await fetch(`/api/biblioteca/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome, descricao }) });
    if (!r.ok) alert(msgErroApi(await r.json().catch(() => null), t("cannotSave")));
    await carregarBanco();
  }
});

// ---------- áudio ----------
const drop = $("#drop"), inputAudio = $("#audio");
["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("sobre"); }));
["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("sobre"); }));
drop.addEventListener("drop", (e) => { const f = e.dataTransfer.files[0]; if (f) definirAudio(f); });
inputAudio.addEventListener("change", () => { if (inputAudio.files[0]) definirAudio(inputAudio.files[0]); });
$("#trocar").addEventListener("click", (e) => { e.preventDefault(); inputAudio.click(); });

function definirAudio(f) {
  estado.audio = f;
  $("#arq-nome").textContent = f.name;
  $("#arq-info").textContent = `${(f.size / 1024 / 1024).toFixed(1)} MB`;
  const a = document.createElement("audio");
  a.src = URL.createObjectURL(f);
  a.addEventListener("loadedmetadata", () => {
    const s = Math.round(a.duration), m = Math.floor(s / 60);
    $("#arq-info").textContent += ` · ${m}:${String(s % 60).padStart(2, "0")}`;
    URL.revokeObjectURL(a.src);
  });
  $(".drop-vazio").hidden = true; $(".drop-cheio").hidden = false;
  if (!$("#titulo").value) $("#titulo").value = f.name.replace(/\.[^.]+$/, "");
  $("#gerar").disabled = false;
}

// ---------- gerar ----------
$("#form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!estado.audio) return;
  const btn = $("#gerar"); btn.disabled = true; btn.textContent = t("creating"); $("#erro-form").textContent = "";
  const roteiroJsonDireto = String($("#novo-json-direto")?.value || "").trim();
  if (estado.roteiroModo === "json_direto" && !roteiroJsonDireto) {
    $("#erro-form").textContent = t("directJsonRequired");
    btn.disabled = false;
    selecionarRoteiro(estado.roteiroModo);
    return;
  }
  const fd = new FormData();
  fd.append("audio", estado.audio);
  fd.append("titulo", $("#titulo").value);
  fd.append("canal_id", estado.canal);
  fd.append("tema_id", estado.tema);
  fd.append("estilo_id", estado.estilo);
  fd.append("paleta_id", estado.paleta || "");
  fd.append("fonte_id", estado.fonte || "");
  fd.append("paleta_override", JSON.stringify(estado.overrides_cores || {}));
  fd.append("formatos", [...estado.formatos].join(","));
  fd.append("modelo", $("#modelo").value);
  fd.append("idioma", $("#idioma").value);
  fd.append("ritmo_edicao", estado.ritmo_edicao);
  fd.append("legendas_sincronizadas", estado.legendas_ativas ? "true" : "false");
  fd.append("roteiro_modo", estado.roteiroModo);
  fd.append("roteiro_json_direto", estado.roteiroModo === "json_direto" ? roteiroJsonDireto : "");
  fd.append("ia_instrucoes", estado.roteiroModo === "ia" ? instrucoesIAAtivas() : "");
  fd.append("midias_ids", [...estado.midiasSel].join(","));
  for (const m of estado.midiasNovas) fd.append("midias_novas", m.file, m.file.name);
  fd.append("midias_novas_meta", JSON.stringify(estado.midiasNovas.map((m) => ({ nome: m.nome, descricao: m.descricao }))));
  try {
    const r = await fetch("/api/projetos", { method: "POST", body: fd });
    if (!r.ok) throw new Error(msgErroApi(await r.json().catch(() => null), r.statusText));
    const { id } = await r.json();
    abrirProjeto(id);
  } catch (err) {
    $("#erro-form").textContent = err.message;
  } finally {
    btn.disabled = false; selecionarRoteiro(estado.roteiroModo);
  }
});

function selecionarRoteiro(id) {
  estado.roteiroModo = id;
  $$("#roteiro-modos .card").forEach((c) => c.classList.toggle("sel", c.dataset.id === id));
  $("#gerar").textContent = id === "externo" ? t("transcribeAudio") : t("generateVideo");
  const box = $("#novo-ext-instrucoes-box");
  if (box) box.hidden = id !== "externo";
  const boxIa = $("#novo-ia-instrucoes-box");
  if (boxIa) boxIa.hidden = id !== "ia";
  const boxJson = $("#novo-json-direto-box");
  if (boxJson) boxJson.hidden = id !== "json_direto";
  if (id === "externo") preencherEditorInstrucoes(false);
  if (id === "ia") preencherEditorIAInstrucoes(false);
}

// ---------- roteiro de outra IA ----------
async function copiar(texto, btn) {
  try { await navigator.clipboard.writeText(texto); }
  catch { const ta = document.createElement("textarea"); ta.value = texto; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
  const antes = btn.textContent; btn.textContent = t("copied"); setTimeout(() => (btn.textContent = antes), 1500);
}
function lerInstrucoesGlobais() {
  const canalKey = `${EXT_INSTRUCOES_KEY}:${String(estado.canal || "_global")}`;
  const porCanal = localStorage.getItem(canalKey);
  if (porCanal != null) return porCanal;
  return null;
}
function limparInstrucoesEditoriais(raw) {
  const txt = String(raw || "").trim();
  if (!txt) return "";
  if (/^Você é o roteirista visual/i.test(txt)) {
    return txt;
  }
  let base = txt;

  // Se veio um prompt completo antigo, extrai só o bloco editorial.
  const idxRegras = base.indexOf(EXT_REGRAS_MARCADOR);
  if (idxRegras >= 0) {
    const ini = idxRegras + EXT_REGRAS_MARCADOR.length;
    const resto = base.slice(ini);
    const idxExemplo = resto.indexOf(EXT_EXEMPLO_MARCADOR);
    base = (idxExemplo >= 0 ? resto.slice(0, idxExemplo) : resto).trim();
  }

  const idxTranscricao = base.indexOf(EXT_TRANSCRICAO_MARCADOR);
  if (idxTranscricao >= 0) base = base.slice(0, idxTranscricao).trim();

  // Remove linhas técnicas antigas que não devem ficar no editor.
  base = base
    .split("\n")
    .filter((l) => !/^\s*m[ií]dias disponíveis/i.test(l.trim()))
    .join("\n")
    .trim();

  return base;
}
function salvarInstrucoesGlobais(texto) {
  const canalKey = `${EXT_INSTRUCOES_KEY}:${String(estado.canal || "_global")}`;
  localStorage.setItem(canalKey, String(texto || ""));
}
function limparInstrucoesGlobais() {
  const canalKey = `${EXT_INSTRUCOES_KEY}:${String(estado.canal || "_global")}`;
  localStorage.removeItem(canalKey);
}
function ehInstrucoesLegadoCurtas(texto) {
  const t = String(texto || "").trim();
  if (!t) return false;
  return t.startsWith("Escreva cenas claras, curtas e com ritmo dinâmico.")
    && t.includes("Priorize linguagem simples e objetiva, sem jargão.")
    && t.includes("Dê foco nos dados mais importantes e mantenha consistência no tom do canal.");
}
function instrucoesAtivas() {
  const el = $("#novo-ext-instrucoes");
  if (el && el.value.trim()) return normalizarInstrucoesExternasPadrao(el.value);
  return normalizarInstrucoesExternasPadrao(estado.extInstrucoesPadrao || "");
}
function preencherEditorInstrucoes(seVazio = false) {
  const el = $("#novo-ext-instrucoes");
  if (!el) return;
  let forcarPadrao = false;
  const salvo = lerInstrucoesGlobais();
  if (salvo != null) {
    const limpo = normalizarInstrucoesExternasPadrao(salvo);
    if (!ehInstrucoesLegadoCurtas(limpo)) {
      if (el.value !== limpo) el.value = limpo;
      return;
    }
    limparInstrucoesGlobais();
    forcarPadrao = true;
  }
  if (forcarPadrao || !seVazio || !el.value.trim()) {
    el.value = normalizarInstrucoesExternasPadrao(estado.extInstrucoesPadrao || "");
  }
}
function lerIAInstrucoesGlobais() {
  const canalKey = `${IA_INSTRUCOES_KEY}:${String(estado.canal || "_global")}`;
  const porCanal = localStorage.getItem(canalKey);
  if (porCanal != null) return porCanal;
  return localStorage.getItem(IA_INSTRUCOES_KEY_ANTIGO);
}
function salvarIAInstrucoesGlobais(texto) {
  const canalKey = `${IA_INSTRUCOES_KEY}:${String(estado.canal || "_global")}`;
  localStorage.setItem(canalKey, texto);
}
function limparIAInstrucoesGlobais() {
  const canalKey = `${IA_INSTRUCOES_KEY}:${String(estado.canal || "_global")}`;
  localStorage.removeItem(canalKey);
}
function instrucoesIAAtivas() {
  const el = $("#novo-ia-instrucoes");
  if (el && el.value.trim()) return el.value;
  return estado.iaInstrucoesPadrao || "";
}
function preencherEditorIAInstrucoes(seVazio = false) {
  const el = $("#novo-ia-instrucoes");
  if (!el) return;
  const salvo = lerIAInstrucoesGlobais();
  if (salvo != null) {
    if (el.value !== salvo) el.value = salvo;
    return;
  }
  if (!seVazio || !el.value.trim()) {
    el.value = estado.iaInstrucoesPadrao || "";
  }
}
function separarPrompt(prompt) {
  const bruto = String(prompt || "");
  const i = bruto.indexOf(EXT_TRANSCRICAO_MARCADOR);
  if (i < 0) {
    return { instrucoes: bruto, sufixo: "", prefixo: "", posInstrucoes: "", bruto };
  }
  const cabecalho = bruto.slice(0, i);
  const sufixo = bruto.slice(i + EXT_TRANSCRICAO_MARCADOR.length);
  let idxRegras = cabecalho.indexOf(EXT_REGRAS_MARCADOR);
  if (idxRegras < 0) {
    const rxRegras = /Regras adicionais do editor[^:\n]*:/i;
    const mRegras = rxRegras.exec(cabecalho);
    if (mRegras) idxRegras = mRegras.index;
  }
  if (idxRegras < 0) {
    return { instrucoes: cabecalho.trimEnd(), sufixo, prefixo: "", posInstrucoes: "", bruto };
  }
  const fimCabecalhoRegras = cabecalho.indexOf(":", idxRegras);
  const inicioInstrucoes = fimCabecalhoRegras >= 0 ? fimCabecalhoRegras + 1 : idxRegras + EXT_REGRAS_MARCADOR.length;
  const depoisRegras = cabecalho.slice(inicioInstrucoes);
  let idxExemploRel = depoisRegras.indexOf(EXT_EXEMPLO_MARCADOR);
  if (idxExemploRel < 0) {
    const rxExemplo = /\nExemplo \(outro assunto\)/i;
    const mExemplo = rxExemplo.exec(depoisRegras);
    if (mExemplo) idxExemploRel = mExemplo.index;
  }
  if (idxExemploRel < 0) {
    return {
      instrucoes: depoisRegras.trim(),
      sufixo,
      prefixo: cabecalho.slice(0, inicioInstrucoes),
      posInstrucoes: "",
      bruto,
    };
  }
  return {
    instrucoes: depoisRegras.slice(0, idxExemploRel).trim(),
    sufixo,
    prefixo: cabecalho.slice(0, inicioInstrucoes),
    posInstrucoes: depoisRegras.slice(idxExemploRel),
    bruto,
  };
}
function promptComInstrucoes(instrucoes) {
  const textoInstrucoes = String(instrucoes || "").trim();
  if (parecePromptCompleto(textoInstrucoes) || /^Você é o roteirista visual/i.test(textoInstrucoes)) {
    const bruto = String(estado.extPromptBruto || "");
    const semTranscricao = textoInstrucoes.split(EXT_TRANSCRICAO_MARCADOR)[0].trimEnd();

    const extrairBloco = (fonte, inicioRe, fimRe) => {
      if (!fonte) return "";
      const mIni = inicioRe.exec(fonte);
      if (!mIni) return "";
      const ini = mIni.index;
      const resto = fonte.slice(ini);
      const mFim = fimRe ? fimRe.exec(resto) : null;
      const fim = mFim ? ini + mFim.index : fonte.length;
      return fonte.slice(ini, fim).trimEnd();
    };

    const blocoMidias = extrairBloco(
      bruto,
      /M[íi]dias disponíveis[^:\n]*:/i,
      /\nContexto do canal \(obrigatório\):/i,
    );
    const blocoCanal = extrairBloco(
      bruto,
      /Contexto do canal \(obrigatório\):/i,
      /\nComo alinhar o roteiro ao canal:/i,
    );

    let corpo = semTranscricao;

    if (blocoMidias) {
      const rxMidias = /M[íi]dias disponíveis[^:\n]*:[\s\S]*?(?=\nContexto do canal \(obrigatório\):)/i;
      if (rxMidias.test(corpo)) {
        corpo = corpo.replace(rxMidias, `${blocoMidias}\n`);
      } else if (/Contexto do canal \(obrigatório\):/i.test(corpo)) {
        corpo = corpo.replace(/Contexto do canal \(obrigatório\):/i, `${blocoMidias}\n\nContexto do canal (obrigatório):`);
      }
    }

    if (blocoCanal) {
      const rxCanal = /Contexto do canal \(obrigatório\):[\s\S]*?(?=\nComo alinhar o roteiro ao canal:)/i;
      if (rxCanal.test(corpo)) {
        corpo = corpo.replace(rxCanal, `${blocoCanal}\n`);
      }
    }

    return estado.extPromptSufixo
      ? `${corpo}\n\nTranscrição:\n${estado.extPromptSufixo}`
      : corpo;
  }
  if (estado.extPromptPrefixo) {
    const base = `${estado.extPromptPrefixo}\n${textoInstrucoes}\n${estado.extPromptPosInstrucoes}`;
    return `${base}\n\nTranscrição:\n${estado.extPromptSufixo || ""}`;
  }
  if (estado.extPromptBruto) {
    const bruto = String(estado.extPromptBruto || "");
    const rxRegras = /(Regras adicionais do editor[^:\n]*:\s*)([\s\S]*?)(\nExemplo \(outro assunto\))/i;
    if (rxRegras.test(bruto)) {
      return bruto.replace(rxRegras, (_, p1, _p2, p3) => `${p1}${textoInstrucoes}\n\n${p3}`);
    }
    if (estado.extPromptSufixo) {
      return `${textoInstrucoes}\n\nTranscrição:\n${estado.extPromptSufixo}`;
    }
    return `${bruto}\n\n${textoInstrucoes}`.trim();
  }
  const base = textoInstrucoes;
  return estado.extPromptSufixo ? `${base}\n\nTranscrição:\n${estado.extPromptSufixo}` : base;
}
function verificarBlococMidiasNoPrompt(prompt) {
  const txt = String(prompt || "").toLowerCase();
  return /mídias\s+disponíveis/i.test(txt) || /midias\s+disponiveis/i.test(txt);
}
function atualizarAvisoMidias() {
  const elPrompt = $("#ext-prompt");
  const elAviso = $("#ext-aviso-midias");
  if (!elAviso || !elPrompt) return;
  const temMidias = verificarBlococMidiasNoPrompt(elPrompt.value);
  elAviso.hidden = temMidias;
}
function versaoPromptCustomAtiva() {
  const el = $("#novo-ext-versao");
  return !!(el && !el.hidden && String(el.value || "").trim());
}
function textoBasePromptEditavel() {
  const elVersao = $("#novo-ext-versao");
  if (elVersao && !elVersao.hidden && estado.extPromptVersaoEditada && String(elVersao.value || "").trim()) {
    return String(elVersao.value || "");
  }
  const el = $("#novo-ext-instrucoes");
  if (el && String(el.value || "").trim()) return String(el.value || "");
  return instrucoesAtivas();
}
function atualizarPromptPreview() {
  const elPrompt = $("#ext-prompt");
  if (!elPrompt) return;
  // Regra principal: prompt copiável nasce da caixa de edição do passo 7
  // e recebe os blocos variáveis atuais (mídias/canal/transcrição).
  elPrompt.value = promptComInstrucoes(textoBasePromptEditavel());
  atualizarAvisoMidias();
}
$("#ext-copiar-transcricao").addEventListener("click", (e) => copiar($("#ext-transcricao").value, e.currentTarget));
$("#ext-copiar-prompt").addEventListener("click", (e) => {
  atualizarPromptPreview();
  copiar($("#ext-prompt").value, e.currentTarget);
});
$("#novo-ext-instrucoes").addEventListener("input", () => {
  salvarInstrucoesGlobais($("#novo-ext-instrucoes").value);
  const elVersao = $("#novo-ext-versao");
  // A edição no campo principal do passo 7 deve sempre atualizar o prompt copiável.
  // Se havia uma versão personalizada ativa, ela volta a seguir o texto principal.
  estado.extPromptVersaoEditada = false;
  if (elVersao && !elVersao.hidden) {
    elVersao.value = promptComInstrucoes(instrucoesAtivas());
  }
  atualizarEstadoVersaoPrompt();
  atualizarPromptPreview();
  atualizarAvisoMidias();
});
$("#novo-ext-reset-instrucoes").addEventListener("click", () => {
  limparInstrucoesGlobais();
  $("#novo-ext-instrucoes").value = estado.extInstrucoesPadrao || "";
  const elVersao = $("#novo-ext-versao");
  estado.extPromptVersaoEditada = false;
  if (elVersao && !elVersao.hidden) {
    elVersao.value = promptComInstrucoes(instrucoesAtivas());
  }
  atualizarEstadoVersaoPrompt();
  atualizarPromptPreview();
});
$("#novo-ext-criar-versao")?.addEventListener("click", () => {
  const elVersao = $("#novo-ext-versao");
  const elDica = $("#novo-ext-versao-dica");
  if (!elVersao || !elDica) return;
  elVersao.hidden = false;
  elDica.hidden = false;
  elVersao.value = promptComInstrucoes(instrucoesAtivas());
  estado.extPromptVersaoEditada = false;
  atualizarEstadoVersaoPrompt();
  atualizarPromptPreview();
});
$("#novo-ext-excluir-versao")?.addEventListener("click", () => {
  const elVersao = $("#novo-ext-versao");
  const elDica = $("#novo-ext-versao-dica");
  if (!elVersao || !elDica) return;
  elVersao.value = "";
  elVersao.hidden = true;
  elDica.hidden = true;
  estado.extPromptVersaoEditada = false;
  atualizarEstadoVersaoPrompt();
  atualizarPromptPreview();
});
$("#novo-ext-versao")?.addEventListener("input", () => {
  estado.extPromptVersaoEditada = true;
  atualizarPromptPreview();
});
$("#novo-ia-instrucoes")?.addEventListener("input", () => {
  salvarIAInstrucoesGlobais($("#novo-ia-instrucoes").value);
});
$("#novo-ia-reset-instrucoes")?.addEventListener("click", () => {
  limparIAInstrucoesGlobais();
  const el = $("#novo-ia-instrucoes");
  if (el) el.value = estado.iaInstrucoesPadrao || "";
});
$("#ext-gerar").addEventListener("click", async (e) => {
  const btn = e.currentTarget; const id = estado.projetoAtual;
  const texto = $("#ext-roteiro").value.trim();
  $("#ext-erro").textContent = "";
  if (!texto) { $("#ext-erro").textContent = t("pasteReturnedScript"); return; }
  btn.disabled = true;
  try {
    const r = await fetch(`/api/projetos/${id}/roteiro`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto }) });
    if (!r.ok) throw new Error(msgErroApi(await r.json().catch(() => null), r.statusText));
    abrirProjeto(id);
  } catch (err) { $("#ext-erro").textContent = err.message; }
  finally { btn.disabled = false; }
});

function renderExterno(p) {
  const ext = p.roteiro_externo;
  const el = $("#externo");
  if (!ext || !ext.pronto || p.estado === "rodando") { el.hidden = true; return; }
  const primeira = el.hidden;
  el.hidden = false;
  if (estado.extPromptBaseAtual !== String(ext.prompt || "")) {
    estado.extPromptBaseAtual = String(ext.prompt || "");
    estado.extPromptVersaoEditada = false;
    const elVersao = $("#novo-ext-versao");
    const elDica = $("#novo-ext-versao-dica");
    if (elVersao) {
      elVersao.value = "";
      elVersao.hidden = true;
    }
    if (elDica) elDica.hidden = true;
    atualizarEstadoVersaoPrompt();
  }
  const partes = separarPrompt(ext.prompt || "");
  estado.extPromptBruto = String(ext.prompt || "");
  estado.extPromptSufixo = partes.sufixo;
  estado.extPromptPrefixo = partes.prefixo || "";
  estado.extPromptPosInstrucoes = partes.posInstrucoes || "";
  if (partes.instrucoes && partes.instrucoes.trim()) {
    estado.extInstrucoesPadrao = partes.instrucoes.trim();
  }
  preencherEditorInstrucoes(true);
  atualizarEstadoVersaoPrompt();
  if ($("#ext-transcricao").value !== ext.transcricao) $("#ext-transcricao").value = ext.transcricao;
  atualizarPromptPreview();
  atualizarAvisoMidias();
  $("#ext-status").textContent = ext.pendente ? t("waitingScriptStatus", ext.trechos) : t("appliedScriptStatus");
  if (primeira) renderMidiasExterno();
}

async function midiasDoProjeto() {
  estado.imagensProjeto = await (await fetch(`/api/projetos/${estado.projetoAtual}/imagens`)).json();
  return estado.imagensProjeto;
}
async function renderMidiasExterno() {
  const midias = await midiasDoProjeto();
  $("#ext-midias-lista").innerHTML = midias.length
    ? midias.map((m) => `<span class="chip" title="${escapar(m.descricao || "")}">${escapar(m.nome)} <small>${m.tipo === "video" ? t("videoLabel") : t("imageLabel")}</small><button type="button" class="x" data-editar-midia="${m.id}" title="${t("edit")}">✎</button><button type="button" class="x" data-desvincular="${m.id}" title="${t("removeFromVideoTitle")}">×</button></span>`).join("")
    : `<small class="sb-pq">${t("noMediaInProject")}</small>`;
}
$("#ext-midias-lista").addEventListener("click", async (e) => {
  const ed = e.target.closest("[data-editar-midia]");
  if (ed) {
    const m = (estado.imagensProjeto || []).find((x) => x.id === ed.dataset.editarMidia);
    if (!m) return;
    const nome = prompt(t("mediaNamePrompt"), m.nome); if (nome === null) return;
    const descricao = prompt(t("mediaDescPrompt"), m.descricao); if (descricao === null) return;
    const r = await fetch(`/api/projetos/${estado.projetoAtual}/imagens/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, descricao }),
    });
    if (!r.ok) {
      alert(msgErroApi(await r.json().catch(() => null), t("cannotSave")));
      return;
    }
    await renderMidiasExterno();
    return;
  }
  const b = e.target.closest("[data-desvincular]"); if (!b) return;
  await fetch(`/api/projetos/${estado.projetoAtual}/imagens/${b.dataset.desvincular}`, { method: "DELETE" });
  await renderMidiasExterno(); atualizar(estado.projetoAtual);
});
$("#ext-anexar").addEventListener("click", async () => {
  const box = $("#ext-banco");
  if (!box.hidden) { box.hidden = true; return; }
  await carregarBanco();
  const ja = new Set((estado.imagensProjeto || []).map((m) => m.id));
  const livres = estado.banco.filter((m) => !ja.has(m.id));
  box.innerHTML = livres.length
    ? livres.map((m) => `
      <button type="button" class="mid-card mid-btn" data-vincular="${m.id}">
        <span class="mid-thumb">${m.tipo === "video" ? `<video src="/api/biblioteca/${m.id}/arquivo" muted preload="metadata"></video>` : `<img src="/api/biblioteca/${m.id}/arquivo" alt="" />`}<span class="badge">${m.tipo === "video" ? t("videoLabel") : t("imageLabel")}</span></span>
        <span class="mid-info"><strong>${escapar(m.nome)}</strong><small>${escapar(m.descricao)}</small><small class="sb-pq">${t("clickToAttach")}</small></span>
      </button>`).join("")
    : `<p class="dica">${t("allMediaAlreadyLinked")}</p>`;
  box.hidden = false;
});
$("#ext-banco").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-vincular]"); if (!b) return;
  const r = await fetch(`/api/projetos/${estado.projetoAtual}/imagens/banco`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [b.dataset.vincular] }) });
  if (!r.ok) { alert(msgErroApi(await r.json().catch(() => null), t("cannotAttach"))); return; }
  b.remove();
  await renderMidiasExterno(); atualizar(estado.projetoAtual);
});

function atualizarSelecaoCenasUI() {
  const n = estado.cenasSelecionadas.size;
  const tag = $("#av-fundo-qtd");
  if (tag) tag.textContent = `${n} selecionada${n === 1 ? "" : "s"}`;
  const lista = $("#av-fundo-selecao-lista");
  if (lista) {
    if (!n) lista.textContent = "Nenhuma cena selecionada.";
    else lista.textContent = `Cenas selecionadas: ${[...estado.cenasSelecionadas].join(", ")}`;
  }
}

function setCenaSelecionada(id, marcada) {
  if (!id) return;
  if (marcada) estado.cenasSelecionadas.add(id);
  else estado.cenasSelecionadas.delete(id);
  const cb = $(`#storyboard [data-bg-select="${id}"]`);
  if (cb) cb.checked = marcada;
  cb?.closest(".sb-cena")?.classList.toggle("sel-bg", marcada);
  atualizarSelecaoCenasUI();
}

function selecionarTodasCenas() {
  for (const c of estado.aoVivo?.cenas || []) setCenaSelecionada(c.id, true);
}

function limparSelecaoCenas() {
  for (const id of [...estado.cenasSelecionadas]) setCenaSelecionada(id, false);
}

function chavePlanoFundoProjeto() {
  return `${FUNDO_PLANO_PREFIX}${String(estado.projetoAtual || "")}`;
}

function lerPlanoFundoProjeto() {
  try {
    const bruto = localStorage.getItem(chavePlanoFundoProjeto());
    const arr = JSON.parse(bruto || "[]");
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => x && typeof x.nome === "string" && Array.isArray(x.cena_ids));
  } catch {
    return [];
  }
}

function salvarPlanoFundoProjeto() {
  localStorage.setItem(chavePlanoFundoProjeto(), JSON.stringify(estado.fundosPlano || []));
}

function dimensoesFormatoAtual() {
  const id = String(estado.formatoAtual || [...estado.formatos][0] || "16x9");
  return FORMATO_DIMENSOES[id] || FORMATO_DIMENSOES["16x9"];
}

function carregarDimensoesMidia(mid, tipo) {
  return new Promise((resolve, reject) => {
    const projetoId = String(estado.projetoAtual || "").trim();
    if (!projetoId || !mid) {
      reject(new Error("mídia inválida"));
      return;
    }
    const src = `/api/projetos/${encodeURIComponent(projetoId)}/imagens/${encodeURIComponent(mid)}/arquivo?t=${Date.now()}`;
    if (tipo === "video") {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        resolve({ w: Number(v.videoWidth || 0), h: Number(v.videoHeight || 0) });
        v.removeAttribute("src");
      };
      v.onerror = () => reject(new Error("não foi possível ler dimensões do vídeo"));
      v.src = src;
      return;
    }
    const img = new Image();
    img.onload = () => resolve({ w: Number(img.naturalWidth || 0), h: Number(img.naturalHeight || 0) });
    img.onerror = () => reject(new Error("não foi possível ler dimensões da imagem"));
    img.src = src;
  });
}

async function calcularZoomFit(mid) {
  const meta = (estado.imagensProjeto || []).find((m) => String(m.id) === String(mid));
  if (!meta) return 1;
  try {
    const media = await carregarDimensoesMidia(meta.id, meta.tipo);
    if (!Number.isFinite(media.w) || !Number.isFinite(media.h) || media.w <= 0 || media.h <= 0) return 1;
    const fmt = dimensoesFormatoAtual();
    const arFrame = fmt.w / fmt.h;
    const arMidia = media.w / media.h;
    if (!Number.isFinite(arFrame) || !Number.isFinite(arMidia) || arFrame <= 0 || arMidia <= 0) return 1;
    const zoomFit = Math.min(arMidia / arFrame, arFrame / arMidia);
    return Math.max(0.1, Math.min(1, Number(zoomFit.toFixed(3))));
  } catch {
    return 1;
  }
}

async function aplicarRegraFitNoZoom(autoAjustar = false) {
  const sel = $("#av-fundo-fit");
  const zoom = $("#av-fundo-zoom");
  if (!sel || !zoom) return;
  if (sel.value === "fit") {
    zoom.max = "1";
    if (autoAjustar) {
      const mid = $("#av-fundo-midia")?.value || "";
      const valor = await calcularZoomFit(mid);
      zoom.value = String(valor);
    } else {
      const atual = Number(zoom.value || "1");
      if (!Number.isFinite(atual) || atual > 1) zoom.value = "1";
    }
  } else {
    zoom.max = "3";
  }
}

function aplicarPayloadFundoNoEditor(payload) {
  if (!payload || typeof payload !== "object") return;
  const payloadBase = (Array.isArray(payload.camadas) && payload.camadas.length && typeof payload.camadas[0] === "object")
    ? payload.camadas[0]
    : payload;
  const atribuir = (id, valor) => {
    const el = $(id);
    if (!el || valor == null) return;
    el.value = String(valor);
  };
  atribuir("#av-fundo-midia", payloadBase.midia);
  atribuir("#av-fundo-brilho", payloadBase.brilho);
  atribuir("#av-fundo-contraste", payloadBase.contraste);
  atribuir("#av-fundo-saturacao", payloadBase.saturacao);
  atribuir("#av-fundo-blur", payloadBase.desfoque_px);
  atribuir("#av-fundo-opacidade", payloadBase.opacidade);
  atribuir("#av-fundo-escurecer", payloadBase.escurecer);
  atribuir("#av-fundo-zoom", payloadBase.zoom);
  atribuir("#av-fundo-fit", payloadBase.fit_mode || "cover");
  atribuir("#av-fundo-posx", payloadBase.posicao_x);
  atribuir("#av-fundo-posy", payloadBase.posicao_y);
  atribuir("#av-fundo-blend", payloadBase.blend_mode || "normal");
  void aplicarRegraFitNoZoom(false);
  estado.fundoCamadasEditor = Array.isArray(payload.camadas)
    ? payload.camadas.slice(1).filter((c) => c && typeof c === "object").map((c) => ({ ...c }))
    : [];
  renderCamadasEditor();
}

function resumoCamada(payload) {
  if (!payload) return "";
  return [
    `midia: ${payload.midia || "-"}`,
    `zoom ${payload.zoom ?? 1}`,
    `fit ${payload.fit_mode || "cover"}`,
    `opacidade ${payload.opacidade ?? 1}`,
    `blend ${payload.blend_mode || "normal"}`,
  ].join(" | ");
}

function renderCamadasEditor() {
  const box = $("#av-fundo-camadas");
  if (!box) return;
  const camadas = estado.fundoCamadasEditor || [];
  if (!camadas.length) {
    box.innerHTML = `<small class="sb-pq">Sem camadas extras. O Fundo atual será a camada base.</small>`;
    return;
  }
  box.innerHTML = camadas.map((c, i) => `
    <div class="av-fundo-item">
      <small class="sb-pq">Camada ${i + 2}: ${escapar(resumoCamada(c))}</small>
      <div class="av-fundo-item-acoes">
        <button type="button" class="btn" data-camada-subir="${i}" ${i === 0 ? "disabled" : ""}>Subir</button>
        <button type="button" class="btn" data-camada-descer="${i}" ${i === camadas.length - 1 ? "disabled" : ""}>Descer</button>
        <button type="button" class="btn" data-camada-remover="${i}">Remover</button>
      </div>
    </div>`).join("");
}

function resumoPreset(payload) {
  if (!payload) return "";
  if (Array.isArray(payload.camadas) && payload.camadas.length) {
    return `${payload.camadas.length} camada(s) | base: ${resumoCamada(payload.camadas[0])}`;
  }
  return [
    `midia: ${payload.midia || "-"}`,
    `brilho ${payload.brilho ?? 1}`,
    `contraste ${payload.contraste ?? 1}`,
    `saturacao ${payload.saturacao ?? 1}`,
    `blur ${payload.desfoque_px ?? 0}px`,
    `zoom ${payload.zoom ?? 1}`,
  ].join(" | ");
}

function renderPlanoFundo() {
  const box = $("#av-fundo-plano");
  if (!box) return;
  const itens = estado.fundosPlano || [];
  if (!itens.length) {
    box.innerHTML = `<small class="sb-pq">Nenhum fundo adicionado ao plano.</small>`;
    return;
  }
  box.innerHTML = itens.map((p, idx) => `
    <details class="av-fundo-item">
      <summary><strong>${escapar(p.nome)}</strong><span class="tag mini">${p.cena_ids.length} cena(s)</span></summary>
      <small class="sb-pq">Cenas: ${escapar(p.cena_ids.join(", "))}</small>
      ${p.fundo ? `<small class="sb-pq">${escapar(resumoPreset(p.fundo))}</small>` : `<small class="sb-pq">Ação: remover fundo</small>`}
      <div class="av-fundo-item-acoes">
        ${p.fundo ? `<button type="button" class="btn" data-plano-carregar="${escapar(p.id)}">Carregar no editor</button>` : ""}
        <button type="button" class="btn" data-plano-remover-idx="${idx}">Excluir do plano</button>
      </div>
    </details>`).join("");
}

function normalizarItemPlano(item) {
  if (!item || typeof item !== "object") return null;
  const nome = String(item.nome || "").trim();
  const cenaIds = Array.isArray(item.cena_ids) ? item.cena_ids.map((x) => String(x).trim()).filter(Boolean) : [];
  const fundo = item.fundo && typeof item.fundo === "object" ? item.fundo : null;
  if (!nome || !cenaIds.length || !fundo) return null;
  return {
    id: `fp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    nome,
    cena_ids: [...new Set(cenaIds)],
    fundo,
  };
}

async function preencherPainelFundo() {
  const box = $("#av-fundo");
  if (!box) return;
  if (!estado.aoVivo || estado.aoVivo.status === "pensando") {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  if (!estado.imagensProjeto) await midiasDoProjeto();
  const sel = $("#av-fundo-midia");
  if (!sel) return;
  if (estado.fundoPlanoProjetoId !== estado.projetoAtual) {
    estado.fundoPlanoProjetoId = estado.projetoAtual;
    estado.fundosPlano = lerPlanoFundoProjeto();
    renderPlanoFundo();
    const st = $("#av-fundo-ia-status");
    if (st) st.textContent = "";
  }
  const atual = sel.value;
  const itens = (estado.imagensProjeto || []);
  sel.innerHTML = itens.map((m) => `<option value="${m.id}">${escapar(m.nome || m.arquivo)} (${m.tipo})</option>`).join("");
  if (atual && [...sel.options].some((o) => o.value === atual)) {
    sel.value = atual;
  }
  void aplicarRegraFitNoZoom(false);
  renderCamadasEditor();
  atualizarSelecaoCenasUI();
}

function lerPayloadFundoBase() {
  const midia = $("#av-fundo-midia")?.value || "";
  if (!midia) throw new Error("Escolha uma mídia para o fundo.");
  const num = (id, fallback) => {
    const el = $(id);
    const v = Number(el?.value ?? fallback);
    return Number.isFinite(v) ? v : fallback;
  };
  const fitMode = String($("#av-fundo-fit")?.value || "cover");
  const zoomRaw = num("#av-fundo-zoom", 1);
  const zoom = fitMode === "fit" ? Math.min(1, zoomRaw) : zoomRaw;
  return {
    midia,
    brilho: num("#av-fundo-brilho", 1),
    contraste: num("#av-fundo-contraste", 1),
    saturacao: num("#av-fundo-saturacao", 1),
    desfoque_px: num("#av-fundo-blur", 0),
    opacidade: num("#av-fundo-opacidade", 1),
    escurecer: num("#av-fundo-escurecer", 0),
    zoom,
    fit_mode: fitMode,
    posicao_x: num("#av-fundo-posx", 0.5),
    posicao_y: num("#av-fundo-posy", 0.5),
    blend_mode: String($("#av-fundo-blend")?.value || "normal"),
  };
}

function lerPayloadFundo() {
  const base = lerPayloadFundoBase();
  if (Array.isArray(estado.fundoCamadasEditor) && estado.fundoCamadasEditor.length) {
    const camadas = [base, ...estado.fundoCamadasEditor.map((c) => ({ ...c }))].slice(0, 8);
    return { ...base, camadas };
  }
  return base;
}

function moverCamada(camadas, origem, destino) {
  const itens = [...camadas];
  if (origem < 0 || origem >= itens.length || destino < 0 || destino >= itens.length) return itens;
  const [item] = itens.splice(origem, 1);
  itens.splice(destino, 0, item);
  return itens;
}

async function enviarPatchFundo(projetoId, body) {
  const pid = encodeURIComponent(projetoId);
  const urls = [
    `/api/projetos/${pid}/cenas_fundo`,
    `/api/projetos/${pid}/cenas-fundo`,
  ];
  let r = null;
  let ultimo404 = null;
  for (const url of urls) {
    r = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.status === 404) {
      ultimo404 = await r.json().catch(() => null);
      continue;
    }
    break;
  }
  if (!r) throw new Error("Não foi possível aplicar o fundo.");
  if (r.status === 404) {
    const detalhe = msgErroApi(ultimo404, "Not Found");
    if (detalhe && detalhe !== "Not Found") throw new Error(detalhe);
    throw new Error("Endpoint de fundo não encontrado. Reinicie o servidor e recarregue a página.");
  }
  if (!r.ok) throw new Error(msgErroApi(await r.json().catch(() => null), r.statusText));
  return r;
}

async function aplicarPlanoFundosPendentes() {
  const projetoId = String(estado.projetoAtual ?? "").trim();
  if (!projetoId) throw new Error("Projeto ainda não carregou.");
  const plano = (estado.fundosPlano || []).filter((x) => Array.isArray(x.cena_ids) && x.cena_ids.length);
  if (!plano.length) return;
  for (const item of plano) {
    const body = { cena_ids: item.cena_ids, fundo: item.fundo || null };
    await enviarPatchFundo(projetoId, body);
  }
  estado.fundosPlano = [];
  salvarPlanoFundoProjeto();
  renderPlanoFundo();
}

$("#storyboard").addEventListener("change", (e) => {
  const c = e.target.closest("[data-bg-select]");
  if (!c) return;
  setCenaSelecionada(c.dataset.bgSelect, c.checked);
});

$("#av-fundo-add-camada")?.addEventListener("click", async () => {
  const erro = $("#av-fundo-erro");
  if (erro) erro.textContent = "";
  try {
    if ($("#av-fundo-fit")?.value === "fit") {
      await aplicarRegraFitNoZoom(true);
    }
    const camada = lerPayloadFundoBase();
    estado.fundoCamadasEditor = [...(estado.fundoCamadasEditor || []), camada].slice(-8);
    renderCamadasEditor();
  } catch (e) {
    if (erro) erro.textContent = e.message || "Não foi possível adicionar camada.";
  }
});

$("#av-fundo-limpar-camadas")?.addEventListener("click", () => {
  estado.fundoCamadasEditor = [];
  renderCamadasEditor();
});

$("#av-fundo-camadas")?.addEventListener("click", (e) => {
  const bSubir = e.target.closest("[data-camada-subir]");
  if (bSubir) {
    const idx = Number(bSubir.dataset.camadaSubir);
    if (!Number.isFinite(idx) || idx <= 0) return;
    estado.fundoCamadasEditor = moverCamada(estado.fundoCamadasEditor || [], idx, idx - 1);
    renderCamadasEditor();
    return;
  }
  const bDescer = e.target.closest("[data-camada-descer]");
  if (bDescer) {
    const idx = Number(bDescer.dataset.camadaDescer);
    const camadas = estado.fundoCamadasEditor || [];
    if (!Number.isFinite(idx) || idx < 0 || idx >= camadas.length - 1) return;
    estado.fundoCamadasEditor = moverCamada(camadas, idx, idx + 1);
    renderCamadasEditor();
    return;
  }
  const b = e.target.closest("[data-camada-remover]");
  if (!b) return;
  const idx = Number(b.dataset.camadaRemover);
  if (!Number.isFinite(idx)) return;
  estado.fundoCamadasEditor = (estado.fundoCamadasEditor || []).filter((_, i) => i !== idx);
  renderCamadasEditor();
});

$("#av-fundo-fit")?.addEventListener("change", async () => {
  await aplicarRegraFitNoZoom(true);
});

$("#av-fundo-midia")?.addEventListener("change", async () => {
  const fit = $("#av-fundo-fit")?.value;
  if (fit === "fit") await aplicarRegraFitNoZoom(true);
});

$("#av-fundo-adicionar-plano")?.addEventListener("click", async () => {
  const erro = $("#av-fundo-erro");
  if (erro) erro.textContent = "";
  try {
    if ($("#av-fundo-fit")?.value === "fit") {
      await aplicarRegraFitNoZoom(true);
    }
    const nome = String($("#av-fundo-item-nome")?.value || "").trim();
    if (!nome) throw new Error("Dê um nome para este fundo.");
    const cenaIds = [...estado.cenasSelecionadas];
    if (!cenaIds.length) throw new Error("Selecione ao menos uma cena.");
    const fundo = lerPayloadFundo();
    const novo = { id: `fp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`, nome, fundo, cena_ids: cenaIds };
    estado.fundosPlano = [...(estado.fundosPlano || []), novo].slice(-60);
    salvarPlanoFundoProjeto();
    renderPlanoFundo();
    $("#av-fundo-item-nome").value = "";
    estado.fundoCamadasEditor = [];
    renderCamadasEditor();
    estado.cenasSelecionadas.clear();
    atualizarSelecaoCenasUI();
  } catch (e) {
    if (erro) erro.textContent = e.message || "Não foi possível adicionar ao plano.";
  }
});

$("#av-fundo-ia")?.addEventListener("click", async (e) => {
  const erro = $("#av-fundo-erro");
  const st = $("#av-fundo-ia-status");
  if (erro) erro.textContent = "";
  if (st) st.textContent = "Pensando...";
  const btn = e.currentTarget;
  btn.disabled = true;
  try {
    const projetoId = String(estado.projetoAtual ?? "").trim();
    if (!projetoId) throw new Error("Projeto ainda não carregou.");
    const r = await fetch(`/api/projetos/${encodeURIComponent(projetoId)}/fundo_plano_ia`, { method: "POST" });
    if (!r.ok) throw new Error(msgErroApi(await r.json().catch(() => null), r.statusText));
    const data = await r.json();
    const itens = Array.isArray(data.itens) ? data.itens.map(normalizarItemPlano).filter(Boolean) : [];
    if (!itens.length) throw new Error("A IA não encontrou um plano de fundos válido para este projeto.");
    estado.fundosPlano = itens;
    salvarPlanoFundoProjeto();
    renderPlanoFundo();
    if (st) {
      const modo = data.modo === "ia" ? `IA (${data.modelo || "modelo local"})` : "regras";
      st.textContent = `Plano criado por ${modo}: ${itens.length} fundo(s).`;
    }
  } catch (e2) {
    if (st) st.textContent = "";
    if (erro) erro.textContent = e2.message || "Não foi possível gerar o plano com IA.";
  } finally {
    btn.disabled = false;
  }
});

$("#av-fundo-plano")?.addEventListener("click", (e) => {
  const bCarregar = e.target.closest("[data-plano-carregar]");
  const bRemoverIdx = e.target.closest("[data-plano-remover-idx]");
  if (bCarregar) {
    const p = (estado.fundosPlano || []).find((x) => x.id === bCarregar.dataset.planoCarregar);
    if (p?.fundo) aplicarPayloadFundoNoEditor(p.fundo);
    return;
  }
  if (bRemoverIdx) {
    const idx = Number(bRemoverIdx.dataset.planoRemoverIdx);
    if (!Number.isFinite(idx) || idx < 0) return;
    estado.fundosPlano = (estado.fundosPlano || []).filter((_, i) => i !== idx);
    salvarPlanoFundoProjeto();
    renderPlanoFundo();
  }
});

$("#av-fundo-limpar-plano")?.addEventListener("click", () => {
  estado.fundosPlano = [];
  salvarPlanoFundoProjeto();
  renderPlanoFundo();
});
$("#av-fundo-selecionar-todas")?.addEventListener("click", selecionarTodasCenas);
$("#av-fundo-limpar-selecao")?.addEventListener("click", limparSelecaoCenas);

// ---------- progresso / resultado ----------
function clampNum(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function progressoFallback(p, aguardandoRoteiro) {
  const etapas = Array.isArray(p?.etapas) ? p.etapas : [];
  const etapasTotal = Math.max(1, etapas.length);
  const formatosTotal = Math.max(1, (p?.formatos || []).length || 1);
  const formatosConcluidos = clampNum((p?.prontos || []).length, 0, formatosTotal);
  const etapaAtual = p?.etapa || (aguardandoRoteiro ? "m09" : null);
  const etapaIdx = etapaAtual ? Math.max(0, etapas.findIndex(([eid]) => eid === etapaAtual)) : 0;
  const totalUnidades = etapasTotal * formatosTotal;
  let unidades = formatosConcluidos * etapasTotal;

  if (p?.estado === "concluido" && !aguardandoRoteiro) {
    unidades = totalUnidades;
  } else if (p?.estado === "rodando" || p?.estado === "erro") {
    unidades += etapaIdx;
  } else if (aguardandoRoteiro) {
    unidades = etapaIdx;
  }

  return {
    percentual: totalUnidades ? (100 * unidades) / totalUnidades : 0,
    etapa_id: etapaAtual,
    etapa_nome: null,
    formatos_total: formatosTotal,
    formatos_concluidos: formatosConcluidos,
    frames_atual: null,
    frames_total: null,
  };
}

function progressoResolvido(p, aguardandoRoteiro) {
  const fallback = progressoFallback(p, aguardandoRoteiro);
  const api = (p && typeof p.progresso === "object" && p.progresso) ? p.progresso : null;
  if (!api) return fallback;
  const pct = Number(api.percentual);
  return {
    ...fallback,
    ...api,
    percentual: Number.isFinite(pct) ? pct : fallback.percentual,
  };
}

function resetBarraProgresso() {
  const bar = $("#prog-bar");
  const wrap = $("#prog-bar-wrap");
  const pct = $("#prog-status-pct");
  const st = $("#prog-status-text");
  const det = $("#prog-detail");
  if (bar) bar.style.width = "0%";
  if (wrap) wrap.setAttribute("aria-valuenow", "0");
  if (pct) pct.textContent = "0%";
  if (st) st.textContent = t("generating");
  if (det) {
    det.hidden = true;
    det.textContent = "";
  }
}

function renderBarraProgresso(p, aguardandoRoteiro) {
  const info = progressoResolvido(p, aguardandoRoteiro);
  const percentual = clampNum(Number(info.percentual) || 0, 0, 100);
  const bar = $("#prog-bar");
  const wrap = $("#prog-bar-wrap");
  const pct = $("#prog-status-pct");
  const st = $("#prog-status-text");
  const det = $("#prog-detail");

  if (bar) bar.style.width = `${percentual.toFixed(1)}%`;
  if (wrap) wrap.setAttribute("aria-valuenow", String(Math.round(percentual)));
  if (pct) pct.textContent = `${Math.round(percentual)}%`;

  let status = t("generating");
  if (p.estado === "erro") {
    status = t("error");
  } else if (aguardandoRoteiro) {
    status = t("progressWaitingScript");
  } else if (p.estado === "concluido") {
    status = t("ready");
  } else {
    const etapaId = info.etapa_id || p.etapa;
    const etapaNome = info.etapa_nome || (p.etapas || []).find(([eid]) => eid === etapaId)?.[1] || t("generating");
    const fmt = p.formato_atual ? ` (${p.formato_atual})` : "";
    status = `${etapaNome}${fmt}`;
  }
  if (st) st.textContent = status;

  const detalhes = [];
  const formatosConcluidos = Number(info.formatos_concluidos);
  const formatosTotal = Number(info.formatos_total);
  if (Number.isFinite(formatosConcluidos) && Number.isFinite(formatosTotal) && formatosTotal > 0) {
    detalhes.push(t("progressFormats", formatosConcluidos, formatosTotal));
  }
  const framesAtual = Number(info.frames_atual);
  const framesTotal = Number(info.frames_total);
  if (Number.isFinite(framesAtual) && Number.isFinite(framesTotal) && framesTotal > 0) {
    detalhes.push(t("progressFrames", framesAtual, framesTotal));
  }
  if (det) {
    det.textContent = detalhes.join(" · ");
    det.hidden = detalhes.length === 0;
  }
}

function abrirProjeto(id) {
  mostrar("progresso");
  estado.editando = null; estado.editTemplate = null; estado.imagensProjeto = null;
  $("#resultado").hidden = true; $("#prog-erro").hidden = true; $("#log").hidden = true; $("#ao-vivo").hidden = true; $("#externo").hidden = true;
  resetBarraProgresso();
  estado.projetoAtual = id;
  atualizar(id);
  estado.poll = setInterval(() => atualizar(id), 1500);
}

async function atualizar(id) {
  if (estado.atualizandoProjeto) return;
  estado.atualizandoProjeto = true;
  try {
    const r = await fetch(`/api/projetos/${id}`);
    if (!r.ok) {
      clearInterval(estado.poll);
      return;
    }
    const p = await r.json();
    const temaObj = estado.opcoes?.temas.find((t) => t.id === p.tema_id);
    const nomeTema = temaObj ? temaTraduzido(temaObj).nome : "";
    const nomeEstilo = estado.opcoes?.estilos.find((t) => t.id === p.estilo_id)?.nome ?? "";
    $("#prog-titulo").textContent = p.titulo;
    $("#prog-sub").textContent = [nomeTema, nomeEstilo, p.formatos.join(" · ")].filter(Boolean).join("  •  ");

    const ids = p.etapas.map(([e]) => e);
    const aguardandoRoteiro = p.roteiro_externo?.pronto && p.roteiro_externo.pendente && p.estado !== "rodando";
    const idx = p.etapa ? ids.indexOf(p.etapa) : (aguardandoRoteiro ? ids.indexOf("m09") : (p.estado === "concluido" ? ids.length : -1));
    const fmt = p.formato_atual ? ` (${p.formato_atual})` : "";
    if (p.formato_atual) estado.formatoAtual = p.formato_atual;
    renderBarraProgresso(p, aguardandoRoteiro);
    $("#etapas").innerHTML = p.etapas.map(([e, nome], i) => {
      const cls = (p.estado === "concluido" && !aguardandoRoteiro) || i < idx ? "feita" : (i === idx && p.estado === "rodando" ? "atual" : "");
      const ico = cls === "feita" ? "✓" : "";
      const extra = aguardandoRoteiro && e === "m09" ? t("waitingPasteScript") : "";
      return `<li class="${cls}"><span class="ico">${ico}</span>${nome}${cls === "atual" ? fmt : ""}${extra}</li>`;
    }).join("");
    $("#etapas").hidden = p.estado === "novo";

    if (p.estado === "rodando" && p.log.length) { $("#log").hidden = false; $("#log").textContent = p.log.join("\n"); }
    else $("#log").hidden = true;

    renderExterno(p);
    renderAoVivo(p);

    if (p.estado === "erro") {
      clearInterval(estado.poll); estado.poll = null;
      $("#prog-erro").hidden = false;
      $("#prog-erro").innerHTML = `<strong>${t("somethingWentWrong")}</strong>\n${escapar(p.erro || "")}\n\n<button class="btn" onclick="regerar('${id}')">${t("tryAgain")}</button>`;
    }

    if (p.prontos.length) {
      $("#resultado").hidden = false;
      $("#resultado").innerHTML = p.prontos.map((f) => `
        <div class="video-card">
          <video controls preload="metadata" src="/api/projetos/${id}/video/${f}?v=${Date.now()}"></video>
          <div class="acoes"><strong>${rotuloFormato(f)}</strong>
            <a class="btn" href="/api/projetos/${id}/video/${f}?download=1">${t("downloadMp4")}</a>
            <a class="btn" href="/api/projetos/${id}/audio?formato=mp3&download=1">${t("downloadMp3")}</a></div>
        </div>`).join("");
    }
    if (p.estado !== "rodando" && estado.poll) { clearInterval(estado.poll); estado.poll = null; }
  } finally {
    estado.atualizandoProjeto = false;
  }
}
// ---------- demonstração ao vivo ----------
function renderAoVivo(p) {
  const av = p.ao_vivo;
  if (!av) {
    $("#ao-vivo").hidden = true;
    const fundoBox = $("#av-fundo");
    if (fundoBox) fundoBox.hidden = true;
    return;
  }
  $("#ao-vivo").hidden = false;
  const modo = { ia: t("modeLocalIA", av.modelo), externo: t("modeExternalIA"), regras: t("modeRules"), fixo: t("modeFixed") }[av.modo] || av.modo;
  $("#av-modo").textContent = av.status === "pensando" ? `${modo}${t("readingTranscript")}` : modo;
  $("#av-dica").textContent = av.status === "pensando"
    ? t("avThinking")
    : t("avDone", av.cenas.length);
  const nomes = Object.fromEntries((estado.opcoes?.templates || []).map((t) => [t.id, t]));
  const renderizando = p.etapa === "m13";
  const podeEditar = p.estado !== "rodando" && av.status !== "pensando";
  const abertas = new Set($$("#storyboard .sb-fala[open]").map((d) => d.dataset.i));
  const idsAtuais = new Set(av.cenas.map((x) => x.id));
  estado.cenasSelecionadas = new Set([...estado.cenasSelecionadas].filter((id) => idsAtuais.has(id)));
  estado.aoVivo = av; estado.projetoAtual = p.id;
  $("#storyboard").innerHTML = av.cenas.map((c, i) => `
    <div class="sb-cena ${c.preview ? "pronta" : ""} ${estado.editando === c.id ? "editando" : ""} ${estado.cenasSelecionadas.has(c.id) ? "sel-bg" : ""}">
      <div class="sb-th">${c.preview ? `<img src="${c.preview}&t=${Date.now()}" alt="" />`
        : `<div class="sb-vazio ${renderizando ? "pulsa" : ""}"><span>${escapar(templateNome(c.template))}</span>${renderizando ? `<small>${t("rendering")}</small>` : (c.editada ? `<small>${t("renderToSee")}</small>` : "")}</div>`}</div>
      ${estado.editando === c.id ? editorCena(c) : `<div class="sb-info">
        <div class="sb-linha"><input class="sb-check" type="checkbox" data-bg-select="${c.id}" ${estado.cenasSelecionadas.has(c.id) ? "checked" : ""} title="Selecionar para fundo" /><span class="sb-n">${i + 1}</span><span class="sb-t">${fmtTempo(c.inicio)} – ${fmtTempo(c.fim)}</span><span class="tag mini" title="${escapar(nomes[c.template]?.descricao || "")}">${escapar(templateNome(c.template))}</span>
          ${c.fundo_override ? `<span class="tag mini">fundo</span>` : ""}
          ${podeEditar ? `<button class="sb-editar" onclick="editarCena('${c.id}')" title="Trocar template ou texto">${t("edit")}</button>` : ""}</div>
        <strong class="sb-tela">${escapar(c.tela || "")}</strong>
        ${c.por_que ? `<small class="sb-pq">${escapar(c.por_que)}</small>` : ""}
        <details class="sb-fala" data-i="${i}" ${abertas.has(String(i)) ? "open" : ""}><summary>${t("originalSpeech")}</summary>${escapar(c.fala || "")}</details>
      </div>`}
    </div>`).join("");
  const editadas = av.cenas.filter((c) => c.editada && !c.preview).length;
  $("#av-rerender").hidden = !podeEditar;
  $("#av-rerender-n").textContent = editadas === 1 ? t("oneEditedScene") : t("manyEditedScenes", editadas);
  const btnRerender = $("#av-rerender-btn");
  if (btnRerender) btnRerender.disabled = editadas < 1;
  preencherPainelFundo();
}

// ---------- edição manual de cena ----------
const CAMPOS = {
  TituloImpacto: [["texto", "Frase na tela", "texto"], ["palavras_destaque", "Palavras em destaque (separe por vírgula)", "lista"]],
  TextoCorrido: [["texto", "Resumo de 1 frase", "longo"], ["destaque", "Palavras em destaque (até 2, por vírgula)", "lista"]],
  Pergunta: [["texto", "Pergunta", "texto"]],
  Citacao: [["texto", "Citação", "longo"], ["autor", "Autor", "texto"]],
  NumeroDestaque: [["valor", "Número (ex: 13,75%)", "texto"], ["rotulo", "O que é esse número", "texto"],
    ["sentimento", "Cor", "opcoes", [["neutro", "Neutro"], ["positivo", "Positivo (verde)"], ["negativo", "Negativo (vermelho)"]]]],
  ComparacaoDoisLados: [["titulo", "Título", "texto"], ["a.rotulo", "Lado A — nome", "texto"], ["a.valor", "Lado A — valor", "texto"], ["a.itens", "Lado A — itens (por vírgula)", "lista"],
    ["b.rotulo", "Lado B — nome", "texto"], ["b.valor", "Lado B — valor", "texto"], ["b.itens", "Lado B — itens (por vírgula)", "lista"],
    ["vencedor", "Destacar", "opcoes", [["nenhum", "Nenhum"], ["a", "Lado A"], ["b", "Lado B"]]]],
  GraficoBarras: [["titulo", "Título", "texto"], ["barras", "Barras — uma por linha: nome: valor", "barras"], ["unidade", "Unidade (%, R$…)", "texto"]],
  SetaTendencia: [["direcao", "Direção", "opcoes", [["sobe", "Sobe"], ["desce", "Desce"]]], ["texto", "Texto", "texto"], ["valor", "Valor", "texto"],
    ["sentimento", "Cor", "opcoes", [["neutro", "Neutro"], ["positivo", "Positivo (verde)"], ["negativo", "Negativo (vermelho)"]]]],
  MidiaCheia: [["midia", "Imagem ou vídeo do projeto", "midia"],
    ["ajusteImagem", "Ajuste da imagem", "opcoes", [["contain", "Caber inteira (fit)"], ["cover", "Preencher (cortar)"]]],
    ["zoom", "Movimento de zoom", "opcoes", [["nenhum", "Sem zoom"], ["in", "Zoom in"], ["out", "Zoom out"]]],
    ["zoomMax", "Intensidade do zoom (1.00 a 1.30)", "numero", { min: 1, max: 1.3, step: 0.01 }]],
  ImagemDestaque: [["imagem", "Imagem do projeto", "imagem"], ["texto", "Título sobre a imagem", "texto"], ["legenda", "Legenda", "texto"]],
  ListaAnimada: [["titulo", "Título", "texto"], ["itens", "Itens — um por linha (2 a 6)", "linhas"]],
  LegendaSincronizada: [["texto", "Texto (as palavras acendem no ritmo da fala; edite para corrigir)", "longo"],
    ["palavras_destaque", "Palavras em destaque (por vírgula)", "lista"]],
  TextoLongo: [["texto", "Parágrafo", "longo"], ["destaque_frases", "Trechos a marcar (por vírgula, até 3)", "lista"]],
  GraficoPizza: [["titulo", "Título", "texto"], ["fatias", "Fatias — uma por linha: nome: valor (2 a 6)", "fatias"],
    ["estilo", "Estilo", "opcoes", [["donut", "Rosca"], ["pizza", "Pizza"]]], ["destacar_indice", "Destacar fatia nº (1 = primeira; vazio = nenhuma)", "indice"]],
  Timeline: [["titulo", "Título", "texto"], ["eventos", "Eventos — um por linha: marcador: descrição (2 a 6)", "eventos"],
    ["orientacao", "Orientação", "opcoes", [["horizontal", "Horizontal"], ["vertical", "Vertical"]]]],
  MapaMental: [["titulo", "Título", "texto"], ["itens", "Itens — um por linha: 1.2: texto (2 a 16)", "mapa"]],
  MapaMentalCartoes: [["titulo", "Título", "texto"], ["itens", "Itens — um por linha: 1.2: texto (2 a 16)", "mapa"]],
  Planilha: [["titulo", "Título", "texto"], ["colunas", "Colunas (por vírgula, 2 a 4)", "lista"],
    ["linhas", "Linhas — uma por linha, células separadas por ; (1 a 5)", "tabela"],
    ["destacar_coluna", "Destacar coluna nº (1 = primeira; vazio = nenhuma)", "indice"],
    ["destacar_linha", "Destacar linha nº (1 = primeira; vazio = nenhuma)", "indice"]],
  CTAFinal: [["texto_principal", "Chamada", "texto"], ["subtexto", "Subtexto", "texto"],
    ["estilo_botao", "Botão", "opcoes", [["solido", "Sólido"], ["contorno", "Contorno"]]]],
};
const CAMPOS_ANIMACAO = [
  ["animacao_entrada", "Animação de entrada", "opcoes", [["padrao", "Padrão"], ["de_baixo", "De baixo"], ["de_cima", "De cima"]]],
  ["animacao_saida", "Animação de saída", "opcoes", [["padrao", "Padrão"], ["para_cima", "Para cima"], ["para_baixo", "Para baixo"]]],
];
const camposTemplate = (tpl) => [...(CAMPOS[tpl] || []), ...CAMPOS_ANIMACAO];
const pares = (v, a, b) => (v || []).map((x) => `${x[a]}: ${x[b]}`).join("\n");
function lerPares(raw, a, b, numerico) {
  return raw.split("\n").map((s) => s.trim()).filter(Boolean).map((l) => {
    const i = l.indexOf(":"); const k = (i < 0 ? l : l.slice(0, i)).trim(); const val = (i < 0 ? "" : l.slice(i + 1)).trim();
    return { [a]: k, [b]: numerico ? Number(val.replace(",", ".")) : val };
  });
}
function pegar(obj, caminho) { return caminho.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj); }
function por(obj, caminho, v) { const ks = caminho.split("."); let o = obj; ks.slice(0, -1).forEach((k) => { o[k] = o[k] || {}; o = o[k]; }); o[ks.at(-1)] = v; }

function editorCena(c) {
  const tpl = estado.editTemplate || c.template;
  const dados = estado.editTemplate && estado.editTemplate !== c.template
    ? { texto: c.dados?.texto || c.dados?.titulo || c.tela || "", titulo: c.dados?.titulo || c.dados?.texto || "" }
    : (c.dados || {});
  if (tpl === "LegendaSincronizada" && !dados.texto) dados.texto = c.fala || "";
  const tpls = (estado.opcoes?.templates || []).map((t) => t.id).filter((id) => CAMPOS[id]);
  const renderCampo = ([chave, rotulo, tipo, opcoes]) => {
    const v = pegar(dados, chave);
    const nome = `data-campo="${chave}"`;
    let input;
    if (tipo === "longo") input = `<textarea class="campo" rows="2" ${nome}>${escapar(v || "")}</textarea>`;
    else if (tipo === "lista") input = `<input class="campo" ${nome} value="${escapar((v || []).join(", "))}" />`;
    else if (tipo === "linhas") input = `<textarea class="campo" rows="4" ${nome}>${escapar((v || []).join("\n"))}</textarea>`;
    else if (tipo === "barras") input = `<textarea class="campo" rows="4" ${nome}>${escapar((v || []).map((b) => `${b.rotulo}: ${b.valor}`).join("\n"))}</textarea>`;
    else if (tipo === "fatias") input = `<textarea class="campo" rows="4" ${nome}>${escapar(pares(v, "rotulo", "valor"))}</textarea>`;
    else if (tipo === "eventos") input = `<textarea class="campo" rows="4" ${nome}>${escapar(pares(v, "marcador", "descricao"))}</textarea>`;
    else if (tipo === "mapa") input = `<textarea class="campo" rows="6" ${nome}>${escapar((v || []).map((n) => `${n.id}: ${n.texto}`).join("\n"))}</textarea>`;
    else if (tipo === "tabela") input = `<textarea class="campo" rows="5" ${nome}>${escapar((v || []).map((l) => l.join("; ")).join("\n"))}</textarea>`;
    else if (tipo === "indice") input = `<input class="campo" type="number" min="1" ${nome} value="${v == null ? "" : Number(v) + 1}" />`;
    else if (tipo === "opcoes") input = `<select class="campo" ${nome}>${opcoes.map(([o, r]) => `<option value="${o}" ${v === o ? "selected" : ""}>${r}</option>`).join("")}</select>`;
    else if (tipo === "numero") {
      const cfg = opcoes || {};
      const min = Number.isFinite(Number(cfg.min)) ? ` min="${Number(cfg.min)}"` : "";
      const max = Number.isFinite(Number(cfg.max)) ? ` max="${Number(cfg.max)}"` : "";
      const step = Number.isFinite(Number(cfg.step)) ? ` step="${Number(cfg.step)}"` : "";
      input = `<input class="campo" type="number"${min}${max}${step} ${nome} value="${escapar(String(v ?? ""))}" />`;
    }
    else if (tipo === "imagem" || tipo === "midia") {
      const imgs = (estado.imagensProjeto || []).filter((im) => tipo === "midia" || im.tipo !== "video");
      input = imgs.length ? `<select class="campo" ${nome}>${imgs.map((im) => `<option value="${im.id}" ${v === im.id ? "selected" : ""}>${escapar(im.nome || im.arquivo)}</option>`).join("")}</select>`
        : `<small class="sb-pq">Este projeto não tem ${tipo === "midia" ? "mídias" : "imagens"} do banco vinculadas.</small>`;
    } else input = `<input class="campo" ${nome} value="${escapar(String(v ?? ""))}" />`;
    return `<label class="ed-campo"><span>${rotulo}</span>${input}</label>`;
  };
  const camposBase = (CAMPOS[tpl] || []).map(renderCampo).join("");
  const camposAnimacao = CAMPOS_ANIMACAO.map(renderCampo).join("");
  const idx = estado.aoVivo.cenas.findIndex((x) => x.id === c.id), ultima = idx === estado.aoVivo.cenas.length - 1;
  return `<div class="sb-info sb-editor" data-cena="${c.id}">
    <div class="ed-tempos">
      <label class="ed-campo"><span>Começa em (s)</span><input class="campo" type="number" step="0.1" id="ed-inicio" value="${c.inicio.toFixed(1)}" ${idx === 0 ? "disabled" : ""} /></label>
      <label class="ed-campo"><span>Termina em (s)</span><input class="campo" type="number" step="0.1" id="ed-fim" value="${c.fim.toFixed(1)}" ${ultima ? "disabled" : ""} /></label>
    </div>
    <small class="sb-pq">O áudio não muda; só o momento em que a tela troca para a cena vizinha.</small>
    <label class="ed-campo"><span>Template</span>
      <select class="campo" id="ed-template" onchange="trocarTemplateEdicao(this.value)">${tpls.map((id) => `<option value="${id}" ${id === tpl ? "selected" : ""}>${escapar(templateNome(id))}</option>`).join("")}</select></label>
    ${camposBase}
    <small class="sb-pq">Animação da cena (opcional)</small>
    ${camposAnimacao}
    <div class="ed-erro" id="ed-erro" hidden></div>
    <div class="sb-linha"><button class="btn" onclick="salvarCena('${c.id}')">Salvar</button><button class="btn ghost" onclick="cancelarEdicao()">Cancelar</button>
      <button class="sb-editar" onclick="dividirCena('${c.id}')" title="Corta esta cena no meio e cria uma nova cena depois">+ Dividir em 2</button>
      ${estado.aoVivo.cenas.length > 1 ? `<button class="sb-editar" onclick="removerCena('${c.id}')" title="Junta este trecho à cena anterior">Remover</button>` : ""}</div>
    <details class="sb-fala"><summary>Fala original</summary>${escapar(c.fala || "")}</details>
  </div>`;
}
function redesenharStoryboard() { renderAoVivo({ id: estado.projetoAtual, ao_vivo: estado.aoVivo, estado: "concluido", etapa: null }); }
window.editarCena = async (id) => {
  if (!estado.imagensProjeto) await midiasDoProjeto();
  estado.editando = id; estado.editTemplate = null; redesenharStoryboard();
};
window.trocarTemplateEdicao = (tpl) => { estado.editTemplate = tpl; redesenharStoryboard(); };
window.cancelarEdicao = () => { estado.editando = null; estado.editTemplate = null; redesenharStoryboard(); };
function lerEditor() {
  const tpl = $("#ed-template").value, dados = {};
  for (const [chave, , tipo] of camposTemplate(tpl)) {
    const el = $(`#storyboard [data-campo="${chave}"]`);
    if (!el) continue;
    const raw = el.value.trim();
    let v = raw;
    if (tipo === "lista") v = raw.split(",").map((s) => s.trim()).filter(Boolean);
    else if (tipo === "linhas") v = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    else if (tipo === "barras") v = raw.split("\n").map((s) => s.trim()).filter(Boolean).map((l) => {
      const i = l.lastIndexOf(":"); return { rotulo: (i < 0 ? l : l.slice(0, i)).trim(), valor: (i < 0 ? "" : l.slice(i + 1)).trim() };
    });
    else if (tipo === "fatias") v = lerPares(raw, "rotulo", "valor", true);
    else if (tipo === "eventos") v = lerPares(raw, "marcador", "descricao", false);
    else if (tipo === "mapa") v = raw.split("\n").map((s) => s.trim()).filter(Boolean).map((l) => {
      const i = l.indexOf(":");
      const id = (i < 0 ? "" : l.slice(0, i)).trim();
      const texto = (i < 0 ? l : l.slice(i + 1)).trim();
      return { id, texto };
    }).filter((x) => x.id && x.texto);
    else if (tipo === "tabela") v = raw.split("\n").map((s) => s.trim()).filter(Boolean).map((l) => l.split(";").map((s) => s.trim()));
    else if (tipo === "indice") { if (raw === "") { por(dados, chave, null); continue; } v = Math.max(0, parseInt(raw, 10) - 1); }
    else if (tipo === "numero") {
      if (raw === "") continue;
      const n = Number(raw.replace(",", "."));
      if (!Number.isFinite(n)) continue;
      v = n;
    }
    por(dados, chave, v);
  }
  return { template: tpl, dados };
}
function mostrarErro(r, e) { $("#ed-erro").hidden = false; $("#ed-erro").textContent = msgErroApi(e, "Dados inválidos."); }
async function recarregarCenas() {
  estado.editando = null; estado.editTemplate = null;
  await atualizar(estado.projetoAtual);
}
window.dividirCena = async (id) => {
  const r = await fetch(`/api/projetos/${estado.projetoAtual}/cenas/${id}/dividir`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  if (!r.ok) return mostrarErro(r, await r.json().catch(() => ({})));
  await recarregarCenas();
};
window.removerCena = async (id) => {
  if (!confirm(t("removeSceneConfirm"))) return;
  const r = await fetch(`/api/projetos/${estado.projetoAtual}/cenas/${id}`, { method: "DELETE" });
  if (!r.ok) return mostrarErro(r, await r.json().catch(() => ({})));
  await recarregarCenas();
};
window.salvarCena = async (id) => {
  const c0 = estado.aoVivo.cenas.find((x) => x.id === id);
  const ini = parseFloat($("#ed-inicio").value), fim = parseFloat($("#ed-fim").value);
  const mudouTempo = (!isNaN(ini) && Math.abs(ini - c0.inicio) > 0.05) || (!isNaN(fim) && Math.abs(fim - c0.fim) > 0.05);
  if (mudouTempo) {
    const rt = await fetch(`/api/projetos/${estado.projetoAtual}/cenas/${id}/tempos`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inicio: isNaN(ini) ? null : ini, fim: isNaN(fim) ? null : fim }) });
    if (!rt.ok) return mostrarErro(rt, await rt.json().catch(() => ({})));
  }
  const corpo = lerEditor();
  const r = await fetch(`/api/projetos/${estado.projetoAtual}/cenas/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
  if (!r.ok) return mostrarErro(r, await r.json().catch(() => ({})));
  await recarregarCenas();
};
window.rerenderizar = async () => {
  const erro = $("#av-fundo-erro");
  if (erro) erro.textContent = "";
  try {
    await aplicarPlanoFundosPendentes();
    estado.imagensProjeto = null;
    await regerar(estado.projetoAtual);
  } catch (e) {
    const msg = e?.message || "Não foi possível aplicar o plano de fundos antes da renderização.";
    if (erro) erro.textContent = msg;
    else alert(msg);
  }
};
function templateNome(id) {
  return ({ TextoCorrido: "Texto resumido", TituloImpacto: "Título de impacto", Pergunta: "Pergunta", Citacao: "Citação", NumeroDestaque: "Número em destaque",
    ComparacaoDoisLados: "Comparação", GraficoBarras: "Gráfico de barras", SetaTendencia: "Seta de tendência",
    ImagemDestaque: "Imagem em destaque", MidiaCheia: "Mídia em tela cheia", ListaAnimada: "Lista animada", FundoVazio: "Fundo",
    LegendaSincronizada: "Legenda sincronizada (centro)", TextoLongo: "Texto longo com destaque", GraficoPizza: "Gráfico de pizza", Timeline: "Linha do tempo",
    MapaMental: "Mapa mental conectado", MapaMentalCartoes: "Mapa mental (cartões + lista)", Planilha: "Planilha", CTAFinal: "Chamada final (CTA)" })[id] || id;
}
function fmtTempo(s) { const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`; }

window.regerar = async (id) => { await fetch(`/api/projetos/${id}/gerar`, { method: "POST" }); abrirProjeto(id); };
window.excluirProjeto = async (id, evt) => {
  evt.stopPropagation();
  if (!confirm(t("deleteProjectConfirm"))) return;
  const r = await fetch(`/api/projetos/${id}`, { method: "DELETE" });
  if (!r.ok) { alert(msgErroApi(await r.json().catch(() => null), t("cannotDeleteProject"))); return; }
  carregarBiblioteca();
};
function rotuloFormato(f) { return estado.opcoes?.formatos.find((x) => x.id === f)?.nome ?? f; }
function escapar(s) { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

// ---------- biblioteca ----------
async function carregarBiblioteca() {
  const itens = await (await fetch("/api/projetos")).json();
  if (!itens.length) { $("#lista").innerHTML = `<p class="vazio">${t("noVideosYet")}</p>`; return; }
  const idsAtuais = new Set(itens.map((p) => p.id));
  estado.filaSelecionados = new Set([...estado.filaSelecionados].filter((id) => idsAtuais.has(id)));
  $("#lista").innerHTML = itens.map((p) => {
    const tema = estado.opcoes?.temas.find((t) => t.id === p.tema_id);
    const nomeTema = tema ? temaTraduzido(tema).nome : "";
    const cor = tema ? `linear-gradient(135deg, ${tema.cores.fundo}, ${tema.cores.destaque})` : "var(--bg-3)";
    const prontos = Object.entries(p.formatos).filter(([, ok]) => ok).map(([f]) => rotuloFormato(f)).join(", ");
    const locale = linguaUI() === "pt" ? "pt-BR" : (linguaUI() === "es" ? "es-ES" : "en-US");
    const data = new Date(p.criado_em * 1000).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" });
    const rot = { concluido: t("ready"), rodando: t("generating"), erro: t("error"), novo: t("noVideo") }[p.estado] || p.estado;
    const checked = estado.filaSelecionados.has(p.id) ? "checked" : "";
    return `<div class="item" onclick="abrirProjeto('${p.id}')">
      <input type="checkbox" ${checked} onclick="event.stopPropagation()" onchange="toggleFilaProjeto('${p.id}', this.checked)" title="Selecionar para fila" />
      <div class="th" style="background:${cor}"></div>
      <div class="meta"><strong>${escapar(p.titulo)}</strong><br><small>${nomeTema} · ${data}${prontos ? " · " + prontos : ""}</small></div>
      <span class="estado ${p.estado}">${rot}</span>
      <button class="btn-excluir" onclick="excluirProjeto('${p.id}', event)" title="${t("deleteProjectTitle")}">×</button>
    </div>`;
  }).join("");
}
window.toggleFilaProjeto = (id, checked) => {
  if (checked) estado.filaSelecionados.add(id);
  else estado.filaSelecionados.delete(id);
};

function idsFilaSelecionados() {
  return [...estado.filaSelecionados];
}

async function acaoFila(url, body, okMsg) {
  const erro = $("#fila-erro");
  if (erro) erro.textContent = "";
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const msg = msgErroApi(await r.json().catch(() => null), r.statusText);
    if (erro) erro.textContent = msg;
    return null;
  }
  if (erro) erro.textContent = okMsg;
  return r.json().catch(() => ({}));
}

$("#fila-transcrever")?.addEventListener("click", async () => {
  const ids = idsFilaSelecionados();
  if (!ids.length) { $("#fila-erro").textContent = "Selecione projetos na lista."; return; }
  await acaoFila("/api/fila/transcrever", { projetos: ids }, `Transcrição em lote iniciada (${ids.length}).`);
  await carregarBiblioteca();
});

$("#fila-gerar")?.addEventListener("click", async () => {
  const ids = idsFilaSelecionados();
  if (!ids.length) { $("#fila-erro").textContent = "Selecione projetos na lista."; return; }
  await acaoFila("/api/fila/gerar", { projetos: ids }, `Fila de geração iniciada (${ids.length}).`);
  await carregarBiblioteca();
});

$("#fila-juntar")?.addEventListener("click", async () => {
  const ids = idsFilaSelecionados();
  if (!ids.length) { $("#fila-erro").textContent = "Selecione projetos na lista."; return; }
  const formato = String($("#fila-formato")?.value || "16x9");
  const nome = prompt("Nome do arquivo final (sem extensão):", "fila_final") || "fila_final";
  const resp = await acaoFila("/api/fila/juntar", { projetos: ids, formato, nome }, "Vídeo final combinado criado.");
  if (resp?.url) window.open(resp.url, "_blank");
});
window.abrirProjeto = abrirProjeto;

carregarOpcoes();
