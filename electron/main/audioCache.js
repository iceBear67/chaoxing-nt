"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheMessageAudio = void 0;
const electron_1 = require("electron");
const PathUtil_1 = require("./PathUtil");
const fs_1 = __importDefault(require("fs"));
function cacheMessageAudio(url) {
    return new Promise((resovle, reject) => {
        if (!url) {
            resovle(undefined);
            return;
        }
        if (!url.startsWith("http")) {
            resovle(undefined);
            return;
        }
        let msgLocalPath = (0, PathUtil_1.getMessageAudioCachePath)(url);
        if (fs_1.default.existsSync(msgLocalPath)) {
            resovle(msgLocalPath);
            return;
        }
        resovle(undefined);
        downloadAudio(url, msgLocalPath);
    });
}
exports.cacheMessageAudio = cacheMessageAudio;
function downloadAudio(url, localPath) {
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
                        fs_1.default.renameSync(tmpFilePath, localPath);
                    }
                    catch (e) { }
                }
            }, 1);
        });
    });
    request.end();
}
module.exports = { cacheMessageAudio };
//# sourceMappingURL=audioCache.js.map