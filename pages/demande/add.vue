    <template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>DEMANDE D'ACHAT</h1>
        <div class="link_demande">
            <NuxtLink to="/demande" class="btn btn-success">Envoyer la demande</NuxtLink>
        </div>
        </div>

        <div>
        <h6>N° d'enregistrement: <span>{{ numErg }}</span></h6>
        <h6>Date: <span>{{ currentDate.toLocaleDateString() }}</span></h6>
        <div class="d-flex align-items-center gap-3">
            <h6>Objet:</h6>
            <input type="text" class="form-control" name="objet" id="objet" style="width: 20%; height: 30px;" />
        </div>
        </div>
        <div class="table_block_add mt-4">
            <Table 
            :columns="columns" 
            :tableinputadd="true" 
            :add-row="true"
            @update_table_data="recuperationTableData"
            />
        </div>
    </div>
    </template>

    <script setup>
    const test = ref([])
    const recuperationTableData = (data) => {
        test.value = data
        console.log('data table',test.value);
    }
    // Services
    const supabase = useSupabaseClient()
    const currentDate = new Date()
    //DATA //
    const columns = computed(() => [
        { key: "id", label: "N°", type:'number',min:'1',disabled: true, style: {height: '62px'}},
        { key: "designation", label: "Désignation", type:'textarea',style: {height: '62px'}},
        { key: "qte", type:'number',min:'1', label: "Nombre" },
        {   key: "spec", label: "Spécificités techniques, les références, photos (à bien préciser)", type:'textarea',placeholder: " " },
        { key: "fournisseur", label: "Fournisseur possible",type:'select',
            options: fournisseurs.value,
            autre: true,
            
        },
        { key: "prix", type:'number',min:'1', label: "Prix unitaire", placeholder: "P.U" },
        { key: "delai", type:'date', label: "Date de livraison"},
        { key: "total", type:'number',min:'1',disabled: true, label: "Montant total (en Ar)", placeholder: "Montant" },
        { key: "commentaire", label: "Commentaire", type:'textarea'},
    ])
    const numErg = ref()
    const fournisseurs = ref([])
    // METHODES //
    const numEnregistrement = async() => {
        try{
            const { data, error } = await supabase
            .from('ses_demandeObj')
            .select('id')
            .order('id', { ascending: false })
            .maybeSingle()
            .limit(1);

            if (error) throw error
            
            numErg.value = data ? data[0].id + 1 : 1
        }catch(error){
            console.log(error)
        }
    };

    const listFournisseurs = async() => {
        try {
            const { data, error } = await supabase
                    .from('ses_fournisseurs')
                    .select('nom,id')
                    .eq('etat_del', false)
                    .order('id', { ascending: true });

            if (error) throw error
            fournisseurs.value = data.map(fournisseur => ({
                label: fournisseur.nom,
                value: fournisseur.id
            }));
            
            
        } catch (error) {
            console.error('Erreur lors du chargement des fournisseurs:', error);
            return [];
        }
    };

    // LIFECYCLE //
    onMounted(() => {
        numEnregistrement()
        listFournisseurs()
    })
    </script> 
