<!-- components/ModalRetourMotif.vue -->
<template>
    <div>
        <!-- Bouton fantôme Bootstrap -->
        <button
            ref="btnOpen"
            type="button"
            class="d-none"
            data-bs-toggle="modal"
            :data-bs-target="`#${modalId}`"
        ></button>

        <Modal :id="modalId" :title="title">
            <div class="mb-3">
                <label class="form-label fw-bold">
                    {{ label }}
                    <span class="text-danger">*</span>
                </label>
                <textarea
                    v-model="motifLocal"
                    class="form-control"
                    rows="4"
                    :placeholder="placeholder"
                ></textarea>
            </div>
            <div class="d-flex gap-2 justify-content-end mb-2">
                <button
                    class="btn btn-outline-secondary"
                    data-bs-dismiss="modal"
                    type="button"
                >
                    Annuler
                </button>
                <button
                    class="btn"
                    :class="`btn-outline-${confirmColor}`"
                    type="button"
                    :disabled="loading"
                    @click="onConfirm"
                >
                    {{ confirmLabel }}
                </button>
            </div>
        </Modal>
    </div>
</template>

<script setup>
const props = defineProps({
    /** id unique si plusieurs modals sur la même page */
    modalId: { type: String, default: 'modalRetourMotif' },
    title: { type: String, default: 'Motif de retour' },
    label: { type: String, default: 'Motif du retour' },
    placeholder: { type: String, default: 'Indiquez le motif du retour...' },
    confirmLabel: { type: String, default: 'Confirmer le retour' },
    confirmColor: { type: String, default: 'primary' },
    loading: { type: Boolean, default: false },
    /** si true, motif obligatoire */
    requireMotif: { type: Boolean, default: true }
})

const emit = defineEmits(['confirm', 'cancel'])

const btnOpen = ref(null)
const motifLocal = ref('')
/** Contexte passé par le parent (item, targetLevel, etc.) */
const context = ref(null)

const open = (ctx = null) => {
    context.value = ctx
    motifLocal.value = ctx?.motifPrefill || ''
    nextTick(() => btnOpen.value?.click())
}

const close = () => {
    const el = document.getElementById(props.modalId)
    el?.querySelector('[data-bs-dismiss="modal"]')?.click()
}

const onConfirm = () => {
    const motif = (motifLocal.value || '').trim()
    if (props.requireMotif && !motif) {
        emit('confirm', { ok: false, motif: '', context: context.value })
        return
    }
    emit('confirm', { ok: true, motif, context: context.value })
}

defineExpose({ open, close })
</script>