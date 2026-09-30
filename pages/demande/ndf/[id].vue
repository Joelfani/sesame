<template>
    <div class="purchase_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA NOTE DE FRAIS</h1>

            <client-only>
                <button
                    class="btn btn-outline-dark"
                    data-bs-toggle="modal"
                    data-bs-target="#modDoc"
                    @click="doc_recovery"
                >
                    Ajouter document
                </button>
            </client-only>

            <div class="link_demande">
                <NuxtLink to="/demande/ndf" class="btn btn-outline-secondary">
                    Retour à la liste
                </NuxtLink>
            </div>
        </div>

        <!-- Informations générales -->
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h6>N° d'enregistrement : <span>{{ route.params.id }}</span></h6>
                <h6>Date : {{ dataObj.date }}</h6>
                <h6>Statut : <strong>{{ statutLabel }}</strong></h6>
            </div>

            <div v-if="peutSoumettre">
                <button
                    class="btn btn-outline-success"
                    :disabled="doc_ndf.length === 0 || loadingAction"
                    @click="envoyerNDF"
                >
                    Soumettre la note de frais
                </button>
                <p v-if="doc_ndf.length === 0" style="font-size: 12px; color: gray;">
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
                    <template v-if="Number(item.niv_val) === Number(niveauNDF.erg)">
                        <button
                            class="btn btn-primary btn-sm me-1"
                            data-bs-toggle="modal"
                            data-bs-target="#modalEditNdf"
                            @click="openEditModal(item)"
                        >
                            Modifier
                        </button>
                        <button
                            class="btn btn-danger btn-sm"
                            data-bs-toggle="modal"
                            data-bs-target="#modalDeleteNdf"
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
        <Modal id="modalEditNdf" title="Modifier la ligne">
            <div class="row g-3">
                <div class="col-12">
                    <label class="form-label fw-bold">
                        Libellé de facture / Commentaires <span class="text-danger">*</span>
                    </label>
                    <textarea
                        v-model="editForm.description"
                        class="form-control"
                        rows="2"
                    ></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Nature de la dépense</label>
                    <input
                        type="text"
                        class="form-control"
                        v-model="editForm.nature"
                    >
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">OK/NOK <span class="text-danger">*</span></label>
                    <select
                        class="form-select"
                        v-model="editForm.ok"
                    >
                        <option value="" disabled>Choisir...</option>
                        <option value="OK">OK</option>
                        <option value="NOK">NOK</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">
                        Montant (Ar) <span class="text-danger">*</span>
                    </label>
                    <input
                        type="number"
                        class="form-control"
                        min="0"
                        step="any"
                        v-model.number="editForm.montant"
                    >
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
        <Modal id="modalDeleteNdf" title="Confirmer la suppression">
            <div class="text-center">
                <h5 style="color: red;">Cette action est irréversible !</h5>
                <p class="mb-3">
                    Supprimer la ligne
                    <strong>N° {{ itemToDelete?.num }}</strong>
                    <span v-if="itemToDelete?.description">
                        — {{ itemToDelete.description }}
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

                <h5 style="font-weight: bold;">Liste des documents associés</h5>

                <div v-if="doc_ndf.length === 0" class="text-muted">
                    Aucun document associé.
                </div>

                <p
                    v-for="doc in doc_ndf"
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
import { niveauNDF } from '~/assets/js/CommonVariable.js'

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
const doc_ndf = ref([])

// Édition / suppression
const editForm = ref({
    id: null,
    description: '',
    nature: '',
    montant: null,
    ok: ''
})
const itemToDelete = ref(null)

const columns = [
    { key: 'num', label: 'N°' },
    { key: 'description', label: 'Libellé de facture / Commentaires' },
    { key: 'nature', label: 'Nature de la dépense' },
    { key: 'ok', label: 'OK/NOK' },
    { key: 'montant', label: 'Montant (Ar)' },
    { key: 'statut_ligne', label: 'Statut' },
]

const alert = ref({ show: false, message: '', title: '', type: '' })
const showAlert = (message, title, type) => {
    alert.value = { show: true, message, title, type }
    setTimeout(() => { alert.value.show = false }, 5000)
}

const minNivVal = computed(() => {
    const items = demande_details.value || []
    if (!items.length) return null
    return Math.min(...items.map(i => Number(i.niv_val)))
})

const statutLabel = computed(() => {
    const val = minNivVal.value
    switch (val) {
        case niveauNDF.erg: return 'En attente d\'envoi'
        case niveauNDF.superieur: return 'En attente de validation chez votre supérieur'
        case niveauNDF.finance: return 'En attente de validation chez le responsable financier'
        case niveauNDF.cg: return 'En attente de validation chez le controlleur de gestion'
        case niveauNDF.dpr: return 'En attente de validation chez le DPR'
        case niveauNDF.cheque: return 'En attente d\'émission de chèque'
        case niveauNDF.valide: return 'Validée'
        case niveauNDF.refuse: return 'Votre note de frais a été refusée'
        default: return val === null ? 'Aucun article' : 'Statut inconnu'
    }
})

const peutSoumettre = computed(() => {
    return demande_details.value.some(item => Number(item.niv_val) === Number(niveauNDF.erg))
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
            .eq('cat_proc', 'ndf')
            .single()

        if (demandeObjError) throw demandeObjError

        if (demandeObj.id_user !== userStore.id) {
            loading.value = false
            setTimeout(() => navigateTo('/demande/ndf'), 500)
            return
        }

        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date)
        }

        const { data, error } = await supabase
            .from('ses_items_ndf')
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
        showAlert('Erreur lors du chargement de la note de frais', 'Erreur', 'danger')
    } finally {
        loading.value = false
    }
}

const getStatutLigne = (niv) => {
    switch (Number(niv)) {
        case niveauNDF.erg: return 'Non soumis'
        case niveauNDF.superieur: return 'Chez le supérieur'
        case niveauNDF.finance: return 'Chez la finance'
        case niveauNDF.cg: return 'Chez le CG'
        case niveauNDF.dpr: return 'Chez le DPR'
        case niveauNDF.cheque: return 'Émission chèque'
        case niveauNDF.valide: return 'Validé'
        case niveauNDF.refuse: return 'Refusé'
        default: return 'Inconnu'
    }
}

// ====================== MODIFIER ======================
const openEditModal = (item) => {
    editForm.value = {
        id: item.id,
        description: item.description || '',
        nature: item.nature || '',
        ok: item.ok || '',
        montant: item.montant != null ? Number(item.montant) : null
    }
}

const saveEditItem = async () => {
    if (!editForm.value.description?.toString().trim()) {
        showAlert('Le libellé / commentaire est obligatoire', 'Oops', 'danger')
        return
    }
    if (editForm.value.ok === '') {
        showAlert('Le statut OK/NOK est obligatoire', 'Oops', 'danger')
        return
    }
    if (editForm.value.montant === null || editForm.value.montant === '' || Number(editForm.value.montant) < 0) {
        showAlert('Le montant est obligatoire et doit être ≥ 0', 'Oops', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const { error } = await supabase
            .from('ses_items_ndf')
            .update({
                description: editForm.value.description.trim(),
                nature: editForm.value.nature?.toString().trim() || null,
                ok: editForm.value.ok || null,
                montant: Number(editForm.value.montant)
            })
            .eq('id', editForm.value.id)
            .eq('niv_val', niveauNDF.erg) // sécurité

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: editForm.value.id,
            action: `Modification de la ligne id:${editForm.value.id} de la NDF n°${route.params.id}`,
            niv_val: niveauNDF.erg,
            cat_proc: 'ndf'
        })

        closeModal('modalEditNdf')
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
            .from('ses_items_ndf')
            .delete()
            .eq('id', item.id)
            .eq('niv_val', niveauNDF.erg) // sécurité

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: item.id,
            action: `Suppression de la ligne N°${item.num} (id:${item.id}) de la NDF n°${route.params.id}`,
            niv_val: niveauNDF.erg,
            cat_proc: 'ndf'
        })

        closeModal('modalDeleteNdf')
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
            .eq('cat_proc', 'ndf')

        if (error) throw error
        doc_ndf.value = data || []
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
        const filesNameStorage = Date.now() + '_' + file.value.name
        const filePath = `ndf/${filesNameStorage}`

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
                cat_proc: 'ndf'
            }])

        if (errorInsertInfo) throw errorInsertInfo

        showAlert('Fichier enregistré avec succès', 'Succès', 'success')
        doc_recovery()
    } catch (error) {
        console.error('Erreur upload:', error.message)
        showAlert('Erreur lors de l\'upload', 'Oups!', 'danger')
    } finally {
        uploading.value = false
    }
}

const deleteFile = async (id_doc, nameStorage) => {
    const path = `ndf/${nameStorage}`
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
    const path = `ndf/${nameStorage}`
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

// ====================== ENVOI NDF ======================
const envoyerNDF = async () => {
    if (doc_ndf.value.length === 0) {
        showAlert('Veuillez ajouter au moins un document avant l\'envoi.', 'Oups!', 'danger')
        return
    }
    if (!peutSoumettre.value) {
        showAlert('Aucun article à soumettre.', 'Oups!', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const nextLevel = Number(niveauNDF.erg) + 1

        const {data:itemsId, error: updateItemsError } = await supabase
            .from('ses_items_ndf')
            .update({ niv_val: nextLevel })
            .eq('id_obj', route.params.id)
            .eq('niv_val', niveauNDF.erg)
            .select('id')

        if (updateItemsError) throw updateItemsError

        for(let i = 0; i < itemsId.length; i++){
            const { error: insertHistError } = await supabase
                .from('ses_histo2')
                .insert({
                    id_user: userStore.id,
                    id_obj: route.params.id,
                    action: `Soumission de la note de frais n°${route.params.id}`,
                    id_item:itemsId[i].id,
                    niv_val: nextLevel,
                    cat_proc: 'ndf'
                })
            if (insertHistError) throw insertHistError
        }
        

        showAlert('Note de frais soumise avec succès !', 'Succès!', 'success')
        await getDemandeDetails()
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la NDF:', error)
        showAlert('Erreur lors de l\'envoi de la note de frais', 'Oups!', 'danger')
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