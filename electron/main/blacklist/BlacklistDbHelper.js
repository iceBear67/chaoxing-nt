"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryShieldMeData = exports.deleteShieldMeData = exports.insertShieldMeData = exports.queryMeShieldData = exports.deleteMeShieldData = exports.insertMeShieldData = exports.init = void 0;
const T_MeShield_1 = __importDefault(require("../../db/blacklist/T_MeShield"));
const T_ShieldMe_1 = __importDefault(require("../../db/blacklist/T_ShieldMe"));
const DbHelper_1 = require("../../utils/DbHelper");
const m_MeShieldDb = new T_MeShield_1.default();
const m_ShieldMeDb = new T_ShieldMe_1.default();
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function init() {
    let blacklistDb = await (0, DbHelper_1.getDb)("blacklist.db", true);
    await m_MeShieldDb.init(blacklistDb);
    await m_ShieldMeDb.init(blacklistDb);
}
exports.init = init;
async function insertMeShieldData(data) {
    m_MeShieldDb.insertDatas(data);
}
exports.insertMeShieldData = insertMeShieldData;
async function deleteMeShieldData(puids) {
    if (puids) {
        return await m_MeShieldDb.deleteData(`thePuid IN (${puids})`);
    }
    else {
        return await m_MeShieldDb.deleteData();
    }
}
exports.deleteMeShieldData = deleteMeShieldData;
async function queryMeShieldData() {
    if (!m_MeShieldDb.m_db) {
        await init();
    }
    return await m_MeShieldDb.queryAll(`deleted = 0`);
}
exports.queryMeShieldData = queryMeShieldData;
async function insertShieldMeData(data) {
    m_ShieldMeDb.insertDatas(data);
}
exports.insertShieldMeData = insertShieldMeData;
async function deleteShieldMeData(puids) {
    if (puids) {
        return await m_ShieldMeDb.deleteData(`thePuid IN (${puids})`);
    }
    else {
        return await m_ShieldMeDb.deleteData();
    }
}
exports.deleteShieldMeData = deleteShieldMeData;
async function queryShieldMeData() {
    if (!m_ShieldMeDb.m_db) {
        await init();
    }
    return await m_ShieldMeDb.queryAll(`deleted = 0`);
}
exports.queryShieldMeData = queryShieldMeData;
module.exports = { init, insertMeShieldData, deleteMeShieldData, insertShieldMeData, deleteShieldMeData, queryMeShieldData, queryShieldMeData };
//# sourceMappingURL=BlacklistDbHelper.js.map