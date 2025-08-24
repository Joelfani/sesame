    ```vue
    <template>
    <div class="fournisseurs_page">
        <!-- Header avec titre et bouton ajouter -->
        <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>LISTE DE TOUS LES FOURNISSEURS</h1>
        <div class="link_fournisseur">
            <NuxtLink to="/fournisseur/add" class="btn btn-success">Ajouter un fournisseur</NuxtLink>
        </div>
        </div>

        <!-- Champ de recherche -->
        <div class="d-flex">
        <input type="search" placeholder="Rechercher un fournisseur" class="form-control mb-3">
        </div>

        <!-- Tableau des fournisseurs -->
        <div class="table_block_list">
        <Table 
            :columns="columns" 
            :rows="liste_fournisseurs" 
            :type_but_modal="true" 
            :actions="[
                { label: 'Modifier',  color: 'primary' },
                { label: 'Supprimer', color: 'danger' }
            ]"
        />
        </div>
    </div>
    </template>

    <script setup>
    import Table from '~/components/Table.vue';

    // Définition des colonnes du tableau
    const columns = [
    { key: 'id', label: 'N°' },
    { key: 'nom', label: 'Nom du fournisseur' },
    { key: 'contact', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'adresse', label: 'Adresse' },
    { key: 'type', label: 'Type de produits' },
    ];

    // Données d'exemple pour les fournisseurs
    const liste_fournisseurs = [
    {
        id: 1,
        nom: 'Fournisseur A',
        contact: 'Jean Dupont',
        email: 'contact@fournisseura.com',
        adresse: '123 Rue Principale, Paris',
        type: 'Matériel informatique',
    },
    {
        id: 2,
        nom: 'Fournisseur B',
        contact: 'Marie Martin',
        email: 'info@fournisseurb.fr',
        adresse: '456 Avenue des Champs, Lyon',
        type: 'Fournitures de bureau',
    },
    {
        id: 3,
        nom: 'Fournisseur C',
        contact: 'Paul Durand',
        email: 'support@fournisseurc.com',
        adresse: '789 Boulevard Central, Marseille',
        type: 'Équipements industriels',
    },
    ];
    </script>
    ```