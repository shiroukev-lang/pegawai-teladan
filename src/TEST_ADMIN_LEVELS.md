# ✅ Checklist Testing - Sistem 2 Level Admin

## 🧪 Test Scenarios

### 1. Login Super Admin
- [ ] Buka `/admin`
- [ ] Masukkan password: `tlhpteladan123`
- [ ] Klik Login
- [ ] Verifikasi badge menampilkan: **🛡️ Super Admin**
- [ ] Verifikasi ada **6 tabs**: Overview, Pegawai, Kandidat, Hasil Tahap 1, Hasil Tahap 2, Settings

### 2. Login Admin Biasa
- [ ] Logout dari Super Admin
- [ ] Masukkan password: `adminteladan123`
- [ ] Klik Login
- [ ] Verifikasi badge menampilkan: **👤 Admin**
- [ ] Verifikasi ada **3 tabs** saja: Overview, Hasil Tahap 1, Hasil Tahap 2
- [ ] Verifikasi **TIDAK ADA** tab: Pegawai, Kandidat, Settings

### 3. Fungsi Super Admin
- [ ] Login sebagai Super Admin
- [ ] **Tab Pegawai:**
  - [ ] Bisa tambah pegawai baru
  - [ ] Bisa generate link voting
  - [ ] Bisa edit pegawai
  - [ ] Bisa hapus pegawai
- [ ] **Tab Kandidat:**
  - [ ] Bisa tambah kandidat
  - [ ] Bisa edit kandidat
  - [ ] Bisa hapus kandidat
- [ ] **Tab Settings:**
  - [ ] Bisa ubah phase
  - [ ] Bisa reset voting tahap 1
  - [ ] Bisa reset voting tahap 2
  - [ ] Bisa reset semua data

### 4. Fungsi Admin Biasa
- [ ] Login sebagai Admin
- [ ] **Tab Overview:**
  - [ ] Bisa lihat statistik
  - [ ] Bisa lihat total pegawai
  - [ ] Bisa lihat total kandidat
- [ ] **Tab Hasil Tahap 1:**
  - [ ] Bisa lihat grafik
  - [ ] Bisa lihat tabel hasil
  - [ ] Bisa export PDF/Excel
  - [ ] **TIDAK BISA** edit atau hapus data
- [ ] **Tab Hasil Tahap 2:**
  - [ ] Bisa lihat grafik
  - [ ] Bisa lihat tabel hasil
  - [ ] Bisa export PDF/Excel
  - [ ] **TIDAK BISA** edit atau hapus data

### 5. Session Management
- [ ] Login sebagai Super Admin
- [ ] Refresh halaman
- [ ] Verifikasi tetap login sebagai Super Admin
- [ ] Klik Logout
- [ ] Verifikasi kembali ke dialog password
- [ ] Login sebagai Admin
- [ ] Tutup browser
- [ ] Buka lagi `/admin`
- [ ] Verifikasi harus login ulang

### 6. Password Validation
- [ ] Masukkan password salah
- [ ] Verifikasi muncul error: "Password salah! Silakan coba lagi."
- [ ] Input password dikosongkan otomatis
- [ ] Masukkan password benar
- [ ] Verifikasi login berhasil

### 7. UI/UX
- [ ] Badge Super Admin berwarna biru (default)
- [ ] Badge Admin berwarna abu-abu (secondary)
- [ ] TabsList responsive di mobile
- [ ] Super Admin: 6 kolom di desktop, 3 kolom di mobile
- [ ] Admin: 3 kolom di semua ukuran layar
- [ ] Tombol Logout selalu visible di kanan atas

### 8. Security
- [ ] Admin tidak bisa akses tab Pegawai dengan URL langsung
- [ ] Admin tidak bisa akses tab Kandidat dengan URL langsung
- [ ] Admin tidak bisa akses tab Settings dengan URL langsung
- [ ] Logout menghapus session storage
- [ ] Session tidak persist setelah browser ditutup

---

## 🐛 Known Issues (Jika Ada)

_Belum ada issue yang diketahui._

---

## ✨ Expected Results

### Super Admin (tlhpteladan123):
```
✅ Tab Overview      → Visible & Accessible
✅ Tab Pegawai       → Visible & Accessible
✅ Tab Kandidat      → Visible & Accessible
✅ Tab Hasil Tahap 1 → Visible & Accessible
✅ Tab Hasil Tahap 2 → Visible & Accessible
✅ Tab Settings      → Visible & Accessible
```

### Admin (adminteladan123):
```
✅ Tab Overview      → Visible & Accessible
❌ Tab Pegawai       → HIDDEN
❌ Tab Kandidat      → HIDDEN
✅ Tab Hasil Tahap 1 → Visible & Accessible (Read-Only)
✅ Tab Hasil Tahap 2 → Visible & Accessible (Read-Only)
❌ Tab Settings      → HIDDEN
```

---

## 📊 Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| Super Admin Login | ⬜ Not Tested | |
| Admin Login | ⬜ Not Tested | |
| Tab Visibility (Super) | ⬜ Not Tested | |
| Tab Visibility (Admin) | ⬜ Not Tested | |
| CRUD Pegawai (Super) | ⬜ Not Tested | |
| CRUD Kandidat (Super) | ⬜ Not Tested | |
| Settings Access (Super) | ⬜ Not Tested | |
| Read-Only Access (Admin) | ⬜ Not Tested | |
| Session Persistence | ⬜ Not Tested | |
| Logout Function | ⬜ Not Tested | |

---

**Tester:** _____________________  
**Date:** _____________________  
**Environment:** Production / Staging / Development
