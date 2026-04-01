<?php

use App\Models\Courier;
use App\Models\DiscountPolicy;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Models\User;
use Database\Seeders\ProductionStarterSeeder;
use Illuminate\Support\Facades\Hash;

test('production starter seeder creates baseline internal accounts and master data', function () {
    $this->seed(ProductionStarterSeeder::class);

    expect(User::query()->whereIn('email', [
        'owner@djaitin.com',
        'admin@djaitin.com',
        'kasir@djaitin.com',
        'produksi@djaitin.com',
    ])->count())->toBe(4)
        ->and(DiscountPolicy::query()->whereIn('key', [
            'loyalty_discount_percent',
            'loyalty_order_threshold',
        ])->count())->toBe(2)
        ->and(GarmentModel::query()->whereIn('name', [
            'Kemeja Custom',
            'Tunik Harian',
            'Seragam Konveksi',
        ])->count())->toBe(3)
        ->and(Fabric::query()->whereIn('name', [
            'Katun Premium',
            'Linen Blend',
            'Oxford',
        ])->count())->toBe(3)
        ->and(Courier::query()->whereIn('name', [
            'JNE',
            'J&T Express',
            'SiCepat',
        ])->count())->toBe(3);
});

test('production starter seeder is idempotent and preserves existing passwords', function () {
    $existingAdmin = User::factory()->admin()->create([
        'name' => 'Admin Lama',
        'email' => 'admin@djaitin.com',
        'password' => Hash::make('existing-secret'),
        'is_active' => false,
        'email_verified_at' => null,
    ]);

    $this->seed(ProductionStarterSeeder::class);
    $this->seed(ProductionStarterSeeder::class);

    expect(User::query()->where('email', 'admin@djaitin.com')->count())->toBe(1)
        ->and($existingAdmin->fresh()->name)->toBe('Administrator')
        ->and($existingAdmin->fresh()->is_active)->toBeTrue()
        ->and($existingAdmin->fresh()->email_verified_at)->not->toBeNull()
        ->and(Hash::check('existing-secret', $existingAdmin->fresh()->password))->toBeTrue();
});
