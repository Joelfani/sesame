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
                    <FormComponent
                        :inputs="inputModifierAcces"
                        label_button="Enregistrer"
                        class_btn="btn btn-primary"
                        :modal_form="true"
                        :loading="isLoading"
                        @submit="modifierAcces"
                    />
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
//loading
const loading = ref(true);
// DATA
const utilisateurs = ref([])
const filteredUtilisateurs = ref([])
const searchTerm = ref('')
const isLoading = ref(false)
const dataForRealtime = ref([])
const activeRealtime = ref(true);
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
    
]

// Configuration du formulaire de modification des accès
const initialValuesMod = ref({})

const inputModifierAcces = computed(() => [
    {
        id: 'achat',
        type: 'text',
        label: 'Accès Achat',
        initialValue: initialValuesMod.value.achat || false
    },
    {
        id: 'afe',
        type: 'checkbox',
        label: 'Accès Administration Achat',
        initialValue: initialValuesMod.value.afe || false
    },
    {
        id: 'dpr',
        type: 'checkbox',
        label: 'Accès DPR',
        initialValue: initialValuesMod.value.dpr || false
    },
    {
        id: 'finance',
        type: 'checkbox',
        label: 'Accès Finance',
        initialValue: initialValuesMod.value.finance || false
    },
    {
        id: 'cheque',
        type: 'checkbox',
        label: 'Accès Chèque',
        initialValue: initialValuesMod.value.cheque || false
    },
    {
        id: 'livraison',
        type: 'checkbox',
        label: 'Accès Livraison',
        initialValue: initialValuesMod.value.livraison || false
    },
    {
        id: 'fournisseur',
        type: 'checkbox',
        label: 'Accès Fournisseur',
        initialValue: initialValuesMod.value.fournisseur || false
    }
])

// METHODS

// Charger la liste des utilisateurs
const loadUtilisateurs = async () => {
    loading.value = true;
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
                activer: item.activer == true ? '✓' : '✗'
            }})
            loading.value = false;
        if(activeRealtime.value){
            dataForRealtime.value = data;
            activeRealtime.value = false;
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
    initialValuesMod.value = item
    console.log('item user', initialValuesMod.value.achat);
    
}

// Modifier les accès de l'utilisateur
const modifierAcces = async (formData) => {
    try {
        isLoading.value = true
        
        const updateData = {
            achat: formData.achat || false,
            afe: formData.afe || false,
            dpr: formData.dpr || false,
            finance: formData.finance || false,
            cheque: formData.cheque || false,
            livraison: formData.livraison || false,
            fournisseur: formData.fournisseur || false
        }
        
        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', initialValuesMod.value.id)
        
        if (error) throw error
        
        showAlert('Accès modifiés avec succès!', 'Succès', 'success')
        
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

.activation-modal {
    padding: 20px;
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
</style>