    ```vue
    <template>
    <div class="demandes_validation_page">
        <!-- Header avec titre -->
        <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>VALIDATION AU NIVEAU DE L' ACHETEUR</h1>
        <div class="link_demande">
            <NuxtLink to="/achat/historique" class="btn btn-outline-success">Historique des validations</NuxtLink>
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
            :type_but_link="true" but_link_path="achat/" name_but_action="Voir"
        /> 
        </div>
    </div>
    </template>

    <script setup>
    import Table from '~/components/Table.vue';

    // Définition des colonnes du tableau
    const columns = [
    { key: 'id', label: 'N°' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'nom', label: 'Nom du demandeur' },
    { key: 'object', label: 'Objet de la demande' },
    { key: 'nbrnv', label: 'Nombre d\'article non validé'},
    ];

    // Données d'exemple pour les demandes à valider
    const liste_demandes_a_valider = [
    {
        id: 1,
        status: 'En attente de validation',
        nom: 'John Doe',
        date: '2023-10-01',
        object: 'Achat de matériel informatique',
    },
    {
        id: 2,
        status: 'En attente de validation',
        nom: 'Jane Smith',
        date: '2023-10-03',
        object: 'Demande de congé',
    },
    {
        id: 3,
        status: 'En attente de validation',
        nom: 'Alice Johnson',
        date: '2023-10-04',
        object: 'Achat de fournitures de bureau',
    },
    {
        id: 4,
        status: 'En attente de validation',
        nom: 'Bob Brown',
        date: '2023-10-06',
        object: 'Réparation d’équipement',
    },
    ];

    /* DATA */
    const choix_filtre = ref('num');
    </script>