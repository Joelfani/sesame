<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE</h1>
            <div class="">
                <button class="btn btn-outline-success" @click="exportToExcel">Exporter vers Excel</button>
                <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#afe" @click="initiliseFour()">A.F.E</button>
                <client-only>
                    <button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#bc" @click="initiliseFour()">Bon de commande</button>
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
                <!--
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
                -->
                <hr>
                <span v-if="pdfButtonLoading">Traitement ...</span>
                <button class="btn btn-outline-dark" @click="generatePDF('pdfbc','Bon de commande')" :disabled="pdfButtonLoading">Générer un BC</button>            
                <button class="btn btn-light" data-bs-dismiss="modal">Fermer</button>
            </div>
        </Modal>
        <!-- Contenu PDF caché  AFE-->
        <div v-if="pdf">
            <div id="pdfafe" style="width: 794px; padding: 40px; background: white;">
                
                <!-- ========== PAGE 1 ========== -->
                <div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <img src="/logo.png" style="width: 110px; height: 100px;">
                        <p style="font-weight: bold;">Association PROMotion Economique et Sociale (PROMES)</p>
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
                                    <tr v-for="N in 5"></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="m-3">
                        <h6><span style="font-weight: bold;">Affectation </span></h6>
                        <p><span v-for="detail in fournisseurPdfDetails" :key="detail.id">{{ detail.imputation }} - </span></p>
                    </div>
                    <div>
                        <div>
                            <h6><span style="font-weight: bold;">Le Responsable du programme</span></h6>
                        </div>
                        <br><br><br>
                        <div>
                            <h6><span style="font-weight: bold;">Nom et Date</span></h6>
                        </div>
                    </div>
                    <span style="font-size:xx-small; float: right;">Demande numéro {{ route.params.id }}</span>
                </div>

                <!-- ========== SAUT DE PAGE========== -->
                <div class="page-break"></div>

                <!-- ========== PAGE 2 ========== -->
                <div>
                    <div class="d-flex justify-content-around align-items-center">
                        <h5>PIECE D'ECRITURES</h5>
                    </div>
                    <div class="container mt-4">
                        <div class="table-responsive">
                            <table class="table table-bordered table-custom">
                                <thead>
                                    <tr>
                                        <th width="50%">Journal:</th>
                                        <th width="50%">N° de Pièce:</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th width="50%">Date:</th>
                                        <th width="50%">Emetteur:</th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="m-1">
                        <p><span style="font-weight: bold;">COMPTE GENERAL DEBIT: ...... </span></p>
                        <p><span style="font-weight: bold;">SECTION ANALYTIQUE: ....... </span></p>
                        <p><span style="font-weight: bold;">COMPTE GENERAL CREDIT: ....... </span></p>
                        <p><span style="font-weight: bold;">SECTION ANALYTIQUE: ....... </span></p>
                        <p><span style="font-weight: bold;">MONTANT (Ar): ....... </span></p>
                        <p><span style="font-weight: bold;">LIBELLE: ....... </span></p>
                        <p><span style="font-weight: bold;">REFERENCE: ....... </span></p>
                    </div>
                    <div class="d-flex justify-content-around align-items-center m-3">
                        <div>
                            <div>
                                <h6><span style="font-weight: bold;">Le Comptable</span></h6>
                            </div>
                            <br><br><br>
                            <div>
                                <h6><span style="font-weight: bold;">Nom et Date</span></h6>
                            </div>
                        </div>
                        <div>
                            <div>
                                <h6><span style="font-weight: bold;">Le Responsable Administratif et Financier </span></h6>
                            </div>
                            <br><br><br>
                            <div>
                                <h6><span style="font-weight: bold;">Nom et Date</span></h6>
                            </div>
                        </div>
                    </div>
                    <span style="font-size:xx-small; float: right;">Demande numéro {{ route.params.id }}</span>
                </div>
                
            </div>
        </div>
        <!-- Contenu PDF caché  BC-->
        <div v-if="pdf">
            <div id="pdfbc" style="width: 794px; padding: 40px; background: white; display: flex; flex-direction: column;">
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
                    <div class="d-flex justify-content-around align-items-center">
                        <h5><span style="font-weight: bold;">Objet : </span> {{ dataObj.nom }}</h5>
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
                                    <!-- Ligne Remise
                                    <tr>
                                        <td colspan="3" class="text-end fw-bold">Remise {{ remise }} %</td>
                                        <td class="amount-column">
                                            {{ mremise }}
                                        </td>
                                    </tr> -->
                                    <!-- Ligne MONTANT TTC -->
                                    <tr class="total-section">
                                        <td colspan="3" class="text-end fw-bold">MONTANT TTC</td>
                                        <td class="amount-column">{{ pdfDetailTotal  + mtaxe}}</td>
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
                    <span style="font-size:xx-small; float: right;">Demande numéro {{ route.params.id }}</span>
            </div>
        </div>
        </div>
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
//loading
const loading = ref(true);
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
              //- Number(mremise.value || 0)
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
                etat: item.niv_val == niveau.afe ? 0 : item.niv_val == niveau.refuse ? 2 : item.niv_val < niveau.afe ? 4 : 1, // Adapter pour le niveau admin achat
                delai: formatDate(item.delai), // Formatage de la date en jj/mm/aaaa
                // Mapper les champs pour l'affichage
                fournisseur2: item.fournisseur2?.nom || '',
                prix2: item.prixR || item.prix || 0,
                total2: item.totalR || item.total || 0,
            };
        });
        
        demande_details.value = allDataView;
        loading.value = false;
        // fournisseur pour AFE dont les articles sont au niv 3
        const filterdataforfourniseur = data.filter(item => item.niv_val != niveau.refuse && item.niv_val >= niveau.afe);

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
    
    console.log('Action de validation admin achat:', action);
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
            niv_val: niveau.afe + 1, // Passer au niveau suivant de validation (admin achat)
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
                niv_val:niveau.afe + 1,
            });

        if (insertHistError) throw insertHistError;
        
        console.log('Validation réussie pour l\'item:', item.id);
        showAlert('Validation réussie !', 'Succès', 'success');
    } catch (error) {
        console.error('Erreur lors de la validation:', error);
        showAlert('Erreur lors de la validation!', 'Oups!', 'danger');
    }
};

// Gestion du rejet 
const handleRejection = async (item, editableData) => {
    try {
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

        showAlert('Rejet réussi !', 'Succès', 'success');
    } catch (error) {
        console.error('Erreur lors du rejet :', error);
        showAlert('Erreur lors du rejet!', 'Oups!', 'danger');
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
const generatePDF = async (domname, namepdf) => {
    pdfButtonLoading.value = true
    
    // Validations
    if (domname === 'pdfafe' && !pdffournisseurSelected.value) {
        showAlert('Veuillez sélectionner un fournisseur avant de générer le PDF.', 'Oups', 'danger');
        pdfButtonLoading.value = false;
        return;
    }
    if (domname === 'pdfbc') {
        if (!pdffournisseurSelected.value) {
            showAlert('Veuillez sélectionner un fournisseur avant de générer le PDF.', 'Oups', 'danger');
            pdfButtonLoading.value = false;
            return;
        }
        if (!refBc.value || !paimentMode.value || !auNomDe.value) {
            showAlert('Veuillez remplir tous les champs obligatoires avant de générer le PDF.', 'Oups', 'danger');
            pdfButtonLoading.value = false;
            return;
        }
    }

    try {
        // Import dynamique
        const html2canvas = (await import('html2canvas')).default
        const { jsPDF } = await import('jspdf')

        const element = document.getElementById(domname)
        if (!element) {
            console.error(`Aucun élément avec id="${domname}" trouvé`)
            pdfButtonLoading.value = false
            return
        }

        // Créer le PDF
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        // Trouver tous les éléments avec la classe 'page-break'
        const pageBreaks = element.querySelectorAll('.page-break')
        
        if (pageBreaks.length === 0) {
            // ========== PAS DE SAUT DE PAGE : TOUT DANS UNE PAGE ==========
            const canvas = await html2canvas(element, { 
                scale: 1.5,
                useCORS: true,
                logging: false,
                windowWidth: 794,
                windowHeight: element.scrollHeight,
                letterRendering: true,
                dpi: 96
            })

            const imgData = canvas.toDataURL('image/png')
            const imgProps = pdf.getImageProperties(imgData)
            let imgWidth = pdfWidth
            let imgHeight = (imgProps.height * pdfWidth) / imgProps.width
            
            // Si le contenu dépasse la hauteur de la page, réduire pour faire tenir
            if (imgHeight > pdfHeight) {
                const scaleFactor = pdfHeight / imgHeight
                imgHeight = pdfHeight
                imgWidth = pdfWidth * scaleFactor
                
                // Centrer horizontalement si réduit
                const xOffset = (pdfWidth - imgWidth) / 2
                pdf.addImage(imgData, 'PNG', xOffset, 0, imgWidth, imgHeight)
            } else {
                // Si le contenu tient naturellement, le centrer légèrement
                const yOffset = (pdfHeight - imgHeight) / 6
                pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight)
            }
        } else {
            // ========== AVEC SAUTS DE PAGE : CHAQUE SECTION DANS UNE PAGE ==========
            const sections = []
            let currentSection = []
            
            // Séparer le contenu en sections
            Array.from(element.children).forEach(child => {
                if (child.classList.contains('page-break')) {
                    if (currentSection.length > 0) {
                        sections.push(currentSection)
                    }
                    currentSection = []
                } else {
                    currentSection.push(child)
                }
            })
            
            if (currentSection.length > 0) {
                sections.push(currentSection)
            }

            // Configuration pour l'adaptation automatique
            const MAX_CONTENT_HEIGHT_PERCENT = 95  // Maximum 95% de la page
            const MIN_CONTENT_HEIGHT_PERCENT = 40  // Minimum 40% de la page

            // Générer chaque section sur une page
            for (let i = 0; i < sections.length; i++) {
                // Créer un conteneur temporaire pour la section
                const tempContainer = document.createElement('div')
                tempContainer.style.width = '794px'
                tempContainer.style.padding = '40px'
                tempContainer.style.background = 'white'
                tempContainer.style.position = 'absolute'
                tempContainer.style.left = '-9999px'
                tempContainer.style.top = '0'
                tempContainer.style.margin = '0'
                
                sections[i].forEach(child => {
                    const clonedChild = child.cloneNode(true)
                    // Supprimer les marges top excessives
                    if (clonedChild.style) {
                        clonedChild.style.marginTop = '0'
                    }
                    tempContainer.appendChild(clonedChild)
                })
                
                document.body.appendChild(tempContainer)
                
                // Mesurer la hauteur réelle du contenu
                const contentHeight = tempContainer.scrollHeight
                
                // Capturer la section
                const canvas = await html2canvas(tempContainer, { 
                    scale: 1.5,
                    useCORS: true,
                    logging: false,
                    windowWidth: 794,
                    windowHeight: contentHeight,
                    letterRendering: true,
                    dpi: 96,
                    y: 0,
                    scrollY: 0
                })
                
                document.body.removeChild(tempContainer)
                
                const imgData = canvas.toDataURL('image/png')
                const imgProps = pdf.getImageProperties(imgData)
                
                if (i > 0) {
                    pdf.addPage()
                }
                
                // Calculer les dimensions
                let imgWidth = pdfWidth
                let imgHeight = (imgProps.height * pdfWidth) / imgProps.width
                
                // Hauteur maximale et minimale autorisée
                const maxAllowedHeight = pdfHeight * (MAX_CONTENT_HEIGHT_PERCENT / 100)
                const minAllowedHeight = pdfHeight * (MIN_CONTENT_HEIGHT_PERCENT / 100)
                
                let xOffset = 0
                let yOffset = 0
                
                if (imgHeight > maxAllowedHeight) {
                    // Contenu trop grand : réduire pour faire rentrer dans MAX_CONTENT_HEIGHT_PERCENT
                    const scaleFactor = maxAllowedHeight / imgHeight
                    imgHeight = maxAllowedHeight
                    imgWidth = pdfWidth * scaleFactor
                    
                    // Centrer horizontalement
                    xOffset = (pdfWidth - imgWidth) / 2
                    
                    // Petit offset du haut
                    yOffset = (pdfHeight - imgHeight) / 10
                } else if (imgHeight < minAllowedHeight) {
                    // Contenu trop petit : garder la taille naturelle mais centrer
                    yOffset = (pdfHeight - imgHeight) / 3
                } else {
                    // Taille OK : léger offset du haut
                    yOffset = (pdfHeight - imgHeight) / 6
                }
                
                pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight)
            }
        }
        
        // Sauvegarder le PDF
        const name = `${namepdf}.pdf`
        pdf.save(name)
        
        showAlert('PDF généré avec succès !', 'Succès', 'success')
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error)
        showAlert('Erreur lors de la génération du PDF.', 'Oups', 'danger')
    } finally {
        pdfButtonLoading.value = false
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
            'Fournisseur Réel':item.fournisseur|| '',
            'Prix Réel': item.prixR || '',
            'Montant Réel': item.totalR || '',
            'Statut': item.niv_val == niveau.afe ? 'En attente de votre validation' : item.niv_val == niveau.refuse ? 'Rejeté' : item.niv_val < niveau.afe ? 'Validation pas encore a votre niveau' : 'Validé',
        }));

        const nameExcel = `Details_de_la_Demande_Num_${route.params.id}`

        await exportExcel(exportData, nameExcel);
        
    } catch (error) {
        console.error('Erreur lors de l\'exportation vers Excel:', error);
        showAlert('Erreur lors de l\'exportation vers Excel.', 'Oops', 'danger');
    }
};
const initiliseFour = () =>{
    pdffournisseurSelected.value = ''
}
// Watchers
watch(pdffournisseurSelected, (newValue) => {
    fournisseurPdfDetails.value = demande_details.value.filter(item => item.fournisseur2 === newValue && item.niv_val != niveau.refuse && item.niv_val >= niveau.afe)
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
    /* Ajoutez ces styles dans votre <style scoped> */

/* Marqueur de saut de page (invisible à l'écran) */
.page-break {
    display: none; /* Invisible dans le navigateur */
    height: 0;
    margin: 0;
    padding: 0;
}

/* Styles spécifiques pour les conteneurs PDF */
#pdfafe, #pdfbc {
    font-family: Arial, sans-serif;
    font-size: 12pt; /* Taille fixe en points */
    line-height: 1.4;
    color: #000;
}

#pdfafe h4, #pdfbc h4 {
    font-size: 16pt;
    margin: 10px 0;
}

#pdfafe h5, #pdfbc h5 {
    font-size: 13pt;
    margin: 8px 0;
}

#pdfafe h6, #pdfbc h6 {
    font-size: 11pt;
    margin: 6px 0;
}

#pdfafe p, #pdfbc p {
    font-size: 12pt;
    margin: 4px 0;
}

/* Styles pour les tableaux dans les PDFs */
#pdfafe .table-custom,
#pdfbc .table-custom {
    font-size: 11pt;
}

#pdfafe .table-custom th,
#pdfbc .table-custom th {
    font-size: 11pt;
    font-weight: 600;
    padding: 8px;
}

#pdfafe .table-custom td,
#pdfbc .table-custom td {
    font-size: 10pt;
    padding: 6px;
}

/* Pour éviter que le texte ne soit coupé */
#pdfafe *, #pdfbc * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

/* Assurer que les images gardent leur taille */
#pdfafe img, #pdfbc img {
    max-width: 100%;
    height: auto;
}
</style>