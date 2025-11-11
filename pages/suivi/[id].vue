    <template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>DÉTAILS DE LA DEMANDE</h1>
        <div class="link_demande">
            <NuxtLink to="/suivi" class="btn btn-outline-secondary">Retour à la liste</NuxtLink>
        </div>
        </div>

        <!-- Informations générales de la demande -->
        <div>
        <h6>N° d'enregistrement: <span>{{ route.params.id }}</span></h6>
        <h6>Date: {{ dataObj.date }}</h6>
        <div class="d-flex align-items-center gap-3">
            <h6>Objet: {{ dataObj.nom }}</h6>
        </div>
        </div>

        <!-- Tableau des détails -->
        <div class="table_block_list mt-4">
        <Table :columns="columns" :rows="demande_details" :showActions="false" :loading="loading"/>
        </div>
    </div>
    </template>

    <script setup>
import {tableTete,niveau} from '~/assets/js/CommonVariable.js';

// Services
    const supabase = useSupabaseClient()
// Store
    const userStore = useUserStore()

// Route
    const route = useRoute();
//loading
const loading = ref(true);
    // Définition des colonnes du tableau
    const columns = [
    { key: 'num', label: 'N°'},
    { key: 'etat', label: 'État'}, 
    { key: 'com', label: 'Commentaire ou Motif de rejet', style: {minWidth: '350px'}},
    ...tableTete.filter(col => col.key !== 'id' && col.key !== 'com'), // Exclure la colonne 'id' et commentaire
    { key: 'imputation', label: 'Imputation analytique' },
    { key: 'fournisseur2', label: 'Fournisseur Réel' },
    { key: 'prixR', label: 'Prix Réel' },
    { key: 'totalR', label: 'Montant Réel' },
    { key: 'observation_dpr', label: 'Observation DPR'},
    { key: 'num_cheque', label: 'N° Chèque'},
    { key: 'date_emission_cheque', label: 'Date d\'émission'},
    { key: 'observation_cheque', label: 'Observation Chèque'},
    { key: 'date_livraison', label: 'Date de livraison'},
    { key: 'observation_livraison', label: 'Observation sur la livraison', style: {minWidth: '350px'}},
    ];

    //DATA //
    const demande_details = ref([]);
    const dataObj = ref([]);

    //METHODES
    const getDemandeDetails = async () => {
        loading.value = true;
        try {
        const { data, error } = await supabase
            .from('ses_demItems')
            .select('*,fournisseur(nom)')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true });
        if (error) throw error;

        const allDataView = data.map(item => {
        return {
            ...item,
            etat: item.niv_val === niveau.superieur ? 'En attente de validation chez votre superieur' :
                    item.niv_val === niveau.achat ? 'En attente de validation chez le responsable d\'achat' :
                    item.niv_val === niveau.afe ? 'En attente de validation chez le responsable administratif d\'achat' :
                        item.niv_val === niveau.finance ? 'En attente de validation chez le responsable financier' :
                        item.niv_val === niveau.dpr ? 'En attente de validation du DPR' : 
                        item.niv_val === niveau.cheque ? 'En attente d\'émission de chèque' :
                        item.niv_val === niveau.livraison ? 'En attente de livraison' :
                        item.niv_val === niveau.valide ? 'Validée' : 
                        item.niv_val === niveau.refuse ? 'Demande refusée' : 'Erreur',
            delai: formatDate(item.delai),// Formatage de la date en jj/mm/aaaa
            fournisseur: item.fournisseur?.nom || '', // récupérer le nom du fournisseur
            };
        });

        demande_details.value = allDataView;
        
        loading.value = false;

        // Recuperation des informations de l'objet  
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
// Methode pour utilisation dans les methods
const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // les mois commencent à 0
    const year = d.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;    
    return formattedDate;
};
    // LIFECYCLE HOOKS //
    onMounted(() => {
        getDemandeDetails();
    });
    </script>