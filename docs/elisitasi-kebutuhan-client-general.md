# Elisitasi Kebutuhan Client

**Versi:** 1.0  
**Tanggal:** 2026-04-08  
**Konteks:** pendekatan umum elisitasi kebutuhan software untuk sistem Djaitin

## Tujuan

Dokumen ini menggambarkan bagaimana seorang software engineer menerima requirement dari client, lalu menilai dan menyusunnya secara bertahap melalui tabel elisitasi sampai menjadi final draft kebutuhan sistem.

Dokumen ini tidak fokus pada detail implementasi kode, tetapi pada proses analisis requirement.

## Pendekatan Elisitasi

Secara umum, elisitasi dibagi menjadi:

1. Tahap 1: menangkap kebutuhan mentah dari client
2. Tahap 2: menganalisis, mengklarifikasi, dan mengelompokkan kebutuhan
3. Tahap 3: memformalkan kebutuhan menjadi requirement sistem
4. Final draft: kebutuhan final yang siap dipakai sebagai dasar PRD, backlog, atau pengembangan

---

## Tahap 1

### Tujuan Tahap 1

Pada tahap ini, software engineer menerima narasi bisnis, pain point, dan harapan client dalam bentuk bahasa alami. Fokusnya adalah menangkap kebutuhan tanpa terlalu cepat masuk ke solusi teknis.

### Sumber Requirement Client

Untuk kasus Djaitin, requirement mentah client dapat dipahami sebagai berikut:

- perusahaan bergerak di tailor, pakaian siap pakai, dan konveksi
- data customer, ukuran, model, pesanan, dan pembayaran harus terdokumentasi
- customer lama harus mudah dilayani kembali
- ada proses pembayaran bertahap untuk tailor
- ada pelunasan wajib sebelum pesanan diambil
- ada aturan khusus untuk konveksi: produksi hanya dimulai setelah pembayaran penuh
- ada pengiriman untuk pakaian siap pakai
- ada kebutuhan administrasi, penjualan, pelayanan pesanan, dan laporan

### Tabel Elisitasi Tahap 1

| No | Pernyataan Client | Makna Awal | Indikasi Kebutuhan |
|---|---|---|---|
| 1 | Usaha melayani jahit sesuai permintaan pelanggan | Ada layanan tailor/custom | Modul tailor order |
| 2 | Menjual pakaian siap pakai dengan model dan ukuran beragam | Ada bisnis retail pakaian | Modul ready-to-wear |
| 3 | Menerima pesanan konveksi dalam jumlah besar | Ada bisnis B2B / bulk order | Modul order konveksi |
| 4 | Data ukuran dan model pelanggan perlu didokumentasikan | Riwayat customer harus tersimpan | Modul customer profile dan measurement |
| 5 | Pelanggan bisa datang kembali dan dilayani lebih mudah | Data harus reusable | Reuse measurement dan histori order |
| 6 | Pakaian siap pakai bisa dipilih dari etalase | Ada katalog produk | Catalog, stock, checkout |
| 7 | Perusahaan butuh administrasi dan penjualan yang lebih rapi | Proses manual harus disistemkan | Office app / admin modules |
| 8 | Menjahit minimal bayar 50% | Ada payment gate tailor | Rule DP tailor |
| 9 | Pesanan harus lunas sebelum dibawa pulang | Harus ada outstanding control | Rule pelunasan order |
| 10 | Konveksi dikerjakan setelah pembayaran penuh | Ada full payment gate untuk konveksi | Rule payment gate konveksi |
| 11 | Pembayaran tunai diberi kwitansi | Ada dokumen transaksi | Kwitansi / receipt |
| 12 | Transfer baru dianggap diterima setelah diverifikasi | Perlu approval pembayaran transfer | Verification flow |

### Output Tahap 1

Output dari tahap ini adalah daftar kebutuhan bisnis awal, belum final, belum terstruktur sebagai spesifikasi sistem.

---

## Tahap 2

### Tujuan Tahap 2

Pada tahap ini, requirement mentah mulai dianalisis:

- mana yang benar-benar kebutuhan inti
- mana yang aturan bisnis
- mana yang aktor pemakainya
- mana yang butuh klarifikasi
- mana yang berpotensi terlalu luas atau ambigu

### Tabel Elisitasi Tahap 2

| No | Kebutuhan Awal | Kategori | Aktor Terkait | Klarifikasi / Analisis |
|---|---|---|---|---|
| 1 | Tailor order | Fitur inti | Customer, office | Harus mendukung model, bahan, ukuran, due date |
| 2 | Ready-to-wear | Fitur inti | Customer, kasir, admin | Harus ada katalog, stok, checkout, delivery |
| 3 | Order konveksi | Fitur inti | Customer, office | Perlu data perusahaan, item, file referensi, pembayaran |
| 4 | Penyimpanan ukuran pelanggan | Data inti | Customer, office | Harus reusable untuk order berikutnya |
| 5 | DP tailor 50% | Aturan bisnis | Customer, kasir, office | Minimal verified payment sebelum `in_progress` |
| 6 | Pelunasan sebelum pengambilan | Aturan bisnis | Customer, kasir, office | Outstanding amount harus terkontrol |
| 7 | Full payment konveksi | Aturan bisnis | Customer, office | Produksi konveksi tidak boleh dimulai sebelum lunas verified |
| 8 | Verifikasi transfer | Aturan bisnis | Kasir, admin | Transfer tidak otomatis dianggap diterima |
| 9 | Kwitansi dan nota | Dokumen | Kasir, office, customer | Harus tersedia sesuai status pembayaran |
| 10 | Pengiriman RTW | Fitur operasional | Customer, shipping, office | Ongkir mengikuti jasa kirim |
| 11 | Diskon pelanggan loyal | Aturan bisnis | Customer, office, admin | Perlu definisi pasti `> 5` atau `>= 5` |
| 12 | Laporan operasional | Fitur manajerial | Admin, owner | Perlu ringkasan order, payment, shipment |

### Hasil Analisis Tahap 2

Dari tahap ini, software engineer mulai bisa memetakan:

- fitur inti
- aturan bisnis
- data utama
- aktor sistem
- area yang masih ambigu

### Area Yang Biasanya Perlu Klarifikasi

| No | Area | Pertanyaan Elisitasi |
|---|---|---|
| 1 | Loyalti tailor | Apakah diskon berlaku setelah lebih dari 5 kali atau mulai transaksi ke-5? |
| 2 | Pengiriman RTW | Apakah semua produk bisa dikirim atau hanya kategori tertentu? |
| 3 | Due date tailor | Apakah due date hanya informasi atau harus memicu reminder/status khusus? |
| 4 | Konveksi | Apakah harga ditentukan langsung saat input, atau lewat penawaran? |
| 5 | Corporate customer | Apakah cukup `company_name`, atau perlu akun corporate terpisah? |

### Output Tahap 2

Output tahap ini adalah daftar requirement yang lebih terstruktur dan sudah siap dipisahkan antara:

- functional requirement
- business rule
- data requirement
- open issue / clarification note

---

## Tahap 3

### Tujuan Tahap 3

Pada tahap ini, kebutuhan mulai diformalkan menjadi requirement sistem yang lebih siap dipakai untuk desain solusi dan development.

### Tabel Elisitasi Tahap 3

| No | Requirement Sistem | Jenis | Prioritas | Keterangan |
|---|---|---|---|---|
| 1 | Sistem harus menyediakan customer app dan office app terpisah | Functional | Tinggi | Mendukung perbedaan peran dan surface |
| 2 | Sistem harus mendukung tailor order dengan data model, bahan, ukuran, dan measurement reuse | Functional | Tinggi | Inti layanan tailor |
| 3 | Sistem harus mendukung katalog ready-to-wear, cart, checkout, dan delivery | Functional | Tinggi | Inti layanan RTW |
| 4 | Sistem harus mendukung order konveksi dengan file referensi dan detail item | Functional | Tinggi | Inti layanan konveksi |
| 5 | Sistem harus mewajibkan pembayaran minimal 50% untuk order tailor sebelum produksi dimulai | Business Rule | Tinggi | Rule tailor |
| 6 | Sistem harus mewajibkan pelunasan penuh sebelum order diserahkan ke customer | Business Rule | Tinggi | Rule umum order |
| 7 | Sistem harus mewajibkan pembayaran penuh terverifikasi sebelum order konveksi masuk produksi | Business Rule | Tinggi | Rule konveksi |
| 8 | Sistem harus mendukung pembayaran cash dan transfer | Functional | Tinggi | Payment methods |
| 9 | Sistem harus memverifikasi transfer sebelum dianggap diterima | Business Rule | Tinggi | Cash vs transfer handling |
| 10 | Sistem harus menghasilkan nota dan kwitansi sesuai kondisi pembayaran | Functional | Sedang | Dokumen transaksi |
| 11 | Sistem harus menyimpan histori customer, order, payment, dan shipment | Data Requirement | Tinggi | Data operasional utama |
| 12 | Sistem harus menyediakan laporan operasional untuk office/admin/owner | Functional | Sedang | Monitoring bisnis |

### Hasil Tahap 3

Pada titik ini, requirement sudah dapat dipakai untuk:

- menyusun PRD
- menyusun use case
- menyusun backlog development
- membuat prioritas MVP dan non-MVP

---

## Final Draft Elisitasi

### Tujuan Final Draft

Final draft adalah hasil akhir elisitasi yang menyatakan kebutuhan sistem secara lebih tegas dan bisa dijadikan baseline proyek.

### Tabel Final Draft Elisitasi

| No | Kebutuhan Final | Prioritas | Status Kejelasan | Catatan |
|---|---|---|---|---|
| 1 | Split customer app dan office app | Tinggi | Jelas | Dipertahankan sebagai keputusan produk |
| 2 | Tailor wizard / tailor order | Tinggi | Jelas | Menjadi core flow tailor |
| 3 | Penyimpanan measurement customer | Tinggi | Jelas | Harus reusable |
| 4 | Ready-to-wear commerce | Tinggi | Jelas | Katalog, checkout, delivery |
| 5 | Konveksi dengan payment gate penuh | Tinggi | Jelas | Produksi setelah lunas verified |
| 6 | Payment verification | Tinggi | Jelas | Transfer harus diverifikasi |
| 7 | Nota dan kwitansi | Sedang | Jelas | Bagian dari administrasi transaksi |
| 8 | Shipment dan tracking | Sedang | Jelas | Terutama untuk RTW / pesanan kirim |
| 9 | Laporan operasional | Sedang | Jelas | Untuk admin dan owner |
| 10 | Loyalty tailor | Sedang | Perlu finalisasi | Rule angka masih perlu diputuskan |
| 11 | Due date / pickup SOP | Sedang | Perlu finalisasi | Perlu dipilih: hanya SOP atau enforcement sistem |
| 12 | Corporate customer handling | Rendah-Menengah | Perlu finalisasi | Mungkin cukup `company_name` pada fase awal |

### Bentuk Final Draft Yang Siap Dipakai Engineer

Secara praktis, final draft elisitasi harus menghasilkan:

- daftar fitur inti yang wajib ada
- daftar aturan bisnis yang wajib ditegakkan
- daftar data utama yang wajib disimpan
- daftar area ambigu yang harus diputuskan client / product owner
- daftar item yang bukan MVP atau ditunda

---

## Kesimpulan

Jika software engineer menerima requirement client seperti pada kasus Djaitin, maka tabel elisitasi dari tahap 1 sampai final dipakai untuk mengubah:

- narasi bisnis
menjadi
- kebutuhan terstruktur
menjadi
- requirement sistem
menjadi
- final draft yang siap dijadikan dasar PRD dan development

Untuk Djaitin, hasil final elisitasi secara umum mengarah pada sistem operasional terpadu untuk:

- tailor
- ready-to-wear
- konveksi
- pembayaran
- pengiriman
- administrasi office
- laporan operasional

sedangkan area yang masih perlu keputusan lanjutan adalah:

- rule loyalti final
- due date / pickup enforcement
- kedalaman modul corporate / CRM

