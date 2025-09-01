    ```vue
    <template>
    <div class="demandes_validation_page">
        <!-- Header avec titre -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>HISTORIQUE DES VALIDATIONS DES ACHATS</h1>
        </div>

        <!-- Champ de recherche -->
        <div class="d-flex align-items-center">
            <label style="font-weight: bold; margin-right: 10px;">Filtrer par date de: </label>
            <input type="date" class="form-control mb-3" style="width: 200px;margin-right: 10px;">
            <label style="font-weight: bold; margin-right: 10px;">à: </label>
            <input type="date" class="form-control mb-3" style="width: 200px;">
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
    { key: 'date', label: 'Date de modification' },
    { key: 'id', label: 'N° d\'enregistrement de la demande' },
    { key: 'id_item', label: 'N° de l\'article' },
    { key: 'status', label: 'Statut' },
    { key: 'object', label: 'Objet de la demande' },
    ];

    // Données d'exemple pour les demandes à valider
    const liste_demandes_a_valider = [
    {
        id: 1,
        id_item: '2',
        status: 'Validée',
        date: '2023-10-01',
        object: 'Achat de matériel informatique',
    },
    {
        id: 2,
        id_item: '5',
        status: 'Rejetée',
        date: '2023-10-03',
        object: 'Demande de congé',
    },
    {
        id: 3,
        id_item: '1',
        status: 'Rejetée',
        date: '2023-10-04',
        object: 'Achat de fournitures de bureau',
    },
    {
        id: 4,
        id_item: '3',
        status: 'Validée',
        date: '2023-10-06',
        object: 'Réparation d’équipement',
    },
    ];
    </script>
    ```