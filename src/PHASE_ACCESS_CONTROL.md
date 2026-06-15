# 🔐 Phase Access Control - Quick Guide

## 📌 Ringkasan

Sistem sekarang memiliki **kontrol akses phase** yang memastikan user hanya bisa mengakses halaman sesuai phase aktif.

---

## 🎯 Aturan Akses

### **Phase 1 Aktif:**
```
✅ ALLOWED                  ❌ BLOCKED
/phase1                    /phase2
/phase1/results            /phase2/results
```

### **Phase 2 Aktif:**
```
✅ ALLOWED                  ❌ BLOCKED
/phase2                    /phase1
/phase2/results            /phase1/results
```

---

## 🔄 Behavior

### **Jika User Akses Wrong Phase:**
```
1. User mengakses /phase2 (tapi phase aktif = 1)
2. Sistem fetch current phase dari server
3. Validasi: phase aktif (1) ≠ phase diminta (2)
4. Auto-redirect ke /vote
5. User harus validasi NIP ulang
```

### **Jika User Akses Correct Phase:**
```
1. User mengakses /phase1 (dan phase aktif = 1)
2. Sistem fetch current phase dari server
3. Validasi: phase aktif (1) = phase diminta (1) ✓
4. Halaman loaded normal
5. User bisa voting
```

---

## 👨‍💼 Untuk Admin

### **Cara Mengubah Phase:**
```
1. Login ke /admin dengan password
2. Pilih tab "Settings" (Super Admin only)
3. Klik button "Phase 1" atau "Phase 2"
4. Konfirmasi
5. ✅ Phase berubah untuk semua user
```

### **Efek Mengubah Phase:**
```
Phase 1 → Phase 2:
- ✅ Semua user bisa akses phase 2
- ❌ Semua user tidak bisa akses phase 1 lagi
- 📊 Results phase 1 tetap bisa dilihat di admin

Phase 2 → Phase 1:
- ✅ Semua user bisa akses phase 1
- ❌ Semua user tidak bisa akses phase 2 lagi
- ⚠️ PERINGATAN: Jangan ubah kembali jika phase 2 sudah mulai!
```

---

## 👤 Untuk User

### **Saya punya link voting phase 2, tapi tidak bisa akses:**
✅ **Normal!** Sistem masih di phase 1. Tunggu admin mengubah ke phase 2.

### **Kemarin saya bisa akses phase 1, sekarang tidak bisa:**
✅ **Normal!** Sistem sudah berubah ke phase 2. Gunakan link phase 2.

### **Saya bookmark link voting, tapi di-redirect terus:**
✅ **Normal!** Phase sudah berubah. Link lama tidak valid lagi.

### **Bagaimana cara tahu phase aktif saat ini?**
1. Akses halaman validasi `/vote`
2. Masukkan NIP
3. Sistem akan redirect ke phase yang benar

---

## 🛡️ Keamanan

### **Yang Dilindungi:**
- ✅ Voting page (Phase 1 & 2)
- ✅ Results page (Phase 1 & 2)
- ✅ Semua direct URL access

### **Yang Tidak Dilindungi:**
- ⚠️ Admin dashboard (memiliki password sendiri)
- ⚠️ Validation page (publik untuk input NIP)

---

## 📊 Timeline Example

```
WEEK 1: PHASE 1
┌─────────────────────────────────┐
│ ✅ Users vote in Phase 1        │
│ ✅ Results visible per bagian   │
│ ❌ Phase 2 blocked              │
└─────────────────────────────────┘
         Admin changes phase
                 ↓
WEEK 2: PHASE 2
┌─────────────────────────────────┐
│ ✅ Users vote in Phase 2        │
│ ✅ Final results visible        │
│ ❌ Phase 1 blocked              │
└─────────────────────────────────┘
```

---

## ⚠️ Important Reminders

### **Untuk Admin:**
1. ⚠️ **Jangan ubah phase sembarangan!**
   - Phase 1 → Phase 2: OK jika voting phase 1 selesai
   - Phase 2 → Phase 1: DANGER! Data phase 2 masih ada, tapi user tidak bisa akses

2. ⚠️ **Pastikan semua user sudah selesai voting sebelum ganti phase**
   - Check voting status di tab "Overview"
   - Komunikasi ke user sebelum ganti

3. ⚠️ **Backup data sebelum ganti phase**
   - Export hasil phase 1 sebelum pindah ke phase 2
   - Export hasil phase 2 sebelum reset (jika perlu)

### **Untuk User:**
1. ✅ **Bookmark link validation `/vote`, bukan link voting langsung**
   - Link validation selalu valid
   - Auto-redirect ke phase yang benar

2. ✅ **Check dengan admin jika tidak bisa akses**
   - Mungkin phase sudah berubah
   - Mungkin ada masalah teknis

3. ✅ **Selesaikan voting sesuai deadline**
   - Admin bisa ubah phase kapan saja
   - Voting yang belum selesai akan hangus

---

## 🔧 Troubleshooting

### **Problem: User di-redirect terus ke /vote**
**Possible Causes:**
1. Phase tidak sesuai dengan URL yang diakses
2. Session storage corrupt
3. NIP belum divalidasi

**Solution:**
1. Clear browser cache & cookies
2. Akses `/vote` dan validasi NIP ulang
3. Contact admin jika masih bermasalah

### **Problem: Phase berubah tapi user masih bisa akses phase lama**
**Possible Causes:**
1. User masih di halaman lama (belum refresh)
2. Browser cache

**Solution:**
1. User harus refresh halaman atau navigate ulang
2. Validasi akan terjadi saat page load berikutnya

### **Problem: Admin tidak bisa ubah phase**
**Possible Causes:**
1. Bukan Super Admin (hanya Super Admin bisa ubah phase)
2. Server error

**Solution:**
1. Check level admin (Super Admin atau Admin biasa?)
2. Check console log untuk error
3. Contact IT support

---

## 📞 Support

### **Untuk User:**
- **Issue:** Tidak bisa akses voting
- **Contact:** Admin sistem
- **Info yang perlu:** NIP, URL yang diakses, screenshot error

### **Untuk Admin:**
- **Issue:** Technical problem dengan phase control
- **Contact:** IT Support / Development team
- **Info yang perlu:** Browser console log, steps to reproduce

---

## ✅ Quick Checklist

### **Sebelum Ganti Phase (Admin):**
- [ ] Semua user phase saat ini sudah voting
- [ ] Data sudah di-export
- [ ] User sudah dikomunikasikan
- [ ] Backup tersedia
- [ ] Yakin fase baru siap dimulai

### **Setelah Ganti Phase (Admin):**
- [ ] Announce ke semua user
- [ ] Monitor voting status tab
- [ ] Check ada user yang confused
- [ ] Siap handle support requests

### **Untuk User yang Mau Vote:**
- [ ] Punya NIP valid
- [ ] Tahu phase aktif saat ini
- [ ] Gunakan link validation `/vote`
- [ ] Browser up-to-date
- [ ] Internet stabil

---

## 📚 Related Documentation

- **Full Security Details:** `/SECURITY_PHASE_VALIDATION.md`
- **Admin Guide:** `/ADMIN_ACCESS_GUIDE.md`
- **System Architecture:** `/SYSTEM_ARCHITECTURE.md`
- **FAQ:** `/FAQ_ADMIN_LEVELS.md`

---

**Version:** 2.2  
**Last Updated:** December 2024  
**Type:** Security Feature  
**Status:** ✅ Active

---

**Remember:** Phase control adalah fitur keamanan. Jangan dimanipulasi atau di-bypass!
