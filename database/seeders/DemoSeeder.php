<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        $users = [
            'customer' => User::updateOrCreate(
                ['email' => 'customer@djaitin.com'],
                [
                    'name' => 'Customer Demo',
                    'password' => Hash::make('password'),
                    'role' => UserRole::Customer,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            ),
            'admin' => User::updateOrCreate(
                ['email' => 'admin@djaitin.com'],
                [
                    'name' => 'Administrator',
                    'password' => Hash::make('password'),
                    'role' => UserRole::Admin,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            ),
            'owner' => User::updateOrCreate(
                ['email' => 'owner@djaitin.com'],
                [
                    'name' => 'Owner Djaitin',
                    'password' => Hash::make('password'),
                    'role' => UserRole::Owner,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            ),
            'kasir' => User::updateOrCreate(
                ['email' => 'kasir@djaitin.com'],
                [
                    'name' => 'Kasir Front Office',
                    'password' => Hash::make('password'),
                    'role' => UserRole::Kasir,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            ),
            'produksi' => User::updateOrCreate(
                ['email' => 'produksi@djaitin.com'],
                [
                    'name' => 'Produksi Workshop',
                    'password' => Hash::make('password'),
                    'role' => UserRole::Produksi,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            ),
        ];

        // Garment Models
        GarmentModel::updateOrCreate(
            ['name' => 'Kemeja Custom'],
            [
                'description' => 'Model kemeja formal custom',
                'base_price' => 250000,
                'is_active' => true,
            ]
        );

        GarmentModel::updateOrCreate(
            ['name' => 'Tunik Harian'],
            [
                'description' => 'Model tunik santai dengan potongan longgar',
                'base_price' => 275000,
                'is_active' => true,
            ]
        );

        GarmentModel::updateOrCreate(
            ['name' => 'Seragam Konveksi'],
            [
                'description' => 'Model seragam massal untuk kebutuhan tim',
                'base_price' => 325000,
                'is_active' => true,
            ]
        );

        // Fabrics
        Fabric::updateOrCreate(
            ['name' => 'Katun Premium'],
            [
                'description' => 'Bahan lembut untuk kebutuhan harian',
                'price_per_meter' => 75000,
                'is_active' => true,
            ]
        );

        Fabric::updateOrCreate(
            ['name' => 'Drill Premium'],
            [
                'description' => 'Bahan kuat untuk seragam dan jaket',
                'price_per_meter' => 85000,
                'is_active' => true,
            ]
        );

        Fabric::updateOrCreate(
            ['name' => 'Linen Exclusive'],
            [
                'description' => 'Bahan premium untuk kemeja eksklusif',
                'price_per_meter' => 120000,
                'is_active' => true,
            ]
        );

        // Products (Ready-to-Wear)
        Product::updateOrCreate(
            ['name' => 'Kemeja Batik Classic'],
            [
                'description' => 'Kemeja batik modern untuk pria',
                'price' => 350000,
                'stock' => 50,
                'is_active' => true,
            ]
        );

        Product::updateOrCreate(
            ['name' => 'Kemeja Casual'],
            [
                'description' => 'Kemeja kasual untuk aktivitas sehari-hari',
                'price' => 275000,
                'stock' => 75,
                'is_active' => true,
            ]
        );

        Product::updateOrCreate(
            ['name' => 'Seragam Kantor'],
            [
                'description' => 'Seragam formal untuk kebutuhan korporat',
                'price' => 325000,
                'stock' => 100,
                'is_active' => true,
            ]
        );

        $this->command->info('Demo seeder completed successfully!');
        $this->command->info('');
        $this->command->info('Login credentials (password: password):');
        $this->command->info('- Customer: customer@djaitin.com');
        $this->command->info('- Admin: admin@djaitin.com');
        $this->command->info('- Owner: owner@djaitin.com');
        $this->command->info('- Kasir: kasir@djaitin.com');
        $this->command->info('- Produksi: produksi@djaitin.com');
    }
}
