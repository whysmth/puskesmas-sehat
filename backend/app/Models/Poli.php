<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Poli extends Model
{
    protected $table = 'polis';

    protected $fillable = [
        'nama_poli',
        'kode_poli',
    ];

    public function kunjungans(): HasMany
    {
        return $this->hasMany(Kunjungan::class, 'poli_id');
    }
}
