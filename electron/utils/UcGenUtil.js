"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UcGenUtil = void 0;
const ts_md5_1 = require("ts-md5");
class UcGenUtil {
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
                let signVal = UcGenUtil.URL_KEYS[params.url];
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
exports.UcGenUtil = UcGenUtil;
UcGenUtil.URL_KEYS = {
    '/apis/getRoleByTwoUid': {
        key: 'mic^ruso&ke@y',
        signFormat: '{curUid}{targetUid}{_key_}{date}'
    },
};
module.exports = { UcGenUtil };
//# sourceMappingURL=UcGenUtil.js.map