"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsOut = void 0;
const { AxiosUtil } = require("../../utils/AxiosUtil");
const RequestUtil_1 = require("../../utils/RequestUtil");
const TokenUtil_1 = require("../../utils/TokenUtil");
const TIMEOUT = 10000;
const m_RequestUtil = new RequestUtil_1.RequestUtil();
const config = {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
};
const responseType = "json";
const BASE_URL = "https://contactsyd.chaoxing.com";
const BASE_URL_STRUCTURE = "https://structureyd.chaoxing.com";
const GET_SEARCH_USER_URL = "/apis/roster/searchRosterUser";
const GET_USER_UNIT_LIST_URL = "/apis/roster/getUserUnitList";
class ContactsOut {
    constructor() {
        this.instance = new AxiosUtil(BASE_URL, TIMEOUT, responseType);
    }
    searchUser(puid, keyword) {
        let requestParams = {
            url: "",
            getParams: {
                puid,
            },
            postParams: {
                keyword,
            },
            tokenSign: true,
        };
        return new Promise((resolve, reject) => {
            this.instance
                .post(`${GET_SEARCH_USER_URL}${TokenUtil_1.TokenUtil.getRequestParams(requestParams) ?? ""}`, AxiosUtil.getPostFormData(requestParams?.postParams), config)
                .then((response) => {
                let userInfos;
                let responseData = response.data;
                if (responseData) {
                    if (responseData.result == 1) {
                        userInfos = responseData.data;
                    }
                }
                resolve(userInfos);
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    getUserUnitList(puid, from) {
        let parms = { puid, from };
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: "",
            getParams: parms,
            tokenSign: true,
        });
        return m_RequestUtil
            .get(`${BASE_URL}${GET_USER_UNIT_LIST_URL}${tokenUrl}`, {}, undefined, TIMEOUT)
            .then((data) => {
            return data.json().then((value) => {
                return value;
            });
        });
    }
    getStructureDept(puid, fid, offsetValue, pageSize) {
        let parms = {
            puid,
            fid,
            pageSize: pageSize + "",
            type: "unit",
        };
        if (offsetValue) {
            parms["offsetValue"] = offsetValue;
        }
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: "",
            getParams: parms,
            tokenSign: true,
        });
        return m_RequestUtil
            .get(`${BASE_URL_STRUCTURE}/apis/dept/getDepts4Client${tokenUrl}`, {}, undefined, TIMEOUT)
            .then((data) => {
            return data.json().then((value) => {
                return value;
            });
        });
    }
    getUnitDept(puid, fid, cpage = 1, pageSize, mcode) {
        let parms = {
            puid,
            fid,
            pageSize: pageSize + "",
            cpage: cpage + "",
            type: "unit",
            addHideUserTag: "1",
        };
        if (mcode) {
            parms["mcode"] = mcode;
        }
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: "",
            getParams: parms,
            tokenSign: true,
        });
        return m_RequestUtil
            .get(`${BASE_URL}/apis/dept/getDepts${tokenUrl}`, {}, undefined, TIMEOUT)
            .then((data) => {
            return data.json().then((value) => {
                return value;
            });
        });
    }
    getUsersByUnit(puid, fid, offsetValue, pageSize) {
        let parms = {
            puid,
            fid,
            pageSize: pageSize + "",
            type: fid != "-1" ? "byunit" : "bycustom",
        };
        if (offsetValue) {
            parms["offsetValue"] = offsetValue;
        }
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: "",
            getParams: parms,
            tokenSign: true,
        });
        return m_RequestUtil
            .get(`${BASE_URL}/apis/roster/getUsers${tokenUrl}`, {}, undefined, TIMEOUT)
            .then((data) => {
            return data.json().then((value) => {
                return value;
            });
        });
    }
    getUsersByStructure(puid, fid, offsetValue, pageSize) {
        let parms = {
            puid,
            fid,
            pageSize: pageSize + "",
            type: "byunit",
        };
        if (offsetValue) {
            parms["offsetValue"] = offsetValue;
        }
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: "",
            getParams: parms,
            tokenSign: true,
        });
        return m_RequestUtil
            .get(`${BASE_URL_STRUCTURE}/apis/roster/getUsers4Client${tokenUrl}`, {}, undefined, TIMEOUT)
            .then((data) => {
            return data.json().then((value) => {
                return value;
            });
        });
    }
    getUsersDeptsByUnit(puid, fid, offsetValue, offsetAuxValue, pageSize) {
        let parms = { puid, fid, pageSize: pageSize + "" };
        if (offsetValue) {
            if (offsetValue == "undefined") {
                offsetValue = "";
            }
            parms["offsetValue"] = offsetValue;
        }
        if (offsetAuxValue) {
            if (offsetAuxValue == "undefined") {
                offsetAuxValue = "";
            }
            parms["offsetAuxValue"] = String(offsetAuxValue);
        }
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: "",
            getParams: parms,
            tokenSign: true,
        });
        return m_RequestUtil
            .get(`${BASE_URL}/apis/dept/getUsersDepts${tokenUrl}`, {}, undefined, TIMEOUT)
            .then((data) => {
            return data.json().then((value) => {
                return value;
            });
        });
    }
    getUsersDeptsByStructure(puid, fid, offsetValue, offsetAuxValue, pageSize) {
        let parms = { puid, fid, pageSize: pageSize + "" };
        if (offsetValue) {
            if (offsetValue == "undefined") {
                offsetValue = "";
            }
            parms["offsetValue"] = offsetValue;
        }
        if (offsetAuxValue) {
            if (offsetAuxValue == "undefined") {
                offsetAuxValue = "";
            }
            parms["offsetAuxValue"] = String(offsetAuxValue);
        }
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: "",
            getParams: parms,
            tokenSign: true,
        });
        return m_RequestUtil
            .get(`${BASE_URL_STRUCTURE}/apis/dept/getUsersDepts4Client${tokenUrl}`, {}, undefined, TIMEOUT)
            .then((data) => {
            return data.json().then((value) => {
                return value;
            });
        });
    }
    getUnitDeptUserLogs(puid, fid, offsetValue, offsetAuxValue, pageSize) {
        let parms = { puid, fid, pageSize: pageSize + "" };
        if (offsetValue) {
            if (offsetValue == "undefined") {
                offsetValue = "";
            }
            parms["offsetValue"] = String(offsetValue);
        }
        if (offsetAuxValue) {
            if (offsetAuxValue == "undefined") {
                offsetAuxValue = "";
            }
            parms["offsetAuxValue"] = String(offsetAuxValue);
        }
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: "",
            getParams: parms,
            tokenSign: true,
        });
        return m_RequestUtil
            .get(`${BASE_URL}/apis/log/getUnitDeptUserLogs${tokenUrl}`, {}, undefined, TIMEOUT)
            .then((data) => {
            return data.json().then((value) => {
                return value;
            });
        });
    }
    getStructureDeptUserLogs(puid, fid, offsetValue, offsetAuxValue, pageSize) {
        let parms = { puid, fid, pageSize: pageSize + "" };
        if (offsetValue) {
            if (offsetValue == "undefined") {
                offsetValue = "";
            }
            parms["offsetValue"] = String(offsetValue);
        }
        if (offsetAuxValue) {
            if (offsetAuxValue == "undefined") {
                offsetAuxValue = "";
            }
            parms["offsetAuxValue"] = String(offsetAuxValue);
        }
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: "",
            getParams: parms,
            tokenSign: true,
        });
        return m_RequestUtil
            .get(`${BASE_URL_STRUCTURE}/apis/log/getUnitDeptUserLogs${tokenUrl}`, {}, undefined, TIMEOUT)
            .then((data) => {
            return data.json().then((value) => {
                return value;
            });
        });
    }
    getMyFollowers(puid) {
        let parms = {
            puid,
            isfollower: "1",
            topsign: "-1",
            page: "1",
            pageSize: "9999",
        };
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: "",
            getParams: parms,
            tokenSign: true,
        });
        return m_RequestUtil
            .get(`https://learn.chaoxing.com/v2apis/friend/getFollowers${tokenUrl}`, {}, undefined, TIMEOUT)
            .then((data) => {
            return data.json().then((value) => {
                return value;
            });
        });
    }
}
let m_ContactsOut = new ContactsOut();
exports.ContactsOut = m_ContactsOut;
module.exports = { ContactsOut: m_ContactsOut };
//# sourceMappingURL=ContactsOut.js.map