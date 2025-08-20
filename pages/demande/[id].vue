<template>
    <h1>Voir une demande avec l'id {{ route.params.id }}</h1>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
        <h1></h1>
        <div class="link_demande">
            <NuxtLink to="/demande" class="btn btn-success">Envoyer la demande</NuxtLink>
        </div>
        </div>

        <div>
        <h6>N° d'enregistrement: <span>1</span></h6>
        <h6>Date: <span>01-10-2023</span></h6>
        <div class="d-flex align-items-center gap-3">
            <h6>Objet:</h6>
            <input type="text" class="form-control" name="objet" id="objet" style="width: 20%; height: 30px;" />
        </div>
        </div>
        <div class="table_block_add mt-4">
            <Table :columns="columns" :tableinput="true" :add-row="true"/>
        </div>
    </div>
</template>

    <script setup>
    const route = useRoute();
    //DATA //
    const columns = [
        { key: "id", label: "N°", type:'number',min:'1',disabled: true, style: "width: 100px;height: 62px" },
        { key: "designation", label: "Désignation", type:'textarea'},
        { key: "qte", type:'number',min:'1', label: "Quantité", style: "width: 120px;" },
        {   key: "spec", label: "Spécificités techniques", type:'textarea',style: "width: 200px;"
        },
        { key: "ref", label: "Références", type:'text',
            /*options: [
                { value: 'SADMINDIVERS', label: 'SADMINDIVERS' },
                { value: 'SADMIN', label: 'SADMIN' },
                { value: 'SBOEAP', label: 'SBOEAP' },
                { value: 'SBOEOSP', label: 'SBOEOSP' },
                { value: 'SBOESUP', label: 'SBOESUP' },
            ]*/
        },
        { key: "fournisseur", label: "Fournisseur",type:'select',
            options: [
                { value: 'Fournisseur A', label: 'Fournisseur A' },
                { value: 'Fournisseur B', label: 'Fournisseur B' },
                { value: 'Fournisseur C', label: 'Fournisseur C' }
            ],
            autre: true,
            style: "width: 200px;"
        },
        { key: "prix", type:'number',min:'1', label: "Prix unitaire", style: "width: 140px;",placeholder: "P.U" },
        { key: "delai", type:'date', label: "Date de livraison" },
        { key: "commentaire", label: "Commentaire", type:'textarea', style: "width: 200px;" },
        { key: "total", type:'number',min:'1',disabled: true, label: "Montant total" },
        
    ];

    
    // METHODES //
    </script>