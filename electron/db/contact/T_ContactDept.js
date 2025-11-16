"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("../T_BaseTable");
class T_ContactDept extends T_BaseTable_1.BaseTable {
    constructor() {
        super();
    }
    getTableName() {
        return `T_ContactDept`;
    }
    getColumns() {
        return [
            { name: "id", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "fid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "name", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "pid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "category", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "custom", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "fullname", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "fullpinyin", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "simplepinyin", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "subdeptcount", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "usercount", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "hideUser", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "isHidden", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "level", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "open", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "privilege", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "ppath", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "rootdept", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "serviceId", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "utime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "createtime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "deptConfig", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "creatorid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "weight", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "sort", type: T_BaseTable_1.ColumnType.INTEGER },
        ];
    }
    getTableVersion() {
        return 6;
    }
    onTableCreate() {
        const indexSql = `CREATE INDEX dept_id ON ${this.getTableName()} (id)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const idIndexSql = `CREATE INDEX dept_fid ON ${this.getTableName()} (fid)`;
        this.m_db.run(idIndexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) {
        if (oldVersion <= 3) {
            const indexSql = `CREATE INDEX dept_id ON ${this.getTableName()} (id)`;
            this.m_db.run(indexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
            const idIndexSql = `CREATE INDEX dept_fid ON ${this.getTableName()} (fid)`;
            this.m_db.run(idIndexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        if (oldVersion <= 5) {
            const updateSql = `UPDATE T_ContactDept SET sort = 0`;
            this.m_db.run(updateSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
    }
    convertToDbData(jsData) {
        let data = Object.assign({}, jsData);
        if (jsData.deptConfig && typeof (jsData.deptConfig) == "object") {
            data.deptConfig = JSON.stringify(jsData.deptConfig);
        }
        return data;
    }
    convertFromDbData(dbData) {
        let data = Object.assign({}, dbData);
        if (dbData.deptConfig) {
            try {
                data.deptConfig = JSON.parse(dbData.deptConfig);
            }
            catch (error) {
                console.log('convertFromDbData-deptConfig', error);
            }
        }
        return data;
    }
    countPeople(ppath) {
        return new Promise((resolve, reject) => {
            this.m_db.get(`SELECT COUNT(t1.uid) AS total_users
                FROM T_ContactsUserDept t1
                JOIN T_ContactDept t2 ON t1.deptid = t2.id
                WHERE (t2.ppath != '${ppath}' OR t2.hideUser = 0)
                AND t2.ppath GLOB '${ppath}*';
            `, (err, row) => {
                if (err) {
                    return reject(err);
                }
                else {
                    return resolve(row.total_users);
                }
            });
        });
    }
}
exports.default = T_ContactDept;
module.exports = T_ContactDept;
//# sourceMappingURL=T_ContactDept.js.map