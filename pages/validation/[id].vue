<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE</h1>
            <button class="btn btn-outline-success" @click="exportToExcel">Exporter vers Excel</button>
            <div class="link_demande">
            </div>
        </div>
        
        <!-- Informations générales de la demande -->
        <div>
            <h6>N° d'enregistrement: <span>{{ route.params.id }}</span></h6>
            <h6>Date: <span>{{ dataObj.date }}</span></h6>
            <h6></h6>
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
                    { label: 'Rejeter', color: 'secondary' }
                ]"
                @validation_action="handleValidationAction"
                @editable_field_change="handleEditableFieldChange"
                :loading="loading"
            />
        </div>
        <!-- Alert pour les notifications -->
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
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
// Référence vers le composant Table
const tableRef = ref(null);

// Définition des colonnes du tableau
const columns = computed(() =>[
    { key: 'num', label: 'N°'},
    ...tableTete.filter(col => col.key !== 'id'), // Exclure la colonne 'id'
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
// METHODES
//recuperation des données
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
                etat: item.niv_val == niveau.superieur ? 0 : item.niv_val == niveau.refuse ? 2 : 1,
                delai: formatDate(item.delai), // Formatage de la date en jj/mm/aaaa
            };
        });
        
        demande_details.value = allDataView;
        loading.value = false;
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
        showAlert('Erreur lors de la récupération des détails de la demande.', 'Oops', 'danger');
    }
};

// Gestionnaire principal pour les actions de validation
const handleValidationAction = async (validationPayload) => {
    const { action, item, editableData, rowIndex } = validationPayload;
    
    console.log('Action de validation:', action);
    console.log('Item original:', item);
    console.log('Données éditables:', editableData);
    
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
        console.log('Rejet de l\'item:', item.id);
        console.log('Avec les données éditables:', editableData.fields);
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: niveau.refuse, // Statut rejeté
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
            
            console.log('imp',imputation.value);
            
        } catch (error) { 
            console.error('Erreur lors du chargement des fournisseurs:', error);
            return [];
        }
    };
// LIFECYCLE HOOKS
onMounted(() => {
    getDemandeDetails();
    listImputation()
});
</script>