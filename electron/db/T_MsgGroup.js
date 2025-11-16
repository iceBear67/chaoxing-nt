"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("./T_BaseTable");
class T_MsgGroup extends T_BaseTable_1.BaseTable {
    getTableName() {
        return "T_Group";
    }
    getColumns() {
        return [
            { name: "id", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "name", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "affiliations", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "affiliations_count", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "allowinvites", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "created", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "custom", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "description", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "disabled", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "maxusers", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "membersonly", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "mute", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "muteRole", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "muteTimeStamp", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "owner", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "public", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "shieldgroup", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isPullAnnounce", type: T_BaseTable_1.ColumnType.INTEGER },
        ];
    }
    getTableVersion() {
        return 4;
    }
    onTableCreate() {
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) {
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
    }
}
exports.default = T_MsgGroup;
module.exports = T_MsgGroup;
//# sourceMappingURL=T_MsgGroup.js.map