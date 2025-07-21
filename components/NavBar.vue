<template>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-sm bg-light navbar-light fixed-top justify-content-center">
        <div class="container">
            <NuxtLink to="/homepage" class="navbar-brand centre">
                <img class="logo_main_page" src="/public/logo.png">
            </NuxtLink>

            <ul class="navbar-nav">
                <li class="nav-item">
                    <NuxtLink class="nav-link" to="/demande">Mes demandes</NuxtLink>
                </li>
                <li class="nav-item">
                    <NuxtLink class="nav-link" to="/profil">Mon profil</NuxtLink>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script setup>
import '~/assets/css/navbar.css'
</script>