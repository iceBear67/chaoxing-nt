"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNoticeFoldTag = exports.searchNotice = exports.deleteNoticeFolderData = exports.insertNoticeFolderData = exports.queryNoticeDraftData = exports.deleteNoticeDraftData = exports.insertNoticeDraftData = exports.deleteNoticeData = exports.insertNoticeData = exports.initDraft = exports.init = void 0;
const T_Notice_1 = __importDefault(require("../../db/notice/T_Notice"));
const T_NoticeFolder_1 = __importDefault(require("../../db/notice/T_NoticeFolder"));
const T_NoticeDrafts_1 = __importDefault(require("../../db/notice/T_NoticeDrafts"));
const DbHelper_1 = require("../../utils/DbHelper");
const m_NoticeDb = new T_Notice_1.default();
const m_NoticeFolderDb = new T_NoticeFolder_1.default();
const m_NoticeDraftsDb = new T_NoticeDrafts_1.default();
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function init() {
    let noticeDb = await (0, DbHelper_1.getDb)("notice.db", true);
    await m_NoticeDb.init(noticeDb);
    await m_NoticeFolderDb.init(noticeDb);
}
exports.init = init;
async function initDraft() {
    let noticeDb = await (0, DbHelper_1.getDb)("notice.db", true);
    await m_NoticeDraftsDb.init(noticeDb);
}
exports.initDraft = initDraft;
async function insertNoticeData(noticeData) {
    return await m_NoticeDb.insertDatas(noticeData);
}
exports.insertNoticeData = insertNoticeData;
async function deleteNoticeData(ids) {
    if (ids) {
        return await m_NoticeDb.deleteData(`id IN (${ids})`);
    }
    else {
        return await m_NoticeDb.deleteData();
    }
}
exports.deleteNoticeData = deleteNoticeData;
async function insertNoticeDraftData(noticeData) {
    return await m_NoticeDraftsDb.insertDatas(noticeData);
}
exports.insertNoticeDraftData = insertNoticeDraftData;
async function deleteNoticeDraftData(ids) {
    if (ids) {
        return await m_NoticeDraftsDb.deleteData(`id IN (${ids})`);
    }
    else {
        return await m_NoticeDraftsDb.deleteData();
    }
}
exports.deleteNoticeDraftData = deleteNoticeDraftData;
async function queryNoticeDraftData() {
    if (!m_NoticeDraftsDb.m_db) {
        await init();
    }
    return await m_NoticeDraftsDb.queryAll();
}
exports.queryNoticeDraftData = queryNoticeDraftData;
async function insertNoticeFolderData(noticeFolder) {
    return await m_NoticeFolderDb.insertDatas(noticeFolder);
}
exports.insertNoticeFolderData = insertNoticeFolderData;
async function deleteNoticeFolderData(uuids) {
    if (uuids) {
        return await m_NoticeFolderDb.deleteData(`uuid IN (${uuids})`);
    }
    else {
        return await m_NoticeFolderDb.deleteData();
    }
}
exports.deleteNoticeFolderData = deleteNoticeFolderData;
async function searchNotice(keyword, lastValue) {
    if (!m_NoticeDb.m_db) {
        await init();
    }
    return await m_NoticeDb.queryAll(`status = 0 AND (content LIKE '%${keyword}%' OR createrName LIKE '%${keyword}%' OR toNames LIKE '%${keyword}%' OR title LIKE '%${keyword}%') AND ${lastValue ? `insertTime <= ${lastValue}` : "1=1"} ORDER BY insertTime DESC LIMIT 20 OFFSET 0`);
}
exports.searchNotice = searchNotice;
async function updateNoticeFoldTag() {
    if (!m_NoticeDb.m_db) {
        await init();
    }
    await m_NoticeDb.updateColumnByCase("sessionTag", "0");
    await m_NoticeDb.updateData({ sessionTag: 1 }, "foldId is null");
    await updateFoldTagSql();
    await m_NoticeDb.updateData({ sessionTag: 0 }, "status = 1 OR recycle = 1 OR personStatus = -1");
}
exports.updateNoticeFoldTag = updateNoticeFoldTag;
function updateFoldTagSql() {
    const sql = `	UPDATE T_Notice
  SET sessionTag = (
    SELECT COUNT(1)
    FROM T_Notice AS subquery
    WHERE  subquery.folderId = T_Notice.folderId and  subquery.foldId = T_Notice.foldId
  )
  WHERE id IN (
    SELECT MAX(id)
    FROM T_Notice WHERE  foldId is not null
    GROUP BY folderId,foldId
  )`;
    let pms = new Promise((resolve, reject) => {
        m_NoticeDb.m_db.serialize(() => {
            m_NoticeDb.m_db.run(sql, (err) => {
                if (err) {
                    resolve({ success: false, error: err });
                    console.error(`UPDATEFoldTag error:sql:${sql},err:`, err);
                }
                else {
                    resolve({ success: true });
                }
            });
        });
    });
    return pms;
}
module.exports = {
    init,
    initDraft,
    insertNoticeData,
    deleteNoticeData,
    insertNoticeFolderData,
    deleteNoticeFolderData,
    searchNotice,
    deleteNoticeDraftData,
    insertNoticeDraftData,
    queryNoticeDraftData,
    updateNoticeFoldTag,
};
//# sourceMappingURL=NoticeDbHelper.js.map