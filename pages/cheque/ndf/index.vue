<template>
    <ValidationNDF
        titre="VALIDATION DES NOTES DE FRAIS - CHEQUE"
        link-selected="/cheque/ndf"
        base-link="cheque"
        but-link-path="cheque/ndf/"
        :niveau="niveauNDF.cheque"
    />
</template>
<script setup>
import { niveauNDF } from '~/assets/js/CommonVariable.js'

</script>