<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE</h1>
            <div class="">
                <button class="btn btn-outline-success" @click="exportToExcel">Exporter vers Excel</button>
                <client-only>
                    <button class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#modDoc" @click="doc_recovery({id:route.params.id})">Liste document</button>
                </client-only>
                
            </div>
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
                    { label: 'Retour vers Achat', color: 'primary'},
                ]"
                title_modal_neutre="Liste des documents associés"
                @validation_action="handleValidationAction"
                @editable_field_change="handleEditableFieldChange"
                @function_but_neutre = "doc_recovery"
                :loading="loading"
            >
                <template #modal4="{ item }">
                    <p v-for="doc in doc_achat" :key="doc.id" style="font-weight: bold;">
                        {{ doc.name_doc }}
                        <button class="btn btn-outline-secondary" @click="downloadFile(doc.name_doc, doc.nameStorage)"><img src="/public/icon/download.png" style="width: 20px; height: 20px;"></button>
                    </p>
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
// Référence vers le composant Table
const tableRef = ref(null);

// Définition des colonnes du tableau
const columns = [
    { key: 'num', label: 'N°'},
    ...tableTete.filter(col => col.key !== 'id'), // Exclure la colonne 'id'
    { key: 'imputation', label: 'Imputation analytique' },
    { key: 'fournisseur2', label: 'Fournisseur Réel' },
    { key: 'prixR', label: 'Prix Réel' },
    { key: 'totalR', label: 'Montant Réel' }, 
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
                etat: item.niv_val == niveau.finance ? 0 : item.niv_val == niveau.refuse ? 2 : item.niv_val < niveau.finance ? 4 : 1, // Adapter pour le niveau finance
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

        console.log('afe', fournisseurAfe.value);
        
        
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
    
    console.log('Action de validation finance:', action);
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
    } else if (action === 'Retour vers Achat') {
        await handleReturnToPurchase(item, editableData);
    }
};

// Gestion de la validation
const handleValidation = async (item, editableData) => {
    try {
        console.log('Validation financière de l\'item:', item.id);
        console.log('Avec les données éditables:', editableData.fields);
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: niveau.finance + 1, // Passer au niveau suivant de validation (DPR)
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
                niv_val:niveau.finance + 1,
            });

        if (insertHistError) throw insertHistError;
        
        console.log('Validation financière réussie pour l\'item:', item.id);
        showAlert('Validation financière réussie !', 'Succès', 'success');
    } catch (error) {
        console.error('Erreur lors de la validation financière:', error);
        showAlert('Erreur lors de la validation financière !', 'Oups!', 'danger');
    }
};

// Gestion du rejet 
const handleRejection = async (item, editableData) => {
    try {
        console.log('Rejet financier de l\'item:', item.id);
        console.log('Avec les données éditables:', editableData.fields);
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: niveau.refuse, // Statut rejeté (rejet général)
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
        
        console.log('Rejet financier réussi pour l\'item:', item.id);
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
        
        console.log('Retour vers achat réussi pour l\'item:', item.id);
        showAlert('Renvoi vers responsable d\'achat réussi !', 'Succès', 'success');
    } catch (error) {
        console.error('Erreur lors du retour financier:', error);
        showAlert('Erreur lors du renvoi financier !', 'Oups!', 'danger');
    }
}
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
// PDF
const generatePDF = async (domname,namepdf) => {
    pdfButtonLoading.value = true
    if (domname === 'pdfafe' && !pdffournisseurSelected.value) {
        showAlert('Veuillez sélectionner un fournisseur avant de générer le PDF.', 'Oups', 'danger');
        pdfButtonLoading.value = false;
        return;
    }
    if (domname === 'pdfbc' && !pdffournisseurSelected.value) {
        showAlert('Veuillez sélectionner un fournisseur avant de générer le PDF.', 'Oups', 'danger');
        pdfButtonLoading.value = false;
        return;
    }
    if (domname === 'pdfbc' && !refBc.value) {
        showAlert('Veuillez entrer une référence avant de générer le PDF.', 'Oups', 'danger');
        pdfButtonLoading.value = false;
        return;
    }
    if (domname === 'pdfbc' && !paimentMode.value) {
        showAlert('Veuillez entrer un mode de paiement avant de générer le PDF.', 'Oups', 'danger');
        pdfButtonLoading.value = false;
        return;
    }
    if (domname === 'pdfbc' && !auNomDe.value) {
        showAlert('Veuillez entrer un nom avant de générer le PDF.', 'Oups', 'danger');
        pdfButtonLoading.value = false;
        return;
    }
    // Import dynamique uniquement côté client
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const element = document.getElementById(domname) // capture le DOM 
    if (!element) {
        console.error('Aucun élément avec id="pdf" trouvé')
        return
    }

    const canvas = await html2canvas(element, { scale: 2 }) // convertir le DOM en image et rend la resolution plus nette avec le scale x2
    const imgData = canvas.toDataURL('image/png') // convertir l'image en binaire

    const pdf = new jsPDF('p', 'mm', 'a4') // creation du pdf: p=portrait, mm=mm, a4=taille de la page

    //convertion de l'image en pdf avec la taille ideale 
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    const name = namepdf + '.pdf'
    pdf.save(name)
    pdfButtonLoading.value = false  
    
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
            'Fournisseur Réel':item.fournisseur|| '',
            'Prix Réel': item.prixR || '',
            'Montant Réel': item.totalR || '',
            'Statut': item.niv_val == niveau.finance ? 'En attente de votre validation' : item.niv_val == niveau.refuse ? 'Rejeté' : item.niv_val < niveau.finance ? 'Validation pas encore a votre niveau' : 'Validé',
        }));

        const nameExcel = `Details_de_la_Demande_Num_${route.params.id}`

        await exportExcel(exportData, nameExcel);
        
    } catch (error) {
        console.error('Erreur lors de l\'exportation vers Excel:', error);
        showAlert('Erreur lors de l\'exportation vers Excel.', 'Oops', 'danger');
    }
};
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