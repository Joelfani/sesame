<template>
    <div class="container">
        <div class="login">
            <img class="logo_login" src="/public/logo.png" alt="">
            <h1>Se connecter</h1>
            <FormComponent
                :inputs="input"
                class_btn="btn btn-primary"
                label_button="Connexion"
                :hr_style="false"
                :modal_form="false"
                @submit="send_connexion"
            /> 
        </div>
    </div>
</template>

<script>
import FormComponent from '~/components/formComponent.vue';

export default{
    name:'loginPage',
    components:{
        FormComponent,
    },
    computed:{
        input(){
            return [
                {
                    id: 'email',
                    type: 'email',
                    label: 'Email',
                    placeholder: 'Entrer votre email',
                    
                    required: true,
                },
                {
                    id: 'password',
                    type: 'password',
                    label: 'Mot de passe',
                    placeholder: 'Entrer votre mot de passe',
                    required: true,
                }
            ];
        }
    }
}
</script>

<style scoped>
    .login {
        padding: 20px;
        margin: 20vh auto;
        width: 50%;
        text-align: center;
        background-color: #eeeeee31;
        border-radius: 8px;
        box-shadow: 0 10px 8px rgba(0, 0, 0, 0.1);
    }
    .logo_login {
        width: 110px;
        height: 100px;
        margin-bottom: 20px;
    }
    .login h1 {
        font-weight: bold;
    }
</style>