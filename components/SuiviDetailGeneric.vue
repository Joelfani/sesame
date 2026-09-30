<template>
    <div class="purchase_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>{{ titre }}</h1>
            <div class="d-flex gap-2">
                <slot name="header-actions" />
                <NuxtLink
                    v-if="retourPath"
                    :to="retourPath"
                    class="btn btn-outline-secondary"
                >
                    Retour à la liste
                </NuxtLink>
            </div>
        </div>


        <!-- Informations générales -->
        <div class="row">
            <div class="col-8">
                <!-- Champs d'en-tête fournis par le parent -->
                <table class="table table-borderless table-sm mb-0" style="width: auto;">
                    <tbody>
                        <tr>
                            <th class="pe-3" style="white-space: nowrap; font-weight: 600; max-width: 50px;">
                                N° d'enregistrement :
                            </th>
                            <td>
                                <span>{{ route.params.id }}</span>
                            </td>
                        </tr>
                        <tr v-for="field in infoFields" :key="field.key">


                            <th class="pe-3" style="white-space: nowrap; font-weight: 600; max-width: 50px;">
                                {{ field.label }}
                            </th>
                            <td>
                                <span v-if="!field.strong">{{ dataObj[field.key] }}</span>
                                <strong v-else>{{ dataObj[field.key] }}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>


                <slot name="info-extra" :dataObj="dataObj" />
            </div>


            <div
                v-if="showTotals"
                class="col-4 d-flex flex-column justify-content-center align-items-end"
            >
                <h6 v-for="t in totals" :key="t.label">
                    {{ t.label }} :
                    <strong>{{ t.value }} Ar</strong>
                </h6>
            </div>
        </div>

        <!-- Présentation détaillée d'un enregistrement unique (ex: ODM) -->
        <!-- Utilisé quand les données ne sont pas structurées en lignes (pas de Table),
             mais méritent quand même une présentation propre en dehors de l'en-tête -->
        <div v-if="$slots['detail-content']" class="detail_content_block mt-4">
            <slot name="detail-content" :dataObj="dataObj" />
        </div>

        <!-- Tableau -->
        <div v-if="showTable" class="table_block_list mt-4">
            <Table
                :columns="columns"
                :rows="rows"
                :showActions="showActions"
                :loading="loading"
            >
                <template v-if="showActions" #actions="slotProps">
                    <slot name="actions" v-bind="slotProps" />
                </template>
            </Table>
        </div>


        <!-- Contenu additionnel (modals, etc.) -->
        <slot name="modals" :rows="rows" />


        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />
    </div>
</template>


<script setup>
const props = defineProps({
    titre: {
        type: String,
        default: 'DÉTAILS'
    },
    retourPath: {
        type: String,
        default: ''
    },
    /** Données d'en-tête déjà formatées par le parent */
    dataObj: {
        type: Object,
        default: () => ({})
    },
    /**
     * Champs affichés sous le N°
     * [{ key: 'date', label: 'Date' }, { key: 'demandeur', label: 'Demandeur', strong: true }]
     */
    infoFields: {
        type: Array,
        default: () => []
    },
    columns: {
        type: Array,
        default: () => []
    },
    rows: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    showActions: {
        type: Boolean,
        default: false
    },
    /**
     * Affiche ou masque le tableau (Table.vue).
     * À mettre à false pour les enregistrements uniques (ex: ODM) qui n'ont pas de lignes multiples.
     */
    showTable: {
        type: Boolean,
        default: true
    },
    /**
     * Totaux affichés à droite
     * [{ label: 'Total', value: '1 200' }]
     */
    totals: {
        type: Array,
        default: () => []
    }
})


const route = useRoute()


const showTotals = computed(() => (props.totals || []).length > 0)


const alert = ref({ show: false, message: '', title: '', type: '' })
</script>