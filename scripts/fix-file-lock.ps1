# Fix Next.js file lock issues on Windows
# This script helps resolve EBUSY errors when files are locked

Write-Host "🔧 Fixing Next.js file lock issues..." -ForegroundColor Cyan

# Step 1: Stop all Node processes
Write-Host "`n1. Stopping Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✓ Node processes stopped" -ForegroundColor Green

# Step 2: Wait a bit for file handles to release
Write-Host "`n2. Waiting for file handles to release..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Step 3: Clean .next directory
Write-Host "`n3. Cleaning .next directory..." -ForegroundColor Yellow
if (Test-Path .next) {
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host "   ✓ .next directory cleaned" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠ Could not fully clean .next (some files may be locked)" -ForegroundColor Yellow
        Write-Host "   💡 Try closing OneDrive or other file sync tools" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✓ .next directory doesn't exist" -ForegroundColor Green
}

# Step 4: Clean node_modules cache
Write-Host "`n4. Cleaning node_modules cache..." -ForegroundColor Yellow
if (Test-Path node_modules\.cache) {
    try {
        Remove-Item -Recurse -Force node_modules\.cache -ErrorAction Stop
        Write-Host "   ✓ Cache cleaned" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠ Could not clean cache (some files may be locked)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✓ Cache doesn't exist" -ForegroundColor Green
}

Write-Host "`n✅ Done! You can now restart the dev server with: npm run dev" -ForegroundColor Green
Write-Host "`n💡 If issues persist:" -ForegroundColor Cyan
Write-Host "   - Close OneDrive sync temporarily" -ForegroundColor White
Write-Host "   - Close any file explorers with the project folder open" -ForegroundColor White
Write-Host "   - Restart your computer if needed" -ForegroundColor White



