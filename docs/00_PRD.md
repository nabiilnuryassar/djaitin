# 00 — Product Requirements Document

> Ground truth untuk Djaitin. Semua spec dan implementasi harus align dengan dokumen ini. Kalau dokumen ini conflict dengan spec, update PRD dulu atau catat design deviation di spec terkait.

---

## 1. Identitas Produk

**Nama produk**: Djaitin  
**Tipe**: Platform jasa jahit digital untuk tailor, ready-to-wear, dan convection/collaboration order.  
**Stack**: Laravel 12 + PHP 8.4 + Inertia v2 + React 19 + Tailwind v4 + Fortify + Wayfinder + Pest 4.  
**Frontend**: React/Inertia, shadcn/radix-style components, Tailwind v4.  
**PDF**: DomPDF.  
**Route zones**:

- Public landing: `/`
- Customer app: `/app/*`
- Office backoffice: `/office/*`
- CMS alias: `/cms/dashboard` → `/office/dashboard`
- Settings: `/settings/*`

---

## 2. Product Vision

Djaitin membantu bisnis jahit mengelola order dari awal sampai selesai: pelanggan memilih layanan, mengisi ukuran, upload referensi desain, checkout, bayar DP/pelunasan, tracking produksi, sampai pengiriman. Backoffice membantu owner/admin/kasir/produksi mengelola order, customer, payment, stok produk, laporan, master data, dan audit log.

Produk harus terasa:

- Premium, rapi, dan fashion-aware.
- Mudah untuk customer non-teknis.
- Padat dan efisien untuk operator kantor.
- Aman untuk transaksi pembayaran dan bukti transfer.
- Konsisten di semua flow: landing → customer app → office.

---

## 3. Actors

| Actor | Role enum | Area |
|---|---|---|
| Guest | none | landing, auth, catalog browse |
| Customer | `customer` | `/app/*` |
| Kasir | `kasir` | office payments, order intake |
| Produksi | `produksi` | production board, order progress |
| Admin | `admin` | master data, users, reports |
| Owner | `owner` | all office, financial reports, admin |

Implementation uses `App\Enums\UserRole` and role middleware.

---

## 4. Business Domains

### Customer-facing

- Landing page and service discovery.
- Customer dashboard.
- Catalog ready-to-wear.
- Cart and checkout.
- Tailor configurator.
- Convection order request.
- Measurements library.
- Address book.
- Payment upload and status tracking.
- Notifications.
- Profile/settings.

### Office-facing

- Office dashboard.
- Order management.
- Customer management.
- Payment review, proof visibility, refund.
- Production board.
- Shipping/fulfillment.
- Reports.
- Audit log.
- Master data: product, fabric, garment model, courier, discount policy.
- User management.

### Shared/services

- CartService.
- ReadyWearOrderService.
- TailorOrderService.
- ConvectionOrderService.
- PaymentService and PaymentRefundService.
- StockService.
- OrderStatusService.
- ReportService.
- DocumentService.
- AuditLogService.

---

## 5. Existing Implementation Snapshot

Code scan shows:

- 17 models: Payment, Product, User, Shipment, OrderAttachment, OrderItem, Measurement, Order, GarmentModel, Fabric, DiscountPolicy, Courier, Customer, Cart, CartItem, AuditLog, Address.
- 38 controllers across Office, Customer, Landing, Settings.
- 17 services covering order, payment, stock, reporting, documents, audit.
- 10 policies for important ownership/office access.
- 35 migrations.
- 60 Inertia pages.
- 54 Pest tests.

This means Djaitin is not greenfield. SDD should preserve and harden existing code, not rebuild it from scratch.

---

## 6. Phase Plan

| Phase | Status | Description |
|---|---|---|
| Phase 0 | Done/solid | Auth, roles, route zones, base layout, core data model. |
| Phase 1 | Done/partial | Landing, customer app shell, catalog, cart, checkout, measurements. |
| Phase 2 | Partial/strong | Tailor, ready-wear, convection order flows, documents, attachments. |
| Phase 3 | Partial/strong | Office order management, production board, payment review, shipping. |
| Phase 4 | Partial | Reports, dashboard, audit, master data management, user management. |
| Phase 5 | Future | Advanced CMS, promotion engine, advanced analytics, customer loyalty automation, automated payment gateway, live collaboration. |

---

## 7. Locked Product Decisions

Do not change these without approval:

1. Customer area stays under `/app/*` with route name prefix `customer.`.
2. Office area stays under `/office/*` with route name prefix `office.`.
3. Frontend stays Inertia React 19, not Blade, Livewire, Vue, or SPA router separate from Laravel.
4. Use Wayfinder for frontend route/action references where possible.
5. Use existing `UserRole` enum and role middleware.
6. Use service classes for business logic; controllers stay thin.
7. Payment status and order status are separate domains.
8. Stock changes must go through `StockService`; never adjust stock ad hoc in controller/page.
9. Payment proof upload/review must keep authorization strict; customer cannot see other customer proof.
10. Refund logic must not bypass audit log or stock/order status side effects.
11. PDF/document generation stays server-side via DomPDF unless spec changes.
12. Visual system follows Djaitin premium fashion/atelier taste; no generic admin-template slop.

---

## 8. Non-functional Requirements

### Security

- Customer ownership enforced for every `/app/*` record.
- Office roles limited by policy and middleware.
- Payment proof files must not be public without authorization check.
- Refund action requires office permission and audit log.
- Avoid leaking customer phone/address/payment details into frontend props unnecessarily.

### Reliability

- Order creation must be transaction-safe.
- Stock reservation/release must be concurrency-safe.
- Payment proof spam guard must remain enforced.
- Order status transitions must be explicit.
- Refund is reversible only by business-defined path, not direct database edit.

### Performance

- Office list pages paginate and filter server-side.
- Customer dashboard loads only needed props; use deferred props for expensive aggregates if needed.
- Catalog should support filters without sending all products unnecessarily.

### Testing

- Every change needs Pest coverage.
- Use existing tests as baseline; add happy path, negative path, authorization/ownership path.
- Frontend changes need typecheck/lint/format check where relevant.

---

## 9. Definition of Done

A feature is done when:

- Spec and plan exist.
- Controller uses service/action for business logic.
- Request validation exists for mutations.
- Policy/middleware enforces role/ownership.
- React page matches design docs.
- Pest tests cover happy, invalid, unauthorized, ownership/role boundaries.
- `composer lint:check` or `vendor/bin/pint --test` passes.
- `npm run lint:check`, `npm run format:check`, `npm run types:check` pass for frontend changes.
- `php artisan test` passes, or failure is documented and unrelated.
- Changelog/relevant docs updated.

---

## 10. Glossary

- **Tailor order**: custom jahit flow with measurements, fabric/model selection, quote, DP, production.
- **Ready wear order**: product catalog/cart/checkout flow using stock.
- **Convection order**: bulk/custom group production request with quote/collaboration.
- **Measurement**: customer body measurement profile.
- **Production stage**: current production progress of an order.
- **Payment proof**: uploaded evidence for manual transfer/cash workflow.
- **Refund**: reversing/returning payment according to business rule.
- **Office**: internal backoffice used by kasir/produksi/admin/owner.
