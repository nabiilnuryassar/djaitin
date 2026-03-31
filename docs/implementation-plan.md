# Implementation Plan — Djaitin App

**Version:** 1.0
**Date:** 2026-03-08
**Based on:** system-spec.md v2.0, planning.md v2.0, routing-and-pages.md v2.0
**Method:** Phase-by-phase, checklist-driven

> Dokumen ini adalah panduan implementasi teknis konkret.
> Setiap phase diselesaikan tuntas sebelum ke phase berikutnya.
> Urutan task per phase mengikuti: migration → model → service → policy → request → controller → route → page → test.

---

## Daftar Phase

| Phase | Fokus | Estimasi |
|---|---|---|
| **Phase 0** | Architecture & Namespace Cleanup | S |
| **Phase 1** | Customer Foundation | M |
| **Phase 2** | Customer Tailor Ordering | M |
| **Phase 3** | Ready-to-Wear Commerce | L |
| **Phase 4** | Convection Customer Flow | M |
| **Phase 5** | Office Consolidation & Admin Modules | XL |
| **Phase 6** | Notifications, Reports & Analytics | L |

---

## Phase 0 — Architecture & Namespace Cleanup

**Goal:** Selaraskan struktur direktori kode dengan target arsitektur di `system-spec.md`.
Saat ini controller internal ada di `App\Http\Controllers\App\*` dan page di `resources/js/pages/App/*`,
padahal target spec menetapkan `Office` sebagai namespace.

### 0.1 Backend — Rename Namespace `App` → `Office`

- [ ] Pindahkan `app/Http/Controllers/App/` → `app/Http/Controllers/Office/`
  - `DashboardController.php`
  - `CustomerController.php`
  - `MeasurementController.php`
  - `OrderController.php`
  - `PaymentController.php`
- [ ] Update semua `namespace App\Http\Controllers\App` → `App\Http\Controllers\Office`
- [ ] Update semua `use App\Http\Controllers\App\*` di route files
- [ ] Pindahkan `app/Http/Requests/App/` → `app/Http/Requests/Office/`
  - Update semua namespace di dalam file request
- [ ] Update import di semua controller yang terdampak
- [ ] Pindahkan `app/Http/Controllers/Cms/DashboardController.php` → `app/Http/Controllers/Office/Cms/DashboardController.php`

### 0.2 Frontend — Rename Directory `App` → `Office`

- [ ] Pindahkan `resources/js/pages/App/` → `resources/js/pages/Office/`
  - `Dashboard/Index.tsx`
  - `Customers/Index.tsx`, `Create.tsx`, `Show.tsx`
  - `Orders/Index.tsx`, `Show.tsx`, `TailorWizard.tsx`
  - `Payments/Index.tsx`
- [ ] Pindahkan `resources/js/pages/Cms/` → `resources/js/pages/Office/Cms/`
- [ ] Update semua `Inertia::render('App/...')` di controller → `Inertia::render('Office/...')`
- [ ] Update semua import path di file `.tsx` yang terdampak
- [ ] Update semua `@/actions/App/...` Wayfinder import → `@/actions/Office/...`

### 0.3 Layouts

- [ ] Buat `resources/js/layouts/office-layout.tsx` (alias / rename dari `app-layout.tsx`)
  - Pertahankan sidebar, header, nav yang sudah ada
  - Rename component export menjadi `OfficeLayout`
- [ ] Buat `resources/js/layouts/customer-layout.tsx`
  - Layout customer-facing: navbar top, tanpa sidebar internal
  - Placeholder untuk phase berikutnya
- [ ] Buat `resources/js/layouts/landing-layout.tsx`
  - Layout publik tanpa auth: hanya wraps children

### 0.4 Route Files

- [ ] Pastikan `routes/office.php` import controller dari namespace `Office` baru
- [ ] Pastikan `routes/customer.php` sudah siap untuk public + auth customer routes
- [ ] Tambahkan komentar `// Phase 0 — normalized` di `routes/web.php`

### 0.5 Wayfinder Regeneration

- [ ] Jalankan `php artisan wayfinder:generate` setelah semua rename selesai
- [ ] Verifikasi semua generated actions tersedia di `resources/js/actions/`

### Definition of Done — Phase 0

- [ ] `php artisan migrate:fresh --seed` berjalan tanpa error
- [ ] Semua halaman office bisa diakses tanpa 404/500
- [ ] Tidak ada referensi path `App/` lama yang tertinggal di controller atau TSX
- [ ] `npm run build` sukses tanpa TypeScript error

---

## Phase 1 — Customer Foundation

**Goal:** Customer memiliki akun, bisa login/register, dan punya portal dasar yang usable.

### 1.1 Migration & Schema

- [ ] Buat migration `create_addresses_table`
  ```
  id, customer_id (FK→customers), label (string nullable),
  recipient_name (string), phone (string 20 nullable),
  address_line (text), city (string nullable),
  province (string nullable), postal_code (string 10 nullable),
  is_default (boolean default false), timestamps
  ```
- [ ] Update migration atau buat migration baru untuk link `customers` ke `users`
  - Tambahkan kolom `user_id` (FK → users, nullable, unique) di tabel `customers`
  - Relasi: satu customer account = satu user dengan role `customer`

### 1.2 Models

- [ ] Buat `app/Models/Address.php`
  - `fillable`: label, recipient_name, phone, address_line, city, province, postal_code, is_default
  - `casts`: is_default → boolean
  - Relasi: `belongsTo(Customer::class)`
- [ ] Update `app/Models/Customer.php`
  - Tambahkan relasi `user(): BelongsTo`
  - Tambahkan relasi `addresses(): HasMany`
  - Tambahkan relasi `defaultAddress(): HasOne` (where is_default = true)
- [ ] Update `app/Models/User.php`
  - Tambahkan relasi `customer(): HasOne`

### 1.3 Auth — Customer Registration

- [ ] Aktifkan registrasi publik di Fortify **hanya untuk role customer**
  - `app/Actions/Fortify/CreateNewUser.php`: set role ke `UserRole::Customer` saat register
  - Auto-create record `Customer` saat user dengan role customer register
- [ ] Pastikan registrasi internal staff **tidak tersedia** dari halaman publik
  - Staff account hanya bisa dibuat dari panel admin (Phase 5)
- [ ] Redirect setelah login berdasarkan role (sudah ada di `web.php`, verifikasi cukup)

### 1.4 Policies

- [ ] Buat `app/Policies/AddressPolicy.php`
  - `viewAny`, `view`, `create`, `update`, `delete`: customer hanya bisa akses address miliknya sendiri
- [ ] Update `app/Policies/MeasurementPolicy.php` (buat jika belum ada)
  - Customer bisa lihat dan kelola measurement miliknya sendiri
  - Staff office bisa lihat dan kelola semua measurement

### 1.5 Services

- [ ] Buat `app/Services/CustomerRegistrationService.php`
  - `register(array $payload): User` — buat user + customer record dalam satu transaksi
  - Catat audit log `customer.registered`

### 1.6 Form Requests

- [ ] Buat `app/Http/Requests/Customer/StoreAddressRequest.php`
- [ ] Buat `app/Http/Requests/Customer/UpdateAddressRequest.php`
- [ ] Buat `app/Http/Requests/Customer/UpdateProfileRequest.php`

### 1.7 Controllers — Customer Surface

- [ ] Buat `app/Http/Controllers/Customer/MeasurementController.php`
  - `index()`: list measurement milik sendiri
  - `store()`: tambah measurement baru
  - `update()`: edit measurement milik sendiri
  - Enforce: customer hanya bisa akses measurement miliknya (policy check)
- [ ] Buat `app/Http/Controllers/Customer/AddressController.php`
  - `index()`: list semua address milik sendiri
  - `store()`: tambah address baru
  - `update()`: edit address
  - `setDefault()`: set address sebagai default
- [ ] Buat `app/Http/Controllers/Customer/ProfileController.php`
  - `edit()`: tampilkan form edit profil
  - `update()`: update data profil customer
- [ ] Update `app/Http/Controllers/Customer/DashboardController.php`
  - Tampilkan: active orders count, pending payments, shortcut buat order

### 1.8 Routes — `routes/customer.php`

- [ ] Tambahkan group auth middleware:
  ```php
  Route::middleware(['auth', 'role:customer'])->group(function () {
      Route::get('dashboard', DashboardController::class)->name('dashboard');
      Route::resource('measurements', MeasurementController::class)->except(['show', 'create', 'edit']);
      Route::resource('addresses', AddressController::class)->except(['show', 'create', 'edit']);
      Route::post('addresses/{address}/set-default', [AddressController::class, 'setDefault'])->name('addresses.set-default');
      Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
      Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
  });
  ```

### 1.9 Frontend Pages — Customer Surface

- [ ] Buat `resources/js/pages/Customer/Dashboard/Index.tsx`
  - Summary cards: order aktif, pembayaran pending
  - Quick action buttons: Buat Tailor Order, Lihat Pesanan
  - Gunakan `CustomerLayout`
- [ ] Buat `resources/js/pages/Customer/Measurements/Index.tsx`
  - List ukuran tersimpan (card per measurement)
  - Inline form tambah ukuran baru
  - Edit measurement (sheet/dialog)
- [ ] Buat `resources/js/pages/Customer/Addresses/Index.tsx`
  - List address book
  - Tambah / edit alamat (sheet/dialog)
  - Toggle default address
- [ ] Buat `resources/js/pages/Customer/Profile/Edit.tsx`
  - Form edit nama, phone, email
  - Consistent dengan `settings/profile` yang sudah ada

### 1.10 Frontend Layout

- [ ] Implementasikan `resources/js/layouts/customer-layout.tsx`
  - Top navbar: logo djaitin + nav links (Dashboard, Pesanan, Pembayaran, Ukuran, Alamat)
  - User menu di kanan: avatar, profil, logout
  - Mobile-responsive: hamburger menu atau bottom nav
  - Tidak ada sidebar internal office

### 1.11 Seeder Update

- [ ] Update `DatabaseSeeder.php`: tambahkan seed user customer demo dengan akun login
- [ ] Update `DemoSystemSeeder.php`: link existing customers ke user account baru

### 1.12 Tests

- [ ] `tests/Feature/Customer/RegistrationTest.php`
  - Customer bisa register → user role = customer, customer record tercipta
  - Staff tidak bisa register via form publik
- [ ] `tests/Feature/Customer/AuthRedirectTest.php`
  - Customer redirect ke `/app/dashboard` setelah login
  - Staff redirect ke `/office/dashboard` setelah login
- [ ] `tests/Feature/Customer/OwnershipTest.php`
  - Customer A tidak bisa akses measurement Customer B
  - Customer A tidak bisa akses address Customer B

### Definition of Done — Phase 1

- [ ] Customer bisa register, login, dan landing di dashboard sendiri
- [ ] Semua halaman customer menggunakan `CustomerLayout`
- [ ] Customer tidak bisa akses `/office/*` (403)
- [ ] Staff tidak bisa akses portal customer milik user lain
- [ ] Measurement dan address tersimpan dan bisa di-reuse
- [ ] `php artisan migrate:fresh --seed` dan semua test pass

---

## Phase 2 — Customer Tailor Ordering

**Goal:** Customer dapat menyusun dan submit tailor order secara mandiri dari portal.

### 2.1 Migration & Schema

- [ ] Buat migration `add_user_id_to_orders_table`
  - Tambah kolom `user_id` (FK → users, nullable) — untuk tracking order dari customer portal
  - Nullable karena order bisa dibuat manual oleh kasir tanpa login customer

### 2.2 Models

- [ ] Update `app/Models/Order.php`
  - Tambah `user_id` ke `$fillable`
  - Tambah relasi `submittedBy(): BelongsTo(User::class, 'user_id')`

### 2.3 Services

- [ ] Update `app/Services/TailorOrderService.php`
  - Tambah parameter opsional `?User $customerUser` untuk tracking siapa yang submit
  - Simpan `user_id` ke order jika customer yang submit
- [ ] Implementasikan draft order support:
  - Buat `app/Services/DraftOrderService.php`
  - `saveDraft(array $payload, User $user): Order` — simpan order dengan status `draft`
  - `submitDraft(Order $order, User $user, array $paymentPayload): Order` — submit draft ke pending_payment

### 2.4 Policies

- [ ] Update `app/Policies/OrderPolicy.php`
  - `viewAny` customer: boleh lihat order miliknya saja
  - `view` customer: boleh lihat order miliknya saja (check `customer.user_id == auth user`)
  - `create` customer: boleh buat order sendiri

### 2.5 Form Requests

- [ ] Buat `app/Http/Requests/Customer/StoreTailorOrderRequest.php`
  - Validasi: customer_id (auto dari auth), garment_model_id, fabric_id, measurement_id (nullable), qty, unit_price (dari server, tidak dari client), due_date, spec_notes, payment
- [ ] Buat `app/Http/Requests/Customer/SaveDraftRequest.php`
  - Validasi lebih loose (nullable fields untuk save-as-draft)

### 2.6 Controllers — Customer Orders

- [ ] Buat `app/Http/Controllers/Customer/OrderController.php`
  - `index()`: list order milik customer yang login, dengan filter status
  - `show(Order $order)`: detail order, enforce ownership
  - `storeTailor(StoreTailorOrderRequest $request)`: submit tailor order final
  - `saveDraft(SaveDraftRequest $request)`: simpan draft
  - `submitDraft(Order $order, ...)`: submit draft ke pending
- [ ] Buat `app/Http/Controllers/Customer/PaymentController.php`
  - `index()`: list riwayat pembayaran milik customer yang login
  - `store(Order $order, ...)`: submit pembayaran dari customer portal
  - `uploadProof(Payment $payment, ...)`: upload bukti transfer (BR-P03)

### 2.7 Routes — Tambahan di `routes/customer.php`

```php
Route::middleware(['auth', 'role:customer'])->group(function () {
    // ... existing routes ...

    // Orders
    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('orders/tailor', [OrderController::class, 'storeTailor'])->name('orders.tailor.store');
    Route::post('orders/draft', [OrderController::class, 'saveDraft'])->name('orders.draft.store');
    Route::post('orders/{order}/submit', [OrderController::class, 'submitDraft'])->name('orders.draft.submit');

    // Payments
    Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::post('orders/{order}/payments', [PaymentController::class, 'store'])->name('payments.store');
    Route::post('payments/{payment}/proof', [PaymentController::class, 'uploadProof'])->name('payments.upload-proof');
});
```

- [ ] Tambahkan route publik (pre-auth):
  ```php
  Route::get('tailor/configure', TailorConfiguratorController::class)->name('tailor.configure');
  Route::get('services/tailor', [ServiceController::class, 'tailor'])->name('services.tailor');
  ```

### 2.8 Controllers — Public Customer App

- [ ] Buat `app/Http/Controllers/Customer/ServiceController.php`
  - `tailor()`: render halaman layanan tailor (marketing + CTA login/register)
- [ ] Buat `app/Http/Controllers/Customer/TailorConfiguratorController.php`
  - `__invoke()`: render halaman configurator
  - Props: garment models aktif, fabrics aktif, discount policy, measurements (jika auth)

### 2.9 Frontend Pages

- [ ] Buat `resources/js/pages/Customer/Services/Tailor.tsx`
  - Halaman marketing layanan tailor
  - CTA ke configurator atau login jika belum auth

- [ ] Buat `resources/js/pages/Customer/Tailor/Configurator.tsx`
  - **6-step wizard:**
  - `Step 1 — Model`: grid card pilih garment model (image, nama, deskripsi)
  - `Step 2 — Bahan`: grid card pilih fabric (nama, karakter, estimasi harga)
  - `Step 3 — Ukuran`: dropdown ukuran tersimpan ATAU input manual ATAU opsi "ukur di toko"
  - `Step 4 — Detail`: qty stepper, due date picker, catatan (textarea)
  - `Step 5 — Ringkasan`: subtotal, loyalty discount badge (jika eligible), total, info DP minimum
  - `Step 6 — Pembayaran DP`: toggle cash/transfer, nominal, upload bukti (jika transfer)
  - State management: `useState` per step, progress bar
  - Guest mode: bisa explore sampai Step 5, step 6 butuh login
  - Estimasi biaya realtime di client (BR-T05 — final di backend)

- [ ] Buat `resources/js/pages/Customer/Orders/Index.tsx`
  - List order milik sendiri
  - Filter by status (menggunakan customer-facing label, bukan internal label)
  - Empty state yang encouraging (buat order pertama)

- [ ] Buat `resources/js/pages/Customer/Orders/Show.tsx`
  - Detail order customer-facing
  - Status dengan label customer-friendly (mapping dari BR-U03)
  - Timeline sederhana (tanpa audit log teknis)
  - Section pembayaran: daftar payment, tombol bayar lagi jika outstanding > 0
  - Upload bukti transfer

- [ ] Buat `resources/js/pages/Customer/Payments/Index.tsx`
  - Daftar riwayat pembayaran
  - Badge status: Menunggu Verifikasi / Terverifikasi / Ditolak

- [ ] Buat komponen `resources/js/components/customer/CustomerStatusBadge.tsx`
  - Mapping internal status → customer-friendly label (BR-U03)

### 2.10 Tests

- [ ] `tests/Feature/Customer/TailorOrderTest.php`
  - Customer bisa submit tailor order → order tersimpan dengan customer_id benar
  - Customer hanya melihat order miliknya
  - Customer tidak bisa lihat order milik customer lain
  - Draft bisa disimpan dan disubmit nanti
- [ ] `tests/Feature/Customer/PaymentUploadTest.php`
  - Customer bisa upload bukti transfer (BR-P03)
  - Upload tersimpan dan terhubung ke payment record

### Definition of Done — Phase 2

- [ ] Customer bisa membuat tailor order secara mandiri dari portal
- [ ] Draft tersimpan dan bisa dilanjutkan
- [ ] Upload bukti transfer berfungsi
- [ ] Customer hanya bisa lihat order miliknya (ownership enforced)
- [ ] Total final dihitung di backend (bukan hanya di client)
- [ ] Semua test pass

---

## Phase 3 — Ready-to-Wear Commerce

**Goal:** Customer dapat browse katalog, tambah ke cart, checkout, dan memilih pickup atau delivery.

### 3.1 Migration & Schema

- [ ] Buat migration `create_carts_table`
  ```
  id, user_id (FK → users, unique), timestamps
  ```
- [ ] Buat migration `create_cart_items_table`
  ```
  id, cart_id (FK → carts, cascade delete),
  product_id (FK → products, restrict delete),
  qty (integer), timestamps
  ```
  - Constraint: qty > 0

### 3.2 Models

- [ ] Buat `app/Models/Cart.php`
  - `belongsTo(User::class)`
  - `hasMany(CartItem::class)`
  - Helper: `totalAmount(): float` — sum of (item.qty * product.selling_price)
- [ ] Buat `app/Models/CartItem.php`
  - `belongsTo(Cart::class)`
  - `belongsTo(Product::class)`
  - `casts`: qty → integer
- [ ] Update `app/Models/User.php`
  - Tambah relasi `cart(): HasOne`
- [ ] Update `app/Models/Product.php`
  - Tambah relasi `cartItems(): HasMany`
  - Tambah relasi `orderItems(): HasMany`

### 3.3 Services

- [ ] Buat `app/Services/StockService.php`
  - `validateStock(Product $product, int $qty): void` — throw ValidationException jika qty > stock (BR-R01)
  - `decrementStock(Product $product, int $qty): Product` — kurangi stock
  - `decrementOnVerifiedPayment(Order $order): void` — decrement stock semua items setelah payment verified (BR-R02)
  - `isLowStock(Product $product, int $threshold = 5): bool`
- [ ] Buat `app/Services/CartService.php`
  - `getOrCreate(User $user): Cart`
  - `addItem(Cart $cart, Product $product, int $qty): CartItem` — validate stock dulu
  - `updateItem(CartItem $item, int $qty): CartItem` — validate stock dulu
  - `removeItem(CartItem $item): void`
  - `clear(Cart $cart): void`
- [ ] Buat `app/Services/ReadyWearOrderService.php`
  - `createFromCart(Cart $cart, array $payload, User $user): Order` — buat order RTW dari cart
  - Enforce BR-R01 (stock validation) sebelum create
  - Enforce BR-R04 (alamat wajib jika delivery)
  - Enforce BR-R02 (stock decrement via StockService — dipanggil saat payment verified)
  - Simpan shipment jika delivery
- [ ] Update `app/Services/PaymentService.php`
  - Setelah verifikasi transfer, panggil `StockService::decrementOnVerifiedPayment()` jika order type RTW

### 3.4 Policies

- [ ] Buat `app/Policies/CartPolicy.php`
  - Customer hanya bisa akses cart miliknya sendiri

### 3.5 Form Requests

- [ ] Buat `app/Http/Requests/Customer/StoreCartItemRequest.php`
  - product_id (required, exists:products,id, is_active=true), qty (required, integer, min:1)
- [ ] Buat `app/Http/Requests/Customer/UpdateCartItemRequest.php`
  - qty (required, integer, min:1)
- [ ] Buat `app/Http/Requests/Customer/CheckoutRequest.php`
  - delivery_type: enum pickup|delivery
  - address_id: required_if delivery
  - courier_id: nullable
  - payment.method, payment.amount

### 3.6 Controllers

- [ ] Buat `app/Http/Controllers/Customer/CatalogController.php`
  - `index()`: list produk aktif, filter by kategori/ukuran, pagination
  - `show(Product $product)`: detail produk
- [ ] Buat `app/Http/Controllers/Customer/CartController.php`
  - `index()`: tampilkan isi cart beserta total
- [ ] Buat `app/Http/Controllers/Customer/CartItemController.php`
  - `store()`: tambah item ke cart
  - `update(CartItem $item)`: update qty
  - `destroy(CartItem $item)`: hapus dari cart
- [ ] Buat `app/Http/Controllers/Customer/CheckoutController.php`
  - `index()`: tampilkan summary checkout + pilihan delivery
  - `store(CheckoutRequest $request)`: proses checkout → buat order RTW

### 3.7 Routes — Tambahan di `routes/customer.php`

```php
// Public catalog
Route::get('catalog', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('catalog/{product}', [CatalogController::class, 'show'])->name('catalog.show');
Route::get('services/ready-to-wear', [ServiceController::class, 'readyToWear'])->name('services.rtw');

// Auth required
Route::middleware(['auth', 'role:customer'])->group(function () {
    Route::get('cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('cart/items', [CartItemController::class, 'store'])->name('cart.items.store');
    Route::put('cart/items/{item}', [CartItemController::class, 'update'])->name('cart.items.update');
    Route::delete('cart/items/{item}', [CartItemController::class, 'destroy'])->name('cart.items.destroy');
    Route::get('checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');
});
```

### 3.8 Frontend Pages

- [ ] Buat `resources/js/pages/Customer/Catalog/Index.tsx`
  - Product grid dengan filter kategori dan ukuran
  - Clearance badge
  - Stock badge (Tersedia / Hampir Habis / Habis)
  - Add to cart button (redirect ke login jika belum auth)

- [ ] Buat `resources/js/pages/Customer/Catalog/Show.tsx`
  - Gambar produk, nama, deskripsi, harga
  - Size selector (chips yang disabled jika stock = 0)
  - Qty stepper
  - Tombol [Tambah ke Keranjang]

- [ ] Buat `resources/js/pages/Customer/Cart/Index.tsx`
  - List cart items: gambar, nama, size, qty stepper, subtotal
  - Total keseluruhan
  - Tombol [Hapus item] dan [Lanjut Checkout]

- [ ] Buat `resources/js/pages/Customer/Checkout/Index.tsx`
  - Summary order
  - Pilihan: Pickup atau Delivery (radio)
  - Jika Delivery: pilih alamat tersimpan atau input baru, kurir + ongkir
  - Pembayaran: cash atau transfer
  - Tombol [Konfirmasi Order]

- [ ] Buat `resources/js/pages/Customer/Services/ReadyToWear.tsx`
  - Halaman marketing RTW + CTA ke katalog

- [ ] Update `resources/js/pages/Customer/Dashboard/Index.tsx`
  - Tambah shortcut ke katalog

### 3.9 Tests

- [ ] `tests/Feature/Customer/ReadyWearOrderTest.php`
  - Tidak bisa checkout jika qty > stok (BR-R01)
  - Stok tidak berkurang saat order dibuat, berkurang setelah payment verified (BR-R02)
  - Hanya bisa checkout ukuran yang tersedia (BR-R03)
  - Delivery wajib memiliki alamat (BR-R04)
  - Pickup tidak butuh alamat
- [ ] `tests/Feature/CartTest.php`
  - Add, update, remove cart items
  - Cart terisolasi per user

### Definition of Done — Phase 3

- [ ] Customer bisa browse katalog, cart, dan checkout RTW
- [ ] Stock validation enforced di backend, bukan hanya UI
- [ ] Stock berkurang HANYA setelah payment verified
- [ ] Alur delivery + pickup berfungsi dengan benar
- [ ] Semua test pass

---

## Phase 4 — Convection Customer Flow

**Goal:** Customer dapat membuat permintaan order konveksi massal dari portal.

### 4.1 Migration & Schema

- [ ] Buat migration `add_production_stage_to_orders_table`
  - Tambah kolom `production_stage` (string, nullable) — untuk tracking progress konveksi
  - Nilai: `design`, `material`, `production`, `qc`, `packing`, `shipping`
- [ ] Buat migration `create_order_attachments_table`
  - `id, order_id (FK), file_path (string 500), file_name (string), file_type (string 50), uploaded_by (FK → users), timestamps`

### 4.2 Models

- [ ] Buat `app/Models/OrderAttachment.php`
  - `fillable`: order_id, file_path, file_name, file_type, uploaded_by
  - `belongsTo(Order::class)`, `belongsTo(User::class, 'uploaded_by')`
- [ ] Update `app/Models/Order.php`
  - Tambah `production_stage` ke `$fillable`
  - Tambah relasi `attachments(): HasMany(OrderAttachment::class)`

### 4.3 Enums

- [ ] Buat `app/Enums/ProductionStage.php`
  ```php
  enum ProductionStage: string {
      case Design   = 'design';
      case Material = 'material';
      case Production = 'production';
      case QC       = 'qc';
      case Packing  = 'packing';
      case Shipping = 'shipping';
  }
  ```

### 4.4 Services

- [ ] Buat `app/Services/ConvectionOrderService.php`
  - `create(array $payload, User $user): Order`
    - Buat order dengan type `OrderType::Convection`
    - Create multiple `OrderItem` dari payload items
    - Catat audit log
  - `validateFullPaymentGate(Order $order): void` — enforce BR-C01
    - IN_PROGRESS hanya jika outstanding == 0 dan ada payment verified
- [ ] Update `app/Services/OrderStatusService.php`
  - Tambahkan aturan untuk konveksi di `validateTransition()`
  - BR-C01: Convection order tidak bisa masuk IN_PROGRESS jika belum 100% lunas
  - Tambahkan `updateProductionStage(Order $order, ProductionStage $stage, User $user): Order`
- [ ] Buat `app/Services/AttachmentService.php`
  - `upload(Order $order, UploadedFile $file, User $user): OrderAttachment`
  - Simpan ke storage, buat record attachment
  - Validasi tipe file dan ukuran

### 4.5 Form Requests

- [ ] Buat `app/Http/Requests/Customer/StoreConvectionOrderRequest.php`
  - company_name (required), spec_notes, items (array min:1), payment
  - items[].item_name (required), items[].qty (required, min:1), items[].unit_price (required)
- [ ] Buat `app/Http/Requests/Customer/UploadAttachmentRequest.php`
  - file: required, mimes:jpg,jpeg,png,pdf, max:5120

### 4.6 Controllers

- [ ] Buat `app/Http/Controllers/Customer/ConvectionController.php`
  - `create()`: render halaman form konveksi
  - `store(StoreConvectionOrderRequest $request)`: submit konveksi order
- [ ] Update `app/Http/Controllers/Customer/OrderController.php`
  - Tambah `uploadAttachment(Order $order, UploadAttachmentRequest $request)`

### 4.7 Routes — Tambahan di `routes/customer.php`

```php
Route::get('services/convection', [ServiceController::class, 'convection'])->name('services.convection');

Route::middleware(['auth', 'role:customer'])->group(function () {
    Route::get('convection/request', [ConvectionController::class, 'create'])->name('convection.create');
    Route::post('convection', [ConvectionController::class, 'store'])->name('convection.store');
    Route::post('orders/{order}/attachments', [OrderController::class, 'uploadAttachment'])->name('orders.attachments.store');
});
```

### 4.8 Frontend Pages

- [ ] Buat `resources/js/pages/Customer/Services/Convection.tsx`
  - Halaman marketing layanan konveksi + CTA

- [ ] Buat `resources/js/pages/Customer/Convection/Create.tsx`
  - **3-step wizard:**
  - `Step 1 — Detail Perusahaan`: nama perusahaan / PIC, catatan desain/spesifikasi
  - `Step 2 — Daftar Item`: form item builder (nama, qty, harga satuan, subtotal per item), tombol [+ Tambah Item] / [🗑 Hapus], total keseluruhan
  - `Step 3 — Pembayaran Penuh`: banner peringatan "Konveksi wajib lunas 100% sebelum produksi", nominal + method, upload bukti jika transfer
  - Upload desain referensi (opsional di step 1 atau 2)

- [ ] Update `resources/js/pages/Customer/Orders/Show.tsx`
  - Tambah production stage tracker untuk order konveksi
  - Tampilkan tahapan: Desain → Persiapan Bahan → Produksi → QC → Packing → Pengiriman
  - Tombol upload lampiran

- [ ] Buat komponen `resources/js/components/customer/ProductionStageTracker.tsx`
  - Visual stepper progress tahapan produksi konveksi

### 4.9 Tests

- [ ] `tests/Feature/Customer/ConvectionOrderTest.php`
  - Customer bisa submit konveksi order dengan items
  - IN_PROGRESS hanya bisa jika 100% payment verified (BR-C01)
  - Items tersimpan benar
  - Upload lampiran tersimpan dan terhubung
- [ ] `tests/Feature/OrderAttachmentTest.php`
  - Tipe file tidak diizinkan ditolak
  - File tersimpan dan bisa diakses

### Definition of Done — Phase 4

- [ ] Customer bisa submit konveksi order dengan multi-item
- [ ] Upload lampiran desain berfungsi
- [ ] IN_PROGRESS diblokir jika belum 100% lunas (BR-C01)
- [ ] Production stage tracker tampil di order detail customer
- [ ] Semua test pass

---

## Phase 5 — Office Consolidation & Admin Modules

**Goal:** Lengkapi semua modul internal office yang belum ada, termasuk production board, shipping management, inventory, user management, master data CRUD, discount policy UI, laporan dasar, dan audit log viewer.

### 5.1 Services Baru

- [ ] Buat `app/Services/DocumentService.php`
  - `generateNota(Order $order): string` — generate HTML/PDF nota pesanan
  - `generateKwitansi(Payment $payment): string` — generate HTML/PDF kwitansi
  - `exportReport(array $filters): string` — export PDF laporan
  - Gunakan library: `barryvdh/laravel-dompdf` atau blade view + `response()->streamDownload()`
- [ ] Buat `app/Services/UserService.php`
  - `create(array $payload): User` — buat user staff (tanpa registrasi publik)
  - `update(User $user, array $payload): User`
  - `toggleActive(User $user): User`
  - Catat audit log untuk setiap aksi
- [ ] Buat `app/Services/ReportService.php`
  - `revenueByPeriod(Carbon $from, Carbon $to): array`
  - `paymentMethodBreakdown(Carbon $from, Carbon $to): array`
  - `loyalCustomers(): Collection`
  - `lowStockProducts(int $threshold = 5): Collection`

### 5.2 Form Requests

- [ ] Buat `app/Http/Requests/Office/Admin/StoreUserRequest.php`
- [ ] Buat `app/Http/Requests/Office/Admin/UpdateUserRequest.php`
- [ ] Buat `app/Http/Requests/Office/Admin/StoreProductRequest.php`
- [ ] Buat `app/Http/Requests/Office/Admin/UpdateProductRequest.php`
- [ ] Buat `app/Http/Requests/Office/Admin/StoreGarmentModelRequest.php`
- [ ] Buat `app/Http/Requests/Office/Admin/StoreFabricRequest.php`
- [ ] Buat `app/Http/Requests/Office/Admin/StoreCourierRequest.php`
- [ ] Buat `app/Http/Requests/Office/Admin/UpdateDiscountPolicyRequest.php`
- [ ] Buat `app/Http/Requests/Office/UpdateProductionStageRequest.php`
- [ ] Buat `app/Http/Requests/Office/UpdateShipmentRequest.php`

### 5.3 Policies

- [ ] Buat `app/Policies/UserPolicy.php`
  - `viewAny`, `create`, `update`, `delete`: hanya Admin
- [ ] Buat `app/Policies/ProductPolicy.php`
  - `viewAny`: Kasir, Admin, Owner — `create`, `update`, `delete`: hanya Admin
- [ ] Buat `app/Policies/ShipmentPolicy.php`
  - `update`: Kasir, Admin
- [ ] Buat `app/Policies/ReportPolicy.php`
  - `viewAny`: Admin, Owner

### 5.4 Controllers — Production

- [ ] Buat `app/Http/Controllers/Office/ProductionController.php`
  - `index()`: daftar order yang sedang in_progress atau done, diurutkan by due date
  - Filter by status dan order type
  - Tampilkan production stage untuk konveksi
- [ ] Update `app/Http/Controllers/Office/OrderController.php`
  - Tambah method `updateProductionStage(Order $order, UpdateProductionStageRequest $request)`
  - Tambah route `PUT /office/orders/{order}/production-stage`

### 5.5 Controllers — Shipping

- [ ] Buat `app/Http/Controllers/Office/ShippingController.php`
  - `index()`: daftar shipment dengan filter status
  - `update(Shipment $shipment, UpdateShipmentRequest $request)`: update info pengiriman (kurir, resi, status)

### 5.6 Controllers — Admin Modules

- [ ] Buat `app/Http/Controllers/Office/Admin/UserController.php`
  - `index()`: list semua user + filter by role
  - `store(StoreUserRequest $request)`: buat user baru (staff)
  - `update(User $user, UpdateUserRequest $request)`: edit role + aktif/nonaktif
  - `destroy(User $user)`: nonaktifkan (soft, bukan hard delete)
- [ ] Buat `app/Http/Controllers/Office/Admin/ProductController.php`
  - `index()`: list produk RTW, filter low stock dan clearance
  - `store()`, `update()`, `destroy()`
- [ ] Buat `app/Http/Controllers/Office/Admin/GarmentModelController.php`
  - `index()`: list garment models (inline editable)
  - `store()`, `update()`, `destroy()`
- [ ] Buat `app/Http/Controllers/Office/Admin/FabricController.php`
  - `index()`, `store()`, `update()`, `destroy()`
- [ ] Buat `app/Http/Controllers/Office/Admin/CourierController.php`
  - `index()`, `store()`, `update()`, `destroy()`
- [ ] Buat `app/Http/Controllers/Office/Admin/DiscountPolicyController.php`
  - `index()`: tampilkan policy saat ini + riwayat perubahan dari audit log
  - `update(DiscountPolicy $policy, UpdateDiscountPolicyRequest $request)`
- [ ] Buat `app/Http/Controllers/Office/ReportController.php`
  - `index()`: summary laporan dengan filter periode
  - `export()`: download PDF atau CSV
- [ ] Buat `app/Http/Controllers/Office/AuditLogController.php`
  - `index()`: list audit log dengan filter (user, modul, aksi, date range)

### 5.7 Document Endpoints

- [ ] Tambahkan endpoint di `routes/office.php`:
  ```php
  Route::get('orders/{order}/nota', [DocumentController::class, 'nota'])->name('orders.nota');
  Route::get('payments/{payment}/kwitansi', [DocumentController::class, 'kwitansi'])->name('payments.kwitansi');
  ```
- [ ] Buat `app/Http/Controllers/Office/DocumentController.php`
  - `nota(Order $order)`: download/print nota (BR-P05 — hanya untuk payment verified)
  - `kwitansi(Payment $payment)`: download/print kwitansi

### 5.8 Routes — Tambahan di `routes/office.php`

```php
// Production
Route::get('production', [ProductionController::class, 'index'])->name('production.index');
Route::put('orders/{order}/production-stage', [OrderController::class, 'updateProductionStage'])->name('orders.production-stage');

// Shipping
Route::get('shipping', [ShippingController::class, 'index'])->name('shipping.index');
Route::put('shipments/{shipment}', [ShippingController::class, 'update'])->name('shipments.update');

// Reports & Audit
Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
Route::get('reports/export', [ReportController::class, 'export'])->name('reports.export');
Route::get('audit-log', [AuditLogController::class, 'index'])->name('audit-log.index');

// Admin modules (role: admin only via Gate inside controllers)
Route::prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', Admin\UserController::class)->except(['show', 'create', 'edit']);
    Route::resource('products', Admin\ProductController::class)->except(['show', 'create', 'edit']);
    Route::resource('garment-models', Admin\GarmentModelController::class)->except(['show', 'create', 'edit']);
    Route::resource('fabrics', Admin\FabricController::class)->except(['show', 'create', 'edit']);
    Route::resource('couriers', Admin\CourierController::class)->except(['show', 'create', 'edit']);
    Route::get('discounts', [Admin\DiscountPolicyController::class, 'index'])->name('discounts.index');
    Route::put('discounts/{policy}', [Admin\DiscountPolicyController::class, 'update'])->name('discounts.update');
});

// Documents
Route::get('orders/{order}/nota', [DocumentController::class, 'nota'])->name('orders.nota');
Route::get('payments/{payment}/kwitansi', [DocumentController::class, 'kwitansi'])->name('payments.kwitansi');
```

### 5.9 Frontend Pages — Office

- [ ] Buat `resources/js/pages/Office/Production/Index.tsx`
  - List order in_progress diurutkan by due_date
  - Kanban atau tabel dengan kolom status
  - Quick update status dan production stage
  - Due date indicator (overdue = merah)

- [ ] Buat `resources/js/pages/Office/Shipping/Index.tsx`
  - List shipment dengan filter status
  - Form update kurir, no resi, status pengiriman
  - Tombol mark as delivered / shipped

- [ ] Buat `resources/js/pages/Office/Reports/Index.tsx`
  - Filter periode (Hari ini / 7 hari / 30 hari / Custom)
  - Tabs: Omzet | Pembayaran | Inventori | Pelanggan Loyal
  - Chart harian (line chart — Recharts)
  - Tombol Export PDF dan Export CSV

- [ ] Buat `resources/js/pages/Office/AuditLog/Index.tsx`
  - Filter: user, modul, aksi, date range
  - Timeline entries dengan expand → before/after JSON diff
  - Pagination

- [ ] Buat `resources/js/pages/Office/Admin/Users/Index.tsx`
  - Tabel: nama, email, role badge, status aktif, tombol aksi
  - Form tambah/edit user (shadcn Sheet)
  - Toggle aktif/nonaktif

- [ ] Buat `resources/js/pages/Office/Admin/Products/Index.tsx`
  - Tabel produk: gambar, nama, SKU, ukuran, stok badge, harga
  - Filter: Low Stock / Clearance
  - Form edit produk (shadcn Sheet)

- [ ] Buat `resources/js/pages/Office/Admin/MasterData/Index.tsx`
  - Tabs: Model Pakaian | Bahan | Kurir
  - Inline editable table per tab
  - Toggle aktif/nonaktif

- [ ] Buat `resources/js/pages/Office/Admin/Discounts/Index.tsx`
  - Form edit loyalty threshold + diskon persen
  - Riwayat perubahan dari audit log

- [ ] Update `resources/js/pages/Office/Orders/Show.tsx`
  - Tambah tombol Print Nota dan Print Kwitansi
  - Update status produksi untuk konveksi

- [ ] Update `resources/js/pages/Office/Dashboard/Index.tsx`
  - Dashboard berbeda per role (data sama, metric berbeda):
    - Kasir: order pending payment, transfer pending, total pembayaran hari ini
    - Produksi: order in_progress diurutkan due date, produksi terlambat
    - Admin: semua metrics, alert low stock, pending transfer
    - Owner: KPI omzet, loyal customers, revenue breakdown

### 5.10 Tests

- [ ] `tests/Feature/Office/Admin/UserManagementTest.php`
  - Admin bisa buat, edit, nonaktifkan user
  - Owner tidak bisa create/update user (403)
  - Kasir tidak bisa akses admin modules (403)
- [ ] `tests/Feature/Office/Admin/ProductManagementTest.php`
  - Admin bisa CRUD produk
  - StockService enforce non-negative stock
- [ ] `tests/Feature/Office/ReportTest.php`
  - Admin dan Owner bisa akses reports
  - Kasir tidak bisa akses (403) — atau limited access sesuai spec
- [ ] `tests/Feature/Office/ShippingTest.php`
  - Update shipment status terekam
  - Delivered status update ke order
- [ ] `tests/Feature/DocumentServiceTest.php`
  - Nota hanya tersedia jika ada payment verified (BR-P05)
  - Kwitansi hanya tersedia untuk payment verified

### Definition of Done — Phase 5

- [ ] Semua modul admin tersedia di `/office/admin/*`
- [ ] Production board menampilkan order aktif dengan due date warning
- [ ] Shipping management bisa update status pengiriman
- [ ] Laporan tampil dengan chart dan bisa diexport
- [ ] Audit log bisa difilter dan di-expand per entry
- [ ] Nota dan kwitansi bisa di-print/download
- [ ] Owner hanya bisa GET (write operations return 403)
- [ ] Semua test pass

---

## Phase 6 — Notifications, Reports & Analytics

**Goal:** Customer menerima notifikasi status order. Office mendapat analytics yang lebih dalam.

### 6.1 Migration & Schema

- [ ] Buat migration `create_notifications_table` (atau gunakan Laravel built-in `notifications` table)
  - `id (uuid), type, notifiable_type, notifiable_id, data (json), read_at (timestamp nullable), created_at`

### 6.2 Notifications

- [ ] Buat `app/Notifications/PaymentVerifiedNotification.php`
  - Trigger: setelah kasir/admin verify transfer
  - Channel: database (in-app)
  - Payload: order_number, payment_amount, new_status
- [ ] Buat `app/Notifications/PaymentRejectedNotification.php`
  - Trigger: setelah admin reject transfer
  - Payload: order_number, rejection_reason
- [ ] Buat `app/Notifications/OrderInProgressNotification.php`
  - Trigger: status berubah ke in_progress
  - Payload: order_number, estimated_due_date
- [ ] Buat `app/Notifications/OrderReadyNotification.php`
  - Trigger: status berubah ke done
  - Payload: order_number, delivery_method (pickup/delivery)
- [ ] Buat `app/Notifications/OrderShippedNotification.php`
  - Trigger: shipment status = shipped
  - Payload: order_number, tracking_number, courier_name
- [ ] Update `app/Services/PaymentService.php`
  - Dispatch notifikasi setelah verify dan reject
- [ ] Update `app/Services/OrderStatusService.php`
  - Dispatch notifikasi saat status berubah ke in_progress, done

### 6.3 Controllers

- [ ] Buat `app/Http/Controllers/Customer/NotificationController.php`
  - `index()`: list notifikasi customer, dengan flag read/unread
  - `markRead(Notification $notification)`: tandai sudah dibaca
  - `markAllRead()`: tandai semua sudah dibaca

### 6.4 Routes

```php
Route::middleware(['auth', 'role:customer'])->group(function () {
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
});
```

### 6.5 Frontend Pages

- [ ] Buat `resources/js/pages/Customer/Notifications/Index.tsx`
  - List notifikasi (terbaru di atas)
  - Badge unread count di navbar
  - Tombol [Tandai Semua Dibaca]
  - Link ke order terkait

- [ ] Update `resources/js/layouts/customer-layout.tsx`
  - Tambah unread notification badge di nav
  - Fetch count dari shared Inertia props

- [ ] Update `resources/js/pages/Office/Reports/Index.tsx`
  - Tambah section: Repeat Order Rate
  - Tambah section: SLA / Order Overdue monitoring
  - Tambah section: Funnel (draft → submit → paid → closed)

### 6.6 Shared Inertia Props

- [ ] Update `app/Http/Middleware/HandleInertiaRequests.php`
  - Tambah `unread_notifications_count` ke shared props untuk customer role
  - Tambah `pending_transfer_count` ke shared props untuk kasir/admin role

### 6.7 Tests

- [ ] `tests/Feature/NotificationTest.php`
  - Notifikasi terkirim saat payment verified
  - Notifikasi terkirim saat payment rejected
  - Notifikasi terkirim saat status berubah ke in_progress
  - Customer hanya melihat notifikasinya sendiri
- [ ] `tests/Feature/Customer/NotificationControllerTest.php`
  - Mark read berfungsi
  - Mark all read berfungsi

### Definition of Done — Phase 6

- [ ] Customer menerima notifikasi in-app untuk semua event penting
- [ ] Unread badge terlihat di navbar customer
- [ ] Notifikasi hanya untuk customer yang bersangkutan
- [ ] Office reports menampilkan funnel dan SLA monitoring
- [ ] Semua test pass

---

## Cross-Cutting Tasks (Dilakukan Seiring Phase Berjalan)

### Testing Foundation

- [ ] Setup `tests/Pest.php` dengan helpers dan traits yang sering dipakai
- [ ] Buat `tests/Helpers/OrderFactory.php` — helper buat test order dengan state tertentu
- [ ] Setiap phase wajib menyertakan test sebelum dianggap done

### Seeding Update

- [ ] Setiap phase yang menambah entity baru harus update `DemoSystemSeeder`
  - Phase 1: user customer demo, address book contoh
  - Phase 3: cart + order RTW contoh
  - Phase 4: order konveksi contoh dengan attachment
  - Phase 5: user staff semua role

### Code Quality

- [ ] Jalankan `./vendor/bin/pint` sebelum commit setiap phase
- [ ] Jalankan `npm run types:check` sebelum commit setiap phase
- [ ] Tidak ada `dd()` atau debug statement tertinggal

### Documentation Update

- [ ] Update `CLAUDE.md` / `AGENTS.md` setelah setiap phase selesai dengan catatan state terbaru

---

## Dependency Map

```
Phase 0 ──────────────────────────────────────────── (independen, harus pertama)
           │
Phase 1 ──┘ (butuh Phase 0: layout, namespace)
           │
Phase 2 ──┘ (butuh Phase 1: customer auth, customer model)
           │
Phase 3 ──┘ (butuh Phase 1: customer auth, address, Phase 0: StockService independent)
           │
Phase 4 ──┘ (butuh Phase 1: customer auth, Phase 2: order flow, Phase 3: attachment service)
           │
Phase 5 ──┘ (butuh Phase 0–4 selesai untuk konsolidasi penuh)
           │
Phase 6 ──┘ (butuh Phase 1–5: semua events dan actors sudah ada)
```

---

## Business Rules Enforcement Checklist

| BR | Enforced Di | Phase |
|---|---|---|
| BR-T01: DP ≥ 50% sebelum in_progress (tailor) | `OrderStatusService::validateTransition()` | ✅ Sudah Ada |
| BR-T02: Tidak bisa close jika outstanding > 0 | `OrderStatusService::validateTransition()` | ✅ Sudah Ada |
| BR-T03: Auto-apply loyalty discount | `LoyaltyService::calculateDiscount()` | ✅ Sudah Ada |
| BR-T04: Pilih ukuran tersimpan / manual / offline | Customer Configurator Step 3 | Phase 2 |
| BR-T05: Estimasi di client, final di backend | `TailorOrderService::create()` | Phase 2 |
| BR-R01: Stock tidak boleh negatif | `StockService::validateStock()` | Phase 3 |
| BR-R02: Stock berkurang setelah payment verified | `StockService::decrementOnVerifiedPayment()` | Phase 3 |
| BR-R03: Checkout hanya ukuran tersedia | `CatalogController + CartService` | Phase 3 |
| BR-R04: Delivery wajib ada alamat + ongkir | `CheckoutRequest` | Phase 3 |
| BR-C01: Konveksi in_progress = 100% payment | `OrderStatusService::validateTransition()` | Phase 4 |
| BR-C02: Tahapan produksi konveksi | `ProductionStage enum + updateProductionStage()` | Phase 4 |
| BR-C03: Items wajib sebelum submit konveksi | `StoreConvectionOrderRequest` | Phase 4 |
| BR-P01: Cash → langsung verified | `PaymentService::record()` | ✅ Sudah Ada |
| BR-P02: Transfer → pending_verification | `PaymentService::record()` | ✅ Sudah Ada |
| BR-P03: Upload bukti transfer wajib (customer) | `AttachmentService / uploadProof()` | Phase 2 |
| BR-P04: Reject wajib ada alasan | `RejectPaymentRequest` | ✅ Sudah Ada |
| BR-P05: Kwitansi hanya untuk verified | `DocumentController (gate check)` | Phase 5 |
| BR-U01: Customer hanya lihat data miliknya | `OrderPolicy, AddressPolicy, etc.` | Phase 1 |
| BR-U02: Simpan address + measurement untuk reuse | `AddressController, MeasurementController` | Phase 1 |
| BR-U03: Customer-facing status lebih sederhana | `CustomerStatusBadge component` | Phase 2 |
| BR-U04: Draft order bisa disimpan | `DraftOrderService` | Phase 2 |
| BR-G01: Semua status change dicatat | `AuditLogService` | ✅ Sudah Ada |
| BR-G02: Aksi kritikal masuk audit log | `AuditLogService` | ✅ Sudah Ada |
| BR-G03: Business rules tidak hanya di frontend | Enforced di service layer | Ongoing |

---

## Teknologi Tambahan yang Perlu Diinstall Per Phase

| Package | Dibutuhkan Untuk | Phase |
|---|---|---|
| `barryvdh/laravel-dompdf` | DocumentService PDF generation | Phase 5 |
| `recharts` (npm) | Charts di Reports | Phase 5 |
| `motion` (npm) | Animasi Landing Page | Landing (opsional) |
| `@lenis/react` (npm) | Smooth scroll Landing | Landing (opsional) |

---

*Dokumen ini adalah living document. Update setiap phase selesai dengan catatan progress actual.*