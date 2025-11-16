"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { AxiosUtil } = require("../../utils/AxiosUtil");
const { TokenUtil } = require("../../utils/TokenUtil");
const TIMEOUT = 10000;
const config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};
const responseType = 'json';
const BASE_URL = "https://learn.chaoxing.com";
const GET_TOKEN_URL = "/apis/user/getUserImToken";
const CREATE_CHATGROUPS_URL = "/apis/im/creatChatGroups";
class ImOut {
    constructor() {
        this.instance = new AxiosUtil(BASE_URL, TIMEOUT, responseType);
    }
    getToken() {
        return new Promise((resolve, reject) => {
            this.instance.get(GET_TOKEN_URL)
                .then((response) => {
                let iminfo;
                let responseData = response.data;
                if (responseData) {
                    if (responseData.result == 1) {
                        iminfo = {
                            fid: responseData.msg.fid,
                            pic: responseData.msg.pic,
                            dept: responseData.msg.dept,
                            schoolname: responseData.msg.schoolname,
                            tuid: responseData.msg.uid,
                            puid: responseData.msg.puid,
                            hxToken: responseData.msg.hxToken
                        };
                    }
                }
                resolve(iminfo);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    createChatGroups(requestParams) {
        return new Promise((resolve, reject) => {
            this.instance.post(`${CREATE_CHATGROUPS_URL}${TokenUtil.getRequestParams(requestParams) ?? ''}`, AxiosUtil.getPostFormData(requestParams?.postParams), config)
                .then((response) => {
                resolve(response.data);
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
module.exports = { ImOut: new ImOut() };
//# sourceMappingURL=ImOut.js.map