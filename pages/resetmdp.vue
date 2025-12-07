<template>
  <div class="reset-container">
    <h2>Réinitialisation <br> du mot de passe</h2>
    
    <!-- Message de chargement -->
    <div v-if="isInitializing" class="loading-message">
      <p>Vérification du lien de réinitialisation...</p>
    </div>

    <!-- Message d'erreur si le lien est invalide -->
    <div v-else-if="linkError" class="error-message">
      <p>❌ {{ linkError }}</p>
      <button @click="redirectToLogin" class="btn btn-secondary">
        Retour à la connexion
      </button>
    </div>

    <!-- Formulaire de réinitialisation -->
    <form v-else @submit.prevent="submitNewPassword">
      <div class="form-group">
        <label>Nouveau mot de passe</label>
        <div class="input-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            required
            placeholder="Entrez votre nouveau mot de passe"
            class="form-control"
            minlength="6"
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
            minlength="6"
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
const route = useRoute();

const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const isInitializing = ref(true);
const linkError = ref(null);

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

const redirectToLogin = () => {
  window.location.href = "https://achat-sesame.vercel.app";
};

definePageMeta({
  layout: false
});

const submitNewPassword = async () => {
  if (password.value !== confirmPassword.value) {
    alert("Les mots de passe ne correspondent pas.");
    return;
  }

  if (password.value.length < 6) {
    alert("Le mot de passe doit contenir au moins 6 caractères.");
    return;
  }

  loading.value = true;
  
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: password.value
    });

    if (error) {
      console.error('Erreur de mise à jour:', error);
      alert("Erreur : " + error.message);
      return;
    }

    alert("Mot de passe mis à jour avec succès !");
    window.location.href = "https://achat-sesame.vercel.app";
  } catch (err) {
    console.error('Erreur inattendue:', err);
    alert("Une erreur est survenue. Veuillez réessayer.");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    // 1️⃣ Vérifier le format ?code= (PKCE flow - recommandé)
    const code = route.query.code;
    
    if (code) {
      console.log("Code PKCE détecté :", code);
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Erreur d'échange de code :", error);
        linkError.value = "Lien invalide ou expiré. Veuillez demander un nouveau lien.";
        isInitializing.value = false;
        return;
      }

      console.log("Session créée avec succès :", data.session);
      isInitializing.value = false;
      return;
    }

    // 2️⃣ Vérifier le format #access_token= (ancien flow)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');

    if (accessToken && type === 'recovery') {
      console.log("Token de récupération détecté dans le hash");
      
      // Établir la session avec les tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        console.error("Erreur de session :", error);
        linkError.value = "Lien invalide ou expiré. Veuillez demander un nouveau lien.";
        isInitializing.value = false;
        return;
      }

      console.log("Session créée avec succès :", data.session);
      isInitializing.value = false;
      return;
    }

    // 3️⃣ Aucun paramètre valide trouvé
    console.error("Aucun code ou token trouvé dans l'URL");
    linkError.value = "Lien de réinitialisation invalide. Veuillez demander un nouveau lien.";
    isInitializing.value = false;

  } catch (err) {
    console.error("Erreur lors de l'initialisation :", err);
    linkError.value = "Une erreur est survenue. Veuillez réessayer.";
    isInitializing.value = false;
  }

  // Vérification de la connexion Internet
  setInterval(() => {
    if (!navigator.onLine) {
      window.alert('Vous êtes hors ligne ! Veuillez vous connecter à Internet et rafraîchir la page');
    }
  }, 5000); // Changé à 5 secondes pour éviter trop d'alertes
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
  color: #333;
}

.loading-message {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  text-align: center;
  padding: 20px;
  color: #d32f2f;
}

.error-message p {
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
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
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
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
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #757575;
  color: white;
}

.btn-secondary:hover {
  background-color: #616161;
}
</style>