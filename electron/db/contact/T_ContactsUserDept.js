"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("../T_BaseTable");
class T_ContactsUserDept extends T_BaseTable_1.BaseTable {
    constructor() {
        super();
    }
    getTableName() {
        return `T_ContactsUserDept`;
    }
    getColumns() {
        return [
            { name: "fid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "deptid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "id", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "insertTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isManager", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "ppath", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "puid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "uid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "rights", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "rootDeptid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "updateTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "category", type: T_BaseTable_1.ColumnType.TEXT },
        ];
    }
    getTableVersion() {
        return 5;
    }
    onTableCreate() {
        const indexSql = `CREATE INDEX userdept_fid ON ${this.getTableName()} (fid)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const idIndexSql = `CREATE INDEX userdept_deptid ON ${this.getTableName()} (deptid)`;
        this.m_db.run(idIndexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        console.log("onTableCreate:", this.getTableName());
        const indexSql1 = `CREATE INDEX userdept_deptid_fid ON ${this.getTableName()} (deptid,fid)`;
        this.m_db.run(indexSql1, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
    }
    onTableUpdate(oldVersion) {
        if (oldVersion <= 2) {
            const indexSql = `CREATE INDEX userdept_fid ON ${this.getTableName()} (fid)`;
            this.m_db.run(indexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
            const idIndexSql = `CREATE INDEX userdept_deptid ON ${this.getTableName()} (deptid)`;
            this.m_db.run(idIndexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 4) {
            const indexSql1 = `CREATE INDEX userdept_deptid_fid ON ${this.getTableName()} (deptid,fid)`;
            this.m_db.run(indexSql1, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
    }
}
exports.default = T_ContactsUserDept;
module.exports = T_ContactsUserDept;
//# sourceMappingURL=T_ContactsUserDept.js.map