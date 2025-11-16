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
const Setting_1 = __importDefault(require("./Setting"));
const RtcSdk_1 = require("../rtcsdk/RtcSdk");
const { contextBridge } = require("electron");
const path = require("path");
const VolumePlugin = require("./VolumePlugin");
const RendererHelper = __importStar(require("../RendererHelper"));
const KetangConfig_1 = require("./KetangConfig");
class SettingBeforeMeet extends Setting_1.default {
    constructor() {
        super();
        this.netType = -1;
        this.mirrorMode = 0;
        this.initSdk = async (sdkType, appid, meet_setting_video) => {
            this.rtcSdk = (0, RtcSdk_1.createRtcSdk)(sdkType);
            let sdkLogPath = path.join(await RendererHelper.getUserLogPath(), "agora", "agoraSdk.log");
            this.rtcSdk.initialize(appid, "", "", undefined, {
                filePath: sdkLogPath,
                fileSizeInKB: 20480,
                level: 1,
            });
            this.rtcSdk.onNetworkTypeChanged((type) => {
                this.netType = type;
            });
            this.rtcSdk.onRtcStats((stats) => {
                if (this.rtcStatsCallBack) {
                    this.rtcStatsCallBack(stats);
                }
            });
            this.rtcSdk.onGroupAudioVolumeIndication((speakers, speakerNumber, totalVolume) => {
                if (this.audioVolumeCallback) {
                    if (speakers && speakers.length > 0 && speakers[0].uid === 0) {
                        this.audioVolumeCallback(totalVolume);
                    }
                }
            });
            let RtcAudioDevice = this.getStorageData("RtcAudioDevice");
            let RtcVideoDevice = this.getStorageData("RtcVideoDevice");
            let RtcPlayDevice = this.getStorageData("RtcPlayDevice");
            if (RtcVideoDevice) {
                this.rtcSdk.getVideoDevices().forEach((dev) => {
                    if (dev.deviceid === RtcVideoDevice) {
                        this.rtcSdk.setVideoDevice(RtcVideoDevice);
                    }
                });
            }
            if (RtcAudioDevice) {
                this.rtcSdk.getAudioRecordingDevices().forEach((dev) => {
                    if (dev.deviceid === RtcAudioDevice) {
                        this.rtcSdk.setAudioRecordingDevice(RtcAudioDevice);
                    }
                });
            }
            if (RtcPlayDevice) {
                this.rtcSdk.getAudioPlaybackDevices().forEach((dev) => {
                    if (dev.deviceid === RtcAudioDevice) {
                        this.rtcSdk.setAudioPlaybackDevice(RtcPlayDevice);
                    }
                });
            }
            if (meet_setting_video) {
                this.mirrorMode = meet_setting_video.mirrorMode;
                this.setLocalVideoMirrorMode(meet_setting_video.mirrorMode);
                if (meet_setting_video.virtualBackground) {
                    this.enableVirtualBackground(true, meet_setting_video.virtualBackground, 0);
                }
                else {
                    this.enableVirtualBackground(false, "", 0);
                }
                if (meet_setting_video.beautyEffectOptions) {
                    this.setBeautyEffectOption(meet_setting_video.beautyEffectOptions);
                }
            }
        };
        this.getVideoDevices = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                let currentVideoDevice = _this.rtcSdk.getCurrentVideoDevice();
                let videoDevices = _this.rtcSdk.getVideoDevices();
                if (videoDevices.length === 0) {
                    console.log("no video found");
                }
                console.log("videoDevices", videoDevices);
                let videoDevicesObj = {
                    currentVideoDevice: currentVideoDevice,
                    videoDevices: videoDevices,
                };
                resolve(videoDevicesObj);
            });
            return pms;
        };
        this.getRtcAudioDevices = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                let currentAudioRecordingDevice = _this.rtcSdk.getCurrentAudioRecordingDevice() || "";
                let audioRecordingDevices = _this.rtcSdk.getAudioRecordingDevices() || [];
                if (audioRecordingDevices.length === 0) {
                    console.log("no audio found");
                }
                console.log("audioDevices", audioRecordingDevices);
                let audioDevices = {
                    currentAudioDevice: currentAudioRecordingDevice,
                    audioDevices: audioRecordingDevices,
                };
                resolve(audioDevices);
            });
            return pms;
        };
        this.getRtcPlayDevices = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                let currentPlayDevice = _this.rtcSdk.getCurrentAudioPlaybackDevice() || "";
                let playDevices = _this.rtcSdk.getAudioPlaybackDevices() || [];
                if (playDevices.length === 0) {
                    console.log("no play found");
                }
                console.log("playDevices", playDevices);
                let playDevicesObj = {
                    currentPlayDevice: currentPlayDevice,
                    playDevices: playDevices,
                };
                resolve(playDevicesObj);
            });
            return pms;
        };
        this.setRtcAudioDevice = (deviceId) => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                let devId = decodeURIComponent(deviceId);
                _this.addStorageData("RtcAudioDevice", devId);
                resolve(_this.rtcSdk.setAudioRecordingDevice(devId));
            });
            return pms;
        };
        this.setRtcVideoDevice = (deviceId) => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                let devId = decodeURIComponent(deviceId);
                _this.addStorageData("RtcVideoDevice", devId);
                resolve(_this.rtcSdk.setVideoDevice(devId));
            });
            return pms;
        };
        this.setRtcPlayDevice = (deviceId) => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                let devId = decodeURIComponent(deviceId);
                _this.addStorageData("RtcPlayDevice", devId);
                resolve(_this.rtcSdk.setAudioPlaybackDevice(devId));
            });
            return pms;
        };
        this.getNetworkType = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                resolve(_this.netType);
            });
            return pms;
        };
        this.setupLocalVideoView = (eleId) => {
            this.rtcSdk.setupLocalVideo(document.getElementById(eleId));
            this.setLocalVideoMirrorMode(this.mirrorMode);
        };
        this.changeVideoSetting = (key, value) => {
            let _this = this;
            if (key) {
                if (key == "VirtualBackground") {
                    if (value) {
                        return _this.enableVirtualBackground(true, value, undefined);
                    }
                    else {
                        return _this.enableVirtualBackground(false, undefined, undefined);
                    }
                }
            }
            let pms = new Promise((resolve, reject) => {
                let retCode = 0;
                if (key) {
                    if (key == "VideoMirroring") {
                        retCode = _this.changeMirrorMode(value);
                    }
                    else if (key == "VideoQuality") {
                        let videoConfigCode = this.rtcSdk.setVideoEncoderConfiguration((0, KetangConfig_1.getVideoConfig)(value));
                        console.log("更新视屏参数", videoConfigCode);
                    }
                    else if (key == "BeautyEffectOptions") {
                        retCode = _this.setBeautyEffectOption(value);
                    }
                }
                if (typeof retCode == "number") {
                    resolve(retCode);
                }
                else {
                    resolve(0);
                }
            });
            return pms;
        };
        this.openPreview = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                resolve(_this.rtcSdk.startPreview());
            });
            return pms;
        };
        this.closePreview = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                resolve(_this.rtcSdk.stopPreview());
            });
            return pms;
        };
        this.startSpeakerTest = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                resolve(_this.rtcSdk.startAudioPlaybackDeviceTest(path.join(__dirname, "../../../html/files/audio_play_test.wav")));
            });
            return pms;
        };
        this.stopSpeakerTest = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                resolve(_this.rtcSdk.stopAudioPlaybackDeviceTest());
            });
            return pms;
        };
        this.startMicTest = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                resolve(_this.rtcSdk.startAudioRecordingDeviceTest(500));
            });
            return pms;
        };
        this.stopMicTest = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                resolve(_this.rtcSdk.stopAudioRecordingDeviceTest());
                if (this.audioVolumeCallback) {
                    this.audioVolumeCallback(0);
                }
            });
            return pms;
        };
        this.enableVirtualBackground = (enabled, backgroundImage, backgroundColor) => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                if (enabled && backgroundImage && backgroundImage.startsWith("http")) {
                    _this.rendererProcessHelper
                        .downloadImage(backgroundImage)
                        .then((localPath) => {
                        let ret = _this.rtcSdk.enableVirtualBackground(enabled, localPath, backgroundColor);
                        if (ret == 0) {
                            resolve(ret);
                        }
                        else {
                            reject(-1);
                        }
                    })
                        .catch((err) => {
                        reject(err);
                    });
                }
                else {
                    let ret = _this.rtcSdk.enableVirtualBackground(enabled, backgroundImage, backgroundColor);
                    if (ret == 0) {
                        resolve(ret);
                    }
                    else {
                        reject(-1);
                    }
                }
            });
            return pms;
        };
        this.changeMirrorMode = (enable) => {
            let retCode = 0;
            let mirrorMode = enable ? 1 : 2;
            retCode = this.setLocalVideoMirrorMode(mirrorMode);
            if (retCode == 0) {
                this.mirrorMode = mirrorMode;
            }
            return retCode;
        };
        this.setLocalVideoMirrorMode = (mirrorMode) => {
            console.info(`setLocalVideoMirrorMode:${mirrorMode}`);
            let allCanvas = document.querySelectorAll(".camera-box");
            if (allCanvas) {
                allCanvas.forEach((cvs) => {
                    if (mirrorMode === 1) {
                        cvs?.classList.remove("rotateY0");
                        cvs?.classList.add("rotateY180");
                    }
                    else {
                        cvs?.classList.remove("rotateY180");
                        cvs?.classList.add("rotateY0");
                    }
                });
            }
            return 0;
        };
        this.setBeautyEffectOption = (data) => {
            let retCode = 0;
            console.log("setBeautyEffectOption", data);
            if (data) {
                let contrastError = true;
                for (let i = 0; i < 3; i++) {
                    if (data.lighteningContrastLevel == i) {
                        contrastError = false;
                        break;
                    }
                }
                if (contrastError) {
                    data.lighteningContrastLevel = 1;
                }
            }
            this.rtcSdk.setBeautyEffectOptions(data.enabled, data);
            return retCode;
        };
        this.isVirtualBackgroundSupported = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                let ret = _this.rtcSdk.isVirtualBackgroundSupported();
                resolve(ret);
            });
            return pms;
        };
        this.setIgnoreFeatureSupported = (ignore) => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                let ret = _this.rtcSdk.setIgnoreFeatureSupported(ignore);
                resolve(ret);
            });
            return pms;
        };
        this.isIgnoreFeatureSupported = () => {
            let _this = this;
            let pms = new Promise((resolve, reject) => {
                let ret = _this.rtcSdk.isIgnoreFeatureSupported();
                resolve(ret);
            });
            return pms;
        };
        this.rtcRelease = (sync) => {
            this.rtcSdk.release(sync);
        };
        this.setRecordVolume = (volume) => {
            if (volume <= 100) {
                VolumePlugin.setRecordVolume(volume);
            }
            else {
                VolumePlugin.setRecordVolume(100);
                this.rtcSdk.adjustRecordingSignalVolume(volume);
            }
        };
        this.setSpeakerVolume = (volume) => {
            if (volume <= 100) {
                VolumePlugin.setSpeakerVolume(volume);
            }
            else {
                VolumePlugin.setSpeakerVolume(100);
                this.rtcSdk.adjustPlaybackSignalVolume(volume);
            }
        };
        this.setAgc = (value) => {
            this.rtcSdk.setParameters(`{"che.audio.aec.enable": ${value}}`);
        };
        this.setNs = (value) => {
            this.rtcSdk.setParameters(`{"che.audio.ans.enable": ${value}}`);
        };
        this.noiseReduction = (mode) => {
            if (mode == 0) {
                this.rtcSdk.setParameters('{"che.audio.ains_mode":0}');
            }
            else if (mode == 1) {
                this.rtcSdk.setParameters('{"che.audio.enable.nsng":true');
                this.rtcSdk.setParameters('{"che.audio.ains_mode":2');
                this.rtcSdk.setParameters('{"che.audio.ns.mode":2');
                this.rtcSdk.setParameters('{"che.audio.nsng.lowerBound":80');
                this.rtcSdk.setParameters('{"che.audio.nsng.lowerMask":50');
                this.rtcSdk.setParameters('{"che.audio.nsng.statisticalbound":5');
                this.rtcSdk.setParameters('{"che.audio.nsng.finallowermask":30');
            }
            else if (mode == 2) {
                this.rtcSdk.setParameters('{"che.audio.enable.nsng":true');
                this.rtcSdk.setParameters('{"che.audio.ains_mode":2');
                this.rtcSdk.setParameters('{"che.audio.ns.mode":2');
                this.rtcSdk.setParameters('{"che.audio.nsng.lowerBound":10');
                this.rtcSdk.setParameters('{"che.audio.nsng.lowerMask":10');
                this.rtcSdk.setParameters('{"che.audio.nsng.statisticalbound":0');
                this.rtcSdk.setParameters('{"che.audio.nsng.finallowermask":8');
            }
        };
    }
}
let setting = new SettingBeforeMeet();
contextBridge.exposeInMainWorld("Setting", setting);
//# sourceMappingURL=SettingBeforeMeet.js.map