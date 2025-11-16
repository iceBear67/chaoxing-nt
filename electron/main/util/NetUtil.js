"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.netRequestPost = exports.netRequestGet = exports.NetResponse = void 0;
const electron_1 = require("electron");
class NetResponse {
    constructor(_url) {
        this.ok = false;
        this.status = -1;
        this.url = _url;
    }
    arrayBuffer() {
        if (!this.respBuffer)
            return new ArrayBuffer(0);
        const arrayBuffer = new ArrayBuffer(this.respBuffer.length);
        const view = new Uint8Array(arrayBuffer);
        view.set(new Uint8Array(this.respBuffer.buffer));
        return arrayBuffer;
    }
    json() {
        if (this.respBuffer) {
            return JSON.parse(this.respBuffer.toString());
        }
        return this.respBuffer?.buffer;
    }
    text() {
        if (this.respBuffer) {
            return this.respBuffer.toString();
        }
    }
}
exports.NetResponse = NetResponse;
async function netRequestGet(url) {
    return new Promise((resolve, reject) => {
        const netResponse = new NetResponse(url);
        console.log("netRequestGet", url);
        const req = electron_1.net.request({ url: url, useSessionCookies: true });
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
exports.netRequestGet = netRequestGet;
async function netRequestPost(params) {
    return new Promise((resolve, reject) => {
        const url = params.url;
        const netResponse = new NetResponse(url);
        console.log("netRequestPost", url);
        const req = electron_1.net.request({
            url: url,
            useSessionCookies: true,
            method: "POST",
        });
        let responseBuf;
        req.on("response", (response) => {
            netResponse.status = response.statusCode;
            if (response.statusCode != 200) {
                console.log(`netRequestPost response statusCode error:url:${url},\nstatusCode:`, response.statusCode);
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
                console.log(`netRequestPost response error:url:${url},\nerrMsg:`, err);
                resolve(netResponse);
            });
        });
        req.on("error", (err) => {
            console.log(`netRequestPost request error:url:${url},\nerrMsg:`, err);
            resolve(netResponse);
        });
        let postData;
        if (params.contentType == "application/json") {
            postData = JSON.stringify(params.postParams || {});
        }
        else {
            postData = Object.entries(params.postParams || {})
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
                .join("&");
        }
        req.setHeader("Content-Type", params.contentType || "application/x-www-form-urlencoded");
        req.write(postData);
        req.end();
    });
}
exports.netRequestPost = netRequestPost;
//# sourceMappingURL=NetUtil.js.map