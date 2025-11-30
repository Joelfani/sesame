<template>
    <div class="demandes_validation_page">
        <!-- Header avec titre -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>VALIDATION AU NIVEAU DE L' ACHETEUR</h1>
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
        
        <!-- Tableau des demandes à valider -->
        <div class="table_block_list">
            <Table
                :columns="columns"
                :rows="filtered_demandes"
                :type_but_link="true" 
                but_link_path="achat/" 
                name_but_action="Voir"
                :loading="loading"
            />
        </div>
    </div>
</template>

<script setup>
import { niveau } from '~/assets/js/CommonVariable.js';
// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()

// Définition des colonnes du tableau
const columns = [
    { key: 'id', label: 'N°' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'id_user', label: 'Nom du demandeur' },
    { key: 'nom', label: 'Objet de la demande' },
    { key: 'nbrnv', label: 'Nombre d\'article non validé'},
];
//loading
const loading = ref(true);
// Variables réactives
const liste_demandes_a_valider = ref([]) // Liste originale
const filtered_demandes = ref([]) // Liste filtrée pour l'affichage
const choix_filtre = ref('num');
const search_term = ref('');
const date_debut = ref('');
const date_fin = ref('');

/* METHODS */
const getValidationAchat = async () => {
    loading.value = true;
    try {
        // 1️⃣ Récupérer les demandes + nom du user + compter les items niv_val = 2
        const { data, error } = await supabase
            .from('ses_demandeObj')
            .select(`
                *,
                users: id_user ( full_name ),
                ses_demItems!inner ( id, niv_val )
            `)
            .eq('ses_demItems.niv_val', niveau.achat) 
            .order('id', { ascending: false });

        if (error) throw error;
        
        const result = data.map(row => ({
            ...row,
            nbrnv: row.ses_demItems?.length ?? 0,
            date_original: row.date,
            date_formatted: formatDate(row.date),
            date: formatDate(row.date),
            id_user: row.users?.full_name || "Nom non trouvé"
        }));

        liste_demandes_a_valider.value = result;
        filtered_demandes.value = [...result];

    } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
    } finally {
        loading.value = false;
    }
};

// Fonction de filtrage des données
const filterData = () => {
    if (!search_term.value.trim()) {
        filtered_demandes.value = [...liste_demandes_a_valider.value];
        return;
    }
    loading.value = true;
    const term = search_term.value.toLowerCase().trim();
    
    filtered_demandes.value = liste_demandes_a_valider.value.filter(item => {
        switch (choix_filtre.value) {
            case 'num':
                return item.id.toString().includes(term);
            case 'id_user':
                return item.id_user.toLowerCase().includes(term);
            default:
                return true;
        }
    });
    loading.value = false;
}

// Fonction de filtrage par date
const filterByDate = () => {
    if (!date_debut.value && !date_fin.value) {
        filtered_demandes.value = [...liste_demandes_a_valider.value];
        return;
    }
    loading.value = true;
    filtered_demandes.value = liste_demandes_a_valider.value.filter(item => {
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
    filtered_demandes.value = [...liste_demandes_a_valider.value];
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
    getValidationAchat();
});
</script>