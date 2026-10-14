<template>
    <ValidationDrfmeDetail
        titre="VALIDATION DRFME - CG"
        :niveau="niveauDRFME.cg"
        retour-path="/controlleur/drfme"
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
        editable: true,
        required: false, // obligatoire seulement si modifiée en masse via checkbox
        isImputation: true
    },
    {
        key: 'tiger',
        label: 'Code Tiger',
        type: 'text',
        editable: true,
        required: true,
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
    { label: 'Rejeter', color: 'outline-danger', type: 'reject', requireMotif: true },
    {
        label: 'Retourner à la Finance',
        color: 'outline-primary',
        type: 'return',
        targetLevel: niveauDRFME.finance,
        labelLevel: 'finance',
        requireMotif: true
    }
]

const massValidation = {
    enabled: true,
    title: 'Validation en masse - CG',
    fields: [
        {
            key: 'imputation',
            label: 'Imputation analytique',
            type: 'select',
            required: true,
            isImputation: true,
            optionalToggle: true // coché = visible + obligatoire ; défaut masqué
        },
        {
            key: 'tiger',
            label: 'Code Tiger',
            type: 'text',
            required: true
        },
        
        {
            key: 'com_cg',
            label: 'Commentaire CG',
            type: 'textarea'
        }
    ]
}

const exportColumns = [
    ...exportColumnsExcelDRFME,
    { key: 'tiger', label: 'Code Tiger' },
    { key: 'com_cg', label: 'Commentaire CG' },
    { key: 'imputationOld', label: 'Ancienne imputation' }
]
</script>