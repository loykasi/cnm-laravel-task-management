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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('ongoing'); // Example: ongoing, completed, etc.
            $table->integer('progress')->default(0);
            $table->string('priority')->default('medium'); // Example: low, medium, high
            $table->date('due_date')->nullable();
            $table->string('owner')->nullable();
            $table->json('tags')->nullable(); // Store tags as JSON array
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};