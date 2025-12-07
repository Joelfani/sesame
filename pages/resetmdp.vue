<template>
  <div class="reset-container">
    <h2>Réinitialisation <br> du mot de passe</h2>
    <form @submit.prevent="submitNewPassword">
      <div class="form-group">
        <label>Nouveau mot de passe</label>
        <div class="input-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            required
            placeholder="Entrez votre nouveau mot de passe"
            class="form-control"
          />
          <img
            :src="showPassword ? '/icon/fermer.png' : '/icon/voir.png'"
            @click="togglePassword"
            class="password-toggle-icon"
            alt="Toggle password visibility"
          />
        </div>
      </div>
      <div class="form-group">
        <label>Confirmez le mot de passe</label>
        <div class="input-wrapper">
          <input
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="confirmPassword"
            required
            placeholder="Confirmez votre mot de passe"
            class="form-control"
          />
          <img
            :src="showConfirmPassword ? '/icon/fermer.png' : '/icon/voir.png'"
            @click="toggleConfirmPassword"
            class="password-toggle-icon"
            alt="Toggle password visibility"
          />
        </div>
      </div>
      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? "En cours..." : "Valider" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Services
const supabase = useSupabaseClient();

const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);

// États pour afficher/masquer les mots de passe
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Fonctions pour basculer la visibilité
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

definePageMeta({
  layout: false // No layout for this page
});

const submitNewPassword = async () => {
  if (password.value !== confirmPassword.value) {
    alert("Les mots de passe ne correspondent pas.");
    return;
  }
  loading.value = true;
  const { data, error } = await supabase.auth.updateUser({
    password: password.value
  });
  loading.value = false;
  if (error) {
    alert("Erreur : " + error.message);
    return;
  }
  alert("Mot de passe mis à jour avec succès !");
  // 🔹 Redirection vers ton site
  window.location.href = "https://achat-sesame.vercel.app";
};
onMounted(() => {
    setInterval(() => {
        if (!navigator.onLine) {
            window.alert('Vous êtes hors ligne ! Veuillez vous connecter à Internet et rafraîchir la page')
        }
    }, 1000)
})

</script>

<style scoped>
.reset-container {
  max-width: 450px;
  margin: 50px auto;
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 15px #00000022;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.form-control {
  width: 100%;
  height: 3rem;
  padding: 10px;
  padding-right: 45px;
  border-radius: 8px;
  border: 1px solid #999;
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
}

.password-toggle-icon:hover {
  opacity: 0.7;
}

.btn {
  width: 100%;
  height: 3rem;
  border-radius: 8px;
  margin-top: 10px;
}
</style>