@echo off
setlocal
set "XMCL_E2E_APP_DATA=%~dp0.moss-local\appdata"
if not exist "%XMCL_E2E_APP_DATA%" mkdir "%XMCL_E2E_APP_DATA%"
if exist "%~dp0xmcl-electron-app\build\moss-release\0.72.0-moss.1\win-unpacked\MOSS X.exe" (
  start "MOSS X" /D "%~dp0xmcl-electron-app\build\moss-release\0.72.0-moss.1\win-unpacked" "%~dp0xmcl-electron-app\build\moss-release\0.72.0-moss.1\win-unpacked\MOSS X.exe"
  exit /b
)
if exist "%~dp0xmcl-electron-app\build\moss-flat\win-unpacked\MOSS X.exe" (
  start "MOSS X" /D "%~dp0xmcl-electron-app\build\moss-flat\win-unpacked" "%~dp0xmcl-electron-app\build\moss-flat\win-unpacked\MOSS X.exe"
  exit /b
)
if not exist "%~dp0xmcl-electron-app\dist\index.js" (
  echo Please build the project first. See README.Moss.md.
  pause
  exit /b 1
)
cd /d "%~dp0xmcl-electron-app\dist"
start "MOSS X" "..\node_modules\electron\dist\electron.exe" "%~dp0xmcl-electron-app\dist\index.js"
