"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("./T_BaseTable");
class T_Conversation extends T_BaseTable_1.BaseTable {
    getTableName() {
        return "T_Conversation";
    }
    getColumns() {
        return [
            { name: "id", type: T_BaseTable_1.ColumnType.INTEGER, key: true },
            { name: "avatarUrl", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "name", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "conversationKey", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "conversationType", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "fromId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "fromName", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "latestMessage", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "latestMessageType", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "latestMessageSendType", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "latestMessageId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "latestSendTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "puid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "targetId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "unreadMessageNum", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "ext", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "isTop", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "topTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isNoDisturb", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isSilent", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isRemind", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isReply", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "atMsgCounter", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "draft", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "draftTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isCare", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isNewNotice", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "clazzName", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "origin", type: T_BaseTable_1.ColumnType.TEXT },
        ];
    }
    getTableVersion() {
        return 17;
    }
    onTableCreate() {
        const indexSql = `CREATE INDEX idx_conversationKey ON ${this.getTableName()} (conversationKey)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) {
        if (oldVersion <= 3) {
            const updateSql = `UPDATE T_Conversation SET isRemind = false`;
            this.m_db.run(updateSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 4) {
            const updateSql = `UPDATE T_Conversation SET isNoDisturb = false`;
            this.m_db.run(updateSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 7) {
            const updateSql = `UPDATE T_Conversation SET isCare = false`;
            this.m_db.run(updateSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 8) {
            const updateSql = `UPDATE T_Conversation SET isReply = false`;
            this.m_db.run(updateSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 9) {
            const updateSql = `UPDATE T_Conversation SET atMsgCounter = 0`;
            this.m_db.run(updateSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 11) {
            const indexSql = `CREATE INDEX idx_conversationKey ON ${this.getTableName()} (conversationKey)`;
            this.m_db.run(indexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 12) {
            const updateSql = `UPDATE T_Conversation SET isNewNotice = false`;
            this.m_db.run(updateSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 14) {
            const updateSql1 = `UPDATE T_Conversation SET isSilent = false`;
            this.m_db.run(updateSql1, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 15) {
            const updateSql1 = `UPDATE T_Conversation SET latestMessageSendType = 'success'`;
            this.m_db.run(updateSql1, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
    }
}
exports.default = T_Conversation;
module.exports = T_Conversation;
//# sourceMappingURL=T_Conversation.js.map