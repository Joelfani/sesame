<template>
    <div class="fournisseurs_page">
        <!-- Header avec titre et bouton ajouter -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>LISTE DE TOUS LES FOURNISSEURS</h1>
            <div class="link_fournisseur">
                <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#addFournisseur" @click="getInitialForm()">
                    Ajouter un fournisseur
                </button>
            </div>
        </div>
        <!-- Champ de recherche -->
        <div class="d-flex align-items-center">
            <input 
                type="search" 
                placeholder="Rechercher fournisseur" 
                class="form-control mb-3" 
                style="width: 250px; margin-right: 10px;"
                v-model="searchTerm"
                @input="filterFournisseurs"
            >
        </div>
        <!-- Tableau des fournisseurs -->
        <div class="table_block_list">
            <Table
                :columns="columns"
                :rows="searchTerm ? filteredFournisseurs : fournisseurs"
                :type_but_modal="true"
                :actions="
                [
                    { label: 'Modifier',  color: 'primary', type_modal: 1 },
                    { archive_but: true, label1: 'Archiver', label2: 'Désarchiver', color1: 'dark', color2: 'secondary', type_modal: 3 },
                ]"
                title_modal_edit="ce fournisseur"
                tableDelete="ses_fournisseurs"
                @recovery_data="recovery_data"
                @delete="handleDelete"
                @load_data="loadFournisseurs"
                :loading="loading"

            >
                <!-- Modal de modification -->
                <template #modal1="{ item }">
                    <FormComponent
                        :inputs="inputModifier"
                        label_button="Modifier"
                        class_btn="btn btn-primary"
                        :modal_form="true"
                        :loading="isLoading"
                        @submit="ModItem"
                    />
                </template>
            </Table>
        </div>

        <!-- Modal Ajouter -->
        <Modal id="addFournisseur" title="Ajouter un fournisseur">
            <FormComponent
                :inputs="fournisseurInputs"
                label_button="Ajouter"
                class_btn="btn btn-success"
                :modal_form="true"
                :loading="isLoading"
                @submit="addFournisseur"
            />
        </Modal>

        <!-- Alert pour les notifications -->
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
    </div>
</template>

<script setup>

//imports
//import { Modal } from 'bootstrap'
// Services
const supabase = useSupabaseClient()

// Store
const userStore = useUserStore()
const realtimeStore = useSubscribeStore()

//loading
const loading = ref(true);

// DATA
const fournisseurs = ref([])
const filteredFournisseurs = ref([])
const searchTerm = ref('')
const isLoading = ref(false)

// Alert system
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: '' // success, error, warning, info
})

// Définition des colonnes du tableau
const columns = [
    { key: 'nom', label: 'Nom du fournisseur' },
    { key: 'contact', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'contrat', label: 'Sous contrat' },
    { key: 'adresse', label: 'Adresse' },
    { key: 'type', label: 'Type de produits' },
    { key: 'nif', label: 'NIF' },
    { key: 'stat', label: 'STAT' },
]
//COMPUTED
// Configuration du formulaire d'ajout
const fournisseurInputs = computed(() => [
    {
        id: 'nom',
        type: 'text',
        label: 'Nom du fournisseur',
        placeholder: 'Ex: Société ABC',
        required: true,
        initialValue: addInitilialValues.value.nom
    },
    {
        id: 'contact',
        type: 'text',
        label: 'Contact',
        placeholder: 'Ex: 034 12 345 67',
        required: true,
        initialValue: addInitilialValues.value.contact    
    },
    {
        id: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'contact@fournisseur.com',
        initialValue: ''
    },
    {
        id: 'contrat',
        type: 'select',
        label: 'Contrat',
        required: true,
        options: [
            { value: 'Oui', text: 'Oui' },
            { value: 'Non', text: 'Non' }
        ],
        initialValue: ''
    },
    {
        id: 'adresse',
        type: 'text',
        label: 'Adresse',
        placeholder: 'Adresse complète du fournisseur',
        required: true,
        initialValue: ''
    },
    {
        id: 'type',
        type: 'text',
        label: 'Type de produits',
        required: true,
        initialValue: '',
        placeholder: 'Ex: Électronique, Alimentaire, etc.',
    },
    {
        id: 'nif',
        type: 'text',
        label: 'NIF',
        initialValue: '',
    },
    {
        id: 'stat',
        type: 'text',
        label: 'STAT',
        initialValue: '',
    }
])
const addInitilialValues = ref([])
const getInitialForm = () => {
    addInitilialValues.value = {
        nom: '',
        contact: '',
        email: '',
        contrat: '',
        adresse: '',
        type: '',
        nif: '',
        stat: ''
    }
}
// Configuration du formulaire de modification
const initialValuesMod = ref([])
const inputModifier = computed(() => [
    {
        id: 'nom',
        type: 'text',
        label: 'Nom du fournisseur',
        placeholder: 'Ex: Société ABC',
        required: true,
        initialValue: initialValuesMod.value.nom || ''
    },
    {
        id: 'contact',
        type: 'text',
        label: 'Contact',
        placeholder: 'Ex: 034 12 345 67',
        required: true,
        initialValue: initialValuesMod.value.contact || ''
    },
    {
        id: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'contact@fournisseur.com',
        initialValue: initialValuesMod.value.email || ''   
    },
    {
        id: 'contrat',
        type: 'select',
        label: 'Contrat',
        required: true,
        options: [
            { value: 'Oui', text: 'Oui' },
            { value: 'Non', text: 'Non' }
        ],
        initialValue: initialValuesMod.value.contrat || ''
    },
    {
        id: 'adresse',
        type: 'text',
        label: 'Adresse',
        placeholder: 'Adresse complète du fournisseur',
        required: true,
        initialValue:  initialValuesMod.value.adresse || ''
    },
    {   
        id: 'type',
        type: 'text',
        label: 'Type de produits',
        required: true,
        placeholder: 'Ex: Électronique, Alimentaire, etc.',
        initialValue: initialValuesMod.value.type || '' 
    }
    ,
    {
        id: 'nif',
        type: 'text',
        label: 'NIF',
        initialValue: initialValuesMod.value.nif || '' 
    },
    {
        id: 'stat',
        type: 'text',
        label: 'STAT',
        initialValue: initialValuesMod.value.stat || '' 
    }
])


// METHODS

// Charger la liste des fournisseurs
const loadFournisseurs = async () => {
    loading.value = true;
    try {
        isLoading.value = true
        
        const { data, error } = await await supabase
                .from('ses_fournisseurs')
                .select('*')
                .neq('id', 5000)//Exclure le fournisseur Autre...
                .order('id', { ascending: false });
        
        if (error) throw error
        
        fournisseurs.value = data || []
        //filteredFournisseurs.value = [...fournisseurs.value]
        loading.value = false;
    } catch (error) {
        console.error('Erreur lors du chargement des fournisseurs:', error)
        showAlert('Erreur lors du chargement des fournisseurs', 'Oups!', 'danger')
    } finally {
        isLoading.value = false
    }
}

// Ajouter un fournisseur
const addFournisseur = async (formData) => {
    
    try {
        isLoading.value = true
        // Vérifier si le fournisseur existe déjà
        const { data: existingFournisseur } = await supabase
            .from('ses_fournisseurs')
            .select('*')
            .eq('email', formData.email.trim().toLowerCase())
            .limit(1)
            .maybeSingle()
            
        if (existingFournisseur) {
            showAlert('Un fournisseur avec cet email existe déjà', 'Oups!', 'danger')
            throw new Error('Un fournisseur avec cet email existe déjà')
        }
        // Préparer les données à insérer
        const fournisseurData = {
            nom: formData.nom.trim(),
            contact: formData.contact.trim(),
            email: formData.email.trim().toLowerCase(),
            contrat: formData.contrat,
            adresse: formData.adresse?.trim() || '',
            type: formData.type,
            nif: formData.nif,
            stat: formData.stat
        }
        
        // Insérer en base de données
        const { error } = await supabase
            .from('ses_fournisseurs')
            .insert([fournisseurData])
        
        if (error) throw error
        
        // Notification de succès
        showAlert('Fournisseur ajouté avec succès!', 'Succès', 'success')
        getInitialForm()
    } catch (error) {
        console.error('Erreur lors de l\'ajout du fournisseur:', error)
        showAlert(error.message || 'Erreur lors de l\'ajout du fournisseur', 'Oups!', 'danger')
    } finally {
        isLoading.value = false
    }
}

// Filtrer les fournisseurs
const filterFournisseurs = () => {
    if (!searchTerm.value) {
        filteredFournisseurs.value = [...fournisseurs.value]
        return
    }
    loading.value = true;
    const term = searchTerm.value.toLowerCase()
    filteredFournisseurs.value = fournisseurs.value.filter(fournisseur => 
        fournisseur.nom?.toLowerCase().includes(term)
    )
    loading.value = false;
}

// Gérer la modification
    //retrouver les données du fournisseur à modifier
const recovery_data = (item) => {
    initialValuesMod.value = item
}
    //modifier le fournisseur
const ModItem = async (formData) => {
    try {
        isLoading.value = true
        
        // Vérifier si le fournisseur existe déjà
        const { data: existingFournisseur } = await supabase
            .from('ses_fournisseurs')
            .select('*')
            .eq('email', formData.email.trim().toLowerCase())
            .neq('id', initialValuesMod.value.id)
            .limit(1)
            .maybeSingle()   
                
        if (existingFournisseur) {
            showAlert('Un fournisseur avec cet email existe déjà', 'Oups!', 'danger')
            throw new Error('Un fournisseur avec cet email existe déjà')
        }

        // Insérer en base de données
        const { error } = await supabase
            .from('ses_fournisseurs')
            .update([formData])
            .eq('id', initialValuesMod.value.id)
        
        if (error) throw error
        
        // Notification de succès
        showAlert('Fournisseur modifié avec succès!', 'Succès', 'success')
        
    } catch (error) {
        console.error('Erreur lors de la modification du fournisseur:', error)
        showAlert(error.message || 'Erreur lors de la modification du fournisseur', 'Oups!', 'danger')
    } finally {
        isLoading.value = false
    }
    
}

// Gérer la suppression
const handleDelete = async (fournisseur) => {
    try {
        const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur "${fournisseur.nom}" ?`)
        
        if (!confirmDelete) return
        
        const { error } = await fournisseurTable.delete({ id: fournisseur.id })
        
        if (error) throw error
        
        showAlert('Fournisseur supprimé avec succès!', 'Succès', 'success')
        
    } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        showAlert('Erreur lors de la suppression du fournisseur', 'Oups!', 'danger')
    }
}

// Système d'alertes
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

// LIFECYCLE
onMounted(async () => {
    
    try {
        await loadFournisseurs()        
        // S'abonner aux changements avec une vérification
        await nextTick() // Attendre que le DOM soit mis à jour
        if (realtimeStore && typeof realtimeStore.subscribeToTable === 'function') {
            realtimeStore.subscribeToTable('ses_fournisseurs', 'fournisseurs', fournisseurs, 'id', 'desc')
        } else {
            console.error('Store realtime non disponible')
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
        showAlert('Erreur lors de l\'initialisation de la page', 'Erreur', 'danger')
    }
})

onBeforeUnmount(() => {    
    if (realtimeStore && typeof realtimeStore.unsubscribeFromTable === 'function') {
        realtimeStore.unsubscribeFromTable('ses_fournisseurs', 'fournisseurs')
    }
})

</script>

<style scoped>
.alert-container {
    z-index: 1050;
}

.fournisseurs_page {
    padding: 20px;
}

.table_block_list {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn {
    margin-right: 10px;
}

.form-control:focus {
    border-color: #28a745;
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}
</style>