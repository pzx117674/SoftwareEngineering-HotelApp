@echo off
title Hotel Reservation System

echo ============================================
echo   Hotel Reservation System
echo ============================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [BLAD] Node.js nie jest zainstalowany.
    echo        Uruchom najpierw setup.bat
    pause
    exit /b 1
)

if not exist "%~dp0backend\node_modules" (
    echo [BLAD] Brakuje zaleznosci backendu.
    echo        Uruchom najpierw setup.bat
    pause
    exit /b 1
)

echo   Adres aplikacji: http://localhost:3001
echo   Zatrzymaj serwer: Ctrl+C
echo.

:: Open browser after 2 seconds
start "" /B cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3001"

node "%~dp0backend\src\index.js"
pause
