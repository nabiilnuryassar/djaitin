<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('measurement_mode', 20)->nullable()->after('measurement_id');
            $table->jsonb('draft_payload')->nullable()->after('cancellation_reason');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['measurement_mode', 'draft_payload']);
        });
    }
};
