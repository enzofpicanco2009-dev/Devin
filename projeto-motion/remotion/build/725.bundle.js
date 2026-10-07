"use strict";
(self["webpackChunkprojeto_motion_remotion"] = self["webpackChunkprojeto_motion_remotion"] || []).push([["725"], {
5732(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  VideoMattingModal: () => (VideoMattingModal)
});
/* import */ var _index_7tt71e8n_mjs__rspack_import_0 = __webpack_require__(6429);
/* import */ var _index_te66vvrp_mjs__rspack_import_1 = __webpack_require__(728);
/* import */ var _index_6cvm9a65_mjs__rspack_import_2 = __webpack_require__(9846);
/* import */ var _index_9x6e1dq0_mjs__rspack_import_3 = __webpack_require__(3651);
/* import */ var _index_hy4xcgty_mjs__rspack_import_4 = __webpack_require__(4281);
/* import */ var _index_czwvnn9g_mjs__rspack_import_5 = __webpack_require__(2187);
/* import */ var _index_1x7bsdh6_mjs__rspack_import_6 = __webpack_require__(3080);
/* import */ var _index_xhe2m2qr_mjs__rspack_import_7 = __webpack_require__(3662);
/* import */ var _index_jg13hf2g_mjs__rspack_import_8 = __webpack_require__(9605);
/* import */ var _index_rcv7qkt5_mjs__rspack_import_9 = __webpack_require__(2126);
/* import */ var _remotion_studio_shared__rspack_import_10 = __webpack_require__(3872);
/* import */ var _remotion_video_matting__rspack_import_11 = __webpack_require__(4);
/* import */ var react__rspack_import_12 = __webpack_require__(6540);
/* import */ var react_jsx_runtime__rspack_import_13 = __webpack_require__(4848);













// src/components/VideoMatting/VideoMattingModal.tsx




var MODELS = (0,_remotion_video_matting__rspack_import_11.getAvailableModels)();
var controlStyle = { width: 330, maxWidth: "100%" };
var panelStyle = {
  ..._index_xhe2m2qr_mjs__rspack_import_7/* .optionsPanel */.Z6,
  flexDirection: "column",
  paddingTop: 16
};
var modalStyle = {
  ..._index_xhe2m2qr_mjs__rspack_import_7/* .outerModalStyle */.uT,
  height: "auto",
  maxHeight: "calc(100vh - 40px)",
  minHeight: _index_xhe2m2qr_mjs__rspack_import_7/* .outerModalStyle.height */.uT.height,
  outline: "none"
};
var modalLayout = {
  ..._index_xhe2m2qr_mjs__rspack_import_7/* .horizontalLayout */.D6,
  flex: "1 1 auto"
};
var hiddenPanel = { display: "none" };
var validationStyle = { padding: "0 16px 8px" };
var makeOptions = ({
  items,
  selected,
  setSelected
}) => items.map(({ id, label: optionLabel }) => ({
  type: "item",
  id,
  value: id,
  label: optionLabel,
  leftItem: id === selected ? /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_6cvm9a65_mjs__rspack_import_2/* .Checkmark */.MGO, {}) : null,
  keyHint: null,
  quickSwitcherLabel: null,
  subMenu: null,
  disabled: false,
  onClick: () => setSelected(id)
}));
var VideoMattingModal = ({
  displayName,
  src
}) => {
  const [tab, setTab] = (0,react__rspack_import_12.useState)("separate");
  const isModelCached = (0,react__rspack_import_12.useCallback)((selectedModel) => (0,_remotion_video_matting__rspack_import_11/* .isVideoMattingModelCached */.VK)({ model: selectedModel }), []);
  const cachedModels = (0,_index_7tt71e8n_mjs__rspack_import_0/* .useModelCacheStatus */.X)({
    isModelCached,
    models: MODELS,
    refreshKey: tab
  });
  const baseName = (0,react__rspack_import_12.useMemo)(() => (0,_index_6cvm9a65_mjs__rspack_import_2/* .getDefaultOutputBaseName */.Jjl)(src, displayName, "video"), [displayName, src]);
  const [baseOutName, setBaseOutName] = (0,react__rspack_import_12.useState)(`${baseName}-base.webm`);
  const [foregroundOutName, setForegroundOutName] = (0,react__rspack_import_12.useState)(`${baseName}-foreground.webm`);
  const [model, setModel] = (0,react__rspack_import_12.useState)("ben2-base");
  const [audio, setAudio] = (0,react__rspack_import_12.useState)("base");
  const [videoBitrate, setVideoBitrate] = (0,react__rspack_import_12.useState)("very-high");
  const [support, setSupport] = (0,react__rspack_import_12.useState)({ type: "checking" });
  const staticFiles = (0,_index_6cvm9a65_mjs__rspack_import_2/* .useStaticFiles */.JM3)();
  const { addVideoMattingJob, videoMattingJobs } = (0,react__rspack_import_12.useContext)(_index_9x6e1dq0_mjs__rspack_import_3/* .RenderQueueContext */.x7);
  const { setSelectedModal } = (0,react__rspack_import_12.useContext)(_index_6cvm9a65_mjs__rspack_import_2/* .SetSelectedModalContext */.Mqz);
  const { setSidebarCollapsedState } = (0,react__rspack_import_12.useContext)(_index_6cvm9a65_mjs__rspack_import_2/* .SidebarContext */.I0U);
  (0,react__rspack_import_12.useEffect)(() => {
    let cancelled = false;
    setSupport({ type: "checking" });
    (0,_remotion_video_matting__rspack_import_11/* .canUseVideoMatting */.Bj)({ model }).then((result) => {
      if (!cancelled) {
        setSupport(result.supported ? { type: "supported" } : { type: "unsupported", message: result.detailedReason });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [model]);
  const normalizedBase = baseOutName.normalize("NFC").toLowerCase();
  const normalizedForeground = foregroundOutName.normalize("NFC").toLowerCase();
  const duplicateOutput = normalizedBase === normalizedForeground;
  const queuedOutputs = new Set(videoMattingJobs.filter((job) => job.status === "idle" || job.status === "running").flatMap((job) => [job.baseOutName, job.foregroundOutName]).map((name) => name.normalize("NFC").toLowerCase()));
  const baseError = (0,_index_6cvm9a65_mjs__rspack_import_2/* .validatePublicOutputName */.MDu)({ extension: ".webm", outName: baseOutName }) ?? (duplicateOutput ? "Base and foreground outputs must be different" : queuedOutputs.has(normalizedBase) ? "Another video matting job is using this output file" : null);
  const foregroundError = (0,_index_6cvm9a65_mjs__rspack_import_2/* .validatePublicOutputName */.MDu)({
    extension: ".webm",
    outName: foregroundOutName
  }) ?? (duplicateOutput ? "Base and foreground outputs must be different" : queuedOutputs.has(normalizedForeground) ? "Another video matting job is using this output file" : null);
  const baseExists = staticFiles.some((file) => file.name.normalize("NFC").toLowerCase() === normalizedBase);
  const foregroundExists = staticFiles.some((file) => file.name.normalize("NFC").toLowerCase() === normalizedForeground);
  const canSubmit = support.type === "supported" && baseError === null && foregroundError === null;
  const modelOptions = (0,react__rspack_import_12.useMemo)(() => makeOptions({
    items: MODELS.map((item) => ({
      id: item.name,
      label: `${item.name} · ${(0,_remotion_studio_shared__rspack_import_10/* .formatBytes */.z3)(item.webGpuDownloadSize)}${cachedModels.has(item.name) ? " · Downloaded" : ""}`
    })),
    selected: model,
    setSelected: setModel
  }), [cachedModels, model]);
  const audioOptions = (0,react__rspack_import_12.useMemo)(() => makeOptions({
    items: [
      { id: "base", label: "Background layer" },
      { id: "foreground", label: "Foreground layer" },
      { id: "both", label: "Both layers" },
      { id: "none", label: "No audio" }
    ],
    selected: audio,
    setSelected: setAudio
  }), [audio]);
  const qualityOptions = (0,react__rspack_import_12.useMemo)(() => makeOptions({
    items: ["very-low", "low", "medium", "high", "very-high"].map((id) => ({
      id,
      label: id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ")
    })),
    selected: videoBitrate,
    setSelected: setVideoBitrate
  }), [videoBitrate]);
  const submit = (0,react__rspack_import_12.useCallback)(() => {
    if (!canSubmit)
      return;
    addVideoMattingJob({
      src,
      displayName,
      baseOutName,
      foregroundOutName,
      model,
      audio,
      videoBitrate
    });
    setSidebarCollapsedState({ left: null, right: "expanded" });
    (0,_index_6cvm9a65_mjs__rspack_import_2/* .persistSelectedOptionsSidebarPanel */.Gd8)("renders");
    _index_6cvm9a65_mjs__rspack_import_2/* .optionsSidebarTabs.current */.nm0.current?.selectRendersPanel();
    setSelectedModal(null);
  }, [
    addVideoMattingJob,
    audio,
    baseOutName,
    canSubmit,
    displayName,
    foregroundOutName,
    model,
    setSelectedModal,
    setSidebarCollapsedState,
    src,
    videoBitrate
  ]);
  return /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_6cvm9a65_mjs__rspack_import_2/* .DismissableModal */.sbH, {
    ariaLabel: `Track matting ${displayName}`,
    children: /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsxs)("div", {
      style: modalStyle,
      children: [
        /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_6cvm9a65_mjs__rspack_import_2/* .ModalHeader */.rQ0, {
          title: `Track matting ${displayName}`
        }),
        /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsxs)("div", {
          style: _index_xhe2m2qr_mjs__rspack_import_7/* .container */.kL,
          children: [
            /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)("div", {
              style: _index_xhe2m2qr_mjs__rspack_import_7/* .flexer */.lw
            }),
            /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_6cvm9a65_mjs__rspack_import_2/* .Button */.$nd, {
              disabled: !canSubmit,
              onClick: submit,
              title: support.type === "unsupported" ? support.message : undefined,
              style: {
                ..._index_xhe2m2qr_mjs__rspack_import_7/* .buttonStyle */.i9,
                backgroundColor: canSubmit ? _index_xhe2m2qr_mjs__rspack_import_7/* .buttonStyle.backgroundColor */.i9.backgroundColor : _index_jg13hf2g_mjs__rspack_import_8/* .BLUE_DISABLED */.er
              },
              children: "Separate"
            })
          ]
        }),
        /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsxs)("div", {
          style: modalLayout,
          children: [
            /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsxs)("div", {
              style: _index_xhe2m2qr_mjs__rspack_import_7/* .leftSidebar */.K8,
              children: [
                /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_6cvm9a65_mjs__rspack_import_2/* .VerticalTab */.sMJ, {
                  autoFocus: true,
                  onClick: () => setTab("separate"),
                  renderIcon: (color) => /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)("div", {
                    style: _index_xhe2m2qr_mjs__rspack_import_7/* .iconContainer */.zc,
                    children: /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_6cvm9a65_mjs__rspack_import_2/* .SeparationIcon */.Ud, {
                      color,
                      style: _index_xhe2m2qr_mjs__rspack_import_7/* .icon */.Kk
                    })
                  }),
                  selected: tab === "separate",
                  style: _index_xhe2m2qr_mjs__rspack_import_7/* .horizontalTab */.So,
                  children: "Separate"
                }),
                /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_6cvm9a65_mjs__rspack_import_2/* .VerticalTab */.sMJ, {
                  onClick: () => setTab("models"),
                  renderIcon: (color) => /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)("div", {
                    style: _index_xhe2m2qr_mjs__rspack_import_7/* .iconContainer */.zc,
                    children: /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_6cvm9a65_mjs__rspack_import_2/* .ModelsIcon */.oiI, {
                      color,
                      style: _index_xhe2m2qr_mjs__rspack_import_7/* .icon */.Kk
                    })
                  }),
                  selected: tab === "models",
                  style: _index_xhe2m2qr_mjs__rspack_import_7/* .horizontalTab */.So,
                  children: "Models"
                })
              ]
            }),
            /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsxs)("div", {
              style: tab === "separate" ? panelStyle : hiddenPanel,
              className: _index_xhe2m2qr_mjs__rspack_import_7/* .VERTICAL_SCROLLBAR_CLASSNAME */.uV,
              children: [
                /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_te66vvrp_mjs__rspack_import_1/* .RenderModalOutputName */.O, {
                  ariaLabel: "Base video output file",
                  existingOutputPath: window.remotion_publicFolderExists ? `${window.remotion_publicFolderExists}/${baseOutName}` : null,
                  existence: baseExists,
                  inputStyle: _index_6cvm9a65_mjs__rspack_import_2/* .input */.hFB,
                  label: "Base output in public/",
                  onValueChange: (event) => setBaseOutName(event.target.value),
                  outName: baseOutName,
                  validationMessage: baseError
                }),
                /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_te66vvrp_mjs__rspack_import_1/* .RenderModalOutputName */.O, {
                  ariaLabel: "Foreground video output file",
                  existingOutputPath: window.remotion_publicFolderExists ? `${window.remotion_publicFolderExists}/${foregroundOutName}` : null,
                  existence: foregroundExists,
                  inputStyle: _index_6cvm9a65_mjs__rspack_import_2/* .input */.hFB,
                  label: "Foreground output in public/",
                  onValueChange: (event) => setForegroundOutName(event.target.value),
                  outName: foregroundOutName,
                  validationMessage: foregroundError
                }),
                /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_6cvm9a65_mjs__rspack_import_2/* .RenderModalHr */.YbN, {}),
                /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsxs)("div", {
                  style: _index_6cvm9a65_mjs__rspack_import_2/* .optionRow */.wVt,
                  children: [
                    /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)("div", {
                      style: _index_6cvm9a65_mjs__rspack_import_2/* .label */.Pfx,
                      children: "Model"
                    }),
                    /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)("div", {
                      style: _index_6cvm9a65_mjs__rspack_import_2/* .rightRow */.jmp,
                      children: /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_6cvm9a65_mjs__rspack_import_2/* .Combobox */.G3_, {
                        values: modelOptions,
                        selectedId: model,
                        title: "Model",
                        style: controlStyle
                      })
                    })
                  ]
                }),
                support.type === "unsupported" ? /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)("div", {
                  style: validationStyle,
                  children: /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_xhe2m2qr_mjs__rspack_import_7/* .ValidationMessage */.Xl, {
                    align: "flex-end",
                    message: support.message,
                    type: "error"
                  })
                }) : null,
                /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsxs)("div", {
                  style: _index_6cvm9a65_mjs__rspack_import_2/* .optionRow */.wVt,
                  children: [
                    /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)("div", {
                      style: _index_6cvm9a65_mjs__rspack_import_2/* .label */.Pfx,
                      children: "Audio"
                    }),
                    /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)("div", {
                      style: _index_6cvm9a65_mjs__rspack_import_2/* .rightRow */.jmp,
                      children: /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_6cvm9a65_mjs__rspack_import_2/* .Combobox */.G3_, {
                        values: audioOptions,
                        selectedId: audio,
                        title: "Audio",
                        style: controlStyle
                      })
                    })
                  ]
                }),
                /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsxs)("div", {
                  style: _index_6cvm9a65_mjs__rspack_import_2/* .optionRow */.wVt,
                  children: [
                    /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)("div", {
                      style: _index_6cvm9a65_mjs__rspack_import_2/* .label */.Pfx,
                      children: "Video quality"
                    }),
                    /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)("div", {
                      style: _index_6cvm9a65_mjs__rspack_import_2/* .rightRow */.jmp,
                      children: /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_6cvm9a65_mjs__rspack_import_2/* .Combobox */.G3_, {
                        values: qualityOptions,
                        selectedId: String(videoBitrate),
                        title: "Video quality",
                        style: controlStyle
                      })
                    })
                  ]
                })
              ]
            }),
            /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_13.jsx)(_index_czwvnn9g_mjs__rspack_import_5/* .Models */.B, {
              description: `Models are downloaded automatically when needed.
You can also manage the browser cache here.`,
              indent: true,
              visible: tab === "models"
            })
          ]
        })
      ]
    })
  });
};



},
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
6429(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  X: () => (useModelCacheStatus)
});
/* import */ var react__rspack_import_0 = __webpack_require__(6540);
// src/components/use-model-cache-status.ts

var useModelCacheStatus = ({
  isModelCached,
  models,
  refreshKey
}) => {
  const [cachedModels, setCachedModels] = (0,react__rspack_import_0.useState)(new Set);
  (0,react__rspack_import_0.useEffect)(() => {
    let cancelled = false;
    Promise.all(models.map(async ({ name }) => ({
      cached: await isModelCached(name),
      name
    }))).then((results) => {
      if (!cancelled) {
        const nextCachedModels = new Set;
        for (const result of results) {
          if (result.cached) {
            nextCachedModels.add(result.name);
          }
        }
        setCachedModels(nextCachedModels);
      }
    }).catch(() => {
      if (!cancelled) {
        setCachedModels(new Set);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isModelCached, models, refreshKey]);
  return cachedModels;
};




},
2187(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  B: () => (Models)
});
/* import */ var _index_1x7bsdh6_mjs__rspack_import_0 = __webpack_require__(3080);
/* import */ var _remotion_video_matting__rspack_import_1 = __webpack_require__(4);
/* import */ var react__rspack_import_2 = __webpack_require__(6540);
/* import */ var react_jsx_runtime__rspack_import_3 = __webpack_require__(4848);


// src/components/VideoMatting/Models.tsx



var AVAILABLE_MODELS = (0,_remotion_video_matting__rspack_import_1.getAvailableModels)();
var Models = ({ description, indent, visible }) => {
  const isModelCached = (0,react__rspack_import_2.useCallback)((model) => (0,_remotion_video_matting__rspack_import_1/* .isVideoMattingModelCached */.VK)({ model }), []);
  const loadModel = (0,react__rspack_import_2.useCallback)((model, onProgress) => (0,_remotion_video_matting__rspack_import_1/* .loadVideoMattingModel */.nk)({
    model,
    onProgress: (progress) => onProgress(progress.progress)
  }), []);
  const removeModel = (0,react__rspack_import_2.useCallback)((model) => (0,_remotion_video_matting__rspack_import_1/* .removeVideoMattingModel */.t$)({ model }), []);
  return /* @__PURE__ */ (0,react_jsx_runtime__rspack_import_3.jsx)(_index_1x7bsdh6_mjs__rspack_import_0/* .ModelManager */.P, {
    ariaLabel: "Video matting models",
    availableModels: AVAILABLE_MODELS,
    description,
    indent,
    isModelCached,
    loadModel,
    prepare: null,
    removeModel,
    visible
  });
};




},

}]);
//# sourceMappingURL=725.bundle.js.map