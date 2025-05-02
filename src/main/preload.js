const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('api', {
  // 模板相关
  getTemplates: () => ipcRenderer.invoke('get-templates'),
  addTemplate: (template) => ipcRenderer.invoke('add-template', template),
  updateTemplate: (template) => ipcRenderer.invoke('update-template', template),
  deleteTemplate: (id) => ipcRenderer.invoke('delete-template', id),
  
  // 分类相关
  getCategories: () => ipcRenderer.invoke('get-categories'),
  addCategory: (category) => ipcRenderer.invoke('add-category', category),
  updateCategory: (category) => ipcRenderer.invoke('update-category', category),
  deleteCategory: (id) => ipcRenderer.invoke('delete-category', id),
  
  // 设置相关
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  
  // 窗口控制
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  hideWindow: () => ipcRenderer.send('hide-window'),
  
  // 系统托盘
  showTrayMenu: () => ipcRenderer.send('show-tray-menu'),
  
  // 剪贴板
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  
  // 文件操作
  selectFile: () => ipcRenderer.invoke('select-file'),
  importTemplates: (filePath) => ipcRenderer.invoke('import-templates', filePath),
  exportTemplates: (filePath) => ipcRenderer.invoke('export-templates', filePath),
  
  // 快捷键
  registerHotkey: () => ipcRenderer.invoke('register-hotkey'),
  unregisterHotkey: () => ipcRenderer.invoke('unregister-hotkey'),
  
  // 事件监听
  onWindowHide: (callback) => {
    ipcRenderer.on('window-hide', callback);
    return () => ipcRenderer.removeListener('window-hide', callback);
  },
  
  onHotkeyConflict: (callback) => {
    ipcRenderer.on('hotkey-conflict', callback);
    return () => ipcRenderer.removeListener('hotkey-conflict', callback);
  },
  
  onTemplateUpdate: (callback) => {
    ipcRenderer.on('template-update', callback);
    return () => ipcRenderer.removeListener('template-update', callback);
  },
  
  onCategoryUpdate: (callback) => {
    ipcRenderer.on('category-update', callback);
    return () => ipcRenderer.removeListener('category-update', callback);
  },
  
  onSettingsUpdate: (callback) => {
    ipcRenderer.on('settings-update', callback);
    return () => ipcRenderer.removeListener('settings-update', callback);
  }
}); 