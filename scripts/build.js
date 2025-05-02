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
    execSync('npm --version', { stdio: 'ignore' });
} catch (error) {
    console.error(`${colors.red}错误: 未找到 npm，请先安装 Node.js${colors.reset}`);
    process.exit(1);
}

// 清理旧的构建文件
console.log('正在清理旧文件...');
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
}
if (fs.existsSync('node_modules')) {
    fs.rmSync('node_modules', { recursive: true, force: true });
}

// 安装依赖
console.log('正在安装依赖...');
execSync('npm install', { stdio: 'inherit' });

// 生成图标
console.log('正在生成图标...');
execSync('npm run build-icons', { stdio: 'inherit' });

// 构建应用
console.log('正在构建应用...');
execSync('electron-builder', { stdio: 'inherit' });

// 检查构建结果
if (fs.existsSync('dist')) {
    console.log(`${colors.green}构建完成！${colors.reset}`);
    console.log('构建结果位于 dist 目录中：');
    const files = fs.readdirSync('dist');
    files.forEach(file => {
        const stats = fs.statSync(path.join('dist', file));
        console.log(`${file} - ${stats.size} bytes`);
    });
} else {
    console.error(`${colors.red}构建失败！${colors.reset}`);
    process.exit(1);
} 