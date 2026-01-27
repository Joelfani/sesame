<template>
  <div class="reset-container">
    <h2>
      Réinitialisation <br />
      du mot de passe
    </h2>

    <!-- Chargement -->
    <div v-if="isInitializing" class="loading-message">
      <p>Vérification du lien de réinitialisation...</p>
    </div>

    <!-- Erreur lien -->
    <div v-else-if="linkError" class="error-message">
      <p>❌ {{ linkError }}</p>
      <button @click="redirectToLogin" class="btn btn-secondary">
        Retour à la connexion
      </button>
    </div>

    <!-- Formulaire -->
    <form v-else @submit.prevent="submitNewPassword">
      <div class="form-group">
        <label>Nouveau mot de passe</label>
        <div class="input-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            required
            minlength="6"
            placeholder="Entrez votre nouveau mot de passe"
            class="form-control"
          />
          <img
            :src="showPassword ? '/icon/fermer.png' : '/icon/voir.png'"
            class="password-toggle-icon"
            @click="showPassword = !showPassword"
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
            minlength="6"
            placeholder="Confirmez votre mot de passe"
            class="form-control"
          />
          <img
            :src="showConfirmPassword ? '/icon/fermer.png' : '/icon/voir.png'"
            class="password-toggle-icon"
            @click="showConfirmPassword = !showConfirmPassword"
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
import { ref, onMounted } from "vue";

definePageMeta({ layout: false });

const supabase = useSupabaseClient();

const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);

const isInitializing = ref(true);
const linkError = ref(null);

const redirectToLogin = () => {
  window.location.href = "https://achat-sesame.vercel.app";
};

const submitNewPassword = async () => {
  if (password.value !== confirmPassword.value) {
    alert("Les mots de passe ne correspondent pas.");
    return;
  }

  loading.value = true;

  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Mot de passe mis à jour avec succès !");
    redirectToLogin();
  } catch (err) {
    console.error(err);
    alert("Erreur inattendue");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    // 🔑 Lecture du hash (#access_token=...)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || type !== "recovery") {
      linkError.value =
        "Lien de réinitialisation invalide ou expiré.";
      isInitializing.value = false;
      return;
    }

    // ✅ Création de la session
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (error) {
      console.error(error);
      linkError.value =
        "Lien de réinitialisation invalide ou expiré.";
      isInitializing.value = false;
      return;
    }

    // ✅ OK
    isInitializing.value = false;
  } catch (err) {
    console.error(err);
    linkError.value = "Une erreur est survenue.";
    isInitializing.value = false;
  }
});
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

.loading-message,
.error-message {
  text-align: center;
  padding: 20px;
}

.error-message {
  color: #d32f2f;
}

.form-group {
  margin-bottom: 15px;
}

.input-wrapper {
  position: relative;
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
  width: 24px;
  transform: translateY(-50%);
  cursor: pointer;
}

.btn {
  width: 100%;
  height: 3rem;
  border-radius: 8px;
  margin-top: 10px;
  border: none;
  font-weight: 600;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
}

.btn-secondary {
  background-color: #757575;
  color: white;
}
</style>
