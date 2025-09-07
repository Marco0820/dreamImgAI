# DreamImg AI Frontend 启动脚本
Write-Host "正在启动 DreamImg AI 前端服务..." -ForegroundColor Green

# 检查Node.js是否安装
try {
    $nodeVersion = node --version 2>&1
    Write-Host "发现Node.js: $nodeVersion" -ForegroundColor Yellow
} catch {
    Write-Host "错误: 未找到Node.js。请先安装Node.js 18+。" -ForegroundColor Red
    exit 1
}

# 进入前端目录
Set-Location frontend

# 检查依赖是否已安装
if (-not (Test-Path "node_modules")) {
    Write-Host "安装Node.js依赖..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "检查依赖更新..." -ForegroundColor Yellow
    npm install
}

# 检查环境变量配置
Write-Host "检查环境配置..." -ForegroundColor Yellow

# 启动开发服务器
Write-Host ""
Write-Host "🚀 启动Next.js开发服务器..." -ForegroundColor Green
Write-Host "前端地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "请确保后端服务器已在 http://127.0.0.1:8000 运行" -ForegroundColor Yellow
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

npm run dev
