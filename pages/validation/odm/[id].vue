<template>
    <OdmForm
        titre="VALIDATION ODM - SUPÉRIEUR"
        sous-titre="Renseignez l'imputation. Utilisez Modifier pour corriger les informations de mission."
        :niveau="niveauODM.superieur"
        :check-sup="true"
        :show-demandeur="true"
        :allow-edit-mode="true"
        imputation-key="imputation_odm"
        retour-path="/validation/odm"
        :fields="fields"
        :actions="actions"
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
        levels: {
            [niveauODM.superieur]: 'readonly' // readonly par défaut ; éditable après "Modifier"
        },
        requiredAt: [niveauODM.superieur]
    },
    {
        key: 'miss_lieu',
        label: 'La mission aura lieu à',
        type: 'text',
        levels: {
            [niveauODM.superieur]: 'readonly'
        },
        requiredAt: [niveauODM.superieur]
    },
    {
        key: 'miss_date1',
        label: 'La mission aura lieu du',
        type: 'date',
        levels: {
            [niveauODM.superieur]: 'readonly'
        },
        requiredAt: [niveauODM.superieur]
    },
    {
        key: 'miss_date2',
        label: 'au',
        type: 'date',
        levels: {
            [niveauODM.superieur]: 'readonly'
        },
        requiredAt: [niveauODM.superieur]
    },
    {
        key: 'montant',
        label: 'Montant',
        type: 'number',
        levels: {
            [niveauODM.superieur]: 'readonly'
        },
        requiredAt: [niveauODM.superieur]
    },
    {
        key: 'imputation',
        label: 'Imputation analytique',
        type: 'select',
        isImputation: true,
        levels: {
            [niveauODM.superieur]: 'edit' // toujours éditable
        },
        requiredAt: [niveauODM.superieur]
    }
]

const actions = [
    { label: 'Valider', color: 'success', type: 'validate' },
    {
        label: 'Retourner au collaborateur',
        color: 'dark',
        type: 'return',
        targetLevel: niveauODM.erg,
        requireMotif: true
    },
    { label: 'Refuser', color: 'danger', type: 'reject', requireMotif: true }
]
</script>