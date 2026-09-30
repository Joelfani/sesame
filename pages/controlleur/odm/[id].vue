<template>
    <OdmForm
        titre="VALIDATION ODM - CONTROLLEUR"
        :niveau="niveauODM.cg"
        :show-demandeur="true"
        retour-path="/controlleur/odm"
        :fields="fields"
        :actions="actions"
    />
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'

const fields = [
    {
        key: 'miss_obj',
        label: 'Objectif de la mission',
        type: 'text',
    },
    {
        key: 'miss_lieu',
        label: 'La mission aura lieu à',
        type: 'text',
    },
    {
        key: 'miss_date1',
        label: 'La mission aura lieu du',
        type: 'date',
    },
    {
        key: 'miss_date2',
        label: 'au',
        type: 'date',
    },
    {
        key: 'montant',
        label: 'Montant',
        type: 'montant',
    },
    {
        key: 'miss_cas',
        label: 'Sélection du per diem',
        type: 'radio_cas', 
        colClass: 'col-12',
    },
    {
        key: 'imputation',
        label: 'Imputation analytique',
        type: 'select',
        isImputation: true,
        levels: {
            [niveauODM.cg]: 'edit' 
        },
        requiredAt: [niveauODM.cg]
    },
    {
        key: 'tiger',
        label: 'Tiger',
        type: 'text',
        levels: {
            [niveauODM.cg]: 'edit' 
        },
        requiredAt: [niveauODM.cg]
    }
]

const actions = [
    { label: 'Valider', color: 'success', type: 'validate' },
    { label: 'Refuser', color: 'danger', type: 'reject', requireMotif: true }
]
</script>