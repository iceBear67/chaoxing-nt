"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAutoStart = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
function setAutoStart(isAutoStart) {
    let configPath = path_1.default.join(electron_1.app.getPath("userData"), "system.json");
    let configData = {};
    try {
        if (fs_1.default.existsSync(configPath)) {
            let stat = fs_1.default.statSync(configPath);
            if (stat.isFile() && stat.size > 0) {
                configData = require(configPath);
            }
        }
    }
    catch (err) {
        configData = {};
        console.error("parse system json error:", err);
    }
    if (!configData.appSystemConfig) {
        configData.appSystemConfig = {};
    }
    configData.appSystemConfig.openAtOsLogin = isAutoStart;
    try {
        fs_1.default.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    }
    catch (err) {
        console.error("write system json error:", err);
    }
    electron_1.app.setLoginItemSettings({
        openAtLogin: isAutoStart,
    });
}
exports.setAutoStart = setAutoStart;
//# sourceMappingURL=AutoStartSetHelper.js.map