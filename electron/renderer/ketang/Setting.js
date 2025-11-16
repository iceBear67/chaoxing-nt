"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RendererProcessHelper_1 = __importDefault(require("./RendererProcessHelper"));
const RendererHelper = require("../RendererHelper");
const webStorageUtil = require("../web.storage.util");
const VolumePlugin = require("./VolumePlugin");
const { contextBridge } = require("electron");
class Setting {
    constructor() {
        this.meet_setting_video = {};
        this.initSdk = (sdkType, appid, meet_setting_video) => {
            return Promise.resolve();
        };
        this.onRtcStatsCallBack = (callback) => {
            this.rtcStatsCallBack = callback;
        };
        this.addStorageData = (key, value) => {
            webStorageUtil.addStorageData(key, value);
        };
        this.getStorageData = (key) => {
            return webStorageUtil.getStorageVal(key);
        };
        this.saveVideoSetting = () => {
            webStorageUtil.addStorageData("MEET_VIDEO_SETTING", JSON.stringify(this.meet_setting_video));
        };
        this.getVideoSetting = () => {
            return this.meet_setting_video;
        };
        this.onAudioVolumeCallback = (callback) => {
            this.audioVolumeCallback = callback;
        };
        this.getSpeakerVolume = () => {
            return VolumePlugin.getSpeakerVolume();
        };
        this.getRecordVolume = () => {
            return VolumePlugin.getRecordVolume();
        };
        this.isRecordMute = () => {
            return VolumePlugin.isRecordMute();
        };
        this.setRecordMute = (mute) => {
            VolumePlugin.setRecordMute(mute);
        };
        this.rendererProcessHelper = RendererProcessHelper_1.default;
        this.meet_setting_video =
            JSON.parse(webStorageUtil.getStorageVal("MEET_VIDEO_SETTING")) || {};
    }
}
exports.default = Setting;
contextBridge.exposeInMainWorld("RendererProcessHelper", RendererProcessHelper_1.default);
contextBridge.exposeInMainWorld("RendererHelper", RendererHelper);
//# sourceMappingURL=Setting.js.map