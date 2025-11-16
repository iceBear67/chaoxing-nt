"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const RendererHelper_1 = require("./RendererHelper");
function sendHidOper(key, code) {
    (0, RendererHelper_1.sendToMainProcess)("_sendHidOper", { key, code });
}
function onReceivedHidData(callback) {
    electron_1.ipcRenderer.on("_receivedHidData", (event, receivedData) => {
        callback(receivedData);
    });
}
sendHidOper("init");
electron_1.contextBridge.exposeInMainWorld("HIDBlackHelper", {
    sendHidOper,
    onReceivedHidData,
});
//# sourceMappingURL=HIDBlackHelper.js.map