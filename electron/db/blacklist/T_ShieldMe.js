"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("../T_BaseTable");
class T_ShieldMe extends T_BaseTable_1.BaseTable {
    constructor() {
        super();
    }
    getTableName() {
        return `T_ShieldMe`;
    }
    getColumns() {
        return [
            { name: "deleted", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "fullPinyin", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "name", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "pic", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "simplepinyin", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "thePuid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "type", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "updateTime", type: T_BaseTable_1.ColumnType.INTEGER },
        ];
    }
    getTableVersion() {
        return 1;
    }
    onTableCreate() {
        const indexSql = `CREATE INDEX shieldme_puid ON ${this.getTableName()} (thePuid)`;
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
exports.default = T_ShieldMe;
module.exports = T_ShieldMe;
//# sourceMappingURL=T_ShieldMe.js.map