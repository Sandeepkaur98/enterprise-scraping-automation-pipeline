@echo off
setlocal
cd /d "%~dp0backend"
if not exist ".venv\Scripts\python.exe" (
  echo Run setup_backend_windows.bat first.
  pause
  exit /b 1
)
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
pause
