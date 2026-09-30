<template>
    <OdmList
        titre="VALIDATION DES ODM - CONTROLLEUR"
        link-selected="/controlleur/odm"
        base-link="controlleur"
        but-link-path="controlleur/odm/"
        :niveau="niveauODM.cg"
    />
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'
</script>