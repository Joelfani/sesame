<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>MES NOTES DE FRAIS</h1>

            <MiniNav LinkSelected="/demande/ndf" baseLink="demande"/>

            <div class="link_demande">
                <button
                    v-if="userStore.code_tiers == null || userStore.abr_prenom == null || userStore.code_tiers == '' || userStore.abr_prenom == '' || userStore.sup == '' || userStore.sup == null"
                    class="btn btn-outline-success"
                    @click="alertNoSup"
                >
                    Faire une NDF
                </button>
                <NuxtLink v-else to="/demande/ndf/add" class="btn btn-outline-success">
                    Faire une NDF
                </NuxtLink>
            </div>
        </div>

        <!-- Champ de recherche -->
        <div class="d-flex align-items-center">
            <select
                name="choix"
                class="form-select mb-3"
                style="width: 250px; margin-right: 10px;"
                v-model="choix_filtre"
            >
                <option value="num">N° d'enregistrement</option>
                <option value="date">Date</option>
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

        <div class="table_block_list">
            <Table
                :columns="columns"
                :rows="filtered_demandes"
                :type_but_link="true"
                but_link_path="demande/ndf/"
                name_but_action="Voir"
                :loading="loading"
            />
        </div>

        <!-- Alert -->
        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />
    </div>
</template>

<script setup>
import { niveauNDF } from '~/assets/js/CommonVariable.js'

// Services
const supabase = useSupabaseClient()

// Store
const userStore = useUserStore()

// Loading
const loading = ref(true)

// DATA
const choix_filtre = ref('num')
const search_term = ref('')
const date_debut = ref('')
const date_fin = ref('')

const columns = [
    { key: 'id', label: 'N° d\'enregistrement' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'niv_val', label: 'Status de la demande' },
]

const liste_demande = ref([])
const filtered_demandes = ref([])

// Alert
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: ''
})

const showAlert = (message, title, type) => {
    alert.value = { show: true, message, title, type }
    setTimeout(() => {
        alert.value.show = false
    }, 5000)
}

// METHODS
const alertNoSup = () => {
    showAlert(
        'Veuillez remplir les informations de votre profil avant de faire une NDF',
        'Oups!',
        'danger'
    )
}

const getDemande = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_obj')
            .select(`
                *,
                ses_items_ndf ( niv_val )
            `)
            .eq('id_user', userStore.id)
            .eq('cat_proc', 'ndf')
            .order('id', { ascending: false })

        if (error) throw error

        const result = data.map(item => {
            const items = item.ses_items_ndf || []
            const minVal = items.length
                ? Math.min(...items.map(i => Number(i.niv_val)))
                : null

            return {
                ...item,
                niv_val:
                    minVal === null ? 'Aucun article' :
                    minVal === niveauNDF.erg ? 'Note de frais non soumise' : 
                    minVal === niveauNDF.superieur ? 'En attente de validation chez votre supérieur' :
                    minVal === niveauNDF.finance ? 'En attente de validation chez le responsable financier' :
                    minVal === niveauNDF.cg ? 'En attente de validation chez le controlleur de gestion' :
                    minVal === niveauNDF.dpr ? 'En attente de validation chez le DPR' :
                    minVal === niveauNDF.cheque ? 'En attente d\'émission de chèque' :
                    minVal === niveauNDF.valide ? 'Validée' :
                    minVal === niveauNDF.refuse ? 'Votre note de frais a été refusée' :
                    'Statut inconnu',
                niv_val_raw: minVal,
                date_original: item.date,
                date: formatDate(item.date)
            }
        })

        liste_demande.value = result
        filtered_demandes.value = [...result]
        loading.value = false
    } catch (error) {
        console.error('Erreur lors de la récupération des notes de frais:', error)
        loading.value = false
    }
}
// Filtrage texte
const filterData = () => {
    if (!search_term.value.trim()) {
        filtered_demandes.value = [...liste_demande.value]
        return
    }

    loading.value = true
    const term = search_term.value.toLowerCase().trim()

    filtered_demandes.value = liste_demande.value.filter(item => {
        switch (choix_filtre.value) {
            case 'num':
                return item.id.toString().includes(term)
            default:
                return true
        }
    })
    loading.value = false
}

// Filtrage par date
const filterByDate = () => {
    if (!date_debut.value && !date_fin.value) {
        filtered_demandes.value = [...liste_demande.value]
        return
    }

    filtered_demandes.value = liste_demande.value.filter(item => {
        const itemDate = new Date(item.date_original)
        const debut = date_debut.value ? new Date(date_debut.value) : null
        const fin = date_fin.value ? new Date(date_fin.value) : null

        if (debut && fin) {
            return itemDate >= debut && itemDate <= fin
        } else if (debut) {
            return itemDate >= debut
        } else if (fin) {
            return itemDate <= fin
        }
        return true
    })
}

// Reset filtres quand on change le type
watch(choix_filtre, () => {
    search_term.value = ''
    date_debut.value = ''
    date_fin.value = ''
    filtered_demandes.value = [...liste_demande.value]
})

// Format date
const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

// LIFECYCLE
onMounted(() => {
    loading.value = true
    getDemande()
})
</script>