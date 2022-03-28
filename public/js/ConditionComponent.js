const template = `
<div class="m-auto p-0">
    <div class="row col-12 d-flex flex-row">
        <div class="d-inline-flex">
            <span class="h2 d-inline-flex">突合する期間の範囲&nbsp;&nbsp;&nbsp;
                <select class="form-select w-auto" aria-label="Default select" v-model="periodYear">
                    <option v-for="(year, index) in periodYears" :value="year">{{ year }}</option>
                </select>&nbsp;
                年&nbsp;
                <select class="form-select w-auto" aria-label="Default select" v-model="periodMonth">
                    <option v-for="(month, index) in periodMonths" :value="month">{{ month }}</option>
                </select>&nbsp;
                月&nbsp;
            </span>
        </div>
    </div>

    <div :class="\`col-\${6 * matchingTableCount} row\`">
        <div :class="\`container col-\${12 / matchingTableCount}\`">
            <h2 class="d-flex mb-3">突合の元とする CSV データ</h2>
            <select class="form-select" aria-label="Default select" v-model="baseTable.tableId">
                <option :value="null">選択してください</option>
                <option v-for="table in baseTables" :value="table.id">{{ table.name }}</option>
            </select>
        </div>
        <div :class="\`container col-\${12 / matchingTableCount}\`">
            <h2 class="d-flex mb-3">突合する CSV データ</h2>
            <select class="form-select" aria-label="Default select" v-model="matchingTable.tableId">
                <option :value="null">選択してください</option>
                <option v-for="table in matchingTables" :value="table.id">{{ table.name }}</option>
            </select>
        </div>
    </div>
    
    <div :class="\`col-\${6 * matchingTableCount} row\`">
        <span class="h2 d-inline-flex">突合する期間を識別する項目</span>
        <div :class="\`container col-\${12 / matchingTableCount}\`">
            <select class="form-select" aria-label="Default select" v-model="baseTable.periodColIndex">
                <option :value="null">選択してください</option>
                <option v-for="column in baseTablePeriodColumnList" :value="column.col_index">{{ column.name }}</option>
            </select>
        </div>
        <div :class="\`container col-\${12 / matchingTableCount} mb-5\`">
            <select class="form-select" aria-label="Default select" v-model="matchingTable.periodColIndex">
                <option :value="null">選択してください</option>
                <option v-for="column in matchingTablePeriodColumnList" :value="column.col_index">{{ column.name }}</option>
            </select>
        </div>
    </div>
    
    <h2 class="ms-2 mb-3">突合条件</h2>
    <!-- TODO: 余裕あれば transition したい -->
    <div class="d-flex flex-row mb-2" v-for="(count, counter) in conditionCount" :key="\`condition-group-\${counter}\`">
        <div :class="\`card col-\${6 * matchingTableCount} row\`" style="max-width: 90vw; margin: auto;">
<!--        <span>&lt;!&ndash; FIXME: for debug &ndash;&gt;突合条件 count：{{ count }}, counter： {{ counter }}, <br> baseTable： {{ JSON.stringify(baseTable, null, '  ') }} <br> matchingTable： {{ JSON.stringify(matchingTable, null, '  ') }}</span>-->
            <div class="card-body row">
                <div :class="\`container col-\${12 / matchingTableCount} \${tableKey === 'matchingTable' && 'ps-4'}\`" v-for="(tableData, tableKey) in {baseTable, matchingTable}" style="text-align: left;" :key="\`\${tableKey}-condition-box\`">
                    <select id="condition-selector" class="form-select w-auto d-inline-flex" aria-label="Default select" v-model="tableData['conditions'][counter]" :key="\`\${tableKey}-condition-\${counter}-selector\`">
                        <option>選択してください</option>
                        <option v-for="(table, index) in tableDataSelectors[tableKey]" :value="changeCondition(tableData['conditions'][counter], table.col_index, table.type, table.length)" :key="\`\${tableKey}-condition-\${counter}-option-\${index}\`">{{ table.name }}</option>
                    </select>
                    <!-- CHAR -->
                    <span v-if="tableData['conditions'][counter]?.colType === 'char'">
                        <button v-if="tableData['conditions'][counter]['condition']['slice'] === 'none'" class="btn btn-light btn-sm" @click="() => tableData['conditions'][counter]['condition'] = {slice: 'first', length: 1}" :key="\`\${tableKey}-condition-\${counter}-type-extend-button\`">桁数指定する</button>
                        <template v-else>
                        <span v-if="['first', 'last'].includes(tableData['conditions'][counter]?.condition?.slice ?? '')">の</span>
                        <select class="form-select w-auto d-inline-flex" aria-label="Default select" v-model="tableData['conditions'][counter]['condition']['slice']" :key="\`\${tableKey}-condition-\${counter}-type-selector\`">
                           <option v-for="(slice, index) in CONDITION_TYPES['char']['condition']['slice']" :value="slice.type" :key="\`\${tableKey}-condition-\${counter}-type-option-\${index}\`">{{ slice.label }}</option>
                        </select>
                        <span v-if="['first', 'last'].includes(tableData['conditions'][counter]?.condition?.slice ?? '')">から</span>
                        <select class="form-select w-auto d-inline-flex" aria-label="Default select" v-model="tableData['conditions'][counter]['condition']['length']" :key="\`\${tableKey}-condition-\${counter}-type-length-selector\`">
                           <option v-for="(length, index) in (tableData['conditions'][counter].colLength - 1)" :value="length" :key="\`\${tableKey}-condition-\${counter}-type-length-option-\${index}\`">{{ length }}</option>
                        </select>
                        <span v-if="typeof tableData['conditions'][counter]?.condition?.length !== 'undefined'">桁</span>
                        </template>
                    </span>
                    <!-- DECIMAL -->
                    <span v-else-if="tableData['conditions'][counter]?.colType === 'decimal'">
                        <button v-if="tableData['conditions'][counter]['condition']['calc'] === 'none'" class="btn btn-light btn-sm" @click="() => tableData['conditions'][counter]['condition']['calc'] = 'sum'" :key="\`\${tableKey}-condition-\${counter}-calc-extend-button\`">計算する</button>
                        <template v-else>
                        <span v-if="['sum'].includes(tableData['conditions'][counter]?.condition?.calc ?? '')">の</span>
                        <select class="form-select w-auto d-inline-flex" aria-label="Default select" v-model="tableData['conditions'][counter]['condition']['calc']" :key="\`\${tableKey}-condition-\${counter}-calc-selector\`">
                           <option v-for="(calc, index) in CONDITION_TYPES['decimal']['condition']['calc']" :value="calc.type" :key="\`\${tableKey}-condition-\${counter}-calc-option-\${index}\`">{{ calc.label }}</option>
                        </select>
                        <span v-if="['sum'].includes(tableData['conditions'][counter]?.condition?.calc ?? '')">&nbsp;キーにする項目</span>
                        <select class="form-select w-auto d-inline-flex" aria-label="Default select" v-model="tableData['conditions'][counter]['condition']['keyColIndex']" :key="\`\${tableKey}-condition-\${counter}-calc-length-selector\`">
                           <option value="undefined">指定しない</option>
                           <option v-for="(table, index) in tableDataSelectors[tableKey]" :value="table.col_index" :key="\`\${tableKey}-condition-\${counter}-calc-length-option-\${index}\`">{{ table.name }}</option>
                        </select>
                        <span class="nav">※「キーにする項目」を指定すると、その項目が一致するデータの合計を突合します</span>
                        </template>
                    </span>
                </div>
            </div>
        </div>
        <div class="flex-column position-relative">
            <!-- FIXME: vuetify の CDN で頑張ってみたけど tooltip が使えない。activator が見つからないのがよく無さそうだけど時間かかるから放置 -->
            <v-tooltip v-if="conditionCount > 1" :key="\`condition-remove-button-\${counter}\`">
                <template v-slot:activator="{ on, attrs }">
                    <i 
                        tabindex="0" 
                        @keydown.space.enter="removeCondition(counter)"
                        @click="removeCondition(counter)"
                        v-bind="attrs"
                        v-on="on"
                        class="button fa-solid fa-circle-minus h2 h-100 d-flex d-flex align-items-center" 
                        style="color: red;">
                    </i>
                </template>
                <span>条件を削除</span>
            </v-tooltip>
            <v-tooltip v-if="conditionCount === (counter + 1)" :key="\`condition-add-button-\${counter}\`">
                <template v-slot:activator="{ on, attrs }">
                    <i 
                        tabindex="0"
                        @keydown.space.enter="addCondition"
                        @click="addCondition"
                        v-bind="attrs"
                        v-on="on"
                        class="button fa-solid fa-circle-plus h2 h-100 d-flex d-flex align-items-center"
                        style="color: limegreen;">
                    </i>
                </template>
                <span>条件を追加</span>
            </v-tooltip>
        </div>
    </div>
        <button type="button" @click="upload" class="btn btn-outline-dark btn-lg"><i class="fa-solid fa-circle-plus">
                    </i>&nbsp;突合するcsvを追加する</button>
    <div class="form-check d-flex justify-content-center mb-2 mt-5">
        <input class="form-check-input" type="checkbox" v-model="saveCondition" :value="saveCondition" id="save-conditions">&nbsp;&nbsp;&nbsp;
        <label class="form-check-label" for="save-conditions">突合条件を保存する</label>
    </div>
    <div v-if="saveCondition" class="form-check m-auto col-6 mb-2">
        <input 
            id="condition-name" 
            class="form-control" 
            type="text" 
            placeholder="突合条件名"
            v-model="conditionName"
        >
    </div>
    <div class="w-100 text-center">
        <button type="button" @click="matching" class="btn btn-primary btn-lg" style="color: white;">突合する</button>
    </div>
</div>
`;

const {toRefs, ref, reactive, defineComponent, onMounted, computed, watch} = VueCompositionAPI;

export default defineComponent({
    name: 'ConditionComponent',
    template,
    props: {
        tables: Array,
        matchingUrl: String,
    },
    emits: ["update:modelValue", "change"],

    setup(props, ctx) {
        const {tables, matchingUrl} = toRefs(props);

        const BASE_TABLE = {
            tableId: null,
            periodColIndex: null,
            conditions: [
                {
                    colIndex: null,
                    colType: undefined,
                    colLength: undefined,
                    condition: undefined,
                }
            ],
        };

        const CONDITION_TYPE_BASES = {
            varchar: undefined,
            secret: undefined,
            char: {
                slice: 'none',
                length: undefined
            },
            decimal: {
                calc: 'none',
                keyColIndex: undefined
            },
            date: undefined,
            time: undefined,
            datetime: undefined,
        };

        const getConditionTypeBase = (type) => cloneObject(CONDITION_TYPE_BASES)[type];

        const CONDITION_TYPES = {
            varchar: {condition: undefined},
            secret: {condition: undefined},
            char: {
                condition: {
                    slice: [
                        {type: 'none', label: '値'},
                        {type: 'first', label: '上'},
                        {type: 'last', label: '下'}
                    ],
                    // value !== undefined の場合に必須
                    length: undefined
                }
            },
            decimal: {
                condition: {
                    calc: [
                        {type: 'none', label: '値'},
                        {type: 'sum', label: '合計'},
                    ],
                    // value !== undefined の場合に必須
                    keyColIndex: undefined
                },
            },
            date: {condition: undefined},
            time: {condition: undefined},
            datetime: {condition: undefined},
        };

        const conditionCount = ref(1);
        const matchingTableCount = ref(2);
        const saveCondition = ref(true);
        const conditionName = ref('');

        const baseTable = reactive(cloneObject(BASE_TABLE));
        const matchingTable = reactive(cloneObject(BASE_TABLE));

        const tableConditionBases = computed(() => {
            return {
                baseTable: [...Array(conditionCount)].map((_, counter) => cloneObject(CONDITION_TYPE_BASES)),
                matchingTable: [...Array(conditionCount)].map((_, counter) => cloneObject(CONDITION_TYPE_BASES))
            };
        });

        const baseTables = computed(() => tables.value.filter((table) => table.id !== matchingTable.tableId));
        const matchingTables = computed(() => tables.value.filter((table) => table.id !== baseTable.tableId));

        const today = dayjs();
        const periodYear = ref(today.format('YYYY'));
        const periodMonth = ref(today.format('MM'));
        const periodYears = [...Array(30)].map((_, index) => today.clone().subtract(index, 'year').format('YYYY'));
        const periodMonths = [...Array(12)].map((_, index) => today.clone().subtract(index, 'month').format('MM'));

        const baseTablePeriodColumnList = computed(() => {
            console.log('baseTablePeriodColumnList');
            return (baseTable.tableId ?? null) === null ? [] : tables.value.find((table) => table.id !== baseTable.tableId).columns.filter((column) => ['date', 'datetime'].includes(column.type));
        });
        const matchingTablePeriodColumnList = computed(() => (matchingTable.tableId ?? null) === null ? [] : tables.value.find((table) => table.id !== matchingTable.tableId).columns.filter((column) => ['date', 'datetime'].includes(column.type)));

        const baseTableSelectors = computed(() => (baseTable.tableId ?? null) === null ? [] : tables.value.find((table) => table.id !== baseTable.tableId).columns);
        const matchingTableSelectors = computed(() => (matchingTable.tableId ?? null) === null ? [] : tables.value.find((table) => table.id !== matchingTable.tableId).columns);
        const tableDataSelectors = computed(() => {
            return {
                baseTable: (baseTable.tableId ?? null) === null ? [] : tables.value.find((table) => table.id !== baseTable.tableId).columns,
                matchingTable: (matchingTable.tableId ?? null) === null ? [] : tables.value.find((table) => table.id !== matchingTable.tableId).columns,
            };
        });

        const changeCondition = (beforeCondition, colIndex, colType, colLength) => {
            const conditions = cloneObject(BASE_TABLE.conditions[0]);
            conditions.colIndex = colIndex;
            conditions.colType = colType;
            conditions.colLength = colLength;
            /**
             * 項目変更時と、condition がまだ設定されていない場合は初期値設定
             * こうしないと v-model の選択が解除される（ハマリポイント）
             */
            conditions.condition = (beforeCondition?.colIndex !== colIndex)
                ? getConditionTypeBase(colType)
                : beforeCondition?.condition ?? getConditionTypeBase(colType);
            return cloneObject(conditions);
        };

        const addCondition = () => {
            ++conditionCount.value;
        };

        const removeCondition = (counter) => {
            debug('remove: ', counter);
            [baseTable, matchingTable].forEach((table) => table.conditions.splice(counter, 1));
            --conditionCount.value;
        };

        watch(saveCondition, () => debug('saveCondition: ', saveCondition.value), {deep: true});
        watch(baseTable, () => {
            debug('baseTable:', baseTable);
        }, {deep: true});
        watch(matchingTable, () => debug('matchingTable: ', matchingTable), {deep: true});

        const baseTableMock = reactive({
            "tableId": 2,
            "periodColIndex": 6,
            "conditions": [
                {
                    "colIndex": 6,
                    "colType": "datetime",
                    "colLength": null
                },
                {
                    "colIndex": 0,
                    "colType": "char",
                    "colLength": 4,
                    "condition": {
                        "slice": "none"
                    }
                },
                {
                    "colIndex": 12,
                    "colType": "decimal",
                    "colLength": null,
                    "condition": {
                        "calc": "sum",
                        "keyColIndex": 0
                    }
                }
            ]
        });

        const matchingTableMock = reactive({
            "tableId": 1,
            "periodColIndex": 0,
            "conditions": [
                {
                    "colIndex": 0,
                    "colType": "date",
                    "colLength": null
                },
                {
                    "colIndex": 14,
                    "colType": "varchar",
                    "colLength": 191
                },
                {
                    "colIndex": 4,
                    "colType": "decimal",
                    "colLength": null,
                    "condition": {
                        "calc": "none"
                    }
                }
            ]
        });

        const conditionsMock = reactive({
            periodYear: periodYear.value,
            periodMonth: periodMonth.value,
            saveCondition,
            conditionName,
            baseTable: baseTableMock,
            matchingTable: matchingTableMock,
        });

        const validate = () => {
        };

        const matching = async () => {
            const response = await axios.post(matchingUrl.value, {
                period: `${periodYear.value}${periodMonth.value}`, // YYYYMM
                save_condition: saveCondition.value,
                condition_name: saveCondition.value ? 'conditionName' : undefined,
                base_table: camelToSnakeObject(baseTableMock),
                matching_table: camelToSnakeObject(matchingTableMock),
            });
            console.log(response);
            if (response.status === 200) {
                // 結果ページに 遷移
                // location.href = '/';
            }
        };

        return {
            tables,
            baseTables,
            matchingTables,
            baseTable,
            matchingTable,
            periodYear,
            periodMonth,
            periodYears,
            periodMonths,
            baseTablePeriodColumnList,
            matchingTablePeriodColumnList,
            CONDITION_TYPE_BASES,
            CONDITION_TYPES,
            conditionCount,
            matchingTableCount,
            baseTableSelectors,
            tableDataSelectors,
            matchingTableSelectors,
            saveCondition,
            conditionName,
            addCondition,
            removeCondition,
            matching,
            changeCondition
        };
    },
});