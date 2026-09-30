<template>
    <Drfms
        :niveau="niveauDRFMS.finance"
        titre="VALIDATION DES DRFMS - FINANCE"
        LinkSelected="/finance/drfms"
        baseLink="finance"
        voir-path="finance/drfms/"
    />
</template>

<script setup>
import { niveauDRFMS } from '~/assets/js/CommonVariable.js'
</script>