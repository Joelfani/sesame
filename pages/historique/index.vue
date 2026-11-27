<!--
  HistoriquePage.vue — Historique des actions, par catégorie.

    - achat                  -> table ses_histo
    - ndf, drfme, bourse,    -> table ses_histo2, filtrée par cat_proc
      drfms
      (le flow "bourse" s'affiche "Dépenses étudiantes" dans l'application)

  Pour ne pas alourdir le chargement : seule la PÉRIODE choisie est chargée,
  filtrée côté serveur (pas côté navigateur). Par défaut, les 30 derniers
  jours ; l'utilisateur change les dates pour voir plus ancien. Un
  changement de catégorie ou de dates relance la requête.
-->
<template>
    <div class="historique_page">
        <!-- Header avec titre -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>HISTORIQUES DES ACTIONS</h1>
        </div>

        <!-- Boutons de catégorie : un clic change le tableau -->
        <div class="d-flex flex-wrap gap-2 mb-3">
            <button
                v-for="cat in CATEGORIES"
                :key="cat.key"
                type="button"
                class="btn"
                :class="activeCategory === cat.key ? 'btn-primary' : 'btn-outline-primary'"
                @click="selectCategory(cat.key)"
            >
                {{ cat.label }}
            </button>
        </div>

        <!-- Filtre par période : relance la requête à chaque changement.
             min / max empêchent de saisir une période inversée. -->
        <div class="d-flex align-items-center flex-wrap">
            <label style="font-weight: bold; margin-right: 10px;">De: </label>
            <input
                type="date"
                class="form-control mb-3"
                style="width: 200px; margin-right: 10px;"
                v-model="date_debut"
                :max="date_fin || undefined"
                @change="loadHistoriques"
            >
            <label style="font-weight: bold; margin-right: 10px;">À: </label>
            <input
                type="date"
                class="form-control mb-3"
                style="width: 200px; margin-right: 10px;"
                v-model="date_fin"
                :min="date_debut || undefined"
                @change="loadHistoriques"
            >
            <button type="button" class="btn btn-outline-secondary mb-3" @click="resetPeriod">
                30 derniers jours
            </button>
        </div>

        <p class="text-muted small mb-1">
            Par défaut, seules les actions des 30 derniers jours sont chargées.
            Modifiez les dates pour consulter une autre période.
        </p>
        <p v-if="limitReached" class="text-warning small mb-1">
            Affichage limité aux {{ MAX_ROWS }} actions les plus récentes de la période :
            réduisez la période pour voir les plus anciennes.
        </p>

        <!-- Tableau des historiques -->
        <div class="table_block_list">
            <Table
                :columns="columns"
                :rows="historiques"
                :type_but_link="false"
                :show-actions="false"
                :loading="loading"
            />
        </div>

        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
    </div>
</template>

<script setup>
// Services
const supabase = useSupabaseClient()
const userStore = useUserStore()

const loading = ref(true)

// Alert (l'ancienne page appelait showAlert sans l'avoir définie : une
// erreur de chargement provoquait donc une seconde erreur)
const alert = ref({ show: false, message: '', title: '', type: '' })
const showAlert = (message, title, type) => {
    alert.value = { show: true, message, title, type }
    setTimeout(() => { alert.value.show = false }, 5000)
}

// ====================== CATÉGORIES ======================
// Une ligne par catégorie : pour en ajouter une (par exemple l'ODM), il
// suffit d'ajouter une ligne ici.
//   table   : table d'historique à lire
//   catProc : valeur de cat_proc à filtrer (null pour ses_histo, qui n'a pas
//             cette colonne)
const CATEGORIES = [
    { key: 'achat', label: 'Achat', table: 'ses_histo', catProc: null },
    { key: 'ndf', label: 'NDF', table: 'ses_histo2', catProc: 'ndf' },
    { key: 'drfme', label: 'DRFME', table: 'ses_histo2', catProc: 'drfme' },
    { key: 'bourse', label: 'Dépenses étudiantes', table: 'ses_histo2', catProc: 'bourse' },
    { key: 'drfms', label: 'DRFMS', table: 'ses_histo2', catProc: 'drfms' },
    { key: 'odm', label: 'ODM', table: 'ses_histo2', catProc: 'odm' }
]
const activeCategory = ref('achat')

// Colonnes du tableau (N° demande ajouté pour retrouver la demande concernée)
const columns = [
    { key: 'date', label: 'Date' },
    { key: 'id_obj', label: 'N° demande' },
    { key: 'nom_utilisateur', label: 'Nom de l\'utilisateur' },
    { key: 'email_utilisateur', label: 'Email' },
    { key: 'action', label: 'Action enregistrée' }
]

// ====================== PÉRIODE ======================
const PERIOD_DAYS = 30 // période chargée par défaut
const MAX_ROWS = 1000 // plafond de sécurité par requête

const historiques = ref([])
const limitReached = ref(false)
const date_debut = ref('')
const date_fin = ref('')

// Date locale au format AAAA-MM-JJ, celui des champs <input type="date">
const toInputDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Remet la période par défaut (30 derniers jours) et recharge
const resetPeriod = () => {
    const today = new Date()
    const start = new Date()
    start.setDate(today.getDate() - PERIOD_DAYS)
    date_debut.value = toInputDate(start)
    date_fin.value = toInputDate(today)
    loadHistoriques()
}

const selectCategory = (key) => {
    if (key === activeCategory.value) return
    activeCategory.value = key
    historiques.value = [] // évite d'afficher l'ancienne catégorie pendant le chargement
    loadHistoriques()
}

// ====================== CHARGEMENT ======================
// Compteur de requêtes : si l'utilisateur change de catégorie ou de dates
// pendant qu'une requête est en cours, la réponse de l'ancienne requête est
// ignorée (sinon elle pourrait écraser la plus récente).
let lastRequest = 0

const loadHistoriques = async () => {
    const cat = CATEGORIES.find(c => c.key === activeCategory.value)
    if (!cat) return

    if (date_debut.value && date_fin.value && date_debut.value > date_fin.value) {
        showAlert('La date de début doit précéder la date de fin.', 'Oups!', 'danger')
        return
    }

    const requestId = ++lastRequest
    loading.value = true
    limitReached.value = false

    try {
        let query = supabase
            .from(cat.table)
            .select(`
                *,
                user: id_user ( full_name, email )
            `)
            .order('created_at', { ascending: false })
            .limit(MAX_ROWS)

        // Catégorie : ses_histo2 est partagée entre plusieurs flows
        if (cat.catProc) query = query.eq('cat_proc', cat.catProc)

        // Un compte de type 3 ne voit que ses propres actions
        if (userStore.type_compte === 3) query = query.eq('id_user', userStore.id)

        // Période, en heure LOCALE : de 00:00 du jour de début à 23:59:59 du
        // jour de fin, converties en UTC pour la comparaison avec created_at
        if (date_debut.value) {
            query = query.gte('created_at', new Date(`${date_debut.value}T00:00:00`).toISOString())
        }
        if (date_fin.value) {
            query = query.lte('created_at', new Date(`${date_fin.value}T23:59:59.999`).toISOString())
        }

        const { data, error } = await query
        if (error) throw error

        // Réponse périmée : une requête plus récente est en cours
        if (requestId !== lastRequest) return

        historiques.value = (data || []).map(item => ({
            ...item,
            date: formatDateTime(item.created_at),
            nom_utilisateur: item.user?.full_name || 'Utilisateur inconnu',
            email_utilisateur: item.user?.email || 'Email non disponible'
        }))
        limitReached.value = (data || []).length >= MAX_ROWS
    } catch (error) {
        console.error('Erreur lors de la récupération des historiques:', error)
        if (requestId === lastRequest) {
            showAlert('Erreur lors de la récupération des historiques', 'Erreur', 'danger')
        }
    } finally {
        if (requestId === lastRequest) loading.value = false
    }
}

// Fonction de formatage de date et heure
const formatDateTime = (dateString) => {
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Les dates par défaut sont posées au montage (côté navigateur), pas dans le
// setup : le serveur et le navigateur n'ont pas le même fuseau horaire, ce
// qui donnerait des valeurs différentes autour de minuit.
onMounted(() => {
    resetPeriod()
})
</script>

<style scoped>
.historique_page {
    padding: 20px;
}

.table_block_list {
    margin-top: 20px;
}
</style>