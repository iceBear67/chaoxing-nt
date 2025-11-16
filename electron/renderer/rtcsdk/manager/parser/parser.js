"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parser = exports.Parser = void 0;
const events_1 = require("../events");
const SttMessage_1 = __importDefault(require("../../protobuf/SttMessage"));
class Parser extends events_1.AGEventEmitter {
    constructor() {
        super();
    }
    praseData(data) {
        const textstream = SttMessage_1.default.Agora.SpeechToText.lookup("Text").decode(data);
        if (!textstream) {
            return console.warn("Prase data failed.");
        }
        console.log("[test] textstream praseData", JSON.stringify(textstream));
        return JSON.parse(JSON.stringify(textstream));
    }
}
exports.Parser = Parser;
exports.parser = new Parser();
//# sourceMappingURL=parser.js.map