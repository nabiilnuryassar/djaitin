"""Generate native draw.io UML class diagram for Djaitin.

This version prioritizes academic readability:
- Uses draw.io native UML Class shapes (`shape=umlClass`).
- Uses a package/container layout per domain area.
- Uses clean orthogonal relationships with multiplicity labels.
- Keeps Laravel framework inheritance minimal to avoid spaghetti.

Output: ../class-diagram.drawio
"""

from __future__ import annotations

import html
from dataclasses import dataclass
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring


@dataclass(frozen=True)
class UmlClass:
    name: str
    attributes: list[str]
    operations: list[str]
    x: int
    y: int
    w: int = 230
    h: int = 190
    stereotype: str = ""


@dataclass(frozen=True)
class Relation:
    source: str
    target: str
    label: str = ""
    source_mult: str = ""
    target_mult: str = ""
    kind: str = "association"  # association | aggregation | composition | generalization | dependency


CLASSES: list[UmlClass] = [
    # Top / framework and auth domain
    UmlClass("Authenticatable", ["# password: string", "# remember_token: string"], ["+ authenticate(): bool"], 80, 130, 235, 125, "abstract"),
    UmlClass("User", ["+ name: string", "+ email: string", "- password: string", "+ role: UserRole", "+ is_active: boolean"], ["+ customer(): Customer", "+ cart(): Cart", "+ canAccessOffice(): boolean"], 80, 330, 250, 210),
    UmlClass("Customer", ["+ name: string", "+ phone: string", "+ address: text", "+ is_loyalty_eligible: boolean", "+ loyalty_order_count: integer"], ["+ addresses(): List<Address>", "+ measurements(): List<Measurement>", "+ orders(): List<Order>"], 430, 330, 270, 220),
    UmlClass("Address", ["+ recipient_name: string", "+ phone: string", "+ address_line: text", "+ city: string", "+ province: string", "+ postal_code: string", "+ is_default: boolean"], ["+ customer(): Customer"], 430, 90, 270, 220),
    UmlClass("Measurement", ["+ label: string", "+ chest: decimal", "+ waist: decimal", "+ hips: decimal", "+ shoulder: decimal", "+ sleeve_length: decimal", "+ shirt_length: decimal", "+ inseam: decimal"], ["+ customer(): Customer"], 430, 590, 270, 230),

    # Order domain
    UmlClass("Order", ["+ order_number: string", "+ order_type: string", "+ status: string", "+ production_stage: string", "+ subtotal: decimal", "+ total_amount: decimal", "+ paid_amount: decimal", "+ outstanding_amount: decimal", "+ due_date: date"], ["+ items(): List<OrderItem>", "+ payments(): List<Payment>", "+ shipment(): Shipment", "+ attachments(): List<OrderAttachment>"], 820, 330, 310, 295),
    UmlClass("OrderItem", ["+ item_name: string", "+ description: text", "+ size: string", "+ qty: integer", "+ unit_price: decimal", "+ discount_amount: decimal", "+ subtotal: decimal"], ["+ order(): Order", "+ product(): Product"], 1250, 120, 270, 235),
    UmlClass("Payment", ["+ payment_number: string", "+ method: string", "+ status: string", "+ amount: decimal", "+ reference_number: string", "+ proof_image_path: string", "+ payment_date: datetime", "+ verified_at: datetime"], ["+ order(): Order", "+ markVerified(): void", "+ reject(reason): void"], 1250, 430, 285, 260),
    UmlClass("Shipment", ["+ status: string", "+ recipient_name: string", "+ recipient_address: text", "+ recipient_phone: string", "+ shipping_cost: decimal", "+ tracking_number: string", "+ shipped_at: datetime", "+ delivered_at: datetime"], ["+ order(): Order", "+ courier(): Courier"], 1250, 760, 285, 250),
    UmlClass("OrderAttachment", ["+ file_path: string", "+ file_name: string", "+ file_type: string", "+ uploaded_by: bigint"], ["+ order(): Order", "+ uploadedBy(): User"], 820, 720, 270, 170),

    # Master data and commerce
    UmlClass("Product", ["+ sku: string", "+ name: string", "+ category: string", "+ size: string", "+ selling_price: decimal", "+ stock: integer", "+ reserved_stock: integer", "+ is_active: boolean"], ["+ orderItems(): List<OrderItem>", "+ cartItems(): List<CartItem>", "+ finalPrice(): decimal"], 1680, 120, 285, 250),
    UmlClass("Fabric", ["+ name: string", "+ description: text", "+ is_active: boolean"], ["+ orders(): List<Order>"], 820, 90, 230, 140),
    UmlClass("GarmentModel", ["+ name: string", "+ description: text", "+ image_path: string", "+ is_active: boolean"], ["+ orders(): List<Order>"], 1070, 90, 250, 160),
    UmlClass("Courier", ["+ name: string", "+ base_fee: decimal", "+ is_active: boolean"], ["+ shipments(): List<Shipment>"], 1680, 760, 235, 150),
    UmlClass("DiscountPolicy", ["+ key: string", "+ value: string", "+ description: text"], ["+ updatedBy(): User"], 80, 620, 250, 155),

    # Cart and audit
    UmlClass("Cart", ["+ user_id: bigint"], ["+ user(): User", "+ items(): List<CartItem>", "+ totalAmount(): decimal"], 80, 840, 250, 150),
    UmlClass("CartItem", ["+ cart_id: bigint", "+ product_id: bigint", "+ qty: integer"], ["+ cart(): Cart", "+ product(): Product", "+ subtotalAmount(): decimal"], 430, 900, 270, 150),
    UmlClass("AuditLog", ["+ action: string", "+ auditable_type: string", "+ auditable_id: bigint", "+ old_values: json", "+ new_values: json", "+ ip_address: string", "+ created_at: datetime"], ["+ user(): User", "+ auditable(): object"], 1680, 430, 285, 235),
]

RELATIONS: list[Relation] = [
    Relation("User", "Authenticatable", kind="generalization"),
    Relation("User", "Customer", "akun", "1", "0..1", "composition"),
    Relation("User", "Cart", "keranjang", "1", "0..1", "composition"),
    Relation("Customer", "Address", "alamat", "1", "0..*", "composition"),
    Relation("Customer", "Measurement", "ukuran", "1", "0..*", "composition"),
    Relation("Customer", "Order", "pesanan", "1", "0..*", "association"),
    Relation("Order", "OrderItem", "item", "1", "1..*", "composition"),
    Relation("Order", "Payment", "pembayaran", "1", "0..*", "composition"),
    Relation("Order", "Shipment", "pengiriman", "1", "0..1", "composition"),
    Relation("Order", "OrderAttachment", "lampiran", "1", "0..*", "composition"),
    Relation("Order", "Fabric", "bahan", "0..*", "0..1", "aggregation"),
    Relation("Order", "GarmentModel", "model", "0..*", "0..1", "aggregation"),
    Relation("OrderItem", "Product", "produk", "0..*", "0..1", "association"),
    Relation("Shipment", "Courier", "kurir", "0..*", "0..1", "aggregation"),
    Relation("Cart", "CartItem", "item", "1", "0..*", "composition"),
    Relation("CartItem", "Product", "produk", "0..*", "1", "association"),
    Relation("User", "AuditLog", "aktivitas", "1", "0..*", "association"),
    Relation("Order", "AuditLog", "riwayat perubahan", "1", "0..*", "dependency"),
    Relation("Payment", "AuditLog", "riwayat perubahan", "1", "0..*", "dependency"),
    Relation("User", "DiscountPolicy", "mengubah", "1", "0..*", "association"),
    Relation("User", "OrderAttachment", "mengunggah", "1", "0..*", "association"),
]

PACKAGES = [
    ("Akun & Pelanggan", 40, 70, 700, 780),
    ("Pesanan & Transaksi", 780, 70, 790, 850),
    ("Master Data & Audit", 1640, 70, 370, 850),
    ("Keranjang", 40, 805, 700, 230),
]


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def class_value(c: UmlClass) -> str:
    title = f"<b>{esc(c.name)}</b>"
    if c.stereotype:
        title = f"«{esc(c.stereotype)}»<br>{title}"
    attrs = "<br>".join(esc(a) for a in c.attributes)
    ops = "<br>".join(esc(o) for o in c.operations)
    return f"{title}<hr>{attrs}<hr>{ops}"


def add_cell(root: Element, cid: str, value: str, style: str, vertex: bool = False, edge: bool = False, source: str | None = None, target: str | None = None) -> Element:
    attrs = {"id": cid, "value": value, "style": style, "parent": "1"}
    if vertex:
        attrs["vertex"] = "1"
    if edge:
        attrs["edge"] = "1"
    if source:
        attrs["source"] = source
    if target:
        attrs["target"] = target
    return SubElement(root, "mxCell", attrs)


def add_geometry(cell: Element, x: int | float | None = None, y: int | float | None = None, w: int | None = None, h: int | None = None, relative: bool = False) -> Element:
    attrs = {"as": "geometry"}
    if relative:
        attrs["relative"] = "1"
    if x is not None:
        attrs["x"] = str(x)
    if y is not None:
        attrs["y"] = str(y)
    if w is not None:
        attrs["width"] = str(w)
    if h is not None:
        attrs["height"] = str(h)
    return SubElement(cell, "mxGeometry", attrs)


def relation_style(kind: str) -> str:
    base = "html=1;rounded=1;orthogonalLoop=1;jettySize=auto;edgeStyle=orthogonalEdgeStyle;fontSize=11;"
    if kind == "generalization":
        return base + "endArrow=block;endFill=0;strokeColor=#64748b;"
    if kind == "composition":
        return base + "endArrow=none;startArrow=diamondThin;startFill=1;strokeColor=#111827;"
    if kind == "aggregation":
        return base + "endArrow=none;startArrow=diamondThin;startFill=0;strokeColor=#334155;"
    if kind == "dependency":
        return base + "dashed=1;endArrow=open;endFill=0;strokeColor=#7c3aed;"
    return base + "endArrow=none;strokeColor=#1f2937;"


def build_drawio() -> str:
    mxfile = Element("mxfile", {"host": "app.diagrams.net", "agent": "djaitin-class-generator", "version": "24.0.0"})
    diagram = SubElement(mxfile, "diagram", {"id": "class-diagram", "name": "Class Diagram Djaitin"})
    graph = SubElement(diagram, "mxGraphModel", {"dx": "2100", "dy": "1150", "grid": "1", "gridSize": "10", "guides": "1", "tooltips": "1", "connect": "1", "arrows": "1", "fold": "1", "page": "1", "pageScale": "1", "pageWidth": "2050", "pageHeight": "1080", "math": "0", "shadow": "0"})
    root = SubElement(graph, "root")
    SubElement(root, "mxCell", {"id": "0"})
    SubElement(root, "mxCell", {"id": "1", "parent": "0"})

    title = add_cell(root, "title", "Class Diagram Djaitin", "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;fontSize=24;fontStyle=1", vertex=True)
    add_geometry(title, 40, 15, 500, 35)

    note = add_cell(root, "note", "Notasi: + public, # protected, - private. Diamond hitam = komposisi, diamond putih = agregasi, segitiga = generalisasi, garis putus = dependency. Multiplicity ditulis di dekat ujung relasi.", "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=12;align=left;spacing=8", vertex=True)
    add_geometry(note, 900, 10, 690, 55)

    # Package containers first (behind classes)
    for idx, (name, x, y, w, h) in enumerate(PACKAGES, start=1):
        pkg = add_cell(root, f"pkg_{idx}", name, "swimlane;whiteSpace=wrap;html=1;startSize=28;rounded=1;fillColor=#f8fafc;strokeColor=#cbd5e1;fontSize=13;fontStyle=1;horizontal=1;container=1;collapsible=0;", vertex=True)
        add_geometry(pkg, x, y, w, h)

    class_ids = {c.name: f"cls_{c.name}" for c in CLASSES}
    for c in CLASSES:
        cell = add_cell(root, class_ids[c.name], class_value(c), "shape=umlClass;html=1;whiteSpace=wrap;align=center;verticalAlign=top;spacingTop=8;spacingLeft=8;spacingRight=8;fontSize=12;fillColor=#ffffff;strokeColor=#334155;", vertex=True)
        add_geometry(cell, c.x, c.y, c.w, c.h)

    for idx, r in enumerate(RELATIONS, start=1):
        edge = add_cell(root, f"rel_{idx}", esc(r.label), relation_style(r.kind), edge=True, source=class_ids[r.source], target=class_ids[r.target])
        add_geometry(edge, relative=True)
        if r.source_mult:
            m1 = add_cell(root, f"rel_{idx}_src", esc(r.source_mult), "edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;", vertex=True)
            m1.set("connectable", "0")
            m1.set("parent", f"rel_{idx}")
            add_geometry(m1, -0.82, 1, relative=True)
        if r.target_mult:
            m2 = add_cell(root, f"rel_{idx}_tgt", esc(r.target_mult), "edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];fontSize=11;fontStyle=1;labelBackgroundColor=#ffffff;", vertex=True)
            m2.set("connectable", "0")
            m2.set("parent", f"rel_{idx}")
            add_geometry(m2, 0.82, -1, relative=True)

    return tostring(mxfile, encoding="unicode")


def main() -> None:
    out = Path(__file__).resolve().parents[1] / "class-diagram.drawio"
    out.write_text(build_drawio(), encoding="utf-8")
    print(f"Generated {out}")


if __name__ == "__main__":
    main()
