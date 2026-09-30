<template>
    <Drfms
        :niveau="niveauDRFMS.rh"
        titre="VALIDATION DES DRFMS - RH"
        :choice-navigation="false"
        voir-path="rh/"
        :RHNavigation="true"
    />
</template>

<script setup>
import { niveauDRFMS } from '~/assets/js/CommonVariable.js'
</script>