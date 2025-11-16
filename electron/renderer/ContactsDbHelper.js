"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryLocalUsersByTuids = exports.clearDeptPeopleCountCache = exports.querySubDepts = exports.queryDeptInfoById = exports.searchLocalUser = exports.queryDeptListByFid = exports.queryUserListByDeptId = exports.queryUnitAndTeamList = exports.loadContactsDb = void 0;
const DbHelper_1 = require("../utils/DbHelper");
const electron_1 = require("electron");
const T_ContactUnit_1 = __importDefault(require("../db/contact/T_ContactUnit"));
const T_ContactDept_1 = __importDefault(require("../db/contact/T_ContactDept"));
const T_ContactsUser_1 = __importDefault(require("../db/contact/T_ContactsUser"));
const T_ContactsUserDept_1 = __importDefault(require("../db/contact/T_ContactsUserDept"));
const T_ContactsFollower_1 = __importDefault(require("../db/contact/T_ContactsFollower"));
const m_ContactUnitDb = new T_ContactUnit_1.default();
const m_ContactDeptDb = new T_ContactDept_1.default();
const m_ContactsUserDb = new T_ContactsUser_1.default();
const m_ContactsUserDeptDb = new T_ContactsUserDept_1.default();
const m_ContactsFollowerDb = new T_ContactsFollower_1.default();
async function loadContactsDb() {
    try {
        let contactsDb = await (0, DbHelper_1.getDb)("contacts.db", true);
        await m_ContactUnitDb.init(contactsDb);
        await m_ContactDeptDb.init(contactsDb);
        await m_ContactsUserDb.init(contactsDb);
        await m_ContactsUserDeptDb.init(contactsDb);
        await m_ContactsFollowerDb.init(contactsDb);
        return { success: true };
    }
    catch (error) {
        return { success: false };
    }
}
exports.loadContactsDb = loadContactsDb;
async function queryUnitAndTeamList() {
    try {
        const unitList = await m_ContactUnitDb.queryAll();
        const teamList = await m_ContactDeptDb.queryAll(`fid = '-1' AND pid = '-1'`);
        return {
            success: true,
            data: {
                unitList,
                teamList,
            },
        };
    }
    catch (error) {
        return {
            success: false,
        };
    }
}
exports.queryUnitAndTeamList = queryUnitAndTeamList;
function excuteSqlQueryUserListByDeptId(sql, parm) {
    let pms = new Promise((resolve, reject) => {
        m_ContactsUserDb.m_db.serialize(() => {
            m_ContactsUserDb.m_db.all(sql, parm, (err, rows) => {
                resolve(rows);
            });
        });
    });
    return pms;
}
async function queryUserListByDeptId(deptid, fid) {
    try {
        const sql = `SELECT T_ContactsUser.*, A.category
    FROM (
      SELECT *
      FROM T_ContactsUserDept
      WHERE  deptid = '${deptid}' AND fid = '${fid}'
    ) AS A
    LEFT JOIN T_ContactsUser ON A.uid = T_ContactsUser.uid AND A.fid = T_ContactsUser.fid;`;
        const userList = await excuteSqlQueryUserListByDeptId(sql);
        return {
            success: true,
            data: {
                userList,
            },
        };
    }
    catch (error) {
        return {
            success: false,
        };
    }
}
exports.queryUserListByDeptId = queryUserListByDeptId;
async function queryDeptListByFid(fid, pid = "-1", addressbookDataType = 0) {
    try {
        const deptList = await m_ContactDeptDb.queryAll(`fid = '${fid}' AND pid = '${pid}'`);
        if (deptList) {
            for (let i = 0; i < deptList.length; i++) {
                const dept = deptList[i];
                dept.addressbookDataType = addressbookDataType;
            }
        }
        return {
            success: true,
            data: {
                deptList,
            },
        };
    }
    catch (error) {
        return {
            success: false,
        };
    }
}
exports.queryDeptListByFid = queryDeptListByFid;
async function searchLocalUser(keyword, breadcrumbObj) {
    if (breadcrumbObj?.level == 0) {
        return await m_ContactsUserDb.queryAll(`(name LIKE '%${keyword}%' OR REPLACE(fullpinyin, ' ', '') LIKE '%${keyword}%' OR simplepinyin LIKE '%${keyword}%') ORDER BY CASE WHEN (name LIKE '${keyword}%' OR REPLACE(fullpinyin, ' ', '') LIKE '${keyword}%' OR simplepinyin LIKE '${keyword}%') THEN 1 WHEN (name LIKE '%${keyword}%' OR REPLACE(fullpinyin, ' ', '') LIKE '%${keyword}%' OR simplepinyin LIKE '%${keyword}%') THEN 2 WHEN (name LIKE '%${keyword}' OR REPLACE(fullpinyin, ' ', '') LIKE '%${keyword}' OR simplepinyin LIKE '%${keyword}') THEN 3 ELSE 4 END, name`);
    }
    else {
        if (breadcrumbObj?.deptid) {
            let deptidList = [breadcrumbObj?.deptid];
            await recursionQueryDeptListByFid(breadcrumbObj?.fid, breadcrumbObj?.deptid, deptidList);
            return await m_ContactsUserDb.queryAll(`uid IN (SELECT uid FROM T_ContactsUserDept WHERE fid = '${breadcrumbObj.fid}' AND deptid IN (${deptidList.join(",")})) AND (name LIKE '%${keyword}%' OR REPLACE(fullpinyin, ' ', '') LIKE '%${keyword}%' OR simplepinyin LIKE '%${keyword}%') ORDER BY CASE WHEN (name LIKE '${keyword}%' OR REPLACE(fullpinyin, ' ', '') LIKE '${keyword}%' OR simplepinyin LIKE '${keyword}%') THEN 1 WHEN (name LIKE '%${keyword}%' OR REPLACE(fullpinyin, ' ', '') LIKE '%${keyword}%' OR simplepinyin LIKE '%${keyword}%') THEN 2 WHEN (name LIKE '%${keyword}' OR REPLACE(fullpinyin, ' ', '') LIKE '%${keyword}' OR simplepinyin LIKE '%${keyword}') THEN 3 ELSE 4 END, name`);
        }
        else {
            return await m_ContactsUserDb.queryAll(`uid IN (SELECT uid FROM T_ContactsUserDept WHERE fid = '${breadcrumbObj.fid}') AND (name LIKE '%${keyword}%' OR REPLACE(fullpinyin, ' ', '') LIKE '%${keyword}%' OR simplepinyin LIKE '%${keyword}%') ORDER BY CASE WHEN (name LIKE '${keyword}%' OR REPLACE(fullpinyin, ' ', '') LIKE '${keyword}%' OR simplepinyin LIKE '${keyword}%') THEN 1 WHEN (name LIKE '%${keyword}%' OR REPLACE(fullpinyin, ' ', '') LIKE '%${keyword}%' OR simplepinyin LIKE '%${keyword}%') THEN 2 WHEN (name LIKE '%${keyword}' OR REPLACE(fullpinyin, ' ', '') LIKE '%${keyword}' OR simplepinyin LIKE '%${keyword}') THEN 3 ELSE 4 END, name`);
        }
    }
}
exports.searchLocalUser = searchLocalUser;
async function recursionQueryDeptListByFid(fid, pid, resultList = []) {
    const deptList = await m_ContactDeptDb.queryAll(`fid = '${fid}' AND pid = '${pid}'`);
    console.log(deptList);
    for (let i = 0; i < deptList.length; i++) {
        if (deptList[i].subdeptcount == 0) {
            console.log(deptList[i].id);
            resultList.push(deptList[i].id);
        }
        else {
            await recursionQueryDeptListByFid(deptList[i].fid, deptList[i].id, resultList);
        }
    }
}
async function queryDeptInfoById(id) {
    return m_ContactDeptDb.queryAll(`id = '${id}'`);
}
exports.queryDeptInfoById = queryDeptInfoById;
function querySubDepts(id) {
    return m_ContactDeptDb.queryAll(`pid = ${id}`);
}
exports.querySubDepts = querySubDepts;
function clearDeptPeopleCountCache() {
    electron_1.ipcRenderer.send("_clearDeptPeopleCountCache");
}
exports.clearDeptPeopleCountCache = clearDeptPeopleCountCache;
function queryLocalUsersByTuids(tuid) {
    return m_ContactsUserDb.queryAll(`uid IN (${tuid})`);
}
exports.queryLocalUsersByTuids = queryLocalUsersByTuids;
electron_1.contextBridge.exposeInMainWorld("ContactsDbHelper", {
    loadContactsDb,
    queryUnitAndTeamList,
    queryDeptListByFid,
    queryUserListByDeptId,
    searchLocalUser,
    queryDeptInfoById,
    querySubDepts,
    clearDeptPeopleCountCache,
    queryLocalUsersByTuids,
});
//# sourceMappingURL=ContactsDbHelper.js.map