<template>
    <div class="imputation_page">
        <!-- Header avec titre et bouton ajouter -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>LISTE DE TOUTES LES IMPUTATIONS ANALYTIQUES</h1>
            <div class="link_imputation">
                <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#addImputation" @click="getInitialForm()">
                    Ajouter une imputation
                </button>
            </div>
        </div>
        <!-- Champ de recherche -->
        <div class="d-flex align-items-center">
            <input 
                type="search" 
                placeholder="Rechercher imputation" 
                class="form-control mb-3" 
                style="width: 250px; margin-right: 10px;"
                v-model="searchTerm"
                @input="filterImputations"
            >
        </div>
        <!-- Tableau des imputations -->
        <div class="table_block_list">
            <Table
                :columns="columns"
                :rows="searchTerm ? filteredImputations : imputations"
                :type_but_modal="true"
                :actions="
                [
                    { label: 'Modifier',  color: 'primary', type_modal: 1 },
                    { archive_but: true, label1: 'Archiver', label2: 'Désarchiver', color1: 'dark', color2: 'secondary', type_modal: 3 },
                ]"
                title_modal_edit="cette imputation"
                tableDelete="ses_imputation"
                @recovery_data="recovery_data"
                @delete="handleDelete"
                @load_data="loadImputations"
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
        <Modal id="addImputation" title="Ajouter une imputation analytique">
            <FormComponent
                :inputs="imputationInputs"
                label_button="Ajouter"
                class_btn="btn btn-success"
                :modal_form="true"
                :loading="isLoading"
                @submit="addImputation"
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
const imputations = ref([])
const filteredImputations = ref([])
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
    { key: 'nom', label: 'Nom' },
    { key: 'libelle', label: 'Libellé' }
]

//COMPUTED
// Configuration du formulaire d'ajout
const imputationInputs = computed(() => [
    {
        id: 'nom',
        type: 'text',
        label: 'Nom',
        placeholder: 'Ex: Projet A',
        required: true,
        initialValue: addInitilialValues.value.nom
    },
    {
        id: 'libelle',
        type: 'text',
        label: 'Libellé',
        placeholder: 'Description de l\'imputation',
        required: true,
        initialValue: addInitilialValues.value.libelle    
    }
])

const addInitilialValues = ref([])
const getInitialForm = () => {
    addInitilialValues.value = {
        nom: '',
        libelle: ''
    }
}

// Configuration du formulaire de modification
const initialValuesMod = ref([])
const inputModifier = computed(() => [
    {
        id: 'nom',
        type: 'text',
        label: 'Nom',
        placeholder: 'Ex: Projet A',
        required: true,
        initialValue: initialValuesMod.value.nom || ''
    },
    {
        id: 'libelle',
        type: 'text',
        label: 'Libellé',
        placeholder: 'Description de l\'imputation',
        required: true,
        initialValue: initialValuesMod.value.libelle || ''
    }
])


// METHODS

// Charger la liste des imputations
const loadImputations = async () => {
    loading.value = true;
    try {
        isLoading.value = true
        
        const { data, error } = await supabase
                .from('ses_imputation')
                .select('*')
                .order('id', { ascending: false });
        
        if (error) throw error
        
        imputations.value = data || []
        console.log('data', data);
        
        loading.value = false;
    } catch (error) {
        console.error('Erreur lors du chargement des imputations:', error)
        showAlert('Erreur lors du chargement des imputations', 'Oups!', 'danger')
    } finally {
        isLoading.value = false
    }
}

// Ajouter une imputation
const addImputation = async (formData) => {
    
    try {
        isLoading.value = true
        // Vérifier si l'imputation existe déjà
        const { data: existingImputation } = await supabase
            .from('ses_imputation')
            .select('*')
            .eq('nom', formData.nom.trim())
            .limit(1)
            .maybeSingle()
            
        if (existingImputation) {
            showAlert('Une imputation avec ce nom existe déjà', 'Oups!', 'danger')
            throw new Error('Une imputation avec ce nom existe déjà')
        }
        
        // Préparer les données à insérer
        const imputationData = {
            nom: formData.nom.trim(),
            libelle: formData.libelle.trim()
        }
        
        // Insérer en base de données
        const { error } = await supabase
            .from('ses_imputation')
            .insert([imputationData])
        
        if (error) throw error
        
        // Notification de succès
        showAlert('Imputation ajoutée avec succès!', 'Succès', 'success')
        getInitialForm()
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'imputation:', error)
        showAlert(error.message || 'Erreur lors de l\'ajout de l\'imputation', 'Oups!', 'danger')
    } finally {
        isLoading.value = false
    }
}

// Filtrer les imputations
const filterImputations = () => {
    if (!searchTerm.value) {
        filteredImputations.value = [...imputations.value]
        return
    }
    loading.value = true;
    const term = searchTerm.value.toLowerCase()
    filteredImputations.value = imputations.value.filter(imputation => 
        imputation.nom?.toLowerCase().includes(term) ||
        imputation.libelle?.toLowerCase().includes(term)
    )
    loading.value = false;
}

// Gérer la modification
    //retrouver les données de l'imputation à modifier
const recovery_data = (item) => {
    initialValuesMod.value = item
}
    //modifier l'imputation
const ModItem = async (formData) => {
    try {
        isLoading.value = true
        
        // Vérifier si l'imputation existe déjà
        const { data: existingImputation } = await supabase
            .from('ses_imputation')
            .select('*')
            .eq('nom', formData.nom.trim())
            .neq('id', initialValuesMod.value.id)
            .limit(1)
            .maybeSingle()   
                
        if (existingImputation) {
            showAlert('Une imputation avec ce nom existe déjà', 'Oups!', 'danger')
            throw new Error('Une imputation avec ce nom existe déjà')
        }

        // Mettre à jour en base de données
        const { error } = await supabase
            .from('ses_imputation')
            .update([formData])
            .eq('id', initialValuesMod.value.id)
        
        if (error) throw error
        
        // Notification de succès
        showAlert('Imputation modifiée avec succès!', 'Succès', 'success')
        
    } catch (error) {
        console.error('Erreur lors de la modification de l\'imputation:', error)
        showAlert(error.message || 'Erreur lors de la modification de l\'imputation', 'Oups!', 'danger')
    } finally {
        isLoading.value = false
    }
    
}

// Gérer la suppression
const handleDelete = async (imputation) => {
    try {
        const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer l'imputation "${imputation.nom}" ?`)
        
        if (!confirmDelete) return
        
        const { error } = await supabase
            .from('ses_imputation')
            .delete()
            .eq('id', imputation.id)
        
        if (error) throw error
        
        showAlert('Imputation supprimée avec succès!', 'Succès', 'success')
        
    } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        showAlert('Erreur lors de la suppression de l\'imputation', 'Oups!', 'danger')
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
        await loadImputations()        
        // S'abonner aux changements avec une vérification
        await nextTick() // Attendre que le DOM soit mis à jour
        if (realtimeStore && typeof realtimeStore.subscribeToTable === 'function') {
            realtimeStore.subscribeToTable('ses_imputation', 'imputations', imputations, 'id', 'desc')
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
        realtimeStore.unsubscribeFromTable('ses_imputation', 'imputations')
    }
})

</script>

<style scoped>
.alert-container {
    z-index: 1050;
}

.imputation_page {
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