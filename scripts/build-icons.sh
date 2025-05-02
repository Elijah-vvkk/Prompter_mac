#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 检查是否安装了必要的工具
if ! command -v convert &> /dev/null; then
    echo -e "${RED}错误: 未找到 ImageMagick，请先安装它${NC}"
    echo "在 macOS 上，您可以使用 Homebrew 安装:"
    echo "brew install imagemagick"
    exit 1
fi

# 创建构建目录
mkdir -p build

# 源文件路径
APP_ICON="src/assets/icon.svg"
TRAY_ICON="src/assets/tray.svg"
LOGO_ICON="src/assets/logo.svg"

# 生成不同尺寸的 PNG 图标
echo "正在生成应用图标..."
convert -background none -size 16x16 "$APP_ICON" "build/icon_16.png"
convert -background none -size 32x32 "$APP_ICON" "build/icon_32.png"
convert -background none -size 64x64 "$APP_ICON" "build/icon_64.png"
convert -background none -size 128x128 "$APP_ICON" "build/icon_128.png"
convert -background none -size 256x256 "$APP_ICON" "build/icon_256.png"
convert -background none -size 512x512 "$APP_ICON" "build/icon_512.png"
convert -background none -size 1024x1024 "$APP_ICON" "build/icon_1024.png"

# 生成 ICNS 文件
echo "正在生成 ICNS 文件..."
mkdir -p build/icon.iconset
cp "build/icon_16.png" "build/icon.iconset/icon_16x16.png"
cp "build/icon_32.png" "build/icon.iconset/icon_16x16@2x.png"
cp "build/icon_32.png" "build/icon.iconset/icon_32x32.png"
cp "build/icon_64.png" "build/icon.iconset/icon_32x32@2x.png"
cp "build/icon_128.png" "build/icon.iconset/icon_128x128.png"
cp "build/icon_256.png" "build/icon.iconset/icon_128x128@2x.png"
cp "build/icon_256.png" "build/icon.iconset/icon_256x256.png"
cp "build/icon_512.png" "build/icon.iconset/icon_256x256@2x.png"
cp "build/icon_512.png" "build/icon.iconset/icon_512x512.png"
cp "build/icon_1024.png" "build/icon.iconset/icon_512x512@2x.png"

iconutil -c icns "build/icon.iconset" -o "build/icon.icns"
rm -rf "build/icon.iconset"

# 生成托盘图标
echo "正在生成托盘图标..."
convert -background none -size 16x16 "$TRAY_ICON" "build/tray.png"
convert -background none -size 32x32 "$TRAY_ICON" "build/tray@2x.png"

# 复制 logo 文件
echo "正在复制 logo 文件..."
cp "$LOGO_ICON" "build/logo.svg"
cp "src/assets/logo.png" "build/logo.png"
cp "src/assets/logo.ico" "build/logo.ico"

echo -e "${GREEN}图标生成完成！${NC}"
echo "生成的文件位于 build 目录中："
echo "- icon.icns: macOS 应用图标"
echo "- tray.png: 托盘图标"
echo "- tray@2x.png: 高分辨率托盘图标"
echo "- logo.svg: Logo SVG 文件"
echo "- logo.png: Logo PNG 文件"
echo "- logo.ico: Logo ICO 文件" 