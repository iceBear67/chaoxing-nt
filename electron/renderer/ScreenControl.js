"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleKeyEvent = exports.handleMouseEvent = exports.useScreen = void 0;
const robotjs_1 = __importDefault(require("@jitsi/robotjs"));
const RendererHelper = __importStar(require("./RendererHelper"));
let m_Screen;
class ScreenMouseEvent {
}
class ScreenKeyEvent {
}
function useScreen(screenId) {
    RendererHelper.invokeToMainProcess("_getScreenDisplay", screenId).then((display) => {
        m_Screen = display;
    });
}
exports.useScreen = useScreen;
function handleMouseEvent(event) {
    if (!event?.eventType) {
        return;
    }
    console.log("handleMouseEvent:", event);
    let screenBounds = m_Screen.bounds;
    let mouseX = Math.floor(screenBounds.x + screenBounds.width * event.x);
    let mouseY = Math.floor(screenBounds.y + screenBounds.height * event.y);
    if (event.eventType == "mousemove") {
        robotjs_1.default.moveMouse(mouseX, mouseY);
    }
    else if (event.eventType == "mousedown" || event.eventType == "mouseup") {
        let btn = "left";
        if (event.button === 1) {
            btn = "middle";
        }
        else if (event.button === 2) {
            btn = "right";
        }
        robotjs_1.default.mouseToggle(event.eventType == "mousedown" ? "down" : "up", btn);
    }
    else if (event.eventType == "wheel") {
        if (event.deltaX != 0 || event.deltaY != 0) {
            robotjs_1.default.scrollMouse(-event.deltaX, -event.deltaY);
        }
    }
}
exports.handleMouseEvent = handleMouseEvent;
const KEY_MAP = {
    Backquote: "`",
    Minus: "-",
    Equal: "=",
    BracketLeft: "[",
    BracketRight: "]",
    Backslash: "\\",
    Semicolon: ";",
    Quote: "'",
    Enter: "enter",
    Comma: ",",
    Period: ".",
    Slash: "/",
    Space: "space",
    Escape: "escape",
    Backspace: "backspace",
    Tab: "tab",
    Delete: "delete",
    ShiftLeft: "shift",
    ShiftRight: "shift",
    ControlLeft: "control",
    ControlRight: "control",
    AltLeft: "alt",
    AltRight: "alt",
    CapsLock: "capslock",
    F1: "f1",
    F2: "f2",
    F3: "f3",
    F4: "f4",
    F5: "f5",
    F6: "f6",
    F7: "f7",
    F8: "f8",
    F9: "f9",
    F10: "f10",
    F11: "f11",
    F12: "f12",
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    NumpadEnter: "numpad_enter",
    NumpadAdd: "numpad_add",
    NumpadSubtract: "numpad_subtract",
    NumpadMultiply: "numpad_multiply",
    NumpadDivide: "numpad_divide",
    NumpadDecimal: "numpad_decimal",
    PageUp: "pageup",
    PageDown: "pagedown",
    Home: "home",
    End: "end",
    Insert: "insert",
    PrintScreen: "printscreen",
    ScrollLock: "scrolllock",
    Pause: "pause",
};
function getKeyCode(code) {
    if (!code) {
        return;
    }
    if (KEY_MAP[code]) {
        return KEY_MAP[code];
    }
    if (code.length == 4 && code.startsWith("Key")) {
        return code.substring(3).toLowerCase();
    }
    if (code.length == 6 && code.startsWith("Digit")) {
        return code.substring(5);
    }
    if (code.length == 7 && code.startsWith("Numpad")) {
        return `numpad_${code.substring(6)}`;
    }
}
function handleKeyEvent(event) {
    console.log("handleKeyEvent:", event);
    if (!event?.eventType) {
        return;
    }
    let key = getKeyCode(event.code);
    if (!key) {
        return;
    }
    robotjs_1.default.keyToggle(key, event.eventType == "keydown" ? "down" : "up");
}
exports.handleKeyEvent = handleKeyEvent;
useScreen();
module.exports = { handleMouseEvent, handleKeyEvent, useScreen };
//# sourceMappingURL=ScreenControl.js.map