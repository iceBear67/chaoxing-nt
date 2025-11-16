"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("./T_BaseTable");
class T_MsgContact extends T_BaseTable_1.BaseTable {
    constructor() {
        super();
    }
    getTableName() {
        return `T_MsgContact`;
    }
    getColumns() {
        return [
            { name: "fid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "name", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "sex", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "deptDesc", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "dept", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "pic", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "nick", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "uid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "puid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "rights", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "fullpinyin", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "simplepinyin", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "status", type: T_BaseTable_1.ColumnType.INTEGER },
        ];
    }
    getTableVersion() {
        return 2;
    }
    onTableCreate() {
        const indexSql = `CREATE INDEX msguser_uid ON ${this.getTableName()} (uid)`;
        this.m_db.run(indexSql, [], function (err) {
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
exports.default = T_MsgContact;
module.exports = T_MsgContact;
//# sourceMappingURL=T_MsgContact.js.map