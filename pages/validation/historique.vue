    ```vue
    <template>
    <div class="demandes_validation_page">
        <!-- Header avec titre -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>HISTORIQUE DES VALIDATIONS</h1>
        </div>

        <!-- Champ de recherche -->
        <div class="d-flex">
            <input type="search" placeholder="Rechercher une demande" class="form-control mb-3">
        </div>

        <!-- Tableau des demandes à valider -->
        <div class="table_block_list">
        <Table 
            :columns="columns" 
            :rows="liste_demandes_a_valider" 
            :show-actions="false"
        />
        </div>
    </div>
    </template>

    <script setup>
    import Table from '~/components/Table.vue';

    // Définition des colonnes du tableau
    const columns = [
    { key: 'id', label: 'N°' },
    { key: 'status', label: 'Statut' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'object', label: 'Objet de la demande' },
    ];

    // Données d'exemple pour les demandes à valider
    const liste_demandes_a_valider = [
    {
        id: 1,
        status: 'Validée',
        date: '2023-10-01',
        object: 'Achat de matériel informatique',
    },
    {
        id: 2,
        status: 'Validée',
        date: '2023-10-03',
        object: 'Demande de congé',
    },
    {
        id: 3,
        status: 'Refusée',
        date: '2023-10-04',
        object: 'Achat de fournitures de bureau',
    },
    {
        id: 4,
        status: 'Validée',
        date: '2023-10-06',
        object: 'Réparation d’équipement',
    },
    ];
    </script>
    ```