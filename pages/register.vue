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
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
    </div>
</template>

<script setup>

import '~/assets/css/loginPage.css'
import { ref } from 'vue'
const { $supabase } = useNuxtApp()
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
    const verifie_user = await $supabase.from('users').select('email').eq('email', formData.email).single()
    if(verifie_user.data){
        alert.value = {
            show: true,
            message: 'Cet e-mail est déjà utilisé par un autre utilisateur !',
            type: 'danger',
            title: 'Oups!'
        };
    }
    else{
        try {
            // Enregistrer l'utilisateur dans auth.users
            const { data, error: authError } = await $supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: 'http://localhost:3000/'
                }
            })
        if(authError) throw authError
        const user = data.user // récupérer l'id de l'utilisateur

        // Modifier l'utilisateur dans public.users
        const { error: updateError } = await $supabase
            .from('users')
            .update({
                name_user: formData.name_user,
                full_name: formData.full_name,
                genre: formData.genre,
                sesame: true
            })
            .eq('id', user.id)
        if(updateError) throw updateError
        alert.value = {
            show: true,
            message: 'Inscription effectuée avec succès ! Veuillez vérifier votre e-mail pour confirmer votre inscription.',
            type: 'success',
            title: 'Bravo !'
        }
        } catch (error) {
            if (error.code === 'weak_password') {
                alert.value = {
                    show: true,
                    message: 'Le mot de passe doit contenir au moins 6 caractères.',
                    type: 'danger',
                    title: 'Oups!'
                };
            }
            else if (error.code === 'email_address_invalid') {
                alert.value = {
                    show: true,
                    message: 'L\'adresse e-mail est invalide.',
                    type: 'danger',
                    title: 'Oups!'
                };
            }
            else {
                alert.value = {
                    show: true,
                    message: 'Erreur lors de l\'ajout de l\'utilisateur.',
                    type: 'danger',
                    title: 'Oups!'
                };
            }
            console.error('Error adding user:', error)
        }
    }
    
    
}
</script>