# Starter Accounts & Seeding Guide

## 1. Tujuan Dokumen

Dokumen ini menjelaskan dua mode seeding yang tersedia:

- mode `demo`, untuk local/dev/showcase
- mode `production starter`, untuk baseline akun dan master data awal production

## 2. Demo Seeding

Gunakan untuk local development atau demo internal.

### Command

```bash
php artisan migrate:fresh --seed
```

### Akun Demo yang Tersedia

- `customer@djaitin.com`
- `admin@djaitin.com`
- `owner@djaitin.com`
- `kasir@djaitin.com`
- `produksi@djaitin.com`

Password default demo:

```text
password
```

Catatan:

- mode demo juga mengisi sample order, payment, product, shipment, dan customer
- jangan gunakan mode ini untuk production

## 3. Production Starter Seeding

Gunakan untuk environment production baru atau staging yang ingin menyerupai production tanpa sample transaksi.

### Command

```bash
php artisan db:seed --class=ProductionStarterSeeder --force
```

### Yang Dibuat

- akun internal minimum:
  - owner
  - admin
  - kasir
  - produksi
- discount policies minimum
- garment models minimum
- fabrics minimum
- couriers minimum

### Yang Tidak Dibuat

- sample customer
- sample order
- sample payment
- sample shipment
- sample product RTW

## 4. Mekanisme Password Production Starter

`ProductionStarterSeeder` tidak menyimpan password statis di repo.

Perilaku:

- jika akun belum ada, seeder membuat password random dan menampilkannya di console
- jika akun sudah ada, seeder tidak mengubah password existing

Contoh output:

```text
Production starter accounts created. Simpan credential berikut dan segera ganti password setelah login pertama.
- OWNER | owner@djaitin.com | <generated-password>
- ADMIN | admin@djaitin.com | <generated-password>
```

## 5. Langkah Setelah Menjalankan Production Starter Seeder

1. simpan credential yang muncul saat command selesai
2. login menggunakan akun terkait
3. segera ganti password semua akun internal
4. lengkapi master data bisnis sebenarnya:
   - produk RTW
   - harga dan stok
   - fabric bisnis nyata
   - garment model final
   - courier yang dipakai
5. buat customer dan transaksi nyata setelah setup selesai

## 6. Rekomendasi Praktis

- gunakan `DatabaseSeeder` untuk local demo
- gunakan `ProductionStarterSeeder` untuk first setup production
- jangan pernah menjalankan demo seed pada database production aktif
