# 03 — Routes and API Contract

> Canonical route contract for Djaitin. Use actual `routes/*.php` as implementation truth; update this doc when routes change.

---

## 1. Public / Landing

Route file: `routes/landing.php`.

Expected:

```text
GET /                         home / landing
GET /services/tailor          service detail
GET /services/ready-to-wear   service detail
GET /services/convection      service detail
```

Landing should not require auth.

---

## 2. Customer App (`customer.*`)

Prefix: `/app`  
Route file: `routes/customer.php`.

Key route areas:

```text
GET  /app/dashboard                 customer.dashboard
GET  /app/home                      customer.home
GET  /app/catalog                   customer.catalog.index
GET  /app/catalog/{product}         customer.catalog.show
GET  /app/cart                      customer.cart.index
POST /app/cart/items                customer.cart-items.store
PATCH/DELETE cart items             customer.cart-items.*
GET  /app/checkout                  customer.checkout.index
POST /app/checkout                  customer.checkout.store

GET  /app/services/tailor           customer.services.tailor
GET  /app/tailor/configurator       customer.tailor.configurator
POST /app/tailor/orders             customer.tailor.orders.store

GET  /app/services/convection       customer.services.convection
GET  /app/convection/create         customer.convection.create
POST /app/convection                customer.convection.store

GET  /app/orders                    customer.orders.index
GET  /app/orders/{order}            customer.orders.show
POST /app/orders/{order}/cancel     customer.orders.cancel

GET  /app/payments                  customer.payments.index
POST /app/payments                  customer.payments.store/upload-proof

GET  /app/measurements              customer.measurements.index
POST /app/measurements              customer.measurements.store
PUT/PATCH/DELETE measurement        customer.measurements.*

GET  /app/addresses                 customer.addresses.index
POST /app/addresses                 customer.addresses.store
PATCH /app/addresses/{address}/default

GET  /app/notifications             customer.notifications.index
PATCH /app/notifications/{notification}/read
```

Rules:

- All customer app routes require auth (and usually verified email depending existing config).
- Every `{order}`, `{payment}`, `{measurement}`, `{address}` must be ownership-checked.

---

## 3. Office (`office.*`)

Prefix: `/office`  
Middleware: `auth`, `role:kasir,produksi,admin,owner`  
Route file: `routes/office.php`.

```text
GET /office/dashboard                       office.dashboard

GET /office/orders                          office.orders.index
GET /office/orders/create                   office.orders.create
POST /office/orders                         office.orders.store
GET /office/orders/{order}                  office.orders.show
PATCH /office/orders/{order}/status         office.orders.status
PATCH /office/orders/{order}/production     office.orders.production
POST /office/orders/{order}/cancel          office.orders.cancel
POST /office/orders/{order}/attachments     office.orders.attachments.store
GET /office/orders/{order}/documents/*      office.orders.documents.*

GET /office/customers                       office.customers.index
GET /office/customers/create                office.customers.create
POST /office/customers                      office.customers.store
GET /office/customers/{customer}            office.customers.show
PUT/PATCH /office/customers/{customer}      office.customers.update

GET /office/payments                        office.payments.index
POST /office/payments                       office.payments.store
PATCH /office/payments/{payment}/verify     office.payments.verify
PATCH /office/payments/{payment}/reject     office.payments.reject
POST /office/payments/{payment}/refund      office.payments.refund
GET /office/payments/{payment}/proof        office.payments.proof

GET /office/production                      office.production.index
PATCH /office/production/{order}/stage      office.production.stage

GET /office/shipping                        office.shipping.index
POST/PATCH shipment routes                  office.shipping.*

GET /office/reports                         office.reports.index
GET /office/reports/export                  office.reports.export

GET /office/audit-log                       office.audit-log.index
```

---

## 4. Office Admin / Master Data

Under `/office/admin/*` or existing office admin prefix.

```text
GET/POST/PATCH products          office.admin.products.*
GET/POST/PATCH fabrics           office.admin.fabrics.*
GET/POST/PATCH garment-models    office.admin.garment-models.*
GET/POST/PATCH couriers          office.admin.couriers.*
GET/POST/PATCH discounts         office.admin.discounts.*
GET/POST/PATCH users             office.admin.users.*
GET /office/admin/master-data    office.admin.master-data.index
```

Rules:

- Usually admin/owner only.
- Product stock mutation must use StockService.

---

## 5. Settings

Route file: `routes/settings.php`.

```text
GET/PATCH /settings/profile
GET/PUT   /settings/password
GET/POST/DELETE /settings/two-factor
GET       /settings/appearance
```

Use Fortify conventions already present.

---

## 6. Inertia Response Rules

Controller returns:

```php
return Inertia::render('Office/Orders/Index', [
    'orders' => $orders,
    'filters' => $request->only([...]),
]);
```

Rules:

- Page names match `resources/js/pages` path.
- Props must be typed in TS page file.
- Large lists paginated.
- Do not pass raw sensitive fields.

---

## 7. JSON/API

Djaitin is currently Inertia-first, not public API-first. If JSON endpoints are needed for async selects/upload/proof preview:

- Prefix them under the same zone (`/app/*` or `/office/*`).
- Keep auth/role/ownership middleware.
- Return consistent shape:

```json
{ "ok": true, "message": "Saved.", "data": {} }
```

Do not create unauthenticated JSON routes for sensitive records.
