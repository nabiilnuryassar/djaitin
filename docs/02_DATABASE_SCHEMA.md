# 02 — Database Schema

> Database contract for Djaitin. This is a documentation-level contract based on existing migrations/models. Before changing schema, inspect the actual migrations.

---

## 1. Core Tables

Existing domain tables:

```text
users
customers
addresses
measurements
products
fabrics
garment_models
couriers
discount_policies
carts
cart_items
orders
order_items
order_attachments
payments
shipments
audit_logs
notifications
jobs
cache
```

---

## 2. Users and Customers

### users

Key fields:

```text
id
name
email
password
role enum/customer,kasir,produksi,admin,owner
email_verified_at
two_factor_secret / recovery / confirmed_at
remember_token
timestamps
```

Rules:

- `role` cast to `UserRole` enum.
- Default role is customer.
- Office routes require kasir/produksi/admin/owner.

### customers

Represents customer profile attached to user.

```text
id
user_id nullable/unique according to migration
name
phone
email nullable
notes nullable
loyalty fields if present
portal fields if present
timestamps
```

Rules:

- Customer-facing ownership goes through `user_id`.
- Office may manage customer data.

---

## 3. Address and Measurement

### addresses

```text
id
user_id / customer_id
label
recipient_name
phone
address_line
province
city
district
postal_code
is_default
timestamps
```

Rules:

- Customer can CRUD only own addresses.
- One default per user/customer.

### measurements

```text
id
customer_id / user_id
label
body measurement fields
notes
is_default
timestamps
```

Rules:

- Measurement library belongs to customer.
- Tailor order may snapshot measurement values to avoid future edits changing historical order.

---

## 4. Catalog and Master Data

### products

```text
id
name
slug/code
category
price
stock
reserved_stock (recent WIP)
status/is_active
image
fabric_id nullable
garment_model_id nullable
timestamps
```

Rules:

- Stock mutation via `StockService`.
- `stock - reserved_stock` is sellable stock.
- Ready-wear checkout must not oversell.

### fabrics

Fabric master data for tailor/convection.

```text
id
name
code
price_per_meter / additional price fields
status/is_active
attributes json nullable
timestamps
```

### garment_models

```text
id
name
code
type/category
base_price
status/is_active
measurement_schema json nullable
timestamps
```

### couriers

```text
id
name
code
base_fee
is_active
timestamps
```

### discount_policies

```text
id
name
code
type
value
starts_at
ends_at
is_active
rules json nullable
timestamps
```

---

## 5. Cart

### carts

```text
id
user_id
status active/checked_out/abandoned
timestamps
```

### cart_items

```text
id
cart_id
product_id nullable
quantity
unit_price
options json nullable
timestamps
```

Rules:

- Only active cart is mutable.
- Checkout converts cart_items to order_items in one transaction.

---

## 6. Orders

### orders

Central table for ready-wear, tailor, and convection.

Important columns from migrations/WIP:

```text
id
user_id/customer_id
order_number
service_type/type
status
payment_status
production_stage
quote fields for tailor/convection
tailor pricing fields
customer portal fields
total_amount
dp_amount / remaining_amount if present
notes
timestamps
```

Rules:

- Status transition through `OrderStatusService`.
- Production stage separate from payment status.
- Quote fields should support pending quote → approved quote → DP/payment.
- Cancellation releases reserved stock if ready-wear.

### order_items

```text
id
order_id
product_id nullable
fabric_id nullable
garment_model_id nullable
quantity
unit_price
subtotal
options json nullable
timestamps
```

### order_attachments

```text
id
order_id
uploaded_by
file_path
file_name
mime_type
kind/category
collaboration fields
linked_attachment_id nullable
timestamps
```

Rules:

- Attachment visibility is scoped by order ownership or office role.
- Collaboration attachment may be linked/revised.

---

## 7. Payments

### payments

```text
id
order_id
user_id/customer_id nullable
amount
method/status/type
proof_path nullable
proof_uploaded_at nullable
verified_by nullable
verified_at nullable
refund columns from WIP migration
notes
timestamps
```

Rules:

- Payment status transitions through `PaymentService` / `PaymentRefundService`.
- Proof path must not be blindly exposed.
- DP ratio and proof threshold rules are tested.
- Refund fields must preserve original payment audit trail.

---

## 8. Shipments

### shipments

```text
id
order_id
courier_id nullable
tracking_number
status
shipping_cost
shipped_at
delivered_at
timestamps
```

Rules:

- Shipment belongs to order.
- Office shipping page controls status/tracking.

---

## 9. Audit Logs

### audit_logs

```text
id
user_id nullable
action
subject_type
subject_id
before json nullable
after json nullable
ip_address nullable
user_agent nullable
timestamps
```

Rules:

- Office mutations write audit log.
- Payment/refund/order status/stock changes must be audited.
- Do not store raw secrets or full payment proof path if avoidable.

---

## 10. Schema Change Rules

- Additive migrations preferred.
- Never rewrite old migrations unless explicitly resetting project history.
- Backfill data when adding non-nullable columns.
- Include tests for schema-dependent behavior.
- Update this doc and relevant spec when schema changes.
