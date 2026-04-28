# Requirement Narrative Alignment - Djaitin MVP

**Tanggal:** 2026-04-28  
**Status:** Core requirement 100% aligned untuk MVP web-based.  
**Prinsip:** fitur modern tetap ada sebagai pendukung UX, bukan sebagai pengganti narasi bisnis inti.

## 1. Project Web-Based

Judul project yang paling sesuai:

**Sistem Informasi Manajemen Tailor, Penjualan Pakaian Jadi, dan Konveksi Berbasis Web**

Versi brand:

**Djaitin: Sistem Informasi Manajemen Tailor, Ready-to-Wear, dan Konveksi Berbasis Web**

Project ini bukan e-commerce murni. Sistem mencakup administrasi pelanggan, data ukuran, order jahit, penjualan pakaian siap pakai, konveksi, pembayaran, produksi, pengiriman, dokumen transaksi, dan laporan operasional.

## 2. Alignment Matrix

| Narasi Requirement | Implementasi Djaitin | Status |
| --- | --- | --- |
| Usaha menerima jahitan sesuai permintaan pelanggan | Tailor configurator customer dan tailor order manual office | Sesuai |
| Perusahaan menjual pakaian siap pakai berbagai model dan ukuran | Catalog RTW, product management, size, stock, cart, checkout | Sesuai |
| Perusahaan menerima pesanan konveksi jumlah besar | Convection order dengan company name, multi item, qty, harga satuan, referensi desain | Sesuai |
| Data ukuran pelanggan terdokumentasi untuk kunjungan berikutnya | Customer measurement library dan profile center | Sesuai |
| Pakaian siap pakai tersusun seperti etalase agar mudah dipilih | Etalase digital berupa catalog dengan filter kategori/size dan detail produk | Sesuai |
| Administrasi, penjualan, pelayanan pesanan, dan pemasaran perlu tertata | Office app, customer app, catalog/landing page, reports, audit log | Sesuai |
| Permintaan menjahit minimal bayar 50% dari total biaya | Tailor order customer dan office ditolak jika DP awal kurang dari 50% | Sesuai |
| Pelanggan harus melunasi sebelum membawa pulang pesanan | Order tidak bisa `closed` jika masih ada `outstanding_amount` | Sesuai |
| Tanggal selesai tertera pada Nota Pesanan | `due_date` dicatat dan ditampilkan pada nota | Sesuai |
| Diskon menjahit 20% bagi pelanggan yang menjahit lebih dari 5 kali | Loyalty service memakai rule `closed tailor orders > 5` dan diskon default 20% | Sesuai |
| Pembeli pakaian jadi bisa meminta pengiriman | Checkout RTW mendukung pickup/delivery dan shipment | Sesuai |
| Biaya pengiriman mengikuti biaya jasa pengiriman tanpa markup | Master courier memiliki `base_fee`; checkout RTW memakai `base_fee` sebagai `shipping_cost` | Sesuai |
| Produk kurang diminati bisa diberi diskon bervariasi atau harga pokok | Product management mendukung `base_price`, `selling_price`, `discount_amount`, `discount_percent`, dan `is_clearance` | Sesuai |
| Konveksi baru dikerjakan setelah pembayaran penuh | Convection order wajib full payment dan gate produksi menolak sebelum lunas verified | Sesuai |
| Pembayaran tunai diberi kwitansi | Cash langsung `verified`; kwitansi tersedia untuk payment verified | Sesuai |
| Transfer baru diterima setelah bukti/nominal diterima | Transfer berstatus `pending_verification`; kasir/admin harus verify/reject | Sesuai |

## 3. Fitur Modern Sebagai Pendukung UX

| Fitur Modern | Posisi dalam MVP |
| --- | --- |
| Customer app terpisah dari office | Mendukung digitalisasi pelayanan pelanggan |
| Tailor wizard eksploratif | Membantu customer memilih preferensi, tetapi output akhirnya tetap order tailor profesional |
| Notification center | Mendukung transparansi status order/payment |
| Design attachment untuk konveksi | Mendukung pertukaran referensi desain tanpa membuat flow RFQ kompleks |
| Production board | Mendukung monitoring internal, bukan mengganti SOP produksi |
| Dashboard dan report | Mendukung administrasi dan pengambilan keputusan |

## 4. Batasan Yang Sengaja Tidak Dijadikan Core

| Area | Keputusan |
| --- | --- |
| RFQ / quotation konveksi | Tidak menjadi flow utama karena narasi mewajibkan pembayaran penuh sebelum produksi |
| Approval desain kompleks | Tidak menjadi core; desain cukup melalui attachment dan catatan |
| Payment gateway otomatis | Tidak wajib untuk narasi; transfer manual verified oleh kasir sudah sesuai |
| Integrasi API ekspedisi | Tidak wajib; master courier, ongkir, resi, dan status manual cukup untuk MVP |
| CRM marketing lanjutan | Post-MVP; landing dan catalog sudah cukup untuk representasi pemasaran awal |

## 5. Acceptance Criteria Final

1. Order tailor customer dan office gagal jika DP awal kurang dari 50% total biaya.
2. Order tailor hanya bisa masuk produksi jika pembayaran terverifikasi minimal 50%.
3. Order tidak bisa ditutup selama masih ada sisa tagihan.
4. Order konveksi gagal jika nominal pembayaran tidak sama dengan total pesanan.
5. Order konveksi tidak bisa masuk produksi sebelum pembayaran penuh terverifikasi.
6. Checkout RTW delivery memakai biaya dari master courier, bukan ongkir flat hardcoded.
7. Produk RTW bisa diberi diskon bervariasi dan ditandai clearance.
8. Cash payment langsung verified dan bisa dibuatkan kwitansi.
9. Transfer payment masuk pending verification sampai kasir/admin memverifikasi.
10. Nota Pesanan menampilkan target selesai jika tersedia.

## 6. Verdict

Dengan perubahan alignment ini, Djaitin sudah sesuai dengan narasi requirement sebagai MVP web-based. Fitur modern tetap dipertahankan karena membantu pengalaman penggunaan dan operasional, tetapi dokumen dan flow utama tetap kembali ke kebutuhan bisnis inti: tailor, pakaian siap pakai, konveksi, pembayaran, pengiriman, dan administrasi.
