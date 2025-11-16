"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const SessionCookie_1 = __importDefault(require("./SessionCookie"));
const CryptoUtil_1 = require("../utils/CryptoUtil");
electron_1.ipcMain.handle("_getTencentSpeechKey", (event) => {
    return getTencentSpeechKey();
});
async function getTencentSpeechKey() {
    const key = "pm^s2)h";
    const puid = await SessionCookie_1.default.getUID();
    if (!puid) {
        return;
    }
    const time = new Date().getTime();
    const enc = (0, CryptoUtil_1.md5)(`${puid}_${time}_${key}`);
    const url = `https://k.chaoxing.com/apis/tencent/getFederationToken?puid=${puid}&time=${time}&enc=${enc}&crossOrigin=true`;
    return new Promise((resolve, reject) => {
        const request = electron_1.net.request({ url, useSessionCookies: true });
        request.on("response", (response) => {
            if (response.statusCode == 200) {
                let responseBuf;
                response.on("data", (chunk) => {
                    if (responseBuf) {
                        responseBuf = Buffer.concat([responseBuf, chunk]);
                    }
                    else {
                        responseBuf = chunk;
                    }
                });
                response.on("end", () => {
                    console.log("响应中已无数据");
                    console.debug(`BODY: ${responseBuf}`);
                    let resData = JSON.parse(responseBuf.toString());
                    if (!resData || resData.result != 1 || !resData?.data) {
                        return;
                    }
                    resolve(resData.data);
                });
                response.on("error", (err) => {
                    console.warn("请求语音识别权限出错:response error:", err);
                    resolve(0);
                });
            }
            else {
                resolve(0);
            }
        });
        request.on("error", (err) => {
            console.warn("请求语音识别权限出错:request error:", err);
            resolve(0);
        });
        request.end();
    });
}
function getXinYiSign(apiKey, ts) {
    const secretKey = "9cddf2a461b8b40962d9a8723e7e0ea32028e505";
    ts = ts + "";
    const baseString = apiKey + ts;
    const md5BaseString = (0, CryptoUtil_1.md5)(baseString);
    const sign = (0, CryptoUtil_1.hmacSHA1EncodeBase64)(md5BaseString, secretKey);
    return sign;
}
electron_1.ipcMain.handle("_getXinYiSign", (event, apikey, ts) => {
    return getXinYiSign(apikey, ts);
});
//# sourceMappingURL=EncryMainHelper.js.map