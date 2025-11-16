"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrlParamValue = void 0;
const getUrlParamValue = (url, name) => {
    if (url && name) {
        let index = url.indexOf("?");
        if (index != -1) {
            let urlsearch = url.substr(index + 1);
            let pstr = urlsearch.split("&");
            for (let i = pstr.length - 1; i >= 0; i--) {
                let tep = pstr[i].split("=");
                if (tep[0] == name) {
                    return tep[1];
                }
            }
        }
    }
    return undefined;
};
exports.getUrlParamValue = getUrlParamValue;
//# sourceMappingURL=UrlUtils.js.map