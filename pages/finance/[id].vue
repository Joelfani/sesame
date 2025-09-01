    <template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>DÉTAILS DE LA DEMANDE</h1>
        <div class="">
            <button class="btn btn-outline-success">Exporter vers Excel</button>
            <button class="btn btn-outline-primary">A.F.E</button>
            <button class="btn btn-outline-secondary">Bon de commande</button>
        </div>
        
        <div class="link_demande">
            
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
        <div class="table_block_list">
        <Table 
            :columns="columns" 
            :rows="demande_details" 
            :type_but_modal="true"
            :but_Validation="true"
            :actions ="[
                { label: 'Valider', color: 'success' }, 
                { label: 'Rejeter', color: 'danger' },
                
                ]"
        />
        </div>
    </div>
    </template>

    <script setup>
import Table from '~/components/Table.vue';
import {tableTete} from '~/assets/js/CommonVariable.js';
    const route = useRoute();
    // Définition des colonnes du tableau
    const columns = [
    ...tableTete,
    { key: 'code', label: 'Imputation analytique'},
    { key: "fournisseur2", label: "Fournisseur Réel"
        },
    { key: 'prix2', label: 'Prix Réel'},
    { key: 'total2', label: 'Montant Réel'},
    ];

    // Données d'exemple pour le tableau
    const demande_details = [
    {
        id: 1,
        designation: 'Ordinateur portable',
        qte: 2,
        spec: 'Intel i7, 16GB RAP, 512GB SSD',
        fournisseur: 'Fournisseur A',
        prix: 1500,
        delai: '2023-10-15',
        commentaire: 'Urgent pour le département IT',
        total: 3000,
        code: 'CODE123',
        fournisseur2: 'Fournisseur A',
        prix2: 1500,
        total2: 3000,
        etat: 0
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
        code: 'CODE456',
        fournisseur2: 'Fournisseur B',
        prix2: 200,
        total2: 600,
        etat: 1
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
        code: 'CODE789',
        fournisseur2: 'Fournisseur C',
        prix2: 50,
        total2: 250,
        etat: 2
    },
    {
        id: 4,
        designation: 'Souris optique',
        qte: 5,
        spec: 'Sans fil, Bluetooth',
        ref: 'REF101',
        fournisseur: 'Fournisseur D',
        prix: 30,
        delai: '2023-10-12',
        commentaire: 'Pour améliorer la précision',
        total: 150,
        code: 'CODE101',
        fournisseur2: 'Fournisseur D',
        prix2: 30,
        total2: 150,
        etat: 4
    }
    ];
    </script>