# Auth Foundation — Tasks

## 0. Audit

- [ ] `git status --short` bersih untuk file scope ini.
- [ ] Branch sesuai (mis. feature branch dari `main`).
- [ ] Inspect model/controller/service/policy/page/test terkait.
- [ ] Catat apa yang sudah ada vs yang belum.

## 1. Schema / Model

- [ ] Migrasi additive (kalau perlu) sesuai `docs/02_DATABASE_SCHEMA.md`.
- [ ] Cast/relation/scope di model.
- [ ] Factory + state untuk Pest.

## 2. Authorization & Validation

- [ ] Middleware role di rute.
- [ ] Policy + register di `AuthServiceProvider`.
- [ ] Ownership check (untuk customer area).
- [ ] FormRequest dengan rules + relasi cross-ownership.

## 3. Service / Business Logic

- [ ] Implement/extend Service class sesuai arsitektur (`app/Services/*`).
- [ ] Bungkus mutasi multi-tabel di transaction.
- [ ] Side effect (status/stock/audit) lewat service yang ditunjuk.
- [ ] Audit log untuk aksi office sensitif.

## 4. Routes / Controller / UI

- [ ] Tambah/ubah route di `routes/customer.php` atau `routes/office.php`.
- [ ] Controller tipis + return Inertia render/redirect.
- [ ] Page React di `resources/js/pages/...`.
- [ ] Reuse komponen UI yang ada.
- [ ] Ikuti blueprint halaman + design taste.

## 5. Tests

- [ ] Happy path.
- [ ] Validation failure.
- [ ] Authorization/role failure.
- [ ] Ownership failure (untuk customer area).
- [ ] Side effect penting (status/stock/payment/refund/audit).

## 6. Finalization

- [ ] `vendor/bin/pint --test`.
- [ ] `php artisan test --compact --filter=...`.
- [ ] `php artisan test --compact`.
- [ ] `npm run types:check` + `npm run lint:check` + `npm run format:check` (kalau frontend berubah).
- [ ] Update `02_TASKS.md` checkboxes.
- [ ] Update CHANGELOG/docs kalau relevan.
- [ ] Periksa `git diff` final.
