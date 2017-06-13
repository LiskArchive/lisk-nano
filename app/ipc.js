const { ipcRenderer, shell } = window.require('electron');
/**
 * Add ipcRenderer to the window object
 */
window.ipc = ipcRenderer;
/**
 * Add shell to the window object
 */
window.shell = shell;
