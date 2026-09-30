<template>
    <ListeSuiviGeneric
        titre="SUIVI DE TOUTES LES DEMANDES DE BOURSE"
        :columns="columns"
        :rows="liste_demande"
        :loading="loading"
        but-link-path="suivi/bourse/"
        name-but-action="Voir"
        :filter-options="filterOptions"
        search-placeholder="Rechercher une demande de bourse"
        :show-export="canExport"
        export-label="Exportation des bourses"
        :show-mini-nav="true"
        link-selected="/suivi/bourse"
        base-link="suivi"
        @export="exportToExcel"
    />
</template>

<script setup>
import { niveauBourse } from '~/assets/js/CommonVariable.js'
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
    { key: 'obj_bourse', label: 'Objet de la demande' },
    { key: 'niv_val', label: 'Status de la demande' }
]

const filterOptions = [
    { value: 'num', label: 'N° d\'enregistrement', key: 'id' },
    { value: 'nom', label: 'Nom du demandeur', key: 'nom_user' },
    { value: 'objet', label: 'Objet de la demande', key: 'obj_bourse' },
    { value: 'date', label: 'Date' }
]

const canExport = computed(() =>
    userStore.type_compte === 1 ||
    userStore.finance ||
    userStore.cg ||
    userStore.cheque ||
    userStore.dpr
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
        case niveauBourse.erg: return 'Non soumise'
        case niveauBourse.superieur: return 'En attente chez le supérieur'
        case niveauBourse.finance: return 'En attente chez la finance'
        case niveauBourse.cg: return 'En attente chez le CG'
        case niveauBourse.dpr: return 'En attente chez le DPR'
        case niveauBourse.cheque: return 'En attente d\'émission de chèque'
        case niveauBourse.valide: return 'Validée'
        case niveauBourse.refuse: return 'Refusée'
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
                users: id_user ( full_name, service ),
                ses_items_bourse ( id, niv_val )
            `)
            .eq('cat_proc', 'bourse')
            .order('id', { ascending: false })

        const isSpecial =
            userStore.type_compte == 1 ||
            userStore.finance ||
            userStore.cg ||
            userStore.cheque ||
            userStore.dpr

        if (!isSpecial) {
            query = query.eq('id_sup', userStore.id)
        }

        const { data, error } = await query
        if (error) throw error

        liste_demande.value = (data || []).map(item => {
            const items = item.ses_items_bourse || []
            const minVal = items.length
                ? Math.min(...items.map(i => Number(i.niv_val)))
                : null

            return {
                ...item,
                nom_user: item.users?.full_name || 'Nom non trouvé',
                service: item.users?.service || '-',
                obj_bourse: item.obj_bourse || '-',
                date_original: item.date,
                date: formatDate(item.date),
                niv_val: minVal === null ? 'Aucun article' : getStatutLabel(minVal)
            }
        })
    } catch (error) {
        console.error('Erreur bourse:', error)
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
            .from('ses_items_bourse')
            .select(`
                *,
                ses_obj: id_obj (
                    id,
                    date,
                    obj_bourse,
                    id_user ( full_name, service )
                )
            `)
            .in('id_obj', ids)
            .order('id_obj', { ascending: true })

        if (error) throw error

        const exportData = (data || []).map(item => ({
            'N° d\'enregistrement': item.id_obj,
            'Date de la demande': item.ses_obj?.date ? formatDate(item.ses_obj.date) : '-',
            'Demandeur': item.ses_obj?.id_user?.full_name || '-',
            'Service': item.ses_obj?.id_user?.service || '-',
            'Objet de la demande': item.ses_obj?.obj_bourse || '-',
            'N° ligne': item.num,
            'Description': item.description || '-',
            'Nombre': item.qte ?? '-',
            'Montant unitaire': item.prix ?? '-',
            'Montant': item.montant ?? '-',
            'Statut': getStatutLabel(item.niv_val)
        }))

        await exportExcel(exportData, 'Les_Bourses_')
    } catch (error) {
        console.error('Erreur export bourse:', error)
    }
}

onMounted(() => getDemande())
</script>