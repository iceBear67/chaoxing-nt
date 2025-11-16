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
exports.verifyActivationCode = exports.getResourceDetailUrl = exports.getSystemPerformance = exports.sendQuestion = exports.readAloudText = exports.getClipboardFilePath = exports.syncContacts = void 0;
const UseTimeLogUtil_1 = require("../utils/UseTimeLogUtil");
let m_UseTimeLog = new UseTimeLogUtil_1.UseTimeLog(false);
m_UseTimeLog.start("MainWindowHelper");
const electron_1 = require("electron");
const RendererHelper_1 = require("./RendererHelper");
const RendererHelper = __importStar(require("./RendererHelper"));
m_UseTimeLog.end("1");
const path_1 = __importDefault(require("path"));
m_UseTimeLog.end("2");
const events_1 = require("events");
m_UseTimeLog.end("3");
m_UseTimeLog.end("4");
const ModeHelper = __importStar(require("./ModeHelper"));
const ImModuleHelper_1 = require("./im/ImModuleHelper");
const ClipboardUtil_1 = require("../utils/ClipboardUtil");
let md5;
let loadFolderSizeInfo;
let ProjectionBoxHelper;
if (window.ketangFlag) {
    md5 = require("../utils/CryptoUtil").md5;
    loadFolderSizeInfo = require("../utils/FileUtil").loadFolderSizeInfo;
    ProjectionBoxHelper = require("../module/projection/renderer/ProjectionBoxHelper");
}
const m_EventEmitter = new events_1.EventEmitter();
let downloadCallback;
function appIsLogin() {
    return RendererHelper.invokeToMainProcess("_isLogin");
}
function appLoginEnd() {
    return RendererHelper.sendToMainProcess("_loginEnd", { type: 0 });
}
function appLogOutAndLogin() {
    return RendererHelper.sendToMainProcess("_loginOutAndLogin");
}
function changeAccountLogin(data) {
    return RendererHelper.sendToMainProcess("_changeAccountLogin", data);
}
function getUID() {
    return RendererHelper.invokeToMainProcess("_getUID");
}
function showTab(id, reload, hasLogin) {
    if (hasLogin) {
        appIsLogin().then((data) => {
            if (!data) {
                openLoginPage();
                return;
            }
            else {
                RendererHelper.sendToMainProcess("_showTab", { id, reload });
            }
        });
    }
    else {
        RendererHelper.sendToMainProcess("_showTab", { id, reload });
    }
}
function selectSubTab(id) {
    RendererHelper.sendToMainProcess("_selectSubTab", id);
}
function closeSubTab(id, forceClose = false) {
    console.log("closeSubTab:", id);
    RendererHelper.sendToMainProcess("_closeSubTab", id, forceClose);
}
function selectWindowSubTab(id) {
    RendererHelper.sendToMainProcess("_selectWindowSubTab", id);
}
function closeWindowSubTab(id) {
    console.log("closeWindowSubTab:", id);
    RendererHelper.sendToMainProcess("_closeWindowSubTab", id);
}
function openTabPanel(data) {
    RendererHelper.sendToMainProcess("_openTabPanel", data);
}
function changeTabPanelHeight(height) {
    RendererHelper.sendToMainProcess("_changeTabPanelHeight", height);
}
function openLoginPage() {
    appIsLogin().then((data) => {
        if (!data) {
            RendererHelper.sendToMainProcess("_openLogin");
        }
    });
}
function getPriUser() {
    return RendererHelper.invokeToMainProcess("_getPriUser");
}
function getAccounts() {
    return RendererHelper.invokeToMainProcess("_getAccounts");
}
function removeAccount(puid) {
    return RendererHelper.invokeToMainProcess("_removeAccount", puid);
}
function createChatGroups(requestParams) {
    return RendererHelper.invokeToMainProcess("_createChatGroups", requestParams);
}
function getImInfo() {
    return RendererHelper.invokeToMainProcess("_getImInfo");
}
function getPanToken() {
    return RendererHelper.invokeToMainProcess("_getPanToken");
}
function searchContactsAndStructureUser(keyword) {
    return RendererHelper.invokeToMainProcess("_searchContactsAndStructureUser", keyword);
}
function genRequest(requestParams) {
    return RendererHelper.invokeToMainProcess("_genRequest", requestParams);
}
function passportGenRequest(requestParams) {
    return RendererHelper.invokeToMainProcess("_passportGenRequest", requestParams);
}
function ucGenRequest(requestParams) {
    return RendererHelper.invokeToMainProcess("_ucGenRequest", requestParams);
}
function dataGenSign(signType, isSign, text, key) {
    return RendererHelper.invokeToMainProcess("_dataGenSign", signType, isSign, text, key);
}
function meetOperate(parms) {
    RendererHelper.sendToMainProcess("_meetOperate", parms);
}
function fullscreenchange(enter) {
    RendererHelper.sendToMainProcess("_fullscreenchange", enter);
}
function checkAldDriver(sdkType = 0) {
    return RendererHelper.invokeToMainProcess("_checkAldDriver", sdkType);
}
function installAldDriver(sdkType = 0) {
    return RendererHelper.invokeToMainProcess("_installAldDriver", sdkType);
}
function getTopTabId() {
    return RendererHelper.invokeToMainProcess("_getTopTabId");
}
function downloadDiskFile(args) {
    RendererHelper.sendToMainProcess("_downloadDiskFile", args);
}
function checkDiskFileDownloadChanged(resId, callback) {
    if (!downloadCallback) {
        downloadCallback = (data) => {
            if (data &&
                (data.data?.resId || data.data?.objectId) &&
                (data.type == "downloadProgressChanged" ||
                    data.type == "downloadStateChanged")) {
                m_EventEmitter.emit(`checkDiskFileDownloadChanged_${data.data.resId || data.data.objectId}`, data.data);
            }
        };
        electron_1.ipcRenderer.on("downloadChannel", (event, data) => {
            downloadCallback(data);
        });
    }
    if (callback) {
        let key = `checkDiskFileDownloadChanged_${resId}`;
        m_EventEmitter.on(key, (item) => {
            callback(item);
            if (item.state == 4 || item.state == 6 || item.state == 6) {
                setTimeout(() => {
                    m_EventEmitter.removeAllListeners(key);
                }, 10);
            }
        });
    }
}
function downloadDiskFolder(args) {
    RendererHelper.sendToMainProcess("_downloadDiskFolder", args);
}
function downloadGroupDiskFolder(args) {
    RendererHelper.sendToMainProcess("_downloadGroupDiskFolder", args);
}
function downloadDiskMultiple(args) {
    RendererHelper.sendToMainProcess("_downloadDiskMultiple", args);
}
function openDownloadCenter() {
    RendererHelper.sendToMainProcess("_openDownloadCenter");
}
function resumeDownload(ids) {
    return RendererHelper.invokeToMainProcess("_downloadOper", {
        key: "resume",
        value: { ids },
    });
}
function pauseDownload(ids) {
    return RendererHelper.invokeToMainProcess("_downloadOper", {
        key: "pause",
        value: { ids },
    });
}
function deleteDownload(ids, delFile = false) {
    return RendererHelper.invokeToMainProcess("_downloadOper", {
        key: "delete",
        value: { ids, delFile },
    });
}
function showItemInFolder(id, resId, objectId) {
    return RendererHelper.invokeToMainProcess("_downloadOper", {
        key: "showItem",
        value: { id, resId, objectId },
    });
}
function openDownloadFile(id, resId) {
    return RendererHelper.invokeToMainProcess("_downloadOper", {
        key: "openItem",
        value: { id, resId },
    });
}
function getNewDownloadCount() {
    return RendererHelper.invokeToMainProcess("_getNewDownloadCount");
}
function clearNewDownloadCount() {
    return RendererHelper.sendToMainProcess("_clearNewDownloadCount");
}
function sendImMessage(data) {
    (0, ImModuleHelper_1.sendImMessage)(data);
}
function screenshot() {
    RendererHelper.sendToMainProcess("_screenshot");
    RendererHelper.onStoreDataChanged("screenshot_pic_data", (picData) => {
        RendererHelper.offStoreDataChanged("screenshot_pic_data");
    });
}
function loadDownloadList() {
    return RendererHelper.invokeToMainProcess("_loadDownloadList");
}
async function getTrayIcon() {
    let imgPath;
    if (process.platform == "darwin") {
        let screenScale = await RendererHelper.getScreenScale();
        if (screenScale >= 1.5) {
            imgPath = path_1.default.join(__dirname, "../../icons/logoTemplate@2x.png");
        }
        else {
            imgPath = path_1.default.join(__dirname, "../../icons/logoTemplate.png");
        }
    }
    else {
        imgPath = path_1.default.join(__dirname, "../../icons/logo.ico");
    }
    let img = electron_1.nativeImage.createFromPath(imgPath);
    img.setTemplateImage(true);
    return img.toPNG();
}
function getTrayIconMac1x() {
    if (process.platform == "darwin") {
        let imgPath = path_1.default.join(__dirname, "../../icons/logoTemplate.png");
        let img = electron_1.nativeImage.createFromPath(imgPath);
        return img.toPNG();
    }
}
function getTrayIconMac2x() {
    if (process.platform == "darwin") {
        let imgPath = path_1.default.join(__dirname, "../../icons/logoTemplate@2x.png");
        let img = electron_1.nativeImage.createFromPath(imgPath);
        return img.toPNG();
    }
}
function setTrayIconMac(base64Url1x, base64Url2x) {
    if (process.platform == "darwin") {
        RendererHelper.sendToMainProcess("_setTrayIconMac", base64Url1x, base64Url2x);
    }
}
function addSelfToChatGroup(groupId) {
    if (groupId) {
        return genRequest({
            baseUrl: `https://learn.chaoxing.com`,
            url: `/apis/im/addUser2Chatgroup4C`,
            getParams: { groupid: groupId },
            tokenSign: true,
        }).then((result) => {
            console.log("addSelfToChatGroup result:", result);
            if (result) {
                if (result.result == 1) {
                    openChatPage({ groupId });
                }
                return { result: result.result, errorMsg: result.errorMsg };
            }
            else {
                return { result: 0, errorMsg: `接口调用失败!` };
            }
        });
    }
}
function openChatPage(parms) {
    RendererHelper.sendToMainProcess("_openChatPage", parms);
}
function getAppSystemConfig() {
    return RendererHelper.invokeToMainProcess("_getAppSystemConfig");
}
function setAppSystemConfig(key, value) {
    RendererHelper.sendToMainProcess("_setAppSystemConfig", key, value);
}
function openNewSubTab(subTabUrl, tabId, subTabOpts) {
    RendererHelper.sendToMainProcess("_openNewSubTab", subTabUrl, tabId, subTabOpts);
}
function saveFileAs(url, fileName) {
    RendererHelper.sendToMainProcess("_downloadSaveAs", url, fileName);
}
function saveLocalFileAs(filePath, fileName) {
    RendererHelper.sendToMainProcess("_saveLocalFileAs", filePath, fileName);
}
function showUpdateReadyPopLater(timeInterval = 2 * 60 * 60 * 1000) {
    RendererHelper.sendToMainProcess("_showUpdateReadyPopLater", timeInterval);
}
function relaunchToNewVersion() {
    RendererHelper.sendToMainProcess("_relaunchToNewVersion");
}
function setDownloadPath(downloadPath) {
    RendererHelper.sendToMainProcess("_setDownloadPath", downloadPath);
}
function getDownloadPath() {
    return RendererHelper.invokeToMainProcess("_getDownloadPath");
}
function showTabItemMenu(id, options) {
    RendererHelper.sendToMainProcess("_showTabItemMenu", id, options);
}
function tabBarMenuItemClick(key) {
    RendererHelper.sendToMainProcess("_tab_bar_menu_item_click", key);
}
function checkNewVersion(fromAbout = true) {
    return RendererHelper.invokeToMainProcess("_checkNewVersion", fromAbout);
}
function onCheckedNewVersion(callback) {
    console.log("onCheckedNewVersion");
    RendererHelper.getTempStore("appVersionInfo").then((value) => {
        callback(value);
    });
    RendererHelper.onStoreDataChanged("appVersionInfo", callback);
}
function getTokenParms(parms) {
    return RendererHelper.invokeToMainProcess("_getTokenParms", parms);
}
function getCxCookieStr() {
    return RendererHelper.invokeToMainProcess("_getCxCookieStr");
}
function openDialogWidthMask(data) {
    RendererHelper.sendToMainProcess("_openDialogWidthMask", data);
}
function openWindowWidthMask(data) {
    RendererHelper.sendToMainProcess("_openWindowWidthMask", data);
}
function downloadAndOpenPptFile(url, objectId, fileName, callback) {
    RendererHelper.sendToMainProcess("_downloadAndOpenPptFile", {
        url,
        objectId,
        fileName,
    });
    let onKey = "_downloadAndOpenPptFile_" + objectId;
    electron_1.ipcRenderer.on(onKey, (event, data) => {
        if (data.downloadStatus == "success" || data.downloadStatus == "failed") {
            electron_1.ipcRenderer.removeAllListeners(onKey);
        }
        callback(data);
    });
}
function searchLocalUser(keyword) {
    return RendererHelper.invokeToMainProcess("_searchLocalUser", keyword);
}
function insertDeptInContact(deptData) {
    return RendererHelper.invokeToMainProcess("_insertDeptInContact", deptData);
}
function updateTeamUnitData(userData, userDeptData) {
    return RendererHelper.invokeToMainProcess("_updateTeamUnitData", userData, userDeptData);
}
function updateDeptSort(id, sort) {
    RendererHelper.sendToMainProcess("_updateDeptSort", id, sort);
}
function updateCurrentFidUsers(unitInfo) {
    return RendererHelper.invokeToMainProcess("_updateCurrentFidUsers", unitInfo);
}
function deleteDeptDataByDeptid(deptid) {
    return RendererHelper.invokeToMainProcess("_deleteDeptDataByDeptid", deptid);
}
function cacheMessageAudio(url) {
    return RendererHelper.invokeToMainProcess("_cacheMessageAudio", url);
}
function cacheMessageImage(url) {
    return RendererHelper.invokeToMainProcess("_cacheMessageImage", url);
}
function syncAllContacts(isFullUpdate) {
    return RendererHelper.invokeToMainProcess("_syncAllContacts", isFullUpdate);
}
function syncContacts(unitInfo, isFullUpdate = true) {
    return RendererHelper.invokeToMainProcess("_startSyncContact", unitInfo, isFullUpdate);
}
exports.syncContacts = syncContacts;
function searchLocalNotice(keyword, lastValue) {
    return RendererHelper.invokeToMainProcess("_searchLocalNotice", keyword, lastValue);
}
function updateNoticeFoldTag() {
    return RendererHelper.invokeToMainProcess("_updateNoticeFoldTag");
}
function syncAllNotice() {
    return RendererHelper.invokeToMainProcess("_syncAllNotice");
}
function syncNoticeDraft() {
    return RendererHelper.invokeToMainProcess("_syncNoticeDraft");
}
function searchLocalMeShieldData() {
    return RendererHelper.invokeToMainProcess("_searchLocalMeShieldData");
}
function searchLocalShieldMeData() {
    return RendererHelper.invokeToMainProcess("_searchLocalShieldMeData");
}
function deleteMineShieldData(puid) {
    return RendererHelper.invokeToMainProcess("_deleteMineShieldData", puid);
}
function syncAllBlacklist() {
    return RendererHelper.invokeToMainProcess("_syncAllBlacklist");
}
function updateTabBarList(tabBarIdList) {
    RendererHelper.sendToMainProcess("_updateTabBarList", tabBarIdList);
}
function expandMainMenu(expand) {
    RendererHelper.sendToMainProcess("_expandMainMenu", expand);
}
function visibleNetStateView(visible, netState) {
    RendererHelper.sendToMainProcess("_visibleNetStateView", visible, netState);
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
function useMode(mode) {
    ModeHelper.useMode(mode);
}
function changeDataFilePath(filePath) {
    RendererHelper.sendToMainProcess("_changeDataFilePath", filePath);
}
function getMessageDataSize() {
    return RendererHelper.invokeToMainProcess("_getMessageDataSize");
}
function clearMessageData() {
    RendererHelper.sendToMainProcess("_clearMessageData");
}
function getAppDownloadUrl() {
    return RendererHelper.invokeToMainProcess("_getAppDownloadUrl");
}
function getAppShowName() {
    return RendererHelper.invokeToMainProcess("_getAppShowName");
}
function uploadLogToCloudDisk() {
    return RendererHelper.invokeToMainProcess("_uploadLogToCloudDisk");
}
function getLanguage() {
    return RendererHelper.invokeToMainProcess("_getLanguage");
}
function showPersonInfoWindow(parms) {
    RendererHelper.sendToMainProcess("_showPersonInfoWindow", parms);
}
function updateStuShowRecord(parms) {
    return RendererHelper.invokeToMainProcess("_updateStuShowRecord", parms);
}
function setSendMsgKey(keys) {
    RendererHelper.sendToMainProcess("_setSendMsgKey", keys);
}
function setScreenShotKey(keys) {
    RendererHelper.sendToMainProcess("_setShotKey", keys);
}
function setOpenStudyKey(keys) {
    RendererHelper.sendToMainProcess("_setOpenStudyKey", keys);
}
function setKeyDefault(param) {
    RendererHelper.sendToMainProcess("_setKeyDefault", param);
}
function isShotConflict(keys) {
    return RendererHelper.invokeToMainProcess("_isShortcutConflict", keys);
}
function isOpenStudyConflict(keys) {
    return RendererHelper.invokeToMainProcess("_isOpenStudyConflict", keys);
}
function openShortcutKeys() {
    RendererHelper.sendToMainProcess("_openShortcutKeys");
}
function reloadView() {
    RendererHelper.sendToMainProcess("_refreshView");
}
function getClipboardFilePath() {
    return (0, ClipboardUtil_1.getClipboardFileInfos)();
}
exports.getClipboardFilePath = getClipboardFilePath;
function dragDownloadFile(data) {
    return RendererHelper.invokeToMainProcess("_downloadOper", {
        key: "dragItem",
        value: data,
    });
}
function uploadFileToCloudDisk(fileInfo, progressCallback) {
    return new Promise((resove, reject) => {
        if (!md5) {
            md5 = require("../utils/CryptoUtil").md5;
        }
        const fileId = md5(fileInfo.filePath || new Date().getTime().toString()) +
            "_" +
            new Date().getTime();
        RendererHelper.sendToMainProcess("_uploadFileToCloudDisk", fileInfo, fileId);
        const callbackKey = `_uploadFileToCloudDisk_progress_${fileId}`;
        electron_1.ipcRenderer.on(callbackKey, (event, data) => {
            if (data.state == "done") {
                electron_1.ipcRenderer.removeAllListeners(callbackKey);
                const resData = data.data;
                if (!resData) {
                    resove({ result: false });
                    return;
                }
                if (resData.success === false) {
                    resData.result = false;
                }
                resData.fileId = fileId;
                resove(resData);
            }
            else {
                progressCallback(data.alreadySendSize, data.totalSize, fileId);
            }
        });
    });
}
function uploadFolderToCloudDisk(filePath, progressCallback) {
    return new Promise((resove, reject) => {
        if (!md5) {
            md5 = require("../utils/CryptoUtil").md5;
        }
        const fileId = md5(filePath) + "_" + new Date().getTime();
        const callbackKey = `_uploadFolderToCloudDiskProgress_${fileId}`;
        RendererHelper.invokeToMainProcess("_uploadFolderToCloudDisk", filePath, fileId)
            .then((data) => {
            electron_1.ipcRenderer.removeAllListeners(callbackKey);
            const resData = data.data;
            if (!resData) {
                resove({ result: false, errCode: data?.errCode, fileId });
                return;
            }
            if (resData.success === false) {
                resData.result = false;
            }
            resove(data);
        })
            .catch((e) => {
            resove({ result: false });
        });
        electron_1.ipcRenderer.on(callbackKey, (event, data) => {
            progressCallback(data.alreadySendSize, data.totalSize, fileId);
        });
    });
}
function cancelUploadToCloudDisk(fileId) {
    (0, RendererHelper_1.sendToMainProcess)("_cancelUploadCloudDisk", fileId);
}
function loadFolderInfo(folderPath) {
    if (!loadFolderSizeInfo) {
        loadFolderSizeInfo = require("../utils/FileUtil").loadFolderSizeInfo;
    }
    return loadFolderSizeInfo(folderPath);
}
function changeMessagePopHeight(height) {
    RendererHelper.sendToMainProcess("_changeMessagePopHeight", height);
}
function openThisMessage(data) {
    RendererHelper.sendToMainProcess("_openThisMessage", data);
}
function getCloudVideoUrl(filed, objectid) {
    return RendererHelper.invokeToMainProcess("_getCloudVideoUrl", filed, objectid);
}
function getCloudDownloadUrl(data) {
    return RendererHelper.invokeToMainProcess("_getCloudDownloadUrl", data);
}
function getCloudExtFilesInfo(data) {
    return RendererHelper.invokeToMainProcess("_getCloudExtFilesInfo", data);
}
function getSupportPreviewSuffix() {
    return RendererHelper.invokeToMainProcess("_getSupportPreviewSuffix");
}
function getAtttPreviewRes(data) {
    return RendererHelper.invokeToMainProcess("_getAtttPreviewRes", data);
}
function getAttBelonger(data) {
    return RendererHelper.invokeToMainProcess("_getAttBelonger", data);
}
function readAloudText(text, callback) {
    const id = new Date().getTime() + "";
    const processKey = `_readAloudText_progress_${id}`;
    let ret = (0, RendererHelper_1.invokeToMainProcess)("_readAloudText", text, id).then((res) => {
        setTimeout(() => {
            electron_1.ipcRenderer.removeAllListeners(processKey);
        }, 100);
        return res;
    });
    electron_1.ipcRenderer.on(processKey, (event, resData) => {
        callback(resData);
    });
    return ret;
}
exports.readAloudText = readAloudText;
function sendQuestion(text) {
    return (0, RendererHelper_1.invokeToMainProcess)("_sendQuestion", text);
}
exports.sendQuestion = sendQuestion;
function getSystemPerformance() {
    return (0, RendererHelper_1.invokeToMainProcess)("_getSystemPerformance");
}
exports.getSystemPerformance = getSystemPerformance;
function openContactsPage() {
    RendererHelper.sendToMainProcess("_openContactsPage");
}
function openProjectionBox(data) {
    if (!ProjectionBoxHelper) {
        ProjectionBoxHelper = require("../module/projection/renderer/ProjectionBoxHelper");
    }
    ProjectionBoxHelper.openProjectionBox(data);
}
function audioCallTo(to) {
    (0, RendererHelper_1.sendToMainProcess)("_audioCallToUser", to);
}
async function getResourceDetailUrl(params) {
    const { resid, menuButtonControl, objectId } = params;
    if (!resid && !objectId) {
        return Promise.reject(new Error("resid or objectId is empty!"));
    }
    const searchParams = new URLSearchParams({
        menuButtonControl,
    });
    if (resid) {
        searchParams.append("resid", resid);
    }
    else if (objectId) {
        searchParams.append("objectId", objectId);
    }
    const url = `https://pan-yz.chaoxing.com/api/v2/getResourceDetailUrl?${searchParams.toString()}`;
    return await RendererHelper.invokeToMainProcess("_netRequestGetPanYz", url);
}
exports.getResourceDetailUrl = getResourceDetailUrl;
async function verifyActivationCode(code) {
    return (0, RendererHelper_1.invokeToMainProcess)("_verifyActivationCode", code);
}
exports.verifyActivationCode = verifyActivationCode;
function genOnlineFileWsToken(text) {
    return (0, RendererHelper_1.invokeToMainProcess)("_genOnlineFileWsToken", text);
}
async function getPcDeviceInfo() {
    return (0, RendererHelper_1.invokeToMainProcess)("_getPcDeviceInfo");
}
function sseChat(content, options) {
    return (0, RendererHelper_1.invokeToMainProcess)("_sseChat", content, options);
}
function deleteUserDownloadPptFiles() {
    RendererHelper.sendToMainProcess("_deleteUserDownloadPptFiles");
}
m_UseTimeLog.end("9");
const defaultExports = {
    appIsLogin,
    appLoginEnd,
    appLogOutAndLogin,
    changeAccountLogin,
    getUID,
    showTab,
    openLoginPage,
    selectSubTab,
    closeSubTab,
    openTabPanel,
    changeTabPanelHeight,
    closeWindowSubTab,
    selectWindowSubTab,
    getPriUser,
    getAccounts,
    removeAccount,
    createChatGroups,
    getImInfo,
    getPanToken,
    searchContactsAndStructureUser,
    genRequest,
    passportGenRequest,
    ucGenRequest,
    dataGenSign,
    meetOperate,
    fullscreenchange,
    checkAldDriver,
    installAldDriver,
    getTopTabId,
    downloadDiskFile,
    downloadDiskFolder,
    downloadGroupDiskFolder,
    downloadDiskMultiple,
    resumeDownload,
    pauseDownload,
    deleteDownload,
    showItemInFolder,
    openDownloadFile,
    getNewDownloadCount,
    clearNewDownloadCount,
    sendImMessage,
    screenshot,
    loadDownloadList,
    getTrayIcon,
    addSelfToChatGroup,
    openChatPage,
    getTrayIconMac1x,
    getTrayIconMac2x,
    setTrayIconMac,
    getAppSystemConfig,
    setAppSystemConfig,
    openNewSubTab,
    saveFileAs,
    saveLocalFileAs,
    showUpdateReadyPopLater,
    relaunchToNewVersion,
    openDownloadCenter,
    setDownloadPath,
    getDownloadPath,
    showTabItemMenu,
    tabBarMenuItemClick,
    checkNewVersion,
    onCheckedNewVersion,
    getTokenParms,
    getCxCookieStr,
    openDialogWidthMask,
    openWindowWidthMask,
    downloadAndOpenPptFile,
    searchLocalUser,
    syncAllContacts,
    syncContacts,
    updateTabBarList,
    searchLocalMeShieldData,
    searchLocalShieldMeData,
    deleteMineShieldData,
    syncAllBlacklist,
    checkDiskFileDownloadChanged,
    searchLocalNotice,
    updateNoticeFoldTag,
    syncAllNotice,
    syncNoticeDraft,
    expandMainMenu,
    visibleNetStateView,
    openSystemNetCenter,
    useMode,
    changeDataFilePath,
    getMessageDataSize,
    clearMessageData,
    getAppDownloadUrl,
    getAppShowName,
    uploadLogToCloudDisk,
    getLanguage,
    insertDeptInContact,
    updateTeamUnitData,
    updateDeptSort,
    updateCurrentFidUsers,
    deleteDeptDataByDeptid,
    showPersonInfoWindow,
    updateStuShowRecord,
    setSendMsgKey,
    setScreenShotKey,
    setOpenStudyKey,
    setKeyDefault,
    isShotConflict,
    isOpenStudyConflict,
    openShortcutKeys,
    reloadView,
    getClipboardFilePath,
    dragDownloadFile,
    uploadFileToCloudDisk,
    loadFolderInfo,
    changeMessagePopHeight,
    openThisMessage,
    uploadFolderToCloudDisk,
    getCloudVideoUrl,
    getCloudDownloadUrl,
    getCloudExtFilesInfo,
    getSupportPreviewSuffix,
    cacheMessageAudio,
    cacheMessageImage,
    readAloudText,
    sendQuestion,
    getSystemPerformance,
    cancelUploadToCloudDisk,
    getAtttPreviewRes,
    getAttBelonger,
    openContactsPage,
    openProjectionBox,
    audioCallTo,
    getResourceDetailUrl,
    verifyActivationCode,
    genOnlineFileWsToken,
    getPcDeviceInfo,
    sseChat,
    deleteUserDownloadPptFiles,
};
module.exports = defaultExports;
exports.default = defaultExports;
//# sourceMappingURL=MainWindowHelper.js.map