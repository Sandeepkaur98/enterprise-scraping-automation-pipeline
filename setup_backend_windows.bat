@echo off
setlocal
cd /d "%~dp0backend"
echo [1/4] Creating Python virtual environment...
py -m venv .venv
if errorlevel 1 goto error
echo [2/4] Installing Python dependencies...
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r requirements.txt
if errorlevel 1 goto error
echo [3/4] Installing Playwright Chromium...
.venv\Scripts\python.exe -m playwright install chromium
if errorlevel 1 goto error
echo [4/4] Setup complete. Now run start_backend_windows.bat.
pause
exit /b 0
:error
echo Setup failed. Check that Python 3.11+ is installed and read the error above.
pause
exit /b 1
