<!-- Composant Table (enfant) -->
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
            <tr v-for="(item, rowIndex) in rows" :key="item.id">
                <td v-for="col in columns" :key="col.key" :class="col.etat ? 'td-fixed' : ''">
                    <!-- Si la colonne est éditable -->
                    <template v-if="col.editable">
                        <select 
                            v-if="col.type == 'select'" 
                            class="form-control" 
                            v-model="rows[rowIndex][col.key]" 
                            :disabled="item.etat == 2 || item.etat == 4 || item.etat == 1 ? true : false"
                            @change="onEditableFieldChange(rowIndex, col.key, rows[rowIndex][col.key]), updateData2">
                            <option v-for="option in col.options" :key="option.value" :value="option.value">{{ option.label }}</option>
                            <option v-if="col.autre" value="autre">Autre...</option>
                        </select>
                        <textarea 
                            v-else-if="col.type == 'textarea'" 
                            rows="2" 
                            class="form-control" 
                            :placeholder="col.placeholder ? col.placeholder : col.label" 
                            :disabled="item.etat == 2 || item.etat == 4 || item.etat == 1 ? true : false" 
                            v-model="rows[rowIndex][col.key]"
                            @input="onEditableFieldChange(rowIndex, col.key, rows[rowIndex][col.key]),updateData2">
                        </textarea>
                        <input 
                            v-else
                            :value="col.key === 'totalR' ? (rows[rowIndex].qte * rows[rowIndex].prixR) : rows[rowIndex][col.key]"
                            :type="col.type ? col.type : 'text'"
                            :min="col.min ? col.min : ''"
                            class="form-control"
                            :placeholder="col.placeholder ? col.placeholder : col.label"
                            :disabled="item.etat == 2 || item.etat == 4 || item.etat == 1 ? true : false"
                            v-model="rows[rowIndex][col.key]"
                            @input="onEditableFieldChange(rowIndex, col.key, rows[rowIndex][col.key]),updateData2"
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
                                    <!-- Si on a besoin d'un modal et validation -->
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
                    <!-- Si la colonne est normale sans validation mais modal -->
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
                    <input v-else
                        :type="col.type ? col.type : 'text'"
                        :min="col.min ? col.min : ''"
                        class="form-control"
                        :placeholder="col.placeholder ? col.placeholder : col.label"
                        :disabled="col.disabled ? col.disabled : false"
                        v-model="rowsInput[rowIndex][col.key]"
                        @input="updateData"
                    />
                </td>
                <!-- Bouton supprimer pour add new item in the purchase table -->
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

    <!-- Si tableau vide faire une loading -->
    <div v-if="rows.length <= 0 && !tableinputadd">
        <Loading dataload="des données"></Loading>
    </div>

    <!-- Modals existantes... -->
    <!-- Modal de modification type 1 -->
    <Modal v-for="item in rows" :id="'mod1' + item.id" :title="'Modifier ' + title_modal_edit">
        <slot name="modal1" :item="item"></slot>
    </Modal>
    <!-- Modal de suppression type 2 -->
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


    <!-- Modal d'archivage type 3 -->
    <Modal v-for="item in rows" :id="'mod3' + item.id" :title="item.etat_del ? 'CONFIRMER LE DESARCHIVAGE ?' : 'ÊTES-VOUS SÛR DE VOULOIR ARCHIVER ?'">
        <div class="text-center">
            <button class="btn btn-secondary" data-bs-dismiss="modal" @click="deleteItem2(item.id, item.etat_del)">
                {{ item.etat_del ? 'Désarchiver' : 'Archiver' }}
            </button>
            <button class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
        </div>
    </Modal>

    <!-- Modal neutre type 4 -->
    <Modal v-for="item in rows" :id="'mod4' + item.id" :title="title_modal_neutre">
        <slot name="modal4" :item="item"></slot>
    </Modal>
    <!-- Alert pour les notifications -->
    <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
</template>

<script setup>
import { ref, watch } from "vue";

// Services
const supabase = useSupabaseClient()

// Props
const props = defineProps({
    rows: {
        type: Array,
        default: []
    },
    columns: {
        type: Array,
        required: true
    },
    showActions: {
        type: Boolean,
        default: true
    },
    type_but_link: {
        type: Boolean,
        default: false
    },
    but_link_path: {
        type: String,
        default: ''
    },
    type_but_modal: {
        type: Boolean,
        default: false
    },
    name_but_action: {
        type: String,
        default: ''
    },
    actions: {
        type: Array,
        default: []
    },
    tableinputadd: {
        type: Boolean,
        default: false
    },
    addRow: {
        type: Boolean,
        default: false
    },
    autre: {
        type: Boolean,
        default: false
    },
    but_Validation: {
        type: Boolean,
        default: false
    },
    modal_but: {
        type: Boolean,
        default: false
    },
    title_modal_edit: {
        type: String,
    },
    tableDelete: {
        type: String,
        default: ''
    },
    title_modal_neutre: {
        type: String,
        default:'Need a title'
    }
})

// Déclaration des événements
const emit = defineEmits([
    'recovery_data', 
    'delete', 
    'load_data', 
    'update_table_data', 
    'validation_action',
    'editable_field_change',
    'function_but_neutre'
])

// DATA
// Alert system
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: '' // success, error, warning, info
})

// Reactive variables
const rowsInput = ref([]); // reactive pour Vue

// Stocker les données éditables modifiées pour chaque ligne
const editableData = ref({});

// WATCH pour surveiller les changements dans rowsInput
watch(rowsInput, (newValue) => {
    // Calculer les totaux automatiquement
    newValue.forEach(row => {
        if (row.qte && row.prix) {
            row.total = row.qte * row.prix;
        }
        if (row.qte && row.prixR) {
            row.totalR = row.qte * row.prixR;
        }
    });
}, { deep: true });

// METHODES //

// Nouvelle méthode pour gérer les actions de validation
const handleValidationAction = (actionType, item, rowIndex) => {
    // Récupérer toutes les données éditables de cette ligne
    const editableRowData = getEditableDataForRow(item, rowIndex);
    
    // Émettre l'événement avec le type d'action, l'item original et les données éditables
    emit('validation_action', {
        action: actionType,
        item: item,
        editableData: editableRowData,
        rowIndex: rowIndex
    });
};

// Méthode pour récupérer les données éditables d'une ligne spécifique
const getEditableDataForRow = (item, rowIndex) => {
    const editableFields = {};
    
    // Parcourir toutes les colonnes pour identifier celles qui sont éditables
    props.columns.forEach(col => {
        if (col.editable) {
            editableFields[col.key] = props.rows[rowIndex][col.key];
        }
    });
    
    return {
        id: item.id,
        rowIndex: rowIndex,
        fields: editableFields
    };
};

// Méthode pour tracker les changements dans les champs éditables
const onEditableFieldChange = (rowIndex, fieldKey, value) => {
    if (!editableData.value[props.rows[rowIndex].id]) {
        editableData.value[props.rows[rowIndex].id] = {};
    }
    
    editableData.value[props.rows[rowIndex].id][fieldKey] = value;
    
    // Émettre l'événement de changement
    emit('editable_field_change', {
        itemId: props.rows[rowIndex].id,
        rowIndex: rowIndex,
        fieldKey: fieldKey,
        value: value,
        allEditableData: editableData.value[props.rows[rowIndex].id]
    });
};

// Méthode pour émettre les données vers le parent
const updateData = () => {
    // Calculer les totaux avant d'émettre
    rowsInput.value.forEach(row => {
        if (row.qte || row.prix) {
            row.total = (row.qte ? row.qte : 0) * (row.prix ? row.prix : 0);
        }
    });
    emit('update_table_data', [...rowsInput.value]);
};

const updateData2 = () => {
    // Calculer les totaux avant d'émettre
    rowsInput.value.forEach(row => {
        if (row.qte || row.prixR) {
            row.totalR = (row.qte ? row.qte : 0) * (row.prixR ? row.prixR : 0);
        }
    });
};
// Ajouter une nouvelle ligne vide
const addRowFunction = () => {
    const newRow = {};
    props.columns.forEach((col) => {
        if (col.key === 'num') {
            newRow['num'] = rowsInput.value.length + 1; // Auto-increment ID
        } else {
            newRow[col.key] = ''; // Initialiser les autres champs à vide
        }
    })
    rowsInput.value.push(newRow);
};

// Supprimer une ligne
const removeRow = (index) => {
    rowsInput.value.splice(index, 1);
    for (let i = 0; i < rowsInput.value.length; i++) {
        rowsInput.value[i].num = i + 1; // Réinitialiser les IDs
    }
};

// Méthode pour exposer les données (utilisable par le parent via ref)
const getTableData = () => {
    return [...rowsInput.value];
};

// Méthode pour récupérer toutes les données éditables modifiées
const getAllEditableData = () => {
    return editableData.value;
};

// Supprimer un élément
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
        throw error
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
        throw error
    }
};

// Afficher une alerte
const showAlert = (message, title, type) => {
    alert.value = {
        show: true,
        message,
        title,
        type
    }

    // Auto-hide après 5 secondes
    setTimeout(() => {
        alert.value.show = false
    }, 5000)
}

// Condition sur le style
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

// Exposition des fonctions pour qu'elles soient accessibles depuis le parent
defineExpose({
    getTableData,
    getAllEditableData,
    getEditableDataForRow
});
</script>