<template>
    <ImpressionPdfGeneric
        titre="IMPRESSION DE LA DRFMS"
        retour-path="/signature/drfms"
        :file-name="`DRFMS_Validee_${route.params.id}`"
        orientation="l"
        :loading="loading"
    >
        <div class="pdf-page">
            <!-- Titre -->
            <div style="text-align: center; margin-bottom: 12px;">
                <h3 style="font-weight: bold; font-size: 13pt; margin: 0; text-decoration: underline;">
                    Demande de Remboursement des Frais Médicaux aux Salariés - DRFMS
                </h3>
            </div>

            <!-- Rappel politique -->
            <div style="border: 1.5px solid #1a5fb4; padding: 8px 10px; margin-bottom: 12px; font-size: 7.5pt; line-height: 1.35;">
                <p style="margin: 0 0 3px 0; font-weight: bold;">Rappel sur la politique santé SESAME et la procédure :</p>
                <p style="margin: 0;">Les prestations offertes par OSTIE ne sont pas remboursées en DRFMS.</p>
                <p style="margin: 0;">Pour les cas exceptionnels, demander l'autorisation préalable du DPR.</p>
                <p style="margin: 0;">Les bénéficiaires du remboursement des Frais médicaux sont les collaborateurs, leur conjoints et leurs enfants moins de 21 ans.</p>
                <p style="margin: 4px 0 0 0;">
                    Le collaborateur paie la totalité des frais, remet la DRFMS avec les pièces justificatives (ordonnance, factures) auprès du RDRHA.
                    Après contrôle du RDRHA et RDF, le DPR approuve et ordonne le remboursement des frais suivant les plafonds autorisés dans notre procédure.
                </p>
            </div>

            <!-- Infos collaborateur + personne soignée -->
            <div style="display: flex; gap: 20px; margin-bottom: 12px; font-size: 8.5pt;">
                <!-- Collaborateur -->
                <div style="flex: 1;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td colspan="2" style="border: 1px solid #000; padding: 4px 6px; font-weight: bold; background: #f0f0f0;">
                                Collaborateur :
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 4px 6px; width: 35%; font-weight: bold;">Nom, prénoms :</td>
                            <td style="border: 1px solid #000; padding: 4px 6px;">{{ dataObj.demandeur }}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold;">Code Tiers :</td>
                            <td style="border: 1px solid #000; padding: 4px 6px;">{{ dataObj.code_tiers }}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold;">Abrégé prénom :</td>
                            <td style="border: 1px solid #000; padding: 4px 6px;">{{ dataObj.abr_prenom }}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold;">Service :</td>
                            <td style="border: 1px solid #000; padding: 4px 6px;">{{ dataObj.service }}</td>
                        </tr>
                    </table>
                </div>

                <!-- Personne soignée -->
                <div style="flex: 1;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold; background: #f0f0f0;">
                                Nom et prénoms de la personne soignée :
                            </td>
                            <td style="border: 1px solid #000; padding: 4px 6px;">
                                {{ dataObj.pers_soin }}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border: 1px solid #000; padding: 6px;">
                                <span style="margin-right: 18px;">
                                    <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #000; text-align: center; line-height: 12px; margin-right: 4px;">
                                        {{ isCat('Moi-même') || isCat('moi-même') || isCat('Moi meme') ? '✓' : '' }}
                                    </span>
                                    Moi-même
                                </span>
                                <span style="margin-right: 18px;">
                                    <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #000; text-align: center; line-height: 12px; margin-right: 4px;">
                                        {{ isCat('Conjoint') || isCat('conjoint') ? '✓' : '' }}
                                    </span>
                                    Conjoint
                                </span>
                                <span>
                                    <span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #000; text-align: center; line-height: 12px; margin-right: 4px;">
                                        {{ isCat('Enfant') || isCat('enfant') ? '✓' : '' }}
                                    </span>
                                    Enfant
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold;">N° d'enregistrement :</td>
                            <td style="border: 1px solid #000; padding: 4px 6px;">{{ route.params.id }}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold;">Date de la demande :</td>
                            <td style="border: 1px solid #000; padding: 4px 6px;">{{ dataObj.date }}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 4px 6px; font-weight: bold;">Tiger :</td>
                            <td style="border: 1px solid #000; padding: 4px 6px;">{{ dataObj.tiger }}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Tableau des soins -->
            <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt; margin-bottom: 12px;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #000; padding: 4px; width: 16%;">Type de soins</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 18%;">Raison et description des soins</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 9%;">Date de soins</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 12%;">Cachet et signature du médecin prescripteur</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 9%;">Coût (ar)</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 10%;">Taux Normal</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 10%;">Si accident de travail</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 10%;">Montant à rembourser (ar)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, idx) in lignes" :key="item.id || idx">
                        <td style="border: 1px solid #000; padding: 4px;">{{ item.type_nom }}</td>
                        <td style="border: 1px solid #000; padding: 4px;">{{ item.raison || '' }}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: center;">{{ item.date_soins || '' }}</td>
                        <td style="border: 1px solid #000; padding: 4px;">{{ item.cachet || '' }}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">{{ formatNumber(item.cout) }}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: center;">
                            {{ item.taux === 'normal' ? (item.pourcentage ? item.pourcentage + '%' : 'Normal') : '' }}
                        </td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: center;">
                            {{ item.taux === 'accident' ? (item.pourcentage ? item.pourcentage + '%' : 'Accident') : '' }}
                        </td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">
                            {{ formatNumber(item.montant) }}
                        </td>
                    </tr>

                    <!-- Lignes vides pour garder la forme du document si peu d'items -->
                    <tr v-for="n in emptyRows" :key="'empty-' + n">
                        <td style="border: 1px solid #000; padding: 10px;">&nbsp;</td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                        <td style="border: 1px solid #000; padding: 10px;"></td>
                    </tr>

                    <!-- TOTAL -->
                    <tr>
                        <td colspan="7" style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold; background: #f0f0f0;">
                            TOTAL
                        </td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">
                            {{ formatNumber(totalMontant) }}
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Signatures : Demandeur | RH | Finance | DPR | CG -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; font-size: 7.5pt; margin-top: 16px;">
                <!-- Demandeur -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Signature du demandeur</p>
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

                <!-- RH (RDRHA) -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Validation par le RDRHA</p>
                    <div v-if="!validateurs.rh?.signatureValide" style="margin-top: 35px;"></div>
                    <img
                        v-else
                        :src="validateurs.rh.signatureValide"
                        alt="Signature RH"
                        style="max-width: 100%; height: 50px; display: block; margin: 10px auto;"
                    >
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">
                        {{ validateurs.rh?.userValide || '' }}
                    </p>
                    <p v-if="validateurs.rh?.dateVal" style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">
                        {{ validateurs.rh.dateVal }}
                    </p>
                </div>

                <!-- Finance (RDF) -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Contrôle par le RDF</p>
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

                <!-- DPR -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Approbation DPR</p>
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
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Approbation CG</p>
                    <div v-if="!validateurs.cg?.signatureValide" style="margin-top: 35px;"></div>
                    <img
                        v-else
                        :src="validateurs.cg.signatureValide"
                        alt="Signature cg"
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

            <!-- Footer (même style que DA) -->
            <div style="margin-top: 15px; font-size: 7pt; color: #666;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="text-align: left;">
                        <p style="margin: 3px 0 0 0;">
                            Document généré le {{ new Date().toLocaleDateString('fr-FR') }} - DRFMS N° {{ route.params.id }}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0;">Association PROMES / Programme SESAME</p>
                    </div>
                </div>
            </div>
        </div>
    </ImpressionPdfGeneric>
</template>

<script setup>
import { niveauDRFMS } from '~/assets/js/CommonVariable.js'
import ImpressionPdfGeneric from '~/components/ImpressionPdfGeneric.vue'

const supabase = useSupabaseClient()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const dataObj = ref({})
const lignes = ref([])
const validateurs = ref({
    rh: null,
    finance: null,
    dpr: null,
    cg: null
})

const MIN_ROWS = 1
const emptyRows = computed(() => Math.max(0, MIN_ROWS - lignes.value.length))

const totalMontant = computed(() =>
    lignes.value.reduce((sum, item) => sum + (Number(item.montant) || 0), 0)
)

const formatNumber = (number) => {
    if (number === null || number === undefined || number === '') return ''
    return new Intl.NumberFormat('fr-FR').format(Number(number) || 0)
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const isCat = (label) => {
    const cat = (dataObj.value.cat_pers || '').toString().toLowerCase().trim()
    return cat === label.toLowerCase().trim()
}

const getDemandeValidee = async () => {
    loading.value = true
    try {
        // En-tête + user (code_tiers, abr_prenom, signature)
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
            .eq('cat_proc', 'drfms')
            .single()

        if (objError) throw objError

        dataObj.value = {
            ...obj,
            date: formatDate(obj.date),
            demandeur: obj.users?.full_name || 'Non spécifié',
            service: obj.users?.service || '-',
            code_tiers: obj.users?.code_tiers || '',
            abr_prenom: obj.users?.abr_prenom || '',
            pers_soin: obj.pers_soin || '',
            cat_pers: obj.cat_pers || '',
            signatureDemandeur: obj.users?.signature_url || null
        }

        // Lignes validées
        const { data: items, error: itemsError } = await supabase
            .from('ses_items_drfms')
            .select(`
                *,
                type_soins: type ( nom, pourcentage_normal, pourcentage_accident )
            `)
            .eq('id_obj', route.params.id)
            .order('id', { ascending: true })

        if (itemsError) throw itemsError

        lignes.value = (items || []).map(item => {
            const pct =
                item.pourcentage ??
                (item.taux === 'accident'
                    ? item.type_soins?.pourcentage_accident
                    : item.type_soins?.pourcentage_normal)

            return {
                ...item,
                type_nom: item.type_soins?.nom || item.type || '',
                date_soins: item.date ? formatDate(item.date) : '',
                pourcentage: pct
            }
        })

        // Historique signatures (ses_histo2) — adapter les niv_val selon ton niveauDRFMS
        const { data: histo, error: histoError } = await supabase
            .from('ses_histo2')
            .select(`
                id,
                niv_val,
                created_at,
                userValide: id_user ( full_name, signature_url )
            `)
            .eq('id_obj', route.params.id)
            .eq('cat_proc', 'drfms')
            .in('type', ['valider', 'fin']) 
            .order('niv_val', { ascending: true }) // <-- exclut les retours et les autres types
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

        // Adapte ces clés aux vraies valeurs de niveauDRFMS dans CommonVariable.js
        validateurs.value = {
            dpr:     map[niveauDRFMS.dpr + 1]     || null,  // map[2]
            rh:      map[niveauDRFMS.rh + 1]      || null,  // map[3]
            finance: map[niveauDRFMS.finance + 1] || null,  // map[4]
            cg:      map[niveauDRFMS.cg + 1]      || null, // map[5]
            // cheque:  map[niveauDRFMS.cheque + 1]  || null, // map[6]
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

if (!userStore.finance && !userStore.rh && !userStore.dpr && userStore.type_compte !== 1) {
    navigateTo('/demande')
}

onMounted(() => getDemandeValidee())
</script>