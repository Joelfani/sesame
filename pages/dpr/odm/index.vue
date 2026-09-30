<template>
    <OdmList
        titre="VALIDATION DES ODM - DPR"
        link-selected="/dpr/odm"
        base-link="dpr"
        but-link-path="dpr/odm/"
        :niveau="niveauODM.dpr"
    />
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'
</script>