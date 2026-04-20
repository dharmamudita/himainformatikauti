# 🕌 Platform Digital UKM KSEI RIIEF

**Pengembangan Platform Digital Terintegrasi untuk Optimalisasi Manajemen Organisasi dan Evaluasi Keaktifan Anggota UKM KSEI RIIEF**

> Kelompok Studi Ekonomi Islam — Raden Intan Islamic Entrepreneur Forum  
> UIN Raden Intan Lampung

---

## 📋 Tentang Proyek

Platform Digital UKM KSEI RIIEF adalah sebuah aplikasi web modern yang dikembangkan untuk mendigitalisasi seluruh proses administrasi, pembelajaran, dan evaluasi kegiatan pada Unit Kegiatan Mahasiswa (UKM) Kelompok Studi Ekonomi Islam — Raden Intan Islamic Entrepreneur Forum (KSEI RIIEF) di UIN Raden Intan Lampung.

Aplikasi ini dibangun menggunakan teknologi React.js dengan framework Vite dan Tailwind CSS, menghadirkan pengalaman pengguna yang responsif, modern, dan interaktif. Platform ini dirancang untuk memenuhi kebutuhan pengurus (admin) dalam mengelola organisasi serta anggota (member) dalam mengikuti berbagai kegiatan UKM.

---

## 🎯 Tujuan

1. **Digitalisasi Administrasi** — Menggantikan proses manual pengelolaan kegiatan, absensi, dan data anggota menjadi sistem digital yang efisien dan terstruktur.

2. **Pembelajaran Interaktif** — Menyediakan modul quiz (pilihan ganda dan essay) serta materi pembelajaran ekonomi Islam yang dapat diakses kapan saja.

3. **Evaluasi Keaktifan** — Membangun sistem penilaian otomatis berbasis poin untuk mengukur dan memotivasi partisipasi anggota melalui pendekatan gamifikasi.

4. **Transparansi Organisasi** — Memberikan akses publik terhadap informasi kegiatan, leaderboard keaktifan, dan forum diskusi untuk meningkatkan kepercayaan dan keterbukaan.

---

## ✨ Fitur Utama

### 🌐 Halaman Publik (Tanpa Login)
| Halaman | Deskripsi |
|---------|-----------|
| **Beranda** | Landing page dengan profil UKM, statistik, dan bidang pergerakan |
| **Tentang** | Sejarah, visi-misi, dan informasi lengkap KSEI RIIEF |
| **Struktur Organisasi** | Daftar pengurus inti dan 7 divisi beserta deskripsinya |
| **Kegiatan** | Katalog kegiatan dengan filter kategori (Materi & Soal, Kajian, Seminar, Lomba) |
| **Leaderboard** | Peringkat keaktifan anggota secara publik dengan podium Top 3 |
| **Forum Diskusi** | Ruang diskusi antar anggota dengan sistem topik dan balasan |
| **Kontak** | Informasi kontak dan lokasi UKM |

### 👨‍💼 Dashboard Admin
| Fitur | Deskripsi |
|-------|-----------|
| **Manajemen Pengguna** | CRUD anggota (tambah, edit, hapus), pencarian, filter role |
| **Manajemen Kegiatan** | CRUD kegiatan lengkap dengan quiz builder, periode otomatis (tanggal buka/tutup) |
| **Quiz Builder** | Pembuat soal interaktif — pilihan ganda (A/B/C/D) dan essay dengan poin kustom |
| **Sistem Absensi** | Generate kode unik per anggota per kegiatan, download PDF kode absensi |
| **Monitoring Absensi** | Lihat daftar yang sudah absen per kegiatan |
| **Analisis Keaktifan** | Ranking anggota berdasarkan poin, detail aktivitas per member |
| **Hasil Quiz** | Lihat siapa yang mengerjakan quiz beserta nilainya |

### 👤 Dashboard Member
| Fitur | Deskripsi |
|-------|-----------|
| **Overview** | Statistik pribadi (quiz selesai, absensi, rata-rata nilai, total poin) |
| **Riwayat Kegiatan** | Semua kegiatan yang pernah diikuti beserta tanggal dan detail |
| **Sertifikat Digital** | Generate dan cetak sertifikat PDF untuk setiap kegiatan yang diselesaikan |

### 📝 Sistem Quiz & Materi
- Dua tipe soal: **Pilihan Ganda** (auto-grading) dan **Essay**
- Konten materi bacaan per kegiatan
- Penilaian otomatis dengan skor 0-100
- Riwayat pengerjaan tersimpan

### 📋 Sistem Absensi Digital
- **Kode unik 6 karakter** per anggota per kegiatan (hash deterministik)
- Admin download **PDF daftar kode** untuk dibagikan
- Anggota input kode untuk mencatat kehadiran
- Validasi otomatis — satu kode hanya bisa dipakai sekali

### 🏆 Sistem Gamifikasi
- **Poin keaktifan**: Quiz = 15 poin, Absensi = 10 poin
- **Ranking otomatis**: Sangat Aktif (≥100), Aktif (≥60), Cukup (≥30), Pemula (<30)
- **Leaderboard publik** dengan podium dan peringkat lengkap
- **Sertifikat digital** sebagai penghargaan

### 📅 Periode Kegiatan Otomatis
- Setiap kegiatan memiliki tanggal buka dan tanggal tutup
- Status (Buka/Tutup) dihitung otomatis berdasarkan tanggal saat ini
- Tidak perlu update manual oleh admin

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Fungsi |
|-----------|--------|
| **React.js 19** | Library UI untuk membangun antarmuka interaktif |
| **Vite 6** | Build tool modern dengan Hot Module Replacement |
| **Tailwind CSS 4** | Framework CSS utility-first untuk styling responsif |
| **React Router DOM 7** | Client-side routing untuk navigasi SPA |
| **localStorage** | Penyimpanan data sisi klien (rencana migrasi ke Firebase) |
| **Vercel** | Platform hosting dan deployment |
| **GitHub** | Version control dan kolaborasi |

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js versi 18 atau lebih baru
- npm (terinstal bersama Node.js)

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/dharmamudita/kseiriief.git

# 2. Masuk ke direktori proyek
cd kseiriief

# 3. Install dependensi
npm install

# 4. Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### Akun Demo
| Role | NPM | Password |
|------|-----|----------|
| Admin | admin | admin123 |
| Member | 2021001 | test123 |

---

## 📁 Struktur Proyek

```
src/
├── components/          # Komponen reusable
│   ├── auth/            # Proteksi route
│   └── layout/          # Navbar & Footer
├── contexts/            # State management (AuthContext)
├── data/                # Database modules
│   ├── store.js         # Hub utama (re-export semua module)
│   ├── users.js         # CRUD pengguna
│   ├── kegiatan.js      # CRUD kegiatan + auto-status
│   ├── submissions.js   # Pengerjaan quiz
│   ├── attendance.js    # Absensi + PDF generator
│   └── forum.js         # Forum diskusi
└── pages/               # Halaman-halaman aplikasi
    ├── Home.jsx          # Beranda
    ├── AdminDashboard.jsx # Panel admin lengkap
    ├── MemberDashboard.jsx # Dashboard member + sertifikat
    ├── Leaderboard.jsx   # Ranking publik
    ├── Forum.jsx         # Forum diskusi
    └── ...               # Halaman lainnya
```

---

## 🌐 Deployment

Aplikasi di-deploy menggunakan **Vercel** dengan konfigurasi SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**Repository:** https://github.com/dharmamudita/kseiriief

---

## 📊 Arsitektur Data

Platform menggunakan 5 modul database terpisah untuk modularitas:

1. **Users** — Data pengguna (admin & member) dengan autentikasi NPM/password
2. **Kegiatan** — Data kegiatan dengan 4 kategori, quiz builder, dan periode otomatis
3. **Submissions** — Rekam jawaban quiz dengan auto-grading
4. **Attendance** — Rekam absensi dengan kode unik dan validasi
5. **Forum** — Topik diskusi dengan sistem balasan

---

## 📈 Rencana Pengembangan

| Fase | Status | Deskripsi |
|------|--------|-----------|
| **Fase 1** | ✅ Selesai | Semua fitur dasar (profil, quiz, absensi, forum, leaderboard, dashboard) |
| **Fase 2** | 🔄 Direncanakan | Migrasi ke Firebase (realtime database), pengumuman, galeri foto, ekspor Excel |
| **Fase 3** | 📋 Masa Depan | Kalender interaktif, pendaftaran online, dark mode, PWA |

---

## 👥 Tim Pengembang

**UKM KSEI RIIEF** — UIN Raden Intan Lampung

---

*Platform ini dikembangkan sebagai bagian dari upaya digitalisasi organisasi kemahasiswaan di lingkungan UIN Raden Intan Lampung.*
