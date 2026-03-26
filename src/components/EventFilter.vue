<script setup>
import { Filter, Search, X } from 'lucide-vue-next'

const props = defineProps({
  filters: { type: Object, required: true },
  clubs: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:filters', 'clear'])

const types = [
  { label: 'Tous les types', value: 'all' },
  { label: 'Événement', value: 'event' },
  { label: 'Sondage', value: 'poll' }
]

const prices = [
  { label: 'Tous les prix', value: 'all' },
  { label: 'Gratuit', value: 'free' },
  { label: 'Payant', value: 'paid' }
]

const updateFilter = (key, value) => {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>

<template>
  <div class="event-filters mb-8 p-6 bg-surface-1 border border-bdr-faint rounded-[24px]">
    <div class="flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="relative w-full md:max-w-md group">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-gold-200" />
        <input 
          :value="filters.search"
          @input="updateFilter('search', $event.target.value)"
          type="text" 
          placeholder="Rechercher un événement..."
          class="w-full pl-11 pr-4 py-3 bg-surface-2 border border-bdr-soft rounded-2xl text-sm focus:border-gold-200 transition-all outline-none"
        />
      </div>

      <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">
        <select 
          :value="filters.type"
          @change="updateFilter('type', $event.target.value)"
          class="px-4 py-3 bg-surface-2 border border-bdr-soft rounded-2xl text-xs font-medium outline-none focus:border-gold-200 transition-all cursor-pointer"
        >
          <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>

        <select 
          :value="filters.price"
          @change="updateFilter('price', $event.target.value)"
          class="px-4 py-3 bg-surface-2 border border-bdr-soft rounded-2xl text-xs font-medium outline-none focus:border-gold-200 transition-all cursor-pointer"
        >
          <option v-for="p in prices" :key="p.value" :value="p.value">{{ p.label }}</option>
        </select>

        <select 
          v-if="clubs.length"
          :value="filters.club"
          @change="updateFilter('club', $event.target.value)"
          class="px-4 py-3 bg-surface-2 border border-bdr-soft rounded-2xl text-xs font-medium outline-none focus:border-gold-200 transition-all cursor-pointer"
        >
          <option value="all">Tous les clubs</option>
          <option v-for="c in clubs" :key="c" :value="c">{{ c }}</option>
        </select>

        <button 
          @click="$emit('clear')"
          class="p-3 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
          title="Réinitialiser les filtres"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
