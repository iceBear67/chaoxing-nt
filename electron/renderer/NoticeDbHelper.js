"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoticeType = void 0;
const DbHelper_1 = require("../utils/DbHelper");
const electron_1 = require("electron");
const T_Notice_1 = __importDefault(require("../db/notice/T_Notice"));
const T_NoticeFolder_1 = __importDefault(require("../db/notice/T_NoticeFolder"));
const T_NoticeDrafts_1 = __importDefault(require("../db/notice/T_NoticeDrafts"));
const m_NoticeDb = new T_Notice_1.default();
const m_NoticeFolderDb = new T_NoticeFolder_1.default();
const m_DraftsDb = new T_NoticeDrafts_1.default();
var NoticeType;
(function (NoticeType) {
    NoticeType[NoticeType["ALL"] = -1] = "ALL";
    NoticeType[NoticeType["NOTICE"] = 0] = "NOTICE";
    NoticeType[NoticeType["COURSE_NOTICE"] = 14] = "COURSE_NOTICE";
    NoticeType[NoticeType["LETTER"] = 1000] = "LETTER";
    NoticeType[NoticeType["APPROVAL"] = 4000] = "APPROVAL";
    NoticeType[NoticeType["SYSTEM_NOTICE"] = 10000] = "SYSTEM_NOTICE";
    NoticeType[NoticeType["NO_READ"] = 99] = "NO_READ";
})(NoticeType || (exports.NoticeType = NoticeType = {}));
async function loadNoticeDb() {
    try {
        const noticeDb = await (0, DbHelper_1.getDb)('notice.db', true);
        await m_NoticeDb.init(noticeDb);
        await m_NoticeFolderDb.init(noticeDb);
        await m_DraftsDb.init(noticeDb);
        return { success: true };
    }
    catch (error) {
        return { success: false };
    }
}
async function queryFolderList() {
    try {
        const folderList = await m_NoticeFolderDb.queryAll('status = "0" ORDER BY insertTime DESC');
        return {
            success: true,
            data: {
                folderList
            }
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function insertFolder(data) {
    try {
        const insert = await m_NoticeFolderDb.insertData(data);
        return {
            success: true,
            data: {
                insert
            }
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function updateFolder(uuid, obj) {
    try {
        await m_NoticeFolderDb.updateData(obj, `uuid = '${uuid}'`);
        return {
            success: true,
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function updateMoreFolder(uuid, obj) {
    try {
        await m_NoticeFolderDb.updateData(obj, `uuid IN (${uuid})`);
        return {
            success: true,
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function queryNoticeList(lastValue, sourceType, createrId) {
    try {
        let sql = `${createrId ? `1=1` : 'status = 0'} AND ${lastValue ? `insertTime < ${lastValue}` : '1=1'} AND ${createrId ? `createrId = '${createrId}'` : '1=1'} ORDER BY insertTime DESC LIMIT 20 OFFSET 0`;
        if (sourceType === NoticeType.NOTICE)
            sql = `sourceType IN(0,14,10000) AND ${sql}`;
        else if (sourceType === NoticeType.LETTER || sourceType === NoticeType.APPROVAL)
            sql = `sourceType = '${sourceType}' AND ${sql}`;
        const noticeList = await m_NoticeDb.queryAll(sql);
        return {
            success: true,
            data: {
                noticeList
            }
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function queryCurNoticeList(puid, lastValue) {
    try {
        const noticeList = await m_NoticeDb.queryAll(`createrPuid = ${puid} AND personStatus = 0 AND ${lastValue ? `insertTime < ${lastValue}` : '1=1'} ORDER BY insertTime DESC LIMIT 20 OFFSET 0`);
        return {
            success: true,
            data: {
                noticeList
            }
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function queryfoldIdList(foldId, lastValue) {
    try {
        const noticeList = await m_NoticeDb.queryAll(`foldId = ${foldId} AND personStatus = 0 AND ${lastValue ? `insertTime < ${lastValue}` : '1=1'} ORDER BY insertTime DESC LIMIT 20 OFFSET 0`);
        return {
            success: true,
            data: {
                noticeList
            }
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function queryfolderIdList(folderId, lastValue) {
    try {
        const noticeList = await m_NoticeDb.queryAll(`folderId = ${folderId} AND personStatus = 0 AND ${lastValue ? `insertTime < ${lastValue}` : '1=1'} ORDER BY insertTime DESC LIMIT 20 OFFSET 0`);
        return {
            success: true,
            data: {
                noticeList
            }
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function updateNoticeColumn(column, where) {
    try {
        const noticeList = await m_NoticeDb.updateColumnByCase(column, where);
        return {
            success: true,
            data: {
                noticeList
            }
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function querykeyList(lastValue, keyword, year, createName, start, end) {
    try {
        const noticeList = await m_NoticeDb.queryAll(`${keyword ? `(content LIKE '%${keyword}%' OR rtf_content LIKE '%${keyword}%')` : '1=1'} AND ${year ? `substr(completeTime, 1, 4) = '${year}'` : '1=1'} AND ${createName ? `createrName='${createName}'` : "1=1"} AND ${start ? `completeTime  >= '${start} 00:00:00' ` : '1=1'} AND ${end ? `completeTime <= '${end} 23:59:59'` : '1=1'} AND ${lastValue ? `insertTime < ${lastValue}` : '1=1'} ORDER BY insertTime DESC LIMIT 20 OFFSET 0`);
        return {
            success: true,
            data: {
                noticeList
            }
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function updateNotice(idCode, obj) {
    try {
        await m_NoticeDb.updateData(obj, `idCode = '${idCode}'`);
        return {
            success: true,
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function updateMoreNotice(id, obj) {
    console.log('updateMoreNotice', id, obj);
    try {
        await m_NoticeDb.updateData(obj, `id IN (${id})`);
        return {
            success: true,
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function queryLetterdetail(idCode) {
    try {
        const letterDetail = await m_NoticeDb.queryFirst(`idCode = '${idCode}'`);
        return {
            success: true,
            data: {
                letterDetail
            }
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function delteNotice(idCode) {
    try {
        const noticeList = await m_NoticeDb.deleteData(`idCode = '${idCode}'`);
        return {
            success: true,
            data: {
                noticeList
            }
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
async function deleteMoreNotice(id) {
    try {
        const noticeList = await m_NoticeDb.deleteData(`id IN (${id})`);
        return {
            success: true,
            data: {
                noticeList
            }
        };
    }
    catch (error) {
        return {
            success: false
        };
    }
}
electron_1.contextBridge.exposeInMainWorld("NoticeDbHelper", { loadNoticeDb, queryFolderList, queryNoticeList, queryCurNoticeList, insertFolder, updateFolder, updateNoticeColumn, updateNotice, delteNotice, queryLetterdetail, queryfoldIdList, querykeyList, updateMoreNotice, deleteMoreNotice, updateMoreFolder, queryfolderIdList });
module.exports = {
    loadNoticeDb,
    queryFolderList,
    queryNoticeList,
    queryCurNoticeList,
    insertFolder,
    updateFolder,
    updateNoticeColumn,
    updateNotice,
    delteNotice,
    queryLetterdetail,
    queryfoldIdList,
    querykeyList,
    updateMoreNotice,
    deleteMoreNotice,
    updateMoreFolder,
    queryfolderIdList
};
//# sourceMappingURL=NoticeDbHelper.js.map