"use strict";
(self["webpackChunkprojeto_motion_remotion"] = self["webpackChunkprojeto_motion_remotion"] || []).push([["730"], {
8665(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  Qz: () => (WHISPER_WEBGPU_SAMPLE_RATE),
  cK: () => (canUseWhisperWebGpu),
  eW: () => (isWhisperModelCached),
  getAvailableModels: () => (getAvailableModels),
  ke: () => (transcribe),
  oA: () => (loadWhisperModel),
  q9: () => (removeWhisperModel),
  ve: () => (toCaptions),
  x4: () => (clearStaleModels),
  xO: () => (disposeWhisperModel)
});
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __require = /* @__PURE__ */ (/* unused pure expression or super */ null && (((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
})));

// src/can-use-whisper-webgpu.ts
var WhisperWebGpuUnsupportedReason;
((WhisperWebGpuUnsupportedReason2) => {
  WhisperWebGpuUnsupportedReason2["WindowUndefined"] = "window-undefined";
  WhisperWebGpuUnsupportedReason2["WebGpuUnavailable"] = "webgpu-unavailable";
  WhisperWebGpuUnsupportedReason2["WebGpuRequiresSecureContext"] = "webgpu-requires-secure-context";
})(WhisperWebGpuUnsupportedReason ||= {});
var canUseWhisperWebGpu = async () => {
  if (typeof window === "undefined") {
    return {
      supported: false,
      reason: "window-undefined" /* WindowUndefined */,
      detailedReason: "`window` is not defined. @remotion/whisper-webgpu is intended for browser environments."
    };
  }
  if (typeof navigator === "undefined" || !("gpu" in navigator)) {
    return {
      supported: false,
      reason: "webgpu-unavailable" /* WebGpuUnavailable */,
      detailedReason: "WebGPU is not available in this browser."
    };
  }
  if (!window.isSecureContext) {
    return {
      supported: false,
      reason: "webgpu-requires-secure-context" /* WebGpuRequiresSecureContext */,
      detailedReason: "WebGPU requires HTTPS in production or localhost during development."
    };
  }
  let adapter;
  try {
    const { gpu } = navigator;
    adapter = await gpu.requestAdapter();
  } catch {
    adapter = null;
  }
  if (!adapter) {
    return {
      supported: false,
      reason: "webgpu-unavailable" /* WebGpuUnavailable */,
      detailedReason: "No usable WebGPU adapter is available in this browser."
    };
  }
  return { supported: true };
};
// src/models.ts
var WHISPER_WEBGPU_MODELS = [
  "tiny",
  "tiny.en",
  "base",
  "base.en",
  "small",
  "small.en",
  "medium",
  "medium.en",
  "large-v3-turbo"
];
var MODEL_INFO = {
  tiny: {
    name: "tiny",
    modelId: "onnx-community/whisper-tiny_timestamped",
    parameters: 39000000,
    multilingual: true,
    supportsTranslation: true,
    webGpuDownloadSize: 119699015
  },
  "tiny.en": {
    name: "tiny.en",
    modelId: "onnx-community/whisper-tiny.en_timestamped",
    parameters: 39000000,
    multilingual: false,
    supportsTranslation: false,
    webGpuDownloadSize: 119697479
  },
  base: {
    name: "base",
    modelId: "onnx-community/whisper-base_timestamped",
    parameters: 74000000,
    multilingual: true,
    supportsTranslation: true,
    webGpuDownloadSize: 206190057
  },
  "base.en": {
    name: "base.en",
    modelId: "onnx-community/whisper-base.en_timestamped",
    parameters: 74000000,
    multilingual: false,
    supportsTranslation: false,
    webGpuDownloadSize: 206188009
  },
  small: {
    name: "small",
    modelId: "onnx-community/whisper-small_timestamped",
    parameters: 244000000,
    multilingual: true,
    supportsTranslation: true,
    webGpuDownloadSize: 586213010
  },
  "small.en": {
    name: "small.en",
    modelId: "onnx-community/whisper-small.en_timestamped",
    parameters: 244000000,
    multilingual: false,
    supportsTranslation: false,
    webGpuDownloadSize: 586209938
  },
  medium: {
    name: "medium",
    modelId: "onnx-community/whisper-medium_timestamped",
    parameters: 769000000,
    multilingual: true,
    supportsTranslation: true,
    webGpuDownloadSize: 1698508143
  },
  "medium.en": {
    name: "medium.en",
    modelId: "onnx-community/whisper-medium.en_timestamped",
    parameters: 769000000,
    multilingual: false,
    supportsTranslation: false,
    webGpuDownloadSize: 1698504047
  },
  "large-v3-turbo": {
    name: "large-v3-turbo",
    modelId: "onnx-community/whisper-large-v3-turbo_timestamped",
    parameters: 809000000,
    multilingual: true,
    supportsTranslation: false,
    webGpuDownloadSize: 1608611679
  }
};
var HOSTED_MODEL_IDS = {
  tiny: "whisper-tiny_timestamped-v1",
  "tiny.en": "whisper-tiny.en_timestamped-v1",
  base: "whisper-base_timestamped-v1",
  "base.en": "whisper-base.en_timestamped-v1",
  small: "whisper-small_timestamped-v1",
  "small.en": "whisper-small.en_timestamped-v1",
  medium: "whisper-medium_timestamped-v1",
  "medium.en": "whisper-medium.en_timestamped-v1",
  "large-v3-turbo": "whisper-large-v3-turbo_timestamped-v1"
};
var getAvailableModels = () => {
  return WHISPER_WEBGPU_MODELS.map((model) => ({ ...MODEL_INFO[model] }));
};
var getModelInfo = (model) => {
  return MODEL_INFO[model];
};
var getHostedModelId = (model) => {
  return HOSTED_MODEL_IDS[model];
};
var DEFAULT_WHISPER_WEBGPU_DTYPE = {
  encoder_model: "fp32",
  decoder_model_merged: "q4"
};
var LARGE_V3_TURBO_WHISPER_WEBGPU_DTYPE = {
  encoder_model: "fp16",
  decoder_model_merged: "q4"
};
var getWhisperWebGpuDtype = (model) => {
  return model === "large-v3-turbo" ? LARGE_V3_TURBO_WHISPER_WEBGPU_DTYPE : DEFAULT_WHISPER_WEBGPU_DTYPE;
};

// src/clear-stale-models.ts
var legacyModelUrlPrefixes = getAvailableModels().map(({ modelId }) => `https://huggingface.co/${modelId}/resolve/main/`);
var clearStaleModels = async () => {
  if (typeof caches === "undefined") {
    return;
  }
  const { env } = await __webpack_require__.e(/* import() */ "565").then(__webpack_require__.bind(__webpack_require__, 3676));
  let cache;
  let requests;
  try {
    cache = await caches.open(env.cacheKey);
    requests = await cache.keys();
  } catch {
    return;
  }
  await Promise.all(requests.map((request) => {
    if (legacyModelUrlPrefixes.some((prefix) => request.url.startsWith(prefix))) {
      return cache.delete(request);
    }
    return Promise.resolve(false);
  }));
};
// src/with-remotion-model-host.ts
var REMOTION_MODEL_HOST = "https://remotion.media/";
var REMOTION_MODEL_PATH_TEMPLATE = "models/{model}/";
var REMOTION_MODEL_HOST_STATE = Symbol.for("@remotion/whisper-webgpu/model-host-state");
var withRemotionModelHost = async (operation) => {
  const transformers = await __webpack_require__.e(/* import() */ "565").then(__webpack_require__.bind(__webpack_require__, 3676));
  const { env } = transformers;
  const environmentWithState = env;
  let state = environmentWithState[REMOTION_MODEL_HOST_STATE];
  if (!state) {
    state = {
      activeOperations: 0,
      previousRemoteConfiguration: null
    };
    Object.defineProperty(environmentWithState, REMOTION_MODEL_HOST_STATE, {
      value: state
    });
  }
  if (state.activeOperations === 0) {
    state.previousRemoteConfiguration = {
      remoteHost: env.remoteHost,
      remotePathTemplate: env.remotePathTemplate
    };
    env.remoteHost = REMOTION_MODEL_HOST;
    env.remotePathTemplate = REMOTION_MODEL_PATH_TEMPLATE;
  }
  state.activeOperations++;
  try {
    return await operation(transformers);
  } finally {
    state.activeOperations--;
    if (state.activeOperations === 0) {
      const configurationToRestore = state.previousRemoteConfiguration;
      state.previousRemoteConfiguration = null;
      if (configurationToRestore) {
        if (env.remoteHost === REMOTION_MODEL_HOST) {
          env.remoteHost = configurationToRestore.remoteHost;
        }
        if (env.remotePathTemplate === REMOTION_MODEL_PATH_TEMPLATE) {
          env.remotePathTemplate = configurationToRestore.remotePathTemplate;
        }
      }
    }
  }
};

// src/is-whisper-model-cached.ts
var isWhisperModelCached = ({
  model
}) => {
  return withRemotionModelHost(({ ModelRegistry }) => {
    return ModelRegistry.is_pipeline_cached("automatic-speech-recognition", getHostedModelId(model), {
      device: "webgpu",
      dtype: getWhisperWebGpuDtype(model)
    });
  });
};
// src/load-whisper-model.ts
var pipelines = new Map;
var getOrCreateWhisperPipeline = ({
  model,
  onProgress
}) => {
  const modelInfo = getModelInfo(model);
  const totalBytes = modelInfo.webGpuDownloadSize;
  const existing = pipelines.get(model);
  if (existing) {
    if (onProgress) {
      existing.progressListeners.add(onProgress);
      if (existing.latestProgress) {
        onProgress(existing.latestProgress);
      }
    }
    return {
      state: existing,
      alreadyLoaded: true,
      unsubscribe: () => {
        if (onProgress) {
          existing.progressListeners.delete(onProgress);
        }
      }
    };
  }
  const progressListeners = new Set;
  if (onProgress) {
    progressListeners.add(onProgress);
  }
  const state = {
    loading: Promise.resolve(null),
    activeTranscriptions: 0,
    onIdle: [],
    progressListeners,
    latestProgress: null
  };
  const emitProgress = (progress) => {
    state.latestProgress = progress;
    for (const listener of state.progressListeners) {
      listener(progress);
    }
  };
  const loading = Promise.resolve().then(() => {
    return withRemotionModelHost(({ pipeline }) => {
      emitProgress({
        status: "loading",
        file: null,
        progress: 0,
        loadedBytes: 0,
        totalBytes
      });
      const hostedModelId = getHostedModelId(model);
      const loadedByFile = new Map;
      let lastProgress = 0;
      let lastLoadedBytes = 0;
      return pipeline("automatic-speech-recognition", hostedModelId, {
        device: "webgpu",
        dtype: getWhisperWebGpuDtype(model),
        progress_callback: (event) => {
          const record = event;
          if (record.status === "progress" && typeof record.file === "string" && typeof record.loaded === "number" && Number.isFinite(record.loaded)) {
            loadedByFile.set(record.file, Math.max(loadedByFile.get(record.file) ?? 0, record.loaded));
            const loadedBytes = [...loadedByFile.values()].reduce((sum, loaded) => sum + loaded, 0);
            lastProgress = Math.max(lastProgress, Math.min(loadedBytes / totalBytes, 0.99));
            lastLoadedBytes = Math.max(lastLoadedBytes, loadedBytes);
            emitProgress({
              status: "loading",
              file: null,
              progress: lastProgress,
              loadedBytes: lastLoadedBytes,
              totalBytes
            });
          }
          if (record.status === "ready") {
            emitProgress({
              status: "ready",
              file: null,
              progress: 1,
              loadedBytes: Math.max(lastLoadedBytes, totalBytes),
              totalBytes
            });
          }
        }
      });
    });
  });
  state.loading = loading;
  pipelines.set(model, state);
  loading.catch(() => {
    if (pipelines.get(model) === state) {
      pipelines.delete(model);
    }
  });
  return {
    state,
    alreadyLoaded: false,
    unsubscribe: () => {
      if (onProgress) {
        state.progressListeners.delete(onProgress);
      }
    }
  };
};
var loadWhisperModel = async ({
  model,
  onProgress
}) => {
  const { state, alreadyLoaded, unsubscribe } = getOrCreateWhisperPipeline({
    model,
    onProgress
  });
  try {
    await state.loading;
  } finally {
    unsubscribe();
  }
  return { alreadyLoaded };
};
var withLoadedWhisperPipeline = async ({
  model,
  onProgress,
  run
}) => {
  const { state, unsubscribe } = getOrCreateWhisperPipeline({
    model,
    onProgress
  });
  state.activeTranscriptions++;
  try {
    const loaded = await state.loading;
    unsubscribe();
    return await run(loaded);
  } finally {
    unsubscribe();
    state.activeTranscriptions--;
    if (state.activeTranscriptions === 0) {
      for (const resolve of state.onIdle.splice(0)) {
        resolve();
      }
    }
  }
};
var disposeWhisperModel = async ({
  model
} = {}) => {
  const matching = [...pipelines.entries()].filter(([loadedModel]) => {
    return model === undefined || loadedModel === model;
  });
  for (const [key, state] of matching) {
    if (pipelines.get(key) === state) {
      pipelines.delete(key);
    }
  }
  await Promise.all(matching.map(async ([, state]) => {
    const loadedPipeline = await state.loading;
    if (state.activeTranscriptions > 0) {
      await new Promise((resolve) => {
        state.onIdle.push(resolve);
      });
    }
    await loadedPipeline.dispose();
  }));
};
// src/remove-whisper-model.ts
var removeWhisperModel = async ({
  model
}) => {
  await disposeWhisperModel({ model });
  await withRemotionModelHost(({ ModelRegistry }) => {
    return ModelRegistry.clear_pipeline_cache("automatic-speech-recognition", getHostedModelId(model), {
      device: "webgpu",
      dtype: getWhisperWebGpuDtype(model)
    });
  });
};
// src/resample-to-16khz.ts
var WHISPER_WEBGPU_SAMPLE_RATE = 16000;
var resampleTo16Khz = async ({
  file,
  onProgress
}) => {
  if (typeof OfflineAudioContext === "undefined") {
    throw new Error("OfflineAudioContext is not available in this environment.");
  }
  if (file.size === 0) {
    throw new Error("The audio file is empty.");
  }
  onProgress?.(0);
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(0.25);
  const decodingContext = new OfflineAudioContext(1, 1, 44100);
  const decoded = await decodingContext.decodeAudioData(arrayBuffer);
  onProgress?.(0.6);
  const length = Math.max(1, Math.ceil(decoded.duration * WHISPER_WEBGPU_SAMPLE_RATE));
  const offlineContext = new OfflineAudioContext(1, length, WHISPER_WEBGPU_SAMPLE_RATE);
  const source = offlineContext.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineContext.destination);
  source.start();
  const rendered = await offlineContext.startRendering();
  onProgress?.(1);
  return rendered.getChannelData(0).slice();
};
// src/to-captions.ts
var toCaptions = ({
  whisperWebGpuOutput
}) => {
  const words = Array.isArray(whisperWebGpuOutput) ? whisperWebGpuOutput : whisperWebGpuOutput.words;
  return {
    captions: words.map((word, index) => ({
      text: index === 0 ? word.text.trimStart() : word.text,
      startMs: Math.round(word.startInSeconds * 1000),
      endMs: Math.round(word.endInSeconds * 1000),
      timestampMs: Math.round((word.startInSeconds + word.endInSeconds) / 2 * 1000),
      confidence: null
    }))
  };
};
// src/transcribe.ts
var transcribe = async ({
  channelWaveform,
  model,
  language,
  task = "transcribe",
  chunkLengthInSeconds = 30,
  strideLengthInSeconds = 5,
  forceFullSequences = false,
  doSample = false,
  temperature = 1,
  topK = 50,
  repetitionPenalty = 1,
  noRepeatNgramSize = 0,
  onModelLoadProgress
}) => {
  if (channelWaveform.length === 0) {
    throw new Error("The audio waveform is empty.");
  }
  if (!Number.isFinite(chunkLengthInSeconds) || chunkLengthInSeconds <= 0) {
    throw new Error("chunkLengthInSeconds must be a finite number greater than 0.");
  }
  if (!Number.isFinite(strideLengthInSeconds) || strideLengthInSeconds < 0 || strideLengthInSeconds * 2 >= chunkLengthInSeconds) {
    throw new Error("strideLengthInSeconds must be a finite, non-negative number and less than half of chunkLengthInSeconds.");
  }
  if (typeof forceFullSequences !== "boolean") {
    throw new TypeError("forceFullSequences must be a boolean.");
  }
  if (typeof doSample !== "boolean") {
    throw new TypeError("doSample must be a boolean.");
  }
  if (!Number.isFinite(temperature) || temperature <= 0) {
    throw new TypeError("temperature must be a finite number greater than 0.");
  }
  if (!Number.isInteger(topK) || topK < 0) {
    throw new TypeError("topK must be a non-negative integer.");
  }
  if (!Number.isFinite(repetitionPenalty) || repetitionPenalty <= 0) {
    throw new TypeError("repetitionPenalty must be a finite number greater than 0.");
  }
  if (!Number.isInteger(noRepeatNgramSize) || noRepeatNgramSize < 0) {
    throw new TypeError("noRepeatNgramSize must be a non-negative integer.");
  }
  if (task !== "transcribe" && task !== "translate") {
    throw new TypeError('task must be either "transcribe" or "translate".');
  }
  const { multilingual, supportsTranslation } = getModelInfo(model);
  if (task === "translate" && !supportsTranslation) {
    throw new Error(`The model "${model}" does not support translation.`);
  }
  if (multilingual && (language === undefined || language === "auto")) {
    throw new Error(`The language option is required for the multilingual model "${model}" because automatic language detection is not supported.`);
  }
  if (!multilingual && language !== undefined && language !== "auto" && language !== "en" && language !== "english") {
    throw new Error(`The English-only model "${model}" does not support the language "${language}".`);
  }
  const output = await withLoadedWhisperPipeline({
    model,
    onProgress: onModelLoadProgress,
    run: async (transcriber) => {
      return await transcriber(channelWaveform, {
        return_timestamps: "word",
        chunk_length_s: chunkLengthInSeconds,
        stride_length_s: strideLengthInSeconds,
        force_full_sequences: forceFullSequences,
        do_sample: doSample,
        temperature,
        top_k: topK,
        repetition_penalty: repetitionPenalty,
        no_repeat_ngram_size: noRepeatNgramSize,
        ...multilingual ? { language, task } : {}
      });
    }
  });
  if (!output.chunks) {
    throw new Error("The model did not return word-level timestamps. Use one of the timestamped models returned by getAvailableModels().");
  }
  const audioDuration = channelWaveform.length / 16000;
  const starts = output.chunks.map((chunk) => {
    const start = chunk.timestamp[0];
    if (start === null || !Number.isFinite(start)) {
      throw new Error(`The model returned an invalid timestamp for "${chunk.text}".`);
    }
    return Math.max(0, Math.min(start, audioDuration));
  });
  const words = output.chunks.map((chunk, index) => {
    const start = starts[index];
    const modelEnd = chunk.timestamp[1];
    const nextStart = starts[index + 1];
    const fallbackEnd = nextStart === undefined || nextStart < start ? audioDuration : nextStart;
    const end = Math.max(start, Math.min(modelEnd !== null && Number.isFinite(modelEnd) && modelEnd >= start ? modelEnd : fallbackEnd, audioDuration));
    return {
      text: index === 0 ? chunk.text.trimStart() : chunk.text,
      startInSeconds: start,
      endInSeconds: end
    };
  });
  return {
    text: output.text.trimStart(),
    words,
    model
  };
};



},

}]);
//# sourceMappingURL=730.bundle.js.map