<!-- components/ListeSuiviGeneric.vue -->
<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>{{ titre }}</h1>

            <button
                v-if="showExport"
                class="btn btn-outline-success"
                style="float: right;"
                @click="$emit('export',filtered_rows)"
            >
                {{ exportLabel }}
            </button>

            <MiniNav
                v-if="showMiniNav"
                :LinkSelected="linkSelected"
                :baseLink="baseLink"
                :viewDRFMS="viewDRFMS"
            />
        </div>

        <!-- Filtres -->
        <div v-if="filterOptions.length" class="d-flex align-items-center">
            <select
                class="form-select mb-3"
                style="width: 250px; margin-right: 10px;"
                v-model="choix_filtre"
            >
                <option
                    v-for="opt in filterOptions"
                    :key="opt.value"
                    :value="opt.value"
                >
                    {{ opt.label }}
                </option>
            </select>

            <template v-if="choix_filtre === 'date'">
                <label style="font-weight: bold; margin-right: 10px;">de :</label>
                <input
                    type="date"
                    class="form-control mb-3"
                    style="width: 200px; margin-right: 10px;"
                    v-model="date_debut"
                    @change="filterByDate"
                >
                <label style="font-weight: bold; margin-right: 10px;">à :</label>
                <input
                    type="date"
                    class="form-control mb-3"
                    style="width: 200px;"
                    v-model="date_fin"
                    @change="filterByDate"
                >
            </template>

            <input
                v-else
                type="search"
                :placeholder="searchPlaceholder"
                class="form-control mb-3"
                style="width: 250px; margin-right: 10px;"
                v-model="search_term"
                @input="filterData"
            >
        </div>

        <div class="table_block_list">
            <Table
                :columns="columns"
                :rows="filtered_rows"
                :type_but_link="true"
                :but_link_path="butLinkPath"
                :name_but_action="nameButAction"
                :loading="loading"
            />
        </div>

        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />
    </div>
</template>

<script setup>
const props = defineProps({
    titre: {
        type: String,
        default: 'SUIVI'
    },
    /** Colonnes du tableau (définies par le parent) */
    columns: {
        type: Array,
        required: true
    },
    /**
     * Données déjà préparées par le parent
     * Chaque ligne doit avoir date_original si filtre date
     */
    rows: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    /** Ex: "suivi/" ou "validation/bourse/" */
    butLinkPath: {
        type: String,
        required: true
    },
    nameButAction: {
        type: String,
        default: 'Voir'
    },
    /**
     * Options de filtre
     * [{ value: 'num', label: 'N°', key: 'id' },
     *  { value: 'date', label: 'Date' },
     *  { value: 'nom', label: 'Nom', key: 'nom_user' }]
     */
    filterOptions: {
        type: Array,
        default: () => [
            { value: 'num', label: 'N° d\'enregistrement', key: 'id' },
            { value: 'date', label: 'Date' }
        ]
    },
    searchPlaceholder: {
        type: String,
        default: 'Rechercher'
    },
    showExport: {
        type: Boolean,
        default: false
    },
    exportLabel: {
        type: String,
        default: 'Exportation'
    },
    showMiniNav: {
        type: Boolean,
        default: false
    },
    linkSelected: {
        type: String,
        default: ''
    },
    baseLink: {
        type: String,
        default: 'suivi'
    },
    viewDRFMS: {
        type: Boolean,
        default: true
    }
})

defineEmits(['export'])

const choix_filtre = ref(props.filterOptions[0]?.value || 'num')
const search_term = ref('')
const date_debut = ref('')
const date_fin = ref('')
const filtered_rows = ref([])

const alert = ref({ show: false, message: '', title: '', type: '' })

// Resync quand le parent recharge les données
watch(
    () => props.rows,
    (newRows) => {
        filtered_rows.value = [...(newRows || [])]
        // réappliquer filtre actif si besoin
        if (choix_filtre.value === 'date') filterByDate()
        else if (search_term.value.trim()) filterData()
    },
    { immediate: true, deep: true }
)

const getFilterKey = () => {
    const opt = props.filterOptions.find(o => o.value === choix_filtre.value)
    return opt?.key || choix_filtre.value
}

const filterData = () => {
    if (!search_term.value.trim()) {
        filtered_rows.value = [...props.rows]
        return
    }

    const term = search_term.value.toLowerCase().trim()
    const key = getFilterKey()

    filtered_rows.value = props.rows.filter(item => {
        const val = item[key]
        if (val === undefined || val === null) return false
        return String(val).toLowerCase().includes(term)
    })
}

const filterByDate = () => {
    if (!date_debut.value && !date_fin.value) {
        filtered_rows.value = [...props.rows]
        return
    }

    filtered_rows.value = props.rows.filter(item => {
        const raw = item.date_original || item.date
        if (!raw) return false
        const itemDate = new Date(raw)
        const debut = date_debut.value ? new Date(date_debut.value) : null
        const fin = date_fin.value ? new Date(date_fin.value) : null

        if (debut && fin) return itemDate >= debut && itemDate <= fin
        if (debut) return itemDate >= debut
        if (fin) return itemDate <= fin
        return true
    })
}

watch(choix_filtre, () => {
    search_term.value = ''
    date_debut.value = ''
    date_fin.value = ''
    filtered_rows.value = [...props.rows]
})
</script>