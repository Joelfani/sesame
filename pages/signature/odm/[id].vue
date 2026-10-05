<template>
    <ImpressionPdfGeneric
        titre="IMPRESSION DE L'ORDRE DE MISSION"
        retour-path="/signature/odm"
        :file-name="`ODM_Validee_${route.params.id}`"
        orientation="p"
        :loading="loading"
    >
        <!-- ========== PAGE 1 ========== -->
        <div class="pdf-page">
            <!-- En-tête titre + logo -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 100px;gap: 15px;">
                <div style="flex: 1;"></div>
                <div style="flex: 4; text-align: center;">
                    <h1 style="font-weight: bold; font-size: 30pt; margin: 0;">
                        Ordre de mission PROMES/SESAME
                    </h1>
                </div>
                <div style="flex: 1; text-align: right;">
                    <img
                        src="/logo.png"
                        alt="SESAME"
                        style="height: 100px; object-fit: contain;"
                    >
                </div>
            </div>

            <!-- Identité -->
            <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 14px;">
                <tr>
                    <td style="padding: 6px 8px 6px 0; width: 22%; font-weight: 600; white-space: nowrap;">
                        Nom et prénoms
                    </td>
                    <td style="padding: 6px 8px; background: #c5d4e8; border-radius: 2px;">
                        {{ dataObj.demandeur }}
                    </td>
                </tr><br><br>
                <tr>
                    <td style="padding: 6px 8px 6px 0; font-weight: 600;">
                        Poste
                    </td>
                    <td style="padding: 6px 8px; background: #c5d4e8;">
                        {{ dataObj.poste }}
                    </td>
                </tr><br><br>
                 <!-- Objectif -->
                <tr>
                    <td style="padding: 6px 8px 6px 0; font-weight: 600;">
                        Objectif de la Mission :
                    </td>
                    <td style="padding: 6px 8px; background: #c5d4e8;">
                        {{ dataObj.miss_obj }}
                    </td>
                </tr><br><br>
                <!-- Dates -->
                <tr>
                    <td style="padding: 6px 8px 6px 0; font-weight: 600;">
                        Dates :
                    </td>
                    <td style="padding: 6px 8px;">
                        <div style="margin-bottom: 12px; font-size: 10pt; display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <span>La mission aura lieu du</span>
                            <span style="padding: 4px 12px; background: #c5d4e8; min-width: 90px; text-align: center;">
                                {{ dataObj.miss_date1 }}
                            </span>
                            <span>au</span>
                            <span style="padding: 4px 12px; background: #c5d4e8; min-width: 90px; text-align: center;">
                                {{ dataObj.miss_date2 }}
                            </span>
                        </div>
                    </td>
                </tr><br><br>
                <!-- Lieu -->
                <tr>
                    <td style="padding: 6px 8px 6px 0; font-weight: 600;">
                        Lieu :
                    </td>
                    <td style="padding: 6px 8px;">
                        <div style="margin-bottom: 12px; font-size: 10pt; display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <span>La mission aura lieu à</span>
                            <span style="padding: 4px 12px; background: #c5d4e8;flex: 1; text-align: center;">
                                {{ dataObj.miss_lieu }}
                            </span>
                        </div>
                    </td>
                </tr><br><br>
            </table><br><br><br>

            <!-- Texte de remerciement -->
            <p style="font-size: 9.5pt; line-height: 1.45; margin: 20px 0 28px 0; text-align: justify;">
                PROMES remercie toutes les autorités civiles et militaires de l'aide qu'elles pourraient
                leur apporter au cours de sa mission et de faciliter toutes démarches nécessaires
                à la bonne réalisation de sa mission.
            </p><br><br><br>

            <!-- Lieu et date -->
            <p style="font-size: 10pt; margin: 0 0 28px 0;">
                Antananarivo, le
                <span style="padding: 4px 14px; background: #c5d4e8; margin-left: 8px;">
                     <!--{{ dataObj.date_demande }}-->
                    {{ new Date().toLocaleDateString('fr-FR') }}
                </span>
            </p><br><br><br>

            <!-- Tableau signatures -->
            <table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-top: 10px;">
                <thead>
                    <tr style="text-align: center;">
                        <th style="border: 1px solid #000; padding: 8px 4px; width: 16%; font-weight: 700;">
                            Missionnaire
                        </th>
                        <th style="border: 1px solid #000; padding: 8px 4px; width: 16%; font-weight: 700;">
                            Responsable de service
                        </th>
                        <th style="border: 1px solid #000; padding: 8px 4px; width: 16%; font-weight: 700;">
                            Responsable RH
                        </th>
                        <th style="border: 1px solid #000; padding: 8px 4px; width: 16%; font-weight: 700;">
                            Responsable administratif et finance
                        </th>
                        <th style="border: 1px solid #000; padding: 8px 4px; width: 16%; font-weight: 700;">
                            Directeur de Programme
                        </th>
                        <th style="border: 1px solid #000; padding: 8px 4px; width: 16%; font-weight: 700;">
                            Controlleur de gestion
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <!-- Missionnaire -->
                        <td style="border: 1px solid #000; padding: 8px; height: 110px; vertical-align: top; text-align: center;">
                            <img
                                v-if="dataObj.signatureDemandeur"
                                :src="dataObj.signatureDemandeur"
                                alt="Signature"
                                style="max-width: 90%; height: 48px; object-fit: contain; display: block; margin: 8px auto 4px;"
                            >
                            <div v-else style="height: 48px;"></div>
                            <p style="margin: 4px 0 0; font-size: 7pt;">{{ dataObj.demandeur }}</p>
                            <p style="margin: 2px 0 0; font-size: 6.5pt; color: #555;">{{ dataObj.date_demande }}</p>
                        </td>

                        <!-- Supérieur / Responsable de service -->
                        <td style="border: 1px solid #000; padding: 8px; height: 110px; vertical-align: top; text-align: center;">
                            <img
                                v-if="validateurs.superieur?.signatureValide"
                                :src="validateurs.superieur.signatureValide"
                                alt="Signature"
                                style="max-width: 90%; height: 48px; object-fit: contain; display: block; margin: 8px auto 4px;"
                            >
                            <div v-else style="height: 48px;"></div>
                            <p style="margin: 4px 0 0; font-size: 7pt;">{{ validateurs.superieur?.userValide || '' }}</p>
                            <p v-if="validateurs.superieur?.dateVal" style="margin: 2px 0 0; font-size: 6.5pt; color: #555;">
                                {{ validateurs.superieur.dateVal }}
                            </p>
                        </td>

                        <!-- RH -->
                        <td style="border: 1px solid #000; padding: 8px; height: 110px; vertical-align: top; text-align: center;">
                            <img
                                v-if="validateurs.rh?.signatureValide"
                                :src="validateurs.rh.signatureValide"
                                alt="Signature"
                                style="max-width: 90%; height: 48px; object-fit: contain; display: block; margin: 8px auto 4px;"
                            >
                            <div v-else style="height: 48px;"></div>
                            <p style="margin: 4px 0 0; font-size: 7pt;">{{ validateurs.rh?.userValide || '' }}</p>
                            <p v-if="validateurs.rh?.dateVal" style="margin: 2px 0 0; font-size: 6.5pt; color: #555;">
                                {{ validateurs.rh.dateVal }}
                            </p>
                        </td>

                        <!-- Finance -->
                        <td style="border: 1px solid #000; padding: 8px; height: 110px; vertical-align: top; text-align: center;">
                            <img
                                v-if="validateurs.finance?.signatureValide"
                                :src="validateurs.finance.signatureValide"
                                alt="Signature"
                                style="max-width: 90%; height: 48px; object-fit: contain; display: block; margin: 8px auto 4px;"
                            >
                            <div v-else style="height: 48px;"></div>
                            <p style="margin: 4px 0 0; font-size: 7pt;">{{ validateurs.finance?.userValide || '' }}</p>
                            <p v-if="validateurs.finance?.dateVal" style="margin: 2px 0 0; font-size: 6.5pt; color: #555;">
                                {{ validateurs.finance.dateVal }}
                            </p>
                        </td>

                        <!-- DPR -->
                        <td style="border: 1px solid #000; padding: 8px; height: 110px; vertical-align: top; text-align: center;">
                            <img
                                v-if="validateurs.dpr?.signatureValide"
                                :src="validateurs.dpr.signatureValide"
                                alt="Signature"
                                style="max-width: 90%; height: 48px; object-fit: contain; display: block; margin: 8px auto 4px;"
                            >
                            <div v-else style="height: 48px;"></div>
                            <p style="margin: 4px 0 0; font-size: 7pt;">{{ validateurs.dpr?.userValide || '' }}</p>
                            <p v-if="validateurs.dpr?.dateVal" style="margin: 2px 0 0; font-size: 6.5pt; color: #555;">
                                {{ validateurs.dpr.dateVal }}
                            </p>
                        </td>
                        <!-- CG -->
                        <td style="border: 1px solid #000; padding: 8px; height: 110px; vertical-align: top; text-align: center;">
                            <img
                                v-if="validateurs.cg?.signatureValide"
                                :src="validateurs.cg.signatureValide"
                                alt="Signature"
                                style="max-width: 90%; height: 48px; object-fit: contain; display: block; margin: 8px auto 4px;"
                            >
                            <div v-else style="height: 48px;"></div>
                            <p style="margin: 4px 0 0; font-size: 7pt;">{{ validateurs.cg?.userValide || '' }}</p>
                            <p v-if="validateurs.cg?.dateVal" style="margin: 2px 0 0; font-size: 6.5pt; color: #555;">
                                {{ validateurs.cg.dateVal }}
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Footer page 1 -->
            <div style="margin-top: 20px; font-size: 7pt; color: #666; display: flex; justify-content: space-between;">
                <span>Document généré le {{ new Date().toLocaleDateString('fr-FR') }} — ODM N° {{ route.params.id }}</span>
                <span>Association PROMES / Programme SESAME</span>
            </div>
        </div>

        <!-- ========== PAGE 2 (statique – grilles arrivée / départ) ========== -->
        <div class="pdf-page" style="page-break-before: always;">
            <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
                <tr v-for="n in 6" :key="'row-' + n">
                    <td
                        v-for="col in 2"
                        :key="'cell-' + n + '-' + col"
                        style="border: 1px solid #000; width: 50%; height: 105px; vertical-align: top; padding: 10px 12px;"
                    >
                        <p style="margin: 0 0 18px 0;">Date d'Arrivée</p><br><br>
                        <p style="margin: 0 0 18px 0;">Cachet et signature:</p><br><br>
                        <p style="margin: 0;">Date de départ :</p><br><br>
                    </td>
                </tr>
            </table>

            <div style="margin-top: 16px; font-size: 7pt; color: #666; text-align: center;">
                page 2 — ODM N° {{ route.params.id }}
            </div>
        </div>
    </ImpressionPdfGeneric>
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'
import ImpressionPdfGeneric from '~/components/ImpressionPdfGeneric.vue'

const supabase = useSupabaseClient()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const dataObj = ref({})
const validateurs = ref({
    superieur: null,
    rh: null,
    finance: null,
    dpr: null,
    cg:null
})

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
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
                    resp,
                    signature_url
                )
            `)
            .eq('id', route.params.id)
            .eq('cat_proc', 'odm')
            .single()

        if (objError) throw objError

        dataObj.value = {
            ...obj,
            demandeur: obj.users?.full_name || 'Non spécifié',
            poste: obj.users?.resp || obj.users?.service || '',
            miss_obj: obj.miss_obj || '',
            miss_date1: formatDate(obj.miss_date1),
            miss_date2: formatDate(obj.miss_date2),
            miss_lieu: obj.miss_lieu || '',
            date_demande: formatDate(obj.date),
            signatureDemandeur: obj.users?.signature_url || null
        }

        // Historique des validations (type valider)
        const { data: histo, error: histoError } = await supabase
            .from('ses_histo2')
            .select(`
                id,
                niv_val,
                created_at,
                type,
                userValide: id_user ( full_name, signature_url )
            `)
            .eq('id_obj', route.params.id)
            .eq('cat_proc', 'odm')
            .in('type', ['valider', 'fin'])
            .order('niv_val', { ascending: true })
            .order('id', { ascending: false })

        if (histoError) throw histoError

        // Première occurrence par niv_val (la plus récente grâce au order id desc)
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

        /**
         * Selon ta logique d'insert :
         * - si tu stockes le niveau *après* validation → map[niveau + 1]
         * - si tu stockes le niveau *du validateur* → map[niveau]
         * Ajuste ci-dessous si besoin.
         */
        validateurs.value = {
            superieur: map[niveauODM.superieur + 1] || null,
            rh: map[niveauODM.rh + 1] || null,
            finance: map[niveauODM.finance + 1] || null,
            dpr: map[niveauODM.dpr + 1] || null,
            cg:map[niveauODM.cg + 1] || null,
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

if (!userStore.finance && !userStore.rh && !userStore.dpr && !userStore.cg && !userStore.cheque && userStore.type_compte !== 1) {
    navigateTo('/demande')
}

onMounted(() => getDemandeValidee())
</script>