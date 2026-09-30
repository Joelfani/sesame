<!-- components/ListeValidationNdf.vue -->
<template>
    <div class="demandes_validation_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>{{ titre }}</h1>
            <MiniNav :viewDRFMS="viewDRFMS" :LinkSelected="linkSelected" :baseLink="baseLink" />
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
                <option value="id_user">Nom</option>
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
                placeholder="Rechercher une note de frais"
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
        default: 'LISTE DES NOTES DE FRAIS À VALIDER'
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
    // Niveau des articles à compter / filtrer
    niveau: {
        type: [Number, String],
        required: true
    },
    viewDRFMS: { 
        type: Boolean, 
        default: true 
    },
    checkSup: {
        type: Boolean,
        default: false
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
    { key: 'nbrnv', label: 'Nombre d\'article non validé' },
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
                users: id_user ( full_name ),
                ses_items_ndf!inner ( id, niv_val )
            `)
            .eq('cat_proc', 'ndf')
            .eq('ses_items_ndf.niv_val', props.niveau)

        if (props.checkSup) {
            query = query.eq('id_sup', userStore.id)
        }

        const { data, error } = await query.order('id', { ascending: false })

        if (error) throw error

        const result = data.map(item => ({
            ...item,
            // Nombre d'articles encore au niveau actuel
            nbrnv: item.ses_items_ndf?.length ?? 0,
            date_original: item.date,
            date: formatDate(item.date),
            id_user: item.users?.full_name || 'Nom non trouvé'
        }))

        // Garder uniquement les NDF qui ont vraiment des articles à valider
        const filtered = result.filter(r => r.nbrnv > 0)

        liste_demandes_a_valider.value = filtered
        filtered_demandes.value = [...filtered]
    } catch (error) {
        console.error('Erreur lors de la récupération des notes de frais:', error)
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

    loading.value = true
    const term = search_term.value.toLowerCase().trim()

    filtered_demandes.value = liste_demandes_a_valider.value.filter(item => {
        switch (choix_filtre.value) {
            case 'num':
                return item.id.toString().includes(term)
            case 'id_user':
                return item.id_user?.toLowerCase().includes(term)
            default:
                return true
        }
    })
    loading.value = false
}

const filterByDate = () => {
    if (!date_debut.value && !date_fin.value) {
        filtered_demandes.value = [...liste_demandes_a_valider.value]
        return
    }

    loading.value = true
    filtered_demandes.value = liste_demandes_a_valider.value.filter(item => {
        const itemDate = new Date(item.date_original)
        const debut = date_debut.value ? new Date(date_debut.value) : null
        const fin = date_fin.value ? new Date(date_fin.value) : null

        if (debut && fin) return itemDate >= debut && itemDate <= fin
        if (debut) return itemDate >= debut
        if (fin) return itemDate <= fin
        return true
    })
    loading.value = false
}

watch(choix_filtre, () => {
    search_term.value = ''
    date_debut.value = ''
    date_fin.value = ''
    filtered_demandes.value = [...liste_demandes_a_valider.value]
})

// ====================== UTILITAIRES ======================
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