<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE</h1>
            <div class="">
                <button class="btn btn-outline-success">Exporter vers Excel</button>
                <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#afe" @click="recoreryFournisseur">A.F.E</button>
                <client-only>
                    <button class="btn btn-outline-secondary" @click="generatePDF">Bon de commande</button>
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
                    { label: 'Document', color: 'outline-dark' , active_modal:true, type_modal:4, }
                ]"
                title_modal_neutre="Liste des documents associés"
                @validation_action="handleValidationAction"
                @editable_field_change="handleEditableFieldChange"
                @function_but_neutre = "doc_recovery"
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

        <!-- Modal AFE -->
        <Modal id="afe" title="Autorisation formelle d'engagement">
            <div class="pdf-content">
                <select
                    class="form-control"
                    v-model="pdffournisseurSelected"
                >
                    <option v-for="option in fournisseurAfe" :key="option.id" :value="option.nom">
                        {{ option.nom }}
                    </option>
                </select>
            </div>
        </Modal>
        <div v-if="pdf">
            <div id="pdf" style="width: 794px; min-height: 1123px; padding: 20px; background: white;">
                <div class="d-flex justify-content-between align-items-center mt-5">
                    <img src="/logo.png" style="width: 110px; height: 100px;">
                    <p> Association PROMotion Economique et Sociale (PROMES)</p>
                </div>
                <div class="d-flex  justify-content-around align-items-center">
                    <h4>Autorisation formelle d'engagement</h4>
                </div>
                <div class="d-flex  justify-content-around align-items-center m-3">
                    <h5>Date : {{ date }}</h5>
                    <h5>Fournisseur : {{ pdffournisseur }}</h5>
                </div>
                <div class="d-flex  justify-content-around align-items-center m-3">
                    <h6>Description</h6>
                    <h6>Montant</h6>
                </div>
                <div v-for="detail in fournisseurPdfDetails" :key="detail.id" class="d-flex  justify-content-around align-items-center m-3">
                    <p>{{ detail }}</p>
                    <p>{{ }}</p>
                </div>
            </div>
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
const isLoading = ref(false)

//data for pdf
const pdf = ref(true)
const date = ref(new Date().toLocaleDateString())
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
            .select('*, fournisseur(nom), fournisseur2(nom,id)')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true });
        
        if (error) throw error;
        
        const allDataView = data.map(item => {
            return {
                ...item,
                fournisseur: item.fournisseur?.nom || '', // récupérer le nom du fournisseur
                etat: item.niv_val == 3 ? 0 : item.niv_val == 8 ? 2 : 1, // Adapter pour le niveau finance
                delai: formatDate(item.delai), // Formatage de la date en jj/mm/aaaa
                // Mapper les champs pour l'affichage
                fournisseur2: item.fournisseur2?.nom || '',
                prix2: item.prixR || item.prix || 0,
                total2: item.totalR || item.total || 0,
            };
        });
        
        demande_details.value = allDataView;

        const fournisseurForAfe = data.map(item => {
            return {
                nom: item.fournisseur2?.nom || '',
                id: item.fournisseur2?.id || null,
            };
        })

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
    }
};

// Gestion de la validation
const handleValidation = async (item, editableData) => {
    try {
        console.log('Validation financière de l\'item:', item.id);
        console.log('Avec les données éditables:', editableData.fields);
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: 4, // Passer au niveau suivant de validation (DPR)
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
        
        console.log('Validation financière réussie pour l\'item:', item.id);
        alert('Item validé avec succès par le responsable financier !');
        
    } catch (error) {
        console.error('Erreur lors de la validation financière:', error);
        alert('Erreur lors de la validation financière !');
    }
};

// Gestion du rejet 
const handleRejection = async (item, editableData) => {
    try {
        console.log('Rejet financier de l\'item:', item.id);
        console.log('Avec les données éditables:', editableData.fields);
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: 8, // Statut rejeté (rejet général)
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
        
        console.log('Rejet financier réussi pour l\'item:', item.id);
        alert('Item rejeté par le responsable financier !');
        
    } catch (error) {
        console.error('Erreur lors du rejet financier:', error);
        alert('Erreur lors du rejet financier !');
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
// Pour les documents associés
const doc_recovery = async (item) =>{
    //Recuperation des documents
    try{
        const { data, error } = await supabase
        .from('ses_doc_achat')
        .select('*')
        .eq('id_item', item.id)

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

// Configuration du formulaire d'AFE
const inputAfe = computed(() => [
    {
        id: 'fournisseur',
        type: 'select',
        label: 'Sélectionnez le fournisseur',
        required: true,
        options: fournisseurAfe.value.map(item => ({
            value: item.id,
            text: item.nom
        })),
        initialValue: ''
    },
])
// PDF
const generatePDF = async () => {

    // Import dynamique uniquement côté client
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const element = document.getElementById('pdf') // capture le DOM 
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
    pdf.save('AFE.pdf')
}
// Watchers
watch(pdffournisseurSelected, (newValue) => {
    fournisseurPdfDetails.value = demande_details.value.filter(item => item.fournisseur2 === newValue)
    console.log('test', fournisseurPdfDetails.value);
}, { deep: true });

// LIFECYCLE HOOKS
onMounted(() => {
    getDemandeDetails();
});
</script>