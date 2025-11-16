"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetOut = void 0;
const NetUtil_1 = require("../../main/util/NetUtil");
const { TokenUtil } = require("../../utils/TokenUtil");
const TIMEOUT = 10000;
const responseType = "json";
const BASE_URL = "https://k.chaoxing.com";
const GET_MEET_CLASS_INFO = BASE_URL + "/apis/meet/getClassMeetInfo";
const GET_OR_CREATE_MEETING = BASE_URL + "/apis/meet/getOrCreateMeeting";
const CHECK_JOIN_MEET = BASE_URL + "/apis/meet/checkJoinMeet";
const UPDATE_STU_SHOW_RECORD = "https://appswh.chaoxing.com/board/apis/showrecord/updateStuShowRecord";
class MeetOut {
    constructor() {
    }
    getMeetClassInfo(courseId, classId, puid) {
        let requestParams = {
            url: "",
            getParams: {
                courseId,
                classId,
                puid,
            },
            tokenSign: true,
        };
        return new Promise((resolve, reject) => {
            (0, NetUtil_1.netRequestGet)(`${GET_MEET_CLASS_INFO}${TokenUtil.getRequestParams(requestParams) ?? ""}`)
                .then((response) => {
                if (response.ok) {
                    let meetClassCount;
                    let responseData = response.json();
                    if (responseData) {
                        if (responseData.result == 1) {
                            meetClassCount = responseData.data;
                        }
                    }
                    resolve(meetClassCount);
                }
                else {
                    reject(response.text);
                }
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    GetOrCreateMeeting(courseId, classId, puid) {
        let requestParams = {
            url: "",
            getParams: {
                courseId,
                classId,
                puid,
            },
            tokenSign: true,
        };
        return new Promise((resolve, reject) => {
            (0, NetUtil_1.netRequestGet)(`${GET_OR_CREATE_MEETING}${TokenUtil.getRequestParams(requestParams) ?? ""}`)
                .then((response) => {
                if (response.ok) {
                    let meetInfo;
                    let responseData = response.json();
                    if (responseData) {
                        if (responseData.result == 1) {
                            meetInfo = responseData.data;
                        }
                    }
                    resolve(meetInfo);
                }
                else {
                    reject(response.text);
                }
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    UpdateStuShowRecord(puid, status, meetUuid, requestUuid) {
        let requestParams = {
            url: "",
            getParams: {
                puid,
                status,
                meetUuid,
                requestUuid,
            },
            tokenSign: true,
        };
        return new Promise((resolve, reject) => {
            (0, NetUtil_1.netRequestGet)(`${UPDATE_STU_SHOW_RECORD}${TokenUtil.getRequestParams(requestParams) ?? ""}`)
                .then((response) => {
                if (response.ok) {
                    let responseData = response.json();
                    resolve(responseData);
                }
                else {
                    reject(response.text);
                }
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    checkJoinMeet(uuid, enterType, puid, ext) {
        let requestParams = {
            url: "",
            getParams: {
                uuid,
                enterType,
                puid,
            },
            tokenSign: true,
        };
        if (ext) {
            requestParams.getParams.ext = ext;
        }
        return new Promise((resolve, reject) => {
            var _a;
            (0, NetUtil_1.netRequestGet)(`${CHECK_JOIN_MEET}${(_a = TokenUtil.getRequestParams(requestParams)) !== null &&
                _a !== void 0
                ? _a
                : ""}`)
                .then((response) => {
                if (response.ok) {
                    resolve(response.json());
                }
                else {
                    reject(response.text);
                }
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
}
const m_MeetOut = new MeetOut();
exports.MeetOut = m_MeetOut;
module.exports = { MeetOut: m_MeetOut };
//# sourceMappingURL=MeetOut.js.map