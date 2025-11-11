<template>
    <div class="historique_page">
        <!-- Header avec titre -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>HISTORIQUES DES ACTIONS</h1>
        </div>
        
        <!-- Filtrage par date -->
        <div class="d-flex align-items-center">
            <label style="font-weight: bold; margin-right: 10px;">De: </label>
            <input 
                type="date" 
                class="form-control mb-3" 
                style="width: 200px; margin-right: 10px;" 
                v-model="date_debut" 
                @change="filterByDate"
            >
            <label style="font-weight: bold; margin-right: 10px;">À: </label>
            <input 
                type="date" 
                class="form-control mb-3" 
                style="width: 200px;" 
                v-model="date_fin" 
                @change="filterByDate"
            >
        </div>
        
        <!-- Tableau des historiques -->
        <div class="table_block_list">
            <Table
                :columns="columns"
                :rows="filtered_historiques"
                :type_but_link="false"
                :show-actions="false"
                :loading="loading"
            />
        </div>
    </div>
</template>

<script setup>
// Services
const supabase = useSupabaseClient()
const userStore = useUserStore()
//loading
const loading = ref(true);

// Définition des colonnes du tableau
const columns = [
    { key: 'date', label: 'Date' },
    { key: 'nom_utilisateur', label: 'Nom de l\'utilisateur' },
    { key: 'email_utilisateur', label: 'Email' },
    { key: 'action', label: 'Action enregistrée' },
];

// Variables réactives
const liste_historiques = ref([]) // Liste originale
const filtered_historiques = ref([]) // Liste filtrée pour l'affichage
const date_debut = ref('');
const date_fin = ref('');

/* METHODS */
const getHistoriques = async () => {
    loading.value = true;
    try {
        let query = supabase
        .from('ses_histo')
        .select('*')
        .order('created_at', { ascending: false })

        if (userStore.type_compte === 3) {
        query = query.eq('id_user', userStore.id)
        }

        const { data: dataHisto, error: errorHisto } = await query
        console.log('dataHisto', userStore.id);
        if (errorHisto) throw errorHisto;
        
        // Pour chaque historique, récupérer les informations de l'utilisateur
        for (let i = 0; i < dataHisto.length; i++) {
            // Formater la date pour l'affichage
            dataHisto[i].date_formatted = formatDateTime(dataHisto[i].created_at);
            dataHisto[i].date_original = dataHisto[i].created_at; // Garder la date originale
            dataHisto[i].date = dataHisto[i].date_formatted; // Pour l'affichage

            // Récupérer les informations de l'utilisateur
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('full_name, email')
                .eq('id', dataHisto[i].id_user)
                .single();

            if (userError) {
                console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
                dataHisto[i].nom_utilisateur = 'Utilisateur inconnu';
                dataHisto[i].email_utilisateur = 'Email non disponible';
            } else {
                dataHisto[i].nom_utilisateur = userData?.full_name || 'Nom non trouvé';
                dataHisto[i].email_utilisateur = userData?.email || 'Email non trouvé';
            }
        }
        
        liste_historiques.value = dataHisto;
        filtered_historiques.value = [...dataHisto]; // Initialiser la liste filtrée
        loading.value = false;
        console.log('liste historiques', liste_historiques.value);

    } catch (error) {
        console.error('Erreur lors de la récupération des historiques:', error);
    }
}

// Fonction de filtrage par date
const filterByDate = () => {
    if (!date_debut.value && !date_fin.value) {
        filtered_historiques.value = [...liste_historiques.value];
        return;
    }
    loading.value = true;
    filtered_historiques.value = liste_historiques.value.filter(item => {
        const itemDate = new Date(item.date_original);
        const debut = date_debut.value ? new Date(date_debut.value) : null;
        const fin = date_fin.value ? new Date(date_fin.value) : null;
        
        if (debut && fin) {
            // Ajouter 23:59:59 à la date de fin pour inclure toute la journée
            fin.setHours(23, 59, 59, 999);
            return itemDate >= debut && itemDate <= fin;
        } else if (debut) {
            return itemDate >= debut;
        } else if (fin) {
            fin.setHours(23, 59, 59, 999);
            return itemDate <= fin;
        }
        return true;
    });
    loading.value = false;
}

// Fonction de formatage de date et heure
const formatDateTime = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Lifecycle
onMounted(() => {
    getHistoriques();
});
</script>

<style scoped>
.historique_page {
    padding: 20px;
}

.table_block_list {
    margin-top: 20px;
}
</style>