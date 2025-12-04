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
                <option value="nom">Nom du demandeur</option>
                <option value="date">Date</option>
                <option value="nomObj">Objet de la demande</option>
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
    { key: 'nom_user', label: 'Demandeur' },
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
        let query = supabase
            .from('ses_demandeObj')
            .select(`
                *,
                users: id_user ( full_name ),
                items: ses_demItems ( niv_val )
            `)
            .order('id', { ascending: false });

        // user avec droits spéciaux ADMIN / achat/afe/finance/dpr
        if (userStore.type_compte == 1 || userStore.achat || userStore.afe || userStore.finance || userStore.dpr) {
            console.log("user with special rights");
        }

        // utilisateur normal (supérieur)
        else {
            console.log("normal user");
            query = query.eq('id_sup', userStore.id).limit(20);
        }

        // Exécuter la requête optimisée
        const { data, error } = await query;
        if (error) throw error;

        // ⭐ Calcul du niveau de validation minimal + mapping final
        let dataObj = data.map(item => {
            const nivMin = item.items?.length
                ? Math.min(...item.items.map(it => it.niv_val))
                : null;

            return {
                ...item,
                nom_user:item.users.full_name,
                niv_val_min: nivMin,
                date_original: item.date,
                date: formatDate(item.date),
                date_formatted: formatDate(item.date),
                id_user: item.users?.full_name || item.id_user
            };
        });

        // 🔥 Filtrage par rôle (optimisé)
        if (userStore.type_compte != 1) {
            if (userStore.achat) {
            dataObj = dataObj.filter(d => d.niv_val_min !== null && d.niv_val_min > niveau.achat);
            console.log('achat');
            
            } else if (userStore.afe) {
                dataObj = dataObj.filter(d => d.niv_val_min !== null && d.niv_val_min > niveau.afe);
                console.log('afe');
            } else if (userStore.finance) {
                dataObj = dataObj.filter(d => d.niv_val_min !== null && d.niv_val_min > niveau.finance);
                console.log('finance');
            } else if (userStore.dpr) {
                dataObj = dataObj.filter(d => d.niv_val_min !== null && d.niv_val_min > niveau.dpr);
                console.log('dpr');
            }
        }

        // Traduction du niveau en texte
        const finalResult = dataObj.map(item => ({
            ...item,
            niv_val:
                item.niv_val_min === niveau.superieur ? 'En attente de validation chez votre superieur' :
                item.niv_val_min === niveau.achat ? 'En attente de validation chez le responsable d\'achat' :
                item.niv_val_min === niveau.afe ? 'En attente de validation chez le responsable administratif d\'achat' :
                item.niv_val_min === niveau.finance ? 'En attente de validation chez le responsable financier' :
                item.niv_val_min === niveau.dpr ? 'En attente de validation du DPR' :
                item.niv_val_min === niveau.cheque ? 'En attente d\'émission de chèque' :
                item.niv_val_min === niveau.livraison ? 'En attente de livraison' :
                item.niv_val_min === niveau.valide ? 'Validée' :
                item.niv_val_min === niveau.refuse ? 'Votre demande a été refusée' :
                'Statut inconnu'
        }));

        // Mise à jour des listes
        allDataView.value = finalResult;
        liste_demande.value = finalResult;
        filtered_demandes.value = [...finalResult];

        console.log("liste optimisée", finalResult);

    } catch (error) {
        console.error("Erreur lors de la récupération des demandes:", error);
        showAlert('Erreur lors de la récupération des demandes', 'Erreur', 'danger');
    } finally {
        loading.value = false;
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
            case 'nomObj':
                return item.nom.toLowerCase().includes(term);
            case 'nom':
                return item.nom_user.toLowerCase().includes(term);
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