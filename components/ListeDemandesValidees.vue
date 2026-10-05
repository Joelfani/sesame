<template>
    <div class="demandes_validation_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>{{ titre }}</h1>

            <!-- Navigation entre types de demandes -->
            <div v-if="navOptions.length" class="select" style="width: 250px;">
                <select class="form-select" v-model="selectedNav" @change="naviguer">
                    <option
                        v-for="opt in navOptions"
                        :key="opt.value"
                        :value="opt.value"
                        :disabled= "!opt.view"
                    >
                        {{ opt.label }}
                    </option>
                </select>
            </div>
        </div>
        <!-- Filtres -->
        <div class="d-flex align-items-center">
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

        <!-- Tableau -->
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
    </div>
</template>

<script setup>
import { navOptionsCommun } from '~/assets/js/CommonVariable.js'
const userStore = useUserStore()
const props = defineProps({
    titre: {
        type: String,
        default: 'LISTE DES DEMANDES VALIDÉES'
    },
    columns: {
        type: Array,
        required: true
    },
    /** Données déjà filtrées "validées" par le parent */
    rows: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    butLinkPath: {
        type: String,
        required: true
    },
    nameButAction: {
        type: String,
        default: 'Voir'
    },
    filterOptions: {
        type: Array,
        default: () => [
            { value: 'num', label: 'N° d\'enregistrement', key: 'id' },
            { value: 'date', label: 'Date' },
            { value: 'id_user', label: 'Nom', key: 'id_user' }
        ]
    },
    searchPlaceholder: {
        type: String,
        default: 'Rechercher une demande'
    },
    /**
     * Liste déroulante de navigation
     * [{ label: 'Demande d\'achat', value: '/signature' }, ...]
     */
    /*navOptions: {
        type: Array,
        default: () => [VarnavOptions.value]
    },*/
    /** Route courante sélectionnée dans le select */
    currentNav: {
        type: String,
        default: ''
    }
})

const selectedNav = ref(props.currentNav || navOptions.value.find(o => o.view)?.value || '')

watch(
    () => props.currentNav,
    (val) => {
        if (val) selectedNav.value = val
    }
)

const naviguer = () => {
    if (selectedNav.value) navigateTo(selectedNav.value)
}

const choix_filtre = ref(props.filterOptions[0]?.value || 'num')
const search_term = ref('')
const date_debut = ref('')
const date_fin = ref('')
const filtered_rows = ref([])

watch(
    () => props.rows,
    (newRows) => {
        filtered_rows.value = [...(newRows || [])]
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

const navOptions = computed(() => {
    return navOptionsCommun.map(opt => {
        let view = false

        switch (opt.signe) {
            case 'DA':
                // visible pour achat / finance / admin
                view = !!(userStore.achat || userStore.finance || userStore.cheque || userStore.type_compte === 1)
                break
            case 'DRFMS':
                view = !!(userStore.finance || userStore.rh || userStore.cheque || userStore.type_compte === 1)
                break
            case 'NDF':
                view = !!(userStore.finance || userStore.cheque || userStore.type_compte === 1)
                break
            case 'ODM':
                view = !!(userStore.finance || userStore.rh || userStore.cheque || userStore.type_compte === 1)
                break
            case 'BOURSE':
                view = !!(userStore.finance || userStore.dpr || userStore.cheque || userStore.type_compte === 1)
                break
            default:
                view = false
        }

        return { ...opt, view }
    })
})
</script>