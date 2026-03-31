# Planning — Djaitin Customer App

**Version:** 1.0  
**Date:** 2026-03-08  
**Surface:** `/app/*`  
**Audience:** Visitor dan Customer

---

## 1. Product Intent

Customer App harus terasa seperti aplikasi pemesanan yang mudah dipahami customer awam, bukan panel admin yang dipindahkan ke depan.

Fokusnya:
- interaktif
- mobile-first
- jelas step-by-step
- transparan soal biaya, pembayaran, dan status

---

## 2. Main Jobs To Be Done

### Visitor
- memahami layanan
- mencoba konfigurasi pesanan
- melihat produk
- terdorong untuk login/register

### Customer
- membuat order
- membayar
- melihat progress
- menyimpan data pribadi untuk reuse

---

## 3. Information Architecture

### Public / Pre-Login

- Home
- Services
- Tailor Configurator
- RTW Catalog
- Convection Request
- Login / Register

### Authenticated / Post-Login

- Dashboard
- Pesanan Saya
- Pembayaran
- Ukuran Saya
- Alamat
- Profil
- Notifikasi

---

## 4. Core Experience Design

### 4.1 Tailor Configurator

Tailor flow harus menjadi fitur hero.

**Step 1 — Jenis Pakaian**
- pilih kategori
- pilih model
- tampil preview card dan deskripsi

**Step 2 — Bahan**
- tampil pilihan bahan dalam card/grid
- tampil karakter bahan
- jika ada, tampil estimasi harga dasar

**Step 3 — Ukuran**
- pilih ukuran tersimpan
- atau input ukuran baru
- atau pilih opsi datang ke toko untuk pengukuran

**Step 4 — Detail Pesanan**
- due date preference
- qty
- catatan tambahan

**Step 5 — Ringkasan**
- subtotal
- diskon loyalty jika eligible
- total
- informasi DP minimum

**Step 6 — Pembayaran**
- cash / transfer
- nominal DP
- upload bukti bila perlu

### 4.2 Ready-to-Wear Flow

- katalog grid
- filter kategori / ukuran
- product detail
- add to cart
- checkout
- pickup atau delivery

### 4.3 Convection Flow

- company / PIC form
- item builder berulang
- upload referensi desain
- total summary
- full-payment instruction

---

## 5. Customer Dashboard Modules

### Dashboard
- active orders
- pending payments
- quick action buat order baru
- reminder pickup / payment

### Pesanan Saya
- list by status
- detail per order
- timeline progress
- shipment / pickup info

### Pembayaran
- daftar invoice / payment
- status verification
- upload / re-upload proof

### Ukuran Saya
- list ukuran tersimpan
- create / edit
- tandai favorit / default

### Alamat
- address book
- default shipping address

### Profil
- data akun
- phone
- preferred contact

### Notifikasi
- payment verified
- payment rejected
- order in progress
- ready pickup
- shipped / delivered

---

## 6. Backend Requirements

### New/Adjusted Domain Needs

- `customer` role
- customer ownership policy
- address entity
- optional order draft support
- customer notification feed
- upload proof flow for customer

### Shared Services That Must Be Reused

- `TailorOrderService`
- `PaymentService`
- `OrderStatusService`
- `LoyaltyService`
- `AuditLogService`

Customer surface tidak boleh membuat kalkulasi atau status logic sendiri di luar service layer.

---

## 7. Route Recommendation

| Purpose | Route |
|---|---|
| Customer home | `/app` |
| Tailor configurator | `/app/tailor/configure` |
| RTW catalog | `/app/catalog` |
| Cart | `/app/cart` |
| Checkout | `/app/checkout` |
| Dashboard | `/app/dashboard` |
| Orders | `/app/orders` |
| Payments | `/app/payments` |
| Measurements | `/app/measurements` |
| Addresses | `/app/addresses` |
| Profile | `/app/profile` |
| Notifications | `/app/notifications` |

---

## 8. Implementation Phases

### Phase A — Foundation
- customer auth
- customer layout
- dashboard shell
- profile
- address
- measurements

### Phase B — Tailor
- configurator UI
- draft support
- tailor store endpoint
- customer order detail

### Phase C — RTW
- catalog
- cart
- checkout
- shipping choice

### Phase D — Convection
- request builder
- document / image upload
- full payment flow

### Phase E — Notifications
- in-app notification center
- event-driven updates

---

## 9. Testing Plan

- customer can register and login
- customer cannot access another customer's order
- customer can save and reuse measurement
- tailor configurator submits valid order
- RTW checkout respects stock
- convection order requires required item data
- transfer proof upload is stored and linked correctly

---

## 10. UX Success Criteria

Customer app dianggap berhasil jika:

- user bisa membuat order tanpa bantuan staf
- struktur langkah mudah dipahami di mobile
- biaya dan status tidak membingungkan
- customer terdorong menyimpan data untuk repeat order
- internal staff tidak perlu entry ulang order customer secara manual
