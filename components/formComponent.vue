<template>
    <form class="form" @submit.prevent = "$emit('submit', formData)">
        <div class="form-group text-center">
            <div v-for="input in inputs" :key="input.id">
                <label :for="input.id"><span v-if="input.required" style="color: red;">*</span> {{ input.label}}</label>
                <input
                v-if="input.type === 'text' || input.type === 'email' || input.type === 'password' ||  input.type === 'date' || input.type === 'time'"
                :type="input.type"
                class="form-control"
                :id="input.id"
                v-model="formData[input.id]"
                :placeholder="input.placeholder"
                :disabled="input.disabled ?? false "
                :required="input.required ?? false"
                />
                <select
                    v-if="input.type === 'select'"
                    class="form-control"
                    :name="input.id"
                    v-model="formData[input.id]"
                    :required="input.required ?? false"
                    :disabled="input.disabled ?? false "
                >
                    <option v-for="option in input.options" :key="option.value" :value="option.value">
                        {{ option.text }}
                    </option>
                </select>
                <input
                    v-if="input.type === 'number'"
                    type="number"
                    class="form-control"
                    :id="input.id"
                    v-model="formData[input.id]"
                    :placeholder="input.placeholder ?? ''"
                    :disabled="input.disabled ?? false"
                    :required="input.required ?? false"
                    :min="input.min ?? 0"
                    :max="input.max ?? Infinity"
                    :step="input.step ?? 1"
                />
                <textarea
                    v-if="input.type === 'textarea'"
                    class="form-control"
                    rows="4"
                    :id="input.id"
                    v-model="formData[input.id]"
                    :placeholder="input.placeholder"    
                    :disabled="input.disabled ?? false"
                    :required="input.required ?? false"
                ></textarea>
            </div>

            <hr  v-if="hr_style"/>
            <button :class="class_btn" type="submit">{{ label_button }}</button>            
            <button v-if="modal_form" class="btn btn-light" data-dismiss="modal">Fermer</button>
        </div>
    </form>
</template>

<script>
export default {
    props: {
        inputs: {
            type: Array,
            required: true
        },
        class_btn: {
            type: String,
            default: 'btn btn-success'
        },
        label_button: {
            type: String,
        },
        modal_form: {
            type: Boolean,
            default: true
        },
        hr_style: {
            type: Boolean,
            default: true
        }
    },
    data() {
    return {
        formData: {}
    }
    },

    watch: {
    inputs: {
        immediate: true,   // Le handler est exécuté dès que le composant est monté
        deep: true,        // Il observe les changements profonds (dans les objets du tableau)
        handler(newInputs) {
        const formdata = {}
        newInputs.forEach(input => {
            formdata[input.id] = input.initialValue || ''
        })
        this.formData = formdata
        }
    }
    },
    emits: ['submit'],
}
</script>

<style scoped>
.btn {
    margin: 20px;
}
input, select, textarea {
    margin-bottom: 10px;
}
label {
    font-weight: bold;
    margin-bottom: 5px;
}
</style>