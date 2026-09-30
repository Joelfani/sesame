<template>
    <div class="purchase_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>VALIDATION CG DE LA DRFMS</h1>
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
                <NuxtLink to="/controlleur/drfms" class="btn btn-outline-secondary">
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
                <h6>
                    Imputation analytique :
                    <strong>{{ dataObj.imputation_nom || 'Non renseignée' }}</strong>
                    <button
                        v-if="dataObj.niv_val === niveauDRFMS.cg"
                        class="btn btn-sm btn-outline-primary ms-2"
                        data-bs-toggle="modal"
                        data-bs-target="#modalImputation"
                        @click="loadImputationForEdit"
                    >
                        Modifier
                    </button>
                </h6>
                <h6 v-if="dataObj.tiger">Code Tiger : <strong>{{ dataObj.tiger }}</strong></h6>
                <h6>Statut : <strong>{{ statutLabel }}</strong></h6>
            </div>

            <!-- Boutons d'action (uniquement si niveau CG) -->
            <div v-if="dataObj.niv_val === niveauDRFMS.cg" class="d-flex gap-2">
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
                <!--
                <button
                    class="btn btn-outline-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#modalRetourFinance"
                >
                    Retourner à la Finance
                </button>-->
            </div>
        </div>

         Tableau des détails 
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

        <!-- ==================== MODAL VALIDATION (avec Code Tiger obligatoire) ==================== -->
        <Modal id="modalValidation" title="Validation CG - Code Tiger">
            <div class="mb-3">
                <label class="form-label fw-bold">
                    Code Tiger <span class="text-danger">*</span>
                </label>
                <input
                    type="text"
                    v-model="tigerCode"
                    class="form-control"
                    placeholder="Saisir le code Tiger"
                >
            </div>
            <div class="mb-3">
                <p class="text-muted small">
                    En validant, la DRFMS passera au niveau suivant.
                </p>
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

        <!-- ==================== MODAL MODIFICATION IMPUTATION ==================== -->
        <Modal id="modalImputation" title="Modifier l'imputation analytique">
            <div class="mb-3">
                <label class="form-label fw-bold">
                    Imputation analytique <span class="text-danger">*</span>
                </label>
                <select v-model="selectedImputation" class="form-select">
                    <option value="">-- Sélectionner une imputation --</option>
                    <option
                        v-for="imp in imputationList"
                        :key="imp.value"
                        :value="imp.value"
                    >
                        {{ imp.label }}
                    </option>
                </select>
            </div>
            <div class="d-flex gap-2 justify-content-end">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Annuler
                </button>
                <button
                    class="btn btn-outline-primary"
                    @click="saveImputation"
                    :disabled="loadingAction"
                >
                    Enregistrer
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

        <!-- ==================== MODAL RETOUR À LA FINANCE ==================== 
        <Modal id="modalRetourFinance" title="Retourner la DRFMS à la Finance">
            <div class="mb-3">
                <p>Êtes-vous sûr de vouloir <strong>retourner</strong> cette DRFMS au niveau Finance ?</p>
            </div>
            <div class="d-flex gap-2 justify-content-end">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Annuler
                </button>
                <button
                    class="btn btn-outline-primary"
                    @click="retournerAFinance"
                    :disabled="loadingAction"
                >
                    Confirmer le retour
                </button>
            </div>
        </Modal>-->

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
const tigerCode = ref('')
const selectedImputation = ref('')
const imputationList = ref([])
const imputationBeforeEdit = ref('')

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
        imputationBeforeEdit.value = dataObj.value.imputation_nom
        // Pré-remplir le code Tiger s'il existe déjà
        tigerCode.value = demandeObj.tiger || ''

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

// ====================== IMPUTATIONS ======================
const listImputation = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_imputation')
            .select('*')
            .eq('etat_del', false)
            .order('nom', { ascending: true })

        if (error) throw error

        imputationList.value = data.map(imp => ({
            label: imp.nom,
            value: imp.id
        }))
    } catch (error) {
        console.error('Erreur chargement imputations:', error)
    }
}

const loadImputationForEdit = () => {
    selectedImputation.value = dataObj.value.imputation_drfms || ''
}

const saveImputation = async () => {
    if (!selectedImputation.value) {
        showAlert('Veuillez sélectionner une imputation', 'Oops', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const { error } = await supabase
            .from('ses_obj')
            .update({ imputation_drfms: selectedImputation.value })
            .eq('id', route.params.id)

        if (error) throw error

        // Historique
        await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                action: `Modification de l'imputation par le CG sur la DRFMS n°${route.params.id}`,
                niv_val: niveauDRFMS.cg,
                type:'edit',
                cat_proc: 'drfms',
                ancien_valeur: imputationBeforeEdit.value
            })

        closeModal('modalImputation')
        await getDemandeDetails()
        showAlert('Imputation modifiée avec succès', 'Succès', 'success')

    } catch (error) {
        console.error('Erreur modification imputation:', error)
        showAlert('Erreur lors de la modification de l\'imputation', 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
    }
}

// ====================== RESET MODALS ======================
const resetValidationModal = () => {
    // On garde la valeur déjà saisie si elle existe
    if (!tigerCode.value) {
        tigerCode.value = dataObj.value.tiger || ''
    }
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
    if (dataObj.value.niv_val !== niveauDRFMS.cg) return

    if (!tigerCode.value || !tigerCode.value.trim()) {
        showAlert('Le code Tiger est obligatoire pour valider', 'Oops', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const nextLevel = niveauDRFMS.cg + 1

        const { error } = await supabase
            .from('ses_obj')
            .update({
                niv_val: nextLevel,
                tiger: tigerCode.value.trim()
            })
            .eq('id', route.params.id)

        if (error) throw error

        await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                action: `Validation CG de la DRFMS n°${route.params.id} - Code Tiger: ${tigerCode.value.trim()}`,
                niv_val: nextLevel,
                type:'valider',
                cat_proc: 'drfms'
            })

        closeModal('modalValidation')
        dataObj.value.niv_val = nextLevel
        dataObj.value.tiger = tigerCode.value.trim()
        showAlert('DRFMS validée avec succès par le CG', 'Succès', 'success')

    } catch (error) {
        console.error('Erreur validation CG:', error)
        showAlert('Erreur lors de la validation', 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
    }
}

const refuserDRFMS = async () => {
    if (dataObj.value.niv_val !== niveauDRFMS.cg) return

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
                action: `Refus CG de la DRFMS n°${route.params.id} - Motif: ${motifRejet.value.trim()}`,
                niv_val: niveauDRFMS.refuse,
                type:'rejeter',
                cat_proc: 'drfms'
            })

        closeModal('modalRefus')
        dataObj.value.niv_val = niveauDRFMS.refuse
        showAlert('DRFMS refusée par le CG', 'Information', 'warning')

    } catch (error) {
        console.error('Erreur refus CG:', error)
        showAlert('Erreur lors du refus', 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
    }
}
/*
const retournerAFinance = async () => {
    if (dataObj.value.niv_val !== niveauDRFMS.cg) return

    loadingAction.value = true
    try {
        const previousLevel = niveauDRFMS.cg - 1

        const { error } = await supabase
            .from('ses_obj')
            .update({ niv_val: previousLevel })
            .eq('id', route.params.id)

        if (error) throw error

        await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                action: `Retour de la DRFMS n°${route.params.id} au niveau Finance par le CG`,
                niv_val: previousLevel,
                cat_proc: 'drfms'
            })

        closeModal('modalRetourFinance')
        dataObj.value.niv_val = previousLevel
        showAlert('DRFMS retournée à la Finance avec succès', 'Succès', 'success')

    } catch (error) {
        console.error('Erreur retour Finance:', error)
        showAlert('Erreur lors du retour à la Finance', 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
    }
}*/

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
            'Statut': statutLabel.value || '',
            'Date': item.date || '',
            'Type de soin': item.type_nom || '',
            'Taux': item.taux_label || '',
            'Pourcentage': item.pourcentage || '',
            'Montant': item.montant || ''
        }))

        const nameExcel = `Details_DRFMS_CG_Num_${route.params.id}`
        await exportExcel(exportData, nameExcel)

    } catch (error) {
        console.error('Erreur export Excel:', error)
        showAlert('Erreur lors de l\'exportation vers Excel.', 'Oops', 'danger')
    }
}

// ====================== LIFECYCLE ======================
onMounted(() => {
    getDemandeDetails()
    listImputation()
})
</script>