<template>
    <div class="alert alert-dismissible fade show" :class="`alert-${type}`" role="alert" >
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
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