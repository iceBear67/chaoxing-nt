const { EventEmitter } = require("node:events");
const { contextBridge, webFrame } = require("electron");
let m_FunMap = new Map();
let m_TriggerEmitter = new EventEmitter();
function postNotification(key, value) {
    console.log("...postNotification", key, JSON.stringify(value));
    let fun = m_FunMap.get(key);
    if (fun) {
        if (typeof (value) == "string" && value.startsWith("{")) {
            value = JSON.parse(value);
        }
        let result = fun(value);
        if (result != undefined) {
            if (result.then && typeof (result.then) == "function") {
                result.then((result2) => {
                    execTrigger(key, result2);
                });
            }
            else {
                execTrigger(key, result);
            }
        }
    }
    else {
        execTrigger(key, { protocolUnavailable: 1 });
    }
}
function on(key, fun) {
    m_FunMap.set(key, fun);
}
function bind(key, fun) {
    console.log("JsBridge bind fun:", key);
    m_TriggerEmitter.on(key, fun);
}
function unbind(key, fun) {
    console.log("JsBridge unbind fun:", key);
    if (fun) {
        m_TriggerEmitter.removeListener(key, fun);
    }
    else {
        m_TriggerEmitter.removeAllListeners();
    }
}
function isBind(key) {
    return m_TriggerEmitter.listenerCount(key) > 0;
}
function execTrigger(key, value) {
    console.log(`JsBridge emit`, key, value);
    m_TriggerEmitter.emit(key, value);
}
function isSupported(key) {
    let fun = m_FunMap.get(key);
    if (fun) {
        return true;
    }
    else {
        return false;
    }
}
module.exports = { on, execTrigger };
document.addEventListener("load", () => {
    let device = process.platform == "darwin" ? "macos" : "windows";
    webFrame.executeJavaScript(`if (jsBridge && jsBridge.setDevice) {
                jsBridge.setDevice("${device}")
        }`);
});
let _jsBridge = "windowsjsbridge";
if (process.platform == "darwin") {
    _jsBridge = "macosjsbridge";
}
contextBridge.exposeInMainWorld(_jsBridge, { postNotification, bind, unbind, isBind, isSupported });
//# sourceMappingURL=JsBridge.js.map