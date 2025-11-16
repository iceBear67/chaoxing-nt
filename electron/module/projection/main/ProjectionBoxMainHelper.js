"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShareScreenToMeWindow = exports.isOpenRtcWindow = exports.openProjectionBox = void 0;
const electron_1 = require("electron");
const MainHelper_1 = require("../../../main/MainHelper");
const BrowserHelper_1 = require("../../../main/BrowserHelper");
const WinId_1 = __importDefault(require("../../../common/WinId"));
const UserHelper_1 = require("../../../main/UserHelper");
const MeetOut_1 = require("../../../out/meet/MeetOut");
const ImMainHelper_1 = require("../../../main/im/ImMainHelper");
const MachineIdUtil_1 = require("../../../utils/MachineIdUtil");
const LoadUrlHelper_1 = require("../../../main/LoadUrlHelper");
const DialogMainHelper_1 = require("../../../main/DialogMainHelper");
const NetRequestUtil_1 = require("../../../main/util/NetRequestUtil");
const AppSystemConfigMainHelper_1 = require("../../../main/AppSystemConfigMainHelper");
electron_1.ipcMain.on("_openProjectionBox", async (event, data) => {
    if (!data || !data.channelCode) {
        return;
    }
    openProjectionBox(data);
});
let projectionBox_MainWindowFullscreen = false;
function openProjectionBox(data) {
    if (isOpenRtcWindow()) {
        return;
    }
    const id = WinId_1.default.projectionBox;
    let win = (0, BrowserHelper_1.getWindowInWindowMap)(id);
    if (win && !win.isDestroyed()) {
        win.destroy();
        (0, BrowserHelper_1.delWindowInWindowMap)(id);
    }
    let screenBound = electron_1.screen.getPrimaryDisplay().bounds;
    let options = {
        id,
        alwaysOnTop: true,
        frame: false,
        show: false,
        x: screenBound.x,
        y: screenBound.y,
        width: screenBound.width,
        height: screenBound.height,
        transparent: true,
        skipTaskbar: true,
        fullscreenable: true,
        resizable: false,
        enableLargerThanScreen: true,
    };
    const url = `sview:/#/projectionBox`;
    win = (0, MainHelper_1.openNewWindow)(undefined, {
        url,
        options,
        data,
    });
    if (!electron_1.app.isPackaged) {
    }
    if (process.platform == "darwin") {
        win.on("close", (event) => {
            if (process.platform == "darwin") {
                win.setSimpleFullScreen(false);
                win.setVisibleOnAllWorkspaces(false);
                let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
                if (mainWin && mainWin.isFullScreen()) {
                    projectionBox_MainWindowFullscreen = true;
                    mainWin.setFullScreen(false);
                    setTimeout(() => {
                        projectionBox_MainWindowFullscreen = false;
                    }, 3000);
                }
                event.preventDefault();
                setTimeout(() => {
                    win.destroy();
                }, 100);
            }
        });
    }
    win.on("closed", () => {
        (0, BrowserHelper_1.closeWindow)("id_ScreenShareDisconnectPage");
        (0, BrowserHelper_1.closeWindow)(WinId_1.default.ProjectionPreToastUUID);
        if (process.platform == "darwin") {
            setTimeout(() => {
                electron_1.app.dock.show();
            }, 300);
            if (projectionBox_MainWindowFullscreen) {
                setTimeout(() => {
                    let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
                    mainWin.setFullScreen(true);
                }, 500);
                projectionBox_MainWindowFullscreen = false;
            }
        }
    });
    if (process.platform == "darwin") {
        win.setVisibleOnAllWorkspaces(true, {
            visibleOnFullScreen: true,
            skipTransformProcessType: false,
        });
    }
    return win;
}
exports.openProjectionBox = openProjectionBox;
electron_1.ipcMain.on("_simpleFullScreenWindowForProjectionBox", (event, flag) => {
    const id = WinId_1.default.projectionBox;
    let win = (0, BrowserHelper_1.getWindowInWindowMap)(id);
    if (win && !win.isDestroyed()) {
        if (process.platform == "darwin") {
            win.setFullScreenable(false);
            let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
            if (mainWin && mainWin.isFullScreen()) {
                projectionBox_MainWindowFullscreen = true;
                mainWin.setFullScreen(false);
                setTimeout(() => {
                    projectionBox_MainWindowFullscreen = false;
                }, 3000);
            }
            setTimeout(() => {
                win = (0, BrowserHelper_1.getWindowInWindowMap)(id);
                if (win && !win.isDestroyed()) {
                    win.setSimpleFullScreen(true);
                    win.setAlwaysOnTop(true, "screen-saver");
                    if (projectionBox_MainWindowFullscreen) {
                        setTimeout(() => {
                            mainWin.setFullScreen(true);
                        }, 500);
                        projectionBox_MainWindowFullscreen = false;
                    }
                    setTimeout(() => {
                        electron_1.app.dock.show();
                    }, 300);
                }
            }, 500);
        }
        else {
            win.setFullScreen(flag);
            win.setAlwaysOnTop(true, "screen-saver");
        }
    }
});
electron_1.ipcMain.on("_meetOperate", async (event, args) => {
    if (!args || !args.data) {
        return;
    }
    console.log("on _meetOperate:", JSON.stringify(args));
    if (args.data.type == "showScreen") {
        handleMeetOperateShowScreen(args.sender, args.data);
    }
    else if (args.data.type == "agreeShare") {
    }
    else if (args.data.type == "otherDeviceSharing") {
        handleMeetOperateOtherDeviceSharing(args.sender, args.data);
    }
    else if (args.data.type == "broadcastScreen" ||
        args.data.type == "unBroadcastScreen") {
        handleMeetOperateShareSceenToMe(args);
    }
    else if (args.data.type == "unShowScreen") {
        handleMeetOperateUnShowScreen(args.sender, args.data);
    }
    else if (args.data.type == "otherDevHandleBroad") {
        handleMeetOtherDevHandleBroad(args.sender, args.data);
    }
});
function operationError(errorMsg) {
    console.log("operationError:", errorMsg);
    (0, DialogMainHelper_1.openCommonDialog)(undefined, {
        type: "toast",
        content: errorMsg,
    });
}
function isOpenRtcWindow() {
    if ((0, BrowserHelper_1.isWindowOpened)(WinId_1.default.RTCWindow)) {
        (0, DialogMainHelper_1.dialogAlert)(undefined, "你正在观看其他人屏幕，请先退出");
        return true;
    }
    else if ((0, BrowserHelper_1.isWindowOpened)(WinId_1.default.projectionBox)) {
        let win = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.projectionBox);
        if (win?._showScreen) {
            (0, DialogMainHelper_1.dialogAlert)(undefined, "你正在展示屏幕中，请先退出");
        }
        else {
            (0, DialogMainHelper_1.dialogAlert)(undefined, "你正在投屏中，请先退出");
        }
        return true;
    }
    return false;
}
exports.isOpenRtcWindow = isOpenRtcWindow;
electron_1.ipcMain.handle("_isShowScreen", async (event) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    return win?._showScreen;
});
async function handleMeetOperateShowScreen(sender, parms1) {
    if (!parms1) {
        return;
    }
    let needPop = await checkMeetOperateCheckPop(parms1.meetUuid, parms1.requestUuid);
    if (!needPop) {
        return;
    }
    const confirmWinId = `projectionBox_confirm`;
    if ((0, BrowserHelper_1.isWindowOpened)(confirmWinId)) {
        (0, BrowserHelper_1.closeWindow)(confirmWinId);
        return;
    }
    let dialogResult = await (0, DialogMainHelper_1.openCommonDialog)(undefined, {
        winConfig: {
            id: confirmWinId,
            extParams: { meetCode: parms1.meetCode },
        },
        type: "confirm",
        content: `${parms1.name}请求展示你的屏幕`,
        okBtn: "同意",
        cancelBtn: "拒绝",
    });
    let uid = (0, UserHelper_1.getUID)();
    let parms = {
        puid: uid,
        status: dialogResult?._ok ? 1 : 2,
        meetUuid: parms1.meetUuid,
        requestUuid: parms1.requestUuid,
    };
    try {
        let res = await MeetOut_1.MeetOut.UpdateStuShowRecord(parms.puid, parms.status, parms.meetUuid, parms.requestUuid);
        console.log("UpdateStuShowRecord result:", JSON.stringify(res));
        if (res.result == 1) {
            if (dialogResult?._ok) {
                if (isOpenRtcWindow()) {
                    return;
                }
                (0, ImMainHelper_1.sendImMessage)({
                    type: "cmd",
                    chatType: "singleChat",
                    to: sender,
                    action: "CMD_MEET_RTC_TEA_SCREEN",
                    ext: {
                        type: "agreeScreenSharing",
                        shareUidSelf: parms1.shareUidSelf,
                        deviceId: (0, MachineIdUtil_1.machineIdSync)(true),
                    },
                });
                handleMeetOperateStartScreen(sender, parms1);
            }
            else {
                (0, ImMainHelper_1.sendImMessage)({
                    type: "cmd",
                    chatType: "singleChat",
                    to: sender,
                    action: "CMD_MEET_RTC_TEA_SCREEN",
                    ext: {
                        type: "rejectScreenSharing",
                        shareUidSelf: parms1.shareUidSelf,
                    },
                });
            }
        }
        else {
            operationError(res.errorMsg);
        }
    }
    catch (e) {
        console.log("UpdateStuShowRecord error:", e);
        operationError("操作失败");
    }
}
async function handleMeetOperateStartScreen(sender, parms1) {
    if (!parms1) {
        return;
    }
    let options = {
        channelCode: parms1.meetCode,
        type: "mainScreen",
    };
    options.uid = parms1.intoRTCUser;
    options.sdkType = parms1.intoRTCSdkType;
    (0, DialogMainHelper_1.dialogToastLong)(undefined, "准备中", { winId: WinId_1.default.ProjectionPreToastUUID });
    let win = openProjectionBox(options);
    if (win) {
        win._showScreen = true;
    }
    return win;
}
async function handleMeetOperateShareSceenToMe(args) {
    if (!args || !args.data) {
        return;
    }
    let parms = args.data;
    if (parms?.type == "broadcastScreen") {
        let myPuid = (0, UserHelper_1.getUID)();
        if (parms.excludePuids?.includes(myPuid)) {
            return;
        }
        if (!parms.uuid || !parms.requestUuid) {
            if (isOpenRtcWindow()) {
                return;
            }
            let win = createShareScreenToMeWindow(parms);
            if (parms.lock) {
                win.setAlwaysOnTop(true);
            }
        }
        else {
            const alertWinId = `broadcastScreen_alert`;
            (0, DialogMainHelper_1.dialogAlert)(undefined, `即将观看${parms.name}的屏幕广播`, {
                winId: alertWinId,
                title: "屏幕广播",
                okBtn: "立即观看",
                okClick: async () => {
                    if (isOpenRtcWindow()) {
                        return;
                    }
                    let broadcastStatus = await checkBroadcastStatus(parms.uuid, parms.requestUuid);
                    if (broadcastStatus?.result == 1) {
                        let win = createShareScreenToMeWindow(parms);
                        if (parms.lock) {
                            win.setAlwaysOnTop(true);
                        }
                    }
                    else {
                        (0, DialogMainHelper_1.dialogAlert)(undefined, broadcastStatus?.errorMsg || "操作失败！", {
                            winId: alertWinId,
                        });
                    }
                },
            });
        }
    }
}
function createShareScreenToMeWindow(parms) {
    let display = electron_1.screen.getPrimaryDisplay();
    let bounds = display.bounds;
    let url = "sview:/#/rtcView";
    if (parms.uuid && parms.requestUuid) {
        url = "sview:/#/rtcViewNew";
    }
    let win = (0, MainHelper_1.openNewWindow)(undefined, {
        options: {
            id: WinId_1.default.RTCWindow,
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            fullscreenable: true,
            simpleFullscreen: true,
            resizable: false,
            enableLargerThanScreen: true,
            transparent: true,
            frame: false,
            show: true,
        },
        url,
        data: parms,
    });
    if (process.platform == "darwin") {
        win.setSimpleFullScreen(true);
        win.setVisibleOnAllWorkspaces(true, {
            visibleOnFullScreen: true,
            skipTransformProcessType: false,
        });
        setTimeout(() => {
            electron_1.app.dock.show();
        }, 500);
        win.on("closed", () => {
            (0, BrowserHelper_1.closeWindow)("id_ScreenShareDisconnectPage");
            setTimeout(() => {
                electron_1.app.dock.show();
            }, 300);
        });
    }
    else {
        win.setFullScreen(true);
    }
    win.loadURL((0, LoadUrlHelper_1.getUrl)(url));
    return win;
}
exports.createShareScreenToMeWindow = createShareScreenToMeWindow;
async function handleMeetOperateOtherDeviceSharing(sender, parms1) {
    if (!parms1) {
        return;
    }
    const deviceId = parms1.deviceId;
    if (!deviceId || deviceId != (0, MachineIdUtil_1.machineIdSync)(true)) {
        const confirmWinId = `projectionBox_confirm`;
        if ((0, BrowserHelper_1.isWindowOpened)(confirmWinId)) {
            let confirmWin = (0, BrowserHelper_1.getWindowInWindowMap)(confirmWinId);
            confirmWin.close();
            (0, DialogMainHelper_1.dialogToast)(undefined, "已在其他设备处理");
        }
    }
}
async function handleMeetOperateUnShowScreen(sender, parms1) {
    if (!parms1) {
        return;
    }
    const confirmWinId = `projectionBox_confirm`;
    let win = (0, BrowserHelper_1.getWindowInWindowMap)(confirmWinId);
    if (win && !win.isDestroyed()) {
        let meetCode1 = win.extParams?.meetCode;
        if (meetCode1 == parms1.meetCode) {
            win.close();
        }
    }
}
async function checkMeetOperateCheckPop(meetUuid, requestUuid) {
    let puid = (0, UserHelper_1.getUID)();
    let url = `https://appswh.chaoxing.com/board/apis/showrecord/checkPopStatus?puid=${puid}&deviceId=${meetUuid}&requestUuid=${requestUuid}`;
    let data = await (0, NetRequestUtil_1.netRequest)({ url, tokenSign: true });
    if (data?.result == 1) {
        return data.data?.pop;
    }
    return false;
}
electron_1.ipcMain.on("_visibleScreenShareDisconnectPage", (event, visible) => {
    const id = "id_ScreenShareDisconnectPage";
    if (visible) {
        if ((0, BrowserHelper_1.isWindowOpened)(id)) {
            return;
        }
        let url = "hview://screen_share_disconnect.html";
        let pWin;
        if ((0, AppSystemConfigMainHelper_1.getAppSystemConfig)()?.appMode == "normal") {
            pWin = electron_1.BrowserWindow.fromWebContents(event.sender);
        }
        let win = (0, BrowserHelper_1.createBrowserWindow)({
            id,
            width: 1920,
            height: 1080,
            resizable: false,
            frame: false,
            transparent: true,
            show: true,
            parent: pWin,
            webPreferences: {},
        });
        win.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(url));
        win.setIgnoreMouseEvents(true);
        if ((0, AppSystemConfigMainHelper_1.getAppSystemConfig)()?.appMode == "fanya") {
            win.setAlwaysOnTop(true);
        }
    }
    else {
        (0, BrowserHelper_1.closeWindow)(id);
    }
});
async function checkBroadcastStatus(mainScreenDeviceId, requestUuid) {
    let puid = (0, UserHelper_1.getUID)();
    let devId = (0, MachineIdUtil_1.machineIdSync)(true).replaceAll("-", "");
    let url = `https://appswh.chaoxing.com/board/apis/showrecord/checkBroadcastStatus?puid=${puid}&mainScreenDeviceId=${mainScreenDeviceId}&requestUuid=${requestUuid}&currentDeviceId=${devId}`;
    return (0, NetRequestUtil_1.netRequest)({ url, tokenSign: true });
}
function handleMeetOtherDevHandleBroad(sender, parms1) {
    const alertWinId = `broadcastScreen_alert`;
    if ((0, BrowserHelper_1.isWindowOpened)(alertWinId)) {
        (0, BrowserHelper_1.closeWindow)(alertWinId);
        if (parms1?.msg) {
            (0, DialogMainHelper_1.dialogToast)(undefined, parms1.msg);
        }
    }
}
//# sourceMappingURL=ProjectionBoxMainHelper.js.map