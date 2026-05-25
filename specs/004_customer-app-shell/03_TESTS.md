# Customer App Shell — Test Plan

## Commands

```bash
vendor/bin/pint --test
php artisan test --compact --filter=CustomerAppShellTest
php artisan test --compact
npm run types:check
npm run lint:check
npm run format:check
```

## Pest Coverage

### Access & Ownership

- [ ] Role yang berhak bisa membuka halaman/aksi.
- [ ] Role yang tidak berhak mendapat 403/redirect.
- [ ] Customer A tidak bisa mengakses record customer B.
- [ ] Office role yang tidak punya policy untuk action tertentu ditolak.

### Validation

- [ ] Required field ditolak.
- [ ] Format invalid ditolak.
- [ ] Relasi tidak valid (mis. ID milik customer lain) ditolak.
- [ ] Status transition ilegal ditolak.

### Business Logic

- [ ] Happy path mutasi sukses dan side effect benar.
- [ ] Service yang sesuai dipakai (bukan logic ad hoc).
- [ ] Audit log tercatat untuk aksi sensitif.
- [ ] Side effect stok/order/payment sesuai aturan.

### Frontend Smoke

- [ ] Inertia page render dengan data yang minimal.
- [ ] Empty state, loading state, error state ada.
- [ ] Toast/flash sesuai feedback.

### Regression

- [ ] Tidak memecahkan test existing di area lain.
- [ ] Tidak ada file WIP non-scope yang ter-stage.
