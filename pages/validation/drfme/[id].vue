<template>
    <ValidationDrfmeDetail
        titre="VALIDATION DRFME - SUPÉRIEUR"
        :niveau="niveauDRFME.superieur"
        :check-sup="true"
        retour-path="/validation/drfme"
        :columns="extraColumns"
        :actions="actions"
        :mass-validation="massValidation"
        :export-columns="exportColumns"
    />
</template>

<script setup>
import { niveauDRFME } from '~/assets/js/CommonVariable.js'
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
    },
    {
        key: 'com_sup',
        label: 'Commentaire du supérieur',
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
        label: 'Retourner au collaborateur',
        color: 'outline-primary',
        type: 'return',
        targetLevel: niveauDRFME.erg,
        labelLevel: 'collaborateur',
        requireMotif: true
    }
]

const massValidation = {
    enabled: true,
    title: 'Validation en masse - Supérieur',
    fields: [
        {
            key: 'imputation',
            label: 'Imputation analytique',
            type: 'select',
            required: true,
            isImputation: true
        },
        {
            key: 'com_sup',
            label: 'Commentaire',
            type: 'textarea'
        }
    ]
}

const exportColumns = [
    { key: 'num', label: 'N°' },
    { key: 'designation', label: 'Désignation' },
    { key: 'montant_total', label: 'Montant total' },
    { key: 'montant_etudiant', label: 'Part étudiant' },
    { key: 'montant_sesame', label: 'Part SESAME' },
    { key: 'detail', label: 'Motif / destination' },
    { key: 'observation', label: 'Observation' },
    { key: 'imputation', label: 'Imputation' },
    { key: 'com_sup', label: 'Commentaire supérieur' },
    { key: 'motif', label: 'Motif de rejet' },
    { key: 'niv_val', label: 'Statut' }
]
</script>