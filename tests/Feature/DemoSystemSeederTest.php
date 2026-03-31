<?php

use App\Enums\OrderType;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

test('database seeder creates full dummy data across the related system', function () {
    $this->seed(DatabaseSeeder::class);

    expect(User::query()->where('role', UserRole::Admin)->exists())->toBeTrue()
        ->and(User::query()->where('role', UserRole::Owner)->exists())->toBeTrue()
        ->and(User::query()->where('role', UserRole::Customer)->exists())->toBeTrue()
        ->and(Product::query()->count())->toBeGreaterThanOrEqual(4)
        ->and(Customer::query()->where('is_loyalty_eligible', true)->exists())->toBeTrue()
        ->and(Order::query()->where('order_type', OrderType::Tailor)->exists())->toBeTrue()
        ->and(Order::query()->where('order_type', OrderType::ReadyWear)->exists())->toBeTrue()
        ->and(Order::query()->where('order_type', OrderType::Convection)->exists())->toBeTrue()
        ->and(Payment::query()->where('status', PaymentStatus::PendingVerification)->exists())->toBeTrue()
        ->and(Payment::query()->where('status', PaymentStatus::Rejected)->exists())->toBeTrue()
        ->and(Shipment::query()->count())->toBeGreaterThan(0)
        ->and(AuditLog::query()->count())->toBeGreaterThan(0);
});
