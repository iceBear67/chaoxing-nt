"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const T_BaseTable_1 = require("./T_BaseTable");
class T_MessageAck extends T_BaseTable_1.BaseTable {
    getTableName() {
        return "T_MessageAck";
    }
    getColumns() {
        return [
            { name: "msgid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "time", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "acktype", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "origindata", type: T_BaseTable_1.ColumnType.TEXT },
        ];
    }
    getTableVersion() {
        return 1;
    }
    onTableCreate() {
        const indexSql = `CREATE INDEX ack_msgid ON ${this.getTableName()} (msgid)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const idIndexSql = `CREATE INDEX ack_time ON ${this.getTableName()} (time)`;
        this.m_db.run(idIndexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        const idIndexSql1 = `CREATE INDEX ack_msgid_acktype ON ${this.getTableName()} (msgid,acktype)`;
        this.m_db.run(idIndexSql1, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
        console.log("onTableCreate:", this.getTableName());
    }
    onTableUpdate(oldVersion) {
    }
    convertToDbData(jsData) {
        let data = Object.assign({}, jsData);
        if (typeof (data.origindata) == "object") {
            try {
                data.origindata = JSON.stringify(data.origindata);
            }
            catch (e) {
            }
        }
        return data;
    }
    convertFromDbData(dbData) {
        let data = Object.assign({}, dbData);
        if (typeof (data.origindata) == "string") {
            try {
                data.origindata = JSON.parse(data.origindata);
            }
            catch (e) {
            }
        }
        return data;
    }
}
exports.default = T_MessageAck;
module.exports = T_MessageAck;
//# sourceMappingURL=T_MessageAck.js.map