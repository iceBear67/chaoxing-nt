"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWebContents = exports.closeWindow = exports.isWindowOpened = exports.isWebContentsCanUse = exports.getWindowByHandleId = exports.getWindowHandleId = exports.reloadView = exports.onPreCloseCurTab = exports.onAnyWindowCreate = exports.onWindowCreate = exports.onBeforeWindowCreate = exports.delWindowInWindowMap = exports.putWindowInWindowMap = exports.getViewInViewMap = exports.getWindowInWindowMap = exports.getWebIdByProcessId = exports.getBrowserViewByWebContentsId = exports.createBrowserView = exports.createBrowserWindow = exports.getWindowExtInfoByWin = exports.CxBrowserWindow = exports.WindowExtInfo = void 0;
const electron_1 = require("electron");
const WinId_1 = __importDefault(require("../common/WinId"));
const Logger_1 = __importDefault(require("./Logger"));
let m_PowerSaveBlockerId = -1;
const path_1 = __importDefault(require("path"));
const events_1 = require("events");
const DevHelper_1 = require("./DevHelper");
const ShortcutHelper_1 = require("./ShortcutHelper");
const UrlUtils_1 = require("../utils/UrlUtils");
const CommonUtil_1 = require("../utils/CommonUtil");
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const cx_electron_versioning_1 = require("cx_electron_versioning");
const TempStore_1 = require("../common/TempStore");
const EventUtil_1 = require("../utils/EventUtil");
const BaseEvent_1 = require("../common/BaseEvent");
let m_WinMap = new Map();
let m_ViewMap = new Map();
let m_WctsBrowserViewMap = new Map();
const configData = require("../config/appconfig");
let m_EeventEmitter = new events_1.EventEmitter();
const m_PIdMap = new Map();
class WindowExtInfo {
    constructor() {
        this.ketangFlag = false;
        this.offlineKetang = false;
    }
}
exports.WindowExtInfo = WindowExtInfo;
class CxBrowserWindow extends electron_1.BrowserWindow {
}
exports.CxBrowserWindow = CxBrowserWindow;
function getWindowExtInfoByWin(win) {
    return win?.extParams;
}
exports.getWindowExtInfoByWin = getWindowExtInfoByWin;
function createBrowserWindow(options, fromWin) {
    options.webPreferences = options.webPreferences || {};
    if (options.id) {
        let win1 = getWindowInWindowMap(options.id);
        if (win1 && !win1.isDestroyed()) {
            win1.show();
            return win1;
        }
    }
    let cEvent = new BaseEvent_1.BaseEvent();
    m_EeventEmitter.emit(`win_before_create_${options.id}`, cEvent, options, fromWin);
    if (cEvent.defaultPrevented) {
        return null;
    }
    if (!options.extParams) {
        options.extParams = new WindowExtInfo();
    }
    if (options.extParams?.ketangFlag == undefined && fromWin) {
        let winExtInfo = getWindowExtInfoByWin(fromWin);
        if (winExtInfo?.ketangFlag) {
            options.extParams.ketangFlag = true;
        }
    }
    if (options.extParams?.ketangFlag == undefined && options.parent) {
        let winExtInfo = getWindowExtInfoByWin(options.parent);
        if (winExtInfo?.ketangFlag) {
            options.extParams.ketangFlag = true;
        }
    }
    let workArea = electron_1.screen.getPrimaryDisplay().workArea;
    options.enableLargerThanScreen = true;
    options.width = options.width || 800;
    options.height = options.height || 600;
    if (options.width > workArea.width) {
        options.width = workArea.width;
    }
    if (options.height > workArea.height) {
        options.height = workArea.height;
    }
    options.minWidth = options.minWidth || 1;
    options.minHeight = options.minHeight || 1;
    if (options.minWidth > workArea.width) {
        options.minWidth = workArea.width;
    }
    if (options.minHeight > workArea.height) {
        options.minHeight = workArea.height;
    }
    options.width = Math.floor(options.width);
    options.height = Math.floor(options.height);
    options.minWidth = Math.floor(options.minWidth);
    options.minHeight = Math.floor(options.minHeight);
    if (!options.webPreferences.defaultFontFamily) {
        options.webPreferences.defaultFontFamily = { standard: "PingFang SC" };
    }
    let win;
    let needSimpleFullscreen = false;
    if (process.platform == "darwin") {
        if (options.parent &&
            (options.parent.isFullScreen() ||
                options.parent.isSimpleFullScreen() ||
                getCustomCfg(options.parent, "full-screen"))) {
            if (options.simpleFullscreen) {
                needSimpleFullscreen = true;
            }
            options.fullscreen = false;
            options.fullscreenable = false;
            options.simpleFullscreen = false;
        }
    }
    let showWin = options.show !== false;
    options.show = false;
    if (process.platform == "win32") {
        let iconPath = path_1.default.join(__dirname, "../../icons/logo.ico");
        let iconImage = electron_1.nativeImage.createFromPath(iconPath);
        options.icon = iconImage;
    }
    options.webPreferences.nodeIntegration = true;
    options.webPreferences.nodeIntegrationInWorker = true;
    options.webPreferences.contextIsolation = true;
    if (process.platform == "darwin") {
        if (options.fullscreen == true) {
            options.simpleFullscreen = true;
        }
    }
    if (!options.title) {
        options.title = configData.appName;
    }
    if (options.id == WinId_1.default.meetWindowUUID) {
        options.webPreferences.backgroundThrottling = false;
        options.extParams.ketangFlag = true;
    }
    if (options.x == undefined && options.y == undefined) {
        let screenDisplay;
        if (options.parent && !options.parent.isDestroyed()) {
            screenDisplay = electron_1.screen.getDisplayMatching(options.parent.getBounds());
        }
        else if (fromWin && !fromWin.isDestroyed()) {
            screenDisplay = electron_1.screen.getDisplayMatching(fromWin.getBounds());
        }
        if (screenDisplay) {
            const screenBounds = screenDisplay.workArea;
            options.x = Math.floor(screenBounds.x + (screenBounds.width - options.width) / 2);
            options.y = Math.floor(screenBounds.y + (screenBounds.height - options.height) / 2);
        }
    }
    if (options.transparent && options.frame && process.platform == "darwin") {
        options.transparent = undefined;
    }
    let meetWindow = getWindowInWindowMap(WinId_1.default.meetWindowUUID);
    if (meetWindow && !meetWindow.isDestroyed()) {
        console.debug("meetWindow isFullScreen:", meetWindow.isFullScreen(), "meetWindow.isDestroyed:", meetWindow.isDestroyed(), "meetWindow.isVisible:", meetWindow.isVisible(), "meetWindow.isMaximized:", meetWindow.isMaximized());
        console.debug("meetWindow isFocuse:", meetWindow.isFocused());
    }
    win = new electron_1.BrowserWindow(options);
    win._id = options.id;
    win.webContents._id = options.id;
    win._simpleFullscreen = options.simpleFullscreen;
    win.extInfo = options.extParams;
    win.extParams = options.extParams;
    if (needSimpleFullscreen) {
        setTimeout(() => {
            if (!win.isDestroyed() && !win.isSimpleFullScreen()) {
                win.setSimpleFullScreen(true);
            }
        }, 20);
    }
    if (process.platform == "win32" && (0, CommonUtil_1.hasDifferentScaleScreen)()) {
        setTimeout(() => {
            if (!win.isDestroyed()) {
                win.setSize(options.width, options.height);
            }
        }, 10);
    }
    win.webContents.on("dom-ready", (e) => {
        if (showWin) {
            win.show();
        }
    });
    win.webContents.browserOptions = options;
    win.on("close", (event) => {
        console.log("窗口准备关闭 close：", options.id);
    });
    win.on("closed", (event) => {
        setTimeout(() => {
            if (process.platform == "win32" &&
                options.parent &&
                !options.parent.isDestroyed()) {
                options.parent.focus();
            }
            let mainWindow = getWindowInWindowMap(WinId_1.default.MainWindow);
            if (mainWindow && options?.id == "id_PersonInfoWindow") {
                mainWindow.flashFrame(false);
            }
        }, 1);
        console.log("窗口已关闭 closed：", options.id);
        if (options.id) {
            delWindowInWindowMap(options.id);
        }
    });
    win.on("maximize", () => {
        win.webContents.send("maximize");
    });
    win.on("unmaximize", () => {
        win.webContents.send("unmaximize");
    });
    win.on("enter-full-screen", () => {
        setCustomCfg(win, "full-screen", true);
        if (process.platform == "darwin") {
            if (win.isFullScreen()) {
                win.webContents.send("maximize");
            }
            else {
                win.webContents.send("unmaximize");
            }
        }
        win.webContents.send("enter-full-screen");
    });
    win.on("leave-full-screen", (event) => {
        setCustomCfg(win, "full-screen", false);
        win.webContents.send("window_show_header", true);
        win.webContents.send("leave-full-screen");
    });
    if (options.maxWin) {
        win.maximize();
    }
    addWebContentsLisenter(win.webContents, win, undefined, options.id);
    if (process.platform == "darwin" && options.parent) {
        if (options.parent.isAlwaysOnTop()) {
            win.setAlwaysOnTop(true, "pop-up-menu");
        }
        if (options.parent.isVisibleOnAllWorkspaces()) {
            win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        }
    }
    if (options.id) {
        putWindowInWindowMap(options.id, win);
        m_EeventEmitter.emit(`win_create_${options.id}`, win);
    }
    m_EeventEmitter.emit("_windowCreate", win, options);
    (0, ShortcutHelper_1.registerAccelerator)(win, { CommandOrControl: true, key: "w" }, () => {
        m_EeventEmitter.emit("_closeCurSubTab", win);
    });
    initWindowStateChanged(options.id, win);
    return win;
}
exports.createBrowserWindow = createBrowserWindow;
function setTempStore(key, value) {
    EventUtil_1.EventUtil.emit("_setTempStore", key, value);
}
function initWindowStateChanged(winId, win) {
    if (!winId || !win) {
        return;
    }
    const tempKey = `WindowStateChanged_${winId}`;
    setTempStore(tempKey, "open");
    win.on("maximize", () => {
        setTempStore(tempKey, "maximize");
    });
    win.on("unmaximize", () => {
        setTempStore(tempKey, "unmaximize");
    });
    win.on("minimize", () => {
        setTempStore(tempKey, "minimize");
    });
    win.on("restore", () => {
        setTempStore(tempKey, "restore");
    });
    win.on("closed", () => {
        setTempStore(tempKey, "closed");
    });
    win.on("hide", () => {
        setTempStore(tempKey, "hide");
    });
    win.on("show", () => {
        setTempStore(tempKey, "show");
    });
    win.on("resized", () => {
        setTempStore(tempKey, "resized");
    });
    win.on("move", () => {
        setTempStore(tempKey, "move");
    });
    win.on("enter-full-screen", () => {
        setTempStore(tempKey, "enter-full-screen");
    });
    win.on("leave-full-screen", () => {
        setTempStore(tempKey, "leave-full-screen");
    });
    win.on("blur", () => {
        setTempStore(tempKey, "blur");
    });
    win.on("focus", () => {
        setTempStore(tempKey, "focus");
    });
}
function setCustomCfg(win, key, value) {
    if (!win.customCfg) {
        win.customCfg = {};
    }
    win.customCfg.key = value;
}
function getCustomCfg(win, key) {
    if (!win.customCfg) {
        win.customCfg = {};
    }
    return win.customCfg.key;
}
function createBrowserView(options) {
    options.webPreferences = options.webPreferences || {};
    options.show = true;
    options.parent = undefined;
    if (options.webPreferences.nodeIntegration == undefined &&
        options.webPreferences.preload) {
        options.webPreferences.nodeIntegration = true;
    }
    options.webPreferences.contextIsolation = true;
    if (!options.webPreferences.defaultFontFamily) {
        options.webPreferences.defaultFontFamily = { standard: "PingFang SC" };
    }
    let bv = cx_electron_versioning_1.ElectronVersioningMainMethod.createWebContestsView(options);
    bv.webContents._id = options.id;
    bv.webContents.browserOptions = options;
    createLoadingView(bv);
    addWebContentsLisenter(bv.webContents, undefined, bv, options.id, options.disableLoadingPage);
    if (options.transparent) {
        bv.setBackgroundColor("#00ffffff");
    }
    else {
        bv.setBackgroundColor("#ffffff");
    }
    m_WctsBrowserViewMap.set(bv.webContents.id, bv);
    if (options.id) {
        m_ViewMap.set(options.id, bv);
        bv.webContents.on("destroyed", () => {
            m_ViewMap.delete(options.id);
        });
        bv.webContents.on("render-process-gone", () => {
            m_ViewMap.delete(options.id);
        });
    }
    return bv;
}
exports.createBrowserView = createBrowserView;
function getBrowserViewByWebContentsId(webContentsId) {
    return m_WctsBrowserViewMap.get(webContentsId);
}
exports.getBrowserViewByWebContentsId = getBrowserViewByWebContentsId;
function loadURLFail(event, errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId) {
    console.error(`加载网页失败：错误码：${errorCode},url:${validatedURL},errorDescription:${errorDescription}`);
}
function changeWindowSizeByUrl(win, url) {
    if (!win || win.isDestroyed()) {
        return;
    }
    let viewWindowWidth = (0, UrlUtils_1.getUrlParamValue)(url, "windowWidth");
    let viewWindowHeight = (0, UrlUtils_1.getUrlParamValue)(url, "windowHeight");
    if (viewWindowWidth && viewWindowHeight) {
        let curWinSize = win.getSize();
        let viewWindowWidthNum = parseInt(viewWindowWidth);
        let viewWindowHeightNum = parseInt(viewWindowHeight);
        if (viewWindowWidthNum != curWinSize[0] ||
            viewWindowHeightNum != curWinSize[1]) {
            win.setSize(viewWindowWidthNum, viewWindowHeightNum);
            win.center();
        }
    }
}
function rewriteLoadUrl(webContents) {
    webContents.cLoadUrl = webContents.loadURL;
    webContents.loadURL = async (url, options) => {
        if (!url) {
            return;
        }
        if (url.startsWith("http") &&
            !url.startsWith("http://localhost") &&
            !options?.postData) {
            return new Promise((resolve, reject) => {
                webContents.once("did-finish-load", () => {
                    webContents.executeJavaScript(`document.title='${url}';window.location.replace('${url}');`);
                    resolve();
                });
                let loadingUrl = (0, LoadUrlHelper_1.getUrl)("hview://loading_main.html");
                webContents.cLoadUrl(loadingUrl, options);
            });
        }
        else {
            return webContents.cLoadUrl(url, options);
        }
    };
}
function createLoadingView(webContentsView) {
    let _win;
    let isLoaddingFinish = false;
    let viewUrl;
    let loaddingViewRemoved = false;
    let loaddingView = cx_electron_versioning_1.ElectronVersioningMainMethod.createWebContestsView({});
    let _loadURL = webContentsView.webContents.loadURL;
    webContentsView.webContents.loadURL = async function (url, options) {
        viewUrl = url;
        _loadURL.call(webContentsView.webContents, url, options);
        if (!url.startsWith("http") || url.startsWith("http://localhost")) {
            if (_win) {
                loaddingView.removeFromBrowserWindow(_win);
                _win = undefined;
            }
        }
    };
    let _addToBrowserWindow = webContentsView.addToBrowserWindow;
    webContentsView.addToBrowserWindow = function (win) {
        _addToBrowserWindow.call(webContentsView, win);
        if (isLoaddingFinish || loaddingViewRemoved) {
            return;
        }
        let url = webContentsView.webContents.getURL() || viewUrl;
        if (url &&
            (!url.startsWith("http") || url.startsWith("http://localhost"))) {
            return;
        }
        _win = win;
        loaddingView.addToBrowserWindow(win);
    };
    let _setBounds = webContentsView.setBounds;
    webContentsView.setBounds = function (bounds) {
        _setBounds.call(webContentsView, bounds);
        if (_win) {
            loaddingView.setBounds(bounds);
        }
    };
    const removeLoaddingView = function () {
        if (loaddingViewRemoved) {
            return;
        }
        if (_win) {
            loaddingView.removeFromBrowserWindow(_win);
        }
        loaddingView.webContents.close();
        if (loaddingView.webContents.getOSProcessId()) {
            process.kill(loaddingView.webContents.getOSProcessId());
        }
        loaddingViewRemoved = true;
    };
    let _removeFromBrowserWindow = webContentsView.removeFromBrowserWindow;
    webContentsView.removeFromBrowserWindow = function (win) {
        _removeFromBrowserWindow.call(webContentsView, win);
        removeLoaddingView();
    };
    loaddingView.webContents.loadURL((0, LoadUrlHelper_1.getUrl)("hview://loading_main.html"));
    webContentsView.webContents.on("did-stop-loading", () => {
        isLoaddingFinish = true;
        removeLoaddingView();
    });
}
function addWebContentsLisenter(wContents, win, bv, winid, disableLoadingPage = false) {
    wContents.on("did-fail-load", (e, errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId) => {
        loadURLFail(e, errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId);
    });
    wContents.on("console-message", (event, level, message, line, sourceId) => {
        let loggerKey = winid;
        if (message && message.startsWith("[WebImSDK]")) {
            loggerKey = "easemob_websdk";
        }
        let rendererLog = Logger_1.default.getLogger(loggerKey);
        if (level > 0) {
            let text = `[窗口：${winid}][${sourceId}][line:${line}] ${message}`;
            if (level == 1) {
                rendererLog.info(text);
            }
            else if (level == 2) {
                rendererLog.warn(text);
            }
            else if (level == 3) {
                rendererLog.error(text);
            }
        }
        else if ((0, DevHelper_1.getDevConfig)().debugLog) {
            let text = `[窗口：${winid}][${sourceId}][line:${line}] ${message}`;
            rendererLog.debug(text);
        }
    });
    wContents.on("unresponsive", () => {
        console.warn("页面无响应：unresponsive：", wContents.getURL());
    });
    wContents.on("responsive", () => {
        console.warn("页面恢复响应：unresponsive：", wContents.getURL());
    });
    let pageNavigate = false;
    wContents.on("will-redirect", (event, url) => {
        console.log("页面重定向,will-redirect:", url);
        changeWindowSizeByUrl(win, url);
    });
    wContents.on("did-start-loading", () => {
        console.log("页面开始加载，did-start-loading:");
    });
    wContents.on("did-stop-loading", () => {
        console.log("页面加载停止，did-stop-load:url:", wContents.getURL());
    });
    wContents.on("did-finish-load", () => {
        console.log("页面加载完成，did-finish-load:url:", wContents.getURL());
        if (pageNavigate) {
            changeWindowSizeByUrl(win, wContents.getURL());
            pageNavigate = false;
        }
    });
    wContents.on("will-navigate", (event, url) => {
        console.log("页面即将导航,will-navigate:", url);
        pageNavigate = true;
    });
    wContents.on("context-menu", (event, parms) => {
        let cMenu = createContxtMenu(wContents, parms);
        if (cMenu.items.length > 0) {
            let x = parms.x;
            let y = parms.y;
            if (bv) {
                let tempBounds = bv.getBounds();
                x += tempBounds.x;
                y += tempBounds.y;
            }
            cMenu.popup({
                x,
                y,
            });
        }
    });
    // wContents.on("devtools-opened", () => {
    //     if (!(0, DevHelper_1.isDevMode)()) {
    //         wContents.closeDevTools();
    //     }
    // });
    wContents.on("did-stop-loading", () => {
        m_PIdMap.set(wContents.getOSProcessId(), winid);
    });
    wContents.on("before-input-event", (event, input) => {
        if (input.type != "keyDown") {
            return;
        }
        if (input.key == "Shift" ||
            input.key == "Control" ||
            input.key == "Alt" ||
            input.key == "Meta") {
            return;
        }
        if (!input.control && !input.alt && !input.shift && !input.meta) {
            return;
        }
        let bWin = electron_1.BrowserWindow.fromWebContents(wContents);
        (0, ShortcutHelper_1.handleAcceleratorEvent)(bWin, input);
        let openDevToolsShortcut = false;
        if (process.platform == "darwin") {
            if (input.meta && input.shift && input.key?.toLowerCase() == "i") {
                openDevToolsShortcut = true;
            }
        }
        else {
            if (input.control && input.shift && input.key?.toLowerCase() == "i") {
                openDevToolsShortcut = true;
            }
        }
        if (openDevToolsShortcut) {
            wContents.openDevTools();
        }
    });
}
function getWebIdByProcessId(processId) {
    return m_PIdMap.get(processId);
}
exports.getWebIdByProcessId = getWebIdByProcessId;
function createContxtMenu(wContents, parms) {
    let cMenu = new electron_1.Menu();
    if (parms.linkURL && !parms.selectionText) {
        cMenu.append(new electron_1.MenuItem({
            label: "在新标签页中打开链接",
            click: () => {
                wContents.emit("openWindowWithTab", parms.linkURL);
            },
        }));
        cMenu.append(new electron_1.MenuItem({
            label: "复制链接地址",
            click: () => {
                electron_1.clipboard.writeText(parms.linkURL);
            },
        }));
        return cMenu;
    }
    if (parms.mediaType == "image" && parms.srcURL) {
        cMenu.append(new electron_1.MenuItem({
            label: "新标签页中打开图片",
            click: () => {
                wContents.emit("openWindowWithTab", parms.srcURL);
            },
        }));
        cMenu.append(new electron_1.MenuItem({
            label: "保存图片",
            click: () => {
                wContents.downloadURL(parms.srcURL);
            },
        }));
        cMenu.append(new electron_1.MenuItem({
            label: "复制图片",
            click: () => {
                wContents.copyImageAt(parms.x, parms.y);
            },
        }));
        cMenu.append(new electron_1.MenuItem({
            label: "复制图片地址",
            click: () => {
                electron_1.clipboard.writeText(parms.srcURL);
            },
        }));
        if (parms.selectionText) {
            if (parms.editFlags.canCopy) {
                cMenu.append(new electron_1.MenuItem({
                    label: "复制",
                    role: "copy",
                }));
            }
        }
        if (parms.editFlags.canSelectAll) {
            cMenu.append(new electron_1.MenuItem({
                label: "全选",
                role: "selectAll",
            }));
        }
        return cMenu;
    }
    if (!parms.selectionText && parms.mediaType == "none" && !parms.isEditable) {
        cMenu.append(new electron_1.MenuItem({
            label: "后退",
            enabled: wContents.canGoBack(),
            click: () => {
                wContents.goBack();
            },
        }));
        cMenu.append(new electron_1.MenuItem({
            label: "前进",
            enabled: wContents.canGoForward(),
            click: () => {
                wContents.goForward();
            },
        }));
        cMenu.append(new electron_1.MenuItem({
            label: "重新加载",
            click: () => {
                reloadView(wContents);
                setTimeout(() => {
                    if (!wContents.isDestroyed() && !wContents.isCrashed()) {
                        wContents.send("contentMenuItemClick", "reload");
                    }
                }, 1500);
            },
        }));
        cMenu.append(new electron_1.MenuItem({
            label: "打印",
            click: () => {
                wContents.print();
            },
        }));
        return cMenu;
    }
    if (parms.editFlags.canCopy) {
        cMenu.append(new electron_1.MenuItem({
            label: "复制",
            role: "copy",
        }));
    }
    if (parms.editFlags.canCut) {
        cMenu.append(new electron_1.MenuItem({
            label: "剪切",
            role: "cut",
        }));
    }
    if (parms.editFlags.canPaste) {
        cMenu.append(new electron_1.MenuItem({
            label: "粘贴",
            role: "paste",
        }));
        cMenu.append(new electron_1.MenuItem({
            label: "粘贴为纯文本",
            role: "pasteAndMatchStyle",
        }));
    }
    if (parms.editFlags.canSelectAll) {
        cMenu.append(new electron_1.MenuItem({
            label: "全选",
            role: "selectAll",
        }));
    }
    if (parms.editFlags.canDelete) {
        cMenu.append(new electron_1.MenuItem({
            type: "separator",
        }));
        cMenu.append(new electron_1.MenuItem({
            label: "删除",
            role: "delete",
        }));
    }
    if (parms.selectionText && parms.selectionText.trim() && !parms.isEditable) {
        cMenu.append(new electron_1.MenuItem({
            label: "搜一搜",
            click: () => {
                EventUtil_1.EventUtil.emit("searchOnNewPage", wContents, parms.selectionText.trim());
            },
        }));
    }
    return cMenu;
}
function getWindowInWindowMap(key) {
    return m_WinMap.get(key);
}
exports.getWindowInWindowMap = getWindowInWindowMap;
function getViewInViewMap(key) {
    return m_ViewMap.get(key);
}
exports.getViewInViewMap = getViewInViewMap;
function putWindowInWindowMap(key, window) {
    m_WinMap.set(key, window);
    if (key == WinId_1.default.meetWindowUUID) {
        m_PowerSaveBlockerId = electron_1.powerSaveBlocker.start("prevent-display-sleep");
    }
}
exports.putWindowInWindowMap = putWindowInWindowMap;
function delWindowInWindowMap(key) {
    m_WinMap.delete(key);
    if (key == WinId_1.default.meetWindowUUID && m_PowerSaveBlockerId > -1) {
        electron_1.powerSaveBlocker.stop(m_PowerSaveBlockerId);
        m_PowerSaveBlockerId = -1;
    }
}
exports.delWindowInWindowMap = delWindowInWindowMap;
function onBeforeWindowCreate(id, callback) {
    m_EeventEmitter.on(`win_before_create_${id}`, callback);
}
exports.onBeforeWindowCreate = onBeforeWindowCreate;
function onWindowCreate(id, callback) {
    m_EeventEmitter.on(`win_create_${id}`, callback);
}
exports.onWindowCreate = onWindowCreate;
function onAnyWindowCreate(callback) {
    m_EeventEmitter.on(`_windowCreate`, callback);
}
exports.onAnyWindowCreate = onAnyWindowCreate;
function onPreCloseCurTab(callback) {
    m_EeventEmitter.on("_closeCurSubTab", callback);
}
exports.onPreCloseCurTab = onPreCloseCurTab;
function reloadView(wContents) {
    if (!wContents.getURL()) {
        return;
    }
    let _url = new URL(wContents.getURL());
    if (_url.protocol == "file:" &&
        _url.pathname.endsWith("html/blankPage.html") &&
        wContents.canGoBack()) {
        wContents.goBack();
    }
    else {
        wContents.reloadIgnoringCache();
    }
}
exports.reloadView = reloadView;
function getWindowHandleId(winInfo) {
    let win;
    if (typeof winInfo == "string") {
        win = getWindowInWindowMap(winInfo);
    }
    else {
        win = winInfo;
    }
    if (win) {
        if (process.platform == "win32") {
            return win.getNativeWindowHandle().readUInt32LE(0);
        }
        else {
            let sourceId = win.getMediaSourceId();
            return parseInt(sourceId.split(":")[1]);
        }
    }
    return 0;
}
exports.getWindowHandleId = getWindowHandleId;
function getWindowByHandleId(winHandleId) {
    let allWindows = electron_1.BrowserWindow.getAllWindows();
    let winHandleIdStr = winHandleId + "";
    for (let win of allWindows) {
        let sourceId = win.getMediaSourceId();
        if (sourceId.split(":")[1] == winHandleIdStr) {
            return win;
        }
    }
}
exports.getWindowByHandleId = getWindowByHandleId;
function isWebContentsCanUse(webContents) {
    return webContents && !webContents.isDestroyed() && !webContents.isCrashed();
}
exports.isWebContentsCanUse = isWebContentsCanUse;
function isWindowOpened(winId) {
    let win = getWindowInWindowMap(winId);
    return win && !win.isDestroyed();
}
exports.isWindowOpened = isWindowOpened;
function closeWindow(winId) {
    let win = getWindowInWindowMap(winId);
    if (win && !win.isDestroyed()) {
        win.close();
    }
}
exports.closeWindow = closeWindow;
function isWebContents(obj) {
    return (obj &&
        typeof obj === "object" &&
        "send" in obj &&
        "loadURL" in obj &&
        "getURL" in obj);
}
exports.isWebContents = isWebContents;
//# sourceMappingURL=BrowserHelper.js.map