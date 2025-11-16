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
exports.setAudioRecordingDevice = exports.setAudioPlaybackDevice = exports.getAudioRecordingDevices = exports.getAudioPlaybackDevices = exports.stopScreenShare = exports.startScreenShare = exports.subscribe = exports.updateChannelMediaOptions = exports.getScreenWindowsInfo = exports.sendMessageEx = exports.sendMessage = exports.onMessage = exports.leaveChannelEx = exports.leaveChannel = exports.joinChannelEx = exports.joinChannel = exports.initialize = void 0;
const UseTimeLogUtil_1 = require("../../../utils/UseTimeLogUtil");
let m_UseTimeLog = new UseTimeLogUtil_1.UseTimeLog(false);
m_UseTimeLog.start("RtcHelper");
const RtcSdk_1 = require("../../../renderer/rtcsdk/RtcSdk");
m_UseTimeLog.end("1");
const events_1 = require("events");
const MainWindowHelper_1 = __importDefault(require("../../../renderer/MainWindowHelper"));
m_UseTimeLog.end("2");
const RendererHelper = __importStar(require("../../../renderer/RendererHelper"));
m_UseTimeLog.end("3");
const path_1 = __importDefault(require("path"));
m_UseTimeLog.end("31");
m_UseTimeLog.end("32");
m_UseTimeLog.end("4");
let m_EventEmitter = new events_1.EventEmitter();
let m_RtcSdk;
let m_LogPath;
let m_SdkType = 0;
let m_myUid;
let m_Disconnet = false;
let m_shareUid;
let m_Lock;
async function initialize({ appid, userId, token, areaCode, sdkType }) {
    m_RtcSdk = (0, RtcSdk_1.createRtcSdk)(sdkType);
    m_SdkType = sdkType;
    if (!m_LogPath) {
        m_LogPath = await RendererHelper.getUserLogPath();
    }
    const { dateFormat } = require("../../../utils/DateUtil");
    let rtcLogPath = path_1.default.join(m_LogPath, `agora/agoraSdk_${dateFormat("yyyyMMdd")}.log`);
    const fs = require("fs");
    if (sdkType == 1) {
        let dateStr = dateFormat("yyyyMMdd");
        rtcLogPath = path_1.default.join(m_LogPath, "cx_rtc", dateStr);
        if (!fs.existsSync(rtcLogPath)) {
            fs.mkdirSync(rtcLogPath, { recursive: true });
        }
        m_RtcSdk.setLogPath(rtcLogPath);
    }
    else {
        let pLogDir = path_1.default.dirname(rtcLogPath);
        if (!fs.existsSync(pLogDir)) {
            fs.mkdirSync(pLogDir, { recursive: true });
        }
    }
    console.log(`AudioVideoScreenRTC initialize appid ${appid}, userId ${userId}, token ${token}, areaCode ${areaCode}, sdkType ${sdkType}`);
    return m_RtcSdk
        .initialize(appid, userId, token, areaCode, { filePath: rtcLogPath })
        .then((value) => {
        if (value == 0) {
            m_RtcSdk.enableVideo();
            initCallbacks();
        }
        else {
            RendererHelper.alert("连接失败，请切换网络后重试", {
                okClick: () => {
                    window.close();
                },
            });
        }
        return value;
    });
}
exports.initialize = initialize;
function release() {
    if (m_RtcSdk) {
        if (m_SdkType == 0) {
            m_RtcSdk.leaveChannel();
        }
        m_RtcSdk.release(true);
        m_RtcSdk = undefined;
    }
}
function initCallbacks() {
    m_RtcSdk.onJoinedChannel((channel, uid, elapsed) => {
        console.info(`AudioVideoScreenRTC joined Video channel ${channel} with uid ${uid}, elapsed ${elapsed}ms`);
        m_myUid = uid;
        m_EventEmitter.emit("joinChannel", channel, uid, elapsed);
    });
    m_RtcSdk.onRejoinedChannel((channel, uid, elapsed) => {
        console.info(`AudioVideoScreenRTC rejoined Video channel ${channel} with uid ${uid}, elapsed ${elapsed}ms`);
        m_EventEmitter.emit("rejoinChannel", channel, uid, elapsed);
    });
    m_RtcSdk.onUserJoined((uid, elapsed) => {
        console.info(`AudioVideoScreenRTC userJoined uid ${uid}, elapsed ${elapsed}ms`);
        m_EventEmitter.emit("userJoined", uid, elapsed);
    });
    m_RtcSdk.onUserOffline((uid, reason) => {
        console.info(`AudioVideoScreenRTC userOffline uid ${uid}, reason ${reason}`);
        m_EventEmitter.emit("userOffline", uid, reason);
    });
    m_RtcSdk.onError((err, msg) => {
        console.error(`rtcHelper on error: code ${err} - ${msg}`);
        m_EventEmitter.emit("error", err, msg);
    });
    m_RtcSdk.onRtcError((errcode, rtcErrorCode, errMsg) => {
        console.error(`rtcHelper on rtcerror: err:${errcode},code ${rtcErrorCode} , ${errMsg}`);
        if (rtcErrorCode == 12) {
            RendererHelper.alert("操作失败");
        }
    });
    m_RtcSdk.onRemoteVideoStateChanged((uid, state, reason, elapsed) => {
        console.info(`AudioVideoScreenRTC远端视频流状态发生改变回调: ${uid} - ${state} - ${reason} - ${elapsed}`);
        m_EventEmitter.emit("remoteVideoStateChanged", uid, state, reason, elapsed);
    });
    m_RtcSdk.onRemoteScreenShareStateChanged((uid, state, reason) => {
        console.info(`远端屏幕共享流状态发生改变回调: ${uid} - ${state} - ${reason}`);
        if (state == 1) {
            let div = document.getElementById("rtcView");
            m_RtcSdk.subscribe(uid, div, undefined, true);
            if (m_Lock == 1) {
                RendererHelper.setAlwaysOnTop(true);
                if (process.platform == "darwin") {
                    RendererHelper.sendToMainProcess("_setVisibleOnAllWorkspaces", true);
                }
            }
        }
        else if (state == 0) {
            unLockScreen();
        }
    });
    m_RtcSdk.onRoomStateChange((state) => {
        if (state == 4) {
            m_Disconnet = true;
            m_EventEmitter.emit("showMsgToast", "断线中，正在重连...");
        }
        else if (state == 3) {
            m_Disconnet = false;
            m_EventEmitter.emit("hideMsgToast");
        }
    });
    m_RtcSdk.onNetworkQuality((uid, txquality, rxquality) => {
        if (uid == m_myUid) {
            if (txquality == 0 && rxquality == 0) {
                return;
            }
            if (m_Disconnet) {
                return;
            }
            if (txquality == 6 || rxquality == 6) {
                m_EventEmitter.emit("showMsgToast", "断线中，正在重连...");
                return;
            }
            if (txquality > 4 || rxquality > 4) {
                m_EventEmitter.emit("showMsgToast", "当前网络质量不佳...");
            }
            else {
                m_EventEmitter.emit("hideMsgToast");
            }
        }
    });
}
function joinChannel(token, channel, info, uid) {
    let options = {
        publishCameraTrack: false,
        publishMicrophoneTrack: false,
        publishScreenTrack: false,
        autoSubscribeAudio: false,
        autoSubscribeVideo: false,
        clientRoleType: 2,
        VideoStreamType: 0,
        channelProfile: 1,
        publishRhythmPlayerTrack: false,
    };
    return m_RtcSdk.joinChannel(token, channel, info, parseInt(uid), options);
}
exports.joinChannel = joinChannel;
function joinChannelEx(token, channel, info, uid, options) {
    return m_RtcSdk.joinChannelEx(token, channel, info, uid, options);
}
exports.joinChannelEx = joinChannelEx;
function leaveChannel() {
    return m_RtcSdk.leaveChannel();
}
exports.leaveChannel = leaveChannel;
function leaveChannelEx(conn) {
    return m_RtcSdk.leaveAssistChannel(conn.channelId, conn.localUid);
}
exports.leaveChannelEx = leaveChannelEx;
function onMessage(callback) {
    m_RtcSdk.onMessage(callback);
}
exports.onMessage = onMessage;
function sendMessage(msg, to) {
    return m_RtcSdk.sendMessage(msg, to);
}
exports.sendMessage = sendMessage;
function sendMessageEx(msg, to, conn) {
    return m_RtcSdk.sendMessageEx(msg, to, conn);
}
exports.sendMessageEx = sendMessageEx;
async function getScreenWindowsInfo() {
    let screenWindowsInfo = await m_RtcSdk.getScreenWindowsInfo();
    if (process.platform == "darwin" && m_SdkType == 1) {
        const { Monitor, Window } = require("node-screenshots");
        let monitors = Monitor.all();
        let windowInfos = Window.all();
        for (let i = 0; i < monitors.length; i++) {
            let screenInfo = monitors[i];
            if (screenInfo.isPrimary) {
                if (i != 0) {
                    monitors.splice(i, 1);
                    monitors.unshift(screenInfo);
                }
                break;
            }
        }
        let screenIndex = 0;
        for (let dataInfo of screenWindowsInfo.displaysInfo) {
            let winInfo = monitors[screenIndex];
            dataInfo.x = dataInfo.displayId.x = winInfo.x;
            dataInfo.y = dataInfo.displayId.y = winInfo.y;
            dataInfo.width = dataInfo.displayId.width = winInfo.width;
            dataInfo.height = dataInfo.displayId.height = winInfo.height;
            dataInfo.priScreen = winInfo.isPrimary;
            screenIndex++;
        }
        for (let dataInfo of screenWindowsInfo.windowsInfo) {
            for (let i = 0; i < windowInfos.length; i++) {
                let winInfo = windowInfos[i];
                if (dataInfo) {
                    if (dataInfo.windowId == winInfo.id) {
                        dataInfo.x = winInfo.x;
                        dataInfo.y = winInfo.y;
                        dataInfo.width = winInfo.width;
                        dataInfo.height = winInfo.height;
                        windowInfos.splice(i, 1);
                        break;
                    }
                }
            }
        }
        return screenWindowsInfo;
    }
    else {
        return screenWindowsInfo;
    }
}
exports.getScreenWindowsInfo = getScreenWindowsInfo;
function updateChannelMediaOptions(options) {
    return m_RtcSdk.updateChannelMediaOptions(options);
}
exports.updateChannelMediaOptions = updateChannelMediaOptions;
function subscribe(uid, view, options, isScreenShare) {
    m_RtcSdk.muteRemoteVideoStream(uid, false);
    return m_RtcSdk.subscribe(uid, view, options, isScreenShare);
}
exports.subscribe = subscribe;
function startScreenShare(screenType, channelCode, winInfo, screenToken, scrennUserId, screenConfig) {
    m_RtcSdk.setClientRole(1);
    return m_RtcSdk.startScreenShare2(screenType, channelCode, winInfo, screenToken, parseInt(scrennUserId), screenConfig);
}
exports.startScreenShare = startScreenShare;
function stopScreenShare() {
    if (m_RtcSdk) {
        return m_RtcSdk.stopScreenShare2();
    }
}
exports.stopScreenShare = stopScreenShare;
function on(key, callback) {
    m_EventEmitter.on(key, callback);
}
function once(key, callback) {
    m_EventEmitter.once(key, callback);
}
function enableLoopbackRecording(enable) {
    m_RtcSdk.enableLoopbackRecording(enable);
}
RendererHelper.on("_meetOperate", (parms1) => {
    let parms = parms1.data;
    let sender = parms1.sender;
    console.log("on _meetOperate:", JSON.stringify(parms));
    if (!parms || !parms.type) {
        return;
    }
    if (parms.type == "showScreen") {
        showShareScreenConfirm(parms, sender);
    }
    else if (parms.type == "broadcastScreen") {
        lockScreen(parms);
    }
    else if (parms.type == "unBroadcastScreen") {
        unLockScreen(parms);
    }
    else if (parms.type == "unShowScreen") {
        stopScreen(parms);
    }
    else if (parms.type == "endMeeting") {
        stopScreen(parms);
    }
    else if (parms.type == "screenSoundOp") {
        enableLoopbackRecording(parms.tag == 1);
    }
    else if (parms.type == "agreeShare") {
        const deviceId = parms.deviceId;
        const uuid = parms.uuid;
        const { machineIdSync } = require("./utils/MachineIdUtil");
        if (!deviceId || deviceId != machineIdSync(true)) {
            return;
        }
        let options = {
            id: "stuShowBox",
            frame: false,
            fullscreen: true,
            transparent: true,
        };
        if (getClientApiVersion() > 52) {
            RendererHelper.openWindow("https://fe.chaoxing.com/front/ktmeet/pages/stuShowBox.html?uuid=" +
                uuid +
                "&_t=" +
                new Date().getTime(), options);
        }
        else {
            RendererHelper.openWindow("https://k.chaoxing.com/res/front/pages/stuShowBox.html?uuid=" +
                uuid +
                "&_t=" +
                new Date().getTime(), options);
        }
    }
    else if (parms.type == "otherDeviceSharing") {
        const { machineIdSync } = require("./utils/MachineIdUtil");
        const deviceId = parms.deviceId;
        if (!deviceId || deviceId != machineIdSync(true)) {
            return;
        }
        RendererHelper.alert("您已在其他设备中共享");
    }
});
function getClientApiVersion() {
    const userAgent = navigator.userAgent;
    const pattern = ".*ChaoXingStudy_(\\d+)_(\\d+[^_]*)_([^_]*)_([^_]*)_([^ ]*)?( \\([^)]*\\))?.*_(.*[-]?\\w+).*";
    if (userAgent.indexOf("ChaoXingStudy_") === -1) {
        return 0;
    }
    const versionArray = userAgent.match(pattern);
    if (typeof versionArray !== "undefined" && versionArray.length > 6) {
        return parseInt(versionArray[5].split("_")[1]);
    }
    return 0;
}
function updateScreenCaptureParameters(param) {
    if (param && m_RtcSdk) {
        return m_RtcSdk.videoSourceUpdateScreenCaptureParameters(param);
    }
}
function showShareScreenConfirm(parms1, sender) {
    RendererHelper.confirm(`${parms1.name}请求展示你的屏幕`, {
        okBtn: "同意",
        cancelBtn: "拒绝",
        winConfig: { subWindow: false },
        okClick: async () => {
            const { machineIdSync } = require("./utils/MachineIdUtil");
            let uid = await MainWindowHelper_1.default.getUID();
            let parms = {
                puid: uid,
                status: 1,
                meetUuid: parms1.meetUuid,
                requestUuid: parms1.requestUuid,
            };
            let res = await MainWindowHelper_1.default.updateStuShowRecord(parms);
            if (res) {
                if (res.result == 1) {
                    MainWindowHelper_1.default.sendImMessage({
                        type: "cmd",
                        chatType: "singleChat",
                        to: sender,
                        action: "CMD_MEET_RTC_TEA_SCREEN",
                        ext: {
                            type: "agreeScreenSharing",
                            shareUidSelf: parms1.shareUidSelf,
                            deviceId: machineIdSync(true),
                        },
                    });
                }
                else {
                    RendererHelper.toast(res.errorMsg);
                }
            }
        },
        cancelClick: async () => {
            let uid = await MainWindowHelper_1.default.getUID();
            let parms = {
                puid: uid,
                status: 1,
                meetUuid: parms1.meetUuid,
                requestUuid: parms1.requestUuid,
            };
            let res = await MainWindowHelper_1.default.updateStuShowRecord(parms);
            if (res) {
                if (res.result == 1) {
                    MainWindowHelper_1.default.sendImMessage({
                        type: "cmd",
                        chatType: "singleChat",
                        to: sender,
                        action: "CMD_MEET_RTC_TEA_SCREEN",
                        ext: {
                            type: "rejectScreenSharing",
                            shareUidSelf: parms1.shareUidSelf,
                        },
                    });
                    window.close();
                }
                else {
                    RendererHelper.toast(res.errorMsg);
                }
            }
        },
    });
}
function stopScreen(parms) {
    stopScreenShare();
    release();
    window.close();
}
function lockScreen(parms1) {
    if (m_RtcSdk) {
        return;
    }
    m_SdkType = parms1.sdkType;
    m_Lock = parms1.lock;
    let div = document.getElementById("rtcView");
    if (!div) {
        setTimeout(() => {
            lockScreen(parms1);
        }, 100);
        return;
    }
    div.innerHTML = "";
    return MainWindowHelper_1.default.getUID().then((UID) => {
        if (UID) {
            if (parms1.excludePuids && parms1.excludePuids.length > 0) {
                for (let excludePuid of parms1.excludePuids) {
                    if (UID + "" == excludePuid + "") {
                        window.close();
                        return;
                    }
                }
            }
            if (UID == parms1.subscribeUids[0]) {
                return;
            }
            let params = {
                baseUrl: "https://k.chaoxing.com",
                url: "/apis/meet/getTokens",
                getParams: {
                    puid: UID,
                    channel: parms1.meetCode,
                },
                tokenSign: true,
            };
            return MainWindowHelper_1.default.genRequest(params)
                .then((tokenResult) => {
                if (tokenResult && tokenResult.result) {
                    let tokenMsg = tokenResult.msg;
                    console.log("tokenResult:", tokenResult);
                    if (m_LogPath) {
                        return {
                            appid: tokenMsg.rtc_appid,
                            token: tokenMsg.rtc_video_token,
                            meetCode: parms1.meetCode,
                            shareUid: parms1.subscribeUids[0],
                            logPath: m_LogPath,
                        };
                    }
                    else {
                        return RendererHelper.getUserLogPath().then((useDataPath) => {
                            if (!m_LogPath) {
                                m_LogPath = useDataPath;
                            }
                            if (m_SdkType == 1) {
                                return {
                                    appid: tokenMsg.rtc_appid,
                                    token: tokenMsg.rongke_token,
                                    meetCode: parms1.meetCode,
                                    shareUid: parms1.subscribeUids[0],
                                    logPath: m_LogPath,
                                };
                            }
                            else {
                                return {
                                    appid: tokenMsg.rtc_appid,
                                    token: tokenMsg.rtc_video_token,
                                    meetCode: parms1.meetCode,
                                    shareUid: parms1.subscribeUids[0],
                                    logPath: m_LogPath,
                                };
                            }
                        });
                    }
                }
            })
                .then((datas) => {
                m_shareUid = datas.shareUid;
                let userId = UID;
                if (m_SdkType == 1) {
                    userId = {
                        userId: userId,
                        userName: userId,
                        password: datas.token,
                    };
                }
                initialize({
                    appid: datas.appid,
                    token: datas.token,
                    areaCode: undefined,
                    userId,
                    sdkType: m_SdkType,
                });
                return datas;
            })
                .then((datas) => {
                return new Promise((resolve, reject) => {
                    RendererHelper.fullScreenWindow(true);
                    RendererHelper.showWindow();
                    RendererHelper.emit("showLockScreenPop", {
                        name: parms1.name,
                        puid: parms1.shareUidSelf,
                    });
                    RendererHelper.on("startLockScreenForMeet", () => {
                        RendererHelper.off("startLockScreenForMeet");
                        console.log("开始共享主屏");
                        resolve(datas);
                    });
                });
            })
                .then((datas) => {
                m_RtcSdk.enableSubscribe(true, true);
                m_EventEmitter.removeAllListeners("joinChannel");
                once("joinChannel", () => {
                    if (m_SdkType == 0) {
                        m_RtcSdk.muteRemoteVideoStream(parseInt(datas.shareUid), false);
                        m_RtcSdk.muteRemoteAudioStream(parseInt(datas.shareUid), false);
                        m_EventEmitter.removeAllListeners("remoteVideoStateChanged");
                        console.log("pre remoteVideoStateChanged");
                        on("remoteVideoStateChanged", (uid, state, reason, elapsed) => {
                            console.log("remoteVideoStateChanged:", uid, state);
                            if (uid + "" == datas.shareUid + "") {
                                if (state == 1) {
                                    m_RtcSdk.subscribe(parseInt(datas.shareUid), div, undefined, true);
                                    if (parms1.lock == 1) {
                                        RendererHelper.setAlwaysOnTop(true);
                                    }
                                }
                                else if (state == 0) {
                                    unLockScreen();
                                }
                            }
                        });
                    }
                });
                console.log("joinChannel:token:", datas.token);
                joinChannel(datas.token, datas.meetCode, "", UID);
            });
        }
    });
}
function unLockScreen(parms) {
    window.close();
}
function getAudioPlaybackDevices() {
    return m_RtcSdk.getAudioPlaybackDevices();
}
exports.getAudioPlaybackDevices = getAudioPlaybackDevices;
function getAudioRecordingDevices() {
    return m_RtcSdk.getAudioRecordingDevices();
}
exports.getAudioRecordingDevices = getAudioRecordingDevices;
function setAudioPlaybackDevice(deviceId) {
    return m_RtcSdk.setAudioPlaybackDevice(deviceId);
}
exports.setAudioPlaybackDevice = setAudioPlaybackDevice;
function setAudioRecordingDevice(deviceId) {
    return m_RtcSdk.setAudioRecordingDevice(deviceId);
}
exports.setAudioRecordingDevice = setAudioRecordingDevice;
m_UseTimeLog.end("5");
const exportDefault = {
    initialize,
    joinChannel,
    joinChannelEx,
    leaveChannel,
    leaveChannelEx,
    onMessage,
    sendMessage,
    sendMessageEx,
    on,
    getScreenWindowsInfo,
    startScreenShare,
    stopScreenShare,
    updateChannelMediaOptions,
    subscribe,
    release,
    enableLoopbackRecording,
    updateScreenCaptureParameters,
    getAudioPlaybackDevices,
    getAudioRecordingDevices,
    setAudioPlaybackDevice,
    setAudioRecordingDevice,
};
exports.default = exportDefault;
module.exports = exportDefault;
//# sourceMappingURL=RtcHelper.js.map