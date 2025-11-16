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
const BASE_URL = "https://useryd.chaoxing.com";
const GET_USER_URL = "/apis/user/getUser";
const GET_USERS_URL = "/apis/user/getUsers4C";
class UserOut {
    constructor() {
        this.instance = new AxiosUtil(BASE_URL, TIMEOUT, responseType);
    }
    getUserPic(pic, puid) {
        if (pic) {
            return pic;
        }
        else if (puid) {
            return `https://photo.chaoxing.com/p/${puid}_80`;
        }
        return `https://photo.chaoxing.com/photo_80.jpg`;
    }
    getMe(puid) {
        let requestParams = {
            url: "",
            getParams: {
                puid,
                myPuid: puid,
            },
            tokenSign: true,
        };
        return new Promise((resolve, reject) => {
            this.instance
                .get(`${GET_USER_URL}${TokenUtil.getRequestParams(requestParams) ?? ""}`)
                .then((response) => {
                let user;
                let responseData = response.data;
                if (responseData) {
                    if (responseData.result == 1) {
                        responseData = responseData.msg;
                        let deptDesc = responseData.deptDesc;
                        user = {
                            isMe: true,
                            uid: responseData.uid,
                            puid: responseData.puid,
                            sign_ban: responseData.sign_ban,
                            name: responseData.name,
                            pic: this.getUserPic(responseData.pic, responseData.puid),
                            fid: responseData.fid,
                            schoolname: responseData.schoolname,
                            dept: responseData.dept,
                            deptDesc,
                        };
                    }
                }
                resolve(user);
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    getUser(puid, myPuid) {
        let requestParams = {
            url: "",
            getParams: {
                puid,
                myPuid,
            },
            tokenSign: true,
        };
        return new Promise((resolve, reject) => {
            this.instance
                .get(`${GET_USER_URL}${TokenUtil.getRequestParams(requestParams) ?? ""}`)
                .then((response) => {
                let user;
                let responseData = response.data;
                if (responseData) {
                    if (responseData.result == 1) {
                        responseData = responseData.msg;
                        let deptDesc = responseData.deptDesc;
                        user = {
                            isMe: false,
                            uid: responseData.uid,
                            puid: responseData.puid,
                            sign_ban: responseData.sign_ban,
                            name: responseData.name,
                            pic: this.getUserPic(responseData.pic, responseData.puid),
                            fid: responseData.fid,
                            schoolname: responseData.schoolname,
                            dept: responseData.dept,
                            deptDesc,
                        };
                    }
                }
                resolve(user);
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    getUserByPuids(puid, puids) {
        let requestParams = {
            url: "",
            getParams: {
                puid,
            },
            postParams: {
                puids,
            },
            tokenSign: true,
        };
        return new Promise((resolve, reject) => {
            this.instance
                .post(`${GET_USERS_URL}${TokenUtil.getRequestParams(requestParams) ?? ""}`, AxiosUtil.getPostFormData(requestParams.postParams), config)
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
    getUserByTuids(puid, tuids, axiosConfig) {
        let requestParams = {
            url: "",
            getParams: {
                puid,
            },
            postParams: {
                tuids,
            },
            tokenSign: true,
        };
        return new Promise((resolve, reject) => {
            const mergedConfig = {
                ...config,
                ...(axiosConfig ?? {}),
            };
            this.instance
                .post(`${GET_USERS_URL}${TokenUtil.getRequestParams(requestParams) ?? ""}`, AxiosUtil.getPostFormData(requestParams.postParams), mergedConfig)
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
module.exports = { UserOut: new UserOut() };
//# sourceMappingURL=UserOut.js.map