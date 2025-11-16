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
exports.joinChannel = void 0;
const AudioVideoCallInfo_1 = require("../../common/im/AudioVideoCallInfo");
const RendererHelper_1 = require("../RendererHelper");
const RendererHelper = __importStar(require("../RendererHelper"));
const electron_1 = require("electron");
const ImModuleHelper_1 = require("./ImModuleHelper");
const RtcSdk_1 = require("../rtcsdk/RtcSdk");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DateUtil_1 = require("../../utils/DateUtil");
const events_1 = require("events");
let m_RtcSdk;
let m_EventEmitter = new events_1.EventEmitter();
let m_CallStartTime = 0;
let m_CallEndTime = 0;
async function getRtcToken(channel) {
    let puid = await (0, RendererHelper_1.getUID)();
    if (!puid) {
        return;
    }
    let url = `${AudioVideoCallInfo_1.IM_DOMAIN}/apis/meet/getTokens?puid=${puid}&channel=${channel}`;
    return await RendererHelper.netRequest({
        url: url,
        tokenSign: true,
    });
}
async function initCallView() {
    console.debug("initCallView");
    let callInfo = await getCallInfo();
    if (!callInfo) {
        console.error("initCallView: callInfo is null");
        return;
    }
    updateAudioCallView(callInfo);
    if (callInfo.role == AudioVideoCallInfo_1.CallRole.Initiator) {
        initCallViewByInitiator(callInfo);
    }
    else {
        initCallViewByRecipient();
    }
}
function initCallViewByInitiator(m_CallInfo) {
    (0, ImModuleHelper_1.sendImMessage)({
        msg: `来自${m_CallInfo.myUser.name}的语音聊天邀请`,
        type: "txt",
        to: m_CallInfo.toUser.uid,
        chatType: "singleChat",
        ext: {
            action: "invite",
            callId: m_CallInfo.callId,
            callerDevId: m_CallInfo.callerDevId,
            callerInfo: m_CallInfo.callerInfo,
            channelName: m_CallInfo.channelName,
            msgType: "rtcCallWithAgora",
            sdktype: 1,
            ts: Date.now(),
            type: 0,
        },
    });
    updateSatusText(`正在等待对方接受邀请`);
    setTimeout(async () => {
        let callInfo = await getCallInfo();
        if (callInfo.state < AudioVideoCallInfo_1.CallState.State_Connecting) {
            await cancelAudioCall();
            errorAndClose("对方未接听，请稍后再试");
        }
    }, 60 * 1000);
}
function initCallViewByRecipient() {
    updateSatusText(`对方邀请您进行语音通话`);
    setTimeout(async () => {
        let m_CallInfo = await getCallInfo();
        if (m_CallInfo.state < AudioVideoCallInfo_1.CallState.State_Connecting) {
            saveImCallMessage("未接听，点击回拨");
            endCallAndClose(2000);
        }
    }, 60 * 1000);
}
async function cancelAudioCall() {
    let m_CallInfo = await getCallInfo();
    if (!m_CallInfo) {
        return;
    }
    (0, ImModuleHelper_1.sendImMessage)({
        action: "rtcCall",
        type: "cmd",
        to: m_CallInfo.toUser.uid,
        chatType: "singleChat",
        ext: {
            action: "cancelCall",
            callId: m_CallInfo.callId,
            callerDevId: m_CallInfo.callerDevId,
            msgType: "rtcCallWithAgora",
            ts: Date.now(),
        },
    });
    saveImCallMessage("已取消，点击重拨");
}
function getCallTimeStr() {
    m_CallEndTime = Date.now();
    let useTime = m_CallEndTime - m_CallStartTime;
    let useTimeStr;
    if (useTime >= 60 * 60 * 1000) {
        useTimeStr = (0, DateUtil_1.dateFormat)("HH:mm:ss", useTime);
    }
    else {
        useTimeStr = (0, DateUtil_1.dateFormat)("mm:ss", useTime);
    }
    return useTimeStr;
}
async function endByOther() {
    let m_CallInfo = await getCallInfo();
    if (!m_CallInfo || !m_RtcSdk) {
        return;
    }
    m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_End;
    m_CallInfo.endReson = AudioVideoCallInfo_1.EndReson.EndReson_Hangup;
    console.log("通话挂断，endAudioCall", m_CallInfo);
    updateSatusText("通话结束");
    await saveImCallMessage(`通话时长 ${getCallTimeStr()}`);
    endCallAndClose();
}
async function endAudioCall() {
    let m_CallInfo = await getCallInfo();
    if (!m_CallInfo || !m_RtcSdk) {
        return;
    }
    console.log("通话挂断，endAudioCall", m_CallInfo);
    m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_End;
    m_CallInfo.endReson = AudioVideoCallInfo_1.EndReson.EndReson_Hangup;
    updateSatusText("通话结束");
    await saveImCallMessage(`通话时长 ${getCallTimeStr()}`);
    (0, ImModuleHelper_1.sendImMessage)({
        action: "rtcCall",
        type: "cmd",
        to: m_CallInfo.toUser.uid,
        chatType: "singleChat",
        ext: {
            action: "endCall",
            callId: m_CallInfo.callId,
            callerDevId: m_CallInfo.callerDevId,
            msgType: "rtcCallWithAgora",
            ts: Date.now(),
        },
    });
    endCallAndClose();
}
async function callInterrupted() {
    let m_CallInfo = await getCallInfo();
    if (m_CallInfo.state == AudioVideoCallInfo_1.CallState.State_Connected) {
        m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_End;
        m_CallInfo.endReson = AudioVideoCallInfo_1.EndReson.EndReson_Timeout;
        updateCallState(m_CallInfo);
        updateSatusText("通话中断");
        saveImCallMessage(`通话中断 ${getCallTimeStr()}`);
        endCallAndClose(2000);
    }
}
function updateAudioCallView(callInfo) {
    RendererHelper.emit("updateAudioCallView", callInfo);
}
RendererHelper.on("answerCall", async () => {
    let callInfo = await getCallInfo();
    updateAudioCallView(callInfo);
    if (callInfo.state === AudioVideoCallInfo_1.CallState.State_Connecting) {
        updateSatusText("正在连接...");
        initRtc(callInfo);
    }
    else if (callInfo.state === AudioVideoCallInfo_1.CallState.State_End) {
        if (callInfo.endReson == AudioVideoCallInfo_1.EndReson.EndReson_Busy) {
            updateSatusText("对方正忙，请稍后再试");
            await saveImCallMessage("通话失败，对方正忙");
        }
        else {
            updateSatusText("对方已拒绝通话");
            await saveImCallMessage("对方已拒绝");
        }
        updateSatusText("");
        setTimeout(() => {
            window.close();
        }, 2000);
    }
});
RendererHelper.on("cancelCall", async () => {
    let m_CallInfo = await getCallInfo();
    m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_End;
    m_CallInfo.endReson = AudioVideoCallInfo_1.EndReson.EndReson_Cancel;
    updateAudioCallView(m_CallInfo);
    updateSatusText("已取消");
    await saveImCallMessage("未接听，点击回拨");
    endCallAndClose(2000);
});
RendererHelper.on("endCall", async () => {
    endByOther();
});
function updateSatusText(text) {
    RendererHelper.emit("updateAudioCallStatusText", text);
}
function showPromptMsg(text) {
    RendererHelper.emit("showAudioCallMessage", text);
}
async function initRtc(m_CallInfo) {
    m_RtcSdk = (0, RtcSdk_1.createRtcSdk)(m_CallInfo.sdkType);
    let rtcTokenData = await getRtcToken(m_CallInfo.channelName);
    let rtcToken;
    let appid;
    if (rtcTokenData?.result == 1) {
        appid = rtcTokenData.msg?.rtc_appid;
        if (m_CallInfo.sdkType == 1) {
            rtcToken = rtcTokenData.msg?.rongke_token;
        }
        else {
            rtcToken = rtcTokenData.msg?.rtc_video_token;
        }
    }
    if (!rtcToken) {
        await cancelAudioCall();
        errorAndClose("连接失败！");
        return;
    }
    let puid = await (0, RendererHelper_1.getUID)();
    if (rtcTokenData?.result == 1) {
        puid += "";
    }
    else {
        puid = Number(puid);
    }
    let sdkLogPath = await initSdkLogPath(m_CallInfo);
    let initRet = await m_RtcSdk.initialize3({
        appid,
        userId: puid,
        userName: puid + "",
        token: rtcToken,
        logConfig: { filePath: sdkLogPath, fileSizeInKB: 20480, level: 1 },
    });
    if (initRet != 0) {
        errorAndClose("连接失败！");
        return;
    }
    initCallbacks();
    setTimeout(async () => {
        let callInfo = await getCallInfo();
        if (callInfo.state == AudioVideoCallInfo_1.CallState.State_Connecting) {
            errorAndClose("连接失败！");
            cancelAudioCall();
        }
    }, 8000);
    let joinRet = await joinChannel({
        puid,
        channelCode: m_CallInfo.channelName,
        token: rtcToken,
        sdkType: m_CallInfo.sdkType,
    });
    if (!joinRet) {
        errorAndClose("连接失败！");
        return;
    }
    m_RtcSdk.enableLocalAudio(true);
}
function errorAndClose(msg) {
    console.error("audio call error!", msg);
    showPromptMsg(msg);
    if (m_RtcSdk) {
        m_RtcSdk.release();
        m_RtcSdk = undefined;
    }
    setTimeout(() => {
        window.close();
    }, 1500);
}
function endCallAndClose(time) {
    if (!time) {
        time = 1500;
    }
    if (m_RtcSdk) {
        m_RtcSdk.release();
    }
    setTimeout(() => {
        window.close();
    }, time);
}
async function initSdkLogPath(m_CallInfo) {
    let m_LogPath = await (0, RendererHelper_1.getUserLogPath)();
    let rtcLogPath = path_1.default.join(m_LogPath, `agora_call/agoraSdk_${(0, DateUtil_1.dateFormat)("yyyyMMdd")}.log`);
    if (m_CallInfo.sdkType == 1) {
        let dateStr = (0, DateUtil_1.dateFormat)("yyyyMMdd");
        rtcLogPath = path_1.default.join(m_LogPath, "cx_rtc_call", dateStr);
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
    return rtcLogPath;
}
function initCallbacks() {
    m_RtcSdk.onJoinedChannelEx((channel, uid, elapsed) => {
        m_EventEmitter.emit(`joinChannel_${channel}`, channel, uid, elapsed);
    });
    m_RtcSdk.onRtcError(async (errCode, rtcErrorCode, errMsg) => {
        console.error(`rtcHelper on rtcerror: err:${errCode},code ${rtcErrorCode} , ${errMsg}`);
        m_EventEmitter.emit("rtcError", errCode, rtcErrorCode, errMsg);
        let m_CallInfo = await getCallInfo();
        if (m_CallInfo.sdkType == 1) {
            if (rtcErrorCode == 9) {
                m_EventEmitter.emit("joinChannelError", errCode, errMsg);
            }
        }
    });
    m_RtcSdk.onRoomStateChange((state) => {
        console.log("onRoomStateChange:", state);
        if (state == 4) {
            callInterrupted();
        }
    });
    m_RtcSdk.onRemoteAudioStateChanged(async (uid, state) => {
        let m_CallInfo = await getCallInfo();
        if (state == 1 && uid + "" == m_CallInfo.toUser.puid + "") {
            await connectSucess();
        }
    });
    m_RtcSdk.onUserOffline(async (uid, reason) => {
        let m_CallInfo = await getCallInfo();
        if (uid + "" == m_CallInfo.toUser.puid + "") {
            let toDevInfo = (0, AudioVideoCallInfo_1.getCallToDevInfo)(m_CallInfo);
            if (toDevInfo?.apiVersion && toDevInfo.apiVersion > 1) {
                setTimeout(() => {
                    callInterrupted();
                }, 3000);
            }
            else {
                endByOther();
            }
        }
    });
    m_RtcSdk.onLeaveChannel(() => {
        console.log("onLeaveChannel");
        setTimeout(() => {
            callInterrupted();
        }, 1000);
    });
    m_RtcSdk.onNetworkQuality((uid, txquality, rxquality, channelId) => {
        console.log("onNetworkQuality:", uid, txquality, rxquality, channelId);
        if (txquality == 6 || rxquality == 6) {
            callInterrupted();
        }
    });
}
async function joinChannel(options) {
    try {
        let joinChannelOptions = {
            publishCameraTrack: false,
            publishMicrophoneTrack: true,
            publishScreenTrack: false,
            autoSubscribeAudio: true,
            autoSubscribeVideo: false,
            clientRoleType: 1,
            VideoStreamType: 0,
            channelProfile: 1,
            publishRhythmPlayerTrack: false,
        };
        let puid = options.puid;
        if (options.sdkType == 0) {
            puid = Number(options.puid);
        }
        else {
            puid += "";
        }
        let joinChannelResult;
        joinChannelResult = m_RtcSdk.joinChannel(options.token, options.channelCode, "", puid, joinChannelOptions);
        if (joinChannelResult !== 0) {
            console.error(`AudioVideoCallHelper加入频道失败:puid:${options.puid},channelCode:${options.channelCode},result:${joinChannelResult}`);
            throw new Error("加入频道失败");
        }
        else {
            await new Promise((resolve, reject) => {
                m_EventEmitter.once(`joinChannel_${options.channelCode}`, () => {
                    resolve(true);
                });
                m_EventEmitter.once("joinChannelError", () => {
                    reject("joinChannelError");
                });
            });
        }
        return true;
    }
    catch (e) {
        console.error("--加入频道失败:", e);
        return false;
    }
}
exports.joinChannel = joinChannel;
async function connectSucess() {
    let m_CallInfo = await getCallInfo();
    if (m_CallInfo.state != AudioVideoCallInfo_1.CallState.State_Connecting) {
        return;
    }
    console.log("--连接成功");
    m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_Connected;
    updateCallState(m_CallInfo);
    updateSatusText(" ");
    m_CallStartTime = Date.now();
    RendererHelper.emit("audioCallStartTimer", m_CallStartTime);
}
function muteAudio(isMute) {
    return m_RtcSdk.enableLocalAudio(!isMute);
}
async function closeWindow() {
    let m_CallInfo = await getCallInfo();
    if (m_CallInfo.state == AudioVideoCallInfo_1.CallState.State_Connected) {
        await endAudioCall();
    }
    else {
        if (m_CallInfo.role === AudioVideoCallInfo_1.CallRole.Initiator) {
            await cancelAudioCall();
        }
        else {
            await rejectCall();
        }
    }
    setTimeout(() => {
        window.close();
    }, 100);
}
async function answerCall() {
    let m_CallInfo = await getCallInfo();
    m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_Connecting;
    updateCallState(m_CallInfo);
    (0, ImModuleHelper_1.sendImMessage)({
        type: "cmd",
        action: "rtcCall",
        to: m_CallInfo.toUser.uid,
        ext: {
            action: "answerCall",
            callId: m_CallInfo.callId,
            callerDevId: m_CallInfo.callerDevId,
            calleeDevId: m_CallInfo.calleeDevId,
            calleeInfo: m_CallInfo.calleeInfo,
            msgType: "rtcCallWithAgora",
            result: "accept",
            ts: Date.now(),
            sdktype: m_CallInfo.sdkType,
        },
    });
    updateSatusText("正在连接...");
    initRtc(m_CallInfo);
    setTimeout(async () => {
        let callInfo = await getCallInfo();
        if (callInfo.state != AudioVideoCallInfo_1.CallState.State_Connected &&
            callInfo.state != AudioVideoCallInfo_1.CallState.State_End) {
            callInfo.state = AudioVideoCallInfo_1.CallState.State_End;
            callInfo.endReson = AudioVideoCallInfo_1.EndReson.EndReson_Timeout;
            updateCallState(callInfo);
            showPromptMsg("连接超时，请稍后再试");
            saveImCallMessage("通话时长 00:00");
            endCallAndClose(2000);
        }
    }, 10000);
}
async function rejectCall() {
    let m_CallInfo = await getCallInfo();
    m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_End;
    m_CallInfo.endReson = AudioVideoCallInfo_1.EndReson.EndReson_Reject;
    updateCallState(m_CallInfo);
    (0, ImModuleHelper_1.sendImMessage)({
        type: "cmd",
        action: "rtcCall",
        to: m_CallInfo.toUser.uid,
        ext: {
            action: "answerCall",
            callId: m_CallInfo.callId,
            callerDevId: m_CallInfo.callerDevId,
            calleeDevId: m_CallInfo.calleeDevId,
            msgType: "rtcCallWithAgora",
            result: "refuse",
            ts: Date.now(),
            sdktype: m_CallInfo.sdkType,
        },
    });
    await saveImCallMessage("未接听，点击回拨");
    setTimeout(() => {
        window.close();
    }, 100);
}
async function saveImCallMessage(msg) {
    let userInfo = await (0, RendererHelper_1.getUser)();
    if (!userInfo) {
        return;
    }
    userInfo.uid += "";
    let m_CallInfo = await getCallInfo();
    (0, ImModuleHelper_1.saveImMessage)({
        type: "txt",
        msg: msg,
        from: m_CallInfo.role == AudioVideoCallInfo_1.CallRole.Initiator
            ? userInfo.uid
            : m_CallInfo.toUser.uid,
        to: m_CallInfo.role == AudioVideoCallInfo_1.CallRole.Initiator
            ? m_CallInfo.toUser.uid
            : userInfo.uid,
        chatType: "singleChat",
        ext: {
            attChatCall: true,
        },
    });
}
async function getCallInfo() {
    return (0, RendererHelper_1.getTempStore)("_CallInfo");
}
function saveCallInfo(callInfo) {
    return (0, RendererHelper_1.setTempStore)("_CallInfo", callInfo);
}
async function updateCallState(callInfo) {
    saveCallInfo(callInfo);
    RendererHelper.emit("updateAudioCallView", callInfo);
}
electron_1.contextBridge.exposeInMainWorld("AudioVideoCallHelper", {
    initCallView,
    cancelAudioCall,
    endAudioCall,
    muteAudio,
    closeWindow,
    answerCall,
    rejectCall,
});
//# sourceMappingURL=AudioVideoCallHelper.js.map