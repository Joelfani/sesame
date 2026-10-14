<template>
    <ListeValidationDrfme
        titre="VALIDATION DES DRFME - DPR"
        :niveau="niveauDRFME.dpr"
        but-link-path="dpr/drfme/"
        link-selected="/dpr/drfme"
        base-link="dpr"
    />
</template>

<script setup>
import { niveauDRFME } from '~/assets/js/CommonVariable.js'
</script>