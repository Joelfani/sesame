<template>
    <div class="purchase_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>VALIDATION CHÈQUE DE LA DRFMS</h1>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-success" @click="exportToExcel">
                    Exporter vers Excel
                </button>
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
                <NuxtLink to="/cheque/drfms" class="btn btn-outline-secondary">
                    Retour à la liste
                </NuxtLink>
            </div>
        </div>

        <!-- Informations générales -->
        <div class="d-flex justify-content-between align-items-start mb-4">
            <div>
                <h6>N° d'enregistrement : <span>{{ route.params.id }}</span></h6>
                <h6>Date : {{ dataObj.date }}</h6>
                <div class="d-flex align-items-center gap-3">
                    <h6>Nom et prénoms de la personne soignée : {{ dataObj.pers_soin }}</h6>
                    <h6>Personne soignée : {{ dataObj.cat_pers }}</h6>
                </div>
                <h6>Demandeur : <strong>{{ dataObj.demandeur }}</strong></h6>
                <h6>Imputation analytique : <strong>{{ dataObj.imputation_nom || 'Non renseignée' }}</strong></h6>
                <h6 v-if="dataObj.tiger">Code Tiger : <strong>{{ dataObj.tiger }}</strong></h6>
                <h6 v-if="dataObj.cheque">N° Chèque : <strong>{{ dataObj.cheque }}</strong></h6>
                <h6 v-if="dataObj.emission">Date d'émission : <strong>{{ formatDate(dataObj.emission) }}</strong></h6>
                <h6>Statut : <strong>{{ statutLabel }}</strong></h6>
            </div>

            <!-- Boutons d'action (uniquement si niveau chèque) -->
            <div v-if="dataObj.niv_val === niveauDRFMS.cheque" class="d-flex gap-2">
                <button
                    class="btn btn-outline-success"
                    data-bs-toggle="modal"
                    data-bs-target="#modalValidation"
                    @click="resetValidationModal"
                >
                    Valider
                </button>
                <button
                    class="btn btn-outline-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#modalRefus"
                    @click="resetRefusModal"
                >
                    Refuser
                </button>
            </div>
        </div>

        <!-- Tableau des détails -->
        <div class="table_block_list">
            <Table
                :columns="columns"
                :rows="demande_details"
                :loading="loading"
                :showActions="false"
            />
        </div>

        <!-- Alert -->
        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />

        <!-- ==================== MODAL VALIDATION (N° Chèque + Date d'émission) ==================== -->
        <Modal id="modalValidation" title="Validation - Émission du chèque">
            <div class="mb-3">
                <label class="form-label fw-bold">
                    N° Chèque <span class="text-danger">*</span>
                </label>
                <input
                    type="text"
                    v-model="chequeNumber"
                    class="form-control"
                    placeholder="Saisir le numéro de chèque"
                >
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">
                    Date d'émission <span class="text-danger">*</span>
                </label>
                <input
                    type="date"
                    v-model="dateEmission"
                    class="form-control"
                >
            </div>
            <div class="d-flex gap-2 justify-content-end">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Annuler
                </button>
                <button
                    class="btn btn-outline-success"
                    @click="validerDRFMS"
                    :disabled="loadingAction"
                >
                    Confirmer la validation
                </button>
            </div>
        </Modal>

        <!-- ==================== MODAL REFUS ==================== -->
        <Modal id="modalRefus" title="Refus de la DRFMS">
            <div class="mb-3">
                <label class="form-label fw-bold">
                    Motif de rejet <span class="text-danger">*</span>
                </label>
                <textarea
                    v-model="motifRejet"
                    class="form-control"
                    rows="4"
                    placeholder="Veuillez indiquer le motif du refus..."
                ></textarea>
            </div>
            <div class="d-flex gap-2 justify-content-end">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Annuler
                </button>
                <button
                    class="btn btn-outline-danger"
                    @click="refuserDRFMS"
                    :disabled="loadingAction"
                >
                    Confirmer le refus
                </button>
            </div>
        </Modal>

        <!-- ==================== MODAL DOCUMENTS ==================== -->
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
                        >
                            <img src="/public/icon/download.png" style="width: 20px; height: 20px;" alt="Télécharger">
                        </button>
                    </p>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { TeteDRFMS, niveauDRFMS } from '~/assets/js/CommonVariable.js'
import { exportExcel } from '~/assets/js/export.js'

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
const motifRejet = ref('')
const chequeNumber = ref('')
const dateEmission = ref('')

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

// ====================== HELPER FERMETURE MODAL ======================
const closeModal = (modalId) => {
    const modal = document.getElementById(modalId)
    if (modal) {
        const dismissBtn = modal.querySelector('[data-bs-dismiss="modal"]')
        if (dismissBtn) dismissBtn.click()
    }
}

// ====================== FORMATAGE ======================
const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

// ====================== RÉCUPÉRATION DES DONNÉES ======================
const getDemandeDetails = async () => {
    loading.value = true
    try {
        const { data: demandeObj, error: demandeObjError } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name ),
                imputation: imputation_drfms ( nom )
            `)
            .eq('id', route.params.id)
            .single()

        if (demandeObjError) throw demandeObjError

        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date),
            demandeur: demandeObj.users?.full_name || 'Nom non trouvé',
            imputation_nom: demandeObj.imputation?.nom || null
        }

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

// ====================== RESET MODALS ======================
const resetValidationModal = () => {
    chequeNumber.value = ''
    dateEmission.value = ''
}

const resetRefusModal = () => {
    motifRejet.value = ''
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
        console.error('Erreur récupération documents:', error)
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
        console.error('Erreur téléchargement:', error.message)
        showAlert('Erreur lors du téléchargement du fichier', 'Oups!', 'danger')
    }
}

// ====================== ACTIONS ======================
const validerDRFMS = async () => {
    if (dataObj.value.niv_val !== niveauDRFMS.cheque) return

    if (!chequeNumber.value || !chequeNumber.value.trim()) {
        showAlert('Le numéro de chèque est obligatoire pour valider', 'Oops', 'danger')
        return
    }

    if (!dateEmission.value) {
        showAlert('La date d\'émission est obligatoire pour valider', 'Oops', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const nextLevel = niveauDRFMS.cheque + 1

        const { error } = await supabase
            .from('ses_obj')
            .update({
                niv_val: nextLevel,
                cheque: chequeNumber.value.trim(),
                emission: dateEmission.value
            })
            .eq('id', route.params.id)

        if (error) throw error

        await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                action: `Émission du chèque n°${chequeNumber.value.trim()} pour la DRFMS n°${route.params.id}`,
                niv_val: nextLevel,
                type:'fin',
                cat_proc: 'drfms'
            })

        closeModal('modalValidation')
        dataObj.value.niv_val = nextLevel
        dataObj.value.cheque = chequeNumber.value.trim()
        dataObj.value.emission = dateEmission.value
        showAlert('Chèque enregistré, DRFMS validée avec succès', 'Succès', 'success')

    } catch (error) {
        console.error('Erreur validation chèque:', error)
        showAlert('Erreur lors de la validation', 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
    }
}

const refuserDRFMS = async () => {
    if (dataObj.value.niv_val !== niveauDRFMS.cheque) return

    if (!motifRejet.value.trim()) {
        showAlert('Veuillez indiquer un motif de rejet avant de refuser.', 'Oops', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const { error } = await supabase
            .from('ses_obj')
            .update({
                niv_val: niveauDRFMS.refuse,
                motif_rejet: motifRejet.value.trim()
            })
            .eq('id', route.params.id)

        if (error) throw error

        await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                action: `Refus au niveau chèque de la DRFMS n°${route.params.id} - Motif: ${motifRejet.value.trim()}`,
                niv_val: niveauDRFMS.refuse,
                type:'rejeter',
                cat_proc: 'drfms'
            })

        closeModal('modalRefus')
        dataObj.value.niv_val = niveauDRFMS.refuse
        showAlert('DRFMS refusée', 'Information', 'warning')

    } catch (error) {
        console.error('Erreur refus chèque:', error)
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
            'Demandeur': dataObj.value.demandeur || '',
            'Personne soignée': dataObj.value.pers_soin || '',
            'Catégorie personne soignée': dataObj.value.cat_pers || '',
            'Imputation': dataObj.value.imputation_nom || '',
            'Code Tiger': dataObj.value.tiger || '',
            'N° Chèque': dataObj.value.cheque || '',
            'Date d\'émission': dataObj.value.emission ? formatDate(dataObj.value.emission) : '',
            'Statut': statutLabel.value || '',
            'Date': item.date || '',
            'Type de soin': item.type_nom || '',
            'Taux': item.taux_label || '',
            'Pourcentage': item.pourcentage || '',
            'Montant': item.montant || ''
        }))

        const nameExcel = `Details_DRFMS_Cheque_Num_${route.params.id}`
        await exportExcel(exportData, nameExcel)

    } catch (error) {
        console.error('Erreur export Excel:', error)
        showAlert('Erreur lors de l\'exportation vers Excel.', 'Oops', 'danger')
    }
}

// ====================== LIFECYCLE ======================
onMounted(() => {
    getDemandeDetails()
})
</script>