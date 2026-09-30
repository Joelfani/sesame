<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>MES DEMANDES DE BOURSE</h1>

            <MiniNav LinkSelected="/demande/bourse" baseLink="demande"/>

            <div class="link_demande">
                <NuxtLink
                    v-if="userStore.sup != '' && userStore.sup != null"
                    to="/demande/bourse/add"
                    class="btn btn-outline-success"
                >
                    Faire une demande de bourse
                </NuxtLink>
                <button
                    v-else
                    class="btn btn-outline-success"
                    @click="alertNoSup"
                >
                    Faire une demande de bourse
                </button>
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
                <option value="objet">Objet de la demande</option>
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
                placeholder="Rechercher une demande de bourse"
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
                but_link_path="demande/bourse/"
                name_but_action="Voir"
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
import { niveauBourse } from '~/assets/js/CommonVariable.js'

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
    { key: 'obj_bourse', label: 'Objet de la demande' },
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
        'Veuillez choisir un supérieur dans votre profil avant de faire une demande de bourse',
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
                ses_items_bourse ( niv_val )
            `)
            .eq('id_user', userStore.id)
            .eq('cat_proc', 'bourse')
            .order('id', { ascending: false })

        if (error) throw error

        const result = data.map(item => {
            const items = item.ses_items_bourse || []
            const minVal = items.length
                ? Math.min(...items.map(i => Number(i.niv_val)))
                : null

            return {
                ...item,
                niv_val:
                    minVal === null ? 'Aucun article' :
                    minVal === niveauBourse.erg ? 'Demande non soumise' :
                    minVal === niveauBourse.superieur ? 'En attente de validation chez votre supérieur' :
                    minVal === niveauBourse.finance ? 'En attente de validation chez le responsable financier' :
                    minVal === niveauBourse.cg ? 'En attente de validation chez le controlleur de gestion' :
                    minVal === niveauBourse.dpr ? 'En attente de validation du DPR' :
                    minVal === niveauBourse.cheque ? 'En attente d\'émission de chèque' :
                    minVal === niveauBourse.valide ? 'Validée' :
                    minVal === niveauBourse.refuse ? 'Votre demande a été refusée' :
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
        console.error('Erreur lors de la récupération des demandes de bourse:', error)
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
            case 'objet':
                return item.obj_bourse?.toLowerCase().includes(term)
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

        if (debut && fin) return itemDate >= debut && itemDate <= fin
        if (debut) return itemDate >= debut
        if (fin) return itemDate <= fin
        return true
    })
}

// Reset filtres
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