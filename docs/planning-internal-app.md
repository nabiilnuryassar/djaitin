# Planning — Djaitin Office / Internal Dashboard
# Operational SIM (Sistem Informasi Manajemen) — Laravel + Inertia + React

**Tipe:** Internal operational web application (password-protected, role-based)  
**Target Surface:** `/office/*`  
**Framework:** Laravel 12 + React + Inertia.js v2  
**Style:** Simple, Elegant, Effortless, Hourglass, Modern — Floating Sidebar  
**Tanggal:** 2026-03-07  
**Method:** Spec-Driven Development (SDD) — Phase-based  

---

## Konteks & Tujuan

Internal app adalah sistem operasional sehari-hari untuk staf bisnis konveksi & tailor.  
Pengguna: Kasir, Produksi, Admin, Owner.  
Tujuan: Manajemen pesanan, pembayaran, stok, laporan — semuanya dalam satu alur yang rapi dan tervalidasi.

> Ini bukan website publik. Ini adalah **operating system internal bisnis garmen**.
> Sesuai arsitektur terbaru, semua referensi route internal lama `/app/*` di dokumen ini harus dibaca sebagai target `/office/*`.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 12 (PHP 8.4) |
| Frontend | React.js + Inertia.js v2 + TypeScript |
| Database | PostgreSQL |
| Testing | Pest 4 |
| Styling | **Tailwind CSS v4** |
| UI Components | **shadcn/ui** — komponen dasar internal app |
| Auth | Laravel Fortify (Breeze scaffolded) |
| Routing (FE) | Laravel Wayfinder |
| PDF | barryvdh/laravel-dompdf |
| Icons | **Lucide React** |
| Font | Plus Jakarta Sans (heading) + Inter (body) |

### shadcn/ui — Komponen yang Dipakai (Internal App)

| Komponen shadcn | Digunakan di |
|---|---|
| `Button` | Semua tombol aksi, sticky action bar, wizard steps |
| `Badge` | Status order, payment method, order type — semua chips |
| `Card` | KPI cards, order cards, payment cards |
| `Input` | Semua form field |
| `Textarea` | Catatan order, alasan reject, spec konveksi |
| `Select` | Model, bahan, kurir, filter dropdown |
| `Dialog` | Konfirmasi tolak transfer, konfirmasi close order |
| `Sheet` | Side drawer form (tambah user, tambah ukuran) |
| `Tabs` | Order detail (Detail/Pembayaran/Pengiriman/Log) |
| `Table` | Master data listing (GarmentModel, Fabric, Couriers, Users) |
| `Progress` | DP progress bar, production stage bar |
| `Separator` | Divider dalam form dan card |
| `Avatar` | User avatar di sidebar bottom + activity log |
| `Skeleton` | Loading state semua cards dan list |
| `DropdownMenu` | User menu, order action menu (···) |
| `AlertDialog` | Confirm sebelum aksi destructive (hapus, cancel order) |
| `Calendar` | Due date picker pada tailor wizard |
| `Popover` | Date picker wrapper |

> **Aturan shadcn di Internal App:**
> - Gunakan shadcn sebagai structural base — style di-extend via `className` Tailwind
> - Jangan override `globals.css` shadcn secara aggressif
> - Gunakan shadcn `cn()` utility untuk conditional class merging

---

## Design System — Internal App

```
App Background:  #F0EFFF (lavender-light — outer shell)
Surface:         #FFFFFF (cards, panels, tables)
Sidebar:         #1A1830 (dark navy — floating sidebar)
Active Nav:      #6C63FF pill in sidebar
Primary:         #6C63FF
Accent:          #A89CFF
Success:         #10B981
Warning:         #F59E0B
Danger:          #EF4444
Text heading:    #1A1830
Text body:       #4B5563

Cards:    bg-white rounded-2xl shadow-sm border-gray-100 p-5
Badges:   rounded-full px-3 py-0.5 text-xs font-medium
Inputs:   rounded-xl border-gray-200 focus:ring-2 ring-indigo-300
Sidebar:  rounded-2xl fixed left-4 top-4 bottom-4 (NOT touching edge)
```

**Glassmorphism TIDAK digunakan** di dalam app — hanya di landing page.  
App mockup harus terasa **structured, sharp, operational**.

---

## Navigation Architecture

### Desktop — Floating Dark Sidebar

```tsx
// FloatingSidebar.tsx
// position: fixed left-4 top-4 bottom-4 z-40
// bg-[#1A1830] rounded-2xl
// w-20 (icon-only, default) | w-60 (expanded on hover/pin)
// transition-width duration-300

// Struktur:
// [Logo area: ✂️ + "djaitin" (expanded only)]
// [Nav items list]
// [Separator]
// [Settings item]
// [User avatar + name + logout (bottom)]
```

**Nav Item — Active State:**
```tsx
// bg-indigo-600 rounded-xl text-white
// px-3 py-2.5 flex items-center gap-3
// font-medium text-sm
```

**Nav Item — Inactive State:**
```tsx
// text-slate-400 rounded-xl
// hover:bg-slate-700/50 hover:text-white
// transition-colors duration-150
```

Struktur nav items:
- `LayoutDashboard` Dashboard
- `ClipboardList` Orders
- `CreditCard` Pembayaran
- `Users` Pelanggan
- `Package` Inventori
- `BarChart2` Laporan
- `──` Separator
- `Settings` Pengaturan

### Mobile — Floating Bottom Nav

```tsx
// FloatingBottomNav.tsx
// position: fixed bottom-4 left-4 right-4 z-40
// bg-white rounded-2xl shadow-xl
// px-2 py-2 flex items-center justify-around

// Items: Home | ClipboardList | [FAB] | CreditCard | MoreHorizontal
```

**FAB (Floating Action Button):**
```tsx
// Plus icon dari Lucide
// bg-indigo-600 rounded-full w-13 h-13 shadow-lg
// hover:bg-indigo-700 active:scale-95 transition-all
// Tap → Sheet dari shadcn slide-up
```

**FAB Bottom Sheet (shadcn `Sheet` side="bottom"):**
```tsx
// Pilih jenis order:
// [✂️ Tailor (Jahit Custom)]
// [👕 Ready-to-Wear (Stok)]
// [🏭 Konveksi (Massal)]
// [Batal]
```

### Tablet — Navigation Rail

```tsx
// Sama dengan FloatingSidebar tapi stuck di w-20 (icon-only)
// Tidak ada expand on hover di tablet
// Tooltip via Lucide tooltip atau custom saat hover icon
```

---

## Module Plan — Phase 1 (MVP Tailor, Minggu 1–4)

### Minggu 1 — Foundation + Auth + Users + Customer

**Foundation:**
- [ ] Timezone: `config/app.php` → `Asia/Jakarta`
- [ ] Role middleware: `bootstrap/app.php`
- [ ] Seed: DiscountPolicies + default admin user
- [ ] Scaffold layouts: `AppLayout`, `SidebarLayout`, `BottomNav`
- [ ] Design tokens: Tailwind config (colors, font, spacing)

**Auth (Fortify):**
- [ ] Login page: centered card, brand mark, email + password
- [ ] Logout
- [ ] Redirect berdasarkan role setelah login

**Users (Admin only):**
- [ ] List users (table: nama, email, role badge, status, aksi)
- [ ] Tambah user (side drawer atau form)
- [ ] Edit role + aktif/nonaktif
- [ ] Tidak ada registrasi publik

**Customers:**
- [ ] List + search (card: nama, phone, order count, loyalty badge)
- [ ] Create / Edit form (nama, phone, alamat)
- [ ] Detail page: info + ukuran + riwayat order

### Minggu 2 — Master Data

**Measurements (nested under Customer):**
- [ ] Form tambah/edit ukuran per pelanggan
- [ ] Tampil per jenis garmen + tanggal

**Garment Models & Fabrics (Admin):**
- [ ] Inline editable table
- [ ] Toggle aktif/nonaktif

**Discount Policy (Admin):**
- [ ] Edit `loyalty_threshold` dan `loyalty_discount_percent`
- [ ] Riwayat perubahan ditampilkan (dari audit log)
- [ ] Info banner: "perubahan berlaku untuk order baru"

### Minggu 3 — Tailor Order + PaymentService

**Tailor Order Wizard (4 langkah):**

```
Step 1: Pilih / Buat Pelanggan
  - Search existing customer
  - Detect loyalty eligibility → tampil badge + info diskon 20%
  - Atau buat pelanggan baru inline

Step 2: Garmen
  - Pilih model (grid cards)
  - Pilih bahan (radio)
  - Pilih ukuran: dropdown history atau input baru

Step 3: Summary
  - Qty stepper
  - Target selesai (date picker)
  - Catatan (textarea opsional)
  - Ringkasan biaya: subtotal, diskon loyalty, total
  - Loyalty diskon tercetak jelas dengan badge 🏅

Step 4: DP
  - Cash / Transfer toggle
  - Input nominal DP
  - Live validation: % bar, ✅ jika ≥ 50%, ⚠️ rose alert jika < 50%
  - [Simpan Order] disabled jika DP < 50% dan memilih mulai produksi
```

**Business Rules Enforced (Tailor):**
- BR-T01: Backend Service block IN_PROGRESS jika DP < 50%
- BR-T02: Block CLOSE jika outstanding > 0
- BR-T03: Auto-apply loyalty 20% jika CLOSED orders > threshold
- BR-P01: Cash → langsung VERIFIED
- BR-P02: Transfer → PENDING_VERIFICATION

**Services:**
- [ ] `TailorOrderService::create()`
- [ ] `TailorOrderService::validateDpGate()`
- [ ] `LoyaltyService::checkEligibility()`
- [ ] `LoyaltyService::applyDiscount()`
- [ ] `PaymentService::record()`
- [ ] `PaymentService::verifyCash()`
- [ ] `AuditLogService::log()`

### Minggu 4 — Order Detail + Documents + Dashboard Basic

**Order Detail Page (Tabs):**
```
Tab 1: Detail
  - Info pelanggan + loyalty badge
  - DP progress bar (% dari total)
  - Detail pesanan: model, bahan, qty, due date, catatan
  - Ringkasan biaya (subtotal, diskon, total, terbayar, sisa)

Tab 2: Pembayaran
  - Riwayat semua payment (cards)
  - Verify / Tolak button untuk transfer PENDING
  - Cetak kwitansi untuk VERIFIED

Tab 3: Pengiriman
  - Status shipment
  - Kurir, ongkir, alamat, no resi

Tab 4: Activity Log
  - Timeline: siapa, kapan, aksi apa, dari status ke status apa
```

**Sticky Bottom Action Bar (Contextual):**
```
Status PENDING_PAYMENT → [+ Catat Pembayaran]
Status DONE + outstanding > 0 → [+ Catat Pelunasan] + [Close ← disabled abu]
Status DONE + outstanding == 0 → [✅ Close / Serah Terima]
```

**Nota Pesanan + Kwitansi (PDF):**
- [ ] `DocumentService::generateNota(Order)`
- [ ] `DocumentService::generateKwitansi(Payment)`
- [ ] Tombol Print / Download per page

**Dashboard Basic:**
- [ ] KPI cards per role (lihat permission matrix)
- [ ] Alert banners (transfer pending, due date approaching)
- [ ] Recent orders list (5 terbaru)

---

## Module Plan — Phase 2 (RTW + Shipping, Minggu 5–7)

### Ready-to-Wear Checkout

**Cart-style flow:**
```
1. Pilih produk → tampil size chips → [+ Keranjang]
2. Keranjang: adjust qty, hapus item, tampil clearance badge
3. Checkout: pilih pickup atau kurir + ongkir + alamat + no resi (opsional)
4. Bayar: Cash / Transfer → confirm
```

**Business Rules (RTW):**
- BR-R01: Block jika qty > stok (StockService)
- BR-R02: Stok berkurang hanya setelah payment VERIFIED

**Services:**
- [ ] `StockService::validateStock()`
- [ ] `StockService::decrementStock()`

**Product Inventory CRUD (Admin):**
- [ ] Tabel produk: gambar, nama, SKU, ukuran, stok badge, harga
- [ ] Filter: Semua / Low Stock ⚠️ / Clearance
- [ ] Edit form: nama, SKU, size, harga jual, HPP, stok, is_clearance, diskon
- [ ] Constraint display: HPP shown on clearance items

**Courier + Shipment:**
- [ ] Courier master CRUD (Admin)
- [ ] Shipment tab pada Order Detail: status, kurir, tracking

**Enhanced Dashboard:**
- [ ] Pending transfer count alert
- [ ] Due dates approaching (tailor)
- [ ] Low stock alert cards

---

## Module Plan — Phase 3 (Konveksi + Analytics, Minggu 8–10)

### Konveksi Order Wizard (3 langkah)

```
Step 1: Perusahaan / PIC
  - Nama perusahaan atau cari pelanggan lama
  - Catatan desain / spesifikasi (textarea)

Step 2: Items
  - Daftar item: nama, qty, harga satuan → subtotal
  - [+ Tambah Item] / [🗑 Hapus]
  - Total seluruh items

Step 3: Pembayaran Penuh
  - ⚠️ Banner merah: "Konveksi wajib lunas 100% sebelum produksi"
  - Input nominal + Cash/Transfer
  - Transfer: input referensi + upload bukti
  - [Simpan Order] hanya aktif jika nominal == total
```

**Business Rules (Konveksi):**
- BR-C01: Status IN_PROGRESS hanya jika 100% payment VERIFIED

**ConvectionOrderService:**
- [ ] `create()`
- [ ] `validateFullPaymentGate()`

**Production Status Stages:**
```
desain → bahan → produksi → QC → packing → pengiriman/pickup
```

### Advanced Reports + Export

- [ ] Omzet (total, per jenis, chart harian)
- [ ] Pembayaran: cash vs transfer, verified vs pending
- [ ] Inventori: low stock, clearance performance
- [ ] Pelanggan loyal + discount savings
- [ ] Export PDF (`DocumentService::exportReport()`)
- [ ] Export CSV (Laravel Excel atau Str response)

### Audit Log Viewer

- [ ] Timeline entries: siapa, kapan, modul, aksi
- [ ] Expand per entry → before/after JSON diff
- [ ] Filter: by user, by modul, by aksi, by date

---

## File Structure — Internal App

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── DashboardController.php
│   │   ├── OrderController.php
│   │   ├── PaymentController.php
│   │   ├── CustomerController.php
│   │   ├── MeasurementController.php
│   │   ├── ProductController.php
│   │   ├── GarmentModelController.php
│   │   ├── FabricController.php
│   │   ├── CourierController.php
│   │   ├── DiscountPolicyController.php
│   │   ├── ShipmentController.php
│   │   ├── ReportController.php
│   │   ├── UserController.php
│   │   └── AuditLogController.php
│   ├── Requests/               # Form Requests per aksi
│   └── Middleware/
│       └── EnsureRole.php      # Role middleware
├── Models/                     # 13 models (sudah dibuat)
├── Services/
│   ├── TailorOrderService.php
│   ├── ConvectionOrderService.php
│   ├── OrderStatusService.php
│   ├── PaymentService.php
│   ├── LoyaltyService.php
│   ├── StockService.php
│   ├── AuditLogService.php
│   └── DocumentService.php
├── Enums/                      # 6 enums (sudah dibuat)
└── Policies/                   # Per resource

resources/js/
├── pages/
│   ├── Auth/Login.tsx
│   ├── Dashboard/Index.tsx
│   ├── Orders/
│   │   ├── Index.tsx           # list + filter tabs
│   │   ├── Show.tsx            # detail + tabs
│   │   ├── TailorWizard.tsx    # 4-step wizard
│   │   ├── RTWCheckout.tsx     # cart checkout
│   │   └── ConvectionWizard.tsx # 3-step wizard
│   ├── Payments/Index.tsx
│   ├── Customers/
│   │   ├── Index.tsx
│   │   ├── Show.tsx
│   │   └── Create.tsx
│   ├── Inventory/
│   │   ├── Index.tsx
│   │   └── Edit.tsx
│   ├── Reports/Index.tsx
│   └── Settings/
│       ├── Models/Index.tsx
│       ├── Fabrics/Index.tsx
│       ├── Couriers/Index.tsx
│       ├── Discounts/Index.tsx
│       ├── Users/Index.tsx
│       └── AuditLog/Index.tsx
├── components/
│   ├── ui/                    # Badge, Button, Input, Card, etc.
│   ├── layout/
│   │   ├── FloatingSidebar.tsx
│   │   ├── FloatingBottomNav.tsx
│   │   └── TopBar.tsx
│   ├── orders/
│   │   ├── OrderCard.tsx
│   │   ├── DPProgressBar.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── StickyActionBar.tsx
│   │   └── ActivityLogItem.tsx
│   └── payments/
│       └── PaymentCard.tsx
└── layouts/
    └── AppLayout.tsx
```

---

## Routing Reference

| URI | Named Route | Controller | Page |
|---|---|---|---|
| `/` | `dashboard` | `DashboardController@index` | `Dashboard/Index` |
| `/orders` | `orders.index` | `OrderController@index` | `Orders/Index` |
| `/orders/tailor/create` | `orders.tailor.create` | `OrderController@createTailor` | `Orders/TailorWizard` |
| `/orders/rtw/create` | `orders.rtw.create` | `OrderController@createRtw` | `Orders/RTWCheckout` |
| `/orders/convection/create` | `orders.convection.create` | `OrderController@createConvection` | `Orders/ConvectionWizard` |
| `/orders/{order}` | `orders.show` | `OrderController@show` | `Orders/Show` |
| `/payments` | `payments.index` | `PaymentController@index` | `Payments/Index` |
| `/payments/{payment}/verify` | `payments.verify` | `PaymentController@verify` | — |
| `/payments/{payment}/reject` | `payments.reject` | `PaymentController@reject` | — |
| `/customers` | `customers.index` | `CustomerController@index` | `Customers/Index` |
| `/inventory` | `inventory.index` | `ProductController@index` | `Inventory/Index` |
| `/reports` | `reports.index` | `ReportController@index` | `Reports/Index` |
| `/settings/users` | `users.index` | `UserController@index` | `Settings/Users/Index` |
| `/settings/audit-log` | `audit-log.index` | `AuditLogController@index` | `Settings/AuditLog/Index` |

---

## Testing Strategy

### Business Rule Test Coverage (Wajib)

| BR | Test File | Deskripsi |
|---|---|---|
| BR-T01 | `TailorOrderTest.php` | Tolak IN_PROGRESS bila DP < 50% |
| BR-T02 | `TailorOrderTest.php` | Tolak CLOSE bila outstanding > 0 |
| BR-T03 | `TailorOrderTest.php` | Auto-apply loyalty jika CLOSED > threshold |
| BR-R01 | `ReadyWearOrderTest.php` | Tolak checkout jika qty > stok |
| BR-R02 | `ReadyWearOrderTest.php` | Stok berkurang setelah payment VERIFIED saja |
| BR-C01 | `ConvectionOrderTest.php` | Tolak IN_PROGRESS jika payment < 100% |
| BR-P01 | `PaymentVerificationTest.php` | Cash → langsung VERIFIED |
| BR-P02 | `PaymentVerificationTest.php` | Transfer → PENDING_VERIFICATION |
| BR-P03 | `PaymentVerificationTest.php` | Kwitansi hanya untuk VERIFIED |
| BR-P05 | `PaymentVerificationTest.php` | Reject wajib ada alasan |
| BR-G01 | `OrderStatusServiceTest.php` | Block CLOSE jika outstanding > 0 |
| BR-G02 | `AuditLogTest.php` | Status change selalu create audit log |

### Perbandingan

```
Kasir      → Test: create order, record payment, cetak nota
Produksi   → Test: update status IN_PROGRESS → DONE
Admin      → Test: verify/reject transfer, manage users, edit discount
Owner      → Test: hanya bisa GET reports, tidak bisa POST/PUT/DELETE
```

---

## Definition of Done (Per Fitur)

- [ ] Migration bersih: `php artisan migrate:fresh --seed`
- [ ] Model, relationships, casts benar
- [ ] Service class implement business rules dari system-spec
- [ ] Form Request: semua validasi + error message Bahasa Indonesia
- [ ] Controller tipis: receive → validate → delegate → respond
- [ ] Route terdaftar dengan named route yang benar
- [ ] Halaman Inertia render benar di mobile + desktop
- [ ] Semua business rule tests lulus
- [ ] `vendor/bin/pint --dirty --format agent` clean
- [ ] Tidak ada inline komentar dalam source code
- [ ] Audit log tercatat untuk aksi kritikal

---

## Tailwind v4 Config (Internal App)

```css
/* resources/css/app.css */
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

@theme {
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-body:    'Inter', sans-serif;

  /* Brand */
  --color-primary:  #6C63FF;
  --color-accent:   #A89CFF;
  --color-shell:    #F0EFFF;
  --color-sidebar:  #1A1830;

  /* Semantic */
  --color-success:  #10B981;
  --color-warning:  #F59E0B;
  --color-danger:   #EF4444;

  /* Radius */
  --radius-card:    1.25rem;   /* rounded-2xl */
  --radius-input:   0.75rem;   /* rounded-xl */
  --radius-badge:   9999px;    /* rounded-full */
}
```

---

## Komponen UI Utama (Reusable)

| Komponen | Deskripsi |
|---|---|
| `StatusBadge` | Colored pill untuk OrderStatus, PaymentStatus, dll |
| `OrderCard` | Card order dengan border-l-4 per jenis, info ringkas |
| `DPProgressBar` | Progress bar DP, warna berubah saat ≥ 50% |
| `StickyActionBar` | Fixed bottom contextual CTA (berdasarkan order status) |
| `PaymentCard` | Card payment dengan method + status + aksi |
| `ActivityLogItem` | Satu baris timeline log |
| `LoyaltyBadge` | 🏅 badge kuning, muncul bila eligible |
| `AlertBanner` | border-l-4 info/warning/error banner |
| `InlineEditRow` | Table row yang bisa di-edit inline (master data) |
| `SizeChip` | Size selector chip (RTW checkout) |
| `StepIndicator` | Wizard step progress (① ② ③ ④) |
| `BottomSheet` | Slide-up sheet untuk mobile bottom sheet (FAB, filter, dll) |
