"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppMonitorLog = exports.getMainLog = void 0;
const electron_log_1 = __importDefault(require("electron-log"));
const DateUtil_1 = require("../utils/DateUtil");
const appConfig = require("../config/appconfig.json");
let store = require("./StoreHelper").getDefault();
const MAX_ERROR_TIMES_FOR_UPLOAD_LOG = 20;
electron_log_1.default.initialize({ preload: true });
let m_DebugLog = false;
class LoggerInfo {
    constructor(endName = "main") {
        this.m_prefix = "cxstudy";
        if (appConfig.appMode == "fyketang") {
            this.m_prefix = "ketang";
        }
        this.m_curLogStartTime = new Date();
        this.m_logDateTime = (0, DateUtil_1.dateFormat)("yyyyMMdd", this.m_curLogStartTime);
        this.m_endName = endName;
        this.logger = electron_log_1.default.create({ logId: `logger_${this.m_endName}` });
        this.logger.transports.file.level = "debug";
        this.logger.transports.console.level = false;
        this.logger.transports.file.fileName = `${this.m_logDateTime}/${this.m_prefix}_${this.m_endName}_${this.m_logDateTime}.log`;
        this.logger.transports.file.format =
            "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
        this.logger.transports.file.maxSize = 30 * 1024 * 1024;
        this.logger.info("\n\n\n\n\n===============================start log=================================\n");
    }
    checkLogTime() {
        let curTime = new Date();
        if (curTime.getFullYear() != this.m_curLogStartTime.getFullYear() ||
            curTime.getMonth() != this.m_curLogStartTime.getMonth() ||
            curTime.getDate() != this.m_curLogStartTime.getDate()) {
            this.m_curLogStartTime = curTime;
            this.m_logDateTime = (0, DateUtil_1.dateFormat)("yyyyMMdd", this.m_curLogStartTime);
            this.logger.transports.file.fileName = `${this.m_logDateTime}/${this.m_prefix}_${this.m_endName}_${this.m_logDateTime}.log`;
        }
    }
    warn(...data) {
        this.checkLogTime();
        this.logger.warn(...data);
    }
    info(...data) {
        this.checkLogTime();
        this.logger.info(...data);
    }
    log(...data) {
        this.checkLogTime();
        this.logger.info(...data);
    }
    verbose(...data) {
        this.checkLogTime();
        this.logger.verbose(...data);
    }
    debug(...data) {
        this.checkLogTime();
        this.logger.debug(...data);
    }
    silly(...data) {
        this.checkLogTime();
        this.logger.silly(...data);
    }
    error(...data) {
        this.checkLogTime();
        this.logger.error(...data);
    }
    replaceConsole(consoleArg) {
        let oldConsole = Object.assign({}, consoleArg);
        let _this = this;
        consoleArg.log = function (data, ...args) {
            oldConsole.log(data, ...args);
            _this.showLog("log", data, ...args);
        };
        consoleArg.info = function (data, ...args) {
            oldConsole.info(data, ...args);
            _this.showLog("info", data, args);
        };
        consoleArg.warn = function (data, ...args) {
            oldConsole.warn(data, ...args);
            _this.showLog("warn", data, ...args);
        };
        consoleArg.error = function (data, ...args) {
            oldConsole.error(data, ...args);
            _this.showLog("error", data, ...args);
        };
        consoleArg.debug = function (data, ...args) {
            if (m_DebugLog) {
                oldConsole.debug(data, ...args);
                _this.showLog("debug", data, ...args);
            }
            else {
                oldConsole.debug(data, ...args);
            }
        };
    }
    showLog(method, data, ...args) {
        this.checkLogTime();
        if (data?.includes("getVideoFrame error, no video frame")) {
            return;
        }
        let allArgs = [data];
        allArgs = allArgs.concat(...args);
        this.logger[method](...allArgs);
    }
}
const m_LogMaps = new Map();
const m_LoggerKeys = [
    "renderer",
    "main",
    "appMonitor",
    "mainWindow",
    "meetWindow",
    "tab_message_sub",
    "easemob_websdk",
];
function getLogger(key) {
    if (!m_LoggerKeys.includes(key)) {
        key = "other";
    }
    let loggerInfo = m_LogMaps.get(key);
    if (!loggerInfo) {
        loggerInfo = new LoggerInfo(key);
        m_LogMaps.set(key, loggerInfo);
    }
    return loggerInfo;
}
function getMainLog() {
    return getLogger("main");
}
exports.getMainLog = getMainLog;
function getAppMonitorLog() {
    return getLogger("appMonitor");
}
exports.getAppMonitorLog = getAppMonitorLog;
function setUploadLogReason(reason) {
    let curReason = store.get("UploadLogReason", 0);
    if (curReason == 0 || reason == 0) {
        store.set("UploadLogReason", reason);
    }
}
function getUploadLogReason() {
    let curReason = store.get("UploadLogReason", 0);
    return curReason;
}
function afterUploadLog() {
    this.setUploadLogReason(0);
    store.set("ErrorTimes", 0);
}
function enableDebugLog(enable) {
    m_DebugLog = enable;
}
module.exports = {
    getLogger,
    getMainLog,
    getAppMonitorLog,
    setUploadLogReason,
    getUploadLogReason,
    afterUploadLog,
    enableDebugLog,
};
exports.default = module.exports;
//# sourceMappingURL=Logger.js.map