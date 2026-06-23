# 🏥 SIMPUS - Sistem Informasi Manajemen Puskesmas

Dokumen perencanaan (blueprint) aplikasi sebelum proses build. Gunakan dokumen ini sebagai acuan saat development di Antigravity (atau tool lain), agar struktur konsisten dari awal sampai akhir.

---

## 1. Deskripsi Aplikasi

SIMPUS adalah aplikasi manajemen Puskesmas berbasis web untuk membantu pendaftaran pasien, rekam medis, farmasi/obat, laboratorium, kasir/pembayaran, hingga laporan, dengan multi-role (Admin, Pendaftaran, Dokter/Perawat, Apoteker, Kasir, Kepala Puskesmas).

**Tujuan utama:**
- Digitalisasi pendaftaran & rekam medis pasien
- Mempercepat alur poli (antrian, periksa, resep)
- Mengelola stok obat & farmasi
- Pelaporan (BPJS, kunjungan, penyakit, keuangan)

---

## 2. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React.js (Vite) + TailwindCSS + React Router + Axios |
| Backend | Node.js (Express.js) atau Laravel (PHP) — pilih salah satu |
| Database | MySQL / PostgreSQL |
| Auth | JWT (JSON Web Token) + Role Based Access Control (RBAC) |
| State Management | Zustand / Redux Toolkit (opsional) |
| ORM | Prisma (Node.js) atau Eloquent (Laravel) |
| Realtime (opsional) | Socket.io (untuk antrian live) |
| Dokumentasi API | Swagger / Postman Collection |
| Deployment | Docker + Nginx |

> Catatan: jika dibangun lewat Antigravity, sebutkan stack ini secara eksplisit di prompt awal supaya generator konsisten (misal: "React + Express + MySQL + JWT").

---

## 3. Struktur Folder Project

```
simpus/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/          # Button, Modal, Table, Input, dll
│   │   │   ├── layout/          # Sidebar, Navbar, Footer
│   │   │   └── forms/
│   │   ├── pages/
│   │   │   ├── auth/            # Login, ForgotPassword
│   │   │   ├── dashboard/
│   │   │   ├── pendaftaran/
│   │   │   ├── rekam-medis/
│   │   │   ├── poli/
│   │   │   ├── farmasi/
│   │   │   ├── laboratorium/
│   │   │   ├── kasir/
│   │   │   ├── laporan/
│   │   │   └── pengaturan/
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   ├── services/            # axios api calls
│   │   ├── store/                # zustand/redux store
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── context/              # AuthContext, RoleContext
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/               # db.js, env.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── pasienController.js
│   │   │   ├── pendaftaranController.js
│   │   │   ├── rekamMedisController.js
│   │   │   ├── obatController.js
│   │   │   ├── resepController.js
│   │   │   ├── laboratoriumController.js
│   │   │   ├── kasirController.js
│   │   │   ├── laporanController.js
│   │   │   └── userController.js
│   │   ├── routes/
│   │   │   └── (1 file per modul, sama nama dgn controller)
│   │   ├── models/                # Prisma schema / Sequelize model
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   └── package.json
│
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── simpus.sql                # backup/dump awal
│
├── docs/
│   ├── api-collection.json        # Postman/Swagger
│   └── erd.png
│
├── docker-compose.yml
└── README.md
```

---

## 4. Role & Hak Akses (RBAC)

| Role | Akses |
|---|---|
| **Admin** | Full akses: kelola user, master data, laporan |
| **Pendaftaran (Front Office)** | Input pasien baru, buat antrian, registrasi kunjungan |
| **Dokter/Perawat (Poli)** | Lihat antrian poli, isi rekam medis, buat resep, rujukan |
| **Apoteker (Farmasi)** | Lihat resep masuk, kelola stok obat, serahkan obat |
| **Laboran** | Input permintaan & hasil lab |
| **Kasir** | Proses pembayaran (umum/BPJS), cetak kwitansi |
| **Kepala Puskesmas / Pimpinan** | Lihat dashboard & laporan saja (read-only) |

---

## 5. Daftar Menu Aplikasi

1. **Dashboard**
   - Statistik kunjungan harian/bulanan
   - Grafik 10 penyakit terbanyak
   - Status antrian real-time

2. **Pendaftaran**
   - Pasien Baru (data diri, NIK, KK, BPJS/Umum)
   - Pencarian pasien lama
   - Buat kunjungan & pilih poli tujuan
   - Cetak nomor antrian

3. **Rekam Medis**
   - Anamnesa (keluhan, riwayat)
   - Pemeriksaan fisik (TTV: tensi, suhu, nadi, dll)
   - Diagnosa (ICD-10)
   - Tindakan medis
   - Resep obat
   - Rujukan internal (ke lab/poli lain) & eksternal (rujuk RS)
   - Riwayat rekam medis pasien (timeline)

4. **Poli / Antrian**
   - Antrian per poli (Poli Umum, KIA, Gigi, dll)
   - Panggil pasien
   - Status: menunggu / diperiksa / selesai

5. **Farmasi**
   - Data master obat (nama, satuan, stok, harga, kadaluarsa)
   - Resep masuk dari dokter
   - Penyerahan obat & pengurangan stok otomatis
   - Stok minimum & alert kadaluarsa
   - Penerimaan obat (dari gudang/supplier)

6. **Laboratorium**
   - Permintaan pemeriksaan dari dokter
   - Input hasil lab
   - Cetak hasil lab

7. **Kasir / Pembayaran**
   - Rincian biaya (tindakan + obat)
   - Pembayaran tunai/non-tunai
   - Klaim BPJS (jika ada)
   - Cetak kwitansi

8. **Laporan**
   - Laporan kunjungan (LB1, LB3 jika perlu standar dinkes)
   - Laporan 10 penyakit terbanyak
   - Laporan stok & penggunaan obat
   - Laporan keuangan/kasir
   - Export PDF/Excel

9. **Master Data**
   - Data Poli
   - Data Obat
   - Data Tenaga Medis
   - Data Tarif Layanan
   - Data Wilayah (Desa/Kelurahan)

10. **Pengaturan**
    - Manajemen User & Role
    - Profil Puskesmas (logo, alamat, kop surat cetak)
    - Backup database

11. **Autentikasi**
    - Login (role-based redirect)
    - Lupa password
    - Logout

---

## 6. Alur Aplikasi (User Flow Singkat)

```
Pasien datang
   ↓
[Pendaftaran] → input data / cari pasien lama → pilih poli → cetak antrian
   ↓
[Poli] → dokter panggil sesuai antrian → isi rekam medis → buat resep (jika perlu)
   ↓
   ├──→ [Laboratorium] (jika ada rujukan lab) → hasil lab kembali ke dokter
   ↓
[Farmasi] → resep diproses → obat diserahkan → stok berkurang
   ↓
[Kasir] → hitung total biaya (tindakan + obat) → bayar → cetak kwitansi
   ↓
Selesai → data tersimpan di Laporan
```

---

## 7. Skema Database (ERD - Tabel Utama)

```
users
 ├─ id, nama, username, password, role, status

pasien
 ├─ id, no_rm (auto), nik, nama, tgl_lahir, jenis_kelamin,
 ├─ alamat, no_hp, jenis_pasien (umum/bpjs), no_bpjs

kunjungan
 ├─ id, pasien_id (FK), poli_id (FK), tgl_kunjungan,
 ├─ no_antrian, status (menunggu/diperiksa/selesai)

rekam_medis
 ├─ id, kunjungan_id (FK), anamnesa, ttv (json: tensi/suhu/nadi),
 ├─ diagnosa, kode_icd10, tindakan, dokter_id (FK)

resep
 ├─ id, rekam_medis_id (FK), status (baru/diproses/selesai)

resep_detail
 ├─ id, resep_id (FK), obat_id (FK), jumlah, dosis, aturan_pakai

obat
 ├─ id, nama_obat, satuan, stok, harga, tgl_kadaluarsa, kategori

laboratorium
 ├─ id, rekam_medis_id (FK), jenis_pemeriksaan, hasil, status

poli
 ├─ id, nama_poli, kode_poli

pembayaran
 ├─ id, kunjungan_id (FK), total_tindakan, total_obat,
 ├─ total_bayar, metode_bayar, status, kasir_id (FK)

tarif_layanan
 ├─ id, nama_layanan, harga

roles
 ├─ id, nama_role, permissions (json)
```

> Relasi inti: `pasien` 1—N `kunjungan` 1—1 `rekam_medis` 1—N `resep` → `resep_detail` → `obat`; `kunjungan` 1—1 `pembayaran`.

---

## 8. Daftar Endpoint API (Garis Besar)

```
AUTH
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

PASIEN
GET    /api/pasien
POST   /api/pasien
GET    /api/pasien/:id
PUT    /api/pasien/:id

KUNJUNGAN / ANTRIAN
POST   /api/kunjungan
GET    /api/kunjungan?status=menunggu&poli_id=
PUT    /api/kunjungan/:id/status

REKAM MEDIS
POST   /api/rekam-medis
GET    /api/rekam-medis/:kunjungan_id
GET    /api/rekam-medis/riwayat/:pasien_id

RESEP & FARMASI
POST   /api/resep
GET    /api/resep?status=baru
PUT    /api/resep/:id/serahkan
GET    /api/obat
POST   /api/obat
PUT    /api/obat/:id/stok

LABORATORIUM
POST   /api/laboratorium
PUT    /api/laboratorium/:id/hasil

KASIR
GET    /api/pembayaran/:kunjungan_id
POST   /api/pembayaran

LAPORAN
GET    /api/laporan/kunjungan?periode=
GET    /api/laporan/penyakit-terbanyak
GET    /api/laporan/stok-obat
```

---

## 9. Environment Variables (.env)

**Backend**
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=simpus
DB_USER=root
DB_PASS=
JWT_SECRET=ubah_dengan_secret_anda
JWT_EXPIRES_IN=8h
```

**Frontend**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 10. Roadmap Pengembangan (Urutan Build yang Disarankan)

1. Setup project (frontend + backend) & koneksi database
2. Autentikasi & RBAC (login, middleware role)
3. Master data (poli, obat, tarif, user)
4. Modul Pendaftaran & Antrian
5. Modul Rekam Medis
6. Modul Farmasi (resep + stok obat)
7. Modul Laboratorium
8. Modul Kasir/Pembayaran
9. Modul Laporan & Dashboard
10. Testing, polishing UI, deployment (Docker)

---

## 11. Catatan untuk Prompt di Antigravity

Saat membangun per-modul di Antigravity, sebaiknya prompt mengacu ke bagian dokumen ini, contoh:

> "Buatkan modul Pendaftaran sesuai struktur folder `frontend/src/pages/pendaftaran` dan endpoint `/api/kunjungan` pada README ini, dengan field sesuai tabel `pasien` dan `kunjungan`."

Ini membuat hasil generate AI konsisten dengan struktur yang sudah direncanakan, dan tidak melenceng dari ERD/struktur folder di atas.