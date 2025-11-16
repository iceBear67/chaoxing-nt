"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { AxiosUtil } = require("../../utils/AxiosUtil");
const TIMEOUT = 10000;
const responseType = 'json';
const BASE_URL = "https://pan-yz.chaoxing.com";
const GET_TOKEN_URL = "/api/token/uservalid";
class PanOut {
    constructor() {
        this.instance = new AxiosUtil(BASE_URL, TIMEOUT, responseType);
    }
    getToken() {
        return new Promise((resolve, reject) => {
            this.instance.get(`${GET_TOKEN_URL}`)
                .then((response) => {
                let _token;
                let responseData = response.data;
                if (responseData && responseData.result) {
                    _token = responseData._token;
                }
                resolve(_token);
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
module.exports = { PanOut: new PanOut() };
//# sourceMappingURL=PanOut.js.map