    <template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>DÉTAILS DE LA DEMANDE</h1>
        <div class="link_demande">
            <NuxtLink to="/demande" class="btn btn-outline-secondary">Retour à la liste</NuxtLink>
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
        <Table :columns="columns" :rows="demande_details" :showActions="false"/>
        </div>
    </div>
    </template>

    <script setup>
import {tableTete} from '~/assets/js/CommonVariable.js';

// Services
    const supabase = useSupabaseClient()
// Store
    const userStore = useUserStore()

// Route
    const route = useRoute();

    // Définition des colonnes du tableau
    const columns = [
        { key: 'num', label: 'N°'},
        ...tableTete.filter(col => col.key !== 'id'), // Exclure la colonne 'id'
        { key: 'etat', label: 'Etat' },
    ];

    //DATA //
    const demande_details = ref([]);
    const dataObj = ref([]);

    //METHODES
    const getDemandeDetails = async () => {
        try {
        const { data, error } = await supabase
            .from('ses_demItems')
            .select('*')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true });
        if (error) throw error;

        const allDataView = data.map(item => {
        return {
            ...item,
            etat: item.niv_val === 1 ? 'En attente de validation chez votre superieur' :
                    item.niv_val === 2 ? 'En attente de validation chez le responsable d\'achat' :
                        item.niv_val === 3 ? 'En attente de validation chez le responsable financier' :
                        item.niv_val === 4 ? 'En attente de validation chez le DPR' : 
                        item.niv_val === 5 ? 'En attente de validation chez le responsable financier pour chèque' :
                        item.niv_val === 6 ? 'En attente de validation chez le responsable d\'achat livraison' :
                        item.niv_val === 7 ? 'Validée' :
                        item.niv_val === 8 ? 'Refusée par le superieur' :
                        item.niv_val === 9 ? 'Refusée par le responsable d\'achat' :
                        item.niv_val === 10 ? 'Refusée par le responsable financier' : 'Refusée par le DPR',
            delai: formatDate(item.delai),// Formatage de la date en jj/mm/aaaa
            };
        });

        demande_details.value = allDataView;

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