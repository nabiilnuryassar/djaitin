# Elisitasi Perancangan Sistem Dari Requirement Client

**Versi:** 1.0  
**Tanggal:** 2026-04-08  
**Konteks:** sistem belum dibangun, tim software baru menerima kebutuhan dan arahan dari client

## Tujuan

Dokumen ini menggambarkan proses elisitasi requirement dari perspektif software engineer ketika menerima masukan client pada tahap awal perancangan sistem.  

Alurnya dibuat bertahap:

1. Tahap 1: menangkap kebutuhan mentah dari client
2. Tahap 2: menganalisis dan mengklarifikasi kebutuhan
3. Tahap 3: menyusun kebutuhan sistem yang lebih formal
4. Final draft: kebutuhan akhir yang siap dijadikan dasar PRD / scope pengembangan

Dokumen ini memakai studi kasus Djaitin, tetapi ditulis seolah sistem masih berada pada tahap perancangan.

---

## Gambaran Kondisi Awal

Client menjelaskan bahwa bisnis Djaitin mencakup:

- jahit sesuai permintaan pelanggan
- penjualan pakaian siap pakai
- pesanan konveksi dalam jumlah besar
- pencatatan ukuran dan model pelanggan
- pembayaran tunai dan transfer
- dokumen transaksi
- pengiriman untuk produk tertentu
- kebutuhan administrasi, pelayanan, dan laporan yang lebih rapi

Pada tahap ini, engineer belum membuat solusi teknis. Tugas engineer adalah menerjemahkan narasi bisnis client menjadi kebutuhan sistem yang jelas, terukur, dan bisa dikerjakan.

---

## Tahap 1

## Fokus

Tahap 1 digunakan untuk menangkap pernyataan client apa adanya.  
Belum ada keputusan teknologi, belum ada desain UI, dan belum ada struktur modul final.

## Tabel Elisitasi Tahap 1

| No | Masukan Client | Pemahaman Awal Engineer | Dugaan Fitur / Kebutuhan |
|---|---|---|---|
| 1 | Perusahaan menerima jahit sesuai permintaan pelanggan | Ada layanan tailor/custom | Modul tailor order |
| 2 | Perusahaan menjual pakaian siap pakai | Ada penjualan retail | Modul ready-to-wear |
| 3 | Perusahaan juga menerima pesanan konveksi besar | Ada layanan B2B / bulk production | Modul order konveksi |
| 4 | Data ukuran pelanggan harus didokumentasikan | Ukuran customer harus tersimpan | Modul measurement |
| 5 | Data pelanggan lama harus memudahkan pelayanan ulang | Harus ada histori customer | Customer profile dan riwayat order |
| 6 | Pakaian siap pakai bisa dipilih berdasarkan model dan ukuran | Harus ada katalog produk | Modul katalog dan stok |
| 7 | Menjahit minimal bayar 50% | Ada aturan DP tailor | Rule payment tailor |
| 8 | Pesanan harus lunas sebelum dibawa pulang | Ada kontrol sisa pembayaran | Rule outstanding |
| 9 | Konveksi dikerjakan setelah pembayaran penuh | Ada full payment gate | Rule payment konveksi |
| 10 | Pembayaran tunai diberi kwitansi | Harus ada dokumen transaksi | Modul kwitansi |
| 11 | Transfer harus diverifikasi dulu | Pembayaran transfer tidak otomatis valid | Verifikasi transfer |
| 12 | Perusahaan butuh administrasi dan laporan yang rapi | Harus ada office/admin surface | Modul operasional dan report |

## Hasil Tahap 1

Pada akhir tahap 1, engineer biasanya baru memiliki:

- daftar kebutuhan bisnis mentah
- daftar aturan bisnis yang disebut client
- daftar area proses yang perlu disistemkan

Belum ada keputusan final tentang:

- struktur modul
- hak akses
- detail alur antar aktor
- prioritas MVP

---

## Tahap 2

## Fokus

Tahap 2 digunakan untuk menilai requirement yang diterima:

- mana yang kebutuhan inti
- mana yang aturan bisnis
- mana yang data yang wajib disimpan
- mana yang masih ambigu
- mana yang perlu ditanyakan kembali ke client

## Tabel Elisitasi Tahap 2

| No | Requirement Awal | Kategori | Aktor Terkait | Pertanyaan / Klarifikasi Engineer |
|---|---|---|---|---|
| 1 | Tailor order | Fitur inti | Customer, office | Data apa saja yang dipilih saat jahit: model, bahan, ukuran, catatan? |
| 2 | Ready-to-wear | Fitur inti | Customer, kasir, admin | Apakah perlu stok per ukuran? Apakah bisa delivery? |
| 3 | Konveksi | Fitur inti | Customer, office | Apakah customer langsung input nilai order, atau minta penawaran dulu? |
| 4 | Penyimpanan ukuran pelanggan | Data inti | Customer, office | Apakah satu customer bisa punya beberapa measurement profile? |
| 5 | DP tailor 50% | Aturan bisnis | Customer, kasir | Apakah 50% dihitung dari total final setelah diskon? |
| 6 | Pelunasan sebelum pengambilan | Aturan bisnis | Customer, kasir, office | Apakah order bisa ditandai selesai sebelum lunas, atau harus menunggu lunas? |
| 7 | Full payment konveksi | Aturan bisnis | Customer, office | Apakah semua order konveksi wajib lunas di awal tanpa pengecualian? |
| 8 | Verifikasi transfer | Aturan bisnis | Kasir, admin | Siapa yang berhak memverifikasi? Kasir saja atau admin juga? |
| 9 | Kwitansi dan nota | Dokumen | Kasir, office, customer | Nota dibuat kapan, kwitansi dibuat kapan? |
| 10 | Pengiriman RTW | Fitur operasional | Customer, office | Apakah ongkir ditambahkan ke order? Apakah menggunakan kurir eksternal? |
| 11 | Diskon loyalti | Aturan bisnis | Customer, admin | Berlaku setelah lebih dari 5 kali atau mulai transaksi ke-5? |
| 12 | Laporan | Fitur manajerial | Admin, owner | Laporan apa yang paling penting di MVP: order, payment, shipment, omzet? |

## Output Tahap 2

Pada tahap ini, engineer mulai bisa memisahkan requirement ke dalam kelompok:

- `Fitur inti`
- `Aturan bisnis`
- `Data requirement`
- `Dokumen`
- `Aktor dan hak akses`
- `Open issues`

## Contoh Open Issues Yang Harus Dibawa Ke Client

| No | Area | Open Issue |
|---|---|---|
| 1 | Tailor loyalty | Rule diskon loyalti belum presisi |
| 2 | Konveksi | Alur harga masih perlu dipastikan |
| 3 | Pickup | Due date hanya informasi atau harus menjadi kontrol operasional |
| 4 | Corporate order | Perlu akun corporate khusus atau cukup nama perusahaan |
| 5 | Shipping | Hanya RTW yang bisa dikirim atau semua jenis order tertentu |

---

## Tahap 3

## Fokus

Tahap 3 digunakan untuk mengubah hasil analisis menjadi requirement sistem yang lebih formal.  
Di tahap ini, engineer mulai menyusun kebutuhan dalam bentuk yang siap dipakai oleh tim desain, backend, frontend, QA, dan product.

## Tabel Elisitasi Tahap 3

| No | Requirement Sistem | Jenis Requirement | Prioritas | Keputusan Sementara |
|---|---|---|---|---|
| 1 | Sistem menyediakan customer app untuk pemesanan dan pembayaran | Functional | Tinggi | Disetujui |
| 2 | Sistem menyediakan office app untuk operasional order, payment, shipment, dan report | Functional | Tinggi | Disetujui |
| 3 | Sistem mendukung tailor order dengan model, bahan, ukuran, dan catatan | Functional | Tinggi | Disetujui |
| 4 | Sistem menyimpan measurement customer untuk reuse pada order berikutnya | Data | Tinggi | Disetujui |
| 5 | Sistem mendukung ready-to-wear catalog, cart, checkout, dan stok | Functional | Tinggi | Disetujui |
| 6 | Sistem mendukung order konveksi dengan file referensi dan rincian item | Functional | Tinggi | Disetujui |
| 7 | Sistem menerapkan DP minimal 50% untuk tailor sebelum produksi dimulai | Business Rule | Tinggi | Disetujui |
| 8 | Sistem menerapkan full payment verified untuk konveksi sebelum produksi dimulai | Business Rule | Tinggi | Disetujui |
| 9 | Sistem mendukung pembayaran cash dan transfer | Functional | Tinggi | Disetujui |
| 10 | Sistem mewajibkan verifikasi transfer sebelum dianggap diterima | Business Rule | Tinggi | Disetujui |
| 11 | Sistem menghasilkan nota dan kwitansi transaksi | Functional | Sedang | Disetujui |
| 12 | Sistem mendukung pengiriman produk tertentu menggunakan kurir | Functional | Sedang | Disetujui dengan detail menyusul |
| 13 | Sistem menyediakan laporan operasional dan ringkasan bisnis | Functional | Sedang | Disetujui |
| 14 | Sistem memberi diskon loyalti tailor | Business Rule | Sedang | Menunggu finalisasi rule |

## Hasil Tahap 3

Pada akhir tahap 3, requirement sudah cukup matang untuk:

- dibuat PRD
- dibuat scope MVP
- dibuat daftar modul
- dibuat use case per aktor
- dibuat backlog sprint awal

---

## Final Draft Elisitasi

## Tujuan

Final draft elisitasi adalah hasil persetujuan awal antara client dan software engineer mengenai apa yang benar-benar akan dibangun pada fase pertama sistem.

## Tabel Final Draft Elisitasi

| No | Kebutuhan Final | Deskripsi Final | Prioritas MVP | Status |
|---|---|---|---|---|
| 1 | Customer app | Portal customer untuk order, payment, profile, alamat, ukuran, dan notifikasi | Tinggi | Masuk MVP |
| 2 | Office app | Portal internal untuk customer management, order, payment, shipment, report | Tinggi | Masuk MVP |
| 3 | Tailor module | Order tailor berbasis konfigurasi model, bahan, ukuran, dan histori measurement | Tinggi | Masuk MVP |
| 4 | Ready-to-wear module | Katalog produk siap pakai, cart, checkout, stok, dan delivery | Tinggi | Masuk MVP |
| 5 | Convection module | Pengajuan order konveksi dengan file referensi, item, dan payment gate penuh | Tinggi | Masuk MVP |
| 6 | Payment management | Cash dan transfer, termasuk verifikasi transfer | Tinggi | Masuk MVP |
| 7 | Production monitoring | Monitoring order aktif, due date, dan status produksi | Tinggi | Masuk MVP |
| 8 | Shipping management | Pengelolaan pengiriman dan nomor resi | Sedang | Masuk MVP |
| 9 | Nota dan kwitansi | Dokumen transaksi untuk kebutuhan administrasi | Sedang | Masuk MVP |
| 10 | Laporan operasional | Ringkasan order, payment, shipment, dan performa bisnis | Sedang | Masuk MVP |
| 11 | Loyalty tailor | Diskon loyalti untuk customer tertentu | Sedang | Masuk MVP dengan rule final menyusul |
| 12 | Corporate / CRM lanjutan | Pengelolaan corporate account penuh dan pemasaran | Rendah | Ditunda / fase berikutnya |

## Final Draft Rule Yang Harus Disepakati

| No | Rule | Keputusan Final Yang Harus Disetujui Client |
|---|---|---|
| 1 | DP tailor | Minimal 50% sebelum order masuk proses |
| 2 | Pelunasan | Order tidak boleh diserahkan sebelum lunas |
| 3 | Konveksi | Produksi dimulai hanya setelah full payment verified |
| 4 | Transfer | Transfer harus diverifikasi sebelum dianggap diterima |
| 5 | Loyalty | Perlu diputuskan batas transaksi yang tepat |
| 6 | Shipping | Perlu diputuskan scope produk/order yang bisa dikirim |

---

## Kesimpulan

Jika sistem masih dalam tahap perancangan, maka tabel elisitasi dipakai bukan untuk menilai kode yang sudah ada, tetapi untuk:

- menangkap kebutuhan client
- menerjemahkan bahasa bisnis ke bahasa sistem
- menyaring requirement inti dan non-inti
- mengidentifikasi area yang ambigu
- menyusun final draft kebutuhan yang siap dibawa ke tahap PRD dan development

Dalam konteks Djaitin, hasil elisitasi perancangan mengarah ke sistem terpadu yang mencakup:

- tailor
- ready-to-wear
- konveksi
- pembayaran
- pengiriman
- administrasi office
- laporan operasional

sedangkan keputusan yang masih perlu dibicarakan lebih lanjut dengan client adalah:

- rule loyalti final
- detail due date dan pickup control
- kedalaman modul corporate / CRM
- tingkat detail shipping dan delivery scope

