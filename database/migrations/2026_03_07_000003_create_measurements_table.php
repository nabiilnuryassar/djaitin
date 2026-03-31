<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->string('label', 100)->nullable();
            $table->decimal('chest', 6, 2)->nullable();
            $table->decimal('waist', 6, 2)->nullable();
            $table->decimal('hips', 6, 2)->nullable();
            $table->decimal('shoulder', 6, 2)->nullable();
            $table->decimal('sleeve_length', 6, 2)->nullable();
            $table->decimal('shirt_length', 6, 2)->nullable();
            $table->decimal('inseam', 6, 2)->nullable();
            $table->decimal('trouser_waist', 6, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('measurements');
    }
};
