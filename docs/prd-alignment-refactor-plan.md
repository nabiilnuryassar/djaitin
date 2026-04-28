# PRD Alignment Refactor Plan

## Tujuan

Dokumen ini menjadi acuan untuk menyelaraskan aplikasi Djaitin kembali ke PRD naratif bisnis yang lebih sederhana, tanpa menghapus dua keputusan produk yang sengaja dipertahankan:

- wizard tailor yang eksploratif
- pemisahan customer app dan office app

Dokumen ini merangkum:

- hasil tahap 1 berupa matriks `keep / simplify / remove`
- planning tahap 2 berupa urutan refactor konkret
- arahan untuk tahap lanjutan setelah tahap 2

## Prinsip Penyelarasan Ke PRD

Refactor ini memakai prinsip berikut:

- inti bisnis tailor, ready-to-wear, dan convection harus tetap utuh
- proses bisnis yang disebut eksplisit di narasi harus diprioritaskan
- fitur yang terasa seperti `workflow software tambahan` dan tidak diminta PRD harus dikurangi
- UX yang membantu bisnis tanpa mengubah rule dasar boleh dipertahankan
- arsitektur yang sehat tidak perlu dihapus hanya karena tidak disebut eksplisit di PRD

## Tahap 1: Keputusan Produk

### Keep

Fitur dan keputusan berikut dipertahankan:

- pemisahan `customer app` dan `office app`
- wizard tailor yang eksploratif
- tailor custom:
  - model, bahan, ukuran
  - measurement customer tersimpan
  - DP minimal 50%
  - wajib lunas sebelum order selesai / diambil
- loyalty tailor 20%
- katalog ready-to-wear
- delivery ready-to-wear dengan ongkir jasa kirim
- gate full payment untuk order konveksi sebelum masuk produksi
- pembayaran `cash` vs `transfer` dengan verifikasi transfer
- nota dan kwitansi
- modul operasional office dasar:
  - pesanan
  - pembayaran
  - pengiriman
  - pelanggan
  - laporan dasar

### Simplify

Fitur berikut tidak perlu dihapus total, tetapi harus disederhanakan agar lebih dekat ke PRD:

- flow create order konveksi
- detail order konveksi
- kolaborasi desain konveksi
- production stage yang terlalu granular
- notification flow yang terlalu rinci
- admin policy/config yang berkembang terlalu jauh dari rule bisnis dasar

### Remove / Roll Back

Fitur berikut dinilai terlalu jauh dari PRD naratif dan menjadi kandidat rollback:

- hybrid RFQ / quotation flow untuk konveksi
- status `awaiting_price` sebagai flow bisnis utama customer
- quotation publishing panel sebagai jalur utama order konveksi
- kanban board design process di halaman admin
- drag and drop workflow attachment
- linked attachment / thread file per card
- approval desain per card sebagai workflow penuh
- desain collaboration flow yang menyerupai project management board

## Ringkasan Penilaian

### Sesuai PRD

- tailor custom dan measurement history
- loyalti tailor
- ready-to-wear catalog dan delivery
- full payment gate untuk konveksi
- cash vs transfer verification
- nota dan kwitansi

### Belum Sepenuhnya Sesuai PRD

- due date belum ditegakkan sebagai SOP pickup
- relasi corporate account masih sederhana
- pemasaran / CRM belum menjadi modul eksplisit
- diskon RTW berbasis tren masih manual

### Berlebihan Dibanding PRD

- quotation hybrid untuk konveksi
- workflow desain dua arah yang terlalu kompleks
- kanban internal untuk design process
- thread attachment per card

## Tahap 2: Refactor Plan

Tahap 2 fokus pada penyederhanaan modul konveksi dan area yang sudah terlalu jauh dari PRD.

### Target Hasil Tahap 2

Setelah tahap 2 selesai, alur yang diharapkan:

1. customer membuat order konveksi
2. customer mengisi data perusahaan, item, catatan, dan file referensi
3. customer melakukan pembayaran penuh
4. office memverifikasi pembayaran
5. setelah lunas terverifikasi, order bisa masuk proses produksi
6. kolaborasi desain tetap ada hanya sebagai upload file dan catatan sederhana, bukan workflow board

### Scope Tahap 2

#### A. Sederhanakan Flow Konveksi

- hilangkan `pricing_mode` customer-facing
- hilangkan jalur `request_quote`
- hilangkan status `awaiting_price` dari flow normal customer
- pastikan create order konveksi kembali ke model:
  - item
  - total
  - full payment
  - reference file

#### B. Pangkas Quotation Flow

- hapus panel `Terbitkan quotation` dari order konveksi
- hapus requirement office untuk publish quote sebelum customer bisa bayar
- kembalikan pembayaran konveksi ke flow sederhana sesuai PRD

#### C. Sederhanakan Kolaborasi Desain

- ubah section design collaboration menjadi:
  - daftar file customer
  - daftar file office
  - catatan sederhana
  - tombol buka file
- hapus approval desain per card
- hapus request revision per card
- hapus state review desain yang terlalu granular jika tidak benar-benar dibutuhkan PRD

#### D. Hapus Kanban Design Process

- ganti kanban board dengan list / section layout biasa
- hilangkan drag and drop
- hilangkan workflow attachment update endpoint khusus board
- hilangkan linked attachment per card dari flow utama

#### E. Rapikan Dokumentasi Dan Test

- update docs agar hanya mencerminkan flow yang final
- hapus referensi ke flow quotation hybrid dan kanban jika sudah tidak dipakai
- rapikan feature tests agar menguji flow PRD yang final

## Urutan Pengerjaan Yang Disarankan

### Phase 2.1

Refactor backend flow konveksi:

- service
- request validation
- controller
- status transition

Tujuan:

- memastikan data dan rule bisnis kembali sederhana dulu

### Phase 2.2

Refactor UI customer konveksi:

- create form
- order detail
- payment appearance

Tujuan:

- menghilangkan kebingungan flow hybrid

### Phase 2.3

Refactor UI office order konveksi:

- hapus quotation panel
- hapus kanban board
- kembalikan ke section operasional sederhana

### Phase 2.4

Cleanup:

- migration impact review
- test update
- docs update

## Acceptance Criteria Tahap 2

Tahap 2 dianggap selesai jika kondisi berikut terpenuhi:

- customer tidak lagi melihat flow `request quote`
- order konveksi tidak lagi bergantung pada quotation office
- payment flow konveksi kembali sederhana dan full payment
- office tidak lagi memakai kanban board untuk desain
- design collaboration masih ada, tetapi hanya sebagai upload/list/catatan sederhana
- test feature utama untuk konveksi tetap lolos
- docs sudah konsisten dengan flow final

## Risiko Refactor

### Risiko Teknis

- ada test lama yang masih mengasumsikan flow quotation hybrid
- ada UI lain yang masih membaca status `awaiting_price`
- ada migration / kolom lama yang masih tertinggal walau flow-nya sudah tidak dipakai

### Risiko Produk

- jika tim sebenarnya masih membutuhkan quotation hybrid untuk sebagian kasus, rollback total bisa terlalu keras
- jika office sudah mulai nyaman memakai collaboration board, penyederhanaan bisa terasa mundur

### Mitigasi

- lakukan refactor bertahap
- tandai mana yang dihapus total dan mana yang hanya disembunyikan dari flow utama
- prioritaskan penyelarasan PRD dibanding kenyamanan fitur tambahan

## Tahap 3 Dan Seterusnya

Setelah tahap 2 selesai, backlog berikut bisa dibahas terpisah:

- penegasan rule loyalti `> 5` vs `>= 5`
- enforcement due date / pickup reminder
- corporate account untuk pelanggan perusahaan
- CRM / pemasaran
- automasi diskon RTW berbasis umur stok atau performa penjualan

## Keputusan Final Saat Ini

Refactor ke PRD akan memakai keputusan tetap berikut:

- `Tailor` boleh menjadi area experience-rich
- `Convection` harus kembali menjadi flow operasional yang lebih sederhana
- `Customer app` dan `Office app` tetap dipertahankan sebagai struktur utama sistem
