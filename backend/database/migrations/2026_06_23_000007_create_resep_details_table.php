<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resep_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resep_id')->constrained('reseps')->onDelete('cascade');
            $table->foreignId('obat_id')->constrained('obats')->onDelete('cascade');
            $table->integer('jumlah');
            $table->string('dosis');
            $table->string('aturan_pakai');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resep_details');
    }
};
