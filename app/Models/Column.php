<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Column extends Model
{
    protected $table = 'columns';

    protected $fillable = [
        'table_id',
        'col_index',
        'name',
        'type',
        'length',
        'min',
        'max',
        'format',
        'encryption',
    ];


    /**
     * リレーション：csv を１つ持つ
     * @return HasOne
     */
    public function csv(): HasOne
    {
        return $this->hasOne(Csv::class, 'id', 'table_id');
    }
}
