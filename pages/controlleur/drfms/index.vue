<template>
    <Drfms
        :niveau="niveauDRFMS.cg"
        titre="VALIDATION DES DRFMS - CG"
        LinkSelected="/controlleur/drfms"
        baseLink="controlleur"
        voir-path="controlleur/drfms/"
    />
</template>

<script setup>
import { niveauDRFMS } from '~/assets/js/CommonVariable.js'
</script>