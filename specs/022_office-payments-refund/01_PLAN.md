# Office Payments Refund — Implementation Plan

## Read Order

- `docs/00_PRD.md`
- `docs/01_ARCHITECTURE.md`
- `docs/02_DATABASE_SCHEMA.md`
- `docs/03_ROUTES_API.md`
- `docs/04_UI_UX.md`
- `docs/06_DESIGN_TASTE_SYSTEM.md`
- `docs/07_COMPONENT_PATTERNS.md`
- `docs/08_PAGE_BLUEPRINTS.md` (kalau halaman yang relevan ada di sana)
- `docs/05_DEVELOPMENT_RULES.md`
- Spec folder ini (00, 02, 03)

## Inspect Current Code

```bash
git status --short
git branch --show-current
php artisan route:list --path=app
php artisan route:list --path=office
```

Cek file existing terkait sebelum nulis kode (model, controller, service, request, policy, page React, test). Jangan duplikasi class yang sudah ada.

## Implementation Sequence

1. **Audit existing implementation.** Catat apa yang sudah jalan dan apa yang kurang dibanding `00_SPEC.md`.
2. **Schema audit.** Bandingkan dengan `docs/02_DATABASE_SCHEMA.md`. Buat migrasi additive hanya kalau memang ada kolom/index yang kurang.
3. **Model + factory.** Tambah/cast/relation/scope yang diperlukan, plus factory state untuk Pest.
4. **Authorization.** Policy + middleware role + ownership check.
5. **Validation.** FormRequest dengan aturan + cek relasi cross-ownership.
6. **Service layer.** Logic domain di `app/Services/*` yang sesuai. Jangan taruh logic di controller.
7. **Controller + routes.** Tipis. Validate → authorize → service → Inertia render/redirect.
8. **React page + components.** Reuse UI components. Ikuti page blueprint.
9. **Audit log.** Untuk mutasi office/sensitive action.
10. **Tests.** Tutup happy, invalid, unauthorized, ownership/role boundary, dan side effect penting.
11. **Run checks.** Pint, Pest, types, lint, format, build kalau perlu.
12. **Docs.** Update task checkbox + CHANGELOG kalau ada.

## Transaction Boundary

Bungkus mutasi multi-tabel di `DB::transaction()` (mis. order + items + stok, payment + audit, refund + stok release).

## Side Effects

Side effect berat (PDF, broadcast, refund cascade) lewat service yang sesuai. Hindari memutar logic stok/status di luar service yang ditunjuk arsitektur.

## Rollout Smoke Test

1. Pest test relevan hijau.
2. `php artisan route:list` mencerminkan kontrak `docs/03_ROUTES_API.md`.
3. Buka halaman secara manual untuk role yang berhak.
4. Coba akses dengan role/ownership yang tidak berhak — pastikan ditolak.
5. Periksa `git diff` — tidak ada file di luar scope.
