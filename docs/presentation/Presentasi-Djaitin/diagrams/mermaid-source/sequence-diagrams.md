# Sequence Diagram Djaitin

Diagram interaksi disusun berdasarkan controller, service, dan elisitasi final sistem Djaitin. Setiap pesan ditulis dalam bahasa bisnis agar mudah dibaca lintas peran.

## SD-1 Login Pengguna

```mermaid
sequenceDiagram
    autonumber
    actor Pengguna as Customer / Staff
    participant Aplikasi as Aplikasi Djaitin
    participant Akses as Layanan Hak Akses
    participant DataUser as Data Pengguna

    Pengguna->>Aplikasi: Membuka halaman login
    activate Aplikasi
    Pengguna->>Aplikasi: Mengisi email dan kata sandi
    Aplikasi->>Akses: Memeriksa kelengkapan identitas
    activate Akses
    Akses->>DataUser: Mencocokkan akun dan kata sandi
    activate DataUser
    DataUser-->>Akses: Status kecocokan akun
    deactivate DataUser
    Akses-->>Aplikasi: Menentukan peran pengguna
    deactivate Akses
    Aplikasi-->>Pengguna: Menampilkan dashboard sesuai peran
    deactivate Aplikasi

    Note over Akses,DataUser: Bila akun tidak valid, sistem menolak login dan menampilkan pesan kesalahan.
```

## SD-2 Order Tailor dan Pembayaran DP

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Aplikasi as Aplikasi Djaitin
    actor Office as Staff / Kasir
    participant Pesanan as Data Pesanan Tailor
    participant Pembayaran as Data Pembayaran

    Customer->>Aplikasi: Memilih layanan jahit custom
    activate Aplikasi
    Customer->>Aplikasi: Mengisi model, bahan, ukuran, dan catatan
    Aplikasi->>Pesanan: Menyimpan rancangan pesanan tailor
    activate Pesanan
    Pesanan-->>Aplikasi: Konfirmasi rancangan tersimpan
    deactivate Pesanan
    Aplikasi->>Office: Mengirim pengajuan untuk ditinjau
    activate Office
    Office-->>Aplikasi: Menetapkan estimasi harga dan jadwal
    deactivate Office
    Aplikasi-->>Customer: Menampilkan nominal DP minimal 50 persen

    Customer->>Aplikasi: Melakukan pembayaran DP
    Aplikasi->>Pembayaran: Mencatat DP sebagai menunggu verifikasi
    activate Pembayaran
    Pembayaran-->>Aplikasi: Konfirmasi pembayaran tercatat
    deactivate Pembayaran
    Aplikasi->>Pesanan: Mengubah status pesanan menjadi menunggu pembayaran sah
    deactivate Aplikasi

    Note over Pembayaran: Aturan bisnis: DP tailor minimal 50 persen dari estimasi biaya.
```

## SD-3 Checkout Ready-to-Wear

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Katalog as Katalog Produk
    participant Keranjang as Keranjang Belanja
    participant Stok as Data Stok Produk
    participant Pembayaran as Data Pembayaran

    Customer->>Katalog: Melihat katalog pakaian siap pakai
    activate Katalog
    Customer->>Katalog: Memilih produk, ukuran, dan jumlah
    Katalog->>Stok: Memastikan ketersediaan stok
    activate Stok
    Stok-->>Katalog: Stok tersedia
    deactivate Stok
    Katalog->>Keranjang: Menambahkan produk ke keranjang
    deactivate Katalog
    activate Keranjang

    Customer->>Keranjang: Memeriksa rincian belanja
    Customer->>Keranjang: Mengonfirmasi checkout
    Keranjang->>Stok: Mengamankan stok untuk pesanan
    activate Stok
    Stok-->>Keranjang: Stok teramankan
    deactivate Stok
    Keranjang->>Pembayaran: Membuat tagihan pembayaran penuh
    activate Pembayaran
    Pembayaran-->>Keranjang: Tagihan dibuat
    deactivate Pembayaran
    Keranjang-->>Customer: Menampilkan ringkasan order dan instruksi pembayaran
    deactivate Keranjang

    Note over Stok: Bila stok tidak cukup, customer diminta mengubah jumlah atau memilih produk lain.
```

## SD-4 Pengajuan Order Konveksi

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Aplikasi as Aplikasi Djaitin
    actor Office as Staff / Kasir
    participant Pesanan as Data Pesanan Konveksi
    participant Lampiran as Dokumen Referensi
    participant Pembayaran as Data Pembayaran

    Customer->>Aplikasi: Membuka formulir konveksi
    activate Aplikasi
    Customer->>Aplikasi: Mengisi data perusahaan dan kebutuhan produksi
    Customer->>Aplikasi: Menyertakan file referensi desain
    Customer->>Aplikasi: Memasukkan rincian item dan harga
    Customer->>Aplikasi: Mengonfirmasi pembayaran penuh

    Aplikasi->>Pesanan: Membuat pesanan konveksi baru
    activate Pesanan
    Pesanan-->>Aplikasi: Pesanan tercatat sebagai menunggu pembayaran
    deactivate Pesanan

    Aplikasi->>Lampiran: Menyimpan file referensi desain
    activate Lampiran
    Lampiran-->>Aplikasi: Referensi tersimpan
    deactivate Lampiran

    Aplikasi->>Pembayaran: Mencatat pembayaran penuh menunggu verifikasi
    activate Pembayaran
    Pembayaran-->>Aplikasi: Pembayaran tercatat
    deactivate Pembayaran

    Aplikasi->>Office: Memberi notifikasi pengajuan baru
    Aplikasi-->>Customer: Menampilkan ringkasan pengajuan dan instruksi pembayaran
    deactivate Aplikasi

    Note over Pesanan: Aturan bisnis: produksi konveksi dimulai setelah pembayaran penuh terverifikasi.
```

## SD-5 Verifikasi Pembayaran

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Aplikasi as Aplikasi Djaitin
    actor Office as Staff / Kasir
    participant Pembayaran as Data Pembayaran
    participant Dokumen as Kwitansi

    Customer->>Aplikasi: Mengunggah bukti transfer
    activate Aplikasi
    Aplikasi->>Pembayaran: Mencatat pembayaran menunggu verifikasi
    activate Pembayaran
    Pembayaran-->>Aplikasi: Status menunggu verifikasi
    deactivate Pembayaran
    Aplikasi-->>Customer: Mengonfirmasi bukti diterima
    deactivate Aplikasi

    Office->>Aplikasi: Membuka daftar pembayaran perlu diperiksa
    activate Aplikasi
    Aplikasi-->>Office: Menampilkan antrean verifikasi
    Office->>Aplikasi: Memeriksa bukti dan nominal
    Aplikasi->>Pembayaran: Mengesahkan pembayaran
    activate Pembayaran
    Pembayaran-->>Aplikasi: Pembayaran sah
    deactivate Pembayaran
    Aplikasi->>Dokumen: Menerbitkan kwitansi pembayaran
    activate Dokumen
    Dokumen-->>Aplikasi: Kwitansi terbit
    deactivate Dokumen
    Aplikasi-->>Customer: Mengirim pemberitahuan pembayaran sah
    Aplikasi-->>Office: Memperbarui status order terkait
    deactivate Aplikasi

    Note over Pembayaran: Bila bukti tidak sesuai, pembayaran ditolak dan customer diminta mengunggah ulang.
```

## SD-6 Produksi dan Pengiriman

```mermaid
sequenceDiagram
    autonumber
    actor Office as Staff / Kasir
    actor Produksi as Tim Produksi
    participant Aplikasi as Aplikasi Djaitin
    participant Pesanan as Data Pesanan
    actor Kurir as Kurir / Pengiriman
    actor Customer

    Office->>Aplikasi: Memastikan pembayaran telah sah
    activate Aplikasi
    Aplikasi-->>Office: Konfirmasi status pembayaran lunas
    Office->>Produksi: Menyerahkan order untuk diproduksi
    deactivate Aplikasi

    activate Produksi
    Produksi->>Aplikasi: Memperbarui status sedang diproduksi
    activate Aplikasi
    Aplikasi->>Pesanan: Mencatat progres produksi
    activate Pesanan
    Pesanan-->>Aplikasi: Progres tersimpan
    deactivate Pesanan
    deactivate Aplikasi
    Produksi->>Aplikasi: Menandai pesanan selesai
    deactivate Produksi
    activate Aplikasi
    Aplikasi-->>Customer: Memberi notifikasi pesanan siap

    Office->>Aplikasi: Memilih ambil di tempat atau dikirim
    Aplikasi->>Kurir: Membuat data pengiriman bila perlu
    activate Kurir
    Kurir-->>Aplikasi: Konfirmasi penjadwalan pengiriman
    Kurir->>Customer: Mengirim pesanan ke alamat customer
    deactivate Kurir
    Aplikasi->>Pesanan: Menutup pesanan setelah diterima
    activate Pesanan
    Pesanan-->>Aplikasi: Pesanan ditutup
    deactivate Pesanan
    deactivate Aplikasi

    Note over Office: Pelunasan wajib sebelum pesanan diserahkan kepada customer.
```

## Catatan Pembacaan

- `actor` digunakan untuk peran manusia, baik customer maupun staf internal.
- `participant` digunakan untuk komponen sistem, baik aplikasi, layanan, maupun gudang data.
- Pesan utama digambar dengan panah penuh, sedangkan balasan digambar dengan panah putus-putus.
- Bar aktivasi dihasilkan otomatis oleh `activate` dan `deactivate` agar partisipan terlihat aktif selama menangani pesan.
- Penomoran otomatis dengan `autonumber` membantu rujukan langkah pada laporan.
