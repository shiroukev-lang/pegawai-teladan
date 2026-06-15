# 🚀 Quick Start Guide

Panduan cepat untuk menjalankan aplikasi Pegawai Teladan di local environment.

## Pilihan 1: Docker (Paling Mudah) 🐳

### Windows

```bash
# 1. Buka Command Prompt atau PowerShell di folder local-setup
cd local-setup

# 2. Jalankan quick start script
scripts\quick-start.bat

# Selesai! Server akan berjalan di http://localhost:3001
```

### Linux / macOS

```bash
# 1. Buka Terminal di folder local-setup
cd local-setup

# 2. Berikan permission execute
chmod +x scripts/quick-start.sh

# 3. Jalankan quick start script
./scripts/quick-start.sh

# Selesai! Server akan berjalan di http://localhost:3001
```

## Pilihan 2: Manual Setup 💻

### Persyaratan
- Node.js v18+
- PostgreSQL 15+

### Langkah-langkah

```bash
# 1. Setup Database
psql -U postgres -c "CREATE USER tlhpuser WITH PASSWORD 'tlhp123456';"
psql -U postgres -c "CREATE DATABASE tlhp_db OWNER tlhpuser;"
psql -U tlhpuser -d tlhp_db -f database/schema.sql

# 2. Setup Server
cd server
npm install
cp .env.example .env

# 3. Start Server
npm start

# Server berjalan di http://localhost:3001
```

## Test API

```bash
# Health check
curl http://localhost:3001/health

# Initialize system
curl -X POST http://localhost:3001/make-server-ea54a030/initialize

# Cek current phase
curl http://localhost:3001/make-server-ea54a030/phase
```

## Menambahkan Sample Data (Opsional)

```bash
# Docker
docker-compose exec postgres psql -U tlhpuser -d tlhp_db -f /app/scripts/init-sample-data.sql

# Manual
psql -U tlhpuser -d tlhp_db -f scripts/init-sample-data.sql
```

## Stop Services

```bash
# Docker
docker-compose down

# Manual (Ctrl+C di terminal server)
```

## Troubleshooting

### Port sudah digunakan
```bash
# Ubah port di server/.env
PORT=3002
```

### Database connection error
```bash
# Cek apakah PostgreSQL running
docker-compose ps  # untuk Docker
# atau
sudo systemctl status postgresql  # untuk Linux
```

### Reset database
```bash
# Via API
curl -X POST http://localhost:3001/make-server-ea54a030/reset \
  -H "Content-Type: application/json" \
  -d '{"resetType": "all"}'
```

## Dokumentasi Lengkap

Baca [README.md](README.md) untuk dokumentasi lengkap.

---

**Support**: Baca troubleshooting di README.md  
**Version**: 1.0.0
