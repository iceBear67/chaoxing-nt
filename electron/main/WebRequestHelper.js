"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebRequest = exports.addBeforeRequestListener = exports.addBeforeSendHeadersListener = void 0;
const electron_1 = require("electron");
let m_BeforeSendHeadersListeners = new Map();
let m_BeforeRequestListeners = new Map();
function addBeforeSendHeadersListener(key, listener) {
    m_BeforeSendHeadersListeners.set(key, listener);
}
exports.addBeforeSendHeadersListener = addBeforeSendHeadersListener;
function addBeforeRequestListener(key, listener) {
    m_BeforeRequestListeners.set(key, listener);
}
exports.addBeforeRequestListener = addBeforeRequestListener;
function initWebRequest() {
    electron_1.session.defaultSession.webRequest.onBeforeSendHeaders(async (details, callback) => {
        let result = 0;
        for (const listener of m_BeforeSendHeadersListeners.values()) {
            let tempRet = await listener(details);
            if (tempRet > result) {
                result = tempRet;
            }
        }
        if (result == 0) {
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        }
        else if (result == 1) {
            callback({ cancel: true });
        }
        else {
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        }
    });
    electron_1.session.defaultSession.webRequest.onBeforeRequest(async (details, callback) => {
        let result = 0;
        for (const listener of m_BeforeRequestListeners.values()) {
            let tempRet = await listener(details);
            if (tempRet > result) {
                result = tempRet;
            }
        }
        if (result == 0) {
            callback({ cancel: false });
        }
        else if (result == 1) {
            callback({ cancel: true });
        }
        else {
            callback({ cancel: false, redirectURL: details.url });
        }
    });
}
exports.initWebRequest = initWebRequest;
//# sourceMappingURL=WebRequestHelper.js.map