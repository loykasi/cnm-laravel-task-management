<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username');
            $table->string('google_id')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('profile_img_path')->nullable();
            $table->unsignedBigInteger('role_id')->nullable()->default('2');; // Cột 'creator_id' là khóa ngoại
            $table->foreign('role_id')->references('id')->on('role')->onDelete('cascade');
            $table->timestamps();
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->string('otp', 6)->nullable()->default(null); // Thêm cột otp
            $table->string('status')->default('active'); // Thêm cột status
            $table->string('avatar')->nullable()->default("user.png");
            $table->string('phone')->nullable()->default(null);
            $table->string('address')->nullable(); // Địa chỉ
            $table->text('bio')->nullable()->default(null); // Giới thiệu
            $table->string('job')->nullable()->default(null); // Công việc
            $table->string('aaa')->nullable()->default(null); // Trường aaa
            $table->string('bbb')->nullable()->default(null); // Trường bbb
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};