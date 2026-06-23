<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TarifLayanan extends Model
{
    protected $table = 'tarif_layanans';

    protected $fillable = [
        'nama_layanan',
        'harga',
    ];
}
