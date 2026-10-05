<template>
    <BourseDetail
        titre="SUPÉRIEUR"
        :niveau="niveauBourse.superieur"
        :check-sup="true"
        retour-path="/validation/bourse"
        :columns="columns"
        :actions="actions"
        :mass-validation="massValidation"
        :export-columns="exportColumns"
        imputation-key="imputation"
    />
</template>

<script setup>
import { TeteBourse, niveauBourse,exportColumnsExcel } from '~/assets/js/CommonVariable.js'

const columns = [
    ...TeteBourse,
    {
        key: 'imputation',
        label: 'Imputation analytique',
        editable: true,
        type: 'select',
        required: true,
        isImputation: true
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
    },
]

const actions = [
    { label: 'Valider', color: 'success', type: 'validate' },
    { label: 'Rejeter', color: 'danger', type: 'reject', requireMotif: true },
    {
        label: 'Retourner au collaborateur',
        color: 'outline-primary',
        type: 'return',
        targetLevel: niveauBourse.erg,
        labelLevel : 'collaborateur',
        requireMotif: true
    },
]

const massValidation = {
    enabled: true,
    title: 'Validation en masse',
    fields: [
        {
            key: 'imputation',
            label: 'Imputation analytique',
            type: 'select',
            required: true,
            isImputation: true,
            optionalToggle:false
        },
        {
            key: 'com_sup',
            label: 'Commentaire',
            type: 'textarea'
        }
    ]
}

const exportColumns = exportColumnsExcel
</script>