<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>LISTE DE TOUTES MES DEMANDES</h1>
            <div class="link_demande">
                <NuxtLink to="/demande/add" class="btn btn-outline-success">Faire une demande</NuxtLink>
                <NuxtLink to="/demande/tdb" class="btn btn-outline-secondary">Tableau de bord</NuxtLink>
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
            <Table :columns="columns" :rows="filtered_demandes" :type_but_link="true" but_link_path="demande/" name_but_action="Voir"/>
        </div>
        <Alert/>
    </div>
</template>

<script setup>
// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
const realtimeStore = useSubscribeStore()

// DATA //
const choix_filtre = ref('num');
const search_term = ref('');
const date_debut = ref('');
const date_fin = ref('');

const columns = [
    { key: 'id', label: 'N° d\'enregistrement' },
    { key: 'date', label: 'Date de la demande' }, 
    { key: 'nom', label: 'Objet de la demande'},
    { key: 'niv_val', label: 'Niveau de la demande' },
]

const liste_demande = ref([]); // Liste originale
const filtered_demandes = ref([]); // Liste filtrée pour l'affichage

// METHODS //
const getDemande = async () => {
    try {
        const { data: dataObj, error: errorObj } = await supabase
        .from('ses_demandeObj')
        .select('*')
        .eq('id_user', userStore.id)
        .order('id', { ascending: false });
        
        if (errorObj) throw errorObj;
        
        for (let i = 0; i < dataObj.length; i++) {
            const { data: itemsObj, error: itemsError } = await supabase
            .from('ses_demItems')
            .select('min:niv_val')
            .eq('id_obj', dataObj[i].id)
            .limit(1);
            
            if (itemsError) throw itemsError;
            dataObj[i].niv_val = itemsObj[0]?.min;
        }
        
        const allDataView = dataObj.map(item => {
            return {
                ...item,
                niv_val: item.niv_val === 1 ? 'En attente de validation chez votre superieur' :
                        item.niv_val === 2 ? 'En attente de validation chez le responsable d\'achat' :
                        item.niv_val === 3 ? 'En attente de validation chez le responsable financier' :
                        item.niv_val === 4 ? 'En attente de validation chez le DPR' : 
                        item.niv_val === 5 ? 'En attente de validation chez le responsable financier pour chèque' :
                        item.niv_val === 6 ? 'En attente de validation chez le responsable d\'achat livraison' :
                        item.niv_val === 7 ? 'Validée' :
                        item.niv_val === 8 ? 'Refusée par le superieur' :
                        item.niv_val === 9 ? 'Refusée par le responsable d\'achat' :
                        item.niv_val === 10 ? 'Refusée par le responsable financier' : 'Refusée par le DPR',
                date: formatDate(item.date),
                date_original: item.date // Garder la date originale pour les comparaisons
            };
        });
        
        liste_demande.value = allDataView;
        filtered_demandes.value = [...allDataView]; // Initialiser la liste filtrée
        
        console.log('liste', liste_demande.value); 
        
    } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
    }
}

// Fonction de filtrage des données
const filterData = () => {
    if (!search_term.value.trim()) {
        filtered_demandes.value = [...liste_demande.value];
        return;
    }
    
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