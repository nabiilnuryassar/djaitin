# Routing & Pages — Djaitin

**Version:** 2.0  
**Date:** 2026-03-08  
**Stack:** Laravel 12 + React + Inertia.js v2 + Wayfinder

---

## Architecture Summary

Djaitin dibangun sebagai **3 web surfaces**:

| Surface | Prefix | Audience | Route File | Layout |
|---|---|---|---|---|
| **Landing** | `/` | Public visitor | `routes/landing.php` | `LandingLayout` |
| **Customer** | `/app` | Visitor + Customer | `routes/customer.php` | `CustomerLayout` |
| **Office** | `/office` | Kasir, Produksi, Admin, Owner | `routes/office.php` | `OfficeLayout` |

Customer App dan User Dashboard berada di **surface yang sama**, yaitu `/app`, tetapi dibedakan oleh state autentikasi dan menu.

---

## 1. Route Entry Strategy

```php
// routes/web.php

Route::group(base_path('routes/landing.php'));

Route::prefix('app')
    ->name('customer.')
    ->group(base_path('routes/customer.php'));

Route::middleware(['auth', 'role:kasir,produksi,admin,owner'])
    ->prefix('office')
    ->name('office.')
    ->group(base_path('routes/office.php'));
```

### 1.1 Auth Strategy

- Visitor dapat browse landing dan sebagian customer app.
- Customer register/login untuk menyimpan order, melihat dashboard, dan upload pembayaran.
- Staff internal **tidak** register publik; account dibuat admin.

### 1.2 Redirect Strategy

| Role | Redirect After Login |
|---|---|
| `customer` | `/app/dashboard` |
| `kasir` | `/office/dashboard` |
| `produksi` | `/office/dashboard` |
| `admin` | `/office/dashboard` |
| `owner` | `/office/dashboard` |

---

## 2. Landing Routes

**File:** `routes/landing.php`

| Method | URI | Named Route | Controller | Page |
|---|---|---|---|---|
| GET | `/` | `landing.home` | `Landing\HomeController` | `Landing/Home` |
| GET | `/features` | `landing.features` | `Landing\FeaturesController` | `Landing/Features` |
| GET | `/solutions` | `landing.solutions` | `Landing\SolutionsController` | `Landing/Solutions` |
| GET | `/how-it-works` | `landing.how` | `Landing\HowItWorksController` | `Landing/HowItWorks` |
| GET | `/faq` | `landing.faq` | `Landing\FaqController` | `Landing/Faq` |
| GET | `/contact` | `landing.contact` | `Landing\ContactController` | `Landing/Contact` |

---

## 3. Customer Routes — Public + Authenticated

**File:** `routes/customer.php`  
**Prefix:** `/app`  
**Name Prefix:** `customer.`

### 3.1 Public Customer App Pages

| Method | URI | Named Route | Controller | Page |
|---|---|---|---|---|
| GET | `/app` | `customer.home` | `Customer\HomeController` | `Customer/Home` |
| GET | `/app/services/tailor` | `customer.services.tailor` | `Customer\ServiceController@tailor` | `Customer/Services/Tailor` |
| GET | `/app/services/ready-to-wear` | `customer.services.rtw` | `Customer\ServiceController@readyToWear` | `Customer/Services/ReadyToWear` |
| GET | `/app/services/convection` | `customer.services.convection` | `Customer\ServiceController@convection` | `Customer/Services/Convection` |
| GET | `/app/catalog` | `customer.catalog.index` | `Customer\CatalogController@index` | `Customer/Catalog/Index` |
| GET | `/app/catalog/{product}` | `customer.catalog.show` | `Customer\CatalogController@show` | `Customer/Catalog/Show` |
| GET | `/app/tailor/configure` | `customer.tailor.configure` | `Customer\TailorConfiguratorController` | `Customer/Tailor/Configurator` |
| GET | `/app/convection/request` | `customer.convection.request` | `Customer\ConvectionRequestController@create` | `Customer/Convection/Create` |

### 3.2 Authenticated Customer Portal Pages

Middleware yang diharapkan di dalam `routes/customer.php`:

```php
Route::middleware(['auth', 'role:customer'])->group(function () {
    // dashboard, orders, payments, profile, addresses, measurements
});
```

| Method | URI | Named Route | Controller | Page |
|---|---|---|---|---|
| GET | `/app/dashboard` | `customer.dashboard` | `Customer\DashboardController` | `Customer/Dashboard/Index` |
| GET | `/app/orders` | `customer.orders.index` | `Customer\OrderController@index` | `Customer/Orders/Index` |
| GET | `/app/orders/create` | `customer.orders.create` | `Customer\OrderEntryController` | `Customer/Orders/Create` |
| POST | `/app/orders/tailor` | `customer.orders.tailor.store` | `Customer\OrderController@storeTailor` | — |
| POST | `/app/orders/rtw` | `customer.orders.rtw.store` | `Customer\OrderController@storeRtw` | — |
| POST | `/app/orders/convection` | `customer.orders.convection.store` | `Customer\OrderController@storeConvection` | — |
| GET | `/app/orders/{order}` | `customer.orders.show` | `Customer\OrderController@show` | `Customer/Orders/Show` |
| GET | `/app/payments` | `customer.payments.index` | `Customer\PaymentController@index` | `Customer/Payments/Index` |
| POST | `/app/orders/{order}/payments` | `customer.payments.store` | `Customer\PaymentController@store` | — |
| POST | `/app/payments/{payment}/proof` | `customer.payments.upload-proof` | `Customer\PaymentProofController@store` | — |
| GET | `/app/measurements` | `customer.measurements.index` | `Customer\MeasurementController@index` | `Customer/Measurements/Index` |
| POST | `/app/measurements` | `customer.measurements.store` | `Customer\MeasurementController@store` | — |
| PUT | `/app/measurements/{measurement}` | `customer.measurements.update` | `Customer\MeasurementController@update` | — |
| GET | `/app/addresses` | `customer.addresses.index` | `Customer\AddressController@index` | `Customer/Addresses/Index` |
| POST | `/app/addresses` | `customer.addresses.store` | `Customer\AddressController@store` | — |
| PUT | `/app/addresses/{address}` | `customer.addresses.update` | `Customer\AddressController@update` | — |
| GET | `/app/profile` | `customer.profile.edit` | `Customer\ProfileController@edit` | `Customer/Profile/Edit` |
| PUT | `/app/profile` | `customer.profile.update` | `Customer\ProfileController@update` | — |
| GET | `/app/notifications` | `customer.notifications.index` | `Customer\NotificationController@index` | `Customer/Notifications/Index` |

### 3.3 Interactive Tailor Configurator Notes

`Customer/Tailor/Configurator` adalah halaman inti customer app.

**Step structure:**
1. Pilih jenis pakaian
2. Pilih model
3. Pilih bahan
4. Pilih ukuran
5. Ringkasan & estimasi
6. Pembayaran DP

**Expected backend endpoints:**
- `customer.catalog.*` untuk referensi produk / model
- `customer.measurements.*` untuk load ukuran tersimpan
- `customer.orders.tailor.store` untuk submit final

### 3.4 Ready-to-Wear Customer Flow

| Method | URI | Named Route | Controller | Page |
|---|---|---|---|---|
| GET | `/app/cart` | `customer.cart.index` | `Customer\CartController@index` | `Customer/Cart/Index` |
| POST | `/app/cart/items` | `customer.cart.items.store` | `Customer\CartItemController@store` | — |
| PUT | `/app/cart/items/{item}` | `customer.cart.items.update` | `Customer\CartItemController@update` | — |
| DELETE | `/app/cart/items/{item}` | `customer.cart.items.destroy` | `Customer\CartItemController@destroy` | — |
| GET | `/app/checkout` | `customer.checkout.index` | `Customer\CheckoutController@index` | `Customer/Checkout/Index` |
| POST | `/app/checkout` | `customer.checkout.store` | `Customer\CheckoutController@store` | — |

---

## 4. Office Routes — Internal Backoffice

**File:** `routes/office.php`  
**Prefix:** `/office`  
**Name Prefix:** `office.`

| Method | URI | Named Route | Controller | Page |
|---|---|---|---|---|
| GET | `/office/dashboard` | `office.dashboard` | `Office\DashboardController` | `Office/Dashboard/Index` |
| GET | `/office/orders` | `office.orders.index` | `Office\OrderController@index` | `Office/Orders/Index` |
| GET | `/office/orders/{order}` | `office.orders.show` | `Office\OrderController@show` | `Office/Orders/Show` |
| PUT | `/office/orders/{order}/status` | `office.orders.status` | `Office\OrderController@updateStatus` | — |
| GET | `/office/payments` | `office.payments.index` | `Office\PaymentController@index` | `Office/Payments/Index` |
| POST | `/office/orders/{order}/payments` | `office.payments.store` | `Office\PaymentController@store` | — |
| POST | `/office/payments/{payment}/verify` | `office.payments.verify` | `Office\PaymentController@verify` | — |
| POST | `/office/payments/{payment}/reject` | `office.payments.reject` | `Office\PaymentController@reject` | — |
| GET | `/office/customers` | `office.customers.index` | `Office\CustomerController@index` | `Office/Customers/Index` |
| GET | `/office/customers/{customer}` | `office.customers.show` | `Office\CustomerController@show` | `Office/Customers/Show` |
| GET | `/office/production` | `office.production.index` | `Office\ProductionController@index` | `Office/Production/Index` |
| GET | `/office/inventory` | `office.inventory.index` | `Office\InventoryController@index` | `Office/Inventory/Index` |
| GET | `/office/reports` | `office.reports.index` | `Office\ReportController@index` | `Office/Reports/Index` |
| GET | `/office/shipping` | `office.shipping.index` | `Office\ShippingController@index` | `Office/Shipping/Index` |
| GET | `/office/audit-log` | `office.audit-log.index` | `Office\AuditLogController@index` | `Office/AuditLog/Index` |

### 4.1 Admin / Owner Management Modules

| Method | URI | Named Route | Controller | Page |
|---|---|---|---|---|
| GET | `/office/admin/users` | `office.admin.users.index` | `Office\Admin\UserController@index` | `Office/Admin/Users/Index` |
| GET | `/office/admin/products` | `office.admin.products.index` | `Office\Admin\ProductController@index` | `Office/Admin/Products/Index` |
| GET | `/office/admin/master-data` | `office.admin.master-data.index` | `Office\Admin\MasterDataController@index` | `Office/Admin/MasterData/Index` |
| GET | `/office/admin/discounts` | `office.admin.discounts.index` | `Office\Admin\DiscountPolicyController@index` | `Office/Admin/Discounts/Index` |
| GET | `/office/admin/settings` | `office.admin.settings.index` | `Office\Admin\SettingsController@index` | `Office/Admin/Settings/Index` |

> Modul admin di atas tetap berada di surface `office`, bukan surface terpisah.

---

## 5. Inertia Page Tree

```
resources/js/pages/
├── Landing/
│   ├── Home.tsx
│   ├── Features.tsx
│   ├── Solutions.tsx
│   ├── HowItWorks.tsx
│   ├── Faq.tsx
│   └── Contact.tsx
├── Customer/
│   ├── Home.tsx
│   ├── Dashboard/Index.tsx
│   ├── Services/
│   │   ├── Tailor.tsx
│   │   ├── ReadyToWear.tsx
│   │   └── Convection.tsx
│   ├── Tailor/Configurator.tsx
│   ├── Catalog/
│   │   ├── Index.tsx
│   │   └── Show.tsx
│   ├── Cart/Index.tsx
│   ├── Checkout/Index.tsx
│   ├── Orders/
│   │   ├── Index.tsx
│   │   └── Show.tsx
│   ├── Payments/Index.tsx
│   ├── Measurements/Index.tsx
│   ├── Addresses/Index.tsx
│   ├── Profile/Edit.tsx
│   └── Notifications/Index.tsx
└── Office/
    ├── Dashboard/Index.tsx
    ├── Orders/Index.tsx
    ├── Orders/Show.tsx
    ├── Payments/Index.tsx
    ├── Customers/Index.tsx
    ├── Customers/Show.tsx
    ├── Production/Index.tsx
    ├── Inventory/Index.tsx
    ├── Shipping/Index.tsx
    ├── Reports/Index.tsx
    ├── AuditLog/Index.tsx
    └── Admin/
        ├── Users/Index.tsx
        ├── Products/Index.tsx
        ├── MasterData/Index.tsx
        ├── Discounts/Index.tsx
        └── Settings/Index.tsx
```

---

## 6. Wayfinder Naming Guidance

### 6.1 Customer Surface

```tsx
import { index as customerOrdersIndex } from '@/actions/Customer/OrderController'
import { storeTailor } from '@/actions/Customer/OrderController'
import { index as catalogIndex } from '@/actions/Customer/CatalogController'
```

### 6.2 Office Surface

```tsx
import { index as officeOrdersIndex } from '@/actions/Office/OrderController'
import { verify } from '@/actions/Office/PaymentController'
import { index as usersIndex } from '@/actions/Office/Admin/UserController'
```

### 6.3 Naming Rules

- Semua customer routes gunakan prefix nama `customer.`
- Semua internal routes gunakan prefix nama `office.`
- Hindari mempertahankan prefix legacy `app.` untuk internal ketika migrasi dilakukan

---

## 7. Migration Note

Dokumen ini mendefinisikan target routing baru. Bila codebase saat ini masih memiliki:

- `/app/*` untuk internal
- `/cms/*` untuk admin

maka itu harus diperlakukan sebagai **legacy transition state**. Implementasi berikutnya perlu:

1. memindahkan internal route ke `/office/*`
2. membuka `/app/*` untuk customer surface
3. memisahkan controller/page namespace menjadi `Customer` dan `Office`
