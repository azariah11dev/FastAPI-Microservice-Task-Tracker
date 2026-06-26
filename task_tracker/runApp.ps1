Write-Host "Starting TaskForge System..."

# -----------------------------
# Start Docker backend services
# -----------------------------
Write-Host "Starting Docker backend services..."

# Run docker compose in backend directory
$docker = Start-Process `
    -FilePath "docker" `
    -ArgumentList "compose", "up", "-d" `
    -WorkingDirectory ".\backend" `
    -NoNewWindow `
    -PassThru

Start-Sleep -Seconds 3

# -----------------------------
# Start FastAPI Backend
# -----------------------------
Write-Host "Starting FastAPI backend..."

$backend = Start-Process `
    -FilePath "uv" `
    -ArgumentList "run", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000" `
    -WorkingDirectory ".\backend\src" `
    -PassThru

Start-Sleep -Seconds 2

# -----------------------------
# Start Next.js Frontend
# -----------------------------
Write-Host "Starting Next.js frontend..."

$frontend = Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList "run", "dev" `
    -WorkingDirectory ".\frontend" `
    -PassThru

Start-Sleep -Seconds 3

Write-Host "Backend running at http://localhost:8000"
Write-Host "Frontend running at http://localhost:3000"
Write-Host "TaskForge System Ready."

# Automatically open browser
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Press CTRL+C to stop everything."

# Wait for both processes
Wait-Process -Id $backend.Id, $frontend.Id

Write-Host "Stopping TaskForge System..."
