<template>
    <BourseList
        titre="FINANCE"
        link-selected="/finance/bourse"
        base-link="finance"
        but-link-path="finance/bourse/"
        :niveau="niveauBourse.finance"
    />
</template>

<script setup>
import { niveauBourse } from '~/assets/js/CommonVariable.js'
</script>