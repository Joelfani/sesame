<template>
<div class="rectification_page">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
    <h1>ANCIEN VALEUR RECTIFIER</h1>
    <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="openModal">
        + Nouvelle rectification
        </button>
    </div>
    </div>
    <!-- Champ de recherche -->
        <div class="d-flex align-items-center">
            <select name="choix" class="form-select mb-3" style="width: 250px; margin-right: 10px;" v-model="choix_filtre"@change="resetinputs">
                <option value="num">N° d'enregistrement</option>
                <option value="date">Date</option>
            </select>
            
            <template v-if="choix_filtre === 'date'">
                <label style="font-weight: bold; margin-right: 10px;">de: </label>
                <input type="date" class="form-control mb-3" style="width: 200px;margin-right: 10px;" v-model="date_debut" @change="filterByDate">
                <label style="font-weight: bold; margin-right: 10px;">à: </label>
                <input type="date" class="form-control mb-3" style="width: 200px;" v-model="date_fin" @change="filterByDate">
            </template>
            
            <input v-else type="search" placeholder="Rechercher une demande" class="form-control mb-3" style="width: 250px; margin-right: 10px;" v-model="search_term" @input="filterData">
        </div>

    <!-- Tableau historique des rectifications -->
    <div class="table_block_list mt-4">
    <Table
        :columns="columnsRectif"
        :rows="filtered_liste"
        :showActions="false"
        :loading="loadingTable"
    />
    </div>

    <!-- ===================== MODAL ===================== -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-custom">

        <!-- Barre d'étapes -->
        <div class="stepper mb-4">
        <div
            v-for="(step, i) in steps"
            :key="i"
            class="step"
            :class="{ active: currentStep === i, done: currentStep > i }"
        >
            <div class="step-circle">{{ i + 1 }}</div>
            <span class="step-label">{{ step }}</span>
        </div>
        <div class="step-line"></div>
        </div>

        <!-- Bouton fermer -->
        <button class="modal-close" @click="closeModal">&times;</button>

        <!-- ======= Saisie du N° d'objet ======= -->
        <div v-if="currentStep === 0">
        <h5 class="modal-title-step">Rechercher une demande</h5>
        <p class="modal-subtitle">Entrez le numéro d'enregistrement de la demande à rectifier.</p>
        <div class="mb-3">
            <label class="form-label">N° d'enregistrement de la demande</label>
            <input
            v-model="searchObjId"
            type="number"
            class="form-control"
            placeholder="Ex: 42"
            @keyup.enter="searchDemande"
            /><!--@keyup.enter => quand l'utilsateur appuie sur la touche Entrée -->
            <div v-if="searchError" class="text-danger mt-1" style="font-size:13px;">{{ searchError }}</div>
        </div>
        <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-outline-secondary" @click="closeModal">Annuler</button>
            <button class="btn btn-primary" :disabled="loadingSearch || !searchObjId" @click="searchDemande">
                <span v-if="loadingSearch">Recherche...</span>
                <span v-else>Rechercher</span>
            </button>
        </div>
        </div>

        <!-- ======= ÉTAPE 2 : Choix de l'article (si plusieurs) ======= -->
        <div v-if="currentStep === 1">

            <h5 class="modal-title-step">Objet de la demande</h5>
            <p>{{ objetDem }}</p>

            <h5 class="modal-title-step">Sélectionner un article</h5>
            <p class="modal-subtitle">
                <strong>{{ articlesFound.length }}</strong> article(s) trouvé(s) pour la demande N° <strong>{{ searchObjId }}</strong>. Choisissez l'article à rectifier:
            </p>
            <div class="articles-list">
                <div
                v-for="article in articlesFound"
                :key="article.id"
                class="article-card"
                :class="{ selected: selectedArticle?.id === article.id }"
                @click="selectArticle(article)"
                >
                <div class="article-num">N° {{ article.num }}</div>
                <div class="article-info">
                    <span class="article-label">{{ article.designation || 'Article #' + article.id }}</span>
                    <span class="article-meta">Qté: {{ article.qte }} | Prix: {{ formatNumber(article.prixR) }} Ar</span>
                </div>
                <div class="article-check" v-if="selectedArticle?.id === article.id">✓</div>
                </div>
            </div><br> 
            <!-- ======= Gestion des documents ======= -->
            <div v-if="userStore.achat" class="document">
                <h5 class="modal-title-step">Liste des documents associés</h5>
                
                <div v-if="doc_achat.length > 0" class="text-center">
                        <p v-for="doc in doc_achat" :key="doc.id" style="font-weight: bold;">
                            {{ doc.name_doc }}
                            <button class="btn btn-outline-secondary" @click="downloadFile(doc.name_doc, doc.nameStorage)"><img src="/public/icon/download.png" style="width: 20px; height: 20px;"></button>
                            <button class="btn btn-outline-light" @click="deleteFile(searchObjId,doc.id, doc.nameStorage)"><img src="/public/icon/delete.png" style="width: 20px; height: 20px;"></button>
                        </p>
                </div>
                <p v-else style="color: #b1b1b1;">Aucun document associé </p>
                <h5 class="modal-title-step">Ajouter un document</h5>
                <div class="text-center">
                    
                    <p>Séléctionner un fichier (pdf,png,jpeg,jpg):</p>
                    
                    <input class="form-control" ref="fileInput" type="file" @change="fonctionFiles"></input>
                    
                    <p v-if="uploading">Enregistrement du fichier en cours ...</p>
                    
                    <button class="btn btn-outline-success" @click="upload_file(searchObjId)" :disabled="uploading">Enregistrer ce fichier</button>
                    <hr>
                    
                    
                </div>
            </div>
            <div class="d-flex justify-content-between gap-2 mt-3">
                <button class="btn btn-outline-secondary" @click="currentStep = 0">Retour</button>
                <button class="btn btn-primary" :disabled="!selectedArticle" @click="goToEditStep">
                Continuer
                </button>
            </div>
        </div>

        <!-- ======= ÉTAPE 3 : Formulaire de modification ======= -->
        <div v-if="currentStep === 2">
            <h5 class="modal-title-step">Objet de la demande</h5>
            <p>{{ objetDem }}</p>

        <h5 class="modal-title-step">Modifier l'article</h5><br>

        <div class="row g-3">

            <!-- Qté -->
            <div class="col-md-6">
            <label class="form-label">Quantité</label>
            <input v-model.number="form.qte" type="number" class="form-control" min="0" :disabled="!userStore.achat" @input="computeTotal" />
            </div>

            <!-- Fournisseur réel -->
            <div class="col-md-6">
            <label class="form-label">Fournisseur Réel</label>
            <select v-model="form.fournisseur2" class="form-control" :disabled="!userStore.achat">
                <option v-for="f in fournisseurs" :key="f.value" :value="f.value">{{ f.label }}</option>
            </select>
            </div>

            <!-- Prix Réel -->
            <div class="col-md-6">
            <label class="form-label">Prix Réel (Ar)</label>
            <input v-model.number="form.prixR" type="number" class="form-control" min="0" :disabled="!userStore.achat" @input="computeTotal" />
            </div>

            <!-- Total Réel (calculé) -->
            <div class="col-md-6">
            <label class="form-label">Montant Réel (Ar)</label>
            <input :value="formatNumber(form.totalR)" type="text" class="form-control" disabled />
            </div>

            <!-- N° Chèque -->
            <div class="col-md-6">
            <label class="form-label">N° Chèque</label>
            <input v-model="form.num_cheque" type="text" class="form-control" placeholder="Ex: CHQ-00123" :disabled="!userStore.cheque"/>
            </div>

            <!-- Date d'émission -->
            <div class="col-md-6">
            <label class="form-label">Date d'émission</label>
            <input v-model="form.date_emission_cheque" type="date" class="form-control" :disabled="!userStore.cheque"/>
            </div>

            <!-- Motif (obligatoire) -->
            <div class="col-12">
            <label class="form-label">
                Motif de rectification
                <span class="text-danger">*</span>
            </label>
            <textarea
                v-model="form.motif_rectif"
                rows="3"
                class="form-control"
                placeholder="Expliquez la raison de cette rectification..."
                :class="{ 'is-invalid': submitAttempted && !form.motif_rectif }"
            ></textarea>
            <div v-if="submitAttempted && !form.motif_rectif" class="invalid-feedback">
                Le motif de rectification est obligatoire.
            </div>
            </div>

        </div>

        <div v-if="saveError" class="alert alert-danger mt-3">{{ saveError }}</div>

        <div class="d-flex justify-content-between gap-2 mt-4">
            <button class="btn btn-outline-secondary" @click="currentStep = articlesFound.length > 1 ? 1 : 0">Retour</button>
            <button class="btn btn-success" :disabled="loadingSave" @click="saveRectification">
            <span v-if="loadingSave">Enregistrement...</span>
            <span v-else>Enregistrer la rectification</span>
            </button>
        </div>
        </div>

    </div>
    </div>
    <!-- ===================== FIN MODAL ===================== -->

    <!-- Alert succès -->
    <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title" />

</div>
</template>

<script setup>
import { niveau } from '~/assets/js/CommonVariable.js';
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// ===================== TABLE PRINCIPALE =====================
const loadingTable = ref(true)
const rectifications = ref([])

const columnsRectif = [
{ key: 'created_at_fmt', label: 'Date' },
{ key: 'obj_id', label: 'N° Objet' },
{ key: 'num_item', label: 'N° Article' },
{ key: 'qte', label: 'Ancienne Qté' },
{ key: 'fournisseur2_nom', label: 'Ancien Fournisseur' },
{ key: 'prixR_fmt', label: 'Ancien Prix Réel' },
{ key: 'totalR_fmt', label: 'Ancien Montant Réel' },
{ key: 'num_cheque', label: 'Ancien N° Chèque' },
{ key: 'date_emission_cheque', label: 'Ancienne Date Émission' },
{ key: 'motif_rectif', label: 'Motif', style: { minWidth: '250px' } },
{ key: 'user', label: 'Modifié par' },
]

const save_liste = ref([]); // Liste originale
const filtered_liste = ref([]); // Liste filtrée pour l'affichage recherche
const search_term = ref('');
const loadRectifications = async () => {
    loadingTable.value = true
    try {
        const { data, error } = await supabase
        .from('ses_rectification')
        .select('*, fournisseur2(nom), users(full_name)')
        .order('created_at', { ascending: false })
        if (error) throw error

        rectifications.value = data.map(r => ({
        ...r,
        created_at_fmt: formatDate(r.created_at),
        fournisseur2_nom: r.fournisseur2?.nom || '-',
        prixR_fmt: r.prixR ? formatNumber(r.prixR) + ' Ar' : '-',
        totalR_fmt: r.totalR ? formatNumber(r.totalR) + ' Ar' : '-',
        date_emission_cheque: r.date_emission_cheque || '-',
        num_cheque: r.num_cheque || '-',
        user: r.users?.full_name || '-',
        }))

        save_liste.value = rectifications.value; // Sauvegarde de la liste originale
        filtered_liste.value = rectifications.value;

    } catch (e) {
        console.error(e)
    } finally {
        loadingTable.value = false
    }
}

// ===================== MODAL =====================
const showModal = ref(false)
const currentStep = ref(0)
const steps = ['Recherche', 'Sélection', 'Modification']

const searchObjId = ref('')
const searchError = ref('')
const loadingSearch = ref(false)
const articlesFound = ref([])
const selectedArticle = ref(null)
const objetDem = ref(null)
const choix_filtre = ref('num');
const date_debut = ref('');
const date_fin = ref('');

const userStore = useUserStore()

//DATA FOR FILE
const file = ref(null) // Save the doc 
const fileInput = ref(null) //référence à l’élément HTML <input>
const fileName = ref('') // référence au fichier sélectionné
const uploading = ref(false)
const fileUrl = ref(null)
const doc_achat = ref([]) // contient les documents reliers a une article de l'achat

// Fournisseurs pour le select
const fournisseurs = ref([])
const fournisseursAllData = ref([])
const listFournisseurs = async() => {
        try {
            const { data, error } = await supabase
                    .from('ses_fournisseurs')
                    .select('*')
                    .eq('etat_del', false)
                    .neq('id', 5000)
                    .order('nom', { ascending: true }); 

            if (error) throw error
            fournisseursAllData.value = data
            fournisseurs.value = data.map(fournisseur => ({
                label: fournisseur.nom,
                value: fournisseur.id
            }));
            
            
        } catch (error) { 
            console.error('Erreur lors du chargement des fournisseurs:', error);
            return [];
        }
};
// Formulaire
const form = ref({
qte: null,
fournisseur2: null,
prixR: null,
totalR: null,
num_cheque: '',
date_emission_cheque: '',
motif_rectif: '',
})

const submitAttempted = ref(false)
const loadingSave = ref(false)
const saveError = ref('')

const alert = ref({ show: false, message: '', title: '', type: '' })

const openModal = () => {
resetModal()
showModal.value = true
listFournisseurs()
}

const closeModal = () => {
showModal.value = false
resetModal()
}

const resetModal = () => {
    currentStep.value = 0
    searchObjId.value = ''
    searchError.value = ''
    articlesFound.value = []
    selectedArticle.value = null
    submitAttempted.value = false
    saveError.value = ''
    form.value = {
        qte: null,
        fournisseur2: null,
        prixR: null,
        totalR: null,
        num_cheque: '',
        date_emission_cheque: '',
        motif_rectif: '',
    }
}

// Étape 1 : Recherche
const searchDemande = async () => {
    searchError.value = ''
    if (!searchObjId.value) return
    loadingSearch.value = true
    try {
        const { data, error } = await supabase
            .from('ses_demItems')
            .select('*, id_obj(nom)')
            .eq('id_obj', searchObjId.value)
            .gte('niv_val', niveau.cheque)
            .neq('niv_val', niveau.refuse)
            .order('num', { ascending: true })

            if (error) throw error

        if (!data || data.length === 0) {
        searchError.value = 'Aucun article trouvé pour ce numéro d\'objet.\n(La demande doit être au moins au niveau "d\'émission de chèque" pour être rectifiable)'
        return
        }
        articlesFound.value = data
        objetDem.value = data[0]?.id_obj?.nom || '-'
        /*if (data.length === 1) {
        // Un seul article, on saute l'étape 2
        selectArticle(data[0])
        goToEditStep()
        } else {*/
        currentStep.value = 1
        doc_recovery(searchObjId.value) // Récupération des documents liés à la demande
        //}
    } catch (e) {
        searchError.value = 'Erreur lors de la recherche. Vérifiez le numéro saisi.'
        console.error(e)
    } finally {
        loadingSearch.value = false
    }
}

// Étape 2 : Sélection article
const selectArticle = (article) => {
selectedArticle.value = article
}

const goToEditStep = () => {
if (!selectedArticle.value) return
const a = selectedArticle.value
form.value = {
    qte: a.qte ?? null,
    fournisseur2: a.fournisseur2?.id ?? a.fournisseur2 ?? null,
    prixR: a.prixR ?? null,
    totalR: a.totalR ?? null,
    num_cheque: a.num_cheque ?? '',
    date_emission_cheque: a.date_emission_cheque ?? '',
    motif_rectif: '',
}
currentStep.value = 2
}


// Calcul automatique du total
const computeTotal = () => {
const q = parseFloat(form.value.qte) || 0
const p = parseFloat(form.value.prixR) || 0
form.value.totalR = q * p
}

// Étape 3 : Enregistrement
const saveRectification = async () => {
submitAttempted.value = true
if (!form.value.motif_rectif) return

loadingSave.value = true
saveError.value = ''

const a = selectedArticle.value

try {
    // 1. INSERT dans ses_rectification (anciennes valeurs)
    const { error: insertError } = await supabase
    .from('ses_rectification')
    .insert({
        obj_id: parseInt(searchObjId.value),
        item_id: a.id,
        num_item: a.num,
        qte: a.qte,
        fournisseur2: a.fournisseur2?.id ?? a.fournisseur2 ?? null,
        prixR: a.prixR,
        totalR: a.totalR,
        num_cheque: a.num_cheque,
        date_emission_cheque: a.date_emission_cheque,
        motif_rectif: form.value.motif_rectif,
        user: user.value?.id,
    })
    if (insertError) throw insertError

    // 2. UPDATE ses_demItems (nouvelles valeurs)
    const { error: updateError } = await supabase
    .from('ses_demItems')
    .update({
        qte: form.value.qte,
        fournisseur2: form.value.fournisseur2,
        prixR: form.value.prixR,
        totalR: form.value.totalR,
        num_cheque: form.value.num_cheque,
        date_emission_cheque: form.value.date_emission_cheque,
    })
    .eq('id', a.id)
    if (updateError) throw updateError

    showAlert('Rectification enregistrée avec succès.', 'Succès', 'success')
    closeModal()
    loadRectifications()

} catch (e) {
    saveError.value = 'Une erreur est survenue lors de l\'enregistrement.'
    console.error(e)
} finally {
    loadingSave.value = false
}
}

// ===================== UTILS =====================
const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    const formattedDate = `${day}/${month}/${year}`;
    
    
    return formattedDate;
};

const formatNumber = (n) => {
if (n === null || n === undefined) return '-'
return Number(n).toLocaleString('fr-FR')
}

const showAlert = (message, title, type) => {
alert.value = { show: true, message, title, type }
setTimeout(() => { alert.value.show = false }, 5000)
}


// Fonction de filtrage des données
const filterData = () => {
    if (!search_term.value.trim()) {
        filtered_liste.value = [...save_liste.value];
        return;
    }
    loadingTable.value = true;
    const term = search_term.value.toLowerCase().trim();
    
    if (choix_filtre.value === 'num') {
        filtered_liste.value = save_liste.value.filter(item => {
            return item.obj_id.toString().includes(term);
        });
    }
    loadingTable.value = false;
}
const filterByDate = () => {
    if (!date_debut.value && !date_fin.value) {
        filtered_liste.value = [...save_liste.value];
        return;
    }
    
    filtered_liste.value = save_liste.value.filter(item => {
        const itemDate = new Date(item.created_at);
        const debut = date_debut.value ? new Date(date_debut.value) : null;
        const fin = date_fin.value ? new Date(date_fin.value) : null;

        if (fin) fin.setHours(23, 59, 59, 999);

        if (debut && fin) {
            return itemDate >= debut && itemDate <= fin;
        } else if (debut) {
            return itemDate >= debut;
        } else if (fin) {
            return itemDate <= fin;
        }
        return true;
    });
}
const resetinputs = () => {
    search_term.value = '';
    date_debut.value = '';
    date_fin.value = '';
    filterData();
}
// ===================== GESTION DOCUMENTS =====================
const doc_recovery = async (item) =>{
    fileInput.value = null // le premier value retourne le html 
    fileName.value = ''
    file.value = null // vider le fichier selectionne
    //Recuperation des documents
    try{
        const { data, error } = await supabase
        .from('ses_doc_achat')
        .select('*')
        .eq('id_obj', item)

        if (error) throw error

        doc_achat.value = data
        
        
    }catch(error){
        console.log('Erreur lors de la recuperation de la liste des documents', error)
    }
    
}
const downloadFile = async (name_doc,nameStorage) => {
    const path = `achats/${nameStorage}`
    try {
        const encoding = encodeURI(path)
        // Générer une URL signée pour le téléchargement
        const { data, error } = await supabase
        .storage
        .from('sesame_doc')
        .createSignedUrl(encoding, 60); // URL valide 60 secondes

        if (error) throw error;
        
        // Lancer le téléchargement
        const a = document.createElement('a');
        a.href = data.signedUrl;
        a.download = name_doc;
        document.body.appendChild(a);
        a.click();
        a.remove();
        if (error) throw error;
        
        showAlert('Fichier télecharger avec succès du stockage', 'Succès', 'success')

    } catch (error) {
        console.error('Erreur lors du télechargement du fichier :', error.message)
        showAlert('Erreur lors du télechargement du fichier', 'Oups!', 'danger')
    }
}
const deleteFile = async (id_item,id_doc, nameStorage) => {
    const path = `achats/${nameStorage}`
    try {
        // Supprimer le fichier du bucket
        const { error } = await supabase.storage
        .from('sesame_doc')
        .remove([path])

        if (error) throw error

        // Supprimer l’enregistrement de la table
        const { error: errorDeleteInfo } = await supabase
        .from('ses_doc_achat')
        .delete()
        .eq('id', id_doc)

        if (errorDeleteInfo) throw errorDeleteInfo

        showAlert('Fichier supprimé avec succès du stockage', 'Succès', 'success')
        doc_recovery(id_item) // Rafraîchir la liste des documents après suppression
    } catch (error) {
        console.error('Erreur lors de la suppression du fichier :', error.message)
        showAlert('Erreur lors de la suppression du fichier', 'Oups!', 'danger')
    }
}
const fonctionFiles = (event) => {
    file.value = event.target.files[0] // récupère le premier fichier sélectionné
    if (file) {
        uploading.value = false
        fileName.value = file.value.name // récupère le nom du fichier
        console.log('Nom du fichier :', file.value)
    } else {
        uploading.value= true
        fileName.value = ''
    }
}
const upload_file = async (id_item) => {
    

    if(!file.value) return showAlert("Veuillez sélectionner un fichier", 'Oups!', 'danger')

    uploading.value= true
        try {
        // Crée un chemin unique pour le fichier
        const filesNameStorage = Date.now()+'_'+file.value.name
        const filePath = `achats/${filesNameStorage}`

        //Upload dans le bucket "uploads"
        const { data, error } = await supabase.storage
        .from('sesame_doc')
        .upload(filePath, file.value, {
            upsert: false, // Pour ne pas écraser un fichier existant du même nom
        })

        if (error) throw error

        //Récupère l’URL publique du fichier
        const { data: publicUrlData } = supabase.storage
        .from('sesame_doc')
        .getPublicUrl(filePath)

        fileUrl.value = publicUrlData.publicUrl

        //Enregistrement les info du doc dans table 
        const {error:errorInsertInfo} = await supabase
        .from('ses_doc_achat')
        .insert([
            {
                id_user: userStore.id,
                name_doc: fileName.value,
                url_doc: fileUrl.value,
                nameStorage: filesNameStorage,
                id_obj: id_item
            }
        ])

        if (errorInsertInfo) throw errorInsertInfo
        
        showAlert('Fichier enregistré avec succès', 'Succès', 'success')
        doc_recovery(id_item) // Rafraîchir la liste des documents après ajout
    } catch (error) {
        console.error('Erreur upload :', error.message)
        showAlert("Erreur lors de l’upload", 'Oups!', 'danger')
    } finally {
        uploading.value = false
    }


}
// ===================== LIFECYCLE =====================
onMounted(() => {
    loadRectifications();
    
})
</script>

<style scoped>
.rectification_page {
padding: 24px;
}

/* ===== MODAL OVERLAY ===== */
.modal-overlay {
position: fixed;
inset: 0;
background: rgba(0, 0, 0, 0.5);
z-index: 1050;
display: flex;
align-items: center;
justify-content: center;
padding: 16px;
}

.modal-custom {
background: #fff;
border-radius: 12px;
padding: 32px;
width: 100%;
max-width: 620px;
max-height: 90vh;
overflow-y: auto;
position: relative;
box-shadow: 0 8px 40px rgba(0,0,0,0.18);
}

.modal-close {
position: absolute;
top: 16px;
right: 20px;
background: none;
border: none;
font-size: 24px;
cursor: pointer;
color: #666;
line-height: 1;
}
.modal-close:hover { color: #333; }

.modal-title-step {
font-size: 1.1rem;
font-weight: 700;
margin-bottom: 4px;
}
.modal-subtitle {
font-size: 0.88rem;
color: #666;
margin-bottom: 20px;
}

/* ===== STEPPER ===== */
.stepper {
display: flex;
align-items: center;
justify-content: center;
gap: 0;
position: relative;
margin-bottom: 28px;
}

.step {
display: flex;
flex-direction: column;
align-items: center;
gap: 4px;
position: relative;
z-index: 1;
flex: 1;
}

.step-circle {
width: 32px;
height: 32px;
border-radius: 50%;
background: #e0e0e0;
color: #999;
font-weight: 700;
font-size: 14px;
display: flex;
align-items: center;
justify-content: center;
transition: all 0.3s;
}

.step.active .step-circle {
background: #0d6efd;
color: #fff;
}

.step.done .step-circle {
background: #198754;
color: #fff;
}

.step-label {
font-size: 11px;
color: #999;
white-space: nowrap;
}

.step.active .step-label { color: #0d6efd; font-weight: 600; }
.step.done .step-label { color: #198754; }

.step-line {
position: absolute;
top: 16px;
left: 16.5%;
right: 16.5%;
height: 2px;
background: #e0e0e0;
z-index: 0;
}

/* ===== LISTE ARTICLES ===== */
.articles-list {
display: flex;
flex-direction: column;
gap: 10px;
max-height: 320px;
overflow-y: auto;
}

.article-card {
display: flex;
align-items: center;
gap: 14px;
padding: 12px 16px;
border: 2px solid #e0e0e0;
border-radius: 8px;
cursor: pointer;
transition: border-color 0.2s, background 0.2s;
}

.article-card:hover {
border-color: #0d6efd;
background: #f0f5ff;
}

.article-card.selected {
border-color: #0d6efd;
background: #e8f0fe;
}

.article-num {
font-weight: 700;
font-size: 1.1rem;
color: #0d6efd;
min-width: 36px;
}

.article-info {
flex: 1;
display: flex;
flex-direction: column;
gap: 2px;
}

.article-label {
font-weight: 600;
font-size: 0.9rem;
}

.article-meta {
font-size: 0.8rem;
color: #666;
}

.article-check {
color: #0d6efd;
font-size: 1.2rem;
font-weight: 700;
}
</style>