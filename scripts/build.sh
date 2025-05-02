#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 检查是否安装了必要的工具
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未找到 npm，请先安装 Node.js${NC}"
    exit 1
fi

# 清理旧的构建文件
rm -rf dist
rm -rf node_modules

# 安装依赖
echo "正在安装依赖..."
npm install

# 生成图标
echo "正在生成图标..."
npm run build-icons

# 构建应用
echo "正在构建应用..."
npm run build

# 检查构建结果
if [ -d "dist" ]; then
    echo -e "${GREEN}构建完成！${NC}"
    echo "构建结果位于 dist 目录中："
    ls -l dist
else
    echo -e "${RED}构建失败！${NC}"
    exit 1
fi 