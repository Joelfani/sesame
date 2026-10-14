<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>MES DRFME</h1>

            <MiniNav LinkSelected="/demande/drfme" baseLink="demande"/>

            <div class="link_demande">
                <button
                    v-if="!userStore.service || userStore.service === ''"
                    class="btn btn-outline-success"
                    @click="alertNoService"
                >
                    Faire un DRFME
                </button>
                <NuxtLink
                    v-else
                    to="/demande/drfme/add"
                    class="btn btn-outline-success"
                >
                    Faire un DRFME
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
                placeholder="Rechercher un DRFME"
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
                but_link_path="demande/drfme/"
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
import { niveauDRFME } from '~/assets/js/CommonVariable.js'

const supabase = useSupabaseClient()
const userStore = useUserStore()

const loading = ref(true)
const choix_filtre = ref('num')
const search_term = ref('')
const date_debut = ref('')
const date_fin = ref('')

const columns = [
    { key: 'id', label: "N° d'enregistrement" },
    { key: 'date', label: 'Date de la demande' },
    { key: 'niv_val', label: 'Status de la demande' },
]

const liste_demande = ref([])
const filtered_demandes = ref([])

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

const alertNoService = () => {
    showAlert(
        'Veuillez renseigner votre service dans votre profil avant de faire un DRFME.',
        'Oups!',
        'danger'
    )
}

const getStatutLabel = (minVal) => {
    if (minVal === null) return 'Aucun article'
    if (minVal === niveauDRFME.erg) return 'DRFME non soumis'
    if (minVal === niveauDRFME.superieur) return 'En attente de validation chez votre supérieur'
    if (minVal === niveauDRFME.finance) return 'En attente de validation chez le responsable financier'
    if (minVal === niveauDRFME.cg) return 'En attente de validation chez le contrôleur de gestion'
    if (minVal === niveauDRFME.dpr) return 'En attente de validation chez le DPR'
    if (minVal === niveauDRFME.cheque) return "En attente d'émission de chèque"
    if (minVal === niveauDRFME.valide) return 'Validée'
    if (minVal === niveauDRFME.refuse) return 'Votre DRFME a été refusée'
    return 'Statut inconnu'
}

const getDemande = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_obj')
            .select(`
                *,
                ses_items_drfme ( niv_val )
            `)
            .eq('id_user', userStore.id)
            .eq('cat_proc', 'drfme')
            .order('id', { ascending: false })

        if (error) throw error

        const result = (data || []).map(item => {
            const items = item.ses_items_drfme || []
            const minVal = items.length
                ? Math.min(...items.map(i => Number(i.niv_val)))
                : null

            return {
                ...item,
                niv_val: getStatutLabel(minVal),
                niv_val_raw: minVal,
                date_original: item.date,
                date: formatDate(item.date)
            }
        })

        liste_demande.value = result
        filtered_demandes.value = [...result]
    } catch (error) {
        console.error('Erreur lors de la récupération des DRFME:', error)
        showAlert('Erreur lors du chargement des DRFME', 'Erreur', 'danger')
    } finally {
        loading.value = false
    }
}

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

watch(choix_filtre, () => {
    search_term.value = ''
    date_debut.value = ''
    date_fin.value = ''
    filtered_demandes.value = [...liste_demande.value]
})

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

onMounted(() => {
    loading.value = true
    getDemande()
})
</script>