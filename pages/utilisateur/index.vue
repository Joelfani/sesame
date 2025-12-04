<template>
    <div class="utilisateurs_page">
        <!-- Header avec titre -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>LISTE DES UTILISATEURS</h1> 
        </div>
        
        <!-- Champ de recherche -->
        <div class="d-flex align-items-center">
            <input 
                type="search" 
                placeholder="Rechercher un utilisateur" 
                class="form-control mb-3" 
                style="width: 250px; margin-right: 10px;"
                v-model="searchTerm"
                @input="filterUtilisateurs"
            >
        </div>
        
        <!-- Tableau des utilisateurs -->
        <div class="table_block_list">
            <Table
                :columns="columns"
                :rows="searchTerm ? filteredUtilisateurs : utilisateurs"
                :type_but_modal="true"
                :actions="[
                    { label: 'Modifier', color: 'primary', type_modal: 1 },
                    { label: 'Activer/Désactiver', color: 'outline-dark', type_modal: 5 }
                ]"
                title_modal_edit="cet utilisateur"
                @recovery_data="recovery_data"
                @load_data="loadUtilisateurs"
                :loading="loading"
            >
                <!-- Modal de modification des accès -->
                <template #modal1="{ item }">
                    <div class="modification-modal">
                        <div class="modal-form">
                            <!-- Type de compte -->
                            <div class="form-group mb-4">
                                <label for="type_compte" class="form-label fw-bold">Type de compte</label>
                                <select 
                                    id="type_compte"
                                    class="form-select"
                                    v-model="formAcces.type_compte"
                                >
                                    <option :value="1">Administration</option>
                                    <option :value="3">Collaborateur</option>
                                </select>
                            </div>

                            <!-- Ligne 1: Achat, Admin, DPR -->
                            <div class="row mb-4">
                                <div class="col-4">
                                    <div class="checkbox-wrapper">
                                        <label class="checkbox-label" for="achat">Accès Achat</label>
                                        <input 
                                            class="form-check-input checkbox-large" 
                                            type="checkbox" 
                                            id="achat"
                                            v-model="formAcces.achat"
                                        >
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="checkbox-wrapper">
                                        <label class="checkbox-label" for="afe">Accès Admin Achat</label>
                                        <input 
                                            class="form-check-input checkbox-large" 
                                            type="checkbox" 
                                            id="afe"
                                            v-model="formAcces.afe"
                                        >
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="checkbox-wrapper">
                                        <label class="checkbox-label" for="dpr">Accès DPR</label>
                                        <input 
                                            class="form-check-input checkbox-large" 
                                            type="checkbox" 
                                            id="dpr"
                                            v-model="formAcces.dpr"
                                        >
                                    </div>
                                </div>
                            </div>

                            <!-- Ligne 2: Finance, Chèque, Livraison -->
                            <div class="row mb-4">
                                <div class="col-4">
                                    <div class="checkbox-wrapper">
                                        <label class="checkbox-label" for="finance">Accès Finance</label>
                                        <input 
                                            class="form-check-input checkbox-large" 
                                            type="checkbox" 
                                            id="finance"
                                            v-model="formAcces.finance"
                                        >
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="checkbox-wrapper">
                                        <label class="checkbox-label" for="cheque">Accès Chèque</label>
                                        <input 
                                            class="form-check-input checkbox-large" 
                                            type="checkbox" 
                                            id="cheque"
                                            v-model="formAcces.cheque"
                                        >
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="checkbox-wrapper">
                                        <label class="checkbox-label" for="livraison">Accès Livraison</label>
                                        <input 
                                            class="form-check-input checkbox-large" 
                                            type="checkbox" 
                                            id="livraison"
                                            v-model="formAcces.livraison"
                                        >
                                    </div>
                                </div>
                            </div>

                            <!-- Ligne 3: Fournisseur -->
                            <div class="row mb-4">
                                <div class="col-4">
                                    <div class="checkbox-wrapper">
                                        <label class="checkbox-label" for="fournisseur">Accès Fournisseur</label>
                                        <input 
                                            class="form-check-input checkbox-large" 
                                            type="checkbox" 
                                            id="fournisseur"
                                            v-model="formAcces.fournisseur"
                                        >
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex justify-content-end gap-2 mt-4">
                                <button 
                                    @click="modifierAcces"
                                    class="btn btn-primary"
                                    :disabled="isLoading"
                                    data-bs-dismiss="modal"
                                >
                                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                                    Enregistrer
                                </button>
                                <button 
                                    class="btn btn-light" 
                                    data-bs-dismiss="modal"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Modal d'activation/désactivation -->
                <template #modal5="{ item }">
                    <div class="activation-modal">
                        <h4 class="mb-4">
                            Voulez-vous <strong>{{ item.activer == '✓' ? 'désactiver' : 'activer' }}</strong> 
                            le compte de <strong>{{ item.full_name }}</strong> ?
                        </h4>
                        <div class="d-flex justify-content-end gap-2">
                            <button 
                                class="btn btn-secondary" 
                                @click="toggleActivation(item)"
                                data-bs-dismiss="modal"
                                :disabled="isLoading"
                            >
                                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                                {{ item.activer == '✓' ? 'Désactiver' : 'Activer' }}
                            </button>
                            <button 
                                class="btn btn-light" 
                                data-bs-dismiss="modal"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </template>
            </Table>
        </div>

        <!-- Alert pour les notifications -->
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
    </div>
</template>

<script setup>
// Services
const supabase = useSupabaseClient()

// Store
const realtimeStore = useSubscribeStore()

// Loading
const loading = ref(true)

// DATA
const utilisateurs = ref([])
const filteredUtilisateurs = ref([])
const searchTerm = ref('')
const isLoading = ref(false)
const dataForRealtime = ref([])
const activeRealtime = ref(true)

// Formulaire des accès
const formAcces = ref({
    type_compte: 3,
    achat: false,
    afe: false,
    dpr: false,
    finance: false,
    cheque: false,
    livraison: false,
    fournisseur: false
})

// Utilisateur en cours de modification
const currentUser = ref(null)

// Alert system
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: ''
})

// Définition des colonnes du tableau
const columns = [
    { key: 'full_name', label: 'Nom complet' },
    { key: 'email', label: 'Email' },
    { 
        key: 'activer', 
        label: 'État du compte',
        format: (value) => value ? 'Activé' : 'Désactivé',
        class: (value) => value ? 'badge bg-success' : 'badge bg-danger'
    },
    { key: 'type_compte_tab', label: 'Type de compte' }
]

// METHODS

// Charger la liste des utilisateurs
const loadUtilisateurs = async () => {
    loading.value = true
    try {
        isLoading.value = true
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('sesame', true)
            .order('full_name', { ascending: true })
        
        if (error) throw error
        
        utilisateurs.value = data.map(item => {
            return {
                ...item,
                activer: item.activer == true ? '✓' : '✗',
                type_compte_tab: item.type_compte == 1 ? 'Administrateur' : 'Collaborateur'
            }
        })
        
        loading.value = false
        
        if(activeRealtime.value){
            dataForRealtime.value = data
            activeRealtime.value = false
        }
            
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error)
        showAlert('Erreur lors du chargement des utilisateurs', 'Oups!', 'danger')
    } finally {
        isLoading.value = false
    }
}

// Filtrer les utilisateurs
const filterUtilisateurs = () => {
    if (!searchTerm.value) {
        filteredUtilisateurs.value = [...utilisateurs.value]
        return
    }
    
    const term = searchTerm.value.toLowerCase()
    filteredUtilisateurs.value = utilisateurs.value.filter(user => 
        user.full_name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
    )
}

// Récupérer les données de l'utilisateur à modifier
const recovery_data = (item) => {
    currentUser.value = item
    
    // Remplir le formulaire avec les valeurs actuelles
    formAcces.value = {
        type_compte: item.type_compte || 3,
        achat: item.achat || false,
        afe: item.afe || false,
        dpr: item.dpr || false,
        finance: item.finance || false,
        cheque: item.cheque || false,
        livraison: item.livraison || false,
        fournisseur: item.fournisseur || false
    }
}

// Modifier les accès de l'utilisateur
const modifierAcces = async () => {
    if (!currentUser.value) return
    
    try {
        isLoading.value = true
        
        const { error } = await supabase
            .from('users')
            .update(formAcces.value)
            .eq('id', currentUser.value.id)
        
        if (error) throw error
        
        showAlert('Accès modifiés avec succès!', 'Succès', 'success')
        await loadUtilisateurs()
        
    } catch (error) {
        console.error('Erreur lors de la modification des accès:', error)
        showAlert('Erreur lors de la modification des accès', 'Oups!', 'danger')
    } finally {
        isLoading.value = false
    }
}

// Activer/Désactiver un utilisateur
const toggleActivation = async (user) => {
    try {
        isLoading.value = true
        
        const newStatus = user.activer == '✓' ? false : true
        
        const { error } = await supabase
            .from('users')
            .update({ activer: newStatus })
            .eq('id', user.id)
        
        if (error) throw error
        
        showAlert(
            `Compte ${newStatus ? 'activé' : 'désactivé'} avec succès!`, 
            'Succès', 
            'success'
        )
        
        await loadUtilisateurs()
        
    } catch (error) {
        console.error('Erreur lors du changement de statut:', error)
        showAlert('Erreur lors du changement de statut', 'Oups!', 'danger')
    } finally {
        isLoading.value = false
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
    
    setTimeout(() => {
        alert.value.show = false
    }, 5000)
}

// Watch pour le realtime
watch(
    () => dataForRealtime.value,
    async (newRows) => {
        await loadUtilisateurs()
    },
    { deep: true }
)

// LIFECYCLE
onMounted(async () => {
    try {
        await loadUtilisateurs()
        
        await nextTick()
        if (realtimeStore && typeof realtimeStore.subscribeToTable === 'function') {
            realtimeStore.subscribeToTable('users', 'utilisateurs', dataForRealtime, 'id', 'asc')
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
        realtimeStore.unsubscribeFromTable('users', 'utilisateurs')
    }
})
</script>

<style scoped>
.alert-container {
    z-index: 1050;
}

.utilisateurs_page {
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
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.modification-modal,
.activation-modal {
    padding: 20px;
}

.modal-form {
    width: 100%;
}

.checkbox-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.checkbox-label {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #495057;
}

.checkbox-large {
    cursor: pointer;
    width: 1.5em;
    height: 1.5em;
    margin: 0;
}

.form-select {
    cursor: pointer;
}

.form-select:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.form-check {
    padding-left: 1.5rem;
}

.form-check-input {
    cursor: pointer;
    width: 1.2em;
    height: 1.2em;
}

.form-check-label {
    cursor: pointer;
    user-select: none;
    padding-left: 0.5rem;
}

.badge {
    padding: 0.5em 0.75em;
    font-size: 0.875em;
}

.text-success {
    font-weight: bold;
    font-size: 1.2em;
}

.text-danger {
    font-weight: bold;
    font-size: 1.2em;
}

.gap-2 {
    gap: 0.5rem;
}

.spinner-border-sm {
    width: 1rem;
    height: 1rem;
    border-width: 0.15em;
}
</style>