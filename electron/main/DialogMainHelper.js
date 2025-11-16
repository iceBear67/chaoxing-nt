"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openToastDialog = exports.openCommonDialog = exports.dialogToast = exports.dialogToastLong = exports.dialogConfirm = exports.dialogAlert = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const BrowserHelper_1 = require("./BrowserHelper");
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const WinId_1 = __importDefault(require("../common/WinId"));
const m_ToastTimerMap = new Map();
function dialogAlert(pWindow, text, options) {
    if (!options) {
        options = {};
    }
    if (text) {
        options.content = text;
    }
    options.type = "alert";
    openCommonDialog(pWindow, options);
}
exports.dialogAlert = dialogAlert;
function dialogConfirm(pWindow, options) {
    if (!options) {
        options = {};
    }
    options.type = "confirm";
    openCommonDialog(pWindow, options);
}
exports.dialogConfirm = dialogConfirm;
function dialogToastLong(pWindow, text, options) {
    if (!options) {
        options = {};
    }
    options.type = "toast";
    if (text) {
        options.content = text;
        options.duration = -10;
    }
    openCommonDialog(pWindow, options);
}
exports.dialogToastLong = dialogToastLong;
function dialogToast(pWindow, text, options) {
    if (!options) {
        options = {};
    }
    options.type = "toast";
    if (text) {
        options.content = text;
    }
    openCommonDialog(pWindow, options);
}
exports.dialogToast = dialogToast;
function openCommonDialog(pWindow, options) {
    if (!options.winConfig) {
        options.winConfig = {};
    }
    options.winConfig.fullscreen = false;
    options.winConfig.simpleFullscreen = false;
    if (options.type === "toast") {
        return openToastDialog(pWindow, options);
    }
    return new Promise((resolve, reject) => {
        let winOptions = {};
        if (!options.winConfig && options.winCfg) {
            if (typeof options.winCfg == "string") {
                options.winConfig = JSON.parse(options.winCfg);
            }
            else {
                options.winConfig = options.winCfg;
            }
        }
        if (options.winConfig) {
            winOptions = Object.assign({}, options.winConfig);
        }
        winOptions.hasShadow = false;
        if (!winOptions.id && options.winId) {
            winOptions.id = options.winId;
        }
        let fileUrl = new URL("file://");
        if (options.type === "alert2") {
            fileUrl.pathname = path_1.default.join(__dirname, "../../html/alert.html");
            winOptions.width = 460;
            winOptions.height = 232;
        }
        else {
            fileUrl.pathname = path_1.default.join(__dirname, "../../html/pop1.html");
            winOptions.width = options.width || 420;
            winOptions.height = options.height || 186;
        }
        if (winOptions.id) {
            let tempWin = (0, BrowserHelper_1.getWindowInWindowMap)(winOptions.id);
            if (tempWin && !tempWin.isDestroyed()) {
                tempWin.show();
                resolve(true);
                return;
            }
            if (winOptions.id == "closeVideo_Pip") {
                let openPIPVideoBoxWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.openPIPVideoBoxWindowUUID);
                if (openPIPVideoBoxWindowTemp &&
                    !openPIPVideoBoxWindowTemp.isDestroyed()) {
                    openPIPVideoBoxWindowTemp.setAlwaysOnTop(false);
                }
            }
        }
        winOptions.webPreferences = {
            preload: path_1.default.join(__dirname, "../preload/ketang_common_preload.js"),
            contextIsolation: true,
        };
        winOptions.frame = false;
        winOptions.transparent = true;
        if (process.platform == "darwin") {
            winOptions.modal = false;
        }
        else {
            winOptions.modal = false;
        }
        if (winOptions.id == "closeVideo_Pip" || winOptions.id == "openPip_Video") {
            let screenWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
            if (screenWin && !screenWin.isDestroyed()) {
                pWindow = screenWin;
                winOptions.modal = false;
            }
        }
        if (pWindow) {
            winOptions.parent = pWindow;
        }
        let win = (0, BrowserHelper_1.createBrowserWindow)(winOptions);
        win.loadURL(fileUrl.href);
        console.info("[MainProcessHelper][new-window]新视图:打开新弹窗:url:" + fileUrl);
        win.webContents.ipc.once("_openCommonDialog_" + options.id, (event, data) => {
            if (data._ok && options.okClick) {
                options.okClick(data);
            }
            else {
                if (options.cancelClick) {
                    options.cancelClick();
                }
            }
            resolve(data);
        });
        let initData = Object.assign({}, options);
        initData.okClick = undefined;
        initData.cancelClick = undefined;
        if (initData.okBtns) {
            initData.okBtns.forEach((btn) => {
                btn.click = undefined;
            });
        }
        win.webContents.send("ready", initData);
        win.webContents.on("did-start-loading", () => {
            win.webContents.send("ready", options);
        });
        win.webContents.on("did-stop-loading", () => {
            win.webContents.send("pageLoadFinish", initData);
        });
        if (pWindow) {
            let dId = pWindow.id + "_" + options.id;
            win.dialogId = dId;
        }
        else {
            win.dialogId = options.id;
        }
        if (winOptions.id) {
            (0, BrowserHelper_1.putWindowInWindowMap)(winOptions.id, win);
            win.on("closed", (event) => {
                (0, BrowserHelper_1.delWindowInWindowMap)(winOptions.id);
                if (winOptions.id == "closeVideo_Pip") {
                    let openPIPVideoBoxWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.openPIPVideoBoxWindowUUID);
                    if (openPIPVideoBoxWindowTemp &&
                        !openPIPVideoBoxWindowTemp.isDestroyed()) {
                        openPIPVideoBoxWindowTemp.setAlwaysOnTop(true, "pop-up-menu");
                    }
                }
            });
        }
        setTimeout(() => {
            if (win && !win.isDestroyed()) {
                win.show();
            }
        }, 360);
        setTimeout(() => {
            if (win && !win.isDestroyed()) {
                win.show();
            }
        }, 700);
    });
}
exports.openCommonDialog = openCommonDialog;
async function openToastDialog(pWindow, options) {
    console.debug("openToastDialog", options);
    let winOptions = {};
    if (!options.winConfig && options.winCfg) {
        if (typeof options.winCfg == "string") {
            options.winConfig = JSON.parse(options.winCfg);
        }
        else {
            options.winConfig = options.winCfg;
        }
    }
    if (options.winConfig) {
        winOptions = Object.assign({}, options.winConfig);
    }
    winOptions.fullscreen = false;
    winOptions.simpleFullscreen = false;
    winOptions.hasShadow = false;
    if (!winOptions.id && options.winId) {
        winOptions.id = options.winId;
    }
    let fileUrl = new URL("file://");
    fileUrl.pathname = path_1.default.join(__dirname, "../../html/pop2.html");
    winOptions.width = options.width || 380;
    winOptions.height = options.height || 48;
    let screenArea;
    if (pWindow) {
        if (options.position == "inWindow") {
            screenArea = pWindow.getBounds();
        }
        else {
            screenArea = electron_1.screen.getDisplayMatching(pWindow.getBounds()).workArea;
        }
    }
    else {
        screenArea = electron_1.screen.getPrimaryDisplay().workArea;
    }
    if (options.top) {
        winOptions.y = screenArea.y + options.top;
    }
    else {
        if (options.gravity == 1) {
            winOptions.y = (screenArea.height - winOptions.height) / 2 + screenArea.y;
        }
        else {
            winOptions.y = screenArea.height - 100 + screenArea.y;
        }
    }
    winOptions.x = (screenArea.width - winOptions.width) / 2 + screenArea.x;
    if (winOptions.id) {
        let tempWin = (0, BrowserHelper_1.getWindowInWindowMap)(winOptions.id);
        if (tempWin && !tempWin.isDestroyed()) {
            let timer = m_ToastTimerMap.get(winOptions.id);
            if (timer) {
                clearTimeout(timer);
            }
            console.log("close toast:", winOptions.id);
            tempWin.close();
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true);
                }, 10);
            });
            tempWin = (0, BrowserHelper_1.getWindowInWindowMap)(winOptions.id);
            if (tempWin && !tempWin.isDestroyed()) {
                return;
            }
        }
    }
    winOptions.webPreferences = {
        preload: (0, LoadUrlHelper_1.getPreloadJs)(winOptions.id, fileUrl.href),
        contextIsolation: true,
    };
    winOptions.frame = false;
    winOptions.transparent = true;
    winOptions.modal = false;
    if (pWindow) {
        winOptions.parent = pWindow;
    }
    let win = (0, BrowserHelper_1.createBrowserWindow)(winOptions);
    win.loadURL(fileUrl.href);
    console.info("[MainProcessHelper][new-window]新视图:打开新弹窗:url:" + fileUrl);
    let initData = Object.assign({}, options);
    initData.okClick = undefined;
    initData.cancelClick = undefined;
    if (initData.okBtns) {
        initData.okBtns.forEach((btn) => {
            btn.click = undefined;
        });
    }
    win.webContents.send("ready", initData);
    win.webContents.on("did-start-loading", () => {
        win.webContents.send("ready", options);
    });
    win.webContents.on("did-stop-loading", () => {
        win.webContents.send("pageLoadFinish", initData);
    });
    if (pWindow) {
        let dId = pWindow.id + "_" + options.id;
        win.dialogId = dId;
    }
    else {
        win.dialogId = options.id;
    }
    if (winOptions.id) {
        (0, BrowserHelper_1.putWindowInWindowMap)(winOptions.id, win);
        win.on("closed", (event) => {
            (0, BrowserHelper_1.delWindowInWindowMap)(winOptions.id);
        });
    }
    setTimeout(() => {
        if (win && !win.isDestroyed()) {
            win.show();
        }
    }, 360);
    setTimeout(() => {
        if (win && !win.isDestroyed()) {
            win.show();
        }
    }, 700);
    let duration = options.duration;
    if (duration != -10) {
        if (!duration) {
            duration = 3000;
        }
        let timer = setTimeout(() => {
            if (win && !win.isDestroyed()) {
                win.close();
            }
            m_ToastTimerMap.delete(winOptions.id);
        }, duration);
        if (winOptions.id) {
            m_ToastTimerMap.set(winOptions.id, timer);
        }
    }
}
exports.openToastDialog = openToastDialog;
electron_1.ipcMain.handle("_openCommonDialog", (event, options) => {
    let pWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (!options.winConfig && options.winCfg) {
        if (typeof options.winCfg == "string") {
            options.winConfig = JSON.parse(options.winCfg);
        }
        else {
            options.winConfig = options.winCfg;
        }
    }
    if (options.winConfig && options.winConfig.subWindow === false) {
        pWindow = undefined;
    }
    return openCommonDialog(pWindow, options);
});
electron_1.ipcMain.on("_closeCommonDialog", (event, dialogId) => {
    console.log("_closeCommonDialog", dialogId);
    let pWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
    let dId = pWindow.id + "_" + dialogId;
    let wins = electron_1.BrowserWindow.getAllWindows();
    for (let i = 0; i < wins.length; i++) {
        let win = wins[i];
        if (win.dialogId === dId) {
            win.close();
            break;
        }
    }
});
//# sourceMappingURL=DialogMainHelper.js.map