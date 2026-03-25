<script setup>
import { Calendar, Users } from 'lucide-vue-next'
import BadgeStatus from './BadgeStatus.vue'

const props = defineProps({
  event: { type: Object, required: true }
})

const formatDate = (date) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <router-link :to="`/event/${event.id}`" class="event-card">
    <div class="event-card__image">
      <img 
        :src="event.imageUrl || 'https://via.placeholder.com/400x200?text=UPM+Events'" 
        :alt="event.title"
      />
      <div 
        :class="['event-card__price-badge', event.isPaid ? 'event-card__price-badge--paid' : 'event-card__price-badge--free']"
      >
        {{ event.isPaid ? `${event.price} DH` : 'Gratuit' }}
      </div>
    </div>

    <div class="event-card__body">
      <div class="event-card__badges">
        <BadgeStatus 
          :label="event.targetAudience === 'all' ? 'Ouvert à tous' : event.targetAudience" 
          :type="event.targetAudience === 'all' ? 'info' : 'purple'" 
        />
        <BadgeStatus 
          v-if="event.status === 'poll'"
          label="En Sondage" 
          type="poll" 
        />
      </div>

      <h3 class="event-card__title">{{ event.title }}</h3>
      <p class="event-card__excerpt">{{ event.description }}</p>

      <div class="event-card__meta">
        <div class="event-card__meta-item">
          <Calendar />
          <span>{{ formatDate(event.date) }}</span>
        </div>
        <div class="event-card__meta-item">
          <Users />
          <span>{{ event.attendees?.length || 0 }} inscrits</span>
        </div>
        <div class="event-card__club">{{ event.organizerName }}</div>
      </div>
    </div>
  </router-link>
</template>
