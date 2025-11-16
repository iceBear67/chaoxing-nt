"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("./T_BaseTable");
class T_Message extends T_BaseTable_1.BaseTable {
    getTableName() {
        return "T_Message";
    }
    getColumns() {
        return [
            { name: "msgid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "time", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "conversationKey", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "isread", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "unreadCount", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "msg", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "msgtype", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "customtype", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "msgbody", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "senduid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "isplay", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "checkMsgReadTime", type: T_BaseTable_1.ColumnType.INTEGER },
        ];
    }
    getTableVersion() {
        return 10;
    }
    onTableCreate() {
        const indexSql = `CREATE INDEX idx_conversationKey_time ON ${this.getTableName()} (conversationKey,time)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const idIndexSql = `CREATE INDEX idx_msgid ON ${this.getTableName()} (msgid)`;
        this.m_db.run(idIndexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const msgIndexSql = `CREATE INDEX idx_msgtype ON ${this.getTableName()} (msgtype)`;
        this.m_db.run(msgIndexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) {
        if (oldVersion <= 2) {
            const updateSql = `UPDATE T_Message SET unreadCount = 0`;
            this.m_db.run(updateSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 3) {
            const updateSql = `UPDATE T_Message SET senduid = json_extract(msgbody, '$.from') WHERE msgbody IS NOT NULL`;
            this.m_db.run(updateSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 4) {
            const indexSql = `CREATE INDEX idx_conversationKey_time ON ${this.getTableName()} (conversationKey,time)`;
            this.m_db.run(indexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
            const idIndexSql = `CREATE INDEX idx_msgid ON ${this.getTableName()} (msgid)`;
            this.m_db.run(idIndexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 5) {
            const updateSql1 = `UPDATE T_Message SET isplay = 1`;
            this.m_db.run(updateSql1, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 6) {
            const msgIndexSql = `CREATE INDEX idx_msgtype ON ${this.getTableName()} (msgtype)`;
            this.m_db.run(msgIndexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 8) {
            const isRecallIndexSql = `CREATE INDEX idx_isRecall ON ${this.getTableName()} (json_extract(msgbody, '$.isRecall'))`;
            this.m_db.run(isRecallIndexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 9) {
            const tableName = this.getTableName();
            const transactionSql = `
                -- 步骤 1: 删除重复行，只保留每个 msgid 组中 ROWID 最小的行
                DELETE FROM ${tableName}
                WHERE ROWID NOT IN (
                    SELECT MIN(ROWID)
                    FROM ${tableName}
                    GROUP BY msgid
                );

                -- 步骤 2: 删除旧的索引 (使用 IF EXISTS 避免在索引不存在时报错)
                DROP INDEX IF EXISTS idx_msgid;

                -- 步骤 3: 在 msgid 列上创建新的唯一索引
                CREATE UNIQUE INDEX idx_msgid ON ${tableName} (msgid);

                COMMIT;
            `;
            this.m_db.exec(transactionSql, function (error) {
                if (error) {
                    console.error("[T_Message.ts] Create unique index failed", error.message);
                }
                else {
                    console.log("[T_Message.ts] Create unique index success!");
                }
            });
        }
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
    }
}
exports.default = T_Message;
module.exports = T_Message;
//# sourceMappingURL=T_Message.js.map