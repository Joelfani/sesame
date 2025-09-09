<template>
    <div class="alert fade show" :class="`alert-${type}`" role="alert" >
        <strong>{{ title }}</strong> 
        <p>{{ message }}</p>
    </div>
</template>
<script setup>
// Props
const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    show: {
        type: Boolean,
        default: false
    }
    ,
    message: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    }
})

</script>