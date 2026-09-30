<template>
    <ListeSuiviGeneric
        titre="SUIVI DE TOUTES LES DRFMS"
        :columns="columns"
        :rows="liste_demande"
        :loading="loading"
        but-link-path="suivi/drfms/"
        name-but-action="Voir"
        :filter-options="filterOptions"
        search-placeholder="Rechercher une DRFMS"
        :show-export="canExport"
        export-label="Exportation des DRFMS"
        :show-mini-nav="true"
        link-selected="/suivi/drfms"
        base-link="suivi"
        @export="exportToExcel"
    />
</template>

<script setup>
import { niveauDRFMS } from '~/assets/js/CommonVariable.js'
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
    { key: 'cat_pers', label: 'Personne soignée' },
    { key: 'niv_val', label: 'Status de la demande' }
]

const filterOptions = [
    { value: 'num', label: 'N° d\'enregistrement', key: 'id' },
    { value: 'nom', label: 'Nom du demandeur', key: 'nom_user' },
    { value: 'date', label: 'Date' },
    { value: 'pers', label: 'Personne soignée', key: 'cat_pers' }
]

const canExport = computed(() =>
    userStore.type_compte === 1 ||
    userStore.finance ||
    userStore.cg ||
    userStore.cheque ||
    userStore.dpr ||
    userStore.rh
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
        case niveauDRFMS.erg: return 'Demande non soumise'
        case niveauDRFMS.dpr: return 'En attente de validation du DPR'
        case niveauDRFMS.rh: return 'En attente de validation RH'
        case niveauDRFMS.finance: return 'En attente de validation finance'
        case niveauDRFMS.cg: return 'En attente de validation CG'
        case niveauDRFMS.cheque: return 'En attente d\'émission de chèque'
        case niveauDRFMS.valide: return 'Validée'
        case niveauDRFMS.refuse: return 'Refusée'
        default: return 'Statut inconnu'
    }
}

// ====================== LISTE ======================
const getDemande = async () => {
    loading.value = true
    try {
        let query = supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name, service )
            `)
            .eq('cat_proc', 'drfms')
            .order('id', { ascending: false })


        const { data, error } = await query
        if (error) throw error

        liste_demande.value = (data || []).map(item => ({
            ...item,
            nom_user: item.users?.full_name || 'Nom non trouvé',
            service: item.users?.service || '-',
            cat_pers: item.cat_pers || '-',
            date_original: item.date,
            date: formatDate(item.date),
            niv_val: getStatutLabel(item.niv_val)
        }))
    } catch (error) {
        console.error('Erreur récupération DRFMS:', error)
    } finally {
        loading.value = false
    }
}

// ====================== EXPORT ======================
const exportToExcel = async (filteredRows = []) => {
    try {
        const ids = filteredRows.map(r => r.id).filter(Boolean)

        if (!ids.length) {
            return
        }

        const { data, error } = await supabase
            .from('ses_items_drfms')
            .select(`
                *,
                type_soins: type ( nom, taux_normal, taux_accident, pourcentage_normal, pourcentage_accident ),
                ses_obj: id_obj (
                    id,
                    date,
                    cat_pers,
                    pers_soin,
                    id_user ( full_name, service )
                )
            `)
            .in('id_obj', ids)
            .order('id_obj', { ascending: true })
            .order('id', { ascending: true })

        if (error) throw error

        const exportData = (data || []).map(item => {
            const obj = item.ses_obj
            const tauxLabel =
                item.taux === 'accident' ? 'Accident' :
                item.taux === 'normal' ? 'Normal' :
                (item.taux || '-')

            return {
                'N° d\'enregistrement': item.id_obj,
                'Date de la demande': obj?.date ? formatDate(obj.date) : '-',
                'Demandeur': obj?.id_user?.full_name || '-',
                'Service': obj?.id_user?.service || '-',
                'Personne soignée': obj?.cat_pers || '-',
                'Nom de la personne': obj?.pers_soin || '-',
                'Type de soins': item.type_soins?.nom || item.type || '-',
                'Raison et description des soins': item.raison || '-',
                'Date de soins': item.date ? formatDate(item.date) : '-',
                'Cachet et signature du médecin prescripteur': item.cachet || '-',
                'Coût (ar)': item.cout ?? '-',
                'Taux de remboursement': tauxLabel,
                'Montant à rembourser (ar)': item.montant ?? '-'
            }
        })

        await exportExcel(exportData, 'Les_DRFMS_')
    } catch (error) {
        console.error('Erreur export DRFMS:', error)
    }
}
const accesRefuser = () => {
    navigateTo('/suivi')
}
onMounted(() => {
    getDemande()
    // Vérification des droits d'accès à la page //
    if (!userStore.finance && !userStore.cg && !userStore.cheque && !userStore.dpr && !userStore.rh) {
        accesRefuser()
    }
})
</script>