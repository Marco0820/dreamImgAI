# PowerShell script to fix the development environment

# 1. Force kill any running Node.js processes
Write-Host "Step 1: Terminating any running Node.js processes..."
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Stop-Process -Name "node" -Force
    Write-Host "Successfully terminated Node.js processes."
} else {
    Write-Host "No running Node.js processes found."
}

# 2. Remove node_modules and .next directories
Write-Host "`nStep 2: Removing 'node_modules' and '.next' directories..."
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "Removed 'node_modules' directory."
} else {
    Write-Host "'node_modules' directory not found."
}

if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Removed '.next' directory."
} else {
    Write-Host "'.next' directory not found."
}

# 3. Re-install dependencies using npm.cmd
Write-Host "`nStep 3: Re-installing dependencies with 'npm.cmd install'..."
npm.cmd install
if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully re-installed dependencies."
} else {
    Write-Host "Error occurred during dependency installation."
}


Write-Host "`nEnvironment cleanup and re-installation complete."
Write-Host "Please try running 'npm run dev' again." 