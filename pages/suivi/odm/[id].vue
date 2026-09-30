<template>
    <SuiviDetailGeneric
        titre="DÉTAIL DE L'ORDRE DE MISSION"
        retour-path="/suivi/odm"
        :data-obj="dataObj"
        :info-fields="infoFields"
        :show-table="false"
        :loading="loading"
    >
        <template #detail-content="{ dataObj }">
            <div class="card p-4">
                <h4 class="mb-3" style="font-weight: bold;">Détails de la mission</h4>

                <div class="row g-3">
                    <div class="col-md-6">
                        <strong>Objectif de la mission :</strong>
                        <div>{{ dataObj.miss_obj || '-' }}</div>
                    </div>
                    <div class="col-md-6">
                        <strong>Lieu de mission :</strong>
                        <div>{{ dataObj.miss_lieu || '-' }}</div>
                    </div>
                    <div class="col-md-3">
                        <strong>Date de début :</strong>
                        <div>{{ dataObj.miss_date1 || '-' }}</div>
                    </div>
                    <div class="col-md-3">
                        <strong>Date de fin :</strong>
                        <div>{{ dataObj.miss_date2 || '-' }}</div>
                    </div>
                    <div class="col-md-6">
                        <strong>Sélection du per diem :</strong>
                        <div>{{ dataObj.miss_cas_label || '-' }}</div>
                    </div>
                    <div class="col-md-3">
                        <strong>Montant :</strong>
                        <div>{{ dataObj.montant_label || '-' }}</div>
                    </div>
                    <div class="col-md-3">
                        <strong>Imputation analytique :</strong>
                        <div>{{ dataObj.imputation_label || '-' }}</div>
                    </div>
                    <div class="col-md-6">
                        <strong>Code Tiger :</strong>
                        <div>{{ dataObj.tiger || '-' }}</div>
                    </div>
                    <div class="col-md-3">
                        <strong>N° de chèque :</strong>
                        <div>{{ dataObj.cheque || '-' }}</div>
                    </div>
                    <div class="col-md-3">
                        <strong>Date d'émission :</strong>
                        <div>{{ dataObj.emission || '-' }}</div>
                    </div>
                </div>

                <!-- Motif de rejet si refusé -->
                <div
                    v-if="dataObj.isRefuse && dataObj.motif_rejet"
                    class="alert alert-danger mt-4 mb-0"
                    role="alert"
                >
                    <strong>Motif de rejet :</strong>
                    <div class="mt-1">{{ dataObj.motif_rejet }}</div>
                </div>
            </div>
        </template>
    </SuiviDetailGeneric>
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'
import SuiviDetailGeneric from '~/components/SuiviDetailGeneric.vue'

const supabase = useSupabaseClient()
const route = useRoute()

const loading = ref(true)
const dataObj = ref({})

const CAS_LABELS = {
    tana: 'Cas 1 : Mission Tanà (VAD, Salon, …)',
    ceres: 'Cas 2 : Mission avec hébergement sur Campus CERES',
    hebergement: 'Cas 3 : Mission avec hébergement'
}

const infoFields = [
    { key: 'date', label: 'Date' },
    { key: 'demandeur', label: 'Demandeur', strong: true },
    { key: 'service', label: 'Service' },
    { key: 'statut', label: 'Statut', strong: true }
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
    if (val === null || val === undefined || val === '') return '-'
    return new Intl.NumberFormat('fr-FR').format(Number(val) || 0) + ' Ar'
}

const getStatutLabel = (niv) => {
    switch (Number(niv)) {
        case niveauODM.erg: return 'En modification chez le demandeur'
        case niveauODM.superieur: return 'Chez le supérieur'
        case niveauODM.rh: return 'Chez les RH'
        case niveauODM.finance: return 'Chez la finance'
        case niveauODM.cg: return 'Chez le CG'
        case niveauODM.dpr: return 'Chez le DPR'
        case niveauODM.cheque: return 'Émission de chèque'
        case niveauODM.valide: return 'Validé'
        case niveauODM.refuse: return 'Refusé'
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
                imputation_rel: imputation ( id, nom )
            `)
            .eq('id', route.params.id)
            .eq('cat_proc', 'odm')
            .single()

        if (objError) throw objError

        // Si la FK imputation n'est pas nommée ainsi, fallback sur table ses_imputation
        let imputationLabel = obj.imputation_rel?.nom || ''
        if (!imputationLabel && obj.imputation) {
            const { data: imp } = await supabase
                .from('ses_imputation')
                .select('nom')
                .eq('id', obj.imputation)
                .maybeSingle()
            imputationLabel = imp?.nom || String(obj.imputation)
        }

        const isRefuse = Number(obj.niv_val) === Number(niveauODM.refuse)

        dataObj.value = {
            ...obj,
            date: formatDate(obj.date),
            demandeur: obj.users?.full_name || 'Nom non trouvé',
            service: obj.users?.service || '-',
            miss_obj: obj.miss_obj || '-',
            miss_lieu: obj.miss_lieu || '-',
            miss_date1: obj.miss_date1 ? formatDate(obj.miss_date1) : '-',
            miss_date2: obj.miss_date2 ? formatDate(obj.miss_date2) : '-',
            miss_cas_label: CAS_LABELS[obj.miss_cas] || obj.miss_cas || '-',
            montant_label: formatMontant(obj.montant),
            imputation_label: imputationLabel || '-',
            tiger: obj.tiger || '-',
            cheque: obj.cheque || '-',
            emission: obj.emission ? formatDate(obj.emission) : '-',
            motif_rejet: obj.motif_rejet || '',
            isRefuse,
            statut: getStatutLabel(obj.niv_val)
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

onMounted(() => getDemandeDetails())
</script>