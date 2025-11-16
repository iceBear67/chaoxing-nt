"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabBrowser = void 0;
const electron_1 = require("electron");
const TabHelper_1 = require("./TabHelper");
const path_1 = __importDefault(require("path"));
const BrowserHelper_1 = require("./BrowserHelper");
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const events_1 = require("events");
const TabPanelHelper_1 = require("./TabPanelHelper");
class BrowserTabMenu extends TabHelper_1.TabMenu {
    constructor(_win, _id, _url, winOpts, tabBrowser) {
        super(_win, _id, _url, winOpts, tabBrowser.m_ViewBounds);
        this.m_TabBrowser = tabBrowser;
    }
}
class TabBrowser extends events_1.EventEmitter {
    constructor(win, winId, url) {
        super();
        this.m_TabMenus = new Map();
        this.m_tabIndex = 1;
        this.m_ViewBounds = { x: 200, y: 50, width: 900, height: 700 };
        this.m_MenuList = [];
        this.m_Win = win;
        this.m_WinId = winId;
        this.m_MainUrl = url;
        this.registerOperLisenter();
        this.createTabBar();
        this.m_TabPanel = (0, TabPanelHelper_1.createTabPanel)(win, 38, 0);
        this.m_TabPanel.updateTabBounds(this.m_ViewBounds);
        this.m_Win.tabBrowser = this;
        this.m_Win.on("maximize", () => {
            if (process.platform == "win32") {
                if (this.m_CurTab) {
                    this.m_CurTab.visibleTabBar();
                }
            }
        });
        this.m_Win.on("unmaximize", () => {
            if (process.platform == "win32") {
                if (this.m_CurTab) {
                    this.m_CurTab.visibleTabBar();
                }
            }
        });
        this.m_Win.on("restore", () => {
            if (process.platform == "win32") {
                if (this.m_CurTab) {
                    this.m_CurTab.visibleTabBar();
                }
            }
        });
        this.m_Win.on("resize", () => {
            if (this.m_CurTab) {
                this.m_CurTab.visibleTabBar();
            }
        });
    }
    createTabBar() {
        this.m_TabBar = (0, BrowserHelper_1.createBrowserView)({
            id: `${this.m_WinId}_mainTabBar`,
            width: 800,
            height: 600,
            webPreferences: {
                preload: path_1.default.join(__dirname, "../preload/main_window_preload.js"),
            },
        });
        this.m_TabBar.addToBrowserWindow(this.m_Win);
        this.updateTabBarSize(false);
        this.m_TabBar.webContents.on("did-finish-load", (event) => {
            setTimeout(() => {
                if (this.m_CurTab) {
                    this.m_CurTab.updateTabBar();
                    this.m_TabBar.webContents.send("tabSelectChanged", this.m_CurTab.curItemId);
                }
            }, 1000);
        });
        this.m_TabBar.webContents.on("render-process-gone", (event, details) => {
            console.warn("tabBar process gone");
            this.createTabBar();
        });
        this.loadUrl("sview:/#/tabViews", this.m_TabBar.webContents);
    }
    updateTabBarSize(visible = true) {
        if (this.m_TabBar) {
            this.m_TabBar.setBounds({
                x: this.m_ViewBounds.x,
                y: this.m_ViewBounds.y,
                width: this.m_ViewBounds.width,
                height: visible ? 36 : 0,
            });
        }
    }
    loadUrl(url, wContents, postBody) {
        url = (0, LoadUrlHelper_1.getUrl)(url);
        console.log("loadUrl:", url);
        wContents.loadURL(url, {
            extraHeaders: postBody?.contentType
                ? `Content-Type:${postBody.contentType}`
                : undefined,
            postData: postBody?.data,
        });
    }
    getTab(id) {
        return this.m_TabMenus.get(id);
    }
    showTab(id, reload) {
        let tabMenu = this.getTab(id);
        if (tabMenu != this.m_CurTab) {
            this.sendCurSubBlur();
        }
        if (tabMenu) {
            if (this.m_CurTab == tabMenu && !reload) {
                return;
            }
            if (reload) {
                let menuItem = this.getMenuItemById(id);
                if (menuItem) {
                    tabMenu.reloadMainView(menuItem.url);
                    tabMenu.showTab(true);
                }
            }
            else {
                tabMenu.showTab();
            }
        }
        else {
            let menuItem = this.getMenuItemById(id);
            if (!menuItem) {
                return;
            }
            tabMenu = new BrowserTabMenu(this.m_Win, id, menuItem.url, menuItem.winOpts, this);
            this.registerLisenter(tabMenu);
            this.m_TabMenus.set(id, tabMenu);
        }
        this.m_CurTab = tabMenu;
        this.m_Win.webContents.send("menuTabSelectChanged", id);
    }
    sendCurSubBlur() {
        let curSub = this.getCurSub();
        if (curSub && !curSub.isDestroyed()) {
            curSub.view.webContents.send("thisTabBlur");
        }
    }
    getCurSubTabId() {
        if (this.m_CurTab) {
            return this.m_CurTab.curItemId;
        }
    }
    getCurSub() {
        if (this.m_CurTab) {
            return this.m_CurTab.getSubTab(this.m_CurTab.curItemId);
        }
    }
    getMenuItemById(tabId) {
        for (let menuItem of this.m_MenuList) {
            if (menuItem.id == tabId) {
                return menuItem;
            }
        }
    }
    registerLisenter(tabMenu) {
        tabMenu.on("titleUpdate", (id, title) => {
            this.m_TabBar.webContents.send("pageTitleUpdate", { id, title });
        });
        tabMenu.on("updateTabBar", (tabBar) => {
            this.m_TabBar.webContents.send("updateTabBar", tabBar);
        });
        tabMenu.on("tabSelectChanged", (itemId) => {
            this.m_TabBar.webContents.send("tabSelectChanged", itemId);
        });
        tabMenu.on("visibleTabBar", (visible) => {
            this.setupTabBarBounds(visible);
        });
    }
    setupTabBarBounds(visible = false) {
        console.log(`setupTabBarVisible:`, visible);
        if (visible) {
            this.m_TabBar.addToBrowserWindow(this.m_Win);
            this.updateTabBarSize();
        }
        else {
            this.updateTabBarSize(false);
        }
    }
    addMenu(id, url, show = false) {
        if (!id) {
            return;
        }
        let menuItem = this.getMenuItemById(id);
        if (menuItem) {
            return;
        }
        menuItem = { id, url };
        this.m_MenuList.push(menuItem);
        if (show) {
            setTimeout(() => {
                this.showTab(id, false);
            }, 10);
        }
    }
    registerOperLisenter() {
        this.m_Win.webContents.ipc.on("_addTabMenu", (event, args) => {
            if (!args) {
                return;
            }
            this.addMenu(args.id, args.url, args.show);
        });
        this.m_Win.webContents.ipc.on("_showTab", (event, args) => {
            if (!args) {
                return;
            }
            this.showTab(args.id);
        });
        this.m_Win.webContents.ipc.on("_setTabBounds", (event, bounds) => {
            if (!bounds) {
                return;
            }
            this.m_ViewBounds = bounds;
            for (let tabMenu of this.m_TabMenus.values()) {
                tabMenu.m_ViewBounds = bounds;
            }
            this.m_TabPanel.updateTabBounds(this.m_ViewBounds);
            if (this.m_CurTab) {
                this.m_CurTab.visibleTabBar();
            }
        });
    }
    hideTabPanel() {
        if (!this.m_TabPanel) {
            return;
        }
        let tempBounds = this.m_TabPanel.m_TabPanel.getBounds();
        if (tempBounds.width == 0 || tempBounds.height == 0) {
            return;
        }
        this.m_TabPanel.lastBounds = tempBounds;
        this.m_TabPanel.m_TabPanel.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }
    async closeSubTab(id, wContents) {
        if (!this.m_CurTab) {
            return;
        }
        if (!id) {
            id = wContents._id;
        }
        if (id && id != this.m_CurTab.getMainViewId()) {
            await this.m_CurTab.closeSubTab(id);
        }
    }
    updateTabBarList(tabBarIdList) {
        if (this.m_CurTab && this.m_CurTab.subTabs) {
            let subItems = [];
            for (let tabId of tabBarIdList) {
                let subTab = this.m_CurTab.getSubTab(tabId);
                if (subTab) {
                    subItems.push(subTab);
                }
            }
            this.m_CurTab.subTabs = subItems;
        }
    }
    showSubTab(id) {
        if (!this.m_CurTab) {
            return;
        }
        this.m_CurTab.showSubTab(id);
    }
}
exports.TabBrowser = TabBrowser;
electron_1.ipcMain.on("_openNewSubTab", (event, subTabUrl, tabId, subTabOpts) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    let tabBrowser = win.tabBrowser;
    if (!tabBrowser) {
        return;
    }
    tabBrowser.showTab(tabId);
    tabBrowser.m_CurTab.addSubTab(subTabUrl, false, subTabOpts);
});
//# sourceMappingURL=BrowserTabMainHelper.js.map