"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAppSystemConfig = exports.getAppSystemConfig = void 0;
const electron_1 = require("electron");
const MainHelper_1 = require("./MainHelper");
const appConfig = require("../config/appconfig");
function getAppSystemConfig() {
    let cfg = (0, MainHelper_1.getSysStore)("appSystemConfig");
    if (!cfg) {
        cfg = {};
    }
    if (!cfg.appMode) {
        cfg.appMode = appConfig.appMode;
    }
    if (cfg.appMode == "classroom") {
        cfg.appMode = "normal";
    }
    if (cfg.autoUpdate == undefined) {
        cfg.autoUpdate = false;
    }
    if (cfg.messageReminder == undefined) {
        cfg.messageReminder = true;
    }
    if (cfg.messageReminderSound == undefined) {
        cfg.messageReminderSound = false;
    }
    if (cfg.windowShakeNotification == undefined) {
        cfg.windowShakeNotification = false;
    }
    if (cfg.clearMessageRedDot == undefined) {
        cfg.clearMessageRedDot = true;
    }
    if (!cfg.dataFilePath) {
        cfg.dataFilePath = electron_1.app.getPath("userData");
    }
    if (cfg.openAtOsLogin == undefined) {
        cfg.openAtOsLogin = true;
    }
    if (cfg.language == undefined) {
        cfg.language = "system";
    }
    if (cfg.autoLogin == undefined) {
        cfg.autoLogin = false;
    }
    return cfg;
}
exports.getAppSystemConfig = getAppSystemConfig;
function setAppSystemConfig(key, value) {
    let cfg = getAppSystemConfig();
    cfg[key] = value;
    (0, MainHelper_1.setSysStore)("appSystemConfig", cfg);
}
exports.setAppSystemConfig = setAppSystemConfig;
//# sourceMappingURL=AppSystemConfigMainHelper.js.map