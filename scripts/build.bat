@echo off
setlocal enabledelayedexpansion

:: 设置颜色
set "GREEN=[92m"
set "RED=[91m"
set "NC=[0m"

:: 检查是否安装了必要的工具
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo %RED%错误: 未找到 npm，请先安装 Node.js%NC%
    exit /b 1
)

:: 清理旧的构建文件
echo 正在清理旧文件...
if exist dist rmdir /s /q dist
if exist node_modules rmdir /s /q node_modules

:: 安装依赖
echo 正在安装依赖...
call npm install

:: 生成图标
echo 正在生成图标...
call npm run build-icons

:: 构建应用
echo 正在构建应用...
call npm run build

:: 检查构建结果
if exist dist (
    echo %GREEN%构建完成！%NC%
    echo 构建结果位于 dist 目录中：
    dir dist
) else (
    echo %RED%构建失败！%NC%
    exit /b 1
) 