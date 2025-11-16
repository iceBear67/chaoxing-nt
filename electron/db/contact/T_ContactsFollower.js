"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("../T_BaseTable");
class T_ContactsFollower extends T_BaseTable_1.BaseTable {
    constructor() {
        super();
    }
    getTableName() {
        return `T_ContactsFollower`;
    }
    getColumns() {
        return [
            { name: "eachother", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "fid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "fullpinyin", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "insertTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "name", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "pic", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "puid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "rights", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "schoolname", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "sex", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "simplepinyin", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "status", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "topsign", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "uid", type: T_BaseTable_1.ColumnType.TEXT },
        ];
    }
    getTableVersion() {
        return 3;
    }
    onTableCreate() {
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) {
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
    }
}
exports.default = T_ContactsFollower;
module.exports = T_ContactsFollower;
//# sourceMappingURL=T_ContactsFollower.js.map