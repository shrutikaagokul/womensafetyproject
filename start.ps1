# S.P.E.A.K. — Start both servers with one command
# Run from project root: .\start.ps1

Write-Host ""
Write-Host "==================================================" -ForegroundColor Magenta
Write-Host "  S.P.E.A.K. — Starting Backend + Frontend" -ForegroundColor Magenta
Write-Host "==================================================" -ForegroundColor Magenta
Write-Host ""

# Start Flask backend in a new window
Write-Host ">> Starting Flask backend on http://127.0.0.1:5000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python app.py"

# Give Flask a moment to start
Start-Sleep -Seconds 2

# Start Vite frontend in a new window
Write-Host ">> Starting Vite frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "Both servers are launching in separate windows." -ForegroundColor Yellow
Write-Host "Frontend  → http://localhost:5173"
Write-Host "Backend   → http://127.0.0.1:5000"
Write-Host ""
Write-Host "Close both windows to stop the servers." -ForegroundColor Gray
