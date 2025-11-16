"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("./T_BaseTable");
class T_DeletedGroupMember extends T_BaseTable_1.BaseTable {
    getTableName() {
        return "T_DeletedGroupMember";
    }
    getColumns() {
        return [
            { name: "groupid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "name", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "pic", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "puid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "uid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "role", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "desc", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "deptDesc", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "fullpinyin", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "simplepinyin", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "createTime", type: T_BaseTable_1.ColumnType.INTEGER }
        ];
    }
    getTableVersion() {
        return 1;
    }
    onTableCreate() {
        const index1Sql = `CREATE INDEX deletedGroupMember_groupid_uid ON ${this.getTableName()} (groupid,uid)`;
        this.m_db.run(index1Sql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSql = `CREATE INDEX deletedGroupMember_groupid ON ${this.getTableName()} (groupid)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSql2 = `CREATE INDEX deletedGroupMember_uid ON ${this.getTableName()} (uid)`;
        this.m_db.run(indexSql2, [], function (err) {
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
exports.default = T_DeletedGroupMember;
module.exports = T_DeletedGroupMember;
//# sourceMappingURL=T_DeletedGroupMember.js.map