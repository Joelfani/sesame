<!--
  FormattedNumberInput.vue

  Affichage live avec séparateurs de milliers (fr-FR) +
  conservation correcte de la position du curseur
  (y compris juste après la virgule décimale).
-->
<template>
    <input
        ref="inputEl"
        type="text"
        inputmode="decimal"
        class="form-control"
        :placeholder="placeholder"
        :disabled="disabled"
        :value="displayValue"
        @focus="isFocused = true"
        @input="onInput"
        @blur="onBlur"
    >
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
    modelValue: { type: [Number, String], default: null },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const inputEl = ref(null)
const isFocused = ref(false)
const displayValue = ref('')

const formatter = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 20,
})

/**
 * Formate pour l'affichage.
 * Conserve une virgule orpheline ou une partie décimale en cours de saisie.
 */
const formatDisplay = (val) => {
    if (val === null || val === undefined || val === '') return ''

    if (typeof val === 'string') {
        const normalized = val.replace(/\s/g, '').replace(',', '.')
        if (
            normalized === '' ||
            normalized === '-' ||
            normalized === '.' ||
            normalized === '-.'
        ) {
            return val.replace(/\./g, ',')
        }

        const hasDecimal = normalized.includes('.')
        const [intPart, decPart] = normalized.split('.')
        const numInt = Number(intPart)
        if (isNaN(numInt)) return val

        const formattedInt = formatter.format(numInt)
        if (!hasDecimal) return formattedInt
        return formattedInt + ',' + (decPart ?? '')
    }

    const n = Number(val)
    return isNaN(n) ? '' : formatter.format(n)
}

/** Nombre de chiffres (0-9) avant la position `pos`. */
const countDigitsBefore = (str, pos) => {
    let count = 0
    for (let i = 0; i < pos && i < str.length; i++) {
        if (/\d/.test(str[i])) count++
    }
    return count
}

/**
 * Position dans `str` juste après `digitCount` chiffres.
 * Si digitCount === 0 → 0.
 */
const positionAfterDigits = (str, digitCount) => {
    if (digitCount <= 0) return 0
    let count = 0
    for (let i = 0; i < str.length; i++) {
        if (/\d/.test(str[i])) {
            count++
            if (count === digitCount) return i + 1
        }
    }
    return str.length
}

watch(() => props.modelValue, (val) => {
    if (!isFocused.value) {
        displayValue.value = formatDisplay(val)
    }
}, { immediate: true })

const onInput = async (event) => {
    const input = event.target
    const raw = input.value
    const cursorPos = input.selectionStart ?? raw.length

    // ── Nettoyage ──────────────────────────────────────────────
    let cleaned = raw.replace(/[^\d,.\-]/g, '')

    // Un seul '-' et uniquement en tête
    cleaned = cleaned.replace(/(?!^)-/g, '')
    if (cleaned.indexOf('-') > 0) {
        cleaned = cleaned.replace(/-/g, '')
    }

    // Un seul séparateur décimal (on garde le premier rencontré)
    const firstComma = cleaned.indexOf(',')
    const firstDot = cleaned.indexOf('.')
    if (firstComma !== -1 && firstDot !== -1) {
        const firstSep = Math.min(firstComma, firstDot)
        cleaned =
            cleaned.slice(0, firstSep + 1) +
            cleaned.slice(firstSep + 1).replace(/[,.]/g, '')
    }

    // ── Position du curseur ────────────────────────────────────
    const digitsBefore = countDigitsBefore(raw, cursorPos)

    // Est-ce que le curseur était juste après une virgule/point ?
    const charBeforeCursor = raw[cursorPos - 1]
    const wasRightAfterDecimal =
        charBeforeCursor === ',' || charBeforeCursor === '.'

    // ── Formatage + émission ───────────────────────────────────
    const formatted = formatDisplay(cleaned)
    displayValue.value = formatted

    const numericString = cleaned.replace(/\s/g, '').replace(',', '.')
    const isEmpty =
        numericString === '' ||
        numericString === '-' ||
        numericString === '.' ||
        numericString === '-.'
    const num = isEmpty ? null : Number(numericString)
    emit('update:modelValue', isEmpty || isNaN(num) ? null : num)

    // ── Repositionnement du curseur ────────────────────────────
    await nextTick()
    if (inputEl.value) {
        let newPos = positionAfterDigits(formatted, digitsBefore)

        // Cas critique : l'utilisateur vient de taper la virgule
        // → on force le curseur APRÈS la virgule dans la valeur formatée
        if (wasRightAfterDecimal) {
            const decIndex = formatted.search(/[,.]/)
            if (decIndex !== -1) {
                newPos = Math.max(newPos, decIndex + 1)
            }
        }

        inputEl.value.setSelectionRange(newPos, newPos)
    }
}

const onBlur = () => {
    isFocused.value = false
    displayValue.value = formatDisplay(props.modelValue)
}
</script>