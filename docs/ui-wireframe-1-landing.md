# UI Wireframe 1/3 — Landing Page
# djaitin · Sistem Informasi Konveksi & Tailor

**Style:** Simple, Elegant, Effortless, Hourglass, Modern
**Date:** 2026-03-07

---

## Design Language — Landing Page

```
Palette
  Background:   #F5F4FF (lavender-white) / #0F0E1A (deep navy dark mode)
  Primary:      #6C63FF (indigo-violet)
  Accent:       #A89CFF (soft violet)
  Surface:      rgba(255,255,255,0.7) — glassmorphism card
  Text:         #1A1830 heading / #6B7280 body
  Border:       rgba(108,99,255,0.15) soft violet border

Typography
  Display:  "Plus Jakarta Sans" — 700 — 48–64px
  Heading:  "Plus Jakarta Sans" — 600 — 24–32px
  Body:     "Inter" — 400 — 16px / line-height 1.7

Motion
  Entrance:  fade-up 0.6s ease-out per section
  Hover:     scale(1.02) + shadow-lg — 200ms ease
  Nav:       backdrop-blur + smooth scroll spy
```

---

## Navigation — Floating Pill Navbar

```
 ·····················································
 .                                                   .  ← 16px gap from top
 .  ╔═══════════════════════════════════════════╗   .
 .  ║  ✂️ djaitin    Fitur  Cara Kerja  Harga  [Masuk]  ║
 .  ╚═══════════════════════════════════════════╝   .
 .    ↑ rounded-full, backdrop-blur, shadow-xl       .
 .    ↑ bg: rgba(255,255,255,0.8)                    .
 ·····················································
```

- **Position:** `fixed top-4 left-1/2 -translate-x-1/2` → centered floating pill
- **Width:** `max-w-3xl w-full mx-4`
- **Style:** `rounded-full bg-white/80 backdrop-blur-md shadow-xl border border-violet-100`
- **Active link:** `text-indigo-600 font-semibold`
- **CTA button:** `bg-indigo-600 text-white rounded-full px-5 py-2 hover:bg-indigo-700`

---

## Section 1 — Hero

```
┌─────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════╗              │
│  ║  ✂️ djaitin   Fitur  Cara Kerja  [Masuk] ║  ← floating│
│  ╚═══════════════════════════════════════╝              │
│                                                         │
│                                                         │
│          Kelola Bisnis Jahit              ✂️ 3D icon    │
│          Lebih Rapi, Lebih Cepat.                       │
│                                                         │
│    Sistem informasi end-to-end untuk tailor,            │
│    konveksi, dan pakaian siap pakai.                    │
│                                                         │
│    ┌──────────────────┐  ┌──────────────────┐          │
│    │  Mulai Gratis →  │  │  Lihat Demo      │          │
│    └──────────────────┘  └──────────────────┘          │
│    ↑ indigo-600 rounded-full   ↑ outline variant        │
│                                                         │
│    ─────────────────────────────────────────────        │
│    ✓ DP otomatis 50%   ✓ Stok real-time   ✓ Laporan    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [Floating App Preview — glassmorphism mockup]  │   │
│  │                                                 │   │
│  │   ┌──────────────┐  ┌──────────┐ ┌──────────┐  │   │
│  │   │ Dashboard    │  │ Rp 48M   │ │ 24 Aktif │  │   │
│  │   │ Order Baru   │  │ Omzet    │ │ Orders   │  │   │
│  │   └──────────────┘  └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│    bg: linear-gradient(135deg, #6C63FF22, #A89CFF22)    │
│    border-radius: 2rem, box-shadow: 0 40px 80px #6C63FF29│
└─────────────────────────────────────────────────────────┘
```

---

## Section 2 — Stats / Social Proof

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│   │   500+     │  │   3 Modul  │  │   99.9%    │       │
│   │  Transaksi │  │ Tailor·RTW │  │  Uptime    │       │
│   │  per Bulan │  │ ·Konveksi  │  │            │       │
│   └────────────┘  └────────────┘  └────────────┘       │
│   bg: white, rounded-2xl, shadow-sm, border-violet-50   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Section 3 — Features (3-column cards)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    Semua yang Anda Butuhkan                             │
│    untuk Bisnis Jahit Modern                            │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │  ✂️           │ │  👕           │ │  🏭           │    │
│  │  Tailor      │ │  Ready-to-   │ │  Konveksi    │    │
│  │  Custom      │ │  Wear        │ │  Massal      │    │
│  │              │ │              │ │              │    │
│  │ Ukuran &     │ │ Stok, diskon,│ │ Full payment │    │
│  │ model pelang-│ │ clearance,   │ │ gate, produksi│   │
│  │ gan tersimpan│ │ checkout     │ │ s/d pengiriman│   │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │  💳           │ │  📊           │ │  👥           │    │
│  │  Pembayaran  │ │  Laporan     │ │  RBAC        │    │
│  │  Terverifikasi│ │  Real-time   │ │  4 Peran     │    │
│  │              │ │              │ │              │    │
│  │ Cash/transfer│ │ Omzet, stok, │ │ Kasir, Prod, │    │
│  │ audit trail  │ │ loyal customer│ │ Admin, Owner │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│  Cards: bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg│
└─────────────────────────────────────────────────────────┘
```

---

## Section 4 — How It Works (Timeline / Steps)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    Cara Kerja djaitin                                   │
│                                                         │
│   ①────────────②────────────③────────────④            │
│                                                         │
│   [Buat Order]  [Bayar DP]  [Produksi]  [Serah Terima] │
│                                                         │
│   Kasir input   Sistem cek  Tim produksi Order ditutup  │
│   pesanan &     DP ≥ 50%   update status otomatis      │
│   ukuran        otomatis    real-time    saat lunas     │
│                                                         │
│   Line: gradient indigo-to-violet, h-1px               │
│   Circles: 40px, bg-indigo-600, text-white, shadow-md  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Section 5 — CTA Banner

```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐   │
│  │  bg: linear-gradient(135deg, #6C63FF, #A89CFF)  │   │
│  │  rounded-3xl  mx-8  p-16                        │   │
│  │                                                 │   │
│  │     Siap Digitalisasi Bisnis Anda?              │   │
│  │                                                 │   │
│  │     ┌──────────────────────┐                   │   │
│  │     │  Mulai Sekarang →   │  bg-white          │   │
│  │     │  text-indigo-600     │  rounded-full      │   │
│  │     └──────────────────────┘                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Footer

```
┌─────────────────────────────────────────────────────────┐
│  ✂️ djaitin          Produk    Perusahaan   Kontak      │
│                       Fitur     Tentang     Email        │
│                       Harga     Tim         WhatsApp     │
│                                                         │
│  © 2026 djaitin. All rights reserved.                   │
└─────────────────────────────────────────────────────────┘
```
