"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopDesktopShareOnly = exports.startDesktopShareOnly = exports.onDirectCdnStreamingStats = exports.onDirectCdnStreamingStateChanged = exports.stopDirectCdnStreaming = exports.startDirectCdnStreaming = exports.setDirectCdnStreamingVideoConfiguration = exports.setDirectCdnStreamingAudioConfiguration = exports.init = void 0;
const DateUtil_1 = require("../../utils/DateUtil");
const RendererHelper = __importStar(require("../RendererHelper"));
const RtcSdk_1 = require("../rtcsdk/RtcSdk");
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
let m_RtcSdk;
let m_LogPath;
async function init(appid) {
    m_RtcSdk = (0, RtcSdk_1.createRtcSdk)(0);
    if (!m_LogPath) {
        m_LogPath = await RendererHelper.getUserLogPath();
    }
    let agoraLogPath = path_1.default.join(m_LogPath, `agoraSdk_${(0, DateUtil_1.dateFormat)("yyyyMMdd")}.log`);
    let ret = await m_RtcSdk.initialize(appid, undefined, undefined, 0, {
        filePath: agoraLogPath,
        fileSizeInKB: 20480,
        level: 1,
    });
    if (ret != 0) {
        console.warn("rtc sdk init error:", ret);
    }
    else {
        m_RtcSdk.enableAudio();
        m_RtcSdk.enableVideo();
        m_RtcSdk.enableLoopbackRecording(true);
    }
}
exports.init = init;
function setDirectCdnStreamingAudioConfiguration(profile) {
    return m_RtcSdk.setDirectCdnStreamingAudioConfiguration(profile);
}
exports.setDirectCdnStreamingAudioConfiguration = setDirectCdnStreamingAudioConfiguration;
function setDirectCdnStreamingVideoConfiguration(config) {
    return m_RtcSdk.setDirectCdnStreamingVideoConfiguration(config);
}
exports.setDirectCdnStreamingVideoConfiguration = setDirectCdnStreamingVideoConfiguration;
function startDirectCdnStreaming(eventHandler, publishUrl, options) {
    return m_RtcSdk.startDirectCdnStreaming(eventHandler, publishUrl, options);
}
exports.startDirectCdnStreaming = startDirectCdnStreaming;
function stopDirectCdnStreaming() {
    return m_RtcSdk.stopDirectCdnStreaming();
}
exports.stopDirectCdnStreaming = stopDirectCdnStreaming;
function onDirectCdnStreamingStateChanged(callback) {
    m_RtcSdk.onRtcEvent("onDirectCdnStreamingStateChanged", callback);
}
exports.onDirectCdnStreamingStateChanged = onDirectCdnStreamingStateChanged;
function onDirectCdnStreamingStats(callback) {
    m_RtcSdk.onRtcEvent("onDirectCdnStreamingStats", callback);
}
exports.onDirectCdnStreamingStats = onDirectCdnStreamingStats;
async function startDesktopShareOnly(screenConfig) {
    let winInfo = await m_RtcSdk.getScreenWindowsInfo();
    if (!winInfo || !winInfo.displaysInfo || winInfo.displaysInfo.length == 0) {
        return -1;
    }
    let desktopInfo = winInfo.displaysInfo[0];
    let startScreenResult = m_RtcSdk.startScreenShareOnly(1, desktopInfo.displayId, screenConfig);
    return startScreenResult;
}
exports.startDesktopShareOnly = startDesktopShareOnly;
function stopDesktopShareOnly() {
    return m_RtcSdk.stopScreenShare2();
}
exports.stopDesktopShareOnly = stopDesktopShareOnly;
electron_1.contextBridge.exposeInMainWorld("CdnStreamingHelper", {
    init,
    setDirectCdnStreamingAudioConfiguration,
    setDirectCdnStreamingVideoConfiguration,
    startDirectCdnStreaming,
    stopDirectCdnStreaming,
    onDirectCdnStreamingStateChanged,
    onDirectCdnStreamingStats,
    startDesktopShareOnly,
    stopDesktopShareOnly,
});
//# sourceMappingURL=CdnStreamingHelper.js.map