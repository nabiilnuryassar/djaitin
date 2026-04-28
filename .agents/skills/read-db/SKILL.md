---
name: read-db
description: "Membaca dan menganalisis database PostgreSQL Djaitin. Digunakan untuk memahami skema (ERD), memverifikasi integritas data, mengecek relasi antar tabel, atau melakukan audit data tanpa mengubah isi database (read-only)."
license: MIT
metadata:
  author: antigravity
---

# Djaitin Database Analysis Skill

## When to Apply

Aktifkan skill ini ketika:
- Membutuhkan informasi struktur tabel (skema) saat ini.
- Memverifikasi data yang tersimpan untuk debugging logic aplikasi.
- Menganalisis relasi antar tabel (Foreign Keys).
- Mengecek status transaksi atau antrean (jobs) di database.
- Menghitung statistik data (aggregasi) untuk laporan atau analisis.

## Database Configuration (Auto-detected from .env)

- **Connection**: `pgsql` (PostgreSQL)
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `djaitin`
- **User**: `postgres`

## Peraturan Penguasaan (Safety Rules)

> [!IMPORTANT]
> **STRICTLY READ-ONLY BY DEFAULT**
> Seluruh operasi database melalui skill ini harus bersifat **hanya baca (READ)**. Dilarang melakukan eksekusi perintah yang memodifikasi data atau skema (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `CREATE`) tanpa izin eksplisit dan tertulis dari USER.

## Perintah yang Disarankan

Gunakan kombinasi `php artisan` dan `psql` untuk analisis yang efisien.

### 1. Menggunakan Laravel Artisan (Lebih Ringkas)

Gunakan perintah bawaan Laravel untuk melihat gambaran umum:

```bash
# Melihat daftar seluruh tabel dan ukurannya
php artisan db:show

# Melihat detail kolom, index, dan foreign keys pada tabel tertentu
php artisan db:table [nama_tabel]

# Melihat skema model Eloquent secara mendalam
php artisan model:show [NamaModel]
```

### 2. Menggunakan PostgreSQL (Untuk Query Kompleks)

Gunakan `psql` untuk query yang lebih spesifik. Selalu gunakan `LIMIT` untuk mencegah output yang terlalu panjang.

```bash
# Template perintah psql (Gunakan PGPASSWORD dari environment jika tersedia)
PGPASSWORD=postgres psql -h localhost -U postgres -d djaitin -c "SELECT * FROM [tabel] LIMIT 10;"

# Mode Expanded (Sangat disarankan untuk pembacaan kolom yang banyak)
PGPASSWORD=postgres psql -h localhost -U postgres -d djaitin -c "\x" -c "SELECT * FROM [tabel] WHERE id = [id];"
```

## Pola Analisis Umum

### Skema & Relasi
Untuk memahami bagaimana tabel berhubungan:
1. Jalankan `php artisan db:show` untuk list tabel.
2. Identifikasi tabel utama (misal: `orders`, `users`, `products`).
3. Jalankan `php artisan db:table orders` untuk melihat Foreign Key ke `users`.

### Investigasi Data
Untuk mengecek mengapa suatu fitur tidak bekerja:
1. Cari baris data terkait menggunakan query `WHERE`.
2. Bandingkan nilai di database dengan ekspektasi di UI/Code.
3. Selalu tampilkan timestamp (`created_at`, `updated_at`) untuk urutan kejadian.
 
## Definisi Selesai (Definition of Done)
- Skema database terpahami dengan baik.
- Masalah data teridentifikasi tanpa menyebabkan *side-effect* pada integritas database.
- Laporan analisis disajikan dalam format yang mudah dibaca (tabel markdown).
