<template>
    <BourseDetail
        titre="VALIDATION BOURSE - FINANCE"
        :niveau="niveauBourse.finance"
        retour-path="/finance/bourse"
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
        isImputation: true,
        disabled: true
    },
    {
        key: 'com_sup',
        label: 'Commentaire du supérieur'
    },
    {
        key: 'com_fin',
        label: 'Commentaire du finance',
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
    { label: 'Rejeter', color: 'danger', type: 'reject', requireMotif: true }
]

const massValidation = {
    enabled: true,
    title: 'Validation en masse',
    fields: [
        {
            key: 'com_sup',
            label: 'Commentaire',
            type: 'textarea'
        }
    ]
}

const exportColumns = exportColumnsExcel
</script>