# UI Wireframe — SIM Konveksi & Tailor (djaitin)

**Version:** 1.1 | **Date:** 2026-03-07 | **Approach:** Mobile-first → Tablet → Desktop

---
Simple, Elegant, Effortless, Hourglass, and Modern.
## Design System Tokens

```
Colors (Tailwind custom palette)
  Primary:     indigo-600 / indigo-700     → brand action color
  Success:     emerald-500                 → VERIFIED / CLOSED / DONE
  Warning:     amber-500                   → PENDING / IN_PROGRESS
  Danger:      rose-500                    → REJECTED / CANCELLED / error
  Neutral:     slate-100 → slate-900       → backgrounds and text
  Surface:     white / slate-50            → card backgrounds

Typography
  Font:        Inter (Google Fonts)
  Headings:    font-semibold
  Body:        font-normal text-slate-700
  Captions:    text-xs text-slate-500

Spacing base: 4px grid (Tailwind default)
Border radius: rounded-xl for cards, rounded-full for badges/chips
Shadows:      shadow-sm for cards, shadow-lg for modals/sheets
```

---

## Navigation Structure

### Mobile — Bottom Navigation Bar

```
┌─────────────────────────────────────────────┐
│                 Page Content                │
│                                             │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  🏠        📋      ╔═══╗     💰      ···   │
│ Beranda  Orders  ║  ＋  ║  Bayar   More   │
│            ╚═══╝                   │
└─────────────────────────────────────────────┘
             ↑ FAB center button opens
               "Buat Order" bottom sheet
```

**FAB Bottom Sheet — Pilih Jenis Order:**
```
┌─────────────────────────────────────────────┐
│                   ___                       │
│                  ─────  drag handle         │
│  Buat Order Baru                            │
│  ─────────────────────────────────────────  │
│  ✂️  Tailor (Jahit Custom)               >  │
│  👕  Ready-to-Wear (Siap Pakai)          >  │
│  🏭  Konveksi (Massal)                   >  │
│                                             │
│                [  Batal  ]                  │
└─────────────────────────────────────────────┘
```

### Tablet — Navigation Rail (Compact Sidebar)

```
┌────┬────────────────────────────────────────┐
│ 🏠 │                                        │
│    │                                        │
│ 📋 │           Page Content                 │
│    │                                        │
│ 💰 │                                        │
│    │                                        │
│ 👥 │                                        │
│    │                                        │
│ 📦 │                                        │
│    │                                        │
│ ··· │                                       │
└────┴────────────────────────────────────────┘
```

### Desktop — Expanded Sidebar + Topbar

```
┌──────────────┬─────────────────────────────────────────┐
│  djaitin     │  🔍 Cari...              👤 Admin  ▾   │
│  ────────    ├─────────────────────────────────────────┤
│  🏠 Dashboard│                                         │
│  📋 Orders   │           Page Content                  │
│  💰 Payments │                                         │
│  👥 Customers│                                         │
│  📦 Inventory│                                         │
│  📊 Reports  │                                         │
│              │                                         │
│  ⚙️  Settings │                                         │
└──────────────┴─────────────────────────────────────────┘
```

---

## Screen 1 — Login

```
┌─────────────────────────────┐
│                             │
│         djaitin ✂️          │
│    Sistem Informasi Konveksi│
│         & Tailor            │
│                             │
│  ┌───────────────────────┐  │
│  │  Email                │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  Password         👁  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │      Masuk            │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

---

## Screen 2 — Dashboard

Role-based: Kasir / Produksi / Admin / Owner masing-masing dapat KPI berbeda.

```
┌─────────────────────────────┐
│  🌅 Selamat pagi, Admin     │
│  Sabtu, 7 Mar 2026          │
│─────────────────────────────│
│  ┌────────┐  ┌────────────┐ │
│  │ Rp 12M │  │  8 Pending │ │
│  │ Omzet  │  │ Transfer   │ │
│  │ Hari   │  │ Verify ⚠️  │ │
│  └────────┘  └────────────┘ │
│  ┌────────┐  ┌────────────┐ │
│  │   24   │  │   3 Stok   │ │
│  │ Order  │  │  Hampir    │ │
│  │ Aktif  │  │  Habis ⚠️  │ │
│  └────────┘  └────────────┘ │
│─────────────────────────────│
│  ⚠️ Alerts                  │
│  • 3 transfer pending verify│
│  • 2 tailor due besok       │
│─────────────────────────────│
│  Order Terbaru              │
│  ┌─────────────────────────┐│
│  │ TLR-2026-0024  [TAILOR] ││
│  │ Budi Santoso            ││
│  │ Rp 450.000   [PROGRESS] ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ RTW-2026-0011  [RTW]    ││
│  │ Siti Rahayu             ││
│  │ Rp 220.000    [PENDING] ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

**KPI Cards per Role:**
| KPI | Kasir | Produksi | Admin | Owner |
|---|:---:|:---:|:---:|:---:|
| Omzet hari ini | — | — | ✓ | ✓ |
| Transfer pending | ✓ | — | ✓ | ✓ |
| Order aktif | ✓ | ✓ | ✓ | ✓ |
| Due date hari ini | — | ✓ | ✓ | — |
| Stok hampir habis | — | — | ✓ | ✓ |

---

## Screen 3 — Orders List

```
┌─────────────────────────────┐
│  Orders              🔍  ⚙  │
│─────────────────────────────│
│ [ Semua ][ Tailor ][ RTW ][ Konveksi ] │
│─────────────────────────────│
│  ┌─────────────────────────┐│
│  │ TLR-2026-0024           ││
│  │ [TAILOR]  [IN PROGRESS] ││
│  │ Budi Santoso            ││
│  │ Total: Rp 450.000       ││
│  │ Sisa: Rp 200.000  ⚠️    ││
│  │ Due: 10 Mar 2026        ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ CVX-2026-0003           ││
│  │ [KONVEKSI] [PENDING_PAY]││
│  │ PT Sinar Jaya           ││
│  │ Total: Rp 8.500.000     ││
│  │ Belum bayar ❌           ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ RTW-2026-0011           ││
│  │ [RTW]      [DONE]       ││
│  │ Siti Rahayu             ││
│  │ Total: Rp 220.000  ✅   ││
│  └─────────────────────────┘│
└─────────────────────────────┘

Status Badge Colors:
  [DRAFT]       → slate
  [PENDING_PAY] → amber
  [IN PROGRESS] → blue
  [DONE]        → indigo
  [DELIVERED]   → teal
  [CLOSED]      → emerald
  [CANCELLED]   → rose
```

**Filter Bottom Sheet:**
```
┌─────────────────────────────┐
│  ─────  Filter Orders       │
│                             │
│  Status                     │
│  [ ] Pending  [ ] Progress  │
│  [ ] Done     [ ] Closed    │
│                             │
│  Tanggal                    │
│  Dari: ──────  Sampai: ──── │
│                             │
│  Pelanggan                  │
│  [ Cari nama pelanggan... ] │
│                             │
│  [ Reset ]   [ Terapkan ]   │
└─────────────────────────────┘
```

---

## Screen 4 — Order Detail

```
┌─────────────────────────────┐
│ ← TLR-2026-0024   🖨  ···  │
│  [TAILOR]    [IN PROGRESS]  │
│─────────────────────────────│
│ [ Detail ][ Bayar ][ Kirim ][ Log ] │
│─────────────────────────────│
│  👤 Budi Santoso            │
│     📞 0812-3456-7890       │
│     🏅 Loyalty Member       │
│─────────────────────────────│
│  DP Progress                │
│  ████████░░░░  75%          │
│  Rp 337.500 / Rp 450.000    │
│─────────────────────────────│
│  📋 Detail Pesanan          │
│  Model  : Kemeja Formal     │
│  Bahan  : Katun Premium     │
│  Qty    : 2 pcs             │
│  Due    : 10 Mar 2026       │
│  Diskon : 20% (Loyalty) 🏅  │
│─────────────────────────────│
│  💰 Ringkasan               │
│  Subtotal      Rp 562.500   │
│  Diskon 20%   -Rp 112.500   │
│  ─────────────────────────  │
│  Total         Rp 450.000   │
│  Terbayar      Rp 337.500   │
│  Sisa          Rp 112.500   │
│─────────────────────────────│
│  ┌─────────────────────────┐│
│  │    Catat Pelunasan      ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

**Tab: Payments**
```
┌─────────────────────────────┐
│ Riwayat Pembayaran          │
│─────────────────────────────│
│ ┌───────────────────────────┐│
│ │ PAY-2026-0041             ││
│ │ [CASH]    [VERIFIED] ✅   ││
│ │ Rp 225.000                ││
│ │ Kasir: Rina · 7 Mar 09:30 ││
│ │               [Kwitansi]  ││
│ └───────────────────────────┘│
│ ┌───────────────────────────┐│
│ │ PAY-2026-0048             ││
│ │ [TRANSFER] [PENDING] ⏳   ││
│ │ Rp 112.500                ││
│ │ Ref: BCA 12345678         ││
│ │ [Verify] [Tolak]          ││
│ └───────────────────────────┘│
└─────────────────────────────┘
```

**Tab: Activity Log**
```
┌─────────────────────────────┐
│ Activity Log                │
│─────────────────────────────│
│ 07 Mar 10:15  Admin         │
│ Status: PENDING → IN_PROGRESS│
│                             │
│ 07 Mar 09:30  Kasir Rina    │
│ Pembayaran Rp 225.000 (Cash)│
│                             │
│ 07 Mar 09:15  Kasir Rina    │
│ Order dibuat                │
└─────────────────────────────┘
```

**Sticky Bottom Action Bar (Contextual):**
```
Status PENDING_PAYMENT:
┌─────────────────────────────┐
│  [ + Catat Pembayaran  ]    │
└─────────────────────────────┘

Status DONE + outstanding > 0:
┌─────────────────────────────┐
│  [ + Catat Pelunasan  ]     │
│  [ Close ] ← disabled, abu  │
└─────────────────────────────┘

Status DONE + outstanding == 0:
┌─────────────────────────────┐
│  [ ✅  Close / Serah Terima ]│
└─────────────────────────────┘
```

---

## Screen 5 — Tailor Order Wizard (4 Steps)

### Step 1/4 — Customer

```
┌─────────────────────────────┐
│ ← Buat Order Tailor         │
│─────────────────────────────│
│  ①──────②──────③──────④   │
│  Pelanggan Model  Summary  Bayar│
│─────────────────────────────│
│  Cari atau Pilih Pelanggan  │
│  ┌───────────────────────┐  │
│  │ 🔍 Cari nama...       │  │
│  └───────────────────────┘  │
│                             │
│  Hasil Pencarian:           │
│  ┌───────────────────────┐  │
│  │ Budi Santoso          │  │
│  │ 0812-3456-7890        │  │
│  │ 🏅 Loyalty Member     │  │  ← auto-shown if eligible
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ + Pelanggan Baru      │  │
│  └───────────────────────┘  │
│                             │
│  🏅 Diskon Loyalty 20% akan │
│     otomatis diterapkan!    │  ← badge + info
│                             │
│             [ Lanjut → ]    │
└─────────────────────────────┘
```

### Step 2/4 — Garment

```
┌─────────────────────────────┐
│ ← Buat Order Tailor         │
│─────────────────────────────│
│  ①──────②──────③──────④   │
│─────────────────────────────│
│  Model Pakaian              │
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │Kemeja│ │Celana│ │ Jas  ││
│  │Formal│ │Slimft│ │      ││
│  └──────┘ └──────┘ └──────┘│
│                             │
│  Pilih Bahan                │
│  ○ Katun Premium            │
│  ○ Linen                    │
│  ○ Drill                    │
│                             │
│  Ukuran                     │
│  [Pakai Ukuran Terakhir ▾]  │  ← dropdown dari history
│  atau [ + Input Ukuran ]    │
│                             │
│  [ ←  Kembali ] [ Lanjut → ]│
└─────────────────────────────┘
```

### Step 3/4 — Summary

```
┌─────────────────────────────┐
│ ← Buat Order Tailor         │
│─────────────────────────────│
│  ①──────②──────③──────④   │
│─────────────────────────────│
│  Detail Pesanan             │
│                             │
│  Qty        [ - ] 2  [ + ]  │
│  Harga/pcs  Rp 281.250      │  ← Rp 562.500 / 2
│                             │
│  Target Selesai             │
│  📅 10 Maret 2026           │
│                             │
│  Ringkasan                  │
│  Subtotal        Rp 562.500 │
│  Diskon 20%🏅   -Rp 112.500 │  ← loyalty badge
│  ─────────────────────────  │
│  Total           Rp 450.000 │
│                             │
│  Catatan (opsional)         │
│  ┌───────────────────────┐  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  [ ←  Kembali ] [ Lanjut → ]│
└─────────────────────────────┘
```

### Step 4/4 — Payment (DP)

```
┌─────────────────────────────┐
│ ← Buat Order Tailor         │
│─────────────────────────────│
│  ①──────②──────③──────④   │
│─────────────────────────────│
│  Total           Rp 450.000 │
│  DP Minimum      Rp 225.000 │  ← 50%
│                             │
│  Metode Bayar               │
│  ◉ Cash   ○ Transfer        │
│                             │
│  Nominal DP                 │
│  ┌───────────────────────┐  │
│  │ Rp 225.000            │  │
│  └───────────────────────┘  │
│  ✅ DP sudah ≥ 50%          │  ← live validation
│                             │
│  [!] DP minimal 50% dari    │  ← shown if < 50%
│      total biaya (Rp 225rb) │
│                             │
│  [ ←  Kembali ] [ Simpan ✓ ]│
└─────────────────────────────┘
```

---

## Screen 6 — Ready-to-Wear Checkout (Cart Style)

```
┌─────────────────────────────┐
│ ← Jual Siap Pakai      🛒 2 │
│─────────────────────────────│
│  🔍 Cari produk...          │
│─────────────────────────────│
│  ┌─────────────────────────┐│
│  │ 🖼 Kemeja Kotak Biru    ││
│  │ S  M  [L]  XL           ││  ← size chips, [L] = selected
│  │ Rp 85.000               ││
│  │ Stok: 12     [ + Keranjang ] ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 🖼 Celana Chino Cream   ││
│  │ 30  [32]  34  36        ││
│  │ ~~Rp 150.000~~ Rp 99.000││  ← diskon strikethrough
│  │ [CLEARANCE] Stok: 4     ││  ← clearance badge
│  │            [ + Keranjang ] ││
│  └─────────────────────────┘│
│─────────────────────────────│
│  KERANJANG                  │
│  Kemeja Biru L × 2 = 170rb  │
│  Celana Cream 32 × 1 = 99rb │
│─────────────────────────────│
│  Total: Rp 269.000          │
│  [ Lanjut ke Checkout → ]   │
└─────────────────────────────┘
```

**Checkout Step — Pengiriman:**
```
┌─────────────────────────────┐
│  Pengiriman                 │
│─────────────────────────────│
│  ◉ Ambil Sendiri (Pickup)   │
│  ○ Dikirim                  │
│                             │
│  [Jika Dikirim:]            │
│  Kurir    [ JNE     ▾ ]     │
│  Ongkir   [ Rp 15.000 ]     │
│  Alamat   [              ]  │
│  No. Resi [          ] Opt. │
└─────────────────────────────┘
```

**Checkout Step — Pembayaran:**
```
┌─────────────────────────────┐
│  Ringkasan & Bayar          │
│─────────────────────────────│
│  Kemeja Biru L ×2  Rp 170rb │
│  Celana Cream 32 ×1 Rp 99rb │
│  Ongkir            Rp 15rb  │
│  ─────────────────────────  │
│  Total             Rp 284rb │
│─────────────────────────────│
│  ◉ Cash   ○ Transfer        │
│                             │
│  [ ✅  Proses Pembayaran ]  │
└─────────────────────────────┘
```

---

## Screen 7 — Convection Order Wizard (3 Steps)

### Step 1/3 — Info Perusahaan

```
┌─────────────────────────────┐
│ ← Buat Order Konveksi       │
│─────────────────────────────│
│  ①──────────②──────────③  │
│  Perusahaan     Items    Bayar│
│─────────────────────────────│
│  Nama Perusahaan / PIC      │
│  ┌───────────────────────┐  │
│  │ PT Sinar Jaya         │  │
│  └───────────────────────┘  │
│                             │
│  Atau pilih Pelanggan lama: │
│  ┌───────────────────────┐  │
│  │ 🔍 Cari pelanggan...  │  │
│  └───────────────────────┘  │
│                             │
│  Catatan Desain / Spesifikasi│
│  ┌───────────────────────┐  │
│  │                       │  │
│  │  Warna merah maroon,  │  │
│  │  bordir nama sekolah  │  │
│  └───────────────────────┘  │
│                             │
│             [ Lanjut → ]    │
└─────────────────────────────┘
```

### Step 2/3 — Items

```
┌─────────────────────────────┐
│ ← Buat Order Konveksi       │
│─────────────────────────────│
│  ①──────────②──────────③  │
│─────────────────────────────│
│  Daftar Item                │
│  ┌───────────────────────┐  │
│  │ Baju Seragam          │  │
│  │ Qty: 100  Harga: 45rb │  │
│  │ Subtotal: Rp 4.500.000│  │
│  │                    ✏️ 🗑│  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Celana Seragam        │  │
│  │ Qty: 100  Harga: 40rb │  │
│  │ Subtotal: Rp 4.000.000│  │
│  │                    ✏️ 🗑│  │
│  └───────────────────────┘  │
│                             │
│  [ + Tambah Item ]          │
│─────────────────────────────│
│  Total: Rp 8.500.000        │
│                             │
│  [ ←  Kembali ] [ Lanjut → ]│
└─────────────────────────────┘
```

### Step 3/3 — Full Payment

```
┌─────────────────────────────┐
│ ← Buat Order Konveksi       │
│─────────────────────────────│
│  ①──────────②──────────③  │
│─────────────────────────────│
│  ⚠️  Konveksi wajib lunas   │
│      100% sebelum produksi! │
│─────────────────────────────│
│  Total         Rp 8.500.000 │
│                             │
│  Metode Bayar               │
│  ◉ Transfer  ○ Cash         │
│                             │
│  Nominal                    │
│  ┌───────────────────────┐  │
│  │ Rp 8.500.000          │  │
│  └───────────────────────┘  │
│                             │
│  No. Referensi Transfer     │
│  ┌───────────────────────┐  │
│  │ BCA 1234567890        │  │
│  └───────────────────────┘  │
│                             │
│  Upload Bukti Transfer      │
│  ┌───────────────────────┐  │
│  │  📎 Pilih File        │  │
│  └───────────────────────┘  │
│                             │
│  [ ←  Kembali ] [ Simpan ✓ ]│
└─────────────────────────────┘
```

---

## Screen 8 — Payments List

```
┌─────────────────────────────┐
│  Pembayaran          🔍     │
│─────────────────────────────│
│ [ Pending (3) ][ Verified ][ Semua ] │
│─────────────────────────────│
│  ┌─────────────────────────┐│
│  │ PAY-2026-0048           ││
│  │ [TRANSFER]  [PENDING ⏳] ││
│  │ Order: TLR-2026-0024    ││
│  │ Budi Santoso            ││
│  │ Rp 112.500              ││
│  │ Ref: BCA 12345678       ││
│  │ Upload: Rina · 10:45    ││
│  │ [ ✅ Verify ] [❌ Tolak]││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ PAY-2026-0047           ││
│  │ [TRANSFER]  [PENDING ⏳] ││
│  │ Order: CVX-2026-0003    ││
│  │ PT Sinar Jaya           ││
│  │ Rp 8.500.000            ││
│  │ [ ✅ Verify ] [❌ Tolak]││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

**Reject Dialog:**
```
┌────────────────────────────────┐
│  ❌ Tolak Transfer             │
│  ──────────────────────────    │
│  Alasan penolakan (wajib):     │
│  ┌──────────────────────────┐  │
│  │ Nominal tidak sesuai...  │  │
│  └──────────────────────────┘  │
│                                │
│  [ Batal ]   [ Tolak Transfer ]│
└────────────────────────────────┘
```

---

## Screen 9 — Customers List & Detail

**List:**
```
┌─────────────────────────────┐
│  Pelanggan           🔍  ＋ │
│─────────────────────────────│
│  ┌─────────────────────────┐│
│  │ 👤 Budi Santoso         ││
│  │ 📞 0812-3456-7890       ││
│  │ 🏅 Loyal · 7 orders     ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 👤 Siti Rahayu          ││
│  │ 📞 0821-9876-5432       ││
│  │ 3 orders                ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

**Detail:**
```
┌─────────────────────────────┐
│ ← Budi Santoso        ✏️   │
│─────────────────────────────│
│  📞 0812-3456-7890          │
│  📍 Jl. Mangga No. 12       │
│  🏅 Loyalty Member (7 order)│
│─────────────────────────────│
│  Ukuran Tersimpan           │
│  ┌─────────────────────────┐│
│  │ Kemeja Mar 2026         ││
│  │ Dada: 104 · Pinggang: 86││
│  │ Pundak: 46 · Lengan: 60 ││
│  │                    ✏️   ││
│  └─────────────────────────┘│
│  [ + Tambah Ukuran ]        │
│─────────────────────────────│
│  Riwayat Order (7)          │
│  TLR-0024 · IN PROGRESS     │
│  TLR-0019 · CLOSED ✅       │
│  TLR-0015 · CLOSED ✅       │
└─────────────────────────────┘
```

---

## Screen 10 — Inventory (Ready-to-Wear)

```
┌─────────────────────────────┐
│  Inventori           🔍  ＋ │
│─────────────────────────────│
│ [ Semua ][ Low Stock ⚠️ ][ Clearance ] │
│─────────────────────────────│
│  ┌─────────────────────────┐│
│  │ 🖼 Kemeja Kotak Biru    ││
│  │ SKU: KMJ-001-L          ││
│  │ Size: L  Stok:  12 ✅   ││
│  │ Jual: Rp 85.000         ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 🖼 Celana Chino Cream   ││
│  │ SKU: CLN-008-32         ││
│  │ [CLEARANCE] Size: 32    ││
│  │ Stok: 4 ⚠️              ││
│  │ Jual: Rp 99.000         ││
│  │ (HPP: Rp 80.000)        ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 🖼 Kaos Polos Putih     ││
│  │ SKU: KOS-002-S          ││
│  │ Stok: 1 🔴 LOW          ││
│  │ Jual: Rp 45.000         ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

---

## Screen 11 — Reports Hub

```
┌─────────────────────────────┐
│  Laporan                    │
│─────────────────────────────│
│  ┌──────────┐ ┌───────────┐ │
│  │ 📈       │ │ 💳        │ │
│  │ Omzet    │ │ Pembayaran│ │
│  │ & Transaksi │ & Metode │ │
│  └──────────┘ └───────────┘ │
│  ┌──────────┐ ┌───────────┐ │
│  │ 📦       │ │ 👥        │ │
│  │ Inventori│ │ Pelanggan │ │
│  │ & Stok   │ │ & Loyal   │ │
│  └──────────┘ └───────────┘ │
│─────────────────────────────│
│  Filter Periode             │
│  [ Hari ][ Minggu ][ Bulan ]│
│─────────────────────────────│
│  [ 📥 Export PDF ]          │
│  [ 📊 Export CSV ]          │
└─────────────────────────────┘
```

**Revenue Report:**
```
┌─────────────────────────────┐
│ ← Laporan Omzet      Export │
│─────────────────────────────│
│  Bulan Ini: Rp 48.750.000   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  +12%     │
│─────────────────────────────│
│  Per Jenis                  │
│  Tailor      Rp 28.000.000  │
│  RTW         Rp 12.500.000  │
│  Konveksi    Rp  8.250.000  │
│─────────────────────────────│
│  Transaksi Harian           │
│  1 Mar  ██████  Rp 3.2M     │
│  2 Mar  ████    Rp 2.1M     │
│  3 Mar  ████████ Rp 4.5M    │
│  ...                        │
└─────────────────────────────┘
```

---

## Screen 12 — Settings / More

```
┌─────────────────────────────┐
│  Pengaturan                 │
│─────────────────────────────│
│  Master Data                │
│  ┌─────────────────────────┐│
│  │ 🎨 Model Pakaian     >  ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 🧵 Bahan Kain        >  ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 🚚 Jasa Pengiriman   >  ││
│  └─────────────────────────┘│
│─────────────────────────────│
│  Kebijakan Diskon           │
│  ┌─────────────────────────┐│
│  │ % Loyalty Discount      ││
│  │ 20%              [Edit] ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ Threshold Order Loyalty ││
│  │ 5 order          [Edit] ││
│  └─────────────────────────┘│
│─────────────────────────────│
│  (Admin only)               │
│  ┌─────────────────────────┐│
│  │ 👥 Manajemen User    >  ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 📋 Audit Log         >  ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

---

## Component Library Summary

```
Badges:
  [TAILOR]       → indigo-100 text-indigo-700
  [RTW]          → sky-100 text-sky-700
  [KONVEKSI]     → violet-100 text-violet-700
  [PENDING]      → amber-100 text-amber-700
  [IN PROGRESS]  → blue-100 text-blue-700
  [DONE]         → indigo-100 text-indigo-700
  [CLOSED]       → emerald-100 text-emerald-700
  [CANCELLED]    → rose-100 text-rose-700
  [VERIFIED]     → emerald-100 text-emerald-700
  [REJECTED]     → rose-100 text-rose-700
  🏅 LOYALTY     → yellow-100 text-yellow-700

Key Components:
  KpiCard         → icon + angka + label + trend %
  OrderCard       → number + type badge + status badge + customer + total + sisa
  PaymentCard     → pay number + method badge + status badge + amount + actions
  Stepper         → 4 steps, active=filled, done=✓, future=outline
  SegmentedTabs   → pill style, active=primary bg
  SizeChip        → rounded-full, selected=indigo filled
  BottomSheet     → slide-up panel, drag handle, backdrop blur
  BottomActionBar → fixed bottom, safe area padding, contextual buttons
  DPProgressBar   → colored bar with percentage, turns green at ≥50%
  ActivityLogItem → timestamp + user + action text
```

---

## Responsive Breakpoints

| Element | Mobile (<768px) | Tablet (768–1024px) | Desktop (>1024px) |
|---|---|---|---|
| Navigation | Bottom nav bar | Navigation rail | Expanded sidebar |
| Order List | Single column cards | 2-col cards or list | Wide table/list |
| Order Detail | Stacked tabs | Tab + side panel | Side-by-side |
| Wizards | Full screen stepper | Center modal | Center modal wider |
| Dashboard KPIs | 2×2 grid | 4-col row | 4-col row + charts |
| Bottom Action Bar | Fixed bottom | Fixed bottom | Inline action buttons |
