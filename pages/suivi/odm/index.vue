<template>
    <ListeSuiviGeneric
        titre="SUIVI DE TOUS LES ORDRES DE MISSION"
        :columns="columns"
        :rows="liste_demande"
        :loading="loading"
        but-link-path="suivi/odm/"
        name-but-action="Voir"
        :filter-options="filterOptions"
        search-placeholder="Rechercher un ODM"
        :show-export="canExport"
        export-label="Exportation des ODM"
        :show-mini-nav="true"
        link-selected="/suivi/odm"
        base-link="suivi"
        @export="exportToExcel"
    />
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'
import { exportExcel } from '~/assets/js/export.js'
import ListeSuiviGeneric from '~/components/ListeSuiviGeneric.vue'

const supabase = useSupabaseClient()
const userStore = useUserStore()

const loading = ref(true)
const liste_demande = ref([])

const columns = [
    { key: 'id', label: 'N° d\'enregistrement' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'nom_user', label: 'Demandeur' },
    { key: 'service', label: 'Service' },
    { key: 'miss_obj', label: 'Objet de la mission' },
    { key: 'niv_val', label: 'Status de la demande' }
]

const filterOptions = [
    { value: 'num', label: 'N° d\'enregistrement', key: 'id' },
    { value: 'nom', label: 'Nom du demandeur', key: 'nom_user' },
    { value: 'objet', label: 'Objet de la mission', key: 'miss_obj' },
    { value: 'date', label: 'Date' }
]

const canExport = computed(() =>
    userStore.type_compte === 1 ||
    userStore.finance ||
    userStore.cg ||
    userStore.cheque
)

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

const getStatutLabel = (niv) => {
    switch (Number(niv)) {
        case niveauODM.erg: return 'En attente de modification par le demandeur'
        case niveauODM.superieur: return 'En attente chez le supérieur'
        case niveauODM.finance: return 'En attente chez la finance'
        case niveauODM.cg: return 'En attente chez le CG'
        case niveauODM.cheque: return 'En attente d\'émission de chèque'
        case niveauODM.valide: return 'Validé'
        case niveauODM.refuse: return 'Refusé'
        default: return 'Statut inconnu'
    }
}

const getDemande = async () => {
    loading.value = true
    try {
        let query = supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name, service )
            `)
            .eq('cat_proc', 'odm')
            .order('id', { ascending: false })

        const isSpecial =
            userStore.type_compte == 1 ||
            userStore.finance ||
            userStore.cg ||
            userStore.cheque

        if (!isSpecial) {
            query = query.eq('id_sup', userStore.id)
        }

        const { data, error } = await query
        if (error) throw error

        liste_demande.value = (data || []).map(item => ({
            ...item,
            nom_user: item.users?.full_name || 'Nom non trouvé',
            service: item.users?.service || '-',
            miss_obj: item.miss_obj || '-',
            date_original: item.date,
            date: formatDate(item.date),
            niv_val: getStatutLabel(item.niv_val)
        }))
    } catch (error) {
        console.error('Erreur ODM:', error)
    } finally {
        loading.value = false
    }
}

const exportToExcel = async (filteredRows = []) => {
    try {
        const ids = filteredRows.map(r => r.id).filter(Boolean)

        if (!ids.length) {
            return
        }

        const { data, error } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name, service )
            `)
            .in('id_obj', ids)
            .eq('cat_proc', 'odm')
            .order('id', { ascending: true })

        if (error) throw error

        const exportData = (data || []).map(item => ({
            'N° d\'enregistrement': item.id,
            'Date de la demande': item.date ? formatDate(item.date) : '-', 
            'Demandeur': item.users?.full_name || '-',
            'Service': item.users?.service || '-',
            'Objet de la mission': item.miss_obj || '-',
            'Lieu': item.miss_lieu || '-',
            'Date début': item.miss_date1 ? formatDate(item.miss_date1) : '-',
            'Date fin': item.miss_date2 ? formatDate(item.miss_date2) : '-',
            'Statut': getStatutLabel(item.niv_val)
        }))

        await exportExcel(exportData, 'Les_ODM_')
    } catch (error) {
        console.error('Erreur export ODM:', error)
    }
}

onMounted(() => getDemande())
</script>