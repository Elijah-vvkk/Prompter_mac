const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 模板相关
  getTemplates: () => ipcRenderer.invoke('get-templates'),
  addTemplate: (template) => ipcRenderer.invoke('add-template', template),
  updateTemplate: (template) => ipcRenderer.invoke('update-template', template),
  deleteTemplate: (id) => ipcRenderer.invoke('delete-template', id),
  
  // 设置相关
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  
  // 窗口控制
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  toggleWindow: () => ipcRenderer.send('toggle-window'),
  
  // 剪贴板
  copyToClipboard: (text) => ipcRenderer.send('copy-to-clipboard', text),
  
  // 文件操作
  selectFile: (filters) => ipcRenderer.invoke('select-file', filters),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // 事件监听
  onWindowHide: (callback) => {
    ipcRenderer.on('window-hide', callback);
    return () => {
      ipcRenderer.removeListener('window-hide', callback);
    };
  }
}); 