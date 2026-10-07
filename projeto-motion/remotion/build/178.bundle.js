"use strict";
(self["webpackChunkprojeto_motion_remotion"] = self["webpackChunkprojeto_motion_remotion"] || []).push([["178"], {
3353(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  VideoMattingQueueProcessor: () => (VideoMattingQueueProcessor)
});
/* import */ var _index_v4tr1bft_mjs__rspack_import_4 = __webpack_require__(3840);
/* import */ var _index_9x6e1dq0_mjs__rspack_import_0 = __webpack_require__(3651);
/* import */ var _index_cw0pnpg5_mjs__rspack_import_5 = __webpack_require__(2759);
/* import */ var _index_rcv7qkt5_mjs__rspack_import_1 = __webpack_require__(2126);
/* import */ var _remotion_video_matting__rspack_import_2 = __webpack_require__(4);
/* import */ var react__rspack_import_3 = __webpack_require__(6540);





// src/components/RenderQueue/VideoMattingQueueProcessor.tsx


var VideoMattingQueueProcessor = () => {
  const {
    markVideoMattingJobDone,
    markVideoMattingJobFailed,
    setProcessVideoMattingJobCallback,
    updateVideoMattingJobProgress
  } = (0,react__rspack_import_3.useContext)(_index_9x6e1dq0_mjs__rspack_import_0/* .RenderQueueContext */.x7);
  const processJob = (0,react__rspack_import_3.useCallback)(async (job) => {
    let outputs = null;
    let processingError = null;
    try {
      updateVideoMattingJobProgress(job.id, {
        detail: null,
        message: "Checking WebGPU support...",
        value: 0
      });
      const support = await (0,_remotion_video_matting__rspack_import_2/* .canUseVideoMatting */.Bj)({ model: job.model });
      if (!support.supported) {
        throw new Error(support.detailedReason);
      }
      await (0,_index_v4tr1bft_mjs__rspack_import_4/* .loadModelForJob */.k)({
        model: job.model,
        progressStart: 0,
        progressSpan: 0.2,
        isModelCached: (model) => (0,_remotion_video_matting__rspack_import_2/* .isVideoMattingModelCached */.VK)({ model }),
        loadModel: (model, onProgress) => (0,_remotion_video_matting__rspack_import_2/* .loadVideoMattingModel */.nk)({
          model,
          onProgress: (progress) => onProgress(progress.progress)
        }),
        updateProgress: (progress) => updateVideoMattingJobProgress(job.id, {
          ...progress,
          detail: null
        })
      });
      outputs = await (0,_remotion_video_matting__rspack_import_2/* .separateVideoLayers */.jb)({
        src: job.src,
        model: job.model,
        audio: job.audio,
        videoBitrate: job.videoBitrate,
        onProgress: (progress) => {
          updateVideoMattingJobProgress(job.id, {
            detail: progress.stage === "finalizing" ? `Processed ${progress.processedFrames} ${progress.processedFrames === 1 ? "frame" : "frames"}` : `Processed ${progress.processedFrames} ${progress.processedFrames === 1 ? "frame" : "frames"} · ${Math.round(progress.progress * 100)}%`,
            message: progress.stage === "finalizing" ? "Finalizing video layers..." : "Separating foreground...",
            value: 0.2 + (progress.progress ?? 1) * 0.65
          });
        }
      });
      updateVideoMattingJobProgress(job.id, {
        detail: null,
        message: "Saving video layers...",
        value: 0.88
      });
      const [base, foreground] = await Promise.all([
        outputs.base.getBlob(),
        outputs.foreground.getBlob()
      ]);
      await Promise.all([
        base.arrayBuffer().then((contents) => (0,_index_cw0pnpg5_mjs__rspack_import_5/* .writeStaticFile */.sV)({ contents, filePath: job.baseOutName })),
        foreground.arrayBuffer().then((contents) => (0,_index_cw0pnpg5_mjs__rspack_import_5/* .writeStaticFile */.sV)({ contents, filePath: job.foregroundOutName }))
      ]);
    } catch (error) {
      processingError = error instanceof Error ? error : new Error(String(error));
    }
    try {
      await Promise.all([
        outputs?.base.dispose(),
        outputs?.foreground.dispose()
      ]);
      await (0,_remotion_video_matting__rspack_import_2/* .disposeVideoMattingModel */.oe)({ model: job.model });
    } catch {}
    if (processingError) {
      markVideoMattingJobFailed(job.id, processingError);
    } else {
      markVideoMattingJobDone(job.id);
    }
  }, [
    markVideoMattingJobDone,
    markVideoMattingJobFailed,
    updateVideoMattingJobProgress
  ]);
  (0,react__rspack_import_3.useEffect)(() => {
    setProcessVideoMattingJobCallback(processJob);
    return () => setProcessVideoMattingJobCallback(null);
  }, [processJob, setProcessVideoMattingJobCallback]);
  return null;
};



},
3840(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  k: () => (loadModelForJob)
});
// src/components/RenderQueue/load-model-for-job.ts
var loadModelForJob = async ({
  isModelCached,
  loadModel,
  model,
  progressSpan,
  progressStart,
  updateProgress
}) => {
  const cached = await isModelCached(model);
  await loadModel(model, (progress) => {
    const percentage = progress === null ? "" : ` ${Math.round(progress * 100)}%`;
    updateProgress({
      message: `${cached ? "Loading" : "Downloading"} ${model}${percentage}`,
      value: progressStart + (progress ?? 0) * progressSpan
    });
  });
};




},

}]);
//# sourceMappingURL=178.bundle.js.map