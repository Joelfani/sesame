<template>
    <div class="demandes_attente_livraison_page">
        <!-- Header avec titre -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DEMANDES EN ATTENTE DE LIVRAISON</h1>
            <div class="link_demande">
            </div>
        </div>
        
        <!-- Champ de recherche -->
        <div class="d-flex align-items-center">
            <select name="choix" class="form-select mb-3" style="width: 250px; margin-right: 10px;" v-model="choix_filtre">
                <option value="num">N° d'enregistrement</option>
                <option value="date">Date</option>
                <option value="id_user">Nom</option>
            </select>
            
            <template v-if="choix_filtre === 'date'">
                <label style="font-weight: bold; margin-right: 10px;">de: </label>
                <input type="date" class="form-control mb-3" style="width: 200px;margin-right: 10px;" v-model="date_debut" @change="filterByDate">
                <label style="font-weight: bold; margin-right: 10px;">à: </label>
                <input type="date" class="form-control mb-3" style="width: 200px;" v-model="date_fin" @change="filterByDate">
            </template>
           
            <input v-else type="search" placeholder="Rechercher une demande" class="form-control mb-3" style="width: 250px; margin-right: 10px;" v-model="search_term" @input="filterData">
        </div>
        
        <!-- Tableau des demandes en attente de livraison -->
        <div class="table_block_list">
            <Table
                :columns="columns"
                :rows="filtered_demandes"
                :type_but_link="true" 
                but_link_path="livraison/" 
                name_but_action="Voir"
                :loading="loading"
            />
        </div>
    </div>
</template>

<script setup>
import { niveau } from '~/assets/js/CommonVariable';

// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
//loading
const loading = ref(true);
// Définition des colonnes du tableau
const columns = [
    { key: 'id', label: 'N°' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'id_user', label: 'Nom du demandeur' },
    { key: 'nom', label: 'Objet de la demande' },
    { key: 'nbrnv', label: 'Nombre d\'article en attente'},
];

// Variables réactives
const liste_demandes_attente_livraison = ref([]) // Liste originale
const filtered_demandes = ref([]) // Liste filtrée pour l'affichage
const choix_filtre = ref('num');
const search_term = ref('');
const date_debut = ref('');
const date_fin = ref('');

/* METHODS */
const getDemandesAttenteLivraison = async () => {
    loading.value = true;
    try {
        // 1️⃣ Requête unique avec jointures
        const { data, error } = await supabase
            .from('ses_demandeObj')
            .select(`
                *,
                users: id_user ( full_name ),
                ses_demItems!inner ( id, niv_val )
            `)
            .eq('ses_demItems.niv_val', niveau.livraison)
            .order('id', { ascending: false });
        
        if (error) throw error;
        
        // 2️⃣ Transformation rapide des données
        const result = data.map(row => ({
            ...row,
            nbrnv: row.ses_demItems?.length ?? 0,   // nombre d'items niveau livraison
            date_original: row.date,
            date_formatted: formatDate(row.date),
            date: formatDate(row.date),
            id_user: row.users?.full_name || 'Nom non trouvé'
        }));
        
        // 3️⃣ Mise à jour des listes
        liste_demandes_attente_livraison.value = result;
        filtered_demandes.value = [...result];
        
        console.log('liste demandes en attente de livraison', result);
        
    } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
    } finally {
        loading.value = false;
    }
};

// Fonction de filtrage des données
const filterData = () => {
    if (!search_term.value.trim()) {
        filtered_demandes.value = [...liste_demandes_attente_livraison.value];
        return;
    }
    loading.value = true;
    const term = search_term.value.toLowerCase().trim();
    
    filtered_demandes.value = liste_demandes_attente_livraison.value.filter(item => {
        switch (choix_filtre.value) {
            case 'num':
                return item.id.toString().includes(term);
            case 'id_user':
                return item.id_user.toLowerCase().includes(term);
            default:
                return true;
        }
    });
    loading.value = true;
}

// Fonction de filtrage par date
const filterByDate = () => {
    if (!date_debut.value && !date_fin.value) {
        filtered_demandes.value = [...liste_demandes_attente_livraison.value];
        return;
    }
    loading.value = true;
    filtered_demandes.value = liste_demandes_attente_livraison.value.filter(item => {
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
    loading.value = false;
}

// Réinitialiser les filtres quand le type de filtre change
watch(choix_filtre, () => {
    search_term.value = '';
    date_debut.value = '';
    date_fin.value = '';
    filtered_demandes.value = [...liste_demandes_attente_livraison.value];
});

// Fonction de formatage de date
const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
};

// Lifecycle
onMounted(() => {
    getDemandesAttenteLivraison();
});
</script>