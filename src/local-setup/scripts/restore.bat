@echo off
REM =====================================================
REM Database Restore Script (Windows)
REM Aplikasi Pegawai Teladan - Inspektorat Jenderal
REM =====================================================

setlocal enabledelayedexpansion

echo =====================================================
echo  Database Restore Script
echo =====================================================
echo.

REM Check if backup file is provided
if "%~1"=="" (
    echo Usage: %0 ^<backup_file.sql^>
    echo.
    echo Available backups:
    dir /o-d /b .\backups\*.sql 2>nul | findstr /n "^" | findstr "^[1-5]:"
    pause
    exit /b 1
)

set BACKUP_FILE=%~1

REM Check if backup file exists
if not exist "%BACKUP_FILE%" (
    echo [ERROR] Backup file not found: %BACKUP_FILE%
    pause
    exit /b 1
)

REM Check if Docker is running
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo [ERROR] Docker containers are not running
    echo Please start the containers with: docker-compose up -d
    pause
    exit /b 1
)

echo WARNING: This will replace all existing data!
echo Backup file: %BACKUP_FILE%
echo.
set /p CONFIRM="Are you sure you want to continue? (yes/no): "

if /i not "%CONFIRM%"=="yes" (
    echo Restore cancelled.
    pause
    exit /b 0
)

echo.
echo [INFO] Restoring database...
echo.

REM Drop and recreate database
echo [1/2] Dropping existing database...
docker-compose exec -T postgres psql -U tlhpuser -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'tlhp_db';" postgres >nul 2>&1
docker-compose exec -T postgres dropdb -U tlhpuser tlhp_db 2>nul
docker-compose exec -T postgres createdb -U tlhpuser tlhp_db

REM Restore from backup
echo [2/2] Restoring from backup...
docker-compose exec -T postgres psql -U tlhpuser tlhp_db < "%BACKUP_FILE%"

if errorlevel 0 (
    echo.
    echo [OK] Database restored successfully!
    echo.
    
    echo Database statistics:
    docker-compose exec -T postgres psql -U tlhpuser tlhp_db -c "SELECT 'Pegawai' as table_name, COUNT(*) as count FROM pegawai UNION ALL SELECT 'Kandidat', COUNT(*) FROM kandidat UNION ALL SELECT 'Vote Phase 1', COUNT(*) FROM vote_phase1 UNION ALL SELECT 'Vote Phase 2', COUNT(*) FROM vote_phase2;"
) else (
    echo [ERROR] Restore failed
    pause
    exit /b 1
)

echo.
pause
