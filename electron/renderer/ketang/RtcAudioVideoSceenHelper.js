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
const fs = require("fs");
const RtcSdk_1 = require("../rtcsdk/RtcSdk");
const events_1 = require("events");
const VideoRowDataUtil = require("../agaro/VideoRowDataUtil");
const path_1 = __importDefault(require("path"));
const webStorageUtil = require("../web.storage.util");
const RendererHelper_1 = require("../RendererHelper");
const RendererHelper = __importStar(require("../RendererHelper"));
const MainWindowHelper_1 = __importDefault(require("../MainWindowHelper"));
const DebounceUtil_1 = require("../../utils/DebounceUtil");
const RtcErrorCode_1 = require("../rtcsdk/RtcErrorCode");
const agora_electron_sdk_1 = require("agora-electron-sdk");
const VideoRowDataUtil_1 = require("../agaro/VideoRowDataUtil");
const VolumePlugin = require("./VolumePlugin");
const appConfig = require("../../config/appconfig");
const WinId_1 = __importDefault(require("../../common/WinId"));
const AudioFrameHelper_1 = require("./AudioFrameHelper");
const parser_1 = require("../rtcsdk/manager/parser/parser");
const AVDeviceHelper_1 = require("./AVDeviceHelper");
const m_NetworkQuality = new Map();
RendererHelper.setBlockRefresh(true);
class InjectRtcAudioVideoScreen {
    constructor() {
        this.debug = false;
        this.rtc_cloud_proxy = false;
        this.sdkType = 0;
        this.multiscreen = false;
        this.meet_debug = false;
        this.scollSubscibeVideo = true;
        this.openPIP = false;
        this.openPIP2 = false;
        this.videoBoxUid = 0;
        this.clientRole = 2;
        this.audioStatus = 0;
        this.videoStatus = 0;
        this.loopbackStatus = 0;
        this.screenStatus = 0;
        this.share_all_window_in_screen = true;
        this.sharePcAudio = false;
        this.videoConfig = {
            width: 320,
            height: 180,
            bitrate: 0,
            frameRate: 15,
        };
        this.screenConfig = {
            width: 1280,
            height: 720,
            bitrate: 0,
            frameRate: 15,
            captureMouseCursor: true,
            windowFocus: false,
        };
        this.assistProperties = {
            autoSubscribeAudio: true,
            autoSubscribeVideo: true,
        };
        this.screenToolsChannel = "screenTools";
        this.meetToolsFormMainChannel = "meetToolsFormMain";
        this.screenType = "";
        this.screenInfo = "";
        this.userId = 0;
        this.userName = "我";
        this.mainAppId = "";
        this.mainChannel = "";
        this.mainVideoToken = "";
        this.mainScreenToken = "";
        this.hasMinor = false;
        this.groupId = "";
        this.minorAppId = "";
        this.minorChannel = "";
        this.minorVideoToken = "";
        this.disable_screen_share_tools_window = false;
        this.showSettingOnWindow = true;
        this.isRegisteCallback = false;
        this.networkType = -1;
        this.localMirrorMode = false;
        this.videoDataEvent = new events_1.EventEmitter();
        this.m_beautyEffectSupported = true;
        this.m_startScreenTime = 0;
        this.m_language = 0;
        this.m_IsOpenPreview = false;
        this.ipcRendererCallback = (args, sys) => {
            if (!args || !args.cmd) {
                return;
            }
            if (this.debug) {
                console.log("[InjectRtcAudioVideoScreenUtil][_meetToolsFormMain_]收到投屏指令信号 指令 " +
                    JSON.stringify(args));
            }
            if ("windowMapChange" == args.cmd) {
                this.windowIdArray = args.windowIds;
                this.allWindowIdArray = args.allWindowIds;
                if (this.Meeting.screenConfig) {
                    this.screenConfig = this.Meeting.screenConfig;
                    if (this.screenType == "1" && !this.share_all_window_in_screen) {
                        this.updateScreenParams(this.screenConfig);
                    }
                }
            }
            else if ("getVideoData" == args.cmd) {
                if (args.uid == 0) {
                    args.uid = this.userId;
                }
                this.openVideoBox(args.uid, false);
            }
            else if ("startScreenByChose" == args.cmd) {
                let infoTemp = args.info;
                if (infoTemp) {
                    let hiddenChaoxingWindow = args.hiddenChaoxingWindow;
                    this.updateScreenParams(this.screenConfig);
                    setTimeout(() => {
                        this.updateScreenParams(this.screenConfig);
                    }, 500);
                    let sharePcAudio = args.sharePcAudio;
                    this.sharePcAudio = sharePcAudio;
                    RendererHelper.setUserStore("sharePcAudio", this.sharePcAudio);
                    if (!args.reChose) {
                        this.screenType = "";
                        this.screenInfo = "";
                    }
                    this.Meeting.setMeet("setShieldWindow", hiddenChaoxingWindow ? 1 : 0);
                    if (args.openType === 1) {
                        RendererHelper.emit("chooseScreenWindowResult", {
                            type: args.type,
                            info: infoTemp,
                            openPIP: args.openPIP,
                            hiddenChaoxingWindow: args.hiddenChaoxingWindow,
                            sharePcAudio: args.sharePcAudio,
                            reChose: args.reChose,
                        });
                    }
                    else {
                        if ("1" == args.type) {
                            this.startScreenByChose("1", infoTemp, {
                                openPIP: args.openPIP,
                                reshareAfterLogout: false,
                            });
                        }
                        else if ("2" == args.type) {
                            this.startScreenByChose("2", infoTemp, {
                                openPIP: args.openPIP,
                                reshareAfterLogout: false,
                            });
                        }
                    }
                }
            }
            else if ("getChoseScreenData" == args.cmd) {
                this.getChoseScreenData();
            }
            else if ("stopScreen" == args.cmd) {
                this.RtcScreenUtil.stopShareScreen();
                this.screenType = "";
                this.screenInfo = "";
            }
            else if ("openMember" == args.cmd) {
                this.Meeting.showMemTab();
                RendererHelper.showWindow();
            }
            else if ("openChar" == args.cmd) {
                this.Meeting.showChatTab();
                RendererHelper.showWindow();
            }
            else if ("openAudio" == args.cmd) {
                this.Meeting.openAudio();
            }
            else if ("closeAudio" == args.cmd) {
                this.Meeting.closeAudio();
            }
            else if ("openCamera" == args.cmd) {
                this.Meeting.openCamera();
            }
            else if ("closeCamera" == args.cmd) {
                if (this.openPIP2) {
                    RendererHelper.confirm("关闭视频将同时关闭画中画", {
                        title: "  ",
                        backgroundColor: "white",
                        okBtn: "关闭",
                        cancelBtn: "取消",
                        okClick: () => {
                            this.changePip(false);
                            this.Meeting.closeCamera();
                        },
                        winCfg: JSON.stringify({ id: "closeVideo_Pip" }),
                    });
                }
                else {
                    this.Meeting.closeCamera();
                }
            }
            else if ("openRecord" == args.cmd) {
                this.Meeting.openRecord();
            }
            else if ("closeRecord" == args.cmd) {
                this.Meeting.closeRecord();
            }
            else if ("closePIPVideoBox" == args.cmd) {
                this.openPIP2 = false;
                RendererHelper.emit("onPipStateChanged", { value: 0 });
            }
            else if ("toggleAllowSet" == args.cmd) {
                let statusTemp = args.status || 0;
                this.Meeting.toggleAllowSet(statusTemp);
            }
            else if ("meetSet" == args.cmd) {
                let value = args.status;
                if (typeof value == "undefined") {
                    return;
                }
                let type = args.setType;
                this.Meeting.setMeet(type, value);
            }
            else if ("videoResolutionSet" == args.cmd) {
                let value = args.value;
                if (typeof value == "undefined") {
                    return;
                }
                this.RtcMediaUtil.changeVideoConfig(value);
                if (this.Meeting.videoConfig) {
                    this.videoConfig = this.Meeting.videoConfig;
                    this.updateVideoParams(this.videoConfig);
                }
            }
            else if ("screenResolutionSet" == args.cmd) {
                let value = args.value;
                if (typeof value == "undefined") {
                    return;
                }
                this.RtcScreenUtil.changeShareConfig(value);
                if (this.Meeting.screenConfig) {
                    this.screenConfig = this.Meeting.screenConfig;
                    this.updateScreenParams(this.screenConfig);
                }
            }
            else if ("endOrleaveMeet" == args.cmd) {
                let statusTemp = args.status || 0;
                this.Meeting.endOrleaveMeet(statusTemp);
            }
            else if ("screenBreakoff" == args.cmd) {
                this.RtcScreenUtil.screenBreakOffByElectron();
            }
            else if ("speechExeBox" == args.cmd) {
                let openTemp = args.open || -1;
                if (openTemp == 1) {
                    this.Meeting.changeTranslationStatus(1);
                }
                else if (openTemp == 0) {
                    this.Meeting.changeTranslationStatus(0);
                }
            }
            else if ("execfunction" == args.cmd) {
                let funTemp = args.fun || "";
                if (typeof funTemp === "function") {
                    funTemp();
                }
            }
        };
    }
    isWin() {
        if (process.platform === "win32") {
            return true;
        }
        return false;
    }
    isMac() {
        if (process.platform === "darwin") {
            return true;
        }
        return false;
    }
    blurFun() {
        if (this.longPressToSpeakTask) {
            clearTimeout(this.longPressToSpeakTask);
            this.longPressToSpeakTask = undefined;
            this.stopAudio();
        }
    }
    focusFun() { }
    formatWebValue(value, defaultValue) {
        if (typeof value == "undefined") {
            return defaultValue;
        }
        else {
            return value + "";
        }
    }
    sendMembersNumber(num) {
        let messageTemp = {
            cmd: "membersNumber",
            num: num,
        };
        RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
    }
    sendChatNumber(num) {
        let messageTemp = {
            cmd: "chatNumber",
            num: num,
        };
        RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
    }
    sendAudioVolume(status) {
        let messageTemp = {
            cmd: "audioVolume",
            status: status,
        };
        RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
    }
    sendRecordingStatus(status, msg) {
        let messageTemp = {
            cmd: "recordingStatus",
            status: status,
            msg: msg,
        };
        RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
    }
    sendLiveStatus(status, msg) {
        let messageTemp = {
            cmd: "liveStatus",
            status: status,
            msg: msg,
        };
        RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
    }
    sendChangeMeetWindow(windowWidth, windowHeight) {
        if (!windowWidth || !windowHeight) {
            return;
        }
        if (this.multiscreen) {
            return;
        }
        let messageTemp = {
            cmd: "changeMeetWindowSize",
            windowWidth: windowWidth,
            windowHeight: windowHeight,
        };
        RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
    }
    sendFunToToolsWindow(fun) {
        if (typeof fun !== "function") {
            return;
        }
        let messageTemp = {
            cmd: "execfunction",
            fun: fun,
        };
        RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
    }
    sendCloseToToolsWindow() {
        let messageTemp = {
            cmd: "endOrleaveMeet",
        };
        RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
    }
    speechExeBox(open, type = 1) {
        let messageTemp;
        if (open == 1) {
            let language = "zh";
            if (this.m_language == 1) {
                language = "en";
            }
            messageTemp = {
                cmd: "start",
                language: language,
                type,
                sdkType: this.sdkType,
            };
        }
        else if (open == 0) {
            messageTemp = {
                cmd: "stop",
            };
        }
        if (messageTemp) {
            RendererHelper.sendToMainProcess("speechTools", messageTemp);
        }
    }
    sendNetWork(data) {
        let messageTemp = {
            cmd: "netWork",
            data: data,
        };
        RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
    }
    showOpenWindow(windowUUID) {
        RendererHelper.showWindow(windowUUID);
    }
    closeOpenWindow(windowUUID) {
        RendererHelper.closeWindow(windowUUID);
    }
    setSdkType(sdkType) {
        if (typeof sdkType == "string") {
            this.sdkType = parseInt(sdkType);
        }
        else {
            this.sdkType = sdkType;
        }
    }
    initCallBack(callback) {
        this.init_CallBack = callback;
    }
    async init(groupId) {
        RendererHelper.offStoreDataChanged("share_all_window_in_screen", "rtc_init");
        RendererHelper.onStoreDataChanged("share_all_window_in_screen", (value) => {
            if (this.share_all_window_in_screen != value) {
                let messageTemp = {
                    cmd: "shareAllWindowInScreen",
                    value: value,
                };
                RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
            }
            this.share_all_window_in_screen = value;
            this.updateScreenParams(this.screenConfig);
        }, "rtc_init");
        console.log(`AudioVideoScreenRTC init:groupId:${groupId}`);
        this.disable_screen_share_tools_window = false;
        if (this.Meeting.videoConfig) {
            this.videoConfig = this.Meeting.videoConfig;
        }
        console.log("videoConfig=", this.videoConfig);
        if (this.Meeting.screenConfig) {
            this.screenConfig = this.Meeting.screenConfig;
        }
        this.multiscreen = await RendererHelper.isMultiscreen();
        console.log("是否多显示器，multiscreen：", this.multiscreen);
        this.userDataPath = await RendererHelper.getUserDataPath();
        let logPath = await RendererHelper.getUserLogPath();
        this.sdkLogPath = path_1.default.join(logPath, "agora", `agoraSdk_${dateFormat(new Date(), "yyyyMMdd")}.log`);
        console.log("screenConfig=", this.screenConfig);
        console.log("sdkLogPath=", this.sdkLogPath);
        RendererHelper.getUserStore("share_all_window_in_screen").then((value) => {
            if (value === undefined) {
                this.share_all_window_in_screen = true;
            }
            else {
                this.share_all_window_in_screen = value;
            }
        });
        this.userId = parseInt(this.Meeting.login_puid);
        this.userName = this.Meeting.login_username;
        this.mainAppId = this.Meeting.rtc_appid;
        this.mainChannel = this.Meeting.meet_qrcode;
        this.mainVideoToken = this.Meeting.rtc_video_token;
        this.mainScreenToken = this.Meeting.rtc_screen_token;
        this.hasMinor = false;
        this.groupId = "";
        this.minorAppId = "";
        this.minorChannel = "";
        this.minorVideoToken = "";
        if (typeof groupId != "undefined") {
            if (this.MeetGroup.group_token) {
                let groupTokenElement = this.MeetGroup.group_token["groupid_" + groupId];
                if (groupTokenElement) {
                    this.groupId = groupId;
                    this.hasMinor = true;
                    this.mainAppId = groupTokenElement.rtc_appid;
                    this.mainChannel = groupTokenElement.channelId;
                    this.mainVideoToken = groupTokenElement.rtc_video_token;
                    this.mainScreenToken = groupTokenElement.rtc_screen_token;
                }
            }
            if (this.hasMinor) {
                this.minorAppId = this.Meeting.rtc_appid;
                this.minorChannel = this.Meeting.meet_qrcode;
                this.minorVideoToken = this.Meeting.rtc_video_token;
            }
        }
        this.rtcSdk = (0, RtcSdk_1.createRtcSdk)(this.sdkType);
        this.AudioVideoScreenRTC = this.rtcSdk;
        VideoRowDataUtil.setSdkType(this.sdkType);
        if (this.message_CallBack) {
            this.rtcSdk.onMessage(this.message_CallBack);
        }
        let userInfo = {
            userId: this.Meeting.login_puid,
            userName: this.Meeting.login_username,
        };
        let token = "";
        let sdklogPath = this.sdkLogPath;
        if (this.sdkType == 1) {
            token = this.Meeting.rongke_token;
            let dateStr = dateFormat(new Date(), "yyyyMMdd");
            sdklogPath = path_1.default.join(this.sdkLogPath, "../../cx_rtc", dateStr);
            if (!fs.existsSync(sdklogPath)) {
                fs.mkdirSync(sdklogPath, { recursive: true });
            }
        }
        else {
            let logDir = path_1.default.join(this.sdkLogPath, "..");
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir);
            }
        }
        return this.rtcSdk
            .initialize2(this.mainAppId, userInfo, token, undefined, {
            filePath: sdklogPath,
            fileSizeInKB: 20480,
            level: 1,
        })
            .then((ret) => {
            if (ret === 0) {
                this.afterInit();
            }
            else {
                if (this.init_CallBack) {
                    this.init_CallBack(ret);
                }
            }
            return ret;
        });
    }
    isDevInList(devId, devList) {
        if (!devId) {
            return false;
        }
        for (let i = 0; i < devList.length; i++) {
            let dev = devList[i];
            if (dev.deviceid === devId) {
                return true;
            }
        }
        return false;
    }
    getSystemDefaultDev(devList) {
        if (devList.length == 0) {
            return;
        }
        for (let i = 0; i < devList.length; i++) {
            let dev = devList[i];
            if (dev.isSystemDefault === 1) {
                return dev;
            }
        }
        return devList[0];
    }
    async afterInit() {
        if (this.sdkType == 0) {
            (0, AudioFrameHelper_1.setRtcSdkForAudioFrame)(this.rtcSdk);
            (0, AudioFrameHelper_1.setAudioFrameLisenter)(this);
            this.rtcSdk.onRtcEvent("onStreamMessage", (connection, remoteUid, streamId, data, length, sentTs) => {
                if (data) {
                    let dataObj = parser_1.parser.praseData(data);
                    RendererHelper.emit("onStreamMessage", {
                        remoteUid: remoteUid,
                        streamId: streamId,
                        data: dataObj,
                        sentTs,
                    });
                    console.log(`onStreamMessage:remoteUid:${remoteUid},streamId:${streamId},data:${dataObj},length:${length},sentTs:${sentTs}`);
                }
            });
            this.rtcSdk.onRtcEvent("onStreamMessageError", (connection, remoteUid, streamId, code, missed, cached) => {
                console.log(`onStreamMessageError:remoteUid:${remoteUid},streamId:${streamId},code:${code},missed:${missed},cached:${cached}`);
            });
        }
        this.enableSubscribe(true, true);
        this.rtcSdk.setCloudProxy(this.rtc_cloud_proxy ? 1 : 0);
        console.log("AudioVideoScreenRTC rtc_appid=", this.mainAppId);
        this.setRemoteDefaultVideoStreamType(1);
        setTimeout(() => {
            AVDeviceHelper_1.devUseRecords.init(this);
        }, 100);
        this.rtcSdk.onJoinedChannel((channel, uid, elapsed) => {
            console.info(`AudioVideoScreenRTC joined Video channel ${channel} with uid ${uid}, elapsed ${elapsed}ms`);
            this.afterJoinRoom(uid);
        });
        this.rtcSdk.onRejoinedChannel((channel, uid, elapsed) => {
            console.info(`AudioVideoScreenRTC rejoined Video channel ${channel} with uid ${uid}, elapsed ${elapsed}ms`);
            this.setupLocalVideo(uid);
        });
        this.rtcSdk.onUserJoined((uid, elapsed, conn) => {
            console.info(`AudioVideoScreenRTC userJoined uid ${uid}, elapsed ${elapsed}ms,conn_channelId:${conn?.channelId},conn_localUid:${conn?.localUid}`);
            RendererHelper.emit("userJoined", uid, conn);
            if (this.sdkType == 1 && conn) {
                return;
            }
            if (this.Meeting.isVideoId(uid)) {
                this.RtcMediaUtil.onPeerOnline({ uid: uid });
            }
            else {
                let userIdTemp = parseInt(this.Meeting.getScreenPuid(this.Meeting.login_puid));
                if (uid != userIdTemp) {
                    this.muteRemoteVideo(uid, false);
                }
            }
        });
        this.rtcSdk.onUserOffline((uid, reason, conn) => {
            console.info(`AudioVideoScreenRTC userOffline uid ${uid}, reason ${reason},conn:${conn?.channelId}`);
            RendererHelper.emit("userOffline", uid, conn);
            if (this.sdkType == 1 && conn) {
                return;
            }
            this.RtcMediaUtil.onPeerLeave({ uid: uid });
        });
        this.rtcSdk.onRemoveStream((uid, reason) => {
            console.info(`AudioVideoScreenRTC removeStream: uid ${uid} -reason ${reason}`);
            if (reason != 2) {
                this.RtcMediaUtil.onPeerLeave({ uid: uid });
            }
        });
        this.rtcSdk.onError((err, msg) => {
            console.error(`AudioVideoScreenRTC error: code ${err} - ${msg}`);
            RendererHelper.emit("rtcSdkError", { errCode: err, msg });
        });
        this.rtcSdk.onRtcError((errCode, rtcErrorCode, msg) => {
            console.error(`rtcError:${errCode},rtcErrorCode:${rtcErrorCode},msg:${msg}`);
            if (errCode == RtcErrorCode_1.ErrorCode.publish_audiostream_error) {
                if (this.audioStatus != 0) {
                    this.audioStatus = 0;
                    this.RtcMediaUtil.myAudioStatusChange(0);
                    let messageTemp = {
                        cmd: "closeAudio",
                    };
                    RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
                }
            }
            else if (errCode == RtcErrorCode_1.ErrorCode.publish_camerastream_error) {
                if (this.videoStatus != 0) {
                    this.videoStatus = 0;
                    this.RtcMediaUtil.myVideoStatusChange(0);
                    let messageTemp = {
                        cmd: "closeVideo",
                    };
                    RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
                }
            }
            RendererHelper.emit("rtcError", {
                errCode,
                rtcErrorCode,
                msg,
                sdkType: this.sdkType,
            });
        });
        this.rtcSdk.onGroupAudioVolumeIndication((speakers, speakerNumber, totalVolume) => {
            if (speakerNumber > 0) {
                speakers.forEach((speaker) => {
                    if (speaker.uid === 0) {
                        if (this.audioStatus === 0 && speaker.volume > 20) {
                            console.log(`您已静音，请开启麦克风。`);
                        }
                    }
                });
            }
            this.RtcMediaUtil.onVolumeIndicator(speakers);
        });
        this.rtcSdk.onRemoteAudioStateChanged((uid, state, reason, elapsed) => {
            console.info(`AudioVideoScreenRTC远端音频流状态发生改变回调: ${uid} - ${state} - ${reason} - ${elapsed}`);
            if (this.Meeting.isVideoId(uid)) {
                if (state == 0) {
                    if (reason == 3 || reason == 5 || reason == 7) {
                    }
                    this.RtcMediaUtil.onMuteAudio({ uid: uid });
                }
                else if (state == 1 || state == 2) {
                    this.RtcMediaUtil.onUnmuteAUdio({ uid: uid });
                }
                if (uid + "" == this.userId + "" || uid + "" == "0") {
                    RendererHelper.emit("onLocalAudioStateChanged", state, reason);
                }
            }
        });
        this.rtcSdk.onRemoteVideoStateChanged((uid, state, reason, elapsed) => {
            console.info(`AudioVideoScreenRTC远端视频流状态发生改变回调: ${uid} - ${state} - ${reason} - ${elapsed}`);
            if (state == 0) {
                if (reason == 3 || reason == 5 || reason == 7) {
                }
                if (this.Meeting.isVideoId(uid)) {
                    this.RtcMediaUtil.onDisableVideo({ uid: uid, reason });
                }
                else if (this.Meeting.isScreenId(uid)) {
                    this.RtcScreenUtil.userScreenStatusChange(uid, 0);
                }
            }
            else if (state == 1 || state == 2) {
                if (this.Meeting.isVideoId(uid)) {
                    if (typeof this.RtcMediaUtil.onHandleSubcribeVideo != "undefined") {
                        this.RtcMediaUtil.onHandleSubcribeVideo(uid, reason);
                    }
                    else {
                        if (document.querySelectorAll("#camera_" + uid).length === 0) {
                            let div = document.createElement("div");
                            div.id = `camera_${uid}`;
                            div?.classList.add("cameraVideo");
                            document
                                .querySelector("#video_user_" + uid + " .videoRenderArea")
                                .appendChild(div);
                        }
                        let remoteVideoContainer = document.getElementById("camera_" + uid);
                        if (remoteVideoContainer) {
                            let domRemoteVideoCode = this.subscribe(uid, remoteVideoContainer, {}, false);
                            console.log("AudioVideoScreenRTC设置远端视频渲染位置", domRemoteVideoCode);
                            this.RtcMediaUtil.onEnableVideo({ uid: uid, reason });
                        }
                    }
                }
                else if (this.Meeting.isScreenId(uid)) {
                    this.m_screenSharePuid = uid + "";
                    if (state == 1) {
                        let userIdTemp = parseInt(this.Meeting.getScreenPuid(this.Meeting.login_puid));
                        if (uid == userIdTemp) {
                            this.videoDataEvent.emit("screenShareVideoReceived");
                        }
                    }
                    this.RtcScreenUtil.userScreenStatusChange(uid, 1);
                }
            }
            else if (state == 4) {
                if (this.Meeting.isVideoId(uid)) {
                    this.RtcMediaUtil.onDisableVideo({ uid: uid, reason });
                }
                else if (this.Meeting.isScreenId(uid)) {
                    this.RtcScreenUtil.userScreenStatusChange(uid, 0);
                }
            }
            if (uid + "" == this.userId + "" || uid + "" == "0") {
                RendererHelper.emit("onLocalVideoStateChanged", state, reason);
            }
        });
        this.rtcSdk.onRemoteScreenShareStateChanged((uid, state, reason) => {
            console.info(`远端屏幕共享流状态发生改变回调: ${uid} - ${state} - ${reason}`);
            if (state == 0) {
                if (reason == 3 || reason == 5 || reason == 7) {
                }
                if (reason == 4) {
                    RendererHelper.emit("rtcError", {
                        errCode: "screenShareError",
                        rtcErrorCode: 11,
                        msg: "窗口被最小化了",
                        sdkType: this.sdkType,
                    });
                }
                else if (reason == 5) {
                    RendererHelper.emit("rtcError", {
                        errCode: "screenShareError",
                        rtcErrorCode: 12,
                        msg: "窗口已关闭",
                        sdkType: this.sdkType,
                    });
                }
                this.RtcScreenUtil.userScreenStatusChange(uid, 0, undefined, reason);
            }
            else if (state == 1 || state == 2 || state == 5) {
                if (reason == 6) {
                    RendererHelper.emit("rtcError", {
                        errCode: "screenShareError",
                        rtcErrorCode: 27,
                        msg: "窗口已还原",
                        sdkType: this.sdkType,
                    });
                }
                this.RtcScreenUtil.userScreenStatusChange(uid, 1, undefined, reason);
            }
            else if (state == 4) {
                this.RtcScreenUtil.userScreenStatusChange(uid, 0, undefined, reason);
            }
        });
        this.rtcSdk.onUserMuteVideo((uid, muted) => {
            console.info(`AudioVideoScreenRTC远端视频状态发生改变回调:onUserMuteVideo: ${uid} - ${muted}`);
            if (muted) {
                this.RtcMediaUtil.onDisableVideo({ uid: uid });
            }
            else {
                this.RtcMediaUtil.onEnableVideo({ uid: uid });
            }
        });
        this.rtcSdk.onNetworkQuality((uid, txquality, rxquality) => {
            if (this.NetShooting.netWorkDetect) {
                this.NetShooting.netWorkDetect(uid, txquality, rxquality);
            }
            let lastValue = m_NetworkQuality.get(uid);
            if (lastValue) {
                if (txquality == lastValue.txquality &&
                    rxquality == lastValue.rxquality &&
                    new Date().getTime() - lastValue.time < 60 * 1000) {
                    return;
                }
            }
            if (uid == 0 || (uid + "").includes(this.userId + "")) {
                console.log(`AudioVideoScreenRTC onNetworkQuality发生改变回调: ${uid} - ${txquality} - ${rxquality}`);
            }
            m_NetworkQuality.set(uid, {
                txquality,
                rxquality,
                time: new Date().getTime(),
            });
        });
        this.rtcSdk.onConnectionStateChanged((state, reason, connection) => {
            console.info(`AudioVideoScreenRTC网络状态发生改变回调: ${state} - ${reason}-${JSON.stringify(connection)}`);
            RendererHelper.emit("onConnectionStateChanged", connection, state, reason);
            if (state == 3) {
                if (this.NetShooting.netWorkDetect) {
                    this.NetShooting.netWorkDetect(0, 1, 1);
                }
            }
            else if (state == 4) {
                if (this.NetShooting.netWorkDetect) {
                    this.NetShooting.netWorkDetect(0, 6, 6);
                }
            }
            else if (state == 5) {
                this.NetShooting.netWorkDetect(0, 6, 6);
            }
            else {
            }
        });
        this.rtcSdk.onConnectionLost(() => {
            console.info(`AudioVideoScreenRTC网络连接中断`);
            if (this.NetShooting.netWorkDetect) {
                this.NetShooting.netWorkDetect(0, 6, 6);
            }
        });
        let m_lastRecordRtcStatsTime = 0;
        this.rtcSdk.onRtcStats((stats) => {
            if (this.debug) {
                console.log(`AudioVideoScreenRTC通话相关统计信息: ${stats.lastmileDelay}ms-${stats.gatewayRtt}ms-${stats.txPacketLossRate}%-${stats.rxPacketLossRate}%`);
            }
            this.m_RtcStat = stats;
            let curTime = new Date().getTime();
            let intervalTime = curTime - m_lastRecordRtcStatsTime;
            if (intervalTime > 2 * 60 * 1000) {
                m_lastRecordRtcStatsTime = curTime;
                console.info(`RtcStats:${JSON.stringify(stats, null, 2)}`);
            }
            let dataStats = {
                type: "2",
                lastmileDelay: stats.lastmileDelay,
                gatewayRtt: stats.gatewayRtt,
                txPacketLossRate: stats.txPacketLossRate,
                rxPacketLossRate: stats.rxPacketLossRate,
                txKBitRate: stats.txKBitRate,
                rxKBitRate: stats.rxKBitRate,
            };
            this.RtcScreenUtil.netWorkChange(dataStats);
            this.sendNetWork(dataStats);
            this.rtcStats = stats;
            RendererHelper.emit("rtcStats", stats);
        });
        this.rtcSdk.onNetworkTypeChanged((type) => {
            this.networkType = type;
        });
        VideoRowDataUtil.onGetVideoFrame((videoFrame) => {
            let ret = this.rtcSdk.getVideoFrame(videoFrame);
            if (ret && videoFrame.uid == 0) {
                ret.localMirrorMode = this.localMirrorMode;
            }
            return ret;
        });
        (0, VideoRowDataUtil_1.onEnableVideoFrameCache)((config) => {
            if (this.sdkType == 0) {
                return this.rtcSdk.enableVideoFrameCache(config);
            }
        });
        this.rtcSdk.onTokenPrivilegeWillExpire((token) => {
            console.info(`AudioVideoScreenRTC音视频token过期: ${token}`);
            if (this.hasMinor) {
                this.RtcMediaUtil.onTokenPrivilegeWillExpire(3);
            }
            else {
                this.RtcMediaUtil.onTokenPrivilegeWillExpire(1);
            }
        });
        this.rtcSdk.onVideoSourceRequestNewToken((token) => {
            console.info(`AudioVideoScreenRTC投屏token过期: ${token}`);
            if (this.hasMinor) {
                this.RtcMediaUtil.onTokenPrivilegeWillExpire(3);
            }
            else {
                this.RtcMediaUtil.onTokenPrivilegeWillExpire(2);
            }
        });
        this.rtcSdk.onRepeatLogin(() => {
            RendererHelper.emit("repeatLogin");
        });
        this.rtcSdk.onRoomStateChange((state) => {
            console.log("频道状态变化：onRoomStateChange:", state);
            if (state === 3) {
                this.NetShooting.netWorkDetect(0, 1, 1);
            }
            else if (state === 4) {
                this.NetShooting.netWorkDetect(0, 6, 6);
                this.NetShooting.netWorkDetect(0, 9, 9);
            }
        });
        this.rtcSdk.onAudioDeviceStateChanged((deviceId, deviceType, deviceState) => {
            console.log(`音频设备插拔:deviceId:${deviceId},deviceType:${deviceType},deviceState:${deviceState}`);
            if (this.isVirtualAudioDevices(deviceId)) {
                return;
            }
            RendererHelper.emit("rtcAudioDeviceStateChanged", {
                deviceId,
                deviceType,
                deviceState,
            });
            if (deviceState === 0) {
                if (deviceType == 1) {
                    AVDeviceHelper_1.devUseRecords.audioDev.onDevAdd(deviceId);
                }
                else {
                    AVDeviceHelper_1.devUseRecords.speakerDev.onDevAdd(deviceId);
                }
            }
            else if (deviceState === 8 || deviceState === 4) {
                if (deviceType == 1) {
                    AVDeviceHelper_1.devUseRecords.audioDev.onDevRemoved(deviceId);
                }
                else {
                    AVDeviceHelper_1.devUseRecords.speakerDev.onDevRemoved(deviceId);
                }
            }
        });
        this.rtcSdk.onVideoDeviceStateChanged((deviceId, deviceType, deviceState) => {
            if (deviceId) {
                if (deviceState == 8) {
                    let curVideo = this.getVideoDevices().currentVideoDevice;
                    if (!curVideo || (deviceId && deviceId == curVideo)) {
                        RendererHelper.emit("rtcError", {
                            errCode: RtcErrorCode_1.ErrorCode.video_input_dev_unplug,
                            rtcErrorCode: -1,
                            msg: "摄像头设备拔出",
                            sdkType: this.sdkType,
                        });
                        let videoDevices = this.rtcSdk.getVideoDevices();
                        if (videoDevices && videoDevices.length > 0) {
                            this.setVideoDevices(videoDevices[0].deviceid);
                        }
                    }
                }
            }
        });
        this.rtcSdk.onRtcEvent("onAudioDeviceVolumeChanged", (deviceType, volume, muted) => {
            console.debug(`onAudioDeviceVolumeChanged:deviceType:${deviceType},volume:${volume},muted:${muted}`);
            if (deviceType == 1) {
                VolumePlugin.setRecordMute(false);
                setTimeout(() => {
                    VolumePlugin.isRecordMute().then((isRecordMute) => {
                        if (isRecordMute) {
                            RendererHelper.emit("AudioRecordingMute", isRecordMute);
                        }
                    });
                }, 1);
            }
        });
        this.rtcSdk.onLocalVideoStateChanged((source, state, err) => {
            RendererHelper.emit("onLocalVideoStateChanged", source, state, err);
        });
        this.rtcSdk.setChannelProfile(1);
        this.rtcSdk.setClientRole(2);
        let openAudioCode = this.rtcSdk.enableAudio();
        console.info("AudioVideoScreenRTC打开音频功能", openAudioCode);
        let audioProfileCode = this.rtcSdk.setAudioProfile(0, 8);
        console.info("AudioVideoScreenRTC设置音频场景", audioProfileCode);
        let videoConfigCode = this.rtcSdk.setVideoEncoderConfiguration(this.videoConfig);
        console.info("AudioVideoScreenRTC设置videoConfig", videoConfigCode);
        let openVideoCode = this.rtcSdk.enableVideo();
        console.info("AudioVideoScreenRTC打开视频功能", openVideoCode);
        this.rtcSdk.enableDualStreamMode(true);
        this.rtcSdk.setParameters('{"che.audio.agc.calVoiceProbability":0}');
        if (this.Meeting.audioBitrate) {
            this.rtcSdk.setParameters(`{\"che.audio.custom_bitrate\":${this.Meeting.audioBitrate}}`);
        }
        if (this.Meeting.outsideRatio) {
            this.rtcSdk.setParameters(`{\"che.video.fec_outside_bw_ratio\":${this.Meeting.outsideRatio}}`);
        }
        this.rtcSdk.setParameters(`{\"che.video.screenShareDetailVqc\":false}`);
        this.rtcSdk.setParameters(`{\"che.video.screenShareDetailMaxQP\":45}`);
        this.rtcSdk.setParameters(`{\"che.video.screenShareDetailMinQP\":18}`);
        this.setParameters(`{"che.audio.enable.predump":{"enable":"true","duration":"60"}}`);
        let audioDumpPath = path_1.default.join(this.sdkLogPath, "../audioDump");
        if (process.platform == "win32") {
            if (!fs.existsSync(audioDumpPath)) {
                fs.mkdirSync(audioDumpPath, { recursive: true });
            }
            audioDumpPath = audioDumpPath.replaceAll("\\", "\\\\");
        }
        this.setParameters(`{"che.audio.dump_path":"${audioDumpPath}"}`);
        this.setParameters('{"che.audio.windows.bypass_render_apo":true}');
        this.setParameters('{"che.audio.aec.aggressiveness": 30}');
        this.rtcSdk.setScreenCaptureScenario(1);
        if (this.Meeting.rtcParams) {
            this.Meeting.rtcParams.forEach((rtcParam) => {
                this.rtcSdk.setParameters(`{\"${rtcParam.key}\":${rtcParam.value}}`);
            });
        }
        let joinChannelCode = this.rtcSdk.joinChannel(this.mainVideoToken, this.mainChannel, "  ", this.userId, this.Meeting.joinChannelOptions);
        if (joinChannelCode !== 0) {
            throw new Error("AudioVideoScreenRTC joinChannel error! errorCode:" + joinChannelCode);
        }
        console.info("AudioVideoScreenRTC joinChannel", joinChannelCode);
        console.info("AudioVideoScreenRTC rtc_video_token=", this.mainVideoToken);
        console.info("AudioVideoScreenRTC meet_qrcode=", this.mainChannel);
        console.info("AudioVideoScreenRTC userIdTemp=", this.userId);
        this.registeAllCallback();
        await this.initClassin(this.hasMinor);
        const outerThis = this;
        document.addEventListener("keypress", function (e) {
            if (e.code == "Space") {
                let isOpenAudio = true;
                try {
                    if (outerThis.Meeting.meetSetConfig.isAllowUnmuteSelf == 0 &&
                        outerThis.Meeting.meetSetConfig.isMuteAll == 1 &&
                        outerThis.Meeting.leader == 0) {
                        isOpenAudio = false;
                    }
                }
                catch (e) {
                    isOpenAudio = false;
                }
                if (isOpenAudio && outerThis.audioStatus == 0) {
                    if (!outerThis.longPressToSpeakTask) {
                        outerThis.longPressToSpeakTask = setTimeout(function () {
                            outerThis.startAudio();
                        }, 300);
                    }
                }
            }
        });
    }
    initFloatingWindow() {
        RendererHelper.sendToMainProcess("_initFloatingWindow");
    }
    setParameters(parm) {
        this.rtcSdk.setParameters(parm);
    }
    noiseReduction(mode) {
        if (mode == 0) {
            this.rtcSdk.setParameters('{"che.audio.ains_mode":0}');
            if (this.sdkType == 1) {
                this.rtcSdk.enableAINSModeEx(undefined, false);
            }
        }
        else if (mode == 1) {
            this.rtcSdk.setParameters('{"che.audio.enable.nsng":true}');
            this.rtcSdk.setParameters('{"che.audio.ains_mode":2}');
            this.rtcSdk.setParameters('{"che.audio.ns.mode":2}');
            this.rtcSdk.setParameters('{"che.audio.nsng.lowerBound":80}');
            this.rtcSdk.setParameters('{"che.audio.nsng.lowerMask":50}');
            this.rtcSdk.setParameters('{"che.audio.nsng.statisticalbound":5}');
            this.rtcSdk.setParameters('{"che.audio.nsng.finallowermask":30}');
            if (this.sdkType == 1) {
                this.rtcSdk.enableAINSModeEx(undefined, true);
            }
        }
        else if (mode == 2) {
            this.rtcSdk.setParameters('{"che.audio.enable.nsng":true}');
            this.rtcSdk.setParameters('{"che.audio.ains_mode":2}');
            this.rtcSdk.setParameters('{"che.audio.ns.mode":2}');
            this.rtcSdk.setParameters('{"che.audio.nsng.lowerBound":10}');
            this.rtcSdk.setParameters('{"che.audio.nsng.lowerMask":10}');
            this.rtcSdk.setParameters('{"che.audio.nsng.statisticalbound":0}');
            this.rtcSdk.setParameters('{"che.audio.nsng.finallowermask":8}');
            if (this.sdkType == 1) {
                this.rtcSdk.enableAINSModeEx(undefined, true);
            }
        }
    }
    hasVideoDev() {
        let videoDev = this.rtcSdk.getCurrentVideoDevice();
        if (videoDev) {
            return true;
        }
        else {
            return false;
        }
    }
    hasAudioDev() {
        let audioDev = this.rtcSdk.getCurrentAudioRecordingDevice();
        if (audioDev) {
            return true;
        }
        else {
            return false;
        }
    }
    hasSpeakerDev() {
        let speakerDev = this.rtcSdk.getCurrentAudioPlaybackDevice();
        if (speakerDev) {
            return true;
        }
        else {
            return false;
        }
    }
    afterJoinRoom(uid) {
        if (this.sdkType === 0) {
            let localEnableAudioCode = this.rtcSdk.enableLocalAudio(true);
            if (localEnableAudioCode === 0) {
                console.info("AudioVideoScreenRTC开启本地音频采集:enableLocalAudio", localEnableAudioCode);
            }
            else {
                console.error("AudioVideoScreenRTC开启本地音频采集失败:enableLocalAudio", localEnableAudioCode);
            }
            this.stopAudio();
        }
        let volumeAudioCode = this.rtcSdk.enableAudioVolumeIndication(1000, 3, true);
        console.info("AudioVideoScreenRTC启用说话者音量提示:enableAudioVolumeIndication", volumeAudioCode);
        let localVideoCode = this.rtcSdk.enableLocalVideo(false);
        console.info("AudioVideoScreenRTC停止本地视频采集:enableLocalVideo", localVideoCode);
        this.setupLocalVideo(uid);
        RendererHelper.emit("refreshMeetingVariable");
        let audioSet = this.Meeting.audioSetStatus;
        let videoSet = this.Meeting.videoSetStatus;
        if (audioSet == "1") {
            setTimeout(() => {
                this.startAudio();
            }, 200);
        }
        if (videoSet == "1") {
            setTimeout(() => {
                this.startVideo();
            }, 200);
        }
        if (this.init_CallBack) {
            this.init_CallBack(0);
        }
    }
    registeAllCallback() {
        if (!this.isRegisteCallback) {
            this.isRegisteCallback = true;
            RendererHelper.on(this.meetToolsFormMainChannel, this.ipcRendererCallback);
            RendererHelper.on("getMeetingObject", () => {
                return this.Meeting;
            });
            RendererHelper.on("getSdkType", () => {
                return this.sdkType;
            });
            RendererHelper.on("share_set_changed", (data) => {
                console.log("share_set_changed:", data);
                if (data.oper) {
                    if (data.oper == "sharedPcVoice") {
                        if (data.enable) {
                            this.startLoopbackRecording();
                        }
                        else {
                            this.stopLoopbackRecording();
                        }
                    }
                    else if (data.oper == "shieldApp") {
                        RendererHelper.setUserStore("share_all_window_in_screen", !data.enable);
                    }
                    else if (data.oper == "openPIP") {
                        this.changePip(data.enable);
                    }
                    if (data.oper == "shieldApp") {
                        data.oper = "showKetangWindow";
                        data.enable = !data.enable;
                    }
                    RendererHelper.emit("screen_share_set_changed", data);
                    return 0;
                }
                return -1;
            });
            let outerThis = this;
            document.addEventListener("keyup", function (e) {
                if (e.code == "Space") {
                    if (outerThis.longPressToSpeakTask) {
                        clearTimeout(outerThis.longPressToSpeakTask);
                        outerThis.longPressToSpeakTask = undefined;
                        outerThis.stopAudio();
                    }
                }
            });
            RendererHelper.on("getRtcAudioDevices", () => {
                return this.getAudioDevices();
            });
            RendererHelper.on("getRtcPlayDevices", () => {
                return this.getPlayDevices();
            });
            RendererHelper.on("getRtcVideoDevices", () => {
                return this.getVideoDevices();
            });
            RendererHelper.on("setRtcAudioDevices", (deviceId) => {
                return this.setAudioDevices(deviceId);
            });
            RendererHelper.on("setRtcVideoDevices", (deviceId) => {
                return this.setVideoDevices(deviceId);
            });
            RendererHelper.on("setRtcPlayDevices", (deviceId) => {
                return this.setPlayDevices(deviceId);
            });
            RendererHelper.on("re_share_screen", () => {
                console.log("注意，要重新选择屏幕共享了");
                this.startChoseScreen(true);
            });
            RendererHelper.on("open_meet_seting", () => {
                document.querySelector(".control_setting").click();
            });
            RendererHelper.on("get_network_type", () => {
                return this.networkType;
            });
            RendererHelper.on("changeVideoSetting", (data) => {
                let retCode = 0;
                if (data && data.key) {
                    if (data.key == "VirtualBackground") {
                        retCode = this.RtcMediaUtil.enableVirtualBackground(data.value);
                    }
                    else if (data.key == "VideoMirroring") {
                        retCode = this.RtcMediaUtil.changeMirrorMode(data.value);
                    }
                    else if (data.key == "VideoQuality") {
                        retCode = this.RtcMediaUtil.changeVideoConfig(data.value);
                    }
                    else if (data.key == "ScreenShareQuality") {
                        retCode = this.RtcScreenUtil.changeShareConfig(data.value);
                    }
                    else if (data.key == "BeautyEffectOptions") {
                        retCode = this.RtcMediaUtil.setBeautyEffectOption(data.value);
                    }
                }
                if (typeof retCode == "number") {
                    return retCode;
                }
                else {
                    return 0;
                }
            });
            RendererHelper.on("RtcAudioTest", (data) => {
                let retCode = 0;
                if (data == "startMicTest") {
                    retCode = this.RtcMediaUtil.startMicTest();
                }
                else if (data == "startSpeakerTest") {
                    retCode = this.RtcMediaUtil.startSpeakerTest();
                }
                else if (data == "stopMicTest") {
                    retCode = this.RtcMediaUtil.stopMicTest();
                }
                else if (data == "stopSpeakerTest") {
                    retCode = this.RtcMediaUtil.stopSpeakerTest();
                }
                return retCode;
            });
            RendererHelper.on("enablePreview", (data) => {
                let retCode = 0;
                if (data == "openPreview") {
                    retCode = this.RtcMediaUtil.openPreview();
                }
                else if (data == "closePreview") {
                    retCode = this.RtcMediaUtil.closePreview();
                }
                return retCode;
            });
            RendererHelper.on("isVirtualBackgroundSupported", () => {
                let retCode = this.rtcSdk.isVirtualBackgroundSupported();
                return retCode;
            });
            RendererHelper.on("setIgnoreFeatureSupported", (ignore) => {
                let retCode = this.rtcSdk.setIgnoreFeatureSupported(ignore);
                return retCode;
            });
            RendererHelper.on("isIgnoreFeatureSupported", () => {
                let retCode = this.rtcSdk.isIgnoreFeatureSupported();
                return retCode;
            });
            RendererHelper.on("setRecordVolume", (volume) => {
                let retCode = this.rtcSdk.adjustRecordingSignalVolume(volume);
                return retCode;
            });
            RendererHelper.on("setSpeakerVolume", (volume) => {
                let retCode = this.rtcSdk.adjustPlaybackSignalVolume(volume);
                return retCode;
            });
            RendererHelper.on("getRecordVolume", () => {
                let retCode = this.getRecordVolume();
                return retCode;
            });
            RendererHelper.on("getSpeakerVolume", () => {
                let retCode = this.getSpeakerVolume();
                return retCode;
            });
            RendererHelper.on("setRtcParameters", (parmeter) => {
                let retCode = this.rtcSdk.setParameters(parmeter);
                return retCode;
            });
            RendererHelper.on("noiseReduction", (mode) => {
                this.noiseReduction(mode);
            });
            RendererHelper.on("enableAudioDump", (enable) => {
                this.enableAudioDump(enable);
            });
        }
    }
    isVirtualBackgroundSupported() {
        return this.rtcSdk.isVirtualBackgroundSupported();
    }
    async initClassin(hasMinor) {
        console.log("初始化分组课堂;initClassin:hasMinor:", hasMinor);
        if (hasMinor) {
            if (this.Meeting.assistProperties) {
                this.assistProperties = this.Meeting.assistProperties;
            }
            if (this.rtcSdk == null) {
                return;
            }
            this.rtcSdk.createAssistChannel(this.minorChannel);
            let token = this.minorVideoToken;
            let info = "";
            if (this.sdkType == 1) {
                token = this.Meeting.rongke_token;
                info = this.userName;
            }
            let userExtendedInfo = "";
            if (this.sdkType == 1 && this.assistProperties?.userExtendedInfo) {
                if (typeof this.assistProperties.userExtendedInfo == "object") {
                    userExtendedInfo = JSON.stringify(this.assistProperties.userExtendedInfo);
                }
            }
            let joinAssistChannelCode = await this.rtcSdk.joinAssistChannelAsync(this.minorChannel, token, info, this.userId, this.assistProperties, userExtendedInfo);
            if (joinAssistChannelCode !== 0) {
                throw new Error("AssistChannelRTC joinChannel error! errorCode:" +
                    joinAssistChannelCode);
            }
            if (this.minorChannel) {
                this.rtcSdk.setRemoteDefaultVideoStreamType(1, this.minorChannel);
            }
            console.log("AssistChannelRTC joinChannel", joinAssistChannelCode);
            console.log("AssistChannelRTC rtc_video_token=", this.minorVideoToken);
            console.log("AssistChannelRTC meet_qrcode=", this.minorChannel);
            console.log("AssistChannelRTC userIdTemp=", this.userId);
            this.rtcSdk.onAssistChannel(this.minorChannel, "joinedChannel", (uid, elapsed) => {
                console.log(`AssistChannelRTC joined Assist uid ${uid}, elapsed ${elapsed}ms`);
            });
            this.rtcSdk.onAssistChannel(this.minorChannel, "rejoinChannelSuccess", (uid, elapsed) => {
                console.log(`AssistChannelRTC rejoined Assist uid ${uid}, elapsed ${elapsed}ms`);
            });
            this.rtcSdk.onAssistChannel(this.minorChannel, "userJoined", (uid, elapsed) => {
                console.log(`AssistChannelRTC userJoined Assist uid ${uid}, elapsed ${elapsed}ms`);
            });
            this.rtcSdk.onAssistChannel(this.minorChannel, "userOffline", (uid, elapsed) => {
                console.log(`AssistChannelRTC userOffline Assist uid ${uid}, elapsed ${elapsed}ms`);
            });
            this.rtcSdk.onAssistChannel(this.minorChannel, "channelError", (err, msg) => {
                console.log(`AssistChannelRTC error: code ${err} - ${msg}`);
            });
            this.rtcSdk.onAssistChannel(this.minorChannel, "remoteVideoStateChanged", (uid, state, reason, elapsed) => {
                console.log(`AssistChannelRTC远端视频流状态发生改变回调: ${uid} - ${state} - ${reason} - ${elapsed}`);
                if (state == 0) {
                    if (reason == 3 || reason == 5 || reason == 7) {
                    }
                    if (this.Meeting.isScreenId(uid)) {
                        this.RtcScreenUtil.userAssistScreenStatusChange(uid, 0);
                    }
                }
                else if (state == 1 || state == 2) {
                    if (this.Meeting.isScreenId(uid)) {
                        this.rtcSdk.muteRemoteVideoStreamEx(uid, false, {
                            localUid: this.userId,
                            channelId: this.minorChannel,
                        });
                        this.RtcScreenUtil.userAssistScreenStatusChange(uid, 1);
                    }
                }
            });
            this.rtcSdk.onAssistChannel(this.minorChannel, "onRemoteScreenShareStateChanged", (uid, state, reason, elapsed) => {
                console.log(`AssistChannelRTC远端屏幕共享流状态发生改变回调: ${uid} - ${state} - ${reason} - ${elapsed}`);
                if (state == 0) {
                    if (reason == 3 || reason == 5 || reason == 7) {
                    }
                    this.RtcScreenUtil.userAssistScreenStatusChange(uid, 0);
                }
                else if (state == 1 || state == 2) {
                    this.rtcSdk.muteScreenShareStreamEx(uid, false, {
                        localUid: this.userId,
                        channelId: this.minorChannel,
                    });
                    this.RtcScreenUtil.userAssistScreenStatusChange(uid, 1);
                }
            });
            this.rtcSdk.onAssistChannel(this.minorChannel, "tokenPrivilegeWillExpire", (token) => {
                console.log(`AssistChannelRTC音视频token过期: ${token}`);
                if (this.hasMinor) {
                    this.RtcMediaUtil.onTokenPrivilegeWillExpire(1);
                }
                else {
                    this.RtcMediaUtil.onTokenPrivilegeWillExpire(3);
                }
            });
        }
        else {
            this.closeAssist();
        }
    }
    async startClassin(groupId) {
        this.closeAll();
        return this.init(groupId);
    }
    async openClassin(groupId) {
        this.closeAssist();
        this.hasMinor = false;
        this.groupId = "";
        this.minorAppId = "";
        this.minorChannel = "";
        this.minorVideoToken = "";
        if (typeof groupId != "undefined") {
            console.log(`AudioVideoScreenRTC init:groupId:${groupId},group_token:${JSON.stringify(this.MeetGroup.group_token)}`);
            if (this.MeetGroup.group_token) {
                let groupTokenElement = this.MeetGroup.group_token["groupid_" + groupId];
                if (groupTokenElement) {
                    this.groupId = groupId;
                    this.minorAppId = groupTokenElement.rtc_appid;
                    this.minorChannel = groupTokenElement.channelId;
                    this.minorVideoToken = groupTokenElement.rtc_video_token;
                    this.initClassin(true);
                }
            }
        }
    }
    isVirtualAudioDevices(devicename) {
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
    getAudioPlaybackDevices() {
        let audioPlaybackDevices = this.rtcSdk.getAudioPlaybackDevices();
        for (let i = audioPlaybackDevices.length - 1; i >= 0; i--) {
            let device = audioPlaybackDevices[i];
            if (this.isVirtualAudioDevices(device.devicename)) {
                audioPlaybackDevices.splice(i, 1);
            }
        }
        return audioPlaybackDevices;
    }
    getAudioRecordingDevices() {
        let audioRecordingDevices = this.rtcSdk.getAudioRecordingDevices();
        for (let i = audioRecordingDevices.length - 1; i >= 0; i--) {
            let device = audioRecordingDevices[i];
            if (this.isVirtualAudioDevices(device.devicename)) {
                audioRecordingDevices.splice(i, 1);
            }
        }
        return audioRecordingDevices;
    }
    getPlayDevices() {
        let currentPlayDevice;
        if (AVDeviceHelper_1.devUseRecords.speakerDev.devRecordInfos.isUseDefaultDev) {
            currentPlayDevice = "default";
        }
        else {
            currentPlayDevice = this.rtcSdk.getCurrentAudioPlaybackDevice() || "";
        }
        console.log("currentPlayDevice", currentPlayDevice);
        let playDevices = this.getAudioPlaybackDevices() || [];
        if (playDevices.length === 0) {
            console.log("no play found");
        }
        else {
            let defaultDev = playDevices.find((item) => item.isSystemDefault);
            playDevices.splice(0, 0, {
                devicename: defaultDev
                    ? `默认设备(${defaultDev.devicename})`
                    : "默认设备",
                deviceid: "default",
                defaultDevId: defaultDev?.deviceid,
            });
        }
        console.log("playDevices", JSON.stringify(playDevices));
        let playDevicesObj = {
            currentPlayDevice: currentPlayDevice,
            playDevices: playDevices,
        };
        return playDevicesObj;
    }
    setPlayDevices(playDeviceId, fromUser = true) {
        if (!playDeviceId) {
            return false;
        }
        let setResult = AVDeviceHelper_1.devUseRecords.speakerDev.useDev(playDeviceId);
        console.log("设置播放器deviceId=" + playDeviceId, "状态" + setResult, "是否手动设置：" + fromUser);
        return setResult === 0;
    }
    getAudioDevices() {
        let currentAudioRecordingDevice;
        if (AVDeviceHelper_1.devUseRecords.audioDev.devRecordInfos.isUseDefaultDev) {
            currentAudioRecordingDevice = "default";
        }
        else {
            currentAudioRecordingDevice =
                this.rtcSdk.getCurrentAudioRecordingDevice() || "";
        }
        console.log("currentAudioDevice", currentAudioRecordingDevice);
        let audioRecordingDevices = this.getAudioRecordingDevices() || [];
        if (audioRecordingDevices.length === 0) {
            console.log("no audio found");
        }
        else {
            let defaultDev = audioRecordingDevices.find((item) => item.isSystemDefault);
            audioRecordingDevices.splice(0, 0, {
                devicename: defaultDev
                    ? `默认设备(${defaultDev.devicename})`
                    : "默认设备",
                deviceid: "default",
                defaultDevId: defaultDev?.deviceid,
            });
        }
        console.log("audioDevices", JSON.stringify(audioRecordingDevices));
        let audioDevices = {
            currentAudioDevice: currentAudioRecordingDevice,
            audioDevices: audioRecordingDevices,
        };
        return audioDevices;
    }
    setAudioDevices(audioDeviceId, fromUser = true) {
        if (!audioDeviceId) {
            return false;
        }
        let setResult = AVDeviceHelper_1.devUseRecords.audioDev.useDev(audioDeviceId);
        console.log("设置麦克风deviceId=" + audioDeviceId, "状态" + setResult, "是否手动设置：" + fromUser);
        return setResult === 0;
    }
    async startAudio() {
        let microphoneAccessStatus = await RendererHelper.getMediaAccessStatus("microphone");
        if (microphoneAccessStatus == "denied") {
            RendererHelper.emit("rtcError", {
                errCode: "audio_input_no_authority",
                rtcErrorCode: -1,
                msg: "未获取到麦克风权限",
                sdkType: this.sdkType,
            });
            return;
        }
        let audioDev = this.rtcSdk.getCurrentAudioRecordingDevice();
        console.log("audioDev", audioDev);
        let devices = this.getAudioRecordingDevices();
        if (devices.length === 0) {
            console.log("no audio found");
            return;
        }
        console.log("audioDevices", devices);
        if (this.clientRole == 2) {
            this.clientRole = 1;
            this.rtcSdk.setClientRole(this.clientRole);
        }
        this.audioStatus = 1;
        let localAudioCode = this.rtcSdk.muteLocalAudioStream(false);
        console.info("AudioVideoScreenRTC开始发送本地音频流", localAudioCode);
        if (localAudioCode === 0) {
            let messageTemp = {
                cmd: "openAudio",
            };
            RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
            RendererHelper.sendToOtherWindow("rtcOpenAudio", WinId_1.default.speechRecognitionUUID);
            this.RtcMediaUtil.myAudioStatusChange(1);
            let jsonMessage = { mediaOperate: { op: 1, type: "audio" } };
            if (this.RtMUtil && this.sdkType == 0) {
                this.RtMUtil.sendChannelMessage({ text: JSON.stringify(jsonMessage) });
            }
        }
    }
    stopAudio() {
        if (this.audioStatus == 0) {
            this.rtcSdk.muteLocalAudioStream(true);
            this.RtcMediaUtil.myAudioStatusChange(0);
            return;
        }
        this.audioStatus = 0;
        if (this.clientRole == 1) {
            if (this.MeetLive.liveStatus != 1) {
                this.changeClientRole();
            }
        }
        let localAudioCode = this.rtcSdk.muteLocalAudioStream(true);
        console.info("AudioVideoScreenRTC停止发送本地音频流", localAudioCode);
        if (localAudioCode === 0) {
            let messageTemp = {
                cmd: "closeAudio",
            };
            RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
            RendererHelper.sendToOtherWindow("stopRecognition", WinId_1.default.speechRecognitionUUID);
            this.RtcMediaUtil.myAudioStatusChange(0);
            let jsonMessage = { mediaOperate: { op: 0, type: "audio" } };
            if (this.RtMUtil && this.sdkType == 0) {
                this.RtMUtil.sendChannelMessage({ text: JSON.stringify(jsonMessage) });
            }
        }
    }
    startLoopbackRecording() {
        if (process.platform === "darwin") {
            MainWindowHelper_1.default.checkAldDriver(this.sdkType).then((state) => {
                if (state === 1) {
                    this.loopbackStatus = 1;
                    let enableCode = this.rtcSdk.enableLoopbackRecording(true);
                    console.info("开始采集声卡", enableCode);
                    this.changeClientRole();
                }
            });
        }
        else {
            this.loopbackStatus = 1;
            let enableCode = this.rtcSdk.enableLoopbackRecording(true);
            console.info("开始采集声卡", enableCode);
            this.changeClientRole();
        }
    }
    stopLoopbackRecording() {
        if (process.platform === "darwin") {
            MainWindowHelper_1.default.checkAldDriver(this.sdkType).then((state) => {
                if (state === 1) {
                    this.loopbackStatus = 0;
                    let enableCode = this.rtcSdk.enableLoopbackRecording(false);
                    console.info("停止采集声卡", enableCode);
                    this.changeClientRole();
                }
            });
        }
        else {
            this.loopbackStatus = 0;
            let enableCode = this.rtcSdk.enableLoopbackRecording(false);
            console.info("停止采集声卡", enableCode);
            this.changeClientRole();
        }
    }
    getLoopbackStatus() {
        return this.loopbackStatus;
    }
    changeClientRole() {
        if (this.videoStatus == 0 && this.audioStatus == 0) {
            if (this.clientRole == 1) {
                if (this.MeetLive.liveStatus != 1) {
                    this.clientRole = 2;
                    this.rtcSdk.setClientRole(this.clientRole);
                }
            }
        }
        else {
            if (this.clientRole == 2) {
                this.clientRole = 1;
                this.rtcSdk.setClientRole(this.clientRole);
            }
        }
    }
    getVideoDevices() {
        let currentVideoDevice = this.rtcSdk.getCurrentVideoDevice();
        console.log("currentVideoDevice", currentVideoDevice);
        let videoDevices = this.rtcSdk.getVideoDevices();
        if (videoDevices.length === 0) {
            console.log("no video found");
        }
        else {
            if (!this.isDevInList(currentVideoDevice, videoDevices)) {
                if (videoDevices.length > 0) {
                    this.setVideoDevices(videoDevices[0].deviceid);
                }
            }
        }
        console.log("videoDevices", JSON.stringify(videoDevices));
        let videoDevicesObj = {
            currentVideoDevice: currentVideoDevice,
            videoDevices: videoDevices,
        };
        return videoDevicesObj;
    }
    setVideoDevices(videoDeviceId) {
        if (!videoDeviceId) {
            return false;
        }
        let setVideoDevice = this.rtcSdk.setVideoDevice(videoDeviceId);
        if (this.sdkType == 1 && this.m_IsOpenPreview) {
            setTimeout(() => {
                this.closePreview();
            }, 100);
            setTimeout(() => {
                this.openPreview();
            }, 200);
        }
        console.log("设置摄像头deviceId=" + videoDeviceId, "状态" + setVideoDevice);
        if (setVideoDevice == 0) {
            AVDeviceHelper_1.devUseRecords.videoDev.pushDev(videoDeviceId);
            webStorageUtil.addStorageData(`RtcVideoDevice_${this.sdkType}`, videoDeviceId);
            return true;
        }
        return false;
    }
    async startVideo() {
        let cameraeAccessStatus = await RendererHelper.getMediaAccessStatus("camera");
        if (cameraeAccessStatus == "denied") {
            RendererHelper.emit("rtcError", {
                errCode: "video_input_no_authority",
                rtcErrorCode: -1,
                msg: "未获取到摄像头权限",
                sdkType: this.sdkType,
            });
            return;
        }
        let videoDev = this.rtcSdk.getCurrentVideoDevice();
        console.log("videoDev", videoDev);
        let devices = this.rtcSdk.getVideoDevices();
        if (devices.length === 0) {
            console.info("no video found");
            return;
        }
        console.log("videoDevices", devices);
        RendererHelper.emit("refreshMeetingVariable");
        if (this.Meeting.videoConfig) {
            this.videoConfig = this.Meeting.videoConfig;
        }
        if (this.Meeting.meet_setting_video) {
            this.setLocalVideoMirrorMode(this.Meeting.meet_setting_video.mirrorMode);
            if (this.Meeting.meet_setting_video.virtualBackground) {
                if (this.m_beautyEffectSupported) {
                    this.enableVirtualBackground(true, this.Meeting.meet_setting_video.virtualBackground, 0).then((code) => {
                        if (code == -4) {
                            this.m_beautyEffectSupported = false;
                            RendererHelper.emit("beautyEffectNotSupported");
                        }
                    });
                }
                else {
                    RendererHelper.emit("beautyEffectNotSupported");
                }
            }
            else {
                this.enableVirtualBackground(false, "", 0);
            }
            if (this.Meeting.meet_setting_video.beautyEffectOptions) {
                if (this.m_beautyEffectSupported) {
                    let operRet = this.setBeautyEffectOptions(this.Meeting.meet_setting_video.beautyEffectOptions.enabled, this.Meeting.meet_setting_video.beautyEffectOptions);
                    if (operRet == -4) {
                        this.m_beautyEffectSupported = false;
                        RendererHelper.emit("beautyEffectNotSupported");
                    }
                }
                else if (this.Meeting.meet_setting_video.beautyEffectOptions.enabled) {
                    RendererHelper.emit("beautyEffectNotSupported");
                }
            }
        }
        console.log("videoConfig=", this.videoConfig);
        let videoConfigCode = this.rtcSdk.setVideoEncoderConfiguration(this.videoConfig);
        console.log("AudioVideoScreenRTC设置videoConfig", videoConfigCode);
        if (this.clientRole == 2) {
            this.clientRole = 1;
            this.rtcSdk.setClientRole(this.clientRole);
            if (this.audioStatus == 0) {
                let localAudioCode = this.rtcSdk.muteLocalAudioStream(true);
                console.info("startVideo AudioVideoScreenRTC停止发送本地音频流", localAudioCode);
            }
            else {
                let localAudioCode = this.rtcSdk.muteLocalAudioStream(false);
                console.info("startVideo AudioVideoScreenRTC开始发送本地音频流", localAudioCode);
            }
        }
        this.setupLocalVideo(this.Meeting.login_puid);
        this.videoStatus = 1;
        let localVideoCode = this.rtcSdk.enableLocalVideo(true);
        this.m_IsOpenPreview = false;
        console.info("AudioVideoScreenRTC开始本地视频采集", localVideoCode);
        if (localVideoCode === 0) {
            let messageTemp = {
                cmd: "openVideo",
            };
            RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
            RendererHelper.sendToOtherWindow("videoOper", undefined, { op: "open" });
            this.RtcMediaUtil.myVideoStatusChange(1);
            let jsonMessage = { mediaOperate: { op: 1, type: "video" } };
            if (this.RtMUtil && this.sdkType == 0) {
                this.RtMUtil.sendChannelMessage({ text: JSON.stringify(jsonMessage) });
            }
        }
    }
    stopVideo() {
        if (this.videoStatus == 0) {
            this.RtcMediaUtil.myVideoStatusChange(0);
            return;
        }
        if (this.clientRole == 1) {
            if (this.MeetLive.liveStatus != 1) {
                if (this.audioStatus == 0 && this.screenStatus == 0) {
                    this.clientRole = 2;
                    this.rtcSdk.setClientRole(this.clientRole);
                }
            }
        }
        this.videoStatus = 0;
        let localVideoCode = this.rtcSdk.enableLocalVideo(false);
        console.info("AudioVideoScreenRTC停止本地视频采集", localVideoCode);
        if (localVideoCode === 0) {
            let messageTemp = {
                cmd: "closeVideo",
            };
            RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
            RendererHelper.sendToOtherWindow("videoOper", undefined, { op: "close" });
            this.RtcMediaUtil.myVideoStatusChange(0);
            let jsonMessage = { mediaOperate: { op: 0, type: "video" } };
            if (this.RtMUtil && this.sdkType == 0) {
                this.RtMUtil.sendChannelMessage({ text: JSON.stringify(jsonMessage) });
            }
            this.closeVideoBox(true);
        }
    }
    updateVideoParams(params) {
        if (!params || JSON.stringify(params) === "{}") {
            console.log("更新视屏参数不正确", params);
            return;
        }
        if (this.clientRole != 1) {
            console.log("更新视屏参数失败,非主播身份", params);
            return;
        }
        if (this.videoStatus != 1) {
            console.log("更新视屏参数失败,未视屏", params);
            return;
        }
        this.videoConfig = params;
        let videoConfigCode = this.rtcSdk.setVideoEncoderConfiguration(this.videoConfig);
        console.log("更新视屏参数", videoConfigCode);
    }
    openVideoBox(uid, init) {
        if (typeof uid == "undefined" || typeof init == "undefined") {
            return;
        }
        if (this.openPIP2 && uid == this.userId) {
            return;
        }
        this.videoBoxUid = uid;
        const MIN_WIDTH = 800;
        const MIN_HEIGHT = 600;
        this.videoDataEvent.removeAllListeners("screenshotVideoData");
        if (this.sdkType == 1) {
            let frameData = this.rtcSdk.getVideoFrame({ uid, videoSourceType: 0 });
            if (frameData) {
                let width = frameData.width;
                let height = frameData.height;
                if (width < MIN_WIDTH) {
                    width = MIN_WIDTH;
                }
                if (height < MIN_HEIGHT) {
                    height = MIN_HEIGHT;
                }
                let messageTemp = {
                    cmd: "openVideoBox",
                    uid: this.videoBoxUid == this.userId ? 0 : this.videoBoxUid,
                    width: width,
                    height: height,
                };
                RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
            }
        }
        else {
            if (this.videoBoxUid == this.userId) {
                uid = 0;
            }
            let videoFrame = VideoRowDataUtil.resizeShareVideoFrame(undefined, this.mainChannel, uid);
            let data = this.rtcSdk.getVideoFrame(videoFrame);
            if (data && data.ret === 0) {
                let width = data.width;
                let height = data.height;
                if (width < MIN_WIDTH) {
                    width = MIN_WIDTH;
                }
                if (height < MIN_HEIGHT) {
                    height = MIN_HEIGHT;
                }
                let messageTemp = {
                    cmd: "openVideoBox",
                    uid: this.videoBoxUid == this.userId ? 0 : this.videoBoxUid,
                    width: width,
                    height: height,
                };
                RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
            }
        }
    }
    closeVideoBox(checkMe) {
        if (checkMe && this.videoBoxUid != this.userId) {
            return;
        }
        let messageTemp = {
            cmd: "openVideoBox",
            uid: this.videoBoxUid == this.userId ? 0 : this.videoBoxUid,
            close: true,
        };
        RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
    }
    renewAudioVideoToken() {
        this.mainVideoToken = this.Meeting.rtc_video_token;
        if (this.hasMinor) {
            let renewAudioVideoTokenCode = this.rtcSdk.renewAssistChannelToken(this.minorChannel, this.mainVideoToken);
            console.log("AssistChannelRTC更新音视频token", renewAudioVideoTokenCode);
            return;
        }
        let renewAudioVideoTokenCode = this.rtcSdk.renewToken(this.mainVideoToken);
        console.log("AudioVideoScreenRTC更新音视频token", renewAudioVideoTokenCode);
    }
    startScreen() {
        return this.rtcSdk.getScreenWindowsInfo().then((displays) => {
            if (!displays.displaysInfo || displays.displaysInfo.length === 0) {
                console.log("no display found");
                return;
            }
            console.log(displays.displaysInfo);
            return this.startScreenByChose("1", displays.displaysInfo[0]);
        });
    }
    startScreenShare(type, info) {
        console.log(`开始共享：startScreenShare：type:${type},info:${JSON.stringify(info)}`);
        this.screenType = type + "";
        this.screenInfo = info;
        let screenConfigTemp = JSON.parse(JSON.stringify(this.screenConfig));
        let userIdTemp = parseInt(this.Meeting.getScreenPuid(this.Meeting.login_puid));
        if (this.screenType == "1" &&
            !this.share_all_window_in_screen &&
            this.windowIdArray &&
            this.windowIdArray.length > 0) {
            screenConfigTemp.excludeWindowList = this.windowIdArray;
        }
        let startScreenResult;
        if (this.screenType == "1") {
            startScreenResult = this.rtcSdk.startScreenShare(1, this.screenInfo.displayId, this.mainScreenToken, userIdTemp, screenConfigTemp);
        }
        else if (this.screenType == "2") {
            startScreenResult = this.rtcSdk.startScreenShare(2, this.screenInfo.windowId, this.mainScreenToken, userIdTemp, screenConfigTemp);
        }
        return startScreenResult.then((value) => {
            if (this.screenType == "1") {
                if (value != 0) {
                    console.error("开始共享屏幕失败", value);
                    throw new Error("-4");
                }
                else {
                    console.info("开始共享屏幕", value);
                }
            }
            else {
                if (value != 0) {
                    console.error("开始共享窗口失败", value);
                    throw new Error("-4");
                }
                else {
                    console.info("开始共享窗口", value);
                }
            }
            this.screenStatus = 1;
            if (this.sharePcAudio) {
                this.startLoopbackRecording();
            }
        });
    }
    startScreenWithUrl(pageUrl, type, winInfo) {
        if (winInfo && type) {
            return this.startScreenByChose(type, winInfo, {
                pageUrl,
            });
        }
        else {
            return this.rtcSdk.getScreenWindowsInfo().then((displays) => {
                if (!displays.displaysInfo || displays.displaysInfo.length === 0) {
                    console.log("no display found");
                    return;
                }
                console.log(displays.displaysInfo);
                return this.startScreenByChose("1", displays.displaysInfo[0], {
                    pageUrl,
                });
            });
        }
    }
    startChoseScreen(reChose = false) {
        this.getScreenWindowsInfo().then((captureSource) => {
            if (!captureSource.displaysInfo ||
                captureSource.displaysInfo.length === 0) {
                console.log("no display found");
            }
            let messageTemp = {
                cmd: "choseScreen",
                hasVideoDev: this.hasVideoDev() || false,
                language: (this.m_language || "language") + "",
                displays: captureSource.displaysInfo,
                winplays: captureSource.windowsInfo,
                reChose: reChose,
            };
            RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
        });
    }
    openChoseScreenWindow(reChose = false) {
        this.rtcSdk.getScreenWindowsInfo().then((captureSource) => {
            if (!captureSource.displaysInfo ||
                captureSource.displaysInfo.length === 0) {
                console.log("no display found");
            }
            let messageTemp = {
                cmd: "choseScreen",
                hasVideoDev: this.hasVideoDev() || false,
                language: (this.m_language || "language") + "",
                displays: captureSource.displaysInfo,
                winplays: captureSource.windowsInfo,
                openType: 1,
                reChose: reChose,
            };
            RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
        });
    }
    getChoseScreenData() {
        this.rtcSdk.getScreenWindowsInfo().then((captureSource) => {
            if (!captureSource.displaysInfo ||
                captureSource.displaysInfo.length === 0) {
                console.log("no display found");
            }
            let messageTemp = {
                cmd: "choseScreenData",
                displays: captureSource.displaysInfo,
                winplays: captureSource.windowsInfo,
            };
            RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
        });
    }
    changePip(openPIP) {
        let messageTemp;
        if (openPIP) {
            if (this.videoStatus != 1) {
                RendererHelper.confirm("开启画中画需要开启视频", {
                    title: "  ",
                    backgroundColor: "white",
                    okBtn: "开启视频",
                    cancelBtn: "暂不开启",
                    okClick: () => {
                        this.startVideo();
                        let messageTemp2 = {
                            cmd: "openPIPVideoBox",
                            close: false,
                            videoDevices: this.getVideoDevices(),
                        };
                        this.closeVideoBox(true);
                        this.openPIP2 = openPIP;
                        RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp2);
                        RendererHelper.emit("onPipStateChanged", { value: 1 });
                    },
                    winConfig: { id: "openPip_Video" },
                });
                return;
            }
            else {
                messageTemp = {
                    cmd: "openPIPVideoBox",
                    close: false,
                    videoDevices: this.getVideoDevices(),
                };
                this.closeVideoBox(true);
            }
        }
        else {
            messageTemp = {
                cmd: "openPIPVideoBox",
                close: true,
            };
        }
        this.openPIP2 = openPIP;
        RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
        RendererHelper.emit("onPipStateChanged", { value: this.openPIP2 ? 1 : 0 });
    }
    changeScreenByChose(type, info, openPIP) {
        this.screenType = type;
        this.screenInfo = info;
        let screenConfigTemp = JSON.parse(JSON.stringify(this.screenConfig));
        if (this.screenType == "1" &&
            !this.share_all_window_in_screen &&
            this.windowIdArray &&
            this.windowIdArray.length > 0) {
            screenConfigTemp.excludeWindowList = this.windowIdArray;
        }
        if (this.screenType == "1") {
            let screenCode = this.rtcSdk.reChooseShareScreen(1, this.screenInfo.displayId, screenConfigTemp);
            if (screenCode != 0) {
                console.error("重新共享屏幕失败", screenCode);
                RendererHelper.emit("rtcError", {
                    errCode: "reshareScreenError",
                    rtcErrorCode: screenCode,
                    msg: "重新共享屏幕失败",
                    sdkType: this.sdkType,
                });
                return;
            }
            else {
                console.info("重新共享屏幕", screenCode);
                (0, RendererHelper_1.sendToMainProcess)("_startScreenShare", this.screenType, this.screenInfo);
                RendererHelper.emit("restartScreenShare", {
                    screenType: this.screenType,
                    screenInfo: this.screenInfo,
                });
            }
        }
        else if (this.screenType == "2") {
            let screenCode = this.rtcSdk.reChooseShareScreen(2, this.screenInfo.windowId, screenConfigTemp);
            if (screenCode != 0) {
                console.error("重新共享窗口失败", screenCode);
                RendererHelper.emit("rtcError", {
                    errCode: "reshareWindowError",
                    rtcErrorCode: screenCode,
                    msg: "重新共享窗口失败",
                    sdkType: this.sdkType,
                });
                return;
            }
            else {
                console.info("重新共享窗口", screenCode);
                (0, RendererHelper_1.sendToMainProcess)("_startScreenShare", this.screenType, this.screenInfo);
                RendererHelper.emit("restartScreenShare", {
                    screenType: this.screenType,
                    screenInfo: this.screenInfo,
                });
            }
        }
        if (this.openPIP2 != openPIP) {
            this.changePip(openPIP);
        }
        let msgTmp = {
            cmd: "reChooseScreen",
            screenType: this.screenType,
            screenInfo: this.screenInfo,
        };
        RendererHelper.sendToMainProcess(this.screenToolsChannel, msgTmp);
    }
    startScreenByChose(type, info, parms) {
        console.log("RtcAudioVideoSceen:startScreenByChose:type:", type);
        if (this.RtcMediaUtil?.returnWhetherSharing &&
            !this.RtcMediaUtil.returnWhetherSharing()) {
            console.log("RtcAudioVideoSceen:returnWhetherSharing:不允许共享", false);
            RendererHelper.closeWindow("choseScreen");
            return;
        }
        let curTime = new Date().getTime();
        if (curTime - this.m_startScreenTime < 5000) {
            return;
        }
        let openPIP = parms?.openPIP;
        let reshareAfterLogout = parms?.reshareAfterLogout;
        this.m_startScreenTime = curTime;
        let thatSelf = this;
        let pms = new Promise((resolve, reject) => {
            let callback = function (code, code2) {
                if (code === 0) {
                    resolve(0);
                    RendererHelper.emit("ketang_share_screen_state", 0);
                }
                else {
                    thatSelf.screenStatus = 1;
                    thatSelf.openPIP = false;
                    thatSelf.screenType = "";
                    thatSelf.screenInfo = "";
                    let messageTemp = {
                        cmd: "closeChoseScreen",
                    };
                    RendererHelper.sendToMainProcess(thatSelf.screenToolsChannel, messageTemp);
                    resolve(code);
                    let showText;
                    if (code == -3) {
                        showText = "共享窗口加载失败，请重试[-3]";
                    }
                    else if (code2 == -5) {
                        showText = "共享屏幕失败，请检查网络连接或切换网络重试[-5]";
                    }
                    else if (code == -4) {
                        showText = "初始化进程失败，请重试[-4]";
                    }
                    else {
                        showText = `共享屏幕失败![${code}${code2 ? ":" + code2 : ""}]`;
                    }
                    RendererHelper.alert(showText, { okBtn: "知道了" });
                    RendererHelper.emit("ketang_share_screen_state", code);
                }
            };
            if (typeof type == "undefined" || typeof info == "undefined") {
                console.log("startScreenByChose失败，请检查参数是否正确");
                callback(-2, undefined);
                return;
            }
            if (type == "1") {
                let infoKeyTemp = info.displayId.x +
                    "_" +
                    info.displayId.y +
                    "_" +
                    info.displayId.width +
                    "_" +
                    info.displayId.height;
                this.getScreenWindowsInfo().then((captureSource) => {
                    let displays = captureSource.displaysInfo;
                    if (!displays || displays.length === 0) {
                        console.log("no display found");
                        this.getChoseScreenData();
                        callback(-3, undefined);
                        return;
                    }
                    let checkTemp = false;
                    for (let i = 0; i < displays.length; i++) {
                        let displayKeyTemp = displays[i].displayId.x +
                            "_" +
                            displays[i].displayId.y +
                            "_" +
                            displays[i].displayId.width +
                            "_" +
                            displays[i].displayId.height;
                        if (displayKeyTemp == infoKeyTemp) {
                            checkTemp = true;
                            break;
                        }
                    }
                    if (!checkTemp) {
                        this.getChoseScreenData();
                        callback(-3, undefined);
                        return;
                    }
                    else {
                        RendererHelper.isMultiscreen().then((isMultiscreen) => {
                            this.multiscreen = isMultiscreen;
                            this.startScreenByChoseAfterCheck(type, info, parms, callback);
                        });
                    }
                });
            }
            else if (type == "2") {
                this.rtcSdk.getScreenWindowsInfo().then((captureSource) => {
                    let winplays = captureSource.windowsInfo;
                    if (!winplays || winplays.length === 0) {
                        console.log("no winplays found");
                        this.getChoseScreenData();
                        callback(-3, undefined);
                        return;
                    }
                    let checkTemp = false;
                    for (let i = 0; i < winplays.length; i++) {
                        if (winplays[i].windowId == info.windowId) {
                            checkTemp = true;
                            break;
                        }
                    }
                    if (!checkTemp) {
                        this.getChoseScreenData();
                        callback(-3, undefined);
                        return;
                    }
                    else {
                        RendererHelper.isMultiscreen().then((isMultiscreen) => {
                            this.multiscreen = isMultiscreen;
                            this.startScreenByChoseAfterCheck(type, info, parms, callback);
                        });
                    }
                });
            }
        });
        return pms;
    }
    startScreenByChoseAfterCheck(type, info, params, callback) {
        let openPIP = params?.openPIP;
        let reshareAfterLogout = params?.reshareAfterLogout;
        if (this.screenInfo && this.screenInfo !== "" && !reshareAfterLogout) {
            this.changeScreenByChose(type, info, openPIP);
            return;
        }
        this.screenStatus = 1;
        this.openPIP2 = false;
        this.screenType = type;
        this.screenInfo = info;
        if (this.Meeting.screenConfig) {
            this.screenConfig = this.Meeting.screenConfig;
        }
        console.log("screenConfig=", this.screenConfig);
        let screenConfigTemp = JSON.parse(JSON.stringify(this.screenConfig));
        if (this.screenType == "1" &&
            !this.share_all_window_in_screen &&
            this.windowIdArray &&
            this.windowIdArray.length > 0) {
            screenConfigTemp.excludeWindowList = this.windowIdArray;
        }
        let userIdTemp = parseInt(this.Meeting.getScreenPuid(this.Meeting.login_puid));
        let startScreenResult;
        if (this.screenType == "1") {
            startScreenResult = this.rtcSdk.startScreenShare(1, this.screenInfo.displayId, this.mainScreenToken, userIdTemp, screenConfigTemp);
        }
        else if (this.screenType == "2") {
            startScreenResult = this.rtcSdk.startScreenShare(2, this.screenInfo.windowId, this.mainScreenToken, userIdTemp, screenConfigTemp);
        }
        startScreenResult
            .then((value) => {
            if (this.screenType == "1") {
                if (value != 0) {
                    console.error("开始共享屏幕失败", value);
                    callback(-4, value);
                    return;
                }
                else {
                    console.info("开始共享屏幕", value);
                    callback(0, 0);
                    setTimeout(() => {
                        if (typeof openPIP !== "undefined" && openPIP) {
                            this.changePip(openPIP);
                        }
                    }, 500);
                }
            }
            else {
                if (value != 0) {
                    console.error("开始共享窗口失败", value);
                    callback(-4, value);
                    return;
                }
                else {
                    callback(0, 0);
                    console.info("开始共享窗口", value);
                }
            }
            if (this.sharePcAudio) {
                this.startLoopbackRecording();
            }
            if (!reshareAfterLogout) {
                if (!this.disable_screen_share_tools_window) {
                    this.RtcScreenUtil.startShareScreenForChoseByElectron();
                    let winHeightTemp = this.screenInfo.height;
                    let winWidthTemp = this.screenInfo.width;
                    let messageTemp = {
                        cmd: "startScreen",
                        type: this.screenType,
                        info: this.screenInfo,
                        useLocalTools: this.Meeting.useLocalTools || 1,
                        leader: this.Meeting.leader || 0,
                        language: (this.m_language || "language") + "",
                        qrcode: this.Meeting.meet_qrcode || "",
                        qrcodeUrl: this.Meeting.meet_qrcode_url || "",
                        qrcodeTips: this.Meeting.meet_qrcode_tips || "",
                        videoValueChange: this.Meeting.videoConfigChange || "",
                        curVideoValue: this.Meeting.videoConfig.webProfile || "180p_1",
                        screenValueChange: this.Meeting.screenConfigChange || "",
                        curScreenValue: this.Meeting.screenConfig.webProfile || "720p_1",
                        hasAudioDev: this.hasAudioDev(),
                        hasVideoDev: this.hasVideoDev(),
                        audioSetStatus: this.audioStatus || 0,
                        videoSetStatus: this.videoStatus || 0,
                        recordSetStatus: this.Meeting.recordStatus || 0,
                        liveSetStatus: this.MeetLive.liveStatus || 0,
                        isPublic: this.formatWebValue(this.Meeting.isPublic, "1"),
                        isAllowToLeave: this.formatWebValue(this.Meeting.meetSetConfig.isAllowToLeave, "1"),
                        isAllowUnmuteSelf: this.formatWebValue(this.Meeting.meetSetConfig.isAllowUnmuteSelf, "1"),
                        isLockMeet: this.Meeting.meetSetConfig.isLockMeet || "0",
                        meetTime: this.Meeting.meetTime || new Date().getTime(),
                        membersNumber: this.Meeting.onlineMemberCount || 0,
                        chatNumber: this.Meeting.unreadMsgCount || 0,
                        shareWindowWidth: this.RtcScreenUtil.getVariable("shareWindowWidth") || 300,
                        shareWindowHeight: this.RtcScreenUtil.getVariable("shareWindowHeight") || 640,
                        width: winWidthTemp,
                        height: winHeightTemp,
                        openPIP: this.openPIP2,
                        userName: this.userName,
                        meetTitle: this.Meeting.meet_title,
                        showActivitiesState: this.Meeting.showActivitiesState || 0,
                        pageUrl: params.pageUrl,
                    };
                    RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
                }
                else {
                    let messageTemp = {
                        cmd: "closeChoseScreen",
                    };
                    RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
                }
                if (!reshareAfterLogout) {
                    if (!this.disable_screen_share_tools_window && !this.multiscreen) {
                        this.RtcScreenUtil.changeWindowShareStyle(1);
                    }
                    this.RtcScreenUtil.myScreenStatusChange(1, this.multiscreen);
                }
                callback(0, undefined);
            }
        })
            .catch((err) => {
            console.error("共享屏幕、窗口失败", err);
            callback(-4, undefined);
            throw new Error(err);
        });
    }
    reShareScreen() {
        console.log("RtcAudioVideoSceen:reShareScreen");
        if (this.screenInfo) {
            this.stopScreen(true);
            setTimeout(() => {
                this.startScreenByChose(this.screenType, this.screenInfo, {
                    openPIP: this.openPIP2,
                    reshareAfterLogout: true,
                });
            }, 500);
        }
    }
    stopScreen(reshareAfterLogout = false) {
        console.log("RtcAudioVideoSceen:stopScreen:reshareAfterLogout:", reshareAfterLogout);
        if (!reshareAfterLogout) {
            this.screenType = "";
            this.screenInfo = "";
        }
        if (this.screenStatus == 0) {
            return;
        }
        if (this.clientRole == 1) {
            if (this.MeetLive.liveStatus != 1) {
                if (this.audioStatus == 0 && this.videoStatus == 0) {
                    this.clientRole = 2;
                    this.rtcSdk.setClientRole(this.clientRole);
                }
            }
        }
        this.screenStatus = 0;
        this.stopLoopbackRecording();
        let rcode = this.rtcSdk.stopScreenShare();
        if (!reshareAfterLogout) {
            if (this.openPIP2) {
                this.changePip(false);
            }
            if (appConfig.appMode != "fanya") {
                let messageTemp = {
                    cmd: "stopScreen",
                };
                RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
            }
            this.RtcScreenUtil.changeWindowShareStyle(0, this.multiscreen);
            this.RtcScreenUtil.myScreenStatusChange(0, this.multiscreen);
            this.m_lastScreenConfigStr = "";
        }
        return rcode;
    }
    createScreenDom(uid) {
        if (uid == this.userId) {
            return;
        }
        if (document.querySelectorAll("#screen_" + uid).length === 0) {
            var doc = document.createElement("div");
            doc.innerHTML = '<div class="shareScreen" id="screen_' + uid + '"></div>';
            document.querySelector(".videoDiv").appendChild(doc.firstChild);
        }
        let remoteVideoContainer = document.getElementById("screen_" + uid);
        if (remoteVideoContainer) {
            try {
                if (this.rtcSdk) {
                    this.rtcSdk.subscribe(uid, undefined);
                    let domRemoteVideoCode = this.rtcSdk.subscribe(uid, remoteVideoContainer, {}, true);
                    console.info("AudioVideoScreenRTC设置远端投屏渲染位置", domRemoteVideoCode);
                    this.rtcSdk.setupViewContentMode(uid, 2, 1, undefined);
                }
            }
            catch (e) {
                console.warn("rtc subscribe video error:", e);
            }
        }
        else {
            console.warn("rtc subscribe video error: view is null");
        }
    }
    createAssistScreenDom(uid) {
        if (uid == this.userId) {
            return;
        }
        if (document.querySelectorAll("#screen_" + uid).length === 0) {
            let div = document.createElement("div");
            div.id = `screen_${uid}`;
            div?.classList.add("shareScreen");
            document.querySelector(".groupSharing").appendChild(div);
        }
        let remoteVideoContainer = document.getElementById("screen_" + uid);
        if (remoteVideoContainer) {
            let domRemoteVideoCode = this.rtcSdk.setupRemoteVideo(uid, remoteVideoContainer, this.minorChannel, null, true);
            console.info("AssistChannelRTC设置远端投屏渲染位置", domRemoteVideoCode);
            this.rtcSdk.setupViewContentMode(uid, 2, 1, undefined);
        }
    }
    createVideoRenderDom(uid) {
        if (document.querySelectorAll("#camera_" + uid).length === 0) {
            let div = document.createElement("div");
            div.id = `camera_${uid}`;
            div?.classList.add("cameraVideo");
            document
                .querySelector("#video_user_" + uid + " .videoRenderArea")
                .appendChild(div);
        }
        let remoteVideoContainer = document.getElementById("camera_" + uid);
        if (remoteVideoContainer) {
            let domRemoteVideoCode = this.subscribe(uid, remoteVideoContainer, {}, false);
            console.info("AudioVideoScreenRTC设置远端视频渲染位置", domRemoteVideoCode);
            this.RtcMediaUtil.onEnableVideo({ uid: uid });
        }
    }
    createLocalVideoRenderDom(uid, isOpen) {
        this.setupLocalVideo(uid);
        let localVideoContainer = document.getElementById("camera_" + uid);
        if (localVideoContainer) {
            if (isOpen) {
                this.RtcMediaUtil.myVideoStatusChange(1);
            }
            else {
                this.RtcMediaUtil.myVideoStatusChange(0);
            }
        }
    }
    setupLocalVideo(uid) {
        if (document.querySelectorAll("#camera_" + uid).length === 0) {
            let div = document.createElement("div");
            div.id = `camera_${uid}`;
            div?.classList.add("cameraVideo");
            document
                .querySelector("#video_user_" + uid + " .videoRenderArea")
                ?.appendChild(div);
        }
        let localVideoContainer = document.getElementById("camera_" + uid);
        if (localVideoContainer) {
            let domLocalVideoCode = this.rtcSdk.setupLocalVideo(localVideoContainer);
            this.rtcSdk.setupViewContentMode(uid, 0, 1, "");
            console.info("AudioVideoScreenRTC设置本地视频渲染位置:setupLocalVideo", domLocalVideoCode);
        }
        this.changeMirrorMode();
    }
    changeMirrorMode() {
        let localVideoView = document.querySelectorAll("#video_user_" + this.Meeting.login_puid + " .videoRenderArea");
        if (localVideoView.length > 0) {
            if (this.localMirrorMode) {
                localVideoView[0]?.classList.remove("rotateY0");
                localVideoView[0]?.classList.add("rotateY180");
            }
            else {
                localVideoView[0]?.classList.remove("rotateY180");
                localVideoView[0]?.classList.add("rotateY0");
            }
        }
    }
    muteRemoteVideo(uid, mute) {
        let muteRemoteVideoCode = this.rtcSdk?.muteRemoteVideoStream(uid, mute);
        if (mute) {
            this.destroyRendererByConfig(agora_electron_sdk_1.VideoSourceType.VideoSourceRemote, this.mainChannel, uid);
        }
        return muteRemoteVideoCode;
    }
    updateScreenParams(params) {
        if (!this.updateScreenParamsFun) {
            this.updateScreenParamsFun = (0, DebounceUtil_1.debounce)((params) => {
                if (!params || JSON.stringify(params) === "{}") {
                    console.info("更新投屏参数不正确", params);
                    return;
                }
                if (this.screenStatus != 1) {
                    return;
                }
                this.screenConfig = params;
                let screenConfigTemp = JSON.parse(JSON.stringify(this.screenConfig));
                if (this.screenType == "1" &&
                    !this.share_all_window_in_screen &&
                    this.windowIdArray &&
                    this.windowIdArray.length > 0) {
                    screenConfigTemp.excludeWindowList = this.windowIdArray;
                    screenConfigTemp.excludeWindowCount = this.windowIdArray.length;
                }
                if (screenConfigTemp.width && screenConfigTemp.height) {
                    screenConfigTemp.dimensions = {
                        width: screenConfigTemp.width,
                        height: screenConfigTemp.height,
                    };
                }
                let screenConfigStr = JSON.stringify(screenConfigTemp);
                if (this.m_lastScreenConfigStr != screenConfigStr ||
                    screenConfigTemp.excludeWindowList) {
                    let updateScreenCode = this.rtcSdk.videoSourceUpdateScreenCaptureParameters(screenConfigTemp);
                    this.m_lastScreenConfigStr = screenConfigStr;
                    console.info("更新投屏参数:videoSourceUpdateScreenCaptureParameters", updateScreenCode);
                }
            }, 10);
        }
        this.updateScreenParamsFun(params);
    }
    renewScreenToken() {
        if (this.hasMinor) {
            return;
        }
        this.mainScreenToken = this.Meeting.rtc_screen_token;
        let renewScreenTokenCode = this.rtcSdk.videoSourceRenewToken(this.mainScreenToken);
        console.info("AudioVideoScreenRTC更新投屏token:videoSourceRenewToken", renewScreenTokenCode);
    }
    renewAssistToken() {
        if (this.hasMinor) {
            if (this.MeetGroup.group_token) {
                let groupTokenElement = this.MeetGroup.group_token["groupid_" + this.groupId];
                if (groupTokenElement) {
                    this.mainVideoToken = groupTokenElement.rtc_video_token;
                    this.mainScreenToken = groupTokenElement.rtc_screen_token;
                    let renewAudioVideoTokenCode = this.rtcSdk.renewToken(this.mainVideoToken);
                    console.info("AudioVideoScreenRTC更新音视频token:renewToken", renewAudioVideoTokenCode);
                    let renewScreenTokenCode = this.rtcSdk.videoSourceRenewToken(this.mainScreenToken);
                    console.info("AudioVideoScreenRTC更新投屏token:videoSourceRenewToken", renewScreenTokenCode);
                }
            }
        }
        else {
            if (this.MeetGroup.group_token) {
                let groupTokenElement = this.MeetGroup.group_token["groupid_" + this.groupId];
                if (groupTokenElement) {
                    this.minorVideoToken = groupTokenElement.rtc_video_token;
                    let renewAudioVideoTokenCode = this.rtcSdk.renewAssistChannelToken(this.minorChannel, this.minorVideoToken);
                    console.info("AssistChannelRTC更新音视频token:renewAssistChannelToken", renewAudioVideoTokenCode);
                }
            }
        }
    }
    joinChannelEx(token, channel, info, uid, options) {
        return this.rtcSdk.joinChannelEx(token, channel, info, uid, options);
    }
    leaveChannel() {
        this.rtcSdk.leaveChannel();
    }
    leaveChannelEx(conn) {
        return this.rtcSdk.leaveAssistChannel(conn.channelId, conn.localUid);
    }
    closeAll() {
        this.clientRole = 2;
        if (this.rtcSdk != null) {
            if (this.sdkType == 0) {
                this.stopAudio();
                this.stopVideo();
            }
            else {
                this.audioStatus = 0;
                this.videoStatus = 0;
            }
            this.stopScreen();
            let releaseCode = this.rtcSdk.release();
            console.info(`释放rtc资源：rtcSdk.release:${releaseCode}`);
            let messageTemp = {
                cmd: "openVideoBox",
                uid: this.videoBoxUid == this.userId ? 0 : this.videoBoxUid,
                close: true,
            };
            RendererHelper.sendToMainProcess(this.screenToolsChannel, messageTemp);
            if (this.openPIP2) {
                this.changePip(false);
            }
            this.rtcSdk = null;
        }
    }
    closeAssist() {
        if (this.rtcSdk) {
            this.rtcSdk.closeAssistChannel(this.minorChannel);
        }
    }
    addPublishStreamUrl(url) {
        if (this.rtcSdk) {
            this.publishStreamUrl = url;
            let ret = this.rtcSdk.addPublishStreamUrl(url, true);
            if (ret == 0) {
                this.rtcSdk.onRtmpStreamingEvent((url, eventCode) => {
                    if (eventCode == 1) {
                        console.error("RTMP/RTMPS 推流时，添加背景图或水印出错。");
                    }
                    else if (eventCode == 2) {
                        console.error("该推流 URL 已用于推流。如果你想开始新的推流，请使用新的推流 URL。");
                    }
                });
                this.rtcSdk.onRtmpStreamingStateChanged((url, state, code) => {
                    if (state == 4) {
                        console.error("推流失败，错误码：" + code);
                    }
                });
            }
            return ret;
        }
        return -1;
    }
    removePublishStreamUrl(url) {
        if (this.rtcSdk) {
            if (!url && this.publishStreamUrl) {
                url = this.publishStreamUrl;
                this.publishStreamUrl = null;
            }
            if (url) {
                return this.rtcSdk.removePublishStreamUrl(url);
            }
        }
        return -1;
    }
    setLiveTranscoding(transcoding) {
        if (this.rtcSdk) {
            if (this.clientRole != 1) {
                this.clientRole = 1;
                this.rtcSdk.setClientRole(this.clientRole);
            }
            return this.rtcSdk.setLiveTranscoding(transcoding);
        }
        return -1;
    }
    setBeautyEffectOptions(enable, options) {
        if (enable && !this.m_beautyEffectSupported) {
            return -4;
        }
        if (this.rtcSdk) {
            let beautyEffectCode = this.rtcSdk.setBeautyEffectOptions(enable, options);
            console.info("AudioVideoScreenRTC开启美颜", beautyEffectCode);
            return beautyEffectCode;
        }
        return 0;
    }
    enableVirtualBackground(enabled, backgroundImage, backgroundColor) {
        if (enabled) {
            console.info(`设置虚拟背景：imageUrl:${backgroundImage}`);
        }
        else {
            console.info("取消虚拟背景");
        }
        let pms = new Promise((resolve, reject) => {
            if (enabled && !this.m_beautyEffectSupported) {
                resolve(-4);
                reject(-1);
            }
            if (this.rtcSdk) {
                if (backgroundImage && backgroundImage.startsWith("http")) {
                    RendererHelper.downloadImage(backgroundImage)
                        .then((localPath) => {
                        if (enabled) {
                            console.info(`设置虚拟背景：localPath:${localPath}`);
                        }
                        let ret = this.rtcSdk.enableVirtualBackground(enabled, localPath, backgroundColor);
                        resolve(ret);
                        if (ret == 0) {
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
                    let ret = this.rtcSdk.enableVirtualBackground(enabled, backgroundImage, backgroundColor);
                    resolve(ret);
                    if (ret == 0) {
                    }
                    else {
                        reject(-1);
                    }
                }
            }
        });
        return pms;
    }
    setIgnoreFeatureSupported(ignore) {
        return this.rtcSdk.setIgnoreFeatureSupported(ignore);
    }
    isIgnoreFeatureSupported() {
        return this.rtcSdk.isIgnoreFeatureSupported();
    }
    sendMessage(msg, to) {
        if (this.rtcSdk) {
            return this.rtcSdk.sendMessage(msg, to);
        }
    }
    sendMessageEx(msg, to, conn) {
        if (this.rtcSdk) {
            return this.rtcSdk.sendMessageEx(msg, to, conn);
        }
    }
    getRoomUsers() {
        if (this.rtcSdk) {
            return this.rtcSdk.getRoomUsers();
        }
    }
    getRoomUsersEx(conn) {
        if (this.rtcSdk) {
            return this.rtcSdk.getRoomUsersEx(conn);
        }
    }
    onMessage(callback) {
        this.message_CallBack = callback;
        if (this.rtcSdk) {
            this.rtcSdk.onMessage(callback);
        }
    }
    subscribe(uid, view, options, isScreenShare = false) {
        try {
            this.rtcSdk.subscribe(uid, undefined, options, isScreenShare);
            if (this.rtcSdk && view) {
                let ret = this.rtcSdk.subscribe(uid, view, options, isScreenShare);
                this.rtcSdk.setupViewContentMode(uid, 0, 1, undefined);
                return ret;
            }
            console.warn("rtc subscribe video error: view is null");
        }
        catch (e) {
            console.warn("rtc subscribe video error:", e);
        }
        return -1;
    }
    subscribeByViewId(uid, viewId, options, isScreenShare = false) {
        let view = document.getElementById(viewId);
        return this.subscribe(uid, view, options, isScreenShare);
    }
    setLocalVideoMirrorMode(mirrortype) {
        this.localMirrorMode = mirrortype === 1;
        this.changeMirrorMode();
        return 0;
    }
    startAudioPlaybackDeviceTest() {
        if (this.rtcSdk) {
            let testAudioFilePath = path_1.default.join(this.userDataPath, "files/audio_play_test.wav");
            let tempAudioFilePath = path_1.default.join(__dirname, "../../../html/files/audio_play_test.wav");
            if (!fs.existsSync(testAudioFilePath)) {
                fs.copyFileSync(tempAudioFilePath, testAudioFilePath);
            }
            else {
                if (fs.statSync(testAudioFilePath).size !=
                    fs.statSync(tempAudioFilePath).size) {
                    fs.unlinkSync(testAudioFilePath);
                    fs.copyFileSync(tempAudioFilePath, testAudioFilePath);
                }
            }
            return this.rtcSdk.startAudioPlaybackDeviceTest(testAudioFilePath);
        }
        return -1;
    }
    stopAudioPlaybackDeviceTest() {
        if (this.rtcSdk) {
            return this.rtcSdk.stopAudioPlaybackDeviceTest();
        }
        return -1;
    }
    startAudioRecordingDeviceTest() {
        if (this.rtcSdk) {
            return this.rtcSdk.startAudioRecordingDeviceTest(1000);
        }
        return -1;
    }
    stopAudioRecordingDeviceTest() {
        if (this.rtcSdk) {
            return this.rtcSdk.stopAudioRecordingDeviceTest();
        }
        return -1;
    }
    openPreview() {
        if (this.rtcSdk && this.videoStatus == 0) {
            RendererHelper.emit("refreshMeetingVariable");
            if (this.Meeting.meet_setting_video) {
                this.setLocalVideoMirrorMode(this.Meeting.meet_setting_video.mirrorMode);
                if (this.Meeting.meet_setting_video.virtualBackground) {
                    this.enableVirtualBackground(true, this.Meeting.meet_setting_video.virtualBackground, 0);
                }
                else {
                    this.enableVirtualBackground(false, "", 0);
                }
                if (this.Meeting.meet_setting_video.beautyEffectOptions) {
                    this.setBeautyEffectOptions(this.Meeting.meet_setting_video.beautyEffectOptions.enabled, this.Meeting.meet_setting_video.beautyEffectOptions);
                }
            }
            this.m_IsOpenPreview = true;
            return this.rtcSdk.openPreview();
        }
    }
    closePreview() {
        this.m_IsOpenPreview = false;
        if (this.rtcSdk && this.videoStatus == 0) {
            return this.rtcSdk.closePreview();
        }
    }
    setRemoteDefaultVideoStreamType(streamType) {
        if (this.rtcSdk) {
            let ret = this.rtcSdk.setRemoteDefaultVideoStreamType(streamType);
            if (this.minorChannel) {
                this.rtcSdk.setRemoteDefaultVideoStreamType(streamType, this.minorChannel);
            }
            return ret;
        }
    }
    setRemoteVideoStreamType(uid, streamType) {
        if (this.rtcSdk) {
            return this.rtcSdk.setRemoteVideoStreamType(uid, streamType);
        }
    }
    setOutsideRatio(value) {
        this.rtcSdk.setParameters(`{\"che.video.fec_outside_bw_ratio\":${value}}`);
    }
    rtcScreenShot(isSelfShare, shareUid) {
        let pms = new Promise((resolve, reject) => {
            let div = document.querySelector(".shareScreen");
            if (isSelfShare) {
                div = document.createElement("div");
                div.id = "tempCanvas";
                div.style.width = "1920px";
                div.style.height = "1080px";
            }
            if (this.sdkType == 1) {
                shareUid = this.Meeting.getRealPuid(shareUid);
                this.rtcSdk
                    .takeSnapshot(this.mainChannel, shareUid, true)
                    .then((data) => {
                    if (data && data.success && data.data) {
                        resolve({ data: data.data.toDataURL() });
                    }
                    resolve();
                });
            }
            else {
                if (!shareUid) {
                    if (isSelfShare) {
                        shareUid = this.Meeting.getScreenPuid(this.Meeting.login_puid);
                    }
                    else {
                        shareUid = this.m_screenSharePuid;
                    }
                }
                if (!shareUid) {
                    return;
                }
                if (typeof shareUid == "string") {
                    shareUid = parseInt(shareUid);
                }
                let tempScreenuid = parseInt(this.Meeting.getScreenPuid(this.Meeting.login_puid));
                if (tempScreenuid == shareUid) {
                    isSelfShare = true;
                }
                this.rtcSdk
                    .takeSnapshot(this.mainChannel, shareUid, isSelfShare)
                    .then((data) => {
                    if (data && data.success && data.data) {
                        resolve({ data: data.data.toDataURL() });
                    }
                    resolve();
                });
            }
        });
        return pms;
    }
    takeSnapshot(channel, uid, isScrrenShare) {
        if (uid == this.userId) {
            uid = 0;
        }
        return this.rtcSdk
            .takeSnapshot(channel, uid, isScrrenShare)
            .then((data) => {
            if (data && data.success && data.data) {
                let imgData = new Uint8Array(data.data.toPNG());
                return imgData;
            }
            return undefined;
        });
    }
    onUserEnableLocalVideo(callback) {
        return this.rtcSdk.onUserEnableLocalVideo(callback);
    }
    async getScreenWindowsInfo() {
        let screenWindowsInfo = await this.rtcSdk.getScreenWindowsInfo();
        if (process.platform == "darwin" && this.sdkType == 1) {
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
            if (monitors.length < screenWindowsInfo.displaysInfo.length) {
                screenWindowsInfo.displaysInfo.splice(monitors.length, screenWindowsInfo.displaysInfo.length - monitors.length);
            }
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
    setMeetConfig(config) {
        console.log("setMeetConfig:");
        if (typeof config.language == "string") {
            this.m_language = parseInt(config.language);
        }
        else {
            this.m_language = config.language;
        }
        this.Meeting = config.Meeting;
        this.MeetLive = config.MeetLive;
        this.RtcScreenUtil = config.RtcScreenUtil;
        this.RtcMediaUtil = config.RtcMediaUtil;
        this.MeetGroup = config.MeetGroup;
        this.NetShooting = config.NetShooting;
        this.RtMUtil = config.RtMUtil;
        (0, RendererHelper_1.setTempStore)("meetConfig", this.deepCopyWithoutMethods(config));
    }
    deepCopyWithoutMethods(obj) {
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }
        let copy;
        if (Array.isArray(obj)) {
            copy = [];
            for (let i = 0; i < obj.length; i++) {
                copy[i] = this.deepCopyWithoutMethods(obj[i]);
            }
        }
        else {
            copy = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] !== "function") {
                        copy[key] = this.deepCopyWithoutMethods(obj[key]);
                    }
                }
            }
        }
        return copy;
    }
    queryDeviceScore() {
        return this.rtcSdk.queryDeviceScore();
    }
    onLeaveChannel(callback) {
        this.rtcSdk.onLeaveChannel(callback);
    }
    setDualStreamMode(mode, streamConfig) {
        return this.rtcSdk.setDualStreamMode(mode, streamConfig);
    }
    enableSubscribe(enableAudio, enableVideo) {
        return this.rtcSdk.enableSubscribe(enableAudio, enableVideo);
    }
    setRecordVolume(volume) {
        if (this.sdkType == 1) {
            this.rtcSdk.adjustRecordingSignalVolume(volume);
        }
        else {
            if (volume <= 100) {
                VolumePlugin.setRecordVolume(volume);
            }
            else {
                VolumePlugin.setRecordVolume(100);
                this.rtcSdk.adjustRecordingSignalVolume(volume);
            }
        }
    }
    setSpeakerVolume(volume) {
        if (this.sdkType == 1) {
            this.rtcSdk.adjustPlaybackSignalVolume(volume);
        }
        else {
            if (volume <= 100) {
                VolumePlugin.setSpeakerVolume(volume);
            }
            else {
                VolumePlugin.setSpeakerVolume(100);
                this.rtcSdk.adjustPlaybackSignalVolume(volume);
            }
        }
    }
    getSpeakerVolume() {
        if (this.sdkType == 1) {
            return this.rtcSdk.getPlaybackDeviceVolume();
        }
        else {
            return VolumePlugin.getSpeakerVolume();
        }
    }
    getRecordVolume() {
        if (this.sdkType == 1) {
            return this.rtcSdk.getRecordingDeviceVolume();
        }
        else {
            return VolumePlugin.getRecordVolume();
        }
    }
    isRecordMute() {
        return VolumePlugin.isRecordMute();
    }
    setRecordMute(mute) {
        VolumePlugin.setRecordMute(mute);
    }
    setAgc(value) {
        this.setParameters(`{"che.audio.aec.enable": ${value}}`);
    }
    enableAudioDump(enable, duration = 60000) {
        this.setParameters(`{"che.audio.apm_dump": ${enable}}`);
    }
    preAudioDump() {
        this.setParameters(`{"che.audio.start.predump":true}`);
    }
    joinAssistChannel(channelId, token, uid, options) {
        return this.rtcSdk?.joinAssistChannel(channelId, token, "", uid, options);
    }
    joinAssistChannelAsync(channelId, token, info, uid, options) {
        return this.rtcSdk?.joinAssistChannelAsync(channelId, token, info, uid, options);
    }
    leaveAssistChannel(channelId, uid) {
        return this.rtcSdk?.leaveAssistChannel(channelId, uid);
    }
    onRtcEvent(key, callbck) {
        this.rtcSdk?.onRtcEvent(key, callbck);
        return this;
    }
    setupRemoteVideoEx(uid, view, connection) {
        return this.rtcSdk?.setupRemoteVideoEx(uid, view, connection);
    }
    muteRemoteVideoStreamEx(uid, mute, connection) {
        return this.rtcSdk?.muteRemoteVideoStreamEx(uid, mute, connection);
    }
    muteRemoteAudioStreamEx(uid, mute, connection) {
        return this.rtcSdk?.muteRemoteAudioStreamEx(uid, mute, connection);
    }
    enableVideoDump(mode, enable) {
        this.setParameters(`{"engine.video.enable_video_dump":{"mode":${mode},"enable":${enable}}}`);
    }
    getUserName(puid) {
        if (puid == "0") {
            puid = this.userId + "";
        }
        return this.Meeting.getUserInfoForElectron(puid);
    }
    muteAllRemoteVideoStreams(channelId) {
        return this.rtcSdk.muteAllRemoteVideoStreams(true, channelId);
    }
    destroyRendererByView(view) {
        if (!view) {
            return;
        }
        this.rtcSdk.destroyRendererByView(view);
    }
    destroyRendererByConfig(sourceType, channelId, uid) {
        if (sourceType == undefined || channelId == undefined || uid == undefined) {
            return;
        }
        this.rtcSdk?.destroyRendererByConfig(sourceType, channelId, uid);
    }
    getRtcStats() {
        return this.m_RtcStat;
    }
    showFlatingWindowVideoData(uid, videoType) {
        RendererHelper.sendToOtherWindow("showFlatingVideoData", WinId_1.default.KetangFloatingWindowUUID, uid, videoType);
    }
    createDataChannel(conn) {
        return this.rtcSdk?.createDataChannel(conn);
    }
    subscribeData(conn, topicName) {
        return this.rtcSdk?.subscribeData(conn, topicName);
    }
    unsubscribeData(conn, topicName) {
        return this.rtcSdk?.unsubscribeData(conn, topicName);
    }
    deleteDataChannel(conn) {
        return this.rtcSdk?.deleteDataChannel(conn);
    }
    setScreenShareSceneMode(screenMode) {
        return this.rtcSdk?.setScreenShareSceneMode(screenMode);
    }
    setScreenShareSceneModeEx(conn, screenMode) {
        return this.rtcSdk?.setScreenShareSceneModeEx(conn, screenMode);
    }
    onConnectionEvent(key, callbck) {
        this.rtcSdk?.onConnectionEvent(key, callbck);
    }
    getAudioDevList() {
        return this.rtcSdk?.getAudioRecordingDevices();
    }
    getCurAudioDev() {
        return this.rtcSdk?.getCurrentAudioRecordingDevice();
    }
    getSpeakerDevList() {
        return this.rtcSdk?.getAudioPlaybackDevices();
    }
    getCurSpeakerDev() {
        return this.rtcSdk?.getCurrentAudioPlaybackDevice();
    }
    getVideoDevList() {
        return this.rtcSdk?.getVideoDevices();
    }
    getCurVideoDev() {
        return this.rtcSdk?.getCurrentVideoDevice();
    }
    showNewAudioDevDialog(devId) {
        console.log("showNewAudioDevDialog:", devId);
        RendererHelper.emit("showNewAudioDevDialog", devId);
    }
    showNewSpeakerDevDialog(devId) {
        console.log("showNewSpeakerDevDialog:", devId);
        RendererHelper.emit("showNewSpeakerDevDialog", devId);
    }
    setCurAudioDev(devId) {
        return this.rtcSdk?.setAudioRecordingDevice(devId);
    }
    setCurVideoDev(devId) {
        return this.rtcSdk?.setVideoDevice(devId);
    }
    setCurSpeakerDev(devId) {
        return this.rtcSdk?.setAudioPlaybackDevice(devId);
    }
    followSystemPlaybackDevice(enable) {
        return this.rtcSdk?.followSystemPlaybackDevice(enable);
    }
    followSystemRecordingDevice(enable) {
        return this.rtcSdk?.followSystemRecordingDevice(enable);
    }
    onRtcSdkEvent(key, callback) {
        this.rtcSdk?.on(key, callback);
        return this;
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
exports.default = InjectRtcAudioVideoScreen;
module.exports = InjectRtcAudioVideoScreen;
//# sourceMappingURL=RtcAudioVideoSceenHelper.js.map