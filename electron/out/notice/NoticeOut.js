"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoticeOut = void 0;
const RequestUtil_1 = require("../../utils/RequestUtil");
const TokenUtil_1 = require("../../utils/TokenUtil");
const sessionCookie = require("../../main/SessionCookie");
const TIMEOUT = 5000;
const m_RequestUtil = new RequestUtil_1.RequestUtil();
const config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};
const getProductIdFromUa = () => {
    let productId = "";
    let ua = sessionCookie.getUa();
    const prefix = "ChaoXingStudy_";
    const index = ua.indexOf(prefix);
    if (index !== -1) {
        try {
            let csstudyAfter = ua.substring(index + prefix.length);
            let arr = csstudyAfter.split("_");
            productId = arr[0];
        }
        catch (e) {
            console.error(e);
        }
    }
    return productId;
};
const responseType = 'json';
const BASE_URL = "https://notice.chaoxing.com";
const GET_NOTICE_DATA_URL = "/apis/notice/pullNoticeData_v2";
const GET_NOTICE_FOLDER_URL = "/apis/notice/pullFolderData";
const GET_NOTICE_CHANGE_STATUS_URL = "/apis/notice/getDataChangeStatus";
const GET_NOTICE_DRAFT_DATA_URL = "/apis/draft/getNoticeDrafts";
class NoticeOut {
    constructor() {
    }
    getNoticeData(puid, lastId, lastTime, pageSize) {
        let parms = { puid, lastId, lastTime, pageSize: pageSize + '' };
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: '',
            getParams: parms,
            tokenSign: true
        });
        return m_RequestUtil.get(`${BASE_URL}${GET_NOTICE_DATA_URL}${tokenUrl}`, {}, undefined, TIMEOUT)
            .then(data => {
            return data.json().then(value => {
                return value;
            });
        });
    }
    getNoticeFolderData(puid, lastTime, pageSize) {
        let parms = { puid, lastTime, pageSize: pageSize + '', filterFolder: '0' };
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: '',
            getParams: parms,
            tokenSign: true
        });
        return m_RequestUtil.get(`${BASE_URL}${GET_NOTICE_FOLDER_URL}${tokenUrl}`, {}, undefined, TIMEOUT)
            .then(data => {
            return data.json().then(value => {
                return value;
            });
        });
    }
    getDataChangeStatus(puid, folderLastTime, noticeLastTime) {
        let parms = { puid, productId: getProductIdFromUa(), folderLastTime, noticeLastTime };
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: '',
            getParams: parms,
            tokenSign: true
        });
        return m_RequestUtil.get(`${BASE_URL}${GET_NOTICE_CHANGE_STATUS_URL}${tokenUrl}`, {}, undefined, TIMEOUT)
            .then(data => {
            return data.json().then(value => {
                return value;
            });
        });
    }
    getNoticeDraftData(puid, updateTime, pageSize) {
        let parms = { puid, updateTime, pageSize: pageSize + '' };
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: '',
            getParams: parms,
            tokenSign: true
        });
        return m_RequestUtil.get(`${BASE_URL}${GET_NOTICE_DRAFT_DATA_URL}${tokenUrl}`, {}, undefined, TIMEOUT)
            .then(data => {
            return data.json().then(value => {
                return value;
            });
        });
    }
}
let m_NoticeOut = new NoticeOut();
exports.NoticeOut = m_NoticeOut;
module.exports = { NoticeOut: m_NoticeOut };
//# sourceMappingURL=NoticeOut.js.map