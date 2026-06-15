# 📊 Database Schema Diagram

Dokumentasi visual struktur database Aplikasi Pegawai Teladan.

## 🗂️ Entity Relationship Diagram (ERD)

```
┌─────────────────────┐
│    app_config       │
├─────────────────────┤
│ key (PK)            │
│ value (JSONB)       │
│ created_at          │
│ updated_at          │
└─────────────────────┘

┌─────────────────────────────┐
│        pegawai              │
├─────────────────────────────┤
│ nip (PK)                    │
│ nama                        │
│ bagian                      │
│ unique_key (UNIQUE)         │
│ has_voted_phase1 (BOOLEAN)  │
│ has_voted_phase2 (BOOLEAN)  │
│ created_at                  │
│ updated_at                  │
└─────────────────────────────┘
       │ 1
       │
       │ 1:N
       ▼
┌─────────────────────────────┐         ┌─────────────────────────┐
│      vote_phase1            │    N:1  │      kandidat           │
├─────────────────────────────┤────────▶├─────────────────────────┤
│ id (PK)                     │         │ id (PK)                 │
│ nip (FK → pegawai)          │         │ nip (UNIQUE)            │
│ bagian                      │         │ nama                    │
│ kandidat_nip (FK → kandidat)│         │ bagian                  │
│ berorientasi_pelayanan (1-5)│         │ photo_url               │
│ akuntabel (1-5)             │         │ created_at              │
│ kompeten (1-5)              │         │ updated_at              │
│ harmonis (1-5)              │         └─────────────────────────┘
│ loyal (1-5)                 │                    ▲
│ adaptif (1-5)               │                    │
│ kolaboratif (1-5)           │                    │ N:1
│ created_at                  │                    │
└─────────────────────────────┘                    │
                                         ┌─────────────────────────────────┐
       │ 1                               │       vote_phase2               │
       │                                 ├─────────────────────────────────┤
       │ 1:1                             │ id (PK)                         │
       ▼                                 │ nip (FK → pegawai) (UNIQUE)     │
┌─────────────────────────────────┐     │ berorientasi_pelayanan (FK)     │───┐
│       vote_phase2               │     │ akuntabel (FK)                  │   │
├─────────────────────────────────┤     │ kompeten (FK)                   │   │
│ id (PK)                         │     │ harmonis (FK)                   │   │
│ nip (FK → pegawai) (UNIQUE)     │     │ loyal (FK)                      │   │
│ berorientasi_pelayanan (FK)     │     │ adaptif (FK)                    │   │
│ akuntabel (FK)                  │     │ kolaboratif (FK)                │   │
│ kompeten (FK)                   │     │ created_at                      │   │
│ harmonis (FK)                   │     └─────────────────────────────────┘   │
│ loyal (FK)                      │                                           │
│ adaptif (FK)                    │                                           │
│ kolaboratif (FK)                │                                           │
│ created_at                      │           All 7 FK point to kandidat ─────┘
└─────────────────────────────────┘
```

## 📋 Table Details

### 1. app_config
**Purpose**: Menyimpan konfigurasi aplikasi

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| key | VARCHAR(100) | PRIMARY KEY | Nama konfigurasi |
| value | JSONB | NOT NULL | Nilai konfigurasi dalam format JSON |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu pembuatan |
| updated_at | TIMESTAMP | DEFAULT NOW() | Waktu update terakhir |

**Default Data**:
- `current_phase`: "1" (1=Phase 1, 2=Phase 2, 3=Selesai)
- `initialized`: "true"
- `bagian`: Array 6 bagian

---

### 2. pegawai
**Purpose**: Menyimpan data pegawai yang terdaftar

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| nip | VARCHAR(50) | PRIMARY KEY | NIP pegawai (unique identifier) |
| nama | VARCHAR(200) | NOT NULL | Nama lengkap pegawai |
| bagian | VARCHAR(100) | NOT NULL | Bagian/unit kerja |
| unique_key | VARCHAR(100) | UNIQUE, NOT NULL | Key unik untuk link voting |
| has_voted_phase1 | BOOLEAN | DEFAULT FALSE | Status voting phase 1 |
| has_voted_phase2 | BOOLEAN | DEFAULT FALSE | Status voting phase 2 |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu registrasi |
| updated_at | TIMESTAMP | DEFAULT NOW() | Waktu update terakhir |

**Indexes**:
- `idx_pegawai_bagian` on (bagian)
- `idx_pegawai_unique_key` on (unique_key)
- `idx_pegawai_voting_status` on (has_voted_phase1, has_voted_phase2)

**Total Records**: ~90 pegawai (15 per bagian × 6 bagian)

---

### 3. kandidat
**Purpose**: Menyimpan data kandidat pegawai teladan

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment ID |
| nip | VARCHAR(50) | UNIQUE, NOT NULL | NIP kandidat |
| nama | VARCHAR(200) | NOT NULL | Nama lengkap kandidat |
| bagian | VARCHAR(100) | NOT NULL | Bagian asal kandidat |
| photo_url | TEXT | NULL | URL foto kandidat |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu penambahan |
| updated_at | TIMESTAMP | DEFAULT NOW() | Waktu update terakhir |

**Indexes**:
- `idx_kandidat_bagian` on (bagian)
- `idx_kandidat_nip` on (nip)

**Business Rules**:
- ✅ Max 5 kandidat per bagian (enforced by trigger)
- ✅ NIP harus unique
- ✅ Setiap bagian minimal memiliki kandidat untuk lanjut ke phase 2

**Total Records**: 30 kandidat (5 per bagian × 6 bagian)

---

### 4. vote_phase1
**Purpose**: Menyimpan voting tahap 1 (star rating per kriteria)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment ID |
| nip | VARCHAR(50) | FK → pegawai.nip | NIP voter |
| bagian | VARCHAR(100) | NOT NULL | Bagian voter |
| kandidat_nip | VARCHAR(50) | FK → kandidat.nip | NIP kandidat yang dinilai |
| berorientasi_pelayanan | INTEGER | CHECK (1-5) | Rating Berorientasi Pelayanan |
| akuntabel | INTEGER | CHECK (1-5) | Rating Akuntabel |
| kompeten | INTEGER | CHECK (1-5) | Rating Kompeten |
| harmonis | INTEGER | CHECK (1-5) | Rating Harmonis |
| loyal | INTEGER | CHECK (1-5) | Rating Loyal |
| adaptif | INTEGER | CHECK (1-5) | Rating Adaptif |
| kolaboratif | INTEGER | CHECK (1-5) | Rating Kolaboratif |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu voting |

**Indexes**:
- `idx_vote_phase1_nip` on (nip)
- `idx_vote_phase1_kandidat` on (kandidat_nip)
- `idx_vote_phase1_bagian` on (bagian)
- `idx_vote_phase1_kandidat_criteria` on (kandidat_nip, bagian)

**Constraints**:
- UNIQUE(nip, kandidat_nip) - Satu voter hanya bisa vote 1x untuk kandidat yang sama
- CASCADE DELETE on pegawai & kandidat

**Business Rules**:
- ✅ Setiap pegawai menilai 5 kandidat dari bagiannya
- ✅ Total 7 kriteria per kandidat
- ✅ Rating 1-5 stars per kriteria
- ✅ Total score = sum semua kriteria (max 35 per kandidat)

---

### 5. vote_phase2
**Purpose**: Menyimpan voting tahap 2 (pilih 1 kandidat per kriteria)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment ID |
| nip | VARCHAR(50) | FK → pegawai.nip, UNIQUE | NIP voter (1 vote per pegawai) |
| berorientasi_pelayanan | VARCHAR(50) | FK → kandidat.nip | Pilihan untuk kriteria ini |
| akuntabel | VARCHAR(50) | FK → kandidat.nip | Pilihan untuk kriteria ini |
| kompeten | VARCHAR(50) | FK → kandidat.nip | Pilihan untuk kriteria ini |
| harmonis | VARCHAR(50) | FK → kandidat.nip | Pilihan untuk kriteria ini |
| loyal | VARCHAR(50) | FK → kandidat.nip | Pilihan untuk kriteria ini |
| adaptif | VARCHAR(50) | FK → kandidat.nip | Pilihan untuk kriteria ini |
| kolaboratif | VARCHAR(50) | FK → kandidat.nip | Pilihan untuk kriteria ini |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu voting |

**Indexes**:
- `idx_vote_phase2_nip` on (nip)

**Constraints**:
- UNIQUE(nip) - Satu pegawai hanya bisa vote 1x
- CASCADE DELETE on pegawai
- 7 Foreign keys ke kandidat.nip

**Business Rules**:
- ✅ Setiap pegawai memilih 1 kandidat untuk setiap kriteria
- ✅ Total 7 pilihan per voter
- ✅ Pool kandidat = 6 pemenang dari phase 1
- ✅ Pemenang final = kandidat dengan total votes terbanyak

---

## 📈 Database Views

### 1. view_phase1_results
**Purpose**: Agregasi hasil voting phase 1 per kandidat

```sql
SELECT 
  k.nip,
  k.nama,
  k.bagian,
  k.photo_url,
  COUNT(DISTINCT v.nip) as total_voters,
  SUM(v.berorientasi_pelayanan) as total_berorientasi_pelayanan,
  SUM(v.akuntabel) as total_akuntabel,
  ...
  SUM(semua kriteria) as total_score
FROM kandidat k
LEFT JOIN vote_phase1 v ON k.nip = v.kandidat_nip
GROUP BY k.nip, k.nama, k.bagian, k.photo_url;
```

**Output**: Semua kandidat dengan total score dan breakdown per kriteria

---

### 2. view_phase1_winners
**Purpose**: Pemenang phase 1 (1 per bagian)

```sql
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY bagian ORDER BY total_score DESC) as rank
  FROM view_phase1_results
) WHERE rank = 1;
```

**Output**: 6 pemenang (1 per bagian) yang akan maju ke phase 2

---

### 3. view_phase2_results
**Purpose**: Agregasi hasil voting phase 2 per kandidat

```sql
SELECT 
  k.nip,
  k.nama,
  k.bagian,
  k.photo_url,
  SUM(CASE WHEN v.berorientasi_pelayanan = k.nip THEN 1 ELSE 0 END) as votes_berorientasi_pelayanan,
  ...
  SUM(semua votes) as total_votes
FROM kandidat k
LEFT JOIN vote_phase2 v ON k.nip IN (v.berorientasi_pelayanan, ...)
GROUP BY k.nip, k.nama, k.bagian, k.photo_url;
```

**Output**: Kandidat dengan breakdown votes per kriteria dan total votes

---

## 🔒 Triggers & Functions

### 1. check_max_kandidat_per_bagian()
**Purpose**: Enforce max 5 kandidat per bagian

```sql
CREATE TRIGGER trigger_check_max_kandidat
BEFORE INSERT ON kandidat
FOR EACH ROW
EXECUTE FUNCTION check_max_kandidat_per_bagian();
```

**Error**: Raises exception jika sudah ada 5 kandidat

---

### 2. update_updated_at_column()
**Purpose**: Auto-update timestamp

```sql
CREATE TRIGGER update_pegawai_updated_at
BEFORE UPDATE ON pegawai
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Applied to**: pegawai, kandidat, app_config tables

---

## 📊 Data Flow

### Phase 1 Flow:
```
1. Admin menambahkan kandidat (5 per bagian)
   ↓
2. Admin generate link untuk pegawai
   ↓
3. Pegawai mengakses link dengan validasi NIP
   ↓
4. Pegawai memberikan rating 1-5 untuk 7 kriteria pada 5 kandidat
   ↓
5. Data disimpan di vote_phase1
   ↓
6. System menghitung total score via view_phase1_results
   ↓
7. System menentukan pemenang per bagian via view_phase1_winners
   ↓
8. Admin mengubah phase ke 2
```

### Phase 2 Flow:
```
1. System menampilkan 6 kandidat (pemenang phase 1)
   ↓
2. Pegawai memilih 1 kandidat untuk setiap kriteria (7 kriteria)
   ↓
3. Data disimpan di vote_phase2
   ↓
4. System menghitung votes via view_phase2_results
   ↓
5. System menentukan pemenang final (kandidat dengan total votes terbanyak)
   ↓
6. Admin mengubah phase ke 3 (selesai)
```

---

## 🔍 Sample Queries

### Get Voting Progress:
```sql
SELECT 
  bagian,
  COUNT(*) as total_pegawai,
  SUM(CASE WHEN has_voted_phase1 THEN 1 ELSE 0 END) as voted_phase1,
  SUM(CASE WHEN has_voted_phase2 THEN 1 ELSE 0 END) as voted_phase2
FROM pegawai
GROUP BY bagian;
```

### Get Top 3 Candidates Phase 1:
```sql
SELECT * FROM view_phase1_results
ORDER BY total_score DESC
LIMIT 3;
```

### Get Final Winner:
```sql
SELECT * FROM view_phase2_results
ORDER BY total_votes DESC
LIMIT 1;
```

---

**Last Updated**: 18 Desember 2024  
**Database Version**: PostgreSQL 15  
**Schema Version**: 1.0.0
