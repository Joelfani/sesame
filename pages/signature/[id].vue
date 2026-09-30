<template>
    <ImpressionPdfGeneric
        titre="IMPRESSION DE LA DEMANDE"
        retour-path="/signature"
        :file-name="`Demande_Validee_${route.params.id}`"
        orientation="l"
        :loading="loading"
    >
        <!-- Boucle sur les pages -->
        <div
            v-for="(page, pageIndex) in paginatedItems"
            :key="pageIndex"
            class="pdf-page"
            :style="{ pageBreakAfter: pageIndex < paginatedItems.length - 1 ? 'always' : 'auto' }"
        >
            <!-- En-tête + logo -->
            <div class="d-flex justify-content-between align-items-start" style="margin-bottom: 15px;">
                <img src="/logo.png" style="width: 90px; height: 85px;">
                <div style="text-align: left; flex: 1; margin-left: 20px;">
                    <div style="text-align: center; margin: 15px 0;">
                        <h3 style="font-weight: bold; font-size: 14pt; margin: 0; text-decoration: underline;">
                            DEMANDE D'ACHAT
                        </h3>
                    </div>

                    <div style="margin: 15px 170px; font-size: 9pt;">
                        <table>
                            <tr>
                                <td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #f0f0f0;">Demandeur :</td>
                                <td style="border: 1px solid #000; padding: 6px; min-width: 77%;">{{ dataObj.demandeur }}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #f0f0f0;">Date :</td>
                                <td style="border: 1px solid #000; padding: 6px;">{{ dataObj.date }}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #f0f0f0;">N° d'enregistrement :</td>
                                <td colspan="3" style="border: 1px solid #000; padding: 6px;">{{ route.params.id }}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #f0f0f0;">Objet :</td>
                                <td colspan="3" style="border: 1px solid #000; padding: 6px;">{{ dataObj.nom }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Tableau articles -->
            <div style="margin: 15px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
                    <thead>
                        <tr style="background-color: #f0f0f0;">
                            <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 4%;">N°</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: left; width: 20%;">Désignations</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 6%;">Nombre</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: left; width: 13%;">Imputation Analytique</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 13%;">Tiger</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: left; width: 13%;">Fournisseur possible</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: right; width: 10%;">PU budgété</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: right; width: 10%;">Montant total du budget alloué</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in page.items" :key="item.id">
                            <td style="border: 1px solid #000; padding: 4px; text-align: center;">{{ item.num }}</td>
                            <td style="border: 1px solid #000; padding: 4px;">{{ item.designation }}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: center;">{{ item.qte }}</td>
                            <td style="border: 1px solid #000; padding: 4px;">{{ item.imputation }}</td>
                            <td style="border: 1px solid #000; padding: 4px;">{{ item.num_tiger }}</td>
                            <td style="border: 1px solid #000; padding: 4px;">{{ item.fournisseur2 }}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: right;">{{ formatNumber(item.prixR) }}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">{{ formatNumber(item.totalR) }}</td>
                        </tr>
                        <tr v-if="pageIndex === paginatedItems.length - 1">
                            <td colspan="7" style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TOTAL</td>
                            <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold; font-size: 9pt;">
                                {{ formatNumber(totalMontant) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Signatures (dernière page) -->
            <div v-if="pageIndex === paginatedItems.length - 1" style="margin-top: 20px;">
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; font-size: 7.5pt;">
                    <!-- Demandeur -->
                    <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                        <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Le demandeur</p>
                        <div v-if="!dataObj.signatureDemandeur" style="margin-top: 35px;"></div>
                        <img v-else :src="dataObj.signatureDemandeur" alt="Signature" style="max-width: 100%; height: 50px; display: block; margin: 10px auto;">
                        <p style="margin: 5px 0 0 0; font-size: 7pt; text-align: center;">{{ dataObj.demandeur }}</p>
                        <p style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">{{ dataObj.date }}</p>
                    </div>
                    <!-- Supérieur -->
                    <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                        <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center; font-size: 7pt;">Le Responsable du Service demandeur</p>
                        <div v-if="!validateurs.superieur?.signatureValide" style="margin-top: 35px;"></div>
                        <img v-else :src="validateurs.superieur.signatureValide" alt="Signature" style="max-width: 100%; height: 50px; display: block; margin: 10px auto;">
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">{{ validateurs.superieur?.userValide || '' }}</p>
                        <p v-if="validateurs.superieur?.dateVal" style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">{{ validateurs.superieur.dateVal }}</p>
                    </div>
                    <!-- Finance -->
                    <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                        <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center; font-size: 7pt;">Validation par le Département Finance</p>
                        <div v-if="!validateurs.finance?.signatureValide" style="margin-top: 35px;"></div>
                        <img v-else :src="validateurs.finance.signatureValide" alt="Signature" style="max-width: 100%; height: 50px; display: block; margin: 10px auto;">
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">{{ validateurs.finance?.userValide || '' }}</p>
                        <p v-if="validateurs.finance?.dateVal" style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">{{ validateurs.finance.dateVal }}</p>
                    </div>
                    <!-- Achat -->
                    <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                        <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center; font-size: 7pt;">Réception par le Service Achat</p>
                        <div v-if="!validateurs.achat?.signatureValide" style="margin-top: 35px;"></div>
                        <img v-else :src="validateurs.achat.signatureValide" alt="Signature" style="max-width: 100%; height: 50px; display: block; margin: 10px auto;">
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">{{ validateurs.achat?.userValide || '' }}</p>
                        <p v-if="validateurs.achat?.dateVal" style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">{{ validateurs.achat.dateVal }}</p>
                    </div>
                    <!-- CG -->
                    <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                        <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center; font-size: 7pt;">Validation du CG</p>
                        <div v-if="!validateurs.cg?.signatureValide" style="margin-top: 35px;"></div>
                        <img v-else :src="validateurs.cg.signatureValide" alt="Signature" style="max-width: 100%; height: 50px; display: block; margin: 10px auto;">
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">{{ validateurs.cg?.userValide || '' }}</p>
                        <p v-if="validateurs.cg?.dateVal" style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">{{ validateurs.cg.dateVal }}</p>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div style="margin-top: 15px; font-size: 7pt; color: #666;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="text-align: left;">
                        <p style="margin: 3px 0 0 0;">
                            Document généré le {{ new Date().toLocaleDateString('fr-FR') }} - Demande N° {{ route.params.id }}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0;">Association PROMES / Programme SESAME</p>
                    </div>
                    <div v-if="paginatedItems.length > 1" style="text-align: right; font-weight: bold;">
                        Page {{ pageIndex + 1 }} / {{ paginatedItems.length }}
                    </div>
                </div>
            </div>
        </div>
    </ImpressionPdfGeneric>
</template>

<script setup>
import { niveau } from '~/assets/js/CommonVariable.js'
import ImpressionPdfGeneric from '~/components/ImpressionPdfGeneric.vue'

const supabase = useSupabaseClient()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const dataObj = ref({})
const demande_details = ref([])
const validateurs = ref({
    superieur: null,
    achat: null,
    finance: null,
    cg: null
})

const ITEMS_PER_PAGE = 15

const paginatedItems = computed(() => {
    const pages = []
    for (let i = 0; i < demande_details.value.length; i += ITEMS_PER_PAGE) {
        pages.push({ items: demande_details.value.slice(i, i + ITEMS_PER_PAGE) })
    }
    return pages.length ? pages : [{ items: [] }]
})

const totalMontant = computed(() =>
    demande_details.value.reduce((sum, item) => sum + (item.totalR || 0), 0)
)

const formatNumber = (number) => {
    if (!number) return '0'
    return new Intl.NumberFormat('fr-FR').format(number)
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const getDemandeValidee = async () => {
    loading.value = true
    try {
        const { data: items, error: itemsError } = await supabase
            .from('ses_demItems')
            .select('*, fournisseur2(nom)')
            .eq('id_obj', route.params.id)
            .eq('niv_val', niveau.valide)
            .order('num', { ascending: true })

        if (itemsError) throw itemsError

        demande_details.value = (items || []).map(item => ({
            ...item,
            fournisseur2: item.fournisseur2?.nom || ''
        }))

        const { data: demandeObj, error: demandeObjError } = await supabase
            .from('ses_demandeObj')
            .select('*, users:id_user(full_name), demSignature:id_user(signature_url)')
            .eq('id', route.params.id)
            .single()

        if (demandeObjError) throw demandeObjError

        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date),
            demandeur: demandeObj.users?.full_name || 'Non spécifié',
            signatureDemandeur: demandeObj.demSignature?.signature_url || null
        }

        if (items?.length) {
            const { data: itemsHisto, error: itemsHistoError } = await supabase
                .from('ses_histo')
                .select('id, niv_val, created_at, userValide:id_user(full_name), signatureValide:id_user(signature_url)')
                .eq('id_item', items[0].id)
                .order('niv_val', { ascending: true })
                .order('id', { ascending: false })

            if (itemsHistoError) throw itemsHistoError

            const validateursMap = {}
            ;(itemsHisto || []).forEach(item => {
                if (!validateursMap[item.niv_val]) {
                    validateursMap[item.niv_val] = {
                        niv_val: item.niv_val,
                        dateVal: formatDate(item.created_at),
                        userValide: item.userValide?.full_name || 'Non spécifié',
                        signatureValide: item.signatureValide?.signature_url || null
                    }
                }
            })

            validateurs.value = {
                superieur: validateursMap[2] || null,
                achat: validateursMap[3] || null,
                finance: validateursMap[4] || null,
                cg: validateursMap[5] || null
            }
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

if (!userStore.finance && !userStore.achat && userStore.type_compte !== 1) {
    navigateTo('/demande')
}

onMounted(() => getDemandeValidee())
</script>