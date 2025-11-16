"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageImageCachePath = exports.checkMsgImgMigration = void 0;
const sqlcipher_1 = __importDefault(require("@journeyapps/sqlcipher"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const { getDbKey } = require("../../module/compile/lib/CompileUtil");
const MainHelper_1 = require("./MainHelper");
const electron_1 = require("electron");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const PathUtil_1 = require("./PathUtil");
const AppSystemConfigMainHelper_1 = require("./AppSystemConfigMainHelper");
const sqlite3 = sqlcipher_1.default.verbose();
const MAX_RECORD_COUNT = 200;
async function checkMsgImgMigration() {
    let isMsgImgMigrationFinish = (0, MainHelper_1.getSysStore)("isMsgImgMigrationFinish");
    if (isMsgImgMigrationFinish) {
        return;
    }
    let dataPath = electron_1.app.getPath("userData");
    let imgFilePath = path_1.default.join(dataPath, "files/images");
    if (!fs_1.default.existsSync(imgFilePath)) {
        return;
    }
    let allFileList = fs_1.default.readdirSync(imgFilePath);
    if (allFileList.length == 0) {
        return;
    }
    let userDataPath = getUserDataPath();
    let allMsgDatabases = getMsgDatabases(userDataPath);
    if (!allMsgDatabases || allMsgDatabases.length == 0) {
        return;
    }
    for (let msgDataBase of allMsgDatabases) {
        if (!(await msgImgMigration(msgDataBase.dbPath, msgDataBase.folderName, userDataPath))) {
            console.warn("消息图片迁移错误");
            return;
        }
    }
    console.log("消息图片迁移完成");
    (0, MainHelper_1.setSysStore)("isMsgImgMigrationFinish", true);
}
exports.checkMsgImgMigration = checkMsgImgMigration;
async function msgImgMigration(dbPath, folderName, userDataPath) {
    let db = new sqlite3.Database(dbPath);
    let basename = path_1.default.basename(dbPath);
    if (!basename.includes("__dev")) {
        db.run(`PRAGMA key = '${getDbKey(folderName + "" + basename)}'`);
    }
    return new Promise((resovle, reject) => {
        db.serialize(() => {
            resovle(queryImgMsg(db, 0, folderName, userDataPath));
        });
    });
}
async function queryImgMsg(db, lastTime, folderName, userDataPath) {
    let params = [];
    let sql = `select time,msgbody from  T_Message where msgtype=?`;
    params.push("img");
    if (lastTime > 0) {
        sql += `and time<?`;
        params.push(lastTime);
    }
    sql += ` order by time desc limit ${MAX_RECORD_COUNT}`;
    return new Promise((resovle, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.warn("queryImgMsg error:", err);
                resovle(false);
                return;
            }
            let pms2 = Promise.resolve().then(async () => {
                for (let i = 0; i < rows.length; i++) {
                    let row = rows[i];
                    let ret = await handleImgMsg(row.msgbody, folderName, userDataPath);
                    if (!ret) {
                        return false;
                    }
                }
                if (rows.length < MAX_RECORD_COUNT) {
                    return true;
                }
                return queryImgMsg(db, rows[rows.length - 1].time, folderName, userDataPath);
            });
            resovle(pms2);
        });
    });
}
async function handleImgMsg(msgBody, folderName, userDataPath) {
    if (!msgBody) {
        return true;
    }
    try {
        let msgBodyData = JSON.parse(msgBody);
        if (!msgBodyData.url) {
            return true;
        }
        return new Promise((resovle, reject) => {
            let toPath = getMessageImageCachePath(msgBodyData.url, folderName, userDataPath);
            if (fs_1.default.existsSync(toPath)) {
                resovle(true);
                return;
            }
            let fromPath = (0, PathUtil_1.getImageCachePath)(msgBodyData.url);
            if (!fs_1.default.existsSync(fromPath)) {
                resovle(true);
                return;
            }
            fs_1.default.copyFile(fromPath, toPath, (err) => {
                if (err) {
                    console.warn("copy ImageFile error:", err);
                    resovle(false);
                }
                else {
                    resovle(true);
                }
            });
        });
    }
    catch (e) {
        console.warn("handleImgMsg error:", e);
        return true;
    }
}
function getMessageImageCachePath(url, folderName, userDataPath) {
    let extname = path_1.default.extname(url);
    let localFileName = (0, CryptoUtil_1.md5)(url);
    if (extname && extname.length < 6 && !extname.includes("?")) {
        localFileName += `${extname}`;
    }
    else {
        localFileName += `.png`;
    }
    let imageCacheDir = path_1.default.join(userDataPath, `files/message_images/${folderName}`);
    if (!fs_1.default.existsSync(imageCacheDir)) {
        fs_1.default.mkdirSync(imageCacheDir, { recursive: true });
    }
    return path_1.default.join(imageCacheDir, localFileName);
}
exports.getMessageImageCachePath = getMessageImageCachePath;
function getUserDataPath() {
    let userDataPath;
    if (process.platform == "win32") {
        let cfg = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
        if (cfg && cfg.dataFilePath) {
            userDataPath = cfg.dataFilePath;
        }
        else {
            userDataPath = electron_1.app.getPath("userData");
        }
    }
    else {
        userDataPath = electron_1.app.getPath("userData");
    }
    return userDataPath;
}
function getMsgDatabases(userDataPath) {
    let databaseRootPath = path_1.default.join(userDataPath, "databases");
    let allMsgDb = [];
    if (!fs_1.default.existsSync(databaseRootPath)) {
        return [];
    }
    let allFolders = fs_1.default.readdirSync(databaseRootPath, { withFileTypes: true });
    allFolders.forEach((dbFolder) => {
        if (dbFolder.isDirectory()) {
            let dbFolderPath = path_1.default.join(databaseRootPath, dbFolder.name);
            let allFiles = fs_1.default.readdirSync(dbFolderPath);
            allFiles.forEach((dbFile) => {
                if (dbFile == "chat_message.db" || dbFile == "chat_message__dev.db") {
                    let dbFilePath = path_1.default.join(dbFolderPath, dbFile);
                    allMsgDb.push({ dbPath: dbFilePath, folderName: dbFolder.name });
                }
            });
        }
    });
    return allMsgDb;
}
module.exports = { checkMsgImgMigration };
//# sourceMappingURL=MsgImgMigrationHelper.js.map