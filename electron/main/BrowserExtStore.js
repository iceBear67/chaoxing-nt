"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWindowExtStoreOnLink = exports.getWindowExtStoreOnLink = exports.getWindowExtStore = exports.setWindowExtStore = exports.getWindowExtStoreMap = exports.addToWebContentsLink = void 0;
const BrowserHelper_1 = require("./BrowserHelper");
class WebContentsLink {
    constructor(wContents) {
        this.urls = [];
        this.webContents = wContents;
        this.webContents.on("did-frame-navigate", (event, url, httpResponseCode, httpStatusText, isMainFrame, frameProcessId, frameRoutingId) => {
            this.urls.push(url);
        });
    }
}
const mapWebContentsLink = new Map();
function addToWebContentsLink(webContents, parentWebContents) {
    if (!webContents) {
        return;
    }
    webContents.on("destroyed", () => {
        mapWebContentsLink.delete(webContents);
    });
    let webContentsLink = mapWebContentsLink.get(webContents);
    if (!webContentsLink) {
        webContentsLink = new WebContentsLink(webContents);
        mapWebContentsLink.set(webContents, webContentsLink);
    }
    if (parentWebContents && !webContentsLink.prevWebContentsLink) {
        webContentsLink.prevWebContentsLink =
            mapWebContentsLink.get(parentWebContents);
    }
}
exports.addToWebContentsLink = addToWebContentsLink;
function getWindowExtStoreMap(wContents) {
    let extStoreMap = wContents["_ExtStoreMap"];
    if (!extStoreMap) {
        extStoreMap = new Map();
        wContents["_ExtStoreMap"] = extStoreMap;
    }
    return extStoreMap;
}
exports.getWindowExtStoreMap = getWindowExtStoreMap;
function setWindowExtStore(win, key, value) {
    if (!win) {
        return;
    }
    let wContents;
    if (typeof win == "string") {
        wContents = (0, BrowserHelper_1.getWindowInWindowMap)(win)?.webContents;
        if (!wContents) {
            wContents = (0, BrowserHelper_1.getViewInViewMap)(win)?.webContents;
        }
    }
    else if ((0, BrowserHelper_1.isWebContents)(win)) {
        wContents = win;
    }
    else {
        wContents = win.webContents;
    }
    if (!wContents) {
        return;
    }
    if (!(0, BrowserHelper_1.isWebContentsCanUse)(wContents)) {
        return;
    }
    let extStoreMap = getWindowExtStoreMap(wContents);
    extStoreMap.set(key, value);
}
exports.setWindowExtStore = setWindowExtStore;
function getWindowExtStore(win, key) {
    if (!win) {
        return;
    }
    let wContents;
    if (typeof win == "string") {
        wContents = (0, BrowserHelper_1.getWindowInWindowMap)(win)?.webContents;
        if (!wContents) {
            wContents = (0, BrowserHelper_1.getViewInViewMap)(win)?.webContents;
        }
    }
    else if ((0, BrowserHelper_1.isWebContents)(win)) {
        wContents = win;
    }
    else {
        wContents = win.webContents;
    }
    if (!wContents) {
        return;
    }
    if (!(0, BrowserHelper_1.isWebContentsCanUse)(wContents)) {
        return;
    }
    let extStoreMap = getWindowExtStoreMap(wContents);
    return extStoreMap.get(key);
}
exports.getWindowExtStore = getWindowExtStore;
function getWindowExtStoreOnLink(win, key) {
    if (!win) {
        return;
    }
    let wContents;
    if (typeof win == "string") {
        wContents = (0, BrowserHelper_1.getWindowInWindowMap)(win)?.webContents;
        if (!wContents) {
            wContents = (0, BrowserHelper_1.getViewInViewMap)(win)?.webContents;
        }
    }
    else if ((0, BrowserHelper_1.isWebContents)(win)) {
        wContents = win;
    }
    else {
        wContents = win.webContents;
    }
    if (!wContents) {
        return;
    }
    if (!(0, BrowserHelper_1.isWebContentsCanUse)(wContents)) {
        return;
    }
    let extStoreMap = getWindowExtStoreMap(wContents);
    let value = extStoreMap.get(key);
    if (value) {
        return value;
    }
    let webContentsLink = mapWebContentsLink.get(wContents);
    while (webContentsLink) {
        let prevWebContentsLink = webContentsLink.prevWebContentsLink;
        if (prevWebContentsLink) {
            value = getWindowExtStoreMap(prevWebContentsLink.webContents)?.get(key);
            if (value) {
                return value;
            }
        }
        webContentsLink = prevWebContentsLink;
    }
    return value;
}
exports.getWindowExtStoreOnLink = getWindowExtStoreOnLink;
function getAllWindowExtStoreOnLink(win, key) {
    if (!win) {
        return [];
    }
    let wContents;
    if (typeof win == "string") {
        wContents = (0, BrowserHelper_1.getWindowInWindowMap)(win)?.webContents;
        if (!wContents) {
            wContents = (0, BrowserHelper_1.getViewInViewMap)(win)?.webContents;
        }
    }
    else if ((0, BrowserHelper_1.isWebContents)(win)) {
        wContents = win;
    }
    else {
        wContents = win.webContents;
    }
    if (!wContents) {
        return [];
    }
    if (!(0, BrowserHelper_1.isWebContentsCanUse)(wContents)) {
        return [];
    }
    let extStoreMap = getWindowExtStoreMap(wContents);
    let values = [];
    let value = extStoreMap.get(key);
    if (value) {
        values.push(value);
    }
    let webContentsLink = mapWebContentsLink.get(wContents);
    while (webContentsLink) {
        let prevWebContentsLink = webContentsLink.prevWebContentsLink;
        if (prevWebContentsLink) {
            value = getWindowExtStoreMap(prevWebContentsLink.webContents)?.get(key);
            if (value) {
                values.push(value);
            }
        }
        webContentsLink = prevWebContentsLink;
    }
    return values;
}
exports.getAllWindowExtStoreOnLink = getAllWindowExtStoreOnLink;
//# sourceMappingURL=BrowserExtStore.js.map