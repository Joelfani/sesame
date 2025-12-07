<template>
  <form class="form" @submit.prevent="$emit('submit', formData)">
    <div class="form-group text-center">
      <!-- 🔹 Génération automatique des champs -->
      <div v-for="input in inputs" :key="input.id">
        <label v-if="input.label" :for="input.id">
          <span v-if="input.required" style="color: red">*</span> {{ input.label }}
        </label>
        <!-- INPUT -->
        <div v-if="['text','email','password','date','time'].includes(input.type)" class="input-wrapper">
          <input
            :type="input.type === 'password' && showPassword[input.id] ? 'text' : input.type"
            class="form-control"
            v-model="formData[input.id]"
            :placeholder="input.placeholder"
            :required="input.required ?? false"
            :disabled="loading"
          />
          <!-- Icône pour afficher/masquer le mot de passe -->
          <img
            v-if="input.type === 'password'"
            :src="showPassword[input.id] ? '/icon/fermer.png' : '/icon/voir.png'"
            @click="togglePassword(input.id)"
            class="password-toggle-icon"
            alt="Toggle password visibility"
          />
        </div>
        <!-- SELECT -->
        <select
          v-if="input.type === 'select'"
          class="form-control"
          v-model="formData[input.id]"
          :disabled="loading"
        >
          <option
            v-for="option in input.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.text }}
          </option>
        </select>
      </div>
      <hr v-if="hr_style" />
      <!-- 🔹 Zone LOGIN -->
      <div v-if="connexion">
        <button class="btn con" type="submit" :disabled="loading">
          {{ loading ? "Connexion..." : label_button }}
        </button>
        <!-- 🔹 Mot de passe oublié 
        <p>
          <a href="#" @click.prevent="resetPassword" class="forgot-link">
            Mot de passe oublié ?
          </a>
        </p>-->
        <NuxtLink to="/register" class="btn ins">S'inscrire</NuxtLink>
      </div>
      <!-- 🔹 Zone REGISTER -->
      <div v-else>
        <button class="btn btn-primary con2" type="submit" :disabled="loading">
          {{ label_button }}
        </button>
        <NuxtLink to="/" class="btn ins">Se connecter</NuxtLink>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from "vue";

// Props
const props = defineProps({
  inputs: { type: Array, required: true },
  label_button: String,
  hr_style: { type: Boolean, default: true },
  connexion: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

// Emit
const emit = defineEmits(["submit"]);

// Form data
const formData = ref({});

// État pour afficher/masquer les mots de passe
const showPassword = ref({});

// Init automatique des champs
watch(
  () => props.inputs,
  (newInputs) => {
    const fd = {};
    const sp = {};
    newInputs.forEach((i) => {
      fd[i.id] = i.initialValue || "";
      if (i.type === 'password') sp[i.id] = false;
    });
    formData.value = fd;
    showPassword.value = sp;
  },
  { immediate: true, deep: true }
);

// Fonction pour basculer la visibilité du mot de passe
const togglePassword = (inputId) => {
  showPassword.value[inputId] = !showPassword.value[inputId];
};

// 🔹 Supabase client
const supabase = useSupabaseClient();

// 🔹 Fonction "Mot de passe oublié"
const resetPassword = async () => {
  const email = formData.value.email;
  if (!email) {
    alert("Veuillez entrer votre adresse email.");
    return;
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://achat-sesame.vercel.app/resetmdp",
  });
  if (error) {
    alert("Erreur : " + error.message);
  } else {
    alert("Un email de réinitialisation vous a été envoyé !");
  }
};
</script>

<style scoped>
.input-wrapper {
  position: relative;
  width: 100%;
}

input, select {
  height: 3.5rem;
  background: #ffffffb7;
  margin-bottom: 0.8rem;
}

.password-toggle-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  cursor: pointer;
  user-select: none;
  margin-bottom: 0.8rem;
}

.password-toggle-icon:hover {
  opacity: 0.7;
}

.con {
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
  color: white;
  width: 90%;
  background-color: #43b02ab4;
}

.con:hover {
  background-color: #43b02a;
}

.con2 {
  width: 90%;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
}

.ins {
  color: #000;
  margin-left: 1.25rem;
  border: 1px solid #000;
  text-decoration: none;
  border-radius: 2px;
}

.ins:hover {
  color: #eee;
}

.forgot-link {
  font-size: 0.9rem;
  color: #007bff;
  cursor: pointer;
}

.forgot-link:hover {
  text-decoration: underline;
}
</style>