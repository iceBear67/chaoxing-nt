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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadScreenShotData = void 0;
const electron_1 = require("electron");
const RendererHelper_1 = require("./RendererHelper");
const RendererHelper = __importStar(require("./RendererHelper"));
const node_screenshots_1 = require("node-screenshots");
const { getDesktopWindowInfo, WindowInfo } = require("../../module/cxHelper2");
const { UseTimeLog } = require("../utils/UseTimeLogUtil");
let m_UseTimeLog = new UseTimeLog();
let m_ScreenInfo = null;
class ScreenInfo {
    constructor(display) {
        this.scaleFactor = display.scaleFactor;
    }
    setMonitor(monitor) {
        this.x = monitor.x;
        this.y = monitor.y;
        this.width = monitor.width;
        this.height = monitor.height;
        this.monitor = monitor;
    }
    getMonitor() {
        return this.monitor;
    }
}
function screenShotFinished(data) {
    RendererHelper.sendToMainProcess("_screenShotFinished", data);
}
function sendToOtherSceenshotWindow(key, value) {
    RendererHelper.sendToMainProcess("_sendToOtherSceenshotWindow", key, value);
}
async function getScreenshotColor(screenIndex, x, y) {
    return electron_1.ipcRenderer.invoke("_getScreenshotColor", { screenIndex, x, y });
}
electron_1.webFrame.insertCSS(`:root {
    background: transparent !important;
  }`);
function getWindowListInScreen(screenInfo, windowInfos) {
    return windowInfos.filter((windowInfo) => {
        windowInfo.x -= screenInfo.x;
        windowInfo.y -= screenInfo.y;
        if (windowInfo.width < 10 || windowInfo.height < 10) {
            return false;
        }
        if (windowInfo.x >= 0 &&
            windowInfo.y >= 0 &&
            windowInfo.x + windowInfo.width <= screenInfo.width &&
            windowInfo.y + windowInfo.height <= screenInfo.height) {
            return true;
        }
        else if (windowInfo.x >= screenInfo.width ||
            windowInfo.y >= screenInfo.height ||
            windowInfo.x + windowInfo.width <= 0 ||
            windowInfo.y + windowInfo.height <= 0) {
            return false;
        }
        else {
            if (windowInfo.x < 0) {
                windowInfo.width += windowInfo.x;
                windowInfo.x = 0;
            }
            if (windowInfo.y < 0) {
                windowInfo.height += windowInfo.y;
                windowInfo.y = 0;
            }
            if (windowInfo.x + windowInfo.width > screenInfo.width) {
                windowInfo.width = screenInfo.width - windowInfo.x;
            }
            if (windowInfo.y + windowInfo.height > screenInfo.height) {
                windowInfo.height = screenInfo.height - windowInfo.y;
            }
            if (windowInfo.width < 10 || windowInfo.height < 10) {
                return false;
            }
            return true;
        }
    });
}
async function loadScreenShotData() {
    m_UseTimeLog.start("loadScreenShotData");
    let curScreenDisplay = await (0, RendererHelper_1.getScreenDisplayByWinId)();
    m_UseTimeLog.end("111");
    let monitors = node_screenshots_1.Monitor.all();
    m_UseTimeLog.end("222");
    let curScreenBounds = curScreenDisplay.bounds;
    let screenInfo = new ScreenInfo(curScreenDisplay);
    m_ScreenInfo = screenInfo;
    m_UseTimeLog.end("333");
    for (let monitor of monitors) {
        if (monitor.x == curScreenBounds.x && monitor.y == curScreenBounds.y) {
            m_UseTimeLog.end("444-111");
            let screenShotImgData = await monitor.captureImage();
            m_UseTimeLog.end("444-222");
            let imgBuffer = await screenShotImgData.toPng();
            screenInfo.imgData = new Blob([imgBuffer]);
            m_UseTimeLog.end("444-333");
            screenInfo.setMonitor(monitor);
            m_UseTimeLog.end("444-999");
            return { screenInfo, allWindows: [] };
        }
    }
    m_UseTimeLog.end("555");
    let centerPoint1 = {
        x: curScreenBounds.x + curScreenBounds.width / 2,
        y: curScreenBounds.y + curScreenBounds.height / 2,
    };
    let minDistanceObj = { distance: Number.MAX_VALUE, monitor: null };
    for (let monitor of monitors) {
        let centerPoint2 = {
            x: monitor.x + monitor.width / 2,
            y: monitor.y + monitor.height / 2,
        };
        let dx = centerPoint1.x - centerPoint2.x;
        let dy = centerPoint1.y - centerPoint2.y;
        let tempDistance = dx * dx + dy * dy;
        if (tempDistance < minDistanceObj.distance) {
            minDistanceObj.distance = tempDistance;
            minDistanceObj.monitor = monitor;
        }
    }
    m_UseTimeLog.end("666");
    screenInfo.setMonitor(minDistanceObj.monitor);
    let screenShotImgData = await minDistanceObj.monitor.captureImage();
    m_UseTimeLog.end("777");
    let imgBuffer = await screenShotImgData.toPng();
    screenInfo.imgData = new Blob([imgBuffer]);
    m_UseTimeLog.end("999");
    return { screenInfo, allWindows: [] };
}
exports.loadScreenShotData = loadScreenShotData;
async function getAllWindowsInfo() {
    m_UseTimeLog.start("getAllWindowsInfo");
    if (!m_ScreenInfo) {
        return [];
    }
    let handleId = await (0, RendererHelper_1.invokeToMainProcess)("_getWindowHandleId");
    m_UseTimeLog.end("111");
    let allWindows = getDesktopWindowInfo();
    m_UseTimeLog.end("222");
    allWindows = allWindows.filter((windowInfo) => {
        if (windowInfo.winId + "" == handleId) {
            return false;
        }
        return true;
    });
    m_UseTimeLog.end("333");
    allWindows = getWindowListInScreen(m_ScreenInfo, allWindows);
    m_UseTimeLog.end("444");
    let tempWindows = node_screenshots_1.Window.all();
    m_UseTimeLog.end("555");
    allWindows = allWindows.filter((windowInfo) => {
        return tempWindows.find((win) => {
            return win.id === windowInfo.winId;
        });
    });
    m_UseTimeLog.end("666");
    console.log("getDesktopWindowInfo", allWindows);
    m_UseTimeLog.end("999");
    return allWindows;
}
module.exports = {
    screenShotFinished,
    sendToOtherSceenshotWindow,
    getScreenshotColor,
    loadScreenShotData,
    getAllWindowsInfo,
};
//# sourceMappingURL=ScreenShotHelper.js.map