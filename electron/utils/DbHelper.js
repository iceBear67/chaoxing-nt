"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbFilePath = exports.resetPassword = exports.getDb = exports.clearDbMap = void 0;
const sqlcipher_1 = __importDefault(require("@journeyapps/sqlcipher"));
const electron_1 = require("electron");
const UserHelper_1 = require("../main/UserHelper");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const StoreHelper_1 = __importDefault(require("../main/StoreHelper"));
const { getDbKey } = require("../../module/compile/lib/CompileUtil");
let sqlite3 = sqlcipher_1.default.verbose();
let m_DbMap = new Map();
function clearDbMap() {
    m_DbMap.clear();
}
exports.clearDbMap = clearDbMap;
async function getDb(dbname, useDev) {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(1);
        }, 1);
    });
    let _db = m_DbMap.get(dbname);
    if (_db) {
        return Promise.resolve().then(() => {
            return _db;
        });
    }
    else {
        let pms;
        if (electron_1.ipcRenderer) {
            pms = Promise.all([
                electron_1.ipcRenderer.invoke("_getDataFilePath"),
                electron_1.ipcRenderer.invoke("_getUID"),
                electron_1.ipcRenderer.invoke("_isAppPackaged"),
            ]);
        }
        else {
            let userDataPath;
            let cfg = StoreHelper_1.default.getSystem().get("appSystemConfig");
            if (cfg && cfg.dataFilePath) {
                userDataPath = cfg.dataFilePath;
            }
            else {
                userDataPath = electron_1.app.getPath("userData");
            }
            pms = Promise.resolve().then(() => {
                return [userDataPath, (0, UserHelper_1.getUID)(), electron_1.app.isPackaged];
            });
        }
        return pms.then((values) => {
            _db = m_DbMap.get(dbname);
            if (_db) {
                return _db;
            }
            let userPath = values[0];
            let uid = values[1];
            let _isPackaged = values[2];
            if (!uid) {
                uid = "guest";
            }
            let dbFilePath = path_1.default.join(userPath, "cxdatabases", uid);
            if (!fs_1.default.existsSync(dbFilePath)) {
                dbFilePath = path_1.default.join(userPath, "databases", uid);
            }
            if (!fs_1.default.existsSync(dbFilePath)) {
                fs_1.default.mkdirSync(dbFilePath, { recursive: true });
            }
            let usePwd = true;
            if (useDev && !_isPackaged) {
                let extname = path_1.default.extname(dbname);
                let basename = path_1.default.basename(dbname, extname);
                dbname = `${basename}__dev${extname}`;
                usePwd = false;
            }
            let db = new sqlite3.Database(path_1.default.join(dbFilePath, dbname));
            if (usePwd) {
                db.run(`PRAGMA key = '${getDbKey(uid + "" + dbname)}'`);
            }
            db.serialize(() => {
                let sql = `CREATE TABLE IF NOT EXISTS __TABLE_INFO(name TEXT,version INTEGER,createTime INTEGER,updateTime INTEGER)`;
                db.run(sql);
            });
            m_DbMap.set(dbname, db);
            return db;
        });
    }
}
exports.getDb = getDb;
async function resetPassword(dbpath, oldUid, newUid) {
    let dbname = path_1.default.basename(dbpath);
    let oldPwd = getDbKey(oldUid + "" + dbname);
    if (!newUid) {
        newUid = (0, UserHelper_1.getUID)();
    }
    let newPwd = getDbKey(newUid + "" + dbname);
    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database(dbpath);
        db.run(`PRAGMA key = '${oldPwd}'`, function (err1) {
            if (err1) {
                console.error("打开数据库出错:", err1);
                return;
            }
            const tables = db.all('SELECT name FROM sqlite_master WHERE type="table";', (err2, rows) => {
                if (err2) {
                    db.close(function (err) {
                        if (err) {
                            console.error("关闭数据库连接出错:", err);
                            reject(err);
                            return;
                        }
                        resolve(false);
                    });
                    return;
                }
                console.log("数据库中的表:", rows);
                db.serialize(() => {
                    db.run(`PRAGMA rekey = "${newPwd}"`, function (err) {
                        if (err) {
                            console.error("修改密码出错:", err);
                            reject(err);
                            return;
                        }
                        console.log("数据库密码修改成功");
                        db.close(function (err) {
                            if (err) {
                                console.error("关闭数据库连接出错:", err);
                                reject(err);
                                return;
                            }
                            resolve(true);
                        });
                    });
                });
            });
        });
    });
}
exports.resetPassword = resetPassword;
async function getDbFilePath(dbname, useDev, dbUid) {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(1);
        }, 1);
    });
    let pms;
    if (electron_1.ipcRenderer) {
        pms = Promise.all([
            electron_1.ipcRenderer.invoke("_getDataFilePath"),
            electron_1.ipcRenderer.invoke("_getUID"),
            electron_1.ipcRenderer.invoke("_isAppPackaged"),
        ]);
    }
    else {
        let userDataPath;
        let cfg = StoreHelper_1.default.getSystem().get("appSystemConfig");
        if (cfg && cfg.dataFilePath) {
            userDataPath = cfg.dataFilePath;
        }
        else {
            userDataPath = electron_1.app.getPath("userData");
        }
        pms = Promise.resolve().then(() => {
            return [userDataPath, (0, UserHelper_1.getUID)(), electron_1.app.isPackaged];
        });
    }
    return pms.then((values) => {
        let userPath = values[0];
        let uid = values[1];
        let _isPackaged = values[2];
        if (!uid) {
            uid = "guest";
        }
        if (dbUid) {
            uid = dbUid;
        }
        let dbFilePath = path_1.default.join(userPath, "cxdatabases", uid);
        if (!fs_1.default.existsSync(dbFilePath)) {
            dbFilePath = path_1.default.join(userPath, "databases", uid);
        }
        if (!fs_1.default.existsSync(dbFilePath)) {
            fs_1.default.mkdirSync(dbFilePath, { recursive: true });
        }
        if (useDev && !_isPackaged) {
            let extname = path_1.default.extname(dbname);
            let basename = path_1.default.basename(dbname, extname);
            dbname = `${basename}__dev${extname}`;
        }
        return path_1.default.join(dbFilePath, dbname);
    });
}
exports.getDbFilePath = getDbFilePath;
//# sourceMappingURL=DbHelper.js.map