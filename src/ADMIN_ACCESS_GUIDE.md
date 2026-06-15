# 📘 Panduan Akses Admin - Aplikasi Pegawai Teladan

## 🔐 Sistem 2 Level Admin

Aplikasi ini menggunakan sistem 2 level admin dengan hak akses yang berbeda:

---

## 👥 Level Admin

### 🛡️ **SUPER ADMIN**
**Password:** `tlhpteladan123`

**Hak Akses Penuh (6 Tab):**
1. ✅ **Overview** - Statistik dan ringkasan sistem
2. ✅ **Pegawai** - Kelola data pegawai & generate link voting
3. ✅ **Kandidat** - Kelola data kandidat pegawai teladan
4. ✅ **Hasil Tahap 1** - Lihat hasil voting tahap 1
5. ✅ **Hasil Tahap 2** - Lihat hasil voting tahap 2
6. ✅ **Settings** - Ubah phase voting & reset data

**Fitur Khusus Super Admin:**
- ➕ Tambah, edit, dan hapus pegawai
- 🔗 Generate link voting unik untuk pegawai
- 👤 Tambah, edit, dan hapus kandidat
- ⚙️ Ubah phase voting (Tahap 1 ↔ Tahap 2)
- 🗑️ Reset semua data voting
- 📊 Export data ke PDF/Excel

---

### 👤 **ADMIN**
**Password:** `adminteladan123`

**Hak Akses Terbatas (3 Tab):**
1. ✅ **Overview** - Statistik dan ringkasan sistem
2. ✅ **Hasil Tahap 1** - Lihat hasil voting tahap 1 (view only)
3. ✅ **Hasil Tahap 2** - Lihat hasil voting tahap 2 (view only)

**Fungsi Admin:**
- 📊 Melihat statistik sistem secara real-time
- 📈 Melihat grafik dan hasil voting kedua tahap
- 📄 Export hasil ke PDF/Excel
- ❌ **TIDAK BISA** mengelola pegawai
- ❌ **TIDAK BISA** mengelola kandidat
- ❌ **TIDAK BISA** mengubah settings atau reset data

---

## 🚀 Cara Login

### Akses Halaman Admin:
1. Buka URL: `/admin`
2. Dialog password akan muncul otomatis
3. Masukkan password sesuai level yang diinginkan:
   - Super Admin: `tlhpteladan123`
   - Admin: `adminteladan123`
4. Klik tombol **Login**

### Indikator Level:
Setelah login, akan muncul **badge** di pojok kanan atas:
- 🛡️ **Super Admin** - Badge biru untuk Super Admin
- 👤 **Admin** - Badge abu-abu untuk Admin

---

## 📋 Fitur per Tab

### 1. 📊 **Overview** (Semua Level)
- Total pegawai terdaftar
- Total kandidat per bagian
- Status phase voting saat ini
- Progress voting tahap 1 & 2
- Statistik partisipasi

### 2. 👥 **Pegawai** (Super Admin Only)
- Form tambah pegawai baru (NIP, Nama, Bagian)
- Generate link voting unik
- Daftar semua pegawai dengan link masing-masing
- Edit dan hapus data pegawai
- Copy link voting ke clipboard

### 3. 🌟 **Kandidat** (Super Admin Only)
- Form tambah kandidat (max 5 per bagian)
- Upload foto kandidat via URL
- Preview foto kandidat
- Edit informasi kandidat
- Hapus kandidat
- Daftar kandidat per bagian

### 4. 🏆 **Hasil Tahap 1** (Semua Level)
- Grafik perbandingan kandidat per bagian
- Radar chart untuk setiap kandidat
- Tabel detail penilaian
- Filter per bagian
- Export ke PDF/Excel

### 5. 👑 **Hasil Tahap 2** (Semua Level)
- Bar chart voting per kriteria
- Radar chart kandidat pemenang
- Tabel detail voting per kriteria
- Export hasil ke PDF/Excel

### 6. ⚙️ **Settings** (Super Admin Only)
- Ubah phase voting (1 atau 2)
- Reset voting tahap 1
- Reset voting tahap 2
- Reset semua data sistem
- Konfirmasi untuk setiap aksi reset

---

## 🔒 Keamanan

### Session Management:
- Session tersimpan di `sessionStorage`
- Auto-logout saat browser ditutup
- Tombol logout manual tersedia

### Data Protection:
- Tab yang tidak diizinkan tidak akan render sama sekali
- Admin biasa tidak bisa mengakses fitur management
- Password tersimpan di environment (tidak di database)

### Best Practices:
- 🔐 Jangan share password Super Admin
- 👤 Gunakan akun Admin untuk monitoring saja
- 🔄 Ganti password secara berkala (edit di `/components/AdminPasswordDialog.tsx`)
- 🚪 Selalu logout setelah selesai menggunakan

---

## 🛠️ Troubleshooting

### Lupa Password?
Edit file `/components/AdminPasswordDialog.tsx`:
```typescript
const SUPER_ADMIN_PASSWORD = 'tlhpteladan123'; // Ganti di sini
const ADMIN_PASSWORD = 'adminteladan123';      // Ganti di sini
```

### Tambah Level Admin Baru?
1. Edit `AdminLevel` type di `/components/AdminPasswordDialog.tsx`
2. Tambah password baru di `handleSubmit`
3. Update kondisional di `/components/AdminDashboard.tsx`

### Reset Session?
Klik tombol **Logout** atau clear browser storage:
```javascript
sessionStorage.clear();
```

---

## 📞 Kontak Support

Untuk pertanyaan atau masalah teknis:
- 📧 Email: support@inspektoratjenderal.gov.id
- 📱 WhatsApp: +62 xxx xxxx xxxx
- 🌐 Website: https://inspektoratjenderal.gov.id

---

**Dibuat untuk:** Inspektorat Jenderal  
**Versi:** 2.0 (dengan sistem 2-level admin)  
**Terakhir Update:** Desember 2024
