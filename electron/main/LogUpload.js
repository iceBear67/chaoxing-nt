"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetCrashUUID = exports.uploadLogToCloudDisk = exports.uploadImmediately = exports.startAutoUpload = void 0;
const CloudDiskHelper_1 = require("./CloudDiskHelper");
const UserHelper_1 = require("./UserHelper");
const electron_1 = require("electron");
const compressing = require("compressing");
const sessionCookie = require("./SessionCookie");
const logger = require("./Logger");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DateUtil_1 = require("../utils/DateUtil");
const NetUtil_1 = require("./util/NetUtil");
const TokenUtil_1 = require("../utils/TokenUtil");
const MainHelper_1 = require("./MainHelper");
const StoreKey_1 = require("../common/StoreKey");
const uuid_1 = require("uuid");
const child_process = require("child_process");
const { SpecialpackOut } = require("../out/specialpack/SpecialpackOut");
const dateUtil = require("../utils/DateUtil");
const appConfig = require("../config/appconfig.json");
let m_lastUploadTime = 0;
let m_lastUploadTime2 = 0;
const CHECK_LOG_INTERVAL_FROM_WEB = 10 * 60 * 1000;
let m_lastCheckFromWebTime = 0;
class LogUpload {
    constructor(logPath) {
        if (logPath) {
            this.m_logPath = logPath;
        }
        this.checkUpload();
        setInterval(() => {
            this.checkUpload();
        }, 60 * 1000);
    }
    checkUpload() {
        if (!this.m_logPath) {
            return;
        }
        try {
            this.removeOldZips();
        }
        catch (e) {
            console.error("removeOldZips error:", e);
        }
        let reason = logger.getUploadLogReason();
        if (reason > 0) {
        }
        else {
            let curTime = new Date().getTime();
            if (curTime - m_lastCheckFromWebTime < CHECK_LOG_INTERVAL_FROM_WEB) {
                return;
            }
            sessionCookie.getUID().then((uid) => {
                if (uid) {
                    const productId = parseInt(this.getProductIdFromUa());
                    if (isNaN(productId)) {
                        return;
                    }
                    SpecialpackOut.getUploadLogStatus(uid).then((res) => {
                        if (!res || res.result == 0) {
                            return;
                        }
                        m_lastCheckFromWebTime = curTime;
                        if (res.data?.status) {
                            console.log("检测到需要上传日志文件，开始准备上传日志");
                            uploadToNewBackEnd(1, res.data);
                        }
                    });
                }
            });
        }
    }
    removeOldZips() {
        if (this.m_logPath) {
            let zipDir = path_1.default.join(this.m_logPath, "..");
            let childFiles = fs_1.default.readdirSync(zipDir, { encoding: "utf8" });
            let curTime = new Date().getTime();
            if (childFiles && childFiles.length > 0) {
                childFiles.forEach((file) => {
                    if (file.startsWith("cxstudy_windows_") ||
                        file.startsWith("ketang_windows_") ||
                        file.startsWith("cxstudy_mac_") ||
                        file.startsWith("ketang_mac_")) {
                        let filePath = path_1.default.join(zipDir, file);
                        let stats = fs_1.default.statSync(filePath);
                        if (stats.isFile()) {
                            if (file.endsWith(".zip")) {
                                if (curTime - stats.mtimeMs > 120 * 1000) {
                                    console.log("removeOldZips:" + file);
                                    fs_1.default.unlinkSync(filePath);
                                }
                            }
                        }
                        else if (stats.isDirectory()) {
                            if (curTime - stats.mtimeMs > 120 * 1000) {
                                let cmd = "";
                                if (process.platform == "darwin") {
                                    cmd = `rm -R "${filePath}"`;
                                }
                                else {
                                    cmd = `rmdir /Q /S "${filePath}"`;
                                }
                                this.m_zipFilePath = undefined;
                                let ret = child_process.execSync(cmd, { encoding: "utf-8" });
                                console.log(ret);
                            }
                        }
                    }
                });
            }
        }
    }
    renameCrashFiles(crashPath) {
        if (!fs_1.default.existsSync(crashPath)) {
            return;
        }
        const files = fs_1.default.readdirSync(crashPath);
        if (files.length > 0) {
            files.forEach((file) => {
                let filePath = path_1.default.join(crashPath, file);
                let stat = fs_1.default.statSync(filePath);
                if (stat.isFile()) {
                    if (file.endsWith(".dmp") && !file.includes("__")) {
                        let skipFile = false;
                        for (let file2 of files) {
                            if (file2.endsWith(`__${file}`)) {
                                skipFile = true;
                                break;
                            }
                        }
                        if (!skipFile) {
                            const updateTime = (0, DateUtil_1.dateFormat)("yyyyMMdd_HHmmss", stat.mtime);
                            const newFilePath = path_1.default.join(crashPath, `${updateTime}__${file}`);
                            fs_1.default.copyFileSync(filePath, newFilePath);
                        }
                    }
                }
                else if (stat.isDirectory()) {
                    this.renameCrashFiles(filePath);
                }
            });
        }
    }
    upload(type, detail, days = 7, crashWinId) {
        console.log("upload logs：", type);
        let curTime = new Date().getTime();
        if (type != 6 && curTime - m_lastUploadTime < 60000) {
            return;
        }
        m_lastUploadTime = curTime;
        let pms = new Promise((resolve, reject) => {
            sessionCookie.getUID().then((uid) => {
                if (uid) {
                    this.renameCrashFiles(this.m_logPath);
                    this.zipLogs(uid, this.m_logPath, type, days)
                        .then((logFile) => {
                        this.uploadFile(uid, type, logFile)
                            .then((data) => {
                            console.info("uploadFile_data:", data);
                            logger.afterUploadLog();
                            this.afterUploadSuccess();
                            resolve(true);
                            setTimeout(() => {
                                uploadToNewBackEnd(type, undefined, detail, crashWinId);
                            }, 30 * 1000);
                        })
                            .catch((e) => {
                            resolve(false);
                            setTimeout(() => {
                                uploadToNewBackEnd(type, undefined, detail, crashWinId);
                            }, 30 * 1000);
                        });
                    })
                        .catch((e) => {
                        resolve(false);
                    });
                }
                else {
                    resolve(false);
                }
            });
        }).catch((err) => {
            return false;
        });
        return pms;
    }
    async zipLogs(uid, logPath, type = 1, days = 7) {
        let dateTime = dateUtil.dateFormat("yyyyMMddHHmmss");
        let sysType = "windows";
        if (process.platform == "darwin") {
            sysType = "mac";
        }
        let tempPath = path_1.default.join(logPath, (appConfig.appMode == "fyketang" ? "../ketang_" : "../cxstudy_") +
            sysType +
            "_" +
            uid +
            "_" +
            type +
            "_logs_" +
            dateTime);
        if (!this.copyLogs(logPath, tempPath, days)) {
            return;
        }
        if (process.platform == "darwin") {
            try {
                copyMacReports(tempPath, days);
            }
            catch (err) {
                console.error("copyMacReports error:", err);
            }
        }
        this.m_zipFilePath = `${tempPath}.zip`;
        let pms = new Promise((resolve, reject) => {
            console.info("startzip:", this.m_zipFilePath);
            if (!this.m_zipFilePath) {
                return;
            }
            compressing.zip
                .compressDir(tempPath, this.m_zipFilePath)
                .then(() => {
                console.log("zip file sucess:", this.m_zipFilePath);
                if (!this.m_zipFilePath) {
                    console.error("zipLogs error:m_zipFilePath not exist!");
                    reject(-1);
                }
                if (fs_1.default.existsSync(this.m_zipFilePath) &&
                    fs_1.default.statSync(this.m_zipFilePath).size > 0) {
                    resolve(this.m_zipFilePath);
                }
                else {
                    console.error("zipLogs error:file not exist!");
                    reject(-1);
                }
            })
                .catch((error) => {
                console.error("zipLogs error:", this.m_zipFilePath, error);
                if (this.m_zipFilePath) {
                    fs_1.default.unlinkSync(this.m_zipFilePath);
                }
                reject(error);
            })
                .finally(() => {
                let cmd;
                if (fs_1.default.existsSync(tempPath)) {
                    if (process.platform == "darwin") {
                        cmd = `rm -R  "${tempPath}"`;
                    }
                    else {
                        cmd = `rmdir /Q /S "${tempPath}"`;
                    }
                    this.m_zipFilePath = undefined;
                    let ret = child_process.execSync(cmd, { encoding: "utf-8" });
                    console.log(ret);
                }
            });
        });
        return pms;
    }
    uploadFile(uid, type, file) {
        let fileStat = fs_1.default.statSync(file);
        const productId = parseInt(this.getProductIdFromUa());
        if (isNaN(productId)) {
            return;
        }
        let pms = new Promise((resolve, reject) => {
            let fileStream = fs_1.default.createReadStream(file);
            let requestParams = {
                getParams: {
                    puid: uid,
                    productId,
                    type,
                    fileSize: fileStat.size,
                    crossOrigin: "true",
                },
                tokenSign: true,
                postParams: {
                    files: fileStream,
                },
            };
            SpecialpackOut.uploadUserLog(requestParams)
                .then((res) => {
                resolve(res);
            })
                .catch((e) => {
                console.debug("uploadFile error:", e);
                reject(e);
            })
                .finally(() => {
                fs_1.default.unlinkSync(file);
            });
        });
        return pms;
    }
    copyLogs(logPath, toPath, days = 7) {
        try {
            this.copyLogFiles(logPath, toPath, days);
            if (!fs_1.default.existsSync(toPath)) {
                return false;
            }
            return true;
        }
        catch (e) {
            console.error("copyLogs error:", e);
            return false;
        }
    }
    copyLogFiles(fromDir, toDir, days = 7) {
        let copyFromDate = Date.now() - days * 24 * 60 * 60 * 1000;
        let files = fs_1.default.readdirSync(fromDir);
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let filePath = path_1.default.join(fromDir, file);
            let toFilePath = path_1.default.join(toDir, file);
            let stat = fs_1.default.statSync(filePath);
            if (stat.isFile()) {
                if (stat.mtimeMs > copyFromDate) {
                    if (!fs_1.default.existsSync(toDir)) {
                        fs_1.default.mkdirSync(toDir, { recursive: true });
                    }
                    fs_1.default.copyFileSync(filePath, toFilePath);
                }
            }
            else if (stat.isDirectory()) {
                this.copyLogFiles(filePath, toFilePath, days);
            }
        }
    }
    getProductIdFromUa() {
        let productId = "";
        let ua = sessionCookie.getUa();
        const prefix = "ChaoXingStudy_";
        const index = ua.indexOf(prefix);
        if (index !== -1) {
            try {
                let csstudyAfter = ua.substring(index + prefix.length);
                let arr = csstudyAfter.split("_");
                productId = arr[0];
            }
            catch (e) {
                console.error(e);
            }
        }
        else {
            const prefix2 = "ChaoxingClassroomPc_";
            const index2 = ua.indexOf(prefix2);
            if (index2 !== -1) {
                let temp = ua.substring(index2 + prefix2.length);
                let arr = temp.split("_");
                if (arr.length > 1) {
                    productId = arr[1];
                }
            }
        }
        return productId;
    }
    afterUploadSuccess() {
        this.clearCrashLogs();
    }
    clearCrashLogs() {
        if (this.m_logPath) {
            let crashPath = path_1.default.join(this.m_logPath, "crash");
        }
    }
}
let logUpload;
function startAutoUpload(logPath) {
    logUpload = new LogUpload(logPath);
}
exports.startAutoUpload = startAutoUpload;
function uploadImmediately(type = 6, detail, crashWinId) {
    if (logUpload) {
        return logUpload.upload(type, detail, undefined, crashWinId);
    }
    return false;
}
exports.uploadImmediately = uploadImmediately;
async function uploadToNewBackEnd(type, args, detail, crashWinId) {
    let curTime = new Date().getTime();
    if (type != 6 && curTime - m_lastUploadTime2 < 30000) {
        return;
    }
    m_lastUploadTime2 = curTime;
    let dataInfo = await uploadLogToCloudDisk(undefined, args?.fetchDays);
    let reportType = 4;
    let description = "";
    let uploadType = 2;
    let subType = 1;
    if (type == 1) {
        reportType = 3;
        description = "后台拉取";
        uploadType = 1;
    }
    else if (type == 2) {
    }
    else if (type == 3) {
        reportType = 2;
        subType = 2;
        description = "子进程crash";
    }
    else if (type == 4) {
        reportType = 2;
        subType = 3;
        description = "渲染进程crash";
    }
    else if (type == 5) {
    }
    else if (type == 6) {
    }
    else if (type == 7) {
        reportType = 5;
        description = "主进程出错";
    }
    if (detail) {
        description += ":" + detail;
    }
    if (dataInfo && dataInfo.result && dataInfo.data?.objectId) {
        let puid = (0, UserHelper_1.getUID)();
        let pushLogUrl = `https://k.chaoxing.com/apis/feedback/pushLog?puid=${puid}&type=${process.platform == "win32" ? "0" : "3"}&objectId=${dataInfo.data.objectId}&reportType=${reportType}&version=${electron_1.app
            .getVersion()
            .replace("-", ".")}&description=${description}&uploadType=${uploadType}&subType=${subType}&uuid=${(0, MainHelper_1.getTempStore)(StoreKey_1.StoreKey.crashUUID)}&crashWinId=${crashWinId || ""}`;
        if (args?.feedBackIdStr) {
            pushLogUrl += `&feedBackIdStr=${args.feedBackIdStr}`;
        }
        pushLogUrl = TokenUtil_1.TokenUtil.getEncRequestUrl(pushLogUrl);
        resetCrashUUID();
        let result = await (0, NetUtil_1.netRequestGet)(pushLogUrl);
        console.debug("uploadToNewBackEnd result:", result?.json());
        return result?.json();
    }
}
async function uploadLogToCloudDisk(progressCallback, days = 7) {
    if (logUpload) {
        let puid = (0, UserHelper_1.getUID)();
        if (!puid) {
            puid = "guest";
        }
        let logPath = electron_1.app.getPath("logs");
        let zipFile = await logUpload.zipLogs(puid, logPath, 6, days);
        if (zipFile && fs_1.default.existsSync(zipFile)) {
            if (!progressCallback) {
                progressCallback = (alreadySendSize, totalSize) => { };
            }
            let uploadId = `upload_${Date.now()}`;
            return (0, CloudDiskHelper_1.uploadFileToCloudDisk)(uploadId, { filePath: zipFile }, "temp", undefined, progressCallback);
        }
    }
}
exports.uploadLogToCloudDisk = uploadLogToCloudDisk;
electron_1.ipcMain.on("_uploadClientLog", (event, args) => {
    uploadToNewBackEnd(1, args);
});
function resetCrashUUID() {
    let uuid = (0, uuid_1.v4)().replaceAll("-", "");
    (0, MainHelper_1.setTempStore)(StoreKey_1.StoreKey.crashUUID, uuid);
    electron_1.crashReporter.addExtraParameter("uuid", uuid);
}
exports.resetCrashUUID = resetCrashUUID;
function copyMacReports(toDir, days = 7) {
    if (process.platform != "darwin") {
        return;
    }
    let reportsDir1 = `/Library/Logs/DiagnosticReports`;
    let reportsDir2 = path_1.default.join(electron_1.app.getPath("logs"), "../DiagnosticReports");
    let toReportDir = path_1.default.join(toDir, "macReport");
    fs_1.default.mkdirSync(toReportDir);
    copyMacReportsWithDay(reportsDir1, path_1.default.join(toReportDir, "sysReport"), days);
    copyMacReportsWithDay(reportsDir2, path_1.default.join(toReportDir, "userReport"), days);
}
function copyMacReportsWithDay(from, to, day) {
    if (!fs_1.default.existsSync(from)) {
        return;
    }
    fs_1.default.mkdirSync(to);
    let now = Date.now();
    let files = fs_1.default.readdirSync(from);
    for (let file of files) {
        let filePath = path_1.default.join(from, file);
        let stat = fs_1.default.statSync(filePath);
        if (stat.isSocket() || stat.isFIFO()) {
            continue;
        }
        let fileTime = stat.birthtimeMs;
        let diff = now - fileTime;
        let diffDay = diff / 86400000;
        if (diffDay < day) {
            let toFilePath = path_1.default.join(to, file);
            fs_1.default.copyFileSync(filePath, toFilePath);
        }
    }
}
//# sourceMappingURL=LogUpload.js.map