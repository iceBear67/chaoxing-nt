"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("../T_BaseTable");
class T_NoticeFolder extends T_BaseTable_1.BaseTable {
    constructor() {
        super();
    }
    getTableName() {
        return `T_NoticeFolder`;
    }
    getColumns() {
        return [
            { name: "createrPuid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "folderName", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "id", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "insertTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "noticeCount", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "order", columnName: 'db_order', type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "pid", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "sendFolder", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "status", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "top", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "updateDate", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "updateTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "uuid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "xpath", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "noticeFilters", type: T_BaseTable_1.ColumnType.TEXT },
        ];
    }
    getTableVersion() {
        return 6;
    }
    convertToDbData(jsData) {
        let data = Object.assign({}, jsData);
        if (jsData.noticeFilters && typeof (jsData.noticeFilters) == "object") {
            data.noticeFilters = JSON.stringify(jsData.noticeFilters);
        }
        return data;
    }
    convertFromDbData(dbData) {
        let data = Object.assign({}, dbData);
        if (dbData.noticeFilters) {
            try {
                data.noticeFilters = JSON.parse(dbData.noticeFilters);
            }
            catch (error) {
                console.log('convertFromDbData-noticeFilters', error);
            }
        }
        return data;
    }
    onTableCreate() {
        const indexSql = `CREATE INDEX noticeFolder_id ON ${this.getTableName()} (id)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSqluuid = `CREATE INDEX noticeFolder_uuid ON ${this.getTableName()} (uuid)`;
        this.m_db.run(indexSqluuid, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) {
        if (oldVersion <= 3) {
            const indexSql = `CREATE INDEX noticeFolder_id ON ${this.getTableName()} (id)`;
            this.m_db.run(indexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 5) {
            const indexSqluuid = `CREATE INDEX noticeFolder_uuid ON ${this.getTableName()} (uuid)`;
            this.m_db.run(indexSqluuid, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
    }
}
exports.default = T_NoticeFolder;
module.exports = T_NoticeFolder;
//# sourceMappingURL=T_NoticeFolder.js.map