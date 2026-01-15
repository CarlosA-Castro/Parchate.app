# Script para iniciar Parchate.app
Write-Host "🚀 Iniciando Parchate.app..." -ForegroundColor Cyan
Write-Host "📁 Directorio actual: C:\Users\user\Parchate.app" -ForegroundColor Yellow

# Verificar que existan los directorios
if (-not (Test-Path "backend")) {
    Write-Host "❌ No se encontró el directorio backend" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend")) {
    Write-Host "❌ No se encontró el directorio frontend" -ForegroundColor Red
    exit 1
}

# Verificar dependencias de backend
Write-Host "🔍 Verificando backend..." -ForegroundColor Yellow
cd "backend"
if (-not (Test-Path "requirements.txt")) {
    Write-Host "❌ No se encontró requirements.txt" -ForegroundColor Red
    exit 1
}

# Verificar si Python está instalado
try {
    python --version
} catch {
    Write-Host "❌ Python no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar dependencias de frontend
Write-Host "🔍 Verificando frontend..." -ForegroundColor Yellow
cd "..\frontend"
if (-not (Test-Path "package.json")) {
    Write-Host "❌ No se encontró package.json" -ForegroundColor Red
    exit 1
}

# Verificar si Node.js está instalado
try {
    node --version
} catch {
    Write-Host "❌ Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Instalar dependencias si no existen
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias de frontend..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "✅ Dependencias de frontend ya instaladas" -ForegroundColor Green
}

cd "..\backend"

# Instalar dependencias de Python si no están
if (-not (Test-Path "venv") -and -not (Test-Path "requirements_installed.txt")) {
    Write-Host "🐍 Creando entorno virtual..." -ForegroundColor Cyan
    python -m venv venv
    
    Write-Host "📦 Instalando dependencias de Python..." -ForegroundColor Cyan
    .\venv\Scripts\pip install -r requirements.txt
    Get-Date | Out-File -FilePath "requirements_installed.txt"
} else {
    Write-Host "✅ Dependencias de Python ya instaladas" -ForegroundColor Green
}

# Iniciar ambos servicios en ventanas separadas
Write-Host "🚀 Iniciando servicios..." -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Magenta
Write-Host "🎨 Frontend: http://localhost:3000" -ForegroundColor Magenta
Write-Host ""
Write-Host "📝 Para detener los servicios, presiona Ctrl+C en cada ventana" -ForegroundColor Yellow
Write-Host ""

# Iniciar backend
Start-Process powershell -ArgumentList "-NoExit -Command "cd 'C:\Users\user\Parchate.app\backend'; .\venv\Scripts\python app.py"" -WindowStyle Normal

# Esperar un momento para que el backend inicie
Start-Sleep -Seconds 3

# Iniciar frontend
Start-Process powershell -ArgumentList "-NoExit -Command "cd 'C:\Users\user\Parchate.app\frontend'; npm run dev"" -WindowStyle Normal

Write-Host "✅ Servicios iniciados. Abre http://localhost:3000 en tu navegador" -ForegroundColor Green
