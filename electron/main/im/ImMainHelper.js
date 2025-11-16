"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCmdMessage = exports.sendImMessage = exports.sendToMessageView = void 0;
const electron_1 = require("electron");
const BrowserHelper_1 = require("../BrowserHelper");
const events_1 = require("events");
const MainHelper_1 = require("../MainHelper");
let m_EventEmitObj = new events_1.EventEmitter();
let ImCmdForMain = [];
function sendToMessageView(key, data) {
    let msgView = (0, BrowserHelper_1.getViewInViewMap)("tab_message_sub");
    if (msgView && (0, BrowserHelper_1.isWebContentsCanUse)(msgView.webContents)) {
        if (data?.to) {
            data.to += "";
        }
        msgView.webContents.send(key, data);
    }
}
exports.sendToMessageView = sendToMessageView;
function sendImMessage(msg) {
    sendToMessageView("_sendImMessage", msg);
}
exports.sendImMessage = sendImMessage;
function onCmdMessage(cmd, callback) {
    if (!ImCmdForMain.includes(cmd)) {
        ImCmdForMain.push(cmd);
        (0, MainHelper_1.setTempStore)("ImCmdForMain", ImCmdForMain);
    }
    m_EventEmitObj.on(cmd, callback);
}
exports.onCmdMessage = onCmdMessage;
electron_1.ipcMain.on("_im_cmd_to_main", (event, msg) => {
    if (msg?.action) {
        m_EventEmitObj.emit(msg.action, msg);
    }
});
//# sourceMappingURL=ImMainHelper.js.map