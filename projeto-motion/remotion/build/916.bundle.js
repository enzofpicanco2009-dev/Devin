"use strict";
(self["webpackChunkprojeto_motion_remotion"] = self["webpackChunkprojeto_motion_remotion"] || []).push([["916"], {
3080(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  P: () => (ModelManager)
});
/* import */ var _index_xhe2m2qr_mjs__rspack_import_0 = __webpack_require__(3662);
/* import */ var _index_jg13hf2g_mjs__rspack_import_1 = __webpack_require__(9605);
/* import */ var _remotion_studio_shared__rspack_import_2 = __webpack_require__(3872);
/* import */ var react__rspack_import_3 = __webpack_require__(6540);
/* import */ var react_jsx_runtime__rspack_import_4 = __webpack_require__(4848);



// src/components/ModelManager.tsx



var modelPanel = {
  ..._index_xhe2m2qr_mjs__rspack_import_0/* .optionsPanel */.Z6,
  flexDirection: "column"
};
var hiddenPanel = { display: "none" };
var container = {
  boxSizing: "border-box",
  flex: 1,
  fontFamily: "sans-serif",
  minWidth: 0,
  padding: "16px 16px 0",
  width: "100%"
};
var flushContainer = {
  ...container,
  padding: "16px 0 0"
};
var descriptionStyle = {
  color: _index_jg13hf2g_mjs__rspack_import_1/* .LIGHT_TEXT */.hf,
  fontSize: 13,
  lineHeight: 1.5,
  margin: 0,
  whiteSpace: "pre-line"
};
var list = { marginTop: 14 };
var modelRow = {
  alignItems: "center",
  borderBottom: _index_jg13hf2g_mjs__rspack_import_1/* .BORDER_WHITE_ALPHA_12 */.WY,
  display: "flex",
  gap: 10,
  minHeight: 38,
  padding: "0 10px"
};
var lastModelRow = {
  ...modelRow,
  borderBottom: "none"
};
var statusIcon = {
  flexShrink: 0,
  height: 14,
  width: 14
};
var modelName = {
  color: _index_jg13hf2g_mjs__rspack_import_1/* .WHITE */.UE,
  flex: 1,
  fontFamily: "monospace",
  fontSize: 13,
  lineHeight: 1.4,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};
var status = {
  color: _index_jg13hf2g_mjs__rspack_import_1/* .LIGHT_TEXT */.hf,
  fontSize: 12,
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1.4,
  whiteSpace: "nowrap"
};
var actionIcon = { height: 14, width: 14 };
var actionSlot = {
  alignItems: "center",
  display: "inline-flex",
  flexShrink: 0,
  height: 24,
  justifyContent: "center",
  width: 24
};
var ModelManager = ({
  ariaLabel,
  availableModels,
  description,
  indent,
  isModelCached,
  loadModel,
  prepare,
  removeModel,
  visible
}) => {
  const mounted = (0,react__rspack_import_3.useRef)(true);
  const initialized = (0,react__rspack_import_3.useRef)(false);
  const [cachedModels, setCachedModels] = (0,react__rspack_import_3.useState)(null);
  const [actionState, setActionState] = (0,react__rspack_import_3.useState)({
    type: "idle"
  });
  const [cacheCheckError, setCacheCheckError] = (0,react__rspack_import_3.useState)(null);
  (0,react__rspack_import_3.useEffect)(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  (0,react__rspack_import_3.useEffect)(() => {
    if (!visible || initialized.current) {
      return;
    }
    initialized.current = true;
    Promise.resolve().then(() => prepare?.()).then(() => Promise.all(availableModels.map(async ({ name }) => await isModelCached(name) ? name : null))).then((models) => {
      if (mounted.current) {
        const cached = new Set;
        for (const model of models) {
          if (model !== null) {
            cached.add(model);
          }
        }
        setCachedModels(cached);
      }
    }).catch((error) => {
      if (mounted.current) {
        setCachedModels(new Set);
        setCacheCheckError(error instanceof Error ? error.message : String(error));
      }
    });
  }, [availableModels, isModelCached, prepare, visible]);
  const downloadModel = (0,react__rspack_import_3.useCallback)((model) => {
    setActionState({ type: "downloading", model, progress: 0 });
    loadModel(model, (progress) => {
      if (mounted.current) {
        setActionState({ type: "downloading", model, progress });
      }
    }).then(() => {
      if (mounted.current) {
        setCachedModels((current) => new Set([...current ?? [], model]));
        setActionState({ type: "idle" });
      }
    }).catch((error) => {
      if (mounted.current) {
        setActionState({
          type: "error",
          model,
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }, [loadModel]);
  const remove = (0,react__rspack_import_3.useCallback)((model) => {
    setActionState({ type: "removing", model });
    removeModel(model).then(() => {
      if (mounted.current) {
        setCachedModels((current) => {
          const next = new Set(current ?? []);
          next.delete(model);
          return next;
        });
        setActionState({ type: "idle" });
      }
    }).catch((error) => {
      if (mounted.current) {
        setActionState({
          type: "error",
          model,
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }, [removeModel]);
  const renderDownloadIcon = (0,react__rspack_import_3.useCallback)((color) => {
    return /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)(_index_xhe2m2qr_mjs__rspack_import_0/* .CloudDownloadIcon */.$w, {
      color,
      style: actionIcon
    });
  }, []);
  const renderRemoveIcon = (0,react__rspack_import_3.useCallback)((color) => {
    return /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)(_index_xhe2m2qr_mjs__rspack_import_0/* .TrashIcon */.uc, {
      color,
      style: actionIcon
    });
  }, []);
  const actionInProgress = actionState.type === "downloading" || actionState.type === "removing";
  return /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)("div", {
    style: visible ? modelPanel : hiddenPanel,
    className: _index_xhe2m2qr_mjs__rspack_import_0/* .VERTICAL_SCROLLBAR_CLASSNAME */.uV,
    children: /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsxs)("div", {
      style: indent ? container : flushContainer,
      children: [
        description === null ? null : /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)("p", {
          style: descriptionStyle,
          children: description
        }),
        cacheCheckError ? /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)(_index_xhe2m2qr_mjs__rspack_import_0/* .ValidationMessage */.Xl, {
          align: "flex-start",
          message: cacheCheckError,
          type: "error"
        }) : null,
        /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)("div", {
          style: description === null ? undefined : list,
          role: "list",
          "aria-label": ariaLabel,
          children: availableModels.map((model, index) => {
            const cached = cachedModels?.has(model.name) ?? false;
            const processingThisModel = actionState.type !== "idle" && actionState.type !== "error" && actionState.model === model.name;
            const progress = actionState.type === "downloading" && actionState.model === model.name ? actionState.progress : null;
            const modelStatus = processingThisModel ? actionState.type === "removing" ? "Removing…" : `Downloading${progress === null ? "…" : ` ${Math.round(progress * 100)}%`}` : actionState.type === "error" && actionState.model === model.name ? actionState.message : (0,_remotion_studio_shared__rspack_import_2/* .formatBytes */.z3)(model.webGpuDownloadSize);
            return /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsxs)("div", {
              role: "listitem",
              style: index === availableModels.length - 1 ? lastModelRow : modelRow,
              children: [
                /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)("span", {
                  style: modelName,
                  children: model.name
                }),
                /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)("span", {
                  style: status,
                  title: modelStatus,
                  children: modelStatus
                }),
                cached ? /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)(_index_xhe2m2qr_mjs__rspack_import_0/* .CheckCircleFilled */.Pk, {
                  "aria-hidden": true,
                  style: { ...statusIcon, fill: _index_jg13hf2g_mjs__rspack_import_1/* .BLUE */.ft }
                }) : null,
                processingThisModel ? /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)("span", {
                  style: actionSlot,
                  children: /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)(_index_xhe2m2qr_mjs__rspack_import_0/* .Spinner */.y$, {
                    duration: 0.5,
                    size: 14
                  })
                }) : cached ? /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)(_index_xhe2m2qr_mjs__rspack_import_0/* .InlineAction */.gs, {
                  disabled: actionInProgress,
                  onClick: () => remove(model.name),
                  renderAction: renderRemoveIcon,
                  title: `Remove ${model.name}`,
                  variant: null
                }) : /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_4.jsx)(_index_xhe2m2qr_mjs__rspack_import_0/* .InlineAction */.gs, {
                  disabled: cachedModels === null || actionInProgress,
                  onClick: () => downloadModel(model.name),
                  renderAction: renderDownloadIcon,
                  title: `Download ${model.name}`,
                  variant: null
                })
              ]
            }, model.name);
          })
        })
      ]
    })
  });
};




},
9431(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  B: () => (Models)
});
/* import */ var _index_1x7bsdh6_mjs__rspack_import_0 = __webpack_require__(3080);
/* import */ var _remotion_whisper_webgpu__rspack_import_1 = __webpack_require__(8665);
/* import */ var react__rspack_import_2 = __webpack_require__(6540);
/* import */ var react_jsx_runtime__rspack_import_3 = __webpack_require__(4848);


// src/components/Transcription/Models.tsx



var AVAILABLE_MODELS = (0,_remotion_whisper_webgpu__rspack_import_1.getAvailableModels)();
var Models = ({ description, indent, visible }) => {
  const isModelCached = (0,react__rspack_import_2.useCallback)((model) => (0,_remotion_whisper_webgpu__rspack_import_1/* .isWhisperModelCached */.eW)({ model }), []);
  const loadModel = (0,react__rspack_import_2.useCallback)((model, onProgress) => (0,_remotion_whisper_webgpu__rspack_import_1/* .loadWhisperModel */.oA)({
    model,
    onProgress: (progress) => onProgress(progress.progress)
  }), []);
  const removeModel = (0,react__rspack_import_2.useCallback)((model) => (0,_remotion_whisper_webgpu__rspack_import_1/* .removeWhisperModel */.q9)({ model }), []);
  return /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_3.jsx)(_index_1x7bsdh6_mjs__rspack_import_0/* .ModelManager */.P, {
    ariaLabel: "Whisper models",
    availableModels: AVAILABLE_MODELS,
    description,
    indent,
    isModelCached,
    loadModel,
    prepare: _remotion_whisper_webgpu__rspack_import_1/* .clearStaleModels */.x4,
    removeModel,
    visible
  });
};




},
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
//# sourceMappingURL=916.bundle.js.map