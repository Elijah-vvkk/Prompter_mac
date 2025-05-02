# Prompter Mac 版本

这是一个基于 Electron 的 macOS 提示词管理应用。

## 功能特点

- 支持模板的增删改查
- 支持分类管理
- 支持快捷键呼出
- 支持开机自启动
- 支持暗色模式
- 支持模板导入导出
- 支持系统托盘

## 开发环境要求

- Node.js 16+
- npm 7+
- macOS 10.15+
- ImageMagick (用于构建图标)

## 安装依赖

```bash
npm install
```

## 开发

```bash
# 启动开发环境
npm start

# 构建图标
npm run build-icons        # 构建应用图标
npm run build-tray-icon    # 构建托盘图标
npm run build-all         # 构建所有图标

# 构建应用
npm run build
```

## 构建

```bash
# 使用构建脚本（推荐）
bash scripts/build.sh

# 或手动构建
npm run build-all  # 构建所有图标
npm run build     # 构建应用
```

构建完成后，可以在 `dist` 目录下找到打包好的应用。

## 项目结构

```
Prompter_Mac/
├── src/
│   ├── main/           # 主进程代码
│   ├── renderer/       # 渲染进程代码
│   └── assets/         # 资源文件
├── build/              # 构建相关文件
├── scripts/            # 构建脚本
└── package.json        # 项目配置
```

## 许可证

MIT 