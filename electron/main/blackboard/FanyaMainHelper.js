"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartFanyaMainWindow = exports.createFanyaMainWindow = void 0;
const electron_1 = require("electron");
const BrowserHelper_1 = require("../BrowserHelper");
const WinId_1 = __importDefault(require("../../common/WinId"));
const MainHelper_1 = require("../MainHelper");
const BrowserTabMainHelper_1 = require("../BrowserTabMainHelper");
function createFanyaMainWindow() {
    let url = "https://k.chaoxing.com/middle/newFykt";
    let win = (0, MainHelper_1.openNewWindow)(undefined, {
        url,
        options: {
            id: WinId_1.default.meetWindowUUID,
            width: 1200,
            height: 750,
            frame: false,
            resizable: false,
            hasShadow: true,
            transparent: true,
            showOnScreenShare: false,
        },
    });
    win.maximize();
    win.webContents.loadURL(url);
    win.on("closed", () => {
        electron_1.app.exit();
    });
    return win;
}
exports.createFanyaMainWindow = createFanyaMainWindow;
function restartFanyaMainWindow() {
    let fanyaWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
    (0, BrowserHelper_1.delWindowInWindowMap)(WinId_1.default.meetWindowUUID);
    let bw = createFanyaMainWindow();
    bw.on("ready-to-show", () => {
        if (fanyaWin && !fanyaWin.isDestroyed()) {
            fanyaWin.destroy();
            setTimeout(() => {
                (0, BrowserHelper_1.putWindowInWindowMap)(WinId_1.default.meetWindowUUID, bw);
            }, 20);
        }
    });
}
exports.restartFanyaMainWindow = restartFanyaMainWindow;
electron_1.ipcMain.on("_restartFanyaMainWindow", (event) => {
    restartFanyaMainWindow();
});
(0, BrowserHelper_1.onWindowCreate)("cx_resource_manage", (win) => {
    let tabBroser = new BrowserTabMainHelper_1.TabBrowser(win, "cx_resource_manage", "https://k.chaoxing.com/middle/resourceManage");
});
module.exports = { createFanyaMainWindow, restartFanyaMainWindow };
//# sourceMappingURL=FanyaMainHelper.js.map