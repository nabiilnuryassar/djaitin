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
        Schema::table('order_attachments', function (Blueprint $table): void {
            $table->foreignId('linked_attachment_id')
                ->nullable()
                ->after('order_id')
                ->constrained('order_attachments')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_attachments', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('linked_attachment_id');
        });
    }
};
