# Presentasi UML Djaitin

Folder ini berisi template PPT bersih untuk presentasi UML Djaitin beserta seluruh source diagram supaya kamu bisa export sendiri sesuai gaya dan ukuran yang diinginkan.

## Isi folder

```
Presentasi-Djaitin/
├── Template-Presentasi-UML-Djaitin.pptx   <-- template PPT placeholder
├── create_template_presentation.cjs       <-- generator template (kalau mau diregenerate)
├── README.md
└── diagrams/
    ├── logo-djaitin.png                   <-- logo dipakai PPT
    ├── drawio/                            <-- source draw.io semua diagram
    │   ├── use-case-diagrams.drawio
    │   ├── activity-diagrams.drawio
    │   ├── class-diagram-djaitin.drawio
    │   └── diagram-sequence-djaitin.drawio
    ├── svg-class/                         <-- SVG class diagram (Mermaid image dari draw.io)
    │   └── Class-Diagram-Djaitin.svg
    ├── svg-sequence/                      <-- SVG sequence diagram per skenario
    │   ├── SD-1-Login-Pengguna.svg
    │   ├── SD-2-Order-Tailor-DP.svg
    │   ├── SD-3-Checkout-RTW.svg
    │   ├── SD-4-Pengajuan-Konveksi.svg
    │   ├── SD-5-Verifikasi-Pembayaran.svg
    │   └── SD-6-Produksi-Pengiriman.svg
    └── mermaid-source/                    <-- markdown sumber Mermaid (kalau perlu edit)
        ├── class-diagram.md
        └── sequence-diagrams.md
```

## Cara pakai template PPT

1. Buka `Template-Presentasi-UML-Djaitin.pptx` di PowerPoint.
2. Slide cover dan section divider sudah disiapkan sesuai warna logo Djaitin (biru `#2F70B8`, kuning `#FFD21A`, navy `#0F172A`).
3. Slide-slide bertuliskan `PLACEHOLDER:` adalah area yang menunggu kamu masukkan diagram.
4. Buka draw.io (`diagrams/drawio/*.drawio`), buka page yang ingin ditampilkan, lalu export.

## Rekomendasi export diagram

Gunakan menu draw.io: `File → Export As → PNG` atau `SVG`.

| Jenis diagram | Format | Background | Catatan |
|---|---|---|---|
| Use case (`use-case-diagrams.drawio`) | PNG | Transparent ON | Tinggal letakkan ke placeholder |
| Activity (`activity-diagrams.drawio`) | PNG | Transparent ON | Tinggal letakkan ke placeholder |
| Sequence (`diagram-sequence-djaitin.drawio`) | PNG/SVG | **Transparent OFF**, **Light mode ON** | Karena memakai Mermaid image embed |
| Class diagram (`class-diagram-djaitin.drawio`) | PNG/SVG | **Transparent OFF**, **Light mode ON** | Karena memakai Mermaid image embed |

Alasan transparent OFF untuk class & sequence: shape-nya merupakan Mermaid image dengan warna berbasis tema, jadi background putih solid memastikan teks tetap terbaca di slide.

## Alternatif export class & sequence

Kalau lebih nyaman, kamu juga bisa langsung pakai SVG yang sudah disiapkan di `diagrams/svg-class/` dan `diagrams/svg-sequence/`. Tinggal drag SVG ke PowerPoint atau insert via menu `Insert → Pictures → This Device`.

## Mengganti konten teks

Slide-slide pengantar (konteks, elisitasi, ringkasan use case, ringkasan activity, ringkasan sequence, narasi class diagram) bisa diedit langsung di PowerPoint. Kalau ingin regenerate template, jalankan:

```
node create_template_presentation.cjs
```

dan pastikan `pptxgenjs` tersedia (`npm i -g pptxgenjs` atau `npm i pptxgenjs` di folder ini).

## Tips presentasi

1. Mulai dari konteks bisnis Djaitin sebelum membahas diagram, supaya audiens paham scope.
2. Hubungkan setiap diagram dengan requirement final draft untuk menunjukkan justifikasi akademis.
3. Untuk class diagram yang besar, tampilkan zoom area paling penting (akun, order, pembayaran).
4. Akhiri dengan kesimpulan singkat tentang bagaimana UML mendukung aturan bisnis utama (DP 50% tailor, full payment konveksi, pelunasan sebelum pesanan diambil).
