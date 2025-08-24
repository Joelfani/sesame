<template>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-sm navbar-light fixed-top justify-content-center">
        <div class="container">
            <NuxtLink to="/demande" class="navbar-brand centre">
                <img class="logo_main_page" src="/logo.png">
            </NuxtLink>

            <ul class="navbar-nav">
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/demande">Mes demandes</NuxtLink>
                </li>
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/validation">Mes validations</NuxtLink>
                </li>
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/fournisseur">Mes fournisseur</NuxtLink>
                </li>
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/profil">Mon profil</NuxtLink>
                </li>
                <div class="notification" @click="afficher_notif">
                    <div class="point_notif"></div>
                    <img src="/public/icon/bell.png" alt="notification" class="notification_icon">
                </div>
                <div v-if="notif" class="list_notification">
                    <div class="fermer_notif"><img src="/public/icon/croix.png" alt="fermer_notif" style="height: 10px; width: 10px;" @click="afficher_notif"></div>
                    <div class="one_notif">
                        <div class="en_tete" style="color: rgb(44, 94, 138);">Demande numero 1</div>
                        <div class="detail" style="font-size: 14px;">Demande valider par le responsable de finance</div>
                        <div class="date_notif" style="font-size: 14px;color: #7d7b7bb7;">23 Aout 2025</div>
                    </div>
                    <div class="one_notif">
                        <div class="en_tete" style="color: rgb(44, 94, 138);">Demande numero 1</div>
                        <div class="detail" style="font-size: 14px;">Demande valider par superieur</div>
                        <div class="date_notif" style="font-size: 14px;color: #7d7b7bb7;">23 Aout 2025</div>
                    </div>
                    <div class="one_notif">
                        <div class="en_tete" style="color: rgb(44, 94, 138);">Demande numero 1</div>
                        <div class="detail" style="font-size: 14px;">Demande valider</div>
                        <div class="date_notif" style="font-size: 14px;color: #7d7b7bb7;">23 Aout 2025</div>
                    </div>
                    <div class="one_notif">
                        <div class="en_tete" style="color: rgb(44, 94, 138);">Demande numero 1</div>
                        <div class="detail" style="font-size: 14px;">Demande valider</div>
                        <div class="date_notif" style="font-size: 14px;color: #7d7b7bb7;">23 Aout 2025</div>
                    </div>
                    <div class="one_notif">
                        <div class="en_tete" style="color: rgb(44, 94, 138);">Demande numero 1</div>
                        <div class="detail" style="font-size: 14px;">Demande valider</div>
                        <div class="date_notif" style="font-size: 14px;color: #7d7b7bb7;">23 Aout 2025</div>
                    </div>
                    
                </div>
            </ul>
            
        </div>
    </nav>
</template>

<script setup>
import '~/assets/css/navbar.css'

import { ref } from 'vue';
const notif = ref(false);
const afficher_notif = () => {
    notif.value = !notif.value;
};
</script>