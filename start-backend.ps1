# DreamImg AI Backend 启动脚本
Write-Host "正在启动 DreamImg AI 后端服务..." -ForegroundColor Green

# 检查Python是否安装
try {
    $pythonVersion = python --version 2>&1
    Write-Host "发现Python: $pythonVersion" -ForegroundColor Yellow
} catch {
    Write-Host "错误: 未找到Python。请先安装Python 3.8+。" -ForegroundColor Red
    exit 1
}

# 进入后端目录
Set-Location backend

# 检查.env文件
if (-not (Test-Path ".env")) {
    Write-Host "警告: 未找到.env文件。请复制.env.example并配置API密钥。" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "已创建.env文件，请编辑并添加您的API密钥。" -ForegroundColor Yellow
    }
}

# 检查虚拟环境
if (-not (Test-Path ".venv")) {
    Write-Host "创建Python虚拟环境..." -ForegroundColor Yellow
    python -m venv .venv
}

# 激活虚拟环境
Write-Host "激活虚拟环境..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# 安装依赖
Write-Host "安装Python依赖..." -ForegroundColor Yellow
pip install -r requirements.txt

# 检查FIREWORKS_API_KEY
$env:PYTHONPATH = (Get-Location).Path
$apiKeyCheck = python -c "from app.core.config import settings; print('OK' if settings.FIREWORKS_API_KEY and settings.FIREWORKS_API_KEY != 'your_fireworks_api_key_here' else 'MISSING')" 2>$null

if ($apiKeyCheck -eq "MISSING") {
    Write-Host ""
    Write-Host "⚠️  重要提示: FIREWORKS_API_KEY 未正确配置!" -ForegroundColor Red
    Write-Host "请按以下步骤配置:" -ForegroundColor Yellow
    Write-Host "1. 访问 https://fireworks.ai/ 注册账户" -ForegroundColor Cyan
    Write-Host "2. 获取API密钥" -ForegroundColor Cyan
    Write-Host "3. 编辑 backend\.env 文件" -ForegroundColor Cyan
    Write-Host "4. 设置 FIREWORKS_API_KEY=你的真实API密钥" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "不配置API密钥将无法生成图像。是否继续启动服务器? (y/N)" -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "已取消启动。请配置API密钥后重试。" -ForegroundColor Red
        exit 1
    }
}

# 启动服务器
Write-Host ""
Write-Host "🚀 启动FastAPI服务器..." -ForegroundColor Green
Write-Host "服务器地址: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "API文档: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
