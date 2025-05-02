const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 设置颜色
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    reset: '\x1b[0m'
};

// 检查是否安装了必要的工具
try {
    execSync('convert --version', { stdio: 'ignore' });
} catch (error) {
    console.error(`${colors.red}错误: 未找到 ImageMagick，请先安装它${colors.reset}`);
    console.log('在 macOS 上，您可以使用 Homebrew 安装:');
    console.log('brew install imagemagick');
    process.exit(1);
}

// 创建构建目录
if (!fs.existsSync('build')) {
    fs.mkdirSync('build');
}

// 源文件路径
const APP_ICON = 'src/assets/icon.svg';
const TRAY_ICON = 'src/assets/tray.svg';
const LOGO_ICON = 'src/assets/logo.svg';

// 生成不同尺寸的 PNG 图标
console.log('正在生成应用图标...');
const sizes = [16, 32, 64, 128, 256, 512, 1024];
sizes.forEach(size => {
    execSync(`convert -background none -size ${size}x${size} "${APP_ICON}" "build/icon_${size}.png"`, { stdio: 'inherit' });
});

// 生成 ICNS 文件
console.log('正在生成 ICNS 文件...');
const iconsetDir = 'build/icon.iconset';
if (!fs.existsSync(iconsetDir)) {
    fs.mkdirSync(iconsetDir);
}

// 复制图标到 iconset 目录
const iconMappings = [
    ['icon_16.png', 'icon_16x16.png'],
    ['icon_32.png', 'icon_16x16@2x.png'],
    ['icon_32.png', 'icon_32x32.png'],
    ['icon_64.png', 'icon_32x32@2x.png'],
    ['icon_128.png', 'icon_128x128.png'],
    ['icon_256.png', 'icon_128x128@2x.png'],
    ['icon_256.png', 'icon_256x256.png'],
    ['icon_512.png', 'icon_256x256@2x.png'],
    ['icon_512.png', 'icon_512x512.png'],
    ['icon_1024.png', 'icon_512x512@2x.png']
];

iconMappings.forEach(([src, dest]) => {
    fs.copyFileSync(`build/${src}`, path.join(iconsetDir, dest));
});

// 生成 ICNS 文件
execSync(`iconutil -c icns "${iconsetDir}" -o "build/icon.icns"`, { stdio: 'inherit' });
fs.rmSync(iconsetDir, { recursive: true, force: true });

// 生成托盘图标
console.log('正在生成托盘图标...');
execSync(`convert -background none -size 16x16 "${TRAY_ICON}" "build/tray.png"`, { stdio: 'inherit' });
execSync(`convert -background none -size 32x32 "${TRAY_ICON}" "build/tray@2x.png"`, { stdio: 'inherit' });

// 复制 logo 文件
console.log('正在复制 logo 文件...');
fs.copyFileSync(LOGO_ICON, 'build/logo.svg');
fs.copyFileSync('src/assets/logo.png', 'build/logo.png');
fs.copyFileSync('src/assets/logo.ico', 'build/logo.ico');

console.log(`${colors.green}图标生成完成！${colors.reset}`);
console.log('生成的文件位于 build 目录中：');
console.log('- icon.icns: macOS 应用图标');
console.log('- tray.png: 托盘图标');
console.log('- tray@2x.png: 高分辨率托盘图标');
console.log('- logo.svg: Logo SVG 文件');
console.log('- logo.png: Logo PNG 文件');
console.log('- logo.ico: Logo ICO 文件'); 