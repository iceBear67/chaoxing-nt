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
exports.isShowScreen = exports.getCurrentAudioPlaybackDevice = exports.getCurrentAudioRecordingDevice = exports.setAudioRecordingDevice = exports.setAudioPlaybackDevice = exports.getAudioRecordingDevices = exports.getAudioPlaybackDevices = exports.hideToastMsg = exports.toastMsgLong = exports.onNetworkQualityChanged = exports.onScreenSharePaused = exports.onScreenShareStopByWindowClosed = exports.onAudioVolumeIndication = exports.onRemoteLogin = exports.onUserOffline = exports.onUserJoined = exports.enableLoopbackRecording = exports.onRtcError = exports.onMessageReceived = exports.onRemoteAuidoStateChanged = exports.onRemoteScreenShareStateChanged = exports.releaseSdk = exports.getChannelMemebers = exports.sendMessage = exports.stopScreenShare = exports.startScreenShare = exports.getScreenWindowsInfo = exports.muteRemoteAudio = exports.subscribeVideo = exports.levaeChannel = exports.joinChannel = exports.setAutoSubscribeAudio = void 0;
const UseTimeLogUtil_1 = require("../../../utils/UseTimeLogUtil");
let m_UseTimeLog = new UseTimeLogUtil_1.UseTimeLog(false);
m_UseTimeLog.start("ProjectionRtcHelper");
const RtcSdk_1 = require("../../../renderer/rtcsdk/RtcSdk");
m_UseTimeLog.end("1");
m_UseTimeLog.end("2");
const events_1 = require("events");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DateUtil_1 = require("../../../utils/DateUtil");
const RendererHelper_1 = require("../../../renderer/RendererHelper");
const RendererHelper = __importStar(require("../../../renderer/RendererHelper"));
const WinId_1 = __importDefault(require("../../../common/WinId"));
let m_EventEmitter = new events_1.EventEmitter();
const SCREEN_SHARE_CONFIG = {
    width: 1920,
    height: 1080,
    bitrate: 0,
    frameRate: 15,
    captureMouseCursor: true,
    windowFocus: true,
    highLightWidth: 0,
    highLightColor: 0,
    enableHighLight: false,
    webProfile: "1080p_1",
};
class RtcParms {
    constructor() {
        this.channelCodes = [];
        this.disconnect = false;
    }
}
let m_RtcSdk;
let m_RtmSdk;
let m_RtmChannelMap = new Map();
let m_CurScreenShareChannelCode;
let m_ScreenShareConnections = [];
let m_IScreenShare = false;
let m_RtcParms = new RtcParms();
let m_isShowScreen = false;
function getSdkPuid(puid) {
    if (m_RtcParms.sdkType == 1) {
        return puid + "";
    }
    else {
        if (typeof puid == "string") {
            return Number(puid);
        }
        else {
            return puid;
        }
    }
}
function setAutoSubscribeAudio(autoSubscribeAudio) {
    m_RtcSdk?.setAutoSubscribeAudio(autoSubscribeAudio);
}
exports.setAutoSubscribeAudio = setAutoSubscribeAudio;
function isJoinScreenShareChannel(conn) {
    return m_ScreenShareConnections.find((conn2) => conn2.channelId == conn.channelId &&
        conn2.localUid + "" == conn.localUid + "");
}
function removeScreenShareChannel(conn) {
    let index = m_ScreenShareConnections.findIndex((conn2) => conn2.channelId == conn.channelId &&
        conn2.localUid + "" == conn.localUid + "");
    if (index >= 0) {
        m_ScreenShareConnections.splice(index, 1);
    }
}
function getRtcConnection(channelId) {
    if (!channelId) {
        if (m_RtcParms.channelCodes.length > 0) {
            return {
                localUid: m_RtcParms.puid,
                channelId: m_RtcParms.channelCodes[0],
            };
        }
        return undefined;
    }
    return { localUid: m_RtcParms.puid, channelId };
}
async function initSdkLogPath() {
    let m_LogPath = await (0, RendererHelper_1.getUserLogPath)();
    let rtcLogPath = path_1.default.join(m_LogPath, `agora/agoraSdk_${(0, DateUtil_1.dateFormat)("yyyyMMdd")}.log`);
    if (m_RtcParms.sdkType == 1) {
        let dateStr = (0, DateUtil_1.dateFormat)("yyyyMMdd");
        rtcLogPath = path_1.default.join(m_LogPath, "cx_rtc", dateStr);
        if (!fs_1.default.existsSync(rtcLogPath)) {
            fs_1.default.mkdirSync(rtcLogPath, { recursive: true });
        }
    }
    else {
        let pLogDir = path_1.default.dirname(rtcLogPath);
        if (!fs_1.default.existsSync(pLogDir)) {
            fs_1.default.mkdirSync(pLogDir, { recursive: true });
        }
    }
    m_RtcParms.logPath = rtcLogPath;
}
async function initRtcSdk(options) {
    m_isShowScreen = await RendererHelper.invokeToMainProcess("_isShowScreen");
    if (!options.puid) {
        options.puid = await (0, RendererHelper_1.getUID)();
    }
    let sdkTokenInfo = await getRtcSdkTokenInfo(options.puid + "", options.channelCode);
    if (!sdkTokenInfo) {
        console.error(`ProjectionRtcHelper初始化失败。获取token失败！`);
        throw new Error("获取token失败");
    }
    if (options.sdkType == undefined) {
        m_RtcParms.sdkType = sdkTokenInfo.sdkType;
    }
    else {
        m_RtcParms.sdkType = options.sdkType;
    }
    m_RtcParms.puid = getSdkPuid(options.puid);
    m_RtcParms.appId = sdkTokenInfo.tokens.rtc_appid;
    if (m_RtcParms.sdkType == 1) {
        m_RtcParms.puid += "";
        m_RtcParms.rtcToken = sdkTokenInfo.tokens.rongke_token;
    }
    else {
        m_RtcParms.rtcToken = sdkTokenInfo.tokens.rtc_video_token;
    }
    m_RtcParms.rtmToken = sdkTokenInfo.tokens.rtm_video_token;
    options.token = m_RtcParms.rtcToken;
    await initSdkLogPath();
    m_RtcSdk = (0, RtcSdk_1.createRtcSdk)(m_RtcParms.sdkType);
    let userName = m_RtcParms.puid + "";
    let userInfo = await (0, RendererHelper_1.getUser)();
    if (userInfo?.name) {
        userName = userInfo.name;
    }
    let initResult = await m_RtcSdk.initialize3({
        appid: m_RtcParms.appId,
        userId: m_RtcParms.puid,
        userName: userName,
        token: m_RtcParms.rtcToken,
        logConfig: { filePath: m_RtcParms.logPath, fileSizeInKB: 20480, level: 1 },
    });
    if (initResult != 0) {
        console.error(`ProjectionRtcHelper初始化失败。result:${initResult}`);
        m_RtcSdk.release();
        m_RtcSdk = undefined;
        throw new Error("初始化失败");
    }
    else {
        if (m_RtcParms.sdkType == 0) {
            m_RtcSdk.enableAudio();
            m_RtcSdk.enableVideo();
            m_RtcSdk.onTokenPrivilegeWillExpireEx((conn, token) => {
                updateRtcToken(conn);
            });
            await initRtm();
        }
        initCallbacks();
    }
    return initResult;
}
function initCallbacks() {
    m_RtcSdk.onJoinedChannelEx((channel, uid, elapsed) => {
        m_EventEmitter.emit(`joinChannel_${channel}`, channel, uid, elapsed);
    });
    m_RtcSdk.onRtcError((errCode, rtcErrorCode, errMsg) => {
        console.error(`rtcHelper on rtcerror: err:${errCode},code ${rtcErrorCode} , ${errMsg}`);
        m_EventEmitter.emit("rtcError", errCode, rtcErrorCode, errMsg);
        if (m_RtcParms.sdkType == 1) {
            if (rtcErrorCode == 9) {
                m_EventEmitter.emit("joinChannelError", errCode, errMsg);
            }
            else if (rtcErrorCode == 12) {
                m_EventEmitter.emit("screenShareError", errCode, errMsg);
            }
        }
        else {
            if (errCode == "screenShareError") {
                if (rtcErrorCode == 11) {
                    sendPauseSharingMsg(undefined, true);
                }
                else if (rtcErrorCode == 27) {
                    sendPauseSharingMsg(undefined, false);
                }
                else if (rtcErrorCode == 12) {
                    stopScreenShare(m_CurScreenShareChannelCode);
                    m_EventEmitter.emit("screenShareStopByWindowClosed");
                }
            }
        }
    });
    m_RtcSdk.onRoomStateChange((state) => {
        console.log("onRoomStateChange:", state);
        if (state == 4) {
            m_RtcParms.disconnect = true;
            visibleScreenShareDisconnectPage(true);
        }
        else if (state == 3) {
            m_RtcParms.disconnect = false;
            visibleScreenShareDisconnectPage(false);
        }
    });
    m_RtcSdk.onNetworkQualityEx((conn, uid, txquality, rxquality) => {
        if (uid + "" == "0") {
            uid = m_RtcParms.puid;
        }
        if (uid + "" == m_RtcParms.puid + "") {
            if (txquality == 0 && rxquality == 0) {
                return;
            }
            if (txquality == 6 ||
                rxquality == 6 ||
                txquality == 5 ||
                rxquality == 5) {
                m_RtcSdk.sendMessageEx(`{"poorNetwork": {"uid": "${uid}", "status": 0}}`, undefined, conn);
            }
            else {
                m_RtcSdk.sendMessageEx(`{"poorNetwork": {"uid": "${uid}", "status":1}}`, undefined, conn);
            }
            if (m_RtcParms.disconnect) {
                return;
            }
            if (txquality == 6 || rxquality == 6) {
                hideToastMsg();
                visibleScreenShareDisconnectPage(true);
                return;
            }
            visibleScreenShareDisconnectPage(false);
            if (txquality > 4 || rxquality > 4) {
                toastMsgLong("当前网络质量不佳...");
            }
            else {
                hideToastMsg();
            }
        }
        else {
            if (txquality == 0 && rxquality == 0) {
                return;
            }
            m_EventEmitter.emit(`networkQualityChanged_${uid}`, txquality, rxquality);
        }
    });
    m_RtcSdk.onRemoteScreenShareStateChangedEx((conn, uid, state, reason) => {
        console.log("onRemoteScreenShareStateChangedEx:", uid, state, reason);
        if (state == 0) {
            if (reason == 4) {
                if (uid == m_RtcParms.puid) {
                    sendPauseSharingMsg(conn?.channelId, true);
                }
            }
            else if (reason == 5) {
                if (uid == m_RtcParms.puid) {
                    stopScreenShare(conn?.channelId, conn?.localUid);
                    m_EventEmitter.emit("screenShareStopByWindowClosed");
                    return;
                }
            }
        }
        else if (state == 1 || state == 2) {
            if (reason == 6 && uid == m_RtcParms.puid) {
                sendPauseSharingMsg(conn?.channelId, false);
            }
        }
        m_EventEmitter.emit("remoteScreenShareStateChanged", conn.channelId, uid, state, reason);
    });
    m_RtcSdk.onRemoteVideoStateChangedEx((conn, uid, state, reason) => {
        m_EventEmitter.emit("remoteVideoStateChanged", conn.channelId, uid, state, reason);
    });
    m_RtcSdk.onRemoteAudioStateChangedEx((conn, uid, state, reason, elapsed) => {
        console.log("onRemoteAudioStateChangedEx:", uid, state, reason);
        m_RtcSdk.muteRemoteVideoStreamEx(uid, true, conn);
        m_EventEmitter.emit("remoteAudioStateChanged", conn.channelId, uid, state, reason);
    });
    m_RtcSdk.onUserEnableLocalVideoEx((conn, uid, enabled) => {
        if (enabled) {
            m_RtcSdk.muteRemoteVideoStreamEx(uid, false, conn);
        }
    });
    m_RtcSdk.onUserMuteAudioEx((conn, uid, muted) => {
        console.log("onUserMuteAudioEx:", uid, muted);
        m_EventEmitter.emit("remoteAudioStateChanged", conn.channelId, uid, muted ? 0 : 1);
    });
    m_RtcSdk.onRepeatLogin(() => {
        m_EventEmitter.emit("remoteLogin");
    });
    if (m_RtcParms.sdkType == 1) {
        m_RtcSdk?.onUserJoinedEx((conn, uid, elapsed) => {
            if (uid + "" == m_RtcParms.puid + "") {
                return;
            }
            if (!conn) {
                return;
            }
            m_EventEmitter.emit("userJoined", conn.channelId, uid);
        });
        m_RtcSdk?.onUserOfflineEx((conn, uid, elapsed) => {
            if (uid + "" == m_RtcParms.puid + "") {
                return;
            }
            if (!conn) {
                return;
            }
            m_EventEmitter.emit("userOffline", conn.channelId, uid);
        });
        m_RtcSdk.onMessage((msg, conn) => {
            m_EventEmitter.emit("messageReceived", conn.channelId, msg);
        });
    }
    m_EventEmitter.on("messageReceived", (channel, data) => {
        console.log(`onMessageReceived2: ${data?.msgBody} from ${data?.msgFrom}`);
        try {
            let msg = JSON.parse(data?.msgBody);
            if (msg?.pauseSharing) {
                if (msg.pauseSharing.status == 1) {
                    m_EventEmitter.emit("screenSharePaused", msg.uid, channel, true);
                }
                else {
                    m_EventEmitter.emit("screenSharePaused", msg.uid, channel, false);
                }
            }
            else if (msg?.setPutScreenSoundOpen) {
                if (msg.setPutScreenSoundOpen?.type === 1) {
                    enableLoopbackRecording(channel, true);
                }
                else {
                    enableLoopbackRecording(channel, false);
                }
            }
        }
        catch (e) {
            console.error("handleMsgError", e);
        }
    });
}
async function joinChannel(options) {
    try {
        if (!m_RtcSdk) {
            await initRtcSdk(options);
        }
        if (!m_RtcSdk) {
            throw new Error("加入频道失败");
        }
        if (!options.token && m_RtcParms.sdkType == 1) {
            options.token = m_RtcParms.rtcToken;
        }
        if (!options.puid) {
            options.puid = getSdkPuid(m_RtcParms.puid);
        }
        let joinChannelOptions = {
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
        if (options.channelOptions) {
            joinChannelOptions.autoSubscribeAudio =
                options.channelOptions.autoSubscribeAudio;
        }
        let puid = options.puid;
        if (m_RtcParms.sdkType == 0) {
            puid = Number(options.puid);
        }
        else {
            puid += "";
        }
        if (!options.token) {
            options.token = await getRtcSdkToken(options.puid + "", options.channelCode);
            if (!options.token) {
                console.error(`ProjectionRtcHelper初始化失败。获取token失败！!!`);
                throw new Error("加入频道失败");
            }
        }
        let joinChannelResult;
        if (m_RtcParms.channelCodes.length == 0) {
            joinChannelResult = m_RtcSdk.joinChannel(options.token, options.channelCode, "", puid, joinChannelOptions);
        }
        else {
            let userName = m_RtcParms.puid + "";
            let userInfo = await (0, RendererHelper_1.getUser)();
            if (userInfo?.name) {
                userName = userInfo.name;
            }
            joinChannelResult = await m_RtcSdk.joinChannelEx(options.token, options.channelCode, userName, puid, joinChannelOptions);
        }
        if (joinChannelResult !== 0) {
            console.error(`ProjectionRtcHelper加入频道失败:puid:${options.puid},channelCode:${options.channelCode},result:${joinChannelResult}`);
            throw new Error("加入频道失败");
        }
        else {
            await new Promise((resolve, reject) => {
                m_EventEmitter.once(`joinChannel_${options.channelCode}`, () => {
                    m_RtcParms.channelCodes.push(options.channelCode);
                    resolve(true);
                });
                m_EventEmitter.once("joinChannelError", () => {
                    reject("joinChannelError");
                });
                setTimeout(() => {
                    reject("加入频道超时");
                }, 30000);
            });
        }
        if (m_RtcParms.sdkType == 0) {
            joinRtmChannel(options.channelCode);
        }
        else {
            initDefaultPlaybackDevices();
        }
        return true;
    }
    catch (e) {
        console.error("--加入频道失败:", e);
        alertMsg(`连接失败，请切换网络后重试`);
        visibleScreenShareDisconnectPage(false);
        return false;
    }
}
exports.joinChannel = joinChannel;
function levaeChannel(channelCode) {
    m_RtcSdk?.leaveAssistChannel(channelCode, m_RtcParms.puid);
    let rtmStreamChannel = m_RtmChannelMap.get(channelCode);
    if (rtmStreamChannel) {
        rtmStreamChannel.leave();
        m_RtmChannelMap.delete(channelCode);
    }
}
exports.levaeChannel = levaeChannel;
function subscribeVideo(channelCode, uid, view, isScreenShare = true) {
    return m_RtcSdk.subscribeEx(getRtcConnection(channelCode), uid + "", view, undefined, isScreenShare);
}
exports.subscribeVideo = subscribeVideo;
function muteRemoteAudio(channelCode, uid, mute) {
    return m_RtcSdk.muteRemoteAudioStreamEx(uid, mute, getRtcConnection(channelCode));
}
exports.muteRemoteAudio = muteRemoteAudio;
async function getScreenWindowsInfo() {
    let screenWindowsInfo = await m_RtcSdk.getScreenWindowsInfo();
    if (process.platform == "darwin" && m_RtcParms.sdkType == 1) {
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
async function startScreenShare(channelCode, options) {
    RendererHelper.closeWindow(WinId_1.default.ProjectionPreToastUUID);
    if (!m_RtcSdk) {
        console.error("ProjectionRtcHelper startScreenShare error: sdk 未初始化!");
        RendererHelper.toast("操作失败");
        return;
    }
    let sharePuid = options?.puid;
    if (!options || !options.winInfo) {
        let screenInfos = await getScreenWindowsInfo();
        console.debug("getScreenWindowsInfo:", screenInfos);
        if (screenInfos?.displaysInfo?.length > 0) {
            options = {
                screenType: 1,
                winInfo: screenInfos.displaysInfo[0],
            };
        }
        else {
            console.error("ProjectionRtcHelper startScreenShare error: no display found!");
            RendererHelper.toast("操作失败");
            return;
        }
    }
    changeWindowPosition(options.winInfo.x, options.winInfo.y);
    let winId = options.winInfo;
    if (options.screenType == 1 && options.winInfo.displayId) {
        winId = options.winInfo.displayId;
    }
    else if (options.screenType == 2 && options.winInfo.windowId) {
        winId = options.winInfo.windowId;
    }
    m_RtcSdk.setClientRole(1);
    let conn = getRtcConnection(channelCode);
    m_CurScreenShareChannelCode = conn?.channelId;
    if (m_RtcParms.sdkType === 0 &&
        sharePuid &&
        sharePuid + "" != m_RtcParms.puid + "") {
        conn = { localUid: Number(sharePuid), channelId: channelCode };
        if (!isJoinScreenShareChannel(conn)) {
            let rtcToken = await getRtcSdkToken(sharePuid + "", channelCode);
            if (!rtcToken) {
                console.error("获取声网屏幕共享token失败");
                return -1;
            }
            let joinChannelOptions = {
                publishCameraTrack: false,
                publishMicrophoneTrack: false,
                publishScreenTrack: true,
                autoSubscribeAudio: false,
                autoSubscribeVideo: false,
                clientRoleType: 1,
                VideoStreamType: 0,
                channelProfile: 1,
                publishRhythmPlayerTrack: false,
            };
            await m_RtcSdk.joinChannelEx(rtcToken, channelCode, sharePuid + "", Number(sharePuid), joinChannelOptions);
            m_ScreenShareConnections.push(conn);
        }
    }
    else {
        sharePuid = m_RtcParms.puid;
    }
    let ret = await m_RtcSdk.startScreenShare2Ex(conn, options.screenType, channelCode, winId, m_RtcParms.rtcToken, sharePuid, SCREEN_SHARE_CONFIG);
    m_RtcSdk.updateChannelMediaOptionsEx(conn, {
        publishScreenTrack: true,
    });
    m_IScreenShare = true;
    return ret;
}
exports.startScreenShare = startScreenShare;
function stopScreenShare(channelCode, puid) {
    m_IScreenShare = false;
    if (m_RtcSdk) {
        m_RtcSdk.stopScreenShare2Ex(getRtcConnection(channelCode));
        if (m_RtcParms.sdkType == 0) {
            let conn = {
                localUid: Number(puid),
                channelId: channelCode,
            };
            m_RtcSdk.leaveChannelEx(conn);
            removeScreenShareChannel(conn);
        }
    }
    m_CurScreenShareChannelCode = undefined;
}
exports.stopScreenShare = stopScreenShare;
function sendMessage(channelCode, msg, to) {
    console.log(`sendMessage: ${msg} to ${to},channel: ${channelCode}`);
    if (m_RtcParms.sdkType == 1) {
        return m_RtcSdk.sendMessageEx(msg, to, getRtcConnection(channelCode));
    }
    else {
        if (to) {
            m_RtmSdk.sendMessageToPeer({ text: msg }, to);
        }
        else {
            let rtmChannel = m_RtmChannelMap.get(channelCode);
            if (rtmChannel) {
                rtmChannel.sendMessage({ text: msg });
            }
        }
        return 0;
    }
}
exports.sendMessage = sendMessage;
async function getChannelMemebers(channel) {
    if (m_RtcParms.sdkType == 1) {
        let roomUsers = m_RtcSdk?.getRoomUsersEx({
            channelId: channel,
            localUid: m_RtcParms.puid,
        });
        if (roomUsers) {
            return roomUsers.map((user) => user.m_pUserId);
        }
    }
    else {
        let rtmChannel = m_RtmChannelMap.get(channel);
        if (rtmChannel) {
            return await rtmChannel.getMembers();
        }
        else {
            return [];
        }
    }
}
exports.getChannelMemebers = getChannelMemebers;
function releaseSdk() {
    visibleScreenShareDisconnectPage(false);
    let ret = m_RtcSdk?.release();
    m_EventEmitter.removeAllListeners();
    m_RtcSdk = undefined;
    m_RtcParms = new RtcParms();
    if (m_RtmSdk) {
        m_RtmSdk.logout();
    }
    m_RtmChannelMap.clear();
    return ret;
}
exports.releaseSdk = releaseSdk;
function onRemoteScreenShareStateChanged(callback) {
    m_EventEmitter.on("remoteScreenShareStateChanged", callback);
    m_EventEmitter.on("remoteVideoStateChanged", callback);
}
exports.onRemoteScreenShareStateChanged = onRemoteScreenShareStateChanged;
function onRemoteAuidoStateChanged(callback) {
    m_EventEmitter.on("remoteAudioStateChanged", callback);
}
exports.onRemoteAuidoStateChanged = onRemoteAuidoStateChanged;
function onMessageReceived(callback) {
    m_EventEmitter.on("messageReceived", (channel, data) => {
        console.log(`onMessageReceived: ${data?.msgBody} from ${data?.msgFrom}`);
        callback(channel, data);
    });
}
exports.onMessageReceived = onMessageReceived;
function onRtcError(callback) {
    m_EventEmitter.on("rtcError", (errCode, rtcErrorCode, errMsg) => {
        callback({
            errCode: rtcErrorCode,
            errMsg: errMsg,
            sdkType: m_RtcParms.sdkType,
        });
    });
}
exports.onRtcError = onRtcError;
function enableLoopbackRecording(channelCode, enable) {
    let conn = getRtcConnection(channelCode);
    for (let screenShareConnection of m_ScreenShareConnections) {
        if (screenShareConnection.channelId == channelCode) {
            conn = screenShareConnection;
            break;
        }
    }
    return m_RtcSdk?.enableLoopbackRecordingEx(conn, enable);
}
exports.enableLoopbackRecording = enableLoopbackRecording;
function onUserJoined(callback) {
    m_EventEmitter.on("userJoined", callback);
}
exports.onUserJoined = onUserJoined;
function onUserOffline(callback) {
    m_EventEmitter.on("userOffline", callback);
}
exports.onUserOffline = onUserOffline;
function onRemoteLogin(callback) {
    m_EventEmitter.on("remoteLogin", () => {
        releaseSdk();
        RendererHelper.alert("你已在其他设备加入课堂，当前设备将被移出", {
            winId: "projection_box_alert",
            okClick: () => {
                m_EventEmitter.emit("remoteLogin");
            },
        });
        callback();
    });
    if (m_RtcParms.sdkType == 1) {
        m_RtcSdk.onRepeatLogin(callback);
    }
    else {
        m_EventEmitter.on("remoteLogin", () => {
            callback();
        });
    }
}
exports.onRemoteLogin = onRemoteLogin;
function onAudioVolumeIndication(callback) {
    m_RtcSdk?.onGroupAudioVolumeIndication((speakers, speakerNumber, totalVolume) => {
        callback(speakers, speakerNumber, totalVolume);
    });
}
exports.onAudioVolumeIndication = onAudioVolumeIndication;
function onScreenShareStopByWindowClosed(callback) {
    m_EventEmitter.on("screenShareStopByWindowClosed", callback);
}
exports.onScreenShareStopByWindowClosed = onScreenShareStopByWindowClosed;
function onScreenSharePaused(callback) {
    m_EventEmitter.on("screenSharePaused", callback);
}
exports.onScreenSharePaused = onScreenSharePaused;
function onNetworkQualityChanged(puid, callback) {
    m_EventEmitter.on(`networkQualityChanged_${puid}`, (txquality, rxquality) => {
        console.log(`onNetworkQualityChanged: puid:${puid}, txquality:${txquality}, rxquality:${rxquality}`);
        callback(puid, txquality, rxquality);
    });
}
exports.onNetworkQualityChanged = onNetworkQualityChanged;
async function getRtcSdkTokenInfo(puid, channelCode) {
    let url = `https://appswh.chaoxing.com/board/apis/mainscreen/getChannelTokenInfo?puid=${puid}&&channelCode=${channelCode}`;
    let resp = await (0, RendererHelper_1.netRequest)({ url, tokenSign: true });
    console.debug("getRtcSdkTokenInfo:", resp);
    if (resp.result == 1) {
        return resp.msg;
    }
}
async function getRtcSdkToken(puid, channelCode) {
    let tokenInfo = await getRtcSdkTokenInfo(puid, channelCode);
    if (tokenInfo) {
        if (tokenInfo.sdkType == 1) {
            return tokenInfo.tokens.rongke_token;
        }
        else {
            return tokenInfo.tokens.rtc_video_token;
        }
    }
}
function toastMsgLong(msg) {
    RendererHelper.toastLong(msg, { winId: "projection_box_toast" });
}
exports.toastMsgLong = toastMsgLong;
function hideToastMsg() {
    RendererHelper.hideWindow("projection_box_toast");
}
exports.hideToastMsg = hideToastMsg;
function alertMsg(msg) {
    RendererHelper.alert(msg, { winId: "projection_box_alert" });
}
function changeWindowPosition(winX, winY) {
    RendererHelper.setWindowPosition(winX, winY);
    (0, RendererHelper_1.sendToMainProcess)("_simpleFullScreenWindowForProjectionBox", true);
    RendererHelper.showWindow();
}
RendererHelper.on("CMD_MEET_RTC_STU_SCREEN", (parms1) => {
    let parms = parms1.data;
    let sender = parms1.sender;
    console.log("on CMD_MEET_RTC_STU_SCREEN:", JSON.stringify(parms));
    if (!parms || !parms.type) {
        return;
    }
    if (parms.type == "showScreen") {
    }
    else if (parms.type == "broadcastScreen") {
    }
    else if (parms.type == "unBroadcastScreen") {
    }
    else if (parms.type == "unShowScreen") {
    }
    else if (parms.type == "endMeeting") {
    }
    else if (parms.type == "screenSoundOp") {
        if (parms.ignoreCmd) {
            return;
        }
        enableLoopbackRecording(undefined, parms.tag == 1);
    }
    else if (parms.type == "agreeShare") {
    }
});
async function updateRtcToken(conn) {
    let sdkTokenInfo = await getRtcSdkTokenInfo(conn.localUid, conn.channelId);
    if (sdkTokenInfo?.tokens) {
        m_RtcParms.rtcToken = sdkTokenInfo.tokens?.rtc_video_token;
        m_RtcSdk.renewTokenEx(conn, m_RtcParms.rtcToken);
    }
}
async function updateRtmToken() {
    if (m_RtcParms.channelCodes.length == 0) {
        return;
    }
    let sdkTokenInfo = await getRtcSdkTokenInfo(m_RtcParms.puid, m_RtcParms.channelCodes[0]);
    if (sdkTokenInfo?.tokens) {
        m_RtcParms.rtmToken = sdkTokenInfo.tokens?.rtm_video_token;
        m_RtmSdk.renewToken(m_RtcParms.rtmToken);
    }
}
async function initRtm() {
    const AgoraRTM = require("agora-rtm-sdk");
    m_RtmSdk = AgoraRTM.createInstance(m_RtcParms.appId);
    await m_RtmSdk.login({
        uid: m_RtcParms.puid + "",
        token: m_RtcParms.rtmToken,
    });
    m_RtmSdk.on("MessageFromPeer", (message, peerId, messageProps) => {
        m_EventEmitter.emit("messageReceived", "", {
            msgBody: message?.text,
            msgFrom: peerId,
        });
    });
    m_RtmSdk.on("TokenPrivilegeWillExpire", () => {
        updateRtmToken();
    });
    m_RtmSdk.on("ConnectionStateChanged", (newState, reason) => {
        console.log(`ConnectionStateChanged:newState:${newState},reason:${reason}`);
        if (reason == "REMOTE_LOGIN") {
            m_EventEmitter.emit("remoteLogin");
        }
        else {
        }
    });
    return true;
}
async function joinRtmChannel(channelCode) {
    if (!m_RtmSdk) {
        return;
    }
    let streamChannel = m_RtmSdk.createChannel(channelCode);
    await streamChannel.join();
    streamChannel.on("ChannelMessage", (message, memberId, messagePros) => {
        m_EventEmitter.emit("messageReceived", channelCode, {
            msgBody: message.text,
            msgFrom: memberId,
            msgTo: channelCode,
        });
    });
    streamChannel.on("MemberJoined", (memberId) => {
        m_EventEmitter.emit("userJoined", channelCode, memberId);
    });
    streamChannel.on("MemberLeft", (memberId) => {
        m_EventEmitter.emit("userOffline", channelCode, memberId);
    });
    m_RtmChannelMap.set(channelCode, streamChannel);
}
async function visibleScreenShareDisconnectPage(visible) {
    if (visible) {
        let appSystemConfig = await RendererHelper.invokeToMainProcess("_getAppSystemConfig");
        if (appSystemConfig?.appMode == "fanya" && !m_IScreenShare) {
            return;
        }
    }
    return (0, RendererHelper_1.sendToMainProcess)("_visibleScreenShareDisconnectPage", visible);
}
function initDefaultPlaybackDevices() {
    if (m_RtcParms.sdkType == 0) {
        return;
    }
    let playbackDevices = m_RtcSdk.getAudioPlaybackDevices();
    let defaultDevId = getSystemDefaultDevId(playbackDevices);
    if (!defaultDevId) {
        return;
    }
    let curPlaybackDevice = m_RtcSdk.getCurrentAudioPlaybackDevice();
    if (curPlaybackDevice != defaultDevId) {
        m_RtcSdk.setAudioPlaybackDevice(defaultDevId);
    }
}
function getSystemDefaultDevId(devList) {
    if (!devList || devList.length == 0) {
        return undefined;
    }
    for (let i = 0; i < devList.length; i++) {
        let dev = devList[i];
        if (dev.isSystemDefault === 1) {
            return dev?.deviceid;
        }
    }
    return undefined;
}
function sendPauseSharingMsg(channel, isPause) {
    let msg = {
        pauseSharing: {
            uid: m_RtcParms.puid,
            status: isPause ? 1 : 0,
            tip: isPause ? "对方已暂停共享" : "对方继续共享",
        },
    };
    if (!channel) {
        channel = m_CurScreenShareChannelCode;
    }
    sendMessage(channel, JSON.stringify(msg));
}
function getAudioPlaybackDevices() {
    let audioPlaybackDevices = m_RtcSdk.getAudioPlaybackDevices();
    for (let i = audioPlaybackDevices.length - 1; i >= 0; i--) {
        let device = audioPlaybackDevices[i];
        if (isVirtualAudioDevices(device.devicename)) {
            audioPlaybackDevices.splice(i, 1);
        }
    }
    return audioPlaybackDevices;
}
exports.getAudioPlaybackDevices = getAudioPlaybackDevices;
function getAudioRecordingDevices() {
    let audioRecordingDevices = m_RtcSdk.getAudioRecordingDevices();
    for (let i = audioRecordingDevices.length - 1; i >= 0; i--) {
        let device = audioRecordingDevices[i];
        if (this.isVirtualAudioDevices(device.devicename)) {
            audioRecordingDevices.splice(i, 1);
        }
    }
    return audioRecordingDevices;
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
function getCurrentAudioRecordingDevice() {
    return m_RtcSdk.getCurrentAudioPlaybackDevice() || "";
}
exports.getCurrentAudioRecordingDevice = getCurrentAudioRecordingDevice;
function getCurrentAudioPlaybackDevice() {
    return m_RtcSdk.getCurrentAudioPlaybackDevice() || "";
}
exports.getCurrentAudioPlaybackDevice = getCurrentAudioPlaybackDevice;
function isVirtualAudioDevices(devicename) {
    if (!devicename) {
        return true;
    }
    if (devicename.includes("AgoraALD") ||
        devicename.includes("RKCloudALD") ||
        devicename.toLocaleLowerCase().includes("wemeet")) {
        return true;
    }
    return false;
}
function isShowScreen() {
    return m_isShowScreen;
}
exports.isShowScreen = isShowScreen;
//# sourceMappingURL=ProjectionRtcHelper.js.map