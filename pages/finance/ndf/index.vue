<template>
    <ValidationNDF
        titre="VALIDATION DES NOTES DE FRAIS - FINANCE"
        link-selected="/finance/ndf"
        base-link="finance"
        but-link-path="finance/ndf/"
        :niveau="niveauNDF.finance"
    />
</template>
<script setup>
import { niveauNDF } from '~/assets/js/CommonVariable.js'
</script>