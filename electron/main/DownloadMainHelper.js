"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearNewDownloadCount = exports.setDownloadPath = exports.initDb = exports.init = exports.DownloadSubItem = exports.DownloadItemInfo = void 0;
const appCfg = require("../config/appconfig.json");
if (appCfg.appMode == "fanya" || appCfg.appMode == "fyketang") {
    module.exports = { setMainWindow: () => { } };
    return;
}
const electron_1 = require("electron");
const MainHelper_1 = require("./MainHelper");
const UserHelper_1 = require("./UserHelper");
const CloudDiskHelper_1 = require("./CloudDiskHelper");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DbHelper_1 = require("../utils/DbHelper");
const T_Download_1 = require("../db/T_Download");
const events_1 = require("events");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const FileUtil_1 = require("../utils/FileUtil");
const DebounceUtil_1 = require("../utils/DebounceUtil");
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const PostUrlCacheHelper_1 = require("./PostUrlCacheHelper");
const BrowserHelper_1 = require("./BrowserHelper");
const WinId_1 = __importDefault(require("../common/WinId"));
const TabHelper_1 = __importDefault(require("./TabHelper"));
const DialogMainHelper_1 = require("./DialogMainHelper");
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const DEFAULT_MAX_DOWNLOADING_COUNT = 5;
const m_DownloadQueue = new Array();
let m_DownloadWebContents = [];
let m_DownloadInfoDb;
let m_DownloadInFolderDb;
let m_lastSaveAs;
let m_lastSaveAsDir;
let m_NewDownloadCount = 0;
var DownloadType;
(function (DownloadType) {
    DownloadType[DownloadType["CLOUD_DISK_FILE"] = 0] = "CLOUD_DISK_FILE";
    DownloadType[DownloadType["CLOUD_DISK_DIR"] = 1] = "CLOUD_DISK_DIR";
    DownloadType[DownloadType["FILE"] = 4] = "FILE";
    DownloadType[DownloadType["GROUP_CLOUD_DISK_DIR"] = 5] = "GROUP_CLOUD_DISK_DIR";
})(DownloadType || (DownloadType = {}));
var DownloadState;
(function (DownloadState) {
    DownloadState[DownloadState["LINE_UP"] = 1] = "LINE_UP";
    DownloadState[DownloadState["PAUSE"] = 2] = "PAUSE";
    DownloadState[DownloadState["DOWNLOADING"] = 3] = "DOWNLOADING";
    DownloadState[DownloadState["COMPLETE"] = 4] = "COMPLETE";
    DownloadState[DownloadState["ERROR"] = 6] = "ERROR";
    DownloadState[DownloadState["FILE_DELETE"] = 7] = "FILE_DELETE";
    DownloadState[DownloadState["PREPARE_PAUSE"] = 8] = "PREPARE_PAUSE";
    DownloadState[DownloadState["PREPARE_FOLDER"] = 9] = "PREPARE_FOLDER";
})(DownloadState || (DownloadState = {}));
const ComputeSpeedInterval = 1000;
class DownladSpeed extends events_1.EventEmitter {
    constructor(_totalSize) {
        super();
        this.lastReceivedBytes = -1;
        this.lastRecivedTime = -1;
        this.downloadSpeed = -1;
        this.remainder = -1;
        this.totalSize = 0;
        this.totalSize = _totalSize;
    }
    setReceivedBytes(bytes) {
        let curTime = new Date().getTime();
        if (curTime - this.lastRecivedTime < ComputeSpeedInterval) {
            return;
        }
        if (this.lastRecivedTime > 0) {
            let downloadSpeed = Math.floor((bytes - this.lastReceivedBytes) / (curTime - this.lastRecivedTime));
            if (this.totalSize > 0) {
                this.remainder = Math.floor((this.totalSize - bytes) / downloadSpeed);
            }
            this.downloadSpeed = downloadSpeed * 1000;
            this.emit("downloadSpeedChanged", {
                speed: this.downloadSpeed,
                remainder: this.remainder,
            });
        }
        this.lastRecivedTime = curTime;
        this.lastReceivedBytes = bytes;
    }
}
class DownloadItemInfo extends events_1.EventEmitter {
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
        if (this._state != 8) {
            sendToDownloadCenter("downloadStateChanged", this.getDownloadDataInfo());
        }
    }
    get receivedBytes() {
        return this._receivedBytes;
    }
    set receivedBytes(value) {
        this._receivedBytes = value;
        this.downloadSpeed?.setReceivedBytes(value);
    }
    get downloadSpeed() {
        return this._downloadSpeed;
    }
    set downloadSpeed(value) {
        if (value) {
            value.on("downloadSpeedChanged", (data) => {
                sendToDownloadCenter("downloadProgressChanged", this.getDownloadDataInfo());
            });
        }
        this._downloadSpeed = value;
    }
    getDownloadDataInfo() {
        let data = {
            id: this.id,
            resId: this.resId,
            objectId: this.objectId,
            title: this.title,
            totalSize: this.totalSize,
            receivedBytes: this.receivedBytes,
            downloadSpeed: this.downloadSpeed?.downloadSpeed,
            remainder: this.downloadSpeed?.remainder,
            state: this.state,
            type: this.type,
            thumbnail: this.thumbnail,
            finshTime: this.finshTime,
            startTime: this.startTime,
            errorCode: this.errorCode,
            fileExists: false,
        };
        if (data.state != DownloadState.DOWNLOADING) {
            data.fileExists = fs_1.default.existsSync(this.localPath);
        }
        return data;
    }
    constructor() {
        super();
        this._state = DownloadState.LINE_UP;
        this._receivedBytes = 0;
        this.subItems = [];
        this.onLoadingFileInFolder = false;
        this.once("deleteDownload", (delFile) => {
            deleteItemData(this.id);
            if (delFile) {
                if (this.type == DownloadType.CLOUD_DISK_DIR ||
                    this.type == DownloadType.GROUP_CLOUD_DISK_DIR) {
                    (0, FileUtil_1.deleteDir)(this.localPath);
                }
                else {
                    (0, FileUtil_1.deleteFile)(this.localPath);
                    let tmpFilePath = getTempFilePath(this.localPath);
                    (0, FileUtil_1.deleteFile)(tmpFilePath);
                }
            }
        });
    }
}
exports.DownloadItemInfo = DownloadItemInfo;
class DownloadSubItem extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.type = DownloadType.CLOUD_DISK_FILE;
        this.state = DownloadState.LINE_UP;
        this.totalSize = 0;
        this.receivedBytes = 0;
    }
    setLocalPath(lPath) {
        this._localPath = lPath;
    }
    getLocalPath(pPath) {
        return path_1.default.join(pPath, this._localPath);
    }
}
exports.DownloadSubItem = DownloadSubItem;
function getTempFilePath(filePath) {
    return filePath + ".cxdl";
}
function setMainWindow(mainWindow) {
    init();
}
const willDownloadListener = (event, item, webContents) => {
    if (!item.getURL().startsWith("http")) {
        return;
    }
    let saveAsVal = new URL(item.getURL()).searchParams.get("saveAs");
    if (saveAsVal === "true") {
        return;
    }
    if (m_lastSaveAs && new Date().getTime() - m_lastSaveAs.saveTime < 5000) {
        let url1 = new URL(m_lastSaveAs.url);
        let url2 = new URL(item.getURLChain()[0]);
        if (url1.href == url2.href) {
            item.setSaveDialogOptions({
                title: "另存为",
                defaultPath: m_lastSaveAs.fileName,
            });
            m_lastSaveAs = undefined;
            return;
        }
    }
    let url = item.getURL();
    const postUrlCache = (0, PostUrlCacheHelper_1.getPostUrlCache)(item.getURL());
    if (postUrlCache &&
        postUrlCache.uploadData &&
        postUrlCache.uploadData.length > 0 &&
        postUrlCache.uploadData[0].bytes &&
        postUrlCache.herders &&
        postUrlCache.herders["Content-Type"] == "application/x-www-form-urlencoded") {
        if (postUrlCache.uploadData[0].bytes.length > 1024) {
            return;
        }
        url +=
            (url.includes("?") ? "&" : "?") +
                postUrlCache.uploadData[0].bytes.toString();
    }
    event.preventDefault();
    console.log("miniType:", item.getMimeType());
    downloadFile({
        url,
        urlChain: item.getURLChain(),
        name: item.getFilename(),
        filesize: item.getTotalBytes(),
    });
    let webUrl = webContents.getURL();
    console.debug("webUrl:", webUrl);
    if (!webUrl ||
        (webUrl.startsWith("file://") && webUrl.endsWith("html/loading_main.html"))) {
        webContents.executeJavaScript("window.close()");
    }
};
async function init() {
    electron_1.session.defaultSession.off("will-download", willDownloadListener);
    electron_1.session.defaultSession.on("will-download", willDownloadListener);
    (0, PostUrlCacheHelper_1.initPostUrlCache)();
}
exports.init = init;
async function initDb() {
    console.warn("downloadHeper initDb");
    m_DownloadQueue.splice(0, m_DownloadQueue.length);
    m_DownloadInfoDb = new T_Download_1.T_DwonloadItem();
    m_DownloadInFolderDb = new T_Download_1.T_DwonloadInFolder();
    let db = await (0, DbHelper_1.getDb)("download.db", true);
    await m_DownloadInfoDb.init(db);
    await m_DownloadInFolderDb.init(db);
    let allData = await m_DownloadInfoDb.queryAll();
    m_DownloadQueue.splice(0, m_DownloadQueue.length);
    if (allData && allData.length > 0) {
        let allSubItems = await m_DownloadInFolderDb.queryAll();
        for (let data of allData) {
            let item = new DownloadItemInfo();
            Object.assign(item, data);
            if (item.type == DownloadType.CLOUD_DISK_DIR ||
                item.type == DownloadType.GROUP_CLOUD_DISK_DIR) {
                item.subItems = getSubItemByPid(allSubItems, item.id);
            }
            if (typeof item.totalSize == "string") {
                item.totalSize = parseInt(item.totalSize);
            }
            checkDownloadProgress(item);
            m_DownloadQueue.push(item);
        }
    }
    checkStart();
    onItemQueueChanged();
}
exports.initDb = initDb;
function getSubItemByPid(allSubItems, pid) {
    if (!allSubItems) {
        return [];
    }
    let items = [];
    for (let i = allSubItems.length - 1; i >= 0; i--) {
        let subItem = allSubItems[i];
        if (subItem.pid == pid) {
            let sub = new DownloadSubItem();
            Object.assign(sub, subItem);
            items.push(sub);
            allSubItems.splice(i, 1);
        }
    }
    return items;
}
function getSubItemByGroupId(allSubItems, groupId) {
    if (!allSubItems) {
        return [];
    }
    let items = [];
    for (let i = allSubItems.length - 1; i >= 0; i--) {
        let subItem = allSubItems[i];
        if (subItem.groupId == groupId) {
            let sub = new DownloadSubItem();
            Object.assign(sub, subItem);
            items.push(sub);
            allSubItems.splice(i, 1);
        }
    }
    return items;
}
function getDownloadDir() {
    let downloadPath;
    let uid = (0, UserHelper_1.getUID)();
    if (!uid) {
        uid = "guest";
    }
    else {
        downloadPath = (0, MainHelper_1.getUserStore)("_downloadPath");
    }
    if (!downloadPath) {
        if (process.platform == "darwin") {
            downloadPath = electron_1.app.getPath("downloads");
        }
        else {
            try {
                fs_1.default.accessSync("D:\\", fs_1.default.constants.W_OK);
                downloadPath = "D:\\cxdownload";
            }
            catch (err) {
                downloadPath = electron_1.app.getPath("downloads");
            }
        }
    }
    return downloadPath;
}
function getDownloadPath(filename, isDir = false) {
    let dir = getDownloadDir();
    if (!checkDisk(dir)) {
        return;
    }
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    let filePath = path_1.default.join(dir, filename);
    let extname = path_1.default.extname(filename);
    let basename = path_1.default.basename(filename, extname);
    if (isDir) {
        basename = filename;
        extname = "";
    }
    let tempIndex = 2;
    while (true) {
        let tmpPath = getTempFilePath(filePath);
        if (fs_1.default.existsSync(filePath) || (!isDir && fs_1.default.existsSync(tmpPath))) {
            let filename2 = `${basename}(${tempIndex++})${extname}`;
            filePath = path_1.default.join(dir, filename2);
            continue;
        }
        break;
    }
    return filePath;
}
async function getSaveAsPath(filename, isDir = false) {
    if (!m_lastSaveAsDir) {
        m_lastSaveAsDir = (0, MainHelper_1.getUserStore)("lastSaveAsDir");
        if (!m_lastSaveAsDir) {
            m_lastSaveAsDir = getDownloadDir();
        }
    }
    let selectItem = await electron_1.dialog.showOpenDialog({
        title: "另存为",
        defaultPath: m_lastSaveAsDir,
        buttonLabel: "另存为",
        properties: ["createDirectory", "openDirectory"],
    });
    if (selectItem.filePaths.length > 0) {
        let dir = selectItem.filePaths[0];
        m_lastSaveAsDir = dir;
        (0, MainHelper_1.setSysStore)("lastSaveAsDir", dir);
        let extname = path_1.default.extname(filename);
        let basename = path_1.default.basename(filename, extname);
        if (isDir) {
            basename = filename;
            extname = "";
        }
        let tempIndex = 2;
        let filePath = path_1.default.join(dir, filename);
        while (true) {
            let tmpPath = getTempFilePath(filePath);
            if (fs_1.default.existsSync(filePath) || (!isDir && fs_1.default.existsSync(tmpPath))) {
                let filename2 = `${basename}(${tempIndex++})${extname}`;
                filePath = path_1.default.join(dir, filename2);
                continue;
            }
            break;
        }
        return filePath;
    }
}
function setDownloadPath(downloadPath) {
    (0, MainHelper_1.setUserStore)("_downloadPath", downloadPath);
}
exports.setDownloadPath = setDownloadPath;
async function insertItemToDb(item) {
    let item2 = await m_DownloadInfoDb.queryFirst(`id=?`, [item.id]);
    if (item2) {
        m_DownloadInfoDb.deleteData(`id=?`, [item.id]);
        m_DownloadInFolderDb.deleteData(`pid=?`, [item.id]);
    }
    m_DownloadInfoDb.insertData(item);
    if (item.type == DownloadType.CLOUD_DISK_DIR ||
        item.type == DownloadType.GROUP_CLOUD_DISK_DIR) {
        let subItems = item.subItems;
        if (subItems) {
            for (let subItem of subItems) {
                m_DownloadInFolderDb.insertData(subItem);
            }
        }
    }
}
async function downloadDiskFile(data) {
    let item = new DownloadItemInfo();
    item.puid = data.puid;
    item.shareId = data.shareId;
    item.shareUserId = data.shareUserId;
    item.id = `${new Date().getTime()}_${(0, CryptoUtil_1.md5)(data.id)}`;
    let dItem = getItemById(item.id);
    if (dItem) {
        console.warn("任务已存在");
        return { error: -1, msg: "任务已存在" };
    }
    item.resId = data.id;
    item.objectId = data.objectId;
    item.title = data.name;
    if (typeof data.filesize == "string") {
        item.totalSize = parseInt(data.filesize);
    }
    else {
        item.totalSize = data.filesize;
    }
    item.thumbnail = getThumbnail(data.logo);
    item.type = DownloadType.CLOUD_DISK_FILE;
    if (data.isSaveAs) {
        let localPath = await getSaveAsPath(data.name);
        if (localPath) {
            item.localPath = localPath;
        }
        else {
            return;
        }
    }
    else {
        item.localPath = getDownloadPath(data.name);
    }
    return pushDownload(item);
}
async function downloadFile(data) {
    let item = new DownloadItemInfo();
    item.id = `${new Date().getTime()}_${(0, CryptoUtil_1.md5)(data.url)}`;
    let dItem = getItemById(item.id);
    if (dItem) {
        console.warn("任务已存在");
        return { error: -1, msg: "任务已存在" };
    }
    item.url = data.url;
    item.urlChain = data.urlChain;
    if (data.name) {
        let extname = path_1.default.extname(data.name);
        if (!extname || extname.length > 5) {
            let tempIndex = data.url.indexOf("//p.ananas.chaoxing.com");
            if (tempIndex > 0 && tempIndex < 6) {
                data.name += ".png";
            }
        }
    }
    item.title = data.name;
    if (typeof data.filesize == "string") {
        item.totalSize = parseInt(data.filesize);
    }
    else {
        item.totalSize = data.filesize;
    }
    item.type = DownloadType.FILE;
    item.localPath = getDownloadPath(data.name);
    return pushDownload(item);
}
function checkDisk(dirPath) {
    if (!dirPath) {
        return false;
    }
    if (process.platform == "win32") {
        let disk = dirPath.substring(0, 3);
        if (!fs_1.default.existsSync(disk)) {
            let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
            let dialogId = "DiskNotExistDialog";
            (0, DialogMainHelper_1.openCommonDialog)(mainWin, {
                winConfig: {
                    id: dialogId,
                },
                type: "confirm",
                backgroundColor: "#FFFFFF",
                content: "下载文件保存磁盘发生更改或已删除，请更改保存文件夹目录",
                okBtn: "更改目录",
                cancelBtn: "取消",
            }).then((data) => {
                if (data != "cancel") {
                    sendSetDefaultDownloadPath();
                }
            });
            return false;
        }
    }
    return true;
}
async function sendSetDefaultDownloadPath() {
    await TabHelper_1.default.showTab("tab_setting");
    setTimeout(() => {
        let bv = TabHelper_1.default.getBrowserViewById("tab_setting");
        if (bv) {
            bv.webContents.send("setDefaultDownloadPath");
        }
    }, 800);
}
function pushDownload(item) {
    if (!item.localPath) {
        return;
    }
    if (item.type == DownloadType.CLOUD_DISK_DIR ||
        item.type == DownloadType.GROUP_CLOUD_DISK_DIR) {
        fs_1.default.mkdirSync(item.localPath, { recursive: true });
    }
    else {
        fs_1.default.writeFileSync(getTempFilePath(item.localPath), "");
    }
    item.startTime = new Date().getTime();
    insertItemToDb(item);
    m_DownloadQueue.push(item);
    sendToDownloadCenter("downloadStateChanged", item.getDownloadDataInfo());
    m_NewDownloadCount++;
    onItemQueueChanged();
    checkStart();
}
function checkStart() {
    let onDownloadCount = 0;
    let firstInLineUp;
    for (let downloadItem of m_DownloadQueue) {
        if (downloadItem.state == DownloadState.DOWNLOADING) {
            onDownloadCount++;
        }
        else if (!firstInLineUp && downloadItem.state == DownloadState.LINE_UP) {
            firstInLineUp = downloadItem;
        }
        else if (downloadItem.state == DownloadState.PREPARE_FOLDER) {
            loadFolderFiles(downloadItem);
        }
    }
    if (onDownloadCount < DEFAULT_MAX_DOWNLOADING_COUNT && firstInLineUp) {
        startDownload(firstInLineUp);
        checkStart();
    }
}
async function startDownload(item) {
    item.state = DownloadState.DOWNLOADING;
    if (item.type == DownloadType.CLOUD_DISK_FILE) {
        startDownloadFile(item);
    }
    else if (item.type == DownloadType.CLOUD_DISK_DIR ||
        item.type == DownloadType.GROUP_CLOUD_DISK_DIR) {
        startDownloadDir(item);
    }
    else if (item.type == DownloadType.FILE) {
        startDownloadOtherFile(item);
    }
}
async function startDownloadFile(item) {
    let resId = item.resId;
    let dItem = await (0, CloudDiskHelper_1.getDownloadUrl)(resId, item.shareUserId, item.objectId);
    if (!dItem || !dItem.url) {
        item.state = DownloadState.ERROR;
        console.warn("下载失败！获取文件信息失败");
        return { error: -2, msg: "获取文件信息失败" };
    }
    item.title = dItem.name;
    item.totalSize = dItem.size;
    item.url = dItem.url;
    startDownloadOtherFile(item);
}
async function startDownloadDir(item) {
    if (item.state != DownloadState.DOWNLOADING) {
        if (item.state == DownloadState.PREPARE_PAUSE) {
            item.state = DownloadState.PAUSE;
            m_DownloadInfoDb.updateData(item, "id=?", [item.id]);
        }
        return;
    }
    checkSubDownloadProgress(item);
    let subItem = getNextSubDownload(item);
    if (!subItem) {
        item.finshTime = new Date().getTime();
        item.state = DownloadState.COMPLETE;
        m_DownloadInfoDb.updateData(item, "id=?", [item.id]);
        checkStart();
        return;
    }
    let dItem = await (0, CloudDiskHelper_1.getDownloadUrl)(subItem.id, subItem.shareUserId || item.shareUserId, item.type == DownloadType.GROUP_CLOUD_DISK_DIR ? subItem.objId : undefined);
    if (!dItem) {
        item.state = DownloadState.ERROR;
        console.warn("下载失败！获取文件信息失败");
        return { error: -2, msg: "获取文件信息失败" };
    }
    if (!dItem.url) {
        if (dItem.newCode == 200004) {
            subItem.state = DownloadState.COMPLETE;
            subItem.finshTime = new Date().getTime();
            m_DownloadInFolderDb.updateData(subItem, "id=? and pid=?", [
                subItem.id,
                subItem.pid,
            ]);
            startDownloadDir(item);
            return;
        }
        else {
            item.state = DownloadState.ERROR;
            console.warn("下载失败！获取文件信息失败");
            return { error: -2, msg: "获取文件信息失败" };
        }
    }
    subItem.title = dItem.name || subItem.title;
    subItem.totalSize = dItem.size || subItem.totalSize;
    subItem.url = dItem.url;
    let tmpFilePath = getTempFilePath(subItem.getLocalPath(item.localPath));
    let pPath = path_1.default.dirname(tmpFilePath);
    if (!fs_1.default.existsSync(pPath)) {
        fs_1.default.mkdirSync(pPath, { recursive: true });
    }
    if (item.state != DownloadState.DOWNLOADING) {
        if (item.state == DownloadState.PREPARE_PAUSE) {
            item.state = DownloadState.PAUSE;
            m_DownloadInfoDb.updateData(item, "id=?", [item.id]);
        }
        return;
    }
    let wstream = fs_1.default.createWriteStream(tmpFilePath, { flags: "a" });
    console.log("开始下载文件 startDownloadDir：", subItem.id, subItem.title, subItem.url);
    let request = electron_1.net.request({
        url: subItem.url,
        useSessionCookies: true,
    });
    item.removeAllListeners("pauseDownload");
    item.once("pauseDownload", () => {
        item.state = DownloadState.PAUSE;
        request.abort();
        wstream.end();
        m_DownloadInfoDb.updateData(item, "id=?", [item.id]);
    });
    item.removeAllListeners("stopDownload");
    item.once("stopDownload", () => {
        item.state = DownloadState.LINE_UP;
        request.abort();
        wstream.end();
    });
    let recBytes = item.receivedBytes;
    if (fs_1.default.existsSync(tmpFilePath)) {
        let tempRecBytes = fs_1.default.statSync(tmpFilePath).size;
        if (tempRecBytes > 0) {
            request.setHeader("Range", `bytes=${tempRecBytes}-`);
        }
    }
    if (!item.downloadSpeed) {
        item.downloadSpeed = new DownladSpeed(item.totalSize);
    }
    request.on("error", (error) => {
        if (item.state == DownloadState.DOWNLOADING) {
            item.state = DownloadState.ERROR;
            console.warn("下载失败！", error);
        }
    });
    request.on("response", (response) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
            console.warn("下载文件夹失败！statusCode:", response.statusCode);
            item.state = DownloadState.ERROR;
            return;
        }
        console.log("开始下载：", subItem.id, subItem.title, subItem.url);
        response.on("data", (chunk) => {
            recBytes += chunk.length;
            item.receivedBytes = recBytes;
            wstream.write(chunk, (error) => {
                if (error) {
                    console.log("下载失败！", error["code"], error.message);
                    item.state = DownloadState.ERROR;
                    if (item.errorCode == undefined) {
                        item.errorCode = error["code"];
                    }
                    request.abort();
                    wstream.end();
                }
                else {
                }
            });
        });
        response.on("end", () => {
            item.removeAllListeners("pauseDownload");
            item.removeAllListeners("stopDownload");
            wstream.end();
            let subLocalPath = subItem.getLocalPath(item.localPath);
            if (fs_1.default.existsSync(subLocalPath)) {
                fs_1.default.unlinkSync(subLocalPath);
            }
            if (fs_1.default.existsSync(subLocalPath)) {
                console.log("download finish remove old file fail:", subLocalPath);
                item.state = DownloadState.ERROR;
                return;
            }
            if (fs_1.default.existsSync(tmpFilePath)) {
                fs_1.default.renameSync(tmpFilePath, subLocalPath);
                subItem.state = DownloadState.COMPLETE;
                subItem.finshTime = new Date().getTime();
                m_DownloadInFolderDb.updateData(subItem, "id=? and pid=?", [
                    subItem.id,
                    subItem.pid,
                ]);
                startDownloadDir(item);
            }
            else {
                console.log("download finish temp file not exist:", tmpFilePath);
                item.state = DownloadState.ERROR;
                return;
            }
        });
        response.on("error", (err) => {
            console.error(`下载失败:url:${subItem.url},response error:`, err);
        });
    });
    request.end();
}
function startDownloadOtherFile(item) {
    if (item.state != DownloadState.DOWNLOADING) {
        if (item.state == DownloadState.PREPARE_PAUSE) {
            item.state = DownloadState.PAUSE;
        }
        return;
    }
    let tmpFilePath = getTempFilePath(item.localPath);
    let wstream = fs_1.default.createWriteStream(tmpFilePath, { flags: "a" });
    console.log("开始下载文件 startDownloadOtherFile：", item.id, item.title, item.url);
    let request = electron_1.net.request({ url: item.url, useSessionCookies: true });
    item.removeAllListeners("pauseDownload");
    item.once("pauseDownload", () => {
        item.state = DownloadState.PAUSE;
        m_DownloadInfoDb.updateData(item, "id=?", [item.id]);
        request.abort();
        wstream.end();
    });
    item.removeAllListeners("stopDownload");
    item.once("stopDownload", () => {
        item.state = DownloadState.LINE_UP;
        request.abort();
        wstream.end();
    });
    let recBytes = 0;
    if (fs_1.default.existsSync(tmpFilePath)) {
        recBytes = fs_1.default.statSync(tmpFilePath).size;
        if (recBytes > item.totalSize) {
            fs_1.default.unlinkSync(tmpFilePath);
            recBytes = 0;
        }
        if (recBytes > 0) {
            request.setHeader("Range", `bytes=${recBytes}-`);
        }
    }
    item.receivedBytes = recBytes;
    item.downloadSpeed = new DownladSpeed(item.totalSize);
    request.on("error", (error) => {
        console.warn("download error:title:", item.title, item.url);
        if (item.state == DownloadState.DOWNLOADING) {
            item.state = DownloadState.ERROR;
        }
    });
    request.on("response", (response) => {
        console.log(`download response.statusCode:${response.statusCode}, response header:`, response.headers);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            item.state = DownloadState.ERROR;
            console.warn("下载失败！下载文件失败！statusCode:", response.statusCode);
            return;
        }
        console.log("开始下载：", item.id, item.title);
        response.on("data", (chunk) => {
            recBytes += chunk.length;
            item.receivedBytes = recBytes;
            wstream.write(chunk, (error) => {
                if (error) {
                    console.log("下载失败！", error["code"], error.message);
                    item.state = DownloadState.ERROR;
                    if (item.errorCode == undefined) {
                        item.errorCode = error["code"];
                    }
                    request.abort();
                    wstream.end();
                }
                else {
                }
            });
            if (item.totalSize > 0 && item.receivedBytes > item.totalSize) {
                item.state = DownloadState.ERROR;
                request.abort();
                wstream.end();
            }
        });
        response.on("end", () => {
            item.removeAllListeners("pauseDownload");
            item.removeAllListeners("stopDownload");
            wstream.end();
            if (fs_1.default.existsSync(item.localPath)) {
                fs_1.default.unlinkSync(item.localPath);
            }
            if (fs_1.default.existsSync(item.localPath)) {
                console.log("download finish remove old file fail:", item.localPath);
                item.state = DownloadState.ERROR;
                return;
            }
            if (fs_1.default.existsSync(tmpFilePath)) {
                fs_1.default.renameSync(tmpFilePath, item.localPath);
                item.state = DownloadState.COMPLETE;
                item.finshTime = new Date().getTime();
                if (item.totalSize <= 0) {
                    item.totalSize = item.receivedBytes;
                }
                m_DownloadInfoDb.updateData(item, "id=?", [item.id]);
                checkStart();
                console.log("下载完成：", item.id, item.title);
            }
            else {
                console.log("download finish temp file not exist:", tmpFilePath);
                item.state = DownloadState.ERROR;
                return;
            }
        });
    });
    request.end();
}
function checkDownloadProgress(item) {
    if (item.state == DownloadState.COMPLETE ||
        item.state == DownloadState.PREPARE_FOLDER) {
        return;
    }
    if (item.type == DownloadType.CLOUD_DISK_DIR ||
        item.type == DownloadType.GROUP_CLOUD_DISK_DIR) {
        checkSubDownloadProgress(item);
    }
    else {
        let tmpFilePath = getTempFilePath(item.localPath);
        if (fs_1.default.existsSync(tmpFilePath)) {
            let fileSize = fs_1.default.statSync(tmpFilePath)?.size;
            if (fileSize == undefined) {
                fileSize = 0;
            }
            item.receivedBytes = fileSize;
        }
    }
}
function checkSubDownloadProgress(item) {
    let subItems = item.subItems;
    if (!subItems || subItems.length == 0) {
        return 0;
    }
    let recBytes = 0;
    for (let subItem of subItems) {
        if (subItem.type == DownloadType.CLOUD_DISK_FILE) {
            if (subItem.state == DownloadState.COMPLETE) {
                recBytes += subItem.totalSize;
            }
            else if (fs_1.default.existsSync(subItem.getLocalPath(item.localPath))) {
                let fileSize = fs_1.default.statSync(subItem.getLocalPath(item.localPath)).size;
                if (fileSize == subItem.totalSize) {
                    recBytes += fileSize;
                    subItem.state = DownloadState.COMPLETE;
                }
                else {
                    fs_1.default.unlinkSync(subItem.getLocalPath(item.localPath));
                }
            }
            else {
                let tmpFilePath = getTempFilePath(subItem.getLocalPath(item.localPath));
                if (fs_1.default.existsSync(tmpFilePath)) {
                    let fileSize = fs_1.default.statSync(tmpFilePath).size;
                    if (fileSize > subItem.totalSize) {
                        fs_1.default.unlinkSync(tmpFilePath);
                    }
                    else {
                        recBytes += fileSize;
                    }
                }
            }
        }
    }
    item.receivedBytes = recBytes;
}
function getNextSubDownload(item) {
    let subItems = item.subItems;
    if (!subItems || subItems.length == 0) {
        return;
    }
    for (let subItem of subItems) {
        if (subItem.type == DownloadType.CLOUD_DISK_FILE) {
            if (subItem.state != DownloadState.COMPLETE) {
                return subItem;
            }
        }
    }
}
function getItemById(id) {
    for (let item of m_DownloadQueue) {
        if (item.id == id) {
            return item;
        }
    }
}
function getItemByResId(resId) {
    const list = [];
    for (let item of m_DownloadQueue) {
        if (item.resId == resId) {
            list.push(item);
        }
    }
    if (list.length > 1) {
        list.sort((a, b) => a.startTime - b.startTime);
        return list[list.length - 1];
    }
    return list[0];
}
function getItemByObjectId(objectId) {
    const list = [];
    for (let item of m_DownloadQueue) {
        if (item.objectId == objectId) {
            list.push(item);
        }
    }
    if (list.length > 1) {
        list.sort((a, b) => a.startTime - b.startTime);
        return list[list.length - 1];
    }
    return list[0];
}
function getItemByUrl(url) {
    for (let item of m_DownloadQueue) {
        if (item.type == DownloadType.FILE && item.url == url) {
            return item;
        }
    }
}
(0, UserHelper_1.onUserLogin)(() => {
    stopAllDownload();
    electron_1.session.defaultSession.off("will-download", willDownloadListener);
    electron_1.session.defaultSession.on("will-download", willDownloadListener);
    initDb();
});
(0, UserHelper_1.onUserLogout)(() => {
    electron_1.session.defaultSession.off("will-download", willDownloadListener);
    stopAllDownload();
    initDb();
});
function stopAllDownload() {
    for (let item of m_DownloadQueue) {
        if (item) {
            if (item.state != DownloadState.COMPLETE) {
                item.emit("stopDownload");
            }
        }
    }
}
function getThumbnail(logoPath) {
    if (logoPath && logoPath.startsWith("/")) {
        return "https://pan-yz.chaoxing.com" + logoPath;
    }
    return logoPath;
}
async function downloadDiskFolder(data) {
    let item = new DownloadItemInfo();
    item.id = `${new Date().getTime()}_${(0, CryptoUtil_1.md5)(data.id)}`;
    let dItem = getItemById(item.id);
    if (dItem) {
        console.warn("任务已存在");
        return { error: -1, msg: "任务已存在" };
    }
    item.puid = data.puid;
    item.resId = data.id;
    item.shareId = data.shareId;
    item.shareUserId = data.shareUserId;
    item.fid = data.fid;
    item.isSharePan = data.isSharePan;
    item.title = data.name;
    item.totalSize = data.filesize;
    item.thumbnail = getThumbnail(data.logo);
    item.type = DownloadType.CLOUD_DISK_DIR;
    item.state = DownloadState.PREPARE_FOLDER;
    if (data.isSaveAs) {
        let localPath = await getSaveAsPath(data.name);
        if (localPath) {
            item.localPath = localPath;
        }
        else {
            return;
        }
    }
    else {
        item.localPath = getDownloadPath(data.name, true);
    }
    pushDownload(item);
}
async function downloadGroupDiskFolder(data) {
    let item = new DownloadItemInfo();
    item.id = `${new Date().getTime()}_${(0, CryptoUtil_1.md5)(data.pid)}`;
    let dItem = getItemById(item.id);
    if (dItem) {
        console.warn("任务已存在");
        return { error: -1, msg: "任务已存在" };
    }
    item.resId = data.pid;
    item.groupId = data.ownerId;
    item.title = data.name;
    item.type = DownloadType.GROUP_CLOUD_DISK_DIR;
    item.state = DownloadState.PREPARE_FOLDER;
    if (data.isSaveAs) {
        let localPath = await getSaveAsPath(data.name);
        if (localPath) {
            item.localPath = localPath;
        }
        else {
            return;
        }
    }
    else {
        item.localPath = getDownloadPath(data.name, true);
    }
    pushDownload(item);
}
async function loadFolderFiles(item) {
    if (item.onLoadingFileInFolder) {
        return;
    }
    item.onLoadingFileInFolder = true;
    let subs = [];
    let allTotalSize = 0;
    let subItems = [];
    if (item.type == DownloadType.GROUP_CLOUD_DISK_DIR) {
        subItems = await (0, CloudDiskHelper_1.getGroupFileInFolder)({
            ownerId: item.groupId,
            pid: item.resId,
        });
    }
    else {
        subItems = await (0, CloudDiskHelper_1.getFileInFolder)({
            fodlerId: item.resId,
            puid: item.puid,
            shareId: item.shareId,
            fid: item.fid,
            isSharePan: item.isSharePan,
            shareUserId: item.shareUserId,
        });
    }
    if (subItems == undefined) {
        item.onLoadingFileInFolder = false;
        console.warn("获取文件列表失败");
        item.state = DownloadState.ERROR;
        return { error: -2, msg: "获取文件列表失败" };
    }
    for (let i = subItems.length - 1; i >= 0; i--) {
        let subItem = subItems[i];
        if (subItem.fileSize <= 0) {
            subItems.splice(i, 1);
        }
    }
    if (subItems.length == 0) {
        console.warn("文件列表为空");
        item.state = DownloadState.COMPLETE;
        item.finshTime = new Date().getTime();
        m_DownloadInfoDb.updateData(item, "id=?", [item.id]);
        item.onLoadingFileInFolder = false;
        return { error: -2, msg: "文件列表为空" };
    }
    for (let subItem of subItems) {
        let subPaths = subItem.path.replace(/\\/g, "/").split("/");
        if (subPaths.length > 0) {
            for (let i = 0; i < subPaths.length; i++) {
                subPaths[i] = (0, sanitize_filename_1.default)(subPaths[i]);
            }
            subItem.path = subPaths.join("/");
        }
        subItem.fileName = (0, sanitize_filename_1.default)(subItem.fileName);
        let sub = new DownloadSubItem();
        sub.id = subItem.resid + "";
        sub.title = subItem.fileName;
        sub.pid = item.id;
        sub.objId = subItem.objectId;
        sub.shareUserId = subItem.shareUserId;
        subItem.path = subItem.path.substring(subItem.path.indexOf("/", 1));
        let folders = path_1.default.dirname(subItem.path.substring(1)).split("/");
        sub.setLocalPath(subItem.path);
        sub.folders = folders;
        sub.totalSize = subItem.fileSize;
        allTotalSize += sub.totalSize;
        subs.push(sub);
    }
    item.totalSize = allTotalSize;
    item.subItems = subs;
    item.state = DownloadState.LINE_UP;
    insertItemToDb(item);
    item.onLoadingFileInFolder = false;
    checkStart();
}
async function downloadDiskMultiple(data) {
    if (data && data.length > 0) {
        for (let itemData of data) {
            if (itemData.isFolder) {
                downloadDiskFolder(itemData);
            }
            else {
                downloadDiskFile(itemData);
            }
        }
    }
}
electron_1.ipcMain.on("_downloadDiskFile", (event, args) => {
    downloadDiskFile(args);
});
electron_1.ipcMain.on("_downloadDiskFolder", (event, args) => {
    downloadDiskFolder(args);
});
electron_1.ipcMain.on("_downloadGroupDiskFolder", (event, args) => {
    downloadGroupDiskFolder(args);
});
electron_1.ipcMain.on("_downloadDiskMultiple", (event, args) => {
    downloadDiskMultiple(args);
});
function getDownladList() {
    let downloadList = [];
    for (let downloadItem of m_DownloadQueue) {
        downloadList.push(downloadItem.getDownloadDataInfo());
    }
    return downloadList;
}
electron_1.ipcMain.handle("_loadDownloadList", (event) => {
    if (!m_DownloadWebContents.includes(event.sender)) {
        event.sender.on("destroyed", () => {
            m_DownloadWebContents = m_DownloadWebContents.filter((item) => {
                return item != event.sender;
            });
        });
        event.sender.on("render-process-gone", () => {
            m_DownloadWebContents = m_DownloadWebContents.filter((item) => {
                return item != event.sender;
            });
        });
        m_DownloadWebContents.push(event.sender);
    }
    return getDownladList();
});
function sendToDownloadCenter(key, data) {
    for (let i = m_DownloadWebContents.length - 1; i >= 0; i--) {
        let wContents = m_DownloadWebContents[i];
        if (wContents.isDestroyed() || wContents.isCrashed()) {
            m_DownloadWebContents.splice(i, 1);
        }
        else {
            wContents.send("downloadChannel", { type: key, data });
        }
    }
}
function pause(ids) {
    if (!ids || ids.length == 0) {
        return;
    }
    for (let id of ids) {
        let item = getItemById(id);
        if (item) {
            if (item.state != DownloadState.COMPLETE) {
                item.state = DownloadState.PREPARE_PAUSE;
                item.emit("pauseDownload");
            }
        }
    }
}
function resume(ids) {
    if (!ids || ids.length == 0) {
        return;
    }
    for (let id of ids) {
        let item = getItemById(id);
        if (item) {
            if (item.state == DownloadState.PAUSE ||
                item.state == DownloadState.ERROR) {
                item.state = DownloadState.LINE_UP;
                m_DownloadInfoDb.updateData(item, "id=?", [item.id]);
                checkStart();
            }
        }
    }
}
function deleteItem(ids, delFile = false) {
    if (!ids || ids.length == 0) {
        return;
    }
    for (let id of ids) {
        let item = getItemById(id);
        if (item) {
            if (item.state != DownloadState.COMPLETE) {
                item.state = DownloadState.PAUSE;
                item.emit("pauseDownload");
                setTimeout(() => {
                    item.emit("deleteDownload", delFile);
                }, 100);
            }
            else {
                item.emit("deleteDownload", delFile);
            }
        }
    }
}
function showItemInFolder(id, resId, objectId) {
    if (!id && !resId && !objectId) {
        return;
    }
    let item;
    if (id) {
        item = getItemById(id);
    }
    else if (resId) {
        item = getItemByResId(resId);
    }
    else {
        item = getItemByObjectId(objectId);
    }
    if (!item) {
        return;
    }
    let localPath = item.localPath;
    if (fs_1.default.existsSync(localPath)) {
        electron_1.shell.showItemInFolder(localPath);
    }
    else {
        let tmpPath = getTempFilePath(localPath);
        if (fs_1.default.existsSync(tmpPath)) {
            electron_1.shell.showItemInFolder(tmpPath);
        }
        else {
            return -1;
        }
    }
}
function openItemInFolder(id, resId) {
    if (!id && !resId) {
        return -1;
    }
    let item;
    if (id) {
        item = getItemById(id);
    }
    else {
        item = getItemByResId(resId);
    }
    if (!item) {
        return -1;
    }
    let localPath = item.localPath;
    if (fs_1.default.existsSync(localPath)) {
        electron_1.shell.openPath(localPath);
    }
    else {
        return -1;
    }
}
function dragItem(webContents, data) {
    if (!data || (!data.id && !data.resId && !data.objectId && !data.filePath)) {
        return -1;
    }
    if (!webContents || webContents.isDestroyed() || webContents.isCrashed()) {
        return -1;
    }
    let localPath = data.filePath;
    if (!localPath) {
        let item;
        if (data.id) {
            item = getItemById(data.id);
        }
        else if (data.resId) {
            item = getItemByResId(data.resId);
        }
        else {
            item = getItemByObjectId(data.objectId);
        }
        if (!item) {
            return -1;
        }
        localPath = item.localPath;
    }
    let dragImgUrl = data.dragImgUrl;
    if (fs_1.default.existsSync(localPath)) {
        if (dragImgUrl) {
            let img = electron_1.nativeImage.createFromDataURL(dragImgUrl);
            webContents.startDrag({
                file: localPath,
                icon: img,
            });
        }
        else {
            let img = electron_1.nativeImage.createFromPath((0, LoadUrlHelper_1.getHtmlFilePath)("images/transparent.png"));
            webContents.startDrag({
                file: localPath,
                icon: img,
            });
        }
    }
    else {
        return -1;
    }
}
electron_1.ipcMain.handle("_downloadOper", (event, data) => {
    if (data.key == "resume") {
        resume(data.value?.ids);
    }
    else if (data.key == "pause") {
        pause(data.value?.ids);
    }
    else if (data.key == "delete") {
        deleteItem(data.value?.ids, data.value?.delFile);
    }
    else if (data.key == "showItem") {
        return showItemInFolder(data.value?.id, data.value?.resId, data.value?.objectId);
    }
    else if (data.key == "openItem") {
        return openItemInFolder(data.value?.id, data.value?.resId);
    }
    else if (data.key == "dragItem") {
        dragItem(event.sender, data.value);
    }
    return undefined;
});
function deleteItemData(id) {
    m_DownloadInfoDb.deleteData("id=?", [id]);
    m_DownloadInFolderDb.deleteData("pid=?", [id]);
    for (let i = 0; i < m_DownloadQueue.length; i++) {
        if (id == m_DownloadQueue[i].id) {
            m_DownloadQueue.splice(i, 1);
            break;
        }
    }
    onItemQueueChanged();
}
const itemQueueChangedFun = (0, DebounceUtil_1.debounce)(() => {
    sendToDownloadCenter("downloadListChanged", getDownladList());
}, 300);
function onItemQueueChanged() {
    itemQueueChangedFun();
}
electron_1.ipcMain.on("_downloadSaveAs", (event, url, fileName) => {
    m_lastSaveAs = { url, fileName, saveTime: new Date().getTime() };
    event.sender.downloadURL(url);
});
electron_1.ipcMain.handle("_getNewDownloadCount", (event) => {
    return m_NewDownloadCount;
});
electron_1.ipcMain.on("_clearNewDownloadCount", (event) => {
    m_NewDownloadCount = 0;
    (0, MainHelper_1.setTempStore)("new_download_count", m_NewDownloadCount);
});
function clearNewDownloadCount() {
    m_NewDownloadCount = 0;
    (0, MainHelper_1.setTempStore)("new_download_count", m_NewDownloadCount);
}
exports.clearNewDownloadCount = clearNewDownloadCount;
electron_1.ipcMain.on("_setDownloadPath", (event, downloadPath) => {
    setDownloadPath(downloadPath);
});
electron_1.ipcMain.handle("_getDownloadPath", (event) => {
    return getDownloadDir();
});
module.exports = { setMainWindow };
//# sourceMappingURL=DownloadMainHelper.js.map