# MVP App, UML, dan Use Case - Djaitin

**Tanggal:** 2026-04-28  
**Basis evaluasi:** `docs/PRD.md`, `docs/MVP-READINESS.md`, route `/app`, route `/office`, model Eloquent, service order/payment, dan skema database saat ini.  
**Status:** MVP operasional layak, dengan catatan go-live dan beberapa cleanup non-blocking.
**Update:** 2026-05-24 — UC-17 s/d UC-20 ditambahkan; class diagram disinkronkan dengan kode aktual; OrderStatus ditambah `awaiting_price`.
**Revisi presentasi:** 2026-05-24 — seluruh diagram UML (use case, class, sequence, activity) ditulis ulang dengan bahasa Indonesia yang lebih mudah dibaca dan notasi UML standar (visibility `+/-/#`, format `atribut : Tipe`, `method() : Tipe`) sesuai panduan class diagram pada [Dicoding Blog — Memahami Class Diagram Lebih Baik](https://www.dicoding.com/blog/memahami-class-diagram-lebih-baik/). Cocok dipakai untuk presentasi mahasiswa informatika.

## 1. Ringkasan MVP

Djaitin saat ini sudah cukup untuk disebut **MVP operasional** karena alur inti dari PRD sudah tersedia:

| Area           | Kebutuhan PRD                                                            | Implementasi App                                                                           | Status MVP |
| -------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ---------- |
| Public surface | Landing, login/register, service pages                                   | `/app`, catalog, service tailor/RTW/convection, auth Fortify                               | Siap       |
| Customer app   | Dashboard, profile, alamat, ukuran, order, payment, notification         | Route customer di `/app` dengan middleware `auth` dan `role:customer`                      | Siap       |
| Tailor         | Configurator, draft, order, DP 50%, payment gate                         | Tailor configurator, draft submit, minimum DP validation, payment record                   | Siap       |
| Ready-to-wear  | Catalog, cart, checkout, stok, delivery/pickup, ongkir kurir             | Product, cart, checkout, shipment, courier `base_fee`, stock decrement on verified payment | Siap       |
| Convection     | Order jumlah besar, attachment, full payment before production           | Convection order service mewajibkan total item dan pembayaran penuh                        | Siap       |
| Office app     | Dashboard, customer, order, payment, production, shipping, report, audit | Route `/office` mencakup semua area tersebut                                               | Siap       |
| Admin          | User, product, garment model, fabric, courier, discount                  | Resource admin di `/office/admin/*`                                                        | Siap       |
| Documents      | Nota, kwitansi, export report                                            | Document controller untuk nota/kwitansi dan report export                                  | Siap       |
| Notification   | Payment/order status untuk customer terkait                              | Laravel notifications untuk payment verified/rejected dan status penting                   | Siap       |
| Auditability   | Catatan perubahan penting                                                | `audit_logs` polymorphic ke order/payment/entity lain                                      | Siap       |

Kesimpulan: **sistem sudah mirip dan selaras dengan dokumen PRD MVP**. Yang perlu dipahami, MVP bukan berarti seluruh proses bisnis sudah sempurna untuk skala besar. MVP berarti customer, kasir, produksi, admin, dan owner sudah dapat menjalankan alur inti dalam satu sistem dengan batasan operasional yang jelas.

## 2. Batasan MVP

Fitur yang dianggap masuk MVP:

| Modul            | Scope                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Customer portal  | Registrasi, login, dashboard, profile, alamat, ukuran, order tailor, order RTW, order konveksi, payment proof, riwayat order, notification                                                       |
| Office operation | Customer management, order management, manual tailor order, payment verify/reject, production board, shipping, reports, audit log                                                                |
| Admin operation  | User internal, produk RTW, kain, model pakaian, courier, discount policy                                                                                                                         |
| Business rule    | DP tailor minimal 50% saat order dicatat, konveksi harus lunas sebelum produksi, ongkir RTW dari courier, RTW stock turun setelah payment verified, nota/kwitansi hanya setelah payment verified |
| Documentation    | PRD, readiness, manual user, go-live checklist, release notes, deployment runbook                                                                                                                |

Yang **bukan** target MVP:

| Area                               | Alasan                                                            |
| ---------------------------------- | ----------------------------------------------------------------- |
| Multi-branch inventory             | Belum dibutuhkan untuk validasi operasi awal                      |
| Integrasi payment gateway otomatis | MVP masih valid dengan cash dan transfer manual                   |
| Integrasi ekspedisi real-time      | Shipping masih cukup menggunakan courier, resi, dan status manual |
| CRM/marketing automation           | Di luar kebutuhan operasional inti PRD                            |
| Accounting lengkap                 | MVP hanya mencakup payment, kwitansi, report operasional          |
| Mobile native app                  | Customer app web mobile sudah cukup untuk MVP                     |

## 3. Catatan Kesesuaian dengan PRD

| PRD Rule                                                   | Implementasi Saat Ini                                                                                  | Catatan                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Customer hanya melihat data miliknya                       | Route customer memakai `auth` dan `role:customer`; controller/service memakai customer terkait user    | Perlu tetap diuji lewat feature test untuk setiap endpoint sensitif |
| Staff office tidak menjadi customer portal                 | Role helper memisahkan `canAccessCustomer()` dan `canAccessOffice()`                                   | Selaras                                                             |
| Tailor dicatat dengan DP awal minimal 50%                  | Customer dan office tailor flow menolak payment amount di bawah 50% total                              | Selaras                                                             |
| Tailor masuk produksi setelah DP minimal 50% terverifikasi | Payment service menghitung paid/outstanding; order status service melakukan gate sebelum `in_progress` | Selaras                                                             |
| Konveksi masuk produksi setelah lunas terverifikasi        | `ConvectionOrderService::validateFullPaymentGate()`                                                    | Selaras                                                             |
| RTW delivery tidak menambah biaya selain ongkir jasa kirim | Checkout memakai `base_fee` dari master courier sebagai `shipping_cost`                                | Selaras                                                             |
| RTW stock turun setelah verified payment                   | `PaymentService` memanggil stock decrement saat payment verified pertama                               | Selaras                                                             |
| Nota/kwitansi hanya setelah payment verified               | Route dokumen tersedia; controller menolak akses tanpa payment verified                                | Selaras                                                             |
| Nota Pesanan memuat tanggal selesai                        | Nota menampilkan `due_date` sebagai target selesai jika tersedia                                       | Selaras                                                             |
| Notification untuk customer terkait                        | Payment verification/rejection mengirim notifikasi ke user customer order                              | Selaras                                                             |

Catatan teknis non-blocking: model `Order` masih menyimpan field kompatibilitas lama seperti `quotation_notes`, `quoted_by`, dan `quoted_at`. Flow RFQ/quotation tidak aktif di customer atau office, sehingga tidak menjadi bagian baseline PRD.

## 4. Aktor Sistem

| Aktor    | Peran                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------ |
| Guest    | Melihat landing, layanan, katalog, lalu registrasi/login                                         |
| Customer | Membuat order, mengelola profil, membayar sesuai rule, melihat status, menerima notifikasi       |
| Kasir    | Mencatat order manual, mencatat payment cash/transfer, memverifikasi transfer, mencetak kwitansi |
| Produksi | Memantau order aktif dan memperbarui status produksi                                             |
| Admin    | Mengelola master data, user, produk, report, audit                                               |
| Owner    | Melihat dashboard, report, audit log, dan kondisi operasional                                    |

## 5. Daftar Use Case

Daftar berikut adalah ringkasan use case sistem Djaitin. Setiap use case dijelaskan secara naratif sehingga mudah disampaikan saat presentasi.

| ID    | Use Case                               | Aktor Utama      | Tujuan Singkat                                                   | Hasil Akhir                                                        |
| ----- | -------------------------------------- | ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| UC-01 | Registrasi & Login                     | Tamu, Pelanggan  | Membuat akun baru atau masuk ke portal pelanggan                 | Akun pelanggan aktif beserta profil dasarnya tersedia              |
| UC-02 | Mengelola Profil Pelanggan             | Pelanggan        | Menyimpan kontak, alamat, dan ukuran badan                       | Data pelanggan, alamat, dan ukuran tersimpan                       |
| UC-03 | Mengatur Konfigurasi Jahit             | Pelanggan        | Mendesain pesanan jahit melalui wizard tailor                    | Rancangan pesanan jahit terbentuk                                  |
| UC-04 | Mengirim Pesanan Jahit                 | Pelanggan        | Mengirim pesanan jahit dengan DP minimal 50%                     | Pesanan jahit berstatus "menunggu pembayaran"                      |
| UC-05 | Membeli Produk Siap Pakai              | Pelanggan        | Memilih produk, mengisi keranjang, lalu checkout                 | Pesanan ready-to-wear beserta itemnya tercatat                     |
| UC-06 | Mengajukan Pesanan Konveksi            | Pelanggan        | Membuat pesanan jumlah besar lengkap dengan referensi desain     | Pesanan konveksi, item, lampiran, dan pembayaran tercatat          |
| UC-07 | Mengunggah Bukti Pembayaran            | Pelanggan        | Mengirim bukti transfer atau mengganti bukti yang ditolak        | Pembayaran berstatus "menunggu verifikasi"                         |
| UC-08 | Memantau Riwayat Pesanan               | Pelanggan        | Melihat status pesanan dan rincian pembayaran                    | Detail pesanan dan status terbaru                                  |
| UC-09 | Mengelola Data Pelanggan               | Kasir, Admin     | Mencatat atau memperbarui pelanggan offline                      | Data pelanggan dan ukuran tersimpan                                |
| UC-10 | Membuat Pesanan Jahit Manual           | Kasir            | Mencatat pesanan dari pelanggan yang datang langsung             | Pesanan jahit tercatat dari sisi kantor                            |
| UC-11 | Memverifikasi Pembayaran               | Kasir, Admin     | Menyetujui atau menolak bukti transfer                           | Pembayaran terverifikasi/ditolak dan pelanggan menerima notifikasi |
| UC-12 | Mencetak Dokumen Transaksi             | Kasir, Admin     | Membuat nota dan kwitansi setelah pembayaran sah                 | Dokumen PDF nota / kwitansi                                        |
| UC-13 | Memperbarui Status Produksi            | Produksi, Admin  | Memindahkan pesanan antar tahap produksi                         | Status pesanan / tahap produksi berubah                            |
| UC-14 | Mengelola Pengiriman                   | Kasir, Admin     | Memilih kurir, resi, dan status pengiriman                       | Data pengiriman terbaru                                            |
| UC-15 | Mengelola Master Data                  | Admin            | Mengatur user internal, produk, kain, model, kurir, dan diskon   | Master data siap dipakai                                           |
| UC-16 | Melihat Laporan & Audit                | Admin, Pemilik   | Memantau omzet, pesanan, pembayaran, dan perubahan penting       | Laporan / ekspor dan jejak audit                                   |
| UC-17 | Mengaktifkan Two-Factor Authentication | Pelanggan, Staf  | Menambah lapisan keamanan akun via Fortify                       | Fitur 2FA aktif pada akun                                          |
| UC-18 | Menyimpan / Melanjutkan Draft          | Pelanggan        | Menyimpan konfigurasi tailor sebagai draft sebelum dikirim       | Draft pesanan tersimpan dalam payload jsonb                        |
| UC-19 | Membatalkan Pesanan                    | Pelanggan, Admin | Membatalkan pesanan disertai alasan dan jejak audit              | Pesanan berstatus "dibatalkan" beserta alasan dan pembatal         |
| UC-20 | Meninjau Lampiran Konveksi             | Kasir, Admin     | Meninjau lampiran desain (referensi → proposal → revisi → final) | Status persetujuan lampiran terbaru                                |

## 6. Diagram Use Case

```mermaid
flowchart LR
    Tamu((Tamu))
    Pelanggan((Pelanggan))
    Kasir((Kasir))
    Produksi((Produksi))
    Admin((Admin))
    Pemilik((Pemilik))

    subgraph Publik["Halaman Publik"]
        UC01["UC-01 Registrasi & Login"]
        UC00["Melihat Landing, Layanan, Katalog"]
    end

    subgraph AppPelanggan["Aplikasi Pelanggan (/app)"]
        UC02["UC-02 Mengelola Profil, Alamat, Ukuran"]
        UC03["UC-03 Mengatur Konfigurasi Jahit"]
        UC04["UC-04 Mengirim Pesanan Jahit"]
        UC05["UC-05 Checkout Produk Siap Pakai"]
        UC06["UC-06 Mengirim Pesanan Konveksi"]
        UC07["UC-07 Mengunggah Bukti Pembayaran"]
        UC08["UC-08 Memantau Pesanan & Notifikasi"]
        UC17["UC-17 Mengaktifkan Two-Factor Authentication"]
        UC18["UC-18 Menyimpan / Melanjutkan Draft"]
        UC19["UC-19 Membatalkan Pesanan"]
    end

    subgraph AppKantor["Aplikasi Kantor (/office)"]
        UC09["UC-09 Mengelola Data Pelanggan"]
        UC10["UC-10 Membuat Pesanan Jahit Manual"]
        UC11["UC-11 Memverifikasi / Menolak Pembayaran"]
        UC12["UC-12 Mencetak Nota / Kwitansi"]
        UC13["UC-13 Memperbarui Status Produksi"]
        UC14["UC-14 Mengelola Pengiriman"]
        UC16["UC-16 Laporan & Audit"]
        UC17O["UC-17 Mengaktifkan Two-Factor Authentication"]
        UC19O["UC-19 Membatalkan Pesanan"]
        UC20["UC-20 Meninjau Lampiran Konveksi"]
    end

    subgraph ModulAdmin["Modul Admin (/office/admin)"]
        UC15["UC-15 Mengelola User, Produk, Kain, Model, Kurir, Diskon"]
    end

    Tamu --> UC00
    Tamu --> UC01
    Pelanggan --> UC02
    Pelanggan --> UC03
    Pelanggan --> UC04
    Pelanggan --> UC05
    Pelanggan --> UC06
    Pelanggan --> UC07
    Pelanggan --> UC08
    Pelanggan --> UC17
    Pelanggan --> UC18
    Pelanggan --> UC19
    Kasir --> UC09
    Kasir --> UC10
    Kasir --> UC11
    Kasir --> UC12
    Kasir --> UC14
    Kasir --> UC17O
    Kasir --> UC20
    Produksi --> UC13
    Produksi --> UC17O
    Admin --> UC09
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC17O
    Admin --> UC19O
    Admin --> UC20
    Admin --> UC15
    Admin --> UC16
    Pemilik --> UC17O
    Pemilik --> UC16
```

## 7. Diagram Konteks Sistem

```mermaid
flowchart TB
    Pelanggan["Aplikasi Pelanggan (/app)"]
    Kantor["Aplikasi Kantor (/office)"]
    Admin["Modul Admin (/office/admin)"]

    Inertia["Antarmuka Inertia + React"]
    Laravel["Aplikasi Laravel 12"]
    Layanan["Layanan Domain: Order, Payment, Stock, Loyalty, Attachment, Audit"]
    DB[("Database PostgreSQL")]
    Storage[("Public Storage: Bukti Bayar & Lampiran")]
    Notifikasi["Notifikasi Laravel"]
    PDF["Dokumen PDF: Nota, Kwitansi, Ekspor Laporan"]

    Pelanggan --> Inertia
    Kantor --> Inertia
    Admin --> Inertia
    Inertia --> Laravel
    Laravel --> Layanan
    Layanan --> DB
    Layanan --> Storage
    Layanan --> Notifikasi
    Laravel --> PDF
```

## 8. Diagram Kelas (Class Diagram)

> **Cara membaca diagram kelas berdasarkan panduan [Dicoding — Memahami Class Diagram Lebih Baik](https://www.dicoding.com/blog/memahami-class-diagram-lebih-baik/):**
>
> Setiap kelas terdiri dari tiga bagian: **nama kelas** (atas), **atribut** (tengah), dan **operasi/method** (bawah). Tanda `+` artinya `public` (bisa diakses dari luar), `-` artinya `private` (hanya internal), dan `#` artinya `protected`. Format atribut ditulis `nama : Tipe`, sedangkan method ditulis `nama() : Tipe`.
>
> **Tiga jenis hubungan antar kelas yang dipakai:**
>
> - **Asosiasi** (garis lurus `--`): hubungan biasa antar kelas. Contoh: `Pelanggan` punya `Alamat`.
> - **Agregasi** (belah ketupat kosong `o--`): salah satu kelas adalah bagian dari yang lain, tapi tetap bisa berdiri sendiri. Contoh: `Keranjang` mengelompokkan `ItemKeranjang`.
> - **Komposisi** (belah ketupat penuh `*--`): bagian yang tidak bisa hidup tanpa induknya. Contoh: `Pesanan` punya `ItemPesanan` (item akan ikut hilang kalau pesanan dihapus).
> - **Pewarisan / Generalisasi** (panah segitiga kosong `<|--`): subclass mewarisi atribut dan method dari superclass.
>
> **Multiplisitas** (`1`, `0..1`, `1..*`, `0..*`) dipasang di kedua ujung relasi untuk menunjukkan banyaknya objek yang terlibat.

### 8.1 Diagram Kelas Inti — Pelanggan, Pesanan, Pembayaran

Diagram ini fokus pada alur utama bisnis Djaitin: pelanggan membuat pesanan, pesanan memiliki item dan pembayaran, lalu pesanan dikirim atau diambil.

```mermaid
classDiagram
    direction LR

    class Pengguna {
        +id : int
        +nama : string
        +email : string
        -password : string
        +peran : Peran
        +aktif : bool
        +bisaAksesPelanggan() bool
        +bisaAksesKantor() bool
        +bisaAksesCMS() bool
    }

    class Pelanggan {
        +id : int
        +pengguna_id : int
        +nama : string
        +telepon : string
        +alamat : string
        +loyaltyAktif : bool
        +jumlahPesananLoyalty : int
        +tambahAlamat(alamat) void
        +simpanUkuran(ukuran) void
    }

    class Alamat {
        +id : int
        +pelanggan_id : int
        +label : string
        +namaPenerima : string
        +telepon : string
        +baris : string
        +kota : string
        +provinsi : string
        +kodePos : string
        +utama : bool
    }

    class Ukuran {
        +id : int
        +pelanggan_id : int
        +label : string
        +dada : decimal
        +pinggang : decimal
        +pinggul : decimal
        +bahu : decimal
        +panjangLengan : decimal
        +panjangBaju : decimal
        +panjangCelana : decimal
    }

    class Keranjang {
        +id : int
        +pengguna_id : int
        +tambahProduk(produk, qty) void
        +bersihkan() void
    }

    class ItemKeranjang {
        +id : int
        +keranjang_id : int
        +produk_id : int
        +qty : int
        +hitungSubtotal() decimal
    }

    class Produk {
        +id : int
        +sku : string
        +nama : string
        +kategori : string
        +ukuran : string
        +hargaDasar : decimal
        +hargaJual : decimal
        +clearance : bool
        +diskonPersen : decimal
        +diskonNominal : decimal
        +deskripsi : string
        +pathGambar : string
        +stok : int
        +aktif : bool
        +hargaAkhir() decimal
    }

    class Pesanan {
        +id : int
        +nomorPesanan : string
        +jenis : JenisPesanan
        +status : StatusPesanan
        +tahapProduksi : TahapProduksi
        +tanggalSelesai : date
        +namaPerusahaan : string
        +totalHarga : decimal
        +sudahDibayar : decimal
        +sisaTagihan : decimal
        +alasanBatal : string
        +dibatalkanOleh : int
        +waktuDibatalkan : datetime
        +diskonLoyaltyDipakai : bool
        +subtotal : decimal
        +nominalDiskon : decimal
        +ongkir : decimal
        +catatanDesain : string
        +draftPayload : json
        +hitungTotal() decimal
        +bisaMasukProduksi() bool
        +batalkan(alasan, oleh) void
    }

    class ItemPesanan {
        +id : int
        +pesanan_id : int
        +produk_id : int
        +nama : string
        +ukuran : string
        +qty : int
        +hargaSatuan : decimal
        +subtotal : decimal
    }

    class Pembayaran {
        +id : int
        +nomorPembayaran : string
        +metode : MetodePembayaran
        +status : StatusPembayaran
        +nominal : decimal
        +tanggal : date
        +nomorReferensi : string
        +pathBukti : string
        +dibuatOleh : int
        +diverifikasiOleh : int
        +alasanTolak : string
        +catatan : string
        +waktuVerifikasi : datetime
        +verifikasi(oleh) void
        +tolak(oleh, alasan) void
    }

    class Pengiriman {
        +id : int
        +pesanan_id : int
        +status : StatusPengiriman
        +namaPenerima : string
        +alamatPenerima : string
        +nomorResi : string
        +waktuKirim : datetime
        +waktuTerima : datetime
        +tandaiTerkirim() void
    }

    class LampiranPesanan {
        +id : int
        +pesanan_id : int
        +pathFile : string
        +namaFile : string
        +tipeLampiran : TipeLampiran
        +judul : string
        +tipeBerkas : string
        +diunggahOleh : int
    }

    class JejakAudit {
        +id : int
        +aksi : string
        +tipeEntitas : string
        +entitas_id : int
        +nilaiLama : json
        +nilaiBaru : json
        +catatan : string
        +alamatIP : string
    }

    Pengguna "1" -- "0..1" Pelanggan : memiliki profil
    Pengguna "1" -- "0..1" Keranjang : memiliki
    Pengguna "1" -- "0..*" JejakAudit : mencatat
    Pelanggan "1" o-- "0..*" Alamat : kumpulan alamat
    Pelanggan "1" o-- "0..*" Ukuran : kumpulan ukuran
    Pelanggan "1" -- "0..*" Pesanan : memesan
    Keranjang "1" *-- "0..*" ItemKeranjang : terdiri dari
    Produk "1" -- "0..*" ItemKeranjang : dijadwalkan
    Produk "1" -- "0..*" ItemPesanan : tercantum
    Pesanan "1" *-- "1..*" ItemPesanan : memuat
    Pesanan "1" -- "0..*" Pembayaran : dibayar lewat
    Pesanan "1" -- "0..1" Pengiriman : dikirim via
    Pesanan "1" o-- "0..*" LampiranPesanan : memiliki lampiran
```

### 8.2 Diagram Kelas — Master Data dan Enumerasi

Kelompok ini berisi master data yang dipakai pesanan dan kumpulan enumerasi yang menjadi referensi status di seluruh sistem.

```mermaid
classDiagram
    direction LR

    class ModelPakaian {
        +id : int
        +nama : string
        +hargaDasar : decimal
        +aktif : bool
    }

    class Kain {
        +id : int
        +nama : string
        +penyesuaianHarga : decimal
        +aktif : bool
    }

    class Kurir {
        +id : int
        +nama : string
        +ongkirDasar : decimal
        +aktif : bool
    }

    class KebijakanDiskon {
        +id : int
        +kunci : string
        +nilai : string
        +deskripsi : string
    }

    class Pesanan {
        +id : int
        +nomorPesanan : string
        +jenis : JenisPesanan
        +status : StatusPesanan
    }

    class Pengiriman {
        +id : int
        +status : StatusPengiriman
    }

    class Peran {
        <<enumeration>>
        Pelanggan
        Kasir
        Produksi
        Admin
        Pemilik
    }

    class JenisPesanan {
        <<enumeration>>
        Jahit
        SiapPakai
        Konveksi
    }

    class StatusPesanan {
        <<enumeration>>
        Draft
        MenungguHarga
        MenungguPembayaran
        SedangDiproses
        Selesai
        Dikirim
        Diambil
        Ditutup
        Dibatalkan
    }

    class StatusPembayaran {
        <<enumeration>>
        MenungguVerifikasi
        Terverifikasi
        Ditolak
    }

    class MetodePembayaran {
        <<enumeration>>
        Tunai
        Transfer
    }

    class TahapProduksi {
        <<enumeration>>
        Desain
        PersiapanBahan
        Produksi
        QC
        Packing
        Pengiriman
    }

    class StatusPengiriman {
        <<enumeration>>
        Menunggu
        Dikirim
        Diterima
        Diambil
    }

    class TipeLampiran {
        <<enumeration>>
        Referensi
        ProposalDesain
        Revisi
        DesainFinal
        Lainnya
    }

    Pesanan "0..*" -- "0..1" ModelPakaian : memakai model
    Pesanan "0..*" -- "0..1" Kain : memakai kain
    Pengiriman "0..*" -- "0..1" Kurir : memakai kurir
    Pesanan ..> JenisPesanan : memakai
    Pesanan ..> StatusPesanan : memakai
    Pesanan ..> TahapProduksi : memakai
    Pengiriman ..> StatusPengiriman : memakai
```

### 8.3 Diagram Kelas — Layanan Domain (Service Layer)

Diagram ini menggambarkan layanan domain yang menjalankan aturan bisnis. Class kontrol seperti ini berperan sebagai "otak" sistem, sesuai pola MVC yang dijelaskan oleh Dicoding (interface, control, entity).

```mermaid
classDiagram
    direction LR

    class LayananJahit {
        -repoPelanggan : RepoPelanggan
        -layananLoyalty : LayananLoyalty
        -layananPembayaran : LayananPembayaran
        +buat(payload, pengguna) Pesanan
        +hitungTotal(payload) decimal
        +validasiDPMinimal(pesanan, dp) bool
    }

    class LayananSiapPakai {
        -layananStok : LayananStok
        -layananPembayaran : LayananPembayaran
        +buatDariKeranjang(keranjang, payload, pengguna) Pesanan
        +buatPengiriman(pesanan, kurir) Pengiriman
    }

    class LayananKonveksi {
        -layananLampiran : LayananLampiran
        -layananPembayaran : LayananPembayaran
        +buat(payload, pengguna) Pesanan
        +validasiPembayaranLunas(pesanan) void
    }

    class LayananPembayaran {
        +catat(pesanan, data) Pembayaran
        +verifikasiTransfer(pembayaran, oleh) void
        +tolak(pembayaran, oleh, alasan) void
        +hitungSudahDibayar(pesanan) decimal
    }

    class LayananStok {
        +validasiStok(produk, qty) void
        +kurangiSetelahVerifikasi(pesanan) void
    }

    class LayananLoyalty {
        +sinkronPelanggan(pelanggan) void
        +hitungDiskon(pesanan) decimal
    }

    class LayananLampiran {
        +unggah(pesanan, berkas, tipe) LampiranPesanan
        +tinjau(lampiran, status) void
    }

    class LayananJejakAudit {
        +catat(aksi, entitas, nilaiLama, nilaiBaru, oleh) JejakAudit
    }

    class LayananNotifikasi {
        +kirimPembayaranTerverifikasi(pelanggan, pembayaran) void
        +kirimPembayaranDitolak(pelanggan, pembayaran, alasan) void
        +kirimStatusBerubah(pelanggan, pesanan) void
    }

    LayananJahit ..> LayananLoyalty : memakai
    LayananJahit ..> LayananPembayaran : memakai
    LayananJahit ..> LayananJejakAudit : memakai
    LayananSiapPakai ..> LayananStok : memakai
    LayananSiapPakai ..> LayananPembayaran : memakai
    LayananSiapPakai ..> LayananJejakAudit : memakai
    LayananKonveksi ..> LayananLampiran : memakai
    LayananKonveksi ..> LayananPembayaran : memakai
    LayananKonveksi ..> LayananJejakAudit : memakai
    LayananPembayaran ..> LayananStok : memicu
    LayananPembayaran ..> LayananNotifikasi : memicu
```

## 9. Diagram Sekuens — Pesanan Jahit dari Pelanggan

```mermaid
sequenceDiagram
    actor Pelanggan
    participant UI as Wizard Jahit (/app/tailor/configure)
    participant Kontroler as KontrolerPesananPelanggan
    participant LayananJahit
    participant LayananLoyalty
    participant LayananPembayaran
    participant DB as Basis Data
    participant Audit as LayananJejakAudit

    Pelanggan->>UI: Isi preferensi, model, kain, ukuran, harga, pembayaran
    UI->>Kontroler: POST /app/orders/tailor
    Kontroler->>LayananJahit: buat(payload, pengguna)
    LayananJahit->>DB: Ambil data pelanggan, model, kain, ukuran
    LayananJahit->>LayananLoyalty: sinkronPelanggan() & hitungDiskon()
    LayananJahit->>DB: Buat pesanan status "menunggu pembayaran"
    LayananJahit->>DB: Buat item pesanan
    LayananJahit->>LayananPembayaran: catat(pesanan, pembayaran)
    LayananPembayaran->>DB: Simpan pembayaran
    alt Bayar tunai
        LayananPembayaran->>DB: Tandai pembayaran terverifikasi & perbarui sudah dibayar / sisa
    else Bayar transfer
        LayananPembayaran->>DB: Set pembayaran "menunggu verifikasi"
    end
    LayananJahit->>Audit: Catat aksi pesanan.dibuat
    LayananJahit-->>Kontroler: Refresh data pesanan
    Kontroler-->>UI: Arahkan ke detail pesanan
```

## 10. Diagram Sekuens — Checkout Produk Siap Pakai

```mermaid
sequenceDiagram
    actor Pelanggan
    participant UI as Katalog / Keranjang / Checkout
    participant Kontroler as KontrolerCheckout
    participant LayananSiapPakai
    participant LayananStok
    participant LayananPembayaran
    participant DB as Basis Data
    participant Pengiriman as Model Pengiriman
    participant Audit as LayananJejakAudit

    Pelanggan->>UI: Pilih produk dan kuantitas
    UI->>Kontroler: POST /app/checkout
    Kontroler->>LayananSiapPakai: buatDariKeranjang(keranjang, payload, pengguna)
    LayananSiapPakai->>DB: Ambil item keranjang dan produk
    LayananSiapPakai->>LayananStok: validasiStok(produk, qty)
    LayananSiapPakai->>DB: Buat pesanan siap-pakai "menunggu pembayaran"
    LayananSiapPakai->>DB: Buat item pesanan dari keranjang
    alt Pengiriman kurir
        LayananSiapPakai->>Pengiriman: Buat record pengiriman "menunggu"
    else Ambil sendiri
        LayananSiapPakai->>DB: Tidak perlu record pengiriman
    end
    alt Bayar transfer
        LayananSiapPakai->>LayananPembayaran: catat pembayaran transfer
        LayananPembayaran->>DB: Pembayaran "menunggu verifikasi"
    else Bayar di kantor / nanti
        LayananSiapPakai->>DB: Pesanan tetap "menunggu pembayaran"
    end
    LayananSiapPakai->>DB: Kosongkan keranjang
    LayananSiapPakai->>Audit: Catat aksi pesanan.siap_pakai_dibuat
    LayananSiapPakai-->>Kontroler: Refresh data pesanan
```

## 11. Diagram Sekuens — Pesanan Konveksi (Pelunasan Penuh)

```mermaid
sequenceDiagram
    actor Pelanggan
    participant UI as Form Pesanan Konveksi
    participant Kontroler as KontrolerKonveksi
    participant Layanan as LayananKonveksi
    participant LayananPembayaran
    participant LayananLampiran
    participant DB as Basis Data
    participant Kantor as Kasir / Produksi Kantor

    Pelanggan->>UI: Isi perusahaan, item, qty, harga satuan, catatan, file referensi, pembayaran
    UI->>Kontroler: POST /app/convection
    Kontroler->>Layanan: buat(payload, pengguna)
    Layanan->>Layanan: Hitung subtotal seluruh item
    Layanan->>Layanan: Validasi nominal pembayaran = subtotal
    Layanan->>DB: Buat pesanan konveksi "menunggu pembayaran" tahap desain
    Layanan->>DB: Buat item pesanan
    Layanan->>LayananPembayaran: catat pembayaran
    Layanan->>LayananLampiran: Unggah lampiran referensi
    Layanan->>DB: Simpan metadata lampiran
    Layanan-->>Kontroler: Refresh data pesanan
    Kantor->>LayananPembayaran: Verifikasi transfer
    LayananPembayaran->>DB: Pembayaran terverifikasi, sudah dibayar / sisa diperbarui
    Kantor->>Layanan: validasiPembayaranLunas(pesanan)
    Layanan-->>Kantor: Boleh masuk "sedang diproses" jika lunas terverifikasi
```

## 12. Diagram Sekuens — Verifikasi Pembayaran oleh Kasir

```mermaid
sequenceDiagram
    actor Kasir
    participant UI as Halaman Pembayaran Kantor
    participant Kontroler as KontrolerPembayaranKantor
    participant LayananPembayaran
    participant LayananStok
    participant Notifikasi as Notifikasi Laravel
    participant DB as Basis Data

    Kasir->>UI: Tinjau bukti transfer
    alt Bukti valid
        UI->>Kontroler: POST /office/payments/{payment}/verify
        Kontroler->>LayananPembayaran: verifikasiTransfer(pembayaran, pengguna)
        LayananPembayaran->>DB: Set pembayaran terverifikasi
        LayananPembayaran->>DB: Perbarui sudah dibayar dan sisa tagihan pesanan
        alt Pesanan siap-pakai dan baru pertama kali terverifikasi
            LayananPembayaran->>LayananStok: kurangiSetelahVerifikasi(pesanan)
        end
        LayananPembayaran->>Notifikasi: Kirim notifikasi pembayaran terverifikasi
        Kontroler-->>UI: Pembayaran terverifikasi
    else Bukti tidak valid
        UI->>Kontroler: POST /office/payments/{payment}/reject
        Kontroler->>LayananPembayaran: tolak(pembayaran, pengguna, alasan)
        LayananPembayaran->>DB: Set pembayaran ditolak dan simpan alasan
        LayananPembayaran->>Notifikasi: Kirim notifikasi pembayaran ditolak
        Kontroler-->>UI: Pembayaran ditolak
    end
```

## 13. Diagram Sekuens — Produksi dan Pengiriman

```mermaid
sequenceDiagram
    actor Produksi
    actor Kasir
    participant DetailPesanan as Halaman Detail Pesanan
    participant PapanProduksi as Papan Produksi
    participant HalamanKirim as Halaman Pengiriman
    participant KontrolerPesanan
    participant KontrolerPengiriman
    participant DB as Basis Data
    participant Pelanggan as Pusat Notifikasi Pelanggan

    Produksi->>PapanProduksi: Lihat pesanan aktif
    Produksi->>KontrolerPesanan: PUT /office/orders/{order}/production-stage
    KontrolerPesanan->>DB: Perbarui tahap produksi
    Produksi->>KontrolerPesanan: PUT /office/orders/{order}/status
    KontrolerPesanan->>DB: Perbarui status sedang diproses / selesai
    DB-->>Pelanggan: Status muncul di detail pesanan / notifikasi terkirim
    Kasir->>HalamanKirim: Isi kurir, resi, status pengiriman
    HalamanKirim->>KontrolerPengiriman: PUT /office/shipments/{shipment}
    KontrolerPengiriman->>DB: Perbarui pengiriman dikirim / diterima / diambil
    DB-->>Pelanggan: Pelanggan melihat status pengiriman terbaru
```

## 14. Diagram Aktivitas (Swimlane) — Alur Pesanan Pelanggan

> **Format swimlane UML.** Setiap kolom (lane) mewakili satu aktor; alur aktivitas mengalir dari atas ke bawah dalam masing-masing lane dan berpindah antar lane saat tanggung jawab berpindah.
>
> **Aktor (lane):** Pelanggan · Sistem · Kantor (Kasir / Produksi / Pengiriman)

```mermaid
flowchart TB
    subgraph PEL["Pelanggan"]
        direction LR
        cMulai([Mulai])
        cLogin{Sudah login?}
        cReg[Registrasi / Login]
        cPilih[Pilih layanan]
        cJenis{Jenis layanan?}
        cJahit[Isi wizard pesanan jahit]
        cRTW[Pilih produk siap pakai & checkout]
        cKonv[Isi brief konveksi]
        cBayar[Catat DP / transfer]
        cUpload[Unggah bukti transfer]
        cReUpload[Unggah ulang bukti]
        cAmbil[Ambil / terima pesanan]
        cSelesai([Selesai])
    end

    subgraph SIS["Sistem"]
        direction LR
        sAuth[Validasi kredensial]
        sSimpan[Simpan pesanan]
        sStatus[Set pesanan = menunggu pembayaran]
        sVerified[Set pembayaran = terverifikasi]
        sDone[Set pesanan = selesai]
        sNotif[Notifikasi penolakan ke pelanggan]
    end

    subgraph KAN["Kantor (Kasir / Produksi / Pengiriman)"]
        direction LR
        oQueue[Buka antrian pembayaran]
        oCek{Bukti & nominal valid?}
        oReject[Tolak + alasan]
        oVerify[Verifikasi pembayaran]
        oProd[Jalankan produksi & fulfillment]
        oShip[Perbarui pickup / pengiriman]
    end

    cMulai --> cLogin
    cLogin -- Tidak --> cReg --> sAuth --> cPilih
    cLogin -- Ya --> cPilih
    cPilih --> cJenis
    cJenis -- Jahit --> cJahit --> cBayar
    cJenis -- Siap Pakai --> cRTW --> cBayar
    cJenis -- Konveksi --> cKonv --> cBayar
    cBayar --> sSimpan --> sStatus --> cUpload
    cUpload --> oQueue --> oCek
    oCek -- Tidak --> oReject --> sNotif --> cReUpload --> oQueue
    oCek -- Ya --> oVerify --> sVerified --> oProd --> oShip --> sDone --> cAmbil --> cSelesai
```

## 15. Diagram Aktivitas (Swimlane) — Verifikasi Pembayaran di Kantor

> **Aktor (lane):** Pelanggan · Sistem · Kasir

```mermaid
flowchart TB
    subgraph PEL["Pelanggan"]
        direction LR
        cUpload[Unggah bukti transfer]
        cReUpload[Unggah ulang bukti]
        cSelesai([Selesai])
    end

    subgraph SIS["Sistem"]
        direction LR
        sQueue[Tampilkan antrian pembayaran]
        sUpdate[Perbarui sudah dibayar & sisa tagihan]
        sStock[Kurangi stok siap pakai jika verifikasi pertama]
        sGate[Lanjut ke gerbang produksi]
        sCheck{Sisa tagihan = 0?}
        sNota[Nota / kwitansi tersedia]
        sSisa[Pesanan masih punya sisa tagihan]
        sNotif[Kirim notifikasi penolakan]
    end

    subgraph KAS["Kasir"]
        direction LR
        kMulai([Mulai])
        kReview[Tinjau pesanan, nominal, dan bukti]
        kMetode{Metode pembayaran?}
        kCash[Catat tunai = terverifikasi]
        kValid{Bukti valid & dana diterima?}
        kReject[Tolak dengan alasan]
        kVerify[Verifikasi transfer]
    end

    kMulai --> sQueue --> kReview --> kMetode
    cUpload --> sQueue
    kMetode -- Tunai --> kCash --> sUpdate
    kMetode -- Transfer --> kValid
    kValid -- Tidak --> kReject --> sNotif --> cReUpload --> sQueue
    kValid -- Ya --> kVerify --> sUpdate
    sUpdate --> sStock --> sGate --> sCheck
    sCheck -- Ya --> sNota --> cSelesai
    sCheck -- Tidak --> sSisa --> cSelesai
```

## 16. Diagram Aktivitas (Swimlane) — Produksi & Fulfillment

> **Aktor (lane):** Pelanggan · Sistem · Kantor (Produksi / Pengiriman)

```mermaid
flowchart TB
    subgraph PEL["Pelanggan"]
        direction LR
        cMode{Metode pengambilan?}
        cPickup[Pelanggan ambil pesanan]
        cTerima[Pelanggan terima pengiriman]
        cSelesai([Selesai])
    end

    subgraph SIS["Sistem"]
        direction LR
        sMulai([Mulai])
        sJenis{Jenis pesanan?}
        sJahitDP{DP &ge; 50% terverifikasi?}
        sKonvLunas{Lunas terverifikasi?}
        sRTWBayar{Pembayaran terverifikasi?}
        sHold[Tahan di "menunggu pembayaran"]
        sProses[Set status = sedang diproses]
        sDone[Set pesanan = selesai]
        sShipped[Set dikirim / diterima]
        sClosed[Set diambil / ditutup]
    end

    subgraph KAN["Kantor (Produksi / Pengiriman)"]
        direction LR
        oRTW[Picking & packing produk siap pakai]
        oStage[Perbarui tahap produksi]
        oQC{QC selesai?}
        oShip[Isi kurir & resi pengiriman]
    end

    sMulai --> sJenis
    sJenis -- Jahit --> sJahitDP
    sJenis -- Konveksi --> sKonvLunas
    sJenis -- Siap Pakai --> sRTWBayar
    sJahitDP -- Tidak --> sHold
    sKonvLunas -- Tidak --> sHold
    sRTWBayar -- Tidak --> sHold
    sJahitDP -- Ya --> sProses
    sKonvLunas -- Ya --> sProses
    sRTWBayar -- Ya --> oRTW --> sDone
    sProses --> oStage --> oQC
    oQC -- Tidak --> oStage
    oQC -- Ya --> sDone
    sDone --> cMode
    cMode -- Ambil sendiri --> cPickup --> sClosed --> cSelesai
    cMode -- Pengiriman --> oShip --> sShipped --> cTerima --> cSelesai
```

## 17. Status Route MVP

| Surface                | Route Utama                                                                      | Fungsi                                                 |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Customer public        | `/app`, `/app/catalog`, `/app/services/*`, `/app/tailor/configure`               | Landing customer, katalog, service page, wizard tailor |
| Customer auth          | `/app/dashboard`, `/app/profile`, `/app/addresses`, `/app/measurements`          | Dashboard dan profile center                           |
| Customer orders        | `/app/orders`, `/app/orders/{order}`, `/app/orders/tailor`, `/app/convection`    | Riwayat, detail, tailor, konveksi                      |
| Customer cart/checkout | `/app/cart`, `/app/checkout`                                                     | RTW commerce                                           |
| Customer payment       | `/app/payments`, `/app/orders/{order}/payments`, `/app/payments/{payment}/proof` | Payment history dan upload proof                       |
| Customer notification  | `/app/notifications`                                                             | Notification center                                    |
| Office dashboard       | `/office/dashboard`                                                              | Ringkasan operasional                                  |
| Office orders          | `/office/orders`, `/office/orders/{order}`, `/office/orders/tailor/create`       | Order list, detail, manual tailor                      |
| Office payments        | `/office/payments`, verify/reject, kwitansi                                      | Queue pembayaran dan dokumen                           |
| Office production      | `/office/production`                                                             | Production board                                       |
| Office shipping        | `/office/shipping`, `/office/shipments/{shipment}`                               | Shipment management                                    |
| Office reports         | `/office/reports`, `/office/reports/export`                                      | Report dan export                                      |
| Office audit           | `/office/audit-log`                                                              | Audit trail                                            |
| Admin                  | `/office/admin/users`, products, garment-models, fabrics, couriers, discounts    | Master data dan policy                                 |

## 18. MVP Acceptance Criteria

| Area                   | Acceptance Criteria                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Auth & Role            | Customer tidak bisa akses `/office`; staff office tidak diperlakukan sebagai customer portal                            |
| Customer Profile       | Customer dapat menyimpan alamat default dan measurement untuk order berikutnya                                          |
| Tailor                 | Customer atau kasir dapat membuat tailor order hanya jika DP awal minimal 50%; payment tercatat; order muncul di office |
| Ready-to-Wear          | Customer dapat checkout cart; stok hanya turun setelah payment verified                                                 |
| Ready-to-Wear Delivery | Ongkir berasal dari master courier dan dicatat ke order/shipment tanpa fee tambahan hardcoded                           |
| Convection             | Customer hanya bisa submit jika total item valid dan full payment sesuai total                                          |
| Payment                | Transfer bisa verified/rejected; rejection reason tersimpan; customer bisa upload ulang proof                           |
| Production             | Office dapat update status dan stage produksi sesuai gate pembayaran                                                    |
| Shipping               | Office dapat mengisi courier, resi, dan status shipment                                                                 |
| Documents              | Nota/kwitansi tersedia hanya untuk transaksi yang valid sesuai rule                                                     |
| Report & Audit         | Admin/owner dapat melihat report dan audit log perubahan penting                                                        |

## 19. Risiko dan Cleanup Non-Blocking

| Item                                            | Dampak                                                               | Rekomendasi                                                                            |
| ----------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Field quotation legacy masih ada di `orders`    | Tidak muncul di flow aktif, tetapi bisa membingungkan developer baru | Dokumentasikan sebagai kompatibilitas lama atau cleanup setelah data production stabil |
| Transfer manual masih bergantung pada SOP kasir | Risiko human error                                                   | Buat checklist kasir dan audit rutin harian                                            |
| Courier/shipping belum integrasi API ekspedisi  | Tracking belum otomatis                                              | Masuk roadmap post-MVP, bukan blocker narasi                                           |
| Payment gateway belum otomatis                  | Verifikasi masih manual                                              | Masuk roadmap jika volume transaksi meningkat                                          |
| Testing harus dijaga setelah perubahan besar    | Readiness lama bisa kadaluarsa                                       | Jalankan `php artisan test --compact`, `npm run build`, dan type check sebelum go-live |

## 20. Rekomendasi Go-Live MVP

1. Gunakan MVP untuk operasi terbatas terlebih dahulu, misalnya customer internal atau customer terpilih.
2. Kunci SOP kasir: transfer baru verified setelah dana diterima atau bukti valid sesuai catatan bisnis.
3. Kunci SOP produksi: tailor minimal DP 50% verified, konveksi lunas verified sebelum produksi.
4. Kunci SOP shipping: resi dan status wajib diinput sebelum order dianggap shipped/delivered.
5. Jalankan verifikasi teknis sebelum release: backend test, frontend build, storage link, mail/notification, APP_URL, backup database.
6. Buat backlog post-MVP untuk payment gateway, ekspedisi API, inventory lanjutan, dan accounting.

## 21. Verdict Akhir

Berdasarkan PRD dan struktur app saat ini, Djaitin sudah memenuhi bentuk **MVP aplikasi SIM Convection Taylor**:

| Pertanyaan                                    | Jawaban                                                                      |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| Apakah sudah bisa menjadi MVP?                | Ya, untuk MVP operasional dengan scope terkontrol                            |
| Apakah sudah mirip docs/PRD?                  | Ya, mayoritas surface dan business rule inti sudah selaras                   |
| Apakah sudah production mature?               | Belum sepenuhnya; perlu go-live checklist, SOP, backup, dan QA final         |
| Apakah ada fitur berlebihan yang menghalangi? | Tidak. Fitur modern diposisikan sebagai pendukung UX, bukan flow bisnis inti |

Dokumen ini dapat dipakai sebagai acuan visual dan teknis untuk menjelaskan MVP kepada stakeholder, dosen/penguji, tim developer, atau tim operasional.
