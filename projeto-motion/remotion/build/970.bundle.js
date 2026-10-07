"use strict";
(self["webpackChunkprojeto_motion_remotion"] = self["webpackChunkprojeto_motion_remotion"] || []).push([["970"], {
1857(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  CaptionQueueProcessor: () => (/* binding */ CaptionQueueProcessor)
});

// EXTERNAL MODULE: ./node_modules/@remotion/studio/dist/esm/index-v4tr1bft.mjs
var index_v4tr1bft = __webpack_require__(3840);
// EXTERNAL MODULE: ./node_modules/@remotion/studio/dist/esm/index-9x6e1dq0.mjs
var index_9x6e1dq0 = __webpack_require__(3651);
// EXTERNAL MODULE: ./node_modules/@remotion/studio/dist/esm/index-cw0pnpg5.mjs
var index_cw0pnpg5 = __webpack_require__(2759);
// EXTERNAL MODULE: ./node_modules/@remotion/studio/dist/esm/index-rcv7qkt5.mjs
var index_rcv7qkt5 = __webpack_require__(2126);
// EXTERNAL MODULE: ./node_modules/@remotion/whisper-webgpu/dist/esm/index.mjs
var esm = __webpack_require__(8665);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(6540);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/input.js
var src_input = __webpack_require__(2030);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/input-format.js
var input_format = __webpack_require__(5608);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/source.js
var src_source = __webpack_require__(4709);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/output.js
var src_output = __webpack_require__(9917);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/output-format.js + 13 modules
var output_format = __webpack_require__(8792);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/target.js
var target = __webpack_require__(917);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/codec.js
var src_codec = __webpack_require__(1188);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/encode.js
var encode = __webpack_require__(5374);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/logging.js
var logging = __webpack_require__(6103);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/media-sink.js
var media_sink = __webpack_require__(388);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/media-source.js + 1 modules
var media_source = __webpack_require__(6832);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/misc.js
var misc = __webpack_require__(3912);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/sample.js
var src_sample = __webpack_require__(4166);
// EXTERNAL MODULE: ./node_modules/mediabunny/dist/modules/src/metadata.js
var metadata = __webpack_require__(5165);
;// CONCATENATED MODULE: ./node_modules/mediabunny/dist/modules/src/conversion.js
/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
var __addDisposableResource = (undefined && undefined.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (undefined && undefined.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});












const validateVideoOptions = (videoOptions) => {
    if (!videoOptions || typeof videoOptions !== 'object') {
        throw new TypeError('options.video, when provided, must be an object.');
    }
    if (videoOptions?.discard !== undefined && typeof videoOptions.discard !== 'boolean') {
        throw new TypeError('options.video.discard, when provided, must be a boolean.');
    }
    if (videoOptions?.forceTranscode !== undefined && typeof videoOptions.forceTranscode !== 'boolean') {
        throw new TypeError('options.video.forceTranscode, when provided, must be a boolean.');
    }
    if (videoOptions?.codec !== undefined && !src_codec/* .VIDEO_CODECS.includes */.WN.includes(videoOptions.codec)) {
        throw new TypeError(`options.video.codec, when provided, must be one of: ${src_codec/* .VIDEO_CODECS.join */.WN.join(', ')}.`);
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const bitrate = videoOptions?.bitrate;
    if (videoOptions?.quality !== undefined && !(videoOptions.quality instanceof encode/* .Quality */.en)) {
        throw new TypeError('options.video.quality, when provided, must be a Quality.');
    }
    if (videoOptions?.quality !== undefined && bitrate !== undefined) {
        throw new TypeError('options.video.quality and options.video.bitrate cannot both be provided.');
    }
    if (bitrate !== undefined && !(bitrate instanceof encode/* .Quality */.en) && (!Number.isInteger(bitrate) || bitrate <= 0)) {
        throw new TypeError('options.video.bitrate, when provided, must be a positive integer or a quality.');
    }
    if (videoOptions?.width !== undefined
        && (!Number.isInteger(videoOptions.width) || videoOptions.width <= 0)) {
        throw new TypeError('options.video.width, when provided, must be a positive integer.');
    }
    if (videoOptions?.height !== undefined
        && (!Number.isInteger(videoOptions.height) || videoOptions.height <= 0)) {
        throw new TypeError('options.video.height, when provided, must be a positive integer.');
    }
    if (videoOptions?.fit !== undefined && !['fill', 'contain', 'cover'].includes(videoOptions.fit)) {
        throw new TypeError('options.video.fit, when provided, must be one of \'fill\', \'contain\', or \'cover\'.');
    }
    if (videoOptions?.width !== undefined
        && videoOptions.height !== undefined
        && videoOptions.fit === undefined) {
        throw new TypeError('When both options.video.width and options.video.height are provided, options.video.fit must also be'
            + ' provided.');
    }
    if (videoOptions?.rotate !== undefined && ![0, 90, 180, 270].includes(videoOptions.rotate)) {
        throw new TypeError('options.video.rotate, when provided, must be 0, 90, 180 or 270.');
    }
    if (videoOptions?.allowRotationMetadata !== undefined && typeof videoOptions.allowRotationMetadata !== 'boolean') {
        throw new TypeError('options.video.allowRotationMetadata, when provided, must be a boolean.');
    }
    if (videoOptions?.crop !== undefined) {
        (0,src_sample/* .validateCropRectangle */.wS)(videoOptions.crop, 'options.video.');
    }
    if (videoOptions?.frameRate !== undefined
        && (!Number.isFinite(videoOptions.frameRate) || videoOptions.frameRate <= 0)) {
        throw new TypeError('options.video.frameRate, when provided, must be a finite positive number.');
    }
    if (videoOptions?.alpha !== undefined && !['discard', 'keep'].includes(videoOptions.alpha)) {
        throw new TypeError('options.video.alpha, when provided, must be either \'discard\' or \'keep\'.');
    }
    if (videoOptions?.keyFrameInterval !== undefined
        && (!Number.isFinite(videoOptions.keyFrameInterval) || videoOptions.keyFrameInterval < 0)) {
        throw new TypeError('options.video.keyFrameInterval, when provided, must be a non-negative number.');
    }
    if (videoOptions?.process !== undefined && typeof videoOptions.process !== 'function') {
        throw new TypeError('options.video.process, when provided, must be a function.');
    }
    if (videoOptions?.processedWidth !== undefined
        && (!Number.isInteger(videoOptions.processedWidth) || videoOptions.processedWidth <= 0)) {
        throw new TypeError('options.video.processedWidth, when provided, must be a positive integer.');
    }
    if (videoOptions?.processedHeight !== undefined
        && (!Number.isInteger(videoOptions.processedHeight) || videoOptions.processedHeight <= 0)) {
        throw new TypeError('options.video.processedHeight, when provided, must be a positive integer.');
    }
    if (videoOptions?.hardwareAcceleration !== undefined
        && !['no-preference', 'prefer-hardware', 'prefer-software'].includes(videoOptions.hardwareAcceleration)) {
        throw new TypeError('options.video.hardwareAcceleration, when provided, must be \'no-preference\', \'prefer-hardware\' or'
            + ' \'prefer-software\'.');
    }
    if (videoOptions?.group !== undefined
        && !(videoOptions.group instanceof src_output/* .OutputTrackGroup */.Q6
            || (Array.isArray(videoOptions.group) && videoOptions.group.every(x => x instanceof src_output/* .OutputTrackGroup */.Q6)))) {
        throw new TypeError('options.video.group, when provided, must be an OutputTrackGroup or an array of OutputTrackGroups.');
    }
};
const validateAudioOptions = (audioOptions) => {
    if (!audioOptions || typeof audioOptions !== 'object') {
        throw new TypeError('options.audio, when provided, must be an object.');
    }
    if (audioOptions?.discard !== undefined && typeof audioOptions.discard !== 'boolean') {
        throw new TypeError('options.audio.discard, when provided, must be a boolean.');
    }
    if (audioOptions?.forceTranscode !== undefined && typeof audioOptions.forceTranscode !== 'boolean') {
        throw new TypeError('options.audio.forceTranscode, when provided, must be a boolean.');
    }
    if (audioOptions?.codec !== undefined && !src_codec/* .AUDIO_CODECS.includes */.PP.includes(audioOptions.codec)) {
        throw new TypeError(`options.audio.codec, when provided, must be one of: ${src_codec/* .AUDIO_CODECS.join */.PP.join(', ')}.`);
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const bitrate = audioOptions?.bitrate;
    if (audioOptions?.quality !== undefined && !(audioOptions.quality instanceof encode/* .Quality */.en)) {
        throw new TypeError('options.audio.quality, when provided, must be a Quality.');
    }
    if (audioOptions?.quality !== undefined && bitrate !== undefined) {
        throw new TypeError('options.audio.quality and options.audio.bitrate cannot both be provided.');
    }
    if (bitrate !== undefined && !(bitrate instanceof encode/* .Quality */.en) && (!Number.isInteger(bitrate) || bitrate <= 0)) {
        throw new TypeError('options.audio.bitrate, when provided, must be a positive integer or a quality.');
    }
    if (audioOptions?.numberOfChannels !== undefined
        && (!Number.isInteger(audioOptions.numberOfChannels) || audioOptions.numberOfChannels <= 0)) {
        throw new TypeError('options.audio.numberOfChannels, when provided, must be a positive integer.');
    }
    if (audioOptions?.sampleRate !== undefined
        && (!Number.isInteger(audioOptions.sampleRate) || audioOptions.sampleRate <= 0)) {
        throw new TypeError('options.audio.sampleRate, when provided, must be a positive integer.');
    }
    if (audioOptions?.sampleFormat !== undefined
        && !['u8', 's16', 's32', 'f32'].includes(audioOptions.sampleFormat)) {
        throw new TypeError('options.audio.sampleFormat, when provided, must be one of: u8, s16, s32, f32.');
    }
    if (audioOptions?.process !== undefined && typeof audioOptions.process !== 'function') {
        throw new TypeError('options.audio.process, when provided, must be a function.');
    }
    if (audioOptions?.processedNumberOfChannels !== undefined
        && (!Number.isInteger(audioOptions.processedNumberOfChannels) || audioOptions.processedNumberOfChannels <= 0)) {
        throw new TypeError('options.audio.processedNumberOfChannels, when provided, must be a positive integer.');
    }
    if (audioOptions?.processedSampleRate !== undefined
        && (!Number.isInteger(audioOptions.processedSampleRate) || audioOptions.processedSampleRate <= 0)) {
        throw new TypeError('options.audio.processedSampleRate, when provided, must be a positive integer.');
    }
    if (audioOptions?.group !== undefined
        && !(audioOptions.group instanceof src_output/* .OutputTrackGroup */.Q6
            || (Array.isArray(audioOptions.group) && audioOptions.group.every(x => x instanceof src_output/* .OutputTrackGroup */.Q6)))) {
        throw new TypeError('options.audio.group, when provided, must be an OutputTrackGroup or an array of OutputTrackGroups.');
    }
};
const FALLBACK_NUMBER_OF_CHANNELS = 2;
const FALLBACK_SAMPLE_RATE = 48000;
/**
 * Represents a media file conversion process, used to convert one media file into another. In addition to conversion,
 * this class can be used to resize and rotate video, resample audio, drop tracks, or trim to a specific time range.
 * @group Conversion
 * @public
 */
class Conversion {
    /** Initializes a new conversion process without starting the conversion. */
    static async init(options) {
        const conversion = new Conversion(options);
        await conversion._init();
        return conversion;
    }
    /** Creates a new Conversion instance (duh). */
    constructor(options) {
        /**
         * The current state of the conversion.
         *
         * - `'idle'`: The conversion is not currently executing and isn't done; `execute` can be called.
         * - `'executing'`: A call to `execute` is currently running.
         * - `'canceled'`: The conversion has been canceled and can no longer be executed.
         * - `'done'`: The conversion has run to completion. Subsequent calls to `execute` do nothing.
         */
        this.state = 'idle';
        /** @internal */
        this._nextOutputTrackId = 0;
        /** @internal */
        this._outputTrackIds = [];
        /** @internal */
        this._outputOwnTrackGroups = [];
        /** @internal */
        this._trackPumps = [];
        /** @internal */
        this._composable = false;
        /** @internal */
        this._executed = false;
        /** @internal */
        this._executionUntil = Infinity;
        /** @internal */
        this._pauseRequested = false;
        /** @internal */
        this._synchronizer = new TrackSynchronizer(this);
        /** @internal */
        this._totalDuration = null;
        /** @internal */
        this._maxTimestamps = new Map(); // Track ID -> timestamp
        /**
         * A callback that is fired whenever the conversion progresses. Gets passed as first argument a number between
         * 0 and 1, indicating the completion of the conversion. Note that a progress of 1 doesn't necessarily mean the
         * conversion is complete; the conversion is complete once `execute()` resolves.
         *
         * As second argument, this callback receives the input time in seconds that has been processed.
         *
         * In order for progress to be computed, this property must be set before `execute` is called.
         */
        this.onProgress = undefined;
        /** @internal */
        this._computeProgress = false;
        /** @internal */
        this._lastProgress = 0;
        /**
         * Whether this conversion, as it has been configured, is valid and can be executed. If this field is `false`, check
         * the `discardedTracks` field for reasons. Composable conversions are always valid, even if they utilize
         * zero tracks.
         *
         * Note: a conversion having discarded tracks does not automatically mean it is invalid; if the remaining, utilized
         * tracks make for a valid output file, the conversion is still allowed.
         */
        this.isValid = false;
        /**
         * The list of tracks that are included in the output file. When fan-out is used, the same track appears in this
         * array multiple times.
         */
        this.utilizedTracks = [];
        /** The list of tracks from the input file that have been discarded, alongside the discard reason. */
        this.discardedTracks = [];
        if (!options || typeof options !== 'object') {
            throw new TypeError('options must be an object.');
        }
        if (!(options.input instanceof src_input/* .Input */.pd)) {
            throw new TypeError('options.input must be an Input.');
        }
        if (!(options.output instanceof src_output/* .Output */.k7)) {
            throw new TypeError('options.output must be an Output.');
        }
        if (options.tracks !== undefined
            && options.tracks !== 'all'
            && options.tracks !== 'primary') {
            throw new TypeError('options.tracks, when provided, must be either \'all\' or \'primary\'.');
        }
        if (options.composable !== undefined && typeof options.composable !== 'boolean') {
            throw new TypeError('options.composable, when provided, must be a boolean.');
        }
        const composable = options.composable ?? false;
        if (!composable) {
            if (options.output.tracks.length > 0
                || Object.keys(options.output._metadataTags).length > 0
                || options.output.state !== 'pending') {
                throw new TypeError('options.output must be fresh: no tracks or metadata tags added and not started.');
            }
        }
        else {
            if (options.tags !== undefined) {
                throw new TypeError('options.tags cannot be set by a composable conversion; set metadata directly on the output'
                    + ' instead.');
            }
            if (options.output.state !== 'pending') {
                throw new TypeError('options.output must not have been started yet.');
            }
        }
        if (options.video !== undefined && typeof options.video !== 'function') {
            if (Array.isArray(options.video)) {
                for (const obj of options.video) {
                    validateVideoOptions(obj);
                }
            }
            else {
                validateVideoOptions(options.video);
            }
        }
        else {
            // We'll validate the return value later
        }
        if (options.audio !== undefined && typeof options.audio !== 'function') {
            if (Array.isArray(options.audio)) {
                for (const obj of options.audio) {
                    validateAudioOptions(obj);
                }
            }
            else {
                validateAudioOptions(options.audio);
            }
        }
        else {
            // We'll validate the return value later
        }
        if (options.trim !== undefined && (!options.trim || typeof options.trim !== 'object')) {
            throw new TypeError('options.trim, when provided, must be an object.');
        }
        if (options.trim?.start !== undefined && (!Number.isFinite(options.trim.start))) {
            throw new TypeError('options.trim.start, when provided, must be a finite number.');
        }
        if (options.trim?.end !== undefined && (!Number.isFinite(options.trim.end))) {
            throw new TypeError('options.trim.end, when provided, must be a finite number.');
        }
        if (options.trim?.start !== undefined
            && options.trim.end !== undefined
            && options.trim.start >= options.trim.end) {
            throw new TypeError('options.trim.start must be less than options.trim.end.');
        }
        if (options.tags !== undefined
            && (typeof options.tags !== 'object' || !options.tags)
            && typeof options.tags !== 'function') {
            throw new TypeError('options.tags, when provided, must be an object or a function.');
        }
        if (typeof options.tags === 'object') {
            (0,metadata/* .validateMetadataTags */.VD)(options.tags);
        }
        if (options.showWarnings !== undefined && typeof options.showWarnings !== 'boolean') {
            throw new TypeError('options.showWarnings, when provided, must be a boolean.');
        }
        this._options = options;
        this._composable = composable;
        this.input = options.input;
        this.output = options.output;
    }
    /** @internal */
    async _init() {
        const inputFormat = await this.input.getFormat();
        let tracks;
        let trackMode = this._options.tracks;
        if (trackMode === undefined) {
            // HACK to keep bundle size low, temp for now
            const defaultTrackMode = inputFormat.name.includes('(HLS)')
                ? 'primary'
                : 'all';
            trackMode = defaultTrackMode;
        }
        if (trackMode === 'all') {
            tracks = await this.input.getTracks();
        }
        else if (trackMode === 'primary') {
            const primaryVideoTrack = await this.input.getPrimaryVideoTrack();
            const primaryAudioTrack = await this.input.getPrimaryAudioTrack();
            tracks = [primaryVideoTrack, primaryAudioTrack].filter(x => x !== null);
        }
        else {
            (0,misc/* .assertNever */.xb)(trackMode);
            (0,misc/* .assert */.vA)(false);
        }
        const outputTrackCounts = this.output.format.getSupportedTrackCounts();
        // Input track counters
        let nVideo = 1;
        let nAudio = 1;
        // All tracks that aren't discarded by the user
        const filteredTracks = [];
        const filteredTrackOptions = [];
        for (const track of tracks) {
            let trackOptions;
            if (track.isVideoTrack()) {
                if (this._options.video) {
                    if (typeof this._options.video === 'function') {
                        const returnedTrackOptions = await this._options.video(track, nVideo) ?? {};
                        if (Array.isArray(returnedTrackOptions)) {
                            for (const obj of returnedTrackOptions) {
                                validateVideoOptions(obj);
                            }
                        }
                        else {
                            validateVideoOptions(returnedTrackOptions);
                        }
                        trackOptions = Array.isArray(returnedTrackOptions)
                            ? returnedTrackOptions
                            : [returnedTrackOptions];
                        nVideo++;
                    }
                    else {
                        // Already validated
                        trackOptions = Array.isArray(this._options.video)
                            ? this._options.video
                            : [this._options.video];
                    }
                }
                else {
                    trackOptions = [{}];
                }
            }
            else if (track.isAudioTrack()) {
                if (this._options.audio) {
                    if (typeof this._options.audio === 'function') {
                        const returnedTrackOptions = await this._options.audio(track, nAudio) ?? {};
                        if (Array.isArray(returnedTrackOptions)) {
                            for (const obj of returnedTrackOptions) {
                                validateAudioOptions(obj);
                            }
                        }
                        else {
                            validateAudioOptions(returnedTrackOptions);
                        }
                        trackOptions = Array.isArray(returnedTrackOptions)
                            ? returnedTrackOptions
                            : [returnedTrackOptions];
                        nAudio++;
                    }
                    else {
                        // Already validated
                        trackOptions = Array.isArray(this._options.audio)
                            ? this._options.audio
                            : [this._options.audio];
                    }
                }
                else {
                    trackOptions = [{}];
                }
            }
            else {
                (0,misc/* .assert */.vA)(false);
            }
            const discardOptions = trackOptions.filter(x => x.discard);
            for (const discardOption of discardOptions) {
                this.discardedTracks.push({
                    track,
                    reason: 'discarded_by_user',
                    trackOptions: discardOption,
                });
            }
            if (trackOptions.length === discardOptions.length) {
                if (trackOptions.length === 0) {
                    this.discardedTracks.push({
                        track,
                        reason: 'discarded_by_user',
                        trackOptions: {},
                    });
                }
                continue;
            }
            const nonDiscardOptions = trackOptions.filter(x => !x.discard);
            filteredTracks.push(track);
            filteredTrackOptions.push(nonDiscardOptions);
        }
        if (this._options.trim?.start !== undefined) {
            this._startTimestamp = this._options.trim.start;
        }
        else {
            // Compute the start timestamp from the set of filtered tracks. Technically these can still be narrowed
            // down later due to discarded tracks, but we need to fix the start timestamp now due to track processing
            // depending on it.
            this._startTimestamp = Math.max(await this.input.getFirstTimestamp(filteredTracks), 
            // Samples can also have negative timestamps, but the meaning typically is "don't present me", so let's
            // cut those out by default.
            0);
        }
        this._endTimestamp = Math.max(this._options.trim?.end ?? Infinity, this._startTimestamp);
        // Run these sequentially so that output tracks have a deterministic order
        for (let i = 0; i < filteredTracks.length; i++) {
            const track = filteredTracks[i];
            const options = filteredTrackOptions[i];
            for (const option of options) {
                if (this.output.tracks.length === outputTrackCounts.total.max) {
                    this.discardedTracks.push({
                        track,
                        reason: 'max_track_count_reached',
                        trackOptions: option,
                    });
                    continue;
                }
                const addedCountOfType = this.output.tracks.reduce((count, t) => count + (t.type === track.type ? 1 : 0), 0);
                if (addedCountOfType === outputTrackCounts[track.type].max) {
                    this.discardedTracks.push({
                        track,
                        reason: 'max_track_count_of_type_reached',
                        trackOptions: option,
                    });
                    continue;
                }
                const outputTrackId = this._nextOutputTrackId++;
                if (track.isVideoTrack()) {
                    await this._processVideoTrack(track, option, outputTrackId);
                }
                else if (track.isAudioTrack()) {
                    await this._processAudioTrack(track, option, outputTrackId);
                }
                else {
                    (0,misc/* .assert */.vA)(false);
                }
            }
        }
        // When no track groups are set by the user, then the output track pairability should be *identical* to the
        // input's. We do the naive algorithm to achieve this: assign each track to its own group, and pair groups with
        // each other based on input track pairability.
        for (let i = 0; i < this.utilizedTracks.length - 1; i++) {
            for (let j = i + 1; j < this.utilizedTracks.length; j++) {
                const trackA = this.utilizedTracks[i];
                const trackB = this.utilizedTracks[j];
                const ownGroupA = this._outputOwnTrackGroups[i];
                const ownGroupB = this._outputOwnTrackGroups[j];
                (0,misc/* .assert */.vA)(ownGroupA !== undefined);
                (0,misc/* .assert */.vA)(ownGroupB !== undefined);
                if (ownGroupA && ownGroupB && trackA.canBePairedWith(trackB)) {
                    ownGroupA.pairWith(ownGroupB);
                }
            }
        }
        // Now, let's deal with metadata tags. A composable conversion does not touch the output's metadata tags; that
        // remains the responsibility of whoever owns the output.
        if (!this._composable) {
            const inputTags = await this.input.getMetadataTags();
            let outputTags;
            if (this._options.tags) {
                const result = typeof this._options.tags === 'function'
                    ? await this._options.tags(inputTags)
                    : this._options.tags;
                (0,metadata/* .validateMetadataTags */.VD)(result);
                outputTags = result;
            }
            else {
                outputTags = inputTags;
            }
            // Somewhat dirty but pragmatic
            const inputAndOutputFormatMatch = inputFormat.mimeType === this.output.format.mimeType;
            const rawTagsAreUnchanged = inputTags.raw === outputTags.raw;
            if (inputTags.raw && rawTagsAreUnchanged && !inputAndOutputFormatMatch) {
                // If the input and output formats aren't the same, copying over raw metadata tags makes no sense and
                // only results in junk tags, so let's cut them out.
                delete outputTags.raw;
            }
            this.output.setMetadataTags(outputTags);
        }
        // Let's check if the conversion can actually be executed
        if (!this._composable) {
            this.isValid = this.output.hasEnoughTracks() && this.output.tracks.length > 0;
        }
        else {
            // Checking Output start validity is not up to us. We even consider zero-track conversions to be valid
            this.isValid = true;
        }
        if (this._options.showWarnings ?? true) {
            const warnElements = [];
            const unintentionallyDiscardedTracks = this.discardedTracks.filter(x => x.reason !== 'discarded_by_user');
            if (unintentionallyDiscardedTracks.length > 0) {
                // Let's give the user a notice/warning about discarded tracks so they aren't confused
                warnElements.push('Some tracks had to be discarded from the conversion:', unintentionallyDiscardedTracks);
            }
            if (!this.isValid) {
                if (warnElements.length > 0) {
                    warnElements.push('\n\n');
                }
                warnElements.push(this._getInvalidityExplanation().join(''));
            }
            if (warnElements.length > 0) {
                logging/* .Logging._warn */.y._warn(...warnElements);
            }
        }
    }
    /** @internal */
    _getInvalidityExplanation() {
        const elements = [];
        if (this.discardedTracks.length === 0) {
            elements.push('Due to missing tracks, this conversion cannot be executed.');
        }
        else {
            const encodabilityIsTheProblem = this.discardedTracks.every(x => x.reason === 'discarded_by_user' || x.reason === 'no_encodable_target_codec') && this.discardedTracks.some(x => x.reason === 'no_encodable_target_codec');
            elements.push('Due to discarded tracks, this conversion cannot be executed.');
            if (encodabilityIsTheProblem) {
                const codecs = this.discardedTracks.flatMap((x) => {
                    if (x.reason === 'discarded_by_user')
                        return [];
                    let supportedCodecs;
                    if (x.track.type === 'video') {
                        supportedCodecs = this.output.format.getSupportedVideoCodecs();
                    }
                    else if (x.track.type === 'audio') {
                        supportedCodecs = this.output.format.getSupportedAudioCodecs();
                    }
                    else {
                        supportedCodecs = this.output.format.getSupportedSubtitleCodecs();
                    }
                    // If the user requested a specific codec, only that codec was ever attempted
                    return supportedCodecs.filter(codec => !x.trackOptions.codec || codec === x.trackOptions.codec);
                });
                const uniqueCodecs = [...new Set(codecs)];
                if (uniqueCodecs.length === 1) {
                    elements.push(`\nTracks were discarded because your environment is not able to encode '${uniqueCodecs[0]}'`
                        + ' with the provided parameters.');
                }
                else {
                    elements.push('\nTracks were discarded because your environment is not able to encode any of the codecs'
                        + ` ${uniqueCodecs.map(x => `'${x}'`).join(', ')} with the provided parameters.`);
                }
                if (uniqueCodecs.includes('mp3')) {
                    elements.push(`\nThe @mediabunny/mp3-encoder extension package provides support for encoding MP3.`);
                }
                if (uniqueCodecs.includes('aac')) {
                    elements.push('\nThe @mediabunny/aac-encoder extension package provides support for encoding AAC.');
                }
                if (uniqueCodecs.includes('ac3') || uniqueCodecs.includes('eac3')) {
                    elements.push('\nThe @mediabunny/ac3 extension package provides support'
                        + ' for encoding and decoding AC-3/E-AC-3.');
                }
                if (uniqueCodecs.includes('flac')) {
                    elements.push('\nThe @mediabunny/flac-encoder extension package provides support for encoding FLAC.');
                }
            }
            else {
                elements.push('\nCheck the discardedTracks field for more info.');
            }
        }
        return elements;
    }
    /**
     * Executes the conversion process and resolves when the conversion is complete. When
     * {@link ConversionExecuteOptions.until} is provided, the conversion will be suspended once that output timestamp
     * is reached and can be resumed with another call to `execute`. An ongoing execution may also be suspended via
     * {@link ConversionExecuteOptions.pauseSignal}.
     *
     * Execution will throw if `isValid` is `false`.
     */
    async execute(options = {}) {
        if (!options || typeof options !== 'object') {
            throw new TypeError('options must be an object.');
        }
        if (options.until !== undefined && (typeof options.until !== 'number' || Number.isNaN(options.until))) {
            throw new TypeError('options.until, when provided, must be a number.');
        }
        if (options.pauseSignal !== undefined && !(options.pauseSignal instanceof AbortSignal)) {
            throw new TypeError('options.pauseSignal, when provided, must be an AbortSignal.');
        }
        if (!this.isValid) {
            throw new Error('Cannot execute this conversion because its output configuration is invalid. Make sure to always check'
                + ' the isValid field before executing a conversion.\n'
                + this._getInvalidityExplanation().join(''));
        }
        if (this.state === 'executing') {
            throw new Error('Cannot call execute() while a previous call to execute() is still running.');
        }
        if (this.state === 'canceled') {
            throw new ConversionCanceledError();
        }
        if (this.state === 'done') {
            // The conversion already ran to completion, nothing left to do
            return;
        }
        if (this._composable && this.output.state === 'pending') {
            throw new Error('A composable conversion requires the output to be started. Call start() on the output before executing'
                + ' the conversion.');
        }
        this.state = 'executing';
        this._executionUntil = options.until ?? Infinity;
        this._pauseRequested = options.pauseSignal?.aborted ?? false;
        const onPause = () => {
            if (this.state !== 'executing') {
                return;
            }
            this._pauseRequested = true;
            // Release any pumps stuck in the synchronizer so they can reach their next checkpoint and suspend
            this._synchronizer.resolveAll();
        };
        options.pauseSignal?.addEventListener('abort', onPause);
        for (const pump of this._trackPumps) {
            if (!pump.done) {
                pump.resolvers = (0,misc/* .promiseWithResolvers */.nJ)();
            }
        }
        if (!this._executed) {
            this._executed = true;
            for (const id of this._outputTrackIds) {
                this._synchronizer.declareTrack(id);
            }
            if (this.onProgress) {
                // Compute duration using only the utilized tracks
                const uniqueUtilizedTracks = new Set(this.utilizedTracks);
                const durationPromises = [...uniqueUtilizedTracks].map(async (track) => {
                    if (await track.isLive()) {
                        return Infinity; // Upper bound (assuming no universe heat death)
                    }
                    return (await track.getDurationFromMetadata()) ?? (await track.computeDuration());
                });
                const duration = Math.max(0, ...await Promise.all(durationPromises));
                this._computeProgress = true;
                this._totalDuration = Math.min(duration - this._startTimestamp, this._endTimestamp - this._startTimestamp);
                for (const id of this._outputTrackIds) {
                    this._maxTimestamps.set(id, 0);
                }
                this.onProgress?.(0, 0);
            }
            if (!this._composable) {
                await this.output.start();
            }
            for (const pump of this._trackPumps) {
                pump.start();
            }
        }
        else {
            // Wake all suspended track pumps
            for (const pump of this._trackPumps) {
                pump.wake?.();
            }
        }
        try {
            await Promise.all(this._trackPumps.map(x => x.resolvers.promise));
        }
        catch (error) {
            if (this.state !== 'canceled') {
                // Make sure to cancel to stop other encoding processes and clean up resources
                void this.cancel();
            }
            throw error;
        }
        finally {
            options.pauseSignal?.removeEventListener('abort', onPause);
        }
        if (this.state === 'canceled') {
            throw new ConversionCanceledError();
        }
        const isDone = this._trackPumps.every(x => x.done);
        this.state = isDone ? 'done' : 'idle';
        if (isDone) {
            if (!this._composable) {
                await this.output.finalize();
            }
            if (this._computeProgress) {
                const minTimestamp = Math.min(...this._maxTimestamps.values());
                this.onProgress?.(1, minTimestamp);
            }
        }
    }
    /**
     * Cancels the conversion process, causing any ongoing `execute` call to throw a `ConversionCanceledError`.
     * Does nothing if the conversion is already complete.
     */
    async cancel() {
        if (this.state === 'done') {
            return;
        }
        if (this.state === 'canceled') {
            logging/* .Logging._warn */.y._warn('Conversion already canceled.');
            return;
        }
        this.state = 'canceled';
        // Wake all suspended track pumps so they can wind down
        for (const pump of this._trackPumps) {
            pump.wake?.();
        }
        this._synchronizer.resolveAll();
        if (!this._composable) {
            await this.output.cancel();
        }
    }
    /** @internal */
    async _processVideoTrack(track, trackOptions, outputTrackId) {
        const sourceCodec = await track.getCodec();
        if (!sourceCodec) {
            this.discardedTracks.push({
                track,
                reason: 'unknown_source_codec',
                trackOptions,
            });
            return;
        }
        let videoSource;
        const innateRotation = await track.getRotation();
        const totalRotation = (0,misc/* .normalizeRotation */.qT)(innateRotation + (trackOptions.rotate ?? 0));
        let outputTrackRotation = totalRotation;
        const canUseRotationMetadata = this.output.format.supportsVideoRotationMetadata
            && (trackOptions.allowRotationMetadata ?? true);
        const squarePixelWidth = await track.getSquarePixelWidth();
        const squarePixelHeight = await track.getSquarePixelHeight();
        const [rotatedWidth, rotatedHeight] = totalRotation % 180 === 0
            ? [squarePixelWidth, squarePixelHeight]
            : [squarePixelHeight, squarePixelWidth];
        let crop = trackOptions.crop;
        if (crop) {
            crop = (0,src_sample/* .clampCropRectangle */.px)(crop, rotatedWidth, rotatedHeight);
        }
        const [originalWidth, originalHeight] = crop
            ? [crop.width, crop.height]
            : [rotatedWidth, rotatedHeight];
        let width = originalWidth;
        let height = originalHeight;
        const aspectRatio = width / height;
        // A lot of video encoders require that the dimensions be multiples of 2
        if (trackOptions.width !== undefined && trackOptions.height === undefined) {
            width = (0,misc/* .ceilToMultipleOfTwo */._x)(trackOptions.width);
            height = (0,misc/* .ceilToMultipleOfTwo */._x)(Math.round(width / aspectRatio));
        }
        else if (trackOptions.width === undefined && trackOptions.height !== undefined) {
            height = (0,misc/* .ceilToMultipleOfTwo */._x)(trackOptions.height);
            width = (0,misc/* .ceilToMultipleOfTwo */._x)(Math.round(height * aspectRatio));
        }
        else if (trackOptions.width !== undefined && trackOptions.height !== undefined) {
            width = (0,misc/* .ceilToMultipleOfTwo */._x)(trackOptions.width);
            height = (0,misc/* .ceilToMultipleOfTwo */._x)(trackOptions.height);
        }
        const firstTimestamp = await track.getFirstTimestamp();
        let videoCodecs = this.output.format.getSupportedVideoCodecs();
        const needsTranscode = !!trackOptions.forceTranscode
            || firstTimestamp < this._startTimestamp
            || !!trackOptions.frameRate
            || trackOptions.keyFrameInterval !== undefined
            || trackOptions.process !== undefined
            || trackOptions.quality !== undefined
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            || trackOptions.bitrate !== undefined
            || !videoCodecs.includes(sourceCodec)
            || (trackOptions.codec && trackOptions.codec !== sourceCodec)
            || width !== originalWidth
            || height !== originalHeight
            // TODO This is suboptimal: Forcing a rerender when both rotation and process are set is not
            // performance-optimal, but right now there's no other way because we can't change the track rotation
            // metadata after the output has already started. Should be possible with API changes in v2, though!
            || (totalRotation !== 0 && !canUseRotationMetadata)
            || !!crop;
        const alpha = trackOptions.alpha ?? 'discard';
        if (!needsTranscode) {
            // Fast path, we can simply copy over the encoded packets
            const source = new media_source/* .EncodedVideoPacketSource */.pO(sourceCodec);
            videoSource = source;
            this._registerTrackPump(async (pump) => {
                const sink = new media_sink/* .EncodedPacketSink */.kQ(track);
                const decoderConfig = await track.getDecoderConfig();
                const meta = { decoderConfig: decoderConfig ?? undefined };
                for await (const packet of sink.packets(undefined, undefined, { verifyKeyPackets: true })) {
                    if (this.state === 'canceled') {
                        break;
                    }
                    if (packet.timestamp >= this._endTimestamp) {
                        break;
                    }
                    const modifiedPacket = packet.clone({
                        timestamp: packet.timestamp - this._startTimestamp,
                        sideData: alpha === 'discard'
                            ? {} // Remove alpha side data
                            : packet.sideData,
                    });
                    (0,misc/* .assert */.vA)(modifiedPacket.timestamp >= 0);
                    this._reportProgress(outputTrackId, modifiedPacket.timestamp + modifiedPacket.duration);
                    await source.add(modifiedPacket, meta);
                    if (this._synchronizer.shouldWait(outputTrackId, modifiedPacket.timestamp)) {
                        await this._synchronizer.wait(modifiedPacket.timestamp);
                    }
                    await this._checkpoint(pump, modifiedPacket.timestamp);
                }
                source.close();
                this._synchronizer.closeTrack(outputTrackId);
            });
        }
        else {
            // We need to decode & reencode the video
            const canDecode = await track.canDecode();
            if (!canDecode) {
                this.discardedTracks.push({
                    track,
                    reason: 'undecodable_source_codec',
                    trackOptions,
                });
                return;
            }
            if (trackOptions.codec) {
                videoCodecs = videoCodecs.filter(codec => codec === trackOptions.codec);
            }
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const quality = (0,encode/* .resolveQuality */.WS)(trackOptions.quality, trackOptions.bitrate)
                ?? new encode/* .Quality */.en('high');
            const encodableCodec = await (0,encode/* .getFirstEncodableVideoCodec */.Tn)(videoCodecs, {
                width: trackOptions.process && trackOptions.processedWidth
                    ? trackOptions.processedWidth
                    : width,
                height: trackOptions.process && trackOptions.processedHeight
                    ? trackOptions.processedHeight
                    : height,
                quality,
            });
            if (!encodableCodec) {
                this.discardedTracks.push({
                    track,
                    reason: 'no_encodable_target_codec',
                    trackOptions,
                });
                return;
            }
            const encodingConfig = {
                codec: encodableCodec,
                quality,
                keyFrameInterval: trackOptions.keyFrameInterval,
                sizeChangeBehavior: trackOptions.fit ?? 'passThrough',
                alpha,
                hardwareAcceleration: trackOptions.hardwareAcceleration,
                transform: {},
            };
            (0,misc/* .assert */.vA)(encodingConfig.transform);
            let needsRerender = width !== originalWidth
                || height !== originalHeight
                || (totalRotation !== 0 && (!canUseRotationMetadata || trackOptions.process !== undefined))
                || !!crop
                // Don't expect encoders to reliably handle non-square pixels:
                || squarePixelWidth !== await track.getCodedWidth()
                || squarePixelHeight !== await track.getCodedHeight();
            if (!needsRerender) {
                const env_1 = { stack: [], error: void 0, hasError: false };
                try {
                    // If we're directly passing decoded samples back to the encoder, sometimes the encoder may error due
                    // to lack of support of certain video frame formats, like when HDR is at play. To check for this, we
                    // first try to pass a single frame to the encoder to see how it behaves. If it throws, we then fall
                    // back to the rerender path.
                    //
                    // Creating a new temporary Output is sort of hacky, but due to a lack of an isolated encoder API right
                    // now, this is the simplest way. Will refactor in the future! TODO
                    const tempOutput = new src_output/* .Output */.k7({
                        format: new output_format/* .Mp4OutputFormat */.si(), // Supports all video codecs
                        target: new target/* .NullTarget */.D$(),
                    });
                    const tempSource = new media_source/* .VideoSampleSource */.Fl(encodingConfig);
                    tempOutput.addVideoTrack(tempSource);
                    await tempOutput.start();
                    const sink = new media_sink/* .VideoSampleSink */.lc(track);
                    const firstSample = __addDisposableResource(env_1, await sink.getSample(firstTimestamp), false); // Let's just use the first sample
                    if (firstSample) {
                        try {
                            await tempSource.add(firstSample);
                            firstSample.close();
                            await tempOutput.finalize();
                        }
                        catch (error) {
                            logging/* .Logging._warn */.y._warn('An error occurred when probing encoder support. Falling back to rerender path.', error);
                            void tempOutput.cancel();
                            needsRerender = true;
                            encodingConfig.transform.force = true;
                        }
                    }
                    else {
                        await tempOutput.cancel();
                    }
                }
                catch (e_1) {
                    env_1.error = e_1;
                    env_1.hasError = true;
                }
                finally {
                    __disposeResources(env_1);
                }
            }
            if (trackOptions.frameRate) {
                encodingConfig.transform.frameRate = trackOptions.frameRate;
            }
            if (trackOptions.process) {
                encodingConfig.transform.process = trackOptions.process;
            }
            if (needsRerender) {
                outputTrackRotation = 0; // Since the rotation is baked into the output
                encodingConfig.transform.width = width;
                encodingConfig.transform.height = height;
                encodingConfig.transform.fit = trackOptions.fit ?? 'fill';
                encodingConfig.transform.rotate = (0,misc/* .normalizeRotation */.qT)(totalRotation - innateRotation);
                encodingConfig.transform.crop = crop;
                encodingConfig.transform.alpha = alpha;
            }
            // We need to do this because `process` can emit new timestamps
            let lastSampleTimestamp = null;
            encodingConfig.onEncodedSample = (sample) => {
                lastSampleTimestamp = sample.timestamp;
            };
            const source = new media_source/* .VideoSampleSource */.Fl(encodingConfig);
            videoSource = source;
            this._registerTrackPump(async (pump) => {
                const sink = new media_sink/* .VideoSampleSink */.lc(track);
                for await (const sample_1 of sink.samples(this._startTimestamp, this._endTimestamp)) {
                    const env_2 = { stack: [], error: void 0, hasError: false };
                    try {
                        const sample = __addDisposableResource(env_2, sample_1, false);
                        if (this.state === 'canceled') {
                            break;
                        }
                        const adjustedSampleTimestamp = Math.max(sample.timestamp - this._startTimestamp, 0);
                        sample.setTimestamp(adjustedSampleTimestamp);
                        this._reportProgress(outputTrackId, sample.timestamp + sample.duration);
                        await source.add(sample);
                        sample.close();
                        if (lastSampleTimestamp !== null) {
                            if (this._synchronizer.shouldWait(outputTrackId, lastSampleTimestamp)) {
                                await this._synchronizer.wait(lastSampleTimestamp);
                            }
                            await this._checkpoint(pump, lastSampleTimestamp);
                        }
                    }
                    catch (e_2) {
                        env_2.error = e_2;
                        env_2.hasError = true;
                    }
                    finally {
                        __disposeResources(env_2);
                    }
                }
                source.close();
                this._synchronizer.closeTrack(outputTrackId);
            });
        }
        let ownGroup = null;
        if (!trackOptions.group && !this._composable) {
            // Create per-track groups to replicate the input's pairability graph. Don't do this for composable
            // conversions.
            ownGroup = new src_output/* .OutputTrackGroup */.Q6();
        }
        const videoTrackLanguageCode = await track.getLanguageCode();
        this.output.addVideoTrack(videoSource, {
            frameRate: trackOptions.frameRate,
            // TODO: This condition can be removed when all demuxers properly homogenize to BCP47 in v2
            languageCode: (0,misc/* .isIso639Dash2LanguageCode */.Nu)(videoTrackLanguageCode) ? videoTrackLanguageCode : undefined,
            name: await track.getName() ?? undefined,
            disposition: await track.getDisposition(),
            rotation: outputTrackRotation,
            group: ownGroup ?? trackOptions.group,
        });
        this.utilizedTracks.push(track);
        this._outputTrackIds.push(outputTrackId);
        this._outputOwnTrackGroups.push(ownGroup);
    }
    /** @internal */
    async _processAudioTrack(track, trackOptions, outputTrackId) {
        const sourceCodec = await track.getCodec();
        if (!sourceCodec) {
            this.discardedTracks.push({
                track,
                reason: 'unknown_source_codec',
                trackOptions,
            });
            return;
        }
        let audioSource;
        const originalNumberOfChannels = await track.getNumberOfChannels();
        const originalSampleRate = await track.getSampleRate();
        const firstTimestamp = await track.getFirstTimestamp();
        let numberOfChannels = trackOptions.numberOfChannels ?? originalNumberOfChannels;
        let sampleRate = trackOptions.sampleRate ?? originalSampleRate;
        const needsTrimming = firstTimestamp < this._startTimestamp;
        let needsPadding = firstTimestamp > this._startTimestamp && !this.output.format.supportsTimestampedMediaData;
        let audioCodecs = this.output.format.getSupportedAudioCodecs();
        if (!trackOptions.forceTranscode
            && !trackOptions.quality
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            && !trackOptions.bitrate
            && numberOfChannels === originalNumberOfChannels
            && sampleRate === originalSampleRate
            && !needsTrimming
            && !needsPadding
            && audioCodecs.includes(sourceCodec)
            && (!trackOptions.codec || trackOptions.codec === sourceCodec)
            && !trackOptions.process
            && trackOptions.sampleFormat === undefined) {
            // Fast path, we can simply copy over the encoded packets
            const source = new media_source/* .EncodedAudioPacketSource */.m(sourceCodec);
            audioSource = source;
            this._registerTrackPump(async (pump) => {
                const sink = new media_sink/* .EncodedPacketSink */.kQ(track);
                const decoderConfig = await track.getDecoderConfig();
                const meta = { decoderConfig: decoderConfig ?? undefined };
                for await (const packet of sink.packets()) {
                    if (this.state === 'canceled') {
                        break;
                    }
                    if (packet.timestamp >= this._endTimestamp) {
                        break;
                    }
                    const modifiedPacket = packet.clone({
                        timestamp: packet.timestamp - this._startTimestamp,
                    });
                    (0,misc/* .assert */.vA)(modifiedPacket.timestamp >= 0);
                    this._reportProgress(outputTrackId, modifiedPacket.timestamp + modifiedPacket.duration);
                    await source.add(modifiedPacket, meta);
                    if (this._synchronizer.shouldWait(outputTrackId, modifiedPacket.timestamp)) {
                        await this._synchronizer.wait(modifiedPacket.timestamp);
                    }
                    await this._checkpoint(pump, modifiedPacket.timestamp);
                }
                source.close();
                this._synchronizer.closeTrack(outputTrackId);
            });
        }
        else {
            // We need to decode & reencode the audio
            const canDecode = await track.canDecode();
            if (!canDecode) {
                this.discardedTracks.push({
                    track,
                    reason: 'undecodable_source_codec',
                    trackOptions,
                });
                return;
            }
            let codecOfChoice = null;
            if (trackOptions.codec) {
                audioCodecs = audioCodecs.filter(codec => codec === trackOptions.codec);
            }
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const quality = (0,encode/* .resolveQuality */.WS)(trackOptions.quality, trackOptions.bitrate)
                ?? new encode/* .Quality */.en('high');
            const encodableCodecs = await (0,encode/* .getEncodableAudioCodecs */.Xq)(audioCodecs, {
                numberOfChannels: trackOptions.process && trackOptions.processedNumberOfChannels
                    ? trackOptions.processedNumberOfChannels
                    : numberOfChannels,
                sampleRate: trackOptions.process && trackOptions.processedSampleRate
                    ? trackOptions.processedSampleRate
                    : sampleRate,
                quality,
            });
            if (!encodableCodecs.some(codec => src_codec/* .NON_PCM_AUDIO_CODECS.includes */.YB.includes(codec))
                && audioCodecs.some(codec => src_codec/* .NON_PCM_AUDIO_CODECS.includes */.YB.includes(codec))
                && (numberOfChannels !== FALLBACK_NUMBER_OF_CHANNELS || sampleRate !== FALLBACK_SAMPLE_RATE)) {
                // We could not find a compatible non-PCM codec despite the container supporting them. This can be
                // caused by strange channel count or sample rate configurations. Therefore, let's try again but with
                // fallback parameters.
                const encodableCodecsWithDefaultParams = await (0,encode/* .getEncodableAudioCodecs */.Xq)(audioCodecs, {
                    numberOfChannels: FALLBACK_NUMBER_OF_CHANNELS,
                    sampleRate: FALLBACK_SAMPLE_RATE,
                    quality,
                });
                const nonPcmCodec = encodableCodecsWithDefaultParams
                    .find(codec => src_codec/* .NON_PCM_AUDIO_CODECS.includes */.YB.includes(codec));
                if (nonPcmCodec) {
                    // We are able to encode using a non-PCM codec, but it'll require resampling
                    codecOfChoice = nonPcmCodec;
                    numberOfChannels = FALLBACK_NUMBER_OF_CHANNELS;
                    sampleRate = FALLBACK_SAMPLE_RATE;
                }
            }
            else {
                codecOfChoice = encodableCodecs[0] ?? null;
            }
            if (codecOfChoice === null) {
                this.discardedTracks.push({
                    track,
                    reason: 'no_encodable_target_codec',
                    trackOptions,
                });
                return;
            }
            const encodingConfig = {
                codec: codecOfChoice,
                quality,
                transform: {
                    sampleFormat: trackOptions.sampleFormat,
                    process: trackOptions.process,
                },
            };
            (0,misc/* .assert */.vA)(encodingConfig.transform);
            if (numberOfChannels !== originalNumberOfChannels) {
                encodingConfig.transform.numberOfChannels = numberOfChannels;
            }
            if (sampleRate !== originalSampleRate) {
                encodingConfig.transform.sampleRate = sampleRate;
            }
            let lastSampleTimestamp = null;
            encodingConfig.onEncodedSample = (sample) => {
                lastSampleTimestamp = sample.timestamp;
            };
            const source = new media_source/* .AudioSampleSource */.Ii(encodingConfig);
            audioSource = source;
            this._registerTrackPump(async (pump) => {
                const sink = new media_sink/* .AudioSampleSink */.qw(track);
                for await (const sample_2 of sink.samples(this._startTimestamp, this._endTimestamp)) {
                    const env_3 = { stack: [], error: void 0, hasError: false };
                    try {
                        const sample = __addDisposableResource(env_3, sample_2, false);
                        if (this.state === 'canceled') {
                            break;
                        }
                        if (needsPadding) {
                            const env_4 = { stack: [], error: void 0, hasError: false };
                            try {
                                // Add one padding sample at the beginning
                                const paddingLength = firstTimestamp - this._startTimestamp;
                                const paddingLengthSamples = Math.round(paddingLength * originalSampleRate);
                                const bytesPerSample = (0,src_sample/* .getBytesPerSample */.Dw)(sample.format);
                                const data = new Uint8Array(bytesPerSample * paddingLengthSamples * originalNumberOfChannels);
                                if (sample.format === 'u8' || sample.format === 'u8-planar') {
                                    data.fill(2 ** 7); // Fill it with the silent value
                                }
                                const silentSample = __addDisposableResource(env_4, new src_sample/* .AudioSample */.B1({
                                    data,
                                    // Use the same format the decoder is spitting out. This avoids feeding changing sample
                                    // formats to the audio encoder.
                                    format: sample.format,
                                    numberOfChannels: originalNumberOfChannels,
                                    sampleRate: originalSampleRate,
                                    timestamp: 0,
                                }), false);
                                await this._registerAudioSample(pump, silentSample, source, outputTrackId, () => lastSampleTimestamp);
                                needsPadding = false;
                            }
                            catch (e_3) {
                                env_4.error = e_3;
                                env_4.hasError = true;
                            }
                            finally {
                                __disposeResources(env_4);
                            }
                        }
                        let startFrame = 0;
                        let endFrame = sample.numberOfFrames;
                        if (sample.timestamp < this._startTimestamp) {
                            startFrame = Math.round((this._startTimestamp - sample.timestamp) * sample.sampleRate);
                        }
                        if (sample.timestamp + sample.duration > this._endTimestamp) {
                            endFrame = Math.round((this._endTimestamp - sample.timestamp) * sample.sampleRate);
                        }
                        // Can't assign to "using" identifiers so we gotta do this
                        let finalSampleLet;
                        if (startFrame > 0 || endFrame < sample.numberOfFrames) {
                            // Trim the sample if it sticks out of the trim region on either end
                            const trimmedSample = sample.trim(startFrame, endFrame);
                            sample.close();
                            finalSampleLet = trimmedSample;
                            if (trimmedSample.numberOfFrames === 0) {
                                trimmedSample.close();
                                continue;
                            }
                        }
                        else {
                            finalSampleLet = sample;
                        }
                        const finalSample = __addDisposableResource(env_3, finalSampleLet, false);
                        // Offset the timestamp as needed
                        finalSample.setTimestamp(finalSample.timestamp - this._startTimestamp);
                        await this._registerAudioSample(pump, finalSample, source, outputTrackId, () => lastSampleTimestamp);
                    }
                    catch (e_4) {
                        env_3.error = e_4;
                        env_3.hasError = true;
                    }
                    finally {
                        __disposeResources(env_3);
                    }
                }
                source.close();
                this._synchronizer.closeTrack(outputTrackId);
            });
        }
        let ownGroup = null;
        if (!trackOptions.group && !this._composable) {
            // Create per-track groups to replicate the input's pairability graph. Don't do this for composable
            // conversions.
            ownGroup = new src_output/* .OutputTrackGroup */.Q6();
        }
        const audioTrackLanguageCode = await track.getLanguageCode();
        this.output.addAudioTrack(audioSource, {
            // TODO: This condition can be removed when all demuxers properly homogenize to BCP47 in v2
            languageCode: (0,misc/* .isIso639Dash2LanguageCode */.Nu)(audioTrackLanguageCode) ? audioTrackLanguageCode : undefined,
            name: await track.getName() ?? undefined,
            disposition: await track.getDisposition(),
            group: ownGroup ?? trackOptions.group,
        });
        this.utilizedTracks.push(track);
        this._outputTrackIds.push(outputTrackId);
        this._outputOwnTrackGroups.push(ownGroup);
    }
    /** @internal */
    async _registerAudioSample(pump, sample, source, outputTrackId, getLastSampleTimestamp) {
        this._reportProgress(outputTrackId, sample.timestamp + sample.duration);
        await source.add(sample);
        sample.close();
        const lastSampleTimestamp = getLastSampleTimestamp();
        if (lastSampleTimestamp !== null) {
            if (this._synchronizer.shouldWait(outputTrackId, lastSampleTimestamp)) {
                await this._synchronizer.wait(lastSampleTimestamp);
            }
            await this._checkpoint(pump, lastSampleTimestamp);
        }
    }
    /** @internal */
    _registerTrackPump(fn) {
        const pump = {
            done: false,
            resolvers: (0,misc/* .promiseWithResolvers */.nJ)(),
            wake: null,
            start: () => {
                void fn(pump).then(() => {
                    pump.done = true;
                    pump.resolvers.resolve();
                }, (error) => {
                    pump.resolvers.reject(error);
                });
            },
        };
        this._trackPumps.push(pump);
    }
    /** @internal */
    async _checkpoint(pump, timestamp) {
        while (this.state !== 'canceled' && (timestamp >= this._executionUntil || this._pauseRequested)) {
            // We've reached the target; signal it and suspend until the next execution wakes us up
            pump.resolvers.resolve();
            const { promise, resolve } = (0,misc/* .promiseWithResolvers */.nJ)();
            pump.wake = resolve;
            await promise;
        }
    }
    /** @internal */
    _reportProgress(trackId, endTimestamp) {
        if (!this._computeProgress) {
            return;
        }
        (0,misc/* .assert */.vA)(this._totalDuration !== null);
        this._maxTimestamps.set(trackId, Math.max(endTimestamp, this._maxTimestamps.get(trackId)));
        const minTimestamp = Math.min(...this._maxTimestamps.values());
        const newProgress = (0,misc/* .clamp */.qE)(minTimestamp / this._totalDuration, 0, 1);
        if (newProgress !== this._lastProgress) {
            this._lastProgress = newProgress;
            this.onProgress?.(newProgress, minTimestamp);
        }
    }
}
/**
 * Thrown when a conversion couldn't complete due to being canceled.
 * @group Conversion
 * @public
 */
class ConversionCanceledError extends Error {
    /** Creates a new {@link ConversionCanceledError}. */
    constructor(message = 'Conversion has been canceled.') {
        super(message);
        this.name = 'ConversionCanceledError';
    }
}
const MAX_TIMESTAMP_GAP = 1; // in seconds
/**
 * Utility class for synchronizing multiple track packet consumers with one another. We don't want one consumer to get
 * too out-of-sync with the others, as that may lead to a large number of packets that need to be internally buffered
 * before they can be written. Therefore, we use this class to slow down a consumer if it is too far ahead of the
 * slowest consumer.
 */
class TrackSynchronizer {
    constructor(conversion) {
        this.maxTimestamps = new Map(); // Track ID -> timestamp
        this.resolvers = [];
        this.conversion = conversion;
    }
    declareTrack(trackId) {
        this.maxTimestamps.set(trackId, 0);
    }
    shouldWait(trackId, timestamp) {
        const currentValue = this.maxTimestamps.get(trackId);
        (0,misc/* .assert */.vA)(currentValue !== undefined);
        this.maxTimestamps.set(trackId, Math.max(timestamp, currentValue));
        const newMin = this.computeMinAndMaybeResolve();
        if (this.conversion.state === 'canceled'
            || this.conversion._pauseRequested
            || timestamp >= this.conversion._executionUntil) {
            // No point in throttling consumers that are about to suspend or wind down anyway
            return false;
        }
        return timestamp - newMin > MAX_TIMESTAMP_GAP; // Should wait if it is too far ahead of the slowest consumer
    }
    wait(timestamp) {
        const { promise, resolve } = (0,misc/* .promiseWithResolvers */.nJ)();
        this.resolvers.push({
            timestamp,
            resolve,
        });
        return promise;
    }
    closeTrack(trackId) {
        this.maxTimestamps.delete(trackId);
        this.computeMinAndMaybeResolve();
    }
    resolveAll() {
        for (const entry of this.resolvers) {
            entry.resolve();
        }
        this.resolvers.length = 0;
    }
    computeMinAndMaybeResolve() {
        let newMin = Infinity;
        for (const [, timestamp] of this.maxTimestamps) {
            newMin = Math.min(newMin, timestamp);
        }
        for (let i = 0; i < this.resolvers.length; i++) {
            const entry = this.resolvers[i];
            if (entry.timestamp - newMin < MAX_TIMESTAMP_GAP) {
                // The gap has gotten small enough again, the consumer can continue again
                entry.resolve();
                this.resolvers.splice(i, 1);
                i--;
            }
        }
        return newMin;
    }
}

;// CONCATENATED MODULE: ./node_modules/@remotion/studio/dist/esm/CaptionQueueProcessor-k0yrm3dj.mjs





// src/components/RenderQueue/CaptionQueueProcessor.tsx



// src/components/Transcription/resample-media-to-16-khz.ts


var resampleMediaTo16Khz = async ({
  src,
  audioStreamIndex,
  requestInit,
  onProgress
}) => {
  const input = new src_input/* .Input */.pd({
    formats: input_format/* .ALL_FORMATS */.XE,
    source: new src_source/* .UrlSource */.Ts(src, requestInit === null ? {} : { requestInit })
  });
  const waveformChunks = [];
  try {
    onProgress(0);
    const audioTracks = await input.getAudioTracks();
    const primaryVideoTrack = audioStreamIndex === null ? await input.getPrimaryVideoTrack() : null;
    const audioTrack = audioStreamIndex !== null ? audioTracks[audioStreamIndex] ?? null : primaryVideoTrack ? await primaryVideoTrack.getPrimaryPairableAudioTrack() : audioTracks[0] ?? null;
    if (audioTrack === null) {
      throw new Error("The selected media does not have an audio track.");
    }
    if (await audioTrack.isLive()) {
      throw new Error("Live media cannot be transcribed.");
    }
    const output = new src_output/* .Output */.k7({
      format: new output_format/* .WavOutputFormat */.hR,
      target: new target/* .NullTarget */.D$
    });
    const conversion = await Conversion.init({
      input,
      output,
      tracks: "all",
      video: { discard: true },
      audio: (track) => {
        if (track.id !== audioTrack.id) {
          return { discard: true };
        }
        return {
          codec: "pcm-f32",
          forceTranscode: true,
          numberOfChannels: 1,
          process: (sample) => {
            const floats = new Float32Array(sample.allocationSize({ format: "f32", planeIndex: 0 }) / Float32Array.BYTES_PER_ELEMENT);
            sample.copyTo(floats, { format: "f32", planeIndex: 0 });
            waveformChunks.push({
              startFrame: Math.round(sample.timestamp * esm/* .WHISPER_WEBGPU_SAMPLE_RATE */.Qz),
              waveform: floats
            });
            return sample;
          },
          sampleFormat: "f32",
          sampleRate: esm/* .WHISPER_WEBGPU_SAMPLE_RATE */.Qz
        };
      }
    });
    if (!conversion.isValid) {
      throw new Error("The audio track cannot be decoded in this browser. Try converting the media to WAV first.");
    }
    conversion.onProgress = (progress) => onProgress(progress);
    await conversion.execute();
    onProgress(1);
  } finally {
    input.dispose();
  }
  const waveformLength = waveformChunks.reduce((maximum, chunk) => Math.max(maximum, chunk.startFrame + chunk.waveform.length), 0);
  const waveform = new Float32Array(waveformLength);
  for (const chunk of waveformChunks) {
    const destinationStart = Math.max(0, chunk.startFrame);
    const sourceStart = Math.max(0, -chunk.startFrame);
    const availableLength = Math.min(chunk.waveform.length - sourceStart, waveform.length - destinationStart);
    if (availableLength > 0) {
      waveform.set(chunk.waveform.subarray(sourceStart, sourceStart + availableLength), destinationStart);
    }
  }
  return waveform;
};

// src/components/RenderQueue/CaptionQueueProcessor.tsx
var CaptionQueueProcessor = () => {
  const {
    updateCaptionJobProgress,
    markCaptionJobDone,
    markCaptionJobFailed,
    setProcessCaptionJobCallback
  } = (0,react.useContext)(index_9x6e1dq0/* .RenderQueueContext */.x7);
  const processJob = (0,react.useCallback)(async (job) => {
    let captionCount = null;
    let processingError = null;
    try {
      updateCaptionJobProgress(job.id, {
        message: "Checking WebGPU support...",
        value: 0
      });
      const support = await (0,esm/* .canUseWhisperWebGpu */.cK)();
      if (!support.supported) {
        throw new Error(support.detailedReason);
      }
      updateCaptionJobProgress(job.id, {
        message: `Checking ${job.model}...`,
        value: 0.02
      });
      await (0,esm/* .clearStaleModels */.x4)();
      await (0,index_v4tr1bft/* .loadModelForJob */.k)({
        model: job.model,
        progressStart: 0.03,
        progressSpan: 0.27,
        isModelCached: (model) => (0,esm/* .isWhisperModelCached */.eW)({ model }),
        loadModel: (model, onProgress) => (0,esm/* .loadWhisperModel */.oA)({
          model,
          onProgress: (progress) => onProgress(progress.progress)
        }),
        updateProgress: (progress) => updateCaptionJobProgress(job.id, progress)
      });
      updateCaptionJobProgress(job.id, {
        message: `Preparing ${job.displayName}...`,
        value: 0.3
      });
      const channelWaveform = await resampleMediaTo16Khz({
        src: job.src,
        audioStreamIndex: job.audioStreamIndex,
        requestInit: job.requestInit,
        onProgress: (progress) => {
          updateCaptionJobProgress(job.id, {
            message: `Preparing ${job.displayName}...`,
            value: 0.3 + progress * 0.2
          });
        }
      });
      updateCaptionJobProgress(job.id, {
        message: `Transcribing ${job.displayName}...`,
        value: 0.5
      });
      const transcription = await (0,esm/* .transcribe */.ke)({
        channelWaveform,
        model: job.model,
        task: job.task,
        chunkLengthInSeconds: job.chunkLengthInSeconds,
        strideLengthInSeconds: job.strideLengthInSeconds,
        forceFullSequences: job.forceFullSequences,
        doSample: job.doSample,
        temperature: job.temperature,
        topK: job.topK,
        repetitionPenalty: job.repetitionPenalty,
        noRepeatNgramSize: job.noRepeatNgramSize,
        ...job.language === null ? {} : { language: job.language }
      });
      const { captions } = (0,esm/* .toCaptions */.ve)({
        whisperWebGpuOutput: transcription
      });
      updateCaptionJobProgress(job.id, {
        message: `Saving ${job.outName}...`,
        value: 0.95
      });
      await (0,index_cw0pnpg5/* .writeStaticFile */.sV)({
        contents: JSON.stringify(captions, null, 2),
        filePath: job.outName
      });
      captionCount = captions.length;
    } catch (error) {
      processingError = error instanceof Error ? error : new Error(String(error));
    }
    try {
      await (0,esm/* .disposeWhisperModel */.xO)({ model: job.model });
    } catch {}
    if (processingError) {
      markCaptionJobFailed(job.id, processingError);
    } else {
      markCaptionJobDone(job.id, captionCount ?? 0);
    }
  }, [markCaptionJobDone, markCaptionJobFailed, updateCaptionJobProgress]);
  (0,react.useEffect)(() => {
    setProcessCaptionJobCallback(processJob);
    return () => setProcessCaptionJobCallback(null);
  }, [processJob, setProcessCaptionJobCallback]);
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
//# sourceMappingURL=970.bundle.js.map