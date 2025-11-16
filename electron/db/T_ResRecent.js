"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("./T_BaseTable");
class T_ResRecent extends T_BaseTable_1.BaseTable {
    getTableName() {
        return "T_Res_Recent";
    }
    getColumns() {
        return [
            { name: "cataid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "key", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "content", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "resType", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "cataName", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "updateTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "top_sign", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "order_number", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "record_count", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "showInHp", type: T_BaseTable_1.ColumnType.INTEGER }
        ];
    }
    getTableVersion() {
        return 1;
    }
    onTableCreate() {
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) {
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
    }
    convertToDbData(jsData) {
        let data = Object.assign({}, jsData);
        if (jsData.content) {
            data.resType = JSON.stringify(jsData.content.resType);
            if (typeof (jsData.content) != "string") {
                data.content = JSON.stringify(jsData.content);
            }
        }
        return data;
    }
    convertFromDbData(dbData) {
        let data = Object.assign({}, dbData);
        if (dbData.content) {
            data.content = JSON.parse(dbData.content);
        }
        return data;
    }
}
exports.default = T_ResRecent;
module.exports = T_ResRecent;
//# sourceMappingURL=T_ResRecent.js.map