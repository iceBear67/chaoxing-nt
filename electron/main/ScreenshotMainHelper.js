"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScreenShot = void 0;
const WinId_1 = __importDefault(require("../common/WinId"));
const BrowserHelper_1 = require("./BrowserHelper");
const TabHelper_1 = __importDefault(require("./TabHelper"));
const electron_1 = require("electron");
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const MainHelper_1 = require("./MainHelper");
const CommonUtil_1 = require("../utils/CommonUtil");
const appConfig = require("../config/appconfig");
let m_ScreenCount = 1;
function startScreenShot() {
    if ((0, CommonUtil_1.osIsLowerThanWin10)()) {
        console.log("当前操作系统版本低于Windows10, 不支持屏幕截图功能");
        return;
    }
    isMainWindowFocused();
    let id = WinId_1.default.screenshotWindow + "0";
    let win = (0, BrowserHelper_1.getWindowInWindowMap)(id);
    if (win && !win.isDestroyed()) {
        return;
    }
    let screenWindows = [];
    let allDisplays = electron_1.screen.getAllDisplays();
    m_ScreenCount = allDisplays.length;
    for (let i = 0; i < allDisplays.length; i++) {
        let display = allDisplays[i];
        console.log("display:", display.bounds, display.scaleFactor, display.id);
        let bounds = display.bounds;
        let url = "sview:/#/screenshot";
        let id = WinId_1.default.screenshotWindow + i;
        let win = (0, BrowserHelper_1.createBrowserWindow)({
            id,
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
            transparent: true,
            frame: false,
            fullscreenable: true,
            enableLargerThanScreen: true,
            resizable: false,
            show: false,
            roundedCorners: false,
            webPreferences: {
                preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.screenshotWindow, url),
            },
        });
        screenWindows.push({
            win,
            x: bounds.x * display.scaleFactor,
            y: bounds.y * display.scaleFactor,
        });
        console.log("获取桌面完成！！！！！！！！");
        win.webContents.on("dom-ready", () => {
            win.webContents
                .executeJavaScript(`document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
              event.preventDefault();
              window.close();
            }
          });`);
            win.show();
        });
        win.on("closed", () => {
            setTimeout(() => {
                closeAllScreenShotWindows();
            }, 1);
            let isHideWindowShot = (0, MainHelper_1.getTempStore)("isHideWindowShot");
            if (isHideWindowShot) {
                setTimeout(() => {
                    (0, MainHelper_1.setTempStore)("isHideWindowShot", false);
                }, 20);
                let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
                if (process.platform == "darwin") {
                    setTimeout(() => {
                        if (mainWin && !mainWin.isDestroyed()) {
                            mainWin.show();
                        }
                    }, 20);
                }
                else {
                    if (mainWin && !mainWin.isDestroyed()) {
                        mainWin.show();
                    }
                }
            }
        });
        win.setBounds({
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
        });
        if (electron_1.app.isPackaged) {
            win.setAlwaysOnTop(true, "screen-saver");
        }
        url = (0, LoadUrlHelper_1.getUrl)("sview:/#/screenshot");
        win.loadURL(url);
    }
}
exports.startScreenShot = startScreenShot;
function closeAllScreenShotWindows() {
    for (let i = 0; i < m_ScreenCount; i++) {
        let id = WinId_1.default.screenshotWindow + i;
        let win = (0, BrowserHelper_1.getWindowInWindowMap)(id);
        if (win && !win.isDestroyed()) {
            win.close();
        }
    }
}
electron_1.ipcMain.on("_sendToOtherSceenshotWindow", (event, key, value) => {
    for (let i = 0; i < m_ScreenCount; i++) {
        let id = WinId_1.default.screenshotWindow + i;
        let win = (0, BrowserHelper_1.getWindowInWindowMap)(id);
        if (win && !win.isDestroyed() && win.webContents != event.sender) {
            win.webContents.send(key, value);
        }
    }
});
function isMainWindowFocused() {
    let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
    let isFocused = mainWin && mainWin.isFocused();
    let msgSubTab = TabHelper_1.default.getSubTab("tab_message_sub");
    if (msgSubTab && !msgSubTab.isDestroyed()) {
        msgSubTab.getWebContents().send("beforeShotIsFouced", isFocused);
    }
}
function getAllScreenWindowThumbnail(thumbnailSize) {
    if (appConfig.appMode == "fanya") {
        electron_1.BrowserWindow.getAllWindows().forEach((bw) => {
            bw.setContentProtection(true);
        });
    }
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, 20);
    }).then(() => {
        return electron_1.desktopCapturer
            .getSources({
            types: ["window", "screen"],
            thumbnailSize,
        })
            .then((sourceList) => {
            for (let source of sourceList) {
                if (source.thumbnail) {
                    source.thumbnail = source.thumbnail.toDataURL();
                }
            }
            if (appConfig.appMode == "fanya") {
                electron_1.BrowserWindow.getAllWindows().forEach((bw) => {
                    bw.setContentProtection(false);
                });
            }
            return sourceList;
        });
    });
}
electron_1.ipcMain.handle("_getAllScreenWindowThumbnail", (event, thumbnailSize) => {
    return getAllScreenWindowThumbnail(thumbnailSize);
});
module.exports = { startScreenShot };
//# sourceMappingURL=ScreenshotMainHelper.js.map