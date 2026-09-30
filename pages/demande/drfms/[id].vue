<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DRFMS</h1>
            <client-only>
                <button class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#modDoc" @click="doc_recovery">
                    Ajouter document
                </button>
            </client-only>
            <div class="link_demande">
                <NuxtLink to="/demande/drfms" class="btn btn-outline-secondary">Retour à la liste</NuxtLink>
            </div>
        </div>

        <!-- Informations générales de la demande -->
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h6>N° d'enregistrement: <span>{{ route.params.id }}</span></h6>
                <h6>Date: {{ dataObj.date }}</h6>
                <div class="d-flex align-items-center gap-3">
                    <h6>Nom et prénoms de la personne soignée : {{ dataObj.pers_soin }}</h6>
                    <h6>Personne soignée : {{ dataObj.cat_pers }}</h6>
                </div>
                <h6>Statut: <strong>{{ statutLabel }}</strong></h6>
            </div>

            <!-- Bouton d'envoi, visible seulement si la DRFMS est encore au niveau 0 (non envoyée) -->
            <div v-if="dataObj.niv_val === niveauDRFMS.erg">
                <button
                    class="btn btn-outline-success"
                    :disabled="doc_drfms.length === 0"
                    @click="envoyerDRFMS"
                >
                    Soumettre la DRFMS
                </button>
                <p v-if="doc_drfms.length === 0" style="font-size: 12px; color: gray;">
                    Veuillez d'abord ajouter un document avant l'envoi.
                </p>
            </div>
        </div>

        <!-- Tableau des détails -->
        <div class="table_block_list mt-4">
            <Table :columns="columns" :rows="demande_details" :showActions="false" :loading="loading"/>
        </div>

        <!-- Alert pour les notifications -->
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>

        <!-- Modal document -->
        <Modal id="modDoc" title="Ajouter un document">
            <div class="text-center">
                <p>Séléctionner un fichier (pdf,png,jpeg,jpg):</p>

                <input class="form-control" ref="fileInput" type="file" @change="fonctionFiles"></input>

                <p v-if="uploading">Enregistrement du fichier en cours ...</p>

                <button class="btn btn-outline-success" @click="upload_file" :disabled="uploading">Enregistrer ce fichier</button>
                <hr>

                <h5 style="font-weight: bold;">Liste des documents associés</h5>

                <p v-for="doc in doc_drfms" :key="doc.id" style="font-weight: bold;">
                    {{ doc.name_doc }}
                    <button class="btn btn-outline-secondary" @click="downloadFile(doc.name_doc, doc.nameStorage)"><img src="/public/icon/download.png" style="width: 20px; height: 20px;"></button>
                    <button class="btn btn-outline-light" @click="deleteFile(doc.id, doc.nameStorage)"><img src="/public/icon/delete.png" style="width: 20px; height: 20px;"></button>
                </p>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { TeteDRFMS, niveauDRFMS } from '~/assets/js/CommonVariable.js';

// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
// Route
const route = useRoute();
// loading
const loading = ref(true);

// Colonnes : l'en-tête vient maintenant de CommonVariable.js
const columns = TeteDRFMS;

// DATA //
const demande_details = ref([]);
const dataObj = ref([]);

// DATA FOR FILE //
const file = ref(null)
const fileInput = ref(null)
const fileName = ref('')
const uploading = ref(false)
const fileUrl = ref(null)
const doc_drfms = ref([]) // documents rattachés à la DRFMS (id_obj = demande entière)

// Alert system
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

// Libellé du statut affiché au-dessus du tableau
const statutLabel = computed(() => {
    switch (dataObj.value.niv_val) {
        case niveauDRFMS.erg: return 'En attente d\'envoi (document requis)';
        case niveauDRFMS.dpr: return 'En attente de validation du DPR';
        case niveauDRFMS.rh: return 'En attente de validation RH';
        case niveauDRFMS.finance: return 'En attente de validation chez le responsable financier';
        case niveauDRFMS.cg: return 'En attente de validation chez le controlleur de gestion';
        case niveauDRFMS.cheque: return 'En attente d\'émission de chèque';
        case niveauDRFMS.valide: return 'Validée';
        case niveauDRFMS.refuse: return 'Votre demande a été refusée';
        default: return 'Statut inconnu';
    }
});

// METHODES
const getDemandeDetails = async () => {
    loading.value = true;
    try {
        const { data: demandeObj, error: demandeObjError } = await supabase
            .from('ses_obj')
            .select('*')
            .eq('id', route.params.id)
            .single();
        if (demandeObjError) throw demandeObjError;

        if (demandeObj.id_user !== userStore.id) {
            loading.value = false;
            setTimeout(() => {
                navigateTo('/demande/drfms');
            }, 500);
            return;
        }

        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date),
        };

        const { data, error } = await supabase
            .from('ses_items_drfms')
            .select('*, type_soins:type(nom, taux_normal, taux_accident, pourcentage_normal, pourcentage_accident)')
            .eq('id_obj', route.params.id)
            .order('id', { ascending: true });
        if (error) throw error;

        const allDataView = data.map(item => {
            const infoType = item.type_soins || {};
            const estAccident = item.taux === 'accident';

            return {
                ...item,
                date: formatDate(item.date),
                type_nom: infoType.nom || '',
                taux_label: estAccident ? infoType.taux_accident : infoType.taux_normal,
                pourcentage: estAccident
                    ? `${infoType.pourcentage_accident ?? ''}%`
                    : `${infoType.pourcentage_normal ?? ''}%`,
            };
        });

        demande_details.value = allDataView;
        loading.value = false;

    } catch (error) {
        console.log(error);
        loading.value = false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

// GESTION DES DOCUMENTS //

// Récupération de la liste des documents rattachés à cette DRFMS
const doc_recovery = async () => {
    fileInput.value.value = null
    fileName.value = ''
    file.value = null

    try {
        const { data, error } = await supabase
            .from('ses_doc')
            .select('*')
            .eq('id_obj', route.params.id)
            .eq('cat_proc', 'drfms')

        if (error) throw error
        doc_drfms.value = data
    } catch (error) {
        console.log('Erreur lors de la récupération de la liste des documents', error)
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
    if (!file.value) return showAlert("Veuillez sélectionner un fichier", 'Oups!', 'danger')

    uploading.value = true
    try {
        const filesNameStorage = Date.now() + '_' + file.value.name
        const filePath = `drfms/${filesNameStorage}`

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
            .insert([
                {
                    id_user: userStore.id,
                    name_doc: fileName.value,
                    url_doc: fileUrl.value,
                    nameStorage: filesNameStorage,
                    id_obj: route.params.id,
                    cat_proc: 'drfms',
                }
            ])

        if (errorInsertInfo) throw errorInsertInfo

        showAlert('Fichier enregistré avec succès', 'Succès', 'success')
        doc_recovery()
    } catch (error) {
        console.error('Erreur upload :', error.message)
        showAlert("Erreur lors de l'upload", 'Oups!', 'danger')
    } finally {
        uploading.value = false
    }
}

const deleteFile = async (id_doc, nameStorage) => {
    const path = `drfms/${nameStorage}`
    try {
        const { error } = await supabase.storage
            .from('sesame_doc')
            .remove([path])

        if (error) throw error

        const { error: errorDeleteInfo } = await supabase
            .from('ses_doc')
            .delete()
            .eq('id', id_doc)

        if (errorDeleteInfo) throw errorDeleteInfo

        showAlert('Fichier supprimé avec succès du stockage', 'Succès', 'success')
        doc_recovery()
    } catch (error) {
        console.error('Erreur lors de la suppression du fichier :', error.message)
        showAlert('Erreur lors de la suppression du fichier', 'Oups!', 'danger')
    }
}

const downloadFile = async (name_doc, nameStorage) => {
    const path = `drfms/${nameStorage}`
    try {
        const encoding = encodeURI(path)
        const { data, error } = await supabase
            .storage
            .from('sesame_doc')
            .createSignedUrl(encoding, 60);

        if (error) throw error;

        const a = document.createElement('a');
        a.href = data.signedUrl;
        a.download = name_doc;
        document.body.appendChild(a);
        a.click();
        a.remove();

        showAlert('Fichier téléchargé avec succès', 'Succès', 'success')
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier :', error.message)
        showAlert('Erreur lors du téléchargement du fichier', 'Oups!', 'danger')
    }
}

// ENVOI DE LA DRFMS //
const envoyerDRFMS = async () => {
    if (doc_drfms.value.length === 0) {
        showAlert('Veuillez ajouter au moins un document avant l\'envoi.', 'Oups!', 'danger')
        return;
    }
    try {
        const { error } = await supabase
            .from('ses_obj')
            .update({ niv_val: niveauDRFMS.dpr })
            .eq('id', route.params.id);

        if (error) throw error;

        const { error: insertHistError } = await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                action: 'Envoi de la DRFMS numéro ' + route.params.id + ' au DPR',
                niv_val: niveauDRFMS.dpr,
                type:'valider',
                cat_proc: 'drfms'
            });

        if (insertHistError) throw insertHistError;

        dataObj.value.niv_val = niveauDRFMS.dpr;
        showAlert('DRFMS envoyée avec succès!', 'Succès!', 'success')
        navigateTo('/demande/drfms')
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la DRFMS:', error);
        showAlert('Erreur lors de l\'envoi de la DRFMS !', 'Oups!', 'danger')
    }
};

// LIFECYCLE HOOKS //
onMounted(() => {
    getDemandeDetails();
    doc_recovery();
});
</script>