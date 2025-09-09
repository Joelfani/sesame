<template>
    <div class="profil_page">
        <div class="tete d-flex align-items-center gap-3">
            <div class="avatar">
                <img src="/public/avatar/h5.png" alt="Avatar" class="avatar-image">
            </div>
            <div class="name_email">
                <h4>Bienvenue {{ userStore.name_user }}</h4>
                <p>{{ userStore.email }}</p>
                <p>{{ userStore.resp }}</p>
                <div v-if="btn_modifier == 'Enregistrer'" class="change_avatar d-flex align-items-center gap-2">
                    <div v-for="n in 5" :key="n" class="d-flex flex-column align-items-center gap-2">
                        <img :src="'/avatar/'+ type_avatar + n + '.png'" alt="Avatar" class="avatar-image-change" />
                    <input class="form-check-input" type="radio" name="avatar" :value="n" v-model="selectedAvatar" />
                    </div>      
                </div>
            </div>
            <div class="action flex-grow-1 d-flex justify-content-end">
                <button class="btn btn-primary" @click="modifier">{{ btn_modifier }}</button>
            </div>
        </div>
        <div class="row">
            <div class="col-6">
                <h3>Informations Personnel</h3>
                <div class="row">
                        <div class="col">
                            <label class="label">Nom et prénom</label>
                            <input type="text" class="form-control" value="TSARAFANIRY Tahina Joel" :disabled="disabled">
                        </div>
                        <div class="col">
                            <label class="label">Email</label>
                            <input type="email" class="form-control" value="joel.tsarafaniry@iecd.org" :disabled="disabled">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <label class="label">Téléphone</label>
                            <input type="text" class="form-control" value="034 12 345 67" :disabled="disabled">
                        </div>
                        <div class="col">
                            <label class="label">Fonction {{ userStore.genre }}</label>
                            <input type="text" class="form-control" value="Responsable informatique" :disabled="disabled">    
                        </div>

                    </div>
                    <div class="row">
                        <div class="col">
                            <label class="label">Genre</label>
                            <select name="genre" class="form-select" :disabled="disabled" v-model="genre">
                                <option value="Homme" >Homme</option>
                                <option value="Femme">Femme</option>
                            </select>
                        </div>
                        <div class="col">
                            <label class="label">Type de compte</label>
                            <select name="type" class="form-select" disabled>
                                <option value="1" selected>Super Administrateur</option>
                                <option value="2">Administrateur</option>
                                <option value="2">Collaborateur</option>
                            </select>
                        </div>

                    </div>
                    <div class="row">
                        <div class="col">
                            <label class="label">Supérieur</label>
                            <select name="sup" class="form-select"  v-model="superieur" :disabled="disabled">
                                <option value="idReponsable1" selected>Rakoto</option>
                                <option value="idReponsable2">Rabe</option>
                            </select>
                        </div>
                        <div class="col">
                            <br>
                            <button class="btn btn-danger">Deconnexion</button>
                        </div>

                    </div>
                </div>
            <div class="col-4">
                <h3>Accès</h3>

            </div>
            <div class="col-2">
                <h3>Droits</h3>
                <div class="row">
                    <div class="col">
                        <p>Ajouter</p>
                        <input class="form-control form-check-input" type="checkbox" v-model="checkbox" disabled>
                    </div>
                    <div class="col">
                        <p>Modifier</p>
                        <input class="form-control form-check-input" type="checkbox" v-model="checkbox" disabled>
                    </div>
                    <div class="col">
                        <p>Supprimer</p>
                        <input class="form-control form-check-input" type="checkbox" v-model="checkbox" disabled>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
</template>
<script setup>
//COMPUTED
const userStore = useUserStore();

//DATA
const selectedAvatar = ref(5);
const checkbox = ref(true);
const btn_modifier = ref("Modifier");
const disabled = ref(true);
const genre = ref();
const type_avatar = ref();
const superieur = ref("idReponsable1");

// METHODS
const modifier = () => {
    if(btn_modifier.value == "Enregistrer"){
        btn_modifier.value = "Modifier";
        disabled.value = !disabled.value;
    }else{
        if(genre.value == "Homme"){
            type_avatar.value = 'h';
        }else{
            type_avatar.value = 'f';
        }
        btn_modifier.value = "Enregistrer";
        disabled.value = !disabled.value;

    }
    

}
</script>