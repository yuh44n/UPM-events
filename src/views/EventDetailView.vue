<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../composables/useAuth'
import { useEvents } from '../composables/useEvents'
import { useNotifications } from '../composables/useNotifications'
import { Calendar, MapPin, Users, DollarSign, ChevronLeft, CheckCircle2, AlertTriangle } from 'lucide-vue-next'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import BadgeStatus from '../components/BadgeStatus.vue'

const route = useRoute()
const router = useRouter()
const { user, userData } = useAuth()
const { registerForEvent } = useEvents()
const { notify } = useNotifications()

const event = ref(null)
const isPending = ref(true)
const isRegistering = ref(false)

onMounted(async () => {
  const docRef = doc(db, 'events', route.params.id)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    event.value = { ...docSnap.data(), id: docSnap.id }
  }
  isPending.value = false
})

const isEnrolled = computed(() => {
  return event.value?.attendees?.includes(user.value?.uid)
})

const canEnroll = computed(() => {
  if (!event.value) return false
  if (event.value.status !== 'confirmed') return false
  return event.value.targetAudience === 'all' || event.value.targetAudience === userData.value?.major
})

const handleEnroll = async () => {
  if (!user.value || isRegistering.value) return
  isRegistering.value = true
  
  await registerForEvent(event.value.id, user.value.uid)
  notify('Inscription réussie !', 'success')
  
  // Refresh local state
  event.value.attendees.push(user.value.uid)
  isRegistering.value = false
}

const formatDate = (date) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div v-if="isPending">
    <LoadingSpinner />
  </div>

  <div v-else-if="!event" class="container empty-state">
    <AlertTriangle class="empty-state__icon" />
    <h3>Événement introuvable</h3>
    <button @click="router.back()" class="btn btn-ghost mt-4">Retour</button>
  </div>

  <div v-else class="event-detail">
    <div class="event-detail__cover">
      <img :src="event.imageUrl" :alt="event.title" />
    </div>

    <div class="container">
      <header class="event-detail__header">
        <div class="event-detail__badges">
          <BadgeStatus 
            :label="event.isPaid ? `${event.price} DH` : 'Gratuit'" 
            :type="event.isPaid ? 'warning' : 'free'" 
          />
          <BadgeStatus 
            :label="event.targetAudience === 'all' ? 'Ouvert à tous' : event.targetAudience" 
            :type="event.targetAudience === 'all' ? 'info' : 'purple'" 
          />
        </div>
        <h1 class="event-detail__title">{{ event.title }}</h1>
        <div class="divider--gold"></div>
      </header>

      <div class="event-detail__layout">
        <div class="event-detail__body">
          <div class="gold-line-left px-8 py-4">
            <h4 class="overline mb-4">À propos de l'événement</h4>
            <p class="whitespace-pre-line">{{ event.description }}</p>
          </div>
        </div>

        <aside class="event-detail__sidebar">
          <div class="event-detail__info-row">
            <Calendar class="event-detail__info-icon" />
            <div>
              <p class="event-detail__info-label">Date et Heure</p>
              <p class="event-detail__info-value">{{ formatDate(event.date) }}</p>
              <p class="event-detail__info-value">À {{ event.time }}</p>
            </div>
          </div>

          <div class="event-detail__info-row">
            <MapPin class="event-detail__info-icon" />
            <div>
              <p class="event-detail__info-label">Lieu</p>
              <p class="event-detail__info-value">UPM Campus</p>
            </div>
          </div>

          <div class="event-detail__info-row">
            <Users class="event-detail__info-icon" />
            <div>
              <p class="event-detail__info-label">Participants</p>
              <p class="event-detail__info-value">{{ event.attendees?.length || 0 }} inscrits</p>
            </div>
          </div>

          <div class="divider border-bdr-faint my-2"></div>

          <div class="text-center space-y-4 pt-2">
            <div class="event-detail__price">
              {{ event.isPaid ? `${event.price} DH` : 'Entrée Libre' }}
            </div>

            <button 
              v-if="!isEnrolled && event.status === 'confirmed'"
              @click="handleEnroll"
              :disabled="!canEnroll || isRegistering"
              class="btn btn-primary btn-full py-4"
            >
              <span v-if="!isRegistering">S'inscrire</span>
              <div v-else class="spinner-inline"></div>
            </button>

            <div v-if="isEnrolled" class="flex items-center justify-center gap-2 text-clr-free font-medium">
              <CheckCircle2 class="w-5 h-5" />
              <span>Vous êtes inscrit</span>
            </div>

            <p v-if="!canEnroll && !isEnrolled && event.status === 'confirmed'" class="form-error">
              Réservé à la filière {{ event.targetAudience }}.
            </p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
