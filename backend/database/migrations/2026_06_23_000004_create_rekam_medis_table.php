<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rekam_medis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kunjungan_id')->constrained('kunjungans')->onDelete('cascade');
            $table->text('anamnesa');
            $table->json('ttv'); // Tensi, suhu, nadi, respirasi, BB, TB
            $table->string('diagnosa');
            $table->string('kode_icd10')->nullable();
            $table->text('tindakan')->nullable();
            $table->foreignId('dokter_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rekam_medis');
    }
};
