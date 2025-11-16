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
exports.setTempStore = exports.getSysStore = exports.setSysStore = exports.getUserStore = exports.setUserStore = exports.getUsersByPuids = exports.getUsersByTuids = exports.getUID = exports.getUser = exports.getArch = exports.getPlatform = exports.openCommonDialog = exports.toastLong = exports.toast = exports.confirm = exports.alert2 = exports.alert = exports.simpleFullScreenWindow = exports.fullScreenWindow = exports.focusWindow = exports.restoreWindow = exports.minWindow = exports.maxOrResotreWindow = exports.unmaxWindow = exports.maxWindow = exports.hideWindow = exports.showWindow = exports.setWindowButtonVisibility = exports.setWindowclosAble = exports.closeWindow = exports.resizeWindowSize = exports.changeWindowSize = exports.isAppPackaged = exports.getUserLogPath = exports.getUserDataPath = exports.emit = exports.removeAllListeners = exports.off = exports.on = exports.sendToMainWindow = exports.sendToWebContents = exports.sendToOtherWindow = exports.refreshWindow = exports.sendToOuterWindow = exports.sendToView = exports.getVersion = exports.openWindowWithTab = exports.openWindow = exports.initDisableIpcLogs = exports.disableIpcLog = void 0;
exports.getAppName = exports.getAppPath = exports.pingHost = exports.isNetOnline = exports.deleteCacheImage = exports.cacheImageData = exports.offStoreDataChanged = exports.onStoreDataChanged = exports.setClipboardByMainProcess = exports.getClipboardByMainProcess = exports.getClipboard = exports.copyImageWithLocalImagePath = exports.setImageToClipboard = exports.setClipboard = exports.isMouseInWindow = exports.getMousePointInScreen = exports.getMousePointInWindow = exports.getMachineIdWithMacAddress = exports.getMachineId = exports.destroyWindow = exports.setIgnoreMouseEvents = exports.setParentWindow = exports.isWindowFullScreen = exports.isWindowFocused = exports.isWindowMinimized = exports.isWindowVisible = exports.isWindowOpened = exports.isAeroGlassEnabled = exports.getScreenWorkAreaInDesktop = exports.getScreenDisplayByWinId = exports.getScreenBounds = exports.getScreenWorkArea = exports.downloadImage = exports.downloadImageForKt = exports.isMultiscreen = exports.invokeToMainProcess = exports.sendToMainProcess = exports.imgBitsToDataUrl = exports.dataUrlImgToBits = exports.getFileData = exports.getInitDataAsync = exports.getInitData = exports.setAlwaysOnTop = exports.flashTray = exports.flashFrame = exports.setBlockRefresh = exports.openExternal = exports.appLoginOut = exports.appLoginEnd = exports.getTempStore = void 0;
exports.openFileInManagerAndSelect = exports.saveFileChunk = exports.checkFileExists = exports.buildMultipleFolderStructures = exports.resolvePath = exports.joinPath = exports.receiveFile = exports.getLocalFileContent = exports.sendFileInChunks = exports.getLocalFileSize = exports.netRequest = exports.shakeMainWindow = exports.previewImage = exports.readyPreviewImageWindow = exports.getAllScreenDisplay = exports.setAccount = exports.getAccount = exports.appQuit = exports.getPathByType = exports.askForMacAccess = exports.getMediaAccessStatus = exports.getWindowBounds = exports.setWindowBounds = exports.setAutoLogin = exports.getAppMode = exports.getAllScreenWindowThumbnail = exports.capturePage = exports.exitFullScreenWithEsc = exports.openLocalFolder = exports.relaunchApp = exports.sendMsgConversation = exports.isOpenAtOsLogin = exports.setOpenAtOsLogin = exports.copyImageAt = exports.setWindowPosition = exports.openSystemPreferences = exports.hasScreenCapturePermission = exports.setBadgeCount = exports.showOpenDialog = exports.showItemInFolderByPath = exports.openPath = exports.getCacheDataFromDb = exports.cacheDataToDb = exports.dragFile = exports.isFileExists = exports.getMessageImageCachePath = exports.getCacheImagePath = exports.getScreenScale = exports.isUseDarkMode = exports.uploadLog = void 0;
exports.onWindowStateChanged = exports.getAllWindowExtStoreOnLink = exports.getWindowExtStoreOnLink = exports.getWindowExtStore = exports.setWindowExtStore = exports.stopDragWindow = exports.startDragWindow = exports.openTimeSettings = exports.sseChat = exports.isWindowMaximized = exports.osIsLowerThanWin10 = exports.getWinId = exports.gotoMessagePage = exports.focusWebPage = exports.getBase64Image = exports.getBaseFileInfo = exports.AITranslate = exports.stopTrackMouse = exports.startTrackMouse = exports.createGroupMeetingLink = void 0;
const UseTimeLogUtil_1 = require("../utils/UseTimeLogUtil");
let m_UseTimeLog = new UseTimeLogUtil_1.UseTimeLog(false);
m_UseTimeLog.start("RendererHelper");
const electron_1 = require("electron");
m_UseTimeLog.end("1");
let nodeMachineIdSync;
let machineIdSync;
let ping;
let getFileSize;
if (window.ketangFlag) {
    nodeMachineIdSync = require("node-machine-id").machineIdSync;
    machineIdSync = require("../utils/MachineIdUtil").machineIdSync;
    ping = require("ping");
    getFileSize = require("../utils/FileUtil").getFileSize;
}
const events_1 = require("events");
const WinId_1 = __importDefault(require("../common/WinId"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
m_UseTimeLog.end("2");
m_UseTimeLog.end("21");
m_UseTimeLog.end("3");
const BaseFileInfo_1 = require("../common/BaseFileInfo");
const SystemSetUtil_1 = require("../utils/SystemSetUtil");
const BaseHelper = __importStar(require("./BaseHelper"));
const EventUtil_1 = require("../utils/EventUtil");
m_UseTimeLog.end("4");
m_UseTimeLog.end("5");
m_UseTimeLog.end("6");
const appCfg = require("../config/appconfig");
m_UseTimeLog.end("7");
const m_OnFunMap = new Map();
let m_BlockRefresh = false;
window.onload = function () {
    document.addEventListener("keydown", function (event) {
        if (event.keyCode === 116) {
            event.preventDefault();
            if (!m_BlockRefresh) {
                window.location.reload();
            }
        }
    });
    try {
        electron_1.crashReporter.addExtraParameter("_cookie", document.cookie);
    }
    catch (e) { }
};
const m_EmitterObj = new events_1.EventEmitter();
function disableIpcLog(key, disable) {
    BaseHelper.disableIpcLog(key, disable);
}
exports.disableIpcLog = disableIpcLog;
function initDisableIpcLogs() {
    disableIpcLog("screenTools", true);
    disableIpcLog("meetTools", true);
    disableIpcLog("sendRtcStats", true);
    disableIpcLog("_getMousePointInWindow", true);
}
exports.initDisableIpcLogs = initDisableIpcLogs;
m_UseTimeLog.end("8");
initDisableIpcLogs();
m_UseTimeLog.end("9");
function openWindow(url, options, data) {
    let args = { url, options: options, data: data };
    sendToMainProcess("_openNewWindow", args);
}
exports.openWindow = openWindow;
function openWindowWithTab(url, options, data) {
    let args = { url, options: options, data: data };
    sendToMainProcess("_openWindowWithTab", args);
}
exports.openWindowWithTab = openWindowWithTab;
function getVersion() {
    return invokeToMainProcess("_getVersion");
}
exports.getVersion = getVersion;
function sendToView(key, viewId, ...args) {
    let allArgs = [key, viewId];
    allArgs = allArgs.concat(args);
    sendToMainProcess("_sendToBrowserView", ...allArgs);
}
exports.sendToView = sendToView;
function sendToOuterWindow(key, ...args) {
    let allArgs = [key];
    allArgs = allArgs.concat(args);
    sendToMainProcess("_sendToOuterView", ...allArgs);
}
exports.sendToOuterWindow = sendToOuterWindow;
function refreshWindow(winId) {
    sendToMainProcess("_refreshWindow", winId);
}
exports.refreshWindow = refreshWindow;
function sendToOtherWindow(key, winId, ...args) {
    return invokeToMainProcess("_sendToOtherWindow", {
        key,
        winId,
        args,
    });
}
exports.sendToOtherWindow = sendToOtherWindow;
function sendToWebContents(key, webContentsId, ...args) {
    return invokeToMainProcess("_sendToWebContents", {
        webContentsId,
        key,
        args,
    });
}
exports.sendToWebContents = sendToWebContents;
function sendToMainWindow(key, ...args) {
    return sendToOtherWindow(key, WinId_1.default.MainWindow, ...args);
}
exports.sendToMainWindow = sendToMainWindow;
electron_1.ipcRenderer.on("_otherWindowMsg", (event, parm1, ...args) => {
    let key = parm1.key;
    m_EmitterObj.emit(key, function (result) {
        if (result != undefined) {
            if (typeof result.then == "function") {
                result.then((value) => {
                    sendToMainProcess("_otherWindowMsg_callback", key, value);
                });
            }
            else {
                sendToMainProcess("_otherWindowMsg_callback", key, result);
            }
        }
        else {
            sendToMainProcess("_otherWindowMsg_callback", key);
        }
    }, ...args, { _fromWebContentsId: parm1.fromWebContentsId });
});
function on(key, fun, funname) {
    if (typeof fun != "function") {
        return;
    }
    if (key == "ready" && m_InitData) {
        fun(m_InitData);
    }
    let funMap;
    if (funname) {
        funMap = m_OnFunMap.get(key);
        if (funMap == undefined) {
            funMap = new Map();
            m_OnFunMap.set(key, funMap);
        }
        if (funMap.get(funname)) {
            return;
        }
    }
    const ipcFun = (event, ...data) => {
        if (data?.length > 0) {
            let dataStr = JSON.stringify(data);
            if (dataStr.length > 1000) {
                console.log("register ipc event:", key, "args count:", data.length, "argsJsonLength:", dataStr.length);
            }
            else {
                console.log("register ipc event:", key, dataStr);
            }
        }
        else {
            console.log("register ipc event:", key);
        }
        fun(...data);
    };
    const emitFun = function (callback, ...args) {
        let result = fun(...args);
        if (callback && result != undefined) {
            callback(result);
        }
    };
    if (funname && funMap) {
        funMap.set(funname, { ipcFun, emitFun });
    }
    electron_1.ipcRenderer.on(key, ipcFun);
    m_EmitterObj.on(key, emitFun);
}
exports.on = on;
function off(key, funname) {
    if (funname) {
        let funMap = m_OnFunMap.get(key);
        if (!funMap) {
            return;
        }
        let funs = funMap.get(funname);
        if (!funs) {
            return;
        }
        electron_1.ipcRenderer.off(key, funs.ipcFun);
        m_EmitterObj.off(key, funs.emitFun);
        funMap.delete(funname);
    }
    else {
        electron_1.ipcRenderer.removeAllListeners(key);
        m_EmitterObj.removeAllListeners(key);
        m_OnFunMap.delete(key);
    }
}
exports.off = off;
function removeAllListeners(key) {
    m_EmitterObj.removeAllListeners(key);
    electron_1.ipcRenderer.removeAllListeners(key);
}
exports.removeAllListeners = removeAllListeners;
function emit(key, ...args) {
    m_EmitterObj.emit(key, undefined, ...args);
}
exports.emit = emit;
function getUserDataPath() {
    return invokeToMainProcess("_getUserDataPath");
}
exports.getUserDataPath = getUserDataPath;
function getUserLogPath() {
    return invokeToMainProcess("_getUserLogPath");
}
exports.getUserLogPath = getUserLogPath;
function isAppPackaged() {
    return invokeToMainProcess("_isAppPackaged");
}
exports.isAppPackaged = isAppPackaged;
function changeWindowSize(width, height, winId) {
    sendToMainProcess("_changeWindowSize", {
        width,
        height,
        winId,
    });
}
exports.changeWindowSize = changeWindowSize;
function resizeWindowSize(data, winId) {
    sendToMainProcess("_resizeWindowSize", data, winId);
}
exports.resizeWindowSize = resizeWindowSize;
function closeWindow(winId) {
    sendToMainProcess("_closeWindow", winId);
}
exports.closeWindow = closeWindow;
function setWindowclosAble(closable, winId) {
    sendToMainProcess("_setWindowclosAble", closable, winId);
}
exports.setWindowclosAble = setWindowclosAble;
function setWindowButtonVisibility(closable, winId) {
    sendToMainProcess("_setWindowButtonVisibility", closable, winId);
}
exports.setWindowButtonVisibility = setWindowButtonVisibility;
function showWindow(winId) {
    sendToMainProcess("_showWindow", winId);
}
exports.showWindow = showWindow;
function hideWindow(winId) {
    sendToMainProcess("_hideWindow", winId);
}
exports.hideWindow = hideWindow;
function maxWindow(winId, fullScreenOnMac = true) {
    sendToMainProcess("_maxWindow", winId, fullScreenOnMac);
}
exports.maxWindow = maxWindow;
function unmaxWindow(winId, fullScreenOnMac = true) {
    sendToMainProcess("_unmaxWindow", winId, fullScreenOnMac);
}
exports.unmaxWindow = unmaxWindow;
function maxOrResotreWindow(winId, fullScreenOnMac = true) {
    sendToMainProcess("_maxOrResotreWindow", winId, fullScreenOnMac);
}
exports.maxOrResotreWindow = maxOrResotreWindow;
function minWindow(winId) {
    sendToMainProcess("_minWindow", winId);
}
exports.minWindow = minWindow;
function restoreWindow(winId) {
    sendToMainProcess("_restoreWindow", winId);
}
exports.restoreWindow = restoreWindow;
function focusWindow(winId) {
    sendToMainProcess("_focusWindow", winId);
}
exports.focusWindow = focusWindow;
function fullScreenWindow(flag, winId) {
    sendToMainProcess("_fullScreenWindow", winId, flag);
}
exports.fullScreenWindow = fullScreenWindow;
function simpleFullScreenWindow(flag, winId) {
    sendToMainProcess("_simpleFullScreen", winId, flag);
}
exports.simpleFullScreenWindow = simpleFullScreenWindow;
function alert(msg, options) {
    options = options || {};
    options.content = msg;
    options.type = "alert";
    return openCommonDialog(options);
}
exports.alert = alert;
function alert2(msg, options) {
    return BaseHelper.alert2(msg, options);
}
exports.alert2 = alert2;
function confirm(msg, options) {
    return BaseHelper.confirm(msg, options);
}
exports.confirm = confirm;
function toast(msg, options) {
    options = options || {};
    options.content = msg;
    options.type = "toast";
    return openCommonDialog(options);
}
exports.toast = toast;
function toastLong(msg, options) {
    options = options || {};
    options.content = msg;
    options.type = "toast";
    options.duration = -10;
    return openCommonDialog(options);
}
exports.toastLong = toastLong;
function openCommonDialog(options) {
    return BaseHelper.openCommonDialog(options);
}
exports.openCommonDialog = openCommonDialog;
function getPlatform() {
    return process.platform;
}
exports.getPlatform = getPlatform;
function getArch() {
    return process.arch;
}
exports.getArch = getArch;
function getUser() {
    return invokeToMainProcess("_getUser");
}
exports.getUser = getUser;
function getUID() {
    return invokeToMainProcess("_getUID");
}
exports.getUID = getUID;
function getUsersByTuids(tuids, axiosConfig) {
    return invokeToMainProcess("_getUsersByTuids", tuids, axiosConfig);
}
exports.getUsersByTuids = getUsersByTuids;
function getUsersByPuids(puids) {
    return invokeToMainProcess("_getUsersByPuids", puids);
}
exports.getUsersByPuids = getUsersByPuids;
function setUserStore(key, value, delOnLogout) {
    sendToMainProcess("_setUserStore", key, value, delOnLogout);
}
exports.setUserStore = setUserStore;
function getUserStore(key) {
    return invokeToMainProcess("_getUserStore", key);
}
exports.getUserStore = getUserStore;
function setSysStore(key, value) {
    sendToMainProcess("_setSysStore", key, value);
}
exports.setSysStore = setSysStore;
function getSysStore(key) {
    return invokeToMainProcess("_getSysStore", key);
}
exports.getSysStore = getSysStore;
function setTempStore(key, value) {
    sendToMainProcess("_setTempStore", key, value);
}
exports.setTempStore = setTempStore;
function getTempStore(key) {
    return invokeToMainProcess("_getTempStore", key);
}
exports.getTempStore = getTempStore;
function appLoginEnd() {
    sendToMainProcess("_loginEnd", { type: 1 });
}
exports.appLoginEnd = appLoginEnd;
function appLoginOut() {
    sendToMainProcess("_loginOut", { type: 1 });
}
exports.appLoginOut = appLoginOut;
function openExternal(url) {
    sendToMainProcess("_openExternal", { url });
}
exports.openExternal = openExternal;
function setBlockRefresh(isBlockRefresh) {
    m_BlockRefresh = isBlockRefresh;
}
exports.setBlockRefresh = setBlockRefresh;
function flashFrame(flag) {
    sendToMainProcess("_flashFrame", flag);
}
exports.flashFrame = flashFrame;
function flashTray(flag, imgData, data) {
    sendToMainProcess("_flashTray", flag, imgData, data);
}
exports.flashTray = flashTray;
function setAlwaysOnTop(isOnTop, winId, level) {
    sendToMainProcess("_setAlwaysOnTop", isOnTop, winId, level);
}
exports.setAlwaysOnTop = setAlwaysOnTop;
let m_InitData;
electron_1.ipcRenderer.on("ready", (event, data) => {
    console.log("on preload ready:", data);
    m_InitData = data;
});
function getInitData() {
    return m_InitData;
}
exports.getInitData = getInitData;
function getInitDataAsync() {
    return new Promise((resolve, reject) => {
        if (m_InitData) {
            resolve(m_InitData);
        }
        else {
            electron_1.ipcRenderer.once("ready", (event, data) => {
                resolve(data);
            });
        }
    });
}
exports.getInitDataAsync = getInitDataAsync;
function getFileData(filePath) {
    if (fs_1.default.existsSync(filePath)) {
        return fs_1.default.readFileSync(filePath);
    }
}
exports.getFileData = getFileData;
function dataUrlImgToBits(dataUrl) {
    let image = electron_1.nativeImage.createFromDataURL(dataUrl);
    return image.toPNG();
}
exports.dataUrlImgToBits = dataUrlImgToBits;
function imgBitsToDataUrl(bits) {
    let image = electron_1.nativeImage.createFromBuffer(bits);
    return image.toDataURL();
}
exports.imgBitsToDataUrl = imgBitsToDataUrl;
function sendToMainProcess(key, ...args) {
    BaseHelper.sendToMainProcess(key, ...args);
}
exports.sendToMainProcess = sendToMainProcess;
function invokeToMainProcess(key, ...args) {
    return BaseHelper.invokeToMainProcess(key, ...args);
}
exports.invokeToMainProcess = invokeToMainProcess;
function isMultiscreen() {
    return invokeToMainProcess("isMultiscreen");
}
exports.isMultiscreen = isMultiscreen;
function downloadImageForKt(url, suffix) {
    if (!url) {
        return;
    }
    return invokeToMainProcess("downloadImage", url, suffix);
}
exports.downloadImageForKt = downloadImageForKt;
function downloadImage(url) {
    if (!url) {
        return;
    }
    return invokeToMainProcess("_downloadImage", url);
}
exports.downloadImage = downloadImage;
function getScreenWorkArea(winId) {
    return invokeToMainProcess("_getScreenWorkArea", winId);
}
exports.getScreenWorkArea = getScreenWorkArea;
async function getScreenBounds(winId) {
    return invokeToMainProcess("_getScreenBounds", winId);
}
exports.getScreenBounds = getScreenBounds;
function getScreenDisplayByWinId(winId) {
    return invokeToMainProcess("_getScreenDisplayByWinId", winId);
}
exports.getScreenDisplayByWinId = getScreenDisplayByWinId;
function getScreenWorkAreaInDesktop() {
    return invokeToMainProcess("_getScreenWorkAreaInDesktop");
}
exports.getScreenWorkAreaInDesktop = getScreenWorkAreaInDesktop;
function isAeroGlassEnabled() {
    return invokeToMainProcess("_isAeroGlassEnabled");
}
exports.isAeroGlassEnabled = isAeroGlassEnabled;
function isWindowOpened(winId) {
    return invokeToMainProcess("_isWindowOpened", winId);
}
exports.isWindowOpened = isWindowOpened;
function isWindowVisible(winId) {
    return invokeToMainProcess("_isWindowVisible", winId);
}
exports.isWindowVisible = isWindowVisible;
function isWindowMinimized(winId) {
    return invokeToMainProcess("_isWindowMinimized", winId);
}
exports.isWindowMinimized = isWindowMinimized;
function isWindowFocused(winId) {
    return invokeToMainProcess("_isWindowFocused", winId);
}
exports.isWindowFocused = isWindowFocused;
function isWindowFullScreen(winId) {
    return invokeToMainProcess("_isWindowFullScreen", winId);
}
exports.isWindowFullScreen = isWindowFullScreen;
function setParentWindow(childWinId, parentWinId) {
    sendToMainProcess("_setParentWindow", childWinId, parentWinId);
}
exports.setParentWindow = setParentWindow;
function setIgnoreMouseEvents(ignore, options) {
    sendToMainProcess("_setIgnoreMouseEvents", ignore, options);
}
exports.setIgnoreMouseEvents = setIgnoreMouseEvents;
function destroyWindow() {
    sendToMainProcess("_win_destroy");
}
exports.destroyWindow = destroyWindow;
function getMachineId() {
    if (!nodeMachineIdSync) {
        nodeMachineIdSync = require("node-machine-id").machineIdSync;
    }
    return nodeMachineIdSync(true);
}
exports.getMachineId = getMachineId;
function getMachineIdWithMacAddress() {
    if (!machineIdSync) {
        machineIdSync = require("../utils/MachineIdUtil").machineIdSync;
    }
    return machineIdSync(true);
}
exports.getMachineIdWithMacAddress = getMachineIdWithMacAddress;
function getMousePointInWindow() {
    return invokeToMainProcess("_getMousePointInWindow");
}
exports.getMousePointInWindow = getMousePointInWindow;
function getMousePointInScreen() {
    return invokeToMainProcess("_getMousePointInScreen");
}
exports.getMousePointInScreen = getMousePointInScreen;
function isMouseInWindow() {
    return invokeToMainProcess("_isMouseInWindow");
}
exports.isMouseInWindow = isMouseInWindow;
function setClipboard(html, text, imageData) {
    let image;
    if (imageData) {
        if (typeof imageData == "string") {
            image = electron_1.nativeImage.createFromDataURL(imageData);
        }
        else {
            if (imageData.base64Url) {
                image = electron_1.nativeImage.createFromDataURL(imageData.base64Url);
            }
            else if (imageData.bufferData) {
                image = electron_1.nativeImage.createFromBuffer(Buffer.from(imageData.bufferData));
            }
            else if (imageData.localPath) {
                image = electron_1.nativeImage.createFromPath(imageData.localPath);
            }
        }
    }
    electron_1.clipboard.write({ html, text, image });
}
exports.setClipboard = setClipboard;
function setImageToClipboard(imageDataUrl) {
    let image;
    if (imageDataUrl) {
        image = electron_1.nativeImage.createFromDataURL(imageDataUrl);
    }
    electron_1.clipboard.writeImage(image);
}
exports.setImageToClipboard = setImageToClipboard;
function copyImageWithLocalImagePath(localImagePath) {
    const nImg = electron_1.nativeImage.createFromPath(localImagePath);
    electron_1.clipboard.writeImage(nImg);
}
exports.copyImageWithLocalImagePath = copyImageWithLocalImagePath;
function getClipboard() {
    const html = electron_1.clipboard.readHTML();
    const text = electron_1.clipboard.readText();
    const image = electron_1.clipboard.readImage();
    let imageData = undefined;
    if (image && !image.isEmpty()) {
        imageData = image.toDataURL();
    }
    return { html, text, image: imageData };
}
exports.getClipboard = getClipboard;
function getClipboardByMainProcess() {
    return invokeToMainProcess("_getClipboardByMainProcess");
}
exports.getClipboardByMainProcess = getClipboardByMainProcess;
function setClipboardByMainProcess(html, text, imageData) {
    sendToMainProcess("_setClipboardByMainProcess", html, text, imageData);
}
exports.setClipboardByMainProcess = setClipboardByMainProcess;
function onStoreDataChanged(key, callback, funname) {
    on(`_onStoreDataChanged_${key}`, callback, funname);
    sendToMainProcess("_onStoreDataChanged", key);
}
exports.onStoreDataChanged = onStoreDataChanged;
function offStoreDataChanged(key, funname) {
    off(`_onStoreDataChanged_${key}`, funname);
    if (electron_1.ipcRenderer.listenerCount(`_onStoreDataChanged_${key}`) == 0) {
        sendToMainProcess("_offStoreDataChanged", key);
    }
}
exports.offStoreDataChanged = offStoreDataChanged;
function cacheImageData(data) {
    return invokeToMainProcess("_cacheImageData", data);
}
exports.cacheImageData = cacheImageData;
function deleteCacheImage(filePath, url) {
    return invokeToMainProcess("_deleteCacheImage", filePath, url);
}
exports.deleteCacheImage = deleteCacheImage;
function isNetOnline() {
    return invokeToMainProcess("_isNetOnline");
}
exports.isNetOnline = isNetOnline;
function pingHost() {
    if (!ping) {
        ping = require("ping");
    }
    return ping.promise.probe("app.xuexitong.com");
}
exports.pingHost = pingHost;
function getAppPath() {
    return invokeToMainProcess("_getAppPath");
}
exports.getAppPath = getAppPath;
function getAppName() {
    if (appCfg.appName) {
        return appCfg.appName;
    }
    else {
        return "学习通";
    }
}
exports.getAppName = getAppName;
function uploadLog() {
    return invokeToMainProcess("_uploadLog");
}
exports.uploadLog = uploadLog;
function isUseDarkMode() {
    return invokeToMainProcess("_isUseDarkMode");
}
exports.isUseDarkMode = isUseDarkMode;
function getScreenScale() {
    return invokeToMainProcess("_getScreenScale");
}
exports.getScreenScale = getScreenScale;
function getCacheImagePath(imgUrl) {
    return invokeToMainProcess("_getCacheImagePath", imgUrl);
}
exports.getCacheImagePath = getCacheImagePath;
function getMessageImageCachePath(imgUrl) {
    return invokeToMainProcess("_getMessageImageCachePath", imgUrl);
}
exports.getMessageImageCachePath = getMessageImageCachePath;
function isFileExists(filePath) {
    return invokeToMainProcess("_isFileExists", filePath);
}
exports.isFileExists = isFileExists;
function dragFile(filePath) {
    return sendToMainProcess("_dragFile", filePath);
}
exports.dragFile = dragFile;
function cacheDataToDb(type, key, value) {
    sendToMainProcess("_cacheDataToDb", { type, key, value });
}
exports.cacheDataToDb = cacheDataToDb;
function getCacheDataFromDb(type, key) {
    return invokeToMainProcess("_getCacheDataFromDb", {
        type,
        key,
    });
}
exports.getCacheDataFromDb = getCacheDataFromDb;
function openPath(filePath) {
    sendToMainProcess("_openPath", filePath);
}
exports.openPath = openPath;
function showItemInFolderByPath(filePath) {
    return invokeToMainProcess("_showItemInFolderByPath", filePath);
}
exports.showItemInFolderByPath = showItemInFolderByPath;
function showOpenDialog(options) {
    return invokeToMainProcess("_showOpenDialog", options);
}
exports.showOpenDialog = showOpenDialog;
function setBadgeCount(count) {
    sendToMainProcess("_setBadgeCount", count);
}
exports.setBadgeCount = setBadgeCount;
function hasScreenCapturePermission() {
    return invokeToMainProcess("_hasScreenCapturePermission");
}
exports.hasScreenCapturePermission = hasScreenCapturePermission;
function openSystemPreferences() {
    sendToMainProcess("_openSystemPreferences");
}
exports.openSystemPreferences = openSystemPreferences;
function setWindowPosition(x, y, winId) {
    x = Math.floor(x);
    y = Math.floor(y);
    sendToMainProcess("_setWindowPosition", x, y, winId);
}
exports.setWindowPosition = setWindowPosition;
function copyImageAt(x, y) {
    sendToMainProcess("_copyImageAt", x, y);
}
exports.copyImageAt = copyImageAt;
function setOpenAtOsLogin(autoOpen) {
    sendToMainProcess("_setOpenAtOsLogin", autoOpen);
}
exports.setOpenAtOsLogin = setOpenAtOsLogin;
function isOpenAtOsLogin() {
    return invokeToMainProcess("_isOpenAtOsLogin");
}
exports.isOpenAtOsLogin = isOpenAtOsLogin;
function sendMsgConversation(conversationList) {
    return sendToMainProcess("_sendMsgConversation", conversationList);
}
exports.sendMsgConversation = sendMsgConversation;
function relaunchApp(forceExit = true) {
    sendToMainProcess("_relaunchApp", forceExit);
}
exports.relaunchApp = relaunchApp;
function openLocalFolder() {
    sendToMainProcess("_openLocalFolder");
}
exports.openLocalFolder = openLocalFolder;
function exitFullScreenWithEsc(enable) {
    EventUtil_1.EventUtil.emit("exitFullScreenWithEsc", enable);
}
exports.exitFullScreenWithEsc = exitFullScreenWithEsc;
function capturePage(rect, winId, thumbnailSize) {
    return invokeToMainProcess("_capturePage", rect, winId, thumbnailSize);
}
exports.capturePage = capturePage;
function getAllScreenWindowThumbnail(thumbnailSize) {
    return invokeToMainProcess("_getAllScreenWindowThumbnail", thumbnailSize);
}
exports.getAllScreenWindowThumbnail = getAllScreenWindowThumbnail;
function getAppMode() {
    return invokeToMainProcess("_getAppMode");
}
exports.getAppMode = getAppMode;
function setAutoLogin(isAutoLogin) {
    sendToMainProcess("_setisAutoLogin", isAutoLogin);
}
exports.setAutoLogin = setAutoLogin;
function setWindowBounds(x, y, width, height, winId) {
    x = Math.floor(x);
    y = Math.floor(y);
    width = Math.floor(width);
    height = Math.floor(height);
    sendToMainProcess("_setWindowBounds", {
        x,
        y,
        width,
        height,
        winId,
    });
}
exports.setWindowBounds = setWindowBounds;
function getWindowBounds(winId) {
    return invokeToMainProcess("_getWindowBounds", winId);
}
exports.getWindowBounds = getWindowBounds;
function getMediaAccessStatus(mediaType) {
    return invokeToMainProcess("_getMediaAccessStatus", mediaType);
}
exports.getMediaAccessStatus = getMediaAccessStatus;
async function askForMacAccess(type) {
    if (process.platform == "darwin") {
        let nodeMacPermissions = require("@suchipi/node-mac-permissions");
        if (type == "microphone") {
            return await nodeMacPermissions.askForMicrophoneAccess();
        }
        else if (type == "camera") {
            return await nodeMacPermissions.askForCameraAccess();
        }
    }
}
exports.askForMacAccess = askForMacAccess;
async function getPathByType(type) {
    return invokeToMainProcess("_getPathByType", type);
}
exports.getPathByType = getPathByType;
function appQuit() {
    sendToMainProcess("appQuit");
}
exports.appQuit = appQuit;
function getAccount(puid) {
    return invokeToMainProcess("_getAccount", puid);
}
exports.getAccount = getAccount;
function setAccount(uid, key, value) {
    sendToMainProcess("_setAccount", { uid, key, value });
}
exports.setAccount = setAccount;
function getAllScreenDisplay() {
    return invokeToMainProcess("_getAllScreenDisplay");
}
exports.getAllScreenDisplay = getAllScreenDisplay;
function readyPreviewImageWindow(createWindowOptions, previewImageParams) {
    sendToMainProcess("_readyPreviewImageWindow", createWindowOptions, previewImageParams);
}
exports.readyPreviewImageWindow = readyPreviewImageWindow;
function previewImage(createWindowOptions, previewImageParams) {
    sendToMainProcess("_previewImage", createWindowOptions, previewImageParams);
}
exports.previewImage = previewImage;
function shakeMainWindow(options) {
    return invokeToMainProcess("_shakeMainWindow", options);
}
exports.shakeMainWindow = shakeMainWindow;
function netRequest(params) {
    return invokeToMainProcess("_netRequest", params);
}
exports.netRequest = netRequest;
function getLocalFileSize(filePath) {
    if (!getFileSize) {
        getFileSize = require("../utils/FileUtil").getFileSize;
    }
    return getFileSize(filePath);
}
exports.getLocalFileSize = getLocalFileSize;
const DEFAULT_CHUNK_SIZE = 64 * 1024;
function sendFileInChunks(filePath, options) {
    const { onData = () => { }, onEnd = () => { }, onError = () => { }, chunkSize = DEFAULT_CHUNK_SIZE, } = options ?? {};
    const fileStats = fs_1.default.statSync(filePath);
    const totalChunks = Math.ceil(fileStats.size / chunkSize);
    const fileStream = fs_1.default.createReadStream(filePath, {
        highWaterMark: chunkSize,
    });
    let chunkIndex = 0;
    fileStream.on("data", (chunk) => {
        chunkIndex++;
        onData({
            index: chunkIndex,
            totalChunks,
            chunk: chunk.toString("base64"),
            fileName: path_1.default.basename(filePath),
        });
    });
    fileStream.on("end", () => {
        console.log("All chunks have been sent.");
        onEnd({
            index: chunkIndex,
            totalChunks,
            fileName: path_1.default.basename(filePath),
        });
    });
    fileStream.on("error", (error) => {
        console.error("Error reading file:", error);
        onError(error);
    });
}
exports.sendFileInChunks = sendFileInChunks;
function getLocalFileContent(filePath) {
    return invokeToMainProcess("_getLocalFileContent", filePath);
}
exports.getLocalFileContent = getLocalFileContent;
function receiveFile(filePath, fileBlob) {
    return invokeToMainProcess("_receiveFile", filePath, fileBlob);
}
exports.receiveFile = receiveFile;
function joinPath(...paths) {
    return path_1.default.join(...paths.filter((item) => item !== undefined && item !== null));
}
exports.joinPath = joinPath;
function resolvePath(...paths) {
    return path_1.default.resolve(...paths.filter((item) => item !== undefined && item !== null));
}
exports.resolvePath = resolvePath;
function buildMultipleFolderStructures(folderPaths) {
    return invokeToMainProcess("_buildMultipleFolderStructures", folderPaths);
}
exports.buildMultipleFolderStructures = buildMultipleFolderStructures;
function checkFileExists(path) {
    return invokeToMainProcess("_checkFileExists", path);
}
exports.checkFileExists = checkFileExists;
async function saveFileChunk(data) {
    const { filePath, relativePath } = data;
    const buffer = Buffer.from(data.chunk, "base64");
    let finalFilePath = filePath;
    if (relativePath) {
        finalFilePath = path_1.default.resolve(filePath, relativePath);
    }
    const fileSavePath = path_1.default.join(finalFilePath, relativePath ? "" : data.fileName);
    const offset = data.index * buffer.length;
    const fileHandle = await fs_1.default.promises.open(fileSavePath, "a+");
    try {
        await fileHandle.write(buffer, 0, buffer.length, offset);
    }
    finally {
        await fileHandle.close();
    }
}
exports.saveFileChunk = saveFileChunk;
function openFileInManagerAndSelect(filePath) {
    return invokeToMainProcess("_openFileInManagerAndSelect", filePath);
}
exports.openFileInManagerAndSelect = openFileInManagerAndSelect;
function createGroupMeetingLink(groupChatId) {
    return invokeToMainProcess("_createGroupMeetingLink", groupChatId);
}
exports.createGroupMeetingLink = createGroupMeetingLink;
function startTrackMouse() {
    return invokeToMainProcess("_startTrackMouse");
}
exports.startTrackMouse = startTrackMouse;
function stopTrackMouse() {
    return invokeToMainProcess("_stopTrackMouse");
}
exports.stopTrackMouse = stopTrackMouse;
function AITranslate(contents, options) {
    return invokeToMainProcess("_AITranslate", contents, options);
}
exports.AITranslate = AITranslate;
function getBaseFileInfo(filePath) {
    let fileInfo = (0, BaseFileInfo_1.createBaseFileInfo)(filePath);
    return fileInfo;
}
exports.getBaseFileInfo = getBaseFileInfo;
function getBase64Image(filePath) {
    let image = electron_1.nativeImage.createFromPath(filePath);
    return image.toDataURL();
}
exports.getBase64Image = getBase64Image;
function focusWebPage() {
    return invokeToMainProcess("_focusWebPage");
}
exports.focusWebPage = focusWebPage;
function gotoMessagePage() {
    return invokeToMainProcess("_gotoMessagePage");
}
exports.gotoMessagePage = gotoMessagePage;
function getWinId() {
    return invokeToMainProcess("_getWinId");
}
exports.getWinId = getWinId;
function osIsLowerThanWin10() {
    return invokeToMainProcess("_osIsLowerThanWin10");
}
exports.osIsLowerThanWin10 = osIsLowerThanWin10;
function isWindowMaximized(winId) {
    return invokeToMainProcess("_isWindowMaximized", winId);
}
exports.isWindowMaximized = isWindowMaximized;
function sseChat(text, options) {
    return sendToMainProcess("_sseChat", text, options);
}
exports.sseChat = sseChat;
function openTimeSettings() {
    (0, SystemSetUtil_1.openSystemTimeSyncSettings)();
}
exports.openTimeSettings = openTimeSettings;
function startDragWindow() {
    return sendToMainProcess("_startDragWindow");
}
exports.startDragWindow = startDragWindow;
function stopDragWindow() {
    return sendToMainProcess("_endDragWindow");
}
exports.stopDragWindow = stopDragWindow;
function setWindowExtStore(winId, key, value) {
    sendToMainProcess("_setWindowExtStore", winId, key, value);
}
exports.setWindowExtStore = setWindowExtStore;
async function getWindowExtStore(winId, key) {
    return invokeToMainProcess("_getWindowExtStore", winId, key);
}
exports.getWindowExtStore = getWindowExtStore;
async function getWindowExtStoreOnLink(winId, key) {
    return invokeToMainProcess("_getWindowExtStoreOnLink", winId, key);
}
exports.getWindowExtStoreOnLink = getWindowExtStoreOnLink;
async function getAllWindowExtStoreOnLink(winId, key) {
    return invokeToMainProcess("_getAllWindowExtStoreOnLink", winId, key);
}
exports.getAllWindowExtStoreOnLink = getAllWindowExtStoreOnLink;
function onWindowStateChanged(winId, callback) {
    const tempKey = `WindowStateChanged_${winId}`;
    onStoreDataChanged(tempKey, callback);
}
exports.onWindowStateChanged = onWindowStateChanged;
m_UseTimeLog.end("10");
//# sourceMappingURL=RendererHelper.js.map