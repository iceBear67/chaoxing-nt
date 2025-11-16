"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClipboardFileInfos = void 0;
const cxHelper2_1 = require("../../module/cxHelper2");
const FileUtil_1 = require("./FileUtil");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function getClipboardFileInfos() {
    let resData = [];
    let files = (0, cxHelper2_1.getClipboardFilePath)();
    if (!files || files.length == 0) {
        return [];
    }
    for (let filePath of files) {
        if (fs_1.default.existsSync(filePath)) {
            let stat = fs_1.default.statSync(filePath);
            let fileName = path_1.default.basename(filePath);
            if (process.platform == "win32") {
                filePath = filePath.replace(/\\/g, "/");
            }
            if (stat.isFile()) {
                resData.push({
                    filePath,
                    fileName,
                    fileSize: stat.size,
                    fileType: 0,
                    lastModified: stat.mtimeMs,
                });
            }
            else if (stat.isDirectory()) {
                let folderInfo = (0, FileUtil_1.loadFolderSizeInfo)(filePath);
                resData.push({
                    filePath,
                    fileName,
                    fileSize: folderInfo.fileSize,
                    fileType: 1,
                    folderInfo,
                    lastModified: stat.mtimeMs,
                });
            }
        }
    }
    return resData;
}
exports.getClipboardFileInfos = getClipboardFileInfos;
//# sourceMappingURL=ClipboardUtil.js.map