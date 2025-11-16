"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSyncAllContacts = void 0;
const ContactsOut_1 = require("../../out/contacts/ContactsOut");
const UserHelper_1 = require("../UserHelper");
const ContactsDbHelper_1 = require("./ContactsDbHelper");
const appConfig = require("../../config/appconfig");
let m_SysnState = 0;
async function startSyncAllContacts(isFullUpdate = false) {
    console.log("startSyncAllContacts");
    try {
        await (0, ContactsDbHelper_1.init)();
        let puid = (0, UserHelper_1.getUID)();
        if (!puid || m_SysnState == 2) {
            return { success: false };
        }
        let unitData = await ContactsOut_1.ContactsOut.getUserUnitList(puid, "contacts");
        const unitFids = unitData.msg?.map((item) => item.fid)?.join(",");
        console.log("startSyncAllContacts:unitData", "fids:", unitFids);
        if (!unitData) {
            return { success: false };
        }
        if (unitData.result == 1) {
            let unitList = unitData.msg;
            if (unitList) {
                let oldUnitData;
                if (!isFullUpdate) {
                    oldUnitData = await (0, ContactsDbHelper_1.getUnitData)();
                    const oldUnitFids = oldUnitData?.map((item) => item.fid)?.join(",");
                    const oldUnitNames = oldUnitData?.map((item) => item.name)?.join(",");
                    console.log("startSyncAllContacts:oldUnitData", "fids", oldUnitFids, "names", oldUnitNames);
                }
                else {
                    await (0, ContactsDbHelper_1.deleteDeptData)();
                }
                await (0, ContactsDbHelper_1.deleteAllUnitData)();
                let teamUnitInfo = {
                    fid: "-1",
                    name: "团队",
                    addressbookDataType: 0,
                    userTimeStamp: "",
                    userDeptTimeStamp: "",
                    userDeptTimeAuxValue: "",
                    deptMcode: "",
                };
                unitList.unshift(teamUnitInfo);
                if (oldUnitData && oldUnitData.length > 0) {
                    for (let unitInfo of unitList) {
                        for (let i = oldUnitData.length - 1; i >= 0; i--) {
                            if (m_SysnState == 2) {
                                break;
                            }
                            let oldUnit = oldUnitData[i];
                            if (unitInfo.fid == oldUnit.fid) {
                                unitInfo.userTimeStamp = oldUnit.userTimeStamp;
                                unitInfo.userDeptTimeStamp = oldUnit.userDeptTimeStamp;
                                unitInfo.userDeptTimeAuxValue = oldUnit.userDeptTimeAuxValue;
                                unitInfo.deptMcode = oldUnit.deptMcode;
                                oldUnitData.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
                await (0, ContactsDbHelper_1.insertUnitData)(unitList);
                for (let unitInfo of unitList) {
                    await startSyncContacts(unitInfo, unitInfo?.addressbookDataType == 1, isFullUpdate);
                }
                await loadMyFollowers();
            }
            return { success: true };
        }
        return { success: false };
    }
    catch (e) {
        console.error("startSyncAllContacts error", e);
        return { success: false };
    }
}
exports.startSyncAllContacts = startSyncAllContacts;
async function loadMyFollowers() {
    let puid = (0, UserHelper_1.getUID)();
    if (!puid || m_SysnState == 2) {
        return { success: false };
    }
    const followersData = await ContactsOut_1.ContactsOut.getMyFollowers(puid);
    if (followersData.result != 1) {
        return;
    }
    await (0, ContactsDbHelper_1.deleteFollowerData)();
    await (0, ContactsDbHelper_1.insertFollowerData)(followersData?.data?.list);
}
async function startSyncContacts(unitInfo, isStructure = false, isFullUpdate = false) {
    console.log("startSyncContacts:m_SysnState", m_SysnState);
    if (!unitInfo || m_SysnState == 2) {
        return { success: false };
    }
    let timeStamp = unitInfo.userDeptTimeStamp;
    if (!timeStamp) {
        isFullUpdate = true;
    }
    let result = await loadDepts(unitInfo, isStructure);
    console.log("startSyncContacts:loadDepts", result);
    if (!result || !result.success) {
        return { success: false };
    }
    if (isFullUpdate) {
        await loadUsers(unitInfo.fid, isStructure, unitInfo);
        await loadUserDepts(unitInfo, isStructure);
    }
    else {
        await loadDeptUserLogs(unitInfo, isStructure);
    }
}
let isUpdateFidUser = false;
async function updateCurrentFidUsers(unitInfo) {
    if (!isUpdateFidUser) {
        try {
            isUpdateFidUser = true;
            await loadUsers(unitInfo.fid, unitInfo?.addressbookDataType == 1, unitInfo);
            await loadUserDepts(unitInfo, unitInfo?.addressbookDataType == 1);
            isUpdateFidUser = false;
            return { success: true };
        }
        catch (error) {
            isUpdateFidUser = false;
            return { success: false };
        }
    }
    else {
        return { success: true, isUpdating: true };
    }
}
async function loadDeptUserLogs(unitInfo, isStructure) {
    let puid = (0, UserHelper_1.getUID)();
    if (!puid || m_SysnState == 2) {
        return { success: false };
    }
    let lastValue = unitInfo.userDeptTimeStamp;
    let offsetAuxValue = unitInfo.userDeptTimeAuxValue;
    let lastPage = 0;
    while (lastPage < 1) {
        if (m_SysnState == 2) {
            break;
        }
        let logData;
        if (!isStructure) {
            logData = await ContactsOut_1.ContactsOut.getUnitDeptUserLogs(puid, unitInfo.fid, lastValue, offsetAuxValue, 1000);
        }
        else {
            logData = await ContactsOut_1.ContactsOut.getStructureDeptUserLogs(puid, unitInfo.fid, lastValue, offsetAuxValue, 1000);
        }
        if (logData?.result != 1) {
            return;
        }
        if (logData?.data?.list && logData?.data?.list.length) {
            for (let item of logData?.data?.list) {
                if (m_SysnState == 2) {
                    break;
                }
                if (item.type == "1") {
                    await (0, ContactsDbHelper_1.singleDeleteUserDeptData)(item.fid, item.deptid, item.uid);
                    await (0, ContactsDbHelper_1.insertUserDeptData)([item]);
                    if (item.user) {
                        await (0, ContactsDbHelper_1.deleteUserByUid)(item.uid, item.fid);
                        await (0, ContactsDbHelper_1.insertUserData)([{ ...item.user, fid: item.fid }]);
                    }
                }
                else {
                    await (0, ContactsDbHelper_1.singleDeleteUserDeptData)(item.fid, item.deptid, item.uids || item.uid);
                    if (item.uids) {
                        const m_uids = item.uids.split(",");
                        for (let m_uid of m_uids) {
                            if (m_SysnState == 2) {
                                break;
                            }
                            const result = await (0, ContactsDbHelper_1.getDeptUserDataByUid)(item.fid, m_uid);
                            if (!result) {
                                await (0, ContactsDbHelper_1.deleteUserByUid)(m_uid, item.fid);
                            }
                        }
                    }
                    else {
                        const result = await (0, ContactsDbHelper_1.getDeptUserDataByUid)(item.fid, item.uid);
                        if (!result) {
                            await (0, ContactsDbHelper_1.deleteUserByUid)(item.uid, item.fid);
                        }
                    }
                }
            }
        }
        lastValue = logData.data?.lastValue;
        lastPage = logData.data.lastPage;
        offsetAuxValue = logData.data?.lastAuxValue;
        if (lastPage == 1) {
            unitInfo.userDeptTimeStamp = String(Math.max(parseInt(unitInfo.userDeptTimeStamp) || 0, logData.data?.lastValue || 0));
            unitInfo.userDeptTimeAuxValue =
                logData.data?.lastAuxValue || unitInfo.userDeptTimeAuxValue;
            await (0, ContactsDbHelper_1.updateUnitData)(unitInfo);
        }
    }
}
async function loadDepts(unitInfo, isStructure) {
    let puid = (0, UserHelper_1.getUID)();
    if (!puid || m_SysnState == 2) {
        return { success: false };
    }
    if (isStructure) {
        let lastValue;
        let lastPage = 0;
        while (lastPage < 1) {
            if (m_SysnState == 2) {
                break;
            }
            let deptData = await ContactsOut_1.ContactsOut.getStructureDept(puid, unitInfo.fid, lastValue, 1000);
            if (deptData.result != 1) {
                return;
            }
            if (!lastValue) {
                await (0, ContactsDbHelper_1.deleteDeptData)(unitInfo.fid);
            }
            lastValue = deptData.data.lastValue;
            lastPage = deptData.data.lastPage;
            await (0, ContactsDbHelper_1.insertDeptData)(deptData.data.depts);
            if (lastPage == 1) {
                unitInfo.deptMcode = deptData.data.mcode;
                await (0, ContactsDbHelper_1.updateUnitData)(unitInfo);
            }
        }
    }
    else {
        let cpage = 1;
        let lastPage = 0;
        while (lastPage < 1) {
            if (m_SysnState == 2) {
                break;
            }
            let deptData = await ContactsOut_1.ContactsOut.getUnitDept(puid, unitInfo.fid, cpage, 1000);
            if (deptData.result != 1 || deptData?.msg != "success") {
                return;
            }
            if (cpage == 1) {
                await (0, ContactsDbHelper_1.deleteDeptData)(unitInfo.fid);
            }
            lastPage = cpage >= deptData.data.ph.pageNum ? 1 : 0;
            cpage++;
            await (0, ContactsDbHelper_1.insertDeptData)(deptData.data.depts);
            if (lastPage == 1) {
                unitInfo.deptMcode = deptData.data.mcode;
                await (0, ContactsDbHelper_1.updateUnitData)(unitInfo);
            }
        }
    }
    return { success: true };
}
async function loadUsers(fid, isStructure, unitInfo) {
    console.log("loadUsers:m_SysnState", m_SysnState);
    let puid = (0, UserHelper_1.getUID)();
    if (!puid || m_SysnState == 2) {
        return { success: false };
    }
    let lastValue;
    let lastPage = 0;
    if (!isStructure) {
        while (lastPage < 1) {
            if (m_SysnState == 2) {
                break;
            }
            let usersData = await ContactsOut_1.ContactsOut.getUsersByUnit(puid, fid, lastValue, 1000);
            if (usersData?.result != 1 || !usersData.msg?.innerUsers) {
                return;
            }
            if (!lastValue) {
                await (0, ContactsDbHelper_1.deleteUserData)(fid);
            }
            if (usersData?.msg?.innerUsers) {
                usersData?.msg?.innerUsers.forEach((item) => {
                    item.fid = fid;
                });
            }
            lastValue = usersData.pagesOffset?.lastValue;
            lastPage = usersData.pagesOffset?.lastPage;
            const UserList = usersData.msg?.innerUsers || [];
            await (0, ContactsDbHelper_1.insertUserData)(UserList);
            if (lastPage == 1) {
                unitInfo.userTimeStamp = usersData.lastGetTime
                    ? String(usersData.lastGetTime)
                    : "";
                await (0, ContactsDbHelper_1.updateUnitData)(unitInfo);
            }
        }
    }
    else {
        while (lastPage < 1) {
            if (m_SysnState == 2) {
                break;
            }
            let usersData = await ContactsOut_1.ContactsOut.getUsersByStructure(puid, fid, lastValue, 1000);
            if (usersData?.result != 1) {
                return;
            }
            if (!lastValue) {
                await (0, ContactsDbHelper_1.deleteUserData)(fid);
            }
            if (usersData?.data?.list) {
                usersData?.data?.list.forEach((item) => {
                    item.fid = fid;
                });
            }
            lastValue = usersData.data?.lastValue;
            lastPage = usersData.data.lastPage;
            await (0, ContactsDbHelper_1.insertUserData)(usersData.data.list);
        }
    }
}
async function loadUserDepts(unitInfo, isStructure) {
    console.log("loadUserDepts:m_SysnState", m_SysnState);
    let puid = (0, UserHelper_1.getUID)();
    if (!puid || m_SysnState == 2) {
        return { success: false };
    }
    let lastValue;
    let offsetAuxValue;
    let lastPage = 0;
    while (lastPage < 1) {
        if (m_SysnState == 2) {
            break;
        }
        let usersDeptData;
        if (!isStructure) {
            usersDeptData = await ContactsOut_1.ContactsOut.getUsersDeptsByUnit(puid, unitInfo.fid, lastValue, offsetAuxValue, 1000);
        }
        else {
            usersDeptData = await ContactsOut_1.ContactsOut.getUsersDeptsByStructure(puid, unitInfo.fid, lastValue, offsetAuxValue, 1000);
        }
        if (usersDeptData?.result != 1) {
            return;
        }
        if (!lastValue) {
            await (0, ContactsDbHelper_1.deleteUserDeptData)(unitInfo.fid);
        }
        lastValue = usersDeptData.data.lastValue;
        offsetAuxValue = usersDeptData.data.lastAuxValue;
        lastPage = usersDeptData.data.lastPage;
        await (0, ContactsDbHelper_1.insertUserDeptData)(usersDeptData.data.list);
        if (lastPage == 1) {
            unitInfo.userDeptTimeStamp = String(usersDeptData.data.lastGetTime || unitInfo.userDeptTimeStamp);
            unitInfo.userDeptTimeAuxValue = usersDeptData.data.lastGetTime
                ? String(offsetAuxValue)
                : unitInfo.userDeptTimeAuxValue;
            await (0, ContactsDbHelper_1.updateUnitData)(unitInfo);
        }
    }
}
function invokeSyncContacts(isFullUpdate) {
    console.log("invokeSyncContacts:m_SysnState", m_SysnState);
    return new Promise((resolve, reject) => {
        if (!m_SysnState) {
            m_SysnState = 1;
            startSyncAllContacts(isFullUpdate)
                .then(() => {
                if (m_SysnState == 2) {
                    m_SysnState = 0;
                    invokeSyncContacts(false);
                }
                m_SysnState = 0;
                resolve({ state: 0 });
            })
                .catch(() => {
                m_SysnState = 0;
                resolve({ state: 0 });
            });
        }
        else {
            resolve({ state: 1 });
        }
    });
}
async function updateTeamUnitData() {
    try {
        const unitData = await (0, ContactsDbHelper_1.getUnitData)();
        const teamUnitInfo = unitData.filter((i) => i.fid == "-1");
        if (teamUnitInfo && teamUnitInfo.length) {
            await startSyncContacts(teamUnitInfo[0], teamUnitInfo[0]?.addressbookDataType == 1, false);
        }
    }
    catch (error) {
        console.log("updateTeamUnitData", error);
    }
}
(0, UserHelper_1.onUserLoginEnd)(() => {
    if (appConfig.appMode == "normal") {
        invokeSyncContacts(false);
    }
});
(0, UserHelper_1.onUserLogout)(() => {
    console.log("onUserLogout:m_SysnState", m_SysnState);
    if (m_SysnState == 1) {
        m_SysnState = 2;
    }
});
module.exports = {
    startSyncAllContacts,
    invokeSyncContacts,
    updateTeamUnitData,
    updateCurrentFidUsers,
};
exports.default = module.exports;
//# sourceMappingURL=ContactsHelper.js.map