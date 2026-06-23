<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resep extends Model
{
    protected $table = 'reseps';

    protected $fillable = [
        'rekam_medis_id',
        'status',
    ];

    public function rekamMedis(): BelongsTo
    {
        return $this->belongsTo(RekamMedis::class, 'rekam_medis_id');
    }

    public function details(): HasMany
    {
        return $this->hasMany(ResepDetail::class, 'resep_id');
    }
}
