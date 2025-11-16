"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.netRequest = void 0;
const TokenUtil_1 = require("../../utils/TokenUtil");
const NetUtil_1 = require("./NetUtil");
async function netRequest(params) {
    if (!params || !params.url) {
        return;
    }
    let url = params.url;
    let resResult;
    if (params.tokenSign) {
        if (params.method == "post") {
            url = TokenUtil_1.TokenUtil.getEncRequestUrl(params.url);
            resResult = await (0, NetUtil_1.netRequestPost)({ url, postParams: params.postParams });
        }
        else {
            url = TokenUtil_1.TokenUtil.getEncRequestUrl(params.url);
            resResult = await (0, NetUtil_1.netRequestGet)(url);
        }
    }
    if (!resResult.ok) {
        return { result: resResult.status };
    }
    return resResult.json();
}
exports.netRequest = netRequest;
//# sourceMappingURL=NetRequestUtil.js.map