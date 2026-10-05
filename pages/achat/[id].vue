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
            <client-only>
                <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#listeBc" @click="getListeBC()">
                    Bons de commande
                </button>
            </client-only>
            <div class="link_demande">
            </div>
        </div>
        
        <!-- Informations générales de la demande -->
        <div class ="row">
            <div class="col-4">
                <h6>N° d'enregistrement: <span>{{ route.params.id }}</span></h6>
                <h6>Date: <span>{{ dataObj.date }}</span></h6>
                <div class="d-flex align-items-center gap-3">
                    <h6>Objet: <span>{{ dataObj.nom }}</span></h6>
                </div>
            </div>
            <div class="col-4 d-flex justify-content-center align-items-center gap-3" style="min-width: 200px;">
                    <strong>Fournisseur: </strong>
                    <select class="form-control" v-model="selectedFournisseur">
                        <option value="Tous">Tous</option>
                        <option v-for="fournisseur in fournisseursUtilises" :key="fournisseur.value" :value="fournisseur.value">{{ fournisseur.label }}</option>
                    </select>
            </div>
            <div class="col-4" style="display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
                <h6>Total Budgété: <strong>{{ totalAmount }} Ar</strong></h6>
                <h6>Total Réel: <strong>{{ totalAmountR}} Ar</strong></h6>
            </div>
        </div>
        
        
        <!-- Tableau des détails -->
        <div class="table_block_list">
            <Table
                ref="tableRef"
                :columns="columns"
                :rows="filteredDemandeDetails"
                :type_but_modal="true"
                :but_Validation="true"
                :actions="[
                    { label: 'Valider', color: 'success' },
                    { label: 'Rejeter', color: 'danger' },
                    { label: 'Retour vers supérieur', color: 'outline-primary'},
                ]"
                title_modal_neutre="Ajouter un document"
                @validation_action="handleValidationAction"
                @editable_field_change="handleEditableFieldChange"
                @function_but_neutre = "doc_recovery"
                :loading="loading"

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
        <Modal id="listeBc" title="Bons de commande de la demande">
            <div class="mb-4">
                <h6 style="font-weight: bold;">Enregistrer un nouveau BC</h6>
                <div class="row g-2">
                    <div class="col-4">
                        <label>Fournisseur</label>
                        <select class="form-control" v-model="nouveauBc.fournisseur" style="min-height: 38px;">
                            <option value="" disabled>Choisir...</option>
                            <option v-for="f in fournisseursDisponiblesPourBC" :key="f.id" :value="f.id">{{ f.nom }}</option>
                        </select>
                    </div>
                    <div class="col-3">
                        <label>Mode de paiement</label>
                        <input class="form-control" v-model="nouveauBc.mode">
                    </div>
                    <div class="col-5">
                        <label>Au nom de</label>
                        <input class="form-control" v-model="nouveauBc.nom">
                    </div>
                </div>
                <div class="col-2 d-flex align-items-end">
                        <button class="btn btn-outline-success" @click="saveBC()">Enregistrer</button>
                </div>
                <p v-if="fournisseursDisponiblesPourBC.length === 0" class="text-muted mt-2">
                    Tous les fournisseurs ont déjà un BC enregistré pour cette demande.
                </p>
            </div>
            <hr>
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Référence</th>
                            <th>Fournisseur</th>
                            <th>Mode de paiement</th>
                            <th>Au nom de</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="bc in listeBcAchat" :key="bc.id">
                            <td>{{ bc.ref }}</td>
                            <td>{{ fournisseursAllData.find(f => f.id === bc.fournisseur)?.nom || '' }}</td>
                            <td><input class="form-control" v-model="bc.mode"></td>
                            <td><input class="form-control" v-model="bc.nom"></td>
                            <td>
                                <button class="btn btn-sm btn-outline-success" @click="updateBC(bc)">Enregistrer</button>
                                <button class="btn btn-sm btn-outline-danger" @click="deleteBC(bc.id)">Supprimer</button>
                            </td>
                        </tr>
                        <tr v-if="listeBcAchat.length === 0">
                            <td colspan="5" class="text-center text-muted">Aucun BC enregistré pour cette demande</td>
                        </tr>
                    </tbody>
                </table>
                <button class="btn btn-light" data-bs-dismiss="modal">Fermer</button>
                <br><br>
            </div>
        </Modal>
        <RetourAchat
            ref="retourModalRef"
            modal-id="modalRetourAchatAcheteur"
            title="Retour vers le supérieur"
            label="Motif du retour"
            confirm-label="Confirmer le retour"
            confirm-color="primary"
            :loading="loadingReturn"
            @confirm="onConfirmRetour"
        />
    </div>
    
</template>

<script setup>
import { tableTete,niveau } from '~/assets/js/CommonVariable.js';
import {exportExcel} from '~/assets/js/export.js';
// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
const route = useRoute();
//loading
const loading = ref(true);
// Référence vers le composant Table
const tableRef = ref(null);

// Définition des colonnes du tableau
const columns = computed(() => [
    { key: 'num', label: 'N°'},
    ...tableTete.filter(col => col.key !== 'id' && col.key !== 'com'&& col.key !== 'num_tiger'), // Exclure la colonne 'id' et 'com' 
    { key: 'com', label: 'Commentaire',style: {minWidth: '350px'}},
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
    { key: 'com_achat', label: 'Commentaire de l\' acheteur',editable: true, type: 'textarea' , style: {minWidth: '350px'}},
])

// DATA
const dataObj = ref([]);
const demande_details = ref([]);
const validationData = ref(null); // Pour stocker les données de validation pour debug
const fournisseurs = ref([])
const fournisseursAllData = ref([])
const retourModalRef = ref(null)
const loadingReturn = ref(false)
//DATA FOR FILE
const file = ref(null) // Save the doc 
const fileInput = ref(null) //référence à l’élément HTML <input>
const fileName = ref('') // référence au fichier sélectionné
const uploading = ref(false)
const fileUrl = ref(null)
const doc_achat = ref([]) // contient les documents reliers a une article de l'achat
const selectedFournisseur = ref('Tous');// Fournisseur sélectionné pour le filtre
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
    loading.value = true;
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
                etat: item.niv_val == niveau.achat ? 0 : item.niv_val == niveau.refuse ? 2 : item.niv_val < niveau.achat ? 4 : 1, // Adapter pour le niveau acheteur 
                delai: formatDate(item.delai), // Formatage de la date en jj/mm/aaaa
            };
        });
        demande_details.value = allDataView;
        loading.value = false;
        //console.log('data get',demande_details.value );
        
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

// prendre seulement les fournisseurs des articles de la demande
const fournisseursUtilises = computed(() => {
    const nomsUniques = [...new Set(//new Set() → enlève les doublons //[...] → reconvertit en tableau
        demande_details.value
            .map(item => item.fournisseur) //.map()→ extrait juste les noms de fournisseur
            .filter(nom => nom !== null && nom !== undefined && nom !== '')//.filter()→ enlève les vides/null
    )];

    return nomsUniques
        .sort((a, b) => a.localeCompare(b))
        .map(nom => ({ label: nom, value: nom }));
});

// Données filtrées selon le fournisseur sélectionné
const filteredDemandeDetails = computed(() => {
    if (selectedFournisseur.value === "Tous") return demande_details.value;
    return demande_details.value.filter(item => item.fournisseur === selectedFournisseur.value);
});
//Formatage des nombres avec virgule et espace
const toNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Remplace la virgule par un point, retire les espaces (séparateurs de milliers éventuels)
    return parseFloat(val.toString().replace(/\s/g, '').replace(',', '.')) || 0;
};
// Formatage du montant avec séparateur de milliers
const formatMontant = (val) => {
    const nombre = toNumber(val); 
    return new Intl.NumberFormat('fr-FR').format(nombre);
};
// Total brut
const totalAmount = computed(() => {
    return formatMontant(filteredDemandeDetails.value
            .filter(item => item.etat !== 2)
            .reduce((total, item) => {
        return total + (toNumber(item.qte) * toNumber(item.prix));
    }, 0));
});
// Total pour prixR
const totalAmountR = computed(() => {
    return formatMontant(filteredDemandeDetails.value
            .filter(item => item.etat !== 2)
            .reduce((total, item) => {
        return total + (toNumber(item.qte) * toNumber(item.prixR));
    }, 0));
});
//Recuperation fournisseurs
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

// Gestionnaire principal pour les actions de validation
const handleValidationAction = async (validationPayload) => {
    const { action, item, editableData, rowIndex } = validationPayload;
    
    // Ignorer l'action "Ajouter un document" pour l'instant
    if (action === 'Ajouter un document') {
        //console.log('Action "Ajouter un document" - non implémentée pour le moment');
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
    //console.log(editableData.fields);
    
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
    } else if (action === 'Rejeter') {
        if(editableData.fields.motif === undefined || editableData.fields.motif === null || editableData.fields.motif === ''){
            showAlert('Veuillez fournir un motif de rejet avant de rejeter l\'article.', 'Oops', 'danger');
            return;
        }else{
            await handleRejection(item, editableData);
        }
    } else if (action === 'Retour vers supérieur') {
        retourModalRef.value?.open({
            item,
            editableData,
            targetLevel: niveau.superieur,
            labelLevel: 'supérieur'
        })
    }
};

// Gestion de la validation
const handleValidation = async (item, editableData) => {
    try {
        //console.log('Validation de l\'item:', item.id);
        //console.log('Avec les données éditables:', editableData.fields);
        //console.log('je valide maintenant');
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: niveau.achat + 1, // Passer au niveau suivant de validation (responsable financier)
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
                niv_val:niveau.achat + 1,
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
        
        for (const key in editableData.fields) {
            if (editableData.fields[key] === "") {
                editableData.fields[key] = null
            }
        }
        //console.log('Rejet de l\'item:', item.id);
        //console.log('Avec les données éditables:', editableData.fields);

        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: niveau.refuse, // Statut rejeté par l'acheteur
            user_refuse: userStore.id, // ID de l'utilisateur qui rejette
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
                niv_val:niveau.refuse,
            });

        if (insertHistError) throw insertHistError;
        
        //console.log('Rejet réussi pour l\'item:', item.id);
        showAlert("Item rejeté avec succès !", "Succès!", "success")
    } catch (error) {
        console.error('Erreur lors du rejet:', error);
        showAlert("Erreur lors du rejet !", "Oups!", "danger")
    }
};
// Gestion du retour vers Supérieur
const onConfirmRetour = async ({ ok, motif, context }) => {
    if (!ok) {
        showAlert('Veuillez indiquer un motif de retour.', 'Oops', 'danger')
        return
    }
    if (!context?.item) return

    await handleReturnToSup(
        context.item,
        context.editableData,
        context.targetLevel,
        motif,
        context.labelLevel
    )
    retourModalRef.value?.close()
}

const handleReturnToSup = async (
    item,
    editableData,
    targetLevel = niveau.superieur,
    motif = '',
    labelLevel = ''
) => {
    loadingReturn.value = true
    try {
        // motif réservé au rejet — ne pas l'écrire sur l'item
        const fields = { ...(editableData?.fields || {}) }
        delete fields.motif

        const updateData = {
            niv_val: targetLevel,
            com_achat: fields.com_achat || null
        }

        const { error } = await supabase
            .from('ses_demItems')
            .update(updateData)
            .eq('id', item.id)

        if (error) throw error

        const { error: insertHistError } = await supabase
            .from('ses_histo')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                id_item: item.id,
                action: `Retour de l'article ${item.num} de la demande n°${route.params.id}${labelLevel ? ' au niveau ' + labelLevel : ''}${motif ? ' - Motif: ' + motif : ''}`,
                type: 'retour',
                niv_val: targetLevel,
                motif_ret: motif || null
            })

        if (insertHistError) throw insertHistError

        await getDemandeDetails()
        showAlert('Renvoi vers le supérieur réussi !', 'Succès', 'success')
    } catch (error) {
        console.error('Erreur lors du retour:', error)
        showAlert('Erreur lors du renvoi !', 'Oups!', 'danger')
    } finally {
        loadingReturn.value = false
    }
}
// Gestionnaire pour les changements de champs éditables (optionnel)
const handleEditableFieldChange = (changeData) => {
    //console.log('Changement détecté:', changeData);
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
        //console.log('Nom du fichier :', file.value)
    } else {
        uploading.value= true
        fileName.value = ''
    }
}


const upload_file = async (id_item) => {
    //console.log(file.value);

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
        //console.log(data)
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
            'Montant Réel': item.totalR || '',
            'Statut': item.niv_val == niveau.achat ? 'En attente de votre validation' : item.niv_val == niveau.refuse ? 'Rejeté' : item.niv_val < niveau.achat ? 'Validation pas encore a votre niveau' : 'Validé',
        }));

        const nameExcel = `Details_de_la_Demande_Num_${route.params.id}`

        await exportExcel(exportData, nameExcel);
        
    } catch (error) {
        console.error('Erreur lors de l\'exportation vers Excel:', error);
        showAlert('Erreur lors de l\'exportation vers Excel.', 'Oops', 'danger');
    }
};
// ------- BONS DE COMMANDE -------
const listeBcAchat = ref([])
const nouveauBc = ref({ fournisseur: '', mode: '', nom: '' })

// Tous les fournisseurs qui n'ont pas encore de BC enregistré pour cette demande
const fournisseursDisponiblesPourBC = computed(() => {
    const fournisseursAvecBC = listeBcAchat.value.map(bc => bc.fournisseur)
    return fournisseursAllData.value.filter(f => !fournisseursAvecBC.includes(f.id))
})

// Conversion numéro -> lettre(s) : 1=A, 26=Z, 27=AA, 28=AB, ...
const numberToLetters = (num) => {
    let letters = ''
    while (num > 0) {
        const remainder = (num - 1) % 26
        letters = String.fromCharCode(65 + remainder) + letters
        num = Math.floor((num - 1) / 26)
    }
    return letters
}
// Conversion lettre(s) -> numéro (l'inverse)
const lettersToNumber = (letters) => {
    let num = 0
    for (let i = 0; i < letters.length; i++) {
        num = num * 26 + (letters.charCodeAt(i) - 64)
    }
    return num
}
// Prochaine lettre disponible pour cette demande (basé sur le max déjà utilisé,
// pour éviter les doublons même si un BC a été supprimé entre-temps)
const getNextLettre = () => {
    const idStr = String(route.params.id)
    const usedNumbers = listeBcAchat.value
        .map(bc => String(bc.ref).startsWith(idStr) ? String(bc.ref).slice(idStr.length) : null)
        .filter(l => l && /^[A-Z]+$/.test(l))
        .map(l => lettersToNumber(l))
    const maxUsed = usedNumbers.length ? Math.max(...usedNumbers) : 0
    return numberToLetters(maxUsed + 1)
}

const getListeBC = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_bc')
            .select('*')
            .eq('id_obj', route.params.id)
            .order('ref', { ascending: true })
        if (error) throw error
        listeBcAchat.value = data
    } catch (error) {
        console.error('Erreur récupération liste BC', error)
        showAlert('Erreur lors de la récupération des BC', 'Oups!', 'danger')
    }
}

const saveBC = async () => {
    if (!nouveauBc.value.fournisseur) {
        showAlert('Veuillez choisir un fournisseur', 'Oups', 'danger')
        return
    }
    const refCalcule = `${route.params.id}${getNextLettre()}`
    try {
        const { error } = await supabase
            .from('ses_bc')
            .insert({
                id_obj: route.params.id,
                fournisseur: nouveauBc.value.fournisseur,
                ref: refCalcule,
                mode: nouveauBc.value.mode,
                nom: nouveauBc.value.nom,
            })
        if (error) throw error
        showAlert('Bon de commande enregistré !', 'Succès', 'success')
        nouveauBc.value = { fournisseur: '', mode: '', nom: '' }
        getListeBC()
    } catch (error) {
        console.error('Erreur enregistrement BC', error)
        showAlert('Erreur lors de l\'enregistrement du BC', 'Oups!', 'danger')
    }
}

const updateBC = async (bc) => {
    try {
        const { error } = await supabase
            .from('ses_bc')
            .update({ mode: bc.mode, nom: bc.nom })
            .eq('id', bc.id)
        if (error) throw error
        showAlert('Bon de commande mis à jour !', 'Succès', 'success')
    } catch (error) {
        console.error('Erreur mise à jour BC', error)
        showAlert('Erreur lors de la mise à jour du BC', 'Oups!', 'danger')
    }
}

const deleteBC = async (id) => {
    try {
        const { error } = await supabase
            .from('ses_bc')
            .delete()
            .eq('id', id)
        if (error) throw error
        showAlert('Bon de commande supprimé !', 'Succès', 'success')
        getListeBC()
    } catch (error) {
        console.error('Erreur suppression BC', error)
        showAlert('Erreur lors de la suppression du BC', 'Oups!', 'danger')
    }
}
// LIFECYCLE HOOKS
onMounted(() => {
    getDemandeDetails();
    listFournisseurs()
    getListeBC();
});
</script>