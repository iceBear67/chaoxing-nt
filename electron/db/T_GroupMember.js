"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("./T_BaseTable");
class T_GroupMember extends T_BaseTable_1.BaseTable {
    getTableName() {
        return "T_GroupMember";
    }
    getColumns() {
        return [
            { name: "groupid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "name", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "pic", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "puid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "uid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "role", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "mute", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "muteRole", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "muteTimeStamp", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "owner", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "admin", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "desc", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "deptDesc", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "fullpinyin", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "simplepinyin", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "status", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "createTime", type: T_BaseTable_1.ColumnType.INTEGER }
        ];
    }
    getTableVersion() {
        return 9;
    }
    onTableCreate() {
        const index1Sql = `CREATE INDEX idx_groupid_uid ON ${this.getTableName()} (groupid,uid)`;
        this.m_db.run(index1Sql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSql = `CREATE INDEX idx_groupid ON ${this.getTableName()} (groupid)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const indexSql2 = `CREATE INDEX idx_uid ON ${this.getTableName()} (uid)`;
        this.m_db.run(indexSql2, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) {
        if (oldVersion <= 2) {
            const updateSql = `UPDATE T_GroupMember SET status = 1`;
            this.m_db.run(updateSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 5) {
            const updateSql = `UPDATE T_GroupMember SET createTime = 0`;
            this.m_db.run(updateSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 6) {
            const indexSql = `CREATE INDEX idx_groupid ON ${this.getTableName()} (groupid)`;
            this.m_db.run(indexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 7) {
            const index1Sql = `CREATE INDEX idx_groupid_uid ON ${this.getTableName()} (groupid,uid)`;
            this.m_db.run(index1Sql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 8) {
            const indexSql2 = `CREATE INDEX idx_uid ON ${this.getTableName()} (uid)`;
            this.m_db.run(indexSql2, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
    }
}
exports.default = T_GroupMember;
module.exports = T_GroupMember;
//# sourceMappingURL=T_GroupMember.js.map