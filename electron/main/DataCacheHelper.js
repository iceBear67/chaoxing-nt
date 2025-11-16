"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearOldCacheDataInDb = exports.getCacheData = exports.setCacheData = exports.initDb = void 0;
const electron_1 = require("electron");
const T_DataCache_1 = __importDefault(require("../db/T_DataCache"));
const DbHelper_1 = require("../utils/DbHelper");
const UserHelper_1 = require("./UserHelper");
let m_Db;
let m_DataCaches = new Map();
let m_DataCacheMap = new Map();
const MAX_CACHE_COUNT = 500;
const ONCE_DELETE_COUNT = 100;
async function initDb() {
    m_Db = await (0, DbHelper_1.getDb)("data_cache.db", true);
    m_DataCaches.clear();
    m_DataCacheMap.clear();
}
exports.initDb = initDb;
async function getDataCache(type) {
    let dataCache = m_DataCaches.get(type);
    if (dataCache) {
        return dataCache;
    }
    else {
        dataCache = new T_DataCache_1.default(type);
        m_DataCaches.set(type, dataCache);
        await dataCache.init(m_Db);
        return dataCache;
    }
}
function getCacheDataMap(type) {
    if (!m_Db) {
        initDb();
    }
    let dataMap = m_DataCacheMap.get(type);
    if (!dataMap) {
        dataMap = new Map();
        m_DataCacheMap.set(type, dataMap);
    }
    if (dataMap.size >= MAX_CACHE_COUNT) {
        const remainingEntries = Array.from(dataMap.entries()).slice(ONCE_DELETE_COUNT);
        dataMap = new Map(remainingEntries);
        m_DataCacheMap.set(type, dataMap);
    }
    return dataMap;
}
async function setCacheData(parms) {
    let dataMap = getCacheDataMap(parms.type);
    dataMap.delete(parms.key);
    dataMap.set(parms.key, parms.value);
    let dataCache = await getDataCache(parms.type);
    dataCache.deleteData(`key=?`, [parms.key]);
    let data = {
        key: parms.key,
        data: parms.value,
        cacheTime: new Date().getTime(),
    };
    dataCache.insertData(data);
}
exports.setCacheData = setCacheData;
async function getCacheData(parms) {
    let dataMap = getCacheDataMap(parms.type);
    let data1 = dataMap.get(parms.key);
    if (data1) {
        return data1;
    }
    let dataCache = await getDataCache(parms.type);
    let data = await dataCache.queryFirst(`key=?`, [parms.key]);
    if (data) {
        dataMap.set(parms.key, data.data);
        return data.data;
    }
}
exports.getCacheData = getCacheData;
electron_1.ipcMain.on("_cacheDataToDb", (event, parms) => {
    setCacheData(parms);
});
electron_1.ipcMain.handle("_getCacheDataFromDb", (event, parms) => {
    return getCacheData(parms);
});
async function clearOldCacheDataInDb(days) {
    if (!m_Db) {
        await initDb();
    }
    m_Db.serialize(() => {
        let sql = `SELECT name FROM sqlite_master WHERE type='table'`;
        m_Db.all(sql, (err, rows) => {
            if (err) {
                console.warn("sql error:", sql, err);
                return;
            }
            for (let row of rows) {
                if (row.name != "__TABLE_INFO") {
                    clearTableOldData(row.name, days);
                }
            }
        });
    });
}
exports.clearOldCacheDataInDb = clearOldCacheDataInDb;
function clearTableOldData(tableName, days) {
    let clearBeforeTime = new Date().getTime() - days * 24 * 60 * 60 * 1000;
    m_Db.serialize(() => {
        let sql = `delete from ${tableName} where cacheTime<?`;
        m_Db.run(sql, [clearBeforeTime], (err) => {
            if (err) {
                console.warn("sql error:", sql, err);
            }
        });
    });
}
(0, UserHelper_1.onUserLogin)(() => {
    initDb();
});
(0, UserHelper_1.onUserLogout)(() => {
    initDb();
});
module.exports = { setCacheData, getCacheData, clearOldCacheDataInDb };
exports.default = module.exports;
//# sourceMappingURL=DataCacheHelper.js.map