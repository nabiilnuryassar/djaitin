# Planning — Djaitin Ecosystem

**Version:** 2.0  
**Date:** 2026-03-08  
**Method:** Spec-Driven Development (SDD)

---

## 1. Strategic Direction

Dokumen ini menetapkan urutan implementasi baru:

1. Landing tetap sebagai marketing site
2. `/app` menjadi customer surface
3. `/office` menjadi internal operational surface
4. Customer app dan office memakai business service yang sama

Artinya, fase berikutnya bukan sekadar menambah halaman customer, tetapi juga **menormalkan arsitektur route dan auth** agar sesuai produk yang diinginkan.

---

## 2. Phase Map

| Phase | Focus | Output |
|---|---|---|
| **Phase 0** | Architecture normalization | `/app` customer, `/office` internal |
| **Phase 1** | Customer identity & portal foundation | auth customer, dashboard, profile, address, measurements |
| **Phase 2** | Interactive Tailor ordering | tailor configurator, draft, DP, tracking |
| **Phase 3** | Ready-to-Wear commerce | catalog, cart, checkout, shipping choice |
| **Phase 4** | Convection customer flow | quotation-style request, upload reference, tracking |
| **Phase 5** | Office consolidation & parity | route migration, role dashboards, shared ops alignment |
| **Phase 6** | Notifications, reporting, optimization | customer notifications, analytics, refinements |

---

## 3. Phase 0 — Architecture Normalization

**Goal:** menyelaraskan codebase dengan product architecture baru.

### Scope

- pindahkan internal surface dari `/app` ke `/office`
- pindahkan admin-owner modules dari `/cms` ke `/office`
- siapkan namespace baru:
  - `App\Http\Controllers\Customer\...`
  - `App\Http\Controllers\Office\...`
  - `resources/js/pages/Customer/...`
  - `resources/js/pages/Office/...`
- ubah redirect login:
  - customer → `/app/dashboard`
  - internal roles → `/office/dashboard`
- aktifkan registrasi publik hanya untuk role customer
- pastikan account internal tetap dibuat dari backoffice

### Deliverables

- route files baru `routes/customer.php` dan `routes/office.php`
- middleware/redirect rules yang baru
- compatibility note untuk route lama

### Tests

- auth redirect per role
- guest/customer tidak bisa akses `/office`
- staff tidak bisa akses portal customer milik user lain

---

## 4. Phase 1 — Customer Foundation

**Goal:** customer memiliki akun dan area portal yang usable.

### Modules

- register / login customer
- customer dashboard
- profile management
- address book
- measurement library
- order history
- payment history
- notifications shell

### Core Pages

- `/app`
- `/app/dashboard`
- `/app/orders`
- `/app/payments`
- `/app/measurements`
- `/app/addresses`
- `/app/profile`
- `/app/notifications`

### Backend Requirements

- customer role support
- customer profile relation
- address model / table
- policy untuk ownership
- customer notification model atau temporary in-app feed

### Tests

- customer registration/login
- ownership isolation
- CRUD address dan measurements
- dashboard hanya menampilkan data customer sendiri

---

## 5. Phase 2 — Interactive Tailor Ordering

**Goal:** customer dapat menyusun tailor order secara interaktif dari app.

### UX Flow

1. pilih kategori pakaian
2. pilih model
3. pilih bahan
4. pilih ukuran
5. review summary
6. bayar DP

### Functional Scope

- tailor configurator page
- estimator biaya realtime di UI
- final calculation di backend
- save draft order
- reuse saved measurement
- choose:
  - ukuran tersimpan
  - input ukuran baru
  - request ukur offline
- upload bukti transfer
- customer-facing status tracking

### Business Rules to Enforce

- BR-T01
- BR-T02
- BR-T03
- BR-P01
- BR-P02
- BR-P04
- BR-U01
- BR-U04

### Deliverables

- `Customer/Tailor/Configurator`
- customer tailor order store endpoint
- customer order detail page
- payment submission flow

### Tests

- draft tailor order bisa disimpan
- tailor submit menghitung total benar
- DP < 50% tidak bisa memulai produksi
- customer hanya melihat tailor order miliknya

---

## 6. Phase 3 — Ready-to-Wear Commerce

**Goal:** customer dapat belanja produk stok seperti e-commerce ringan.

### Functional Scope

- katalog produk
- detail produk
- size selection
- cart
- checkout
- pickup atau delivery
- payment flow
- shipment tracking di order detail

### Backend Dependencies

- stock validation
- shipping address handling
- shipping quotation input
- post-payment stock decrement

### Tests

- qty tidak boleh melebihi stock
- stok berkurang setelah payment verified
- pickup tidak butuh alamat
- delivery butuh alamat

---

## 7. Phase 4 — Convection Customer Flow

**Goal:** customer dapat membuat permintaan/pesanan konveksi dari portal.

### Functional Scope

- company / PIC form
- multi-item production request
- qty dan notes
- upload desain referensi
- summary dan total
- full payment flow
- progress tracking per tahap

### Tests

- full payment gate
- item list tersimpan benar
- progress status termapping ke customer portal

---

## 8. Phase 5 — Office Consolidation & Internal Parity

**Goal:** menyelaraskan internal office dengan customer surface tanpa duplicate logic.

### Scope

- migrasi penuh route internal ke `/office`
- dashboard role-based:
  - kasir
  - produksi
  - admin
  - owner
- satukan payment verification dan order operations di office
- pastikan order dari customer dan order manual kasir masuk ke pipeline yang sama

### Critical Requirement

Customer order dan order internal **tidak boleh** memakai aturan bisnis yang berbeda. Semua harus lewat service layer yang sama.

---

## 9. Phase 6 — Notifications, Reports, Optimization

### Customer-Side

- status change notification
- payment verification notification
- pickup ready notification
- shipment delivered notification

### Office-Side

- lead source analysis
- customer repeat-order metrics
- funnel: draft → submit → paid → closed
- SLA / overdue monitoring

---

## 10. Feature Implementation Order

Untuk setiap feature:

1. migration / schema
2. model / relation / enum
3. factory / seeder
4. service
5. policy / request
6. controller
7. route
8. Inertia page
9. Pest test

---

## 11. Definition of Done

Sebuah phase dianggap selesai jika:

- spec dan route mapping sudah jelas
- service layer business rules sudah enforced
- page flow end-to-end usable
- semua ownership dan role gates teruji
- dummy data mendukung demo flow
- minimum relevant Pest tests pass

---

## 12. Immediate Next Build Recommendation

Urutan implementasi yang direkomendasikan setelah dokumen ini:

1. Phase 0 route normalization
2. customer auth + dashboard foundation
3. tailor configurator customer
4. office migration cleanup

Jika urutan dibalik, route `/app` untuk customer akan terus bentrok dengan internal app yang sudah ada.
