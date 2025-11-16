"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReportWebPageOptions = exports.REPORT_WEB_PAGE_KEYS = exports.REPORT_URL = void 0;
const lodash_1 = require("lodash");
const ts_md5_1 = require("ts-md5");
exports.REPORT_URL = "https://groupweb.chaoxing.com/pc/report/reportIndex";
exports.REPORT_WEB_PAGE_KEYS = [
    "chatId",
    "chatName",
    "groupOwner",
    "groupOwnerPuid",
    "bePuid",
    "messageId",
    "originalUrl",
];
function buildReportWebPageOptions(data) {
    const { url, bePuid = "" } = data;
    const obj = (0, lodash_1.pickBy)(data, (value, key) => {
        return ([
            "chatId",
            "chatName",
            "groupOwner",
            "groupOwnerPuid",
            "messageId",
            "originalUrl",
        ].includes(key) && !!value);
    });
    let sourceContent = JSON.stringify({
        url,
    });
    if (bePuid) {
        sourceContent = JSON.stringify({
            url,
            reportModule: {
                name: "消息",
                obj,
            },
            reportModuleURL: "",
            bePuid,
        });
    }
    return {
        type: "webURL",
        sourceIdstr: ts_md5_1.Md5.hashStr(url),
        sourceContent,
    };
}
exports.buildReportWebPageOptions = buildReportWebPageOptions;
//# sourceMappingURL=ReportMainHelper.js.map