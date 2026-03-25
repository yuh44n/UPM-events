<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useNotifications } from '../composables/useNotifications'

const email = ref('')
const password = ref('')
const displayName = ref('')
const role = ref('student')
const major = ref('')
const majors = [
  'Ingénierie', 
  'Business', 
  'Santé', 
  'Hôtellerie', 
  'Design', 
  'Journalisme'
]

const { signup, error, isPending } = useAuth()
const { notify } = useNotifications()
const router = useRouter()

const handleSubmit = async () => {
  await signup(email.value, password.value, displayName.value, role.value, major.value)
  if (!error.value) {
    notify('Compte créé avec succès !', 'success')
    router.push('/')
  } else {
    notify(error.value, 'danger')
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-panel">
      <div class="auth-panel__title">Participez à <span class="display-italic">l'Histoire.</span></div>
      <p class="auth-panel__sub">Rejoignez des milliers d'étudiants et faites partie de la vie associative la plus dynamique du Maroc.</p>
    </div>

    <div class="auth-form-panel">
      <div class="auth-form-wrap">
        <div class="auth-logo"><img src="/src/assets/favicon.svg" alt="UPM Logo" class="w-12 h-12" />UPM <span>Events</span></div>
        
        <div class="space-y-2">
          <h1 class="auth-heading">Bienvenue.</h1>
          <p class="auth-sub">Créez votre compte en quelques secondes.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label class="form-label">Nom Complet / Club</label>
            <input 
              v-model="displayName"
              type="text" 
              required
              class="form-input"
              placeholder="Ex: Club Robotique ou Jean Dupont"
            />
          </div>

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

          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Type de Compte</label>
              <select v-model="role" class="form-select">
                <option value="student">Étudiant</option>
                <option value="club">Club</option>
              </select>
            </div>

            <div v-if="role === 'student'" class="form-group">
              <label class="form-label">Filière</label>
              <select v-model="major" required class="form-select">
                <option value="" disabled>Choisir...</option>
                <option v-for="m in majors" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Mot de Passe</label>
            <input 
              v-model="password"
              type="password" 
              required
              class="form-input"
              placeholder="Min. 6 caractères"
            />
          </div>

          <button 
            type="submit" 
            :disabled="isPending"
            class="btn btn-primary btn-full py-4 mt-4"
          >
            <span v-if="!isPending">S'inscrire</span>
            <div v-else class="spinner-inline"></div>
          </button>
        </form>

        <div class="auth-footer">
          Déjà un compte ? 
          <router-link to="/login" class="text-gold-200 font-medium">Se Connecter</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
