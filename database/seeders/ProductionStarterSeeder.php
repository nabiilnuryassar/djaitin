<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Courier;
use App\Models\DiscountPolicy;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProductionStarterSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        [$users, $generatedCredentials] = $this->seedInternalUsers();

        $this->seedDiscountPolicies($users['admin']);
        $this->seedGarmentModels();
        $this->seedFabrics();
        $this->seedCouriers();
        $this->reportGeneratedCredentials($generatedCredentials);
    }

    /**
     * @return array{
     *     0: array<string, User>,
     *     1: array<int, array{role: string, email: string, password: string}>
     * }
     */
    protected function seedInternalUsers(): array
    {
        $definitions = [
            'owner' => [
                'name' => 'Owner Djaitin',
                'email' => 'owner@djaitin.com',
                'role' => UserRole::Owner,
            ],
            'admin' => [
                'name' => 'Administrator',
                'email' => 'admin@djaitin.com',
                'role' => UserRole::Admin,
            ],
            'kasir' => [
                'name' => 'Kasir Front Office',
                'email' => 'kasir@djaitin.com',
                'role' => UserRole::Kasir,
            ],
            'produksi' => [
                'name' => 'Produksi Workshop',
                'email' => 'produksi@djaitin.com',
                'role' => UserRole::Produksi,
            ],
        ];

        $users = [];
        $generatedCredentials = [];

        foreach ($definitions as $key => $definition) {
            $existingUser = User::query()
                ->where('email', $definition['email'])
                ->first();

            if ($existingUser !== null) {
                $existingUser->update([
                    'name' => $definition['name'],
                    'role' => $definition['role'],
                    'is_active' => true,
                    'email_verified_at' => $existingUser->email_verified_at ?? now(),
                ]);

                $users[$key] = $existingUser->refresh();

                continue;
            }

            $generatedPassword = Str::password(20);

            $users[$key] = User::query()->create([
                'name' => $definition['name'],
                'email' => $definition['email'],
                'password' => Hash::make($generatedPassword),
                'role' => $definition['role'],
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            $generatedCredentials[] = [
                'role' => $definition['role']->value,
                'email' => $definition['email'],
                'password' => $generatedPassword,
            ];
        }

        return [$users, $generatedCredentials];
    }

    protected function seedDiscountPolicies(User $admin): void
    {
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
    }

    protected function seedGarmentModels(): void
    {
        GarmentModel::query()->updateOrCreate(
            ['name' => 'Kemeja Custom'],
            [
                'description' => 'Model kemeja formal custom.',
                'base_price' => 250000,
                'is_active' => true,
            ],
        );

        GarmentModel::query()->updateOrCreate(
            ['name' => 'Tunik Harian'],
            [
                'description' => 'Model tunik santai untuk kebutuhan semi formal.',
                'base_price' => 275000,
                'is_active' => true,
            ],
        );

        GarmentModel::query()->updateOrCreate(
            ['name' => 'Seragam Konveksi'],
            [
                'description' => 'Model dasar untuk kebutuhan order konveksi.',
                'base_price' => 325000,
                'is_active' => true,
            ],
        );
    }

    protected function seedFabrics(): void
    {
        Fabric::query()->updateOrCreate(
            ['name' => 'Katun Premium'],
            [
                'description' => 'Bahan lembut untuk kebutuhan harian.',
                'price_adjustment' => 15000,
                'is_active' => true,
            ],
        );

        Fabric::query()->updateOrCreate(
            ['name' => 'Linen Blend'],
            [
                'description' => 'Bahan ringan untuk kebutuhan formal kasual.',
                'price_adjustment' => 30000,
                'is_active' => true,
            ],
        );

        Fabric::query()->updateOrCreate(
            ['name' => 'Oxford'],
            [
                'description' => 'Bahan tegas untuk seragam dan kemeja.',
                'price_adjustment' => 45000,
                'is_active' => true,
            ],
        );
    }

    protected function seedCouriers(): void
    {
        Courier::query()->updateOrCreate(
            ['name' => 'JNE'],
            ['is_active' => true],
        );

        Courier::query()->updateOrCreate(
            ['name' => 'J&T Express'],
            ['is_active' => true],
        );

        Courier::query()->updateOrCreate(
            ['name' => 'SiCepat'],
            ['is_active' => true],
        );
    }

    /**
     * @param  array<int, array{role: string, email: string, password: string}>  $generatedCredentials
     */
    protected function reportGeneratedCredentials(array $generatedCredentials): void
    {
        if ($this->command === null || $generatedCredentials === []) {
            return;
        }

        $this->command->warn('Production starter accounts created. Simpan credential berikut dan segera ganti password setelah login pertama.');

        foreach ($generatedCredentials as $credential) {
            $this->command->line(sprintf(
                '- %s | %s | %s',
                strtoupper($credential['role']),
                $credential['email'],
                $credential['password'],
            ));
        }
    }
}
