"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheHeadImage = exports.cacheMessageImage = exports.cacheImage = void 0;
const electron_1 = require("electron");
const PathUtil_1 = require("./PathUtil");
const fs_1 = __importDefault(require("fs"));
const url_1 = require("url");
function cacheImage(url) {
    return new Promise((resovle, reject) => {
        if (!url) {
            resovle(undefined);
            return;
        }
        if (url.startsWith("file")) {
            let filePath = (0, url_1.fileURLToPath)(url);
            resovle(filePath);
            return;
        }
        if (!url.startsWith("http")) {
            resovle(undefined);
            return;
        }
        if (process.platform == "darwin") {
            if (url.startsWith("/")) {
                resovle(url);
                return;
            }
        }
        else {
            const regex = /^([A-Z]):\\/i;
            const matches = regex.exec(url);
            if (matches !== null) {
                resovle(url);
                return;
            }
        }
        let url2 = url;
        let timeFlagIndex = url.indexOf("&_timeFlag=");
        if (timeFlagIndex > 0) {
            url2 = url.substring(0, timeFlagIndex);
        }
        else {
            timeFlagIndex = url.indexOf("?_timeFlag=");
            if (timeFlagIndex > 0) {
                url2 = url.substring(0, timeFlagIndex);
            }
        }
        let localPath = (0, PathUtil_1.getImageCachePath)(url2);
        if (fs_1.default.existsSync(localPath)) {
            resovle(localPath);
        }
        else {
            resovle(undefined);
            downloadImage(url, localPath);
        }
    });
}
exports.cacheImage = cacheImage;
function cacheMessageImage(url) {
    return new Promise((resovle, reject) => {
        if (!url) {
            resovle(undefined);
            return;
        }
        if (url.startsWith("file")) {
            let filePath = (0, url_1.fileURLToPath)(url);
            resovle(filePath);
            return;
        }
        if (!url.startsWith("http")) {
            resovle(undefined);
            return;
        }
        if (process.platform == "darwin") {
            if (url.startsWith("/")) {
                resovle(url);
                return;
            }
        }
        else {
            const regex = /^([A-Z]):\\/i;
            const matches = regex.exec(url);
            if (matches !== null) {
                resovle(url);
                return;
            }
        }
        let url2 = url;
        let timeFlagIndex = url.indexOf("&_timeFlag=");
        if (timeFlagIndex > 0) {
            url2 = url.substring(0, timeFlagIndex);
        }
        else {
            timeFlagIndex = url.indexOf("?_timeFlag=");
            if (timeFlagIndex > 0) {
                url2 = url.substring(0, timeFlagIndex);
            }
        }
        let msgLocalPath = (0, PathUtil_1.getMessageImageCachePath)(url2);
        if (fs_1.default.existsSync(msgLocalPath)) {
            resovle(msgLocalPath);
            return;
        }
        let localPath = (0, PathUtil_1.getImageCachePath)(url2);
        if (fs_1.default.existsSync(localPath)) {
            resovle(localPath);
            fs_1.default.copyFileSync(localPath, msgLocalPath);
            return;
        }
        resovle(undefined);
        downloadImage(url, msgLocalPath);
    });
}
exports.cacheMessageImage = cacheMessageImage;
function cacheHeadImage(url) {
    return new Promise((resovle, reject) => {
        if (!url) {
            resovle(undefined);
            return;
        }
        if (url.startsWith("file")) {
            let filePath = (0, url_1.fileURLToPath)(url);
            resovle(filePath);
            return;
        }
        if (process.platform == "darwin") {
            if (url.startsWith("/")) {
                resovle(url);
                return;
            }
        }
        else {
            const regex = /^([A-Z]):\\/i;
            const matches = regex.exec(url);
            if (matches !== null) {
                resovle(url);
                return;
            }
        }
        if (!url.startsWith("http")) {
            resovle(undefined);
            return;
        }
        let url2 = url;
        let timeFlagIndex = url.indexOf("&_timeFlag=");
        if (timeFlagIndex > 0) {
            url2 = url.substring(0, timeFlagIndex);
        }
        else {
            timeFlagIndex = url.indexOf("?_timeFlag=");
            if (timeFlagIndex > 0) {
                url2 = url.substring(0, timeFlagIndex);
            }
        }
        let localPath = (0, PathUtil_1.getImageCachePath)(url2);
        if (fs_1.default.existsSync(localPath)) {
            resovle(localPath);
            setTimeout(() => {
                downloadImage(url, localPath);
            }, 500);
        }
        else {
            resovle(undefined);
            downloadImage(url, localPath);
        }
    });
}
exports.cacheHeadImage = cacheHeadImage;
function downloadImage(url, localPath) {
    let tmpFilePath = localPath + "_tmp";
    if (fs_1.default.existsSync(tmpFilePath)) {
        let stat = fs_1.default.statSync(tmpFilePath);
        if (new Date().getTime() - stat.mtimeMs < 5000) {
            return;
        }
        try {
            fs_1.default.unlinkSync(tmpFilePath);
        }
        catch (e) {
            console.error("unlinkSync error:", e);
        }
        if (fs_1.default.existsSync(tmpFilePath)) {
            return;
        }
    }
    const request = electron_1.net.request({
        url,
        useSessionCookies: true,
    });
    request.on("response", (response) => {
        if (response.statusCode != 200) {
            return;
        }
        if (fs_1.default.existsSync(tmpFilePath)) {
            let stat = fs_1.default.statSync(tmpFilePath);
            if (new Date().getTime() - stat.mtimeMs < 5000) {
                return;
            }
            fs_1.default.unlinkSync(tmpFilePath);
            if (fs_1.default.existsSync(tmpFilePath)) {
                return;
            }
        }
        let wstream = fs_1.default.createWriteStream(tmpFilePath);
        response.on("data", (chunk) => {
            wstream.write(chunk);
        });
        response.on("end", () => {
            wstream.end();
            setTimeout(() => {
                if (fs_1.default.existsSync(tmpFilePath)) {
                    try {
                        if (fs_1.default.existsSync(localPath)) {
                            fs_1.default.unlinkSync(localPath);
                        }
                        if (!fs_1.default.existsSync(localPath)) {
                            fs_1.default.renameSync(tmpFilePath, localPath);
                        }
                    }
                    catch (e) {
                        console.warn("rename image file error:", e);
                    }
                }
            }, 1);
        });
    });
    request.end();
}
module.exports = { cacheImage, cacheHeadImage, cacheMessageImage };
//# sourceMappingURL=ImageCache.js.map