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
            <div class="col-7">
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
                
                <!-- Section Signature -->
                <div class="row mt-4">
                    <div class="col">
                        <h4>Ma Signature</h4>
                        <label class="label">Importer une signature (PNG, JPG, JPEG)</label>
                        <input 
                            class="form-control" 
                            ref="signatureInput" 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg"
                            @change="handleSignatureFile"
                        >
                        <p v-if="uploadingSignature" class="text-info mt-2">Enregistrement de la signature en cours...</p>
                        <button 
                            v-if="signatureFile" 
                            class="btn btn-success mt-2" 
                            @click="uploadSignature"
                            :disabled="uploadingSignature"
                        >
                            Enregistrer la signature
                        </button>
                        
                        <!-- Affichage de la signature existante -->
                        <div v-if="signatureUrl" class="mt-3">
                            <h5>Signature actuelle :</h5>
                            <div class="signature-container">
                                <img :src="signatureUrl" alt="Signature" class="signature-image">
                                <button 
                                    class="btn btn-outline-danger btn-sm mt-2" 
                                    @click="deleteSignature"
                                >
                                    Supprimer la signature
                                </button>
                            </div>
                        </div>
                        <div v-else class="mt-3">
                            <p class="text-muted">Aucune signature enregistrée</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-5">
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
                    <div class="col">
                        <p>AFE-BC</p>
                        <input 
                            class="form-control form-check-input" 
                            type="checkbox" 
                            v-model="formData.droits.afe" 
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

// Données pour la signature
const signatureInput = ref(null)
const signatureFile = ref(null)
const signatureFileName = ref('')
const uploadingSignature = ref(false)
const signatureUrl = ref(null)
const signatureStorageName = ref('')

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
        fournisseur: false,
        afe:false
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
            fournisseur: userStore.fournisseur || false,
            afe: userStore.afe || false
        }
    }

    // Définir le type d'avatar selon le genre
    type_avatar.value = formData.value.genre || 'h'

    // Définir l'avatar sélectionné
    selectedAvatar.value = userStore.avatar || 1
    
    // Copie pour l'annulation
    originalData.value = JSON.parse(JSON.stringify(formData.value))
}

// Charger la signature existante
const loadSignature = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('signature_url, signature_storage')
            .eq('id', userStore.id)
            .single()
        
        if (error) throw error
        
        if (data && data.signature_url) {
            signatureUrl.value = data.signature_url
            signatureStorageName.value = data.signature_storage || ''
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la signature:', error)
    }
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

// Gestion du fichier de signature
const handleSignatureFile = (event) => {
    signatureFile.value = event.target.files[0]
    if (signatureFile.value) {
        uploadingSignature.value = false
        signatureFileName.value = signatureFile.value.name
        console.log('Fichier de signature sélectionné:', signatureFile.value)
    } else {
        signatureFileName.value = ''
    }
}

// Upload de la signature
const uploadSignature = async () => {
    if (!signatureFile.value) {
        return alertPop("Veuillez sélectionner un fichier", 'danger', 'Oups!')
    }

    uploadingSignature.value = true
    
    try {
        // Supprimer l'ancienne signature si elle existe
        if (signatureStorageName.value) {
            await deleteSignatureFromStorage(signatureStorageName.value)
        }

        // Créer un chemin unique pour le fichier
        const fileStorageName = `${Date.now()}_${signatureFile.value.name}`
        const filePath = `signatures/${fileStorageName}`

        // Upload dans le bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('sesame_doc')
            .upload(filePath, signatureFile.value, {
                upsert: false,
            })

        if (uploadError) throw uploadError

        // Récupérer l'URL publique du fichier
        const { data: publicUrlData } = supabase.storage
            .from('sesame_doc')
            .getPublicUrl(filePath)

        const newSignatureUrl = publicUrlData.publicUrl

        // Mettre à jour dans la base de données
        const { error: updateError } = await supabase
            .from('users')
            .update({
                signature_url: newSignatureUrl,
                signature_storage: fileStorageName
            })
            .eq('id', userStore.id)

        if (updateError) throw updateError

        // Mettre à jour les variables locales
        signatureUrl.value = newSignatureUrl
        signatureStorageName.value = fileStorageName

        // Réinitialiser l'input
        signatureInput.value.value = null
        signatureFile.value = null
        signatureFileName.value = ''

        alertPop('Signature enregistrée avec succès', 'success', 'Succès')
    } catch (error) {
        console.error('Erreur lors de l\'upload de la signature:', error)
        alertPop("Erreur lors de l'enregistrement de la signature", 'danger', 'Oups!')
    } finally {
        uploadingSignature.value = false
    }
}

// Supprimer la signature du storage
const deleteSignatureFromStorage = async (storageName) => {
    if (!storageName) return

    const path = `signatures/${storageName}`
    try {
        const { error } = await supabase.storage
            .from('sesame_doc')
            .remove([path])

        if (error) throw error
    } catch (error) {
        console.error('Erreur lors de la suppression de la signature du storage:', error)
    }
}

// Supprimer la signature
const deleteSignature = async () => {
    try {
        // Supprimer du storage
        if (signatureStorageName.value) {
            await deleteSignatureFromStorage(signatureStorageName.value)
        }

        // Mettre à jour dans la base de données
        const { error } = await supabase
            .from('users')
            .update({
                signature_url: null,
                signature_storage: null
            })
            .eq('id', userStore.id)

        if (error) throw error

        // Réinitialiser les variables locales
        signatureUrl.value = null
        signatureStorageName.value = ''

        alertPop('Signature supprimée avec succès', 'success', 'Succès')
    } catch (error) {
        console.error('Erreur lors de la suppression de la signature:', error)
        alertPop('Erreur lors de la suppression de la signature', 'danger', 'Oups!')
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
            tel: formData.value.tel,
            resp: formData.value.resp,
            sup: formData.value.sup,
            avatar: selectedAvatar.value,
        }
        
        // Mise à jour en base de données
        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userStore.id)
            
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
    await loadSignature()
})

// Réinitialiser si le store change
watch(() => userStore, (newStore) => {
    if (newStore && !isEditing.value) {
        initializeData()
    }
}, { deep: true })
</script>

<style scoped>
.signature-container {
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 8px;
    background-color: #f9f9f9;
}

.signature-image {
    max-width: 300px;
    max-height: 150px;
    border: 1px solid #ccc;
    padding: 5px;
    background-color: white;
    display: block;
}
</style>