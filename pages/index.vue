<template>
    <div class="login-font">
        <div class="login">
            <img class="logo_login" src="/public/logo.png" alt="">
            <h1>Veuillez-vous connecter</h1>
            <FormLogin
                :inputs="input"
                label_button="Se connecter"
                :hr_style="false"
                :modal_form="false"
                :connexion="true"
                @submit="send_connexion"
            /> 
        </div>
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
    </div>
</template>

<script setup>

import '~/assets/css/loginPage.css'
const { $supabase } = useNuxtApp();
//import { ref } from 'vue'
//import api from '~/utils/api.js'
//DATA //
/*const categories = ref([

    { id: 1, name_ctg: 'Colaborateur' },
    { id: 2, name_ctg: 'Resposanble achat' },
    { id: 3, name_ctg: 'Resposable finance' },
    { id: 4, name_ctg: 'Controlleur de gestion' },
])*/
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: '' // success, error, warning, info
});
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
});

const send_connexion = async (formData) =>{
    try {
        //Verification si le compte est activer ou non
        
        // Connexion
        const { data, error } = await $supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });
        if (error) throw error;
        if (data.user) {
            // Redirect to dashboard or home page after successful login
            alert.value = {
                show: true,
                message: 'Connexion réussie!',
                title: 'Succès',
                type: 'success'
            };
            setTimeout(() => {
                alert.value.show = false;
                navigateTo('/dashboard'); // Adjust the route as necessary
            }, 2000);
        }
    } catch (error) {
        alert.value = {
            show: true,
            message: error.message,
            title: 'Erreur',
            type: 'danger'
        };
        setTimeout(() => {
            alert.value.show = false;
        }, 5000);
    }
};


</script>