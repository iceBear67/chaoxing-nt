"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const StoreHelper_1 = __importDefault(require("../main/StoreHelper"));
const CryptoUtil_1 = require("./CryptoUtil");
class AccountUtil {
    static getAccounts() {
        let accounts = [];
        let newAccounts = StoreHelper_1.default.getSystem().get(this._NEWKEY);
        if (newAccounts) {
            Object.keys(newAccounts).forEach(key => {
                let account = JSON.parse((0, CryptoUtil_1.decodeAes)(newAccounts[key]));
                if (typeof account === 'object' && account !== null) {
                    accounts.push(account);
                }
            });
        }
        return accounts;
    }
    static addAccount(account) {
        if (!account || !account.puid || !account.name || !account.pic || !account.switchInfo || !account.lastTime) {
            return;
        }
        let accounts = StoreHelper_1.default.getSystem().get(this._NEWKEY);
        if (!accounts) {
            accounts = {};
        }
        let puid = String(account.puid);
        let data = accounts[puid];
        data = data ? JSON.parse((0, CryptoUtil_1.decodeAes)(data)) : {};
        const updatedData = { ...data, ...account };
        accounts[puid] = (0, CryptoUtil_1.encodeAes)(JSON.stringify(updatedData));
        StoreHelper_1.default.getSystem().set(this._NEWKEY, accounts);
    }
    static removeAccount(puid) {
        if (!puid) {
            return;
        }
        let accounts = StoreHelper_1.default.getSystem().get(this._NEWKEY);
        if (!accounts) {
            accounts = {};
        }
        delete accounts[String(puid)];
        StoreHelper_1.default.getSystem().set(this._NEWKEY, accounts);
    }
    static removeAccountAll() {
        StoreHelper_1.default.getSystem().delete(this._NEWKEY);
        StoreHelper_1.default.getSystem().delete(this._KEY);
    }
    static getKey() {
        return this._NEWKEY;
    }
    static updateAccountProperty(data) {
        let accounts = StoreHelper_1.default.getSystem().get(this._NEWKEY);
        if (!accounts) {
            return;
        }
        let account = accounts[data.uid];
        if (account) {
            account = JSON.parse((0, CryptoUtil_1.decodeAes)(account));
            account[data.key] = data.value;
        }
        accounts[data.uid] = (0, CryptoUtil_1.encodeAes)(JSON.stringify(account));
        StoreHelper_1.default.getSystem().set(this._NEWKEY, accounts);
    }
    static getAccount(puid) {
        let accounts = StoreHelper_1.default.getSystem().get(this._NEWKEY);
        if (!accounts) {
            return;
        }
        let account = accounts[String(puid)];
        if (account) {
            account = JSON.parse((0, CryptoUtil_1.decodeAes)(account));
            return account;
        }
    }
}
AccountUtil._KEY = "accounts";
AccountUtil._NEWKEY = "newAccounts";
module.exports = { AccountUtil };
//# sourceMappingURL=AccountUtil.js.map