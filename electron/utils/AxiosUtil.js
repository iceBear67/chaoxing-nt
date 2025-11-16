"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosUtil = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const electron_1 = require("electron");
let SessionCookie;
if (!electron_1.ipcRenderer) {
    SessionCookie = require("../main/SessionCookie");
}
class AxiosUtil {
    static typeJudgment(p) {
        const res = Object.prototype.toString.call(p);
        return res.match(/\s(\S*)\]/)[1];
    }
    static createPostFormData(obj = {}, fileInfos) {
        if (this.typeJudgment(obj) !== "Object")
            return obj;
        const keys = Object.keys(obj);
        const formData = new form_data_1.default();
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            formData.append(key, obj[key]);
        }
        if (fileInfos) {
            const fileKeys = Object.keys(fileInfos);
            for (let fileKey of fileKeys) {
                let fileInfo = fileInfos[fileKey];
                if (fileInfo.fileData) {
                    formData.append(fileKey, fileInfo.fileData, {
                        filename: fileInfo.fileName,
                    });
                }
                else if (fileInfo.base64Data) {
                    let img = electron_1.nativeImage.createFromDataURL(fileInfo.base64Data);
                    formData.append(fileKey, img.toPNG(), {
                        filename: fileInfo.fileName,
                    });
                }
            }
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
    constructor(baseURL, timeout, responseType) {
        this.m_BaseURL = baseURL;
        this.instance = axios_1.default.create({
            baseURL: baseURL,
            timeout: timeout,
            responseType: responseType,
            withCredentials: true,
        });
        this.instance.interceptors.request.use(async (config) => {
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        this.instance.interceptors.response.use((response) => {
            return response;
        }, (error) => {
            return Promise.reject(error);
        });
    }
    async useConfig(config) {
        if (SessionCookie) {
            if (!config) {
                config = { headers: {} };
            }
            config.headers["User-Agent"] = SessionCookie.getUa();
            config.headers["Cookie"] = await SessionCookie.getCookiesStrByUrl(this.m_BaseURL);
        }
        return config;
    }
    async get(url, config) {
        config = await this.useConfig(config);
        return new Promise((resolve, reject) => {
            this.instance
                .get(url, config)
                .then((response) => {
                resolve(response);
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    async post(url, data, config) {
        config = await this.useConfig(config);
        return new Promise((resolve, reject) => {
            this.instance
                .post(url, data, config)
                .then((response) => {
                resolve(response);
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
}
exports.AxiosUtil = AxiosUtil;
module.exports = { AxiosUtil };
//# sourceMappingURL=AxiosUtil.js.map