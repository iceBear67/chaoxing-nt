"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTrayText = exports.on = exports.initTray = exports.activateApp = void 0;
const appCfg = require("../config/appconfig.json");
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const events_1 = require("events");
const BrowserHelper_1 = require("./BrowserHelper");
const WinId_1 = __importDefault(require("../common/WinId"));
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const AppSystemConfigMainHelper_1 = require("./AppSystemConfigMainHelper");
const TabHelper_1 = require("./TabHelper");
let m_DefaultImage;
let m_trayData = {};
let isStopOpenPopup = false;
function activateApp() {
    let mainWindow = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }
    let meetWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
    if (mainWindow.isVisible()) {
        if (process.platform == "darwin") {
            mainWindow.show();
            setTimeout(() => {
                mainWindow.focus();
            }, 10);
        }
        else {
            mainWindow.focus();
        }
    }
    else {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        else {
            mainWindow.show();
        }
    }
    if (meetWin && !meetWin.isDestroyed()) {
        if (meetWin.isVisible()) {
            if (process.platform == "darwin") {
                meetWin.show();
                setTimeout(() => {
                    meetWin.focus();
                }, 20);
            }
            else {
                meetWin.focus();
            }
        }
        else {
            if (!meetWin.isFullScreen() && meetWin.isMinimized()) {
                meetWin.setParentWindow(mainWindow);
            }
            setTimeout(() => {
                if (meetWin.isMinimized()) {
                    meetWin.restore();
                }
                else {
                    meetWin.show();
                    meetWin.restore();
                }
            }, 300);
            setTimeout(() => {
                meetWin.setParentWindow(undefined);
            }, 500);
        }
        setTimeout(() => {
            let mainWinBounds = mainWindow.getBounds();
            let meetWinBounds = meetWin.getBounds();
            if (mainWindow.isFullScreen() || meetWin.isFullScreen()) {
                return;
            }
            if (Math.abs(mainWinBounds.x - meetWinBounds.x) < 30 &&
                Math.abs(mainWinBounds.y - meetWinBounds.y) < 30) {
                let screenBounds = electron_1.screen.getDisplayMatching(mainWinBounds).workArea;
                mainWindow.setPosition(Math.max(meetWinBounds.x - 50, screenBounds.x), Math.max(mainWinBounds.y - 50, screenBounds.y));
            }
        }, 400);
    }
    setTimeout(() => {
        let winBounds = mainWindow.getBounds();
        console.log("mainWindowBounds:", JSON.stringify(winBounds));
        if (meetWin && !meetWin.isDestroyed()) {
            let meetWinBounds = meetWin.getBounds();
            console.log("meetWinBounds:", JSON.stringify(meetWinBounds));
        }
    }, 1000);
}
exports.activateApp = activateApp;
if (appCfg.appMode == "fyketang") {
    module.exports = { initTray: () => { }, on: () => { }, activateApp };
    return;
}
let m_tray;
let m_flashInterval;
let m_EventEmitter = new events_1.EventEmitter();
let m_mainWindow;
function initTray(mainWindow, appMode) {
    m_mainWindow = mainWindow;
    m_tray = new electron_1.Tray(getDefaultImage());
    m_tray.setToolTip(appCfg.appName);
    let menuTemplate = [
        {
            label: "打开主面板",
            type: "normal",
            click: activateApp,
        },
    ];
    if (appCfg.appMode != "fanya") {
        menuTemplate.push({
            label: "设置",
            type: "normal",
            click: () => {
                m_mainWindow.webContents.send("changeTab", "tab_setting");
                activateApp();
            },
        });
    }
    menuTemplate.push({
        label: "退出",
        type: "normal",
        click: () => {
            console.log("app.quit() on tray menu");
            electron_1.app.quit();
        },
    });
    const contextMenu = electron_1.Menu.buildFromTemplate(menuTemplate);
    m_tray.on("right-click", (event, bound) => {
        m_tray.popUpContextMenu(contextMenu, { x: bound.x, y: bound.y });
    });
    m_tray.on("click", async (event, bounds, positon) => {
        if (m_flashInterval) {
            if (process.platform == "win32") {
                await (0, TabHelper_1.exitCurFullscreen)();
            }
            m_mainWindow.webContents.send("changeTab", "tab_message", m_trayData);
            const id = WinId_1.default.TrayPopWindow;
            let tempPopWin = (0, BrowserHelper_1.getWindowInWindowMap)(id);
            if (tempPopWin && !tempPopWin.isDestroyed()) {
                (0, BrowserHelper_1.closeWindow)(id);
                isStopOpenPopup = false;
            }
            else {
                isStopOpenPopup = true;
            }
        }
        activateApp();
    });
    if (appCfg.appMode != "fanya" && process.platform == "win32") {
        m_tray.on("mouse-move", (event, position) => {
            const id = WinId_1.default.TrayPopWindow;
            let tempPopWin = (0, BrowserHelper_1.getWindowInWindowMap)(id);
            if (tempPopWin && !tempPopWin.isDestroyed()) {
                return;
            }
            let res = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
            if (!res.messageReminder) {
                return;
            }
            m_EventEmitter.emit("preOpenTrayMsgPop");
        });
    }
}
exports.initTray = initTray;
function getDefaultImage() {
    if (!m_DefaultImage) {
        let imgPath;
        if (process.platform == "darwin") {
            imgPath = path_1.default.join(__dirname, "../../icons/logoTemplate.png");
        }
        else {
            imgPath = path_1.default.join(__dirname, "../../icons/logo.ico");
        }
        m_DefaultImage = electron_1.nativeImage.createFromPath(imgPath);
    }
    return m_DefaultImage;
}
function getTransparentImage() {
    return path_1.default.join(__dirname, "../../icons/transparent.png");
}
function checkImageIsBlank(img) {
    try {
        const { width, height } = img.getSize();
        if (width == 0 || height == 0) {
            return true;
        }
        const imgData = img.toBitmap();
        const data = new Uint8Array(imgData);
        const step = 1;
        for (let i = 3; i < data.length; i += step * 4) {
            if (data[i] !== 0) {
                return false;
            }
        }
        return true;
    }
    catch (e) {
        return false;
    }
}
function startFlash(imgData, data) {
    const mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
    if (mainWin && mainWin.isFocused()) {
        return;
    }
    if (data) {
        m_trayData = data;
    }
    if (m_flashInterval) {
        clearInterval(m_flashInterval);
    }
    let img;
    if (imgData) {
        img = electron_1.nativeImage.createFromDataURL(imgData);
        if (checkImageIsBlank(img)) {
            img = getDefaultImage();
        }
    }
    else {
        img = getDefaultImage();
    }
    let transImg = electron_1.nativeImage.createFromPath(getTransparentImage());
    let hide = false;
    console.log("startFlash:setImage:imgData", imgData?.length || 0);
    m_tray.setImage(img);
    m_flashInterval = setInterval(() => {
        if (hide) {
            m_tray.setImage(img);
        }
        else {
            m_tray.setImage(transImg);
        }
        hide = !hide;
    }, 450);
}
function stopFlash(imgData) {
    if (m_flashInterval) {
        clearInterval(m_flashInterval);
        m_flashInterval = undefined;
    }
    let img;
    if (imgData) {
        img = electron_1.nativeImage.createFromDataURL(imgData);
    }
    else {
        img = getDefaultImage();
    }
    img.setTemplateImage(true);
    console.log("stopFlash:setImage:imgData", imgData?.length || 0);
    m_tray.setImage(img);
}
electron_1.ipcMain.on("_flashTray", (event, flag, imgData, data) => {
    if (!m_tray) {
        return;
    }
    if (flag) {
        startFlash(imgData, data);
    }
    else {
        stopFlash(imgData);
    }
});
electron_1.ipcMain.on("_setTrayIconMac", (event, base64Url1x, base64Url2x) => {
    if (!m_tray) {
        return;
    }
    let imageCacheDir = path_1.default.join(electron_1.app.getPath("userData"), "files/images/tray");
    if (!fs_1.default.existsSync(imageCacheDir)) {
        fs_1.default.mkdirSync(imageCacheDir, { recursive: true });
    }
    let imgPath1 = path_1.default.join(imageCacheDir, "logoTemplate.png");
    if (fs_1.default.existsSync(imgPath1)) {
        fs_1.default.unlinkSync(imgPath1);
    }
    let img1 = electron_1.nativeImage.createFromDataURL(base64Url1x);
    fs_1.default.writeFileSync(imgPath1, img1.toPNG());
    let imgPath2 = path_1.default.join(imageCacheDir, "logoTemplate@2x.png");
    if (fs_1.default.existsSync(imgPath2)) {
        fs_1.default.unlinkSync(imgPath2);
    }
    let img2 = electron_1.nativeImage.createFromDataURL(base64Url2x);
    fs_1.default.writeFileSync(imgPath2, img2.toPNG());
    let img = electron_1.nativeImage.createFromPath(imgPath1);
    img.setTemplateImage(true);
    m_tray.setImage(img);
});
function on(key, listener) {
    m_EventEmitter.on(key, listener);
}
exports.on = on;
electron_1.ipcMain.on("_openTrayMsgPop", (event, data) => {
    showMessagePop(data);
});
function showMessagePop(data) {
    if (!data || !data.msgList || data.msgList.length == 0) {
        return;
    }
    if (isStopOpenPopup === true) {
        isStopOpenPopup = false;
        return;
    }
    const id = WinId_1.default.TrayPopWindow;
    let tempPopWin = (0, BrowserHelper_1.getWindowInWindowMap)(id);
    if (tempPopWin && !tempPopWin.isDestroyed()) {
        return;
    }
    let listLength = data.msgList.length > 3 ? 3 : data.msgList.length;
    let width = 280;
    let height = 86 + 58 * listLength;
    const url = "sview:/#/newMsgPop";
    let msgRect = getMessagePopRect(width, height);
    let popWin = (0, BrowserHelper_1.createBrowserWindow)({
        id,
        width,
        height,
        x: msgRect.x,
        y: msgRect.y,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: (0, LoadUrlHelper_1.getPreloadJs)(id, url),
        },
    });
    popWin.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(url));
    popWin.webContents.send("ready", data);
    checkMousePosition();
}
function getMessagePopRect(width, height) {
    let trayBounds = m_tray.getBounds();
    let display = electron_1.screen.getDisplayMatching(trayBounds);
    console.log("trayBounds", JSON.stringify(trayBounds), JSON.stringify(display));
    let screenBounds = display.bounds;
    let screenWorkArea = display.workArea;
    let x;
    let y;
    if (screenBounds.width > screenWorkArea.width) {
        x = trayBounds.x;
        y = trayBounds.y + (trayBounds.height - height) / 2;
    }
    else {
        x = trayBounds.x + (trayBounds.width - width) / 2;
        y = trayBounds.y;
        if (screenBounds.y < screenWorkArea.y) {
            y = trayBounds.y + trayBounds.height;
        }
        else {
            y = trayBounds.y - height;
        }
    }
    if (x < screenWorkArea.x) {
        x = screenWorkArea.x;
    }
    else if (x + width > screenWorkArea.x + screenWorkArea.width) {
        x = screenWorkArea.x + screenWorkArea.width - width;
    }
    if (y < screenWorkArea.y) {
        y = screenWorkArea.y;
    }
    else if (y + height > screenWorkArea.y + screenWorkArea.height) {
        y = screenWorkArea.y + screenWorkArea.height - height;
    }
    x = Math.floor(x);
    y = Math.floor(y);
    return { x, y, width, height };
}
electron_1.ipcMain.on("_changeMessagePopHeight", (event, height) => {
    let width = 280;
    let msgRect = getMessagePopRect(width, height);
    let tempPopWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.TrayPopWindow);
    if (tempPopWin && !tempPopWin.isDestroyed()) {
        tempPopWin.setBounds(msgRect);
    }
});
function isPointInRect(point, rect) {
    return (point.x > rect.x &&
        point.x < rect.x + rect.width &&
        point.y > rect.y &&
        point.y < rect.y + rect.height);
}
let m_CheckMouseInterval;
let m_CloseMsgPopTimer;
function checkMousePosition() {
    if (m_CheckMouseInterval) {
        return;
    }
    m_CheckMouseInterval = setInterval(() => {
        const curCursor = electron_1.screen.getCursorScreenPoint();
        const tragRect = m_tray.getBounds();
        if (!isPointInRect(curCursor, tragRect)) {
            clearInterval(m_CheckMouseInterval);
            m_CheckMouseInterval = undefined;
            closeMessagePop(500);
        }
    }, 300);
}
function closeMessagePop(afterTimeMs) {
    let tempPopWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.TrayPopWindow);
    if (tempPopWin && !tempPopWin.isDestroyed()) {
        if (!afterTimeMs) {
            tempPopWin.close();
        }
        else {
            m_CloseMsgPopTimer = setTimeout(() => {
                if (tempPopWin && !tempPopWin.isDestroyed()) {
                    tempPopWin.close();
                }
                m_CloseMsgPopTimer = undefined;
            }, afterTimeMs);
        }
    }
}
electron_1.ipcMain.on("_mouseEnterMessagePop", () => {
    if (m_CloseMsgPopTimer) {
        clearTimeout(m_CloseMsgPopTimer);
        m_CloseMsgPopTimer = undefined;
    }
    if (m_CheckMouseInterval) {
        clearInterval(m_CheckMouseInterval);
        m_CheckMouseInterval = undefined;
    }
});
electron_1.ipcMain.on("_setBadgeCount", (event, count) => {
    let trayText = "";
    if (count > 99) {
        trayText = "99+";
    }
    else if (count > 0) {
        trayText = count + "";
    }
    setTrayText(trayText);
});
function setTrayText(text) {
    if (process.platform == "darwin") {
        m_tray.setTitle(text);
    }
}
exports.setTrayText = setTrayText;
module.exports = { initTray, on, stopFlash, activateApp, setTrayText };
exports.default = module.exports;
//# sourceMappingURL=TrayHelper.js.map