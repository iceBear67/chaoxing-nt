"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeSubTab = void 0;
const electron_1 = require("electron");
const TabHelper_1 = __importDefault(require("./TabHelper"));
const WindowTabHelper_1 = __importDefault(require("./WindowTabHelper"));
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const WinId_1 = __importDefault(require("../common/WinId"));
const BrowserHelper_1 = require("./BrowserHelper");
const AppSystemConfigMainHelper_1 = require("./AppSystemConfigMainHelper");
const BrowserExtStore_1 = require("./BrowserExtStore");
const ReportMainHelper_1 = require("./ReportMainHelper");
electron_1.ipcMain.on("_closeSubTab", (event, id, forceClose) => {
    closeSubTab(event.sender, id, forceClose);
});
function closeSubTab(webContents, id, forceClose = false) {
    let bw = electron_1.BrowserWindow.fromWebContents(webContents);
    if (!bw)
        return;
    if (bw._id == WinId_1.default.MainWindow) {
        if (id) {
            TabHelper_1.default.closeSubTab(id, forceClose);
        }
        else {
            TabHelper_1.default.closeSubTabWithWebContents(webContents, forceClose);
        }
    }
    else if (bw.tabBrowser) {
        bw.tabBrowser.closeSubTab(id, webContents);
    }
    else {
        WindowTabHelper_1.default.closeSubTab(bw, id, webContents);
    }
}
exports.closeSubTab = closeSubTab;
function fixedSubTab(webContents, id, enable) {
    let bw = electron_1.BrowserWindow.fromWebContents(webContents);
    if (bw._id == WinId_1.default.MainWindow) {
        if (id) {
            TabHelper_1.default.fixedSubTab(id, enable);
        }
    }
}
function closeOtherSubTab(webContents, id, type) {
    let bw = electron_1.BrowserWindow.fromWebContents(webContents);
    if (bw._id == WinId_1.default.MainWindow) {
        if (id) {
            TabHelper_1.default.closeOtherSubTab(id, type);
        }
    }
}
electron_1.ipcMain.on("_showTabItemMenu", (event, id, options) => {
    console.log("显示标签页右键菜单：showTabItemMenu:", id);
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    let subTab = getSubTab(id, win);
    if (subTab) {
        let wContents = subTab.getWebContents();
        if (wContents) {
            let display = electron_1.screen.getDisplayNearestPoint({
                x: options.x,
                y: options.y,
            });
            let workArea = display.workArea;
            let width = 146;
            if ((0, AppSystemConfigMainHelper_1.getAppSystemConfig)().language == "en_US") {
                width = 186;
            }
            let height = 144;
            if (win._id == WinId_1.default.MainWindow) {
                height = 321;
            }
            if (options.x + width > workArea.x + workArea.width) {
                options.x = workArea.x + workArea.width - width;
            }
            if (options.y + height > workArea.y + workArea.height) {
                options.y -= height;
            }
            let popUrl = "sview:/#/tabRightClickMsg";
            let readyData = {};
            if (win._id == WinId_1.default.MainWindow) {
                let subTab = getSubTab(id, win);
                if (subTab) {
                    readyData.fromMainWindow = true;
                    let canCloseOther = TabHelper_1.default.canCloseOtherSubTab(id);
                    Object.assign(readyData, canCloseOther);
                    if (!subTab.canDel) {
                        readyData.isMainTab = true;
                    }
                    else {
                        readyData.isMainTab = false;
                    }
                    readyData.isFixed = subTab.fixed;
                }
                else {
                    readyData.fromMainWindow = false;
                }
            }
            else {
                readyData.fromMainWindow = false;
            }
            let popWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.TabBarItemMenuWindow);
            if (popWin && !popWin.isDestroyed()) {
                if (popWin.getParentWindow() != win) {
                    popWin.destroy();
                    popWin = undefined;
                }
            }
            if (!popWin || popWin.isDestroyed()) {
                popWin = (0, BrowserHelper_1.createBrowserWindow)({
                    id: WinId_1.default.TabBarItemMenuWindow,
                    width,
                    height,
                    x: options.x,
                    y: options.y,
                    parent: win,
                    frame: false,
                    transparent: true,
                    resizable: false,
                    hasShadow: false,
                    movable: false,
                    webPreferences: {
                        preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.TabBarItemMenuWindow, popUrl),
                        nodeIntegration: true,
                        contextIsolation: true,
                    },
                });
                if (!popWin.extParams) {
                    popWin.extParams = {};
                }
                popWin.extParams.subTabid = id;
                let url = (0, LoadUrlHelper_1.getUrl)(popUrl, true);
                popWin.loadURL(url);
                popWin.webContents.on("did-start-loading", () => {
                    popWin.webContents.send("ready", readyData);
                });
                popWin.on("close", (event) => {
                    event.preventDefault();
                    popWin.hide();
                });
                popWin.webContents.ipc.on("_tab_bar_menu_item_click", (event, key) => {
                    onClickTabMenuItem(key);
                    popWin.hide();
                });
            }
            else {
                popWin.webContents.send("showRightClickMenu", readyData);
                popWin.setBounds({
                    x: options.x,
                    y: options.y,
                    width,
                    height,
                });
                if (!popWin.extParams) {
                    popWin.extParams = {};
                }
                popWin.extParams.subTabid = id;
                if (popWin.getParentWindow() != win) {
                    popWin.setParentWindow(win);
                }
                popWin.show();
            }
        }
    }
});
function onClickTabMenuItem(key) {
    let popWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.TabBarItemMenuWindow);
    console.log("onClickTabMenuItem:", key);
    if (!popWin) {
        console.log("onClickTabMenuItem:popWin in null");
        return;
    }
    let win = popWin.getParentWindow();
    if (!win) {
        console.log("onClickTabMenuItem:pwindow in null");
        return;
    }
    let id = popWin.extParams.subTabid;
    if (!id) {
        console.log("onClickTabMenuItem:tabid in null");
        return;
    }
    let wContents = getSubTab(id, win)?.getWebContents();
    if (!wContents) {
        console.log("onClickTabMenuItem:wContents in null");
        return;
    }
    let pageUrl = wContents.getURL();
    if (pageUrl) {
        if (key == "forward") {
            forwardUrl(pageUrl, wContents.getTitle(), win);
        }
        else if (key == "refresh") {
            (0, BrowserHelper_1.reloadView)(wContents);
            setTimeout(() => {
                if (!win.isDestroyed() &&
                    !wContents.isDestroyed() &&
                    !wContents.isCrashed()) {
                    wContents.send("contentMenuItemClick", "reload");
                }
            }, 1500);
        }
        else if (key == "copy_link") {
            electron_1.clipboard.writeText(pageUrl);
        }
        else if (key == "open_in_browser") {
            electron_1.shell.openExternal(pageUrl);
        }
        else if (key === "report") {
            const messageId = (0, BrowserExtStore_1.getWindowExtStoreOnLink)(id, "messageId");
            if (messageId) {
                const data = {
                    url: wContents.getURL()
                };
                for (const key of ReportMainHelper_1.REPORT_WEB_PAGE_KEYS) {
                    const value = (0, BrowserExtStore_1.getWindowExtStoreOnLink)(id, key);
                    if (value) {
                        data[key] = value;
                    }
                }
                TabHelper_1.default.openReportTabWithWebPage(data);
            }
            else {
                TabHelper_1.default.openReportTabWithWebPage({ url: wContents.getURL() });
            }
        }
        else if (key == "close_tab") {
            closeSubTab(wContents, id);
        }
        else if (key == "fixed_tab") {
            fixedSubTab(wContents, id, true);
        }
        else if (key == "cancel_fixed_tab") {
            fixedSubTab(wContents, id, false);
        }
        else if (key == "close_left_tab") {
            closeOtherSubTab(wContents, id, "left");
        }
        else if (key == "close_right_tab") {
            closeOtherSubTab(wContents, id, "right");
        }
        else if (key == "close_other_tab") {
            closeOtherSubTab(wContents, id, "other");
        }
    }
}
function forwardUrl(pageUrl, title, win) {
    let forwardPageUrl = `https://im.chaoxing.com/res/studyForward/index.html`;
    let forwardWin = (0, BrowserHelper_1.createBrowserWindow)({
        width: 640,
        height: 480,
        parent: win,
        resizable: false,
        frame: false,
        webPreferences: {
            preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.TabBarItemMenuWindow, forwardPageUrl),
            nodeIntegration: true,
            contextIsolation: true,
        },
    });
    forwardWin.loadURL(forwardPageUrl);
    let attachment = {
        attachmentType: 25,
        att_web: {
            title,
            url: pageUrl,
        },
    };
    forwardWin.webContents.send("ready", { attachment });
    forwardWin.webContents.on("did-start-loading", () => {
        forwardWin.webContents.send("ready", { attachment });
    });
}
function getSubTab(id, win) {
    let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
    if (mainWin == win) {
        return TabHelper_1.default.getSubTab(id);
    }
    return WindowTabHelper_1.default.getSubTab(win, id);
}
//# sourceMappingURL=TabOperHelper.js.map