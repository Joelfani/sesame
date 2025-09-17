    <template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>DEMANDE D'ACHAT</h1>
        <div class="link_demande">
            <NuxtLink to="" class="btn btn-success" @click="sendTableData">Envoyer la demande</NuxtLink>
        </div>
        </div>

        <div>
        <h6>N° d'enregistrement: <span>{{ numErg ? numErg : '' }}</span></h6>
        <h6>Date: <span>{{ currentDate.toLocaleDateString() }}</span></h6>
        <div class="d-flex align-items-center gap-3">
            <h6>Objet:</h6>
            <input type="text" class="form-control" name="objet" id="objet" style="width: 20%; height: 30px;" v-model="demObj"/>
        </div>
        </div>
        <div class="table_block_add mt-4">
            <Table 
            :columns="columns" 
            :tableinputadd="true" 
            :add-row="true"
            ref="tableRef"
            />
        </div>
        <!-- Alert pour les notifications -->
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
    </div>
    
    </template>

    <script setup>
    
    // Services
    const supabase = useSupabaseClient()
    const currentDate = new Date()
    // Store
    const userStore = useUserStore()

    // Alert system
    const alert = ref({
        show: false,
        message: '',
        title: '',
        type: '' // success, error, warning, info
    })

    // Afficher une alerte
    const showAlert = (message, title, type) => {
    alert.value = {
        show: true,
        message,
        title,
        type
    }
    
    // Auto-hide après 5 secondes
    setTimeout(() => {
        alert.value.show = false
    }, 5000)
}
    //DATA //
    
    const columns = computed(() => [
        { key: "num", label: "N°", type:'number',min:'1',disabled: true, style: {height: '62px'}},
        { key: "designation", label: "Désignation", type:'textarea',style: {height: '62px'}},
        { key: "qte", type:'number',min:'1', label: "Nombre" },
        {   key: "spec", label: "Spécificités techniques, les références, photos (à bien préciser)", type:'textarea',placeholder: " " },
        { key: "fournisseur", label: "Fournisseur possible",type:'select',
            options: fournisseurs.value,
        },
        { key: "prix", type:'number',min:'1', label: "Prix unitaire", placeholder: "P.U" },
        { key: "delai", type:'date', label: "Date de livraison"},
        { key: "total", type:'number',min:'1',disabled: true, label: "Montant total (en Ar)", placeholder: "Montant" },
        { key: "com", label: "Commentaire", type:'textarea'},
    ])
    const numErg = ref()
    const fournisseurs = ref([])
    const tableRef = ref(null)
    const demObj = ref('')

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
            numErg.value = data ? data.id + 1 : 1
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

    const sendTableData = async () => {
    // Validation des champs
    if (demObj.value === '') {
        showAlert('Veuillez remplir le champ objet', 'Oups!', 'danger');
        return;
    }
    const tableData = tableRef.value.getTableData();
    
    if (tableData.length === 0) {
        showAlert('Veuillez ajouter au moins un article à la demande', 'Oups!', 'danger');
        return;
    }
    
    if (tableData.some(item => !item.designation || !item.qte || !item.prix || !item.delai)) {
        showAlert('Veuillez remplir tous les champs obligatoires dans la table (Designation, Quantité, Prix, Date)', 'Oups!', 'danger');
        return;
    }
    
    try {
        // 1. Insertion de l'objet et récupération de l'id
        const { data: insertedObj, error: insertObjError } = await supabase
            .from('ses_demandeObj')
            .insert({
                nom: demObj.value,
                id_user: userStore.id,
                date: currentDate.toISOString().split('T')[0] // format YYYY-MM-DD
            })
            .select('id') // récupère l'id
            .single();    // on sait qu’on insère une seule ligne

        if (insertObjError) throw insertObjError;

        const insertedId = insertedObj.id; // id de la demande insérée
        console.log("ID nouvel objet:", insertedId);

        // 2. Préparation des items avec id_obj
        const insertData = tableData.map(item => ({
            id_user: userStore.id,
            id_obj: insertedId, // on lie les items à la demande
            ...item
        }));

        // 3. Insertion des items
        const { error: insertItemError } = await supabase
            .from('ses_demItems')
            .insert(insertData);

        if (insertItemError) throw insertItemError;

        showAlert('Demande envoyée avec succès', 'Succès', 'success');
        console.log('Table data:', tableData);
        console.log('Table data sent successfully');
        navigateTo('/demande')
    } catch (error) {
        showAlert('Erreur lors de l\'envoi', 'Oups!', 'danger');
        console.error('Error sending table data:', error);
    }
};
    // LIFECYCLE //
    onMounted(() => {
        numEnregistrement()
        listFournisseurs()
    })
    </script> 
