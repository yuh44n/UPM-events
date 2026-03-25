<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useEvents } from '../composables/useEvents'
import { useNotifications } from '../composables/useNotifications'
import { Calendar, Clock, MapPin, Users, DollarSign, Type, FileText, ChevronRight, CheckCircle2 } from 'lucide-vue-next'
import ImageUploader from '../components/ImageUploader.vue'
import BadgeStatus from '../components/BadgeStatus.vue'
import EventCard from '../components/EventCard.vue'

const router = useRouter()
const { userData } = useAuth()
const { addEvent, isPending, error: eventError } = useEvents()
const { notify } = useNotifications()

const form = reactive({
  title: '',
  description: '',
  date: '',
  time: '',
  location: 'UPM Campus',
  isPaid: false,
  price: 0,
  targetAudience: 'all',
  capacity: 100,
  imageUrl: '',
  status: 'poll'
})

const majors = [
  'Ingénierie', 
  'Business', 
  'Santé', 
  'Hôtellerie', 
  'Design', 
  'Journalisme'
]

const isFormValid = computed(() => {
  if (form.isPaid && (!form.price || form.price <= 0)) return false
  return form.title && form.description && form.date && form.time && form.imageUrl
})

const handleImageUploaded = (url) => {
  form.imageUrl = url
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  const eventData = {
    ...form,
    organizerId: userData.value.uid,
    organizerName: userData.value.displayName,
    date: new Date(form.date)
  }

  const res = await addEvent(eventData)
  if (res) {
    notify('Événement créé avec succès !', 'success')
    router.push('/admin')
  } else {
    notify(eventError.value, 'danger')
  }
}

// Mock event for preview
const previewEvent = computed(() => ({
  ...form,
  id: 'preview',
  organizerName: userData.value?.displayName || 'Votre Club',
  attendees: []
}))
</script>

<template>
  <div class="container">
    <div class="create-event-layout">
      <main>
        <header class="mb-8">
          <h1 class="auth-heading">Nouvel Événement</h1>
          <p class="auth-sub">Proposez une idée ou lancez une activité officielle.</p>
        </header>

        <form @submit.prevent="handleSubmit" class="create-event-form">
          <section class="create-event-form__section">
            <h4 class="create-event-form__section-title">Informations de base</h4>
            
            <div class="form-group">
              <label class="form-label">Titre de l'événement <span class="required">*</span></label>
              <input v-model="form.title" type="text" required class="form-input" placeholder="Ex: Gala de fin d'année" />
            </div>

            <div class="form-group">
              <label class="form-label">Description <span class="required">*</span></label>
              <textarea v-model="form.description" required class="form-textarea" placeholder="Détaillez le programme, les activités..."></textarea>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Date <span class="required">*</span></label>
                <input v-model="form.date" type="date" required class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Heure <span class="required">*</span></label>
                <input v-model="form.time" type="time" required class="form-input" />
              </div>
            </div>
          </section>

          <section class="create-event-form__section">
            <h4 class="create-event-form__section-title">Visuels & Logistique</h4>
            
            <div class="form-group">
              <label class="form-label">Affiche <span class="required">*</span></label>
              <ImageUploader @uploaded="handleImageUploaded" />
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Public cible</label>
                <select v-model="form.targetAudience" class="form-select">
                  <option value="all">Ouvert à tous</option>
                  <option v-for="m in majors" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Capacité max.</label>
                <input v-model.number="form.capacity" type="number" class="form-input" />
              </div>
            </div>
          </section>

          <section class="create-event-form__section">
            <h4 class="create-event-form__section-title">Tarification</h4>
            
            <div class="price-row">
              <div 
                @click="form.isPaid = false"
                :class="['price-option', { 'selected': !form.isPaid }]"
              >
                <span class="label">Gratuit</span>
                <span class="sub">Entrée libre pour tous</span>
              </div>
              <div 
                @click="form.isPaid = true"
                :class="['price-option', { 'selected': form.isPaid }]"
              >
                <span class="label">Payant</span>
                <span class="sub">Nécessite un ticket</span>
              </div>
            </div>

            <div v-if="form.isPaid" class="form-group animate-slide-up">
              <label class="form-label">Prix (DH) <span class="required">*</span></label>
              <input v-model.number="form.price" type="number" min="1" required class="form-input" />
            </div>
          </section>

          <div class="flex justify-end pt-4">
            <button 
              type="submit" 
              :disabled="isPending || !isFormValid"
              class="btn btn-primary btn-lg"
            >
              <span v-if="!isPending">Publier l'idée</span>
              <div v-else class="spinner-inline"></div>
            </button>
          </div>
        </form>
      </main>

      <aside class="create-event-preview">
        <div class="create-event-preview__label">Aperçu en direct</div>
        <div class="max-w-[340px] mx-auto opacity-80 pointer-events-none grayscale-[0.2]">
          <EventCard :event="previewEvent" />
        </div>
        <p class="text-center text-xs text-muted mt-6 px-8">
          Votre événement sera d'abord publié en phase de <span class="text-gold-200">Sondage</span> pour mesurer l'intérêt des étudiants.
        </p>
      </aside>
    </div>
  </div>
</template>
