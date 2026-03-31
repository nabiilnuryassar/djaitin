# Product Requirements Document (PRD)
# SIM Konveksi & Tailor — djaitin

**Versi:** 1.1  
**Tanggal:** 2026-03-07  
**Pemilik Produk:** Owner / Manager (internal)  
**Status Dokumen:** Living Document — Phase 1–3  

> Catatan: untuk keputusan arsitektur terbaru, route surface, dan boundary customer vs office, gunakan `docs/system-spec.md` v2.0 sebagai source of truth. Dokumen ini masih merefleksikan framing internal-first yang lebih lama.

---

## Daftar Isi

1. [Ringkasan Produk](#1-ringkasan-produk)
2. [Masalah & Solusi](#2-masalah--solusi)
3. [Pengguna (User Personas)](#3-pengguna-user-personas)
4. [Arsitektur & Tech Stack](#4-arsitektur--tech-stack)
5. [Modul & Fitur](#5-modul--fitur)
6. [Business Rules (Aturan Mutlak)](#6-business-rules-aturan-mutlak)
7. [Alur Status Order](#7-alur-status-order)
8. [UI/UX Design Principles](#8-uiux-design-principles)
9. [Database Schema (Ringkasan)](#9-database-schema-ringkasan)
10. [Routing & Halaman](#10-routing--halaman)
11. [Rencana Delivery (Phases)](#11-rencana-delivery-phases)
12. [Definisi of Done](#12-definition-of-done)

---

## 1. Ringkasan Produk

**djaitin** adalah Sistem Informasi Manajemen (SIM) berbasis web untuk bisnis **konveksi & tailor** yang mendigitalisasi operasional end-to-end: dari penerimaan pesanan, manajemen produksi, pembayaran, stok pakaian siap pakai, hingga laporan keuangan.

### Tiga Layanan Utama

| Layanan | Deskripsi Singkat |
|---|---|
| **Tailor (Jahit Custom)** | Pesanan jahit per ukuran pelanggan. DP minimal 50%. Loyalty program. |
| **Ready-to-Wear (RTW)** | Penjualan stok pakaian siap pakai. Manajemen inventori, diskon, clearance. |
| **Konveksi (Massal)** | Produksi massal untuk perusahaan/institusi. Wajib lunas 100% sebelum mulai. |

### Nilai Utama Produk

- **Administrasi rapi** — tidak ada catatan manual, semua tercatat digital.
- **Validasi pembayaran akurat** — tidak bisa mulai produksi tanpa DP/full payment tersedia.
- **Transparansi produksi** — status order dapat dipantau real-time.
- **Manajemen stok** — stok tidak bisa negatif, validasi di level service & DB.
- **Laporan untuk owner** — omzet, transaksi, loyal customer, stok kritis.

---

## 2. Masalah & Solusi

| Masalah | Solusi djaitin |
|---|---|
| Pencatatan manual di buku/kertas → mudah hilang | Database terstruktur + audit log otomatis |
| DP tidak divalidasi → produksi jalan tanpa bayar | Gerbang DP ≥ 50% di level backend (tidak bisa di-bypass) |
| Stok barang siap pakai tidak terpantau | Inventori real-time; stok dikurangi hanya setelah bayar verified |
| Transfer masuk tidak terverifikasi → selisih kas | Alur verify/reject transfer dengan audit trail |
| Pelanggan loyal tidak diketahui → diskon tidak konsisten | Loyalty program otomatis (threshold order CLOSED > 5) |
| Owner tidak bisa lihat ringkasan bisnis | Dashboard + report per periode, export PDF/CSV |
| Konveksi sering produksi sebelum bayar lunas | Full payment gate 100% sebelum status IN_PROGRESS |

---

## 3. Pengguna (User Personas)

### 3.1 Kasir / Front Office

**Tujuan:** Proses pesanan baru, input pembayaran, cetak nota & kwitansi.  
**Perangkat:** Smartphone + tablet di meja kasir.  
**Aksi utama:** Buat tailor order, buat RTW checkout, catat pembayaran cash/transfer, cetak nota.

### 3.2 Tim Produksi

**Tujuan:** Update status produksi; lihat detail pesanan dan ukuran.  
**Perangkat:** Tablet di area produksi.  
**Aksi utama:** Update status IN_PROGRESS → DONE; lihat ukuran & model yang dipesan.

### 3.3 Admin

**Tujuan:** Kelola keseluruhan sistem — master data, verifikasi pembayaran, laporan.  
**Perangkat:** Desktop/laptop.  
**Aksi utama:** Verifikasi/tolak transfer, kelola user & role, atur discount policy, kelola master data, lihat audit log.

### 3.4 Owner / Manager

**Tujuan:** Pantau kesehatan bisnis — KPI, laporan keuangan, loyal customer.  
**Perangkat:** Desktop/tablet.  
**Aksi utama:** Lihat dashboard, baca laporan omzet/stok, export PDF/CSV. **Read-only.**

### 3.5 Permission Matrix

| Fitur | Kasir | Produksi | Admin | Owner |
|---|:---:|:---:|:---:|:---:|
| Buat Order (Tailor/RTW/Konveksi) | ✓ | — | ✓ | — |
| Update Status Produksi | — | ✓ | ✓ | — |
| Input Pembayaran | ✓ | — | ✓ | — |
| Verifikasi Transfer | ✓ | — | ✓ | — |
| Tolak Transfer | — | — | ✓ | — |
| Kelola Master Data | — | — | ✓ | — |
| Konfigurasi Diskon | — | — | ✓ | — |
| Lihat Laporan (full) | — | — | ✓ | ✓ |
| Kelola User & Role | — | — | ✓ | — |
| Lihat Audit Log | — | — | ✓ | ✓ |

---

## 4. Arsitektur & Tech Stack

### 4.1 Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 12 (PHP 8.4) |
| Frontend | React.js + Inertia.js v2 (Breeze scaffolded) |
| Database | PostgreSQL |
| Testing | Pest 4 |
| Styling | Tailwind CSS |
| Auth | Laravel Fortify |
| Routing (FE) | Laravel Wayfinder |
| PDF | barryvdh/laravel-dompdf |

### 4.2 Arsitektur Aplikasi

```
Browser (React + Inertia SPA)
        │ Inertia Protocol (XHR)
Laravel Backend
  Routes → Controllers → Services → Models
        │ Eloquent ORM
PostgreSQL Database
```

**Prinsip desain:**
- **Controller tipis** — receive → validate → delegate → respond.
- **Business logic di Service** — `TailorOrderService`, `PaymentService`, `StockService`, dst.
- **Form Request** untuk semua validasi input; error message dalam Bahasa Indonesia.
- **Laravel Policies** untuk RBAC per resource.
- **Audit log** wajib untuk semua aksi kritikal.

### 4.3 Struktur Direktori Utama

```
app/
├── Http/Controllers/    # Thin controllers
├── Http/Requests/       # Form Request validation
├── Models/              # Eloquent models (13 models)
├── Services/            # Business logic
├── Enums/               # PHP 8.1 Enums
└── Policies/            # Laravel Policies (RBAC)

resources/js/
├── pages/               # Inertia page components
│   ├── Dashboard/
│   ├── Orders/
│   ├── Payments/
│   ├── Customers/
│   ├── Inventory/
│   └── Reports/
├── components/          # Reusable UI components
└── layouts/             # App layouts
```

---

## 5. Modul & Fitur

### 5.1 Autentikasi

- Login/logout via Laravel Fortify.
- Semua halaman dilindungi `auth` middleware.
- Tidak ada registrasi publik — user dibuat oleh Admin.

### 5.2 Dashboard

Role-based KPI berbeda per pengguna:

| KPI | Kasir | Produksi | Admin | Owner |
|---|:---:|:---:|:---:|:---:|
| Omzet hari ini / bulan ini | — | — | ✓ | ✓ |
| Transfer pending verify | ✓ | — | ✓ | ✓ |
| Order aktif | ✓ | ✓ | ✓ | ✓ |
| Due date hari ini | — | ✓ | ✓ | — |
| Stok hampir habis | — | — | ✓ | ✓ |

**Fitur dashboard:** Alert banner (transfer pending, due date approaching, low stock), recent orders list, omzet mini chart (Admin/Owner).

### 5.3 Master Data (Admin)

| Data | Fitur |
|---|---|
| **Customers** | CRUD, search, history order, loyalty badge |
| **Measurements** | Nested per customer; support history per tanggal/jenis |
| **Garment Models** | Nama model, deskripsi, aktif/nonaktif |
| **Fabrics** | Nama bahan, deskripsi, aktif/nonaktif |
| **Products (RTW)** | SKU, nama, ukuran, harga jual, HPP, stok, clearance flag, diskon |
| **Couriers** | Nama jasa, aktif/nonaktif |
| **Discount Policy** | loyalty_threshold, loyalty_discount_percent — konfigurasi key-value |
| **Users** | Nama, email, role, aktif/nonaktif (Admin only) |

### 5.4 Tailor Order (Jahit Custom)

**Wizard 4 langkah:**

1. **Pelanggan** — Cari atau buat baru; auto-detect loyalty eligibility.
2. **Garmen** — Pilih model, bahan, ukuran (dari history atau input baru).
3. **Summary** — Qty, harga, due date, catatan; ringkasan biaya + diskon loyalty.
4. **DP** — Input DP; live validation ≥ 50%; pilih cash atau transfer.

**Fitur lanjutan:**
- Loyalty badge otomatis + diskon 20% jika eligible.
- Admin dapat override loyalty (tercatat di audit log).
- Cetak Nota Pesanan (PDF) dengan due date.
- Tab Pembayaran: riwayat semua payment; verify/tolak transfer.
- Tab Pengiriman: opsional pengiriman via kurir.
- Tab Activity Log: timeline status + siapa + kapan.
- Sticky action bar kontekstual (sesuai status order).

### 5.5 Ready-to-Wear Checkout (Siap Pakai)

**Cart-style flow:**

1. Pilih produk → size chips → tambah ke keranjang.
2. Atur qty; validasi stok real-time.
3. Checkout: alamat + kurir (opsional) atau pickup.
4. Bayar: cash (langsung verified) atau transfer (pending).

**Fitur:**
- Tampilan clearance badge + coret harga lama.
- Stok baru berkurang setelah payment verified (bukan saat order dibuat).
- Stok tidak bisa negatif — validasi di service & DB level CHECK constraint.

### 5.6 Konveksi Order (Massal)

**Wizard 3 langkah:**

1. **Perusahaan/PIC** — Nama perusahaan, atau pilih pelanggan; catatan desain/spesifikasi.
2. **Items** — Daftar item produksi: nama, qty, harga → subtotal; dapat tambah/hapus item.
3. **Pembayaran Penuh** — Warning banner "wajib lunas 100%"; input nominal + transfer reference + upload bukti.

**Fitur:** Full payment gate 100% sebelum status IN_PROGRESS; alur produksi multi-step (desain → bahan → produksi → QC → packing → pengiriman/pickup).

### 5.7 Pembayaran

| Aksi | Deskripsi |
|---|---|
| Input cash | Langsung status VERIFIED |
| Input transfer | Status PENDING_VERIFICATION; butuh verifikasi |
| Verifikasi transfer | Kasir/Admin konfirmasi masuk |
| Tolak transfer | Admin; wajib isi alasan penolakan |
| Cetak kwitansi | PDF hanya untuk payment VERIFIED |

**Tampilan:** Tabs Pending / Verified / Semua; payment card dengan method badge + status badge + tombol aksi.

### 5.8 Laporan (Admin + Owner)

| Laporan | Detail |
|---|---|
| Omzet | Total, per jenis (Tailor/RTW/Konveksi), chart harian, bulan vs bulan |
| Pembayaran | Breakdown cash vs transfer, pending vs verified |
| Inventori | Low stock, clearance performance (revenue vs HPP) |
| Pelanggan | Loyal customers, order count, discount savings |

Export: **PDF** dan **CSV**; filter periode (hari/minggu/bulan/custom).

### 5.9 Audit Log (Admin + Owner)

- Setiap perubahan status order dicatat.
- Setiap verifikasi/penolakan transfer dicatat.
- Override loyalty discount: siapa, kapan, dari berapa ke berapa.
- Tampilan: timeline dengan before/after JSON diff per-entry.

---

## 6. Business Rules (Aturan Mutlak)

> Aturan ini **wajib divalidasi di backend** — tidak bisa di-bypass oleh UI.

### Tailor

| ID | Aturan |
|---|---|
| BR-T01 | DP minimal **50%** dari total sebelum status bisa `IN_PROGRESS`. |
| BR-T02 | Order hanya bisa `CLOSED` jika outstanding == 0 (lunas penuh). |
| BR-T03 | Loyalty **20%** auto-apply jika count CLOSED tailor orders > 5 (configurable). |
| BR-T04 | Admin dapat override loyalty discount (dicatat di audit log). |
| BR-T05 | Due date tercetak di Nota Pesanan. |

### Ready-to-Wear

| ID | Aturan |
|---|---|
| BR-R01 | Checkout ditolak jika qty > stok tersedia. |
| BR-R02 | Stok baru dikurangi setelah payment **VERIFIED** (bukan saat order dibuat). |
| BR-R03 | Admin bebas atur diskon per-item; harga bisa turun sampai HPP (clearance). |
| BR-R04 | Ongkir sesuai biaya jasa kurir; tanpa markup. |

### Konveksi

| ID | Aturan |
|---|---|
| BR-C01 | Produksi hanya boleh dimulai setelah **100% pembayaran VERIFIED**. |
| BR-C02 | Alur status: desain → bahan → produksi → QC → packing → pengiriman/pickup. |

### Pembayaran

| ID | Aturan |
|---|---|
| BR-P01 | Cash payment → langsung **VERIFIED**. |
| BR-P02 | Transfer payment → **PENDING_VERIFICATION** sampai dikonfirmasi. |
| BR-P03 | Kwitansi final hanya bisa dicetak setelah status payment **VERIFIED**. |
| BR-P04 | Audit trail wajib: siapa verifikasi, kapan, alasan reject jika ada. |
| BR-P05 | Transfer REJECTED **wajib** menyertakan alasan penolakan. |

### General

| ID | Aturan |
|---|---|
| BR-G01 | Order tidak bisa `CLOSED` jika outstanding > 0 — berlaku semua jenis. |
| BR-G02 | Setiap perubahan status order dicatat di audit log. |
| BR-G03 | Verifikasi transfer, override diskon, close order → wajib audit log. |

---

## 7. Alur Status Order

### Tailor & Konveksi

```
DRAFT
  │
  ▼
PENDING_PAYMENT     ← order dibuat, menunggu DP / pembayaran
  │
  ▼ (Tailor: DP ≥ 50% verified │ Konveksi: 100% verified)
IN_PROGRESS         ← sedang diproduksi
  │
  ▼
DONE                ← produksi selesai, menunggu ambil / pelunasan
  │
  ▼ (outstanding == 0)
DELIVERED           ← barang diserahkan
  │
  ▼
CLOSED              ← selesai; outstanding WAJIB == 0

[CANCELLED]         ← Admin only, dengan alasan; bisa dari status manapun kecuali CLOSED
```

### Payment

```
PENDING_VERIFICATION  ← transfer diinput
  ├──▶ VERIFIED        ← dikonfirmasi Kasir/Admin
  └──▶ REJECTED        ← ditolak; dengan alasan; anggota dapat input ulang

[Cash]  → langsung VERIFIED saat dibuat
```

### Transisi Valid

| Dari | Ke | Syarat |
|---|---|---|
| DRAFT | PENDING_PAYMENT | Order disimpan |
| PENDING_PAYMENT | IN_PROGRESS | BR-T01 / BR-C01 terpenuhi |
| IN_PROGRESS | DONE | Update oleh Produksi/Admin |
| DONE | DELIVERED | Outstanding == 0 |
| DELIVERED | CLOSED | Konfirmasi manual |
| Any (non-CLOSED) | CANCELLED | Admin only + alasan |

---

## 8. UI/UX Design Principles

### 8.1 Design Language

```
Style:    Simple, Elegant, Effortless, Hourglass, Modern
Font:     Plus Jakarta Sans (heading) + Inter (body)
Palette:  Primary #6C63FF (indigo-violet)  Accent #A89CFF
          Shell #F0EFFF (lavender)  Sidebar #1A1830 (dark navy)
Motion:   fade-up entrance, scale hover, smooth scroll
```

### 8.2 Tiga Permukaan

| Permukaan | Navigasi Utama | Target User |
|---|---|---|
| **Landing Page** | Floating pill navbar (centered, glassmorphism) | Publik / prospek |
| **Frontend App** | Floating dark sidebar kiri + bottom nav (mobile) | Kasir, Produksi |
| **CMS** | Wide floating sidebar kiri (w-64) + topbar | Admin, Owner |

### 8.3 Mobile-First

- Desain dimulai dari mobile < 768px.
- Tablet (768–1024px): navigation rail sidebar ikon-only.
- Desktop (> 1024px): expanded sidebar + split view.
- Bottom action bar kontekstual (sticky) untuk aksi utama.
- Wizard order dalam stepper full-screen di mobile.

### 8.4 Badge Color System

| Jenis/Status | Warna |
|---|---|
| TAILOR | indigo | RTW | sky | KONVEKSI | violet |
| PENDING_PAYMENT | amber | IN_PROGRESS | blue | DONE | indigo |
| DELIVERED | teal | CLOSED | emerald | CANCELLED | rose |
| VERIFIED | emerald | REJECTED | rose | PENDING_VERIFICATION | amber |
| 🏅 LOYALTY | yellow |

---

## 9. Database Schema (Ringkasan)

### Tabel Utama (13 tabel)

| Tabel | Deskripsi |
|---|---|
| `users` | Staff; enum role (Kasir/Produksi/Admin/Owner) |
| `customers` | Pelanggan; loyalty_order_count, is_loyalty_member |
| `measurements` | Ukuran per pelanggan; multiple records per customer |
| `garment_models` | Master model pakaian |
| `fabrics` | Master bahan kain |
| `products` | Inventori RTW; SKU, size, stock, is_clearance |
| `couriers` | Master jasa pengiriman |
| `discount_policies` | Key-value config (loyalty_threshold, loyalty_percent) |
| `orders` | Inti sistem; order_type, order_status, total, paid, outstanding |
| `order_items` | Line items RTW per order |
| `payments` | Pembayaran; method, status, amount, reference |
| `shipments` | Pengiriman; courier, tracking number, biaya |
| `audit_logs` | Append-only; polymorphic; old_values/new_values JSONB |

### Constraints DB

- `products.stock >= 0` — CHECK constraint (PostgreSQL).
- `order_items.qty > 0` — CHECK constraint.
- Foreign key dengan `restrictOnDelete`/`cascadeOnDelete` sesuai relasi.
- Index pada: `orders.status`, `orders.order_type`, `orders.customer_id`, `payments.status`.

### PHP Enums

| Enum | Values |
|---|---|
| `UserRole` | Kasir, Produksi, Admin, Owner |
| `OrderType` | Tailor, ReadyToWear, Convection |
| `OrderStatus` | Draft, PendingPayment, InProgress, Done, Delivered, Closed, Cancelled |
| `PaymentMethod` | Cash, Transfer |
| `PaymentStatus` | PendingVerification, Verified, Rejected |
| `ShipmentStatus` | Pending, Shipped, Delivered |

---

## 10. Routing & Halaman

### Konvensi

- Semua route dilindungi `auth` middleware.
- Format named route: `resource.action` (contoh: `orders.index`, `payments.verify`).
- Role-based middleware: `role:admin`, `role:admin,owner`.

### Halaman Utama

| URI | Named Route | Halaman Inertia |
|---|---|---|
| `/` | `dashboard` | `Pages/Dashboard/Index` |
| `/orders` | `orders.index` | `Pages/Orders/Index` |
| `/orders/tailor/create` | `orders.tailor.create` | `Pages/Orders/TailorWizard` |
| `/orders/rtw/create` | `orders.rtw.create` | `Pages/Orders/RTWCheckout` |
| `/orders/convection/create` | `orders.convection.create` | `Pages/Orders/ConvectionWizard` |
| `/orders/{order}` | `orders.show` | `Pages/Orders/Show` |
| `/payments` | `payments.index` | `Pages/Payments/Index` |
| `/payments/{payment}/verify` | `payments.verify` | (POST redirect) |
| `/payments/{payment}/reject` | `payments.reject` | (POST redirect) |
| `/customers` | `customers.index` | `Pages/Customers/Index` |
| `/inventory` | `inventory.index` | `Pages/Inventory/Index` |
| `/reports` | `reports.index` | `Pages/Reports/Index` |
| `/settings/models` | `garment-models.index` | `Pages/Settings/Models/Index` |
| `/settings/fabrics` | `fabrics.index` | `Pages/Settings/Fabrics/Index` |
| `/settings/couriers` | `couriers.index` | `Pages/Settings/Couriers/Index` |
| `/settings/discounts` | `discount-policies.index` | `Pages/Settings/Discounts/Index` |
| `/settings/users` | `users.index` | `Pages/Settings/Users/Index` |
| `/settings/audit-log` | `audit-log.index` | `Pages/Settings/AuditLog/Index` |

---

## 11. Rencana Delivery (Phases)

### Phase 1 — MVP Tailor (Target: Minggu 1–4)

**Goal:** Sistem beroperasi untuk manajemen pesanan tailor harian.

| Minggu | Deliverable |
|---|---|
| 1 | Foundation, Auth, User Management, Customer CRUD |
| 2 | Measurement, GarmentModel, Fabric, DiscountPolicy master data |
| 3 | Tailor Order Wizard + DP Gate + PaymentService |
| 4 | Order Detail UI + Nota/Kwitansi PDF + Basic Dashboard + Reports |

**Business rules di-cover:** BR-T01, BR-T02, BR-T03, BR-P01, BR-P02, BR-P03, BR-G01, BR-G02.

### Phase 2 — Ready-to-Wear + Shipping (Target: Minggu 5–7)

**Goal:** Full RTW sales dengan inventori, diskon, dan shipping.

- Product (RTW) inventory CRUD.
- `StockService` (BR-R01, BR-R02).
- RTW Checkout (cart style).
- Courier master + Shipment module.
- Enhanced dashboard alerts (pending transfer, due dates, low stock).
- Inventory Report.

### Phase 3 — Konveksi + Analytics (Target: Minggu 8–10)

**Goal:** Konveksi lengkap + advanced reporting + audit log viewer.

- `ConvectionOrderService` (BR-C01).
- Convection wizard + multi-step production status.
- Advanced reports (loyal customer, clearance performance, payment breakdown).
- Export PDF/CSV.
- Audit Log viewer dengan before/after diff.

---

## 12. Definition of Done

Sebuah fitur dianggap **Done** bila SEMUA kondisi berikut terpenuhi:

- [ ] Migration berjalan bersih: `php artisan migrate:fresh --seed`
- [ ] Model, relationships, casts didefinisikan dengan benar
- [ ] Service class mengimplementasi business rules sesuai `system-spec.md`
- [ ] Form Request memvalidasi semua input; error message in Bahasa Indonesia
- [ ] Controller tipis: receive → validate → delegate → respond
- [ ] Route terdaftar dengan nama yang benar
- [ ] Halaman Inertia render dengan benar (mobile + desktop)
- [ ] Semua business rule test case lulus (`php artisan test --compact`)
- [ ] `vendor/bin/pint --dirty --format agent` berjalan bersih
- [ ] **Tidak ada inline komentar** dalam source code (sesuai §8 system-spec)
- [ ] Audit log tercatat untuk semua aksi kritikal

---

## Lampiran — Services Yang Direncanakan

| Service | Method Utama |
|---|---|
| `LoyaltyService` | `checkEligibility()`, `applyDiscount()`, `override()` |
| `TailorOrderService` | `create()`, `calculateTotal()`, `validateDpGate()` |
| `ConvectionOrderService` | `create()`, `validateFullPaymentGate()` |
| `OrderStatusService` | `transition()`, `canClose()`, `validateTransition()` |
| `PaymentService` | `record()`, `verifyCash()`, `verifyTransfer()`, `reject()`, `updateOrderAmounts()` |
| `StockService` | `validateStock()`, `decrementStock()` |
| `AuditLogService` | `log(User, action, Model, before, after)` |
| `DocumentService` | `generateNota()`, `generateKwitansi()` |
