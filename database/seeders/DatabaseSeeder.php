<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\DiscountPolicy;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@djaitin.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );

        DiscountPolicy::query()->updateOrCreate(
            ['key' => 'loyalty_discount_percent'],
            [
                'value' => '20',
                'description' => 'Persentase diskon loyalitas untuk order tailor baru.',
                'updated_by' => $admin->id,
            ],
        );

        DiscountPolicy::query()->updateOrCreate(
            ['key' => 'loyalty_order_threshold'],
            [
                'value' => '5',
                'description' => 'Jumlah closed tailor order sebelum pelanggan dianggap loyal.',
                'updated_by' => $admin->id,
            ],
        );

        GarmentModel::query()->updateOrCreate(
            ['name' => 'Kemeja Custom'],
            [
                'description' => 'Model kemeja kerja standar dengan penyesuaian ukuran.',
                'base_price' => 250000,
                'is_active' => true,
            ],
        );

        GarmentModel::query()->updateOrCreate(
            ['name' => 'Tunik Harian'],
            [
                'description' => 'Model tunik santai untuk kebutuhan casual.',
                'base_price' => 275000,
                'is_active' => true,
            ],
        );

        Fabric::query()->updateOrCreate(
            ['name' => 'Katun Premium'],
            [
                'description' => 'Bahan katun nyaman untuk pemakaian harian.',
                'price_adjustment' => 15000,
                'is_active' => true,
            ],
        );

        Fabric::query()->updateOrCreate(
            ['name' => 'Linen Blend'],
            [
                'description' => 'Bahan linen blend yang ringan dan jatuh.',
                'price_adjustment' => 30000,
                'is_active' => true,
            ],
        );

        $this->call([
            DemoSystemSeeder::class,
        ]);
    }
}
