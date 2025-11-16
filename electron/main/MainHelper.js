"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.relaunchApp = exports.onStoreDataChanged = exports.beforeWindowCreate = exports.on = exports.showWindow = exports.openNewWindow = exports.getTempStore = exports.setTempStore = exports.getSysStore = exports.setSysStore = exports.getUserStore = exports.setUserStore = exports.setSimpleFullScreen = exports.setFullScreen = void 0;
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const electron_1 = require("electron");
const BrowserHelper_1 = require("./BrowserHelper");
const StoreHelper_1 = __importDefault(require("./StoreHelper"));
const UserHelper = require("./UserHelper");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const md5_1 = __importDefault(require("md5"));
const url_1 = require("url");
const WinId_1 = __importDefault(require("../common/WinId"));
const { ImOut } = require("../out/im/ImOut");
const { UserOut } = require("../out/user/UserOut");
const { PanOut } = require("../out/pan/PanOut");
const GenOut_1 = require("../out/gen/GenOut");
const { PassportGenOut } = require("../out/gen/PassportGenOut");
const { UcGenOut } = require("../out/gen/UcGenOut");
const { AccountUtil } = require("../utils/AccountUtil");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const m_StoreCache = new Map();
const events_1 = __importDefault(require("events"));
const PathUtil_1 = require("./PathUtil");
const DebounceUtil_1 = require("../utils/DebounceUtil");
const child_process_1 = __importDefault(require("child_process"));
const PostUrlCacheHelper_1 = require("./PostUrlCacheHelper");
const image_1 = require("./util/image");
const promises_1 = require("fs/promises");
const NetRequestUtil_1 = require("./util/NetRequestUtil");
const m_EventEmitObj = new events_1.default();
const electron_2 = require("electron");
const BrowserExtStore_1 = require("./BrowserExtStore");
const EventUtil_1 = require("../utils/EventUtil");
const m_StoreDataLisenters = new Map();
const PREVIEW_IMAGE_MAX_WIDTH = 1400;
const PREVIEW_IMAGE_MIN_WIDTH = 620;
const PREVIEW_IMAGE_MAX_HEIGHT = 900;
const PREVIEW_IMAGE_MIN_HEIGHT = 580;
const PREVIEW_IMAGE_DEFAULT_WIDTH = 960;
const PREVIEW_IMAGE_DEFAULT_HEIGHT = 630;
const SHAKE_WINDOW_INTERVAL = 15 * 1000;
const sendShakeWindowTimeMap = new Map();
const receiveShakeWindowTimeMap = new Map();
const ONLINE_FILE_WS_TOKEN_ENCRYPT_KEY = "pmkx6rxh";
const DEFAULT_WINDOW_SHAKE_OFFSETS = [
    [2, -2],
    [4, 2],
    [2, 4],
    [0, 1],
    [-1, -2],
    [2, 4],
    [0, 4],
    [-2, 0],
    [1, -4],
    [0, -4],
    [4, 0],
    [4, 2],
    [-1, 2],
    [0, -3],
    [0, 0],
];
electron_1.ipcMain.on("_closeWindow", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        win.close();
    }
});
electron_1.ipcMain.on("_setWindowclosAble", (event, closable, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        win.setClosable(closable);
    }
});
electron_1.ipcMain.on("_setWindowButtonVisibility", (event, visible, winId) => {
    if (process.platform != "darwin") {
        return;
    }
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        win.setWindowButtonVisibility(visible);
    }
});
electron_1.ipcMain.on("_changeWindowSize", (event, data) => {
    if (data.width <= 0 || data.height <= 0) {
        return;
    }
    let win;
    if (data.winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(data.winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        let resizAble = win.isResizable();
        if (!resizAble) {
            win.setResizable(true);
        }
        win.setSize(data.width, data.height);
        if (!resizAble) {
            win.setResizable(false);
        }
    }
});
electron_1.ipcMain.on("_resizeWindowSize", (event, data, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        if (data.width > 0 && data.height > 0) {
            win.setSize(data.width, data.height);
        }
        if (data.minWidth > 0 && data.minHeight > 0) {
            win.setMinimumSize(data.minWidth, data.minHeight);
        }
        if (data.maxWidth > 0 && data.maxHeight > 0) {
            win.setMaximumSize(data.maxWidth, data.maxHeight);
        }
        if (data.center === true) {
            win.center();
        }
    }
});
electron_1.ipcMain.on("_maxWindow", (event, winId, fullScreenOnMac = true) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        if (process.platform == "win32" || !fullScreenOnMac) {
            win.maximize();
        }
        else {
            win.setFullScreen(true);
        }
    }
});
electron_1.ipcMain.on("_unmaxWindow", (event, winId, fullScreenOnMac = true) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        if (process.platform == "win32" || !fullScreenOnMac) {
            win.unmaximize();
        }
        else {
            win.setFullScreen(false);
        }
    }
});
electron_1.ipcMain.on("_maxOrResotreWindow", (event, winId, fullScreenOnMac = true) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        if (process.platform == "win32" || !fullScreenOnMac) {
            if (win.isMaximized()) {
                win.unmaximize();
            }
            else {
                win.maximize();
            }
        }
        else {
            if (win.isFullScreen()) {
                win.setFullScreen(false);
            }
            else {
                win.setFullScreen(true);
            }
        }
    }
});
electron_1.ipcMain.on("_minWindow", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        win.minimize();
    }
});
electron_1.ipcMain.on("_restoreWindow", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        win.restore();
    }
});
electron_1.ipcMain.on("_focusWindow", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        win.focus();
    }
});
electron_1.ipcMain.on("_fullScreenWindow", (event, winId, flag) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    setFullScreen(win, flag);
});
electron_1.ipcMain.on("_simpleFullScreen", (event, winId, flag) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    setSimpleFullScreen(win, flag);
});
function setFullScreen(win, flag) {
    if (win && !win.isDestroyed()) {
        win.setFullScreen(flag);
    }
}
exports.setFullScreen = setFullScreen;
function setSimpleFullScreen(win, flag) {
    if (win && !win.isDestroyed()) {
        if (process.platform == "darwin") {
            win.setSimpleFullScreen(flag);
        }
        else {
            win.setFullScreen(flag);
        }
    }
}
exports.setSimpleFullScreen = setSimpleFullScreen;
electron_1.ipcMain.handle("_getAccounts", (event) => {
    return AccountUtil.getAccounts();
});
electron_1.ipcMain.handle("_getAccount", (event, puid) => {
    return AccountUtil.getAccount(puid);
});
electron_1.ipcMain.on("_setAccount", (event, data) => {
    AccountUtil.updateAccountProperty(data);
});
electron_1.ipcMain.handle("_removeAccount", (event, puid) => {
    return AccountUtil.removeAccount(puid);
});
electron_1.ipcMain.handle("_getUsersByTuids", (event, tuids, axiosConfig) => {
    return UserOut.getUserByTuids(UserHelper.getUID(), tuids, axiosConfig);
});
electron_1.ipcMain.handle("_getUsersByPuids", (event, puids) => {
    return UserOut.getUserByPuids(UserHelper.getUID(), puids);
});
electron_1.ipcMain.handle("_createChatGroups", (event, requestParams) => {
    return ImOut.createChatGroups(requestParams);
});
electron_1.ipcMain.handle("_genRequest", (event, requestParams) => {
    if (requestParams && requestParams.url) {
        if (!requestParams.baseUrl) {
            requestParams.baseUrl = new url_1.URL(requestParams.url).origin;
        }
        return new GenOut_1.GenOut(requestParams.baseUrl)
            .genRequest(requestParams.url, requestParams)
            .then((data) => {
            return data;
        })
            .catch((e) => {
            if (e && e.config) {
                e.config = undefined;
            }
            if (typeof e == "string" && e.length > 1024) {
                e = e.substring(0, 1024);
            }
            console.warn("_genRequest error:", e);
            return { result: 0, msg: "net interface return error" };
        });
    }
    return new Promise((resolve, reject) => {
        resolve({ result: 0, msg: "请检请求配置" });
    });
});
electron_1.ipcMain.handle("_passportGenRequest", (event, requestParams) => {
    if (requestParams && requestParams.url) {
        return new PassportGenOut()
            .genRequest(requestParams)
            .then((data) => {
            return data;
        })
            .catch((e) => {
            console.warn("_passportGenRequest error:", e);
            return { result: 0, msg: "net interface return error" };
        });
    }
    return new Promise((resolve, reject) => {
        resolve({ result: 0, msg: "请检请求配置" });
    });
});
electron_1.ipcMain.handle("_ucGenRequest", (event, requestParams) => {
    if (requestParams && requestParams.url) {
        return new UcGenOut(requestParams.baseUrl).genRequest(requestParams.url, requestParams);
    }
    return new Promise((resolve, reject) => {
        reject("请检请求配置");
    });
});
electron_1.ipcMain.handle("_dataGenSign", (event, signType, isSign, text, key) => {
    return handleDataGenSign(signType, isSign, text, key);
});
function handleDataGenSign(signType, isSign, text, key) {
    if (signType && text && key) {
        let dataGenSign;
        if (signType === "DES") {
            if (isSign) {
                dataGenSign = (0, CryptoUtil_1.encodeDes)(text, key);
            }
            else {
                dataGenSign = (0, CryptoUtil_1.decodeDes)(text, key);
            }
        }
        if (typeof dataGenSign != "undefined") {
            return Promise.resolve(dataGenSign);
        }
    }
    return Promise.reject("请检参数配置");
}
electron_1.ipcMain.on("_setUserStore", (event, key, value, delOnLogout) => {
    setUserStore(key, value, delOnLogout);
});
function setUserStore(key, value, delOnLogout) {
    let dataKey = UserHelper.getDataKey();
    let datas = StoreHelper_1.default.getDefault().get(dataKey);
    if (!datas) {
        datas = {};
    }
    if (value == undefined) {
        datas[key] = undefined;
    }
    else {
        datas[key] = { value, delOnLogout: delOnLogout ? true : false };
    }
    StoreHelper_1.default.getDefault().set(dataKey, datas);
    storeDataChanged(key, value);
}
exports.setUserStore = setUserStore;
electron_1.ipcMain.handle("_getUserStore", (event, key) => {
    return getUserStore(key);
});
function getUserStore(key) {
    let dataKey = UserHelper.getDataKey();
    let datas = StoreHelper_1.default.getDefault().get(dataKey);
    if (datas) {
        return datas[key]?.value;
    }
}
exports.getUserStore = getUserStore;
electron_1.ipcMain.on("_setSysStore", (event, key, value) => {
    setSysStore(key, value);
});
function setSysStore(key, value) {
    if (value == undefined || value == null) {
        StoreHelper_1.default.getSystem().delete(key);
    }
    else {
        StoreHelper_1.default.getSystem().set(key, value);
    }
    storeDataChanged(key, value);
}
exports.setSysStore = setSysStore;
electron_1.ipcMain.handle("_getSysStore", (event, key) => {
    return getSysStore(key);
});
function getSysStore(key) {
    return StoreHelper_1.default.getSystem().get(key);
}
exports.getSysStore = getSysStore;
electron_1.ipcMain.on("_setTempStore", (event, key, value) => {
    setTempStore(key, value);
});
function setTempStore(key, value) {
    m_StoreCache.set(key, value);
    storeDataChanged(key, value);
}
exports.setTempStore = setTempStore;
EventUtil_1.EventUtil.on("_setTempStore", (key, value) => {
    setTempStore(key, value);
});
electron_1.ipcMain.handle("_getTempStore", (event, key) => {
    return m_StoreCache.get(key);
});
function getTempStore(key) {
    return m_StoreCache.get(key);
}
exports.getTempStore = getTempStore;
electron_1.ipcMain.on("_openNewWindow", (event, args) => {
    openNewWindow(event, args);
});
function openNewWindow(event1, args, loadUrlOptions, fromWin) {
    if (!args.url) {
        return;
    }
    console.log(`打开新窗口：openNewWindow:id:${args.options?.id},url:${args.url}`);
    const winOptions = args.options || {};
    if (winOptions.id) {
        let beforeEvent = new Event("before_window_create", {
            cancelable: true,
        });
        m_EventEmitObj.emit(`before_window_create_${winOptions.id}`, beforeEvent);
        if (beforeEvent.defaultPrevented) {
            return;
        }
        let tempWin = (0, BrowserHelper_1.getWindowInWindowMap)(winOptions.id);
        if (tempWin && !tempWin.isDestroyed()) {
            tempWin.show();
            return;
        }
    }
    winOptions.width = winOptions.width || 1100;
    winOptions.height = winOptions.height || 750;
    let needResizable = false;
    if (winOptions.resizable !== false &&
        process.platform == "win32" &&
        electron_1.screen.getAllDisplays().length > 1) {
        needResizable = true;
        winOptions.resizable = false;
    }
    if (winOptions.subWindow === true) {
        let pWindow;
        if (winOptions.pWindowId) {
            pWindow = (0, BrowserHelper_1.getWindowInWindowMap)(winOptions.pWindowId);
        }
        else if (event1) {
            pWindow = electron_1.BrowserWindow.fromWebContents(event1.sender);
        }
        if (pWindow && !pWindow.isDestroyed()) {
            winOptions.parent = pWindow;
            if (winOptions.marginLeft != undefined ||
                winOptions.marginTop != undefined) {
                let pBounds = pWindow.getBounds();
                winOptions.x = Math.floor(pBounds.x + (winOptions.marginLeft || 0));
                winOptions.y = Math.floor(pBounds.y + (winOptions.marginTop || 0));
            }
        }
    }
    if (winOptions.siblingWindow && event1) {
        let cWindow = electron_1.BrowserWindow.fromWebContents(event1.sender);
        if (cWindow && cWindow.getParentWindow()) {
            winOptions.parent = cWindow.getParentWindow();
        }
    }
    let preloadPath = (0, LoadUrlHelper_1.getPreloadJs)(winOptions.id, args.url);
    winOptions.webPreferences = {
        preload: preloadPath,
        contextIsolation: true,
    };
    if (process.platform == "darwin") {
        winOptions.modal = false;
    }
    if (winOptions.autoWindowSize) {
        winOptions.webPreferences.enablePreferredSizeMode = true;
    }
    if (!args.url.startsWith("http")) {
        winOptions.webPreferences.webSecurity = false;
    }
    if (args.data) {
        if (!winOptions.extParams) {
            winOptions.extParams = {};
        }
        winOptions.extParams.initData = args.data;
    }
    if (!fromWin && event1) {
        fromWin = electron_1.BrowserWindow.fromWebContents(event1.sender);
    }
    let win = (0, BrowserHelper_1.createBrowserWindow)(winOptions, fromWin);
    (0, BrowserExtStore_1.addToWebContentsLink)(win.webContents, fromWin?.webContents);
    let url = (0, LoadUrlHelper_1.getUrl)(args.url);
    win.loadURL(url, loadUrlOptions);
    if (winOptions.maximize) {
        setFullScreen(win, true);
    }
    if (args.data) {
        win.webContents.send("ready", args.data);
        win.webContents.on("did-start-loading", () => {
            if (args.data && !win.isDestroyed() && !win.webContents.canGoBack()) {
                win.webContents.send("ready", args.data);
            }
        });
    }
    if (args.data || needResizable) {
        win.webContents.on("did-finish-load", () => {
            if (!win.isDestroyed()) {
                if (args.data && !win.webContents.canGoBack()) {
                    win.webContents.send("ready", args.data);
                    win.webContents.send("pageLoadFinish", args.data);
                }
                if (needResizable) {
                    win.setResizable(true);
                    if (winOptions.minWidth && winOptions.minHeight) {
                        win.setMinimumSize(winOptions.minWidth, winOptions.minHeight);
                    }
                }
            }
        });
    }
    win.webContents.on("openWindowWithTab", (url) => {
        m_EventEmitObj.emit("_openWindowWithTab", win.webContents, { url });
    });
    if (winOptions.autoWindowSize) {
        let preferredSizeChangeFun = (0, DebounceUtil_1.debounce)((win, width, height) => {
            setWindowSize(win, width, height);
        }, 300);
        win.webContents.on("preferred-size-changed", (event, size) => {
            console.info(`preferred-size-changed:${size.width},${size.height}`);
            if (winOptions.frame !== false) {
                let curWinBounds = win.getBounds();
                let curContentBounds = win.getContentBounds();
                let titelBarHeight = curWinBounds.height - curContentBounds.height;
                size.height += titelBarHeight;
            }
            let winSize = win.getSize();
            if (winSize[1] < size.height || winSize[1] > size.height + 2) {
                preferredSizeChangeFun(win, winSize[0], size.height);
            }
        });
    }
    win.webContents.setWindowOpenHandler((details) => {
        windowOpenHandler(details, win);
        return { action: "deny" };
    });
    win.on("close", (event) => {
        console.log("onClose", winOptions.id);
        if (winOptions.id == WinId_1.default.meetWindowUUID) {
            return;
        }
        win.webContents
            .executeJavaScript(`typeof(window.onbeforeunload)=="function"`)
            .then((value) => {
            if (value) {
                return win.webContents
                    .executeJavaScript(`window.onbeforeunload(new CustomEvent("beforeunload",{cancelable:true}))`)
                    .then((value2) => {
                    win.destroy();
                });
            }
        })
            .catch((e) => {
            console.warn("exec onbeforeunload fail:", e);
        });
    });
    win.on("move", () => {
        win.webContents.send("move-window");
    });
    return win;
}
exports.openNewWindow = openNewWindow;
electron_1.ipcMain.on("_readyPreviewImageWindow", (event, options = {}, data = {}) => {
    readyPreviewImageWindow(event, options, data);
});
function isMacOS() {
    return process.platform === "darwin";
}
function readyPreviewImageWindow(event, options = {}, data = {}) {
    const defaultOptions = {
        width: PREVIEW_IMAGE_DEFAULT_WIDTH,
        height: PREVIEW_IMAGE_DEFAULT_HEIGHT,
        frame: false,
        id: WinId_1.default.imagePreviewUUID,
        show: false,
        minWidth: PREVIEW_IMAGE_MIN_WIDTH,
        minHeight: PREVIEW_IMAGE_MIN_HEIGHT,
    };
    const mergedOptions = { ...defaultOptions, ...options };
    const win = openNewWindow(event, {
        url: "sview:/#/imagePreview",
        options: mergedOptions,
        data,
    });
    if (isMacOS()) {
        win.setWindowButtonVisibility(true);
    }
    win.setFullScreenable(false);
    return win;
}
function limitWindowSize(width, height) {
    if (width > PREVIEW_IMAGE_MAX_WIDTH) {
        width = PREVIEW_IMAGE_MAX_WIDTH;
    }
    else if (width < PREVIEW_IMAGE_MIN_WIDTH) {
        width = PREVIEW_IMAGE_MIN_WIDTH;
    }
    if (height > PREVIEW_IMAGE_MAX_HEIGHT) {
        height = PREVIEW_IMAGE_MAX_HEIGHT;
    }
    else if (height < PREVIEW_IMAGE_MIN_HEIGHT) {
        height = PREVIEW_IMAGE_MIN_HEIGHT;
    }
    return { width, height };
}
function updateWindowSize(win, width, height) {
    const { width: limitedWidth, height: limitedHeight } = limitWindowSize(width, height);
    const EXTRA_HEIGHT = 72;
    try {
        if (process.platform === "win32") {
            win.setContentSize(limitedWidth, limitedHeight + EXTRA_HEIGHT);
        }
        else {
            win.setSize(limitedWidth, limitedHeight);
        }
    }
    catch (error) {
        console.error("_previewImage setSize error:", error);
    }
}
electron_1.ipcMain.on("_previewImage", (event, options = {}, data) => {
    const win = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.imagePreviewUUID);
    const hasSize = options?.width && options?.height;
    let width = options.width;
    let height = options.height;
    if (hasSize) {
        const aspectRatio = width / height;
        if (width > PREVIEW_IMAGE_MAX_WIDTH &&
            height > PREVIEW_IMAGE_MAX_HEIGHT &&
            height / width > 3) {
            width = PREVIEW_IMAGE_MAX_WIDTH;
            height = PREVIEW_IMAGE_MAX_HEIGHT;
        }
        else if (width > PREVIEW_IMAGE_MAX_WIDTH ||
            height > PREVIEW_IMAGE_MAX_HEIGHT) {
            if (width / PREVIEW_IMAGE_MAX_WIDTH > height / PREVIEW_IMAGE_MAX_HEIGHT) {
                width = PREVIEW_IMAGE_MAX_WIDTH;
                height = Math.round(width / aspectRatio);
            }
            else {
                height = PREVIEW_IMAGE_MAX_HEIGHT;
                width = Math.round(height * aspectRatio);
            }
        }
        console.log("_previewImage size:", width, height);
    }
    if (win && !win.isDestroyed()) {
        win.setOpacity(0);
        win.unmaximize();
        if (hasSize) {
            updateWindowSize(win, width, height);
        }
        else {
            updateWindowSize(win, PREVIEW_IMAGE_DEFAULT_WIDTH, PREVIEW_IMAGE_DEFAULT_HEIGHT);
        }
        win.center();
        win.setOpacity(1);
        win.setBackgroundColor("#f2f4f7");
        win.webContents.send("initPreviewImageData", data);
        win.show();
    }
    else {
        if (hasSize) {
            const { width: limitedWidth, height: limitedHeight } = limitWindowSize(width, height);
            readyPreviewImageWindow(event, { show: true, ...options, width: limitedWidth, height: limitedHeight }, data);
        }
        else {
            readyPreviewImageWindow(event, { show: true, ...options }, data);
        }
    }
});
function windowOpenHandler(details, fromWin) {
    console.log("windowOpenHandler:", details.url);
    let options = {};
    let _url = new url_1.URL(details.url);
    let searchParams = _url.searchParams;
    let _id;
    if (searchParams) {
        if (searchParams.get("windowWidth")) {
            options.width = parseInt(searchParams.get("windowWidth"));
        }
        if (searchParams.get("windowHeight")) {
            options.height = parseInt(searchParams.get("windowHeight"));
        }
        if (searchParams.get("minWindowWidth")) {
            options.minWidth = parseInt(searchParams.get("minWindowWidth"));
        }
        if (searchParams.get("minWindowHeight")) {
            options.minHeight = parseInt(searchParams.get("minWindowHeight"));
        }
        if (searchParams.get("canDragWindowSize") != undefined) {
            options.resizable = searchParams.get("canDragWindowSize") !== "false";
        }
        if (searchParams.get("canMaximizeWindow") != undefined) {
            options.maximizable = searchParams.get("canMaximizeWindow") !== "false";
        }
        if (searchParams.get("autoWindowSize") == "true") {
            options.autoWindowSize = true;
        }
        _id = searchParams.get("_winId");
        if (!_id) {
            let url = new url_1.URL(details.url);
            if (url.pathname == "/pc/meet/meeting") {
                _id = WinId_1.default.meetWindowUUID;
            }
        }
        if (_id) {
            if (_id == WinId_1.default.meetWindowUUID) {
                options.frame = false;
            }
            options.id = _id;
        }
    }
    options.webPreferences = {
        nodeIntegration: true,
        preload: (0, LoadUrlHelper_1.getPreloadJs)(_id, details.url),
    };
    if (details.postBody?.data) {
        let postUrlCacheData = new PostUrlCacheHelper_1.PostUrlCache();
        postUrlCacheData.url = details.url;
        if (details.postBody?.contentType) {
            postUrlCacheData.herders = {
                "Content-Type": details.postBody.contentType,
            };
        }
        postUrlCacheData.uploadData = (0, PostUrlCacheHelper_1.getUploadDatasFromPostBody)(details.postBody);
        postUrlCacheData.referrer = details.referrer.url;
        (0, PostUrlCacheHelper_1.pushPostUrlCache)(postUrlCacheData);
    }
    openNewWindow(undefined, {
        url: details.url,
        options,
    }, {
        httpReferrer: details.referrer,
        extraHeaders: details.postBody?.contentType
            ? `Content-Type:${details.postBody.contentType}`
            : undefined,
        postData: details.postBody?.data,
    }, fromWin);
}
UserHelper.onUserLogout((dataKey) => {
    if (!dataKey) {
        return;
    }
    let datas = StoreHelper_1.default.getDefault().get(dataKey);
    if (!datas) {
        return;
    }
    let keys = Object.keys(datas);
    for (let i = keys.length - 1; i >= 0; i--) {
        if (datas[keys[i]].delOnLogout) {
            datas[keys[i]] = undefined;
        }
    }
    UserHelper.setKI4SO(undefined);
    UserHelper.setPanToken(undefined);
    UserHelper.setUser(undefined);
    StoreHelper_1.default.getDefault().set(dataKey, datas);
});
electron_1.ipcMain.on("_openExternal", (event, data) => {
    if (data && data.url) {
        openExternal(data.url);
    }
});
function openExternal(url) {
    if (url) {
        electron_1.shell.openExternal(url);
    }
}
electron_1.ipcMain.handle("_getVersion", (event) => {
    return electron_1.app.getVersion().replace("-", ".");
});
electron_1.ipcMain.handle("_getImInfo", (event) => {
    return ImOut.getToken();
});
electron_1.ipcMain.handle("_getPanToken", (event) => {
    return new Promise((resolve, reject) => {
        let _panToken = UserHelper.getPanToken();
        if (_panToken) {
            resolve(_panToken);
        }
        else {
            PanOut.getToken()
                .then((result) => {
                _panToken = result;
                UserHelper.setPanToken(result);
                resolve(_panToken);
            })
                .catch((error) => {
                reject(error);
            });
        }
    });
});
electron_1.ipcMain.handle("_getUserDataPath", () => {
    return electron_1.app.getPath("userData");
});
electron_1.ipcMain.handle("_getUserLogPath", () => {
    return electron_1.app.getPath("logs");
});
electron_1.ipcMain.handle("_getPathByType", (event, type) => {
    return electron_1.app.getPath(type);
});
electron_1.ipcMain.on("_flashFrame", (event, flag) => {
    if (process.platform == "win32") {
        let win = electron_1.BrowserWindow.fromWebContents(event.sender);
        win.flashFrame(flag);
    }
});
electron_1.ipcMain.handle("_sendToOtherWindow", (event, args) => {
    let pms = new Promise((resolve, reject) => {
        let wContents;
        let win = (0, BrowserHelper_1.getWindowInWindowMap)(args.winId);
        if (win && !win.isDestroyed()) {
            if (win.mainView) {
                win.mainView.webContents.send("_otherWindowMsg", args.key, ...args.args);
            }
            wContents = win.webContents;
        }
        else {
            let view = (0, BrowserHelper_1.getViewInViewMap)(args.winId);
            if (view && (0, BrowserHelper_1.isWebContentsCanUse)(view.webContents)) {
                wContents = view.webContents;
            }
            else {
                resolve(undefined);
                return;
            }
        }
        wContents.send("_otherWindowMsg", { key: args.key, fromWebContentsId: event.sender.id }, ...args.args);
        const emitKey = "_otherWindowMsg_callback" + args.key;
        m_EventEmitObj.removeAllListeners(emitKey);
        m_EventEmitObj.once(emitKey, (data) => {
            resolve(data);
        });
        setTimeout(() => {
            resolve(undefined);
        }, 5000);
    });
    return pms;
});
electron_1.ipcMain.on("_otherWindowMsg_callback", (event, key, value) => {
    m_EventEmitObj.emit("_otherWindowMsg_callback" + key, value);
});
electron_1.ipcMain.handle("_sendToWebContents", (event, args) => {
    let _webContents = electron_1.webContents.fromId(args.webContentsId);
    if (!_webContents ||
        _webContents.isDestroyed() ||
        _webContents.isCrashed()) {
        return -1;
    }
    _webContents.send(args.key, ...args.args);
    return 1;
});
electron_1.ipcMain.on("_showWindow", (event, winId) => {
    showWindow(event, winId);
});
function showWindow(event, winId) {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        win.show();
    }
}
exports.showWindow = showWindow;
electron_1.ipcMain.handle("_focusWebPage", (event) => {
    event.sender.focus();
    return { code: 0, msg: "success" };
});
electron_1.ipcMain.on("_hideWindow", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        win.hide();
    }
});
electron_1.ipcMain.on("_setAlwaysOnTop", (event, isOnTop, winId, level) => {
    console.log(`_setAlwaysOnTop:isTop:${isOnTop},winId:${winId}`);
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        if (isOnTop) {
            win.setAlwaysOnTop(true, level || "pop-up-menu");
        }
        else {
            win.setAlwaysOnTop(false);
        }
    }
});
function setWindowSize(win, width, height) {
    if (win && !win.isDestroyed()) {
        let workArea = electron_1.screen.getDisplayMatching(win.getBounds()).workArea;
        if (width > workArea.width) {
            width = workArea.width;
        }
        if (height > workArea.height) {
            height = workArea.height;
        }
        win.setSize(width, height);
    }
}
electron_1.ipcMain.handle("isMultiscreen", (event) => {
    return electron_1.screen.getAllDisplays().length > 1;
});
function getLocalImagePath(url, suffix) {
    let imgDir = path_1.default.join(electron_1.app.getPath("userData"), "files/image/");
    if (!fs_1.default.existsSync(imgDir)) {
        fs_1.default.mkdirSync(imgDir, { recursive: true });
    }
    suffix = suffix || "jpg";
    let filename = (0, md5_1.default)(url) + "." + suffix;
    return path_1.default.join(imgDir, filename);
}
electron_1.ipcMain.handle("downloadImage", (event, url, suffix) => {
    return new Promise((resolve, reject) => {
        let imagePath = getLocalImagePath(url, suffix);
        if (fs_1.default.existsSync(imagePath)) {
            resolve(imagePath);
        }
        else {
            const request = electron_1.net.request({ url, useSessionCookies: true });
            request.setHeader("Accept-Encoding", "identity");
            request.on("response", (response) => {
                let tempImagePath = imagePath + "_temp";
                if (fs_1.default.existsSync(tempImagePath)) {
                    fs_1.default.rmSync(tempImagePath);
                }
                console.log(`STATUS: ${response.statusCode}`);
                console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
                if (response.statusCode == 200) {
                    response.on("data", (chunk) => {
                        fs_1.default.writeFileSync(tempImagePath, chunk, { flag: "a+" });
                    });
                    response.on("end", () => {
                        console.log("No more data in response.");
                        if (fs_1.default.existsSync(tempImagePath)) {
                            if (fs_1.default.existsSync(imagePath)) {
                                fs_1.default.rmSync(imagePath);
                            }
                            fs_1.default.renameSync(tempImagePath, imagePath);
                            resolve(imagePath);
                        }
                        else {
                            resolve(null);
                        }
                    });
                }
                else {
                    resolve(null);
                }
            });
            request.end();
        }
    });
});
electron_1.ipcMain.handle("_downloadImage", (event, url, suffix) => {
    return new Promise((resolve, reject) => {
        let imagePath = (0, PathUtil_1.getImageCachePath)(url);
        if (fs_1.default.existsSync(imagePath)) {
            resolve(imagePath);
        }
        else {
            const request = electron_1.net.request({ url, useSessionCookies: true });
            request.setHeader("Accept-Encoding", "identity");
            request.on("response", (response) => {
                let tempImagePath = imagePath + "_temp";
                if (fs_1.default.existsSync(tempImagePath)) {
                    fs_1.default.rmSync(tempImagePath);
                }
                console.log(`STATUS: ${response.statusCode}`);
                console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
                if (response.statusCode == 200) {
                    response.on("data", (chunk) => {
                        fs_1.default.writeFileSync(tempImagePath, chunk, { flag: "a+" });
                    });
                    response.on("end", () => {
                        console.log("No more data in response.");
                        setTimeout(() => {
                            if (fs_1.default.existsSync(tempImagePath)) {
                                try {
                                    if (fs_1.default.existsSync(imagePath)) {
                                        fs_1.default.rmSync(imagePath);
                                    }
                                    fs_1.default.renameSync(tempImagePath, imagePath);
                                    resolve(imagePath);
                                }
                                catch (e) {
                                    console.warn("download image file error2:", e);
                                    resolve(null);
                                }
                            }
                            else {
                                resolve(null);
                            }
                        }, 1);
                    });
                }
                else {
                    resolve(null);
                }
            });
            request.end();
        }
    });
});
electron_1.ipcMain.handle("_isAeroGlassEnabled", (event) => {
    return isAeroGlassEnabled();
});
function isAeroGlassEnabled() {
    if (process.platform !== "win32") {
        return true;
    }
    return electron_1.systemPreferences.isAeroGlassEnabled();
}
electron_1.ipcMain.handle("_isWindowOpened", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        return true;
    }
    else {
        return false;
    }
});
electron_1.ipcMain.handle("_isWindowVisible", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && win.isVisible()) {
        return true;
    }
    else {
        return false;
    }
});
electron_1.ipcMain.handle("_isWindowMinimized", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && win.isMinimized()) {
        return true;
    }
    else {
        return false;
    }
});
electron_1.ipcMain.handle("_isWindowFocused", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && win.isFocused()) {
        return true;
    }
    else {
        return false;
    }
});
electron_1.ipcMain.handle("_isWindowFullScreen", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && getCustomCfg(win, "full-screen")) {
        return true;
    }
    else {
        return false;
    }
});
function getCustomCfg(win, key) {
    if (!win.customCfg) {
        win.customCfg = {};
    }
    return win.customCfg.key;
}
electron_1.ipcMain.on("_setParentWindow", (event, childWinId, parentWinId) => {
    let childWin;
    if (childWinId) {
        childWin = (0, BrowserHelper_1.getWindowInWindowMap)(childWinId);
    }
    else {
        childWin = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (childWin && !childWin.isDestroyed()) {
        if (parentWinId) {
            let pWin = (0, BrowserHelper_1.getWindowInWindowMap)(parentWinId);
            if (pWin && !pWin.isDestroyed()) {
                childWin.setParentWindow(pWin);
                return;
            }
        }
        childWin.setParentWindow(null);
        childWin.setAlwaysOnTop(false);
    }
});
electron_1.ipcMain.on("_setIgnoreMouseEvents", (event, ignore, options) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    win.setIgnoreMouseEvents(ignore, options);
});
electron_1.ipcMain.on("_win_destroy", (event) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win) {
        win.destroy();
    }
});
electron_1.ipcMain.handle("_getScreenWorkArea", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    if (!win || win.isDestroyed()) {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win) {
        return electron_1.screen.getDisplayMatching(win.getBounds()).workArea;
    }
    return undefined;
});
electron_1.ipcMain.handle("_getScreenBounds", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    if (!win || win.isDestroyed()) {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win) {
        return electron_1.screen.getDisplayMatching(win.getBounds()).bounds;
    }
    return undefined;
});
electron_1.ipcMain.handle("_getScreenDisplayByWinId", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    if (!win || win.isDestroyed()) {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win) {
        return electron_1.screen.getDisplayMatching(win.getBounds());
    }
    return undefined;
});
electron_1.ipcMain.handle("_getScreenWorkAreaInDesktop", (event) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win) {
        let dis = electron_1.screen.getDisplayMatching(win.getBounds());
        let area = dis.workArea;
        let deskBound = dis.bounds;
        area.x -= deskBound.x;
        area.y -= deskBound.y;
        return area;
    }
    return undefined;
});
electron_1.ipcMain.on("_refreshWindow", (event, winId) => {
    if (winId) {
        let win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
        if (win && !win.isDestroyed()) {
            if (win.mainView) {
                win.mainView.webContents.reloadIgnoringCache();
            }
            else {
                win.webContents.reloadIgnoringCache();
            }
        }
    }
    else {
        event.sender.reloadIgnoringCache();
    }
});
electron_1.ipcMain.handle("_getMousePointInWindow", (event) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win) {
        let point1 = electron_1.screen.getCursorScreenPoint();
        let boundWin = win.getBounds();
        point1.x = point1.x - boundWin.x;
        point1.y = point1.y - boundWin.y;
        return point1;
    }
});
electron_1.ipcMain.handle("_getMousePointInScreen", (event) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win) {
        let point1 = electron_1.screen.getCursorScreenPoint();
        return point1;
    }
});
electron_1.ipcMain.handle("_isMouseInWindow", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    if (!win || win.isDestroyed()) {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win) {
        let point1 = electron_1.screen.getCursorScreenPoint();
        let boundWin = win.getBounds();
        if (point1.x < boundWin.x ||
            point1.x > boundWin.x + boundWin.width ||
            point1.y < boundWin.y ||
            point1.y > boundWin.y + boundWin.height) {
            return false;
        }
        return true;
    }
});
electron_1.ipcMain.on("_onStoreDataChanged", (event, key) => {
    let wContents = event.sender;
    let allContentsOnKey = m_StoreDataLisenters.get(key);
    if (allContentsOnKey == undefined) {
        allContentsOnKey = [];
        m_StoreDataLisenters.set(key, allContentsOnKey);
    }
    for (let wCts of allContentsOnKey) {
        if (wCts == wContents) {
            return;
        }
    }
    allContentsOnKey.push(wContents);
});
electron_1.ipcMain.on("_offStoreDataChanged", (event, key) => {
    let wContents = event.sender;
    let allContentsOnKey = m_StoreDataLisenters.get(key);
    if (allContentsOnKey == undefined || allContentsOnKey.length == 0) {
        return;
    }
    for (let i = 0; i < allContentsOnKey.length; i++) {
        let wCts = allContentsOnKey[i];
        if (wCts == wContents) {
            allContentsOnKey.splice(i, 1);
            return;
        }
    }
});
function storeDataChanged(key, value) {
    m_EventEmitObj.emit(`onStoreDataChanged_${key}`, value);
    let allContentsOnKey = m_StoreDataLisenters.get(key);
    if (allContentsOnKey == undefined || allContentsOnKey.length == 0) {
        return;
    }
    for (let i = allContentsOnKey.length - 1; i >= 0; i--) {
        let wCts = allContentsOnKey[i];
        if (!wCts || wCts.isDestroyed() || wCts.isCrashed()) {
            allContentsOnKey.splice(i, 1);
        }
        else {
            wCts.send(`_onStoreDataChanged_${key}`, value);
        }
    }
}
electron_1.ipcMain.handle("_cacheImageData", (event, data) => {
    if (!data) {
        return;
    }
    let filename = `${new Date().getTime()}_${Math.floor(Math.random() * 100000)}.png`;
    let cachePath = (0, PathUtil_1.getImageCachePath)(filename);
    let image;
    if (typeof data == "string") {
        image = electron_1.nativeImage.createFromDataURL(data);
    }
    else {
        if (data.base64Url) {
            image = electron_1.nativeImage.createFromDataURL(data.base64Url);
            if (image.isEmpty()) {
                const fileContent = base64ToFileContent(data.base64Url);
                fs_1.default.writeFileSync(cachePath, fileContent);
                return cachePath;
            }
        }
        else {
            fs_1.default.writeFileSync(cachePath, Buffer.from(data.arrayBuffer), {
                encoding: "binary",
            });
            return cachePath;
        }
    }
    fs_1.default.writeFileSync(cachePath, image.toPNG());
    return cachePath;
});
function base64ToFileContent(base64String) {
    const mimeString = base64String.split(",")[0].split(":")[1].split(";")[0];
    let base64Data = base64String.split(",")[1];
    if (!mimeString) {
        base64Data = base64String;
    }
    const buffer = Buffer.from(base64Data, "base64");
    return buffer;
}
electron_1.ipcMain.handle("_getCacheImagePath", (event, url) => {
    return (0, PathUtil_1.getImageCachePath)(url);
});
electron_1.ipcMain.handle("_getMessageImageCachePath", (event, url) => {
    return (0, PathUtil_1.getMessageImageCachePath)(url);
});
electron_1.ipcMain.handle("_deleteCacheImage", (event, filePath, url) => {
    if (filePath) {
        let filename = `${new Date().getTime()}}.png`;
        let cachePath = (0, PathUtil_1.getImageCachePath)(filename);
        if (path_1.default.dirname(filePath) == path_1.default.dirname(cachePath)) {
            fs_1.default.unlinkSync(filePath);
            return filePath;
        }
    }
    else {
        let fPath = (0, PathUtil_1.getImageCachePath)(url);
        fs_1.default.unlinkSync(fPath);
        return fPath;
    }
});
electron_1.ipcMain.handle("_isNetOnline", (event) => {
    return electron_1.net.isOnline();
});
electron_1.ipcMain.handle("_getAppPath", (event) => {
    return electron_1.app.getAppPath();
});
electron_1.ipcMain.handle("_isAppPackaged", (event) => {
    return electron_1.app.isPackaged;
});
function on(event, callback) {
    m_EventEmitObj.on(event, callback);
}
exports.on = on;
electron_1.ipcMain.handle("_isUseDarkMode", (event) => {
    return electron_1.nativeTheme.shouldUseDarkColors;
});
electron_1.ipcMain.handle("_getScreenScale", (event) => {
    return electron_1.screen.getPrimaryDisplay().scaleFactor;
});
electron_1.ipcMain.handle("_isFileExists", (event, filePath) => {
    return fs_1.default.existsSync(filePath) && fs_1.default.statSync(filePath).isFile();
});
electron_1.ipcMain.on("_dragFile", (event, filePath) => {
    if (fs_1.default.existsSync(filePath) && fs_1.default.statSync(filePath).isFile()) {
        event.sender.startDrag({
            file: "",
            files: [filePath],
            icon: path_1.default.join(__dirname, "../../icons/logo.png"),
        });
    }
});
electron_1.ipcMain.on("_openPath", (event, filePath) => {
    electron_1.shell.openPath(filePath);
});
electron_1.ipcMain.handle("_checkFileExists", async (event, path) => {
    try {
        await (0, promises_1.stat)(path);
        return true;
    }
    catch (err) {
        if (err.code === "ENOENT") {
            return false;
        }
        else {
            return false;
        }
    }
});
electron_1.ipcMain.handle("_showItemInFolderByPath", (event, filePath) => {
    if (fs_1.default.existsSync(filePath)) {
        electron_1.shell.showItemInFolder(filePath);
        return true;
    }
    else {
        return false;
    }
});
electron_1.ipcMain.handle("_showOpenDialog", (event, options) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    return electron_1.dialog.showOpenDialog(win, options);
});
electron_1.ipcMain.on("_setBadgeCount", (event, count) => {
    if (process.platform == "darwin") {
        electron_1.app.setBadgeCount(count);
    }
});
electron_1.ipcMain.on("_setWindowPosition", (event, x, y, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        win.setPosition(x, y);
    }
});
electron_1.ipcMain.on("_copyImageAt", (event, x, y) => {
    event.sender.copyImageAt(x, y);
});
electron_1.ipcMain.handle("_getScreenDisplay", (event, screenId) => {
    if (screenId != undefined) {
        let displays = electron_1.screen.getAllDisplays();
        for (let display of displays) {
            if (display.id == screenId) {
                return display;
            }
        }
    }
    return electron_1.screen.getPrimaryDisplay();
});
electron_1.ipcMain.handle("_getAllScreenDisplay", (event) => {
    return electron_1.screen.getAllDisplays();
});
electron_1.ipcMain.handle("_isOpenAtOsLogin", (event) => {
    return electron_1.app.getLoginItemSettings().openAtLogin;
});
electron_1.ipcMain.on("_relaunchApp", (event, forceExit) => {
    console.log("relaunch app");
    relaunchApp();
    if (forceExit) {
        electron_1.app.exit();
    }
    else {
        electron_1.app.quit();
    }
});
electron_1.ipcMain.on("_openLocalFolder", () => {
    let cmd;
    if (process.platform == "win32") {
        cmd = "explorer";
    }
    else {
        cmd = "open /";
    }
    child_process_1.default.exec(cmd);
});
electron_1.ipcMain.handle("_capturePage", (event, rect, winId, thumbnailSize) => {
    let webContents = event.sender;
    if (winId) {
        let win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
        if (win && !win.isDestroyed()) {
            webContents = win.webContents;
        }
        else {
            return;
        }
    }
    if (process.platform == "win32" &&
        !electron_1.BrowserWindow.fromWebContents(webContents).isVisible()) {
        return;
    }
    return webContents
        .capturePage(rect)
        .then((img) => {
        if (img) {
            if (thumbnailSize) {
                img = img.resize({
                    width: thumbnailSize.width,
                    height: thumbnailSize.height,
                });
            }
            return img.toDataURL();
        }
    })
        .catch((err) => {
        console.warn("capturePage error:", err);
    });
});
electron_1.ipcMain.handle("_getMediaAccessStatus", (event, mediaType) => {
    return electron_1.systemPreferences.getMediaAccessStatus(mediaType);
});
electron_1.ipcMain.handle("_askForMediaAccess", (event, mediaType) => {
    if (process.platform == "darwin") {
        return electron_1.systemPreferences.askForMediaAccess(mediaType);
    }
});
function beforeWindowCreate(id, callback) {
    m_EventEmitObj.on(`before_window_create_${id}`, callback);
}
exports.beforeWindowCreate = beforeWindowCreate;
function onStoreDataChanged(key, callback) {
    m_EventEmitObj.on(`onStoreDataChanged_${key}`, callback);
}
exports.onStoreDataChanged = onStoreDataChanged;
electron_1.ipcMain.handle("_convertImageToBase64", (event, filePath) => {
    return (0, image_1.convertImageToBase64)(filePath);
});
function shakeMainWindow(options) {
    const { type, shakeDuration = 40, offsets = DEFAULT_WINDOW_SHAKE_OFFSETS, uid, } = options ?? {};
    if (isAllowShakeWithTime(type, uid) === false) {
        return {
            success: false,
            message: "抖动间隔时间未到",
            code: 1,
        };
    }
    const window = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
    if (!window || window.isDestroyed()) {
        return {
            success: false,
            message: "主窗口不存在",
            code: 2,
        };
    }
    const now = new Date().getTime();
    if (type === "send") {
        sendShakeWindowTimeMap.set(uid, now);
    }
    if (type === "receive") {
        receiveShakeWindowTimeMap.set(uid, now);
    }
    const originalX = window.getPosition()[0];
    const originalY = window.getPosition()[1];
    let currentShake = 0;
    const shakeInterval = setInterval(() => {
        if (currentShake < offsets.length) {
            const [xOffset, yOffset] = offsets[currentShake];
            window.setPosition(originalX + xOffset, originalY + yOffset);
            currentShake++;
        }
        else {
            clearInterval(shakeInterval);
            window.setPosition(originalX, originalY);
        }
    }, shakeDuration);
    return {
        success: true,
        message: "抖动成功",
        code: 0,
    };
}
function isAllowShakeWithTime(type, uid) {
    const now = new Date().getTime();
    if (type === "send") {
        let lastSendWindowShakeTime = sendShakeWindowTimeMap.get(uid);
        if (lastSendWindowShakeTime === undefined) {
            return true;
        }
        else {
            return now - lastSendWindowShakeTime > SHAKE_WINDOW_INTERVAL;
        }
    }
    if (type === "receive") {
        let lastReceiveWindowShakeTime = receiveShakeWindowTimeMap.get(uid);
        if (lastReceiveWindowShakeTime === undefined) {
            return true;
        }
        else {
            return now - lastReceiveWindowShakeTime > SHAKE_WINDOW_INTERVAL;
        }
    }
}
electron_1.ipcMain.handle("_shakeMainWindow", (event, options) => {
    return shakeMainWindow(options);
});
onStoreDataChanged("SSOResponse", () => {
    sendShakeWindowTimeMap.clear();
    receiveShakeWindowTimeMap.clear();
});
electron_1.ipcMain.handle("_netRequest", (event, params) => {
    return (0, NetRequestUtil_1.netRequest)(params);
});
function relaunchApp() {
    setSysStore("relaunchAppTime", Date.now());
    electron_1.app.relaunch();
}
exports.relaunchApp = relaunchApp;
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
    electron_2.clipboard.write({ html, text, image });
}
electron_1.ipcMain.on("_setClipboardByMainProcess", (event, html, text, imageData) => {
    setClipboard(html, text, imageData);
});
function getClipboard() {
    const html = electron_2.clipboard.readHTML();
    const text = electron_2.clipboard.readText();
    const image = electron_2.clipboard.readImage();
    let imageData = undefined;
    if (image && !image.isEmpty()) {
        imageData = image.toDataURL();
    }
    return { html, text, image: imageData };
}
electron_1.ipcMain.handle("_getClipboardByMainProcess", (_event) => {
    return getClipboard();
});
electron_1.ipcMain.handle("_getWindowHandleId", (event, winId) => {
    let win;
    if (win) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (!win) {
        return;
    }
    return (0, BrowserHelper_1.getWindowHandleId)(win);
});
electron_1.ipcMain.handle("_genOnlineFileWsToken", async (_event, text) => {
    const token = await handleDataGenSign("DES", true, text, ONLINE_FILE_WS_TOKEN_ENCRYPT_KEY);
    return token.toUpperCase();
});
electron_1.ipcMain.handle("_getWinId", (event) => {
    return event.sender._id;
});
electron_1.ipcMain.handle("_isWindowMaximized", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win) {
        return win.isMaximized();
    }
    return false;
});
electron_1.ipcMain.on("_setWindowExtStore", (event, winId, key, value) => {
    if (!winId) {
        (0, BrowserExtStore_1.setWindowExtStore)(event.sender, key, value);
    }
    else {
        (0, BrowserExtStore_1.setWindowExtStore)(winId, key, value);
    }
});
electron_1.ipcMain.handle("_getWindowExtStore", (event, winId, key) => {
    if (!winId) {
        return (0, BrowserExtStore_1.getWindowExtStore)(event.sender, key);
    }
    else {
        return (0, BrowserExtStore_1.getWindowExtStore)(winId, key);
    }
});
electron_1.ipcMain.handle("_getWindowExtStoreOnLink", (event, winId, key) => {
    if (!winId) {
        return (0, BrowserExtStore_1.getWindowExtStoreOnLink)(event.sender, key);
    }
    else {
        return (0, BrowserExtStore_1.getWindowExtStoreOnLink)(winId, key);
    }
});
electron_1.ipcMain.handle("_getAllWindowExtStoreOnLink", (event, winId, key) => {
    if (!winId) {
        return (0, BrowserExtStore_1.getAllWindowExtStoreOnLink)(event.sender, key);
    }
    else {
        return (0, BrowserExtStore_1.getAllWindowExtStoreOnLink)(winId, key);
    }
});
//# sourceMappingURL=MainHelper.js.map