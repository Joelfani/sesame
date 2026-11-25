<template>
    <div class="d-inline-block">
        <client-only>
            <button
                ref="triggerBtn"
                type="button"
                :class="[buttonClass, { 'd-none': !showButton }]"
                data-bs-toggle="modal"
                :data-bs-target="`#${modalId}`"
                @click="loadDocs"
            >
                {{ buttonLabel }}
            </button>
        </client-only>

        <Modal :id="modalId" :title="title">
            <div class="text-center">
                <div v-if="loading" class="text-muted py-3">
                    Chargement des documents...
                </div>

                <div v-else-if="docs.length === 0" class="text-muted py-3">
                    Aucun document associé.
                </div>

                <div v-else>
                    <div
                        v-for="doc in docs"
                        :key="doc.id"
                        class="d-flex justify-content-between align-items-center border-bottom py-2 gap-2"
                    >
                        <span style="font-weight: bold; text-align: left; word-break: break-word;">
                            {{ doc.name_doc }}
                        </span>

                        <span class="d-flex gap-1 flex-shrink-0">
                            <button
                                type="button"
                                class="btn btn-outline-secondary btn-sm"
                                title="Télécharger"
                                @click="downloadFile(doc)"
                            >
                                <img src="/public/icon/download.png" style="width: 20px; height: 20px;" alt="Télécharger">
                            </button>

                            <!-- Suppression : visible seulement si allow-delete -->
                            <button
                                v-if="allowDelete"
                                type="button"
                                class="btn btn-outline-light btn-sm"
                                title="Supprimer"
                                @click="docToDelete = doc"
                            >
                                <img src="/public/icon/delete.png" style="width: 20px; height: 20px;" alt="Supprimer">
                            </button>
                        </span>
                    </div>
                </div>

                <!-- Confirmation de suppression (dans le modal, pas de
                     deuxième modal ni de confirm() du navigateur) -->
                <div v-if="docToDelete" class="alert alert-danger mt-3 text-start">
                    <strong>Attention</strong><br>
                    Vous êtes sur le point de supprimer « {{ docToDelete.name_doc }} ».
                    Cette action est irréversible.
                    <div class="d-flex gap-2 mt-2">
                        <button
                            type="button"
                            class="btn btn-danger btn-sm"
                            :disabled="deleting"
                            @click="confirmDelete"
                        >
                            {{ deleting ? 'Suppression...' : 'Oui, supprimer' }}
                        </button>
                        <button
                            type="button"
                            class="btn btn-outline-secondary btn-sm"
                            :disabled="deleting"
                            @click="docToDelete = null"
                        >
                            Annuler
                        </button>
                    </div>
                </div>

                <hr>
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Fermer</button>
            </div>
        </Modal>

        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
    </div>
</template>

<script setup>
const props = defineProps({
    // Id HTML du modal : unique par instance sur la page
    modalId: { type: String, required: true },
    // Id de la demande (colonne id_obj de la table des documents)
    idObj: { type: [String, Number], default: null },
    // Table des métadonnées : 'ses_doc' (NDF, bourse, DRFMS, DRFME...) ou
    // 'ses_doc_achat' (achat)
    table: { type: String, default: 'ses_doc' },
    // Filtre cat_proc pour ses_doc (ex: 'ndf'). Vide pour ses_doc_achat, qui
    // n'a pas de colonne cat_proc
    catProc: { type: String, default: '' },
    // Dossier dans le bucket. Par défaut le cat_proc (ex: 'ndf' -> ndf/...),
    // à préciser pour l'achat ('achats')
    folder: { type: String, default: '' },
    bucket: { type: String, default: 'sesame_doc' },
    title: { type: String, default: 'Documents associés' },
    // Affiche le bouton de suppression (à réserver aux profils autorisés)
    allowDelete: { type: Boolean, default: false },
    buttonLabel: { type: String, default: 'Liste des documents' },
    buttonClass: { type: String, default: 'btn btn-outline-dark' },
    // false : pas de bouton visible, ouverture par open() depuis le parent
    showButton: { type: Boolean, default: true }
})

// loaded : liste (re)chargée ; deleted : document supprimé (utile au parent
// s'il affiche par exemple un compteur de documents)
const emit = defineEmits(['loaded', 'deleted'])

const supabase = useSupabaseClient()

const triggerBtn = ref(null)
const docs = ref([])
const loading = ref(false)
const deleting = ref(false)
const docToDelete = ref(null)

const alert = ref({ show: false, message: '', title: '', type: '' })
const showAlert = (message, title, type) => {
    alert.value = { show: true, message, title, type }
    setTimeout(() => { alert.value.show = false }, 5000)
}

// Dossier de stockage effectif : folder explicite, sinon cat_proc
const storageFolder = computed(() => props.folder || props.catProc)

// Chemin complet du fichier dans le bucket
const storagePath = (doc) =>
    storageFolder.value ? `${storageFolder.value}/${doc.nameStorage}` : doc.nameStorage

// ====================== LISTE ======================
const loadDocs = async () => {
    docToDelete.value = null

    if (props.idObj === null || props.idObj === undefined || props.idObj === '') {
        docs.value = []
        return
    }

    loading.value = true
    try {
        let query = supabase
            .from(props.table)
            .select('*')
            .eq('id_obj', props.idObj)
            .order('id', { ascending: true })

        if (props.catProc) query = query.eq('cat_proc', props.catProc)

        const { data, error } = await query
        if (error) throw error

        docs.value = data || []
        emit('loaded', docs.value)
    } catch (error) {
        console.error('Erreur lors de la récupération des documents :', error)
        showAlert('Erreur lors du chargement des documents', 'Oups!', 'danger')
    } finally {
        loading.value = false
    }
}

// ====================== TÉLÉCHARGEMENT ======================
const downloadFile = async (doc) => {
    try {
        const { data, error } = await supabase.storage
            .from(props.bucket)
            .createSignedUrl(encodeURI(storagePath(doc)), 60) // URL valable 60 secondes

        if (error) throw error

        // Lance le téléchargement avec le nom d'origine du document
        const a = document.createElement('a')
        a.href = data.signedUrl
        a.download = doc.name_doc
        document.body.appendChild(a)
        a.click()
        a.remove()

        showAlert('Fichier téléchargé avec succès', 'Succès', 'success')
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier :', error.message)
        showAlert('Erreur lors du téléchargement du fichier', 'Oups!', 'danger')
    }
}

// ====================== SUPPRESSION ======================
// On supprime d'abord la ligne en base, puis le fichier : si l'étape fichier
// échoue, il reste au pire un fichier orphelin dans le stockage, alors que
// l'ordre inverse laisserait dans la liste un document qui ne peut plus être
// téléchargé.
const confirmDelete = async () => {
    const doc = docToDelete.value
    if (!doc) return

    deleting.value = true
    try {
        // .select('id') renvoie les lignes réellement supprimées : une règle
        // de sécurité (RLS) qui refuse la suppression ne lève pas d'erreur
        // mais ne supprime rien, ce qu'on détecte ici.
        const { data: deletedRows, error: dbError } = await supabase
            .from(props.table)
            .delete()
            .eq('id', doc.id)
            .select('id')

        if (dbError) throw dbError
        if (!deletedRows || deletedRows.length === 0) {
            throw new Error('Suppression refusée ou document déjà supprimé')
        }

        const { error: storageError } = await supabase.storage
            .from(props.bucket)
            .remove([storagePath(doc)])

        docs.value = docs.value.filter(d => d.id !== doc.id)
        docToDelete.value = null
        emit('deleted', doc)

        if (storageError) {
            console.error('Fichier non supprimé du stockage :', storageError.message)
            showAlert(
                'Document retiré de la liste, mais le fichier n\'a pas pu être supprimé du stockage',
                'Attention',
                'warning'
            )
        } else {
            showAlert('Document supprimé avec succès', 'Succès', 'success')
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du document :', error.message)
        showAlert('Erreur lors de la suppression du document', 'Oups!', 'danger')
    } finally {
        deleting.value = false
    }
}

// Accessible depuis le parent via une ref :
//   docsRef.value.open()  -> ouvre le modal (et charge la liste)
//   docsRef.value.load()  -> recharge la liste sans ouvrir le modal
defineExpose({
    open: () => triggerBtn.value?.click(),
    load: loadDocs
})
</script>