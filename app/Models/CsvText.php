<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CsvText extends Model
{
    protected $table = 'csv_texts';

    protected $fillable = [
        'table_id',
        'csv',
    ];

    /**
     * アクセサ
     * csv データを encrypt
     *
     * @param string $value
     * @return void
     */
    public function setCsvAttribute(string $value): void
    {
        $this->attributes['csv'] = encrypt($value);
    }

    /**
     * ミューテタ
     * csv データを decrypt
     *
     * @param string $value
     * @return string
     */
    public function getCsvAttribute(string $value): string
    {
        return decrypt($value);
    }
}
