// 全局变量
let templates = [];
let categories = [];
let settings = {};
let selectedTemplateId = null;
let selectedCategoryId = null;
let isBatchSelectMode = false;
let selectedTemplateIds = new Set();

// DOM 元素
const elements = {
  // 窗口控制
  minimizeBtn: document.getElementById('minimizeBtn'),
  closeBtn: document.getElementById('closeBtn'),
  
  // 操作按钮
  addTemplateBtn: document.getElementById('addTemplateBtn'),
  addCategoryBtn: document.getElementById('addCategoryBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  batchSelectBtn: document.getElementById('batchSelectBtn'),
  deleteBtn: document.getElementById('deleteBtn'),
  
  // 列表
  categoryList: document.getElementById('categoryList'),
  templateList: document.getElementById('templateList'),
  
  // 模板内容
  templateContent: document.getElementById('templateContent'),
  templateEditContent: document.getElementById('templateEditContent'),
  saveTemplateEditBtn: document.getElementById('saveTemplateEditBtn'),
  copyBtn: document.getElementById('copyBtn'),
  
  // 模态框
  modalContainer: document.getElementById('modalContainer'),
  templateModal: document.getElementById('templateModal'),
  categoryModal: document.getElementById('categoryModal'),
  settingsModal: document.getElementById('settingsModal'),
  confirmModal: document.getElementById('confirmModal'),
  hotkeyConflictModal: document.getElementById('hotkeyConflictModal'),
  
  // 表单
  templateForm: document.getElementById('templateForm'),
  categoryForm: document.getElementById('categoryForm'),
  
  // 设置
  autoStartSwitch: document.getElementById('autoStartSwitch'),
  hotkeyInput: document.getElementById('hotkeyInput'),
  importDropzone: document.getElementById('importDropzone'),
  selectFileBtn: document.getElementById('selectFileBtn')
};

// 初始化应用
async function initApp() {
  try {
    // 加载数据
    const data = await window.api.getAppData();
    templates = data.templates || [];
    categories = data.categories || [];
    settings = data.settings || {};
    
    // 更新界面
    updateCategories();
    updateTemplates();
    updateSettings();
    
    // 注册事件监听器
    registerEventListeners();
  } catch (error) {
    console.error('初始化应用失败:', error);
  }
}

// 更新分类列表
function updateCategories() {
  const categoryList = elements.categoryList;
  categoryList.innerHTML = '';
  
  if (categories.length === 0) {
    categoryList.innerHTML = '<li class="category-list-item category-list-item-empty">暂无分类</li>';
    return;
  }
  
  categories.forEach(category => {
    const li = document.createElement('li');
    li.className = `category-list-item ${category.id === selectedCategoryId ? 'selected' : ''}`;
    li.dataset.id = category.id;
    li.innerHTML = `
      <span class="category-name">${category.name}</span>
      <span class="category-count">${getTemplateCountByCategory(category.id)}</span>
    `;
    categoryList.appendChild(li);
  });
}

// 更新模板列表
function updateTemplates() {
  const templateList = elements.templateList;
  templateList.innerHTML = '';
  
  const filteredTemplates = selectedCategoryId
    ? templates.filter(t => t.categoryId === selectedCategoryId)
    : templates;
  
  if (filteredTemplates.length === 0) {
    templateList.innerHTML = '<li class="template-list-item template-list-item-empty">暂无模板</li>';
    return;
  }
  
  filteredTemplates.forEach(template => {
    const li = document.createElement('li');
    li.className = `template-list-item ${template.id === selectedTemplateId ? 'selected' : ''}`;
    li.dataset.id = template.id;
    li.innerHTML = `
      <div class="template-item-content">
        <span class="template-title">${template.title}</span>
        <span class="template-category">${getCategoryName(template.categoryId)}</span>
      </div>
      ${isBatchSelectMode ? `
        <input type="checkbox" class="template-checkbox" ${selectedTemplateIds.has(template.id) ? 'checked' : ''}>
      ` : ''}
    `;
    templateList.appendChild(li);
  });
}

// 更新模板内容
function updateTemplateContent() {
  const template = templates.find(t => t.id === selectedTemplateId);
  if (!template) {
    elements.templateContent.innerHTML = `
      <div class="template-content-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V18M8 5C8 6.10457 8.89543 7 10 7H12C13.1046 7 14 6.10457 14 5M8 5C8 3.89543 8.89543 3 10 3H12C13.1046 3 14 3.89543 14 5M14 5H16C17.1046 5 18 5.89543 18 7V11M20 14H10M10 14L13 11M10 14L13 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p>选择一个模板查看内容</p>
      </div>
    `;
    elements.templateEditContent.value = '';
    elements.copyBtn.disabled = true;
    return;
  }
  
  elements.templateContent.innerHTML = `<pre>${template.content}</pre>`;
  elements.templateEditContent.value = template.content;
  elements.copyBtn.disabled = false;
}

// 更新设置
function updateSettings() {
  elements.autoStartSwitch.checked = settings.autoStart || false;
  elements.hotkeyInput.value = settings.hotkey || '未设置';
}

// 注册事件监听器
function registerEventListeners() {
  // 窗口控制
  elements.minimizeBtn.addEventListener('click', () => window.api.minimizeWindow());
  elements.closeBtn.addEventListener('click', () => window.api.hideWindow());
  
  // 分类列表
  elements.categoryList.addEventListener('click', e => {
    const item = e.target.closest('.category-list-item');
    if (!item || item.classList.contains('category-list-item-empty')) return;
    
    selectedCategoryId = item.dataset.id;
    selectedTemplateId = null;
    updateCategories();
    updateTemplates();
    updateTemplateContent();
  });
  
  // 模板列表
  elements.templateList.addEventListener('click', e => {
    const item = e.target.closest('.template-list-item');
    if (!item || item.classList.contains('template-list-item-empty')) return;
    
    if (isBatchSelectMode) {
      const checkbox = item.querySelector('.template-checkbox');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        if (checkbox.checked) {
          selectedTemplateIds.add(item.dataset.id);
        } else {
          selectedTemplateIds.delete(item.dataset.id);
        }
        elements.deleteBtn.disabled = selectedTemplateIds.size === 0;
      }
    } else {
      selectedTemplateId = item.dataset.id;
      updateTemplates();
      updateTemplateContent();
    }
  });
  
  // 模板编辑
  elements.saveTemplateEditBtn.addEventListener('click', async () => {
    if (!selectedTemplateId) return;
    
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;
    
    template.content = elements.templateEditContent.value;
    await window.api.updateTemplate(template);
    updateTemplateContent();
  });
  
  elements.copyBtn.addEventListener('click', async () => {
    if (!selectedTemplateId) return;
    
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;
    
    await window.api.copyToClipboard(template.content);
  });
  
  // 模态框
  elements.addTemplateBtn.addEventListener('click', () => showModal('templateModal'));
  elements.addCategoryBtn.addEventListener('click', () => showModal('categoryModal'));
  elements.settingsBtn.addEventListener('click', () => showModal('settingsModal'));
  
  // 批量选择
  elements.batchSelectBtn.addEventListener('click', () => {
    isBatchSelectMode = !isBatchSelectMode;
    selectedTemplateIds.clear();
    elements.batchSelectBtn.classList.toggle('active', isBatchSelectMode);
    elements.deleteBtn.disabled = true;
    updateTemplates();
  });
  
  // 删除
  elements.deleteBtn.addEventListener('click', async () => {
    if (selectedTemplateIds.size === 0) return;
    
    const confirmed = await showConfirmModal(
      '确认删除',
      `确定要删除选中的 ${selectedTemplateIds.size} 个模板吗？`
    );
    
    if (confirmed) {
      for (const id of selectedTemplateIds) {
        await window.api.deleteTemplate(id);
        templates = templates.filter(t => t.id !== id);
      }
      selectedTemplateIds.clear();
      isBatchSelectMode = false;
      elements.batchSelectBtn.classList.remove('active');
      elements.deleteBtn.disabled = true;
      updateTemplates();
      updateTemplateContent();
    }
  });
  
  // 表单提交
  elements.templateForm.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const template = {
      id: formData.get('templateId') || crypto.randomUUID(),
      title: formData.get('templateTitle'),
      categoryId: formData.get('templateCategory'),
      content: formData.get('templateContentInput')
    };
    
    if (formData.get('templateId')) {
      await window.api.updateTemplate(template);
      const index = templates.findIndex(t => t.id === template.id);
      if (index !== -1) templates[index] = template;
    } else {
      await window.api.addTemplate(template);
      templates.push(template);
    }
    
    hideModal('templateModal');
    updateTemplates();
  });
  
  elements.categoryForm.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const category = {
      id: crypto.randomUUID(),
      name: formData.get('categoryName')
    };
    
    await window.api.addCategory(category);
    categories.push(category);
    
    hideModal('categoryModal');
    updateCategories();
  });
  
  // 设置
  elements.autoStartSwitch.addEventListener('change', async e => {
    const enabled = e.target.checked;
    await window.api.setAutoStart(enabled);
    settings.autoStart = enabled;
  });
  
  elements.hotkeyInput.addEventListener('click', async () => {
    const hotkey = await window.api.registerHotkey();
    if (hotkey) {
      elements.hotkeyInput.value = hotkey;
      settings.hotkey = hotkey;
    } else {
      showModal('hotkeyConflictModal');
    }
  });
  
  // 文件导入
  elements.importDropzone.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopPropagation();
    elements.importDropzone.classList.add('dragover');
  });
  
  elements.importDropzone.addEventListener('dragleave', e => {
    e.preventDefault();
    e.stopPropagation();
    elements.importDropzone.classList.remove('dragover');
  });
  
  elements.importDropzone.addEventListener('drop', async e => {
    e.preventDefault();
    e.stopPropagation();
    elements.importDropzone.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      await importTemplates(file);
    }
  });
  
  elements.selectFileBtn.addEventListener('click', async () => {
    const file = await window.api.selectFile();
    if (file) {
      await importTemplates(file);
    }
  });
  
  // 模态框关闭
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) {
        hideModal(modal.id);
      }
    });
  });
}

// 显示模态框
function showModal(modalId) {
  elements.modalContainer.classList.remove('hidden');
  document.getElementById(modalId).classList.remove('hidden');
}

// 隐藏模态框
function hideModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  elements.modalContainer.classList.add('hidden');
}

// 显示确认模态框
function showConfirmModal(title, message) {
  return new Promise(resolve => {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const confirmBtn = document.getElementById('confirmBtn');
    const closeBtn = confirmBtn.nextElementSibling;
    
    const handleConfirm = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      closeBtn.removeEventListener('click', handleClose);
      hideModal('confirmModal');
      resolve(true);
    };
    
    const handleClose = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      closeBtn.removeEventListener('click', handleClose);
      hideModal('confirmModal');
      resolve(false);
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    closeBtn.addEventListener('click', handleClose);
    
    showModal('confirmModal');
  });
}

// 导入模板
async function importTemplates(file) {
  try {
    const content = await file.text();
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      throw new Error('无效的模板数据格式');
    }
    
    for (const template of data) {
      if (!template.title || !template.content) {
        continue;
      }
      
      const newTemplate = {
        id: crypto.randomUUID(),
        title: template.title,
        categoryId: template.categoryId || null,
        content: template.content
      };
      
      await window.api.addTemplate(newTemplate);
      templates.push(newTemplate);
    }
    
    updateTemplates();
  } catch (error) {
    console.error('导入模板失败:', error);
  }
}

// 辅助函数
function getTemplateCountByCategory(categoryId) {
  return templates.filter(t => t.categoryId === categoryId).length;
}

function getCategoryName(categoryId) {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : '未分类';
}

// 初始化应用
initApp(); 