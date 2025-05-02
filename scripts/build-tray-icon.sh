#!/bin/bash

# 创建输出目录
mkdir -p src/assets

# 使用 ImageMagick 将 SVG 转换为 PNG
convert -background none -size 32x32 src/assets/tray.svg src/assets/tray.png
convert -background none -size 32x32 src/assets/tray.svg src/assets/tray@2x.png 