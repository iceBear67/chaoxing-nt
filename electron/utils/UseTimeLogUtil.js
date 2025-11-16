"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseTimeLog = void 0;
class UseTimeLog {
    constructor(enable = true) {
        this.startTime = 0;
        this.endTime = 0;
        this.enableCalUseTimeLog = true;
        if (!enable) {
            this.enableCalUseTimeLog = false;
        }
    }
    start(title) {
        if (!this.enableCalUseTimeLog) {
            return;
        }
        this.title = title;
        this.startTime = Date.now();
        this.endTime = this.startTime;
    }
    end(text) {
        if (!this.enableCalUseTimeLog) {
            return;
        }
        let curTime = Date.now();
        console.log("计算执行用时:", this.title, text, curTime - this.endTime, curTime - this.startTime);
        this.endTime = curTime;
    }
}
exports.UseTimeLog = UseTimeLog;
//# sourceMappingURL=UseTimeLogUtil.js.map