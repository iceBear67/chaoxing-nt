"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlacklistOut = void 0;
const RequestUtil_1 = require("../../utils/RequestUtil");
const TokenUtil_1 = require("../../utils/TokenUtil");
const TIMEOUT = 5000;
const m_RequestUtil = new RequestUtil_1.RequestUtil();
const config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};
const responseType = 'json';
const BASE_URL = "https://groupyd2.chaoxing.com";
const ShieldingMe_URL = "/apis/user/getShieldingMeUserList";
const MeShielding_URL = "/apis/user/getMineShieldingUserList";
class BlacklistOut {
    constructor() {
    }
    getShieldingMeUserList(shieldPuid, lastValue, lastAuxValue, pageSize) {
        let parms = { shieldPuid, lastValue, lastAuxValue, pageSize: pageSize + '' };
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: '',
            getParams: parms,
            tokenSign: true
        });
        return m_RequestUtil.get(`${BASE_URL}${ShieldingMe_URL}${tokenUrl}`, {}, undefined, TIMEOUT)
            .then(data => {
            return data.json().then(value => {
                return value;
            });
        });
    }
    getMineShieldingUserList(puid, lastValue, lastAuxValue, pageSize) {
        let parms = { puid, lastValue, lastAuxValue, pageSize: pageSize + '' };
        let tokenUrl = TokenUtil_1.TokenUtil.getRequestParams({
            url: '',
            getParams: parms,
            tokenSign: true
        });
        return m_RequestUtil.get(`${BASE_URL}${MeShielding_URL}${tokenUrl}`, {}, undefined, TIMEOUT)
            .then(data => {
            return data.json().then(value => {
                return value;
            });
        });
    }
}
let m_BlacklistOut = new BlacklistOut();
exports.BlacklistOut = m_BlacklistOut;
module.exports = { BlacklistOut: m_BlacklistOut };
//# sourceMappingURL=BlacklistOut.js.map