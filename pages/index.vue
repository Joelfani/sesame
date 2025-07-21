<template>
    <div class="login-font">
        <div class="container">
            
                <div class="login">
                    <img class="logo_login" src="/public/logo.png" alt="">
                    <h1>Veuillez-vous connecter</h1>
                    <FormLogin
                        :inputs="input"
                        label_button="Se connecter"
                        :hr_style="false"
                        :modal_form="false"
                        @submit="send_connexion"
                    /> 
                </div>
        </div>
    </div>
</template>

<script setup>

import '~/assets/css/loginPage.css'
import { ref } from 'vue'
    
//DATA //
const categories = ref([

    { id: 1, name_ctg: 'Colaborateur' },
    { id: 2, name_ctg: 'Resposanble achat' },
    { id: 3, name_ctg: 'Resposable finance' },
    { id: 4, name_ctg: 'Controlleur de gestion' },
])

// COMPUTED //
const input = computed(() => [
    {
        id: 'ctg',
        type: 'select',
        options: categories.value.map(category => ({
        value: category.id,
        text: category.name_ctg
        })),
        required: true,
        etat_option_login: true
    },
    {
        id: 'email',
        type: 'email',
        placeholder: 'Email',
        required: true
    },
    {
        id: 'password',
        type: 'password',
        placeholder: 'Mot de passe',
        required: true
    }
])

// METHODS //
definePageMeta({
    layout: false // No layout for this page
})
</script>