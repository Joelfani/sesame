<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>LISTE DE TOUS MES DEMANDES</h1>
            <button class="btn btn-success">Faire une demande</button>
            <div class="d-flex">
                <input type="search" placeholder="Rechercher une demande" class="form-control mb-3">
            </div>
        </div>
        <div class="table_block">
            <Table :columns="columns" :rows="liste_demande" />
        </div>
        
    </div>
    
    
</template>

<script setup>
import Table from '~/components/Table.vue';

//DATA //
const columns = [
    { key: 'id', label: 'N°' },
    { key: 'status', label: 'Statut' },
    { key: 'date', label: 'Date de la demande' },
]
const liste_demande = [
    { id: 1, status: 'En attente', date: '2023-10-01' },
    { id: 2, status: 'Acceptée', date: '2023-10-02' },
    { id: 3, status: 'Refusée', date: '2023-10-03' },
];
</script>