# Business Rules Coverage And Planning

## Tujuan Dokumen

Dokumen ini dibuat untuk menjawab tiga kebutuhan sekaligus:

- memetakan apakah narasi bisnis Djaitin sudah tercermin di sistem saat ini
- menyusun pengembangan lanjutan non-blocking setelah MVP
- menjelaskan walkthrough pengerjaan dan lokasi modul yang sudah mengimplementasikan tiap aturan bisnis

Dokumen ini tidak hanya ditujukan untuk developer. Product owner, founder, dan tim operasional juga bisa memakai dokumen ini untuk melihat kondisi implementasi sistem dibandingkan kebutuhan usaha.

## Ringkasan Eksekutif

Secara umum, sistem saat ini sudah mencakup inti bisnis Djaitin:

- `Tailor / jahit custom`
- `Ready-to-wear`
- `Convection / pesanan massal`
- `pembayaran cash vs transfer`
- `delivery RTW`
- `diskon loyalti tailor`
- `dokumentasi ukuran customer`
- `nota dan kwitansi`

Setelah alignment terbaru, implementasi core sudah 100% selaras dengan narasi bisnis untuk scope MVP web-based. Area berikut tetap dapat dikembangkan, tetapi bukan blocker requirement inti:

- relasi corporate / perusahaan rekanan
- CRM marketing lanjutan
- enforcement SOP pickup berdasarkan tanggal selesai
- automasi diskon tren produk siap pakai

## Ringkasan Narasi Bisnis

Berdasarkan keterangan bisnis yang diberikan, Djaitin memiliki tiga lini utama:

- `jahit custom`
  - customer memilih model, bahan, dan ukuran
  - pembayaran minimal 50% di awal
  - harus lunas sebelum pesanan dibawa pulang
  - ukuran customer lama disimpan agar mudah dilayani kembali
  - customer loyal mendapat potongan menjahit 20% setelah lebih dari 5 kali menjahit
- `ready-to-wear`
  - stok pakaian siap pakai tersedia dalam berbagai model dan ukuran
  - customer bisa membeli langsung
  - jika ingin, barang bisa dikirim melalui jasa kurir
  - diskon untuk produk yang mulai kurang diminati harus fleksibel
- `convection`
  - pesanan massal untuk perusahaan / instansi
  - perlu pengelolaan desain, bahan, produksi, pengemasan, dan pengiriman
  - baru boleh dikerjakan setelah pembayaran penuh diterima

## Akses Menu Dan Letak Fitur

### Customer Surface

Menu utama customer ada di:

- desktop:
  - [resources/js/layouts/customer-layout.tsx](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/resources/js/layouts/customer-layout.tsx#L29)
- mobile:
  - [resources/js/components/customer-mobile-bottom-bar.tsx](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/resources/js/components/customer-mobile-bottom-bar.tsx#L40)

Menu yang relevan dengan narasi bisnis:

- `Tailor`
  - masuk ke konfigurator tailor custom
- `Katalog`
  - masuk ke katalog ready-to-wear
- `Pesanan`
  - melihat semua order customer, termasuk convection
- `Pembayaran`
  - melihat histori dan status pembayaran
- `Profil`
  - mengelola data customer, termasuk ukuran dan alamat

### Office Surface

Menu utama office ada di:

- [resources/js/components/app-sidebar.tsx](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/resources/js/components/app-sidebar.tsx#L29)

Menu yang relevan:

- `Pesanan`
  - melihat detail order tailor, RTW, dan convection
- `Produksi`
  - memantau order yang sedang berjalan
- `Pengiriman`
  - mengelola shipment
- `Pembayaran`
  - verifikasi transfer dan histori pembayaran
- `Pelanggan`
  - melihat customer dan data loyalty / ukuran
- `Admin`
  - mengelola produk, bahan, model, discount policy

## Matrix Coverage

### 1. Jahit Custom

#### Kebutuhan bisnis

- minimal bayar 50% dari total biaya
- lama pengerjaan bergantung model dan jumlah
- customer harus melunasi sebelum membawa pulang pesanan
- ukuran customer lama disimpan
- customer loyal mendapat potongan 20% setelah lebih dari 5 kali menjahit

#### Status implementasi

- `Sudah sesuai`
  - order tailor customer dan office wajib memiliki DP awal minimal 50% sebelum order aktif dicatat
  - gate minimal 50% verified untuk mulai produksi ada di [app/Services/OrderStatusService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/OrderStatusService.php)
  - order tidak bisa `Closed` jika masih ada sisa tagihan di [app/Services/OrderStatusService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/OrderStatusService.php#L85)
  - target selesai dicatat sebagai `due_date` dan tampil pada nota pesanan
  - ukuran customer disimpan dan bisa dipakai ulang melalui measurement library di [app/Http/Controllers/Customer/MeasurementController.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Http/Controllers/Customer/MeasurementController.php#L10)
  - configurator tailor memuat ukuran tersimpan customer di [app/Http/Controllers/Customer/TailorConfiguratorController.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Http/Controllers/Customer/TailorConfiguratorController.php#L18)
  - diskon loyalti tailor dihitung lewat [app/Services/LoyaltyService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/LoyaltyService.php#L13)
- `Catatan`
  - threshold loyalti saat ini memakai rule `lebih dari 5 order tailor yang closed`, karena implementasinya `>` bukan `>=`, di [app/Services/LoyaltyService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/LoyaltyService.php#L28)

### 2. Ready-to-Wear

#### Kebutuhan bisnis

- tersedia model dan ukuran pakaian siap pakai
- barang ditata seperti etalase agar mudah dipilih
- bisa dikirim ke alamat customer
- biaya tambahan hanya ongkir jasa kirim
- produk yang mulai kurang diminati bisa diberi potongan bervariasi

#### Status implementasi

- `Sudah sesuai`
  - katalog RTW tersedia di [app/Http/Controllers/Customer/CatalogController.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Http/Controllers/Customer/CatalogController.php#L10)
  - checkout RTW mendukung `pickup` dan `delivery` di [app/Http/Controllers/Customer/CheckoutController.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Http/Controllers/Customer/CheckoutController.php#L16)
  - etalase fisik diterjemahkan menjadi katalog digital yang bisa difilter berdasarkan kategori dan ukuran
  - biaya pengiriman mengikuti `base_fee` master courier dan dicatat sebagai `shipping_cost` di [app/Services/ReadyWearOrderService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/ReadyWearOrderService.php)
  - diskon bervariasi dan clearance didukung lewat `discount_amount`, `discount_percent`, `is_clearance`, `base_price`, dan `selling_price`

### 3. Convection

#### Kebutuhan bisnis

- menerima pesanan massal dari perusahaan / instansi
- melibatkan desain, bahan, produksi, pengemasan, dan pengiriman
- hanya dikerjakan setelah pembayaran penuh diterima

#### Status implementasi

- `Sudah sesuai`
  - order konveksi dibuat dari halaman customer convection request di [app/Http/Controllers/Customer/ConvectionController.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Http/Controllers/Customer/ConvectionController.php#L15)
  - sistem memaksa pembayaran penuh saat create order convection di [app/Services/ConvectionOrderService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/ConvectionOrderService.php#L52)
  - order konveksi hanya bisa masuk produksi setelah lunas terverifikasi di [app/Services/ConvectionOrderService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/ConvectionOrderService.php#L145)
  - flow kolaborasi desain sekarang sudah ada melalui attachment kolaboratif di [docs/convection-design-collaboration.md](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/docs/convection-design-collaboration.md#L1)
- `Catatan`
  - corporate account formal dan workflow packing detail dapat menjadi pengembangan lanjutan, tetapi kebutuhan MVP sudah terpenuhi melalui `company_name`, attachment, production stage, dan shipping management.

### 4. Pembayaran

#### Kebutuhan bisnis

- pembayaran tunai diberi kwitansi
- transfer dianggap diterima setelah bukti transfer diserahkan atau dana benar-benar diterima
- kwitansi baru dibuat setelah pembayaran diterima

#### Status implementasi

- `Sudah sesuai`
  - cash langsung `verified` pada saat dicatat, di [app/Services/PaymentService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/PaymentService.php#L53)
  - transfer masuk `pending verification` sampai diverifikasi, di [app/Services/PaymentService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/PaymentService.php#L53)
  - bukti transfer dapat diunggah dan diverifikasi di flow customer dan office
  - kwitansi hanya bisa dicetak untuk pembayaran `verified`, di [app/Http/Controllers/Office/DocumentController.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Http/Controllers/Office/DocumentController.php#L33)
- `Catatan`
  - implementasi saat ini memperbolehkan kwitansi baik untuk cash maupun transfer selama statusnya `verified`, yang secara operasional masih masuk akal

### 5. Administrasi Dan Operasional

#### Kebutuhan bisnis

- administrasi, penjualan, pelayanan pesanan, dan pemasaran harus tertata
- pemanfaatan teknologi menjadi keharusan

#### Status implementasi

- `Sudah sesuai`
  - administrasi pelanggan, pembayaran, order, pengiriman, laporan, dan audit log sudah ada
  - customer app dan office app sudah dipisahkan jelas
- `Catatan`
  - pemasaran awal diwakili landing page dan katalog digital. CRM/corporate account formal masuk pengembangan lanjutan, bukan requirement inti MVP.

## Walkthrough Implementasi Yang Sudah Ada

### A. Tailor Flow

1. customer masuk ke menu `Tailor`
2. sistem membuka tailor configurator:
   - [app/Http/Controllers/Customer/TailorConfiguratorController.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Http/Controllers/Customer/TailorConfiguratorController.php#L18)
3. customer memilih garmen, bahan, metode ukuran, dan pembayaran DP
4. sistem menolak order jika DP awal kurang dari 50% total biaya
5. order tailor dibuat dengan pricing dan loyalty discount melalui:
   - [app/Services/TailorOrderService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/TailorOrderService.php#L20)
6. ketika office ingin memulai produksi, sistem mengecek apakah pembayaran terverifikasi sudah minimal 50%

### B. Ready-to-Wear Flow

1. customer masuk ke menu `Katalog`
2. customer pilih produk, ukuran, dan qty
3. customer masuk ke keranjang lalu checkout
4. sistem checkout:
   - memuat alamat dan courier
   - menghitung subtotal, diskon produk, dan ongkir berdasarkan biaya master courier
   - membuat shipment jika delivery
5. implementasi inti ada di:
   - [app/Http/Controllers/Customer/CheckoutController.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Http/Controllers/Customer/CheckoutController.php#L16)
   - [app/Services/ReadyWearOrderService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/ReadyWearOrderService.php#L17)

### C. Convection Flow

1. customer masuk ke layanan `Convection`
2. customer mengisi data perusahaan, item, harga satuan, dan referensi desain
3. customer wajib membayar penuh
4. sistem membuat order konveksi dan menyimpan referensi awal customer sebagai attachment
5. office kemudian memproses desain, produksi, dan kolaborasi revisi
6. implementasi inti ada di:
   - [app/Http/Controllers/Customer/ConvectionController.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Http/Controllers/Customer/ConvectionController.php#L15)
   - [app/Services/ConvectionOrderService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/ConvectionOrderService.php#L23)

### D. Payment And Document Flow

1. pembayaran dicatat melalui office atau customer portal
2. `cash` langsung verified
3. `transfer` menunggu verifikasi
4. setelah verified:
   - order amount di-update
   - dokumen `kwitansi` bisa dicetak
   - `nota` order bisa tersedia jika ada verified payment
5. implementasi inti ada di:
   - [app/Services/PaymentService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/PaymentService.php#L17)
   - [app/Http/Controllers/Office/DocumentController.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Http/Controllers/Office/DocumentController.php#L15)
   - [app/Services/DocumentService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/DocumentService.php#L13)

## Pengembangan Lanjutan Non-Blocking

### Prioritas Tinggi

- `Due date and pickup SOP`
  - tambahkan enforcement atau reminder operasional terkait tanggal selesai dan pickup
- `Corporate convection account`
  - tambahkan entitas perusahaan / PIC / history order corporate agar relasi rekanan lebih terstruktur

### Prioritas Menengah

- `Marketing / CRM module`
  - tracking leads, campaign, repeat customer nurturing
- `Automated RTW markdown`
  - diskon otomatis atau rekomendasi clearance berdasarkan umur stok / performa
- `Production planning depth`
  - breakdown tahap produksi lebih detail untuk konveksi besar

### Prioritas Rendah

- `Etalase fisik to digital sync`
  - jika ingin stok etalase toko benar-benar terhubung dengan sistem
- `Advanced pricing simulation`
  - kalkulasi lead time berdasarkan kompleksitas model dan kapasitas produksi

## Planning Eksekusi Yang Disarankan

### Phase 1

- review SOP operasional setelah MVP digunakan dengan data nyata
- khususnya:
  - definisi kapan order dianggap selesai vs diambil
  - reminder target selesai dan pickup
  - disiplin cetak kwitansi dan nota

### Phase 2

- implementasi gap operasional yang paling berdampak
- fokus:
  - reminder due date / pickup
  - corporate convection structure
  - pelacakan PIC dan perusahaan

### Phase 3

- implementasi gap bisnis lanjutan
- fokus:
  - CRM / marketing
  - markdown automation RTW
  - analytics repeat order dan stock aging

## Walkthrough Pengerjaan Untuk Developer

### Rule loyalty final

Rule loyalti sudah dikunci sesuai narasi: customer mendapat diskon 20% setelah menjahit lebih dari 5 kali. Implementasi memakai operator `>` terhadap threshold 5, sehingga diskon aktif mulai order tailor ke-6 yang sudah closed.

### Jika ingin menambah enforcement due date / pickup

1. tentukan rule operasional di status order
2. implementasikan di:
   - [app/Services/OrderStatusService.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Services/OrderStatusService.php#L21)
3. tampilkan reminder pada:
   - customer order detail
   - office order detail
4. tambahkan notifikasi dan test

### Jika ingin membuat modul corporate convection

1. buat entitas perusahaan / PIC
2. hubungkan ke order konveksi
3. update form create convection
4. update office customer / order detail
5. tambahkan laporan khusus corporate order

## Kesimpulan

Sistem Djaitin saat ini sudah menangkap inti model bisnis yang dijelaskan dalam narasi perusahaan untuk tailor, ready-to-wear, convection, pembayaran, loyalty, ukuran customer, pengiriman, dan dokumen transaksi.

Pengembangan lanjutan yang tersisa bukan berarti fondasinya belum ada. Sebagian besar pengembangan tersebut adalah:

- pendalaman rule operasional
- formalisasi beberapa konsep bisnis
- perluasan modul agar mendekati kebutuhan perusahaan yang semakin besar

Dengan kata lain, sistem saat ini sudah sesuai sebagai representasi operasional MVP dari narasi bisnis penuh. Pengembangan berikutnya lebih tepat diposisikan sebagai pendalaman operasional, bukan koreksi kebutuhan inti.
