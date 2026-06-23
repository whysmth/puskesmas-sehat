<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pasien extends Model
{
    protected $table = 'pasiens';

    protected $fillable = [
        'no_rm',
        'nik',
        'nama',
        'tgl_lahir',
        'jenis_kelamin',
        'alamat',
        'no_hp',
        'jenis_pasien',
        'no_bpjs',
    ];

    public function kunjungans(): HasMany
    {
        return $this->hasMany(Kunjungan::class, 'pasien_id');
    }
}
