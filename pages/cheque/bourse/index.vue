<template>
    <BourseList
        titre="CHEQUE"
        link-selected="/cheque/bourse"
        base-link="cheque"
        but-link-path="cheque/bourse/"
        :niveau="niveauBourse.cheque"
    />
</template>

<script setup>
import { niveauBourse } from '~/assets/js/CommonVariable.js'
</script>