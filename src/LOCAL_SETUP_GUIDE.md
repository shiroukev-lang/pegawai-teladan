# 🏠 Local Setup Guide - PostgreSQL Version

Dokumentasi lengkap untuk menjalankan Aplikasi Pegawai Teladan dengan database PostgreSQL di local environment.

## 📁 Struktur Folder

```
local-setup/
├── database/
│   └── schema.sql              # Schema PostgreSQL lengkap dengan views & triggers
├── server/
│   ├── index.js                # Express.js API server
│   ├── package.json            # Dependencies
│   ├── Dockerfile              # Docker configuration untuk server
│   └── .env.example            # Template environment variables
├── scripts/
│   ├── quick-start.sh          # Auto setup untuk Linux/macOS
│   ├── quick-start.bat         # Auto setup untuk Windows
│   ├── init-sample-data.sql    # Sample data untuk testing (90 pegawai + 30 kandidat)
│   ├── backup.sh               # Database backup script
│   └── restore.sh              # Database restore script
├── docker-compose.yml          # Docker Compose configuration
├── README.md                   # Dokumentasi lengkap
├── QUICK_START.md              # Panduan quick start
└── INTEGRATION_GUIDE.md        # Panduan integrasi dengan frontend
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)

**Windows:**
```bash
cd local-setup
scripts\quick-start.bat
```

**Linux/macOS:**
```bash
cd local-setup
chmod +x scripts/quick-start.sh
./scripts/quick-start.sh
```

### Option 2: Manual Setup

```bash
# 1. Setup Database
psql -U postgres -c "CREATE USER tlhpuser WITH PASSWORD 'tlhp123456';"
psql -U postgres -c "CREATE DATABASE tlhp_db OWNER tlhpuser;"
psql -U tlhpuser -d tlhp_db -f database/schema.sql

# 2. Setup & Start Server
cd server
npm install
cp .env.example .env
npm start
```

## 🎯 Fitur Database

### Tables
- **app_config**: Konfigurasi aplikasi (current phase, daftar bagian)
- **pegawai**: Data pegawai dan status voting
- **kandidat**: Data kandidat (max 5 per bagian dengan trigger enforcement)
- **vote_phase1**: Voting tahap 1 (star rating 1-5 untuk 7 kriteria)
- **vote_phase2**: Voting tahap 2 (pilih 1 kandidat per kriteria)

### Views (Auto-computed)
- **view_phase1_results**: Agregasi hasil voting phase 1
- **view_phase1_winners**: Pemenang phase 1 per bagian (auto-calculated)
- **view_phase2_results**: Agregasi hasil voting phase 2

### Keamanan & Constraints
- ✅ Foreign key constraints untuk data integrity
- ✅ Unique constraints untuk NIP
- ✅ Check constraints untuk star rating (1-5)
- ✅ Trigger untuk max 5 kandidat per bagian
- ✅ Auto-update timestamp triggers
- ✅ Cascade delete untuk referential integrity

## 📊 API Endpoints

Base URL: `http://localhost:3001/make-server-ea54a030`

### Initialization
- `POST /initialize` - Initialize system

### Pegawai Management
- `POST /generate-link` - Generate unique link untuk pegawai
- `POST /validate` - Validasi link dan NIP
- `GET /pegawai` - Get all pegawai
- `PUT /pegawai/:nip` - Update pegawai
- `DELETE /pegawai/:nip` - Delete pegawai

### Kandidat Management
- `POST /kandidat` - Add kandidat
- `GET /kandidat` - Get all kandidat
- `GET /kandidat/:bagian` - Get kandidat by bagian
- `DELETE /kandidat/:bagian/:nip` - Delete kandidat

### Voting Phase 1
- `POST /vote/phase1` - Submit vote phase 1
- `GET /results/phase1` - Get results phase 1
- `GET /winners/phase1` - Get winners phase 1 (1 per bagian)

### Voting Phase 2
- `POST /vote/phase2` - Submit vote phase 2
- `GET /results/phase2` - Get results phase 2
- `GET /winner/final` - Get final winner

### Admin
- `GET /voting-status` - Get voting status
- `POST /phase` - Update current phase
- `GET /phase` - Get current phase
- `POST /reset` - Reset voting data

### Health Check
- `GET /health` - API health check

## 🔌 Frontend Integration

### 1. Install Helper
Buat file `/utils/api-config.ts`:

```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  prefix: import.meta.env.VITE_API_PREFIX || '/make-server-ea54a030',
};

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseURL}${API_CONFIG.prefix}${endpoint}`;
};

export const getHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
});
```

### 2. Environment Variables
Buat `.env.local` di root project:

```env
VITE_API_URL=http://localhost:3001
VITE_API_PREFIX=/make-server-ea54a030
```

### 3. Update API Calls

**Before (Supabase):**
```typescript
fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ea54a030/validate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify({ uniqueKey, nip })
});
```

**After (Local):**
```typescript
import { getApiUrl, getHeaders } from './utils/api-config';

fetch(getApiUrl('/validate'), {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify({ uniqueKey, nip })
});
```

## 🧪 Testing dengan Sample Data

```bash
# Docker
docker-compose exec postgres psql -U tlhpuser -d tlhp_db -f /app/scripts/init-sample-data.sql

# Manual
psql -U tlhpuser -d tlhp_db -f scripts/init-sample-data.sql
```

Sample data includes:
- ✅ 90 pegawai (15 per bagian)
- ✅ 30 kandidat (5 per bagian)
- ✅ Unique keys untuk testing

## 💾 Backup & Restore

### Backup
```bash
# Docker
chmod +x scripts/backup.sh
./scripts/backup.sh

# Manual
pg_dump -U tlhpuser tlhp_db > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
# Docker
chmod +x scripts/restore.sh
./scripts/restore.sh backups/tlhp_backup_20241218_120000.sql

# Manual
psql -U tlhpuser -d tlhp_db < backup_20241218.sql
```

## 🛠️ Development Commands

### Docker
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Access database
docker-compose exec postgres psql -U tlhpuser -d tlhp_db

# Remove all data (HATI-HATI!)
docker-compose down -v
```

### Server (Manual)
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Initialize database
npm run init-db
```

## 🔍 Monitoring

### Database Statistics
```sql
-- Connect to database
psql -U tlhpuser -d tlhp_db

-- View table counts
SELECT 
  (SELECT COUNT(*) FROM pegawai) as total_pegawai,
  (SELECT COUNT(*) FROM kandidat) as total_kandidat,
  (SELECT COUNT(*) FROM vote_phase1) as total_votes_phase1,
  (SELECT COUNT(*) FROM vote_phase2) as total_votes_phase2;

-- View voting status per bagian
SELECT 
  bagian,
  COUNT(*) as total_pegawai,
  SUM(CASE WHEN has_voted_phase1 THEN 1 ELSE 0 END) as voted_phase1,
  SUM(CASE WHEN has_voted_phase2 THEN 1 ELSE 0 END) as voted_phase2
FROM pegawai
GROUP BY bagian;

-- View phase 1 results
SELECT * FROM view_phase1_results ORDER BY total_score DESC;

-- View phase 1 winners
SELECT * FROM view_phase1_winners;
```

## 📖 Dokumentasi

- **[README.md](local-setup/README.md)** - Dokumentasi lengkap dan troubleshooting
- **[QUICK_START.md](local-setup/QUICK_START.md)** - Panduan quick start
- **[INTEGRATION_GUIDE.md](local-setup/INTEGRATION_GUIDE.md)** - Integrasi dengan frontend

## ⚙️ Configuration

### Database Credentials (Default)
```
Host: localhost
Port: 5432
Database: tlhp_db
User: tlhpuser
Password: tlhp123456
```

### API Server (Default)
```
Port: 3001
Base URL: http://localhost:3001
API Prefix: /make-server-ea54a030
```

## 🔒 Security Notes

1. **Credentials**: Ubah password default untuk production
2. **CORS**: Sudah dikonfigurasi untuk `localhost:3000` dan `localhost:5173`
3. **Environment**: Jangan commit file `.env` ke git
4. **Production**: Setup SSL/TLS untuk production deployment

## 🚀 Production Deployment

### Menggunakan Docker
1. Update credentials di `docker-compose.yml`
2. Setup Nginx reverse proxy
3. Enable SSL with Let's Encrypt

### Manual Deployment
1. Setup PostgreSQL di server
2. Setup PM2 untuk process management
3. Configure Nginx/Apache
4. Setup firewall rules

Lihat README.md untuk detail deployment.

## 📞 Troubleshooting

### Port Already in Use
```bash
# Ubah port di server/.env
PORT=3002
```

### Database Connection Error
```bash
# Cek PostgreSQL status
docker-compose ps
# atau
sudo systemctl status postgresql
```

### CORS Error
Update `server/index.js` untuk menambah allowed origins.

### Reset Everything
```bash
docker-compose down -v
docker-compose up -d
```

## 📝 Changelog

### Version 1.0.0 (18 Desember 2024)
- ✅ Initial release
- ✅ PostgreSQL schema dengan views dan triggers
- ✅ Express.js API server kompatibel dengan Supabase
- ✅ Docker Compose setup
- ✅ Sample data scripts
- ✅ Backup & restore scripts
- ✅ Complete documentation

## 👥 Support

Untuk bantuan lebih lanjut:
1. Baca dokumentasi lengkap di `local-setup/README.md`
2. Check troubleshooting section
3. Review integration guide untuk frontend

---

**Dibuat oleh**: Tim Inspektorat Jenderal  
**Tanggal**: 18 Desember 2024  
**Versi**: 1.0.0  
**License**: ISC
