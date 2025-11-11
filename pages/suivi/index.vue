<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>SUIVI DE TOUTES LES DEMANDES VALIDÉES</h1>
            <div class="link_demande">
                
            </div>
        </div>
        
        <!-- Champ de recherche -->
        <div class="d-flex align-items-center">
            <select name="choix" class="form-select mb-3" style="width: 250px; margin-right: 10px;" v-model="choix_filtre">
                <option value="num">N° d'enregistrement</option>
                <option value="date">Date</option>
                <option value="nom">Objet de la demande</option>
            </select>
            
            <template v-if="choix_filtre === 'date'">
                <label style="font-weight: bold; margin-right: 10px;">de: </label>
                <input type="date" class="form-control mb-3" style="width: 200px;margin-right: 10px;" v-model="date_debut" @change="filterByDate">
                <label style="font-weight: bold; margin-right: 10px;">à: </label>
                <input type="date" class="form-control mb-3" style="width: 200px;" v-model="date_fin" @change="filterByDate">
            </template>
            
            <input v-else type="search" placeholder="Rechercher une demande" class="form-control mb-3" style="width: 250px; margin-right: 10px;" v-model="search_term" @input="filterData">
        </div>

        <div class="table_block_list">
            <Table :columns="columns" :rows="filtered_demandes" :type_but_link="true" but_link_path="suivi/" name_but_action="Voir" :loading="loading"/>
        </div>
        <!-- Alert pour les notifications -->
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
    </div>
</template>

<script setup>
import { niveau } from '~/assets/js/CommonVariable.js';
// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
const realtimeStore = useSubscribeStore()

//loading
const loading = ref(true);

// DATA //
const choix_filtre = ref('num');
const search_term = ref('');
const date_debut = ref('');
const date_fin = ref('');

const columns = [
    { key: 'id', label: 'N° d\'enregistrement' },
    { key: 'date', label: 'Date de la demande' }, 
    { key: 'nom', label: 'Objet de la demande'},
    { key: 'niv_val', label: 'Status de la demande' },
]

const liste_demande = ref([]); // Liste originale
const filtered_demandes = ref([]); // Liste filtrée pour l'affichage
const allDataView = ref([]);
// Alert system
    const alert = ref({
        show: false,
        message: '',
        title: '',
        type: '' // success, error, warning, info
    })

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

// METHODS //
const alertNoSup = () => {
    showAlert('Veuillez choisir un supérieur avant de faire une demande', 'Oups!', 'danger');
}
const getDemande = async () => {
    loading.value = true;
    try {
        let dataObj = []; // Déclaration correcte en let au lieu de const
        if(userStore.type_compte == 1){
            console.log('admin');
            
            // CAS ADMIN: Récupérer toutes les demandes
            const { data: fetchedDataObj, error: errorObj } = await supabase
                .from('ses_demandeObj')
                .select('*')
                .order('id', { ascending: false })
            
            if (errorObj) throw errorObj;
            
            dataObj = fetchedDataObj;

            // Récupérer le niveau de validation minimum pour chaque demande
            for (let i = 0; i < dataObj.length; i++) {
                const { data: itemsObj, error: itemsError } = await supabase
                    .from('ses_demItems')
                    .select('niv_val')
                    .eq('id_obj', dataObj[i].id);
                
                if (itemsError) throw itemsError;
                
                // Trouver le niveau minimum parmi tous les items
                if (itemsObj && itemsObj.length > 0) {
                    const minNivVal = Math.min(...itemsObj.map(item => item.niv_val));
                    dataObj[i].niv_val = minNivVal;
                } else {
                    dataObj[i].niv_val = null;
                }
            }

        } else if (userStore.achat || userStore.afe || userStore.finance || userStore.dpr) {
            log('user with special rights');
            // CAS 1: Utilisateurs avec droits spéciaux (achat, afe, finance, dpr)
            const { data: fetchedDataObj, error: errorObj } = await supabase
                .from('ses_demandeObj')
                .select('*')
                .order('id', { ascending: false })
                .limit(20);
            
            if (errorObj) throw errorObj;
            
            dataObj = fetchedDataObj;

            // Récupérer le niveau de validation minimum pour chaque demande
            for (let i = 0; i < dataObj.length; i++) {
                const { data: itemsObj, error: itemsError } = await supabase
                    .from('ses_demItems')
                    .select('niv_val')
                    .eq('id_obj', dataObj[i].id);
                
                if (itemsError) throw itemsError;
                
                // Trouver le niveau minimum parmi tous les items
                if (itemsObj && itemsObj.length > 0) {
                    const minNivVal = Math.min(...itemsObj.map(item => item.niv_val));
                    dataObj[i].niv_val = minNivVal;
                } else {
                    dataObj[i].niv_val = null;
                }
            }

            // Filtrer selon le rôle de l'utilisateur
            if (userStore.achat) {
                dataObj = dataObj.filter(item => item.niv_val !== null && item.niv_val > niveau.achat);
            } else if (userStore.afe) {
                dataObj = dataObj.filter(item => item.niv_val !== null && item.niv_val > niveau.afe);
            } else if (userStore.finance) {
                dataObj = dataObj.filter(item => item.niv_val !== null && item.niv_val > niveau.finance);
            } else if (userStore.dpr) {
                dataObj = dataObj.filter(item => item.niv_val !== null && item.niv_val > niveau.dpr);
            }
            
        } else {
            console.log('normal user');
            // CAS 2: Utilisateurs normaux (supérieurs)
            const { data: fetchedDataObj, error: errorObj } = await supabase
                .from('ses_demandeObj')
                .select('*')
                .eq('id_sup', userStore.id)
                .order('id', { ascending: false })
                .limit(20);
            
            console.log('dataObj', fetchedDataObj);
            
            if (errorObj) throw errorObj;
            
            dataObj = fetchedDataObj;

            // Récupérer le niveau de validation minimum pour chaque demande
            for (let i = 0; i < dataObj.length; i++) {
                const { data: itemsObj, error: itemsError } = await supabase
                    .from('ses_demItems')
                    .select('niv_val')
                    .eq('id_obj', dataObj[i].id);
                
                if (itemsError) throw itemsError;
                
                // Trouver le niveau minimum parmi tous les items
                if (itemsObj && itemsObj.length > 0) {
                    const minNivVal = Math.min(...itemsObj.map(item => item.niv_val));
                    dataObj[i].niv_val = minNivVal;
                } else {
                    dataObj[i].niv_val = null;
                }
            }
        }
        
        // Mapper les données pour l'affichage
        allDataView.value = dataObj.map(item => {
            return {
                ...item,
                niv_val: item.niv_val === niveau.superieur ? 'En attente de validation chez votre superieur' :
                        item.niv_val === niveau.achat ? 'En attente de validation chez le responsable d\'achat' :
                        item.niv_val === niveau.afe ? 'En attente de validation chez le responsable administratif d\'achat' :
                        item.niv_val === niveau.finance ? 'En attente de validation chez le responsable financier' :
                        item.niv_val === niveau.dpr ? 'En attente de validation du DPR' : 
                        item.niv_val === niveau.cheque ? 'En attente d\'émission de chèque' :
                        item.niv_val === niveau.livraison ? 'En attente de livraison' :
                        item.niv_val === niveau.valide ? 'Validée' :
                        item.niv_val === niveau.refuse ? 'Votre demande a été refusée' : 'Statut inconnu',
                date: formatDate(item.date),
                date_original: item.date // Garder la date originale pour les comparaisons
            };
        });
        
        liste_demande.value = allDataView.value;
        filtered_demandes.value = [...allDataView.value]; // Initialiser la liste filtrée

        loading.value = false;

        console.log('liste', liste_demande.value); 
        
    } catch (error) {
        loading.value = false;
        console.error('Erreur lors de la récupération des demandes:', error);
        showAlert('Erreur lors de la récupération des demandes', 'Erreur', 'danger');
    }
}

// Fonction de filtrage des données
const filterData = () => {
    if (!search_term.value.trim()) {
        filtered_demandes.value = [...liste_demande.value];
        return;
    }
    loading.value = true;
    const term = search_term.value.toLowerCase().trim();
    
    filtered_demandes.value = liste_demande.value.filter(item => {
        switch (choix_filtre.value) {
            case 'num':
                return item.id.toString().includes(term);
            case 'nom':
                return item.nom.toLowerCase().includes(term);
            default:
                return true;
        }
    });
    loading.value = false;
}

// Fonction de filtrage par date
const filterByDate = () => {
    if (!date_debut.value && !date_fin.value) {
        filtered_demandes.value = [...liste_demande.value];
        return;
    }
    
    filtered_demandes.value = liste_demande.value.filter(item => {
        const itemDate = new Date(item.date_original);
        const debut = date_debut.value ? new Date(date_debut.value) : null;
        const fin = date_fin.value ? new Date(date_fin.value) : null;
        
        if (debut && fin) {
            return itemDate >= debut && itemDate <= fin;
        } else if (debut) {
            return itemDate >= debut;
        } else if (fin) {
            return itemDate <= fin;
        }
        return true;
    });
}

// Réinitialiser les filtres quand le type de filtre change
watch(choix_filtre, () => {
    search_term.value = '';
    date_debut.value = '';
    date_fin.value = '';
    filtered_demandes.value = [...liste_demande.value];
});

// Methode pour utilisation dans les methods
const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    const formattedDate = `${day}/${month}/${year}`;
    console.log('formatted date:', `${day}/${month}/${year}`);
    
    return formattedDate;
};

// LIFECYCLE HOOKS //
onMounted(async () => {
    getDemande();
});
</script>