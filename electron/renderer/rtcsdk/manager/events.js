"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGEventEmitter = void 0;
class AGEventEmitter {
    constructor() {
        this._eventMap = new Map();
    }
    once(evt, cb) {
        const wrapper = (...args) => {
            this.off(evt, wrapper);
            cb(...args);
        };
        this.on(evt, wrapper);
        return this;
    }
    on(evt, cb) {
        const cbs = this._eventMap.get(evt) ?? [];
        cbs.push(cb);
        this._eventMap.set(evt, cbs);
        return this;
    }
    off(evt, cb) {
        const cbs = this._eventMap.get(evt);
        if (cbs) {
            this._eventMap.set(evt, cbs.filter((it) => it !== cb));
        }
        return this;
    }
    removeAllEventListeners() {
        this._eventMap.clear();
    }
    emit(evt, ...args) {
        const cbs = this._eventMap.get(evt) ?? [];
        for (const cb of cbs) {
            try {
                cb && cb(...args);
            }
            catch (e) {
                const error = e;
                const details = error.stack || error.message;
                console.error(`[event] handling event ${evt.toString()} fail: ${details}`);
            }
        }
        return this;
    }
}
exports.AGEventEmitter = AGEventEmitter;
//# sourceMappingURL=events.js.map