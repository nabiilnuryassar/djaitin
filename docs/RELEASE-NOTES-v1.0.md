# Release Notes — SIM Convection Taylor Djaitin v1.0

**Tanggal:** 2026-04-01  
**Status:** MVP Release Candidate / Baseline Release

## Highlight Rilis

Rilis v1.0 menandai selesainya baseline MVP untuk SIM Convection Taylor Djaitin. Sistem kini mencakup alur customer, office, payment, production, shipping, notifications, reports, dan admin modules dalam satu platform.

## Yang Sudah Tersedia

### Customer Portal

- registrasi, login, forgot password, verify email
- dashboard customer
- profile center terintegrasi: profil, alamat, ukuran
- tailor configurator dengan draft flow
- ready-to-wear catalog, cart, checkout
- convection request flow
- riwayat pesanan dan detail order
- upload dan re-upload bukti transfer
- notification center
- mobile bottom navigation

### Office App

- dashboard operasional
- customer management
- tailor order dari office
- order detail, update status, dan production stage
- payment management
- production board
- shipping management
- report dan analytics
- audit log

### Admin Modules

- internal user management
- RTW product management
- fabric, garment model, dan courier master data
- discount policy management

### Dokumen dan Export

- nota PDF
- kwitansi PDF
- report export PDF / CSV

## Business Rules yang Sudah Aktif

- ownership customer enforced
- tailor hanya bisa `in_progress` setelah minimal 50% verified payment
- convection hanya bisa `in_progress` setelah full verified payment
- RTW stock berkurang setelah verified payment
- notification customer hanya untuk owner data terkait

## Verifikasi Baseline

- full test suite: `112 passed`
- total assertion: `782`
- `npm run build`: pass
- `npm run types:check`: pass

## Hotfix Penting Menjelang Rilis

- export PDF/CSV dan dokumen transaksi tidak lagi di-trigger melalui Inertia visit
- auth verification redirect test telah diselaraskan dengan flow customer dashboard `/app/dashboard`

## Known Operating Notes

- starter accounts production sebaiknya dibuat lewat `ProductionStarterSeeder`, bukan `DemoSystemSeeder`
- `DemoSystemSeeder` tetap dipakai untuk environment demo / local showcase
- setelah starter accounts dibuat, password harus segera dirotasi

## Rekomendasi Setelah Rilis

1. jalankan soft launch dengan user terbatas
2. review payment pending dan overdue order setiap hari
3. catat hotfix sprint terpisah untuk improvement pasca-live
