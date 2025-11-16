"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TokenUtil_1 = require("../../utils/TokenUtil");
const AxiosUtil_1 = require("../../utils/AxiosUtil");
const NetUtil_1 = require("../../main/util/NetUtil");
const TIMEOUT = 10000;
const responseType = "json";
const BASE_URL = "https://specialpack.chaoxing.com";
const CHECK_USER_UPLOAD = BASE_URL + "/apis/log/checkUserUpload";
const UPLOAD_USER_LOG = BASE_URL + "/apis/log/uploadLog";
const config = {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
    maxBodyLength: Infinity,
    timeout: 1000 * 60,
};
class SpecialpackOut {
    constructor() {
        this.instance = new AxiosUtil_1.AxiosUtil(BASE_URL, TIMEOUT, responseType);
    }
    checkUserUpload(puid, productId) {
        let requestParams = {
            url: "",
            getParams: {
                puid,
                productId,
                crossOrigin: "true",
            },
            tokenSign: true,
        };
        return new Promise((resolve, reject) => {
            this.instance
                .get(`${CHECK_USER_UPLOAD}${TokenUtil_1.TokenUtil.getRequestParams(requestParams) ?? ""}`)
                .then((response) => {
                let uploading = 0;
                let responseData = response.data;
                if (responseData) {
                    if (responseData.result == 1) {
                        uploading = responseData.data?.uploading;
                    }
                }
                resolve(uploading);
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    uploadUserLog(requestParams) {
        let params = "";
        if (requestParams && JSON.stringify(requestParams) != "{}") {
            if (requestParams.allParamSign != true) {
                params = TokenUtil_1.TokenUtil.getRequestParams(requestParams);
            }
            else {
                params = TokenUtil_1.TokenUtil.getRequestParamsAll(requestParams);
            }
        }
        return new Promise((resolve, reject) => {
            this.instance
                .post(`${UPLOAD_USER_LOG}${params ?? ""}`, AxiosUtil_1.AxiosUtil.createPostFormData(requestParams?.postParams), config)
                .then((response) => {
                if (response.status == 200) {
                    let data = response.data;
                    if (data.result === 1) {
                        resolve(data);
                    }
                }
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    async getUploadLogStatus(puid) {
        let url = TokenUtil_1.TokenUtil.getEncRequestUrl(`https://k.chaoxing.com/apis/feedback/getUploadLogStatus?puid=${puid}`);
        let dataResponse = await (0, NetUtil_1.netRequestGet)(url);
        return dataResponse.json();
    }
}
module.exports = { SpecialpackOut: new SpecialpackOut() };
//# sourceMappingURL=SpecialpackOut.js.map