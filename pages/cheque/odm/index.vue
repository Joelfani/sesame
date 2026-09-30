<template>
    <OdmList
        titre="VALIDATION DES ODM - CHEQUE"
        link-selected="/cheque/odm"
        base-link="cheque"
        but-link-path="cheque/odm/"
        :niveau="niveauODM.cheque"
    />
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'
</script>