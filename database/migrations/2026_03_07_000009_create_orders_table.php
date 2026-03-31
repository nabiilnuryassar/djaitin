<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50)->unique();
            $table->string('order_type', 20);
            $table->string('status', 30)->default('draft');
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('garment_model_id')->nullable()->constrained('garment_models')->nullOnDelete();
            $table->foreignId('fabric_id')->nullable()->constrained('fabrics')->nullOnDelete();
            $table->foreignId('measurement_id')->nullable()->constrained('measurements')->nullOnDelete();
            $table->date('due_date')->nullable();
            $table->string('company_name')->nullable();
            $table->text('spec_notes')->nullable();
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('shipping_cost', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('outstanding_amount', 15, 2)->default(0);
            $table->boolean('is_loyalty_applied')->default(false);
            $table->foreignId('loyalty_overridden_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index('customer_id');
            $table->index('status');
            $table->index('order_type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
