@echo off
echo 🎯 Opening Enhanced Test Reports...
echo.

REM Detect environment from NODE_ENV or default to qa
set ENV=%NODE_ENV%
if "%ENV%"=="" set ENV=qa

echo 🌍 Environment: %ENV%
echo.

REM Check if environment-specific enhanced report exists
if exist "test-results\%ENV%\enhanced-report\index.html" (
    echo 📊 Opening Enhanced HTML Report for %ENV%...
    start "" "test-results\%ENV%\enhanced-report\index.html"
) else (
    echo ❌ Enhanced HTML report not found for %ENV%
)

REM Check if enhanced report exists (fallback)
if exist "test-results\reports\enhanced-report.html" (
    echo 📊 Opening Fallback Enhanced HTML Report...
    start "" "test-results\reports\enhanced-report.html"
) else (
    echo ℹ️  Fallback Enhanced report not found
)

REM Check if Playwright HTML report exists
if exist "playwright-report\index.html" (
    echo 🎭 Opening Playwright HTML Report...
    start "" "playwright-report\index.html"
) else (
    echo ℹ️  Playwright HTML report not found
)

echo.
echo ✅ All available reports opened!
echo 📋 Report locations:
echo    • Enhanced Report: test-results\%ENV%\enhanced-report\index.html
echo    • Playwright Report: playwright-report\index.html
echo    • Detailed JSON: test-results\reports\detailed-report.json
echo    • Trends Data: test-results\reports\trends.json
pause
