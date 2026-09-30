<template>
    <ValidationNdfDetail
        titre="VALIDATION NDF - FINANCE"
        :niveau="niveauNDF.finance"
        retour-path="/finance/ndf"
        :columns="columns"
        :actions="actions"
        :mass-validation="massValidation"
    />
</template>

<script setup>
import { niveauNDF } from '~/assets/js/CommonVariable.js'
import ValidationNdfDetail from '~/components/ValidationNdfDetail.vue'

const columns = [
    { key: 'num', label: 'N°' },
    { key: 'description', label: 'Libellé de facture / Commentaires'},
    { key: 'nature', label: 'Nature de la dépense'},
    { key: 'ok', label: 'OK/NOK'},
    { key: 'montant', label: 'Montant (Ar)'},
    {
        key: 'imputation',
        label: 'Imputation analytique',
        editable: true,
        type: 'select',
        disabled:true
        // options injectées automatiquement
    },
    {
        key: 'com_sup',
        label: 'Commentaire du supérieur',
    },
    {
        key: 'com_fin',
        label: 'Commentaire finance',
        editable: true,
        type: 'textarea'
    },
    {
        key: 'motif',
        label: 'Motif de rejet',
        editable: true,
        type: 'textarea'
    }
]

const actions = [
    { label: 'Valider', color: 'success', type: 'validate' },
    { label: 'Rejeter', color: 'danger', type: 'reject', requireMotif: true },
    {
        label: 'Retourner au supérieur',
        color: 'primary',
        type: 'return',
        targetLevel: niveauNDF.superieur
    }
]

const massValidation = {
    enabled: true,
    title: 'Validation en masse',
    fields: [
        {
            key: 'com_fin',
            label: 'Commentaire',
            type: 'textarea'
        }
    ]
}
</script>