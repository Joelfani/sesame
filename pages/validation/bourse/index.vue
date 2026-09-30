<template>
    <BourseList
        titre="VALIDATION DES DEMANDES DE BOURSE - SUPÉRIEUR"
        link-selected="/validation/bourse"
        base-link="validation"
        but-link-path="validation/bourse/"
        :niveau="niveauBourse.superieur"
        :check-sup="true"
    />
</template>

<script setup>
import { niveauBourse } from '~/assets/js/CommonVariable.js'
</script>