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
      <transition name="pop" mode="out-in">
        <strong :key="votes.length">{{ votes.length }}</strong>
      </transition>
      {{ votes.length > 1 ? 'Intérêts' : 'Intérêt' }}
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

<style scoped>
.pop-enter-active {
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse;
}

@keyframes pop-in {
  0% { transform: scale(0.8); opacity: 0.5; }
  70% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
</style>
