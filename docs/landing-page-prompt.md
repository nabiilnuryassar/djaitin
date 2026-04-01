# Master Prompt & Planning: Landing Page Revamp djaitin

**Status:** Ready to Execute  
**Tanggal:** 2026-03-31  
**Referensi:** `docs/DESIGN.md`, `resources/images/logo/logo-djaitin-transparan.png`

---

## Konteks Revamp

Landing page yang ada (`pages/Landing/Index.tsx`) masih menggunakan palette `#6C63FF` (indigo-violet) yang **tidak relate dengan logo djaitin**. Logo menggunakan:
- **Biru Cobalt:** `#2563EB` / `#1B5EC5`
- **Kuning Emas:** `#F9C11A` / `#D97706`

Selain itu ada beberapa isu kontras text, belum ada mobile floating bottom bar, dan beberapa section masih terasa "AI-slop generic".

---

## Master Prompt untuk Eksekusi Revamp

Salin prompt berikut dan kirim ke AI assistant untuk memulai revamp:

---

### 🎯 PROMPT 1: CSS Variables & Global Theme Reset

```
Refactor CSS custom properties di landing page djaitin untuk sesuai dengan brand colors dari logo.

Logo djaitin menggunakan Royal Blue dan Golden Yellow. Update semua CSS variable di landing-layout atau globals.css:

GANTI (hapus indigo/violet):
--landing-primary: #6C63FF  → UBAH KE: #2563EB (Royal Blue)
--landing-accent: #A89CFF   → UBAH KE: #F9C11A (Djaitin Gold)
--landing-shell: #F0EFFF    → UBAH KE: #F8FAFF (Cloud White, sedikit blue-tinted)
--landing-sidebar: #1A1830  → UBAH KE: #162044 (Midnight Navy, lebih dalam)
--landing-surface: rgba(255,255,255,0.7) → tetap sama

TAMBAHKAN variable baru:
--landing-gold: #F9C11A
--landing-blue-deep: #1B5EC5
--landing-navy: #162044
--landing-mist: #EFF4FF
--landing-ink: #0F172A

Pastikan semua usage var(--landing-primary) dan var(--landing-accent) otomatis terupdate.
```

---

### 🎯 PROMPT 2: Mobile Floating Bottom Bar (BARU)

```
Buat komponen MobileBottomBar.tsx di pages/Landing/components/ untuk menggantikan FloatingNavbar di mobile.

Spesifikasi MobileBottomBar:
- Hanya tampil di layar < 768px (md:hidden)
- Position: fixed bottom-0 inset-x-0 z-50
- Style: bg-white/95 backdrop-blur-sm border-t border-slate-100/80
- Shadow: shadow-[0_-4px_20px_rgba(15,23,42,0.08)]
- Height: 64px + env(safe-area-inset-bottom) [untuk iPhone notch/home indicator]
- Items (5 total): Beranda, Layanan, Alur Kerja, Demo, Masuk
- Active state: text-[#2563EB] dengan icon filled variant. Inactive: text-[#94A3B8]
- Label text: text-xs font-medium di bawah setiap icon
- Center item "Demo" → styled sebagai pill button #F9C11A background, text-[#162044], rounded-full px-4 py-2

Gunakan icon Lucide React:
- Beranda: Home
- Layanan: Layers
- Alur Kerja: GitBranch
- Demo (center): Play
- Masuk: LogIn

Tambahkan animasi slide-up dari bawah saat pertama kali render menggunakan Motion (animate={{ y: 0, opacity: 1 }}, initial={{ y: 20, opacity: 0 }}).

Integrasikan MobileBottomBar di Landing/Index.tsx bersamaan dengan FloatingNavbar yang sudah ada.
```

---

### 🎯 PROMPT 3: Perbaikan Kontras Text (Fix Urgent)

```
Perbaiki semua isu kontras text di Landing/Index.tsx yang gagal standar WCAG AA (minimum 4.5:1):

1. Section manifesto bg-[#f1efe9]:
   - GANTI text-slate-600 → text-[#374151] (contrast 6.1:1 ✅)
   - GANTI description di SectionHeading → text-[#374151]

2. Section pink bg-[#f5dde7] (Feature Bento):
   - GANTI text-slate-600 → text-[#374151] (5.8:1 ✅)
   - GANTI title text-[#1A1830] → text-[#111827] (lebih gelap, safe)

3. ReportsShowcase di bg-[#101320]:
   - GANTI text-white/60 → text-white/80 (ratio menjadi 5.4:1 ✅)
   - GANTI text-white/65 → text-white/80
   - GANTI text-white/70 → text-white/80

4. Semua Badge bg-white/10 text-white/86 yang ada di section TERANG:
   - Jika badge ada di atas bg terang (white/mist), ganti ke: bg-[#EFF4FF] text-[#1B5EC5]
   - Jika ada di atas bg gelap (navy/dark), boleh tetap bg-white/10 text-white/86

5. Di SectionHeading component, "light" mode deskripsi:
   - GANTI text-white/72 → text-white/85 minimum

Setelah fix, pastikan tidak ada elemen yang menggunakan opacity < /80 untuk teks konten utama.
```

---

### 🎯 PROMPT 4: Hero & Palette Primary Sections Rebrand

```
Update warna primary sections di Landing/Index.tsx dari indigo/violet ke palette djaitin brand (Cobalt Blue + Gold).

Perubahan spesifik:

A. Manifesto card sidebar (bg-[#7ea4ff]):
   UBAH ke bg-[#2563EB] (solid brand blue)
   - "verified flow" badge: bg-white/20 → OK
   - Heading text: text-white → OK (ratio 19:1)
   - Eyebrow label: text-white/80 → text-white/90

B. Services section accent card (bg-[#d7ff69]):
   Warna ini terlalu neon. UBAH ke salah satu:
   Opsi A: bg-[#FEF3C7] (Golden Glow warm) + teks #78350F
   Opsi B: bg-[#F9C11A] (Djaitin Gold) + teks #162044
   → Pilih Opsi B agar lebih on-brand
   - Eyebrow "Why this matters": text-[#5a7400] → UBAH ke text-[#162044]

C. ServiceCards gradient accent:
   Tailor card: from-[rgba(108,99,255,...)] → UBAH ke from-[rgba(37,99,235,0.22)] (blue)
   RTW card: tetap from-[rgba(14,165,233,...)] (sky) → OK, sudah brand-appropriate
   Konveksi card: tetap from-[rgba(139,92,246,...)] (violet) → OK untuk differentiation

D. WorkflowTimeline section:
   - "Critical gates" eyebrow: text-[#5d4fe6] → UBAH ke text-[#2563EB]
   - Bullet dot: bg-[#5d4fe6] → UBAH ke bg-[#2563EB]
   - bg-[#f1eff8] container → UBAH ke bg-[#EFF4FF] (Royal Mist on-brand)

E. Role section background:
   bg-[#ebe7f4] → UBAH ke bg-[#EFF4FF]
   bg-[#d4cbff] accent corner → UBAH ke bg-[#DBEAFE]

F. CTA section (belum dilihat — pastikan):
   Primary CTA button → bg-[#2563EB] text-white
   Secondary/ghost → outline [#2563EB]
   Background CTA → bg-[#162044] (Midnight Navy) dengan gold accent
```

---

### 🎯 PROMPT 5: Stitch MCP — Update Design System

```
Gunakan Stitch MCP untuk mengupdate design system project "djaitin Landing Page" (project ID: 15239369450750492306).

Langkah:
1. List design systems untuk project ini
2. Jika ada existing design system, update dengan tool update_design_system
3. Jika belum ada, buat baru dengan create_design_system

Parameter design system yang benar:
{
  "displayName": "djaitin Brand System v2",
  "colorMode": "LIGHT", 
  "font": "PLUS_JAKARTA_SANS",
  "bodyFont": "INTER",
  "roundness": "ROUND_EIGHT",
  "customColor": "#2563EB",
  "saturation": 2,
  "designMd": "[isi konten dari docs/DESIGN.md]"
}

Setelah create/update design system, jalankan apply_design_system ke semua screenInstances yang ada di project.
```

---

### 🎯 PROMPT 6: Stitch MCP — Regenerate Mobile Screen

```
Gunakan Stitch MCP untuk membuat screen baru: Mobile Landing Page untuk djaitin.

Context project: "djaitin Landing Page" (ID: 15239369450750492306)

Jalankan mcp_StitchMCP_generate_screen_from_text dengan:
- projectId: "15239369450750492306"  
- deviceType: "MOBILE"
- prompt: [GUNAKAN STITCH FULL PROMPT DI BAWAH INI]

---
[STITCH FULL PROMPT — MOBILE LANDING PAGE]

Design a premium mobile landing page for "djaitin" — a Sistem Informasi Manajemen (SIM) for garment businesses (tailor, ready-to-wear, konveksi) in Indonesia.

BRAND IDENTITY:
- Logo: Two interlocking letterforms (D+J) in Royal Blue (#2563EB) + Golden Yellow (#F9C11A) with dashed stitching detail
- NOT a fashion brand. NOT a startup. This is professional operational software for garment business owners.
- Tone: Confident, structured, craft-authentic, warm professional

COLOR PALETTE (mandatory, no substitution):
- Primary Blue: #2563EB (Royal Blue — from logo)
- Accent Gold: #F9C11A (Golden Yellow — from logo)  
- Dark Navy: #162044 (Midnight deep background)
- Page bg: #F8FAFF (barely-blue white)
- Text: #0F172A (deep ink) on light, #FFFFFF on dark
- DO NOT use purple, violet, indigo, or #6C63FF

MOBILE-SPECIFIC LAYOUT:
1. HERO SECTION (dark navy #162044):
   - djaitin logo (blue + gold) at top left
   - Login button top right (outline, white border)
   - Hero headline (2 lines max): "Operasional konveksi yang akhirnya rapi." (34px bold white)
   - Sub: "Kelola tailor, RTW, dan produksi massal dalam satu sistem terintegrasi." (16px white/85)
   - TWO CTA buttons stacked vertically: Primary gold "Jadwalkan Demo" + Secondary outline "Lihat Fitur"
   - Stitching dashed pattern as subtle background texture

2. FLOATING BOTTOM BAR (always visible, fixed bottom):
   - White/95 background with top border
   - 5 nav items with icons: Home, Layanan, Alur, Peran, Masuk
   - Center "Demo" item: gold pill button
   - Active state: blue icon + blue label
   - 64px height + safe area

3. SERVICES SECTION (white bg):
   - Eyebrow: "LAYANAN INTI" (all caps, small, blue, wide tracking)
   - Headline: "Satu sistem, tiga alur bisnis."
   - 3 vertical cards with colored accent tops:
     Card 1 "Tailor" — Blue accent #DBEAFE, description in slate
     Card 2 "Ready-to-Wear" — Sky accent #E0F2FE
     Card 3 "Konveksi" — Navy accent #162044
   - Each card: badge top-left, title, 2-line desc, 3 feature chips

4. STATS ROW (navy #162044 bg):
   - 3 stats in horizontal scroll: "3 Layanan", "4 Peran", "0 Stok Negatif"
   - Gold large numbers, white labels
   - Rounded cards

5. TESTIMONIAL SECTION (white bg):
   - Single card testimonial
   - Role badge (Kasir/Admin/Owner/Produksi)
   - Quote in italic, black
   - Swipeable dots indicator

6. CTA SECTION (navy bg):
   - Headline white: "Mulai kelola bisnis garmen dengan lebih rapi."
   - Gold CTA button: "Jadwalkan Demo"
   - Stitching pattern texture

TYPOGRAPHY: Plus Jakarta Sans for all headings, Inter for body. NO Outfit.
COMPONENTS: Rounded-xl buttons, rounded-2xl cards. Clean shadows, no heavy gradients.
CONTRAST: All text must meet WCAG AA. Never white text on light bg. Never gray text on colored bg.
ANTI-SLOP: No floating orbs, no generic illustration, no purple gradients, no "Empower" copy.
---
```

---

### 🎯 PROMPT 7: Stitch MCP — Edit Desktop Screen untuk Brand Alignment

```
Edit existing screens di Stitch project djaitin (ID: 15239369450750492306) untuk align dengan brand baru.

Gunakan mcp_StitchMCP_edit_screens dengan target screen ID: 13a65b68175640bda58c9ba3a825adc5

Prompt edit:
"Rebrand all colors from indigo/violet (#6C63FF, #A89CFF, #1A1830) to the official djaitin brand colors:
- Replace all indigo/violet with Royal Blue #2563EB  
- Replace all accent purples with Djaitin Gold #F9C11A
- Replace dark backgrounds #1A1830 with Midnight Navy #162044
- The brand uses Plus Jakarta Sans + Inter typography
- Ensure all text contrast meets WCAG AA minimum 4.5:1
- Maintain the existing layout structure, only update colors and typography"
```

---

## Planning: Urutan Eksekusi

```
Phase 1: Design Foundation (30 mnt)
├── [x] Analisis logo → extract exact brand colors (DONE)
├── [x] Buat docs/DESIGN.md sebagai source of truth (DONE)
├── [ ] Run PROMPT 1: Update CSS variables
└── [ ] Update planning-landing-page.md palette section

Phase 2: Core Fixes (45 mnt)
├── [ ] Run PROMPT 3: Fix semua isu kontras text
├── [ ] Run PROMPT 4: Rebrand primary sections
└── [ ] Audit setiap section dengan browser devtools

Phase 3: Mobile Bottom Bar (30 mnt)
├── [ ] Run PROMPT 2: Buat MobileBottomBar.tsx
├── [ ] Test di viewport 375px (iPhone SE)
├── [ ] Test di viewport 390px (iPhone 14)
└── [ ] Ensure safe-area-inset-bottom working

Phase 4: Stitch MCP Integration (20 mnt)
├── [ ] Run PROMPT 5: Update Stitch design system
├── [ ] Run PROMPT 6: Generate mobile screen di Stitch
└── [ ] Run PROMPT 7: Edit desktop screen alignment

Phase 5: Validation (15 mnt)
├── [ ] Visual check semua section di browser
├── [ ] Run php artisan test --compact (pastikan tidak ada regression)
├── [ ] Check mobile view di DevTools (iPhone SE, iPhone 14, Pixel 7)
└── [ ] Kontras audit final dengan browser accessibility tools
```

---

## File yang Akan Diubah

| File | Perubahan |
|---|---|
| `resources/js/pages/Landing/Index.tsx` | Rebrand colors, fix contrast |
| `resources/js/pages/Landing/components/MobileBottomBar.tsx` | NEW FILE |
| `resources/js/pages/Landing/components/FloatingNavbar.tsx` | Hide on mobile (`hidden md:flex`) |
| `resources/css/app.css` atau `landing.css` | Update CSS variables |
| `docs/DESIGN.md` | NEW FILE (sudah dibuat) |
| `docs/planning-landing-page.md` | Update palette section |

---

## Definisi of Done

- ✅ Semua warna primary adalah `#2563EB` (blue) dan `#F9C11A` (gold), tidak ada lagi `#6C63FF`
- ✅ Mobile view memiliki floating bottom bar yang smooth
- ✅ Tidak ada text yang gagal kontras WCAG AA (min 4.5:1)
- ✅ Semua copy tidak terasa "AI-generic" — spesifik, product-led, dalam Bahasa Indonesia yang tajam
- ✅ Section backgrounds relate ke warna logo (navy `#162044` + mist `#EFF4FF`)
- ✅ `npm run dev` berjalan tanpa error
- ✅ Test Pest tidak ada yang fail

---

*Panduan ini dibuat berdasarkan analisis logo, audit kode Landing/Index.tsx, dan skill design-md + Stitch MCP.*
