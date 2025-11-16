"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenUtil = void 0;
const ts_md5_1 = require("ts-md5");
const token = "cxxxt1993";
const tokenKey = "SVnjMTypYuMCO&X";
class TokenUtil {
    static getRequestParams(params) {
        let requestParams;
        if (params &&
            JSON.stringify(params) != "{}" &&
            params.getParams &&
            JSON.stringify(params.getParams) != "{}") {
            let paramsArray = [];
            let hasGetParams = params.getParams && JSON.stringify(params.getParams) != "{}";
            let hasPostParams = params.postParams && JSON.stringify(params.postParams) != "{}";
            let hasMoreParmas = params.genSignMoreParmas &&
                JSON.stringify(params.genSignMoreParmas) != "{}";
            if (params.tokenSign) {
                params.getParams.token = token;
                params.getParams._time = new Date().getTime();
            }
            if (params.genSign) {
                let signVal = TokenUtil.URL_KEYS[params.url];
                if (signVal && signVal.key && signVal.signFormat) {
                    let encFormat = signVal.signFormat.replace(/\{(.+?)}/g, function (match, key) {
                        let val;
                        if (key == "_key_") {
                            val = signVal.key ?? "";
                        }
                        else {
                            if (typeof val == "undefined" && hasGetParams) {
                                val = params.getParams[key];
                            }
                            if (typeof val == "undefined" && hasPostParams) {
                                val = params.postParams[key];
                            }
                            if (typeof val == "undefined" && hasMoreParmas) {
                                val = params.genSignMoreParmas[key];
                            }
                        }
                        return "undefined" == typeof val ? "" : String(val);
                    });
                    let enc = ts_md5_1.Md5.hashStr(encFormat);
                    paramsArray.push(`enc=${enc}`);
                }
            }
            let paramsMap = new Map();
            for (let key in params.getParams) {
                paramsMap.set(key, params.getParams[key] ?? "");
            }
            let keyArray = [];
            for (let key of paramsMap.keys()) {
                keyArray.push(key);
            }
            keyArray.sort();
            for (let key of keyArray) {
                paramsArray.push(`${key}=${paramsMap.get(key) ?? ""}`);
            }
            if (params.tokenSign) {
                let inf_enc = ts_md5_1.Md5.hashStr(`${paramsArray.join("&")}&_key=${tokenKey}`);
                paramsArray.push(`inf_enc=${inf_enc}`);
            }
            if (paramsArray.length > 0) {
                requestParams = "?" + paramsArray.join("&");
            }
        }
        return requestParams;
    }
    static getRequestParamsAll(params) {
        let requestParams;
        if (params &&
            JSON.stringify(params) != "{}" &&
            ((params.getParams && JSON.stringify(params.getParams) != "{}") ||
                (params.postParams && JSON.stringify(params.postParams) != "{}"))) {
            let paramsArray = [];
            let paramsMap = new Map();
            if (!params.getParams) {
                params.getParams = {};
            }
            if (params.tokenSign) {
                params.getParams.token = token;
                params.getParams._time = new Date().getTime();
            }
            let ignoreParamSignArray = [];
            let ignoreParamSign = params.ignoreParamSign || "";
            if (ignoreParamSign) {
                ignoreParamSignArray = ignoreParamSign.split(",");
            }
            if (params.getParams && JSON.stringify(params.getParams) != "{}") {
                for (let key in params.getParams) {
                    paramsArray.push(`${key}=${params.getParams[key] ?? ""}`);
                    if (ignoreParamSignArray.includes(key)) {
                        continue;
                    }
                    paramsMap.set(key, params.getParams[key] ?? "");
                }
            }
            if (params.postParams && JSON.stringify(params.postParams) != "{}") {
                for (let key in params.postParams) {
                    if (ignoreParamSignArray.includes(key)) {
                        continue;
                    }
                    paramsMap.set(key, params.postParams[key] ?? "");
                }
            }
            if (params.tokenSign && params.allParamSign) {
                let keyArray = [];
                for (let key of paramsMap.keys()) {
                    keyArray.push(key);
                }
                keyArray.sort();
                let signParamsArray = [];
                for (let key of keyArray) {
                    signParamsArray.push(`${key}=${paramsMap.get(key) ?? ""}`);
                }
                let inf_enc = ts_md5_1.Md5.hashStr(`${signParamsArray.join("&")}&_key=${tokenKey}`);
                paramsArray.push(`inf_enc=${inf_enc}`);
            }
            requestParams = "?" + paramsArray.join("&");
        }
        return requestParams;
    }
    static getEncRequestUrl(url) {
        let _url = new URL(url);
        let searchQuery = _url.searchParams;
        let getParams = {};
        searchQuery.forEach((value, key) => {
            getParams[key] = encodeURI(value);
        });
        let baseUrl = `${_url.origin}${_url.pathname}`;
        let params = { url: baseUrl, tokenSign: true, getParams };
        let genParms = TokenUtil.getRequestParams(params);
        return `${baseUrl}${genParms}`;
    }
}
exports.TokenUtil = TokenUtil;
TokenUtil.URL_KEYS = {
    "/classSpace/getSyncClass": {
        key: "uhZxJkJmck",
        signFormat: "{chatId}{_key_}",
    },
    "/classSpace/addSpaceUser": {
        key: "uhZxJkJmck",
        signFormat: "{chatId}{userIds}{role}{_key_}",
    },
    "/classSpace/delSpaceUser": {
        key: "uhZxJkJmck",
        signFormat: "{chatId}{userIds}{_key_}",
    },
    "/mycourse/toquery_basisclient": {
        key: "F0hZ~/@-4]Pv",
        signFormat: "{userid}&{type}{_key_}",
    },
};
module.exports = { TokenUtil };
//# sourceMappingURL=TokenUtil.js.map