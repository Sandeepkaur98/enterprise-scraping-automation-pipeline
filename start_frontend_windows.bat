@echo off
setlocal
cd /d "%~dp0frontend"
if not exist "node_modules" (
  echo Installing frontend dependencies...
  npm install
  if errorlevel 1 goto error
)
npm run dev
pause
exit /b 0
:error
echo Install Node.js 20+ and try again.
pause
exit /b 1
