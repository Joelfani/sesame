<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>LISTE DE TOUS MES DEMANDES</h1>
            <div class="link_demande">
                <NuxtLink to="/demande/add" class="btn btn-success">Faire une demande</NuxtLink>
                <NuxtLink to="/demande/tdb" class="btn btn-outline-secondary">Tableau de bord</NuxtLink>
            </div>
            
            <div class="d-flex">
                <input type="search" placeholder="Rechercher une demande" class="form-control mb-3">
            </div>
        </div>
        <div class="table_block_list">
            <Table :columns="columns" :rows="liste_demande" :type_but_link="true" but_link_path="demande/" name_but_action="Voir"/>
        </div>
        <Alert/>
    </div>
    
    
</template>

<script setup>
// Services
    const supabase = useSupabaseClient()
// Store
    const userStore = useUserStore()
//DATA //
const columns = [
    { key: 'id', label: 'N° d\'enregistrement' },
    { key: 'date', label: 'Date de la demande' }, 
    { key: 'object', label: 'Objet de la demande'},
    { key: 'niv_val', label: 'Niveau de la demande' },
    
    
]
const liste_demande = [
    /*{ id: 1, status: 'En attente de validation chez le responsable d\'achat', date: '2023-10-01', object: 'Achat de matériel informatique' },
    { id: 2, status: 'Validée', date: '2023-10-02' , object: 'Mise à jour du logiciel de gestion' },
    { id: 3, status: 'Refusée par le responsable financier', date: '2023-10-03', object: 'Demande de congé' },
    { id: 4, status: 'En attente', date: '2023-10-04', object: 'Achat de fournitures de bureau' },
    { id: 5, status: 'Acceptée', date: '2023-10-05', object: 'Formation en ligne' },
    { id: 6, status: 'En attente', date: '2023-10-06', object: 'Réparation d’équipement' },*/
];

// METHODS //
const getDemande = async () => {
    try {
        const { data: dataObj, error: errorObj } = await supabase
        .from('ses_demandeObj')
        .select('*')
        .eq('id_user', userStore.id) // Filtrer par l'ID de l'utilisateur connecté
        //console.log('first list data obj',dataObj);
        if (errorObj) throw errorObj;
        for (let i = 0; i < dataObj.length; i++) {
            const { data: itemsObj, error: itemsError } = await supabase
            .from('ses_demItems')
            .select('min:niv_val')
            .eq('id_obj', dataObj[i].id ); // Filtrer par l'ID de l'utilisateur connecté

            console.log('items obj id',dataObj[i].id,'valeur',itemsObj[0].min);
            
            if (itemsError) throw itemsError;
            dataObj[i].niv_val = itemsObj.min;
            
        }
        console.log('data obj',dataObj);
        
    }catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
    }
}

// LIFECYCLE HOOKS //
onMounted(() => {
    getDemande();
});
</script>