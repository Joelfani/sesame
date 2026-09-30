<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE D'ACHAT</h1>
            <button class="btn btn-outline-success" @click="exportToExcel">Exporter vers Excel</button>
            <button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#valMasse" @click="initaliseData">Validation en masse</button>
            <div class="link_demande">
            </div>
        </div>
        
        <!-- Informations générales de la demande -->
        <div class ="row">
            <div class="col-8">
                <h6>N° d'enregistrement: <span>{{ route.params.id }}</span></h6>
                <h6>Date: <span>{{ dataObj.date }}</span></h6>
                
                <div class="d-flex align-items-center gap-3">
                    <h6>Objet: <span>{{ dataObj.nom }}</span></h6>
                </div>
            </div>
            <div class="col-4" style="display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
                <h6>Total Budgété: <strong>{{ totalAmount }} Ar</strong></h6>
                <!--<h6>Total Réel:</h6>-->
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
                    { label: 'Rejeter', color: 'secondary' },
                    { label: 'Retour au collaborateur', color: 'primary' }
                ]"
                @validation_action="handleValidationAction"
                @editable_field_change="handleEditableFieldChange"
                :loading="loading"
            />
        </div>
        <!-- Alert pour les notifications -->
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
        <!-- Modal pour selection en masse imputation et validation-->
        <Modal id="valMasse" title="Validation en masse">
            <div class="mb-3">
                <label for="imputation" class="form-label">Sélectionner l'imputation analytique</label>
                <select v-model="ImputationAll" class="form-select" >
                    <option v-for="imp in imputation" :key="imp.value" :value="imp.value">
                        {{ imp.label }}
                    </option>
                </select>
                <label for="commentaire" class="form-label mt-3">Commentaire</label>
                <textarea v-model="commentaireAll" class="form-control" id="commentaire" rows="3" placeholder="Entrez votre commentaire ici..."></textarea>
                <button class="btn btn-outline-success" @click="validerEnMasse">Valider</button>
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
            </div>
        </Modal>
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

// Alert system
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: '' // success, error, warning, info
})

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
// Fermer un modal Bootstrap par son ID
const closeModal = (modalId) => {
    const modal = document.getElementById(modalId)
    if (modal) {
        const btn = modal.querySelector('[data-bs-dismiss="modal"]')
        if (btn) btn.click()
    }
}
// Référence vers le composant Table
const tableRef = ref(null);

// Définition des colonnes du tableau
const columns = computed(() =>[
    { key: 'num', label: 'N°'},
    { key: 'designation', label: 'Désignation' },
    { key: 'qte', label: 'Nombre',editable: true, type: 'number', min: 1},
    ...tableTete.filter(col => col.key !== 'id' && col.key !== 'com' && col.key !== 'motif' && col.key !== 'com_sup' && col.key !== 'num_tiger' && col.key !== 'qte' && col.key !== 'designation' && col.key !== 'total' && col.key !== 'prix'), // Exclure la colonne 'id'
    { key: 'prix', label: 'PU budgeté',editable: true, min: 1, type: 'number',disabled: true },
    { key: 'total', label: 'Montant total du budget alloué', style: {minWidth: '300px'} ,editable: true, min: 1, type: 'number',disabled: true},
    { key: 'com', label: 'Commentaire', style: {minWidth: '350px'}},
    { key: 'motif', label: 'Motif de rejet',editable: true, type: 'textarea', style: {minWidth: '350px'}},
    { key: 'com_sup', label: 'Commentaire du supérieur',editable: true, type: 'textarea' , style: {minWidth: '350px'}},
    { 
        key: 'imputation', 
        label: 'Imputation analytique',  
        editable: true,  
        type: 'select', 
        options: imputation.value
    }
    
]);
// DATA
const dataObj = ref([]);
const demande_details = ref([]);
const validationData = ref(null); // Pour stocker les données de validation pour debug
const imputationAllData = ref([]);
const imputation = ref([]);
const ImputationAll = ref('');
const commentaireAll = ref('');
// METHODES
//recuperation des données
const getDemandeDetails = async () => {
    loading.value = true;
    try {
        // Récupération des informations de l'objet
        const { data: demandeObj, error: demandeObjError } = await supabase
            .from('ses_demandeObj')
            .select('*')
            .eq('id', route.params.id)
            .single();
        
        if (demandeObjError) throw demandeObjError;

        if (demandeObj.id_sup !== userStore.id) {
            loading.value = false;
            setTimeout(() => {
                navigateTo('/validation');
            }, 500); // Redirection après 3 secondes
            return; // Arrêter l'exécution de la fonction
        }

        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date),
        };

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
                // Ajout du cas "niv_val < niveau.superieur" pour les articles pas encore arrivés à ce niveau (ex: niveau.erg)
                etat: item.niv_val == niveau.superieur ? 0 : item.niv_val == niveau.refuse ? 2 : item.niv_val < niveau.superieur ? 4 : 1,
                delai: formatDate(item.delai), // Formatage de la date en jj/mm/aaaa
            };
        });
        
        demande_details.value = allDataView;
        loading.value = false;
        
    } catch (error) {
        console.log(error);
        showAlert('Erreur lors de la récupération des détails de la demande.', 'Oops', 'danger');
    }
};
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
// Total brut (nombre)
const totalAmount = computed(() => {
    return formatMontant(demande_details.value
            .filter(item => item.etat !== 2)
            .reduce((total, item) => {
        return total + (toNumber(item.qte) * toNumber(item.prix));
    }, 0));
});
// Total pour prixR
const totalAmountR = computed(() => {
    return formatMontant(demande_details.value
            .filter(item => item.etat !== 2)
            .reduce((total, item) => {
        return total + (toNumber(item.qte) * toNumber(item.prixR));
    }, 0));
});
// Gestionnaire principal pour les actions de validation
const handleValidationAction = async (validationPayload) => {
    const { action, item, editableData, rowIndex } = validationPayload;
    
    // Stocker pour affichage (debug)
    validationData.value = {
        action: action,
        itemId: item.id,
        originalItem: { ...item },
        editableFields: editableData.fields,
        timestamp: new Date().toISOString()
    };
    
    if (action === 'Valider') {
        await handleValidation(item, editableData);
    } else if (action === 'Rejeter') {
        if(editableData.fields.motif === undefined || editableData.fields.motif === null || editableData.fields.motif === ''){
            showAlert('Veuillez fournir un motif de rejet avant de rejeter l\'article.', 'Oops', 'danger');
            return;
        }else{
            await handleRejection(item, editableData);
        }
    } else if (action === 'Retour au collaborateur') {
        await handleReturnToCollab(item, editableData);
    }
};

// Gestion de la validation
const handleValidation = async (item, editableData) => {
    try {
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: niveau.superieur + 1, // Passer au niveau suivant de validation
            ...editableData.fields // Inclure toutes les données éditables modifiées
        };
        
        // Mettre à jour dans la base de données
        if(editableData.fields.imputation === undefined || editableData.fields.imputation === null || editableData.fields.imputation === ''){
            showAlert('Veuillez sélectionner une imputation analytique avant de valider.', 'Oops', 'danger');
            return;
        }
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
                niv_val: niveau.superieur + 1,
            });

        if (insertHistError) throw insertHistError;
        
        showAlert('Item validé avec succès !', 'Succès', 'success');
        
    } catch (error) {
        console.error('Erreur lors de la validation:', error);
        showAlert('Erreur lors de la validation !', 'Oops', 'danger');
    }
};

// Gestion du rejet
const handleRejection = async (item, editableData) => {
    try {
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: niveau.refuse, // Statut rejeté
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
                niv_val: niveau.refuse,
            });

        if (insertHistError) throw insertHistError;

        showAlert('Item rejeté avec succès !', 'Succès', 'success');
        
    } catch (error) {
        console.error('Erreur lors du rejet:', error);
        showAlert('Erreur lors du rejet !', 'Oops', 'danger');
    }
};

// Gestion du retour au collaborateur (renvoi de l'article au niveau du demandeur, niveau.erg)
const handleReturnToCollab = async (item, editableData) => {
    try {
        const updateData = {
            niv_val: niveau.erg,
            ...editableData.fields // Inclure les données éditables (commentaires par exemple)
        };

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
                action: 'Retour de l\'article ' + item.num + ' dans la demande d\'achat numero ' + route.params.id + ' au collaborateur',
                type: 'retour',
                niv_val: niveau.erg,
            });

        if (insertHistError) throw insertHistError;

        showAlert('Retour vers le collaborateur réussi !', 'Succès', 'success');
    } catch (error) {
        console.error('Erreur lors du retour au collaborateur:', error);
        showAlert('Erreur lors du retour au collaborateur !', 'Oops', 'danger');
    }
};

// Gestionnaire pour les changements de champs éditables (optionnel)
const handleEditableFieldChange = (changeData) => {
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

const exportToExcel = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_demItems')
            .select('*, fournisseur(nom)')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true });
        
        if (error) throw error;

        // Préparer les données pour l'exportation
        const exportData = data.map(item => ({
            'Num': item.num,
            'Désignation': item.designation,
            'Spécificités techniques': item.spec,
            'Quantité': item.qte,
            'Prix Unitaire': item.prix,
            'Fournisseur': item.fournisseur?.nom || '',
            'Délai': formatDate(item.delai),
            'Imputation Analytique': item.imputation || '',
            'Statut': item.niv_val == niveau.superieur ? 'En attente de votre validation' : item.niv_val == niveau.refuse ? 'Rejeté' : item.niv_val < niveau.superieur ? 'Validation pas encore a votre niveau' : 'Validé',
        }));

        const nameExcel = `Details_de_la_Demande_Num_${route.params.id}`

        await exportExcel(exportData, nameExcel);
        
    } catch (error) {
        console.error('Erreur lors de l\'exportation vers Excel:', error);
        showAlert('Erreur lors de l\'exportation vers Excel.', 'Oops', 'danger');
    }
};

//Recuperation imputation
const listImputation = async() => {
        try {
            const { data, error } = await supabase
                    .from('ses_imputation')
                    .select('*')
                    .eq('etat_del', false)
                    .order('nom', { ascending: true }); 

            if (error) throw error
            imputationAllData.value = data
            imputation.value = data.map(imputation => ({
                label: imputation.nom,
                value: imputation.nom
            }));
            
        } catch (error) { 
            console.error('Erreur lors du chargement des fournisseurs:', error);
            return [];
        }
    };
const initaliseData = () => {
    ImputationAll.value = '';
    commentaireAll.value = '';
};
// Validation en masse
const validerEnMasse = async () => {
    if (!ImputationAll.value) {
        showAlert('Veuillez sélectionner une imputation analytique avant de valider.', 'Oops', 'danger');
        return;
    }

    // Articles en attente de validation à ton niveau
    const itemsToValidate = demande_details.value.filter(item => item.etat === 0);

    if (itemsToValidate.length === 0) {
        showAlert('Aucun article en attente de validation.', 'Info', 'warning');
        return;
    }

    try {
        loading.value = true;

        for (const item of itemsToValidate) {
            const updateData = {
                niv_val: niveau.superieur + 1,
                imputation: ImputationAll.value,
                com_sup: commentaireAll.value,
            };

            const { error } = await supabase
                .from('ses_demItems')
                .update(updateData)
                .eq('id', item.id);

            if (error) throw error;

            const { error: insertHistError } = await supabase
                .from('ses_histo')
                .insert({
                    id_user: userStore.id,
                    id_obj: route.params.id,
                    id_item: item.id,
                    action: 'Validation en masse de l\'article ' + item.num + ' dans la demande d\'achat numero ' + route.params.id,
                    niv_val: niveau.superieur + 1,
                });

            if (insertHistError) throw insertHistError;
        }

        // Réinitialiser les champs
        ImputationAll.value = '';
        commentaireAll.value = '';

        // Fermer le modal
        closeModal('valMasse');

        // Rafraîchir les données
        await getDemandeDetails();

        showAlert(`${itemsToValidate.length} article(s) validé(s) avec succès !`, 'Succès', 'success');

    } catch (error) {
        console.error('Erreur lors de la validation en masse:', error);
        showAlert('Erreur lors de la validation en masse.', 'Oops', 'danger');
    } finally {
        loading.value = false;
    }
};
// LIFECYCLE HOOKS
onMounted(() => {
    getDemandeDetails();
    listImputation()
});
</script>