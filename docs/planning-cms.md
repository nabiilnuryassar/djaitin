# Planning — CMS djaitin
# Admin & Owner Panel — Content + Operational Management

**Tipe:** Admin/Owner internal panel (auth-protected, role-gated)  
**Target Surface:** `Djaitin Office`  
**Route Prefix:** `/office/*`  
**Middleware:** `auth` + `role:admin,owner`  
**Framework:** Laravel 12 + Inertia.js v2 + React + TypeScript  
**Style:** Wide floating sidebar, clean operational, structured, premium  
**Tanggal:** 2026-03-08  

---

## Konteks & Tujuan

CMS adalah panel admin untuk:
1. **Admin** — full access: user management, master data, discount config, semua laporan, audit log
2. **Owner** — read-only: laporan keuangan, KPI, loyal customer, export data

> CMS berada di dalam surface `Djaitin Office`, bukan surface publik terpisah.
> Jika masih ada referensi legacy `/cms/*`, itu harus dianggap sebagai state transisi menuju `/office/*`.

---

## Tech Stack

Sama dengan internal app (satu codebase), hanya route prefix dan layout berbeda:

| Layer | Teknologi |
|---|---|
| Backend | Laravel 12 — `routes/office.php`, `app/Http/Controllers/Office/Admin/` |
| Frontend | React + Inertia.js v2 + TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Font | Plus Jakarta Sans + Inter |

---

## Routing — `/office/*`

```php
// routes/office.php
// Middleware: auth + role:admin,owner (applied di routes/web.php)

Route::get('dashboard', OfficeDashboardController::class)->name('dashboard');

// Users — admin only (via Gate di controller)
Route::resource('admin/users', UserController::class)->except(['show']);

// Master Data — admin only
Route::resource('admin/garment-models', GarmentModelController::class)->except(['show', 'create', 'edit']);
Route::resource('admin/fabrics', FabricController::class)->except(['show', 'create', 'edit']);
Route::resource('admin/couriers', CourierController::class)->except(['show', 'create', 'edit']);
Route::resource('admin/products', OfficeProductController::class);

// Discount Policy — admin only
Route::get('admin/discounts', DiscountPolicyController::class)->name('admin.discounts.index');
Route::put('admin/discounts/{policy}', [DiscountPolicyController::class, 'update'])->name('admin.discounts.update');

// Reports — admin + owner
Route::get('reports', CmsReportController::class)->name('reports.index');
Route::get('reports/export', [CmsReportController::class, 'export'])->name('reports.export');

// Audit Log — admin + owner (read-only)
Route::get('audit-log', AuditLogController::class)->name('audit-log.index');
```

**Named route prefix:** semua route di office pakai prefix `office.`  
Contoh: `office.dashboard`, `office.admin.users.index`, `office.reports.index`

---

## Navigation Architecture — CMS

### Desktop — Wide Floating Sidebar

```tsx
// CmsSidebar.tsx
// position: fixed left-4 top-4 bottom-4 z-40
// bg-[#1A1830] rounded-2xl w-64
// TIDAK ada collapse — selalu full width di CMS

// Struktur:
// [Logo area: ✂️ djaitin + "CMS" label]
// ── OVERVIEW ──
// [LayoutDashboard] Dashboard
// [BarChart2] Laporan
// ── MANAJEMEN ──
// [Users] Pengguna
// [Scissors] Model & Bahan
// [Package] Produk (RTW)
// [Truck] Jasa Kurir
// [Percent] Kebijakan Diskon
// ── SISTEM ──
// [ScrollText] Audit Log
// ── bottom ──
// [User avatar + nama + role badge + logout]
```

**Nav item active:** `bg-indigo-600 text-white rounded-xl px-3 py-2.5`  
**Nav item inactive:** `text-slate-400 hover:bg-slate-700/40 hover:text-white rounded-xl`  
**Section label:** `text-slate-600 text-[10px] font-semibold tracking-wider uppercase px-3 mb-1`

### Desktop — Top Bar

```tsx
// CmsTopBar.tsx
// position: static (bukan fixed) — dalam main content area
// bg-white rounded-2xl px-6 py-4 mb-6
// flex justify-between items-center

// Kiri: Breadcrumb (CMS / Laporan / Detail)
// Kanan: Notifikasi icon + user chip
```

### Mobile — Tidak Optimal

CMS didesain untuk **desktop/tablet**. Di mobile, sidebar collapse menjadi overlay drawer.  
Tidak ada bottom nav untuk CMS — user admin/owner diexpect pakai desktop/laptop.

---

## Design System — CMS

```
CMS Shell:      #F0EFFF (lavender — outer wrapper)
Main Content:   #FFFFFF (bg cards, tables)
Sidebar:        #1A1830 (dark navy, w-64)
Primary:        #6C63FF
Topbar:         bg-white rounded-2xl shadow-sm
```

**Layout grid:**
```tsx
// CmsLayout.tsx
<div className="flex min-h-screen bg-[#F0EFFF] p-4 gap-4">
  <CmsSidebar />  {/* w-64 fixed */}
  <div className="flex-1 ml-68 flex flex-col gap-4">
    <CmsTopBar />
    <main>{children}</main>
  </div>
</div>
```

---

## Modul CMS

### 1. CMS Dashboard

**Halaman:** `Cms/Dashboard/Index.tsx`

**Input (Inertia props dari server):**
- KPI cards: total omzet bulan ini, total order, order aktif, transfer pending
- Grafik: omzet 30 hari (line chart), distribusi per jenis (donut)
- Alert cards: low stock critical, overdue orders, transfer pending count
- Quick stats: loyal customers count, clearance items, produksi aktif

**Komponen shadcn:** Card, Badge, Separator  
**Chart:** Recharts atau shadcn Charts (built on Recharts)

**Akses:** Admin ✓ Owner ✓

---

### 2. Manajemen Pengguna

**Halaman:** `Cms/Users/Index.tsx`  
**Akses:** Admin only (Owner cannot see this menu)

```
Tampilan:
- Table: Avatar | Nama | Email | Role Badge | Status (Aktif/Nonaktif) | Aksi
- Filter: Semua / per Role
- Search: nama atau email
- [+ Tambah Pengguna] button → Sheet side="right" form
```

**Form Tambah/Edit (shadcn Sheet):**
- Nama (Input)
- Email (Input)
- Role (Select: Kasir / Produksi / Admin / Owner)
- Password (Input password — hanya saat tambah baru)
- Status aktif (Switch)

**Validasi backend:** `StoreUserRequest`, `UpdateUserRequest`  
**Service:** `UserService::create()`, `UserService::update()`

---

### 3. Master Data

**Halaman:** `Cms/MasterData/Index.tsx` (single page, tab per kategori)

**Tab:** Model | Bahan | Kurir | Produk RTW

#### Tab Model Pakaian & Bahan
- Inline editable table (shadcn Table + Input)
- Toggle aktif/nonaktif (Switch)
- [+ Tambah baru] inline row

#### Tab Jasa Kurir
- Sama dengan tab model/bahan
- Kolom: nama, deskripsi, aktif/nonaktif

#### Tab Produk (Ready-to-Wear)
- Full CRUD dengan dedicated form page (`Cms/MasterData/Products/`)
- Kolom: Gambar, Nama, SKU, Ukuran, Stok, Harga, HPP, Clearance badge, Diskon
- Filter: Semua | Low Stock ⚠️ | Clearance 🏷️
- Edit via Sheet side="right" dengan semua field

---

### 4. Kebijakan Diskon

**Halaman:** `Cms/Discounts/Index.tsx`  
**Akses:** Admin only

```
Tampilan:
┌─────────────────────────────────────────────┐
│  Loyalty Program                            │
│  Threshold: [5] order CLOSED               │
│  Diskon:    [20] %                          │
│                                             │
│  ⚠️ Perubahan berlaku untuk order baru       │
│  [Simpan Perubahan]                         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Riwayat Perubahan (dari audit log)         │
│  2026-03-07 10:30 — Admin ubah threshold    │
│                    dari 3 → 5               │
│  2026-02-15 14:00 — Admin ubah diskon       │
│                    dari 15% → 20%           │
└─────────────────────────────────────────────┘
```

---

### 5. Laporan

**Halaman:** `Cms/Reports/Index.tsx`  
**Akses:** Admin ✓ Owner ✓

**Filter:** Periode (Hari ini / 7 hari / 30 hari / Custom date range)

**Section Laporan:**

```
1. Omzet
   - Total omzet periode
   - Breakdown: Tailor | RTW | Konveksi
   - Chart harian (line)
   - Bulan vs bulan sebelumnya (perbandingan)

2. Pembayaran
   - Total cash vs transfer
   - Verified vs pending vs rejected count
   - Transfer rejection rate

3. Inventori (Admin only)
   - Produk low stock (below threshold)
   - Clearance: revenue vs HPP (margin)
   - Produk terlaris

4. Pelanggan Loyal
   - Daftar pelanggan eligible loyalty
   - Total discount savings yang diberikan
   - Order count per pelanggan

5. Export
   - [Export PDF] — via DocumentService
   - [Export CSV] — download raw data
```

**Komponen:** shadcn Card, Table, Badge + Recharts Charts

---

### 6. Audit Log

**Halaman:** `Cms/AuditLog/Index.tsx`  
**Akses:** Admin ✓ Owner ✓ (read-only)

```
Filter bar:
- By user (Select)
- By modul (Select: Order / Payment / Customer / User / Discount)
- By aksi (Select: created / updated / status_changed / verified / rejected)
- By date range (DateRangePicker)

Timeline entries (tiap baris):
┌─────────────────────────────────────────────────────┐
│ 🕐 2026-03-07 10:45  👤 Ahmad (Admin)               │
│    Order #ORD-001 · status_changed                  │
│    PENDING_PAYMENT → IN_PROGRESS           [Lihat]  │
└─────────────────────────────────────────────────────┘

Expand entry → before/after diff card:
┌──────────────┬──────────────────────────────────────┐
│ Before       │  After                               │
│ "PENDING_    │  "IN_PROGRESS"                      │
│  PAYMENT"    │                                      │
└──────────────┴──────────────────────────────────────┘
```

---

## shadcn/ui — Komponen yang Dipakai (CMS)

| Komponen | Digunakan di |
|---|---|
| `Table` | Semua listing (users, products, audit log) |
| `Sheet` | Form tambah/edit user, tambah produk |
| `Tabs` | Master data multi-kategori, laporan sections |
| `Card` | KPI cards, laporan cards |
| `Badge` | Role badge, status badge, clearance badge |
| `Select` | Filter dropdown, role selector |
| `Input` / `Textarea` | Semua form fields |
| `Switch` | Toggle aktif/nonaktif |
| `Calendar` + `Popover` | Date range filter laporan |
| `Dialog` / `AlertDialog` | Konfirmasi hapus, konfirmasi reset |
| `Skeleton` | Loading state tabel dan charts |
| `DropdownMenu` | Per-row action menu (Edit / Hapus) |
| `Separator` | Divider dalam sidebar dan card |
| `Avatar` | User di sidebar, di audit log |
| `Progress` | Loading/export progress indicator |

---

## File Structure — CMS

```
app/Http/Controllers/Cms/
├── DashboardController.php
├── UserController.php
├── GarmentModelController.php
├── FabricController.php
├── CourierController.php
├── ProductController.php
├── DiscountPolicyController.php
├── ReportController.php
└── AuditLogController.php

app/Http/Requests/Cms/
├── StoreUserRequest.php
├── UpdateUserRequest.php
├── StoreProductRequest.php
└── UpdateDiscountPolicyRequest.php

resources/js/pages/Cms/
├── Dashboard/
│   └── Index.tsx
├── Users/
│   └── Index.tsx
├── MasterData/
│   ├── Index.tsx          ← tab: Model | Bahan | Kurir
│   └── Products/
│       ├── Index.tsx
│       └── Edit.tsx
├── Discounts/
│   └── Index.tsx
├── Reports/
│   └── Index.tsx
└── AuditLog/
    └── Index.tsx

resources/js/layouts/
└── CmsLayout.tsx           ← Wide sidebar + topbar

resources/js/components/cms/
├── CmsSidebar.tsx
├── CmsTopBar.tsx
├── ReportChart.tsx
├── AuditLogEntry.tsx
└── DiffViewer.tsx
```

---

## Definition of Done — CMS

- [ ] Route `/office/*` terdaftar dengan prefix + middleware `role:admin,owner`
- [ ] Admin-only actions dilindungi Gate/Policy (bukan hanya middleware)
- [ ] `CmsLayout.tsx` render benar: sidebar + topbar + content area
- [ ] Semua form menggunakan Form Request + error messages Bahasa Indonesia
- [ ] Table sorting + pagination pada listing dengan banyak data
- [ ] Export PDF dan CSV berfungsi
- [ ] Audit log tercatat untuk semua aksi kritikal admin
- [ ] Owner hanya bisa GET — POST/PUT/DELETE dikembalikan 403
- [ ] Pest tests mencakup role restriction (Owner cannot write)
- [ ] Pint clean, tidak ada inline comments
