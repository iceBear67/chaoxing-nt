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
Object.defineProperty(exports, "__esModule", { value: true });
const UseTimeLogUtil_1 = require("../utils/UseTimeLogUtil");
let m_UseTimeLog = new UseTimeLogUtil_1.UseTimeLog(false);
m_UseTimeLog.start("JsBridgeHelper");
const WinId = require("../common/WinId");
m_UseTimeLog.end("1");
const _JsBridge = require("./JsBridge");
m_UseTimeLog.end("2");
const MainWindowHelper_1 = __importStar(require("./MainWindowHelper"));
m_UseTimeLog.end("3");
const RendererHelper = __importStar(require("./RendererHelper"));
m_UseTimeLog.end("4");
let AccountUtil;
let ProjectionBoxHelper;
if (window.ketangFlag) {
    AccountUtil = require("../utils/AccountUtil").AccountUtil;
    ProjectionBoxHelper = require("../module/projection/renderer/ProjectionBoxHelper");
}
m_UseTimeLog.end("5");
_JsBridge.on("CLIENT_LOGIN_STATUS", function () {
    return RendererHelper.invokeToMainProcess("CLIENT_LOGIN_STATUS");
});
_JsBridge.on("CLIENT_LOGIN", function () {
    MainWindowHelper_1.default.openLoginPage();
});
_JsBridge.on("CLIENT_LOGIN_PC_END", function () {
    RendererHelper.appLoginEnd();
});
_JsBridge.on("CLIENT_LOGOUT", function () {
    RendererHelper.sendToMainProcess("CLIENT_LOGOUT");
});
_JsBridge.on("CLIENT_GET_USERINFO", function () {
    return RendererHelper.invokeToMainProcess("CLIENT_GET_USERINFO");
});
_JsBridge.on("CLIENT_OPEN_KETANG", (parms) => {
    RendererHelper.sendToMainProcess("CLIENT_OPEN_KETANG", parms);
});
_JsBridge.on("CLIENT_EXIT_WEBAPP", (parms) => {
    RendererHelper.closeWindow();
});
_JsBridge.on("CLIENT_DESTORY_WEBAPP", (parms) => {
    RendererHelper.destroyWindow();
});
_JsBridge.on("CLIENT_CLOSE_SUB_TAB", () => {
    MainWindowHelper_1.default.closeSubTab();
});
_JsBridge.on("CLIENT_OPEN_WINDOW_WITH_TAB", ({ url, options }) => {
    RendererHelper.openWindowWithTab(url, options);
});
_JsBridge.on("CLIENT_OPEN_WINDOW", ({ url, options, data }) => {
    RendererHelper.openWindow(url, options, data);
});
_JsBridge.on("CLIENT_FULL_SCREEN", ({ enabled }) => {
    RendererHelper.fullScreenWindow(enabled);
});
_JsBridge.on("CLIENT_MAX_WINDOW", () => {
    RendererHelper.maxWindow();
});
_JsBridge.on("CLIENT_UNMAX_WINDOW", () => {
    RendererHelper.unmaxWindow();
});
_JsBridge.on("CLIENT_RES_RECENTLY", (data) => {
    return RendererHelper.invokeToMainProcess("CLIENT_RES_RECENTLY", data);
});
_JsBridge.on("CLIENT_GET_RECENT_RECORD", (data) => {
    return RendererHelper.invokeToMainProcess("CLIENT_GET_RECENT_RECORD", data?.numCount);
});
_JsBridge.on("CLIENT_DEL_RECENTLY", (data) => {
    return RendererHelper.invokeToMainProcess("CLIENT_DEL_RECENTLY", data);
});
_JsBridge.on("CLIENT_OPEN_EXTERNAL", (url) => {
    return RendererHelper.openExternal(url);
});
_JsBridge.on("CLIENT_GET_INIT_DATA", () => {
    return RendererHelper.getInitData();
});
_JsBridge.on("CLIENT_MESSAGE_UPDATE_MEMBER", function (data) {
    return RendererHelper.sendToView("updateMember", "tab_message", data);
});
_JsBridge.on("CLOUD_SELECTOR", function (data) {
    return RendererHelper.sendToView("CLOUD_SELECTOR", "tab_message", data);
});
_JsBridge.on("CLIENT_STORE_DATA_CHANGED", function ({ enabled, key }) {
    if (enabled) {
        RendererHelper.onStoreDataChanged(key, (value) => {
            _JsBridge.execTrigger("CLIENT_STORE_DATA_CHANGED", { key, value });
        });
    }
    else {
        RendererHelper.offStoreDataChanged(key);
    }
});
_JsBridge.on("CLIENT_SET_STORE_DATA", function ({ type, key, value, delOnLogout }) {
    if (type == "user") {
        RendererHelper.setUserStore(key, value, delOnLogout);
    }
    else if (type == "system") {
        RendererHelper.setSysStore(key, value);
    }
    else {
        RendererHelper.setTempStore(key, value);
    }
});
_JsBridge.on("CLIENT_GET_STORE_DATA", function ({ type, key }) {
    if (type == "user") {
        return RendererHelper.getUserStore(key);
    }
    else if (type == "system") {
        return RendererHelper.getSysStore(key);
    }
    else {
        return RendererHelper.getTempStore(key);
    }
});
_JsBridge.on("CLIENT_GET_STORE_DATA_WITH_KEY", function ({ type, key }) {
    if (type == "user") {
        return RendererHelper.getUserStore(key).then((value) => {
            return { key, value };
        });
    }
    else if (type == "system") {
        return RendererHelper.getSysStore(key).then((value) => {
            return { key, value };
        });
    }
    else {
        return RendererHelper.getTempStore(key).then((value) => {
            return { key, value };
        });
    }
});
_JsBridge.on("CLIENT_IM_ADD_PERSON_TO_GROUP", function ({ groupId }) {
    if (groupId) {
        return MainWindowHelper_1.default.addSelfToChatGroup(groupId);
    }
});
_JsBridge.on("CLIENT_IM_GET_CONVERSATION_DATA", function () {
    return RendererHelper.invokeToMainProcess("CLIENT_IM_GET_CONVERSATION_DATA");
});
_JsBridge.on("CLIENT_OPEN_CHAT", function (parms) {
    MainWindowHelper_1.default.openChatPage(parms);
});
_JsBridge.on("CLIENT_PC_OPEN_SETTING", function (parms) {
    RendererHelper.openWindow("sview:/#/setting", { width: 800, height: 500 });
});
_JsBridge.on("CLIENT_PC_APP_SYSTEM_CONFIG", function (parms) {
    let key = parms.key;
    return MainWindowHelper_1.default.getAppSystemConfig().then((data) => {
        return { key: key, value: data[key] };
    });
});
_JsBridge.on("CLIENT_DISPLAY_MESSAGE", function (parms) {
    if (parms && parms.message) {
        RendererHelper.toast(parms.message, { gravity: parms.gravity });
    }
});
_JsBridge.on("CLIENT_PC_OPEN_NEW_SUB_TAB", function (parms) {
    MainWindowHelper_1.default.openNewSubTab(parms.url, parms.tabId, parms.options);
});
_JsBridge.on("CLIENT_PC_GET_MOUSE_POINT_IN_WINDOW", () => {
    return RendererHelper.getMousePointInWindow();
});
_JsBridge.on("CLIENT_PC_DOWNLOAD_DISK_FILE", function (parms) {
    if (parms) {
        MainWindowHelper_1.default.downloadDiskFile(parms);
    }
});
_JsBridge.on("CLIENT_PC_DOWNLOAD_DISK_FOLDER", function (parms) {
    if (parms) {
        MainWindowHelper_1.default.downloadDiskFolder(parms);
    }
});
_JsBridge.on("CLIENT_PC_DOWNLOAD_GROUP_DISK_FOLDER", function (parms) {
    if (parms) {
        MainWindowHelper_1.default.downloadGroupDiskFolder(parms);
    }
});
_JsBridge.on("CLIENT_PC_DOWNLOAD_DISK_MULTIPLE", function (parms) {
    if (parms) {
        MainWindowHelper_1.default.downloadDiskMultiple(parms);
    }
});
_JsBridge.on("CLIENT_PC_OPEN_DOWNLOAD_CENTER", function () {
    MainWindowHelper_1.default.openDownloadCenter();
});
_JsBridge.on("CLIENT_PC_GET_NEW_DOWNLOAD_COUNT", function () {
    return 0;
});
_JsBridge.on("CLIENT_PC_DOWNLOAD_AND_OPEN_PPT", function (data) {
    MainWindowHelper_1.default.downloadAndOpenPptFile(data.url, data.objectId, data.fileName, (result) => {
        _JsBridge.execTrigger("CLIENT_PC_DOWNLOAD_AND_OPEN_PPT", result);
    });
});
_JsBridge.on("CLIENT_PC_CHANGE_WINDOW_SIZE", function (data) {
    if (data.center == undefined) {
        data.center = true;
    }
    RendererHelper.resizeWindowSize(data);
});
_JsBridge.on("CLIENT_PC_OPEN_LOCAL_PPT", function () {
    return RendererHelper.invokeToMainProcess("_openLocalPpt");
});
_JsBridge.on("CLIENT_WEB_EXTRAINFO", function (parms) {
    if (parms) {
        RendererHelper.setTempStore("CLIENT_WEB_EXTRAINFO", parms);
    }
});
RendererHelper.onStoreDataChanged("CLIENT_WEB_EXTRAINFO", (value) => {
    if (value) {
        _JsBridge.execTrigger("CLIENT_WEB_EXTRAINFO", value);
    }
});
_JsBridge.on("CLIENT_PC_SHOW_PERSON_INFO", function (parms) {
    if (parms) {
        MainWindowHelper_1.default.showPersonInfoWindow(parms);
    }
});
_JsBridge.on("CLIENT_AICHAT_APP", () => {
    RendererHelper.sendToMainProcess("CLIENT_AICHAT_APP");
});
_JsBridge.on("CLIENT_IM_FLASH_TRAY_ICON", (parms) => {
    if (parms) {
        RendererHelper.sendToView("CLIENT_IM_FLASH_TRAY_ICON", "tab_message", parms);
    }
});
_JsBridge.on("CLIENT_EXIT_FULL_SCREEN_WITH_ESC", (enable) => {
    RendererHelper.exitFullScreenWithEsc(enable);
});
_JsBridge.on("CLIENT_CHANGE_TAB_MARK", (mark) => {
    RendererHelper.sendToMainProcess("_CHANGE_TAB_MARK", mark);
});
_JsBridge.on("CLIENT_HEIBAN_OPEN_KETANG", (args) => {
    RendererHelper.sendToOtherWindow("CLIENT_HEIBAN_OPEN_KETANG", WinId.meetWindowUUID, args);
});
_JsBridge.on("CLIENT_SET_AUTOLOGIN", (data) => {
    RendererHelper.sendToMainProcess("CLIENT_SET_AUTOLOGIN", data);
});
_JsBridge.on("CLIENT_GET_AUTOLOGIN", () => {
    return MainWindowHelper_1.default.getAppSystemConfig().then((data) => {
        return { enable: data.autoLogin || false };
    });
});
_JsBridge.on("CLIENT_GET_LAST_USER_LOGINRES", async () => {
    let lastUserUid = await RendererHelper.getSysStore("lastUserUid");
    if (lastUserUid) {
        if (!AccountUtil) {
            AccountUtil = require("../utils/AccountUtil").AccountUtil;
        }
        let account = AccountUtil.getAccount(lastUserUid);
        let isNextLoginNoConfirm = account?.nextLoginToConfirm || false;
        let lastUserLoginRes = {
            ...account?.lastUserLoginRes,
            isNextLoginNoConfirm,
        };
        return lastUserLoginRes;
    }
});
_JsBridge.on("CLIENT_PC_READ_ALOUD_TEXT", (data) => {
    return MainWindowHelper_1.default.readAloudText(data.text, (resData) => {
        _JsBridge.execTrigger("CLIENT_PC_READ_ALOUD_TEXT_PROGRESS", {
            ...resData,
            id: data.id,
        });
    });
});
_JsBridge.on("CLIENT_PC_SEND_QUESTION", (data) => {
    MainWindowHelper_1.default.sendQuestion(data.text).then((res) => {
        _JsBridge.execTrigger("CLIENT_PC_SEND_QUESTION_PROGRESS", {
            ...res,
            id: data.id,
        });
    });
});
_JsBridge.on("CLIENT_PC_GET_SYSTEM_PERFORMANCE", () => {
    return (0, MainWindowHelper_1.getSystemPerformance)();
});
_JsBridge.on("CLIENT_PC_SET_LOGIN_EXT", async (data) => {
    const uid = await MainWindowHelper_1.default.getUID();
    const updatedData = { ...data, uid };
    if (!AccountUtil) {
        AccountUtil = require("../utils/AccountUtil").AccountUtil;
    }
    AccountUtil.updateAccountProperty(updatedData);
});
_JsBridge.on("CLIENT_OPEN_CONTACTSDEPARTMENT", function () {
    MainWindowHelper_1.default.openContactsPage();
});
_JsBridge.on("CLIENT_START_WISDOM_SCREEN", (data) => {
    if (!ProjectionBoxHelper) {
        ProjectionBoxHelper = require("../module/projection/renderer/ProjectionBoxHelper");
    }
    ProjectionBoxHelper.openProjectionBox(data);
    RendererHelper.off("CLIENT_START_WISDOM_SCREEN_RESULT");
    RendererHelper.on("CLIENT_START_WISDOM_SCREEN_RESULT", (result) => {
        _JsBridge.execTrigger("CLIENT_START_WISDOM_SCREEN", result);
    });
});
m_UseTimeLog.end("99");
module.exports = {};
//# sourceMappingURL=JsBridgeHelper.js.map