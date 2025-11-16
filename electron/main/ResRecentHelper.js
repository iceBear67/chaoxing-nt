"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryResRecent = exports.deleteAllResRecent = exports.deleteResRecent = exports.insertOrUpdateResRecent = exports.init = void 0;
const T_ResRecent_1 = __importDefault(require("../db/T_ResRecent"));
const DbHelper_1 = require("../utils/DbHelper");
const EventUtil_1 = require("../utils/EventUtil");
const UserHelper_1 = require("./UserHelper");
const fs_1 = __importDefault(require("fs"));
let m_ResRecent = new T_ResRecent_1.default();
function init() {
    return (0, DbHelper_1.getDb)("resRecent.db").then((db) => {
        m_ResRecent.init(db);
    });
}
exports.init = init;
EventUtil_1.EventUtil.on("appReady", () => {
    init();
});
(0, UserHelper_1.onUserLogin)(async () => {
    let guestDbPath = await (0, DbHelper_1.getDbFilePath)("resRecent.db", false, "guest");
    let userDbPath = await (0, DbHelper_1.getDbFilePath)("resRecent.db", false);
    if (!fs_1.default.existsSync(userDbPath) && fs_1.default.existsSync(guestDbPath)) {
        fs_1.default.copyFileSync(guestDbPath, userDbPath);
        setTimeout(() => {
            fs_1.default.unlinkSync(guestDbPath);
        }, 1000);
    }
    await (0, DbHelper_1.resetPassword)(userDbPath, "guest");
    init();
});
(0, UserHelper_1.onUserLogout)(() => {
    init();
});
async function insertOrUpdateResRecent(data) {
    console.log("insertOrUpdateResRecent:", data);
    if (!data || !data.cataid || !data.key) {
        return;
    }
    data.updateTime = new Date().getTime();
    let tempData = await m_ResRecent.queryFirst(`cataid = ? and key = ?`, [
        data.cataid,
        data.key,
    ]);
    let result;
    if (tempData) {
        result = await m_ResRecent.updateData(data, `cataid = ? and key = ?`, [
            data.cataid,
            data.key,
        ]);
    }
    else {
        result = await m_ResRecent.insertData(data);
    }
    return result;
}
exports.insertOrUpdateResRecent = insertOrUpdateResRecent;
async function deleteResRecent(data) {
    console.log("deleteResRecent:", data);
    if (!data || !data.cataid || !data.key) {
        return;
    }
    let result = await m_ResRecent.deleteData(`cataid = ? and key = ?`, [
        data.cataid,
        data.key,
    ]);
    return result;
}
exports.deleteResRecent = deleteResRecent;
async function deleteAllResRecent() {
    let result = await m_ResRecent.deleteData();
    return result;
}
exports.deleteAllResRecent = deleteAllResRecent;
async function queryResRecent(numCount) {
    if (numCount <= 0) {
        return;
    }
    let result = await m_ResRecent.queryAll(`1=1 ORDER BY updateTime DESC LIMIT ${numCount}`);
    return result;
}
exports.queryResRecent = queryResRecent;
module.exports = {
    insertOrUpdateResRecent,
    deleteResRecent,
    queryResRecent,
    deleteAllResRecent,
};
//# sourceMappingURL=ResRecentHelper.js.map