"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.on = exports.getDevConfig = exports.getCpuIdlePercentage = exports.checkAppMetrics = exports.devHelperInit = exports.isDevMode = exports.checkClientDevelopConfig = void 0;
const electron_1 = require("electron");
const RequestUtil_1 = require("../utils/RequestUtil");
const TokenUtil_1 = require("../utils/TokenUtil");
const UserHelper_1 = require("./UserHelper");
const child_process_1 = __importDefault(require("child_process"));
const Logger_1 = __importDefault(require("./Logger"));
const BrowserHelper_1 = require("./BrowserHelper");
const os_1 = __importDefault(require("os"));
const WinId_1 = __importDefault(require("../common/WinId"));
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const Logger_2 = require("./Logger");
const events_1 = require("events");
const TempStore_1 = require("../common/TempStore");
const DialogMainHelper_1 = require("./DialogMainHelper");
const crypto_1 = __importDefault(require("crypto"));
const DateUtil_1 = require("../utils/DateUtil");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const path = require("path");
const fs = require("fs");
const dateUtil = require("../utils/DateUtil");
const { uploadImmediately } = require("./LogUpload");
const appCfg = require("../config/appconfig.json");
const m_EventEmitter = new events_1.EventEmitter();
let m_IsDevMode = false;
let m_OfflineDevModeExpirationTime = 0;
let m_CancelDevModeTimer;
let m_LastPuid;
let m_LastCheckTime;
const m_AppMonitorLogger = (0, Logger_2.getAppMonitorLog)();
let m_AppMetricsTimer;
let m_DevHelperWindow;
let m_LastGetDevTypeTime = 0;
class DevConfig {
    constructor() {
        this.debugLog = false;
    }
}
const m_DevConfig = new DevConfig();
let m_LastMemoryAlertTime = 0;
let m_DisableMemoryAlert = false;
let m_ShortCutKey;
async function checkClientDevelopConfig() {
    return;
    if (!electron_1.app.isPackaged || appCfg.appMode == "fanya") {
        return;
    }
    let puid = (0, UserHelper_1.getUID)();
    let curTime = new Date().getTime();
    if (!puid || (m_LastPuid == puid && curTime - m_LastCheckTime < 5000)) {
        return;
    }
    m_LastPuid = puid;
    m_LastCheckTime = curTime;
    const url = `https://k.chaoxing.com/apis/develop/getClientDevelopConfig`;
    let parms = TokenUtil_1.TokenUtil.getRequestParams({
        url: "",
        getParams: {
            puid,
        },
        tokenSign: true,
    });
    let devConfig = await new RequestUtil_1.RequestUtil().get(`${url}${parms}`);
    if (devConfig.ok) {
        if (m_CancelDevModeTimer) {
            clearTimeout(m_CancelDevModeTimer);
            m_CancelDevModeTimer = undefined;
        }
        let data = await devConfig.json();
        if (data && data.result === 1 && data.data) {
            setDevMode(true);
            if (data.data.expireTime > 0) {
                const tempTime = data.data.expireTime - Date.now();
                if (tempTime > 0) {
                    if (tempTime < 1000 * 60 * 60) {
                        setTimeout(() => {
                            setDevMode(false);
                        }, tempTime);
                    }
                }
            }
            if (data.data.params) {
                let parms = JSON.parse(data.data.params);
                if (parms.debugLog) {
                    m_DevConfig.debugLog = true;
                    Logger_1.default.enableDebugLog(true);
                }
                else {
                    m_DevConfig.debugLog = false;
                    Logger_1.default.enableDebugLog(false);
                }
            }
        }
        else {
            setDevMode(false);
        }
    }
}
exports.checkClientDevelopConfig = checkClientDevelopConfig;
function setDevMode(devMode) {
    if (!devMode && m_OfflineDevModeExpirationTime - Date.now() > 0) {
        devMode = true;
    }
    m_IsDevMode = devMode;
    changeDevMode();
}
function isDevMode() {
    return m_IsDevMode;
}
exports.isDevMode = isDevMode;
function changeDevMode() {
    TempStore_1.TempStore.m_IsDevMode = m_IsDevMode;
    console.info("changeDevMode:", m_IsDevMode);
    if (m_IsDevMode) {
        if (m_ShortCutKey) {
            electron_1.globalShortcut.unregister(m_ShortCutKey);
        }
        electron_1.globalShortcut.register("CommandOrControl+Shift+Alt+D", () => {
            openDevHelperWindow();
        });
        electron_1.session.defaultSession.setProxy({ mode: "system" });
    }
    else {
        // if (m_ShortCutKey) {
        //     electron_1.globalShortcut.unregister(m_ShortCutKey);
        //     m_ShortCutKey = undefined;
        // }
        // electron_1.globalShortcut.unregister("CommandOrControl+Shift+Alt+D");
        // electron_1.session.defaultSession.setProxy({ mode: "direct" });
    }
}
function devHelperInit() {
    if (!electron_1.app.isPackaged || appCfg.appMode == "fanya") {
        // setDevMode(true);
        setDevMode(false);
    }
    else {
        setDevMode(false);
    }
    electron_1.globalShortcut.register("CommandOrControl+Shift+Alt+X", () => {
        checkClientDevelopConfig();
    });
    initAppMetricesLog();
}
exports.devHelperInit = devHelperInit;
(0, UserHelper_1.onUserLoginEnd)(() => {
    checkClientDevelopConfig();
});
setInterval(() => {
    checkClientDevelopConfig();
}, 1000 * 60 * 60);
function initAppMetricesLog() {
    m_AppMonitorLogger.info("\n\n\n\n\n===============================start log=================================\n");
}
function startCheckAppMetrics(keepTime) {
    stopCheckAppMetrics();
    m_AppMetricsTimer = setInterval(() => {
        checkAppMetrics();
    }, 1000);
    if (!keepTime || keepTime <= 0) {
        keepTime = 5 * 60 * 1000;
    }
    setTimeout(() => {
        stopCheckAppMetrics();
    }, keepTime);
}
function stopCheckAppMetrics() {
    if (m_AppMetricsTimer) {
        clearInterval(m_AppMetricsTimer);
        m_AppMetricsTimer = undefined;
        uploadImmediately();
    }
}
async function checkAppMetrics() {
    electron_1.app.getAppMetrics();
    const idleCpu = await getCpuIdlePercentage();
    let cpus = os_1.default.cpus();
    let sysInfos = {
        cpuCount: cpus.length,
        cpu: cpus[0],
        arch: os_1.default.arch(),
        totalMemory: Math.floor(os_1.default.totalmem() / 1024 / 1024),
        appVersion: electron_1.app.getVersion(),
        freeMemory: Math.floor(os_1.default.freemem() / 1024 / 1024),
        cpuUse: 100 - idleCpu,
        cpuIdle: idleCpu,
    };
    sysInfos.cpu.times = undefined;
    let proMetrics = electron_1.app.getAppMetrics();
    m_AppMonitorLogger.info("ProcessMetric:===============");
    let appMemory = 0;
    let appCpu = 0;
    proMetrics.forEach((proMetric) => {
        if (proMetric.type == "Browser" || proMetric.type == "Tab") {
            proMetric.webTag = (0, BrowserHelper_1.getWebIdByProcessId)(proMetric.pid);
        }
        proMetric.memory.workingSetSize = Math.floor(proMetric.memory.workingSetSize / 1024);
        proMetric.memory.privateBytes = Math.floor(proMetric.memory.privateBytes / 1024);
        proMetric.memory.peakWorkingSetSize = Math.floor(proMetric.memory.peakWorkingSetSize / 1024);
        appMemory += proMetric.memory.workingSetSize;
        appCpu += proMetric.cpu.percentCPUUsage;
        m_AppMonitorLogger.info("proMetrics:", JSON.stringify(proMetric));
    });
    sysInfos.appMemory = appMemory;
    sysInfos.appCpu = appCpu;
    if (process.platform == "darwin") {
        let macMemoryFreePercentage = getMacMemoryFreePercentage();
        sysInfos.macMemoryFreePercentage = macMemoryFreePercentage;
    }
    m_AppMonitorLogger.info("sysInfo:", JSON.stringify(sysInfos));
    if (sysInfos.freeMemory < 200 && process.platform == "win32") {
        showMemoryWarnDialog();
    }
    if (appMemory > 3 * 1024) {
        m_EventEmitter.emit("appMemoryToLarge");
    }
    let metricsData = { sysInfo: sysInfos, proMetrics };
    sendToDevHelperWindow(metricsData);
    appendDevTypeInfo();
    return metricsData;
}
exports.checkAppMetrics = checkAppMetrics;
function getMacMemoryFreePercentage() {
    if (process.platform == "darwin") {
        try {
            let stdout = child_process_1.default.execSync("memory_pressure", {
                encoding: "utf-8",
            });
            if (stdout) {
                let index = stdout.lastIndexOf(":");
                let percentage = stdout.substring(index + 1);
                index = percentage.indexOf("%");
                let percentageValue = percentage.substring(0, index);
                return percentageValue?.trim();
            }
        }
        catch (err) {
            console.error("getMacMemoryFreePercentageError:", err);
        }
    }
    return 0;
}
async function getCpuIdlePercentage() {
    let cpuInfo = os_1.default.cpus();
    const totalIdle = cpuInfo.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpuInfo.reduce((acc, cpu) => {
        let tick = 0;
        for (const type in cpu.times) {
            tick += cpu.times[type];
        }
        return acc + tick;
    }, 0);
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(1);
        }, 350);
    });
    cpuInfo = os_1.default.cpus();
    const totalIdle2 = cpuInfo.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick2 = cpuInfo.reduce((acc, cpu) => {
        let tick = 0;
        for (const type in cpu.times) {
            tick += cpu.times[type];
        }
        return acc + tick;
    }, 0);
    const idlePercentage = (totalIdle2 - totalIdle) / (totalTick2 - totalTick);
    return idlePercentage * 100;
}
exports.getCpuIdlePercentage = getCpuIdlePercentage;
async function autoCheckAppMetrics() {
    let metricsData = await checkAppMetrics();
    let waitTime = 60 * 1000;
    if (metricsData) {
        const freeMemoryPercentage = getFreeMemoryPercentage(metricsData.sysInfo);
        if (metricsData.sysInfo.cpuIdle < 5 ||
            freeMemoryPercentage < 5 ||
            metricsData.sysInfo.appMemory > 2048) {
            waitTime = 30 * 1000;
        }
        else if (metricsData.sysInfo.cpuIdle < 25 ||
            freeMemoryPercentage < 25 ||
            metricsData.sysInfo.appMemory > 1024) {
            waitTime = 60 * 1000;
        }
        else if (metricsData.sysInfo.cpuIdle < 40 || freeMemoryPercentage < 40) {
            waitTime = 120 * 1000;
        }
        else {
            waitTime = 180 * 1000;
        }
    }
    setTimeout(() => {
        autoCheckAppMetrics();
    }, waitTime);
}
function getFreeMemoryPercentage(sysInfo) {
    if (process.platform == "darwin") {
        return 50;
    }
    return (sysInfo.freeMemory * 100) / sysInfo.totalMemory;
}
function openDevHelperWindow() {
    if (m_DevHelperWindow && !m_DevHelperWindow.isDestroyed()) {
        m_DevHelperWindow.show();
        return;
    }
    let url = `sview:/#/processView`;
    m_DevHelperWindow = (0, BrowserHelper_1.createBrowserWindow)({
        id: WinId_1.default.DevHelperWindow,
        width: 900,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.DevHelperWindow, url),
        },
    });
    m_DevHelperWindow.on("closed", () => {
        m_DevHelperWindow = undefined;
    });
    m_DevHelperWindow.loadURL((0, LoadUrlHelper_1.getUrl)(url));
}
electron_1.ipcMain.on("_startCheckAppMetrics", (event, keepTime) => {
    startCheckAppMetrics(keepTime);
});
function sendToDevHelperWindow(data) {
    if (m_DevHelperWindow && !m_DevHelperWindow.isDestroyed()) {
        m_DevHelperWindow.webContents.send("appMetrics", data);
    }
}
function showMemoryWarnDialog() {
    if (m_DisableMemoryAlert) {
        return;
    }
    const dialogId = "MemoryWarnDialog";
    let curTime = new Date().getTime();
    if (curTime - m_LastMemoryAlertTime > 60 * 60 * 1000) {
        if ((0, BrowserHelper_1.getWindowInWindowMap)(dialogId)) {
            return;
        }
        m_LastMemoryAlertTime = curTime;
        let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
        (0, DialogMainHelper_1.openCommonDialog)(mainWin, {
            winConfig: {
                id: dialogId,
            },
            type: "confirm",
            backgroundColor: "#FFFFFF",
            content: "系统运行内存不足，可能会引起使用卡顿等问题，请清理后台应用",
            okBtn: "知道了",
            cancelBtn: "不再提示",
        }).then((data) => {
            if (data == "cancel") {
                m_DisableMemoryAlert = true;
            }
            m_LastMemoryAlertTime = new Date().getTime();
        });
    }
}
function appendDevTypeInfo() {
    let curTime = new Date().getTime();
    if (curTime - m_LastGetDevTypeTime > 2 * 60 * 60 * 1000) {
        m_LastGetDevTypeTime = curTime;
        m_AppMonitorLogger.info("devType==========>");
        m_AppMonitorLogger.info("systemVersion:", process.getSystemVersion());
        // try {
        //     let devTypeInfo;
        //     if (process.platform == "darwin") {
        //         devTypeInfo = child_process_1.default.execSync("system_profiler SPHardwareDataType", { encoding: "utf-8" });
        //     }
        //     else {
        //         devTypeInfo = child_process_1.default.execSync("wmic computersystem get Name, Manufacturer, Model, SystemType", { encoding: "utf-8" });
        //     }
        //     if (devTypeInfo) {
        //         m_AppMonitorLogger.info(devTypeInfo);
        //     }
        // }
        // catch (e) {
        //     console.warn(e);
        // }
        m_AppMonitorLogger.info("<==========devType end");
    }
}
function getDevConfig() {
    return m_DevConfig;
}
exports.getDevConfig = getDevConfig;
function on(key, listener) {
    m_EventEmitter.on(key, listener);
}
exports.on = on;
setTimeout(() => {
    autoCheckAppMetrics();
}, 5000);
function decrypt(encryptedText, key, iv) {
    const decipher = crypto_1.default.createDecipheriv("aes-256-cbc", Buffer.from(key, "utf8"), Buffer.from(iv, "hex"));
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
function decryptActivationCode(activationCode) {
    const key = "R2tPqkz3G8sL6wF7B2tPqkz3G8sL6wF7";
    const md5Key = "GxQpLzRwNb";
    const iv = activationCode.substring(0, 32);
    const encryptedText = activationCode.substring(32, activationCode.length - 32);
    const md5Enc = activationCode.substring(activationCode.length - 32);
    let curDate = (0, DateUtil_1.dateFormat)("yyyyMMdd");
    let tempText = (0, CryptoUtil_1.md5)(curDate + encryptedText + md5Key);
    if (tempText != md5Enc) {
        return;
    }
    return decrypt(encryptedText, key, iv);
}
electron_1.ipcMain.handle("_verifyActivationCode", (event, activationCode) => {
    if (activationCode?.length < 70) {
        return false;
    }
    let decryptedText = decryptActivationCode(activationCode);
    if (!decryptedText) {
        return false;
    }
    let decodeTexts = decryptedText.split("_");
    if (decodeTexts.length != 3) {
        return false;
    }
    const machineIdSync = require("../utils/MachineIdUtil").machineIdSync;
    let deviceCode = machineIdSync(true);
    let curDate = (0, DateUtil_1.dateFormat)("yyyyMMdd");
    let tempText = (0, CryptoUtil_1.md5)(deviceCode + curDate);
    if (tempText != decodeTexts[0]) {
        return false;
    }
    let tempTime = parseInt(decodeTexts[1]);
    let expirationDate = parseInt(decodeTexts[2]);
    m_OfflineDevModeExpirationTime = tempTime + expirationDate * 60 * 60 * 1000;
    if (Date.now() - tempTime > m_OfflineDevModeExpirationTime) {
        console.log("开发者工具激活码已过期");
        return false;
    }
    setDevMode(true);
    return true;
});
module.exports = {
    checkClientDevelopConfig,
    isDevMode,
    devHelperInit,
    getDevConfig,
    checkAppMetrics,
    getCpuIdlePercentage,
    on,
};
//# sourceMappingURL=DevHelper.js.map