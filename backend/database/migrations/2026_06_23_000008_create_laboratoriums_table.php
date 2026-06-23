<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laboratoriums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rekam_medis_id')->constrained('rekam_medis')->onDelete('cascade');
            $table->string('jenis_pemeriksaan');
            $table->text('hasil')->nullable();
            $table->enum('status', ['permintaan', 'selesai'])->default('permintaan');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laboratoriums');
    }
};
