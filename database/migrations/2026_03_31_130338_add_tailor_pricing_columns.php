<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('garment_models', function (Blueprint $table) {
            $table->decimal('base_price', 15, 2)->default(0)->after('image_path');
        });

        Schema::table('fabrics', function (Blueprint $table) {
            $table->decimal('price_adjustment', 15, 2)->default(0)->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('garment_models', function (Blueprint $table) {
            $table->dropColumn('base_price');
        });

        Schema::table('fabrics', function (Blueprint $table) {
            $table->dropColumn('price_adjustment');
        });
    }
};
