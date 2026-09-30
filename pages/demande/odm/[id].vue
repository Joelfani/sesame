<template>
    <OdmForm
        titre="MON ORDRE DE MISSION"
        sous-titre="Si la demande vous a été renvoyée, utilisez Modifier puis Valider pour la renvoyer au supérieur."
        :niveau="niveauODM.erg"
        :check-sup="false"
        :show-demandeur="true"
        :show-superieur="true"
        :allow-edit-mode="true"
        retour-path="/demande/odm"
        :fields="fields"
        :actions="actions"
    />
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'
import OdmForm from '~/components/OdmForm.vue'

/**
 * Tout en readonly par défaut au niveau erg.
 * allowEditMode = true → le bouton "Modifier" débloque les champs.
 * Pas d'imputation côté collaborateur.
 */
const fields = [
    {
        key: 'miss_obj',
        label: 'Objectif de la mission',
        type: 'text',
        levels: {
            [niveauODM.erg]: 'readonly'
        },
        requiredAt: [niveauODM.erg]
    },
    {
        key: 'miss_lieu',
        label: 'La mission aura lieu à',
        type: 'text',
        levels: {
            [niveauODM.erg]: 'readonly'
        },
        requiredAt: [niveauODM.erg]
    },
    {
        key: 'miss_date1',
        label: 'La mission aura lieu du',
        type: 'date',
        levels: {
            [niveauODM.erg]: 'readonly'
        },
        requiredAt: [niveauODM.erg]
    },
    {
        key: 'miss_date2',
        label: 'au',
        type: 'date',
        levels: {
            [niveauODM.erg]: 'readonly'
        },
        requiredAt: [niveauODM.erg]
    },
    {
        key: 'miss_cas',
        label: 'Type de mission / indemnité',
        type: 'radio_cas',
        colClass: 'col-12',
        levels: {
            [niveauODM.erg]: 'readonly'
        },
        requiredAt: [niveauODM.erg]
    },
    {
        key: 'montant',
        label: 'Montant (Ar)',
        type: 'montant', // calcul auto, toujours disabled dans OdmForm
        colClass: 'col-md-6',
        levels: {
            [niveauODM.erg]: 'readonly'
        },
        requiredAt: []
    }
]

// Uniquement renvoyer au supérieur (pas de reject / return)
const actions = [
    {
        label: 'Valider et renvoyer au supérieur',
        color: 'success',
        type: 'validate'
    }
]
</script>