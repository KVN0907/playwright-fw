@echo off
echo Checking and cleaning ports for Playwright UI...
echo.

echo 🔍 Checking port 3001 (Backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Found process %%a using port 3001, killing it...
    taskkill /PID %%a /F >nul 2>&1
)

echo 🔍 Checking port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Found process %%a using port 3000, killing it...
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo ✅ Ports cleared! You can now start the UI.
echo.
pause