<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>LISTE DE TOUTES MES DEMANDES</h1>
            <div class="link_demande">
                <NuxtLink v-if="userStore.sup != ''" to="/demande/add" class="btn btn-outline-success">Faire une demande</NuxtLink>
                <button v-else class="btn btn-outline-success" @click="alertNoSup">Faire une demande</button>
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
            <Table :columns="columns" :rows="filtered_demandes" :type_but_link="true" but_link_path="demande/" name_but_action="Voir" :loading="loading"/>
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

//data for realtime
const dataForRealtime = ref([]);
const activeRealtime = ref(true);
const getDemande = async () => {
    
    try {
        // Requête optimisée avec jointure
        const { data, error } = await supabase
            .from('ses_demandeObj')
            .select(`
                *,
                ses_demItems ( niv_val )
            `)
            .eq('id_user', userStore.id)
            .order('id', { ascending: false });

        if (error) throw error;

        // Traitement rapide côté JS
        const result = data.map(item => {
            // calcul du minimum niv_val
            const minVal = Math.min(...item.ses_demItems.map(i => Number(i.niv_val)));

            return {
                ...item,
                niv_val: 
                    minVal === niveau.superieur ? 'En attente de validation chez votre superieur' :
                    minVal === niveau.achat ? 'En attente de validation chez le responsable d\'achat' :
                    minVal === niveau.afe ? 'En attente de validation chez le responsable administratif d\'achat' :
                    minVal === niveau.finance ? 'En attente de validation chez le responsable financier' :
                    minVal === niveau.dpr ? 'En attente de validation du DPR' :
                    minVal === niveau.cheque ? 'En attente d\'émission de chèque' :
                    minVal === niveau.livraison ? 'En attente de livraison' :
                    minVal === niveau.valide ? 'Validée' :
                    minVal === niveau.refuse ? 'Votre demande a été refusée' :
                    'Erreur',
                
                niv_val_raw: minVal, // si tu veux garder la valeur brute
                
                date_original: item.date,
                date_formatted: formatDate(item.date),
                date: formatDate(item.date)
            };
        });

        // Assignation
        
        
        liste_demande.value = result;
        
        filtered_demandes.value = [...result];
        loading.value = false;
        //  Realtime si nécessaire
        if (activeRealtime.value) {
            dataForRealtime.value = [...data];
            activeRealtime.value = false;
        }

    } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
    }
};

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
    
    return formattedDate;
};

watch(
    () => dataForRealtime.value,
    async (newRows) => {
        await getDemande();
        console.log('je passe dans watch');
        
    },
    { deep: true }
)
// LIFECYCLE HOOKS //
onMounted(async () => {
    loading.value = true;
    getDemande();

    try {
        await nextTick()
        if (realtimeStore && typeof realtimeStore.subscribeToTable === 'function') {
            realtimeStore.subscribeToTable('ses_demItems', 'dataForRealtime', dataForRealtime, 'id', 'asc')
        } else {
            console.error('Store realtime non disponible')
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
        showAlert('Erreur lors de l\'initialisation de la page', 'Erreur', 'danger')
    }
});
onBeforeUnmount(() => {
    if (realtimeStore && typeof realtimeStore.unsubscribeFromTable === 'function') {
        realtimeStore.unsubscribeFromTable('ses_demItems', 'dataForRealtime')
    }
})
</script>