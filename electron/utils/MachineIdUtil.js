"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.machineIdSync = void 0;
const node_machine_id_1 = require("node-machine-id");
const os_1 = __importDefault(require("os"));
function machineIdSync(original) {
    let machineId = "";
    try {
        machineId = (0, node_machine_id_1.machineIdSync)(true);
    }
    catch (e) {
        console.warn(e);
    }
    if (process.platform == "win32") {
        let macAddresses = getMacAddresses();
        if (macAddresses) {
            macAddresses = macAddresses.replaceAll(":", "");
        }
        if (machineId.length > 12) {
            if (macAddresses) {
                machineId = machineId.substring(12) + macAddresses;
            }
        }
        else {
            machineId += macAddresses;
        }
    }
    return machineId;
}
exports.machineIdSync = machineIdSync;
function getMacAddresses() {
    const networkInterfaces = os_1.default.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            if (iface.mac && iface.mac !== "00:00:00:00:00:00") {
                let macData = iface.mac.split(":");
                if (macData.length == 6) {
                    return iface.mac;
                }
            }
        }
    }
}
module.exports = { machineIdSync };
//# sourceMappingURL=MachineIdUtil.js.map