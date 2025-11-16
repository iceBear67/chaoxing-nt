"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { AxiosUtil } = require("../../utils/AxiosUtil");
const { UcGenUtil } = require("../../utils/UcGenUtil");
const TIMEOUT = 10000;
const config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};
const responseType = 'json';
class UcGenOut {
    constructor(baseUrl) {
        this.instance = new AxiosUtil(baseUrl, TIMEOUT, responseType);
    }
    genRequest(url, requestParams) {
        return new Promise((resolve, reject) => {
            let params;
            if (requestParams && JSON.stringify(requestParams) != "{}") {
                params = UcGenUtil.getRequestParams(requestParams);
            }
            let method = requestParams.method ?? 'post';
            if (method == 'post') {
                this.instance.post(`${url}${params ?? ''}`, AxiosUtil.getPostFormData(requestParams?.postParams), config)
                    .then((response) => {
                    resolve(response.data);
                }).catch((error) => {
                    reject(error);
                });
            }
            else if (method == 'get') {
                this.instance.get(`${url}${params ?? ''}`, config)
                    .then((response) => {
                    resolve(response.data);
                }).catch((error) => {
                    reject(error);
                });
            }
            else {
                reject('请检查method值');
            }
        });
    }
}
module.exports = { UcGenOut };
//# sourceMappingURL=UcGenOut.js.map