<template>
<div class="purchase_page">
    <div class="d-flex justify-content-between align-items-center">
        <h1>NOUVELLE DRFMS</h1>
        <div class="link_demande">
            <NuxtLink to="" class="btn btn-success" @click="sendTableData">Sauvegarder la demande</NuxtLink>
            <NuxtLink to="/demande/drfms" class="btn btn-outline-danger">Annuler</NuxtLink>
        </div>
    </div>

    <div>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#rappel" style="margin-left: 0;">Rappel sur la politique et la procédure</button>
        
        <!-- Modal Rappel -->
        <Modal id="rappel" title="Rappel sur la politique santé SESAME et la procédure">
            <div class="pdf-content">
                <h6><strong>=></strong> Les prestations offertes par OSTIE ne sont pas remboursées en DRFMS.</h6>
                <h6><strong>=></strong> Pour les cas exceptionnels, demander l'autorisation préalable du DPR.</h6>
                <h6><strong>=></strong> Les bénéficiaires du remboursement des Frais médicaux sont les collaborateurs, leur conjoints et leurs enfants moins de 21 ans.</h6>
                <h6><strong>=></strong> Le collaborateur paie la totalité des frais, remet la DRFMS avec les pièces justificatives (ordonnance, factures) auprès ddu RDRHA. Après contrôle du RDRHA et RDF, le DPR approuve et ordonne le remboursement des frais suivant les plafonds autorisés dans notre procèdure.</h6>
                <hr>            
                <button class="btn btn-dark" data-bs-dismiss="modal">Fermer</button>
            </div>
        </Modal>
        <br><br>
        <h6>Date: <span>{{ currentDate.toLocaleDateString() }}</span></h6>
        <div class="d-flex align-items-center gap-3">
            <h6>Nom et prénoms de la personne soignée :</h6>
            <input type="text" class="form-control" name="objet" id="objet" style="width: 20%; height: 30px;" v-model="demNom"/>
        </div>
        <div class="d-flex align-items-center gap-3">
            <h6>Personne soignée :</h6>
            <select class="form-control" v-model="demPersonne" style="width: 20%; height: 30px;">
                <option value="moi">Moi-même</option>
                <option value="conjoint">Conjoint</option>
                <option value="enfant">Enfant</option>
            </select>
        </div>
    </div>
    <div class="table_block_add mt-4">
        <Table 
        :columns="columns" 
        :tableinputadd="true" 
        :add-row="true"
        :computeRow="recalculerMontant"
        ref="tableRef"
        :totalview="true"
        :funcTotal="TotalMontant"
        />
    </div>
    
    <!-- Alert pour les notifications -->
    <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>

</div>

</template>

<script setup>
import { niveauDRFMS } from '~/assets/js/CommonVariable.js';
// Services
const supabase = useSupabaseClient()

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

//DATA
const currentDate = new Date()
const type = ref([])
const demNom = ref('')
const demPersonne = ref('moi')
//DATA //
    
const columns = computed(() => [
    { key: "type", label: "Type de soins", type:'select',options: type.value,style: {width: '400px'}},
    {   key: "raison", label: "Raison et description des soins", type:'textarea',placeholder: " " },
    { key: "date", type:'date', label: "Date de soins",style: {width: '200px'}},
    {key: "cachet", label: "Cachet et signature du médecin prescripteur", type:'textarea',placeholder: " " },
    { key: "cout", label: "Coût (ar)", type:'number',min:'1', style: {height: '62px'}},
    {
        key: "taux",
        label: "Taux de remboursement",
        type: 'radio',
        dynamicOptions: (row) => {
            const selectedType = type.value.find(t => t.value === row.type);// Trouver le type sélectionné dans la liste des types
            if (!selectedType) return [];
            return [// utiliser les valeurs de taux de remboursement du type sélectionné
                { label: `${selectedType.taux_normal}`, value: 'normal' },
                { label: `${selectedType.taux_accident}`, value: 'accident' }
            ];
        }
        
    },
    { key: "montant", type:'number',min:'1', label: "Montant à rembourser (ar)", disabled: true}
])
const tableRef = ref(null)
//METHODS
//recuperer la liste des types de soins 
const listtype = async() => {
        try {
            const { data, error } = await supabase
                    .from('ses_type_soins')
                    .select('*')
                    .order('id', { ascending: true });

            if (error) throw error
            type.value = data.map(type => ({
                label: type.nom,
                value: type.id,
                ...type
            }));
        } catch (error) { 
            console.error('Erreur lors du chargement des types de soins:', error);
            return [];
        }
    };
// Suppression des espaces et conversion en nombre pour les champs numériques
const parseNumber = (value) => {
    if (!value) return 0;

    return Number(
        String(value)
            .replace(/\s/g, '')
            .replace(',', '.')
    ) || 0;
};
// Recalculer le montant à rembourser en fonction du coût et du taux de remboursement
const recalculerMontant = (row) => {
    const selectedType = type.value.find(t => t.value === row.type);// Trouver le type sélectionné dans la liste des types
    if (!selectedType || !row.taux || !row.cout) {
        row.montant = 0;
        return;
    }

    const pourcentage = row.taux === 'normal' ? selectedType.pourcentage_normal : selectedType.pourcentage_accident;

    row.montant = parseNumber(row.cout) * pourcentage / 100;
};

//calcule des total des montants à rembourser
const TotalMontant = (row) => {
    return parseNumber(row.montant);
};

//send data
const sendTableData = async () => {
    const tableData = tableRef.value.getTableData();
    if (demNom.value === '') {
        showAlert('Veuillez remplir le champ nom et prénoms de la personne soignée', 'Oups!', 'danger');
        return;
    }
    if (demPersonne.value === '') {
        showAlert('Veuillez sélectionner la personne soignée', 'Oups!', 'danger');
        return;
    }
    if (tableData.length === 0) {
        showAlert('Veuillez ajouter au moins une ligne', 'Oups!', 'danger');
        return;
    }
    if (tableData.some(item => !item.type || !item.raison || !item.date || !item.cout || !item.taux)) {
        showAlert('Veuillez remplir tous les champs obligatoires dans la table (Type de soins, Raison, Date, Coût, Taux)', 'Oups!', 'danger');
        return;
    }
    try {
        const { data: insertedObj, error:insertObjError } = await supabase
            .from('ses_obj')
            .insert([
                {
                    id_user: userStore.id,
                    id_sup: userStore.sup,
                    cat_proc: 'drfms',
                    pers_soin: demNom.value,
                    cat_pers: demPersonne.value,
                    niv_val: niveauDRFMS.erg,
                }
            ])
            .select('id') // récupère l'id
            .single();

        if (insertObjError) throw insertObjError;
        
        const insertedId = insertedObj.id; // id de la demande insérée

        //Préparation des items avec id_obj
        const insertData = tableData.map(item => {
            const { total, ...rest } = item;
            return {
                id_obj: insertedId, // on lie les items à la demande
                ...rest
            };
        });

        // Insertion des items
        const { error: insertItemError } = await supabase
            .from('ses_items_drfms')
            .insert(insertData);
            
        if (insertItemError) throw insertItemError;

        // Enregistrement dans historique

        const { error: insertHistError } = await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: insertedId,
                action: 'Sauvegarde d\'une DRFMS numéro ' + insertedId,
                niv_val:niveauDRFMS.erg,
                type:'sauvegarde',
                cat_proc: 'drfms'
            });

        if (insertHistError) throw insertHistError;

        showAlert('DRFMS envoyée avec succès!', 'Succès', 'success');
        navigateTo('/demande/drfms')
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la demande DRFMS:', error);
        showAlert('Erreur lors de l\'envoi de la demande DRFMS. Veuillez réessayer.', 'Erreur', 'danger');
    }
}
// LIFECYCLE //
onMounted(() => {
    listtype()
})
</script> 
<style>

</style>