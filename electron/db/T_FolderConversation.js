"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("./T_BaseTable");
class T_FolderConversation extends T_BaseTable_1.BaseTable {
    constructor() {
        super();
    }
    getTableName() {
        return `T_FolderConversation`;
    }
    getColumns() {
        return [
            { name: "folderId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "id", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "insertTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "msgId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "status", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "type", type: T_BaseTable_1.ColumnType.INTEGER },
        ];
    }
    getTableVersion() {
        return 1;
    }
    onTableCreate() {
        const indexSql = `CREATE INDEX folderConversations_msgId ON ${this.getTableName()} (msgId)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSql1 = `CREATE INDEX folderConversations_folderId ON ${this.getTableName()} (folderId)`;
        this.m_db.run(indexSql1, [], function (err) {
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
exports.default = T_FolderConversation;
module.exports = T_FolderConversation;
//# sourceMappingURL=T_FolderConversation.js.map