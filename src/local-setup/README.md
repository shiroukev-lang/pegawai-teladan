# Setup Database PostgreSQL Lokal - Aplikasi Pegawai Teladan

Panduan lengkap untuk menjalankan aplikasi Pegawai Teladan dengan database PostgreSQL di local development environment.

## 📋 Daftar Isi

1. [Prasyarat](#prasyarat)
2. [Instalasi dengan Docker](#instalasi-dengan-docker)
3. [Instalasi Manual](#instalasi-manual)
4. [Konfigurasi Frontend](#konfigurasi-frontend)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## 🔧 Prasyarat

### Instalasi dengan Docker (Recommended)
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included dengan Docker Desktop)

### Instalasi Manual
- Node.js v18+ ([Download](https://nodejs.org/))
- PostgreSQL 15+ ([Download](https://www.postgresql.org/download/))
- npm atau yarn

---

## 🐳 Instalasi dengan Docker

### Langkah 1: Persiapan

```bash
# Clone atau copy folder local-setup ke project Anda
cd local-setup

# Copy environment variables
cp server/.env.example server/.env
```

### Langkah 2: Start Services

```bash
# Build dan start semua services (PostgreSQL + API Server)
docker-compose up -d

# Cek logs untuk memastikan semua berjalan
docker-compose logs -f
```

Output yang diharapkan:
```
✅ Database connected successfully
✅ Server running on port 3001
```

### Langkah 3: Verifikasi

```bash
# Test database connection
docker-compose exec postgres psql -U tlhpuser -d tlhp_db -c "SELECT COUNT(*) FROM app_config;"

# Test API endpoint
curl http://localhost:3001/health
```

Response yang diharapkan:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Langkah 4: Stop Services

```bash
# Stop semua services
docker-compose down

# Stop dan hapus semua data (HATI-HATI!)
docker-compose down -v
```

---

## 💻 Instalasi Manual

### Langkah 1: Setup Database

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat user dan database
CREATE USER tlhpuser WITH PASSWORD 'tlhp123456';
CREATE DATABASE tlhp_db OWNER tlhpuser;
GRANT ALL PRIVILEGES ON DATABASE tlhp_db TO tlhpuser;

# Keluar dari psql
\q

# Import schema
psql -U tlhpuser -d tlhp_db -f database/schema.sql
```

### Langkah 2: Setup API Server

```bash
# Masuk ke folder server
cd server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env sesuai dengan konfigurasi database Anda
nano .env  # atau gunakan editor favorit Anda
```

File `.env`:
```env
DATABASE_URL=postgresql://tlhpuser:tlhp123456@localhost:5432/tlhp_db
NODE_ENV=development
PORT=3001
```

### Langkah 3: Start API Server

```bash
# Development mode (dengan auto-reload)
npm run dev

# Production mode
npm start
```

### Langkah 4: Verifikasi

```bash
# Test API endpoint
curl http://localhost:3001/health

# Test database query
curl http://localhost:3001/make-server-ea54a030/phase
```

---

## 🎨 Konfigurasi Frontend

### Untuk React + Vite

1. Copy file environment:
```bash
# Di root project frontend
cp local-setup/.env.local.example .env.local
```

2. Edit `.env.local`:
```env
VITE_API_URL=http://localhost:3001
VITE_API_PREFIX=/make-server-ea54a030
```

3. Update file konfigurasi API (jika ada):

Buat atau update file `/utils/api-config.ts`:
```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  prefix: import.meta.env.VITE_API_PREFIX || '/make-server-ea54a030',
};

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseURL}${API_CONFIG.prefix}${endpoint}`;
};
```

4. Update API calls untuk menggunakan local server:

Contoh di komponen yang memanggil API:
```typescript
// Sebelumnya (menggunakan Supabase)
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-ea54a030/validate`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({ uniqueKey, nip })
  }
);

// Sekarang (menggunakan local server)
import { getApiUrl } from './utils/api-config';

const response = await fetch(getApiUrl('/validate'), {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ uniqueKey, nip })
});
```

---

## 🧪 Testing

### 1. Test API Endpoints

```bash
# Initialize system
curl -X POST http://localhost:3001/make-server-ea54a030/initialize

# Generate link untuk pegawai
curl -X POST http://localhost:3001/make-server-ea54a030/generate-link \
  -H "Content-Type: application/json" \
  -d '{
    "nip": "199001012015011001",
    "nama": "Ahmad Santoso",
    "bagian": "Bagian Sekretariat"
  }'

# Tambah kandidat
curl -X POST http://localhost:3001/make-server-ea54a030/kandidat \
  -H "Content-Type: application/json" \
  -d '{
    "nip": "198501012010011001",
    "nama": "Rudi Hartono",
    "bagian": "Bagian Sekretariat"
  }'

# Get kandidat
curl http://localhost:3001/make-server-ea54a030/kandidat

# Check current phase
curl http://localhost:3001/make-server-ea54a030/phase
```

### 2. Test Database Directly

```bash
# Connect ke database
docker-compose exec postgres psql -U tlhpuser -d tlhp_db

# atau jika manual install
psql -U tlhpuser -d tlhp_db
```

SQL Queries untuk testing:
```sql
-- Lihat semua pegawai
SELECT * FROM pegawai;

-- Lihat semua kandidat
SELECT * FROM kandidat;

-- Lihat hasil voting phase 1
SELECT * FROM view_phase1_results;

-- Lihat pemenang phase 1
SELECT * FROM view_phase1_winners;

-- Lihat hasil voting phase 2
SELECT * FROM view_phase2_results;

-- Lihat voting status
SELECT 
  bagian,
  COUNT(*) as total_pegawai,
  SUM(CASE WHEN has_voted_phase1 THEN 1 ELSE 0 END) as voted_phase1,
  SUM(CASE WHEN has_voted_phase2 THEN 1 ELSE 0 END) as voted_phase2
FROM pegawai
GROUP BY bagian;
```

---

## 🔍 Troubleshooting

### Database Connection Error

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Cek apakah PostgreSQL running
docker-compose ps

# atau jika manual install
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Restart PostgreSQL
docker-compose restart postgres  # Docker
sudo systemctl restart postgresql  # Linux
brew services restart postgresql  # macOS
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Cari process yang menggunakan port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process tersebut
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Atau ubah port di .env
PORT=3002
```

### Schema Import Error

**Problem:** Error saat import schema.sql

**Solution:**
```bash
# Drop database dan buat ulang
psql -U postgres -c "DROP DATABASE IF EXISTS tlhp_db;"
psql -U postgres -c "CREATE DATABASE tlhp_db OWNER tlhpuser;"
psql -U tlhpuser -d tlhp_db -f database/schema.sql
```

### CORS Error

**Problem:** CORS error di browser

**Solution:**
Update file `server/index.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

---

## 🛠️ Maintenance

### Backup Database

```bash
# Docker
docker-compose exec postgres pg_dump -U tlhpuser tlhp_db > backup_$(date +%Y%m%d).sql

# Manual
pg_dump -U tlhpuser tlhp_db > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
# Docker
docker-compose exec -T postgres psql -U tlhpuser tlhp_db < backup_20241218.sql

# Manual
psql -U tlhpuser -d tlhp_db < backup_20241218.sql
```

### Reset Database

```bash
# Via API (recommended)
curl -X POST http://localhost:3001/make-server-ea54a030/reset \
  -H "Content-Type: application/json" \
  -d '{"resetType": "all"}'

# Via SQL (hati-hati!)
psql -U tlhpuser -d tlhp_db -c "
  DELETE FROM vote_phase2;
  DELETE FROM vote_phase1;
  DELETE FROM pegawai;
  DELETE FROM kandidat;
  UPDATE app_config SET value = '1' WHERE key = 'current_phase';
"
```

### View Logs

```bash
# Docker - API logs
docker-compose logs -f api

# Docker - Database logs
docker-compose logs -f postgres

# Manual - PM2 (jika menggunakan PM2)
pm2 logs

# Manual - Node.js logs
# Logs akan muncul di terminal tempat Anda menjalankan npm start
```

### Monitor Database Performance

```bash
# Connect ke database
psql -U tlhpuser -d tlhp_db

# Lihat active connections
SELECT * FROM pg_stat_activity;

# Lihat table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Lihat query performance
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

---

## 📊 Database Schema Overview

### Tables

1. **app_config** - Konfigurasi aplikasi (current phase, bagian list)
2. **pegawai** - Data pegawai dan status voting
3. **kandidat** - Data kandidat pegawai teladan (max 5 per bagian)
4. **vote_phase1** - Voting tahap 1 (star rating per kriteria)
5. **vote_phase2** - Voting tahap 2 (pilih 1 kandidat per kriteria)

### Views

1. **view_phase1_results** - Hasil agregasi voting phase 1
2. **view_phase1_winners** - Pemenang phase 1 per bagian
3. **view_phase2_results** - Hasil agregasi voting phase 2

### Constraints & Triggers

- Max 5 kandidat per bagian (trigger)
- Unique NIP per pegawai dan kandidat
- Foreign key constraints untuk data integrity
- Auto-update timestamp (trigger)

---

## 🚀 Deployment ke Production

### Menggunakan Docker

1. Update `docker-compose.yml` untuk production:
```yaml
environment:
  NODE_ENV: production
  POSTGRES_PASSWORD: <strong-password-here>
```

2. Build dan deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Menggunakan Manual Setup

1. Setup PostgreSQL di server production
2. Import schema dan configure database
3. Setup PM2 untuk process management:
```bash
npm install -g pm2
pm2 start server/index.js --name tlhp-api
pm2 startup
pm2 save
```

4. Setup Nginx sebagai reverse proxy:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📞 Support

Jika mengalami masalah:

1. Cek logs di terminal/Docker
2. Verifikasi koneksi database dengan health check
3. Pastikan semua environment variables sudah di-set
4. Cek dokumentasi PostgreSQL dan Node.js

---

## 📝 Changelog

### Version 1.0.0 (18 Desember 2024)
- ✅ Initial release
- ✅ PostgreSQL schema dengan views dan triggers
- ✅ Express.js API server
- ✅ Docker Compose setup
- ✅ Complete documentation

---

**Dibuat oleh**: Tim Inspektorat Jenderal  
**Tanggal**: 18 Desember 2024  
**Versi**: 1.0.0
