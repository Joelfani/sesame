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

<script>


export default{
    name:'loginPage',
    data(){
        return{
            categories: [

                { id: 1, name_ctg: 'Colaborateur' },
                { id: 2, name_ctg: 'Resposanble achat' },
                { id: 3, name_ctg: 'Resposable finance' },
                { id: 4, name_ctg: 'Controlleur de gestion' },


            ]
        }
    },
    computed:{
        input(){
            return [
                {
                    id: 'ctg',
                    type: 'select',
                    options: 
                    this.categories.map(category => ({
                        value: category.id,
                        text: category.name_ctg
                    })),
                    required: true,
                    etat_option_login: true,
                },
                {
                    id: 'email',
                    type: 'email',
                    placeholder: 'Email',
                    required: true,
                },
                {
                    id: 'password',
                    type: 'password',
                    placeholder: 'Mot de passe',
                    required: true,
                }
            ];
        }
    }
}
</script>

<style scoped>
    .login-font {
        background: url('/public/font_2.png') no-repeat center center fixed;
        background-size: cover; 
        height: 100vh;
        padding-top: 20vh;
    }
    
    .login {
        padding: 20px;
        margin: 0 auto;
        width: 50%;
        text-align: center;
        background-color: #eeeeeeb0;
        border-radius: 8px;
        box-shadow: 0 10px 8px rgba(0, 0, 0, 0.1);
    }
    .logo_login {
        width: 110px;
        height: 100px;
        margin-bottom: 20px;
    }

</style>