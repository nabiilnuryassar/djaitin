# PRD Final — SIM Convection Taylor Djaitin

**Version:** 1.0  
**Status:** Final MVP Baseline  
**Tanggal:** 2026-04-01  
**Produk:** Djaitin

## 1. Ringkasan Produk

SIM Convection Taylor Djaitin adalah sistem operasional terpadu untuk bisnis jahit, ready-to-wear, dan konveksi. Sistem ini menggabungkan:

- portal customer untuk pemesanan dan pembayaran
- office app untuk operasional harian
- modul admin untuk master data, user, dan pengawasan

Target MVP-nya adalah membuat seluruh alur inti berjalan dalam satu sistem: customer bisa memesan, staff bisa memproses, pembayaran bisa diverifikasi, produksi dan pengiriman bisa dipantau, dan owner/admin bisa melihat laporan operasional.

## 2. Masalah yang Diselesaikan

Sebelum sistem ini, proses bisnis tailor dan konveksi biasanya terpecah:

- order dicatat manual atau via chat
- data customer, ukuran, alamat, dan pembayaran tersebar
- progres produksi sulit dipantau
- pengiriman dan dokumen transaksi tidak rapi
- owner/admin kesulitan melihat omzet dan bottleneck operasional

MVP ini menyelesaikan masalah itu dengan satu sistem kerja yang konsisten dari order sampai laporan.

## 3. Tujuan Produk

### 3.1 Tujuan Bisnis

- mempercepat proses penerimaan order
- mengurangi kehilangan data customer dan order
- membuat verifikasi pembayaran lebih tertib
- memberi visibilitas produksi dan pengiriman
- menyediakan laporan operasional untuk pengambilan keputusan

### 3.2 Tujuan Operasional

- satu sumber data untuk customer, order, payment, shipment, dan report
- role-based workflow untuk kasir, produksi, admin, owner, dan customer
- audit trail untuk perubahan penting
- dokumen PDF untuk nota, kwitansi, dan export laporan

## 4. Segmentasi Pengguna

### 4.1 Customer

Customer membutuhkan:

- registrasi dan login
- konfigurasi tailor order
- pembelian ready-to-wear
- pengajuan order konveksi
- upload bukti pembayaran
- notifikasi status order
- pengelolaan profil, alamat, dan ukuran

### 4.2 Kasir

Kasir membutuhkan:

- input order tailor manual
- input dan verifikasi pembayaran
- akses pelanggan dan order
- pengelolaan shipment

### 4.3 Produksi

Tim produksi membutuhkan:

- daftar order aktif
- quick update status dan production stage
- visibilitas due date dan order overdue

### 4.4 Admin

Admin membutuhkan:

- semua akses operasional office
- pengelolaan user internal
- pengelolaan master data
- pengelolaan produk RTW dan discount
- laporan dan audit log

### 4.5 Owner

Owner membutuhkan:

- dashboard dan report tingkat bisnis
- audit log
- akses baca ke area admin strategis

## 5. Ruang Lingkup MVP

### 5.1 Public Surface

- landing page brand Djaitin
- login, register, forgot password, verify email
- halaman layanan tailor, ready-to-wear, dan convection

### 5.2 Customer App

- customer dashboard
- unified profile center: profil, alamat, ukuran
- tailor configurator + draft submit flow
- ready-to-wear catalog, cart, checkout
- convection request flow
- order history dan order detail
- payment history + upload/reupload proof
- notification center
- mobile bottom navigation

### 5.3 Office App

- office dashboard
- customer management
- tailor order creation oleh staff
- order list dan detail
- payment management
- production board
- shipping management
- reports dan analytics
- audit log

### 5.4 Admin Modules

- user management
- product management
- master data management
- discount policy management
- courier, fabric, dan garment model management

### 5.5 Documents & Notification

- nota PDF
- kwitansi PDF
- laporan PDF / CSV
- in-app notifications untuk customer

## 6. Fitur Inti MVP

### 6.1 Customer Foundation

- customer register otomatis membentuk user role customer
- dashboard customer berbasis summary
- alamat dan measurement dapat disimpan dan digunakan ulang
- profile center menjadi pusat data customer

### 6.2 Tailor Order

- customer dapat konfigurasi tailor order
- draft order dapat disimpan dan dilanjutkan
- staff office dapat membuat tailor order manual
- payment gate untuk status produksi diterapkan

### 6.3 Ready-to-Wear Commerce

- katalog RTW dengan detail produk
- cart per customer
- checkout pickup/delivery
- validasi stok dan size
- stok berkurang setelah verified payment

### 6.4 Convection Flow

- customer dapat submit request konveksi
- attachment order tersedia
- production stage tersedia untuk tracking
- gate pembayaran penuh sebelum `in_progress`

### 6.5 Payments

- cash dan transfer didukung
- transfer dapat diverifikasi atau ditolak
- customer dapat upload ulang bukti transfer
- perhitungan paid/outstanding order otomatis diperbarui

### 6.6 Operations

- production board untuk monitoring order aktif
- shipping update untuk resi dan status pengiriman
- report operasional dan analytics
- audit log untuk perubahan penting

### 6.7 Notifications

- payment verified
- payment rejected
- order in progress
- order ready
- order shipped

## 7. Aturan Bisnis Inti

- customer hanya dapat mengakses data miliknya sendiri
- staff office tidak dapat mengakses portal customer sebagai customer
- order tailor baru dapat masuk `in_progress` jika pembayaran terverifikasi minimal 50%
- order convection baru dapat masuk `in_progress` setelah pembayaran penuh terverifikasi
- stok RTW turun hanya setelah verified payment
- nota hanya tersedia jika order memiliki verified payment
- kwitansi hanya tersedia untuk payment verified
- customer notification hanya tampil untuk customer terkait

## 8. Role & Access Summary

### Customer

- portal customer penuh
- tidak bisa akses `/office/*`

### Kasir

- order, customer, payment, shipping
- tidak punya akses admin/report owner-level

### Produksi

- dashboard operasional
- production board dan order visibility

### Admin

- seluruh office app
- seluruh modul admin
- report dan audit log

### Owner

- report, audit log, dan dashboard
- akses strategis yang dibatasi sebagai read-only untuk beberapa modul admin

## 9. Non-Functional Requirements

### 9.1 Usability

- mobile customer flow harus usable
- office shell harus konsisten dan cepat dipahami
- notification dan status order harus mudah dibaca

### 9.2 Security

- role-based authorization
- ownership enforcement
- signed verification link
- audit log untuk aksi penting

### 9.3 Reliability

- full suite test harus lulus
- build frontend dan typecheck harus lulus
- export PDF/CSV dan dokumen transaksi harus stabil

### 9.4 Maintainability

- Laravel 12 + Inertia React + Wayfinder
- service layer untuk logic bisnis utama
- request validation dan policy terpisah

## 10. Metrik Sukses MVP

- order customer dapat diproses end-to-end tanpa kanal manual tambahan
- staff dapat memproses order, payment, shipment, dan produksi dari office app
- owner/admin dapat melihat laporan operasional dasar setiap hari
- customer dapat menerima notifikasi penting tanpa perlu follow up manual untuk setiap status
- full regression suite lulus pada baseline release

## 11. Di Luar Scope MVP

- payment gateway online otomatis
- multi-branch / multi-warehouse
- scheduling mesin atau tenaga kerja granular
- procurement dan pembelian bahan baku
- refund / return management lengkap
- CRM campaign automation
- mobile native app

## 12. Kriteria Rilis MVP

Produk dinyatakan siap MVP jika:

- semua flow inti customer dan office sudah tersedia
- role dan akses utama berjalan benar
- notifikasi customer berfungsi
- report operasional tersedia
- export dokumen utama tersedia
- full test suite hijau
- build frontend dan typecheck hijau

## 13. Posisi Produk Saat Ini

Per 2026-04-01, baseline ini sudah memenuhi definisi MVP untuk SIM Convection Taylor Djaitin:

- full test suite: `112` test lulus
- total assertion: `782`
- `npm run build`: lulus
- `npm run types:check`: lulus

Kesimpulan: sistem ini sudah layak disebut **SIM Convection Taylor** dan siap dijadikan **MVP operasional** untuk rollout terkontrol.
