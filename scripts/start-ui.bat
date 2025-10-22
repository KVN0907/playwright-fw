@echo off
echo Starting Playwright Framework UI...
echo.

echo 📊 Backend API Server starting on http://localhost:3001
start "Backend" cmd /k "cd ui\server && npm run dev"

timeout /t 3 /nobreak > nul

echo 🌐 Frontend React App starting on http://localhost:3000  
start "Frontend" cmd /k "cd ui\client && npm start"

echo.
echo ✅ Both servers are starting...
echo 🔗 Access the UI at: http://localhost:3000
echo 📡 API Health Check: http://localhost:3001/api/health
echo.
echo Press any key to close...
pause > nul