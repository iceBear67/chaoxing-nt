"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.T_DwonloadInFolder = exports.T_DwonloadItem = void 0;
const T_BaseTable_1 = require("./T_BaseTable");
class T_DwonloadItem extends T_BaseTable_1.BaseTable {
    getTableName() {
        return "T_Download";
    }
    getColumns() {
        return [
            { name: "puid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "shareId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "shareUserId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "fid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "isSharePan", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "id", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "resId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "objectId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "title", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "thumbnail", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "startTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "finshTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "url", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "urlChain", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "type", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "state", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "localPath", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "totalSize", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "groupId", type: T_BaseTable_1.ColumnType.TEXT },
        ];
    }
    getTableVersion() {
        return 11;
    }
    onTableCreate() {
        console.log("onTableCreate:", this.getTableName());
        const indexSql = `CREATE INDEX idx_downloadId ON ${this.getTableName()} (id)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
    }
    onTableUpdate(oldVersion) {
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
        if (oldVersion < 10) {
            const indexSql = `CREATE INDEX idx_downloadId ON ${this.getTableName()} (id)`;
            this.m_db.run(indexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
    }
    convertToDbData(jsData) {
        let data = Object.assign({}, jsData);
        data.state = jsData.state;
        if (jsData.urlChain) {
            data.urlChain = JSON.stringify(jsData.urlChain);
        }
        else {
            data.urlChain = "";
        }
        if (jsData.state == 3 || jsData.state == 5 || jsData.state == 8) {
            data.state = 1;
        }
        data.isSharePan = jsData.isSharePan ? 1 : 0;
        return data;
    }
    convertFromDbData(dbData) {
        let data = Object.assign({}, dbData);
        if (dbData.urlChain) {
            data.urlChain = JSON.parse(dbData.urlChain);
        }
        delete data.state;
        data._state = dbData.state;
        data.isSharePan = dbData.isSharePan === 1;
        return data;
    }
}
exports.T_DwonloadItem = T_DwonloadItem;
class T_DwonloadInFolder extends T_BaseTable_1.BaseTable {
    getTableName() {
        return "T_DownloadInFolder";
    }
    getColumns() {
        return [
            { name: "id", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "objId", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "title", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "type", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "thumbnail", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "startTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "finshTime", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "folders", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "pid", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "localPath", type: T_BaseTable_1.ColumnType.TEXT },
            { name: "totalSize", type: T_BaseTable_1.ColumnType.INTEGER },
            { name: "shareUserId", type: T_BaseTable_1.ColumnType.TEXT },
        ];
    }
    getTableVersion() {
        return 5;
    }
    onTableCreate() {
        console.log("onTableCreate:", this.getTableName());
        const indexSql = `CREATE INDEX idx_downloadInFouldPid ON ${this.getTableName()} (pid)`;
        this.m_db.run(indexSql, [], function (err) {
            if (err) {
                return console.error(err.message);
            }
        });
    }
    onTableUpdate(oldVersion) {
        console.log(`onTableUpdate:${this.getTableName()} ;oldVersion:${oldVersion};newVersion:${this.getTableVersion()}`);
        if (oldVersion < 5) {
            const indexSql = `CREATE INDEX idx_downloadInFouldPid ON ${this.getTableName()} (pid)`;
            this.m_db.run(indexSql, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
            const indexSql2 = `CREATE INDEX idx_downloadInFouldId ON ${this.getTableName()} (id)`;
            this.m_db.run(indexSql2, [], function (err) {
                if (err) {
                    return console.error(err.message);
                }
            });
        }
    }
    convertToDbData(jsData) {
        let data = Object.assign({}, jsData);
        if (jsData.folders) {
            data.folders = JSON.stringify(jsData.folders);
        }
        else {
            data.folders = "";
        }
        data.localPath = jsData.getLocalPath("");
        return data;
    }
    convertFromDbData(dbData) {
        let data = Object.assign({}, dbData);
        if (dbData.folders) {
            data.folders = JSON.parse(dbData.folders);
        }
        if (dbData.urlChain) {
            data.urlChain = JSON.parse(dbData.urlChain);
        }
        data._localPath = dbData.localPath;
        if (typeof dbData.totalSize == "string") {
            data.totalSize = parseInt(dbData.totalSize);
        }
        return data;
    }
}
exports.T_DwonloadInFolder = T_DwonloadInFolder;
module.exports = { T_DwonloadItem, T_DwonloadInFolder };
//# sourceMappingURL=T_Download.js.map