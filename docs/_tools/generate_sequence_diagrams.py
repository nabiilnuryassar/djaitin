"""Generate native draw.io UML sequence diagrams for Djaitin.

Layout rules:
- Each participant has its own column with consistent dashed lifeline.
- Each step occupies its own row with uniform vertical spacing — no overlaps.
- Activation bars are placed on every participant that is active for a step.
- Messages are straight horizontal arrows. Returns are dashed and travel back
  to the sender on the row below the message.
- Notes are placed in dedicated rows so they never overlap activation bars.
"""

from __future__ import annotations

import html
from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class Participant:
    uid: str
    label: str
    kind: str = "participant"  # actor | participant | boundary | control | entity


@dataclass(frozen=True)
class Step:
    source: str
    target: str
    label: str
    return_label: str | None = None
    note: str | None = None


@dataclass(frozen=True)
class SequenceDiagram:
    name: str
    participants: list[Participant]
    steps: list[Step]
    notes: list[tuple[str, int, str]] = field(default_factory=list)


DIAGRAMS: list[SequenceDiagram] = [
    SequenceDiagram(
        name="SD-1 Login Pengguna",
        participants=[
            Participant("pengguna", "Customer / Staff", "actor"),
            Participant("aplikasi", "Aplikasi Djaitin", "boundary"),
            Participant("akses", "Layanan Hak Akses", "control"),
            Participant("data", "Data Pengguna", "entity"),
        ],
        steps=[
            Step("pengguna", "aplikasi", "Membuka halaman login"),
            Step("pengguna", "aplikasi", "Mengisi email dan kata sandi"),
            Step("aplikasi", "akses", "Memeriksa kelengkapan identitas"),
            Step("akses", "data", "Mencocokkan akun dan kata sandi", "Status kecocokan akun"),
            Step("akses", "aplikasi", "Menentukan peran pengguna"),
            Step("aplikasi", "pengguna", "Menampilkan dashboard sesuai peran"),
        ],
        notes=[("akses", 4, "Jika akun tidak valid, sistem menolak login dan menampilkan pesan kesalahan.")],
    ),
    SequenceDiagram(
        name="SD-2 Order Tailor dan Pembayaran DP",
        participants=[
            Participant("customer", "Customer", "actor"),
            Participant("aplikasi", "Aplikasi Djaitin", "boundary"),
            Participant("office", "Staff / Kasir", "actor"),
            Participant("pesanan", "Data Pesanan Tailor", "entity"),
            Participant("pembayaran", "Data Pembayaran", "entity"),
        ],
        steps=[
            Step("customer", "aplikasi", "Memilih layanan jahit custom"),
            Step("customer", "aplikasi", "Mengisi model, bahan, ukuran, dan catatan"),
            Step("aplikasi", "pesanan", "Menyimpan rancangan pesanan tailor"),
            Step("aplikasi", "office", "Mengirim pengajuan untuk ditinjau"),
            Step("office", "aplikasi", "Menetapkan estimasi harga dan jadwal"),
            Step("aplikasi", "customer", "Menampilkan nominal DP minimal 50%"),
            Step("customer", "aplikasi", "Melakukan pembayaran DP"),
            Step("aplikasi", "pembayaran", "Mencatat DP sebagai menunggu verifikasi"),
            Step("aplikasi", "pesanan", "Mengubah status pesanan menjadi menunggu pembayaran sah"),
        ],
        notes=[("pembayaran", 7, "Aturan bisnis: DP tailor minimal 50% dari estimasi biaya.")],
    ),
    SequenceDiagram(
        name="SD-3 Checkout Ready-to-Wear",
        participants=[
            Participant("customer", "Customer", "actor"),
            Participant("katalog", "Katalog Produk", "boundary"),
            Participant("keranjang", "Keranjang Belanja", "control"),
            Participant("stok", "Data Stok Produk", "entity"),
            Participant("pembayaran", "Data Pembayaran", "entity"),
        ],
        steps=[
            Step("customer", "katalog", "Melihat katalog pakaian siap pakai"),
            Step("customer", "katalog", "Memilih produk, ukuran, dan jumlah"),
            Step("katalog", "stok", "Memastikan ketersediaan stok", "Stok tersedia"),
            Step("katalog", "keranjang", "Menambahkan produk ke keranjang"),
            Step("customer", "keranjang", "Memeriksa rincian belanja"),
            Step("customer", "keranjang", "Mengonfirmasi checkout"),
            Step("keranjang", "stok", "Mengamankan stok untuk pesanan"),
            Step("keranjang", "pembayaran", "Membuat tagihan pembayaran penuh"),
            Step("keranjang", "customer", "Menampilkan ringkasan order dan instruksi pembayaran"),
        ],
        notes=[("stok", 2, "Jika stok tidak cukup, customer diminta mengubah jumlah atau memilih produk lain.")],
    ),
    SequenceDiagram(
        name="SD-4 Pengajuan Order Konveksi",
        participants=[
            Participant("customer", "Customer", "actor"),
            Participant("aplikasi", "Aplikasi Djaitin", "boundary"),
            Participant("office", "Staff / Kasir", "actor"),
            Participant("pesanan", "Data Pesanan Konveksi", "entity"),
            Participant("lampiran", "Dokumen Referensi", "entity"),
        ],
        steps=[
            Step("customer", "aplikasi", "Membuka formulir konveksi"),
            Step("customer", "aplikasi", "Mengisi kebutuhan produksi massal"),
            Step("customer", "aplikasi", "Mengunggah referensi desain atau ukuran"),
            Step("aplikasi", "lampiran", "Menyimpan dokumen referensi"),
            Step("aplikasi", "pesanan", "Mencatat pengajuan konveksi"),
            Step("aplikasi", "office", "Memberi notifikasi pengajuan baru"),
            Step("office", "aplikasi", "Meninjau kebutuhan dan menentukan penawaran"),
            Step("aplikasi", "customer", "Mengirim estimasi biaya dan ketentuan full payment"),
        ],
        notes=[("pesanan", 7, "Aturan bisnis: produksi konveksi dimulai setelah pembayaran penuh sah.")],
    ),
    SequenceDiagram(
        name="SD-5 Verifikasi Pembayaran",
        participants=[
            Participant("customer", "Customer", "actor"),
            Participant("aplikasi", "Aplikasi Djaitin", "boundary"),
            Participant("office", "Staff / Kasir", "actor"),
            Participant("pembayaran", "Data Pembayaran", "entity"),
            Participant("dokumen", "Kwitansi", "entity"),
        ],
        steps=[
            Step("customer", "aplikasi", "Mengunggah bukti transfer"),
            Step("aplikasi", "pembayaran", "Mencatat pembayaran menunggu verifikasi"),
            Step("aplikasi", "office", "Menampilkan daftar pembayaran perlu diperiksa"),
            Step("office", "aplikasi", "Memeriksa bukti dan nominal"),
            Step("aplikasi", "pembayaran", "Mengesahkan pembayaran"),
            Step("aplikasi", "dokumen", "Menerbitkan kwitansi pembayaran"),
            Step("aplikasi", "customer", "Mengirim pemberitahuan pembayaran sah"),
            Step("aplikasi", "office", "Memperbarui status order terkait"),
        ],
        notes=[("pembayaran", 3, "Jika bukti tidak sesuai, pembayaran ditolak dan customer diminta mengunggah ulang.")],
    ),
    SequenceDiagram(
        name="SD-6 Produksi dan Pengiriman",
        participants=[
            Participant("office", "Staff / Kasir", "actor"),
            Participant("produksi", "Tim Produksi", "actor"),
            Participant("aplikasi", "Aplikasi Djaitin", "boundary"),
            Participant("pesanan", "Data Pesanan", "entity"),
            Participant("kurir", "Kurir / Pengiriman", "actor"),
            Participant("customer", "Customer", "actor"),
        ],
        steps=[
            Step("office", "aplikasi", "Memastikan pembayaran telah sah"),
            Step("office", "produksi", "Menyerahkan order untuk diproduksi"),
            Step("produksi", "aplikasi", "Memperbarui status sedang diproduksi"),
            Step("aplikasi", "pesanan", "Mencatat progres produksi"),
            Step("produksi", "aplikasi", "Menandai pesanan selesai"),
            Step("aplikasi", "customer", "Memberi notifikasi pesanan siap"),
            Step("office", "aplikasi", "Memilih ambil di tempat atau dikirim"),
            Step("aplikasi", "kurir", "Membuat data pengiriman bila perlu"),
            Step("kurir", "customer", "Mengirim pesanan ke alamat customer"),
            Step("aplikasi", "pesanan", "Menutup pesanan setelah diterima"),
        ],
        notes=[("office", 6, "Pelunasan wajib sebelum pesanan diserahkan kepada customer.")],
    ),
]


# ---- Layout constants ----
PAGE_PAD_X = 60
PAGE_PAD_TOP = 70
TITLE_H = 35
HEADER_TOP = 90              # top of participant headers
HEADER_H_BOX = 50            # box participant
HEADER_H_ACTOR = 90          # actor figure
HEADER_BOTTOM_PAD = 40       # space between header and first step row
ROW_H = 70                   # vertical distance between message rows
NOTE_ROW_H = 80              # extra height contributed by an inline note
LIFELINE_BOTTOM_PAD = 100
PARTICIPANT_W = 160
ACTOR_W = 70
COL_GAP = 60                 # gap between adjacent columns
ACTIVATION_W = 14
MESSAGE_LABEL_OFFSET = 4

# ---- Style strings ----
STYLE = {
    "actor": "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontSize=12;fontStyle=1;",
    "participant": "rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#444444;fontSize=12;fontStyle=1;",
    "boundary": "rounded=0;whiteSpace=wrap;html=1;fillColor=#e8f1ff;strokeColor=#3366cc;fontSize=12;fontStyle=1;",
    "control": "rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#b58b00;fontSize=12;fontStyle=1;",
    "entity": "rounded=0;whiteSpace=wrap;html=1;fillColor=#e6f4ea;strokeColor=#2f8c4d;fontSize=12;fontStyle=1;",
    "lifeline": "endArrow=none;html=1;rounded=0;dashed=1;dashPattern=6 4;strokeColor=#888888;",
    "activation": "rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;",
    "message": "endArrow=block;endFill=1;html=1;rounded=0;edgeStyle=none;strokeColor=#222222;fontSize=11;",
    "self_message": "endArrow=block;endFill=1;html=1;rounded=1;edgeStyle=orthogonalEdgeStyle;strokeColor=#222222;fontSize=11;",
    "return": "endArrow=open;endFill=0;html=1;rounded=0;edgeStyle=none;dashed=1;strokeColor=#666666;fontSize=10;",
    "note": "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#fff8c4;strokeColor=#b58b00;fontSize=10;align=left;spacing=8;",
    "title": "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=20;fontStyle=1;",
    "subtitle": "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=11;fontStyle=2;fontColor=#555555;",
}


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def vertex(cid: str, value: str, style: str, x: float, y: float, w: float, h: float) -> str:
    return (
        f'<mxCell id="{esc(cid)}" value="{esc(value)}" style="{esc(style)}" vertex="1" parent="1">'
        f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/>'
        f'</mxCell>'
    )


def edge(cid: str, value: str, style: str, source: str, target: str) -> str:
    return (
        f'<mxCell id="{esc(cid)}" value="{esc(value)}" style="{esc(style)}" edge="1" parent="1" '
        f'source="{esc(source)}" target="{esc(target)}">'
        '<mxGeometry relative="1" as="geometry"/>'
        '</mxCell>'
    )


def render(diagram: SequenceDiagram, page_index: int) -> str:
    n = len(diagram.participants)

    # Compute row positions. Each step occupies one row. A note-on-step adds extra row height.
    note_steps = {idx for (_, idx, _) in diagram.notes if isinstance(idx, int) and 0 <= idx < len(diagram.steps)}

    row_y: list[int] = []
    cur_y = HEADER_TOP + max(HEADER_H_BOX, HEADER_H_ACTOR) + HEADER_BOTTOM_PAD
    for i, _ in enumerate(diagram.steps):
        row_y.append(cur_y)
        extra = ROW_H + (NOTE_ROW_H if i in note_steps else 0)
        cur_y += extra

    last_row = row_y[-1] if row_y else (HEADER_TOP + 200)
    page_h = last_row + LIFELINE_BOTTOM_PAD + 60

    # X positions
    centers: dict[str, float] = {}
    for i, p in enumerate(diagram.participants):
        cx = PAGE_PAD_X + PARTICIPANT_W / 2 + i * (PARTICIPANT_W + COL_GAP)
        centers[p.uid] = cx
    page_w = PAGE_PAD_X + n * PARTICIPANT_W + (n - 1) * COL_GAP + PAGE_PAD_X

    cells: list[str] = [
        vertex(f"p{page_index}_title", diagram.name, STYLE["title"], PAGE_PAD_X, 20, page_w - 2 * PAGE_PAD_X, TITLE_H),
        vertex(f"p{page_index}_subtitle", "Pesan = panah penuh, balasan = panah putus, kotak biru = bar aktivasi", STYLE["subtitle"], PAGE_PAD_X, 20 + TITLE_H + 2, page_w - 2 * PAGE_PAD_X, 18),
    ]

    # Participants (head + lifeline)
    head_ids: dict[str, str] = {}
    lifeline_top = HEADER_TOP + max(HEADER_H_BOX, HEADER_H_ACTOR) + 6
    lifeline_h = page_h - lifeline_top - 30

    for p in diagram.participants:
        cx = centers[p.uid]
        if p.kind == "actor":
            x = cx - ACTOR_W / 2
            y = HEADER_TOP
            w = ACTOR_W
            h = HEADER_H_ACTOR
            style = STYLE["actor"]
        else:
            x = cx - PARTICIPANT_W / 2
            y = HEADER_TOP + (HEADER_H_ACTOR - HEADER_H_BOX)
            w = PARTICIPANT_W
            h = HEADER_H_BOX
            style = STYLE.get(p.kind, STYLE["participant"])
        head_id = f"p{page_index}_{p.uid}_head"
        line_id = f"p{page_index}_{p.uid}_line"
        head_ids[p.uid] = head_id
        cells.append(vertex(head_id, p.label, style, x, y, w, h))
        cells.append(vertex(line_id, "", STYLE["lifeline"], cx, lifeline_top, 1, lifeline_h))

    # Activation bars and messages
    for i, step in enumerate(diagram.steps):
        y_msg = row_y[i]
        # Activation bars on source and target
        src_act = f"p{page_index}_act_src_{i}"
        tgt_act = f"p{page_index}_act_tgt_{i}"
        cells.append(vertex(src_act, "", STYLE["activation"], centers[step.source] - ACTIVATION_W / 2, y_msg - 14, ACTIVATION_W, 28))
        cells.append(vertex(tgt_act, "", STYLE["activation"], centers[step.target] - ACTIVATION_W / 2, y_msg - 14, ACTIVATION_W, 28))

        # Message edge
        msg_style = STYLE["self_message"] if step.source == step.target else STYLE["message"]
        cells.append(edge(f"p{page_index}_msg_{i}", f"{i + 1}. {step.label}", msg_style, src_act, tgt_act))

        # Return edge directly under the message
        if step.return_label:
            cells.append(edge(f"p{page_index}_ret_{i}", step.return_label, STYLE["return"], tgt_act, src_act))

    # Standalone notes (anchored to a step row)
    for j, (uid, step_idx, text) in enumerate(diagram.notes):
        if not isinstance(step_idx, int) or step_idx < 0 or step_idx >= len(row_y):
            anchor_y = HEADER_TOP + 60
        else:
            anchor_y = row_y[step_idx] + 30
        # Place note to the right of the participant column
        anchor_x = max(PAGE_PAD_X, min(centers.get(uid, PAGE_PAD_X) + 30, page_w - 260))
        cells.append(vertex(f"p{page_index}_note_{j}", text, STYLE["note"], anchor_x, anchor_y, 230, 60))

    return (
        f'<diagram id="seq{page_index}" name="{esc(diagram.name)}">'
        f'<mxGraphModel dx="{int(page_w)}" dy="{int(page_h)}" grid="1" gridSize="10" guides="1" '
        f'tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" '
        f'pageWidth="{int(page_w)}" pageHeight="{int(page_h)}" math="0" shadow="0">'
        '<root><mxCell id="0"/><mxCell id="1" parent="0"/>'
        + "".join(cells)
        + '</root></mxGraphModel></diagram>'
    )


def main() -> None:
    out = Path(__file__).resolve().parents[1] / "sequence-diagrams.drawio"
    xml = '<mxfile host="app.diagrams.net" agent="djaitin-sequence-generator" version="24.0.0">' + "".join(
        render(d, i + 1) for i, d in enumerate(DIAGRAMS)
    ) + '</mxfile>\n'
    out.write_text(xml, encoding="utf-8")
    print(f"Wrote {out}")
    print(f"Pages: {len(DIAGRAMS)}")


if __name__ == "__main__":
    main()
