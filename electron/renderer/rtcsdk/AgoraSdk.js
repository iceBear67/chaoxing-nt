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
const agora_electron_sdk_1 = __importStar(require("agora-electron-sdk"));
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
const events_1 = require("events");
const path_1 = __importDefault(require("path"));
const m_EventEmitter = new events_1.EventEmitter();
class GroupAudioVolumeIndicationHelper {
    constructor(interval) {
        this.m_startTime = new Date().getTime();
        this.m_interval = interval;
    }
    checkInterval(speakerNumber, totalVolume) {
        let curTime = new Date().getTime();
        if (curTime - this.m_startTime >= this.m_interval / 2 ||
            speakerNumber > 0 ||
            totalVolume > 0) {
            this.m_startTime = curTime;
            return true;
        }
        else {
            return false;
        }
    }
}
function handleDefaultDevName(devName) {
    const regex = /^default \((.*)\)$/;
    const match = devName.match(regex);
    if (match) {
        return match[1];
    }
    else {
        return devName;
    }
}
class AgoraSdk extends events_1.EventEmitter {
    constructor() {
        super();
        this.m_localVideoEnabled = false;
        this.m_isMuteLocalVideoStream = false;
        this.m_onPreview = false;
        this.m_OnPublishStream = false;
        this.m_AudioVolumeIndicationHelper = new GroupAudioVolumeIndicationHelper(1000);
        this.rtcEngine = (0, agora_electron_sdk_1.default)();
        this.m_assistChannelMap = new Map();
        this.m_stopAudioRecord = true;
        this.m_IgnoreFeatureSupporte = false;
    }
    equalsConnection(conn1, conn2) {
        if (!conn1 || !conn2) {
            return false;
        }
        if (conn1.channelId == conn2.channelId &&
            conn1.localUid == conn2.localUid) {
            return true;
        }
        return false;
    }
    onJoinedChannel(callback) {
        this.rtcEngine.addListener("onJoinChannelSuccess", (connection, elapsed) => {
            if (this.equalsConnection(connection, this.m_videoSourceConnection)) {
                m_EventEmitter.emit("videosourcejoinedsuccess");
            }
            else {
                callback(connection.channelId, connection.localUid, elapsed);
            }
        });
        return this;
    }
    onJoinedChannelEx(callback) {
        this.rtcEngine.addListener("onJoinChannelSuccess", (connection, elapsed) => {
            callback(connection.channelId, connection.localUid, elapsed);
        });
        return this;
    }
    onRejoinedChannel(callback) {
        this.rtcEngine.addListener("onRejoinChannelSuccess", (connection, elapsed) => {
            callback(connection.channelId, connection.localUid, elapsed);
        });
        return this;
    }
    onLeaveChannel(callback) {
        this.rtcEngine.addListener("onLeaveChannel", (connection, stats) => {
            callback(connection.channelId, connection.localUid, stats);
        });
        return this;
    }
    onLeaveChannelEx(callback) {
        return this.onLeaveChannel(callback);
    }
    onUserJoined(callback) {
        this.rtcEngine.addListener("onUserJoined", (connection, remoteUid, elapsed) => {
            if (this.equalsConnection(this.m_mainConnection, connection)) {
                callback(remoteUid, elapsed, connection);
            }
        });
        return this;
    }
    onUserJoinedEx(callback) {
        this.rtcEngine.addListener("onUserJoined", (connection, remoteUid, elapsed) => {
            if (this.equalsConnection(this.m_mainConnection, connection)) {
                callback(connection, remoteUid, elapsed);
            }
        });
        return this;
    }
    onUserOffline(callback) {
        this.rtcEngine.addListener("onUserOffline", (connection, remoteUid, reason) => {
            callback(remoteUid, reason, connection);
        });
        return this;
    }
    onUserOfflineEx(callback) {
        this.rtcEngine.addListener("onUserOffline", (connection, remoteUid, reason) => {
            callback(connection, remoteUid, reason);
        });
        return this;
    }
    onRemoveStream(callback) {
        return this;
    }
    onError(callback) {
        this.rtcEngine.addListener("onError", (err, msg) => {
            callback(err, msg);
        });
        return this;
    }
    onGroupAudioVolumeIndication(callback) {
        this.rtcEngine.addListener("onAudioVolumeIndication", (connection, speakers, speakerNumber, totalVolume) => {
            if (speakers) {
                speakers.forEach((speaker) => {
                    if (this.m_stopAudioRecord && speaker.uid == 0) {
                        speaker.volume = 0;
                    }
                });
            }
            if (this.equalsConnection(connection, this.m_mainConnection)) {
                callback(speakers, speakerNumber, totalVolume);
            }
        });
        return this;
    }
    onRemoteAudioStateChanged(callback) {
        this.rtcEngine.addListener("onRemoteAudioStateChanged", (connection, remoteUid, state, reason, elapsed) => {
            if (this.equalsConnection(connection, this.m_mainConnection)) {
                if (this.m_videoSourceConnection) {
                    if (remoteUid == this.m_videoSourceConnection.localUid) {
                        this.rtcEngine.muteRemoteAudioStream(remoteUid, true);
                        return;
                    }
                }
                callback(remoteUid, state, reason, elapsed);
            }
        });
        return this;
    }
    onRemoteAudioStateChangedEx(callback) {
        this.rtcEngine.addListener("onRemoteAudioStateChanged", (connection, remoteUid, state, reason, elapsed) => {
            callback(connection, remoteUid, state, reason, elapsed);
        });
        return this;
    }
    onRemoteVideoStateChanged(callback) {
        this.rtcEngine.addListener("onRemoteVideoStateChanged", (connection, remoteUid, state, reason, elapsed) => {
            console.log("agora sdk onRemoteVideoStateChanged:", connection.localUid, remoteUid, state, reason, elapsed);
            if (this.equalsConnection(connection, this.m_mainConnection)) {
                callback(remoteUid, state, reason, elapsed);
            }
            else {
                m_EventEmitter.emit(`assist_${connection.channelId}_remoteVideoStateChanged`, remoteUid, state, reason, elapsed);
            }
        });
        return this;
    }
    onRemoteVideoStateChangedEx(callback) {
        this.rtcEngine.addListener("onRemoteVideoStateChanged", (connection, remoteUid, state, reason, elapsed) => {
            console.log("agora sdk onRemoteVideoStateChangedEx:", connection.localUid, remoteUid, state, reason, elapsed);
            callback(connection, remoteUid, state, reason, elapsed);
        });
        return this;
    }
    onRemoteScreenShareStateChanged(callback) {
        return this;
    }
    onRemoteScreenShareStateChangedEx(callback) {
        return this;
    }
    onUserMuteVideo(callback) {
        this.rtcEngine.addListener("onUserMuteVideo", (connection, remoteUid, muted) => {
            if (connection == this.m_mainConnection) {
                if (muted) {
                    callback(remoteUid, muted);
                }
            }
        });
        return this;
    }
    onUserMuteAudioEx(callback) {
        this.rtcEngine.addListener("onUserMuteAudio", (connection, remoteUid, muted) => {
            callback(connection, remoteUid, muted);
        });
        return this;
    }
    onNetworkQuality(callback) {
        this.rtcEngine.addListener("onNetworkQuality", (connection, remoteUid, txQuality, rxQuality) => {
            callback(remoteUid, txQuality, rxQuality, connection.channelId);
        });
        return this;
    }
    onNetworkQualityEx(callback) {
        this.rtcEngine.addListener("onNetworkQuality", (connection, remoteUid, txQuality, rxQuality) => {
            callback(connection, remoteUid, txQuality, rxQuality);
        });
        return this;
    }
    onConnectionStateChanged(callback) {
        this.rtcEngine.addListener("onConnectionStateChanged", (connection, state, reason) => {
            callback(state, reason, connection);
        });
        return this;
    }
    onConnectionLost(callback) {
        this.rtcEngine.addListener("onConnectionLost", (connection) => {
            callback();
        });
        return this;
    }
    onRtcStats(callback) {
        this.rtcEngine.addListener("onRtcStats", (connection, stats) => {
            callback(stats);
        });
        return this;
    }
    onTokenPrivilegeWillExpire(callback) {
        this.rtcEngine.addListener("onTokenPrivilegeWillExpire", (connection, token) => {
            if (this.equalsConnection(connection, this.m_mainConnection)) {
                callback(token);
            }
            else {
                if (this.equalsConnection(connection, this.m_videoSourceConnection)) {
                    m_EventEmitter.emit("videoSourceTokenPrivilegeWillExpire", token);
                }
                else {
                    m_EventEmitter.emit(`assist_${connection.channelId}_tokenPrivilegeWillExpire`, token);
                }
            }
        });
        return this;
    }
    onTokenPrivilegeWillExpireEx(callback) {
        this.rtcEngine.addListener("onTokenPrivilegeWillExpire", (connection, token) => {
            callback(connection, token);
        });
        return this;
    }
    onVideoSourceRequestNewToken(callback) {
        this.rtcEngine.addListener("onRequestToken", (connection) => {
            callback("");
        });
        return this;
    }
    onRtmpStreamingEvent(callback) {
        this.rtcEngine.addListener("onRtmpStreamingEvent", (url, eventCode) => {
            callback(url, eventCode);
        });
        return this;
    }
    onRtmpStreamingStateChanged(callback) {
        this.rtcEngine.addListener("onRtmpStreamingStateChanged", (url, state, errCode) => {
            callback(url, state, errCode);
        });
        return this;
    }
    onMessage(callback) {
        return this;
    }
    convertFrameDataInfo(uid, videoFrame, isScreen) {
        let info = {};
        let header_buffer = new ArrayBuffer(20);
        let header = new DataView(header_buffer);
        header.setUint8(0, 0);
        header.setUint8(1, 0);
        header.setUint16(2, videoFrame.width);
        header.setUint16(4, videoFrame.height);
        header.setUint16(6, 0);
        header.setUint16(8, 0);
        header.setUint16(10, 0);
        header.setUint16(12, 0);
        header.setUint16(14, 0);
        header.setUint32(16, 0);
        info.type = isScreen ? 2 : 0;
        info.vType = isScreen ? 2 : 0;
        info.ydata = videoFrame.yBuffer;
        info.udata = videoFrame.uBuffer;
        info.vdata = videoFrame.vBuffer;
        info.uid = uid;
        info.header = header_buffer;
        return info;
    }
    onNetworkTypeChanged(callback) {
        this.rtcEngine.addListener("onNetworkTypeChanged", (connection, type) => {
            callback(type);
        });
        return this;
    }
    onRepeatLogin(callback) {
        return this;
    }
    onRoomStateChange(callback) {
        return this;
    }
    onAudioDeviceStateChanged(callback) {
        this.rtcEngine.addListener("onAudioDeviceStateChanged", (deviceId, deviceType, deviceState) => {
            callback(deviceId, deviceType, deviceState);
        });
        return this;
    }
    onVideoDeviceStateChanged(callback) {
        this.rtcEngine.addListener("onVideoDeviceStateChanged", (deviceId, deviceType, deviceState) => {
            callback(deviceId, deviceType, deviceState);
        });
        return this;
    }
    onRtcError(callback) {
        this.on("rtcError", (errData) => {
            if (typeof errData == "string") {
                callback(errData, 0, undefined);
            }
            else if (typeof errData == "object") {
                callback(errData.type, errData.errCode, undefined);
            }
        });
        return this;
    }
    initialize(appid, userId, token, areaCode, logConfig) {
        return this.initialize2(appid, { userId }, token, areaCode, logConfig);
    }
    initialize2(appid, userInfo, token, areaCode, logConfig) {
        this.m_Appid = appid;
        if (logConfig) {
            this.m_logPath = logConfig.filePath;
        }
        let that = this;
        let pms = new Promise((resolve, reject) => {
            let ret = that.rtcEngine.initialize({
                appId: appid,
                areaCode,
                logConfig,
            });
            if (process.platform == "win32") {
                this.rtcEngine.loadExtensionProvider("libagora_ai_noise_suppression_extension.dll");
            }
            if (ret == 0) {
                that.rtcEngine.setRecordingAudioFrameParameters(16000, 1, 0, 1024);
                that.rtcEngine.setPlaybackAudioFrameBeforeMixingParameters(16000, 1);
                that.rtcEngine.setPlaybackAudioFrameParameters(16000, 1, 0, 1024);
            }
            resolve(ret);
        });
        this.rtcEngine.addListener("onLocalAudioStateChanged", (connection, state, err) => {
            console.info(`localAudioStateChanged:state:${state},err:${err}`);
            if (err == 1) {
                that.emit("rtcError", "audio_input_error");
            }
            else if (err == 2) {
                that.emit("rtcError", "audio_input_no_authority");
            }
            else if (err == 3) {
                that.emit("rtcError", "audio_input_busy");
            }
            else if (err == 6) {
                that.emit("rtcError", "audio_input_no_dev");
            }
        });
        this.rtcEngine.addListener("onLocalVideoStateChanged", (source, state, err) => {
            console.info(`localVideoStateChanged:source:${source},state:${state},err:${err}`);
            that.emit("onLocalVideoStateChanged", source, state, err);
            if (source == 2) {
                console.info(`videoSourceLocalVideoStateChanged:state:${state},err:${err}`);
                if (err > 0) {
                    that.emit("rtcError", { type: "screenShareError", errCode: err });
                }
            }
            else {
                if (err == 2) {
                    that.emit("rtcError", "video_input_no_authority");
                }
                else if (err == 3) {
                    that.emit("rtcError", "video_input_busy");
                }
                else if (err == 4) {
                    that.emit("rtcError", "video_input_error");
                }
                else if (err == 8) {
                    that.emit("rtcError", "video_input_no_dev");
                }
            }
        });
        return pms;
    }
    initialize3(options) {
        return this.initialize2(options.appid, { userId: options.userId }, options.token, options.areaCode, options.logConfig);
    }
    muteRemoteVideoStream(uid, mute) {
        return this.rtcEngine.muteRemoteVideoStream(uid, mute);
    }
    muteRemoteAudioStream(uid, mute) {
        return this.rtcEngine.muteRemoteAudioStream(uid, mute);
    }
    muteRemoteVideoStreamEx(uid, mute, connection) {
        return this.rtcEngine.muteRemoteVideoStreamEx(uid, mute, connection);
    }
    muteRemoteAudioStreamEx(uid, mute, connection) {
        return this.rtcEngine.muteRemoteAudioStreamEx(uid, mute, connection);
    }
    muteScreenShareStream(uid, mute) {
        return 0;
    }
    muteScreenShareStreamEx(uid, mute, conn) {
        return 0;
    }
    setLogPath(filepath) {
        return 0;
    }
    setupLocalVideo(view, options) {
        this.rtcEngine.setupLocalVideo({
            view: null,
        });
        let ret = this.rtcEngine.setupLocalVideo({
            view,
            renderMode: agora_electron_sdk_1.RenderModeType.RenderModeFit,
        });
        return ret;
    }
    subscribe(uid, view, options, isScreenShare) {
        console.log(`subscribe setupRemoteVideoEx:uid:${uid},view:${view}`);
        let ret = this.rtcEngine.setupRemoteVideoEx({
            view,
            uid,
            renderMode: agora_electron_sdk_1.RenderModeType.RenderModeFit,
            setupMode: view ? 0 : 2,
        }, this.m_mainConnection);
        return ret;
    }
    subscribeEx(conn, uid, view, options, isScreenShare) {
        console.log(`subscribe setupRemoteVideoEx:uid:${uid},view:${view}`);
        if (typeof uid == "string") {
            uid = parseInt(uid);
        }
        let ret = this.rtcEngine.setupRemoteVideoEx({
            view,
            uid,
            renderMode: agora_electron_sdk_1.RenderModeType.RenderModeFit,
            setupMode: view ? 0 : 2,
        }, conn);
        return ret;
    }
    setChannelProfile(profile) {
        return this.rtcEngine.setChannelProfile(profile);
    }
    getCurrentAudioRecordingDevice() {
        return this.rtcEngine.getAudioDeviceManager().getRecordingDevice();
    }
    getCurrentAudioPlaybackDevice() {
        return this.rtcEngine.getAudioDeviceManager().getPlaybackDevice();
    }
    getCurrentVideoDevice() {
        return this.rtcEngine.getVideoDeviceManager().getDevice();
    }
    setAudioPlaybackDevice(deviceId) {
        return this.rtcEngine.getAudioDeviceManager().setPlaybackDevice(deviceId);
    }
    setAudioRecordingDevice(deviceId) {
        return this.rtcEngine.getAudioDeviceManager().setRecordingDevice(deviceId);
    }
    setVideoDevice(deviceId) {
        return this.rtcEngine.getVideoDeviceManager().setDevice(deviceId);
    }
    handleDevicesInfo(devs) {
        let newDevs = [];
        if (devs && devs.length > 0) {
            devs.forEach((dev) => {
                newDevs.push({
                    deviceid: dev.deviceId,
                    devicename: handleDefaultDevName(dev.deviceName),
                    isSystemDefault: dev.isSystemDefault,
                });
            });
        }
        return newDevs;
    }
    getAudioPlaybackDevices() {
        let devs = this.rtcEngine
            .getAudioDeviceManager()
            .enumeratePlaybackDevices();
        if (devs.length > 0) {
            let defaultDev = this.rtcEngine
                .getAudioDeviceManager()
                .getPlaybackDefaultDevice();
            let dev = devs.find((dev) => dev.deviceId == defaultDev.deviceId);
            if (dev) {
                dev.isSystemDefault = true;
            }
        }
        return this.handleDevicesInfo(devs);
    }
    getAudioRecordingDevices() {
        let devs = this.rtcEngine
            .getAudioDeviceManager()
            .enumerateRecordingDevices();
        if (devs.length > 0) {
            let defaultDev = this.rtcEngine
                .getAudioDeviceManager()
                .getRecordingDefaultDevice();
            let dev = devs.find((dev) => dev.deviceId == defaultDev.deviceId);
            if (dev) {
                dev.isSystemDefault = true;
            }
        }
        return this.handleDevicesInfo(devs);
    }
    getVideoDevices() {
        let devs = this.rtcEngine.getVideoDeviceManager().enumerateVideoDevices();
        return this.handleDevicesInfo(devs);
    }
    thumbImageBufferToBase64(target) {
        if (!target || !target.buffer) {
            return "";
        }
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return "";
        const width = (canvas.width = target.width);
        const height = (canvas.height = target.height);
        const rowBytes = width * 4;
        for (let row = 0; row < height; row++) {
            const srow = row;
            const imageData = ctx.createImageData(width, 1);
            const start = srow * width * 4;
            if (process.platform === "win32") {
                for (let i = 0; i < rowBytes; i += 4) {
                    imageData.data[i] = target.buffer[start + i + 2];
                    imageData.data[i + 1] = target.buffer[start + i + 1];
                    imageData.data[i + 2] = target.buffer[start + i];
                    imageData.data[i + 3] = target.buffer[start + i + 3];
                }
            }
            else {
                for (let i = 0; i < rowBytes; ++i) {
                    imageData.data[i] = target.buffer[start + i];
                }
            }
            ctx.putImageData(imageData, 0, row);
        }
        return canvas.toDataURL("image/png");
    }
    getScreenWindowsInfo() {
        let pms = new Promise((resolve, reject) => {
            let sourceInfos = this.rtcEngine.getScreenCaptureSources({ width: 160, height: 160 }, { width: 80, height: 80 }, true);
            let displaysInfo = new Array();
            let windowsInfo = new Array();
            sourceInfos.forEach((sourceInfo) => {
                if (sourceInfo.type ==
                    agora_electron_sdk_1.ScreenCaptureSourceType.ScreencapturesourcetypeScreen) {
                    let displayInfo = {};
                    displayInfo.name = sourceInfo.sourceName;
                    displayInfo.base64Src = this.thumbImageBufferToBase64(sourceInfo.thumbImage);
                    displayInfo.displayId = {};
                    displayInfo.displayId.id = sourceInfo.sourceId;
                    if (sourceInfo.position) {
                        Object.assign(displayInfo, sourceInfo.position);
                        Object.assign(displayInfo.displayId, sourceInfo.position);
                    }
                    else {
                        displayInfo.x = displayInfo.displayId.x = 0;
                        displayInfo.y = displayInfo.displayId.y = 0;
                        displayInfo.width = displayInfo.displayId.width = 1920;
                        displayInfo.height = displayInfo.displayId.height = 1080;
                    }
                    displaysInfo.push(displayInfo);
                }
                else {
                    let windowInfo = {};
                    windowInfo.windowId = sourceInfo.sourceId;
                    windowInfo.processPath = sourceInfo.processPath;
                    windowInfo.name = sourceInfo.sourceName;
                    windowInfo.iconImgSrc = this.thumbImageBufferToBase64(sourceInfo.iconImage);
                    windowInfo.base64Src = this.thumbImageBufferToBase64(sourceInfo.thumbImage);
                    if (sourceInfo.position) {
                        Object.assign(windowInfo, sourceInfo.position);
                    }
                    else {
                        windowInfo.x = 0;
                        windowInfo.y = 0;
                        windowInfo.width = 1920;
                        windowInfo.height = 1080;
                    }
                    windowInfo.originWidth = windowInfo.width;
                    windowInfo.originHeight = windowInfo.width;
                    windowsInfo.push(windowInfo);
                }
            });
            resolve({ displaysInfo, windowsInfo });
        });
        return pms;
    }
    updateChannelMediaOptions(options) {
        return this.rtcEngine.updateChannelMediaOptions(options);
    }
    updateChannelMediaOptionsEx(conn, options) {
        return this.rtcEngine.updateChannelMediaOptionsEx(options, conn);
    }
    enableAudio() {
        return this.rtcEngine.enableAudio();
    }
    enableVideo() {
        return this.rtcEngine.enableVideo();
    }
    muteAllRemoteVideoStreams(mute, channelId) {
        if (!channelId) {
            return this.rtcEngine.muteAllRemoteVideoStreams(mute);
        }
        else {
            return this.rtcEngine.muteAllRemoteVideoStreamsEx(mute, {
                localUid: this.m_mainConnection.localUid,
                channelId: channelId,
            });
        }
    }
    destroyRendererByView(view) {
        this.rtcEngine.destroyRendererByView(view);
    }
    destroyRendererByConfig(sourceType, channelId, uid) {
        this.rtcEngine.destroyRendererByConfig(sourceType, channelId, uid);
    }
    enableLocalVideo(enable) {
        if (enable && this.m_isMuteLocalVideoStream) {
            this.rtcEngine.muteLocalVideoStream(false);
            this.m_isMuteLocalVideoStream = false;
        }
        else if (!enable && this.m_onPreview) {
            this.rtcEngine.muteLocalVideoStream(true);
            this.m_isMuteLocalVideoStream = true;
            this.m_localVideoEnabled = enable;
            return 0;
        }
        let ret = this.rtcEngine.enableLocalVideo(enable);
        if (ret === 0) {
            this.m_localVideoEnabled = enable;
        }
        return ret;
    }
    enableLocalAudio(enable) {
        return this.rtcEngine.enableLocalAudio(enable);
    }
    enableSubscribe(enableAudio, enableVideo) {
        return 0;
    }
    setAudioProfile(profile, scenario) {
        return this.rtcEngine.setAudioProfile(profile, scenario);
    }
    enableAudioVolumeIndication(interval, smooth, report_vad) {
        this.m_AudioVolumeIndicationHelper.m_interval = interval;
        return this.rtcEngine.enableAudioVolumeIndication(interval, smooth, report_vad);
    }
    setVideoEncoderConfiguration(config) {
        return this.rtcEngine.setVideoEncoderConfiguration(config);
    }
    startPreview() {
        return this.rtcEngine.startPreview();
    }
    stopPreview() {
        return this.rtcEngine.stopPreview();
    }
    openPreview() {
        return this.startPreview();
    }
    closePreview() {
        return this.stopPreview();
    }
    joinChannel(token, channel, info, uid, options) {
        this.m_Channel = channel;
        this.m_mainConnection = { channelId: channel, localUid: uid };
        return this.rtcEngine.joinChannel(token, channel, uid, options);
    }
    joinChannelEx(token, channel, info, uid, options) {
        if (typeof uid == "string") {
            uid = parseInt(uid);
        }
        let conn = { localUid: uid, channelId: channel };
        let ret = this.rtcEngine.joinChannelEx(token, conn, options);
        return Promise.resolve(ret);
    }
    setParameters(param) {
        return this.rtcEngine.setParameters(param);
    }
    setScreenCaptureScenario(screenScenario) {
        return this.rtcEngine.setScreenCaptureScenario(screenScenario);
    }
    startScreenShare(screenType, winInfo, screenToken, scrennUserId, screenConfig) {
        let pms = new Promise((resolve, reject) => {
            this.m_videoSourceConnection = {
                channelId: this.m_Channel,
                localUid: scrennUserId,
            };
            let userIdTemp = scrennUserId;
            let joinResult = { joinState: 0 };
            let screenCode = 0;
            if (screenType == 1) {
                screenCode = this.rtcEngine.startScreenCaptureByDisplayId(winInfo.id, {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                }, screenConfig);
                console.info("开始共享屏幕", screenCode);
            }
            else if (screenType == 2) {
                screenCode = this.rtcEngine.startScreenCaptureByWindowId(winInfo, {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                }, screenConfig);
                console.info("开始共享窗口", screenCode);
            }
            if (screenCode < 0) {
                resolve(screenCode);
                return;
            }
            m_EventEmitter.removeAllListeners("videosourcejoinedsuccess");
            m_EventEmitter.once("videosourcejoinedsuccess", () => {
                if (joinResult.joinState === -1) {
                    return;
                }
                joinResult.joinState = 1;
                resolve(0);
            });
            console.info("共享账号准备加入频道:", screenToken, this.m_Channel, userIdTemp);
            let joinScreenCode = this.rtcEngine.joinChannelEx(screenToken, this.m_videoSourceConnection, {
                autoSubscribeAudio: false,
                autoSubscribeVideo: false,
                publishMicrophoneTrack: false,
                publishCameraTrack: false,
                clientRoleType: agora_electron_sdk_1.ClientRoleType.ClientRoleBroadcaster,
                publishScreenTrack: true,
                enableAudioRecordingOrPlayout: false,
            });
            if (joinScreenCode != 0) {
                reject("加入共享屏幕频道失败:" + joinScreenCode);
                return;
            }
            setTimeout(() => {
                if (joinResult.joinState === 1) {
                    return;
                }
                m_EventEmitter.removeAllListeners("videosourcejoinedsuccess");
                joinResult.joinState = -1;
                resolve(-5);
            }, 6000);
            console.info("加入共享屏幕频道", joinScreenCode);
        });
        return pms;
    }
    startScreenShare2(screenType, channelCode, winInfo, screenToken, scrennUserId, screenConfig) {
        let pms = new Promise((resolve, reject) => {
            if (typeof scrennUserId == "string") {
                scrennUserId = parseInt(scrennUserId);
            }
            this.m_Channel = channelCode;
            this.m_videoSourceConnection = {
                channelId: this.m_Channel,
                localUid: scrennUserId,
            };
            let screenCode = 0;
            if (screenType == 1) {
                screenCode = this.rtcEngine.startScreenCaptureByDisplayId(winInfo.id, {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                }, screenConfig);
                console.info("开始重新共享屏幕", screenCode);
            }
            else if (screenType == 2) {
                screenCode = this.rtcEngine.startScreenCaptureByWindowId(winInfo, {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                }, screenConfig);
                console.info("开始重新共享窗口", screenCode);
            }
            if (screenCode < 0) {
                resolve(screenCode);
                return;
            }
            else {
                resolve(0);
            }
        });
        return pms;
    }
    startScreenShare2Ex(conn, screenType, channelCode, winInfo, screenToken, scrennUserId, screenConfig) {
        this.setClientRole(1);
        return this.startScreenShare2(screenType, channelCode, winInfo, screenToken, scrennUserId, screenConfig);
    }
    startScreenShareOnly(screenType, winInfo, screenConfig) {
        let screenCode = 0;
        if (screenType == 1) {
            screenCode = this.rtcEngine.startScreenCaptureByDisplayId(winInfo.id, {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            }, screenConfig);
            console.info("开始共享屏幕Only", screenCode);
        }
        else if (screenType == 2) {
            screenCode = this.rtcEngine.startScreenCaptureByWindowId(winInfo, {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            }, screenConfig);
            console.info("开始共享窗口Only", screenCode);
        }
        return screenCode;
    }
    stopScreenShare() {
        let screenCode = this.rtcEngine.stopScreenCapture();
        console.info("停止共享屏幕", screenCode);
        let leaveScreenCode = 0;
        if (this.m_videoSourceConnection) {
            leaveScreenCode = this.rtcEngine.leaveChannelEx(this.m_videoSourceConnection);
            this.m_videoSourceConnection = undefined;
        }
        console.info("离开共享屏幕频道", leaveScreenCode);
        return leaveScreenCode;
    }
    stopScreenShareEx(conn) {
        return this.stopScreenShare();
    }
    stopScreenShare2() {
        return this.rtcEngine.stopScreenCapture();
    }
    stopScreenShare2Ex(conn) {
        return this.stopScreenShare2();
    }
    reChooseShareScreen(screenType, winInfo, screenConfig) {
        this.rtcEngine.stopScreenCapture();
        let screenCode;
        if (screenType == 1) {
            screenCode = this.rtcEngine.startScreenCaptureByDisplayId(winInfo.id, {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            }, screenConfig);
            console.info("开始重新共享屏幕:reChooseShareScreen", screenCode);
        }
        else if (screenType == 2) {
            screenCode = this.rtcEngine.startScreenCaptureByWindowId(winInfo, {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            }, screenConfig);
            console.info("开始重新共享窗口:reChooseShareScreen", screenCode);
        }
        return screenCode;
    }
    videoSourceUpdateScreenCaptureParameters(param) {
        return this.rtcEngine.updateScreenCaptureParameters(param);
    }
    videoSourceRenewToken(token) {
        if (this.m_videoSourceConnection) {
            return this.rtcEngine.updateChannelMediaOptionsEx({ token: token }, this.m_videoSourceConnection);
        }
        return 0;
    }
    renewTokenEx(conn, newtoken) {
        return this.rtcEngine.updateChannelMediaOptionsEx({ token: newtoken }, conn);
    }
    setupViewContentMode(uid, videoType, mode, channelId) {
        if (uid == "videosource") {
            return;
        }
        if (uid == "local") {
            uid = 0;
        }
        return this.rtcEngine.setRemoteRenderMode(uid, mode == 1
            ? agora_electron_sdk_1.RenderModeType.RenderModeFit
            : agora_electron_sdk_1.RenderModeType.RenderModeHidden, undefined);
    }
    setupRemoteVideo(uid, view, channel, options) {
        let connection = {
            localUid: this.m_mainConnection.localUid,
            channelId: channel ? channel : this.m_mainConnection.channelId,
        };
        console.log(`setupRemoteVideo:uid:${uid},view:${view}`);
        return this.rtcEngine.setupRemoteVideoEx({ view, uid, renderMode: agora_electron_sdk_1.RenderModeType.RenderModeFit }, connection);
    }
    setupRemoteVideoEx(uid, view, connection) {
        console.log(`setupRemoteVideoEx:uid:${uid},view:${view}`);
        return this.rtcEngine.setupRemoteVideoEx({ view, uid, renderMode: agora_electron_sdk_1.RenderModeType.RenderModeFit }, connection);
    }
    renewToken(newtoken) {
        return this.rtcEngine.renewToken(newtoken);
    }
    leaveChannel() {
        return this.rtcEngine.leaveChannel();
    }
    leaveChannelEx(conn) {
        return this.rtcEngine.leaveChannelEx(conn);
    }
    release(sync) {
        if (sync == undefined) {
            sync = true;
        }
        this.closeAllAssistChannel();
        this.rtcEngine.release(sync);
        return 0;
    }
    createAssistChannel(channelName) {
        return 0;
    }
    joinAssistChannel(channelId, token, info, uid, options) {
        let assistConnection = { channelId, localUid: uid };
        this.m_assistChannelMap.set(channelId, assistConnection);
        let ret = this.rtcEngine.joinChannelEx(token, assistConnection, options);
        return ret;
    }
    joinAssistChannelAsync(channelId, token, info, uid, options) {
        let ret = this.joinAssistChannel(channelId, token, info, uid, options);
        return Promise.resolve(ret);
    }
    renewAssistChannelToken(channelId, newtoken) {
        return 0;
    }
    onAssistChannel(channelId, event, listener) {
        m_EventEmitter.on(`assist_${channelId}_${event}`, listener);
        return this;
    }
    closeAssistChannel(channelId) {
        let assistConnection = this.m_assistChannelMap.get(channelId);
        if (assistConnection) {
            this.m_assistChannelMap.delete(channelId);
            return this.rtcEngine.leaveChannelEx(assistConnection);
        }
        return 0;
    }
    leaveAssistChannel(channelId, uid) {
        if (typeof uid == "string") {
            uid = parseInt(uid);
        }
        return this.rtcEngine.leaveChannelEx({ localUid: uid, channelId });
    }
    closeAllAssistChannel() {
        this.m_assistChannelMap.forEach((assistConnection, key) => {
            this.rtcEngine.leaveChannelEx(assistConnection);
        });
        this.m_assistChannelMap.clear();
        return 0;
    }
    setClientRole(rol) {
        return this.rtcEngine.setClientRole(rol);
    }
    muteLocalAudioStream(mute) {
        console.log(" muteLocalAudioStream() .....", mute);
        this.m_stopAudioRecord = mute;
        return this.rtcEngine.muteLocalAudioStream(mute);
    }
    enableLoopbackRecording(enable, deviceName) {
        if (process.platform == "darwin" && !deviceName) {
            deviceName = "AgoraALD";
        }
        if (this.m_videoSourceConnection) {
            return this.rtcEngine.enableLoopbackRecordingEx(this.m_videoSourceConnection, enable, deviceName);
        }
    }
    enableLoopbackRecordingEx(conn, enable, deviceName) {
        if (process.platform == "darwin" && !deviceName) {
            deviceName = "AgoraALD";
        }
        return this.rtcEngine.enableLoopbackRecordingEx(conn, enable, deviceName);
    }
    addPublishStreamUrl(url, transcodingEnabled) {
        this.m_OnPublishStream = true;
        if (this.m_transcodingCfg) {
            return this.rtcEngine.startRtmpStreamWithTranscoding(url, this.m_transcodingCfg);
        }
        else {
            return this.rtcEngine.startRtmpStreamWithoutTranscoding(url);
        }
    }
    removePublishStreamUrl(url) {
        this.m_OnPublishStream = false;
        return this.rtcEngine.stopRtmpStream(url);
    }
    setLiveTranscoding(transcoding) {
        this.m_transcodingCfg = transcoding;
        if (this.m_OnPublishStream) {
            return this.rtcEngine.updateRtmpTranscoding(transcoding);
        }
        return 0;
    }
    setBeautyEffectOptions(enable, options) {
        if (this.isVirtualBackgroundSupported() ||
            !enable ||
            this.m_IgnoreFeatureSupporte) {
            return this.rtcEngine.setBeautyEffectOptions(enable, options);
        }
        return 0;
    }
    enableVirtualBackground(enabled, backgroundImage, backgroundColor = 0) {
        let bgSource = {};
        if (backgroundImage) {
            bgSource.background_source_type = 2;
            bgSource.source = backgroundImage;
            bgSource.color = 0;
        }
        else {
            bgSource.background_source_type = 1;
            bgSource.source = "";
            bgSource.color = backgroundColor;
        }
        if (this.isVirtualBackgroundSupported() ||
            !enabled ||
            this.m_IgnoreFeatureSupporte) {
            return this.rtcEngine.enableVirtualBackground(enabled, bgSource, undefined, undefined);
        }
        return 0;
    }
    setCloudProxy(type) {
        return this.rtcEngine.setCloudProxy(type);
    }
    sendMessage(msg, to) {
        return 0;
    }
    sendMessageEx(msg, to, conn) {
        return 0;
    }
    getRoomUsers() {
        return [];
    }
    getRoomUsersEx(conn) {
        return [];
    }
    setLocalVideoMirrorMode(mirrortype) {
        this.rtcEngine.enableLocalVideo(false);
        let code = this.rtcEngine.setLocalVideoMirrorMode(mirrortype);
        this.rtcEngine.enableLocalVideo(true);
        return code;
    }
    startAudioPlaybackDeviceTest(filepath) {
        return this.rtcEngine
            .getAudioDeviceManager()
            .startPlaybackDeviceTest(filepath);
    }
    stopAudioPlaybackDeviceTest() {
        return this.rtcEngine.getAudioDeviceManager().stopPlaybackDeviceTest();
    }
    startAudioRecordingDeviceTest(indicateInterval) {
        return this.rtcEngine
            .getAudioDeviceManager()
            .startRecordingDeviceTest(indicateInterval);
    }
    stopAudioRecordingDeviceTest() {
        return this.rtcEngine.getAudioDeviceManager().stopRecordingDeviceTest();
    }
    enableDualStreamMode(enable) {
        return this.rtcEngine.enableDualStreamMode(enable);
    }
    setDualStreamMode(mode, streamConfig) {
        return this.rtcEngine.setDualStreamMode(mode, streamConfig);
    }
    setRemoteDefaultVideoStreamType(streamType, channelId) {
        if (channelId) {
            let connection = this.m_assistChannelMap.get(channelId);
            if (connection) {
                return this.rtcEngine.updateChannelMediaOptionsEx({ defaultVideoStreamType: streamType }, connection);
            }
        }
        else {
            return this.rtcEngine.setRemoteDefaultVideoStreamType(streamType);
        }
    }
    setRemoteVideoStreamType(uid, streamType) {
        return this.rtcEngine.setRemoteVideoStreamType(uid, streamType);
    }
    isVirtualBackgroundSupported() {
        return (this.rtcEngine.isFeatureAvailableOnDevice(1) &&
            this.rtcEngine.isFeatureAvailableOnDevice(2));
    }
    setIgnoreFeatureSupported(ignore) {
        this.m_IgnoreFeatureSupporte = ignore;
        this.setParameters(`{\"che.video.lowest_dev_score_4_seg\":${ignore ? 0 : 65}}`);
        return 0;
    }
    isIgnoreFeatureSupported() {
        return this.m_IgnoreFeatureSupporte;
    }
    takeSnapshot(channel, uid, isScreenShare) {
        let pms = new Promise((resolve, reject) => {
            let fileDir;
            if (process.platform == "win32") {
                fileDir = "C:\\Windows\\Temp";
                if (!fs_1.default.existsSync(fileDir)) {
                    fs_1.default.mkdirSync(fileDir, { recursive: true });
                    if (!fs_1.default.existsSync(fileDir)) {
                        fileDir = undefined;
                    }
                }
            }
            if (!fileDir) {
                fileDir = path_1.default.join(this.m_logPath, `../../../files/images`);
            }
            if (!fs_1.default.existsSync(fileDir)) {
                fs_1.default.mkdirSync(fileDir, { recursive: true });
            }
            let filePath = path_1.default.join(fileDir, `img_${new Date().getTime()}.jpg`);
            if (typeof uid == "string") {
                uid = parseInt(uid);
            }
            this.rtcEngine.removeAllListeners("onSnapshotTaken");
            this.rtcEngine.addListener("onSnapshotTaken", (connection, uid2, filePath2, width, height, errCode) => {
                if (filePath != filePath2) {
                    reject(0);
                    return;
                }
                if (isScreenShare) {
                    this.rtcEngine.muteRemoteVideoStream(uid, true);
                }
                if (fs_1.default.existsSync(filePath)) {
                    let img = electron_1.nativeImage.createFromPath(filePath);
                    resolve({ success: true, data: img });
                    fs_1.default.unlinkSync(filePath);
                }
                else {
                    resolve({ success: false });
                }
            });
            if (isScreenShare) {
                let div = document.createElement("div");
                div.id = "tempCanvas";
                div.style.width = "400px";
                div.style.height = "300px";
                this.rtcEngine.setupRemoteVideoEx({ view: div, uid, renderMode: agora_electron_sdk_1.RenderModeType.RenderModeFit }, this.m_mainConnection);
                this.rtcEngine.muteRemoteVideoStream(uid, false);
                setTimeout(() => {
                    this.rtcEngine.takeSnapshot(uid, filePath);
                }, 200);
            }
            else {
                this.rtcEngine.takeSnapshot(uid, filePath);
            }
        });
        return pms;
    }
    onUserEnableLocalVideo(callback) {
        this.rtcEngine.addListener("onUserEnableLocalVideo", (connection, remoteUid, enabled) => {
            if (this.equalsConnection(connection, this.m_mainConnection)) {
                callback(remoteUid, enabled);
            }
            else {
                m_EventEmitter.emit(`assist_${connection.channelId}_remoteVideoStateChanged`, remoteUid, enabled ? 1 : 0, 0, 0);
            }
        });
        return this;
    }
    onUserEnableLocalVideoEx(callback) {
        this.rtcEngine.addListener("onUserEnableLocalVideo", (connection, remoteUid, enabled) => {
            callback(connection, remoteUid, enabled);
        });
        return this;
    }
    adjustRecordingSignalVolume(volume) {
        return this.rtcEngine.adjustRecordingSignalVolume(volume);
    }
    adjustPlaybackSignalVolume(volume) {
        return this.rtcEngine.adjustPlaybackSignalVolume(volume);
    }
    queryDeviceScore() {
        return this.rtcEngine.queryDeviceScore();
    }
    getVideoFrame(renderItem) {
        let channelId = this.m_mainConnection
            ? this.m_mainConnection.channelId
            : "";
        if (!renderItem.channelId) {
            renderItem.channelId = channelId;
        }
        let renderer = agora_electron_sdk_1.AgoraEnv.AgoraRendererManager?.renderers
            ?.get(renderItem.videoSourceType)
            ?.get(channelId)
            ?.get(renderItem.uid);
        if (renderer && renderer.shareVideoFrame) {
            Object.assign(renderItem, renderer.shareVideoFrame);
            return { ret: 0, isNewFrame: true };
        }
        if (renderItem.uid == 0) {
            renderer = agora_electron_sdk_1.AgoraEnv.AgoraRendererManager?.renderers
                ?.get(renderItem.videoSourceType)
                ?.get("")
                ?.get(renderItem.uid);
            if (renderer && renderer.shareVideoFrame) {
                Object.assign(renderItem, renderer.shareVideoFrame);
                return { ret: 0, isNewFrame: true };
            }
        }
        return agora_electron_sdk_1.AgoraEnv.AgoraElectronBridge.GetVideoFrame(renderItem);
    }
    enableVideoFrameCache(config) {
        if (!config.channelId) {
            let channelId = this.m_mainConnection
                ? this.m_mainConnection.channelId
                : "";
            config.channelId = channelId;
        }
        agora_electron_sdk_1.AgoraEnv.AgoraElectronBridge.EnableVideoFrameCache(config);
        return config;
    }
    onRtcEvent(key, callbck) {
        this.rtcEngine.addListener(key, callbck);
        return this;
    }
    onConnectionEvent(key, callbck) {
        return this;
    }
    onLocalVideoStateChanged(callback) {
        this.on("onLocalVideoStateChanged", callback);
        return this;
    }
    onRecordAudioFrame() { }
    setDirectCdnStreamingAudioConfiguration(profile) {
        return this.rtcEngine.setDirectCdnStreamingAudioConfiguration(profile);
    }
    setDirectCdnStreamingVideoConfiguration(config) {
        return this.rtcEngine.setDirectCdnStreamingVideoConfiguration(config);
    }
    startDirectCdnStreaming(eventHandler, publishUrl, options) {
        return this.rtcEngine.startDirectCdnStreaming(eventHandler, publishUrl, options);
    }
    stopDirectCdnStreaming() {
        return this.rtcEngine.stopDirectCdnStreaming();
    }
    getRtcEngin() {
        return this.rtcEngine;
    }
    getSdkType() {
        return 0;
    }
    getMethodNameList() {
        const allKey = Reflect.ownKeys(AgoraSdk.prototype).filter((key) => key != "constructor" &&
            key != "getMethodNameList" &&
            typeof AgoraSdk.prototype[key] === "function");
        return allKey;
    }
    createDataStream(config) {
        return this.rtcEngine?.createDataStream(config);
    }
    createDataChannel(conn) {
        return 0;
    }
    subscribeData(conn, topicName) {
        return 0;
    }
    unsubscribeData(conn, topicName) {
        return 0;
    }
    deleteDataChannel(conn) {
        return 0;
    }
    setScreenShareSceneMode(screenMode) {
        return this.setScreenShareSceneModeEx(undefined, screenMode);
    }
    setScreenShareSceneModeEx(conn, screenMode) {
        return this.rtcEngine?.setScreenCaptureScenario(screenMode == 1 ? 3 : 1);
    }
    followSystemPlaybackDevice(enable) {
        return this.rtcEngine
            ?.getAudioDeviceManager()
            .followSystemPlaybackDevice(enable);
    }
    followSystemRecordingDevice(enable) {
        return this.rtcEngine
            ?.getAudioDeviceManager()
            .followSystemRecordingDevice(enable);
    }
    getRecordingDeviceVolume() {
        return 0;
    }
    getPlaybackDeviceVolume() {
        return 0;
    }
    enableAINSModeEx(conn, enable) {
        return 0;
    }
    setAutoSubscribeAudio(autoSubscribeAudio) {
        return;
    }
}
function dateFormat(date, fmt) {
    let o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "H+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "S+": date.getMilliseconds(),
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1
                ? o[k]
                : ("00" + o[k]).substr(String(o[k]).length));
        }
    }
    return fmt;
}
exports.default = AgoraSdk;
//# sourceMappingURL=AgoraSdk.js.map