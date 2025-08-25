    <template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>DÉTAILS DE LA DEMANDE</h1>
        <div class="link_demande">
            <NuxtLink to="/validation" class="btn btn-outline-secondary">Retour à la liste</NuxtLink>
        </div>
        </div>

        <!-- Informations générales de la demande -->
        <div>
        <h6>N° d'enregistrement: <span>{{ route.params.id }}</span></h6>
        <h6>Date: <span>01-10-2023</span></h6>
        <div class="d-flex align-items-center gap-3">
            <h6>Objet: <span>Achat de matériel informatique</span></h6>
        </div>
        </div>

        <!-- Tableau des détails -->
        <div class="table_block_list mt-4">
        <Table 
            :columns="columns" 
            :rows="demande_details" 
            :type_but_modal="true"
            :actions ="[{ label: 'Valider', color: 'success' }, { label: 'Rejeter', color: 'secondary' }]"
            />
        </div>
    </div>
    </template>

    <script setup>
import Table from '~/components/Table.vue';
    const route = useRoute();
    // Définition des colonnes du tableau
    const columns = [
    { key: 'id', label: 'N°' },
    { key: 'designation', label: 'Désignation' },
    { key: 'qte', label: 'Quantité' },
    { key: 'spec', label: 'Spécificités techniques' },
    { key: 'ref', label: 'Références' },
    { key: 'fournisseur', label: 'Fournisseur' },
    { key: 'prix', label: 'Prix unitaire' },
    { key: 'delai', label: 'Date de livraison' },
    { key: 'commentaire', label: 'Commentaire' },
    { key: 'total', label: 'Montant total' },
    ];

    // Données d'exemple pour le tableau
    const demande_details = [
    {
        id: 1,
        designation: 'Ordinateur portable',
        qte: 2,
        spec: 'Intel i7, 16GB RAP, 512GB SSD',
        ref: 'REF123',
        fournisseur: 'Fournisseur A',
        prix: 1500,
        delai: '2023-10-15',
        commentaire: 'Urgent pour le département IT',
        total: 3000,
    },
    {
        id: 2,
        designation: 'Écran 24 pouces',
        qte: 3,
        spec: 'Full HD, IPS',
        ref: 'REF456',
        fournisseur: 'Fournisseur B',
        prix: 200,
        delai: '2023-10-20',
        commentaire: 'Compatible avec les ordinateurs existants',
        total: 600,
    },
    {
        id: 3,
        designation: 'Clavier ergonomique',
        qte: 5,
        spec: 'Sans fil, Bluetooth',
        ref: 'REF789',
        fournisseur: 'Fournisseur C',
        prix: 50,
        delai: '2023-10-10',
        commentaire: 'Pour améliorer le confort au travail',
        total: 250,
    },
    ];
    </script>