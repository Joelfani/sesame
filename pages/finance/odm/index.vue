<template>
    <OdmList
        titre="VALIDATION DES ODM - FINANCE"
        link-selected="/finance/odm"
        base-link="finance"
        but-link-path="finance/odm/"
        :niveau="niveauODM.finance"
    />
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'
</script>