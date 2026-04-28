# PRD Alignment Status And Checklists

**Last reviewed:** 2026-04-07 (Asia/Jakarta)

Dokumen ini melengkapi:

- `docs/prd-alignment-refactor-plan.md` (keputusan produk)
- `docs/prd-alignment-execution-phases.md` (breakdown phase)

Fokus dokumen ini:

- status repo saat ini vs Phase 2..6
- checklist konkret per phase (file-driven)

## Status Saat Ini (Ringkas)

### Phase 2 (Simplify Convection Core Flow)

**Sudah terjadi:**

- service konveksi sudah diarahkan ke **full payment** tanpa quotation: `app/Services/ConvectionOrderService.php`
- form create konveksi di customer sudah mengarah ke full payment: `resources/js/pages/Customer/Convection/Create.tsx`
- route office untuk quotation sudah tidak ada lagi: `routes/office.php`
- test sudah tidak lagi mengasumsikan flow quotation hybrid:
  - `tests/Feature/Customer/ConvectionOrderTest.php`
  - `tests/Feature/NotificationTest.php`

**Masih tersisa:**

- enum/status yang masih memuat `awaiting_price` untuk kompatibilitas data lama (perlu dipastikan tidak dipakai di flow utama):
  - `app/Enums/OrderStatus.php`
  - `app/Http/Controllers/Customer/OrderController.php`
  - `app/Http/Controllers/Office/DashboardController.php`
  - `app/Http/Controllers/Office/ProductionController.php`
  - `app/Services/ReportService.php`
- beberapa dokumen lama masih menyebut quotation/kanban dan perlu dirapikan (Phase 6).

### Phase 3 (Simplify Design Collaboration)

**Sudah terjadi:**

- kolaborasi desain disederhanakan menjadi upload/list/catatan (tanpa approval workflow):
  - `app/Services/AttachmentService.php`
  - `app/Http/Controllers/Customer/OrderController.php`
  - `app/Http/Controllers/Office/OrderController.php`
- linked attachment/thread per card sudah tidak dipakai lagi di code path utama:
  - `app/Models/OrderAttachment.php`
  - `app/Http/Requests/Office/StoreOrderAttachmentRequest.php`
  - `resources/js/pages/Office/Orders/Show.tsx`
- test attachment sudah fokus ke upload/list basic:
  - `tests/Feature/OrderAttachmentTest.php`

**Masih tersisa:**

- cleanup kolom legacy di database (jika ingin dirapikan total) bisa dimasukkan ke Phase 6.

### Phase 4..6

Belum dieksekusi secara eksplisit. Masih perlu UI cleanup, tightening rules, dan hardening docs/test.

---

## Checklist Phase 2 — Convection Core Flow (PRD Simple)

Target phase ini: konveksi kembali ke flow PRD sederhana (buat order -> bayar penuh -> verifikasi -> produksi).

### 2.1 Backend: Status, Requests, Services

- [ ] Hapus/retire `OrderStatus::AwaitingPrice` dan semua pemakaian aktifnya:
  - `app/Enums/OrderStatus.php`
  - `app/Http/Controllers/Customer/OrderController.php` (label status)
  - `app/Http/Controllers/Office/DashboardController.php` (kartu/summary)
  - `app/Http/Controllers/Office/ProductionController.php` (filter produksi)
  - `app/Services/ReportService.php` (filter report)
- [x] Hapus guard “baru bisa bayar setelah quotation”:
  - `app/Http/Requests/Customer/StorePaymentRequest.php`
- [ ] Pastikan tidak ada lagi endpoint/route quotation yang customer-facing maupun office-facing.
  - cek `routes/office.php` dan `resources/js/actions/.../Office/OrderController.ts`

### 2.2 Frontend: Customer Convection Create

- [x] Pastikan payload customer konveksi tidak lagi membawa `pricing_mode`:
  - `resources/js/pages/Customer/Convection/Create.tsx`
  - `app/Http/Requests/Customer/StoreConvectionOrderRequest.php`
- [ ] Pastikan `payment.amount` selalu full payment (equal subtotal) dan UX-nya tidak membingungkan.

### 2.3 Tests

- [x] Update `tests/Feature/Customer/ConvectionOrderTest.php` agar:
  - tidak ada `pricing_mode`
  - tidak ada skenario `request_quote`
  - tidak ada status `awaiting_price`
  - coverage: create convection full payment + file reference + payment recorded
- [x] Update `tests/Feature/NotificationTest.php` agar tidak lagi menguji `ConvectionQuoteReadyNotification` / quotation notes.

### 2.4 Docs

- [ ] Update dokumen yang masih menyebut flow quotation hybrid jika ada.

**Definition of Done Phase 2:**

- tidak ada referensi aktif ke `awaiting_price` di code path utama
- create convection = full payment flow
- payment tidak terblokir quotation
- tests convection/notification lulus

---

## Checklist Phase 3 — Design Collaboration (PRD Simple)

Target phase ini: kolaborasi desain tetap ada, tetapi hanya sebagai upload/list/catatan sederhana.

### 3.1 Backend: Data & Endpoint

- [x] Putuskan metadata minimal attachment untuk PRD:
  - keep: `title`, `notes`, `attachment_type`, `file`, `uploaded_by`, timestamp
  - remove/retire: `approval_status`, `review_notes`, `reviewed_by`, `reviewed_at` (jika tidak dibutuhkan)
- [x] Remove/retire endpoint approval customer:
  - `routes/customer.php` (approval route)
  - `app/Http/Controllers/Customer/OrderController.php` (updateAttachmentApproval)
  - `app/Http/Requests/Customer/UpdateAttachmentApprovalRequest.php`
- [x] Remove/retire linked attachment/thread:
  - `app/Models/OrderAttachment.php` (relasi linked/follow up)
  - `database/migrations/2026_04_03_163304_add_linked_attachment_id_to_order_attachments_table.php`
  - `app/Services/AttachmentService.php` (linked_attachment_id payload)

### 3.2 Frontend: Customer Order Design Desk

- [x] Ubah `Design Desk` customer jadi list sederhana tanpa approval/revision:
  - `resources/js/pages/Customer/Orders/Show.tsx`
- [ ] Pastikan customer masih bisa buka file, lihat catatan, dan upload file referensi/revisi bila memang diperlukan PRD.

### 3.3 Frontend: Office Order Design Section

- [x] Pastikan office hanya:
  - upload file
  - lihat list file (customer/office)
  - buka file dan baca catatan
  - tanpa board/workflow state
  - `resources/js/pages/Office/Orders/Show.tsx`

### 3.4 Tests

- [x] Pangkas `tests/Feature/OrderAttachmentTest.php`:
  - hapus skenario approval/revision
  - hapus skenario workflow board
  - fokus ke upload/list attachment basic

### 3.5 Docs

- [x] Revisi `docs/convection-design-collaboration.md` agar sesuai versi sederhana.

**Definition of Done Phase 3:**

- tidak ada approval workflow desain
- tidak ada linked attachment thread
- UI design collaboration sederhana dan konsisten customer/office
- tests attachment lulus

---

## Checklist Phase 4 — UI Cleanup And Consistency

- [ ] Audit istilah UI yang masih menyiratkan flow non-PRD (quotation, approval, workflow).
- [ ] Rapikan copywriting konveksi agar selalu “bayar penuh untuk mulai produksi”.
- [ ] Pastikan tabs tidak berlebihan dan konten tidak overlap.

---

## Checklist Phase 5 — Business Rule Tightening

- [ ] Finalisasi loyalti: `> 5` atau `>= 5`:
  - `app/Services/LoyaltyService.php`
  - tests loyalti (jika ada)
  - docs PRD/user manual
- [ ] Due date / pickup SOP:
  - putuskan enforcement vs SOP docs

---

## Checklist Phase 6 — Docs And Final Hardening

- [ ] Update `docs/PRD.md` (jika ada catatan implementasi)
- [ ] Update `docs/USER-MANUAL.md`
- [ ] Update `docs/MVP-READINESS.md`
- [ ] Archive atau update docs yang menggambarkan flow lama
- [ ] Pastikan build & test critical paths lulus
