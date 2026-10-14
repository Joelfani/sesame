<!-- components/ListeValidationDrfme.vue -->
<template>
    <div class="demandes_validation_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>{{ titre }}</h1>

            <MiniNav
                v-if="showMiniNav"
                :LinkSelected="linkSelected"
                :baseLink="baseLink"
            />
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

        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />
    </div>
</template>

<script setup>
import { niveauDRFME } from '~/assets/js/CommonVariable.js'

const props = defineProps({
    titre: {
        type: String,
        default: 'LISTE DES DRFME À VALIDER'
    },
    /** Niveau du validateur (filtre les items à ce niv_val) */
    niveau: {
        type: [Number, String],
        required: true
    },
    /** Si true : uniquement les demandes où id_sup === userStore.id */
    checkSup: {
        type: Boolean,
        default: false
    },
    /** Préfixe du lien "Voir" ex: "validation/drfme/" ou "finance/drfme/" */
    butLinkPath: {
        type: String,
        default: 'validation/drfme/'
    },
    nameButAction: {
        type: String,
        default: 'Voir'
    },
    showMiniNav: {
        type: Boolean,
        default: true
    },
    linkSelected: {
        type: String,
        default: '/validation/drfme'
    },
    baseLink: {
        type: String,
        default: 'validation'
    },
    searchPlaceholder: {
        type: String,
        default: 'Rechercher une DRFME'
    },
    /**
     * Options de filtre
     * [{ value: 'num', label: "N° d'enregistrement", key: 'id' }, ...]
     */
    filterOptions: {
        type: Array,
        default: () => [
            { value: 'num', label: "N° d'enregistrement", key: 'id' },
            { value: 'date', label: 'Date' },
            { value: 'nom', label: 'Nom du demandeur', key: 'demandeur' },
            { value: 'projet', label: 'Projet', key: 'projet' }
        ]
    }
})

const supabase = useSupabaseClient()
const userStore = useUserStore()

const loading = ref(true)
const choix_filtre = ref('num')
const search_term = ref('')
const date_debut = ref('')
const date_fin = ref('')

const liste = ref([])
const filtered_rows = ref([])

const columns = [
    { key: 'id', label: "N° d'enregistrement" },
    { key: 'date', label: 'Date de la demande' },
    { key: 'demandeur', label: 'Demandeur' },
    { key: 'projet', label: 'Projet' },
    { key: 'nb_a_valider', label: "Nb d'articles à valider" }
]

const alert = ref({ show: false, message: '', title: '', type: '' })
const showAlert = (message, title, type) => {
    alert.value = { show: true, message, title, type }
    setTimeout(() => { alert.value.show = false }, 5000)
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

const getValidation = async () => {
    loading.value = true
    try {
        let query = supabase
            .from('ses_obj')
            .select(`
                id,
                date,
                projet,
                id_user,
                id_sup,
                users: id_user ( full_name ),
                ses_items_drfme!inner ( id, niv_val )
            `)
            .eq('cat_proc', 'drfme')
            .eq('ses_items_drfme.niv_val', props.niveau)
            .order('id', { ascending: false })

        if (props.checkSup) {
            query = query.eq('id_sup', userStore.id)
        }

        const { data, error } = await query
        if (error) throw error

        // Une demande peut apparaître plusieurs fois si jointure ; on regroupe par id
        const map = new Map()

        ;(data || []).forEach(row => {
            const items = row.ses_items_drfme || []
            const nb = items.filter(
                i => Number(i.niv_val) === Number(props.niveau)
            ).length

            if (nb === 0) return

            if (!map.has(row.id)) {
                map.set(row.id, {
                    id: row.id,
                    date_original: row.date,
                    date: formatDate(row.date),
                    projet: row.projet || '-',
                    demandeur: row.users?.full_name || 'Nom non trouvé',
                    nb_a_valider: nb
                })
            } else {
                // en cas de lignes dupliquées par la jointure
                const existing = map.get(row.id)
                existing.nb_a_valider = Math.max(existing.nb_a_valider, nb)
            }
        })

        const result = Array.from(map.values())
        liste.value = result
        filtered_rows.value = [...result]
    } catch (error) {
        console.error('Erreur liste DRFME à valider:', error)
        showAlert('Erreur lors du chargement des DRFME', 'Erreur', 'danger')
    } finally {
        loading.value = false
    }
}

const filterData = () => {
    if (!search_term.value.trim()) {
        filtered_rows.value = [...liste.value]
        return
    }

    const term = search_term.value.toLowerCase().trim()
    const opt = props.filterOptions.find(o => o.value === choix_filtre.value)
    const key = opt?.key || 'id'

    filtered_rows.value = liste.value.filter(item => {
        if (choix_filtre.value === 'num') {
            return item.id.toString().includes(term)
        }
        const val = item[key]
        return val != null && String(val).toLowerCase().includes(term)
    })
}

const filterByDate = () => {
    if (!date_debut.value && !date_fin.value) {
        filtered_rows.value = [...liste.value]
        return
    }

    filtered_rows.value = liste.value.filter(item => {
        const itemDate = new Date(item.date_original)
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
    filtered_rows.value = [...liste.value]
})

onMounted(() => {
    getValidation()
})
</script>