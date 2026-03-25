<script setup>
import { onMounted, ref, computed, onUnmounted, watch } from 'vue'
import { useEvents } from '../composables/useEvents'
import { useAuth } from '../composables/useAuth'
import { Search, CalendarRange } from 'lucide-vue-next'
import EventCard from '../components/EventCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const { events, getEvents, isPending, error } = useEvents()
const { user, userData } = useAuth()
const searchQuery = ref('')
const activeFilter = ref('all') // all, free, paid

let unsubscribe = null

const startQuery = () => {
  if (unsubscribe) unsubscribe()
  unsubscribe = getEvents('confirmed')
}

onMounted(() => {
  if (user.value) {
    startQuery()
  }
})

// Handle page refresh/auth state change
watch(user, (newUser) => {
  if (newUser) {
    startQuery()
  } else {
    events.value = []
    if (unsubscribe) unsubscribe()
  }
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const filteredEvents = computed(() => {
  if (!events.value) return []
  
  return events.value.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        event.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    let matchesFilter = true
    if (activeFilter.value === 'free') matchesFilter = !event.isPaid
    if (activeFilter.value === 'paid') matchesFilter = event.isPaid
    
    // Privacy check: only show if open to all, matches student major, or user is club
    const isTargeted = event.targetAudience === 'all' || 
                       event.targetAudience === userData.value?.major ||
                       userData.value?.role === 'club'
    
    return matchesSearch && matchesFilter && isTargeted
  })
})
</script>

<template>
  <div class="container">
    <header class="home-hero">
      <div class="home-hero__eyebrow">
        <span class="home-hero__eyebrow-line"></span>
        <span class="overline">Vie de Campus</span>
      </div>
      <h1 class="display-italic">UPM Events.</h1>
      <h2>Découvrez, vibrez, participez.</h2>
      <p class="section--sm max-w-xl">Plongez dans l'effervescence de l'Université Internationale de Marrakech. Une plateforme unique pour tous vos événements.</p>
    </header>

    <div class="filter-bar">
      <button 
        @click="activeFilter = 'all'"
        :class="['filter-chip', { 'active': activeFilter === 'all' }]"
      >
        Tous
      </button>
      <button 
        @click="activeFilter = 'free'"
        :class="['filter-chip', { 'active': activeFilter === 'free' }]"
      >
        Gratuits
      </button>
      <button 
        @click="activeFilter = 'paid'"
        :class="['filter-chip', { 'active': activeFilter === 'paid' }]"
      >
        Payants
      </button>

      <div class="filter-search">
        <Search />
        <input v-model="searchQuery" type="text" placeholder="Rechercher..." />
      </div>
    </div>

    <div v-if="isPending">
      <LoadingSpinner />
    </div>

    <div v-else-if="error" class="empty-state">
      <p class="text-danger">{{ error }}</p>
    </div>

    <div v-else-if="filteredEvents.length === 0" class="empty-state">
      <CalendarRange class="empty-state__icon" />
      <h3>Aucun événement</h3>
      <p>Aucun événement ne correspond à vos critères pour le moment.</p>
    </div>

    <div v-else class="grid-events section">
      <EventCard 
        v-for="event in filteredEvents" 
        :key="event.id" 
        :event="event" 
      />
    </div>
  </div>
</template>
