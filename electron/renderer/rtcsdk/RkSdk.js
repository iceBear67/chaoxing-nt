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
Object.defineProperty(exports, "__esModule", { value: true });
const rk_clound_conference_extend_1 = require("./rkExtend/rk_clound_conference_extend");
const rk_sdk = __importStar(require("./rkExtend/rk_clound_conference_extend"));
const path = require("path");
const fs = require("fs");
const RtcErrorCode_1 = require("./RtcErrorCode");
const events_1 = require("events");
const m_EventEmitter = new events_1.EventEmitter();
const electron_1 = require("electron");
class ScreenShareSrcInfo {
    constructor() {
        this.isScreenShare = true;
    }
}
const m_ScreenShareSrcInfo = new ScreenShareSrcInfo();
const m_ScreenShareSrcInfos = [];
function getScreenShareSrcInfoByRtcConnection(connection) {
    let tempObj = m_ScreenShareSrcInfos.find((item) => {
        item.connection.channelId === connection.channelId &&
            item.connection.localUid === connection.localUid;
    });
    if (tempObj) {
        return tempObj.screenShareSrcInfo;
    }
    let screenShareSrcInfo = new ScreenShareSrcInfo();
    m_ScreenShareSrcInfos.push({
        connection: connection,
        screenShareSrcInfo: screenShareSrcInfo,
    });
    return screenShareSrcInfo;
}
class ErrorMap {
    constructor() {
        this.mErrors = new Map();
        this.mErrors.set(0, 0);
        this.mErrors.set(1, -1);
        this.mErrors.set(2, -402);
        this.mErrors.set(3, -2);
        this.mErrors.set(4, -7);
        this.mErrors.set(5, -113);
        this.mErrors.set(6, -17);
        this.mErrors.set(7, -1);
        this.mErrors.set(8, -1);
        this.mErrors.set(9, -17);
        this.mErrors.set(10, -1);
        this.mErrors.set(11, -1);
        this.mErrors.set(12, -1);
        this.mErrors.set(13, -1);
        this.mErrors.set(14, -1);
        this.mErrors.set(15, -1);
        this.mErrors.set(16, -1);
        this.mErrors.set(17, -1);
        this.mErrors.set(18, -1);
        this.mErrors.set(19, -1);
        this.mErrors.set(20, -1);
        this.mErrors.set(21, -1);
    }
    getErrorCode(rkCode) {
        if (this.mErrors.has(rkCode)) {
            return this.mErrors.get(rkCode);
        }
        else {
            return -1;
        }
    }
}
const RtcErrorMap = new Map();
function initRtcErrorMap() {
    RtcErrorMap.set(1, RtcErrorCode_1.ErrorCode.operation_failed);
    RtcErrorMap.set(2, RtcErrorCode_1.ErrorCode.no_network);
    RtcErrorMap.set(3, RtcErrorCode_1.ErrorCode.params_error);
    RtcErrorMap.set(4, RtcErrorCode_1.ErrorCode.sdk_uninit);
    RtcErrorMap.set(5, RtcErrorCode_1.ErrorCode.not_started);
    RtcErrorMap.set(6, RtcErrorCode_1.ErrorCode.exist_meeting);
    RtcErrorMap.set(7, RtcErrorCode_1.ErrorCode.user_not_exist);
    RtcErrorMap.set(8, RtcErrorCode_1.ErrorCode.not_implemented);
    RtcErrorMap.set(9, RtcErrorCode_1.ErrorCode.joinroom_error);
    RtcErrorMap.set(10, RtcErrorCode_1.ErrorCode.publish_audiostream_error);
    RtcErrorMap.set(11, RtcErrorCode_1.ErrorCode.publish_camerastream_error);
    RtcErrorMap.set(12, RtcErrorCode_1.ErrorCode.publish_sharestream_error);
    RtcErrorMap.set(13, RtcErrorCode_1.ErrorCode.unpublish_audiostream_error);
    RtcErrorMap.set(14, RtcErrorCode_1.ErrorCode.unpublish_camerastream_error);
    RtcErrorMap.set(15, RtcErrorCode_1.ErrorCode.unpublish_sharestream_error);
    RtcErrorMap.set(16, RtcErrorCode_1.ErrorCode.subscriber_audiostream_error);
    RtcErrorMap.set(17, RtcErrorCode_1.ErrorCode.subscriber_camerastream_error);
    RtcErrorMap.set(18, RtcErrorCode_1.ErrorCode.subscriber_sharestream_error);
    RtcErrorMap.set(19, RtcErrorCode_1.ErrorCode.unsubscriber_audiostream_error);
    RtcErrorMap.set(20, RtcErrorCode_1.ErrorCode.unsubscriber_camerastream_error);
    RtcErrorMap.set(21, RtcErrorCode_1.ErrorCode.unsubscriber_sharestream_error);
    RtcErrorMap.set(22, RtcErrorCode_1.ErrorCode.meetint_not_exist);
    RtcErrorMap.set(23, RtcErrorCode_1.ErrorCode.enable_loopback_audio_error);
    RtcErrorMap.set(24, RtcErrorCode_1.ErrorCode.disable_loopback_audio_error);
}
class RkSdk extends events_1.EventEmitter {
    constructor() {
        super();
        this.m_ErrorMap = new ErrorMap();
        this.m_localVideoEnabled = false;
        this.m_isMuteLocalVideoStream = false;
        this.m_onPreview = false;
        this.m_isFollowSystemPlaybackDevice = true;
        this.m_isFollowSystemRecordingDevice = true;
        this.m_assistChannelMap = new Map();
        this.m_AutoSubscribeAudio = true;
        this.windowsInfoCache = { cacheTime: 0, data: null };
    }
    updateChannelMediaOptions(options) {
        return 0;
    }
    updateChannelMediaOptionsEx(conn, options) {
        return 0;
    }
    setAutoSubscribeAudio(autoSubscribeAudio) {
        this.m_AutoSubscribeAudio = autoSubscribeAudio;
    }
    onJoinedChannel(callback) {
        this.removeAllListeners("onJoinedChannel");
        this.on("onJoinedChannel", callback);
        return this;
    }
    onJoinedChannelEx(callback) {
        this.on("onJoinedChannelEx", callback);
        return this;
    }
    onRejoinedChannel(callback) {
        this.removeAllListeners("onRejoinedChannel");
        this.on("onRejoinedChannel", callback);
        return this;
    }
    onLeaveChannel(callback) {
        this.on("onLeaveChannel", (channel, uid) => {
            callback(channel, uid);
        });
        return this;
    }
    onLeaveChannelEx(callback) {
        this.on("onLeaveChannelEx", (channel, uid) => {
            callback(channel, uid);
        });
        return this;
    }
    onUserJoined(callback) {
        this.removeAllListeners("onUserJoined");
        this.on("onUserJoined", callback);
        return this;
    }
    onUserJoinedEx(callback) {
        this.on("onUserJoinedEx", callback);
        return this;
    }
    onUserOffline(callback) {
        this.removeAllListeners("onUserOffline");
        this.on("onUserOffline", callback);
        return this;
    }
    onUserOfflineEx(callback) {
        this.on("onUserOfflineEx", callback);
        return this;
    }
    onRemoveStream(callback) {
        this.removeAllListeners("onRemoveStream");
        this.on("onRemoveStream", callback);
        return this;
    }
    onError(callback) {
        this.removeAllListeners("onError");
        this.on("onError", callback);
        return this;
    }
    onGroupAudioVolumeIndication(callback) {
        this.removeAllListeners("onGroupAudioVolumeIndication");
        this.on("onGroupAudioVolumeIndication", callback);
        return this;
    }
    onRemoteAudioStateChanged(callback) {
        this.removeAllListeners("onRemoteAudioStateChanged");
        this.on("onRemoteAudioStateChanged", callback);
        return this;
    }
    onRemoteAudioStateChangedEx(callback) {
        this.removeAllListeners("onRemoteAudioStateChangedEx");
        this.on("onRemoteAudioStateChangedEx", callback);
        return this;
    }
    onRemoteVideoStateChanged(callback) {
        this.removeAllListeners("onRemoteVideoStateChanged");
        this.on("onRemoteVideoStateChanged", callback);
        return this;
    }
    onRemoteVideoStateChangedEx(callback) {
        this.on("onRemoteVideoStateChangedEx", callback);
        return this;
    }
    onRemoteScreenShareStateChanged(callback) {
        this.removeAllListeners("onRemoteScreenShareStateChanged");
        this.on("onRemoteScreenShareStateChanged", callback);
        return this;
    }
    onRemoteScreenShareStateChangedEx(callback) {
        this.on("onRemoteScreenShareStateChangedEx", callback);
        return this;
    }
    onUserMuteVideo(callback) {
        this.removeAllListeners("onUserMuteVideo");
        this.on("onUserMuteVideo", callback);
        return this;
    }
    onUserMuteAudioEx(callback) {
        return this;
    }
    onNetworkQuality(callback) {
        this.removeAllListeners("onNetworkQuality");
        this.on("onNetworkQuality", callback);
        return this;
    }
    onNetworkQualityEx(callback) {
        this.on("onNetworkQualityEx", callback);
        return this;
    }
    onConnectionStateChanged(callback) {
        this.removeAllListeners("onConnectionStateChanged");
        this.on("onConnectionStateChanged", callback);
        return this;
    }
    onConnectionLost(callback) {
        this.removeAllListeners("onConnectionLost");
        this.on("onConnectionLost", callback);
        return this;
    }
    onRtcStats(callback) {
        this.removeAllListeners("onRtcStats");
        this.on("onRtcStats", callback);
        return this;
    }
    onTokenPrivilegeWillExpire(callback) {
        this.removeAllListeners("onTokenPrivilegeWillExpire");
        this.on("onTokenPrivilegeWillExpire", callback);
        return this;
    }
    onTokenPrivilegeWillExpireEx(callback) {
        return this;
    }
    onVideoSourceRequestNewToken(callback) {
        this.removeAllListeners("onVideoSourceRequestNewToken");
        this.on("onVideoSourceRequestNewToken", callback);
        return this;
    }
    onRtmpStreamingEvent(callback) {
        this.removeAllListeners("onRtmpStreamingEvent");
        this.on("onRtmpStreamingEvent", callback);
        return this;
    }
    onRtmpStreamingStateChanged(callback) {
        this.removeAllListeners("onRtmpStreamingStateChanged");
        this.on("onRtmpStreamingStateChanged", callback);
        return this;
    }
    onMessage(callback) {
        this.removeAllListeners("onMessage");
        this.on("onMessage", callback);
        return this;
    }
    onNetworkTypeChanged(callback) {
        return this;
    }
    onRepeatLogin(callback) {
        this.removeAllListeners("onRepeatLogin");
        this.on("onRepeatLogin", callback);
        return this;
    }
    onRoomStateChange(callback) {
        this.removeAllListeners("onRoomStateChange");
        this.on("onRoomStateChange", callback);
        return this;
    }
    onAudioDeviceStateChanged(callback) {
        this.removeAllListeners("onAudioDeviceStateChanged");
        this.on("onAudioDeviceStateChanged", callback);
        return this;
    }
    onVideoDeviceStateChanged(callback) {
        this.removeAllListeners("onVideoDeviceStateChanged");
        this.on("onVideoDeviceStateChanged", callback);
        return this;
    }
    onRtcError(callback) {
        m_EventEmitter.on("rtcError", callback);
        return this;
    }
    onUserEnableLocalVideo(callback) {
        return this;
    }
    onUserEnableLocalVideoEx(callback) {
        return this;
    }
    initCallback() {
        rk_sdk.onRtcStats((conn, rtcStats) => {
            if ((0, rk_clound_conference_extend_1.isMainConnection)(conn)) {
                this.emit("onRtcStats", rtcStats);
            }
        });
        rk_sdk.onNetworkQuality((conn, pUserName, txQualityValue, rxQualityValue) => {
            if ((0, rk_clound_conference_extend_1.isMainConnection)(conn) && pUserName == this.m_myUid) {
                this.emit("onNetworkQuality", this.m_myUid, txQualityValue, rxQualityValue, conn.channelId);
            }
            this.emit("onNetworkQualityEx", conn, pUserName, txQualityValue, rxQualityValue);
        });
        rk_sdk.onActiveSpeaker((conn, pUserName, volume) => {
            if (!(0, rk_clound_conference_extend_1.isMainConnection)(conn)) {
                return;
            }
            console.debug("onActiveSpeaker", pUserName, volume);
            let speakers = [{ uid: pUserName, volume: volume, vad: 0 }];
            this.emit("onGroupAudioVolumeIndication", speakers, 1, volume);
        });
        rk_sdk.onRoomMemberStateChange((conn, pUsername, userState) => {
            console.debug("onRoomMemberStateChange:", pUsername, userState);
            if (userState == 1) {
                this.emit("onUserJoinedEx", conn, pUsername, 1);
            }
            else if (userState == 2) {
                this.emit("onUserOfflineEx", conn, pUsername, undefined);
            }
            else if (userState == 3) {
                this.emit("onRemoteAudioStateChangedEx", conn, pUsername, 1, 0, 1);
            }
            else if (userState == 6) {
                this.emit("onRemoteAudioStateChangedEx", conn, pUsername, 0, 0, 1);
            }
            else if (userState == 9) {
                this.emit("onRemoteAudioStateChangedEx", conn, pUsername, 0, 0, 1);
            }
            else if (userState == 10) {
                this.emit("onRemoteAudioStateChangedEx", conn, pUsername, 1, 0, 1);
            }
            else if (userState == 11) {
                this.emit("onRemoteAudioStateChangedEx", conn, pUsername, 0, 0, 1);
            }
            else if (userState == 12) {
                this.emit("onRemoteAudioStateChangedEx", conn, pUsername, 1, 0, 1);
            }
            else if (userState == 4) {
                this.emit("onRemoteVideoStateChangedEx", conn, pUsername, 1, 0, 1);
            }
            else if (userState == 5) {
                this.emit("onRemoteScreenShareStateChangedEx", conn, pUsername, 1, 0);
            }
            else if (userState == 7) {
                this.emit("onRemoteVideoStateChangedEx", conn, pUsername, 0, 0, 1);
            }
            else if (userState == 8) {
                this.emit("onRemoteScreenShareStateChangedEx", conn, pUsername, 0, 0);
            }
            else if (userState == 13) {
                this.emit("onRemoteVideoStateChangedEx", conn, pUsername, 0, 0, 1);
            }
            else if (userState == 14) {
                this.emit("onRemoteVideoStateChangedEx", conn, pUsername, 1, 0, 1);
            }
            else if (userState == 15) {
                this.emit("onRemoteVideoStateChangedEx", conn, pUsername, 0, 0, 1);
            }
            else if (userState == 16) {
                this.emit("onRemoteVideoStateChangedEx", conn, pUsername, 1, 0, 1);
            }
            else if (userState == 17) {
                this.emit("onUserOfflineEx", conn, pUsername, 11);
            }
            if (!(0, rk_clound_conference_extend_1.isMainConnection)(conn)) {
                if (userState == 1) {
                    if (pUsername == this.m_myUid) {
                        this.emit("onJoinedChannelEx", conn.channelId, this.m_myUid, 1);
                    }
                    this.emit("onUserJoined", pUsername, 1, conn);
                }
                else if (userState == 2) {
                    this.emit("onUserOffline", pUsername, undefined, conn);
                    if (pUsername == this.m_myUid) {
                        this.emit("onLeaveChannelEx", conn.channelId, this.m_myUid);
                    }
                }
                else if (userState == 3) {
                    if (this.m_AutoSubscribeAudio) {
                        rk_sdk.enableSubscribeAudioStreamEx(conn, true, pUsername + "");
                    }
                }
                else if (userState == 4) {
                }
                else if (userState == 5) {
                    this.emit(`assist_${conn.channelId}_onRemoteScreenShareStateChanged`, pUsername, 1, 0);
                }
                else if (userState == 8) {
                    this.emit(`assist_${conn.channelId}_onRemoteScreenShareStateChanged`, pUsername, 0, 0);
                }
                return;
            }
            if (userState == 1) {
                if (pUsername == this.m_myUid) {
                    this.emit("onJoinedChannel", conn.channelId, this.m_myUid, 1);
                    this.emit("onJoinedChannelEx", conn.channelId, this.m_myUid, 1);
                }
                else {
                    this.emit("onUserJoined", pUsername, 1);
                }
            }
            else if (userState == 2) {
                this.emit("onUserOffline", pUsername, undefined);
                if (pUsername == this.m_myUid) {
                    this.emit("onLeaveChannel", "", "");
                    this.emit("onLeaveChannelEx", conn.channelId, this.m_myUid);
                }
            }
            else if (userState == 3) {
                if (this.m_AutoSubscribeAudio) {
                    rk_sdk.enableSubscribeAudioStream(true, pUsername + "");
                }
                this.emit("onRemoteAudioStateChanged", pUsername, 1, 0, 1);
            }
            else if (userState == 4) {
                this.emit("onRemoteVideoStateChanged", pUsername, 1, 0, 1);
            }
            else if (userState == 5) {
                this.emit("onRemoteScreenShareStateChanged", pUsername, 1, 0);
            }
            else if (userState == 6) {
                this.emit("onRemoteAudioStateChanged", pUsername, 0, 0, 1);
            }
            else if (userState == 7) {
                this.emit("onRemoteVideoStateChanged", pUsername, 0, 0, 1);
            }
            else if (userState == 8) {
                this.emit("onRemoteScreenShareStateChanged", pUsername, 0, 0);
            }
            else if (userState == 9) {
                this.emit("onRemoteAudioStateChanged", pUsername, 0, 0, 1);
            }
            else if (userState == 10) {
                this.emit("onRemoteAudioStateChanged", pUsername, 1, 0, 1);
            }
            else if (userState == 11) {
                this.emit("onRemoteAudioStateChanged", pUsername, 0, 0, 1);
            }
            else if (userState == 12) {
                this.emit("onRemoteAudioStateChanged", pUsername, 1, 0, 1);
            }
            else if (userState == 13) {
                this.emit("onRemoteVideoStateChanged", pUsername, 0, 0, 1);
            }
            else if (userState == 14) {
                this.emit("onRemoteVideoStateChanged", pUsername, 1, 0, 1);
            }
            else if (userState == 15) {
                this.emit("onRemoteVideoStateChanged", pUsername, 0, 0, 1);
            }
            else if (userState == 16) {
                this.emit("onRemoteVideoStateChanged", pUsername, 1, 0, 1);
            }
            else if (userState == 17) {
                this.emit("onUserOffline", pUsername, 11);
            }
        });
        rk_sdk.onRoomStateChange((conn, state) => {
            if (!(0, rk_clound_conference_extend_1.isMainConnection)(conn)) {
                return;
            }
            if (state == 1) {
            }
            else if (state == 2) {
            }
            else if (state == 3) {
            }
            else if (state == 4) {
            }
            else if (state == 5) {
            }
            else if (state == 6) {
            }
            else if (state == 7) {
            }
            this.emit("onRoomStateChange", state);
        });
        rk_sdk.onRoomError((conn, errCode, reason) => {
            if (!(0, rk_clound_conference_extend_1.isMainConnection)(conn)) {
                return;
            }
            let newErrCode = this.m_ErrorMap.getErrorCode(errCode);
            this.emit("onError", newErrCode, reason);
            let rtcErrorCode = RtcErrorMap.get(errCode);
            m_EventEmitter.emit("rtcError", rtcErrorCode, errCode, reason);
        });
        rk_sdk.onMessage((conn, msg) => {
            this.emit("onMessage", msg, conn);
        });
        rk_sdk.onAudioDeviceStateChange((conn, deviceId, deviceType, deviceState) => {
            if (!(0, rk_clound_conference_extend_1.isMainConnection)(conn)) {
                return;
            }
            this.emit("onAudioDeviceStateChanged", deviceId, deviceType, deviceState);
        });
        rk_sdk.onVideoDeviceStateChange((conn, deviceId, deviceType, deviceState) => {
            if (!(0, rk_clound_conference_extend_1.isMainConnection)(conn)) {
                return;
            }
            this.emit("onVideoDeviceStateChanged", deviceId, deviceType, deviceState);
        });
        rk_sdk.onRepeatLogin(() => {
            console.log("rk_sdk.onRepeatLogin");
            this.emit("onRepeatLogin");
        });
        rk_sdk.OnAudioStateChanged((conn, pUsername, aState) => {
            if (!(0, rk_clound_conference_extend_1.isMainConnection)(conn)) {
                return;
            }
            let audioState = 0;
            if (aState == 2) {
                audioState = 1;
            }
            else if (aState == 3) {
                audioState = 3;
            }
            this.emit("onRemoteAudioStateChanged", pUsername, audioState, 0, 1);
        });
        rk_sdk.OnVideoStateChanged((conn, pUsername, vType, vState, stateErr) => {
            this.emit("onVideoStateChangedEx", conn, pUsername, vType, vState, stateErr);
            if ((0, rk_clound_conference_extend_1.isMainConnection)(conn)) {
                this.emit("onVideoStateChanged", pUsername, vType, vState, stateErr);
            }
            let videoState = 1;
            if (vState == 2) {
                videoState = 1;
            }
            else if (vState == 3) {
                videoState = 3;
            }
            if (vType == 1) {
                if (vState == 1) {
                    return;
                }
                if ((0, rk_clound_conference_extend_1.isMainConnection)(conn)) {
                    if (videoState != 1) {
                        this.emit("onRemoteVideoStateChanged", pUsername, videoState, stateErr, 1);
                    }
                }
                if (videoState != 1) {
                    this.emit("onRemoteVideoStateChangedEx", conn, pUsername, videoState, stateErr, 1);
                }
            }
            else {
                if (vState == 4) {
                    videoState = 0;
                }
                if (vState == 5) {
                    videoState = 2;
                }
                if ((0, rk_clound_conference_extend_1.isMainConnection)(conn)) {
                    if (videoState != 1) {
                        this.emit("onRemoteScreenShareStateChanged", pUsername, videoState, stateErr);
                    }
                }
                if (videoState != 1) {
                    this.emit("onRemoteScreenShareStateChangedEx", conn, pUsername, videoState, stateErr);
                }
            }
        });
        rk_sdk.onAudioDefaultDeviceChanged((devType) => {
            if (devType == 1) {
                if (this.m_isFollowSystemRecordingDevice) {
                    let devList = this.getAudioRecordingDevices();
                    let defaultDev = devList.find((dev) => dev.isSystemDefault == 1);
                    if (defaultDev) {
                        this.setAudioRecordingDevice(defaultDev.deviceid);
                    }
                }
            }
            else {
                if (this.m_isFollowSystemPlaybackDevice) {
                    let devList = this.getAudioPlaybackDevices();
                    let defaultDev = devList.find((dev) => dev.isSystemDefault == 1);
                    if (defaultDev) {
                        this.setAudioPlaybackDevice(defaultDev.deviceid);
                    }
                }
            }
        });
    }
    clearOldLogs(logPath) {
        let deleteBeforeTime = new Date().getTime() - 60 * 24 * 60 * 60 * 1000;
        let childFiles = fs.readdirSync(logPath, { encoding: "utf8" });
        childFiles.forEach((file) => {
            let filePath = path.join(logPath, file);
            let fileStat = fs.statSync(filePath);
            if (fileStat.isFile()) {
                if (fileStat.mtimeMs < deleteBeforeTime) {
                    fs.unlinkSync(filePath);
                }
            }
            else if (fileStat.isDirectory()) {
                this.clearOldLogs(filePath);
            }
        });
    }
    initialize(appid, userInfo, token, areaCode, logConfig) {
        if (!logConfig) {
            logConfig = { filePath: this.m_LogPath };
        }
        this.m_UserInfo = userInfo;
        return this.initialize2(appid, userInfo, userInfo.password, areaCode, logConfig);
    }
    initialize2(appid, userInfo, token, areaCode, logConfig) {
        this.m_myUid = userInfo.userId;
        this.m_LogPath = logConfig.filePath;
        if (!fs.existsSync(this.m_LogPath)) {
            fs.mkdirSync(this.m_LogPath, { recursive: true });
        }
        this.clearOldLogs(this.m_LogPath);
        console.log("rk_sdk.setLogFilePath:", this.m_LogPath);
        this.initCallback();
        return rk_sdk.init(logConfig.filePath, userInfo.userId, token, userInfo.userName);
    }
    initialize3(options) {
        return this.initialize2(options.appid, { userId: options.userId, userName: options.userName }, options.token, options.areaCode, options.logConfig);
    }
    muteRemoteVideoStream(uid, mute) {
        return rk_sdk.enableSubscribeVideoStream(!mute, uid + "", true);
    }
    muteRemoteAudioStream(uid, mute) {
        return rk_sdk.enableSubscribeAudioStream(!mute, uid + "");
    }
    muteRemoteVideoStreamEx(uid, mute, connection) {
        return rk_sdk.enableSubscribeVideoStreamEx(connection, !mute, uid + "", true);
    }
    muteRemoteAudioStreamEx(uid, mute, connection) {
        return rk_sdk.enableSubscribeAudioStreamEx(connection, !mute, uid + "");
    }
    muteScreenShareStream(uid, mute) {
        return rk_sdk.enableSubscribeVideoStream(!mute, uid + "", false);
    }
    muteScreenShareStreamEx(uid, mute, conn) {
        return rk_sdk.enableSubscribeVideoStreamEx(conn, !mute, uid + "", false);
    }
    setLogPath(logPath) {
        this.m_LogPath = logPath;
        return 0;
    }
    setupLocalVideo(view, options) {
        rk_sdk.setVideoElement(this.m_myUid, view, 0, true);
        return 0;
    }
    subscribe(uid, view, options, isScreenShare) {
        if (!view) {
            return 0;
        }
        let ret = rk_sdk.enableSubscribeVideoStream(true, uid + "", !isScreenShare);
        rk_sdk.setVideoElement(uid + "", view, isScreenShare ? 2 : 0, true);
        return ret;
    }
    subscribeEx(conn, uid, view, options, isScreenShare) {
        if (!view) {
            return 0;
        }
        let ret = rk_sdk.enableSubscribeVideoStreamEx(conn, true, uid + "", !isScreenShare);
        rk_sdk.setVideoElementEx(uid + "", view, isScreenShare ? 2 : 0, conn, true);
        return ret;
    }
    setChannelProfile(profile) {
        return 0;
    }
    getCurrentAudioRecordingDevice() {
        return rk_sdk.getCurrentAudioCaptureDevice();
    }
    getCurrentAudioPlaybackDevice() {
        return rk_sdk.getCurrentSpeakerDevice();
    }
    getCurrentVideoDevice() {
        return rk_sdk.getCurrentCameraDevice();
    }
    setAudioPlaybackDevice(deviceId) {
        return rk_sdk.setSpeakerDevice(deviceId);
    }
    setAudioRecordingDevice(deviceId) {
        return rk_sdk.setAudioCaptureDevice(deviceId);
    }
    setVideoDevice(deviceId) {
        return rk_sdk.setCameraDevice(deviceId);
    }
    getAudioPlaybackDevices() {
        let devs = rk_sdk.enumSpeakerDevice();
        return devs;
    }
    getAudioRecordingDevices() {
        let devs = rk_sdk.enumAudioCaptureDevice();
        return devs;
    }
    getVideoDevices() {
        return rk_sdk.enumCameraDevice();
    }
    converImageToBase64(data) {
        if (!data) {
            return;
        }
        let img = electron_1.nativeImage.createFromBuffer(data);
        return img.toDataURL();
    }
    getScreenWindowsInfo() {
        let pms = new Promise((resolve, reject) => {
            let dataInfos = rk_sdk.enumScreenAndWindow();
            let displaysInfo = new Array();
            let windowsInfo = new Array();
            if (dataInfos) {
                dataInfos.forEach((dataInfo) => {
                    if (dataInfo.type == 1) {
                        let displayInfo = {};
                        displayInfo.name = dataInfo.name;
                        displayInfo.base64Src = this.converImageToBase64(dataInfo.thumbnailData);
                        displayInfo.displayId = {};
                        displayInfo.displayId.id = dataInfo.id;
                        displayInfo.displayId.x = displayInfo.x = dataInfo.x;
                        displayInfo.displayId.y = displayInfo.y = dataInfo.y;
                        displayInfo.displayId.width = displayInfo.width = dataInfo.width;
                        displayInfo.displayId.height = displayInfo.height = dataInfo.height;
                        displaysInfo.push(displayInfo);
                    }
                    else if (dataInfo.type == 2) {
                        if (dataInfo.name != "StatusIndicator") {
                            let windowInfo = {};
                            windowInfo.windowId = dataInfo.id;
                            windowInfo.name = dataInfo.name;
                            windowInfo.base64Src = this.converImageToBase64(dataInfo.thumbnailData);
                            windowInfo.width = dataInfo.thumbnailWidth;
                            windowInfo.height = dataInfo.thumbnailHeight;
                            windowInfo.x = dataInfo.x;
                            windowInfo.y = dataInfo.y;
                            windowInfo.originWidth = dataInfo.width;
                            windowInfo.originHeight = dataInfo.height;
                            windowsInfo.push(windowInfo);
                        }
                    }
                });
            }
            resolve({ displaysInfo, windowsInfo });
        });
        return pms;
    }
    enableAudio() {
        return 0;
    }
    enableVideo() {
        return 0;
    }
    enableLocalVideo(enable) {
        if (this.m_onPreview) {
            rk_sdk.stopPreview();
        }
        let ret = rk_sdk.enablePublishVideoStream(enable);
        if (ret == 0) {
            if (!enable && this.m_onPreview) {
                rk_sdk.startPreview();
            }
            this.m_localVideoEnabled = enable;
            if (!enable) {
                rk_sdk.stopRenderCanvas(this.m_myUid + "", 0);
            }
            this.emit("onRemoteVideoStateChanged", this.m_myUid + "", enable ? 1 : 0, 0, 1);
        }
        return ret;
    }
    enableLocalAudio(enable) {
        return rk_sdk.enablePublishAudioStream(enable);
    }
    enableSubscribe(enableAudio, enableVideo) {
        return rk_sdk.enableSubscribe(enableAudio, enableVideo);
    }
    setAudioProfile(profile, scenario) {
        return 0;
    }
    enableAudioVolumeIndication(interval, smooth, report_vad) {
        return rk_sdk.enableAudioVolumeIndication(true, interval);
    }
    setVideoEncoderConfiguration(config) {
        let videoQuality = 1;
        if (config) {
            let cfg = config;
            let minSize = cfg.width;
            if (cfg.height > minSize) {
                minSize = cfg.height;
            }
            if (minSize > 1000) {
                videoQuality = 4;
            }
            else if (minSize > 700) {
                videoQuality = 3;
            }
            else if (minSize > 300) {
                videoQuality = 2;
            }
        }
        return rk_sdk.setVideoQuality(videoQuality);
    }
    startPreview() {
        return rk_sdk.startPreview();
    }
    stopPreview() {
        return rk_sdk.stopPreview();
    }
    openPreview() {
        let ret = rk_sdk.startPreview();
        if (ret == 0) {
            this.m_onPreview = true;
        }
        return ret;
    }
    closePreview() {
        let ret = rk_sdk.stopPreview();
        if (ret == 0) {
            this.m_onPreview = false;
        }
        return ret;
    }
    joinChannel(token, channel, name, uid, options) {
        rk_sdk.setReconnectResumedMediaType(true, true, true);
        rk_sdk.setVideoQuality(2);
        rk_sdk.enablePublish(false, false);
        if (!token) {
            token = this.m_UserInfo?.password;
        }
        return rk_sdk.joinRoom(channel);
    }
    joinChannelEx(token, channel, name, uid, options) {
        if (!token) {
            token = this.m_UserInfo?.password;
        }
        uid += "";
        if (options && typeof options == "object") {
            options = JSON.stringify(options);
        }
        return rk_sdk.joinRoomEx(uid, token, name, channel, options);
    }
    setParameters(param) {
        return 0;
    }
    setScreenCaptureScenario(screenScenario) {
        return 0;
    }
    startScreenShare(screenType, winInfo, screenToken, scrennUserId, screenConfig) {
        this.m_ScreenUserId = scrennUserId;
        let pms = new Promise((resolve, reject) => {
            let retCode;
            let resolution = 1080;
            if (screenConfig?.height == 720 || screenConfig?.width == 720) {
                resolution = 720;
            }
            this.m_ScreenShareType = screenType;
            if (screenType == 1) {
                if (winInfo.id != undefined) {
                    winInfo = winInfo.id;
                }
                m_ScreenShareSrcInfo.devId = winInfo;
                m_ScreenShareSrcInfo.isScreenShare = true;
                m_ScreenShareSrcInfo.resolution = resolution;
                m_ScreenShareSrcInfo.option = screenConfig;
                retCode = rk_sdk.startScreenShare(winInfo, resolution, screenConfig);
            }
            else if (screenType == 2) {
                m_ScreenShareSrcInfo.devId = winInfo;
                m_ScreenShareSrcInfo.isScreenShare = false;
                m_ScreenShareSrcInfo.resolution = resolution;
                retCode = rk_sdk.startScreenWindowShare(winInfo, resolution);
            }
            resolve(retCode);
            if (retCode != 0) {
                console.warn("开启共享屏幕失败:" + retCode);
            }
        });
        return pms;
    }
    startScreenShare2(screenType, channelCode, winInfo, screenToken, scrennUserId, screenConfig) {
        return this.startScreenShare(screenType, winInfo, screenToken, scrennUserId, screenConfig);
    }
    startScreenShare2Ex(conn, screenType, channelCode, winInfo, screenToken, scrennUserId, screenConfig) {
        this.m_ScreenUserId = scrennUserId;
        let pms = new Promise((resolve, reject) => {
            let retCode;
            let resolution = 1080;
            if (screenConfig?.height == 720 || screenConfig?.width == 720) {
                resolution = 720;
            }
            let curScreenShareSrcInfo = getScreenShareSrcInfoByRtcConnection(conn);
            this.m_ScreenShareType = screenType;
            if (screenType == 1) {
                if (winInfo.id != undefined) {
                    winInfo = winInfo.id;
                }
                curScreenShareSrcInfo.devId = winInfo;
                curScreenShareSrcInfo.isScreenShare = true;
                curScreenShareSrcInfo.resolution = resolution;
                curScreenShareSrcInfo.option = screenConfig;
                retCode = rk_sdk.startScreenShareEx(conn, winInfo, resolution, screenConfig);
            }
            else if (screenType == 2) {
                curScreenShareSrcInfo.devId = winInfo;
                curScreenShareSrcInfo.isScreenShare = false;
                curScreenShareSrcInfo.resolution = resolution;
                retCode = rk_sdk.startScreenWindowShareEx(conn, winInfo, resolution);
            }
            resolve(retCode);
            if (retCode != 0) {
                console.warn("开启共享屏幕失败:" + retCode);
            }
        });
        return pms;
    }
    startScreenShareOnly(screenType, winInfo, screenConfig) {
        let retCode = 1;
        let resolution = 1080;
        if (screenConfig?.height == 720 || screenConfig?.width == 720) {
            resolution = 720;
        }
        if (screenType == 1) {
            if (winInfo.id != undefined) {
                winInfo = winInfo.id;
            }
            m_ScreenShareSrcInfo.devId = winInfo;
            m_ScreenShareSrcInfo.isScreenShare = true;
            m_ScreenShareSrcInfo.resolution = resolution;
            m_ScreenShareSrcInfo.option = screenConfig;
            retCode = rk_sdk.startScreenShare(winInfo, resolution, screenConfig);
        }
        else if (screenType == 2) {
            m_ScreenShareSrcInfo.devId = winInfo;
            m_ScreenShareSrcInfo.isScreenShare = false;
            m_ScreenShareSrcInfo.resolution = resolution;
            retCode = rk_sdk.startScreenWindowShare(winInfo, resolution);
        }
        return retCode;
    }
    stopScreenShare() {
        return rk_sdk.stopScreenShare();
    }
    stopScreenShareEx(conn) {
        return rk_sdk.stopScreenShareEx(conn);
    }
    stopScreenShare2() {
        return this.stopScreenShare();
    }
    stopScreenShare2Ex(conn) {
        return this.stopScreenShareEx(conn);
    }
    reChooseShareScreen(screenType, winInfo, screenConfig) {
        let resolution = 1080;
        if (screenConfig.height == 720 || screenConfig.width == 720) {
            resolution = 720;
        }
        if (screenType == 1) {
            if (winInfo.id != undefined) {
                winInfo = winInfo.id;
            }
        }
        this.m_ScreenShareType = screenType;
        m_ScreenShareSrcInfo.devId = winInfo;
        m_ScreenShareSrcInfo.resolution = resolution;
        m_ScreenShareSrcInfo.isScreenShare = screenType == 1;
        m_ScreenShareSrcInfo.option = screenConfig;
        let retCode = rk_sdk.updateScreenShareSrcInfo(m_ScreenShareSrcInfo.devId, m_ScreenShareSrcInfo.resolution, m_ScreenShareSrcInfo.isScreenShare, m_ScreenShareSrcInfo.option);
        return retCode;
    }
    videoSourceUpdateScreenCaptureParameters(screenConfig) {
        let resolution = 1080;
        if (screenConfig.height == 720 || screenConfig.width == 720) {
            resolution = 720;
        }
        if (!screenConfig.excludeWindowList) {
            screenConfig.excludeWindowList = [];
        }
        m_ScreenShareSrcInfo.resolution = resolution;
        m_ScreenShareSrcInfo.option = screenConfig;
        let retCode = rk_sdk.updateScreenShareSrcInfo(m_ScreenShareSrcInfo.devId, m_ScreenShareSrcInfo.resolution, m_ScreenShareSrcInfo.isScreenShare, m_ScreenShareSrcInfo.option);
        return retCode;
    }
    videoSourceRenewToken(token) {
        return 0;
    }
    setupViewContentMode(uid, videoType, mode, channelId) {
        rk_sdk.setupViewContentMode(uid, videoType, mode);
        return 0;
    }
    setupRemoteVideo(uid, view, channel, options, isScreenShare = false) {
        if (channel) {
            rk_sdk.setVideoElementEx(uid + "", view, isScreenShare ? 2 : 0, {
                localUid: this.m_myUid,
                channelId: channel,
            });
        }
        else {
            rk_sdk.setVideoElement(uid + "", view, isScreenShare ? 2 : 0);
        }
        return 0;
    }
    setupRemoteVideoEx(uid, view, connection, isScreenShare = false) {
        rk_sdk.setVideoElementEx(uid + "", view, isScreenShare ? 2 : 0, connection);
        return 0;
    }
    renewToken(newtoken) {
        return 0;
    }
    renewTokenEx(conn, newtoken) {
        return 0;
    }
    leaveChannel() {
        return rk_sdk.leaveRoom();
    }
    leaveChannelEx(conn) {
        return rk_sdk.leaveRoomEx(conn);
    }
    release(sync) {
        rk_sdk.unInit();
        return 0;
    }
    createAssistChannel(channelName) {
        return 0;
    }
    joinAssistChannel(channelId, token, info, uid, options) {
        return 0;
    }
    joinAssistChannelAsync(channelId, token, username, uid, options, userExtendedInfo) {
        let assistConnection = { channelId, localUid: uid };
        this.m_assistChannelMap.set(channelId, assistConnection);
        if (userExtendedInfo && typeof userExtendedInfo === "object") {
            userExtendedInfo = JSON.stringify(userExtendedInfo);
        }
        let ret = rk_sdk.joinRoomEx(uid, token, username, channelId, userExtendedInfo);
        return ret;
    }
    closeAllAssistChannel() {
        this.m_assistChannelMap.forEach((assistConnection, key) => {
            rk_sdk.leaveRoomEx(assistConnection);
        });
        this.m_assistChannelMap.clear();
        return 0;
    }
    renewAssistChannelToken(channelId, newtoken) {
        return 0;
    }
    onAssistChannel(channelId, event, listener) {
        this.on(`assist_${channelId}_${event}`, listener);
        return this;
    }
    closeAssistChannel(channelId) {
        let assistConnection = this.m_assistChannelMap.get(channelId);
        if (assistConnection) {
            this.m_assistChannelMap.delete(channelId);
            return rk_sdk.leaveRoomEx(assistConnection);
        }
        return 0;
    }
    leaveAssistChannel(channelId, uid) {
        this.m_assistChannelMap.delete(channelId);
        return rk_sdk.leaveRoomEx({ channelId, localUid: uid + "" });
    }
    setClientRole(rol) {
        return 0;
    }
    muteLocalAudioStream(mute) {
        return rk_sdk.enablePublishAudioStream(!mute);
    }
    enableLoopbackRecording(enable, deviceName) {
        return rk_sdk.enableLoopbackRecording(enable);
    }
    enableLoopbackRecordingEx(conn, enable, deviceName) {
        return rk_sdk.enableLoopbackRecordingEx(conn, enable);
    }
    addPublishStreamUrl(url, transcodingEnabled) {
        return 0;
    }
    removePublishStreamUrl(url) {
        return 0;
    }
    setLiveTranscoding(transcoding) {
        return 0;
    }
    setBeautyEffectOptions(enable, options) {
        return 0;
    }
    enableVirtualBackground(enabled, backgroundImage, backgroundColor) {
        return 0;
    }
    setCloudProxy(type) {
        return 0;
    }
    sendMessage(msg, to) {
        rk_sdk.asyncSendMessage(msg, to);
        return 0;
    }
    sendMessageEx(msg, to, conn) {
        rk_sdk.asyncSendMessageEx(msg, to, conn);
        return 0;
    }
    getRoomUsers() {
        let data = rk_sdk.getRoomAttendees();
        if (data) {
            data.forEach((user) => {
                user.m_pRealName = user.m_pUserName;
                user.m_pUserName = user.m_pUserId;
            });
        }
        return data;
    }
    getRoomUsersEx(conn) {
        let data = rk_sdk.getRoomAttendeesEx(conn);
        if (data) {
            data.forEach((user) => {
                user.m_pRealName = user.m_pUserName;
                user.m_pUserName = user.m_pUserId;
            });
        }
        return data;
    }
    setLocalVideoMirrorMode(mirrortype) {
        return 0;
    }
    startAudioPlaybackDeviceTest(filepath) {
        return rk_sdk.startSpeakerDeviceTest(undefined, filepath);
    }
    stopAudioPlaybackDeviceTest() {
        return rk_sdk.stopSpeakerDeviceTest(undefined);
    }
    startAudioRecordingDeviceTest(indicateInterval) {
        return rk_sdk.startAudioDeviceLoopbackTest(undefined, indicateInterval);
    }
    stopAudioRecordingDeviceTest() {
        return rk_sdk.stopAudioDeviceLoopbackTest(undefined);
    }
    enableDualStreamMode(enable) {
        return rk_sdk.enableDualStreamMode(enable);
    }
    setDualStreamMode(mode, streamConfig) {
        if (mode === 0) {
            return this.enableDualStreamMode(false);
        }
        else {
            return this.enableDualStreamMode(true);
        }
    }
    setRemoteDefaultVideoStreamType(streamType, channelId) {
        if (channelId) {
            let connection = this.m_assistChannelMap.get(channelId);
            if (connection) {
                return rk_sdk.setRemoteDefaultVideoStreamTypeEx(connection, streamType == 1 ? 0 : 1);
            }
        }
        else {
            return rk_sdk.setRemoteDefaultVideoStreamType(streamType == 1 ? 0 : 1);
        }
    }
    setRemoteVideoStreamType(uid, streamType) {
        return rk_sdk.setRemoteVideoStreamType(uid + "", streamType == 1 ? 0 : 1);
    }
    isVirtualBackgroundSupported() {
        return true;
    }
    setIgnoreFeatureSupported(ignore) {
        return 0;
    }
    isIgnoreFeatureSupported() {
        return false;
    }
    takeSnapshot(channel, uid, isScreenShare) {
        let pms = new Promise((resolve, reject) => {
            uid = uid + "";
            let fileDir;
            if (process.platform == "win32") {
                fileDir = "C:\\Windows\\Temp";
                if (!fs.existsSync(fileDir)) {
                    fs.mkdirSync(fileDir, { recursive: true });
                    if (!fs.existsSync(fileDir)) {
                        fileDir = undefined;
                    }
                }
            }
            if (!fileDir) {
                fileDir = path.join(this.m_LogPath, `../../../files/images`);
            }
            if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir, { recursive: true });
            }
            let filePath = path.join(fileDir, `img_${new Date().getTime()}.jpg`);
            rk_sdk.onSnapshotTaken(undefined);
            rk_sdk.onSnapshotTaken((conn, puid2, videoType, filePath2, width, height, errCode) => {
                if (filePath != filePath2) {
                    reject(0);
                    return;
                }
                if (fs.existsSync(filePath)) {
                    let img = electron_1.nativeImage.createFromPath(filePath);
                    resolve({ success: true, data: img });
                    fs.unlinkSync(filePath);
                }
                else {
                    resolve({ success: false });
                }
            });
            rk_sdk.takeSnapshot(uid, isScreenShare ? 2 : 0, filePath);
        });
        return pms;
    }
    adjustRecordingSignalVolume(volume) {
        let rkVolume = Math.round((volume * 255) / 100);
        return rk_sdk.setAudioCaptureDeviceVolume(undefined, rkVolume);
    }
    adjustPlaybackSignalVolume(volume) {
        let rkVolume = Math.round((volume * 255) / 100);
        return rk_sdk.setSpeakerDeviceVolume(undefined, rkVolume);
    }
    queryDeviceScore() {
        return 80;
    }
    getVideoFrame(renderItem) {
        return rk_sdk.getVideoFrame(renderItem.uid, renderItem.videoSourceType);
    }
    enableVideoFrameCache(config) {
        return undefined;
    }
    muteAllRemoteVideoStreams(mute, channelId) {
        return 0;
    }
    destroyRendererByView(view) { }
    destroyRendererByConfig(sourceType, channelId, uid) { }
    onRtcEvent(key, callbck) {
        return this;
    }
    onConnectionEvent(key, callbck) {
        rk_sdk.onConnectionEvent(key, callbck);
        return this;
    }
    onLocalVideoStateChanged(callback) {
        return this;
    }
    setDirectCdnStreamingAudioConfiguration(profile) {
        return 0;
    }
    setDirectCdnStreamingVideoConfiguration(config) {
        return 0;
    }
    startDirectCdnStreaming(eventHandler, publishUrl, options) {
        return 0;
    }
    stopDirectCdnStreaming() {
        return 0;
    }
    getRtcEngin() {
        return rk_sdk;
    }
    getSdkType() {
        return 1;
    }
    getMethodNameList() {
        const allKey = Reflect.ownKeys(RkSdk.prototype).filter((key) => key != "constructor" &&
            key != "getMethodNameList" &&
            typeof RkSdk.prototype[key] === "function");
        return allKey;
    }
    createDataStream(config) {
        return 0;
    }
    createDataChannel(conn) {
        return rk_sdk.createDataChannel(conn);
    }
    subscribeData(conn, topicName) {
        return rk_sdk.subscribeData(conn, topicName);
    }
    unsubscribeData(conn, topicName) {
        return rk_sdk.unsubscribeData(conn, topicName);
    }
    deleteDataChannel(conn) {
        return rk_sdk.deleteDataChannel(conn);
    }
    setScreenShareSceneMode(screenMode) {
        return this.setScreenShareSceneModeEx(undefined, screenMode);
    }
    setScreenShareSceneModeEx(conn, screenMode) {
        return rk_sdk.setScreenShareSceneMode(conn, screenMode);
    }
    followSystemPlaybackDevice(enable) {
        this.m_isFollowSystemPlaybackDevice = enable;
        return 0;
    }
    followSystemRecordingDevice(enable) {
        this.m_isFollowSystemRecordingDevice = enable;
        return 0;
    }
    getRecordingDeviceVolume() {
        let volumn = rk_sdk.getAudioCaptureDeviceVolume(undefined);
        volumn = Math.round((volumn * 100) / 255);
        return volumn;
    }
    getPlaybackDeviceVolume() {
        let volumn = rk_sdk.getSpeakerDeviceVolume(undefined);
        volumn = Math.round((volumn * 100) / 255);
        return volumn;
    }
    enableAINSModeEx(conn, enable) {
        return rk_sdk.enableAINSMode(conn, enable);
    }
}
exports.default = RkSdk;
module.exports = RkSdk;
//# sourceMappingURL=RkSdk.js.map