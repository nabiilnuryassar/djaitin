<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('customer_id')
                ->constrained()
                ->nullOnDelete();
        });

        DB::table('orders')
            ->join('customers', 'customers.id', '=', 'orders.customer_id')
            ->whereNull('orders.user_id')
            ->whereNotNull('customers.user_id')
            ->select('orders.id', 'customers.user_id')
            ->orderBy('orders.id')
            ->lazy()
            ->each(function (object $row): void {
                DB::table('orders')
                    ->where('id', $row->id)
                    ->update(['user_id' => $row->user_id]);
            });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
