<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Obat extends Model
{
    protected $table = 'obats';

    protected $fillable = [
        'nama_obat',
        'satuan',
        'stok',
        'harga',
        'tgl_kadaluarsa',
        'kategori',
    ];

    public function resepDetails(): HasMany
    {
        return $this->hasMany(ResepDetail::class, 'obat_id');
    }
}
