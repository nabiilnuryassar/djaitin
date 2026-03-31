# UI Wireframe 3/3 — CMS (Admin & Owner Panel)
# djaitin · Sistem Informasi Konveksi & Tailor

**Style:** Simple, Elegant, Effortless, Hourglass, Modern
**Audience:** Admin (full access), Owner (read-only reports + audit)
**Date:** 2026-03-07

---

## Design Language — CMS

```
Palette (slightly denser than app, more "business" feel)
  Shell:    #EDEEFF (cool lavender) — outer bg
  Sidebar:  #12112B (deep indigo-black) — floating dark sidebar
  Surface:  #FFFFFF — cards, tables, drawers
  Primary:  #6C63FF
  Header:   #F8F8FF — topbar
  Border:   #E8E8F0

Layout
  Sidebar: fixed left-4 top-4 bottom-4, rounded-2xl, w-64
  Topbar:  fixed top-4 left-72 right-4, rounded-2xl, h-14, bg-white shadow-sm
  Content: ml-72 mt-16 p-6
```

---

## Floating Sidebar — CMS Desktop

```
┌──────────────────────────────────────────────────────────┐
│ bg: #EDEEFF (outer shell)                                │
│                                                          │
│ ┌──────────────┐  ┌─────────────────────────────────┐   │
│ │ ✂️  djaitin  │  │ Topbar: bg-white rounded-2xl    │   │
│ │ CMS v1.1     │  │ 🔍 Cari...   [📊 Export] 👤 Admin│  │
│ │ ──────────── │  └─────────────────────────────────┘   │
│ │ 🏠 Dashboard │                                         │
│ │              │                                         │
│ │ ─ Manajemen  │  Page Content                           │
│ │ 📋 Orders    │                                         │
│ │ 💳 Payments  │                                         │
│ │ 👥 Customers │                                         │
│ │ 📦 Inventory │                                         │
│ │              │                                         │
│ │ ─ Master Data│                                         │
│ │ 🎨 Models    │                                         │
│ │ 🧵 Fabrics   │                                         │
│ │ 🚚 Couriers  │                                         │
│ │ 🏷  Diskon    │                                         │
│ │              │                                         │
│ │ ─ Laporan    │                                         │
│ │ 📊 Reports   │                                         │
│ │              │                                         │
│ │ ─ Sistem     │                                         │
│ │ 👤 Users     │  ← Admin only                          │
│ │ 📋 Audit Log │                                         │
│ │              │                                         │
│ │ [👤] Admin   │  ← bottom: user info + logout          │
│ └──────────────┘                                         │
│   fixed left-4 top-4 bottom-4, rounded-2xl              │
│   bg-[#12112B], w-64                                     │
└──────────────────────────────────────────────────────────┘
```

---

## Screen: CMS Dashboard (Admin/Owner)

```
┌─────────────────────────────────────────────────────────┐
│ Dashboard Admin                      📅 Mar 2026 [▾]   │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ KPI Row (4-col, admin view):                            │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────┐│
│ │ 💰 Rp 48.75M │ │ 📋 24 Aktif  │ │ 👥 3 Baru│ │⚠️ 2  ││
│ │ Omzet Bulan  │ │ Pesanan      │ │ Pelanggan│ │ Low  ││
│ │ ↑ +12% vs    │ │ Total: 89    │ │ Hari ini │ │ Stok ││
│ │ bulan lalu   │ │ bulan ini    │ │          │ │      ││
│ └──────────────┘ └──────────────┘ └──────────┘ └──────┘│
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ┌──────────────────────────────┐ ┌────────────────────┐ │
│ │ Omzet 30 Hari (Chart)        │ │ Breakdown Jenis    │ │
│ │                              │ │ ●Tailor    58%     │ │
│ │  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄     │ │ ●RTW       26%     │ │
│ │  ▄                ▄▄▄▄▄     │ │ ●Konveksi  17%     │ │
│ │  Mar 1          Mar 31      │ │ Donut chart        │ │
│ └──────────────────────────────┘ └────────────────────┘ │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ┌────────────────────────┐ ┌──────────────────────────┐ │
│ │ Transfer Perlu Verif   │ │ Stok Hampir Habis        │ │
│ │ (3 item)               │ │                          │ │
│ │ ─────────────────────  │ │ Kaos Putih S    Stok: 1  │ │
│ │ BCA Rp112.500 [Verify] │ │ Kemeja Abu M    Stok: 2  │ │
│ │ Mandiri Rp8.5M [Verify]│ │ Celana Hitam 32 Stok: 3  │ │
│ │ [Lihat Semua →]        │ │ [Lihat Semua →]          │ │
│ └────────────────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Screen: User Management (Admin Only)

```
┌─────────────────────────────────────────────────────────┐
│ Manajemen Pengguna                       [+ Tambah User]│
│ ─────────────────────────────────────────────────────── │
│ 🔍 Cari nama, email...     Filter: [Semua Role ▾]       │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ Tabel (rounded-2xl bg-white shadow-sm):                  │
│ ┌─────┬──────────┬───────────┬────────┬────────┬─────┐  │
│ │ #   │ Nama     │ Email     │ Role   │ Status │ Aksi│  │
│ ├─────┼──────────┼───────────┼────────┼────────┼─────┤  │
│ │  1  │ Admin    │ admin@... │[ADMIN] │ ✅ Aktif│✏️ 🗑│  │
│ │  2  │ Rina     │ rina@...  │[KASIR] │ ✅ Aktif│✏️ 🗑│  │
│ │  3  │ Tono     │ tono@...  │[PRODUKSI]│✅ Aktif│✏️🗑│  │
│ │  4  │ Owner    │ owner@... │[OWNER] │ ✅ Aktif│✏️ 🗑│  │
│ └─────┴──────────┴───────────┴────────┴────────┴─────┘  │
│                                                         │
│ Role badges:                                            │
│ [ADMIN]=indigo  [KASIR]=sky  [PRODUKSI]=violet [OWNER]=amber│
└─────────────────────────────────────────────────────────┘

Add/Edit User — Side Drawer (slide from right):
┌─────────────────────────────────┐
│  ← Tambah Pengguna              │
│  ─── ─── ─── ─── ─── ─── ───   │
│  Nama Lengkap                   │
│  ┌───────────────────────────┐  │
│  │ Rina Permata Sari         │  │
│  └───────────────────────────┘  │
│                                 │
│  Email                          │
│  ┌───────────────────────────┐  │
│  │ rina@djaitin.com          │  │
│  └───────────────────────────┘  │
│                                 │
│  Role                           │
│  ○ Kasir  ○ Produksi           │
│  ○ Admin  ○ Owner              │
│                                 │
│  Password (baru)                │
│  ┌───────────────────────────┐  │
│  │ ···············       👁  │  │
│  └───────────────────────────┘  │
│                                 │
│  Status: ◉ Aktif  ○ Nonaktif   │
│                                 │
│  [Batal]        [Simpan]        │
└─────────────────────────────────┘
```

---

## Screen: Master Data (Models / Fabrics / Couriers)

Style: inline editable table — click row to edit in place, no page nav.

```
┌─────────────────────────────────────────────────────────┐
│ Model Pakaian                            [+ Tambah]     │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ┌──────────────────────────────────────────────────┐   │
│ │ #  │ Nama             │ Deskripsi    │Status │ Aksi│   │
│ ├────┼──────────────────┼──────────────┼───────┼─────┤   │
│ │ 1  │ Kemeja Formal    │ Kemeja pria  │  ✅   │✏️ 🗑│   │
│ │ 2  │ Celana Slimfit   │ Celana pria  │  ✅   │✏️ 🗑│   │
│ │ 3  │ Dress Casual     │ Gaun santai  │  ❌   │✏️ 🗑│   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ Inline Edit state (row expanded):                       │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 2  │ [Celana Slimfit      ] │ [Celana pria  ] │ ✅/🗑│  │
│ │    │              [Batal]   [Simpan]              │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ Same layout for: Fabrics, Couriers                     │
└─────────────────────────────────────────────────────────┘
```

---

## Screen: Discount Policies

```
┌─────────────────────────────────────────────────────────┐
│ Kebijakan Diskon                                        │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 💡 Perubahan kebijakan berlaku untuk order baru. │   │
│ │ Order yang sudah ada tidak terpengaruh.           │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ ┌──────────────────────────────────────────────────┐   │
│ │ loyalty_threshold                                │   │
│ │ Jumlah pesanan tailor CLOSED sebelum loyalty     │   │
│ │ berlaku                                          │   │
│ │                           [ 5 ]  [Simpan]        │   │
│ └──────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────┐   │
│ │ loyalty_discount_percent                         │   │
│ │ Persen diskon loyalty yang diberikan             │   │
│ │                           [ 20% ]  [Simpan]      │   │
│ └──────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────┐   │
│ │ clearance_min_margin                             │   │
│ │ Harga jual minimum clearance (batas bawah HPP)   │   │
│ │                           [ 0% ]  [Simpan]       │   │
│ └──────────────────────────────────────────────────┘   │
│ Riwayat Perubahan:                                      │
│ 07 Mar  Admin  loyalty_threshold: 6 → 5                 │
│ 01 Feb  Admin  loyalty_discount_percent: 15% → 20%      │
└─────────────────────────────────────────────────────────┘
```

---

## Screen: Reports (Admin/Owner)

```
┌─────────────────────────────────────────────────────────┐
│ Laporan                        Periode: [ Bulan ini ▾ ] │
│ ─────────────────────────────────────────────────────── │
│                                        [📥 Export PDF]  │
│                                        [📊 Export CSV]  │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Omzet                                            │   │
│ │ Bulan Ini: Rp 48.750.000   vs Rp 43.580.000 ↑12%│   │
│ │ ─────────────────────────────────────────────    │   │
│ │ Tailor     Rp 28.000.000  ████████████░░░  57%   │   │
│ │ RTW        Rp 12.500.000  ██████░░░░░░░░  26%   │   │
│ │ Konveksi   Rp  8.250.000  ████░░░░░░░░░   17%   │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Metode Pembayaran                                │   │
│ │ Cash         Rp 28.500.000  ████████  58%        │   │
│ │ Transfer     Rp 20.250.000  ██████    42%        │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ ┌────────────────────────┐ ┌──────────────────────────┐ │
│ │ Top 5 Pelanggan        │ │ Produk Low Stock          │ │
│ │ Budi S   7 order       │ │ Kaos Putih S   1 pcs      │ │
│ │ PT Sinar 3 order       │ │ Kemeja Abu M   2 pcs      │ │
│ │ Siti R   5 order       │ │ Celana Hitam  3 pcs       │ │
│ └────────────────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Screen: Audit Log

```
┌─────────────────────────────────────────────────────────┐
│ Audit Log                                               │
│ ─────────────────────────────────────────────────────── │
│ 🔍 Cari...   Filter: [User ▾] [Modul ▾] [Aksi ▾]  📅  │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 07 Mar 10:15  Admin                               │  │
│ │ ✏️  UPDATE ORDER  TLR-2026-0024                    │  │
│ │ Status: PENDING_PAYMENT → IN_PROGRESS              │  │
│ │ [Lihat Detail ▾]                                  │  │
│ └────────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 07 Mar 10:05  Admin                               │  │
│ │ 🔐 OVERRIDE LOYALTY  TLR-2026-0024                │  │
│ │ Loyalty discount 20% diapply manual               │  │
│ │ [Lihat Detail ▾]                                  │  │
│ └────────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 07 Mar 09:30  Kasir Rina                          │  │
│ │ 💳 CREATE PAYMENT  PAY-2026-0041                  │  │
│ │ Cash Rp 225.000 VERIFIED                          │  │
│ │ [Lihat Detail ▾]                                  │  │
│ └────────────────────────────────────────────────────┘  │
│                                                         │
│ Expand detail → before/after JSON diff                  │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Sebelum          │  Sesudah                       │  │
│ │ status: "pending"│  status: "in_progress"         │  │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## CMS vs App — Key Differences

| Aspect | App (Kasir/Produksi) | CMS (Admin/Owner) |
|---|---|---|
| Navigation | Mobile-first bottom nav + floating sidebar | Wide floating sidebar always visible |
| Orders | Create, view own, update status | Full CRUD + delete + export |
| Payments | Enter cash/transfer | Verify/reject + full audit |
| Customers | View + select for orders | Full CRUD + loyalty override |
| Master Data | Read only | Full CRUD (Models, Fabrics, Couriers) |
| Discount | Read only | Edit loyalty % + threshold |
| Reports | Limited (own orders) | Full reports + export |
| Users | Profile only | Full CRUD + role assignment |
| Audit Log | None | Full view with before/after diff |

---

## Responsive — CMS

```
Desktop (>1280px):  Full sidebar w-64 + wide content area
Tablet (768-1280px): Sidebar w-20 icon-only + content
Mobile (<768px):     Sidebar hidden → hamburger → full-screen overlay drawer
                     (CMS is primarily admin/desktop usage, mobile is secondary)
```
