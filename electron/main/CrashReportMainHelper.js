"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExtraParameter = exports.startCrashReporter = void 0;
const electron_1 = require("electron");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const os_1 = __importDefault(require("os"));
function startCrashReporter() {
    electron_1.crashReporter.start({
        uploadToServer: true,
        submitURL: "https://k.chaoxing.com/apis/feedback/uploadCrashInfo",
        compress: true,
        globalExtra: {
            _companyName: "chaoxing",
            type: "0",
            systemVersion: `${os_1.default.type()} ${os_1.default.release()}`,
        },
    });
    updateExtraParameter();
    setInterval(() => {
        updateExtraParameter();
    }, 60 * 1000);
}
exports.startCrashReporter = startCrashReporter;
function updateExtraParameter() {
    const key = "3Z3BLeXH";
    let curTime = new Date().getTime() + "";
    electron_1.crashReporter.addExtraParameter("enc", (0, CryptoUtil_1.encodeDes)(curTime, key));
}
exports.updateExtraParameter = updateExtraParameter;
//# sourceMappingURL=CrashReportMainHelper.js.map