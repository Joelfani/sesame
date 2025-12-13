<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE - GESTION DU CHÈQUE</h1>
            <div>
                <button class="btn btn-outline-secondary" @click="devTab">{{ dev ? 'Réduire le tableau': 'Développer le tableau' }}</button>
                <button class="btn btn-outline-success" @click="exportToExcel">Exporter vers Excel</button>
                <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#cheque" @click="initialiseFournisseur()">Émettre chèque par fournisseur</button>
            </div>
            <div class="link_demande">
            </div>
        </div>

        <!-- Modal Émission Chèque -->
        <Modal id="cheque" title="Émission de chèque">
            <div class="pdf-content">
                <label>Sélectionnez un fournisseur</label>
                <select
                    class="form-control mb-3"
                    v-model="fournisseurSelected"
                >
                    <option value="">-- Sélectionnez un fournisseur --</option>
                    <option v-for="option in fournisseurList" :key="option.id" :value="option.nom">
                        {{ option.nom }}
                    </option>
                </select>

                <label>N° de Chèque</label>
                <input 
                    type="text" 
                    class="form-control mb-3" 
                    v-model="numCheque"
                    placeholder="Entrez le numéro de chèque"
                    pattern="\d*"
                    @input="validateNumCheque"
                >

                <label>Date d'émission</label>
                <input 
                    type="date" 
                    class="form-control mb-3" 
                    v-model="dateEmission"
                >

                <label>Observation (optionnel)</label>
                <textarea 
                    class="form-control mb-3" 
                    v-model="observationCheque"
                    rows="3"
                    placeholder="Ajoutez une observation si nécessaire"
                ></textarea>

                <div class="alert alert-info" v-if="fournisseurSelected && articlesAffiches.length > 0">
                    <strong>Articles concernés :</strong> {{ articlesAffiches.length }} article(s)
                    <ul class="mt-2 mb-0">
                        <li v-for="article in articlesAffiches" :key="article.id">
                            {{ article.num }} - {{ article.designation }} ({{ article.totalR }} Ar)
                        </li>
                    </ul>
                </div>

                <hr>
                <span v-if="chequeButtonLoading">Traitement en cours...</span>
                <button 
                    class="btn btn-outline-dark" 
                    @click="emettreCheque" 
                    :disabled="chequeButtonLoading || !fournisseurSelected || !numCheque || !dateEmission"
                >
                    Émettre le chèque
                </button>            
                <button class="btn btn-light" data-bs-dismiss="modal">Fermer</button>
            </div>
        </Modal>

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
                :columns="dev ? columns : columns2"
                :rows="demande_details"
                :type_but_modal="true"
                :but_Validation="true"
                :actions="[
                    { label: 'Chèque émis', color: 'success' },
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
import { tableTete, niveau } from '~/assets/js/CommonVariable.js';
import { exportExcel } from '~/assets/js/export.js';

// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
const route = useRoute();

// Loading
const loading = ref(true);
const chequeButtonLoading = ref(false);

// Référence vers le composant Table
const tableRef = ref(null);

// Définition des colonnes du tableau
const columns = [
    { key: 'num', label: 'N°'},
    ...tableTete.filter(col => col.key !== 'id'),
    { key: 'imputation', label: 'Imputation analytique' },
    { key: 'fournisseur2', label: 'Fournisseur Réel' },
    { key: 'prixR', label: 'Prix Réel' },
    { key: 'totalR', label: 'Montant Réel' },
    { key: 'observation_dpr', label: 'Observation DPR'},
    { 
        key: 'num_cheque', 
        label: 'N° Chèque', 
        editable: true, 
        type: 'text'
    },
    { 
        key: 'date_emission_cheque', 
        label: 'Date d\'émission', 
        editable: true, 
        type: 'date'
    },
    { 
        key: 'observation_cheque', 
        label: 'Observation sur le Chèque', 
        editable: true, 
        type: 'textarea'
    }
];

//column reduit
const columns2 = [
    { key: 'num', label: 'N°'},
    ...tableTete.filter(col => col.key !== 'id' && col.key !== 'spec' && col.key !== 'fournisseur' && col.key !== 'prix' && col.key !== 'delai' && col.key !== 'total' && col.key !== 'com' ), // Exclure la colonne
    { key: 'imputation', label: 'Imputation analytique' },
    { key: 'fournisseur2', label: 'Fournisseur Réel' },
    { key: 'prixR', label: 'Prix Réel' },
    { key: 'totalR', label: 'Montant Réel' },
    { key: 'observation_dpr', label: 'Observation DPR'},
    { 
        key: 'num_cheque', 
        label: 'N° Chèque', 
        editable: true, 
        type: 'text'
    },
    { 
        key: 'date_emission_cheque', 
        label: 'Date d\'émission', 
        editable: true, 
        type: 'date'
    },
    { 
        key: 'observation_cheque', 
        label: 'Observation sur le Chèque', 
        editable: true, 
        type: 'textarea'
    }
];

// DATA
const dataObj = ref([]);
const demande_details = ref([]);
const validationData = ref(null);
const dev = ref(false)
// Données du modal
const fournisseurSelected = ref('');
const fournisseurList = ref([]);
const numCheque = ref('');
const dateEmission = ref('');
const observationCheque = ref('');

// Alert system
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: ''
});

// Articles affichés pour le fournisseur sélectionné
const articlesAffiches = computed(() => {
    if (!fournisseurSelected.value) return [];
    return demande_details.value.filter(item => 
        item.fournisseur2 === fournisseurSelected.value && 
        item.niv_val !== niveau.refuse && 
        item.niv_val >= niveau.cheque
    );
});

// METHODES
// Gestion du tableau
const devTab = () => {
    dev.value = !dev.value    
}
// Afficher une alerte
const showAlert = (message, title, type) => {
    alert.value = {
        show: true,
        message,
        title,
        type
    }

    setTimeout(() => {
        alert.value.show = false
    }, 5000)
}

// Valider que le numéro de chèque ne contient que des chiffres
const validateNumCheque = (event) => {
    numCheque.value = event.target.value.replace(/\D/g, '');
}

// Initialiser le modal
const initialiseFournisseur = () => {
    fournisseurSelected.value = '';
    numCheque.value = '';
    dateEmission.value = '';
    observationCheque.value = '';
}

// Émettre le chèque pour tous les articles du fournisseur
const emettreCheque = async () => {
    if (!fournisseurSelected.value) {
        showAlert('Veuillez sélectionner un fournisseur !', 'Oops', 'danger');
        return;
    }

    if (!numCheque.value || numCheque.value.trim() === '') {
        showAlert('Veuillez renseigner le numéro de chèque !', 'Oops', 'danger');
        return;
    }

    if (!/^\d+$/.test(numCheque.value)) {
        showAlert('Le numéro de chèque ne doit contenir que des chiffres !', 'Erreur de saisie', 'danger');
        return;
    }

    if (!dateEmission.value) {
        showAlert('Veuillez renseigner la date d\'émission de chèque !', 'Oops', 'danger');
        return;
    }

    chequeButtonLoading.value = true;

    try {
        // Récupérer tous les articles du fournisseur sélectionné
        const articlesATraiter = articlesAffiches.value;

        if (articlesATraiter.length === 0) {
            showAlert('Aucun article trouvé pour ce fournisseur !', 'Oops', 'warning');
            chequeButtonLoading.value = false;
            return;
        }

        // Préparer les données de mise à jour
        const updateData = {
            niv_val: niveau.cheque + 1,
            num_cheque: numCheque.value,
            date_emission_cheque: dateEmission.value,
            observation_cheque: observationCheque.value || null
        };

        // Mettre à jour tous les articles en une seule requête
        const articlesIds = articlesATraiter.map(article => article.id);
        
        const { error: updateError } = await supabase
            .from('ses_demItems')
            .update(updateData)
            .in('id', articlesIds);

        if (updateError) throw updateError;

        // Enregistrer dans l'historique pour chaque article
        const histoInserts = articlesATraiter.map(article => ({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: article.id,
            action: `Émission de chèque n°${numCheque.value} pour l'article ${article.num} - Fournisseur: ${fournisseurSelected.value}`,
            niv_val: niveau.cheque + 1
        }));

        const { error: histoError } = await supabase
            .from('ses_histo')
            .insert(histoInserts);

        if (histoError) throw histoError;

        // Actualiser les données
        await getDemandeDetails();

        showAlert(
            `Chèque n°${numCheque.value} émis avec succès pour ${articlesATraiter.length} article(s) !`, 
            'Succès', 
            'success'
        );

        // Réinitialiser le formulaire
        initialiseFournisseur();

    } catch (error) {
        console.error('Erreur lors de l\'émission du chèque:', error);
        showAlert('Erreur lors de l\'émission du chèque !', 'Oops', 'danger');
    } finally {
        chequeButtonLoading.value = false;
    }
}

// Récupération des données
const getDemandeDetails = async () => {
    loading.value = true;
    try {
        const { data, error } = await supabase
            .from('ses_demItems')
            .select('*, fournisseur(nom), fournisseur2(nom,id)')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true });
        
        if (error) throw error;
        
        const allDataView = data.map(item => {
            return {
                ...item,
                fournisseur: item.fournisseur?.nom || '',
                etat: item.niv_val == niveau.cheque ? 0 : item.niv_val == niveau.refuse ? 2 : item.niv_val < niveau.cheque ? 4 : 1,
                delai: formatDate(item.delai),
                fournisseur2: item.fournisseur2?.nom || '',
                prix2: item.prixR || item.prix || 0,
                total2: item.totalR || item.total || 0,
                date_emission_cheque: item.date_emission_cheque
            };
        });
        
        demande_details.value = allDataView;
        loading.value = false;

        // Récupérer la liste unique des fournisseurs pour le modal
        const filteredDataForFournisseur = data.filter(item => 
            item.niv_val !== niveau.refuse && 
            item.niv_val >= niveau.cheque
        );

        const fournisseurForModal = Array.from(
            new Map(
                filteredDataForFournisseur.map(item => [
                    item.fournisseur2?.id,
                    {
                        nom: item.fournisseur2?.nom || '',
                        id: item.fournisseur2?.id || null
                    }
                ])
            ).values()
        );

        fournisseurList.value = fournisseurForModal;
        
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
        console.error(error);
    }
};

// Gestionnaire principal pour les actions de validation (validation individuelle)
const handleValidationAction = async (validationPayload) => {
    const { action, item, editableData, rowIndex } = validationPayload;
    
    validationData.value = {
        action: action,
        itemId: item.id,
        originalItem: { ...item },
        editableFields: editableData.fields,
        timestamp: new Date().toISOString()
    };
    
    if (action === 'Chèque émis') {
        await handleChequeEmis(item, editableData);
    } else if (action === 'Rejeter') {
        if(editableData.fields.motif === undefined || editableData.fields.motif === null || editableData.fields.motif === ''){
            showAlert('Veuillez fournir un motif de rejet avant de rejeter l\'article.', 'Oops', 'danger');
            return;
        }else{
            await handleRejection(item, editableData);
        }
    }
};

// Gestion de l'émission du chèque individuel
const handleChequeEmis = async (item, editableData) => {
    try {
        
        if (!editableData.fields.num_cheque || editableData.fields.num_cheque.trim() === '') {
            showAlert('Veuillez renseigner le numéro de chèque !', 'Oops', 'danger');
            return;
        }

        if (!/^\d+$/.test(editableData.fields.num_cheque)) {
            showAlert('Le numéro de chèque ne doit contenir que des chiffres !', 'Erreur de saisie', 'danger');
            return;
        }

        if (!editableData.fields.date_emission_cheque) {
            showAlert('Veuillez renseigner la date d\'émission de chèque !', 'Oops', 'danger');
            return;
        }
        
        const updateData = {
            niv_val: niveau.cheque + 1,
            date_emission_cheque: editableData.fields.date_emission_cheque || new Date().toISOString().split('T')[0],
            ...editableData.fields
        };
        
        const { error } = await supabase
            .from('ses_demItems')
            .update(updateData)
            .eq('id', item.id);
        
        if (error) throw error;
        
        await getDemandeDetails();

        const { error: insertHistError } = await supabase
            .from('ses_histo')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                id_item: item.id,
                action: 'Émission de chèque de l\'article '+ item.num + ' dans la demande d\'achat numéro ' + route.params.id,
                niv_val: niveau.cheque + 1
            });

        if (insertHistError) throw insertHistError;
        
        showAlert('Chèque émis avec succès !', 'Succès', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'émission du chèque:', error);
        showAlert('Erreur lors de l\'émission du chèque !', 'Oops', 'danger');
    }
};

// Gestion du rejet
const handleRejection = async (item, editableData) => {
    try {
        const updateData = {
            niv_val: niveau.refuse,
            ...editableData.fields
        };
        
        const { error } = await supabase
            .from('ses_demItems')
            .update(updateData)
            .eq('id', item.id);
        
        if (error) throw error;
        
        await getDemandeDetails();
        
        const { error: insertHistError } = await supabase
            .from('ses_histo')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                id_item: item.id,
                action: 'Rejet de l\'article '+ item.num + ' dans la demande d\'achat numéro ' + route.params.id,
                type: 'rejeter',
                niv_val: niveau.refuse
            });

        if (insertHistError) throw insertHistError;
        
        showAlert('Item rejeté !', 'Succès', 'success');
    } catch (error) {
        console.error('Erreur lors du rejet:', error);
        showAlert('Erreur lors du rejet !', 'Oops', 'danger');
    }
};

const handleEditableFieldChange = (changeData) => {
    //console.log('Changement détecté:', changeData);
};

const getAllEditableChanges = () => {
    if (tableRef.value) {
        return tableRef.value.getAllEditableData();
    }
    return {};
};

const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
};

const exportToExcel = async () => {
    try {
        const data = demande_details.value
        const exportData = data.map(item => ({
            'Num': item.num,
            'Désignation': item.designation,
            'Spécificités techniques': item.spec,
            'Quantité': item.qte,
            'Prix Unitaire': item.prix,
            'Fournisseur': item.fournisseur || '',
            'Délai': item.delai,
            'Imputation Analytique': item.imputation || '',
            'Fournisseur Réel': item.fournisseur2 || '',
            'Prix Réel': item.prixR || '',
            'Montant Réel': item.totalR || '',
            'Observation DPR': item.observation_dpr || '',
            'N° Chèque': item.num_cheque || '',
            'Date d\'émission': item.date_emission_cheque ? formatDate(item.date_emission_cheque) : '',
            'Observation Chèque': item.observation_cheque || '',
            'Statut': item.niv_val == niveau.cheque ? 'En attente de votre validation' : item.niv_val == niveau.refuse ? 'Rejeté' : item.niv_val < niveau.cheque ? 'Validation pas encore à votre niveau' : 'Validé',
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
});
</script>

<style scoped>
.pdf-content {
    padding: 20px;
}

.pdf-content label {
    font-weight: 600;
    margin-bottom: 5px;
    display: block;
}

.alert-info ul {
    font-size: 0.9em;
    padding-left: 20px;
}

.alert-info li {
    margin-bottom: 5px;
}
</style>