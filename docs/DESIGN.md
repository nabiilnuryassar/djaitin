# Design System: djaitin — Garment Operating System
**Project ID (Stitch):** 15239369450750492306

---

## 1. Visual Theme & Atmosphere

**Creative Direction: "Structured Craft Clarity"**

djaitin adalah Sistem Informasi Manajemen untuk bisnis garmen. Tone visualnya berada di persilangan antara *premium SaaS yang bersih* dan *kehangatan craft tekstil*. Bayangkan sebuah workshop tailor kelas atas: presisi, terorganisir, bersih—tapi terasa manusiawi karena ada tekstur kain, jahitan yang terlihat, dan aksen warna yang hangat.

**Bukan:** startup generic gradien purple-pink. **Bukan:** software enterprise yang dingin. **Adalah:** sistem operasional garmen yang terasa profesional, bisa dipercaya, dan relevan dengan bisnis aslinya.

**Karakter visual:**
- **Section terang** → terasa seperti kain katun putih bersih — crisp, airy, minimal noise
- **Section gelap** → terasa seperti lapisan dalam jas navy premium — dalam, mewah, terpercaya  
- **Aksen emas** → seperti jahitan benang emas berkualitas — punctuasi visual yang tidak berlebihan

---

## 2. Color Palette & Roles

### Primary: Trust Blue (dari logo djaitin)
| Token | Hex | Penggunaan |
|---|---|---|
| Brand Cobalt | `#2563EB` | Semua CTA primer, link aktif, interactive elements |
| Deep Navy | `#1B5EC5` | Hover state, pressed state, underline link |
| Midnight Navy | `#162044` | Hero background, dark section bg, footer, sidebar |
| Royal Mist | `#EFF4FF` | Background section terang (tinted white) |
| Pale Sky | `#DBEAFE` | Container warna primer, badge background |

### Accent: Djaitin Gold (dari logo djaitin)
| Token | Hex | Penggunaan |
|---|---|---|
| Djaitin Gold | `#F9C11A` | Visual accent, badge highlight, CTA di atas navy bg |
| Warm Amber | `#D97706` | Accent hover, strong emphasis |
| Golden Glow | `#FEF3C7` | Warm highlight fill on light backgrounds |

### Neutrals
| Token | Hex | Penggunaan |
|---|---|---|
| Deep Ink | `#0F172A` | Body text di background terang (contrast 19:1 ✅) |
| Slate Medium | `#475569` | Secondary text, deskripsi, caption |
| Steel Mist | `#94A3B8` | Placeholder, disabled, subtle borders |
| Cloud White | `#F8FAFF` | Page background global (sedikit blue-tinted) |
| Pure White | `#FFFFFF` | Card surface, input background |

### Status / Operational Colors
| Status | Background | Text | Kontras |
|---|---|---|---|
| VERIFIED / CLOSED | `#D1FAE5` | `#065F46` | 7.2:1 ✅ |
| PENDING / IN_PROGRESS | `#FEF3C7` | `#78350F` | 8.1:1 ✅ |
| REJECTED / CANCELLED | `#FFE4E6` | `#9F1239` | 7.6:1 ✅ |
| TAILOR badge | `#DBEAFE` | `#1B5EC5` | 5.8:1 ✅ |
| RTW badge | `#E0F2FE` | `#0369A1` | 6.4:1 ✅ |
| KONVEKSI badge | `#EDE9FE` | `#7C3AED` | 5.2:1 ✅ |
| LOYALTY 🏅 | `#FEF3C7` | `#78350F` | 8.1:1 ✅ |

> ⚠️ **PENTING:** Semua badge WAJIB memiliki kontras minimum 4.5:1 antara text dan background. Tidak ada `text-white/72` di atas background abu-abu atau terang. Tidak ada `text-slate-600` di atas `bg-[#f5dde7]` tanpa cek kontras.

---

## 3. Typography Rules

**Heading Font:** Plus Jakarta Sans (diakui di logo "Djaitin" wordmark)
**Body Font:** Inter

| Level | Size | Weight | Tracking | Penggunaan |
|---|---|---|---|---|
| Hero Display | 56–72px | 800 | -0.03em | Hero headline utama |
| H2 Section | 40–48px | 700 | -0.02em | Section title |
| H3 Sub | 28–32px | 600 | -0.01em | Subsection, card title |
| Body Large | 18px | 400 | 0 | Deskripsi utama |
| Body | 16px | 400 | 0 | Konten biasa |
| Label/Micro | 12–13px | 600 | +0.06em | Uppercase eyebrow label |

**Aturan:**
- Eyebrow label (kicker text) → selalu UPPERCASE, tracking lebar, font-size 12-13px
- Jangan pakai Outfit font
- Hanya Plus Jakarta Sans untuk heading, Inter untuk body

---

## 4. Component Stylings

### Buttons
- **Primary (Biru):** Fill `#2563EB`, text `#FFFFFF`, `rounded-xl`, shadow `0 4px 14px rgba(37,99,235,0.25)`. Hover: `#1B5EC5`, scale(1.01)
- **Accent (Gold) — Untuk CTA di atas navy background:** Fill `#F9C11A`, text `#162044`, `rounded-xl`. Hover: `#D97706`
- **Secondary (Outline):** Border `#2563EB`, text `#2563EB`, transparent bg. Hover: `bg-[#EFF4FF]`
- **Ghost:** Transparent semua, text `#2563EB`. Tertiary actions only.

### Cards / Containers
- **Card default (terang):** `bg-white`, `rounded-2xl`, border `1px solid rgba(15,23,42,0.06)`, shadow `0 2px 8px rgba(15,23,42,0.06)`
- **Card dark:** `bg-[#162044]`, `rounded-2xl`, border `1px solid rgba(255,255,255,0.08)`
- **Card tinted:** `bg-[#EFF4FF]` atau `bg-[#FEF3C7]`, sama shadow & radius
- **Stat Card (premium):** `bg-[#162044]` dark background, angka besar `#F9C11A` gold, label `text-white/70`
- **Glassmorphism:** `bg-white/85 backdrop-blur-md` — HANYA untuk navbar floating dan overlay di atas foto/hero gelap

### Inputs / Forms
- Background: `#FFFFFF`. Border: `1.5px solid #CBD5E1`. Radius: `rounded-lg`
- Focus: border `#2563EB`, ring `2px rgba(37,99,235,0.15)`
- Placeholder: `#94A3B8`

---

## 5. Layout Principles

**Grid:** Max-width 1280px, centered, padding horizontal 40px desktop / 24px mobile

**Section rhythm (bergantian):**
1. `bg-white` — primary section
2. `bg-[#EFF4FF]` (Royal Mist) — alternating tinted
3. `bg-white` — back to clean
4. `bg-[#162044]` (Midnight Navy) — dark sections (manifesto alt, reports, CTA)

**Spacing section:** `py-24 md:py-32` (96px / 128px)

**Navbar Desktop (Floating Pill):**
- `fixed top-4 left-1/2 -translate-x-1/2`
- `bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-xl`
- Logo kiri, nav links tengah (desktop), CTA kanan
- Setelah scroll 80px: `bg-white/98 shadow-md`

**Bottom Bar Mobile (Floating — NEW):**
- `fixed bottom-0 inset-x-0 z-50 md:hidden`
- `bg-white/95 backdrop-blur-sm border-t border-slate-100`
- `shadow-[0_-4px_20px_rgba(0,0,0,0.08)]`
- `pb-safe` (safe-area-inset-bottom untuk iPhone notch)
- Height: 64px + safe area
- 5 items: Home, Layanan, Alur, Peran, Masuk
- Active: `text-[#2563EB]` + icon filled. Inactive: `text-[#94A3B8]`

**Whitespace Philosophy:** Generous. Minimum 48px antara section content. Bento grid dengan gap 24-32px.

---

## 6. Contrast Fixes (Known Issues)

| Lokasi | Masalah | Fix |
|---|---|---|
| Hero text overlay | `text-white/72` di atas frame gelap — OK jika bg < 30% luminance | Pastikan bg cukup gelap |
| Manifesto card | `text-slate-600` di atas `bg-[#f1efe9]` | Ganti dengan `#475569` min (contrast check) |
| Section pink `bg-[#f5dde7]` | `text-slate-600` → contrast 3.8:1 ❌ | Ganti dengan `text-[#374151]` |
| ReportsShowcase | `text-white/60` → ratio 2.5:1 ❌ | Minimum `text-white/80` di atas `#101320` |
| Badge `bg-white/10 text-white/86` | Pada bg dark, OK. Pada bg terang, FAIL | Jangan gunakan di section terang |
| CountUpStat di dark bg | Pastikan label text `text-white/70` min | Check bg color actual per section |

---

## 7. Anti-AI-Slop Checklist

- ❌ JANGAN pakai `from-purple-500 to-pink-500` atau `from-violet-600 to-indigo-400`
- ❌ JANGAN pakai floating orbs/blob backgrounds sebagai dekorasi
- ❌ JANGAN pakai copy: "Empower your workflow", "Seamless experience", "Next-level solution"
- ❌ JANGAN pakai color palette kopi/kafe (terracotta, warm beige agresif)
- ❌ JANGAN pakai Font Outfit
- ❌ JANGAN fake social proof atau logo perusahaan rekaan
- ✅ GUNAKAN stitching pattern (dashes) sebagai brand texture pada hero atau divider
- ✅ GUNAKAN bento grid untuk feature showcase
- ✅ GUNAKAN editorial copy yang konkret dan spesifik (angka nyata dari PRD)
- ✅ SELALU cek kontras minimum 4.5:1 untuk semua text
- ✅ Bottom bar di mobile, floating pill di desktop

---

*Generated via skill design-md | Stitch MCP djaitin Landing Page Project*
*Logo analysis: Royal Blue #2563EB + Golden Yellow #F9C11A (Djaitin brand colors)*
