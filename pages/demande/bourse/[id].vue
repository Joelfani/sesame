<template>
    <div class="purchase_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE DE DEPENSES ETUDIANTES</h1>

            <client-only>
                <button v-if="dataObj.niv_val == niveauBourse.erg"
                    class="btn btn-outline-dark"
                    data-bs-toggle="modal"
                    data-bs-target="#modDoc"
                    @click="doc_recovery"
                >
                    Ajouter document
                </button>
                <button v-else
                    class="btn btn-outline-dark"
                    data-bs-toggle="modal"
                    data-bs-target="#modDoc"
                    @click="doc_recovery"
                >
                    Liste des documents associés
                </button>
            </client-only>

            <div class="link_demande">
                <NuxtLink to="/demande/bourse" class="btn btn-outline-secondary">
                    Retour à la liste
                </NuxtLink>
            </div>
        </div>

        <!-- Informations générales -->
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h6>N° d'enregistrement : <span>{{ route.params.id }}</span></h6>
                <h6>Date : {{ dataObj.date }}</h6>
                <h6>Objet : <strong>{{ dataObj.obj_bourse }}</strong></h6>
                <h6>Statut : <strong>{{ statutLabel }}</strong></h6>
            </div>

            <div v-if="peutSoumettre">
                <button
                    class="btn btn-outline-success"
                    :disabled="doc_bourse.length === 0 || loadingAction"
                    @click="envoyerBourse"
                >
                    Soumettre la demande
                </button>
                <p v-if="doc_bourse.length === 0" style="font-size: 12px; color: gray;">
                    Veuillez d'abord ajouter un document avant l'envoi.
                </p>
            </div>
        </div>

        <!-- Tableau -->
        <div class="table_block_list mt-4">
            <Table
                :columns="columns"
                :rows="demande_details"
                :loading="loading"
            >
                <template #actions="{ item }">
                    <button
                        v-if="Number(item.niv_val) === Number(niveauBourse.erg)"
                        class="btn btn-primary btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#modalEdition"
                        @click="openEditModal(item)"
                    >
                        Modifier
                    </button>
                </template>
            </Table>
        </div>

        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />

        <!-- Modal édition item -->
        <Modal id="modalEdition" title="Modifier la ligne">
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Description <span class="text-danger">*</span></label>
                    <textarea v-model="editForm.description" class="form-control" rows="2"></textarea>
                </div>
                <div class="col-md-3">
                    <label class="form-label fw-bold">Nombre <span class="text-danger">*</span></label>
                    <input
                        type="number"
                        class="form-control"
                        min="1"
                        v-model.number="editForm.qte"
                        @input="calculerMontant"
                    >
                </div>
                <div class="col-md-3">
                    <label class="form-label fw-bold">Montant unitaire <span class="text-danger">*</span></label>
                    <input
                        type="number"
                        class="form-control"
                        min="0"
                        v-model.number="editForm.prix"
                        @input="calculerMontant"
                    >
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-bold">Montant</label>
                    <input
                        type="text"
                        class="form-control"
                        :value="editForm.montant"
                        disabled
                    >
                </div>
                <div class="col-md-8">
                    <label class="form-label fw-bold">Observations</label>
                    <textarea v-model="editForm.observation" class="form-control" rows="2"></textarea>
                </div>
            </div>
            <div class="d-flex gap-2 justify-content-end mt-4">
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

        <!-- Modal documents -->
        <Modal id="modDoc" :title="dataObj.niv_val == niveauBourse.erg ? 'Ajouter un document':'Liste des documents associés'">
            <div class="text-center">
                <div v-if="dataObj.niv_val == niveauBourse.erg">
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

                <h5 v-if="dataObj.niv_val == niveauBourse.erg" style="font-weight: bold;">Liste des documents associés</h5>

                <div v-if="doc_bourse.length === 0" class="text-muted">
                    Aucun document associé.
                </div>

                <p
                    v-for="doc in doc_bourse"
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
                        v-if="dataObj.niv_val == niveauBourse.erg"
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
import { niveauBourse } from '~/assets/js/CommonVariable.js'

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
const doc_bourse = ref([])

// Édition
const editForm = ref({
    id: null,
    description: '',
    qte: null,
    prix: null,
    montant: null,
    observation: ''
})

const columns = [
    { key: 'num', label: 'N°' },
    { key: 'description', label: 'Description' },
    { key: 'qte', label: 'Nombre' },
    { key: 'prix', label: 'Montant unitaire' },
    { key: 'montant', label: 'Montant' },
    { key: 'observation', label: 'Observation' },
    { key: 'statut_ligne', label: 'Statut' }
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
        case niveauBourse.erg: return 'En attente d\'envoi'
        case niveauBourse.superieur: return 'En attente de validation chez votre supérieur'
        case niveauBourse.finance: return 'En attente de validation chez le responsable financier'
        case niveauBourse.cg: return 'En attente de validation chez le controlleur de gestion'
        case niveauBourse.dpr: return 'En attente de validation du DPR'
        case niveauBourse.cheque: return 'En attente d\'émission de chèque'
        case niveauBourse.valide: return 'Validée'
        case niveauBourse.refuse: return 'Votre demande a été refusée'
        default: return val === null ? 'Aucun article' : 'Statut inconnu'
    }
})

const peutSoumettre = computed(() => {
    return demande_details.value.some(item => Number(item.niv_val) === Number(niveauBourse.erg))
})

// ====================== DATA ======================
const getDemandeDetails = async () => {
    loading.value = true
    try {
        const { data: demandeObj, error: demandeObjError } = await supabase
            .from('ses_obj')
            .select('*')
            .eq('id', route.params.id)
            .eq('cat_proc', 'bourse')
            .single()

        if (demandeObjError) throw demandeObjError

        if (demandeObj.id_user !== userStore.id) {
            loading.value = false
            setTimeout(() => navigateTo('/demande/bourse'), 500)
            return
        }

        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date)
        }

        const { data, error } = await supabase
            .from('ses_items_bourse')
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
        showAlert('Erreur lors du chargement de la demande de bourse', 'Erreur', 'danger')
    } finally {
        loading.value = false
    }
}

const getStatutLigne = (niv) => {
    switch (Number(niv)) {
        case niveauBourse.erg: return 'Non soumis'
        case niveauBourse.superieur: return 'Chez le supérieur'
        case niveauBourse.finance: return 'Chez la finance'
        case niveauBourse.cg: return 'Chez le CG'
        case niveauBourse.dpr: return 'Chez le DPR'
        case niveauBourse.cheque: return 'Émission chèque'
        case niveauBourse.valide: return 'Validé'
        case niveauBourse.refuse: return 'Refusé'
        default: return 'Inconnu'
    }
}

// ====================== ÉDITION ======================
const openEditModal = (item) => {
    editForm.value = {
        id: item.id,
        description: item.description || '',
        observation: item.observation || '',
        qte: Number(item.qte) || null,
        prix: Number(item.prix) || null,
        montant: Number(item.montant) || 0
    }
}

const calculerMontant = () => {
    const qte = Number(editForm.value.qte) || 0
    const prix = Number(editForm.value.prix) || 0
    editForm.value.montant = qte * prix
}

const closeModal = (modalId) => {
    const modal = document.getElementById(modalId)
    if (modal) {
        const btn = modal.querySelector('[data-bs-dismiss="modal"]')
        if (btn) btn.click()
    }
}

const saveEditItem = async () => {
    if (!editForm.value.description?.toString().trim()) {
        showAlert('La description est obligatoire', 'Oops', 'danger')
        return
    }
    if (!editForm.value.qte || editForm.value.qte <= 0) {
        showAlert('Le nombre doit être supérieur à 0', 'Oops', 'danger')
        return
    }
    if (editForm.value.prix === null || editForm.value.prix === '' || editForm.value.prix < 0) {
        showAlert('Le montant unitaire est obligatoire', 'Oops', 'danger')
        return
    }

    loadingAction.value = true
    try {
        calculerMontant()

        const { error } = await supabase
            .from('ses_items_bourse')
            .update({
                description: editForm.value.description.trim(),
                qte: editForm.value.qte,
                prix: editForm.value.prix,
                montant: editForm.value.montant,
                observation: editForm.value.observation.trim()
            })
            .eq('id', editForm.value.id)
            .eq('niv_val', niveauBourse.erg) // sécurité

        if (error) throw error

        await supabase.from('ses_histo2')
        .insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: editForm.value.id,
            action: `Modification de la ligne id:${editForm.value.id} de la demande de bourse n°${route.params.id}`,
            niv_val: niveauBourse.erg,
            cat_proc: 'bourse'
        })

        closeModal('modalEdition')
        await getDemandeDetails()
        showAlert('Ligne modifiée avec succès', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de la modification', 'Oups!', 'danger')
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
            .eq('cat_proc', 'bourse')

        if (error) throw error
        doc_bourse.value = data || []
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
        const filePath = `bourse/${filesNameStorage}`

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
                cat_proc: 'bourse'
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
    const path = `bourse/${nameStorage}`
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
        console.error(error.message)
        showAlert('Erreur lors de la suppression du fichier', 'Oups!', 'danger')
    }
}

const downloadFile = async (name_doc, nameStorage) => {
    const path = `bourse/${nameStorage}`
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
        console.error(error.message)
        showAlert('Erreur lors du téléchargement du fichier', 'Oups!', 'danger')
    }
}

// ====================== SOUMISSION ======================
const envoyerBourse = async () => {
    if (doc_bourse.value.length === 0) {
        showAlert('Veuillez ajouter au moins un document avant l\'envoi.', 'Oups!', 'danger')
        return
    }
    if (!peutSoumettre.value) {
        showAlert('Aucun article à soumettre.', 'Oups!', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const nextLevel = Number(niveauBourse.erg) + 1

        const {data:itemsId,  error: updateItemsError } = await supabase
            .from('ses_items_bourse')
            .update({ niv_val: nextLevel })
            .eq('id_obj', route.params.id)
            .eq('niv_val', niveauBourse.erg)
            .select('id')

        if (updateItemsError) throw updateItemsError

        // Optionnel : mettre aussi l'en-tête au même niveau
        await supabase
            .from('ses_obj')
            .update({ niv_val: nextLevel })
            .eq('id', route.params.id)

        for(let i = 0; i < itemsId.length; i++){

            await supabase.from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                action: `Soumission de la demande de bourse n°${route.params.id}`,
                id_item:itemsId[i].id,
                niv_val: nextLevel,
                cat_proc: 'bourse'
            })

        }

        showAlert('Demande de bourse soumise avec succès !', 'Succès!', 'success')
        await getDemandeDetails()
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de l\'envoi de la demande', 'Oups!', 'danger')
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