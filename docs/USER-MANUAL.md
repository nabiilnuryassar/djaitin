# Manual Book — SIM Convection Taylor Djaitin

**Versi:** MVP 1.0  
**Bahasa Operasional:** Indonesia
**Scope:** Customer app, office app, pembayaran, produksi, pengiriman, dan administrasi.

## 1. Gambaran Umum

Djaitin adalah sistem web untuk mengelola tiga lini bisnis:

- `Tailor`: jahit custom berdasarkan model, bahan, ukuran, dan catatan customer.
- `Ready-to-Wear`: penjualan pakaian siap pakai dari katalog.
- `Convection`: pesanan massal seperti seragam, jaket, kaos, topi, emblem, dan produk jahit lain.

Sistem memiliki dua area utama:

| Area | URL | Pengguna |
| --- | --- | --- |
| Customer App | `/app` | Customer |
| Office App | `/office` | Kasir, Produksi, Admin, Owner |

## 2. Role Dan Hak Akses

| Role | Akses Utama |
| --- | --- |
| Customer | Dashboard, tailor, katalog, pesanan, pembayaran, profil, notifikasi |
| Kasir | Customer, order, pembayaran, pengiriman |
| Produksi | Order dan production board |
| Admin | Semua operasional, master data, user, produk, discount policy |
| Owner | Dashboard, laporan, audit log, dan akses baca strategis |

Catatan:

- Customer tidak dapat membuka `/office`.
- Staff office tidak menggunakan portal customer untuk transaksi pribadi.
- Akses tombol dapat berbeda tergantung role.

## 3. Aturan Bisnis Yang Wajib Dipahami

Tailor:

- Order tailor wajib membayar DP awal minimal 50% dari total biaya.
- Order tailor baru boleh masuk produksi jika pembayaran terverifikasi minimal 50%.
- Pesanan tidak boleh ditutup jika masih ada sisa tagihan.
- Customer loyal mendapat diskon 20% setelah lebih dari 5 order tailor closed.

Ready-to-Wear:

- Produk dibeli dari katalog dan stok divalidasi saat checkout.
- Customer bisa memilih pickup atau delivery.
- Biaya delivery mengikuti biaya jasa kurir dari master data, tanpa markup toko.
- Stok berkurang setelah pembayaran terverifikasi.

Convection:

- Pesanan konveksi harus dibayar penuh sebelum diproduksi.
- Lampiran desain/referensi dapat dikirim melalui detail order.
- Progress produksi dipantau dari office.

Pembayaran:

- Cash langsung dianggap verified saat dicatat kasir.
- Transfer masuk status pending verification sampai kasir/admin melakukan verify.
- Kwitansi hanya dicetak untuk pembayaran yang sudah verified.

## 4. Panduan Customer

### 4.1 Registrasi Dan Login

1. Buka website Djaitin.
2. Pilih `Daftar` untuk membuat akun baru.
3. Isi nama, email, dan password.
4. Login dengan akun yang sudah dibuat.
5. Setelah login, sistem membuka dashboard customer di `/app`.

### 4.2 Dashboard Customer

Dashboard menampilkan:

- jumlah pesanan aktif
- total pengeluaran
- jumlah notifikasi
- shortcut ke Tailor, Katalog, Convection, Pesanan, dan Pembayaran
- histori pembayaran terbaru

Gunakan dashboard sebagai titik awal melihat aktivitas terbaru.

### 4.3 Mengelola Profil, Alamat, Dan Ukuran

1. Buka menu `Profil`.
2. Lengkapi data customer.
3. Tambahkan alamat pengiriman.
4. Tandai alamat default jika sering dipakai.
5. Tambahkan data ukuran tubuh.

Ukuran tersimpan dapat dipakai ulang untuk order tailor berikutnya.

### 4.4 Membuat Order Tailor

1. Buka menu `Tailor`.
2. Pilih identitas gaya, model, bahan, ukuran, detail, dan pembayaran.
3. Gunakan ukuran tersimpan jika sudah pernah mengisi data ukuran.
4. Isi catatan jika ada detail khusus.
5. Isi pembayaran awal minimal 50% dari total biaya.
6. Upload bukti transfer jika metode pembayaran transfer.
7. Submit order.

Jika DP kurang dari 50%, sistem menolak order dan menampilkan helper text nominal minimum.

### 4.5 Menyimpan Draft Tailor

1. Isi konfigurasi tailor sampai data cukup.
2. Pilih aksi simpan draft jika belum siap submit.
3. Draft dapat dilanjutkan dari menu `Pesanan` atau area tailor.

Gunakan draft jika customer belum yakin dengan bahan, ukuran, atau catatan.

### 4.6 Belanja Ready-to-Wear

1. Buka menu `Katalog`.
2. Pilih produk dan ukuran.
3. Masukkan produk ke keranjang.
4. Buka checkout.
5. Pilih `Pickup` atau `Delivery`.
6. Jika delivery, pilih alamat dan kurir.
7. Cek ringkasan subtotal, diskon, ongkir, dan total.
8. Pilih metode pembayaran.
9. Submit checkout.

Jika memilih delivery, ongkir berasal dari master data kurir yang dikelola admin.

### 4.7 Membuat Request Convection

1. Buka menu atau layanan `Convection`.
2. Isi nama perusahaan/instansi jika ada.
3. Isi item, quantity, spesifikasi, dan kebutuhan desain.
4. Upload referensi desain jika tersedia.
5. Isi pembayaran penuh sesuai total order.
6. Submit request.

Konveksi baru masuk produksi setelah pembayaran penuh terverifikasi.

### 4.8 Upload Bukti Pembayaran

1. Buka menu `Pembayaran` atau detail order.
2. Pilih pembayaran yang perlu dilengkapi.
3. Isi nomor referensi transfer.
4. Upload bukti transfer.
5. Tunggu verifikasi kasir/admin.

Jika bukti ditolak, customer dapat upload ulang dari menu pembayaran.

### 4.9 Melihat Pesanan

1. Buka menu `Pesanan`.
2. Pilih order yang ingin dicek.
3. Lihat status order, pembayaran, lampiran, dan shipment.
4. Jika order sudah selesai dan lunas, ikuti instruksi pickup atau delivery.

### 4.10 Notifikasi

Customer menerima notifikasi untuk:

- pembayaran diverifikasi
- pembayaran ditolak
- order mulai diproses
- order siap
- order dikirim

Gunakan menu `Notifikasi` untuk membaca dan menandai notifikasi.

## 5. Panduan Kasir

### 5.1 Login Office

1. Buka `/office`.
2. Login menggunakan akun kasir.
3. Sistem membuka dashboard office.

### 5.2 Membuat Tailor Order Manual

1. Buka menu `Pesanan`.
2. Pilih aksi buat order tailor.
3. Pilih customer.
4. Pilih model, bahan, ukuran, jumlah, harga, dan tanggal selesai.
5. Isi pembayaran awal minimal 50%.
6. Simpan order.

Jika pembayaran awal kurang dari 50%, sistem menolak order.

### 5.3 Mencatat Pembayaran Cash

1. Buka detail order.
2. Pilih section pembayaran.
3. Catat payment dengan metode `Cash`.
4. Sistem langsung menandai payment sebagai verified.
5. Cetak kwitansi jika dibutuhkan.

### 5.4 Verifikasi Transfer

1. Buka menu `Pembayaran`.
2. Pilih payment transfer berstatus pending verification.
3. Cek nominal, nomor referensi, dan bukti transfer.
4. Klik `Verify` jika dana benar masuk atau bukti valid.
5. Klik `Reject` jika bukti tidak valid, lalu isi alasan yang jelas.

Alasan reject membantu customer mengunggah bukti yang benar.

### 5.5 Mencetak Nota Dan Kwitansi

Nota:

- Dibuka dari detail order.
- Tersedia jika order memiliki pembayaran verified.
- Memuat nomor order, customer, target selesai, item, total, dibayar, dan sisa tagihan.

Kwitansi:

- Dibuka dari payment verified.
- Hanya tersedia untuk pembayaran yang sudah diterima.

## 6. Panduan Tim Produksi

### 6.1 Melihat Production Board

1. Buka menu `Produksi`.
2. Lihat order berdasarkan stage produksi.
3. Prioritaskan order dengan due date terdekat.
4. Perhatikan indikator overdue.

### 6.2 Update Stage Produksi

1. Pilih order atau card produksi.
2. Ubah stage sesuai kondisi lapangan.
3. Simpan perubahan.

Contoh stage:

- queue
- cutting
- sewing
- finishing
- quality check
- ready

### 6.3 Gate Produksi

Sistem menolak order masuk produksi jika:

- tailor belum punya pembayaran verified minimal 50%
- convection belum lunas penuh verified
- status order tidak valid untuk diproses

Jika tertolak, koordinasikan ke kasir/admin untuk cek pembayaran.

## 7. Panduan Pengiriman

### 7.1 Mengelola Shipment

1. Buka menu `Pengiriman`.
2. Pilih shipment yang akan diproses.
3. Pilih kurir.
4. Isi nomor resi jika sudah dikirim.
5. Update status shipment.

Status umum:

- `pending`: belum dikirim
- `shipped`: sudah dikirim
- `delivered`: sudah diterima
- `pickup`: diambil customer

### 7.2 Biaya Pengiriman

Biaya pengiriman berasal dari master data kurir. Admin wajib menjaga biaya ini sesuai tarif jasa pengiriman yang dipakai perusahaan.

## 8. Panduan Admin

### 8.1 User Management

Admin dapat:

- membuat user internal
- mengubah role
- menonaktifkan user
- memastikan akun staff sesuai tanggung jawab

### 8.2 Master Data

Menu admin mencakup:

- garment model
- fabric
- courier

Courier wajib memiliki biaya jasa (`base_fee`) karena dipakai checkout RTW delivery.

### 8.3 Product Management

Admin dapat mengelola:

- SKU
- nama produk
- kategori
- ukuran
- harga pokok
- harga jual
- diskon nominal/persen
- clearance flag
- stok

Gunakan clearance untuk produk yang mulai kurang diminati.

### 8.4 Discount Policy

Admin dapat mengubah:

- threshold order tailor closed
- persentase diskon loyalitas

Default bisnis:

- threshold `5`
- diskon `20%`
- arti threshold: diskon aktif setelah lebih dari 5 order tailor closed, yaitu mulai order ke-6.

## 9. Panduan Owner

Owner menggunakan sistem untuk monitoring:

- omzet
- payment breakdown
- order funnel
- repeat order
- customer loyal
- overdue order
- audit log

Owner sebaiknya tidak mengubah data operasional harian kecuali diperlukan.

## 10. Laporan

1. Buka menu `Laporan`.
2. Pilih periode.
3. Review ringkasan omzet dan operasional.
4. Export PDF atau CSV jika dibutuhkan.

Gunakan laporan untuk evaluasi:

- produk RTW yang bergerak lambat
- order tailor berulang
- keterlambatan produksi
- pembayaran pending

## 11. Audit Log

Audit log mencatat perubahan penting seperti:

- order dibuat atau diubah
- pembayaran diverifikasi atau ditolak
- master data berubah
- discount policy berubah

Gunakan audit log untuk tracing jika ada perbedaan data atau komplain.

## 12. SOP Harian Minimum

Customer service/kasir:

- cek payment pending setiap hari
- reject transfer dengan alasan jelas
- pastikan DP tailor minimal 50%
- pastikan konveksi lunas sebelum produksi

Produksi:

- update stage produksi setiap ada perpindahan proses
- cek due date dan overdue order
- tandai order ready setelah quality check selesai

Shipping:

- isi kurir dan resi saat order dikirim
- update status delivered/pickup setelah selesai

Admin:

- cek stok RTW
- update master courier jika tarif berubah
- review produk clearance
- backup data sesuai jadwal deployment

Owner:

- review laporan mingguan
- pantau overdue dan bottleneck
- evaluasi diskon loyalitas dan clearance

## 13. Troubleshooting Pengguna

### Customer tidak bisa submit tailor

Kemungkinan:

- DP kurang dari 50%
- ukuran belum dipilih
- bukti transfer belum diunggah

Tindakan:

- cek helper text di step pembayaran
- isi nominal sesuai minimum
- upload bukti transfer yang jelas

### Customer tidak bisa checkout delivery

Kemungkinan:

- alamat belum ada
- kurir belum dipilih
- stok produk berubah

Tindakan:

- tambahkan alamat dari profil
- pilih kurir aktif
- refresh keranjang dan cek stok

### Payment transfer tidak bisa diverifikasi

Kemungkinan:

- status bukan pending verification
- payment sudah pernah diverifikasi atau ditolak

Tindakan:

- cek histori payment
- minta customer upload ulang jika sebelumnya ditolak

### Order tidak bisa masuk produksi

Kemungkinan:

- tailor belum verified minimal 50%
- convection belum verified penuh

Tindakan:

- cek outstanding amount
- cek daftar payment verified
- koordinasikan ke kasir

### Nota atau kwitansi tidak muncul

Kemungkinan:

- belum ada payment verified
- browser memblokir download

Tindakan:

- verifikasi payment lebih dulu
- coba ulang dari detail order/payment

## 14. Definisi Status

| Status | Arti |
| --- | --- |
| `pending_payment` | Order dibuat dan menunggu pembayaran/verifikasi |
| `in_progress` | Order sedang diproses |
| `done` | Produksi selesai |
| `delivered` | Order sudah dikirim |
| `pickup` | Order diambil customer |
| `closed` | Order selesai dan administrasi lunas |
| `cancelled` | Order dibatalkan |

## 15. Checklist Training Staff

- Staff bisa login sesuai role.
- Kasir bisa membuat order tailor manual.
- Kasir bisa verify dan reject transfer.
- Produksi bisa update stage.
- Shipping bisa mengisi resi.
- Admin bisa update produk dan master courier.
- Owner bisa membaca laporan dan audit log.
- Semua staff memahami aturan DP tailor 50% dan full payment convection.
