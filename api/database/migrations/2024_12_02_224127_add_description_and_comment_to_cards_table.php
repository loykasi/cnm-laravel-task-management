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
        Schema::table('cards', function (Blueprint $table) {
            // Thêm cột 'description' sau cột 'order'
            $table->text('description')->nullable()->after('order');

            // Thêm cột 'comment' sau cột 'description'
            $table->text('comment')->nullable()->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->dropColumn(['description', 'comment']);
        });
    }
};
