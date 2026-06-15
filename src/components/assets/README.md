# Assets Folder

Folder ini berisi semua aset statis untuk aplikasi Pegawai Teladan.

## Logos

### 1. Logo Pengayoman (Kementerian Hukum dan HAM)
- **File**: `logoPengayoman`
- **Format**: PNG
- **Warna**: Navy blue background dengan logo kuning/emas
- **Ukuran**: 1000x1000px
- **Penggunaan**: Logo kiri di header

### 2. Logo Inspektorat Jenderal
- **File**: `logoInspektorat`
- **Format**: PNG
- **Warna**: Navy blue dengan merah, biru, dan kuning
- **Ukuran**: 512x512px
- **Penggunaan**: Logo kanan di header

## Cara Penggunaan

```tsx
import { logoPengayoman, logoInspektorat } from './components/assets/logos';

// Di komponen:
<img src={logoPengayoman} alt="Logo Pengayoman" />
<img src={logoInspektorat} alt="Logo Inspektorat Jenderal" />
```

## File Assets yang Tersedia

- `logos.tsx` - Export semua logo
