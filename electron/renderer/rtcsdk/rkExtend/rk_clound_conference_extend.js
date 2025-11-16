"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentAudioCaptureDevice = exports.setAudioCaptureDeviceEx = exports.setAudioCaptureDevice = exports.enumScreenAndWindowEx = exports.enumScreenAndWindow = exports.enumCameraDeviceEx = exports.enumCameraDevice = exports.enumSpeakerDeviceEx = exports.enumSpeakerDevice = exports.enumAudioCaptureDeviceEx = exports.enumAudioCaptureDevice = exports.enableSubscribeEx = exports.enableSubscribe = exports.enablePublishEx = exports.enablePublish = exports.shareEnable = exports.videoEnable = exports.audioEnable = exports.isConnInRoom = exports.isConnInit = exports.unInit = exports.init = exports.getSDKVersion = exports.setLogTag = exports.setupViewContentModeEx = exports.setupViewContentMode = exports.clearAllVideoCanvas = exports.stopRenderCanvasEx = exports.stopRenderCanvas = exports.removeVideoCanvasEx = exports.removeVideoCanvas = exports.setVideoElementEx = exports.setVideoElement = exports.setDevTools = exports.getConnectionInfo = exports.isExistConnection = exports.ConnectionInfo = exports.isMainConnection = exports.equalsConnection = exports.DevInfoList = exports.RoomInfo = exports.User = exports.messageResult = exports.Stats = exports.MsgData = exports.UserDeviceState = exports.ScreenDevice = exports.ScreenDeviceType = exports.VideoOption = exports.RtcConnection = void 0;
exports.getRoomAttendees = exports.closeRoomEx = exports.closeRoom = exports.muteRoomEx = exports.muteRoom = exports.kickOutEx = exports.kickOut = exports.muteVideoEx = exports.muteVideo = exports.muteAudioEx = exports.muteAudio = exports.enableAudioVolumeIndicationEx = exports.enableAudioVolumeIndication = exports.enableLoopbackRecordingEx = exports.enableLoopbackRecording = exports.enableSubscribeVideoStreamEx = exports.enableSubscribeVideoStream = exports.enableSubscribeAudioStreamEx = exports.enableSubscribeAudioStream = exports.enablePublishVideoStreamEx = exports.enablePublishVideoStream = exports.enablePublishAudioStreamEx = exports.enablePublishAudioStream = exports.stopScreenShare = exports.stopScreenShareEx = exports.updateScreenShareSrcInfo = exports.updateScreenShareSrcInfoEx = exports.startScreenWindowShare = exports.startScreenWindowShareEx = exports.startScreenShareEx = exports.startScreenShare = exports.leaveRoomEx = exports.leaveRoom = exports.joinRoomEx = exports.joinRoom = exports.stopPreviewEx = exports.stopPreview = exports.startPreviewEx = exports.startPreview = exports.getCurrentCameraDeviceEx = exports.getCurrentCameraDevice = exports.setCameraDeviceEx = exports.setCameraDevice = exports.setVideoQualityEx = exports.setVideoQuality = exports.getCurrentSpeakerDeviceEx = exports.getCurrentSpeakerDevice = exports.setSpeakerDeviceEx = exports.setSpeakerDevice = exports.getCurrentAudioCaptureDeviceEx = void 0;
exports.getAudioCaptureDeviceVolume = exports.deleteDataChannel = exports.unsubscribeData = exports.subscribeData = exports.createDataChannel = exports.getVideFrameEx = exports.getVideoFrame = exports.onDataChannelStateChanged = exports.onSnapshotTaken = exports.onNetworkQuality = exports.OnVideoStateChanged = exports.OnAudioStateChanged = exports.onMessage = exports.onAudioDefaultDeviceChangedEx = exports.onAudioDefaultDeviceChanged = exports.onRepeatLogin = exports.onAudioDeviceVolumeChangedEx = exports.onAudioDeviceVolumeChanged = exports.onVideoDeviceStateChange = exports.onAudioDeviceStateChange = exports.onRoomError = exports.onRoomStateChange = exports.onRoomMemberStateChange = exports.onActiveSpeaker = exports.onRtcStats = exports.onConnectionEvent = exports.onEvent = exports.setRemoteVideoStreamTypeEx = exports.setRemoteVideoStreamType = exports.enableDualStreamModeEx = exports.enableDualStreamMode = exports.setRemoteDefaultVideoStreamTypeEx = exports.setRemoteDefaultVideoStreamType = exports.takeSnapshotEx = exports.takeSnapshot = exports.setReconnectResumedMediaTypeEx = exports.setReconnectResumedMediaType = exports.getLogPathEx = exports.getLogPath = exports.asyncSendMessageEx = exports.asyncSendMessage = exports.sendMessageEx = exports.sendMessage = exports.getRoomInfoEx = exports.getRoomInfo = exports.getRoomAttendeeCountEx = exports.getRoomAttendeeCount = exports.getAttendeeInfoEx = exports.getAttendeeInfo = exports.getRoomAttendeesEx = void 0;
exports.setFrameRateEx = exports.setFrameRate = exports.enableAINSMode = exports.setScreenShareSceneMode = exports.stopAudioDeviceLoopbackTest = exports.startAudioDeviceLoopbackTest = exports.stopSpeakerDeviceTest = exports.startSpeakerDeviceTest = exports.setSpeakerDeviceVolume = exports.getSpeakerDeviceVolume = exports.setAudioCaptureDeviceVolume = void 0;
const common_enum_1 = require("rkcloud-conference-electron-sdk/common_enum");
const rk_clound_conference_engine_1 = require("rkcloud-conference-electron-sdk/rk_clound_conference_engine");
var rk_clound_conference_engine_2 = require("rkcloud-conference-electron-sdk/rk_clound_conference_engine");
Object.defineProperty(exports, "RtcConnection", { enumerable: true, get: function () { return rk_clound_conference_engine_2.RtcConnection; } });
Object.defineProperty(exports, "VideoOption", { enumerable: true, get: function () { return rk_clound_conference_engine_2.VideoOption; } });
Object.defineProperty(exports, "ScreenDeviceType", { enumerable: true, get: function () { return rk_clound_conference_engine_2.ScreenDeviceType; } });
Object.defineProperty(exports, "ScreenDevice", { enumerable: true, get: function () { return rk_clound_conference_engine_2.ScreenDevice; } });
Object.defineProperty(exports, "UserDeviceState", { enumerable: true, get: function () { return rk_clound_conference_engine_2.UserDeviceState; } });
Object.defineProperty(exports, "MsgData", { enumerable: true, get: function () { return rk_clound_conference_engine_2.MsgData; } });
Object.defineProperty(exports, "Stats", { enumerable: true, get: function () { return rk_clound_conference_engine_2.Stats; } });
Object.defineProperty(exports, "messageResult", { enumerable: true, get: function () { return rk_clound_conference_engine_2.messageResult; } });
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return rk_clound_conference_engine_2.User; } });
Object.defineProperty(exports, "RoomInfo", { enumerable: true, get: function () { return rk_clound_conference_engine_2.RoomInfo; } });
function ToString(conn) {
    return `'${conn.channelId ?? ""}${conn.localUid ?? ""}'`;
}
class CacheParam {
}
let cacheParam;
const node_events_1 = require("node:events");
const m_NodeEventEmitter = new node_events_1.EventEmitter();
class DevInfoList {
    constructor() {
        this.mDevList = [];
        this.mCurDev = null;
    }
    convertDevInfo(dev) {
        return {
            deviceid: dev.guid,
            devicename: dev.name,
            isSystemDefault: dev.isSystemDefault,
        };
    }
    getDefaultDev(devList) {
        if (!devList) {
            return undefined;
        }
        this.mDevList = devList;
        return this.mDevList.find((dev) => {
            return dev.isSystemDefault == 1;
        });
    }
    getNewDevList(devList) {
        if (!devList) {
            return [];
        }
        this.mDevList = devList;
        let newList = [];
        this.mDevList.forEach((dev) => {
            let dev2 = this.convertDevInfo(dev);
            newList.push(dev2);
        });
        return newList;
    }
    setCurDev(dev) {
        this.mCurDev = dev;
    }
    hasDevs() {
        return this.mDevList.length > 0;
    }
    getInsertDev(newDevList) {
        for (let i = 0; i < newDevList.length; i++) {
            let dev = newDevList[i];
            let containsDev = false;
            for (let j = 0; j < this.mDevList.length; j++) {
                if (dev.guid == this.mDevList[j].guid) {
                    containsDev = true;
                    break;
                }
            }
            if (!containsDev) {
                return dev.guid;
            }
        }
        return undefined;
    }
    getRemoveDev(newDevList) {
        for (let j = 0; j < this.mDevList.length; j++) {
            let dev = this.mDevList[j];
            let containsDev = false;
            for (let i = 0; i < newDevList.length; i++) {
                if (dev.guid == newDevList[i].guid) {
                    containsDev = true;
                    break;
                }
            }
            if (!containsDev) {
                return dev.guid;
            }
        }
        return undefined;
    }
}
exports.DevInfoList = DevInfoList;
function equalsConnection(conn1, conn2) {
    if (!conn1 || !conn2) {
        return false;
    }
    if (conn1.channelId == conn2.channelId &&
        conn1.localUid + "" == conn2.localUid + "") {
        return true;
    }
    return false;
}
exports.equalsConnection = equalsConnection;
function isMainConnection(conn) {
    return equalsConnection(conn, mainInfo.connection);
}
exports.isMainConnection = isMainConnection;
class ConnectionInfo {
    constructor() {
        this.connection = {
            channelId: "",
            localUid: "",
        };
        this.meetState = -1;
        this.enableVideo = false;
        this.enablePreview = false;
        this.enableAudio = false;
        this.enableScreen = false;
        this.loopbackRecording = false;
        this.engine = new rk_clound_conference_engine_1.RkConferenceEngine();
        this.cameraList = new DevInfoList();
        this.audioCaptureList = new DevInfoList();
        this.speakerList = new DevInfoList();
        this.cameraOption = new rk_clound_conference_engine_1.VideoOption();
        this.memberList = [];
        this.screenShareOption = new rk_clound_conference_engine_1.VideoOption();
        this.isInRoom = false;
        this.isInit = false;
    }
    onEvent(eventKey, ...args) {
        let rtcConnection = {
            localUid: args[0],
            channelId: args[1],
        };
        args.splice(0, 2);
        m_NodeEventEmitter.emit(eventKey, rtcConnection, ...args);
    }
    onRtcStats(conn, stats) {
        m_NodeEventEmitter.emit("OnRtcStats", conn, stats);
    }
    onRoomMemberStateChange(conn, username, userState) {
        m_NodeEventEmitter.emit("OnRoomMemberStateChange", conn, username, userState);
    }
    onRoomStateChange(conn, roomState) {
        if (roomState == common_enum_1.RoomState.STARTED) {
            if (this.meetState == common_enum_1.RoomState.INTERRUPTED) {
                this.meetState = roomState;
                if (this.enableAudio) {
                    enablePublishAudioStreamEx(conn, true);
                }
                if (this.enableVideo) {
                    enablePublishVideoStreamEx(conn, true);
                }
                if (this.enableScreen) {
                    (0, rk_clound_conference_engine_1.logInfo)(`conn:${ToString(conn)} roomState == RoomState.STARTED, enableScreen:${this.enableScreen}`);
                    if (this.screenShareOption.deviceId > 0) {
                        this.engine.startScreenShare(this.screenShareOption);
                    }
                    else {
                        (0, rk_clound_conference_engine_1.logError)(`conn:${ToString(conn)} roomState == RoomState.STARTED, enableScreen:${this.enableScreen}, screenShareOption.deviceId:${this.screenShareOption.deviceId}`);
                    }
                    if (this.loopbackRecording) {
                        enableLoopbackRecordingEx(conn, this.loopbackRecording);
                    }
                }
                if (this.enablePreview) {
                    startPreviewEx(conn);
                }
            }
        }
        this.meetState = roomState;
        (0, rk_clound_conference_engine_1.logInfo)(`onRoomStateChange, conn:${ToString(conn)}, roomState:${roomState}`);
        m_NodeEventEmitter.emit("OnRoomStateChange", conn, roomState);
    }
    onRoomError(conn, errCode, reason) {
        m_NodeEventEmitter.emit("OnRoomError", conn, errCode, reason);
    }
    onAudioDeviceStateChange(conn, devType, devState) {
        if (devType == common_enum_1.AudioDeviceType.PLAYOUT) {
            let devList = this.engine.enumSpeakerDevice();
            if (devState == common_enum_1.MediaDeviceState.PLUGGED) {
                let dev = this.speakerList.getInsertDev(devList);
                this.speakerList.getNewDevList(devList);
                m_NodeEventEmitter.emit("OnAudioDeviceStateChange", conn, dev, 0, 0);
            }
            else if (devState == common_enum_1.MediaDeviceState.UNPLUGGED) {
                let dev = this.speakerList.getRemoveDev(devList);
                this.speakerList.getNewDevList(devList);
                m_NodeEventEmitter.emit("OnAudioDeviceStateChange", conn, dev, 0, 8);
            }
        }
        else if (devType == common_enum_1.AudioDeviceType.RECORDING) {
            let devList = this.engine.enumAudioCaptureDevice();
            if (devState == common_enum_1.MediaDeviceState.PLUGGED) {
                let dev = this.audioCaptureList.getInsertDev(devList);
                this.audioCaptureList.getNewDevList(devList);
                m_NodeEventEmitter.emit("OnAudioDeviceStateChange", conn, dev, 1, 0);
            }
            else if (devState == common_enum_1.MediaDeviceState.UNPLUGGED) {
                let dev = this.audioCaptureList.getRemoveDev(devList);
                this.audioCaptureList.getNewDevList(devList);
                m_NodeEventEmitter.emit("OnAudioDeviceStateChange", conn, dev, 1, 8);
            }
        }
        else {
            (0, rk_clound_conference_engine_1.logError)(`onAudioDeviceStateChange unknown devType, conn:${ToString(conn)}, devType:${devType}, devState:${devState}`);
        }
    }
    onVideoDeviceStateChange(conn, devState) {
        let devList = this.engine.enumCameraDevice();
        if (devState == common_enum_1.MediaDeviceState.PLUGGED) {
            let dev = this.cameraList.getInsertDev(devList);
            this.cameraList.getNewDevList(devList);
            m_NodeEventEmitter.emit("OnVideoDeviceStateChange", conn, dev, 3, 0);
        }
        else if (devState == common_enum_1.MediaDeviceState.UNPLUGGED) {
            let dev = this.cameraList.getRemoveDev(devList);
            this.cameraList.getNewDevList(devList);
            m_NodeEventEmitter.emit("OnVideoDeviceStateChange", conn, dev, 3, 8);
        }
        else {
            (0, rk_clound_conference_engine_1.logError)(`onVideoDeviceStateChange unknown devState, conn:${ToString(conn)}, devState:${devState}`);
        }
    }
    onRepeatLogin(conn) {
        m_NodeEventEmitter.emit("OnRepeatLogin", conn);
    }
    onAudioDefaultDeviceChanged(conn, devType) {
        if (isMainConnection(conn)) {
            m_NodeEventEmitter.emit("OnAudioDefaultDeviceChanged", devType);
        }
        m_NodeEventEmitter.emit("OnAudioDefaultDeviceChangedEx", conn, devType);
    }
    onMessage(conn, cMsg) {
        m_NodeEventEmitter.emit("OnMessage", conn, cMsg);
    }
    onAudioStateChanged(conn, userId, aState) {
        m_NodeEventEmitter.emit("OnAudioStateChanged", conn, userId, aState);
    }
    onVideoStateChanged(conn, puid, type, state, stateErr) {
        m_NodeEventEmitter.emit("OnVideoStateChanged", conn, puid, type, state, stateErr);
        if (state != common_enum_1.VideoState.STOPED) {
            this.engine.startRenderCanvas(puid, type);
        }
    }
    onAudioDeviceVolumeChanged(devType, volume, mute) {
        if (isMainConnection(this.connection)) {
            m_NodeEventEmitter.emit("OnAudioDeviceVolumeChanged", devType, volume, mute);
        }
        m_NodeEventEmitter.emit("OnAudioDeviceVolumeChangedEx", this.connection, devType, volume, mute);
    }
    onNetworkQuality(conn, puid, txQuality, rxQuality) {
        m_NodeEventEmitter.emit("OnNetworkQuality", conn, puid, txQuality, rxQuality);
    }
    onSnapshotTaken(conn, puid, videoSourceType, filePath, width, height, errCode) {
        m_NodeEventEmitter.emit("OnSnapshotTaken", conn, puid, videoSourceType, filePath, width, height, errCode);
    }
    onActiveSpeaker(conn, username, volume) {
        m_NodeEventEmitter.emit("OnActiveSpeaker", conn, username, volume);
    }
    onDataChannelStateChanged(conn, state, info) {
        m_NodeEventEmitter.emit("OnDataChannelStateChanged", conn, state, info);
    }
    Reset() {
        this.LeaveReset();
        this.cameraOption = new rk_clound_conference_engine_1.VideoOption();
        this.cameraList = new DevInfoList();
        this.audioCaptureList = new DevInfoList();
        this.speakerList = new DevInfoList();
        this.enablePreview = false;
    }
    LeaveReset() {
        this.connection.channelId = "";
        this.meetState = -1;
        this.enableVideo = false;
        this.enableAudio = false;
        this.enableScreen = false;
        this.loopbackRecording = false;
        this.isInRoom = false;
        this.screenShareOption = new rk_clound_conference_engine_1.VideoOption();
    }
}
exports.ConnectionInfo = ConnectionInfo;
let mainInfo = new ConnectionInfo();
let Infos = new Map();
function isExistConnection(conn) {
    if (conn == null || conn == undefined) {
        return false;
    }
    if (ToString(mainInfo.connection) == ToString(conn)) {
        return true;
    }
    return Infos.has(ToString(conn));
}
exports.isExistConnection = isExistConnection;
function addConnectionInfo(conn) {
    if (conn != null && conn != undefined) {
        let info = new ConnectionInfo();
        info.connection = conn;
        Infos.set(ToString(conn), info);
        return info;
    }
    return undefined;
}
function removeConnectionInfo(conn) {
    if (conn != null && conn != undefined) {
        Infos.delete(ToString(conn));
    }
}
function getConnectionInfo(conn) {
    if (conn != null && conn != undefined) {
        if (ToString(mainInfo.connection) == ToString(conn))
            return mainInfo;
        return Infos.get(ToString(conn));
    }
    else {
        return mainInfo;
    }
}
exports.getConnectionInfo = getConnectionInfo;
function setDevTools(enable) {
    (0, rk_clound_conference_engine_1.enableDevTools)(enable);
}
exports.setDevTools = setDevTools;
function setVideoElement(id, canvas, type, startRenderer = false) {
    setVideoElementEx(id, canvas, type, undefined, startRenderer);
}
exports.setVideoElement = setVideoElement;
function setVideoElementEx(id, canvas, type, conn, startRenderer = false) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.setVideoElement(id, canvas, type, startRenderer);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`setVideoElementEx failed! Connection not exits. ${JSON.stringify(conn)}`);
}
exports.setVideoElementEx = setVideoElementEx;
function removeVideoCanvas(id, type) {
    removeVideoCanvasEx(id, type, undefined);
}
exports.removeVideoCanvas = removeVideoCanvas;
function removeVideoCanvasEx(id, type, conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.removeVideoCanvas(id, type);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`removeVideoCanvasEx failed! Connection not exits. ${JSON.stringify(conn)}`);
}
exports.removeVideoCanvasEx = removeVideoCanvasEx;
function stopRenderCanvas(id, type) {
    stopRenderCanvasEx(id, type, undefined);
}
exports.stopRenderCanvas = stopRenderCanvas;
function stopRenderCanvasEx(id, type, conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.stopRenderCanvas(id, type);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`stopRenderCanvasEx failed! Connection not exits.${JSON.stringify(conn)}`);
}
exports.stopRenderCanvasEx = stopRenderCanvasEx;
function clearAllVideoCanvas() {
    mainInfo.engine.clearAllVideoCanvas();
    for (let info of Infos.values()) {
        info.engine.clearAllVideoCanvas();
    }
}
exports.clearAllVideoCanvas = clearAllVideoCanvas;
function setupViewContentMode(uid, type, mode) {
    setupViewContentModeEx(uid, type, mode, undefined);
}
exports.setupViewContentMode = setupViewContentMode;
function setupViewContentModeEx(uid, type, mode, conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.setupViewContentMode(uid, type, mode);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`setupViewContentModeEx failed! Connection not exits.${JSON.stringify(conn)}`);
}
exports.setupViewContentModeEx = setupViewContentModeEx;
function setLogTag(tag) {
    mainInfo.engine.setLogTag(tag);
}
exports.setLogTag = setLogTag;
function getSDKVersion() {
    return mainInfo.engine.getSDKVersion();
}
exports.getSDKVersion = getSDKVersion;
async function initWithHost(rootHost, logPath, pUserName, pPassword, name) {
    return await mainInfo.engine
        .init(rootHost, logPath, pUserName, pPassword, name)
        .then((value) => {
        if (value == common_enum_1.ErrorCode.SUCCESS) {
            cacheParam = { host: rootHost, lPath: logPath };
            mainInfo.isInit = true;
            mainInfo.connection = {
                channelId: "",
                localUid: pUserName,
            };
            mainInfo.engine.addObserver(mainInfo);
        }
        return value;
    });
}
async function init(logPath, pUserName, pPassword, name) {
    return await initWithHost("https://meeting.chaoxing.com", logPath, pUserName, pPassword, name);
}
exports.init = init;
function unInit() {
    (0, rk_clound_conference_engine_1.logInfo)("unInit begin.");
    mainInfo.engine.removeObserver(mainInfo);
    mainInfo.engine.unInit();
    for (let info of Infos.values()) {
        info.engine.removeObserver(info);
        info.engine.unInit();
    }
    Infos.clear();
    mainInfo.Reset();
    m_NodeEventEmitter.removeAllListeners();
    (0, rk_clound_conference_engine_1.logInfo)("unInit end.");
}
exports.unInit = unInit;
function isConnInit(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.isInit;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`isConnInit warning! Connection not exits. ${JSON.stringify(conn)}`);
    return false;
}
exports.isConnInit = isConnInit;
function isConnInRoom(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.isInRoom;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`isConnInRoom warning! Connection not exits. ${JSON.stringify(conn)}`);
    return false;
}
exports.isConnInRoom = isConnInRoom;
function audioEnable(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.enableAudio;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`audioEnable warning! Connection not exits. ${JSON.stringify(conn)}`);
    return false;
}
exports.audioEnable = audioEnable;
function videoEnable(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.enableVideo;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`videoEnable warning! Connection not exits. ${JSON.stringify(conn)}`);
    return false;
}
exports.videoEnable = videoEnable;
function shareEnable(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.enableScreen;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`shareEnable warning! Connection not exits. ${JSON.stringify(conn)}`);
    return false;
}
exports.shareEnable = shareEnable;
function enablePublish(enableAudio, enableVideo) {
    return enablePublishEx(undefined, enableAudio, enableVideo);
}
exports.enablePublish = enablePublish;
function enablePublishEx(conn, enableAudio, enableVideo) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        let ret = info.engine.enablePublish(enableAudio, enableVideo);
        if (ret === common_enum_1.ErrorCode.SUCCESS) {
            info.enableAudio = enableAudio;
            info.enableVideo = enableVideo;
        }
        return ret;
    }
    (0, rk_clound_conference_engine_1.logError)(`enablePublishEx failed! Connection not exits. ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.enablePublishEx = enablePublishEx;
function enableSubscribe(enableAudio, enableVideo) {
    return enableSubscribeEx(undefined, enableAudio, enableVideo);
}
exports.enableSubscribe = enableSubscribe;
function enableSubscribeEx(conn, enableAudio, enableVideo) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.enableSubscribe(enableAudio, enableVideo);
    }
    (0, rk_clound_conference_engine_1.logError)(`enableSubscribeEx failed! Connection not exits.${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.enableSubscribeEx = enableSubscribeEx;
function enumAudioCaptureDevice() {
    return enumAudioCaptureDeviceEx(undefined);
}
exports.enumAudioCaptureDevice = enumAudioCaptureDevice;
function enumAudioCaptureDeviceEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        let devList = info.engine.enumAudioCaptureDevice();
        return info.audioCaptureList.getNewDevList(devList);
    }
    (0, rk_clound_conference_engine_1.logError)(`enumAudioCaptureDeviceEx failed! Connection not exits. ${JSON.stringify(conn)}`);
    return [];
}
exports.enumAudioCaptureDeviceEx = enumAudioCaptureDeviceEx;
function enumSpeakerDevice() {
    return enumSpeakerDeviceEx(undefined);
}
exports.enumSpeakerDevice = enumSpeakerDevice;
function enumSpeakerDeviceEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        let devList = info.engine.enumSpeakerDevice();
        return info.speakerList.getNewDevList(devList);
    }
    (0, rk_clound_conference_engine_1.logError)(`enumSpeakerDeviceEx failed! Connection not exits. ${JSON.stringify(conn)}`);
    return [];
}
exports.enumSpeakerDeviceEx = enumSpeakerDeviceEx;
function enumCameraDevice() {
    return enumCameraDeviceEx(undefined);
}
exports.enumCameraDevice = enumCameraDevice;
function enumCameraDeviceEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        let devList = info.engine.enumCameraDevice();
        return info.cameraList.getNewDevList(devList);
    }
    (0, rk_clound_conference_engine_1.logError)(`enumCameraDeviceEx failed! Connection not exits. ${JSON.stringify(conn)}`);
    return [];
}
exports.enumCameraDeviceEx = enumCameraDeviceEx;
function enumScreenAndWindow() {
    return enumScreenAndWindowEx(undefined);
}
exports.enumScreenAndWindow = enumScreenAndWindow;
function enumScreenAndWindowEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.enumScreenAndWindow();
    }
    (0, rk_clound_conference_engine_1.logError)(`enumScreenAndWindowEx failed! Connection not exits. ${JSON.stringify(conn)}`);
    return [];
}
exports.enumScreenAndWindowEx = enumScreenAndWindowEx;
function setAudioCaptureDevice(guid) {
    return setAudioCaptureDeviceEx(undefined, guid);
}
exports.setAudioCaptureDevice = setAudioCaptureDevice;
function setAudioCaptureDeviceEx(conn, guid) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        let devlist = info.engine.enumAudioCaptureDevice();
        let dev = devlist.find((dev) => dev.guid == guid);
        if (dev) {
            let ret = info.engine.setAudioCaptureDevice(Number(dev.id));
            if (ret == common_enum_1.ErrorCode.SUCCESS) {
                info.audioCaptureList.setCurDev(dev);
                info.audioCaptureList.mDevList = devlist;
            }
            return ret;
        }
        (0, rk_clound_conference_engine_1.logError)(`setAudioCaptureDeviceEx failed! Device not exits. ${guid}`);
    }
    else {
        (0, rk_clound_conference_engine_1.logError)(`setAudioCaptureDeviceEx failed! Connection not exits. ${JSON.stringify(conn)}`);
    }
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.setAudioCaptureDeviceEx = setAudioCaptureDeviceEx;
function getCurrentAudioCaptureDevice() {
    return getCurrentAudioCaptureDeviceEx(undefined);
}
exports.getCurrentAudioCaptureDevice = getCurrentAudioCaptureDevice;
function getCurrentAudioCaptureDeviceEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        let devlist = info.engine.enumAudioCaptureDevice();
        return info.audioCaptureList.getDefaultDev(devlist)?.guid;
    }
    (0, rk_clound_conference_engine_1.logError)(`getCurrentAudioCaptureDeviceEx failed! Connection not exits. ${JSON.stringify(conn)}`);
    return undefined;
}
exports.getCurrentAudioCaptureDeviceEx = getCurrentAudioCaptureDeviceEx;
function setSpeakerDevice(guid) {
    return setSpeakerDeviceEx(undefined, guid);
}
exports.setSpeakerDevice = setSpeakerDevice;
function setSpeakerDeviceEx(conn, guid) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        let devlist = info.engine.enumSpeakerDevice();
        let dev = devlist.find((dev) => dev.guid == guid);
        if (dev) {
            let ret = info.engine.setSpeakerDevice(Number(dev.id));
            if (ret == common_enum_1.ErrorCode.SUCCESS) {
                info.speakerList.mDevList = devlist;
                info.speakerList.setCurDev(dev);
            }
            return ret;
        }
        (0, rk_clound_conference_engine_1.logError)(`setSpeakerDeviceEx failed! Device not exits. ${guid}`);
    }
    else {
        (0, rk_clound_conference_engine_1.logError)(`setSpeakerDeviceEx failed! Connection not exits. ${JSON.stringify(conn)}`);
    }
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.setSpeakerDeviceEx = setSpeakerDeviceEx;
function getCurrentSpeakerDevice() {
    return getCurrentSpeakerDeviceEx(undefined);
}
exports.getCurrentSpeakerDevice = getCurrentSpeakerDevice;
function getCurrentSpeakerDeviceEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        let devlist = info.engine.enumSpeakerDevice();
        return info.speakerList.getDefaultDev(devlist)?.guid;
    }
    (0, rk_clound_conference_engine_1.logError)(`getCurrentSpeakerDeviceEx failed! Connection not exits. ${JSON.stringify(conn)}`);
    return undefined;
}
exports.getCurrentSpeakerDeviceEx = getCurrentSpeakerDeviceEx;
function setVideoQuality(quality) {
    return setVideoQualityEx(undefined, quality);
}
exports.setVideoQuality = setVideoQuality;
function setVideoQualityEx(conn, quality) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        switch (quality) {
            case common_enum_1.VideoQuality.FLUENT:
                info.cameraOption.resolution = common_enum_1.Resolution.R240P;
                break;
            case common_enum_1.VideoQuality.SD:
                info.cameraOption.resolution = common_enum_1.Resolution.R360P;
                break;
            case common_enum_1.VideoQuality.HD:
                info.cameraOption.resolution = common_enum_1.Resolution.R720P;
                break;
            case common_enum_1.VideoQuality.FHD:
                info.cameraOption.resolution = common_enum_1.Resolution.R1080P;
                break;
            default:
                (0, rk_clound_conference_engine_1.logError)("setVideoQualityEx error, quality not support!");
                return common_enum_1.ErrorCode.NOT_SUPPORT;
        }
        let dev = info.cameraList.mDevList?.find((dev) => dev?.guid === info.cameraList?.mCurDev.guid) ?? null;
        if (dev) {
            info.cameraOption.deviceId = Number(dev.id);
            info.cameraOption.guid = dev.guid;
            return info.engine.setCameraDevice(info.cameraOption);
        }
        (0, rk_clound_conference_engine_1.logWarn)("setVideoQualityEx error, device not exist!");
    }
    else {
        (0, rk_clound_conference_engine_1.logWarn)(`setVideoQualityEx error, conn not exist! ${JSON.stringify(conn)}`);
    }
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.setVideoQualityEx = setVideoQualityEx;
function setCameraDevice(guid) {
    return setCameraDeviceEx(undefined, guid);
}
exports.setCameraDevice = setCameraDevice;
function setCameraDeviceEx(conn, guid) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        let devlist = info.engine.enumCameraDevice();
        let dev = devlist.find((dev) => dev.guid == guid);
        if (dev) {
            info.cameraOption.deviceId = Number(dev.id);
            info.cameraOption.deviceType = common_enum_1.VideoCaptureDeviceType.CAMERA;
            info.cameraOption.guid = dev.guid;
            let ret = info.engine.setCameraDevice(info.cameraOption);
            if (ret == common_enum_1.ErrorCode.SUCCESS) {
                info.cameraList.mDevList = devlist;
                info.cameraList.setCurDev(dev);
            }
            return ret;
        }
        (0, rk_clound_conference_engine_1.logWarn)("setCameraDeviceEx error, device not exist!");
    }
    else {
        (0, rk_clound_conference_engine_1.logWarn)(`setCameraDeviceEx error, conn not exist! ${JSON.stringify(conn)}`);
    }
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.setCameraDeviceEx = setCameraDeviceEx;
function getCurrentCameraDevice() {
    return getCurrentCameraDeviceEx(undefined);
}
exports.getCurrentCameraDevice = getCurrentCameraDevice;
function getCurrentCameraDeviceEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        if (!info.cameraList.hasDevs() || info.cameraList.mCurDev) {
            let devList = info.engine.enumCameraDevice();
            return info.cameraList.getDefaultDev(devList)?.guid;
        }
        else {
            return info.cameraList.mCurDev.guid;
        }
    }
    (0, rk_clound_conference_engine_1.logWarn)(`getCurrentCameraDeviceEx error, conn not exist! ${JSON.stringify(conn)}`);
    return undefined;
}
exports.getCurrentCameraDeviceEx = getCurrentCameraDeviceEx;
function startPreview() {
    return startPreviewEx(undefined);
}
exports.startPreview = startPreview;
function startPreviewEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        let ret = info.engine.startPreview();
        if (ret == common_enum_1.ErrorCode.SUCCESS) {
            info.enablePreview = true;
        }
        return ret;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`startPreviewEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.startPreviewEx = startPreviewEx;
function stopPreview() {
    return stopPreviewEx(undefined);
}
exports.stopPreview = stopPreview;
function stopPreviewEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        let ret = info.engine.stopPreview();
        if (ret == common_enum_1.ErrorCode.SUCCESS) {
            info.enablePreview = false;
        }
        return ret;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`stopPreviewEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.stopPreviewEx = stopPreviewEx;
function joinRoom(roomId, userExtendedInfo = "") {
    let conn = { channelId: roomId, localUid: mainInfo.connection.localUid };
    if (isExistConnection(conn)) {
        return common_enum_1.ErrorCode.INVALID_PARAM;
    }
    mainInfo.engine.setReconnectResumedMediaType(false, false, false);
    let ret = mainInfo.engine.joinRoom(roomId, userExtendedInfo);
    if (ret == common_enum_1.ErrorCode.SUCCESS) {
        mainInfo.isInRoom = true;
        mainInfo.connection.channelId = roomId;
    }
    return ret;
}
exports.joinRoom = joinRoom;
async function joinRoomEx(puid, password, name, roomId, userExtendedInfo = "") {
    let conn = { channelId: roomId, localUid: puid };
    if (isExistConnection(conn)) {
        return Promise.resolve(common_enum_1.ErrorCode.INVALID_PARAM);
    }
    let info = addConnectionInfo(conn);
    if (info != undefined) {
        info.engine.addObserver(info);
        info.engine.setLogTag(conn.channelId);
        return await info.engine
            .init(cacheParam.host, cacheParam.lPath, puid, password, name)
            .then((value) => {
            if (value == common_enum_1.ErrorCode.SUCCESS) {
                info.isInit = true;
                info.engine.setReconnectResumedMediaType(false, false, false);
                setVideoQualityEx(conn, 2);
                info.engine.enablePublish(false, false);
                let ret = info.engine.joinRoom(roomId, userExtendedInfo);
                if (ret == common_enum_1.ErrorCode.SUCCESS) {
                    info.isInRoom = true;
                }
                return ret;
            }
            return value;
        });
    }
    (0, rk_clound_conference_engine_1.logWarn)(`joinRoomEx error, conn not exist! ${JSON.stringify(conn)}`);
    return Promise.resolve(common_enum_1.ErrorCode.NOT_FOUND);
}
exports.joinRoomEx = joinRoomEx;
function leaveRoom() {
    mainInfo.LeaveReset();
    return mainInfo.engine.leaveRoom();
}
exports.leaveRoom = leaveRoom;
function leaveRoomEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        if (ToString(info.connection) === ToString(mainInfo.connection)) {
            return leaveRoom();
        }
        info.engine.unInit();
        removeConnectionInfo(conn);
        return common_enum_1.ErrorCode.SUCCESS;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`leaveRoomEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.leaveRoomEx = leaveRoomEx;
function startScreenShare(screenId, resolution, option) {
    return startScreenShareEx(undefined, screenId, resolution, option);
}
exports.startScreenShare = startScreenShare;
function startScreenShareEx(conn, screenId, resolution, option) {
    if (!resolution) {
        resolution = 720;
    }
    if (screenId < 0) {
        return common_enum_1.ErrorCode.INVALID_PARAM;
    }
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        info.screenShareOption.deviceId = Number(screenId);
        info.screenShareOption.deviceType = common_enum_1.VideoCaptureDeviceType.SCREEN;
        info.screenShareOption.resolution = Number(resolution);
        info.screenShareOption.fps = common_enum_1.FPS.F15;
        info.screenShareOption.bitrate = common_enum_1.Bitrate.B5000KbPS;
        info.screenShareOption.excludeWindowList = option?.excludeWindowList || [];
        let ret = info.engine.startScreenShare(info.screenShareOption);
        if (ret == common_enum_1.ErrorCode.SUCCESS) {
            info.enableScreen = true;
        }
        return ret;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`startScreenShareEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.startScreenShareEx = startScreenShareEx;
function startScreenWindowShareEx(conn, winHwnd, resolution) {
    if (!resolution) {
        resolution = 720;
    }
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        info.screenShareOption.deviceId = Number(winHwnd);
        info.screenShareOption.deviceType = common_enum_1.VideoCaptureDeviceType.WINDOW;
        info.screenShareOption.resolution = Number(resolution);
        info.screenShareOption.fps = common_enum_1.FPS.F15;
        info.screenShareOption.bitrate = common_enum_1.Bitrate.B5000KbPS;
        info.screenShareOption.excludeWindowList = [];
        let ret = info.engine.startScreenShare(info.screenShareOption);
        if (ret == common_enum_1.ErrorCode.SUCCESS) {
            info.enableScreen = true;
        }
        return ret;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`startScreenWindowShareEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.startScreenWindowShareEx = startScreenWindowShareEx;
function startScreenWindowShare(winHwnd, resolution) {
    return startScreenWindowShareEx(undefined, winHwnd, resolution);
}
exports.startScreenWindowShare = startScreenWindowShare;
function updateScreenShareSrcInfoEx(conn, devId, resolution, isScreenShare, option) {
    if (!resolution) {
        resolution = 720;
    }
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        let copyOption = JSON.parse(JSON.stringify(info.screenShareOption));
        if (devId < 0) {
            if (info.enableScreen) {
                devId = info.screenShareOption.deviceId;
            }
            else {
                (0, rk_clound_conference_engine_1.logWarn)(`updateScreenShareSrcInfoEx error: devId < 0. not start share. ${JSON.stringify(conn)}`);
                return common_enum_1.ErrorCode.INVALID_PARAM;
            }
        }
        copyOption.deviceId = Number(devId);
        copyOption.resolution = Number(resolution);
        copyOption.excludeWindowList = option?.excludeWindowList || [];
        copyOption.deviceType = isScreenShare
            ? common_enum_1.VideoCaptureDeviceType.SCREEN
            : common_enum_1.VideoCaptureDeviceType.WINDOW;
        let ret = info.engine.updateScreenShareSrcInfo(copyOption);
        if (ret == common_enum_1.ErrorCode.SUCCESS) {
            info.enableScreen = true;
            info.screenShareOption = copyOption;
        }
        return ret;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`updateScreenShareSrcInfoEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.updateScreenShareSrcInfoEx = updateScreenShareSrcInfoEx;
function updateScreenShareSrcInfo(devId, resolution, isScreenShare, option) {
    return updateScreenShareSrcInfoEx(undefined, devId, resolution, isScreenShare, option);
}
exports.updateScreenShareSrcInfo = updateScreenShareSrcInfo;
function stopScreenShareEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        info.enableScreen = false;
        info.loopbackRecording = false;
        return info.engine.stopScreenShare();
    }
    (0, rk_clound_conference_engine_1.logWarn)(`stopScreenShareEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.stopScreenShareEx = stopScreenShareEx;
function stopScreenShare() {
    return stopScreenShareEx(undefined);
}
exports.stopScreenShare = stopScreenShare;
function enablePublishAudioStream(isEnable) {
    return enablePublishAudioStreamEx(undefined, isEnable);
}
exports.enablePublishAudioStream = enablePublishAudioStream;
function enablePublishAudioStreamEx(conn, isEnable) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        if (info.meetState == 4) {
            info.enableAudio = isEnable;
            return common_enum_1.ErrorCode.SUCCESS;
        }
        let ret = info.engine.enablePublishAudioStream(isEnable);
        if (ret == common_enum_1.ErrorCode.SUCCESS) {
            info.enableAudio = isEnable;
        }
        return ret;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`enablePublishAudioStreamEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.enablePublishAudioStreamEx = enablePublishAudioStreamEx;
function enablePublishVideoStream(isEnable) {
    return enablePublishVideoStreamEx(undefined, isEnable);
}
exports.enablePublishVideoStream = enablePublishVideoStream;
function enablePublishVideoStreamEx(conn, isEnable) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        if (info.meetState == 4) {
            info.enableVideo = isEnable;
            return common_enum_1.ErrorCode.SUCCESS;
        }
        let ret = info.engine.enablePublishVideoStream(isEnable);
        if (ret == common_enum_1.ErrorCode.SUCCESS) {
            info.enableVideo = isEnable;
        }
        return ret;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`enablePublishVideoStreamEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.enablePublishVideoStreamEx = enablePublishVideoStreamEx;
function enableSubscribeAudioStream(isEnable, pUserName) {
    return enableSubscribeAudioStreamEx(undefined, isEnable, pUserName);
}
exports.enableSubscribeAudioStream = enableSubscribeAudioStream;
function enableSubscribeAudioStreamEx(conn, isEnable, pUserName) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.enableSubscribeAudioStream(isEnable, pUserName);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`enableSubscribeAudioStreamEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.enableSubscribeAudioStreamEx = enableSubscribeAudioStreamEx;
function enableSubscribeVideoStream(isEnable, pUserName, isVideoCamera) {
    return enableSubscribeVideoStreamEx(undefined, isEnable, pUserName, isVideoCamera);
}
exports.enableSubscribeVideoStream = enableSubscribeVideoStream;
function enableSubscribeVideoStreamEx(conn, isEnable, pUserName, isVideoCamera) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        if (!isEnable) {
            info.engine.removeVideoCanvas(pUserName, isVideoCamera ? 0 : 2);
        }
        return info.engine.enableSubscribeVideoStream(isEnable, pUserName, isVideoCamera);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`enableSubscribeVideoStreamEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.enableSubscribeVideoStreamEx = enableSubscribeVideoStreamEx;
function enableLoopbackRecording(isEnable) {
    return enableLoopbackRecordingEx(undefined, isEnable);
}
exports.enableLoopbackRecording = enableLoopbackRecording;
function enableLoopbackRecordingEx(conn, isEnable) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        if (info.meetState == 4) {
            info.loopbackRecording = isEnable;
            return common_enum_1.ErrorCode.SUCCESS;
        }
        let ret = info.engine.enableLoopbackRecording(isEnable);
        if (ret == common_enum_1.ErrorCode.SUCCESS) {
            info.loopbackRecording = isEnable;
        }
        return ret;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`enableLoopbackRecordingEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.enableLoopbackRecordingEx = enableLoopbackRecordingEx;
function enableAudioVolumeIndication(isEnable, cycleTime = -1) {
    return enableAudioVolumeIndicationEx(undefined, isEnable, cycleTime);
}
exports.enableAudioVolumeIndication = enableAudioVolumeIndication;
function enableAudioVolumeIndicationEx(conn, isEnable, cycleTime = -1) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.enableAudioVolumeIndication(isEnable, cycleTime);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`enableAudioVolumeIndicationEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.enableAudioVolumeIndicationEx = enableAudioVolumeIndicationEx;
function muteAudio(isEnable, pUserName) {
    return muteAudioEx(undefined, isEnable, pUserName);
}
exports.muteAudio = muteAudio;
function muteAudioEx(conn, isEnable, pUserName) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.muteAudio(isEnable, pUserName);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`muteAudioEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.muteAudioEx = muteAudioEx;
function muteVideo(isEnable, pUserName) {
    return muteVideoEx(undefined, isEnable, pUserName);
}
exports.muteVideo = muteVideo;
function muteVideoEx(conn, isEnable, pUserName) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.muteVideo(isEnable, pUserName);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`muteVideoEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.muteVideoEx = muteVideoEx;
function kickOut(pUserName) {
    return kickOutEx(undefined, pUserName);
}
exports.kickOut = kickOut;
function kickOutEx(conn, pUserName) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.kickOut(pUserName);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`kickOutEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.kickOutEx = kickOutEx;
function muteRoom(isEnable) {
    return muteRoomEx(undefined, isEnable);
}
exports.muteRoom = muteRoom;
function muteRoomEx(conn, isEnable) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.muteRoom(isEnable);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`muteRoomEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.muteRoomEx = muteRoomEx;
function closeRoom() {
    return closeRoomEx(undefined);
}
exports.closeRoom = closeRoom;
function closeRoomEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.closeRoom();
    }
    (0, rk_clound_conference_engine_1.logWarn)(`closeRoomEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.closeRoomEx = closeRoomEx;
function getRoomAttendees() {
    return getRoomAttendeesEx(undefined);
}
exports.getRoomAttendees = getRoomAttendees;
function getRoomAttendeesEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        if (info.meetState == 4) {
            return info.memberList;
        }
        let ret = info.engine.getRoomAttendees();
        info.memberList = ret;
        return ret;
    }
    (0, rk_clound_conference_engine_1.logWarn)(`getRoomAttendeesEx error, conn not exist! ${JSON.stringify(conn)}`);
    return [];
}
exports.getRoomAttendeesEx = getRoomAttendeesEx;
function getAttendeeInfo(pUserName) {
    return getAttendeeInfoEx(undefined, pUserName);
}
exports.getAttendeeInfo = getAttendeeInfo;
function getAttendeeInfoEx(conn, pUserName) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        if (info.meetState == 4) {
            return undefined;
        }
        return info.engine.getAttendeeInfo(pUserName);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`getAttendeeInfoEx error, conn not exist! ${JSON.stringify(conn)}`);
    return undefined;
}
exports.getAttendeeInfoEx = getAttendeeInfoEx;
function getRoomAttendeeCount() {
    return getRoomAttendeeCountEx(undefined);
}
exports.getRoomAttendeeCount = getRoomAttendeeCount;
function getRoomAttendeeCountEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.getRoomAttendeeCount();
    }
    (0, rk_clound_conference_engine_1.logWarn)(`getRoomAttendeeCountEx error, conn not exist! ${JSON.stringify(conn)}`);
    return 0;
}
exports.getRoomAttendeeCountEx = getRoomAttendeeCountEx;
function getRoomInfo() {
    return getRoomInfoEx(undefined);
}
exports.getRoomInfo = getRoomInfo;
function getRoomInfoEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.getRoomInfo();
    }
    (0, rk_clound_conference_engine_1.logWarn)(`getRoomInfoEx error, conn not exist! ${JSON.stringify(conn)}`);
    return undefined;
}
exports.getRoomInfoEx = getRoomInfoEx;
function sendMessage(msg, to) {
    return sendMessageEx(msg, to, undefined);
}
exports.sendMessage = sendMessage;
function sendMessageEx(msg, to, conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.sendMessage(msg, to);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`sendMessageEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.sendMessageEx = sendMessageEx;
function asyncSendMessage(msg, to) {
    return asyncSendMessageEx(msg, to, undefined);
}
exports.asyncSendMessage = asyncSendMessage;
function asyncSendMessageEx(msg, to, conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.asyncSendMessage(msg, to);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`asyncSendMessageEx error, conn not exist! ${JSON.stringify(conn)}`);
    return Promise.reject(new rk_clound_conference_engine_1.messageResult(common_enum_1.ErrorCode.NOT_FOUND, ""));
}
exports.asyncSendMessageEx = asyncSendMessageEx;
function getLogPath() {
    return getLogPathEx(undefined);
}
exports.getLogPath = getLogPath;
function getLogPathEx(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.getLogPath();
    }
    (0, rk_clound_conference_engine_1.logWarn)(`getLogPathEx error, conn not exist! ${JSON.stringify(conn)}`);
    return "";
}
exports.getLogPathEx = getLogPathEx;
function setReconnectResumedMediaType(audio, video, videoShare) {
    return setReconnectResumedMediaTypeEx(undefined, audio, video, videoShare);
}
exports.setReconnectResumedMediaType = setReconnectResumedMediaType;
function setReconnectResumedMediaTypeEx(conn, audio, video, videoShare) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.setReconnectResumedMediaType(audio, video, videoShare);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`setReconnectResumedMediaTypeEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.setReconnectResumedMediaTypeEx = setReconnectResumedMediaTypeEx;
function takeSnapshot(userId, srcType, filePath) {
    return takeSnapshotEx(undefined, userId, srcType, filePath);
}
exports.takeSnapshot = takeSnapshot;
function takeSnapshotEx(conn, userId, srcType, filePath) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.takeSnapshot(userId, srcType, filePath);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`takeSnapshotEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.takeSnapshotEx = takeSnapshotEx;
function setRemoteDefaultVideoStreamType(streamType) {
    return setRemoteDefaultVideoStreamTypeEx(undefined, streamType);
}
exports.setRemoteDefaultVideoStreamType = setRemoteDefaultVideoStreamType;
function setRemoteDefaultVideoStreamTypeEx(conn, streamType) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.setRemoteDefaultVideoStreamType(streamType);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`setRemoteDefaultVideoStreamTypeEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.setRemoteDefaultVideoStreamTypeEx = setRemoteDefaultVideoStreamTypeEx;
function enableDualStreamMode(isEnable) {
    return enableDualStreamModeEx(undefined, isEnable);
}
exports.enableDualStreamMode = enableDualStreamMode;
function enableDualStreamModeEx(conn, isEnable) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.enableDualStreamMode(isEnable);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`enableDualStreamModeEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.enableDualStreamModeEx = enableDualStreamModeEx;
function setRemoteVideoStreamType(pUserId, streamType) {
    return setRemoteVideoStreamTypeEx(undefined, pUserId, streamType);
}
exports.setRemoteVideoStreamType = setRemoteVideoStreamType;
function setRemoteVideoStreamTypeEx(conn, pUserId, streamType) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.setRemoteVideoStreamType(pUserId, streamType);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`setRemoteVideoStreamTypeEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.setRemoteVideoStreamTypeEx = setRemoteVideoStreamTypeEx;
function onEvent(eventKey, fun) {
    if (!fun) {
        m_NodeEventEmitter.removeAllListeners(eventKey);
        (0, rk_clound_conference_engine_1.logInfo)(`onConnectionEvent ${eventKey} removeAllListeners`);
    }
    else {
        m_NodeEventEmitter.on(eventKey, fun);
        (0, rk_clound_conference_engine_1.logInfo)(`onConnectionEvent ${eventKey} addListener`);
    }
}
exports.onEvent = onEvent;
function onConnectionEvent(eventKey, fun) {
    onEvent(eventKey, fun);
}
exports.onConnectionEvent = onConnectionEvent;
function onRtcStats(callback) {
    onEvent("OnRtcStats", callback);
}
exports.onRtcStats = onRtcStats;
function onActiveSpeaker(callback) {
    onEvent("OnActiveSpeaker", callback);
}
exports.onActiveSpeaker = onActiveSpeaker;
function onRoomMemberStateChange(callback) {
    onEvent("OnRoomMemberStateChange", callback);
}
exports.onRoomMemberStateChange = onRoomMemberStateChange;
function onRoomStateChange(callback) {
    onEvent("OnRoomStateChange", callback);
}
exports.onRoomStateChange = onRoomStateChange;
function onRoomError(callback) {
    onEvent("OnRoomError", callback);
}
exports.onRoomError = onRoomError;
function onAudioDeviceStateChange(callback) {
    onEvent("OnAudioDeviceStateChange", callback);
}
exports.onAudioDeviceStateChange = onAudioDeviceStateChange;
function onVideoDeviceStateChange(callback) {
    onEvent("OnVideoDeviceStateChange", callback);
}
exports.onVideoDeviceStateChange = onVideoDeviceStateChange;
function onAudioDeviceVolumeChanged(callback) {
    onEvent("OnAudioDeviceVolumeChanged", callback);
}
exports.onAudioDeviceVolumeChanged = onAudioDeviceVolumeChanged;
function onAudioDeviceVolumeChangedEx(callback) {
    onEvent("OnAudioDeviceVolumeChangedEx", callback);
}
exports.onAudioDeviceVolumeChangedEx = onAudioDeviceVolumeChangedEx;
function onRepeatLogin(callback) {
    onEvent("OnRepeatLogin", callback);
}
exports.onRepeatLogin = onRepeatLogin;
function onAudioDefaultDeviceChanged(callback) {
    onEvent("OnAudioDefaultDeviceChanged", callback);
}
exports.onAudioDefaultDeviceChanged = onAudioDefaultDeviceChanged;
function onAudioDefaultDeviceChangedEx(callback) {
    onEvent("OnAudioDefaultDeviceChangedEx", callback);
}
exports.onAudioDefaultDeviceChangedEx = onAudioDefaultDeviceChangedEx;
function onMessage(callback) {
    onEvent("OnMessage", callback);
}
exports.onMessage = onMessage;
function OnAudioStateChanged(callback) {
    onEvent("OnAudioStateChanged", callback);
}
exports.OnAudioStateChanged = OnAudioStateChanged;
function OnVideoStateChanged(callback) {
    onEvent("OnVideoStateChanged", callback);
}
exports.OnVideoStateChanged = OnVideoStateChanged;
function onNetworkQuality(callback) {
    onEvent("OnNetworkQuality", callback);
}
exports.onNetworkQuality = onNetworkQuality;
function onSnapshotTaken(callback) {
    onEvent("OnSnapshotTaken", callback);
}
exports.onSnapshotTaken = onSnapshotTaken;
function onDataChannelStateChanged(callback) {
    onEvent("OnDataChannelStateChanged", callback);
}
exports.onDataChannelStateChanged = onDataChannelStateChanged;
function getVideoFrame(puid, videoSourceType) {
    return getVideFrameEx(undefined, puid, videoSourceType);
}
exports.getVideoFrame = getVideoFrame;
function getVideFrameEx(conn, puid, videoSourceType) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.getVideoFrame(puid, videoSourceType);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`getVideoFrameEx error, conn not exist! ${JSON.stringify(conn)}`);
    return undefined;
}
exports.getVideFrameEx = getVideFrameEx;
function createDataChannel(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.createDataChannel();
    }
    (0, rk_clound_conference_engine_1.logWarn)(`createDataChannelEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.createDataChannel = createDataChannel;
function subscribeData(conn, topicName) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.subscribeData(topicName);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`subscribeDataEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.subscribeData = subscribeData;
function unsubscribeData(conn, topicName) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.unsubscribeData(topicName);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`unsubscribeDataEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.unsubscribeData = unsubscribeData;
function deleteDataChannel(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.deleteDataChannel();
    }
    (0, rk_clound_conference_engine_1.logWarn)(`deleteDataChannelEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.deleteDataChannel = deleteDataChannel;
function getAudioCaptureDeviceVolume(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.getAudioCaptureDeviceVolume();
    }
    (0, rk_clound_conference_engine_1.logWarn)(`getAudioCaptureDeviceVolumeEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.getAudioCaptureDeviceVolume = getAudioCaptureDeviceVolume;
function setAudioCaptureDeviceVolume(conn, volume) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.setAudioCaptureDeviceVolume(volume);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`setAudioCaptureDeviceVolumeEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.setAudioCaptureDeviceVolume = setAudioCaptureDeviceVolume;
function getSpeakerDeviceVolume(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.getSpeakerDeviceVolume();
    }
    (0, rk_clound_conference_engine_1.logWarn)(`getSpeakerDeviceVolumeEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.getSpeakerDeviceVolume = getSpeakerDeviceVolume;
function setSpeakerDeviceVolume(conn, volume) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.setSpeakerDeviceVolume(volume);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`setSpeakerDeviceVolumeEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.setSpeakerDeviceVolume = setSpeakerDeviceVolume;
function startSpeakerDeviceTest(conn, audioFilePath) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.startSpeakerDeviceTest(audioFilePath);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`startSpeakerDeviceTestEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.startSpeakerDeviceTest = startSpeakerDeviceTest;
function stopSpeakerDeviceTest(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.stopSpeakerDeviceTest();
    }
    (0, rk_clound_conference_engine_1.logWarn)(`stopSpeakerDeviceTestEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.stopSpeakerDeviceTest = stopSpeakerDeviceTest;
function startAudioDeviceLoopbackTest(conn, indicationInterval) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.startAudioDeviceLoopbackTest(indicationInterval);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`startAudioDeviceLoopbackTestEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.startAudioDeviceLoopbackTest = startAudioDeviceLoopbackTest;
function stopAudioDeviceLoopbackTest(conn) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.stopAudioDeviceLoopbackTest();
    }
    (0, rk_clound_conference_engine_1.logWarn)(`stopAudioDeviceLoopbackTestEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.stopAudioDeviceLoopbackTest = stopAudioDeviceLoopbackTest;
function setScreenShareSceneMode(conn, screenMode) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.setScreenShareSceneMode(screenMode);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`setScreenShareSceneModeEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.setScreenShareSceneMode = setScreenShareSceneMode;
function enableAINSMode(conn, enable) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.enableAINSMode(enable);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`enableAINSModeEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.enableAINSMode = enableAINSMode;
function setFrameRate(id, type, fps) {
    return setFrameRateEx(undefined, id, type, fps);
}
exports.setFrameRate = setFrameRate;
function setFrameRateEx(conn, id, type, fps) {
    let info = getConnectionInfo(conn);
    if (info != undefined) {
        return info.engine.setFrameRate(id, type, fps);
    }
    (0, rk_clound_conference_engine_1.logWarn)(`setFrameRateEx error, conn not exist! ${JSON.stringify(conn)}`);
    return common_enum_1.ErrorCode.NOT_FOUND;
}
exports.setFrameRateEx = setFrameRateEx;
//# sourceMappingURL=rk_clound_conference_extend.js.map