<template>
    <OdmForm
        titre="VALIDATION ODM - RH"
        :niveau="niveauODM.rh"
        :show-demandeur="true"
        imputation-key="imputation"
        retour-path="/rh/odm"
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
        key: 'imputation',
        label: 'Imputation analytique',
        type: 'select',
        isImputation: true,
    },
    {
        key: 'miss_cas',
        label: 'Sélection du per diem',
        type: 'radio_cas', 
        colClass: 'col-12',
    },
]

const actions = [
    { label: 'Valider', color: 'success', type: 'validate' },
    { label: 'Refuser', color: 'danger', type: 'reject', requireMotif: true }
]
</script>