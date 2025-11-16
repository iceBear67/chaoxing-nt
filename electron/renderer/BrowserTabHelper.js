"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTabBounds = exports.showTab = exports.addTabMenu = void 0;
const electron_1 = require("electron");
const RendererHelper_1 = require("./RendererHelper");
function addTabMenu(id, url, show = false) {
    (0, RendererHelper_1.sendToMainProcess)("_addTabMenu", { id, url, show });
}
exports.addTabMenu = addTabMenu;
function showTab(id, reload = false) {
    (0, RendererHelper_1.sendToMainProcess)("_showTab", { id, reload });
}
exports.showTab = showTab;
function setTabBounds(bounds) {
    (0, RendererHelper_1.sendToMainProcess)("_setTabBounds", bounds);
}
exports.setTabBounds = setTabBounds;
electron_1.contextBridge.exposeInMainWorld("BrowserTabHelper", {
    addTabMenu,
    showTab,
    setTabBounds,
});
//# sourceMappingURL=BrowserTabHelper.js.map