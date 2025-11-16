"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppMode = exports.getAppName = void 0;
const appConfig = require("../config/appconfig.json");
function getAppName() {
    return appConfig.appName;
}
exports.getAppName = getAppName;
function getAppMode() {
    return appConfig.appMode;
}
exports.getAppMode = getAppMode;
//# sourceMappingURL=AppConfigHelper.js.map