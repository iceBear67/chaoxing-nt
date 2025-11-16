"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventUtil = void 0;
const events_1 = require("events");
class CustomEventEmitter extends events_1.EventEmitter {
}
exports.EventUtil = new CustomEventEmitter();
//# sourceMappingURL=EventUtil.js.map