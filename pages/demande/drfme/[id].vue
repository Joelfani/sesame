<template>
    <div class="purchase_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DRFME</h1>

            <client-only>
                <button
                    class="btn btn-outline-dark"
                    data-bs-toggle="modal"
                    data-bs-target="#modDoc"
                    @click="doc_recovery"
                >
                    {{peutSoumettre ? "Ajouter document" : "Liste des documents"}}
                </button>
            </client-only>

            <div class="link_demande">
                <NuxtLink to="/demande/drfme" class="btn btn-outline-secondary">
                    Retour à la liste
                </NuxtLink>
            </div>
        </div>

        <!-- Informations générales -->
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h6>N° d'enregistrement : <span>{{ route.params.id }}</span></h6>
                <h6>Date : {{ dataObj.date }}</h6>
                <h6>Projet : <strong>{{ dataObj.projet || '-' }}</strong></h6>
                <h6>Statut : <strong>{{ statutLabel }}</strong></h6>
            </div>

            <div v-if="peutSoumettre">
                <button
                    class="btn btn-outline-success"
                    :disabled="doc_drfme.length === 0 || loadingAction"
                    @click="envoyerDRFME"
                >
                    Soumettre la DRFME
                </button>
                <p v-if="doc_drfme.length === 0" style="font-size: 12px; color: gray;">
                    Veuillez d'abord ajouter un document avant l'envoi.
                </p>
            </div>
        </div>

        <!-- Tableau -->
        <div class="table_block_list mt-4">
            <Table
                :columns="columns"
                :rows="demande_details"
                :showActions="true"
                :loading="loading"
            >
                <template #actions="{ item }">
                    <template v-if="Number(item.niv_val) === Number(niveauDRFME.erg)">
                        <button
                            class="btn btn-primary btn-sm me-1"
                            data-bs-toggle="modal"
                            data-bs-target="#modalEditDrfme"
                            @click="openEditModal(item)"
                        >
                            Modifier
                        </button>
                        <button
                            class="btn btn-danger btn-sm"
                            data-bs-toggle="modal"
                            data-bs-target="#modalDeleteDrfme"
                            @click="itemToDelete = item"
                        >
                            Supprimer
                        </button>
                    </template>
                </template>
            </Table>
        </div>

        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />

        <!-- Modal modification -->
        <Modal id="modalEditDrfme" title="Modifier la ligne">
            <div class="row g-3">
                <div class="col-12">
                    <label class="form-label fw-bold">
                        Désignation <span class="text-danger">*</span>
                    </label>
                    <textarea
                        v-model="editForm.designation"
                        class="form-control"
                        rows="2"
                    ></textarea>
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold">
                        Montant total (Ar) <span class="text-danger">*</span>
                    </label>
                    <input
                        type="number"
                        class="form-control"
                        min="0"
                        step="any"
                        v-model.number="editForm.montant_total"
                        @input="recalcSesame"
                    >
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold">Part étudiant (Ar)</label>
                    <input
                        type="number"
                        class="form-control"
                        min="0"
                        step="any"
                        v-model.number="editForm.montant_etudiant"
                        @input="recalcSesame"
                    >
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold">Part SESAME (Ar)</label>
                    <input
                        type="number"
                        class="form-control"
                        :value="editForm.montant_sesame"
                        disabled
                    >
                </div>
                <div class="col-12">
                    <label class="form-label fw-bold">
                        Motif ou destination <span class="text-danger">*</span>
                    </label>
                    <textarea
                        v-model="editForm.detail"
                        class="form-control"
                        rows="2"
                    ></textarea>
                </div>
                <div class="col-12">
                    <label class="form-label fw-bold">Observation</label>
                    <textarea
                        v-model="editForm.observation"
                        class="form-control"
                        rows="2"
                    ></textarea>
                </div>
            </div>
            <div class="d-flex gap-2 justify-content-end mt-4 mb-4">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Annuler
                </button>
                <button
                    class="btn btn-primary"
                    :disabled="loadingAction"
                    @click="saveEditItem"
                >
                    Enregistrer
                </button>
            </div>
        </Modal>

        <!-- Modal confirmation suppression -->
        <Modal id="modalDeleteDrfme" title="Confirmer la suppression">
            <div class="text-center">
                <h5 style="color: red;">Cette action est irréversible !</h5>
                <p class="mb-3">
                    Supprimer la ligne
                    <strong>N° {{ itemToDelete?.num }}</strong>
                    <span v-if="itemToDelete?.designation">
                        — {{ itemToDelete.designation }}
                    </span> ?
                </p>
                <hr>
                <button
                    class="btn btn-danger me-2"
                    :disabled="loadingAction"
                    @click="confirmDeleteItem"
                >
                    Supprimer
                </button>
                <button class="btn btn-light" data-bs-dismiss="modal">
                    Annuler
                </button>
            </div>
        </Modal>

        <!-- Modal documents -->
        <Modal id="modDoc" title="Ajouter un document">
            <div class="text-center">
                <div v-if="peutSoumettre">
                    <p>Sélectionner un fichier (pdf, png, jpeg, jpg) :</p>

                    <input
                        class="form-control"
                        ref="fileInput"
                        type="file"
                        accept=".pdf,.png,.jpeg,.jpg"
                        @change="fonctionFiles"
                    >

                    <p v-if="uploading">Enregistrement du fichier en cours ...</p>

                    <button
                        class="btn btn-outline-success mt-2"
                        @click="upload_file"
                        :disabled="uploading"
                    >
                        Enregistrer ce fichier
                    </button>

                    <hr>
                </div>
                

                <h5 style="font-weight: bold;">Liste des documents associés</h5>

                <div v-if="doc_drfme.length === 0" class="text-muted">
                    Aucun document associé.
                </div>

                <p
                    v-for="doc in doc_drfme"
                    :key="doc.id"
                    class="d-flex justify-content-center align-items-center gap-2"
                    style="font-weight: bold;"
                >
                    {{ doc.name_doc }}
                    <button
                        class="btn btn-outline-secondary btn-sm"
                        @click="downloadFile(doc.name_doc, doc.nameStorage)"
                    >
                        <img src="/public/icon/download.png" style="width: 20px; height: 20px;" alt="Télécharger">
                    </button>
                    <button
                        v-if="peutSoumettre"
                        class="btn btn-outline-light btn-sm"
                        @click="deleteFile(doc.id, doc.nameStorage)"
                    >
                        <img src="/public/icon/delete.png" style="width: 20px; height: 20px;" alt="Supprimer">
                    </button>
                </p>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { niveauDRFME } from '~/assets/js/CommonVariable.js'

const supabase = useSupabaseClient()
const userStore = useUserStore()
const route = useRoute()

const loading = ref(true)
const loadingAction = ref(false)
const demande_details = ref([])
const dataObj = ref({})

// Documents
const file = ref(null)
const fileInput = ref(null)
const fileName = ref('')
const uploading = ref(false)
const fileUrl = ref(null)
const doc_drfme = ref([])

// Édition / suppression
const editForm = ref({
    id: null,
    designation: '',
    montant_total: null,
    montant_etudiant: 0,
    montant_sesame: 0,
    detail: '',
    observation: ''
})
const itemToDelete = ref(null)

const columns = [
    { key: 'num', label: 'N°' },
    { key: 'designation', label: 'Désignation' },
    { key: 'montant_total', label: 'Montant total (Ar)' },
    { key: 'montant_etudiant', label: 'Part étudiant (Ar)' },
    { key: 'montant_sesame', label: 'Part SESAME (Ar)' },
    { key: 'detail', label: 'Motif ou destination' },
    { key: 'observation', label: 'Observation' },
    { key: 'statut_ligne', label: 'Statut' },
]

const alert = ref({ show: false, message: '', title: '', type: '' })
const showAlert = (message, title, type) => {
    alert.value = { show: true, message, title, type }
    setTimeout(() => { alert.value.show = false }, 5000)
}

const parseNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0
    return Number(String(value).replace(/\s/g, '').replace(',', '.')) || 0
}

const minNivVal = computed(() => {
    const items = demande_details.value || []
    if (!items.length) return null
    return Math.min(...items.map(i => Number(i.niv_val)))
})

const statutLabel = computed(() => {
    const val = minNivVal.value
    switch (val) {
        case niveauDRFME.erg: return "En attente d'envoi"
        case niveauDRFME.superieur: return 'En attente de validation chez votre supérieur'
        case niveauDRFME.finance: return 'En attente de validation chez le responsable financier'
        case niveauDRFME.cg: return 'En attente de validation chez le contrôleur de gestion'
        case niveauDRFME.dpr: return 'En attente de validation chez le DPR'
        case niveauDRFME.cheque: return "En attente d'émission de chèque"
        case niveauDRFME.valide: return 'Validée'
        case niveauDRFME.refuse: return 'Votre DRFME a été refusée'
        default: return val === null ? 'Aucun article' : 'Statut inconnu'
    }
})

const peutSoumettre = computed(() => {
    return demande_details.value.some(
        item => Number(item.niv_val) === Number(niveauDRFME.erg)
    )
})

const closeModal = (modalId) => {
    const modal = document.getElementById(modalId)
    if (modal) {
        const btn = modal.querySelector('[data-bs-dismiss="modal"]')
        if (btn) btn.click()
    }
}

// ====================== RÉCUPÉRATION ======================
const getDemandeDetails = async () => {
    loading.value = true
    try {
        const { data: demandeObj, error: demandeObjError } = await supabase
            .from('ses_obj')
            .select('*')
            .eq('id', route.params.id)
            .eq('cat_proc', 'drfme')
            .single()

        if (demandeObjError) throw demandeObjError

        if (demandeObj.id_user !== userStore.id) {
            loading.value = false
            setTimeout(() => navigateTo('/demande/drfme'), 500)
            return
        }

        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date)
        }

        const { data, error } = await supabase
            .from('ses_items_drfme')
            .select('*')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true })

        if (error) throw error

        demande_details.value = (data || []).map(item => ({
            ...item,
            statut_ligne: getStatutLigne(item.niv_val)
        }))
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du chargement de la DRFME', 'Erreur', 'danger')
    } finally {
        loading.value = false
    }
}

const getStatutLigne = (niv) => {
    switch (Number(niv)) {
        case niveauDRFME.erg: return 'Non soumis'
        case niveauDRFME.superieur: return 'Chez le supérieur'
        case niveauDRFME.finance: return 'Chez la finance'
        case niveauDRFME.cg: return 'Chez le CG'
        case niveauDRFME.dpr: return 'Chez le DPR'
        case niveauDRFME.cheque: return 'Émission chèque'
        case niveauDRFME.valide: return 'Validé'
        case niveauDRFME.refuse: return 'Refusé'
        default: return 'Inconnu'
    }
}

// ====================== MODIFIER ======================
const recalcSesame = () => {
    const total = parseNumber(editForm.value.montant_total)
    const etudiant = parseNumber(editForm.value.montant_etudiant)
    editForm.value.montant_sesame = total - etudiant
}

const openEditModal = (item) => {
    editForm.value = {
        id: item.id,
        designation: item.designation || '',
        montant_total: item.montant_total != null ? Number(item.montant_total) : null,
        montant_etudiant: item.montant_etudiant != null ? Number(item.montant_etudiant) : 0,
        montant_sesame: item.montant_sesame != null ? Number(item.montant_sesame) : 0,
        detail: item.detail || '',
        observation: item.observation || ''
    }
    recalcSesame()
}

const saveEditItem = async () => {
    if (!editForm.value.designation?.toString().trim()) {
        showAlert('La désignation est obligatoire', 'Oops', 'danger')
        return
    }
    if (!editForm.value.detail?.toString().trim()) {
        showAlert('Le motif ou destination est obligatoire', 'Oops', 'danger')
        return
    }
    const total = parseNumber(editForm.value.montant_total)
    const etudiant = parseNumber(editForm.value.montant_etudiant)
    if (total <= 0) {
        showAlert('Le montant total doit être supérieur à 0', 'Oops', 'danger')
        return
    }
    if (etudiant < 0) {
        showAlert('La part étudiant ne peut pas être négative', 'Oops', 'danger')
        return
    }
    if (etudiant > total) {
        showAlert('La part étudiant ne peut pas dépasser le montant total', 'Oops', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const montant_sesame = total - etudiant

        const { error } = await supabase
            .from('ses_items_drfme')
            .update({
                designation: editForm.value.designation.trim(),
                montant_total: total,
                montant_etudiant: etudiant,
                montant_sesame,
                detail: editForm.value.detail.trim(),
                observation: editForm.value.observation?.toString().trim() || null
            })
            .eq('id', editForm.value.id)
            .eq('niv_val', niveauDRFME.erg)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: editForm.value.id,
            action: `Modification de la ligne id:${editForm.value.id} de la DRFME n°${route.params.id}`,
            niv_val: niveauDRFME.erg,
            cat_proc: 'drfme',
            type: 'edit'
        })

        closeModal('modalEditDrfme')
        await getDemandeDetails()
        showAlert('Ligne modifiée avec succès', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de la modification', 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
    }
}

// ====================== SUPPRIMER ======================
const confirmDeleteItem = async () => {
    if (!itemToDelete.value?.id) return

    loadingAction.value = true
    try {
        const item = itemToDelete.value

        const { error } = await supabase
            .from('ses_items_drfme')
            .delete()
            .eq('id', item.id)
            .eq('niv_val', niveauDRFME.erg)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: item.id,
            action: `Suppression de la ligne N°${item.num} (id:${item.id}) de la DRFME n°${route.params.id}`,
            niv_val: niveauDRFME.erg,
            cat_proc: 'drfme',
            type: 'edit'
        })

        closeModal('modalDeleteDrfme')
        itemToDelete.value = null
        await getDemandeDetails()
        showAlert('Ligne supprimée avec succès', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de la suppression', 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
    }
}

// ====================== DOCUMENTS ======================
const doc_recovery = async () => {
    if (fileInput.value) fileInput.value.value = null
    fileName.value = ''
    file.value = null

    try {
        const { data, error } = await supabase
            .from('ses_doc')
            .select('*')
            .eq('id_obj', route.params.id)
            .eq('cat_proc', 'drfme')

        if (error) throw error
        doc_drfme.value = data || []
    } catch (error) {
        console.error('Erreur récupération documents:', error)
    }
}

const fonctionFiles = (event) => {
    file.value = event.target.files[0]
    if (file.value) {
        uploading.value = false
        fileName.value = file.value.name
    } else {
        uploading.value = true
        fileName.value = ''
    }
}

const upload_file = async () => {
    if (!file.value) {
        showAlert('Veuillez sélectionner un fichier', 'Oups!', 'danger')
        return
    }

    uploading.value = true
    try {
        const nomNettoye = nettoyerNomFichier(file.value.name)
        const filesNameStorage = `${Date.now()}_${nomNettoye}`
        const filePath = `drfme/${filesNameStorage}`

        const { error } = await supabase.storage
            .from('sesame_doc')
            .upload(filePath, file.value, { upsert: false })

        if (error) throw error

        const { data: publicUrlData } = supabase.storage
            .from('sesame_doc')
            .getPublicUrl(filePath)

        fileUrl.value = publicUrlData.publicUrl

        const { error: errorInsertInfo } = await supabase
            .from('ses_doc')
            .insert([{
                id_user: userStore.id,
                name_doc: fileName.value,
                url_doc: fileUrl.value,
                nameStorage: filesNameStorage,
                id_obj: route.params.id,
                cat_proc: 'drfme'
            }])

        if (errorInsertInfo) throw errorInsertInfo

        showAlert('Fichier enregistré avec succès', 'Succès', 'success')
        doc_recovery()
    } catch (error) {
        console.error('Erreur upload:', error)
        showAlert("Erreur lors de l'upload", 'Oups!', 'danger')
    } finally {
        uploading.value = false
    }
}

const deleteFile = async (id_doc, nameStorage) => {
    const path = `drfme/${nameStorage}`
    try {
        const { error } = await supabase.storage.from('sesame_doc').remove([path])
        if (error) throw error

        const { error: errorDeleteInfo } = await supabase
            .from('ses_doc')
            .delete()
            .eq('id', id_doc)

        if (errorDeleteInfo) throw errorDeleteInfo

        showAlert('Fichier supprimé avec succès', 'Succès', 'success')
        doc_recovery()
    } catch (error) {
        console.error('Erreur suppression:', error.message)
        showAlert('Erreur lors de la suppression du fichier', 'Oups!', 'danger')
    }
}

const downloadFile = async (name_doc, nameStorage) => {
    const path = `drfme/${nameStorage}`
    try {
        const encoding = encodeURI(path)
        const { data, error } = await supabase.storage
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

// ====================== ENVOI DRFME ======================
const envoyerDRFME = async () => {
    if (doc_drfme.value.length === 0) {
        showAlert("Veuillez ajouter au moins un document avant l'envoi.", 'Oups!', 'danger')
        return
    }
    if (!peutSoumettre.value) {
        showAlert('Aucun article à soumettre.', 'Oups!', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const nextLevel = Number(niveauDRFME.erg) + 1

        const { data: itemsId, error: updateItemsError } = await supabase
            .from('ses_items_drfme')
            .update({ niv_val: nextLevel })
            .eq('id_obj', route.params.id)
            .eq('niv_val', niveauDRFME.erg)
            .select('id')

        if (updateItemsError) throw updateItemsError

        for (let i = 0; i < (itemsId || []).length; i++) {
            const { error: insertHistError } = await supabase
                .from('ses_histo2')
                .insert({
                    id_user: userStore.id,
                    id_obj: route.params.id,
                    id_item: itemsId[i].id,
                    action: `Soumission de la DRFME n°${route.params.id}`,
                    niv_val: nextLevel,
                    cat_proc: 'drfme',
                    type: 'valider'
                })
            if (insertHistError) throw insertHistError
        }

        showAlert('DRFME soumise avec succès !', 'Succès!', 'success')
        await getDemandeDetails()
    } catch (error) {
        console.error("Erreur lors de l'envoi de la DRFME:", error)
        showAlert("Erreur lors de l'envoi de la DRFME", 'Oups!', 'danger')
    } finally {
        loadingAction.value = false
    }
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

onMounted(() => {
    getDemandeDetails()
    doc_recovery()
})
</script>