<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useEvents } from '../composables/useEvents'
import { useAuth } from '../composables/useAuth'
import { Lightbulb, Calendar, MapPin } from 'lucide-vue-next'
import VoteAction from '../components/VoteAction.vue'
import BadgeStatus from '../components/BadgeStatus.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const { polls, getEvents, isPending, error } = useEvents()
const { userData } = useAuth()
let unsubscribe = null

onMounted(() => {
  unsubscribe = getEvents('poll')
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const filteredPolls = computed(() => {
  if (!polls.value) return []
  return polls.value.filter(poll => {
    // Show if open to all OR matches student's major OR user is a club
    return poll.targetAudience === 'all' || 
           poll.targetAudience === userData.value?.major ||
           userData.value?.role === 'club'
  })
})

const formatDate = (date) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}
</script>

<template>
  <div class="container">
    <header class="polls-hero">
      <div class="home-hero__eyebrow">
        <span class="home-hero__eyebrow-line"></span>
        <span class="overline">Boîte à Idées</span>
      </div>
      <h1 class="display-italic">La Scène est à vous.</h1>
      <p class="section--sm max-w-xl">Votez pour les projets qui vous inspirent. Les idées les plus populaires prendront vie sur le campus.</p>
    </header>

    <div v-if="isPending">
      <LoadingSpinner />
    </div>

    <div v-else-if="error" class="empty-state">
      <p class="text-danger">{{ error }}</p>
    </div>

    <div v-else-if="filteredPolls.length === 0" class="empty-state">
      <Lightbulb class="empty-state__icon" />
      <h3>Silence radio</h3>
      <p>Aucune nouvelle idée ne correspond à votre filière pour le moment. Revenez bientôt !</p>
    </div>

    <div v-else class="poll-list section">
      <div v-for="(poll, index) in filteredPolls" :key="poll.id" class="poll-item">
        <div class="poll-item__num">{{ (index + 1).toString().padStart(2, '0') }}</div>
        
        <div v-if="poll.imageUrl" class="poll-item__image">
          <img :src="poll.imageUrl" :alt="poll.title" />
        </div>

        <div class="poll-item__content">
          <div class="flex flex-wrap gap-2 mb-2">
            <BadgeStatus :label="poll.organizerName" type="info" />
            <BadgeStatus :label="poll.targetAudience === 'all' ? 'Ouvert à tous' : poll.targetAudience" type="purple" />
          </div>
          
          <h3 class="poll-item__title">{{ poll.title }}</h3>
          
          <div class="poll-item__meta">
            <div class="flex items-center gap-1">
              <Calendar class="w-3 h-3" />
              <span>{{ formatDate(poll.date) }}</span>
            </div>
            <div class="flex items-center gap-1">
              <MapPin class="w-3 h-3" />
              <span>UPM Campus</span>
            </div>
          </div>

          <div class="poll-bar">
            <div class="poll-bar__fill" :style="{ width: Math.min(100, (poll.votes?.length || 0) * 5) + '%' }"></div>
          </div>
        </div>

        <div class="poll-item__actions">
          <VoteAction :eventId="poll.id" :votes="poll.votes || []" />
        </div>
      </div>
    </div>
  </div>
</template>
