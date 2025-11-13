<template>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-sm navbar-light fixed-top">
        <div class="container-fluid">
            <NuxtLink to="/demande" class="navbar-brand centre" style="margin-left: 5%;">
                <img class="logo_main_page" src="/logo.png">
            </NuxtLink>

            <ul class="navbar-nav align-items-center">
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/demande">Mes demandes</NuxtLink>
                </li>
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/validation">Mes validations</NuxtLink>
                </li>
                <li v-if="userStore.achat" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/achat">Achats</NuxtLink>
                </li>
                <li v-if="userStore.afe" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/AFE">AFE-BC</NuxtLink>
                </li>
                <li v-if="userStore.finance" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/finance">Finances</NuxtLink>
                </li>
                <li v-if="userStore.dpr" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/dpr">DPR</NuxtLink>
                </li>
                <li v-if="userStore.cheque" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/cheque">Chèques</NuxtLink>
                </li>
                <li v-if="userStore.livraison" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/livraison">Livraisons</NuxtLink>
                </li>
                <li v-if="userStore.fournisseur" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/fournisseur">Fournisseur</NuxtLink>
                </li>
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/suivi">Suivi</NuxtLink>
                </li>
                
                <li v-if="userStore.type_compte === 1" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/utilisateur">Utilisateurs</NuxtLink>
                </li>
                
                <li v-if="userStore.type_compte === 1" class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/historique">Actions</NuxtLink>
                </li>
                <li class="nav-item">
                    <div class="notification" @click="afficher_notif">
                        <div v-if="solos.length > 0 || sups.length > 0 || others.length > 0" class="point_notif"></div>
                        <img src="/public/icon/bell.png" alt="notification" class="notification_icon">
                    </div>
                <div v-if="notif" class="list_notification">
                    <div class="fermer_notif"><img src="/public/icon/croix.png" alt="fermer_notif" style="height: 10px; width: 10px;" @click="close_notif"></div>

                    <!-- NOTIF SUP -->
                    <div v-for="solo in solos" :key="solo.id" class="one_notif">
                        <div class="en_tete" style="color: rgb(44, 94, 138);">Demande numéros {{ solo.id_obj?.id }}</div>
                        <div class="detail" style="font-size: 14px;">Mise à jours sur la demande numéros {{ solo.id_obj?.id }}</div>
                        <div class="date_notif" style="font-size: 14px;color: #7d7b7bb7;">{{ solo.created_at }}</div>
                    </div>

                    <!-- NOTIF SUP -->
                    <div v-for="sup in sups" :key="sup.id" class="one_notif">
                        <div class="en_tete" style="color: rgb(44, 94, 138);">Demande numéros {{ sup.id_obj?.id }}</div>
                        <div class="detail" style="font-size: 14px;">Nouvelle demande numéros {{ sup.id_obj?.id }}</div>
                        <div class="date_notif" style="font-size: 14px;color: #7d7b7bb7;">{{ sup.created_at }}</div>
                    </div>

                    <!-- NOTIF OTHERS -->
                    <div v-for="other in others" :key="other.id" class="one_notif">
                        <div class="en_tete" style="color: rgb(44, 94, 138);">Demande numéros {{ other.id_obj }}</div>
                        <div class="detail" style="font-size: 14px;">Demande en attente de validation {{ other.niv_val === 2 ? 'au niveau de l\'achat' : other.niv_val === 3 ? 'au niveau de la finance' : other.niv_val === 4 ? 'au niveau du DPR' : other.niv_val === 5 ? 'pour emission de chèque' : 'pour livraison'  }}</div>
                        <div class="date_notif" style="font-size: 14px;color: #7d7b7bb7;">{{ other.created_at }}</div>
                    </div>
                </div>                
                </li>
                <li class="nav-item">
                    <NuxtLink class="nav-link btn btn-light" to="/profil">
                        <img :src="`/avatar/${userStore.genre}${userStore.avatar}.png`" alt="Avatar" class="avatar-image-change">
                        <p style="font-weight: bold;">{{ userStore.name_user }}</p>
                    </NuxtLink>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script setup>
import '~/assets/css/navbar.css'

import { ref } from 'vue';
//IMPORT
// Utilisation du module @nuxtjs/supabase
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()


//DATA
const notif = ref(false);
const data_notif = ref([])
const resultats = {};
const solos = ref([])
const sups = ref([])
const others = ref([])
const dataItems = ref([]);
//METHODS
const afficher_notif = async () => {
    notif.value = !notif.value;
    get_notif();
};
const get_notif = async () => {
    try{
        // NOTIF SOLO
        const { data: notif_solo, error: error_solo } = await supabase
        .from('ses_histo')
        .select('*, id_obj!inner(*,id_user)') // inner permet de faire une jointure interne 'INNER JOIN'
        .eq('id_obj.id_user', userStore.id)
        .neq('niv_val', 1)
        .eq('stat_not_sol', false)
        .order('id',{ ascending: false })
        
        

        if (error_solo) throw error_solo;
        solos.value = notif_solo
        console.log('notif solo', solos.value);
        
        
        //NOTIF SUP
        
        const { data: notif_sup, error: error_sup } = await supabase
        .from('ses_histo')
        .select('*, id_obj!inner(*,id_sup)') // inner permet de faire une jointure interne 'INNER JOIN'
        .eq('id_obj.id_sup', userStore.id)
        .eq('niv_val', 1)
        .eq('stat_not', false)
        .order('id',{ ascending: false })
        
        
        if (error_sup) throw error_sup;
        sups.value = notif_sup

        console.log('notif sup', sups.value);
        
        //AUTRE NOTIF
        const niveaux = [
            { key: 'achat', niv: 2},
            { key: 'finance', niv: 3},
            { key: 'dpr', niv: 4},
            { key: 'cheque', niv: 5},
            { key: 'livraison', niv: 6},
        ];

        for (const { key, niv } of niveaux) {
            if (userStore[key] === true) {
               // recrée la requête à chaque tour
                const { data, error } = await supabase
                .from('ses_histo')
                .select('*')
                .eq('stat_not', false)
                .eq('niv_val', niv)
                .order('id', { ascending: false })

                if (error) throw error

                resultats[key] = data || [] // stocke chaque résultat par rôle
            }
        }
        others.value = {...resultats}

        
        // Fusion des données
        /*
        data_notif.value = {
            notif_solo,
            notif_sup,
            ...resultats
        };*/
        others.value = [
        ...Object.values(others.value) // récupère tous les tableaux
        ].flat() // aplatit en un seul tableau
        
        console.log('data all',others.value);
        
    }catch (error) {
        console.log(error);
    }
}
const close_notif = async () =>{
    notif.value = !notif.value;
    try{
        
        for (const {id } of solos.value){
        
        const {error} = await supabase
        .from('ses_histo')
        .update({ stat_not_sol: true })
        .eq('id', id);
        if (error) throw error;
        
        }

        for (const {id } of sups.value){
        const {error} = await supabase
        .from('ses_histo')
        .update({ stat_not: true })
        .eq('id', id);
        if (error) throw error;
        
        }

        for (const {id } of others.value){
        const {error} = await supabase
        .from('ses_histo')
        .update({ stat_not: true })
        .eq('id', id);
        if (error) throw error;
        
        }
        get_notif();
    }catch(error){
        console.log(error);
    }
    
}
const getdataItems = async () => {
    try{
        const { data, error } = await supabase
        .from('ses_demItems')
        .select('*')
        
        if (error) throw error;
        
        dataItems.value = data;
        
    }catch(error){
        console.log(error);
    }
}
watch(
    () => dataItems.value,
    async (newRows) => {
        
        get_notif();
    },
    { deep: true }
)
// LIFECYCLE HOOKS
onMounted(async () => {
    
    get_notif();
    
    try {
        await getdataItems()
        
        await nextTick()
        if (realtimeStore && typeof realtimeStore.subscribeToTable === 'function') {
            realtimeStore.subscribeToTable('ses_demItems', 'dataItems', dataItems, 'id', 'asc')
        } else {
            console.error('Store realtime non disponible')
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
        showAlert('Erreur lors de l\'initialisation de la page', 'Erreur', 'danger')
    }
});

onBeforeUnmount(() => {
    if (realtimeStore && typeof realtimeStore.unsubscribeFromTable === 'function') {
        realtimeStore.unsubscribeFromTable('ses_demItems', 'dataItems')
    }
})
</script>