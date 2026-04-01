# User Manual — SIM Convection Taylor Djaitin

**Versi:** MVP 1.0  
**Bahasa Operasional:** Indonesia

## 1. Gambaran Umum

Sistem ini dipakai oleh dua kelompok besar:

- customer melalui portal `/app/*`
- staff internal melalui portal `/office/*`

Role internal utama:

- `kasir`
- `produksi`
- `admin`
- `owner`

## 2. Panduan Customer

### 2.1 Registrasi dan Login

1. Buka halaman publik Djaitin.
2. Klik `Daftar` untuk membuat akun customer.
3. Login menggunakan email dan password.
4. Setelah login, customer masuk ke dashboard customer.

### 2.2 Melengkapi Profil

1. Buka menu `Akun` atau `Profil`.
2. Lengkapi data profil utama.
3. Tambahkan alamat kirim pada section `Alamat`.
4. Tambahkan ukuran badan pada section `Ukuran`.

Catatan:

- alamat default dipakai untuk checkout delivery
- ukuran tersimpan bisa dipakai lagi untuk order berikutnya

### 2.3 Membuat Tailor Order

1. Buka menu `Tailor`.
2. Lengkapi konfigurasi model, kain, ukuran, dan catatan.
3. Simpan sebagai draft jika belum siap submit.
4. Submit order saat data sudah final.
5. Pantau status order dari menu `Pesanan`.

### 2.4 Belanja Ready-to-Wear

1. Buka menu `Katalog`.
2. Pilih produk dan size yang tersedia.
3. Masukkan produk ke `Keranjang`.
4. Masuk ke `Checkout`.
5. Pilih `pickup` atau `delivery`.
6. Jika delivery, pastikan alamat sudah tersedia.
7. Selesaikan order dan lanjutkan pembayaran.

### 2.5 Request Convection

1. Buka layanan `Convection`.
2. Klik tombol request konveksi.
3. Isi kebutuhan order dan catatan spesifikasi.
4. Submit request.
5. Jika diminta, unggah lampiran tambahan dari detail order.

### 2.6 Pembayaran

1. Buka detail order atau menu `Pembayaran`.
2. Lihat nominal yang harus dibayar.
3. Jika transfer, upload bukti pembayaran.
4. Jika transfer ditolak, upload ulang bukti transfer dari menu pembayaran.

### 2.7 Notifikasi

Customer akan menerima notifikasi untuk:

- pembayaran diverifikasi
- pembayaran ditolak
- order mulai diproses
- order siap
- order dikirim

Semua notifikasi ada di menu `Notifikasi`. Gunakan `Tandai Semua Dibaca` jika diperlukan.

### 2.8 Melihat Status Order

1. Buka menu `Pesanan`.
2. Klik salah satu order untuk melihat detail.
3. Cek status, pembayaran, lampiran, dan shipment.

## 3. Panduan Staff Office

## 3.1 Login Internal

1. Login menggunakan akun staff.
2. Sistem akan mengarahkan ke dashboard office sesuai role.

## 3.2 Dashboard Office

Dashboard dipakai untuk melihat:

- ringkasan order
- aktivitas terbaru
- status operasional utama

Gunakan dashboard sebagai titik masuk sebelum membuka modul detail.

## 3.3 Modul Pelanggan

Dipakai untuk:

- membuat customer baru
- melihat data customer
- mengelola measurement customer dari sisi office

## 3.4 Modul Pesanan

Dipakai untuk:

- melihat semua order
- membuat tailor order manual dari office
- melihat detail order
- mencetak nota jika payment verified sudah ada
- update status order
- update production stage

## 3.5 Modul Pembayaran

Dipakai untuk:

- mencatat payment cash
- melihat payment transfer pending
- verifikasi payment transfer
- reject payment transfer dengan alasan yang jelas
- mencetak kwitansi payment verified

## 3.6 Modul Produksi

Dipakai tim produksi untuk:

- melihat order yang sedang berjalan
- mengubah production stage
- memperbarui status order dengan cepat
- memantau due date dan antrian kerja

## 3.7 Modul Pengiriman

Dipakai untuk:

- mengisi kurir
- mengisi nomor resi
- update status `pending`, `shipped`, `delivered`, `pickup`

Catatan:

- saat status shipment menjadi `shipped`, customer menerima notifikasi
- saat status shipment selesai, status order terkait ikut disesuaikan

## 3.8 Modul Laporan

Dipakai admin/owner untuk melihat:

- omzet per periode
- breakdown pembayaran
- loyal customers
- repeat order rate
- SLA / overdue monitoring
- order funnel

Export tersedia dalam:

- PDF
- CSV

## 3.9 Audit Log

Dipakai untuk meninjau perubahan penting pada data.  
Gunakan modul ini saat perlu tracing aksi user atau pengecekan histori perubahan.

## 3.10 Modul Admin

Dipakai admin/owner untuk:

- mengelola user internal
- mengelola produk
- mengelola fabric, garment model, courier
- mengelola kebijakan discount

## 4. Dokumen yang Bisa Dicetak

- `Nota` dari detail order
- `Kwitansi` dari payment verified
- `Export laporan` dari modul laporan

Catatan penting:

- export dokumen harus dibuka melalui browser request biasa
- bila browser menampilkan raw text, refresh asset terbaru dan gunakan tombol export yang sudah di-hotfix

## 5. Troubleshooting Singkat

### Customer tidak bisa checkout delivery

Penyebab umum:

- belum punya alamat default

Tindakan:

- buka profile center lalu tambah/set default alamat

### Payment transfer tidak bisa diverifikasi

Penyebab umum:

- status payment bukan `pending verification`

Tindakan:

- cek apakah payment sudah pernah diverifikasi atau ditolak

### Nota atau kwitansi tidak tersedia

Penyebab umum:

- belum ada verified payment

Tindakan:

- selesaikan verifikasi payment lebih dulu

### Order belum bisa masuk produksi

Penyebab umum:

- tailor belum mencapai payment minimum
- convection belum lunas penuh

## 6. SOP Penggunaan Minimum

- customer wajib mengisi profil dasar, alamat, dan ukuran sebelum order kompleks
- kasir wajib mengisi alasan saat reject payment
- produksi wajib update production stage secara berkala
- shipping wajib mengisi resi saat status `shipped`
- admin/owner review report dan overdue order secara rutin
