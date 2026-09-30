<template>
    <OdmList
        titre="VALIDATION DES ODM - RH"
        link-selected="/rh/odm"
        base-link="rh"
        but-link-path="rh/odm/"
        :niveau="niveauODM.rh"
    />
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'
</script>