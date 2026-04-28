# Elisitasi Sistem Djaitin

**Versi:** 1.0  
**Tanggal:** 2026-04-08  
**Basis analisis:** sistem saat ini, `docs/PRD.md`, `docs/prd-alignment-refactor-plan.md`, `docs/prd-alignment-execution-phases.md`, `docs/prd-alignment-status-and-checklists.md`

## Tujuan

Dokumen ini merangkum hasil elisitasi kebutuhan berdasarkan sistem Djaitin yang sudah berjalan dan proses penyelarasan ke PRD. Fokus dokumen ini dibagi menjadi:

1. Tahap 1: identifikasi fitur yang dipertahankan, disederhanakan, atau dihapus
2. Tahap 2: elisitasi ulang flow inti konveksi
3. Tahap 3: elisitasi ulang kolaborasi desain konveksi
4. Final draft elisitasi: ringkasan kebutuhan final yang menjadi acuan lanjutan

## Tahap 1

### Tabel Elisitasi Tahap 1

| No | Area | Kondisi Sistem Saat Ini | Kebutuhan Bisnis / PRD | Keputusan Elisitasi |
|---|---|---|---|---|
| 1 | Arsitektur aplikasi | Customer app dan office app dipisah | Pemisahan per aktor memudahkan kontrol akses dan UX | `Keep` |
| 2 | Tailor wizard | Wizard tailor sudah eksploratif dan kuat secara UX | Perlu tetap ada diferensiasi pengalaman tailor | `Keep` |
| 3 | Tailor order | Mendukung model, bahan, ukuran, draft, measurement reuse | PRD meminta inti layanan tailor tetap utuh | `Keep` |
| 4 | Loyalty tailor | Sudah ada diskon loyalti | PRD meminta loyalti tailor tetap dipertahankan | `Keep`, rule masih perlu dipertegas |
| 5 | Ready-to-wear | Sudah ada katalog, cart, checkout, delivery | PRD meminta RTW tetap menjadi surface utama | `Keep` |
| 6 | Payment verification | Cash dan transfer sudah didukung | PRD meminta verifikasi pembayaran tertib | `Keep` |
| 7 | Nota / kwitansi | Dokumen transaksi sudah ada | PRD meminta dokumen operasional tetap tersedia | `Keep` |
| 8 | Convection flow | Pernah berkembang menjadi hybrid quotation | PRD meminta flow konveksi sederhana dan full payment gate | `Simplify` |
| 9 | Design collaboration | Pernah berkembang ke approval workflow dan card/thread | PRD hanya butuh pertukaran file dan catatan | `Simplify` |
| 10 | Production board | Ada elemen operasional yang sempat terlalu kompleks | PRD hanya butuh monitoring operasional, bukan PM tool | `Simplify` |
| 11 | RFQ / quotation hybrid | Ada jejak `awaiting_price`, quote publish, request quote | Tidak diminta sebagai flow inti PRD | `Remove / Roll Back` |
| 12 | Kanban design process | Ada jejak kanban, attachment per card, thread follow-up | Tidak relevan untuk narasi bisnis inti | `Remove / Roll Back` |

### Ringkasan Tahap 1

- Fitur inti tailor, RTW, pembayaran, dokumen, dan split app dipertahankan.
- Area yang perlu disederhanakan adalah konveksi dan kolaborasi desain.
- Area yang dinilai berlebihan adalah quotation hybrid dan workflow desain ala project management.

## Tahap 2

### Fokus Elisitasi Tahap 2

Tahap 2 memvalidasi ulang kebutuhan inti order konveksi agar kembali sesuai PRD:

1. customer membuat order konveksi
2. customer mengunggah referensi
3. customer membayar penuh
4. office memverifikasi pembayaran
5. order baru dapat masuk produksi

### Tabel Elisitasi Tahap 2

| No | Area | Kondisi Sistem Saat Ini | Kebutuhan Final | Status |
|---|---|---|---|---|
| 1 | Create order konveksi | Form customer sudah diarahkan ke full payment | Customer wajib isi perusahaan, item, harga, file referensi, dan pembayaran | `Implemented` |
| 2 | Pricing mode | `pricing_mode` sudah tidak dipakai di flow utama | Tidak ada pilihan `request quote` di customer-facing flow | `Implemented` |
| 3 | Request quote | Jalur hybrid sudah dibersihkan dari flow utama | Customer tidak perlu menunggu quotation untuk bisa lanjut | `Implemented` |
| 4 | Payment gate | Konveksi memakai full payment gate sebelum `in_progress` | Produksi hanya boleh dimulai setelah lunas dan verified | `Implemented` |
| 5 | Office quotation panel | Panel quotation sudah tidak menjadi jalur utama | Office fokus ke verifikasi dan operasional order | `Implemented` |
| 6 | Status `awaiting_price` | Masih ada jejak enum / compatibility path | Harus keluar dari flow utama dan idealnya dibersihkan total | `Partially closed` |
| 7 | Test flow konveksi | Test sudah diubah ke skenario full payment | Coverage harus mengikuti flow PRD final | `Implemented` |
| 8 | Dokumentasi flow lama | Sebagian docs lama masih menyebut quotation/kanban | Docs utama harus konsisten dengan flow sederhana | `Open` |

### Kesimpulan Tahap 2

- Secara fungsional, flow inti konveksi sudah kembali ke model PRD.
- Residual technical debt masih ada pada enum / field legacy dan dokumentasi lama.

## Tahap 3

### Fokus Elisitasi Tahap 3

Tahap 3 memvalidasi ulang kebutuhan kolaborasi desain konveksi agar tetap berguna tanpa menjadi sistem workflow terpisah.

### Tabel Elisitasi Tahap 3

| No | Area | Kondisi Sistem Saat Ini | Kebutuhan Final | Status |
|---|---|---|---|---|
| 1 | Pertukaran file customer-office | Sudah ada attachment pada detail order | File menjadi media utama pertukaran desain dan revisi | `Implemented` |
| 2 | Catatan per file | Sudah ada `title` dan `notes` | Catatan singkat wajib cukup untuk konteks file | `Implemented` |
| 3 | Approval desain | Workflow approval kompleks sudah tidak dipakai | Tidak ada approve/reject/revision status khusus | `Implemented` |
| 4 | Revision workflow | Revisi kini cukup direpresentasikan sebagai file baru + catatan | Tidak perlu state machine desain | `Implemented` |
| 5 | Linked attachment thread | Sudah tidak dipakai di code path utama | Tidak ada thread per card pada surface utama | `Implemented` |
| 6 | UI office | Sudah menjadi list sederhana pada tab `Produksi & File` | Office hanya upload, lihat daftar, buka file, baca catatan | `Implemented` |
| 7 | UI customer | Sudah menjadi list sederhana di detail order | Customer melihat file, catatan, dan dapat upload tambahan bila perlu | `Implemented` |
| 8 | Test attachment | Test sudah dipangkas ke upload/list basic | Test fokus pada flow sederhana, bukan workflow approval | `Implemented` |
| 9 | Cleanup database legacy | Masih ada migrasi/kolom legacy yang pernah dipakai | Cleanup total bisa dilakukan di phase hardening | `Open` |

### Kesimpulan Tahap 3

- Kebutuhan bisnis dasar pertukaran desain masih terpenuhi.
- Kompleksitas yang menyerupai board/workflow berhasil diturunkan.
- Sisa pekerjaan terutama ada di cleanup schema dan konsistensi dokumentasi final.

## Final Draft Elisitasi

### Prinsip Final

- Djaitin tetap diposisikan sebagai sistem operasional tailor, ready-to-wear, dan konveksi.
- Customer app dan office app tetap dipisah.
- Tailor tetap boleh lebih eksploratif dari PRD sebagai keputusan produk yang disengaja.
- Konveksi dan kolaborasi desain harus tetap sederhana, jelas, dan operasional.

### Tabel Final Draft Elisitasi

| No | Kebutuhan Final | Deskripsi | Prioritas | Status Sistem |
|---|---|---|---|---|
| 1 | Split app customer dan office | Surface dipisah sesuai aktor dan hak akses | Tinggi | Sudah ada |
| 2 | Tailor wizard eksploratif | Wizard tetap jadi pembeda UX Djaitin | Tinggi | Sudah ada |
| 3 | Tailor order dengan measurement reuse | Customer dapat reuse ukuran dan konfigurasi | Tinggi | Sudah ada |
| 4 | Loyalty tailor | Diskon pelanggan loyal tetap dipertahankan, rule perlu finalisasi | Sedang | Sebagian ada |
| 5 | Ready-to-wear commerce | Katalog, cart, checkout, delivery tetap menjadi bagian MVP | Tinggi | Sudah ada |
| 6 | Konveksi simple full-payment flow | Order konveksi dibuat langsung dengan nilai final dan bayar penuh | Tinggi | Sudah ada |
| 7 | Verifikasi transfer | Transfer harus diverifikasi office/kasir sebelum dianggap diterima | Tinggi | Sudah ada |
| 8 | Produksi berdasarkan payment gate | Tailor minimal DP verified 50%, konveksi full payment verified | Tinggi | Sudah ada |
| 9 | Kolaborasi desain sederhana | File + catatan, tanpa approval board dan thread per card | Tinggi | Sudah ada |
| 10 | Dokumen transaksi | Nota dan kwitansi tersedia sesuai rule pembayaran | Tinggi | Sudah ada |
| 11 | Dashboard dan report operasional | Office/admin tetap punya visibilitas operasional dan bisnis | Tinggi | Sudah ada |
| 12 | UI cleanup dan terminology alignment | Istilah dan layout harus konsisten dengan PRD | Sedang | Belum selesai |
| 13 | Due date / pickup SOP | Perlu penegasan rule operasional pickup | Sedang | Belum final |
| 14 | Cleanup legacy flow | Enum, field, migrasi, dan docs lama perlu dirapikan | Sedang | Belum selesai |

### Keputusan Final Elisitasi

1. Sistem tidak lagi diarahkan ke model quotation hybrid sebagai flow utama konveksi.
2. Sistem tidak lagi memakai approval workflow desain sebagai kebutuhan inti.
3. Fokus final MVP adalah operasional order, pembayaran, produksi, pengiriman, dan dokumentasi yang rapi.
4. Sisa pengembangan berikutnya sebaiknya fokus ke:
   - Phase 4: UI cleanup and consistency
   - Phase 5: business rule tightening
   - Phase 6: documentation and final hardening

## Catatan Implementasi

- Dokumen ini adalah dokumen elisitasi berbasis kondisi sistem saat ini, bukan dokumen ide awal.
- Jika setelah ini Djaitin ingin menambahkan kembali RFQ formal atau workflow desain kompleks, itu sebaiknya diposisikan sebagai fase produk baru, bukan baseline PRD saat ini.

