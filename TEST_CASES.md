# Dokumen Skenario & Test Case Pengujian (Test Scenarios & Detailed Test Cases)
# E-Learning Kampus — Learning Management System (LMS) Universitas

**Team Membangun Negeri — Rekayasa Perangkat Lunak 2026**  
**Acuan:** [SRS.md](SRS.md) · [TEST_PLAN.md](TEST_PLAN.md) · [QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md) · [openapi.yaml](backend/docs/openapi.yaml)  
**Versi:** 1.0 | **Tanggal:** 26 November 2026 | **Status:** Siap Eksekusi  

---

## 1. Ringkasan & Konvensi Pengujian

Dokumen ini memuat **Skenario Pengujian Tingkat Tinggi (*High-Level Test Scenarios*)** dan **Langkah-Langkah Detail Pengujian (*Detailed Test Cases*)** untuk sistem LMS E-Learning Kampus dengan 3 peran pengguna (**Admin**, **Dosen**, **Mahasiswa**).

### Konvensi Atribut Test Case:
- **Test ID**: Pengidentifikasi unik test case (format: `TC-<MODUL>-<NOMOR>`).
- **Prioritas**: `P0` (Blocker), `P1` (Kritis), `P2` (Mayor), `P3` (Minor).
- **Precondition (Prasyarat)**: Keadaan sistem, akun, atau basis data yang wajib dipenuhi sebelum pengujian dimulai.
- **Test Steps (Langkah Pengujian)**: Urutan tindakan terperinci yang dieksekusi penguji.
- **Test Data (Data Uji)**: Nilai input konkret, kredensial, berkas, atau payload JSON.
- **Expected Result (Hasil yang Diharapkan)**: Perilaku sistem yang sah (status kode HTTP, pesan respons, perubahan DB, tampilan antarmuka).
- **Actual Result (Hasil Aktual)**: Catatan hasil eksekusi nyata (`[Pass / Fail / Blocked] - Catatan bukti log/respons`).

### Akun Uji Standar (Seeder Bawaan - Password: `password123`):
- **Admin**: `username: admin`, `email: admin@kampus.ac.id`
- **Dosen**: `nip/nidn: 198501152010121002` (Dr. Budi Santoso), `199003202015042001`, `197805102003122001`
- **Mahasiswa**: `nim: 2024001001` (Ahmad Dahlan), `2024001002`, `2024001003` s.d. `2024001010`
- **Prefix Data Uji Buatan Tester**: `QA-<TANGGAL>-<NOMOR>` (misal: `QA-2611-01`).

---

## 2. Skenario Pengujian Tingkat Tinggi (High-Level Test Scenarios)

| Scenario ID | Modul / Fitur | Deskripsi Skenario Pengujian Tingkat Tinggi | Cakupan Target |
| :--- | :--- | :--- | :--- |
| **TS-AUTH** | Autentikasi & Manajemen Sesi | Memvalidasi seluruh alur masuk sistem dengan berbagai jenis pengenal (username, email, NIM, NIDN/NIP), pengelolaan token JWT (access & refresh), pemulihan kata sandi, pencabutan sesi saat keluar, serta proteksi terhadap serangan *user enumeration* dan *brute force*. | FR-001 s.d. FR-004, NFR-001, NFR-002 |
| **TS-PROF** | Profil Mandiri & Berkas Avatar | Memvalidasi pengelolaan data diri pengguna mandiri, pengunggahan foto avatar privat (tipe file, limit ukuran 2MB), penghapusan berkas lama fisik, dan akses *streaming* terproteksi tanpa ekspos URL publik. | FR-005 s.d. FR-008, NFR-003, NFR-005 |
| **TS-USER** | Manajemen Pengguna (Admin) | Memvalidasi operasi CRUD akun 3 role, filter & paginasi data, pencarian multi-kolom, aktivasi/penonaktifan/penangguhan status akun, serta reset kata sandi paksa oleh Admin dengan pencabutan sesi aktif target. | FR-044, FR-045, FR-058 |
| **TS-CRSE** | Master Mata Kuliah | Memvalidasi pengelolaan master katalog mata kuliah, validasi batas SKS (1–6), konversi otomatis kode mata kuliah menjadi huruf kapital, dan mekanisme *soft-deactivation* tanpa merusak data riwayat kelas. | FR-046, BR-004 |
| **TS-CLSS** | Pembukaan Kelas Perkuliahan | Memvalidasi pembuatan kelas semester berjalan, verifikasi dosen pengampu aktif, format tahun akademik (`YYYY/YYYY`), validasi batas kapasitas kelas, dan otomatisasi *generasi* 16 pertemuan terstruktur (P-8 UTS, P-16 UAS). | FR-047, FR-048, BR-001 |
| **TS-ENRL** | Direct Enrollment Mahasiswa | Memvalidasi pendaftaran mahasiswa ke dalam kelas oleh Admin tanpa alur KRS manual, pencegahan pendaftaran ganda (*unique enrollment*), validasi kuota kapasitas kelas, dan pencabutan status kepesertaan (*unenroll*). | FR-021, BR-002 |
| **TS-MTNG** | Ruang Kelas & 16 Pertemuan | Memvalidasi visibilitas dan pengelolaan 16 pertemuan mingguan pada kelas perkuliahan, pembaruan judul/topik/deskripsi/tanggal pertemuan, serta pengaturan status rilis (*published / draft*). | FR-013, FR-014, FR-030 |
| **TS-MATR** | Distribusi Materi Perkuliahan | Memvalidasi pengunggahan berkas bahan ajar oleh dosen (filter tipe `.pdf`, `.docx`, `.xlsx`, `.zip` dan limit $\le$ 10MB), pengunduhan terproteksi bagi mahasiswa peserta kelas, dan penolakan akses bagi pengguna di luar kelas. | FR-015, FR-031, NFR-003, NFR-005 |
| **TS-ATTN** | Presensi Digital & Rekap Matriks | Memvalidasi alur pembukaan dan penutupan sesi presensi oleh dosen, pencatatan check-in mahasiswa dengan validasi status sesi (*OPEN*), *auto-close* berbasis batas toleransi waktu, dan akurasi matriks 16 pertemuan beserta persentase kehadiran. | FR-023 s.d. FR-039, BR-003 |
| **TS-DASH** | Dasbor Kontekstual | Memvalidasi antarmuka dan penyajian metrik terintegrasi sesuai role aktif (Admin: ringkasan sistem; Dosen: kelas ajar & presensi; Mahasiswa: kelas terdaftar & status kehadiran). | FR-011, FR-012, FR-043 |
| **TS-AUDT** | Jejak Audit (Audit Trail Engine) | Memvalidasi pencatatan otomatis seluruh mutasi data kritis (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, RESET_PASSWORD) ke tabel audit log yang bersifat *immutable* (tidak dapat diubah/dihapus) beserta filter dan paginasinya. | FR-049 s.d. FR-052, NFR-009 |
| **TS-SECR** | Keamanan HTTP & Hardening | Memvalidasi header keamanan HTTP (Helmet), CORS *origin white-listing*, *rate limiting* (login & API publik), proteksi *parameterized queries* (anti-SQL Injection), sanitasi input (anti-XSS), dan *path traversal prevention*. | NFR-001 s.d. NFR-008 |

---

## 3. Langkah-Langkah Detail Pengujian (Detailed Test Cases)

### Modul 1: Autentikasi & Manajemen Sesi (TS-AUTH)

#### TC-AUTH-01: Login Mahasiswa Menggunakan NIM Valid
- **Scenario Ref**: TS-AUTH
- **Prioritas**: P0 (Blocker)
- **Precondition**: Basis data terisi akun seeder mahasiswa aktif dengan NIM `2024001001` dan password `password123`.
- **Test Steps**:
  1. Siapkan HTTP client (Postman/cURL) atau buka form login.
  2. Kirim request HTTP POST ke endpoint `http://localhost:5000/api/auth/login`.
  3. Masukkan payload body JSON dengan identifier NIM dan kata sandi yang valid.
  4. Periksa kode status HTTP dan isi body respons.
- **Test Data**:
  ```json
  {
    "identifier": "2024001001",
    "password": "password123"
  }
  ```
- **Expected Result**:
  - HTTP Status: `200 OK`.
  - Body respons: `"success": true`, `"data.accessToken"` dan `"data.refreshToken"` berupa string JWT valid.
  - Objek `"data.user"` berisi `role: "mahasiswa"` dan data spesifik mahasiswa (`nim: "2024001001"`).
  - Kolom `last_login_at` pada tabel `users` diperbarui dengan timestamp saat ini.
- **Actual Result**: `[Menunggu Eksekusi]` 

---

#### TC-AUTH-02: Login Dosen Menggunakan NIDN Valid
- **Scenario Ref**: TS-AUTH
- **Prioritas**: P0 (Blocker)
- **Precondition**: Akun dosen aktif dengan NIDN `198501152010121002` telah terdaftar di database.
- **Test Steps**:
  1. Kirim request HTTP POST ke `/api/auth/login`.
  2. Masukkan payload JSON dengan NIDN pada field `identifier` dan password valid.
  3. Validasi status dan isi objek pengguna pada respons.
- **Test Data**:
  ```json
  {
    "identifier": "198501152010121002",
    "password": "password123"
  }
  ```
- **Expected Result**:
  - HTTP Status: `200 OK`.
  - Body: `"success": true`, token JWT dikembalikan.
  - Objek `"data.user.role"` bernilai `"dosen"`, `"data.user.dosen.nidn"` terisi `"198501152010121002"`.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-AUTH-03: Login dengan Kata Sandi Salah (Proteksi Anti-Enumerasi)
- **Scenario Ref**: TS-AUTH
- **Prioritas**: P1 (Kritis)
- **Precondition**: Akun `admin` terdaftar di database.
- **Test Steps**:
  1. Kirim request HTTP POST ke `/api/auth/login`.
  2. Masukkan identifier yang valid (`admin`) tetapi password salah (`PasswordSalah!23`).
  3. Uji kembali dengan identifier yang sama sekali tidak ada di sistem (`akun.hantu999`).
  4. Bandingkan kedua pesan error respons.
- **Test Data**:
  - Data Uji 1: `{"identifier": "admin", "password": "PasswordSalah!23"}`
  - Data Uji 2: `{"identifier": "akun.hantu999", "password": "PasswordSalah!23"}`
- **Expected Result**:
  - HTTP Status: `401 Unauthorized`.
  - Pesan error pada kedua uji identik (misal: `"Kredensial yang diberikan tidak valid"`).
  - Sistem tidak membocorkan apakah identifier terdaftar atau tidak (mencegah *User Enumeration*).
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-AUTH-04: Login Akun Berstatus Nonaktif (INACTIVE / SUSPENDED)
- **Scenario Ref**: TS-AUTH
- **Prioritas**: P1 (Kritis)
- **Precondition**: Akun user uji dengan id tertentu diubah statusnya menjadi `SUSPENDED` oleh admin.
- **Test Steps**:
  1. Kirim request HTTP POST ke `/api/auth/login`.
  2. Masukkan identifier dan password yang benar untuk akun yang di-suspend tersebut.
  3. Verifikasi penolakan login oleh sistem.
- **Test Data**:
  ```json
  {
    "identifier": "qa.suspended.user",
    "password": "password123"
  }
  ```
- **Expected Result**:
  - HTTP Status: `403 Forbidden`.
  - Pesan respons: menyebutkan bahwa akun sedang ditangguhkan/nonaktif dan mengarahkan untuk menghubungi administrator.
  - Token JWT tidak diterbitkan.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-AUTH-05: Refresh Access Token Menggunakan Refresh Token Valid
- **Scenario Ref**: TS-AUTH
- **Prioritas**: P0 (Blocker)
- **Precondition**: Pengguna telah berhasil login dan memiliki string `refreshToken` aktif.
- **Test Steps**:
  1. Kirim request HTTP POST ke `/api/auth/refresh`.
  2. Masukkan refresh token pada body payload JSON.
  3. Periksa token baru yang diterbitkan.
- **Test Data**:
  ```json
  {
    "refreshToken": "<VALID_REFRESH_TOKEN_DARI_LOGIN>"
  }
  ```
- **Expected Result**:
  - HTTP Status: `200 OK`.
  - Body respons: memuat `data.accessToken` baru yang valid dan siap digunakan untuk memanggil endpoint terproteksi.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-AUTH-06: Logout dan Pencabutan Token (Revocation)
- **Scenario Ref**: TS-AUTH
- **Prioritas**: P1 (Kritis)
- **Precondition**: Sesi login aktif, memiliki `accessToken` dan `refreshToken`.
- **Test Steps**:
  1. Kirim request HTTP POST ke `/api/auth/logout` dengan header `Authorization: Bearer <accessToken>` dan body payload `{"refreshToken": "<refreshToken>"}`.
  2. Pastikan respons logout sukses diterima.
  3. Kirim kembali request HTTP POST ke `/api/auth/refresh` menggunakan `refreshToken` yang baru saja di-logout tersebut.
- **Test Data**:
  - Header: `Authorization: Bearer eyJhbGciOi...`
  - Body: `{"refreshToken": "eyJhbGciOi..."}`
- **Expected Result**:
  - Langkah 1: HTTP Status `200 OK`, pesan sukses logout.
  - Langkah 3: HTTP Status `401 Unauthorized` dengan pesan bahwa token telah dicabut/tidak valid.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-AUTH-07: Permintaan Lupa Password (Forgot Password)
- **Scenario Ref**: TS-AUTH
- **Prioritas**: P2 (Mayor)
- **Precondition**: Server berjalan normal.
- **Test Steps**:
  1. Kirim request HTTP POST ke `/api/auth/forgot-password` dengan identifier yang terdaftar.
  2. Kirim request HTTP POST kedua dengan identifier yang tidak terdaftar.
  3. Amati status HTTP dan pesan respons dari kedua kasus.
- **Test Data**:
  - Kasus 1: `{"identifier": "2024001001"}`
  - Kasus 2: `{"identifier": "9999999999"}`
- **Expected Result**:
  - Kedua kasus mengembalikan HTTP Status `200 OK`.
  - Respons menampilkan pesan generik yang sama: `"Jika akun Anda terdaftar pada sistem, instruksi reset kata sandi telah dikirimkan."`
  - Tercatat entri audit log `FORGOT_PASSWORD_REQUEST` di basis data.
- **Actual Result**: `[Menunggu Eksekusi]`

---

### Modul 2: Profil Pengguna Mandiri & Berkas Avatar (TS-PROF)

#### TC-PROF-01: Melihat Profil Mandiri (Role Mahasiswa/Dosen/Admin)
- **Scenario Ref**: TS-PROF
- **Prioritas**: P1 (Kritis)
- **Precondition**: Pengguna telah login dan memiliki access token valid.
- **Test Steps**:
  1. Pasang header `Authorization: Bearer <accessToken_mahasiswa>`.
  2. Kirim request HTTP GET ke `/api/profile`.
  3. Verifikasi data profil yang dikembalikan.
- **Test Data**: Token mahasiswa `2024001001`.
- **Expected Result**:
  - HTTP Status: `200 OK`.
  - Body respons memuat profil lengkap: `username`, `email`, `role`, objek `profile` (`full_name`, `phone`, `bio`), dan data spesifik `mahasiswa` (`nim`, `prodi`, `angkatan`).
  - Tidak ada data sensitif seperti `password_hash` yang bocor pada respons.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-PROF-02: Memperbarui Informasi Kontak & Bio Profil
- **Scenario Ref**: TS-PROF
- **Prioritas**: P2 (Mayor)
- **Precondition**: Pengguna login dengan token valid.
- **Test Steps**:
  1. Kirim request HTTP PUT ke `/api/profile`.
  2. Kirimkan perubahan data `full_name`, `phone`, dan `bio`.
  3. Cek respons dan verifikasi data di database.
- **Test Data**:
  ```json
  {
    "full_name": "Ahmad Dahlan QA Updated",
    "phone": "081298765432",
    "bio": "Mahasiswa aktif peminatan Rekayasa Perangkat Lunak."
  }
  ```
- **Expected Result**:
  - HTTP Status: `200 OK`.
  - Data profil terupdate secara persisten.
  - Tercatat entri audit log `UPDATE_PROFILE` yang memuat rekaman nilai lama (`old_values`) dan baru (`new_values`).
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-PROF-03: Unggah Avatar Valid (.PNG Ukuran < 2MB)
- **Scenario Ref**: TS-PROF
- **Prioritas**: P1 (Kritis)
- **Precondition**: File gambar valid `avatar_sample.png` berukuran 450 KB siap diunggah.
- **Test Steps**:
  1. Kirim request HTTP POST ke `/api/profile/avatar` dengan `Content-Type: multipart/form-data`.
  2. Lampirkan berkas pada field form `avatar`.
  3. Periksa status dan respons server.
- **Test Data**: File `avatar_sample.png` (450 KB, MIME: `image/png`).
- **Expected Result**:
  - HTTP Status: `200 OK`.
  - Body respons mengonfirmasi foto avatar berhasil diunggah.
  - File disimpan pada direktori penyimpanan privat (`backend/storage/private/avatars/`) dengan penamaan hash UUID aman (mencegah bentrok dan *path traversal*).
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-PROF-04: Unggah Avatar Ditolak Karena Melebihi Batas Ukuran (> 2MB)
- **Scenario Ref**: TS-PROF
- **Prioritas**: P1 (Kritis)
- **Precondition**: File gambar `avatar_large.jpg` dengan ukuran 3.2 MB siap diuji.
- **Test Steps**:
  1. Kirim request HTTP POST multipart/form-data ke `/api/profile/avatar`.
  2. Unggah file `avatar_large.jpg` pada field `avatar`.
  3. Amati respons penolakan dari Multer / filter aplikasi.
- **Test Data**: File `avatar_large.jpg` (ukuran 3.2 MB).
- **Expected Result**:
  - HTTP Status: `400 Bad Request` (atau `413 Payload Too Large`).
  - Pesan error: `"Ukuran berkas melebihi batas maksimal 2MB"`.
  - Berkas fisik tidak tersimpan di direktori storage.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-PROF-05: Pengunduhan Streaming Avatar Terproteksi
- **Scenario Ref**: TS-PROF
- **Prioritas**: P1 (Kritis)
- **Precondition**: Pengguna telah mengunggah avatar pada TC-PROF-03.
- **Test Steps**:
  1. Kirim request HTTP GET ke `/api/profile/avatar` dengan menyertakan token otentikasi.
  2. Coba akses URL file fisik langsung tanpa token melalui browser (`http://localhost:5000/storage/private/avatars/...`).
- **Test Data**: Header `Authorization: Bearer <accessToken>`.
- **Expected Result**:
  - Request dengan token: HTTP Status `200 OK`, header `Content-Type: image/png`, body berupa streaming biner gambar.
  - Akses URL langsung tanpa otentikasi: HTTP Status `404 Not Found` (direktori privat tidak di-serve secara publik/statis).
- **Actual Result**: `[Menunggu Eksekusi]`

---

### Modul 3: Manajemen Pengguna oleh Admin (TS-USER)

#### TC-USER-01: Admin Membuat Pengguna Baru (Role Dosen)
- **Scenario Ref**: TS-USER
- **Prioritas**: P0 (Blocker)
- **Precondition**: Admin login dan memiliki access token admin valid.
- **Test Steps**:
  1. Pasang header `Authorization: Bearer <adminToken>`.
  2. Kirim request HTTP POST ke `/api/admin/users`.
  3. Masukkan payload pembuatan dosen baru lengkap dengan NIDN dan NIP.
- **Test Data**:
  ```json
  {
    "username": "qa.dosen.baru",
    "email": "qa.dosen.baru@kampus.ac.id",
    "password": "PasswordKuat123!",
    "role": "dosen",
    "full_name": "Dosen QA Baru, M.Kom.",
    "nidn": "0012059001",
    "nip": "199005122020011001",
    "gelar_depan": "Dr.",
    "gelar_belakang": "M.Kom."
  }
  ```
- **Expected Result**:
  - HTTP Status: `201 Created`.
  - Body respons memuat data user yang baru dibuat dengan `role: "dosen"`.
  - Record relasi `dosen` dan `profile` terbuat di database.
  - Audit log mencatat aksi `CREATE_USER`.
- **Actual Result**: `[Menunggu Eksekusi]`

#### TC-USER-02: Pembuatan Pengguna Gagal Karena Validasi Data Mandatori Tidak Lengkap
- **Scenario Ref**: TS-USER
- **Prioritas**: P2 (Mayor)
- **Precondition**: Admin login.
- **Test Steps**:
  1. Kirim request HTTP POST ke `/api/admin/users` untuk membuat mahasiswa, namun field wajib `nim`, `prodi`, dan `angkatan` dikosongkan.
- **Test Data**:
  ```json
  {
    "username": "qa.mhs.kurang",
    "email": "qa.mhs.kurang@kampus.ac.id",
    "password": "PasswordKuat123!",
    "role": "mahasiswa",
    "full_name": "Mahasiswa Kurang Field"
  }
  ```
- **Expected Result**:
  - HTTP Status: `400 Bad Request`.
  - Body respons memuat daftar error validasi Zod (`errors[]`) yang secara spesifik menunjukkan field `nim`, `prodi`, dan `angkatan` wajib diisi untuk role mahasiswa.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-USER-03: Filter, Pencarian, dan Paginasi Daftar Pengguna
- **Scenario Ref**: TS-USER
- **Prioritas**: P2 (Mayor)
- **Precondition**: Minimal terdapat 10 data pengguna di database.
- **Test Steps**:
  1. Kirim request HTTP GET ke `/api/admin/users?page=1&limit=5&role=mahasiswa&search=Ahmad`.
  2. Verifikasi jumlah data pada array `data` dan informasi pada metadata paginasi.
- **Test Data**: Parameter query: `page=1`, `limit=5`, `role=mahasiswa`, `search=Ahmad`.
- **Expected Result**:
  - HTTP Status: `200 OK`.
  - Array `data` mengembalikan paling banyak 5 elemen.
  - Setiap elemen di dalam array memiliki `role: "mahasiswa"` dan mengandung kata "Ahmad" pada nama, username, atau email.
  - Objek `meta` memuat: `page: 1`, `limit: 5`, `total`, `totalPages`, `hasNextPage`, `hasPrevPage`.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-USER-04: Admin Melakukan Reset Password Paksa Terhadap Pengguna
- **Scenario Ref**: TS-USER
- **Prioritas**: P1 (Kritis)
- **Precondition**: Terdapat akun mahasiswa target `2024001001` dengan sesi aktif.
- **Test Steps**:
  1. Admin mengirimkan request HTTP PUT ke `/api/admin/users/:userId/reset-password`.
  2. Masukkan kata sandi baru yang memenuhi standar keamanan.
  3. Mahasiswa mencoba melakukan refresh token dengan refresh token lama miliknya.
  4. Mahasiswa melakukan login dengan kata sandi baru.
- **Test Data**:
  ```json
  {
    "newPassword": "KataSandiBaru!2026"
  }
  ```
- **Expected Result**:
  - HTTP Status: `200 OK`.
  - Seluruh sesi token lama mahasiswa dicabut seketika (refresh token lama menghasilkan `401 Unauthorized`).
  - Mahasiswa berhasil login menggunakan kata sandi baru `"KataSandiBaru!2026"`.
  - Audit log mencatat `RESET_PASSWORD` dengan metadata `reset_by_admin: true`.
- **Actual Result**: `[Menunggu Eksekusi]`

---

### Modul 4: Master Mata Kuliah (TS-CRSE)

#### TC-CRSE-01: Admin Membuat Mata Kuliah Baru dengan Validasi Kode Otomatis Huruf Kapital
- **Scenario Ref**: TS-CRSE
- **Prioritas**: P1 (Kritis)
- **Precondition**: Admin login.
- **Test Steps**:
  1. Kirim request HTTP POST ke `/api/admin/courses`.
  2. Masukkan kode mata kuliah dalam huruf kecil (`tif201`).
- **Test Data**:
  ```json
  {
    "code": "tif201",
    "name": "Arsitektur Perangkat Lunak",
    "credits": 3,
    "description": "Mata kuliah wajib keahlian rekayasa sistem."
  }
  ```
- **Expected Result**:
  - HTTP Status: `201 Created`.
  - Nilai field `code` pada basis data dan respons otomatis dikonversi menjadi huruf kapital: `"TIF201"`.
  - Mata kuliah tersimpan dengan `is_active: true`.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-CRSE-02: Validasi Batas Kredit SKS (Di luar Batas 1–6 SKS Ditolak)
- **Scenario Ref**: TS-CRSE
- **Prioritas**: P2 (Mayor)
- **Precondition**: Admin login.
- **Test Steps**:
  1. Kirim request HTTP POST ke `/api/admin/courses` dengan `credits: 0`.
  2. Kirim request kedua dengan `credits: 7`.
- **Test Data**:
  - Data Uji 1: `{"code": "QA001", "name": "Uji Nol SKS", "credits": 0}`
  - Data Uji 2: `{"code": "QA002", "name": "Uji Lebih SKS", "credits": 7}`
- **Expected Result**:
  - Kedua request menghasilkan HTTP Status `400 Bad Request`.
  - Pesan error menjelaskan bahwa bobot SKS harus berada dalam rentang bilangan bulat 1 sampai 6.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-CRSE-03: Penonaktifan Mata Kuliah (Soft-Deactivation)
- **Scenario Ref**: TS-CRSE
- **Prioritas**: P1 (Kritis)
- **Precondition**: Mata kuliah `TIF101` aktif di sistem.
- **Test Steps**:
  1. Admin mengirimkan request HTTP DELETE ke `/api/admin/courses/:courseId`.
  2. Periksa status mata kuliah di database dan melalui endpoint list.
  3. Coba lakukan penonaktifan kedua kalinya untuk mata kuliah yang sama.
- **Test Data**: UUID mata kuliah `TIF101`.
- **Expected Result**:
  - Langkah 1: HTTP Status `200 OK`, pesan mata kuliah dinonaktifkan. Nilai `is_active` berubah menjadi `false` (record tidak dihapus permanen untuk integritas referensial).
  - Langkah 3: HTTP Status `409 Conflict` dengan pesan `"Mata kuliah sudah tidak aktif"`.
- **Actual Result**: `[Menunggu Eksekusi]`

---

### Modul 5: Pembukaan Kelas & 16 Pertemuan Otomatis (TS-CLSS & TS-MTNG)

#### TC-CLSS-01: Admin Membuka Kelas Baru dan Memverifikasi Auto-Generate 16 Pertemuan
- **Scenario Ref**: TS-CLSS, TS-MTNG
- **Prioritas**: P0 (Blocker)
- **Precondition**: Mata kuliah aktif dan dosen pengampu aktif telah tersedia.
- **Test Steps**:
  1. Admin mengirim request HTTP POST ke `/api/admin/classes`.
  2. Masukkan parameter kelas, format tahun akademik valid, semester, nama kelas, dan kapasitas.
  3. Ambil `id` kelas yang terbentuk dari respons.
  4. Kirim request HTTP GET ke `/api/classes/:classId/meetings` menggunakan token dosen pengampu kelas tersebut.
- **Test Data**:
  ```json
  {
    "course_id": "<UUID_COURSE_TIF101>",
    "lecturer_id": "<UUID_DOSEN_BUDI>",
    "academic_year": "2026/2027",
    "semester": "ganjil",
    "name": "TI-QA1",
    "capacity": 35
  }
  ```
- **Expected Result**:
  - Langkah 1: HTTP Status `201 Created`. Data kelas terbentuk dengan relasi dosen dan course.
  - Langkah 4: HTTP Status `200 OK`. Sistem otomatis menghasilkan tepat **16 data pertemuan**:
    - Pertemuan nomor 1 s.d. 7 berstatus materi/pembelajaran reguler.
    - Pertemuan nomor **8** bertipe/berjudul khusus **UTS**.
    - Pertemuan nomor 9 s.d. 15 materi/pembelajaran reguler.
    - Pertemuan nomor **16** bertipe/berjudul khusus **UAS**.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-CLSS-02: Validasi Format Tahun Akademik Ditolak Jika Tidak Sesuai Pola YYYY/YYYY
- **Scenario Ref**: TS-CLSS
- **Prioritas**: P2 (Mayor)
- **Precondition**: Admin login.
- **Test Steps**:
  1. Kirim request HTTP POST ke `/api/admin/classes` dengan nilai tahun akademik `"2026-2027"` (memakai tanda minus) atau `"2026"`.
- **Test Data**: `"academic_year": "2026-2027"`
- **Expected Result**:
  - HTTP Status: `400 Bad Request`.
  - Pesan error: format tahun akademik harus mengikuti pola `YYYY/YYYY` (contoh: `2026/2027`).
- **Actual Result**: `[Menunggu Eksekusi]`

---

### Modul 6: Direct Enrollment Mahasiswa ke Kelas (TS-ENRL)

#### TC-ENRL-01: Admin Mendaftarkan Mahasiswa ke Kelas (Direct Enrollment)
- **Scenario Ref**: TS-ENRL
- **Prioritas**: P0 (Blocker)
- **Precondition**: Kelas `TI-QA1` telah dibuat dan mahasiswa `2024001001` belum terdaftar di kelas tersebut.
- **Test Steps**:
  1. Admin mengirim request HTTP POST ke `/api/admin/enrollments`.
  2. Sertakan `class_id` dan `student_id`.
  3. Mahasiswa login dan memanggil endpoint `GET /api/classes`.
- **Test Data**:
  ```json
  {
    "class_id": "<UUID_KELAS_TI_QA1>",
    "student_id": "<UUID_MAHASISWA_2024001001>"
  }
  ```
- **Expected Result**:
  - Langkah 1: HTTP Status `201 Created`, record enrollment terbentuk.
  - Langkah 3: Kelas `TI-QA1` langsung muncul pada daftar kelas mahasiswa tanpa memerlukan persetujuan KRS manual.
  - Audit log mencatat aksi `ENROLL_STUDENT`.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-ENRL-02: Pencegahan Pendaftaran Duplikat (Unique Enrollment)
- **Scenario Ref**: TS-ENRL
- **Prioritas**: P1 (Kritis)
- **Precondition**: Mahasiswa `2024001001` sudah terdaftar pada kelas `TI-QA1` (TC-ENRL-01 berhasil).
- **Test Steps**:
  1. Admin mengulangi pengiriman request HTTP POST ke `/api/admin/enrollments` dengan pasangan `class_id` dan `student_id` yang sama persis.
- **Test Data**: Sama dengan TC-ENRL-01.
- **Expected Result**:
  - HTTP Status: `409 Conflict`.
  - Pesan error: `"Mahasiswa sudah terdaftar di kelas ini"`.
  - Jumlah peserta di kelas tidak bertambah.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-ENRL-03: Penolakan Pendaftaran Ketika Kapasitas Kelas Penuh
- **Scenario Ref**: TS-ENRL
- **Prioritas**: P1 (Kritis)
- **Precondition**: Kelas memiliki `capacity: 1` dan sudah terisi 1 mahasiswa terdaftar.
- **Test Steps**:
  1. Admin mencoba mendaftarkan mahasiswa kedua ke kelas tersebut.
- **Test Data**: `class_id` kelas kapasitas 1, `student_id` mahasiswa lain.
- **Expected Result**:
  - HTTP Status: `409 Conflict`.
  - Pesan error: `"Kapasitas kelas telah penuh"`.
- **Actual Result**: `[Menunggu Eksekusi]`

---

### Modul 7: Distribusi Materi Pembelajaran (TS-MATR)

#### TC-MATR-01: Dosen Mengunggah Materi Kuliah Valid (.PDF Ukuran < 10MB)
- **Scenario Ref**: TS-MATR
- **Prioritas**: P0 (Blocker)
- **Precondition**: Dosen pengampu kelas telah login. Tersedia pertemuan nomor 1 pada kelas tersebut.
- **Test Steps**:
  1. Pasang header `Authorization: Bearer <dosenToken>`.
  2. Kirim request HTTP POST multipart/form-data ke `/api/materials`.
  3. Lampirkan berkas `modul_01.pdf` (ukuran 2.5 MB) pada form field `file`, dan data metadata `meeting_id`, `title`, dan `description`.
- **Test Data**:
  - Form Fields: `meeting_id: "<UUID_MEETING_1>"`, `title: "Pengenalan Arsitektur Software"`, `description: "Modul acuan pertemuan 1"`
  - Attached File: `modul_01.pdf` (2.5 MB)
- **Expected Result**:
  - HTTP Status: `201 Created`.
  - Berkas fisik tersimpan di direktori storage privat dengan nama unik.
  - Record materi tersimpan dan terasosiasi dengan pertemuan nomor 1.
  - Audit log mencatat entri `CREATE_MATERIAL`.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-MATR-02: Penolakan Unggah Materi dengan Ekstensi Berbahaya / Tidak Didukung (.EXE)
- **Scenario Ref**: TS-MATR
- **Prioritas**: P0 (Blocker / Security)
- **Precondition**: Dosen pengampu login.
- **Test Steps**:
  1. Kirim request HTTP POST multipart ke `/api/materials`.
  2. Unggah file bernama `installer.exe`.
- **Test Data**: File `installer.exe` (MIME application/x-msdownload).
- **Expected Result**:
  - HTTP Status: `400 Bad Request`.
  - Pesan error: format berkas tidak didukung (sistem hanya mengizinkan `.pdf`, `.docx`, `.xlsx`, `.zip`).
  - Berkas ditolak sebelum disimpan ke filesystem.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-MATR-03: Mahasiswa Bukan Peserta Kelas Ditolak Saat Mengunduh Materi (403 Forbidden)
- **Scenario Ref**: TS-MATR
- **Prioritas**: P0 (Blocker / Security)
- **Precondition**: Materi telah diunggah pada kelas `TI-QA1`. Terdapat mahasiswa `2024001009` yang **TIDAK** dienroll di kelas tersebut.
- **Test Steps**:
  1. Mahasiswa `2024001009` login dan mendapatkan access token.
  2. Kirim request HTTP GET ke `/api/materials/:materialId/download` dengan header Authorization mahasiswa tersebut.
- **Test Data**: Token mahasiswa non-peserta kelas.
- **Expected Result**:
  - HTTP Status: `403 Forbidden`.
  - Pesan respons: `"Anda tidak memiliki hak akses terhadap materi kelas ini"`.
  - Streaming biner berkas diblokir sepenuhnya.
- **Actual Result**: `[Menunggu Eksekusi]`

---

### Modul 8: Presensi Digital & Rekap Matriks Kehadiran (TS-ATTN)

#### TC-ATTN-01: Dosen Membuka Sesi Presensi Perkuliahan
- **Scenario Ref**: TS-ATTN
- **Prioritas**: P0 (Blocker)
- **Precondition**: Dosen pengampu kelas login. Pertemuan 1 belum memiliki sesi presensi aktif.
- **Test Steps**:
  1. Dosen mengirim request HTTP POST ke `/api/attendance/sessions`.
  2. Tentukan `meeting_id`, waktu buka `opened_at`, toleransi keterlambatan dalam menit (`late_tolerance_minutes: 15`), dan durasi sesi dalam menit (`duration_minutes: 90`).
- **Test Data**:
  ```json
  {
    "meeting_id": "<UUID_PERTEMUAN_1>",
    "late_tolerance_minutes": 15,
    "duration_minutes": 90
  }
  ```
- **Expected Result**:
  - HTTP Status: `201 Created`.
  - Status sesi bernilai `"OPEN"`.
  - Timestamp `closed_at` dihitung otomatis 90 menit setelah sesi dibuka.
  - Audit log mencatat entri `OPEN_ATTENDANCE_SESSION`.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-ATTN-02: Mahasiswa Terdaftar Melakukan Check-In Presensi Mandiri
- **Scenario Ref**: TS-ATTN
- **Prioritas**: P0 (Blocker)
- **Precondition**: Sesi presensi pada TC-ATTN-01 berstatus `OPEN`. Mahasiswa peserta kelas login.
- **Test Steps**:
  1. Mahasiswa mengirim request HTTP POST ke `/api/attendance/check-in`.
  2. Kirimkan `session_id`.
- **Test Data**: `{"session_id": "<UUID_SESSION_OPEN>"}`
- **Expected Result**:
  - HTTP Status: `201 Created` (atau `200 OK`).
  - Rekord presensi tercatat dengan status `"HADIR"` (atau `"TERLAMBAT"` jika melewati 15 menit dari `opened_at`).
  - Kolom `recorded_at` menyimpan stempel waktu server yang akurat.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-ATTN-03: Mahasiswa Ditolak Melakukan Check-In Presensi Dua Kali
- **Scenario Ref**: TS-ATTN
- **Prioritas**: P1 (Kritis)
- **Precondition**: Mahasiswa telah berhasil check-in pada TC-ATTN-02.
- **Test Steps**:
  1. Mahasiswa yang sama mengirimkan kembali request HTTP POST ke `/api/attendance/check-in` untuk `session_id` yang sama.
- **Test Data**: `session_id` yang sama.
- **Expected Result**:
  - HTTP Status: `409 Conflict`.
  - Pesan error: `"Anda sudah mengisi presensi pada sesi perkuliahan ini"`.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-ATTN-04: Penolakan Presensi Saat Sesi Sudah Ditutup (Status CLOSED)
- **Scenario Ref**: TS-ATTN
- **Prioritas**: P1 (Kritis)
- **Precondition**: Dosen telah menutup sesi presensi (mengirim `PATCH /api/attendance/sessions/:id/close`).
- **Test Steps**:
  1. Mahasiswa peserta kelas mencoba melakukan check-in ke sesi tersebut.
- **Test Data**: `session_id` yang sudah berstatus `CLOSED`.
- **Expected Result**:
  - HTTP Status: `400 Bad Request`.
  - Pesan error: `"Sesi presensi telah ditutup"`.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-ATTN-05: Akurasi Matriks Rekapitulasi Presensi dan Kalkulasi Persentase Kehadiran
- **Scenario Ref**: TS-ATTN
- **Prioritas**: P0 (Blocker)
- **Precondition**: Kelas telah menyelenggarakan beberapa pertemuan dengan catatan presensi.
- **Test Steps**:
  1. Dosen mengirim request HTTP GET ke `/api/attendance/classes/:classId/recap`.
  2. Periksa struktur matriks 16 pertemuan dan kalkulasi persentase per mahasiswa.
- **Test Data**: `classId` kelas aktif.
- **Expected Result**:
  - HTTP Status: `200 OK`.
  - Respons mengembalikan matriks seluruh mahasiswa terdaftar.
  - Setiap mahasiswa memiliki detail status kehadiran di tiap pertemuan (Hadir, Izin, Sakit, Alpa).
  - Kolom persentase dihitung dengan rumus:
    $$\text{Persentase} = \left( \frac{\text{Jumlah Hadir}}{\text{Total Pertemuan Berlangsung}} \right) \times 100\%$$
- **Actual Result**: `[Menunggu Eksekusi]`

---

### Modul 9: Keamanan HTTP, Otorisasi RBAC & Audit Trail (TS-SECR & TS-AUDT)

#### TC-SECR-01: Verifikasi Kontrol Akses Berbasis Peran (RBAC 403 Forbidden)
- **Scenario Ref**: TS-SECR
- **Prioritas**: P0 (Blocker / Security)
- **Precondition**: Mahasiswa login dan memegang token valid mahasiswa.
- **Test Steps**:
  1. Gunakan token mahasiswa untuk memanggil endpoint admin: `GET /api/admin/users`.
  2. Gunakan token mahasiswa untuk memanggil endpoint administrasi mata kuliah: `POST /api/admin/courses`.
- **Test Data**: Header `Authorization: Bearer <mahasiswaToken>`.
- **Expected Result**:
  - Kedua pemanggilan ditolak tegas dengan HTTP Status `403 Forbidden`.
  - Pesan respons: `"Akses ditolak: role Anda tidak memiliki izin untuk tindakan ini"`.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-SECR-02: Verifikasi Pembatasan Laju Akses Login (Rate Limiting 429)
- **Scenario Ref**: TS-SECR
- **Prioritas**: P1 (Kritis / Security)
- **Precondition**: Server dikonfigurasi dengan limiter login aktif (header `X-Enforce-Rate-Limit: 1` pada environment test).
- **Test Steps**:
  1. Lakukan request POST beruntun ke `/api/auth/login` sebanyak lebih dari batas toleransi (misal 21 kali dalam 15 menit).
- **Test Data**: Payload login percobaan.
- **Expected Result**:
  - Request ke-1 hingga ambang batas mengembalikan `401` (jika password salah).
  - Request yang melampaui kuota langsung mengembalikan HTTP Status `429 Too Many Requests`.
  - Pesan error: menyebutkan terlalu banyak percobaan autentikasi dan meminta menunggu beberapa menit.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-SECR-03: Verifikasi Ketahanan Terhadap SQL Injection pada Endpoint Pencarian
- **Scenario Ref**: TS-SECR
- **Prioritas**: P0 (Blocker / Security)
- **Precondition**: Admin login.
- **Test Steps**:
  1. Kirim request HTTP GET ke `/api/admin/users?search=' OR '1'='1`.
  2. Amati apakah seluruh data pengguna bocor secara anomali atau terjadi syntax error SQL.
- **Test Data**: Parameter query `search=' OR '1'='1`.
- **Expected Result**:
  - HTTP Status: `200 OK`.
  - Prisma ORM memperlakukan input sebagai string literal terparameterisasi (*parameterized query*).
  - Tidak ada SQL injection yang berhasil, data yang keluar hanya data yang string-nya cocok secara harfiah.
- **Actual Result**: `[Menunggu Eksekusi]`

---

#### TC-AUDT-01: Immutabilitas dan Kelengkapan Jejak Audit pada Mutasi Kritis
- **Scenario Ref**: TS-AUDT
- **Prioritas**: P1 (Kritis)
- **Precondition**: Admin login.
- **Test Steps**:
  1. Catat jumlah entri log pada endpoint `GET /api/admin/audit-logs`.
  2. Lakukan satu tindakan mutasi data (misal: ganti nama kelas atau ubah status pengguna).
  3. Panggil kembali `GET /api/admin/audit-logs`.
  4. Periksa apakah terdapat endpoint HTTP method `DELETE` atau `PUT` untuk mengubah isi audit log.
- **Test Data**: Endpoint `/api/admin/audit-logs`.
- **Expected Result**:
  - Jumlah log bertambah tepat 1 entri setelah mutasi dilakukan.
  - Entri baru memuat detail lengkap: `user_id`, `action`, `entity`, `ip_address`, `user_agent`, `old_values`, dan `new_values`.
  - Tidak tersedia rute `DELETE /api/admin/audit-logs` maupun `PUT /api/admin/audit-logs` (log bersifat kekal / *immutable*).
- **Actual Result**: `[Menunggu Eksekusi]`

---

## 4. Lembar Rekapitulasi Eksekusi Test Case (Test Execution Sheet)

| Test ID | Skenario | Modul | Level | Prioritas | Status Eksekusi | Tanggal Uji | Catatan Penguji / Defect ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | TS-AUTH | Autentikasi | API / UI | P0 | ⬜ Belum Diuji | | |
| **TC-AUTH-02** | TS-AUTH | Autentikasi | API / UI | P0 | ⬜ Belum Diuji | | |
| **TC-AUTH-03** | TS-AUTH | Autentikasi | API | P1 | ⬜ Belum Diuji | | |
| **TC-AUTH-04** | TS-AUTH | Autentikasi | API | P1 | ⬜ Belum Diuji | | |
| **TC-AUTH-05** | TS-AUTH | Sesi JWT | API | P0 | ⬜ Belum Diuji | | |
| **TC-AUTH-06** | TS-AUTH | Sesi JWT | API | P1 | ⬜ Belum Diuji | | |
| **TC-AUTH-07** | TS-AUTH | Password | API / UI | P2 | ⬜ Belum Diuji | | |
| **TC-PROF-01** | TS-PROF | Profil | API / UI | P1 | ⬜ Belum Diuji | | |
| **TC-PROF-02** | TS-PROF | Profil | API / UI | P2 | ⬜ Belum Diuji | | |
| **TC-PROF-03** | TS-PROF | Avatar | API / UI | P1 | ⬜ Belum Diuji | | |
| **TC-PROF-04** | TS-PROF | Avatar | API / UI | P1 | ⬜ Belum Diuji | | |
| **TC-PROF-05** | TS-PROF | Avatar | API | P1 | ⬜ Belum Diuji | | |
| **TC-USER-01** | TS-USER | Pengguna | API | P0 | ⬜ Belum Diuji | | |
| **TC-USER-02** | TS-USER | Pengguna | API | P2 | ⬜ Belum Diuji | | |
| **TC-USER-03** | TS-USER | Pengguna | API / UI | P2 | ⬜ Belum Diuji | | |
| **TC-USER-04** | TS-USER | Pengguna | API | P1 | ⬜ Belum Diuji | | |
| **TC-CRSE-01** | TS-CRSE | Mata Kuliah | API | P1 | ⬜ Belum Diuji | | |
| **TC-CRSE-02** | TS-CRSE | Mata Kuliah | API | P2 | ⬜ Belum Diuji | | |
| **TC-CRSE-03** | TS-CRSE | Mata Kuliah | API | P1 | ⬜ Belum Diuji | | |
| **TC-CLSS-01** | TS-CLSS | Kelas & Pertemuan | API | P0 | ⬜ Belum Diuji | | |
| **TC-CLSS-02** | TS-CLSS | Kelas | API | P2 | ⬜ Belum Diuji | | |
| **TC-ENRL-01** | TS-ENRL | Enrollment | API | P0 | ⬜ Belum Diuji | | |
| **TC-ENRL-02** | TS-ENRL | Enrollment | API | P1 | ⬜ Belum Diuji | | |
| **TC-ENRL-03** | TS-ENRL | Enrollment | API | P1 | ⬜ Belum Diuji | | |
| **TC-MATR-01** | TS-MATR | Materi | API | P0 | ⬜ Belum Diuji | | |
| **TC-MATR-02** | TS-MATR | Materi | API | P0 | ⬜ Belum Diuji | | |
| **TC-MATR-03** | TS-MATR | Materi | API | P0 | ⬜ Belum Diuji | | |
| **TC-ATTN-01** | TS-ATTN | Presensi | API | P0 | ⬜ Belum Diuji | | |
| **TC-ATTN-02** | TS-ATTN | Presensi | API | P0 | ⬜ Belum Diuji | | |
| **TC-ATTN-03** | TS-ATTN | Presensi | API | P1 | ⬜ Belum Diuji | | |
| **TC-ATTN-04** | TS-ATTN | Presensi | API | P1 | ⬜ Belum Diuji | | |
| **TC-ATTN-05** | TS-ATTN | Presensi | API | P0 | ⬜ Belum Diuji | | |
| **TC-SECR-01** | TS-SECR | Keamanan | API | P0 | ⬜ Belum Diuji | | |
| **TC-SECR-02** | TS-SECR | Keamanan | API | P1 | ⬜ Belum Diuji | | |
| **TC-SECR-03** | TS-SECR | Keamanan | API | P0 | ⬜ Belum Diuji | | |
| **TC-AUDT-01** | TS-AUDT | Audit Trail | API | P1 | ⬜ Belum Diuji | | |

*Legenda Status: ⬜ Belum Diuji | ✅ Pass | ❌ Fail | ⛔ Blocked | ⏭ Skipped*
