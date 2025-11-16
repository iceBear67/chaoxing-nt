"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrettyName = exports.getDeviceModel = void 0;
const os_1 = __importDefault(require("os"));
const child_process_1 = require("child_process");
function getDeviceModel() {
    try {
        if (os_1.default.platform() === "darwin") {
            const modelInfo = (0, child_process_1.execSync)('system_profiler SPHardwareDataType | grep "Model Name"').toString();
            return modelInfo.split(":")[1].trim();
        }
    }
    catch (error) {
        console.error("获取设备型号失败:", error);
    }
    if (process.platform == "win32") {
        return "Windows";
    }
    else if (process.platform == "darwin") {
        return "Mac";
    }
    else if (process.platform == "linux") {
        return "Linux";
    }
    else {
        return process.platform;
    }
}
exports.getDeviceModel = getDeviceModel;
function getPrettyName() {
    const username = os_1.default.userInfo().username;
    const deviceModel = getDeviceModel();
    return `${username}的${deviceModel}`;
}
exports.getPrettyName = getPrettyName;
//# sourceMappingURL=DeviceUtil.js.map