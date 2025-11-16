"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTabBarList = exports.showSubTab = exports.getSubTab = exports.getCurWindowTab = exports.closeCurSubTab = exports.closeSubTab = exports.openNewWindow = void 0;
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const BrowserHelper_1 = require("./BrowserHelper");
const TabHelper_1 = require("./TabHelper");
class WindowTabMenu extends TabHelper_1.TabMenu {
    constructor(_win, _id, _url, winOpts) {
        super(_win, _id, _url, winOpts);
        this.isAddListener = false;
        setTimeout(() => {
            if (!this.win.isDestroyed()) {
                this.updateTabBar();
                this.emit("tabSelectChanged", this.curItemId);
            }
        }, 500);
    }
    addSubTab(url, isMainView = false, winOpts) {
        this.registerLisenter();
        let tempSubTab = super.addSubTab(url, false, winOpts);
        setTimeout(() => {
            this.resetViewBounds();
        }, 2);
        return tempSubTab;
    }
    resetViewBounds() {
        let winBounds = this.win.getBounds();
        let subTab = this.getSubTab(this.curItemId);
        let top = 36;
        subTab.view.setBounds({
            x: 0,
            y: 36,
            width: winBounds.width,
            height: winBounds.height - top,
        });
    }
    visibleTabBar() {
        this.resetViewBounds();
    }
    getMainViewId() {
        if (this.subTabs.length > 0) {
            return this.subTabs[0].id;
        }
    }
    registerLisenter() {
        if (this.isAddListener) {
            return;
        }
        this.isAddListener = true;
        this.on("titleUpdate", (id, title) => {
            this.win.webContents.send("pageTitleUpdate", { id, title });
        });
        this.on("updateTabBar", (tabBar) => {
            this.win.webContents.send("updateTabBar", tabBar);
        });
        this.on("tabSelectChanged", (itemId) => {
            this.win.webContents.send("tabSelectChanged", itemId);
        });
    }
}
function openNewWindow(url, options) {
    let winUrl = (0, LoadUrlHelper_1.getUrl)("sview:/#/searchTabViews");
    let win = (0, BrowserHelper_1.createBrowserWindow)(options);
    if (process.platform == "darwin") {
        win.setWindowButtonVisibility(true);
    }
    win.webContents.on("did-finish-load", () => {
        let tabMenu = new WindowTabMenu(win, options.id, url, {
            bvId: options.bvId,
        });
        win._tabMenu = tabMenu;
    });
    win.webContents.loadURL(winUrl);
    win.on("close", (event) => {
        if (!win._tabMenu) {
            return;
        }
        let tabMenu = win._tabMenu;
        tabMenu.closeAllSubTab();
    });
    win.on("resize", () => {
        if (!win._tabMenu) {
            return;
        }
        let tabMenu = win._tabMenu;
        tabMenu.resetViewBounds();
    });
    return win;
}
exports.openNewWindow = openNewWindow;
async function closeSubTab(win, id, wContents) {
    if (!win) {
        return;
    }
    if (!win._tabMenu) {
        win.close();
        return;
    }
    let tabMenu = win._tabMenu;
    if (!id) {
        id = wContents._id;
    }
    if (id) {
        await tabMenu.closeSubTab(id);
        if (tabMenu.subTabs.length == 0) {
            win.close();
        }
    }
}
exports.closeSubTab = closeSubTab;
async function closeCurSubTab(win, closeWindow = true) {
    if (!win._tabMenu && closeWindow) {
        win.close();
        return;
    }
    let tabMenu = win._tabMenu;
    await tabMenu.closeSubTab(tabMenu.curItemId);
    if (tabMenu.subTabs.length == 0) {
        win.close();
    }
    else {
        win.webContents.focus();
    }
}
exports.closeCurSubTab = closeCurSubTab;
function getCurWindowTab(win) {
    return win._tabMenu;
}
exports.getCurWindowTab = getCurWindowTab;
function getSubTab(win, id) {
    if (!win._tabMenu) {
        return;
    }
    let tabMenu = win._tabMenu;
    return tabMenu.getSubTab(id);
}
exports.getSubTab = getSubTab;
function showSubTab(win, id) {
    if (!win._tabMenu) {
        return;
    }
    let tabMenu = win._tabMenu;
    tabMenu.showSubTab(id);
}
exports.showSubTab = showSubTab;
function fullscreenchange(win, wContents, enter) {
    if (!win._tabMenu) {
        return;
    }
    let tabMenu = win._tabMenu;
    if (enter) {
        let id = wContents._id;
        if (id) {
            let subTab = tabMenu.getSubTab(id);
            if (subTab) {
                let bounds = win.getBounds();
                subTab.view.setBounds({
                    x: 0,
                    y: 0,
                    width: bounds.width,
                    height: bounds.height,
                });
            }
        }
    }
    else {
        tabMenu.resetViewBounds();
    }
}
function updateTabBarList(win, tabBarIdList) {
    if (!win._tabMenu) {
        return;
    }
    let tabMenu = win._tabMenu;
    if (tabMenu && tabMenu.subTabs) {
        let subItems = [];
        for (let tabId of tabBarIdList) {
            let subTab = tabMenu.getSubTab(tabId);
            if (subTab) {
                subItems.push(subTab);
            }
        }
        tabMenu.subTabs = subItems;
    }
}
exports.updateTabBarList = updateTabBarList;
const moduleExports = {
    openNewWindow,
    closeSubTab,
    showSubTab,
    fullscreenchange,
    closeCurSubTab,
    getSubTab,
    updateTabBarList,
    getCurWindowTab,
};
module.exports = moduleExports;
exports.default = moduleExports;
//# sourceMappingURL=WindowTabHelper.js.map