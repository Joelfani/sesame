<template>
    <Drfms
        :niveau="niveauDRFMS.dpr"
        titre="VALIDATION DES DRFMS - DPR"
        LinkSelected="/dpr/drfms"
        baseLink="dpr"
        voir-path="dpr/drfms/"
    />
</template>

<script setup>
import { niveauDRFMS } from '~/assets/js/CommonVariable.js'
</script>