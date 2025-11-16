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
exports.createFolder = exports.removeFile = exports.renameFile = exports.isExistFile = exports.searchFile = exports.getPathByType = exports.getFileList = void 0;
const RendererHelper = __importStar(require("./RendererHelper"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const electron_1 = require("electron");
const FileUtil_1 = require("../utils/FileUtil");
class FileInfo {
    constructor() {
        this.fileSize = 0;
    }
}
function getFileList(dir) {
    let files = fs_1.default.readdirSync(dir, { withFileTypes: true });
    let fileList = [];
    if (!files) {
        return [];
    }
    for (let file of files) {
        if (dir == "/") {
            if (file.name.startsWith(".")) {
                continue;
            }
        }
        if (file.isDirectory())
            if (!file.isDirectory() && !file.isFile()) {
                continue;
            }
        let filePath = path_1.default.join(dir, file.name);
        try {
            let fileStat = fs_1.default.statSync(filePath);
            let fileInfo = new FileInfo();
            fileInfo.fileName = file.name;
            fileInfo.filePath = filePath;
            fileInfo.isDir = fileStat.isDirectory();
            fileInfo.createTime = Math.floor(fileStat.ctimeMs);
            fileInfo.modifyTime = Math.floor(fileStat.mtimeMs);
            if (!fileInfo.isDir) {
                fileInfo.fileSize = fileStat.size;
            }
            fileList.push(fileInfo);
        }
        catch (e) {
            console.warn(`获取文件、文件夹信息失败:${filePath}`, e);
        }
    }
    return fileList;
}
exports.getFileList = getFileList;
async function getPathByType(type) {
    return RendererHelper.getPathByType(type);
}
exports.getPathByType = getPathByType;
async function searchFile(dir, searchKey) {
    return new Promise((resolve, reject) => {
        fs_1.default.readdir(dir, async (err, files) => {
            if (!files) {
                return;
            }
            let fileList = [];
            for (let file of files) {
                if (err) {
                    reject(err);
                    return;
                }
                if (dir == "/") {
                    if (file.startsWith(".")) {
                        continue;
                    }
                }
                let filePath = path_1.default.join(dir, file);
                try {
                    let fileStat = await promises_1.default.lstat(filePath);
                    if ((!fileStat.isDirectory() && !fileStat.isFile()) ||
                        fileStat.isSymbolicLink()) {
                        continue;
                    }
                    if (fileStat.isDirectory()) {
                        let subFileList = await searchFile(filePath, searchKey);
                        if (subFileList.length > 0) {
                            fileList.push(...subFileList);
                        }
                    }
                    if (!file.includes(searchKey)) {
                        continue;
                    }
                    let fileInfo = new FileInfo();
                    fileInfo.fileName = file;
                    fileInfo.filePath = filePath;
                    fileInfo.isDir = fileStat.isDirectory();
                    fileInfo.createTime = Math.floor(fileStat.ctimeMs);
                    fileInfo.modifyTime = Math.floor(fileStat.mtimeMs);
                    if (!fileInfo.isDir) {
                        fileInfo.fileSize = fileStat.size;
                    }
                    else {
                    }
                    fileList.push(fileInfo);
                }
                catch (e) {
                    console.warn(`获取文件、文件夹信息失败:${filePath}`, e);
                }
            }
            resolve(fileList);
        });
    });
}
exports.searchFile = searchFile;
function isExistFile(filePath) {
    return fs_1.default.existsSync(filePath);
}
exports.isExistFile = isExistFile;
function renameFile(oldPath, newPath) {
    if (fs_1.default.existsSync(newPath)) {
        return false;
    }
    try {
        fs_1.default.renameSync(oldPath, newPath);
    }
    catch (e) {
        console.error(`renameFile error:oldFile:${oldPath},newFile:${newPath}`, e);
    }
    if (fs_1.default.existsSync(newPath)) {
        return true;
    }
    else {
        return false;
    }
}
exports.renameFile = renameFile;
async function removeFile(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        return false;
    }
    let stat = await fs_1.default.promises.stat(filePath);
    if (stat.isDirectory()) {
        let ret = await (0, FileUtil_1.deleteDirAsync)(filePath);
        return ret;
    }
    else {
        await fs_1.default.promises.unlink(filePath);
        if (!fs_1.default.existsSync(filePath)) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.removeFile = removeFile;
function createFolder(dirPath, folderName) {
    let folderPath = path_1.default.join(dirPath, folderName);
    fs_1.default.mkdirSync(folderPath, { recursive: true });
    return fs_1.default.existsSync(folderPath);
}
exports.createFolder = createFolder;
module.exports = {
    getFileList,
    searchFile,
    getPathByType,
    renameFile,
    removeFile,
    createFolder,
};
electron_1.contextBridge.exposeInMainWorld("StorageHelper", module.exports);
//# sourceMappingURL=StorageHelper.js.map