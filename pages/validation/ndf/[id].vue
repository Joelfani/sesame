<template>
    <ValidationNdfDetail
        titre="VALIDATION NDF - SUPÉRIEUR"
        :niveau="niveauNDF.superieur"
        retour-path="/validation/ndf"
        :check-sup="true"
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
    { key: 'date', label: 'Date' },
    { key: 'description', label: 'Libellé de facture / Commentaires'},
    { key: 'nature', label: 'Nature de la dépense'},
    { key: 'montant', label: 'Montant (Ar)'},
    {
        key: 'imputation',
        label: 'Imputation analytique',
        editable: true,
        type: 'select',
        required: true
        // options injectées automatiquement
    },
    {
        key: 'com_sup',
        label: 'Commentaire du supérieur',
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
        label: 'Retourner',
        color: 'outline-primary',
        type: 'return',
        targetLevel: niveauNDF.erg,
        labelLevel: 'collaborateur',
        requireMotif: true   // ← ouvre le modal
    }
]
const massValidation = {
    enabled: true,
    title: 'Validation en masse',
    fields: [
        {
            key: 'imputation',
            label: 'Imputation analytique',
            type: 'select',
            required: true
        },
        {
            key: 'com_sup',
            label: 'Commentaire',
            type: 'textarea'
        }
    ]
}
</script>