"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKetangMainWindow = exports.stopScreenShare = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const WinId_1 = __importDefault(require("../common/WinId"));
const BrowserHelper_1 = require("./BrowserHelper");
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const StoreHelper_1 = __importDefault(require("./StoreHelper"));
const sudo = require("cx-sudo-prompt");
const events_1 = require("events");
const MainHelper_1 = require("./MainHelper");
const UpdateUtil_1 = require("./UpdateUtil");
const CommonUtil_1 = require("../utils/CommonUtil");
const DevHelper_1 = require("./DevHelper");
require("./KetangFloatingWindowHelper");
const AppSystemConfigMainHelper_1 = require("./AppSystemConfigMainHelper");
const TabHelper_1 = __importDefault(require("./TabHelper"));
const StoreKey_1 = require("../common/StoreKey");
const EventUtil_1 = require("../utils/EventUtil");
const MoudlePathUtil_1 = require("../utils/MoudlePathUtil");
const OpenketangProtocolHepler_1 = require("./OpenketangProtocolHepler");
const m_EventEmitter = new events_1.EventEmitter();
let meetToolsMessageFormMainChannel = "meetToolsMessageFormMain";
let meetChosesMessageFormMainChannel = "meetChosesMessageFormMain";
let pipVideoMessageFormMainChannel = "pipVideoMessageFormMain";
let meetToolsFormMainChannel = "meetToolsFormMain";
let meetVideoMessageFormMainChannel = "meetVideoMessageFormMain";
let showBoxInWin7 = false;
let m_showWindowArrayOnScreenShare = new Array();
let speechExeFuns = null;
const appconfig = require("../config/appconfig.json");
electron_1.ipcMain.handle("_checkAldDriver", (event, sdkType = 0) => {
    if (process.platform != "darwin") {
        return 1;
    }
    let driverPath;
    if (sdkType == 1) {
        driverPath =
            "/Library/Audio/Plug-Ins/HAL/RKCloudALD.driver/Contents/MacOS/RKCloudALD";
    }
    else {
        driverPath =
            "/Library/Audio/Plug-Ins/HAL/AgoraALD.driver/Contents/MacOS/AgoraALD";
    }
    if (fs_1.default.existsSync(driverPath)) {
        return 1;
    }
    return 0;
});
electron_1.ipcMain.handle("_installAldDriver", (event, sdkType = 0) => {
    if (process.platform != "darwin") {
        return 0;
    }
    let appName = appconfig.appName;
    if (!appName) {
        appName = "学习通";
    }
    let macPlugin;
    if (sdkType == 1) {
        macPlugin = (0, MoudlePathUtil_1.getModuleFilePath)("rkALD/mac");
    }
    else {
        macPlugin = (0, MoudlePathUtil_1.getModuleFilePath)("agoraALD/mac");
    }
    let driverPath;
    if (sdkType == 1) {
        driverPath = path_1.default.join(macPlugin, "RKCloudALD.driver");
    }
    else {
        driverPath = path_1.default.join(macPlugin, "AgoraALD.driver");
    }
    let pms = new Promise((resolve, reject) => {
        appName = appName.replace("（", "(").replace("）", ")");
        var options = {
            name: appName,
            icns: path_1.default.join(__dirname, "../../icons/icon.icns"),
            plistPath: path_1.default.join(macPlugin, "Info.json"),
        };
        let cmd = `cp -R '${driverPath}' /Library/Audio/Plug-Ins/HAL && pkill -9 coreaudiod && launchctl kickstart -kp system/com.apple.audio.coreaudiod`;
        console.info(`exec cmd:${cmd}`);
        sudo.exec(cmd, options, function (error, stdout, stderr) {
            if (stderr && stderr.includes("Password:Sorry, try again")) {
                resolve(1);
            }
            else {
                let driverPath = "/Library/Audio/Plug-Ins/HAL/AgoraALD.driver/Contents/MacOS/AgoraALD";
                if (fs_1.default.existsSync(driverPath)) {
                    resolve(0);
                }
                else {
                    resolve(2);
                }
            }
            console.info("sudo stdout: " + stdout);
            console.info("sudo stderr: ", error);
        });
    });
    return pms;
});
function getScreenToolsQueryValues(message) {
    let queryValues = "?_t=0";
    let language = message.language || "language";
    queryValues += "&language=" + language;
    let videoValueChange = message.videoValueChange || "";
    queryValues += "&videoValueChange=" + videoValueChange;
    let curVideoValue = message.curVideoValue || "180p_1";
    queryValues += "&curVideoValue=" + curVideoValue;
    let screenValueChange = message.screenValueChange || "";
    queryValues += "&screenValueChange=" + screenValueChange;
    let curScreenValue = message.curScreenValue || "720p_1";
    queryValues += "&curScreenValue=" + curScreenValue;
    let leader = message.leader || "0";
    queryValues += "&leader=" + leader;
    let hasAudioDev = message.hasAudioDev || "false";
    queryValues += "&hasAudioDev=" + hasAudioDev;
    let hasVideoDev = message.hasVideoDev || "false";
    queryValues += "&hasVideoDev=" + hasVideoDev;
    let audioSetStatus = message.audioSetStatus || "0";
    queryValues += "&audioSetStatus=" + audioSetStatus;
    let videoSetStatus = message.videoSetStatus || "0";
    queryValues += "&videoSetStatus=" + videoSetStatus;
    let recordSetStatus = message.recordSetStatus || "0";
    queryValues += "&recordSetStatus=" + recordSetStatus;
    let liveSetStatus = message.liveSetStatus || "0";
    queryValues += "&liveSetStatus=" + liveSetStatus;
    let isPublic = message.isPublic || "1";
    queryValues += "&isPublic=" + isPublic;
    let isAllowToLeave = message.isAllowToLeave || "1";
    queryValues += "&isAllowToLeave=" + isAllowToLeave;
    let isAllowUnmuteSelf = message.isAllowUnmuteSelf || "1";
    queryValues += "&isAllowUnmuteSelf=" + isAllowUnmuteSelf;
    let isLockMeet = message.isLockMeet || "0";
    queryValues += "&isLockMeet=" + isLockMeet;
    let meetTime = message.meetTime || new Date().getTime();
    queryValues += "&meetTime=" + meetTime;
    let membersNumber = message.membersNumber || "0";
    queryValues += "&membersNumber=" + membersNumber;
    let chatNumber = message.chatNumber || "0";
    queryValues += "&chatNumber=" + chatNumber;
    let openPIP = message.openPIP || false;
    queryValues += "&openPIP=" + openPIP;
    let showActivitiesState = message.showActivitiesState || 0;
    queryValues += "&showActivitiesState=" + showActivitiesState;
    let userName = message.userName || "";
    queryValues += "&userName=" + userName;
    return queryValues;
}
let screenShare_MainWindowFullscreen = false;
function startScreen(event1, message) {
    console.log("startScreen");
    let choseWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.choseScreenWindowUUID);
    if (choseWindowTemp) {
        (0, BrowserHelper_1.delWindowInWindowMap)(WinId_1.default.choseScreenWindowUUID);
        choseWindowTemp.close();
    }
    let screenToolsWindow = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
    if (!screenToolsWindow) {
        let aeroTheme = true;
        if (process.platform == "win32") {
            if (!electron_1.systemPreferences.isAeroGlassEnabled()) {
                aeroTheme = false;
            }
            let forceShowInWin7 = StoreHelper_1.default.getSystem().get("forceShowInWin7");
            if (forceShowInWin7) {
                aeroTheme = false;
            }
        }
        screenToolsWindow = createScreenShareWindow(message, aeroTheme);
        handleScreenShareInfo(message.type, message.info);
        let queryValues = getScreenToolsQueryValues(message);
        if (message.pageUrl) {
            let pageUrl = message.pageUrl + queryValues;
            screenToolsWindow.webContents.loadURL(pageUrl);
        }
        else if (aeroTheme) {
            screenToolsWindow.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(`hview://box.html${queryValues}`));
        }
        else {
            screenToolsWindow.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(`hview://box_win7.html${queryValues}`));
        }
        console.info("[MainProcessHelper][new-window]新视图 打开屏幕共享窗口");
        if (process.platform === "darwin") {
            screenToolsWindow.setSimpleFullScreen(true);
            screenToolsWindow.setAlwaysOnTop(true, "screen-saver");
            screenToolsWindow.setVisibleOnAllWorkspaces(true, {
                visibleOnFullScreen: true,
                skipTransformProcessType: false,
            });
        }
        else {
            if (aeroTheme) {
                if ((0, CommonUtil_1.hasDifferentScaleScreen)()) {
                    console.log("hasDifferentScaleScreen.....");
                    setTimeout(() => {
                        if (!screenToolsWindow.isDestroyed()) {
                            if (message.bounds && message.bounds.x < 0) {
                                console.log("message.bounds.....:", message.bounds);
                                const scaleFactor = electron_1.screen.getPrimaryDisplay().scaleFactor;
                                screenToolsWindow.setPosition(message.bounds.x * scaleFactor, message.bounds.y * scaleFactor);
                                setTimeout(() => {
                                    screenToolsWindow.setBounds(message.bounds);
                                    screenToolsWindow.setFullScreen(true);
                                }, 1);
                            }
                            else {
                                screenToolsWindow.setBounds(message.bounds);
                                screenToolsWindow.setFullScreen(true);
                            }
                        }
                    }, 1);
                }
                else {
                    screenToolsWindow.setFullScreen(true);
                }
            }
        }
        screenToolsWindow.setAlwaysOnTop(true, "screen-saver");
        let isWin7 = (0, CommonUtil_1.osIsLowerThanWin7)();
        if (aeroTheme && !isWin7) {
            screenToolsWindow.setIgnoreMouseEvents(true, { forward: true });
        }
        screenToolsWindow.on("close", function (e) {
            if (process.platform == "darwin") {
                screenToolsWindow.setSimpleFullScreen(false);
                let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
                if (mainWin && mainWin.isFullScreen()) {
                    screenShare_MainWindowFullscreen = true;
                    mainWin.setFullScreen(false);
                    setTimeout(() => {
                        screenShare_MainWindowFullscreen = false;
                    }, 3000);
                }
            }
        });
        screenToolsWindow.on("closed", (event) => {
            let meetingWin = getMeetingWindow();
            if (process.platform == "darwin") {
                if (meetingWin && !meetingWin.isDestroyed()) {
                    meetingWin.setVisibleOnAllWorkspaces(false);
                }
                if (screenShare_MainWindowFullscreen) {
                    setTimeout(() => {
                        let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
                        mainWin.setFullScreen(true);
                    }, 500);
                    setTimeout(() => {
                        if (meetingWin && !meetingWin.isDestroyed()) {
                            meetingWin.show();
                        }
                    }, 1600);
                    screenShare_MainWindowFullscreen = false;
                }
            }
            if (meetingWin && !meetingWin.isDestroyed()) {
                meetingWin.setAlwaysOnTop(false);
            }
            (0, BrowserHelper_1.delWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
            if (showBoxInWin7) {
                let miniMeet = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.miniMeetingWinUUID);
                if (miniMeet && !miniMeet.isDestroyed()) {
                    miniMeet.close();
                }
            }
            (0, MainHelper_1.setTempStore)(StoreKey_1.StoreKey.rtcScreenShareContainMainWindow, false);
            let messageSub = TabHelper_1.default.getSubTab("tab_message_sub");
            if (messageSub && !messageSub.isDestroyed()) {
                messageSub.getWebContents().send("stopScreenShare");
            }
        });
        let screenType = message.type || "1";
        let screenInfo = message.info || "";
        let qrcode = message.qrcode || "";
        let qrcodeUrl = message.qrcodeUrl || "";
        let qrcodeTips = message.qrcodeTips || "";
        let meetTitle = message.meetTitle || "";
        let finishLoadSendValue = {
            cmd: "dataInfo",
            qrcode: qrcode,
            qrcodeUrl: qrcodeUrl,
            qrcodeTips: qrcodeTips,
            screenType: screenType,
            screenInfo: screenInfo,
            screenToolsX: message.screenToolsX,
            screenToolsY: message.screenToolsY,
            meetTitle: meetTitle,
        };
        (0, BrowserHelper_1.putWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID, screenToolsWindow);
        screenToolsWindow.webContents.on("did-stop-loading", () => {
            screenToolsWindow.webContents.send(meetToolsMessageFormMainChannel, finishLoadSendValue);
            if (process.platform == "darwin") {
                let meetingWin = getMeetingWindow();
                if (meetingWin && !meetingWin.isDestroyed()) {
                    meetingWin.setAlwaysOnTop(true, "pop-up-menu");
                    meetingWin.setVisibleOnAllWorkspaces(true, {
                        visibleOnFullScreen: true,
                        skipTransformProcessType: false,
                    });
                }
                let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
                if (mainWin && mainWin.isFullScreen()) {
                    mainWin.setFullScreen(false);
                    setTimeout(() => {
                        mainWin.setFullScreen(true);
                    }, 500);
                }
                electron_1.app.dock.show();
            }
            if (aeroTheme && isWin7) {
                setTimeout(() => {
                    screenToolsWindow.setIgnoreMouseEvents(true, { forward: true });
                }, 50);
            }
            screenToolsWindow.show();
        });
    }
}
electron_1.ipcMain.on("screenTools", function (event1, message) {
    if (!message || !message.cmd) {
        return;
    }
    if ("startScreen" == message.cmd) {
        startScreen(event1, message);
    }
    else if ("stopScreen" == message.cmd) {
        console.log("stopScreen");
        stopScreenShare();
    }
    else if ("reChooseScreen" == message.cmd) {
        console.log("reChooseScreen");
        let choseWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.choseScreenWindowUUID);
        if (choseWindowTemp) {
            (0, BrowserHelper_1.delWindowInWindowMap)(WinId_1.default.choseScreenWindowUUID);
            choseWindowTemp.close();
        }
        let screenToolsWindow = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
        if (screenToolsWindow) {
            let screenType = message.screenType || "1";
            let screenInfo = message.screenInfo || "";
            let showOnScreen;
            if (screenType == "1") {
                if (screenInfo && screenInfo.displayId) {
                    showOnScreen = electron_1.screen.getDisplayMatching(screenInfo.displayId);
                }
            }
            else if (screenType == "2") {
                if (screenInfo && screenInfo.windowId) {
                    showOnScreen = electron_1.screen.getDisplayMatching(screenInfo);
                }
            }
            if (showOnScreen) {
                let scrennArea = showOnScreen.workArea;
                if (showBoxInWin7) {
                    let screenToolsWindowBounds = screenToolsWindow.getBounds();
                    let winWidthTemp = screenToolsWindowBounds.width;
                    let screenToolsX = parseInt(scrennArea.x + (scrennArea.width - winWidthTemp) / 2);
                    let screenToolsY = scrennArea.y;
                    screenToolsWindow.setPosition(screenToolsX, screenToolsY, false);
                    let miniMeetWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.miniMeetingWinUUID);
                    if (miniMeetWin && !miniMeetWin.isDestroyed()) {
                        let width = 38;
                        let x = scrennArea.x + scrennArea.width - width;
                        let y = 120;
                        miniMeetWin.setPosition(x, y);
                    }
                }
                else {
                    screenToolsWindow.setPosition(scrennArea.x, scrennArea.y, false);
                }
            }
            else {
                if (process.platform === "darwin") {
                    screenToolsWindow.setSimpleFullScreen(false);
                }
                let scrennArea = showOnScreen.bounds();
                screenToolsWindow.setPosition(scrennArea.x, scrennArea.y, false);
            }
            if (!showBoxInWin7) {
                if (process.platform === "darwin") {
                    screenToolsWindow.setSimpleFullScreen(true);
                    screenToolsWindow.setAlwaysOnTop(true, "screen-saver");
                }
                else {
                    screenToolsWindow.setAlwaysOnTop(true, "screen-saver");
                    screenToolsWindow.setFullScreen(true);
                }
            }
            let sendValue = Object.assign({}, message);
            sendValue.cmd = "reChooseShare";
            screenToolsWindow.webContents.send(meetToolsMessageFormMainChannel, sendValue);
        }
    }
    else if ("changeMeetWindowSize" == message.cmd) {
        let windowWidthTemp = message.windowWidth;
        let windowHeightTemp = message.windowHeight;
        if (!windowWidthTemp || !windowHeightTemp) {
            return;
        }
        let meetWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
        if (meetWindowTemp) {
            if (process.platform == "win32" && (0, CommonUtil_1.hasDifferentScaleScreen)()) {
                setTimeout(() => {
                    if (!meetWindowTemp.isDestroyed()) {
                        setWindowMinimumSize(meetWindowTemp, windowWidthTemp, windowHeightTemp);
                        setWindowSize(meetWindowTemp, windowWidthTemp, windowHeightTemp);
                        setWindowContentSize(meetWindowTemp, windowWidthTemp, windowHeightTemp);
                    }
                }, 10);
            }
            else {
                setWindowMinimumSize(meetWindowTemp, windowWidthTemp, windowHeightTemp);
                setWindowSize(meetWindowTemp, windowWidthTemp, windowHeightTemp);
                setWindowContentSize(meetWindowTemp, windowWidthTemp, windowHeightTemp);
            }
            meetWindowTemp.setResizable(false);
            meetWindowTemp.show();
        }
    }
    else if ("choseScreen" == message.cmd) {
        console.log("choseScreen");
        let displays = message.displays || "";
        let winplays = message.winplays || "";
        let hasVideoDev = message.hasVideoDev || false;
        let queryValues = "?_t=0";
        let language = message.language || "language";
        let openType = message.openType || "";
        queryValues += "&language=" + language;
        let choseWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.choseScreenWindowUUID);
        if (!choseWindowTemp || choseWindowTemp.isDestroyed()) {
            let pWin = electron_1.BrowserWindow.fromWebContents(event1.sender);
            let windowOptionsTemp = {
                id: WinId_1.default.choseScreenWindowUUID,
                width: 1100,
                height: 750,
                parent: pWin,
                webPreferences: {
                    nodeIntegration: true,
                    preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.choseScreenWindowUUID, "file://"),
                },
                frame: false,
                center: true,
                autoHideMenuBar: true,
                fullscreen: false,
            };
            if (message.fromWinId != "projectionScreen") {
                let screenToolsWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
                if (screenToolsWindowTemp) {
                    windowOptionsTemp.parent = screenToolsWindowTemp;
                }
                else {
                    let meetWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
                    if (meetWindowTemp) {
                        windowOptionsTemp.parent = meetWindowTemp;
                    }
                }
            }
            let windowIds = new Array();
            if (!windowOptionsTemp.extParams) {
                windowOptionsTemp.extParams = new BrowserHelper_1.WindowExtInfo();
            }
            windowOptionsTemp.extParams.ketangFlag = true;
            choseWindowTemp = (0, BrowserHelper_1.createBrowserWindow)(windowOptionsTemp);
            choseWindowTemp.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(`hview://choseScreen.html${queryValues}`));
            console.info("[MainProcessHelper][new-window]新视图:选择共享屏幕、窗口view/choseScreen.html已加载");
            initWindowIds(windowIds);
            let finishLoadSendValue = {
                cmd: "choseData",
                hasVideoDev: hasVideoDev,
                language: language,
                displays: displays,
                winplays: winplays,
                windowIds: windowIds,
                reChose: message.reChose,
                fromWinId: message.fromWinId,
                openType: openType,
            };
            choseWindowTemp.webContents.on("did-stop-loading", () => {
                choseWindowTemp.webContents.send(meetChosesMessageFormMainChannel, finishLoadSendValue);
            });
            let meetWin = getMeetingWindow();
            if (meetWin && !meetWin.isDestroyed()) {
                if (!message.reChose) {
                    choseWindowTemp.setParentWindow(meetWin);
                }
            }
        }
        else {
            choseWindowTemp.show();
        }
    }
    else if ("choseScreenData" == message.cmd) {
        let choseWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.choseScreenWindowUUID);
        if (choseWindowTemp) {
            let windowIds = new Array();
            initWindowIds(windowIds);
            message.windowIds = windowIds;
            choseWindowTemp.webContents.send(meetChosesMessageFormMainChannel, message);
        }
    }
    else if ("closeChoseScreen" == message.cmd) {
        let choseWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.choseScreenWindowUUID);
        if (choseWindowTemp) {
            (0, BrowserHelper_1.delWindowInWindowMap)(WinId_1.default.choseScreenWindowUUID);
            choseWindowTemp.close();
        }
    }
    else if ("openPIPVideoBox" == message.cmd) {
        message.cmd = "pipVideoData";
        let openPIPVideoBoxWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.openPIPVideoBoxWindowUUID);
        if (!openPIPVideoBoxWindowTemp) {
            if (message.close) {
                return;
            }
            openPIPVideoBoxWindowTemp = (0, BrowserHelper_1.createBrowserWindow)({
                id: WinId_1.default.openPIPVideoBoxWindowUUID,
                width: 320,
                height: 200,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: true,
                    preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.openPIPVideoBoxWindowUUID, "file://"),
                },
                frame: false,
                center: true,
                maximizable: true,
                minimizable: true,
                resizable: true,
                alwaysOnTop: true,
                autoHideMenuBar: true,
                title: "画中画",
                extParams: {
                    ketangFlag: true,
                },
            });
            openPIPVideoBoxWindowTemp.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(`hview://pipVideoBox2.html`));
            console.info("[MainProcessHelper][new-window]新视图 画中画窗口：view/pipVideoBox2.html 已加载");
            if (process.platform === "darwin") {
                openPIPVideoBoxWindowTemp.setAlwaysOnTop(true, "pop-up-menu");
            }
            else {
                openPIPVideoBoxWindowTemp.setAlwaysOnTop(true, "pop-up-menu");
            }
            let screenWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
            if (screenWin && !screenWin.isDestroyed()) {
                openPIPVideoBoxWindowTemp.setParentWindow(screenWin);
            }
            openPIPVideoBoxWindowTemp.webContents.on("did-stop-loading", () => {
                openPIPVideoBoxWindowTemp.webContents.send(pipVideoMessageFormMainChannel, message);
            });
            openPIPVideoBoxWindowTemp.on("closed", function () {
                (0, BrowserHelper_1.delWindowInWindowMap)(WinId_1.default.openPIPVideoBoxWindowUUID);
                let meetWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
                if (meetWindowTemp) {
                    let messageTemp = {
                        cmd: "closePIPVideoBox",
                    };
                    meetWindowTemp.webContents.send(meetToolsFormMainChannel, messageTemp);
                }
                let screenToolsWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
                if (screenToolsWindowTemp && !screenToolsWindowTemp.isDestroyed()) {
                    let messageTemp = {
                        cmd: "closePIPVideoBox",
                    };
                    screenToolsWindowTemp.webContents.send(meetToolsMessageFormMainChannel, messageTemp);
                }
            });
            let screenToolsWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
            if (screenToolsWindowTemp && !screenToolsWindowTemp.isDestroyed()) {
                let messageTemp = {
                    cmd: "openPIPVideoBox",
                };
                screenToolsWindowTemp.webContents.send(meetToolsMessageFormMainChannel, messageTemp);
            }
            (0, BrowserHelper_1.putWindowInWindowMap)(WinId_1.default.openPIPVideoBoxWindowUUID, openPIPVideoBoxWindowTemp);
        }
        else {
            openPIPVideoBoxWindowTemp.center();
            openPIPVideoBoxWindowTemp.setSize(320, 200);
            openPIPVideoBoxWindowTemp.setContentSize(320, 200);
            openPIPVideoBoxWindowTemp.show();
            openPIPVideoBoxWindowTemp.webContents.send(pipVideoMessageFormMainChannel, message);
        }
    }
    else if ("openVideoBox" == message.cmd) {
        openVideoBox(message);
    }
    else if ("videoBoxData" == message.cmd) {
        let openVideoBoxWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.openVideoBoxWindowUUID);
        if (!openVideoBoxWindowTemp) {
            return;
        }
        openVideoBoxWindowTemp.webContents.send(meetVideoMessageFormMainChannel, message);
    }
    else {
        let screenToolsWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
        if (!screenToolsWindowTemp) {
            return;
        }
        try {
            screenToolsWindowTemp.webContents.send(meetToolsMessageFormMainChannel, message);
        }
        catch (e) {
            console.error(e);
        }
    }
});
function createScreenShareWindow(message, aeroTheme) {
    let meetWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
    if (!meetWindowTemp) {
        return;
    }
    let useLocalTools = message.useLocalTools || 1;
    if (useLocalTools == 1) {
        useLocalTools = true;
    }
    else {
        useLocalTools = false;
    }
    let winWidthTemp = message.width;
    if (winWidthTemp) {
        winWidthTemp = parseInt(winWidthTemp);
    }
    else {
        winWidthTemp = 800;
    }
    let winHeightTemp = message.height;
    if (winHeightTemp) {
        winHeightTemp = parseInt(winHeightTemp);
    }
    else {
        winHeightTemp = 600;
    }
    let meetWinWidthTemp = message.shareWindowWidth;
    if (meetWinWidthTemp) {
        meetWinWidthTemp = parseInt(meetWinWidthTemp);
    }
    else {
        meetWinWidthTemp = 300;
    }
    let meetWinHeightTemp = message.shareWindowHeight;
    if (meetWinHeightTemp) {
        meetWinHeightTemp = parseInt(meetWinHeightTemp);
    }
    else {
        meetWinHeightTemp = 640;
    }
    let screenType = message.type || "1";
    let screenInfo = message.info || "";
    let screenToolsX = 0;
    let screenToolsY = 0;
    let shareWindowWidth = 0;
    let shareWindowHeight = 0;
    let moveMeetToOtherScreen = false;
    if (screenType == "1") {
        if (screenInfo && screenInfo.displayId) {
            screenToolsX = screenInfo.displayId.x;
            screenToolsY = screenInfo.displayId.y;
            shareWindowWidth = screenInfo.displayId.width || 0;
            shareWindowHeight = screenInfo.displayId.height || 0;
            if (electron_1.screen.getAllDisplays().length > 1) {
                moveMeetToOtherScreen = true;
            }
        }
    }
    else if (screenType == "2") {
        if (screenInfo && screenInfo.windowId) {
            screenToolsX = screenInfo.x;
            screenToolsY = screenInfo.y;
            shareWindowWidth = screenInfo.originWidth || screenInfo.width || 800;
            shareWindowHeight = screenInfo.originHeight || screenInfo.height || 600;
            if (electron_1.screen.getAllDisplays().length > 1) {
                moveMeetToOtherScreen = true;
            }
        }
    }
    let bestScreen;
    if (moveMeetToOtherScreen) {
        let allDisplays = electron_1.screen.getAllDisplays();
        let centerX = screenToolsX + shareWindowWidth / 2;
        let centerY = screenToolsY + shareWindowHeight / 2;
        let bestWeiget = 999999;
        for (let i = 0; i < allDisplays.length; i++) {
            let display = allDisplays[i];
            if (centerX >= display.bounds.x &&
                centerX <= display.bounds.x + display.bounds.width &&
                centerY >= display.bounds.y &&
                centerY <= display.bounds.y + display.bounds.height) {
                bestWeiget = 0;
                bestScreen = display;
                break;
            }
            if (bestWeiget == 1) {
                continue;
            }
            if ((centerX >= display.bounds.x &&
                centerX <= display.bounds.x + display.bounds.width) ||
                (centerY >= display.bounds.y &&
                    centerY <= display.bounds.y + display.bounds.height)) {
                bestWeiget = 1;
                bestScreen = display;
                continue;
            }
            let screenCenterX = display.bounds.x + display.bounds.width / 2;
            let screenCenterY = display.bounds.y + display.bounds.height / 2;
            let distance = Math.pow(centerX - screenCenterX, 2) +
                Math.pow(centerY - screenCenterY, 2);
            if (distance < bestWeiget) {
                bestWeiget = distance;
                bestScreen = display;
            }
        }
        let display;
        if (bestScreen == allDisplays[0]) {
            display = allDisplays[1];
        }
        else {
            display = allDisplays[0];
        }
        let displayBounds = display.bounds;
        let meetingRect = meetWindowTemp.getBounds();
        let moveX = displayBounds.x + (displayBounds.width - meetingRect.width) / 2;
        let moveY = displayBounds.y + (displayBounds.height - meetingRect.height) / 2;
        moveX = parseInt(moveX);
        moveY = parseInt(moveY);
        const meetWinSize = meetWindowTemp.getSize();
        meetWindowTemp.setPosition(moveX + 1, moveY + 1, false);
        if (process.platform == "win32" && (0, CommonUtil_1.hasDifferentScaleScreen)()) {
            setTimeout(() => {
                if (!meetWindowTemp.isDestroyed()) {
                    setWindowMinimumSize(meetWindowTemp, meetWinSize[0], meetWinSize[1]);
                    setWindowSize(meetWindowTemp, meetWinSize[0], meetWinSize[1]);
                    setWindowContentSize(meetWindowTemp, meetWinSize[0], meetWinSize[1]);
                }
            }, 10);
        }
        meetWindowTemp.show();
    }
    else {
        if (meetWindowTemp.isFullScreen() || meetWindowTemp.isSimpleFullScreen()) {
            meetWindowTemp.setFullScreen(false);
        }
        if (!message.pageUrl) {
            if (process.platform == "win32" && (0, CommonUtil_1.hasDifferentScaleScreen)()) {
                setTimeout(() => {
                    if (!meetWindowTemp.isDestroyed()) {
                        setWindowMinimumSize(meetWindowTemp, meetWinWidthTemp, meetWinHeightTemp);
                        setWindowSize(meetWindowTemp, meetWinWidthTemp, meetWinHeightTemp);
                        setWindowContentSize(meetWindowTemp, meetWinWidthTemp, meetWinHeightTemp);
                    }
                }, 10);
            }
            else {
                setWindowMinimumSize(meetWindowTemp, meetWinWidthTemp, meetWinHeightTemp);
                setWindowSize(meetWindowTemp, meetWinWidthTemp, meetWinHeightTemp);
                setWindowContentSize(meetWindowTemp, meetWinWidthTemp, meetWinHeightTemp);
            }
            meetWindowTemp.setResizable(false);
            let { width: screenWidth, height: screenHeight } = electron_1.screen.getPrimaryDisplay().workAreaSize;
            let moveX = screenWidth - screenWidth * 0.3;
            let moveY = screenHeight * 0.1;
            moveX = parseInt(moveX);
            moveY = parseInt(moveY);
            meetWindowTemp.setPosition(moveX, moveY, false);
            setTimeout(() => {
                if (meetWindowTemp &&
                    meetWindowTemp.webContents &&
                    !meetWindowTemp.isDestroyed()) {
                    meetWindowTemp.setAlwaysOnTop(true, "pop-up-menu");
                }
            }, 100);
        }
    }
    if (!bestScreen) {
        bestScreen = electron_1.screen.getAllDisplays()[0];
    }
    if (!aeroTheme) {
        winWidthTemp = 932;
        winHeightTemp = 88;
        screenToolsX = parseInt(bestScreen.bounds.x + (bestScreen.bounds.width - winWidthTemp) / 2);
        screenToolsY = bestScreen.bounds.y;
        showBoxInWin7 = true;
    }
    else {
        showBoxInWin7 = false;
    }
    if (screenType == "2") {
        let winDisplay = electron_1.screen.getDisplayMatching({
            x: screenToolsX,
            y: screenToolsY,
            width: winWidthTemp,
            height: winHeightTemp,
        });
        if (winDisplay?.bounds) {
            screenToolsX = winDisplay.bounds.x;
            screenToolsY = winDisplay.bounds.y;
            winWidthTemp = winDisplay.bounds.width;
            winHeightTemp = winDisplay.bounds.height;
        }
    }
    let winOpt = {
        width: winWidthTemp,
        height: winHeightTemp,
        x: screenToolsX,
        y: screenToolsY,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.screenToolsWindowUUID, "file://"),
        },
        frame: false,
        hasShadow: false,
        resizable: false,
        fullscreenable: true,
        skipTaskbar: true,
        show: false,
        transparent: !showBoxInWin7,
        roundedCorners: false,
        autoHideMenuBar: true,
        enableLargerThanScreen: true,
        extParams: {
            ketangFlag: true,
        },
    };
    if (process.platform == "darwin") {
        winOpt.type = "panel";
    }
    if (showBoxInWin7) {
        winOpt.backgroundColor = "#1D2840";
    }
    if (message.pageUrl) {
        winOpt.webPreferences.contextIsolation = true;
        winOpt.webPreferences.preload = (0, LoadUrlHelper_1.getPreloadJs)(winOpt.id, "file://");
    }
    let screenToolsWindow = (0, BrowserHelper_1.createBrowserWindow)(winOpt);
    message.screenToolsX = screenToolsX;
    message.screenToolsY = screenToolsY;
    message.bounds = {
        x: screenToolsX,
        y: screenToolsY,
        width: winWidthTemp,
        height: winHeightTemp,
    };
    return screenToolsWindow;
}
function getMeetingWindow() {
    let meetWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
    return meetWindowTemp;
}
function stopScreenShare() {
    let screenToolsWindow = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
    if (screenToolsWindow) {
        screenToolsWindow.close();
    }
    let meetWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
    if (meetWindowTemp) {
        meetWindowTemp.center();
        let meetWindowOptionsTemp = meetWindowTemp.webContents.browserOptions;
        meetWindowTemp.show();
        meetWindowTemp.setResizable(true);
        setTimeout(() => {
            if (getMeetingWindow() && !getMeetingWindow().isDestroyed()) {
                getMeetingWindow().show();
            }
        }, 100);
        if (process.platform == "win32" && (0, CommonUtil_1.hasDifferentScaleScreen)()) {
            setTimeout(() => {
                if (!meetWindowTemp.isDestroyed()) {
                    setWindowMinimumSize(meetWindowTemp, meetWindowOptionsTemp.minWidth, meetWindowOptionsTemp.minHeight);
                    console.info(`[MainProcessHelper]stopScreen:setMeetingWindowMinimumSize:width:${meetWindowOptionsTemp.minWidth},height:${meetWindowOptionsTemp.minHeight}`);
                    setWindowSize(meetWindowTemp, meetWindowOptionsTemp.width, meetWindowOptionsTemp.height);
                    console.info(`[MainProcessHelper]stopScreen:setMeetingWindoSize:width:${meetWindowOptionsTemp.width},height:${meetWindowOptionsTemp.height}`);
                    setWindowContentSize(meetWindowTemp, meetWindowOptionsTemp.width, meetWindowOptionsTemp.height);
                }
            }, 10);
        }
        else {
            setWindowMinimumSize(meetWindowTemp, meetWindowOptionsTemp.minWidth, meetWindowOptionsTemp.minHeight);
            console.info(`[MainProcessHelper]stopScreen:setMeetingWindowMinimumSize:width:${meetWindowOptionsTemp.minWidth},height:${meetWindowOptionsTemp.minHeight}`);
            setWindowSize(meetWindowTemp, meetWindowOptionsTemp.width, meetWindowOptionsTemp.height);
            console.info(`[MainProcessHelper]stopScreen:setMeetingWindoSize:width:${meetWindowOptionsTemp.width},height:${meetWindowOptionsTemp.height}`);
            setWindowContentSize(meetWindowTemp, meetWindowOptionsTemp.width, meetWindowOptionsTemp.height);
        }
        meetWindowTemp.setFullScreenable(true);
        meetWindowTemp.setMaximizable(true);
        meetWindowTemp.center();
    }
    let annotationWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.annotationUUID);
    if (annotationWin && !annotationWin.isDestroyed()) {
        annotationWin.close();
    }
    let whiteBoardWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.whiteBoardUUID);
    if (whiteBoardWin && !whiteBoardWin.isDestroyed()) {
        whiteBoardWin.close();
    }
    (0, BrowserHelper_1.delWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
}
exports.stopScreenShare = stopScreenShare;
function getMainWindow() {
    let win = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
    return win;
}
function setWindowSize(win, width, height) {
    if (win) {
        let workArea = electron_1.screen.getDisplayMatching(win.getBounds()).workArea;
        if (width > workArea.width) {
            width = workArea.width;
        }
        if (height > workArea.height) {
            height = workArea.height;
        }
        win.setSize(width, height);
    }
}
function setWindowMinimumSize(win, width, height) {
    if (win) {
        let workArea = electron_1.screen.getDisplayMatching(win.getBounds()).workArea;
        if (width > workArea.width) {
            width = workArea.width;
        }
        if (height > workArea.height) {
            height = workArea.height;
        }
        win.setMinimumSize(width, height);
    }
}
function setWindowContentSize(win, width, height) {
    if (win) {
        let workArea = electron_1.screen.getDisplayMatching(win.getBounds()).workArea;
        if (width > workArea.width) {
            width = workArea.width;
        }
        if (height > workArea.height) {
            height = workArea.height;
        }
        win.setContentSize(width, height);
    }
}
(0, BrowserHelper_1.onAnyWindowCreate)((win, winOptions) => {
    if (process.platform == "darwin") {
        const screenToolsWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
        if (screenToolsWin && !screenToolsWin.isDestroyed()) {
            win.setAlwaysOnTop(true, "pop-up-menu");
            win.setVisibleOnAllWorkspaces(true, {
                visibleOnFullScreen: true,
                skipTransformProcessType: false,
            });
            setTimeout(() => {
                electron_1.app.dock.show();
            }, 300);
        }
    }
    let shareFlag = false;
    if (!shareFlag && winOptions) {
        let showOnScreenShare = winOptions.showOnScreenShare;
        if (showOnScreenShare != undefined) {
            shareFlag = true;
            showWindowOnScreenShare(win, showOnScreenShare);
        }
    }
    if (!shareFlag && winOptions.id) {
        if (winOptions.id == WinId_1.default.openVideoBoxWindowUUID ||
            winOptions.id == WinId_1.default.openPIPVideoBoxWindowUUID) {
            showWindowOnScreenShare(win, true);
        }
    }
    if (!shareFlag) {
        win.webContents.on("did-start-navigation", (event, url) => {
            if (url) {
                let showOnScreenShare = getUrlParamValue(url, "showOnScreenShare");
                if (showOnScreenShare != undefined) {
                    if (showOnScreenShare === "false") {
                        showWindowOnScreenShare(win, showOnScreenShare);
                    }
                    else {
                        win.webContents.once("did-finish-load", (event, url2) => {
                            if (!url2) {
                                url2 = win.webContents.getURL();
                            }
                            let showOnScreenShare2 = getUrlParamValue(url2, "showOnScreenShare");
                            if (showOnScreenShare2 === "true") {
                                showWindowOnScreenShare(win, showOnScreenShare2);
                            }
                        });
                    }
                }
            }
        });
        if (process.platform == "darwin") {
            let meetWin = getMeetingWindow();
            if (meetWin &&
                !meetWin.isDestroyed() &&
                win.getParentWindow() == meetWin &&
                meetWin.isAlwaysOnTop()) {
                win.setAlwaysOnTop(true, "pop-up-menu");
            }
        }
    }
    win.on("closed", () => {
        windowMapChangeListening();
    });
    windowMapChangeListening();
});
function getUrlParamValue(url, param) {
    if (url && param) {
        let index = url.indexOf("?");
        if (index != -1) {
            let urlsearch = url.substr(index + 1);
            let pstr = urlsearch.split("&");
            for (let i = pstr.length - 1; i >= 0; i--) {
                let tep = pstr[i].split("=");
                if (tep[0] == param) {
                    return tep[1];
                }
            }
        }
    }
    return undefined;
}
function windowMapChangeListening() {
    let meetWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
    if (meetWindowTemp &&
        !meetWindowTemp.isDestroyed() &&
        meetWindowTemp.webContents) {
        let allWindowIds = new Array();
        let windowIds = new Array();
        initWindowIds(allWindowIds, windowIds);
        let message = {
            cmd: "windowMapChange",
            windowIds: windowIds,
            allWindowIds: allWindowIds,
        };
        meetWindowTemp.webContents.send(meetToolsFormMainChannel, message);
        if (appconfig.appMode == "fanya") {
            setTimeout(() => {
                if (meetWindowTemp &&
                    !meetWindowTemp.isDestroyed() &&
                    meetWindowTemp.webContents) {
                    meetWindowTemp.webContents.send(meetToolsFormMainChannel, message);
                }
            }, 2000);
        }
    }
}
function initWindowIds(allWinId, excludeWinIdOnShare) {
    let allAppWindows = electron_1.BrowserWindow.getAllWindows();
    for (let win of allAppWindows) {
        if ((0, AppSystemConfigMainHelper_1.getAppSystemConfig)().appMode == "normal") {
            let winExtInfo = (0, BrowserHelper_1.getWindowExtInfoByWin)(win);
            if (!winExtInfo?.ketangFlag) {
                continue;
            }
        }
        let sourceId = win.getMediaSourceId();
        let winId = parseInt(sourceId.split(":")[1]);
        if (allWinId) {
            allWinId.push(winId);
        }
        if (excludeWinIdOnShare) {
            if (m_showWindowArrayOnScreenShare.indexOf(sourceId) < 0) {
                if (winId > 0) {
                    excludeWinIdOnShare.push(winId);
                }
            }
        }
    }
}
function showWindowOnScreenShare(win, isShow) {
    if (!win) {
        return;
    }
    let sourceId = win.getMediaSourceId();
    let index = m_showWindowArrayOnScreenShare.indexOf(sourceId);
    if (isShow !== "false" && isShow !== false) {
        if (index < 0) {
            m_showWindowArrayOnScreenShare.push(sourceId);
        }
    }
    else {
        if (index >= 0) {
            m_showWindowArrayOnScreenShare.splice(index, 1);
        }
    }
    windowMapChangeListening();
}
function openVideoBox(args) {
    let openVideoBoxWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.openVideoBoxWindowUUID);
    if (args.close) {
        if (openVideoBoxWindowTemp && !openVideoBoxWindowTemp.isDestroyed()) {
            openVideoBoxWindowTemp.close();
        }
        return;
    }
    const video_uid = args.uid;
    if (typeof video_uid == "undefined") {
        return;
    }
    let width = args.width || 800;
    let height = (args.height || 600) + 30;
    if (openVideoBoxWindowTemp && !openVideoBoxWindowTemp.isDestroyed()) {
        openVideoBoxWindowTemp.webContents.send("updateVideoId", { video_uid });
        let winSize = openVideoBoxWindowTemp.getSize();
        if (winSize[0] < width || winSize[1] < height) {
            openVideoBoxWindowTemp.setSize(width, height);
        }
    }
    else {
        openVideoBoxWindowTemp = (0, BrowserHelper_1.createBrowserWindow)({
            id: WinId_1.default.openVideoBoxWindowUUID,
            width: width,
            height: height,
            webPreferences: {
                preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.openVideoBoxWindowUUID, "file://"),
                contextIsolation: true,
            },
            minWidth: 400,
            minHeight: 330,
            frame: false,
            center: true,
            maximizable: true,
            minimizable: true,
            resizable: true,
            alwaysOnTop: true,
            transparent: true,
            autoHideMenuBar: true,
            title: "视屏窗口",
            extParams: {
                ketangFlag: true,
            },
        });
        openVideoBoxWindowTemp.on("closed", function () {
            let meetingWin = getMeetingWindow();
            if (meetingWin && !meetingWin.isDestroyed()) {
                meetingWin.webContents.send("videoBoxClosed", video_uid);
            }
            (0, BrowserHelper_1.delWindowInWindowMap)(WinId_1.default.openVideoBoxWindowUUID);
        });
        openVideoBoxWindowTemp.webContents.on("did-finish-load", () => {
            openVideoBoxWindowTemp.webContents.send("pageLoadFinish", {
                video_uid: video_uid,
            });
        });
        openVideoBoxWindowTemp.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(`hview://videoBox.html`));
        console.info("[MainProcessHelper][new-window]新视图:打开视频双击窗口:url:view/videoBox.html");
        (0, BrowserHelper_1.putWindowInWindowMap)(WinId_1.default.openVideoBoxWindowUUID, openVideoBoxWindowTemp);
    }
}
electron_1.ipcMain.handle("_startRecordScreen", (event, args) => {
    return new Promise((resolve, reject) => {
        m_EventEmitter.once("recordScrennFinished", (data) => {
            let win1 = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenRecordUUID);
            if (win1 && !win1.isDestroyed()) {
                win1.close();
            }
            let win2 = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenRecordControlUUID);
            if (win2 && !win2.isDestroyed()) {
                win2.close();
            }
            if (!fs_1.default.existsSync(data.filePath)) {
                resolve(undefined);
                return;
            }
            uploadFile(args.uploadUrl, data.filePath).then((result) => {
                if (result) {
                    result.filePath = data.filePath;
                }
                resolve(result);
            });
        });
        let tempWin = getMeetingWindow();
        if (!tempWin || tempWin.isDestroyed()) {
            resolve(undefined);
            return;
        }
        let display = electron_1.screen.getDisplayMatching(tempWin.getBounds());
        let screenBounds = display.bounds;
        let win = (0, BrowserHelper_1.createBrowserWindow)({
            id: WinId_1.default.screenRecordUUID,
            x: screenBounds.x,
            y: screenBounds.y,
            width: screenBounds.width,
            height: screenBounds.height,
            fullscreen: process.platform == "darwin" ? undefined : true,
            enableLargerThanScreen: true,
            frame: false,
            hasShadow: false,
            resizable: false,
            alwaysOnTop: true,
            skipTaskbar: true,
            transparent: true,
            webPreferences: {
                nodeIntegration: true,
                preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.screenRecordUUID, "file://"),
            },
        });
        win.setAlwaysOnTop(true, "screen-saver");
        win.setIgnoreMouseEvents(true, { forward: true });
        win.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(`hview://screenRecord.html`));
        let winCtrl = (0, BrowserHelper_1.createBrowserWindow)({
            id: WinId_1.default.screenRecordControlUUID,
            x: screenBounds.x + screenBounds.width - 600,
            y: screenBounds.y + 100,
            width: 179,
            height: 40,
            frame: false,
            hasShadow: false,
            resizable: false,
            alwaysOnTop: true,
            skipTaskbar: true,
            transparent: true,
            webPreferences: {
                nodeIntegration: true,
                preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.screenRecordControlUUID, "file://"),
            },
        });
        winCtrl.setAlwaysOnTop(true, "screen-saver");
        winCtrl.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(`hview://creenRecordCtrl.html`));
        winCtrl.webContents.on("did-finish-load", () => {
            let screenRecordPath = path_1.default.join(electron_1.app.getPath("userData"), "Cache/screenRecord/");
            if (!fs_1.default.existsSync(screenRecordPath)) {
                fs_1.default.mkdirSync(screenRecordPath, { recursive: true });
            }
            electron_1.desktopCapturer.getSources({ types: ["screen"] }).then((desktops) => {
                for (let desktop of desktops) {
                    if (desktop.display_id == display.id + "") {
                        winCtrl.webContents.send("ready", {
                            screenId: desktop.id,
                            screenRecordPath: screenRecordPath,
                        });
                        break;
                    }
                }
            });
        });
    });
});
electron_1.ipcMain.on("_recordScrennFinished", (event, data) => {
    return m_EventEmitter.emit("recordScrennFinished", data);
});
function uploadFile(url, filePath) {
    let pms = new Promise((resolve, reject) => {
        if (!filePath || !fs_1.default.existsSync(filePath)) {
            console.error(`filePath is empty`);
            return;
        }
        if (!url) {
            console.error(` url is empty`);
            return;
        }
        console.log("start upload:", url);
        let request = electron_1.net.request({ url, method: "POST", useSessionCookies: true });
        const boundaryKey = "--" + Math.random().toString(16);
        request.setHeader("Content-Type", "multipart/form-data; boundary=" + boundaryKey);
        request.setHeader("Connection", "keep-alive");
        let fileName = path_1.default.basename(filePath);
        request.write(`--${boundaryKey}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\n\r\n`);
        request.on("response", (response) => {
            response.on("data", (result) => {
                console.log(`BODY: ${result}`);
                try {
                    result = JSON.parse(result);
                    resolve(result);
                }
                catch (e) { }
            });
            response.on("end", () => {
                console.log("响应中已无数据");
            });
        });
        let stream = fs_1.default.createReadStream(filePath, { encoding: "binary" });
        stream.on("data", (chunk) => {
            request.write(chunk);
        });
        stream.on("end", () => {
            request.end("\r\n--" + boundaryKey + "--\r\n");
        });
    });
    return pms;
}
function createSysStoreCfg() {
    if (process.platform == "darwin") {
        return;
    }
    let classromm = StoreHelper_1.default.getSystem().get("wisdomId");
    if (!classromm) {
        StoreHelper_1.default.getSystem().set("wisdomId", "");
    }
}
electron_1.ipcMain.handle("_sendVideoRowDatas", (event, info, toContentsIds) => {
    if (!toContentsIds || toContentsIds.length == 0) {
        return null;
    }
    let errContentsIds = [];
    for (let i = 0; i < toContentsIds.length; i++) {
        let toContentsId = toContentsIds[i];
        try {
            let contents;
            let allContents = electron_1.webContents.getAllWebContents();
            for (let j = 0; j < allContents.length; j++) {
                let wContents = allContents[j];
                if (toContentsId == wContents.id) {
                    contents = wContents;
                    break;
                }
            }
            if (contents) {
                contents.send("_sendVideoRowDatas", info);
            }
            else {
                errContentsIds.push(toContentsId);
            }
        }
        catch (e) { }
    }
    return errContentsIds;
});
electron_1.ipcMain.on("_initVideoRowDatasRender", (event, uid, videoType) => {
    if (getMeetingWindow()) {
        getMeetingWindow().webContents.send("_initVideoRowDatasRender", uid, event.sender.id, videoType);
    }
});
electron_1.ipcMain.on("_destroyVideoRowDatasRender", (event, uid) => {
    if (getMeetingWindow()) {
        getMeetingWindow().webContents.send("_destroyVideoRowDatasRender", uid, event.sender.id);
    }
});
electron_1.ipcMain.handle("_getAppName", (event) => {
    return electron_1.app.getName();
});
electron_1.ipcMain.on("meetTools", function (sys, message) {
    if (!message || !message.cmd) {
        return;
    }
    let meetWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
    if (!meetWindowTemp) {
        return;
    }
    meetWindowTemp.webContents.send(meetToolsFormMainChannel, message);
});
electron_1.ipcMain.on("meetChoses", function (sys, message) {
    if (!message || !message.cmd) {
        return;
    }
    let meetWindowTemp = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
    if (!meetWindowTemp) {
        return;
    }
    if ("startScreenByChose" == message.cmd) {
        if (meetWindowTemp.isFullScreen()) {
            meetWindowTemp.setFullScreen(false);
        }
        if (meetWindowTemp.isMaximized()) {
            meetWindowTemp.unmaximize();
        }
    }
    meetWindowTemp.webContents.send(meetToolsFormMainChannel, message);
});
electron_1.ipcMain.on("speechTools", function (sys, message) {
    if (!message || !message.cmd) {
        return;
    }
    if ("start" == message.cmd) {
        let language = message.language || "zh";
        openSpeechExeBox(language, message.type, message.sdkType);
    }
    else if ("stop" == message.cmd) {
        closeSpeechExeBox();
    }
});
electron_1.ipcMain.handle("_isSpeechBoxRun", (event) => {
    let win;
    win = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.speechRecognitionUUID);
    if (win && !win.isDestroyed()) {
        return true;
    }
    else {
        return false;
    }
});
function openSpeechExeBox(language, type, sdkType) {
    let languageArg = "zh";
    console.log("languagelanguagelanguage", language);
    if (typeof language !== "undefined" && language == "en") {
        languageArg = "en";
    }
    console.log("languageArg", languageArg);
    let win = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.speechRecognitionUUID);
    if (win && !win.isDestroyed()) {
        win.show();
        return;
    }
    const { width, height } = electron_1.screen.getPrimaryDisplay().workAreaSize;
    const windowWidth = 1200;
    const windowHeight = 165;
    const x = (width - windowWidth) / 2;
    const y = height - windowHeight;
    win = (0, MainHelper_1.openNewWindow)(undefined, {
        url: `hview://sameTranslate.html`,
        options: {
            id: WinId_1.default.speechRecognitionUUID,
            width: windowWidth,
            height: windowHeight,
            minWidth: 800,
            minHeight: 165,
            frame: false,
            transparent: true,
            resizable: false,
            alwaysOnTop: false,
            x: x,
            y: y,
        },
        data: { type, sdkType },
    });
    win.setAlwaysOnTop(true, "pop-up-menu");
    if (win && !win.isDestroyed()) {
        win.on("closed", () => {
            console.log("关闭语音识别", win);
            closeTranslateSetting();
            let meetingWin = getMeetingWindow();
            if (meetingWin && !meetingWin.isDestroyed()) {
                meetingWin.webContents.send("speechBoxExit");
            }
        });
    }
}
function closeSpeechExeBox() {
    let win = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.speechRecognitionUUID);
    console.log("关闭语音识别", win);
    if (win && !win.isDestroyed()) {
        win.close();
    }
}
function closeTranslateSetting() {
    let win = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.translateSettingUUID);
    if (win && !win.isDestroyed()) {
        win.close();
    }
}
function openTranslateSetting() {
    let pWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.speechRecognitionUUID);
    (0, MainHelper_1.openNewWindow)(undefined, {
        url: `hview://translateSetting.html`,
        options: {
            id: WinId_1.default.translateSettingUUID,
            parent: pWin,
            width: 740,
            height: 650,
            frame: false,
            transparent: true,
            resizable: false,
        },
    });
}
electron_1.ipcMain.on("_openTranslateSet", () => {
    openTranslateSetting();
});
function closeWindowById(id) {
    let tempWin = (0, BrowserHelper_1.getWindowInWindowMap)(id);
    if (tempWin && !tempWin.isDestroyed()) {
        tempWin.destroy();
    }
}
(0, BrowserHelper_1.onWindowCreate)(WinId_1.default.meetWindowUUID, (win) => {
    if (win && !win.isDestroyed()) {
        win.on("closed", () => {
            closeWindowById("meetFloatingBall");
            closeWindowById(WinId_1.default.screenToolsWindowUUID);
            closeWindowById("activePopWindow");
        });
        win.on("minimize", (event) => {
            win.webContents.send("winStateChanged", "minimize");
        });
        win.on("maximize", () => {
            win.webContents.send("winStateChanged", "maximize");
        });
        win.on("restore", () => {
            win.webContents.send("winStateChanged", "restore");
        });
        win.on("show", () => {
            win.webContents.send("winStateChanged", "show");
            let screenToolsWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
            if (screenToolsWin && !screenToolsWin.isDestroyed()) {
                screenToolsWin.webContents.send("hide_expandBtn");
            }
        });
        win.on("hide", () => {
            win.webContents.send("winStateChanged", "hide");
        });
        if (process.platform == "darwin") {
            win.setWindowButtonVisibility(true);
            win.on("enter-full-screen", () => {
                setTimeout(() => {
                    if (!win.isDestroyed() && !win.isAlwaysOnTop()) {
                        win.setAlwaysOnTop(true, "pop-up-menu");
                        setTimeout(() => {
                            if (!win.isDestroyed()) {
                                win.setAlwaysOnTop(false);
                            }
                        }, 1000);
                    }
                }, 2500);
            });
            win.webContents.on("dom-ready", () => {
                win.webContents.send("visibleMacWindowButton", false);
            });
        }
        win.on("close", (event) => {
            event.preventDefault();
            let wContents = win.webContents;
            if (wContents.getURL()) {
                let tempUrl = new URL(wContents.getURL());
                if (tempUrl.hostname.endsWith("chaoxing.com")) {
                    let jsCode = `window.dispatchEvent(new CustomEvent("beforeunload",{cancelable:true}))`;
                    wContents.executeJavaScript(jsCode).then((result) => {
                        if (result) {
                            win.destroy();
                        }
                    });
                }
            }
        });
    }
});
(0, BrowserHelper_1.onWindowCreate)("activePopWindow", (win) => {
    if (process.platform == "darwin") {
        if (win && !win.isDestroyed()) {
            let meetWindow = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
            if (meetWindow && !meetWindow.isDestroyed()) {
                if (meetWindow.isVisible() &&
                    meetWindow.isFullScreen() &&
                    meetWindow.isFocused()) {
                    return;
                }
            }
            win.setVisibleOnAllWorkspaces(true, {
                visibleOnFullScreen: true,
                skipTransformProcessType: false,
            });
            win.setAlwaysOnTop(true, "pop-up-menu");
            setTimeout(() => {
                electron_1.app.dock.show();
            }, 300);
        }
    }
});
(0, BrowserHelper_1.onBeforeWindowCreate)("activePopWindow", (event, options, fromWin) => {
    if (process.platform == "darwin") {
        let meetWindow = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
        if (meetWindow && !meetWindow.isDestroyed()) {
            if (meetWindow.isVisible() &&
                meetWindow.isFullScreen() &&
                meetWindow.isFocused()) {
                options.parent = meetWindow;
                options.fullscreen = false;
                options.simpleFullscreen = false;
                options.fullscreenable = false;
            }
        }
    }
});
electron_1.ipcMain.on("_showImage", (event, args) => {
    let fromWin = electron_1.BrowserWindow.fromWebContents(event.sender);
    let id = WinId_1.default.classImagePreviewUUID;
    let tempWin = (0, BrowserHelper_1.getWindowInWindowMap)(id);
    if (tempWin && !tempWin.isDestroyed()) {
        tempWin.webContents.send("updateShowImgUrl", args);
        tempWin.show();
        return;
    }
    args.width = args.width || 800;
    args.height = args.height || 600;
    const meetingWindow = getMeetingWindow();
    let parent = undefined;
    if (meetingWindow && meetingWindow.isAlwaysOnTop()) {
        parent = meetingWindow;
    }
    let viewWindowConfig = {
        width: args.width,
        height: args.height + 30,
        frame: false,
        customUUID: id,
        id: id,
        parent: parent,
        webPreferences: {
            preload: (0, LoadUrlHelper_1.getPreloadJs)(id, "file://"),
            contextIsolation: true,
            enableRemoteModule: true,
        },
    };
    let viewWindow = (0, BrowserHelper_1.createBrowserWindow)(viewWindowConfig, fromWin);
    viewWindow.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(`hview://imgPreview.html`));
    console.info("[MainProcessHelper][new-window]新视图:打开图片预览页:url:view/imgPreview.html");
    viewWindow.webContents.on("did-stop-loading", () => {
        viewWindow.webContents.send("pageLoadFinish", args);
    });
    showWindowOnScreenShare(viewWindow, false);
});
electron_1.ipcMain.on("_showVideo", (event, args) => {
    let fromWin = electron_1.BrowserWindow.fromWebContents(event.sender);
    args.width = args.width || 800;
    args.height = args.height || 600;
    let id = WinId_1.default.videoPreviewUUID;
    const meetingWindow = getMeetingWindow();
    let parent = undefined;
    if (meetingWindow && meetingWindow.isAlwaysOnTop()) {
        parent = meetingWindow;
    }
    let viewWindowConfig = {
        width: args.width,
        height: args.height + 30,
        frame: false,
        customUUID: id,
        parent: parent,
        webPreferences: {
            preload: (0, LoadUrlHelper_1.getPreloadJs)(id, "file://"),
            contextIsolation: true,
            enableRemoteModule: true,
        },
    };
    let viewWindow = (0, BrowserHelper_1.createBrowserWindow)(viewWindowConfig, fromWin);
    viewWindow.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(`hview://videoPreview.html`));
    console.info("[MainProcessHelper][new-window]新视图:打开视频播放页:url:view/videoPreview.html");
    viewWindow.webContents.on("did-stop-loading", () => {
        viewWindow.webContents.send("pageLoadFinish", args);
    });
    showWindowOnScreenShare(viewWindow, false);
});
electron_1.ipcMain.on("_setWindowBounds", (event, data) => {
    if (data.width <= 0 || data.height <= 0) {
        return;
    }
    let win;
    if (data.winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(data.winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        win.setBounds({
            x: Math.floor(data.x),
            y: Math.floor(data.y),
            width: Math.floor(data.width),
            height: Math.floor(data.height),
        });
    }
});
electron_1.ipcMain.handle("_getWindowBounds", (event, winId) => {
    let win;
    if (winId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(winId);
    }
    else {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    if (win && !win.isDestroyed()) {
        return win.getBounds();
    }
});
function createKetangMainWindow() {
    console.info("[MainProcessHelper][createMainWindow]初始化渲染窗口");
    let windowUUID = WinId_1.default.MainWindow;
    const mainWindow = (0, MainHelper_1.openNewWindow)(null, {
        url: "hview://loding.html",
        options: {
            id: windowUUID,
            width: 375,
            height: 667,
            fullscreenable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: (0, LoadUrlHelper_1.getPreloadJs)(windowUUID, appconfig.fyketang.domain),
            },
        },
    });
    mainWindow.webContents.on("did-stop-loading", () => {
        if (mainWindow.webContents.getURL().startsWith("file:")) {
            mainWindow.webContents.loadURL(`${appconfig.fyketang.domain}/pc/meet/index?v=v2&windowWidth=375&windowHeight=667&canDragWindowSize=false&canMaximizeWindow=false`);
        }
    });
    mainWindow.webContents.loadURL((0, LoadUrlHelper_1.getUrl)("hview://loding.html"));
    return mainWindow;
}
exports.createKetangMainWindow = createKetangMainWindow;
electron_1.ipcMain.on("_clearAudioDump", (event) => {
    const agoraLogPath = path_1.default.join(electron_1.app.getPath("logs"), "agora");
    if (fs_1.default.existsSync(agoraLogPath)) {
        const files = fs_1.default.readdirSync(agoraLogPath);
        files.forEach((file) => {
            if (file.endsWith(".wav")) {
                const wavFile = path_1.default.join(agoraLogPath, file);
                fs_1.default.unlinkSync(wavFile);
            }
        });
    }
});
electron_1.ipcMain.on("downloadSetupFile", (event, data) => {
    let winHeight = 135;
    if (process.platform === "darwin") {
        winHeight = 150;
    }
    const winOptions = {
        pWindowId: WinId_1.default.MainWindow,
        width: 410,
        height: winHeight,
        frame: false,
        transparent: true,
        modal: true,
    };
    let win = (0, MainHelper_1.openNewWindow)(undefined, {
        url: `hview://downloadSetup.html`,
        options: winOptions,
    });
    if (win) {
        if ((0, MainHelper_1.getTempStore)("fudanUpdate")) {
            win.webContents.on("did-finish-load", () => {
                win.webContents.send("ready", { flag: "fudan" });
            });
        }
        (0, UpdateUtil_1.downloadSetupFile)(data.url, (curProgress, totalSize) => {
            if (!win.isDestroyed()) {
                win.webContents.send("downloadSetupFileState", {
                    state: "updated",
                    receivedBytes: curProgress,
                    totalBytes: totalSize,
                });
            }
        })
            .then((ret) => {
            if (!ret || ret.result <= 0) {
                if (!win.isDestroyed()) {
                    win.webContents.send("downloadSetupFileState", {
                        state: "failed",
                    });
                }
            }
            else {
                win.webContents.send("downloadSetupFileState", {
                    state: "completed",
                });
            }
        })
            .catch(() => {
            if (!win.isDestroyed()) {
                win.webContents.send("downloadSetupFileState", {
                    state: "failed",
                });
            }
        });
    }
});
electron_1.ipcMain.on("downloadSetupFileCancel", (event) => {
    (0, UpdateUtil_1.cancelDownloadSetupFile)();
});
async function getSystemPerformance() {
    let appMetrics = await (0, DevHelper_1.checkAppMetrics)();
    let sytemPerformance = appMetrics.sysInfo;
    let proMetrics = appMetrics.proMetrics;
    for (let proMetric of proMetrics) {
        if (proMetric.webTag == WinId_1.default.meetWindowUUID) {
            sytemPerformance.ketangCpu = proMetric.cpu.percentCPUUsage;
            sytemPerformance.ketangMemory = proMetric.memory.workingSetSize;
            break;
        }
    }
    return sytemPerformance;
}
electron_1.ipcMain.handle("_getSystemPerformance", (event) => {
    return getSystemPerformance();
});
function handleScreenShareInfo(type, info) {
    if ((0, AppSystemConfigMainHelper_1.getAppSystemConfig)().appMode != "normal") {
        return;
    }
    type += "";
    if (type == "1") {
        (0, MainHelper_1.setTempStore)(StoreKey_1.StoreKey.rtcScreenShareContainMainWindow, true);
    }
    else if (info) {
        let winHandleId = info.windowId;
        if (winHandleId) {
            let win = (0, BrowserHelper_1.getWindowByHandleId)(winHandleId);
            if (win == getMainWindow()) {
                (0, MainHelper_1.setTempStore)(StoreKey_1.StoreKey.rtcScreenShareContainMainWindow, true);
                return;
            }
        }
        (0, MainHelper_1.setTempStore)(StoreKey_1.StoreKey.rtcScreenShareContainMainWindow, false);
    }
}
electron_1.ipcMain.on("_startScreenShare", (event, type, info) => {
    handleScreenShareInfo(type, info);
});
let changeScreenTimer;
EventUtil_1.EventUtil.on("display-metrics-changed", (display, changedMetrics) => {
    if (process.platform != "win32") {
        return;
    }
    if (changeScreenTimer) {
        clearTimeout(changeScreenTimer);
    }
    changeScreenTimer = setTimeout(() => {
        let screenToolsWindow = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.screenToolsWindowUUID);
        if (screenToolsWindow && !screenToolsWindow.isDestroyed()) {
            screenToolsWindow.setFullScreen(true);
        }
        changeScreenTimer = undefined;
    }, 300);
});
electron_1.ipcMain.on("_openMeetingBySwitch", (event, parms) => {
    let { url, options, data } = parms;
    let meetWindow = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
    if (meetWindow && !meetWindow.isDestroyed()) {
        meetWindow.destroy();
    }
    setTimeout(() => {
        (0, OpenketangProtocolHepler_1.openMeeting)(url, options, data);
    }, 200);
});
module.exports = { createSysStoreCfg, stopScreenShare, createKetangMainWindow };
//# sourceMappingURL=KetangMainHelper.js.map