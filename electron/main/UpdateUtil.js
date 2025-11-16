"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelDownloadSetupFile = exports.downloadSetupFile = exports.checkUpdateLater = exports.checkNewVersion = void 0;
const child_process_1 = __importDefault(require("child_process"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const StoreHelper_1 = __importDefault(require("./StoreHelper"));
const electron_1 = require("electron");
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const BrowserHelper_1 = require("./BrowserHelper");
const WinId_1 = __importDefault(require("../common/WinId"));
const MainHelper_1 = require("./MainHelper");
const AppSystemConfigMainHelper_1 = require("./AppSystemConfigMainHelper");
const appConfig = require("../config/appconfig.json");
let fullscreenHelper;
if (process.platform == "darwin") {
    fullscreenHelper = require("../../module/fullscreenHelper/mac/fullscreenHelper");
    let ret = fullscreenHelper.init();
    console.info("fullscreenHelper.init:", ret);
}
const { app, autoUpdater, session } = require("electron");
const axios = require("axios");
const sysStore = StoreHelper_1.default.getSystem();
let m_OnDownloadSetupFile;
let m_OnDownloadSetupFile2;
let m_CheckUpdateTimeout;
let m_relaunch = false;
const CheckUpdateTimeInterval = 2 * 60 * 60 * 1000;
let m_OnSetup = false;
let m_AlreadyShowUpdateReadyPop = false;
class NetCheckTimes {
    static pushTime(time) {
        if (NetCheckTimes.checkTimes.length > 3) {
            NetCheckTimes.checkTimes.splice(0, NetCheckTimes.checkTimes.length - 3);
        }
        if (!time) {
            time = Date.now();
        }
        NetCheckTimes.checkTimes.push(time);
    }
    static isRequestTooFrequently() {
        if (NetCheckTimes.checkTimes.length < 4) {
            return false;
        }
        const currentTime = Date.now();
        const oldestCheckTime = NetCheckTimes.checkTimes[0];
        const timeDifference = currentTime - oldestCheckTime;
        if (timeDifference < 20 * 60 * 1000) {
            return true;
        }
        return false;
    }
}
NetCheckTimes.checkTimes = [];
function execUpdateOnWin(filePath, setupDir, url, version) {
    return;
    if (m_OnSetup || !app.isPackaged) {
        return;
    }
    m_OnSetup = true;
    if (!fs_1.default.existsSync(setupDir)) {
        fs_1.default.mkdirSync(setupDir);
    }
    let md5fileUrl = url + ".md5";
    axios
        .get(md5fileUrl)
        .then((response) => {
        console.info("md5file:", response.data);
        if (response.status == 200) {
            if (verifyMd5(response.data, filePath)) {
                let fileName = path_1.default.basename(filePath);
                let newFilePath = path_1.default.join(setupDir, fileName);
                if (fs_1.default.existsSync(newFilePath)) {
                    fs_1.default.unlinkSync(newFilePath);
                }
                fs_1.default.copyFileSync(filePath, newFilePath);
                let baseName = path_1.default.basename(process.execPath, ".exe");
                let exeCmd = `"${newFilePath}" /S prevName=${baseName}`;
                let processHandle = child_process_1.default.exec(exeCmd);
                let hasError = false;
                processHandle.on("error", (err) => {
                    hasError = true;
                });
                processHandle.on("exit", (code, signal) => {
                    if (code === 0 && !hasError) {
                        fs_1.default.unlinkSync(newFilePath);
                        let curExePath = app.getPath("exe");
                        let setupDir = path_1.default.join(curExePath, `../../${version}`);
                        let newAppPath = path_1.default.join(setupDir, path_1.default.basename(curExePath));
                        if (!fs_1.default.existsSync(newAppPath)) {
                            newAppPath = path_1.default.join(setupDir, `${app.getName()}.exe`);
                            if (!fs_1.default.existsSync(newAppPath)) {
                                newAppPath = undefined;
                            }
                        }
                        if (newAppPath) {
                            if ((0, AppSystemConfigMainHelper_1.getAppSystemConfig)().openAtOsLogin === true) {
                                app.setLoginItemSettings({
                                    openAtLogin: false,
                                });
                                app.setLoginItemSettings({
                                    openAtLogin: true,
                                    path: newAppPath,
                                });
                            }
                            setAppSystemConfig("updateVesionTo", version);
                            m_AlreadyShowUpdateReadyPop = false;
                            checkUpdateLater(10000);
                        }
                    }
                    m_OnSetup = false;
                });
            }
            else {
                fs_1.default.unlink(filePath, () => { });
            }
        }
        else {
            m_OnSetup = false;
        }
    })
        .catch((e) => {
        console.warn(e);
        m_OnSetup = false;
    });
}
function setupOnMac(filePath, version, url) {
    autoUpdater.on("error", (error) => {
        console.error("setupOnMacError", error);
    });
    autoUpdater.once("checking-for-update", () => {
        console.log("checking-for-update");
    });
    autoUpdater.once("update-available", () => {
        console.log("update-available");
    });
    autoUpdater.once("update-downloaded", (event) => {
        console.log("update-downloaded success");
        setAppSystemConfig("updateVesionTo", version);
        checkUpdateLater(10000);
    });
    let feedFile = path_1.default.join(filePath, "../feed.json");
    const jsonData = { url: `file://${encodeURI(filePath)}` };
    fs_1.default.writeFileSync(feedFile, JSON.stringify(jsonData));
    let feedUrl = encodeURI(`file://${feedFile}`);
    console.log("feedUrl:", feedUrl);
    autoUpdater.setFeedURL({ url: feedUrl });
    autoUpdater.checkForUpdates();
}
function setupOnWin(filePath, version, url) {
    let setupDir = path_1.default.join(app.getPath("exe"), `../../${version}`);
    execUpdateOnWin(filePath, setupDir, url, version);
}
function verifyMd5(md5Data, filePath) {
    if (process.platform == "win32") {
        let osVersions = os_1.default.release().split(".");
        if (osVersions.length > 0) {
            if (parseInt(osVersions[0]) <= 6) {
                return true;
            }
        }
    }
    if (md5Data) {
        let fileStat = fs_1.default.statSync(filePath);
        if (fileStat.size == md5Data.fileLength) {
            let md5Cmd = `certutil -hashfile "${filePath}" md5`;
            let md5CodeStr = child_process_1.default.execSync(md5Cmd, { encoding: "utf-8" });
            let md5Code = md5CodeStr.split("\n")[1].replace("\r", "");
            if (md5Code === md5Data.md5Code) {
                return true;
            }
        }
    }
    return false;
}
function delOtherFolder(curVersion) {
    if (process.platform != "win32") {
        return;
    }
    let versions = curVersion.split(".");
    if (versions.length == 3 || versions.length == 4) {
        let newVersion;
        let appCfg = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
        if (appCfg.updateVesionTo) {
            return;
        }
        let pDir = path_1.default.join(app.getPath("exe"), "../..");
        let dirs = fs_1.default.readdirSync(pDir);
        dirs.forEach((dir) => {
            let versions2 = dir.split(".");
            if (versions.length === versions2.length) {
                for (let i = 0; i < versions.length; i++) {
                    if (versions2[i] < versions[i]) {
                        delFolder(path_1.default.join(pDir, dir));
                        break;
                    }
                    else if (versions2[i] > versions[i]) {
                        break;
                    }
                }
            }
        });
        return true;
    }
    return false;
}
function delFolder(dir) {
    let cmd;
    if (process.platform == "darwin") {
        cmd = "rm -R " + dir;
    }
    else {
        cmd = `rmdir /Q /S "${dir}"`;
    }
    console.info("delFolder:", cmd);
    child_process_1.default.exec(cmd, { encoding: "utf-8" });
}
function checkNewVersion(fromAbout = false) {
    console.info(`checkNewVersion:fromAbout:${fromAbout}`);
    return Promise.reject();
    checkUpdateLater(60 * 60 * 1000);
    let pms = new Promise((resolve, reject) => {
        let appCfg = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
        let autoUpdate = appCfg.autoUpdate === false ? 0 : 1;
        let skip_version = appCfg.skipVersion || "";
        if (appConfig.appMode == "fyketang" && appConfig.fyketang?.domain) {
            autoUpdate = (0, MainHelper_1.getSysStore)("autoUpdate");
            if (autoUpdate == undefined) {
                autoUpdate = 1;
            }
            skip_version = (0, MainHelper_1.getSysStore)("skipVersion") || "";
        }
        else if (appConfig.appMode == "fanya") {
            if (appCfg.autoLogin == undefined) {
                appCfg.autoLogin = true;
            }
        }
        let curVersion = app.getVersion().replace("-", ".");
        let autoUpdateStatus = 0;
        let afterUpdateVersion = "";
        if (appCfg.updateVesionTo) {
            if (process.platform == "win32") {
                let newAppPath = getNewVersionExeFile();
                if (newAppPath) {
                    if (curVersion == appCfg.updateVesionTo) {
                        autoUpdateStatus = 1;
                    }
                    else if (compareVersion(curVersion, appCfg.updateVesionTo) < 0) {
                        autoUpdateStatus = 2;
                        afterUpdateVersion = appCfg.updateVesionTo;
                    }
                }
                else {
                    setAppSystemConfig("updateVesionTo", "");
                }
            }
            else {
                if (curVersion == appCfg.updateVesionTo) {
                    autoUpdateStatus = 1;
                }
                else if (compareVersion(curVersion, appCfg.updateVesionTo) < 0) {
                    autoUpdateStatus = 2;
                    afterUpdateVersion = appCfg.updateVesionTo;
                }
            }
        }
        let onMeeting = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID) != undefined ? 1 : 0;
        if (process.platform == "win32") {
            delOtherFolder(curVersion);
        }
        if (!appCfg.updateVesionTo) {
            appCfg.updateVesionTo = "";
        }
        let url = `https://k.chaoxing.com/apis/study/checkVersionInfo?skipVersion=${skip_version}&autoUpdate=${autoUpdate}&autoUpdateStatus=${autoUpdateStatus}&afterUpdateVersion=${afterUpdateVersion}&onMeeting=${onMeeting}&appMode=${appConfig.appMode}`;
        if (fromAbout) {
            url += `&clickAboutTag=1`;
        }
        if (m_AlreadyShowUpdateReadyPop) {
            url += `&showReadyPop=1`;
        }
        if (appConfig.appMode == "fyketang" && appConfig.fyketang?.domain) {
            url = `${appConfig.fyketang.domain}/apis/meet/getGlobalConfig?skipVersion=${skip_version}&autoUpdate=${autoUpdate}&autoUpdateSuccess=${autoUpdateStatus == 1 || autoUpdateStatus == 2 ? 1 : 0}&autoUpdateStatus=${autoUpdateStatus}&afterUpdateVersion=${afterUpdateVersion}`;
        }
        console.log("检查更新url:", url);
        if (!fromAbout) {
            if (NetCheckTimes.isRequestTooFrequently()) {
                console.warn("检查更新接口调用异常频繁");
                return;
            }
            NetCheckTimes.pushTime();
        }
        let netRequest = electron_1.net.request({ url, useSessionCookies: true });
        netRequest.on("response", (response) => {
            console.info("checkVersionInfo response.statusCode:", response.statusCode);
            if (response.statusCode == 200) {
                let resBuffer;
                response.on("data", (chunck) => {
                    if (!resBuffer) {
                        resBuffer = chunck;
                    }
                    else {
                        resBuffer = Buffer.concat([resBuffer, chunck]);
                    }
                });
                response.on("end", () => {
                    if (!resBuffer) {
                        checkUpdateLater(60 * 60 * 1000);
                        reject();
                        return;
                    }
                    try {
                        let resData = JSON.parse(resBuffer.toString());
                        if (resData.result === 1) {
                            checkUpdateLater();
                            handleCheckUpdateResult(resData.data);
                            resolve((0, MainHelper_1.getTempStore)("appVersionInfo"));
                        }
                        else {
                            checkUpdateLater(60 * 60 * 1000);
                            reject();
                        }
                    }
                    catch (err) {
                        console.error("checkNewVersion 版本检查更新返回值解析错误：", err);
                        reject();
                    }
                });
                response.on("error", () => {
                    checkUpdateLater(60 * 60 * 1000);
                    reject();
                });
            }
        });
        netRequest.end();
    });
    return pms;
}
exports.checkNewVersion = checkNewVersion;
function handleCheckUpdateResult(data) {
    (0, MainHelper_1.setTempStore)("CheckUpdateResult", data);
    if (appConfig.appMode == "fyketang" && appConfig.fyketang?.domain) {
        return handleFyktCheckUpdateResult(data);
    }
    console.log("handleCheckUpdateResult:", JSON.stringify(data));
    if (!data) {
        return;
    }
    if (compareVersion(data.currInfo?.currentVersion, data.onLineVersionInfo?.version) >= 0) {
        setAppSystemConfig("updateVesionTo", undefined);
    }
    let versionFlag = 0;
    if (data.reasonType == "skip" || data.reasonType == "outTime") {
        versionFlag = 1;
    }
    else if (data.reasonType == "newer" || data.reasonType == "latest") {
        versionFlag = 2;
    }
    let appVersionInfo = {
        versionFlag,
        onLineVersionInfo: data.onLineVersionInfo,
        currInfo: data.currInfo,
    };
    let appCfg = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
    if (data.type !== "NEED_AUTO_UPDATE" && appConfig.appMode == "fanya") {
        data.type = "NO_POP";
    }
    if (data.type == "NO_POP") {
        if (compareVersion(data.currInfo?.currentVersion, appCfg.updateVesionTo) < 0) {
            checkUpdateLater(1 * 60 * 60 * 1000);
        }
    }
    else if (data.type == "NEED_AUTO_UPDATE") {
        if (!app.isPackaged) {
            return;
        }
        autoDownloadSetupFile(data.onLineVersionInfo?.downloadurl, data.onLineVersionInfo?.version);
        appVersionInfo.versionFlag = 1;
    }
    else if (data.type == "NEED_UPDATE_MESSAGE_POP" ||
        data.type == "NEED_UPDATE_SUCCESS_POP" ||
        data.type == "NEED_UPDATE_READY_POP") {
        showUpdateWindow(data);
        if (data.type == "NEED_UPDATE_SUCCESS_POP") {
            appVersionInfo.versionFlag = 2;
        }
        else {
            appVersionInfo.versionFlag = 1;
        }
    }
    (0, MainHelper_1.setTempStore)("appVersionInfo", appVersionInfo);
}
function handleFyktCheckUpdateResult(data) {
    console.log("handleFyktCheckUpdateResult:", JSON.stringify(data));
    if (!data) {
        return;
    }
    if (data.type == "NO_POP") {
        return;
    }
    let curVersion = app.getVersion().replace("-", ".");
    (0, MainHelper_1.setTempStore)("fudanUpdate", undefined);
    if (data.type == "NEED_AUTO_UPDATE") {
        if (compareVersion(curVersion, data.version) >= 0) {
            setAppSystemConfig("updateVesionTo", undefined);
            return;
        }
        autoDownloadSetupFile(data.downloadUrl, data.version);
    }
    else if (data.type == "NEED_UPDATE_MESSAGE_POP" ||
        data.type == "NEED_UPDATE_SUCCESS_POP") {
        let fudanUpdate = false;
        if (data.flag == "fudan" && data.type == "NEED_UPDATE_MESSAGE_POP") {
            autoDownloadSetupFile(data.downloadUrl, data.version);
            (0, MainHelper_1.setTempStore)("fudanUpdate", true);
            fudanUpdate = true;
        }
        let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
        const winId = data.type;
        let url = appConfig.fyketang.domain + data.popUrl;
        let preloadPath = (0, LoadUrlHelper_1.getPreloadJs)(winId, "https://k.chaoxing.com/");
        let winOption = data.windowOption;
        winOption.id = winId;
        winOption.parent = mainWin;
        if (fudanUpdate) {
            winOption.modal = true;
        }
        winOption.webPreferences = {
            preload: preloadPath,
            contextIsolation: true,
        };
        let win = (0, BrowserHelper_1.createBrowserWindow)(winOption);
        win.webContents.loadURL(url);
    }
}
function showUpdateWindow(data) {
    const windowId = data.type;
    console.log("showUpdateWindow: windowId", windowId);
    const existingWindow = (0, BrowserHelper_1.getWindowInWindowMap)(windowId);
    if (existingWindow && !existingWindow.isDestroyed()) {
        return;
    }
    let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
    let win = (0, BrowserHelper_1.createBrowserWindow)({
        id: data.type,
        width: 434,
        height: 396,
        parent: mainWin,
        transparent: true,
        frame: false,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: (0, LoadUrlHelper_1.getPreloadJs)(data.type, "sview://"),
        },
    });
    win.on("ready-to-show", () => {
        if (process.platform == "win32") {
            win.blur();
            setTimeout(() => {
                win.focus();
            }, 1);
        }
    });
    win.webContents.on("did-start-loading", () => {
        win.webContents.send("ready", data);
    });
    let url = (0, LoadUrlHelper_1.getUrl)("sview:/#/checkVersion");
    win.webContents.loadURL(url);
    if ("NEED_UPDATE_READY_POP" == windowId) {
        win.on("closed", () => {
            m_AlreadyShowUpdateReadyPop = true;
        });
    }
}
function setAppSystemConfig(key, value) {
    let cfg = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
    cfg[key] = value;
    StoreHelper_1.default.getSystem().set("appSystemConfig", cfg);
}
function getLocalSetupFilePath(url, userUpdate = false) {
    let fileDir = path_1.default.join(app.getPath("userData"), "files/setup/");
    if (userUpdate) {
        fileDir = path_1.default.join(app.getPath("userData"), "files/setup_user/");
    }
    if (!fs_1.default.existsSync(fileDir)) {
        fs_1.default.mkdirSync(fileDir, { recursive: true });
    }
    let filename = path_1.default.basename(url);
    let files = fs_1.default.readdirSync(fileDir);
    files.forEach((file) => {
        if (file != filename) {
            const filePath = path_1.default.join(fileDir, file);
            if (fs_1.default.statSync(filePath)?.isFile()) {
                if (process.platform == "darwin") {
                    let cmd = `rm -R '${filePath}'`;
                    child_process_1.default.execSync(cmd, { encoding: "utf-8" });
                }
                else {
                    fs_1.default.unlinkSync(filePath);
                }
            }
        }
    });
    return path_1.default.join(fileDir, filename);
}
function autoDownloadSetupFile(url, version) {
    return // 禁止自动更新。
    console.log(`开启自动更新下载文件：autoDownloadSetupFile:url:${url},version:${version},m_OnDownloadSetupFile:${m_OnDownloadSetupFile}`);
    if (m_OnDownloadSetupFile || !url) {
        return;
    }
    if (process.platform === "win32") {
        url = url.replace(".exe", "_update.exe");
    }
    else {
        url = url.replace(".dmg", ".zip");
    }
    let filePath = getLocalSetupFilePath(url);
    console.log("filePath:", filePath);
    if (fs_1.default.existsSync(filePath) && process.platform == "win32") {
        setupApp(filePath, version, url);
    }
    else {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        let tempFilePath = filePath + ".tmp";
        if (fs_1.default.existsSync(tempFilePath)) {
            fs_1.default.unlinkSync(tempFilePath);
        }
        let wstream = fs_1.default.createWriteStream(tempFilePath, { flags: "a" });
        let netRequest = electron_1.net.request({ url, useSessionCookies: true });
        m_OnDownloadSetupFile = filePath;
        netRequest.on("response", (response) => {
            response.on("data", (chunk) => {
                wstream.write(chunk);
            });
            response.on("end", () => {
                console.log("autoDownloadSetupFile download end:");
                wstream.end();
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
                fs_1.default.renameSync(tempFilePath, filePath);
                m_OnDownloadSetupFile = undefined;
                setupApp(filePath, version, url);
            });
            response.on("error", () => {
                m_OnDownloadSetupFile = undefined;
                if (fs_1.default.existsSync(tempFilePath)) {
                    fs_1.default.unlinkSync(tempFilePath);
                }
                console.log("autoDownloadSetupFile response error:");
            });
        });
        netRequest.on("error", () => {
            m_OnDownloadSetupFile = undefined;
            if (fs_1.default.existsSync(tempFilePath)) {
                fs_1.default.unlinkSync(tempFilePath);
            }
            console.log("autoDownloadSetupFile request error:");
        });
        netRequest.end();
    }
}
function setupApp(filePath, version, url) {
    if (process.platform === "darwin") {
        setupOnMac(filePath, version, url);
    }
    else {
        setupOnWin(filePath, version, url);
    }
}
function compareVersion(version1, version2) {
    if (version1 == version2) {
        return 0;
    }
    if (!version1) {
        return -1;
    }
    if (!version2) {
        return 1;
    }
    let ver1 = version1.split(".");
    if (ver1.length < 3 || ver1.length > 4) {
        return -1;
    }
    if (ver1.length == 3) {
        ver1.push("0");
    }
    let ver2 = version2.split(".");
    if (ver2.length < 3 || ver2.length > 4) {
        return 1;
    }
    if (ver2.length == 3) {
        ver2.push("0");
    }
    for (let i = 0; i < 4; i++) {
        if (parseInt(ver1[i]) < parseInt(ver2[i])) {
            return -1;
        }
        else if (parseInt(ver1[i]) > parseInt(ver2[i])) {
            return 1;
        }
    }
    return 0;
}
function checkUpdateLater(timeInterval = 0, isPowerMonitor = false, isClose = false) {
    if (m_CheckUpdateTimeout) {
        clearTimeout(m_CheckUpdateTimeout);
        m_CheckUpdateTimeout = undefined;
    }
    if (isPowerMonitor || isClose) {
        const existingWindow = (0, BrowserHelper_1.getWindowInWindowMap)("NEED_UPDATE_MESSAGE_POP") ||
            (0, BrowserHelper_1.getWindowInWindowMap)("NEED_UPDATE_SUCCESS_POP") ||
            (0, BrowserHelper_1.getWindowInWindowMap)("NEED_UPDATE_READY_POP");
        if (existingWindow && !existingWindow.isDestroyed()) {
            existingWindow.close();
        }
        if (isPowerMonitor) {
            return;
        }
    }
    if (timeInterval <= 0) {
        timeInterval = CheckUpdateTimeInterval;
    }
    m_CheckUpdateTimeout = setTimeout(() => {
        checkNewVersion();
    }, timeInterval);
}
exports.checkUpdateLater = checkUpdateLater;
electron_1.ipcMain.on("_showUpdateReadyPopLater", (event, timeInterval = 0) => {
    checkUpdateLater(timeInterval);
});
function getNewVersionExeFile() {
    let appCfg = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
    if (!appCfg.updateVesionTo) {
        return;
    }
    let curExePath = app.getPath("exe");
    let setupDir = path_1.default.join(curExePath, `../../${appCfg.updateVesionTo}`);
    let newAppPath = path_1.default.join(setupDir, path_1.default.basename(curExePath));
    if (!fs_1.default.existsSync(newAppPath)) {
        let newCfgPath = path_1.default.join(setupDir, "resources/app/electron/config/appconfig.json");
        if (fs_1.default.existsSync(newCfgPath)) {
            let newCfgData = require(newCfgPath);
            if (newCfgData?.exeName) {
                newAppPath = path_1.default.join(setupDir, newCfgData.exeName);
            }
        }
    }
    if (fs_1.default.existsSync(newAppPath)) {
        return newAppPath;
    }
}
electron_1.ipcMain.on("_relaunchToNewVersion", () => {
    console.log("重启到新版本客户端");
    if (process.platform == "darwin") {
        m_relaunch = true;
        (0, MainHelper_1.setSysStore)("relaunchAppTime", Date.now());
        autoUpdater.quitAndInstall();
        setAppSystemConfig("updateVesionTo", undefined);
        setTimeout(() => {
            app.exit();
        }, 300);
    }
    else {
        let newAppPath = getNewVersionExeFile();
        if (newAppPath) {
            setAppSystemConfig("updateVesionTo", undefined);
            (0, MainHelper_1.setSysStore)("relaunchAppTime", Date.now());
            app.exit();
            electron_1.shell.openPath(newAppPath);
        }
    }
});
app.on("before-quit", (event) => {
    if (process.platform == "darwin") {
        console.log(`before-quit:m_relaunch:${m_relaunch}`);
        if (!m_relaunch) {
            let appCfg = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
            if (!appCfg.updateVesionTo) {
                return;
            }
            let curVersion = app.getVersion().replace("-", ".");
            if (fullscreenHelper &&
                compareVersion(curVersion, appCfg.updateVesionTo) < 0) {
                console.log(`fullscreenHelper.changeAutoUpdate(0);`);
                fullscreenHelper.changeAutoUpdate(0);
                try {
                    autoUpdater.quitAndInstall();
                }
                catch (e) {
                    console.warn("quitAndInstall error:", e);
                }
            }
        }
    }
});
electron_1.ipcMain.handle("_checkNewVersion", (event, fromAbout) => {
    return checkNewVersion(fromAbout)?.catch((e) => {
        return undefined;
    });
});
let m_CancelDownloadSetupFile = false;
async function downloadSetupFile(url, callback) {
    console.log(`开启课堂自动更新下载文件：downloadSetupFile：url:${url},m_OnDownloadSetupFile2:${m_OnDownloadSetupFile2}`);
    if (m_OnDownloadSetupFile2 || !url) {
        return { result: -1 };
    }
    m_CancelDownloadSetupFile = false;
    if (process.platform === "win32") {
    }
    else {
        url = url.replace(".dmg", ".zip");
    }
    let filePath = getLocalSetupFilePath(url, true);
    console.log("filePath:", filePath);
    if (fs_1.default.existsSync(filePath)) {
        startSetupApp(filePath);
        return { result: 2 };
    }
    else {
        let tempFilePath = filePath + ".tmp";
        if (fs_1.default.existsSync(tempFilePath)) {
            fs_1.default.unlinkSync(tempFilePath);
        }
        let wstream = fs_1.default.createWriteStream(tempFilePath, { flags: "a" });
        let netRequest = electron_1.net.request({ url, useSessionCookies: true });
        m_OnDownloadSetupFile2 = filePath;
        const downloadProgress = { curProgress: 0, totoalSize: 0 };
        return new Promise((resolve, reject) => {
            netRequest.on("response", (response) => {
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    resolve({ result: -1 });
                }
                let contentLength = 0;
                try {
                    contentLength = parseInt(response.headers["content-length"]);
                }
                catch (e) { }
                downloadProgress.totoalSize = contentLength;
                response.on("data", (chunk) => {
                    wstream.write(chunk);
                    downloadProgress.curProgress += chunk.length;
                    callback(downloadProgress.curProgress, downloadProgress.totoalSize);
                });
                response.on("end", () => {
                    wstream.end();
                    if (fs_1.default.existsSync(filePath)) {
                        fs_1.default.unlinkSync(filePath);
                    }
                    fs_1.default.renameSync(tempFilePath, filePath);
                    m_OnDownloadSetupFile2 = undefined;
                    startSetupApp(filePath);
                    resolve({ result: 1 });
                });
                response.on("error", () => {
                    m_OnDownloadSetupFile2 = undefined;
                    if (fs_1.default.existsSync(tempFilePath)) {
                        fs_1.default.unlinkSync(tempFilePath);
                    }
                    resolve({ result: -1 });
                });
            });
            netRequest.on("error", () => {
                m_OnDownloadSetupFile2 = undefined;
                if (fs_1.default.existsSync(tempFilePath)) {
                    fs_1.default.unlinkSync(tempFilePath);
                }
                resolve({ result: -1 });
            });
            netRequest.end();
        });
    }
}
exports.downloadSetupFile = downloadSetupFile;
function cancelDownloadSetupFile() {
    m_CancelDownloadSetupFile = true;
}
exports.cancelDownloadSetupFile = cancelDownloadSetupFile;
function startSetupApp(filePath) {
    if (m_CancelDownloadSetupFile) {
        return;
    }
    if (process.platform == "darwin") {
        startSetupOnMac(filePath);
    }
    else {
        electron_1.shell.openPath(filePath);
    }
}
function startSetupOnMac(filePath) {
    autoUpdater.on("error", (error) => {
        console.error("setupOnMacError", error);
    });
    autoUpdater.once("checking-for-update", () => {
        console.log("checking-for-update");
    });
    autoUpdater.once("update-available", () => {
        console.log("update-available");
    });
    autoUpdater.once("update-downloaded", (event) => {
        console.log("update-downloaded success");
        setTimeout(() => {
            autoUpdater.quitAndInstall();
        }, 100);
    });
    let feedFile = path_1.default.join(filePath, "../feed.json");
    const jsonData = { url: `file://${encodeURI(filePath)}` };
    fs_1.default.writeFileSync(feedFile, JSON.stringify(jsonData));
    let feedUrl = encodeURI(`file://${feedFile}`);
    console.log("feedUrl:", feedUrl);
    autoUpdater.setFeedURL({ url: feedUrl });
    autoUpdater.checkForUpdates();
}
module.exports = {
    checkNewVersion,
    checkUpdateLater,
    downloadSetupFile,
    startSetupApp,
    cancelDownloadSetupFile,
};
exports.default = module.exports;
//# sourceMappingURL=UpdateUtil.js.map