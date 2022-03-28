<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
     * リレーション：tables を１つ持つ
     * @return BelongsTo
     */
    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class, 'id', 'table_id');
    }
}
