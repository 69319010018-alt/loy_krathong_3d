@echo off
chcp 65001 > nul
title เกมวันลอยกระทง 3D (Loy Krathong 3D)

:: Change to script directory
cd /d "%~dp0"

echo ==========================================================
echo 🌕 กำลังเปิดเกมวันลอยกระทง 3D (Loy Krathong 3D Experience)
echo ==========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] ตรวจพบ Node.js - เริ่มต้นเซิร์ฟเวอร์และเปิดบราวเซอร์ให้อัตโนมัติ...
    node server.js
    pause
    exit /b
)

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] ตรวจพบ Python - เริ่มต้นเซิร์ฟเวอร์และเปิดบราวเซอร์ให้อัตโนมัติ...
    python server.py --open
    pause
    exit /b
)

echo [แจ้งเตือน] กำลังเปิดผ่านเว็บบราวเซอร์...
start http://localhost:8080
pause
