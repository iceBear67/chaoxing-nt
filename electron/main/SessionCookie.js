"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUa = exports.clearCookies = exports.isLogin = exports.getCookieUserId = exports.hasKI4SO = exports.getUID = exports.getCookieValue = exports.getCookiesStrByUrl = exports.getCookies = exports.getCookieCoreByName = exports.getCookiesByDomain = exports.getCookieStr = exports.init = void 0;
const electron_1 = require("electron");
const os_1 = __importDefault(require("os"));
const CommonUtil_1 = require("../utils/CommonUtil");
const MainHelper_1 = require("./MainHelper");
const path = require("path");
const fs = require("fs");
const StoreHelper = require("./StoreHelper");
const UserHelper = require("./UserHelper");
const CryptoUtil = require("../utils/CryptoUtil");
const { machineIdSync } = require("../utils/MachineIdUtil");
const cookieUrl = "https://k.chaoxing.com";
const cookieDomain = ".chaoxing.com";
const appconfig = require("../config/appconfig.json");
let m_Ua;
function init() {
    electron_1.session.defaultSession.clearCache();
    electron_1.session.defaultSession.setDisplayMediaRequestHandler(async (request, callback) => {
        console.log("DisplayMediaRequestHandler request:", request.securityOrigin, request.videoRequested, request.audioRequested);
        let origin = request.securityOrigin;
        if (!origin) {
            callback({});
            return;
        }
        if (origin.endsWith("/")) {
            origin = origin.substring(0, origin.length - 1);
        }
        const canGetDisplayMediaOrigin = [
            "https://mooc1-api.chaoxing.com",
            "https://mooc1-2.chaoxing.com",
            "https://mooc1.chaoxing.com",
            "https://mooc1-1.chaoxing.com",
        ];
        if (canGetDisplayMediaOrigin.includes(origin)) {
            let sources = await electron_1.desktopCapturer.getSources({ types: ["screen"] });
            if (sources?.length > 0) {
                callback({
                    video: sources[0],
                });
            }
        }
        else {
            callback({});
        }
    });
    initUa();
    electron_1.session.defaultSession.cookies.on("changed", function (event, cookie, cause, removed) {
        if (cookie.domain == cookieDomain) {
            if (cookie.name === "UID") {
                if (removed && cause != "overwrite") {
                    UserHelper.setUID(undefined);
                }
                else {
                    UserHelper.setUID(cookie.value);
                    setTimeout(() => {
                        updateCookie();
                    }, 100);
                }
            }
            else if (cookie.name === "KI4SO_SERVER_EC") {
                if (removed && cause != "overwrite") {
                    UserHelper.setKI4SO(undefined);
                }
                else {
                    setTimeout(() => {
                        UserHelper.setKI4SO(cookie.value);
                        updateCookie();
                    }, 100);
                }
            }
            else if (cookie.name === "_d") {
            }
        }
        electron_1.session.defaultSession.cookies.flushStore().then(() => { });
    });
    function initUa() {
        let _ua = appconfig.ua;
        let uaArch = process.arch;
        let devId = machineIdSync(true).replaceAll("-", "");
        (0, MainHelper_1.setTempStore)("pc_dev_id", devId);
        console.info("pc_dev_id:", devId);
        if (appconfig.appMode == "fyketang" && appconfig.fyketang) {
            let appId;
            if (process.platform == "win32") {
                appId = appconfig.fyketang.winAppId;
                if (CommonUtil_1.osIsLowerThanWin10) {
                    appId += ".win7";
                }
            }
            else if (process.arch == "x64") {
                appId = appconfig.fyketang.macX64AppId;
            }
            else {
                appId = appconfig.fyketang.macArm64AppId;
            }
            _ua = _ua
                .replace("{osArch}", uaArch)
                .replace("{osVersion}", os_1.default.release())
                .replace("{appId}", appId)
                .replace("#devId#", devId);
            m_Ua = _ua;
            electron_1.session.defaultSession.setUserAgent(_ua);
            electron_1.crashReporter.addExtraParameter("ua", _ua);
            console.log(`set app ua:${_ua}`);
            return;
        }
        let schildKey = "ipL$TkaiEefy1gTQb5XHrdLN0a@7c^cu";
        let _os = "windows";
        if (process.platform == "darwin") {
            _os = "mac";
        }
        _ua = _ua
            .replace("schild:_cx", `schild:${schildKey}`)
            .replace("__arch", uaArch)
            .replace("#os#", _os)
            .replace("_devId", `_${devId}`)
            .replace("#devId#", devId);
        let key = "D5vZaFb9XK23Qc1R";
        let iv = "U2sHnL1zPfD4rE8C";
        let ss = CryptoUtil.encodeAesWithKey(_ua, key, iv);
        let tempMd5 = CryptoUtil.md5(ss);
        _ua = _ua.replace(schildKey, tempMd5);
        let ua = electron_1.session.defaultSession.getUserAgent();
        if (!ua.includes(_ua)) {
            m_Ua = `${ua} osVersion_${os_1.default.release()} ${_ua}`;
            electron_1.session.defaultSession.setUserAgent(m_Ua);
            electron_1.crashReporter.addExtraParameter("ua", m_Ua);
            console.log(`set app ua:${m_Ua}`);
        }
    }
    let pro = new Promise((resolve, reject) => {
        electron_1.session.defaultSession.cookies
            .get({ domain: cookieDomain, name: "UID" })
            .then((cookies) => {
            if (cookies && cookies.length > 0) {
                UserHelper.setUID(cookies[0].value);
                setTimeout(() => {
                    updateCookie();
                }, 100);
            }
            resolve(UserHelper.getUID());
        })
            .catch((error) => {
            console.warn("getSessionError:", error);
            reject(error);
        });
    });
    return pro;
}
exports.init = init;
function flushCookie() {
    return electron_1.session.defaultSession.cookies.flushStore();
}
function updateCookie() {
    getCookies().then((cookies) => {
        let cookieStr = "";
        cookies.forEach((cookieData) => {
            cookieStr += `${cookieData.name}=${cookieData.value}; `;
            if (cookieData.name == "UID") {
                electron_1.crashReporter.addExtraParameter("puid", cookieData.value);
            }
            else if (cookieData.name == "fid") {
                electron_1.crashReporter.addExtraParameter("fid", cookieData.value);
            }
        });
        electron_1.crashReporter.addExtraParameter("cookie", cookieStr);
        console.debug("updateCookie:cookieStr:", cookieStr);
    });
}
async function getCookieStr(domain) {
    return getCookies(domain).then((cookies) => {
        let cookieStr = "";
        cookies.forEach((cookieData) => {
            cookieStr += `${cookieData.name}=${cookieData.value}; `;
        });
        console.debug(`getCookieStr:domain:${domain},cookieStr:${cookieStr}`);
        return cookieStr;
    });
}
exports.getCookieStr = getCookieStr;
function getCookiesByDomain(domain) {
    return electron_1.session.defaultSession.cookies.get({
        domain: domain ? domain : cookieDomain,
    });
}
exports.getCookiesByDomain = getCookiesByDomain;
function getCookieCoreByName(domain, name) {
    return electron_1.session.defaultSession.cookies.get({
        domain: domain ? domain : cookieDomain,
        name: name,
    });
}
exports.getCookieCoreByName = getCookieCoreByName;
async function getCookies(domain) {
    return getCookiesByDomain(domain);
}
exports.getCookies = getCookies;
async function getCookiesStrByUrl(url) {
    return electron_1.session.defaultSession.cookies
        .get({
        url,
    })
        .then((cookies) => {
        let cookieStr = "";
        let keyArray = [];
        cookies.forEach((cookieData) => {
            if (keyArray.includes(cookieData.name)) {
                console.log(`存在同名cookie:name:${cookieData.name},value:${cookieData.value}}`);
            }
            else {
                cookieStr += `${cookieData.name}=${cookieData.value}; `;
                keyArray.push(cookieData.name);
            }
        });
        return cookieStr;
    });
}
exports.getCookiesStrByUrl = getCookiesStrByUrl;
function getCookieValue(name) {
    return getCookieCoreByName(undefined, name);
}
exports.getCookieValue = getCookieValue;
function getUID() {
    let pro = new Promise((resolve, reject) => {
        if (UserHelper.getUID()) {
            resolve(UserHelper.getUID());
        }
        else {
            electron_1.session.defaultSession.cookies
                .get({
                domain: cookieDomain,
                name: "UID",
            })
                .then((cookies) => {
                if (cookies && cookies.length > 0) {
                    UserHelper.setUID(cookies[0].value);
                    resolve(UserHelper.getUID());
                }
                else {
                    resolve(null);
                }
            })
                .catch((error) => {
                console.info(error);
                reject(error);
            });
        }
    });
    return pro;
}
exports.getUID = getUID;
function hasKI4SO() {
    let pro = new Promise((resolve, reject) => {
        electron_1.session.defaultSession.cookies
            .get({
            domain: cookieDomain,
            name: "KI4SO_SERVER_EC",
        })
            .then((cookies) => {
            if (cookies && cookies.length > 0) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        })
            .catch((error) => {
            console.info(error);
            reject(error);
        });
    });
    return pro;
}
exports.hasKI4SO = hasKI4SO;
function getCookieUserId() {
    return UserHelper.getUID();
}
exports.getCookieUserId = getCookieUserId;
function isLogin() {
    let userId = getCookieUserId();
    if (userId != null) {
        return true;
    }
    return false;
}
exports.isLogin = isLogin;
function clearCookies() {
    return new Promise((resolve, reject) => {
        electron_1.session.defaultSession.cookies
            .get({})
            .then((cookies) => {
            cookies.forEach((cookie) => {
                let url = "";
                url += cookie.secure ? "https://" : "http://";
                url += cookie.domain.charAt(0) === "." ? "www" : "";
                url += cookie.domain;
                url += cookie.path;
                electron_1.session.defaultSession.cookies
                    .remove(url, cookie.name)
                    .then(() => { });
            });
            resolve(1);
        })
            .catch((error) => {
            console.info(error);
            reject(error);
        });
    });
}
exports.clearCookies = clearCookies;
function getUa() {
    return electron_1.session.defaultSession.getUserAgent();
}
exports.getUa = getUa;
electron_1.ipcMain.on("_resetUserAgent", (event) => {
    let wContents = event.sender;
    if (wContents && !wContents.isDestroyed() && !wContents.isCrashed() && m_Ua) {
        wContents.setUserAgent(m_Ua);
    }
});
const moduleExports = {
    getCookies,
    getCookieValue,
    getCookiesByDomain,
    init,
    getUID,
    hasKI4SO,
    getCookieUserId,
    isLogin,
    clearCookies,
    getCookieStr,
    getCookiesStrByUrl,
    getCookieCoreByName,
    getUa,
    flushCookie,
};
module.exports = moduleExports;
exports.default = moduleExports;
//# sourceMappingURL=SessionCookie.js.map