"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.desensitizeIDCard = exports.desensitizeName = exports.desensitizeEmail = exports.desensitizePhone = exports.desensitizeText = void 0;
function desensitizeText(text) {
    if (text) {
        text = String(text);
        if (text.length == 2) {
            return text.replace(/^(.)(.*)$/, "$1*");
        }
        let len = Math.floor(text.length / 3);
        let regExp = new RegExp('^(.{' + len + '})(.*)(.{' + len + '})$');
        return text.replace(regExp, "$1****$3");
    }
    return text;
}
exports.desensitizeText = desensitizeText;
function desensitizePhone(phone) {
    if (phone) {
        return phone.replace(/(\d{3})\d*(\d{4})/, "$1****$2");
    }
    return phone;
}
exports.desensitizePhone = desensitizePhone;
function desensitizeEmail(email) {
    if (email) {
        return email.replace(/(.{0,3}).*@(.*)/, "$1***@$2");
    }
    return email;
}
exports.desensitizeEmail = desensitizeEmail;
function desensitizeName(name) {
    if (name) {
        if (name.length == 2) {
            return name.replace(/^(.)(.*)$/, "$1*");
        }
        return name.replace(/^(.)(.*)(.)$/, "$1*$3");
    }
    return name;
}
exports.desensitizeName = desensitizeName;
function desensitizeIDCard(idCard) {
    if (idCard) {
        return idCard.replace(/^(.{3})(.*)(.)$/, (match, prefix, middlePart, suffix) => {
            return prefix + '*'.repeat(middlePart.length) + suffix;
        });
    }
    return idCard;
}
exports.desensitizeIDCard = desensitizeIDCard;
module.exports = { desensitizeText, desensitizePhone, desensitizeEmail, desensitizeName, desensitizeIDCard };
exports.default = module.exports;
//# sourceMappingURL=DataFormatUtil.js.map