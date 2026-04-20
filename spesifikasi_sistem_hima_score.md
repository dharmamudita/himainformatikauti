# SPESIFIKASI LENGKAP: SISTEM PENILAIAN KEAKTIFAN ANGGOTA HIMA (HIMA SCORE)

> Dokumen ini menjelaskan secara **rinci dan spesifik** bagaimana sistem penilaian keaktifan anggota HIMA Informatika Universitas Teknokrat Indonesia bekerja, mulai dari struktur data, alur proses, rumus perhitungan, hingga contoh perhitungan nyata. Dokumen ini dibuat agar AI atau developer lain dapat **membangun ulang** aplikasi ini secara utuh.

---

## 1. GAMBARAN UMUM APLIKASI

**Nama Aplikasi:** HIMA Score  
**Tujuan:** Memantau dan menilai keaktifan seluruh anggota HIMA Informatika secara transparan dan real-time.  
**Pengguna:**
- **Admin/Pengurus (Login Required):** Mengelola data anggota dan menginput nilai kegiatan.
- **Publik (Tanpa Login):** Melihat klasemen/ranking skor anggota dan detail rapor per anggota.

**Tech Stack Asli:** Laravel 11, TailwindCSS, MySQL, Laravel Breeze (Auth).

---

## 2. STRUKTUR DATABASE

### Tabel `users` (Bawaan Laravel Breeze)
Untuk autentikasi admin. Menggunakan migration default Laravel.

### Tabel `members` (Anggota HIMA)
| Kolom       | Tipe    | Keterangan                                                                 |
|-------------|---------|----------------------------------------------------------------------------|
| `id`        | bigint  | Primary key, auto increment                                               |
| `nama`      | string  | Nama lengkap anggota                                                       |
| `divisi`    | string  | Nama divisi (contoh: "Kominfo", "Kaderisasi", "PSDM", dll.)               |
| `angkatan`  | integer | Tahun angkatan (contoh: 2023, 2024)                                        |
| `skor_awal` | float   | **Nilai modal awal** saat anggota pertama kali didaftarkan. **TIDAK PERNAH BERUBAH** setelah dibuat. Berfungsi sebagai "safety net" agar kategori yang belum punya data tidak bernilai 0. |
| `skor`      | float   | **Skor berjalan (real-time)**. Ini adalah skor final yang dihitung ulang setiap kali ada nilai baru diinput. Ini yang ditampilkan di klasemen. |
| `created_at`| timestamp | Waktu pembuatan data                                                     |
| `updated_at`| timestamp | Waktu update terakhir                                                    |

**Relasi:** Satu `Member` memiliki banyak `Assessment` (one-to-many).

### Tabel `assessments` (Riwayat Penilaian Per Kegiatan)
| Kolom           | Tipe    | Keterangan                                                              |
|-----------------|---------|-------------------------------------------------------------------------|
| `id`            | bigint  | Primary key, auto increment                                            |
| `member_id`     | bigint  | Foreign key ke tabel `members`. Cascade on delete.                      |
| `nama_kegiatan` | string  | Nama kegiatan yang dinilai (contoh: "Rapat Bulanan April", "Progja Webinar AI") |
| `kategori`      | string  | Jenis kegiatan. **Hanya 3 pilihan:** `rapat`, `progja`, atau `panitia` |
| `nilai`         | integer | Nilai kegiatan tersebut. **Rentang: 0 sampai 100.** (100 = sempurna, 0 = tidak hadir) |
| `catatan`       | text    | Catatan opsional dari admin (contoh: "Hadir tepat waktu, aktif berdiskusi") |
| `created_at`    | timestamp | Waktu input nilai                                                     |
| `updated_at`    | timestamp | Waktu update                                                          |

---

## 3. PENJELASAN 3 KATEGORI KEGIATAN

Setiap kegiatan yang dinilai **WAJIB** dimasukkan ke salah satu dari 3 kategori berikut:

| No | Kategori   | Emoji | Deskripsi                                                                                   | Bobot  |
|----|------------|-------|---------------------------------------------------------------------------------------------|--------|
| 1  | `rapat`    | 📅    | Kegiatan rapat organisasi (rapat bulanan, rapat koordinasi, rapat evaluasi, dll.)           | **20%** |
| 2  | `progja`   | 🚀    | Program kerja divisi masing-masing (workshop, seminar, pelatihan yang diselenggarakan divisi)| **45%** |
| 3  | `panitia`  | 🎪    | Keterlibatan dalam kepanitiaan acara besar HIMA (acara lintas divisi, dies natalis, dll.)   | **35%** |

> **Total bobot: 20% + 45% + 35% = 100%**

---

## 4. RUMUS PERHITUNGAN SKOR (INTI SISTEM)

### Kapan Perhitungan Terjadi?
Setiap kali admin **menginput 1 nilai baru** untuk seorang anggota, sistem akan **langsung menghitung ulang** skor total anggota tersebut.

### Langkah Perhitungan:

#### LANGKAH 1: Hitung Rata-rata Per Kategori
Sistem mengambil **SEMUA** riwayat nilai (assessments) milik anggota tersebut, lalu menghitung **rata-rata (average)** nilai per kategori:

```
Rata-rata Rapat   = SUM(semua nilai kategori 'rapat')   / JUMLAH(kegiatan rapat yang diikuti)
Rata-rata Progja  = SUM(semua nilai kategori 'progja')  / JUMLAH(kegiatan progja yang diikuti)
Rata-rata Panitia = SUM(semua nilai kategori 'panitia') / JUMLAH(kegiatan panitia yang diikuti)
```

#### LANGKAH 2: Safety Net (Jika Belum Punya Data di Kategori Tertentu)
Jika seorang anggota **BELUM PERNAH** mengikuti kegiatan di suatu kategori (artinya belum ada assessment sama sekali untuk kategori tersebut), maka:

```
Rata-rata kategori tersebut = skor_awal anggota (bukan 0!)
```

**Logika ini SANGAT PENTING.** Tanpa ini, anggota yang baru saja diinput 1 kegiatan rapat tapi belum ikut progja dan panitia akan mendapat skor rendah secara tidak adil, karena progja (45%) dan panitia (35%) akan bernilai 0.

#### LANGKAH 3: Terapkan Rumus Pembobotan

```
SKOR AKHIR = (Rata-rata Rapat × 0.20) + (Rata-rata Progja × 0.45) + (Rata-rata Panitia × 0.35)
```

#### LANGKAH 4: Simpan Skor Akhir
Hasil `SKOR AKHIR` langsung disimpan/di-update ke kolom `skor` pada tabel `members` untuk anggota tersebut.

---

## 5. CONTOH PERHITUNGAN LENGKAP: HAFIS

### Data Profil Hafis:
| Field     | Nilai          |
|-----------|----------------|
| Nama      | Hafis Yulianto |
| Divisi    | Kominfo        |
| Angkatan  | 2023           |
| Skor Awal | 80             |

Saat pertama kali didaftarkan, `skor_awal = 80` dan `skor = 80`.

---

### SKENARIO A: Hafis Baru Didaftarkan (Belum Ada Kegiatan)

Belum ada assessment sama sekali.

```
Rata-rata Rapat   = skor_awal = 80 (belum ada data)
Rata-rata Progja  = skor_awal = 80 (belum ada data)
Rata-rata Panitia = skor_awal = 80 (belum ada data)

SKOR AKHIR = (80 × 0.20) + (80 × 0.45) + (80 × 0.35)
           = 16 + 36 + 28
           = 80.0
```
**Skor Hafis: 80.0** (sama dengan skor awal, karena belum ada kegiatan)

---

### SKENARIO B: Hafis Sudah Ikut 1 Kegiatan Rapat

Admin input:
| Kegiatan              | Kategori | Nilai |
|-----------------------|----------|-------|
| Rapat Bulanan Januari | rapat    | 90    |

**Perhitungan:**
```
Rata-rata Rapat   = 90 / 1 = 90 (ada 1 data rapat)
Rata-rata Progja  = skor_awal = 80 (belum ada data progja)
Rata-rata Panitia = skor_awal = 80 (belum ada data panitia)

SKOR AKHIR = (90 × 0.20) + (80 × 0.45) + (80 × 0.35)
           = 18 + 36 + 28
           = 82.0
```
**Skor Hafis sekarang: 82.0**

---

### SKENARIO C: Hafis Sudah Ikut Banyak Kegiatan

Riwayat lengkap penilaian Hafis:

| No | Nama Kegiatan              | Kategori | Nilai | Catatan                       |
|----|----------------------------|----------|-------|-------------------------------|
| 1  | Rapat Bulanan Januari      | rapat    | 90    | Hadir tepat waktu             |
| 2  | Rapat Bulanan Februari     | rapat    | 85    | Terlambat 10 menit            |
| 3  | Rapat Evaluasi Semester    | rapat    | 100   | Aktif memberikan saran        |
| 4  | Workshop Desain Grafis     | progja   | 88    | Jadi moderator                |
| 5  | Seminar Teknologi AI       | progja   | 92    | Membantu persiapan            |
| 6  | Pelatihan Video Editing    | progja   | 75    | Kurang aktif di sesi diskusi  |
| 7  | Dies Natalis HIMA          | panitia  | 95    | Koordinator divisi dekorasi   |
| 8  | Turnamen E-Sport           | panitia  | 80    | Hadir tapi pasif              |

**Perhitungan:**

```
--- LANGKAH 1: Rata-rata Per Kategori ---

Rata-rata Rapat   = (90 + 85 + 100) / 3 = 275 / 3 = 91.67
Rata-rata Progja  = (88 + 92 + 75)  / 3 = 255 / 3 = 85.00
Rata-rata Panitia = (95 + 80)       / 2 = 175 / 2 = 87.50

--- LANGKAH 2: Safety Net ---
Semua kategori sudah ada datanya, jadi TIDAK menggunakan skor_awal.

--- LANGKAH 3: Terapkan Bobot ---

SKOR AKHIR = (91.67 × 0.20) + (85.00 × 0.45) + (87.50 × 0.35)
           = 18.334 + 38.25 + 30.625
           = 87.209
```
**Skor Hafis sekarang: 87.2** (dibulatkan 1 desimal saat ditampilkan)

---

### SKENARIO D: Hafis Hanya Punya Data Progja (Kategori Lain Kosong)

Misalkan Hafis hanya punya 1 kegiatan progja saja:

| No | Nama Kegiatan          | Kategori | Nilai |
|----|------------------------|----------|-------|
| 1  | Workshop Desain Grafis | progja   | 88    |

```
Rata-rata Rapat   = skor_awal = 80 (TIDAK ADA DATA → pakai skor_awal)
Rata-rata Progja  = 88 / 1 = 88
Rata-rata Panitia = skor_awal = 80 (TIDAK ADA DATA → pakai skor_awal)

SKOR AKHIR = (80 × 0.20) + (88 × 0.45) + (80 × 0.35)
           = 16 + 39.6 + 28
           = 83.6
```
**Skor Hafis sekarang: 83.6**

---

## 6. ALUR KERJA APLIKASI (USER FLOW)

### A. Alur Admin (Butuh Login)

```
Login → Dashboard Admin
         ├── Lihat Daftar Anggota (dikelompokkan per angkatan)
         ├── Filter/Search (nama, angkatan, divisi)
         ├── + Tambah Anggota Baru
         │      └── Input: Nama, Divisi, Angkatan, Skor Awal
         │      └── Skor Awal otomatis jadi Skor Berjalan awal
         ├── Edit Anggota
         │      └── Hanya bisa edit: Nama, Divisi, Angkatan
         │      └── TIDAK bisa edit Skor (skor hanya berubah via penilaian)
         ├── Hapus Anggota (dengan konfirmasi SweetAlert2)
         │      └── Menghapus anggota + semua riwayat nilainya (cascade)
         └── + NILAI (Input Penilaian Kegiatan)
                └── Form Input:
                      ├── Nama Kegiatan (text, wajib)
                      ├── Kategori/Jenis Kegiatan (dropdown: rapat/progja/panitia, wajib)
                      ├── Nilai: 0-100 (number, wajib)
                      └── Catatan Khusus (textarea, opsional)
                └── Setelah submit:
                      1. Data assessment disimpan ke tabel assessments
                      2. Sistem menghitung ulang skor anggota (rumus di atas)
                      3. Skor baru disimpan ke kolom 'skor' di tabel members
                      4. Redirect ke dashboard dengan notifikasi sukses
```

### B. Alur Publik (Tanpa Login)

```
Landing Page (Beranda)
    └── Tombol "LIHAT KLASEMEN"
            └── Halaman Klasemen/Ranking
                  ├── Tabel semua anggota diurutkan berdasarkan skor
                  ├── Ranking 1 = 👑, Ranking 2 = 🥈, Ranking 3 = 🥉
                  ├── Filter: Search Nama, Filter Angkatan, Filter Divisi
                  ├── Sort: Tertinggi ↔ Terendah
                  └── Klik nama anggota → Halaman Detail/Rapor
                        ├── Info profil (Nama, Divisi, Angkatan)
                        ├── Skor Awal & Skor Real-time
                        └── Daftar riwayat semua kegiatan + nilai per kegiatan
                              (diurutkan dari terbaru ke terlama)
```

---

## 7. HALAMAN-HALAMAN APLIKASI

| No | Halaman              | URL                   | Akses   | Keterangan                                                  |
|----|----------------------|-----------------------|---------|--------------------------------------------------------------|
| 1  | Landing Page         | `/`                   | Publik  | Beranda utama, hero section, penjelasan sistem               |
| 2  | Klasemen/Ranking     | `/klasemen`           | Publik  | Tabel ranking anggota + filter + sort                        |
| 3  | Detail Rapor Anggota | `/anggota/{id}`       | Publik  | Detail profil + riwayat kegiatan seorang anggota             |
| 4  | Login                | `/login`              | Publik  | Halaman login admin (Laravel Breeze)                         |
| 5  | Dashboard Admin      | `/admin/dashboard`    | Admin   | Daftar anggota + tombol aksi (Nilai, Edit, Hapus)            |
| 6  | Tambah Anggota       | `/admin/create`       | Admin   | Form tambah anggota baru                                     |
| 7  | Edit Anggota         | `/admin/edit/{id}`    | Admin   | Form edit data anggota (tanpa skor)                          |
| 8  | Input Penilaian      | `/admin/nilai/{id}`   | Admin   | Form input nilai kegiatan untuk seorang anggota              |

---

## 8. ATURAN BISNIS PENTING

1. **Skor Awal (`skor_awal`) TIDAK PERNAH BERUBAH** setelah anggota dibuat. Ini adalah "modal" awal.
2. **Skor Berjalan (`skor`) HANYA berubah melalui proses penilaian**, BUKAN melalui form edit anggota.
3. **Nilai per kegiatan berkisar 0-100.** Dimana 100 = sempurna, 0 = tidak hadir/gagal total.
4. **Setiap input nilai baru langsung trigger perhitungan ulang** skor total anggota.
5. **Jika anggota dihapus, semua riwayat penilaiannya ikut terhapus** (cascade delete).
6. **Klasemen menampilkan skor 1 desimal** (contoh: 87.2, bukan 87.209).
7. **Skor ditampilkan dengan warna:**
   - Skor ≥ 70 → Hijau (bagus)
   - Skor < 70 → Merah (perlu perhatian)
8. **Di klasemen publik, ranking top 3 mendapat ikon khusus:**
   - Ranking 1 → 👑 (background kuning)
   - Ranking 2 → 🥈 (background abu-abu)
   - Ranking 3 → 🥉 (background oranye)
9. **Di halaman rapor/detail, riwayat kegiatan diberi warna berdasarkan kategorinya:**
   - Rapat → Ungu (purple)
   - Progja → Biru (blue)
   - Panitia → Oranye (orange)

---

## 9. PSEUDOCODE FUNGSI PERHITUNGAN (UNTUK AI)

```
function hitungSkorAnggota(member_id):
    // Ambil data anggota
    member = findMemberById(member_id)
    
    // Hitung rata-rata per kategori
    avgRapat = average(assessments WHERE member_id = member_id AND kategori = 'rapat')
    avgProgja = average(assessments WHERE member_id = member_id AND kategori = 'progja')
    avgPanitia = average(assessments WHERE member_id = member_id AND kategori = 'panitia')
    
    // Safety net: jika belum ada data, gunakan skor_awal
    IF avgRapat IS NULL THEN avgRapat = member.skor_awal
    IF avgProgja IS NULL THEN avgProgja = member.skor_awal
    IF avgPanitia IS NULL THEN avgPanitia = member.skor_awal
    
    // Hitung skor final dengan bobot
    skorAkhir = (avgRapat * 0.20) + (avgProgja * 0.45) + (avgPanitia * 0.35)
    
    // Simpan ke database
    UPDATE member SET skor = skorAkhir
    
    RETURN skorAkhir
```

---

## 10. RINGKASAN SINGKAT (TL;DR)

> Aplikasi ini menilai keaktifan anggota HIMA berdasarkan 3 jenis kegiatan: **Rapat (bobot 20%)**, **Progja/Program Kerja (bobot 45%)**, dan **Panitia/Kepanitiaan (bobot 35%)**. Setiap kegiatan diberi nilai 0-100 oleh admin. Skor akhir anggota dihitung dari **rata-rata nilai per kategori × bobot masing-masing**. Jika belum ada data di suatu kategori, digunakan **skor awal** sebagai pengganti. Skor dihitung ulang secara **real-time** setiap kali ada nilai baru diinput.
