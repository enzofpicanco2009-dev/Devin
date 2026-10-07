"use strict";
(self["webpackChunkprojeto_motion_remotion"] = self["webpackChunkprojeto_motion_remotion"] || []).push([["677"], {
4(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  Bj: () => (canUseVideoMatting),
  VK: () => (isVideoMattingModelCached),
  getAvailableModels: () => (getAvailableModels),
  jb: () => (separateVideoLayers),
  nk: () => (loadVideoMattingModel),
  oe: () => (disposeVideoMattingModel),
  t$: () => (removeVideoMattingModel)
});
/* import */ var mediabunny__rspack_import_5 = __webpack_require__(4709);
/* import */ var mediabunny__rspack_import_6 = __webpack_require__(2030);
/* import */ var mediabunny__rspack_import_7 = __webpack_require__(5608);
/* import */ var mediabunny__rspack_import_4 = __webpack_require__(5374);
/* import */ var mediabunny__rspack_import_3 = __webpack_require__(388);
/* import */ var mediabunny__rspack_import_8 = __webpack_require__(8792);
/* import */ var mediabunny__rspack_import_2 = __webpack_require__(6832);
/* import */ var mediabunny__rspack_import_0 = __webpack_require__(917);
/* import */ var mediabunny__rspack_import_1 = __webpack_require__(9917);
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

// src/models.ts
var VIDEO_MATTING_MODELS = ["modnet", "ben2-base"];
var MODEL_INFO = {
  modnet: {
    name: "modnet",
    modelId: "Xenova/modnet",
    purpose: "person",
    webGpuDownloadSize: 25889088,
    revision: "fa2fa546052fba4c08921230a26cc69a333fca12",
    dtype: "fp32",
    requiresShaderF16: false
  },
  "ben2-base": {
    name: "ben2-base",
    modelId: "onnx-community/BEN2-ONNX",
    purpose: "general",
    webGpuDownloadSize: 219122146,
    revision: "c552aa82688edce09f0ac9d2e31ad53d9d629010",
    dtype: "fp16",
    requiresShaderF16: true
  }
};
var HOSTED_MODEL_IDS = {
  modnet: "modnet-v1",
  "ben2-base": "ben2-base-v1"
};
var getAvailableModels = () => {
  return VIDEO_MATTING_MODELS.map((model) => {
    const {
      revision: _revision,
      dtype: _dtype,
      requiresShaderF16: _requiresShaderF16,
      ...info
    } = MODEL_INFO[model];
    return { ...info };
  });
};
var getVideoMattingModelInfo = (model) => {
  if (!Object.hasOwn(MODEL_INFO, model)) {
    throw new Error(`Unsupported video matting model "${model}". Available models: ${VIDEO_MATTING_MODELS.join(", ")}.`);
  }
  return MODEL_INFO[model];
};
var getHostedVideoMattingModelId = (model) => {
  return HOSTED_MODEL_IDS[model];
};

// src/can-use-video-matting.ts
var VideoMattingUnsupportedReason;
((VideoMattingUnsupportedReason2) => {
  VideoMattingUnsupportedReason2["WindowUndefined"] = "window-undefined";
  VideoMattingUnsupportedReason2["WebGpuUnavailable"] = "webgpu-unavailable";
  VideoMattingUnsupportedReason2["WebGpuRequiresSecureContext"] = "webgpu-requires-secure-context";
  VideoMattingUnsupportedReason2["ShaderF16Unavailable"] = "shader-f16-unavailable";
})(VideoMattingUnsupportedReason ||= {});
var canUseVideoMatting = async ({
  model = "modnet"
} = {}) => {
  const modelInfo = getVideoMattingModelInfo(model);
  if (typeof window === "undefined" && typeof OffscreenCanvas === "undefined") {
    return {
      supported: false,
      reason: "window-undefined" /* WindowUndefined */,
      detailedReason: "No browser window or worker canvas environment is available. @remotion/video-matting is intended for browser environments."
    };
  }
  const isSecureContext = typeof window === "undefined" ? globalThis.isSecureContext : window.isSecureContext;
  if (isSecureContext === false) {
    return {
      supported: false,
      reason: "webgpu-requires-secure-context" /* WebGpuRequiresSecureContext */,
      detailedReason: "WebGPU requires HTTPS in production or localhost during development."
    };
  }
  if (typeof navigator === "undefined" || !("gpu" in navigator)) {
    return {
      supported: false,
      reason: "webgpu-unavailable" /* WebGpuUnavailable */,
      detailedReason: "WebGPU is not available in this browser."
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
  if (modelInfo.requiresShaderF16 && adapter.features?.has("shader-f16") !== true) {
    return {
      supported: false,
      reason: "shader-f16-unavailable" /* ShaderF16Unavailable */,
      detailedReason: `The video matting model "${model}" requires the WebGPU shader-f16 feature, which is unavailable on this adapter.`
    };
  }
  return { supported: true };
};
// src/with-remotion-model-host.ts
var REMOTION_MODEL_HOST = "https://remotion.media/";
var REMOTION_MODEL_PATH_TEMPLATE = "models/{model}/";
var REMOTION_MODEL_HOST_STATE = Symbol.for("@remotion/transformers/model-host-state");
var WHISPER_MODEL_HOST_STATE = Symbol.for("@remotion/whisper-webgpu/model-host-state");
var withRemotionModelHost = async (operation) => {
  const transformers = await __webpack_require__.e(/* import() */ "565").then(__webpack_require__.bind(__webpack_require__, 3676));
  const { env } = transformers;
  const environmentWithState = env;
  let state = environmentWithState[REMOTION_MODEL_HOST_STATE] ?? environmentWithState[WHISPER_MODEL_HOST_STATE];
  if (!state) {
    state = {
      activeOperations: 0,
      previousRemoteConfiguration: null
    };
  }
  if (!environmentWithState[REMOTION_MODEL_HOST_STATE]) {
    Object.defineProperty(environmentWithState, REMOTION_MODEL_HOST_STATE, {
      value: state
    });
  }
  if (!environmentWithState[WHISPER_MODEL_HOST_STATE]) {
    Object.defineProperty(environmentWithState, WHISPER_MODEL_HOST_STATE, {
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

// src/load-video-matting-model.ts
var pipelines = new Map;
var disposals = new Map;
var notifyProgress = (state, progress) => {
  state.lastProgress = progress;
  for (const listener of state.progressListeners) {
    try {
      listener(progress);
    } catch {}
  }
};
var notifyIfIdle = (state) => {
  if (state.pendingUses === 0 && state.activeUses === 0) {
    for (const resolve of state.onIdle.splice(0)) {
      resolve();
    }
  }
};
var waitForLoadingOrAbort = ({
  loading,
  signal
}) => {
  if (signal === null) {
    return loading;
  }
  if (signal.aborted) {
    return Promise.reject(signal.reason);
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener("abort", onAbort);
      reject(signal.reason);
    };
    signal.addEventListener("abort", onAbort, { once: true });
    loading.then((value) => {
      signal.removeEventListener("abort", onAbort);
      resolve(value);
    }, (error) => {
      signal.removeEventListener("abort", onAbort);
      reject(error);
    });
  });
};
var getOrCreateVideoMattingPipeline = ({
  model
}) => {
  const modelInfo = getVideoMattingModelInfo(model);
  const existing = pipelines.get(model);
  if (existing) {
    return { state: existing, alreadyLoaded: true };
  }
  const state = {
    loading: Promise.resolve(null),
    pendingUses: 0,
    activeUses: 0,
    onIdle: [],
    progressListeners: new Set,
    lastProgress: null
  };
  const pendingDisposal = disposals.get(model) ?? null;
  state.loading = Promise.resolve().then(async () => {
    if (pendingDisposal !== null) {
      await pendingDisposal;
    }
    return withRemotionModelHost(async ({
      AutoModelForImageSegmentation,
      AutoProcessor,
      BackgroundRemovalPipeline
    }) => {
      const hostedModelId = getHostedVideoMattingModelId(model);
      const totalBytes = modelInfo.webGpuDownloadSize;
      const loadedByFile = new Map;
      let lastProgress = 0;
      let lastLoadedBytes = 0;
      notifyProgress(state, {
        status: "loading",
        file: null,
        progress: 0,
        loadedBytes: 0,
        totalBytes
      });
      const pretrainedOptions = {
        device: "webgpu",
        dtype: modelInfo.dtype,
        progress_callback: (event) => {
          const record = event;
          if (record.status === "progress" && typeof record.file === "string" && typeof record.loaded === "number" && Number.isFinite(record.loaded)) {
            loadedByFile.set(record.file, Math.max(loadedByFile.get(record.file) ?? 0, record.loaded));
            const loadedBytes = [...loadedByFile.values()].reduce((sum, loaded) => sum + loaded, 0);
            lastProgress = Math.max(lastProgress, Math.min(loadedBytes / totalBytes, 0.99));
            lastLoadedBytes = Math.max(lastLoadedBytes, loadedBytes);
            notifyProgress(state, {
              status: "loading",
              file: null,
              progress: lastProgress,
              loadedBytes: Math.min(lastLoadedBytes, totalBytes),
              totalBytes
            });
          }
        }
      };
      const transformerProcessor = await AutoProcessor.from_pretrained(hostedModelId, pretrainedOptions);
      const transformerModel = await AutoModelForImageSegmentation.from_pretrained(hostedModelId, pretrainedOptions);
      let transformerPipeline = null;
      let returnedPipeline = false;
      try {
        transformerPipeline = new BackgroundRemovalPipeline({
          task: "background-removal",
          model: transformerModel,
          processor: transformerProcessor
        });
        const loadedTransformerPipeline = transformerPipeline;
        notifyProgress(state, {
          status: "ready",
          file: null,
          progress: 1,
          loadedBytes: totalBytes,
          totalBytes
        });
        const loadedPipeline = {
          run: async (image) => {
            const result = await loadedTransformerPipeline(image);
            if (result.channels !== 4) {
              throw new Error(`The video matting model "${model}" returned ${result.channels} channels instead of RGBA.`);
            }
            const data = result.data instanceof Uint8ClampedArray && result.data.buffer instanceof ArrayBuffer ? result.data : new Uint8ClampedArray(result.data);
            return {
              data,
              width: result.width,
              height: result.height,
              channels: 4
            };
          },
          dispose: () => loadedTransformerPipeline.dispose()
        };
        returnedPipeline = true;
        return loadedPipeline;
      } finally {
        if (!returnedPipeline) {
          if (transformerPipeline === null) {
            await transformerModel.dispose();
          } else {
            await transformerPipeline.dispose();
          }
        }
      }
    });
  });
  pipelines.set(model, state);
  state.loading.catch(() => {
    if (pipelines.get(model) === state) {
      pipelines.delete(model);
    }
  });
  return { state, alreadyLoaded: false };
};
var subscribeToProgress = (state, onProgress) => {
  if (!onProgress) {
    return () => {
      return;
    };
  }
  const listener = (progress) => {
    onProgress(progress);
  };
  state.progressListeners.add(listener);
  if (state.lastProgress) {
    try {
      listener(state.lastProgress);
    } catch {}
  }
  return () => {
    state.progressListeners.delete(listener);
  };
};
var loadVideoMattingModel = async ({
  model,
  onProgress
}) => {
  const { state, alreadyLoaded } = getOrCreateVideoMattingPipeline({ model });
  const unsubscribe = subscribeToProgress(state, onProgress);
  try {
    await state.loading;
  } finally {
    unsubscribe();
  }
  return { alreadyLoaded };
};
var withLoadedVideoMattingPipeline = async ({
  model,
  onProgress,
  signal,
  run
}) => {
  const { state } = getOrCreateVideoMattingPipeline({ model });
  const unsubscribe = subscribeToProgress(state, onProgress);
  state.pendingUses++;
  let isActive = false;
  try {
    const loaded = await waitForLoadingOrAbort({
      loading: state.loading,
      signal
    });
    state.pendingUses--;
    state.activeUses++;
    isActive = true;
    return await run(loaded.run);
  } finally {
    unsubscribe();
    if (isActive) {
      state.activeUses--;
    } else {
      state.pendingUses--;
    }
    notifyIfIdle(state);
  }
};
var disposeVideoMattingModel = async ({
  model
} = {}) => {
  if (model !== undefined) {
    getVideoMattingModelInfo(model);
  }
  const matching = [...pipelines.entries()].filter(([loadedModel]) => {
    return model === undefined || loadedModel === model;
  });
  for (const [key, state] of matching) {
    if (pipelines.get(key) === state) {
      pipelines.delete(key);
    }
  }
  const pending = new Map;
  for (const [key, disposal] of disposals) {
    if (model === undefined || model === key) {
      pending.set(key, disposal);
    }
  }
  for (const [key, state] of matching) {
    const previousDisposal = disposals.get(key) ?? Promise.resolve();
    const disposal = previousDisposal.then(async () => {
      const loadedPipeline = await state.loading;
      if (state.pendingUses > 0 || state.activeUses > 0) {
        await new Promise((resolve) => {
          state.onIdle.push(resolve);
        });
      }
      await loadedPipeline.dispose();
    });
    const disposalBarrier = disposal.then(() => {
      return;
    }, () => {
      return;
    });
    disposals.set(key, disposalBarrier);
    disposalBarrier.then(() => {
      if (disposals.get(key) === disposalBarrier) {
        disposals.delete(key);
      }
    });
    pending.set(key, disposal);
  }
  await Promise.all(pending.values());
};
// src/is-video-matting-model-cached.ts
var isVideoMattingModelCached = ({
  model
}) => {
  const modelInfo = getVideoMattingModelInfo(model);
  return withRemotionModelHost(({ ModelRegistry }) => {
    return ModelRegistry.is_pipeline_cached("background-removal", getHostedVideoMattingModelId(model), {
      device: "webgpu",
      dtype: modelInfo.dtype
    });
  });
};
// src/remove-video-matting-model.ts
var removeVideoMattingModel = async ({
  model
}) => {
  const modelInfo = getVideoMattingModelInfo(model);
  await disposeVideoMattingModel({ model });
  await withRemotionModelHost(({ ModelRegistry }) => {
    return ModelRegistry.clear_pipeline_cache("background-removal", getHostedVideoMattingModelId(model), {
      device: "webgpu",
      dtype: modelInfo.dtype
    });
  });
};
// src/separate-video-layers.ts


// src/create-video-layer-output.ts

// package.json
var version = "4.0.523";

// src/web-fs-target.ts
var filePrefix = "__remotion_video_matting:";
var sessionId = null;
var getSessionPrefix = () => {
  if (sessionId === null) {
    sessionId = crypto.randomUUID();
  }
  return `${filePrefix}${sessionId}:`;
};
var canUseWebFsWriter = async () => {
  if (typeof navigator === "undefined" || !("storage" in navigator)) {
    return false;
  }
  if (!("getDirectory" in navigator.storage)) {
    return false;
  }
  const probeName = `${filePrefix}probe:${crypto.randomUUID()}`;
  try {
    const directoryHandle = await navigator.storage.getDirectory();
    const fileHandle = await directoryHandle.getFileHandle(probeName, {
      create: true
    });
    const writable = await fileHandle.createWritable();
    await writable.close();
    await directoryHandle.removeEntry(probeName);
    return true;
  } catch {
    try {
      const directoryHandle = await navigator.storage.getDirectory();
      await directoryHandle.removeEntry(probeName);
    } catch {}
    return false;
  }
};
var createWebFsVideoLayerTarget = async () => {
  const directoryHandle = await navigator.storage.getDirectory();
  const filename = `${getSessionPrefix()}${crypto.randomUUID()}`;
  const fileHandle = await directoryHandle.getFileHandle(filename, {
    create: true
  });
  let writable;
  try {
    writable = await fileHandle.createWritable();
  } catch (error) {
    try {
      await directoryHandle.removeEntry(filename);
    } catch {}
    throw error;
  }
  let closed = false;
  let removed = false;
  let removalPromise = null;
  const close = async () => {
    if (closed) {
      return;
    }
    closed = true;
    await writable.close();
  };
  const abort = async (reason) => {
    if (closed) {
      return;
    }
    closed = true;
    await writable.abort(reason);
  };
  const stream = new WritableStream({
    async write(chunk) {
      await writable.seek(chunk.position);
      await writable.write(chunk);
    },
    close,
    abort
  });
  const getBlob = async () => {
    const currentFileHandle = await directoryHandle.getFileHandle(filename);
    return currentFileHandle.getFile();
  };
  const remove = () => {
    if (removed) {
      return Promise.resolve();
    }
    if (removalPromise === null) {
      removalPromise = (async () => {
        try {
          await abort(new Error("Video layer output was discarded"));
        } catch {}
        try {
          await directoryHandle.removeEntry(filename);
        } catch (error) {
          if (typeof error !== "object" || error === null || !("name" in error) || error.name !== "NotFoundError") {
            throw error;
          }
        }
        removed = true;
      })().catch((error) => {
        removalPromise = null;
        throw error;
      });
    }
    return removalPromise;
  };
  return { stream, getBlob, remove };
};

// src/create-video-layer-output.ts
var createVideoLayerOutput = async ({
  format,
  options
}) => {
  if (options?.outputTarget !== undefined && options.outputWritable !== undefined) {
    throw new Error("outputTarget and outputWritable cannot both be specified for a video layer");
  }
  let webFsTarget = null;
  let target;
  let outputMode;
  const outputWritable = options?.outputWritable;
  let outputWritableWriter = null;
  let outputWritableClosePromise = null;
  let outputWritableAbortPromise = null;
  let outputWritableWasClosed = false;
  const getOutputWritableWriter = () => {
    if (outputWritable === undefined) {
      throw new Error("Expected a caller-provided output WritableStream");
    }
    outputWritableWriter ??= outputWritable.getWriter();
    return outputWritableWriter;
  };
  const releaseOutputWritableWriter = () => {
    if (outputWritableWriter === null) {
      return;
    }
    outputWritableWriter.releaseLock();
    outputWritableWriter = null;
  };
  const closeOutputWritable = () => {
    if (outputWritable === undefined || outputWritableWasClosed) {
      return Promise.resolve();
    }
    if (outputWritableAbortPromise !== null) {
      return outputWritableAbortPromise;
    }
    if (outputWritableClosePromise === null) {
      const writer = getOutputWritableWriter();
      outputWritableClosePromise = (async () => {
        try {
          await writer.close();
          outputWritableWasClosed = true;
        } finally {
          releaseOutputWritableWriter();
        }
      })();
    }
    return outputWritableClosePromise;
  };
  const abortOutputWritable = (reason) => {
    if (outputWritable === undefined || outputWritableWasClosed) {
      return Promise.resolve();
    }
    if (outputWritableAbortPromise === null) {
      const writer = getOutputWritableWriter();
      outputWritableAbortPromise = (async () => {
        try {
          await writer.abort(reason);
        } finally {
          releaseOutputWritableWriter();
        }
      })();
    }
    return outputWritableAbortPromise;
  };
  if (outputWritable !== undefined) {
    target = new mediabunny__rspack_import_0/* .StreamTarget */.Kw(new WritableStream({
      write: (chunk) => getOutputWritableWriter().write(chunk),
      close: () => Promise.resolve(),
      abort: (reason) => abortOutputWritable(reason)
    }));
    outputMode = "writable";
  } else {
    const outputTarget = options?.outputTarget ?? (await canUseWebFsWriter() ? "web-fs" : "arraybuffer");
    if (outputTarget === "web-fs") {
      webFsTarget = await createWebFsVideoLayerTarget();
      target = new mediabunny__rspack_import_0/* .StreamTarget */.Kw(webFsTarget.stream);
      outputMode = "web-fs";
    } else {
      target = new mediabunny__rspack_import_0/* .BufferTarget */.Sn;
      outputMode = "arraybuffer";
    }
  }
  const output = new mediabunny__rspack_import_1/* .Output */.k7({ format, target });
  output.setMetadataTags({
    comment: `Separated with @remotion/video-matting ${version}`
  });
  let finalizationPromise = null;
  let cancellationPromise = null;
  let finalized = false;
  let cancellationRequested = false;
  const discardWithReason = (reason) => {
    if (webFsTarget !== null) {
      return webFsTarget.remove();
    }
    return abortOutputWritable(reason);
  };
  const discard = () => discardWithReason(new Error("Video layer output was discarded"));
  const cancelMediabunnyOutput = async () => {
    if (output.state === "canceled" || output.state === "finalized") {
      return;
    }
    await output.cancel();
  };
  const cancel = () => {
    if (finalized) {
      return Promise.resolve();
    }
    if (cancellationPromise !== null) {
      return cancellationPromise;
    }
    cancellationRequested = true;
    cancellationPromise = (async () => {
      const discardPromise = discardWithReason(new Error("Video layer output was canceled"));
      let cancellationError = null;
      try {
        await cancelMediabunnyOutput();
      } catch (error) {
        cancellationError = error;
      }
      if (finalizationPromise !== null) {
        try {
          await finalizationPromise;
        } catch {}
      }
      try {
        await discardPromise;
      } catch (error) {
        cancellationError ??= error;
      }
      if (cancellationError !== null) {
        throw cancellationError;
      }
    })();
    return cancellationPromise;
  };
  const finalize = () => {
    if (cancellationRequested) {
      return Promise.reject(new Error("Video layer output was canceled"));
    }
    if (finalizationPromise !== null) {
      return finalizationPromise;
    }
    finalizationPromise = (async () => {
      try {
        await output.finalize();
        if (cancellationRequested) {
          throw new Error("Video layer output was canceled");
        }
        const mimeType = await output.getMimeType();
        if (cancellationRequested) {
          throw new Error("Video layer output was canceled");
        }
        await closeOutputWritable();
        if (cancellationRequested) {
          throw new Error("Video layer output was canceled");
        }
        finalized = true;
        if (outputMode === "writable") {
          return {
            dispose: () => Promise.resolve(),
            getBlob: () => Promise.reject(new Error("getBlob() is unavailable when outputWritable is used"))
          };
        }
        if (outputMode === "web-fs") {
          if (webFsTarget === null) {
            throw new Error("Expected an OPFS-backed output target");
          }
          let blobPromise = null;
          return {
            dispose: discard,
            getBlob: () => {
              blobPromise ??= (async () => {
                const file = await webFsTarget.getBlob();
                const buffer = await file.arrayBuffer();
                return new Blob([buffer], { type: mimeType });
              })();
              return blobPromise;
            }
          };
        }
        if (!(target instanceof mediabunny__rspack_import_0/* .BufferTarget */.Sn)) {
          throw new Error("Expected an in-memory output target");
        }
        return {
          dispose: () => Promise.resolve(),
          getBlob: () => {
            if (target.buffer === null) {
              return Promise.reject(new Error("The resulting buffer is empty"));
            }
            return Promise.resolve(new Blob([target.buffer], { type: mimeType }));
          }
        };
      } catch (error) {
        await Promise.allSettled([cancelMediabunnyOutput(), discard()]);
        throw error;
      }
    })();
    return finalizationPromise;
  };
  return { output, finalize, cancel, discard };
};

// src/prepare-audio.ts

var prepareAudio = async ({
  input,
  baseOutput,
  foregroundOutput,
  destination,
  videoStartTimestamp,
  videoEndTimestamp,
  audioQuality,
  forceTranscode
}) => {
  if (!Number.isFinite(videoStartTimestamp)) {
    throw new TypeError("videoStartTimestamp must be a finite number.");
  }
  if (!Number.isFinite(videoEndTimestamp)) {
    throw new TypeError("videoEndTimestamp must be a finite number.");
  }
  if (videoEndTimestamp < videoStartTimestamp) {
    throw new RangeError("videoEndTimestamp must be greater than or equal to videoStartTimestamp.");
  }
  if (typeof forceTranscode !== "boolean") {
    throw new TypeError("forceTranscode must be a boolean.");
  }
  if (destination === "none") {
    return {
      prime: () => Promise.resolve(),
      writeAudioUntil: () => Promise.resolve(),
      finishAudio: () => Promise.resolve(),
      cancel: () => Promise.resolve()
    };
  }
  const audioTrack = await input.getPrimaryAudioTrack();
  if (audioTrack === null) {
    return {
      prime: () => Promise.resolve(),
      writeAudioUntil: () => Promise.resolve(),
      finishAudio: () => Promise.resolve(),
      cancel: () => Promise.resolve()
    };
  }
  const [firstAudioTimestamp, audioEndTimestamp] = await Promise.all([
    audioTrack.getFirstTimestamp(),
    audioTrack.computeDuration()
  ]);
  if (firstAudioTimestamp >= videoEndTimestamp || audioEndTimestamp <= videoStartTimestamp) {
    return {
      prime: () => Promise.resolve(),
      writeAudioUntil: () => Promise.resolve(),
      finishAudio: () => Promise.resolve(),
      cancel: () => Promise.resolve()
    };
  }
  const outputs = destination === "both" ? [baseOutput, foregroundOutput] : destination === "base" ? [baseOutput] : [foregroundOutput];
  const sourceCodec = await audioTrack.getCodec();
  const canCopyPackets = !forceTranscode && sourceCodec === "opus" && firstAudioTimestamp >= videoStartTimestamp;
  let lastWriteTimestamp = -Infinity;
  let primed = false;
  let finished = false;
  let canceled = false;
  if (canCopyPackets) {
    const decoderConfig = await audioTrack.getDecoderConfig();
    const packetSources = outputs.map((output) => {
      const source = new mediabunny__rspack_import_2/* .EncodedAudioPacketSource */.m("opus");
      output.addAudioTrack(source, {
        decoderConfig: decoderConfig ?? undefined
      });
      return source;
    });
    const packetIterator = new mediabunny__rspack_import_3/* .EncodedPacketSink */.kQ(audioTrack).packets();
    let pendingPacket;
    let packetIteratorDone = false;
    let packetSourcesClosed = false;
    const closePacketSources = () => {
      if (packetSourcesClosed || outputs.some((output) => output.state !== "started")) {
        return;
      }
      packetSourcesClosed = true;
      for (const source of packetSources) {
        source.close();
      }
    };
    const stopPacketIterator = async () => {
      if (packetIteratorDone) {
        return;
      }
      packetIteratorDone = true;
      try {
        await packetIterator.return(undefined);
      } catch {}
    };
    const writePacketsUntil = async ({
      outputTimestamp,
      writeAtLeastOne
    }) => {
      let packetsWritten = 0;
      while (!packetIteratorDone) {
        if (pendingPacket === undefined) {
          const next = await packetIterator.next();
          if (next.done) {
            packetIteratorDone = true;
            closePacketSources();
            return;
          }
          pendingPacket = next.value;
        }
        if (pendingPacket.timestamp >= videoEndTimestamp) {
          pendingPacket = undefined;
          await stopPacketIterator();
          closePacketSources();
          return;
        }
        const rebasedTimestamp = pendingPacket.timestamp - videoStartTimestamp;
        if (rebasedTimestamp > outputTimestamp && (!writeAtLeastOne || packetsWritten > 0)) {
          return;
        }
        const packet = pendingPacket.clone({
          timestamp: rebasedTimestamp
        });
        pendingPacket = undefined;
        const metadata = {
          decoderConfig: decoderConfig ?? undefined
        };
        await Promise.all(packetSources.map((source) => source.add(packet, metadata)));
        packetsWritten++;
        if (writeAtLeastOne) {
          return;
        }
      }
    };
    return {
      prime: async () => {
        if (primed || finished || canceled) {
          return;
        }
        primed = true;
        await writePacketsUntil({
          outputTimestamp: 0,
          writeAtLeastOne: true
        });
      },
      writeAudioUntil: async (outputTimestamp) => {
        if (!Number.isFinite(outputTimestamp) || outputTimestamp < 0) {
          throw new TypeError("outputTimestamp must be a finite, non-negative number.");
        }
        if (outputTimestamp < lastWriteTimestamp) {
          throw new RangeError("writeAudioUntil() timestamps must be monotonically increasing.");
        }
        if (finished || canceled) {
          return;
        }
        lastWriteTimestamp = outputTimestamp;
        await writePacketsUntil({
          outputTimestamp: Math.min(outputTimestamp, videoEndTimestamp - videoStartTimestamp),
          writeAtLeastOne: false
        });
      },
      finishAudio: async () => {
        if (finished || canceled) {
          return;
        }
        finished = true;
        try {
          await writePacketsUntil({
            outputTimestamp: videoEndTimestamp - videoStartTimestamp,
            writeAtLeastOne: false
          });
        } finally {
          await stopPacketIterator();
          closePacketSources();
        }
      },
      cancel: async () => {
        if (finished || canceled) {
          return;
        }
        canceled = true;
        pendingPacket = undefined;
        await stopPacketIterator();
      }
    };
  }
  if (!await audioTrack.canDecode()) {
    throw new Error(`The primary audio track uses ${sourceCodec ?? "an unknown codec"}, which ` + "cannot be decoded in this browser. The audio cannot be converted to Opus.");
  }
  const originalNumberOfChannels = await audioTrack.getNumberOfChannels();
  const originalSampleRate = await audioTrack.getSampleRate();
  const quality = audioQuality ?? new mediabunny__rspack_import_4/* .Quality */.en("medium");
  let outputNumberOfChannels = originalNumberOfChannels;
  let outputSampleRate = originalSampleRate;
  if (!await (0,mediabunny__rspack_import_4/* .canEncodeAudio */.Tc)("opus", {
    numberOfChannels: outputNumberOfChannels,
    sampleRate: outputSampleRate,
    quality
  })) {
    outputNumberOfChannels = Math.min(originalNumberOfChannels, 2);
    outputSampleRate = 48000;
    if (!await (0,mediabunny__rspack_import_4/* .canEncodeAudio */.Tc)("opus", {
      numberOfChannels: outputNumberOfChannels,
      sampleRate: outputSampleRate,
      quality
    })) {
      throw new Error("The primary audio track must be transcoded to Opus, but this browser " + "does not support a compatible Opus encoder.");
    }
  }
  const sampleSources = outputs.map((output) => {
    const source = new mediabunny__rspack_import_2/* .AudioSampleSource */.Ii({
      codec: "opus",
      quality,
      transform: {
        numberOfChannels: outputNumberOfChannels === originalNumberOfChannels ? undefined : outputNumberOfChannels,
        sampleRate: outputSampleRate === originalSampleRate ? undefined : outputSampleRate
      }
    });
    output.addAudioTrack(source);
    return source;
  });
  const sampleIterator = new mediabunny__rspack_import_3/* .AudioSampleSink */.qw(audioTrack).samples(videoStartTimestamp, videoEndTimestamp);
  let pendingSample;
  let iteratorDone = false;
  let sourcesClosed = false;
  const closeSources = () => {
    if (sourcesClosed || outputs.some((output) => output.state !== "started")) {
      return;
    }
    sourcesClosed = true;
    for (const source of sampleSources) {
      source.close();
    }
  };
  const stopSampleIterator = async () => {
    if (iteratorDone) {
      return;
    }
    iteratorDone = true;
    try {
      await sampleIterator.return(undefined);
    } catch {}
  };
  const writeUntil = async ({
    outputTimestamp,
    writeAtLeastOne
  }) => {
    let samplesWritten = 0;
    while (!iteratorDone) {
      if (pendingSample === undefined) {
        const next = await sampleIterator.next();
        if (next.done) {
          iteratorDone = true;
          closeSources();
          return;
        }
        pendingSample = next.value;
      }
      const effectiveTimestamp = Math.max(pendingSample.timestamp, videoStartTimestamp) - videoStartTimestamp;
      if (effectiveTimestamp > outputTimestamp && (!writeAtLeastOne || samplesWritten > 0)) {
        return;
      }
      const originalSample = pendingSample;
      pendingSample = undefined;
      let startFrame = 0;
      let endFrame = originalSample.numberOfFrames;
      if (originalSample.timestamp < videoStartTimestamp) {
        startFrame = Math.max(0, Math.min(originalSample.numberOfFrames, Math.round((videoStartTimestamp - originalSample.timestamp) * originalSample.sampleRate)));
      }
      if (originalSample.timestamp + originalSample.duration > videoEndTimestamp) {
        endFrame = Math.max(0, Math.min(originalSample.numberOfFrames, Math.round((videoEndTimestamp - originalSample.timestamp) * originalSample.sampleRate)));
      }
      if (endFrame <= startFrame) {
        originalSample.close();
        continue;
      }
      const sample = startFrame === 0 && endFrame === originalSample.numberOfFrames ? originalSample : originalSample.trim(startFrame, endFrame);
      if (sample !== originalSample) {
        originalSample.close();
      }
      sample.setTimestamp(Math.max(0, sample.timestamp - videoStartTimestamp));
      const samples = sampleSources.map((_, index) => index === sampleSources.length - 1 ? sample : sample.clone());
      try {
        await Promise.all(sampleSources.map((source, index) => source.add(samples[index])));
      } finally {
        for (const sampleToClose of samples) {
          sampleToClose.close();
        }
      }
      samplesWritten++;
      if (writeAtLeastOne) {
        return;
      }
    }
  };
  return {
    prime: async () => {
      if (primed || finished || canceled) {
        return;
      }
      primed = true;
      await writeUntil({ outputTimestamp: 0, writeAtLeastOne: true });
    },
    writeAudioUntil: async (outputTimestamp) => {
      if (!Number.isFinite(outputTimestamp) || outputTimestamp < 0) {
        throw new TypeError("outputTimestamp must be a finite, non-negative number.");
      }
      if (outputTimestamp < lastWriteTimestamp) {
        throw new RangeError("writeAudioUntil() timestamps must be monotonically increasing.");
      }
      if (finished || canceled) {
        return;
      }
      lastWriteTimestamp = outputTimestamp;
      await writeUntil({
        outputTimestamp: Math.min(outputTimestamp, videoEndTimestamp - videoStartTimestamp),
        writeAtLeastOne: false
      });
    },
    finishAudio: async () => {
      if (finished || canceled) {
        return;
      }
      finished = true;
      try {
        await writeUntil({
          outputTimestamp: videoEndTimestamp - videoStartTimestamp,
          writeAtLeastOne: false
        });
      } finally {
        pendingSample?.close();
        pendingSample = undefined;
        await stopSampleIterator();
        closeSources();
      }
    },
    cancel: async () => {
      if (finished || canceled) {
        return;
      }
      canceled = true;
      try {
        pendingSample?.close();
      } catch {}
      pendingSample = undefined;
      await stopSampleIterator();
    }
  };
};

// src/video-matting-canvas.ts
var createVideoMattingCanvas = ({
  width,
  height
}) => {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  throw new Error("Could not create a canvas. This API must run in a browser with OffscreenCanvas or the DOM available.");
};
var getVideoMattingCanvasContext = (canvas) => {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Could not create a 2D canvas context.");
  }
  return context;
};
var drawOpaqueBaseFrame = ({
  context,
  source,
  width,
  height
}) => {
  context.save();
  context.globalCompositeOperation = "copy";
  context.fillStyle = "#000000";
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = "source-over";
  context.drawImage(source, 0, 0, width, height);
  context.restore();
};
var drawForegroundFrame = ({
  context,
  result,
  source,
  targetWidth,
  targetHeight
}) => {
  if (!Number.isInteger(result.width) || result.width <= 0 || !Number.isInteger(result.height) || result.height <= 0) {
    throw new Error("The video matting model returned invalid dimensions.");
  }
  const expectedLength = result.width * result.height * result.channels;
  if (result.data.length !== expectedLength) {
    throw new Error(`The video matting model returned ${result.data.length} bytes, but ${expectedLength} RGBA bytes were expected.`);
  }
  const imageData = new ImageData(result.data, result.width, result.height);
  context.clearRect(0, 0, targetWidth, targetHeight);
  if (result.width === targetWidth && result.height === targetHeight) {
    context.putImageData(imageData, 0, 0);
  } else {
    const intermediateCanvas = createVideoMattingCanvas({
      width: result.width,
      height: result.height
    });
    const intermediateContext = getVideoMattingCanvasContext(intermediateCanvas);
    intermediateContext.putImageData(imageData, 0, 0);
    context.drawImage(intermediateCanvas, 0, 0, targetWidth, targetHeight);
  }
  context.save();
  context.globalCompositeOperation = "destination-in";
  context.drawImage(source, 0, 0, targetWidth, targetHeight);
  context.restore();
};

// src/video-matting-quality.ts

var VIDEO_MATTING_QUALITIES = [
  "very-low",
  "low",
  "medium",
  "high",
  "very-high"
];
var resolveVideoMattingQuality = (value) => {
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value <= 0) {
      throw new TypeError("A numeric bitrate must be a positive integer.");
    }
    return new mediabunny__rspack_import_4/* .Quality */.en({ bitrate: value });
  }
  if (!VIDEO_MATTING_QUALITIES.includes(value)) {
    throw new TypeError(`The bitrate quality must be one of ${VIDEO_MATTING_QUALITIES.join(", ")}.`);
  }
  return new mediabunny__rspack_import_4/* .Quality */.en({ quality: value, preferBitrate: true });
};

// src/video-timing.ts
var rebaseVideoTimestamp = ({
  timestamp,
  firstVideoTimestamp
}) => {
  if (!Number.isFinite(timestamp) || !Number.isFinite(firstVideoTimestamp)) {
    throw new TypeError("Video timestamps must be finite numbers.");
  }
  const rebased = timestamp - firstVideoTimestamp;
  if (rebased < -Number.EPSILON * 16) {
    throw new Error("Video frames must be in presentation order.");
  }
  return Math.max(0, rebased);
};
var getClippedVideoFrameTiming = ({
  timestamp,
  duration,
  videoStartTimestamp,
  videoEndTimestamp
}) => {
  if (!Number.isFinite(timestamp)) {
    throw new TypeError("The video frame timestamp must be finite.");
  }
  if (!Number.isFinite(duration) || duration < 0) {
    throw new TypeError("The video frame duration must be non-negative.");
  }
  if (!Number.isFinite(videoStartTimestamp) || !Number.isFinite(videoEndTimestamp) || videoEndTimestamp < videoStartTimestamp) {
    throw new TypeError("The video presentation range is invalid.");
  }
  const visibleStart = Math.max(timestamp, videoStartTimestamp);
  const visibleEnd = Math.min(timestamp + duration, videoEndTimestamp);
  if (visibleEnd <= visibleStart) {
    return null;
  }
  return {
    timestamp: visibleStart - videoStartTimestamp,
    duration: visibleEnd - visibleStart
  };
};
var getVideoProcessingProgress = ({
  timestamp,
  duration,
  firstVideoTimestamp,
  durationInSeconds
}) => {
  if (!Number.isFinite(duration) || duration < 0) {
    throw new TypeError("Video frame durations must be non-negative.");
  }
  if (!Number.isFinite(durationInSeconds) || durationInSeconds < 0) {
    throw new TypeError("The video duration must be non-negative.");
  }
  const rebasedTimestamp = rebaseVideoTimestamp({
    timestamp,
    firstVideoTimestamp
  });
  const processedDurationInSeconds = Math.min(durationInSeconds, Math.max(0, rebasedTimestamp + duration));
  return {
    processedDurationInSeconds,
    progress: durationInSeconds === 0 ? 1 : Math.min(1, processedDurationInSeconds / durationInSeconds)
  };
};

// src/separate-video-layers.ts
var AUDIO_DESTINATIONS = [
  "base",
  "foreground",
  "both",
  "none"
];
var createAbortError = (signal) => {
  if (signal.reason !== undefined) {
    return signal.reason;
  }
  const error = new Error("Video layer separation was aborted.");
  error.name = "AbortError";
  return error;
};
var throwIfAborted = (signal) => {
  if (signal?.aborted) {
    throw createAbortError(signal);
  }
};
var validateLayerOutputOptions = ({
  layer,
  output
}) => {
  if (output === undefined) {
    return;
  }
  if (!output || typeof output !== "object" || Array.isArray(output)) {
    throw new TypeError(`outputs.${layer} must be an object.`);
  }
  if (output.outputTarget !== undefined && output.outputTarget !== "arraybuffer" && output.outputTarget !== "web-fs") {
    throw new TypeError(`outputs.${layer}.outputTarget must be arraybuffer or web-fs.`);
  }
  if (output.outputTarget !== undefined && output.outputWritable !== undefined) {
    throw new TypeError(`outputs.${layer} cannot specify both outputTarget and outputWritable.`);
  }
  if (output.outputWritable !== undefined) {
    if (typeof WritableStream === "undefined" || !(output.outputWritable instanceof WritableStream)) {
      throw new TypeError(`outputs.${layer}.outputWritable must be a WritableStream.`);
    }
    if (output.outputWritable.locked) {
      throw new TypeError(`outputs.${layer}.outputWritable must not already be locked.`);
    }
  }
};
var validateOptions = (options) => {
  if (!options || typeof options !== "object") {
    throw new TypeError("separateVideoLayers() expects an options object.");
  }
  const isBlob = typeof Blob !== "undefined" && options.src instanceof Blob;
  const isUrl = options.src instanceof URL;
  if (typeof options.src !== "string" && !isUrl && !isBlob) {
    throw new TypeError("src must be a string, URL, or Blob.");
  }
  if (typeof options.src === "string" && options.src.length === 0) {
    throw new TypeError("src must not be an empty string.");
  }
  if (options.outputs !== undefined && (!options.outputs || typeof options.outputs !== "object" || Array.isArray(options.outputs))) {
    throw new TypeError("outputs must be an object.");
  }
  validateLayerOutputOptions({
    layer: "base",
    output: options.outputs?.base
  });
  validateLayerOutputOptions({
    layer: "foreground",
    output: options.outputs?.foreground
  });
  if (options.outputs?.base?.outputWritable !== undefined && options.outputs.base.outputWritable === options.outputs.foreground?.outputWritable) {
    throw new TypeError("outputs.base and outputs.foreground must not use the same outputWritable.");
  }
  getVideoMattingModelInfo(options.model ?? "modnet");
  if (options.audio !== undefined && !AUDIO_DESTINATIONS.includes(options.audio)) {
    throw new TypeError("audio must be one of base, foreground, both, or none.");
  }
  resolveVideoMattingQuality(options.videoBitrate ?? "very-high");
  resolveVideoMattingQuality(options.audioBitrate ?? "medium");
  if (options.keyframeIntervalInSeconds !== undefined && (!Number.isFinite(options.keyframeIntervalInSeconds) || options.keyframeIntervalInSeconds <= 0)) {
    throw new TypeError("keyframeIntervalInSeconds must be a positive finite number.");
  }
  if (options.onProgress !== undefined && typeof options.onProgress !== "function") {
    throw new TypeError("onProgress must be a function.");
  }
  if (options.onModelLoadProgress !== undefined && typeof options.onModelLoadProgress !== "function") {
    throw new TypeError("onModelLoadProgress must be a function.");
  }
};
var makeInput = (src) => {
  const source = typeof src === "string" || src instanceof URL ? new mediabunny__rspack_import_5/* .UrlSource */.Ts(src) : new mediabunny__rspack_import_5/* .BlobSource */.Z7(src);
  return new mediabunny__rspack_import_6/* .Input */.pd({ formats: mediabunny__rspack_import_7/* .ALL_FORMATS */.XE, source });
};
var probeVideoInput = async ({
  input,
  videoQuality
}) => {
  if (!await input.canRead()) {
    throw new Error("The input is not a supported media file.");
  }
  const videoTrack = await input.getPrimaryVideoTrack();
  if (videoTrack === null) {
    throw new Error("The input does not contain a video track.");
  }
  if (!await videoTrack.canDecode()) {
    throw new Error("The primary video track cannot be decoded.");
  }
  const [width, height] = await Promise.all([
    videoTrack.getDisplayWidth(),
    videoTrack.getDisplayHeight()
  ]);
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new Error("The input video has invalid dimensions.");
  }
  const [canEncodeBase, canEncodeForeground] = await Promise.all([
    (0,mediabunny__rspack_import_4/* .canEncodeVideo */.Sl)("vp9", {
      width,
      height,
      quality: videoQuality,
      alpha: "discard"
    }),
    (0,mediabunny__rspack_import_4/* .canEncodeVideo */.Sl)("vp9", {
      width,
      height,
      quality: videoQuality,
      alpha: "keep"
    })
  ]);
  if (!canEncodeBase || !canEncodeForeground) {
    throw new Error("This browser cannot encode the VP9 video streams required for video layer separation.");
  }
  return { videoTrack, width, height };
};
var separateVideoLayers = async (options) => {
  validateOptions(options);
  throwIfAborted(options.signal);
  const model = options.model ?? "modnet";
  const audio = options.audio ?? "base";
  const videoQuality = resolveVideoMattingQuality(options.videoBitrate ?? "very-high");
  const audioQuality = resolveVideoMattingQuality(options.audioBitrate ?? "medium");
  const keyframeIntervalInSeconds = options.keyframeIntervalInSeconds ?? 1;
  const input = makeInput(options.src);
  const onInputAbort = () => input.dispose();
  options.signal?.addEventListener("abort", onInputAbort, { once: true });
  try {
    const { videoTrack, width, height } = await probeVideoInput({
      input,
      videoQuality
    });
    const [inputFirstVideoTimestamp, videoEndTimestamp] = await Promise.all([
      videoTrack.getFirstTimestamp(),
      videoTrack.computeDuration()
    ]);
    const videoStartTimestamp = Math.max(inputFirstVideoTimestamp, 0);
    if (videoEndTimestamp <= videoStartTimestamp) {
      throw new Error("The primary video track contains no presentable video duration.");
    }
    const durationInSeconds = videoEndTimestamp - videoStartTimestamp;
    throwIfAborted(options.signal);
    const result = await withLoadedVideoMattingPipeline({
      model,
      onProgress: options.onModelLoadProgress,
      signal: options.signal ?? null,
      run: async (pipeline) => {
        throwIfAborted(options.signal);
        let iterator = null;
        let baseOutput = null;
        let foregroundOutput = null;
        let baseVideoSource = null;
        let foregroundVideoSource = null;
        let audioWriter = null;
        let completed = false;
        let abortCleanupPromise = null;
        const cancelPendingMedia = async () => {
          await Promise.allSettled([
            baseOutput?.cancel(),
            foregroundOutput?.cancel()
          ]);
          await Promise.allSettled([audioWriter?.cancel()]);
          await Promise.allSettled([
            baseOutput?.discard(),
            foregroundOutput?.discard()
          ]);
        };
        const onAbort = () => {
          abortCleanupPromise = cancelPendingMedia();
        };
        options.signal?.addEventListener("abort", onAbort, { once: true });
        try {
          const canvasSink = new mediabunny__rspack_import_3/* .CanvasSink */.Yy(videoTrack, {
            alpha: true,
            width,
            height,
            fit: "fill",
            poolSize: 1
          });
          iterator = canvasSink.canvases(videoStartTimestamp, videoEndTimestamp);
          let nextFrame = await iterator.next();
          if (nextFrame.done) {
            throw new Error("The primary video track contains no presentable decodable frames.");
          }
          throwIfAborted(options.signal);
          const baseCanvas = createVideoMattingCanvas({ width, height });
          const foregroundCanvas = createVideoMattingCanvas({ width, height });
          const baseContext = getVideoMattingCanvasContext(baseCanvas);
          const foregroundContext = getVideoMattingCanvasContext(foregroundCanvas);
          baseOutput = await createVideoLayerOutput({
            format: new mediabunny__rspack_import_8/* .WebMOutputFormat */.wQ,
            options: options.outputs?.base
          });
          throwIfAborted(options.signal);
          foregroundOutput = await createVideoLayerOutput({
            format: new mediabunny__rspack_import_8/* .WebMOutputFormat */.wQ,
            options: options.outputs?.foreground
          });
          throwIfAborted(options.signal);
          baseVideoSource = new mediabunny__rspack_import_2/* .CanvasSource */.q2(baseCanvas, {
            codec: "vp9",
            quality: videoQuality,
            keyFrameInterval: keyframeIntervalInSeconds,
            alpha: "discard"
          });
          foregroundVideoSource = new mediabunny__rspack_import_2/* .CanvasSource */.q2(foregroundCanvas, {
            codec: "vp9",
            quality: videoQuality,
            keyFrameInterval: keyframeIntervalInSeconds,
            alpha: "keep"
          });
          baseOutput.output.addVideoTrack(baseVideoSource);
          foregroundOutput.output.addVideoTrack(foregroundVideoSource);
          audioWriter = await prepareAudio({
            input,
            baseOutput: baseOutput.output,
            foregroundOutput: foregroundOutput.output,
            destination: audio,
            videoStartTimestamp,
            videoEndTimestamp,
            audioQuality,
            forceTranscode: options.audioBitrate !== undefined
          });
          throwIfAborted(options.signal);
          await Promise.all([
            baseOutput.output.start(),
            foregroundOutput.output.start()
          ]);
          throwIfAborted(options.signal);
          await audioWriter.prime();
          throwIfAborted(options.signal);
          let processedFrames = 0;
          let processedDurationInSeconds = 0;
          options.onProgress?.({
            stage: "processing",
            progress: 0,
            processedFrames,
            processedDurationInSeconds,
            durationInSeconds
          });
          while (!nextFrame.done) {
            throwIfAborted(options.signal);
            const frame = nextFrame.value;
            const timing = getClippedVideoFrameTiming({
              timestamp: frame.timestamp,
              duration: frame.duration,
              videoStartTimestamp,
              videoEndTimestamp
            });
            if (timing === null) {
              nextFrame = await iterator.next();
              continue;
            }
            const foregroundFrame = await pipeline(frame.canvas);
            throwIfAborted(options.signal);
            drawOpaqueBaseFrame({
              context: baseContext,
              source: frame.canvas,
              width,
              height
            });
            drawForegroundFrame({
              context: foregroundContext,
              result: foregroundFrame,
              source: frame.canvas,
              targetWidth: width,
              targetHeight: height
            });
            await Promise.all([
              baseVideoSource.add(timing.timestamp, timing.duration),
              foregroundVideoSource.add(timing.timestamp, timing.duration),
              audioWriter.writeAudioUntil(timing.timestamp + timing.duration)
            ]);
            processedFrames++;
            const processingProgress = getVideoProcessingProgress({
              timestamp: videoStartTimestamp + timing.timestamp,
              duration: timing.duration,
              firstVideoTimestamp: videoStartTimestamp,
              durationInSeconds
            });
            processedDurationInSeconds = processingProgress.processedDurationInSeconds;
            options.onProgress?.({
              stage: "processing",
              progress: processingProgress.progress,
              processedFrames,
              processedDurationInSeconds,
              durationInSeconds
            });
            nextFrame = await iterator.next();
          }
          options.onProgress?.({
            stage: "finalizing",
            progress: null,
            processedFrames,
            processedDurationInSeconds,
            durationInSeconds
          });
          await audioWriter.finishAudio();
          baseVideoSource.close();
          foregroundVideoSource.close();
          const [base, foreground] = await Promise.all([
            baseOutput.finalize(),
            foregroundOutput.finalize()
          ]);
          throwIfAborted(options.signal);
          completed = true;
          return {
            base,
            foreground,
            model,
            width,
            height,
            durationInSeconds,
            processedFrames
          };
        } catch (error) {
          await cancelPendingMedia();
          if (options.signal?.aborted) {
            throw createAbortError(options.signal);
          }
          throw error;
        } finally {
          options.signal?.removeEventListener("abort", onAbort);
          await abortCleanupPromise;
          if (!completed) {
            try {
              await iterator?.return();
            } catch {}
          }
        }
      }
    });
    return result;
  } catch (error) {
    if (options.signal?.aborted) {
      throw createAbortError(options.signal);
    }
    throw error;
  } finally {
    options.signal?.removeEventListener("abort", onInputAbort);
    input.dispose();
  }
};



},

}]);
//# sourceMappingURL=677.bundle.js.map