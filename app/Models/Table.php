<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Table extends Model
{
    protected $table = 'tables';

    protected $fillable = [
        'name',
        'charset',
        'delimiter',
        'primary_col_index',
        'user_id',
    ];

    /**
     * リレーション：columns を１つ持つ
     * @return HasMany
     */
    public function columns(): HasMany
    {
        return $this->hasMany(Column::class, 'table_id', 'id');
    }
}
