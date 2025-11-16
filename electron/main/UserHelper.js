"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserLogoutEnd = exports.onUserLogout = exports.onUserLoginEnd = exports.onUserLogin = exports.setPanToken = exports.getPanToken = exports.getPriUser = exports.getUser = exports.getUID = void 0;
const DbHelper_1 = require("../utils/DbHelper");
let userkey = "user";
let UID;
let KI4SO;
let PAN_TOKEN;
let m_User;
let pri_M_User;
let LOGIN_TYPE = 0;
let hasLogOutEnd = false;
let LOGIN_OUT_END_TYPE = 0;
let CHANGE_ACCOUNT_SWITCHINFO;
let IS_NEXT_LOGIN_PUID;
let IS_NEXT_LOGIN_TO_CONFIRM = false;
const { EventEmitter } = require("events");
let m_EmitterObj = new EventEmitter();
function getDataKey() {
    if (UID) {
        return UID;
    }
    return "guestUser";
}
function getUserKey() {
    return userkey;
}
function getUID() {
    return UID;
}
exports.getUID = getUID;
function setUID(uid) {
    if (uid == UID) {
        return;
    }
    console.info("setUID:", uid);
    (0, DbHelper_1.clearDbMap)();
    if (uid) {
        UID = uid;
        m_EmitterObj.emit("userLogin", UID);
    }
    else {
        m_EmitterObj.emit("userLogout", UID);
        UID = undefined;
    }
}
function getUserPic() {
    if (UID) {
        return `https://photo.chaoxing.com/p/${UID}_80`;
    }
    return `https://photo.chaoxing.com/photo_80.jpg`;
}
function getUser() {
    return m_User;
}
exports.getUser = getUser;
function getPriUser() {
    return pri_M_User;
}
exports.getPriUser = getPriUser;
function setUser(user) {
    console.info("setUser:", JSON.stringify(user));
    if (user) {
        pri_M_User = user;
        let tarUser = Object.assign({}, user);
        delete tarUser["phone"];
        m_User = tarUser;
    }
    else {
        pri_M_User = undefined;
        m_User = undefined;
    }
}
function setKI4SO(ki4so) {
    if (ki4so == KI4SO) {
        return;
    }
    console.info("setKI4SO:", ki4so);
    if (ki4so) {
        KI4SO = ki4so;
        m_EmitterObj.emit("userLoginEnd");
    }
    else {
        KI4SO = undefined;
    }
}
function triggerUserLogoutEnd() {
    if (hasLogOutEnd) {
        hasLogOutEnd = false;
        let loginOutEndTypeTemp = LOGIN_OUT_END_TYPE;
        LOGIN_OUT_END_TYPE = 0;
        let changeAccountSwitchinfoTemp = CHANGE_ACCOUNT_SWITCHINFO;
        let isNextLoginToConfirmTemp = IS_NEXT_LOGIN_TO_CONFIRM;
        let isNextLoginPuidTemp = IS_NEXT_LOGIN_PUID;
        CHANGE_ACCOUNT_SWITCHINFO = undefined;
        IS_NEXT_LOGIN_PUID = undefined;
        IS_NEXT_LOGIN_TO_CONFIRM = false;
        m_EmitterObj.emit("userLogoutEnd", loginOutEndTypeTemp, changeAccountSwitchinfoTemp, isNextLoginPuidTemp, isNextLoginToConfirmTemp);
    }
}
function setUserLogoutEndParams(result, type, data) {
    if (typeof result != "undefined") {
        hasLogOutEnd = result;
    }
    if (typeof type != "undefined") {
        LOGIN_OUT_END_TYPE = type;
    }
    if (typeof data?.switchInfo != "undefined") {
        CHANGE_ACCOUNT_SWITCHINFO = data.switchInfo;
    }
    if (typeof data?.puid != "undefined") {
        IS_NEXT_LOGIN_PUID = String(data.puid);
    }
    if (typeof data?.isNextLoginToConfirm != "undefined") {
        IS_NEXT_LOGIN_TO_CONFIRM = false;
    }
}
function getPanToken() {
    return PAN_TOKEN;
}
exports.getPanToken = getPanToken;
function setPanToken(_token) {
    if (_token == PAN_TOKEN) {
        return;
    }
    if (_token) {
        PAN_TOKEN = _token;
    }
    else {
        PAN_TOKEN = undefined;
    }
}
exports.setPanToken = setPanToken;
function getLoginType() {
    return LOGIN_TYPE;
}
function setLoginType(_loginType) {
    if (typeof _loginType == "undefined") {
        _loginType = 0;
    }
    LOGIN_TYPE = _loginType;
}
function onUserLogin(callback) {
    m_EmitterObj.on("userLogin", callback);
}
exports.onUserLogin = onUserLogin;
function onUserLoginEnd(callback) {
    m_EmitterObj.on("userLoginEnd", callback);
}
exports.onUserLoginEnd = onUserLoginEnd;
function onUserLogout(callback) {
    m_EmitterObj.on("userLogout", callback);
}
exports.onUserLogout = onUserLogout;
function onUserLogoutEnd(callback) {
    m_EmitterObj.on("userLogoutEnd", callback);
}
exports.onUserLogoutEnd = onUserLogoutEnd;
module.exports = {
    getDataKey,
    getUserKey,
    getUID,
    setUID,
    getUserPic,
    getUser,
    getPriUser,
    setUser,
    setKI4SO,
    getPanToken,
    setPanToken,
    getLoginType,
    setLoginType,
    triggerUserLogoutEnd,
    setUserLogoutEndParams,
    onUserLogin,
    onUserLoginEnd,
    onUserLogout,
    onUserLogoutEnd,
};
exports.default = module.exports;
//# sourceMappingURL=UserHelper.js.map