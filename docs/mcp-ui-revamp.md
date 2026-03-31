# Panduan Best Practice: Revamp UI djaitin-app via MCP

Dokumen ini merangkum alur kerja optimal untuk melakukan transformasi visual dan fungsional pada `djaitin-app` menggunakan kekuatan Model Context Protocol (MCP) dan Domain-Specific Skills.

## 1. Persiapan & Konteks (Boost & Context7)
Langkah pertama adalah menyelaraskan pengetahuan AI dengan teknologi terbaru (Laravel 12, Inertia v2, Tailwind v4).
- **Tool**: `mcp_context7_query-docs`
- **Tujuan**: Menghindari penggunaan API yang deprecated dan memanfaatkan fitur performa terbaru.
- **Prompt**: *"Gunakan context7 untuk riset fitur terbaru Inertia v2 (seperti Async Polling) dan Tailwind CSS v4. Terapkan pengetahuan ini pada arsitektur frontend kita."*

## 2. Fondasi Identitas Visual (Stitch & design-md)
Membangun "Source of Truth" untuk desain agar AI memiliki konsistensi visual.
- **Tool**: `mcp_StitchMCP_create_design_system` & Skill `design-md`
- **Tujuan**: Mendefinisikan warna, tipografi, dan radius sudut secara global.
- **Langkah**:
  1. Buat design system di Stitch.
  2. Jalankan `design-md` untuk menghasilkan `DESIGN.md`.
- **Prompt**: *"Buat design system bertema 'Sleek FinTech' di Stitch. Gunakan warna Emerald (#10b981) sebagai primary. Jalankan skill design-md untuk mensintesis aturan desain ke file docs/DESIGN.md."*

## 3. Pembangunan Komponen (shadcn-ui)
Menggunakan standar industri untuk UI yang aksesibel dan mudah di-style.
- **Skill**: `shadcn-ui`
- **Tujuan**: Mengisi `resources/js/components/ui` dengan blok bangunan yang konsisten.
- **Prompt**: *"Gunakan skill shadcn-ui untuk menginstalasikan komponen dasar (button, input, dialog, card). Pastikan variabel CSS-nya merujuk pada DESIGN.md."*

## 4. Revamp Iteratif (Stitch Edit Screens)
Melakukan transformasi pada halaman yang sudah ada.
- **Tool**: `mcp_StitchMCP_edit_screens`
- **Tujuan**: Mengubah UI lama menjadi desain baru tanpa merusak struktur data.
- **Prompt**: *"Ambil screen 'Landing Page' (ID: xxxxx). Jalankan edit_screens untuk memberikan tampilan glassmorphism, update hero section dengan copy-writing yang lebih menjual, dan pastikan responsive di mobile."*

## 5. Integrasi Backend (Wayfinder)
Menghubungkan visual baru ke logika Laravel.
- **Skill**: `wayfinder-development`
- **Tujuan**: Memetakan data dari Controller ke props React/Inertia dengan benar.
- **Prompt**: *"Gunakan skill wayfinder untuk menghubungkan halaman Order yang baru saja di-revamp dengan OrderController. Pastikan semua props ter-mapping sesuai interface TypeScript di app.tsx."*

## 6. Penjaminan Kualitas (Pest & Pint)
Memastikan kode bersih dan berfungsi.
- **Skill**: `pest-testing`
- **Tool**: CLI (`vendor/bin/pint`)
- **Prompt**: *"Jalankan pest-testing untuk memvalidasi flow checkout setelah UI di-update. Kemudian jalankan laravel-pint untuk merapikan style kode PHP."*

---
*Dibuat otomatis oleh Antigravity asisten coding Anda.*
