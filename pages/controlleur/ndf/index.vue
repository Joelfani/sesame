<template>
    <ValidationNDF
        titre="VALIDATION DES NOTES DE FRAIS - CONTROLLEUR"
        link-selected="/controlleur/ndf"
        base-link="controlleur"
        but-link-path="controlleur/ndf/"
        :niveau="niveauNDF.cg"
    />
</template>
<script setup>
import { niveauNDF } from '~/assets/js/CommonVariable.js'

</script>