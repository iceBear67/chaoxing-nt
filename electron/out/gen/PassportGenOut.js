"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { RequestUtil } = require("../../utils/RequestUtil");
const { PassportGenUtil } = require("../../utils/PassportGenUtil");
const TIMEOUT = 10000;
const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
};
class PassportGenOut {
    constructor() { }
    genRequest(requestParams) {
        return new Promise((resolve, reject) => {
            let url = `${requestParams.baseUrl ?? ""}${requestParams.url ?? ""}`;
            let params;
            if (requestParams && JSON.stringify(requestParams) != "{}") {
                params = PassportGenUtil.getRequestParams(requestParams);
            }
            let method = requestParams.method ?? "post";
            if (method == "post") {
                new RequestUtil()
                    .post(`${url}${params ?? ""}`, RequestUtil.getPostFormData(requestParams?.postParams), headers, TIMEOUT)
                    .then((response) => {
                    response
                        .json()
                        .then((json) => {
                        resolve(json);
                    })
                        .catch((error) => {
                        reject(error);
                    });
                })
                    .catch((error) => {
                    reject(error);
                });
            }
            else if (method == "get") {
                new RequestUtil()
                    .get(`${url}${params ?? ""}`, {}, headers, TIMEOUT)
                    .then((response) => {
                    response
                        .json()
                        .then((json) => {
                        resolve(json);
                    })
                        .catch((error) => {
                        reject(error);
                    });
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
module.exports = { PassportGenOut };
//# sourceMappingURL=PassportGenOut.js.map