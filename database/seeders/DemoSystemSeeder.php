<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ShipmentStatus;
use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Courier;
use App\Models\Customer;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Models\Measurement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\User;
use App\Services\LoyaltyService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSystemSeeder extends Seeder
{
    public function run(LoyaltyService $loyaltyService): void
    {
        $users = $this->seedUsers();
        $garmentModels = $this->seedGarmentModels();
        $fabrics = $this->seedFabrics();
        $products = $this->seedProducts();
        $couriers = $this->seedCouriers();
        $customers = $this->seedCustomers($users);
        $measurements = $this->seedMeasurements($customers);

        $this->seedLoyaltyHistory(
            kasir: $users['kasir'],
            admin: $users['admin'],
            customer: $customers['loyal'],
            garmentModel: $garmentModels['kemeja'],
            fabric: $fabrics['katun'],
            measurement: $measurements['loyal_primary'],
        );

        $this->seedOperationalOrders(
            users: $users,
            customers: $customers,
            garmentModels: $garmentModels,
            fabrics: $fabrics,
            products: $products,
            couriers: $couriers,
            measurements: $measurements,
        );

        foreach ($customers as $customer) {
            $loyaltyService->syncCustomer($customer->refresh());
        }
    }

    /**
     * @return array<string, User>
     */
    protected function seedUsers(): array
    {
        return [
            'customer' => $this->upsertUser(
                name: 'Customer Demo',
                email: 'customer@djaitin.com',
                role: UserRole::Customer,
            ),
            'admin' => $this->upsertUser(
                name: 'Administrator',
                email: 'admin@djaitin.com',
                role: UserRole::Admin,
            ),
            'owner' => $this->upsertUser(
                name: 'Owner Djaitin',
                email: 'owner@djaitin.com',
                role: UserRole::Owner,
            ),
            'kasir' => $this->upsertUser(
                name: 'Kasir Front Office',
                email: 'kasir@djaitin.com',
                role: UserRole::Kasir,
            ),
            'produksi' => $this->upsertUser(
                name: 'Produksi Workshop',
                email: 'produksi@djaitin.com',
                role: UserRole::Produksi,
            ),
        ];
    }

    protected function upsertUser(string $name, string $email, UserRole $role): User
    {
        return User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'role' => $role,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
    }

    /**
     * @return array<string, GarmentModel>
     */
    protected function seedGarmentModels(): array
    {
        return [
            'kemeja' => GarmentModel::query()->updateOrCreate(
                ['name' => 'Kemeja Custom'],
                [
                    'description' => 'Model kemeja formal custom.',
                    'base_price' => 250000,
                    'is_active' => true,
                ],
            ),
            'tunik' => GarmentModel::query()->updateOrCreate(
                ['name' => 'Tunik Harian'],
                [
                    'description' => 'Model tunik santai dengan potongan longgar.',
                    'base_price' => 275000,
                    'is_active' => true,
                ],
            ),
            'seragam' => GarmentModel::query()->updateOrCreate(
                ['name' => 'Seragam Konveksi'],
                [
                    'description' => 'Model seragam massal untuk kebutuhan tim.',
                    'base_price' => 325000,
                    'is_active' => true,
                ],
            ),
        ];
    }

    /**
     * @return array<string, Fabric>
     */
    protected function seedFabrics(): array
    {
        return [
            'katun' => Fabric::query()->updateOrCreate(
                ['name' => 'Katun Premium'],
                [
                    'description' => 'Bahan lembut untuk kebutuhan harian.',
                    'price_adjustment' => 15000,
                    'is_active' => true,
                ],
            ),
            'linen' => Fabric::query()->updateOrCreate(
                ['name' => 'Linen Blend'],
                [
                    'description' => 'Linen blend ringan untuk look formal kasual.',
                    'price_adjustment' => 30000,
                    'is_active' => true,
                ],
            ),
            'oxford' => Fabric::query()->updateOrCreate(
                ['name' => 'Oxford'],
                [
                    'description' => 'Bahan tegas untuk seragam dan kemeja.',
                    'price_adjustment' => 45000,
                    'is_active' => true,
                ],
            ),
        ];
    }

    /**
     * @return array<string, Product>
     */
    protected function seedProducts(): array
    {
        return [
            'linen_s' => Product::query()->firstOrCreate(
                ['sku' => 'RTW-KMJ-LINEN-S'],
                [
                    'name' => 'Kemeja Linen',
                    'description' => 'Ready-to-wear kemeja linen warna putih.',
                    'category' => 'tops',
                    'size' => 'S',
                    'base_price' => 120000,
                    'selling_price' => 215000,
                    'discount_amount' => 0,
                    'discount_percent' => 0,
                    'is_clearance' => false,
                    'stock' => 14,
                    'is_active' => true,
                ],
            ),
            'linen_m' => Product::query()->firstOrCreate(
                ['sku' => 'RTW-KMJ-LINEN-M'],
                [
                    'name' => 'Kemeja Linen',
                    'description' => 'Ready-to-wear kemeja linen warna putih.',
                    'category' => 'tops',
                    'size' => 'M',
                    'base_price' => 120000,
                    'selling_price' => 215000,
                    'discount_amount' => 0,
                    'discount_percent' => 0,
                    'is_clearance' => false,
                    'stock' => 10,
                    'is_active' => true,
                ],
            ),
            'blouse_l' => Product::query()->firstOrCreate(
                ['sku' => 'RTW-BLOUSE-L'],
                [
                    'name' => 'Blouse Office',
                    'description' => 'Blouse kantor warna navy.',
                    'category' => 'tops',
                    'size' => 'L',
                    'base_price' => 95000,
                    'selling_price' => 175000,
                    'discount_amount' => 25000,
                    'discount_percent' => 14.29,
                    'is_clearance' => false,
                    'stock' => 8,
                    'is_active' => true,
                ],
            ),
            'tunik_clearance' => Product::query()->firstOrCreate(
                ['sku' => 'RTW-TUNIK-CLR-XL'],
                [
                    'name' => 'Tunik Casual Clearance',
                    'description' => 'Tunik seasonal dengan harga clearance.',
                    'category' => 'tops',
                    'size' => 'XL',
                    'base_price' => 88000,
                    'selling_price' => 110000,
                    'discount_amount' => 22000,
                    'discount_percent' => 20,
                    'is_clearance' => true,
                    'stock' => 5,
                    'is_active' => true,
                ],
            ),
        ];
    }

    /**
     * @return array<string, Courier>
     */
    protected function seedCouriers(): array
    {
        return [
            'jne' => Courier::query()->firstOrCreate(['name' => 'JNE'], ['is_active' => true]),
            'jnt' => Courier::query()->firstOrCreate(['name' => 'J&T Express'], ['is_active' => true]),
            'sicepat' => Courier::query()->firstOrCreate(['name' => 'SiCepat'], ['is_active' => true]),
        ];
    }

    /**
     * @param  array<string, User>  $users
     * @return array<string, Customer>
     */
    protected function seedCustomers(array $users): array
    {
        return [
            'loyal' => Customer::query()->updateOrCreate(
                ['phone' => '081200000001'],
                [
                    'user_id' => $users['customer']->id,
                    'name' => 'Rani Pratama',
                    'address' => 'Bandung',
                    'notes' => 'Pelanggan loyal tailor',
                ],
            ),
            'tailor_pending' => Customer::query()->updateOrCreate(
                ['phone' => '081200000002'],
                [
                    'user_id' => null,
                    'name' => 'Dimas Saputra',
                    'address' => 'Cimahi',
                    'notes' => 'Order tailor transfer pending',
                ],
            ),
            'tailor_progress' => Customer::query()->updateOrCreate(
                ['phone' => '081200000003'],
                [
                    'user_id' => null,
                    'name' => 'Nadia Putri',
                    'address' => 'Bandung Timur',
                    'notes' => 'Order tailor aktif',
                ],
            ),
            'tailor_done' => Customer::query()->updateOrCreate(
                ['phone' => '081200000004'],
                [
                    'user_id' => null,
                    'name' => 'Alya Rahma',
                    'address' => 'Bandung Barat',
                    'notes' => 'Order tailor siap serah',
                ],
            ),
            'rtw_customer' => Customer::query()->updateOrCreate(
                ['phone' => '081200000005'],
                [
                    'user_id' => null,
                    'name' => 'Budi Hartono',
                    'address' => 'Sumedang',
                    'notes' => 'Pembeli ready to wear',
                ],
            ),
            'convection_customer' => Customer::query()->updateOrCreate(
                ['phone' => '081200000006'],
                [
                    'user_id' => null,
                    'name' => 'PT Sinar Konveksi',
                    'address' => 'Jl. Industri 88, Bandung',
                    'notes' => 'PIC: Siska',
                ],
            ),
        ];
    }

    /**
     * @param  array<string, Customer>  $customers
     * @return array<string, Measurement>
     */
    protected function seedMeasurements(array $customers): array
    {
        return [
            'loyal_primary' => $this->firstMeasurement(
                $customers['loyal'],
                'Kemeja Kantor Maret 2026',
                [
                    'chest' => 92,
                    'waist' => 75,
                    'hips' => 96,
                    'shoulder' => 40,
                    'sleeve_length' => 58,
                    'shirt_length' => 68,
                ],
            ),
            'tailor_pending' => $this->firstMeasurement(
                $customers['tailor_pending'],
                'Order Pertama',
                [
                    'chest' => 98,
                    'waist' => 82,
                    'hips' => 101,
                    'shoulder' => 43,
                    'sleeve_length' => 60,
                    'shirt_length' => 70,
                ],
            ),
            'tailor_progress' => $this->firstMeasurement(
                $customers['tailor_progress'],
                'Blouse Kerja',
                [
                    'chest' => 90,
                    'waist' => 72,
                    'hips' => 94,
                    'shoulder' => 39,
                    'sleeve_length' => 56,
                    'shirt_length' => 66,
                ],
            ),
            'tailor_done' => $this->firstMeasurement(
                $customers['tailor_done'],
                'Tunik Lebaran',
                [
                    'chest' => 94,
                    'waist' => 78,
                    'hips' => 102,
                    'shoulder' => 41,
                    'sleeve_length' => 57,
                    'shirt_length' => 84,
                ],
            ),
        ];
    }

    protected function firstMeasurement(Customer $customer, string $label, array $attributes): Measurement
    {
        return Measurement::query()->firstOrCreate(
            [
                'customer_id' => $customer->id,
                'label' => $label,
            ],
            [
                ...$attributes,
                'notes' => 'Dummy measurement seed',
            ],
        );
    }

    protected function seedLoyaltyHistory(
        User $kasir,
        User $admin,
        Customer $customer,
        GarmentModel $garmentModel,
        Fabric $fabric,
        Measurement $measurement,
    ): void {
        for ($index = 1; $index <= 6; $index++) {
            $subtotal = 180000 + ($index * 10000);
            $this->createOrder(
                attributes: [
                    'order_number' => sprintf('TLR-HIST-2026-%03d', $index),
                    'order_type' => OrderType::Tailor,
                    'status' => OrderStatus::Closed,
                    'customer_id' => $customer->id,
                    'created_by' => $kasir->id,
                    'garment_model_id' => $garmentModel->id,
                    'fabric_id' => $fabric->id,
                    'measurement_id' => $measurement->id,
                    'due_date' => now()->subDays(50 - $index)->toDateString(),
                    'spec_notes' => 'Riwayat order loyalitas',
                    'subtotal' => $subtotal,
                    'discount_amount' => 0,
                    'shipping_cost' => 0,
                    'total_amount' => $subtotal,
                    'is_loyalty_applied' => false,
                ],
                items: [[
                    'item_name' => 'Kemeja Custom',
                    'qty' => 1,
                    'unit_price' => $subtotal,
                    'discount_amount' => 0,
                    'discount_percent' => 0,
                    'subtotal' => $subtotal,
                ]],
                payments: [[
                    'payment_number' => sprintf('PAY-HIST-2026-%03d', $index),
                    'method' => PaymentMethod::Cash,
                    'status' => PaymentStatus::Verified,
                    'amount' => $subtotal,
                    'payment_date' => now()->subDays(60 - $index),
                    'created_by' => $kasir->id,
                    'verified_by' => $kasir->id,
                    'verified_at' => now()->subDays(60 - $index),
                    'notes' => 'Pelunasan order loyalitas',
                ]],
                shipment: null,
                logs: [
                    ['user_id' => $kasir->id, 'action' => 'order.created', 'notes' => 'Seed historical loyal order'],
                    ['user_id' => $admin->id, 'action' => 'order.status_changed', 'notes' => 'Order ditutup sebagai histori loyalitas'],
                ],
            );
        }
    }

    /**
     * @param  array<string, User>  $users
     * @param  array<string, Customer>  $customers
     * @param  array<string, GarmentModel>  $garmentModels
     * @param  array<string, Fabric>  $fabrics
     * @param  array<string, Product>  $products
     * @param  array<string, Courier>  $couriers
     * @param  array<string, Measurement>  $measurements
     */
    protected function seedOperationalOrders(
        array $users,
        array $customers,
        array $garmentModels,
        array $fabrics,
        array $products,
        array $couriers,
        array $measurements,
    ): void {
        $this->createOrder(
            attributes: [
                'order_number' => 'TLR-DEMO-PENDING-001',
                'order_type' => OrderType::Tailor,
                'status' => OrderStatus::PendingPayment,
                'customer_id' => $customers['tailor_pending']->id,
                'created_by' => $users['kasir']->id,
                'garment_model_id' => $garmentModels['kemeja']->id,
                'fabric_id' => $fabrics['oxford']->id,
                'measurement_id' => $measurements['tailor_pending']->id,
                'due_date' => now()->addDays(10)->toDateString(),
                'spec_notes' => 'Kemeja kantor warna biru dongker',
                'subtotal' => 320000,
                'discount_amount' => 0,
                'shipping_cost' => 0,
                'total_amount' => 320000,
                'is_loyalty_applied' => false,
            ],
            items: [[
                'item_name' => 'Kemeja Custom',
                'qty' => 1,
                'unit_price' => 320000,
                'discount_amount' => 0,
                'discount_percent' => 0,
                'subtotal' => 320000,
            ]],
            payments: [[
                'payment_number' => 'PAY-DEMO-TLR-PENDING-001',
                'method' => PaymentMethod::Transfer,
                'status' => PaymentStatus::PendingVerification,
                'amount' => 120000,
                'reference_number' => 'TRX-TLR-PENDING-001',
                'payment_date' => now()->subDay(),
                'created_by' => $users['kasir']->id,
                'notes' => 'DP transfer menunggu verifikasi',
            ]],
            shipment: null,
            logs: [
                ['user_id' => $users['kasir']->id, 'action' => 'order.created', 'notes' => 'Order tailor pending verifikasi DP'],
            ],
        );

        $this->createOrder(
            attributes: [
                'order_number' => 'TLR-DEMO-PROGRESS-001',
                'order_type' => OrderType::Tailor,
                'status' => OrderStatus::InProgress,
                'customer_id' => $customers['tailor_progress']->id,
                'created_by' => $users['kasir']->id,
                'garment_model_id' => $garmentModels['tunik']->id,
                'fabric_id' => $fabrics['linen']->id,
                'measurement_id' => $measurements['tailor_progress']->id,
                'due_date' => now()->addDays(7)->toDateString(),
                'spec_notes' => 'Blouse kerja dengan detail manset',
                'subtotal' => 450000,
                'discount_amount' => 0,
                'shipping_cost' => 0,
                'total_amount' => 450000,
                'is_loyalty_applied' => false,
            ],
            items: [[
                'item_name' => 'Blouse Custom',
                'qty' => 1,
                'unit_price' => 450000,
                'discount_amount' => 0,
                'discount_percent' => 0,
                'subtotal' => 450000,
            ]],
            payments: [[
                'payment_number' => 'PAY-DEMO-TLR-PROGRESS-001',
                'method' => PaymentMethod::Cash,
                'status' => PaymentStatus::Verified,
                'amount' => 270000,
                'payment_date' => now()->subDays(2),
                'created_by' => $users['kasir']->id,
                'verified_by' => $users['kasir']->id,
                'verified_at' => now()->subDays(2),
                'notes' => 'DP cash 60%',
            ]],
            shipment: null,
            logs: [
                ['user_id' => $users['kasir']->id, 'action' => 'order.created', 'notes' => 'Order tailor aktif'],
                ['user_id' => $users['produksi']->id, 'action' => 'order.status_changed', 'notes' => 'Order masuk proses produksi'],
            ],
        );

        $this->createOrder(
            attributes: [
                'order_number' => 'TLR-DEMO-DONE-001',
                'order_type' => OrderType::Tailor,
                'status' => OrderStatus::Done,
                'customer_id' => $customers['tailor_done']->id,
                'created_by' => $users['kasir']->id,
                'garment_model_id' => $garmentModels['tunik']->id,
                'fabric_id' => $fabrics['katun']->id,
                'measurement_id' => $measurements['tailor_done']->id,
                'due_date' => now()->subDay()->toDateString(),
                'spec_notes' => 'Tunik siap serah, tinggal penjemputan',
                'subtotal' => 380000,
                'discount_amount' => 0,
                'shipping_cost' => 0,
                'total_amount' => 380000,
                'is_loyalty_applied' => false,
            ],
            items: [[
                'item_name' => 'Tunik Harian',
                'qty' => 1,
                'unit_price' => 380000,
                'discount_amount' => 0,
                'discount_percent' => 0,
                'subtotal' => 380000,
            ]],
            payments: [
                [
                    'payment_number' => 'PAY-DEMO-TLR-DONE-001',
                    'method' => PaymentMethod::Cash,
                    'status' => PaymentStatus::Verified,
                    'amount' => 190000,
                    'payment_date' => now()->subDays(5),
                    'created_by' => $users['kasir']->id,
                    'verified_by' => $users['kasir']->id,
                    'verified_at' => now()->subDays(5),
                    'notes' => 'DP awal cash',
                ],
                [
                    'payment_number' => 'PAY-DEMO-TLR-DONE-002',
                    'method' => PaymentMethod::Transfer,
                    'status' => PaymentStatus::Verified,
                    'amount' => 190000,
                    'reference_number' => 'TRX-TLR-DONE-002',
                    'payment_date' => now()->subDays(1),
                    'created_by' => $users['kasir']->id,
                    'verified_by' => $users['admin']->id,
                    'verified_at' => now()->subDays(1),
                    'notes' => 'Pelunasan transfer tervalidasi',
                ],
            ],
            shipment: null,
            logs: [
                ['user_id' => $users['kasir']->id, 'action' => 'order.created', 'notes' => 'Order tailor selesai jahit'],
                ['user_id' => $users['admin']->id, 'action' => 'payment.verified', 'notes' => 'Pelunasan transfer diverifikasi'],
            ],
        );

        $this->createOrder(
            attributes: [
                'order_number' => 'RTW-DEMO-CLOSED-001',
                'order_type' => OrderType::ReadyWear,
                'status' => OrderStatus::Closed,
                'customer_id' => $customers['rtw_customer']->id,
                'created_by' => $users['kasir']->id,
                'due_date' => null,
                'spec_notes' => 'Pengiriman paket ready wear',
                'subtotal' => 390000,
                'discount_amount' => 25000,
                'shipping_cost' => 18000,
                'total_amount' => 383000,
                'is_loyalty_applied' => false,
            ],
            items: [
                [
                    'product_id' => $products['linen_m']->id,
                    'item_name' => $products['linen_m']->name,
                    'description' => $products['linen_m']->description,
                    'size' => $products['linen_m']->size,
                    'qty' => 1,
                    'unit_price' => 215000,
                    'discount_amount' => 0,
                    'discount_percent' => 0,
                    'subtotal' => 215000,
                ],
                [
                    'product_id' => $products['blouse_l']->id,
                    'item_name' => $products['blouse_l']->name,
                    'description' => $products['blouse_l']->description,
                    'size' => $products['blouse_l']->size,
                    'qty' => 1,
                    'unit_price' => 175000,
                    'discount_amount' => 25000,
                    'discount_percent' => 14.29,
                    'subtotal' => 150000,
                ],
            ],
            payments: [[
                'payment_number' => 'PAY-DEMO-RTW-CLOSED-001',
                'method' => PaymentMethod::Cash,
                'status' => PaymentStatus::Verified,
                'amount' => 383000,
                'payment_date' => now()->subDays(3),
                'created_by' => $users['kasir']->id,
                'verified_by' => $users['kasir']->id,
                'verified_at' => now()->subDays(3),
                'notes' => 'Pembayaran RTW lunas',
            ]],
            shipment: [
                'courier_id' => $couriers['jne']->id,
                'status' => ShipmentStatus::Delivered,
                'recipient_name' => $customers['rtw_customer']->name,
                'recipient_address' => $customers['rtw_customer']->address,
                'recipient_phone' => $customers['rtw_customer']->phone,
                'shipping_cost' => 18000,
                'tracking_number' => 'JNE-RTW-001',
                'shipped_at' => now()->subDays(2),
                'delivered_at' => now()->subDay(),
                'notes' => 'Paket sudah diterima pelanggan',
            ],
            logs: [
                ['user_id' => $users['kasir']->id, 'action' => 'order.created', 'notes' => 'Order RTW dengan pengiriman'],
                ['user_id' => $users['kasir']->id, 'action' => 'payment.recorded', 'notes' => 'Pembayaran RTW cash'],
            ],
        );

        $this->createOrder(
            attributes: [
                'order_number' => 'RTW-DEMO-REJECTED-001',
                'order_type' => OrderType::ReadyWear,
                'status' => OrderStatus::PendingPayment,
                'customer_id' => $customers['rtw_customer']->id,
                'created_by' => $users['kasir']->id,
                'due_date' => null,
                'spec_notes' => 'Transfer ditolak, menunggu pembayaran ulang',
                'subtotal' => 110000,
                'discount_amount' => 22000,
                'shipping_cost' => 0,
                'total_amount' => 88000,
                'is_loyalty_applied' => false,
            ],
            items: [[
                'product_id' => $products['tunik_clearance']->id,
                'item_name' => $products['tunik_clearance']->name,
                'description' => $products['tunik_clearance']->description,
                'size' => $products['tunik_clearance']->size,
                'qty' => 1,
                'unit_price' => 110000,
                'discount_amount' => 22000,
                'discount_percent' => 20,
                'subtotal' => 88000,
            ]],
            payments: [[
                'payment_number' => 'PAY-DEMO-RTW-REJECTED-001',
                'method' => PaymentMethod::Transfer,
                'status' => PaymentStatus::Rejected,
                'amount' => 88000,
                'reference_number' => 'TRX-RTW-REJECTED-001',
                'payment_date' => now()->subHours(8),
                'created_by' => $users['kasir']->id,
                'verified_by' => $users['admin']->id,
                'verified_at' => now()->subHours(6),
                'rejection_reason' => 'Nominal transfer tidak sesuai invoice.',
                'notes' => 'Pembayaran perlu diulang',
            ]],
            shipment: null,
            logs: [
                ['user_id' => $users['admin']->id, 'action' => 'payment.rejected', 'notes' => 'Transfer RTW ditolak'],
            ],
        );

        $this->createOrder(
            attributes: [
                'order_number' => 'CNV-DEMO-INPROGRESS-001',
                'order_type' => OrderType::Convection,
                'status' => OrderStatus::InProgress,
                'customer_id' => $customers['convection_customer']->id,
                'created_by' => $users['kasir']->id,
                'company_name' => 'PT Sinar Konveksi',
                'due_date' => now()->addDays(14)->toDateString(),
                'spec_notes' => 'Seragam event internal 50 pcs',
                'subtotal' => 6500000,
                'discount_amount' => 0,
                'shipping_cost' => 0,
                'total_amount' => 6500000,
                'is_loyalty_applied' => false,
            ],
            items: [[
                'item_name' => 'Seragam Konveksi',
                'description' => '50 pcs, variasi size campur',
                'size' => 'Mixed',
                'qty' => 50,
                'unit_price' => 130000,
                'discount_amount' => 0,
                'discount_percent' => 0,
                'subtotal' => 6500000,
            ]],
            payments: [[
                'payment_number' => 'PAY-DEMO-CNV-INPROGRESS-001',
                'method' => PaymentMethod::Transfer,
                'status' => PaymentStatus::Verified,
                'amount' => 6500000,
                'reference_number' => 'TRX-CNV-INPROGRESS-001',
                'payment_date' => now()->subDays(4),
                'created_by' => $users['kasir']->id,
                'verified_by' => $users['admin']->id,
                'verified_at' => now()->subDays(4),
                'notes' => 'Pelunasan penuh order konveksi',
            ]],
            shipment: [
                'courier_id' => $couriers['jnt']->id,
                'status' => ShipmentStatus::Pending,
                'recipient_name' => 'Siska - PT Sinar Konveksi',
                'recipient_address' => $customers['convection_customer']->address,
                'recipient_phone' => $customers['convection_customer']->phone,
                'shipping_cost' => 0,
                'tracking_number' => null,
                'notes' => 'Menunggu tahap finishing sebelum dikirim',
            ],
            logs: [
                ['user_id' => $users['admin']->id, 'action' => 'payment.verified', 'notes' => 'Konveksi full payment tervalidasi'],
                ['user_id' => $users['produksi']->id, 'action' => 'order.status_changed', 'notes' => 'Konveksi masuk produksi'],
            ],
        );

        $this->createOrder(
            attributes: [
                'order_number' => 'CNV-DEMO-PENDING-001',
                'order_type' => OrderType::Convection,
                'status' => OrderStatus::PendingPayment,
                'customer_id' => $customers['convection_customer']->id,
                'created_by' => $users['kasir']->id,
                'company_name' => 'PT Sinar Konveksi',
                'due_date' => now()->addDays(21)->toDateString(),
                'spec_notes' => 'Seragam outing 30 pcs belum lunas',
                'subtotal' => 3900000,
                'discount_amount' => 0,
                'shipping_cost' => 0,
                'total_amount' => 3900000,
                'is_loyalty_applied' => false,
            ],
            items: [[
                'item_name' => 'Seragam Konveksi',
                'description' => '30 pcs, desain baru',
                'size' => 'Mixed',
                'qty' => 30,
                'unit_price' => 130000,
                'discount_amount' => 0,
                'discount_percent' => 0,
                'subtotal' => 3900000,
            ]],
            payments: [[
                'payment_number' => 'PAY-DEMO-CNV-PENDING-001',
                'method' => PaymentMethod::Transfer,
                'status' => PaymentStatus::PendingVerification,
                'amount' => 1500000,
                'reference_number' => 'TRX-CNV-PENDING-001',
                'payment_date' => now()->subHours(20),
                'created_by' => $users['kasir']->id,
                'notes' => 'DP konveksi menunggu verifikasi',
            ]],
            shipment: null,
            logs: [
                ['user_id' => $users['kasir']->id, 'action' => 'order.created', 'notes' => 'Order konveksi baru'],
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @param  array<int, array<string, mixed>>  $items
     * @param  array<int, array<string, mixed>>  $payments
     * @param  array<string, mixed>|null  $shipment
     * @param  array<int, array<string, mixed>>  $logs
     */
    protected function createOrder(
        array $attributes,
        array $items,
        array $payments,
        ?array $shipment,
        array $logs,
    ): Order {
        $order = Order::query()->firstOrCreate(
            ['order_number' => $attributes['order_number']],
            [
                ...$attributes,
                'paid_amount' => 0,
                'outstanding_amount' => $attributes['total_amount'],
            ],
        );

        foreach ($items as $item) {
            OrderItem::query()->firstOrCreate(
                [
                    'order_id' => $order->id,
                    'item_name' => $item['item_name'],
                    'size' => $item['size'] ?? null,
                ],
                [
                    'product_id' => $item['product_id'] ?? null,
                    'description' => $item['description'] ?? null,
                    'qty' => $item['qty'],
                    'unit_price' => $item['unit_price'],
                    'discount_amount' => $item['discount_amount'],
                    'discount_percent' => $item['discount_percent'],
                    'subtotal' => $item['subtotal'],
                ],
            );
        }

        foreach ($payments as $payment) {
            Payment::query()->firstOrCreate(
                ['payment_number' => $payment['payment_number']],
                [
                    'order_id' => $order->id,
                    'method' => $payment['method'],
                    'status' => $payment['status'],
                    'amount' => $payment['amount'],
                    'reference_number' => $payment['reference_number'] ?? null,
                    'payment_date' => $payment['payment_date'],
                    'created_by' => $payment['created_by'],
                    'verified_by' => $payment['verified_by'] ?? null,
                    'verified_at' => $payment['verified_at'] ?? null,
                    'rejection_reason' => $payment['rejection_reason'] ?? null,
                    'notes' => $payment['notes'] ?? null,
                ],
            );
        }

        $verifiedAmount = (float) $order->payments()
            ->where('status', PaymentStatus::Verified)
            ->sum('amount');

        $order->update([
            'paid_amount' => $verifiedAmount,
            'outstanding_amount' => max((float) $order->total_amount - $verifiedAmount, 0),
        ]);

        if ($shipment !== null) {
            Shipment::query()->firstOrCreate(
                ['order_id' => $order->id],
                $shipment,
            );
        }

        foreach ($logs as $log) {
            AuditLog::query()->firstOrCreate(
                [
                    'user_id' => $log['user_id'],
                    'action' => $log['action'],
                    'auditable_type' => $order->getMorphClass(),
                    'auditable_id' => $order->id,
                    'notes' => $log['notes'] ?? null,
                ],
                [
                    'old_values' => $log['old_values'] ?? null,
                    'new_values' => $log['new_values'] ?? null,
                    'ip_address' => $log['ip_address'] ?? '127.0.0.1',
                ],
            );
        }

        foreach ($order->payments as $payment) {
            if ($payment->status === PaymentStatus::Verified) {
                AuditLog::query()->firstOrCreate(
                    [
                        'user_id' => $payment->verified_by ?? $payment->created_by,
                        'action' => 'payment.verified',
                        'auditable_type' => $payment->getMorphClass(),
                        'auditable_id' => $payment->id,
                        'notes' => 'Dummy payment verified log',
                    ],
                    [
                        'new_values' => ['status' => PaymentStatus::Verified->value],
                        'ip_address' => '127.0.0.1',
                    ],
                );
            }

            if ($payment->status === PaymentStatus::Rejected) {
                AuditLog::query()->firstOrCreate(
                    [
                        'user_id' => $payment->verified_by ?? $payment->created_by,
                        'action' => 'payment.rejected',
                        'auditable_type' => $payment->getMorphClass(),
                        'auditable_id' => $payment->id,
                        'notes' => 'Dummy payment rejected log',
                    ],
                    [
                        'new_values' => [
                            'status' => PaymentStatus::Rejected->value,
                            'rejection_reason' => $payment->rejection_reason,
                        ],
                        'ip_address' => '127.0.0.1',
                    ],
                );
            }
        }

        return $order->refresh();
    }
}
