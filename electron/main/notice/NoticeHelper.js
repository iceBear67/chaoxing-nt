"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadNoticeDraftData = exports.startSyncNoticeDraft = exports.loadDataChangeStatus = exports.loadNoticeFolderData = exports.loadNoticeData = exports.startSyncNotice = void 0;
const NoticeOut_1 = require("../../out/notice/NoticeOut");
const UserHelper_1 = require("../UserHelper");
const MainHelper_1 = require("../MainHelper");
const NoticeDbHelper_1 = require("./NoticeDbHelper");
const appConfig = require("../../config/appconfig");
let m_SysnState = 0;
let m_SysnDraftState = 0;
async function startSyncNotice() {
    try {
        await (0, NoticeDbHelper_1.init)();
        let puid = (0, UserHelper_1.getUID)();
        if (!puid || m_SysnState == 2) {
            return { success: false };
        }
        let noticeInfo = (0, MainHelper_1.getUserStore)("noticeStoreKey");
        if (noticeInfo && noticeInfo.lastId) {
            await loadDataChangeStatus(noticeInfo);
        }
        else {
            let isDeleteTable = noticeInfo?.isDeleteTable;
            noticeInfo = {
                lastId: "",
                noticeTimeStamp: "1",
                noticeFolderTimeStamp: "1"
            };
            await loadNoticeData(noticeInfo, Boolean(isDeleteTable));
            await loadNoticeFolderData(noticeInfo, Boolean(isDeleteTable));
        }
        return { success: true };
    }
    catch (e) {
        console.error("startSyncNotice error", e);
        return { success: false };
    }
}
exports.startSyncNotice = startSyncNotice;
async function loadNoticeData(noticeInfo, isDeleteTable = false) {
    let puid = (0, UserHelper_1.getUID)();
    if (!puid || m_SysnState == 2) {
        return { success: false };
    }
    let lastId = noticeInfo?.lastId || "";
    let lastTime = noticeInfo?.noticeTimeStamp || "1";
    let lastPage = 0;
    let isFirstQuery = true;
    while (lastPage < 1) {
        if (m_SysnState == 2) {
            break;
        }
        let noticeData = await NoticeOut_1.NoticeOut.getNoticeData(puid, lastId, lastTime, 100);
        if (noticeData.result != 1) {
            return;
        }
        if (isFirstQuery && isDeleteTable) {
            await (0, NoticeDbHelper_1.deleteNoticeData)();
        }
        isFirstQuery = false;
        const ids = noticeData?.data?.list?.map((i) => String(i.id)) || [];
        if (ids.length) {
            await (0, NoticeDbHelper_1.deleteNoticeData)(ids.join(","));
            let insertNotices = noticeData?.data?.list?.filter(item => !(item.personStatus == -1 && item.recycle == 0));
            await (0, NoticeDbHelper_1.insertNoticeData)(insertNotices);
        }
        lastPage = noticeData?.data?.lastPage;
        lastId = noticeData?.data?.lastAuxValue;
        lastTime = noticeData?.data?.lastValue;
        if (lastPage == 1) {
            noticeInfo.lastId = lastId;
            noticeInfo.noticeTimeStamp = lastTime;
            (0, MainHelper_1.setUserStore)("noticeStoreKey", noticeInfo);
        }
    }
}
exports.loadNoticeData = loadNoticeData;
async function loadNoticeFolderData(noticeInfo, isDeleteTable = false) {
    let puid = (0, UserHelper_1.getUID)();
    if (!puid || m_SysnState == 2) {
        return { success: false };
    }
    let lastTime = noticeInfo?.noticeFolderTimeStamp || "1";
    let lastPage = 0;
    let isFirstQuery = true;
    while (lastPage < 1) {
        if (m_SysnState == 2) {
            break;
        }
        let noticeFolderData = await NoticeOut_1.NoticeOut.getNoticeFolderData(puid, lastTime, 100);
        if (noticeFolderData.result != 1) {
            return;
        }
        if (isFirstQuery && isDeleteTable) {
            await (0, NoticeDbHelper_1.deleteNoticeFolderData)();
        }
        isFirstQuery = false;
        const uuids = noticeFolderData?.data?.list?.map((i) => "'" + String(i.uuid) + "'") || [];
        if (uuids.length) {
            await (0, NoticeDbHelper_1.deleteNoticeFolderData)(uuids.join(","));
            await (0, NoticeDbHelper_1.insertNoticeFolderData)(noticeFolderData?.data?.list);
        }
        lastPage = noticeFolderData?.data?.lastPage;
        lastTime = noticeFolderData?.data?.lastValue;
        if (lastPage == 1) {
            noticeInfo.noticeFolderTimeStamp = lastTime;
            (0, MainHelper_1.setUserStore)("noticeStoreKey", noticeInfo);
        }
    }
}
exports.loadNoticeFolderData = loadNoticeFolderData;
async function loadDataChangeStatus(noticeInfo) {
    let puid = (0, UserHelper_1.getUID)();
    if (!puid || m_SysnState == 2) {
        return { success: false };
    }
    let noticeLastTime = noticeInfo?.noticeTimeStamp || "1";
    let folderLastTime = noticeInfo?.noticeFolderTimeStamp || "1";
    let noticeFolderData = await NoticeOut_1.NoticeOut.getDataChangeStatus(puid, folderLastTime, noticeLastTime);
    if (noticeFolderData.result != 1) {
        return;
    }
    if (noticeFolderData.data.folderStatus) {
        await loadNoticeFolderData(noticeInfo);
    }
    if (noticeFolderData.data.noticeStatus) {
        await loadNoticeData(noticeInfo);
    }
}
exports.loadDataChangeStatus = loadDataChangeStatus;
function invokeSyncNotice() {
    return new Promise((resolve, reject) => {
        resolve({ state: 0 });
        if (!m_SysnState) {
            m_SysnState = 1;
            startSyncNotice()
                .then(() => {
                if (m_SysnState == 2) {
                    m_SysnState = 0;
                    invokeSyncNotice();
                }
                m_SysnState = 0;
                resolve({ state: 0 });
            })
                .catch(() => {
                m_SysnState = 0;
                resolve({ state: 0 });
            });
        }
        else {
            resolve({ state: 1 });
        }
    });
}
async function startSyncNoticeDraft() {
    try {
        await (0, NoticeDbHelper_1.initDraft)();
        let puid = (0, UserHelper_1.getUID)();
        if (!puid) {
            return { success: false };
        }
        let noticeDraftTimeStamp = (0, MainHelper_1.getUserStore)("noticeDraftStoreKey");
        if (!noticeDraftTimeStamp) {
            noticeDraftTimeStamp = '1';
        }
        await loadNoticeDraftData(noticeDraftTimeStamp);
        return { success: true };
    }
    catch (e) {
        console.error("startSyncNoticeDraft error", e);
        return { success: false };
    }
}
exports.startSyncNoticeDraft = startSyncNoticeDraft;
async function loadNoticeDraftData(time) {
    let puid = (0, UserHelper_1.getUID)();
    if (!puid) {
        return { success: false };
    }
    let updateTime = time || "1";
    let lastPage = 0;
    while (lastPage < 1) {
        let noticeData = await NoticeOut_1.NoticeOut.getNoticeDraftData(puid, updateTime, 100);
        if (noticeData.result != 1) {
            return;
        }
        const ids = noticeData?.data?.list?.map((i) => String(i.id)) || [];
        if (ids.length) {
            await (0, NoticeDbHelper_1.deleteNoticeDraftData)(ids.join(","));
            await (0, NoticeDbHelper_1.insertNoticeDraftData)(noticeData?.data?.list);
        }
        lastPage = noticeData?.data?.lastPage;
        updateTime = noticeData?.data?.lastValue || updateTime;
        if (lastPage == 1) {
            (0, MainHelper_1.setUserStore)("noticeDraftStoreKey", updateTime);
        }
    }
}
exports.loadNoticeDraftData = loadNoticeDraftData;
function invokeSyncNoticeDraft() {
    return new Promise((resolve, reject) => {
        resolve({ state: 0 });
    });
}
(0, UserHelper_1.onUserLoginEnd)(() => {
    if (appConfig.appMode == 'normal') {
        invokeSyncNotice();
    }
});
(0, UserHelper_1.onUserLogout)(() => {
    if (m_SysnState == 1) {
        m_SysnState = 2;
    }
});
module.exports = { startSyncNotice, invokeSyncNotice, startSyncNoticeDraft, invokeSyncNoticeDraft };
exports.default = module.exports;
//# sourceMappingURL=NoticeHelper.js.map