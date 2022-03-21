<?php

namespace App\Http\Controllers;

use App\Models\Column;
use App\Models\CsvText;
use App\Models\Table;
use App\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CSVController extends Controller
{
    private const TABLE_PREFIX = 'table';
    private const COLUMN_PREFIX = 'column';
    private const FORMAT_DAY_JS = [
        '/HH:mm:ss/',
        '/hh:mm:ss/',
        '/HH:mm/',
        '/hh:mm/',
        '/YYYY\/MM\/DD/',
        '/MM\/DD\/YYYY/',
        '/DD\/MM\/YYYY/',
        '/YYYYMMDD/',
        '/YYYYMD/',
        '/MM\/DD/',
        '/M\/D/',
    ];
    private const FORMAT_CARBON = [
        'H:i:s',
        'h:i:s',
        'H:i',
        'h:i',
        'Y/m/d',
        'm/d/Y',
        'd/m/Y',
        'Ymd',
        'Ynj',
        'm/d',
        '/n/j',
    ];

    public function __construct()
    {
        /**
         * TODO: データ多いと時間かかるので以下試した
         * 以下を全部設定しても、504 Timeout Error になってしまうことがあったので
         * nginx の設定ファイルで fastcgi_read_timeout を 180 とかに設定したら完了したけど、
         * 24カラム 10000 行ちょいくらいで、5分くらいとかかかってた
         * 結論として、foreach で使ってたコレクションのメソッド（firstWhere）がおそかったっぽい
         * 24カラム（暗号化4カラム） 10000 行ちょいくらいで、4秒くらいになった
         */
//        // バルクインサートでイベントが発行されまくって遅くなるのを止める
//        DB::connection()->unsetEventDispatcher();
//        // PHP の最大実効時間を伸ばす
//        set_time_limit(8000000);
//        // メモリの使用量上限を上げる
//        ini_set('memory_limit', '1G');
    }

    /**
     * @param Request $request
     * @return array|Exception
     */
    public function __invoke(Request $request)
    {
        $startTime = microtime(true);
        $initialMemory = memory_get_usage();

        $csv = $request->get('csv');
        $csvText = $request->get('csv_text');
        array_shift($csv);
        $records = $csv;
        $tableName = $request->get('csv_file_name');
        $charset = $request->get('charset');
        $headerColIndexList = $request->get('header_column_index_list');
        $encryptColumns = $request->get('encrypt_columns_index_list');
        $dataTypes = $request->get('data_types');

        try {
            $table = new Table;

            // TODO: ログインユーザーの id を指定
            $userId = User::first()->id;

            // tables テーブルに INSERT
            $newTable = $table->create([
                'name'      => $tableName,
                'charset'   => 1,
                'delimiter' => 1,
                'user_id'   => $userId,
            ]);


            // columns テーブルに INSERT
            $newColumns = new Column;
            foreach ($dataTypes as $dataType) {
                $newColumns->create([
                    'table_id'   => $newTable->id,
                    'col_index'  => $dataType['colIndex'],
                    'name'       => $dataType['value'],
                    'type'       => $dataType['type'],
                    'length'     => in_array($dataType['type'],
                        ['char', 'secret', 'varchar']) ? $dataType['length'] ?? null : null,
//                'min'        => '', ← 別にいらないかも
//                'max'        => '', ← 別にいらないかも
                    'format'     => $dataType['selectedFormat'] ?? null,
                    'encryption' => $dataType['type'] === 'secret',
                ]);
            }

            // csv 記録用テーブルを CREATE
            $this->createTable($this->createTableConfig($newTable->id));

            // csv 記録用テーブルに csv データ投入 INSERT
//            $csvRecorder = $this->tableModel($newTable->id);
//            $columnCollection = Column::where('table_id', $newTable->id)->get();
            $columnCollection = Column::where('table_id', $newTable->id)->get()->toArray();

            $valuesArray = [];
            $values = [];
            $values['csv_text_id'] = ((new CsvText)::create(['table_id' => $newTable->id, 'csv' => $csvText]))->id;
            $importYm = Carbon::now()->format('Ym');
            $importerId = $userId;
            foreach ($records as $rowIndex => $record) {
                foreach ($record as $colIndex => $colValue) {
                    if (!in_array($colIndex, $headerColIndexList, true)) {
                        continue;
                    }
                    if (is_null($colValue)) {
                        $values[self::COLUMN_PREFIX . $colIndex] = null;
                        continue;
                    }
                    [
                        'type'   => $type,
                        'format' => $format,
//                    ] = $columnCollection->firstWhere('col_index', $colIndex); // 遅い
                    ] = $columnCollection[array_search($colIndex,
                        array_column($columnCollection, 'col_index'), true)];

                    $carbonFormat = is_null($format) ?: preg_replace(self::FORMAT_DAY_JS, self::FORMAT_CARBON, $format);

                    /**
                     * FIXME: 日付系の DB のデータ型は全部文字列でいいかも知れない。
                     * m/d のデータなどは、元データにはない Y のデータも付属させないといけないのは問題っぽいので。
                     * フォーマットだけ記録しておけば後で Carbon 使って日付データにできるし、日付にする意味ないかも
                     */
                    $dateFormatForDB = ['date' => 'Y-m-d', 'time' => 'H:i:s', 'datetime' => 'Y-m-d H:i:s'];
                    if (array_key_exists($type, $dateFormatForDB)) {
                        $values[self::COLUMN_PREFIX . $colIndex] =
                            Carbon::createFromFormat($carbonFormat, $colValue)->format($dateFormatForDB[$type]);
                    } elseif ($type === 'secret') {
                        $values[self::COLUMN_PREFIX . $colIndex] = $this->aesEncrypt($colValue);
                    } else {
                        $values[self::COLUMN_PREFIX . $colIndex] = $colValue;
                    }
                }
                // インポートした日の月日（実際には選択させる？、というかデータの周期もデータによって変わりそう。。。）
                $values['import_ym'] = $importYm;
                $values['row'] = $rowIndex + 1;
                // インポート作業をしたユーザーの id
                $values['impoter_id'] = $importerId; // TODO: php artisan migrate --seed しておくこと
//                $values['created_at'] = Carbon::now()->format('Y-m-d HH:mm:ss');
//                $values['updated_at'] = Carbon::now()->format('Y-m-d HH:mm:ss');
                $valuesArray[] = $values;
            }

            // 現状プログラムとは関係無いけど、PHPMyAdmin で csv 記録用テーブル（例：tableN）のみ表示できなかった

            if (count($valuesArray) > 500) {
                foreach (collect($valuesArray)->chunk(500) as $chunk) {
                    DB::table(self::TABLE_PREFIX . $newTable->id)->insert($chunk->toArray());
                }
            } else {
                DB::table(self::TABLE_PREFIX . $newTable->id)->insert($valuesArray);
            }
            // csv 記録用テーブルデータを取得 SELECT
        } catch (Exception $error) {
            return $error;
        }

        $runningTime = microtime(true) - $startTime;
        $usedMemory = (memory_get_peak_usage() - $initialMemory) / (1024 * 1024);

        dump('running time: ' . $runningTime . ' [s]'); // or var_dump()
        dump('used memory: ' . $usedMemory . ' [MB]'); // or var_dump()
        return array_merge(compact('runningTime', 'usedMemory'));
    }

    private function createTableConfig($csvTableId): array
    {
        $config = [
            'table_id' => '',
            'columns'  => [],
        ];
        $csvTable = Table::findOrFail($csvTableId);
        $columns = Column::where('table_id', $csvTableId)->get();
        $config['table_id'] = $csvTable->id;
        foreach ($columns as $column) {
            $type = $column->type;
            $baseMethod = "{$type}Type";
            $config['columns'][] = $this->$baseMethod($column->col_index, $column->length);
        }
        return $config;
    }

    /**
     * tables の id が N 番目のレコードを記録するための tableN を CREATE
     * @param $config
     */
    private function createTable($config): void
    {
        Schema::create(self::TABLE_PREFIX . $config['table_id'],
            static function (Blueprint $table) use ($config) {
                $table->bigIncrements('id');

                // 固有カラム
                foreach ($config['columns'] as $column) {
                    ['method' => $method, 'args' => $args] = $column;
                    $table->$method(...$args)->nullable();
                }

                // 共通カラム
                $table->unsignedInteger('row'); // 行番号
                $table->unsignedBigInteger('csv_text_id'); // csv データテーブルの id
                $table->char('import_ym', 6); // 何年何月インポート分データか
                $table->unsignedBigInteger('impoter_id'); // インポート作業ユーザーの id

                $table->dateTime('created_at')->default(Carbon::now()->format('Y-m-d H:i:s'));
                $table->dateTime('updated_at')->default(Carbon::now()->format('Y-m-d H:i:s'));

                $table->foreign('csv_text_id')->references('id')->on('csv_texts');
                $table->foreign('impoter_id')->references('id')->on('users');
            }
        );
    }

    /**
     * tableN のための
     * Eloquent Model
     * @param $csvTableId
     * @return Model
     */
    public static function tableModel($csvTableId): Model
    {
        $csvTable = Table::findOrFail($csvTableId);
        $columns = Column::where('table_id', $csvTable->id)->get();
        $modelName = self::TABLE_PREFIX . $csvTable->id;
        $defaultFillable = [
            'row',
            'csv',
            'import_ym',
            'importer_id',
        ];
        $fillable = [];
        foreach ($columns as $column) {
            $fillable[] = self::COLUMN_PREFIX . $column->col_index;
        }
        return new class([$modelName, array_merge($fillable, $defaultFillable)]) extends Model {

            public function __construct(array $attributes = [])
            {
                parent::__construct($attributes);
                $this->table = $attributes[0];
                $this->fillable = $attributes[1];
            }
        };
    }

    private function decimalType($columnName, $length = null): array
    {
        return [
            'id'     => $columnName,
            'method' => 'decimal',
            'args'   => [self::COLUMN_PREFIX . $columnName, 65, 4],
        ];
    }

    private function charType($columnName, $length): array
    {
        return [
            'id'     => $columnName,
            'method' => 'char',
            'args'   => [self::COLUMN_PREFIX . $columnName, $length],
        ];
    }

    private function varcharType($columnName, $length = null): array
    {
        return [
            'id'     => $columnName,
            'method' => 'string',
            'args'   => [self::COLUMN_PREFIX . $columnName, 191],
        ];
    }

    private function secretType($columnName, $length = null): array
    {
        return [
            'id'     => $columnName,
            'method' => 'string',
            'args'   => [self::COLUMN_PREFIX . $columnName, 256],
        ];
    }

    private function dateType($columnName, $length = null): array
    {
        return [
            'id'     => $columnName,
            'method' => 'date',
            'args'   => [self::COLUMN_PREFIX . $columnName],
        ];
    }

    private function timeType($columnName, $length = null): array
    {
        return [
            'id'     => $columnName,
            'method' => 'time',
            'args'   => [self::COLUMN_PREFIX . $columnName],
        ];
    }

    private function datetimeType($columnName, $length = null): array
    {
        return [
            'id'     => $columnName,
            'method' => 'datetime',
            'args'   => [self::COLUMN_PREFIX . $columnName],
        ];
    }


    /**
     * 引数に渡したデータをデータベース格納時に暗号化
     *
     * @param ?string $value
     * @return Expression|null
     */
    private function aesEncrypt(?string $value): ?Expression
    {
        if (is_null($value)) {
            return null;
        }
        $key = $this->getAesEncryptKey();

        return DB::raw("HEX(AES_ENCRYPT('$value', '$key'))");
    }

    /**
     * 暗号化キーを取得する。
     *
     * @return string
     */
    private function getAesEncryptKey(): string
    {
        $key = config("app.key");
        return str_replace('base64:', '', $key);
    }

}

