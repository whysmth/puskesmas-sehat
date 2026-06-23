<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembayarans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kunjungan_id')->constrained('kunjungans')->onDelete('cascade');
            $table->decimal('total_tindakan', 10, 2);
            $table->decimal('total_obat', 10, 2);
            $table->decimal('total_bayar', 10, 2);
            $table->enum('metode_bayar', ['tunai', 'debit', 'bpjs'])->default('tunai');
            $table->enum('status', ['belum_bayar', 'lunas'])->default('belum_bayar');
            $table->foreignId('kasir_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayarans');
    }
};
