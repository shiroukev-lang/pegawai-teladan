#!/bin/bash

# =====================================================
# Quick Start Script untuk Aplikasi Pegawai Teladan
# =====================================================

echo "🎖️  APLIKASI PEGAWAI TELADAN - INSPEKTORAT JENDERAL"
echo "=================================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker tidak ditemukan. Silakan install Docker terlebih dahulu."
    echo "   Download: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose tidak ditemukan. Silakan install Docker Compose."
    exit 1
fi

echo "✅ Docker dan Docker Compose terdeteksi"
echo ""

# Navigate to local-setup directory
cd "$(dirname "$0")/.."

echo "📂 Working directory: $(pwd)"
echo ""

# Create .env file if not exists
if [ ! -f "server/.env" ]; then
    echo "📝 Membuat file .env dari template..."
    cp server/.env.example server/.env
    echo "✅ File .env dibuat"
else
    echo "✅ File .env sudah ada"
fi

echo ""
echo "🐳 Starting Docker containers..."
echo ""

# Start Docker Compose
docker-compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Menunggu services siap..."
sleep 5

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Services berhasil dijalankan!"
    echo ""
    
    # Initialize database
    echo "📊 Menginisialisasi database..."
    curl -s -X POST http://localhost:3001/make-server-ea54a030/initialize > /dev/null
    
    # Health check
    echo "🏥 Melakukan health check..."
    sleep 2
    HEALTH=$(curl -s http://localhost:3001/health)
    
    if echo "$HEALTH" | grep -q "ok"; then
        echo "✅ Health check passed!"
        echo ""
        echo "╔═══════════════════════════════════════════════════╗"
        echo "║                                                   ║"
        echo "║  ✅ SETUP BERHASIL!                              ║"
        echo "║                                                   ║"
        echo "║  🌐 API Server: http://localhost:3001            ║"
        echo "║  📊 Health Check: http://localhost:3001/health   ║"
        echo "║  💾 Database: localhost:5432                     ║"
        echo "║                                                   ║"
        echo "║  Database Credentials:                           ║"
        echo "║  - User: tlhpuser                                ║"
        echo "║  - Password: tlhp123456                          ║"
        echo "║  - Database: tlhp_db                             ║"
        echo "║                                                   ║"
        echo "╚═══════════════════════════════════════════════════╝"
        echo ""
        echo "📖 Baca README.md untuk panduan lebih lanjut"
        echo ""
        echo "Perintah berguna:"
        echo "  - Lihat logs: docker-compose logs -f"
        echo "  - Stop services: docker-compose down"
        echo "  - Restart: docker-compose restart"
        echo ""
    else
        echo "⚠️  Health check failed. Cek logs dengan: docker-compose logs"
    fi
else
    echo "❌ Gagal menjalankan services. Cek logs dengan: docker-compose logs"
    exit 1
fi
