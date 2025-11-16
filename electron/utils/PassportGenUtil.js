"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_md5_1 = require("ts-md5");
class PassportGenUtil {
    static getRequestParams(params) {
        let requestParams;
        if (params && JSON.stringify(params) != "{}") {
            let hasGetParams = params.getParams && JSON.stringify(params.getParams) != "{}";
            let hasPostParams = params.postParams && JSON.stringify(params.postParams) != "{}";
            let hasMoreParmas = params.genSignMoreParmas && JSON.stringify(params.genSignMoreParmas) != "{}";
            let paramsArray = [];
            if (hasGetParams) {
                for (let key in params.getParams) {
                    paramsArray.push(`${key}=${params.getParams[key] ?? ''}`);
                }
            }
            if (params.genSign) {
                let signVal = PassportGenUtil.URL_KEYS[params.url];
                if (signVal && signVal.key && signVal.signFormat) {
                    let encFormat = signVal.signFormat.replace(/\{(.+?)}/g, function (match, key) {
                        let val;
                        if (key == "_key_") {
                            val = signVal.key ?? '';
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
                        return ('undefined' == typeof val ? '' : String(val));
                    });
                    let enc = ts_md5_1.Md5.hashStr(encFormat);
                    paramsArray.push(`enc=${enc}`);
                }
            }
            if (paramsArray.length > 0) {
                requestParams = '?' + paramsArray.join("&");
            }
        }
        return requestParams;
    }
}
PassportGenUtil.URL_KEYS = {
    '/api/extenduserinfo': {
        key: 'uWwjeEKsri',
        signFormat: '{uid}{_key_}'
    },
    '/api/sendcaptcha': {
        key: 'jsDyctOCnay7uotq',
        signFormat: '{to}{_key_}{time}'
    },
    '/api/removeLoginInfo': {
        key: 'uWwjeEKsri',
        signFormat: '{puid}{fid}{loginName}{_key_}'
    },
    '/api/getRecoverLoginInfo': {
        key: 'uWwjeEKsri',
        signFormat: '{uid}{_key_}'
    },
    '/api/recoverLoginInfo': {
        key: 'uWwjeEKsri',
        signFormat: '{puid}{recoverId}{_key_}'
    }
};
module.exports = { PassportGenUtil };
//# sourceMappingURL=PassportGenUtil.js.map