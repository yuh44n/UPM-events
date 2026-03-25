<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { db } from '../firebase/config'
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { useAuth } from '../composables/useAuth'
import { useNotifications } from '../composables/useNotifications'
import { LayoutDashboard, PlusCircle, Calendar, ThumbsUp, Users, Trash2, CheckCircle, ExternalLink, Users as UsersIcon } from 'lucide-vue-next'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import BadgeStatus from '../components/BadgeStatus.vue'
import AttendanceList from '../components/AttendanceList.vue'

const { user, userData } = useAuth()
const { notify } = useNotifications()

const events = ref([])
const isPending = ref(true)
const error = ref(null)
const activeTab = ref('all') // all, poll, confirmed
const showAttendees = ref(false)
const selectedEventAttendees = ref([])
const selectedEventId = ref('')

let unsubscribe = null

const startQuery = () => {
  if (!user.value) return
  if (unsubscribe) unsubscribe() // Clean up existing listener

  const q = query(
    collection(db, 'events'),
    where('organizerId', '==', user.value.uid),
    orderBy('createdAt', 'desc')
  )

  unsubscribe = onSnapshot(q, (snapshot) => {
    const results = []
    snapshot.docs.forEach(doc => {
      results.push({ ...doc.data(), id: doc.id })
    })
    events.value = results
    isPending.value = false
  }, (err) => {
    console.error("Firestore error:", err);
    error.value = 'Could not fetch your events'
    isPending.value = false
  })
}

onMounted(() => {
  if (user.value) {
    startQuery()
  }
})

// Re-run query if user changes (e.g., after login/refresh)
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
  if (activeTab.value === 'all') return events.value
  return events.value.filter(e => e.status === activeTab.value)
})

const stats = computed(() => {
  return {
    total: events.value.length,
    polls: events.value.filter(e => e.status === 'poll').length,
    confirmed: events.value.filter(e => e.status === 'confirmed').length,
    totalVotes: events.value.reduce((acc, e) => acc + (e.votes?.length || 0), 0),
    totalAttendees: events.value.reduce((acc, e) => acc + (e.attendees?.length || 0), 0)
  }
})

const confirmEvent = async (eventId) => {
  try {
    await updateDoc(doc(db, 'events', eventId), {
      status: 'confirmed'
    })
    notify('Événement confirmé !', 'success')
  } catch (err) {
    notify('Erreur lors de la confirmation', 'danger')
  }
}

const deleteEvent = async (eventId) => {
  if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return
  try {
    await deleteDoc(doc(db, 'events', eventId))
    notify('Événement supprimé', 'success')
  } catch (err) {
    notify('Erreur lors de la suppression', 'danger')
  }
}

const openAttendees = (event) => {
  selectedEventAttendees.value = event.attendees || []
  selectedEventId.value = event.id
  showAttendees.value = true
}

const formatDate = (date) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-sidebar__label">Gestion</div>
      <button 
        @click="activeTab = 'all'" 
        :class="['admin-nav-item', { 'active': activeTab === 'all' }]"
      >
        <LayoutDashboard /> Dashboard
      </button>
      
      <div class="admin-sidebar__label">Filtres</div>
      <button 
        @click="activeTab = 'poll'" 
        :class="['admin-nav-item', { 'active': activeTab === 'poll' }]"
      >
        <ThumbsUp /> En Sondage
      </button>
      <button 
        @click="activeTab = 'confirmed'" 
        :class="['admin-nav-item', { 'active': activeTab === 'confirmed' }]"
      >
        <CheckCircle /> Confirmés
      </button>

      <div class="mt-auto px-6">
        <router-link to="/create-event" class="btn btn-primary btn-full btn-sm">
          <PlusCircle /> Nouveau
        </router-link>
      </div>
    </aside>

    <main class="admin-main">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="auth-heading">Dashboard Club</h1>
          <p class="auth-sub">Gérez vos publications et suivez l'engagement.</p>
        </div>
      </div>

      <div class="grid-4 mb-12">
        <div class="stat-card">
          <span class="stat-label">Événements</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Votes</span>
          <span class="stat-value stat-value--gold">{{ stats.totalVotes }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Inscrits</span>
          <span class="stat-value">{{ stats.totalAttendees }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">En Sondage</span>
          <span class="stat-value">{{ stats.polls }}</span>
        </div>
      </div>

      <div v-if="isPending">
        <LoadingSpinner />
      </div>

      <div v-else-if="filteredEvents.length === 0" class="empty-state">
        <Calendar class="empty-state__icon" />
        <h3>Aucun événement</h3>
        <p>Vous n'avez pas encore créé d'événement dans cette catégorie.</p>
      </div>

      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>Événement</th>
            <th>Statut</th>
            <th>Engagement</th>
            <th>Date</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in filteredEvents" :key="event.id">
            <td>
              <div class="flex items-center gap-3">
                <img :src="event.imageUrl" class="w-10 h-10 rounded-md object-cover" />
                <span>{{ event.title }}</span>
              </div>
            </td>
            <td>
              <BadgeStatus 
                :label="event.status === 'confirmed' ? 'Confirmé' : 'Sondage'" 
                :type="event.status === 'confirmed' ? 'success' : 'poll'" 
              />
            </td>
            <td>
              <div class="admin-engagement">
                <div class="engagement-item" title="Votes">
                  <ThumbsUp class="w-3.5 h-3.5" />
                  <span>{{ event.votes?.length || 0 }}</span>
                </div>
                <div class="engagement-item engagement-item--blue" title="Inscrits">
                  <UsersIcon class="w-3.5 h-3.5" />
                  <span>{{ event.attendees?.length || 0 }}</span>
                </div>
              </div>
            </td>
            <td>{{ formatDate(event.date) }}</td>
            <td class="text-right">
              <div class="admin-actions">
                <button 
                  v-if="event.status === 'poll'"
                  @click="confirmEvent(event.id)"
                  class="action-btn action-btn--success" title="Confirmer"
                >
                  <CheckCircle class="w-4 h-4" />
                </button>
                <button @click="openAttendees(event)" class="action-btn" title="Inscrits">
                  <UsersIcon class="w-4 h-4" />
                </button>
                <router-link :to="`/event/${event.id}`" class="action-btn action-btn--view" title="Voir">
                  <ExternalLink class="w-4 h-4" />
                </router-link>
                <button @click="deleteEvent(event.id)" class="action-btn action-btn--danger" title="Supprimer">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </main>

    <AttendanceList 
      v-if="showAttendees" 
      :attendeeIds="selectedEventAttendees" 
      :eventId="selectedEventId"
      @close="showAttendees = false"
    />
  </div>
</template>
