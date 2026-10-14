<template>
    <ListeValidationDrfme
        titre="VALIDATION DES DRFME - CG"
        :niveau="niveauDRFME.cg"
        but-link-path="controlleur/drfme/"
        link-selected="/controlleur/drfme"
        base-link="controlleur"
    />
</template>

<script setup>
import { niveauDRFME } from '~/assets/js/CommonVariable.js'
</script>