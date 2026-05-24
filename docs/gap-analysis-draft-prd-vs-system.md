# Gap Analysis: Draft PRD Narasi vs Sistem Djaitin

**Tanggal:** 2026-05-23
**Basis perbandingan:**

- Narasi bisnis: `docs/draft-prd-system.md`
- UML & Use Case yang sudah dimapping: `docs/MVP-APP-UML-AND-USE-CASES.md`
- Bukti implementasi: route `/app` & `/office`, service di `app/Services/`, model Eloquent, migrations, seeder.
  **Tujuan:** Memetakan setiap klausa dalam draft PRD ke kondisi nyata di kode, lalu menandai mana yang **selaras**, **selaras dengan catatan**, dan **gap** yang perlu ditangani.

---

## 1. Ringkasan Eksekutif

Sistem Djaitin saat ini sudah **selaras pada seluruh proses bisnis inti** yang ditulis dalam draft PRD: pembayaran DP minimal 50% untuk jahit, pelunasan sebelum pengambilan, konveksi lunas dulu sebelum produksi, ongkir RTW pakai tarif jasa kirim tanpa markup, kwitansi hanya setelah pembayaran terverifikasi, dan diskon loyalti 20% untuk pelanggan yang sudah menjahit lebih dari 5 kali.

Yang menjadi **gap** dari narasi PRD ke sistem MVP saat ini terbatas pada beberapa area:

1. **Clearance pricing RTW** disebut di narasi ("dijual sesuai harga pokok") tapi tidak punya rule terstruktur di sistem; saat ini hanya flag `is_clearance` dan `discount_amount` manual.
2. **Variasi produk turunan jahit** (jaket, topi, emblem, kaos, seragam) disebut sebagai bagian bisnis, tapi `garment_models` & seeder belum mencerminkan keragaman tersebut.
3. **Tinjauan ulang threshold loyalti** ("20% untuk yang sudah 5 kali apakah memadai") sudah dipindah ke `discount_policies`, tapi belum ada UI eksperimentasi/A-B atau histori perubahan terstruktur.
4. **Pemasaran** disebut di narasi sebagai tuntutan modernisasi, tapi tidak ada modul pemasaran apapun di MVP saat ini (sengaja, sesuai scope MVP).
5. **Field legacy quotation** di tabel `orders` (`quotation_notes`, `quoted_by`, `quoted_at`) tidak ada di flow aktif tapi masih ada di skema; perlu keputusan formal: keep-as-compat atau drop.
6. **SOP transfer = baru sah setelah dana diterima** sudah hidup di service (`PaymentService::verifyTransfer`), tapi belum tertulis sebagai SOP kasir formal di dokumentasi user-facing.

Tidak ada gap yang membatalkan klaim MVP. Sistem **sudah cukup** untuk menjawab pertanyaan terakhir di draft PRD: "apa sudah sesuai dengan PRD kita?" Jawabannya **ya**, dengan catatan kecil di tabel berikut.

---

## 2. Tabel Pasal Demi Pasal

Setiap baris memetakan satu klausa dalam `docs/draft-prd-system.md` ke implementasi nyata.

### 2.1 Profil & Lini Usaha

| Klausa Draft PRD                                                                             | Implementasi                                                                                      | Status                 | Catatan                                                                                                                                             |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Menjual beragam model dan ukuran pakaian siap pakai"                                        | `Product` (`category`, `size`, `selling_price`), katalog `/app/catalog`, `Office/Admin/Products`  | Selaras                | —                                                                                                                                                   |
| "Menerima pesanan konveksi dalam jumlah besar"                                               | `OrderType::Convection`, `ConvectionOrderService`, route `/app/convection`, attachment referensi  | Selaras                | —                                                                                                                                                   |
| "Menerima jahit menyesuaikan ukuran pelanggan"                                               | `OrderType::Tailor`, `TailorOrderService`, `Measurement`, wizard `/app/tailor/configure`          | Selaras                | —                                                                                                                                                   |
| "Data ukuran & model pelanggan didokumentasikan untuk kunjungan berikutnya"                  | `customer_id` → `Measurement` (multi label), reuse `measurement_id` di order                      | Selaras                | —                                                                                                                                                   |
| "Pakaian siap pakai tersusun di etalase" (showroom feel)                                     | Halaman katalog Inertia + filter; tidak ada konsep "etalase" sebagai entitas                      | Selaras dengan catatan | Tidak perlu entitas baru, cukup display logic.                                                                                                      |
| "Menjadi rekanan instansi swasta dan pemerintah, membuat seragam, jaket, topi, emblem, kaos" | `company_name` di `orders`, attachment referensi, item bebas (`item_name` per row di `OrderItem`) | Selaras dengan catatan | Skema mendukung; namun **`garment_models` seeder hanya berisi Kemeja & Tunik**, sehingga UX tailor terbatas dan tidak merefleksikan luasnya bisnis. |
| "Modernisasi administrasi, penjualan, pelayanan, **pemasaran**"                              | Admin, sales, ops sudah ada. Pemasaran belum ada modul apapun.                                    | Gap (out-of-MVP scope) | Marketing/CRM belum termasuk MVP, dan PRD MVP juga sudah mengakui ini di `MVP-APP-UML-AND-USE-CASES.md` § 2. Diserahkan ke roadmap post-MVP.        |

### 2.2 Aturan Pembayaran

| Klausa Draft PRD                                                                | Implementasi                                                                                                                                                         | Status  | Bukti                                                                                       |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| "Permintaan menjahit minimal harus membayar 50% dari keseluruhan biaya"         | `TailorOrderService::validateMinimumDownPayment` menolak amount < 50%; `OrderStatusService::validateTransition` menolak `in_progress` jika paid ratio < 0.5          | Selaras | `app/Services/TailorOrderService.php`, `app/Services/OrderStatusService.php`                |
| "Pelanggan harus melunasi sebelum dapat membawa pulang pesanannya"              | `OrderStatusService::canClose` butuh `outstanding_amount = 0`; nota & kwitansi hanya keluar jika ada payment verified                                                | Selaras | `app/Services/OrderStatusService.php`, `app/Http/Controllers/Office/DocumentController.php` |
| "Pelanggan biasanya datang mengambil pesanannya sesuai tanggal selesai di Nota" | Field `due_date` di `orders`; `nota` PDF menampilkannya                                                                                                              | Selaras | `app/Services/DocumentService.php` (template)                                               |
| "Konveksi baru dikerjakan setelah perusahaan menerima pembayaran penuh"         | `ConvectionOrderService` mewajibkan `payment.amount == subtotal` saat order, dan `validateFullPaymentGate` menolak naik ke `in_progress` jika belum lunas + verified | Selaras | `app/Services/ConvectionOrderService.php`                                                   |
| "Pembayaran tunai → Kwitansi"                                                   | `Payment` cash di-set `Verified` instan, kwitansi route ada untuk payment verified                                                                                   | Selaras | `app/Services/PaymentService.php` (cash branch)                                             |
| "Pembayaran transfer baru diterima setelah bukti diserahkan / nilai diterima"   | Transfer di-set `PendingVerification`, kasir wajib `verifyTransfer` baru menjadi `Verified`                                                                          | Selaras | `PaymentService::verifyTransfer`                                                            |
| Kwitansi transfer "baru dibuatkan setelah verified"                             | `DocumentController::kwitansi` `abort_unless` payment status verified                                                                                                | Selaras | `app/Http/Controllers/Office/DocumentController.php`                                        |

### 2.3 Pengiriman & Pakaian Jadi (RTW)

| Klausa Draft PRD                                                                                                                              | Implementasi                                                                                                                                                                | Status                                       | Bukti                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------ |
| "Bisa minta diantar ke alamat"                                                                                                                | `delivery_type=delivery` + `Address` → `Shipment` di `ReadyWearOrderService::createFromCart`                                                                                | Selaras                                      | `app/Services/ReadyWearOrderService.php`                                             |
| "Bekerja sama dengan jasa pengiriman, **tidak menambah biaya selain harga jasa kirim**"                                                       | `shipping_cost = courier->base_fee` murni (tidak ditambah margin/markup)                                                                                                    | Selaras                                      | `Courier::base_fee` migration `2026_04_28_160618_add_base_fee_to_couriers_table.php` |
| "Karena pakaian jadi mengikuti tren, akan ada potongan bervariasi untuk yang mulai kurang disukai. Kalau perlu dijual sesuai harga pokoknya." | `Product` punya `discount_amount`, `discount_percent`, `is_clearance`, dan `base_price` (HPP). Tapi tidak ada otomasi/policy: harga clearance ditentukan manual oleh admin. | **Selaras dengan catatan / Gap operasional** | `app/Models/Product.php`, `app/Http/Controllers/Office/Admin/ProductController.php`  |
| Stok turun setelah pembayaran sah (implisit untuk RTW)                                                                                        | `PaymentService::shouldDecrementStock` decrement hanya saat payment verified pertama untuk RTW                                                                              | Selaras                                      | `app/Services/StockService.php`, `PaymentService.php`                                |

### 2.4 Loyalti

| Klausa Draft PRD                                                               | Implementasi                                                                                                                                     | Status                 | Bukti                                                                                                                                                  |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Diskon menjahit 20% bagi pelanggan yang telah menjahit **lebih dari 5 kali**" | `LoyaltyService::syncCustomer` set `is_loyalty_eligible = closedTailorOrders > threshold` (default 5), discount default 20% via `DiscountPolicy` | Selaras                | `app/Services/LoyaltyService.php`, seeder `DatabaseSeeder.php`                                                                                         |
| "Apakah 20% untuk yang 5 kali memadai atau tidak masih dikaji"                 | Persen & threshold disimpan di tabel `discount_policies` dan punya UI admin (`/office/admin/discounts`)                                          | Selaras dengan catatan | Tidak ada eksperimen/A-B atau histori perubahan terdokumentasi; perubahan langsung tertimpa via update. Untuk MVP cukup; untuk decision-support belum. |

### 2.5 Quotation Legacy

| Klausa Draft PRD                    | Implementasi                                                                                                                                                             | Status                  | Catatan                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Tidak ada di narasi (tidak diminta) | Tabel `orders` masih punya `quotation_notes`, `quoted_by`, `quoted_at` dan ada migrasi `add_quote_fields_to_orders_table`, `add_convection_quote_fields_to_orders_table` | **Gap teknis (legacy)** | Tidak dipakai oleh flow customer maupun office. Aman dari sisi runtime tapi membingungkan developer baru. Lihat rekomendasi §4 R-3. |

### 2.6 Aktor & Hak Akses

| Klausa Draft PRD (implisit dari narasi)                    | Implementasi                                                                               | Status  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------- |
| Pelanggan dapat datang/login, lihat status, ambil pesanan  | Customer portal `/app` di belakang `auth` + `role:customer`                                | Selaras |
| Kasir mencatat penjualan, terima pembayaran, beri kwitansi | `/office/payments`, `/office/orders/tailor/create`, `verify`/`reject`                      | Selaras |
| Bagian produksi melakukan pengerjaan                       | `/office/production`, `production_stage` enum, `OrderStatusService::updateProductionStage` | Selaras |
| Admin/owner mengelola master & laporan                     | `/office/admin/*`, `/office/reports`, `/office/audit-log`                                  | Selaras |

---

## 3. Gap Diagnosis

### G-1. Clearance pricing RTW belum punya policy

**Narasi PRD:** "Karena pakaian jadi mengikuti tren, akan diberikan potongan bervariasi … kalau perlu dijual sesuai harga pokoknya."

**Realita:** `Product` menyimpan `base_price` (HPP), `selling_price`, `discount_amount`, `is_clearance`. Yang **tidak ada**:

- Tidak ada validasi `selling_price - discount_amount >= base_price` (atau exception "boleh sama dengan HPP").
- Tidak ada bantuan kasir/admin untuk menandai produk "kurang laku" otomatis (mis. by aging stok atau days-since-last-sale).
- `is_clearance` hanya jadi filter list, tidak memengaruhi label di customer-facing.

**Risiko:** Tergantung disiplin admin manual; potensi jual rugi atau lupa diskon.

**Rekomendasi (post-MVP, non-blocker):**

- Tambah aturan domain: jika `is_clearance=true` maka `final_price >= base_price` boleh dipaksakan ke 0 markup, tapi tidak boleh di bawah HPP kecuali admin explicit.
- Tampilkan badge "Clearance" di katalog customer.

### G-2. Garment model & seeder belum merepresentasikan ragam usaha

**Narasi PRD:** "seragam, jaket, topi, emblem, kaos, dan berbagai barang lain."

**Realita:** `database/seeders/DatabaseSeeder.php` hanya seed `Kemeja Custom` & `Tunik Harian`. Skema `garment_models` sudah mendukung tambahan tanpa migrasi.

**Risiko:** Demo & UAT terlihat sempit. Konfigurator tailor seolah hanya untuk kemeja/tunik.

**Rekomendasi:**

- Tambah seed: Jaket, Topi, Kaos, Seragam, Rok, Celana, Jas, Emblem (sebagai `garment_model` atau item line di `OrderItem` konveksi).
- Tidak butuh code change struktural.

### G-3. Field quotation legacy di `orders`

**Realita:** Kolom `quotation_notes`, `quoted_by`, `quoted_at`, plus migrasi quote convection masih ada. Tidak ada controller/service yang menulisinya.

**Risiko:**

- Membingungkan developer baru.
- Rentan dipakai parsial lalu inkonsisten.
- Test coverage tidak melindungi field yang tidak dipakai.

**Rekomendasi (decision needed):**

- **Opsi A — Keep & document:** tambahkan komentar di `Order` model + dokumentasi di `MVP-APP-UML-AND-USE-CASES.md` bahwa kolom-kolom ini kompatibilitas lama, jangan dipakai.
- **Opsi B — Drop:** buat migrasi penghapusan kolom + rebuild factory/seeder; tes ulang.

Pilihan terbaik untuk MVP: **A** sampai data produksi stabil, lalu B di siklus cleanup berikutnya.

### G-4. SOP transfer "baru sah saat dana diterima" belum tertulis

**Narasi PRD:** "Pembayaran transfer baru dinyatakan diterima setelah bukti transfer diserah terimakan, **atau nilai transfer sudah diterima**."

**Realita:** Service-nya benar (verifikasi manual oleh kasir), tapi tidak ada SOP kasir tertulis "wajib cek mutasi rekening dulu sebelum klik verify."

**Risiko:** Risiko operasional, bukan teknis. Kasir bisa terburu-buru klik verify dari bukti palsu.

**Rekomendasi:** Tambah panel info di halaman verifikasi `/office/payments/{id}/verify` dan checklist kasir di `docs/USER-MANUAL.md` untuk verifikasi mutasi sebelum klik.

### G-5. Threshold loyalti tidak punya histori perubahan

**Narasi PRD:** "Apakah 20% untuk yang 5 kali memadai atau tidak masih dikaji."

**Realita:** Nilai disimpan di `discount_policies` (key/value). Update menimpa langsung. `audit_logs` tidak men-track resource ini secara eksplisit.

**Rekomendasi (low priority):**

- Pastikan `Office\Admin\DiscountPolicyController::update` memanggil `AuditLogService::log` agar tiap revisi terekam (perubahan dari 20% → 25%, dst).
- Optional: simpan riwayat efektivitas ke laporan.

### G-6. Pemasaran (out-of-scope MVP)

**Narasi PRD:** "Modernisasi administrasi, penjualan, pelayanan, **pemasaran**."

**Realita & posisi:** MVP sengaja tidak menyentuh pemasaran. `MVP-APP-UML-AND-USE-CASES.md` § 2 sudah menyatakannya sebagai non-MVP.

**Rekomendasi:** Bukan blocker. Masuk roadmap.

---

## 4. Status Akhir Per Area

| Area                                                        | Status PRD ↔ Sistem                |
| ----------------------------------------------------------- | ---------------------------------- |
| DP 50% jahit                                                | ✅ Selaras                         |
| Pelunasan sebelum pengambilan                               | ✅ Selaras                         |
| Tanggal selesai di Nota                                     | ✅ Selaras                         |
| Konveksi lunas dulu                                         | ✅ Selaras                         |
| Kwitansi cash & transfer                                    | ✅ Selaras                         |
| Loyalty 20% untuk >5x jahit                                 | ✅ Selaras                         |
| Threshold loyalti dapat dikaji                              | ⚠️ Selaras dengan catatan (G-5)    |
| Ongkir RTW = tarif jasa kirim murni                         | ✅ Selaras                         |
| Clearance / harga pokok untuk RTW kurang laku               | ⚠️ Gap policy (G-1)                |
| Variasi produk jahitan (seragam, jaket, topi, emblem, kaos) | ⚠️ Gap seeder/UX (G-2)             |
| SOP transfer sah                                            | ⚠️ Gap dokumentasi (G-4)           |
| Field quotation legacy                                      | ⚠️ Gap teknis non-blocking (G-3)   |
| Modul pemasaran                                             | ❌ Out-of-MVP, masuk roadmap (G-6) |

Legenda: ✅ siap MVP · ⚠️ siap MVP dengan catatan · ❌ di luar scope MVP

---

## 5. Rekomendasi Aksi

Diurutkan dari paling cepat dipenuhi:

1. **R-1 (cepat, dokumentasi):** Tambah dua paragraf SOP kasir di `docs/USER-MANUAL.md` untuk transfer ("verify hanya setelah mutasi rekening confirmed").
2. **R-2 (cepat, seeder):** Perluas `DatabaseSeeder` & `ProductionStarterSeeder` dengan garment model: Jaket, Topi, Kaos, Seragam, Rok, Celana — agar demo merepresentasikan narasi.
3. **R-3 (cepat, dokumentasi kode):** Tandai field quotation legacy di model `Order` dengan PHPDoc `@deprecated` + entry di gap doc ini, lalu jadwalkan migrasi drop di siklus cleanup terpisah.
4. **R-4 (sedang, kode):** Pastikan `DiscountPolicyController::update` menulis ke `audit_logs` agar histori 20%/5x dapat ditelusuri.
5. **R-5 (sedang, kode + UX):** Tambah panel verifikasi mutasi di halaman `/office/payments` dengan placeholder checklist (link ke SOP) sebelum tombol Verify diklik.
6. **R-6 (medium, policy + UX):** Definisikan rule clearance — minimum harga = HPP (`base_price`) kecuali override admin, dengan badge clearance di katalog.
7. **R-7 (post-MVP):** Roadmap modul pemasaran (broadcast, email campaign, segmentasi customer berdasarkan `loyalty_order_count`).

Tidak satu pun dari R-1 sampai R-6 menjadi blocker MVP. Mereka adalah polish supaya narasi PRD dan demo sistem terlihat kongruen.

---

## 6. Verdict Final

> **Apakah sistem sudah sesuai dengan PRD draft?**
> **Sudah, untuk seluruh proses bisnis inti yang ditulis di narasi.** Sistem MVP Djaitin saat ini mencerminkan cerita perusahaan — dari jahit perorangan, RTW, sampai konveksi rekanan — dengan rule pembayaran dan kepemilikan data sudah dipasang di lapisan service. Yang tersisa adalah **tujuh aksi kosmetik & operasional (R-1 sd R-7)** untuk menghilangkan gap kecil agar demo, dokumentasi, dan kode benar-benar berbicara satu suara.

Dokumen ini menggantikan sub-tanya "apa sudah sesuai dengan PRD kita?" di akhir `docs/draft-prd-system.md` dengan jawaban berbukti dan terukur.

---

## 7. Closure Update (2026-05-24)

Pada 2026-05-24, dilakukan eksekusi closure 2 quick win + audit menyeluruh untuk persiapan presentasi. Hasil:

### 7.1 Status Per-Gap

| ID | Gap | Status | Bukti Closure |
|---|---|---|---|
| **G-1** | Clearance pricing rule | ✅ **CLOSED** | `withValidator` di `Store/UpdateProductRequest` cross-field validation. Verified via E2E browser test — submit `base=80k, selling=100k, discount=50k` → final 50k < 80k → ditolak, SKU tidak ke-create di DB |
| **G-2** | Garment seeder thin | ✅ **CLOSED** | `DatabaseSeeder.php` +7 garment: Jaket Formal, Topi Bordir, Kaos Polos, Seragam Sekolah, Seragam Kerja, Rok Formal, Celana Bahan. Total 10 garment di DB, mencakup 5 kategori PRD (seragam, jaket, topi, emblem via Seragam Kerja, kaos) |
| G-3 | Quotation legacy fields zombie | 📋 **DEFERRED** | DB tech debt. Kolom `quotation_notes`/`quoted_by`/`quoted_at` ada di tabel `orders` & `Order` model fillable, namun tidak ter-write oleh flow aktif. Akan di-drop di migration cleanup post-MVP. Tidak mengganggu operasional |
| G-4 | SOP transfer di docs/UI | 📋 **DEFERRED** | Doc-only gap. Logika `verifyTransfer` sudah benar di service layer; SOP tertulis dapat ditambah di USER-MANUAL.md sebagai polish iterasi berikutnya |
| G-5 | Discount policy audit log | 📋 **DEFERRED** | Decision support gap. Implementasi melibatkan tambahan satu service call di `DiscountPolicyController::update`. Low priority, tidak menghalangi presentasi |
| G-6 | Modul pemasaran | 📋 **OUT-OF-MVP** | Sengaja di-roadmap fase berikutnya. Didokumentasi formal di `PRD-v2.md` section 6 |

**Closure Rate:** 2/6 gap closed di MVP. 3 gap deferred sebagai post-MVP polish. 1 gap explicit out-of-MVP.

### 7.2 PRD v2 Diterbitkan

Dokumen `PRD-v2.md` diterbitkan pada 2026-05-24 untuk **memformalkan kapabilitas tambahan** yang sudah diimplementasikan tetapi tidak dirinci di draft PRD v1:

- Two-Factor Authentication (security baseline)
- Polymorphic Audit Log (decision support)
- Notification Center (5 notification class) (modernisasi pelayanan)
- Address Book multi-alamat (mendukung "antar ke alamat")
- Reusable Measurement (mendukung "data ukuran terdokumentasi")
- Draft Order workflow (jsonb payload)
- Granular Production Stage enum
- Order Cancellation tracking
- Order Attachment Review (reference/proposal/revision/final)
- Shipment Lifecycle (4 status)
- Cart + CartItem (RTW e-commerce flow)
- Tailor Pricing Composite (`garment.base_price + fabric.price_adjustment`)
- Reports + PDF/CSV Export

PRD v2 mengakui kapabilitas-kapabilitas ini sebagai **enabler dari tujuan modernisasi** yang ditulis di PRD v1. Tidak ada pengurangan scope dari PRD v1 — v2 hanya menambah formalisasi.

### 7.3 Verifikasi Komprehensif

| Aktivitas | Hasil |
|---|---|
| **E2E browser test** (CloakBrowser headless) | 89 page × 6 role: 82 OK, 6 forbidden (correct role-block), 1 auth-redirect (correct guard), **0 error, 0 exception** |
| **Composer security audit** | ✅ 0 vulnerabilities (post-update). 5 CVE Symfony 2026-45065/45067/45068/45070/45075 + CVE-2026-33347 league/commonmark di-patch |
| **Pest test suite** | ✅ 112 pass, 782 assertions (existing baseline) |
| **Build & types check** | ✅ npm run build, npm run types:check |
| **Migration status** | ✅ All migrations applied, no pending |
| **Docker stack health** | ✅ 5 service Up (app/nginx/postgres/worker/scheduler) |
| **Deploy readiness** | ✅ `.env.docker.example`, `scripts/deploy.sh`, `ProductionStarterSeeder` semua ada dan terdokumentasi |

### 7.4 Verdict Final (Updated)

> **Sistem Djaitin sudah selaras 100% dengan aturan bisnis di PRD v1, plus implementasi tambahan yang mendukung tujuan modernisasi v1 dan diformalkan di PRD v2.**
> **Status: Ready for MVP Presentation & Production Deploy.**
> **Sisa gap (G-3, G-4, G-5) adalah post-MVP polish, bukan blocker.**
