"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenOut = void 0;
const AxiosUtil_1 = require("../../utils/AxiosUtil");
const TokenUtil_1 = require("../../utils/TokenUtil");
const TIMEOUT = 10000;
const config = {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
};
const responseType = "json";
class GenOut {
    constructor(baseUrl) {
        this.instance = new AxiosUtil_1.AxiosUtil(baseUrl, TIMEOUT, responseType);
    }
    genRequest(url, requestParams) {
        return new Promise((resolve, reject) => {
            let params;
            if (requestParams && JSON.stringify(requestParams) != "{}") {
                if (requestParams.allParamSign != true) {
                    params = TokenUtil_1.TokenUtil.getRequestParams(requestParams);
                }
                else {
                    params = TokenUtil_1.TokenUtil.getRequestParamsAll(requestParams);
                }
            }
            let method = requestParams.method ?? "post";
            if (method == "post") {
                this.instance
                    .post(`${url}${params ?? ""}`, AxiosUtil_1.AxiosUtil.createPostFormData(requestParams?.postParams, requestParams?.fileParms), config)
                    .then((response) => {
                    resolve(response.data);
                })
                    .catch((error) => {
                    reject(error);
                });
            }
            else if (method == "get") {
                this.instance
                    .get(`${url}${params ?? ""}`, config)
                    .then((response) => {
                    resolve(response.data);
                })
                    .catch((error) => {
                    reject(error);
                });
            }
            else {
                reject("请检查method值");
            }
        });
    }
}
exports.GenOut = GenOut;
module.exports = { GenOut };
//# sourceMappingURL=GenOut.js.map