<!--
  DrfmeImpression.vue — Impression d'une DRFME validée (Demande de
  Remboursement des Frais Médicaux des Jeunes). Calquée sur l'impression de
  la NDF, avec la mise en page du formulaire papier :
    - logo en haut à gauche, titre au centre, date de la demande à droite
    - service du demandeur (valeur exacte, sans cases à cocher) et projet
    - tableau : Désignation | Montant total | Part étudiant | Part SESAME |
      Motif ou destination | Observation
    - "Montant total requête" = somme des PARTS SESAME
    - signatures : demandeur, N+1, chef de département, service finance
    - bloc "Chèque au nom de" / "N° de chèque" (à compléter plus tard)
-->
<template>
    <ImpressionPdfGeneric
        titre="IMPRESSION DE LA DRFME"
        retour-path="/signature/drfme"
        :file-name="`DRFME_Validee_${route.params.id}`"
        orientation="l"
        :loading="loading"
    >
        <div class="pdf-page">
            <!-- En-tête : logo | titre | date de la demande -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div style="width: 20%;">
                    <img src="/logo.png" alt="PROMES" style="height: 48px;">
                </div>

                <div style="width: 58%; text-align: center; padding-top: 10px;">
                    <h3 style="font-weight: bold; font-size: 12pt; margin: 0;">
                        DEMANDE DE REMBOURSEMENT DES FRAIS MEDICAUX DES JEUNES
                    </h3>
                </div>

                <div style="width: 20%;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
                        <tr>
                            <td style="border: 1px solid #000; padding: 2px 6px; text-align: center; color: #555;">
                                Date de la demande
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 12px 6px 4px 6px; text-align: center; font-weight: bold;">
                                {{ dataObj.dateDemande }}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Service (valeur exacte du demandeur) et Projet -->
            <div style="display: flex; gap: 14px; margin-bottom: 10px; font-size: 8.5pt;width: 50%">
                <table style="flex: 1; border-collapse: collapse;width: 50%">
                    <tr>
                        <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; font-weight: bold; background: #f0f0f0;">
                            SERVICE
                        </td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 6px; text-align: center;">
                            {{ dataObj.service }}
                        </td>
                    </tr>
                </table>

                <table style="flex: 1; border-collapse: collapse;width: 50%">
                    <tr>
                        <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; font-weight: bold; background: #f0f0f0;">
                            PROJET
                        </td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 6px; text-align: center;">
                            {{ dataObj.projet }}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Nom du demandeur -->
            <p style="font-size: 9pt; margin: 0 0 8px 0;">
                Nom du demandeur : <strong>{{ dataObj.demandeur }}</strong>
            </p>

            <!-- Tableau des lignes -->
            <table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-bottom: 4px;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #000; padding: 4px; width: 27%;">Désignation</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 11%;">Montant Total</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 11%;">Part Etudiant</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 11%;">Part SESAME</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 20%;">Motif ou Destination</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 20%;">Observation</th>
                        <th style="border: 1px solid #000; padding: 4px; width: 20%;">Tiger</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, idx) in lignes" :key="item.id || idx">
                        <td style="border: 1px solid #000; padding: 4px;">{{ item.designation || '' }}</td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">{{ formatNumber(item.montant_total) }}</td>
                        <!-- Comme sur le formulaire papier : part étudiant laissée
                             vide quand elle vaut 0 (remboursement à 100%) -->
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">
                            {{ Number(item.montant_etudiant) ? formatNumber(item.montant_etudiant) : '' }}
                        </td>
                        <td style="border: 1px solid #000; padding: 4px; text-align: right;">{{ formatNumber(item.montant_sesame) }}</td>
                        <td style="border: 1px solid #000; padding: 4px;">{{ item.detail || '' }}</td>
                        <td style="border: 1px solid #000; padding: 4px;">{{ item.observation || '' }}</td>
                        <td style="border: 1px solid #000; padding: 4px;">{{ item.tiger || '' }}</td>
                    </tr>

                    <!-- Lignes vides pour garder la forme du formulaire -->
                    <tr v-for="n in emptyRows" :key="'empty-' + n">
                        <td style="border: 1px solid #000; padding: 9px;">&nbsp;</td>
                        <td style="border: 1px solid #000; padding: 9px;"></td>
                        <td style="border: 1px solid #000; padding: 9px;"></td>
                        <td style="border: 1px solid #000; padding: 9px;"></td>
                        <td style="border: 1px solid #000; padding: 9px;"></td>
                        <td style="border: 1px solid #000; padding: 9px;"></td>
                    </tr>

                    <!-- Montant total requête = somme des parts SESAME -->
                    <tr>
                        <td colspan="3" style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold;">
                            Montant total requête
                        </td>
                        <td style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold;">
                            {{ formatNumber(totalSesame) }}
                        </td>
                        <td colspan="3" style="border: 1px solid #000; padding: 5px; background: #d9d9d9;"></td>
                    </tr>
                </tbody>
            </table>

            <!-- Signatures : demandeur | N+1 | chef de département | finance | chèque -->
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; font-size: 7.5pt; margin-top: 14px;">
                <!-- Demandeur -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Signature demandeur</p>
                    <div v-if="!dataObj.signatureDemandeur" style="margin-top: 35px;"></div>
                    <img
                        v-else
                        :src="dataObj.signatureDemandeur"
                        alt="Signature Demandeur"
                        style="max-width: 100%; height: 50px; display: block; margin: 10px auto;"
                    >
                    <p style="margin: 5px 0 0 0; font-size: 7pt; text-align: center;">{{ dataObj.demandeur }}</p>
                    <p style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">{{ dataObj.dateDemande }}</p>
                </div>

                <!-- N+1 : supérieur hiérarchique -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Signature N+1</p>
                    <div v-if="!validateurs.superieur?.signatureValide" style="margin-top: 35px;"></div>
                    <img
                        v-else
                        :src="validateurs.superieur.signatureValide"
                        alt="Signature N+1"
                        style="max-width: 100%; height: 50px; display: block; margin: 10px auto;"
                    >
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">
                        {{ validateurs.superieur?.userValide || '' }}
                    </p>
                    <p v-if="validateurs.superieur?.dateVal" style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">
                        {{ validateurs.superieur.dateVal }}
                    </p>
                </div>

                <!-- Chef de département -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Validation du Chef de département</p>
                    <div v-if="!validateurs.chefDepartement?.signatureValide" style="margin-top: 35px;"></div>
                    <img
                        v-else
                        :src="validateurs.chefDepartement.signatureValide"
                        alt="Signature Chef de département"
                        style="max-width: 100%; height: 50px; display: block; margin: 10px auto;"
                    >
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">
                        {{ validateurs.chefDepartement?.userValide || '' }}
                    </p>
                    <p v-if="validateurs.chefDepartement?.dateVal" style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">
                        {{ validateurs.chefDepartement.dateVal }}
                    </p>
                </div>

                <!-- Service Finance -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Validation du Service Finance</p>
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

                <!-- Service CG -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Validation du CG</p>
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
                <!-- Chèque : valeurs à compléter plus tard (voir chequeNom et
                     numCheque dans le script) -->
                <div style="border: 1px solid #999; padding: 8px; min-height: 95px;">
                    <p style="font-weight: bold; margin: 0 0 3px 0;">Chèque au nom de :</p>
                    <p style="margin: 4px 0 18px 0; font-size: 8pt;">{{ chequeNom }}</p><br><br>
                    <p style="font-weight: bold; margin: 0 0 3px 0;">N° de chèque :</p>
                    <p style="margin: 4px 0 0 0; font-size: 8pt;">{{ numCheque }}</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="margin-top: 14px; font-size: 7pt; color: #666;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="margin: 0;">
                            Document généré le {{ new Date().toLocaleDateString('fr-FR') }}
                            — DRFME N° {{ route.params.id }}
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
import { niveauDRFME } from '~/assets/js/CommonVariable.js'
import ImpressionPdfGeneric from '~/components/ImpressionPdfGeneric.vue'

const supabase = useSupabaseClient()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const dataObj = ref({})
const lignes = ref([])
const validateurs = ref({
    superieur: null,
    chefDepartement: null,
    finance: null,
    cg: null
})

// ⚠️ À COMPLÉTER PLUS TARD : la configuration du chèque pour la DRFME n'est
// pas encore faite. Quand elle le sera, remplis ces deux valeurs dans
// getDemandeValidee (par exemple le nom du bénéficiaire et le numéro lus
// depuis la base) ; le gabarit les affiche déjà.
const chequeNom = ref('')
const numCheque = ref('')

// Nombre minimum de lignes affichées, pour garder la forme du formulaire
// papier (qui présente plusieurs lignes vides sous les lignes remplies)
const MIN_ROWS = 1
const emptyRows = computed(() => Math.max(0, MIN_ROWS - lignes.value.length))

// "Montant total requête" = somme des PARTS SESAME des lignes imprimées
const totalSesame = computed(() =>
    lignes.value.reduce((sum, item) => sum + (Number(item.montant_sesame) || 0), 0)
)

const formatNumber = (number) => {
    if (number === null || number === undefined || number === '') return '0'
    return new Intl.NumberFormat('fr-FR').format(Number(number) || 0)
}

// Date complète jj/mm/aaaa (comme "20/02/2026" sur le formulaire)
const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const getDemandeValidee = async () => {
    loading.value = true
    try {
        // En-tête de la demande + demandeur (service, signature)
        const { data: obj, error: objError } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user (
                    full_name,
                    service,
                    signature_url
                )
            `)
            .eq('id', route.params.id)
            .eq('cat_proc', 'drfme')
            .single()

        if (objError) throw objError

        dataObj.value = {
            ...obj,
            demandeur: obj.users?.full_name || 'Non spécifié',
            service: obj.users?.service || '-',
            projet: obj.projet || '-',
            dateDemande: formatDate(obj.date),
            signatureDemandeur: obj.users?.signature_url || null
        }

        // Lignes validées (validées ou arrivées au niveau chèque)
        const { data: items, error: itemsError } = await supabase
            .from('ses_items_drfme')
            .select('*')
            .eq('id_obj', route.params.id)
            .in('niv_val', [niveauDRFME.valide, niveauDRFME.cheque])
            .order('num', { ascending: true })

        if (itemsError) throw itemsError

        lignes.value = items || []

        // Signatures via l'historique : seules les validations ('valider',
        // 'fin') comptent, jamais les retours ni les autres types.
        const { data: histo, error: histoError } = await supabase
            .from('ses_histo2')
            .select(`
                id,
                niv_val,
                created_at,
                userValide: id_user ( full_name, signature_url )
            `)
            .eq('id_obj', route.params.id)
            .eq('cat_proc', 'drfme')
            .in('type', ['valider', 'fin'])
            .order('niv_val', { ascending: true })
            .order('id', { ascending: false })

        if (histoError) throw histoError

        // Une entrée par niveau : la plus récente (id décroissant)
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

        // Le niv_val enregistré dans l'historique est le niveau SUIVANT celui
        // de la personne qui valide : on cherche donc toujours "niveau + 1".
        // ⚠️ Les clés (superieur, dpr, finance) sont à adapter à ton enum
        // niveauDRFME ; "Chef de département" est supposé correspondre à
        // `dpr`. Une clé inexistante donne simplement un bloc vide.
        validateurs.value = {
            superieur: map[niveauDRFME.superieur + 1] || null,
            chefDepartement: map[niveauDRFME.dpr + 1] || null,
            finance: map[niveauDRFME.finance + 1] || null,
            cg: map[niveauDRFME.cg + 1] || null
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

// Accès réservé (même règle que l'impression de la NDF) : à adapter selon
// les profils qui doivent pouvoir imprimer une DRFME
if (!userStore.finance && !userStore.cg && !userStore.cheque && userStore.type_compte !== 1) {
    navigateTo('/demande')
}

onMounted(() => getDemandeValidee())
</script>