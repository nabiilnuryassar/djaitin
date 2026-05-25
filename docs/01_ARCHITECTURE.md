# 01 — Architecture

> Technical architecture for Djaitin. Agents must read this before changing backend, frontend routing, services, or shared components.

---

## 1. Style

Djaitin is a Laravel modular monolith with Inertia React frontend.

```text
HTTP Request
→ Laravel route group (/app, /office, /settings)
→ Middleware (auth, role, verified, etc)
→ FormRequest validation
→ Policy / ownership check
→ Controller thin layer
→ Service class / domain method
→ Eloquent models
→ Inertia::render(page, props) or redirect
→ React page/component
```

Backend owns routing, auth, validation, and persistence. Frontend owns view composition and interactive form UX.

---

## 2. Route Zones

```text
/                 public landing
/app/*            customer area, route name customer.*
/office/*         office backoffice, route name office.*
/cms/dashboard    redirect alias to office dashboard
/settings/*       authenticated settings
```

`routes/web.php` includes:

- `routes/landing.php`
- `routes/customer.php`
- `routes/office.php`
- `routes/settings.php`

Rules:

- Do not put large route definitions directly in `web.php`.
- Keep customer routes in `customer.php` and office routes in `office.php`.
- Route names must match page folder structure as much as possible.
- Frontend should use Wayfinder generated functions/imports where available.

---

## 3. Backend Layers

### Models

Existing primary models:

```text
User, Customer, Address, Measurement, Cart, CartItem,
Product, Fabric, GarmentModel, Courier, DiscountPolicy,
Order, OrderItem, OrderAttachment, Payment, Shipment, AuditLog
```

Model rules:

- Define explicit relations.
- Use enum casts for role/status/payment/production states where available.
- Keep computed business logic minimal; complex workflows belong in services.

### Controllers

Controllers split by area:

```text
app/Http/Controllers/Customer/*
app/Http/Controllers/Office/*
app/Http/Controllers/Office/Admin/*
app/Http/Controllers/Office/Cms/*
app/Http/Controllers/Settings/*
```

Controller responsibilities:

- Authorize.
- Validate via request class.
- Call service.
- Return Inertia page/redirect.

### Services

Existing service layer is canonical:

```text
CartService
ReadyWearOrderService
TailorOrderService
ConvectionOrderService
PaymentService
PaymentRefundService
StockService
OrderStatusService
ReportService
DocumentService
AttachmentService
AuditLogService
UserService
CustomerRegistrationService
```

Business rules go here, not inside React components or controller branches.

---

## 4. Frontend Architecture

Pages live in `resources/js/pages`.

```text
resources/js/pages/Landing/*
resources/js/pages/Customer/*
resources/js/pages/Office/*
resources/js/pages/settings/*
resources/js/components/*
resources/js/components/ui/*
```

Rules:

- Inertia pages receive typed props.
- Shared UI primitives go in `resources/js/components/ui`.
- Domain components go in `resources/js/components/<domain>`.
- Page-local components can stay beside the page only when not reused.
- Use existing `app-shell`, `app-sidebar`, `customer-mobile-bottom-bar`, and shadcn-style primitives first.

---

## 5. Inertia Data Rules

- Send minimal props.
- Do not send raw models with hidden sensitive fields.
- Transform models into arrays/resources in controller/service if shape matters.
- For large office lists, paginate server-side.
- Use `deferred props` for expensive dashboard aggregates if needed.
- Preserve query strings for filters.

---

## 6. Auth and Authorization

Roles: `customer`, `kasir`, `produksi`, `admin`, `owner`.

Customer rules:

- Customer can only access their own orders, payments, measurements, addresses, notifications.
- Customer ownership usually via `user_id` or linked `customer.user_id`.

Office rules:

- `kasir`: order intake, payments, customer support.
- `produksi`: production board and order progress.
- `admin`: master data, users, reports.
- `owner`: all office access.

Use policies for record-level decisions.

---

## 7. Order Architecture

Three order paths share the same `orders` table but differ by type/service:

1. Ready-wear: product/cart/checkout/stock.
2. Tailor: measurement/configurator/quote/DP/production.
3. Convection: bulk/collaboration/quote/attachments.

Use services per order type. Avoid one giant controller method with type branches.

---

## 8. Payment Architecture

Payment flow:

```text
Customer upload proof / Office records payment
→ StorePaymentRequest / UploadPaymentProofRequest
→ PaymentService
→ Payment row
→ OrderStatusService recalculates order/payment state
→ AuditLogService
→ Notification (if applicable)
```

Refund flow:

```text
Office refund request
→ RefundPaymentRequest
→ PaymentRefundService
→ Payment status/amount fields
→ optional stock/order adjustment via services
→ AuditLogService
```

Rules:

- Payment proof visibility must be authorized.
- Customer cannot overpay beyond allowed threshold.
- DP ratio and cash proof threshold tests must stay green.

---

## 9. Stock Architecture

Stock change paths:

- Ready-wear checkout reserves stock.
- Order cancellation releases stock.
- Product admin updates stock with audit.
- Refund may release/adjust reserved stock depending rule.

All stock mutation goes through `StockService`.

---

## 10. Document Architecture

Documents/PDF generated through `DocumentService` and DomPDF. Do not generate PDF in React. React may show preview/download link only.

---

## 11. Observability

- Audit logs for office/user mutations.
- Tests for sensitive flows.
- Laravel logs for exceptions.
- Frontend errors checked via browser logs when debugging.

---

## 12. Existing Work-in-progress Warning

Current repo scan shows uncommitted WIP around payment refund, stock reserved columns, payment status, order controller/payment controller, and tests. Agents must not overwrite this work. Before editing, inspect `git status --short` and avoid touching files unrelated to the current spec.
