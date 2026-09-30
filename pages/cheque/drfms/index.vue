<template>
    <Drfms
        :niveau="niveauDRFMS.cheque"
        titre="VALIDATION DES DRFMS - CHEQUE"
        LinkSelected="/cheque/drfms"
        baseLink="cheque"
        voir-path="cheque/drfms/"
    />
</template>

<script setup>
import { niveauDRFMS } from '~/assets/js/CommonVariable.js'
</script>