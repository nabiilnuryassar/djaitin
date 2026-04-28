# Elisitasi Sistem Djaitin Dengan Metode MDI Dan TOE

**Versi:** 1.0  
**Tanggal:** 2026-04-08  
**Konteks:** sistem masih pada tahap perancangan, requirement diperoleh dari observasi, wawancara, dan arahan client

## Pendahuluan

Dokumen ini menyusun elisitasi kebutuhan sistem Djaitin berdasarkan tiga tahapan utama:

1. `Elisitasi Tahap I`
2. `Elisitasi Tahap II` dengan metode `MDI`
3. `Elisitasi Tahap III` dengan metode `TOE` menggunakan opsi `HML`

Hasil akhirnya adalah `Final Draft Elisitasi` yang dipakai sebagai dasar acuan utama dalam pembuatan sistem.

## Gambaran Singkat Requirement Client

Berdasarkan narasi client, bisnis Djaitin memiliki kebutuhan sebagai berikut:

- melayani jahit pakaian sesuai permintaan pelanggan
- menjual pakaian siap pakai
- menerima pesanan konveksi dalam jumlah besar
- menyimpan data pelanggan, ukuran, dan model pakaian
- menerapkan DP minimal 50% untuk layanan jahit
- mewajibkan pelunasan sebelum pesanan dibawa pulang
- mewajibkan pembayaran penuh untuk konveksi sebelum produksi
- mendukung pembayaran tunai dan transfer
- menyediakan kwitansi dan nota
- mendukung pengiriman untuk pesanan tertentu
- membantu administrasi, pelayanan, penjualan, dan laporan

---

## Elisitasi Tahap I

Tahap ini merupakan kumpulan seluruh rancangan sistem baru yang diusulkan berdasarkan data lapangan dan masukan client. Semua requirement pada tahap ini masih berupa data mentah dan belum difilter.

### Tabel Elisitasi Tahap I

| No | Requirement | Keterangan |
|---|---|---|
| 1 | Sistem menyediakan menu login untuk customer dan staff | Agar pengguna dapat masuk sesuai perannya |
| 2 | Sistem menyediakan dashboard customer | Untuk melihat ringkasan pesanan dan pembayaran |
| 3 | Sistem menyediakan dashboard office | Untuk melihat aktivitas operasional harian |
| 4 | Sistem menyediakan pemesanan tailor/custom | Untuk layanan jahit sesuai permintaan |
| 5 | Sistem menyimpan data ukuran pelanggan | Agar pelanggan lama mudah dilayani kembali |
| 6 | Sistem menyimpan riwayat model pakaian pelanggan | Untuk referensi order berikutnya |
| 7 | Sistem menyediakan katalog pakaian siap pakai | Untuk mendukung penjualan ready-to-wear |
| 8 | Sistem menyediakan keranjang belanja | Untuk proses pembelian pakaian siap pakai |
| 9 | Sistem menyediakan checkout pembelian | Untuk menyelesaikan transaksi ready-to-wear |
| 10 | Sistem menyediakan pengajuan order konveksi | Untuk pesanan dalam jumlah besar |
| 11 | Sistem menyediakan upload file referensi konveksi | Untuk membantu proses desain dan produksi |
| 12 | Sistem menyediakan pencatatan pembayaran tunai | Untuk transaksi langsung |
| 13 | Sistem menyediakan upload bukti transfer | Untuk pembayaran melalui bank |
| 14 | Sistem menyediakan verifikasi pembayaran transfer | Agar pembayaran dinyatakan sah setelah diverifikasi |
| 15 | Sistem menyediakan nota pesanan | Untuk bukti administrasi order |
| 16 | Sistem menyediakan kwitansi pembayaran | Untuk bukti pembayaran |
| 17 | Sistem menerapkan DP minimal 50% untuk tailor | Sebagai aturan bisnis layanan jahit |
| 18 | Sistem mewajibkan pelunasan sebelum pesanan diambil | Sebagai aturan bisnis penyerahan barang |
| 19 | Sistem mewajibkan full payment untuk konveksi sebelum produksi | Sebagai aturan bisnis layanan konveksi |
| 20 | Sistem menyediakan pengiriman untuk pesanan tertentu | Untuk pesanan yang perlu dikirim ke alamat customer |
| 21 | Sistem menyediakan pengelolaan data pelanggan | Untuk kebutuhan administrasi |
| 22 | Sistem menyediakan pengelolaan produk, bahan, dan model | Untuk master data usaha |
| 23 | Sistem menyediakan laporan operasional | Untuk kebutuhan admin dan owner |
| 24 | Sistem menyediakan audit log | Untuk pencatatan aktivitas penting |
| 25 | Sistem menyediakan notifikasi status pesanan | Untuk memberi informasi ke customer |
| 26 | Sistem menyediakan fitur chat antara customer dan office | Untuk komunikasi selama proses order |
| 27 | Sistem menyediakan approval desain berbasis board | Untuk mengelola revisi desain konveksi |
| 28 | Sistem menyediakan CRM dan pemasaran pelanggan | Untuk promosi dan retensi pelanggan |

---

## Elisitasi Tahap II

Tahap ini merupakan pengklasifikasian hasil elisitasi tahap I menggunakan metode `MDI`:

- `M (Mandatory)`: wajib ada
- `D (Desirable)`: baik jika ada, tetapi tidak wajib
- `I (Inessential)`: di luar pembahasan inti sistem

### Tabel Elisitasi Tahap II

| No | Requirement | MDI | Alasan |
|---|---|---|---|
| 1 | Sistem menyediakan menu login untuk customer dan staff | M | Wajib untuk kontrol akses |
| 2 | Sistem menyediakan dashboard customer | M | Diperlukan untuk akses informasi customer |
| 3 | Sistem menyediakan dashboard office | M | Diperlukan untuk operasional harian |
| 4 | Sistem menyediakan pemesanan tailor/custom | M | Layanan inti bisnis |
| 5 | Sistem menyimpan data ukuran pelanggan | M | Dibutuhkan untuk pelayanan ulang |
| 6 | Sistem menyimpan riwayat model pakaian pelanggan | D | Sangat membantu, namun bisa disederhanakan di fase awal |
| 7 | Sistem menyediakan katalog pakaian siap pakai | M | Bagian inti bisnis ready-to-wear |
| 8 | Sistem menyediakan keranjang belanja | M | Dibutuhkan untuk pembelian RTW |
| 9 | Sistem menyediakan checkout pembelian | M | Dibutuhkan untuk menyelesaikan transaksi |
| 10 | Sistem menyediakan pengajuan order konveksi | M | Bagian inti bisnis konveksi |
| 11 | Sistem menyediakan upload file referensi konveksi | M | Dibutuhkan untuk mendukung order konveksi |
| 12 | Sistem menyediakan pencatatan pembayaran tunai | M | Dibutuhkan oleh operasional |
| 13 | Sistem menyediakan upload bukti transfer | M | Dibutuhkan untuk pembayaran transfer |
| 14 | Sistem menyediakan verifikasi pembayaran transfer | M | Aturan bisnis penting |
| 15 | Sistem menyediakan nota pesanan | M | Dokumen administrasi inti |
| 16 | Sistem menyediakan kwitansi pembayaran | M | Dokumen pembayaran inti |
| 17 | Sistem menerapkan DP minimal 50% untuk tailor | M | Rule bisnis utama |
| 18 | Sistem mewajibkan pelunasan sebelum pesanan diambil | M | Rule bisnis utama |
| 19 | Sistem mewajibkan full payment untuk konveksi sebelum produksi | M | Rule bisnis utama |
| 20 | Sistem menyediakan pengiriman untuk pesanan tertentu | D | Menambah kualitas layanan, tetapi tidak semua transaksi memerlukannya |
| 21 | Sistem menyediakan pengelolaan data pelanggan | M | Kebutuhan administrasi utama |
| 22 | Sistem menyediakan pengelolaan produk, bahan, dan model | M | Dibutuhkan sebagai master data |
| 23 | Sistem menyediakan laporan operasional | M | Dibutuhkan owner/admin |
| 24 | Sistem menyediakan audit log | D | Sangat baik untuk kontrol, tetapi bisa diposisikan sebagai fitur pendukung |
| 25 | Sistem menyediakan notifikasi status pesanan | D | Menambah kenyamanan pengguna |
| 26 | Sistem menyediakan fitur chat antara customer dan office | I | Bukan kebutuhan inti sistem yang dibahas |
| 27 | Sistem menyediakan approval desain berbasis board | I | Terlalu spesifik dan di luar kebutuhan inti dasar |
| 28 | Sistem menyediakan CRM dan pemasaran pelanggan | I | Di luar scope utama sistem awal |

### Hasil Elisitasi Tahap II

Hasil tahap II menunjukkan bahwa:

- requirement dengan kategori `M` harus dipertahankan
- requirement dengan kategori `D` boleh dipertahankan jika sumber daya memungkinkan
- requirement dengan kategori `I` harus dieliminasi dari scope inti

---

## Elisitasi Tahap III

Tahap ini merupakan hasil penyusutan dari elisitasi tahap II dengan mengeliminasi semua requirement kategori `I`, lalu mengklasifikasikan sisanya menggunakan metode `TOE` dengan opsi `HML`.

Penilaian dilakukan sebagai berikut:

- `T (Technical)`: tingkat kesulitan teknis
- `O (Operational)`: tingkat kesulitan operasional / penggunaan
- `E (Economic)`: tingkat beban biaya

Nilai:

- `H`: sulit / mahal, cenderung dieliminasi
- `M`: mampu dikerjakan
- `L`: mudah dikerjakan

### Tabel Elisitasi Tahap III

| No | Requirement | T | O | E | HML | Keterangan |
|---|---|---|---|---|---|---|
| 1 | Login customer dan staff | L | L | L | L | Mudah dibangun dan wajib |
| 2 | Dashboard customer | M | L | L | M | Perlu rangkuman data, tetapi masih realistis |
| 3 | Dashboard office | M | M | L | M | Membutuhkan agregasi data operasional |
| 4 | Pemesanan tailor/custom | M | M | M | M | Inti sistem, layak dikerjakan |
| 5 | Penyimpanan data ukuran pelanggan | M | L | L | M | Perlu desain data yang baik |
| 6 | Riwayat model pakaian pelanggan | M | L | L | M | Bisa dikerjakan sebagai histori tambahan |
| 7 | Katalog pakaian siap pakai | M | L | M | M | Perlu pengelolaan produk dan ukuran |
| 8 | Keranjang belanja | M | L | L | M | Fitur umum dan feasible |
| 9 | Checkout pembelian | M | M | M | M | Butuh integrasi stok dan pembayaran |
| 10 | Pengajuan order konveksi | M | M | M | M | Perlu formulir dan struktur data order |
| 11 | Upload file referensi konveksi | L | L | L | L | Mudah diterapkan |
| 12 | Pencatatan pembayaran tunai | L | L | L | L | Sangat penting dan mudah |
| 13 | Upload bukti transfer | L | L | L | L | Feasible dan umum |
| 14 | Verifikasi pembayaran transfer | M | L | L | M | Butuh role dan status verification |
| 15 | Nota pesanan | M | L | M | M | Perlu format dokumen |
| 16 | Kwitansi pembayaran | M | L | M | M | Perlu format dokumen |
| 17 | DP minimal 50% untuk tailor | L | L | L | L | Rule mudah diterapkan |
| 18 | Pelunasan sebelum pesanan diambil | L | L | L | L | Rule mudah diterapkan |
| 19 | Full payment konveksi sebelum produksi | L | L | L | L | Rule mudah diterapkan |
| 20 | Pengiriman untuk pesanan tertentu | M | M | M | M | Perlu data alamat, ongkir, dan status kirim |
| 21 | Pengelolaan data pelanggan | M | L | L | M | Inti administrasi |
| 22 | Pengelolaan produk, bahan, dan model | M | M | M | M | Butuh master data backend |
| 23 | Laporan operasional | M | M | M | M | Penting untuk owner/admin |
| 24 | Audit log | M | M | M | M | Dapat dibangun, tetapi bukan yang paling awal |
| 25 | Notifikasi status pesanan | M | L | M | M | Menambah kualitas layanan |

### Hasil Elisitasi Tahap III

Berdasarkan hasil penilaian:

- requirement kategori `L` dan `M` dapat dipertahankan
- tidak ada requirement tersisa yang wajib dieliminasi karena `H`
- requirement kategori `D` dari tahap II yang mendapat nilai `M` atau `L` dapat dimasukkan bila masih sesuai dengan scope MVP

---

## Final Draft Elisitasi

Final draft elisitasi adalah requirement akhir yang digunakan sebagai dasar utama dalam pembangunan sistem Djaitin.

### Tabel Final Draft Elisitasi

| No | Requirement Final | Prioritas | Keterangan |
|---|---|---|---|
| 1 | Sistem menyediakan login untuk customer dan staff | Tinggi | Dasar autentikasi dan otorisasi |
| 2 | Sistem menyediakan dashboard customer | Tinggi | Ringkasan order, payment, dan aktivitas customer |
| 3 | Sistem menyediakan dashboard office | Tinggi | Ringkasan operasional harian |
| 4 | Sistem mendukung pemesanan tailor/custom | Tinggi | Layanan inti tailor |
| 5 | Sistem menyimpan data ukuran pelanggan | Tinggi | Untuk reuse pada order berikutnya |
| 6 | Sistem menyediakan katalog pakaian siap pakai | Tinggi | Layanan inti ready-to-wear |
| 7 | Sistem menyediakan keranjang belanja dan checkout | Tinggi | Proses transaksi RTW |
| 8 | Sistem mendukung pengajuan order konveksi | Tinggi | Layanan inti konveksi |
| 9 | Sistem mendukung upload file referensi konveksi | Tinggi | Pendukung proses konveksi |
| 10 | Sistem mendukung pembayaran tunai dan transfer | Tinggi | Kebutuhan transaksi utama |
| 11 | Sistem memverifikasi pembayaran transfer | Tinggi | Rule bisnis utama |
| 12 | Sistem menghasilkan nota pesanan | Tinggi | Dokumen transaksi |
| 13 | Sistem menghasilkan kwitansi pembayaran | Tinggi | Dokumen transaksi |
| 14 | Sistem menerapkan DP minimal 50% untuk tailor | Tinggi | Rule bisnis utama |
| 15 | Sistem mewajibkan pelunasan sebelum pesanan diambil | Tinggi | Rule bisnis utama |
| 16 | Sistem mewajibkan full payment konveksi sebelum produksi | Tinggi | Rule bisnis utama |
| 17 | Sistem menyediakan pengelolaan data pelanggan | Tinggi | Administrasi utama |
| 18 | Sistem menyediakan pengelolaan produk, bahan, dan model | Tinggi | Master data utama |
| 19 | Sistem menyediakan laporan operasional | Tinggi | Kebutuhan admin dan owner |
| 20 | Sistem menyediakan pengiriman untuk pesanan tertentu | Sedang | Menambah kualitas layanan |
| 21 | Sistem menyediakan notifikasi status pesanan | Sedang | Menambah kenyamanan pengguna |
| 22 | Sistem menyediakan audit log | Sedang | Pendukung kontrol dan monitoring |
| 23 | Sistem menyimpan riwayat model pakaian pelanggan | Sedang | Pendukung layanan ulang customer |

## Requirement Yang Tidak Masuk Final Draft

| No | Requirement | Alasan Tidak Masuk |
|---|---|---|
| 1 | Fitur chat antara customer dan office | Di luar kebutuhan inti sistem awal |
| 2 | Approval desain berbasis board | Terlalu spesifik dan tidak wajib untuk baseline sistem |
| 3 | CRM dan pemasaran pelanggan | Di luar scope utama fase awal |

---

## Kesimpulan

Dengan mengikuti metodologi elisitasi formal:

- `Tahap I` menghasilkan data mentah requirement
- `Tahap II` menyaring requirement menggunakan `MDI`
- `Tahap III` menilai kelayakan requirement menggunakan `TOE` dengan `HML`
- `Final Draft Elisitasi` menjadi dasar utama bagi PRD dan pembangunan sistem

Dalam konteks Djaitin, final draft mengarah pada sistem operasional terpadu yang fokus pada:

- tailor
- ready-to-wear
- konveksi
- pembayaran
- dokumen transaksi
- pengiriman
- administrasi customer dan master data
- laporan operasional

