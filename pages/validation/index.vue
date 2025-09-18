    ```vue
    <template>
    <div class="demandes_validation_page">
        <!-- Header avec titre -->
        <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>LISTE DES DEMANDES À VALIDER</h1>
        <div class="link_demande">
            <NuxtLink to="/validation/historique" class="btn btn-outline-success">Historique des validations</NuxtLink>
        </div>
        </div>

        <!-- Champ de recherche -->
        <div class="d-flex align-items-center">
            <select name="choix" class="form-select mb-3" style="width: 250px; margin-right: 10px;" v-model="choix_filtre">
                <option value="num">N° d'enregistrement</option>
                <option value="date">Date</option>
                <option value="nom">Nom</option>
            </select>
            <template v-if="choix_filtre === 'date'">
                <label style="font-weight: bold; margin-right: 10px;">de: </label>
                <input type="date" class="form-control mb-3" style="width: 200px;margin-right: 10px;">
                <label style="font-weight: bold; margin-right: 10px;">à: </label>
                <input type="date" class="form-control mb-3" style="width: 200px;">
            </template>
            
            <input v-else  type="search" placeholder="Rechercher une demande" class="form-control mb-3" style="width: 250px; margin-right: 10px;">
        </div>

        <!-- Tableau des demandes à valider -->
        <div class="table_block_list">
        <Table 
            :columns="columns" 
            :rows="liste_demandes_a_valider" 
            :type_but_link="true" but_link_path="validation/" name_but_action="Voir"
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
    { key: 'id', label: 'N° d\'enregistrement' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'nom', label: 'Nom du demandeur' },
    { key: 'object', label: 'Objet de la demande' },
    { key: 'nbrnv', label: 'Nombre d\'article non validé'},
    ];

    // Données d'exemple pour les demandes à valider
    const liste_demandes_a_valider = ref([])

    /* DATA */
    const choix_filtre = ref('num');

    /* METHODS */
    const getValidation = async () => {
    try {
        const { data: dataObj, error: errorObj } = await supabase
        .from('ses_demandeObj')
        .select('*')
        .eq('id_sup', userStore.id)
        .order('id', { ascending: false });
        console.log('dataObj', dataObj);
        
        if (errorObj) throw errorObj;
        
        for (let i = 0; i < dataObj.length; i++) {
            const { count, error: itemsError } = await supabase
            .from('ses_demItems')
            .select('id',{ count: 'exact', head: true })
            .eq('id_obj', dataObj[i].id)
            .eq('niv_val', 1)
            
            console.log('itemsObj', itemsObj);
            
            if (itemsError) throw itemsError;

            dataObj[i].nbrnv = count;
            
        }
        
        
        liste_demande.value = dataObj;
        
        console.log('liste', liste_demande.value); 
        
    } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
    }
    }

    //Lifecycle

    onMounted(() => {
    getValidation();
    });
    </script>