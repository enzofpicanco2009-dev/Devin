const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const I18N = {
  pt: {
    navNew: "Novo vídeo",
    navLibrary: "Meus vídeos",
    selDeleteTheme: "Excluir tema selecionado",
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
    cannotDeleteProject: "Não foi possível excluir o projeto.",
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
    subtitleSyncText: "Mostrar palavras na tela acompanhando a narração",
    step5HintHtml: "Seu banco permanente de mídias. Marque as que podem aparecer neste vídeo: a IA recebe a <strong>descrição</strong> de cada uma para decidir quando usá-las.",
    addLibraryTitle: "Adicionar ao banco",
    addLibrarySub: "arraste ou clique · PNG, JPG, WEBP, SVG, MP4, WEBM, MOV",
    advancedOptionsSummary: "Opções avançadas",
    transcriptionQualityLabel: "Qualidade da transcrição",
    roteiroExternalTitle: "Outra IA (ChatGPT, Gemini...)",
    roteiroExternalDesc: "Transcrevo o áudio, você copia o prompt, cola o roteiro que a IA devolver e eu gero o vídeo.",
    roteiroLocalTitle: "IA local (Ollama)",
    iaFallbackLabel: "Roda no seu PC, sem custo.",
    iaUnavailableLabel: "Ollama não encontrado neste PC - se escolher, o roteiro cai em regras",
    roteiroRulesTitle: "Automático por regras",
    roteiroRulesDesc: "Sem IA: recorta a fala e escolhe o template por padrões (mais simples).",
    progressBack: "← Novo vídeo",
    externalScriptTitle: "Roteiro com outra IA",
    externalScriptHint: "1) Copie o prompt (já vem com a transcrição minutada). 2) Cole no ChatGPT, Gemini ou Claude. 3) Cole aqui o JSON que a IA responder e clique em Gerar.",
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
    cannotDeleteProject: "Could not delete project.",
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
    subtitleSyncText: "Show on-screen words following narration timing",
    step5HintHtml: "Your permanent media library. Select what can appear in this video: AI receives each media <strong>description</strong> to decide when to use it.",
    addLibraryTitle: "Add to library",
    addLibrarySub: "drag or click · PNG, JPG, WEBP, SVG, MP4, WEBM, MOV",
    advancedOptionsSummary: "Advanced options",
    transcriptionQualityLabel: "Transcription quality",
    roteiroExternalTitle: "External AI (ChatGPT, Gemini...)",
    roteiroExternalDesc: "I transcribe audio, you copy the prompt, paste the AI response script, and I generate the video.",
    roteiroLocalTitle: "Local AI (Ollama)",
    iaFallbackLabel: "Runs on your PC, no cost.",
    iaUnavailableLabel: "Ollama not found on this PC - if selected, script falls back to rules",
    roteiroRulesTitle: "Rules-based",
    roteiroRulesDesc: "No AI: split speech and choose template from patterns (simpler).",
    progressBack: "← New video",
    externalScriptTitle: "Script with external AI",
    externalScriptHint: "1) Copy prompt (already includes timestamped transcript). 2) Paste into ChatGPT, Gemini or Claude. 3) Paste returned JSON here and click Generate.",
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
    cannotDeleteProject: "No se pudo eliminar el proyecto.",
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
    subtitleSyncText: "Mostrar palabras en pantalla siguiendo la narración",
    step5HintHtml: "Tu biblioteca permanente de medios. Marca lo que puede aparecer en este video: la IA recibe la <strong>descripcion</strong> de cada medio para decidir cuando usarlo.",
    addLibraryTitle: "Agregar a la biblioteca",
    addLibrarySub: "arrastra o haz clic · PNG, JPG, WEBP, SVG, MP4, WEBM, MOV",
    advancedOptionsSummary: "Opciones avanzadas",
    transcriptionQualityLabel: "Calidad de transcripcion",
    roteiroExternalTitle: "Otra IA (ChatGPT, Gemini...)",
    roteiroExternalDesc: "Transcribo el audio, copias el prompt, pegas el guion de la IA y genero el video.",
    roteiroLocalTitle: "IA local (Ollama)",
    iaFallbackLabel: "Se ejecuta en tu PC, sin costo.",
    iaUnavailableLabel: "Ollama no encontrado en este PC - si se elige, el guion cae en reglas",
    roteiroRulesTitle: "Automatico por reglas",
    roteiroRulesDesc: "Sin IA: recorta el habla y elige la plantilla por patrones (mas simple).",
    progressBack: "← Nuevo video",
    externalScriptTitle: "Guion con otra IA",
    externalScriptHint: "1) Copia el prompt (ya incluye transcripcion con tiempos). 2) Pegalo en ChatGPT, Gemini o Claude. 3) Pega aqui el JSON de respuesta y haz clic en Generar.",
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
    if (st) st.textContent = t("roteiroLocalTitle");
  }
  if (roteiroCards[2]) {
    const st = $("strong", roteiroCards[2]);
    const sm = $("small", roteiroCards[2]);
    if (st) st.textContent = t("roteiroRulesTitle");
    if (sm) sm.textContent = t("roteiroRulesDesc");
  }

  setText(".voltar", "progressBack");
  setText("#externo .av-cab h2", "externalScriptTitle");
  setText("#ao-vivo .av-cab h2", "liveProductionTitle");
  setText("#externo > p.dica", "externalScriptHint");
  const extCabStrongs = $$("#externo .ext-cab strong");
  if (extCabStrongs[0]) extCabStrongs[0].textContent = t("externalMediaTitle");
  if (extCabStrongs[1]) extCabStrongs[1].textContent = t("timedTranscriptionTitle");
  if (extCabStrongs[2]) extCabStrongs[2].textContent = t("returnedScriptTitle");
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
}

const estado = { audio: null, canal: null, tema: null, estilo: null, paleta: null, fonte: null,
  banco: [], midiasSel: new Set(), midiasNovas: [], formatos: new Set(["16x9"]), opcoes: null, poll: null, roteiroModo: "externo", ritmo_edicao: "medio", legendas_ativas: true };

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
  carregarBanco();
  const { temas, estilos, formatos, paletas, fontes, ia, ritmos_edicao } = estado.opcoes;

  renderCanais();

  $("#paletas").innerHTML = `<button type="button" class="paleta sel" data-id=""><span class="sw auto"></span><small>${t("optionFromTheme")}</small></button>` +
    paletas.map((p) => `<button type="button" class="paleta" data-id="${p.id}" title="${p.nome}">
      <span class="sw" style="background:${p.cores.fundo}"><i style="background:${p.cores.destaque}"></i><i style="background:${p.cores.destaque_2}"></i><i style="background:${p.cores.texto}"></i></span><small>${p.nome}</small></button>`).join("");
  $("#fontes").innerHTML = `<button type="button" class="fonte sel" data-id=""><span>Aa</span><small>${t("optionFromTheme")}</small></button>` +
    fontes.map((f) => `<button type="button" class="fonte" data-id="${f.id}" style="font-family:${f.familia};font-weight:${f.peso}"><span>Aa</span><small>${f.nome}</small></button>`).join("");
  $("#paletas").addEventListener("click", (e) => { const b = e.target.closest(".paleta"); if (b) { estado.paleta = b.dataset.id || null; $$("#paletas .paleta").forEach((x) => x.classList.toggle("sel", x === b)); amostra(); } });
  $("#fontes").addEventListener("click", (e) => { const b = e.target.closest(".fonte"); if (b) { estado.fonte = b.dataset.id || null; $$("#fontes .fonte").forEach((x) => x.classList.toggle("sel", x === b)); amostra(); } });

  if (!ia.disponivel) { $("#ia-rotulo").textContent = t("iaUnavailableLabel"); }
  else $("#ia-rotulo").textContent = `${t("iaFallbackLabel")} (${ia.modelo})`;
  selecionarRoteiro(estado.roteiroModo);
  $("#roteiro-modos").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) selecionarRoteiro(c.dataset.id); });

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

  $("#temas").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) { selecionar("tema", c.dataset.id); amostra(); } });
  $("#temas").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-del-tema]");
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    const temaId = b.dataset.delTema;
    if (!confirm(t("deleteThemeConfirm"))) return;
    const r = await fetch(`/api/temas/${temaId}`, { method: "DELETE" });
    if (!r.ok) {
      alert((await r.json().catch(() => ({}))).detail || t("cannotDeleteTheme"));
      return;
    }
    await carregarOpcoes();
  });
  if ($("#estilos")) {
    $("#estilos").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) selecionar("estilo", c.dataset.id); });
  }
  $("#ritmos-edicao").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) { estado.ritmo_edicao = c.dataset.id; $$("#ritmos-edicao .card").forEach((x) => x.classList.toggle("sel", x === c)); } });
  const legendaCheckbox = $("#legendas-ativas");
  if (legendaCheckbox) {
    legendaCheckbox.checked = estado.legendas_ativas;
    legendaCheckbox.addEventListener("change", () => {
      estado.legendas_ativas = Boolean(legendaCheckbox.checked);
    });
  }
  $("#canais").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) selecionarCanal(c.dataset.id); });
  $("#formatos").addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    if (estado.formatos.has(c.dataset.id)) { if (estado.formatos.size > 1) estado.formatos.delete(c.dataset.id); }
    else estado.formatos.add(c.dataset.id);
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
      $("#nt-erro").textContent = (await r.json().catch(() => ({}))).detail || r.statusText;
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
}
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

  $("#tema-excluir").addEventListener("click", async () => {
    const temaId = estado.tema;
    if (!temaId) return;
    $("#tema-excluir-erro").textContent = "";
    if (!confirm(t("deleteThemeSelectedConfirm"))) return;
    const r = await fetch(`/api/temas/${temaId}`, { method: "DELETE" });
    if (!r.ok) {
      $("#tema-excluir-erro").textContent = (await r.json().catch(() => ({}))).detail || t("cannotDelete");
      return;
    }
    await carregarOpcoes();
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
  $$("#canais .card").forEach((x) => x.classList.toggle("sel", x.dataset.id === id));
  // herda o design do canal; o usuário pode trocar depois só para este vídeo
  selecionar("tema", c.tema_padrao);
  selecionar("estilo", c.estilo_padrao);
  estado.paleta = c.paleta_id || null; estado.fonte = c.fonte_id || null;
  $$("#paletas .paleta").forEach((x) => x.classList.toggle("sel", (x.dataset.id || null) === estado.paleta));
  $$("#fontes .fonte").forEach((x) => x.classList.toggle("sel", (x.dataset.id || null) === estado.fonte));
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
  if (!r.ok) { $("#nc-erro").textContent = (await r.json()).detail || r.statusText; return; }
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
}
$("#lista-midias").addEventListener("input", (e) => { const { i, k } = e.target.dataset; if (i !== undefined && k) estado.midiasNovas[+i][k] = e.target.value; });
$("#lista-midias").addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (b) { estado.midiasNovas.splice(+b.dataset.rm, 1); renderMidiasNovas(); } });

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
    if (!r.ok) alert((await r.json()).detail || t("cannotSave"));
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
  fd.append("midias_ids", [...estado.midiasSel].join(","));
  for (const m of estado.midiasNovas) fd.append("midias_novas", m.file, m.file.name);
  fd.append("midias_novas_meta", JSON.stringify(estado.midiasNovas.map((m) => ({ nome: m.nome, descricao: m.descricao }))));
  try {
    const r = await fetch("/api/projetos", { method: "POST", body: fd });
    if (!r.ok) throw new Error((await r.json()).detail || r.statusText);
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
}

// ---------- roteiro de outra IA ----------
async function copiar(texto, btn) {
  try { await navigator.clipboard.writeText(texto); }
  catch { const ta = document.createElement("textarea"); ta.value = texto; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
  const antes = btn.textContent; btn.textContent = t("copied"); setTimeout(() => (btn.textContent = antes), 1500);
}
$("#ext-copiar-transcricao").addEventListener("click", (e) => copiar($("#ext-transcricao").value, e.currentTarget));
$("#ext-copiar-prompt").addEventListener("click", (e) => copiar($("#ext-prompt").value, e.currentTarget));
$("#ext-gerar").addEventListener("click", async (e) => {
  const btn = e.currentTarget; const id = estado.projetoAtual;
  const texto = $("#ext-roteiro").value.trim();
  $("#ext-erro").textContent = "";
  if (!texto) { $("#ext-erro").textContent = t("pasteReturnedScript"); return; }
  btn.disabled = true;
  try {
    const r = await fetch(`/api/projetos/${id}/roteiro`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto }) });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText);
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
  if ($("#ext-transcricao").value !== ext.transcricao) $("#ext-transcricao").value = ext.transcricao;
  if ($("#ext-prompt").value !== ext.prompt) $("#ext-prompt").value = ext.prompt;
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
    ? midias.map((m) => `<span class="chip" title="${escapar(m.descricao || "")}">${escapar(m.nome)} <small>${m.tipo === "video" ? t("videoLabel") : t("imageLabel")}</small><button type="button" class="x" data-desvincular="${m.id}" title="${t("removeFromVideoTitle")}">×</button></span>`).join("")
    : `<small class="sb-pq">${t("noMediaInProject")}</small>`;
}
$("#ext-midias-lista").addEventListener("click", async (e) => {
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
  if (!r.ok) { alert((await r.json().catch(() => ({}))).detail || t("cannotAttach")); return; }
  b.remove();
  await renderMidiasExterno(); atualizar(estado.projetoAtual);
});

// ---------- progresso / resultado ----------
function abrirProjeto(id) {
  mostrar("progresso");
  estado.editando = null; estado.editTemplate = null; estado.imagensProjeto = null;
  $("#resultado").hidden = true; $("#prog-erro").hidden = true; $("#log").hidden = true; $("#ao-vivo").hidden = true; $("#externo").hidden = true;
  estado.projetoAtual = id;
  atualizar(id);
  estado.poll = setInterval(() => atualizar(id), 1500);
}

async function atualizar(id) {
  const r = await fetch(`/api/projetos/${id}`);
  if (!r.ok) { clearInterval(estado.poll); return; }
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
          <a class="btn" href="/api/projetos/${id}/video/${f}?download=1">${t("downloadMp4")}</a></div>
      </div>`).join("");
  }
  if (p.estado !== "rodando" && estado.poll) { clearInterval(estado.poll); estado.poll = null; }
}
// ---------- demonstração ao vivo ----------
function renderAoVivo(p) {
  const av = p.ao_vivo;
  if (!av) { $("#ao-vivo").hidden = true; return; }
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
  estado.aoVivo = av; estado.projetoAtual = p.id;
  $("#storyboard").innerHTML = av.cenas.map((c, i) => `
    <div class="sb-cena ${c.preview ? "pronta" : ""} ${estado.editando === c.id ? "editando" : ""}">
      <div class="sb-th">${c.preview ? `<img src="${c.preview}&t=${Date.now()}" alt="" />`
        : `<div class="sb-vazio ${renderizando ? "pulsa" : ""}"><span>${escapar(templateNome(c.template))}</span>${renderizando ? `<small>${t("rendering")}</small>` : (c.editada ? `<small>${t("renderToSee")}</small>` : "")}</div>`}</div>
      ${estado.editando === c.id ? editorCena(c) : `<div class="sb-info">
        <div class="sb-linha"><span class="sb-n">${i + 1}</span><span class="sb-t">${fmtTempo(c.inicio)} – ${fmtTempo(c.fim)}</span><span class="tag mini" title="${escapar(nomes[c.template]?.descricao || "")}">${escapar(templateNome(c.template))}</span>
          ${podeEditar ? `<button class="sb-editar" onclick="editarCena('${c.id}')" title="Trocar template ou texto">${t("edit")}</button>` : ""}</div>
        <strong class="sb-tela">${escapar(c.tela || "")}</strong>
        ${c.por_que ? `<small class="sb-pq">${escapar(c.por_que)}</small>` : ""}
        <details class="sb-fala" data-i="${i}" ${abertas.has(String(i)) ? "open" : ""}><summary>${t("originalSpeech")}</summary>${escapar(c.fala || "")}</details>
      </div>`}
    </div>`).join("");
  const editadas = av.cenas.filter((c) => c.editada && !c.preview).length;
  $("#av-rerender").hidden = !(podeEditar && editadas);
  $("#av-rerender-n").textContent = editadas === 1 ? t("oneEditedScene") : t("manyEditedScenes", editadas);
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
  MidiaCheia: [["midia", "Imagem ou vídeo do projeto", "midia"]],
  ImagemDestaque: [["imagem", "Imagem do projeto", "imagem"], ["texto", "Título sobre a imagem", "texto"], ["legenda", "Legenda", "texto"]],
  ListaAnimada: [["titulo", "Título", "texto"], ["itens", "Itens — um por linha (2 a 6)", "linhas"]],
};
function pegar(obj, caminho) { return caminho.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj); }
function por(obj, caminho, v) { const ks = caminho.split("."); let o = obj; ks.slice(0, -1).forEach((k) => { o[k] = o[k] || {}; o = o[k]; }); o[ks.at(-1)] = v; }

function editorCena(c) {
  const tpl = estado.editTemplate || c.template;
  const dados = estado.editTemplate && estado.editTemplate !== c.template
    ? { texto: c.dados?.texto || c.dados?.titulo || c.tela || "", titulo: c.dados?.titulo || c.dados?.texto || "" }
    : (c.dados || {});
  const tpls = (estado.opcoes?.templates || []).map((t) => t.id).filter((id) => CAMPOS[id]);
  const campos = (CAMPOS[tpl] || []).map(([chave, rotulo, tipo, opcoes]) => {
    const v = pegar(dados, chave);
    const nome = `data-campo="${chave}"`;
    let input;
    if (tipo === "longo") input = `<textarea class="campo" rows="2" ${nome}>${escapar(v || "")}</textarea>`;
    else if (tipo === "lista") input = `<input class="campo" ${nome} value="${escapar((v || []).join(", "))}" />`;
    else if (tipo === "linhas") input = `<textarea class="campo" rows="4" ${nome}>${escapar((v || []).join("\n"))}</textarea>`;
    else if (tipo === "barras") input = `<textarea class="campo" rows="4" ${nome}>${escapar((v || []).map((b) => `${b.rotulo}: ${b.valor}`).join("\n"))}</textarea>`;
    else if (tipo === "opcoes") input = `<select class="campo" ${nome}>${opcoes.map(([o, r]) => `<option value="${o}" ${v === o ? "selected" : ""}>${r}</option>`).join("")}</select>`;
    else if (tipo === "imagem" || tipo === "midia") {
      const imgs = (estado.imagensProjeto || []).filter((im) => tipo === "midia" || im.tipo !== "video");
      input = imgs.length ? `<select class="campo" ${nome}>${imgs.map((im) => `<option value="${im.id}" ${v === im.id ? "selected" : ""}>${escapar(im.nome || im.arquivo)}</option>`).join("")}</select>`
        : `<small class="sb-pq">Este projeto não tem ${tipo === "midia" ? "mídias" : "imagens"} do banco vinculadas.</small>`;
    } else input = `<input class="campo" ${nome} value="${escapar(String(v ?? ""))}" />`;
    return `<label class="ed-campo"><span>${rotulo}</span>${input}</label>`;
  }).join("");
  const idx = estado.aoVivo.cenas.findIndex((x) => x.id === c.id), ultima = idx === estado.aoVivo.cenas.length - 1;
  return `<div class="sb-info sb-editor" data-cena="${c.id}">
    <div class="ed-tempos">
      <label class="ed-campo"><span>Começa em (s)</span><input class="campo" type="number" step="0.1" id="ed-inicio" value="${c.inicio.toFixed(1)}" ${idx === 0 ? "disabled" : ""} /></label>
      <label class="ed-campo"><span>Termina em (s)</span><input class="campo" type="number" step="0.1" id="ed-fim" value="${c.fim.toFixed(1)}" ${ultima ? "disabled" : ""} /></label>
    </div>
    <small class="sb-pq">O áudio não muda; só o momento em que a tela troca para a cena vizinha.</small>
    <label class="ed-campo"><span>Template</span>
      <select class="campo" id="ed-template" onchange="trocarTemplateEdicao(this.value)">${tpls.map((id) => `<option value="${id}" ${id === tpl ? "selected" : ""}>${escapar(templateNome(id))}</option>`).join("")}</select></label>
    ${campos}
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
  for (const [chave, , tipo] of CAMPOS[tpl] || []) {
    const el = $(`#storyboard [data-campo="${chave}"]`);
    if (!el) continue;
    const raw = el.value.trim();
    let v = raw;
    if (tipo === "lista") v = raw.split(",").map((s) => s.trim()).filter(Boolean);
    else if (tipo === "linhas") v = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    else if (tipo === "barras") v = raw.split("\n").map((s) => s.trim()).filter(Boolean).map((l) => {
      const i = l.lastIndexOf(":"); return { rotulo: (i < 0 ? l : l.slice(0, i)).trim(), valor: (i < 0 ? "" : l.slice(i + 1)).trim() };
    });
    por(dados, chave, v);
  }
  return { template: tpl, dados };
}
function mostrarErro(r, e) { $("#ed-erro").hidden = false; $("#ed-erro").textContent = typeof e.detail === "string" ? e.detail : "Dados inválidos."; }
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
window.rerenderizar = () => { estado.imagensProjeto = null; regerar(estado.projetoAtual); };
function templateNome(id) {
  return ({ TextoCorrido: "Texto resumido", TituloImpacto: "Título de impacto", Pergunta: "Pergunta", Citacao: "Citação", NumeroDestaque: "Número em destaque",
    ComparacaoDoisLados: "Comparação", GraficoBarras: "Gráfico de barras", SetaTendencia: "Seta de tendência",
    ImagemDestaque: "Imagem em destaque", MidiaCheia: "Mídia em tela cheia", ListaAnimada: "Lista animada", FundoVazio: "Fundo" })[id] || id;
}
function fmtTempo(s) { const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`; }

window.regerar = async (id) => { await fetch(`/api/projetos/${id}/gerar`, { method: "POST" }); abrirProjeto(id); };
window.excluirProjeto = async (id, evt) => {
  evt.stopPropagation();
  if (!confirm(t("deleteProjectConfirm"))) return;
  const r = await fetch(`/api/projetos/${id}`, { method: "DELETE" });
  if (!r.ok) { alert((await r.json().catch(() => ({}))).detail || t("cannotDeleteProject")); return; }
  carregarBiblioteca();
};
function rotuloFormato(f) { return estado.opcoes?.formatos.find((x) => x.id === f)?.nome ?? f; }
function escapar(s) { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

// ---------- biblioteca ----------
async function carregarBiblioteca() {
  const itens = await (await fetch("/api/projetos")).json();
  if (!itens.length) { $("#lista").innerHTML = `<p class="vazio">${t("noVideosYet")}</p>`; return; }
  $("#lista").innerHTML = itens.map((p) => {
    const tema = estado.opcoes?.temas.find((t) => t.id === p.tema_id);
    const nomeTema = tema ? temaTraduzido(tema).nome : "";
    const cor = tema ? `linear-gradient(135deg, ${tema.cores.fundo}, ${tema.cores.destaque})` : "var(--bg-3)";
    const prontos = Object.entries(p.formatos).filter(([, ok]) => ok).map(([f]) => rotuloFormato(f)).join(", ");
    const locale = linguaUI() === "pt" ? "pt-BR" : (linguaUI() === "es" ? "es-ES" : "en-US");
    const data = new Date(p.criado_em * 1000).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" });
    const rot = { concluido: t("ready"), rodando: t("generating"), erro: t("error"), novo: t("noVideo") }[p.estado] || p.estado;
    return `<div class="item" onclick="abrirProjeto('${p.id}')">
      <div class="th" style="background:${cor}"></div>
      <div class="meta"><strong>${escapar(p.titulo)}</strong><br><small>${nomeTema} · ${data}${prontos ? " · " + prontos : ""}</small></div>
      <span class="estado ${p.estado}">${rot}</span>
      <button class="btn-excluir" onclick="excluirProjeto('${p.id}', event)" title="${t("deleteProjectTitle")}">×</button>
    </div>`;
  }).join("");
}
window.abrirProjeto = abrirProjeto;

carregarOpcoes();
