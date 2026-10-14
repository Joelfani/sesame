<template>
    <ListeSuiviGeneric
        titre="SUIVI DE TOUTES LES DRFME"
        :columns="columns"
        :rows="liste_demande"
        :loading="loading"
        but-link-path="suivi/drfme/"
        name-but-action="Voir"
        :filter-options="filterOptions"
        search-placeholder="Rechercher une DRFME"
        :show-export="canExport"
        export-label="Exportation des DRFME"
        :show-mini-nav="true"
        link-selected="/suivi/drfme"
        base-link="suivi"
        @export="exportToExcel"
    />
</template>

<script setup>
import { niveauDRFME } from '~/assets/js/CommonVariable.js'
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
    { key: 'niv_val', label: 'Status de la demande' }
]

const filterOptions = [
    { value: 'num', label: 'N° d\'enregistrement', key: 'id' },
    { value: 'nom', label: 'Nom du demandeur', key: 'nom_user' },
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
        case niveauDRFME.erg: return 'Non soumise'
        case niveauDRFME.superieur: return 'En attente chez le supérieur'
        case niveauDRFME.finance: return 'En attente chez la finance'
        case niveauDRFME.cg: return 'En attente chez le CG'
        case niveauDRFME.dpr: return 'En attente chez le DPR'
        case niveauDRFME.cheque: return 'En attente d\'émission de chèque'
        case niveauDRFME.valide: return 'Validée'
        case niveauDRFME.refuse: return 'Refusée'
        default: return 'Statut inconnu'
    }
}

const getDemande = async () => {
    loading.value = true
    try {
        // En-têtes NDF + lignes pour calculer le min niv_val
        let query = supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name, service ),
                ses_items_drfme ( id, niv_val )
            `)
            .eq('cat_proc', 'drfme')
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
            const items = item.ses_items_drfme || []
            const minVal = items.length
                ? Math.min(...items.map(i => Number(i.niv_val)))
                : null

            return {
                ...item,
                nom_user: item.users?.full_name || 'Nom non trouvé',
                service: item.users?.service || '-',
                date_original: item.date,
                date: formatDate(item.date),
                niv_val: minVal === null ? 'Aucun article' : getStatutLabel(minVal)
            }
        })
    } catch (error) {
        console.error('Erreur DRFME:', error)
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
            .from('ses_items_drfme')
            .select(`
                *,
                ses_obj: id_obj (
                    id,
                    date,
                    id_user ( full_name, service )
                ),
                imputations: imputation ( nom )
            `)
            .in('id_obj', ids)
            .order('id_obj', { ascending: true })

        if (error) throw error

        const exportData = (data || []).map(item => ({
            'N° d\'enregistrement': item.id_obj,
            'Date de la demande': item.ses_obj?.date ? formatDate(item.ses_obj.date) : '-',
            'Demandeur': item.ses_obj?.id_user?.full_name || '-',
            'Service': item.ses_obj?.id_user?.service || '-',
            'N° ligne': item.num,
            'Description': item.description || '-',
            'Nature': item.nature || '-',
            'Imputation': item.imputations?.nom || '-',
            'Tiger': item.tiger || '-',
            'Cheque': item.cheque || '-',
            'Date d\'emission': item.emission ? formatDate(item.emission) : '-',
            'Montant': item.montant ?? '-',
            'Statut': getStatutLabel(item.niv_val),
            'Motif de refus': item.motif || '-'
        }))

        await exportExcel(exportData, 'Les_DRFME_')
    } catch (error) {
        console.error('Erreur export DRFME:', error)
    }
}

onMounted(() => getDemande())
</script>