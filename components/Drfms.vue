<template>
    <div class="demandes_validation_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>{{ titre }}</h1>

            <MiniNav v-if="choiceNavigation" :LinkSelected="LinkSelected" :baseLink="baseLink"/>
            <MiniNav v-if="RHNavigation" :RHSelect="true" :normalSelect="false" LinkSelected="/rh"/>
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
                <option value="pers">Personne soignée</option>
            </select>

            <template v-if="choix_filtre === 'date'">
                <label style="font-weight: bold; margin-right: 10px;">de :</label>
                <input
                    type="date"
                    class="form-control mb-3"
                    style="width: 200px; margin-right: 10px;"
                    v-model="date_debut"
                    @change="filterByDate"
                />
                <label style="font-weight: bold; margin-right: 10px;">à :</label>
                <input
                    type="date"
                    class="form-control mb-3"
                    style="width: 200px;"
                    v-model="date_fin"
                    @change="filterByDate"
                />
            </template>

            <input
                v-else
                type="search"
                placeholder="Rechercher une demande"
                class="form-control mb-3"
                style="width: 250px; margin-right: 10px;"
                v-model="search_term"
                @input="filterData"
            />
        </div>

        <!-- Tableau -->
        <div class="table_block_list">
            <Table
                :columns="columns"
                :rows="filtered_demandes"
                :type_but_link="true"
                :but_link_path="voirPath"
                name_but_action="Voir"
                :loading="loading"
            />
        </div>
    </div>
</template>

<script setup>
import { niveauDRFMS } from '~/assets/js/CommonVariable.js'

// ====================== PROPS ======================
const props = defineProps({
    // Niveau de validation (obligatoire)
    niveau: {
        type: [String, Number],
        required: true
    },
    // Titre de la page
    titre: {
        type: String,
        default: 'VALIDATION DES DRFMS'
    },
    // Valeur sélectionnée par défaut dans le select
    selectedType: {
        type: String,
        default: ''
    },
    // Chemin pour le bouton "Voir"
    voirPath: {
        type: String,
        default: ''
    },
    choiceNavigation: { type : Boolean, default:true},
    RHNavigation: { type : Boolean, default:false},
    LinkSelected: {
        type: String,
        default: null
    },
    baseLink: {
        type: String,
        default: null
    }
})

// ====================== SERVICES & STORE ======================
const supabase = useSupabaseClient()
const userStore = useUserStore()

// ====================== STATE ======================
const loading = ref(true)
const liste_demandes_a_valider = ref([])
const filtered_demandes = ref([])
const choix_filtre = ref('num')
const search_term = ref('')
const date_debut = ref('')
const date_fin = ref('')


// Colonnes du tableau
const columns = [
    { key: 'id', label: 'N° d\'enregistrement' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'id_user', label: 'Nom du demandeur' },
    { key: 'cat_pers', label: 'Personne soignée' },
    { key: 'pers_soin', label: 'Nom de la personne' },
]

// ====================== METHODS ======================
const getValidation = async () => {
    loading.value = true
    try {
        const { data, error } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name )
            `)
            .eq('cat_proc', 'drfms')
            .eq('niv_val', props.niveau)
            .order('id', { ascending: false })

        if (error) throw error

        const result = data.map(row => ({
            ...row,
            date_original: row.date,
            date: formatDate(row.date),
            id_user: row.users?.full_name || 'Nom non trouvé'
        }))

        liste_demandes_a_valider.value = result
        filtered_demandes.value = [...result]
    } catch (error) {
        console.error('Erreur lors de la récupération des DRFMS:', error)
    } finally {
        loading.value = false
    }
}

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
            case 'pers':
                return (
                    item.cat_pers?.toLowerCase().includes(term) ||
                    item.pers_soin?.toLowerCase().includes(term)
                )
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

const formatDate = (dateString) => {
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}



// Réinitialiser les filtres quand on change de type de filtre
watch(choix_filtre, () => {
    search_term.value = ''
    date_debut.value = ''
    date_fin.value = ''
    filtered_demandes.value = [...liste_demandes_a_valider.value]
})

// ====================== LIFECYCLE ======================
onMounted(() => {
    getValidation()
})
</script>