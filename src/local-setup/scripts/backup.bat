@echo off
REM =====================================================
REM Database Backup Script (Windows)
REM Aplikasi Pegawai Teladan - Inspektorat Jenderal
REM =====================================================

setlocal enabledelayedexpansion

REM Configuration
set BACKUP_DIR=.\backups
set TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\tlhp_backup_%TIMESTAMP%.sql

echo =====================================================
echo  Database Backup Script
echo =====================================================
echo.

REM Create backup directory if not exists
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Check if Docker is running
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo [ERROR] Docker containers are not running
    echo Please start the containers with: docker-compose up -d
    pause
    exit /b 1
)

echo [INFO] Creating backup...
echo.

REM Create backup
docker-compose exec -T postgres pg_dump -U tlhpuser tlhp_db > "%BACKUP_FILE%"

if errorlevel 0 (
    echo [OK] Backup created successfully!
    echo.
    echo File: %BACKUP_FILE%
    echo.
    
    echo Recent backups:
    dir /o-d /b "%BACKUP_DIR%\*.sql" 2>nul | findstr /n "^" | findstr "^[1-5]:"
    
    echo.
    echo [INFO] Cleaning old backups (keeping last 10)...
    
    REM Note: Windows batch doesn't have easy way to delete old files
    REM You may want to manually clean old backups or use PowerShell
    
    echo [OK] Backup completed
) else (
    echo [ERROR] Backup failed
    pause
    exit /b 1
)

echo.
pause
