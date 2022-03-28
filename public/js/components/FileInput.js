const template = `
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
`;

const {defineComponent} = VueCompositionAPI;

export default defineComponent({
    name: 'FileInput',
    template,
    setup(_, {emit}) {
        const updateTable = (data) => emit('updateTable', data);
        return {updateTable};
    },
});