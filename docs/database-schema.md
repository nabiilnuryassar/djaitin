# Database Schema — SIM Konveksi & Tailor (djaitin)

**Version:** 1.1  
**Date:** 2026-03-07  
**Database:** PostgreSQL

---

## Table of Contents

1. [Enums](#1-enums)
2. [ERD Overview](#2-erd-overview)
3. [Tables](#3-tables)
   - [users](#31-users)
   - [customers](#32-customers)
   - [measurements](#33-measurements)
   - [models (garment_models)](#34-garment_models)
   - [fabrics](#35-fabrics)
   - [products (ready-to-wear)](#36-products)
   - [couriers](#37-couriers)
   - [discount_policies](#38-discount_policies)
   - [orders](#39-orders)
   - [order_items](#310-order_items)
   - [payments](#311-payments)
   - [shipments](#312-shipments)
   - [audit_logs](#313-audit_logs)
4. [Indexes & Constraints Summary](#4-indexes--constraints-summary)

---

## 1. Enums

Semua enum diimplementasikan sebagai PHP 8.1 Backed Enums dan sebagai `CHECK` constraint di PostgreSQL.

### 1.1 UserRole

```php
enum UserRole: string
{
    case Kasir    = 'kasir';
    case Produksi = 'produksi';
    case Admin    = 'admin';
    case Owner    = 'owner';
}
```

### 1.2 OrderType

```php
enum OrderType: string
{
    case Tailor    = 'tailor';
    case ReadyWear = 'ready_wear';
    case Convection = 'convection';
}
```

### 1.3 OrderStatus

```php
enum OrderStatus: string
{
    case Draft             = 'draft';
    case PendingPayment    = 'pending_payment';
    case InProgress        = 'in_progress';
    case Done              = 'done';
    case Delivered         = 'delivered';
    case Pickup            = 'pickup';
    case Closed            = 'closed';
    case Cancelled         = 'cancelled';
}
```

### 1.4 PaymentMethod

```php
enum PaymentMethod: string
{
    case Cash     = 'cash';
    case Transfer = 'transfer';
}
```

### 1.5 PaymentStatus

```php
enum PaymentStatus: string
{
    case PendingVerification = 'pending_verification';
    case Verified            = 'verified';
    case Rejected            = 'rejected';
}
```

### 1.6 ShipmentStatus

```php
enum ShipmentStatus: string
{
    case Pending   = 'pending';
    case Shipped   = 'shipped';
    case Delivered = 'delivered';
    case Pickup    = 'pickup';
}
```

---

## 2. ERD Overview

```
users ──────────────── orders ──────────────── order_items
                          │                         │
customers ────────────────┘               products (ready_wear)
    │                     │
measurements          payments
                          │
                      audit_logs

orders ─── shipments ─── couriers

garment_models ──── orders (tailor)
fabrics        ──── orders (tailor)
discount_policies
```

---

## 3. Tables

### 3.1 `users`

Pengguna sistem (staff).

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | Auto-increment |
| `name` | `varchar(255)` | No | — | |
| `email` | `varchar(255)` | No | — | UNIQUE |
| `email_verified_at` | `timestamp` | Yes | NULL | |
| `password` | `varchar(255)` | No | — | Bcrypt hashed |
| `role` | `varchar(20)` | No | `'kasir'` | CHECK IN ('kasir','produksi','admin','owner') |
| `is_active` | `boolean` | No | `true` | Soft disable user |
| `remember_token` | `varchar(100)` | Yes | NULL | |
| `created_at` | `timestamp` | No | `now()` | |
| `updated_at` | `timestamp` | No | `now()` | |

**Relations:** `HasMany` orders (created_by), `HasMany` payments (created_by), `HasMany` audit_logs

---

### 3.2 `customers`

Pelanggan bisnis.

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | |
| `name` | `varchar(255)` | No | — | |
| `phone` | `varchar(20)` | Yes | NULL | |
| `address` | `text` | Yes | NULL | |
| `notes` | `text` | Yes | NULL | Catatan khusus |
| `is_loyalty_eligible` | `boolean` | No | `false` | Di-update otomatis saat CLOSED orders > threshold |
| `loyalty_order_count` | `integer` | No | `0` | Jumlah tailor orders dengan status CLOSED |
| `created_at` | `timestamp` | No | `now()` | |
| `updated_at` | `timestamp` | No | `now()` | |

**Relations:** `HasMany` orders, `HasMany` measurements

---

### 3.3 `measurements`

Riwayat ukuran pelanggan, per sesi fitting.

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | |
| `customer_id` | `bigint` UNSIGNED FK | No | — | FK → customers.id |
| `label` | `varchar(100)` | Yes | NULL | Misal: "Baju Kantor Maret 2026" |
| `chest` | `decimal(6,2)` | Yes | NULL | Lingkar dada (cm) |
| `waist` | `decimal(6,2)` | Yes | NULL | Lingkar pinggang (cm) |
| `hips` | `decimal(6,2)` | Yes | NULL | Lingkar pinggul (cm) |
| `shoulder` | `decimal(6,2)` | Yes | NULL | Lebar bahu (cm) |
| `sleeve_length` | `decimal(6,2)` | Yes | NULL | Panjang lengan (cm) |
| `shirt_length` | `decimal(6,2)` | Yes | NULL | Panjang baju (cm) |
| `inseam` | `decimal(6,2)` | Yes | NULL | Panjang dalam celana (cm) |
| `trouser_waist` | `decimal(6,2)` | Yes | NULL | Lingkar pinggang celana (cm) |
| `notes` | `text` | Yes | NULL | Catatan tambahan fitting |
| `created_at` | `timestamp` | No | `now()` | |
| `updated_at` | `timestamp` | No | `now()` | |

**Relations:** `BelongsTo` customer

---

### 3.4 `garment_models`

Master model/desain baju.

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | |
| `name` | `varchar(255)` | No | — | Nama model |
| `description` | `text` | Yes | NULL | |
| `image_path` | `varchar(500)` | Yes | NULL | Path gambar referensi |
| `is_active` | `boolean` | No | `true` | |
| `created_at` | `timestamp` | No | `now()` | |
| `updated_at` | `timestamp` | No | `now()` | |

---

### 3.5 `fabrics`

Master bahan kain.

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | |
| `name` | `varchar(255)` | No | — | Nama bahan |
| `description` | `text` | Yes | NULL | |
| `is_active` | `boolean` | No | `true` | |
| `created_at` | `timestamp` | No | `now()` | |
| `updated_at` | `timestamp` | No | `now()` | |

---

### 3.6 `products`

Inventory pakaian ready-to-wear.

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | |
| `sku` | `varchar(100)` | No | — | UNIQUE |
| `name` | `varchar(255)` | No | — | |
| `description` | `text` | Yes | NULL | |
| `category` | `varchar(100)` | Yes | NULL | Misal: kemeja, celana, dress |
| `size` | `varchar(20)` | No | — | S, M, L, XL, XXL, 28, 30, dst |
| `base_price` | `decimal(15,2)` | No | — | Harga pokok / cost price |
| `selling_price` | `decimal(15,2)` | No | — | Harga jual normal |
| `discount_amount` | `decimal(15,2)` | No | `0` | Diskon flat per item |
| `discount_percent` | `decimal(5,2)` | No | `0` | Diskon persen per item |
| `is_clearance` | `boolean` | No | `false` | Clearance mode (bisa jual sampai base_price) |
| `stock` | `integer` | No | `0` | CHECK stock >= 0 |
| `image_path` | `varchar(500)` | Yes | NULL | |
| `is_active` | `boolean` | No | `true` | |
| `created_at` | `timestamp` | No | `now()` | |
| `updated_at` | `timestamp` | No | `now()` | |

**Constraint:** `CHECK (stock >= 0)` — stok tidak boleh negatif di level DB.  
**Constraint:** Harga jual efektif tidak boleh < `base_price` kecuali `is_clearance = true`.

---

### 3.7 `couriers`

Master jasa pengiriman.

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | |
| `name` | `varchar(255)` | No | — | Misal: JNE, TIKI, Gojek, dst |
| `base_fee` | `decimal(15,2)` | No | `0` | Biaya jasa kurir yang dipakai sebagai ongkir checkout delivery |
| `is_active` | `boolean` | No | `true` | |
| `created_at` | `timestamp` | No | `now()` | |
| `updated_at` | `timestamp` | No | `now()` | |

---

### 3.8 `discount_policies`

Konfigurasi kebijakan diskon (loyalty & clearance).

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | |
| `key` | `varchar(100)` | No | — | UNIQUE. Misal: `loyalty_discount_percent`, `loyalty_order_threshold` |
| `value` | `varchar(255)` | No | — | Nilai config |
| `description` | `text` | Yes | NULL | |
| `updated_by` | `bigint` UNSIGNED FK | Yes | NULL | FK → users.id |
| `updated_at` | `timestamp` | No | `now()` | |
| `created_at` | `timestamp` | No | `now()` | |

**Seed values:**
- `loyalty_discount_percent` = `20`
- `loyalty_order_threshold` = `5`

---

### 3.9 `orders`

Tabel utama pesanan (Tailor, Ready-to-Wear, Convection).

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | |
| `order_number` | `varchar(50)` | No | — | UNIQUE. Format: `TLR-2026-0001`, `RTW-2026-0001`, `CVX-2026-0001` |
| `order_type` | `varchar(20)` | No | — | ENUM: tailor, ready_wear, convection |
| `status` | `varchar(30)` | No | `'draft'` | ENUM: lihat OrderStatus |
| `customer_id` | `bigint` UNSIGNED FK | No | — | FK → customers.id |
| `created_by` | `bigint` UNSIGNED FK | No | — | FK → users.id |
| `garment_model_id` | `bigint` UNSIGNED FK | Yes | NULL | FK → garment_models.id — untuk tailor |
| `fabric_id` | `bigint` UNSIGNED FK | Yes | NULL | FK → fabrics.id — untuk tailor |
| `measurement_id` | `bigint` UNSIGNED FK | Yes | NULL | FK → measurements.id — untuk tailor |
| `due_date` | `date` | Yes | NULL | Target selesai (tailor) |
| `company_name` | `varchar(255)` | Yes | NULL | Untuk convection: nama perusahaan/PIC |
| `spec_notes` | `text` | Yes | NULL | Catatan desain/spesifikasi (convection, tailor) |
| `subtotal` | `decimal(15,2)` | No | `0` | Total sebelum diskon |
| `discount_amount` | `decimal(15,2)` | No | `0` | Total diskon |
| `shipping_cost` | `decimal(15,2)` | No | `0` | Ongkir |
| `total_amount` | `decimal(15,2)` | No | `0` | Grand total yang harus dibayar |
| `paid_amount` | `decimal(15,2)` | No | `0` | Jumlah terbayar (verified only) |
| `outstanding_amount` | `decimal(15,2)` | No | `0` | total_amount - paid_amount (computed/maintained) |
| `is_loyalty_applied` | `boolean` | No | `false` | Apakah loyalty discount dipakai |
| `loyalty_overridden_by` | `bigint` UNSIGNED FK | Yes | NULL | FK → users.id — jika admin override |
| `cancellation_reason` | `text` | Yes | NULL | Wajib jika status = CANCELLED |
| `cancelled_by` | `bigint` UNSIGNED FK | Yes | NULL | FK → users.id |
| `cancelled_at` | `timestamp` | Yes | NULL | |
| `created_at` | `timestamp` | No | `now()` | |
| `updated_at` | `timestamp` | No | `now()` | |

**Relations:**
- `BelongsTo` customer
- `BelongsTo` user (created_by)
- `HasMany` order_items
- `HasMany` payments
- `HasOne` shipment
- `HasMany` audit_logs (polymorphic)

**Computed logic (maintained by OrderService):**
- `paid_amount` = SUM of verified payments
- `outstanding_amount` = `total_amount` - `paid_amount`

---

### 3.10 `order_items`

Item per order. Untuk Tailor: satu item per satu jenis jahitan. Untuk Ready-to-Wear: produk dari inventory. Untuk Convection: definisi item massal.

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | |
| `order_id` | `bigint` UNSIGNED FK | No | — | FK → orders.id, CASCADE DELETE |
| `product_id` | `bigint` UNSIGNED FK | Yes | NULL | FK → products.id — untuk ready_wear |
| `item_name` | `varchar(255)` | No | — | Nama item (snapshot saat order dibuat) |
| `description` | `text` | Yes | NULL | Spesifikasi tambahan |
| `size` | `varchar(50)` | Yes | NULL | Ukuran jika relevan |
| `qty` | `integer` | No | `1` | CHECK qty > 0 |
| `unit_price` | `decimal(15,2)` | No | — | Harga satuan saat order |
| `discount_amount` | `decimal(15,2)` | No | `0` | Diskon per item |
| `discount_percent` | `decimal(5,2)` | No | `0` | Diskon persen per item |
| `subtotal` | `decimal(15,2)` | No | — | (unit_price - discount_amount) * qty |
| `created_at` | `timestamp` | No | `now()` | |
| `updated_at` | `timestamp` | No | `now()` | |

**Relations:** `BelongsTo` order, `BelongsTo` product (nullable)

---

### 3.11 `payments`

Riwayat pembayaran per order.

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | |
| `payment_number` | `varchar(50)` | No | — | UNIQUE. Format: `PAY-2026-0001` |
| `order_id` | `bigint` UNSIGNED FK | No | — | FK → orders.id |
| `method` | `varchar(20)` | No | — | ENUM: cash, transfer |
| `status` | `varchar(30)` | No | — | ENUM: pending_verification, verified, rejected |
| `amount` | `decimal(15,2)` | No | — | Nominal pembayaran |
| `reference_number` | `varchar(255)` | Yes | NULL | Nomor referensi transfer (opsional untuk cash) |
| `proof_image_path` | `varchar(500)` | Yes | NULL | Path bukti transfer |
| `payment_date` | `timestamp` | No | — | Tanggal/waktu pembayaran dibuat |
| `created_by` | `bigint` UNSIGNED FK | No | — | FK → users.id |
| `verified_by` | `bigint` UNSIGNED FK | Yes | NULL | FK → users.id |
| `verified_at` | `timestamp` | Yes | NULL | |
| `rejection_reason` | `text` | Yes | NULL | Wajib jika status = REJECTED |
| `notes` | `text` | Yes | NULL | Catatan tambahan |
| `created_at` | `timestamp` | No | `now()` | |
| `updated_at` | `timestamp` | No | `now()` | |

**Business Rules enforced:**
- Cash → status langsung `verified`, `verified_at` = created_at, `verified_by` = created_by
- Transfer → status `pending_verification` hingga diverifikasi
- Saat payment `verified`: update `orders.paid_amount` dan `orders.outstanding_amount`

---

### 3.12 `shipments`

Informasi pengiriman per order (one-to-one dengan order).

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | |
| `order_id` | `bigint` UNSIGNED FK | No | — | FK → orders.id, UNIQUE |
| `courier_id` | `bigint` UNSIGNED FK | Yes | NULL | FK → couriers.id |
| `status` | `varchar(20)` | No | `'pending'` | ENUM: pending, shipped, delivered, pickup |
| `recipient_name` | `varchar(255)` | Yes | NULL | |
| `recipient_address` | `text` | Yes | NULL | |
| `recipient_phone` | `varchar(20)` | Yes | NULL | |
| `shipping_cost` | `decimal(15,2)` | No | `0` | Ongkir aktual |
| `tracking_number` | `varchar(255)` | Yes | NULL | Nomor resi (opsional) |
| `shipped_at` | `timestamp` | Yes | NULL | |
| `delivered_at` | `timestamp` | Yes | NULL | |
| `notes` | `text` | Yes | NULL | |
| `created_at` | `timestamp` | No | `now()` | |
| `updated_at` | `timestamp` | No | `now()` | |

**Relations:** `BelongsTo` order, `BelongsTo` courier

---

### 3.13 `audit_logs`

Rekaman semua aksi kritikal untuk keperluan audit dan activity log.

| Column | Type | Nullable | Default | Notes |
|---|---|:---:|---|---|
| `id` | `bigint` UNSIGNED PK | No | — | |
| `user_id` | `bigint` UNSIGNED FK | No | — | FK → users.id |
| `action` | `varchar(100)` | No | — | Misal: `order.status_changed`, `payment.verified`, `discount.overridden` |
| `auditable_type` | `varchar(255)` | No | — | Model class (polymorphic) |
| `auditable_id` | `bigint` UNSIGNED | No | — | ID dari model |
| `old_values` | `jsonb` | Yes | NULL | State sebelum perubahan |
| `new_values` | `jsonb` | Yes | NULL | State setelah perubahan |
| `notes` | `text` | Yes | NULL | Catatan tambahan (misal: alasan reject) |
| `ip_address` | `varchar(45)` | Yes | NULL | |
| `created_at` | `timestamp` | No | `now()` | |

**Indexed:** `auditable_type`, `auditable_id`, `user_id`, `action`, `created_at`

**Aksi yang wajib di-log:**
- `order.status_changed` — setiap perubahan status order
- `payment.verified` — verifikasi transfer
- `payment.rejected` — penolakan transfer
- `order.discount_overridden` — override loyalty discount oleh admin
- `order.closed` — penutupan order
- `order.cancelled` — pembatalan order

---

## 4. Indexes & Constraints Summary

| Table | Index / Constraint |
|---|---|
| `users` | UNIQUE `email` |
| `customers` | INDEX `name`, `phone` |
| `products` | UNIQUE `sku`; CHECK `stock >= 0` |
| `orders` | UNIQUE `order_number`; INDEX `customer_id`, `status`, `order_type`, `created_at` |
| `payments` | UNIQUE `payment_number`; INDEX `order_id`, `status` |
| `audit_logs` | INDEX (`auditable_type`, `auditable_id`); INDEX `user_id`; INDEX `created_at` |
| `discount_policies` | UNIQUE `key` |
| `shipments` | UNIQUE `order_id` |

### 4.1 Foreign Key Cascade Rules

| Relationship | On Delete |
|---|---|
| `order_items` → `orders` | CASCADE |
| `payments` → `orders` | RESTRICT (jangan hapus order yang punya payment) |
| `shipments` → `orders` | CASCADE |
| `measurements` → `customers` | RESTRICT |
| `orders` → `customers` | RESTRICT |
