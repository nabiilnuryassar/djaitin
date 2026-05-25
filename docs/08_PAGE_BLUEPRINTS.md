# 08 — Page Blueprints

> Concrete page compositions for the most important Djaitin screens. Use these so agents do not improvise the entire UI.

---

## 1. Landing (`/`)

Composition:

```text
FloatingNavbar
Hero with TextReveal + premium copy
SequenceScroll: how Djaitin works
RoleSurfaceShowcase: services
WorkflowTimeline: order journey
TestimonialSlider
Premium CTA section
Footer
```

Rules:

- Allowed motion: subtle Lenis smooth scroll, fade-up on entry, MagneticButton for primary CTA.
- Copy must be specific. Avoid AI marketing slop.
- Mobile keeps the same hierarchy without parallax that breaks performance.

---

## 2. Customer Home (`/app/home`)

Composition:

```text
Greeting
Status order aktif (kalau ada)
Quick actions: Order baru, Catalog, Pesanan, Pembayaran
Promo / pengumuman ringan
Notifikasi terbaru
```

Rules:

- Skip greeting if too generic; show order state instead.
- Single primary CTA based on user state (e.g. lanjutkan order, upload bukti, lihat pengiriman).

---

## 3. Customer Catalog (`/app/catalog`)

Composition:

```text
Search + filter (kategori, harga, kain, ukuran)
Product grid 2 kolom mobile, 3-4 desktop
Pagination
```

Rules:

- 4:5 product image ratio.
- Stock indicator must be readable.
- No hover overlay on mobile.

---

## 4. Customer Catalog Detail (`/app/catalog/{product}`)

Composition:

```text
Image gallery (max 5)
Title, kategori, harga
Stock status
Pilih ukuran/varian
Tombol primer: Tambah ke cart / Pesan langsung
Deskripsi, kain, perawatan
Rekomendasi terkait
```

Rules:

- Single primary action.
- Sticky CTA on mobile.

---

## 5. Customer Cart (`/app/cart`)

Composition:

```text
List item: image, nama, varian, qty stepper, harga, hapus
Ringkasan: subtotal, ongkir (estimasi), total
Tombol primer: Lanjut ke checkout
```

Rules:

- Per-item edit always visible.
- Empty state ringan dengan CTA ke catalog.

---

## 6. Customer Checkout (`/app/checkout`)

Composition:

```text
Step 1: Alamat pengiriman
Step 2: Kurir
Step 3: Voucher / diskon (kalau ada)
Step 4: Ringkasan dan ketentuan DP
Tombol primer: Buat pesanan
```

Rules:

- Each step is collapsible card on desktop, accordion on mobile.
- Validation inline.
- Show DP rule explicitly.

---

## 7. Customer Tailor Configurator (`/app/tailor/configurator`)

Composition:

```text
Pilih model garment
Pilih kain
Ukuran (pilih dari library atau buat baru)
Detail tambahan
Estimasi harga / quote
Tombol primer: Lanjutkan ke pemesanan
```

Rules:

- Show price as estimate while pending quote.
- Allow saving draft.

---

## 8. Customer Convection Create (`/app/convection/create`)

Composition:

```text
Brief: jenis produk, kuantitas, deadline
Lampiran referensi
Spesifikasi kain/material
Catatan
Tombol primer: Kirim permintaan
```

Rules:

- Permintaan masuk sebagai pending quote di office.
- Lampiran wajib aman.

---

## 9. Customer Orders Index (`/app/orders`)

Composition:

```text
Header
Tabs: Semua | Aktif | Selesai | Dibatalkan
Cards / list per order:
  Nomor, jenis, gambar / model, status, total, CTA
```

Rules:

- Status menonjol.
- CTA per order disesuaikan dengan kebutuhan (lunasi, upload bukti, pantau pengiriman).

---

## 10. Customer Order Show (`/app/orders/{order}`)

Composition:

```text
Header: nomor + status
Hero: ringkasan produk/jasa, total, sisa pembayaran
Sections: detail, pembayaran, pengiriman, lampiran, riwayat status
Sticky bottom CTA on mobile
```

Rules:

- Single primary CTA based on state.
- Tampilkan timeline status.

---

## 11. Customer Payments (`/app/payments`)

Composition:

```text
List pembayaran
Status badges (menunggu / diunggah / verifikasi / tolak / refund)
Detail pembayaran (modal / page)
Upload bukti (jika status mengizinkan)
```

Rules:

- Customer hanya melihat pembayaran sendiri.
- Validation amount sebelum submit.

---

## 12. Customer Measurements (`/app/measurements`)

Composition:

```text
List ukuran tersimpan
Tombol: Tambah ukuran
Detail ukuran dengan diagram bantu
```

Rules:

- Ukuran default ditandai jelas.
- Tombol edit/hapus dengan konfirmasi.

---

## 13. Customer Addresses (`/app/addresses`)

Composition:

```text
List alamat
Tombol: Tambah alamat
Default ditandai
Edit/hapus dengan konfirmasi
```

---

## 14. Customer Notifications (`/app/notifications`)

Composition:

```text
List notifikasi (read/unread)
Filter ringan: Semua | Belum dibaca
Aksi: tandai dibaca, buka detail
```

Rules:

- Notifikasi berisi konteks order/payment dengan link.

---

## 15. Office Dashboard (`/office/dashboard`)

Composition:

```text
Metric strip: Order baru, Menunggu pembayaran, Produksi, Selesai bulan ini
Daftar order terbaru
Daftar bukti menunggu verifikasi
Daftar produksi yang slow-moving
```

Rules:

- No marketing widget.
- Quick links to Order/Payment/Produksi.

---

## 16. Office Orders Index (`/office/orders`)

Composition:

```text
Title row: Order | Buat order
Metric cards: total, menunggu pembayaran, produksi, terkirim
Filter: search, jenis (tailor/ready/convection), status, payment status, periode
Table: nomor, customer, jenis, status, payment, total, jatuh tempo, aksi
Pagination
```

Rules:

- Server-side pagination.
- Money right-aligned.
- Status order dan payment status dua kolom berbeda.

---

## 17. Office Order Show (`/office/orders/{order}`)

Composition:

```text
Header: nomor + status order + status payment + primary action
Top summary: customer, total, dp, sisa, production stage
Tabs/sections: detail, pembayaran, lampiran, produksi, shipping, audit
Side: customer card, quick actions, attachments timeline
```

Rules:

- Aksi sensitif (cancel/refund) di area terpisah.
- Audit log selalu terlihat.

---

## 18. Office Customers Index/Show (`/office/customers`)

Composition:

```text
List customer dengan status portal, jumlah order, total spend
Filter: search, status portal, periode
Detail customer: profil, order, pembayaran, alamat, ukuran, catatan
```

---

## 19. Office Payments (`/office/payments`)

Composition:

```text
Title row: Payment | Catat pembayaran offline
Metric cards: menunggu, terverifikasi, ditolak, refund
Filter: status, jenis, periode
Table: tanggal, customer, order, jumlah, status, aksi
Modal: verifikasi/tolak dengan alasan
```

Rules:

- Refund dipisah ke action page/modal khusus.
- Bukti pembayaran preview via authorized URL.

---

## 20. Office Production Board (`/office/production`)

Composition:

```text
Filter: jenis, periode, urgency
Kanban kolom: Antri, Cutting, Sewing, Finishing, QC, Selesai
Card: nomor order, customer, deadline, urgency
```

Rules:

- Drag tetap ringan.
- Card tidak terlalu tinggi.

---

## 21. Office Shipping (`/office/shipping`)

Composition:

```text
Filter: status, kurir, periode
Table: order, customer, kurir, tracking, status, aksi
Action: tetapkan kurir, input tracking, tandai shipped/delivered
```

---

## 22. Office Reports (`/office/reports`)

Composition:

```text
Filter periode, jenis order, status
Cards / grafik: omzet, pesanan baru, refund, produksi
Tombol export
```

Rules:

- Grafik pakai chart yang sudah ada (recharts) dengan warna semantik.
- Avoid 5 colors random.

---

## 23. Office Admin Master Data (`/office/admin/...`)

Composition per master:

```text
Title row + Tambah
Filter sederhana
Table dengan kolom dasar (nama, kode, status, aksi)
Form create/edit kompak
```

---

## 24. Office Audit Log (`/office/audit-log`)

Composition:

```text
Filter: actor, action, subject, periode
Table append-only
Detail row dengan diff before/after
```

Rules:

- Tidak ada edit/delete dari UI.

---

## 25. Settings (`/settings/*`)

Composition:

```text
Sidebar: Profile, Password, Two-factor, Appearance
Form sederhana per halaman
```

Rules:

- Two-factor: gunakan komponen yang sudah ada.
- Appearance: light/dark only kalau dark mode terverifikasi.
