<template>
    <ListeValidationDrfme
        titre="VALIDATION DES DRFME - CHEQUE"
        :niveau="niveauDRFME.cheque"
        but-link-path="cheque/drfme/"
        link-selected="/cheque/drfme"
        base-link="cheque"
    />
</template>

<script setup>
import { niveauDRFME } from '~/assets/js/CommonVariable.js'
</script>