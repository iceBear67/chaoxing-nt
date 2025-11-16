"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countDeptPeople = exports.updateDeptSort = exports.deleteFollowerData = exports.insertFollowerData = exports.singleDeleteUserDeptData = exports.deleteUserDeptData = exports.getDeptUserDataByUid = exports.insertUserDeptData = exports.deleteUserByUid = exports.deleteUserData = exports.searchUser = exports.singleInsertUserData = exports.insertUserData = exports.getDeptData = exports.deleteDeptDataByDeptid = exports.deleteDeptData = exports.insertDeptData = exports.getUnitData = exports.deleteAllUnitData = exports.updateUnitData = exports.insertUnitData = exports.init = void 0;
const T_ContactUnit_1 = __importDefault(require("../../db/contact/T_ContactUnit"));
const T_ContactDept_1 = __importDefault(require("../../db/contact/T_ContactDept"));
const T_ContactsUser_1 = __importDefault(require("../../db/contact/T_ContactsUser"));
const T_ContactsUserDept_1 = __importDefault(require("../../db/contact/T_ContactsUserDept"));
const T_ContactsFollower_1 = __importDefault(require("../../db/contact/T_ContactsFollower"));
const DbHelper_1 = require("../../utils/DbHelper");
const m_ContactUnitDb = new T_ContactUnit_1.default();
const m_ContactDeptDb = new T_ContactDept_1.default();
const m_ContactsUserDb = new T_ContactsUser_1.default();
const m_ContactsUserDeptDb = new T_ContactsUserDept_1.default();
const m_ContactsFollowerDb = new T_ContactsFollower_1.default();
m_ContactUnitDb.on('onTableUpdate', async (oldVersion) => {
    let unitLocalData = await getUnitData();
    let isEmpty = unitLocalData.every(item => !item.userDeptTimeStamp);
    if (oldVersion > 0 && oldVersion < 7 && isEmpty) {
        await deleteUserData();
        await deleteUserDeptData();
        await deleteDeptData();
    }
});
async function init() {
    let contactsDb = await (0, DbHelper_1.getDb)("contacts.db", true);
    await m_ContactUnitDb.init(contactsDb);
    await m_ContactDeptDb.init(contactsDb);
    await m_ContactsUserDb.init(contactsDb);
    await m_ContactsUserDeptDb.init(contactsDb);
    await m_ContactsFollowerDb.init(contactsDb);
}
exports.init = init;
async function insertUnitData(unitData) {
    await m_ContactUnitDb.insertDatas(unitData);
}
exports.insertUnitData = insertUnitData;
async function updateUnitData(unitData) {
    m_ContactUnitDb.updateData(unitData, "fid=?", [unitData.fid]);
}
exports.updateUnitData = updateUnitData;
async function deleteAllUnitData() {
    await m_ContactUnitDb.deleteData();
}
exports.deleteAllUnitData = deleteAllUnitData;
async function getUnitData() {
    return await m_ContactUnitDb.queryAll();
}
exports.getUnitData = getUnitData;
async function insertDeptData(deptData) {
    return await m_ContactDeptDb.insertDatas(deptData);
}
exports.insertDeptData = insertDeptData;
async function deleteDeptData(fid) {
    if (fid) {
        return await m_ContactDeptDb.deleteData("fid=?", [fid]);
    }
    else {
        return await m_ContactDeptDb.deleteData();
    }
}
exports.deleteDeptData = deleteDeptData;
async function deleteDeptDataByDeptid(deptid) {
    return await m_ContactDeptDb.deleteData("id=?", [deptid]);
}
exports.deleteDeptDataByDeptid = deleteDeptDataByDeptid;
async function getDeptData(fid) {
    return await m_ContactDeptDb.queryAll("fid=?", [fid]);
}
exports.getDeptData = getDeptData;
async function insertUserData(userData) {
    return await m_ContactsUserDb.insertDatas(userData);
}
exports.insertUserData = insertUserData;
async function singleInsertUserData(userData) {
    return await m_ContactsUserDb.insertData(userData);
}
exports.singleInsertUserData = singleInsertUserData;
async function searchUser(keyword, page) {
    if (!m_ContactsUserDb.m_db) {
        await init();
    }
    return await m_ContactsUserDb.queryAll(`(name LIKE '%${keyword}%' OR REPLACE(fullpinyin, ' ', '') LIKE '%${keyword}%' OR simplepinyin LIKE '%${keyword}%') ORDER BY CASE WHEN (name LIKE '${keyword}%' OR REPLACE(fullpinyin, ' ', '') LIKE '${keyword}%' OR simplepinyin LIKE '${keyword}%') THEN 1 WHEN (name LIKE '%${keyword}%' OR REPLACE(fullpinyin, ' ', '') LIKE '%${keyword}%' OR simplepinyin LIKE '%${keyword}%') THEN 2 WHEN (name LIKE '%${keyword}' OR REPLACE(fullpinyin, ' ', '') LIKE '%${keyword}' OR simplepinyin LIKE '%${keyword}') THEN 3 ELSE 4 END, name`);
}
exports.searchUser = searchUser;
async function deleteUserData(fid) {
    if (fid) {
        return await m_ContactsUserDb.deleteData("fid=?", [fid]);
    }
    else {
        return await m_ContactsUserDb.deleteData();
    }
}
exports.deleteUserData = deleteUserData;
async function deleteUserByUid(uids, fid) {
    if (!uids)
        return { success: false };
    return await m_ContactsUserDb.deleteData(`uid IN (${uids}) AND fid ='${fid}'`);
}
exports.deleteUserByUid = deleteUserByUid;
async function insertUserDeptData(userDeptData) {
    return await m_ContactsUserDeptDb.insertDatas(userDeptData);
}
exports.insertUserDeptData = insertUserDeptData;
async function getDeptUserDataByUid(fid, uid) {
    return await m_ContactsUserDeptDb.queryFirst(`fid='${fid}' AND uid = '${uid}'`);
}
exports.getDeptUserDataByUid = getDeptUserDataByUid;
async function deleteUserDeptData(fid) {
    if (fid) {
        return await m_ContactsUserDeptDb.deleteData("fid=?", [fid]);
    }
    else {
        return await m_ContactsUserDeptDb.deleteData();
    }
}
exports.deleteUserDeptData = deleteUserDeptData;
async function singleDeleteUserDeptData(fid, deptid, uids) {
    if (!uids)
        return { success: false };
    return await m_ContactsUserDeptDb.deleteData(`fid='${fid}' AND deptid='${deptid}' AND uid IN (${uids})`);
}
exports.singleDeleteUserDeptData = singleDeleteUserDeptData;
async function insertFollowerData(followerData) {
    return await m_ContactsFollowerDb.insertDatas(followerData);
}
exports.insertFollowerData = insertFollowerData;
async function deleteFollowerData() {
    return await m_ContactsFollowerDb.deleteData();
}
exports.deleteFollowerData = deleteFollowerData;
function updateDeptSort(id, sort) {
    m_ContactDeptDb.updateData({ sort }, `fid='-1' AND pid='-1' AND id='${id}'`);
}
exports.updateDeptSort = updateDeptSort;
function countDeptPeople(ppath) {
    return m_ContactDeptDb.countPeople(ppath);
}
exports.countDeptPeople = countDeptPeople;
module.exports = { init, updateUnitData, insertUnitData, getUnitData, deleteAllUnitData, insertDeptData, deleteDeptData, getDeptData, insertUserData, deleteUserData, insertUserDeptData, deleteUserDeptData, singleDeleteUserDeptData, deleteUserByUid, singleInsertUserData, getDeptUserDataByUid, searchUser, insertFollowerData, deleteFollowerData, deleteDeptDataByDeptid, updateDeptSort, countDeptPeople };
//# sourceMappingURL=ContactsDbHelper.js.map