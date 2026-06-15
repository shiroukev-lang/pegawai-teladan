# 🔌 Integration Guide - Frontend Integration

Panduan untuk mengintegrasikan frontend aplikasi dengan PostgreSQL local server.

## 📋 Overview

Aplikasi awalnya menggunakan Supabase Edge Functions. Sekarang kita akan mengubahnya untuk menggunakan local PostgreSQL server.

## 🔄 Perubahan yang Diperlukan

### 1. Environment Variables

Buat file `.env.local` di root project frontend:

```env
# Local Development
VITE_API_URL=http://localhost:3001
VITE_API_PREFIX=/make-server-ea54a030

# Tidak perlu credentials Supabase
# SUPABASE_URL dan SUPABASE_ANON_KEY tidak diperlukan untuk local
```

### 2. API Configuration Helper

Buat file `/utils/api-config.ts`:

```typescript
// utils/api-config.ts

export const API_CONFIG = {
  // Untuk local development
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  prefix: import.meta.env.VITE_API_PREFIX || '/make-server-ea54a030',
  
  // Untuk production (masih menggunakan Supabase)
  useLocal: import.meta.env.MODE === 'development',
};

export const getApiUrl = (endpoint: string): string => {
  if (API_CONFIG.useLocal) {
    return `${API_CONFIG.baseURL}${API_CONFIG.prefix}${endpoint}`;
  }
  
  // Production URL (Supabase)
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  return `https://${projectId}.supabase.co/functions/v1${API_CONFIG.prefix}${endpoint}`;
};

export const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Untuk production, tambahkan Authorization header
  if (!API_CONFIG.useLocal) {
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (anonKey) {
      headers['Authorization'] = `Bearer ${anonKey}`;
    }
  }

  return headers;
};
```

### 3. Update API Calls

#### Sebelum (Supabase):

```typescript
// ValidationPage.tsx (contoh)
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
```

#### Sesudah (Local/Supabase):

```typescript
// ValidationPage.tsx
import { getApiUrl, getHeaders } from '../utils/api-config';

const response = await fetch(getApiUrl('/validate'), {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify({ uniqueKey, nip })
});
```

## 📝 Daftar File yang Perlu Diupdate

Berikut adalah daftar file yang perlu dimodifikasi:

### 1. ValidationPage.tsx

```typescript
import { getApiUrl, getHeaders } from '../utils/api-config';

// Update fetch calls:
// - /validate endpoint
// - /phase endpoint
```

### 2. Phase1Voting.tsx

```typescript
import { getApiUrl, getHeaders } from '../utils/api-config';

// Update fetch calls:
// - /kandidat/:bagian endpoint
// - /vote/phase1 endpoint
// - /phase endpoint
```

### 3. Phase1Results.tsx

```typescript
import { getApiUrl, getHeaders } from '../utils/api-config';

// Update fetch calls:
// - /kandidat endpoint
// - /results/phase1 endpoint
// - /winners/phase1 endpoint
// - /phase endpoint
```

### 4. Phase2Voting.tsx

```typescript
import { getApiUrl, getHeaders } from '../utils/api-config';

// Update fetch calls:
// - /winners/phase1 endpoint
// - /vote/phase2 endpoint
// - /phase endpoint
```

### 5. Phase2Results.tsx

```typescript
import { getApiUrl, getHeaders } from '../utils/api-config';

// Update fetch calls:
// - /winners/phase1 endpoint
// - /results/phase2 endpoint
// - /winner/final endpoint
// - /phase endpoint
```

### 6. AdminDashboard.tsx

```typescript
import { getApiUrl, getHeaders } from '../utils/api-config';

// Update fetch calls:
// - /initialize endpoint
// - /generate-link endpoint
// - /pegawai endpoint
// - /pegawai/:nip (PUT, DELETE) endpoint
// - /kandidat endpoint
// - /kandidat (POST) endpoint
// - /kandidat/:bagian/:nip (DELETE) endpoint
// - /voting-status endpoint
// - /results/phase1 endpoint
// - /results/phase2 endpoint
// - /phase (GET, POST) endpoint
// - /reset endpoint
```

## 🔧 Contoh Update Lengkap

### ValidationPage.tsx - Before & After

**Before:**
```typescript
const validateLink = async () => {
  setIsValidating(true);
  setError('');

  try {
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

    const data = await response.json();
    // ... rest of code
  } catch (err) {
    // ... error handling
  }
};
```

**After:**
```typescript
import { getApiUrl, getHeaders } from '../utils/api-config';

const validateLink = async () => {
  setIsValidating(true);
  setError('');

  try {
    const response = await fetch(getApiUrl('/validate'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ uniqueKey, nip })
    });

    const data = await response.json();
    // ... rest of code
  } catch (err) {
    // ... error handling
  }
};
```

## 🚀 Development Workflow

### 1. Start Local Server

```bash
cd local-setup
docker-compose up -d
```

### 2. Start Frontend

```bash
# Di root project
npm run dev
# atau
yarn dev
```

### 3. Testing

Frontend akan otomatis menggunakan local API server karena `MODE=development`.

## 🔄 Switching Between Local and Production

### Development (Local):
```bash
npm run dev  # Menggunakan local server
```

### Production Build:
```bash
npm run build  # Menggunakan Supabase production
```

Atau force local di production:
```env
# .env.local
VITE_FORCE_LOCAL=true
```

Lalu update `api-config.ts`:
```typescript
export const API_CONFIG = {
  useLocal: import.meta.env.VITE_FORCE_LOCAL === 'true' || 
            import.meta.env.MODE === 'development',
};
```

## 📊 API Response Format

Response format tetap sama seperti Supabase:

### Success Response:
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response:
```json
{
  "error": "Error message"
}
```

## ⚠️ Important Notes

1. **CORS**: Local server sudah dikonfigurasi untuk menerima request dari `localhost:3000` dan `localhost:5173`

2. **Authorization**: Local server tidak memerlukan Authorization header, tapi production (Supabase) masih memerlukan

3. **Environment Variables**: Jangan commit file `.env.local` ke git

4. **Database Reset**: Gunakan endpoint `/reset` untuk reset data development

5. **Sample Data**: Gunakan script `init-sample-data.sql` untuk testing dengan data lengkap

## 🧪 Testing Checklist

- [ ] Validasi link dan NIP berhasil
- [ ] Phase 1 voting berfungsi
- [ ] Phase 1 results menampilkan grafik
- [ ] Phase 2 voting berfungsi
- [ ] Phase 2 results menampilkan grafik
- [ ] Admin dashboard lengkap:
  - [ ] Generate link pegawai
  - [ ] Tambah/hapus kandidat
  - [ ] Lihat voting status
  - [ ] Export PDF/Excel
  - [ ] Change phase
  - [ ] Reset voting

## 🆘 Troubleshooting

### CORS Error

Jika muncul CORS error, update `server/index.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',  // Tambahkan port lain jika perlu
  ],
  credentials: true
}));
```

### Network Error

Pastikan local server running:

```bash
curl http://localhost:3001/health
```

### Data Tidak Muncul

Cek apakah database sudah diinisialisasi:

```bash
curl -X POST http://localhost:3001/make-server-ea54a030/initialize
```

---

**Questions?** Check README.md atau contact support.  
**Version**: 1.0.0
