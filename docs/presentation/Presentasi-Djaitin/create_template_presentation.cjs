const pptxgen = require('pptxgenjs');
const path = require('path');

const ROOT = '/mnt/c/laragon/www/djaitin/docs/presentation/Presentasi-Djaitin';
const LOGO = path.join(ROOT, 'diagrams/logo-djaitin.png');
const OUT = path.join(ROOT, 'Template-Presentasi-UML-Djaitin.pptx');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Djaitin Team';
pptx.subject = 'Template Presentasi UML Djaitin';
pptx.title = 'Template Presentasi UML Djaitin';
pptx.company = 'Djaitin';
pptx.lang = 'id-ID';
pptx.theme = {
  headFontFace: 'Trebuchet MS',
  bodyFontFace: 'Calibri',
  lang: 'id-ID'
};

const C = {
  navy: '0F172A',
  blue: '2F70B8',
  blue2: 'EAF2FF',
  yellow: 'FFD21A',
  yellow2: 'FFF7D6',
  white: 'FFFFFF',
  bg: 'F8FBFF',
  slate: '475569',
  muted: '64748B',
  border: 'D8E7FF',
  pale: 'F3F8FF'
};

function master(slide) {
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, { x:0, y:0, w:13.333, h:0.12, fill:{color:C.yellow}, line:{color:C.yellow} });
  slide.addShape(pptx.ShapeType.rect, { x:0, y:0.12, w:13.333, h:0.05, fill:{color:C.blue}, line:{color:C.blue} });
  slide.addImage({ path: LOGO, x:11.45, y:0.27, w:1.25, h:0.63 });
  slide.addText('UML Djaitin', { x:0.55, y:7.15, w:2.0, h:0.18, fontSize:8.5, color:C.muted, margin:0 });
  slide.addText('SIM Konveksi • Tailor • Ready-to-Wear', { x:2.0, y:7.15, w:3.5, h:0.18, fontSize:8.5, color:C.muted, margin:0 });
}

function title(slide, t, sub='') {
  slide.addText(t, { x:0.62, y:0.43, w:9.4, h:0.42, fontFace:'Trebuchet MS', fontSize:23, bold:true, color:C.navy, margin:0 });
  if (sub) slide.addText(sub, { x:0.64, y:0.88, w:8.8, h:0.22, fontSize:10.5, color:C.muted, margin:0 });
}

function placeholder(slide, label, x, y, w, h, hint='Taruh diagram / screenshot di area ini') {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius:0.06, fill:{color:C.white}, line:{color:C.blue, width:1.2, dash:'dash'} });
  slide.addShape(pptx.ShapeType.roundRect, { x:x+0.2, y:y+0.2, w:w-0.4, h:h-0.4, rectRadius:0.04, fill:{color:C.pale}, line:{color:'BFD7FF', width:0.7, dash:'dash'} });
  slide.addText(label, { x:x+0.35, y:y+h/2-0.28, w:w-0.7, h:0.28, fontSize:17, bold:true, color:C.blue, align:'center', margin:0 });
  slide.addText(hint, { x:x+0.4, y:y+h/2+0.08, w:w-0.8, h:0.2, fontSize:10, color:C.muted, align:'center', margin:0 });
}

function note(slide, text, x, y, w, h, fill=C.yellow2, border=C.yellow) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius:0.06, fill:{color:fill}, line:{color:border, width:1} });
  slide.addText(text, { x:x+0.16, y:y+0.12, w:w-0.32, h:h-0.24, fontSize:10.2, color:C.slate, fit:'shrink', margin:0 });
}

function card(slide, head, body, x, y, w, h, accent=C.blue) {
  slide.addShape(pptx.ShapeType.roundRect, { x,y,w,h,rectRadius:0.06, fill:{color:C.white}, line:{color:C.border, width:1} });
  slide.addShape(pptx.ShapeType.rect, { x,y,w:0.08,h, fill:{color:accent}, line:{color:accent} });
  slide.addText(head, { x:x+0.22, y:y+0.15, w:w-0.35, h:0.23, fontSize:12.5, bold:true, color:C.navy, margin:0 });
  slide.addText(body, { x:x+0.22, y:y+0.48, w:w-0.35, h:h-0.58, fontSize:9.5, color:C.slate, margin:0.01, fit:'shrink' });
}

function section(t, sub) {
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.rect, {x:0,y:0,w:13.333,h:7.5,fill:{color:C.navy},line:{color:C.navy}});
  s.addShape(pptx.ShapeType.rect, {x:0,y:0,w:13.333,h:0.16,fill:{color:C.yellow},line:{color:C.yellow}});
  s.addImage({ path: LOGO, x:0.8, y:0.75, w:1.6, h:0.8 });
  s.addText(t, {x:0.85,y:2.65,w:9.4,h:0.62,fontSize:32,bold:true,color:C.white,margin:0});
  s.addText(sub, {x:0.88,y:3.43,w:8.8,h:0.35,fontSize:14.5,color:'DCEBFF',margin:0});
  s.addShape(pptx.ShapeType.arc, { x:9.3, y:-0.4, w:4.3, h:4.3, line:{color:C.yellow, transparency:12, width:7}, rotate:25 });
  return s;
}

// 1 cover
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.rect, {x:0,y:0,w:13.333,h:7.5,fill:{color:C.navy},line:{color:C.navy}});
  s.addShape(pptx.ShapeType.rect, {x:0,y:0,w:13.333,h:0.16,fill:{color:C.yellow},line:{color:C.yellow}});
  s.addImage({ path: LOGO, x:0.85, y:0.8, w:1.85, h:0.93 });
  s.addText('Template Presentasi UML', {x:0.88,y:2.3,w:6.8,h:0.38,fontSize:19,bold:true,color:C.yellow,margin:0});
  s.addText('Sistem Informasi Manajemen\nDjaitin', {x:0.85,y:2.8,w:8.8,h:1.15,fontSize:38,bold:true,color:C.white,margin:0,breakLine:false});
  s.addText('Template bersih untuk menaruh diagram final dari draw.io / Mermaid.', {x:0.9,y:4.25,w:8.6,h:0.35,fontSize:15,color:'DCEBFF',margin:0});
  s.addText('Catatan export: Mermaid image gunakan light mode + non-transparent. Diagram lain aman memakai transparent sesuai kebutuhan.', {x:0.9,y:6.35,w:9.8,h:0.3,fontSize:10.5,color:'B7D8FF',margin:0});
}

// 2 agenda
{
  const s = pptx.addSlide(); master(s); title(s,'Alur Presentasi','Silakan isi nama kelompok, kelas, dan detail kampus pada slide pembuka bila perlu.');
  const items = [
    ['1', 'Konteks Sistem', 'Masalah bisnis dan scope Djaitin'],
    ['2', 'Elisitasi', 'Tahap I, MDI, TOE/HML, final draft'],
    ['3', 'Use Case Diagram', 'Aktor dan layanan sistem'],
    ['4', 'Activity Diagram', 'Alur aktivitas per proses'],
    ['5', 'Sequence Diagram', 'Interaksi runtime per skenario'],
    ['6', 'Class Diagram', 'Struktur class dan relasi domain'],
  ];
  items.forEach((it,i)=>{
    const x=0.9+(i%2)*6.05, y=1.35+Math.floor(i/2)*1.45;
    card(s, `${it[0]}. ${it[1]}`, it[2], x,y,5.35,0.95, i%2?C.yellow:C.blue);
  });
}

// 3 context
{
  const s = pptx.addSlide(); master(s); title(s,'Konteks Sistem Djaitin','Ringkasan area bisnis yang dimodelkan dalam UML.');
  card(s,'Layanan Inti','Tailor/custom\nReady-to-wear\nOrder konveksi',0.75,1.35,3.7,1.45,C.blue);
  card(s,'Transaksi','DP minimal 50%\nTunai dan transfer\nNota dan kwitansi',4.85,1.35,3.7,1.45,C.yellow);
  card(s,'Operasional','Customer dan ukuran\nMaster data\nProduksi, pengiriman, laporan',8.95,1.35,3.7,1.45,C.blue);
  placeholder(s,'PLACEHOLDER: screenshot / arsitektur ringkas sistem',0.9,3.25,11.55,2.9,'Opsional: taruh screenshot dashboard atau diagram konteks sederhana');
}

section('01 • Elisitasi Kebutuhan','Dari kebutuhan mentah menuju final draft requirement.');

// 5 elisitasi
{
  const s = pptx.addSlide(); master(s); title(s,'Metode Elisitasi MDI dan TOE/HML','Gunakan slide ini untuk menjelaskan metodologi penentuan scope.');
  card(s,'Tahap I','Requirement mentah dikumpulkan dari observasi, wawancara, dan arahan client.',0.8,1.35,3.7,2.0,C.blue);
  card(s,'Tahap II — MDI','M = Mandatory\nD = Desirable\nI = Inessential',4.82,1.35,3.7,2.0,C.yellow);
  card(s,'Tahap III — TOE/HML','Technical, Operational, Economic dinilai High/Medium/Low untuk melihat kelayakan.',8.85,1.35,3.7,2.0,C.blue);
  note(s,'Final draft Djaitin berisi requirement utama: autentikasi, dashboard, tailor, RTW, konveksi, pembayaran, dokumen, produksi, pengiriman, laporan, dan audit log.',0.9,4.25,11.55,1.25);
}

// 6 final draft
{
  const s = pptx.addSlide(); master(s); title(s,'Final Draft Requirement','Kelompok requirement final yang menjadi dasar UML.');
  const groups = [
    ['Akun & Dashboard','Login customer/staff, dashboard customer, dashboard office'],
    ['Layanan Bisnis','Tailor/custom, katalog RTW, keranjang, checkout, order konveksi'],
    ['Pembayaran & Dokumen','Tunai, transfer, verifikasi, nota, kwitansi'],
    ['Aturan Bisnis','DP tailor, pelunasan sebelum ambil, full payment konveksi'],
    ['Administrasi','Data pelanggan, ukuran, produk, bahan, model'],
    ['Monitoring','Laporan operasional, pengiriman, notifikasi, audit log'],
  ];
  groups.forEach((g,i)=>card(s,g[0],g[1],0.8+(i%2)*6.05,1.25+Math.floor(i/2)*1.45,5.35,0.98,i%2?C.yellow:C.blue));
}

section('02 • Use Case Diagram','Taruh hasil export use case diagram dari draw.io pada placeholder berikut.');

// 8 use case summary
{
  const s = pptx.addSlide(); master(s); title(s,'Use Case Diagram — Ringkasan','Gunakan slide ini untuk menjelaskan aktor dan modul use case.');
  card(s,'Aktor','Guest\nCustomer\nStaff/Kasir\nProduksi\nAdmin\nOwner',0.8,1.25,3.2,4.8,C.blue);
  card(s,'Boundary','Sistem Djaitin menjadi boundary. Actor “Sistem” tidak dipakai karena bukan entitas eksternal.',4.25,1.25,3.9,4.8,C.yellow);
  card(s,'Relasi','Association: aktor memakai fitur\n<<include>>: langkah wajib\n<<extend>>: langkah opsional/kondisional',8.4,1.25,3.9,4.8,C.blue);
}

// 9 UCD placeholder
{
  const s = pptx.addSlide(); master(s); title(s,'Use Case Diagram — Placeholder','Export dari docs/drawio/use-case-diagrams.drawio lalu masukkan ke area ini.');
  placeholder(s,'PLACEHOLDER: USE CASE DIAGRAM',0.7,1.25,11.95,5.65,'Masukkan gambar use case diagram utama / gabungan / page pilihan');
}

section('03 • Activity Diagram','Taruh hasil export activity diagram dari draw.io pada placeholder berikut.');

// 11 activity summary
{
  const s = pptx.addSlide(); master(s); title(s,'Activity Diagram — Ringkasan Alur','Swimlane digunakan untuk membedakan tanggung jawab Customer, Sistem, Staff, Produksi, Admin, Owner.');
  const flows=['Order Tailor / Custom','Checkout Ready-to-Wear','Order Konveksi','Verifikasi Pembayaran','Produksi & Pengiriman','Master Data & Laporan'];
  flows.forEach((f,i)=>card(s,`AD-${i+1}`,f,0.85+(i%3)*4.05,1.45+Math.floor(i/3)*1.65,3.55,1.05,i%2?C.yellow:C.blue));
  note(s,'Setiap activity harus memiliki start node, end node, action, decision, dan container/swimlane per bagian.',1.0,5.45,11.25,0.75);
}

// 12 activity placeholder
{
  const s = pptx.addSlide(); master(s); title(s,'Activity Diagram — Placeholder','Export dari docs/drawio/activity-diagrams.drawio lalu masukkan ke area ini.');
  placeholder(s,'PLACEHOLDER: ACTIVITY DIAGRAM',0.7,1.25,11.95,5.65,'Masukkan gambar activity diagram yang ingin dipresentasikan');
}

section('04 • Sequence Diagram','Gunakan Mermaid image light mode, transparent OFF, agar kompatibel saat export.');

// 14 seq summary
{
  const s = pptx.addSlide(); master(s); title(s,'Sequence Diagram — Daftar Skenario','Diagram tersedia pada folder diagrams/svg-sequence.');
  const seq=['Login Pengguna','Order Tailor dan Pembayaran DP','Checkout Ready-to-Wear','Pengajuan Order Konveksi','Verifikasi Pembayaran','Produksi dan Pengiriman'];
  seq.forEach((q,i)=>card(s,`SD-${i+1}`,q,0.85+(i%2)*6.05,1.25+Math.floor(i/2)*1.35,5.35,0.9,i%2?C.yellow:C.blue));
}

// 15 seq placeholder
{
  const s = pptx.addSlide(); master(s); title(s,'Sequence Diagram — Placeholder','Masukkan SVG/PNG sequence diagram yang sudah diexport dari Mermaid/draw.io.');
  placeholder(s,'PLACEHOLDER: SEQUENCE DIAGRAM',0.7,1.25,11.95,5.65,'Rekomendasi: pilih 1–2 skenario paling penting, misalnya Order Konveksi dan Verifikasi Pembayaran');
}

section('05 • Class Diagram','Gunakan Mermaid image light mode, transparent OFF, agar class box tetap terbaca.');

// 17 class placeholder
{
  const s = pptx.addSlide(); master(s); title(s,'Class Diagram — Placeholder','Masukkan SVG class diagram dari folder diagrams/svg-class.');
  placeholder(s,'PLACEHOLDER: CLASS DIAGRAM',0.55,1.12,12.25,5.9,'Jika terlalu besar, crop/zoom bagian domain utama: User, Customer, Order, Payment, Product, Shipment');
}

// 18 explanation
{
  const s = pptx.addSlide(); master(s); title(s,'Class Diagram — Narasi Penjelasan','Gunakan slide ini untuk menjelaskan relasi penting tanpa menampilkan diagram terlalu kecil.');
  card(s,'Akun & Customer','User terhubung ke Customer, Address, Measurement, dan Cart.',0.8,1.25,3.65,3.8,C.blue);
  card(s,'Order & Transaksi','Order memiliki OrderItem, Payment, Shipment, dan OrderAttachment.',4.85,1.25,3.65,3.8,C.yellow);
  card(s,'Master Data','Product, Fabric, GarmentModel, Courier, DiscountPolicy, dan AuditLog mendukung operasional.',8.9,1.25,3.65,3.8,C.blue);
  note(s,'Notasi: + public, # protected, - private. Composition (*--), aggregation (o--), association (-->), dependency (..>).',0.95,5.55,11.3,0.7);
}

// 19 closing
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.rect, {x:0,y:0,w:13.333,h:7.5,fill:{color:C.navy},line:{color:C.navy}});
  s.addShape(pptx.ShapeType.rect, {x:0,y:0,w:13.333,h:0.16,fill:{color:C.yellow},line:{color:C.yellow}});
  s.addImage({ path: LOGO, x:0.85, y:0.8, w:1.65, h:0.83 });
  s.addText('Kesimpulan', {x:0.9,y:2.25,w:5,h:0.55,fontSize:34,bold:true,color:C.white,margin:0});
  s.addText('UML Djaitin merepresentasikan kebutuhan final sistem: layanan tailor, ready-to-wear, konveksi, pembayaran, dokumen, produksi, pengiriman, laporan, dan audit.', {x:0.92,y:3.05,w:9.2,h:0.8,fontSize:15.5,color:'DCEBFF',margin:0});
  s.addText('Terima kasih', {x:0.92,y:5.6,w:3,h:0.3,fontSize:14,bold:true,color:C.yellow,margin:0});
}

pptx.writeFile({ fileName: OUT });
