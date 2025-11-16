"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirm = exports.alert2 = exports.openCommonDialog = exports.closeSubTab = exports.invokeToMainProcess = exports.sendToMainProcess = exports.disableIpcLog = void 0;
const electron_1 = require("electron");
const m_DisableIpcLogs = [];
let dialogId = 0;
function disableIpcLog(key, disable) {
    let index = m_DisableIpcLogs.indexOf(key);
    if (disable) {
        if (index < 0) {
            m_DisableIpcLogs.push(key);
        }
    }
    else {
        if (index >= 0) {
            m_DisableIpcLogs.splice(index, 1);
        }
    }
}
exports.disableIpcLog = disableIpcLog;
function sendToMainProcess(key, ...args) {
    if (!m_DisableIpcLogs.includes(key)) {
        if (args) {
            const argsJson = JSON.stringify(args);
            if (argsJson.length < 1024) {
                console.log(`sendToMainProcess:key:${key},args:${argsJson}`);
            }
            else {
                console.log(`sendToMainProcess:key:${key},args length:${argsJson.length}`);
            }
        }
        else {
            console.log(`sendToMainProcess:key:${key}`);
        }
    }
    electron_1.ipcRenderer.send(key, ...args);
}
exports.sendToMainProcess = sendToMainProcess;
function invokeToMainProcess(key, ...args) {
    if (!m_DisableIpcLogs.includes(key)) {
        if (args) {
            let writeLog = true;
            if (key == "_sendToOtherWindow" && args.length > 0) {
                let sendKey = args[0].key;
                if (sendKey) {
                    if (!m_DisableIpcLogs.includes(key)) {
                        writeLog = false;
                    }
                }
            }
            if (writeLog) {
                const argsJson = JSON.stringify(args);
                if (argsJson.length < 1024) {
                    console.log(`invokeToMainProcess:key:${key},args:${argsJson}`);
                }
                else {
                    console.log(`invokeToMainProcess:key:${key},args length:${argsJson.length}`);
                }
            }
        }
        else {
            console.log(`invokeToMainProcess:key:${key}`);
        }
    }
    return electron_1.ipcRenderer.invoke(key, ...args);
}
exports.invokeToMainProcess = invokeToMainProcess;
function closeSubTab(id, forceClose = false) {
    console.log("closeSubTab:", id);
    sendToMainProcess("_closeSubTab", id, forceClose);
}
exports.closeSubTab = closeSubTab;
function openCommonDialog(options) {
    let opts = Object.assign({}, options);
    opts.id = dialogId++;
    opts.okClick = undefined;
    opts.cancelClick = undefined;
    if (opts.okBtns) {
        opts.okBtns = [];
        options.okBtns.forEach((btn) => {
            opts.okBtns.push({ text: btn.text, click: undefined, style: btn.style });
        });
    }
    invokeToMainProcess("_openCommonDialog", opts).then((value) => {
        if (value) {
            if (value._ok && typeof options.okClick === "function") {
                options.okClick(value);
            }
            else if (value.okBtn) {
                if (options.okBtns) {
                    for (let okBtn of options.okBtns) {
                        if (value.okBtn.text == okBtn.text) {
                            okBtn.click();
                        }
                    }
                }
            }
            else if (typeof options.cancelClick === "function") {
                options.cancelClick();
            }
        }
    });
    return opts.id;
}
exports.openCommonDialog = openCommonDialog;
function alert2(msg, options) {
    options = options || {};
    options.content = msg;
    options.type = "alert2";
    return openCommonDialog(options);
}
exports.alert2 = alert2;
function confirm(msg, options) {
    options = options || {};
    options.content = msg;
    options.type = "confirm";
    return openCommonDialog(options);
}
exports.confirm = confirm;
//# sourceMappingURL=BaseHelper.js.map