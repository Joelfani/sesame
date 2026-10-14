<template>
    <ValidationDrfmeDetail
        titre="VALIDATION DRFME - ÉMISSION DE CHÈQUE"
        :niveau="niveauDRFME.cheque"
        :next-level="niveauDRFME.valide"
        retour-path="/cheque/drfme"
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
        key: 'com_dpr',
        label: 'Commentaire du DPR',
        style: { minWidth: '220px' }
    },
    {
        key: 'cheque',
        label: 'N° de chèque',
        type: 'text',
        editable: true,
        required: true,
        style: { minWidth: '140px' }
    },
    {
        key: 'emission',
        label: "Date d'émission",
        type: 'date',
        editable: true,
        required: true,
        style: { minWidth: '150px' }
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
]

const massValidation = {
    enabled: true,
    title: 'Émission de chèque en masse',
    fields: [
        {
            key: 'cheque',
            label: 'N° de chèque',
            type: 'text',
            required: true
        },
        {
            key: 'emission',
            label: "Date d'émission",
            type: 'date',
            required: true
        }
    ]
}

const exportColumns = [
    ...exportColumnsExcelDRFME,
    { key: 'tiger', label: 'Code Tiger' },
    { key: 'com_dpr', label: 'Commentaire DPR' },
    { key: 'cheque', label: 'N° chèque' },
    { key: 'emission', label: "Date d'émission" }
]
</script>