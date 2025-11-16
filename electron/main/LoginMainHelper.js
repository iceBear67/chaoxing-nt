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
exports.getCurLanguage = exports.logoutForMutiTerminal = exports.stopCheckMutiTerminal = exports.loginOut = exports.openLogin = exports.cleanAutoLogin = exports.loginEnd = exports.LoginConfig = exports.AutoLoginOnAppReady = void 0;
const electron_1 = require("electron");
const UserHelper_1 = __importStar(require("./UserHelper"));
const MainHelper_1 = require("./MainHelper");
const SsoSafeVerify_1 = require("./SsoSafeVerify");
const SessionCookie_1 = __importStar(require("./SessionCookie"));
const AppSystemConfigMainHelper_1 = require("./AppSystemConfigMainHelper");
const UpdateUtil_1 = require("./UpdateUtil");
const TabHelper_1 = __importDefault(require("./TabHelper"));
const BrowserHelper_1 = require("./BrowserHelper");
const WinId_1 = __importDefault(require("../common/WinId"));
const ImMainHelper_1 = require("./im/ImMainHelper");
const NetUtil_1 = require("./util/NetUtil");
const UaUtils_1 = require("../utils/UaUtils");
const AppConfigHelper_1 = require("../utils/AppConfigHelper");
const DeviceUtil_1 = require("../utils/DeviceUtil");
const { AccountUtil } = require("../utils/AccountUtil");
const appConfig = require("../config/appconfig");
let mutiTerminaCheckInterval;
let m_LoginTerminalTime = -1;
let m_CheckTerminalURLSearchParams;
let m_HxDevId;
let versionCheckCounter = 0;
let m_SsoTimeout;
let m_ssoHandTime = 0;
exports.AutoLoginOnAppReady = {
    state: 0,
    successTime: 0,
};
exports.LoginConfig = {
    ssoOneDayLater: false,
    loginEndTime: 0,
};
electron_1.ipcMain.handle("_openSSO", (event, type, url) => {
    return openSSO(type, url);
});
electron_1.ipcMain.on("_loginEnd", (event, args) => {
    loginEnd(args?.type);
});
async function loginEnd(loginType) {
    exports.LoginConfig.loginEndTime = new Date().getTime();
    let m_mainWindow = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
    if (!m_mainWindow || m_mainWindow.isDestroyed()) {
        return;
    }
    let autoLogin = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)().autoLogin;
    if (exports.AutoLoginOnAppReady.state != 1 &&
        loginType == 2 &&
        !autoLogin &&
        appConfig.appMode == "normal") {
        console.log("启动时，没有选自动登录的话，就退出登录");
        loginOut();
        return;
    }
    let curPuid = await SessionCookie_1.default.getUID();
    if (curPuid && loginType != 1) {
        await checkMutiTerminal(true);
    }
    let type = loginType;
    if (type == 2) {
        type = 0;
    }
    let tempAutoLogin = (0, MainHelper_1.getTempStore)("tempAutoLogin");
    (0, MainHelper_1.setTempStore)("tempAutoLogin", undefined);
    console.log("tempAutoLogin", tempAutoLogin);
    if (tempAutoLogin) {
        saveAutoLogin();
    }
    console.log("loginEnd:", type);
    UserHelper_1.default.setLoginType(type);
    SessionCookie_1.default.getUID().then(async (uid) => {
        console.log("loginEnd uid:", uid);
        if (uid) {
            console.log("m_LoginTerminalTime", m_LoginTerminalTime);
            if ((appConfig.appMode == "normal" || appConfig.appMode == "fanya") &&
                m_LoginTerminalTime <= 0) {
                try {
                    await loginForMutiTerminal();
                }
                catch (e) {
                    console.log("loginForMutiTerminal error:", e);
                }
                startMutiTerminalCheck();
                if (type == 1) {
                    (0, UpdateUtil_1.checkUpdateLater)(120000, false, true);
                }
                setTimeout(() => {
                    sendLoginEndImMessage();
                }, 3000);
                setTimeout(() => {
                    sendLoginEndImMessage();
                }, 6000);
            }
        }
        let key = UserHelper_1.default.getUserKey();
        if (uid) {
            let userStore = (0, MainHelper_1.getUserStore)(key);
            if (userStore && userStore.puid == uid) {
                UserHelper_1.default.setUser(userStore);
                if (m_mainWindow) {
                    m_mainWindow.webContents.send("updateUser", UserHelper_1.default.getUser());
                }
                openSSO(type)
                    ?.then(() => {
                    console.info(`local sso login success`);
                    m_mainWindow.webContents.send("updateUser", UserHelper_1.default.getUser());
                    let settingTab = TabHelper_1.default.getSubTab("tab_setting_sub");
                    if (settingTab && settingTab.isDestroyed()) {
                        let settingTabWebContents = settingTab.getWebContents();
                        if (settingTabWebContents) {
                            settingTab
                                .getWebContents()
                                .send("updateUser", UserHelper_1.default.getUser());
                        }
                    }
                    saveLastUserLoginRes(tempAutoLogin);
                })
                    .catch((error) => {
                    console.info(`local sso login error:${error}`);
                    m_mainWindow.webContents.send("updateUser", UserHelper_1.default.getUser());
                    let settingTab = TabHelper_1.default.getSubTab("tab_setting_sub");
                    if (settingTab && settingTab.isDestroyed()) {
                        let settingTabWebContents = settingTab.getWebContents();
                        if (settingTabWebContents) {
                            settingTab
                                .getWebContents()
                                .send("updateUser", UserHelper_1.default.getUser());
                        }
                    }
                });
            }
            else {
                (0, MainHelper_1.setUserStore)(key, undefined);
                openSSO(type)
                    ?.then(() => {
                    console.info(`online sso login success`);
                    m_mainWindow.webContents.send("updateUser", UserHelper_1.default.getUser());
                    let settingTab = TabHelper_1.default.getSubTab("tab_setting_sub");
                    if (settingTab && settingTab.isDestroyed()) {
                        let settingTabWebContents = settingTab.getWebContents();
                        if (settingTabWebContents) {
                            settingTab
                                .getWebContents()
                                .send("updateUser", UserHelper_1.default.getUser());
                        }
                    }
                    saveLastUserLoginRes(tempAutoLogin);
                })
                    .catch((error) => {
                    console.info(`online sso login error:${error}`);
                    m_mainWindow.webContents.send("updateUser", UserHelper_1.default.getUser());
                    let settingTab = TabHelper_1.default.getSubTab("tab_setting_sub");
                    if (settingTab && settingTab.isDestroyed()) {
                        let settingTabWebContents = settingTab.getWebContents();
                        if (settingTabWebContents) {
                            settingTab
                                .getWebContents()
                                .send("updateUser", UserHelper_1.default.getUser());
                        }
                    }
                });
            }
        }
        else {
            UserHelper_1.default.setUser(undefined);
            (0, MainHelper_1.setUserStore)(key, undefined);
            m_mainWindow.webContents.send("updateUser", UserHelper_1.default.getUser());
            let settingTab = TabHelper_1.default.getSubTab("tab_setting_sub");
            if (settingTab && settingTab.isDestroyed()) {
                let settingTabWebContents = settingTab.getWebContents();
                if (settingTabWebContents) {
                    settingTab.getWebContents().send("updateUser", UserHelper_1.default.getUser());
                }
            }
        }
    });
}
exports.loginEnd = loginEnd;
electron_1.ipcMain.handle("_isLogin", (event) => {
    return typeof UserHelper_1.default.getUID() != "undefined";
});
function autoSSODelay(delay, type) {
    if (m_SsoTimeout) {
        clearTimeout(m_SsoTimeout);
    }
    m_SsoTimeout = setTimeout(() => {
        console.log("一天后再次执行sso登录", exports.LoginConfig.ssoOneDayLater);
        openSSO(type ?? 0);
    }, delay);
}
function openSSO(type, url) {
    if ((0, AppSystemConfigMainHelper_1.getAppSystemConfig)().appMode == "fanya") {
        exports.AutoLoginOnAppReady.state = 0;
        return;
    }
    if (!(0, UserHelper_1.getUID)()) {
        exports.AutoLoginOnAppReady.state = 0;
        autoSSODelay(2 * 60 * 60 * 1000, 3);
        return;
    }
    if (type == 1) {
        m_ssoHandTime = new Date().getTime();
    }
    autoSSODelay(24 * 60 * 60 * 1000, 3);
    if (typeof url == "undefined") {
        url = "https://sso.chaoxing.com/apis/login/userLogin.do";
        if (type && type == 1) {
            url = "https://sso.chaoxing.com/apis/login/userLogin4Uname.do";
        }
        else if (type == 3 || exports.AutoLoginOnAppReady.state == 1) {
            let puid = (0, UserHelper_1.getUID)();
            let pc_dev_id = (0, MainHelper_1.getTempStore)("pc_dev_id");
            url = `https://sso.chaoxing.com/apis/login/userLogin.do?puid=${puid}&hddInfo=${pc_dev_id}`;
        }
    }
    console.log(`openSSO:type:${type},url:${url}`);
    if (exports.AutoLoginOnAppReady.state == 1) {
        exports.AutoLoginOnAppReady.state = 2;
        setTimeout(() => {
            exports.AutoLoginOnAppReady.state = 0;
        }, 20000);
    }
    return new Promise((resolve, reject) => {
        const request = electron_1.net.request({
            method: "POST",
            url,
            useSessionCookies: true,
        });
        request.setHeader("Content-Type", "application/x-www-form-urlencoded");
        request.on("response", (response) => {
            console.log(`SSO RESPONSE CALLBACK. STATUS: ${response.statusCode}`);
            if (response.statusCode != 200) {
                reject("openSSO response error:");
                return;
            }
            let body = [];
            response.on("data", (chunk) => {
                if (chunk) {
                    body.push(chunk);
                }
            });
            response.on("end", async () => {
                if (body && body.length > 0) {
                    body = Buffer.concat(body).toString();
                    console.log("openSSO response body:", body);
                    if (body) {
                        let parseJson = JSON.parse(body);
                        if (parseJson &&
                            parseJson.result == 1 &&
                            parseJson.msg &&
                            parseJson.msg.puid) {
                            if (exports.AutoLoginOnAppReady.state == 2) {
                                exports.AutoLoginOnAppReady.state = 3;
                            }
                            let { name, nick, dept, pic, sex, schoolname, phone, roleid, dxfid, fid, invitecode, puid, uid, uname, openid4fid, openid4dxfid, openid4, switchInfo, unitConfigInfos, clientId, specialDomains, } = parseJson.msg;
                            (0, MainHelper_1.setTempStore)("SSOResponse", parseJson.msg);
                            let unitConfigInfosArray = [];
                            if (unitConfigInfos && unitConfigInfos.length > 0) {
                                unitConfigInfosArray = unitConfigInfos.map((item) => {
                                    return {
                                        fid: item.fid,
                                        schoolname: item.schoolname,
                                        uname: item.uname,
                                    };
                                });
                            }
                            let accountUserInfo = {
                                name,
                                nick,
                                dept,
                                pic,
                                sex,
                                schoolname,
                                phone,
                                roleid,
                                dxfid,
                                fid,
                                invitecode,
                                puid,
                                uid,
                                uname,
                                openid4fid,
                                openid4dxfid,
                                openid4,
                                unitConfigInfos: unitConfigInfosArray,
                            };
                            console.info(`accountUserInfo:`, JSON.stringify(accountUserInfo));
                            let key = UserHelper_1.default.getUserKey();
                            (0, MainHelper_1.setUserStore)(key, undefined);
                            UserHelper_1.default.setUser(accountUserInfo);
                            (0, MainHelper_1.setUserStore)(key, accountUserInfo, true);
                            let account = {
                                puid,
                                userId: puid,
                                phone,
                                name,
                                pic,
                                switchInfo,
                                lastTime: new Date().getTime(),
                            };
                            AccountUtil.addAccount(account);
                            if (clientId) {
                                try {
                                    let decodeData = (0, SsoSafeVerify_1.decodeVerifyData)(clientId);
                                    if (decodeData) {
                                        (0, SsoSafeVerify_1.setVerifyKey)(JSON.parse(decodeData));
                                    }
                                }
                                catch (e) {
                                    console.warn(e);
                                }
                            }
                            handlespecialDomains(specialDomains);
                        }
                        else {
                            exports.AutoLoginOnAppReady.state = 0;
                            if (type != 3 && parseJson?.errorCode == 2000) {
                                loginOut();
                                reject(parseJson?.errorMsg);
                            }
                            else {
                                reject(parseJson?.errorMsg);
                            }
                        }
                    }
                    else {
                        exports.AutoLoginOnAppReady.state = 0;
                    }
                }
                SessionCookie_1.default.flushCookie().then(() => {
                    resolve(undefined);
                });
            });
        });
        request.on("error", (error) => {
            exports.AutoLoginOnAppReady.state = 0;
            console.warn("openSSO error:", error);
            autoSSODelay(2 * 60 * 60 * 1000, 3);
            reject(error);
        });
        try {
            let verifyData = (0, SsoSafeVerify_1.createVerifyData)();
            request.write(`data=${encodeURIComponent(verifyData)}`);
        }
        catch (e) {
            console.error(e);
        }
        request.end();
    });
}
async function handlespecialDomains(specialDomains) {
    if (specialDomains && specialDomains.length > 0) {
        for (let i = 0; i < specialDomains.length; i++) {
            let specialDomain = specialDomains[i];
            if (specialDomain?.url) {
                console.debug("handlespecialDomains url:", specialDomain.url);
                let netRequest = electron_1.net.request({
                    method: "GET",
                    url: specialDomain.url,
                    useSessionCookies: true,
                });
                netRequest.on("response", (response) => {
                    console.log(`handlespecialDomains RESPONSE CALLBACK. STATUS: ${response.statusCode}`);
                });
                netRequest.on("redirect", (statusCode, method, redirectUrl, responseHeaders) => {
                    console.log(`handlespecialDomains redirect. STATUS: ${statusCode},redirectUrl:${redirectUrl},responseHeaders:${JSON.stringify(responseHeaders)}`);
                    netRequest.abort();
                    electron_1.net
                        .request({
                        method: "GET",
                        url: redirectUrl,
                        useSessionCookies: true,
                    })
                        .end();
                });
                netRequest.end();
            }
        }
    }
}
function saveAutoLogin() {
    (0, AppSystemConfigMainHelper_1.setAppSystemConfig)("autoLogin", true);
    (0, MainHelper_1.setSysStore)("autoLoginTime", new Date().getTime());
}
function cleanAutoLogin() {
    (0, AppSystemConfigMainHelper_1.setAppSystemConfig)("autoLogin", false);
    (0, MainHelper_1.setSysStore)("autoLoginTime", undefined);
}
exports.cleanAutoLogin = cleanAutoLogin;
electron_1.ipcMain.on("_setisAutoLogin", (event, isAutoLogin) => {
    if (isAutoLogin) {
        saveAutoLogin();
    }
    else {
        cleanAutoLogin();
    }
});
function openLogin(event) {
    (0, MainHelper_1.setTempStore)("tempAutoLogin", undefined);
    let lastautoLoginTime = (0, MainHelper_1.getSysStore)("autoLoginTime");
    let t = new Date().getTime();
    if (lastautoLoginTime) {
        let daysDiff = (t - lastautoLoginTime) / (1000 * 3600 * 24);
        if (daysDiff > 7) {
            cleanAutoLogin();
        }
    }
    let accountOfflineWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.accountOfflineWindow);
    if (accountOfflineWin && !accountOfflineWin.isDestroyed()) {
        accountOfflineWin.destroy();
    }
    let refer = encodeURIComponent(`https://k.chaoxing.com/res/study/loginComplete.html?t=${t}`);
    let autoLogin = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)().autoLogin;
    console.log("openLogin: autoLogin", autoLogin);
    let pcxxtpage = 2;
    let url = `https://passport2.chaoxing.com/login?loginType=1&fid=&newversion=true&refer=${refer}&pcxxtpage=${pcxxtpage}`;
    let args = {
        options: {
            id: WinId_1.default.LoginWindow,
            pWindowId: WinId_1.default.MainWindow,
            width: 556,
            height: 600,
            subWindow: true,
            modal: true,
        },
    };
    if (url.startsWith("http")) {
        args.url = url;
    }
    else {
        args.filePath = url;
    }
    let win = (0, MainHelper_1.openNewWindow)(event, args);
    if (win) {
        win.webContents.on("did-finish-load", (event, url, isInPlace, isMainFrame, frameProcessId, frameRoutingId) => {
            setTimeout(() => {
                let uid = (0, UserHelper_1.getUID)();
                if (uid) {
                    setTimeout(() => {
                        let curTime = new Date().getTime();
                        if (curTime - m_ssoHandTime > 3000) {
                            loginEnd(1);
                            if (!win.isDestroyed()) {
                                win.destroy();
                            }
                        }
                    }, 200);
                }
            }, 100);
        });
    }
}
exports.openLogin = openLogin;
electron_1.ipcMain.on("_openLogin", (event) => {
    openLogin(event);
});
electron_1.ipcMain.on("CLIENT_LOGIN", (event) => {
    openLogin(event);
});
electron_1.ipcMain.on("CLIENT_LOGOUT", (event) => {
    loginOut();
});
electron_1.ipcMain.handle("CLIENT_LOGIN_STATUS", (event) => {
    if (typeof UserHelper_1.default.getUID() != "undefined") {
        return 1;
    }
    return 0;
});
async function loginOut() {
    await logoutForMutiTerminal();
    exports.LoginConfig.ssoOneDayLater = false;
    let bv = TabHelper_1.default.getBrowserViewById("tab_message");
    if (bv &&
        bv.webContents &&
        !bv.webContents.isDestroyed() &&
        !bv.webContents.isCrashed()) {
        bv.webContents.send("CANCEL_FILE_UPLOAD");
    }
    return SessionCookie_1.default.clearCookies().then(() => {
        m_LoginTerminalTime = 0;
        electron_1.crashReporter.removeExtraParameter("_cookie");
        SessionCookie_1.default.getCookieStr().then((cookieStr) => {
            electron_1.crashReporter.addExtraParameter("_cookie", cookieStr);
        });
        initLanguage();
    });
}
exports.loginOut = loginOut;
async function startMutiTerminalCheck() {
    if (mutiTerminaCheckInterval) {
        await logoutForMutiTerminal();
    }
    stopCheckMutiTerminal();
    mutiTerminaCheckInterval = setInterval(() => {
        try {
            checkOrLoginMutiTerminal();
        }
        catch (e) {
            console.log("checkOrLoginMutiTerminal error:", e);
        }
    }, 60000);
    console.log("初始登录定时开始");
}
const clientTypeMap = {
    1000381: "blackboard",
    1000397: "blackboard",
    1000371: "xxt",
    1000378: "xxt",
};
function initCheckTerminalURLSearchParams() {
    if (!m_CheckTerminalURLSearchParams) {
        let uaInfo = (0, UaUtils_1.parseUserAgentInfo)((0, SessionCookie_1.getUa)());
        const productId = uaInfo.productId;
        const clientType = clientTypeMap[productId] ?? productId;
        let usp = new URLSearchParams();
        usp.append("product", clientType);
        usp.append("appName", (0, AppConfigHelper_1.getAppName)());
        usp.append("deviceName", (0, DeviceUtil_1.getPrettyName)());
        if (m_HxDevId) {
            usp.append("huanxinId", m_HxDevId);
        }
        m_CheckTerminalURLSearchParams = usp;
    }
}
async function loginForMutiTerminal() {
    let uid = (0, UserHelper_1.getUID)();
    if (!uid) {
        return { success: false };
    }
    let url = new URL("https://detect.chaoxing.com/api/detect/login");
    initCheckTerminalURLSearchParams();
    url.search = m_CheckTerminalURLSearchParams.toString();
    console.log("loginForMutiTerminal url:", url.toString());
    try {
        let netResponse = await (0, NetUtil_1.netRequestGet)(url.toString());
        if (netResponse.ok) {
            let resultData = netResponse.json();
            if (resultData.code == 200) {
                m_LoginTerminalTime = resultData.data.loginTime;
                (0, MainHelper_1.setSysStore)("loginTerminalTime", m_LoginTerminalTime);
                return { success: true };
            }
        }
        else {
            return { success: false };
        }
    }
    catch (e) {
        return { success: false };
    }
}
async function stopCheckMutiTerminal() {
    if (mutiTerminaCheckInterval) {
        clearInterval(mutiTerminaCheckInterval);
        mutiTerminaCheckInterval = null;
    }
}
exports.stopCheckMutiTerminal = stopCheckMutiTerminal;
async function logoutForMutiTerminal() {
    stopCheckMutiTerminal();
    (0, MainHelper_1.setSysStore)("loginTerminalTime", 0);
    m_CheckTerminalURLSearchParams = null;
    let uid = (0, UserHelper_1.getUID)();
    if (!uid) {
        return { success: false };
    }
    let url = new URL("https://detect.chaoxing.com/api/detect/logout");
    let uaInfo = (0, UaUtils_1.parseUserAgentInfo)((0, SessionCookie_1.getUa)());
    const productId = uaInfo.productId;
    const clientType = clientTypeMap[productId] ?? productId;
    let HXDevId = `${uaInfo.deviceId}-${productId}`;
    let usp = new URLSearchParams();
    usp.append("product", clientType);
    usp.append("huanxinId", HXDevId);
    usp.append("version", m_LoginTerminalTime + "");
    url.search = usp.toString();
    console.log("logoutForMutiTerminal url:", url.toString());
    try {
        let netResponse = await (0, NetUtil_1.netRequestGet)(url.toString());
        if (netResponse.ok) {
            let resultData = netResponse.json();
            if (resultData.code == 200) {
                return { success: true };
            }
        }
        else {
            return { success: false };
        }
    }
    catch (e) {
        return { success: false };
    }
}
exports.logoutForMutiTerminal = logoutForMutiTerminal;
async function checkOrLoginMutiTerminal() {
    if (m_LoginTerminalTime <= 0) {
        await loginForMutiTerminal();
        return;
    }
    await checkMutiTerminal();
}
async function checkMutiTerminal(forAutoLogin = false) {
    let curPuid = await SessionCookie_1.default.getUID();
    if (!curPuid) {
        return;
    }
    let url = new URL("https://detect.chaoxing.com/api/detect/heart");
    initCheckTerminalURLSearchParams();
    url.search = m_CheckTerminalURLSearchParams.toString();
    let tempTime = 0;
    if (m_LoginTerminalTime == -1) {
        tempTime = (0, MainHelper_1.getSysStore)("loginTerminalTime") || 0;
    }
    else {
        tempTime = m_LoginTerminalTime;
    }
    if (tempTime != 0) {
        url.search += "&version=" + tempTime;
    }
    versionCheckCounter++;
    try {
        let netResponse = await (0, NetUtil_1.netRequestGet)(url.toString());
        if (versionCheckCounter % 30 === 0 || versionCheckCounter === 1) {
            console.log("检测多终端checkMutiTerminal,response:", netResponse.ok, JSON.stringify(netResponse.json(), null, 2));
        }
        if (netResponse.ok) {
            let resultData = netResponse.json();
            if (resultData.code == 200) {
                return resultData.code;
            }
            if (resultData.code == 10004) {
                if (!forAutoLogin && tempTime != 0) {
                    await loginOut();
                    setTimeout(() => {
                        isAccountOfflineDialog();
                    }, 1000);
                }
                return resultData.code;
            }
            else if (resultData.code == 10003) {
                AccountUtil.updateAccountProperty({
                    uid: (0, UserHelper_1.getUID)(),
                    key: "nextLoginToConfirm",
                    value: false,
                });
                await loginOut();
                return resultData.code;
            }
            else {
                return resultData.code;
            }
        }
    }
    catch (e) {
        console.error("checkMutiTerminal error:", e);
    }
    return -1;
}
function exitAndLogout() {
    loginOut().then(() => {
        setTimeout(() => {
            electron_1.app.exit();
        }, 100);
    });
}
function saveLastUserLoginRes(tempAutoLogin) {
    SessionCookie_1.default.getCookies().then((data) => {
        const userCookieVal = data.reduce((acc, cookie) => {
            if (["UID", "vc3", "_d"].includes(cookie.name)) {
                acc[cookie.name] = cookie.value;
            }
            return acc;
        }, {});
        if (Object.keys(userCookieVal).length === 3) {
            console.log("userCookieVal", userCookieVal);
            AccountUtil.updateAccountProperty({
                uid: userCookieVal.UID,
                key: "lastUserLoginRes",
                value: userCookieVal,
            });
            (0, MainHelper_1.setSysStore)("lastUserUid", userCookieVal.UID);
        }
        let account = AccountUtil.getAccount(userCookieVal.UID);
        let isNextLoginNoConfirm = false;
        if (account) {
            isNextLoginNoConfirm = account?.nextLoginToConfirm || false;
        }
        if (tempAutoLogin) {
            isNextLoginNoConfirm = tempAutoLogin;
        }
        AccountUtil.updateAccountProperty({
            uid: userCookieVal.UID,
            key: "nextLoginToConfirm",
            value: isNextLoginNoConfirm,
        });
    });
}
function isAccountOfflineDialog() {
    console.log("打开账号下线弹窗");
    let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
    (0, MainHelper_1.openNewWindow)(undefined, {
        url: `sview:/#/accountOffline`,
        options: {
            id: WinId_1.default.accountOfflineWindow,
            width: 440,
            height: 208,
            frame: false,
            transparent: true,
            resizable: false,
            parent: mainWin,
        },
    });
}
electron_1.ipcMain.on("CLIENT_SET_AUTOLOGIN", (event, data) => {
    console.log("CLIENT_SET_AUTOLOGIN: autoLogin", data.enable);
    if (data.enable) {
        (0, MainHelper_1.setTempStore)("tempAutoLogin", data.enable);
    }
    else {
        (0, MainHelper_1.setTempStore)("tempAutoLogin", undefined);
        cleanAutoLogin();
    }
});
function initLanguage() {
    let language = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)().language;
    let languageValue = language;
    languageValue = getCurLanguage();
    languageValue = updateChaoxingCookie("browserLocale", languageValue);
}
function getCurLanguage() {
    let sysCfg = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
    if (sysCfg.language == "system") {
        let sysLocale = electron_1.app.getSystemLocale().replace("-", "_");
        console.log("app.getSystemLocale():", sysLocale);
        if (sysLocale != "zh_CN") {
            sysLocale = "en_US";
        }
        return sysLocale;
    }
    else {
        if (sysCfg.language && sysCfg.language.includes("-")) {
            sysCfg.language = sysCfg.language.replace("-", "_");
        }
        return sysCfg.language;
    }
}
exports.getCurLanguage = getCurLanguage;
function updateChaoxingCookie(name, value) {
    const cookie = {
        url: "https://k.chaoxing.com/",
        name,
        value,
        domain: ".chaoxing.com",
    };
    electron_1.session.defaultSession.cookies.set(cookie).then(() => {
        electron_1.session.defaultSession.cookies.flushStore().then(() => {
            console.log("updateChaoxingCookie:flushStore:", name, value);
        });
    });
}
UserHelper_1.default.onUserLogout((dataKey) => {
    m_LoginTerminalTime = 0;
    m_CheckTerminalURLSearchParams = null;
    exports.LoginConfig.ssoOneDayLater = false;
});
function sendLoginEndImMessage() {
    let userInfo = (0, UserHelper_1.getUser)();
    if (m_LoginTerminalTime != 0 && userInfo?.uid) {
        console.log("发送登录成功消息给其他客户端:to:", userInfo.uid);
        (0, ImMainHelper_1.sendImMessage)({
            type: "cmd",
            chatType: "singleChat",
            to: userInfo.uid,
            action: "CMD_SELF_USER_LOGIN",
            ext: {
                initialVersion: "123",
            },
        });
    }
}
(0, ImMainHelper_1.onCmdMessage)("CMD_SELF_USER_LOGIN", (msg) => {
    console.log("收到其他客户端登录消息：", JSON.stringify(msg));
    if (msg.from?.startsWith(msg.to)) {
        checkMutiTerminal();
    }
});
electron_1.ipcMain.on("hximDisconnect", (event) => {
    console.log("收到环信断开连接消息：");
    setTimeout(() => {
        checkMutiTerminal();
    }, 1000);
});
electron_1.ipcMain.on("checkMutiTerminal", (event) => {
    console.log("收到检测设备登录消息：");
    setTimeout(() => {
        checkMutiTerminal();
    }, 1000);
});
electron_1.ipcMain.on("setLocalStorageLocalDeviceInfo", (event, deviceInfo) => {
    if (deviceInfo?.deviceId) {
        m_HxDevId = `webim_${deviceInfo.deviceId}`;
        if (m_CheckTerminalURLSearchParams) {
            m_CheckTerminalURLSearchParams.set("huanxinId", m_HxDevId);
            checkMutiTerminal();
        }
    }
});
//# sourceMappingURL=LoginMainHelper.js.map