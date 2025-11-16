"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("./T_BaseTable");
class T_MsgFolders extends T_BaseTable_1.BaseTable {
    constructor() {
        super();
    }
    getTableName() {
        return `T_MsgFolders`;
    }
    getColumns() {
        return [
            { name: "id", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "level", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "ignored", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "name", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "pid", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "puid", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "updateTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isTop", type: T_BaseTable_1.ColumnType.INTEGER },
        ];
    }
    getTableVersion() {
        return 1;
    }
    onTableCreate() {
        const indexSql = `CREATE INDEX msgFolders_id ON ${this.getTableName()} (id)`;
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
exports.default = T_MsgFolders;
module.exports = T_MsgFolders;
//# sourceMappingURL=T_MsgFolders.js.map