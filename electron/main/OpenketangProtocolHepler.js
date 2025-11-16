"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGroupMeetingLink = exports.openLastMeeting = exports.isOpenMeetingView = exports.getProtocolParams = exports.checkLoginUser = exports.openSelectMeetView = exports.openMeeting = void 0;
const BrowserHelper_1 = require("./BrowserHelper");
const MainHelper_1 = require("./MainHelper");
const UrlUtils_1 = require("../utils/UrlUtils");
const UserHelper_1 = require("./UserHelper");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const sessionCookie = require("./SessionCookie");
const { MeetOut } = require("../out/meet/MeetOut");
const DialogMainHelper_1 = require("./DialogMainHelper");
const enc_key = "3P3SVeXM";
const GROUP_MEETING_KEY = "O)s$hk1D";
let m_LastMeetingParms;
function openMeeting(url, options, data) {
    if (!url) {
        return;
    }
    let newOptions = Object.assign({}, options);
    m_LastMeetingParms = { url, options: newOptions, data };
    const uuid = (0, UrlUtils_1.getUrlParamValue)(url, "uuid");
    const from = (0, UrlUtils_1.getUrlParamValue)(url, "from") || "";
    const online = (0, UrlUtils_1.getUrlParamValue)(url, "online") || "1";
    const ignore = (0, UrlUtils_1.getUrlParamValue)(url, "ignore") || "0";
    let ext = (0, UrlUtils_1.getUrlParamValue)(url, "ext");
    if (!options) {
        options = {
            id: "meetWindow",
            frame: false,
            width: 1200,
            height: 755,
            minWidth: 1200,
            minHeight: 755,
            extParams: {
                ketangFlag: true,
            },
        };
    }
    if (online == "0") {
        const classId = (0, UrlUtils_1.getUrlParamValue)(url, "classId");
        const courseId = (0, UrlUtils_1.getUrlParamValue)(url, "courseId");
        if (isOpenMeetingView() && ignore == "0") {
            (0, MainHelper_1.showWindow)(null, "meetWindow");
            (0, MainHelper_1.setTempStore)("openMeeting", {
                target: "meetWindow",
                action: "switchMeet",
                data: { url, courseId, classId, from, mode: "offline" },
            });
            return;
        }
        setTimeout(() => {
            let win = (0, MainHelper_1.openNewWindow)(null, { url, options, data }, null);
            if (win) {
                win.maximize();
            }
        }, 200);
    }
    else {
        if (!uuid) {
            return;
        }
        if (isOpenMeetingView() && ignore == "0") {
            console.info("打开课堂失败，有正在进行中的未关闭, ignore: ", ignore);
            (0, MainHelper_1.showWindow)(null, "meetWindow");
            (0, MainHelper_1.setTempStore)("openMeeting", {
                target: "meetWindow",
                action: "switchMeet",
                data: { url, uuid, from, mode: "online" },
            });
            return;
        }
        const enterType = (0, UrlUtils_1.getUrlParamValue)(url, "enterType") || "";
        const puid = (0, UserHelper_1.getUID)();
        MeetOut.checkJoinMeet(uuid, enterType, puid, ext)
            .then((res) => {
            const { result, errorMsg } = res;
            if (result != 1) {
                const { joinMeetNeedEnterPwd } = res?.data || {};
                if (joinMeetNeedEnterPwd) {
                    const classId = (0, UrlUtils_1.getUrlParamValue)(url, "classId");
                    const audioStatus = (0, UrlUtils_1.getUrlParamValue)(url, "audioStatus");
                    const videoStatus = (0, UrlUtils_1.getUrlParamValue)(url, "videoStatus");
                    const audit = (0, UrlUtils_1.getUrlParamValue)(url, "audit");
                    (0, MainHelper_1.openNewWindow)(null, {
                        url: `https://fe.chaoxing.com/front/ktmeet/pages/passwordBox.html?uuid=${uuid}&classId=${classId}&audioStatus=${audioStatus}&videoStatus=${videoStatus}&enterType=${audit}&from=${from}`,
                        options: {
                            id: "passwordJoin",
                            frame: false,
                            width: 320,
                            height: 220,
                            modal: true,
                            resizable: false,
                            minWidth: 320,
                            minHeight: 220,
                        },
                        data,
                    }, null);
                }
                else {
                    (0, DialogMainHelper_1.openCommonDialog)(undefined, {
                        type: "toast",
                        content: errorMsg || "",
                        top: 180,
                    }).then((res) => { });
                }
                return;
            }
            console.info("开始打开课堂", url);
            (0, MainHelper_1.openNewWindow)(null, { url, options, data }, null);
            if (isOpenMeetingView()) {
                (0, MainHelper_1.setTempStore)("openMeeting", {
                    target: from,
                    action: "closeView",
                    data: { uuid },
                });
            }
        })
            .catch((e) => {
            console.info("加入课堂校验失败", e);
        });
    }
}
exports.openMeeting = openMeeting;
function openSelectMeetView(courseId, classId) {
    if (!classId || !courseId) {
        return;
    }
    let url = `https://k.chaoxing.com/pc/meet/selectClassMeet?courseId=${courseId}&classId=${classId}&type=0`;
    let options = {
        id: "selectClassMeet",
        width: 410,
        height: 400,
        title: "选择课堂",
        minimizable: true,
        maximizable: false,
        closable: true,
        subWindow: true,
        modal: true,
    };
    (0, MainHelper_1.openNewWindow)(null, { url, options }, null);
}
exports.openSelectMeetView = openSelectMeetView;
function checkLoginUser(browser_uid) {
    if (!browser_uid) {
        return true;
    }
    const login_uid = (0, UserHelper_1.getUID)();
    const login_uid_enc = (0, CryptoUtil_1.parseEncString)(login_uid, enc_key);
    return (login_uid && (login_uid == browser_uid || login_uid_enc == browser_uid));
}
exports.checkLoginUser = checkLoginUser;
function getProtocolParams(url) {
    let map = new Map();
    if (!url) {
        return map;
    }
    const param = url.split("&");
    param.forEach(function (str) {
        let temp = str.split("=");
        if (temp.length > 1) {
            map.set(temp[0], temp[1]);
        }
    });
    return map;
}
exports.getProtocolParams = getProtocolParams;
function isOpenMeetingView() {
    let win = (0, BrowserHelper_1.getWindowInWindowMap)("meetWindow");
    if (win && !win.isDestroyed()) {
        return true;
    }
    else {
        return false;
    }
}
exports.isOpenMeetingView = isOpenMeetingView;
function openLastMeeting() {
    if (m_LastMeetingParms) {
        openMeeting(m_LastMeetingParms.url, m_LastMeetingParms.options, m_LastMeetingParms.data);
    }
}
exports.openLastMeeting = openLastMeeting;
function createGroupMeetingLink(groupChatId) {
    const fromType = "voiceCall";
    const chatId = (0, CryptoUtil_1.parseEncString)(groupChatId, GROUP_MEETING_KEY);
    return `https://k.chaoxing.com/pc/meet/create?fixedWindowSize=true&windowWidth=375&windowHeight=667&windowTitle=发起&fromType=${fromType}&chatId=${chatId}&v=v2`;
}
exports.createGroupMeetingLink = createGroupMeetingLink;
//# sourceMappingURL=OpenketangProtocolHepler.js.map