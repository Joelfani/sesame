<template>
    <OdmForm
        titre="NOUVEL ORDRE DE MISSION"
        sous-titre="Veuillez renseigner les informations de la mission"
        :is-create="true"
        retour-path="/demande/odm"
        :fields="fields"
    />
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'
import OdmForm from '~/components/OdmForm.vue'

const fields = [
    {
        key: 'miss_obj',
        label: 'Objectif de la mission',
        type: 'text',
        //colClass: 'col-12',
        createMode: 'edit',
        requiredOnCreate: true,
        levels: {
            [niveauODM.erg]: 'edit',
            [niveauODM.superieur]: 'readonly'
        },
        requiredAt: [niveauODM.erg]
    },
    {
        key: 'miss_lieu',
        label: 'La mission aura lieu à',
        type: 'text',
        createMode: 'edit',
        requiredOnCreate: true,
        levels: {
            [niveauODM.erg]: 'edit',
            [niveauODM.superieur]: 'readonly'
        },
        requiredAt: [niveauODM.erg]
    },
    {
        key: 'miss_date1',
        label: 'La mission aura lieu du',
        type: 'date',
        createMode: 'edit',
        requiredOnCreate: true,
        levels: {
            [niveauODM.erg]: 'edit',
            [niveauODM.superieur]: 'readonly'
        },
        requiredAt: [niveauODM.erg]
    },
    {
        key: 'miss_date2',
        label: 'au',
        type: 'date',
        createMode: 'edit',
        requiredOnCreate: true,
        levels: {
            [niveauODM.erg]: 'edit',
            [niveauODM.superieur]: 'readonly'
        },
        requiredAt: [niveauODM.erg]
    },
    {
        key: 'miss_cas',
        label: 'Sélection du per diem',
        type: 'radio_cas', // rendu spécial dans OdmForm
        colClass: 'col-12',
        createMode: 'edit',
        requiredOnCreate: true,
        levels: {
            [niveauODM.erg]: 'edit',
            [niveauODM.superieur]: 'readonly'
        },
        requiredAt: [niveauODM.erg]
    },
    {
        key: 'montant',
        label: 'Montant (Ar)',
        type: 'montant', // affichage disabled + calcul auto
        colClass: 'col-md-6',
        createMode: 'readonly',
        requiredOnCreate: false,
        levels: {
            [niveauODM.erg]: 'readonly',
            [niveauODM.superieur]: 'readonly'
        },
        requiredAt: []
    }
]
</script>