"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearOldCacheData = exports.autoClearFileAndData = void 0;
const electron_1 = require("electron");
const PathUtil_1 = require("./PathUtil");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const UserHelper_1 = require("./UserHelper");
const DataCacheHelper_1 = require("./DataCacheHelper");
const DateUtil_1 = require("../utils/DateUtil");
const KEEP_LOG_DAYS = 30;
const KEEP_IMAGE_DAYS = 30;
const KEEP_CACHE_DATA_DAYS = 30;
const KEEP_AUDIO_DUMP_DAYS = 10;
function autoClearFileAndData() {
    try {
        let logDir = electron_1.app.getPath("logs");
        clearOldFileInFolder(logDir, KEEP_LOG_DAYS, KEEP_AUDIO_DUMP_DAYS);
        let imgCacheDir = path_1.default.join(electron_1.app.getPath("userData"), "files/images");
        clearOldFileInFolder(imgCacheDir, KEEP_IMAGE_DAYS);
        clearOldCacheData();
    }
    catch (e) {
        console.warn(e);
    }
}
exports.autoClearFileAndData = autoClearFileAndData;
function clearOldFileInFolder(folderPath, day, audioDumpDays = 0) {
    if (folderPath) {
        if (!fs_1.default.existsSync(folderPath)) {
            return;
        }
        let files = fs_1.default.readdirSync(folderPath, { encoding: "utf8" });
        let curTime = new Date().getTime();
        files.forEach((file) => {
            let filePath = path_1.default.join(folderPath, file);
            let stat = fs_1.default.statSync(filePath);
            if (stat.isFile()) {
                if (audioDumpDays > 0 &&
                    file.endsWith(".wav") &&
                    curTime - stat.mtimeMs > audioDumpDays * 24 * 60 * 60 * 1000) {
                    fs_1.default.unlinkSync(filePath);
                }
                else if (curTime - stat.mtimeMs > day * 24 * 60 * 60 * 1000) {
                    fs_1.default.unlinkSync(filePath);
                }
                else {
                    if (file.endsWith(".dmp") && !file.includes("__")) {
                        const updateTime = (0, DateUtil_1.dateFormat)("yyyyMMdd_HHmmss", stat.mtime);
                        const newFilePath = path_1.default.join(folderPath, `${updateTime}__${file}`);
                        if (!fs_1.default.existsSync(newFilePath)) {
                            fs_1.default.copyFileSync(filePath, newFilePath);
                        }
                    }
                }
            }
            else if (stat.isDirectory()) {
                clearOldFileInFolder(filePath, day);
            }
        });
        files = fs_1.default.readdirSync(folderPath, { encoding: "utf8" });
        if (files.length == 0) {
            fs_1.default.rmdirSync(folderPath);
        }
    }
}
function clearOldCacheData() {
    let dataPath = (0, PathUtil_1.getUserDataPath)();
    let dbFolder = path_1.default.join(dataPath, "databases");
    if (!fs_1.default.existsSync(dbFolder)) {
        return;
    }
    let puid = (0, UserHelper_1.getUID)();
    let folders = fs_1.default.readdirSync(dbFolder, { withFileTypes: true });
    let curTime = new Date().getTime();
    for (let folder of folders) {
        if (folder.isDirectory()) {
            if (folder.name == puid) {
                continue;
            }
            let folderPath = path_1.default.join(dbFolder, folder.name);
            let dbFiles = fs_1.default.readdirSync(folderPath);
            for (let dbFile of dbFiles) {
                if (dbFile == "data_cache.db" || dbFile == "data_cache__dev.db") {
                    let dbFilePath = path_1.default.join(folderPath, dbFile);
                    let stat = fs_1.default.statSync(dbFilePath);
                    if (curTime - stat.mtimeMs >
                        KEEP_CACHE_DATA_DAYS * 24 * 60 * 60 * 1000) {
                        fs_1.default.unlinkSync(dbFilePath);
                    }
                }
            }
        }
    }
    (0, DataCacheHelper_1.clearOldCacheDataInDb)(KEEP_CACHE_DATA_DAYS);
}
exports.clearOldCacheData = clearOldCacheData;
module.exports = { autoClearFileAndData, clearOldCacheData };
//# sourceMappingURL=ClearFileHelper.js.map