<template>
    <SuiviDetailGeneric
        titre="DÉTAILS DE LA DEMANDE DE BOURSE"
        retour-path="/suivi/bourse"
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
import { niveauBourse } from '~/assets/js/CommonVariable.js'
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
    { key: 'obj_bourse', label: 'Objet de la demande', strong: true },
    { key: 'statut', label: 'Statut', strong: true }
]

const columns = [
    { key: 'num', label: 'N°' },
    { key: 'etat', label: 'Statut de la ligne' },
    { key: 'description', label: 'Description', style: { minWidth: '280px' } },
    { key: 'qte', label: 'Nombre' },
    { key: 'prix', label: 'Montant unitaire' },
    { key: 'montant', label: 'Montant' },
    {key: 'imputation', label: 'Imputation' },
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
        case niveauBourse.erg: return 'Non soumise'
        case niveauBourse.superieur: return 'Chez le supérieur'
        case niveauBourse.finance: return 'Chez la finance'
        case niveauBourse.cg: return 'Chez le CG'
        case niveauBourse.dpr: return 'Chez le DPR'
        case niveauBourse.cheque: return 'Émission de chèque'
        case niveauBourse.valide: return 'Validée'
        case niveauBourse.refuse: return 'Refusée'
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
                ses_items_bourse ( niv_val )
            `)
            .eq('id', route.params.id)
            .eq('cat_proc', 'bourse')
            .single()

        if (objError) throw objError

        const itemsNiv = obj.ses_items_bourse || []
        const minVal = itemsNiv.length
            ? Math.min(...itemsNiv.map(i => Number(i.niv_val)))
            : null

        dataObj.value = {
            ...obj,
            date: formatDate(obj.date),
            demandeur: obj.users?.full_name || 'Nom non trouvé',
            service: obj.users?.service || '-',
            obj_bourse: obj.obj_bourse || '-',
            statut: minVal === null ? 'Aucun article' : getStatutLabel(minVal)
        }

        const { data, error } = await supabase
            .from('ses_items_bourse')
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