"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { contextBridge } = require("electron");
console.log("KetangHelper..");
const RtcAudioVideoSceenHelper_1 = __importDefault(require("./RtcAudioVideoSceenHelper"));
const RendererProcessHelper_1 = __importDefault(require("./RendererProcessHelper"));
require("./RtcSdkHelper");
const RtcHelper_1 = __importDefault(require("../../module/projection/renderer/RtcHelper"));
const ProjectionRtcHelper = require("../../module/projection/renderer/ProjectionRtcHelper");
let m_RtcAudioVideoSceenHelper = new RtcAudioVideoSceenHelper_1.default();
let InjectRtcAudioVideoScreenUtil = {};
const allKey = Reflect.ownKeys(RtcAudioVideoSceenHelper_1.default.prototype).filter((key) => typeof RtcAudioVideoSceenHelper_1.default.prototype[key] === "function");
allKey.forEach((key) => {
    InjectRtcAudioVideoScreenUtil[key] = (...args) => {
        return m_RtcAudioVideoSceenHelper[key](...args);
    };
});
Object.defineProperty(InjectRtcAudioVideoScreenUtil, "screenStatus", {
    get: function () {
        return m_RtcAudioVideoSceenHelper.screenStatus;
    },
});
InjectRtcAudioVideoScreenUtil.getVariable = function (key) {
    return m_RtcAudioVideoSceenHelper[key];
};
contextBridge.exposeInMainWorld("InjectRtcAudioVideoScreenUtil", InjectRtcAudioVideoScreenUtil);
contextBridge.exposeInMainWorld("RendererProcessHelper", RendererProcessHelper_1.default);
contextBridge.exposeInMainWorld("RtcHelper", RtcHelper_1.default);
contextBridge.exposeInMainWorld("ProjectionRtcHelper", ProjectionRtcHelper);
const RendererHelper = require("../RendererHelper");
contextBridge.exposeInMainWorld("RendererHelper", RendererHelper);
//# sourceMappingURL=KetangHelper.js.map