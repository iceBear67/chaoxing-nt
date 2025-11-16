"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTabPanel = exports.TabPanel = void 0;
const electron_1 = require("electron");
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const BrowserHelper_1 = require("./BrowserHelper");
const path_1 = __importDefault(require("path"));
const m_PanelMap = new Map();
class TabPanel {
    constructor(win, top, right) {
        this.m_Win = win;
        this.m_PaddingTop = top;
        this.m_PaddingRight = right;
        this.m_Win.on("will-resize", () => {
            if (this.m_TabPanel) {
                this.hideTabPanel();
            }
        });
    }
    openTabPanel(data, curItemId) {
        if (!data || !curItemId) {
            return;
        }
        if (!this.m_TabPanel) {
            this.m_TabPanel = (0, BrowserHelper_1.createBrowserView)({
                width: 240,
                height: 420,
                webPreferences: {
                    preload: path_1.default.join(__dirname, "../preload/main_window_preload.js"),
                },
            });
            this.m_TabPanel.webContents.on("blur", () => {
                this.hideTabPanel();
            });
            this.m_TabPanel.webContents.on("did-finish-load", () => {
                setTimeout(() => {
                    this.m_TabPanel.webContents.send("updateTabBar", data);
                    if (curItemId) {
                        this.m_TabPanel.webContents.send("tabSelectChanged", curItemId);
                    }
                    this.m_TabPanel.webContents.focus();
                }, 10);
            });
            this.m_TabPanel.addToBrowserWindow(this.m_Win);
            this.m_TabPanel.webContents.loadURL((0, LoadUrlHelper_1.getUrl)("sview:/#/tabPanel"));
        }
        else {
            this.m_TabPanel.webContents.send("updateTabBar", data);
            if (curItemId) {
                this.m_TabPanel.webContents.send("tabSelectChanged", curItemId);
            }
            setTimeout(() => {
                this.m_TabPanel.webContents.focus();
            }, 200);
        }
        let winBounds = this.m_Win.getBounds();
        let lastBounds = this.m_TabPanel.lastBounds;
        if (lastBounds) {
            let width = lastBounds.width;
            let height = lastBounds.height;
            let bounds;
            if (this.m_TabBounds) {
                bounds = {
                    x: this.m_TabBounds.x +
                        this.m_TabBounds.width -
                        width -
                        this.m_PaddingRight,
                    y: this.m_TabBounds.y + this.m_PaddingTop,
                    width,
                    height,
                };
            }
            else {
                bounds = {
                    x: winBounds.width - width - this.m_PaddingRight,
                    y: this.m_PaddingTop,
                    width,
                    height,
                };
            }
            this.m_TabPanel.setBounds(bounds);
        }
        else {
            let width = 260;
            let height = 440;
            let bounds;
            if (this.m_TabBounds) {
                bounds = {
                    x: this.m_TabBounds.x +
                        this.m_TabBounds.width -
                        width -
                        this.m_PaddingRight,
                    y: this.m_TabBounds.y + this.m_PaddingTop,
                    width,
                    height,
                };
            }
            else {
                bounds = {
                    x: winBounds.width - width - this.m_PaddingRight,
                    y: this.m_PaddingTop,
                    width,
                    height,
                };
            }
            this.m_TabPanel.setBounds(bounds);
        }
        this.m_TabPanel.addToBrowserWindow(this.m_Win);
    }
    hideTabPanel() {
        let tempBounds = this.m_TabPanel.getBounds();
        if (tempBounds.width == 0 || tempBounds.height == 0) {
            return;
        }
        this.m_TabPanel.lastBounds = tempBounds;
        this.m_TabPanel.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }
    changeTabPanelHeight(height) {
        let tempBounds = this.m_TabPanel.getBounds();
        if (tempBounds.width == 0 || tempBounds.height == 0) {
            return;
        }
        let winBounds = this.m_Win.getBounds();
        let width = tempBounds.width;
        this.m_TabPanel.setBounds({
            x: winBounds.width - width,
            y: 80,
            width,
            height,
        });
    }
    updateTabBounds(tabBounds) {
        this.m_TabBounds = tabBounds;
    }
}
exports.TabPanel = TabPanel;
function createTabPanel(win, top, right) {
    let panel = new TabPanel(win, top, right);
    win.on("closed", () => {
        m_PanelMap.delete(win);
    });
    m_PanelMap.set(win, panel);
    return panel;
}
exports.createTabPanel = createTabPanel;
electron_1.ipcMain.on("_openTabPanel", (event, data) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    let panel = m_PanelMap.get(win);
    if (panel) {
        panel.openTabPanel(data?.list, data?.curId);
    }
});
electron_1.ipcMain.on("_hideTabPanel", (event) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    let panel = m_PanelMap.get(win);
    if (panel) {
        panel.hideTabPanel();
    }
});
electron_1.ipcMain.on("_changeTabPanelHeight", (event, height) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    let panel = m_PanelMap.get(win);
    if (panel) {
        panel.changeTabPanelHeight(height);
    }
});
module.exports = { createTabPanel };
//# sourceMappingURL=TabPanelHelper.js.map