<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE</h1>
            <div class="">
                <button class="btn btn-outline-secondary" @click="devTab">{{ dev ? 'Réduire le tableau': 'Développer le tableau' }}</button>
                <button class="btn btn-outline-success" @click="exportToExcel">Exporter vers Excel</button>
                <button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#valMasseCg" @click="initMassData">Validation en masse</button>
                <button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#modMasseImputation" @click="initMassImputation">Modifier Imputation en masse</button>
                <client-only>
                    <button class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#modDoc" @click="doc_recovery({id:route.params.id})">Liste document</button>
                </client-only>
                
            </div>
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
                <h6>Total Réel: <strong>{{ totalAmountR }} Ar</strong></h6>
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
                    { label: 'Valider', color: 'success' },
                    { label: 'Rejeter', color: 'danger' },
                    { label: 'Editer Imputation', color: 'secondary', active_modal: true, type_modal: '4' },
                    { label: 'Retour vers Achat', color: 'primary'},
                ]"
                title_modal_neutre="Modification de l'imputation analytique"
                @validation_action="handleValidationAction"
                @editable_field_change="handleEditableFieldChange"
                @function_but_neutre = "listImputation"
                :loading="loading"
            >
                <template #modal4="{ item }">
                    <div class="mb-3">
                        <label for="imputation" class="form-label">Sélectionner la nouvelle imputation analytique</label>
                        <select v-model="ImputationMod" class="form-select" >
                            <option v-for="imp in imputation" :key="imp.value" :value="imp.value" :selected="item.imputation === imp.value">
                                {{ imp.label }}
                            </option>
                        </select>
                        <button class="btn btn-outline-success"  @click="saveImputation(item.imputation, ImputationMod,item)" data-bs-dismiss="modal">Enregistrer</button>
                        <!-- Bouton pour fermer le modal -->
                        <button ref="closeModalBtn" type="button" data-bs-dismiss="modal" class="d-none"></button>
                    </div>
                </template>
            </Table>
        </div>
        <!-- Alert pour les notifications -->
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
    <!-- Modal neutre type 4 -->
        <Modal id="modDoc" title="Liste des documents associés">
            
                <div class="text-center">
                    
                    <p v-for="doc in doc_achat" :key="doc.id" style="font-weight: bold;">
                        {{ doc.name_doc }}
                        <button class="btn btn-outline-secondary" @click="downloadFile(doc.name_doc, doc.nameStorage)"><img src="/public/icon/download.png" style="width: 20px; height: 20px;"></button>
                    </p>
                </div>
            
        </Modal>

        <!-- Modal Validation en masse -->
        <Modal id="valMasseCg" title="Validation en masse - Contrôle de Gestion">
            <div class="mb-3">
                <label class="form-label fw-bold">
                    Code Tiger <span class="text-danger">*</span>
                </label>
                <input v-model="tigerAllMass" type="text" class="form-control" placeholder="Code Tiger">

                <label class="form-label mt-3">Commentaire du contrôleur de gestion</label>
                <textarea v-model="comCgAllMass" class="form-control" rows="3" placeholder="Entrez votre commentaire ici..."></textarea>

                <div class="d-flex gap-2 justify-content-end mt-3">
                    <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button class="btn btn-outline-success" :disabled="massValidationLoading" @click="validerEnMasseCg">Valider</button>
                </div>
            </div>
        </Modal>

        <!-- Modal Modification en masse de l'imputation -->
        <Modal id="modMasseImputation" title="Modification en masse de l'imputation analytique">
            <div class="mb-3">
                <label class="form-label">Nouvelle imputation analytique</label>
                <select v-model="ImputationMasseModif" class="form-select">
                    <option value="">-- Sélectionner --</option>
                    <option v-for="imp in imputation" :key="imp.value" :value="imp.value">
                        {{ imp.label }}
                    </option>
                </select>

                <div class="d-flex gap-2 justify-content-end mt-3">
                    <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button class="btn btn-outline-success" :disabled="massImputationLoading" @click="modifierImputationEnMasse">Enregistrer</button>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { tableTete,niveau } from '~/assets/js/CommonVariable.js';
import n2words from 'n2words'
import Cleave from 'vue-cleave-component'
import {exportExcel} from '~/assets/js/export.js';

// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
const route = useRoute();
const loading = ref(true);
// Référence vers le composant Table
const tableRef = ref(null);

// Définition des colonnes du tableau
const columns = [
    { key: 'num', label: 'N°'},
    ...tableTete.filter(col => col.key !== 'id' && col.key !== 'com' && col.key !== 'motif' && col.key !== 'num_tiger'), // Exclure la colonne 'id'
    { key: 'com', label: 'Commentaire',style: {minWidth: '350px'}},
    { key: 'imputation', label: 'Imputation analytique' },
    { key: 'fournisseur2', label: 'Fournisseur Réel' },
    { key: 'prixR', label: 'Prix Réel' },
    { key: 'totalR', label: 'Montant Réel' },
    { key: 'num_tiger', label: 'Tiger',editable: true, type: 'text'  },
    { key: 'com_achat', label: 'Commentaire de l\' acheteur',style: {minWidth: '350px'}},
    { key: 'com_fin', label: 'Commentaire de la finance',style: {minWidth: '350px'}},
    { key: 'motif', label: 'Motif de rejet ',editable: true, type: 'textarea' , style: {minWidth: '350px'}},
    { key: 'com_cg', label: 'Commentaire du contrôleur de gestion',editable: true, type: 'textarea' , style: {minWidth: '350px'}}, 
];

//column reduit
const columns2 = [
    { key: 'num', label: 'N°'},
    ...tableTete.filter(col => col.key !== 'id' && col.key !== 'spec' && col.key !== 'fournisseur' && col.key !== 'prix' && col.key !== 'delai' && col.key !== 'total' && col.key !== 'com' && col.key !== 'motif' && col.key !== 'num_tiger'), // Exclure la colonne
    { key: 'imputation', label: 'Imputation analytique' },
    { key: 'fournisseur2', label: 'Fournisseur Réel' },
    { key: 'prixR', label: 'Prix Réel' },
    { key: 'totalR', label: 'Montant Réel' },
    { key: 'num_tiger', label: 'Tiger',editable: true, type: 'text'  },
    { key: 'com_achat', label: 'Commentaire de l\' acheteur',style: {minWidth: '350px'}},
    { key: 'com_fin', label: 'Commentaire de la finance',style: {minWidth: '350px'}},
    { key: 'motif', label: 'Motif de rejet ',editable: true, type: 'textarea' , style: {minWidth: '350px'}},
    { key: 'com_cg', label: 'Commentaire du contrôleur de gestion',editable: true, type: 'textarea' , style: {minWidth: '350px'}},
];

// DATA
const dataObj = ref([]);
const demande_details = ref([]);
const validationData = ref(null); // Pour stocker les données de validation pour debug
const doc_achat = ref([]) // contient les documents reliers a une article de l'achat
const fournisseurAfe = ref([]); // Pour le modal AFE
const pdffournisseurSelected = ref('')
const fournisseurPdfDetails = ref([])
const nifstat = ref([])
const nif = ref('')
const stat = ref('')
const pdfDetailTotal = computed(() => {
    return fournisseurPdfDetails.value.reduce((sum, item) => sum + (item.totalR || 0), 0);
});
const refBc = ref('')
const paimentMode = ref('')
const auNomDe = ref('') 
const dev = ref(false)
const imputationAllData = ref([]);
const imputation = ref([]);
const ImputationMod=ref()
const closeModalBtn = ref(null);
// DATA pour la validation en masse
const tigerAllMass = ref('')
const comCgAllMass = ref('')
const massValidationLoading = ref(false)
// DATA pour la modification en masse de l'imputation
const ImputationMasseModif = ref('')
const massImputationLoading = ref(false)
//data for pdf
const pdf = ref(true)
const date = ref(new Date().toLocaleDateString())
const pdfButtonLoading = ref(false)
const taxe = ref(null)
const remise = ref(0)
const mtaxe = computed(() => {
    return (pdfDetailTotal.value * taxe.value) / 100;
})
const mremise = computed(() => {
    return (pdfDetailTotal.value * remise.value) / 100;
})

// Transformation total en Lettre
const nbrWord = computed(() => {
  const total = Number(pdfDetailTotal.value) 
              + Number(mtaxe.value || 0) 
              - Number(mremise.value || 0)
  if (isNaN(total)) return ''
  return n2words(total, { lang: 'fr' })
})
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

// Fermer un modal Bootstrap par clic sur son bouton data-bs-dismiss
const closeModal = (modalId) => {
    const modal = document.getElementById(modalId)
    if (modal) {
        const btn = modal.querySelector('[data-bs-dismiss="modal"]')
        if (btn) btn.click()
    }
}

// Gestion du tableau
const devTab = () => {
    dev.value = !dev.value    
}
// Récupération des données
const getDemandeDetails = async () => {
    loading.value = true;
    try {
        const { data, error } = await supabase
            .from('ses_demItems')
            .select('*, fournisseur(nom), fournisseur2(nom,id,nif,stat)')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true });
        
        if (error) throw error;
        
        const allDataView = data.map(item => {
            return {
                ...item,
                fournisseur: item.fournisseur?.nom || '', // récupérer le nom du fournisseur
                etat: item.niv_val == niveau.cg ? 0 : item.niv_val == niveau.refuse ? 2 : item.niv_val < niveau.cg ? 4 : 1, // Adapter pour le niveau finance
                delai: formatDate(item.delai), // Formatage de la date en jj/mm/aaaa
                // Mapper les champs pour l'affichage
                fournisseur2: item.fournisseur2?.nom || '',
                prix2: item.prixR || item.prix || 0,
                total2: item.totalR || item.total || 0,
            };
        });
        
        demande_details.value = allDataView;
        loading.value = false;
        // fournisseur pour AFE dont les articles sont au niv 4
        const filterdataforfourniseur = data.filter(item => item.niv_val != niveau.refuse);

        const fournisseurForAfe = Array.from(
                new Map(
                    filterdataforfourniseur.map(item => [
                    item.fournisseur2?.id, // clé unique
                    {
                        nom: item.fournisseur2?.nom || '',
                        id: item.fournisseur2?.id || null,
                        nif: item.fournisseur2?.nif || '',
                        stat: item.fournisseur2?.stat || '',
                    }
                    ])
                ).values()
                )

        fournisseurAfe.value = fournisseurForAfe

        //console.log('afe', fournisseurAfe.value);
        
        
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
    
    //console.log('Action de validation finance:', action);
    //console.log('Item original:', item);
    //console.log('Données éditables:', editableData);
    
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
    } else if (action === 'Retour vers Achat') {
        await handleReturnToPurchase(item, editableData);
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
// Gestion de la validation
const handleValidation = async (item, editableData) => {
    try {
        //console.log('Validation financière de l\'item:', item.id);
        //console.log('Avec les données éditables:', editableData.fields);
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: niveau.cg + 1, // Passer au niveau suivant de validation (DPR)
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
                niv_val:niveau.cg + 1,
            });

        if (insertHistError) throw insertHistError;
        
        //console.log('Validation du controlleur réussie pour l\'item:', item.id);
        showAlert('Validation du controlleur réussie !', 'Succès', 'success');
    } catch (error) {
        console.error('Erreur lors de la validation du controlleur:', error);
        showAlert('Erreur lors de la validation du controlleur !', 'Oups!', 'danger');
    }
};

// Gestion du rejet 
const handleRejection = async (item, editableData) => {
    try {
        //console.log('Rejet financier de l\'item:', item.id);
        //console.log('Avec les données éditables:', editableData.fields);
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: niveau.refuse, // Statut rejeté (rejet général)
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
        
        //console.log('Rejet financier réussi pour l\'item:', item.id);
        showAlert('Rejet financier réussi !', 'Succès', 'success');
    } catch (error) {
        console.error('Erreur lors du rejet financier:', error);
        showAlert('Erreur lors du rejet financier !', 'Oups!', 'danger');
    }
};
// Gestion du retour vers achat
const handleReturnToPurchase = async (item, editableData) => {
    try {
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: niveau.achat, // Statut rejeté (rejet général)
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
                action: 'Retour de l\'article '+ item.num + ' dans la demande d\'achat numero ' + route.params.id,
                type: 'retour',
                niv_val:niveau.achat,
            });

        if (insertHistError) throw insertHistError;
        
        //console.log('Retour vers achat réussi pour l\'item:', item.id);
        showAlert('Renvoi vers responsable d\'achat réussi !', 'Succès', 'success');
    } catch (error) {
        console.error('Erreur lors du retour financier:', error);
        showAlert('Erreur lors du renvoi financier !', 'Oups!', 'danger');
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
// Pour les documents associés
const doc_recovery = async (item) =>{
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
//DownloadFile
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
            'Fournisseur': item.fournisseur|| '-',
            'Délai': item.delai,
            'Imputation Analytique': item.imputation || '-',
            'Tiger': item.num_tiger || '-',
            'Fournisseur Réel':item.fournisseur|| '-',
            'Prix Réel': item.prixR || '-',
            'Montant Réel': item.totalR || '-',
            'Statut': item.niv_val == niveau.cg ? 'En attente de votre validation' : item.niv_val == niveau.refuse ? 'Rejeté' : item.niv_val < niveau.cg ? 'Validation pas encore a votre niveau' : 'Validé',
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
        ImputationMod.value = null; // Réinitialiser la valeur sélectionnée
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

//Modification de l'imputation analytique
const saveImputation = async (oldImputation, newImputation, item) => {
    try {
        if (!newImputation) {
            showAlert('Veuillez sélectionner une nouvelle imputation avant de sauvegarder.', 'Oups', 'danger');
            return;
        }

        const { data, error } = await supabase
            .from('ses_demItems')
            .update({ imputation: newImputation,imputation_old: oldImputation })
            .eq('id', item.id);

        if (error) throw error;

        // Actualiser les données après la mise à jour
        await getDemandeDetails();
        // Enregistrement dans historique

        const { error: insertHistError } = await supabase
            .from('ses_histo')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                id_item: item.id,
                action: 'Modification de l\'imputation analytique de l\'article '+ item.num + ' dans la demande d\'achat numero ' + route.params.id,
                niv_val: 0,
                changement:"Imputation analytique",
                old_value: oldImputation
            });

        if (insertHistError) throw insertHistError;

        showAlert('Imputation analytique mise à jour avec succès !', 'Succès', 'success');
        closeModalBtn.value?.click();

    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'imputation analytique :', error);
        showAlert('Erreur lors de la mise à jour de l\'imputation analytique.', 'Oups', 'danger');
    }
};

// Réinitialiser les champs du modal de validation en masse
const initMassData = () => {
    tigerAllMass.value = ''
    comCgAllMass.value = ''
}

// Validation en masse au niveau CG (Code Tiger obligatoire)
const validerEnMasseCg = async () => {
    if (!tigerAllMass.value || !String(tigerAllMass.value).trim()) {
        showAlert('Veuillez renseigner le code Tiger avant de valider.', 'Oops', 'danger')
        return
    }

    // Articles en attente de validation à ton niveau
    const itemsToValidate = demande_details.value.filter(item => item.etat === 0)

    if (itemsToValidate.length === 0) {
        showAlert('Aucun article en attente de validation.', 'Info', 'warning')
        return
    }

    massValidationLoading.value = true
    try {
        for (const item of itemsToValidate) {
            const updateData = {
                niv_val: niveau.cg + 1,
                num_tiger: tigerAllMass.value,
                com_cg: comCgAllMass.value,
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
                    action: 'Validation en masse de l\'article ' + item.num + ' dans la demande d\'achat numero ' + route.params.id,
                    niv_val: niveau.cg + 1,
                })

            if (insertHistError) throw insertHistError
        }

        tigerAllMass.value = ''
        comCgAllMass.value = ''
        closeModal('valMasseCg')
        await getDemandeDetails()
        showAlert(`${itemsToValidate.length} article(s) validé(s) avec succès !`, 'Succès', 'success')
    } catch (error) {
        console.error('Erreur lors de la validation en masse:', error)
        showAlert('Erreur lors de la validation en masse.', 'Oops', 'danger')
    } finally {
        massValidationLoading.value = false
    }
}

// Réinitialiser le modal de modification en masse de l'imputation
const initMassImputation = () => {
    ImputationMasseModif.value = ''
    listImputation()
}

// Modification en masse de l'imputation analytique (articles non rejetés)
const modifierImputationEnMasse = async () => {
    if (!ImputationMasseModif.value) {
        showAlert('Veuillez sélectionner une imputation analytique.', 'Oops', 'danger')
        return
    }

    const itemsToUpdate = demande_details.value.filter(item => item.etat === 0)

    if (itemsToUpdate.length === 0) {
        showAlert('Aucun article disponible pour la modification.', 'Info', 'warning')
        return
    }

    massImputationLoading.value = true
    try {
        for (const item of itemsToUpdate) {
            if (item.imputation === ImputationMasseModif.value) continue // rien à changer

            const { error } = await supabase
                .from('ses_demItems')
                .update({
                    imputation: ImputationMasseModif.value,
                    imputation_old: item.imputation,
                })
                .eq('id', item.id)

            if (error) throw error

            const { error: insertHistError } = await supabase
                .from('ses_histo')
                .insert({
                    id_user: userStore.id,
                    id_obj: route.params.id,
                    id_item: item.id,
                    action: 'Modification en masse de l\'imputation analytique de l\'article ' + item.num + ' dans la demande d\'achat numero ' + route.params.id,
                    niv_val: 0,
                    changement: 'Imputation analytique',
                    old_value: item.imputation,
                })

            if (insertHistError) throw insertHistError
        }

        ImputationMasseModif.value = ''
        closeModal('modMasseImputation')
        await getDemandeDetails()
        showAlert('Imputation analytique modifiée en masse avec succès !', 'Succès', 'success')
    } catch (error) {
        console.error('Erreur lors de la modification en masse de l\'imputation:', error)
        showAlert('Erreur lors de la modification en masse de l\'imputation.', 'Oops', 'danger')
    } finally {
        massImputationLoading.value = false
    }
}

// Watchers
watch(pdffournisseurSelected, (newValue) => {
    fournisseurPdfDetails.value = demande_details.value.filter(item => item.fournisseur2 === newValue)
    nifstat.value = fournisseurAfe.value.filter(item => item.nom === newValue)
    nif.value = nifstat.value[0]?nifstat.value[0].nif :''
    stat.value = nifstat.value[0]?nifstat.value[0].stat :''
}, { deep: true });

// LIFECYCLE HOOKS
onMounted(() => {
    getDemandeDetails();
    listImputation();
});
</script>
<style scoped>
    .table-custom {
        border: 1px solid #dee2e6;
    }
    .table-custom th {
        background-color: #f8f9fa;
        font-weight: 600;
    }
    .amount-column {
        text-align: right;
        font-weight: 500;
    }
</style>