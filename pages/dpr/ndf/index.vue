<template>
    <ValidationNDF
        titre="VALIDATION DES NOTES DE FRAIS - DPR"
        link-selected="/dpr/ndf"
        base-link="dpr"
        but-link-path="dpr/ndf/"
        :niveau="niveauNDF.dpr"
    />
</template>
<script setup>
import { niveauNDF } from '~/assets/js/CommonVariable.js'

</script>