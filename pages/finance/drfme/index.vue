<template>
    <ListeValidationDrfme
        titre="VALIDATION DES DRFME - FINANCE"
        :niveau="niveauDRFME.finance"
        but-link-path="finance/drfme/"
        link-selected="/finance/drfme"
        base-link="finance"
    />
</template>

<script setup>
import { niveauDRFME } from '~/assets/js/CommonVariable.js'
</script>