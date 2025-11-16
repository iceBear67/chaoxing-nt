"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { AxiosUtil } = require("../../utils/AxiosUtil");
const { TokenUtil } = require("../../utils/TokenUtil");
const TIMEOUT = 10000;
const config = {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
};
const responseType = "json";
const BASE_URL = "https://structureyd.chaoxing.com";
const GET_SEARCH_USER_URL = "/apis/roster/searchRosterUser";
class StructureOut {
    constructor() {
        this.instance = new AxiosUtil(BASE_URL, TIMEOUT, responseType);
    }
    searchUser(puid, keyword) {
        let requestParams = {
            url: "",
            getParams: {
                fid: 1385,
                searchMode: 1,
                puid,
            },
            postParams: {
                keyword,
            },
            tokenSign: true,
        };
        return new Promise((resolve, reject) => {
            this.instance
                .post(`${GET_SEARCH_USER_URL}${TokenUtil.getRequestParams(requestParams) ?? ""}`, AxiosUtil.getPostFormData(requestParams?.postParams), config)
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
}
module.exports = { StructureOut: new StructureOut() };
//# sourceMappingURL=StructureOut.js.map