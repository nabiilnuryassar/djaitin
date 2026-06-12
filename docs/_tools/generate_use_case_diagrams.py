"""Generate native draw.io use case diagrams (.drawio XML) for Djaitin.

Layout strategy:
- Actors on left and right of system boundary
- Use cases laid out in 3 columns inside boundary based on actor affinity:
  * left column: UCs touched by left actors only
  * middle column: UCs shared between sides or only by 'system'
  * right column: UCs touched by right actors only
- Within each column, use cases related by include/extend are clustered together
- Actor associations use fixed entry/exit on the actor side; UC side is auto
- Include/extend use orthogonal routing (auto entry/exit) so they take the
  shortest readable path

Output: ../use-case-diagrams.drawio (multi-page)
"""

from __future__ import annotations

import html
from collections import defaultdict, deque
from dataclasses import dataclass, field
from pathlib import Path


# ---------- data model ----------

@dataclass
class UseCase:
    uid: str
    name: str


@dataclass
class Diagram:
    name: str
    actors_left: list[str] = field(default_factory=list)
    actors_right: list[str] = field(default_factory=list)
    use_cases: list[UseCase] = field(default_factory=list)
    associations: list[tuple[str, str]] = field(default_factory=list)
    includes: list[tuple[str, str]] = field(default_factory=list)
    extends: list[tuple[str, str]] = field(default_factory=list)


# ---------- diagrams (same content as before) ----------

DIAGRAMS: list[Diagram] = [
    Diagram(
        name="UCD-1 Autentikasi & Akun",
        actors_left=["Guest", "Customer"],
        actors_right=["Office Staff"],
        use_cases=[
            UseCase("uc1", "Register Customer"),
            UseCase("uc2", "Login"),
            UseCase("uc3", "Logout"),
            UseCase("uc4", "Reset Password"),
        ],
        associations=[
            ("Guest", "uc1"), ("Guest", "uc2"), ("Guest", "uc4"),
            ("Customer", "uc2"), ("Customer", "uc3"),
            ("Office Staff", "uc2"), ("Office Staff", "uc3"),
        ],
    ),
    Diagram(
        name="UCD-2 Profil & Data Customer",
        actors_left=["Customer"],
        actors_right=["Staff/Kasir"],
        use_cases=[
            UseCase("uc1", "Update Profil"),
            UseCase("uc2", "Update Password"),
            UseCase("uc3", "Tambah Alamat"),
            UseCase("uc4", "Edit Alamat"),
            UseCase("uc5", "Hapus Alamat"),
            UseCase("uc6", "Set Alamat Default"),
            UseCase("uc7", "Tambah Data Ukuran"),
            UseCase("uc8", "Edit Data Ukuran"),
            UseCase("uc9", "Lihat Riwayat Ukuran"),
            UseCase("uc10", "Tambah Data Pelanggan"),
        ],
        associations=[
            ("Customer", "uc1"), ("Customer", "uc2"),
            ("Customer", "uc3"), ("Customer", "uc4"), ("Customer", "uc5"), ("Customer", "uc6"),
            ("Customer", "uc7"), ("Customer", "uc8"), ("Customer", "uc9"),
            ("Staff/Kasir", "uc7"), ("Staff/Kasir", "uc8"), ("Staff/Kasir", "uc10"),
        ],
    ),
    Diagram(
        name="UCD-3 Layanan Tailor",
        actors_left=["Customer"],
        actors_right=["Staff/Kasir"],
        use_cases=[
            UseCase("uc1", "Buka Tailor Configurator"),
            UseCase("uc2", "Pilih Garment Model"),
            UseCase("uc3", "Pilih Bahan / Fabric"),
            UseCase("uc4", "Pilih atau Input Ukuran"),
            UseCase("uc5", "Hitung Harga Tailor"),
            UseCase("uc6", "Submit Order Tailor"),
            UseCase("uc7", "Buat Order Tailor via Wizard"),
            UseCase("uc8", "Validasi DP Minimal 50%"),
        ],
        associations=[
            ("Customer", "uc1"), ("Customer", "uc6"),
            ("Staff/Kasir", "uc7"),
        ],
        includes=[
            ("uc1", "uc2"), ("uc1", "uc3"), ("uc1", "uc4"),
            ("uc6", "uc5"), ("uc6", "uc8"),
            ("uc7", "uc4"), ("uc7", "uc5"), ("uc7", "uc8"),
        ],
    ),
    Diagram(
        name="UCD-4 Layanan Ready-to-Wear",
        actors_left=["Guest", "Customer"],
        actors_right=[],
        use_cases=[
            UseCase("uc1", "Lihat Katalog Produk"),
            UseCase("uc2", "Lihat Detail Produk"),
            UseCase("uc3", "Tambah ke Keranjang"),
            UseCase("uc4", "Lihat Keranjang"),
            UseCase("uc5", "Update Qty di Keranjang"),
            UseCase("uc6", "Hapus Item dari Keranjang"),
            UseCase("uc7", "Checkout"),
            UseCase("uc8", "Pilih Alamat Pengiriman"),
            UseCase("uc9", "Pilih Metode Pembayaran"),
            UseCase("uc10", "Reservasi Stok"),
            UseCase("uc11", "Buat Order RTW"),
        ],
        associations=[
            ("Guest", "uc1"), ("Guest", "uc2"),
            ("Customer", "uc1"), ("Customer", "uc2"),
            ("Customer", "uc3"), ("Customer", "uc4"), ("Customer", "uc5"), ("Customer", "uc6"),
            ("Customer", "uc7"), ("Customer", "uc8"), ("Customer", "uc9"),
        ],
        includes=[
            ("uc7", "uc8"), ("uc7", "uc9"), ("uc7", "uc10"), ("uc7", "uc11"),
        ],
    ),
    Diagram(
        name="UCD-5 Layanan Konveksi",
        actors_left=["Customer"],
        actors_right=["Staff/Kasir"],
        use_cases=[
            UseCase("uc1", "Isi Form Pengajuan Konveksi"),
            UseCase("uc2", "Upload File Referensi"),
            UseCase("uc3", "Submit Pengajuan"),
            UseCase("uc4", "Review Pengajuan Konveksi"),
            UseCase("uc5", "Terbitkan Quotation"),
            UseCase("uc6", "Setujui Quotation"),
            UseCase("uc7", "Validasi Full Payment Sebelum Produksi"),
        ],
        associations=[
            ("Customer", "uc1"), ("Customer", "uc2"), ("Customer", "uc3"), ("Customer", "uc6"),
            ("Staff/Kasir", "uc4"), ("Staff/Kasir", "uc5"),
        ],
        includes=[
            ("uc3", "uc1"), ("uc3", "uc2"),
            ("uc4", "uc5"),
            ("uc6", "uc7"),
        ],
    ),
    Diagram(
        name="UCD-6 Pembayaran & Verifikasi",
        actors_left=["Customer"],
        actors_right=["Staff/Kasir"],
        use_cases=[
            UseCase("uc1", "Bayar Tunai di Toko"),
            UseCase("uc2", "Upload Bukti Transfer"),
            UseCase("uc3", "Lihat Antrian Payment Pending"),
            UseCase("uc4", "Verifikasi Pembayaran"),
            UseCase("uc5", "Tolak Pembayaran"),
            UseCase("uc6", "Refund Pembayaran"),
            UseCase("uc7", "Generate Nota"),
            UseCase("uc8", "Generate Kwitansi"),
            UseCase("uc9", "Kirim Notifikasi Status Pembayaran"),
        ],
        associations=[
            ("Customer", "uc2"),
            ("Staff/Kasir", "uc1"), ("Staff/Kasir", "uc3"), ("Staff/Kasir", "uc4"), ("Staff/Kasir", "uc5"), ("Staff/Kasir", "uc6"),
        ],
        includes=[
            ("uc1", "uc7"), ("uc1", "uc8"),
            ("uc4", "uc8"), ("uc4", "uc9"),
            ("uc5", "uc9"),
        ],
    ),
    Diagram(
        name="UCD-7 Produksi & Pengiriman",
        actors_left=["Produksi"],
        actors_right=["Staff/Kasir"],
        use_cases=[
            UseCase("uc1", "Lihat Antrian Produksi"),
            UseCase("uc2", "Update Tahap Produksi"),
            UseCase("uc3", "Tandai Pesanan Selesai Produksi"),
            UseCase("uc4", "Buat Data Pengiriman"),
            UseCase("uc5", "Pilih Kurir & Hitung Ongkir"),
            UseCase("uc6", "Update Status Pengiriman"),
            UseCase("uc7", "Input Tracking Number"),
            UseCase("uc8", "Validasi Pelunasan Sebelum Diserahkan"),
            UseCase("uc9", "Kirim Notifikasi Status Order"),
        ],
        associations=[
            ("Produksi", "uc1"), ("Produksi", "uc2"), ("Produksi", "uc3"),
            ("Staff/Kasir", "uc4"), ("Staff/Kasir", "uc5"), ("Staff/Kasir", "uc6"), ("Staff/Kasir", "uc7"),
        ],
        includes=[
            ("uc3", "uc9"),
            ("uc4", "uc5"),
            ("uc6", "uc9"),
        ],
        extends=[
            ("uc8", "uc6"),
        ],
    ),
    Diagram(
        name="UCD-8 Master Data & Admin",
        actors_left=["Admin"],
        actors_right=[],
        use_cases=[
            UseCase("uc1", "Kelola User & Role"),
            UseCase("uc2", "Kelola Produk RTW"),
            UseCase("uc3", "Atur Stok Produk"),
            UseCase("uc4", "Set Produk Clearance / Diskon"),
            UseCase("uc5", "Kelola Bahan / Fabric"),
            UseCase("uc6", "Kelola Garment Model"),
            UseCase("uc7", "Kelola Kurir"),
            UseCase("uc8", "Kelola Discount Policy"),
            UseCase("uc9", "Kelola Customer"),
        ],
        associations=[
            ("Admin", "uc1"), ("Admin", "uc2"), ("Admin", "uc3"), ("Admin", "uc4"),
            ("Admin", "uc5"), ("Admin", "uc6"), ("Admin", "uc7"), ("Admin", "uc8"), ("Admin", "uc9"),
        ],
    ),
    Diagram(
        name="UCD-9 Laporan & Audit",
        actors_left=["Owner"],
        actors_right=["Admin"],
        use_cases=[
            UseCase("uc1", "Lihat Dashboard Operasional"),
            UseCase("uc2", "Lihat Laporan Penjualan"),
            UseCase("uc3", "Lihat Laporan Pembayaran"),
            UseCase("uc4", "Lihat Laporan Produksi"),
            UseCase("uc5", "Lihat Laporan Pengiriman"),
            UseCase("uc6", "Export Laporan"),
            UseCase("uc7", "Lihat Audit Log"),
            UseCase("uc8", "Override Loyalty Customer"),
        ],
        associations=[
            ("Owner", "uc1"), ("Owner", "uc2"), ("Owner", "uc3"), ("Owner", "uc4"),
            ("Owner", "uc5"), ("Owner", "uc6"), ("Owner", "uc7"), ("Owner", "uc8"),
            ("Admin", "uc1"), ("Admin", "uc7"),
        ],
    ),
]


# ---------- layout constants ----------

ACTOR_W, ACTOR_H = 50, 90
UC_W, UC_H = 180, 60
UC_GAP_Y = 35
UC_GAP_X = 60
ACTOR_GAP_Y = 60
COL_LEFT_PAD = 50
PAGE_PAD = 80
TITLE_H = 40
ACTOR_X_MARGIN = 60   # gap between actor and boundary edge


# ---------- styles ----------

ACTOR_STYLE = (
    "shape=umlActor;verticalLabelPosition=bottom;labelBackgroundColor=none;"
    "verticalAlign=top;html=1;outlineConnect=0;fontSize=14;fontStyle=1"
)
USECASE_STYLE = (
    "ellipse;whiteSpace=wrap;html=1;fontSize=12;fillColor=#dae8fc;strokeColor=#6c8ebf"
)
BOUNDARY_STYLE = (
    "rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#444444;"
    "verticalAlign=top;fontSize=14;fontStyle=1;align=center;arcSize=4"
)
TITLE_STYLE = (
    "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;"
    "whiteSpace=wrap;rounded=0;fontSize=20;fontStyle=1"
)
# Actor associations are explicit:
# - left actor exits right, enters left side of use case
# - right actor exits left, enters right side of use case
# - edgeStyle=none → straight diagonal line, no bends
ASSOC_STYLE_LEFT = (
    "endArrow=none;html=1;rounded=0;edgeStyle=none;strokeColor=#333333;"
    "exitX=1;exitY=0.5;exitDx=0;exitDy=0;"
    "entryX=0;entryY=0.5;entryDx=0;entryDy=0"
)
ASSOC_STYLE_RIGHT = (
    "endArrow=none;html=1;rounded=0;edgeStyle=none;strokeColor=#333333;"
    "exitX=0;exitY=0.5;exitDx=0;exitDy=0;"
    "entryX=1;entryY=0.5;entryDx=0;entryDy=0"
)

INCLUDE_BASE_STYLE = (
    "endArrow=open;html=1;rounded=0;dashed=1;endFill=0;endSize=8;"
    "strokeColor=#0066cc;fontSize=11;fontStyle=2;"
    "edgeStyle=none;"
)
EXTEND_BASE_STYLE = (
    "endArrow=open;html=1;rounded=0;dashed=1;endFill=0;endSize=8;"
    "strokeColor=#cc6600;fontSize=11;fontStyle=2;"
    "edgeStyle=none;"
)


# ---------- XML helpers ----------

def esc(s: str) -> str:
    return html.escape(s, quote=True)


def cell_vertex(cid: str, value: str, style: str, x: float, y: float, w: float, h: float) -> str:
    return (
        f'<mxCell id="{esc(cid)}" value="{esc(value)}" style="{esc(style)}" '
        f'vertex="1" parent="1">'
        f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/>'
        f'</mxCell>'
    )


def cell_edge(cid: str, value: str, style: str, source: str, target: str) -> str:
    val_attr = f' value="{esc(value)}"' if value else ' value=""'
    return (
        f'<mxCell id="{esc(cid)}"{val_attr} style="{esc(style)}" '
        f'edge="1" parent="1" source="{esc(source)}" target="{esc(target)}">'
        f'<mxGeometry relative="1" as="geometry"/>'
        f'</mxCell>'
    )


# ---------- column assignment + ordering ----------

COL_RANK = {"left": 0, "middle": 1, "right": 2}


def _stereotype_ports(src_col: str, dst_col: str) -> str:
    """Return mxGraph port constraints for include/extend edges.

    Goal: keep stereotype arrows readable.
    - Cross-column left->right: source right side -> target left side
    - Cross-column right->left: source left side -> target right side
    - Same-column: route on the outer side of that column so the line does not
      cut through the middle of the use case stack.
    """
    src_rank = COL_RANK[src_col]
    dst_rank = COL_RANK[dst_col]

    if src_rank < dst_rank:
        return "exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;"
    if src_rank > dst_rank:
        return "exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;"

    # Same column: use outside edge. Left/middle column route on right side;
    # right column route on left side to avoid the right actors.
    if src_col == "right":
        return "exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;"
    return "exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;"


def assign_columns(d: Diagram) -> dict[str, str]:
    """Return uc_id -> 'left' | 'middle' | 'right'."""
    left_actors = set(d.actors_left)
    right_actors = set(d.actors_right)
    uc_left = defaultdict(int)
    uc_right = defaultdict(int)
    for actor, uc_id in d.associations:
        if actor in left_actors:
            uc_left[uc_id] += 1
        if actor in right_actors:
            uc_right[uc_id] += 1

    cols: dict[str, str] = {}
    for uc in d.use_cases:
        l = uc_left.get(uc.uid, 0)
        r = uc_right.get(uc.uid, 0)
        if l > 0 and r == 0:
            cols[uc.uid] = "left"
        elif r > 0 and l == 0:
            cols[uc.uid] = "right"
        elif l > 0 and r > 0:
            cols[uc.uid] = "middle"
        else:
            cols[uc.uid] = "middle"  # not associated to any actor — put in middle
    return cols


def order_within_columns(d: Diagram, cols: dict[str, str]) -> dict[str, list[str]]:
    """Within each column, order use cases so that include/extend
    related ones are adjacent. Use BFS over the include+extend graph,
    starting from highest-degree node."""
    rel_edges = list(d.includes) + list(d.extends)
    neighbors: dict[str, set[str]] = defaultdict(set)
    for a, b in rel_edges:
        neighbors[a].add(b)
        neighbors[b].add(a)

    by_col: dict[str, list[str]] = {"left": [], "middle": [], "right": []}
    declared_order = [uc.uid for uc in d.use_cases]
    declared_index = {uid: i for i, uid in enumerate(declared_order)}

    for col_name in ("left", "middle", "right"):
        members = [uid for uid in declared_order if cols[uid] == col_name]
        if not members:
            continue
        member_set = set(members)
        visited: set[str] = set()
        ordered: list[str] = []

        # Iterate roots by descending degree (within column), then declared order
        def degree_in_col(uid: str) -> int:
            return sum(1 for n in neighbors[uid] if n in member_set)

        roots = sorted(members, key=lambda u: (-degree_in_col(u), declared_index[u]))
        for root in roots:
            if root in visited:
                continue
            queue = deque([root])
            while queue:
                cur = queue.popleft()
                if cur in visited:
                    continue
                visited.add(cur)
                ordered.append(cur)
                related = sorted(
                    (n for n in neighbors[cur] if n in member_set and n not in visited),
                    key=lambda u: declared_index[u],
                )
                queue.extend(related)
        by_col[col_name] = ordered
    return by_col


# ---------- per-diagram rendering ----------

def render_diagram(d: Diagram, page_index: int) -> str:
    cols_map = assign_columns(d)
    column_order = order_within_columns(d, cols_map)

    n_left_col = len(column_order["left"])
    n_mid_col = len(column_order["middle"])
    n_right_col = len(column_order["right"])

    # Determine which columns exist
    active_cols = []
    if n_left_col:
        active_cols.append("left")
    if n_mid_col:
        active_cols.append("middle")
    if n_right_col:
        active_cols.append("right")

    n_cols_in_boundary = max(1, len(active_cols))

    # Boundary size
    inner_w = n_cols_in_boundary * UC_W + (n_cols_in_boundary + 1) * UC_GAP_X
    max_col_count = max(n_left_col, n_mid_col, n_right_col, 1)
    inner_h = max_col_count * UC_H + (max_col_count + 1) * UC_GAP_Y

    boundary_w = inner_w
    boundary_h = inner_h + 30  # extra top space for boundary label

    # Page layout
    boundary_x = PAGE_PAD + ACTOR_W + ACTOR_X_MARGIN
    boundary_y = PAGE_PAD + TITLE_H + 30

    cells: list[str] = []

    # Title
    cells.append(cell_vertex(
        f"p{page_index}_title", d.name, TITLE_STYLE,
        x=PAGE_PAD, y=PAGE_PAD,
        w=boundary_w + ACTOR_W * 2 + ACTOR_X_MARGIN * 2 + 100, h=TITLE_H,
    ))

    # Boundary
    boundary_id = f"p{page_index}_boundary"
    cells.append(cell_vertex(
        boundary_id, "Sistem Djaitin", BOUNDARY_STYLE,
        x=boundary_x, y=boundary_y, w=boundary_w, h=boundary_h,
    ))

    # Use case positions
    uc_id_map: dict[str, str] = {}
    uc_pos: dict[str, tuple[float, float]] = {}
    col_x_map: dict[str, float] = {}

    inner_top = boundary_y + 30  # leave space for boundary label

    # Compute column x positions: distribute active columns evenly
    if active_cols:
        col_slot_w = boundary_w / len(active_cols)
        for idx, col_name in enumerate(active_cols):
            col_center = boundary_x + col_slot_w * (idx + 0.5)
            col_x_map[col_name] = col_center - UC_W / 2

    # Place use cases per column (vertically centered within column)
    for col_name in ("left", "middle", "right"):
        if col_name not in col_x_map:
            continue
        ucs_in_col = column_order[col_name]
        if not ucs_in_col:
            continue
        col_height = len(ucs_in_col) * UC_H + (len(ucs_in_col) - 1) * UC_GAP_Y
        col_top = inner_top + max(0, (inner_h - col_height) / 2)
        for i, uid in enumerate(ucs_in_col):
            uc = next(u for u in d.use_cases if u.uid == uid)
            full_id = f"p{page_index}_{uid}"
            uc_id_map[uid] = full_id
            ux = col_x_map[col_name]
            uy = col_top + i * (UC_H + UC_GAP_Y)
            uc_pos[uid] = (ux, uy)
            cells.append(cell_vertex(
                full_id, uc.name, USECASE_STYLE,
                x=ux, y=uy, w=UC_W, h=UC_H,
            ))

    # Actors — placed left and right, vertically centered alongside boundary
    actor_id_map: dict[str, str] = {}

    def _layout_actors(names: list[str], x_pos: float, side: str) -> None:
        if not names:
            return
        total_h = len(names) * ACTOR_H + (len(names) - 1) * ACTOR_GAP_Y
        start_y = boundary_y + max(0, (boundary_h - total_h) / 2)
        for i, name in enumerate(names):
            aid = f"p{page_index}_actor_{side}_{i}"
            actor_id_map[name] = aid
            ay = start_y + i * (ACTOR_H + ACTOR_GAP_Y)
            cells.append(cell_vertex(
                aid, name, ACTOR_STYLE,
                x=x_pos, y=ay, w=ACTOR_W, h=ACTOR_H,
            ))

    left_actor_x = boundary_x - ACTOR_X_MARGIN - ACTOR_W
    right_actor_x = boundary_x + boundary_w + ACTOR_X_MARGIN
    _layout_actors(d.actors_left, left_actor_x, "left")
    _layout_actors(d.actors_right, right_actor_x, "right")

    # Edges: associations
    edge_counter = 0
    for actor_name, uc_id in d.associations:
        if actor_name not in actor_id_map or uc_id not in uc_id_map:
            continue
        eid = f"p{page_index}_e{edge_counter}"
        edge_counter += 1
        source_id = actor_id_map[actor_name]
        is_left_actor = "actor_left" in source_id
        assoc_style = ASSOC_STYLE_LEFT if is_left_actor else ASSOC_STYLE_RIGHT
        cells.append(cell_edge(
            eid, "", assoc_style,
            source=source_id,
            target=uc_id_map[uc_id],
        ))

    # Edges: includes — exit/entry side based on column relationship
    for src, dst in d.includes:
        if src not in uc_id_map or dst not in uc_id_map:
            continue
        eid = f"p{page_index}_inc{edge_counter}"
        edge_counter += 1
        style = INCLUDE_BASE_STYLE + _stereotype_ports(cols_map[src], cols_map[dst])
        cells.append(cell_edge(
            eid, "«include»", style,
            source=uc_id_map[src],
            target=uc_id_map[dst],
        ))

    # Edges: extends — exit/entry side based on column relationship
    for src, dst in d.extends:
        if src not in uc_id_map or dst not in uc_id_map:
            continue
        eid = f"p{page_index}_ext{edge_counter}"
        edge_counter += 1
        style = EXTEND_BASE_STYLE + _stereotype_ports(cols_map[src], cols_map[dst])
        cells.append(cell_edge(
            eid, "«extend»", style,
            source=uc_id_map[src],
            target=uc_id_map[dst],
        ))

    page_w = max(right_actor_x + ACTOR_W + PAGE_PAD, boundary_x + boundary_w + ACTOR_W + ACTOR_X_MARGIN + PAGE_PAD)
    page_h = boundary_y + boundary_h + PAGE_PAD

    diagram_xml = (
        f'<diagram id="page{page_index}" name="{esc(d.name)}">'
        f'<mxGraphModel dx="{int(page_w)}" dy="{int(page_h)}" grid="1" gridSize="10" guides="1" '
        f'tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" '
        f'pageWidth="{int(page_w)}" pageHeight="{int(page_h)}" math="0" shadow="0">'
        f'<root>'
        f'<mxCell id="0"/>'
        f'<mxCell id="1" parent="0"/>'
        + "".join(cells)
        + '</root></mxGraphModel></diagram>'
    )
    return diagram_xml


def render_file(diagrams: list[Diagram]) -> str:
    pages = "".join(render_diagram(d, i + 1) for i, d in enumerate(diagrams))
    return f'<mxfile host="app.diagrams.net" agent="djaitin-ucd-generator" version="24.0.0">{pages}</mxfile>'


def main() -> None:
    out_path = Path(__file__).resolve().parent.parent / "use-case-diagrams.drawio"
    out_path.write_text(render_file(DIAGRAMS), encoding="utf-8")
    print(f"Wrote {out_path}")
    print(f"Pages: {len(DIAGRAMS)}")


if __name__ == "__main__":
    main()
