<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Laboratorium extends Model
{
    protected $table = 'laboratoriums';

    protected $fillable = [
        'rekam_medis_id',
        'jenis_pemeriksaan',
        'hasil',
        'status',
    ];

    public function rekamMedis(): BelongsTo
    {
        return $this->belongsTo(RekamMedis::class, 'rekam_medis_id');
    }
}
