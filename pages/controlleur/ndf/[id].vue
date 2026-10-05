<template>
    <ValidationNdfDetail
        titre="VALIDATION NDF - CONTROLLEUR"
        :niveau="niveauNDF.cg"
        retour-path="/controlleur/ndf"
        :columns="columns"
        :actions="actions"
        :mass-validation="massValidation"
    />
</template>

<script setup>
import { niveauNDF } from '~/assets/js/CommonVariable.js'

const columns = [
    { key: 'num', label: 'N°' },
    { key: 'description', label: 'Libellé de facture / Commentaires'},
    { key: 'nature', label: 'Nature de la dépense'},
    { key: 'montant', label: 'Montant (Ar)'},
    {
        key: 'imputation',
        label: 'Imputation analytique',
        editable: true,
        type: 'select',
        required: true
    },
    {
        key: 'tiger',
        label: 'Tiger',
        editable: true,
        type: 'text',
        required: true
    },
    {
        key: 'com_sup',
        label: 'Commentaire du supérieur',
    },
    {
        key: 'com_fin',
        label: 'Commentaire finance',
    },
    {
        key: 'com_cg',
        label: 'Commentaire CG',
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
]

const massValidation = {
    enabled: true,
    title: 'Validation en masse',
    fields: [
        {
            key: 'tiger',
            label: 'Tiger',
            type: 'text',
            required: true
        },
        {
            key: 'imputation',
            label: 'Imputation analytique (si vous voulez les modifier)',
            type: 'select'
        },
        {
            key: 'com_cg',
            label: 'Commentaire',
            type: 'textarea'
        }
    ]
}
</script>