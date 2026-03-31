# System Specification — Djaitin Ecosystem

**Version:** 2.0  
**Date:** 2026-03-08  
**Owner:** Product / Founder  
**Scope:** Target architecture for landing, customer app, customer portal, and internal office

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Surface Definitions](#3-surface-definitions)
4. [RBAC — Roles & Permissions](#4-rbac--roles--permissions)
5. [Business Rules (Absolute)](#5-business-rules-absolute)
6. [Status Workflows](#6-status-workflows)
7. [Functional Requirements Summary](#7-functional-requirements-summary)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Implementation Notes](#9-implementation-notes)

---

## 1. Project Overview

**Djaitin** adalah ekosistem aplikasi untuk bisnis tailor, ready-to-wear, dan konveksi yang mencakup:

| Area | Tujuan |
|---|---|
| **Landing Page** | Marketing, edukasi layanan, akuisisi user |
| **Customer App** | Pemilihan layanan, konfigurasi pesanan, checkout |
| **User Dashboard** | Tracking order, pembayaran, ukuran, profil |
| **Internal CMS / Backoffice** | Operasional harian dan master data |
| **Role-Based Internal Dashboard** | Workspace berbeda untuk kasir, produksi, admin, owner |

Djaitin bukan hanya website company profile. Sistem ini adalah **platform transaksi customer + operating system internal** dalam satu codebase.

### 1.1 Layanan Utama

| Layanan | Deskripsi |
|---|---|
| **Tailor (Jahit Custom)** | Customer memilih model, bahan, ukuran, dan membayar DP. |
| **Ready-to-Wear** | Customer membeli produk stok, memilih ukuran, checkout, pickup atau delivery. |
| **Convection** | Customer membuat pesanan massal lengkap dengan spesifikasi dan referensi desain. |

### 1.2 Product Naming

| Product | Description |
|---|---|
| **Djaitin Site** | Landing page publik |
| **Djaitin Customer** | Customer App + User Dashboard |
| **Djaitin Office** | Internal Backoffice + role-based dashboard |

---

## 2. Architecture

### 2.1 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12 (PHP 8.4) |
| Frontend | React + Inertia.js v2 |
| Database | PostgreSQL |
| Testing | Pest 4 |
| Auth | Laravel Fortify |
| Routing (FE) | Laravel Wayfinder |
| Styling | Tailwind CSS |

### 2.2 Logical Architecture — 5 Experiences, 3 Web Surfaces, 1 Codebase

Djaitin memiliki **5 pengalaman produk**, tetapi secara implementasi web dibagi menjadi **3 route surface**:

| Experience | Web Surface | Prefix | Audience |
|---|---|---|---|
| Landing Page | Public | `/` | Visitor |
| Customer App | Customer | `/app/*` | Visitor + Customer |
| User Dashboard | Customer | `/app/*` | Authenticated Customer |
| Internal CMS / Backoffice | Office | `/office/*` | Staff internal |
| Role-Based Internal Dashboard | Office | `/office/*` | Kasir, Produksi, Admin, Owner |

### 2.3 Target Web Surface Structure

```
Public Layer
│
├── Landing Page                    → /
│
Customer Layer
│
├── Customer App                    → /app/*
└── User Dashboard                  → /app/dashboard/*
│
Internal Layer
│
└── Djaitin Office                  → /office/*
    ├── Dashboard Kasir
    ├── Dashboard Produksi
    ├── Dashboard Admin
    ├── Dashboard Owner
    └── CMS / Backoffice modules
```

### 2.4 Route File Strategy

```php
// routes/web.php

// Public landing
Route::group(base_path('routes/landing.php'));

// Customer surface
Route::prefix('app')
    ->name('customer.')
    ->group(base_path('routes/customer.php'));

// Internal office surface
Route::middleware(['auth', 'role:kasir,produksi,admin,owner'])
    ->prefix('office')
    ->name('office.')
    ->group(base_path('routes/office.php'));
```

### 2.5 Layout Strategy

| Surface | Layout |
|---|---|
| Landing | `LandingLayout` |
| Customer App / User Dashboard | `CustomerLayout` |
| Internal Office | `OfficeLayout` |

### 2.6 Directory Conventions

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Landing/
│   │   ├── Customer/
│   │   └── Office/
│   ├── Requests/
│   └── Middleware/
├── Services/
├── Models/
├── Enums/
└── Policies/

routes/
├── web.php
├── landing.php
├── customer.php
└── office.php

resources/js/
├── pages/
│   ├── Landing/
│   ├── Customer/
│   └── Office/
├── layouts/
│   ├── LandingLayout.tsx
│   ├── CustomerLayout.tsx
│   └── OfficeLayout.tsx
└── components/
    ├── landing/
    ├── customer/
    └── office/
```

---

## 3. Surface Definitions

### 3.1 Landing Page

**Goal:** edukasi, trust building, dan akuisisi.

**Key pages:**
- Beranda
- Fitur Sistem
- Solusi
- Cara Kerja
- FAQ
- Kontak
- Login / Register

### 3.2 Customer App

Customer App adalah area transaksi untuk customer, baik sebelum maupun sesudah login.

**Core jobs to be done:**
- memilih layanan
- menyusun pesanan secara interaktif
- melihat estimasi biaya
- checkout
- bayar dan upload bukti transfer

**Interactive flow expectation:**

#### Tailor
1. Pilih kategori pakaian
2. Pilih model
3. Pilih bahan
4. Pilih metode ukuran
5. Lihat estimasi biaya
6. Bayar DP
7. Pantau status pesanan

#### Ready-to-Wear
1. Browse katalog
2. Pilih ukuran dan qty
3. Tambahkan ke keranjang
4. Checkout
5. Pilih pickup atau delivery
6. Bayar

#### Convection
1. Isi detail perusahaan / PIC
2. Tambah item produksi dan jumlah
3. Upload referensi desain
4. Review quotation summary
5. Bayar penuh

### 3.3 User Dashboard

User Dashboard adalah bagian authenticated dari customer surface.

**Menu utama:**
- Dashboard
- Pesanan Saya
- Pembayaran
- Ukuran Saya
- Alamat Pengiriman
- Profil
- Notifikasi

**Tujuan utama:**
- melihat status order
- melihat riwayat pembayaran
- menyimpan ukuran untuk reuse
- menerima update progress

### 3.4 Internal Office

Internal Office adalah workspace operasional internal bisnis.

**Core modules:**
- Orders Management
- Customer Management
- Measurement Management
- Inventory Management
- Payment Verification
- Production Management
- Shipping Management
- Reports
- Audit Log
- System Settings

### 3.5 Role-Based Internal Dashboard

#### Kasir / Front Office
- membuat order manual bila customer datang langsung
- menerima pembayaran
- cetak nota dan kwitansi
- follow up order masuk

#### Produksi
- melihat daftar kerja
- membuka detail ukuran dan spesifikasi
- update tahapan produksi

#### Admin
- verifikasi transfer
- kelola master data
- kelola stok
- audit dan konfigurasi sistem

#### Owner
- memantau KPI bisnis
- melihat laporan
- memantau order aktif dan cashflow

---

## 4. RBAC — Roles & Permissions

### 4.1 Roles

| Role | Description |
|---|---|
| **Customer** | Pelanggan end-user yang membuat pesanan dan melihat dashboard pribadinya |
| **Kasir** | Front office internal |
| **Produksi** | Tim workshop / produksi |
| **Admin** | Admin operasional dan master data |
| **Owner** | Pemilik, read-heavy, monitoring bisnis |

### 4.2 Permission Matrix

| Feature / Module | Customer | Kasir | Produksi | Admin | Owner |
|---|:---:|:---:|:---:|:---:|:---:|
| Browse layanan | ✓ | — | — | — | — |
| Buat tailor order sendiri | ✓ | ✓ | — | ✓ | — |
| Buat RTW checkout sendiri | ✓ | ✓ | — | ✓ | — |
| Buat convection order sendiri | ✓ | ✓ | — | ✓ | — |
| Lihat order sendiri | ✓ | — | — | — | — |
| Lihat semua order | — | ✓ | ✓ | ✓ | ✓ |
| Upload bukti transfer | ✓ | ✓ | — | ✓ | — |
| Verify transfer | — | ✓ | — | ✓ | — |
| Reject transfer | — | — | — | ✓ | — |
| Simpan ukuran sendiri | ✓ | — | — | — | — |
| Kelola ukuran semua customer | — | ✓ | ✓ | ✓ | — |
| Update status produksi | — | — | ✓ | ✓ | — |
| Kelola master data | — | — | — | ✓ | — |
| Lihat laporan | limited | limited | limited | ✓ | ✓ |
| Audit log | — | — | — | ✓ | ✓ |

### 4.3 Authorization Notes

- Customer hanya boleh mengakses data miliknya sendiri.
- Internal staff tidak boleh memakai flow customer untuk bypass approval logic.
- Semua aksi write tetap divalidasi oleh service layer dan policy, bukan hanya UI.

---

## 5. Business Rules (Absolute)

### 5.1 Tailor

| Code | Rule |
|---|---|
| **BR-T01** | Order tailor hanya bisa masuk proses produksi setelah DP verified minimal 50%. |
| **BR-T02** | Order tailor tidak bisa ditutup jika outstanding > 0. |
| **BR-T03** | Loyalty discount auto-apply untuk customer dengan closed tailor orders > threshold. |
| **BR-T04** | Customer dapat memilih ukuran dari data tersimpan, input manual, atau janji ukur offline. |
| **BR-T05** | Estimasi biaya di customer app bersifat preview; total final dihitung di backend saat submit. |

### 5.2 Ready-to-Wear

| Code | Rule |
|---|---|
| **BR-R01** | Stok tidak boleh negatif. |
| **BR-R02** | Stok dikurangi hanya setelah payment verified. |
| **BR-R03** | Customer hanya dapat checkout ukuran yang tersedia. |
| **BR-R04** | Jika memilih delivery, alamat dan ongkir wajib tersedia sebelum submit. |

### 5.3 Convection

| Code | Rule |
|---|---|
| **BR-C01** | Order konveksi hanya bisa masuk produksi setelah full payment verified. |
| **BR-C02** | Alur produksi minimal: desain → persiapan bahan → produksi → QC → packing → pengiriman/pickup. |
| **BR-C03** | Customer wajib mengisi detail item, qty, dan referensi desain sebelum checkout. |

### 5.4 Payments

| Code | Rule |
|---|---|
| **BR-P01** | Cash payment langsung verified. |
| **BR-P02** | Transfer payment pending sampai diverifikasi. |
| **BR-P03** | Upload bukti transfer wajib untuk customer transfer flow jika metode menuntut bukti. |
| **BR-P04** | Payment rejected wajib memiliki alasan. |
| **BR-P05** | Kwitansi final hanya tersedia untuk payment verified. |

### 5.5 Customer Portal

| Code | Rule |
|---|---|
| **BR-U01** | Customer hanya dapat melihat order, payment, address, dan measurement miliknya sendiri. |
| **BR-U02** | Customer dapat menyimpan address dan measurement untuk reuse pada order berikutnya. |
| **BR-U03** | Customer-facing status harus lebih sederhana dari internal status, tetapi tetap merefleksikan state backend. |
| **BR-U04** | Draft order customer boleh disimpan sebelum submit final. |

### 5.6 Audit & General

| Code | Rule |
|---|---|
| **BR-G01** | Semua perubahan status order dicatat. |
| **BR-G02** | Verifikasi transfer, reject transfer, override loyalty, dan close order tercatat di audit log. |
| **BR-G03** | Tidak boleh ada business rule yang hanya enforced di frontend. |

---

## 6. Status Workflows

### 6.1 Internal Order Status

```
DRAFT
  │
  ▼
PENDING_PAYMENT
  │
  ▼
IN_PROGRESS
  │
  ▼
DONE
  │
  ├──> DELIVERED
  ├──> PICKUP
  ▼
CLOSED
```

### 6.2 Customer-Facing Status Mapping

| Internal Status | Customer Label |
|---|---|
| `DRAFT` | Draft |
| `PENDING_PAYMENT` | Menunggu Pembayaran |
| `IN_PROGRESS` | Sedang Diproses |
| `DONE` | Siap Diambil / Siap Dikirim |
| `DELIVERED` | Dalam Pengiriman / Terkirim |
| `PICKUP` | Menunggu Pickup |
| `CLOSED` | Selesai |
| `CANCELLED` | Dibatalkan |

### 6.3 Production Stages for Convection

```
Desain
↓
Persiapan bahan
↓
Produksi
↓
Quality Control
↓
Packing
↓
Pengiriman / Pickup
```

---

## 7. Functional Requirements Summary

### 7.1 Landing
- marketing homepage
- CTA ke login/register
- explain tailor, RTW, convection

### 7.2 Customer App
- service discovery
- interactive tailor configurator
- RTW catalog + cart
- convection request builder
- checkout and payment

### 7.3 User Dashboard
- order list & detail
- payment history
- measurement library
- address book
- profile
- notifications

### 7.4 Office
- order operations
- transfer verification
- production board
- shipping management
- reports
- settings

---

## 8. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Customer app harus cepat di mobile network menengah |
| Responsive | Customer surface mobile-first; office surface tablet/desktop-first |
| Security | Customer isolation wajib; internal modules harus role-gated |
| Maintainability | Shared business rules berada di service layer yang sama untuk customer dan office |
| Auditability | Semua aksi kritikal harus dapat ditelusuri |
| UX Consistency | Customer flow sederhana dan emosional; office flow cepat dan operasional |

---

## 9. Implementation Notes

### 9.1 Target URL Strategy

| Surface | URL |
|---|---|
| Landing | `djaitin.com` / `/` |
| Customer | `djaitin.com/app/*` atau `app.djaitin.com` |
| Office | `djaitin.com/office/*` atau `office.djaitin.com` |

### 9.2 Transition Note for Current Codebase

Dokumen ini menetapkan target arsitektur baru:

- `/app` dipakai untuk **customer surface**
- `/office` dipakai untuk **internal office**

Jika saat ini codebase masih memakai `/app` untuk internal dan `/cms` untuk admin, itu dianggap **state transisi** dan harus dinormalisasi pada fase implementasi berikutnya.
