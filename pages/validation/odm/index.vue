<template>
    <OdmList
        titre="VALIDATION DES ODM - SUPÉRIEUR"
        link-selected="/validation/odm"
        base-link="validation"
        but-link-path="validation/odm/"
        :niveau="niveauODM.superieur"
        :check-sup="true"
        :viewDRFMS="false"
    />
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'
</script>