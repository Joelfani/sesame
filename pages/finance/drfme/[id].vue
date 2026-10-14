<template>
    <ValidationDrfmeDetail
        titre="VALIDATION DRFME - FINANCE"
        :niveau="niveauDRFME.finance"
        retour-path="/finance/drfme"
        :columns="extraColumns"
        :actions="actions"
        :mass-validation="massValidation"
        :export-columns="exportColumns"
    />
</template>

<script setup>
import { niveauDRFME,exportColumnsExcelDRFME } from '~/assets/js/CommonVariable.js'
import ValidationDrfmeDetail from '~/components/ValidationDrfmeDetail.vue'

/** Colonnes en plus des colonnes de base (saisie collabo) */
const extraColumns = [
    {
        key: 'imputation',
        label: 'Imputation analytique',
        type: 'select',
        editable: true,
        required: true,
        isImputation: true,
        disabled: true
    },
    {
        key: 'com_sup',
        label: 'Commentaire du supérieur',
        style: { minWidth: '250px' }
    },
    {
        key: 'com_fin',
        label: 'Commentaire de la finance',
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
        label: 'Retourner au supérieur',
        color: 'outline-primary',
        type: 'return',
        targetLevel: niveauDRFME.superieur,
        labelLevel: 'collaborateur',
        requireMotif: true
    }
]

const massValidation = {
    enabled: true,
    title: 'Validation en masse - Finance',
    fields: [
        {
            key: 'com_fin',
            label: 'Commentaire',
            type: 'textarea',
        }
    ]
}

const exportColumns = exportColumnsExcelDRFME
</script>