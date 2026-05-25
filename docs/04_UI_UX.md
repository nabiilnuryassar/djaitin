# 04 — UI/UX System

> UI/UX contract for Djaitin. For premium taste rules, also read `docs/06_DESIGN_TASTE_SYSTEM.md`.

---

## 1. Brand Direction

Djaitin is a digital atelier. The interface should feel:

- Warm, precise, premium.
- Fashion/craft-aware without becoming decorative.
- Helpful for customers ordering clothes.
- Efficient for office staff managing production.

Visual language:

- Soft neutral surfaces.
- Strong but restrained typography.
- Warm accent colors inspired by fabric/leather/thread.
- High-quality spacing and data hierarchy.
- Motion used only on landing and light UI feedback, not operational tables.

---

## 2. App Areas

### Landing

Audience: guest and potential customer.

Style:

- More expressive, with motion and storytelling.
- Uses existing Landing components: WorkflowTimeline, TestimonialSlider, TextReveal, SequenceScroll, RoleSurfaceShowcase, FloatingNavbar.
- Still avoid generic AI marketing copy.

### Customer app

Audience: customer ordering clothing.

Style:

- Friendly, guided, mobile-first.
- Strong step-by-step affordances.
- Use cards and progress indicators.
- Copy can be warmer but still concise.

### Office app

Audience: operator, kasir, produksi, admin, owner.

Style:

- Dense operational dashboard.
- Tables, filters, status badges, quick actions.
- No decorative motion.
- Data comes first.

---

## 3. Navigation

### Customer app

Suggested nav:

```text
Home
Catalog
Pesanan
Pembayaran
Ukuran
Alamat
Notifikasi
Profil
```

Mobile bottom bar should prioritize:

```text
Home | Catalog | Pesanan | Akun
```

### Office app

Suggested sidebar:

```text
Dashboard
Order
Customer
Payment
Produksi
Shipping
Reports
Audit Log
Admin
  Produk
  Kain
  Model
  Kurir
  Diskon
  User
```

---

## 4. Page Pattern

Customer pages:

```text
Header / mobile topbar
Primary content card/section
Guided CTA
Secondary info
Bottom nav on mobile
```

Office pages:

```text
Breadcrumb / page title
Metric cards
Filter bar
Table or board
Pagination / bulk actions
```

---

## 5. Status Semantics

Order and production status must be visually distinct from payment status.

Suggested tones:

| Status | Tone |
|---|---|
| Draft, pending quote | neutral |
| Waiting payment / waiting proof | warning |
| Paid / verified / completed | success |
| In production | info |
| Needs revision / proof rejected | danger |
| Cancelled / refunded | neutral-danger |
| Shipped | info-success |

Rules:

- Do not use same badge for order status and payment status without label.
- Always show payment status in payment-heavy views.
- Production board should emphasize production stage, not payment amount.

---

## 6. Forms

Customer forms:

- Large touch targets.
- Clear steps.
- Save progress where possible.
- Explain garment measurements in plain Indonesian.

Office forms:

- Compact two-column layout on desktop.
- Required fields first.
- Monetary fields right-aligned.
- Confirmation for status/refund/stock changes.

---

## 7. Table Rules

Office tables:

- Server-side pagination.
- Search first, filters next, actions last.
- Identity column first.
- Money right-aligned.
- Dates use `dd MMM yyyy HH:mm` for office; customer pages can use friendlier date.
- Row actions in dropdown when >2 actions.

---

## 8. Accessibility

- Visible focus ring.
- Keyboard navigable dialogs/dropdowns.
- Labels for every input.
- No color-only status.
- Upload components expose file name and error messages.

---

## 9. Anti-slop Rule

Do not write UI copy like:

- "Effortlessly manage your orders"
- "Unlock your fashion journey"
- "Seamless experience"
- "Powerful dashboard at your fingertips"

Use direct Indonesian operational copy:

- `Pesanan tersimpan.`
- `Bukti pembayaran menunggu review.`
- `Stok tidak cukup untuk checkout.`
- `Refund berhasil dicatat.`
