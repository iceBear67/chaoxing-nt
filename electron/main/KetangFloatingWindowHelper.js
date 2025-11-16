"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFloatingWindow = void 0;
const electron_1 = require("electron");
const BrowserHelper_1 = require("./BrowserHelper");
const WinId_1 = __importDefault(require("../common/WinId"));
const LoadUrlHelper_1 = require("./LoadUrlHelper");
let m_FloatingWindow;
let m_WindowPos;
const FLOATING_WINDOW_WIDTH = 272;
const FLOATING_WINDOW_HEIGHT = 200;
function initFloatingWindow() {
    let meetWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
    if (!meetWin || meetWin.isDestroyed()) {
        return;
    }
    if (m_FloatingWindow && !m_FloatingWindow.isDestroyed()) {
        m_FloatingWindow.destroy();
    }
    if (!meetWin || meetWin.isDestroyed()) {
        return;
    }
    const id = WinId_1.default.KetangFloatingWindowUUID;
    const url = `https://fe.chaoxing.com/front/ktmeet/pages/floatingWindow.html`;
    m_FloatingWindow = (0, BrowserHelper_1.createBrowserWindow)({
        id,
        width: FLOATING_WINDOW_WIDTH,
        height: FLOATING_WINDOW_HEIGHT,
        minWidth: FLOATING_WINDOW_WIDTH,
        minHeight: FLOATING_WINDOW_HEIGHT,
        maxWidth: 1200,
        maxHeight: 750,
        frame: false,
        transparent: true,
        skipTaskbar: true,
        resizable: true,
        show: false,
        webPreferences: {
            preload: (0, LoadUrlHelper_1.getPreloadJs)(id, url),
        },
        extParams: {
            ketangFlag: true,
        },
    });
    m_FloatingWindow.setAlwaysOnTop(true, "pop-up-menu");
    m_FloatingWindow.loadURL(url);
    meetWin.on("closed", () => {
        m_FloatingWindow.destroy();
    });
    meetWin.on("minimize", () => {
        let meetWinBounds = meetWin.getNormalBounds();
        let display = electron_1.screen.getDisplayMatching(meetWinBounds);
        let screenBounds = display.workArea;
        let floatPos = { x: 0, y: 0 };
        if (!m_WindowPos) {
            m_WindowPos = {
                x: screenBounds.width - 40 - FLOATING_WINDOW_WIDTH,
                y: 82,
            };
        }
        if (m_WindowPos.x < 0) {
            m_WindowPos.x = 0;
        }
        else if (m_WindowPos.x + FLOATING_WINDOW_WIDTH > screenBounds.width) {
            m_WindowPos.x = screenBounds.width - FLOATING_WINDOW_WIDTH;
        }
        if (m_WindowPos.y < 0) {
            m_WindowPos.y = 0;
        }
        else if (m_WindowPos.y + FLOATING_WINDOW_HEIGHT > screenBounds.height) {
            m_WindowPos.y = screenBounds.height - FLOATING_WINDOW_HEIGHT;
        }
        floatPos.x = screenBounds.x + m_WindowPos.x;
        floatPos.y = screenBounds.y + m_WindowPos.y;
        m_FloatingWindow.setPosition(floatPos.x, floatPos.y);
        m_FloatingWindow.show();
        meetWin.webContents.send("windowStateChanged", "minimize");
        m_FloatingWindow.webContents.send("windowStateChanged", "show");
    });
    meetWin.on("restore", () => {
        let bounds = m_FloatingWindow.getBounds();
        let display = electron_1.screen.getDisplayMatching(bounds);
        let screenBounds = display.workArea;
        m_WindowPos = {
            x: bounds.x - screenBounds.x,
            y: bounds.y - screenBounds.y,
        };
        m_FloatingWindow.hide();
        meetWin.webContents.send("windowStateChanged", "restore");
        m_FloatingWindow.webContents.send("windowStateChanged", "hide");
    });
}
exports.initFloatingWindow = initFloatingWindow;
electron_1.ipcMain.on("_initFloatingWindow", (event) => {
    initFloatingWindow();
});
//# sourceMappingURL=KetangFloatingWindowHelper.js.map