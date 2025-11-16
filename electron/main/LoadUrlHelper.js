"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreloadJs = exports.getHtmlFilePath = exports.getUrl = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const url_1 = require("url");
const appCfg = require("../config/appconfig.json");
const WinId_1 = __importDefault(require("../common/WinId"));
let devPort = 0;
function getUrl(url, transparentBg = false) {
    if (url.startsWith("sview:/")) {
        let tempPath = url.replace("sview:/", "");
        if (electron_1.app.isPackaged) {
            let fileUrl = new url_1.URL("file://");
            fileUrl.pathname = path_1.default.join(__dirname, "../../dist/index.html");
            fileUrl.hash = tempPath;
            let resUrl = fileUrl.href;
            return transparentBg ? getTransparentBgUrl(resUrl) : resUrl;
        }
        else {
            if (devPort == 0) {
                let devCfgFile = path_1.default.join(__dirname, "../../script/devCfg.json");
                if (fs_1.default.existsSync(devCfgFile)) {
                    let devCfgData = require(devCfgFile);
                    if (devCfgData?.port) {
                        devPort = devCfgData.port;
                    }
                }
                else {
                    devPort = 5173;
                }
            }
            let resUrl = `http://localhost:${devPort}/${tempPath}`;
            return transparentBg ? getTransparentBgUrl(resUrl) : resUrl;
        }
    }
    if (url.startsWith("hview:/")) {
        let tempPath = url.replace("hview:/", "");
        let filePath = path_1.default.join(getHtmlFilePath(), tempPath);
        let resUrl = "file://" + filePath;
        return transparentBg ? getTransparentBgUrl(resUrl) : resUrl;
    }
    if (!url.startsWith("http") &&
        !url.startsWith("file") &&
        !url.startsWith("ftp")) {
        let fileUrl = new url_1.URL("file://");
        fileUrl.pathname = url;
        let resUrl = fileUrl.href;
        return transparentBg ? getTransparentBgUrl(resUrl) : resUrl;
    }
    return url;
}
exports.getUrl = getUrl;
function getTransparentBgUrl(url) {
    if (url.includes("?")) {
        return url + "&useTransparentBackground=1";
    }
    else {
        return url + "?useTransparentBackground=1";
    }
}
function getHtmlFilePath(filePath) {
    if (filePath) {
        return path_1.default.join(__dirname, "../../html", filePath);
    }
    else {
        return path_1.default.join(__dirname, "../../html");
    }
}
exports.getHtmlFilePath = getHtmlFilePath;
function getPreloadJs(id, url) {
    if (id == "tab_message_sub") {
        return path_1.default.join(__dirname, "../preload/message_view_preload.js");
    }
    else if (id == WinId_1.default.meetWindowUUID) {
        return path_1.default.join(__dirname, "../preload/ketang_preload.js");
    }
    else if (id == WinId_1.default.openPIPVideoBoxWindowUUID ||
        id == WinId_1.default.openVideoBoxWindowUUID ||
        id == WinId_1.default.KetangFloatingWindowUUID ||
        id == "shareScreenWindow") {
        return path_1.default.join(__dirname, "../preload/common_preload_with_video_renderer.js");
    }
    else if (id == WinId_1.default.settingInMeetUUID || id == "message-dialog") {
        return path_1.default.join(__dirname, "../preload/ketang_setting_after_meet.js");
    }
    else if (id == WinId_1.default.settingBeforeMeetUUID) {
        return path_1.default.join(__dirname, "../preload/ketang_setting_before_meet.js");
    }
    else if (id == WinId_1.default.screenshotWindow) {
        return path_1.default.join(__dirname, "../preload/screenshot_preload.js");
    }
    else if (id == WinId_1.default.projectionBox ||
        id == WinId_1.default.stuShowBox ||
        id == WinId_1.default.RTCWindow) {
        return path_1.default.join(__dirname, "../preload/ketang_preload_with_rtc.js");
    }
    else if (id == WinId_1.default.speechRecognitionUUID) {
        return path_1.default.join(__dirname, "../preload/speech_translation_preload.js");
    }
    else if (id == "paintbrush") {
        return path_1.default.join(__dirname, "../preload/screen_control_preload.js");
    }
    else if (id == WinId_1.default.cxRobotUUID) {
        return path_1.default.join(__dirname, "../preload/robot_translation_preload.js");
    }
    let preloadFlag = 0;
    if (url.startsWith("sview:/") ||
        url.startsWith("file:/") ||
        url.startsWith("hview:/")) {
        preloadFlag = 2;
    }
    else {
        let tempUrl = new url_1.URL(url);
        let tempUrlStr;
        if (tempUrl.hostname == "k.chaoxing.com" ||
            (tempUrl.hostname &&
                appCfg.fyketang?.domain &&
                tempUrl.hostname.endsWith(appCfg.fyketang.domain)) ||
            (url.length > 8 &&
                (tempUrlStr = url.substring(url.indexOf("://") + 3)) &&
                tempUrlStr.startsWith("fe.chaoxing.com/front/ktmeet"))) {
            preloadFlag = 3;
        }
        else if (tempUrl.hostname.endsWith("chaoxing.com") ||
            tempUrl.hostname.endsWith("cldisk.com")) {
            preloadFlag = 1;
        }
    }
    if (preloadFlag == 1) {
        return path_1.default.join(__dirname, "../preload/common_preload.js");
    }
    else if (preloadFlag == 2) {
        return path_1.default.join(__dirname, "../preload/main_window_preload.js");
    }
    else if (preloadFlag == 3) {
        return path_1.default.join(__dirname, "../preload/ketang_common_preload.js");
    }
    else {
        return path_1.default.join(__dirname, "../preload/other_preload.js");
    }
}
exports.getPreloadJs = getPreloadJs;
//# sourceMappingURL=LoadUrlHelper.js.map