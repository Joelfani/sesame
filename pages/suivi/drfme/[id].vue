<template>
    <SuiviDetailGeneric
        titre="DÉTAILS DE LA DRFME"
        retour-path="/suivi/drfme"
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
import { niveauDRFME } from '~/assets/js/CommonVariable.js'
import SuiviDetailGeneric from '~/components/SuiviDetailGeneric.vue'

const supabase = useSupabaseClient()
const route = useRoute()

const loading = ref(true)
const dataObj = ref({})
const demande_details = ref([])

const infoFields = [
    { key: 'date', label: 'Date' },
    { key: 'demandeur', label: 'Demandeur', strong: true },
    { key: 'service', label: 'Service' },
    { key: 'projet', label: 'Projet' },
    { key: 'statut', label: 'Statut', strong: true }
]

const columns = [
    { key: 'num', label: 'N°' },
    { key: 'etat', label: 'Statut de la ligne' },
    { key: 'designation', label: 'Désignation', style: { minWidth: '200px' } },
    { key: 'montant_total', label: 'Montant total (Ar)' },
    { key: 'montant_etudiant', label: 'Part étudiant (Ar)' },
    { key: 'montant_sesame', label: 'Part SESAME (Ar)' },
    { key: 'detail', label: 'Motif ou destination', style: { minWidth: '200px' } },
    { key: 'observation', label: 'Observation', style: { minWidth: '180px' } },
    { key: 'imputation', label: 'Imputation' },
    { key: 'tiger', label: 'Tiger' },
    { key: 'cheque', label: 'Chèque' },
    { key: 'emission', label: 'Date d\'émission' },
    { key: 'motif', label: 'Motif de refus' }
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
    const n = typeof val === 'number'
        ? val
        : parseFloat(String(val || 0).replace(/\s/g, '').replace(',', '.')) || 0
    return new Intl.NumberFormat('fr-FR').format(n)
}

const getStatutLabel = (niv) => {
    switch (Number(niv)) {
        case niveauDRFME.erg: return 'Non soumise'
        case niveauDRFME.superieur: return 'Chez le supérieur'
        case niveauDRFME.finance: return 'Chez la finance'
        case niveauDRFME.cg: return 'Chez le CG'
        case niveauDRFME.dpr: return 'Chez le DPR'
        case niveauDRFME.cheque: return 'Émission de chèque'
        case niveauDRFME.valide: return 'Validée'
        case niveauDRFME.refuse: return 'Refusée'
        default: return 'Statut inconnu'
    }
}

const getDemandeDetails = async () => {
    loading.value = true
    try {
        const { data: obj, error: objError } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name, service ),
                ses_items_drfme ( niv_val )
            `)
            .eq('id', route.params.id)
            .eq('cat_proc', 'drfme')
            .single()

        if (objError) throw objError

        const itemsNiv = obj.ses_items_drfme || []
        const minVal = itemsNiv.length
            ? Math.min(...itemsNiv.map(i => Number(i.niv_val)))
            : null

        dataObj.value = {
            ...obj,
            date: formatDate(obj.date),
            demandeur: obj.users?.full_name || 'Nom non trouvé',
            service: obj.users?.service || '-',
            projet: obj.projet || '-',
            statut: minVal === null ? 'Aucun article' : getStatutLabel(minVal)
        }

        const { data, error } = await supabase
            .from('ses_items_drfme')
            .select(`
                *,
                imputation: imputation ( nom )
            `)
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true })

        if (error) throw error

        demande_details.value = (data || []).map((item, index) => ({
            ...item,
            num: item.num || index + 1,
            etat: getStatutLabel(item.niv_val),
            imputation: item.imputation?.nom || '-',
            emission: item.emission ? formatDate(item.emission) : '-',
            montant_total: item.montant_total != null ? formatMontant(item.montant_total) : '-',
            montant_etudiant: item.montant_etudiant != null ? formatMontant(item.montant_etudiant) : '-',
            montant_sesame: item.montant_sesame != null ? formatMontant(item.montant_sesame) : '-',
            montant_sesame_original: item.montant_sesame != null ? (item.niv_val != niveauDRFME.refuse ? Number(item.montant_sesame) : 0) : 0
        }))
        console.log('Demande details:', demande_details.value)
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}
const totals = computed(() => {
    const total = demande_details.value.reduce((sum, item) => {
        console.log(`Item: ${Number(item.montant_sesame_original)}`)
        return sum + (Number(item.montant_sesame_original) || 0)
    }, 0)
    return [{ label: 'Total part SESAME', value: formatMontant(total) }]
})
onMounted(() => getDemandeDetails())
</script>