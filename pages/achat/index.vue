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
            />
        </div>
    </div>
</template>

<script setup>
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

// Variables réactives
const liste_demandes_a_valider = ref([]) // Liste originale
const filtered_demandes = ref([]) // Liste filtrée pour l'affichage
const choix_filtre = ref('num');
const search_term = ref('');
const date_debut = ref('');
const date_fin = ref('');

/* METHODS */
const getValidationAchat = async () => {
    try {
        const { data: dataObj, error: errorObj } = await supabase
            .from('ses_demandeObj')
            .select('*')
            .order('id', { ascending: false });
        
        console.log('dataObj', dataObj);
       
        if (errorObj) throw errorObj;
        
        // Filtrer pour ne récupérer que les demandes qui ont des items avec niv_val = 2
        const demandesAvecArticlesNiveau2 = [];
       
        for (let i = 0; i < dataObj.length; i++) {
            const { count, error: itemsError } = await supabase
                .from('ses_demItems')
                .select('id', { count: 'exact', head: true })
                .eq('id_obj', dataObj[i].id)
                .eq('niv_val', 2); 
           
            if (itemsError) throw itemsError;
            
            // Si cette demande a des articles avec niv_val = 2
            if (count > 0) {
                dataObj[i].nbrnv = count;
                
                // Formater la date pour l'affichage
                dataObj[i].date_formatted = formatDate(dataObj[i].date);
                dataObj[i].date_original = dataObj[i].date; // Garder la date originale
                dataObj[i].date = dataObj[i].date_formatted; // Pour l'affichage

                // Récupérer le nom du demandeur
                const { data: nameDemandeur, error: nameDemandeurError } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', dataObj[i].id_user);

                if (nameDemandeurError) throw nameDemandeurError;

                dataObj[i].id_user = nameDemandeur[0]?.full_name || 'Nom non trouvé';
                
                demandesAvecArticlesNiveau2.push(dataObj[i]);
            }
        }
        
        liste_demandes_a_valider.value = demandesAvecArticlesNiveau2;
        filtered_demandes.value = [...demandesAvecArticlesNiveau2]; // Initialiser la liste filtrée
       
        console.log('liste demandes niveau acheteur', liste_demandes_a_valider.value);
       
    } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
    }
}

// Fonction de filtrage des données
const filterData = () => {
    if (!search_term.value.trim()) {
        filtered_demandes.value = [...liste_demandes_a_valider.value];
        return;
    }
    
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
}

// Fonction de filtrage par date
const filterByDate = () => {
    if (!date_debut.value && !date_fin.value) {
        filtered_demandes.value = [...liste_demandes_a_valider.value];
        return;
    }
    
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