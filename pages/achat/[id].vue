<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE</h1>
            <button class="btn btn-outline-success" @click="exportToExcel">Exporter vers Excel</button>
            <client-only>
                <button class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#modDoc" @click="doc_recovery({id:route.params.id})">Ajouter document

                </button> 
            </client-only>
            <div class="link_demande">
            </div>
        </div>
        
        <!-- Informations générales de la demande -->
        <div>
            <h6>N° d'enregistrement: <span>{{ route.params.id }}</span></h6>
            <h6>Date: <span>{{ dataObj.date }}</span></h6>
            <div class="d-flex align-items-center gap-3">
                <h6>Objet: <span>{{ dataObj.nom }}</span></h6>
            </div>
        </div>
        
        <!-- Tableau des détails -->
        <div class="table_block_list">
            <Table
                ref="tableRef"
                :columns="columns"
                :rows="demande_details"
                :type_but_modal="true"
                :but_Validation="true"
                :actions="[
                    { label: 'Valider', color: 'success' },
                    { label: 'Rejeter', color: 'danger' },
                ]"
                title_modal_neutre="Ajouter un document"
                @validation_action="handleValidationAction"
                @editable_field_change="handleEditableFieldChange"
                @function_but_neutre = "doc_recovery"

            >
                <template #modal4="{ item }">
                    <p>Séléctionner un fichier (pdf,png,jpeg,jpg):</p>
                    <input class="form-control" ref="fileInput" type="file" @change="fonctionFiles"></input>
                    <p v-if="uploading">Enregistrement du fichier en cours ...</p>
                    <button class="btn btn-outline-success" @click="upload_file(item.id)" :disabled="uploading">Enregistrer ce fichier</button>
                    <hr>
                    <h5 style="font-weight: bold;">Liste des documents associés</h5>
                    <p v-for="doc in doc_achat" :key="doc.id" style="font-weight: bold;">
                        {{ doc.name_doc }}
                        <button class="btn btn-outline-secondary" @click="downloadFile(doc.name_doc, doc.nameStorage)"><img src="/public/icon/download.png" style="width: 20px; height: 20px;"></button>
                        <button class="btn btn-outline-light" @click="deleteFile(item.id,doc.id, doc.nameStorage)"><img src="/public/icon/delete.png" style="width: 20px; height: 20px;"></button>
                        
                    </p>
                </template>
            </Table>
        </div>
        <!-- Alert pour les notifications -->
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>

        <!-- Modal neutre type 4 -->
        <Modal id="modDoc" title="Ajouter un document">
            
                <div class="text-center">
                <p>Séléctionner un fichier (pdf,png,jpeg,jpg):</p>
                    
                    <input class="form-control" ref="fileInput" type="file" @change="fonctionFiles"></input>
                    
                    <p v-if="uploading">Enregistrement du fichier en cours ...</p>
                    
                    <button class="btn btn-outline-success" @click="upload_file(route.params.id)" :disabled="uploading">Enregistrer ce fichier</button>
                    <hr>
                    
                    <h5 style="font-weight: bold;">Liste des documents associés</h5>
                    
                    <p v-for="doc in doc_achat" :key="doc.id" style="font-weight: bold;">
                        {{ doc.name_doc }}
                        <button class="btn btn-outline-secondary" @click="downloadFile(doc.name_doc, doc.nameStorage)"><img src="/public/icon/download.png" style="width: 20px; height: 20px;"></button>
                        <button class="btn btn-outline-light" @click="deleteFile(route.params.id,doc.id, doc.nameStorage)"><img src="/public/icon/delete.png" style="width: 20px; height: 20px;"></button>
                    </p>
                </div>
            
        </Modal>
    </div>
    
</template>

<script setup>
import { tableTete } from '~/assets/js/CommonVariable.js';
import {exportExcel} from '~/assets/js/export.js';
// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
const route = useRoute();

// Référence vers le composant Table
const tableRef = ref(null);

// Définition des colonnes du tableau
const columns = computed(() => [
    { key: 'num', label: 'N°'},
    ...tableTete.filter(col => col.key !== 'id'), // Exclure la colonne 'id'
    { key: 'imputation', label: 'Imputation analytique'},
    { 
        key: "fournisseur2", 
        label: "Fournisseur Réel",
        type: 'select',
        options: fournisseurs.value,
        editable: true,
    },
    { key: 'prixR', label: 'Prix Réel', editable: true, min: 1, type: 'number' },
    { key: 'totalR', label: 'Montant Réel', editable: true, min: 1, type: 'number',disabled: true },
])

// DATA
const dataObj = ref([]);
const demande_details = ref([]);
const validationData = ref(null); // Pour stocker les données de validation pour debug
const fournisseurs = ref([])
const fournisseursAllData = ref([])
//DATA FOR FILE
const file = ref(null) // Save the doc 
const fileInput = ref(null) //référence à l’élément HTML <input>
const fileName = ref('') // référence au fichier sélectionné
const uploading = ref(false)
const fileUrl = ref(null)
const doc_achat = ref([]) // contient les documents reliers a une article de l'achat
// Alert system
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: '' // success, error, warning, info
})


// METHODES
// Afficher une alerte
const showAlert = (message, title, type) => {
    alert.value = {
        show: true,
        message,
        title,
        type
    }

    // Auto-hide après 5 secondes
    setTimeout(() => {
        alert.value.show = false
    }, 5000)
}

// Récupération des données
const getDemandeDetails = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_demItems')
            .select('*, fournisseur(nom)')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true });
        
        if (error) throw error;
        
        const allDataView = data.map(item => {
            return {
                ...item,
                fournisseur: item.fournisseur?.nom || '', // récupérer le nom du fournisseur
                etat: item.niv_val == 2 ? 0 : item.niv_val == 8 ? 2 : item.niv_val < 2 ? 4 : 1, // Adapter pour le niveau acheteur 
                delai: formatDate(item.delai), // Formatage de la date en jj/mm/aaaa
            };
        });
        demande_details.value = allDataView;
        console.log('data get',demande_details.value );
        
        // Récupération des informations de l'objet
        const { data: demandeObj, error: demandeObjError } = await supabase
            .from('ses_demandeObj')
            .select('*')
            .eq('id', route.params.id)
            .single();
        
        if (demandeObjError) throw demandeObjError;
        
        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date),
        };
        
    } catch (error) {
        console.log(error);
    }
};
//Recuperation fournisseurs
const listFournisseurs = async() => {
        try {
            const { data, error } = await supabase
                    .from('ses_fournisseurs')
                    .select('*')
                    .eq('etat_del', false)
                    .neq('id', 5000)
                    .order('id', { ascending: true });

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

// Gestionnaire principal pour les actions de validation
const handleValidationAction = async (validationPayload) => {
    const { action, item, editableData, rowIndex } = validationPayload;
    
    // Ignorer l'action "Ajouter un document" pour l'instant
    if (action === 'Ajouter un document') {
        console.log('Action "Ajouter un document" - non implémentée pour le moment');
        return;
    }
    // Stocker pour affichage (debug)
    validationData.value = {
        action: action,
        itemId: item.id,
        originalItem: { ...item },
        editableFields: editableData.fields,
        timestamp: new Date().toISOString()
    };
    console.log(editableData.fields);
    
    if (action === 'Valider') {
        if(editableData.fields.fournisseur2 === null){
            showAlert("Veuillez choisir un fournisseur", "Oups!", "danger")
            return
        }
        if(editableData.fields.prixR === null){
            showAlert("Veuillez saisir un prix réel", "Oups!", "danger")
            return
        }

        await handleValidation(item, editableData);
        // Recuperation des infos fournisseur
        //const fournisseurSelectionneData = fournisseursAllData.value.find(f => f.id === editableData.fields.fournisseur2);
        
        // Verifier si le fournisseur a un contrat et activation des condition de validation 
        //condition individuelle selon le montant et le nbr de doc 
        /*
        if (fournisseurSelectionneData) {
            let nbrDoc = 0
            if (fournisseurSelectionneData.contrat === 'Oui') {
                await handleValidation(item, editableData);
            }
            else {
                    try{
                        const { count, error: nbrDocError} = await supabase 
                        .from('ses_doc_achat')
                        .select('*', { count: 'exact', head: true})
                        .eq('id_item', item.id)

                        if (nbrDocError) throw nbrDocError

                        nbrDoc = count || 0
                    }catch(error){
                        showAlert("Erreur lors de la recherche du nombre de document", "Oups!", "danger")
                        console.error('Erreur lors de la recherche du nombre de document:', error.message);
                    }

                    if(editableData.fields.totalR < 1000000 && nbrDoc < 1){
                        showAlert("Veuillez ajouter au moins un proforma", "Oups!", "danger")
                        return
                    }
                    if(editableData.fields.totalR >= 1000000 && editableData.fields.totalR < 5000000 && nbrDoc < 4){
                        showAlert("Veuillez ajouter au moins 3 proforma et un tableau comparatif ou une lettre de dérogation", "Oups!", "danger")
                        return
                    }

                    if(editableData.fields.totalR >= 5000000 && editableData.fields.totalR < 16000000 && nbrDoc < 5){
                        showAlert("Veuillez ajouter au moins 4 proforma et un tableau comparatif ou une lettre de dérogation", "Oups!", "danger")
                        return
                    }

                    if(editableData.fields.totalR >= 16000000 && nbrDoc < 6){
                        showAlert("Veuillez ajouter au moins un document d'appel d'offre !", "Oups!", "danger")
                        return
                    }

                    await handleValidation(item, editableData);
                }                
        }*/
        
    } else if (action === 'Rejeter') {
        await handleRejection(item, editableData);
    }
};

// Gestion de la validation
const handleValidation = async (item, editableData) => {
    try {
        console.log('Validation de l\'item:', item.id);
        console.log('Avec les données éditables:', editableData.fields);
        console.log('je valide maintenant');
        

        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: 3, // Passer au niveau suivant de validation (responsable financier)
            ...editableData.fields // Inclure toutes les données éditables modifiées
        };
        
        // Mettre à jour dans la base de données
        const { error } = await supabase
            .from('ses_demItems')
            .update(updateData)
            .eq('id', item.id);
        
        if (error) throw error;
        
        // Actualiser les données
        await getDemandeDetails();

        // Enregistrement dans historique

        const { error: insertHistError } = await supabase
            .from('ses_histo')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                id_item: item.id,
                action: 'Validation de l\'article '+ item.num + ' dans la demande d\'achat numero ' + route.params.id,
                niv_val:3
            });

        if (insertHistError) throw insertHistError;
        
        showAlert("Item validé avec succès !", "Succès!", "success")
        
    } catch (error) {
        console.error('Erreur lors de la validation:', error);
        showAlert("Erreur lors de la validation !", "Oups!", "danger")
    }
};

// Gestion du rejet 
const handleRejection = async (item, editableData) => {
    try {
        console.log('Rejet de l\'item:', item.id);
        console.log('Avec les données éditables:', editableData.fields);
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: 8, // Statut rejeté par l'acheteur
            ...editableData.fields // Inclure les données éditables (commentaires par exemple)
        };
        
        // Mettre à jour dans la base de données
        const { error } = await supabase
            .from('ses_demItems')
            .update(updateData)
            .eq('id', item.id);
        
        if (error) throw error;
        
        // Actualiser les données
        await getDemandeDetails();
        
        // Enregistrement dans historique

        const { error: insertHistError } = await supabase
            .from('ses_histo')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                id_item: item.id,
                action: 'Rejet de l\'article '+ item.num + ' dans la demande d\'achat numero ' + route.params.id,
                type: 'rejeter',
                niv_val:8
            });

        if (insertHistError) throw insertHistError;
        
        console.log('Rejet réussi pour l\'item:', item.id);
        alert('Item rejeté !');
        
    } catch (error) {
        console.error('Erreur lors du rejet:', error);
        alert('Erreur lors du rejet !');
    }
};

// Gestionnaire pour les changements de champs éditables (optionnel)
const handleEditableFieldChange = (changeData) => {
    console.log('Changement détecté:', changeData);
    // Vous pouvez faire quelque chose ici si nécessaire (auto-save, validation, etc.)
};

// Méthode pour récupérer toutes les données éditables modifiées (utile pour validation en lot)
const getAllEditableChanges = () => {
    if (tableRef.value) {
        return tableRef.value.getAllEditableData();
    }
    return {};
};

// Méthode pour utilisation dans les methods
const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // les mois commencent à 0
    const year = d.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
};
// UPLOAD FILES
// Réinitialiser l'input
const doc_recovery = async (item) =>{
    fileInput.value.value = null // le premier value retourne le html 
    fileName.value = ''
    file.value = null // vider le fichier selectionne
    //Recuperation des documents
    try{
        const { data, error } = await supabase
        .from('ses_doc_achat')
        .select('*')
        .eq('id_obj', item.id)

        if (error) throw error

        doc_achat.value = data
    }catch(error){
        console.log('Erreur lors de la recuperation de la liste des documents', error)
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
    console.log(file.value);

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
        doc_recovery({id:id_item})
    } catch (error) {
        console.error('Erreur upload :', error.message)
        showAlert("Erreur lors de l’upload", 'Oups!', 'danger')
    } finally {
        uploading.value = false
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
        doc_recovery({id:id_item})
    } catch (error) {
        console.error('Erreur lors de la suppression du fichier :', error.message)
        showAlert('Erreur lors de la suppression du fichier', 'Oups!', 'danger')
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
const exportToExcel = async () => {
    try {
        const data = demande_details.value
        console.log(data)
        // Préparer les données pour l'exportation
        const exportData = data.map(item => ({
            'Num': item.num,
            'Désignation': item.designation,
            'Spécificités techniques': item.spec,
            'Quantité': item.qte,
            'Prix Unitaire': item.prix,
            'Fournisseur': item.fournisseur|| '',
            'Délai': item.delai,
            'Imputation Analytique': item.imputation || '',
            'Fournisseur Réel': fournisseursAllData.value.find(f => f.id === item.fournisseur2)?.nom || '' ,
            'Prix Réel': item.prixR || '',
            'Montant Réel': item.totalR || ''
        }));

        const nameExcel = `Details_de_la_Demande_Num_${route.params.id}`

        await exportExcel(exportData, nameExcel);
        
    } catch (error) {
        console.error('Erreur lors de l\'exportation vers Excel:', error);
        showAlert('Erreur lors de l\'exportation vers Excel.', 'Oops', 'danger');
    }
};

// LIFECYCLE HOOKS
onMounted(() => {
    getDemandeDetails();
    listFournisseurs()
    
});
</script>