"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestUtil = void 0;
const electron_1 = require("electron");
const FormData = require("form-data");
class NetResponse {
    constructor(_url) {
        this.ok = false;
        this.status = -1;
        this.url = _url;
    }
    arrayBuffer() {
        return this.respBuffer?.buffer;
    }
    async json() {
        if (this.respBuffer) {
            return JSON.parse(this.respBuffer.toString());
        }
        return this.respBuffer?.buffer;
    }
    async text() {
        if (this.respBuffer) {
            return this.respBuffer.toString();
        }
    }
}
class RequestUtil {
    static typeJudgment(p) {
        const res = Object.prototype.toString.call(p);
        return res.match(/\s(\S*)\]/)[1];
    }
    static createPostFormData(obj = {}) {
        if (this.typeJudgment(obj) !== "Object")
            return;
        const keys = Object.keys(obj);
        const formData = new FormData();
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            formData.append(key, obj[key]);
        }
        return formData;
    }
    static getPostFormData(data) {
        if (data) {
            if (typeof data != "string") {
                let paramsArray = [];
                for (let key in data) {
                    paramsArray.push(`${key}=${data[key] || ""}`);
                }
                data = paramsArray.join("&");
            }
            return data;
        }
        return "";
    }
    constructor() { }
    get(url, query, headers, timeout) {
        return new Promise((resolve, reject) => {
            let _url = new URL(url);
            if (query) {
                let keys = Object.keys(query);
                for (let key of keys) {
                    _url.searchParams.append(key, query[key]);
                }
            }
            url = _url.toString();
            let req = electron_1.net.request({ url, method: "GET", useSessionCookies: true });
            const netResponse = new NetResponse(url);
            if (headers) {
                let headerKeys = Object.keys(headers);
                for (let headerKey of headerKeys) {
                    req.setHeader(headerKey, headers[headerKey]);
                }
            }
            let responseBuf;
            req.on("response", (response) => {
                netResponse.status = response.statusCode;
                if (response.statusCode != 200) {
                    console.log(`netRequestGet response statusCode error:url:${url},\nstatusCode:`, response.statusCode);
                    resolve(netResponse);
                    return;
                }
                response.on("data", (chunk) => {
                    if (responseBuf) {
                        responseBuf = Buffer.concat([responseBuf, chunk]);
                    }
                    else {
                        responseBuf = chunk;
                    }
                });
                response.on("end", () => {
                    netResponse.ok = true;
                    netResponse.respBuffer = responseBuf;
                    resolve(netResponse);
                });
                response.on("error", (err) => {
                    console.log(`netRequestGet response error:url:${url},\nerrMsg:`, err);
                    resolve(netResponse);
                });
            });
            req.on("error", (err) => {
                console.log(`netRequestGet request error:url:${url},\nerrMsg:`, err);
                resolve(netResponse);
            });
            req.end();
        });
    }
    post(url, body, headers, timeout) {
        return new Promise((resolve, reject) => {
            let req = electron_1.net.request({ url, method: "POST", useSessionCookies: true });
            const netResponse = new NetResponse(url);
            req.setHeader("Content-Type", "application/x-www-form-urlencoded");
            if (headers) {
                let headerKeys = Object.keys(headers);
                for (let headerKey of headerKeys) {
                    req.setHeader(headerKey, headers[headerKey]);
                }
            }
            let responseBuf;
            req.on("response", (response) => {
                netResponse.status = response.statusCode;
                if (response.statusCode != 200) {
                    console.log(`netRequestGet response statusCode error:url:${url},\nstatusCode:`, response.statusCode);
                    resolve(netResponse);
                    return;
                }
                response.on("data", (chunk) => {
                    if (responseBuf) {
                        responseBuf = Buffer.concat([responseBuf, chunk]);
                    }
                    else {
                        responseBuf = chunk;
                    }
                });
                response.on("end", () => {
                    netResponse.ok = true;
                    netResponse.respBuffer = responseBuf;
                    resolve(netResponse);
                });
                response.on("error", (err) => {
                    console.log(`netRequestGet response error:url:${url},\nerrMsg:`, err);
                    resolve(netResponse);
                });
            });
            req.on("error", (err) => {
                console.log(`netRequestGet request error:url:${url},\nerrMsg:`, err);
                resolve(netResponse);
            });
            req.write(body);
            req.end();
        });
    }
}
exports.RequestUtil = RequestUtil;
module.exports = { RequestUtil };
//# sourceMappingURL=RequestUtil.js.map