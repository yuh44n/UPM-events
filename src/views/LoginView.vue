<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useNotifications } from '../composables/useNotifications'
import { Mail, Lock, LogIn } from 'lucide-vue-next'

const email = ref('')
const password = ref('')
const { login, error, isPending } = useAuth()
const { notify } = useNotifications()
const router = useRouter()

const handleSubmit = async () => {
  await login(email.value, password.value)
  if (!error.value) {
    notify('Connexion réussie !', 'success')
    router.push('/')
  } else {
    notify(error.value, 'danger')
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-panel">
      <div class="auth-panel__title">Rejoignez la <span class="display-italic">Scène.</span></div>
      <p class="auth-panel__sub">Connectez-vous pour découvrir les événements exclusifs de l'Université Privée de Marrakech.</p>
    </div>

    <div class="auth-form-panel">
      <div class="auth-form-wrap">
        <div class="auth-logo"><img src="/src/assets/favicon.svg" alt="UPM Logo" class="w-12 h-12" />UPM <span>Events</span></div>
        
        <div class="space-y-2">
          <h1 class="auth-heading">Bon retour.</h1>
          <p class="auth-sub">Entrez vos identifiants pour continuer.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label class="form-label">Email Institutionnel</label>
            <input 
              v-model="email"
              type="email" 
              required
              class="form-input"
              placeholder="votre.nom@upm.ac.ma"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Mot de Passe</label>
            <input 
              v-model="password"
              type="password" 
              required
              class="form-input"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            :disabled="isPending"
            class="btn btn-primary btn-full py-4 mt-4"
          >
            <span v-if="!isPending">Se Connecter</span>
            <div v-else class="spinner-inline"></div>
          </button>
        </form>

        <div class="auth-divider">OU</div>

        <div class="auth-footer">
          Pas encore de compte ? 
          <router-link to="/register" class="text-gold-200 font-medium">S'inscrire gratuitement</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
