@echo off
echo 🎯 Opening Enhanced Test Reports...
echo.

REM Check if enhanced report exists
if exist "test-results\reports\enhanced-report.html" (
    echo 📊 Opening Enhanced HTML Report...
    start "" "test-results\reports\enhanced-report.html"
) else (
    echo ❌ Enhanced HTML report not found
)

REM Check if Playwright HTML report exists
if exist "playwright-report\index.html" (
    echo 🎭 Opening Playwright HTML Report...
    start "" "playwright-report\index.html"
) else (
    echo ❌ Playwright HTML report not found
)

REM Check if Allure results exist and generate report
if exist "allure-results" (
    echo 🔥 Generating and opening Allure Report...
    npx allure generate allure-results --clean -o allure-report
    if exist "allure-report\index.html" (
        start "" "allure-report\index.html"
    )
) else (
    echo ℹ️  Allure results not found - run tests to generate
)

echo.
echo ✅ All available reports opened!
echo 📋 Report locations:
echo    • Enhanced Report: test-results\reports\enhanced-report.html
echo    • Playwright Report: playwright-report\index.html
echo    • Allure Report: allure-report\index.html
echo    • Detailed JSON: test-results\reports\detailed-report.json
echo    • Trends Data: test-results\reports\trends.json
pause
