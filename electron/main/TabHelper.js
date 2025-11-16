"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubMenuCount = exports.onTabChanged = exports.updateTabBarList = exports.getSubTab = exports.getCurSub = exports.getCurSubTabId = exports.setMarginLeft = exports.exitCurFullscreen = exports.fullscreenchange = exports.showSubTab = exports.getBrowserViewById = exports.getCurTab = exports.showTab = exports.SubTabMenu = exports.TabMenu = void 0;
const electron_1 = require("electron");
const events_1 = require("events");
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const BrowserHelper_1 = require("./BrowserHelper");
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const MainWindowPopHelper_1 = require("./MainWindowPopHelper");
const PostUrlCacheHelper_1 = require("./PostUrlCacheHelper");
const UserHelper_1 = __importDefault(require("./UserHelper"));
const MainHelper_1 = require("./MainHelper");
const NetUtil_1 = require("./util/NetUtil");
const TokenUtil_1 = require("../utils/TokenUtil");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const BrowserExtStore_1 = require("./BrowserExtStore");
const ReportMainHelper_1 = require("./ReportMainHelper");
const PostDataUtils_1 = require("../utils/PostDataUtils");
let m_TabMenus = new Map();
let m_CurTab;
let m_tabIndex = 1;
let m_MainWin;
let m_TabBar;
let m_TabPanel;
let m_MarginLeft = 120;
const m_EventEmitter = new events_1.EventEmitter();
let isNeedReloadCourseUrl = false;
const m_MenuList = [
    {
        hasLogin: false,
        url: "https://homepage.chaoxing.com",
        id: "tab_home",
    },
    {
        hasLogin: true,
        winOpts: {},
        url: "sview:/#/message",
        id: "tab_message",
    },
    {
        hasLogin: true,
        url: "https://groupyd2.chaoxing.com/pc/activity/activityList",
        id: "tab_note",
    },
    {
        hasLogin: true,
        url: "https://mooc2-ans.chaoxing.com/visit/interaction",
        id: "tab_course",
    },
    {
        hasLogin: true,
        url: "https://pan-yz.chaoxing.com/pcuserpan/index",
        id: "tab_cloud_disk",
    },
    {
        hasLogin: true,
        url: "https://groupweb.chaoxing.com/res/app/group_index/views/index.html",
        id: "tab_group",
    },
    {
        hasLogin: true,
        url: "sview:/#/setting",
        id: "tab_setting",
    },
    {
        url: "sview:/#/empty",
        id: "tab_empty",
    },
    {
        url: "sview:/#/download",
        id: "tab_download",
    },
];
class TabMenu extends events_1.EventEmitter {
    constructor(_win, _id, _url, winOpts, viewBounds) {
        super();
        this.subTabs = [];
        this.showItemList = [];
        this.win = _win;
        this.id = _id;
        this.url = _url;
        this.m_ViewBounds = viewBounds;
        this.addSubTab(this.url, true);
    }
    addSubTab(url, isMainView = false, winOpts, handlerDetails, inBackground = false) {
        let _subTab = this.getSubTabByUrl(url);
        winOpts = winOpts || {};
        if (!_subTab && winOpts.id) {
            _subTab = this.getSubTab(winOpts.id);
        }
        if (_subTab &&
            _subTab.view &&
            !_subTab.view.webContents.isDestroyed() &&
            !_subTab.view.webContents.isCrashed()) {
            this.showSubTab(_subTab.id, true);
            return;
        }
        winOpts = winOpts || {};
        if (!winOpts.id) {
            if (isMainView) {
                winOpts.id = this.getMainViewId();
            }
            else {
                let tempUrl = new url_1.URL(url);
                let winId = tempUrl.searchParams.get("_winId");
                if (winId) {
                    winOpts.id = winId;
                }
                else {
                    winOpts.id = `${this.id}_sub_${m_tabIndex++}`;
                }
            }
        }
        let subTab = new SubTabMenu(this.win, this, url, !isMainView, winOpts, handlerDetails);
        (0, BrowserExtStore_1.addToWebContentsLink)(subTab.view.webContents, null);
        subTab.view.webContents.setWindowOpenHandler((details) => {
            if (details.url.startsWith("https://xiumi.us/auth")) {
                return { action: "allow" };
            }
            let tempSubTab = this.addSubTab(details.url, false, undefined, details);
            if (tempSubTab) {
                (0, BrowserExtStore_1.addToWebContentsLink)(tempSubTab.view.webContents, subTab.view.webContents);
                tempSubTab.view.webContents.ipc.on("_postMessageToOperner", (event, data, targetOrigin) => {
                    if (subTab?.view?.webContents &&
                        !subTab.view.webContents.isDestroyed() &&
                        !subTab.view.webContents.isCrashed()) {
                        subTab.view.webContents.send("_postMessageToOperner", data, details.referrer.url);
                    }
                });
            }
            return { action: "deny" };
        });
        subTab.id = winOpts.id;
        setTimeout(() => {
            subTab.setupViewBounds(this.m_ViewBounds);
        }, 0);
        subTab.getWebContents()?.on("render-process-gone", (event, details) => {
            if (!this.win || this.win.isDestroyed()) {
                return;
            }
            let preId;
            let curId;
            for (let i = 0; i < this.subTabs.length; i++) {
                let item = this.subTabs[i];
                if (item == subTab) {
                    curId = item.id;
                    item.view.removeFromBrowserWindow(this.win);
                    this.subTabs.splice(i, 1);
                    this.updateTabBar();
                    break;
                }
                preId = item.id;
            }
            if (!curId) {
                return;
            }
            if (isMainView) {
                this.addSubTab(url, true, winOpts, undefined, true);
            }
            if (this.curItemId == curId) {
                if (!preId) {
                    preId = this.getMainViewId();
                }
                if (m_CurTab == this) {
                    this.showSubTab(preId);
                }
                else {
                    this.curItemId = preId;
                }
            }
            else {
                if (m_CurTab) {
                    m_CurTab.updateTabBar();
                    m_CurTab.showSubTab(m_CurTab.curItemId);
                }
            }
        });
        subTab.view.webContents.on("searchOnNewPage", (text) => {
            this.addSubTab(`https://m.chaoxing.com/search/redirect?backurl=https://m.chaoxing.com/xxtpc/#/all?keyword=${text}`);
        });
        subTab.view.webContents.on("openWindowWithTab", (url) => {
            this.addSubTab(url);
        });
        if (isMainView && this.subTabs.length > 0) {
            this.subTabs.splice(0, 0, subTab);
        }
        else {
            this.subTabs.push(subTab);
        }
        this.addRecendItem(subTab.id);
        if (!inBackground) {
            this.curItemId = subTab.id;
        }
        this.visibleTabBar();
        subTab.on("titleUpdate", (id, title) => {
            this.emit("titleUpdate", id, title);
        });
        subTab.on("faviconUpdate", (id, favicon) => {
            this.emit("faviconUpdate", id, favicon);
        });
        this.updateTabBar();
        this.emit("tabSelectChanged", this.curItemId);
        return subTab;
    }
    getSubTab(id) {
        if (id == this.id) {
            id = this.getMainViewId();
        }
        for (let subTab of this.subTabs) {
            if (subTab.id == id) {
                return subTab;
            }
        }
    }
    getSubTabIndex(id, subTab) {
        if (id == this.id) {
            id = this.getMainViewId();
        }
        for (let i = 0; i < this.subTabs.length; i++) {
            let tempSubTab = this.subTabs[i];
            if (subTab) {
                if (subTab == tempSubTab) {
                    return i;
                }
            }
            else {
                if (tempSubTab.id == id) {
                    return i;
                }
            }
        }
        return -1;
    }
    reloadMainView(url) {
        let subTab = this.getSubTab(this.getMainViewId());
        if (subTab) {
            loadUrl(url, subTab.view.webContents);
        }
    }
    showTab(showMainView = false) {
        console.log(`TabHelper::TabMenu::showTab:showMainView:${showMainView},this.curItemId:${this.curItemId}`);
        if (showMainView) {
            this.curItemId = this.getMainViewId();
        }
        let subTab = this.getSubTab(this.curItemId);
        if (subTab) {
            if (subTab.view.webContents.isDestroyed() ||
                subTab.view.webContents.isCrashed()) {
                if (this.curItemId == this.getMainViewId()) {
                    this.addSubTab(subTab.url, true);
                    subTab = this.getSubTab(this.curItemId);
                }
            }
            this.updateTabBar();
            subTab.view.addToBrowserWindow(this.win);
            this.visibleTabBar();
            this.emit("tabSelectChanged", this.curItemId);
            subTab.getWebContents()?.send("tabSelectdThis");
        }
    }
    showSubTab(id, reload = false) {
        console.log(`showSubTab:id:${id},reload:${reload}`);
        if (id == this.id) {
            id = this.getMainViewId();
        }
        let subTab = this.getSubTab(id);
        if (subTab) {
            if (reload) {
                subTab.view.webContents.reload();
            }
            subTab.view.addToBrowserWindow(this.win);
            this.addRecendItem(id);
            if (this.curItemId != id) {
                sendCurSubBlur();
                this.curItemId = id;
            }
            this.emit("tabSelectChanged", this.curItemId);
            subTab.getWebContents()?.send("tabSelectdThis");
            this.visibleTabBar();
        }
    }
    getMainViewId() {
        return `${this.id}_sub`;
    }
    updateTabBar() {
        this.sortSubTab();
        let tabBar = [];
        this.subTabs.forEach((subTab) => {
            tabBar.push({
                id: subTab.id,
                title: subTab.title,
                favicon: subTab.favicon,
                canDel: subTab.canDel,
                fixed: subTab.fixed,
            });
        });
        this.emit("updateTabBar", tabBar);
    }
    execBeforeunloadJs(wContents) {
        let jsCode = `window.dispatchEvent(new CustomEvent("beforeunload",{cancelable:true}))`;
        return Promise.race([
            wContents.executeJavaScript(jsCode),
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(false);
                }, 1000);
            }),
        ]);
    }
    async closeSubTab(id, forceClose = false) {
        let subTab = this.getSubTab(id);
        if (!subTab) {
            return;
        }
        console.log("closeSubTab:", id, forceClose);
        if (!subTab.canDel) {
            return;
        }
        if (!subTab.view.webContents.isDestroyed() &&
            !subTab.view.webContents.isCrashed()) {
            let wContents = subTab.view.webContents;
            if (wContents.getURL()) {
                let tempUrl = new url_1.URL(wContents.getURL());
                if (!forceClose && tempUrl.hostname.endsWith("chaoxing.com")) {
                    let result = await this.execBeforeunloadJs(wContents);
                    if (!result) {
                        return;
                    }
                }
            }
            if (wContents.isDestroyed() || wContents.isCrashed()) {
                return;
            }
            wContents.close();
            if (wContents.getOSProcessId() > 0) {
                process.kill(wContents.getOSProcessId());
            }
        }
        subTab.view.removeFromBrowserWindow(this.win);
        let subTabIndex = this.getSubTabIndex(undefined, subTab);
        this.subTabs.splice(subTabIndex, 1);
        this.removeRencendItem(id);
        this.updateTabBar();
        if (this.curItemId == id && this.subTabs.length > 0) {
            let preId = this.getLastRencendItem();
            this.showSubTab(preId);
        }
        else if (this.subTabs.length == 1) {
            this.showSubTab(this.curItemId);
        }
    }
    canCloseOtherSubTab(id) {
        let result = {
            canCloseOther: false,
            canCloseLeft: false,
            canCloseRight: false,
        };
        let subTabIndex = this.getSubTabIndex(id);
        if (subTabIndex < 0) {
            return result;
        }
        if (subTabIndex > 1) {
            let preSubTab = this.subTabs[subTabIndex - 1];
            if (preSubTab.canDel && !preSubTab.fixed) {
                result.canCloseLeft = true;
            }
        }
        if (subTabIndex < this.subTabs.length - 1) {
            let lastSubTab = this.subTabs[this.subTabs.length - 1];
            if (lastSubTab.canDel && !lastSubTab.fixed) {
                result.canCloseRight = true;
            }
        }
        result.canCloseOther = result.canCloseLeft || result.canCloseRight;
        return result;
    }
    async closeOtherSubTab2(subTab) {
        console.log("closeOtherSubTab2:", subTab?.id);
        if (!subTab.view.webContents.isDestroyed() &&
            !subTab.view.webContents.isCrashed()) {
            let wContents = subTab.view.webContents;
            if (wContents.getURL()) {
                let tempUrl = new url_1.URL(wContents.getURL());
                if (tempUrl.hostname.endsWith("chaoxing.com")) {
                    let result = await this.execBeforeunloadJs(wContents);
                    if (!result) {
                        return;
                    }
                }
            }
            if (wContents.isDestroyed() || wContents.isCrashed()) {
                return;
            }
            wContents.close();
            if (wContents.getOSProcessId() > 0) {
                process.kill(wContents.getOSProcessId());
            }
        }
        subTab.view.removeFromBrowserWindow(this.win);
        let subTabIndex = this.getSubTabIndex(undefined, subTab);
        this.subTabs.splice(subTabIndex, 1);
    }
    async closeOtherSubTab(id, type) {
        let begin = 1;
        let end = this.subTabs.length - 1;
        if (type == "left" || type == "right") {
            let subTabIndex = this.getSubTabIndex(id);
            if (subTabIndex < 0) {
                return;
            }
            if (type == "left") {
                end = subTabIndex - 1;
            }
            else {
                begin = subTabIndex + 1;
            }
        }
        for (let i = end; i >= begin; i--) {
            let subTab = this.subTabs[i];
            if (subTab.canDel && !subTab.fixed && subTab.id != id) {
                await this.closeOtherSubTab2(subTab);
            }
        }
        this.visibleTabBar();
        this.updateTabBar();
        let curSubTab = this.getSubTab(id);
        curSubTab.view.addToBrowserWindow(this.win);
    }
    fixedSubTab(id, enable) {
        let subTab = this.getSubTab(id);
        if (subTab) {
            subTab.fixed = enable;
        }
        this.updateTabBar();
    }
    sortSubTab() {
        let mainViews = this.subTabs.filter((subTab) => {
            return !subTab.canDel;
        });
        let fixedViews = this.subTabs.filter((subTab) => {
            return subTab.canDel && subTab.fixed;
        });
        let otherViews = this.subTabs.filter((subTab) => {
            return subTab.canDel && !subTab.fixed;
        });
        this.subTabs = mainViews.concat(fixedViews).concat(otherViews);
    }
    visibleTabBar() {
        if (m_FullscreenWebContent &&
            !m_FullscreenWebContent.isDestroyed() &&
            !m_FullscreenWebContent.isCrashed()) {
            return;
        }
        let hideTabBar = this.subTabs.length <= 1;
        let subTab = this.getSubTab(this.curItemId);
        if (subTab) {
            subTab.setupViewBounds(this.m_ViewBounds);
        }
        this.emit("visibleTabBar", !hideTabBar);
        setTimeout(() => {
            (0, MainWindowPopHelper_1.topMainWindowPops)();
        }, 1);
    }
    closeAllSubTab() {
        console.log("closeAllSubTab:");
        this.subTabs.forEach((subTab) => {
            subTab.view.webContents.close();
            if (!this.win.isDestroyed()) {
                subTab.view.removeFromBrowserWindow(this.win);
            }
            if (subTab.view.webContents.getOSProcessId() > 0) {
                process.kill(subTab.view.webContents.getOSProcessId());
            }
        });
        this.subTabs = [];
    }
    closeAllSubTabWithoutMain() {
        this.subTabs.forEach((subTab) => {
            if (subTab.id != this.getMainViewId()) {
                this.closeSubTab(subTab.id);
            }
        });
    }
    getSubTabByUrl(url) {
        for (let subTab of this.subTabs) {
            if (subTab.url) {
                let tempUrl1 = subTab.url;
                let tempUrl = new url_1.URL(subTab.url);
                if (tempUrl.hostname == "noteyd.chaoxing.com") {
                    tempUrl.hash = "";
                    tempUrl1 = tempUrl.href;
                }
                if (tempUrl1 == url) {
                    return subTab;
                }
            }
        }
    }
    resizeAllView() {
        this.subTabs.forEach((subTab) => {
            if (!subTab.isDestroyed()) {
                subTab.setupViewBounds(this.m_ViewBounds);
            }
        });
    }
    addRecendItem(itemId) {
        let index = this.showItemList.indexOf(itemId);
        if (index >= 0) {
            this.showItemList.splice(index, 1);
        }
        this.showItemList.push(itemId);
    }
    removeRencendItem(itemId) {
        let index = this.showItemList.indexOf(itemId);
        if (index >= 0) {
            this.showItemList.splice(index, 1);
        }
    }
    getLastRencendItem() {
        if (this.showItemList.length == 0) {
            return null;
        }
        if (this.showItemList.length == 1) {
            return this.showItemList[0];
        }
        for (let i = this.showItemList.length; i >= 0; i--) {
            let itemId = this.showItemList[i];
            if (this.getSubTab(itemId)) {
                return itemId;
            }
        }
        return this.showItemList[0];
    }
}
exports.TabMenu = TabMenu;
class SubTabMenu extends events_1.EventEmitter {
    constructor(_win, pTabMenu, _url, _canDel = true, winOpts, handlerDetails) {
        super();
        this.fixed = false;
        this.win = _win;
        this.tabMenu = pTabMenu;
        this.url = _url;
        this.canDel = _canDel;
        this.view = this.createTabView(winOpts);
        loadUrl(this.url, this.view.webContents, handlerDetails);
    }
    createTabView(winOpts) {
        let opts = {
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegrationInSubFrames: true,
            },
        };
        if (winOpts?.webPreferences) {
            Object.assign(opts.webPreferences, winOpts.webPreferences);
        }
        opts.webPreferences.preload = (0, LoadUrlHelper_1.getPreloadJs)(winOpts?.id, this.url);
        if (!this.url?.startsWith("http")) {
            opts.webPreferences.webSecurity = false;
        }
        opts.id = winOpts?.id;
        let tabView = (0, BrowserHelper_1.createBrowserView)(opts);
        if (winOpts?.extStore) {
            for (let key in winOpts.extStore) {
                (0, BrowserExtStore_1.setWindowExtStore)(tabView.webContents, key, winOpts.extStore[key]);
            }
        }
        tabView.webContents.on("page-title-updated", (event, title, explicitSet) => {
            this.title = title;
            this.emit("titleUpdate", this.id, title);
        });
        tabView.webContents.on("page-favicon-updated", (event, favicons) => {
            if (favicons.length > 0) {
                this.favicon = favicons[0];
                this.emit("faviconUpdate", this.id, this.favicon);
            }
        });
        tabView.webContents.on("did-finish-load", () => {
            if (!this.title) {
                this.title = tabView.webContents.getTitle();
                this.emit("titleUpdate", this.id, this.title);
            }
            tabView.webContents.focus();
        });
        tabView.webContents.on("will-navigate", (event, url) => {
            this.url = url;
        });
        tabView.webContents.on("did-fail-provisional-load", (event, errCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId) => {
            if (!isMainFrame || !validatedURL || !validatedURL.startsWith("http")) {
                return;
            }
            console.info(`加载页面错误：errCode:${errCode},errorDescription:${errorDescription},validatedURL:${validatedURL}`);
            if (Math.abs(errCode) < 200) {
                let fileUrl = new url_1.URL("file://");
                fileUrl.pathname = path_1.default.join(__dirname, "../../html/blankPage.html");
                tabView.webContents.loadURL(fileUrl.href);
            }
        });
        tabView.webContents.ipc.on("_CHANGE_TAB_MARK", (event, mark) => {
            this.url += `#${mark}`;
            console.debug("new Url:", this.url);
        });
        tabView.addToBrowserWindow(this.win);
        tabView.webContents.focus();
        return tabView;
    }
    setupViewBounds(tabBounds) {
        let hideTabbar = this.tabMenu.subTabs.length <= 1;
        if (!tabBounds) {
            let winBounds = this.win.getContentBounds();
            let left = m_MarginLeft;
            let top = hideTabbar ? 44 : 80;
            let bounds = {
                x: left,
                y: top,
                width: winBounds.width - left,
                height: winBounds.height - top,
            };
            console.debug(`hideTabbar:`, hideTabbar);
            console.debug(`setupViewBounds:`, JSON.stringify(bounds));
            this.view.setBounds(bounds);
        }
        else {
            let winBounds = tabBounds;
            let left = winBounds.x;
            let top = hideTabbar ? winBounds.y : winBounds.y + 36;
            let bounds = {
                x: left,
                y: top,
                width: winBounds.width,
                height: winBounds.height - (hideTabbar ? 0 : 36),
            };
            console.debug(`hideTabbar:`, hideTabbar);
            console.debug(`setupViewBounds:`, JSON.stringify(bounds));
            this.view.setBounds(bounds);
        }
    }
    getWebContents() {
        if (this.isDestroyed()) {
            return undefined;
        }
        return this.view.webContents;
    }
    isDestroyed() {
        return (!this.view ||
            !this.view.webContents ||
            this.view.webContents.isCrashed() ||
            this.view.webContents.isDestroyed());
    }
}
exports.SubTabMenu = SubTabMenu;
function getMenuItemById(tabId) {
    for (let menuItem of m_MenuList) {
        if (menuItem.id == tabId) {
            return menuItem;
        }
    }
}
function hasMirror(unitConfigInfos) {
    return unitConfigInfos.some((unitConfigInfo) => {
        if (unitConfigInfo.mirror) {
            console.log("hasMirror", unitConfigInfo);
            return Object.keys(unitConfigInfo.mirror).length > 0;
        }
        else {
            return false;
        }
    });
}
const MIRROR_COURSE_URL = "https://mobile3.chaoxing.com/newmobile/getCourses";
async function getMenuItemUrl(menuItem) {
    if (menuItem.id === "tab_course") {
        const ssoResponse = (0, MainHelper_1.getTempStore)("SSOResponse");
        console.log("getMenuItemUrl", "fid: ", ssoResponse?.fid);
        const unitConfigInfos = ssoResponse?.unitConfigInfos || [];
        const userFid = ssoResponse?.fid;
        const courseUrl = await queryPcCourseUrl({
            fid: userFid,
        });
        console.log("pcCourseUrl", courseUrl);
        if (courseUrl) {
            const fullUrl = addProtocol(courseUrl);
            console.log("用户所在单位配置了课程地址，使用配置的课程地址", fullUrl);
            return addProtocol(fullUrl);
        }
    }
    console.log("menuItem.url", menuItem.url);
    return menuItem.url;
}
(0, MainHelper_1.onStoreDataChanged)("SSOResponse", () => {
    isNeedReloadCourseUrl = true;
});
async function showTab(id, reload, showMainView = false) {
    if (id === "tab_course" && isNeedReloadCourseUrl === true) {
        console.log("SSOResponse 发生变化, 需要重新加载课程地址");
        isNeedReloadCourseUrl = false;
        reload = true;
    }
    console.log(`TabHelper::showTab:id:${id},reload:${reload},showMainView:${showMainView}`);
    await exitCurFullscreen();
    let tabMenu = getTab(id);
    if (tabMenu != m_CurTab) {
        sendCurSubBlur();
    }
    if (tabMenu) {
        if (m_CurTab == tabMenu && !reload) {
            return;
        }
        if (reload) {
            let menuItem = getMenuItemById(id);
            const menuItemUrl = await getMenuItemUrl(menuItem);
            if (menuItem) {
                tabMenu.reloadMainView(menuItemUrl);
                tabMenu.showTab(true);
            }
        }
        else {
            tabMenu.showTab(showMainView);
        }
    }
    else {
        let menuItem = getMenuItemById(id);
        if (!menuItem) {
            return;
        }
        if (menuItem.hasLogin) {
            if (!UserHelper_1.default.getUID()) {
                return;
            }
        }
        const menuItemUrl = await getMenuItemUrl(menuItem);
        tabMenu = new TabMenu(m_MainWin, id, menuItemUrl, menuItem.winOpts);
        registerLisenter(tabMenu);
        m_TabMenus.set(id, tabMenu);
    }
    m_CurTab = tabMenu;
    m_MainWin.webContents.send("menuTabSelectChanged", id);
}
exports.showTab = showTab;
function registerLisenter(tabMenu) {
    tabMenu.on("titleUpdate", (id, title) => {
        m_TabBar.webContents.send("pageTitleUpdate", { id, title });
    });
    tabMenu.on("faviconUpdate", (id, favicon) => {
        m_TabBar.webContents.send("pageFaviconUpdate", { id, favicon });
    });
    tabMenu.on("updateTabBar", (tabBar) => {
        m_TabBar.webContents.send("updateTabBar", tabBar);
    });
    tabMenu.on("tabSelectChanged", (itemId) => {
        m_TabBar.webContents.send("tabSelectChanged", itemId);
        setTimeout(() => {
            m_EventEmitter.emit("tabChanged", itemId);
        }, 0);
    });
    tabMenu.on("visibleTabBar", (visible) => {
        setupTabBarBounds(visible);
    });
}
function setupTabBarBounds(visible = false) {
    console.log(`setupTabBarVisible:`, visible);
    if (visible) {
        m_TabBar.addToBrowserWindow(m_MainWin);
        updateTabBarSize();
    }
    else {
        updateTabBarSize();
    }
}
function getTab(id) {
    return m_TabMenus.get(id);
}
function getCurTab() {
    return m_CurTab;
}
exports.getCurTab = getCurTab;
function getSubTabById(viewId) {
    for (let tabMenu of m_TabMenus) {
        let vId = viewId;
        if (vId == tabMenu[0]) {
            vId = tabMenu[1].getMainViewId();
        }
        let subTab = tabMenu[1].getSubTab(vId);
        if (subTab) {
            return subTab;
        }
    }
}
function getBrowserViewById(viewId) {
    let subTab = getSubTabById(viewId);
    if (subTab) {
        let bv = subTab.view;
        if (bv && bv.webContents && !bv.webContents.isDestroyed()) {
            return bv;
        }
    }
}
exports.getBrowserViewById = getBrowserViewById;
function setMainWindow(mainWin) {
    if (m_MainWin && m_MainWin != mainWin) {
        closeAllTab();
    }
    m_MainWin = mainWin;
    createTabBar();
    m_MainWin.on("will-resize", () => {
        if (m_TabPanel) {
            hideTabPanel();
        }
    });
    m_MainWin.on("maximize", () => {
        if (process.platform == "win32") {
            if (m_CurTab) {
                m_CurTab.visibleTabBar();
            }
        }
    });
    m_MainWin.on("unmaximize", () => {
        if (process.platform == "win32") {
            if (m_CurTab) {
                m_CurTab.visibleTabBar();
            }
        }
    });
    m_MainWin.on("restore", () => {
        if (process.platform == "win32") {
            if (m_CurTab) {
                m_CurTab.visibleTabBar();
            }
        }
    });
    m_MainWin.on("resize", () => {
        if (m_CurTab) {
            m_CurTab.visibleTabBar();
        }
    });
}
function loadUrl(url, wContents, handlerDetails) {
    url = (0, LoadUrlHelper_1.getUrl)(url);
    console.log("loadUrl:", url);
    let option = {};
    if (handlerDetails) {
        if (handlerDetails.referrer) {
            option.httpReferrer = handlerDetails.referrer;
        }
        if (handlerDetails.postBody?.contentType) {
            option.extraHeaders = `Content-Type:${handlerDetails.postBody.contentType}`;
        }
        if (handlerDetails.postBody?.data) {
            option.postData = handlerDetails.postBody.data;
            let postUrlCacheData = new PostUrlCacheHelper_1.PostUrlCache();
            postUrlCacheData.url = url;
            if (handlerDetails.postBody?.contentType) {
                postUrlCacheData.herders = {
                    "Content-Type": handlerDetails.postBody.contentType,
                };
            }
            postUrlCacheData.uploadData = (0, PostUrlCacheHelper_1.getUploadDatasFromPostBody)(handlerDetails.postBody);
            postUrlCacheData.referrer = handlerDetails.referrer.url;
            (0, PostUrlCacheHelper_1.pushPostUrlCache)(postUrlCacheData);
        }
    }
    wContents.loadURL(url, option);
}
function closeSubTab(id, forceClose = false) {
    if (!m_CurTab) {
        return;
    }
    if (id && id != m_CurTab.getMainViewId()) {
        m_CurTab.closeSubTab(id, forceClose);
    }
}
function fixedSubTab(id, enable) {
    if (!m_CurTab) {
        return;
    }
    if (id && id != m_CurTab.getMainViewId()) {
        m_CurTab.fixedSubTab(id, enable);
    }
}
function closeOtherSubTab(id, type) {
    if (!m_CurTab) {
        return;
    }
    if (id) {
        m_CurTab.closeOtherSubTab(id, type);
    }
}
function canCloseOtherSubTab(id) {
    if (!m_CurTab || !id) {
        return {
            canCloseOther: false,
            canCloseLeft: false,
            canCloseRight: false,
        };
    }
    return m_CurTab.canCloseOtherSubTab(id);
}
function closeCurSubTab() {
    if (!m_CurTab) {
        return;
    }
    if (m_CurTab.curItemId != m_CurTab.getMainViewId()) {
        m_CurTab.closeSubTab(m_CurTab.curItemId);
    }
    m_MainWin.webContents.focus();
}
function closeSubTabWithWebContents(wContents, forceClose = false) {
    if (!m_CurTab) {
        return;
    }
    let id = wContents._id;
    if (id) {
        closeSubTab(id, forceClose);
    }
}
function openSubTab(url, option, handlerDetails) {
    if (!m_CurTab) {
        return;
    }
    m_CurTab.addSubTab(url, false, option, handlerDetails);
}
function openReportTab(options) {
    openSubTab(ReportMainHelper_1.REPORT_URL, undefined, {
        url: ReportMainHelper_1.REPORT_URL,
        frameName: "reportPage",
        features: "",
        disposition: "new-window",
        referrer: {
            policy: "default",
            url: "",
        },
        postBody: {
            data: (0, PostDataUtils_1.convertParamsToUploadData)(options),
            contentType: "application/x-www-form-urlencoded",
        },
    });
}
function openReportTabWithGroupChat() { }
function openReportTabWithWebPage(data) {
    openReportTab((0, ReportMainHelper_1.buildReportWebPageOptions)(data));
}
async function showSubTab(id) {
    if (!m_CurTab) {
        return;
    }
    await exitCurFullscreen();
    m_CurTab.showSubTab(id);
}
exports.showSubTab = showSubTab;
function createTabBar() {
    if (!m_MainWin || m_MainWin.isDestroyed()) {
        return;
    }
    m_TabBar = (0, BrowserHelper_1.createBrowserView)({
        id: "mainTabBar",
        width: 800,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, "../preload/main_window_preload.js"),
        },
    });
    m_TabBar.addToBrowserWindow(m_MainWin);
    updateTabBarSize();
    m_TabBar.webContents.on("did-finish-load", () => {
        setTimeout(() => {
            if (m_CurTab) {
                m_CurTab.updateTabBar();
                m_TabBar.webContents.send("tabSelectChanged", m_CurTab.curItemId);
            }
        }, 1000);
    });
    m_TabBar.webContents.on("render-process-gone", (event, details) => {
        console.warn("tabBar process gone");
        createTabBar();
    });
    loadUrl("sview:/#/tabViews", m_TabBar.webContents);
}
function updateTabBarSize() {
    if (m_TabBar) {
        let winBounds = m_MainWin.getBounds();
        let left = m_MarginLeft;
        let top = 44;
        m_TabBar.setBounds({
            x: left,
            y: top,
            width: winBounds.width - left,
            height: 36,
        });
    }
}
function openTabPanel(data) {
    if (!m_TabPanel) {
        m_TabPanel = (0, BrowserHelper_1.createBrowserView)({
            width: 240,
            height: 420,
            webPreferences: {
                preload: path_1.default.join(__dirname, "../preload/main_window_preload.js"),
            },
        });
        m_TabPanel.webContents.on("blur", () => {
            m_TabPanel.setBounds({ x: 0, y: 0, width: 0, height: 0 });
        });
        m_TabPanel.webContents.on("did-finish-load", () => {
            setTimeout(() => {
                m_TabPanel.webContents.send("updateTabBar", data);
                if (m_CurTab) {
                    m_TabPanel.webContents.send("tabSelectChanged", m_CurTab.curItemId);
                }
                m_TabPanel.webContents.focus();
            }, 10);
        });
        m_TabPanel.addToBrowserWindow(m_MainWin);
        loadUrl("sview:/#/tabPanel", m_TabPanel.webContents);
    }
    else {
        m_TabPanel.webContents.send("updateTabBar", data);
        if (m_CurTab) {
            m_TabPanel.webContents.send("tabSelectChanged", m_CurTab.curItemId);
        }
        setTimeout(() => {
            m_TabPanel.webContents.focus();
        }, 200);
    }
    let winBounds = m_MainWin.getBounds();
    let lastBounds = m_TabPanel.lastBounds;
    if (lastBounds) {
        let width = lastBounds.width;
        let height = lastBounds.height;
        m_TabPanel.setBounds({ x: winBounds.width - width, y: 80, width, height });
    }
    else {
        let width = 260;
        let height = 440;
        m_TabPanel.setBounds({ x: winBounds.width - width, y: 80, width, height });
    }
    m_TabPanel.addToBrowserWindow(m_MainWin);
}
function hideTabPanel() {
    let tempBounds = m_TabPanel.getBounds();
    if (tempBounds.width == 0 || tempBounds.height == 0) {
        return;
    }
    m_TabPanel.lastBounds = tempBounds;
    m_TabPanel.setBounds({ x: 0, y: 0, width: 0, height: 0 });
}
function closeAllTab() {
    m_TabMenus.forEach((tabMenu) => {
        tabMenu.closeAllSubTab();
    });
    m_TabMenus.clear();
    m_TabBar.webContents.send("updateTabBar", []);
}
let m_FullscreenWebContent;
function fullscreenchange(wContents, enter) {
    if (!m_CurTab) {
        return;
    }
    if (enter) {
        let id = wContents._id;
        m_FullscreenWebContent = wContents;
        if (id) {
            let subTab = m_CurTab.getSubTab(id);
            if (subTab) {
                let bounds = m_MainWin.getBounds();
                subTab.view.setBounds({
                    x: 0,
                    y: 0,
                    width: bounds.width,
                    height: bounds.height,
                });
                subTab.view.addToBrowserWindow(m_MainWin);
            }
        }
    }
    else {
        m_FullscreenWebContent = undefined;
        m_CurTab.visibleTabBar();
    }
}
exports.fullscreenchange = fullscreenchange;
async function exitCurFullscreen() {
    if (m_FullscreenWebContent &&
        !m_FullscreenWebContent.isDestroyed() &&
        !m_FullscreenWebContent.isCrashed()) {
        m_FullscreenWebContent.send("_exitFullscreen");
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, 300);
        });
    }
}
exports.exitCurFullscreen = exitCurFullscreen;
function reloadHomePage() {
    showTab("tab_home", true);
}
function closeAllWithoutHomePage() {
    m_TabMenus.forEach((tabMenu) => {
        if (tabMenu.id != "tab_home") {
            tabMenu.closeAllSubTab();
            m_TabMenus.delete(tabMenu.id);
        }
        else {
            tabMenu.closeAllSubTabWithoutMain();
            tabMenu.showTab(true);
        }
    });
}
function setMarginLeft(marginLeft) {
    if (m_MarginLeft == marginLeft) {
        return;
    }
    m_MarginLeft = marginLeft;
    m_TabMenus.forEach((tabMenu) => {
        tabMenu.resizeAllView();
    });
    if (m_CurTab) {
        m_CurTab.visibleTabBar();
    }
}
exports.setMarginLeft = setMarginLeft;
function getCurSubTabId() {
    if (m_CurTab) {
        return m_CurTab.curItemId;
    }
}
exports.getCurSubTabId = getCurSubTabId;
function getCurSub() {
    if (m_CurTab) {
        return m_CurTab.getSubTab(m_CurTab.curItemId);
    }
}
exports.getCurSub = getCurSub;
function sendCurSubBlur() {
    let curSub = getCurSub();
    if (curSub && !curSub.isDestroyed()) {
        curSub.view.webContents.send("thisTabBlur");
    }
}
electron_1.ipcMain.on("_openNewSubTab", async (event, subTabUrl, tabId, option) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win?.tabBrowser) {
        return;
    }
    let tabItem = m_CurTab;
    if (tabId && tabId != m_CurTab?.id) {
        await showTab(tabId, false);
        tabItem = m_TabMenus.get(tabId);
    }
    if (!tabItem) {
        return;
    }
    openSubTab(subTabUrl, option);
});
function getSubTab(id) {
    for (let [tabId, tab] of m_TabMenus) {
        let subTab = tab.getSubTab(id);
        if (subTab) {
            return subTab;
        }
    }
}
exports.getSubTab = getSubTab;
function updateTabBarList(tabBarIdList) {
    if (m_CurTab && m_CurTab.subTabs) {
        let subItems = [];
        for (let tabId of tabBarIdList) {
            let subTab = m_CurTab.getSubTab(tabId);
            if (subTab) {
                subItems.push(subTab);
            }
        }
        m_CurTab.subTabs = subItems;
    }
}
exports.updateTabBarList = updateTabBarList;
electron_1.ipcMain.on("_expandMainMenu", (event, value) => {
    if (value) {
        setMarginLeft(120);
    }
    else {
        setMarginLeft(60);
    }
});
function onTabChanged(callback) {
    m_EventEmitter.on("tabChanged", callback);
}
exports.onTabChanged = onTabChanged;
function getAllSubMenuCount() {
    let count = 0;
    m_TabMenus.forEach((tabMenu, key) => {
        count += tabMenu.subTabs.length;
    });
    return count;
}
exports.getAllSubMenuCount = getAllSubMenuCount;
async function queryPcCourseUrl(options) {
    const { fid } = options;
    if (!fid) {
        return undefined;
    }
    const content = "xxtPcCourse";
    const date = getDate();
    const enc = (0, CryptoUtil_1.md5)(`${fid}udoEmaKin${content}${date}`);
    const url = `https://uc1-ans.chaoxing.com/school/switchvalue?fid=${fid}&content=${content}&enc=${enc}`;
    try {
        const res = await (0, NetUtil_1.netRequestGet)(TokenUtil_1.TokenUtil.getEncRequestUrl(url));
        const json = res.json();
        if (json.status) {
            return json.result;
        }
        else {
            console.log("queryPcCourseUrl error", json.msg);
        }
    }
    catch (e) {
        console.log("queryPcCourseUrl error", e);
    }
    return undefined;
}
function getDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function addProtocol(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return `https://${url}`;
    }
    else {
        return url;
    }
}
let moduleExports = {
    TabMenu,
    SubTabMenu,
    showTab,
    getTab,
    setMainWindow,
    closeSubTab,
    closeSubTabWithWebContents,
    showSubTab,
    openSubTab,
    closeAllTab,
    getBrowserViewById,
    fullscreenchange,
    reloadHomePage,
    getCurSubTabId,
    getCurSub,
    closeAllWithoutHomePage,
    setMarginLeft,
    getSubTab,
    closeCurSubTab,
    openTabPanel,
    hideTabPanel,
    updateTabBarList,
    onTabChanged,
    fixedSubTab,
    canCloseOtherSubTab,
    closeOtherSubTab,
    getAllSubMenuCount,
    exitCurFullscreen,
    getCurTab,
    openReportTabWithWebPage,
};
module.exports = moduleExports;
exports.default = moduleExports;
//# sourceMappingURL=TabHelper.js.map