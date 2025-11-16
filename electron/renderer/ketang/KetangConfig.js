"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScreenConfig = exports.getVideoConfig = void 0;
const SCREEN_CONFIG = {
    "1080p_1": {
        width: 1920,
        height: 1080,
        bitrate: 0,
        frameRate: 15,
        captureMouseCursor: true,
        windowFocus: true,
        highLightWidth: 0,
        highLightColor: 0,
        enableHighLight: false,
        webProfile: "1080p_1",
    },
    "720p_1": {
        width: 1280,
        height: 720,
        bitrate: 0,
        frameRate: 15,
        captureMouseCursor: true,
        windowFocus: true,
        highLightWidth: 0,
        highLightColor: 0,
        enableHighLight: false,
        webProfile: "720p_1",
    },
};
const VIDEO_CONFIG = {
    change: 0,
    "180p_1": {
        width: 640,
        height: 360,
        bitrate: 0,
        frameRate: 15,
        webProfile: "360p_1",
    },
    "180p_1_bak": {
        width: 320,
        height: 180,
        bitrate: 0,
        frameRate: 15,
        webProfile: "180p_1",
    },
    "360p_1": {
        width: 640,
        height: 360,
        bitrate: 0,
        frameRate: 15,
        webProfile: "360p_1",
    },
    "720p_1": {
        width: 1280,
        height: 720,
        bitrate: 0,
        frameRate: 15,
        webProfile: "720p_1",
    },
    "1080p_1": {
        width: 1920,
        height: 1080,
        bitrate: 0,
        frameRate: 15,
        webProfile: "1080p_1",
    },
};
function getVideoConfig(configTag) {
    let videoConfig = VIDEO_CONFIG[configTag];
    if (videoConfig) {
        videoConfig.dimensions = {
            width: videoConfig.width,
            height: videoConfig.height,
        };
        return videoConfig;
    }
}
exports.getVideoConfig = getVideoConfig;
function getScreenConfig(configTag) {
    let screenConfig = SCREEN_CONFIG[configTag];
    if (screenConfig) {
        screenConfig.dimensions = {
            width: screenConfig.width,
            height: screenConfig.height,
        };
        return screenConfig;
    }
}
exports.getScreenConfig = getScreenConfig;
//# sourceMappingURL=KetangConfig.js.map