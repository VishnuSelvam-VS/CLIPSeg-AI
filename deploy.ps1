# Deploy to Hugging Face Space
$spaceDir = "Clipseg-AI"

# 1. Check if Space exists
if (-not (Test-Path $spaceDir)) {
    Write-Host "Error: Directory $spaceDir not found. Please run the git clone command first." -ForegroundColor Red
    exit 1
}

# 2. Clean previous state
Write-Host "Cleaning up previous state..." -ForegroundColor Yellow
Set-Location $spaceDir
git reset --hard
git clean -fd
git pull
Set-Location ..

# 3. Smart Copy using Robocopy (Excludes venv, node_modules, etc automatically)
Write-Host "Syncing files to $spaceDir..." -ForegroundColor Cyan

# Backend (Exclude venv, __pycache__)
# /MIR = Mirror (copy new, delete deleted)
# /XD = Exclude Directories
# /NFL /NDL = No File/Dir Logging (quieter)
& robocopy "backend" "$spaceDir\backend" /MIR /XD "venv" "__pycache__" ".pytest_cache" "tests" /NFL /NDL

# Frontend (Exclude node_modules, dist)
& robocopy "frontend" "$spaceDir\frontend" /MIR /XD "node_modules" "dist" ".git" /NFL /NDL

# Root files
Copy-Item "Dockerfile" "$spaceDir\Dockerfile" -Force
if (Test-Path ".dockerignore") { Copy-Item ".dockerignore" "$spaceDir\.dockerignore" -Force }

# 4. Git Operations
Set-Location $spaceDir
Write-Host "Pushing to Hugging Face..." -ForegroundColor Green

git add .
git status
git commit -m "Deploy CLIPSeg App"

# Push with error handling
$push = git push 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] GIT PUSH FAILED!" -ForegroundColor Red
    Write-Host "Reason: Authentication failed." -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------"
    Write-Host "You need a Hugging Face Access Token to deploy."
    Write-Host "1. Go to: https://huggingface.co/settings/tokens"
    Write-Host "2. Create a new token (Role: WRITE)."
    Write-Host "3. Run this command in your terminal:" -ForegroundColor White
    Write-Host "   git remote set-url origin https://USER:TOKEN@huggingface.co/spaces/vishnuselvam/Clipseg-AI" -ForegroundColor Green
    Write-Host "   (Replace USER and TOKEN with your details)"
    Write-Host "-----------------------------------------------------"
}
else {
    Write-Host "`n[SUCCESS] Deployment pushed successfully!" -ForegroundColor Green
    Write-Host "Check your Space logs online."
}

Set-Location ..
