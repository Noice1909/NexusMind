# NexusMind Quick Start Script
# This script helps you run both backend and frontend servers

Write-Host "🚀 NexusMind Quick Start" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ Error: backend\.env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create backend\.env with your Supabase credentials:" -ForegroundColor Yellow
    Write-Host "1. Copy backend\.env.example to backend\.env" -ForegroundColor Yellow
    Write-Host "2. Add your Supabase URL and API key" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Gray
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  copy .env.example .env" -ForegroundColor Gray
    Write-Host "  # Then edit .env with your credentials" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green
Write-Host ""

# Start backend in new window
Write-Host "🐍 Starting Python backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\python main.py"
Write-Host "   Backend will run at: http://localhost:8000" -ForegroundColor Gray
Write-Host "   API Docs at: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "⚛️  Starting React frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Write-Host "   Frontend will run at: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Notes:" -ForegroundColor Cyan
Write-Host "   - Two new PowerShell windows will open" -ForegroundColor Gray
Write-Host "   - Backend runs on port 8000" -ForegroundColor Gray
Write-Host "   - Frontend runs on port 5173" -ForegroundColor Gray
Write-Host "   - Close those windows to stop the servers" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
