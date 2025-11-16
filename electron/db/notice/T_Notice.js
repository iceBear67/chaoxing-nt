"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("../T_BaseTable");
let setUserStore;
if (process.type == "renderer") {
    setUserStore = require("../../renderer/RendererHelper").setUserStore;
}
else {
    setUserStore = require("../../main/MainHelper").setUserStore;
}
class T_Notice extends T_BaseTable_1.BaseTable {
    constructor() {
        super();
    }
    getTableName() {
        return `T_Notice`;
    }
    getColumns() {
        return [
            { name: "allowComments", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "attachment", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "collect", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "completeTime", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "content", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "count_all", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "count_read", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "createrId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "createrName", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "createrPuid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "folderId", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "id", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "idCode", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "insertTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isRtf", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isread", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "letterMode", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "logo", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "personStatus", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "praise_count", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "receiverArray", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "recycle", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "redDot", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "reqSendParams", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "rtf_content", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "sendDuration", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "sendTag", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "sendTime", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "send_sign", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "shareUrl", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "source", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "sourceType", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "status", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "title", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "toNames", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "top", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "updateTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "tocc", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "foldId", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "extendParam", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "sessionTag", type: T_BaseTable_1.ColumnType.INTEGER },
        ];
    }
    getTableVersion() {
        return 12;
    }
    convertToDbData(jsData) {
        let data = Object.assign({}, jsData);
        if (jsData.receiverArray && typeof (jsData.receiverArray) == "object") {
            data.receiverArray = JSON.stringify(jsData.receiverArray);
        }
        if (jsData.toNames && typeof (jsData.toNames) == "object") {
            data.toNames = JSON.stringify(jsData.toNames);
        }
        if (jsData.tocc && typeof (jsData.tocc) == "object") {
            data.tocc = JSON.stringify(jsData.tocc);
        }
        if (jsData.extendParam && typeof (jsData.extendParam) == "object") {
            data.extendParam = JSON.stringify(jsData.extendParam);
        }
        return data;
    }
    convertFromDbData(dbData) {
        let data = Object.assign({}, dbData);
        if (dbData.receiverArray) {
            try {
                data.receiverArray = JSON.parse(dbData.receiverArray);
            }
            catch (error) {
                console.log('convertFromDbData-receiverArray', error);
            }
        }
        if (dbData.toNames) {
            try {
                data.toNames = JSON.parse(dbData.toNames);
            }
            catch (error) {
                console.log('convertFromDbData-toNames', error);
            }
        }
        if (dbData.attachment) {
            try {
                data.attachment = JSON.parse(dbData.attachment);
            }
            catch (error) {
                console.log('convertFromDbData-attachment', error);
            }
        }
        if (dbData.tocc) {
            try {
                data.tocc = JSON.parse(dbData.tocc);
            }
            catch (error) {
                console.log('convertFromDbData-tocc', error);
            }
        }
        if (dbData.extendParam) {
            try {
                data.extendParam = JSON.parse(dbData.extendParam);
            }
            catch (error) {
                console.log('convertFromDbData-extendParam', error);
            }
        }
        return data;
    }
    onTableCreate() {
        const indexfoldIdTag = `CREATE INDEX notice_folderId_sessionTag ON ${this.getTableName()} (folderId,sessionTag)`;
        this.m_db.run(indexfoldIdTag, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexfoldId = `CREATE INDEX notice_folderId_foldId ON ${this.getTableName()} (folderId,foldId)`;
        this.m_db.run(indexfoldId, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSql = `CREATE INDEX notice_isread_sourceType ON ${this.getTableName()} (isread,sourceType)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSql1 = `CREATE INDEX notice_sendTag_isread ON ${this.getTableName()} (sendTag,isread)`;
        this.m_db.run(indexSql1, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSql2 = `CREATE INDEX notice_status ON ${this.getTableName()} (status)`;
        this.m_db.run(indexSql2, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSql3 = `CREATE INDEX notice_id ON ${this.getTableName()} (id)`;
        this.m_db.run(indexSql3, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) {
        if (oldVersion <= 3) {
            const indexSql = `CREATE INDEX notice_isread_sourceType ON ${this.getTableName()} (isread,sourceType)`;
            this.m_db.run(indexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
            const indexSql1 = `CREATE INDEX notice_sendTag_isread ON ${this.getTableName()} (sendTag,isread)`;
            this.m_db.run(indexSql1, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
            const indexSql2 = `CREATE INDEX notice_status ON ${this.getTableName()} (status)`;
            this.m_db.run(indexSql2, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 4) {
            const indexSql3 = `CREATE INDEX notice_id ON ${this.getTableName()} (id)`;
            this.m_db.run(indexSql3, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 5) {
            setUserStore('noticeStoreKey', {});
        }
        if (oldVersion == 6) {
            setUserStore('noticeStoreKey', {});
        }
        if (oldVersion == 7) {
            setUserStore('noticeStoreKey', {});
        }
        if (oldVersion <= 8) {
            const indexfoldId = `CREATE INDEX notice_folderId_foldId ON ${this.getTableName()} (folderId,foldId)`;
            this.m_db.run(indexfoldId, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 9) {
            const indexfoldIdTag = `CREATE INDEX notice_folderId_sessionTag ON ${this.getTableName()} (folderId,sessionTag)`;
            this.m_db.run(indexfoldIdTag, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 10) {
            setUserStore('noticeStoreKey', { isDeleteTable: true });
        }
        if (oldVersion <= 11) {
            setUserStore('noticeStoreKey', { isDeleteTable: true });
        }
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
    }
}
exports.default = T_Notice;
module.exports = T_Notice;
//# sourceMappingURL=T_Notice.js.map