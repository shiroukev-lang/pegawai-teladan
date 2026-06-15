@echo off
REM =====================================================
REM Quick Start Script untuk Aplikasi Pegawai Teladan
REM Windows Batch Version
REM =====================================================

echo.
echo ============================================================
echo      APLIKASI PEGAWAI TELADAN - INSPEKTORAT JENDERAL
echo ============================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker tidak ditemukan. Silakan install Docker Desktop.
    echo         Download: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose tidak ditemukan.
    pause
    exit /b 1
)

echo [OK] Docker dan Docker Compose terdeteksi
echo.

REM Navigate to local-setup directory
cd /d "%~dp0.."

echo [INFO] Working directory: %CD%
echo.

REM Create .env file if not exists
if not exist "server\.env" (
    echo [INFO] Membuat file .env dari template...
    copy "server\.env.example" "server\.env" >nul
    echo [OK] File .env dibuat
) else (
    echo [OK] File .env sudah ada
)

echo.
echo [INFO] Starting Docker containers...
echo.

REM Start Docker Compose
docker-compose up -d

REM Wait for services to be ready
echo.
echo [INFO] Menunggu services siap...
timeout /t 5 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo [ERROR] Gagal menjalankan services. Cek logs dengan: docker-compose logs
    pause
    exit /b 1
)

echo.
echo [OK] Services berhasil dijalankan!
echo.

REM Initialize database
echo [INFO] Menginisialisasi database...
curl -s -X POST http://localhost:3001/make-server-ea54a030/initialize >nul 2>&1

REM Health check
echo [INFO] Melakukan health check...
timeout /t 2 /nobreak >nul

curl -s http://localhost:3001/health | findstr "ok" >nul
if errorlevel 1 (
    echo [WARNING] Health check failed. Cek logs dengan: docker-compose logs
) else (
    echo [OK] Health check passed!
)

echo.
echo ============================================================
echo                  SETUP BERHASIL!
echo ============================================================
echo.
echo   API Server: http://localhost:3001
echo   Health Check: http://localhost:3001/health
echo   Database: localhost:5432
echo.
echo   Database Credentials:
echo   - User: tlhpuser
echo   - Password: tlhp123456
echo   - Database: tlhp_db
echo.
echo ============================================================
echo.
echo Baca README.md untuk panduan lebih lanjut
echo.
echo Perintah berguna:
echo   - Lihat logs: docker-compose logs -f
echo   - Stop services: docker-compose down
echo   - Restart: docker-compose restart
echo.
pause
