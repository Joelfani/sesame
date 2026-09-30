<template>
    <ValidationNDF
        titre="VALIDATION DES NOTES DE FRAIS - SUPÉRIEUR"
        link-selected="/validation/ndf"
        base-link="validation"
        but-link-path="validation/ndf/"
        :niveau="niveauNDF.superieur"
        :check-sup="true"
        :viewDRFMS="false"
    />
</template>
<script setup>
import { niveauNDF } from '~/assets/js/CommonVariable.js'
</script>