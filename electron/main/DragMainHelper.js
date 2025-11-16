"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelDrag = exports.getDraggingInfo = exports.initDragHelper = void 0;
const electron_1 = require("electron");
const draggingWindows = new Map();
function initDragHelper() {
    electron_1.ipcMain.on('_startDragWindow', (event) => {
        try {
            const win = electron_1.BrowserWindow.fromWebContents(event.sender);
            if (!win || win.isDestroyed()) {
                return;
            }
            const windowBounds = win.getBounds();
            const existingDraggingInfo = draggingWindows.get(win);
            if (existingDraggingInfo && existingDraggingInfo.timerId) {
                clearInterval(existingDraggingInfo.timerId);
            }
            const cursorPoint = electron_1.screen.getCursorScreenPoint();
            const draggingInfo = {
                startMouseX: cursorPoint.x,
                startMouseY: cursorPoint.y,
                startWindowX: windowBounds.x,
                startWindowY: windowBounds.y,
                isDragging: true,
                webContents: event.sender
            };
            draggingWindows.set(win, draggingInfo);
            const timerId = setInterval(() => {
                updateWindowPosition(win);
            }, 30);
            draggingInfo.timerId = timerId;
            event.sender.send('drag-window-started');
        }
        catch (error) {
            console.error('Start drag window error:', error);
        }
    });
    electron_1.ipcMain.on('_endDragWindow', (event) => {
        try {
            const win = electron_1.BrowserWindow.fromWebContents(event.sender);
            if (!win || win.isDestroyed()) {
                return;
            }
            const draggingInfo = draggingWindows.get(win);
            if (draggingInfo) {
                if (draggingInfo.timerId) {
                    clearInterval(draggingInfo.timerId);
                }
                draggingInfo.isDragging = false;
                draggingInfo.timerId = undefined;
            }
            event.sender.send('drag-window-ended');
        }
        catch (error) {
            console.error('End drag window error:', error);
        }
    });
    electron_1.ipcMain.on('window-closed', (event) => {
        const win = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!win || win.isDestroyed()) {
            return;
        }
        const draggingInfo = draggingWindows.get(win);
        if (draggingInfo && draggingInfo.timerId) {
            clearInterval(draggingInfo.timerId);
        }
        draggingWindows.delete(win);
    });
    console.log('DragMainHelper initialized successfully');
}
exports.initDragHelper = initDragHelper;
function updateWindowPosition(win) {
    try {
        const draggingInfo = draggingWindows.get(win);
        if (!draggingInfo || !draggingInfo.isDragging || win.isDestroyed()) {
            return;
        }
        const cursorPoint = electron_1.screen.getCursorScreenPoint();
        const currentMouseX = cursorPoint.x;
        const currentMouseY = cursorPoint.y;
        const deltaX = currentMouseX - draggingInfo.startMouseX;
        const deltaY = currentMouseY - draggingInfo.startMouseY;
        const newX = draggingInfo.startWindowX + deltaX;
        const newY = draggingInfo.startWindowY + deltaY;
        const display = electron_1.screen.getDisplayNearestPoint({ x: newX, y: newY });
        const workArea = display.workArea;
        const boundedX = Math.max(workArea.x, Math.min(newX, workArea.x + workArea.width - 100));
        const boundedY = Math.max(workArea.y, Math.min(newY, workArea.y + workArea.height - 50));
        const currentBounds = win.getBounds();
        win.setBounds({
            x: boundedX,
            y: boundedY,
            width: currentBounds.width,
            height: currentBounds.height
        }, false);
    }
    catch (error) {
        console.error('Update window position error:', error);
    }
}
function getDraggingInfo(win) {
    return draggingWindows.get(win) || null;
}
exports.getDraggingInfo = getDraggingInfo;
function cancelDrag(win) {
    const draggingInfo = draggingWindows.get(win);
    if (draggingInfo && draggingInfo.timerId) {
        clearInterval(draggingInfo.timerId);
    }
    draggingWindows.delete(win);
}
exports.cancelDrag = cancelDrag;
module.exports = {
    initDragHelper,
    getDraggingInfo,
    cancelDrag
};
//# sourceMappingURL=DragMainHelper.js.map