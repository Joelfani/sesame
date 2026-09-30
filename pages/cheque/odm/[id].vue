<template>
    <OdmForm
        titre="VALIDATION ODM - CHEQUE"
        :niveau="niveauODM.cheque"
        :show-demandeur="true"
        retour-path="/cheque/odm"
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
        colClass: 'col-4',
    },
    {
        key: 'miss_lieu',
        label: 'La mission aura lieu à',
        type: 'text',
        colClass: 'col-4',
    },
    {
        key: 'miss_date1',
        label: 'La mission aura lieu du',
        type: 'date',
        colClass: 'col-4',
    },
    {
        key: 'miss_date2',
        label: 'au',
        type: 'date',
        colClass: 'col-4',
    },
    {
        key: 'imputation',
        label: 'Imputation analytique',
        type: 'select',
        isImputation: true,
        colClass: 'col-4',
    },
    {
        key: 'tiger',
        label: 'Tiger',
        type: 'text',
        colClass: 'col-4',
    },
    {
        key: 'montant',
        label: 'Montant',
        type: 'montant',
        colClass: 'col-4',
    },
    {
        key: 'miss_cas',
        label: 'Sélection du per diem',
        type: 'radio_cas', 
        colClass: 'col-8',
    },
    
    {
        key: 'cheque',
        label: 'N° de chèque',
        type: 'text',
        levels: {
            [niveauODM.cheque]: 'edit' 
        },
        requiredAt: [niveauODM.cheque],
        colClass: 'col-4',
    },
    {
        key: 'emission',
        label: 'Date d\'émission',
        type: 'date',
        levels: {
            [niveauODM.cheque]: 'edit' 
        },
        requiredAt: [niveauODM.cheque],
        colClass: 'col-4',
    },
]

const actions = [
    { label: 'Valider', color: 'success', type: 'validate' },
    { label: 'Refuser', color: 'danger', type: 'reject', requireMotif: true }
]
</script>