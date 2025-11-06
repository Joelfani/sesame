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

// Utilisation du module @nuxtjs/supabase
const supabase = useSupabaseClient()
const user = useSupabaseUser()

//DATA //
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: '' // success, error, warning, info
})

// COMPUTED //
const input = computed(() => [
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
const alertPop = (message,type,title,time = 5000) =>{
    alert.value = {
        show: true,
        message: message,
        title: title,
        type: type
    };
    setTimeout(() => {
        alert.value.show = false;
    }, time);
}

const send_connexion = async (formData) => {
    try {
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('email', formData.email)
            .eq('sesame', true)
            .eq('activer', true)
            .maybeSingle()
        if (userError) throw userError
        if (!existingUser) {
            alertPop('Aucun compte trouvé avec cet email ou votre compte n\'est pas encore activer veuillez contacter l\'administrateur pour l\'activation','danger','Oups!')
            return
        }
        // Connexion avec Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        })

        if (error) throw error

        if (data.user) {
            alertPop('Connexion réussie! Redirection en cours...','success','Succès!',2800)
            // Redirection après connexion réussie
            
            setTimeout(() => {
                navigateTo('/demande', { replace: true })// replace:true pour éviter que la page login reste affichée
            }, 3000)
        }

    } catch (error) {
        console.error('Erreur de connexion:', error)
        
        // Gestion des erreurs spécifiques
        let errorMessage = 'Une erreur est survenue lors de la connexion.'
        
        if (error.message?.includes('Invalid login credentials')) {
            errorMessage = 'Email ou mot de passe incorrect.'
        } else if (error.message?.includes('Email not confirmed')) {
            errorMessage = 'Veuillez confirmer votre email avant de vous connecter.'
        } else if (error.message?.includes('Too many requests')) {
            errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.'
        }

        alertPop(errorMessage,'danger','Oups!')
    }
}
</script>