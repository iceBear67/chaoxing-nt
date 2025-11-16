"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setVerifyKey = exports.decodeVerifyData = exports.createVerifyData = void 0;
const electron_1 = require("electron");
const os_1 = __importDefault(require("os"));
const child_process_1 = require("child_process");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const url_1 = require("url");
const WebRequestHelper_1 = require("./WebRequestHelper");
let m_VerifyKey;
function createVerifyData() {
    let ua = electron_1.session.defaultSession.getUserAgent();
    let customUa = ua.substring(ua.indexOf("(schild:"));
    let pkgNameStr = customUa.split(" ")[3];
    let pkgName = pkgNameStr.substring(0, pkgNameStr.indexOf("/"));
    let devId = customUa.substring(customUa.lastIndexOf("_") + 1);
    const cpus = os_1.default.cpus();
    const networkInterfaces = os_1.default.networkInterfaces();
    let mac_addrs = [];
    for (const deviceName in networkInterfaces) {
        const device = networkInterfaces[deviceName];
        for (const details of device) {
            if (details.family === "IPv4" && !details.internal) {
                mac_addrs.push(details.mac);
            }
        }
    }
    mac_addrs.sort();
    let data = {
        app_name: pkgName,
        app_ver: electron_1.app.getVersion().replace("-", "."),
        device_id: devId,
        platform: `pc_${os_1.default.platform()}`,
        os_release: os_1.default.release(),
        os_arch: os_1.default.arch(),
        os_user: os_1.default.userInfo(),
        cpu_model: cpus[0].model,
        cpu_count: cpus.length,
        memory_size: `${os_1.default.totalmem() / 1024 / 1024 / 1024}GB`,
        mac_addrs,
        screenScaleFactor: electron_1.screen.getPrimaryDisplay().scaleFactor,
        time_stamp: new Date().getTime(),
    };
    if (process.platform == "darwin") {
        let modelName = (0, child_process_1.execSync)(`system_profiler SPHardwareDataType | grep "Model Name"`, {
            encoding: "utf-8",
        });
        if (modelName) {
            let tempIds = modelName.split(":");
            if (tempIds.length > 1) {
                data.modelName = tempIds[1];
            }
        }
        let modelIdentifier = (0, child_process_1.execSync)(`system_profiler SPHardwareDataType | grep "Model Identifier"`, {
            encoding: "utf-8",
        });
        if (modelIdentifier) {
            let tempIds = modelIdentifier.split(":");
            if (tempIds.length > 1) {
                data.modelIdentifier = tempIds[1];
            }
        }
        let tempRes = (0, child_process_1.execSync)("system_profiler SPHardwareDataType", {
            encoding: "utf-8",
        });
        if (tempRes) {
            let tempLines = tempRes.split("\n");
            if (tempLines.length > 1) {
                for (let tempLine of tempLines) {
                    if (tempLine.includes("Serial Number:")) {
                        data.cdid = tempLine.split(":")[1];
                        break;
                    }
                    if (tempLine.includes("Hardware UUID")) {
                        data.cdid = tempLine.split(":")[1];
                        break;
                    }
                }
            }
        }
    }
    else {
        try {
            let vendor = (0, child_process_1.execSync)(`wmic csproduct get vendor`, {
                encoding: "utf-8",
            });
            if (vendor) {
                let tempIds = vendor.split("\n");
                if (tempIds.length > 1) {
                    data.vendor = tempIds[1].trim();
                }
            }
        }
        catch (e) {
            console.error("wmic csproduct get vendor error:", e);
        }
        try {
            let tempRes = (0, child_process_1.execSync)("wmic diskdrive get serialnumber", {
                encoding: "utf-8",
            });
            if (tempRes) {
                let tempSerNums = tempRes.split("\n");
                if (tempSerNums.length > 1) {
                    data.cdid = tempSerNums[1].trim();
                }
            }
        }
        catch (e) {
            console.error("wmic diskdrive get serialnumber error:", e);
        }
    }
    if (!data.cdid) {
        data.cdid = devId;
    }
    let jsonData = JSON.stringify(data);
    console.log("verify data:", jsonData);
    return (0, CryptoUtil_1.encodeRSA)(jsonData, "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCkpEde9dnCRkL8thNMM1VI5vuOyyey3g/iUJb1r8YjmsEnsKMZZ0XPvq2YaM5sa02CmIvzhUWqMuYCFzwkh3sAnfBey7M8/PAfvAFxUVCs+qg7oDUReul51V5CpP1cb2ldBhWocojhmB4mQI+Evqz8qgyS0l/bzBVVODomMZxW3QIDAQAB");
}
exports.createVerifyData = createVerifyData;
function decodeVerifyData(data) {
    return (0, CryptoUtil_1.decodeRSAByPublicKey)(data, `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCkpEde9dnCRkL8thNMM1VI5vuOyyey3g/iUJb1r8YjmsEnsKMZZ0XPvq2YaM5sa02CmIvzhUWqMuYCFzwkh3sAnfBey7M8/PAfvAFxUVCs+qg7oDUReul51V5CpP1cb2ldBhWocojhmB4mQI+Evqz8qgyS0l/bzBVVODomMZxW3QIDAQAB`);
}
exports.decodeVerifyData = decodeVerifyData;
function setVerifyKey(verifyKey) {
    if (!m_VerifyKey) {
        initRequestIntercept();
    }
    m_VerifyKey = verifyKey;
}
exports.setVerifyKey = setVerifyKey;
const InterceptUrls = [
    "https://fystat-ans.chaoxing.com/log/setlog?",
    "https://mooc1-api.chaoxing.com/job/submitstudy?",
    "https://mooc1-api.chaoxing.com/mooc-ans/multimedia/log?",
];
function isInterceptUrl(url) {
    for (let interceptUrl of InterceptUrls) {
        if (url.startsWith(interceptUrl)) {
            return true;
        }
    }
    return false;
}
function initRequestIntercept() {
    (0, WebRequestHelper_1.addBeforeRequestListener)("safeVerify", async (details) => {
        if (!isInterceptUrl(details.url)) {
            return 0;
        }
        if (m_VerifyKey &&
            (details.resourceType == "mainFrame" ||
                details.resourceType == "subFrame" ||
                details.resourceType == "script" ||
                details.resourceType == "other")) {
            let _url = new url_1.URL(details.url);
            let searchParams = _url.searchParams;
            if (searchParams.has("cxcid") && searchParams.has("cxtime")) {
                return 0;
            }
            searchParams.append("cxcid", m_VerifyKey.cid);
            searchParams.append("cxtime", new Date().getTime() + "");
            details.url = _url.toString();
            return 2;
        }
        else {
            return 0;
        }
    });
    (0, WebRequestHelper_1.addBeforeSendHeadersListener)("safeVerify", async (details) => {
        if (!isInterceptUrl(details.url)) {
            return 0;
        }
        if (m_VerifyKey &&
            (details.resourceType == "mainFrame" ||
                details.resourceType == "subFrame" ||
                details.resourceType == "script" ||
                details.resourceType == "other")) {
            let _url = new url_1.URL(details.url);
            let searchParams = _url.searchParams;
            if (searchParams.has("cxcid") && searchParams.has("cxtime")) {
                let parmArray = [];
                searchParams.forEach((value, name) => {
                    parmArray.push(`${name}${value}`);
                });
                if (details.uploadData &&
                    details.uploadData.length > 0 &&
                    details.requestHeaders["Content-Type"] ==
                        "application/x-www-form-urlencoded") {
                    let postParams = details.uploadData[0].bytes.toString();
                    let params = new URLSearchParams(postParams);
                    params.forEach((value, name) => {
                        parmArray.push(`${name}${value}`);
                    });
                }
                parmArray.sort();
                let str = parmArray.join("");
                str += m_VerifyKey.sc;
                let cxsign = (0, CryptoUtil_1.md5)(str);
                if (cxsign) {
                    details.requestHeaders["cxsign"] = cxsign;
                    return 2;
                }
            }
        }
        return 0;
    });
}
module.exports = { createVerifyData, decodeVerifyData, setVerifyKey };
//# sourceMappingURL=SsoSafeVerify.js.map