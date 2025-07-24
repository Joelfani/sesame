<template>
        <table class="table table-borderless table-striped ">
            <thead class="table-header">
                <tr>
                    <th  v-for="col in columns" :key="col.key" :style="col.style? col.style : ''">
                    {{ col.label }}
                    </th>
                    <th v-if="showActions" style="min-width : 250px; text-align: center;">Actions</th>
                </tr>
            </thead>
            <tbody v-if="rows.length > 0">
                <tr v-for="item in rows" :key="item.id">
                    <td  v-for="col in columns" :key="col.key" :class="col.etat? 'td-fixed':''"> 
                    {{ item[col.key] }}
                    </td>
                    <td v-if="showActions">
                    <slot name="actions" :item="item"></slot>
                    </td>
                </tr>
            </tbody>
            <tbody v-else>
                <tr>
                    <td colspan="100%" class="text-center">Aucune donnée disponible</td>
                </tr>
            </tbody>
        </table>
</template>
<script setup>
defineProps({
    rows: {
        type: Array,
        required: true
    },
    columns: {
        type: Array,
        required: true
    },
    showActions: {
        type: Boolean,
        default: true
    }
})
</script>