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
const RendererHelper = __importStar(require("../RendererHelper"));
const electron_1 = require("electron");
const WinId_1 = __importDefault(require("../../common/WinId"));
const url_1 = require("url");
const ModeHelper_1 = require("../ModeHelper");
let machineIdSync;
let isWindowRunning;
if (window.ketangFlag) {
    machineIdSync = require("../../utils/MachineIdUtil").machineIdSync;
    isWindowRunning = require("is-running");
}
function startRecordScreen(args) {
    return RendererHelper.invokeToMainProcess("_startRecordScreen", args);
}
function recordScrennFinished(filePath) {
    RendererHelper.sendToMainProcess("_recordScrennFinished", filePath);
}
function getWisdomDevInfo() {
    return RendererHelper.getSysStore("wisdomId").then((wisdomId) => {
        if (!machineIdSync) {
            machineIdSync = require("../../utils/MachineIdUtil").machineIdSync;
        }
        let machineId = machineIdSync(true);
        return { wisdomId, machineId };
    });
}
function getUrlQueryString(url, name) {
    let _url = new url_1.URL(url);
    return _url.searchParams.get(name);
}
function isRunningWindow(winPid) {
    if (!isWindowRunning) {
        isWindowRunning = require("is-running");
    }
    return isWindowRunning(winPid);
}
function getAppName() {
    return RendererHelper.invokeToMainProcess("_getAppName");
}
const fullScreenBtnForWindowFunction = function (winId) {
    RendererHelper.fullScreenWindow(true, winId);
};
const unFullScreenBtnForWindowFunction = function (winId) {
    RendererHelper.fullScreenWindow(false, winId);
};
function showImage(args) {
    RendererHelper.sendToMainProcess("_showImage", args);
}
function showVideo(args) {
    RendererHelper.sendToMainProcess("_showVideo", args);
}
function setWindowBounds(x, y, width, height, winId) {
    x = Math.floor(x);
    y = Math.floor(y);
    width = Math.floor(width);
    height = Math.floor(height);
    RendererHelper.sendToMainProcess("_setWindowBounds", {
        x,
        y,
        width,
        height,
        winId,
    });
}
function getWindowBounds(winId) {
    return RendererHelper.invokeToMainProcess("_getWindowBounds", winId);
}
function isOpenAtOsLogin() {
    return RendererHelper.invokeToMainProcess("_getAppSystemConfig").then((value) => {
        return value?.openAtOsLogin;
    });
}
function enableAudioDump(enable) {
    RendererHelper.sendToOtherWindow("enableAudioDump", WinId_1.default.meetWindowUUID, enable);
}
function clearAudioDump() {
    electron_1.ipcRenderer.send("_clearAudioDump");
}
function downloadSetupFile(url, retry, flag) {
    electron_1.ipcRenderer.send("downloadSetupFile", { url, retry, flag });
}
function getAudioDevList() {
    return navigator.mediaDevices
        .enumerateDevices()
        .then(function (devices) {
        let microphones = devices.filter(function (device) {
            return (device.kind === "audioinput" && !device.label.includes("AgoraALD"));
        });
        microphones = JSON.parse(JSON.stringify(microphones));
        return microphones;
    })
        .catch(function (err) {
        console.error("Error getting device list:", err);
    });
}
function isSpeechBoxRun() {
    return electron_1.ipcRenderer.invoke("_isSpeechBoxRun");
}
function openTranslateSetWindow() {
    RendererHelper.sendToMainProcess("_openTranslateSet");
}
function uploadLogToCloudDisk() {
    return RendererHelper.invokeToMainProcess("_uploadLogToCloudDisk");
}
function setAppSystemConfig(key, value) {
    RendererHelper.sendToMainProcess("_setAppSystemConfig", key, value);
}
function getLanguage() {
    return RendererHelper.invokeToMainProcess("_getLanguage");
}
function openMeetingBySwitch(parms) {
    RendererHelper.sendToMainProcess("_openMeetingBySwitch", parms);
}
const defaultExports = {
    registeCallback: RendererHelper.on,
    unRegisteCallback: RendererHelper.off,
    setTempStore: RendererHelper.setTempStore,
    getTempStore: RendererHelper.getTempStore,
    openWindow: RendererHelper.openWindow,
    isAeroGlassEnabled: RendererHelper.isAeroGlassEnabled,
    isWindowOpened: RendererHelper.isWindowOpened,
    startRecordScreen,
    recordScrennFinished,
    minBtnForWindowFunction: RendererHelper.minWindow,
    maxBtnForWindowFunction: RendererHelper.maxWindow,
    unMaxBtnForWindowFunction: RendererHelper.unmaxWindow,
    setParentWindow: RendererHelper.setParentWindow,
    getWisdomDevInfo,
    setIgnoreMouseEvents: RendererHelper.setIgnoreMouseEvents,
    getSysStoreData: RendererHelper.getSysStore,
    showWindow: RendererHelper.showWindow,
    destroyWindow: RendererHelper.destroyWindow,
    sendToOtherPage: (signal, sendargs, winId, callback) => {
        RendererHelper.sendToOtherWindow(signal, winId, sendargs).then((value) => {
            if (callback) {
                callback(value);
            }
        });
    },
    getScreenWorkArea: RendererHelper.getScreenWorkArea,
    setStoreData: RendererHelper.setUserStore,
    sendToMainProcess: RendererHelper.sendToMainProcess,
    sendToMeetingPage: function (signal, sendargs, callback) {
        RendererHelper.sendToOtherWindow(signal, WinId_1.default.meetWindowUUID, sendargs).then((value) => {
            if (callback) {
                callback(value);
            }
        });
    },
    reloadWindow: RendererHelper.refreshWindow,
    closeWindow: RendererHelper.closeWindow,
    DialogHelper: {
        alert: RendererHelper.alert,
        confirm: RendererHelper.confirm,
        toast: RendererHelper.toast,
    },
    getUrlQueryString,
    isRunningWindow,
    getStoreData: RendererHelper.getUserStore,
    getAppName,
    hideWindowSelf: RendererHelper.hideWindow,
    showWindowSelf: RendererHelper.showWindow,
    fullScreenBtnForWindowFunction,
    unFullScreenBtnForWindowFunction,
    setImageToClipboard: RendererHelper.setImageToClipboard,
    setClipboard: RendererHelper.setClipboard,
    getClipboard: RendererHelper.getClipboard,
    changeWindowSize: RendererHelper.changeWindowSize,
    setAlwaysOnTop: RendererHelper.setAlwaysOnTop,
    downloadImage: RendererHelper.downloadImageForKt,
    hasScreenCapturePermission2: RendererHelper.hasScreenCapturePermission,
    openSystemPreferences2: RendererHelper.openSystemPreferences,
    askForMacAccess: RendererHelper.askForMacAccess,
    registerEvent: RendererHelper.on,
    simpleFullScreenWindow: RendererHelper.simpleFullScreenWindow,
    setWindowPosition: RendererHelper.setWindowPosition,
    setWindowclosAble: RendererHelper.setWindowclosAble,
    setWindowButtonVisibility: RendererHelper.setWindowButtonVisibility,
    openPath: RendererHelper.openPath,
    openLocalFolder: RendererHelper.openLocalFolder,
    showImage,
    showVideo,
    closeBtnForWindowFunction: RendererHelper.closeWindow,
    setWindowBounds,
    getWindowBounds,
    relaunchApp: RendererHelper.relaunchApp,
    setOpenAtOsLogin: RendererHelper.setOpenAtOsLogin,
    isOpenAtOsLogin,
    enableAudioDump,
    clearAudioDump,
    downloadSetupFile,
    setSysStoreData: RendererHelper.setSysStore,
    getAudioDevList,
    isSpeechBoxRun,
    openTranslateSetWindow,
    uploadLogToCloudDisk,
    getAppMode: RendererHelper.getAppMode,
    setAppSystemConfig,
    useMode: ModeHelper_1.useMode,
    getInitDataAsync: RendererHelper.getInitDataAsync,
    appQuit: RendererHelper.appQuit,
    getPlatform: RendererHelper.getPlatform,
    getLanguage,
    openMeetingBySwitch,
};
module.exports = defaultExports;
exports.default = defaultExports;
//# sourceMappingURL=RendererProcessHelper.js.map