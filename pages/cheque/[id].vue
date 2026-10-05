<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE</h1>
            <div>
                <button class="btn btn-outline-secondary" @click="devTab">{{ dev ? 'Réduire le tableau': 'Développer le tableau' }}</button>
                <button class="btn btn-outline-success" @click="exportToExcel">Exporter vers Excel</button>
                <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#cheque" @click="initialiseFournisseur()">Émettre chèque par fournisseur</button>
            </div>
            <div class="link_demande">
            </div>
        </div>

        <!-- Modal Émission Chèque PAR FOURNISSEUR
             Le chèque saisi (num + date + montant) est dupliqué à l'identique
             sur CHAQUE article du fournisseur sélectionné, via ChequeManagerPanel
             (voir ce composant pour le détail). Cette action n'avance PAS le
             niveau des articles : il faudra ensuite cliquer "Valider" sur
             chaque ligne individuellement (cf. commentaire sur handleValiderLigne). -->
        <Modal id="cheque" title="Émission de chèque par fournisseur">
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

                <div v-if="fournisseurSelected">
                    <div class="alert alert-info" v-if="articlesAffiches.length > 0">
                        <strong>Articles concernés :</strong> {{ articlesAffiches.length }} article(s)
                        <ul class="mt-2 mb-0">
                            <li v-for="article in articlesAffiches" :key="article.id">
                                {{ article.num }} - {{ article.designation }} ({{ article.totalR }} Ar)
                            </li>
                        </ul>
                        <strong>Total des prix :</strong> {{ totalArticles }} Ar
                    </div>
                    <div v-else class="alert alert-warning">
                        Aucun article éligible pour ce fournisseur (niveau pas encore atteint, ou déjà rejeté).
                    </div>

                    <!-- Panneau de gestion des chèques, partagé par tous les
                         articles du fournisseur sélectionné -->
                    <ChequeManagerPanel
                        v-if="articlesAffiches.length > 0"
                        :item-ids="articlesAffiches.map(a => a.id)"
                        @updated="getDemandeDetails"
                    />
                </div>

                <hr>
                <button class="btn btn-light" data-bs-dismiss="modal">Fermer</button>
            </div>
        </Modal>

        <!-- Modal Gestion des chèques POUR UNE SEULE LIGNE
             Ouvert dynamiquement (voir openLigneChequeModal) plutôt que via
             data-bs-toggle statique, car l'item concerné change selon la
             ligne du tableau cliquée. -->
        <button
            ref="chequeLigneTrigger"
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#chequeLigneModal"
            style="display: none;"
        ></button>

        <Modal id="chequeLigneModal" :title="`Gestion des chèques — Article n°${selectedLigneNum}`">
            <div class="pdf-content">
                <!-- v-if évite de monter le panneau tant qu'aucune ligne n'est
                    sélectionnée (itemIds vide) -->
                <ChequeManagerPanel
                    v-if="selectedLigneItemId"
                    :item-ids="[selectedLigneItemId]"
                    @updated="getDemandeDetails"
                />

                <hr>
                <button class="btn btn-light" data-bs-dismiss="modal">Fermer</button>
            </div>
        </Modal>

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
                    { label: 'Gérer chèques', color: 'primary' },
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
import { tableTete, niveau } from '~/assets/js/CommonVariable.js';
import { exportExcel } from '~/assets/js/export.js';

// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
const route = useRoute();

// Loading
const loading = ref(true);

// Référence vers le composant Table
const tableRef = ref(null);

// Définition des colonnes du tableau
// ⚠️ 'num_cheque' et 'date_emission_cheque' retirés : ces informations
// vivent maintenant dans ses_chequeList (potentiellement plusieurs chèques
// par article) et se gèrent via le bouton "Gérer chèques", pas en édition
// inline. 'observation_cheque' reste INCHANGÉ (commentaire du responsable
// chèque sur l'article, pas lié à un chèque précis).
const columns = [
    { key: 'num', label: 'N°'},
    ...tableTete.filter(col => col.key !== 'id' && col.key !== 'com' && col.key !== 'motif'),
    { key: 'com', label: 'Commentaire',style: {minWidth: '350px'}},
    { key: 'imputation', label: 'Imputation analytique' },
    { key: 'fournisseur2', label: 'Fournisseur Réel' },
    { key: 'prixR', label: 'Prix Réel' },
    { key: 'totalR', label: 'Montant Réel' },
    { key: 'com_achat', label: 'Commentaire de l\' acheteur',style: {minWidth: '350px'}},
    { key: 'com_fin', label: 'Commentaire de la finance',style: {minWidth: '350px'}},
    { key: 'com_cg', label: 'Commentaire du contrôleur de gestion',style: {minWidth: '350px'}},
    { key: 'observation_dpr', label: 'Observation DPR'},
    { key: 'motif', label: 'Motif de rejet ',editable: true, type: 'textarea' , style: {minWidth: '350px'}},
    // Colonne informative (lecture seule) : nombre de chèques déjà affectés
    // à cet article — sert aussi de repère visuel pour savoir si "Valider"
    // est utilisable (il faut au moins 1 chèque).
    { key: 'nb_cheques', label: 'Nb. chèques' },
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
    ...tableTete.filter(col => col.key !== 'id' && col.key !== 'spec' && col.key !== 'fournisseur' && col.key !== 'prix' && col.key !== 'delai' && col.key !== 'total' && col.key !== 'com'  && col.key !== 'motif'), // Exclure la colonne
    { key: 'imputation', label: 'Imputation analytique' },
    { key: 'fournisseur2', label: 'Fournisseur Réel' },
    { key: 'prixR', label: 'Prix Réel' },
    { key: 'totalR', label: 'Montant Réel' },
    { key: 'observation_dpr', label: 'Observation DPR'},
    { key: 'motif', label: 'Motif de rejet ',editable: true, type: 'textarea' , style: {minWidth: '350px'}},
    { key: 'nb_cheques', label: 'Nb. chèques' },
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
// Données du modal fournisseur (seule la sélection reste ici, la gestion
// du chèque lui-même est déléguée à ChequeManagerPanel)
const fournisseurSelected = ref('');
const fournisseurList = ref([]);

// Sélection courante pour le modal "chequeLigneModal" (une seule ligne)
const selectedLigneItemId = ref(null);
const selectedLigneNum = ref(null);
// Référence vers le bouton caché déclencheur du modal
const chequeLigneTrigger = ref(null)

// Alert system
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: ''
});

// Articles affichés pour le fournisseur sélectionné (critère d'éligibilité
// inchangé : pas rejeté, et déjà au niveau "chèque" ou au-delà)
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

// Réinitialise la sélection du modal fournisseur à l'ouverture
const initialiseFournisseur = () => {
    fournisseurSelected.value = '';
}

// Ouvre le modal "Gérer chèques" pour UNE ligne précise du tableau.
// On met d'abord à jour la ligne sélectionnée, on attend que le DOM se
// mette à jour (nextTick), PUIS on simule un clic sur le bouton caché —
// c'est ce clic qui déclenche l'ouverture Bootstrap, sans aucun import JS.
const openLigneChequeModal = (item) => {
    selectedLigneItemId.value = item.id
    selectedLigneNum.value = item.num

    nextTick(() => {
        chequeLigneTrigger.value?.click()
    })
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

        // Récupère, en une seule requête groupée, le nombre de chèques déjà
        // enregistrés par article (ses_chequeList n'a plus de colonnes sur
        // ses_demItems directement) — sert à la colonne "Nb. chèques" et,
        // indirectement, à comprendre pourquoi "Valider" peut être bloqué.
        const itemIds = data.map(item => item.id);
        let chequeCountMap = {};
        if (itemIds.length > 0) {
            const { data: chequeRows, error: chequeErr } = await supabase
                .from('ses_chequeList')
                .select('id_item')
                .in('id_item', itemIds);
            if (chequeErr) throw chequeErr;

            (chequeRows || []).forEach(row => {
                chequeCountMap[row.id_item] = (chequeCountMap[row.id_item] || 0) + 1;
            });
        }
        
        const allDataView = data.map(item => {
            return {
                ...item,
                fournisseur: item.fournisseur?.nom || '',
                etat: item.niv_val == niveau.cheque ? 0 : item.niv_val == niveau.refuse ? 2 : item.niv_val < niveau.cheque ? 4 : 1,
                delai: formatDate(item.delai),
                fournisseur2: item.fournisseur2?.nom || '',
                prix2: item.prixR || item.prix || 0,
                total2: item.totalR || item.total || 0,
                nb_cheques: chequeCountMap[item.id] || 0,
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

// Gestionnaire principal pour les actions de validation (une ligne à la fois)
const handleValidationAction = async (validationPayload) => {
    const { action, item, editableData, rowIndex } = validationPayload;
    
    validationData.value = {
        action: action,
        itemId: item.id,
        originalItem: { ...item },
        editableFields: editableData.fields,
        timestamp: new Date().toISOString()
    };
    
    if (action === 'Gérer chèques') {
        // Ouvre simplement le modal de gestion des chèques pour cette ligne
        // — aucune écriture ici, tout se passe dans ChequeManagerPanel.
        openLigneChequeModal(item);
    } else if (action === 'Valider') {
        await handleValiderLigne(item, editableData);
    } else if (action === 'Rejeter') {
        if(editableData.fields.motif === undefined || editableData.fields.motif === null || editableData.fields.motif === ''){
            showAlert('Veuillez fournir un motif de rejet avant de rejeter l\'article.', 'Oops', 'danger');
            return;
        }else{
            await handleRejection(item, editableData);
        }
    }
};

// Validation d'une ligne : fait avancer niv_val, MAIS seulement si au
// moins un chèque existe déjà pour cet article dans ses_chequeList.
// On revérifie en base au moment du clic (plutôt que de se fier au
// compteur nb_cheques déjà chargé) pour éviter un état périmé si l'écran
// n'a pas été rafraîchi entre l'ajout du chèque et le clic sur "Valider".
const handleValiderLigne = async (item, editableData) => {
    try {
        const { count, error: countError } = await supabase
            .from('ses_chequeList')
            .select('id', { count: 'exact', head: true })
            .eq('id_item', item.id);
        if (countError) throw countError;

        if (!count || count === 0) {
            showAlert(
                'Impossible de valider : aucun chèque n\'est affecté à cet article. Utilisez "Gérer chèques" d\'abord.',
                'Oops',
                'danger'
            );
            return;
        }

        // ...editableData.fields reprend ici uniquement les champs encore
        // éditables inline (ex: observation_cheque), num_cheque et
        // date_emission_cheque n'existant plus comme colonnes de la table.
        const updateData = {
            niv_val: niveau.cheque + 1,
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
                action: 'Validation (chèque) de l\'article '+ item.num + ' dans la demande d\'achat numéro ' + route.params.id,
                niv_val: niveau.cheque + 1,
                type: 'fin'
            });

        if (insertHistError) throw insertHistError;
        
        showAlert('Article validé avec succès !', 'Succès', 'success');
    } catch (error) {
        console.error('Erreur lors de la validation:', error);
        showAlert('Erreur lors de la validation !', 'Oops', 'danger');
    }
};

// Gestion du rejet (inchangé)
const handleRejection = async (item, editableData) => {
    try {
        const updateData = {
            niv_val: niveau.refuse,
            user_refuse: userStore.id, // ID de l'utilisateur qui rejette
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
            'Tiger': item.num_tiger || '-',
            'Fournisseur Réel': item.fournisseur2 || '',
            'Prix Réel': item.prixR || '',
            'Montant Réel': item.totalR || '',
            'Observation DPR': item.observation_dpr || '',
            'Nb. chèques': item.nb_cheques || 0,
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

//Calcul du total des articles affichés pour le fournisseur sélectionné
const totalArticles = computed(() => {
    return articlesAffiches.value.reduce((total, article) => {
        return total + (article.totalR || 0);
    }, 0);
}); // reduce => permet de transfomer un tableau en une seule valeur (ici la somme des totaux des articles)
    // array.reduce((accumulateur(valeur actuel dans la boucle), valeurCourante (element traverse actuellement)) => accumulateur + valeurCourante, valeurInitiale (valeur de commencement));

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