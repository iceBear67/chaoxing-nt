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
exports.cancelMigrationData = exports.migrationData = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const RendererHelper = __importStar(require("./RendererHelper"));
const electron_1 = require("electron");
let m_CopySize = 0;
let m_TotalSize = 0;
let m_LastProgress = 0;
async function migrationData(fromPath, toPath) {
    console.info(`migrationData:开始迁移数据：from:${fromPath},to:${toPath}`);
    let data = loadFileList(fromPath, toPath, "databases");
    m_TotalSize = data.size;
    let fileList = data.fileList;
    let data5 = loadFileList(fromPath, toPath, "cxdatabases");
    if (data5?.fileList?.length > 0) {
        m_TotalSize += data5.size;
        fileList.push(...data5.fileList);
    }
    let data2 = loadFileList(fromPath, toPath, "files/message_images");
    m_TotalSize += data2.size;
    fileList.push(...data2.fileList);
    let data3 = loadFileList(fromPath, toPath, "files/message_audios");
    m_TotalSize += data3.size;
    fileList.push(...data3.fileList);
    for (let file of fileList) {
        let ret = await copyFile(path_1.default.join(fromPath, file), path_1.default.join(toPath, file));
        if (!ret) {
            return false;
        }
    }
    RendererHelper.sendToMainProcess("_migrationDataFinished");
    return true;
}
exports.migrationData = migrationData;
function cancelMigrationData() {
    RendererHelper.sendToMainProcess("_migrationDataCancel");
}
exports.cancelMigrationData = cancelMigrationData;
function addCopySize(addSize) {
    m_CopySize += addSize;
    let progress = Math.floor((m_CopySize * 100) / m_TotalSize);
    if (progress != m_LastProgress) {
        RendererHelper.emit("migrationProgressUpdate", progress);
        m_LastProgress = progress;
    }
}
async function copyFile(fromFile, toFile) {
    return new Promise((resolve, reject) => {
        let rStream = fs_1.default.createReadStream(fromFile, { highWaterMark: 512 * 1024 });
        let wstream = fs_1.default.createWriteStream(toFile);
        rStream.on("data", (chunck) => {
            wstream.write(chunck, (error) => {
                if (error) {
                    console.warn("copyFile error:", error);
                    rStream.close();
                    wstream.close();
                    resolve(false);
                    return;
                }
                addCopySize(chunck.length);
            });
        });
        rStream.on("error", (err) => {
            console.warn("copyFile error2:", err);
            wstream.close();
            resolve(false);
        });
        rStream.on("end", () => {
            wstream.end(() => {
                resolve(true);
            });
        });
    });
}
function loadFileList(rootPath, toRootPath, folderRelativePath) {
    let folderPath = path_1.default.join(rootPath, folderRelativePath);
    if (!fs_1.default.existsSync(folderPath)) {
        return { size: 0, fileList: [] };
    }
    let toFolderPath = path_1.default.join(toRootPath, folderRelativePath);
    if (!fs_1.default.existsSync(toFolderPath)) {
        fs_1.default.mkdirSync(toFolderPath, { recursive: true });
    }
    let files = fs_1.default.readdirSync(folderPath, { withFileTypes: true });
    let size = 0;
    let fileList = [];
    files.forEach((file) => {
        let relPath = `${folderRelativePath}/${file.name}`;
        if (file.isFile()) {
            fileList.push(relPath);
            size += fs_1.default.statSync(path_1.default.join(folderPath, file.name)).size;
        }
        else if (file.isDirectory()) {
            let data = loadFileList(rootPath, toRootPath, relPath);
            fileList.push(...data.fileList);
            size += data.size;
        }
    });
    return { size, fileList };
}
electron_1.contextBridge.exposeInMainWorld("DataMigrationHelper", {
    migrationData,
    cancelMigrationData,
});
module.exports = { migrationData, cancelMigrationData };
//# sourceMappingURL=DataMigrationHelper.js.map