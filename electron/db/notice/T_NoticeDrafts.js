"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("../T_BaseTable");
class T_NoticeDrafts extends T_BaseTable_1.BaseTable {
    constructor() {
        super();
    }
    getTableName() {
        return `T_NoticeDrafts`;
    }
    getColumns() {
        return [
            { name: "id", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "attachment", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "content", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "content_imgs", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "toreceiver", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "tocc", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "title", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "sourceType", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "updateTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "course_id", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "course_name", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "top", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "reply", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "noticeId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "rtf_content", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "isRtf", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "noticeDraftParamVo", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "logo", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "sendTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "operTypeStr", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "status", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "uuid", type: T_BaseTable_1.ColumnType.TEXT }
        ];
    }
    getTableVersion() {
        return 1;
    }
    convertFromDbData(dbData) {
        let data = Object.assign({}, dbData);
        if (dbData.attachment) {
            data.attachment = JSON.parse(dbData.attachment);
        }
        if (dbData.toreceiver) {
            data.toreceiver = JSON.parse(dbData.toreceiver);
        }
        if (dbData.tocc) {
            data.tocc = JSON.parse(dbData.tocc);
        }
        if (dbData.noticeDraftParamVo) {
            data.noticeDraftParamVo = JSON.parse(dbData.noticeDraftParamVo);
        }
        return data;
    }
    onTableCreate() {
        const indexSql = `CREATE INDEX noticedraft_sourceType ON ${this.getTableName()} (sourceType)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSql1 = `CREATE INDEX noticedraft_uuid ON ${this.getTableName()} (uuid)`;
        this.m_db.run(indexSql1, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSql2 = `CREATE INDEX  noticedraft_status ON ${this.getTableName()} (status)`;
        this.m_db.run(indexSql2, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSql3 = `CREATE INDEX noticedraft_id ON ${this.getTableName()} (id)`;
        this.m_db.run(indexSql3, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) {
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
    }
}
exports.default = T_NoticeDrafts;
module.exports = T_NoticeDrafts;
//# sourceMappingURL=T_NoticeDrafts.js.map