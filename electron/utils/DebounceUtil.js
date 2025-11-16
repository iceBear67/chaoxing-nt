"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = void 0;
function debounce(func, delay = 500) {
    let timer = null;
    return function (...args) {
        const context = this;
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}
exports.debounce = debounce;
module.exports = { debounce };
exports.default = module.exports;
//# sourceMappingURL=DebounceUtil.js.map