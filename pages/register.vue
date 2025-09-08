<template>
    <div class="login-font">
        <div class="login">
            <img class="logo_login" src="/public/logo.png" alt="">
            <h1>Inscriverez-vous</h1>
            <FormLogin
                :inputs="input"
                label_button="S'inscrire"
                :hr_style="false"
                :modal_form="false"
                @submit="send_register"
            /> 
        </div>
        <Alert/>
    </div>
    
</template>

<script setup>

import '~/assets/css/loginPage.css'
import { ref } from 'vue'
//import api from '~/utils/api.js'
//DATA //
/*const categories = ref([

    { id: 1, name_ctg: 'Colaborateur' },
    { id: 2, name_ctg: 'Resposanble achat' },
    { id: 3, name_ctg: 'Resposable finance' },
    { id: 4, name_ctg: 'Controlleur de gestion' },
])*/
const genres = ref([
    { id: 'M', name_genre: 'Homme' },
    { id: 'F', name_genre: 'Femme' },
])
// COMPUTED //
const input = computed(() => [
    /*{
        id: 'ctg',
        type: 'select',
        options: categories.value.map(category => ({
        value: category.id,
        text: category.name_ctg
        })),
        required: true,
        etat_option_login: true
    },*/
    {
        id: 'full_name',
        type: 'text',
        placeholder: 'Nom complet',
        required: true
    },
    {
        id: 'name_user',
        type: 'text',
        placeholder: 'Nom d\'utilisateur ( ex: Paul )',
        required: true
    },
    {
        id: 'email',
        type: 'email',
        placeholder: 'Email',
        required: true
    }, 
    {
        id: 'genre',
        type: 'select',
        options: genres.value.map(genre => ({
        value: genre.id,
        text: genre.name_genre
        })),
        required: true,
        etat_option_login: true,
        option_label: 'le genre'
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
});

const send_register = async (formData) =>{
    const verifie_user = await supabase.from('users').select('email').eq('email', formData.email).single()
    
}
</script>