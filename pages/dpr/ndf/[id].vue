<template>
    <ValidationNdfDetail
        titre="VALIDATION NDF - DPR"
        :niveau="niveauNDF.dpr"
        retour-path="/dpr/ndf"
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
            key: 'com_dpr',
            label: 'Commentaire',
            type: 'textarea'
        }
    ]
}
</script>