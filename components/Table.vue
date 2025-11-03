<!-- Composant Table (enfant) - VERSION CORRIGÉE -->
<template>
    <table class="table table-borderless table-striped">
        <thead class="table-header">
            <tr>
                <th v-for="col in columns" :key="col.key" :style="getStyle(col)">
                    {{ col.label }}
                </th>
                <th v-if="showActions" style="min-width:200px;">Actions</th>
            </tr>
        </thead>
        <!-- Si tableaux pas vide -->
        <tbody v-if="tableinputadd == false">
            <tr v-for="(item, rowIndex) in rowsInput2" :key="item.id">
                <td v-for="col in columns" :key="col.key" :class="col.etat ? 'td-fixed' : ''">
                    <!-- Si la colonne est éditable -->
                    <template v-if="col.editable">
                        <select 
                            v-if="col.type == 'select'" 
                            class="form-control" 
                            v-model="rowsInput2[rowIndex][col.key]" 
                            :disabled="item.etat == 2 || item.etat == 4 || item.etat == 1 ? true : false"
                            @change="changement(rowIndex, col.key, rowsInput2[rowIndex][col.key])">
                            <option v-for="option in col.options" :key="option.value" :value="option.value">{{ option.label }}</option>
                            <option v-if="col.autre" value="autre">Autre...</option>
                        </select>
                        <textarea 
                            v-else-if="col.type == 'textarea'" 
                            rows="2" 
                            class="form-control" 
                            :placeholder="col.placeholder ? col.placeholder : col.label" 
                            :disabled="item.etat == 2 || item.etat == 4 || item.etat == 1 ? true : false" 
                            v-model="rowsInput2[rowIndex][col.key]"
                            @input="changement(rowIndex, col.key, rowsInput2[rowIndex][col.key])">
                        </textarea>
                        <input 
                            v-else-if ="col.type != 'number'"
                            :type="col.type ? col.type : 'text'"
                            :min="col.min ? col.min : ''"
                            class="form-control"
                            :placeholder="col.placeholder ? col.placeholder : col.label"
                            :disabled="item.etat == 2 || item.etat == 4 || item.etat == 1 ? true : col.key == 'totalR'? col.disabled : false"
                            v-model="rowsInput2[rowIndex][col.key]"
                            @input="changement(rowIndex, col.key, rowsInput2[rowIndex][col.key])"
                        />
                        <Cleave
                            v-else
                            class="form-control" 
                            :options="{ 
                                numeral: true, 
                                delimiter: ' ',
                                numeralThousandsGroupStyle: 'thousand' }"
                            :placeholder="col.placeholder ? col.placeholder : col.label"
                            :disabled="item.etat == 2 || item.etat == 4 || item.etat == 1 ? true : col.key == 'totalR'? col.disabled : false"
                            v-model="rowsInput2[rowIndex][col.key]"
                            @input.native="handleCleaveInput($event, rowIndex, col.key)"
                        />
                    </template>
                    <!-- Si la colonne est normale -->
                    <template v-else>
                        <span :style="item.etat == 4 ? 'color:#d19017': item.etat == 1 ? 'color:#29a825': item.etat == 2 ? 'color:red': ''">
                            {{ item[col.key] }}
                        </span>
                    </template>
                </td>
                <td v-if="showActions">
                    <NuxtLink v-if="type_but_link" :to="'/' + but_link_path + item.id" class="btn btn-light">{{ name_but_action }}</NuxtLink>
                    <div v-else-if="type_but_modal">
                        <!-- Si on a besoin d'une validation -->
                        <div v-if="but_Validation">
                            <span v-if="item.etat == 4" style="color: #d19017;">Validation à venir </span>
                            <span v-if="item.etat == 1" style="color: #29a825;">Validé</span>
                            <span v-if="item.etat == 2" style="color: red;">Rejeté</span>
                            <div v-if="item.etat == 0">
                                <span v-for="action in actions" :key="action.label">
                                    <button 
                                        v-if="action.active_modal"
                                        :class="'btn btn-' + action.color" 
                                        style="margin-bottom: 10px; margin-right: 5px;"
                                        data-bs-toggle="modal" 
                                        :data-bs-target="'#mod' + action.type_modal + item.id"
                                        @click="$emit('function_but_neutre',item)" 
                                    >
                                        {{ action.label }}
                                    </button>
                                    <button 
                                        v-else
                                        :class="'btn btn-' + action.color" 
                                        style="margin-bottom: 10px; margin-right: 5px;"
                                        @click="handleValidationAction(action.label, item, rowIndex)">
                                        {{ action.label }}
                                    </button>
                                </span>
                            </div>
                        </div>
                        <!-- Si pas de validation mais modal -->
                        <div v-else>
                            <button 
                                v-for="action in actions" 
                                :key="!action.archive_but ? action.label : item.etat_del ? action.label2 : action.label1" 
                                :class="!action.archive_but ? 'btn btn-' + action.color : item.etat_del ? 'btn btn-' + action.color2 : 'btn btn-' + action.color1" 
                                data-bs-toggle="modal" 
                                :data-bs-target="'#mod' + action.type_modal + item.id"
                                @click="action.label == 'Modifier' ? $emit('recovery_data', item) : ''" 
                                style="margin-bottom: 10px;">
                                {{ action.archive_but ? item.etat_del ? action.label2 : action.label1 : action.label }}
                            </button>
                        </div>
                    </div>
                    <div v-else>
                        <slot name="actions" :item="item"></slot>
                    </div>
                </td>
            </tr>
        </tbody>
        
        <!-- Si tableau input vide -->
        <tbody v-if="tableinputadd">
            <tr v-for="(item, rowIndex) in rowsInput" :key="item.id">
                <td v-for="col in columns" :key="col.key">
                    <select v-if="col.type == 'select'" class="form-control" v-model="rowsInput[rowIndex][col.key]" @change="updateData">
                        <option v-for="option in col.options" :key="option.value" :value="option.value">{{ option.label }}</option>
                        <option v-if="col.autre" value="autre">Autre ...</option>
                    </select>
                    <textarea v-else-if="col.type == 'textarea'" rows="2" class="form-control" :placeholder="col.placeholder ? col.placeholder : col.label" :disabled="col.disabled ? col.disabled : false" v-model="rowsInput[rowIndex][col.key]" @input="updateData"></textarea>
                    <input 
                        v-else-if ="col.type != 'number'"
                        :type="col.type ? col.type : 'text'"
                        :min="col.min ? col.min : ''"
                        class="form-control"
                        :placeholder="col.placeholder ? col.placeholder : col.label"
                        :disabled="col.disabled ? col.disabled : false"
                        v-model="rowsInput[rowIndex][col.key]"
                        @input="updateData"
                    />
                    <Cleave
                        v-else
                        class="form-control" 
                        :options="{
                            numeral: true,
                            delimiter: ' ',
                            numeralThousandsGroupStyle: 'thousand' }"
                        :placeholder="col.placeholder ? col.placeholder : col.label"
                        :disabled="col.disabled ? col.disabled : false"
                        v-model="rowsInput[rowIndex][col.key]"
                        @input.native="handleCleaveInputAdd($event, rowIndex, col.key)"
                    />
                </td>
                <td v-if="showActions">
                    <button class="btn btn-danger" @click="removeRow(rowIndex)">Supprimer</button>
                </td>
            </tr>
            <tr v-if="addRow">
                <td colspan="100%" class="text-center">
                    <button class="btn btn-primary" @click="addRowFunction">+ Ajouter une ligne</button>
                </td>
            </tr>
        </tbody>
    </table>

    <div v-if="rows.length <= 0 && !tableinputadd">
        <Loading dataload="des données"></Loading>
    </div>

    <!-- Modals -->
    <Modal v-for="item in rows" :id="'mod1' + item.id" :title="'Modifier ' + title_modal_edit">
        <slot name="modal1" :item="item"></slot>
    </Modal>
    
    <Modal v-for="item in rows" :id="'mod2' + item.id" title="ÊTES-VOUS SÛR DE VOULOIR SUPPRIMER ?">
        <div class="text-center">
            <h5 style="color: red">Cette action est irréversible !</h5>
            <hr />
            <button class="btn btn-danger" data-bs-dismiss="modal" @click="deleteItem(item.id)">
                Supprimer
            </button>
            <button class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
        </div>
    </Modal>

    <Modal v-for="item in rows" :id="'mod3' + item.id" :title="item.etat_del ? 'CONFIRMER LE DESARCHIVAGE ?' : 'ÊTES-VOUS SÛR DE VOULOIR ARCHIVER ?'">
        <div class="text-center">
            <button class="btn btn-secondary" data-bs-dismiss="modal" @click="deleteItem2(item.id, item.etat_del)">
                {{ item.etat_del ? 'Désarchiver' : 'Archiver' }}
            </button>
            <button class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
        </div>
    </Modal>

    <Modal v-for="item in rows" :id="'mod4' + item.id" :title="title_modal_neutre">
        <slot name="modal4" :item="item"></slot>
    </Modal>
    
    <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import Cleave from 'vue-cleave-component'

const supabase = useSupabaseClient()

const props = defineProps({
    rows: { type: Array, default: [] },
    columns: { type: Array, required: true },
    showActions: { type: Boolean, default: true },
    type_but_link: { type: Boolean, default: false },
    but_link_path: { type: String, default: '' },
    type_but_modal: { type: Boolean, default: false },
    name_but_action: { type: String, default: '' },
    actions: { type: Array, default: [] },
    tableinputadd: { type: Boolean, default: false },
    addRow: { type: Boolean, default: false },
    autre: { type: Boolean, default: false },
    but_Validation: { type: Boolean, default: false },
    modal_but: { type: Boolean, default: false },
    title_modal_edit: { type: String },
    tableDelete: { type: String, default: '' },
    title_modal_neutre: { type: String, default:'Need a title' }
})

const emit = defineEmits([
    'recovery_data', 
    'delete', 
    'load_data', 
    'update_table_data', 
    'validation_action',
    'editable_field_change',
    'function_but_neutre'
])

const alert = ref({
    show: false,
    message: '',
    title: '',
    type: ''
})

const rowsInput = ref([]);
const rowsInput2 = ref([]);
const editableData = ref({});
const isUpdating = ref(false); // FLAG pour éviter les boucles

// CORRECTION 1: Watch avec flush: 'post' et vérification du flag
watch(
    () => props.rows,
    (newRows) => {
        if (newRows && newRows.length > 0 && !isUpdating.value) {
            rowsInput2.value = JSON.parse(JSON.stringify(newRows));
        }
    },
    { immediate: true, deep: true, flush: 'post' }
);

// CORRECTION 3: Méthode pour gérer les inputs Cleave
const handleCleaveInput = (event, rowIndex, fieldKey) => {
    // Récupérer la valeur brute (sans formatage)
    const rawValue = event.target.value.replace(/\s/g, ''); // Enlever les espaces
    const numericValue = parseFloat(rawValue) || 0;
    
    // Mettre à jour la valeur dans rowsInput2
    rowsInput2.value[rowIndex][fieldKey] = numericValue;
    
    // Appeler changement avec la valeur numérique
    changement(rowIndex, fieldKey, numericValue);
}

// CORRECTION 4: Méthode changement simplifiée sans récursion
const changement = (rowIndex, fieldKey, value) => {
    // Convertir la valeur en nombre si c'est une chaîne
    const numericValue = typeof value === 'string' ? (parseFloat(value.replace(/\s/g, '')) || 0) : (value || 0);
    
    // Calculer totalR si nécessaire
    if ((fieldKey === 'qte' || fieldKey === 'prixR') && rowsInput2.value[rowIndex]) {
        const qte = fieldKey === 'qte' ? numericValue : (rowsInput2.value[rowIndex].qte || 0);
        const prixR = fieldKey === 'prixR' ? numericValue : (rowsInput2.value[rowIndex].prixR || 0);
        
        rowsInput2.value[rowIndex].totalR = qte * prixR;
    }
    
    // Tracker le changement
    onEditableFieldChange(rowIndex, fieldKey, numericValue);
}

const handleValidationAction = (actionType, item, rowIndex) => {
    const editableRowData = getEditableDataForRow(item, rowIndex);
    
    emit('validation_action', {
        action: actionType,
        item: item,
        editableData: editableRowData,
        rowIndex: rowIndex
    });
};

const getEditableDataForRow = (item, rowIndex) => {
    const editableFields = {};
    
    props.columns.forEach(col => {
        if (col.editable) {
            editableFields[col.key] = rowsInput2.value[rowIndex][col.key];
        }
    });
    
    return {
        id: item.id,
        rowIndex: rowIndex,
        fields: editableFields
    };
};

const onEditableFieldChange = (rowIndex, fieldKey, value) => {
    const itemId = props.rows[rowIndex]?.id;
    if (!itemId) return;
    
    if (!editableData.value[itemId]) {
        editableData.value[itemId] = {};
    }
    
    editableData.value[itemId][fieldKey] = value;
    
    emit('editable_field_change', {
        itemId: itemId,
        rowIndex: rowIndex,
        fieldKey: fieldKey,
        value: value,
        allEditableData: editableData.value[itemId]
    });
};

const updateData = () => {
    // Calculer les totaux pour rowsInput
    rowsInput.value.forEach(row => {
        if (row.qte && row.prix) {
            row.total = row.qte * row.prix;
        }
    });
    emit('update_table_data', [...rowsInput.value]);
};

const addRowFunction = () => {
    const newRow = {};
    props.columns.forEach((col) => {
        if (col.key === 'num') {
            newRow['num'] = rowsInput.value.length + 1;
        } else {
            newRow[col.key] = '';
        }
    })
    rowsInput.value.push(newRow);
};

const removeRow = (index) => {
    rowsInput.value.splice(index, 1);
    for (let i = 0; i < rowsInput.value.length; i++) {
        rowsInput.value[i].num = i + 1;
    }
};

const getTableData = () => {
    return [...rowsInput.value];
};

const getAllEditableData = () => {
    return editableData.value;
};

const deleteItem = async (id) => {
    try {
        const { error } = await supabase
            .from(props.tableDelete)
            .delete()
            .eq('id', id);

        if (error) throw error
        showAlert('Élément supprimé avec succès', 'Succès', 'success')
    } catch (error) {
        showAlert("Erreur lors de la suppression de l'élément", 'Oups!', 'danger')
        console.error('Error deleting item:', error)
    }
};

const deleteItem2 = async (id, etat) => {
    try {
        const { error } = await supabase
            .from(props.tableDelete)
            .update({ etat_del: etat ? false : true })
            .eq('id', id);

        if (error) throw error
        showAlert(etat ? 'Élément restauré avec succès' : 'Élément archivé avec succès', 'Succès', 'success')
        emit('load_data')
    } catch (error) {
        showAlert("Erreur lors de la suppression de l'élément", 'Oups!', 'danger')
        console.error('Error deleting item:', error)
    }
};

const showAlert = (message, title, type) => {
    alert.value = {
        show: true,
        message,
        title,
        type
    }

    setTimeout(() => {
        alert.value.show = false
    }, 5000)
}

const getStyle = (col) => {
    const defaultStyle = {
        minWidth: col.type === 'select' ? '200px'
            : col.type === 'textarea' ? '300px'
                : col.type === 'number' ? '145px'
                    : col.type === 'date' ? '140px' : '200px',
    }

    return {
        ...defaultStyle,
        ...(col.style || {})
    }
};

defineExpose({
    getTableData,
    getAllEditableData,
    getEditableDataForRow
});
</script>