<template>
    <div class="purchase_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>VALIDATION DE LA DRFMS - DPR</h1>

            <client-only>
                <button
                    class="btn btn-outline-dark"
                    data-bs-toggle="modal"
                    data-bs-target="#modDoc"
                    @click="doc_recovery"
                >
                    Liste des documents
                </button>
            </client-only>
            <button class="btn btn-outline-success" @click="exportToExcel">Exporter vers Excel</button>
            <div class="link_demande">
                <NuxtLink to="/dpr/drfms" class="btn btn-outline-secondary">
                    Retour à la liste
                </NuxtLink>
            </div>
        </div>

        <!-- Informations générales -->
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h6><strong> N° d'enregistrement : </strong> <span>{{ route.params.id }}</span></h6>
                <h6><strong> Date : </strong> {{ dataObj.date }}</h6>
                <div class="d-flex align-items-center gap-3">
                    <h6><strong> Nom et prénoms de la personne soignée : </strong> {{ dataObj.pers_soin }}</h6>
                    <h6><strong> Personne soignée : </strong> {{ dataObj.cat_pers }}</h6>
                </div>
                <h6><strong> Statut : </strong> <strong>{{ statutLabel }}</strong></h6>
            </div>

            <!-- Boutons Valider / Refuser (uniquement si niveau DPR) -->
            <div v-if="dataObj.niv_val === niveauDRFMS.dpr" class="d-flex gap-2">
                <button
                    class="btn btn-outline-success"
                    @click="validerDRFMS"
                    :disabled="loadingAction"
                >
                    Valider
                </button>
                <button
                    class="btn btn-outline-danger"
                    @click="refuserDRFMS"
                    :disabled="loadingAction"
                >
                    Refuser
                </button>
            </div>
        </div>

        <!-- Tableau des détails -->
        <div class="table_block_list mt-4">
            <Table
                :columns="columns"
                :rows="demande_details"
                :showActions="false"
                :loading="loading"
            />
        </div>

        <!-- Alert -->
        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />

        <!-- Modal Liste des documents (lecture seule) -->
        <Modal id="modDoc" title="Documents associés à la DRFMS">
            <div class="text-center">
                <div v-if="doc_drfms.length === 0" class="text-muted py-3">
                    Aucun document associé à cette DRFMS.
                </div>

                <div v-else>
                    <p
                        v-for="doc in doc_drfms"
                        :key="doc.id"
                        class="d-flex justify-content-between align-items-center border-bottom py-2"
                    >
                        <span style="font-weight: bold;">{{ doc.name_doc }}</span>

                        <button
                            class="btn btn-outline-secondary btn-sm"
                            @click="downloadFile(doc.name_doc, doc.nameStorage)"
                            title="Télécharger"
                        >
                            <img
                                src="/public/icon/download.png"
                                style="width: 20px; height: 20px;"
                                alt="Télécharger"
                            >
                        </button>
                    </p>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { TeteDRFMS, niveauDRFMS } from '~/assets/js/CommonVariable.js'
import {exportExcel} from '~/assets/js/export.js';
// Services
const supabase = useSupabaseClient()
const userStore = useUserStore()
const route = useRoute()

// State
const loading = ref(true)
const loadingAction = ref(false)
const demande_details = ref([])
const dataObj = ref({})
const doc_drfms = ref([])

// Colonnes
const columns = TeteDRFMS

// Alert
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: ''
})

const showAlert = (message, title, type) => {
    alert.value = { show: true, message, title, type }
    setTimeout(() => {
        alert.value.show = false
    }, 5000)
}

// Libellé du statut
const statutLabel = computed(() => {
    switch (dataObj.value.niv_val) {
        case niveauDRFMS.erg: return 'En attente d\'envoi (document requis)'
        case niveauDRFMS.dpr: return 'En attente de validation du DPR'
        case niveauDRFMS.rh: return 'En attente de validation RH'
        case niveauDRFMS.finance: return 'En attente de validation chez le responsable financier'
        case niveauDRFMS.cg: return 'En attente de validation chez le controlleur de gestion'
        case niveauDRFMS.cheque: return 'En attente d\'émission de chèque'
        case niveauDRFMS.valide: return 'Validée'
        case niveauDRFMS.refuse: return 'Demande refusée'
        default: return 'Statut inconnu'
    }
})

// ====================== RÉCUPÉRATION DES DONNÉES ======================
const getDemandeDetails = async () => {
    loading.value = true
    try {
        // 1. Récupérer la DRFMS
        const { data: demandeObj, error: demandeObjError } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name )
            `)
            .eq('id', route.params.id)
            .single()

        if (demandeObjError) throw demandeObjError

        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date),
            demandeur: demandeObj.users?.full_name || 'Nom non trouvé'
        }

        // 2. Récupérer les lignes de soins
        const { data, error } = await supabase
            .from('ses_items_drfms')
            .select('*, type_soins:type(nom, taux_normal, taux_accident, pourcentage_normal, pourcentage_accident)')
            .eq('id_obj', route.params.id)
            .order('id', { ascending: true })

        if (error) throw error

        demande_details.value = data.map(item => {
            const infoType = item.type_soins || {}
            const estAccident = item.taux === 'accident'

            return {
                ...item,
                date: formatDate(item.date),
                type_nom: infoType.nom || '',
                taux_label: estAccident ? infoType.taux_accident : infoType.taux_normal,
                pourcentage: estAccident
                    ? `${infoType.pourcentage_accident ?? ''}%`
                    : `${infoType.pourcentage_normal ?? ''}%`
            }
        })

    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du chargement de la DRFMS', 'Erreur', 'danger')
    } finally {
        loading.value = false
    }
}

// ====================== DOCUMENTS ======================
const doc_recovery = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_doc')
            .select('*')
            .eq('id_obj', route.params.id)
            .eq('cat_proc', 'drfms')

        if (error) throw error
        doc_drfms.value = data || []
    } catch (error) {
        console.error('Erreur récupération documents :', error)
        showAlert('Erreur lors du chargement des documents', 'Oups!', 'danger')
    }
}

const downloadFile = async (name_doc, nameStorage) => {
    const path = `drfms/${nameStorage}`
    try {
        const encoding = encodeURI(path)
        const { data, error } = await supabase
            .storage
            .from('sesame_doc')
            .createSignedUrl(encoding, 60)

        if (error) throw error

        const a = document.createElement('a')
        a.href = data.signedUrl
        a.download = name_doc
        document.body.appendChild(a)
        a.click()
        a.remove()

        showAlert('Fichier téléchargé avec succès', 'Succès', 'success')
    } catch (error) {
        console.error('Erreur téléchargement :', error.message)
        showAlert('Erreur lors du téléchargement du fichier', 'Oups!', 'danger')
    }
}

// ====================== ACTIONS VALIDATION / REFUS ======================
const validerDRFMS = async () => {
    if (dataObj.value.niv_val !== niveauDRFMS.dpr) return

    loadingAction.value = true
    try {
        const nextLevel = niveauDRFMS.dpr + 1

        const { error } = await supabase
            .from('ses_obj')
            .update({ niv_val: nextLevel })
            .eq('id', route.params.id)

        if (error) throw error

        const { error: histError } = await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                action: `Validation de la DRFMS n°${route.params.id} par le DPR`,
                niv_val: nextLevel,
                type:'valider',
                cat_proc:'drfms'
            })

        if (histError) throw histError

        dataObj.value.niv_val = nextLevel
        showAlert('DRFMS validée avec succès', 'Succès', 'success')
        navigateTo('/dpr/drfms')
    } catch (error) {
        console.error('Erreur validation :', error)
        showAlert('Erreur lors de la validation', 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
    }
}

const refuserDRFMS = async () => {
    if (dataObj.value.niv_val !== niveauDRFMS.dpr) return

    loadingAction.value = true
    try {
        const { error } = await supabase
            .from('ses_obj')
            .update({ niv_val: niveauDRFMS.refuse })
            .eq('id', route.params.id)

        if (error) throw error

        const { error: histError } = await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                action: `Refus de la DRFMS n°${route.params.id} par le DPR`,
                niv_val: niveauDRFMS.refuse,
                type:'rejeter',
                cat_proc:'drfms'
            })

        if (histError) throw histError

        dataObj.value.niv_val = niveauDRFMS.refuse
        showAlert('DRFMS refusée', 'Information', 'warning')

    } catch (error) {
        console.error('Erreur refus :', error)
        showAlert('Erreur lors du refus', 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
    }
}
// ====================== EXPORT EXCEL ======================
const exportToExcel = async () => {
    try {
        const data = demande_details.value

        const exportData = data.map(item => ({
            'N° DRFMS': route.params.id,
            'Demandeur': dataObj.value.demandeur || dataObj.value.id_user || '',
            'Personne soignée': dataObj.value.pers_soin || '',
            'Catégorie personne soignée': dataObj.value.cat_pers || '',
            
            'Date': item.date || '',
            'Type de soin': item.type_nom || '',
            'Taux': item.taux_label || '',
            'Pourcentage': item.pourcentage || '',
            'Montant': item.montant || '',
            'Statut': statutLabel.value || '',
        }))

        const nameExcel = `Details_DRFMS_Num_${route.params.id}`
        await exportExcel(exportData, nameExcel)

    } catch (error) {
        console.error('Erreur lors de l\'exportation vers Excel:', error)
        showAlert('Erreur lors de l\'exportation vers Excel.', 'Oops', 'danger')
    }
}

// ====================== UTILITAIRES ======================
const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}



// ====================== LIFECYCLE ======================
onMounted(() => {
    getDemandeDetails()
})
</script>