// 导入样式文件
import './styles/reset.css';
import './styles/main.css';

// 导入渲染进程主文件
import './renderer.js';

// 监听 DOMContentLoaded 事件
document.addEventListener('DOMContentLoaded', () => {
  // 初始化应用
  console.log('应用已启动');
  
  // 注册全局快捷键
  document.addEventListener('keydown', (e) => {
    // 检查是否是 CommandOrControl + D
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      // 通知主进程显示/隐藏窗口
      window.electronAPI.toggleWindow();
    }
  });
  
  // 注册拖放事件
  const dropzone = document.getElementById('importDropzone');
  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/json') {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const data = JSON.parse(event.target.result);
              if (Array.isArray(data)) {
                for (const template of data) {
                  await window.electronAPI.addTemplate(template);
                }
                // 刷新模板列表
                window.location.reload();
              }
            } catch (error) {
              console.error('导入失败:', error);
            }
          };
          reader.readAsText(file);
        }
      }
    });
  }
  
  // 注册窗口控制按钮事件
  const minimizeBtn = document.getElementById('minimizeBtn');
  const closeBtn = document.getElementById('closeBtn');
  
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      window.electronAPI.minimizeWindow();
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.electronAPI.closeWindow();
    });
  }
  
  // 注册设置相关事件
  const autoStartSwitch = document.getElementById('autoStartSwitch');
  if (autoStartSwitch) {
    autoStartSwitch.addEventListener('change', async (e) => {
      const settings = await window.electronAPI.getSettings();
      settings.autoStart = e.target.checked;
      await window.electronAPI.updateSettings(settings);
    });
  }
  
  // 注册快捷键设置事件
  const hotkeyInput = document.getElementById('hotkeyInput');
  if (hotkeyInput) {
    hotkeyInput.addEventListener('keydown', async (e) => {
      e.preventDefault();
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        hotkeyInput.value = key;
        const settings = await window.electronAPI.getSettings();
        settings.hotkey = `CommandOrControl+${key}`;
        try {
          await window.electronAPI.updateSettings(settings);
        } catch (error) {
          // 显示快捷键冲突提示
          const hotkeyConflictModal = document.getElementById('hotkeyConflictModal');
          if (hotkeyConflictModal) {
            hotkeyConflictModal.classList.remove('hidden');
          }
        }
      }
    });
  }
}); 