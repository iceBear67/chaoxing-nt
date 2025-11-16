"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("./T_BaseTable");
class T_DataCache extends T_BaseTable_1.BaseTable {
    constructor(type) {
        super();
        this.m_Type = type;
    }
    getTableName() {
        return `T_DataCache_${this.m_Type}`;
    }
    getColumns() {
        return [
            { name: "key", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "data", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "cacheTime", type: T_BaseTable_1.ColumnType.INTEGER }
        ];
    }
    getTableVersion() {
        return 2;
    }
    onTableCreate() {
        console.log("onTableCreate:", this.getTableName());
        const indexSql = `CREATE INDEX idx_dataCacheKey_${this.m_Type} ON ${this.getTableName()} (key)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
    }
    onTableUpdate(oldVersion) {
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
        if (oldVersion < 2) {
            const indexSql = `CREATE INDEX idx_dataCacheKey_${this.m_Type} ON ${this.getTableName()} (key)`;
            this.m_db.run(indexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
    }
    convertToDbData(jsData) {
        let data = Object.assign({}, jsData);
        if (typeof (data.data) == "object") {
            data.data = JSON.stringify(data.data);
        }
        return data;
    }
    convertFromDbData(dbData) {
        let data = Object.assign({}, dbData);
        if (typeof (data.data) == "string") {
            try {
                data.data = JSON.parse(data.data);
            }
            catch (e) {
            }
        }
        return data;
    }
}
exports.default = T_DataCache;
module.exports = T_DataCache;
//# sourceMappingURL=T_DataCache.js.map