<template>
    <SuiviDetailGeneric
        titre="DÉTAILS DE LA DRFMS"
        retour-path="/suivi/drfms"
        :data-obj="dataObj"
        :info-fields="infoFields"
        :columns="columns"
        :rows="demande_details"
        :loading="loading"
        :totals="totals"
        :show-actions="false"
    />
</template>

<script setup>
import { niveauDRFMS } from '~/assets/js/CommonVariable.js'
import SuiviDetailGeneric from '~/components/SuiviDetailGeneric.vue'

const supabase = useSupabaseClient()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const dataObj = ref({})
const demande_details = ref([])

const infoFields = [
    { key: 'date', label: 'Date' },
    { key: 'demandeur', label: 'Demandeur', strong: true },
    { key: 'service', label: 'Service' },
    { key: 'cat_pers', label: 'Personne soignée' },
    { key: 'pers_soin', label: 'Nom de la personne' },
    { key: 'imputation', label: 'Imputation analytique ' },
    { key: 'tiger', label: 'Code Tiger' },
    { key: 'cheque', label: 'Chèque' },
    { key: 'emission', label: 'Date d\'émission' },
    { key: 'statut', label: 'Statut', strong: true }
]

const columns = [
    { key: 'num', label: 'N°' },
    { key: 'type_nom', label: 'Type de soins' },
    { key: 'raison', label: 'Raison et description des soins', style: { minWidth: '280px' } },
    { key: 'date', label: 'Date de soins' },
    { key: 'cachet', label: 'Cachet et signature du médecin' },
    { key: 'cout', label: 'Coût (Ar)' },
    { key: 'taux_label', label: 'Taux de remboursement' },
    { key: 'pourcentage', label: 'Pourcentage' },
    { key: 'montant', label: 'Montant à rembourser (Ar)' }
]

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

const formatMontant = (val) => {
    const n = typeof val === 'number' ? val : parseFloat(String(val || 0).replace(/\s/g, '').replace(',', '.')) || 0
    return new Intl.NumberFormat('fr-FR').format(n)
}

const getStatutLabel = (niv) => {
    
    switch (Number(niv)) {
        case niveauDRFMS.erg: return 'Non soumise'
        case niveauDRFMS.dpr: return 'Chez le DPR'
        case niveauDRFMS.rh: return 'Chez le RH'
        case niveauDRFMS.finance: return 'Chez la finance'
        case niveauDRFMS.cg: return 'Chez le CG'
        case niveauDRFMS.cheque: return 'Émission de chèque'
        case niveauDRFMS.valide: return 'Validée'
        case niveauDRFMS.refuse: return 'Refusée'
        default: return 'Statut inconnu'
    }
}

const totals = computed(() => {
    const total = demande_details.value.reduce((sum, item) => {
        return sum + (Number(item.montant) || 0)
    }, 0)
    return [{ label: 'Total à rembourser', value: formatMontant(total) }]
})

const getDemandeDetails = async () => {
    loading.value = true
    try {
        // En-tête
        const { data: obj, error: objError } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name, service ),
                imputation: imputation_drfms ( nom )
            `)
            .eq('id', route.params.id)
            .eq('cat_proc', 'drfms')
            .single()

        if (objError) throw objError
        console.log('obj:', obj)
        dataObj.value = {
            ...obj,
            date: formatDate(obj.date),
            demandeur: obj.users?.full_name || 'Nom non trouvé',
            service: obj.users?.service || '-',
            cat_pers: obj.cat_pers || '-',
            pers_soin: obj.pers_soin || '-',
            imputation: obj.imputation?.nom || '-',
            tiger: obj.tiger || '-',
            cheque: obj.cheque || '-',
            emission: obj.emission ? formatDate(obj.emission) : '-',
            statut: getStatutLabel(obj.niv_val)
        }

        // Lignes
        const { data, error } = await supabase
            .from('ses_items_drfms')
            .select(`
                *,
                type_soins: type ( nom, pourcentage_normal, pourcentage_accident )
            `)
            .eq('id_obj', route.params.id)
            .order('id', { ascending: true })

        if (error) throw error

        demande_details.value = (data || []).map((item, index) => {
            const pct =
                item.taux === 'accident'
                    ? item.type_soins?.pourcentage_accident
                    : item.type_soins?.pourcentage_normal

            return {
                ...item,
                num: item.num || index + 1,
                type_nom: item.type_soins?.nom || '-',
                date: item.date ? formatDate(item.date) : '-',
                taux_label:
                    item.taux === 'accident' ? 'Accident' :
                    item.taux === 'normal' ? 'Normal' :
                    (item.taux || '-'),
                pourcentage: item.pourcentage ?? pct ?? '-',
            }
        })
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}
const accesRefuser = () => {
    navigateTo('/suivi')
}
onMounted(() => {
    getDemandeDetails()
    // Vérification des droits d'accès à la page //
    if (!userStore.finance && !userStore.cg && !userStore.cheque && !userStore.dpr && !userStore.rh) {
        accesRefuser()
    }
})
</script>