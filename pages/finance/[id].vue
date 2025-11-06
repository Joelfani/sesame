<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE</h1>
            <div class="">
                <button class="btn btn-outline-success" @click="exportToExcel">Exporter vers Excel</button>
                <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#afe">A.F.E</button>
                <client-only>
                    <button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#bc">Bon de commande</button>
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
                <label >Sélectionnez un fournisseur</label>
                <select
                    class="form-control"
                    v-model="pdffournisseurSelected"
                >
                    <option v-for="option in fournisseurAfe" :key="option.id" :value="option.nom">
                        {{ option.nom }}
                    </option>
                </select>
                <hr>
                <span v-if="pdfButtonLoading">Traitement ...</span>
                <button class="btn btn-outline-dark" @click="generatePDF('pdfafe','AFE')" :disabled="pdfButtonLoading">Générer un AFE</button>            
                <button class="btn btn-light" data-bs-dismiss="modal">Fermer</button>
            </div>
        </Modal>
        <!-- Modal BC -->
        <Modal id="bc" title="Bon de commande">
            <div class="pdf-content">
                <label >Sélectionnez un fournisseur</label>
                <select
                    class="form-control"
                    v-model="pdffournisseurSelected"
                >
                    <option v-for="option in fournisseurAfe" :key="option.id" :value="option.nom">
                        {{ option.nom }}
                    </option>
                </select>
                <label for="">Référence</label>
                <input type="text" class="form-control" v-model="refBc">
                <label for="">Mode de paiement</label>
                <input type="text" class="form-control" v-model="paimentMode">
                <label for="">Au nom de:</label>
                <input type="text" class="form-control" v-model="auNomDe">
                <label for="">Taxe:</label>
                <Cleave 
                    class="form-control" 
                    v-model="taxe" 
                    :options="{ 
                        numeral: true, 
                        delimiter: ' ', // espace comme séparateur
                        numeralThousandsGroupStyle: 'thousand' }" 
                    placeholder="Entrez le taux"
                />
                <label for="">Remise:</label>
                <Cleave 
                    class="form-control" 
                    v-model="remise" 
                    :options="{ 
                        numeral: true, 
                        delimiter: ' ', // espace comme séparateur
                        numeralThousandsGroupStyle: 'thousand' }"
                    placeholder="Entrez le taux"

                />
                <hr>
                <span v-if="pdfButtonLoading">Traitement ...</span>
                <button class="btn btn-outline-dark" @click="generatePDF('pdfbc','Bon de commande')" :disabled="pdfButtonLoading">Générer un BC</button>            
                <button class="btn btn-light" data-bs-dismiss="modal">Fermer</button>
            </div>
        </Modal>
        <!-- Contenu PDF caché  AFE-->
        <div v-if="pdf">
            <div id="pdfafe" style="width: 794px; min-height: 1123px; padding: 20px; background: white; display: flex; flex-direction: column;">
                <!-- Contenu principal qui prend l'espace disponible -->
                <div style="flex: 1;">
                    <div class="d-flex justify-content-between align-items-center mt-5">
                        <img src="/logo.png" style="width: 110px; height: 100px;">
                        <p style="font-weight: bold;"> Association PROMotion Economique et Sociale (PROMES)</p>
                    </div>
                    <div class="d-flex justify-content-around align-items-center">
                        <h4 style="font-weight: bold;">Autorisation formelle d'engagement</h4>
                    </div>
                    <div class="d-flex justify-content-around align-items-center">
                        <h5><span style="font-weight: bold;">Objet : </span> {{ dataObj.nom }}</h5>
                    </div>
                    <div class="d-flex justify-content-around align-items-center m-3">
                        <h5><span style="font-weight: bold;">Date : </span> {{ date }}</h5>
                        
                        <h5><span style="font-weight: bold;">Fournisseur : </span> {{ pdffournisseurSelected }}</h5>
                    </div>
                    <div class="container mt-4">
                        <div class="table-responsive">
                            <table class="table table-bordered table-custom">
                                <thead>
                                    <tr>
                                        <th width="40%">Designation</th>
                                        <th width="15%">Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="detail in fournisseurPdfDetails" :key="detail.id">
                                        <td>{{ detail.designation }}</td>
                                        <td class="amount-column">{{ detail.totalR }}</td>
                                    </tr>
                                    <tr class="total-section">
                                        <td colspan="1" class="text-end fw-bold">Total</td>
                                        <td class="amount-column">{{ pdfDetailTotal }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="m-3">
                        <h6><span style="font-weight: bold;">Affectation </span></h6>
                        <p v-for="detail in fournisseurPdfDetails" :key="detail.id">{{ detail.imputation }}</p>
                    </div>
                </div>
                
                <!-- Section qui reste en bas -->
                <div style="margin-top: auto;">
                    <div class="m-3">
                        <h6><span style="font-weight: bold;">Le Responsable du programme</span></h6>
                    </div>
                    <br><br><br>
                    <div class="m-3">
                        <h6><span style="font-weight: bold;">Nom et Date</span></h6>
                    </div>
                </div>
            </div>
        </div>
        <!-- Contenu PDF caché  BC-->
        <div v-if="pdf">
            <div id="pdfbc" style="width: 794px; min-height: 1123px; padding: 20px; background: white; display: flex; flex-direction: column;">
                <!-- Contenu principal qui prend l'espace disponible -->
                <div style="flex: 1;">
                    
                        <img src="/logo.png" style="width: 110px; height: 100px;" class="m-3">
                        <p style="font-weight: bold;">ASSOCIATION PROMES</p>
                        <p style="font-weight: bold;">Enceinte UCM Ambatoroka</p>
                        <p style="font-weight: bold;">101 ANTANANARIVO</p>
                        <p style="font-weight: bold;">NIF : 4000232696</p>
                        <p style="font-weight: bold;">STAT : 8899 11 2013 003715</p>
                        <p style="font-weight: bold;">TEL : 034 28 072 55</p>

                    <div class="d-flex justify-content-around align-items-center">
                        <h4 style="font-weight: bold;">BON DE COMMANDE REF {{ refBc }}</h4>
                    </div>
                    <div class="d-flex justify-content-end m-3">
                        <div class="">
                            <h5> {{ pdffournisseurSelected }} </h5>
                            <h5><span style="font-weight: bold;">NIF :</span> {{ nif }}</h5>
                            <h5><span style="font-weight: bold;">STAT :</span> {{ stat }}</h5>
                        </div>
                    </div>
                    <div class="container mt-4">
                        <div class="table-responsive">
                            <table class="table table-bordered table-custom">
                                <thead>
                                    <tr>
                                        <th width="40%">Désignation</th>
                                        <th width="15%">Unité</th>
                                        <th width="20%">Prix unitaire</th>
                                        <th width="25%">MONTANT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="detail in fournisseurPdfDetails" :key="detail.id">
                                        <td>{{ detail.designation }}</td>
                                        <td>{{ detail.qte }}</td>
                                        <td>{{ detail.prixR }}</td>
                                        <td class="amount-column">{{ detail.totalR }}</td>
                                    </tr>
                                    <!-- Ligne taxe -->
                                    <tr>
                                        <td colspan="3" class="text-end fw-bold">MONTANT HT</td>
                                        <td class="amount-column">
                                            {{ pdfDetailTotal }}
                                        </td>
                                    </tr>
                                    <!-- Ligne taxe -->
                                    <tr>
                                        <td colspan="3" class="text-end fw-bold">Taxe {{ taxe }}%</td>
                                        <td class="amount-column">
                                            {{ mtaxe }}
                                        </td>
                                    </tr>
                                    <!-- Ligne Remise -->
                                    <tr>
                                        <td colspan="3" class="text-end fw-bold">Remise {{ remise }} %</td>
                                        <td class="amount-column">
                                            {{ mremise }}
                                        </td>
                                    </tr>
                                    <!-- Ligne MONTANT TTC -->
                                    <tr class="total-section">
                                        <td colspan="3" class="text-end fw-bold">MONTANT TTC</td>
                                        <td class="amount-column">{{ pdfDetailTotal  + mtaxe - mremise }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <p style="font-weight: bold;">Mode de paiement par {{ paimentMode }} au nom de {{ auNomDe }}</p>
                    <p style="font-weight: bold;">Arrêté à la somme de {{ nbrWord }} Ariary</p>
                    <p style="font-weight: bold;">A Antananarivo, le {{ date }}</p>
                    <br><br><br>
                    <p style="font-weight: bold;">Le client / PROMES</p>
            </div>
        </div>
    </div>
    <!-- Modal neutre type 4 -->
        <Modal id="modDoc" title="Liste des documents associés">
            
                <div class="text-center">
                    
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
import n2words from 'n2words'
import Cleave from 'vue-cleave-component'
import {exportExcel} from '~/assets/js/export.js';
// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
const route = useRoute();

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
                etat: item.niv_val == 3 ? 0 : item.niv_val == 8 ? 2 : item.niv_val < 3 ? 4 : 1, // Adapter pour le niveau finance
                delai: formatDate(item.delai), // Formatage de la date en jj/mm/aaaa
                // Mapper les champs pour l'affichage
                fournisseur2: item.fournisseur2?.nom || '',
                prix2: item.prixR || item.prix || 0,
                total2: item.totalR || item.total || 0,
            };
        });
        
        demande_details.value = allDataView;
        // fournisseur pour AFE dont les articles sont au niv 3
        const filterdataforfourniseur = data.filter(item => item.niv_val == 3);

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
        
        // Enregistrement dans historique

        const { error: insertHistError } = await supabase
            .from('ses_histo')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                id_item: item.id,
                action: 'Validation de l\'article '+ item.num + ' dans la demande d\'achat numero ' + route.params.id,
                niv_val:4
            });

        if (insertHistError) throw insertHistError;
        
        console.log('Validation financière réussie pour l\'item:', item.id);
        
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
        
        console.log('Rejet financier réussi pour l\'item:', item.id);
        
    } catch (error) {
        console.error('Erreur lors du rejet financier:', error);
        showAlert('Erreur lors du rejet financier !', 'Oups!', 'danger');
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
            'Montant Réel': item.totalR || ''
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