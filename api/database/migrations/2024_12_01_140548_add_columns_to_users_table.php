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
        Schema::table('users', function (Blueprint $table) {
            $table->string('address')->nullable(); // Địa chỉ
            $table->text('bio')->nullable()->default(null); // Giới thiệu
            $table->string('job')->nullable()->default(null); // Công việc
            $table->string('aaa')->nullable()->default(null); // Trường aaa
            $table->string('bbb')->nullable()->default(null); // Trường bbb
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('address');
            $table->dropColumn('bio');
            $table->dropColumn('job');
            $table->dropColumn('aaa');
            $table->dropColumn('bbb');
        });
    }
};
