"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hideCommonMainWindowPop = exports.showCommonMainWindowPop = exports.showTabCountMaxPop = exports.topMainWindowPops = void 0;
const electron_1 = require("electron");
const BrowserHelper_1 = require("./BrowserHelper");
const WinId_1 = __importDefault(require("../common/WinId"));
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const POP_VERTICAL_SPACING = 10;
const POP_START_Y = 54;
let m_MainWindowPops = [];
let m_MainWindow;
class MainWindowPop {
    constructor(id, bv, width, height) {
        this.id = id;
        this.browserView = bv;
        this.width = width;
        this.height = height;
        this.browserView.webContents.on("destroyed", () => {
            hideWinPop(id);
        });
    }
}
function getWinPop(id) {
    for (let winPop of m_MainWindowPops) {
        if (id == winPop.id) {
            return winPop;
        }
    }
}
function refreshPopsRect() {
    let y = POP_START_Y;
    let winBounds = m_MainWindow.getBounds();
    for (let winPop of m_MainWindowPops) {
        let rect = {
            x: Math.floor((winBounds.width - winPop.width) / 2),
            y,
            width: winPop.width,
            height: winPop.height,
        };
        winPop.browserView.setBounds(rect);
        y += winPop.height + POP_VERTICAL_SPACING;
    }
}
function showWinPop(winPop) {
    if (!m_MainWindow) {
        m_MainWindow = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
    }
    let winPop2 = getWinPop(winPop.id);
    if (!winPop2) {
        m_MainWindowPops.push(winPop);
        winPop.browserView.addToBrowserWindow(m_MainWindow);
        refreshPopsRect();
    }
}
function hideWinPop(winPopId) {
    let removeFlag = false;
    for (let i = m_MainWindowPops.length - 1; i >= 0; i--) {
        let winPop = m_MainWindowPops[i];
        if (winPop.id == winPopId) {
            winPop.browserView.removeFromBrowserWindow(m_MainWindow);
            winPop.browserView.webContents.close();
            if (winPop.browserView.webContents.getOSProcessId() > 0) {
                process.kill(winPop.browserView.webContents.getOSProcessId());
            }
            m_MainWindowPops.splice(i, 1);
            removeFlag = true;
        }
    }
    if (removeFlag) {
        refreshPopsRect();
    }
}
function topMainWindowPops() {
    for (let winPop of m_MainWindowPops) {
        winPop.browserView.addToBrowserWindow(m_MainWindow);
    }
}
exports.topMainWindowPops = topMainWindowPops;
electron_1.ipcMain.on("_visibleNetStateView", (event, visible, netState) => {
    console.info("_visibleNetStateView:", visible, netState);
    if (!visible) {
        hideWinPop(WinId_1.default.NetStateView);
    }
    else {
        if (getWinPop(WinId_1.default.NetStateView)) {
            return;
        }
        let url = `sview:/#/netErrorBox`;
        let width = 430;
        let height = 48;
        let netStateView = (0, BrowserHelper_1.createBrowserView)({
            id: WinId_1.default.NetStateView,
            width,
            height,
            frame: false,
            transparent: true,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.NetStateView, url),
            },
        });
        netStateView.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(url));
        let data = { netState };
        netStateView.webContents.on("did-start-loading", () => {
            netStateView.webContents.send("ready", data);
        });
        netStateView.webContents.on("did-stop-loading", () => {
            netStateView.webContents.send("ready", data);
        });
        let winPop = new MainWindowPop(WinId_1.default.NetStateView, netStateView, width, height);
        showWinPop(winPop);
    }
});
let m_MainWindowTabCountMaxPopTime = 0;
function showTabCountMaxPop() {
    let curTime = new Date().getTime();
    if (curTime - m_MainWindowTabCountMaxPopTime < 60 * 60 * 1000) {
        return;
    }
    let winPop = showCommonMainWindowPop("TabCountMaxPop", "检测到应用内开启标签页较多，可能会影响应用运行，建议您清理不必要的标签页", 588);
    if (winPop &&
        winPop.browserView &&
        !winPop.browserView.webContents.isDestroyed() &&
        !winPop.browserView.webContents.isCrashed()) {
        m_MainWindowTabCountMaxPopTime = curTime;
        winPop.browserView.webContents.on("destroyed", () => {
            m_MainWindowTabCountMaxPopTime = new Date().getTime();
        });
    }
}
exports.showTabCountMaxPop = showTabCountMaxPop;
function showCommonMainWindowPop(id, content, width = 548, height = 48) {
    if (getWinPop(id)) {
        return;
    }
    let url = "sview:/#/generalTipsPop";
    let bv = (0, BrowserHelper_1.createBrowserView)({
        id,
        width,
        height,
        webPreferences: { preload: (0, LoadUrlHelper_1.getPreloadJs)(id, url) },
    });
    bv.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(url));
    let data = { content };
    bv.webContents.on("did-start-loading", () => {
        bv.webContents.send("ready", data);
    });
    bv.webContents.on("did-stop-loading", () => {
        bv.webContents.send("ready", data);
    });
    bv.webContents.ipc.on("closeWindowPop", () => {
        hideWinPop(id);
    });
    let winPop = new MainWindowPop(id, bv, width, height);
    showWinPop(winPop);
    return winPop;
}
exports.showCommonMainWindowPop = showCommonMainWindowPop;
function hideCommonMainWindowPop(id) {
    hideWinPop(id);
}
exports.hideCommonMainWindowPop = hideCommonMainWindowPop;
//# sourceMappingURL=MainWindowPopHelper.js.map