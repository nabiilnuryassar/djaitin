# Convection Design Collaboration

## Ringkasan

Kolaborasi desain untuk order konveksi di Djaitin dibuat sederhana dan operasional: kedua pihak (customer dan office) bertukar file dan catatan melalui `attachments` pada detail order, tanpa workflow approval/revision yang kompleks.

Tujuan utamanya:

- customer dan office bisa mengirim file referensi/desain/revisi/final artwork
- semua file tampil sebagai daftar lampiran beserta catatan singkat
- setiap lampiran bisa dibuka dari customer app maupun office app

## Siapa Yang Menggunakan

- `Customer`
  - melihat detail order konveksi dari customer app
  - mengunggah referensi tambahan atau file revisi bila diperlukan
- `Office`
  - mengunggah proposal desain / revisi / final artwork ke order
  - melihat seluruh lampiran (dari customer dan office) sebagai satu daftar

## Letak Menu

### Customer

1. Buka menu `Pesanan` (`/app/orders`)
2. Pilih order bertipe `Convection`
3. Di halaman detail order, lihat section `Kolaborasi desain`

### Office

1. Buka menu `Pesanan` (`/office/orders`)
2. Pilih order konveksi
3. Di halaman detail order, buka tab `Produksi & File`
4. Lihat card `Kolaborasi desain`

## Lokasi UI

- customer detail order:
  - [resources/js/pages/Customer/Orders/Show.tsx](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/resources/js/pages/Customer/Orders/Show.tsx)
- office detail order:
  - [resources/js/pages/Office/Orders/Show.tsx](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/resources/js/pages/Office/Orders/Show.tsx)

## Alur End-to-End

### Alur Customer

1. customer membuat order konveksi dan mengunggah file referensi awal
2. customer bisa membuka detail order untuk melihat daftar lampiran
3. customer dapat mengunggah lampiran tambahan (misalnya file revisi atau referensi tambahan) dengan catatan singkat

### Alur Office

1. office membuka detail order konveksi
2. office mengunggah file (proposal desain/revisi/final artwork/other) beserta catatan
3. customer akan melihat file tersebut di daftar lampiran pada detail order

## Tipe Attachment

Tipe attachment didefinisikan di:

- [app/Enums/OrderAttachmentType.php](/home/nabiil-mint/self-project/sim-convection-taylor/djaitin-app/app/Enums/OrderAttachmentType.php)

Daftar tipe:

- `reference`: referensi awal atau referensi tambahan
- `design_proposal`: file proposal desain dari office
- `revision`: file revisi dari salah satu pihak
- `final_artwork`: file final artwork
- `other`: file pendukung lain

## Aturan Bisnis

- section kolaborasi desain hanya relevan untuk order dengan tipe `convection`
- lampiran adalah “single source of truth” untuk pertukaran file dan catatan, tanpa sistem chat terpisah
- keputusan “setuju/revisi” tidak dimodelkan sebagai status; jika perlu revisi, pihak terkait mengunggah file revisi beserta catatan

## Struktur Data

Lampiran disimpan di tabel `order_attachments`:

- `file_path`, `file_name`, `file_type`
- `title`, `notes`
- `attachment_type`
- `uploaded_by`, timestamp

Catatan: beberapa kolom legacy (misalnya yang pernah dipakai untuk workflow approval/thread) dapat masih ada di database, tetapi tidak dipakai pada flow utama.

