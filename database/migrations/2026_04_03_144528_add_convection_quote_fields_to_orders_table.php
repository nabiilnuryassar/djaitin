<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->text('quotation_notes')->nullable()->after('spec_notes');
            $table->foreignId('quoted_by')->nullable()->after('is_loyalty_applied')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('quoted_at')->nullable()->after('quoted_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('quoted_by');
            $table->dropColumn(['quotation_notes', 'quoted_at']);
        });
    }
};
