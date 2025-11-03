<template>
    <div class="profil_page">
        <div class="tete d-flex align-items-center gap-3">
            <div class="avatar">
                <img :src="`/avatar/${currentAvatar}.png`" alt="Avatar" class="avatar-image">
            </div>
            <div class="name_email">
                <h4>Bienvenue {{ userStore.name_user }}</h4>
                <p>{{ userStore.email }}</p>
                <p>{{ userStore.resp }}</p>
                <div v-if="isEditing" class="change_avatar d-flex align-items-center gap-2">
                    <div v-for="n in 12" :key="n" class="d-flex flex-column align-items-center gap-2">
                        <img :src="`/avatar/${type_avatar}${n}.png`" alt="Avatar" class="avatar-image-change" />
                        <input class="form-check-input" type="radio" name="avatar" :value="n" v-model="selectedAvatar" />
                    </div>      
                </div>
            </div>
            <div class="action flex-grow-1 d-flex justify-content-end">
                <button class="btn btn-primary" @click="toggleEdit">{{ btn_modifier }}</button>
                <button v-if="isEditing" class="btn btn-light ms-2" @click="cancelEdit">Annuler</button>
            </div>
        </div>
        <div class="row">
            <div class="col-6">
                <h3>Informations Personnel</h3>
                <div class="row">
                    <div class="col">
                        <label class="label">Nom complet</label>
                        <input 
                            type="text" 
                            class="form-control" 
                            v-model="formData.full_name"
                            :disabled="!isEditing"
                        >
                    </div>
                    <div class="col">
                        <label class="label">Nom d'utilisateur</label>
                        <input 
                            type="text" 
                            class="form-control" 
                            v-model="formData.name_user"
                            :disabled="!isEditing"
                        >
                    </div>
                    <div class="col">
                        <label class="label">Email</label>
                        <input 
                            type="email" 
                            class="form-control" 
                            v-model="formData.email"
                            :disabled="true"
                        >
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <label class="label">Téléphone</label>
                        <input 
                            type="number" 
                            class="form-control" 
                            v-model="formData.tel"
                            :disabled="!isEditing"
                        >
                    </div>
                    <div class="col">
                        <label class="label">Fonction</label>
                        <input 
                            type="text" 
                            class="form-control" 
                            v-model="formData.resp"
                            :disabled="!isEditing"
                        >    
                    </div>
                    <div class="col">
                        <label class="label">Genre</label>
                        <select 
                            name="genre" 
                            class="form-select" 
                            :disabled="true" 
                            v-model="formData.genre"
                        >
                            <option value="h">Homme</option>
                            <option value="f">Femme</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <label class="label">Type de compte</label>
                        <select name="type" class="form-select" disabled>
                            <option :value="userStore.type_compte" selected>{{ getTypeCompteLabel(userStore.type_compte) }}</option>
                        </select>
                    </div>
                    <div class="col">
                        <label class="label">Supérieur</label>
                        <select 
                            name="sup" 
                            class="form-select"  
                            v-model="formData.sup" 
                            :disabled="!isEditing"
                        >
                            <option value="">Aucun supérieur</option>
                            <option 
                                v-for="sup in superieursList" 
                                :key="sup.id" 
                                :value="sup.id"
                            >
                                {{ sup.full_name }}
                            </option>
                        </select>
                    </div>
                    <div class="col">
                        <br>
                        <button class="btn btn-danger" @click="logout">Déconnexion</button>
                    </div>
                </div>
                <div class="row">
                    
                </div>
            </div>
            <div class="col-4">
                <h3>Accès</h3>
                <div class="row">
                    <div class="col">
                        <p>Demande</p>
                        <input 
                            class="form-control form-check-input" 
                            type="checkbox" 
                            :disabled="true"
                            checked
                        >
                    </div>
                    <div class="col">
                        <p>validation</p>
                        <input 
                            class="form-control form-check-input" 
                            type="checkbox" 
                            :disabled="true"
                            checked
                        >
                    </div>
                    <div class="col">
                        <p>Achat</p>
                        <input 
                            class="form-control form-check-input" 
                            type="checkbox" 
                            v-model="formData.droits.achat" 
                            :disabled="true"
                        >
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <p>Finance</p>
                        <input 
                            class="form-control form-check-input" 
                            type="checkbox" 
                            v-model="formData.droits.finance" 
                            :disabled="true"
                        >
                    </div>
                    <div class="col">
                        <p>DPR</p>
                        <input 
                            class="form-control form-check-input" 
                            type="checkbox" 
                            v-model="formData.droits.dpr" 
                            :disabled="true"
                        >
                    </div>
                    <div class="col">
                        <p>Chèque</p>
                        <input 
                            class="form-control form-check-input" 
                            type="checkbox" 
                            v-model="formData.droits.cheque" 
                            :disabled="true"
                        >
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <p>Livraison</p>
                        <input 
                            class="form-control form-check-input" 
                            type="checkbox" 
                            v-model="formData.droits.livraison" 
                            :disabled="true"
                        >
                    </div>
                    <div class="col">
                        <p>Fournisseur</p>
                        <input 
                            class="form-control form-check-input" 
                            type="checkbox" 
                            v-model="formData.droits.fournisseur" 
                            :disabled="true"
                        >
                    </div>
                </div>
            </div>
            <div class="col-2">
                <h3>Droits</h3>
                <div class="row">
                    <div class="col">
                        <p>Ajouter</p>
                        <input 
                            class="form-control form-check-input" 
                            type="checkbox" 
                            v-model="formData.droits.add" 
                            :disabled="true"
                        >
                    </div>
                    <div class="col">
                        <p>Modifier</p>
                        <input 
                            class="form-control form-check-input" 
                            type="checkbox" 
                            v-model="formData.droits.edit" 
                            :disabled="true"
                        >
                    </div>
                    <div class="col">
                        <p>Supprimer</p>
                        <input 
                            class="form-control form-check-input" 
                            type="checkbox" 
                            v-model="formData.droits.delet" 
                            :disabled="true"
                        >
                    </div>
                </div>
            </div>
        </div>
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
    </div>
</template>

<script setup>
// Services
const supabase = useSupabaseClient()

// Store
const userStore = useUserStore()

// Data réactives
const isEditing = ref(false)
const btn_modifier = ref("Modifier")
const selectedAvatar = ref()
const type_avatar = ref()
const superieursList = ref([])

const alert = ref({
    show: false,
    message: '',
    title: '',
    type: '' // success, error, warning, info
})

// Données du formulaire (copie des données du store)
const formData = ref({
    full_name: '',
    name_user: '',
    email: '',
    tel: '',
    fonction: '',
    genre: '',
    sup: '',
    droits: {
        add: false,
        edit: false,
        delet: false,
        achat: false,
        finance: false,
        dpr: false,
        cheque: false,
        livraison: false,
        fournisseur: false
    }
})

// Données originales pour l'annulation
const originalData = ref({})

// Computed
const currentAvatar = computed(() => {
    const avatarType = formData.value.genre || 'h' // Par défaut homme
    return `${avatarType}${selectedAvatar.value}`
})
// Initialisation des données depuis le store
const initializeData = () => {
    formData.value = {
        full_name: userStore.full_name || '',
        name_user: userStore.name_user || '',
        email: userStore.email || '',
        tel: userStore.tel || '',
        resp: userStore.resp || '',
        genre: userStore.genre || '',
        sup: userStore.sup || '',
        droits: {
            add: userStore.add || false,
            edit: userStore.edit || false,
            delet: userStore.delet || false,
            achat: userStore.achat || false,
            finance: userStore.finance || false,
            dpr: userStore.dpr || false,
            cheque: userStore.cheque || false,
            livraison: userStore.livraison || false,
            fournisseur: userStore.fournisseur || false
        }
    }

    
    // Définir le type d'avatar selon le genre
    type_avatar.value = formData.value.genre || 'h'

    // Définir l'avatar sélectionné
    selectedAvatar.value = userStore.avatar || 1
    
    // Copie pour l'annulation
    originalData.value = JSON.parse(JSON.stringify(formData.value))

    
}

// Charger la liste des supérieurs
const loadSuperieurs = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, full_name')
            .eq('sesame', true) // Seulement les utilisateurs avec accès Sesame
            
        if (!error && data) {
            superieursList.value = data.filter(user => user.id !== userStore.id)
        }
    } catch (error) {
        console.error('Erreur lors du chargement des supérieurs:', error)
    }
}

// Méthodes
const toggleEdit = async () => {
    if (isEditing.value) {
        // Sauvegarder les modifications
        await saveChanges()
    } else {
        // Entrer en mode édition
        startEdit()
    }
}

const startEdit = () => {
    isEditing.value = true
    btn_modifier.value = "Enregistrer"
    
    // Mettre à jour le type d'avatar
    type_avatar.value = formData.value.genre || 'h'
}

const cancelEdit = () => {
    // Restaurer les données originales
    formData.value = JSON.parse(JSON.stringify(originalData.value))
    
    isEditing.value = false
    btn_modifier.value = "Modifier"
}

const saveChanges = async () => {
    try {
        // Préparer les données à sauvegarder
        const updateData = {
            full_name: formData.value.full_name,
            name_user: formData.value.name_user,
            tel: formData.value.telephone,
            resp: formData.value.fonction,
            avatar: selectedAvatar.value,
        }
        
        // Mise à jour en base de données
        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userStore.id)
            .select()
            .single()
        
        if (error) {
            throw error
        }
        
        // Mettre à jour le store
        userStore.updateUser(updateData)
        
        // Mettre à jour les données originales
        originalData.value = JSON.parse(JSON.stringify(formData.value))
        
        // Sortir du mode édition
        isEditing.value = false
        btn_modifier.value = "Modifier"
        
        // Notification de succès

        alertPop('Profil mis à jour avec succès!','success','Succès')
        
    } catch (error) {
        alertPop('Erreur lors de la sauvegarde.','danger','Oups!')
        console.error('Erreur lors de la sauvegarde:', error)
        // Gérer l'erreur (notification, etc.)
    }
}

const logout = async () => {
    try {
        await supabase.auth.signOut()
        await navigateTo('/')
        userStore.clearUser()
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
    }
}

const getTypeCompteLabel = (type) => {
    const types = {
        1: 'Administrateur',
        2: 'DPR',
        3: 'Collaborateur',
        4: 'Responsable Achats',
        5: 'Responsable Financier'
    }
    return types[type] || 'Inconnu'
}
// Alert function
const alertPop = (message,type,title) =>{
    alert.value = {
        show: true,
        message: message,
        title: title,
        type: type
    };
    setTimeout(() => {
        alert.value.show = false;
    }, 5000);
}

// Watchers
watch(() => formData.value.genre, (newGenre) => {
    type_avatar.value = newGenre 
})

// Initialisation au montage
onMounted(async () => {
    initializeData()
    await loadSuperieurs()
})

// Réinitialiser si le store change
watch(() => userStore, (newStore) => {
    if (newStore && !isEditing.value) {
        initializeData()
    }
}, { deep: true })
</script>