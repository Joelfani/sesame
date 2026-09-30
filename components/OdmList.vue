<!-- components/ListeValidationOdm.vue -->
<template>
    <div class="demandes_validation_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>{{ titre }}</h1>
            <MiniNav
                :LinkSelected="linkSelected"
                :baseLink="baseLink"
                :viewDRFMS="viewDRFMS"
            />
        </div>

        <!-- Filtres -->
        <div class="d-flex align-items-center">
            <select
                name="choix"
                class="form-select mb-3"
                style="width: 250px; margin-right: 10px;"
                v-model="choix_filtre"
            >
                <option value="num">N° d'enregistrement</option>
                <option value="date">Date</option>
                <option value="id_user">Nom du demandeur</option>
                <option value="objet">Objet de la mission</option>
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
                placeholder="Rechercher un ordre de mission"
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
                :rows="filtered_demandes"
                :type_but_link="true"
                :but_link_path="butLinkPath"
                name_but_action="Voir"
                :loading="loading"
            />
        </div>
    </div>
</template>

<script setup>
// ====================== PROPS ======================
const props = defineProps({
    titre: {
        type: String,
        default: 'LISTE DES ORDRES DE MISSION À VALIDER'
    },
    linkSelected: {
        type: String,
        required: true
    },
    baseLink: {
        type: String,
        required: true
    },
    butLinkPath: {
        type: String,
        required: true
    },
    // Niveau ODM à afficher (ex: niveauODM.superieur)
    niveau: {
        type: [Number, String],
        required: true
    },
    // Si true → filtre id_sup = userStore.id (niveau supérieur)
    checkSup: {
        type: Boolean,
        default: false
    },
    viewDRFMS: {
        type: Boolean,
        default: true
    }
})

// Services
const supabase = useSupabaseClient()
const userStore = useUserStore()

// State
const loading = ref(true)
const choix_filtre = ref('num')
const search_term = ref('')
const date_debut = ref('')
const date_fin = ref('')

const columns = [
    { key: 'id', label: 'N° d\'enregistrement' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'id_user', label: 'Nom du demandeur' },
    { key: 'miss_obj', label: 'Objet de la mission' },
]

const liste_demandes_a_valider = ref([])
const filtered_demandes = ref([])

// ====================== RÉCUPÉRATION ======================
const getValidation = async () => {
    loading.value = true
    try {
        let query = supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name )
            `)
            .eq('cat_proc', 'odm')
            .eq('niv_val', props.niveau)

        if (props.checkSup) {
            query = query.eq('id_sup', userStore.id)
        }

        const { data, error } = await query.order('id', { ascending: false })

        if (error) throw error

        const result = (data || []).map(item => ({
            ...item,
            date_original: item.date,
            date: formatDate(item.date),
            id_user: item.users?.full_name || 'Nom non trouvé',
            miss_obj: item.miss_obj || ''
        }))

        liste_demandes_a_valider.value = result
        filtered_demandes.value = [...result]
    } catch (error) {
        console.error('Erreur lors de la récupération des ODM:', error)
    } finally {
        loading.value = false
    }
}

// ====================== FILTRES ======================
const filterData = () => {
    if (!search_term.value.trim()) {
        filtered_demandes.value = [...liste_demandes_a_valider.value]
        return
    }

    const term = search_term.value.toLowerCase().trim()

    filtered_demandes.value = liste_demandes_a_valider.value.filter(item => {
        switch (choix_filtre.value) {
            case 'num':
                return item.id.toString().includes(term)
            case 'id_user':
                return item.id_user?.toLowerCase().includes(term)
            case 'objet':
                return item.miss_obj?.toLowerCase().includes(term)
            default:
                return true
        }
    })
}

const filterByDate = () => {
    if (!date_debut.value && !date_fin.value) {
        filtered_demandes.value = [...liste_demandes_a_valider.value]
        return
    }

    filtered_demandes.value = liste_demandes_a_valider.value.filter(item => {
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
    filtered_demandes.value = [...liste_demandes_a_valider.value]
})

// ====================== UTILS ======================
const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

// ====================== LIFECYCLE ======================
onMounted(() => {
    getValidation()
})
</script>