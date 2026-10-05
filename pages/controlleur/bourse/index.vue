<template>
    <BourseList
        titre="CG"
        link-selected="/controlleur/bourse"
        base-link="controlleur"
        but-link-path="controlleur/bourse/"
        :niveau="niveauBourse.cg"
    />
</template>

<script setup>
import { niveauBourse } from '~/assets/js/CommonVariable.js'
</script>