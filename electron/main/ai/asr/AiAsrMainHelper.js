"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const UserHelper_1 = require("../../UserHelper");
const CryptoUtil_1 = require("../../../utils/CryptoUtil");
const SECRET_ID = "bc5e6e16030a403b850ea6fe53ba7852";
const SECRET_KEY = "1849cda3eb514d60abe13f31ee86dae6";
const ARS_TOKEN_URL = `https://ai.chaoxing.com/api/v1/asr/authorization`;
const OCR_URL = `https://ai.chaoxing.com/api/v1/ocr/common/sync`;
const TRANSLATE_URL = `https://ai.chaoxing.com/api/v1/text/translate/sync`;
async function getAsrToken() {
    return new Promise((resove, reject) => {
        let uid = (0, UserHelper_1.getUID)();
        if (!uid) {
            resove(undefined);
            return;
        }
        let url = `${ARS_TOKEN_URL}`;
        let request = electron_1.net.request({ url, useSessionCookies: true, method: "POST" });
        let nonce = getNonce();
        let parms = {
            secretId: SECRET_ID,
            nonce,
            from: "asr",
            uid,
            noKeep: 1,
            timestamp: Date.now(),
        };
        let parmsStr = JSON.stringify(parms);
        let signStr = parmsStr + SECRET_KEY;
        let signature = (0, CryptoUtil_1.md5)(signStr);
        request.setHeader("Content-Type", "application/json");
        request.setHeader("CX-Signature", signature);
        request.write(parmsStr);
        request.on("error", (error) => {
            console.error("getAsrToken error:", error);
            resove(undefined);
        });
        request.on("response", (response) => {
            if (response.statusCode != 200) {
                resove(undefined);
                console.warn("getAsrToken error.statusCode:", response.statusCode);
                return;
            }
            let resData = "";
            response.on("data", (chunk) => {
                resData += chunk.toString();
            });
            response.on("end", () => {
                if (!resData || resData.length == 0) {
                    resove(undefined);
                    return;
                }
                try {
                    let data = JSON.parse(resData);
                    if (data?.code === 0 && data?.data.token) {
                        resove(data.data.token);
                        return;
                    }
                }
                catch (error) {
                    console.warn("getAsrToken  response error:", error);
                }
                resove(undefined);
            });
        });
        request.end();
    });
}
async function ocrImage(options) {
    return new Promise((resove, reject) => {
        let uid = (0, UserHelper_1.getUID)();
        if (!uid) {
            resove(undefined);
            return;
        }
        let url = `${OCR_URL}`;
        let request = electron_1.net.request({ url, useSessionCookies: true, method: "POST" });
        let nonce = getNonce();
        let parms = {
            images: options.images,
            secretId: SECRET_ID,
            nonce,
            _from: "pc-cxstudy",
            user: {
                account: uid
            },
            timestamp: Date.now(),
        };
        let parmsStr = JSON.stringify(parms);
        let signStr = parmsStr + SECRET_KEY;
        let signature = (0, CryptoUtil_1.md5)(signStr);
        request.setHeader("Content-Type", "application/json");
        request.setHeader("CX-Signature", signature);
        request.write(parmsStr);
        request.on("error", (error) => {
            console.error("ocrImage error:", error);
            resove(undefined);
        });
        request.on("response", (response) => {
            if (response.statusCode != 200) {
                resove(undefined);
                console.warn("ocrImage error.statusCode:", response.statusCode);
                return;
            }
            let resData = "";
            response.on("data", (chunk) => {
                resData += chunk.toString();
            });
            response.on("end", () => {
                if (!resData || resData.length == 0) {
                    resove(undefined);
                    return;
                }
                try {
                    let data = JSON.parse(resData);
                    if (data?.code === 200) {
                        resove(data.data);
                        return;
                    }
                }
                catch (error) {
                    console.warn("parse JSON error", error);
                }
                resove(undefined);
            });
        });
        request.end();
    });
}
function getNonce() {
    const maxInt32 = Math.pow(2, 31) - 1;
    return Math.floor(Math.random() * maxInt32 - 10000000) + 10000000;
}
electron_1.ipcMain.handle("_getAiAsrToken", (event) => {
    return getAsrToken();
});
electron_1.ipcMain.handle("_ocrImage", async (event, options) => {
    return ocrImage(options);
});
electron_1.ipcMain.handle("_AITranslate", (event, contents, options) => {
    return translate(contents, options);
});
async function translate(contents, options) {
    const { sourceLanguage = "english", targetLanguage = "chinese" } = options ?? {};
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const nonce = getNonce();
        const user = {
            account: (0, UserHelper_1.getUID)(),
        };
        const params = {
            contents,
            user,
            sourceLanguage,
            targetLanguage,
            _from: "pc-cxstudy",
            secretId: SECRET_ID,
            nonce,
            timestamp
        };
        let paramsStr = JSON.stringify(params);
        let signStr = paramsStr + SECRET_KEY;
        let signature = (0, CryptoUtil_1.md5)(signStr);
        let url = `${TRANSLATE_URL}`;
        let request = electron_1.net.request({ url, useSessionCookies: true, method: "POST" });
        request.setHeader("Content-Type", "application/json");
        request.setHeader("CX-Signature", signature);
        request.write(paramsStr);
        request.on("error", (error) => {
            console.error("ocrImage error:", error);
            resolve(undefined);
        });
        request.on("response", (response) => {
            if (response.statusCode != 200) {
                resolve(undefined);
                console.warn("ocrImage error.statusCode:", response.statusCode);
                return;
            }
            let resData = "";
            response.on("data", (chunk) => {
                resData += chunk.toString();
            });
            response.on("end", () => {
                if (!resData || resData.length == 0) {
                    resolve(undefined);
                    return;
                }
                try {
                    let data = JSON.parse(resData);
                    if (data?.code === 200) {
                        resolve({ code: 200, data: data.data });
                        return;
                    }
                    else {
                        resolve({ code: 500, data: undefined });
                    }
                }
                catch (error) {
                    console.warn("parse JSON error", error);
                }
                resolve(undefined);
            });
        });
        request.end();
    });
}
//# sourceMappingURL=AiAsrMainHelper.js.map