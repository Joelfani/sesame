<template>
    <div class="select" style="width: 250px;">
        <select v-if="normalSelect" class="form-select" v-model="selectedType" @change="naviguer">
            <option v-if="viewAchat" :value="'/'+baseLink">Demande d'achat</option>
            <option v-if="viewDRFMS" :value="'/'+baseLink+'/drfms'">DRFMS</option>
            <option v-if="viewNDF" :value="'/'+baseLink+'/ndf'">NDF</option>
            <option v-if="viewODM" :value="'/'+baseLink+'/odm'">ODM</option>
            <option v-if="viewODM" :value="'/'+baseLink+'/bourse'">Bourse Etudiant</option>
        </select>
        <select v-if="RHSelect" class="form-select" v-model="selectedType" @change="naviguer">
            <option v-if="viewDRFMS" value='/rh'>DRFMS</option>
            <option v-if="viewODM" value='/rh/odm'>ODM</option>
        </select>
    </div>
</template>
<script setup>
const props = defineProps({
    LinkSelected: { 
        type: String, 
        default: null 
    },
    baseLink: { 
        type: String, 
        default: null 
    },
    RHSelect: { 
        type: Boolean, 
        default: false 
    },
    normalSelect: { 
        type: Boolean, 
        default: true 
    },
    viewAchat: { 
        type: Boolean, 
        default: true 
    },
    viewDRFMS: { 
        type: Boolean, 
        default: true 
    },
    viewNDF: { 
        type: Boolean, 
        default: true 
    },
    viewODM: { 
        type: Boolean, 
        default: true 
    },
})

const selectedType = ref(props.LinkSelected);
const naviguer = () => {
    navigateTo(selectedType.value);
};

</script>