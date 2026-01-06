Write-Host "Starting CLIPSeg AI Application..." -ForegroundColor Cyan

$rootPath = Get-Location
$backendPath = Join-Path $rootPath "backend"

# --- Backend ---
Write-Host "Setting up Backend..." -ForegroundColor Yellow
Set-Location $backendPath

# Check for venv (prioritize venv311 in root for GPU support)
$paramVenv = "venv"
if (Test-Path "..\venv311") {
    $paramVenv = "..\venv311"
    Write-Host "Found GPU-enabled environment (venv311) in root..." -ForegroundColor Green
} elseif (Test-Path "venv311") {
    $paramVenv = "venv311"
    Write-Host "Found GPU-enabled environment (venv311) in backend..." -ForegroundColor Green
} elseif (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Install dependencies
$pipPath = ".\$paramVenv\Scripts\pip.exe"
if (Test-Path $pipPath) {
    Write-Host "Using $paramVenv..."
    # Skipping auto-install on every boot to save time, user should run setup manually for major updates
    # & $pipPath install -r requirements.txt 
} else {
    Write-Host "Error: pip not found in $paramVenv. Please check python installation." -ForegroundColor Red
}

# Start Backend Server in new window
Write-Host "Starting Backend Server..." -ForegroundColor Green
$backendCmd = "cd '$backendPath'; .\.`\$paramVenv\Scripts\Activate.ps1; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$backendCmd"


# --- Frontend ---
Write-Host "Setting up Frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $rootPath "frontend"
Set-Location $frontendPath

# Check for node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..."
    npm install
}

# Start Frontend Server in new window
Write-Host "Starting Frontend Server..." -ForegroundColor Green
$frontendCmd = "cd '$frontendPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$frontendCmd"

Set-Location $rootPath
Write-Host "Application started! Check the new windows." -ForegroundColor Cyan
