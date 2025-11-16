"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Setting_1 = __importDefault(require("./Setting"));
const { contextBridge } = require("electron");
let VideoRendererHelper = require("../agaro/VideoRowDataRendererHelper");
const VolumePlugin = require("./VolumePlugin");
class SettingAfterMeet extends Setting_1.default {
    constructor() {
        super();
        this.m_SdkType = -1;
        this.m_IsOpenPreview = false;
        this.getVideoDevices = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                console.log(_this);
                _this.rendererProcessHelper.sendToOtherPage("getRtcVideoDevices", null, "meetWindow", (devicesList) => {
                    resolve(devicesList);
                });
            });
            return pms;
        };
        this.getRtcAudioDevices = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToOtherPage("getRtcAudioDevices", null, "meetWindow", (devicesList) => {
                    resolve(devicesList);
                });
            });
            return pms;
        };
        this.getRtcPlayDevices = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToOtherPage("getRtcPlayDevices", null, "meetWindow", (devicesList) => {
                    resolve(devicesList);
                });
            });
            return pms;
        };
        this.setRtcAudioDevice = (deviceId) => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                let devId = decodeURIComponent(deviceId);
                _this.rendererProcessHelper.sendToOtherPage("setRtcAudioDevices", devId, "meetWindow", (status) => {
                    resolve(status);
                });
            });
            return pms;
        };
        this.setRtcVideoDevice = (deviceId) => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                let devId = decodeURIComponent(deviceId);
                this.rendererProcessHelper.sendToOtherPage("setRtcVideoDevices", devId, "meetWindow", (status) => {
                    resolve(status);
                });
            });
            return pms;
        };
        this.setRtcPlayDevice = (deviceId) => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                let devId = decodeURIComponent(deviceId);
                _this.rendererProcessHelper.sendToOtherPage("setRtcPlayDevices", devId, "meetWindow", (status) => {
                    resolve(status);
                });
            });
            return pms;
        };
        this.getNetworkType = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToMeetingPage("get_network_type", null, (status) => {
                    resolve(status);
                });
            });
            return pms;
        };
        this.rtcRelease = (sync) => { };
        this.setupLocalVideoView = (eleId) => {
            VideoRendererHelper.initRender(0, eleId);
        };
        this.destroyRender = () => {
            VideoRendererHelper.destroyRender(0);
        };
        this.changeVideoSetting = (key, value) => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToMeetingPage("changeVideoSetting", { key, value }, (result) => {
                    console.log("changeVideoSetting %s result: %d", key, result);
                    resolve(result);
                });
            });
            return pms;
        };
        this.openPreview = () => {
            this.m_IsOpenPreview = true;
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToMeetingPage("enablePreview", "openPreview", (result) => {
                    resolve(result);
                });
            });
            return pms;
        };
        this.closePreview = () => {
            this.m_IsOpenPreview = false;
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToMeetingPage("enablePreview", "closePreview", (result) => {
                    resolve(result);
                });
            });
            return pms;
        };
        this.startSpeakerTest = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToMeetingPage("RtcAudioTest", "startSpeakerTest", (result) => {
                    resolve(result);
                });
            });
            return pms;
        };
        this.stopSpeakerTest = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToMeetingPage("RtcAudioTest", "stopSpeakerTest", (result) => {
                    resolve(result);
                });
            });
            return pms;
        };
        this.startMicTest = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToMeetingPage("RtcAudioTest", "startMicTest", (result) => {
                    resolve(result);
                });
            });
            return pms;
        };
        this.stopMicTest = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToMeetingPage("RtcAudioTest", "stopMicTest", (result) => {
                    resolve(result);
                });
            });
            return pms;
        };
        this.isVirtualBackgroundSupported = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToMeetingPage("isVirtualBackgroundSupported", undefined, (result) => {
                    resolve(result);
                });
            });
            return pms;
        };
        this.setIgnoreFeatureSupported = (ignore) => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToMeetingPage("setIgnoreFeatureSupported", ignore, (result) => {
                    resolve(result);
                });
            });
            return pms;
        };
        this.isIgnoreFeatureSupported = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                _this.rendererProcessHelper.sendToMeetingPage("isIgnoreFeatureSupported", undefined, (result) => {
                    resolve(result);
                });
            });
            return pms;
        };
        this.getSpeakerVolume = async () => {
            if (this.m_SdkType === -1) {
                await this.getSdkType();
            }
            if (this.m_SdkType === 0) {
                return VolumePlugin.getSpeakerVolume();
            }
            else {
                return new Promise((resolve, reject) => {
                    this.rendererProcessHelper.sendToMeetingPage("getSpeakerVolume", "", (volume) => {
                        resolve(volume);
                    });
                });
            }
        };
        this.getRecordVolume = async () => {
            if (this.m_SdkType === -1) {
                await this.getSdkType();
            }
            if (this.m_SdkType === 0) {
                return VolumePlugin.getRecordVolume();
            }
            else {
                return new Promise((resolve, reject) => {
                    this.rendererProcessHelper.sendToMeetingPage("getRecordVolume", "", (volume) => {
                        resolve(volume);
                    });
                });
            }
        };
        this.setRecordVolume = (volume) => {
            if (this.m_SdkType === 0) {
                if (volume <= 100) {
                    VolumePlugin.setRecordVolume(volume);
                }
                else {
                    VolumePlugin.setRecordVolume(100);
                    this.rendererProcessHelper.sendToMeetingPage("setRecordVolume", volume);
                }
            }
            else {
                this.rendererProcessHelper.sendToMeetingPage("setRecordVolume", volume);
            }
        };
        this.setSpeakerVolume = (volume) => {
            if (this.m_SdkType === 0) {
                if (volume <= 100) {
                    VolumePlugin.setSpeakerVolume(volume);
                }
                else {
                    VolumePlugin.setSpeakerVolume(100);
                    this.rendererProcessHelper.sendToMeetingPage("setSpeakerVolume", volume);
                }
            }
            else {
                this.rendererProcessHelper.sendToMeetingPage("setSpeakerVolume", volume);
            }
        };
        this.setAgc = (value) => {
            this.rendererProcessHelper.sendToMeetingPage("setRtcParameters", `{"che.audio.aec.enable": ${value}}`);
        };
        this.setNs = (value) => {
            this.rendererProcessHelper.sendToMeetingPage("setRtcParameters", `{"che.audio.ans.enable": ${value}}`);
        };
        this.noiseReduction = (mode) => {
            this.rendererProcessHelper.sendToMeetingPage("noiseReduction", mode);
        };
        this.rendererProcessHelper.registeCallback("RtcStats", (stats) => {
            if (this.rtcStatsCallBack) {
                this.rtcStatsCallBack(stats);
            }
        });
    }
    async getSdkType() {
        let _this = this;
        return new Promise((resolve, reject) => {
            this.rendererProcessHelper.sendToMeetingPage("getSdkType", "", (sdkType) => {
                _this.m_SdkType = sdkType;
                resolve(sdkType);
            });
        });
    }
}
let setting = new SettingAfterMeet();
console.log(setting);
contextBridge.exposeInMainWorld("Setting", setting);
//# sourceMappingURL=SettingAfterMeet.js.map