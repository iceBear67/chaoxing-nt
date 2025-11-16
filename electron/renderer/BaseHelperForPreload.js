"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullScreenWindow = exports.openSystemNetCenter = void 0;
const UseTimeLogUtil_1 = require("../utils/UseTimeLogUtil");
let m_UseTimeLog = new UseTimeLogUtil_1.UseTimeLog(false);
m_UseTimeLog.start("BaseHelperForPreload");
const electron_1 = require("electron");
const i18n_1 = __importDefault(require("../i18n/i18n"));
m_UseTimeLog.end("1");
m_UseTimeLog.end("2");
const BaseHelper = __importStar(require("./BaseHelper"));
const EventUtil_1 = require("../utils/EventUtil");
m_UseTimeLog.end("3");
let initCrashReport;
if (window.ketangFlag) {
    initCrashReport = require("./CrashReportHelper").initCrashReport;
}
setTimeout(() => {
    if (!initCrashReport) {
        initCrashReport = require("./CrashReportHelper").initCrashReport;
    }
    initCrashReport();
}, 0);
BaseHelper.invokeToMainProcess("_getLanguage").then((language) => {
    i18n_1.default.changeLanguage(language.replace("_", "-"));
});
function closeTab(forceClose = false) {
    BaseHelper.closeSubTab(undefined, forceClose);
}
function alertOnMainFrame(text) {
    BaseHelper.alert2(text);
}
function openSystemNetCenter() {
    let cmd;
    if (process.platform == "darwin") {
        cmd = `open /System/Library/PreferencePanes/Network.prefPane`;
    }
    else {
        cmd = `control.exe /name Microsoft.NetworkAndSharingCenter`;
    }
    const child_process = require("child_process");
    child_process.exec(cmd, (error, stdout, stderr) => {
        if (stderr) {
            console.error(`命令错误：${stderr}`);
            return;
        }
        console.log(`命令输出：${stdout}`);
    });
}
exports.openSystemNetCenter = openSystemNetCenter;
function continueToUnsafeLink() {
    electron_1.ipcRenderer.send("_continueToUnsafeLink");
}
function postMessageToOperner(data, targetOrigin) {
    console.log("postMessageToOperner:", data);
    electron_1.ipcRenderer.send("_postMessageToOperner", data, targetOrigin);
}
function reloadView() {
    BaseHelper.sendToMainProcess("_refreshView");
}
function fullscreenchange(enter) {
    BaseHelper.sendToMainProcess("_fullscreenchange", enter);
}
function isWindowFullScreen(winId) {
    return BaseHelper.invokeToMainProcess("_isWindowFullScreen", winId);
}
function fullScreenWindow(flag, winId) {
    BaseHelper.sendToMainProcess("_fullScreenWindow", winId, flag);
}
exports.fullScreenWindow = fullScreenWindow;
function showUnloadPrompt(msg) {
    BaseHelper.confirm(msg, {
        okBtn: "离开",
        okClick: () => {
            closeTab(true);
        },
        cancelBtn: "取消",
    });
}
let m_exitFullScreenWithEsc = true;
EventUtil_1.EventUtil.on("exitFullScreenWithEsc", (enable) => {
    m_exitFullScreenWithEsc = enable;
});
try {
    electron_1.contextBridge.exposeInMainWorld("jsBridge_CloseTab", closeTab);
    electron_1.contextBridge.exposeInMainWorld("jsBridge_Common_Oper", {
        closeTab,
        alert: alertOnMainFrame,
        reloadView,
        openSystemNetCenter,
        continueToUnsafeLink,
        postMessageToOperner,
        showUnloadPrompt,
    });
    electron_1.contextBridge.exposeInMainWorld("i18nAPI", { t: i18n_1.default.t });
    electron_1.webFrame.executeJavaScript(`window.alert = function(text){
        jsBridge_Common_Oper.alert(text)
    }`);
    initAddEventListener();
    window.addEventListener("load", () => {
        electron_1.webFrame.executeJavaScript(`window.close = function () {
            let hostname = window.location.hostname;
            if(window.top != window.self){
              return;
            }
            let result = true;
            if(hostname.endsWith("chaoxing.com")){
                result = window.dispatchEvent(new CustomEvent("beforeunload",{cancelable:true}));
            }
            if(result){
                jsBridge_Common_Oper.closeTab()
            }
        }
       `);
        document.addEventListener("fullscreenchange", (event) => {
            console.log("fullscreenchange...");
            fullscreenchange(document.fullscreenElement ? true : false);
        });
        document.addEventListener("webkitfullscreenchange", (event) => {
            console.log("webkitfullscreenchange...");
            fullscreenchange(document.webkitIsFullScreen ? true : false);
        });
        document.addEventListener("keydown", (event) => {
            if (event.code == "Escape") {
                BaseHelper.sendToMainProcess("_EscapeKeydown");
                exitFullscreen();
            }
        });
        electron_1.ipcRenderer.on("_exitFullscreen", () => {
            exitFullscreen();
        });
        function exitFullscreen() {
            if (!m_exitFullScreenWithEsc) {
                return;
            }
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            else if (document.webkitIsFullScreen) {
                document.webkitExitFullscreen();
            }
            else {
                isWindowFullScreen().then((value) => {
                    if (value) {
                        fullScreenWindow(false);
                    }
                });
            }
        }
        initPostMessage();
    });
}
catch (err) {
    console.warn("base helper error:", err);
}
function checkUa() {
    let userAgent = navigator.userAgent;
    console.debug("curUa:", userAgent);
    if (!userAgent.includes("/ChaoXingStudy_") &&
        !userAgent.includes("KeTangVersion/")) {
        BaseHelper.sendToMainProcess("_resetUserAgent");
    }
}
checkUa();
function initPostMessage() {
    electron_1.ipcRenderer.on("_postMessageToOperner", (event, data, targetOrigin) => {
        console.log("receive postMessageToOperner:", data);
        window.postMessage(data, targetOrigin);
        const iframes = document.querySelectorAll("iframe");
        iframes.forEach((iframe) => {
            iframe.contentWindow.postMessage(data, targetOrigin);
        });
    });
    electron_1.webFrame.executeJavaScript(`
    if(!window.opener){
        window.opener = {};
            window.opener.postMessage = function(data, targetOrigin) {
              jsBridge_Common_Oper.postMessageToOperner(data, targetOrigin)
           }
    }
    `);
}
function initAddEventListener() {
    electron_1.webFrame.executeJavaScript(`
    // 保存原始方法
const originalAddEventListener = window.addEventListener;

// 重写addEventListener方法
window.addEventListener = function (type, listener, ...args) {
  if (type == "beforeunload") {
    // console.log(\`正在监听事件: \${type}\`);
    // 调用原始方法
    let result = originalAddEventListener.call(this, type, (event)=>{
      console.log("进入事件:",type);
      let tempResult = listener(event);
      console.log("beforeunload return:",tempResult);
      if(tempResult&&event.defaultPrevented){
         jsBridge_Common_Oper.showUnloadPrompt(tempResult);
      }
   
      return tempResult; 
    }, ...args);
    return result;
  }else{
    return originalAddEventListener.call(this, type, listener, ...args);
  }    
};
  `);
}
require("../../module/compile/lib/Jscx");
require("../renderer/BaseHelperForPreload");
m_UseTimeLog.end("9");
exports.default = {};
//# sourceMappingURL=BaseHelperForPreload.js.map