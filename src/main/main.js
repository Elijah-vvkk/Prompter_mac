const { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

// 检查是否已经有实例在运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// 初始化存储
const store = new Store({
  name: 'prompter-data',
  defaults: {
    templates: [],
    categories: [],
    settings: {
      autoStart: false,
      hotkey: null,
      theme: 'light'
    }
  }
});

// 应用数据路径
const APP_DATA_PATH = path.join(app.getPath('userData'), 'data');
const DATA_FILE_PATH = path.join(APP_DATA_PATH, 'data.json');

// 全局变量
let mainWindow = null;
let tray = null;
let isQuitting = false;

// 确保应用数据目录存在
if (!fs.existsSync(APP_DATA_PATH)) {
  fs.mkdirSync(APP_DATA_PATH, { recursive: true });
}

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../../build/icon.icns'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 }
  });

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 窗口关闭事件
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // 窗口隐藏事件
  mainWindow.on('hide', () => {
    mainWindow.webContents.send('window-hide');
  });
}

// 创建系统托盘
function createTray() {
  tray = new Tray(path.join(__dirname, '../../build/tray.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: '开机自启',
      type: 'checkbox',
      checked: store.get('settings.autoStart'),
      click: (menuItem) => {
        store.set('settings.autoStart', menuItem.checked);
        setAutoStart(menuItem.checked);
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Prompter');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// 设置开机自启
function setAutoStart(enable) {
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: app.getPath('exe')
  });
}

// 注册全局快捷键
function registerGlobalShortcut() {
  const hotkey = store.get('settings.hotkey');
  if (hotkey) {
    try {
      globalShortcut.register(hotkey, () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      });
    } catch (error) {
      console.error('注册快捷键失败:', error);
      store.set('settings.hotkey', null);
    }
  }
}

// 初始化预设模板
function initPresetTemplates() {
  const templates = store.get('templates');
  if (templates.length === 0) {
    const presetTemplates = [
      {
        id: '1',
        title: '欢迎使用',
        categoryId: null,
        content: '欢迎使用 Prompter！\n\n这是一个简单的提示词管理工具，可以帮助您更好地组织和管理提示词。'
      }
    ];
    store.set('templates', presetTemplates);
  }
}

// 注册 IPC 处理程序
function registerIpcHandlers() {
  // 模板相关
  ipcMain.handle('get-templates', () => {
    return store.get('templates');
  });

  ipcMain.handle('add-template', (event, template) => {
    const templates = store.get('templates');
    templates.push(template);
    store.set('templates', templates);
    mainWindow.webContents.send('template-update', templates);
    return template;
  });

  ipcMain.handle('update-template', (event, template) => {
    const templates = store.get('templates');
    const index = templates.findIndex(t => t.id === template.id);
    if (index !== -1) {
      templates[index] = template;
      store.set('templates', templates);
      mainWindow.webContents.send('template-update', templates);
    }
    return template;
  });

  ipcMain.handle('delete-template', (event, id) => {
    const templates = store.get('templates');
    const newTemplates = templates.filter(t => t.id !== id);
    store.set('templates', newTemplates);
    mainWindow.webContents.send('template-update', newTemplates);
    return true;
  });

  // 分类相关
  ipcMain.handle('get-categories', () => {
    return store.get('categories');
  });

  ipcMain.handle('add-category', (event, category) => {
    const categories = store.get('categories');
    categories.push(category);
    store.set('categories', categories);
    mainWindow.webContents.send('category-update', categories);
    return category;
  });

  ipcMain.handle('update-category', (event, category) => {
    const categories = store.get('categories');
    const index = categories.findIndex(c => c.id === category.id);
    if (index !== -1) {
      categories[index] = category;
      store.set('categories', categories);
      mainWindow.webContents.send('category-update', categories);
    }
    return category;
  });

  ipcMain.handle('delete-category', (event, id) => {
    const categories = store.get('categories');
    const newCategories = categories.filter(c => c.id !== id);
    store.set('categories', newCategories);
    mainWindow.webContents.send('category-update', newCategories);
    return true;
  });

  // 设置相关
  ipcMain.handle('get-settings', () => {
    return store.get('settings');
  });

  ipcMain.handle('update-settings', (event, settings) => {
    store.set('settings', settings);
    mainWindow.webContents.send('settings-update', settings);
    return settings;
  });

  // 窗口控制
  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  ipcMain.on('hide-window', () => {
    mainWindow.hide();
  });

  // 剪贴板
  ipcMain.handle('copy-to-clipboard', (event, text) => {
    clipboard.writeText(text);
    return true;
  });

  // 文件操作
  ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'JSON 文件', extensions: ['json'] }
      ]
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('import-templates', async (event, filePath) => {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        store.set('templates', data);
        mainWindow.webContents.send('template-update', data);
        return true;
      }
    } catch (error) {
      console.error('导入模板失败:', error);
    }
    return false;
  });

  ipcMain.handle('export-templates', async (event, filePath) => {
    try {
      const templates = store.get('templates');
      await fs.promises.writeFile(filePath, JSON.stringify(templates, null, 2));
      return true;
    } catch (error) {
      console.error('导出模板失败:', error);
      return false;
    }
  });

  // 快捷键
  ipcMain.handle('register-hotkey', async () => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '注册快捷键',
      message: '请按下您想要使用的快捷键组合',
      buttons: ['确定']
    });

    if (result.response === 0) {
      return new Promise((resolve) => {
        const handler = (event) => {
          event.preventDefault();
          const hotkey = event.key.toUpperCase();
          globalShortcut.unregisterAll();
          try {
            globalShortcut.register(hotkey, () => {
              mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
            });
            store.set('settings.hotkey', hotkey);
            resolve(hotkey);
          } catch (error) {
            console.error('注册快捷键失败:', error);
            mainWindow.webContents.send('hotkey-conflict');
            resolve(null);
          }
          mainWindow.webContents.removeListener('before-input-event', handler);
        };
        mainWindow.webContents.on('before-input-event', handler);
      });
    }
    return null;
  });

  ipcMain.handle('unregister-hotkey', () => {
    globalShortcut.unregisterAll();
    store.set('settings.hotkey', null);
    return true;
  });
}

// 应用准备就绪
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerGlobalShortcut();
  initPresetTemplates();
  registerIpcHandlers();
});

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用激活时显示主窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

// 应用退出前清理
app.on('before-quit', () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
}); 