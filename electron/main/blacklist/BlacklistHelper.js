"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadShieldMeData = exports.loadMineShieldData = exports.startSyncBlacklist = void 0;
const BlacklistOut_1 = require("../../out/blacklist/BlacklistOut");
const UserHelper_1 = require("../UserHelper");
const MainHelper_1 = require("../MainHelper");
const BlacklistDbHelper_1 = require("./BlacklistDbHelper");
let m_SysnBlacklistState = 0;
async function startSyncBlacklist() {
    try {
        await (0, BlacklistDbHelper_1.init)();
        let puid = (0, UserHelper_1.getUID)();
        if (!puid) {
            return { success: false };
        }
        let BlackListInfo = (0, MainHelper_1.getUserStore)("blackListInfoStoreKey");
        if (!BlackListInfo?.shieldMeLastValue && !BlackListInfo?.meShieldLastValue) {
            BlackListInfo = {
                shieldMeLastAuxValue: '',
                shieldMeLastValue: '',
                meShieldLastAuxValue: '',
                meShieldLastValue: ''
            };
            (0, BlacklistDbHelper_1.deleteMeShieldData)();
            (0, BlacklistDbHelper_1.deleteShieldMeData)();
        }
        await loadShieldMeData(BlackListInfo);
        await loadMineShieldData(BlackListInfo);
        return { success: true };
    }
    catch (e) {
        console.error("startSyncBlacklist error", e);
        return { success: false };
    }
}
exports.startSyncBlacklist = startSyncBlacklist;
async function loadMineShieldData(BlackListInfo) {
    let puid = (0, UserHelper_1.getUID)();
    if (!puid) {
        return { success: false };
    }
    let mineShieldLastAuxValue = BlackListInfo?.meShieldLastAuxValue || "";
    let mineShieldLastValue = BlackListInfo?.meShieldLastValue || "";
    let lastPage = 0;
    while (lastPage < 1) {
        let mineShieldData = await BlacklistOut_1.BlacklistOut.getMineShieldingUserList(puid, mineShieldLastValue, mineShieldLastAuxValue, 100);
        if (mineShieldData.result != 1) {
            return;
        }
        const ids = mineShieldData?.data?.list?.map((i) => String(i.thePuid)) || [];
        const insertData = mineShieldData?.data?.list?.filter((i) => !i.deleted);
        if (ids.length) {
            await (0, BlacklistDbHelper_1.deleteMeShieldData)(ids.join(","));
            await (0, BlacklistDbHelper_1.insertMeShieldData)(insertData);
        }
        lastPage = mineShieldData?.data?.lastPage;
        mineShieldLastAuxValue = mineShieldData?.data?.lastAuxValue || '';
        mineShieldLastValue = mineShieldData?.data?.lastValue || mineShieldLastValue;
        if (lastPage == 1) {
            BlackListInfo.meShieldLastAuxValue = mineShieldLastAuxValue;
            BlackListInfo.meShieldLastValue = mineShieldLastValue;
            (0, MainHelper_1.setUserStore)("blackListInfoStoreKey", BlackListInfo);
        }
    }
}
exports.loadMineShieldData = loadMineShieldData;
async function loadShieldMeData(BlackListInfo) {
    let puid = (0, UserHelper_1.getUID)();
    if (!puid) {
        return { success: false };
    }
    let shieldMeLastAuxValue = BlackListInfo?.shieldMeLastAuxValue || "";
    let shieldMeLastValue = BlackListInfo?.shieldMeLastValue || "";
    let lastPage = 0;
    while (lastPage < 1) {
        let shieldMeData = await BlacklistOut_1.BlacklistOut.getShieldingMeUserList(puid, shieldMeLastValue, shieldMeLastAuxValue, 100);
        if (shieldMeData.result != 1) {
            return;
        }
        const ids = shieldMeData?.data?.list?.map((i) => String(i.thePuid)) || [];
        const insertData = shieldMeData?.data?.list?.filter((i) => !i.deleted);
        if (ids.length) {
            await (0, BlacklistDbHelper_1.deleteShieldMeData)(ids.join(","));
            await (0, BlacklistDbHelper_1.insertShieldMeData)(insertData);
        }
        lastPage = shieldMeData?.data?.lastPage;
        shieldMeLastAuxValue = shieldMeData?.data?.lastAuxValue || '';
        shieldMeLastValue = shieldMeData?.data?.lastValue || shieldMeLastValue;
        if (lastPage == 1) {
            BlackListInfo.shieldMeLastAuxValue = shieldMeLastAuxValue;
            BlackListInfo.shieldMeLastValue = shieldMeLastValue;
            (0, MainHelper_1.setUserStore)("blackListInfoStoreKey", BlackListInfo);
        }
    }
}
exports.loadShieldMeData = loadShieldMeData;
function invokeSyncBlacklist() {
    return new Promise((resolve, reject) => {
        if (!m_SysnBlacklistState) {
            m_SysnBlacklistState = 1;
            startSyncBlacklist()
                .then(() => {
                m_SysnBlacklistState = 0;
                resolve({ state: 0 });
            })
                .catch(() => {
                m_SysnBlacklistState = 0;
                resolve({ state: 0 });
            });
        }
        else {
            resolve({ state: 1 });
        }
    });
}
(0, UserHelper_1.onUserLoginEnd)(() => {
    invokeSyncBlacklist();
});
(0, UserHelper_1.onUserLogout)(() => {
});
module.exports = { invokeSyncBlacklist };
exports.default = module.exports;
//# sourceMappingURL=BlacklistHelper.js.map