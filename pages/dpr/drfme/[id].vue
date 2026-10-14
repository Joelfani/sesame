<template>
    <ValidationDrfmeDetail
        titre="VALIDATION DRFME - DPR"
        :niveau="niveauDRFME.dpr"
        retour-path="/dpr/drfme"
        :columns="extraColumns"
        :actions="actions"
        :mass-validation="massValidation"
        :export-columns="exportColumns"
        imputation-key="imputation"
        imputation-old-key="imputationOld"
    />
</template>

<script setup>
import { niveauDRFME, exportColumnsExcelDRFME } from '~/assets/js/CommonVariable.js'
import ValidationDrfmeDetail from '~/components/ValidationDrfmeDetail.vue'

const extraColumns = [
    {
        key: 'imputation',
        label: 'Imputation analytique',
        type: 'select',
        isImputation: true,
        disabled: true
    },
    {
        key: 'tiger',
        label: 'Code Tiger',
        style: { minWidth: '140px' }
    },
    {
        key: 'com_sup',
        label: 'Commentaire du supérieur',
        style: { minWidth: '220px' }
    },
    {
        key: 'com_fin',
        label: 'Commentaire de la finance',
        style: { minWidth: '220px' }
    },
    {
        key: 'com_cg',
        label: 'Commentaire du CG',
        style: { minWidth: '220px' }
    },
    {
        key: 'com_dpr',
        label: 'Commentaire du DPR',
        type: 'textarea',
        editable: true,
        style: { minWidth: '250px' }
    },
    {
        key: 'motif',
        label: 'Motif de rejet',
        type: 'textarea',
        editable: true,
        style: { minWidth: '250px' }
    }
]

const actions = [
    { label: 'Valider', color: 'outline-success', type: 'validate' },
    { label: 'Rejeter', color: 'outline-danger', type: 'reject', requireMotif: true }
    // pas de retour
]

const massValidation = {
    enabled: true,
    title: 'Validation en masse - DPR',
    fields: [
        {
            key: 'com_dpr',
            label: 'Commentaire DPR',
            type: 'textarea'
            // pas required
        }
    ]
}

const exportColumns = [
    ...exportColumnsExcelDRFME,
    { key: 'tiger', label: 'Code Tiger' },
    { key: 'com_cg', label: 'Commentaire CG' },
    { key: 'com_dpr', label: 'Commentaire DPR' }
]
</script>