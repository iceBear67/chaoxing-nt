"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("../T_BaseTable");
class T_ContactUnit extends T_BaseTable_1.BaseTable {
    constructor() {
        super();
    }
    getTableName() {
        return `T_ContactUnit`;
    }
    getColumns() {
        return [
            { name: "fid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "name", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "addressbookDataType", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "userTimeStamp", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "userDeptTimeStamp", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "userDeptTimeAuxValue", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "deptMcode", type: T_BaseTable_1.ColumnType.TEXT }
        ];
    }
    getTableVersion() {
        return 7;
    }
    onTableCreate() {
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) {
        if (oldVersion <= 6) {
            this.updateColumnByCase('userDeptTimeStamp', "''");
        }
        this.emit("onTableUpdate", oldVersion);
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
    }
}
exports.default = T_ContactUnit;
module.exports = T_ContactUnit;
//# sourceMappingURL=T_ContactUnit.js.map