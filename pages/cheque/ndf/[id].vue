<template>
    <ValidationNdfDetail
        titre="VALIDATION NDF - CHEQUE"
        :niveau="niveauNDF.cheque"
        retour-path="/cheque/ndf"
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
    },
    {
        key: 'tiger',
        label: 'Tiger',
    },
    {
        key: 'cheque',
        label: 'N° cheque',
        editable: true,
        type: 'number',
        required: true
    },
    {
        key: 'emission',
        label: 'Date d\'émission',
        editable: true,
        type: 'date',
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
    },
    {
        key: 'com_dpr',
        label: 'Commentaire DPR',
    },
    {
        key: 'com_cheque',
        label: 'Commentaire Cheque',
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
    { label: 'Rejeter', color: 'danger', type: 'reject', requireMotif: true }
]

const massValidation = {
    enabled: true,
    title: 'Validation en masse',
    fields: [
        {
        key: 'cheque',
        label: 'N° cheque',
        type: 'number',
        required: true
    },
    {
        key: 'emission',
        label: 'Date d\'émission',
        type: 'date',
        required: true
    },
        {
            key: 'com_cheque',
            label: 'Commentaire',
            type: 'textarea'
        }
    ]
}
</script>