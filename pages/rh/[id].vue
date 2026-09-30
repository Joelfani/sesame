<template>
    <div class="purchase_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>VALIDATION RH DE LA DRFMS</h1>
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
                <NuxtLink to="/rh" class="btn btn-outline-secondary">
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
                <h6>Statut : <strong>{{ statutLabel }}</strong></h6>
            </div>

            <!-- Boutons d'action (uniquement si niveau RH) -->
            <div v-if="dataObj.niv_val === niveauDRFMS.rh" class="d-flex gap-2">
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
            >
                <template #actions="{ item }">
                    <div v-if="dataObj.niv_val === niveauDRFMS.rh" class="d-flex gap-1">
                        <button
                            class="btn btn-primary btn-sm"
                            data-bs-toggle="modal"
                            data-bs-target="#modalEdition"
                            @click="openEditModal(item)"
                        >
                            Modifier
                        </button>
                        <button
                            class="btn btn-danger btn-sm"
                            data-bs-toggle="modal"
                            data-bs-target="#modalSuppression"
                            @click="itemToDelete = item"
                        >
                            Supprimer
                        </button>
                    </div>
                </template>
            </Table>
        </div>

        <!-- Alert -->
        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />

        <!-- ==================== MODAL ÉDITION ITEM ==================== -->
        <Modal id="modalEdition" title="Modifier l'élément de la DRFMS">
            <div class="row g-3">
                <!-- Type de soins -->
                <div class="col-md-6">
                    <label class="form-label fw-bold">Type de soins <span class="text-danger">*</span></label>
                    <select v-model="editForm.type" class="form-select" @change="onTypeOrTauxChange">
                        <option value="">-- Sélectionner --</option>
                        <option
                            v-for="t in typesSoins"
                            :key="t.id"
                            :value="t.id"
                        >
                            {{ t.nom }}
                        </option>
                    </select>
                </div>

                <!-- Taux appliqué -->
                <div class="col-md-6">
                    <label class="form-label fw-bold">Taux appliqué <span class="text-danger">*</span></label>
                    <select v-model="editForm.taux" class="form-select" @change="onTypeOrTauxChange">
                        <option value="normal">Normal</option>
                        <option value="accident">Accident de travail</option>
                    </select>
                </div>

                <!-- Raison -->
                <div class="col-12">
                    <label class="form-label fw-bold">Raison et description des soins</label>
                    <textarea v-model="editForm.raison" class="form-control" rows="2"></textarea>
                </div>

                <!-- Date de soins -->
                <div class="col-md-6">
                    <label class="form-label fw-bold">Date de soins</label>
                    <input type="date" v-model="editForm.date" class="form-control">
                </div>

                <!-- Cachet -->
                <div class="col-md-6">
                    <label class="form-label fw-bold">Cachet et signature du médecin prescripteur</label>
                    <input type="text" v-model="editForm.cachet" class="form-control">
                </div>

                <!-- Coût -->
                <div class="col-md-4">
                    <label class="form-label fw-bold">Coût (Ar) <span class="text-danger">*</span></label>
                    <input
                        type="number"
                        v-model.number="editForm.cout"
                        class="form-control"
                        min="0"
                        step="1"
                        @input="calculerMontant"
                    >
                </div>

                <!-- Pourcentage (auto) -->
                <div class="col-md-4">
                    <label class="form-label fw-bold">Pourcentage remboursé</label>
                    <input
                        type="text"
                        :value="editForm.pourcentage ? editForm.pourcentage + ' %' : ''"
                        class="form-control"
                        disabled
                    >
                </div>

                <!-- Montant à rembourser (auto) -->
                <div class="col-md-4">
                    <label class="form-label fw-bold">Montant à rembourser (Ar)</label>
                    <input
                        type="text"
                        :value="editForm.montant ? formatNumber(editForm.montant) : ''"
                        class="form-control"
                        disabled
                    >
                </div>
            </div>

            <div class="d-flex gap-2 justify-content-end mt-4">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Annuler
                </button>
                <button
                    class="btn btn-primary"
                    @click="saveEditItem"
                    :disabled="loadingAction"
                >
                    Enregistrer les modifications
                </button>
            </div>
        </Modal>

        <!-- ==================== MODAL VALIDATION (Imputation) ==================== -->
        <Modal id="modalValidation" title="Validation RH - Sélection de l'imputation">
            <div class="mb-3">
                <label class="form-label fw-bold">
                    Imputation analytique <span class="text-danger">*</span>
                </label>
                <select v-model="selectedImputation" class="form-select">
                    <option value="">-- Sélectionner une imputation --</option>
                    <option
                        v-for="imp in imputation"
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

        <!-- ==================== MODAL CONFIRMATION SUPPRESSION ==================== -->
        <Modal id="modalSuppression" title="Confirmation de suppression">
            <div class="mb-3">
                <p>Êtes-vous sûr de vouloir supprimer cet élément ?</p>
                <p v-if="itemToDelete" class="fw-bold">
                    {{ itemToDelete.type_nom || 'Élément sélectionné' }}
                </p>
                <p class="text-danger small">Cette action est irréversible.</p>
            </div>
            <div class="d-flex gap-2 justify-content-end">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Annuler
                </button>
                <button
                    class="btn btn-danger"
                    @click="confirmSuppressionItem"
                    :disabled="loadingAction"
                >
                    Oui, supprimer
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
const imputation = ref([])
const typesSoins = ref([])
const selectedImputation = ref('')
const motifRejet = ref('')
const itemToDelete = ref(null)

// Formulaire d'édition
const editForm = ref({
    id: null,
    type: '',
    raison: '',
    date: '',
    cachet: '',
    cout: null,
    taux: 'normal',
    pourcentage: null,
    montant: null
})
const dataBeforeEdit = ref({
    id: null,
    type: '',
    raison: '',
    date: '',
    cachet: '',
    cout: null,
    taux: 'normal',
    pourcentage: null,
    montant: null
})

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
const formatNumber = (val) => {
    if (val === null || val === undefined) return ''
    return new Intl.NumberFormat('fr-FR').format(val)
}

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

// ====================== TYPES DE SOINS ======================
const listTypesSoins = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_type_soins')
            .select('*')
            .order('nom', { ascending: true })

        if (error) throw error
        typesSoins.value = data || []
    } catch (error) {
        console.error('Erreur chargement types de soins:', error)
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

        imputation.value = data.map(imp => ({
            label: imp.nom,
            value: imp.id
        }))
    } catch (error) {
        console.error('Erreur chargement imputations:', error)
    }
}

const resetValidationModal = () => {
    selectedImputation.value = ''
}

const resetRefusModal = () => {
    motifRejet.value = ''
}

// ====================== ÉDITION ITEM ======================
const openEditModal = (item) => {
    // On récupère les données brutes (pas formatées)
    editForm.value = {
        id: item.id,
        type: item.type || '',
        raison: item.raison || '',
        date: item.date_original || item.date || '', // on garde le format YYYY-MM-DD si possible
        cachet: item.cachet || '',
        cout: item.cout ?? null,
        taux: item.taux || 'normal',
        pourcentage: null,
        montant: item.montant ?? null
    }

    dataBeforeEdit.value = {
        id: item.id,
        type: item.type || '',
        raison: item.raison || '',
        date: item.date_original || item.date || '', 
        cachet: item.cachet || '',
        cout: item.cout ?? null,
        taux: item.taux || 'normal',
        pourcentage: null,
        montant: item.montant ?? null
    }

    // Si la date est au format dd/mm/yyyy, on la reconvertit
    if (editForm.value.date && editForm.value.date.includes('/')) {
        const [day, month, year] = editForm.value.date.split('/')
        editForm.value.date = `${year}-${month}-${day}`
    }

    // Calcul initial du pourcentage + montant
    onTypeOrTauxChange()
}

const onTypeOrTauxChange = () => {
    const typeId = editForm.value.type
    const taux = editForm.value.taux

    if (!typeId || !taux) {
        editForm.value.pourcentage = null
        calculerMontant()
        return
    }

    const type = typesSoins.value.find(t => t.id == typeId)
    if (!type) {
        editForm.value.pourcentage = null
        calculerMontant()
        return
    }

    editForm.value.pourcentage = taux === 'accident'
        ? type.pourcentage_accident
        : type.pourcentage_normal

    calculerMontant()
}

const calculerMontant = () => {
    const cout = Number(editForm.value.cout) || 0
    const pourcentage = Number(editForm.value.pourcentage) || 0
    editForm.value.montant = Math.round((cout * pourcentage) / 100)
}

const saveEditItem = async () => {
    if (!editForm.value.type) {
        showAlert('Veuillez sélectionner un type de soins', 'Oops', 'danger')
        return
    }
    if (editForm.value.cout === null || editForm.value.cout === '' || editForm.value.cout < 0) {
        showAlert('Veuillez saisir un coût valide', 'Oops', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const payload = {
            type: editForm.value.type,
            raison: editForm.value.raison || null,
            date: editForm.value.date || null,
            cachet: editForm.value.cachet || null,
            cout: editForm.value.cout,
            taux: editForm.value.taux,
            montant: editForm.value.montant
        }

        const { error } = await supabase
            .from('ses_items_drfms')
            .update(payload)
            .eq('id', editForm.value.id)

        if (error) throw error

        // Historique
            //Ancien valeur
        const ancienTexte = [
            `type: ${dataBeforeEdit.value?.type ?? ''}`,
            `raison: ${dataBeforeEdit.value?.raison ?? ''}`,
            `date: ${dataBeforeEdit.value?.date ?? ''}`,
            `cachet: ${dataBeforeEdit.value?.cachet ?? ''}`,
            `cout: ${dataBeforeEdit.value?.cout ?? ''}`,
            `taux: ${dataBeforeEdit.value?.taux ?? ''}`,
            `montant: ${dataBeforeEdit.value?.montant ?? ''}`
        ].join(', ')
        await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                action: `Modification par le RH de l'item id: ${editForm.value.id} de la DRFMS n°${route.params.id}`,
                niv_val: niveauDRFMS.rh,
                cat_proc: 'drfms',
                ancien_valeur: ancienTexte
            })
        closeModal('modalEdition')
        await getDemandeDetails() // recharge pour avoir les bons libellés
        showAlert('Élément modifié avec succès', 'Succès', 'success')

    } catch (error) {
        console.error('Erreur lors de la modification:', error)
        showAlert('Erreur lors de la modification', 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
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

// ====================== ACTIONS VALIDATION / REFUS ======================
const validerDRFMS = async () => {
    if (dataObj.value.niv_val !== niveauDRFMS.rh) return
    if (!selectedImputation.value) {
        showAlert('Veuillez sélectionner une imputation analytique avant de valider.', 'Oops', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const nextLevel = niveauDRFMS.rh + 1

        const { error } = await supabase
            .from('ses_obj')
            .update({
                niv_val: nextLevel,
                imputation_drfms: selectedImputation.value
            })
            .eq('id', route.params.id)

        if (error) throw error

        await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                action: `Validation RH de la DRFMS n°${route.params.id}`,
                niv_val: nextLevel,
                cat_proc: 'drfms'
            })

        closeModal('modalValidation')
        dataObj.value.niv_val = nextLevel
        showAlert('DRFMS validée avec succès par le RH', 'Succès', 'success')

    } catch (error) {
        console.error('Erreur validation RH:', error)
        showAlert('Erreur lors de la validation', 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
    }
}

const refuserDRFMS = async () => {
    if (dataObj.value.niv_val !== niveauDRFMS.rh) return
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
                action: `Refus RH de la DRFMS n°${route.params.id} - Motif: ${motifRejet.value.trim()}`,
                niv_val: niveauDRFMS.refuse,
                type:'rejeter',
                cat_proc: 'drfms'
            })

        closeModal('modalRefus')
        dataObj.value.niv_val = niveauDRFMS.refuse
        showAlert('DRFMS refusée par le RH', 'Information', 'warning')

    } catch (error) {
        console.error('Erreur refus RH:', error)
        showAlert('Erreur lors du refus', 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
    }
}

// ====================== SUPPRESSION ITEM ======================
const confirmSuppressionItem = async () => {
    if (!itemToDelete.value) return
    if (dataObj.value.niv_val !== niveauDRFMS.rh) {
        showAlert('Suppression non autorisée à ce niveau.', 'Oups!', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const item = itemToDelete.value

        const { error } = await supabase
            .from('ses_items_drfms')
            .delete()
            .eq('id', item.id)

        if (error) throw error

        await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                action: `Suppression par le RH de l'item "${item.type_nom}" (id: ${item.id}) de la DRFMS n°${route.params.id}`,
                niv_val: niveauDRFMS.rh,
                cat_proc: 'drfms'
            })

        demande_details.value = demande_details.value.filter(d => d.id !== item.id)
        closeModal('modalSuppression')
        itemToDelete.value = null
        showAlert('Item supprimé avec succès', 'Succès', 'success')

    } catch (error) {
        console.error('Erreur lors de la suppression de l\'item:', error)
        showAlert('Erreur lors de la suppression de l\'item', 'Oups!', 'danger')
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
            'Statut': statutLabel.value || '',
            'Date': item.date || '',
            'Type de soin': item.type_nom || '',
            'Taux': item.taux_label || '',
            'Pourcentage': item.pourcentage || '',
            'Montant': item.montant || '',
            'Observation': item.observation || ''
        }))

        const nameExcel = `Details_DRFMS_RH_Num_${route.params.id}`
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
    listTypesSoins()
})
</script>