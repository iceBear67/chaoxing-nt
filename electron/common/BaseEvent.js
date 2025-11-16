"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEvent = void 0;
class BaseEvent {
    constructor() {
        this.preventDefault = function () {
            this.defaultPrevented = true;
        };
        this.defaultPrevented = false;
    }
}
exports.BaseEvent = BaseEvent;
//# sourceMappingURL=BaseEvent.js.map