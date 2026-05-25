# 07 — Component Patterns

> Patterns for Inertia React UI in Djaitin. Reuse these before inventing new layouts.

---

## 1. Page Header

Customer page header:

```tsx
<section className="flex flex-col gap-2">
  <p className="text-sm text-muted-foreground">Pesanan</p>
  <h1 className="text-2xl font-semibold text-foreground">Pesanan saya</h1>
  <p className="max-w-xl text-sm text-muted-foreground">
    Pantau status pesanan jahit dan ready-wear kamu.
  </p>
</section>
```

Office page header:

```tsx
<header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <h1 className="text-xl font-semibold text-foreground">Order</h1>
    <p className="mt-1 text-sm text-muted-foreground">
      Kelola order tailor, ready-wear, dan convection.
    </p>
  </div>
  <div className="flex items-center gap-2">
    <Button variant="outline">Export</Button>
    <Button>Buat order</Button>
  </div>
</header>
```

Rules:

- Description optional, one short sentence.
- Primary action right-aligned on office.
- No decorative icon next to title.

---

## 2. Metric Cards

```tsx
<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <MetricCard label="Order baru" value={metrics.new} />
  <MetricCard label="Menunggu pembayaran" value={metrics.waitingPayment} tone="warning" />
  <MetricCard label="Produksi" value={metrics.inProduction} tone="info" />
  <MetricCard label="Selesai bulan ini" value={metrics.completed} tone="success" />
</div>
```

Rules:

- 4-6 cards max.
- Value is the hero, label secondary.
- Avoid percent unless it changes a decision.

---

## 3. Filter Bar

```tsx
<form method="get" className="rounded-xl border bg-card p-3">
  <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_180px_180px_180px_auto]">
    <SearchInput name="q" defaultValue={filters.q ?? ''} placeholder="Cari order, customer, nomor" />
    <Select name="type" options={typeOptions} placeholder="Semua jenis" />
    <Select name="status" options={statusOptions} placeholder="Semua status" />
    <Select name="payment" options={paymentOptions} placeholder="Semua pembayaran" />
    <div className="flex gap-2">
      <Button type="submit" variant="outline">Filter</Button>
      <Button asChild variant="ghost"><Link href={routes.officeOrders.url()}>Reset</Link></Button>
    </div>
  </div>
</form>
```

Rules:

- Search first, filters next, actions last.
- Max 6 filters by default.
- Preserve query string on pagination.
- Reset clears query, not just refresh.

---

## 4. Data Table

```tsx
<Card className="overflow-hidden">
  <table className="min-w-full divide-y text-sm">
    <thead className="bg-muted text-xs font-medium uppercase tracking-wide text-muted-foreground">
      <tr>
        <th className="px-4 py-3 text-left">Order</th>
        <th className="px-4 py-3 text-left">Customer</th>
        <th className="px-4 py-3 text-left">Status</th>
        <th className="px-4 py-3 text-right">Total</th>
        <th className="px-4 py-3 text-right">Aksi</th>
      </tr>
    </thead>
    <tbody className="divide-y">
      {/* rows */}
    </tbody>
  </table>
</Card>
```

Rules:

- Left-align text, right-align money/numbers.
- Identity column first.
- Actions last and right-aligned.
- Row hover subtle, no scale transform.
- Density 44-48px office, 56-64px customer.

---

## 5. Identity Cell

```tsx
<div className="min-w-0">
  <div className="flex items-center gap-2">
    <span className="font-medium text-foreground truncate">{order.number}</span>
    <Badge variant="neutral">{order.type}</Badge>
  </div>
  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
    <span>{order.customer_name}</span>
    <span aria-hidden>·</span>
    <span>{formatDate(order.created_at)}</span>
  </div>
</div>
```

---

## 6. Status Badge

```tsx
<Badge tone={tone} className="gap-1.5">
  <span className={cn('h-1.5 w-1.5 rounded-full', dotClass)} />
  {label}
</Badge>
```

Rules:

- Short labels: `Lunas`, `Produksi`, `Bukti ditolak`.
- Always include dot/icon for color-blind users.
- One badge per concept; do not stack 3 badges in a cell unless meaningful.

---

## 7. Action Buttons

Hierarchy:

1. Primary: main create/save.
2. Outline: utility (Export, Refresh).
3. Ghost: low-impact (Reset, Cancel).
4. Destructive: refund, cancel order; spaced from primary.

Labels:

- `Buat order`
- `Simpan perubahan`
- `Verifikasi bukti`
- `Tolak bukti`
- `Refund pembayaran`
- `Batalkan`

Avoid:

- `Submit`
- `Click here`
- `Continue`
- `Manage`

---

## 8. Dropdown Row Actions

Use when a row has more than 2 actions.

```text
[Detail] [⋯]
       ├── Edit
       ├── Update status
       ├── Print invoice
       └── Refund (danger)
```

Rules:

- Destructive separated by divider.
- Confirm modal for destructive action.
- Menu width 200-240px.

---

## 9. Forms

Use Inertia `useForm` or `<Form>` patterns.

Customer form:

```tsx
<form onSubmit={form.submit} className="space-y-6">
  <Field label="Nama lengkap" error={form.errors.name}>
    <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
  </Field>
  <Field label="Telepon" error={form.errors.phone}>
    <Input inputMode="tel" />
  </Field>
  <div className="flex justify-end gap-2">
    <Button type="button" variant="ghost" onClick={() => history.back()}>Batalkan</Button>
    <Button type="submit" disabled={form.processing}>Simpan</Button>
  </div>
</form>
```

Office form:

- Two-column grid for short fields on desktop.
- Sticky footer with primary save action.
- Inline validation error under field.

Rules:

- Required marker subtle `*`, not red bold label.
- Helper text explains consequences only.
- Save button disabled while submitting.

---

## 10. Detail Page

Customer order detail:

```text
Header: Order number + status
Hero card: garment summary, total, payment status
Tabs / sections:
  Detail pesanan
  Pembayaran
  Pengiriman
  Lampiran
  Riwayat status
Sticky CTA: Lunasi / Upload bukti / Pantau pengiriman
```

Office order detail:

```text
Header: Order number + status badges + primary action
Top summary: customer, total, dp, payment status, production stage
Tabs/sections:
  Detail
  Pembayaran
  Lampiran
  Produksi
  Shipping
  Audit
Side: customer card, quick actions, attachments
```

Rules:

- First screen answers: who, how much, what state, what to do next.
- Avoid dumping every column in a giant definition list.

---

## 11. Modals

Use modal for:

- Confirm destructive actions (cancel order, refund payment).
- One-step adjustments (mark verified/rejected).
- Quick attachment upload.

Avoid modal for:

- Long create/edit forms.
- Multi-step quote builder.
- Refund flow with multiple decisions.

Rules:

- Title concrete: `Refund pembayaran ini?`
- Body explains side-effect (e.g. stock release).
- Action label matches verb: `Refund`, not `Ya`.

---

## 12. Empty States

Customer:

```text
Belum ada pesanan.
Mulai dari Catalog atau buat order tailor di service.
```

Office:

```text
Belum ada order untuk filter ini.
Ubah filter atau buat order baru.
```

Rules:

- No giant illustration.
- One sentence + one optional action.
- Empty state max 180px tall in a table card.

---

## 13. Loading States

- Skeleton rows for tables.
- Disabled button + spinner for forms.
- Inline spinner for action menu item.

Avoid:

- Full page spinner for filter changes.
- Heavy animation.

---

## 14. Toasts / Flash

Use existing `flash-message`.

Success:

```text
Pesanan tersimpan.
Bukti pembayaran terverifikasi.
Refund tercatat.
```

Error:

```text
Gagal menyimpan. Cek field lalu coba lagi.
Bukti ditolak. Beri alasan kepada customer.
```

Rules:

- 3-5 seconds duration.
- No exclamation mark.
- Error includes next step when possible.

---

## 15. High-Risk Component Rules

### Payment review

- Show amount, customer-paid amount, remaining due.
- Show proof preview with policy-checked URL.
- Verify and reject buttons separate, with reason field for reject.
- Refund action is separate page or dedicated modal.

### Production board

- Stage columns clearly labeled.
- Card density tight; avoid 600px-tall cards.
- No drag animation longer than 150ms.

### Shipping page

- Tracking number copyable.
- Courier base fee visible.
- Status semantic: shipped/delivered.

### Catalog page

- Product card uses one image with consistent ratio (e.g. 4:5).
- No hover scale > 1.02.
- Stock indicator never just red icon; always with text.

### Cart and checkout

- Per-item edit/remove always present.
- Totals breakdown clear: subtotal, discount, shipping, total.
- DP/payment terms explained when relevant.
