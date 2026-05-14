@echo off
setlocal EnableDelayedExpansion
title HRS - Setup

echo ============================================
echo   Hotel Reservation System - Setup
echo ============================================
echo.

:: --- Check if Node.js is already installed ---
where node >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] Node.js znaleziony:
    node --version
    goto :install_deps
)

:: Try refreshing PATH from registry first (handles previously installed Node)
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SYS_PATH=%%b"
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USR_PATH=%%b"
set "PATH=!SYS_PATH!;!USR_PATH!"
where node >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] Node.js znaleziony po odswiезeniu PATH.
    node --version
    goto :install_deps
)

:: --- Install Node.js via winget ---
echo [INFO] Node.js nie jest zainstalowany. Instalowanie przez winget...
echo        (Windows zapyta o potwierdzenie - wybierz TAK)
echo.
winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [BLAD] Nie udalo sie zainstalowac Node.js automatycznie.
    echo        Zainstaluj recznie ze strony: https://nodejs.org/en/download
    echo        Nastepnie uruchom ten skrypt ponownie.
    pause
    exit /b 1
)

:: Refresh PATH after install
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SYS_PATH=%%b"
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USR_PATH=%%b"
set "PATH=!SYS_PATH!;!USR_PATH!"

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [UWAGA] Node.js zostal zainstalowany, ale wymaga nowej sesji.
    echo         Zamknij to okno i uruchom setup.bat ponownie.
    pause
    exit /b 0
)
echo [OK] Node.js zainstalowany pomyslnie.
node --version

:: --- Install backend dependencies ---
:install_deps
echo.
echo [INFO] Instalowanie zaleznosci backendu (express, sqlite, cors)...
pushd "%~dp0backend"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [BLAD] npm install nie powiodl sie.
    popd
    pause
    exit /b 1
)
popd

echo.
echo ============================================
echo   Setup zakonczony pomyslnie!
echo   Uruchom start.bat, aby uruchomic aplikacje.
echo ============================================
echo.
pause
