<template>
    <ImpressionPdfGeneric
        titre="IMPRESSION DE LA NOTE DE FRAIS"
        retour-path="/signature/ndf"
        :file-name="`NDF_Validee_${route.params.id}`"
        orientation="l"
        :loading="loading"
    >
        <div class="pdf-page">
            <!-- Titre -->
            <div style="text-align: center; margin-bottom: 10px;">
                <h3 style="font-weight: bold; font-size: 14pt; margin: 0;">
                    NOTE DE FRAIS SESAME
                </h3>
            </div>

            <!-- En-tête infos -->
            <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 10px;">
                <tr>
                    <td style="border: 1px solid #000; padding: 4px 6px; width: 18%; font-weight: bold; background: #f5f5f5;">Demandeur</td>
                    <td style="border: 1px solid #000; padding: 4px 6px; width: 32%;">{{ dataObj.demandeur }}</td>
                    <td style="border: 1px solid #000; padding: 4px 6px; width: 18%; font-weight: bold; background: #f5f5f5;">Abrégé prénom</td>
                    <td style="border: 1px solid #000; padding: 4px 6px; width: 32%;">{{ dataObj.abr_prenom }}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Département</td>
                    <td style="border: 1px solid #000; padding: 4px 6px;">{{ dataObj.departement || 'Département Finance' }}</td>
                    <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Tiers</td>
                    <td style="border: 1px solid #000; padding: 4px 6px;">{{ dataObj.code_tiers }}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Service</td>
                    <td style="border: 1px solid #000; padding: 4px 6px;">{{ dataObj.service }}</td>
                    <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Date de la demande</td>
                    <td style="border: 1px solid #000; padding: 4px 6px;">{{ dataObj.dateMoisAnnee }}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">N° d'enregistrement</td>
                    <td style="border: 1px solid #000; padding: 4px 6px;" colspan="3">{{ route.params.id }}</td>
                </tr>
            </table>

            <!-- Tableau des lignes -->
            <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt; margin-bottom: 4px;">
                <thead>
                    <tr style="background-color: #e8a838; color: #000;">
                        <th style="border: 1px solid #000; padding: 4px; width: 4%;">N°</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 9%;">Date</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 28%;">Libellé de facture / Commentaires</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 14%;">Nature de la dépense</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 15%;">Ligne Budget</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 15%;">Tiger</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 12%;">Montant</th>
                        
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, idx) in lignes" :key="item.id || idx">
                        <td style="border: 1px solid #000; padding: 4px; text-align: center;">{{ item.num || idx + 1 }}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: center;">{{ item.date_ligne || '' }}</td>
                        <td style="border: 1px solid #000; padding: 4px;">{{ item.description || '' }}</td>
                        <td style="border: 1px solid #000; padding: 4px;">{{ item.nature || '' }}</td>
                        <td style="border: 1px solid #000; padding: 4px;">{{ item.imputation_label || '' }}</td>
                        <td style="border: 1px solid #000; padding: 4px;">{{ item.tiger || '' }}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">{{ formatNumber(item.montant) }} Ar</td>
                    </tr>

                    <!-- Lignes vides pour garder la forme -->
                    <tr v-for="n in emptyRows" :key="'empty-' + n">
                        <td style="border: 1px solid #000; padding: 10px; text-align: center;">{{ lignes.length + n }}</td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                    </tr>

                    <!-- Totaux 
                    <tr style="background: #e8a838;">
                        <td colspan="4" style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold;">
                            SOUS TOTAL
                        </td>
                        <td style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold;">
                            {{ formatNumber(totalMontant) }} Ar
                        </td>
                        <td colspan="2" style="border: 1px solid #000; padding: 5px;"></td>
                    </tr>-->
                    <!--
                    <tr style="background: #e8a838;">
                        <td colspan="4" style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold;">
                            FICHE DE TRANSPORT
                        </td>
                        <td style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold;">
                            {{ formatNumber(dataObj.transport || 0) }} Ar
                        </td>
                        <td colspan="2" style="border: 1px solid #000; padding: 5px;"></td>
                    </tr>-->
                    <tr style="background: #e8a838;">
                        <td colspan="6" style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold;">
                            TOTAL
                        </td>
                        <td style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold;">
                            {{ formatNumber(totalNdf) }} Ar
                        </td>
                        <!--
                        <td colspan="3" style="border: 1px solid #000; padding: 5px; font-weight: bold;">
                            Mode de Remboursement : {{ dataObj.mode_remboursement || '' }}
                        </td>
                        -->
                    </tr>
                </tbody>
            </table>

            <!-- Signatures -->
            <p style="font-size: 8pt; font-weight: bold; margin: 14px 0 6px 0;">Signatures :</p>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; font-size: 7.5pt;">
                <!-- Demandeur -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Demandeur</p>
                    <div v-if="!dataObj.signatureDemandeur" style="margin-top: 35px;"></div>
                    <img
                        v-else
                        :src="dataObj.signatureDemandeur"
                        alt="Signature Demandeur"
                        style="max-width: 100%; height: 50px; display: block; margin: 10px auto;"
                    >
                    <p style="margin: 5px 0 0 0; font-size: 7pt; text-align: center;">{{ dataObj.demandeur }}</p>
                    <p style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">{{ dataObj.dateMoisAnnee }}</p>
                </div>

                <!-- Supérieur -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Supérieur hiérarchique</p>
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
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Département Finance</p>
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

                <!-- DPR / Directeur du Programme -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Directeur du Programme</p>
                    <div v-if="!validateurs.dpr?.signatureValide" style="margin-top: 35px;"></div>
                    <img
                        v-else
                        :src="validateurs.dpr.signatureValide"
                        alt="Signature DPR"
                        style="max-width: 100%; height: 50px; display: block; margin: 10px auto;"
                    >
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">
                        {{ validateurs.dpr?.userValide || '' }}
                    </p>
                    <p v-if="validateurs.dpr?.dateVal" style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">
                        {{ validateurs.dpr.dateVal }}
                    </p>
                </div>

                <!-- CG -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Controlleur de gestion</p>
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

            <!-- Rappels -->
            <div style="border: 1.5px solid #c00; padding: 8px 10px; margin-top: 14px; font-size: 7.5pt; line-height: 1.35;">
                <p style="margin: 0 0 3px 0; font-weight: bold;">Rappels :</p>
                <p style="margin: 0;">La note de frais doit être adossée à la liasse des justificatifs.</p>
                <p style="margin: 0;">Les justificatifs doivent être rangés et numérotés dans l'ordre de la liste ci-dessus.</p>
                <p style="margin: 0;">La note de frais est utilisée simplement pour les petites dépenses de fonctionnement.</p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 12px; font-size: 7pt; color: #666;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="margin: 0;">
                            Document généré le {{ new Date().toLocaleDateString('fr-FR') }}
                            — NDF N° {{ route.params.id }}
                        </p>
                    </div>
                    <div>
                        <p style="margin: 0;">Association PROMES / Programme SESAME</p>
                    </div>
                </div>
            </div>
        </div>
    </ImpressionPdfGeneric>
</template>

<script setup>
import { niveauNDF } from '~/assets/js/CommonVariable.js'
import ImpressionPdfGeneric from '~/components/ImpressionPdfGeneric.vue'

const supabase = useSupabaseClient()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const dataObj = ref({})
const lignes = ref([])
const validateurs = ref({
    superieur: null,
    finance: null,
    dpr: null,
    cg: null
})

const MIN_ROWS = 1
const emptyRows = computed(() => Math.max(0, MIN_ROWS - lignes.value.length))

const totalMontant = computed(() =>
    lignes.value.reduce((sum, item) => sum + (Number(item.montant) || 0), 0)
)

const totalNdf = computed(() =>
    totalMontant.value + (Number(dataObj.value.transport) || 0)
)

const formatNumber = (number) => {
    if (number === null || number === undefined || number === '') return '0'
    return new Intl.NumberFormat('fr-FR').format(Number(number) || 0)
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`
}

/** Date de la demande : mois + année seulement (ex: 09/2026) */
const formatMoisAnnee = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${month}/${year}`
}

const getDemandeValidee = async () => {
    loading.value = true
    try {
        const { data: obj, error: objError } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user (
                    full_name,
                    service,
                    code_tiers,
                    abr_prenom,
                    signature_url
                )
            `)
            .eq('id', route.params.id)
            .eq('cat_proc', 'ndf')
            .single()

        if (objError) throw objError

        dataObj.value = {
            ...obj,
            demandeur: obj.users?.full_name || 'Non spécifié',
            service: obj.users?.service || '-',
            code_tiers: obj.users?.code_tiers || '',
            abr_prenom: obj.users?.abr_prenom || '',
            dateMoisAnnee: formatMoisAnnee(obj.date),
            transport: obj.transport || 0,
            mode_remboursement: obj.mode_remboursement || '',
            signatureDemandeur: obj.users?.signature_url || null
        }

        // Lignes validées
        const { data: items, error: itemsError } = await supabase
            .from('ses_items_ndf')
            .select('*')
            .eq('id_obj', route.params.id)
            .in('niv_val', [niveauNDF.valide, niveauNDF.cheque])
            .order('num', { ascending: true })

        if (itemsError) throw itemsError

        // Résoudre noms d'imputation
        const { data: imputations } = await supabase
            .from('ses_imputation')
            .select('id, nom')
            .eq('etat_del', false)

        const impMap = Object.fromEntries((imputations || []).map(i => [i.id, i.nom]))

        lignes.value = (items || []).map((item, index) => ({
            ...item,
            num: item.num || index + 1,
            date_ligne: item.date ? formatDate(item.date) : '',
            imputation_label: impMap[item.imputation] || item.imputation || '',
            ok: item.ok || 'OK'
        }))


        // Signatures via historique
        const { data: histo, error: histoError } = await supabase
            .from('ses_histo2')
            .select(`
                id,
                niv_val,
                created_at,
                userValide: id_user ( full_name, signature_url )
            `)
            .eq('id_obj', route.params.id)
            .eq('cat_proc', 'ndf')
            .in('type',['valider', 'fin']) // <-- exclut les retours et les autres types
            .order('niv_val', { ascending: true })
            .order('id', { ascending: false })

        if (histoError) throw histoError

        const map = {}
        ;(histo || []).forEach(h => {
            if (!map[h.niv_val]) {
                map[h.niv_val] = {
                    niv_val: h.niv_val,
                    dateVal: formatMoisAnnee(h.created_at),
                    userValide: h.userValide?.full_name || '',
                    signatureValide: h.userValide?.signature_url || null
                }
            }
        })
        
        // Adapter selon ta logique d'insert niv_val dans ses_histo2
        validateurs.value = {
            superieur: map[niveauNDF.superieur + 1] || null,
            finance: map[niveauNDF.finance + 1] || null,
            dpr: map[niveauNDF.dpr + 1] || null,
            cg: map[niveauNDF.cg + 1] || null
        }
        console.log('validateurs:', validateurs.value)
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

if (!userStore.finance && !userStore.cg && !userStore.cheque && userStore.type_compte !== 1) {
    navigateTo('/demande')
}

onMounted(() => getDemandeValidee())
</script>