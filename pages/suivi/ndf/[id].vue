<template>
    <SuiviDetailGeneric
        titre="DÉTAILS DE LA NOTE DE FRAIS"
        retour-path="/suivi/ndf"
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
import { niveauNDF } from '~/assets/js/CommonVariable.js'
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
    { key: 'statut', label: 'Statut', strong: true }
]

const columns = [
    { key: 'num', label: 'N°' },
    { key: 'etat', label: 'Statut de la ligne' },
    { key: 'description', label: 'Libellé de facture / Commentaires', style: { minWidth: '280px' } },
    { key: 'nature', label: 'Nature de la dépense' },
    { key: 'ok', label: 'OK/NOK'},
    { key: 'montant', label: 'Montant (Ar)' },
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
        case niveauNDF.erg: return 'Non soumise'
        case niveauNDF.superieur: return 'Chez le supérieur'
        case niveauNDF.finance: return 'Chez la finance'
        case niveauNDF.cg: return 'Chez le CG'
        case niveauNDF.cheque: return 'Émission de chèque'
        case niveauNDF.valide: return 'Validée'
        case niveauNDF.refuse: return 'Refusée'
        default: return 'Statut inconnu'
    }
}

const totals = computed(() => {
    const total = demande_details.value.reduce((sum, item) => {
        return sum + (Number(item.montant) || 0)
    }, 0)
    return [{ label: 'Total', value: formatMontant(total) }]
})

const getDemandeDetails = async () => {
    loading.value = true
    try {
        const { data: obj, error: objError } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name, service ),
                ses_items_ndf ( niv_val )
            `)
            .eq('id', route.params.id)
            .eq('cat_proc', 'ndf')
            .single()

        if (objError) throw objError

        const itemsNiv = obj.ses_items_ndf || []
        const minVal = itemsNiv.length
            ? Math.min(...itemsNiv.map(i => Number(i.niv_val)))
            : null

        dataObj.value = {
            ...obj,
            date: formatDate(obj.date),
            demandeur: obj.users?.full_name || 'Nom non trouvé',
            service: obj.users?.service || '-',
            statut: minVal === null ? 'Aucun article' : getStatutLabel(minVal)
        }

        const { data, error } = await supabase
            .from('ses_items_ndf')
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
            emission: item.emission ? formatDate(item.emission) : '-'
        }))
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

onMounted(() => getDemandeDetails())
</script>