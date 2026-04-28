# PRD Alignment Execution Phases

## Tujuan Dokumen

Dokumen ini adalah breakdown operasional dari `prd-alignment-refactor-plan.md`.
Fokusnya bukan lagi keputusan produk, tetapi urutan eksekusi refactor dari Phase 2 sampai phase akhir.

Dokumen ini dipakai untuk:

- memandu implementasi teknis
- menjaga refactor tetap konsisten dengan PRD
- menjadi backlog bertahap yang bisa dikerjakan phase-by-phase

## Prinsip Eksekusi

- setiap phase harus menyelesaikan satu area sampai stabil sebelum lanjut
- backend flow dibenahi lebih dulu sebelum UI besar dirombak
- test harus diperbarui setiap phase
- docs harus mengikuti hasil final setiap phase
- wizard tailor eksploratif tetap dipertahankan
- customer app dan office app tetap dipertahankan

## Ringkasan Phase

| Phase | Fokus | Hasil |
|---|---|---|
| Phase 2 | Simplify Convection Core Flow | konveksi kembali ke flow PRD sederhana |
| Phase 3 | Simplify Design Collaboration | kolaborasi desain menjadi upload/list/catatan sederhana |
| Phase 4 | UI Cleanup And Consistency | halaman customer dan office lebih ringkas dan selaras PRD |
| Phase 5 | Business Rule Tightening | rule loyalti, due date, dan SOP operasional diperjelas |
| Phase 6 | Documentation And Final Hardening | docs, test, dan acceptance final dirapikan |

---

## Phase 2 — Simplify Convection Core Flow

### Goal

Mengembalikan order konveksi ke alur PRD yang sederhana:

1. customer buat order
2. customer upload referensi
3. customer bayar penuh
4. office verifikasi pembayaran
5. order baru bisa diproses

### Target Hasil

- flow `request_quote` tidak lagi menjadi jalur bisnis utama
- customer tidak lagi diarahkan untuk menunggu quotation office
- status `awaiting_price` keluar dari flow utama
- pembayaran konveksi kembali menjadi full payment sejak awal

### Scope

#### Backend

- sederhanakan `ConvectionOrderService`
- rapikan `StoreConvectionOrderRequest`
- rapikan `PaymentService` untuk kasus konveksi
- rapikan `OrderStatusService` agar tidak lagi mengandalkan flow quotation
- review enum/status yang hanya dipakai flow hybrid

#### Customer UI

- sederhanakan halaman create convection
- hilangkan pilihan mode pricing
- sederhanakan copywriting agar langsung menjelaskan full payment
- sederhanakan order detail customer untuk konveksi

#### Office UI

- hilangkan panel quotation
- hilangkan state office yang hanya ada karena flow hybrid

### Deliverables

- flow create order konveksi yang sederhana
- payment flow konveksi yang langsung full payment
- order detail customer dan office yang tidak lagi menyebut quotation hybrid
- test feature konveksi yang konsisten dengan flow PRD

### Technical Steps

1. ubah service dan request validation
2. rapikan controller dan route yang terdampak
3. update UI customer
4. update UI office
5. update test
6. update docs

### Risks

- test lama masih mengasumsikan `awaiting_price`
- beberapa komponen UI mungkin masih membaca field quotation
- data lama di database masih punya jejak flow hybrid

### Definition of Done

- customer tidak melihat mode `request quote`
- office tidak lagi perlu publish quotation
- order konveksi langsung mengikuti full payment flow
- test konveksi utama lolos

---

## Phase 3 — Simplify Design Collaboration

### Goal

Mengurangi kompleksitas kolaborasi desain agar sesuai PRD, tanpa menghilangkan kebutuhan dasar pertukaran file antara office dan customer.

### Target Hasil

- kolaborasi desain tetap ada
- tetapi tidak lagi memakai approval workflow yang kompleks
- file desain cukup dikelola sebagai attachment dengan catatan sederhana

### Scope

#### Remove

- approval desain per card
- request revision per card
- pending review / approved / revision requested sebagai workflow utama
- interaction model yang menyerupai project management tool

#### Simplify

- daftar attachment customer
- daftar attachment office
- catatan singkat per file
- tombol buka file
- upload file tambahan dari kedua sisi bila memang masih dibutuhkan

### Deliverables

- halaman detail order customer dengan section desain yang sederhana
- halaman detail order office dengan section desain yang sederhana
- backend attachment flow yang lebih ringan
- test attachment yang fokus ke upload/list basic flow

### Technical Steps

1. tentukan metadata attachment minimum yang tetap dipakai
2. pangkas endpoint approval/review yang tidak perlu
3. sederhanakan serialisasi data attachment
4. sederhanakan UI customer
5. sederhanakan UI office
6. update docs dan test

### Risks

- ada field lama yang tetap tinggal di database
- ada notification lama yang menjadi tidak terpakai
- ada docs lama yang masih menggambarkan flow lama

### Definition of Done

- customer cukup melihat file dan catatan
- office cukup mengirim file dan catatan
- tidak ada lagi approval flow desain yang kompleks
- docs kolaborasi desain sesuai bentuk final

---

## Phase 4 — UI Cleanup And Consistency

### Goal

Membersihkan sisa UI yang masih terasa overbuilt dibanding PRD dan menyamakan struktur layar customer dan office.

### Target Hasil

- surface customer lebih ringkas
- surface office lebih operasional
- tab, section, dan copywriting konsisten

### Scope

#### Customer Surface

- rapikan detail order tailor / convection / RTW
- rapikan halaman pembayaran
- pastikan istilah bisnis mudah dipahami user

#### Office Surface

- rapikan detail order
- rapikan area produksi
- pastikan status yang tampil sesuai SOP bisnis, bukan terlalu teknis

#### Shared UI

- sederhanakan badge, label, CTA, dan helper text
- review apakah semua tab yang ada memang diperlukan

### Deliverables

- order detail customer yang lebih sederhana
- order detail office yang lebih tegas secara operasional
- nomenklatur UI yang selaras dengan PRD

### Technical Steps

1. inventaris screen yang terdampak
2. rapikan layout dan copywriting
3. hapus elemen yang tidak lagi punya backend relevance
4. build dan regression check

### Risks

- perubahan visual dapat mengganggu kebiasaan user internal
- tab yang dipangkas bisa mengubah alur kerja office

### Definition of Done

- tidak ada lagi section yang jelas-jelas merepresentasikan flow overbuilt
- istilah di UI lebih dekat ke bahasa bisnis Djaitin
- build frontend lolos

---

## Phase 5 — Business Rule Tightening

### Goal

Merapikan area yang belum overbuilt, tetapi masih ambigu atau belum tegas terhadap narasi PRD.

### Target Hasil

- rule loyalti menjadi jelas
- due date dan pickup lebih terarah
- operasional order lebih disiplin

### Scope

#### Loyalty

- putuskan rule `> 5` atau `>= 5`
- selaraskan service, test, dan docs

#### Due Date And Pickup

- review apakah perlu reminder, status tambahan, atau hanya SOP docs
- pastikan order tailor yang selesai punya alur pickup yang lebih jelas

#### Corporate Convection

- tentukan apakah `company_name` cukup
- atau perlu backlog formal untuk corporate account

### Deliverables

- rule loyalti final
- SOP due date / pickup yang lebih jelas
- keputusan final soal kebutuhan corporate account

### Technical Steps

1. finalisasi keputusan bisnis
2. update service / request / docs
3. update test

### Risks

- perubahan loyalty rule bisa memengaruhi data existing
- enforcement pickup bisa butuh diskusi operasional, bukan hanya kode

### Definition of Done

- tidak ada lagi rule inti yang ambigu
- docs dan implementasi menggunakan definisi yang sama

---

## Phase 6 — Documentation And Final Hardening

### Goal

Menutup refactor dengan memastikan kode, docs, dan test sudah benar-benar menggambarkan produk final yang sesuai PRD.

### Target Hasil

- tidak ada docs lama yang menyesatkan
- test sudah mewakili flow final
- sistem siap dinilai ulang terhadap PRD

### Scope

#### Documentation

- update `PRD.md` jika perlu catatan implementasi
- update `USER-MANUAL.md`
- update `MVP-READINESS.md`
- update docs teknis yang menyebut flow lama
- archive docs yang tidak lagi relevan

#### Testing

- review feature tests yang terdampak
- review build verification
- review smoke test flow customer dan office

#### Final Review

- audit residual code dari flow lama
- audit route/helper/action yang tidak lagi dipakai
- audit migration / fields yang masih tersisa

### Deliverables

- docs final yang konsisten
- test suite ter-update
- daftar cleanup pasca-refactor jika masih ada sisa

### Technical Steps

1. update semua docs relevan
2. review test coverage
3. review dead code candidate
4. final acceptance walkthrough

### Risks

- docs tercecer dan tidak semuanya ikut diperbarui
- dead code masih tertinggal di frontend/backend

### Definition of Done

- docs utama konsisten dengan flow final
- test penting lolos
- tidak ada referensi aktif ke flow lama di surface utama

---

## Dependency Antar Phase

- Phase 2 harus selesai sebelum Phase 3
- Phase 3 harus selesai sebelum Phase 4
- Phase 5 boleh mulai setelah Phase 2 stabil, tetapi lebih aman setelah Phase 4
- Phase 6 adalah penutup setelah semua phase implementasi selesai

## Strategi Eksekusi Yang Disarankan

Urutan kerja teknis untuk setiap phase:

1. review rule bisnis phase tersebut
2. refactor backend
3. refactor UI
4. update test
5. update docs
6. lakukan verification minimal

## Verification Minimum Per Phase

Setiap phase minimal harus menyelesaikan:

- `php artisan test --compact ...` pada test yang relevan
- `vendor/bin/pint --dirty --format agent` jika ada perubahan PHP
- `npm run build` jika ada perubahan frontend

## Exit Criteria Keseluruhan

Refactor PRD alignment dianggap selesai jika:

- seluruh flow utama sesuai dengan narasi PRD
- hanya wizard tailor dan split app yang sengaja tetap lebih maju
- tidak ada lagi fitur utama yang terasa seperti sistem di luar scope PRD
- docs utama dan docs teknis sudah konsisten
- flow customer dan office sama-sama stabil

## Keputusan Yang Sudah Dikunci

- keep wizard tailor eksploratif
- keep customer app dan office app terpisah
- simplify convection
- remove overbuilt design collaboration workflow
- remove hybrid quotation flow
