@echo off
title Thu Hoi 220GB Dung Luong Ao Docker VHDX
chcp 65001 >nul

:: Kiem tra quyen Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [THONG BAO] Dang yeu cau quyen Administrator...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

color 0A
cls
echo ======================================================================
echo          TIEN TRINH THU HOI ~220GB DUNG LUONG DOCKER CHO O C
echo ======================================================================
echo.

echo [1/4] Dang tat Docker Desktop va WSL de giai phong file dia ao...
taskkill /F /IM "Docker Desktop.exe" >nul 2>&1
taskkill /F /IM "com.docker.backend.exe" >nul 2>&1
taskkill /F /IM "com.docker.build.exe" >nul 2>&1
wsl --shutdown
timeout /t 3 /nobreak >nul
echo       Da tat Docker va WSL xong.
echo.

echo [2/4] Kiem tra dung luong file docker_data.vhdx truoc khi nen:
powershell -NoProfile -Command "$f = 'C:\Users\Admin\AppData\Local\Docker\wsl\disk\docker_data.vhdx'; if (Test-Path $f) { $s = [math]::Round(((Get-Item $f).Length / 1GB), 2); Write-Host \"  -> Dung luong hien tai: $s GB\" -ForegroundColor Yellow } else { Write-Host '  -> Khong tim thay file vhdx!' -ForegroundColor Red }"
echo.

echo [3/4] Dang tien hanh COMPACT (Nen dia ao)...
echo       (Qua trinh nay mat khoang 1 den 2 phut, vui long cho den khi xong)
echo.

set "SCRIPT_FILE=%TEMP%\docker_diskpart_compact.txt"
echo select vdisk file="C:\Users\Admin\AppData\Local\Docker\wsl\disk\docker_data.vhdx" > "%SCRIPT_FILE%"
echo attach vdisk readonly >> "%SCRIPT_FILE%"
echo compact vdisk >> "%SCRIPT_FILE%"
echo detach vdisk >> "%SCRIPT_FILE%"

diskpart /s "%SCRIPT_FILE%"

del /f /q "%SCRIPT_FILE%" >nul 2>&1
echo.

echo [4/4] Kiem tra dung luong sau khi nen:
powershell -NoProfile -Command "$f = 'C:\Users\Admin\AppData\Local\Docker\wsl\disk\docker_data.vhdx'; if (Test-Path $f) { $s = [math]::Round(((Get-Item $f).Length / 1GB), 2); Write-Host \"  -> Dung luong file sau khi nen: $s GB\" -ForegroundColor Green }; $c = Get-CimInstance Win32_LogicalDisk -Filter \"DeviceID='C:'\"; $free = [math]::Round(($c.FreeSpace / 1GB), 2); Write-Host \"  -> Dung luong trong O C hien tai: $free GB\" -ForegroundColor Cyan"
echo.

echo [5/5] Dang khoi dong lai Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo.
echo ======================================================================
echo      HOAN TAT THU HOI DUNG LUONG CHO O C!
echo ======================================================================
echo Nhan phim bat ky de dong cua so nay...
pause >nul
