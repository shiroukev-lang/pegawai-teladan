# Petunjuk Penggunaan Aplikasi Pegawai Teladan

## Inspektorat Jenderal - Sistem Pemilihan Pegawai Teladan

---

## 📋 Daftar Isi
1. [Inisialisasi Sistem](#inisialisasi-sistem)
2. [Akses Admin](#akses-admin)
3. [Mengelola Kandidat](#mengelola-kandidat)
4. [Generate Link Voting](#generate-link-voting)
5. [Proses Voting](#proses-voting)
6. [Melihat Hasil](#melihat-hasil)
7. [Reset Data](#reset-data)

---

## 🚀 Inisialisasi Sistem

### Langkah Pertama (Hanya Sekali)
Sebelum menggunakan aplikasi, sistem perlu diinisialisasi:

1. Buka browser dan akses endpoint berikut:
   ```
   https://[PROJECT_ID].supabase.co/functions/v1/make-server-ea54a030/initialize
   ```

2. Gunakan method POST dengan tool seperti Postman atau curl:
   ```bash
   curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/make-server-ea54a030/initialize \
   -H "Authorization: Bearer [PUBLIC_ANON_KEY]"
   ```

3. Jika berhasil, sistem akan membalas:
   ```json
   {
     "success": true,
     "message": "Initialized successfully"
   }
   ```

---

## 👨‍💼 Akses Admin

### URL Admin Dashboard
```
https://[DOMAIN_ANDA]/admin
```

Dashboard admin tidak memerlukan password untuk demo, namun untuk production sebaiknya ditambahkan autentikasi.

### Fitur Dashboard Admin
- **Overview**: Statistik umum voting
- **Pegawai**: Kelola pegawai dan generate link
- **Kandidat**: Kelola kandidat per bagian (max 5)
- **Hasil**: Lihat hasil voting tahap 1 dan 2
- **Settings**: Ubah phase dan reset data

---

## 📝 Mengelola Kandidat

### Menambah Kandidat

1. Buka dashboard admin
2. Pilih tab **"Kandidat"**
3. Isi form:
   - **NIP**: Nomor Induk Pegawai
   - **Nama**: Nama lengkap kandidat
   - **Bagian**: Pilih salah satu dari 6 bagian
4. Klik **"Tambah Kandidat"**

**Catatan Penting:**
- Setiap bagian maksimal memiliki **5 kandidat**
- Kandidat untuk tahap 1 harus ditambahkan sebelum voting dimulai

### Menghapus Kandidat

1. Scroll ke bagian yang ingin dihapus kandidatnya
2. Klik icon **Trash** di samping nama kandidat
3. Konfirmasi penghapusan

---

## 🔗 Generate Link Voting

### Cara Generate Link untuk Pegawai

1. Buka dashboard admin
2. Pilih tab **"Pegawai"**
3. Isi form:
   - **NIP**: Nomor Induk Pegawai
   - **Nama**: Nama lengkap pegawai
   - **Bagian**: Bagian pegawai
4. Klik **"Generate Link Voting"**
5. Link unik akan muncul
6. **Copy link** dan kirim ke pegawai

### Format Link
```
https://[DOMAIN]/vote?key=voter_[NIP]_[UNIQUE_CODE]
```

**Contoh:**
```
https://yourapp.com/vote?key=voter_123456_abc789xyz
```

### Cara Pegawai Mengakses

1. Pegawai membuka link yang diterima
2. Masukkan **NIP** untuk validasi
3. Sistem akan redirect ke halaman voting sesuai phase aktif

---

## 🗳️ Proses Voting

### TAHAP 1: Voting Internal per Bagian

**Siapa yang voting:**
- Semua pegawai di bagian yang sama

**Apa yang dinilai:**
- 5 kandidat dari bagian mereka
- 7 kriteria per kandidat
- Rating 1-5 (star rating)

**Kriteria Penilaian:**
1. Berorientasi Pelayanan
2. Akuntabel
3. Kompeten
4. Harmonis
5. Loyal
6. Adaptif
7. Kolaboratif

**Total penilaian per pegawai:** 5 kandidat × 7 kriteria = 35 rating

**Hasil Tahap 1:**
- 1 pemenang per bagian (score tertinggi)
- Total 6 pemenang untuk tahap 2

### TAHAP 2: Voting Final

**Siapa yang voting:**
- Semua pegawai dari seluruh bagian

**Apa yang dinilai:**
- 6 kandidat pemenang tahap 1
- 7 kriteria

**Aturan Khusus:**
- Setiap kriteria: pilih **1 kandidat terbaik**
- Tidak boleh memilih kandidat yang sama untuk semua kriteria
- Total: 7 pilihan

**Contoh:**
- Kriteria "Akuntabel" → Pilih Kandidat A
- Kriteria "Kompeten" → Pilih Kandidat B
- dst...

**Hasil Tahap 2:**
- 1 Pegawai Teladan (votes terbanyak)

---

## 📊 Melihat Hasil

### Hasil Tahap 1

**Grafik Tersedia:**
1. **Line Chart**: Perbandingan semua kandidat
2. **Radar Chart**: Profil individual per kandidat

**Cara Akses:**
- Pegawai: Otomatis diarahkan setelah voting
- Admin: Tab "Hasil" di dashboard

### Hasil Tahap 2

**Grafik Tersedia:**
1. **Bar Chart**: Total voting per kandidat
2. **Radar Chart**: Distribusi voting per kriteria

**Pemenang Final:**
- Ditampilkan dengan card khusus berwarna gold
- Nama, bagian, dan total voting

---

## ⚙️ Pengaturan Phase

### Mengubah Phase Voting

1. Buka dashboard admin
2. Pilih tab **"Settings"**
3. Klik button phase yang diinginkan:
   - **Phase 1**: Voting tahap 1 aktif
   - **Phase 2**: Voting tahap 2 aktif
   - **Selesai**: Voting ditutup

**Catatan:**
- Pegawai hanya bisa voting sesuai phase aktif
- Ubah ke Phase 2 setelah semua voting tahap 1 selesai

---

## 🔄 Reset Data

### Jenis Reset

**1. Reset Voting Tahap 1**
- Menghapus semua vote tahap 1
- Pegawai bisa voting ulang tahap 1
- Kandidat tetap ada

**2. Reset Voting Tahap 2**
- Menghapus semua vote tahap 2
- Pegawai bisa voting ulang tahap 2

**3. Reset Semua Data**
- Menghapus SEMUA data:
  - Vote tahap 1 & 2
  - Pegawai
  - Kandidat
- **PERINGATAN:** Data tidak dapat dikembalikan!

### Cara Reset

1. Buka dashboard admin
2. Pilih tab **"Settings"**
3. Scroll ke bagian **"Reset Data"**
4. Klik button reset yang diinginkan
5. **Konfirmasi** dengan hati-hati

---

## 📤 Export Data

### Export Data Pegawai

1. Buka tab **"Pegawai"** di admin dashboard
2. Klik **"Export CSV"**
3. File `pegawai.csv` akan didownload

**Isi file:**
- NIP
- Nama
- Bagian
- Status voting tahap 1
- Status voting tahap 2

---

## 🔐 Keamanan

### Link Unik
- Setiap pegawai mendapat link unik
- Link harus dipasangkan dengan NIP yang benar
- Link tidak bisa digunakan orang lain

### Voting Sekali
- Setelah submit, pegawai **tidak bisa** mengubah pilihan
- Sistem mencatat status voting

### Validasi
- NIP harus valid dan terdaftar
- Link harus cocok dengan NIP
- Phase harus sesuai

---

## 📞 Troubleshooting

### "Link tidak valid"
- Pastikan menggunakan link yang benar
- Jangan edit manual URL
- Minta link baru dari admin

### "NIP tidak ditemukan"
- NIP belum didaftarkan di sistem
- Hubungi admin untuk generate link

### "Anda sudah voting"
- Sudah melakukan voting sebelumnya
- Tidak bisa voting lagi untuk phase yang sama
- Bisa melihat hasil di halaman results

### "Belum ada kandidat"
- Admin belum menambahkan kandidat
- Hubungi admin

---

## 📋 Checklist Setup Awal

- [ ] Inisialisasi sistem (POST /initialize)
- [ ] Tambah kandidat untuk setiap bagian (5 kandidat × 6 bagian = 30 kandidat)
- [ ] Generate link untuk semua pegawai
- [ ] Share link ke masing-masing pegawai
- [ ] Set phase ke "Phase 1"
- [ ] Monitor status voting di dashboard
- [ ] Setelah semua voting tahap 1 selesai, set phase ke "Phase 2"
- [ ] Monitor status voting tahap 2
- [ ] Umumkan pemenang final

---

## 🎯 Best Practices

1. **Persiapan:**
   - Siapkan data kandidat sebelum voting
   - Test dengan beberapa pegawai dulu

2. **Komunikasi:**
   - Jelaskan aturan voting dengan jelas
   - Berikan deadline yang jelas
   - Reminder untuk yang belum voting

3. **Monitoring:**
   - Cek status voting secara berkala
   - Pastikan semua pegawai sudah voting sebelum ganti phase

4. **Keamanan:**
   - Jangan share link admin ke pegawai
   - Simpan backup data hasil voting
   - Export data secara berkala

---

## 📧 Kontak

Jika ada pertanyaan atau kendala, hubungi administrator sistem.

---

**Terakhir diupdate:** November 2024
**Versi:** 1.0
