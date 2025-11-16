"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parser = exports.Parser = void 0;
const protoRoot = require("./protobuf/SttMessage_es6");
class Parser {
    constructor() { }
    praseData(data) {
        const textstream = protoRoot.Agora.SpeechToText.lookup("Text").decode(data);
        if (!textstream) {
            return console.warn("Prase data failed.");
        }
        console.log("[test] textstream praseData", textstream);
        return textstream;
    }
}
exports.Parser = Parser;
exports.parser = new Parser();
//# sourceMappingURL=parser.js.map