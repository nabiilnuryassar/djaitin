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
        Schema::table('order_attachments', function (Blueprint $table) {
            $table->string('title')->nullable();
            $table->text('notes')->nullable();
            $table->enum('attachment_type', [
                'reference',
                'design_proposal',
                'revision',
                'final_artwork',
                'other',
            ])->default('other');
            $table->enum('approval_status', [
                'not_required',
                'pending_review',
                'approved',
                'revision_requested',
            ])->default('not_required');
            $table->text('review_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_attachments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reviewed_by');
            $table->dropColumn([
                'title',
                'notes',
                'attachment_type',
                'approval_status',
                'review_notes',
                'reviewed_at',
            ]);
        });
    }
};
