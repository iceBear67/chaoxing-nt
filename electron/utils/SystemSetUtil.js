"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openSystemTimeSyncSettings = void 0;
const child_process_1 = require("child_process");
const os_1 = require("os");
function openSystemTimeSyncSettings() {
    try {
        switch ((0, os_1.platform)()) {
            case 'win32':
                (0, child_process_1.exec)('start ms-settings:dateandtime /page=sync', (error) => {
                    if (error) {
                        console.log('现代设置打开失败，尝试传统控制面板');
                        (0, child_process_1.exec)('control timedate.cpl,,/sync');
                    }
                });
                break;
            case 'darwin':
                (0, child_process_1.exec)('open "x-apple.systempreferences:com.apple.preference.datetime?Datetime"');
                break;
            case 'linux':
                (0, child_process_1.exec)('gnome-control-center datetime');
                break;
            default:
                console.log('不支持的操作系统');
        }
    }
    catch (error) {
        console.error('打开时间同步设置失败:', error);
    }
}
exports.openSystemTimeSyncSettings = openSystemTimeSyncSettings;
//# sourceMappingURL=SystemSetUtil.js.map