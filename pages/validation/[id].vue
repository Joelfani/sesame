<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE</h1>
            <button class="btn btn-outline-success">Exporter vers Excel</button>
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
            />
        </div>
    </div>
</template>

<script setup>
import { tableTete } from '~/assets/js/CommonVariable.js';

// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
const route = useRoute();

// Référence vers le composant Table
const tableRef = ref(null);

// Définition des colonnes du tableau
const columns = [
    ...tableTete,
    { 
        key: 'imputation', 
        label: 'Imputation analytique', 
        editable: true, 
        type: 'select', 
        options: [
            { value: 'SADMINDIVERS', label: 'SADMINDIVERS' },
            { value: 'SADMIN', label: 'SADMIN' },
            { value: 'SBOEAP', label: 'SBOEAP' },
            { value: 'SBOEOSP', label: 'SBOEOSP' },
            { value: 'SBOESUP', label: 'SBOESUP' },
            { value: 'SBOE', label: 'SBOE' },
            { value: 'SEIAP', label: 'SEIAP' },
            { value: 'SEI', label: 'SEI' },
            { value: 'SPROFAP', label: 'SPROFAP' },
            { value: 'SPROF', label: 'SPROF' },
            { value: 'SRSSUP', label: 'SRSSUP' },
            { value: 'SRS', label: 'SRS' },
            { value: 'SSE', label: 'SSE' },
            { value: 'SSL', label: 'SSL' },
        ]
    }
];
// DATA
const dataObj = ref([]);
const demande_details = ref([]);
const validationData = ref(null); // Pour stocker les données de validation pour debug

// METHODES
//recuperation des données
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
                etat: item.niv_val == 1 ? 0 : item.niv_val == 8 ? 2 : 1,
                delai: formatDate(item.delai), // Formatage de la date en jj/mm/aaaa
            };
        });
        
        demande_details.value = allDataView;
        
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
        await handleRejection(item, editableData);
    }
};

// Gestion de la validation
const handleValidation = async (item, editableData) => {
    try {
        console.log('Validation de l\'item:', item.id);
        console.log('Avec les données éditables:', editableData.fields);
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: 2, // Passer au niveau suivant de validation
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
        
        console.log('Validation réussie pour l\'item:', item.id);
        alert('Item validé avec succès !');
        
    } catch (error) {
        console.error('Erreur lors de la validation:', error);
        alert('Erreur lors de la validation !');
    }
};

// Gestion du rejet
const handleRejection = async (item, editableData) => {
    try {
        console.log('Rejet de l\'item:', item.id);
        console.log('Avec les données éditables:', editableData.fields);
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: 8, // Statut rejeté
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

// LIFECYCLE HOOKS
onMounted(() => {
    getDemandeDetails();
});
</script>