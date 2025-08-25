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
        { key: "id", label: "N°", type:'number',min:'1',disabled: true, style: "min-width: 100px;height: 62px" },
        { key: "designation", label: "Désignation", type:'textarea',style: "min-width: 200px;height: 62px"},
        { key: "qte", type:'number',min:'1', label: "Nombre", style: "min-width: 120px;" },
        {   key: "spec", label: "Spécificités techniques, les références, photos (à bien préciser)", type:'textarea',style: "min-width: 300px;",placeholder: " " },
        { key: "fournisseur", label: "Fournisseur possible",type:'select',
            options: [
                { value: 'Fournisseur A', label: 'Fournisseur A' },
                { value: 'Fournisseur B', label: 'Fournisseur B' },
                { value: 'Fournisseur C', label: 'Fournisseur C' }
            ],
            autre: true,
            style: "min-width: 200px;"
        },
        { key: "prix", type:'number',min:'1', label: "Prix unitaire", style: "min-width: 145px;",placeholder: "P.U" },
        { key: "delai", type:'date', label: "Date de livraison",style: "min-width: 140px;" },
        { key: "total", type:'number',min:'1',disabled: true, label: "Montant total (en Ar)",style: "min-width: 145px;", placeholder: "Montant" },
        { key: "commentaire", label: "Commentaire", type:'textarea', style: "min-width: 300px;" },
    ];
    // METHODES //
    </script>
