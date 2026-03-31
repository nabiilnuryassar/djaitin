# UI Wireframe 2/3 — Frontend App
# djaitin · Sistem Informasi Konveksi & Tailor

**Style:** Simple, Elegant, Effortless, Hourglass, Modern
**Inspiration:** Floating dark sidebar (detached from edge), glassmorphism cards, soft violet palette
**Date:** 2026-03-07

---

## Design Language

```
App Background:  #F0EFFF (lavender-light) — outer shell bg
Surface:         #FFFFFF — cards, panels
Sidebar:         #1A1830 (dark navy) floating — matches reference image
Active Nav:      #6C63FF pill in sidebar
Primary:         #6C63FF (indigo-violet)
Accent:          #A89CFF (soft violet)
Success:         #10B981   Warning: #F59E0B   Danger: #EF4444

Cards:    bg-white rounded-2xl shadow-sm border-gray-100 p-5
Badges:   rounded-full px-3 py-0.5 text-xs font-medium
Inputs:   rounded-xl border-gray-200 focus:ring-2 ring-indigo-300
Sidebar:  rounded-2xl fixed left-4 top-4 bottom-4 (desktop)
          NOT touching screen edge — matches floating sidebar style
```

---

## Floating Sidebar — Desktop

```
┌──────────────────────────────────────────────────────────┐
│  bg:#F0EFFF (outer shell)                                │
│                                                          │
│ ┌────────┐  ┌────────────────────────────────────────┐  │
│ │ ✂️      │  │  Topbar: bg-white rounded-2xl shadow   │  │
│ │djaitin │  │  🔍 Cari...                   🔔  👤   │  │
│ │★ 4.9  │  └────────────────────────────────────────┘  │
│ │ ─────  │                                              │
│ │■──🏠   │  ← active: indigo-600 pill, text-white       │
│ │   📋   │  ← inactive: slate-400, hover:slate-200 pill │
│ │   💰   │                                              │
│ │   👥   │        Page Content                          │
│ │   📦   │                                              │
│ │   📊   │                                              │
│ │ ─────  │                                              │
│ │   ⚙️   │                                              │
│ │  [👤]  │  ← avatar at bottom                         │
│ │ Admin  │                                              │
│ └────────┘                                              │
│   ↑ position fixed, left-4 top-4 bottom-4              │
│   ↑ bg-[#1A1830] rounded-2xl w-20 (icon) / w-60 expanded│
└──────────────────────────────────────────────────────────┘
```

---

## Mobile Bottom Nav

```
  ╔═════════════════════════════╗   ← floating pill
  ║  🏠     📋    [＋]   💰  ···║   bg-white shadow-xl rounded-2xl
  ╚═════════════════════════════╝   fixed bottom-4 left-4 right-4

  [＋] FAB: bg-indigo-600 rounded-full 52×52 shadow-lg
  Tap → "Buat Order" bottom sheet slide-up
```

---

## Dashboard

```
  Selamat pagi, Admin ☀️   Sabtu, 7 Maret 2026

  KPI (4-col):
  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Rp 48M   │ │ 3 ⚠️     │ │ 24 📋    │ │ 2 ⚠️     │
  │ Omzet    │ │ Transfer │ │ Orders   │ │ Low Stok │
  │ ↑ +12%   │ │ Pending  │ │ Aktif    │ │          │
  └──────────┘ └──────────┘ └──────────┘ └──────────┘
  white rounded-2xl shadow-sm, icon bg indigo-50/amber-50

  Alerts (border-l-4):
  ⚠️ 3 transfer menunggu verifikasi         [Lihat →]
  📅 2 tailor due besok                     [Lihat →]

  ┌───────────────────────────┐  ┌───────────────────┐
  │  Order Terbaru            │  │ Omzet 7 Hari      │
  │  TLR-024 ●Progress Rp450k │  │ ▄▄█▄███████       │
  │  RTW-011 ●Done ✅         │  │ Mon         Sun   │
  │  CVX-003 ●Pending ❌      │  └───────────────────┘
  └───────────────────────────┘
```

---

## Orders List

```
  Orders                                    [+ Buat Baru]

  [Semua] [Tailor] [RTW] [Konveksi]         🔍  ≡Filter

  ┌─────────────────────────────────────────────────────┐
  │ border-l-4 border-indigo-500                        │
  │ TLR-2026-0024        [TAILOR]    [IN PROGRESS]      │
  │ Budi Santoso · Due: 10 Mar 2026 · 🏅 Loyalty        │
  │ Total: Rp 450.000    Sisa: Rp 112.500  ⚠️     [→]  │
  └─────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────┐
  │ border-l-4 border-violet-500                        │
  │ CVX-2026-0003        [KONVEKSI]  [PENDING_PAY]      │
  │ PT Sinar Jaya                                       │
  │ Total: Rp 8.500.000  Belum bayar ❌           [→]  │
  └─────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────┐
  │ border-l-4 border-sky-500                           │
  │ RTW-2026-0011         [RTW]       [DONE ✅]         │
  │ Siti Rahayu                                         │
  │ Total: Rp 284.000    Lunas ✅                 [→]  │
  └─────────────────────────────────────────────────────┘
```

---

## Order Detail (Tabs Layout)

```
  ← Orders    TLR-2026-0024    [TAILOR] ● IN PROGRESS   🖨 ···

  [Detail]  [Pembayaran]  [Pengiriman]  [Log]

  ┌─────────────────────┐  ┌──────────────────────────┐
  │ 👤 Budi Santoso     │  │ DP Progress              │
  │ 📞 0812-3456-7890   │  │ ████████░░░░   75%       │
  │ 🏅 Loyalty Member   │  │ Rp 337.500 / Rp 450.000  │
  └─────────────────────┘  └──────────────────────────┘

  ┌──────────────────────────────────────────────────┐
  │ Detail Pesanan                                   │
  │ Model: Kemeja Formal  Bahan: Katun Premium       │
  │ Qty: 2 pcs            Due: 10 Mar 2026           │
  └──────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────┐
  │ Ringkasan                               🏅 Loyalty│
  │ Subtotal              Rp 562.500                 │
  │ Diskon Loyalty 20%   -Rp 112.500                 │
  │ ────────────────────────────────────────────     │
  │ Total                 Rp 450.000                 │
  │ Terbayar              Rp 337.500                 │
  │ Sisa                  Rp 112.500  ⚠️             │
  └──────────────────────────────────────────────────┘

  Sticky bottom (bg-white border-t rounded-b-2xl):
  [🖨 Nota]    [+ Catat Pelunasan]    [Close ● disabled]
```

---

## Tailor Order Wizard (4 Steps)

```
  ①──────②──────③──────④
  Pelanggan  Model  Summary  Bayar

  Step 1: Customer search + loyalty badge alert
  Step 2: Model picker grid, fabric radio, ukuran dropdown
  Step 3: Qty stepper, due date picker, price summary + loyalty -20%
  Step 4: DP amount input with live ≥50% validation bar
          ✅ green alert if ≥50% / ⚠️ rose alert if <50%
          [← Kembali]  [✅ Simpan Order]
```

---

## RTW Checkout (Cart)

```
  🔍 Cari produk...

  ┌────────────────────┐  ┌────────────────────┐
  │ 🖼 Kemeja Biru     │  │ 🖼 Celana Chino    │
  │ [S][M][L●][XL]    │  │ [30][32●][34][36]  │
  │ Rp 85.000  Stok:12 │  │ ~~150rb~~ Rp 99rb  │
  │ [+ Keranjang]      │  │ [CLEARANCE] Stok:4 │
  └────────────────────┘  └────────────────────┘

  Keranjang:
  Kemeja L  × [−]2[+] = Rp 170.000  🗑
  Celana 32 × [−]1[+] = Rp  99.000  🗑
  Total: Rp 269.000              [Checkout →]

  Checkout → pengiriman (pickup/kurir) → bayar (cash/transfer) → selesai
```

---

## Convection Wizard (3 Steps)

```
  ①──────────②──────────③
  Perusahaan   Items    Full Payment

  Step 1: Nama perusahaan/PIC atau cari pelanggan + catatan desain
  Step 2: Item list dengan qty, harga, subtotal — dapat tambah/hapus
  Step 3: ⚠️ Banner "Wajib lunas 100%" + amount + transfer/cash + upload bukti
          [✅ Simpan Order]
```

---

## Payments

```
  [Pending (3)]  [Verified]  [Semua]

  ┌──────────────────────────────────────────────────┐
  │ PAY-048  [TRANSFER] [PENDING ⏳]                │
  │ Order: TLR-0024 · Budi · Rp 112.500             │
  │ Ref: BCA 12345678 · Rina 10:45                  │
  │                      [❌ Tolak]  [✅ Verifikasi] │
  └──────────────────────────────────────────────────┘
  ┌──────────────────────────────────────────────────┐
  │ PAY-041  [CASH] [VERIFIED ✅]                   │
  │ Order: RTW-0011 · Siti · Rp 284.000             │
  │ 07 Mar 09:30                    [🖨 Kwitansi]   │
  └──────────────────────────────────────────────────┘

  Tolak dialog: modal rounded-2xl + textarea alasan (required)
```

---

## Customers & Inventory

```
Customers:
  🔍 Cari... + [+ Tambah]
  Cards: avatar + nama + phone + order count + loyalty badge
  Detail: tabs (Info | Ukuran | Riwayat Order)
  Ukuran card: collapsible, per garment type, edit button

Inventory:
  Filter tabs: [Semua] [Low Stock ⚠️] [Clearance]
  Cards: image + SKU + size + stock badge (✅/⚠️/🔴) + price
  Clearance: shows HPP so admin can price down to cost safely
```

---

## Reports

```
  ┌────────────────┐  ┌────────────────┐
  │ 📈 Omzet       │  │ 💳 Pembayaran  │
  └────────────────┘  └────────────────┘
  ┌────────────────┐  ┌────────────────┐
  │ 📦 Inventori   │  │ 👥 Pelanggan   │
  └────────────────┘  └────────────────┘
  Filter: [Hari][Minggu][Bulan]
  [📥 Export PDF]  [📊 Export CSV]
```

---

## Badge Color System

```
Order Type:  Tailor=indigo  RTW=sky  Konveksi=violet
Order Status:
  DRAFT          → slate-100  text-slate-600
  PENDING_PAYMENT → amber-100  text-amber-700
  IN_PROGRESS    → blue-100   text-blue-700
  DONE           → indigo-100 text-indigo-700
  DELIVERED      → teal-100   text-teal-700
  CLOSED         → emerald-100 text-emerald-700
  CANCELLED      → rose-100   text-rose-700
Payment:
  PENDING    → amber   VERIFIED → emerald   REJECTED → rose
  CASH       → slate   TRANSFER → blue
Shipment:
  PENDING → slate  SENT → blue  DELIVERED → emerald
```
