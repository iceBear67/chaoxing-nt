"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndRenamePath = exports.getUserDataPath = exports.getMessageAudioCachePath = exports.getMessageImageCachePath = exports.getImageCachePath = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const UserHelper_1 = require("./UserHelper");
const AppSystemConfigMainHelper_1 = require("./AppSystemConfigMainHelper");
function getImageCachePath(url) {
    let extname = path_1.default.extname(url);
    let localFileName = (0, CryptoUtil_1.md5)(url);
    if (extname && extname.length < 6 && !extname.includes("?")) {
        localFileName += `${extname}`;
    }
    else {
        localFileName += `.png`;
    }
    let imageCacheDir = path_1.default.join(electron_1.app.getPath("userData"), "files/images");
    if (!fs_1.default.existsSync(imageCacheDir)) {
        fs_1.default.mkdirSync(imageCacheDir, { recursive: true });
    }
    return path_1.default.join(imageCacheDir, localFileName);
}
exports.getImageCachePath = getImageCachePath;
function getMessageImageCachePath(url) {
    let puid = (0, UserHelper_1.getUID)();
    if (!puid) {
        puid = "guest";
    }
    let extname = path_1.default.extname(url);
    let localFileName = (0, CryptoUtil_1.md5)(url);
    if (extname && extname.length < 6 && !extname.includes("?")) {
        localFileName += `${extname}`;
    }
    else {
        localFileName += `.png`;
    }
    let imageCacheDir = path_1.default.join(getUserDataPath(), `files/message_images/${puid}`);
    if (!fs_1.default.existsSync(imageCacheDir)) {
        fs_1.default.mkdirSync(imageCacheDir, { recursive: true });
    }
    return path_1.default.join(imageCacheDir, localFileName);
}
exports.getMessageImageCachePath = getMessageImageCachePath;
function getMessageAudioCachePath(url) {
    let puid = (0, UserHelper_1.getUID)();
    if (!puid) {
        puid = "guest";
    }
    let extname = path_1.default.extname(url);
    let localFileName = (0, CryptoUtil_1.md5)(url);
    if (extname && extname.length < 6 && !extname.includes("?")) {
        localFileName += `${extname}`;
    }
    else {
        localFileName += `.amr`;
    }
    let audioCacheDir = path_1.default.join(getUserDataPath(), `files/message_audios/${puid}`);
    if (!fs_1.default.existsSync(audioCacheDir)) {
        fs_1.default.mkdirSync(audioCacheDir, { recursive: true });
    }
    return path_1.default.join(audioCacheDir, localFileName);
}
exports.getMessageAudioCachePath = getMessageAudioCachePath;
function getUserDataPath() {
    let userDataPath;
    if (process.platform == "win32") {
        let cfg = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
        if (cfg && cfg.dataFilePath) {
            userDataPath = cfg.dataFilePath;
        }
        else {
            userDataPath = electron_1.app.getPath("userData");
        }
    }
    else {
        userDataPath = electron_1.app.getPath("userData");
    }
    return userDataPath;
}
exports.getUserDataPath = getUserDataPath;
function checkAndRenamePath(oldPath) {
    let dir = path_1.default.dirname(oldPath);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    if (!fs_1.default.existsSync(dir)) {
        return null;
    }
    let filePath = oldPath;
    let extname = path_1.default.extname(oldPath);
    let basename = path_1.default.basename(oldPath, extname);
    let tempIndex = 2;
    while (true) {
        if (fs_1.default.existsSync(filePath)) {
            let filename2 = `${basename}(${tempIndex++})${extname}`;
            filePath = path_1.default.join(dir, filename2);
            continue;
        }
        break;
    }
    return filePath;
}
exports.checkAndRenamePath = checkAndRenamePath;
//# sourceMappingURL=PathUtil.js.map