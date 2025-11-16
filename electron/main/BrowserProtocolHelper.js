"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleProtocolArg = exports.registerDefaultProtocolClient = exports.checkFromProtocol = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const UserHelper_1 = require("./UserHelper");
const MainHelper_1 = require("./MainHelper");
const OpenketangProtocolHepler_1 = require("./OpenketangProtocolHepler");
const DialogMainHelper_1 = require("./DialogMainHelper");
const StoreKey_1 = require("../common/StoreKey");
const LoginMainHelper_1 = require("./LoginMainHelper");
const { MeetOut } = require("../out/meet/MeetOut");
const PROTOCOLS = ["ChaoxingStudyPc", "ChaoxingClassroomPc"];
let m_ProtocolArg;
function checkFromProtocol(argv) {
    if (argv) {
        PROTOCOLS.forEach((PROTOCOL) => {
            const prefix = `${PROTOCOL}://`;
            let offset = 0;
            if (process.platform == "win32") {
                offset = electron_1.app.isPackaged ? 1 : 2;
            }
            const url = argv.find((arg, i) => i >= offset && arg.toLowerCase().startsWith(prefix.toLowerCase()));
            if (url) {
                m_ProtocolArg = url.substring(url.indexOf("://") + 3);
                if (m_ProtocolArg &&
                    "/" == m_ProtocolArg.charAt(m_ProtocolArg.length - 1)) {
                    m_ProtocolArg = m_ProtocolArg.substring(0, m_ProtocolArg.length - 1);
                }
                if (electron_1.app.isReady()) {
                    setTimeout(() => {
                        handleProtocolArg();
                    }, 500);
                }
                return true;
            }
        });
    }
    return false;
}
exports.checkFromProtocol = checkFromProtocol;
function registerDefaultProtocolClient() {
    PROTOCOLS.forEach((PROTOCOL) => {
        if (electron_1.app.isPackaged) {
            electron_1.app.setAsDefaultProtocolClient(PROTOCOL);
        }
        else {
            electron_1.app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [
                path_1.default.resolve(process.argv[1]),
            ]);
        }
    });
    if (process.platform === "darwin") {
        electron_1.app.on("open-url", function (event, urlStr) {
            console.info("mac-protocol-" + urlStr);
            checkFromProtocol([urlStr]);
        });
    }
    else {
        electron_1.app.on("second-instance", async (event, argv) => {
            console.info("win-protocol-" + argv);
            checkFromProtocol(argv);
        });
    }
}
exports.registerDefaultProtocolClient = registerDefaultProtocolClient;
async function handleProtocolArg(retry = false) {
    if (retry) {
        let protocolOpenTime = (0, MainHelper_1.getTempStore)(StoreKey_1.StoreKey.protocolOpenTime);
        if (!protocolOpenTime || Date.now() - protocolOpenTime > 1000 * 60 * 2) {
            return;
        }
        m_ProtocolArg = (0, MainHelper_1.getTempStore)(StoreKey_1.StoreKey.protocolArg);
    }
    if (!m_ProtocolArg) {
        return;
    }
    console.log("handleProtocolArg:", m_ProtocolArg);
    const protocolParams = (0, OpenketangProtocolHepler_1.getProtocolParams)(m_ProtocolArg);
    const type = protocolParams.get("open_type");
    const browser_uid = protocolParams.get("browser_uid");
    const from = protocolParams.get("from") || "";
    if (browser_uid && !(0, OpenketangProtocolHepler_1.checkLoginUser)(browser_uid)) {
        if (!retry) {
            (0, MainHelper_1.setTempStore)(StoreKey_1.StoreKey.protocolArg, m_ProtocolArg);
            (0, MainHelper_1.setTempStore)(StoreKey_1.StoreKey.protocolOpenTime, Date.now());
        }
        if (!(0, UserHelper_1.getUID)()) {
            console.info("打开课堂失败，获取到uid为空,打开登录页面------------------------");
            (0, LoginMainHelper_1.openLogin)();
            return;
        }
        (0, DialogMainHelper_1.openCommonDialog)(undefined, {
            type: "confirm",
            content: "当前登录账号与唤醒页账号不一致， 请使用唤醒页账号重新登录。",
            okBtn: "重新登陆",
            cancelBtn: "取消",
        }).then((value) => {
            if (value && value._ok) {
                (0, LoginMainHelper_1.loginOut)();
            }
        });
        return;
    }
    const puid = (0, UserHelper_1.getUID)();
    const ext = protocolParams.get("ext");
    switch (type) {
        case "enterMeeting":
            const meet_uuid = protocolParams.get("meet_uuid");
            if (meet_uuid) {
                (0, OpenketangProtocolHepler_1.openMeeting)(`https://k.chaoxing.com/pc/meet/meeting?uuid=${meet_uuid}&from=${from}&v=v2&ext=${ext}`, null, null);
            }
            break;
        case "url":
            let openurl = protocolParams.get("openurl");
            if (openurl) {
                openurl = decodeURIComponent(openurl);
                if (openurl.indexOf("meeting?") != -1) {
                    if (openurl.indexOf("ext") == -1) {
                        openurl = `${openurl}&ext=${ext}`;
                    }
                    (0, OpenketangProtocolHepler_1.openMeeting)(openurl, null, null);
                }
                else {
                    (0, MainHelper_1.openNewWindow)(null, { url: openurl });
                }
            }
            break;
        case "openMeeting":
            const courseId = protocolParams.get("courseId");
            const classId = protocolParams.get("classId");
            const ut = protocolParams.get("ut") || "u";
            const online = protocolParams.get("online") || "1";
            if (courseId && courseId) {
                if (online == "0") {
                    (0, OpenketangProtocolHepler_1.openMeeting)(`https://k.chaoxing.com/pc/meet/meeting?courseId=${courseId}&classId=${classId}&online=${online}&from=${from}&v=v2&ext=${ext}`, null, null);
                    return;
                }
                MeetOut.getMeetClassInfo(courseId, classId, puid).then((res) => {
                    let { count, uuids } = res;
                    if (count == 0) {
                        if (ut == "t") {
                            MeetOut.GetOrCreateMeeting(courseId, classId, puid).then((res) => {
                                let { uuid } = res;
                                if (uuid) {
                                    (0, OpenketangProtocolHepler_1.openMeeting)(`https://k.chaoxing.com/pc/meet/meeting?uuid=${uuid}&from=${from}&v=v2&ext=${ext}`, null, null);
                                }
                            });
                        }
                        else {
                            (0, DialogMainHelper_1.openCommonDialog)(undefined, {
                                type: "alert",
                                content: "该班级暂无在线课堂",
                            }).then((res) => { });
                        }
                    }
                    else if (count == 1) {
                        const uuid = uuids[0];
                        (0, OpenketangProtocolHepler_1.openMeeting)(`https://k.chaoxing.com/pc/meet/meeting?uuid=${uuid}&from=${from}&v=v2&ext=${ext}`, null, null);
                    }
                    else if (count > 1) {
                        (0, OpenketangProtocolHepler_1.openSelectMeetView)(courseId, classId);
                    }
                });
            }
            break;
        default:
    }
    m_ProtocolArg = undefined;
}
exports.handleProtocolArg = handleProtocolArg;
(0, UserHelper_1.onUserLogin)(() => {
    handleProtocolArg(true);
});
module.exports = {
    checkFromProtocol,
    registerDefaultProtocolClient,
    handleProtocolArg,
};
//# sourceMappingURL=BrowserProtocolHelper.js.map