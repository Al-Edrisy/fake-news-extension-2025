const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any desktop-specific APIs here if needed
  platform: process.platform,
  version: process.versions.electron,
  
  // Example: Send a message to main process
  sendMessage: (message) => ipcRenderer.send('message', message),
  
  // Example: Receive messages from main process
  onMessage: (callback) => ipcRenderer.on('message', callback),
  
  // Remove listener
  removeListener: (channel) => ipcRenderer.removeAllListeners(channel)
}); 