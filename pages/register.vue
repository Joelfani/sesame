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

// Utilisation du module @nuxtjs/supabase
const supabase = useSupabaseClient()
const router = useRouter()
//DATA //
const genres = ref([
    { id: 'h', name_genre: 'Homme' },
    { id: 'f', name_genre: 'Femme' },
])

const alert = ref({
    show: false,
    message: '',
    title: '',
    type: '' // success, error, warning, info
})

// COMPUTED //
const input = computed(() => [
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
        options:[
            { value: 'h', text: 'Homme' },
            { value: 'f', text: 'Femme' },
        ],
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
})
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
const send_register = async (formData) => {
    try {
        // Vérifier si l'utilisateur existe déjà
        const { data: existingUser } = await supabase
            .from('users')
            .select('email')
            .eq('email', formData.email)
            .single()
        
        if (existingUser) {
            alertPop('Un utilisateur avec cette adresse e-mail existe déjà.','danger','Oups!')
            return
        }

        // Enregistrer l'utilisateur dans auth.users
        const { data, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                emailRedirectTo: 'https://achat-sesame.vercel.app' // Indiquer a supabase ou redirectionner l'utilisateur apres avoir cliquer sur le lien 
            }
        })

        if (authError) throw authError
        
        const user = data.user // récupérer l'id de l'utilisateur

        // Mettre à jour l'utilisateur dans public.users
        const { error: updateError } = await supabase
            .from('users')
            .update({
                name_user: formData.name_user,
                full_name: formData.full_name,
                genre: formData.genre,
                sesame: true
            })
            .eq('id', user.id)

        if (updateError) throw updateError

        alertPop('Inscription réussie! Veuillez vérifier votre e-mail pour confirmer votre compte.','success','Succès!')

        setTimeout(() => {
            router.push('/')
        }, 3000);
        

    } catch (error) {
        console.error('Error during registration:', error)
        
        // Gestion des erreurs spécifiques
        if (error.code === 'weak_password') {

            alertPop('Le mot de passe doit avoir au moins 6 caractères.','danger','Oups!')

        } else if (error.code === 'email_address_invalid') {

            alertPop('L\'adresse e-mail est invalide.','danger','Oups!')

        } else if (error.message?.includes('User already registered')) {
            alertPop('Un utilisateur avec cette adresse e-mail existe déjà.','danger','Oups!')
            
        } else {
            alertPop('Une erreur est survenue lors de l\'inscription. Veuillez réessayer plus tard.','danger','Oups!')
        }
    }
}
</script>