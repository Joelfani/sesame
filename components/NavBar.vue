<template>
    <!-- Navigation Bar (inchangée par rapport à l'original) -->
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
                <li v-if="userStore.finance" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/finance">Finances</NuxtLink>
                </li>
                <li v-if="userStore.cg" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/controlleur">CG</NuxtLink>
                </li>
                <li v-if="userStore.dpr" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/dpr">DPR</NuxtLink>
                </li>
                <li v-if="userStore.afe" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/AFE">AFE-BC</NuxtLink>
                </li>
                <li v-if="userStore.cheque" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/cheque">Chèques</NuxtLink>
                </li>
                <li v-if="userStore.livraison" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/livraison">Livraisons</NuxtLink>
                </li>
                <li v-if="userStore.rh" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/rh">RH</NuxtLink>
                </li>
                <li v-if="userStore.type_compte === 1 || userStore.achat || userStore.livraison || userStore.cheque || userStore.finance" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/rectification">Rectifications</NuxtLink>
                </li>
                <li v-if="userStore.fournisseur" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/fournisseur">Fournisseur</NuxtLink>
                </li>
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/suivi">Suivi</NuxtLink>
                </li>
                <li v-if="userStore.type_compte === 1 || userStore.finance || userStore.achat || userStore.rh" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" :to="userStore.rh && userStore.type_compte != 1 && !userStore.finance && !userStore.achat ? '/signature/drfms' : '/signature'">Signature</NuxtLink>
                </li>

                <li v-if="userStore.type_compte === 1" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/utilisateur">Utilisateurs</NuxtLink>
                </li>
                <li v-if="userStore.type_compte === 1" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/imputation">Imputation</NuxtLink>
                </li>
                <li v-if="userStore.type_compte === 1" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/historique">Historique</NuxtLink>
                </li>
                <li class="nav-item">
                    <div class="notification-wrapper" data-bs-toggle="modal" data-bs-target="#notificationModal" @click="openNotificationModal">
                        <div v-if="totalNotificationsAll > 0" class="notification-badge">
                            {{ totalNotificationsAll > 99 ? '99+' : totalNotificationsAll }}
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

                <!-- NOUVEAU : chips de filtre par flow (achat / drfms / ndf / odm / bourse).
                     Cliquer une chip filtre les 3 onglets ci-dessous sur ce flow uniquement ;
                     re-cliquer la chip active (ou "Tous") retire le filtre. -->
                <div class="flow-filter-bar px-3 pt-3">
                    <button
                        type="button"
                        class="flow-chip"
                        :class="{ active: activeFlowFilter === null }"
                        @click="activeFlowFilter = null"
                    >
                        Tous
                    </button>
                    <button
                        v-for="(flow, key) in flows"
                        :key="key"
                        type="button"
                        class="flow-chip"
                        :style="{ '--chip-color': flow.badgeColor }"
                        :class="{ active: activeFlowFilter === key }"
                        @click="activeFlowFilter = activeFlowFilter === key ? null : key"
                    >
                        {{ flow.label }}
                        <span v-if="countByFlow[key]" class="flow-chip-count">{{ countByFlow[key] }}</span>
                    </button>
                </div>

                <div class="onglets-container">
                    <!-- Onglets de filtrage -->
                    <ul class="nav nav-tabs px-3 pt-2" id="notificationTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="all-tab" data-bs-toggle="tab" data-bs-target="#all-notifications" type="button" role="tab">
                                Toutes <span class="badge bg-secondary ms-1">{{ totalNotifications }}</span>
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="personal-tab" data-bs-toggle="tab" data-bs-target="#personal-notifications" type="button" role="tab">
                                Personnelles <span class="badge bg-info ms-1">{{ filteredSolos.length }}</span>
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="team-tab" data-bs-toggle="tab" data-bs-target="#team-notifications" type="button" role="tab">
                                Équipe <span class="badge bg-success ms-1">{{ filteredSups.length }}</span>
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="system-tab" data-bs-toggle="tab" data-bs-target="#system-notifications" type="button" role="tab">
                                Système <span class="badge bg-warning ms-1">{{ filteredOthers.length }}</span>
                            </button>
                        </li>
                    </ul>
                </div>

                <div class="modal-body p-0">
                    <!-- Spinner de chargement (résout le "flash" de modal vide pendant le fetch) -->
                    <div v-if="isLoading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Chargement...</span>
                        </div>
                    </div>

                    <div v-else class="tab-content" id="notificationTabContent">
                        <!-- Toutes les notifications -->
                        <div class="tab-pane fade show active" id="all-notifications" role="tabpanel">
                            <div class="notification-list">
                                <div v-if="totalNotifications === 0" class="text-center py-5">
                                    <img src="/public/icon/bell.png" alt="Aucune notification" style="width: 60px; opacity: 0.3;">
                                    <p class="text-muted mt-3">Aucune notification pour le moment</p>
                                </div>

                                <!-- Notifications personnelles -->
                                <div v-for="solo in filteredSolos" :key="'solo-' + solo._flow + '-' + solo.id" class="notification-item personal" @click="goTo('solo', solo)" data-bs-dismiss="modal">
                                    <div class="notification-icon">
                                        <i class="bi bi-person-check-fill text-primary"></i>
                                    </div>
                                    <div class="notification-content">
                                        <div class="notification-header">
                                            <span class="notification-badge badge bg-primary">Personnel</span>
                                            <span class="badge flow-badge" :style="{ backgroundColor: flows[solo._flow].badgeColor }">{{ flows[solo._flow].label }}</span>
                                            <span class="notification-number">#{{ solo.id_obj?.id }}</span>
                                        </div>
                                        <div class="notification-title">Mise à jour sur votre demande</div>
                                        <div class="notification-description">
                                            {{ solo.action }}
                                        </div>
                                        <div class="notification-footer">
                                            <span class="notification-time">
                                                <i class="bi bi-clock me-1"></i>{{ formatDate(solo.created_at) }}
                                            </span>
                                        </div>
                                    </div>
                                    <button class="btn-mark-read" @click.stop="markAsRead('solo', solo)" title="Marquer comme lu">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>

                                <!-- Notifications d'équipe -->
                                <div v-for="sup in filteredSups" :key="'sup-' + sup._flow + '-' + sup.id" class="notification-item team" @click="goTo('sup', sup)" data-bs-dismiss="modal">
                                    <div class="notification-icon">
                                        <i class="bi bi-people-fill text-success"></i>
                                    </div>
                                    <div class="notification-content">
                                        <div class="notification-header">
                                            <span class="notification-badge badge bg-success">Équipe</span>
                                            <span class="badge flow-badge" :style="{ backgroundColor: flows[sup._flow].badgeColor }">{{ flows[sup._flow].label }}</span>
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
                                    <button class="btn-mark-read" @click.stop="markAsRead('sup', sup)" title="Marquer comme lu">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>

                                <!-- Notifications système -->
                                <div v-for="other in filteredOthers" :key="'other-' + other._flow + '-' + other.id" class="notification-item system" @click="goTo('other', other)" data-bs-dismiss="modal">
                                    <div class="notification-icon">
                                        <i class="bi bi-exclamation-circle-fill text-warning"></i>
                                    </div>
                                    <div class="notification-content">
                                        <div class="notification-header">
                                            <span class="notification-badge badge bg-warning">Système</span>
                                            <span class="badge flow-badge" :style="{ backgroundColor: flows[other._flow].badgeColor }">{{ flows[other._flow].label }}</span>
                                            <span class="notification-number">#{{ other.id_obj?.id }}</span>
                                        </div>
                                        <div class="notification-title">Validation en attente</div>
                                        <div class="notification-description">
                                            {{ getNotificationLabel(other) }}
                                        </div>
                                        <div class="notification-footer">
                                            <span class="notification-time">
                                                <i class="bi bi-clock me-1"></i>{{ formatDate(other.created_at) }}
                                            </span>
                                        </div>
                                    </div>
                                    <button class="btn-mark-read" @click.stop="markAsRead('other', other)" title="Marquer comme lu">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Notifications personnelles uniquement -->
                        <div class="tab-pane fade" id="personal-notifications" role="tabpanel">
                            <div class="notification-list">
                                <div v-if="filteredSolos.length === 0" class="text-center py-5">
                                    <i class="bi bi-person-check" style="font-size: 3rem; opacity: 0.3;"></i>
                                    <p class="text-muted mt-3">Aucune notification personnelle</p>
                                </div>
                                <div v-for="solo in filteredSolos" :key="solo._flow + '-' + solo.id" class="notification-item personal" @click="goTo('solo', solo)" data-bs-dismiss="modal">
                                    <div class="notification-icon">
                                        <i class="bi bi-person-check-fill text-primary"></i>
                                    </div>
                                    <div class="notification-content">
                                        <div class="notification-header">
                                            <span class="badge flow-badge" :style="{ backgroundColor: flows[solo._flow].badgeColor }">{{ flows[solo._flow].label }}</span>
                                            <span class="notification-number">#{{ solo.id_obj?.id }}</span>
                                        </div>
                                        <div class="notification-title">Mise à jour sur votre demande</div>
                                        <div class="notification-description">
                                            {{ solo.action }}
                                        </div>
                                        <div class="notification-footer">
                                            <span class="notification-time">
                                                <i class="bi bi-clock me-1"></i>{{ formatDate(solo.created_at) }}
                                            </span>
                                        </div>
                                    </div>
                                    <button class="btn-mark-read" @click.stop="markAsRead('solo', solo)">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Notifications d'équipe uniquement -->
                        <div class="tab-pane fade" id="team-notifications" role="tabpanel">
                            <div class="notification-list">
                                <div v-if="filteredSups.length === 0" class="text-center py-5">
                                    <i class="bi bi-people" style="font-size: 3rem; opacity: 0.3;"></i>
                                    <p class="text-muted mt-3">Aucune notification d'équipe</p>
                                </div>
                                <div v-for="sup in filteredSups" :key="sup._flow + '-' + sup.id" class="notification-item team" @click="goTo('sup', sup)" data-bs-dismiss="modal">
                                    <div class="notification-icon">
                                        <i class="bi bi-people-fill text-success"></i>
                                    </div>
                                    <div class="notification-content">
                                        <div class="notification-header">
                                            <span class="badge flow-badge" :style="{ backgroundColor: flows[sup._flow].badgeColor }">{{ flows[sup._flow].label }}</span>
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
                                    <button class="btn-mark-read" @click.stop="markAsRead('sup', sup)">
                                        <i class="bi bi-check2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Notifications système uniquement -->
                        <div class="tab-pane fade" id="system-notifications" role="tabpanel">
                            <div class="notification-list">
                                <div v-if="filteredOthers.length === 0" class="text-center py-5">
                                    <i class="bi bi-exclamation-circle" style="font-size: 3rem; opacity: 0.3;"></i>
                                    <p class="text-muted mt-3">Aucune notification système</p>
                                </div>
                                <div v-for="other in filteredOthers" :key="other._flow + '-' + other.id" class="notification-item system" @click="goTo('other', other)" data-bs-dismiss="modal">
                                    <div class="notification-icon">
                                        <i class="bi bi-exclamation-circle-fill text-warning"></i>
                                    </div>
                                    <div class="notification-content">
                                        <div class="notification-header">
                                            <span class="badge flow-badge" :style="{ backgroundColor: flows[other._flow].badgeColor }">{{ flows[other._flow].label }}</span>
                                            <span class="notification-number">#{{ other.id_obj?.id }}</span>
                                        </div>
                                        <div class="notification-title">Validation en attente</div>
                                        <div class="notification-description">
                                            {{ getNotificationLabel(other) }}
                                        </div>
                                        <div class="notification-footer">
                                            <span class="notification-time">
                                                <i class="bi bi-clock me-1"></i>{{ formatDate(other.created_at) }}
                                            </span>
                                        </div>
                                    </div>
                                    <button class="btn-mark-read" @click.stop="markAsRead('other', other)">
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
// Store utilisateur (rôles, flags achat/finance/cg/dpr/afe/cheque/livraison/rh, etc.)
const userStore = useUserStore()

// Toute la logique de notification (5 flows) vit dans le composable —
// ce composant ne fait plus que l'afficher et réagir aux clics.
const {
    isLoading,
    totalNotificationsAll,
    totalNotifications,
    countByFlow,
    activeFlowFilter,
    filteredSolos,
    filteredSups,
    filteredOthers,
    flows,
    fetchAll,
    markAsRead,
    markAllAsRead,
    goTo,
    getNotificationLabel,
    subscribeRealtime,
    unsubscribeRealtime,
} = useSesameNotifications()

// Ouverture du modal : on ne relance pas fetchAll() si un chargement est
// déjà en cours (évite d'empiler des requêtes si l'utilisateur clique
// plusieurs fois rapidement sur la cloche)
const openNotificationModal = async () => {
    if (isLoading.value) return
    await fetchAll()
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

// LIFECYCLE HOOKS
onMounted(async () => {
    await fetchAll()
    subscribeRealtime()
});

onBeforeUnmount(() => {
    unsubscribeRealtime()
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

/* NOUVEAU : chips de filtre par flow */
.flow-filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    background-color: #ffffff !important;
}

.flow-chip {
    --chip-color: #6c757d;
    border: 1.5px solid var(--chip-color);
    color: var(--chip-color);
    background: white;
    border-radius: 999px;
    padding: 4px 12px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
}

.flow-chip.active {
    background: var(--chip-color);
    color: white;
}

.flow-chip-count {
    background: rgba(0, 0, 0, 0.12);
    border-radius: 999px;
    padding: 0 6px;
    font-size: 0.7rem;
}

.flow-chip.active .flow-chip-count {
    background: rgba(255, 255, 255, 0.3);
}

/* Badge de flow affiché sur chaque notification */
.flow-badge {
    color: white;
    font-size: 10px;
    padding: 2px 8px;
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
    flex-wrap: wrap;
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