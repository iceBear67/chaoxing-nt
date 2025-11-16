"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DateUtil_1 = require("../../utils/DateUtil");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const RendererHelper = __importStar(require("../RendererHelper"));
const RtcSdk_1 = require("../rtcsdk/RtcSdk");
const { contextBridge } = require("electron");
let m_Index = 0;
function createSdk(sdkType) {
    const rtcSdk = (0, RtcSdk_1.createRtcSdk)(sdkType);
    m_Index++;
    const sdkObjName = `RtcSdk${m_Index}`;
    let rtcSdkObj = {};
    for (let key of rtcSdk.getMethodNameList()) {
        rtcSdkObj[key] = (...args) => {
            return rtcSdk[key](...args);
        };
    }
    contextBridge.exposeInMainWorld(sdkObjName, rtcSdkObj);
    return sdkObjName;
}
async function getSdkLogPath(sdkType) {
    let logPath = await RendererHelper.getUserLogPath();
    let dateStr = (0, DateUtil_1.dateFormat)("yyyyMMdd");
    if (sdkType == 0) {
        return path_1.default.join(logPath, "agora", `agoraSdk_${dateStr}.log`);
    }
    else {
        let sdklogPath = path_1.default.join(logPath, "cx_rtc", dateStr);
        if (!fs_1.default.existsSync(sdklogPath)) {
            fs_1.default.mkdirSync(sdklogPath, { recursive: true });
        }
        return sdklogPath;
    }
}
contextBridge.exposeInMainWorld("RtcSdkHelper", { createSdk, getSdkLogPath });
//# sourceMappingURL=RtcSdkHelper.js.map