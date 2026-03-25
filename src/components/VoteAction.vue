<script setup>
import { computed, ref } from 'vue'
import { ThumbsUp } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'
import { useEvents } from '../composables/useEvents'

const props = defineProps({
  eventId: { type: String, required: true },
  votes: { type: Array, default: () => [] }
})

const { user } = useAuth()
const { toggleVote } = useEvents()
const isPending = ref(false)

const hasVoted = computed(() => {
  return props.votes.includes(user.value?.uid)
})

const handleVote = async () => {
  if (!user.value || isPending.value) return
  isPending.value = true
  await toggleVote(props.eventId, user.value.uid)
  isPending.value = false
}
</script>

<template>
  <div class="vote-action">
    <div class="vote-count">
      <strong>{{ votes.length }}</strong> {{ votes.length > 1 ? 'Intérêts' : 'Intérêt' }}
    </div>
    <button 
      @click.prevent="handleVote"
      :disabled="isPending || !user"
      :class="['vote-btn', { 'voted': hasVoted }]"
    >
      <ThumbsUp />
      <span>{{ hasVoted ? 'Intéressé' : 'Je vote' }}</span>
    </button>
  </div>
</template>
