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
    { key: 'description', label: 'Libellé de facture / Commentaires'},
    { key: 'nature', label: 'Nature de la dépense'},
    { key: 'ok', label: 'OK/NOK'},
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
    { label: 'Valider', color: 'outline-success', type: 'validate' },
    { label: 'Rejeter', color: 'outline-danger', type: 'reject', requireMotif: true },
    {
        label: 'Editer',
        color: 'outline-secondary',
        type: 'edit',
        // champs du formulaire modal (spécifiques à ce niveau)
        fields: [
            { key: 'description', label: 'Libellé', type: 'textarea', required: true },
            { key: 'nature', label: 'Nature', type: 'text' },
            { key: 'montant', label: 'Montant', type: 'number', required: true }
        ],
    },
    {
        label: 'Retourner au collaborateur',
        color: 'outline-primary',
        type: 'return',
        targetLevel: niveauNDF.erg
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