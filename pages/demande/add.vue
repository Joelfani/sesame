    <template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>DEMANDE D'ACHAT</h1>
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
            <Table :columns="columns" :tableinputadd="true" :add-row="true"/>
        </div>
    </div>
    </template>

    <script setup>
    
    //DATA //
    const columns = [
        { key: "id", label: "N°", type:'number',min:'1',disabled: true, style: {height: '62px'}},
        { key: "designation", label: "Désignation", type:'textarea',style: {height: '62px'}},
        { key: "qte", type:'number',min:'1', label: "Nombre" },
        {   key: "spec", label: "Spécificités techniques, les références, photos (à bien préciser)", type:'textarea',placeholder: " " },
        { key: "fournisseur", label: "Fournisseur possible",type:'select',
            options: [
                { value: 'Fournisseur A', label: 'Fournisseur A' },
                { value: 'Fournisseur B', label: 'Fournisseur B' },
                { value: 'Fournisseur C', label: 'Fournisseur C' }
            ],
            autre: true,
            
        },
        { key: "prix", type:'number',min:'1', label: "Prix unitaire", placeholder: "P.U" },
        { key: "delai", type:'date', label: "Date de livraison"},
        { key: "total", type:'number',min:'1',disabled: true, label: "Montant total (en Ar)", placeholder: "Montant" },
        { key: "commentaire", label: "Commentaire", type:'textarea'},
    ];
    // METHODES //
    </script> 
