<?php

namespace App\Http\Controllers;

use App\Models\Column;
use App\Models\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConditionController extends Controller
{
    private const TABLE_PREFIX = 'table';
    private const COLUMN_PREFIX = 'column';

    public function __invoke()
    {
        $tables = Table::with(['columns'])->get()->toArray();
        return view('condition', compact('tables'));
    }

    public function matching(Request $request): array
    {
        $baseTableInfo = $request->get('base_table');
        $baseTable = DB::table(self::TABLE_PREFIX . $baseTableInfo['table_id'])->get()->toArray();

        $matchingTableInfo = $request->get('matching_table');
        $matchingTable = DB::table(self::TABLE_PREFIX . $matchingTableInfo['table_id'])->get()->toArray();

        $saveCondition = $request->get('save_condition', false);
        $conditionName = $request->get('condition_name', null);
        $period = $request->get('period'); // Ym

        return $request->all();
//        return compact('baseTable', 'matchingTable', 'saveCondition', 'conditionName', 'period');
    }

    /**
     * tableN のための
     * Eloquent Model
     * @param $csvTableId
     * @return Model
     */
    public function tableModel($csvTableId): Model
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

        /**
         * 無名クラスでモデルを作成したら Eloquent で tableN を操作できると思ったけど
         * 以下のモデルを new したときに SELECT * FROM condition_controllers ～ みたいな感じで
         * 現在の名前空間のクラス名がテーブル名に変換されて適用されてクエリ発行されてるっぽい
         * 無名クラスの名前空間の設定とかクラス名とかを動的に設定できたり、
         * Eloquent のテーブル名解決をいじれればできそうだけど難しそう。
         * 結論 tableN はレコード数も多いしクエリビルダ使ったほうが速度も速そうだし良さそう。
         */
        return new class ([$modelName, array_merge($fillable, $defaultFillable)]) extends Model {

            public static $class;

            public function __construct(array $attributes = [])
            {
                parent::__construct([]);
                if (count($attributes) > 0) {
                    define(__class__, $attributes[0]);
                    $a = self::class;
                    $this->table = $attributes[0];
                    $this->fillable = $attributes[1];
                }
            }
        };
    }
}

