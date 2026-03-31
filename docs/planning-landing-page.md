# Planning — Landing Page djaitin
# Scrollytelling Public Marketing Website

**Tipe:** Public-facing marketing website — **dalam satu codebase Laravel**  
**Framework:** Laravel 12 + Inertia.js v2 + React + TypeScript  
**Style:** Awwwards-level, Scrollytelling, Premium SaaS Product Storytelling  
**Tanggal:** 2026-03-07  

---

## Keputusan Arsitektur

Landing page **tidak** dipisah sebagai project Next.js tersendiri.  
Semua dibangun dalam **satu Laravel app** yang sama dengan internal app.

**Alasan:**
- Satu server, satu deploy — tidak ada overhead 2 infrastructure
- React + Motion + Lenis + Canvas tetap bisa berjalan penuh via Inertia
- Vite sudah ter-setup di Laravel Breeze
- Public route (tanpa auth) cukup dihandle oleh `Route::get('/home', ...)` dan `Route::get('/', ...)`

---

## Konteks & Tujuan

Landing page ini adalah website pemasaran publik untuk produk **djaitin**.  
Tujuannya: membuat calon pengguna (pemilik konveksi/tailor) memahami nilai produk melalui cerita visual yang sinematik dan editorial.

> Bukan toko fashion. Bukan startup generic. Ini adalah **operating system untuk bisnis garmen**.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 12 (routing + controller saja, tidak ada business logic) |
| Frontend | React + Inertia.js v2 + TypeScript |
| Styling | **Tailwind CSS v4** |
| UI Components | **shadcn/ui** — digunakan untuk komponen dasar landing (Button, Badge, Card, Sheet, Dialog, Separator) |
| Animation | **Motion** (Framer Motion v11) — `npm install motion` |
| Smooth Scroll | **Lenis** — `npm install lenis` |
| Canvas/Sequence | HTML5 Canvas (image sequence player) |
| Bundler | Vite (sudah ada via Breeze) |
| Font | Plus Jakarta Sans + Inter — Google Fonts via CSS import |
| Icons | **Lucide React** — `npm install lucide-react` |

### shadcn/ui — Komponen yang Dipakai (Landing)

| Komponen shadcn | Digunakan di |
|---|---|
| `Button` | CTA buttons, floating nav button, footer links |
| `Badge` | Service type badges (Tailor/RTW/Konveksi), status chips |
| `Card` | Bento cards, feature grid cards |
| `Sheet` | Fullscreen navigation menu (mobile/desktop) |
| `Separator` | Divider antar section |
| `Progress` | Stats & count-up visual |

> **Catatan:** shadcn/ui di landing page digunakan sebagai base components saja.
> Animasi, glassmorphism, dan visual premium ditangani oleh Motion + custom CSS.
> Jangan override shadcn default aggressively — extend saja via className.

---

## Palette

```
Primary:   #6C63FF (indigo-violet)
Accent:    #A89CFF (soft violet)
Shell:     #F0EFFF (lavender-light — outer bg)
Sidebar:   #1A1830 (deep navy dark)
Surface:   rgba(255,255,255,0.7) — glassmorphism
```

---

## Routing Laravel (Public — Tanpa Auth)

```php
// routes/web.php
Route::get('/', LandingController::class)->name('landing');
```

```php
// app/Http/Controllers/LandingController.php
class LandingController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Landing/Index');
    }
}
```

> Login route `/login` tetap redirect ke `/dashboard` jika sudah auth.

---

## Struktur File (dalam Laravel app)

```
resources/js/
├── pages/
│   └── Landing/
│       ├── Index.tsx                ← halaman utama landing (semua sections)
│       └── components/
│           ├── SequenceScroll.tsx   ← hero canvas image sequence (CORE)
│           ├── FloatingNavbar.tsx   ← floating pill navbar
│           ├── FullscreenMenu.tsx   ← fullscreen nav overlay
│           ├── TextReveal.tsx       ← scroll-scrub character reveal
│           ├── MagneticButton.tsx   ← magnetic hover CTA button
│           ├── CountUpStat.tsx      ← viewport-triggered count-up
│           ├── RoleSurfaceShowcase.tsx ← 4 role view
│           ├── WorkflowTimeline.tsx ← interactive status stepper
│           ├── TestimonialSlider.tsx ← autoplay persona slider
│           └── LenisProvider.tsx    ← Lenis context wrapper
└── lib/
    └── utils.ts                     ← cn(), clamp(), lerp()

public/
└── sequence/
    ├── ezgif-frame-001.jpg
    ├── ...
    └── ezgif-frame-240.jpg          ← 240 frames image sequence
```

---

## Section Architecture

### 0. Loading Screen (Preloader)
- Centered brand mark **djaitin** + monogram
- Loading percentage count-up (0% → 100%)
- Subtle blur/glow background matching frame 001
- Smooth reveal transition ke hero saat preload selesai
- Awwwards-level, bukan generic spinner

### 1. Hero — SequenceScroll (Scrollytelling Canvas)

**Konsep:** Sticky full-screen canvas memainkan image sequence 240 frame saat user scroll.

```tsx
// Outer container scroll area
<div className="h-[400vh] relative">
  // Canvas sticky inside
  <canvas className="sticky top-0 h-screen w-full object-cover" />
  // Text overlays fade in/out per scroll progress
</div>
```

**Frame Sequence Narrative:**

| Frame Range | Konten |
|---|---|
| 001–040 | Brand reveal, floating UI surfaces, abstract product identity |
| 041–090 | Tailor Order Wizard: customer select, model, fabric, ukuran, loyalty badge, DP ≥ 50% |
| 091–130 | Payment & Order Detail: cash VERIFIED, transfer PENDING, verify/reject states, tabs |
| 131–170 | Ready-to-Wear: product picker, size chips, cart, stock validation, clearance badge |
| 171–205 | Konveksi: company/PIC, items & qty, full 100% payment gate, production stages |
| 206–240 | Dashboard + Reports: omzet, pending transfer, low stock, loyal customer, export CTA |

**Text Overlays (Bahasa Indonesia):**

| Scroll % | Posisi | Copy |
|---|---|---|
| 0% | Center | **"Operasional konveksi yang akhirnya rapi."** |
| 0% | Center sub | "Dari order tailor, stok ready-to-wear, pembayaran, hingga laporan owner — semuanya dalam satu alur yang lebih jelas." |
| 25% | Left | "Tailor: DP minimal 50% tervalidasi sebelum produksi." |
| 50% | Right | "Ready-to-Wear: stok real-time, checkout lebih cepat, clearance tetap terkontrol." |
| 75% | Left | "Konveksi: produksi hanya berjalan setelah pembayaran 100% verified." |
| 90% | Center CTA | "Pantau order, pembayaran, stok, dan laporan dalam satu sistem." + CTA buttons |

**Scroll Logic:**
- `useScroll` dari Motion → map scroll progress ke frame index 1–240
- Image preloading + caching sebelum playback
- Smooth frame lerp (tidak stuttering)
- Cover-fit di mobile dengan focal point terjaga
- Page background wajib match warna frame pertama agar edge invisible

### 2. FloatingNavbar + FullscreenMenu

**Navbar — Floating Pill:**
```tsx
// Posisi: fixed top-4 left-1/2 -translate-x-1/2 z-50
// Style: rounded-full px-6 py-3
//        bg-white/80 backdrop-blur-md
//        shadow-xl border border-violet-100/60
//        max-w-3xl w-[calc(100%-2rem)]

// Isi:
// [Logo ✂️ djaitin]  [Beranda] [Layanan] [Alur Kerja] [Demo]  [Menu ☰]
//  left                    center links (desktop only)          right
```

- Logo: `Plus Jakarta Sans font-bold text-[#1A1830]` + ikon ✂️
- Center links (desktop ≥ 768): `text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors`
- Menu button: shadcn `Button` variant `ghost`, `rounded-full`, teks "Menu" + hamburger icon Lucide
- Scroll behavior: setelah scroll > 80px → `bg-white/95 shadow-md` (lebih solid)
- Transition: `transition-all duration-300`

**Fullscreen Menu (saat buka) — shadcn `Sheet`:**
```tsx
// Gunakan Sheet dari shadcn/ui dengan side="top" atau custom fullscreen
// Atau buat custom overlay dengan Motion AnimatePresence
```
- Full-screen overlay `fixed inset-0 z-[100] bg-[#1A1830]`
- Nav links besar: `text-5xl md:text-7xl font-bold text-white tracking-tight`
- Hover: `hover:text-[#A89CFF]` + subtle skew / translate-x reveal
- Reveal animation: staggers per link, Motion `variants` fadein-up
- Blur + opacity transitions pada backdrop
- Social + contact links di bottom: kecil, elegant
- Close button: pojok kanan atas, `rounded-full bg-white/10 hover:bg-white/20`

Nav items: Beranda / Layanan / Alur Kerja / Peran / Laporan / Demo

### 3. Manifesto / About Section

- **TextReveal.tsx** — karakter/kata reveal progressif berdasarkan scroll scrub
- Copy: pain dari manual notes, missed payment validations, stok kacau → djaitin = sistem terstruktur
- Tone: poetic tapi product-led. Elegant. Tajam. Tidak murahan.

```
Copy direction:
"Catatan di buku. Status di grup WhatsApp. DP belum masuk tapi produksi sudah jalan. 
Stok ready-wear minus satu — dan tidak ada yang tahu. 

djaitin mengubah semua itu menjadi satu alur yang bisa dibaca, dikontrol, dan dipercaya."
```

### 4. Three Services Bento Section

Tiga bento card premium:

| Card | Komunikasikan | Visual |
|---|---|---|
| **Tailor** | Custom order, ukuran history, loyalty, due date, DP gate | Mock wizard mobile |
| **Ready-to-Wear** | SKU, size, stok, cart, clearance, shipping | Mock cart + inventory |
| **Konveksi** | Bulk production, 100% payment gate, QC, packing, pengiriman | Mock wizard + status stages |

Setiap card: strong visual identity, product mockup, benefit statement, badge/chip, hover + parallax + glow.

### 5. Role-Based Surfaces Section

**RoleSurfaceShowcase.tsx:** Tampilkan 4 permukaan berbeda:

| Role | Device | Nav Style |
|---|---|---|
| Kasir / Front Office | Mobile | Bottom floating nav + FAB Create |
| Produksi | Tablet | Navigation rail / compact sidebar |
| Admin | Desktop | Wide floating sidebar + topbar |
| Owner | Desktop | Read-only analytics dashboard |

Setiap role tampil distinct secara visual. Gunakan UI patterns realistis dari PRD.

### 6. Business Rules / Workflow Section

**WorkflowTimeline.tsx:** Interactive stepper visualizing:

- **Tailor:** DRAFT → PENDING_PAYMENT → IN_PROGRESS → DONE → DELIVERED → CLOSED
- **Konveksi:** payment verified first → production stages
- **Payment:** PENDING_VERIFICATION → VERIFIED / REJECTED

**Critical gates** harus tidak mungkin terlewat:
- DP 50% minimum (tailor)
- 100% verified sebelum konveksi produksi
- No close jika outstanding > 0
- No negative stock
- Transfer reject wajib alasan

Sections ini terasa premium dan informatif — bukan dokumentasi text dump.

### 7. KPI / Count-Up Stats

**CountUpStat.tsx:** Trigger saat in-viewport.

Gunakan angka grounded dari PRD (bukan vanity metrics):

| Stat | Value |
|---|---|
| Layanan Inti | 3 |
| Peran Operasional | 4 |
| DP Gate Tailor | 50% |
| Payment Gate Konveksi | 100% |
| Stok Negatif Diizinkan | 0 |

Tipografi besar, premium. Angka animate dari 0 ke nilai target.

### 8. Feature Bento Grid

8 card fitur:

1. Pelanggan & Ukuran
2. Tailor Order Wizard
3. Inventori Ready Stok
4. Verifikasi Pembayaran
5. Pengiriman & Kurir
6. Audit Log
7. Dashboard KPI
8. Export Laporan PDF/CSV

Setiap card = product story slice. Motion, hover depth, layered borders, premium spacing.

### 9. Testimonial / Persona Slider

**TestimonialSlider.tsx:** Autoplay fullscreen slider.

Gunakan persona voices dari PRD (bukan fake enterprise logos):
- Kasir / Front Office
- Admin
- Owner
- Tim Produksi

Copy harus terasa editorial dan realistis — bukan fabricated corporate quote.

### 10. Reports / Analytics Showcase

Visual rich section untuk Admin/Owner visibility:
- Omzet cards
- Payment method breakdown
- Pending transfer alerts
- Low stock alerts
- Loyal customer view
- Export actions (PDF/CSV)

Feel: "business visibility finally unlocked".

### 11. CTA Section

- Animated background + subtle light/glow
- Magnetic CTA button (MagneticButton.tsx)
- Copy:
  - Title: "Semua alur kerja konveksi, tailor, dan RTW dalam satu sistem."
  - Sub: "Lebih rapi untuk kasir. Lebih jelas untuk produksi. Lebih tenang untuk owner."
- Buttons: "Jadwalkan Demo" / "Lihat Modul"

### 12. Footer

- Logo + product links + feature links + contact + social
- Premium spacing dan hover states
- Subtle brand treatment

---

## Badge / Chip Color System

```
TAILOR        → indigo
RTW           → sky
KONVEKSI      → violet
PENDING_PAY   → amber
IN_PROGRESS   → blue
DONE          → indigo
DELIVERED     → teal
CLOSED        → emerald
CANCELLED     → rose
VERIFIED      → emerald
REJECTED      → rose
LOYALTY 🏅    → yellow
```

---

## Microcopy UI

```
"DP minimal 50% dari total biaya"
"Menunggu verifikasi"
"Transfer ditolak"
"Pelunasan diperlukan sebelum serah terima"
"Stok tidak cukup"
"Eligible 20% loyalty"
"Export PDF / CSV"
```

---

## Tailwind v4 Config (Landing Specific)

```css
/* resources/css/landing.css atau masuk ke globals */
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

@theme {
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;

  --color-primary:   #6C63FF;
  --color-accent:    #A89CFF;
  --color-shell:     #F0EFFF;
  --color-sidebar:   #1A1830;

  --radius-pill:     9999px;
  --radius-card:     1.25rem;   /* rounded-2xl */
  --radius-card-lg:  1.5rem;    /* rounded-3xl */
}
```

---

## Interaction Polishing Checklist

- [ ] Lenis smooth scroll global via `LenisProvider.tsx`
- [ ] Canvas image sequence 240 frame dengan preloader Awwwards-level
- [ ] Floating pill navbar + animated fullscreen menu (shadcn Sheet atau custom Motion)
- [ ] Magnetic buttons pada semua CTA utama (`MagneticButton.tsx`)
- [ ] TextReveal scroll-scrub per section (`TextReveal.tsx`)
- [ ] Hover depth + motion layering pada bento cards
- [ ] Premium progress bar / shimmer pada preloader
- [ ] Smooth transition antara Shell (#F0EFFF) dan dark Sidebar (#1A1830) sections
- [ ] Glassmorphism: **hanya di landing page** (navbar, card overlay)
- [ ] App mockup di dalam landing terasa structured, sharp — bukan glossy decoration
- [ ] shadcn Button, Badge, Card terpasang dan ter-theme sesuai brand palette
- [ ] Semua icon dari Lucide React (konsisten, tidak pakai emoji di code)

---

## DO NOT

- ❌ Bahasa "Convection" — gunakan "Konveksi"
- ❌ Coffee brand language, cafe color palette
- ❌ Font Outfit
- ❌ Fake company logo atau fake social proof
- ❌ Generic startup gradient tidak sesuai brand palette
- ❌ Canvas background mismatch dengan page background
- ❌ E-commerce fashion catalog vibe
- ❌ Sacrificing clarity demi efek flashy
- ❌ Install shadcn komponen yang tidak diperlukan landing page
- ❌ Override shadcn default style secara aggressif (extend via className saja)
