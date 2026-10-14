<template>
    <ListeValidationDrfme
        titre="VALIDATION DES DRFME - SUPÉRIEUR"
        :niveau="niveauDRFME.superieur"
        :check-sup="true"
        but-link-path="validation/drfme/"
        link-selected="/validation/drfme"
        base-link="validation"
    />
</template>

<script setup>
import { niveauDRFME } from '~/assets/js/CommonVariable.js'
</script>