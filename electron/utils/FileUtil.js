"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyFolderUseFs = exports.loadFolderSizeInfo = exports.countFolderSize = exports.countFilesInFolder = exports.copyDirAsync = exports.copyDir = exports.getFileSize = exports.deleteFile = exports.deleteDirAsync = exports.deleteDir = void 0;
const child_process_1 = __importDefault(require("child_process"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function deleteDir(dir) {
    if (fs_1.default.existsSync(dir)) {
        let cmd;
        if (process.platform == "darwin") {
            cmd = `rm -R "${dir}"`;
        }
        else {
            cmd = `rmdir /Q /S "${dir}"`;
        }
        let ret = child_process_1.default.execSync(cmd, { encoding: "utf-8" });
        console.log(ret);
    }
}
exports.deleteDir = deleteDir;
async function deleteDirAsync(dir) {
    if (fs_1.default.existsSync(dir)) {
        let cmd;
        if (process.platform == "darwin") {
            cmd = `rm -R "${dir}"`;
        }
        else {
            cmd = `rmdir /Q /S "${dir}"`;
        }
        return new Promise((resolve, reject) => {
            child_process_1.default.exec(cmd, { encoding: "utf-8" }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`删除文件夹失败:dir:${dir}`, error);
                    resolve(false);
                    return;
                }
                if (fs_1.default.existsSync(dir)) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    else {
        return false;
    }
}
exports.deleteDirAsync = deleteDirAsync;
function deleteFile(filePath) {
    if (filePath && fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
}
exports.deleteFile = deleteFile;
function getFileSize(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        return 0;
    }
    let stat = fs_1.default.statSync(filePath);
    if (stat.size != 0) {
        return stat.size;
    }
    if (process.platform == "win32") {
        let cmd = `dir "${filePath}"`;
        let ret = child_process_1.default.execSync(cmd, { encoding: "utf-8" });
        let strs = ret.split("\n");
        let strs2 = strs[strs.length - 3].split(" ");
        try {
            let sizeStr = strs2[strs2.length - 2];
            let size = parseInt(sizeStr.trim().replaceAll(",", ""));
            if (size) {
                return size;
            }
            else {
                return 0;
            }
        }
        catch (e) {
            return 0;
        }
    }
    else {
        let cmd = `ls -l "${filePath}"`;
        let ret = child_process_1.default.execSync(cmd, { encoding: "utf-8" });
        let strs = ret.split("\n");
        let strs2 = strs[strs.length - 1].split(" ");
        try {
            let sizeStr = strs2[4];
            let size = parseInt(sizeStr.trim());
            if (size) {
                return size;
            }
            else {
                return 0;
            }
        }
        catch (e) {
            return 0;
        }
    }
}
exports.getFileSize = getFileSize;
function copyDir(src, dist) {
    let cmd;
    if (fs_1.default.existsSync(dist)) {
        if (process.platform == "darwin") {
            cmd = `rm -R "${dist}"`;
        }
        else {
            cmd = `rmdir /Q /S "${dist}"`;
        }
        let ret = child_process_1.default.execSync(cmd, { encoding: "utf-8" });
        console.log(ret);
    }
    if (fs_1.default.existsSync(dist)) {
        return false;
    }
    let toPdir = path_1.default.dirname(dist);
    {
        if (!fs_1.default.existsSync(toPdir)) {
            fs_1.default.mkdirSync(toPdir, { recursive: true });
        }
    }
    if (process.platform == "darwin") {
        cmd = `cp -R "${src}" "${dist}"`;
    }
    else {
        if (!fs_1.default.existsSync(dist)) {
            fs_1.default.mkdirSync(dist, { recursive: true });
        }
        cmd = `xcopy /c /e /y "${src}" "${dist}"`;
    }
    console.log("copy cmd:", cmd);
    let ret = child_process_1.default.execSync(cmd, { encoding: "utf-8" });
    console.debug("copy dir result:", ret);
    if (!fs_1.default.existsSync(dist)) {
        return false;
    }
    return true;
}
exports.copyDir = copyDir;
async function copyDirAsync(src, dist) {
    let cmd;
    if (fs_1.default.existsSync(dist)) {
        if (process.platform == "darwin") {
            cmd = `rm -R "${dist}"`;
        }
        else {
            cmd = `rmdir /Q /S "${dist}"`;
        }
        let ret = child_process_1.default.execSync(cmd, { encoding: "utf-8" });
        console.log(ret);
    }
    if (fs_1.default.existsSync(dist)) {
        return false;
    }
    let args = [];
    if (process.platform == "darwin") {
        cmd = `cp`;
        args = ["-R", src, dist];
    }
    else {
        if (!fs_1.default.existsSync(dist)) {
            fs_1.default.mkdirSync(dist, { recursive: true });
        }
        cmd = `xcopy`;
        args = ["/c", "/e", "/y", src, dist];
    }
    console.log("copy cmd:", cmd);
    return new Promise((resolve, reject) => {
        let childProcess = child_process_1.default.spawn(cmd, args);
        childProcess.stdout.on("data", (chunck) => {
        });
        childProcess.on("close", (code) => {
            if (!fs_1.default.existsSync(dist)) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}
exports.copyDirAsync = copyDirAsync;
function countFilesInFolder(folderPath) {
    try {
        const files = fs_1.default.readdirSync(folderPath);
        let fileCount = 0;
        files.forEach((file) => {
            const filePath = path_1.default.join(folderPath, file);
            if (fs_1.default.statSync(filePath).isDirectory()) {
                fileCount += countFilesInFolder(filePath);
            }
            else {
                fileCount++;
            }
        });
        return fileCount;
    }
    catch (err) {
        console.error("无法读取文件夹:", err);
        return 0;
    }
}
exports.countFilesInFolder = countFilesInFolder;
function countFolderSize(folderPath) {
    try {
        const files = fs_1.default.readdirSync(folderPath);
        let fileSize = 0;
        files.forEach((file) => {
            const filePath = path_1.default.join(folderPath, file);
            let stat = fs_1.default.statSync(filePath);
            if (stat.isDirectory()) {
                fileSize += countFolderSize(filePath);
            }
            else {
                if (stat.isFile()) {
                    fileSize += stat.size;
                }
            }
        });
        return fileSize;
    }
    catch (err) {
        console.error("无法读取文件夹:", err);
        return 0;
    }
}
exports.countFolderSize = countFolderSize;
function loadFolderSizeInfo(folderPath) {
    const folderInfo = {
        fileSize: 0,
        subFileCount: 0,
        subFolderCount: 0,
    };
    if (!fs_1.default.existsSync(folderPath)) {
        return folderInfo;
    }
    const files = fs_1.default.readdirSync(folderPath);
    for (let file of files) {
        let subFilePath = path_1.default.join(folderPath, file);
        let stat = fs_1.default.statSync(subFilePath);
        if (stat.isFile()) {
            if (file == ".DS_Store" && process.platform == "darwin") {
                continue;
            }
            folderInfo.subFileCount++;
            folderInfo.fileSize += stat.size;
        }
        else if (stat.isDirectory()) {
            folderInfo.subFolderCount++;
            const subFolderInfo = loadFolderSizeInfo(subFilePath);
            folderInfo.subFolderCount += subFolderInfo.subFolderCount;
            folderInfo.subFileCount += subFolderInfo.subFileCount;
            folderInfo.fileSize += subFolderInfo.fileSize;
        }
    }
    return folderInfo;
}
exports.loadFolderSizeInfo = loadFolderSizeInfo;
function copyFolderUseFs(src, dest) {
    deleteDir(dest);
    if (!fs_1.default.existsSync(dest)) {
        fs_1.default.mkdirSync(dest, { recursive: true });
    }
    const entries = fs_1.default.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        const srcPath = path_1.default.join(src, entry.name);
        const destPath = path_1.default.join(dest, entry.name);
        try {
            if (entry.isDirectory()) {
                let ret = copyFolderUseFs(srcPath, destPath);
                if (!ret) {
                    return false;
                }
            }
            else {
                fs_1.default.copyFileSync(srcPath, destPath);
                if (!fs_1.default.existsSync(destPath)) {
                    return false;
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
exports.copyFolderUseFs = copyFolderUseFs;
module.exports = {
    deleteDir,
    deleteDirAsync,
    deleteFile,
    getFileSize,
    copyDir,
    copyDirAsync,
    countFilesInFolder,
    countFolderSize,
    loadFolderSizeInfo,
    copyFolderUseFs,
};
exports.default = module.exports;
//# sourceMappingURL=FileUtil.js.map