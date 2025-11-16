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
const electron_1 = require("electron");
const promises_1 = __importDefault(require("fs/promises"));
const crypto_1 = __importDefault(require("crypto"));
const AutoStartSetHelper_1 = require("./AutoStartSetHelper");
function decrypt(encryptedText) {
    const key = "R2tPqkz3G8sL6wF7";
    const decipher = crypto_1.default.createDecipheriv("aes-128-ecb", key, "");
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
let debugState = 0;
const proArgsV = process.argv;
if (proArgsV.length > 1) {
    for (let i = 1; i < proArgsV.length; i++) {
        if (proArgsV[i].startsWith("--inspect") ||
            proArgsV[i].startsWith("--remote-debugging-port=")) {
            if (debugState == 0) {
                debugState = 1;
            }
        }
        else if (proArgsV[i].startsWith("--cx_env=")) {
            debugState = 1;
            try {
                const envData = proArgsV[i].substring("--cx_env=".length);
                const envText = decrypt(envData);
                if (!envText.startsWith("chaoxing_")) {
                    break;
                }
                const debugTime = parseInt(envText.substring("chaoxing_".length));
                const curTime = new Date().getTime();
                const timeGap = curTime - debugTime;
                if (timeGap >= 0 && timeGap < 5000) {
                    debugState = 2;
                }
                break;
            }
            catch (e) {
                console.error(e);
            }
        }
        else if (proArgsV[i].startsWith("--autoStartAtLogin=")) {
            const autoStart = proArgsV[i].substring("--autoStartAtLogin=".length) == "true";
            (0, AutoStartSetHelper_1.setAutoStart)(autoStart);
            electron_1.app.exit();
            return;
        }
    }
}
if (debugState == 1) {
    electron_1.app.exit();
    return;
}
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    if (process.platform == "darwin") {
        child_process_1.default.execSync(`killall Dock`);
    }
    console.warn("应用正在运行，退出本次启动");
    electron_1.app.quit();
    return;
}
electron_1.app.setPath("crashDumps", path_1.default.join(electron_1.app.getPath("logs"), "crash"));
const CrashReportMainHelper_1 = require("./CrashReportMainHelper");
(0, CrashReportMainHelper_1.startCrashReporter)();
const events_1 = __importDefault(require("events"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const _logger = require("./Logger");
const logUpload = require("./LogUpload");
_logger.getMainLog().replaceConsole(console);
console.log("proArgsV:", JSON.stringify(proArgsV));
const BrowserHelper_1 = require("./BrowserHelper");
const SessionCookie_1 = __importDefault(require("./SessionCookie"));
const MainHelper_1 = require("./MainHelper");
const StoreHelper_1 = __importDefault(require("./StoreHelper"));
const UserHelper_1 = __importStar(require("./UserHelper"));
const TabHelper_1 = __importStar(require("./TabHelper"));
const { PassportGenOut } = require("../out/gen/PassportGenOut");
const { MeetOut } = require("../out/meet/MeetOut");
const WinId_1 = __importDefault(require("../common/WinId"));
const WindowTabHelper = require("./WindowTabHelper");
const TrayHelper_1 = __importStar(require("./TrayHelper"));
const UpdateUtil_1 = require("./UpdateUtil");
require("./notice/NoticeHelper");
require("./blacklist/BlacklistHelper");
const { ContactsOut } = require("../out/contacts/ContactsOut");
const { StructureOut } = require("../out/structure/StructureOut");
const TabPanelHelper_1 = require("./TabPanelHelper");
let DownloadHelper = require("./DownloadMainHelper");
const url_1 = require("url");
const LoadUrlHelper_1 = require("./LoadUrlHelper");
const ResRecentHelper = require("./ResRecentHelper");
const KetangMainHelper = require("./KetangMainHelper");
const BrowserProtocolHelper = require("./BrowserProtocolHelper");
const ImageCache_1 = require("./ImageCache");
const audioCache_1 = require("./audioCache");
const fs_1 = __importDefault(require("fs"));
const appConfig = require("../config/appconfig");
require("./DataCacheHelper");
const OpenketangProtocolHepler_1 = require("./OpenketangProtocolHepler");
const TokenUtil_1 = require("../utils/TokenUtil");
const DateUtil_1 = require("../utils/DateUtil");
const DevHelper_1 = require("./DevHelper");
const ContactsDbMainHelper_1 = require("./contacts/ContactsDbMainHelper");
const ContactsHelper = __importStar(require("./contacts/ContactsMainHelper"));
const NoticeDbHelper_1 = require("./notice/NoticeDbHelper");
const BlacklistDbHelper_1 = require("./blacklist/BlacklistDbHelper");
const NoticeHelper_1 = __importDefault(require("./notice/NoticeHelper"));
const BlacklistHelper_1 = __importDefault(require("./blacklist/BlacklistHelper"));
const FileUtil_1 = require("../utils/FileUtil");
const MsgImgMigrationHelper_1 = require("./MsgImgMigrationHelper");
const ClearFileHelper_1 = require("./ClearFileHelper");
const FanyaMainHelper_1 = require("./blackboard/FanyaMainHelper");
const LogUpload_1 = require("./LogUpload");
const KetangMainHelper_1 = require("./KetangMainHelper");
require("./VolumePluginMain");
require("./ReadAloudMainHelper");
require("./RobotAnswerMainHelper");
require("./CertificateHelper");
require("./StorageMainHelper");
const os_1 = __importDefault(require("os"));
const HIDBlackMainHelper_1 = require("./HIDBlackMainHelper");
require("./TabOperHelper");
const AppSystemConfigMainHelper_1 = require("./AppSystemConfigMainHelper");
require("./EncryMainHelper");
require("./MainWindowPopHelper");
const MainWindowPopHelper_1 = require("./MainWindowPopHelper");
require("./ai/asr/AiAsrMainHelper");
const EventUtil_1 = require("../utils/EventUtil");
const DatabaseFolderMoveHelper_1 = require("./dataMigration/DatabaseFolderMoveHelper");
require("./im/AudioVideoCallMainHelper");
const AudioVideoCallMainHelper_1 = require("./im/AudioVideoCallMainHelper");
require("../module/projection/main/ProjectionBoxMainHelper");
const DialogMainHelper_1 = require("./DialogMainHelper");
const LoginMainHelper_1 = require("./LoginMainHelper");
const ProjectionBoxMainHelper_1 = require("../module/projection/main/ProjectionBoxMainHelper");
const FileMainHelper_1 = require("./FileMainHelper");
const WebRequestHelper_1 = require("./WebRequestHelper");
const ScreenshotMainHelper_1 = require("./ScreenshotMainHelper");
const UaUtils_1 = require("../utils/UaUtils");
const SessionCookie_2 = require("./SessionCookie");
const DeviceUtil_1 = require("../utils/DeviceUtil");
const CommonUtil_1 = require("../utils/CommonUtil");
const WindowTabHelper_1 = require("./WindowTabHelper");
require("./RobotMainHelper");
const { AccountUtil } = require("../utils/AccountUtil");
const DragMainHelper_1 = require("./DragMainHelper");
const m_EventEmitObj = new events_1.default();
let screenPermissions;
if (process.platform == "darwin") {
    screenPermissions = require("mac-screen-capture-permissions");
}
let defaultShortcut = "Alt + Shift + A";
if (process.platform == "darwin") {
    defaultShortcut = "Command + Option + A";
}
else {
    defaultShortcut = "Alt + Shift + A";
}
let currentShortcut = defaultShortcut;
let currentOpenStudy = "";
let deptPeopleCountCache = {};
const defaultSendMsg = "Enter";
let m_mainWindow;
let m_preQuitTime = 0;
let m_mainWinCloseState = 0;
let m_SystemSuspendTime = 0;
console.log("process.argv:", JSON.stringify(proArgsV));
if (checkDataFilePath()) {
    return;
}
(0, MsgImgMigrationHelper_1.checkMsgImgMigration)();
(0, DatabaseFolderMoveHelper_1.checkRenameDbFolder)();
electron_1.app.on("second-instance", (event, argv, workingDirectory, additionalData) => {
    console.log("second-instance......");
    if (m_mainWindow && !m_mainWindow.isDestroyed()) {
        if (m_mainWindow.isVisible()) {
            m_mainWindow.focus();
        }
        else {
            m_mainWindow.show();
        }
    }
});
electron_1.app.commandLine.appendSwitch("max-active-webgl-contexts", "30");
electron_1.app.commandLine.appendSwitch("wm-window-animations-disabled");
BrowserProtocolHelper.registerDefaultProtocolClient();
electron_1.nativeTheme.themeSource = "light";
console.log("os.release:", os_1.default.release());
electron_1.dialog.showErrorBox = function (title, content) {
    console.error(`main error dialog:title:${title}, content:${content}`);
    if (electron_1.app.isReady()) {
        if (content) {
            if (content.includes("Error: net::ERR_UNKNOWN_URL_SCHEME")) {
                return;
            }
            if (content.includes("Error: net::ERR_TUNNEL_CONNECTION_FAILED")) {
                return;
            }
            if (content.includes("Error: net::ERR_INTERNET_DISCONNECTED")) {
                return;
            }
            if (content.includes("Error: net::ERR_CONTENT_LENGTH_MISMATCH")) {
                return;
            }
            if (content.includes("Error: ENOENT:")) {
                return;
            }
            if (content.includes("Error: net::ERR_NETWORK_")) {
                return;
            }
            if (content.includes("Error: net::ERR_CONNECTION_")) {
                return;
            }
            if (content.includes("at SimpleURLLoaderWrapper.")) {
                return;
            }
            if (content.includes("SQLITE_ERROR:")) {
                return;
            }
            if (content.includes("EPERM: operation not permitted")) {
                return;
            }
            if (content.includes("Error: No update available, can't quit and install")) {
                (0, AppSystemConfigMainHelper_1.setAppSystemConfig)("updateVesionTo", undefined);
                return;
            }
        }
        console.error(`showErrorBox:title:${title}, content:${content}`);
        electron_1.dialog.showMessageBox(undefined, { message: "程序错误", type: "warning" });
        setTimeout(() => {
            (0, LogUpload_1.uploadImmediately)(7);
        }, 500);
    }
};
function initMenu() {
    if (process.platform === "darwin") {
        let isCn = (0, LoginMainHelper_1.getCurLanguage)() == "zh_CN";
        const template = [
            {
                label: "Application",
                submenu: [
                    {
                        label: isCn ? "退出" : undefined,
                        accelerator: "Command+Q",
                        click: function () {
                            console.info("app.quit() on mac menu click");
                            electron_1.app.quit();
                        },
                    },
                ],
            },
            {
                label: isCn ? "编辑" : "Edit",
                submenu: [
                    { label: isCn ? "撤销" : undefined, role: "undo" },
                    { label: isCn ? "重做" : undefined, role: "redo" },
                    { type: "separator" },
                    { label: isCn ? "剪切" : undefined, role: "cut" },
                    { label: isCn ? "拷贝" : undefined, role: "copy" },
                    { label: isCn ? "粘贴" : undefined, role: "paste" },
                    {
                        label: isCn ? "粘贴并匹配样式" : undefined,
                        role: "pasteAndMatchStyle",
                    },
                    { label: isCn ? "全选" : undefined, role: "selectAll" },
                ],
            },
        ];
        electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate(template));
    }
    else {
        electron_1.Menu.setApplicationMenu(null);
    }
}
const createMainWindow = () => {
    console.log("createMainWindow...");
    if (!m_mainWindow || m_mainWindow.isDestroyed()) {
        if (appConfig.appMode == "fanya") {
            electron_1.session.defaultSession.clearStorageData().then(() => {
                m_mainWindow = (0, FanyaMainHelper_1.createFanyaMainWindow)();
                TrayHelper_1.default.initTray(m_mainWindow, (0, AppSystemConfigMainHelper_1.getAppSystemConfig)().appMode);
            });
            return;
        }
        if (appConfig.appMode == "fyketang") {
            m_mainWindow = (0, KetangMainHelper_1.createKetangMainWindow)();
            m_mainWindow.on("close", (event) => {
                if (m_preQuitTime > 0) {
                    m_mainWinCloseState = 1;
                }
                else {
                    m_mainWinCloseState = 0;
                }
                m_preQuitTime = 0;
                let meetingWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
                if (meetingWin && !meetingWin.isDestroyed()) {
                    event.preventDefault();
                    meetingWin.show();
                    meetingWin.webContents.send("beforeAppQuit");
                    if (process.platform == "darwin") {
                        meetingWin.setParentWindow(m_mainWindow);
                        setTimeout(() => {
                            if (meetingWin && !meetingWin.isDestroyed()) {
                                meetingWin.setParentWindow(undefined);
                            }
                        }, 2000);
                    }
                    setTimeout(() => {
                        electron_1.BrowserWindow.getAllWindows().forEach((win) => {
                            if (win != m_mainWindow && win != meetingWin) {
                                if (!win.isDestroyed()) {
                                    win.destroy();
                                }
                            }
                        });
                    }, 100);
                }
                else {
                    if (process.platform == "win32") {
                        electron_1.app.exit();
                    }
                    else {
                        if (m_mainWinCloseState == 1) {
                            electron_1.app.exit();
                        }
                        else {
                            event.preventDefault();
                            electron_1.BrowserWindow.getAllWindows().forEach((win) => {
                                if (win != m_mainWindow) {
                                    if (!win.isDestroyed()) {
                                        win.destroy();
                                    }
                                }
                            });
                            m_mainWindow.hide();
                        }
                    }
                }
            });
            return;
        }
        m_mainWindow = (0, BrowserHelper_1.createBrowserWindow)({
            id: WinId_1.default.MainWindow,
            width: 1200,
            height: 750,
            minWidth: 1120,
            minHeight: 640,
            frame: false,
            hasShadow: true,
            webPreferences: {
                preload: path_1.default.join(__dirname, "../preload/main_window_preload.js"),
            },
        });
        if (process.platform == "darwin") {
            m_mainWindow.setWindowButtonVisibility(true);
        }
        m_mainWindow.loadURL((0, LoadUrlHelper_1.getUrl)("sview:/"));
        TabHelper_1.default.setMainWindow(m_mainWindow);
        (0, TabPanelHelper_1.createTabPanel)(m_mainWindow, 80, 0);
        m_mainWindow.on("close", (event) => {
            if (m_preQuitTime == 0) {
                if (process.platform == "darwin" && m_mainWindow.isFullScreen()) {
                    m_mainWindow.setFullScreen(false);
                    m_mainWindow.once("leave-full-screen", () => {
                        m_mainWindow.hide();
                    });
                }
                else {
                    m_mainWindow.hide();
                }
                event.preventDefault();
            }
            else {
                let meetingWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
                if (meetingWin && !meetingWin.isDestroyed()) {
                    meetingWin.show();
                    meetingWin.webContents.send("beforeAppQuit");
                    m_preQuitTime = 0;
                    if (process.platform == "darwin") {
                        meetingWin.setParentWindow(m_mainWindow);
                        setTimeout(() => {
                            if (meetingWin && !meetingWin.isDestroyed()) {
                                meetingWin.setParentWindow(undefined);
                            }
                        }, 5000);
                    }
                    else {
                        m_mainWindow.hide();
                    }
                    (0, KetangMainHelper_1.stopScreenShare)();
                    event.preventDefault();
                }
                else {
                    event.preventDefault();
                    waitLogoutForMessage().then(() => {
                        electron_1.app.exit();
                    });
                }
            }
        });
        m_mainWindow.on("focus", () => {
            console.log("mainWindowStateChanged focus");
            (0, MainHelper_1.setTempStore)("mainWindowStateChanged", "focus");
        });
        m_mainWindow.on("blur", () => {
            console.log("mainWindowStateChanged blur");
            (0, MainHelper_1.setTempStore)("mainWindowStateChanged", "blur");
            let msgSubTab = TabHelper_1.default.getSubTab("tab_message_sub");
            if (msgSubTab && !msgSubTab.isDestroyed()) {
                msgSubTab.getWebContents().send("mainWindowStateChanged", true);
            }
        });
        m_mainWindow.on("show", () => {
            console.log("mainWindowStateChanged show");
            (0, MainHelper_1.setTempStore)("mainWindowStateChanged", "show");
        });
        m_mainWindow.on("hide", () => {
            console.log("mainWindowStateChanged hide");
            (0, MainHelper_1.setTempStore)("mainWindowStateChanged", "hide");
        });
        m_mainWindow.on("maximize", () => {
            console.log("mainWindowStateChanged maximize");
            (0, MainHelper_1.setTempStore)("mainWindowStateChanged", "maximize");
        });
        m_mainWindow.on("unmaximize", () => {
            console.log("mainWindowStateChanged unmaximize");
            (0, MainHelper_1.setTempStore)("mainWindowStateChanged", "unmaximize");
        });
        m_mainWindow.on("minimize", () => {
            console.log("mainWindowStateChanged minimize");
            (0, MainHelper_1.setTempStore)("mainWindowStateChanged", "minimize");
        });
        m_mainWindow.on("restore", () => {
            console.log("mainWindowStateChanged restore");
            (0, MainHelper_1.setTempStore)("mainWindowStateChanged", "restore");
        });
        m_mainWindow.on("enter-full-screen", () => {
            console.log("mainWindowStateChanged enter-full-screen");
            (0, MainHelper_1.setTempStore)("mainWindowStateChanged", "enter-full-screen");
        });
        m_mainWindow.on("leave-full-screen", async () => {
            console.log("mainWindowStateChanged leave-full-screen");
            (0, MainHelper_1.setTempStore)("mainWindowStateChanged", "leave-full-screen");
            if (process.platform == "darwin") {
                await (0, TabHelper_1.exitCurFullscreen)();
            }
        });
        m_mainWindow.on("enter-html-full-screen", () => {
            console.log("mainWindowStateChanged enter-html-full-screen");
            (0, MainHelper_1.setTempStore)("mainWindowStateChanged", "enter-html-full-screen");
        });
        m_mainWindow.on("leave-html-full-screen", () => {
            console.log("mainWindowStateChanged leave-html-full-screen");
            (0, MainHelper_1.setTempStore)("mainWindowStateChanged", "leave-html-full-screen");
        });
        m_mainWindow.webContents.on("before-input-event", (event, input) => {
            if (input.code == "KeyD" &&
                input.type == "keyDown" &&
                input.control &&
                input.alt) {
                (0, MainHelper_1.openNewWindow)(undefined, {
                    options: { id: WinId_1.default.DevToolsVerifyWindow, width: 500, height: 300 },
                    url: "hview://devToolsVerify.html",
                });
            }
        });
        TabHelper_1.default.setMarginLeft(120);
    }
};
electron_1.ipcMain.on("appQuit", async (event) => {
    if (appConfig.appMode == "fyketang") {
        if (m_mainWinCloseState == 1 || process.platform == "win32") {
            setTimeout(() => {
                console.info("app.quit() on ipc1");
                electron_1.app.exit();
            }, 10);
        }
        else {
            if (m_mainWindow && !m_mainWindow.isDestroyed()) {
                m_mainWindow.hide();
            }
        }
    }
    else {
        await waitLogoutForMessage();
        setTimeout(() => {
            console.info("app.quit() on ipc2");
            electron_1.app.exit();
        }, 10);
    }
});
electron_1.app.on("before-quit", (event) => {
    console.info("before-quit");
    m_preQuitTime = new Date().getTime();
    if (appConfig.appMode == "fanya") {
        electron_1.app.exit();
    }
});
function beforeMainWindowClose() { }
async function loadVueExtension() {
    if (electron_1.app.isPackaged === false) {
        const vueDevtoolsPath = path_1.default.resolve(__dirname, "../vueDevtools");
        await electron_1.session.defaultSession.loadExtension(vueDevtoolsPath);
        console.log("[loadVueExtension] success!");
    }
}
electron_1.app.whenReady().then(async () => {
    await loadVueExtension().catch((error) => {
        console.error("[loadVueExtension]", error?.message);
    });
    afterAppReady();
    createMainWindow();
    if (appConfig.appMode != "fyketang" && appConfig.appMode != "fanya") {
        TrayHelper_1.default.initTray(m_mainWindow, (0, AppSystemConfigMainHelper_1.getAppSystemConfig)().appMode);
    }
    if (process.platform == "win32") {
        setTimeout(() => {
            BrowserProtocolHelper.checkFromProtocol(process.argv);
        }, 1000);
    }
    else {
        setTimeout(() => {
            BrowserProtocolHelper.handleProtocolArg();
        }, 2000);
    }
    DownloadHelper.setMainWindow(m_mainWindow);
    setTimeout(() => {
        (0, ClearFileHelper_1.autoClearFileAndData)();
    }, 120 * 1000);
    logUpload.startAutoUpload(electron_1.app.getPath("logs"));
    TabHelper_1.default.onTabChanged((curTabId) => {
        (0, MainWindowPopHelper_1.topMainWindowPops)();
    });
});
function afterAppReady() {
    console.info("afterAppReady");
    let relaunchAppTime = (0, MainHelper_1.getSysStore)("relaunchAppTime");
    if (relaunchAppTime) {
        let tempTime = 15000;
        if (process.platform == "darwin") {
            tempTime = 120000;
        }
        if (Date.now() - relaunchAppTime < tempTime) {
            console.log("重新启动app，需执行自动登录");
            LoginMainHelper_1.AutoLoginOnAppReady.state = 1;
            (0, MainHelper_1.setSysStore)("relaunchAppTime", undefined);
        }
    }
    if (!electron_1.app.isPackaged) {
        LoginMainHelper_1.AutoLoginOnAppReady.state = 1;
    }
    console.info("exePath:", electron_1.app.getPath("exe"));
    process.on("uncaughtException", (error) => {
        console.error("uncaughtException:", error);
    });
    (0, DevHelper_1.devHelperInit)();
    let cfg = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
    (0, MainHelper_1.setSysStore)("appSystemConfig", cfg);
    initMenu();
    SessionCookie_1.default.init().then(() => {
        if (appConfig.appMode != "fyketang" && appConfig.appMode != "fanya") {
            initLanguage();
        }
        (0, LoginMainHelper_1.loginEnd)(2);
        isConflict();
    });
    setTimeout(() => {
        if (appConfig.appMode == "fanya") {
            (0, HIDBlackMainHelper_1.initHIDBlackMainHelper)();
        }
    }, 500);
    registerProtocol();
    electron_1.app.on("activate", (event, hasVisibleWindows) => {
        console.log("on app activate");
        if (process.platform == "darwin") {
            console.log("hasVisibleWindows:", hasVisibleWindows);
            console.log("dock.isVisible:", electron_1.app.dock.isVisible());
        }
        (0, TrayHelper_1.activateApp)();
    });
    KetangMainHelper.createSysStoreCfg();
    if (cfg.autoLogin) {
        (0, UpdateUtil_1.checkUpdateLater)(120000);
    }
    else {
        (0, UpdateUtil_1.checkUpdateLater)(800);
    }
    electron_1.powerMonitor.on("suspend", () => {
        console.log("powerMonitor suspend,系统挂起、休眠");
        m_SystemSuspendTime = new Date().getTime();
        (0, UpdateUtil_1.checkUpdateLater)(0, true);
    });
    electron_1.powerMonitor.on("resume", () => {
        console.info("powerMonitor resume,系统恢复");
        afterSystemSuspend();
    });
    startNetLogRecord();
    startContentTracing();
    (0, BrowserHelper_1.onPreCloseCurTab)((win) => {
        console.log("onPreCloseCurTab...");
        if (win == m_mainWindow) {
            TabHelper_1.default.closeCurSubTab();
        }
        else {
            WindowTabHelper.closeCurSubTab(win);
        }
    });
    if (appConfig.appMode != "fyketang") {
        if ((0, AppSystemConfigMainHelper_1.getAppSystemConfig)().openAtOsLogin) {
            electron_1.app.setLoginItemSettings({ openAtLogin: true });
        }
        else {
            electron_1.app.setLoginItemSettings({ openAtLogin: false });
        }
    }
    setGlobalKeys();
    registerManyTabEvent();
    electron_1.screen.on("display-metrics-changed", (event, display, changedMetrics) => {
        EventUtil_1.EventUtil.emit("display-metrics-changed", display, changedMetrics);
    });
    (0, LogUpload_1.resetCrashUUID)();
    (0, WebRequestHelper_1.initWebRequest)();
    (0, DragMainHelper_1.initDragHelper)();
    EventUtil_1.EventUtil.emit("appReady");
    addChaoxingCookieOnRequest();
}
function addChaoxingCookieOnRequest() {
    (0, WebRequestHelper_1.addBeforeSendHeadersListener)("chaoxingRequest", async (details) => {
        if (details.resourceType != "mainFrame" &&
            details.resourceType != "subFrame" &&
            details.resourceType != "xhr") {
            return 0;
        }
        let _url = new url_1.URL(details.url);
        if (_url.hostname.endsWith("chaoxing.com") &&
            !details.requestHeaders["Cookie"] &&
            (!details.referrer ||
                details.referrer.startsWith("file://") ||
                details.referrer.startsWith("http://localhost") ||
                new url_1.URL(details.referrer).hostname.endsWith("chaoxing.com"))) {
            const userAgent = SessionCookie_1.default.getUa();
            if (userAgent) {
                details.requestHeaders["User-Agent"] = userAgent;
            }
            let cookieStr = await SessionCookie_1.default.getCookiesStrByUrl(details.url);
            if (cookieStr) {
                details.requestHeaders["Cookie"] = cookieStr;
                return 2;
            }
        }
        return 0;
    });
}
function registerProtocol() {
    electron_1.protocol.registerHttpProtocol("jsbridge", (request, callback) => {
        callback(undefined);
    });
    electron_1.protocol.registerFileProtocol("cxfont", (request, callback) => {
        if (process.platform != "win32") {
            callback("");
            return;
        }
        let _url = new url_1.URL(request.url);
        let fontFileName = _url.hostname;
        let fontDir = path_1.default.join(__dirname, "../../module/font/win/SourceHanSans");
        callback(path_1.default.join(fontDir, fontFileName));
    });
    electron_1.protocol.registerFileProtocol("cximg", (request, callback) => {
        let url = request.url.substring("cximg://".length);
        (0, ImageCache_1.cacheImage)(url).then((localPath) => {
            setTimeout(() => {
                if (localPath && fs_1.default.existsSync(localPath)) {
                    callback(localPath);
                }
                else {
                    callback(url);
                }
            }, 50);
        });
    });
    electron_1.protocol.registerFileProtocol("cxmsgimg", (request, callback) => {
        let url = request.url.substring("cxmsgimg://".length);
        (0, ImageCache_1.cacheMessageImage)(url).then((localPath) => {
            setTimeout(() => {
                if (localPath && fs_1.default.existsSync(localPath)) {
                    callback(localPath);
                }
                else {
                    callback(url);
                }
            }, 50);
        });
    });
    electron_1.protocol.registerFileProtocol("headerimg", (request, callback) => {
        let url = request.url.substring("headerimg://".length);
        (0, ImageCache_1.cacheHeadImage)(url).then((localPath) => {
            if (localPath && fs_1.default.existsSync(localPath)) {
                callback(localPath);
            }
            else {
                callback(url);
            }
        });
    });
    electron_1.protocol.registerFileProtocol("hview", (request, callback) => {
        let url = request.url.substring("hview://".length);
        let filePath = path_1.default.join(__dirname, "../../html", url);
        console.log("hview path:", filePath);
        callback(filePath);
    });
    electron_1.protocol.registerHttpProtocol("ipcketang", (request, callback) => {
        callback(undefined);
        let data = request.url.substring("ipcketang://".length);
        let meetWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
        if (meetWin && !meetWin.isDestroyed()) {
            meetWin.webContents.send("ipcketang", data);
        }
    });
}
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin" || appConfig.appMode == "fanya") {
        console.log("app.quit() on window-all-closed");
        electron_1.app.quit();
    }
});
electron_1.app.on("render-process-gone", (event, webContents, details) => {
    let id;
    try {
        id = webContents._id;
    }
    catch (e) {
        console.warn(e);
    }
    console.warn(`render-process-gone:id:${id}`, JSON.stringify(details, undefined, 2));
    if (details.reason == "crashed" || details.reason == "oom") {
        (0, DevHelper_1.checkAppMetrics)();
        setTimeout(() => {
            (0, LogUpload_1.uploadImmediately)(4, `崩溃窗口id:${id},${JSON.stringify(details)}`, id);
        }, 500);
        if (id == WinId_1.default.meetWindowUUID) {
            let btn = electron_1.dialog.showMessageBoxSync({
                type: "error",
                message: `抱歉，发生了严重错误，我们将尝试重新进入课堂`,
                buttons: ["确定", "取消"],
            });
            let meetingWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
            if (meetingWin) {
                meetingWin.destroy();
            }
            if (btn == 0) {
                setTimeout(() => {
                    (0, OpenketangProtocolHepler_1.openLastMeeting)();
                }, 300);
                setTimeout(() => {
                    meetingWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
                    if (meetingWin && !meetingWin.isDestroyed()) {
                        meetingWin.webContents.send("restartAfterCrash");
                    }
                }, 1000);
            }
            else {
                let meetingWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
                if (meetingWin) {
                    meetingWin.destroy();
                }
            }
        }
        else if (id == WinId_1.default.MainWindow) {
            let btn = electron_1.dialog.showMessageBoxSync({
                type: "error",
                message: `抱歉，发生了严重错误，我们将尝试重新进入${appConfig.appName}`,
                buttons: ["确定", "取消"],
            });
            if (btn == 0) {
                (0, MainHelper_1.relaunchApp)();
            }
            electron_1.app.exit();
        }
        else if (id == WinId_1.default.projectionBox) {
            let btn = electron_1.dialog.showMessageBoxSync({
                type: "error",
                message: `抱歉，发生了严重错误，我们将尝试重新进行投屏`,
                buttons: ["确定", "取消"],
            });
            let win = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.projectionBox);
            let initData = win?.extParams?.initData;
            if (win) {
                win.destroy();
            }
            if (btn == 0) {
                if (initData) {
                    setTimeout(() => {
                        (0, ProjectionBoxMainHelper_1.openProjectionBox)(initData);
                    }, 300);
                }
            }
            else {
            }
        }
        else if (id == WinId_1.default.RTCWindow) {
            let btn = electron_1.dialog.showMessageBoxSync({
                type: "error",
                message: `抱歉，发生了严重错误，我们将尝试重新进入屏幕广播`,
                buttons: ["确定", "取消"],
            });
            let win = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.RTCWindow);
            let initData = win?.extParams?.initData;
            if (win) {
                win.destroy();
            }
            if (btn == 0) {
                if (initData) {
                    setTimeout(() => {
                        (0, ProjectionBoxMainHelper_1.createShareScreenToMeWindow)(initData);
                    }, 300);
                }
            }
        }
        else {
            let win = electron_1.BrowserWindow.fromWebContents(webContents);
            if (win && win.webContents == webContents) {
                electron_1.dialog.showMessageBoxSync({
                    type: "error",
                    message: `抱歉，发生了严重错误，我们将关闭窗口，请重新打开`,
                    buttons: ["好的"],
                });
                if (win) {
                    win.destroy();
                }
            }
        }
        if (webContents.getOSProcessId() > 0) {
            try {
                process.kill(webContents.getOSProcessId());
            }
            catch (e) {
                console.warn("kill webContent process error:", e);
            }
        }
    }
    else {
        if (id == WinId_1.default.meetWindowUUID) {
            let win = (0, BrowserHelper_1.getWindowInWindowMap)(id);
            if (win && !win.isDestroyed()) {
                win.destroy();
            }
        }
    }
});
electron_1.app.on("child-process-gone", (event, details) => {
    console.error("child-process-gone", JSON.stringify(details, undefined, 2));
    (0, DevHelper_1.checkAppMetrics)();
});
electron_1.ipcMain.on("_showTab", async (event, data) => {
    await TabHelper_1.default.showTab(data.id, data.reload);
});
electron_1.ipcMain.handle("_showTabAsync", async (event, data) => {
    return TabHelper_1.default.showTab(data.id, data.reload, data.showMainView);
});
electron_1.ipcMain.on("_fullscreenchange", (event, enter) => {
    let bw = electron_1.BrowserWindow.fromWebContents(event.sender);
    bw.webContents.send("window_show_header", !enter);
    if (bw == m_mainWindow) {
        TabHelper_1.default.fullscreenchange(event.sender, enter);
    }
    else {
        WindowTabHelper.fullscreenchange(bw, event.sender, enter);
    }
});
electron_1.ipcMain.on("_closeWindowSubTab", (event, id) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    WindowTabHelper.closeSubTab(win, id, event.sender);
});
electron_1.ipcMain.on("_updateTabBarList", (event, tabBarIdList) => {
    let bw = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (bw == m_mainWindow) {
        TabHelper_1.default.updateTabBarList(tabBarIdList);
    }
    else if (bw.tabBrowser) {
        bw.tabBrowser.updateTabBarList(tabBarIdList);
    }
    else {
        WindowTabHelper.updateTabBarList(bw, tabBarIdList);
    }
});
electron_1.ipcMain.on("_selectSubTab", (event, id) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win == m_mainWindow) {
        TabHelper_1.default.showSubTab(id);
    }
    else if (win.tabBrowser) {
        win.tabBrowser.showSubTab(id);
    }
    else {
        WindowTabHelper.showSubTab(win, id);
    }
});
electron_1.ipcMain.on("_selectWindowSubTab", (event, id) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    WindowTabHelper.showSubTab(win, id);
});
electron_1.ipcMain.on("_loginOut", (event, type) => {
    (0, LoginMainHelper_1.loginOut)();
});
electron_1.ipcMain.on("_loginOutAndLogin", (event) => {
    UserHelper_1.default.setUserLogoutEndParams(true, 0);
    (0, LoginMainHelper_1.loginOut)();
});
function afterSystemSuspend() {
    (0, BrowserHelper_1.closeWindow)("id_ScreenShareDisconnectPage");
    let curTime = new Date().getTime();
    if (curTime - m_SystemSuspendTime > 15 * 60 * 1000) {
        let meetingWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.meetWindowUUID);
        if (meetingWin && !meetingWin.isDestroyed()) {
            console.log("休眠时间过长，结束课堂窗口");
            meetingWin.destroy();
            (0, DialogMainHelper_1.openCommonDialog)(undefined, {
                id: "closeMeetAfterSystemSuspend",
                winId: "closeMeetAfterSystemSuspend",
                title: "已退出课堂",
                type: "alert",
                content: "由于电脑睡眠导致课堂被挂起，已退出上次课堂",
                okBtn: "我知道了",
            });
        }
        if ((0, BrowserHelper_1.isWindowOpened)(WinId_1.default.RTCWindow)) {
            console.log("休眠时间过长，结束观看他人屏幕窗口");
            (0, BrowserHelper_1.closeWindow)(WinId_1.default.RTCWindow);
        }
        if ((0, BrowserHelper_1.isWindowOpened)(WinId_1.default.projectionBox)) {
            console.log("休眠时间过长，结束投屏窗口");
            let win = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.projectionBox);
            win.webContents.send("CMD_MEET_RTC_STU_SCREEN", {
                data: { type: "endProjection" },
            });
            setTimeout(() => {
                (0, BrowserHelper_1.closeWindow)(WinId_1.default.projectionBox);
            }, 300);
            (0, DialogMainHelper_1.openCommonDialog)(undefined, {
                id: "closeMeetAfterSystemSuspend",
                winId: "closeMeetAfterSystemSuspend",
                title: "已退出投屏",
                type: "alert",
                content: "由于电脑睡眠导致投屏窗口被挂起，已退出上次展示",
                okBtn: "我知道了",
            });
        }
    }
    (0, UpdateUtil_1.checkUpdateLater)(120000, false, true);
}
electron_1.ipcMain.on("_changeAccountLogin", (event, data) => {
    UserHelper_1.default.setUserLogoutEndParams(true, 1, data);
    (0, LoginMainHelper_1.loginOut)();
    (0, LoginMainHelper_1.cleanAutoLogin)();
});
setTimeout(() => {
    (0, UserHelper_1.onUserLogin)(() => {
        if ((0, AppSystemConfigMainHelper_1.getAppSystemConfig)().appMode == "fyketang") {
            setTimeout(() => {
                (0, LoginMainHelper_1.loginEnd)(1);
            }, 100);
        }
        UserHelper_1.default.setPanToken(undefined);
    });
}, 2000);
UserHelper_1.default.onUserLoginEnd(async () => {
    (0, AudioVideoCallMainHelper_1.initClientInfo)();
    if (appConfig.appMode != "fyketang" && appConfig.appMode != "fanya") {
        initLanguage();
    }
    let offlineWindow = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.accountOfflineWindow);
    if (offlineWindow && !offlineWindow.isDestroyed()) {
        offlineWindow.close();
    }
    if ((0, AppSystemConfigMainHelper_1.getAppSystemConfig)().appMode != "fanya" &&
        (0, AppSystemConfigMainHelper_1.getAppSystemConfig)().appMode != "fyketang" &&
        !LoginMainHelper_1.LoginConfig.ssoOneDayLater) {
        console.log("首次执行后SSO会回到首页", LoginMainHelper_1.LoginConfig.ssoOneDayLater);
        TabHelper_1.default.reloadHomePage();
        LoginMainHelper_1.LoginConfig.ssoOneDayLater = true;
    }
    let openConflictDialog = (0, MainHelper_1.getTempStore)("openConflictDialog");
    console.log("openConflictDialog", openConflictDialog);
    if (!(openConflictDialog && openConflictDialog == 1)) {
        isConflict();
    }
});
async function waitLogoutForMessage() {
    let messageView = getMessageSubTab();
    if (messageView && !messageView.isDestroyed()) {
        console.log("waitLogoutForMessage,发送beforeLogout");
        messageView.getWebContents().send("beforeLogout");
    }
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(1);
        }, 300);
    });
}
UserHelper_1.default.onUserLogout(async () => {
    await waitLogoutForMessage();
    setTimeout(() => {
        if (appConfig.appMode != "fyketang" && appConfig.appMode != "fanya") {
            initLanguage();
        }
    }, 100);
    await (0, LoginMainHelper_1.stopCheckMutiTerminal)();
    if (!m_mainWindow || m_mainWindow.isDestroyed()) {
        return;
    }
    electron_1.BrowserWindow.getAllWindows().forEach((bw) => {
        if (bw != m_mainWindow && !bw.isDestroyed()) {
            bw.destroy();
        }
    });
    if ((0, AppSystemConfigMainHelper_1.getAppSystemConfig)().appMode != "fanya" &&
        (0, AppSystemConfigMainHelper_1.getAppSystemConfig)().appMode != "fyketang") {
        if (process.platform == "win32") {
            m_mainWindow.flashFrame(false);
        }
        TrayHelper_1.default.stopFlash();
        (0, TrayHelper_1.setTrayText)("");
        electron_1.app.setBadgeCount(0);
        TabHelper_1.default.reloadHomePage();
        TabHelper_1.default.closeAllWithoutHomePage();
        m_mainWindow.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(`sview:/`));
    }
    UserHelper_1.default.triggerUserLogoutEnd();
});
UserHelper_1.default.onUserLogoutEnd((type, switchInfo, puid, isNextLoginToConfirm) => {
    if (appConfig.appMode != "fyketang" && appConfig.appMode != "fanya") {
        initLanguage();
    }
    if (typeof type == "undefined") {
        type = 0;
    }
    if (type == 1 && switchInfo && isNextLoginToConfirm) {
        let params = {
            baseUrl: "https://passport2.chaoxing.com",
            url: "/api/switchlogin",
            postParams: {
                info: switchInfo,
            },
        };
        new PassportGenOut()
            .genRequest(params)
            .then((res) => {
            console.log("切换登录res", res);
            if (res && res.status) {
                (0, LoginMainHelper_1.loginEnd)(1);
            }
            else {
                console.error("切换登录失败switchInfo=" + switchInfo);
                (0, DialogMainHelper_1.openCommonDialog)(m_mainWindow, {
                    type: "toast",
                    content: res.mes,
                    gravity: 1,
                    width: 240,
                    duration: 2000,
                });
                setTimeout(() => {
                    (0, LoginMainHelper_1.openLogin)();
                }, 2000);
            }
        })
            .catch((error) => {
            console.error("切换登录异常switchInfo=" + switchInfo, error);
            (0, LoginMainHelper_1.openLogin)();
        });
    }
    else {
        let uid = puid ? puid : "";
        (0, MainHelper_1.setSysStore)("lastUserUid", uid);
        setTimeout(() => {
            (0, LoginMainHelper_1.openLogin)();
        }, 500);
    }
});
electron_1.ipcMain.handle("_getUID", (event) => {
    return UserHelper_1.default.getUID();
});
electron_1.ipcMain.on("_openWindowWithTab", (event, args) => {
    openWindowWithTab(event.sender, args);
});
function openWindowWithTab(wContents, args) {
    const winOptions = args.options || {};
    if (winOptions.id) {
        let tempWin = (0, BrowserHelper_1.getWindowInWindowMap)(winOptions.id);
        if (tempWin && !tempWin.isDestroyed()) {
            tempWin.show();
            return;
        }
    }
    winOptions.width = winOptions.width || 1100;
    winOptions.height = winOptions.height || 750;
    winOptions.frame = false;
    winOptions.hasShadow = true;
    if (winOptions.subWindow === true) {
        let pWindow = electron_1.BrowserWindow.fromWebContents(wContents);
        if (pWindow && !pWindow.isDestroyed()) {
            winOptions.parent = pWindow;
            if (winOptions.marginLeft != undefined ||
                winOptions.marginTop != undefined) {
                let pBounds = pWindow.getBounds();
                winOptions.x = Math.floor(pBounds.x + (winOptions.marginLeft || 0));
                winOptions.y = Math.floor(pBounds.y + (winOptions.marginTop || 0));
            }
        }
    }
    if (winOptions.siblingWindow) {
        let cWindow = electron_1.BrowserWindow.fromWebContents(wContents);
        if (cWindow && cWindow.getParentWindow()) {
            winOptions.parent = cWindow.getParentWindow();
        }
    }
    let preloadPath = path_1.default.join(__dirname, "../preload/main_window_preload.js");
    winOptions.webPreferences = {
        preload: preloadPath,
        contextIsolation: true,
        enableRemoteModule: true,
    };
    if (process.platform == "darwin") {
        winOptions.modal = false;
    }
    if (winOptions.autoWindowSize) {
        winOptions.webPreferences.enablePreferredSizeMode = true;
    }
    let win = WindowTabHelper.openNewWindow(args.url, winOptions);
    if (winOptions.maximize) {
        (0, MainHelper_1.setFullScreen)(win, true);
    }
    (0, TabPanelHelper_1.createTabPanel)(win, 80, 0);
}
EventUtil_1.EventUtil.on("searchOnNewPage", (wContents, seachText) => {
    let url = `https://m.chaoxing.com/search/redirect?backurl=https://m.chaoxing.com/xxtpc/#/all?keyword=${seachText}`;
    let tabMenu = getCurTabMenu(electron_1.BrowserWindow.fromWebContents(wContents));
    if (tabMenu) {
        tabMenu.addSubTab(url);
    }
    else {
        openWindowWithTab(wContents, {
            url,
        });
    }
});
electron_1.ipcMain.handle("CLIENT_GET_USERINFO", (event) => {
    return UserHelper_1.default.getUser();
});
electron_1.ipcMain.handle("CLIENT_IM_GET_CONVERSATION_DATA", (event) => {
    return new Promise((resolve) => {
        let bv = TabHelper_1.default.getBrowserViewById("tab_message");
        if (bv) {
            bv.webContents.send("getConversationData");
        }
        m_EventEmitObj.once("_getConversationData", (data) => {
            resolve(data);
        });
    });
});
const desEncrypt = (key, plaintext) => {
    const keyBytes = crypto_js_1.default.enc.Utf8.parse(key);
    const plaintextBytes = crypto_js_1.default.enc.Utf8.parse(plaintext);
    const ciphertextBytes = crypto_js_1.default.DES.encrypt(plaintextBytes, keyBytes, {
        mode: crypto_js_1.default.mode.ECB,
        padding: crypto_js_1.default.pad.Pkcs7,
    }).ciphertext;
    const ciphertextBase64 = ciphertextBytes.toString(crypto_js_1.default.enc.Hex);
    return ciphertextBase64.toUpperCase();
};
electron_1.ipcMain.on("_sendMsgConversation", (event, conversationList) => {
    const messageData = [];
    const key = "Zx!qgCwq";
    const classIconPath = path_1.default.join(__dirname, "../../html/images/class.png");
    const classIcon = electron_1.nativeImage.createFromPath(classIconPath).toDataURL();
    const courseIconPath = path_1.default.join(__dirname, "../../html/images/course.png");
    const courseIcon = electron_1.nativeImage.createFromPath(courseIconPath).toDataURL();
    conversationList.forEach((item) => {
        const chatId = item?.conversationType === "singleChat"
            ? desEncrypt(key, item?.puid)
            : desEncrypt(key, item?.conversationKey);
        let chatIco = item?.conversationInfo?.avatarUrl?.[0];
        let picArray = item?.conversationInfo?.avatarUrl;
        if (item?.conversationInfo?.avatarUrl?.[0] === "class") {
            chatIco = classIcon;
            picArray = [classIcon];
        }
        if (item?.conversationInfo?.avatarUrl?.[0] === "course") {
            chatIco = courseIcon;
            picArray = [courseIcon];
        }
        messageData.push({
            chatIco,
            chatId,
            chatName: item?.conversationInfo?.name,
            isGroup: item?.conversationType === "singleChat" ? 1 : 0,
            picArray,
            puid: item?.puid,
        });
    });
    m_EventEmitObj.emit("_getConversationData", messageData);
});
electron_1.ipcMain.on("CLIENT_OPEN_KETANG", (event, parms) => {
    let { url, options, data } = parms;
    (0, OpenketangProtocolHepler_1.openMeeting)(url, options, data);
});
electron_1.ipcMain.handle("_createGroupMeetingLink", (_e, groupChatId) => {
    return (0, OpenketangProtocolHepler_1.createGroupMeetingLink)(groupChatId);
});
electron_1.ipcMain.on("_sendToOuterView", (event, ...args) => {
    let key = args.shift();
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    win.webContents.send(key, ...args);
});
electron_1.ipcMain.on("_sendToBrowserView", (event, ...args) => {
    let key = args.shift();
    let viewId = args.shift();
    let bv = TabHelper_1.default.getBrowserViewById(viewId);
    if (bv) {
        bv.webContents.send(key, ...args);
    }
});
electron_1.ipcMain.handle("CLIENT_RES_RECENTLY", (event, data) => {
    return ResRecentHelper.insertOrUpdateResRecent(data);
});
electron_1.ipcMain.handle("CLIENT_GET_RECENT_RECORD", (event, numCount) => {
    return ResRecentHelper.queryResRecent(numCount);
});
electron_1.ipcMain.handle("CLIENT_DEL_RECENTLY", (event, data) => {
    if (data.clearAll == 1) {
        ResRecentHelper.deleteAllResRecent();
    }
    else {
        return ResRecentHelper.deleteResRecent(data);
    }
});
electron_1.ipcMain.handle("_getTopTabId", (event) => {
    return TabHelper_1.default.getCurSubTabId();
});
electron_1.ipcMain.on("_screenshot", async (event, args) => {
    (0, ScreenshotMainHelper_1.startScreenShot)();
});
function getMessageSubTab() {
    return TabHelper_1.default.getSubTab("tab_message_sub");
}
electron_1.ipcMain.handle("_uploadLog", (event) => {
    return logUpload.uploadImmediately();
});
electron_1.ipcMain.on("_openChatPage", async (event, parms) => {
    if (parms && (parms.groupId || parms.personId)) {
        let messageBv = TabHelper_1.default.getBrowserViewById("tab_message");
        if (messageBv && messageBv.webContents) {
            messageBv.webContents.send("openImChatPage", parms);
        }
    }
    else {
        await TabHelper_1.default.showTab("tab_message");
        await TabHelper_1.default.showSubTab("tab_message");
    }
});
electron_1.ipcMain.handle("_gotoMessagePage", async () => {
    await TabHelper_1.default.showTab("tab_message");
    await TabHelper_1.default.showSubTab("tab_message");
    return { code: 0, msg: "success" };
});
electron_1.ipcMain.handle("_searchLocalUser", (event, keyword) => {
    return (0, ContactsDbMainHelper_1.searchUser)(keyword);
});
electron_1.ipcMain.handle("_insertDeptInContact", (event, deptData) => {
    return (0, ContactsDbMainHelper_1.insertDeptData)(deptData);
});
electron_1.ipcMain.handle("_updateTeamUnitData", (event, userData, userDeptData) => {
    return ContactsHelper.updateTeamUnitData();
});
electron_1.ipcMain.on("_updateDeptSort", (event, id, sort) => {
    (0, ContactsDbMainHelper_1.updateDeptSort)(id, sort);
});
electron_1.ipcMain.handle("_updateCurrentFidUsers", (event, unitInfo) => {
    return ContactsHelper.updateCurrentFidUsers(unitInfo);
});
electron_1.ipcMain.handle("_deleteDeptDataByDeptid", (event, deptid) => {
    return (0, ContactsDbMainHelper_1.deleteDeptDataByDeptid)(deptid);
});
electron_1.ipcMain.handle("_syncAllContacts", (event, isFullUpdate) => {
    return ContactsHelper.invokeSyncContacts(isFullUpdate);
});
electron_1.ipcMain.handle("_syncAllNotice", (event) => {
    return NoticeHelper_1.default.invokeSyncNotice();
});
electron_1.ipcMain.handle("_syncNoticeDraft", (event) => {
    return NoticeHelper_1.default.invokeSyncNoticeDraft();
});
electron_1.ipcMain.handle("_searchLocalNotice", (event, keyword, lastValue) => {
    return (0, NoticeDbHelper_1.searchNotice)(keyword, lastValue);
});
electron_1.ipcMain.handle("_updateNoticeFoldTag", (event, keyword, lastValue) => {
    return (0, NoticeDbHelper_1.updateNoticeFoldTag)();
});
electron_1.ipcMain.handle("_searchContactsAndStructureUser", (event, keyword) => {
    return Promise.all([
        ContactsOut.searchUser(UserHelper_1.default.getUID(), keyword),
        StructureOut.searchUser(UserHelper_1.default.getUID(), keyword),
    ]);
});
electron_1.ipcMain.handle("_searchLocalMeShieldData", (event) => {
    return (0, BlacklistDbHelper_1.queryMeShieldData)();
});
electron_1.ipcMain.handle("_searchLocalShieldMeData", (event) => {
    return (0, BlacklistDbHelper_1.queryShieldMeData)();
});
electron_1.ipcMain.handle("_deleteMineShieldData", (event, puid) => {
    return (0, BlacklistDbHelper_1.deleteMeShieldData)(puid);
});
electron_1.ipcMain.handle("_syncAllBlacklist", (event) => {
    return BlacklistHelper_1.default.invokeSyncBlacklist();
});
electron_1.ipcMain.handle("_cacheMessageAudio", (event, url) => {
    return (0, audioCache_1.cacheMessageAudio)(url);
});
electron_1.ipcMain.handle("_cacheMessageImage", (event, url) => {
    return (0, ImageCache_1.cacheMessageImage)(url);
});
electron_1.ipcMain.handle("_countDeptPeople", async (event, ppath) => {
    const result = deptPeopleCountCache[ppath];
    if (result) {
        return result;
    }
    else {
        const value = await (0, ContactsDbMainHelper_1.countDeptPeople)(ppath);
        deptPeopleCountCache[ppath] = value;
        return value;
    }
});
electron_1.ipcMain.on("_clearDeptPeopleCountCache", () => {
    deptPeopleCountCache = {};
});
function updateChaoxingCookie(name, value) {
    const cookie = {
        url: "https://k.chaoxing.com/",
        name,
        value,
        domain: ".chaoxing.com",
    };
    electron_1.session.defaultSession.cookies.set(cookie).then(() => {
        electron_1.session.defaultSession.cookies.flushStore().then(() => {
            console.log("updateChaoxingCookie:flushStore:", name, value);
        });
    });
}
function updateCookie(name, value, domain) {
    const cookie = {
        url: "",
        name,
        value,
        domain,
    };
    electron_1.session.defaultSession.cookies.set(cookie).then(() => {
        electron_1.session.defaultSession.cookies.flushStore().then(() => {
            console.log("updateCookie:flushStore:", name, value, domain);
        });
    });
}
electron_1.ipcMain.handle("_getAppSystemConfig", (event) => {
    return (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
});
electron_1.ipcMain.on("_setAppSystemConfig", (event, key, value) => {
    if (key == "autoUpdate" && value === true) {
        (0, UpdateUtil_1.checkUpdateLater)(20000);
    }
    (0, AppSystemConfigMainHelper_1.setAppSystemConfig)(key, value);
});
electron_1.ipcMain.on("_openDownloadCenter", (event) => {
    openDownloadCenter(electron_1.BrowserWindow.fromWebContents(event.sender));
});
function openDownloadCenter(pWin) {
    if (!pWin) {
        return;
    }
    const id = WinId_1.default.DownloadCenter;
    const url = "sview:/#/downloadCenter";
    const width = 396;
    const maxHeight = 466;
    let pBounds = pWin.getBounds();
    let x = pBounds.x + pBounds.width - width - 10;
    let y = pBounds.y + 10;
    let win = (0, BrowserHelper_1.createBrowserWindow)({
        id,
        x,
        y,
        width,
        height: 300,
        maxHeight: 466,
        resizable: false,
        frame: false,
        transparent: true,
        parent: pWin,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: (0, LoadUrlHelper_1.getPreloadJs)(id, url),
            enablePreferredSizeMode: true,
        },
    });
    win.webContents.on("preferred-size-changed", (event, perferredSize) => {
        console.log("preferred-size-changed:", perferredSize);
        let newHeight = perferredSize.height;
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
        }
        win.setResizable(true);
        win.setSize(width, newHeight);
        win.setResizable(false);
    });
    win.loadURL((0, LoadUrlHelper_1.getUrl)(url));
}
electron_1.ipcMain.handle("_getTokenParms", (event, parms) => {
    return TokenUtil_1.TokenUtil.getRequestParams({
        url: "",
        getParams: parms,
        tokenSign: true,
    });
});
electron_1.ipcMain.handle("_getCxCookieStr", (event) => {
    return SessionCookie_1.default.getCookieStr();
});
electron_1.ipcMain.on("_downloadAndOpenPptFile", (event, data) => {
    let localPptPath = getLocalPptFilePath(data.objectId, data.fileName);
    if (fs_1.default.existsSync(localPptPath)) {
        electron_1.shell.openPath(localPptPath);
        event.sender.send("_downloadAndOpenPptFile_" + data.objectId, {
            downloadStatus: "success",
        });
    }
    else {
        let pPath = path_1.default.join(localPptPath, "..");
        let files = fs_1.default.readdirSync(pPath, { encoding: "utf-8" });
        if (files) {
            files.forEach((file) => {
                let fPath = path_1.default.join(pPath, file);
                if (fs_1.default.statSync(fPath).isFile()) {
                    fs_1.default.unlinkSync(fPath);
                }
            });
        }
        downloadPptFile(data.url, localPptPath, data.objectId, event.sender);
    }
});
function getLocalPptFilePath(objId, fileName) {
    let puid = (0, UserHelper_1.getUID)();
    let fileDir = path_1.default.join(electron_1.app.getPath("userData"), `files/ppt/${puid}/${objId}/`);
    if (!fs_1.default.existsSync(fileDir)) {
        fs_1.default.mkdirSync(fileDir, { recursive: true });
    }
    return path_1.default.join(fileDir, fileName);
}
function downloadPptFile(url, filePath, objId, wContents) {
    let tmpFile = `${filePath}_tmp`;
    if (fs_1.default.existsSync(tmpFile)) {
        fs_1.default.unlinkSync(tmpFile);
    }
    let sendEventId = "_downloadAndOpenPptFile_" + objId;
    if (fs_1.default.existsSync(tmpFile)) {
        wContents.send(sendEventId, {
            downloadStatus: "failed",
        });
        return;
    }
    const request = electron_1.net.request(url);
    request.on("error", () => {
        wContents.send(sendEventId, { downloadStatus: "failed" });
    });
    request.on("response", (response) => {
        let wstream = fs_1.default.createWriteStream(tmpFile);
        let contentLength = 0;
        try {
            contentLength = parseInt(response.headers["content-length"]);
        }
        catch (e) { }
        let recLength = 0;
        response.on("data", (chunk) => {
            wstream.write(chunk);
            recLength += chunk.length;
            wContents.send(sendEventId, {
                downloadStatus: "progressing",
                receivedBytes: recLength,
                totalBytes: contentLength,
            });
        });
        response.on("end", () => {
            wstream.end(() => {
                if (!fs_1.default.existsSync(filePath) && fs_1.default.existsSync(tmpFile)) {
                    fs_1.default.renameSync(tmpFile, filePath);
                    electron_1.shell.openPath(filePath);
                    wContents.send(sendEventId, {
                        downloadStatus: "success",
                    });
                }
            });
        });
        response.on("error", () => {
            wstream.end();
            wContents.send(sendEventId, { downloadStatus: "failed" });
        });
    });
    request.end();
}
electron_1.ipcMain.handle("_deleteUserDownloadPptFiles", () => {
    deleteUserDownloadPptFiles();
});
function deleteUserDownloadPptFiles() {
    let puid = (0, UserHelper_1.getUID)();
    let fileDir = path_1.default.join(electron_1.app.getPath("userData"), `files/ppt/${puid}/`);
    if (!fs_1.default.existsSync(fileDir)) {
        return;
    }
    fs_1.default.promises.rmdir(fileDir, { recursive: true });
}
function startNetLogRecord() {
    if (!electron_1.app.isPackaged) {
        let netLogDir = path_1.default.join(electron_1.app.getPath("logs"), `netLog`);
        if (!fs_1.default.existsSync(netLogDir)) {
            fs_1.default.mkdirSync(netLogDir, { recursive: true });
        }
        let netLogPath = path_1.default.join(netLogDir, `netLog_${(0, DateUtil_1.dateFormat)("yyyyMMdd")}.log`);
        console.log("netLogPath:", netLogPath);
        electron_1.netLog.startLogging(netLogPath, {
            captureMode: "includeSensitive",
            maxFileSize: 3 * 1024 * 1024,
        });
        setTimeout(() => {
            electron_1.netLog.stopLogging();
        }, 30 * 1000);
    }
}
electron_1.ipcMain.handle("_hasScreenCapturePermission", () => {
    if (process.platform !== "darwin") {
        return true;
    }
    return screenPermissions.hasScreenCapturePermission();
});
electron_1.ipcMain.on("_openSystemPreferences", () => {
    if (process.platform !== "darwin") {
        return;
    }
    screenPermissions.openSystemPreferences();
});
function startContentTracing() {
}
electron_1.ipcMain.on("_openDialogWidthMask", (event, data) => {
    let win;
    if (data.pWinId) {
        win = (0, BrowserHelper_1.getWindowInWindowMap)(data.pWinId);
    }
    if (!win || win.isDestroyed()) {
        win = electron_1.BrowserWindow.fromWebContents(event.sender);
    }
    let contentBounds = win.getContentBounds();
    let win2 = (0, BrowserHelper_1.createBrowserWindow)({
        id: "dialogWidthMask",
        transparent: true,
        x: contentBounds.x,
        y: contentBounds.y,
        width: contentBounds.width,
        height: contentBounds.height,
        frame: false,
        resizable: false,
        parent: win,
        modal: process.platform == "darwin" ? false : true,
        hasShadow: false,
        webPreferences: {
            preload: (0, LoadUrlHelper_1.getPreloadJs)("dialogWidthMask", "sview:/"),
        },
    });
    win2.webContents.on("did-start-loading", () => {
        win2.webContents.send("ready", data);
    });
    win2.webContents.loadURL((0, LoadUrlHelper_1.getUrl)("sview:/#/maskDialog"));
});
electron_1.ipcMain.on("_openWindowWidthMask", (event, data) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    let contentBounds = win.getContentBounds();
    let win2 = (0, BrowserHelper_1.createBrowserWindow)({
        id: "windowWidthMask",
        transparent: true,
        x: contentBounds.x,
        y: contentBounds.y,
        width: contentBounds.width,
        height: contentBounds.height,
        frame: false,
        parent: win,
        modal: process.platform == "darwin" ? false : true,
        hasShadow: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: (0, LoadUrlHelper_1.getPreloadJs)("windowWidthMask", "file:/"),
        },
    });
    win2.on("ready-to-show", () => {
        if (process.platform == "win32") {
            win2.setBounds(contentBounds);
            win2.blur();
            setTimeout(() => {
                win2.focus();
            }, 1);
        }
    });
    if (data?.forbidClose) {
        win2.webContents.send("ready", { forbidClose: true });
        win2.webContents.on("did-start-loading", () => {
            win2.webContents.send("ready", { forbidClose: true });
        });
    }
    win2.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(`hview://maskView.html`));
    let bvx = Math.floor((contentBounds.width - data.width) / 2);
    let bvy = Math.floor((contentBounds.height - data.height) / 2);
    let bv = (0, BrowserHelper_1.createBrowserView)({
        id: data.id,
        width: data.width,
        height: data.height,
        transparent: true,
        disableLoadingPage: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: (0, LoadUrlHelper_1.getPreloadJs)(data.id, data.url),
        },
    });
    bv.addToBrowserWindow(win2);
    bv.setBounds({ x: bvx, y: bvy, width: data.width, height: data.height });
    bv.webContents.loadURL(data.url);
    if (data.args) {
        bv.webContents.send("ready", data.args);
        bv.webContents.on("did-start-loading", () => {
            bv.webContents.send("ready", data.args);
        });
        bv.webContents.on("did-stop-loading", () => {
            bv.webContents.send("ready", data.args);
        });
    }
    bv.addToBrowserWindow(win2);
    win2.on("closed", () => {
        bv.webContents.close();
        if (bv.webContents.getOSProcessId() > 0) {
            process.kill(bv.webContents.getOSProcessId());
        }
    });
});
electron_1.ipcMain.handle("_openLocalPpt", (event) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    let files = electron_1.dialog.showOpenDialogSync(win, {
        title: "选择PPT",
        filters: [{ name: "ppt文件", extensions: ["ppt", "pptx"] }],
        properties: ["openFile", "showHiddenFiles"],
    });
    console.log(files);
    if (files && files.length > 0) {
        electron_1.shell.openPath(files[0]);
        return files[0];
    }
    return undefined;
});
function checkDataFilePath() {
    let newDataFilePath = (0, MainHelper_1.getSysStore)("newDataFilePath");
    if (newDataFilePath) {
        console.info("checkDataFilePath:", newDataFilePath);
        let newBaseName = path_1.default.basename(newDataFilePath);
        if (newBaseName != appConfig.dataFilePath) {
            newDataFilePath = path_1.default.join(newDataFilePath, appConfig.dataFilePath);
        }
        let appSystemConfig = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
        if (appSystemConfig.dataFilePath != newDataFilePath) {
            let oldDataFilePath;
            if (appConfig.dataFilePath) {
                let tmpOldDataFilePath = path_1.default.join(appSystemConfig.dataFilePath, appConfig.dataFilePath);
                if (fs_1.default.existsSync(tmpOldDataFilePath)) {
                    oldDataFilePath = tmpOldDataFilePath;
                }
            }
            if (!oldDataFilePath) {
                oldDataFilePath = appSystemConfig.dataFilePath;
            }
            let oldDatabasesPath = path_1.default.join(oldDataFilePath, "databases");
            if (!fs_1.default.existsSync(oldDatabasesPath)) {
                return false;
            }
            if (!fs_1.default.existsSync(newDataFilePath)) {
                fs_1.default.mkdirSync(newDataFilePath, { recursive: true });
            }
            let oldFileCount = (0, FileUtil_1.countFilesInFolder)(oldDatabasesPath);
            if (oldFileCount <= 0) {
                return false;
            }
            openDataMigrationWindow(oldDataFilePath, newDataFilePath);
            return true;
        }
    }
    else {
        let oldDataFilePath = (0, MainHelper_1.getSysStore)("oldDataFilePath");
        if (oldDataFilePath) {
            clearOldMessageFileData(oldDataFilePath);
        }
        return false;
    }
}
function openDataMigrationWindow(oldDataFilePath, newDataFilePath) {
    console.info("openDataMigrationWindow:开始数据迁移");
    electron_1.ipcMain.handle("_getUser", (event) => {
        return;
    });
    electron_1.ipcMain.on("_migrationDataFinished", (event) => {
        console.info("数据迁移完成");
        (0, MainHelper_1.setSysStore)("oldDataFilePath", oldDataFilePath);
        (0, MainHelper_1.setSysStore)("newDataFilePath", undefined);
        (0, AppSystemConfigMainHelper_1.setAppSystemConfig)("dataFilePath", newDataFilePath);
        clearOldMessageFileData(oldDataFilePath);
        (0, MainHelper_1.relaunchApp)();
        electron_1.app.exit();
    });
    electron_1.ipcMain.on("_migrationDataCancel", (event) => {
        console.info("数据迁移取消");
        (0, MainHelper_1.setSysStore)("oldDataFilePath", undefined);
        (0, MainHelper_1.setSysStore)("newDataFilePath", undefined);
        (0, MainHelper_1.relaunchApp)();
        electron_1.app.exit();
    });
    electron_1.app.whenReady().then(() => {
        (0, DevHelper_1.devHelperInit)();
        let url = "sview:/#/dataMigration";
        let win = (0, BrowserHelper_1.createBrowserWindow)({
            id: WinId_1.default.DataMigrationWindow,
            width: 456,
            height: 246,
            transparent: true,
            resizable: false,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.DataMigrationWindow, url),
            },
        });
        win.webContents.send("ready", { oldDataFilePath, newDataFilePath });
        win.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(url));
    });
}
function clearOldMessageFileData(oldDataPath) {
    console.info("clearOldMessageFileData:开始清理迁移前旧数据");
    let oldDatabasesPath = path_1.default.join(oldDataPath, "databases");
    (0, FileUtil_1.deleteDir)(oldDatabasesPath);
    if (fs_1.default.existsSync(oldDatabasesPath)) {
        console.info("清理迁移前旧数据失败");
        return;
    }
    let oldMsgAudioPath = path_1.default.join(oldDataPath, "files/message_audios");
    (0, FileUtil_1.deleteDir)(oldMsgAudioPath);
    let oldMsgImgPath = path_1.default.join(oldDataPath, "files/message_images");
    (0, FileUtil_1.deleteDir)(oldMsgImgPath);
    if (!fs_1.default.existsSync(oldMsgImgPath)) {
        console.info("清理迁移前旧数据成功");
        (0, MainHelper_1.setSysStore)("oldDataFilePath", undefined);
    }
}
electron_1.ipcMain.handle("_getDataFilePath", (event) => {
    return getDataFilePath();
});
function getDataFilePath() {
    let appSystemConfig = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)();
    return appSystemConfig.dataFilePath;
}
electron_1.ipcMain.on("_changeDataFilePath", (event, dataFilePath) => {
    let pWin = electron_1.BrowserWindow.fromWebContents(event.sender);
    let id = "changeDataFileConfirm";
    (0, DialogMainHelper_1.openCommonDialog)(pWin, {
        id,
        type: "confirm",
        title: "修改存储位置",
        content: `${appConfig.appName}将重新启动以完成数据文件的转移。是否继续？`,
        okBtn: "是",
        cancelBtn: "否",
    });
    electron_1.ipcMain.once("_openCommonDialog_" + id, async (event, data) => {
        if (data === "ok" || data._ok) {
            (0, MainHelper_1.setSysStore)("newDataFilePath", dataFilePath);
            (0, MainHelper_1.relaunchApp)();
            electron_1.app.exit();
        }
        if (data === "cancel") {
            await TabHelper_1.default.showTab("tab_setting");
            setTimeout(() => {
                let bv = TabHelper_1.default.getBrowserViewById("tab_setting");
                if (bv) {
                    bv.webContents.send("_cancelChangeDataFilePath");
                }
            }, 500);
        }
    });
});
electron_1.ipcMain.handle("_getMessageDataSize", (event) => {
    let dataFilePath = getDataFilePath();
    let puid = (0, UserHelper_1.getUID)();
    if (!puid) {
        return 0;
    }
    let dataBasePath = path_1.default.join(dataFilePath, "databases", puid);
    if (!dataBasePath) {
        return 0;
    }
    let dataSize = 0;
    let msgDbPath = path_1.default.join(dataBasePath, "chat_message.db");
    if (fs_1.default.existsSync(msgDbPath)) {
        dataSize += fs_1.default.statSync(msgDbPath).size;
    }
    let msgDevDbPath = path_1.default.join(dataBasePath, "chat_message__dev.db");
    if (fs_1.default.existsSync(msgDevDbPath)) {
        dataSize += fs_1.default.statSync(msgDevDbPath).size;
    }
    let msgImgPath = path_1.default.join(dataFilePath, "files/message_images", puid);
    if (!fs_1.default.existsSync(msgImgPath)) {
        return dataSize;
    }
    dataSize += (0, FileUtil_1.countFolderSize)(msgImgPath);
    return dataSize;
});
electron_1.ipcMain.on("_clearMessageData", (event) => {
    let msgTab = TabHelper_1.default.getSubTab("tab_message_sub");
    if (msgTab && !msgTab.isDestroyed()) {
        msgTab.view.webContents.send("deleteAllMessageRecord");
        let dataFilePath = getDataFilePath();
        let puid = (0, UserHelper_1.getUID)();
        if (!puid) {
            return;
        }
        let msgImgPath = path_1.default.join(dataFilePath, "files/message_images", puid);
        if (fs_1.default.existsSync(msgImgPath)) {
            (0, FileUtil_1.deleteDir)(msgImgPath);
        }
        event.sender.send("clearMessageDataFinished");
    }
});
electron_1.ipcMain.on("_setOpenAtOsLogin", (event, autoOpen) => {
    setOpenAtOsLogin(autoOpen);
});
function setOpenAtOsLogin(autoOpen) {
    if (autoOpen) {
        electron_1.app.setLoginItemSettings({ openAtLogin: true });
    }
    else {
        electron_1.app.setLoginItemSettings({ openAtLogin: false });
    }
    (0, AppSystemConfigMainHelper_1.setAppSystemConfig)("openAtOsLogin", autoOpen);
}
electron_1.ipcMain.handle("_getAppDownloadUrl", () => {
    return appConfig.downloadUrl;
});
electron_1.ipcMain.handle("_getAppShowName", () => {
    return appConfig.appName;
});
electron_1.ipcMain.handle("_uploadLogToCloudDisk", (event) => {
    const senderWebContents = event.sender;
    return logUpload
        .uploadLogToCloudDisk((alreadySendSize, totalSize) => {
        if (!senderWebContents.isDestroyed() && !senderWebContents.isCrashed()) {
            senderWebContents.send("uploadLogToCloudDiskProgress", {
                alreadySendSize,
                totalSize,
            });
        }
    })
        .then((data) => {
        return data;
    })
        .catch((err) => {
        console.error("uploadLogToCloudDisk error:", err);
        return { result: 0, success: false };
    });
});
electron_1.ipcMain.handle("_getLanguage", (event) => {
    return (0, LoginMainHelper_1.getCurLanguage)();
});
electron_1.ipcMain.on("_showPersonInfoWindow", (event, parms) => {
    const { colorMode = "light", classPoints } = parms;
    (0, MainHelper_1.setTempStore)("focusMainWindowAfterClose", false);
    let curPoint = electron_1.screen.getCursorScreenPoint();
    let bounds = electron_1.screen.getDisplayNearestPoint(curPoint).workArea;
    let width = 340;
    let height = 200;
    let x = curPoint.x;
    let y = curPoint.y;
    if (x + width > bounds.x + bounds.width) {
        x = bounds.x + bounds.width - width;
    }
    if (y + height > bounds.y + bounds.height) {
        y = curPoint.y - height;
    }
    const id = WinId_1.default.PersonInfoWindow;
    const oldWin = (0, BrowserHelper_1.getWindowInWindowMap)(id);
    if (oldWin && !oldWin.isDestroyed()) {
        oldWin.close();
    }
    const url = "sview:/#/personalCard";
    const show = colorMode === "dark" ? false : true;
    let pWin = electron_1.BrowserWindow.fromWebContents(event.sender);
    let win = (0, BrowserHelper_1.createBrowserWindow)({
        id,
        x,
        y,
        width,
        height,
        frame: false,
        resizable: false,
        parent: pWin,
        show: show,
        webPreferences: {
            nodeIntegration: true,
            preload: (0, LoadUrlHelper_1.getPreloadJs)(id, url),
            contextIsolation: true,
        },
        paintWhenInitiallyHidden: true,
    });
    win.on("closed", (event) => {
        const focusMainWindowAfterClose = (0, MainHelper_1.getTempStore)("focusMainWindowAfterClose");
        if (focusMainWindowAfterClose === true) {
            event.preventDefault();
            const mainWindow = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
            if (mainWindow && mainWindow.isDestroyed() === false) {
                setTimeout(() => {
                    mainWindow.show();
                }, 500);
            }
        }
    });
    win.webContents.loadURL((0, LoadUrlHelper_1.getUrl)(url));
    let readyData = {
        puid: parms.puid,
        myPuid: (0, UserHelper_1.getUID)(),
        colorMode,
        classPoints,
    };
    win.webContents.send("ready", readyData);
    win.webContents.on("did-start-loading", () => {
        win.webContents.send("ready", readyData);
    });
    win.webContents.on("did-stop-loading", () => {
        win.webContents.send("ready", readyData);
    });
});
electron_1.ipcMain.handle("_updateStuShowRecord", (event, parms) => {
    return MeetOut.UpdateStuShowRecord(parms.puid, parms.status, parms.meetUuid, parms.requestUuid);
});
electron_1.ipcMain.handle("_getUser", (event) => {
    let user = (0, UserHelper_1.getUser)();
    if (!user || !user.puid) {
        setTimeout(() => {
            user = (0, UserHelper_1.getUser)();
            if (!user || !user.puid) {
                if (new Date().getTime() - LoginMainHelper_1.LoginConfig.loginEndTime > 10000) {
                    (0, LoginMainHelper_1.loginEnd)(0);
                }
            }
        }, 800);
    }
    return user;
});
electron_1.ipcMain.handle("_getPriUser", (event) => {
    let user = UserHelper_1.default.getPriUser();
    if (!user || !user.puid) {
        setTimeout(() => {
            user = (0, UserHelper_1.getUser)();
            if (!user || !user.puid) {
                (0, LoginMainHelper_1.loginEnd)(0);
            }
        }, 800);
    }
    return user;
});
function initLanguage() {
    let language = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)().language;
    let languageValue = language;
    languageValue = (0, LoginMainHelper_1.getCurLanguage)();
    updateChaoxingCookie("browserLocale", languageValue);
    const cookie = {
        url: `https://wps1.cldisk.com`,
        name: "lang",
        domain: "cldisk.com",
        value: languageValue.replace("_", "-"),
    };
    electron_1.session.defaultSession.cookies.set(cookie).then(() => {
        electron_1.session.defaultSession.cookies.flushStore().then(() => {
            console.log("updateCookie:wps1.cldisk.com:flushStore:lang", languageValue);
        });
    });
}
electron_1.ipcMain.on("_setShotKey", (event, shortCutKey) => {
    console.log("shortCutKey", shortCutKey);
    console.log("currentShortcut", currentShortcut);
    if (currentShortcut.length > 0) {
        electron_1.globalShortcut.unregister(currentShortcut);
    }
    if (shortCutKey) {
        console.log("zhuceSHOTkuaijiejian");
        electron_1.globalShortcut.register(shortCutKey, () => {
            (0, ScreenshotMainHelper_1.startScreenShot)();
        });
    }
    currentShortcut = shortCutKey;
});
electron_1.ipcMain.on("_setOpenStudyKey", (event, key) => {
    console.log("OpenStudyKey", key);
    console.log("currentOpenStudy", currentOpenStudy);
    if (currentOpenStudy.length > 0) {
        electron_1.globalShortcut.unregister(currentOpenStudy);
    }
    if (key) {
        console.log("zhuceOPENkuaijiejian");
        currentOpenStudy = key;
        electron_1.globalShortcut.register(key, () => {
            toggleMainWindow();
        });
    }
});
electron_1.ipcMain.on("_setKeyDefault", (event, param) => {
    console.log("_setKeyDefault", param);
    if (param) {
        console.log("sendMsgKey", defaultSendMsg);
        (0, MainHelper_1.setSysStore)("sendMsgKey", defaultSendMsg);
        if (currentShortcut != defaultShortcut) {
            if (currentShortcut) {
                electron_1.globalShortcut.unregister(currentShortcut);
            }
            electron_1.globalShortcut.register(defaultShortcut, () => {
                currentShortcut = defaultShortcut;
                (0, ScreenshotMainHelper_1.startScreenShot)();
            });
            console.log("defaultShortcut", defaultShortcut);
            (0, MainHelper_1.setSysStore)("screenShotKeys", defaultShortcut);
        }
        if (currentOpenStudy) {
            electron_1.globalShortcut.unregister(currentOpenStudy);
            (0, MainHelper_1.setSysStore)("openStudyKeys", "");
        }
    }
});
function setGlobalKeys() {
    if ((0, AppSystemConfigMainHelper_1.getAppSystemConfig)().appMode != "normal") {
        return;
    }
    const sendMsgKeys = StoreHelper_1.default.getSystem().get("sendMsgKey");
    if (sendMsgKeys === "" || typeof sendMsgKeys === "string") {
        console.log("fasongxiaoxi", sendMsgKeys);
    }
    else {
        (0, MainHelper_1.setSysStore)("sendMsgKey", defaultSendMsg);
    }
    const screenShotKeys = StoreHelper_1.default.getSystem().get("screenShotKeys");
    if (screenShotKeys === "" || typeof screenShotKeys === "string") {
        let key = screenShotKeys;
        currentShortcut = screenShotKeys;
        console.log("start-shot-key", key);
        if (key) {
            try {
                electron_1.globalShortcut.register(key, () => {
                    (0, ScreenshotMainHelper_1.startScreenShot)();
                });
            }
            catch (error) { }
        }
    }
    else {
        (0, MainHelper_1.setSysStore)("screenShotKeys", defaultShortcut);
        electron_1.globalShortcut.register(defaultShortcut, () => {
            (0, ScreenshotMainHelper_1.startScreenShot)();
        });
    }
    const openStudyKeys = StoreHelper_1.default.getSystem().get("openStudyKeys");
    if (openStudyKeys === "" || typeof openStudyKeys === "string") {
        let key = openStudyKeys;
        currentOpenStudy = openStudyKeys;
        console.log("start-openStudy-key", key);
        if (key) {
            electron_1.globalShortcut.register(key, () => {
                toggleMainWindow();
            });
        }
    }
}
function toggleMainWindow() {
    if (m_mainWindow.isFocused()) {
        m_mainWindow.close();
    }
    else {
        m_mainWindow.show();
    }
}
electron_1.ipcMain.handle("_isShortcutConflict", (event, keys) => {
    return isShotConflict(keys);
});
function isShotConflict(keys) {
    if (keys) {
        try {
            return electron_1.globalShortcut.isRegistered(keys);
        }
        catch (error) {
            console.log("快捷键冲突", error);
        }
    }
    else {
        const screenShotKeys = StoreHelper_1.default.getSystem().get("screenShotKeys");
        if (screenShotKeys === "" || typeof screenShotKeys === "string") {
            let key = screenShotKeys;
            currentShortcut = screenShotKeys;
            if (key.length > 0) {
                try {
                    return electron_1.globalShortcut.isRegistered(key);
                }
                catch (error) {
                    console.log("快捷键冲突", error);
                }
            }
            else {
                return true;
            }
        }
        else {
            try {
                return electron_1.globalShortcut.isRegistered(defaultShortcut);
            }
            catch (error) {
                console.log("快捷键冲突", error);
            }
        }
    }
}
electron_1.ipcMain.handle("_isOpenStudyConflict", (event, keys) => {
    return isOpenStudyConflict(keys);
});
function isOpenStudyConflict(keys) {
    if (keys) {
        return electron_1.globalShortcut.isRegistered(keys);
    }
    else {
        const openStudyKeys = StoreHelper_1.default.getSystem().get("openStudyKeys");
        if (openStudyKeys === "" || typeof openStudyKeys === "string") {
            let key = openStudyKeys;
            if (key.length > 0) {
                return electron_1.globalShortcut.isRegistered(key);
            }
            else {
                return true;
            }
        }
        else {
            return true;
        }
    }
}
function isConflict() {
    const setKeysConflictWarn = StoreHelper_1.default.getSystem().get("setKeysConflictWarn");
    let isLogin = typeof UserHelper_1.default.getUID() != "undefined";
    if (setKeysConflictWarn &&
        isLogin &&
        (!isShotConflict() || !isOpenStudyConflict())) {
        isConflictDialog();
        (0, MainHelper_1.setTempStore)("openConflictDialog", 1);
    }
}
function isConflictDialog() {
    let url = "sview:/#/checkKeyClash";
    let mainWin = (0, BrowserHelper_1.getWindowInWindowMap)(WinId_1.default.MainWindow);
    let win = (0, BrowserHelper_1.createBrowserWindow)({
        id: WinId_1.default.KeyConflictWindow,
        width: 460,
        height: 228,
        parent: mainWin,
        transparent: true,
        frame: false,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: (0, LoadUrlHelper_1.getPreloadJs)(WinId_1.default.KeyConflictWindow, url),
        },
    });
    win.on("ready-to-show", () => {
        if (process.platform == "win32") {
            win.blur();
            setTimeout(() => {
                win.focus();
            }, 1);
        }
    });
    win.webContents.on("did-start-loading", () => {
        win.show();
    });
    url = (0, LoadUrlHelper_1.getUrl)("sview:/#/checkKeyClash");
    win.loadURL(url);
}
electron_1.ipcMain.on("_openShortcutKeys", async (event) => {
    await TabHelper_1.default.showTab("tab_setting");
    setTimeout(() => {
        let bv = TabHelper_1.default.getBrowserViewById("tab_setting");
        if (bv) {
            bv.webContents.send("SET_KEYS_AGAIN");
        }
    }, 800);
});
electron_1.ipcMain.on("_refreshView", (event) => {
    (0, BrowserHelper_1.reloadView)(event.sender);
});
electron_1.ipcMain.on("CLIENT_AICHAT_APP", async (event) => {
    await TabHelper_1.default.showTab("tab_message");
    await TabHelper_1.default.showSubTab("tab_message");
    let bv = TabHelper_1.default.getBrowserViewById("tab_message");
    if (bv) {
        bv.webContents.send("OPEN_AI_CHAT");
    }
});
electron_1.ipcMain.on("_screenShotFinished", (event, data) => {
    let msgSubTab = getMessageSubTab();
    if (msgSubTab && !msgSubTab.isDestroyed()) {
        msgSubTab.getWebContents().send("screenShotFinished", data);
    }
});
TrayHelper_1.default.on("preOpenTrayMsgPop", () => {
    let msgSubTab = getMessageSubTab();
    if (msgSubTab && !msgSubTab.isDestroyed()) {
        msgSubTab.getWebContents().send("_preOpenTrayMsgPop");
    }
});
electron_1.ipcMain.on("_openThisMessage", async (event, data) => {
    if (m_mainWindow.isDestroyed()) {
        return;
    }
    if (m_mainWindow.isVisible()) {
        m_mainWindow.focus();
    }
    else {
        m_mainWindow.show();
    }
    await TabHelper_1.default.showTab("tab_message");
    await TabHelper_1.default.showSubTab("tab_message");
    let bv = TabHelper_1.default.getBrowserViewById("tab_message");
    if (bv) {
        bv.webContents.send("OPEN_THIS_MESSAGE", data);
    }
});
electron_1.ipcMain.handle("_getAppMode", (event) => {
    return appConfig.appMode;
});
electron_1.ipcMain.on("_EscapeKeydown", (event) => {
    let win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (!win) {
        return;
    }
    if (win.isFullScreen() || win.isSimpleFullScreen()) {
        return;
    }
    if (win.webContents != event.sender) {
        return;
    }
    let winId = win.webContents._id;
    if (!winId) {
        return;
    }
    if (winId == "activity") {
        win.close();
    }
});
function registerManyTabEvent() {
    (0, DevHelper_1.on)("appMemoryToLarge", (appMemory) => {
        let tabCount = TabHelper_1.default.getAllSubMenuCount();
        if (tabCount > 30) {
            (0, MainWindowPopHelper_1.showTabCountMaxPop)();
        }
    });
}
electron_1.ipcMain.on("_saveLocalFileAs", async (event, filePath, fileName) => {
    if (!fs_1.default.existsSync(filePath)) {
        return;
    }
    let extname = path_1.default.extname(fileName)?.substring(1);
    let chooseResult = await electron_1.dialog.showSaveDialog(electron_1.BrowserWindow.fromWebContents(event.sender), {
        defaultPath: fileName,
        filters: [{ name: extname, extensions: [extname] }],
    });
    if (!chooseResult.canceled &&
        chooseResult.filePath &&
        filePath != chooseResult.filePath) {
        fs_1.default.copyFileSync(filePath, chooseResult.filePath);
    }
});
electron_1.ipcMain.on("_openContactsPage", async (event) => {
    await TabHelper_1.default.showTab("tab_message");
    await TabHelper_1.default.showSubTab("tab_message");
    let messageBv = TabHelper_1.default.getBrowserViewById("tab_message");
    if (messageBv && messageBv.webContents) {
        messageBv.webContents.send("openContactsPage");
    }
});
electron_1.ipcMain.on("_setVisibleOnAllWorkspaces", (event, enable) => {
    if (process.platform == "darwin") {
        let win = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (enable) {
            win.setVisibleOnAllWorkspaces(true, {
                visibleOnFullScreen: true,
                skipTransformProcessType: false,
            });
        }
        else {
            win.setVisibleOnAllWorkspaces(false);
        }
        setTimeout(() => {
            electron_1.app.dock.show();
        }, 300);
    }
});
function getLocalFileContent(path) {
    return promises_1.default.readFile(path);
}
electron_1.ipcMain.handle("_getLocalFileContent", (event, path) => {
    return getLocalFileContent(path);
});
async function receiveFile(filePath, data) {
    const dirPath = path_1.default.dirname(filePath);
    try {
        await promises_1.default.mkdir(dirPath, { recursive: true });
    }
    catch (err) {
        console.error(`Error creating directory: ${dirPath}`, err);
        throw err;
    }
    return promises_1.default.writeFile(filePath, Buffer.from(data));
}
electron_1.ipcMain.handle("_receiveFile", (event, path, data) => {
    return receiveFile(path, data);
});
const buildFolderStructure = async (dirPath, baseDir) => {
    const stat = await promises_1.default.stat(dirPath);
    const relativePath = path_1.default.relative(baseDir, dirPath);
    const rootFolderName = path_1.default.basename(baseDir);
    const rootFolderPath = baseDir;
    if (stat.isFile()) {
        return {
            name: path_1.default.basename(dirPath),
            type: "file",
            path: dirPath,
            relativePath,
            rootFolderName,
            rootFolderPath,
            size: stat.size,
        };
    }
    else if (stat.isDirectory()) {
        const children = await promises_1.default.readdir(dirPath);
        const childrenData = await Promise.all(children.map((child) => buildFolderStructure(path_1.default.join(dirPath, child), baseDir)));
        const folderSize = childrenData
            .filter((child) => child.type === "file")
            .reduce((total, file) => total + file.size, 0);
        const fileCount = childrenData.filter((child) => child.type === "file").length +
            childrenData
                .filter((child) => child.type === "folder")
                .reduce((count, folder) => count + folder.fileCount, 0);
        return {
            name: path_1.default.basename(dirPath),
            type: "folder",
            path: dirPath,
            relativePath,
            rootFolderName,
            folderSize,
            fileCount,
            rootFolderPath,
            children: childrenData,
        };
    }
};
const buildMultipleFolderStructures = async (folderPaths) => {
    return Promise.all(folderPaths.map((folderPath) => buildFolderStructure(folderPath, folderPath)));
};
electron_1.ipcMain.handle("_buildMultipleFolderStructures", (event, folderPaths) => {
    return buildMultipleFolderStructures(folderPaths);
});
electron_1.ipcMain.handle("_openFileInManagerAndSelect", (_e, filePath) => {
    return (0, FileMainHelper_1.openFileInManagerAndSelect)(filePath);
});
const windowTrackers = new Map();
const MouseTracker = {
    startTracking(win) {
        const winId = win.id;
        if (windowTrackers.has(winId))
            return;
        const tracker = {
            isMouseInWindow: false,
            interval: setInterval(() => {
                const mousePoint = electron_1.screen.getCursorScreenPoint();
                const bounds = win.getBounds();
                const isIn = mousePoint.x >= bounds.x &&
                    mousePoint.x <= bounds.x + bounds.width &&
                    mousePoint.y >= bounds.y &&
                    mousePoint.y <= bounds.y + bounds.height;
                if (isIn !== tracker.isMouseInWindow) {
                    tracker.isMouseInWindow = isIn;
                    win.webContents.send("mouse-in-window", isIn);
                }
            }, 100),
            cleanup: () => {
                clearInterval(tracker.interval);
                windowTrackers.delete(winId);
            },
        };
        windowTrackers.set(winId, tracker);
        win.on("closed", () => {
            tracker.cleanup();
        });
    },
    stopTracking(win) {
        const winId = win.id;
        const tracker = windowTrackers.get(winId);
        if (tracker)
            tracker.cleanup();
    },
};
electron_1.ipcMain.handle("_startTrackMouse", (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    MouseTracker.startTracking(win);
});
electron_1.ipcMain.handle("_stopTrackMouse", (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    MouseTracker.stopTracking(win);
});
function getPcDeviceInfo() {
    let uaInfo = (0, UaUtils_1.parseUserAgentInfo)((0, SessionCookie_2.getUa)());
    let deviceId = uaInfo.deviceId;
    let appName = appConfig.appName;
    let deviceName = (0, DeviceUtil_1.getPrettyName)();
    let os = "";
    if (process.platform == "win32") {
        os = "windows";
    }
    else if (process.platform == "darwin") {
        os = "mac";
    }
    else if (process.platform == "linux") {
        os = "linux";
    }
    const clientTypeMap = {
        1000381: "blackboard",
        1000397: "blackboard",
        1000371: "xxt",
        1000378: "xxt",
    };
    const productId = uaInfo.productId;
    const clientType = clientTypeMap[productId] ?? productId;
    let autoLoginStatus = (0, AppSystemConfigMainHelper_1.getAppSystemConfig)().autoLogin;
    const nextLoginToConfirm = AccountUtil.getAccount((0, UserHelper_1.getUID)())?.nextLoginToConfirm ?? false;
    return {
        productId,
        clientType,
        deviceId,
        appName,
        deviceName,
        os,
        autoLoginStatus,
        nextLoginNoConfirm: nextLoginToConfirm,
    };
}
electron_1.ipcMain.handle("_getPcDeviceInfo", (event) => {
    return getPcDeviceInfo();
});
electron_1.ipcMain.handle("_osIsLowerThanWin10", () => {
    return (0, CommonUtil_1.osIsLowerThanWin10)();
});
function getCurTabMenu(win) {
    if (win == m_mainWindow) {
        return (0, TabHelper_1.getCurTab)();
    }
    else {
        return (0, WindowTabHelper_1.getCurWindowTab)(win);
    }
}
//# sourceMappingURL=main.js.map