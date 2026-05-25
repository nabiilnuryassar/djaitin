# Office App Shell — SPEC

## 1. Purpose

Sidebar/topbar untuk office, role-aware menu, breadcrumb, layout.

Bagian dari roadmap SDD Djaitin. Implementasi wajib mengikuti:

- `docs/00_PRD.md`
- `docs/01_ARCHITECTURE.md`
- `docs/02_DATABASE_SCHEMA.md`
- `docs/03_ROUTES_API.md`
- `docs/04_UI_UX.md`
- `docs/05_DEVELOPMENT_RULES.md`
- `docs/06_DESIGN_TASTE_SYSTEM.md` (untuk UI)
- `docs/07_COMPONENT_PATTERNS.md` (untuk UI)
- `docs/08_PAGE_BLUEPRINTS.md` (untuk UI)

## 2. Actors & Permissions

Aktor utama yang relevan: customer, kasir, produksi, admin, owner. Akses ditentukan oleh role middleware (`role:...`) + Policy/ownership.

Aturan dasar:
- `customer` hanya akses `/app/*` dan record miliknya sendiri.
- `kasir`, `produksi`, `admin`, `owner` akses `/office/*` sesuai cakupan role.
- `admin`/`owner` untuk modul master data dan user management.

## 3. Scope

In scope:
- Halaman dan rute terkait di area: /office/*
- Validasi via FormRequest.
- Authorization via Policy/middleware.
- Business logic via Service class.
- Audit log untuk mutasi sensitif (kalau relevan).
- UI mengikuti design docs.
- Tests via Pest (happy / negative / authz / ownership).

Out of scope:
- Domain lain di luar feature ini.
- Refaktor besar yang tidak diminta.
- Penambahan dependency baru tanpa approval.

## 4. Data Model Notes

Tabel/model utama yang relevan:

```text
users
```

Aturan:
- Patuhi shape kolom existing di migrasi.
- Hindari skema breaking; pakai migrasi additive.
- Eager load relation untuk halaman list besar.
- Jangan dump kolom sensitif ke props frontend.

## 5. Routes / UI

Route area:

```text
/office/*
```

Aturan UI:
- Customer pages: warm, guided, mobile-first.
- Office pages: dense, operational, table-first.
- Reuse komponen `resources/js/components/*` dan `ui/*`.
- Inertia React, page props bertipe.
- Wayfinder dipakai untuk referensi route/action kalau sudah tersedia.

## 6. Functional Requirements

- User dengan role yang sesuai bisa view/melakukan aksi sesuai scope.
- Validation menolak input invalid + menjaga ownership/role.
- Mutasi domain melalui Service class yang ada (lihat `docs/01_ARCHITECTURE.md`).
- Status (order/payment/production) tidak ditransisikan langsung di controller.
- Stok tidak diubah langsung di controller; lewat `StockService`.
- Audit log dicatat untuk mutasi sensitif office.

## 7. Acceptance Criteria

- [ ] Halaman bisa diakses oleh role yang berhak.
- [ ] Role/ownership tidak berhak menerima 403/redirect aman.
- [ ] Validation menolak request invalid (required/format/relasi cross-tenant/ownership).
- [ ] Service yang sesuai dipakai untuk perubahan domain.
- [ ] Audit log tercatat untuk aksi sensitif.
- [ ] Pest tests menutup happy / invalid / unauthorized / ownership.
- [ ] Frontend lulus typecheck/lint/format kalau diubah.
- [ ] UI mengikuti design docs dan anti-slop checklist.
- [ ] Dokumentasi/spec/CHANGELOG diperbarui kalau relevan.

## 8. Non-Functional Requirements

- List tabel paginated server-side.
- Hindari N+1 (eager load).
- Side effect berat (PDF, stok besar) lewat service/queue jika perlu.
- Pesan error tidak membocorkan detail sensitif.

## 9. Dependencies

- Auth foundation (spec 001).
- Role & access control (spec 002).
- App shell terkait (spec 004 customer / 017 office).
- Service domain terkait di `app/Services/*`.
