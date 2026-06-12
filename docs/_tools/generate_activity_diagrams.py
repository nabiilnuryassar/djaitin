"""Generate native draw.io activity diagrams (.drawio XML) for Djaitin.

The diagrams are derived from docs/elisitasi-mdi-toe-hml-djaitin.md and
confirmed against the Laravel routes/services for customer and office flows.
Each page uses actor/role containers (swimlane-like partitions), a start node,
activity/action nodes, decision/merge nodes, and an end node.

Output: ../activity-diagrams.drawio (multi-page)
"""

from __future__ import annotations

import html
from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class Lane:
    uid: str
    title: str
    x: int
    w: int


@dataclass(frozen=True)
class Node:
    uid: str
    lane: str
    label: str
    kind: str = "action"  # start | end | action | decision | note
    y: int = 0


@dataclass(frozen=True)
class Edge:
    src: str
    dst: str
    label: str = ""


@dataclass(frozen=True)
class Diagram:
    name: str
    subtitle: str
    lanes: list[Lane]
    nodes: list[Node]
    edges: list[Edge] = field(default_factory=list)


LANE_Y = 95
LANE_H = 760
LANE_HEADER_H = 40
NODE_W = 185
NODE_H = 54
DECISION_W = 130
DECISION_H = 80
START_END = 34
PAGE_PAD = 50

TITLE_STYLE = "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;fontSize=20;fontStyle=1"
SUBTITLE_STYLE = "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;whiteSpace=wrap;fontSize=11;fontColor=#555555"
LANE_STYLE = "swimlane;html=1;startSize=40;horizontal=1;rounded=1;arcSize=4;whiteSpace=wrap;fillColor=#f8f9fa;strokeColor=#666666;fontSize=14;fontStyle=1;align=center;verticalAlign=middle"
ACTION_STYLE = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11"
SYSTEM_ACTION_STYLE = "rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11"
DECISION_STYLE = "rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=10"
START_STYLE = "ellipse;html=1;shape=startState;fillColor=#000000;strokeColor=#000000"
END_STYLE = "ellipse;html=1;shape=endState;fillColor=#ffffff;strokeColor=#000000"
EDGE_STYLE = "endArrow=block;html=1;rounded=0;orthogonalLoop=1;jettySize=auto;edgeStyle=orthogonalEdgeStyle;strokeColor=#333333;fontSize=10"
NOTE_STYLE = "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=10"


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def vertex(cid: str, value: str, style: str, x: float, y: float, w: float, h: float, parent: str = "1") -> str:
    return (
        f'<mxCell id="{esc(cid)}" value="{esc(value)}" style="{esc(style)}" vertex="1" parent="{esc(parent)}">'
        f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/>'
        f'</mxCell>'
    )


def edge(cid: str, source: str, target: str, label: str = "") -> str:
    return (
        f'<mxCell id="{esc(cid)}" value="{esc(label)}" style="{esc(EDGE_STYLE)}" edge="1" parent="1" '
        f'source="{esc(source)}" target="{esc(target)}"><mxGeometry relative="1" as="geometry"/></mxCell>'
    )


COMMON_LANES = [
    Lane("customer", "Customer", 70, 235),
    Lane("system", "Sistem Djaitin", 325, 235),
    Lane("office", "Staff / Kasir / Admin", 580, 235),
    Lane("production", "Produksi / Pengiriman", 835, 235),
]


DIAGRAMS = [
    Diagram(
        "AD-1 Order Tailor / Custom",
        "Berdasarkan requirement pemesanan tailor, data ukuran, DP minimal 50%, nota, dan status order.",
        COMMON_LANES[:3],
        [
            Node("s", "customer", "", "start", 150),
            Node("a1", "customer", "Buka layanan tailor / configurator", y=210),
            Node("a2", "customer", "Pilih garment model dan bahan", y=285),
            Node("a3", "customer", "Pilih data ukuran tersimpan atau input ukuran baru", y=360),
            Node("a4", "system", "Hitung harga, subtotal, dan diskon loyalty", y=360),
            Node("d1", "system", "DP ≥ 50%?", "decision", 450),
            Node("a5", "customer", "Lengkapi pembayaran awal dan bukti transfer/tunai", y=555),
            Node("a6", "system", "Buat order tailor, item order, payment pending/verified", y=630),
            Node("a7", "office", "Generate nota / kwitansi dan pantau status pembayaran", y=630),
            Node("e", "office", "", "end", 725),
        ],
        [Edge("s", "a1"), Edge("a1", "a2"), Edge("a2", "a3"), Edge("a3", "a4"), Edge("a4", "d1"), Edge("d1", "a5", "Tidak"), Edge("a5", "d1", "Koreksi"), Edge("d1", "a6", "Ya"), Edge("a6", "a7"), Edge("a7", "e")],
    ),
    Diagram(
        "AD-2 Checkout Ready-to-Wear",
        "Berdasarkan katalog, keranjang, checkout, reservasi stok, pembayaran, dan opsi pengiriman/pickup.",
        COMMON_LANES,
        [
            Node("s", "customer", "", "start", 135),
            Node("a1", "customer", "Lihat katalog dan detail produk RTW", y=190),
            Node("a2", "customer", "Tambah/update/hapus item keranjang", y=265),
            Node("d1", "system", "Keranjang valid dan stok tersedia?", "decision", 345),
            Node("a3", "customer", "Pilih pickup atau delivery", y=455),
            Node("a4", "system", "Reservasi stok dan hitung total + diskon + ongkir", y=455),
            Node("a5", "customer", "Pilih metode pembayaran", y=540),
            Node("a6", "system", "Buat order RTW dan shipment bila delivery", y=625),
            Node("a7", "production", "Siapkan pengambilan / proses data pengiriman", y=625),
            Node("e", "production", "", "end", 725),
        ],
        [Edge("s", "a1"), Edge("a1", "a2"), Edge("a2", "d1"), Edge("d1", "a1", "Tidak"), Edge("d1", "a3", "Ya"), Edge("a3", "a4"), Edge("a4", "a5"), Edge("a5", "a6"), Edge("a6", "a7"), Edge("a7", "e")],
    ),
    Diagram(
        "AD-3 Order Konveksi",
        "Berdasarkan pengajuan konveksi, upload referensi, item pesanan, full payment sebelum produksi, dan tahap desain/produksi.",
        COMMON_LANES,
        [
            Node("s", "customer", "", "start", 130),
            Node("a1", "customer", "Isi data perusahaan, spesifikasi, item, qty, harga", y=190),
            Node("a2", "customer", "Upload file referensi konveksi", y=270),
            Node("a3", "system", "Hitung subtotal seluruh item", y=270),
            Node("d1", "system", "Pembayaran = total order?", "decision", 365),
            Node("a4", "customer", "Koreksi nominal / lengkapi bukti bayar", y=470),
            Node("a5", "system", "Buat order konveksi status Pending Payment dan stage Design", y=555),
            Node("a6", "office", "Verifikasi pembayaran transfer atau catat tunai", y=555),
            Node("a7", "production", "Mulai produksi setelah lunas terverifikasi", y=650),
            Node("e", "production", "", "end", 735),
        ],
        [Edge("s", "a1"), Edge("a1", "a2"), Edge("a2", "a3"), Edge("a3", "d1"), Edge("d1", "a4", "Tidak"), Edge("a4", "d1", "Submit ulang"), Edge("d1", "a5", "Ya"), Edge("a5", "a6"), Edge("a6", "a7"), Edge("a7", "e")],
    ),
    Diagram(
        "AD-4 Verifikasi Pembayaran",
        "Berdasarkan upload bukti transfer, antrean payment pending, verifikasi/tolak, update outstanding, stok RTW, kwitansi, dan notifikasi.",
        COMMON_LANES[:3],
        [
            Node("s", "customer", "", "start", 130),
            Node("a1", "customer", "Upload bukti transfer untuk order", y=195),
            Node("a2", "system", "Set payment Pending Verification dan simpan bukti", y=275),
            Node("a3", "office", "Buka antrean pembayaran pending", y=275),
            Node("a4", "office", "Periksa bukti transfer dan nominal", y=355),
            Node("d1", "office", "Pembayaran sah?", "decision", 450),
            Node("a5", "system", "Update payment Verified, paid/outstanding, stok RTW bila perlu", y=555),
            Node("a6", "system", "Update payment Rejected dan alasan penolakan", y=555),
            Node("a7", "system", "Kirim notifikasi dan sediakan kwitansi", y=655),
            Node("e", "customer", "", "end", 735),
        ],
        [Edge("s", "a1"), Edge("a1", "a2"), Edge("a2", "a3"), Edge("a3", "a4"), Edge("a4", "d1"), Edge("d1", "a5", "Ya"), Edge("d1", "a6", "Tidak"), Edge("a5", "a7"), Edge("a6", "a7"), Edge("a7", "e")],
    ),
    Diagram(
        "AD-5 Produksi & Pengiriman / Penyerahan",
        "Berdasarkan status order, production stage, pelunasan sebelum closed, shipment, tracking, dan notifikasi status.",
        COMMON_LANES,
        [
            Node("s", "office", "", "start", 125),
            Node("a1", "office", "Ubah status order menjadi In Progress", y=185),
            Node("d1", "system", "Gate pembayaran terpenuhi?\nTailor DP ≥ 50%; Konveksi lunas", "decision", 275),
            Node("a2", "production", "Kerjakan produksi dan update production stage", y=395),
            Node("a3", "production", "Tandai pesanan siap / selesai produksi", y=485),
            Node("d2", "system", "Masih ada sisa tagihan?", "decision", 575),
            Node("a4", "customer", "Lakukan pelunasan sebelum barang diserahkan", y=675),
            Node("a5", "office", "Update pickup/delivery, kurir, resi, status shipment", y=675),
            Node("a6", "system", "Kirim notifikasi status order/pengiriman", y=735),
            Node("e", "system", "", "end", 810),
        ],
        [Edge("s", "a1"), Edge("a1", "d1"), Edge("d1", "a1", "Tidak"), Edge("d1", "a2", "Ya"), Edge("a2", "a3"), Edge("a3", "d2"), Edge("d2", "a4", "Ya"), Edge("a4", "a5"), Edge("d2", "a5", "Tidak"), Edge("a5", "a6"), Edge("a6", "e")],
    ),
    Diagram(
        "AD-6 Kelola Master Data & Laporan",
        "Berdasarkan kebutuhan administrasi pelanggan, produk, bahan, model, user/role, laporan operasional, export, dan audit log.",
        [Lane("admin", "Admin", 70, 260), Lane("system", "Sistem Djaitin", 350, 260), Lane("owner", "Owner", 630, 260)],
        [
            Node("s", "admin", "", "start", 135),
            Node("a1", "admin", "Login dan buka dashboard office", y=195),
            Node("d1", "admin", "Pilih modul administrasi?", "decision", 290),
            Node("a2", "admin", "Kelola user, produk RTW, bahan, garment model, kurir, diskon", y=405),
            Node("a3", "admin", "Kelola customer dan data ukuran", y=505),
            Node("a4", "system", "Validasi, simpan perubahan, dan catat audit log", y=455),
            Node("a5", "owner", "Buka laporan operasional", y=455),
            Node("a6", "system", "Agregasi laporan penjualan, pembayaran, produksi, pengiriman", y=575),
            Node("a7", "owner", "Review atau export laporan", y=670),
            Node("e", "owner", "", "end", 755),
        ],
        [Edge("s", "a1"), Edge("a1", "d1"), Edge("d1", "a2", "Master data"), Edge("d1", "a3", "Customer"), Edge("a2", "a4"), Edge("a3", "a4"), Edge("d1", "a5", "Laporan"), Edge("a4", "a5"), Edge("a5", "a6"), Edge("a6", "a7"), Edge("a7", "e")],
    ),
]


def node_geometry(diagram: Diagram, node: Node) -> tuple[float, float, float, float]:
    lane = next(l for l in diagram.lanes if l.uid == node.lane)
    if node.kind in {"start", "end"}:
        return lane.x + (lane.w - START_END) / 2, node.y, START_END, START_END
    if node.kind == "decision":
        return lane.x + (lane.w - DECISION_W) / 2, node.y, DECISION_W, DECISION_H
    return lane.x + (lane.w - NODE_W) / 2, node.y, NODE_W, NODE_H


def node_style(node: Node) -> str:
    if node.kind == "start":
        return START_STYLE
    if node.kind == "end":
        return END_STYLE
    if node.kind == "decision":
        return DECISION_STYLE
    if node.kind == "note":
        return NOTE_STYLE
    return SYSTEM_ACTION_STYLE if node.lane == "system" else ACTION_STYLE


def render_diagram(diagram: Diagram, index: int) -> str:
    page_w = max(l.x + l.w for l in diagram.lanes) + PAGE_PAD
    page_h = max(max(n.y for n in diagram.nodes) + 90, LANE_Y + LANE_H + PAGE_PAD)
    cells: list[str] = []
    cells.append(vertex(f"p{index}_title", diagram.name, TITLE_STYLE, PAGE_PAD, 25, page_w - 100, 32))
    cells.append(vertex(f"p{index}_subtitle", diagram.subtitle, SUBTITLE_STYLE, PAGE_PAD, 58, page_w - 100, 35))

    for lane in diagram.lanes:
        cells.append(vertex(f"p{index}_lane_{lane.uid}", lane.title, LANE_STYLE, lane.x, LANE_Y, lane.w, LANE_H))

    node_ids: dict[str, str] = {}
    for node in diagram.nodes:
        cid = f"p{index}_{node.uid}"
        node_ids[node.uid] = cid
        x, y, w, h = node_geometry(diagram, node)
        cells.append(vertex(cid, node.label, node_style(node), x, y, w, h))

    for i, e in enumerate(diagram.edges):
        cells.append(edge(f"p{index}_edge_{i}", node_ids[e.src], node_ids[e.dst], e.label))

    return (
        f'<diagram id="activity{index}" name="{esc(diagram.name)}">'
        f'<mxGraphModel dx="{page_w}" dy="{page_h}" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{page_w}" pageHeight="{page_h}" math="0" shadow="0">'
        '<root><mxCell id="0"/><mxCell id="1" parent="0"/>' + "".join(cells) + '</root></mxGraphModel></diagram>'
    )


def render_file() -> str:
    pages = "".join(render_diagram(d, i + 1) for i, d in enumerate(DIAGRAMS))
    return f'<mxfile host="app.diagrams.net" agent="djaitin-activity-generator" version="24.0.0">{pages}</mxfile>'


def main() -> None:
    out_path = Path(__file__).resolve().parent.parent / "activity-diagrams.drawio"
    out_path.write_text(render_file(), encoding="utf-8")
    print(f"Wrote {out_path}")
    print(f"Pages: {len(DIAGRAMS)}")


if __name__ == "__main__":
    main()
