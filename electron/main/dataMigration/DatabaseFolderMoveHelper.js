"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRenameDbFolder = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
const AppSystemConfigMainHelper_1 = require("../AppSystemConfigMainHelper");
const MainHelper_1 = require("../MainHelper");
function checkRenameDbFolder() {
    let userDataPath;
    let defaultUserDataPath = electron_1.app.getPath("userData");
    let cfg = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
    if (cfg && cfg.dataFilePath) {
        userDataPath = cfg.dataFilePath;
    }
    else {
        userDataPath = defaultUserDataPath;
    }
    if (!arePathsEqual(userDataPath, defaultUserDataPath)) {
        if (process.platform == "darwin") {
            try {
                copyFolders(defaultUserDataPath, userDataPath);
            }
            catch (e) {
                console.error("copy resource files Folders error1:", e);
            }
        }
        return false;
    }
    let toDataPath = path_1.default.join(userDataPath, "cxfiles");
    try {
        if (copyFolders(userDataPath, toDataPath)) {
            setAppSystemConfig("dataFilePath", toDataPath);
        }
    }
    catch (e) {
        console.error("copy resource files Folders error2:", e);
    }
    return true;
}
exports.checkRenameDbFolder = checkRenameDbFolder;
function getNormalizeDirPath(dirPath) {
    let normalizedPath = path_1.default.normalize(dirPath);
    if (process.platform == "win32") {
        if (normalizedPath.endsWith("\\")) {
            return normalizedPath.substring(0, normalizedPath.length - 1);
        }
        else {
            return normalizedPath;
        }
    }
    else {
        if (normalizedPath.endsWith("/")) {
            return normalizedPath.substring(0, normalizedPath.length - 1);
        }
        else {
            return normalizedPath;
        }
    }
}
function arePathsEqual(path1, path2) {
    const normalizedPath1 = getNormalizeDirPath(path1);
    const normalizedPath2 = getNormalizeDirPath(path2);
    return normalizedPath1 == normalizedPath2;
}
function setAppSystemConfig(key, value) {
    let cfg = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
    cfg[key] = value;
    (0, MainHelper_1.setSysStore)("appSystemConfig", cfg);
}
function copyFolderForDb(src, dest) {
    if (!fs_1.default.existsSync(dest)) {
        fs_1.default.mkdirSync(dest, { recursive: true });
    }
    const entries = fs_1.default.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        const srcPath = path_1.default.join(src, entry.name);
        const destPath = path_1.default.join(dest, entry.name);
        try {
            if (entry.isDirectory()) {
                let ret = copyFolderForDb(srcPath, destPath);
                if (!ret) {
                    return false;
                }
            }
            else {
                if (fs_1.default.existsSync(destPath)) {
                    let srcFileStat = fs_1.default.statSync(srcPath);
                    let destFileStat = fs_1.default.statSync(destPath);
                    if (srcFileStat.mtimeMs > destFileStat.mtimeMs) {
                        fs_1.default.unlinkSync(destPath);
                    }
                }
                if (!fs_1.default.existsSync(destPath)) {
                    fs_1.default.copyFileSync(srcPath, destPath);
                    if (!fs_1.default.existsSync(destPath)) {
                        return false;
                    }
                }
            }
        }
        catch (e) {
            console.warn("复制文件夹出错");
            return false;
        }
    }
    return true;
}
function copyFolders(fromDir, toDir) {
    console.info(`renameFolders:开始重命名文件夹：from:${fromDir},to:${toDir}`);
    let folders = [
        "databases",
        "cxdatabases",
        "files/message_images",
        "files/message_audios",
    ];
    for (let folder of folders) {
        let fromPath = path_1.default.join(fromDir, folder);
        let toPath = path_1.default.join(toDir, folder);
        if (fs_1.default.existsSync(fromPath)) {
            let ret = copyFolderForDb(fromPath, toPath);
            if (!ret) {
                return false;
            }
        }
    }
    return true;
}
//# sourceMappingURL=DatabaseFolderMoveHelper.js.map