<template>
    
        <table class="table table-borderless table-striped ">
            <thead class="table-header">
                <tr>
                    <th  v-for="col in columns" :key="col.key" :style="col.style? col.style : ''">
                    {{ col.label }}
                    </th>
                    <th v-if="showActions">Actions</th>
                </tr>
            </thead>
            <tbody v-if ="tableinput == false">
                <tr v-for="item in rows" :key="item.id">
                    <td  v-for="col in columns" :key="col.key" :class="col.etat? 'td-fixed':''"> 
                    {{ item[col.key] }}
                    </td>
                    <td v-if="showActions">
                        <NuxtLink v-if="type_but_link" :to="'demande/' + item.id" class="btn btn-light">{{ name_but_action }}</NuxtLink>
                        <div v-else-if="type_but_modal">
                            <button  v-for="action in actions" :key="action.label" :class="'btn btn-'+action.color">{{ action.label }}</button>
                        </div>
                        
                    </td>
                </tr>
                <tr v-if="rows.length <= 0">
                    <td colspan="100%" class="text-center">Aucune donnée disponible</td>
                </tr>
            </tbody>
            <tbody v-if ="tableinput">
                <tr v-for="(item, rowIndex) in rowsInput" :key="item.id">
                    <td v-for="col in columns" :key="col.key">
                        <select v-if="col.type == 'select'" class="form-control" v-model="rowsInput[rowIndex][col.key]">
                            <option v-for="option in col.options" :key="option.value" :value="option.value">{{ option.label }}</option>
                            <option v-if="col.autre" value="autre">Autre ...</option>
                        </select>
                        <textarea v-else-if="col.type == 'textarea'" rows="2"  class="form-control" :placeholder="col.placeholder ? col.placeholder : col.label" :disabled="col.disabled ? col.disabled : false" v-model="rowsInput[rowIndex][col.key]"></textarea>
                        <input v-else
                            :value="col.key === 'total' ? (rowsInput[rowIndex].qte * rowsInput[rowIndex].prix) : rowsInput[rowIndex][col.key]"
                            :type="col.type ? col.type : 'text'"
                            :min="col.min? col.min : ''"
                            class="form-control"
                            :placeholder="col.placeholder ? col.placeholder : col.label"
                            :disabled="col.disabled ? col.disabled : false"
                            v-model="rowsInput[rowIndex][col.key]"
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
</template>
<script setup>
import { ref } from "vue";

// Props
const props = defineProps({
    rows: {
        type: Array,
        default:[]
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
    tableinput: {
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
    }
})
//WATCH//
import { watch } from 'vue';
// Reactive variables
const rowsInput = ref([]); // reactive pour Vue

// METHODES //
    // Ajouter une nouvelle ligne vide
    const addRowFunction = () => {
    const newRow = {};
    props.columns.forEach((col) => {
        if(col.key === 'id') {
            newRow['id'] = rowsInput.value.length + 1; // Auto-increment ID
        }
        else {
            newRow[col.key] = ''; // Initialiser les autres champs à vide
        }
    })
    rowsInput.value.push(newRow);
    };

    // Supprimer une ligne
    const removeRow = (index) => {
        rowsInput.value.splice(index, 1);
        for (let i = 0; i < rowsInput.value.length; i++) {
            rowsInput.value[i].id = i + 1; // Réinitialiser les IDs
        }
    };
</script>