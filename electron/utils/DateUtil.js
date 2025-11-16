"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateFormat = void 0;
function dateFormat(fmt, date) {
    if (!date) {
        date = new Date();
    }
    if (typeof date === "number") {
        date = new Date(date);
    }
    if (!fmt) {
        fmt = "yyyyMMddHHmmss";
    }
    let o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "H+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "S+": date.getMilliseconds(),
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(String(o[k]).length));
        }
    }
    return fmt;
}
exports.dateFormat = dateFormat;
module.exports = { dateFormat };
//# sourceMappingURL=DateUtil.js.map