<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RekamMedis extends Model
{
    protected $table = 'rekam_medis';

    protected $fillable = [
        'kunjungan_id',
        'anamnesa',
        'ttv',
        'diagnosa',
        'kode_icd10',
        'tindakan',
        'dokter_id',
    ];

    protected $casts = [
        'ttv' => 'array',
    ];

    public function kunjungan(): BelongsTo
    {
        return $this->belongsTo(Kunjungan::class, 'kunjungan_id');
    }

    public function dokter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dokter_id');
    }

    public function resep(): HasOne
    {
        return $this->hasOne(Resep::class, 'rekam_medis_id');
    }

    public function laboratoriums(): HasMany
    {
        return $this->hasMany(Laboratorium::class, 'rekam_medis_id');
    }
}
