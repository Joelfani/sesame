<template>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-sm navbar-light fixed-top">
        <div class="container-fluid">
            <NuxtLink to="/demande" class="navbar-brand centre logo-not-activer" style="margin-left: 5%;">
                <img class="logo_main_page" src="/logo.png">
            </NuxtLink>
            <ul class="navbar-nav align-items-center">
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/demande">Mes demandes</NuxtLink>
                </li>
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/validation">Mes validations</NuxtLink>
                </li>
                <li v-if="userStore.achat" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/achat">Achats</NuxtLink>
                </li>
                <li v-if="userStore.afe" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/AFE">AFE-BC</NuxtLink>
                </li>
                <li v-if="userStore.finance" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/finance">Finances</NuxtLink>
                </li>
                <li v-if="userStore.dpr" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/dpr">DPR</NuxtLink>
                </li>
                <li v-if="userStore.cheque" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/cheque">Chèques</NuxtLink>
                </li>
                <li v-if="userStore.livraison" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/livraison">Livraisons</NuxtLink>
                </li>
                <li v-if="userStore.fournisseur" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/fournisseur">Fournisseur</NuxtLink>
                </li>
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/suivi">Suivi</NuxtLink>
                </li>
                <li v-if="userStore.finance" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/signature">Signature</NuxtLink>
                </li>
                <li v-if="userStore.type_compte === 1" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/utilisateur">Utilisateurs</NuxtLink>
                </li>
                <li v-if="userStore.type_compte === 1" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/imputation">Imputation</NuxtLink>
                </li>
                <li v-if="userStore.type_compte === 1" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/historique">Actions</NuxtLink>
                </li>
                <li class="nav-item">
                    <div class="notification-wrapper" data-bs-toggle="modal" data-bs-target="#notificationModal" @click="openNotificationModal">
                        <div v-if="totalNotifications > 0" class="notification-badge">
                            {{ totalNotifications > 99 ? '99+' : totalNotifications }}
                        </div>
                        <img src="/public/icon/bell.png" alt="notification" class="notification-icon">
                    </div>
                </li>
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/profil">
                        <img :src="`/avatar/${userStore.genre}${userStore.avatar}.png`" alt="Avatar" class="avatar-image-change">
                        <p style="font-weight: bold;">{{ userStore.name_user }}</p>
                    </NuxtLink>
                </li>
            </ul>
        </div>
    </nav>

    <!-- Modal de notifications -->
    <div class="modal fade" id="notificationModal" tabindex="-1" aria-labelledby="notificationModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="max-width: 800px;">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="notificationModalLabel">
                        <i class="bi bi-bell-fill me-2"></i>
                        Notifications non lues
                        <span class="badge bg-primary rounded-pill ms-2">{{ totalNotifications }}</span>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="onglets-container">
                    <!-- Onglets de filtrage -->
                    <ul class="nav nav-tabs px-3 pt-3" id="notificationTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="all-tab" data-bs-toggle="tab" data-bs-target="#all-notifications" type="button" role="tab">
                                Toutes <span class="badge bg-secondary ms-1">{{ totalNotifications }}</span>
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="personal-tab" data-bs-toggle="tab" data-bs-target="#personal-notifications" type="button" role="tab">
                                Personnelles <span class="badge bg-info ms-1">{{ solos.length }}</span>
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="team-tab" data-bs-toggle="tab" data-bs-target="#team-notifications" type="button" role="tab">
                                Équipe <span class="badge bg-success ms-1">{{ sups.length }}</span>
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="system-tab" data-bs-toggle="tab" data-bs-target="#system-notifications" type="button" role="tab">
                                Système <span class="badge bg-warning ms-1">{{ others.length }}</span>
                            </button>
                        </li>
                    </ul>
                </div>
                <div class="modal-body p-0">
                    <!-- Contenu des onglets -->
                    <div class="tab-content" id="notificationTabContent">
                        <!-- Toutes les notifications -->
                        <div class="tab-pane fade show active" id="all-notifications" role="tabpanel">
                            <div class="notification-list">
                                <div v-if="totalNotifications === 0" class="text-center py-5">
                                    <img src="/public/icon/bell.png" alt="Aucune notification" style="width: 60px; opacity: 0.3;">
                                    <p class="text-muted mt-3">Aucune notification pour le moment</p>
                                </div>
                                
                                <!-- Notifications personnelles -->
                                <div v-for="solo in solos" :key="'solo-' + solo.id" class="notification-item personal" @click="goToRequestSolo(solo.id_obj?.id,'solo',solo.id)" data-bs-dismiss="modal">
                                    <div class="notification-icon">
                                        <i class="bi bi-person-check-fill text-primary"></i>
                                    </div>
                                    <div class="notification-content">
                                        <div class="notification-header">
                                            <span class="notification-badge badge bg-primary">Personnel</span>
                                            <span class="notification-number">#{{ solo.id_obj?.id }}</span>
                                        </div>
                                        <div class="notification-title">Mise à jour sur votre demande</div>
                                        <div class="notification-description">
                                            La demande n° {{ solo.id_obj?.id }} a été mise à jour
                                        </div>
                                        <div class="notification-footer">
                                            <span class="notification-time">
                                                <i class="bi bi-clock me-1"></i>{{ formatDate(solo.created_at) }}
                                            </span>
                                        </div>
                                    </div>
                                    <button class="btn-mark-read" @click.stop="markAsRead('solo', solo.id)" title="Marquer comme lu">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>

                                <!-- Notifications d'équipe -->
                                <div v-for="sup in sups" :key="'sup-' + sup.id" class="notification-item team" @click="goToRequestSup(sup.id_obj?.id,'sup', sup.id)" data-bs-dismiss="modal">
                                    <div class="notification-icon">
                                        <i class="bi bi-people-fill text-success"></i>
                                    </div>
                                    <div class="notification-content">
                                        <div class="notification-header">
                                            <span class="notification-badge badge bg-success">Équipe</span>
                                            <span class="notification-number">#{{ sup.id_obj?.id }}</span>
                                        </div>
                                        <div class="notification-title">Nouvelle demande à valider</div>
                                        <div class="notification-description">
                                            Une nouvelle demande n° {{ sup.id_obj?.id }} nécessite votre attention
                                        </div>
                                        <div class="notification-footer">
                                            <span class="notification-time">
                                                <i class="bi bi-clock me-1"></i>{{ formatDate(sup.created_at) }}
                                            </span>
                                        </div>
                                    </div>
                                    <button class="btn-mark-read" @click.stop="markAsRead('sup', sup.id)" title="Marquer comme lu">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>

                                <!-- Notifications système -->
                                <div v-for="other in others" :key="'other-' + other.id" class="notification-item system" @click="goToRequestOther(other.id_obj,other.niv_val,'other', other.id)" data-bs-dismiss="modal">
                                    <div class="notification-icon">
                                        <i class="bi bi-exclamation-circle-fill text-warning"></i>
                                    </div>
                                    <div class="notification-content">
                                        <div class="notification-header">
                                            <span class="notification-badge badge bg-warning">Système</span>
                                            <span class="notification-number">#{{ other.id_obj }}</span>
                                        </div>
                                        <div class="notification-title">Validation en attente</div>
                                        <div class="notification-description">
                                            {{ getValidationLevel(other.niv_val) }}
                                        </div>
                                        <div class="notification-footer">
                                            <span class="notification-time">
                                                <i class="bi bi-clock me-1"></i>{{ formatDate(other.created_at) }}
                                            </span>
                                        </div>
                                    </div>
                                    <button class="btn-mark-read" @click.stop="markAsRead('other', other.id)" title="Marquer comme lu">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Notifications personnelles uniquement -->
                        <div class="tab-pane fade" id="personal-notifications" role="tabpanel">
                            <div class="notification-list">
                                <div v-if="solos.length === 0" class="text-center py-5">
                                    <i class="bi bi-person-check" style="font-size: 3rem; opacity: 0.3;"></i>
                                    <p class="text-muted mt-3">Aucune notification personnelle</p>
                                </div>
                                <div v-for="solo in solos" :key="solo.id" class="notification-item personal" @click="goToRequestSolo(solo.id_obj?.id,'solo',solo.id)" data-bs-dismiss="modal">
                                    <div class="notification-icon">
                                        <i class="bi bi-person-check-fill text-primary"></i>
                                    </div>
                                    <div class="notification-content">
                                        <div class="notification-header">
                                            <span class="notification-number">#{{ solo.id_obj?.id }}</span>
                                        </div>
                                        <div class="notification-title">Mise à jour sur votre demande</div>
                                        <div class="notification-description">
                                            La demande n° {{ solo.id_obj?.id }} a été mise à jour
                                        </div>
                                        <div class="notification-footer">
                                            <span class="notification-time">
                                                <i class="bi bi-clock me-1"></i>{{ formatDate(solo.created_at) }}
                                            </span>
                                        </div>
                                    </div>
                                    <button class="btn-mark-read" @click.stop="markAsRead('solo', solo.id)">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Notifications d'équipe uniquement -->
                        <div class="tab-pane fade" id="team-notifications" role="tabpanel">
                            <div class="notification-list">
                                <div v-if="sups.length === 0" class="text-center py-5">
                                    <i class="bi bi-people" style="font-size: 3rem; opacity: 0.3;"></i>
                                    <p class="text-muted mt-3">Aucune notification d'équipe</p>
                                </div>
                                <div v-for="sup in sups" :key="sup.id" class="notification-item team" @click="goToRequestSup(sup.id_obj?.id,'sup', sup.id)" data-bs-dismiss="modal">
                                    <div class="notification-icon">
                                        <i class="bi bi-people-fill text-success"></i>
                                    </div>
                                    <div class="notification-content">
                                        <div class="notification-header">
                                            <span class="notification-number">#{{ sup.id_obj?.id }}</span>
                                        </div>
                                        <div class="notification-title">Nouvelle demande à valider</div>
                                        <div class="notification-description">
                                            Une nouvelle demande n° {{ sup.id_obj?.id }} nécessite votre attention
                                        </div>
                                        <div class="notification-footer">
                                            <span class="notification-time">
                                                <i class="bi bi-clock me-1"></i>{{ formatDate(sup.created_at) }}
                                            </span>
                                        </div>
                                    </div>
                                    <button class="btn-mark-read" @click.stop="markAsRead('sup', sup.id)">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Notifications système uniquement -->
                        <div class="tab-pane fade" id="system-notifications" role="tabpanel">
                            <div class="notification-list">
                                <div v-if="others.length === 0" class="text-center py-5">
                                    <i class="bi bi-exclamation-circle" style="font-size: 3rem; opacity: 0.3;"></i>
                                    <p class="text-muted mt-3">Aucune notification système</p>
                                </div>
                                <div v-for="other in others" :key="other.id" class="notification-item system" @click="goToRequestOther(other.id_obj,other.niv_val,'other', other.id)" data-bs-dismiss="modal">
                                    <div class="notification-icon">
                                        <i class="bi bi-exclamation-circle-fill text-warning"></i>
                                    </div>
                                    <div class="notification-content">
                                        <div class="notification-header">
                                            <span class="notification-number">#{{ other.id_obj }}</span>
                                        </div>
                                        <div class="notification-title">Validation en attente</div>
                                        <div class="notification-description">
                                            {{ getValidationLevel(other.niv_val) }}
                                        </div>
                                        <div class="notification-footer">
                                            <span class="notification-time">
                                                <i class="bi bi-clock me-1"></i>{{ formatDate(other.created_at) }}
                                            </span>
                                        </div>
                                    </div>
                                    <button class="btn-mark-read" @click.stop="markAsRead('other', other.id)">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" @click="markAllAsRead">
                        <i class="bi bi-check-all me-2"></i>Tout marquer comme lu
                    </button>
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Fermer</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import '~/assets/css/navbar.css'
import { ref, computed } from 'vue';
import { niveau } from '~/assets/js/CommonVariable';

// Utilisation du module @nuxtjs/supabase
const supabase = useSupabaseClient()
const router = useRouter()
// Store
const userStore = useUserStore()
// Store
const realtimeStore = useSubscribeStore()
//route
const route = useRoute();
//DATA
const data_notif = ref([])
const resultats = {};
const solos = ref([])
const sups = ref([])
const others = ref([])
const dataItems = ref([]);

// Computed
const totalNotifications = computed(() => {
    return solos.value.length + sups.value.length + others.value.length;
});

//METHODS
const openNotificationModal = async () => {
    await get_notif();
};

const get_notif = async () => {
    try{
        // NOTIF SOLO
        const { data: notif_solo, error: error_solo } = await supabase
        .from('ses_histo')
        .select('*, id_obj!inner(*,id_user)') 
        .eq('id_obj.id_user', userStore.id)
        .neq('niv_val', 1)
        .eq('stat_not_sol', false)
        .order('id',{ ascending: false })
        
        if (error_solo) throw error_solo;
        solos.value = notif_solo
        
        //NOTIF SUP
        const { data: notif_sup, error: error_sup } = await supabase
        .from('ses_histo')
        .select('*, id_obj!inner(*,id_sup)') 
        .eq('id_obj.id_sup', userStore.id)
        .eq('niv_val', 1)
        .eq('stat_not', false)
        .order('id',{ ascending: false })
        
        if (error_sup) throw error_sup;
        sups.value = notif_sup
        
        //AUTRE NOTIF
        const niveaux = [
            { key: 'achat', niv: niveau.achat},
            { key: 'afe', niv: niveau.afe},
            { key: 'finance', niv: niveau.finance},
            { key: 'dpr', niv: niveau.dpr},
            { key: 'cheque', niv: niveau.cheque},
            { key: 'livraison', niv: niveau.livraison},
        ];

        for (const { key, niv } of niveaux) {
            if (userStore[key] === true) {
                const { data, error } = await supabase
                .from('ses_histo')
                .select('*')
                .eq('stat_not', false)
                .eq('niv_val', niv)
                .order('id', { ascending: false })

                if (error) throw error

                resultats[key] = data || [] 
            }
        }
        
        others.value = [
            ...Object.values(resultats)
        ].flat()
        
    }catch (error) {
        console.log(error);
    }
}

const markAsRead = async (type, id) => {
    try {
        const column = type === 'solo' ? 'stat_not_sol' : 'stat_not';
        
        const { error } = await supabase
            .from('ses_histo')
            .update({ [column]: true })
            .eq('id', id);
        
        if (error) throw error;
        
        // Retirer la notification de la liste
        if (type === 'solo') {
            solos.value = solos.value.filter(n => n.id !== id);
        } else if (type === 'sup') {
            sups.value = sups.value.filter(n => n.id !== id);
        } else {
            others.value = others.value.filter(n => n.id !== id);
        }
    } catch(error) {
        console.log(error);
    }
}

const markAllAsRead = async () => {
    try {
        const soloIds = solos.value.map(n => n.id)
        const supIds = sups.value.map(n => n.id)
        const otherIds = others.value.map(n => n.id)

        solos.value = []
        sups.value = []
        others.value = []
        const promises = []

        if (soloIds.length > 0) {
            promises.push(
                supabase
                    .from('ses_histo')
                    .update({ stat_not_sol: true })
                    .in('id', soloIds)
            )
        }

        if (supIds.length > 0) {
            promises.push(
                supabase
                    .from('ses_histo')
                    .update({ stat_not: true })
                    .in('id', supIds)
            )
        }

        if (otherIds.length > 0) {
            promises.push(
                supabase
                    .from('ses_histo')
                    .update({ stat_not: true })
                    .in('id', otherIds)
            )
        }

        const results = await Promise.all(promises)

        // Vérifier les erreurs
        results.forEach(r => {
            if (r.error) throw r.error
        })

        // Vider l’état local instantanément
        solos.value = []
        sups.value = []
        others.value = []

    } catch (error) {
        console.error('Erreur markAllAsRead:', error)
    }
}


const goToRequestSolo = (requestId,type,id) => {
    // Naviguer vers la page de détails
    router.push(`/demande/${requestId}`);
    markAsRead(type,id)
    
}
const goToRequestSup = (requestId,type,id) => {
    // Naviguer vers la page de détails
    router.push(`/validation/${requestId}`);
    markAsRead(type,id)
}

const goToRequestOther = (requestId,cheminNiveau,type,id) => {
    console.log('niv',cheminNiveau);
    
    // Naviguer vers la page de détails
    if(cheminNiveau === niveau.achat) router.push(`/achat/${requestId}`);
    if(cheminNiveau === niveau.afe) router.push(`/afe/${requestId}`);
    if(cheminNiveau === niveau.finance) router.push(`/finance/${requestId}`);
    if(cheminNiveau === niveau.dpr) router.push(`/dpr/${requestId}`);
    if(cheminNiveau === niveau.cheque) router.push(`/cheque/${requestId}`);
    if(cheminNiveau === niveau.livraison) router.push(`/livraison/${requestId}`);

    markAsRead(type,id)
}

const getValidationLevel = (niv_val) => {
    if (niv_val === niveau.achat) return 'En attente de validation au niveau de l\'achat';
    if (niv_val === niveau.afe) return 'En attente de validation au niveau de l\'administration d\'achat';
    if (niv_val === niveau.finance) return 'En attente de validation au niveau de la finance';
    if (niv_val === niveau.dpr) return 'En attente de validation au niveau du DPR';
    if (niv_val === niveau.cheque) return 'En attente d\'émission de chèque';
    return 'En attente de livraison';
}

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
}

const getdataItems = async () => {
    try{
        const { data, error } = await supabase
        .from('ses_demItems')
        .select('*')
        
        if (error) throw error;
        
        dataItems.value = data;
    }catch(error){
        console.log(error);
    }
}

watch(
    () => dataItems.value,
    async (newRows) => {
        get_notif();
    },
    { deep: true }
)

// LIFECYCLE HOOKS
onMounted(async () => {
    get_notif();
    
    try {
        await getdataItems()
        
        await nextTick()
        if (realtimeStore && typeof realtimeStore.subscribeToTable === 'function') {
            realtimeStore.subscribeToTable('ses_demItems', 'dataItems', dataItems, 'id', 'asc')
        } else {
            console.error('Store realtime non disponible')
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
    }
});

onBeforeUnmount(() => {
    if (realtimeStore && typeof realtimeStore.unsubscribeFromTable === 'function') {
        realtimeStore.unsubscribeFromTable('ses_demItems', 'dataItems')
    }
})
</script>

<style scoped>
.router-link-exact-active:not(.logo-not-activer) {
    background-color: #58616b72;
    color: white;
}

/* Notification bell wrapper */
.notification-wrapper {
    position: relative;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.notification-wrapper:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.notification-icon {
    width: 24px;
    height: 24px;
    transition: transform 0.3s ease;
}

.notification-wrapper:hover .notification-icon {
    transform: scale(1.1) rotate(15deg);
}

.notification-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background: linear-gradient(135deg, #ff6b6b, #ff4757);
    color: white;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 10px;
    font-weight: bold;
    min-width: 18px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(255, 71, 87, 0.4);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

/* Modal styles */
.modal-dialog {
    max-width: 800px !important;
    width: 90%;
    margin: 1.75rem auto;
}

.modal-content {
    border-radius: 12px;
    border: none;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    background-color: #ffffff83 !important;
    opacity: 1 !important;
}

.modal-body {
    max-height: 60vh;
    overflow-y: auto;
    background-color: #ffffff !important;
    width: 100%;
}

/* Tabs */
.nav-tabs {
    border-bottom: 2px solid #e9ecef;
    background-color: #f8f9fa !important;
}

.nav-tabs .nav-link {
    color: #6c757d;
    border: none;
    padding: 12px 20px;
    font-weight: 500;
    transition: all 0.3s ease;
    background-color: transparent;
}

.nav-tabs .nav-link:hover {
    color: #495057;
    background-color: #e9ecef !important;
    border-radius: 8px 8px 0 0;
}

.nav-tabs .nav-link.active {
    color: #667eea;
    background-color: white !important;
    border-bottom: 3px solid #667eea;
    border-radius: 8px 8px 0 0;
}

/* Tab content */
.tab-content {
    background-color: #ffffff !important;
    width: 94%;
}

.tab-pane {
    background-color: #ffffff !important;
}

.modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 20px 24px;
    width: 100%;
}

.modal-title {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 1.25rem;
}
.onglets-container {
    border-bottom: 1px solid #e9ecef;
    background-color: #f8f9fa !important;
    width: 100%;
}
/* Notification list */
.notification-list {
    padding: 0;
    background-color: #ffffff !important;
}

.notification-item {
    display: flex;
    align-items: flex-start;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    background-color: #ffffff !important;
    opacity: 1 !important;
}

.notification-item:hover {
    background-color: #f8f9fa !important;
    transform: translateX(4px);
}

.notification-item:last-child {
    border-bottom: none;
}

.notification-item.personal {
    border-left: 4px solid #0d6efd;
}

.notification-item.team {
    border-left: 4px solid #198754;
}

.notification-item.system {
    border-left: 4px solid #ffc107;
}

.notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    flex-shrink: 0;
    margin-right: 16px;
}

.notification-icon i {
    font-size: 1.2rem;
}

.notification-content {
    flex: 1;
    min-width: 0;
}

.notification-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.notification-badge {
    font-size: 10px;
    padding: 2px 8px;
}

.notification-number {
    font-weight: 600;
    color: #6c757d;
    font-size: 0.85rem;
}

.notification-title {
    font-weight: 600;
    color: #212529 !important;
    margin-bottom: 4px;
    font-size: 0.95rem;
}

.notification-description {
    color: #6c757d !important;
    font-size: 0.875rem;
    line-height: 1.4;
    margin-bottom: 8px;
}

.notification-footer {
    display: flex;
    align-items: center;
    gap: 12px;
}

.notification-time {
    font-size: 0.75rem;
    color: #adb5bd;
    display: flex;
    align-items: center;
}

.btn-mark-read {
    background: none;
    border: none;
    color: #6c757d;
    padding: 8px;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.btn-mark-read:hover {
    background-color: #e9ecef;
    color: #198754;
}

.btn-mark-read i {
    font-size: 1.2rem;
}

/* Modal footer */
.modal-footer {
    padding: 16px 24px;
    background-color: #f8f9fa;
    border-radius: 0 0 12px 12px;
    width: 100%;
}

/* Responsive */
@media (max-width: 992px) {
    .modal-dialog {
        max-width: 90% !important;
    }
}

@media (max-width: 768px) {
    .modal-dialog {
        max-width: 95% !important;
        margin: 0.5rem;
    }
    
    .notification-item {
        padding: 12px 16px;
    }
    
    .notification-icon {
        width: 36px;
        height: 36px;
        margin-right: 12px;
    }
    
    .nav-tabs .nav-link {
        padding: 10px 12px;
        font-size: 0.875rem;
    }
    
    .nav-tabs .badge {
        display: none;
    }
}
</style>