<template>
    <ImpressionPdfGeneric
        titre="IMPRESSION DE LA DEMANDE DE BOURSE"
        retour-path="/signature/bourse"
        :file-name="`Bourse_Validee_${route.params.id}`"
        orientation="l"
        :loading="loading"
    >
        <div
            v-for="(page, pageIndex) in paginatedItems"
            :key="pageIndex"
            class="pdf-page"
            :style="{ pageBreakAfter: pageIndex < paginatedItems.length - 1 ? 'always' : 'auto' }"
        >
            <!-- En-tête -->
            <div class="d-flex justify-content-between align-items-start" style="margin-bottom: 15px;">
                <img src="/logo.png" style="width: 90px; height: 85px;">
                <div style="text-align: left; flex: 1; margin-left: 20px;">
                    <div style="text-align: center; margin: 15px 0;">
                        <h3 style="font-weight: bold; font-size: 14pt; margin: 0; text-decoration: underline;">
                            DEMANDE D'ENGAGEMENT DE DÉPENSES POUR LES ÉTUDIANTS
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
                                <td style="border: 1px solid #000; padding: 6px;">{{ route.params.id }}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #f0f0f0;">Objet :</td>
                                <td style="border: 1px solid #000; padding: 6px;">{{ dataObj.obj_bourse }}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #f0f0f0;">Service :</td>
                                <td style="border: 1px solid #000; padding: 6px;">{{ dataObj.service }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Tableau des lignes -->
            <div style="margin: 15px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
                    <thead>
                        <tr style="background-color: #f0f0f0;">
                            <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 5%;">N°</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: left; width: 30%;">Description</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 8%;">Nombre</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: right; width: 12%;">Montant unitaire</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: right; width: 12%;">Montant</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: left; width: 16%;">Imputation analytique</th>
                            <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 12%;">Code Tiger</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in page.items" :key="item.id">
                            <td style="border: 1px solid #000; padding: 4px; text-align: center;">{{ item.num }}</td>
                            <td style="border: 1px solid #000; padding: 4px;">{{ item.description }}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: center;">{{ item.qte }}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: right;">{{ formatNumber(item.prix) }}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">{{ formatNumber(item.montant) }}</td>
                            <td style="border: 1px solid #000; padding: 4px;">{{ item.imputation_label || item.imputation || '' }}</td>
                            <td style="border: 1px solid #000; padding: 4px; text-align: center;">{{ item.tiger || '' }}</td>
                        </tr>

                        <!-- TOTAL sur la dernière page -->
                        <tr v-if="pageIndex === paginatedItems.length - 1">
                            <td colspan="6" style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TOTAL</td>
                            <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold; font-size: 9pt;">
                                {{ formatNumber(totalMontant) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Signatures (dernière page) — PAS de responsable achat -->
            <div v-if="pageIndex === paginatedItems.length - 1" style="margin-top: 20px;">
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 7.5pt;">
                    <!-- Demandeur -->
                    <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                        <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Le demandeur</p>
                        <div v-if="!dataObj.signatureDemandeur" style="margin-top: 35px;"></div>
                        <img
                            v-else
                            :src="dataObj.signatureDemandeur"
                            alt="Signature Demandeur"
                            style="max-width: 100%; height: 50px; display: block; margin: 10px auto;"
                        >
                        <p style="margin: 5px 0 0 0; font-size: 7pt; text-align: center;">{{ dataObj.demandeur }}</p>
                        <p style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">{{ dataObj.date }}</p>
                    </div>

                    <!-- Supérieur (N+1) -->
                    <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                        <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center; font-size: 7pt;">
                            Le Responsable du Service demandeur
                        </p>
                        <div v-if="!validateurs.superieur?.signatureValide" style="margin-top: 35px;"></div>
                        <img
                            v-else
                            :src="validateurs.superieur.signatureValide"
                            alt="Signature Supérieur"
                            style="max-width: 100%; height: 50px; display: block; margin: 10px auto;"
                        >
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">
                            {{ validateurs.superieur?.userValide || '' }}
                        </p>
                        <p v-if="validateurs.superieur?.dateVal" style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">
                            {{ validateurs.superieur.dateVal }}
                        </p>
                    </div>

                    <!-- Finance -->
                    <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                        <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center; font-size: 7pt;">
                            Validation budgétaire — Finance
                        </p>
                        <div v-if="!validateurs.finance?.signatureValide" style="margin-top: 35px;"></div>
                        <img
                            v-else
                            :src="validateurs.finance.signatureValide"
                            alt="Signature Finance"
                            style="max-width: 100%; height: 50px; display: block; margin: 10px auto;"
                        >
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">
                            {{ validateurs.finance?.userValide || '' }}
                        </p>
                        <p v-if="validateurs.finance?.dateVal" style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">
                            {{ validateurs.finance.dateVal }}
                        </p>
                    </div>

                    <!-- CG -->
                    <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                        <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center; font-size: 7pt;">
                            Validation du CG
                        </p>
                        <div v-if="!validateurs.cg?.signatureValide" style="margin-top: 35px;"></div>
                        <img
                            v-else
                            :src="validateurs.cg.signatureValide"
                            alt="Signature CG"
                            style="max-width: 100%; height: 50px; display: block; margin: 10px auto;"
                        >
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">
                            {{ validateurs.cg?.userValide || '' }}
                        </p>
                        <p v-if="validateurs.cg?.dateVal" style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">
                            {{ validateurs.cg.dateVal }}
                        </p>
                    </div>
                </div>

                <!-- Ligne optionnelle DPR (si tu veux 5 cases, décommente et passe en repeat(5)) -->
                <!--
                <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center; font-size: 7pt;">Approbation DPR</p>
                    ...
                </div>
                -->
            </div>

            <!-- Footer (identique DA) -->
            <div style="margin-top: 15px; font-size: 7pt; color: #666;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="text-align: left;">
                        <p style="margin: 3px 0 0 0;">
                            Document généré le {{ new Date().toLocaleDateString('fr-FR') }}
                            - Demande de bourse N° {{ route.params.id }}
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
import { niveauBourse } from '~/assets/js/CommonVariable.js'
import ImpressionPdfGeneric from '~/components/ImpressionPdfGeneric.vue'

const supabase = useSupabaseClient()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const dataObj = ref({})
const demande_details = ref([])
const validateurs = ref({
    superieur: null,
    finance: null,
    cg: null,
    dpr: null
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
    demande_details.value.reduce((sum, item) => sum + (Number(item.montant) || 0), 0)
)

const formatNumber = (number) => {
    if (number === null || number === undefined || number === '') return '0'
    return new Intl.NumberFormat('fr-FR').format(Number(number) || 0)
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const getDemandeValidee = async () => {
    loading.value = true
    try {
        // En-tête
        const { data: obj, error: objError } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name, service, signature_url )
            `)
            .eq('id', route.params.id)
            .eq('cat_proc', 'bourse')
            .single()

        if (objError) throw objError

        dataObj.value = {
            ...obj,
            date: formatDate(obj.date),
            demandeur: obj.users?.full_name || 'Non spécifié',
            service: obj.users?.service || '-',
            obj_bourse: obj.obj_bourse || '-',
            signatureDemandeur: obj.users?.signature_url || null
        }

        // Lignes validées
        const { data: items, error: itemsError } = await supabase
            .from('ses_items_bourse')
            .select('*')
            .eq('id_obj', route.params.id)
            .eq('niv_val', niveauBourse.valide)
            .order('num', { ascending: true })

        if (itemsError) throw itemsError

        // Optionnel : résoudre le nom d'imputation si stocké en id
        const { data: imputations } = await supabase
            .from('ses_imputation')
            .select('id, nom')
            .eq('etat_del', false)

        const impMap = Object.fromEntries((imputations || []).map(i => [i.id, i.nom]))

        demande_details.value = (items || []).map((item, index) => ({
            ...item,
            num: item.num || index + 1,
            imputation_label: impMap[item.imputation] || item.imputation || ''
        }))

        // Historique signatures (ses_histo2)
        const { data: histo, error: histoError } = await supabase
            .from('ses_histo2')
            .select(`
                id,
                niv_val,
                created_at,
                userValide: id_user ( full_name, signature_url )
            `)
            .eq('id_obj', route.params.id)
            .eq('cat_proc', 'bourse')
            .order('niv_val', { ascending: true })
            .order('id', { ascending: false })

        if (histoError) throw histoError

        const map = {}
        ;(histo || []).forEach(h => {
            if (!map[h.niv_val]) {
                map[h.niv_val] = {
                    niv_val: h.niv_val,
                    dateVal: formatDate(h.created_at),
                    userValide: h.userValide?.full_name || '',
                    signatureValide: h.userValide?.signature_url || null
                }
            }
        })

        // Adapter selon la façon dont tu stockes niv_val dans l'historique
        validateurs.value = {
            superieur: map[niveauBourse.superieur] || map[niveauBourse.finance] || null,
            finance: map[niveauBourse.finance] || map[niveauBourse.cg] || null,
            cg: map[niveauBourse.cg] || map[niveauBourse.dpr] || null,
            dpr: map[niveauBourse.dpr] || map[niveauBourse.cheque] || map[niveauBourse.valide] || null
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

if (!userStore.finance && userStore.type_compte !== 1) {
    navigateTo('/demande')
}

onMounted(() => getDemandeValidee())
</script>