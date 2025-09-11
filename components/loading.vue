<template>
    <div class="text-center">
        <div class="loader"></div>
        <p>Chargement {{ dataload }}...</p>
    </div>
</template>
<script>
export default {
    props: {
        dataload: String
    }
}
</script>