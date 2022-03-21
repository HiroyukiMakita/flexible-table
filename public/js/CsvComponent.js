const template = `
<div class="container">
    <div class="title m-b-md" v-text="text"></div>
    <div class="mb-5">
        <span>
        アップロードされた CSV のうち希望の列をデータベースに保存します。
        <br>
        希望の列はフォーマットとして保存されます。
        </span>
    </div>
    <div v-if="errorMessages.length > 0" class="mb-5 card alert-danger w-70 m-auto">
        <div class="card-body w-30 m-auto" style="text-align: left;" >
            <template v-for="message in errorMessages" >
                <span style="color: red;">{{ message }}</span>
                <br>
            </template>
        </div>
    </div>
    <div class="mb-5">
        <label  for="csv-input" class="form-label"><h2>CSV を選択</h2></label>
        <input 
            id="csv-input" 
            accept="text/csv-schema" 
            class="form-control" 
            type="file" 
            @change="updateTable" 
            style="width: 70%;margin: auto;"
        >
    </div>
    <div v-if="false" class="mb-5" style="width: 70vw;margin: auto;">
        <h2>v-simple-table</h2>
        <v-simple-table
                ligit
                height="60%"
        >
            <template v-slot:default class="table-responsive">
                <thead>
                    <tr>
                        <th
                            v-for="item in tHead"
                            class="text-left"
                            v-text="item"
                            :style="{width: \`\${item.length * 12}px\`}"
                        >
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(outer, outerIndex) in tBody"
                        :key="\`row-\${outerIndex + 1}\`"
                    >
                        <td v-for="(inner, innerIndex) in outer"
                            :key="\`row-\${outerIndex + 1}-col-\${innerIndex + 1}\`"
                            v-text="inner">
                        </td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
    </div>
    <div class="mb-5" style="width: 70vw;margin: auto;">
        <h2>v-data-table<br>文字化けしてないか確認</h2>
        <span>※ 表示確認のため、先頭から6行目までのみを表示します。</span>
        <v-data-table
            :headers="headers"
            :items="bodies"
            :loading="loading"
            fixed-header
            hide-default-footer
            calculate-widths
            disable-sort
        >
        </v-data-table>
    </div>
    <div class="mb-5" style="width: 70%;margin: auto;">
        <h2>Charset の変更</h2>
            <select class="form-select" aria-label="Default select" v-model="selectedCharset">
                <option v-for="(value, key) in CHARSETS" :value="value">{{ key }}</option>
            </select>
        </v-data-table>
    </div>
    <div class="mb-5" style="width: 70%;margin: auto;">
        <h2>項目行の変更</h2>
            <select class="form-select" aria-label="Default select" v-model="headerRecordNumber">
                <option v-for="value in 5" :value="value">{{ value }}</option>
            </select>
    </div>
    <div class="mb-5" style="width: 70%;margin: auto;">
        <label  for="csv-name" class="form-label"><h2>記録するデータの名称を設定</h2></label>
        <input 
            id="csv-name" 
            class="form-control" 
            type="text" 
            placeholder="例: JCBカード決済結果レポート" 
            v-model="csvFileName"
        >
    </div>
    <div class="mb-5" style="width: 70%;margin: auto;">
        <h2>記録する項目名の設定</h2>
        <span>※ Ctrl や Shift を押しながら複数選択可能（ライブラリ使わないならチェックボックスにしとけばよかった感）</span>
        <select 
            class="form-select" aria-label="Default select"  
            :size="\`\${(headerColumns ?? []).length | 1}\`" 
            v-model="selectedHeaderColumns" 
            multiple
        >
            <option 
                v-for="(value, index) in headerColumns" 
                :class="selectedHeaderColumns.some((col) => col.value === value) ? 'selected-multi-selector':'unselected-multi-selector'"
                :key="\`header-set-\${index}\`"
                :value="{colIndex: index, value}"
            >
                {{ value }}
            </option>
        </select>
    </div>
    <div class="mb-5" style="width: 70%;margin: auto;">
        <h2>記録する項目名のうち、暗号化する項目を設定</h2>
        <span>※ Ctrl や Shift を押しながら複数選択可能（ライブラリ使わないならチェックボックスにしとけばよかった感）</span>
        <select 
            class="form-select" 
            aria-label="Default select"  
            :size="\`\${(selectedHeaderColumns ?? []).length | 1}\`" 
            v-model="selectedEncryptHeaderColumns" 
            multiple
        >
            <option 
                v-for="({value, colIndex}, index) in selectedHeaderColumns" 
                :class="selectedEncryptHeaderColumns.some((col) => col.value === value) ? 'selected-multi-selector':'unselected-multi-selector'"
                :key="\`encrypt-set-\${colIndex}\`"
                :value="{colIndex, value}"
            >
                {{ value }}
            </option>
        </select>
    </div>
    <div class="mb-5" style="width: 70%;margin: auto;">
        <h2>記録する項目（データ）ごとのデータタイプの変更</h2>
        <span>※ 現状「記録する項目」とか「暗号化する項目」をいじると値が消えたりしてしまうので<br>「アップロード」前に確認が必要。<br></span>
        <span>TODO: 値は消えないようにする</span>
            <table class="table mt-3">
                <thead>
                    <tr>
                        <td style="width: 16%;">項目（データ）名</td>
                        <td style="width: 18%;">データタイプ</td>
                        <td style="width: 18%;"></td>
                        <td style="width: 18%;"></td>
                    </tr>
                </thead>
                <tbody>
                    <tr 
                        v-for="{value, colIndex} in selectedHeaderColumns" 
                        :key="\`data-type-selector-\${colIndex}\`"
                    >
                        <td style="width: 30%;">{{ value }}</td>
                        <td style="width: 22%;">
                            <select 
                                class="form-select" 
                                aria-label="Default select" 
                                v-model="selectedDataType[colIndex]"
                                :disabled="
                                    selectedDataType[colIndex]?.type === 'secret'
                                    && selectedEncryptHeaderColumns.map(
                                        (encryptColumn) => encryptColumn.colIndex
                                    ).includes(colIndex)
                                "
                                :key="\`data-type-selector-\${colIndex}\`"
                            >
                                <option
                                    v-for="dataType in DATA_TYPES"
                                    :value="{
                                        colIndex, 
                                        value, 
                                        ...dataType, 
                                        selectedFormat: (selectedDataType[colIndex]?.selectedFormat ?? undefined), 
                                        length: (selectedDataType[colIndex]?.length ?? 0)
                                    }"
                                    :key="\`data-type-option-\${dataType.label}\`"
                                    :selected="dataType.type === selectedDataType[colIndex]?.type"
                                >
                                {{ dataType.label }}
                                </option>
                            </select>
                        </td>
                        <template v-if="selectedDataType.length > 0">
                            <td 
                                v-if="
                                    typeof selectedDataType[colIndex]?.format !== 'undefined' 
                                    && ['date', 'time', 'datetime'].some(
                                        (type) => selectedDataType[colIndex]?.type === type
                                    )
                                " 
                                :key="\`data-type-detail-selector-\${colIndex}-date\`"
                                style="width: 48%;"
                            >
                                <select 
                                    class="form-select" 
                                    aria-label="Default select" 
                                    v-model="selectedDataType[colIndex].selectedFormat"
                                >
                                    <option
                                        v-for="(formatString, formatIndex)
                                            in Object.values(DATA_TYPES).filter(
                                                (dataType) => selectedDataType[colIndex]?.type === dataType.type
                                            )[0].format
                                        "
                                        :value="formatString"
                                        :key="\`date-type-option-\${formatIndex}\`"
                                    >
                                    {{ formatString }}（例: {{ today.format(formatString) }}）
                                    </option>
                                </select>
                            </td>
                            <td v-else-if="typeof selectedDataType[colIndex]?.length === 'number' 
                                && selectedDataType[colIndex]?.type === 'char'"
                                :key="\`data-type-detail-selector-\${colIndex}-char\`"
                                style="width: 48%;"
                            >
                                <select 
                                    class="form-select" 
                                    aria-label="Default select" 
                                    v-model="selectedDataType[colIndex].length"
                                >
                                    <option
                                        v-for="(charCount, charIndex) in 30"
                                        :value="charCount"
                                        :key="\`date-type-option-\${charIndex}\`"
                                    >
                                    {{ charCount }}
                                    </option>
                                </select>
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </v-data-table>
    </div>
    <button type="button" @click="upload" class="btn btn-primary btn-lg" style="color: white;">アップロード</button>
</div>
`;

const {toRefs, ref, reactive, defineComponent, onMounted, computed, watch} = VueCompositionAPI;

export default defineComponent({
    name: 'CsvComponent',
    template,
    props: {uploadCsvUrl: String},
    setup(props) {
        const {uploadCsvUrl} = toRefs(props);

        const CHARSETS = ref({
            'UTF-8': 'utf-8',
            'Shift-JIS': 'sjis',
        });
        const TIME_FORMAT = [
            'HH:mm:ss',
            'hh:mm:ss',
            'HH:mm',
            'hh:mm',
        ];
        const DATE_FORMAT = [
            'YYYY/MM/DD',
            'MM/DD/YYYY',
            'DD/MM/YYYY',
            'YYYYMMDD',
            'YYYYMD',
            'MM/DD',
            'M/D'
        ];
        const DATETIME_FORMAT = DATE_FORMAT.reduce(
            (array, dateFormat) => {
                TIME_FORMAT.forEach((timeFormat) => {
                    array.push(`${dateFormat} ${timeFormat}`);
                });
                return array;
            }, []
        );
        const DATA_TYPES = ref({
            // CHAR(length)
            char: {label: '文字列（桁数指定）', type: 'char', length: 0, format: undefined},
            /**
             * VARCHAR(256) 暗号化
             * MySQL の関数で暗号化すると 100 文字が 256 文字になる計算なので MAX 100 文字まで
             */
            secret: {label: '文字列（暗号化）', type: 'secret', length: 100, format: undefined},
            /** VARCHAR(191)
             * DB の charset が utf8mb4の場合、
             * MySQL v5.7.7 以下、MariaDB 10.2.2 以下では UNIQUE にできないので 191 しておく
             * 多分 UNIQUE にしないけど。
             * 暗号化関係なく、普通に文字列は 1 データ MAX 100 文字までで良いかも。
             */
            varchar: {label: '文字列', type: 'varchar', length: 191, format: undefined},
            // DECIMAL(65, 4)
            decimal: {label: '数値', type: 'decimal', length: {m: 65, d: 4}, format: undefined},
            // DATE
            date: {label: '日付', type: 'date', length: undefined, format: DATE_FORMAT},
            // TIME
            time: {label: '時刻', type: 'time', length: undefined, format: TIME_FORMAT},
            // DATETIME
            datetime: {label: '日時', type: 'datetime', length: undefined, format: DATETIME_FORMAT},
        });

        const today = reactive(dayjs());
        const loading = ref(false);
        const text = ref('"Create table" from CSV');
        const tHead = ref([]);  // v-simple-table（使ってない）
        const tBody = ref([]);  // v-simple-table（使ってない）
        const headers = ref([]);
        const bodies = ref([]);
        const csv = ref([]);
        const csvText = ref('');
        const csvFileName = ref('');
        const selectedHeaderColumns = ref([]);
        const selectedEncryptHeaderColumns = ref([]);
        const selectedDataType = ref([]);
        const selectedCharset = ref(CHARSETS.value['Shift-JIS']);
        const headerRecordNumber = ref(1);
        const errorMessages = ref([]);


        onMounted(() => {
            console.log('mouted.', uploadCsvUrl);
            console.log('today.', today);
            console.log('today.format()', today.format('YYYY-MM-DD'));
        });

        /**
         * 文字コードが変更されたら
         * csv ファイル再読み込み
         */
        watch(selectedCharset, () => {
            const data = document.getElementById('csv-input')?.files[0] ?? undefined;
            if (typeof data === 'undefined') {
                return;
            }
            console.log('【changed selectedCharset】inputData: ', data);
            updateTable({target: {files: [data]}});
        });

        /**
         * 項目行が何行目かが変更されたら、
         * csv ファイル再読み込み
         */
        watch(headerRecordNumber, () => {
            const data = document.getElementById('csv-input')?.files[0] ?? undefined;
            if (typeof data === 'undefined') {
                return;
            }
            console.log('【changed headerRecordNumber】inputData: ', data);
            updateTable({target: {files: [data]}});
        });

        /**
         * csv データ読み込み処理（ついでにファイル名も取得してる）
         * @param fileChangeEvent
         * @return {Promise<unknown>}
         */
        const readFile = async (fileChangeEvent) => {
            return await new Promise((resolve) => {
                const file = fileChangeEvent.target.files[0];
                let fileReader = new FileReader();

                fileReader.onload = (e) => {
                    csvFileName.value = file.name;
                    resolve(fileReader.result);
                };
                fileReader.readAsText(file, selectedCharset.value);
            });
        };

        const csvInput = computed(() => {
            // これは computed で動かない
            return document.getElementById('csv-input');
        });

        /**
         * v-data-table 用の項目行オブジェクト整形
         *
         * width でカラム幅指定（各データで一番多い文字数 + 3文字数分）
         * @param header
         * @param body
         * @return {*}
         */
        const formatHeaders = (header, body) => header.map((headerColumn, index) => {
            let bodyColumnMaxLength = 0;
            body.forEach((bodyRecord) => {
                bodyRecord.forEach((bodyColumn, columnNumber) => {
                    index === columnNumber
                    && bodyColumn.length > bodyColumnMaxLength
                    && (bodyColumnMaxLength = bodyColumn.length);
                });
            });
            return {
                text: headerColumn,
                value: `_${headerColumn}`,
                width: `${(headerColumn.length > bodyColumnMaxLength ? headerColumn.length : bodyColumnMaxLength) + 3}rem`
            };
        });

        /**
         * v-data-table 用のデータ整形
         * @param header
         * @param body
         * @return {*}
         */
        const formatBodies = (header, body) => body.map((val) => {
            const record = {};
            val.forEach((bValue, index) => {
                formatHeaders(header, body).forEach((v, i) => {
                    index === i && (record[v.value] = bValue);
                });
            });
            return record;
        });

        /**
         * csv ファイル選択でファイルインポート
         * プロパティ csv に 2 次元配列でセット
         *
         * 以下は v-data-table 用の値
         * headers 項目行
         * bodies 各データ行
         * @param data
         */
        const updateTable = (data) => {
            console.log('change event:', data);
            initTable();
            if ((data?.target?.files ?? []).length === 0) {
                return;
            }
            loading.value = true;
            setTimeout(() => {
                readFile(data).then(documentValue => {
                    csvText.value = documentValue;
                    console.log('csvText: ', documentValue);
                    const csvParseCinfig = {skipEmptyLines: true};
                    console.log('csv: ', Papa.parse(documentValue, csvParseCinfig));

                    csv.value = Papa.parse(documentValue, csvParseCinfig).data;
                    if (headerRecordNumber.value > 1) {
                        const _csv = JSON.parse(JSON.stringify(csv.value));
                        [...Array(headerRecordNumber.value - 1)].forEach(
                            (_) => _csv.shift()
                        );
                        csv.value = _csv;
                    }
                    const csvCache = JSON.parse(JSON.stringify(csv.value));
                    tHead.value = csvCache.shift();
                    tBody.value = csvCache.length > 5 ? csvCache.slice(0, 5) : csvCache;
                    headers.value = formatHeaders(tHead.value, tBody.value);
                    bodies.value = formatBodies(tHead.value, tBody.value);

                    console.log('headers.value: ', headers.value);
                    console.log('bodies.value: ', bodies.value);
                    console.log('csv.value: ', csv.value);

                    loading.value = false;
                });


            }, 0);
        };

        /**
         * csv プレビュー用テーブル初期化
         */
        const initTable = () => {
            csv.value = [];
            csvFileName.value = '';
            selectedHeaderColumns.value = [];
            selectedEncryptHeaderColumns.value = [];
            selectedDataType.value = [];
            [headers, bodies].forEach((ref) => ref.value = []);
            resetError();
        };

        // computed(() => {
        //     loading.value && [headers, bodies].every((ref) => (ref?.value ?? []).length === 0) && (loading.value = false);
        // });

        /**
         * エラーリセット
         * @return void
         */
        const resetError = () => {
            errorMessages.value = [];
        };

        /**
         * 項目行データの配列
         */
        const headerColumns = computed(() => headers.value.map((header) => header.text));

        /**
         * csv データ送信
         * @return {Promise<void>}
         */
        const upload = async () => {
            resetError();
            if (csv.value.length === 0) {
                errorMessages.value.push('※ csv ファイルを選択してください');
            }
            if (csvFileName.value === '') {
                errorMessages.value.push('※ 記録するデータの名称を入力してください');
            }
            if (selectedHeaderColumns.value.length === 0) {
                errorMessages.value.push('※ 記録する項目名を選択してください');
            }
            if (errorMessages.value.length > 0) {
                return;
            }

            const response = await axios.post(uploadCsvUrl.value, {
                csv_file_name: csvFileName.value,
                charset: selectedCharset.value,
                csv: csv.value,
                csv_text: csvText.value,
                header_column_index_list: selectedHeaderColumns.value.map((column) => column.colIndex),
                encrypt_columns_index_list: selectedEncryptHeaderColumns.value.map((column) => column.colIndex),
                data_types: selectedDataType.value.filter((column) => typeof (column ?? undefined) !== 'undefined'),
            });
            if (response.status === 200) {
                // initTable();
            }
            console.log(response);
        };

        // for debug CompositionAPI は VueDevtools 見れない
        // watch(selectedHeaderColumns, () => console.log('selectedHeaderColumns: ', JSON.stringify(selectedHeaderColumns.value, null, '\t')));
        // watch(selectedDataType, () => console.log('selectedDataType: ', JSON.stringify(selectedDataType.value, null, '\t')), {deep: true});
        watch(selectedHeaderColumns, () => {
            const selectedEncryptColumnList = selectedEncryptHeaderColumns.value.map((header) => header.colIndex);
            selectedHeaderColumns.value.map((headerColumn) => {
                if (selectedEncryptColumnList.includes(headerColumn.colIndex)) {
                    // 暗号化する項目名に選ばれていたら何もしない;
                    return;
                }
                // 記録する項目名に選ばれたらとりあえず varchar 型に設定（まだデータが設定されていない場合）
                selectedDataType.value.every((selectedData) => selectedData?.colIndex !== headerColumn.colIndex)
                && Vue.set(selectedDataType.value, headerColumn.colIndex, {
                    colIndex: headerColumn.colIndex,
                    value: headerColumn.value,
                    ...DATA_TYPES.value.varchar,
                    selectedFormat: undefined,
                });
            });
            const selectedHeaderColumnList = selectedHeaderColumns.value.map((header) => header.colIndex);
            selectedDataType.value.forEach((dataType) => {
                if (dataType === null || typeof dataType?.colIndex === 'undefined') {
                    return;
                }
                // 設定されているデータ型のうち、記録する項目名から消えたらそのデータ型設定は消す
                if (!selectedHeaderColumnList.includes(dataType.colIndex)) {
                    typeof selectedDataType.value[dataType.colIndex] !== 'undefined'
                    && Vue.delete(selectedDataType.value, dataType.colIndex);
                }
            });
            console.log('selectedHeaderColumns: ', JSON.stringify(selectedHeaderColumns.value, null, '\t'));
        }, {deep: true});

        watch(selectedEncryptHeaderColumns, () => {
            selectedEncryptHeaderColumns.value.map((encryptColumn) => {
                // 暗号化する項目名に選ばれたら secret 型に設定
                Vue.set(selectedDataType.value, encryptColumn.colIndex, {
                    colIndex: encryptColumn.colIndex,
                    value: encryptColumn.value,
                    ...DATA_TYPES.value.secret,
                    selectedFormat: undefined,
                });
            });
            const selectedHeaderColumnList = selectedHeaderColumns.value.map((header) => header.colIndex);
            selectedDataType.value.forEach((dataType) => {
                if (dataType === null || typeof dataType?.colIndex === 'undefined') {
                    return;
                }
                // 設定されているデータ型のうち、記録する項目名から消えたらそのデータ型設定は消す
                if (!selectedHeaderColumnList.includes(dataType.colIndex)) {
                    typeof selectedDataType.value[dataType.colIndex] !== 'undefined'
                    && Vue.delete(selectedDataType.value, dataType.colIndex);
                }
                // 設定されているデータ型のうち、暗号化する項目名から消えたら varchar 型に設定
                if (!selectedEncryptHeaderColumns.value.some((column) => column.colIndex === dataType.colIndex)
                    && selectedHeaderColumnList.includes(dataType.colIndex)) {
                    Vue.set(selectedDataType.value, dataType.colIndex, {
                        colIndex: dataType.colIndex,
                        value: dataType.value,
                        ...DATA_TYPES.value.varchar,
                        selectedFormat: undefined,
                    });
                }
            });
            console.log('selectedEncryptHeaderColumns: ', JSON.stringify(selectedEncryptHeaderColumns.value, null, '\t'));
        }, {deep: true});

        watch(selectedDataType, () => {
            console.log('selectedDataType: ', JSON.stringify(selectedDataType.value, null, '\t'));

        }, {deep: true});

        /**
         * データ型のプロパティが散らかると思うので整形
         */
        const dataTypeFormat = () => {

        };

        /**
         * 指定されたデータ型で成立するかチェック
         */
        const dataTypeChecking = () => {

        };

        const objectEquals = (obj1, obj2) => {
            console.log('obj1: ', obj1, 'obj2: ', obj2);
            console.log('objectEquals: ', JSON.stringify(obj1) === JSON.stringify(obj2));
            return Object.is(obj1, obj2);
        };

        return {
            DATA_TYPES,
            CHARSETS,
            today,
            loading,
            text,
            csvFileName,
            selectedCharset,
            headerRecordNumber,
            tHead,
            tBody,
            headers,
            headerColumns,
            selectedHeaderColumns,
            selectedEncryptHeaderColumns,
            selectedDataType,
            bodies,
            errorMessages,
            objectEquals,
            updateTable,
            upload,
        };
    },
});