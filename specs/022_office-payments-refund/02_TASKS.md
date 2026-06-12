# Office Payments Refund — Tasks

## 0. Audit

- [ ] `git status --short` bersih untuk file scope ini.
- [ ] Branch sesuai (mis. feature branch dari `main`).
- [x] Inspect model/controller/service/policy/page/test terkait.
- [x] Catat apa yang sudah ada vs yang belum.

## 1. Schema / Model

- [x] Migrasi additive (kalau perlu) sesuai `docs/02_DATABASE_SCHEMA.md`.
- [x] Cast/relation/scope di model.
- [x] Factory + state untuk Pest.

## 2. Authorization & Validation

- [x] Middleware role di rute.
- [x] Policy + register di `AuthServiceProvider`.
- [x] Ownership check (untuk customer area).
- [x] FormRequest dengan rules + relasi cross-ownership.

## 3. Service / Business Logic

- [x] Implement/extend Service class sesuai arsitektur (`app/Services/*`).
- [x] Bungkus mutasi multi-tabel di transaction.
- [x] Side effect (status/stock/audit) lewat service yang ditunjuk.
- [x] Audit log untuk aksi office sensitif.

## 4. Routes / Controller / UI

- [x] Tambah/ubah route di `routes/customer.php` atau `routes/office.php`.
- [x] Controller tipis + return Inertia render/redirect.
- [x] Page React di `resources/js/pages/...`.
- [x] Reuse komponen UI yang ada.
- [x] Ikuti blueprint halaman + design taste.

## 5. Tests

- [x] Happy path.
- [x] Validation failure.
- [x] Authorization/role failure.
- [x] Ownership failure (untuk customer area).
- [x] Side effect penting (status/stock/payment/refund/audit).

## 6. Finalization

- [ ] `vendor/bin/pint --test`.
- [ ] `php artisan test --compact --filter=...`.
- [ ] `php artisan test --compact`.
- [ ] `npm run types:check` + `npm run lint:check` + `npm run format:check` (kalau frontend berubah).
- [ ] Update `02_TASKS.md` checkboxes.
- [ ] Update CHANGELOG/docs kalau relevan.
- [ ] Periksa `git diff` final.
