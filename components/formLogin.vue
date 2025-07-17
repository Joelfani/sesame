<template>
    <form class="form" @submit.prevent = "$emit('submit', formData)">
        <div class="form-group text-center">
            <div v-for="input in inputs" :key="input.id">
                <label v-if="input.label" :for="input.id"><span v-if="input.required" style="color: red;">*</span> {{ input.label}}</label>
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
                    <option v-if="input.etat_option_login" :value="''" :disabled="true" :selected="true" :hidden="true">Sélectionner une catégorie</option>
                    <option v-for="option in input.options" :key="option.value" :value="option.value">
                        {{ option.text }}
                    </option>
                </select>
            </div>

            <hr  v-if="hr_style"/>
            <button class="btn" type="submit">{{ label_button }}</button>            
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
        label_button: {
            type: String,
        },
        
        hr_style: {
            type: Boolean,
            default: true
        },
        etat_option_login: {
            type: Boolean,
            default: false
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
input,select{
    height: 70px;
    background: #ffffffb7;
}
.btn{
    margin: 20px;
    color: white;
    background-color: #43b02ab4;
}
.btn:hover{
    background-color: #43b02a;
}
input, select, textarea {
    margin-bottom: 10px;
}
label {
    font-weight: bold;
    margin-bottom: 5px;
}

</style>