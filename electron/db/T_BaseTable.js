"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTable = exports.Column = exports.ColumnType = void 0;
const events_1 = __importDefault(require("events"));
var ColumnType;
(function (ColumnType) {
    ColumnType["TEXT"] = "TEXT";
    ColumnType["INTEGER"] = "INTEGER";
    ColumnType["REAL"] = "REAL";
    ColumnType["BLOB"] = "BLOB";
    ColumnType["DATE"] = "DATE";
})(ColumnType || (exports.ColumnType = ColumnType = {}));
class Column {
}
exports.Column = Column;
class BaseTable extends events_1.default {
    constructor() {
        super();
    }
    onTableCreate() { }
    onTableUpdate(oldVersion) { }
    init(db) {
        this.m_db = db;
        let pms = new Promise((resolve, reject) => {
            this.m_db.serialize(() => {
                this.m_db.all(`PRAGMA table_info(${this.getTableName()})`, (err, rows) => {
                    if (rows && rows.length > 0) {
                        resolve(this.checkColumns(rows));
                    }
                    else {
                        if (err) {
                            console.error(`检测表失败,表名：${this.getTableName()}`, err);
                            resolve(false);
                        }
                        else {
                            let sql = `CREATE TABLE IF NOT EXISTS ${this.getTableName()}(`;
                            let columns = this.getColumns();
                            for (let i = 0; i < columns.length; i++) {
                                let column = columns[i];
                                sql += this.getColumnName(column) + " " + column.type;
                                if (column.key) {
                                    sql += " PRIMARY KEY AUTOINCREMENT";
                                }
                                if (i < columns.length - 1) {
                                    sql += ",";
                                }
                            }
                            sql += `)`;
                            this.m_db.run(sql);
                            resolve(this.updateTableInfo(false));
                        }
                    }
                });
            });
        });
        return pms;
    }
    updateTableInfo(isUpdateTable = true) {
        return new Promise((resovle, reject) => {
            this.m_db.serialize(() => {
                let sql1 = `select version from __TABLE_INFO  where name = '${this.getTableName()}'`;
                this.m_db.all(sql1, (err, rows) => {
                    let version = 0;
                    let curTime = new Date().getTime();
                    if (rows && rows.length > 0) {
                        version = rows[0].version;
                        let sql2 = `UPDATE  __TABLE_INFO SET version=?,updateTime=? where name = '${this.getTableName()}'`;
                        let stmt = this.m_db.prepare(sql2);
                        stmt.run([this.getTableVersion(), curTime], () => {
                            let tableOperRet;
                            if (isUpdateTable) {
                                tableOperRet = this.onTableUpdate(version);
                            }
                            else {
                                tableOperRet = this.onTableCreate();
                            }
                            Promise.resolve(tableOperRet).then(() => {
                                resovle(true);
                            });
                        });
                        return;
                    }
                    else {
                        let sql2 = `INSERT INTO  __TABLE_INFO(name,version,createTime,updateTime) VALUES(?,?,?,?)`;
                        let stmt = this.m_db.prepare(sql2);
                        stmt.run([this.getTableName(), this.getTableVersion(), curTime, curTime], () => {
                            if (isUpdateTable) {
                                this.onTableUpdate(version);
                            }
                            else {
                                this.onTableCreate();
                            }
                            resovle(true);
                        });
                    }
                });
            });
        });
    }
    getColumnName(column) {
        if (!column.columnName) {
            column.columnName = column.name;
        }
        return column.columnName;
    }
    async checkColumns(rows) {
        return new Promise((resovle, reject) => {
            this.m_db.serialize(() => {
                let sql1 = `select version from __TABLE_INFO  where name = '${this.getTableName()}'`;
                this.m_db.all(sql1, (err, rows2) => {
                    let version = 0;
                    if (rows2 && rows2.length > 0) {
                        version = rows2[0].version;
                    }
                    if (version < this.getTableVersion()) {
                        let columns = this.getColumns().concat();
                        for (let i = 0; i < rows.length; i++) {
                            let row = rows[i];
                            for (let j = columns.length - 1; j >= 0; j--) {
                                let column = columns[j];
                                if (row.name == this.getColumnName(column)) {
                                    columns.splice(j, 1);
                                    break;
                                }
                            }
                        }
                        if (columns.length > 0) {
                            columns.forEach((column) => {
                                let sql = `ALTER TABLE ${this.getTableName()} ADD COLUMN ${this.getColumnName(column)} ${column.type}`;
                                if (column.key) {
                                    sql += " PRIMARY KEY";
                                }
                                this.m_db.run(sql);
                            });
                        }
                        resovle(this.updateTableInfo());
                        return;
                    }
                    else {
                        resovle(true);
                    }
                });
            });
        });
    }
    getColumnByName(name) {
        let columns = this.getColumns();
        for (let i = 0; i < columns.length; i++) {
            if (columns[i].name == name) {
                return this.getColumnName(columns[i]);
            }
        }
    }
    async insertData(data, options) {
        if (!data) {
            return;
        }
        const { insertMethod = "INSERT" } = options ?? {};
        data = this.convertToDbData(data);
        let columns = this.getColumns();
        let args = [];
        let sql = `${insertMethod} INTO ${this.getTableName()} (`;
        let firstFlag = true;
        for (let i = 0; i < columns.length; i++) {
            let column = columns[i];
            if (column.key)
                continue;
            if (data[column.name] != undefined) {
                if (!firstFlag) {
                    sql += ",";
                }
                else {
                    firstFlag = false;
                }
                sql += this.getColumnName(column);
                args.push(data[column.name]);
            }
        }
        sql += `) VALUES(`;
        for (let i = 0; i < args.length; i++) {
            sql += "?";
            if (i < args.length - 1) {
                sql += ",";
            }
        }
        sql += `)`;
        let pms = new Promise((resolve) => {
            this.m_db.serialize(() => {
                let stmt = this.m_db.prepare(sql);
                stmt.run(args, function (err) {
                    if (err) {
                        resolve({ success: false, error: err });
                        console.error(`insert data error:sql:${sql},err:`, err);
                    }
                    else {
                        resolve({ success: true, lastID: this.lastID });
                    }
                });
            });
        });
        return pms;
    }
    async insertDatas(datas, options) {
        if (!datas || datas.length == 0) {
            return;
        }
        const { insertMethod = "INSERT" } = options ?? {};
        let columns = this.getColumns();
        let argsKey = [];
        let sql = `${insertMethod} INTO ${this.getTableName()} (`;
        for (let i = 0; i < columns.length; i++) {
            let column = columns[i];
            if (column.key)
                continue;
            sql += this.getColumnName(column);
            if (i < columns.length - 1) {
                sql += ",";
            }
            argsKey.push(column.name);
        }
        sql += `) VALUES(`;
        for (let i = 0; i < argsKey.length; i++) {
            sql += "?";
            if (i < argsKey.length - 1) {
                sql += ",";
            }
        }
        sql += `)`;
        return new Promise((resove, reject) => {
            this.m_db.serialize(() => {
                this.m_db.run("BEGIN TRANSACTION;");
                try {
                    let stmt = this.m_db.prepare(sql);
                    for (let data of datas) {
                        if (!data) {
                            continue;
                        }
                        data = this.convertToDbData(data);
                        let args = [];
                        for (const arg of argsKey) {
                            args.push(data[arg]);
                        }
                        stmt.run(args);
                    }
                    this.m_db.run("COMMIT;", () => {
                        resove(true);
                    });
                }
                catch (e) {
                    console.error("insertDatas error:", e);
                    this.m_db.run("ROLLBACK;");
                    reject();
                }
            });
        });
    }
    async insertOrUpdate(data, byCloums = []) {
        if (!data || !byCloums || byCloums.length == 0) {
            return { success: false, error: new Error("data or byCloums is null") };
        }
        let where = "";
        let parms = [];
        for (let i = 0; i < byCloums.length; i++) {
            if (!byCloums[i] || !data[byCloums[i]]) {
                return { success: false, error: new Error("byCloums or data is null") };
            }
            if (i > 0) {
                where += " and ";
            }
            let columnName = this.getColumnByName(byCloums[i]);
            where += columnName + " = ?";
            byCloums.push(data[byCloums[i]]);
        }
        return new Promise((resolve, reject) => {
            this.m_db.serialize(() => {
                let sql = "select 1 from " + this.getTableName() + " where " + where;
                this.m_db.all(sql, parms, (err, rows) => {
                    if (err) {
                        resolve({ success: false, error: err });
                    }
                    if (rows && rows.length > 0) {
                        let res = this.updateData(data, where, parms);
                        resolve(res);
                    }
                    else {
                        let res = this.insertData(data);
                        resolve(res);
                    }
                });
            });
        });
    }
    updateColumnByCase(column, where) {
        if (!column) {
            return;
        }
        let sql = `UPDATE ${this.getTableName()} SET ${column} = ${where}`;
        let pms = new Promise((resolve, reject) => {
            this.m_db.serialize(() => {
                this.m_db.run(sql, (err) => {
                    if (err) {
                        resolve({ success: false, error: err });
                        console.error(`UPDATEColumn error:sql:${sql},err:`, err);
                    }
                    else {
                        resolve({ success: true });
                    }
                });
            });
        });
        return pms;
    }
    async updateData(data, where, parms) {
        if (!data) {
            return;
        }
        data = this.convertToDbData(data);
        let columns = this.getColumns();
        let args = [];
        let sql = `UPDATE ${this.getTableName()} SET `;
        let firstFlag = true;
        for (let i = 0; i < columns.length; i++) {
            let column = columns[i];
            if (data[column.name] != undefined) {
                if (!firstFlag) {
                    sql += ",";
                }
                else {
                    firstFlag = false;
                }
                sql += this.getColumnName(column) + "=?";
                args.push(data[column.name]);
            }
        }
        if (parms && parms.length > 0) {
            args = args.concat(parms);
        }
        if (where) {
            sql += " where " + where;
        }
        let pms = new Promise((resolve) => {
            this.m_db.serialize(() => {
                let stmt = this.m_db.prepare(sql);
                stmt.run(args, function (err) {
                    if (err) {
                        resolve({ success: false, error: err });
                        console.error(`update data error:sql:${sql},err:`, err);
                    }
                    else {
                        resolve({ success: true, changes: this.changes });
                    }
                });
            });
        });
        return pms;
    }
    deleteData(where, parms) {
        let sql = `DELETE FROM ${this.getTableName()}`;
        if (where) {
            sql += " where " + where;
        }
        let pms = new Promise((resolve) => {
            this.m_db.serialize(() => {
                this.m_db.run(sql, parms, function (err) {
                    if (err) {
                        resolve({ success: false, error: err });
                        console.error(`delete data error:sql:${sql},err:`, err);
                    }
                    else {
                        resolve({ success: true, changes: this.changes });
                    }
                });
            });
        });
        return pms;
    }
    queryAll(where, parms) {
        let sql = `SELECT * FROM ${this.getTableName()}`;
        if (where) {
            sql += " where " + where;
        }
        let columns = this.getColumns();
        console.debug(">>>>>>>>>>>>>>", sql);
        let pms = new Promise((resolve, reject) => {
            this.m_db.serialize(() => {
                this.m_db.all(sql, parms, (err, rows) => {
                    let result = [];
                    if (rows && rows.length > 0) {
                        for (const row of rows) {
                            let data = {};
                            for (const column of columns) {
                                let columnName = this.getColumnName(column);
                                if (row[columnName] != undefined) {
                                    data[column.name] = row[columnName];
                                }
                            }
                            data = this.convertFromDbData(data);
                            result.push(data);
                        }
                    }
                    resolve(result);
                });
            });
        });
        return pms;
    }
    queryFirst(where, parms) {
        let sql = `SELECT * FROM ${this.getTableName()}`;
        if (where) {
            sql += " where " + where;
        }
        let columns = this.getColumns();
        let pms = new Promise((resolve, reject) => {
            this.m_db.serialize(() => {
                this.m_db.all(sql, parms, (err, rows) => {
                    if (rows && rows.length > 0) {
                        const row = rows[0];
                        let data = {};
                        for (const column of columns) {
                            let columnName = this.getColumnName(column);
                            if (row[columnName] != undefined) {
                                data[column.name] = row[columnName];
                            }
                        }
                        data = this.convertFromDbData(data);
                        resolve(data);
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
        });
        return pms;
    }
    queryNum(where) {
        let sql = `SELECT COUNT(*) as total FROM ${this.getTableName()}`;
        if (where) {
            sql += " where " + where;
        }
        let pms = new Promise((resolve, reject) => {
            this.m_db.serialize(() => {
                this.m_db.all(sql, (err, rows) => {
                    if (rows && rows.length > 0) {
                        resolve(rows[0]);
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
        });
        return pms;
    }
    convertToDbData(jsData) {
        return jsData;
    }
    convertFromDbData(dbData) {
        return dbData;
    }
}
exports.BaseTable = BaseTable;
module.exports = { BaseTable, ColumnType, Column };
//# sourceMappingURL=T_BaseTable.js.map