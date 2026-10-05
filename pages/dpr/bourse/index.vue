<template>
    <BourseList
        titre="DPR"
        link-selected="/dpr/bourse"
        base-link="dpr"
        but-link-path="dpr/bourse/"
        :niveau="niveauBourse.dpr"
    />
</template>

<script setup>
import { niveauBourse } from '~/assets/js/CommonVariable.js'
</script>