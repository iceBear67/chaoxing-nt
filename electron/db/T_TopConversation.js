"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("./T_BaseTable");
class T_TopConversation extends T_BaseTable_1.BaseTable {
    getTableName() {
        return "T_TopConversation";
    }
    getColumns() {
        return [
            { name: "sessionId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "type", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "operateType", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "time", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "sort", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isSync", type: T_BaseTable_1.ColumnType.INTEGER },
        ];
    }
    getTableVersion() {
        return 1;
    }
    onTableCreate() {
        const indexSql = `CREATE INDEX top_sessionId ON ${this.getTableName()} (sessionId)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const idIndexSql = `CREATE INDEX ack_sessionType ON ${this.getTableName()} (operateType)`;
        this.m_db.run(idIndexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) { }
}
exports.default = T_TopConversation;
module.exports = T_TopConversation;
//# sourceMappingURL=T_TopConversation.js.map