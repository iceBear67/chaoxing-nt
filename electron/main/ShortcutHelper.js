"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAcceleratorEvent = exports.unregisterAccelerator = exports.registerAccelerator = void 0;
const m_AcceleratorMap = new Map();
function equalsAccelerator(acc1, acc2) {
    if (!acc1 || !acc2) {
        return false;
    }
    if (acc1.control != acc2.control) {
        return false;
    }
    if (acc1.alt != acc2.alt) {
        return false;
    }
    if (acc1.shift != acc2.shift) {
        return false;
    }
    if (acc1.meta != acc2.meta) {
        return false;
    }
    if (acc1.key != acc2.key) {
        return false;
    }
    return true;
}
function convertInput(accelerator) {
    if (!accelerator) {
        return;
    }
    if (accelerator.CommandOrControl) {
        if (process.platform == "darwin") {
            accelerator.meta = true;
        }
        else {
            accelerator.control = true;
        }
        delete accelerator.CommandOrControl;
    }
    if (!accelerator.control) {
        accelerator.control = false;
    }
    if (!accelerator.alt) {
        accelerator.alt = false;
    }
    if (!accelerator.shift) {
        accelerator.shift = false;
    }
    if (!accelerator.meta) {
        accelerator.meta = false;
    }
    return accelerator;
}
function registerAccelerator(win, inputAccelerator, callback) {
    if (!win || win.isDestroyed()) {
        return;
    }
    if (!callback) {
        return;
    }
    const accelerator = convertInput(inputAccelerator);
    if (!accelerator) {
        return;
    }
    let acceleratorFuns = m_AcceleratorMap.get(win);
    if (!acceleratorFuns) {
        acceleratorFuns = [];
    }
    m_AcceleratorMap.set(win, acceleratorFuns);
    for (let acceleratorFun of acceleratorFuns) {
        if (equalsAccelerator(acceleratorFun.accelerator, accelerator)) {
            acceleratorFun.callback = callback;
            return;
        }
    }
    acceleratorFuns.push({ accelerator, callback });
}
exports.registerAccelerator = registerAccelerator;
function unregisterAccelerator(win, acceleratorInput) {
    const accelerator = convertInput(acceleratorInput);
    if (!accelerator) {
        m_AcceleratorMap.delete(win);
        return;
    }
    let acceleratorFuns = m_AcceleratorMap.get(win);
    if (!acceleratorFuns) {
        return;
    }
    for (let i = 0; i < acceleratorFuns.length; i++) {
        let acceleratorFun = acceleratorFuns[i];
        if (equalsAccelerator(acceleratorFun.accelerator, accelerator)) {
            acceleratorFuns.splice(i, 1);
            return;
        }
    }
}
exports.unregisterAccelerator = unregisterAccelerator;
function handleAcceleratorEvent(win, inputKey) {
    let acceleratorFuns = m_AcceleratorMap.get(win);
    if (!acceleratorFuns || acceleratorFuns.length == 0) {
        return;
    }
    for (let acceleratorFun of acceleratorFuns) {
        if (equalsAccelerator(acceleratorFun.accelerator, inputKey)) {
            acceleratorFun.callback();
        }
    }
}
exports.handleAcceleratorEvent = handleAcceleratorEvent;
module.exports = {
    registerAccelerator,
    unregisterAccelerator,
    handleAcceleratorEvent,
};
//# sourceMappingURL=ShortcutHelper.js.map