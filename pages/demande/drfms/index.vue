<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>MES DRFMS</h1>
            <MiniNav LinkSelected="/demande/drfms" baseLink="demande"/>
            <div class="link_demande">
                <button v-if="userStore.code_tiers == null || userStore.abr_prenom == null || userStore.code_tiers == '' || userStore.abr_prenom == ''"  class="btn btn-outline-success" @click="alertNoSup">Faire une DRFMS</button>
                <NuxtLink v-else to="/demande/drfms/add" class="btn btn-outline-success">Faire une DRFMS</NuxtLink>
                
            </div>
        </div>
        
        <!-- Champ de recherche -->
        <div class="d-flex align-items-center">
            <select name="choix" class="form-select mb-3" style="width: 250px; margin-right: 10px;" v-model="choix_filtre">
                <option value="num">N° d'enregistrement</option>
                <option value="date">Date</option>
                <option value="pers">Personne soignée</option>
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
            <Table :columns="columns" :rows="filtered_demandes" :type_but_link="true" but_link_path="demande/drfms/" name_but_action="Voir" :loading="loading"/>
        </div>
        <!-- Alert pour les notifications -->
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
    </div>
</template>

<script setup>
import { niveauDRFMS } from '~/assets/js/CommonVariable.js';
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
const selectedType = ref('/demande/drfms');

const columns = [
    { key: 'id', label: 'N° d\'enregistrement' }, 
    { key: 'date', label: 'Date de la demande' }, 
    { key: 'cat_pers', label: 'Personne soignée'},
    { key: 'pers_soin', label: 'Nom de la personne'},
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
    showAlert(`Veuillez remplir votre Code Tiers et votre Abréviation de prénom dans votre profil avant de faire une DRFMS`, 'Oups!', 'danger');
}
// Navigation vers le type de demande sélectionné
const naviguer = () => {
    navigateTo(selectedType.value);
};
//data for realtime
const dataForRealtime = ref([]);
const activeRealtime = ref(true);
const getDemande = async () => {
    
    try {
        // Requête optimisée avec jointure
        const { data, error } = await supabase
            .from('ses_obj')
            .select('*')
            .eq('id_user', userStore.id)
            .eq('cat_proc','drfms')
            .order('id', { ascending: false });

        if (error) throw error;
        
        
        // Traitement rapide côté JS
        const result = data.map(item => {
            return {
                ...item,
                niv_val: 
                    item.niv_val === niveauDRFMS.erg ? 'Demande non soumise' :
                    item.niv_val === niveauDRFMS.dpr ? 'En attente de validation du DPR' :
                    item.niv_val === niveauDRFMS.rh ? 'En attente de validation au RH' :
                    item.niv_val === niveauDRFMS.finance ? 'En attente de validation chez le responsable financier' :
                    item.niv_val === niveauDRFMS.cg ? 'En attente de validation chez le controlleur de gestion' :
                    item.niv_val === niveauDRFMS.cheque ? 'En attente d\'émission de chèque' :
                    item.niv_val === niveauDRFMS.valide ? 'Validée' :
                    item.niv_val === niveauDRFMS.refuse ? 'Votre demande a été refusée' :
                    'Statut inconnu',
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
            case 'pers':
                return item.cat_pers?.toLowerCase().includes(term);
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
    },
    { deep: true }
)
// LIFECYCLE HOOKS //
onMounted(async () => {
    loading.value = true;
    getDemande();
});
</script>