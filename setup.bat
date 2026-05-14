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
    echo [OK] Node.js znaleziony po odswiezeniu PATH.
    node --version
    goto :install_deps
)

:: --- Find winget (AppX packages are not always in PATH in .bat context) ---
set "WINGET_EXE="
where winget >nul 2>&1 && set "WINGET_EXE=winget"
if not defined WINGET_EXE (
    if exist "%LOCALAPPDATA%\Microsoft\WindowsApps\winget.exe" (
        set "WINGET_EXE=%LOCALAPPDATA%\Microsoft\WindowsApps\winget.exe"
    )
)

if not defined WINGET_EXE (
    echo [INFO] winget niedostepny. Pobieranie Node.js przez PowerShell...
    goto :install_node_ps
)

:: --- Install Node.js via winget ---
echo [INFO] Node.js nie jest zainstalowany. Instalowanie przez winget...
echo.
"!WINGET_EXE!" install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] winget zwrocil blad, probuje przez PowerShell...
    goto :install_node_ps
)
goto :refresh_path_after_install

:: --- Fallback: install Node.js via PowerShell (direct download) ---
:install_node_ps
echo [INFO] Pobieranie instalatora Node.js LTS...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$url = 'https://nodejs.org/dist/v22.15.0/node-v22.15.0-x64.msi';" ^
  "$out = \"$env:TEMP\nodejs-installer.msi\";" ^
  "Write-Host 'Pobieranie...';" ^
  "Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing;" ^
  "Write-Host 'Instalowanie (moze potrwac chwile)...';" ^
  "Start-Process msiexec.exe -ArgumentList '/i',$out,'/qn','/norestart','ADDLOCAL=ALL' -Wait -Verb RunAs;" ^
  "Remove-Item $out -Force"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [BLAD] Nie udalo sie zainstalowac Node.js automatycznie.
    echo        Zainstaluj recznie ze strony: https://nodejs.org/en/download
    echo        Nastepnie uruchom ten skrypt ponownie.
    pause
    exit /b 1
)

:refresh_path_after_install
:: Refresh PATH after install
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SYS_PATH=%%b"
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USR_PATH=%%b"
set "PATH=!SYS_PATH!;!USR_PATH!"

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [UWAGA] Node.js zostal zainstalowany, ale wymaga nowej sesji terminala.
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
