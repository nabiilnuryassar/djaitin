# Class Diagram Djaitin

Diagram ini disusun berdasarkan model, migration, service, dan elisitasi final sistem Djaitin.

```mermaid
classDiagram
    direction LR

    class Authenticatable {
        <<abstract>>
        #password: string
        #remember_token: string
        +authenticate() bool
    }

    class User {
        +name: string
        +email: string
        -password: string
        +role: UserRole
        +is_active: boolean
        +customer() Customer
        +cart() Cart
        +canAccessOffice() boolean
    }

    class Customer {
        +name: string
        +phone: string
        +address: text
        +is_loyalty_eligible: boolean
        +loyalty_order_count: integer
        +addresses() List~Address~
        +measurements() List~Measurement~
        +orders() List~Order~
    }

    class Address {
        +recipient_name: string
        +phone: string
        +address_line: text
        +city: string
        +province: string
        +postal_code: string
        +is_default: boolean
        +customer() Customer
    }

    class Measurement {
        +label: string
        +chest: decimal
        +waist: decimal
        +hips: decimal
        +shoulder: decimal
        +sleeve_length: decimal
        +shirt_length: decimal
        +inseam: decimal
        +customer() Customer
    }

    class Order {
        +order_number: string
        +order_type: string
        +status: string
        +production_stage: string
        +company_name: string
        +spec_notes: text
        +subtotal: decimal
        +total_amount: decimal
        +paid_amount: decimal
        +outstanding_amount: decimal
        +due_date: date
        +items() List~OrderItem~
        +payments() List~Payment~
        +shipment() Shipment
        +attachments() List~OrderAttachment~
    }

    class OrderItem {
        +item_name: string
        +description: text
        +size: string
        +qty: integer
        +unit_price: decimal
        +discount_amount: decimal
        +subtotal: decimal
        +order() Order
        +product() Product
    }

    class Payment {
        +payment_number: string
        +method: string
        +status: string
        +amount: decimal
        +reference_number: string
        +proof_image_path: string
        +payment_date: datetime
        +verified_at: datetime
        +order() Order
        +markVerified() void
        +reject(reason) void
    }

    class Shipment {
        +status: string
        +recipient_name: string
        +recipient_address: text
        +recipient_phone: string
        +shipping_cost: decimal
        +tracking_number: string
        +shipped_at: datetime
        +delivered_at: datetime
        +order() Order
        +courier() Courier
    }

    class OrderAttachment {
        +file_path: string
        +file_name: string
        +title: string
        +notes: text
        +attachment_type: string
        +file_type: string
        +uploaded_by: bigint
        +order() Order
        +uploadedBy() User
    }

    class Product {
        +sku: string
        +name: string
        +category: string
        +size: string
        +selling_price: decimal
        +stock: integer
        +reserved_stock: integer
        +is_active: boolean
        +orderItems() List~OrderItem~
        +cartItems() List~CartItem~
        +finalPrice() decimal
    }

    class Cart {
        +user_id: bigint
        +user() User
        +items() List~CartItem~
        +totalAmount() decimal
    }

    class CartItem {
        +cart_id: bigint
        +product_id: bigint
        +qty: integer
        +cart() Cart
        +product() Product
        +subtotalAmount() decimal
    }

    class Fabric {
        +name: string
        +description: text
        +is_active: boolean
        +orders() List~Order~
    }

    class GarmentModel {
        +name: string
        +description: text
        +image_path: string
        +is_active: boolean
        +orders() List~Order~
    }

    class Courier {
        +name: string
        +base_fee: decimal
        +is_active: boolean
        +shipments() List~Shipment~
    }

    class DiscountPolicy {
        +key: string
        +value: string
        +description: text
        +updatedBy() User
    }

    class AuditLog {
        +action: string
        +auditable_type: string
        +auditable_id: bigint
        +old_values: json
        +new_values: json
        +ip_address: string
        +created_at: datetime
        +user() User
        +auditable() object
    }

    User --|> Authenticatable

    User "1" *-- "0..1" Customer : akun
    User "1" *-- "0..1" Cart : keranjang
    User "1" --> "0..*" AuditLog : aktivitas
    User "1" --> "0..*" DiscountPolicy : mengubah
    User "1" --> "0..*" OrderAttachment : mengunggah

    Customer "1" *-- "0..*" Address : alamat
    Customer "1" *-- "0..*" Measurement : ukuran
    Customer "1" --> "0..*" Order : pesanan

    Order "1" *-- "1..*" OrderItem : item
    Order "1" *-- "0..*" Payment : pembayaran
    Order "1" *-- "0..1" Shipment : pengiriman
    Order "1" *-- "0..*" OrderAttachment : lampiran
    Order "0..*" o-- "0..1" Fabric : bahan
    Order "0..*" o-- "0..1" GarmentModel : model jahit
    Order "1" ..> "0..*" AuditLog : riwayat perubahan

    OrderItem "0..*" --> "0..1" Product : produk RTW
    Shipment "0..*" o-- "0..1" Courier : kurir

    Cart "1" *-- "0..*" CartItem : item keranjang
    CartItem "0..*" --> "1" Product : produk

    Payment "1" ..> "0..*" AuditLog : riwayat verifikasi
```

## Catatan Notasi

- `*--` menunjukkan komposisi, yaitu class target sangat bergantung pada class sumber.
- `o--` menunjukkan agregasi, yaitu class target digunakan sebagai bagian/referensi tetapi tetap dapat berdiri sendiri.
- `-->` menunjukkan asosiasi biasa.
- `..>` menunjukkan dependency atau pencatatan tidak langsung.
- Multiplicity mengikuti relasi Eloquent dan foreign key pada migration.
