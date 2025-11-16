"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const T_Conversation_1 = __importDefault(require("../db/T_Conversation"));
const T_Message_1 = __importDefault(require("../db/T_Message"));
const DbHelper_1 = require("../utils/DbHelper");
const T_MsgGroup_1 = __importDefault(require("../db/T_MsgGroup"));
const T_GroupMember_1 = __importDefault(require("../db/T_GroupMember"));
const T_DeletedGroupMember_1 = __importDefault(require("../db/T_DeletedGroupMember"));
const T_MsgContact_1 = __importDefault(require("../db/T_MsgContact"));
const T_MsgFolders_1 = __importDefault(require("../db/T_MsgFolders"));
const T_FolderConversation_1 = __importDefault(require("../db/T_FolderConversation"));
const T_MessageAck_1 = __importDefault(require("../db/T_MessageAck"));
const T_TopConversation_1 = __importDefault(require("../db/T_TopConversation"));
const json_bigint_1 = __importDefault(require("json-bigint"));
const lodash_1 = __importDefault(require("lodash"));
function loadMsgDb() {
    return (0, DbHelper_1.getDb)("chat_message.db", true);
}
function loadAckDb() {
    return (0, DbHelper_1.getDb)("chat_message_ack.db", true);
}
const INSERT_DATA_OPTIONS = {
    insertMethod: "INSERT OR IGNORE",
};
let conversion = new T_Conversation_1.default();
let Message = new T_Message_1.default();
let Group = new T_MsgGroup_1.default();
let GroupMember = new T_GroupMember_1.default();
let MsgContact = new T_MsgContact_1.default();
let MsgFolders = new T_MsgFolders_1.default();
let FolderConversation = new T_FolderConversation_1.default();
let DeletedGroupMember = new T_DeletedGroupMember_1.default();
let MessageAck = new T_MessageAck_1.default();
let TopConversation = new T_TopConversation_1.default();
function initMessageData() {
    return new Promise(async (resolve, reject) => {
        const ackDb = await loadAckDb();
        await MessageAck.init(ackDb);
        loadMsgDb().then(async (db) => {
            Promise.all([
                Message.init(db),
                conversion.init(db),
                Group.init(db),
                GroupMember.init(db),
                DeletedGroupMember.init(db),
                MsgContact.init(db),
                MsgFolders.init(db),
                FolderConversation.init(db),
                TopConversation.init(db),
            ]).then((res) => {
                if (res.every((i) => i)) {
                    resolve({ success: true });
                }
                else {
                    resolve({ success: false });
                }
            });
        });
    });
}
function insertOrUpdateConversation(conversation) {
    return new Promise((resolve, reject) => {
        conversion
            .queryAll(`conversationKey = '${conversation.conversationKey}'`)
            .then((values) => {
            if (values.length) {
                conversion
                    .updateData(conversation, `conversationKey = '${conversation.conversationKey}'`)
                    .then((res) => {
                    resolve({ ...res });
                });
            }
            else {
                conversion.insertData(conversation).then((res) => {
                    conversion
                        .queryFirst(`conversationKey = '${conversation.conversationKey}'`)
                        .then((values) => {
                        resolve({ ...res });
                    });
                });
            }
        });
    });
}
function queryConversationData() {
    return new Promise((resolve, reject) => {
        conversion.queryAll(`1 = 1`).then((values) => {
            resolve({ success: true, rows: values });
        });
    });
}
function queryTopConversationData() {
    return new Promise((resolve, reject) => {
        conversion.queryAll(`isTop = 1`).then((values) => {
            resolve({ success: true, rows: values });
        });
    });
}
function updateUnreadNum(conversationKey, unreadMessageNum) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData({ unreadMessageNum }, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function updateConversationTop(conversationKey, isTop, topTime) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData({ isTop, topTime }, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function updateConversationAvator(conversationKey, avatarUrl) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData({ avatarUrl }, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function updateatMsgCounterStatus(conversationKey, atMsgCounter) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData({ atMsgCounter }, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function updateAtStatus(conversationKey, isRemind) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData({ isRemind }, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function updateReplyStatus(conversationKey, isReply) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData({ isReply }, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function updateCareStatus(conversationKey, isCare) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData({ isCare }, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function updateNewNoticeStatus(conversationKey, isNewNotice) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData({ isNewNotice }, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function updateClazzName(conversationKey, clazzName) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData({ clazzName }, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function updateConversationDraft(conversationKey, draft, draftTime) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData({ draft, draftTime }, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function updateDisturb(conversationKey, isNoDisturb) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData({ isNoDisturb }, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function updateSinglePuid(conversationKey, puid) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData({ puid }, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function updateConversationData(conversationKey, obj) {
    return new Promise((resolve, reject) => {
        conversion
            .updateData(obj, `conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
async function batchUpdateSinglePuid(conversationKeyToPuid) {
    for (const key in conversationKeyToPuid) {
        await updateSinglePuid(String(key), conversationKeyToPuid[key]);
    }
}
function deleteConversationItem(conversationKey, isGroup) {
    return new Promise((resolve, reject) => {
        conversion
            .deleteData(`conversationKey = '${conversationKey}'`)
            .then((res) => {
            resolve(res);
        });
    });
}
function batchInsertMessage(messageList) {
    return new Promise(async (resolve, reject) => {
        await Message.insertDatas(messageList, INSERT_DATA_OPTIONS);
        resolve({ success: true });
    });
}
function insertMessage(option) {
    return new Promise(async (resolve, reject) => {
        const msgbody = json_bigint_1.default.parse(option.msgbody);
        if (option.isSelf) {
            if (msgbody.chatType == "groupChat") {
                if (msgbody?.ext?.showRead == 1) {
                    const groupList = await GroupMember.queryAll(`groupid = '${option.conversationKey}' AND status = 1`);
                    option.unreadCount = Math.max(groupList.length - 1, 0);
                    msgbody.ext.groupMemberList = lodash_1.default.uniqBy(groupList, "uid").map((i) => i.uid);
                    option.msgbody = json_bigint_1.default.stringify(msgbody);
                    Message.insertData(option, INSERT_DATA_OPTIONS).then((res) => {
                        resolve({
                            ...res,
                            unreadCount: option.unreadCount,
                            groupMemberList: msgbody.ext.groupMemberList,
                        });
                    });
                }
                else {
                    option.unreadCount = 0;
                    Message.insertData(option, INSERT_DATA_OPTIONS).then((res) => {
                        resolve({ ...res, unreadCount: option.unreadCount });
                    });
                }
            }
            else {
                option.unreadCount = 1;
                Message.insertData(option, INSERT_DATA_OPTIONS).then((res) => {
                    resolve({ ...res, unreadCount: option.unreadCount });
                });
            }
        }
        else {
            option.unreadCount = 0;
            Message.insertData(option, INSERT_DATA_OPTIONS).then((res) => {
                resolve({ ...res, unreadCount: option.unreadCount });
            });
        }
    });
}
function updateMessageSelfReadByTime(key, timestamp) {
    return new Promise(async (resolve) => {
        await Message.updateData({ isread: 1 }, `conversationKey = '${key}' AND time <= ${Number(timestamp)} AND isread = 0 `);
        const queryRes = await Message.queryNum(`conversationKey = '${key}' AND isread = 0`);
        if (queryRes) {
            await updateUnreadNum(key, queryRes.total);
            resolve({ success: true, unReadNum: queryRes.total });
        }
        else {
            resolve({ success: false });
        }
    });
}
function updateMessageSelfRead(key, isCvst = true, mid = "") {
    return new Promise((resolve, reject) => {
        if (isCvst) {
            Message.updateData({ isread: 1 }, `conversationKey = '${key}' AND isread = 0`).then((res) => {
                resolve(res);
            });
        }
        else {
            Message.updateData({ isread: 1 }, `msgid = ${mid}`).then((res) => {
                resolve(res);
            });
        }
    });
}
const sevenDays = 7 * 24 * 60 * 60 * 1000;
function updateSingleMessageOthterRead(key, mid = "") {
    const currentTime = Date.now();
    const sevenDaysAgo = currentTime - sevenDays;
    return new Promise((resolve, reject) => {
        Message.queryFirst(`msgid = '${mid}'`).then(async (value) => {
            if (value?.time) {
                Message.updateData({ unreadCount: 0 }, `conversationKey = '${key}' AND time BETWEEN '${Number(sevenDaysAgo)}' AND '${Number(value?.time)}' AND unreadCount > 0 AND msgtype <> 'audio'`).then((res) => {
                    resolve(res);
                });
            }
            else {
                resolve({ success: false });
            }
        });
    });
}
function updateAllMessageRead(key) {
    const currentTime = Date.now();
    const sevenDaysAgo = currentTime - sevenDays;
    return new Promise((resolve, reject) => {
        Message.updateData({ unreadCount: 0 }, `conversationKey = '${key}' AND unreadCount > 0 AND time > ${Number(sevenDaysAgo)} AND msgtype <> 'audio'`).then((res) => {
            resolve(res);
        });
    });
}
function updateAudioPlayStatus(key, mid) {
    return new Promise((resolve, reject) => {
        Message.updateData({ isplay: 1 }, `conversationKey = '${key}' AND msgid = '${mid}'`).then((res) => {
            resolve(res);
        });
    });
}
function updateMessageOthterRead(key, isCvst = true, mid = "", readInfo = null, time = null) {
    const currentTime = Date.now();
    const sevenDaysAgo = currentTime - sevenDays;
    return new Promise((resolve, reject) => {
        if (isCvst) {
            Message.updateData({ unreadCount: 0 }, `conversationKey = '${key}' AND unreadCount > 0 AND msgtype <> 'audio' AND time BETWEEN '${Number(sevenDaysAgo)}' AND '${time}'`).then((res) => {
                resolve(res);
            });
        }
        else {
            Message.queryFirst(`msgid = '${mid}'`).then(async (value) => {
                if (value) {
                    let msgbody = json_bigint_1.default.parse(value.msgbody);
                    if (readInfo) {
                        if (msgbody.ext.readList && msgbody.ext.readList.length) {
                            msgbody.ext.readList.push(readInfo);
                        }
                        else {
                            msgbody.ext.readList = [readInfo];
                        }
                        msgbody.ext.readList = lodash_1.default.uniqBy(msgbody.ext.readList, "fromUid");
                    }
                    const oldUnreadCount = value.unreadCount || 0;
                    if (msgbody.chatType == "singleChat") {
                        Message.updateData({
                            unreadCount: oldUnreadCount - 1 >= 0 ? oldUnreadCount - 1 : 0,
                            msgbody: json_bigint_1.default.stringify(msgbody),
                        }, `msgid = ${mid} AND time BETWEEN '${Number(sevenDaysAgo)}' AND '${Number(value.time)}'`).then((res) => {
                            resolve({ ...res, readList: msgbody.ext.readList });
                        });
                    }
                    else {
                        Message.updateData({
                            unreadCount: oldUnreadCount - 1 >= 0 ? oldUnreadCount - 1 : 0,
                            msgbody: json_bigint_1.default.stringify(msgbody),
                        }, `msgid = ${mid}`).then((res) => {
                            resolve({ ...res, readList: msgbody.ext.readList });
                        });
                    }
                }
                else {
                    resolve({ success: false });
                }
            });
        }
    });
}
function getHistoryMessage(option) {
    return new Promise((resolve, reject) => {
        const { conversationKey, lastValue, pageSize, queryType } = option;
        if (lastValue) {
            let result = [];
            Message.queryAll(`conversationKey = '${conversationKey}' AND time ${(queryType == "prev" ? "<=" : ">=") + lastValue}  ORDER BY time ${queryType == "prev" ? "DESC" : "ASC"} LIMIT ${pageSize} OFFSET 0`).then((values) => {
                result = values.map((i) => {
                    return {
                        ...i,
                        unreadCount: i.unreadCount || 0,
                    };
                });
                resolve({ success: true, rows: result });
            });
        }
        else {
            let result = [];
            Message.queryAll(`conversationKey = '${conversationKey}' ORDER BY time DESC LIMIT ${pageSize} OFFSET 0`).then((values) => {
                result = values.map((i) => {
                    return {
                        ...i,
                        unreadCount: i.unreadCount || 0,
                    };
                });
                resolve({ success: true, rows: result });
            });
        }
    });
}
function queryMsgCheckRead(conversationKey, list) {
    return new Promise(async (resolve, reject) => {
        const idConditions = list.map((id) => `msgid = ${id}`).join(" OR ");
        let result = [];
        Message.queryAll(`conversationKey = '${conversationKey}' AND (${idConditions})`).then((values) => {
            result = values.map((i) => {
                return {
                    ...json_bigint_1.default.parse(i.msgbody),
                    isread: i.isread,
                };
            });
            resolve({ success: true, rows: result });
        });
    });
}
function queryLastMessage(key) {
    return new Promise((resolve, reject) => {
        Message.queryFirst(`conversationKey = '${key}' AND msgtype <> 'tips' ORDER BY time DESC LIMIT 1`).then((res) => {
            if (res) {
                resolve({ success: true, data: res });
            }
            else {
                resolve({ success: false });
            }
        });
    });
}
function queryLastMessageNotInviteTip(key) {
    return new Promise((resolve, reject) => {
        if (key.toString()?.length >= 13) {
            Message.queryFirst(`conversationKey = '${key}' AND (msgtype <> 'tips' OR (msgtype = 'tips' AND json_extract(msgbody, '$.ext.data.listUser') IS NOT NULL)) ORDER BY time DESC LIMIT 1`).then((res) => {
                if (res) {
                    resolve({
                        success: true,
                        data: {
                            ...json_bigint_1.default.parse(res.msgbody),
                            isread: res.isread,
                            isplay: res.isplay,
                            unreadCount: res.unreadCount || 0,
                        },
                    });
                }
                else {
                    resolve({ success: false });
                }
            });
        }
        else {
            Message.queryFirst(`conversationKey = '${key}' AND msgtype <> 'tips' ORDER BY time DESC LIMIT 1`).then((res) => {
                if (res) {
                    resolve({
                        success: true,
                        data: {
                            ...json_bigint_1.default.parse(res.msgbody),
                            isread: res.isread,
                            isplay: res.isplay,
                            unreadCount: res.unreadCount || 0,
                        },
                    });
                }
                else {
                    resolve({ success: false });
                }
            });
        }
    });
}
function queryLastNotAudioMessage(key) {
    return new Promise((resolve, reject) => {
        Message.queryFirst(`conversationKey = '${key}' AND msgtype NOT IN ('tips','audio') ORDER BY time DESC `).then((res) => {
            if (res) {
                resolve({ success: true, data: res });
            }
            else {
                resolve({ success: false });
            }
        });
    });
}
function queryOneMessageById(msgid) {
    return new Promise((resolve, reject) => {
        Message.queryFirst(`msgid = '${msgid}'`).then((res) => {
            if (res) {
                resolve({ success: true, data: res });
            }
            else {
                resolve({ success: false });
            }
        });
    });
}
function queryMessageByMsg(str, sendUid) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT conversationKey , COUNT(*) as msgCount, msg ,time
    FROM T_Message
    WHERE msgtype <> 'tips'
    AND msg LIKE '%${str}%'
    AND (senduid <> '${sendUid}' OR json_extract(msgbody, '$.isRecall') IS NULL)
    GROUP BY conversationKey
    HAVING time = MAX(time)
    ORDER BY time DESC
    `;
        Message.m_db.serialize(() => {
            Message.m_db.all(sql, (err, rows) => {
                if (err) {
                    resolve({ success: false, rows: [], err: err });
                }
                else {
                    resolve({ success: true, rows: rows });
                }
            });
        });
    });
}
function queryConversationMsgByMsg(conversationKey, str, lastValue, sendUid) {
    return new Promise((resolve, reject) => {
        Message.queryAll(`conversationKey = '${conversationKey}' AND msgtype <> 'tips' AND (senduid <> '${sendUid}' OR json_extract(msgbody, '$.isRecall') IS NULL) AND msg LIKE '%${str}%' AND ${lastValue ? `time <= ${lastValue}` : "1=1"} ORDER BY time DESC LIMIT 20 OFFSET 0`).then((values) => {
            let result = values.map((i) => {
                return {
                    ...json_bigint_1.default.parse(i.msgbody),
                };
            });
            resolve({ success: true, rows: result });
        });
    });
}
function updateMessageGroupAnnounceExt(conversationKey, ext) {
    return new Promise((resolve) => {
        Message.queryFirst(`conversationKey = '${conversationKey}' AND json_extract(msgbody, '$.ext.announceId') = ${ext.announceId}`).then((value) => {
            if (value) {
                let _msgbody = json_bigint_1.default.parse(value.msgbody);
                _msgbody.ext = { ..._msgbody.ext, ...ext };
                if (ext.opType) {
                    _msgbody.ext.attachment.att_web.opType = "delete";
                }
                Message.updateData({ msgbody: json_bigint_1.default.stringify(_msgbody) }, `msgid = '${_msgbody.id}'`).then((res) => {
                    resolve(res);
                });
            }
            else {
                resolve({ success: false });
            }
        });
    });
}
function queryAttachMsgByTimeOrId(option) {
    return new Promise(async (resolve, reject) => {
        const { conversationKey, sendtime, uid, sendEndtime } = option;
        let startTimeStamp, endTimeStamp;
        const sendTimeDate = sendtime ? new Date(sendtime) : null;
        const sendEndTimeDate = sendEndtime ? new Date(sendEndtime) : null;
        startTimeStamp = sendTimeDate?.setHours(0, 0, 0, 0) || 1;
        endTimeStamp =
            sendEndTimeDate?.setHours(23, 59, 59, 999) ||
                new Date().setHours(23, 59, 59, 999);
        let result = [];
        Message.queryAll(`conversationKey = '${conversationKey}' AND msgtype = 'txt' AND json_extract(msgbody, '$.ext.attachment') <> '' AND json_extract(msgbody, '$.ext.attachment.attachmentType') <> 29 AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"} ORDER BY time DESC`).then((values) => {
            result = values.map((i) => {
                return {
                    ...json_bigint_1.default.parse(i.msgbody),
                    isread: i.isread,
                    unreadCount: i.unreadCount || 0,
                };
            });
            resolve({ success: true, rows: result, total: result?.length || 0 });
        });
    });
}
function queryVideoMsgByTimeOrId(option) {
    return new Promise(async (resolve, reject) => {
        const { conversationKey, lastValue, pageSize, sendtime, uid, sendEndtime } = option;
        let startTimeStamp, endTimeStamp;
        const sendTimeDate = sendtime ? new Date(sendtime) : null;
        const sendEndTimeDate = sendEndtime ? new Date(sendEndtime) : null;
        startTimeStamp = sendTimeDate?.setHours(0, 0, 0, 0) || 1;
        endTimeStamp =
            sendEndTimeDate?.setHours(23, 59, 59, 999) ||
                new Date().setHours(23, 59, 59, 999);
        if (lastValue) {
            let result = [];
            Message.queryAll(`conversationKey = '${conversationKey}' AND time <= ${lastValue} AND msgtype = 'txt' AND json_extract(msgbody, '$.ext.attachment.attachmentType') = 29 AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"} ORDER BY time DESC LIMIT ${pageSize} OFFSET 0`).then((values) => {
                result = values.map((i) => {
                    return {
                        ...json_bigint_1.default.parse(i.msgbody),
                        isread: i.isread,
                        unreadCount: i.unreadCount || 0,
                    };
                });
                resolve({ success: true, rows: result });
            });
        }
        else {
            let result = [];
            const queryRes = await Message.queryNum(`conversationKey = '${conversationKey}' AND msgtype = 'txt' AND json_extract(msgbody, '$.ext.attachment.attachmentType') = 29 AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"}`);
            Message.queryAll(`conversationKey = '${conversationKey}' AND msgtype = 'txt' AND json_extract(msgbody, '$.ext.attachment.attachmentType') = 29 AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"} ORDER BY time DESC LIMIT ${pageSize} OFFSET 0`).then((values) => {
                result = values.map((i) => {
                    return {
                        ...json_bigint_1.default.parse(i.msgbody),
                        isread: i.isread,
                        unreadCount: i.unreadCount || 0,
                    };
                });
                resolve({ success: true, rows: result, total: queryRes.total });
            });
        }
    });
}
function queryImgMsgByTimeOrId(option) {
    return new Promise(async (resolve, reject) => {
        const { conversationKey, lastValue, pageSize, sendtime, uid, sendEndtime } = option;
        let startTimeStamp, endTimeStamp;
        const sendTimeDate = sendtime ? new Date(sendtime) : null;
        const sendEndTimeDate = sendEndtime ? new Date(sendEndtime) : null;
        startTimeStamp = sendTimeDate?.setHours(0, 0, 0, 0) || 1;
        endTimeStamp =
            sendEndTimeDate?.setHours(23, 59, 59, 999) ||
                new Date().setHours(23, 59, 59, 999);
        if (lastValue) {
            let result = [];
            Message.queryAll(`conversationKey = '${conversationKey}' AND time <= ${lastValue} AND msgtype = 'img' AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"} ORDER BY time DESC LIMIT ${pageSize} OFFSET 0`).then((values) => {
                result = values.map((i) => {
                    return {
                        ...json_bigint_1.default.parse(i.msgbody),
                        isread: i.isread,
                        unreadCount: i.unreadCount || 0,
                    };
                });
                resolve({ success: true, rows: result });
            });
        }
        else {
            let result = [];
            const queryRes = await Message.queryNum(`conversationKey = '${conversationKey}' AND msgtype = 'img' AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"}`);
            Message.queryAll(`conversationKey = '${conversationKey}' AND msgtype = 'img' AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"} ORDER BY time DESC LIMIT ${pageSize} OFFSET 0`).then((values) => {
                result = values.map((i) => {
                    return {
                        ...json_bigint_1.default.parse(i.msgbody),
                        isread: i.isread,
                        unreadCount: i.unreadCount || 0,
                    };
                });
                resolve({ success: true, rows: result, total: queryRes.total });
            });
        }
    });
}
function queryMsgByTimeOrId(option) {
    return new Promise(async (resolve, reject) => {
        const { conversationKey, lastValue, pageSize, sendtime, uid, msg, sendEndtime, } = option;
        let startTimeStamp, endTimeStamp;
        const sendTimeDate = sendtime ? new Date(sendtime) : null;
        const sendEndTimeDate = sendEndtime ? new Date(sendEndtime) : null;
        startTimeStamp = sendTimeDate?.setHours(0, 0, 0, 0) || 1;
        endTimeStamp =
            sendEndTimeDate?.setHours(23, 59, 59, 999) ||
                new Date().setHours(23, 59, 59, 999);
        if (lastValue) {
            let result = [];
            Message.queryAll(`conversationKey = '${conversationKey}' AND time <= ${lastValue} AND ${msg ? `msg LIKE '%${msg}%'` : "1=1"} AND msgtype <> 'tips' AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"} ORDER BY time DESC LIMIT ${pageSize} OFFSET 0`).then((values) => {
                result = values.map((i) => {
                    return {
                        ...json_bigint_1.default.parse(i.msgbody),
                        isread: i.isread,
                        unreadCount: i.unreadCount || 0,
                    };
                });
                resolve({ success: true, rows: result });
            });
        }
        else {
            let result = [];
            const queryRes = await Message.queryNum(`conversationKey = '${conversationKey}' AND  ${msg ? `msg LIKE '%${msg}%'` : "1=1"} AND msgtype <> 'tips' AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"}`);
            Message.queryAll(`conversationKey = '${conversationKey}' AND  ${msg ? `msg LIKE '%${msg}%'` : "1=1"} AND msgtype <> 'tips' AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"} ORDER BY time DESC LIMIT ${pageSize} OFFSET 0`).then((values) => {
                result = values.map((i) => {
                    return {
                        ...json_bigint_1.default.parse(i.msgbody),
                        isread: i.isread,
                        unreadCount: i.unreadCount || 0,
                    };
                });
                resolve({ success: true, rows: result, total: queryRes.total });
            });
        }
    });
}
function delOneMessage(mid) {
    return new Promise((resolve, reject) => {
        Message.deleteData(`msgid = '${mid}'`).then((res) => {
            resolve(res);
        });
    });
}
function delAllMessageRecord(key) {
    return new Promise((resolve, reject) => {
        Message.deleteData(`conversationKey = '${key}'`).then((res) => {
            resolve(res);
        });
    });
}
function updateMsgBody(msgbody, localMsgId) {
    if (!msgbody)
        return;
    return new Promise((resolve, reject) => {
        Message.updateData({ msgbody: json_bigint_1.default.stringify(msgbody), msgid: msgbody.id }, `msgid = '${localMsgId}'`).then((res) => {
            resolve(res);
        });
    });
}
function insetGroupDetail(option) {
    return new Promise((resolve, reject) => {
        Group.queryFirst(`id = '${option.id}'`).then((value) => {
            if (value) {
                Group.updateData(option, `id = ${option.id}`).then((res) => {
                    resolve(res);
                });
            }
            else {
                Group.insertData(option).then((res) => {
                    resolve(res);
                });
            }
        });
    });
}
function updateGroupDetail(groupid, option) {
    return new Promise((resolve, reject) => {
        Group.updateData(option, `id = ${groupid}`).then((res) => {
            resolve(res);
        });
    });
}
function updateGroupMemberDetail(groupid, uid, option) {
    return new Promise((resolve, reject) => {
        GroupMember.updateData(option, `groupid = '${groupid}' AND uid = '${uid}'`).then((res) => {
            resolve(res);
        });
    });
}
function updateGroupAdminList(groupid, adminList) {
    return new Promise((resolve, reject) => {
        if (adminList.length) {
            GroupMember.updateColumnByCase("admin", `CASE WHEN uid IN (${adminList.join(",")}) THEN 1 ELSE 0 END WHERE groupid = '${groupid}'`).then((res) => {
                resolve(res);
            });
        }
        else {
            GroupMember.updateData({ admin: 0 }, `groupid = '${groupid}'`).then((res) => {
                resolve(res);
            });
        }
    });
}
function updateGroupOwner(groupid, uid, status) {
    return new Promise((resolve, reject) => {
        GroupMember.updateData({ owner: status }, `groupid = '${groupid}' AND uid = '${uid}'`).then((res) => {
            resolve(res);
        });
    });
}
function insetGroupMembers(option) {
    return new Promise(async (resolve, reject) => {
        await GroupMember.insertDatas(option);
        resolve({ success: true });
    });
}
function queryGroup(key) {
    return new Promise((resolve, reject) => {
        if (key) {
            Group.queryAll(`id = '${key}'`).then((values) => {
                resolve({ success: true, rows: values });
            });
        }
        else {
            Group.queryAll().then((values) => {
                resolve({ success: true, rows: values });
            });
        }
    });
}
function queryGroupMembers(key) {
    return new Promise((resolve, reject) => {
        GroupMember.queryAll(`groupid = '${key}' AND status = 1`).then((values) => {
            resolve({ success: true, rows: values });
        });
    });
}
function queryGroupMembersByUids(groupId, uids) {
    return new Promise((resolve, reject) => {
        GroupMember.queryAll(`groupid = ${groupId} AND uid IN (${uids.join(",")})`).then((values) => {
            resolve({ success: true, rows: values });
        });
    });
}
function queryGroupMembersUidName(key) {
    return new Promise((resolve, reject) => {
        GroupMember.queryAll(`groupid = '${key}' AND status = 1`).then((values) => {
            const resObj = {};
            if (values) {
                values.forEach((i) => {
                    resObj[i.uid] = i.name;
                });
            }
            resolve({ success: true, rows: resObj });
        });
    });
}
function queryPeopleDetail(key, uid) {
    return new Promise((resolve, reject) => {
        GroupMember.queryAll(`groupid = '${key}' AND uid = '${uid}' AND status = 1`).then((values) => {
            resolve({ success: true, rows: values });
        });
    });
}
function queryFirstPeopleDetail(uid) {
    return new Promise((resolve, reject) => {
        GroupMember.queryFirst(`uid = '${uid}'`).then((values) => {
            resolve({ success: true, data: values });
        });
    });
}
function updatePeopleNameInGroup(uid, name) {
    return new Promise((resolve, reject) => {
        GroupMember.updateData({ name }, `uid = '${uid}'`).then((res) => {
            resolve(res);
        });
    });
}
function delGroupMembers(key, uids) {
    return new Promise((resolve, reject) => {
        GroupMember.deleteData(`groupid = '${key}' AND (uid IN (${uids.join(",")}) OR status = 0)`).then((res) => {
            resolve(res);
        });
    });
}
function delGroupDetail(key) {
    return new Promise((resolve, reject) => {
        Group.deleteData(`id = '${key}'`).then((res) => {
            resolve(res);
        });
    });
}
function delAllGroupMembers(key) {
    return new Promise((resolve, reject) => {
        GroupMember.deleteData(`groupid = '${key}'`).then((res) => {
            resolve(res);
        });
    });
}
function destroyGroup(key) {
    return new Promise((resolve, reject) => {
        Promise.all([
            conversion.deleteData(`conversationKey = '${key}'`),
            delGroupDetail(key),
            delAllGroupMembers(key),
            delAllMessageRecord(key),
            delDeletedGroupMembers(key),
        ]).then((res) => {
            resolve(res[3]);
        });
    });
}
function deleteAllMessageRecord() {
    return new Promise((resolve, reject) => {
        Promise.all([
            conversion.deleteData(),
            Group.deleteData(),
            GroupMember.deleteData(),
            Message.deleteData(),
        ]).then((res) => {
            resolve(res[3]);
        });
    });
}
function delDeletedGroupMembers(key) {
    return new Promise((resolve, reject) => {
        DeletedGroupMember.deleteData(`groupid = '${key}'`).then((res) => {
            resolve(res);
        });
    });
}
function queryDeletedGroupMembers(key) {
    return new Promise((resolve, reject) => {
        DeletedGroupMember.queryAll(`groupid = '${key}'`).then((values) => {
            resolve({ success: true, rows: values });
        });
    });
}
function insetDeletedGroupMembers(option) {
    return new Promise(async (resolve, reject) => {
        await DeletedGroupMember.insertDatas(option);
        resolve({ success: true });
    });
}
function queryPeopleDetailInDeletedGroup(key, uid) {
    return new Promise((resolve, reject) => {
        DeletedGroupMember.queryAll(`groupid = '${key}' AND uid = '${uid}'`).then((values) => {
            resolve({ success: true, rows: values });
        });
    });
}
function queryPeopleInDeletedGroupMember(uid) {
    return new Promise((resolve, reject) => {
        DeletedGroupMember.queryAll(`uid = '${uid}'`).then((values) => {
            resolve({ success: true, data: values });
        });
    });
}
function updatePeopleNameInDeletedGroupMember(uid, name) {
    return new Promise((resolve, reject) => {
        DeletedGroupMember.updateData({ name }, `uid = '${uid}'`).then((res) => {
            resolve(res);
        });
    });
}
async function queryAllMsgContacts() {
    try {
        const res = await MsgContact.queryAll();
        return { success: true, rows: res };
    }
    catch (error) {
        console.error("queryAllMsgContacts error", error);
        return { success: false };
    }
}
async function insertMsgContacts(userList) {
    try {
        await MsgContact.insertDatas(userList);
        return { success: true };
    }
    catch (error) {
        console.error("queryAllMsgContacts error", error);
        return { success: false };
    }
}
function updatePeopleNameInMsgContact(uid, name) {
    return new Promise((resolve, reject) => {
        MsgContact.updateData({ name }, `uid = '${uid}'`).then((res) => {
            resolve(res);
        });
    });
}
async function insertMsgFolders(folderList) {
    try {
        const oldFolderList = await MsgFolders.queryAll();
        folderList.forEach((item) => {
            const oldItem = oldFolderList.find((i) => i.id == item.id);
            item.isTop = oldItem?.isTop || 0;
        });
        await MsgFolders.deleteData();
        await MsgFolders.insertDatas(folderList);
        return { success: true };
    }
    catch (error) {
        console.error("insertMsgFolders error", error);
        return { success: false };
    }
}
async function insertSingleMsgFolder(folder) {
    try {
        await MsgFolders.insertData(folder);
        return { success: true };
    }
    catch (error) {
        console.error("insertSingleMsgFolder error", error);
        return { success: false };
    }
}
async function updateMsgFolder(folderId, obj) {
    try {
        const res = await MsgFolders.updateData(obj, `id = '${folderId}'`);
        return res;
    }
    catch (error) {
        console.error("insertMsgFolders error", error);
        return { success: false };
    }
}
async function deleteMsgFolder(folderId) {
    try {
        const res = await MsgFolders.deleteData(`id = '${folderId}'`);
        return res;
    }
    catch (error) {
        console.error("deleteMsgFolder error", error);
        return { success: false };
    }
}
async function insertFolderConversation(conversationList) {
    try {
        await FolderConversation.deleteData();
        await FolderConversation.insertDatas(conversationList);
        return { success: true };
    }
    catch (error) {
        console.error("insertMsgFolders error", error);
        return { success: false };
    }
}
async function insertSingleFolderConversation(conversation) {
    try {
        await FolderConversation.deleteData(`msgId = '${conversation.msgId}'`);
        await FolderConversation.insertData(conversation);
        return { success: true };
    }
    catch (error) {
        console.error("insertMsgFolders error", error);
        return { success: false };
    }
}
async function deleteSingleFolderConversation(msgId) {
    try {
        const res = await FolderConversation.deleteData(`msgId = '${msgId}'`);
        return res;
    }
    catch (error) {
        console.error("deleteFolderConversation error", error);
        return { success: false };
    }
}
async function deleteFolderConversation(folderId) {
    try {
        const res = await FolderConversation.deleteData(`folderId = '${folderId}'`);
        return res;
    }
    catch (error) {
        console.error("deleteFolderConversation error", error);
        return { success: false };
    }
}
async function queryAllMsgFolders() {
    try {
        const folders = await MsgFolders.queryAll();
        const conversation = await FolderConversation.queryAll();
        return {
            success: true,
            folders: folders || [],
            conversation: conversation || [],
        };
    }
    catch (error) {
        console.error("queryAllMsgFolders error", error);
        return { success: false };
    }
}
async function queryFolderConversation(key) {
    return new Promise((resolve, reject) => {
        FolderConversation.queryFirst(`msgId = '${key}'`).then((value) => {
            if (value) {
                MsgFolders.queryFirst(`id = '${value.folderId}'`).then((value) => {
                    resolve({ success: true, data: value });
                });
            }
            else {
                resolve({ success: false });
            }
        });
    });
}
function queryTopMsgFolders() {
    return new Promise((resolve, reject) => {
        MsgFolders.queryAll(`isTop = 1`).then((values) => {
            resolve({ success: true, rows: values });
        });
    });
}
function queryGroupIsReadAll(key) {
    return new Promise((resolve, reject) => {
        Message.queryAll(`conversationKey = '${key}' AND isread = 0`).then((values) => {
            resolve({ success: true, rows: values });
        });
    });
}
function insertMessageAck(data) {
    return new Promise((resolve, reject) => {
        MessageAck.insertData(data).then((res) => {
            resolve({ ...res });
        });
    });
}
function queryMessageAck() {
    return new Promise((resolve, reject) => {
        MessageAck.queryAll().then((values) => {
            resolve({ success: true, rows: values });
        });
    });
}
function deleteSevenDaysAck() {
    const currentTime = Date.now();
    const sevenDaysAgo = currentTime - sevenDays;
    return new Promise((resolve, reject) => {
        MessageAck.deleteData(`time < ${sevenDaysAgo}`).then((res) => {
            resolve(res);
        });
    });
}
function deleteSingleAck(msgid, acktype) {
    return new Promise((resolve, reject) => {
        MessageAck.deleteData(`msgid = ${msgid} AND acktype = ${acktype}`).then((res) => {
            resolve(res);
        });
    });
}
function insertOrUpdateTopConversation(data) {
    return new Promise((resolve, reject) => {
        TopConversation.queryAll(`sessionId = '${data.sessionId}'`).then((values) => {
            if (values.length) {
                TopConversation.updateData(data, `sessionId = '${data.sessionId}'`).then((res) => {
                    resolve({ ...res });
                });
            }
            else {
                TopConversation.insertData(data).then((res) => {
                    TopConversation.queryFirst(`sessionId = '${data.sessionId}'`).then((values) => {
                        resolve({ ...res });
                    });
                });
            }
        });
    });
}
function updateGroupTopIsSync(id) {
    return new Promise((resolve, reject) => {
        TopConversation.updateData({ isSync: 1 }, `sessionId = ${id}`).then((res) => {
            resolve(res);
        });
    });
}
function queryTopConversationIsSync() {
    return new Promise((resolve, reject) => {
        let result = [];
        TopConversation.queryAll(`isSync = 2`).then((values) => {
            values.reverse();
            result = values.map((i) => {
                return {
                    sessionId: i.sessionId,
                    type: i.type,
                    operateType: i.operateType,
                    sort: i.sort,
                };
            });
            resolve({ success: true, rows: result });
        });
    });
}
function queryNewTopConversation() {
    return new Promise((resolve, reject) => {
        TopConversation.queryAll(`operateType = 1`).then((values) => {
            resolve({ success: true, rows: values });
        });
    });
}
function deleteNewTopConversation(id) {
    return new Promise((resolve, reject) => {
        TopConversation.deleteData(`sessionId = ${id}`).then((res) => {
            resolve(res);
        });
    });
}
function deleteAllTopConversation() {
    return new Promise((resolve, reject) => {
        TopConversation.deleteData().then((res) => {
            resolve(res);
        });
    });
}
function updateConversationsIsNoDisturb(conversationIds, value) {
    return new Promise((resolve, reject) => {
        const isNoDisturb = value ? 1 : 0;
        const conversationKeysString = conversationIds
            .map((id) => `'${id}'`)
            .join(",");
        conversion
            .updateData({ isNoDisturb }, `conversationKey IN (${conversationKeysString})`)
            .then((res) => {
            resolve(res);
        })
            .catch((err) => {
            reject(err);
        });
    });
}
function queryAllIsNoDisturbConversation() {
    return new Promise((resolve, reject) => {
        conversion
            .queryAll("isNoDisturb = 1")
            .then((values) => {
            resolve({ success: true, rows: values });
        })
            .catch((error) => {
            console.error("查询消息免打扰会话出错:", error);
            reject({ success: false, error });
        });
    });
}
function updateMessageFieldInMsgbody(msgid, fieldName, newValue) {
    return new Promise(async (resolve, reject) => {
        try {
            const message = await Message.queryFirst(`msgid = '${msgid}'`);
            if (!message) {
                resolve({ success: false, data: "Message not found" });
                return;
            }
            let msgbody = json_bigint_1.default.parse(message.msgbody);
            msgbody[fieldName] = newValue;
            const updatedMsgbody = json_bigint_1.default.stringify(msgbody);
            const updateResult = await Message.updateData({ msgbody: updatedMsgbody }, `msgid = '${msgid}'`);
            resolve({ success: true, data: updateResult });
        }
        catch (error) {
            console.error("Error updating message field in msgbody:", error);
            reject({ success: false, data: error });
        }
    });
}
function updateMessageSendType(msgid, newSendType) {
    return updateMessageFieldInMsgbody(msgid, "sendType", newSendType);
}
function updateConversationOrigin(conversationKey, origin) {
    return conversion.updateData({ origin }, `conversationKey = ${conversationKey}`);
}
const QUERY_CHAT_HISTORY_SQL = `conversationKey = ? AND msgtype != 'tips' AND time >= ? ORDER BY time DESC LIMIT ?`;
function queryChatHistory(conversationKey, startTime, limit = 50) {
    return Message.queryAll(QUERY_CHAT_HISTORY_SQL, [
        conversationKey,
        String(startTime),
        String(limit),
    ]);
}
function queryChatHistoryCount(conversationKey, startTime, limit = 50) {
    return Message.queryNum(`conversationKey = ${conversationKey} AND msgtype != 'tips' AND time >= ${startTime} ORDER BY time DESC LIMIT ${limit}`);
}
function queryGroupOwner(groupId) {
    return GroupMember.queryFirst(`groupid = ${groupId} AND owner = 1`);
}
function queryMessageByKeyAndTime(conversationKey, time) {
    return Message.queryFirst(`conversationKey = ${conversationKey} AND time = ${time}`);
}
function updateMessage(mid, data) {
    return Message.updateData(data, `msgid = ${mid}`);
}
function queryGroupByKeyWithRobotList(conversationKey) {
    return Message.queryFirst(`conversationKey = ${conversationKey} AND json_valid(description) = 1 AND json_extract(description, '$.robotList') IS NOT NULL`);
}
function queryDatesWithHasMessage(options) {
    const { conversationKey, msgType = "all", sendUid } = options;
    return new Promise((resolve) => {
        let msgTypeSql = "1=1";
        switch (msgType) {
            case "img": {
                msgTypeSql = "(msgtype = 'img' OR json_extract(msgbody, '$.ext.textMixings') IS NOT NULL)";
                break;
            }
            case "video": {
                msgTypeSql =
                    "msgtype = 'txt' AND json_extract(msgbody, '$.ext.attachment.attachmentType') = 29";
                break;
            }
            case "attach": {
                msgTypeSql =
                    "msgtype = 'txt' AND json_extract(msgbody, '$.ext.attachment') <> '' AND json_extract(msgbody, '$.ext.attachment.attachmentType') <> 29";
                break;
            }
        }
        let sendUidSql = "1=1";
        if (sendUid) {
            sendUidSql = `senduid = ${sendUid}`;
        }
        const sql = `SELECT DISTINCT strftime('%Y-%m-%d', time / 1000, 'unixepoch') AS msgDate
      FROM T_Message
      WHERE conversationKey = ?
      AND msgtype <> 'tips'
      AND ${msgTypeSql}
      AND ${sendUidSql}
      ORDER BY msgDate DESC;`;
        const params = [conversationKey];
        Message.m_db.all(sql, params, function (error, rows) {
            if (error) {
                resolve({ success: false, error });
            }
            else {
                resolve({ success: true, rows });
            }
        });
    });
}
function queryRichImgMsgByTimeOrId(option) {
    return new Promise(async (resolve, reject) => {
        const { conversationKey, lastValue, pageSize, sendtime, uid, sendEndtime } = option;
        let startTimeStamp, endTimeStamp;
        const sendTimeDate = sendtime ? new Date(sendtime) : null;
        const sendEndTimeDate = sendEndtime ? new Date(sendEndtime) : null;
        startTimeStamp = sendTimeDate?.setHours(0, 0, 0, 0) || 1;
        endTimeStamp =
            sendEndTimeDate?.setHours(23, 59, 59, 999) ||
                new Date().setHours(23, 59, 59, 999);
        if (lastValue) {
            let result = [];
            Message.queryAll(`conversationKey = '${conversationKey}' AND time <= ${lastValue} AND msgtype = 'txt' AND json_extract(msgbody, '$.ext.textMixings') IS NOT NULL AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"} ORDER BY time DESC LIMIT ${pageSize} OFFSET 0`).then((values) => {
                result = values.map((i) => {
                    return {
                        ...json_bigint_1.default.parse(i.msgbody),
                        isread: i.isread,
                        unreadCount: i.unreadCount || 0,
                    };
                });
                resolve({ success: true, rows: result });
            });
        }
        else {
            let result = [];
            const queryRes = await Message.queryNum(`conversationKey = '${conversationKey}' AND msgtype = 'txt' AND json_extract(msgbody, '$.ext.textMixings') IS NOT NULL AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"}`);
            Message.queryAll(`conversationKey = '${conversationKey}' AND msgtype = 'txt' AND json_extract(msgbody, '$.ext.textMixings') IS NOT NULL AND time >= ${startTimeStamp} AND time <= ${endTimeStamp} AND ${uid ? `senduid IN (${uid})` : "1=1"} ORDER BY time DESC LIMIT ${pageSize} OFFSET 0`).then((values) => {
                result = values.map((i) => {
                    return {
                        ...json_bigint_1.default.parse(i.msgbody),
                        isread: i.isread,
                        unreadCount: i.unreadCount || 0,
                    };
                });
                resolve({ success: true, rows: result, total: queryRes.total });
            });
        }
    });
}
async function isDeptGroup(groupId) {
    const res = await Group.queryFirst(`id = '${groupId}' AND json_valid(description) AND json_extract(description, '$.groupType') = 103;`);
    return res !== undefined;
}
module.exports = {
    initMessageData,
    insertOrUpdateConversation,
    queryConversationData,
    queryTopConversationData,
    updateUnreadNum,
    updateatMsgCounterStatus,
    updateAtStatus,
    updateReplyStatus,
    updateCareStatus,
    updateConversationTop,
    updateConversationAvator,
    updateConversationData,
    updateSinglePuid,
    batchUpdateSinglePuid,
    updateConversationDraft,
    updateNewNoticeStatus,
    updateClazzName,
    updateDisturb,
    insertMessage,
    batchInsertMessage,
    queryLastMessage,
    queryLastNotAudioMessage,
    queryLastMessageNotInviteTip,
    queryOneMessageById,
    getHistoryMessage,
    queryMsgCheckRead,
    updateMsgBody,
    insetGroupDetail,
    updateGroupDetail,
    updateGroupMemberDetail,
    updateAllMessageRead,
    insetGroupMembers,
    updateGroupAdminList,
    updateGroupOwner,
    queryGroupOwner,
    queryGroup,
    queryGroupMembers,
    queryGroupMembersByUids,
    delGroupMembers,
    delOneMessage,
    deleteConversationItem,
    queryPeopleDetail,
    queryFirstPeopleDetail,
    delAllMessageRecord,
    destroyGroup,
    updateMessageSelfRead,
    updateMessageOthterRead,
    updateAudioPlayStatus,
    updateSingleMessageOthterRead,
    updateMessageSelfReadByTime,
    queryMessageByMsg,
    queryMsgByTimeOrId,
    queryImgMsgByTimeOrId,
    queryVideoMsgByTimeOrId,
    queryAttachMsgByTimeOrId,
    queryAllMsgContacts,
    insertMsgContacts,
    deleteAllMessageRecord,
    updateMessageGroupAnnounceExt,
    updatePeopleNameInGroup,
    insertMsgFolders,
    insertFolderConversation,
    queryAllMsgFolders,
    insertSingleMsgFolder,
    updateMsgFolder,
    deleteMsgFolder,
    deleteFolderConversation,
    insertSingleFolderConversation,
    deleteSingleFolderConversation,
    queryConversationMsgByMsg,
    queryGroupMembersUidName,
    queryGroupIsReadAll,
    queryDeletedGroupMembers,
    insetDeletedGroupMembers,
    queryPeopleDetailInDeletedGroup,
    insertMessageAck,
    queryMessageAck,
    deleteSingleAck,
    deleteSevenDaysAck,
    queryPeopleInDeletedGroupMember,
    updatePeopleNameInDeletedGroupMember,
    updatePeopleNameInMsgContact,
    queryTopMsgFolders,
    insertOrUpdateTopConversation,
    queryTopConversationIsSync,
    queryNewTopConversation,
    updateGroupTopIsSync,
    deleteNewTopConversation,
    deleteAllTopConversation,
    queryFolderConversation,
    updateConversationsIsNoDisturb,
    queryAllIsNoDisturbConversation,
    updateMessageSendType,
    updateConversationOrigin,
    queryChatHistoryCount,
    queryChatHistory,
    queryMessageByKeyAndTime,
    updateMessage,
    queryGroupByKeyWithRobotList,
    queryDatesWithHasMessage,
    queryRichImgMsgByTimeOrId,
    isDeptGroup
};
//# sourceMappingURL=MessageDbHelper.js.map