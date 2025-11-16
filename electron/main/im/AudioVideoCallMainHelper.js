"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initClientInfo = void 0;
const electron_1 = require("electron");
const BrowserHelper_1 = require("../BrowserHelper");
const WinId_1 = __importDefault(require("../../common/WinId"));
const MainHelper_1 = require("../MainHelper");
const UserHelper_1 = require("../UserHelper");
const UaUtils_1 = require("../../utils/UaUtils");
const NetRequestUtil_1 = require("../util/NetRequestUtil");
const SessionCookie_1 = require("../SessionCookie");
const AudioVideoCallInfo_1 = require("../../common/im/AudioVideoCallInfo");
const uuid_1 = require("uuid");
const DialogMainHelper_1 = require("../DialogMainHelper");
const ImMainHelper_1 = require("./ImMainHelper");
const MachineIdUtil_1 = require("../../utils/MachineIdUtil");
const FeatureSwitch_1 = require("../../common/FeatureSwitch");
const { UserOut } = require("../../out/user/UserOut");
function getCallInfo() {
    return (0, MainHelper_1.getTempStore)("_CallInfo");
}
function saveCallInfo(callInfo) {
    return (0, MainHelper_1.setTempStore)("_CallInfo", callInfo);
}
electron_1.ipcMain.on("_audioCallToUser", (event, puid) => {
    let pWin = electron_1.BrowserWindow.fromWebContents(event.sender);
    audioCallToUser(puid, pWin);
});
async function audioCallToUser(puid, pWin) {
    if (!FeatureSwitch_1.FeatureSwitch.showAudioCall) {
        return;
    }
    let myPuid = (0, UserHelper_1.getUID)();
    if (!myPuid) {
        return;
    }
    const winId = WinId_1.default.CallWindow;
    let callWindow = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    if (callWindow && !callWindow.isDestroyed()) {
        let m_CallInfo = getCallInfo();
        if (!m_CallInfo) {
            callWindow.close();
        }
        else {
            if (puid === m_CallInfo.toUser?.puid) {
                callWindow.show();
            }
            else {
                (0, DialogMainHelper_1.openCommonDialog)(pWin, {
                    winId: "call_conflict",
                    title: "提示",
                    content: "您正在通话中，无法发起新的通话！",
                });
            }
            return;
        }
    }
    let otherClientInfo = await getClientInfo(puid);
    if (otherClientInfo?.result == 1) {
        if (otherClientInfo.data?.sdkType < 0) {
            console.log("对方版本过低，需升级才能通话！", JSON.stringify(otherClientInfo));
            (0, DialogMainHelper_1.openCommonDialog)(pWin, {
                winId: "call_conflict",
                title: "提示",
                content: "对方版本过低，需升级才能通话！",
            });
            return;
        }
        let userInfo = await UserOut.getUser(puid, myPuid);
        if (!userInfo) {
            return;
        }
        let myUserInfo = await UserOut.getUser(myPuid, myPuid);
        if (!myUserInfo) {
            return;
        }
        let m_CallInfo = new AudioVideoCallInfo_1.CallInfo();
        m_CallInfo.toUser = {
            puid,
            uid: userInfo.uid + "",
            name: userInfo.name,
            pic: userInfo.pic,
        };
        m_CallInfo.myUser = {
            puid: myPuid,
            uid: myUserInfo.uid + "",
            name: myUserInfo.name,
            pic: myUserInfo.pic,
        };
        m_CallInfo.role = AudioVideoCallInfo_1.CallRole.Initiator;
        let uuid = (0, uuid_1.v4)();
        m_CallInfo.callId = uuid;
        m_CallInfo.callerDevId = (0, MachineIdUtil_1.machineIdSync)();
        let uaInfo = (0, UaUtils_1.parseUserAgentInfo)((0, SessionCookie_1.getUa)());
        let clientVersion = uaInfo.appVersion;
        let apiVersion = uaInfo.apiVersion;
        m_CallInfo.callerInfo = {
            devId: m_CallInfo.callerDevId,
            device: process.platform == "win32" ? "windows" : "mac",
            apiVersion: apiVersion,
            clientVersion: clientVersion,
        };
        m_CallInfo.channelName = `${myPuid}_${puid}`;
        m_CallInfo.sdkType = 1;
        m_CallInfo.startCallToTime = Date.now();
        m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_Invite;
        saveCallInfo(m_CallInfo);
        showCallWindow();
    }
    else {
        (0, DialogMainHelper_1.openCommonDialog)(pWin, {
            winId: "call_conflict",
            title: "提示",
            content: "网络请求异常，请稍后重试！",
        });
    }
}
electron_1.ipcMain.on("_audioCallFromUser", (event, puid) => { });
async function initClientInfo() {
    console.log("FeatureSwitch.showAudioCall:", FeatureSwitch_1.FeatureSwitch.showAudioCall);
    if (!FeatureSwitch_1.FeatureSwitch.showAudioCall) {
        return;
    }
    let puid = (0, UserHelper_1.getUID)();
    if (!puid) {
        return;
    }
    let device = process.platform == "win32" ? "windows" : "mac";
    let uaInfo = (0, UaUtils_1.parseUserAgentInfo)((0, SessionCookie_1.getUa)());
    let clientVersion = uaInfo.appVersion;
    let apiVersion = uaInfo.apiVersion;
    let url = `${AudioVideoCallInfo_1.IM_DOMAIN}/apis/message/addClientInfo?puid=${puid}&device=${device}&clientVersion=${clientVersion}&apiVersion=${apiVersion}`;
    return await (0, NetRequestUtil_1.netRequest)({
        url: url,
        tokenSign: true,
    });
}
exports.initClientInfo = initClientInfo;
async function getClientInfo(puid) {
    let myPuid = (0, UserHelper_1.getUID)();
    if (!myPuid) {
        return;
    }
    let url = `${AudioVideoCallInfo_1.IM_DOMAIN}/apis/message/getClientInfo?puid=${puid}&myPuid=${myPuid}`;
    return await (0, NetRequestUtil_1.netRequest)({
        url: url,
        tokenSign: true,
    });
}
function sendTextCallMessage(message, ext) {
    let msg = {
        type: "txt",
        msg: message,
        ext: ext,
    };
    sendCallMessage(msg);
}
function sendCmdCallMessage(ext) {
    let msg = {
        type: "cmd",
        action: "rtcCall",
        ext: ext,
    };
    sendCallMessage(msg);
}
function sendCallMessage(msg) {
    let m_CallInfo = getCallInfo();
    if (!msg || !m_CallInfo) {
        return;
    }
    msg.chatType = "singleChat";
    msg.to = m_CallInfo.toUser.uid;
    if (!msg.ext) {
        msg.ext = {};
    }
    (0, ImMainHelper_1.sendImMessage)(msg);
}
function handleImMessage(msg) { }
function showCallWindow() {
    const winId = WinId_1.default.CallWindow;
    let url = "sview:/#/audioCall";
    let callWindow = (0, MainHelper_1.openNewWindow)(undefined, {
        options: {
            id: winId,
            width: 352,
            height: 640,
            frame: false,
            resizable: false,
            show: true,
        },
        url,
    });
    callWindow.on("closed", () => {
        saveCallInfo(undefined);
    });
}
(0, ImMainHelper_1.onCmdMessage)("rtcCall", (msg) => {
    let m_CallInfo = getCallInfo();
    if (m_CallInfo?.myUser?.uid + "" == msg.from + "") {
        return;
    }
    console.log("收到rtcCall消息：", msg);
    if (msg.ext?.action == "alert") {
        handleAlertMessage(msg.ext);
    }
    else if (msg.ext?.action == "answerCall") {
        handleAnswerCallMessage(msg.ext);
    }
    else if (msg.ext?.action == "cancelCall") {
        handleCancelCallMessage(msg.ext);
    }
    else if (msg.ext?.action == "confirmRing") {
        handleConfirmRingMessage(msg.ext);
    }
    else if (msg.ext?.action == "confirmCallee") {
        handleConfirmCalleeMessage(msg.ext);
    }
    else if (msg.ext?.action == "endCall") {
        handleEndCallMessage(msg.ext);
    }
});
function checkCallId(msgData) {
    let m_CallInfo = getCallInfo();
    if (!m_CallInfo) {
        return false;
    }
    if (!msgData) {
        return false;
    }
    if (msgData.callId != m_CallInfo.callId) {
        return false;
    }
    return true;
}
function checkCallDevId(msgData) {
    let m_CallInfo = getCallInfo();
    if (!m_CallInfo) {
        return false;
    }
    if (msgData.calleeDevId != m_CallInfo.calleeDevId ||
        msgData.callerDevId != m_CallInfo.callerDevId) {
        return false;
    }
    return true;
}
function handleAlertMessage(msgData) {
    if (!checkCallId(msgData)) {
        return;
    }
    let m_CallInfo = getCallInfo();
    (0, ImMainHelper_1.sendImMessage)({
        type: "cmd",
        action: "rtcCall",
        to: m_CallInfo.toUser.uid,
        ext: {
            action: "confirmRing",
            callId: m_CallInfo.callId,
            callerDevId: msgData.callerDevId,
            calleeDevId: msgData.calleeDevId,
            msgType: "rtcCallWithAgora",
            sdktype: m_CallInfo.sdkType,
            status: 1,
            ts: Date.now(),
        },
    });
    m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_Confirm;
}
function handleAnswerCallMessage(msgData) {
    if (!checkCallId(msgData)) {
        return;
    }
    const winId = WinId_1.default.CallWindow;
    let win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    if (win && !win.isDestroyed()) {
        let m_CallInfo = getCallInfo();
        m_CallInfo.sdkType = msgData.sdktype ?? 0;
        m_CallInfo.calleeDevId = msgData.calleeDevId;
        m_CallInfo.calleeInfo = msgData.calleeInfo;
        if (msgData.result == "accept") {
            m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_Connecting;
        }
        else {
            m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_End;
            if (msgData.result == "refuse") {
                m_CallInfo.endReson = AudioVideoCallInfo_1.EndReson.EndReson_Reject;
            }
            else if (msgData.result == "busy") {
                m_CallInfo.endReson = AudioVideoCallInfo_1.EndReson.EndReson_Busy;
            }
        }
        win.webContents.send("answerCall", m_CallInfo);
        sendCmdCallMessage({
            action: "confirmCallee",
            callId: m_CallInfo.callId,
            callerDevId: m_CallInfo.callerDevId,
            calleeDevId: m_CallInfo.calleeDevId,
            msgType: "rtcCallWithAgora",
            ts: Date.now(),
        });
    }
}
function handleCancelCallMessage(msgData) {
    if (!checkCallId(msgData)) {
        return;
    }
    const winId = WinId_1.default.CallWindow;
    let win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    if (win && !win.isDestroyed()) {
        win.webContents.send("cancelCall");
    }
}
function handleEndCallMessage(msgData) {
    if (!checkCallId(msgData)) {
        return;
    }
    const winId = WinId_1.default.CallWindow;
    let win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    if (win && !win.isDestroyed()) {
        win.webContents.send("endCall");
    }
}
async function handleAudioCallInvite(msgBody) {
    console.log("收到audioCallInvite消息：", msgBody);
    if (!FeatureSwitch_1.FeatureSwitch.showAudioCall) {
        return;
    }
    let myPuid = (0, UserHelper_1.getUID)();
    let userInfoData = await UserOut.getUserByTuids(myPuid, msgBody.from);
    if (!userInfoData || userInfoData.length == 0) {
        return;
    }
    let myUserInfo = await UserOut.getUser(myPuid, myPuid);
    if (!myUserInfo) {
        return;
    }
    if (myUserInfo.uid + "" == msgBody.from + "") {
        return;
    }
    let win = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.CallWindow);
    let m_CallInfo = getCallInfo();
    console.log("当前有通话窗口", m_CallInfo, win);
    if (m_CallInfo && win && !win.isDestroyed()) {
        console.log("当前有通话窗口，sendImMessage:busy");
        (0, ImMainHelper_1.sendImMessage)({
            type: "cmd",
            action: "rtcCall",
            to: msgBody.from,
            ext: {
                action: "answerCall",
                callId: msgBody.ext.callId,
                callerDevId: msgBody.ext.callerDevId,
                msgType: "rtcCallWithAgora",
                result: "busy",
                ts: Date.now(),
            },
        });
        return;
    }
    let userInfo = userInfoData[0];
    m_CallInfo = new AudioVideoCallInfo_1.CallInfo();
    m_CallInfo.callId = msgBody.ext.callId;
    m_CallInfo.channelName = msgBody.ext.channelName;
    m_CallInfo.callerDevId = msgBody.ext.callerDevId;
    m_CallInfo.calleeDevId = (0, MachineIdUtil_1.machineIdSync)();
    m_CallInfo.callerInfo = msgBody.ext.callerInfo;
    let uaInfo = (0, UaUtils_1.parseUserAgentInfo)((0, SessionCookie_1.getUa)());
    let clientVersion = uaInfo.appVersion;
    let apiVersion = uaInfo.apiVersion;
    m_CallInfo.calleeInfo = {
        devId: m_CallInfo.calleeDevId,
        device: process.platform == "win32" ? "windows" : "mac",
        apiVersion: apiVersion,
        clientVersion: clientVersion,
    };
    m_CallInfo.myUser = {
        puid: myPuid,
        uid: myUserInfo.uid + "",
        name: myUserInfo.name,
        pic: myUserInfo.pic,
    };
    m_CallInfo.toUser = {
        puid: userInfo.puid,
        uid: msgBody.from,
        name: userInfo.name,
        pic: userInfo.pic,
    };
    m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_Invite;
    m_CallInfo.role = AudioVideoCallInfo_1.CallRole.Recipient;
    m_CallInfo.sdkType = msgBody.ext.sdktype ?? 0;
    saveCallInfo(m_CallInfo);
    sendCmdCallMessage({
        action: "alert",
        callId: m_CallInfo.callId,
        calleeDevId: m_CallInfo.calleeDevId,
        callerDevId: m_CallInfo.callerDevId,
        sdkType: m_CallInfo.sdkType,
        msgType: "rtcCallWithAgora",
        ts: Date.now(),
    });
}
electron_1.ipcMain.on("audioCallInvite", (event, msgData) => {
    handleAudioCallInvite(msgData);
});
function handleConfirmRingMessage(msgData) {
    if (!checkCallId(msgData)) {
        return;
    }
    let m_CallInfo = getCallInfo();
    m_CallInfo.state = AudioVideoCallInfo_1.CallState.State_Confirm;
    m_CallInfo.startCallToTime = Date.now();
    showCallWindow();
}
function handleConfirmCalleeMessage(msgData) {
    if (!checkCallId(msgData)) {
        return;
    }
    if (checkCallDevId(msgData)) {
        return;
    }
    saveImCallMessage("已在其他设备处理");
    const winId = WinId_1.default.CallWindow;
    (0, BrowserHelper_1.closeWindow)(winId);
}
async function saveImCallMessage(msg) {
    let userInfo = (0, UserHelper_1.getUser)();
    if (!userInfo) {
        return;
    }
    userInfo.uid += "";
    let msgView = (0, BrowserHelper_1.getViewInViewMap)("tab_message_sub");
    if (msgView && msgView.webContents && !msgView.webContents.isDestroyed()) {
        let m_CallInfo = getCallInfo();
        msgView.webContents.send("_saveImMessage", {
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
}
//# sourceMappingURL=AudioVideoCallMainHelper.js.map