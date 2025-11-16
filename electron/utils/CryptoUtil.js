"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hmacSHA1EncodeBase64 = exports.decodeRSAByPublicKey = exports.encodeRSA = exports.parseEncString = exports.md5 = exports.getFileMd5 = exports.decodeDes = exports.encodeDes = exports.decodeAes = exports.encodeAesWithKey = exports.encodeAes = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs = require("fs");
const key = "chaoxing_chen_xi";
const iv = "study_xi_chen_cx";
function encodeAes(src) {
    let sign = "";
    const cipher = crypto_1.default.createCipheriv("aes-128-cbc", key, iv);
    sign += cipher.update(src, "utf8", "hex");
    sign += cipher.final("hex");
    return sign;
}
exports.encodeAes = encodeAes;
function encodeAesWithKey(src, _key, _iv) {
    let sign = "";
    const cipher = crypto_1.default.createCipheriv("aes-128-cbc", _key, _iv);
    sign += cipher.update(src, "utf8", "hex");
    sign += cipher.final("hex");
    return sign;
}
exports.encodeAesWithKey = encodeAesWithKey;
function decodeAes(sign) {
    let src = "";
    const cipher = crypto_1.default.createDecipheriv("aes-128-cbc", key, iv);
    src += cipher.update(sign, "hex", "utf8");
    src += cipher.final("utf8");
    return src;
}
exports.decodeAes = decodeAes;
function encodeDes(text, key) {
    let sign = "";
    const cipher = crypto_1.default.createCipheriv("des-ecb", key.slice(0, 8), "");
    sign += cipher.update(text, "utf8", "hex");
    sign += cipher.final("hex");
    return sign;
}
exports.encodeDes = encodeDes;
function decodeDes(text, key) {
    let src = "";
    const decipher = crypto_1.default.createDecipheriv("des-ecb", key.slice(0, 8), "");
    src += decipher.update(text, "hex", "utf8");
    src += decipher.final("utf8");
    return src;
}
exports.decodeDes = decodeDes;
function getFileMd5(filePath) {
    let pms = new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            var hash = crypto_1.default.createHash("md5");
            let rs = fs.createReadStream(filePath);
            hash.update("chaoxing");
            rs.on("end", () => {
                hash.update("exam_chenxi");
                resolve(hash.digest("hex"));
            });
            rs.on("data", (data) => {
                hash.update(data);
            });
            rs.on("error", (err) => {
                console.error("getFileMd5 read file error", err);
                resolve(undefined);
            });
        }
        else {
            resolve(undefined);
        }
    });
    return pms;
}
exports.getFileMd5 = getFileMd5;
function md5(str) {
    var md5 = crypto_1.default.createHash("md5");
    md5.update(str);
    var str2 = md5.digest("hex");
    return str2;
}
exports.md5 = md5;
function parseEncString(data, key) {
    let res = "";
    if (data && key) {
        const cipher = crypto_1.default.createCipheriv("des-ecb", key, null);
        let encrypted = cipher.update(data, "utf8", "hex");
        encrypted += cipher.final("hex");
        if (encrypted) {
            res = encrypted.toString().toUpperCase();
        }
    }
    return res;
}
exports.parseEncString = parseEncString;
function encodeRSA(data, publicKeyPem) {
    publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyPem}\n-----END PUBLIC KEY-----`;
    const publicKey = crypto_1.default.createPublicKey({
        key: publicKeyPem,
        format: "pem",
        type: "pkcs1",
    });
    let encryptedBuffer = Buffer.alloc(0);
    try {
        let dataBuffer = Buffer.from(data);
        const bufferSize = dataBuffer.length;
        const maxSize = 117;
        let index = 0;
        while (index < bufferSize) {
            let end = Math.min(bufferSize, index + maxSize);
            let tempBuffer = dataBuffer.subarray(index, end);
            let encBuffer = crypto_1.default.publicEncrypt({ key: publicKey, padding: crypto_1.default.constants.RSA_PKCS1_PADDING }, tempBuffer);
            encryptedBuffer = Buffer.concat([encryptedBuffer, encBuffer]);
            index = end;
        }
    }
    catch (err) {
        console.error("加密错误:", err);
        return;
    }
    const encryptedData = encryptedBuffer.toString("base64");
    return encryptedData;
}
exports.encodeRSA = encodeRSA;
function decodeRSAByPublicKey(data, publicKeyPem) {
    publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyPem}\n-----END PUBLIC KEY-----`;
    const publicKey = crypto_1.default.createPublicKey({
        key: publicKeyPem,
        format: "pem",
        type: "pkcs1",
    });
    let decryptedBuffer = Buffer.alloc(0);
    try {
        let dataBuffer = Buffer.from(data, "base64");
        const bufferSize = dataBuffer.length;
        const maxSize = 128;
        let index = 0;
        while (index < bufferSize) {
            let end = Math.min(bufferSize, index + maxSize);
            let tempBuffer = dataBuffer.subarray(index, end);
            let decBuffer = crypto_1.default.publicDecrypt({ key: publicKey, padding: crypto_1.default.constants.RSA_PKCS1_PADDING }, tempBuffer);
            decryptedBuffer = Buffer.concat([decryptedBuffer, decBuffer]);
            index = end;
        }
    }
    catch (err) {
        console.error("解密错误:", err);
        return;
    }
    const decryptedData = decryptedBuffer.toString();
    return decryptedData;
}
exports.decodeRSAByPublicKey = decodeRSAByPublicKey;
function hmacSHA1EncodeBase64(data, key) {
    const hmac = crypto_1.default.createHmac("sha1", key);
    hmac.update(data);
    const digest = hmac.digest("base64");
    return digest;
}
exports.hmacSHA1EncodeBase64 = hmacSHA1EncodeBase64;
module.exports = {
    encodeAes,
    decodeAes,
    encodeDes,
    decodeDes,
    getFileMd5,
    md5,
    parseEncString,
    encodeAesWithKey,
    encodeRSA,
    decodeRSAByPublicKey,
    hmacSHA1EncodeBase64,
};
//# sourceMappingURL=CryptoUtil.js.map