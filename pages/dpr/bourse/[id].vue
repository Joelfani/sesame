<template>
    <BourseDetail
        titre="VALIDATION BOURSE - DPR"
        :niveau="niveauBourse.dpr"
        retour-path="/dpr/bourse"
        :columns="columns"
        :actions="bourseActions"
        :mass-validation="massValidation"
        :export-columns="exportColumns"
        imputation-key="imputation"
    />
</template>

<script setup>
import { TeteBourse, niveauBourse, exportColumnsExcel } from '~/assets/js/CommonVariable.js'

const columns = [
    ...TeteBourse.filter(c => c.key !== 'statut_ligne'),
    {
        key: 'com_sup',
        label: 'Commentaire du supérieur'
    },
    {
        key: 'com_fin',
        label: 'Commentaire finance'
    },
    {
        key: 'com_cg',
        label: 'Commentaire CG'
    },
    // Imputation modifiable au CG
    {
        key: 'imputation',
        label: 'Imputation analytique',
        editable: true,
        type: 'select',
        required: true,
        isImputation: true,
        disabled: true
    },

    // Code Tiger obligatoire
    {
        key: 'tiger',
        label: 'Code Tiger',
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
    },
]

const bourseActions = [
    { label: 'Valider', color: 'success', type: 'validate' },
    { label: 'Rejeter', color: 'danger', type: 'reject', requireMotif: true }
    // Décommente si le CG peut renvoyer :
    // {
    //     label: 'Retourner à la Finance',
    //     color: 'warning',
    //     type: 'return',
    //     targetLevel: niveauBourse.finance,
    //     requireMotif: true
    // }
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
            isImputation: true
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

const exportColumns = exportColumnsExcel
</script>