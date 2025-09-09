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
                    :value="input.value"
                    v-model="formData[input.id]"
                    :required="input.required ?? false"
                    :disabled="input.disabled ?? false "
                    :placeholder="input.placeholder"
                >
                    <option v-if="input.etat_option_login" :disabled="true" :selected="true" :hidden="true">Sélectionner {{ input.option_label }}</option>
                    <option v-for="option in input.options" :key="option.value" :value="option.value">
                        {{ option.text }}
                    </option>
                </select>
            </div>

            <hr  v-if="hr_style"/>
            <div v-if="connexion">
                <button class="btn con" type="submit" :disabled="loading">{{ label_button }}</button> 
                <NuxtLink to="/register" class="btn ins">S'inscrire</NuxtLink>
            </div>
            <div v-else>
                <button class="btn btn-primary con2" type="submit" :disabled="loading">{{ label_button }}</button> 
                <NuxtLink to="/" class="btn ins">Se connecter</NuxtLink>
            </div>
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
        },
        connexion: {
            type: Boolean,
            default: false
        },
        loading: {
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
    height: 3.5rem;
    background: #ffffffb7;
}
.con{
    margin-top: 1.25rem;
    margin-bottom: 1.25rem;
    color: white;
    width: 90%;
    background-color: #43b02ab4;
    
}
.con:hover{
    background-color: #43b02a;
}
.con2{
    margin-top: 1.25rem;
    margin-bottom: 1.25rem;
    width: 90%;
}
.ins{
    color: #000;
    
    margin-left: 1.25rem;
    text-decoration: none;
    border: 1px solid #000;
    border-radius: 2px;
}
.ins:hover{
    color: #eee;
}
input, select, textarea {
    margin-bottom: 0.8rem;
}

</style>