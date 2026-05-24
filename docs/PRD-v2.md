# PRD v2 — SIM Convection Taylor Djaitin

**Versi:** 2.0  
**Tanggal:** 2026-05-24  
**Status:** Ready for MVP Operasional  
**Mengganti:** `draft-prd-system.md` (v1.0)

---

## 0. Catatan Versi

PRD v1.0 (`draft-prd-system.md`) adalah **narasi bisnis pendek** yang menjadi titik awal pengembangan. Selama implementasi, sistem berkembang melampaui draft awal untuk memenuhi kebutuhan riil operasional konveksi-taylor Djaitin. PRD v2 ini mengakui dan memformalkan kapabilitas tambahan tersebut sebagai bagian dari MVP, sehingga dokumen produk selaras dengan sistem yang benar-benar berjalan.

---

## 1. Tujuan Bisnis (carry-over dari v1)

Djaitin adalah Sistem Informasi Manajemen untuk usaha pakaian dengan tiga lini bisnis:

1. **Tailor** — jahit pakaian custom sesuai ukuran pelanggan.
2. **Ready-to-Wear (RTW)** — penjualan pakaian siap pakai dari katalog.
3. **Convection** — pesanan konveksi massal (seragam instansi swasta/pemerintah, jaket, topi, emblem, kaos, dan produk jahit lain).

Tujuan modernisasi yang dicakup:

- modernisasi **administrasi** order, pembayaran, dan dokumen
- modernisasi **penjualan** lewat katalog digital dan pemesanan online
- modernisasi **pelayanan** dengan notifikasi terstruktur dan tracking pesanan
- modernisasi **pemasaran** *(out-of-MVP, di-roadmap untuk fase berikutnya)*

---

## 2. Aturan Bisnis Inti

Aturan-aturan ini berasal dari narasi v1 dan diimplementasikan tanpa kompromi:

### 2.1 Tailor
- DP awal **minimal 50%** dari total biaya order.
- Order **tidak boleh masuk produksi** hingga pembayaran diverifikasi minimal 50%.
- Order **tidak boleh ditutup** selama masih ada outstanding amount.
- **Loyalty discount 20%** otomatis aktif untuk customer yang sudah memiliki **lebih dari 5** order tailor closed (mulai aktif di order ke-6).

### 2.2 Ready-to-Wear
- Stok divalidasi saat checkout.
- **Stok berkurang hanya setelah** pembayaran diverifikasi (idempotent).
- Customer dapat memilih `pickup` atau `delivery`.
- **Ongkir delivery** mengikuti `base_fee` dari master courier — **tanpa markup toko**.

### 2.3 Convection
- Pesanan konveksi **wajib lunas penuh** sebelum dapat masuk produksi.
- Lampiran desain/referensi dikelola lewat order attachment.

### 2.4 Pembayaran
- **Cash**: otomatis ditandai `verified` saat dicatat kasir.
- **Transfer**: status `pending verification` sampai diverifikasi kasir/admin berdasarkan bukti transfer.
- **Kwitansi** hanya tersedia untuk pembayaran ber-status `verified`.
- **Nota** order tersedia setelah ada minimal satu pembayaran verified.

### 2.5 Clearance Pricing *(baru di v2)*
- Produk RTW yang ditandai `is_clearance` **boleh dijual sampai harga pokok**, tetapi **tidak boleh di bawah harga pokok**.
- Validasi cross-field di Store/UpdateProductRequest mencegah `selling_price - discount_amount < base_price`.

---

## 3. Pengguna & Role

| Role | Surface | Hak Akses |
|---|---|---|
| **Customer** | `/app` | Dashboard, tailor configurator, katalog, checkout, convection request, payment proof upload, profile/address/measurement, notification center |
| **Kasir** | `/office` | Order, payment verify/reject, customer, production view, shipping update |
| **Produksi** | `/office` | Order, production board (update stage) |
| **Admin** | `/office` + `/office/admin` | Operasional penuh + master data, user management, product management, discount policy, settings |
| **Owner** | `/office` + `/office/admin` | Akses baca strategis, dashboard, audit log, reports |

---

## 4. Capabilities Inti (carry-over dari v1)

### 4.1 Customer App
- Register / login (Fortify).
- Browse landing + service info pages.
- Tailor configurator multi-step.
- Katalog RTW + product detail.
- Convection request form.
- Submit order tailor / RTW / convection.
- Upload bukti transfer.
- Tracking order + payment.

### 4.2 Office App
- Dashboard operasional.
- Manajemen order (filter, search, detail, status).
- Pencatatan & verifikasi pembayaran.
- Production board.
- Shipping & resi.
- Cetak nota & kwitansi (PDF).

### 4.3 Master Data
- Garment models (9 default: Kemeja, Tunik, Jaket, Topi, Kaos, Seragam Sekolah, Seragam Kerja, Rok, Celana).
- Fabrics.
- Couriers.
- Discount policies (loyalty threshold + percentage).

---

## 5. Capabilities Tambahan *(formalisasi dari implementasi v2)*

Sistem mengimplementasikan capabilities berikut sebagai **enabler** untuk tujuan modernisasi v1. Capabilities ini tidak dirinci di draft v1 namun **mendukung tujuan PRD secara langsung** dan menjadi bagian MVP.

### 5.1 Security & Identity
| Capability | Rasional |
|---|---|
| **Two-Factor Authentication** | Baseline keamanan akun staff Djaitin. Built-in via Laravel Fortify. |
| **Role-based Access Control** (5 role) | Memisahkan tanggung jawab kasir/produksi/admin/owner sesuai SOP. |

### 5.2 Audit & Decision Support
| Capability | Rasional |
|---|---|
| **Polymorphic Audit Log** | Mendukung tujuan v1 "modernisasi administrasi" dan menjadi sumber dispute resolution. UI di `/office/audit-log`. |
| **Reports + Export PDF/CSV** | Mendukung tujuan v1 "evaluasi" — owner dapat memantau omzet, payment breakdown, order funnel, customer loyal. |

### 5.3 Customer Experience
| Capability | Rasional |
|---|---|
| **Notification Center** | 5 notification class (PaymentVerified/Rejected, Order InProgress/Ready/Shipped). Mendukung tujuan v1 "modernisasi pelayanan". |
| **Address Book Multi-Alamat** | Mendukung kebijakan v1 "antar ke alamat" customer. Default address otomatis dipilih saat checkout delivery. |
| **Reusable Measurement** | Mendukung kebijakan v1 "data ukuran terdokumentasi" — customer simpan ukuran sekali, pakai berulang. |

### 5.4 Order Workflow
| Capability | Rasional |
|---|---|
| **Draft Order Workflow** | Customer dapat menyimpan konfigurasi tailor sebagai draft (jsonb payload) sebelum siap submit. |
| **Granular Production Stage** | Enum `design → material → production → qc → packing → shipping`. Mendukung kebijakan v1 "tanggal selesai" dan transparansi seluruh pipeline order dari desain hingga pengiriman. |
| **Order Cancellation Tracking** | Kolom `cancellation_reason` / `cancelled_by` / `cancelled_at` untuk audit trail pembatalan. |
| **Order Attachment Review** | Kategori `reference / proposal / revision / final` + reviewer + linked attachment ID. Mendukung iterasi desain konveksi sesuai narasi v1. |
| **Shipment Lifecycle** | Model `Shipment` + enum `pending / shipped / delivered / pickup`. Mendukung kebijakan v1 "antar ke alamat / pickup". |

### 5.5 RTW E-commerce Flow
| Capability | Rasional |
|---|---|
| **Cart + CartItem** | Memungkinkan customer kumpulkan beberapa produk RTW sebelum checkout. Sesuai pola e-commerce standar. |
| **Tailor Pricing Composite** | Formula `garment.base_price + fabric.price_adjustment` agar pricing tailor dinamis tanpa hardcode. |

---

## 6. Kapabilitas yang Sengaja Ditunda

| Item | Status | Catatan |
|---|---|---|
| Modul pemasaran (campaign, broadcast, content marketing) | Roadmap fase berikutnya | Tidak menghalangi MVP. Manual marketing masih dapat dilakukan oleh tim. |
| Discount policy audit log granular | Tech debt | Audit log saat ini tidak mencatat perubahan threshold/percentage discount. Akan dilengkapi di iterasi berikutnya. |
| Order quotation legacy (`quotation_notes`, `quoted_by`, `quoted_at` di tabel `orders`) | DB tech debt | Kolom ada di schema namun tidak terhubung ke flow aktif. Akan di-drop di migration cleanup post-MVP. |
| SOP "verify after dana diterima" eksplisit di UI | Doc/operasional | Logika sudah dienforce di service layer; perlu tambah hint UI dan SOP tertulis. |

---

## 7. Non-Functional Requirements

- **Stack**: Laravel 12 + PHP 8.4, Inertia v2 + React 19 + Tailwind v4, PostgreSQL 16, Vite, Wayfinder, Fortify.
- **Deployment**: Docker Compose (`app`, `nginx`, `worker`, `scheduler`, `postgres`).
- **Bahasa operasional**: Indonesia.
- **Browser support**: modern browser (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+).
- **Dokumen output**: PDF (nota, kwitansi) via barryvdh/laravel-dompdf.
- **Email transactional**: SMTP (verify email, password reset).
- **Security baseline**: 2FA, hashed password (bcrypt), CSRF token, role middleware, FormRequest validation, dependency `composer audit` clean.

---

## 8. Verifikasi & Acceptance

| Verifikasi | Status |
|---|---|
| Pest test suite (`php artisan test --compact`) | ✅ 112 pass, 782 assertions |
| Frontend build (`npm run build`) | ✅ |
| Type check (`npm run types:check`) | ✅ |
| Composer security audit | ✅ 0 vulnerabilities (post 2026-05-24 update) |
| E2E browser test (89 pages × 6 roles) | ✅ 82 OK, 6 forbidden (correct role-block), 1 auth-redirect (correct guard), 0 error |

---

## 9. Glossary

| Istilah | Definisi |
|---|---|
| **DP** | Down Payment, pembayaran awal minimal 50% untuk tailor |
| **Outstanding amount** | Sisa tagihan = total order − total payment verified |
| **Closed order** | Order dengan status `closed` (selesai dan lunas) |
| **Clearance** | Status produk RTW yang dijual dengan harga diskon, minimal sama dengan harga pokok |
| **Verified payment** | Pembayaran yang sudah dicatat kasir (cash) atau divalidasi (transfer) |

---

## 10. References

- `USER-MANUAL.md` — manual book operasional staff & customer
- `routing-and-pages.md` — peta route + Inertia page tree
- `MVP-READINESS.md` — verifikasi kesiapan MVP
- `DEPLOYMENT-RUNBOOK.md` — panduan deploy
- `gap-analysis-draft-prd-vs-system.md` — gap analysis PRD v1 vs system + status closure
- `database-schema.md` — skema database
- `MVP-APP-UML-AND-USE-CASES.md` — UML use case
