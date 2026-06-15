# ❓ FAQ - Sistem 2 Level Admin

## 🔐 Tentang Password & Login

### Q1: Apa perbedaan antara Super Admin dan Admin?
**A:** 
- **Super Admin** memiliki akses penuh ke semua fitur termasuk mengelola pegawai, kandidat, dan mengubah settings sistem.
- **Admin** hanya bisa melihat hasil voting dan statistik, tidak bisa mengubah data apapun.

---

### Q2: Bagaimana cara login sebagai Super Admin?
**A:** 
1. Buka `/admin`
2. Masukkan password: `tlhpteladan123`
3. Klik Login
4. Badge "🛡️ Super Admin" akan muncul di pojok kanan atas

---

### Q3: Bagaimana cara login sebagai Admin biasa?
**A:** 
1. Buka `/admin`
2. Masukkan password: `adminteladan123`
3. Klik Login
4. Badge "👤 Admin" akan muncul di pojok kanan atas

---

### Q4: Apakah saya harus login setiap kali membuka halaman?
**A:** 
Tidak! Selama browser Anda tidak ditutup, session akan tetap aktif. Anda hanya perlu login sekali. Namun jika browser ditutup, Anda harus login ulang.

---

### Q5: Lupa password, bagaimana cara resetnya?
**A:** 
Hubungi developer untuk mereset password atau edit file `/components/AdminPasswordDialog.tsx` jika Anda memiliki akses ke source code.

```typescript
const SUPER_ADMIN_PASSWORD = 'password_baru_anda';
const ADMIN_PASSWORD = 'password_baru_anda';
```

---

### Q6: Bisakah saya mengubah password dari UI?
**A:** 
Saat ini belum ada fitur ubah password dari UI. Password harus diubah langsung di source code.

---

## 👥 Tentang Akses & Permission

### Q7: Tab mana saja yang bisa diakses Admin biasa?
**A:** 
Admin biasa hanya bisa mengakses 3 tab:
- ✅ Overview (statistik sistem)
- ✅ Hasil Tahap 1 (view only)
- ✅ Hasil Tahap 2 (view only)

---

### Q8: Kenapa saya tidak bisa melihat tab Pegawai dan Kandidat?
**A:** 
Anda login sebagai Admin biasa. Tab tersebut hanya tersedia untuk Super Admin. Jika Anda membutuhkan akses, login dengan password Super Admin.

---

### Q9: Sebagai Admin, bisakah saya export hasil voting?
**A:** 
Ya! Admin bisa export hasil voting ke PDF atau Excel dari tab "Hasil Tahap 1" dan "Hasil Tahap 2".

---

### Q10: Bisakah saya login sebagai Super Admin dan Admin secara bersamaan?
**A:** 
Tidak di browser yang sama. Tapi Anda bisa buka 2 browser berbeda atau incognito mode untuk login dengan level berbeda.

---

## 🛠️ Tentang Fitur & Fungsi

### Q11: Apa yang bisa dilakukan Super Admin yang tidak bisa dilakukan Admin?
**A:** 
Super Admin bisa:
- ➕ Tambah/edit/hapus pegawai
- 🔗 Generate link voting unik
- 👤 Tambah/edit/hapus kandidat
- ⚙️ Ubah phase voting (1 ↔ 2)
- 🗑️ Reset data voting
- 🔄 Reset semua data sistem

---

### Q12: Bagaimana cara menambah pegawai baru?
**A:** 
(Hanya Super Admin)
1. Login sebagai Super Admin
2. Klik tab "Pegawai"
3. Isi form: NIP, Nama, Bagian
4. Klik "Tambah & Generate Link"
5. Copy link yang muncul dan kirim ke pegawai tersebut

---

### Q13: Bagaimana cara mengubah phase voting?
**A:** 
(Hanya Super Admin)
1. Login sebagai Super Admin
2. Klik tab "Settings"
3. Pilih Phase 1 atau Phase 2
4. Klik "Ubah Phase"

---

### Q14: Apa yang terjadi jika saya reset voting?
**A:** 
(Hanya Super Admin)
- **Reset Tahap 1**: Menghapus semua voting tahap 1
- **Reset Tahap 2**: Menghapus semua voting tahap 2
- **Reset Semua**: Menghapus SEMUA data termasuk pegawai dan kandidat

⚠️ **HATI-HATI**: Data yang sudah dihapus tidak bisa dikembalikan!

---

### Q15: Berapa maksimal kandidat per bagian?
**A:** 
Maksimal **5 kandidat** per bagian. Sistem akan menolak jika Anda mencoba menambah lebih dari 5.

---

## 🔄 Tentang Session & Logout

### Q16: Bagaimana cara logout?
**A:** 
Klik tombol "Logout" di pojok kanan atas (sebelah badge admin level).

---

### Q17: Apa yang terjadi saat saya logout?
**A:** 
- Session akan dihapus
- Halaman akan reload otomatis
- Anda akan diminta login ulang

---

### Q18: Apakah session saya expire?
**A:** 
Session tidak expire selama browser tidak ditutup. Tapi begitu browser ditutup, session akan hilang dan Anda harus login ulang.

---

### Q19: Bisakah orang lain lihat session saya?
**A:** 
Tidak, session tersimpan di `sessionStorage` browser Anda secara lokal. Tidak ada yang bisa mengaksesnya kecuali di komputer/browser yang sama.

---

## 🎨 Tentang UI/UX

### Q20: Apa arti badge di pojok kanan atas?
**A:** 
- 🛡️ **Super Admin** (biru): Anda login sebagai Super Admin dengan akses penuh
- 👤 **Admin** (abu-abu): Anda login sebagai Admin dengan akses terbatas

---

### Q21: Kenapa jumlah tab berbeda-beda?
**A:** 
- Super Admin: 6 tabs (semua fitur)
- Admin: 3 tabs (hanya viewing)

Ini sesuai dengan level akses masing-masing.

---

### Q22: Apakah ada notifikasi jika saya tidak punya akses ke fitur tertentu?
**A:** 
Tidak. Tab yang tidak bisa Anda akses tidak akan ditampilkan sama sekali, sehingga tidak membingungkan.

---

## 🔒 Tentang Keamanan

### Q23: Apakah password saya aman?
**A:** 
Password tersimpan di source code (environment), tidak di database. Namun untuk keamanan maksimal, sebaiknya:
- Jangan share password ke orang yang tidak berwenang
- Ganti password secara berkala
- Logout setelah selesai menggunakan
- Jangan save password di browser publik

---

### Q24: Bisakah Admin upgrade ke Super Admin tanpa password?
**A:** 
Tidak! Sistem menggunakan password-based authentication. Untuk mendapat akses Super Admin, Anda HARUS tahu passwordnya.

---

### Q25: Apa yang harus dilakukan jika ada kebocoran password?
**A:** 
1. Segera ganti password di source code
2. Logout semua user yang sedang aktif
3. Informasikan password baru hanya ke orang yang berwenang
4. Monitor aktivitas admin untuk memastikan tidak ada akses tidak sah

---

## 🐛 Troubleshooting

### Q26: Saya sudah login tapi tab masih terbatas, kenapa?
**A:** 
Kemungkinan Anda login sebagai Admin biasa (bukan Super Admin). Coba:
1. Logout
2. Login ulang dengan password Super Admin: `tlhpteladan123`
3. Periksa badge di header, pastikan "🛡️ Super Admin"

---

### Q27: Password benar tapi tidak bisa login
**A:** 
Kemungkinan penyebab:
1. Typo saat mengetik password (case-sensitive)
2. Browser cache issue → Clear cache dan coba lagi
3. JavaScript error → Check console browser (F12)
4. Source code berubah → Pastikan file tidak termodifikasi

---

### Q28: Halaman reload terus-menerus
**A:** 
Kemungkinan ada masalah dengan session storage. Coba:
1. Clear browser storage (F12 → Application → Clear Storage)
2. Refresh halaman
3. Login ulang

---

### Q29: Tab tidak muncul padahal saya Super Admin
**A:** 
1. Periksa badge di header, pastikan "🛡️ Super Admin"
2. Clear cache dan reload
3. Logout dan login ulang
4. Check browser console untuk error

---

### Q30: Error "Cannot read property 'adminLevel'"
**A:** 
Ini biasanya terjadi karena:
1. Session storage corrupt → Logout dan login ulang
2. Browser tidak support sessionStorage → Update browser
3. Code error → Contact developer

---

## 📊 Tentang Data & Export

### Q31: Format apa saja yang bisa di-export?
**A:** 
Saat ini mendukung:
- PDF (untuk laporan)
- Excel (untuk data tabular)

---

### Q32: Apakah Admin bisa export data?
**A:** 
Ya! Admin bisa export hasil voting dari tab "Hasil Tahap 1" dan "Hasil Tahap 2".

---

### Q33: Data export mencakup apa saja?
**A:** 
- Nama kandidat
- Nilai per kriteria
- Total nilai
- Ranking (jika ada)
- Grafik (untuk PDF)

---

## 🎯 Best Practices

### Q34: Kapan sebaiknya menggunakan akun Admin vs Super Admin?
**A:** 
- **Super Admin**: Untuk manajemen sistem, setup awal, dan maintenance
- **Admin**: Untuk monitoring harian dan melihat hasil voting

---

### Q35: Berapa banyak orang yang sebaiknya punya akses Super Admin?
**A:** 
Sebaiknya **maksimal 2-3 orang** untuk menjaga keamanan dan accountability.

---

### Q36: Apakah ada log aktivitas admin?
**A:** 
Saat ini belum ada fitur audit log. Ini bisa menjadi pengembangan di masa depan.

---

## 💡 Tips & Tricks

### Q37: Cara cepat switch antara Super Admin dan Admin?
**A:** 
Buka 2 tab browser:
- Tab 1: Login sebagai Super Admin (untuk management)
- Tab 2: Login sebagai Admin di incognito mode (untuk viewing)

---

### Q38: Shortcut keyboard untuk logout?
**A:** 
Saat ini belum ada shortcut. Gunakan tombol Logout di header.

---

### Q39: Bagaimana cara bookmark halaman dengan auto-login?
**A:** 
Session-based, jadi tidak bisa auto-login via URL. Tapi selama browser tidak ditutup, Anda tetap login.

---

### Q40: Ada cara untuk melihat siapa yang sedang login?
**A:** 
Saat ini belum ada fitur ini. Setiap session independen dan tidak tracked secara global.

---

## 📞 Kontak & Support

Jika pertanyaan Anda tidak terjawab di FAQ ini:

1. **Email**: support@inspektoratjenderal.gov.id
2. **WhatsApp**: +62 xxx xxxx xxxx
3. **Dokumentasi**: Lihat `/ADMIN_ACCESS_GUIDE.md`
4. **Quick Ref**: Lihat `/QUICK_REFERENCE.md`

---

**FAQ Version:** 1.0  
**Last Updated:** December 2024  
**Total Questions:** 40
